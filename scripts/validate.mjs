#!/usr/bin/env node
/**
 * Validates every config/*.json in this repo. Zero dependencies.
 *   node scripts/validate.mjs
 * Used locally and by .github/workflows/ci.yml on every PR, so a bad JSON
 * entry can never reach the app.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];

function load(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    problems.push(`${rel}: missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    problems.push(`${rel}: not valid JSON (${e.message})`);
    return null;
  }
}

function check(rel, fn) {
  const data = load(rel);
  if (data !== null) fn(data, rel);
}

const URL_RE = /^https?:\/\//;
const PACKAGE_RE = /^[a-zA-Z0-9_.]+$/;
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---- systems.json (master-list format) ------------------------------------------

check("config/systems.json", (cfg) => {
  if (!cfg || !Array.isArray(cfg.emulators) || !Array.isArray(cfg.systems)) {
    problems.push("systems.json: must be { emulators[], systems[] }");
    return;
  }

  // Master emulator registry.
  const emulatorIds = new Set();
  const packages = new Set();
  for (const emu of cfg.emulators) {
    const label = `emulators[] ${emu?.id ?? emu?.name}`;
    if (!emu || typeof emu.id !== "string" || !ID_RE.test(emu.id)) {
      problems.push(`${label}: bad id`);
      continue;
    }
    if (emulatorIds.has(emu.id)) problems.push(`${label}: duplicate id`);
    emulatorIds.add(emu.id);
    if (typeof emu.name !== "string" || !emu.name) problems.push(`${label}: name required`);
    if (!Array.isArray(emu.packages) || emu.packages.length === 0) {
      problems.push(`${label}: packages[] required`);
    } else {
      for (const p of emu.packages) {
        if (typeof p !== "string" || !PACKAGE_RE.test(p)) problems.push(`${label}: bad package ${p}`);
        if (packages.has(p)) problems.push(`${label}: package ${p} already claimed by another emulator`);
        packages.add(p);
      }
    }
    if (typeof emu.siteUrl !== "string" || !URL_RE.test(emu.siteUrl)) problems.push(`${label}: siteUrl required (http(s))`);
    for (const key of ["playStoreUrl", "apkUrl"]) {
      if (emu[key] !== undefined && (typeof emu[key] !== "string" || !URL_RE.test(emu[key]))) {
        problems.push(`${label}: ${key} must be an http(s) url`);
      }
    }
    if (emu.links !== undefined && !Array.isArray(emu.links)) {
      problems.push(`${label}: links must be an array`);
    } else {
      const LINK_KINDS = new Set(["play", "fdroid", "github", "apk", "web"]);
      const seenUrls = new Set();
      for (const l of emu.links ?? []) {
        const llabel = `${label} link`;
        if (!l || typeof l !== "object") {
          problems.push(`${llabel}: must be an object { kind, label, url }`);
          continue;
        }
        if (typeof l.kind !== "string" || !LINK_KINDS.has(l.kind)) problems.push(`${llabel}: bad kind ${l?.kind}`);
        if (typeof l.label !== "string" || !l.label) problems.push(`${llabel}: label required`);
        if (typeof l.url !== "string" || !URL_RE.test(l.url)) problems.push(`${llabel}: url must be http(s)`);
        else if (seenUrls.has(l.url)) problems.push(`${llabel}: duplicate url ${l.url}`);
        seenUrls.add(l.url);
        if (l.install !== undefined && typeof l.install !== "boolean") problems.push(`${llabel}: install must be a boolean`);
      }
    }
  }

  // Systems referencing ids.
  const ids = new Set();
  for (const sys of cfg.systems) {
    const label = `systems[] ${sys?.id}`;
    if (!sys || typeof sys.id !== "string" || !/^[a-z0-9]+$/.test(sys.id)) {
      problems.push(`${label}: bad id`);
      continue;
    }
    if (ids.has(sys.id)) problems.push(`${label}: duplicate id`);
    ids.add(sys.id);
    if (typeof sys.name !== "string" || !sys.name) problems.push(`${label}: name required`);
    if (typeof sys.folder !== "string" || !sys.folder) problems.push(`${label}: folder required`);
    if (!Array.isArray(sys.emulators)) problems.push(`${label}: emulators required`);
    else {
      const favs = sys.emulators.filter((e) => e?.favourite === true).length;
      if (favs > 1) problems.push(`${label}: more than one favourite`);
      const variants = new Set();
      for (const v of sys.emulators) {
        if (!v || typeof v.emulator !== "string") {
          problems.push(`${label}: variant must reference an emulator id`);
          continue;
        }
        if (!emulatorIds.has(v.emulator)) problems.push(`${label}: unknown emulator id "${v.emulator}"`);
        const key = `${v.emulator}|${v.core ?? ""}`;
        if (variants.has(key)) problems.push(`${label}: duplicate emulator variant ${key}`);
        variants.add(key);
        for (const key2 of ["core", "mimeType", "activity"]) {
          if (v[key2] !== undefined && typeof v[key2] !== "string") {
            problems.push(`${label}.${v.emulator}: ${key2} must be a string`);
          }
        }
        if (v.extras !== undefined && (typeof v.extras !== "object" || v.extras === null)) {
          problems.push(`${label}.${v.emulator}: extras must be an object`);
        }
      }
    }
  }
});

// ---- apps.json -----------------------------------------------------------------

check("config/apps.json", (appsFile, rel) => {
  if (!Array.isArray(appsFile?.apps)) return problems.push(`${rel}: apps[] required`);
  const seen = new Set();
  for (const app of appsFile.apps) {
    if (typeof app?.package !== "string" || !PACKAGE_RE.test(app.package)) {
      problems.push(`apps.json: bad package ${app?.package}`);
      continue;
    }
    if (seen.has(app.package)) problems.push(`apps.json: duplicate package ${app.package}`);
    seen.add(app.package);
    if (typeof app?.name !== "string" || !app.name) problems.push(`apps.json: ${app.package} name required`);
  }
});

// ---- repos/curated.json -------------------------------------------------------

check("config/repos/curated.json", (curated, rel) => {
  if (!Array.isArray(curated?.repos)) return problems.push(`${rel}: repos[] required`);
  for (const repo of curated.repos) {
    if (typeof repo?.url !== "string" || !URL_RE.test(repo.url)) {
      problems.push(`${rel}: bad repo url ${repo?.url}`);
    }
  }
});

// ---- report ------------------------------------------------------------------

if (problems.length) {
  console.error(`PocketConsole-tools validation failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("PocketConsole-tools config OK");
