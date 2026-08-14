#!/usr/bin/env node
/**
 * Injects `links[]` into every master emulator entry in config/systems.json
 * (idempotent: entries that already have links are left untouched).
 *
 *   node scripts/add-links.mjs
 *
 * Run after build-master-config.mjs (which emits the legacy siteUrl /
 * playStoreUrl / apkUrl fields) so the config carries the rich link set too.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLinks } from "./links.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "config", "systems.json");
const cfg = JSON.parse(readFileSync(path, "utf8"));

let added = 0;
for (const emu of cfg.emulators ?? []) {
  if (Array.isArray(emu.links) && emu.links.length > 0) continue;
  const links = buildLinks(emu);
  if (links.length > 0) {
    emu.links = links;
    added += 1;
  }
}

if (added > 0) {
  writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n", "utf8");
}
console.log(`links added to ${added} emulator(s)`);
