# PocketConsole-tools — Data QA Tracker

Tracks what is missing / unverified on the config repo (`tools/PocketConsole-tools`,
the single source of truth) so it's easy to resume later and mark things done. This
is **data/content QA only** — real websites, downloadable apps, icons, launch recipes,
config completeness. Reference sources: `repo.md`.

**How to use:** tick `[x]` as a check lands. Numbers from the last audit (2026-08-15):
135 emulator ids, 119 systems, 143 catalog packages, 132 icon files, **25 emulators
without a real icon** (§4A).

## 0. Coverage gap — emulators not yet in the config

Daijishō has 159 unique player packages; 59 are covered → **~100 missing**. The last
full diff (2026-08-15) is recorded in this repo's session history; re-run the ingester
(`scripts/` in tools) to refresh the numbers. Split by kind:

- [ ] **Real standalone emulators** to add as new ids (~55): Winlator + CMod + MiceWine
      (Windows-on-Android), CEMU (Wii U), AX360E / X360 Mobile (Xbox 360), aenu.aps3e
      (PS3), Vita3K real package `org.vita3k.emulator` (Vita), SuperModel3 (Model 3),
      PICO-8 (picpic / Infinity / godot wrapper), J2ME loaders
      (`ru.playsoftware.j2meloader`, `ru.woesss.j2meloader`), Ruffle / Swiff /
      FlashPlayer (Flash), VVB (Virtual Boy), SwanEmu (WonderSwan/WSC), DroidArcadia
      (Arcadia 2001 / VC4000), idTech4A (DIII4A), MasterGear, SkyEmu, LinkBoy,
      Pizza Boy SC Pro / GBA, X1BOX / Haku X (Xbox), ARMSX variants (PS1/PS2), EmuCore
      (PS2/Vita), plus Apple II / BBC Micro / Oric standalone players if any exist.
- [ ] **Fork / variant packages** folded into existing ids (~30): Dolphin MMJR / MMJR2 /
      PrimeHack / Ishiiruka / debug (10), Citra canary + Azahar Plus / Borked3DS /
      Mandarine (7), AetherSX2 Turnip / custom builds (3), Yuzu/Suyu/Eden-nightly forks
      (5), melonDS dev/nightly/dual, PPSSPP legacy, My Boy! free variants,
      M64Plus FZ Pro / alpha.
- [ ] **Any-system media/streaming apps** → `config/apps.json` (~15): video players
      (VLC, MPV, MX Player, NextPlayer, Nova, Kodi), PDF readers (KOReader, Readera,
      foobnix, Axet), Moonlight, Xbox Game Pass, Steam/GameHub streaming hubs.
- [ ] **New systems** with standalone players: Apple II, BBC Micro, Oric, Sega Model 3,
      Flash, WonderSwan (SwanEmu), Xbox / Xbox 360 / PS3 / Vita / Wii U (CEMU) /
      Windows (Winlator) — mirror each into the system list + a RetroArch-core preset
      where one exists.

## 1. Global per-emulator QA (applies to EVERY entry)

Every emulator in `config/systems.json` `emulators[]` must satisfy all of the below.
Verify per batch and tick the row in §2 when the entry is fully green.

- [ ] **Website is real**: `siteUrl` is the app's actual site/repo (not a store URL
      passed off as a site, not a typo, not dead).
- [ ] **Still downloadable**: `playStoreUrl` opens a live Play Store app page (not 404);
      where the app was removed from Play, there is an `apkUrl` (GitHub/archive release)
      or the entry is deliberately marked `website only` (no dead Play link left).
- [ ] **Has a download link at all**: every emulator must expose at least one install path
      — a `playStoreUrl`, an `apkUrl`, or a `siteUrl` that visibly offers a download.
      An entry with none of the three is broken and MUST be fixed (see §3A).
- [ ] **Icon present**: `config/emulator-icons/<id>.png` exists and is a real icon
      (not `missing---<id>.png`, not blank/placeholder art).
- [ ] **Launch recipe correct**: `activity` / `launchArgs` match what the app actually
      accepts (cross-check against Daijishō platform JSONs / ES-DE XML, or an on-device
      launch). Content-URI recipes preferred over raw paths (scoped storage).
- [ ] **Systems assigned**: the emulator is referenced by at least one `systems[]`
      entry (or listed as a frontend in `apps.json`).
- [ ] **Mirrored**: the package appears in the offline fallback
      `src/domain/emulators/catalog.ts` (consistency test enforces this).

## 2. Per-emulator verification tracker

