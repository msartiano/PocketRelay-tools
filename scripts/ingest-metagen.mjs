#!/usr/bin/env node
/**
 * Ingests every preset from Pegasus metagen-android (the reference Android
 * emulator preset list) into config/systems.json:
 *   - all 200+ RetroArch cores -> `retroarch` / `retroarch-plus` / `retroarch-32`
 *     variants (new systems added when the platform is unknown),
 *   - all standalone emulators -> variant entries (with the exact launch
 *     activity + Pegasus `launchArgs` template) + master `emulators[]` entries
 *     for apps not already registered.
 *
 * Source: https://pegasus-frontend.org/tools/metagen-android/app.js
 * (the page's data table; a local path can be passed as argv[2]).
 *   node scripts/ingest-metagen.mjs
 *   node scripts/ingest-metagen.mjs C:/path/to/app.js
 * Run `node scripts/validate.mjs` afterwards.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_URL = "https://pegasus-frontend.org/tools/metagen-android/app.js";

// Pegasus metagen `abbr` -> our system id.
const ABBR = {
  "3do": "3do", "3ds": "n3ds", J2ME: "j2me", amiga: "amiga", arduboy: "arduboy",
  atari2600: "atari2600", atari5200: "atari5200", atari7800: "atari7800",
  atarijaguar: "jaguar", atarilynx: "lynx", atarist: "atarist", bk: "bk",
  bomberman: "bomberman", c64: "c64", cdi: "cdimono1", cdi2015: "cdimono1",
  chailove: "chailove", chip_8: "chip8", colecovision: "colecovision",
  commodore_amiga: "amiga", commodore_c128: "c128", commodore_c64: "c64",
  commodore_c64_supercpu: "c64", commodore_cbm2: "cbm2", commodore_cbm5x0: "cbm5x0",
  commodore_pet: "pet", commodore_plus4: "plus4", commodore_vic20: "vic20",
  cpc: "amstradcpc", cruzes: "cruzes", daphne: "daphne", dinothawr: "dinothawr",
  doom: "doom", doom_3: "doom3", dos: "dos", dreamcast: "dreamcast", fba: "fba",
  flashback: "flashback", game_music: "gme", gb: "gb", gba: "gba", gc: "gcn",
  hbmame: "mame", intellivision: "intellivision", j2me: "j2me", lowresnx: "lowresnx",
  lutro: "lutro", mame: "mame", mastersystem: "sms", mega_duck: "megaduck",
  megadrive: "megadrive", movie: "movie", msx: "msx", music: "music", n64: "n64",
  nds: "nds", neo_geo_pocket: "ngpc", neogeo: "neogeo", neogeocd: "neogeocd",
  nes: "nes", nxengine: "nxengine", oberon: "oberon", odyssey2: "odyssey2",
  openlara: "openlara", palm: "palm", pc: "pc", pc_88: "pc88", pc_98: "pc98",
  pc_fx: "pcfx", pcengine: "pce", pico8: "pico8", pokemon_mini: "pokemini",
  ps2: "ps2", psp: "psp", psx: "psx", quake_1: "quake", quake_2: "quake2",
  quake_3: "quake3", redbook: "redbook", rpgmaker: "rpgmaker", samcoupe: "samcoupe",
  saturn: "saturn", scummvm: "scummvm", segavmu: "vmuse", sharp_x68000: "x68000",
  sharpx1: "sharpx1", snes: "snes", supervision: "supervision", tic80: "tic80",
  uzebox: "uzebox", vectrex: "vectrex", virtualboy: "virtualboy", wasm4: "wasm4",
  wolfenstein3d: "wolfenstein3d", wonderswancolor: "wonderswancolor", xbox: "xbox",
  xrick: "xrick", zx81: "zx81", zxspectrum: "zxspectrum",
};

const RA_IDS = ["retroarch", "retroarch-plus", "retroarch-32"];
const RAP_PATTERN = /^(retroarch)(?:-(plus|32))?$/;

// Curated master ids + display names for the metagen-only standalone apps.
const PKG_META = {
  "com.androidemu.atari": { id: "ataroid", name: "Ataroid" },
  "com.androidemu.gbc": { id: "gbcoid", name: "GBCoid" },
  "com.androidemu.gg": { id: "gearoid", name: "Gearoid" },
  "com.androidemu.gens": { id: "gensoid", name: "Gensoid" },
  "com.androidemu.nes": { id: "nesoid", name: "NESoid" },
  "paulscode.android.mupen64plusae": { id: "mupen64plus-ae", name: "Mupen64Plus AE" },
  "org.mupen64plusae.v3.fzurita.pro": { id: "m64plus-fz-pro", name: "M64Plus FZ Pro" },
  "com.fastemulator.gbc": { id: "my-oldboy", name: "My OldBoy!" },
  "com.fastemulator.gbafree": { id: "myboy-free", name: "My Boy! Free" },
  "com.explusalpha.PceEmu": { id: "pce-emu", name: "PCE.emu" },
  "com.bubblezapgames.supergnes_lite": { id: "superretro16-lite", name: "SuperRetro16 Lite" },
  "com.bubblezapgames.supergnes": { id: "supergnes", name: "SuperRetro16" },
  "com.fms.colem.deluxe": { id: "colem-deluxe", name: "ColEm Deluxe" },
  "org.dolphinemu.handheld": { id: "dolphin-retroid", name: "Dolphin (Retroid fork)" },
  "org.devmiyax.yabasanshioro2.pro": { id: "yaba-sanshiro-2-pro", name: "Yaba Sanshiro 2 Pro" },
  "org.uoyabause.android.pro": { id: "yaba-sanshiro-pro", name: "Yaba Sanshiro Pro" },
  "org.uoyabause.android": { id: "yaba-sanshiro", name: "Yaba Sanshiro" },
  "ru.vastness.altmer.real3doplayer": { id: "real3doplayer", name: "Real3DOPlayer" },
  "ru.vastness.altmer.iratajaguar": { id: "iratajaguar", name: "IrataJaguar" },
};

function normalizeCore(file) {
  return file.replace(/_libretro_android\.so$/, "_libretro").replace(/_android\.so$/, "_libretro");
}

function cleanName(fullname) {
  return fullname.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function slugFromPackage(pkg) {
  const last = pkg.split(".").slice(-2).join("-").toLowerCase();
  return last.replace(/[^a-z0-9-]/g, "");
}

async function loadSource(provided) {
  if (provided && existsSync(provided)) return readFileSync(provided, "utf8");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`fetch ${SOURCE_URL} failed: ${res.status}`);
  return res.text();
}

const text = await loadSource(process.argv[2]);
const m = text.match(/const e=(\{ra:\[.*?\],sa:\[.*?\]\})/s);
if (!m) throw new Error("could not find the metagen data table in the source");
const data = new Function("return " + m[1])();
const { ra, sa } = data;

const cfgPath = join(root, "config", "systems.json");
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const byId = new Map(cfg.systems.map((s) => [s.id, s]));

const emuById = new Map(cfg.emulators.map((e) => [e.id, e]));
const pkgToEmu = new Map();
for (const e of cfg.emulators) for (const p of e.packages) pkgToEmu.set(p, e.id);

let newSystems = 0;
let newEmulators = 0;
let raVariants = 0;
let saVariants = 0;

for (const entry of ra) {
  const id = ABBR[entry.abbr];
  if (!id) {
    console.warn(`skip RA abbr ${entry.abbr} (unmapped)`);
    continue;
  }
  const core = normalizeCore(entry.core);
  let sys = byId.get(id);
  if (!sys) {
    sys = {
      id,
      name: cleanName(entry.fullname),
      folder: entry.sysname,
      romExtensions: entry.exts.split(/,\s*/),
      emulators: [],
    };
    cfg.systems.push(sys);
    byId.set(id, sys);
    newSystems++;
  }
  // RetroArch core variant for every retroarch-family build the system has
  // (new systems get all three).
  const present = new Set(sys.emulators.map((v) => v.emulator));
  const raTargets = present.size
    ? sys.emulators.map((v) => v.emulator).filter((e) => RAP_PATTERN.test(e))
    : RA_IDS;
  for (const rid of [...new Set(raTargets)]) {
    if (sys.emulators.some((v) => v.emulator === rid && v.core === core)) continue;
    sys.emulators.push({ emulator: rid, core });
    raVariants++;
  }
}

