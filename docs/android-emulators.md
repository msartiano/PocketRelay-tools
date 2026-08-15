# Android emulator launch commands

Generated from `config/systems.json` by `node scripts/gen-emulator-docs.mjs` — never hand-edit. Placeholders: `{file.path}` = real ROM path, `{file.uri}` / `{file.documenturi}` = content:// URI.

## RetroArch

Modern RetroArch (v1.7+) boots a game through its content activity, `RetroActivityFuture`, using the `ROM` + `LIBRETRO` + `CONFIGFILE` extras. This is the exact recipe the app sends (the core `.so` path and config path are resolved per installed build):

```
am start \
  -n com.retroarch/.browser.retroactivity.RetroActivityFuture \
  -a android.intent.action.MAIN \
  -e ROM {file.path} \
  -e LIBRETRO /data/data/com.retroarch/cores/<core>_libretro_android.so \
  -e CONFIGFILE /storage/emulated/0/Android/data/com.retroarch/files/retroarch.cfg \
  -e QUITFOCUS \
  -f FLAG_ACTIVITY_NEW_TASK -f FLAG_ACTIVITY_CLEAR_TASK -f FLAG_ACTIVITY_CLEAR_TOP -f FLAG_ACTIVITY_NO_HISTORY
```

For the 64-bit build use `com.retroarch.aarch64` (and `com.retroarch.ra32` for 32-bit); every core below is offered on all three builds. The app pins a core automatically from the system or from the `[Tag]` in the ROM filename.

### Per-system cores

