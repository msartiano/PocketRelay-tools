#!/usr/bin/env node
/**
 * Copies system/platform logo art into config/system-icons/, keyed by each
 * system's `logoKey ?? id` (ES-DE-style names, e.g. `snes.svg`, `3do.svg`).
 *
 *   node scripts/fetch-platform-icons.mjs [--src <dir>]
 *
 * Source defaults to `../nodeland/dist/platform-logos` (the desktop repo's
 * generated logo set) resolved from this repo's location; pass `--src` to
 * point at another directory. `.svg` wins over `.png` for the same key.
 * Systems with no matching logo simply get no file — the app letter-tiles
 * them. Idempotent: existing files are overwritten (the set is regenerable).
 */
import { readdirSync, copyFileSync, mkdirSync, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "config", "system-icons");
const cfg = JSON.parse(readFileSync(join(root, "config", "systems.json"), "utf8"));

const argSrc = process.argv.indexOf("--src");
const defaultSrc = join(root, "..", "..", "..", "nodeland", "dist", "platform-logos");
const srcDir = argSrc >= 0 ? process.argv[argSrc + 1] : defaultSrc;

if (!existsSync(srcDir)) {
  console.error(`source logo dir not found: ${srcDir}`);
  console.error("pass --src <dir> to point at another directory");
  process.exit(1);
}

const files = readdirSync(srcDir);
const byKey = new Map();
for (const f of files) {
  const base = basename(f).replace(/\.(svg|png)$/i, "");
  const ext = f.toLowerCase().endsWith(".svg") ? "svg" : "png";
  const prev = byKey.get(base);
  if (!prev || ext === "svg") byKey.set(base, { file: f, ext });
}

mkdirSync(outDir, { recursive: true });
let copied = 0;
let missing = 0;
for (const sys of cfg.systems) {
  const key = sys.logoKey ?? sys.id;
  const hit = byKey.get(key);
  if (hit) {
    copyFileSync(join(srcDir, hit.file), join(outDir, `${key}.${hit.ext}`));
    copied++;
  } else {
    missing++;
  }
}

// Committed manifest (name -> byte size) so the app's Settings → Update can
// diff the remote set against what's on the device from a raw GitHub URL.
const manifestFiles = {};
for (const f of readdirSync(outDir)) {
  if (f === "manifest.json") continue;
  manifestFiles[f] = statSync(join(outDir, f)).size;
}
writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ version: 1, files: manifestFiles }, null, 2) + "\n", "utf8");

console.log(`system-icons: ${copied} copied (${cfg.systems.length - missing} missing -> letter-tile fallback), manifest written`);