Legend: `[x]` = all §1 checks verified green. ⚠ = known issue (see §4). One row per id.

### RetroArch family
- [ ] `retroarch` — com.retroarch — Play + buildbot APK
- [ ] `retroarch-plus` — com.retroarch.aarch64 — Play + buildbot APK
- [ ] `retroarch-32` — com.retroarch.ra32 — buildbot APK only (no Play)

### Multi-system frontends
- [ ] `lemuroid` — com.swordfish.lemuroid
- [ ] `classicboy` — com.portableandroid.classicboy
- [ ] `classicboy-lite` — com.portableandroid.classicboyLite

### .emu suite (ExPlusAlpha) — site https://www.explusalpha.com/
- [ ] `a2600-emu` — com.explusalpha.A2600Emu
- [ ] `c64-emu` — com.explusalpha.C64Emu
- [ ] `gba-emu` — com.explusalpha.GbaEmu
- [ ] `gbc-emu` — com.explusalpha.GbcEmu
- [ ] `lynx-emu` — com.explusalpha.LynxEmu
- [ ] `md-emu` — com.explusalpha.MdEmu
- [ ] `msx-emu` — com.explusalpha.MsxEmu
- [ ] `n64-emu` — com.explusalpha.N64Plus
- [ ] `neo-emu` — com.explusalpha.NeoEmu ⚠ casing to verify (Daijishō lists `com.explusalpha.neoemu`)
- [ ] `nes-emu` — com.explusalpha.NesEmu
- [ ] `ngp-emu` — com.explusalpha.NgpEmu
- [ ] `pce-emu` — com.explusalpha.PceEmu ⚠ casing to verify (Daijishō lists `com.PceEmu`)
- [ ] `psx-emu` — com.explusalpha.PsxEmu
- [ ] `saturn-emu` — com.explusalpha.SaturnEmu
- [ ] `snes9x-ex` — com.explusalpha.Snes9xPlus

### Nintendo — NDS / 3DS
- [ ] `drastic` — com.dsemu.drastic
- [ ] `melonds` — me.magnum.melonds
- [ ] `citra` — org.citra.citra ⚠ Play removed (C&D) — needs apkUrl or site-only
- [ ] `citra-mmj` — org.citra.citra_emu, org.github.weihuoya.citra ⚠ Play removed — needs apkUrl
- [ ] `citra-nightly` — org.citra.emu ⚠ Play removed — needs apkUrl
- [ ] `azahar` — io.github.lime3ds.android
- [ ] `mikage` — com.mikageinc.mikage
- [ ] `panda3ds` — com.alber.panda3ds

### Nintendo — NES / SNES / GB / GBC / GBA handhelds
- [ ] `nes-droid` — ca.halsafar.nesdroid
- [ ] `snes-droid` — ca.halsafar.snesdroid
- [ ] `gb-droid` — ca.halsafar.mgbadroid
- [ ] `gba-droid` — ca.halsafar.gambattedroid
- [ ] `gbcc` — com.philj56.gbcc
- [ ] `my-boy` — com.fastemulator.gba
- [ ] `my-oldboy` — com.fastemulator.gbc
- [ ] `myboy-free` — com.fastemulator.gbafree
- [ ] `john-gba` — com.johnemulators.johngba
- [ ] `john-gba-lite` — com.johnemulators.johngbac
- [ ] `john-gbc` — com.johnemulators.johngbc
- [ ] `john-nes` — com.johnemulators.johnness
- [ ] `pizzaboy` — it.dbtecno.pizzaboy
- [ ] `pizzaboy-pro` — it.dbtecno.pizzaboypro
- [ ] `pizzaboy-c` — it.dbtecno.pizzaboyc
- [ ] `pizzaboy-cpro` — it.dbtecno.pizzaboycpro
- [ ] `nostalgia-gba` — com.nostalgiaemulators.gbalite
- [ ] `nostalgia-gba-pro` — com.nostalgiaemulators.gbapro
- [ ] `nostalgia-gbc` — com.nostalgiaemulators.gbclite
- [ ] `nostalgia-gbc-pro` — com.nostalgiaemulators.gbcpro
- [ ] `nostalgia-gg` — com.nostalgiaemulators.gglite
- [ ] `nostalgia-nes` — com.nostalgiaemulators.neslite
- [ ] `nostalgia-nes-pro` — com.nostalgiaemulators.nespro
- [ ] `nostalgia-snes` — com.nostalgiaemulators.sneslite
- [ ] `nostalgia-snes-pro` — com.nostalgiaemulators.snespro
- [ ] `superretro16` — com.neutronemulation.super_retro_16
- [ ] `superretro16-lite` — com.bubblezapgames.supergnes_lite
- [ ] `supergnes` — com.bubblezapgames.supergnes
- [ ] `superzsnes` — com.zsnes.superzsnes
- [ ] `unityboyadvance` — com.Rekkuzan.UnityBoyAdvance
- [ ] `network-gba` — com.hqgame.networkgba
- [ ] `network-nes` — com.hqgame.networknes
- [ ] `network-snes` — com.hqgame.networksnes
- [ ] `gbcoid` — com.androidemu.gbc
- [ ] `gearoid` — com.androidemu.gg
- [ ] `nesoid` — com.androidemu.nes
- [ ] `masteremu` — uk.co.philpotter.masteremu

