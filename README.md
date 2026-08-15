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

PocketConsole-tools ships **122 systems** and **167 emulator apps** (164 standalone + the 3 RetroArch builds). Full launch commands live in [docs/android-emulators.md](docs/android-emulators.md).

### Standalone (non-RetroArch) emulators

| Emulator | Package(s) | Systems (bold = default) | Launch |
|---|---|---|---|
| 2600.emu | `com.explusalpha.A2600Emu` | **atari2600** | custom args |
| AetherSX2 | `xyz.aethersx2.android`, `xyz.aethersx2.custom`, `xyz.aethersx2.tturnip`, `xyz.aethersx2.cturnip` | **ps2** | custom args |
| aFreeBox | `com.fishstix.dosboxfree` | dos | ACTION_VIEW |
| anDOSBox | `com.locnet.dosbox` | dos | ACTION_VIEW |
| APS3E | `aenu.aps3e` | ps3 | custom args |
| ARMSX3 | `com.armsx3`, `com.nanodata.armsx`, `come.nanodata.armsx2`, `come.nanodata.armsx2.debug`, `com.armsx2` | **ps3** | custom args |
| Ataroid | `com.androidemu.atari` | atari2600 | custom args |
| AX360E | `aenu.ax360e`, `aenu.ax360e.free` | xbox360 | custom args |
| Azahar | `io.github.lime3ds.android`, `org.azahar_emu.azahar`, `io.github.azaharplus.android` | n3ds | custom args |
| Bochs | `net.sourceforge.bochs` | **windows** | ACTION_VIEW |
| Borked3DS | `io.github.borked3ds.android` | n3ds | custom args |
| C64 | `de.joergjahnke.c64.android` | c64 | ACTION_VIEW |
| C64 | `org.ab.c64` | c64 | ACTION_VIEW |
| C64.emu | `com.explusalpha.C64Emu` | c64 | custom args |
| CEMU | `info.cemu.cemu` | wiiu | custom args |
| Citra (MMJ) | `org.citra.citra_emu`, `org.github.weihuoya.citra`, `org.citra.citra_emu.canary`, `org.gamerytb.lemonade.canary` | n3ds | custom args |
| Citra (nightly) | `org.citra.emu` | n3ds | custom args |
| Citra | `org.citra.citra` | **n3ds** | ACTION_VIEW |
| Citron | `org.citron.citron_emu` | nsw | custom args |
| ClassicBoy Lite | `com.portableandroid.classicboyLite` | mame, pce, tg16, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, ngpc, psx | ACTION_VIEW |
| ClassicBoy Pro | `com.portableandroid.classicboy` | mame, pce, tg16, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, ngpc, psx | ACTION_VIEW |
| ColEm | `com.fms.colem` | colecovision | ACTION_VIEW |
| ColEm Deluxe | `com.fms.colem.deluxe` | colecovision | ACTION_VIEW |
| DamonPS2 | `com.damonplay.damonps2.free` | ps2 | ACTION_VIEW |
| Dolphin (Retroid fork) | `org.dolphinemu.handheld` | gcn, wii | custom args |
| Dolphin | `org.dolphinemu.dolphinemu`, `com.dolphin.emulator`, `org.dolphin.dolphinemu`, `org.mm.jr`, `org.mm.j`, `org.dolphinemu.mmjr`, `org.dolphinemu.mmjr3`, `org.dolphin.ishiirukadark`, `org.dolphinemu.primehack`, `org.shiiion.primehack`, `org.dolphinemu.dolphinemu.debug`, `com.joeyos.dolphinemu` | **gcn, ngc, wii** | custom args |
| DOSBox Turbo | `com.fishstix.dosbox` | dos | ACTION_VIEW |
| DraStic | `com.dsemu.drastic` | nds | custom args |
| DroidArcadia | `com.amigan.droidarcadia` | arcadia2001 | custom args |
| DuckStation | `com.github.stenzek.duckstation` | **psx** | custom args |
| Eden | `dev.eden.eden_emulator`, `dev.legacy.eden_emulator`, `dev.eden.eden_nightly`, `dev.eden.eden_emulator.nightly` | nsw | custom args |
| Egg NS | `com.xiaoji.gamesirnsemulator.x.google` | nsw | ACTION_VIEW |
| EmuCore V | `com.sbro.emucorev` | psvita | custom args |
| EmuCore X | `com.sbro.emucorex` | ps2 | custom args |
| ePSXe | `com.epsxe.ePSXe` | psx | custom args |
| Flash Player | `com.issess.flashplayer` | flash | custom args |
| Flash Player Pro | `com.issess.flashplayerpro` | flash | custom args |
| Flycast | `com.flycast.emulator` | **dreamcast, atomiswave** | custom args |
| fMSX | `com.fms.fmsx` | **msx** | ACTION_VIEW |
| FPse | `com.emulator.fpse` | psx | custom args |
| FPse 64 | `com.emulator.fpse64` | psx | custom args |
| GameBoy Advanced droid | `ca.halsafar.gambattedroid` | gba | ACTION_VIEW |
| GameBoy droid | `ca.halsafar.mgbadroid` | gb, gbc | ACTION_VIEW |
| GBA.emu | `com.explusalpha.GbaEmu` | gba | custom args |
| GBC.emu | `com.explusalpha.GbcEmu` | gb, gbc | custom args |
| gbcc | `com.philj56.gbcc` | gb, gbc | ACTION_VIEW |
| GBCoid | `com.androidemu.gbc` | gb, gbc | ACTION_VIEW |
| Gearoid | `com.androidemu.gg` | gg, sms | custom args |
| GenesisDroid | `ca.halsafar.genesisdroid` | genesis, megadrive | ACTION_VIEW |
| Gensoid | `com.androidemu.gens` | genesis, megadrive | custom args |
| GZDoom (Delta Touch Full) | `com.opentouchgaming.gzdoom` | doom | ACTION_VIEW |
| GZDoom (Delta Touch) | `com.opentouchgaming.gzdoomfree` | **doom** | ACTION_VIEW |
| Haku | `com.rfandango.haku_x` | xbox | custom args |
| Infinity | `me.dt2dev.infinity` | pico8 | custom args |
| IrataJaguar | `ru.vastness.altmer.iratajaguar` | jaguar | custom args |
| J2ME Loader (woesss) | `ru.woesss.j2meloader` | j2me | custom args |
| J2ME Loader | `ru.playsoftware.j2meloader` | j2me | custom args |
| John GBA | `com.johnemulators.johngba` | gba | ACTION_VIEW |
| John GBA Lite | `com.johnemulators.johngbac` | gba | ACTION_VIEW |
| John GBC | `com.johnemulators.johngbc` | gb, gbc | ACTION_VIEW |
| John NES | `com.johnemulators.johnness` | nes | ACTION_VIEW |
| jzIntv | `org.libsdl.jzintv4droid2` | intellivision | ACTION_VIEW |
| kat5200 | `com.jillybunch.kat5200` | **atari5200** | ACTION_VIEW |
| Kenjinx | `org.benjisc.android`, `org.kenjinx.android` | nsw | custom args |
| Lemuroid | `com.swordfish.lemuroid` | **lynx, pce, tg16, gb, gbc, gg, sms** | ACTION_VIEW |
| LinkBoy | `com.pixelrespawn.linkboy` | gb | custom args |
| Lynx.emu | `com.explusalpha.LynxEmu` | lynx | custom args |
| M64Plus FZ | `org.mupen64plusae.v3.fzurita` | n64 | custom args |
| M64Plus FZ Pro | `org.mupen64plusae.v3.fzurita.pro` | n64 | custom args |
| Magic DOSBox | `bruenor.magicbox` | **dos** | ACTION_VIEW |
| MAME4droid (2024) | `com.seleuco.mame4d2024` | mame, fba | custom args |
| MAME4droid (MAME4All) | `com.seleuco.mame4all` | mame | ACTION_VIEW |
| MAME4droid | `com.seleuco.mame4droid` | **mame, fba** | custom args |
| Mandarine | `io.github.mandarine3ds.mandarine` | n3ds | custom args |
| MasterEmu | `uk.co.philpotter.masteremu` | gg, sms | ACTION_VIEW |
| MasterGear | `com.fms.mg` | gg | custom args |
| MD.emu | `com.explusalpha.MdEmu` | **genesis, megadrive** | custom args |
| melonDS | `me.magnum.melonds`, `me.magnum.melonds.nightly`, `me.magnum.melonds.dev`, `me.magnum.melondualds` | **nds** | custom args |
| MiceWine | `com.micewine.emu` | windows | custom args |
| Mikage | `com.mikageinc.mikage` | n3ds | ACTION_VIEW |
| MSX.emu | `com.explusalpha.MsxEmu` | msx | custom args |
| Mupen64Plus AE | `org.mupen64plusae`, `paulscode.android.mupen64plusae`, `org.mupen64plusae.v3.alpha` | **n64** | custom args |
| My Boy! | `com.fastemulator.gba` | **gba** | custom args |
| My Boy! Free | `com.fastemulator.gbafree` | gba | custom args |
| My OldBoy! | `com.fastemulator.gbc`, `com.fastemulator.gbcfree` | gb, gbc | custom args |
| N64.emu | `com.explusalpha.N64Plus` | n64 | ACTION_VIEW |
| N64oid | `com.mop.ide.n64oid` | n64 | ACTION_VIEW |
| NEO.emu | `com.explusalpha.NeoEmu`, `com.explusalpha.neoemu` | mame, fba | custom args |
| NES.emu | `com.explusalpha.NesEmu` | **nes** | custom args |
| NESdroid | `ca.halsafar.nesdroid` | nes | ACTION_VIEW |
| NESoid | `com.androidemu.nes` | nes | custom args |
| NetherSX2 | `xyz.aether.sx2` | ps2 | ACTION_VIEW |
| Network GBA | `com.hqgame.networkgba` | gba | ACTION_VIEW |
| Network NES | `com.hqgame.networknes` | nes | ACTION_VIEW |
| Network SNES | `com.hqgame.networksnes` | snes | ACTION_VIEW |
| NGP.emu | `com.explusalpha.NgpEmu` | **ngpc** | custom args |
| Nood (N64) | `com.hydra.noods` | nds, n64 | custom args |
| Nostalgia.GBA | `com.nostalgiaemulators.gbalite` | gba | ACTION_VIEW |
| Nostalgia.GBA Pro | `com.nostalgiaemulators.gbapro` | gba | ACTION_VIEW |
| Nostalgia.GBC | `com.nostalgiaemulators.gbclite` | gb, gbc | ACTION_VIEW |
| Nostalgia.GBC Pro | `com.nostalgiaemulators.gbcpro` | gb, gbc | ACTION_VIEW |
| Nostalgia.GG | `com.nostalgiaemulators.gglite` | gg, sms | ACTION_VIEW |
| Nostalgia.NES | `com.nostalgiaemulators.neslite` | nes | ACTION_VIEW |
| Nostalgia.NES Pro | `com.nostalgiaemulators.nespro` | nes | ACTION_VIEW |
| Nostalgia.SNES | `com.nostalgiaemulators.sneslite` | snes | ACTION_VIEW |
| Nostalgia.SNES Pro | `com.nostalgiaemulators.snespro` | snes | ACTION_VIEW |
| Nyushu | `emuready.nyushu.ABenchMark` | nsw | ACTION_VIEW |
| openMSX | `org.openmsx.android.openmsx` | msx | ACTION_VIEW |
| Panda3DS | `com.alber.panda3ds` | n3ds | ACTION_VIEW |
| PCE.emu | `com.explusalpha.PceEmu`, `com.PceEmu` | pce, tg16, supergrafx | custom args |
| PICO-8 Launcher | `io.wip.pico8` | pico8 | custom args |
| PicPic | `com.sa_moo_rai.picpic` | pico8 | custom args |
| Pizza Boy | `it.dbtecno.pizzaboy`, `it.dbtecno.pizzaboygba` | gb, gba | custom args |
| Pizza Boy C | `it.dbtecno.pizzaboyc` | gb, gbc | ACTION_VIEW |
| Pizza Boy C Pro | `it.dbtecno.pizzaboycpro`, `it.dbtecno.pizzaboyscpro` | gb, gbc, gg | custom args |
| Pizza Boy Pro | `it.dbtecno.pizzaboypro`, `it.dbtecno.pizzaboygbapro` | gb, gba | custom args |
| Play! | `com.virtualapplications.play` | ps2 | ACTION_VIEW |
| PPSSPP | `org.ppsspp.ppsspp`, `org.ppsspp.ppsspplegacy` | **psp** | custom args |
| PPSSPP Gold | `org.ppsspp.ppssppgold` | psp | custom args |
| PSX.emu | `com.explusalpha.PsxEmu` | psx | ACTION_VIEW |
| Real3DOPlayer | `ru.vastness.altmer.real3doplayer` | 3do | custom args |
| Redream | `io.recompiled.redream` | dreamcast, atomiswave | custom args |
| Reicast | `com.reicast.emulator` | dreamcast, atomiswave | custom args |
| ResidualVM | `org.residualvm.residualvm` | scummvm | ACTION_VIEW |
| Ruffle | `rs.ruffle` | flash | custom args |
| Saturn.emu | `com.explusalpha.SaturnEmu` | saturn | custom args |
| ScummVM | `org.scummvm.scummvm`, `org.scummvm.scummvm.debug` | **scummvm** | custom args |
| SilverArrow | `com.jabosoft.silverarrow` | psx | ACTION_VIEW |
| SkyEmu | `com.sky.SkyEmu` | nds | custom args |
| Skyline | `emu.skyline`, `skyline.emu` | nsw | custom args |
| Snes9x EX+ | `com.explusalpha.Snes9xPlus` | **snes, sfc** | custom args |
| SNESdroid | `ca.halsafar.snesdroid` | snes | ACTION_VIEW |
| Strato | `emu.strato`, `org.stratoemu.strato` | nsw | custom args |
| Sudachi | `org.sudachi.sudachi_emu`, `org.sudachi.sudachi_emu.ea` | nsw | custom args |
| Supermodel 3 | `com.izzy2lost.super3` | model3 | custom args |
| SuperRetro16 | `com.bubblezapgames.supergnes` | snes | ACTION_VIEW |
| SuperRetro16 | `com.neutronemulation.super_retro_16` | gb, gbc, gba, snes | ACTION_VIEW |
| SuperRetro16 Lite | `com.bubblezapgames.supergnes_lite` | snes | ACTION_VIEW |
| SuperZSNES | `com.zsnes.superzsnes` | snes | ACTION_VIEW |
| Suyu | `dev.suyu.suyu_emu.relWithDebInfo` | nsw | custom args |
| SwanEmu | `com.explusalpha.SwanEmu` | wonderswan | custom args |
| Swiff | `io.navivani.swiff` | flash | custom args |
| UAE4All | `org.ab.uae` | amiga | ACTION_VIEW |
| UAE4All2 | `atua.anddev.uae4all2` | **amiga** | ACTION_VIEW |
| UAE4Droid | `com.locnet.uae` | amiga | ACTION_VIEW |
| UnityBoyAdvance | `com.Rekkuzan.UnityBoyAdvance` | gba | ACTION_VIEW |
| VecDroid | `com.willna.vecdroid` | vectrex | ACTION_VIEW |
| VICE | `com.locnet.vice` | **c64** | ACTION_VIEW |
| Virtual Jaguar | `org.icculus.virtualjaguar` | **jaguar** | ACTION_VIEW |
| VirtualBoy Go | `com.simongellis.vvb` | virtualboy | custom args |
| Vita3K | `org.vita3k.emulator`, `org.vita3k.emulator.ikhoeyZX` | **psvita** | custom args |
| Winlator (CMod) | `com.cmodded.winlator`, `com.winlator.cmod` | windows | custom args |
| Winlator | `com.winlator` | windows | custom args |
| X1BOX | `com.izzy2lost.x1box` | xbox | custom args |
| X360 Mobile | `emu.x360.mobile` | xbox360 | custom args |
| XenDroid | `xendroid.compose` | xbox360 | custom args |
| Yaba Sanshiro | `org.uoyabause.android` | saturn | custom args |
| Yaba Sanshiro 2 | `org.devmiyax.yabasanshioro2` | **saturn** | custom args |
| Yaba Sanshiro 2 Pro | `org.devmiyax.yabasanshioro2.pro` | saturn | custom args |
| Yaba Sanshiro Pro | `org.uoyabause.android.pro` | saturn | custom args |
| Yabause | `org.bbflight.yabause` | saturn | ACTION_VIEW |
| Yuzu (RetroShark) | `io.retroshark.yuzu` | nsw | ACTION_VIEW |
| Yuzu | `org.yuzu.yuzu_emu`, `org.yuzu.android` | **nsw** | custom args |
| Yuzu Early Access | `org.yuzu.yuzu_emu.ea` | nsw | custom args |

<!-- emulators-table:end -->
