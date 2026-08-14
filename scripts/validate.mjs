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

// ---- systems.json ------------------------------------------------------------

check("config/systems.json", (systems) => {
  if (!Array.isArray(systems)) return problems.push("systems.json: must be an array");
  const ids = new Set();
  for (const sys of systems) {
    const label = `systems.json[${sys?.id}]`;
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
      // Variants of one package are legal (RetroArch cores, HD/non-HD modes);
      // only an identical (package, core) pair is a duplicate.
      const variants = new Set();
      for (const emu of sys.emulators) {
        if (!emu || typeof emu.name !== "string" || !emu.name) problems.push(`${label}: emulator name required`);
        if (!emu || typeof emu.package !== "string" || !/^[a-zA-Z0-9_.]+$/.test(emu.package ?? "")) {
          problems.push(`${label}: bad emulator package ${emu?.package}`);
        } else {
          const key = `${emu.package}|${emu.core ?? ""}`;
          if (variants.has(key)) problems.push(`${label}: duplicate emulator variant ${key}`);
          variants.add(key);
        }
        for (const key of ["core", "mimeType", "activity"]) {
          if (emu && emu[key] !== undefined && typeof emu[key] !== "string") {
            problems.push(`${label}.${emu.package}: ${key} must be a string`);
          }
        }
        if (emu && emu.extras !== undefined && (typeof emu.extras !== "object" || emu.extras === null)) {
          problems.push(`${label}.${emu.package}: extras must be an object`);
        }
      }
    }
  }
});

// ---- apps.json ---------------------------------------------------------------

check("config/apps.json", (appsFile, rel) => {
  if (!Array.isArray(appsFile?.apps)) return problems.push(`${rel}: apps[] required`);
  const seen = new Set();
  for (const app of appsFile.apps) {
    if (typeof app?.package !== "string" || !/^[a-zA-Z0-9_.]+$/.test(app.package)) {
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
    if (typeof repo?.url !== "string" || !/^https?:\/\//.test(repo.url)) {
      problems.push(`${rel}: bad repo url ${repo?.url}`);
    }
  }
});

// ---- report ------------------------------------------------------------------

if (problems.length) {
  console.error(`PocketRelay-tools validation failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("PocketRelay-tools config OK");