| System | id | RetroArch cores |
|---|---|---|
| The 3DO Company - 3DO | `3do` | `opera_libretro`, `4do_libretro` |
| Commodore - Amiga | `amiga` | `puae_libretro`, `puae2021_libretro`, `uae4arm_libretro`, `fsuae_libretro` |
| Commodore - CD32 | `amigacd32` | `puae_libretro`, `puae2021_libretro` |
| Amstrad - CPC | `amstradcpc` | `cap32_libretro`, `crocods_libretro` |
| Arduboy | `arduboy` | `arduous_libretro` |
| Atari - 2600 | `atari2600` | `stella_libretro`, `stella2014_libretro` |
| Atari - 5200 | `atari5200` | `atari800_libretro`, `a5200_libretro` |
| Atari - 7800 | `atari7800` | `prosystem_libretro` |
| Atari - ST | `atarist` | `hatari_libretro` |
| Atomiswave | `atomiswave` | `flycast_libretro` |
| Elektronika - BK-0010/BK-0011 | `bk` | `bk_libretro` |
| Mr.Boom | `bomberman` | `mrboom_libretro` |
| Commodore - C128 | `c128` | `vice_x128_libretro` |
| Commodore - 64 | `c64` | `vice_x64_libretro`, `vice_x64sc_libretro`, `frodo_libretro`, `vice_xscpu64_libretro`, `x64sdl_libretro` |
| Commodore - CBM-II 6x0/7x0 | `cbm2` | `vice_xcbm2_libretro` |
| Commodore - CBM-II 5x0 | `cbm5x0` | `vice_xcbm5x0_libretro` |
| Philips - CD-i | `cdimono1` | `same_cdi_libretro`, `cdi2015_libretro` |
| ChaiLove | `chailove` | `chailove_libretro` |
| CHIP-8 | `chip8` | `emux_chip8_libretro` |
| Coleco - ColecoVision | `colecovision` | `gearcoleco_libretro` |
| Cruzes | `cruzes` | `cruzes_libretro` |
| Arcade | `daphne` | `daphne_libretro` |
| Dinothawr | `dinothawr` | `dinothawr_libretro` |
| DOOM | `doom` | `prboom_libretro`, `chocolate_doom_libretro`, `crispy_doom_libretro` |
| Doom 3 | `doom3` | `boom3_libretro`, `boom3_xp_libretro` |
| DOS | `dos` | `dosbox_pure_libretro`, `dosbox_svn_libretro`, `dosbox_core_libretro`, `dosbox_libretro`, `dosbox_svn_ce_libretro` |
| Sega - Dreamcast | `dreamcast` | `flycast_libretro`, `flycast_gles2_libretro`, `retrodream_libretro` |
| FBNeo - Arcade Games | `fba` | `fbneo_libretro`, `fbalpha2012_libretro`, `fbalpha_libretro`, `mame2003_plus_libretro`, `mame_libretro`, `fbalpha2012_cps1_libretro`, `fbalpha2012_cps2_libretro`, `fbalpha2012_cps3_libretro` |
| Flashback | `flashback` | `reminiscence_libretro` |
| Nintendo - Game Boy | `gb` | `sameboy_libretro`, `gambatte_libretro`, `bgb_libretro`, `gearboy_libretro`, `tgbdual_libretro`, `vba_next_libretro`, `emux_gb_libretro`, `fixgb_libretro` |
| Nintendo - Game Boy Advance | `gba` | `mgba_libretro`, `vba_m_libretro`, `vba_next_libretro`, `mednafen_gba_libretro`, `gpsp_libretro`, `meteor_libretro`, `tempgba_libretro`, `vbam_libretro` |
| Nintendo - Game Boy Color | `gbc` | `sameboy_libretro`, `gambatte_libretro`, `bgb_libretro`, `gearboy_libretro`, `tgbdual_libretro`, `vba_next_libretro` |
| Nintendo - GameCube | `gcn` | `dolphin_libretro`, `dolphin_launcher_libretro`, `ishiiruka_libretro` |
| Sega - Mega Drive - Genesis | `genesis` | `genesis_plus_gx_libretro`, `picodrive_libretro`, `blastem_libretro`, `clownmdemu_libretro` |
| Sega - Game Gear | `gg` | `genesis_plus_gx_libretro`, `gearboy_libretro`, `gearsystem_libretro` |
| Game Music Emu | `gme` | `gme_libretro` |
| Mattel - Intellivision | `intellivision` | `freeintv_libretro` |
| Java - J2ME | `j2me` | `squirreljme_libretro`, `freej2me_libretro` |
| Atari - Jaguar | `jaguar` | `virtualjaguar_libretro`, `cygne_libretro` |
| LowRes NX | `lowresnx` | `lowresnx_libretro` |
| Lua Engine | `lutro` | `lutro_libretro` |
| Atari - Lynx | `lynx` | `mednafen_lynx_libretro`, `holani_libretro`, `handy_libretro` |
| Apple - Macintosh | `macintosh` | `minivmac_libretro` |
| MAME | `mame` | `mame2003_plus_libretro`, `mame2003_libretro`, `mame2010_libretro`, `mame_libretro`, `mame2000_libretro`, `fbneo_libretro`, `fbalpha2012_libretro`, `fbalpha_libretro`, `hbmame_libretro`, `mame2003_midway_libretro`, `mame2009_libretro`, `mame2015_libretro`, `mame2016_libretro`, `mamearcade_libretro`, `mess2015_libretro`, `ume2015_libretro` |
| Sega - Genesis / Mega Drive | `megadrive` | `genesis_plus_gx_libretro`, `picodrive_libretro`, `blastem_libretro`, `clownmdemu_libretro`, `genesis_plus_gx_wide_libretro` |
| Mega Duck / Cougar Boy | `megaduck` | `sameduck_libretro` |
| MPV | `movie` | `mpv_libretro` |
| Microsoft - MSX | `msx` | `bluemsx_libretro`, `fmsx_libretro` |
| Microsoft - MSX2 | `msx2` | `bluemsx_libretro`, `fmsx_libretro` |
| PocketCDG | `music` | `pocketcdg_libretro` |
| Nintendo - Nintendo 3DS | `n3ds` | `citra_libretro`, `citra2018_libretro`, `citra_canary_libretro` |
| Nintendo - Nintendo 64 | `n64` | `mupen64plus_next_libretro`, `parallel_n64_libretro`, `mupen64plus_next_develop_libretro`, `mupen64plus_next_gles2_libretro`, `mupen64plus_next_gles3_libretro`, `parallel_n64_debug_libretro` |
| Nintendo - Nintendo DS | `nds` | `melonds_libretro`, `desmume_libretro`, `desmume2015_libretro` |
| Arcade | `neogeo` | `fbalpha2012_neogeo_libretro` |
| SNK - Neo Geo CD | `neogeocd` | `neocd_libretro`, `fbneo_libretro` |
| Nintendo - Nintendo Entertainment System | `nes` | `mesen_libretro`, `fceumm_libretro`, `nestopia_libretro`, `quicknes_libretro`, `fceux_libretro`, `bnes_libretro`, `emux_nes_libretro`, `fixnes_libretro` |
| Nintendo - GameCube | `ngc` | `dolphin_libretro` |
| SNK - Neo Geo Pocket Color | `ngpc` | `mednafen_ngp_libretro`, `handy_libretro`, `race_libretro` |
| Cave Story | `nxengine` | `nxengine_libretro` |
| Oberon RISC Emulator | `oberon` | `oberon_libretro` |
| Magnavox - Odyssey2 / Phillips Videopac+ | `odyssey2` | `o2em_libretro` |
| Tomb Raider | `openlara` | `openlara_libretro` |
| Palm OS | `palm` | `mu_libretro` |
| PC | `pc` | `pcem_libretro` |
| NEC - PC-8001 - PC-8801 | `pc88` | `quasi88_libretro` |
| NEC - PC-98 | `pc98` | `np2kai_libretro`, `quasi88_libretro`, `nekop2_libretro` |
| NEC - PC Engine - TurboGrafx 16 | `pce` | `mednafen_pce_fast_libretro`, `mednafen_pce_libretro`, `geargrafx_libretro`, `mednafen_supergrafx_libretro` |
| NEC - PC Engine CD - TurboGrafx-CD | `pcecd` | `mednafen_pce_fast_libretro`, `mednafen_pce_libretro`, `geargrafx_libretro` |
| NEC - PC-FX | `pcfx` | `mednafen_pcfx_libretro` |
| Commodore - PET | `pet` | `vice_xpet_libretro` |
| PICO-8 | `pico8` | `retro8_libretro` |
| Commodore - PLUS/4 | `plus4` | `vice_xplus4_libretro` |
| Nintendo - Pokemon Mini | `pokemini` | `pokemini_libretro` |
| Sony - PlayStation 2 | `ps2` | `pcsx2_libretro`, `play_libretro` |
| Sony - PlayStation Portable | `psp` | `ppsspp_libretro` |
| Sony - PlayStation | `psx` | `pcsx_rearmed_libretro`, `swanstation_libretro`, `mednafen_psx_libretro`, `duckstation_libretro`, `mednafen_psx_hw_libretro`, `pcsx1_libretro`, `pcsx_rearmed_interpreter_libretro`, `pcsx_rearmed_neon_libretro`, `rustation_libretro` |
| Quake | `quake` | `tyrquake_libretro` |
| Quake II - Ground Zero | `quake2` | `vitaquake2-rogue_libretro`, `vitaquake2-xatrix_libretro`, `vitaquake2-zaero_libretro`, `vitaquake2_libretro` |
| Quake III: Arena | `quake3` | `vitaquake3_libretro`, `vitavoyager_libretro` |
| Redbook Audio Player | `redbook` | `redbook_libretro` |
| RPG Maker | `rpgmaker` | `easyrpg_libretro` |
| SAM Coupe | `samcoupe` | `simcp_libretro` |
| Nintendo - Satellaview | `satellaview` | `snes9x_libretro`, `bsnes_libretro`, `bsnes_hd_libretro` |
| Sega - Saturn | `saturn` | `mednafen_saturn_libretro`, `yabasanshiro_libretro`, `kronos_libretro`, `yabause_libretro` |
| ScummVM | `scummvm` | `scummvm_libretro` |
| Sega - 32X | `sega32x` | `picodrive_libretro`, `genesis_plus_gx_libretro` |
| Sega - Mega-CD - Sega CD | `segacd` | `genesis_plus_gx_libretro`, `clownmdemu_libretro`, `picodrive_libretro` |
| Nintendo - Super Famicom | `sfc` | `snes9x_libretro`, `bsnes_libretro`, `bsnes_hd_libretro` |
| Sega - SG-1000 | `sg1000` | `genesis_plus_gx_libretro` |
| Sharp X1 | `sharpx1` | `x1_libretro` |
| Sega - Master System - Mark III | `sms` | `genesis_plus_gx_libretro`, `smsplus_libretro`, `gearsystem_libretro`, `picodrive_libretro`, `emux_sms_libretro` |
| Nintendo - Super Nintendo Entertainment System | `snes` | `snes9x_libretro`, `snes9x2002_libretro`, `snes9x2005_libretro`, `snes9x2010_libretro`, `bsnes_libretro`, `bsnes_hd_libretro`, `bsnes_mercury_accuracy_libretro`, `bsnes_mercury_balanced_libretro`, `bsnes_mercury_performance_libretro`, `bsnes2014_accuracy_libretro`, `bsnes2014_balanced_libretro`, `bsnes2014_performance_libretro`, `bsnes_cplusplus98_libretro`, `bsnes_hd_beta_libretro`, `higan_sfc_balanced_libretro`, `higan_sfc_libretro`, `mednafen_snes_libretro`, `mednafen_supafaust_libretro`, `mesen-s_libretro`, `snes9x2005_plus_libretro` |
| NEC - PC Engine SuperGrafx | `supergrafx` | `mednafen_pce_fast_libretro`, `mednafen_pce_libretro`, `geargrafx_libretro` |
| Watara - Supervision | `supervision` | `potator_libretro` |
| NEC - PC Engine - TurboGrafx 16 | `tg16` | `mednafen_pce_fast_libretro`, `mednafen_pce_libretro`, `geargrafx_libretro` |
| TIC-80 | `tic80` | `tic80_libretro` |
| Uzebox | `uzebox` | `uzem_libretro` |
| GCE - Vectrex | `vectrex` | `vecx_libretro` |
| Commodore - VIC-20 | `vic20` | `vice_xvic_libretro` |
| Nintendo - Virtual Boy | `virtualboy` | `mednafen_vb_libretro`, `vba_next_libretro`, `gambatte_libretro` |
| VeMUlator | `vmuse` | `vemulator_libretro` |
| WASM-4 | `wasm4` | `wasm4_libretro` |
| Nintendo - Wii | `wii` | `dolphin_libretro` |
| Windows 3.x | `windows3x` | `dosbox_pure_libretro`, `dosbox_svn_libretro` |
| Wolfenstein 3D | `wolfenstein3d` | `ecwolf_libretro` |
| Bandai - WonderSwan | `wonderswan` | `mednafen_wswan_libretro` |
| Bandai - WonderSwan Color | `wonderswancolor` | `mednafen_wswan_libretro` |
| Sharp - X68000 | `x68000` | `px68k_libretro` |
| Microsoft - XBOX | `xbox` | `directxbox_libretro` |
| Rick Dangerous | `xrick` | `xrick_libretro` |
| Sinclair - ZX 81 | `zx81` | `81_libretro` |
| Sinclair - ZX Spectrum | `zxspectrum` | `fuse_libretro`, `spectemu_libretro` |

