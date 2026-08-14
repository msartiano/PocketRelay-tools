# PocketConsole-tools

Canonical emulator/system config for the **nodeland-android** app (EmuBricks).
This repo is the single source of truth: the app's build bakes a snapshot of
`config/` into every APK (offline), and Settings → Update pulls the latest
live without a rebuild.

Managed as a **subfolder of the app project**: `tools/PocketConsole-tools/`.
`npm run deploy` clones/updates it there and copies `config/*.json` (plus the
emulator icons) into the app's `public/bundled/` before building.

## Layout

```
config/
  systems.json         # THE file: master emulator list + per-system variants
  apps.json            # any-system frontends (RetroArch, Lemuroid, ...)
  repos/curated.json   # starter repos offered to new installs
  emulator-icons/      # one <id>.png per emulator; missing---<id>.png placeholder
schema/                # JSON schemas, one per config (CI-validated)
scripts/
  validate.mjs                  # zero-dep validator, run on every PR
  build-master-config.mjs       # transforms an old-style flat systems.json
  fetch-emulator-icons.mjs      # downloads icons (Play/apkcombo/GitHub)
docs/
  adding-a-system.md   # walkthrough: add a platform or emulator
  pr-workflow.md
```

## Master-list format (`config/systems.json`)

A top-level `emulators[]` registry — **one stable `id` per app** — plus the
`systems[]` entries below that reference ids. Variant-only fields stay on the
system entry; app-level data (packages, links, icon) lives on the master entry.

```jsonc
{
  "emulators": [
    {
      "id": "retroarch",                         // one id per distinct app
      "name": "RetroArch",
      "packages": ["org.retroarch", "com.retroarch"],   // same app, extra builds
      "siteUrl": "https://www.retroarch.com/",   // official website / repo (always)
      "playStoreUrl": "https://play.google.com/store/apps/details?id=org.retroarch", // if on Play
      "apkUrl": "https://..."                    // direct .apk when downloadable in-app
    }
  ],
  "systems": [
    {
      "id": "psx",
      "name": "Sony - Playstation",
      "folder": "Playstation",
      "hue": 160,
      "mame": false,
      "emulators": [
        { "emulator": "duckstation", "favourite": true },            // reference the id
        { "emulator": "retroarch", "core": "swanstation_libretro" }  // per-variant core
      ]
    }
  ]
}
```

- **Reuse ids across platforms** — one master entry, referenced anywhere.
- At most one `favourite: true` per system — the default casual users get.
- `core` = RetroArch-style core name; `extras` = launch-intent extras.
- Every master entry needs: unique `id`, `name`, non-empty `packages[]`, and a
  `siteUrl` (the "link to APK": official website/repo). Add `playStoreUrl`
  when on Google Play and `apkUrl` when a direct APK is downloadable in-app.
- See `schema/systems.schema.json` for the full contract.

## Emulator icons

Every master entry has a 256×256 PNG at `config/emulator-icons/<id>.png`.
Where no icon could be sourced the placeholder `missing---<id>.png` is committed
instead, so gaps are visible in the repo at a glance. Refresh with:

```
node scripts/fetch-emulator-icons.mjs
```

The fetcher tries Google Play → apkcombo → GitHub project avatar and writes a
placeholder when all fail. Real icons are never re-downloaded (idempotent);
delete a file to force a re-fetch. Play serves WebP — normalize committed icons
to PNG (ImageMagick: `magick <id>.png <id>.png`) so every file is a real PNG.

## PR workflow

Add/extend a config → `node scripts/validate.mjs` passes → open a PR.
Every PR is validated by CI; a merge is immediately available in-app via
Settings → Update.
