# PocketRelay-tools

Canonical emulator/system config for the **nodeland-android** app (EmuBricks).
This repo is the single source of truth: the app's build bakes a snapshot of
`config/` into every APK (offline), and Settings → Update pulls the latest
live without a rebuild.

Managed as a **subfolder of the app project**: `tools/PocketRelay-tools/`.
`npm run deploy` clones/updates it there and copies `config/*.json` into the
app's `public/bundled/config/` before building.

## Layout

```
config/
  systems/systems.json   # THE file: per-platform metadata + emulators[] variants
  apps/apps.json         # any-system frontends (RetroArch, Lemuroid, ...)
  repos/curated.json     # starter repos offered to new installs
schema/                  # JSON schemas, one per config (CI-validated)
scripts/validate.mjs     # zero-dep validator, run on every PR
docs/
  adding-a-system.md     # walkthrough: add a platform in one entry
  pr-workflow.md
```

## Schema quick-ref (`config/systems/systems.json`)

```jsonc
{
  "id": "psx",                 // lowercase, no dashes
  "name": "Sony - Playstation",
  "folder": "Playstation",     // ROM folder name (ES-DE convention)
  "aliases": ["ps1"],          // folder/display aliases -> id
  "romExtensions": ["iso", "cue", "pbp"],
  "logoKey": "psx",            // optional, from public/platform-logos
  "hue": 160,                  // fallback tile color 0-359
  "mame": false,               // MAME-style (launch by ROM filename)
  "emulators": [               // MULTIPLE emulators AND multiple configs per emulator
    { "name": "DuckStation", "package": "com.github.stenzek.duckstation", "favourite": true },
    { "name": "DuckStation HD", "package": "com.github.stenzek.duckstation", "extras": { "HD": "1" } },
    { "name": "RetroArch (SwanStation)", "package": "org.retroarch", "core": "swanstation_libretro" }
  ]
}
```

- One system may list many emulators; one app may appear many times (RetroArch
  per-core, HD/non-HD modes).
- At most one `favourite: true` per system — the default casual users get.
- `core` = RetroArch-style core name; `extras` = launch-intent extras.
- See `schema/systems.schema.json` for the full contract.

## Regenerate the seed

The initial config was generated from the app's built-in tables:

```
npm run seed-config        # app repo: node scripts/seed-config.mjs
```

Re-run after adding a system/app in the Android sources to refresh the seed,
then review + commit here.

## PR workflow

Add/extend a config → `node scripts/validate.mjs` passes → open a PR.
Every PR is validated by CI; a merge is immediately available in-app via
Settings → Update.