## Standalone emulators

### 2600.emu

- Package: `com.explusalpha.A2600Emu`
- Systems: atari2600
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.A2600Emu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### AetherSX2

- Package: `xyz.aethersx2.android`
- Systems: ps2
- Activity: `xyz.aethersx2.android.EmulationActivity`
- Launch:
```
am start \
  -n xyz.aethersx2.android/xyz.aethersx2.android.EmulationActivity \
  -a android.intent.action.MAIN \
  -e bootPath {file.documenturi} \
  -d {file.uri}
```

### aFreeBox

- Package: `com.fishstix.dosboxfree`
- Systems: dos

- Launch:
```
am start \
  -p com.fishstix.dosboxfree \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### anDOSBox

- Package: `com.locnet.dosbox`
- Systems: dos

- Launch:
```
am start \
  -p com.locnet.dosbox \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ARMSX3

- Package: `com.armsx3`
- Systems: ps3

- Launch:
```
am start \
  -p com.armsx3 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Ataroid

- Package: `com.androidemu.atari`
- Systems: atari2600
- Activity: `com.androidemu.atari.EmulatorActivity`
- Launch:
```
am start \
  -n com.androidemu.atari/com.androidemu.atari.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Azahar

- Package: `io.github.lime3ds.android`
- Systems: n3ds