for (const entry of sa) {
  const id = ABBR[entry.abbr];
  if (!id) {
    console.warn(`skip SA abbr ${entry.abbr} (unmapped)`);
    continue;
  }
  const component = entry.core;
  const pkg = component.split("/")[0];
  const activity = component.includes("/") ? component : undefined;
  let emuId = pkgToEmu.get(pkg);
  if (!emuId) {
    const meta = PKG_META[pkg] ?? {};
    const explicitId = meta.id;
    let slug = explicitId || slugFromPackage(pkg);
    let emu;
    if (explicitId && emuById.has(explicitId)) {
      // Explicit mapping to an existing master id = same app, merge packages.
      emu = emuById.get(explicitId);
    } else {
      if (!slug) slug = "emu-" + pkg.replace(/\./g, "-");
      let s = slug;
      let n = 2;
      while (emuById.has(s)) s = `${slug}-${n++}`;
      slug = s;
      emu = {
        id: slug,
        name: meta.name || cleanName(entry.fullname),
        packages: [],
        siteUrl: "https://play.google.com/store/apps/details?id=" + pkg,
      };
      cfg.emulators.push(emu);
      emuById.set(slug, emu);
      newEmulators++;
    }
    if (!emu.packages.includes(pkg)) emu.packages.push(pkg);
    for (const p of emu.packages) pkgToEmu.set(p, slug);
    emuId = slug;
  }
  const emu = emuById.get(emuId);
  if (activity && emu && !emu.activity) emu.activity = activity;
  if (entry.args && emu && !emu.launchArgs) emu.launchArgs = entry.args;

  let sys = byId.get(id);
  if (!sys) {
    sys = { id, name: cleanName(entry.fullname), folder: entry.sysname, emulators: [] };
    cfg.systems.push(sys);
    byId.set(id, sys);
    newSystems++;
  }
  const existing = sys.emulators.find((v) => v.emulator === emuId);
  if (existing) {
    if (activity && !existing.activity) existing.activity = activity;
  } else {
    const v = { emulator: emuId };
    if (activity) v.activity = activity;
    sys.emulators.push(v);
    saVariants++;
  }
}

writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n");
console.log(
  `ingested metagen: ${ra.length} RetroArch presets, ${sa.length} standalone.\n` +
    `systems: ${cfg.systems.length} (+${newSystems} new), emulators: ${cfg.emulators.length} (+${newEmulators} new), ` +
    `ra variants: ${raVariants}, standalone variants: ${saVariants}`,
);