### Nintendo — N64 / GameCube / Wii / Switch
- [ ] `mupen64plus-ae` — org.mupen64plusae, paulscode.android.mupen64plusae
- [ ] `m64plus-fz` — org.mupen64plusae.v3.fzurita
- [ ] `m64plus-fz-pro` — org.mupen64plusae.v3.fzurita.pro
- [ ] `n64oid` — com.mop.ide.n64oid
- [ ] `nood` — com.hydra.noods
- [ ] `dolphin` — org.dolphinemu.dolphinemu, com.dolphin.emulator, org.dolphin.dolphinemu
- [ ] `dolphin-retroid` — org.dolphinemu.handheld
- [ ] `yuzu` — org.yuzu.yuzu_emu, org.yuzu.android ⚠ Play removed — needs apkUrl
- [ ] `yuzu-ea` — org.yuzu.yuzu_emu.ea ⚠ Play removed — needs apkUrl
- [ ] `yuzu-retroshark` — io.retroshark.yuzu ⚠ Play removed — needs apkUrl
- [ ] `eden` — dev.eden.eden_emulator ⚠ Play removed — needs apkUrl
- [ ] `sudachi` — org.sudachi.sudachi_emu ⚠ Play removed — needs apkUrl
- [ ] `citron` — org.citron.citron_emu ⚠ Play removed — needs apkUrl
- [ ] `skyline` — emu.skyline ⚠ Play removed + casing to verify (Daijishō: `skyline.emu`)
- [ ] `strato` — emu.strato ⚠ Play removed + casing to verify (Daijishō: `org.stratoemu.strato`)
- [ ] `nyushu` — emuready.nyushu.ABenchMark — website only
- [ ] `egg-ns` — com.xiaoji.gamesirnsemulator.x.google ⚠ Play removed — needs apkUrl

### Sony
- [ ] `duckstation` — com.github.stenzek.duckstation ⚠ launch recipe must be validated on-device
- [ ] `epsxe` — com.epsxe.ePSXe
- [ ] `fpse` — com.emulator.fpse
- [ ] `fpse64` — com.emulator.fpse64
- [ ] `silverarrow` — com.jabosoft.silverarrow
- [ ] `aethersx2` — xyz.aethersx2.android ⚠ Play removed — needs apkUrl
- [ ] `nethersx2` — xyz.aether.sx2 ⚠ Play removed — needs apkUrl (GitHub)
- [ ] `play` — com.virtualapplications.play
- [ ] `damonps2` — com.damonplay.damonps2.free ⚠ verify Play availability
- [ ] `armsx3` — com.armsx3 — APK only (has apkUrl)
- [ ] `ppsspp` — org.ppsspp.ppsspp
- [ ] `ppsspp-gold` — org.ppsspp.ppssppgold
- [ ] `vita3k` — com.github.eka2l1 ⚠ **WRONG package** — real Vita3K Android is `org.vita3k.emulator`

### Sega
- [ ] `flycast` — com.flycast.emulator
- [ ] `reicast` — com.reicast.emulator
- [ ] `redream` — io.recompiled.redream
- [ ] `yabasanshiro2` — org.devmiyax.yabasanshioro2
- [ ] `yaba-sanshiro` — org.uoyabause.android
- [ ] `yaba-sanshiro-pro` — org.uoyabause.android.pro
- [ ] `yaba-sanshiro-2-pro` — org.devmiyax.yabasanshioro2.pro
- [ ] `yabause` — org.bbflight.yabause
- [ ] `genesis-droid` — ca.halsafar.genesisdroid
- [ ] `gensoid` — com.androidemu.gens