- Launch:
```
am start \
  -p io.github.lime3ds.android \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Bochs

- Package: `net.sourceforge.bochs`
- Systems: dos, windows

- Launch:
```
am start \
  -p net.sourceforge.bochs \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### C64

- Package: `org.ab.c64`
- Systems: c64

- Launch:
```
am start \
  -p org.ab.c64 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### C64

- Package: `de.joergjahnke.c64.android`
- Systems: c64

- Launch:
```
am start \
  -p de.joergjahnke.c64.android \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### C64.emu

- Package: `com.explusalpha.C64Emu`
- Systems: c64
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.C64Emu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Citra

- Package: `org.citra.citra`
- Systems: n3ds

- Launch:
```
am start \
  -p org.citra.citra \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Citra (MMJ)

- Package: `org.citra.citra_emu`, `org.github.weihuoya.citra`
- Systems: n3ds

- Launch:
```
am start \
  -p org.citra.citra_emu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Citra (nightly)

- Package: `org.citra.emu`
- Systems: n3ds
- Activity: `org.citra.emu.ui.main.MainActivity`
- Launch:
```
am start \
  -n org.citra.emu/org.citra.emu.ui.main.MainActivity \
  -a android.intent.action.VIEW \
  -e GamePath {file.path} \
  -d {file.uri}
```

### Citron

- Package: `org.citron.citron_emu`
- Systems: nsw

- Launch:
```
am start \
  -p org.citron.citron_emu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ClassicBoy Lite

- Package: `com.portableandroid.classicboyLite`
- Systems: mame, pce, tg16, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, ngpc, psx

- Launch:
```
am start \
  -p com.portableandroid.classicboyLite \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ClassicBoy Pro

- Package: `com.portableandroid.classicboy`
- Systems: mame, pce, tg16, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, ngpc, psx

- Launch:
```
am start \
  -p com.portableandroid.classicboy \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ColEm

- Package: `com.fms.colem`
- Systems: colecovision
- Activity: `com.fms.emulib.MainActivity`
- Launch:
```
am start \
  -n com.fms.colem/com.fms.emulib.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ColEm Deluxe

- Package: `com.fms.colem.deluxe`
- Systems: colecovision
- Activity: `com.fms.emulib.MainActivity`
- Launch:
```
am start \
  -n com.fms.colem.deluxe/com.fms.emulib.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### DamonPS2

- Package: `com.damonplay.damonps2.free`
- Systems: ps2

- Launch:
```
am start \
  -p com.damonplay.damonps2.free \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Dolphin

- Package: `org.dolphinemu.dolphinemu`, `com.dolphin.emulator`, `org.dolphin.dolphinemu`
- Systems: gcn, ngc, wii
- Activity: `org.dolphinemu.dolphinemu.ui.main.MainActivity`
- Launch:
```
am start \
  -n org.dolphinemu.dolphinemu/org.dolphinemu.dolphinemu.ui.main.MainActivity \
  -a android.intent.action.VIEW \
  -e AutoStartFile {file.path} \
  -d {file.uri}
```

### Dolphin (Retroid fork)

- Package: `org.dolphinemu.handheld`
- Systems: gcn, wii
- Activity: `org.dolphinemu.dolphinemu.ui.main.MainActivity`
- Launch:
```
am start \
  -n org.dolphinemu.handheld/org.dolphinemu.dolphinemu.ui.main.MainActivity \
  -a android.intent.action.VIEW \
  -e AutoStartFile {file.path} \
  -d {file.uri}
```

### DOSBox Turbo

- Package: `com.fishstix.dosbox`
- Systems: dos

- Launch:
```
am start \
  -p com.fishstix.dosbox \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### DraStic

- Package: `com.dsemu.drastic`
- Systems: nds
- Activity: `com.dsemu.drastic.DraSticActivity`
- Launch:
```
am start \
  -n com.dsemu.drastic/com.dsemu.drastic.DraSticActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### DuckStation

- Package: `com.github.stenzek.duckstation`
- Systems: psx
- Activity: `com.github.stenzek.duckstation.MainActivity`
- Launch:
```
am start \
  -n com.github.stenzek.duckstation/com.github.stenzek.duckstation.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Eden

- Package: `dev.eden.eden_emulator`
- Systems: nsw

- Launch:
```
am start \
  -p dev.eden.eden_emulator \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Egg NS

- Package: `com.xiaoji.gamesirnsemulator.x.google`
- Systems: nsw

