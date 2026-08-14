# Adding a system (or an emulator for one)

This is the whole point of the repo: adding a platform or a new emulator
variant is **one JSON edit + a PR**. No app rebuild is required for existing
users — they pick it up in Settings → Update.

## New platform

Append one entry to `config/systems/systems.json`:

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

Add an object to that system's `emulators[]`:

```jsonc
{ "name": "DuckStation HD", "package": "com.github.stenzek.duckstation", "extras": { "HD": "1" } }
{ "name": "RetroArch (SwanStation)", "package": "org.retroarch", "core": "swanstation_libretro" }
```

Rules:
- `package` is the Android package id (dots/letters/digits/underscores).
- Multiple entries for the same app = multiple configs (HD on/off, one RetroArch
  entry per core). That is intended.
- `core` is a RetroArch-style core (`snes9x_libretro`). It is sent to the app as
  the `CORE` launch extra.
- `extras` are launch-intent extras (e.g. `{ "HD": "1" }`, `{ "VIDEO_DRIVER": "vulkan" }`).
- At most ONE `"favourite": true` per system — the default a casual user gets.
  Set it to the best default experience.

## Checklist

1. Edit the JSON.
2. `node scripts/validate.mjs` passes.
3. Commit + PR. CI re-validates.
4. Merge → the app's Settings → Update shows the change with a friendly diff.