### Atari / classic consoles
- [ ] `virtualjaguar` — org.icculus.virtualjaguar
- [ ] `iratajaguar` — ru.vastness.altmer.iratajaguar
- [ ] `kat5200` — com.jillybunch.kat5200
- [ ] `colem` — com.fms.colem ⚠ no icon
- [ ] `colem-deluxe` — com.fms.colem.deluxe
- [ ] `jzintv` — org.libsdl.jzintv4droid2 ⚠ no icon
- [ ] `vecdroid` — com.willna.vecdroid ⚠ no icon
- [ ] `real3doplayer` — ru.vastness.altmer.real3doplayer
- [ ] `fmsx` — com.fms.fmsx
- [ ] `openmsx` — org.openmsx.android.openmsx
- [ ] `ataroid` — com.androidemu.atari

### Arcade / MAME
- [ ] `mame4droid` — com.seleuco.mame4droid
- [ ] `mame4droid-current` — com.seleuco.mame4d2024
- [ ] `mame4droid-m4a` — com.seleuco.mame4all

### Computers / DOS / engines
- [ ] `scummvm` — org.scummvm.scummvm
- [ ] `residualvm` — org.residualvm.residualvm
- [ ] `magic-dosbox` — bruenor.magicbox
- [ ] `dosbox-turbo` — com.fishstix.dosbox
- [ ] `afreebox` — com.fishstix.dosboxfree
- [ ] `andosbox` — com.locnet.dosbox
- [ ] `bochs` — net.sourceforge.bochs
- [ ] `uae4all` — org.ab.uae
- [ ] `uae4all2` — atua.anddev.uae4all2
- [ ] `uae4droid` — com.locnet.uae
- [ ] `vice` — com.locnet.vice
- [ ] `c64-ab` — org.ab.c64
- [ ] `c64-jahnke` — de.joergjahnke.c64.android
- [ ] `delta-touch` — com.opentouchgaming.gzdoomfree
- [ ] `delta-touch-full` — com.opentouchgaming.gzdoom

## 3. Downloadability — apps likely removed from Play (need an `apkUrl` or `website only`)

Verify each on Play Store; where gone, add a GitHub/archive `apkUrl` to the entry or
mark it website-only (never leave a dead `playStoreUrl`):

- [ ] `yuzu` / `yuzu-ea` / `yuzu-retroshark` — Yuzu line (removed)
- [ ] `skyline` / `strato` — dead projects
- [ ] `eden` / `sudachi` / `citron` / `egg-ns` — removed
- [ ] `citra` / `citra-nightly` / `citra-mmj` — removed (C&D)
- [ ] `aethersx2` / `nethersx2` — removed (Sony takedown)
- [ ] `damonps2` — verify still listed
- [ ] `vita3k` — verify listing (package currently wrong — §4)
- [ ] `nyushu` — website only by design
- [ ] `armsx3` / `retroarch-32` — already APK-only (confirm apkUrl still resolves)

### 3A. No download link at all — MUST be fixed

These 21 entries have neither a `playStoreUrl` nor an `apkUrl` (and mostly no site that
sells/downloads the app), so the app can't offer Install / Get it for them. Each needs a
real Play Store link (they exist on Play — paid/niche apps), an `apkUrl` (GitHub/archive),
or a `siteUrl` that actually offers a download:

- [ ] `nyushu` — emuready.nyushu.ABenchMark (site only — verify any real download source)
- [ ] `ataroid` — com.androidemu.atari
- [ ] `gbcoid` — com.androidemu.gbc
- [ ] `gearoid` — com.androidemu.gg
- [ ] `gensoid` — com.androidemu.gens
- [ ] `nesoid` — com.androidemu.nes
- [ ] `m64plus-fz-pro` — org.mupen64plusae.v3.fzurita.pro
- [ ] `my-oldboy` — com.fastemulator.gbc
- [ ] `myboy-free` — com.fastemulator.gbafree
- [ ] `superretro16-lite` — com.bubblezapgames.supergnes_lite
- [ ] `supergnes` — com.bubblezapgames.supergnes
- [ ] `colem-deluxe` — com.fms.colem.deluxe
- [ ] `dolphin-retroid` — org.dolphinemu.handheld
- [ ] `yaba-sanshiro` — org.uoyabause.android
- [ ] `yaba-sanshiro-pro` — org.uoyabause.android.pro
- [ ] `yaba-sanshiro-2-pro` — org.devmiyax.yabasanshioro2.pro
- [ ] `real3doplayer` — ru.vastness.altmer.real3doplayer
- [ ] `iratajaguar` — ru.vastness.altmer.iratajaguar
- [ ] `vecdroid` — com.willna.vecdroid
- [ ] `colem` — com.fms.colem
- [ ] `jzintv` — org.libsdl.jzintv4droid2