- Launch:
```
am start \
  -p com.xiaoji.gamesirnsemulator.x.google \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ePSXe

- Package: `com.epsxe.ePSXe`
- Systems: psx
- Activity: `com.epsxe.ePSXe.ePSXe`
- Launch:
```
am start \
  -n com.epsxe.ePSXe/com.epsxe.ePSXe.ePSXe \
  -a android.intent.action.MAIN \
  -e com.epsxe.ePSXe.isoName {file.path} \
  -d {file.uri}
```

### Flycast

- Package: `com.flycast.emulator`
- Systems: dreamcast, atomiswave
- Activity: `com.reicast.emulator.MainActivity`
- Launch:
```
am start \
  -n com.flycast.emulator/com.reicast.emulator.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### fMSX

- Package: `com.fms.fmsx`
- Systems: msx

- Launch:
```
am start \
  -p com.fms.fmsx \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### FPse

- Package: `com.emulator.fpse`
- Systems: psx
- Activity: `com.emulator.fpse.Main`
- Launch:
```
am start \
  -n com.emulator.fpse/com.emulator.fpse.Main \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### FPse 64

- Package: `com.emulator.fpse64`
- Systems: psx
- Activity: `com.emulator.fpse64.Main`
- Launch:
```
am start \
  -n com.emulator.fpse64/com.emulator.fpse64.Main \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GameBoy Advanced droid

- Package: `ca.halsafar.gambattedroid`
- Systems: gba

- Launch:
```
am start \
  -p ca.halsafar.gambattedroid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GameBoy droid

- Package: `ca.halsafar.mgbadroid`
- Systems: gb, gbc

- Launch:
```
am start \
  -p ca.halsafar.mgbadroid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GBA.emu

- Package: `com.explusalpha.GbaEmu`
- Systems: gba
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.GbaEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GBC.emu

- Package: `com.explusalpha.GbcEmu`
- Systems: gb, gbc
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.GbcEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### gbcc

- Package: `com.philj56.gbcc`
- Systems: gb, gbc

- Launch:
```
am start \
  -p com.philj56.gbcc \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GBCoid

- Package: `com.androidemu.gbc`
- Systems: gb, gbc
- Activity: `com.androidemu.gbc.EmulatorActivity`
- Launch:
```
am start \
  -n com.androidemu.gbc/com.androidemu.gbc.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Gearoid

- Package: `com.androidemu.gg`
- Systems: gg, sms
- Activity: `com.androidemu.gg.EmulatorActivity`
- Launch:
```
am start \
  -n com.androidemu.gg/com.androidemu.gg.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GenesisDroid

- Package: `ca.halsafar.genesisdroid`
- Systems: genesis, megadrive

- Launch:
```
am start \
  -p ca.halsafar.genesisdroid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Gensoid

- Package: `com.androidemu.gens`
- Systems: genesis, megadrive
- Activity: `com.androidemu.gens.EmulatorActivity`
- Launch:
```
am start \
  -n com.androidemu.gens/com.androidemu.gens.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GZDoom (Delta Touch Full)

- Package: `com.opentouchgaming.gzdoom`
- Systems: doom

- Launch:
```
am start \
  -p com.opentouchgaming.gzdoom \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### GZDoom (Delta Touch)

- Package: `com.opentouchgaming.gzdoomfree`
- Systems: doom

- Launch:
```
am start \
  -p com.opentouchgaming.gzdoomfree \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### IrataJaguar

- Package: `ru.vastness.altmer.iratajaguar`
- Systems: jaguar
- Activity: `ru.vastness.altmer.iratajaguar.MainActivity`
- Launch:
```
am start \
  -n ru.vastness.altmer.iratajaguar/ru.vastness.altmer.iratajaguar.MainActivity \
  -a android.intent.action.VIEW \
  -e rom {file.path} \
  -d {file.uri}
```

### John GBA

- Package: `com.johnemulators.johngba`
- Systems: gba

- Launch:
```
am start \
  -p com.johnemulators.johngba \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### John GBA Lite

- Package: `com.johnemulators.johngbac`
- Systems: gba

- Launch:
```
am start \
  -p com.johnemulators.johngbac \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### John GBC

- Package: `com.johnemulators.johngbc`
- Systems: gb, gbc

- Launch:
```
am start \
  -p com.johnemulators.johngbc \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### John NES

- Package: `com.johnemulators.johnness`
- Systems: nes

- Launch:
```
am start \
  -p com.johnemulators.johnness \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### jzIntv

- Package: `org.libsdl.jzintv4droid2`
- Systems: intellivision
- Activity: `org.libsdl.jzintv4droid2.jzIntv4Droid`
- Launch:
```
am start \
  -n org.libsdl.jzintv4droid2/org.libsdl.jzintv4droid2.jzIntv4Droid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### kat5200

- Package: `com.jillybunch.kat5200`
- Systems: atari5200

- Launch:
```
am start \
  -p com.jillybunch.kat5200 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Lemuroid

- Package: `com.swordfish.lemuroid`
- Systems: lynx, c64, pce, tg16, nds, gb, gbc, gba, nes, snes, n64, gg, sms, genesis, megadrive, ngpc, psx

- Launch:
```
am start \
  -p com.swordfish.lemuroid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Lynx.emu

- Package: `com.explusalpha.LynxEmu`
- Systems: lynx

- Launch:
```
am start \
  -p com.explusalpha.LynxEmu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### M64Plus FZ

