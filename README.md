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
  add-links.mjs + links.mjs     # regenerate links[] from legacy fields + curated map
  ingest-metagen.mjs            # pull every Pegasus metagen-android preset into systems.json
  gen-emulator-docs.mjs         # regenerate the README table + docs/android-emulators.md
docs/
  adding-a-system.md            # walkthrough: add a platform or emulator
  android-emulators.md          # generated: launch commands for every emulator (do not hand-edit)
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


## Supported Android emulators

<!-- emulators-table:start -->

PocketConsole-tools ships **119 systems** and **134 emulator apps** (131 standalone + the 3 RetroArch builds). Full launch commands live in [docs/android-emulators.md](docs/android-emulators.md).

### Standalone (non-RetroArch) emulators

| Emulator | Package(s) | Systems (bold = default) | Launch |
|---|---|---|---|
| 2600.emu | `com.explusalpha.A2600Emu` | **atari2600** | ACTION_VIEW |
| AetherSX2 | `xyz.aethersx2.android` | **ps2** | custom args |
| aFreeBox | `com.fishstix.dosboxfree` | dos | ACTION_VIEW |
| anDOSBox | `com.locnet.dosbox` | dos | ACTION_VIEW |
| ARMSX3 | `com.armsx3` | **ps3** | ACTION_VIEW |
| Ataroid | `com.androidemu.atari` | atari2600 | ACTION_VIEW |
| Azahar | `io.github.lime3ds.android` | n3ds | ACTION_VIEW |
| Bochs | `net.sourceforge.bochs` | **windows** | ACTION_VIEW |
| C64 | `de.joergjahnke.c64.android` | c64 | ACTION_VIEW |
| C64 | `org.ab.c64` | c64 | ACTION_VIEW |
| C64.emu | `com.explusalpha.C64Emu` | c64 | ACTION_VIEW |
| Citra (MMJ) | `org.citra.citra_emu`, `org.github.weihuoya.citra` | n3ds | ACTION_VIEW |
| Citra (nightly) | `org.citra.emu` | n3ds | custom args |
| Citra | `org.citra.citra` | **n3ds** | ACTION_VIEW |
| Citron | `org.citron.citron_emu` | nsw | ACTION_VIEW |
| ClassicBoy Lite | `com.portableandroid.classicboyLite` | mame, pce, tg16, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, ngpc, psx | ACTION_VIEW |
| ClassicBoy Pro | `com.portableandroid.classicboy` | mame, pce, tg16, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, ngpc, psx | ACTION_VIEW |
| ColEm | `com.fms.colem` | colecovision | ACTION_VIEW |
| ColEm Deluxe | `com.fms.colem.deluxe` | colecovision | ACTION_VIEW |
| DamonPS2 | `com.damonplay.damonps2.free` | ps2 | ACTION_VIEW |
| Dolphin (Retroid fork) | `org.dolphinemu.handheld` | gcn, wii | custom args |
| Dolphin | `org.dolphinemu.dolphinemu`, `com.dolphin.emulator`, `org.dolphin.dolphinemu` | **gcn, ngc, wii** | custom args |
| DOSBox Turbo | `com.fishstix.dosbox` | dos | ACTION_VIEW |
| DraStic | `com.dsemu.drastic` | nds | ACTION_VIEW |
| DuckStation | `com.github.stenzek.duckstation` | **psx** | custom args |
| Eden | `dev.eden.eden_emulator` | nsw | ACTION_VIEW |
| Egg NS | `com.xiaoji.gamesirnsemulator.x.google` | nsw | ACTION_VIEW |
| ePSXe | `com.epsxe.ePSXe` | psx | custom args |
| Flycast | `com.flycast.emulator` | **dreamcast, atomiswave** | ACTION_VIEW |
| fMSX | `com.fms.fmsx` | **msx** | ACTION_VIEW |
| FPse | `com.emulator.fpse` | psx | ACTION_VIEW |
| FPse 64 | `com.emulator.fpse64` | psx | ACTION_VIEW |
| GameBoy Advanced droid | `ca.halsafar.gambattedroid` | gba | ACTION_VIEW |
| GameBoy droid | `ca.halsafar.mgbadroid` | gb, gbc | ACTION_VIEW |
| GBA.emu | `com.explusalpha.GbaEmu` | gba | ACTION_VIEW |
| GBC.emu | `com.explusalpha.GbcEmu` | gb, gbc | ACTION_VIEW |
| gbcc | `com.philj56.gbcc` | gb, gbc | ACTION_VIEW |
| GBCoid | `com.androidemu.gbc` | gb, gbc | ACTION_VIEW |
| Gearoid | `com.androidemu.gg` | gg, sms | ACTION_VIEW |
| GenesisDroid | `ca.halsafar.genesisdroid` | genesis, megadrive | ACTION_VIEW |
| Gensoid | `com.androidemu.gens` | genesis, megadrive | ACTION_VIEW |
| GZDoom (Delta Touch Full) | `com.opentouchgaming.gzdoom` | doom | ACTION_VIEW |
| GZDoom (Delta Touch) | `com.opentouchgaming.gzdoomfree` | **doom** | ACTION_VIEW |
| IrataJaguar | `ru.vastness.altmer.iratajaguar` | jaguar | custom args |
| John GBA | `com.johnemulators.johngba` | gba | ACTION_VIEW |
| John GBA Lite | `com.johnemulators.johngbac` | gba | ACTION_VIEW |
| John GBC | `com.johnemulators.johngbc` | gb, gbc | ACTION_VIEW |
| John NES | `com.johnemulators.johnness` | nes | ACTION_VIEW |
| jzIntv | `org.libsdl.jzintv4droid2` | intellivision | ACTION_VIEW |
| kat5200 | `com.jillybunch.kat5200` | **atari5200** | ACTION_VIEW |
| Lemuroid | `com.swordfish.lemuroid` | **lynx, pce, tg16, gb, gbc, gg, sms** | ACTION_VIEW |
| Lynx.emu | `com.explusalpha.LynxEmu` | lynx | ACTION_VIEW |
| M64Plus FZ | `org.mupen64plusae.v3.fzurita` | n64 | ACTION_VIEW |
| M64Plus FZ Pro | `org.mupen64plusae.v3.fzurita.pro` | n64 | ACTION_VIEW |
| Magic DOSBox | `bruenor.magicbox` | **dos** | ACTION_VIEW |
| MAME4droid (2024) | `com.seleuco.mame4d2024` | mame, fba | ACTION_VIEW |
| MAME4droid (MAME4All) | `com.seleuco.mame4all` | mame | ACTION_VIEW |
| MAME4droid | `com.seleuco.mame4droid` | **mame, fba** | ACTION_VIEW |
| MasterEmu | `uk.co.philpotter.masteremu` | gg, sms | ACTION_VIEW |
| MD.emu | `com.explusalpha.MdEmu` | **genesis, megadrive** | ACTION_VIEW |
| melonDS | `me.magnum.melonds` | **nds** | ACTION_VIEW |
| Mikage | `com.mikageinc.mikage` | n3ds | ACTION_VIEW |
| MSX.emu | `com.explusalpha.MsxEmu` | msx | ACTION_VIEW |
| Mupen64Plus AE | `org.mupen64plusae`, `paulscode.android.mupen64plusae` | **n64** | ACTION_VIEW |
| My Boy! | `com.fastemulator.gba` | **gba** | ACTION_VIEW |
| My Boy! Free | `com.fastemulator.gbafree` | gba | ACTION_VIEW |
| My OldBoy! | `com.fastemulator.gbc` | gb, gbc | ACTION_VIEW |
| N64.emu | `com.explusalpha.N64Plus` | n64 | ACTION_VIEW |
| N64oid | `com.mop.ide.n64oid` | n64 | ACTION_VIEW |
| NEO.emu | `com.explusalpha.NeoEmu` | mame, fba | ACTION_VIEW |
| NES.emu | `com.explusalpha.NesEmu` | **nes** | ACTION_VIEW |
| NESdroid | `ca.halsafar.nesdroid` | nes | ACTION_VIEW |
| NESoid | `com.androidemu.nes` | nes | ACTION_VIEW |
| NetherSX2 | `xyz.aether.sx2` | ps2 | ACTION_VIEW |
| Network GBA | `com.hqgame.networkgba` | gba | ACTION_VIEW |
| Network NES | `com.hqgame.networknes` | nes | ACTION_VIEW |
| Network SNES | `com.hqgame.networksnes` | snes | ACTION_VIEW |
| NGP.emu | `com.explusalpha.NgpEmu` | **ngpc** | ACTION_VIEW |
| Nood (N64) | `com.hydra.noods` | n64 | ACTION_VIEW |
| Nostalgia.GBA | `com.nostalgiaemulators.gbalite` | gba | ACTION_VIEW |
| Nostalgia.GBA Pro | `com.nostalgiaemulators.gbapro` | gba | ACTION_VIEW |
| Nostalgia.GBC | `com.nostalgiaemulators.gbclite` | gb, gbc | ACTION_VIEW |
| Nostalgia.GBC Pro | `com.nostalgiaemulators.gbcpro` | gb, gbc | ACTION_VIEW |
| Nostalgia.GG | `com.nostalgiaemulators.gglite` | gg, sms | ACTION_VIEW |
| Nostalgia.NES | `com.nostalgiaemulators.neslite` | nes | ACTION_VIEW |
| Nostalgia.NES Pro | `com.nostalgiaemulators.nespro` | nes | ACTION_VIEW |
| Nostalgia.SNES | `com.nostalgiaemulators.sneslite` | snes | ACTION_VIEW |
| Nostalgia.SNES Pro | `com.nostalgiaemulators.snespro` | snes | ACTION_VIEW |
| openMSX | `org.openmsx.android.openmsx` | msx | ACTION_VIEW |
| Panda3DS | `com.alber.panda3ds` | n3ds | ACTION_VIEW |
| PCE.emu | `com.explusalpha.PceEmu` | pce, tg16 | ACTION_VIEW |
| Pizza Boy | `it.dbtecno.pizzaboy` | gba | ACTION_VIEW |
| Pizza Boy C | `it.dbtecno.pizzaboyc` | gb, gbc | ACTION_VIEW |
| Pizza Boy C Pro | `it.dbtecno.pizzaboycpro` | gb, gbc | ACTION_VIEW |
| Pizza Boy Pro | `it.dbtecno.pizzaboypro` | gba | ACTION_VIEW |
| Play! | `com.virtualapplications.play` | ps2 | ACTION_VIEW |
| PPSSPP | `org.ppsspp.ppsspp` | **psp** | custom args |
| PPSSPP Gold | `org.ppsspp.ppssppgold` | psp | custom args |
| PSX.emu | `com.explusalpha.PsxEmu` | psx | ACTION_VIEW |
| Real3DOPlayer | `ru.vastness.altmer.real3doplayer` | 3do | custom args |
| Redream | `io.recompiled.redream` | dreamcast | ACTION_VIEW |
| Reicast | `com.reicast.emulator` | dreamcast | custom args |
| ResidualVM | `org.residualvm.residualvm` | scummvm | ACTION_VIEW |
| Saturn.emu | `com.explusalpha.SaturnEmu` | saturn | ACTION_VIEW |
| ScummVM | `org.scummvm.scummvm` | **scummvm** | ACTION_VIEW |
| SilverArrow | `com.jabosoft.silverarrow` | psx | ACTION_VIEW |
| Skyline | `emu.skyline` | nsw | ACTION_VIEW |
| Snes9x EX+ | `com.explusalpha.Snes9xPlus` | **snes, sfc** | ACTION_VIEW |
| SNESdroid | `ca.halsafar.snesdroid` | snes | ACTION_VIEW |
| Strato | `emu.strato` | nsw | ACTION_VIEW |
| Sudachi | `org.sudachi.sudachi_emu` | nsw | ACTION_VIEW |
| SuperRetro16 | `com.bubblezapgames.supergnes` | snes | ACTION_VIEW |
| SuperRetro16 | `com.neutronemulation.super_retro_16` | gb, gbc, gba, snes | ACTION_VIEW |
| SuperRetro16 Lite | `com.bubblezapgames.supergnes_lite` | snes | ACTION_VIEW |
| SuperZSNES | `com.zsnes.superzsnes` | snes | ACTION_VIEW |
| UAE4All | `org.ab.uae` | amiga | ACTION_VIEW |
| UAE4All2 | `atua.anddev.uae4all2` | **amiga** | ACTION_VIEW |
| UAE4Droid | `com.locnet.uae` | amiga | ACTION_VIEW |
| UnityBoyAdvance | `com.Rekkuzan.UnityBoyAdvance` | gba | ACTION_VIEW |
| VecDroid | `com.willna.vecdroid` | vectrex | ACTION_VIEW |
| VICE | `com.locnet.vice` | **c64** | ACTION_VIEW |
| Virtual Jaguar | `org.icculus.virtualjaguar` | **jaguar** | ACTION_VIEW |
| Vita3K | `com.github.eka2l1` | **psvita** | ACTION_VIEW |
| Yaba Sanshiro | `org.uoyabause.android` | saturn | custom args |
| Yaba Sanshiro 2 | `org.devmiyax.yabasanshioro2` | **saturn** | ACTION_VIEW |
| Yaba Sanshiro 2 Pro | `org.devmiyax.yabasanshioro2.pro` | saturn | custom args |
| Yaba Sanshiro Pro | `org.uoyabause.android.pro` | saturn | custom args |
| Yabause | `org.bbflight.yabause` | saturn | ACTION_VIEW |
| Yuzu (RetroShark) | `io.retroshark.yuzu` | nsw | ACTION_VIEW |
| Yuzu | `org.yuzu.yuzu_emu`, `org.yuzu.android` | **nsw** | ACTION_VIEW |
| Yuzu Early Access | `org.yuzu.yuzu_emu.ea` | nsw | ACTION_VIEW |

<!-- emulators-table:end -->