## 4. Known defects found in the 2026-08-15 audit

- [ ] **`vita3k` wrong package**: config uses `com.github.eka2l1`; real Vita3K Android
      package is `org.vita3k.emulator`.
- [ ] **Package casing to verify on Play Store**: Neo.emu (`com.explusalpha.NeoEmu` vs
      `com.explusalpha.neoemu`), PCE.emu (`com.explusalpha.PceEmu` vs `com.PceEmu`),
      Skyline (`emu.skyline` vs `skyline.emu`), Strato (`emu.strato` vs
      `org.stratoemu.strato`).
- [ ] **DuckStation psx entry**: system-level `activity` still `…/.EmulationActivity`
      (should match the master `.MainActivity` content-URI recipe).
- [ ] **Link hygiene**: some `siteUrl` values are store URLs used as sites (halsafar /
      Network / MAME4droid entries) — replace with a real site where one exists.

### 4A. Icon coverage — every emulator needs a real icon (target 100%)

25 emulators currently have NO real icon (3 have no file at all, 22 have only a
`missing---<id>.png` placeholder). Add real art (`config/emulator-icons/<id>.png` via
`node scripts/fetch-emulator-icons.mjs` or manual) and tick the row. Regenerate the icon
manifest after each batch. `missing---<id>.png` = NOT done.

**No icon file at all (3):**
- [ ] `colem` — com.fms.colem
- [ ] `jzintv` — org.libsdl.jzintv4droid2
- [ ] `vecdroid` — com.willna.vecdroid

**Placeholder only (22):**
- [ ] `ataroid` — com.androidemu.atari
- [ ] `citra` — org.citra.citra
- [ ] `delta-touch` — com.opentouchgaming.gzdoomfree
- [ ] `delta-touch-full` — com.opentouchgaming.gzdoom
- [ ] `dolphin-retroid` — org.dolphinemu.handheld
- [ ] `mikage` — com.mikageinc.mikage
- [ ] `n64-emu` — com.explusalpha.N64Plus
- [ ] `n64oid` — com.mop.ide.n64oid
- [ ] `nethersx2` — xyz.aether.sx2
- [ ] `nostalgia-gba-pro` — com.nostalgiaemulators.gbapro
- [ ] `nostalgia-gbc-pro` — com.nostalgiaemulators.gbcpro
- [ ] `nostalgia-nes-pro` — com.nostalgiaemulators.nespro
- [ ] `nostalgia-snes` — com.nostalgiaemulators.sneslite
- [ ] `nostalgia-snes-pro` — com.nostalgiaemulators.snespro
- [ ] `panda3ds` — com.alber.panda3ds
- [ ] `pizzaboy-c` — it.dbtecno.pizzaboyc
- [ ] `pizzaboy-cpro` — it.dbtecno.pizzaboycpro
- [ ] `psx-emu` — com.explusalpha.PsxEmu
- [ ] `strato` — emu.strato
- [ ] `unityboyadvance` — com.Rekkuzan.UnityBoyAdvance
- [ ] `yaba-sanshiro-pro` — org.uoyabause.android.pro
- [ ] `yuzu-retroshark` — io.retroshark.yuzu

**Icon coverage counter:** `[ ]/25` done. Also: every NEW emulator imported from the
Daijishō ingest (§0) must land with a real icon (or placeholder flagged here) — the icon
manifest check in `validate.mjs` keeps the list honest.

## 5. Systems QA

- [ ] **3 systems with empty emulator lists**: `fmtowns`, `wiiu`, `xbox360` — add
      emulators or mark intentionally unsupported.
- [ ] **7 systems with no RetroArch core data**: `fmtowns`, `wiiu`, `nsw`, `windows`,
      `ps3`, `psvita`, `xbox360` — add a `core`/`cores` preset where one exists.
- [ ] **Favourites**: confirm at most one `favourite: true` per system (validator
      enforces; re-check after any system edit).

## 6. Docs

- [ ] README emulator table + `docs/android-emulators.md` regenerated
      (`node tools/PocketConsole-tools/scripts/gen-emulator-docs.mjs`, never hand-edited)
      after any of the above lands.

## How to refresh the numbers

Run the tools scripts in order: ingest reference DBs (`scripts/ingest-*`) → regenerate
`systems.json` (`scripts/build-master-config.mjs`) → validate (`scripts/validate.mjs`) →
re-diff against `src/domain/emulators/catalog.ts` for the coverage gap in §0. Links and
fetch recipes for every source are in `repo.md`.