- Package: `org.mupen64plusae.v3.fzurita`
- Systems: n64
- Activity: `paulscode.android.mupen64plusae.SplashActivity`
- Launch:
```
am start \
  -n org.mupen64plusae.v3.fzurita/paulscode.android.mupen64plusae.SplashActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### M64Plus FZ Pro

- Package: `org.mupen64plusae.v3.fzurita.pro`
- Systems: n64
- Activity: `paulscode.android.mupen64plusae.SplashActivity`
- Launch:
```
am start \
  -n org.mupen64plusae.v3.fzurita.pro/paulscode.android.mupen64plusae.SplashActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Magic DOSBox

- Package: `bruenor.magicbox`
- Systems: dos

- Launch:
```
am start \
  -p bruenor.magicbox \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### MAME4droid

- Package: `com.seleuco.mame4droid`
- Systems: mame, fba
- Activity: `com.seleuco.mame4droid.MAME4droid`
- Launch:
```
am start \
  -n com.seleuco.mame4droid/com.seleuco.mame4droid.MAME4droid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### MAME4droid (2024)

- Package: `com.seleuco.mame4d2024`
- Systems: mame, fba

- Launch:
```
am start \
  -p com.seleuco.mame4d2024 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### MAME4droid (MAME4All)

- Package: `com.seleuco.mame4all`
- Systems: mame

- Launch:
```
am start \
  -p com.seleuco.mame4all \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### MasterEmu

- Package: `uk.co.philpotter.masteremu`
- Systems: gg, sms

- Launch:
```
am start \
  -p uk.co.philpotter.masteremu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### MD.emu

- Package: `com.explusalpha.MdEmu`
- Systems: gg, sms, genesis, megadrive
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.MdEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### melonDS

- Package: `me.magnum.melonds`
- Systems: nds

- Launch:
```
am start \
  -p me.magnum.melonds \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Mikage

- Package: `com.mikageinc.mikage`
- Systems: n3ds

- Launch:
```
am start \
  -p com.mikageinc.mikage \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### MSX.emu

- Package: `com.explusalpha.MsxEmu`
- Systems: msx
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.MsxEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Mupen64Plus AE

- Package: `org.mupen64plusae`, `paulscode.android.mupen64plusae`
- Systems: n64
- Activity: `paulscode.android.mupen64plusae.MainActivity`
- Launch:
```
am start \
  -n org.mupen64plusae/paulscode.android.mupen64plusae.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### My Boy!

- Package: `com.fastemulator.gba`
- Systems: gba
- Activity: `com.fastemulator.gba.EmulatorActivity`
- Launch:
```
am start \
  -n com.fastemulator.gba/com.fastemulator.gba.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### My Boy! Free

- Package: `com.fastemulator.gbafree`
- Systems: gba
- Activity: `com.fastemulator.gba.EmulatorActivity`
- Launch:
```
am start \
  -n com.fastemulator.gbafree/com.fastemulator.gba.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### My OldBoy!

- Package: `com.fastemulator.gbc`
- Systems: gb, gbc
- Activity: `com.fastemulator.gbc.EmulatorActivity`
- Launch:
```
am start \
  -n com.fastemulator.gbc/com.fastemulator.gbc.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### N64.emu

- Package: `com.explusalpha.N64Plus`
- Systems: n64

- Launch:
```
am start \
  -p com.explusalpha.N64Plus \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### N64oid

- Package: `com.mop.ide.n64oid`
- Systems: n64

- Launch:
```
am start \
  -p com.mop.ide.n64oid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### NEO.emu

- Package: `com.explusalpha.NeoEmu`
- Systems: mame, fba
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.NeoEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### NES.emu

- Package: `com.explusalpha.NesEmu`
- Systems: nes
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.NesEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### NESdroid

- Package: `ca.halsafar.nesdroid`
- Systems: nes

- Launch:
```
am start \
  -p ca.halsafar.nesdroid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### NESoid

- Package: `com.androidemu.nes`
- Systems: nes
- Activity: `com.androidemu.nes.EmulatorActivity`
- Launch:
```
am start \
  -n com.androidemu.nes/com.androidemu.nes.EmulatorActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### NetherSX2

- Package: `xyz.aether.sx2`
- Systems: ps2

- Launch:
```
am start \
  -p xyz.aether.sx2 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Network GBA

- Package: `com.hqgame.networkgba`
- Systems: gba

- Launch:
```
am start \
  -p com.hqgame.networkgba \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Network NES

- Package: `com.hqgame.networknes`
- Systems: nes

- Launch:
```
am start \
  -p com.hqgame.networknes \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Network SNES

- Package: `com.hqgame.networksnes`
- Systems: snes

- Launch:
```
am start \
  -p com.hqgame.networksnes \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### NGP.emu

- Package: `com.explusalpha.NgpEmu`
- Systems: ngpc
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.NgpEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nood (N64)

- Package: `com.hydra.noods`
- Systems: n64

- Launch:
```
am start \
  -p com.hydra.noods \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.GBA

- Package: `com.nostalgiaemulators.gbalite`
- Systems: gba

- Launch:
```
am start \
  -p com.nostalgiaemulators.gbalite \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.GBA Pro

- Package: `com.nostalgiaemulators.gbapro`
- Systems: gba

- Launch:
```
am start \
  -p com.nostalgiaemulators.gbapro \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.GBC

