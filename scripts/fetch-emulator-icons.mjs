#!/usr/bin/env node
/**
 * Downloads an icon for every emulator in the master list into
 * config/emulator-icons/.
 *
 *   node scripts/fetch-emulator-icons.mjs
 *
 * Source order per id:
 *   1. apkcombo app page (Play Store icon) -> config/emulator-icons/<id>.png
 *   2. GitHub project avatar (REPOS map)   -> config/emulator-icons/<id>.png
 *   3. otherwise                           -> config/emulator-icons/missing---<id>.png
 *
 * `missing---` placeholders are deliberate: they make gaps visible in the repo
 * at a glance. A real `<id>.png` overrides any existing placeholder. Existing
 * real icons are never re-fetched (idempotent).
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "config", "emulator-icons");
const cfg = JSON.parse(readFileSync(join(root, "config", "systems.json"), "utf8"));
mkdirSync(outDir, { recursive: true });

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
const SIZE = 256;

// GitHub repos for emulators not distributed on apkcombo/Play (owner avatar used).
const REPOS = {
  armsx3: "ARMSX2/ARMSX3",
  panda3ds: "wheremyfoodat/Panda3DS",
  noods: "hydra1983/nood",
  unityboyadvance: "Rekkuzan/UnityBoyAdvance",
  skyline: "skyline-emu/skyline",
  strato: "StratoEmu/Strato",
  eden: "StratoEmu/Eden",
  sudachi: "emu-dev/Sudachi",
  citron: "citron-emu/citron",
  "yuzu-retroshark": "retroshark/yuzu-android",
  yuzu: "yuzu-emu/yuzu-android",
  "yuzu-ea": "yuzu-emu/yuzu-android",
  "citra-mmj": "weihuoya/citra",
  nethersx2: "NovaSquirrel/NetherSX2",
  m64plusfz: "fzurita/m64plus_fz",
  melonds: "rafaelvcaetano/melonDS-Android",
  gbcc: "philj56/gbcc",
  scummvm: "scummvm/scummvm",
  residualvm: "residualvm/residualvm",
  uae4all2: "Turran/UAE4All2",
  duckstation: "stenzek/duckstation",
  vita3k: "Vita3K/Vita3K",
  play: "jpd002/Play-",
  flycast: "flyinghead/flycast",
  reicast: "reicast/reicast-emulator",
  openmsx: "openMSX/openMSX",
  citra: "citra-emu/citra",
  "citra-nightly": "citra-emu/citra",
  "dolphin-mmj": "nsZhai/Dolphin-MMJ",
  "dolphin-mmjr": "EmulationSansFrontieres/dolphin-mmjr",
  retroarch64: "libretro/RetroArch",
  ppsspp: "hrydgard/ppsspp",
  "ppsspp-gold": "hrydgard/ppsspp",
  yabause: "Yabause/yabause",
  mame4droid: "seleuco/MAME4droid",
  "mame4droid-current": "seleuco/MAME4droid",
  "mame4droid-m4a": "seleuco/MAME4droid",
  drastic: "RestlessRocket/drastic",
  lemuroid: "Swordfish90/Lemuroid",
};

// ---- minimal PNG encoder (solid grey placeholder with a notch) ----------------
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  c = -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function placeholderPng(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0;
    for (let x = 0; x < size; x++) {
      const notch = x < size * 0.3 && y < size * 0.3;
      const r = notch ? 0x2a : 0x33;
      const g = notch ? 0x33 : 0x3b;
      const b = notch ? 0x44 : 0x4a;
      raw[o++] = r; raw[o++] = g; raw[o++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- fetch helpers ------------------------------------------------------------
async function fetchBytes(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: UA, signal: ctrl.signal });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
function isPng(buf) {
  if (!buf || buf.length < 8) return false;
  for (let i = 0; i < 4; i++) if (buf[i] !== PNG_MAGIC[i]) return false;
  return true;
}
// Play serves WebP via the `-rw` suffix and PNG via plain `=sNNN`. Both render
// in WebView; committed icons are normalized to PNG with ImageMagick afterwards
// (see the header note in this file's docs/README).
function isPngOrWebp(buf) {
  if (isPng(buf)) return true;
  return buf?.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
}

async function iconFromPlay(pkg) {
  const page = await fetchBytes(`https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en`, 15000);
  if (!page) return null;
  const m = page.toString("latin1").match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_\-]+/);
  if (!m) return null;
  const icon = await fetchBytes(`${m[0]}=s${SIZE}-rw`, 20000); // -rw = resize + WebP (reliably served)
  return isPngOrWebp(icon) ? icon : null;
}

async function iconFromApkCombo(pkg) {
  try {
    const search = await fetchBytes(`https://apkcombo.com/search?q=${encodeURIComponent(pkg)}`, 15000);
    if (!search) return null;
    const link = search.toString("latin1").match(new RegExp(`href="(/[^"]*/${pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/)"`));
    if (!link) return null;
    const page = await fetchBytes("https://apkcombo.com" + link[1], 15000);
    if (!page) return null;
    const html = page.toString("latin1");
    const m = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[^\s"'\\]+/);
    if (!m) return null;
    const base = m[0].split("=")[0];
    return await fetchBytes(`${base}=s${SIZE}-rw`, 20000);
  } catch {
    return null;
  }
}

async function iconFromGithub(ownerRepo) {
  const [owner, repo] = ownerRepo.split("/");
  const api = await fetchBytes(`https://api.github.com/repos/${owner}/${repo}`, 15000);
  if (!api) return null;
  try {
    const json = JSON.parse(api.toString("utf8"));
    if (!json?.owner?.avatar_url) return null;
    const icon = await fetchBytes(json.owner.avatar_url, 15000);
    if (icon && icon.length > 1000) return icon;
    return null;
  } catch {
    return null;
  }
}

// ---- main ----------------------------------------------------------------------
const results = { real: [], missing: [] };
const queue = [...cfg.emulators];
let cursor = 0;
async function worker() {
  while (true) {
    const idx = cursor++;
    if (idx >= queue.length) return;
    const emu = queue[idx];
    const realPath = join(outDir, `${emu.id}.png`);
    const missingPath = join(outDir, `missing---${emu.id}.png`);
    if (existsSync(realPath) && !existsSync(missingPath)) {
      results.real.push(`${emu.id} (cached)`);
      continue;
    }
    let got = null;
    for (const pkg of emu.packages) {
      got = await iconFromPlay(pkg);
      if (got) break;
      got = await iconFromApkCombo(pkg);
      if (got) break;
    }
    if (!got && REPOS[emu.id]) got = await iconFromGithub(REPOS[emu.id]);
    if (got && isPngOrWebp(got)) {
      writeFileSync(realPath, got);
      if (existsSync(missingPath)) unlinkSync(missingPath);
      results.real.push(emu.id);
      process.stdout.write(".");
    } else {
      if (!existsSync(missingPath)) writeFileSync(missingPath, placeholderPng(SIZE));
      if (existsSync(realPath)) unlinkSync(realPath);
      results.missing.push(emu.id);
      process.stdout.write("m");
    }
  }
}

await Promise.all(Array.from({ length: 5 }, worker));
console.log("");
console.log(`real icons: ${results.real.length}`);
console.log(`missing (placeholder): ${results.missing.length} -> ${results.missing.join(", ")}`);
