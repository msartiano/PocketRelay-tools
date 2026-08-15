#!/usr/bin/env node
/**
 * Regenerates the emulator documentation from config/systems.json so the docs
 * can never drift from the config that is actually shipped:
 *   - README.md "Supported Android emulators" table (between
 *     `<!-- emulators-table:start -->` / `<!-- emulators-table:end -->`),
 *   - docs/android-emulators.md (RetroArch launch template + per-system core
 *     table + every standalone emulator's exact `am start` command).
 *
 * Run after ANY change to an emulator's config/definition:
 *   node scripts/gen-emulator-docs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(join(root, "config", "systems.json"), "utf8"));
const emuById = new Map(cfg.emulators.map((e) => [e.id, e]));
const raPattern = /^retroarch(-(plus|32))?$/;

function resolveActivity(pkg, component) {
  if (!component) return undefined;
  const slash = component.indexOf("/");
  if (slash === -1) return undefined;
  const p = component.slice(0, slash);
  let a = component.slice(slash + 1);
  if (a.startsWith(".")) a = p + a;
  return a || undefined;
}

function unquote(v) {
  return v.length >= 2 && v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1) : v;
}

function parseArgs(args, defaultAction = "android.intent.action.VIEW") {
  if (!args) return { action: defaultAction, tokens: [] };
  const tokens = args.split(";");
  const first = tokens.shift().trim();
  const action = first
    ? first === "VIEW" ? "android.intent.action.VIEW" : first === "MAIN" ? "android.intent.action.MAIN" : first
    : defaultAction;
  return { action, tokens };
}

function amStart(emu) {
  const pkg = emu.packages[0];
  const activity = resolveActivity(pkg, emu.activity);
  const lines = ["am start"];
  if (activity) lines.push(`-n ${pkg}/${activity}`);
  else lines.push(`-p ${pkg}`);
  const { action, tokens } = parseArgs(emu.launchArgs);
  lines.push(`-a ${action}`);
  let dataRendered = false;
  for (const raw of tokens) {
    const token = raw.trim();
    if (!token) continue;
    if (token === "d" || token.startsWith("d ")) {
      lines.push(`-d ${unquote(token.replace(/^d\s*/, ""))}`);
      dataRendered = true;
      continue;
    }
    const m = token.match(/^-{0,2}([a-z]+)\s+(.+)$/);
    if (!m) continue;
    const kind = m[1];
    const rest = m[2];
    if (kind === "e" || kind === "es") {
      const sp = rest.indexOf(" ");
      const key = sp === -1 ? rest : rest.slice(0, sp);
      const value = sp === -1 ? "" : unquote(rest.slice(sp + 1).trim());
      lines.push(`-e ${key} ${value}`);
    } else if (kind === "ez") {
      const sp = rest.indexOf(" ");
      const key = sp === -1 ? rest : rest.slice(0, sp);
      const value = sp === -1 ? "1" : rest.slice(sp + 1).trim();
      lines.push(`--ez ${key} ${value}`);
    } else if (kind === "el") {
      const sp = rest.indexOf(" ");
      const key = sp === -1 ? rest : rest.slice(0, sp);
      const value = sp === -1 ? "0" : rest.slice(sp + 1).trim();
      lines.push(`--el ${key} ${value}`);
    } else if (kind === "a") {
      lines.push(`-a ${rest}`);
    }
  }
  if (!dataRendered) lines.push("-d {file.uri}");
  return lines.join(" \\\n  ");
}

function systemsFor(id) {
  return cfg.systems.filter((s) => s.emulators.some((v) => v.emulator === id)).map((s) => s.id);
}

// ---- README table (all non-RetroArch emulators) ------------------------------

const standalone = cfg.emulators.filter((e) => !raPattern.test(e.id));
const rows = standalone
  .map((e) => {
    const systems = systemsFor(e.id);
    const fav = systems
      .map((sid) => {
        const sys = cfg.systems.find((s) => s.id === sid);
        return sys?.emulators.find((v) => v.emulator === e.id && v.favourite) ? sid : null;
      })
      .filter(Boolean);
    const coreNote = e.launchArgs ? "custom args" : "ACTION_VIEW";
    return `| ${e.name} | \`${e.packages.join("`, `")}\` | ${fav.length ? `**${fav.join(", ")}**` : systems.join(", ") || "—"} | ${coreNote} |`;
  })
  .sort((a, b) => a.localeCompare(b));