- Package: `com.nostalgiaemulators.gbclite`
- Systems: gb, gbc

- Launch:
```
am start \
  -p com.nostalgiaemulators.gbclite \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.GBC Pro

- Package: `com.nostalgiaemulators.gbcpro`
- Systems: gb, gbc

- Launch:
```
am start \
  -p com.nostalgiaemulators.gbcpro \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.GG

- Package: `com.nostalgiaemulators.gglite`
- Systems: gg, sms

- Launch:
```
am start \
  -p com.nostalgiaemulators.gglite \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.NES

- Package: `com.nostalgiaemulators.neslite`
- Systems: nes

- Launch:
```
am start \
  -p com.nostalgiaemulators.neslite \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.NES Pro

- Package: `com.nostalgiaemulators.nespro`
- Systems: nes

- Launch:
```
am start \
  -p com.nostalgiaemulators.nespro \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.SNES

- Package: `com.nostalgiaemulators.sneslite`
- Systems: snes

- Launch:
```
am start \
  -p com.nostalgiaemulators.sneslite \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nostalgia.SNES Pro

- Package: `com.nostalgiaemulators.snespro`
- Systems: snes

- Launch:
```
am start \
  -p com.nostalgiaemulators.snespro \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Nyushu

- Package: `emuready.nyushu.ABenchMark`
- Systems: nsw

- Launch:
```
am start \
  -p emuready.nyushu.ABenchMark \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### openMSX

- Package: `org.openmsx.android.openmsx`
- Systems: msx

- Launch:
```
am start \
  -p org.openmsx.android.openmsx \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Panda3DS

- Package: `com.alber.panda3ds`
- Systems: n3ds

- Launch:
```
am start \
  -p com.alber.panda3ds \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### PCE.emu

- Package: `com.explusalpha.PceEmu`
- Systems: pce, tg16
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.PceEmu/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Pizza Boy

- Package: `it.dbtecno.pizzaboy`
- Systems: gba

- Launch:
```
am start \
  -p it.dbtecno.pizzaboy \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Pizza Boy C

- Package: `it.dbtecno.pizzaboyc`
- Systems: gb, gbc

- Launch:
```
am start \
  -p it.dbtecno.pizzaboyc \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Pizza Boy C Pro

- Package: `it.dbtecno.pizzaboycpro`
- Systems: gb, gbc

- Launch:
```
am start \
  -p it.dbtecno.pizzaboycpro \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Pizza Boy Pro

- Package: `it.dbtecno.pizzaboypro`
- Systems: gba

- Launch:
```
am start \
  -p it.dbtecno.pizzaboypro \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Play!

- Package: `com.virtualapplications.play`
- Systems: ps2

- Launch:
```
am start \
  -p com.virtualapplications.play \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### PPSSPP

- Package: `org.ppsspp.ppsspp`
- Systems: psp
- Activity: `org.ppsspp.ppsspp.PpssppActivity`
- Launch:
```
am start \
  -n org.ppsspp.ppsspp/org.ppsspp.ppsspp.PpssppActivity \
  -a android.intent.action.VIEW \
  -d {file.documenturi}
```

### PPSSPP Gold

- Package: `org.ppsspp.ppssppgold`
- Systems: psp
- Activity: `org.ppsspp.ppsspp.PpssppActivity`
- Launch:
```
am start \
  -n org.ppsspp.ppssppgold/org.ppsspp.ppsspp.PpssppActivity \
  -a android.intent.action.VIEW \
  -d {file.documenturi}
```

### PSX.emu

- Package: `com.explusalpha.PsxEmu`
- Systems: psx

- Launch:
```
am start \
  -p com.explusalpha.PsxEmu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Real3DOPlayer

- Package: `ru.vastness.altmer.real3doplayer`
- Systems: 3do
- Activity: `ru.vastness.altmer.real3doplayer.MainActivity`
- Launch:
```
am start \
  -n ru.vastness.altmer.real3doplayer/ru.vastness.altmer.real3doplayer.MainActivity \
  -a android.intent.action.VIEW \
  -e cd {file.path} \
  -d {file.uri}
```

### Redream

- Package: `io.recompiled.redream`
- Systems: dreamcast
- Activity: `io.recompiled.redream.MainActivity`
- Launch:
```
am start \
  -n io.recompiled.redream/io.recompiled.redream.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Reicast

- Package: `com.reicast.emulator`
- Systems: dreamcast
- Activity: `com.reicast.emulator.MainActivity`
- Launch:
```
am start \
  -n com.reicast.emulator/com.reicast.emulator.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.path}
```

### ResidualVM

- Package: `org.residualvm.residualvm`
- Systems: scummvm

- Launch:
```
am start \
  -p org.residualvm.residualvm \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Saturn.emu

- Package: `com.explusalpha.SaturnEmu`
- Systems: saturn

- Launch:
```
am start \
  -p com.explusalpha.SaturnEmu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### ScummVM

- Package: `org.scummvm.scummvm`
- Systems: scummvm

- Launch:
```
am start \
  -p org.scummvm.scummvm \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### SilverArrow

- Package: `com.jabosoft.silverarrow`
- Systems: psx

- Launch:
```
am start \
  -p com.jabosoft.silverarrow \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Skyline

- Package: `emu.skyline`
- Systems: nsw

- Launch:
```
am start \
  -p emu.skyline \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Snes9x EX+

