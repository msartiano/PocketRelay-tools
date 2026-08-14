# Adding a system (or an emulator for one)

This is the whole point of the repo: adding a platform or a new emulator
variant is **one JSON edit + a PR**. No app rebuild is required for existing
users — they pick it up in Settings → Update.

`config/systems.json` uses the master-list format: an `emulators[]` registry
(one id per app) on top, and the `systems[]` below that reference ids.

## New emulator app (or the links/icon for an existing one)

If the app is new, add one entry to the top-level `emulators[]`:

```jsonc
{
  "id": "duckstation",                 // lowercase slug, unique
  "name": "DuckStation",
  "packages": ["com.github.stenzek.duckstation"],
  "siteUrl": "https://www.duckstation.org/",          // required: official site/repo
  "playStoreUrl": "https://play.google.com/store/apps/details?id=com.github.stenzek.duckstation", // if on Play
  "apkUrl": "https://...",                              // direct .apk when downloadable in-app
  "links": [                                            // rich multi-source (optional)
    { "kind": "play",   "label": "Play Store", "url": "https://play.google.com/…" },
    { "kind": "fdroid", "label": "F-Droid",    "url": "https://f-droid.org/packages/…" },
    { "kind": "github", "label": "GitHub",     "url": "https://github.com/owner/repo" },
    { "kind": "apk",    "label": "APK",        "url": "https://…/app.apk" },
    { "kind": "web",    "label": "Official",   "url": "https://www.example.com/" }
  ]
}
```

Link kinds the app understands:
- `play` → opens the Play Store app.
- `fdroid` → opens F-Droid.
- `apk` → the app downloads + installs the APK in-app (verified PackageInstaller).
- `github` / `web` → opened in the in-app browser, **unless the URL is a direct
  APK** (`*.apk`, `/releases/download/…apk`, or `"install": true`) → downloaded
  + installed in-app. A GitHub releases page in the in-app browser lets users
  pick what they want.

`links[]` is optional — the app also derives links from the legacy
`siteUrl`/`playStoreUrl`/`apkUrl` fields, so a bare entry always works. Run
`node scripts/add-links.mjs` after editing to regenerate the array from the
legacy fields plus the curated `EXTRA_LINKS` map (`scripts/links.mjs`). Only
add F-Droid pages you have verified exist — broken links are a bug.

Then add an icon: `node scripts/fetch-emulator-icons.mjs` (or drop a PNG at
`config/emulator-icons/<id>.png`; a missing icon must be a committed
`missing---<id>.png` placeholder). Normalize any WebP to PNG with ImageMagick.

## New platform

Append one entry to `systems[]`:

```jsonc
{
  "id": "psv2",                      // lowercase alphanumeric, no dashes
  "name": "Sony - Playstation Vita 2",
  "folder": "Playstation Vita 2",    // the roms/<folder> name
  "aliases": ["psv2", "ps-vita-2"],  // folder/display names that map here
  "romExtensions": ["iso", "vpk"],   // files the scanner treats as ROMs
  "logoKey": "psv2",                 // optional
  "hue": 210,                        // fallback tile color
  "mame": false,
  "emulators": [ /* see below */ ]
}
```

## New emulator / variant for an existing system

Add an object to that system's `emulators[]`. Reference a master id; keep
variant-only fields here:

```jsonc
{ "emulator": "duckstation", "favourite": true }              // default for this system
{ "emulator": "retroarch", "core": "swanstation_libretro" }   // a RetroArch core
```

Rules:
- `emulator` must be an id from the top-level `emulators[]` registry.
- One emulator may appear many times per system (RetroArch per-core, HD/non-HD
  modes) — that is intended; each needs a distinct `core`.
- `core` is a RetroArch-style core (`snes9x_libretro`). It is sent to the app as
  the `CORE` launch extra.
- `extras` are launch-intent extras (e.g. `{ "HD": "1" }`, `{ "VIDEO_DRIVER": "vulkan" }`).
- At most ONE `"favourite": true` per system — the default a casual user gets.
  Set it to the best default experience.
- The display name shown in-app is the master `name` plus the core when present
  (e.g. "RetroArch (snes9x)"); a genuinely distinct app gets its own master id.

## Checklist

1. Add the master entry (id + name + packages + `siteUrl`, plus `playStoreUrl`
   / `apkUrl` when available) and its icon in `config/emulator-icons/`.
2. Edit the system's `emulators[]` to reference the id.
3. `node scripts/validate.mjs` passes.
4. Commit + PR. CI re-validates.
5. Merge → the app's Settings → Update shows the change with a friendly diff.