const readmeTable = [
  "",
  `PocketConsole-tools ships **${cfg.systems.length} systems** and **${cfg.emulators.length} emulator apps** (${standalone.length} standalone + the 3 RetroArch builds). Full launch commands live in [docs/android-emulators.md](docs/android-emulators.md).`,
  "",
  "### Standalone (non-RetroArch) emulators",
  "",
  "| Emulator | Package(s) | Systems (bold = default) | Launch |",
  "|---|---|---|---|",
  ...rows,
  "",
];

const readmePath = join(root, "README.md");
let readme = readFileSync(readmePath, "utf8");
const startMark = "<!-- emulators-table:start -->";
const endMark = "<!-- emulators-table:end -->";
const block = `${startMark}\n${readmeTable.join("\n")}\n${endMark}`;
if (readme.includes(startMark) && readme.includes(endMark)) {
  readme = readme.replace(/<!-- emulators-table:start -->[\s\S]*<!-- emulators-table:end -->/, block);
} else {
  readme += `\n\n## Supported Android emulators\n\n${block}\n`;
}
writeFileSync(readmePath, readme);

// ---- docs/android-emulators.md -----------------------------------------------

const raCores = new Map();
for (const s of cfg.systems) {
  const cores = [];
  for (const v of s.emulators) if (raPattern.test(v.emulator) && v.core && !cores.includes(v.core)) cores.push(v.core);
  if (cores.length) raCores.set(s.id, cores);
}

const retrolines = [];
for (const [sid, cores] of [...raCores.entries()].sort()) {
  const sys = cfg.systems.find((s) => s.id === sid);
  retrolines.push(`| ${sys?.name ?? sid} | \`${sid}\` | \`${cores.join("`, `")}\` |`);
}

const saLines = [];
for (const e of standalone.sort((a, b) => a.name.localeCompare(b.name))) {
  const systems = systemsFor(e.id);
  const activity = resolveActivity(e.packages[0], e.activity);
  saLines.push(
    `### ${e.name}`,
    "",
    `- Package: \`${e.packages.join("`, `")}\``,
    `- Systems: ${systems.join(", ") || "—"}`,
    activity ? `- Activity: \`${activity}\`` : "",
    `- Launch:`,
    "```",
    amStart(e),
    "```",
    "",
  );
}

const doc = `# Android emulator launch commands

Generated from \`config/systems.json\` by \`node scripts/gen-emulator-docs.mjs\` — never hand-edit. Placeholders: \`{file.path}\` = real ROM path, \`{file.uri}\` / \`{file.documenturi}\` = content:// URI.

## RetroArch

Modern RetroArch (v1.7+) boots a game through its content activity, \`RetroActivityFuture\`, using the \`ROM\` + \`LIBRETRO\` + \`CONFIGFILE\` extras. This is the exact recipe the app sends (the core \`.so\` path and config path are resolved per installed build):

\`\`\`
am start \\
  -n com.retroarch/.browser.retroactivity.RetroActivityFuture \\
  -a android.intent.action.MAIN \\
  -e ROM {file.path} \\
  -e LIBRETRO /data/data/com.retroarch/cores/<core>_libretro_android.so \\
  -e CONFIGFILE /storage/emulated/0/Android/data/com.retroarch/files/retroarch.cfg \\
  -e QUITFOCUS \\
  -f FLAG_ACTIVITY_NEW_TASK -f FLAG_ACTIVITY_CLEAR_TASK -f FLAG_ACTIVITY_CLEAR_TOP -f FLAG_ACTIVITY_NO_HISTORY
\`\`\`

For the 64-bit build use \`com.retroarch.aarch64\` (and \`com.retroarch.ra32\` for 32-bit); every core below is offered on all three builds. The app pins a core automatically from the system or from the \`[Tag]\` in the ROM filename.

### Per-system cores

| System | id | RetroArch cores |
|---|---|---|
${retrolines.join("\n")}

## Standalone emulators

${saLines.join("\n")}
`;

mkdirSync(join(root, "docs"), { recursive: true });
writeFileSync(join(root, "docs", "android-emulators.md"), doc);
console.log(`docs regenerated: README table (${rows.length} standalone emulators), docs/android-emulators.md (${retrolines.length} systems, ${standalone.length} standalone)`);