- Package: `com.explusalpha.Snes9xPlus`
- Systems: snes, sfc
- Activity: `com.imagine.BaseActivity`
- Launch:
```
am start \
  -n com.explusalpha.Snes9xPlus/com.imagine.BaseActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### SNESdroid

- Package: `ca.halsafar.snesdroid`
- Systems: snes

- Launch:
```
am start \
  -p ca.halsafar.snesdroid \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Strato

- Package: `emu.strato`
- Systems: nsw

- Launch:
```
am start \
  -p emu.strato \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Sudachi

- Package: `org.sudachi.sudachi_emu`
- Systems: nsw

- Launch:
```
am start \
  -p org.sudachi.sudachi_emu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### SuperRetro16

- Package: `com.neutronemulation.super_retro_16`
- Systems: gb, gbc, gba, snes

- Launch:
```
am start \
  -p com.neutronemulation.super_retro_16 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### SuperRetro16

- Package: `com.bubblezapgames.supergnes`
- Systems: snes
- Activity: `com.bubblezapgames.supergnes.IntentFilterActivity`
- Launch:
```
am start \
  -n com.bubblezapgames.supergnes/com.bubblezapgames.supergnes.IntentFilterActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### SuperRetro16 Lite

- Package: `com.bubblezapgames.supergnes_lite`
- Systems: snes
- Activity: `com.bubblezapgames.supergnes.IntentFilterActivity`
- Launch:
```
am start \
  -n com.bubblezapgames.supergnes_lite/com.bubblezapgames.supergnes.IntentFilterActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### SuperZSNES

- Package: `com.zsnes.superzsnes`
- Systems: snes

- Launch:
```
am start \
  -p com.zsnes.superzsnes \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### UAE4All

- Package: `org.ab.uae`
- Systems: amiga

- Launch:
```
am start \
  -p org.ab.uae \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### UAE4All2

- Package: `atua.anddev.uae4all2`
- Systems: amiga

- Launch:
```
am start \
  -p atua.anddev.uae4all2 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### UAE4Droid

- Package: `com.locnet.uae`
- Systems: amiga

- Launch:
```
am start \
  -p com.locnet.uae \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### UnityBoyAdvance

- Package: `com.Rekkuzan.UnityBoyAdvance`
- Systems: gba

- Launch:
```
am start \
  -p com.Rekkuzan.UnityBoyAdvance \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### VecDroid

- Package: `com.willna.vecdroid`
- Systems: vectrex
- Activity: `com.willna.vecdroid.MainActivity`
- Launch:
```
am start \
  -n com.willna.vecdroid/com.willna.vecdroid.MainActivity \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### VICE

- Package: `com.locnet.vice`
- Systems: c64

- Launch:
```
am start \
  -p com.locnet.vice \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Virtual Jaguar

- Package: `org.icculus.virtualjaguar`
- Systems: jaguar

- Launch:
```
am start \
  -p org.icculus.virtualjaguar \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Vita3K

- Package: `com.github.eka2l1`
- Systems: psvita

- Launch:
```
am start \
  -p com.github.eka2l1 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Yaba Sanshiro

- Package: `org.uoyabause.android`
- Systems: saturn
- Activity: `org.uoyabause.android.Yabause`
- Launch:
```
am start \
  -n org.uoyabause.android/org.uoyabause.android.Yabause \
  -a android.intent.action.VIEW \
  -e org.uoyabause.android.FileNameEx {file.path} \
  -d {file.uri}
```

### Yaba Sanshiro 2

- Package: `org.devmiyax.yabasanshioro2`
- Systems: saturn

- Launch:
```
am start \
  -p org.devmiyax.yabasanshioro2 \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Yaba Sanshiro 2 Pro

- Package: `org.devmiyax.yabasanshioro2.pro`
- Systems: saturn
- Activity: `org.uoyabause.android.Yabause`
- Launch:
```
am start \
  -n org.devmiyax.yabasanshioro2.pro/org.uoyabause.android.Yabause \
  -a android.intent.action.VIEW \
  -e org.uoyabause.android.FileNameEx {file.path} \
  -d {file.uri}
```

### Yaba Sanshiro Pro

- Package: `org.uoyabause.android.pro`
- Systems: saturn
- Activity: `org.uoyabause.android.Yabause`
- Launch:
```
am start \
  -n org.uoyabause.android.pro/org.uoyabause.android.Yabause \
  -a android.intent.action.VIEW \
  -e org.uoyabause.android.FileNameEx {file.path} \
  -d {file.uri}
```

### Yabause

- Package: `org.bbflight.yabause`
- Systems: saturn

- Launch:
```
am start \
  -p org.bbflight.yabause \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Yuzu

- Package: `org.yuzu.yuzu_emu`, `org.yuzu.android`
- Systems: nsw

- Launch:
```
am start \
  -p org.yuzu.yuzu_emu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Yuzu (RetroShark)

- Package: `io.retroshark.yuzu`
- Systems: nsw

- Launch:
```
am start \
  -p io.retroshark.yuzu \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

### Yuzu Early Access

- Package: `org.yuzu.yuzu_emu.ea`
- Systems: nsw

- Launch:
```
am start \
  -p org.yuzu.yuzu_emu.ea \
  -a android.intent.action.VIEW \
  -d {file.uri}
```

