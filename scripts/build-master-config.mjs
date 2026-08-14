#!/usr/bin/env node
/**
 * Regenerates config/systems.json into the MASTER-LIST format:
 *
 *   {
 *     "emulators": [ { "id", "name", "packages[]", "siteUrl", "playStoreUrl?", "apkUrl?" } ],
 *     "systems":   [ { "id", "name", "folder", ..., "emulators": [{ "emulator": <id>, "core"?, ... }] } ]
 *   }
 *
 * Each distinct app gets ONE stable `id`. Systems reference ids below (the
 * "reuse the id across platforms" model). Variant-only fields (core, extras,
 * mimeType, activity, favourite) stay on the system entry; the package list and
 * app-level links (site / Play Store / direct APK) live on the master entry.
 *
 *   node scripts/build-master-config.mjs
 *
 * The map below is hand-curated: id + canonical name + links per package.
 * "merge" marks a package that shares an id with its "id" sibling.
 * "drop" marks packages that are fakes, clones, or misattributed apps and are
 * removed from every system.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLinks } from "./links.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const systemsPath = join(root, "config", "systems.json");

const play = (pkg) => `https://play.google.com/store/apps/details?id=${pkg}`;

// package -> { id } merges the package into an existing id (same app, extra build).
const MERGE = {
  "org.yuzu.android": "yuzu",
};

// packages that are fakes/clones/misattributed and get removed everywhere.
const DROP = new Set([
  "com.drastic.ds",            // fake DraStic duplicate
  "com.aether.s2",             // AetherSX2 clone (real NetherSX2 is xyz.aether.sx2)
  "it.dbtecno.pizzaboygba",    // no such app
  "it.dbtecno.pizzaboygbapro", // no such app
  "com.mame.mame4droid",       // dubious duplicate of com.seleuco.mame4droid
  "com.mameall.mame4android",  // unverifiable "MAMEAll"
  "com.dreamcast.flycast",     // third-party Flycast clone
  "com.flycast",               // unofficial; official is com.flycast.emulator
]);

// packages that are wrong for the systems they were listed on (Redream is
// Dreamcast-only; Flycast doesn't run MAME/FBA romsets).
const DROP_FROM = {
  "io.recompiled.redream": new Set(["sega32x", "atomiswave"]),
  "com.damonplay.damonps2.free": new Set(["nsw"]), // DamonPS2 is a PS2 emulator, not Switch
};
const DROP_CORE_FROM = {
  flycast_libretro: new Set(["mame", "fba"]), // flycast core is Naomi/Atomiswave, not MAME/FBA
};

// package -> master entry (primary).
const EMU = {
  // ---- RetroArch family (real builds: site APK + Play Store share package ids) --
  "com.retroarch": { id: "retroarch", name: "RetroArch", site: "https://www.retroarch.com/", play: play("com.retroarch"), apk: "https://buildbot.libretro.com/stable/1.22.2/android/RetroArch.apk" },
  "com.retroarch.aarch64": { id: "retroarch-plus", name: "RetroArch Plus (64-bit)", site: "https://www.retroarch.com/", play: play("com.retroarch.aarch64"), apk: "https://buildbot.libretro.com/stable/1.22.2/android/RetroArch_aarch64.apk" },
  "com.retroarch.ra32": { id: "retroarch-32", name: "RetroArch (32-bit)", site: "https://www.retroarch.com/", apk: "https://buildbot.libretro.com/stable/1.22.2/android/RetroArch_ra32.apk" },

  // ---- Multi-system frontends ------------------------------------------------
  "com.swordfish.lemuroid": { id: "lemuroid", name: "Lemuroid", site: "https://github.com/Swordfish90/Lemuroid", play: play("com.swordfish.lemuroid") },
  "com.portableandroid.classicboy": { id: "classicboy", name: "ClassicBoy Pro", site: "https://classicboy.online/", play: play("com.portableandroid.classicboy") },
  "com.portableandroid.classicboyLite": { id: "classicboy-lite", name: "ClassicBoy Lite", site: "https://classicboy.online/", play: play("com.portableandroid.classicboyLite") },

  // ---- Nintendo --------------------------------------------------------------
  "org.dolphinemu.dolphinemu": { id: "dolphin", name: "Dolphin", site: "https://dolphin-emu.org/", play: play("org.dolphinemu.dolphinemu") },
  "org.mupen64plusae": { id: "mupen64plus-ae", name: "Mupen64Plus AE", site: "https://github.com/mupen64plus-ae/mupen64plus-ae", play: play("org.mupen64plusae") },
  "org.mupen64plusae.v3.fzurita": { id: "m64plus-fz", name: "M64Plus FZ", site: "https://github.com/fzurita/m64plus_fz", play: play("org.mupen64plusae.v3.fzurita") },
  "com.hydra.noods": { id: "nood", name: "Nood (N64)", site: "https://github.com/operatingsystems/nood", play: play("com.hydra.noods") },
  "com.mop.ide.n64oid": { id: "n64oid", name: "N64oid", site: "https://play.google.com/store/apps/details?id=com.mop.ide.n64oid", play: play("com.mop.ide.n64oid") },
  "com.explusalpha.N64Plus": { id: "n64-emu", name: "N64.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.N64Plus") },
  "com.dsemu.drastic": { id: "drastic", name: "DraStic", site: "https://www.drastic-ds.com/", play: play("com.dsemu.drastic") },
  "me.magnum.melonds": { id: "melonds", name: "melonDS", site: "https://github.com/rafaelvcaetano/melonDS-Android", play: play("me.magnum.melonds") },
  "org.citra.citra": { id: "citra", name: "Citra", site: "https://citra-emu.org/", play: play("org.citra.citra") },
  "org.citra.emu": { id: "citra-nightly", name: "Citra (nightly)", site: "https://citra-emu.org/", play: play("org.citra.emu") },
  "org.citra.citra_emu": { id: "citra-mmj", name: "Citra (MMJ)", site: "https://github.com/weihuoya/citra", play: play("org.citra.citra_emu") },
  "org.github.weihuoya.citra": { id: "citra-mmj", name: "Citra (MMJ)", site: "https://github.com/weihuoya/citra", play: play("org.github.weihuoya.citra") },
  "io.github.lime3ds.android": { id: "azahar", name: "Azahar", site: "https://azahar-emu.org/", play: play("io.github.lime3ds.android") },
  "com.mikageinc.mikage": { id: "mikage", name: "Mikage", site: "https://mikage.app/", play: play("com.mikageinc.mikage") },
  "com.alber.panda3ds": { id: "panda3ds", name: "Panda3DS", site: "https://github.com/wheremyfoodat/Panda3DS", play: play("com.alber.panda3ds") },

  // ---- Switch ----------------------------------------------------------------
  "org.yuzu.yuzu_emu": { id: "yuzu", name: "Yuzu", site: "https://github.com/yuzu-emu/yuzu-android", play: play("org.yuzu.yuzu_emu") },
  "org.yuzu.yuzu_emu.ea": { id: "yuzu-ea", name: "Yuzu Early Access", site: "https://github.com/yuzu-emu/yuzu-android", play: play("org.yuzu.yuzu_emu.ea") },
  "io.retroshark.yuzu": { id: "yuzu-retroshark", name: "Yuzu (RetroShark)", site: "https://github.com/retroshark/yuzu-android", play: play("io.retroshark.yuzu") },
  "dev.eden.eden_emulator": { id: "eden", name: "Eden", site: "https://github.com/StratoEmu/Eden", play: play("dev.eden.eden_emulator") },
  "org.sudachi.sudachi_emu": { id: "sudachi", name: "Sudachi", site: "https://github.com/emu-dev/Sudachi", play: play("org.sudachi.sudachi_emu") },
  "org.citron.citron_emu": { id: "citron", name: "Citron", site: "https://github.com/citron-emu/citron", play: play("org.citron.citron_emu") },
  "emu.skyline": { id: "skyline", name: "Skyline", site: "https://github.com/skyline-emu/skyline", play: play("emu.skyline") },
  "emu.strato": { id: "strato", name: "Strato", site: "https://github.com/StratoEmu/Strato", play: play("emu.strato") },
  "com.xiaoji.gamesirnsemulator.x.google": { id: "egg-ns", name: "Egg NS", site: "https://www.gamepad.cn/", play: play("com.xiaoji.gamesirnsemulator.x.google") },

  // ---- Sony ------------------------------------------------------------------
  "com.github.stenzek.duckstation": { id: "duckstation", name: "DuckStation", site: "https://www.duckstation.org/", play: play("com.github.stenzek.duckstation") },
  "com.epsxe.ePSXe": { id: "epsxe", name: "ePSXe", site: "https://www.epsxe.com/", play: play("com.epsxe.ePSXe") },
  "com.emulator.fpse": { id: "fpse", name: "FPse", site: "https://www.fpsece.net/", play: play("com.emulator.fpse") },
  "com.emulator.fpse64": { id: "fpse64", name: "FPse 64", site: "https://www.fpsece.net/", play: play("com.emulator.fpse64") },
  "com.jabosoft.silverarrow": { id: "silverarrow", name: "SilverArrow", site: "https://play.google.com/store/apps/details?id=com.jabosoft.silverarrow", play: play("com.jabosoft.silverarrow") },
  "com.explusalpha.PsxEmu": { id: "psx-emu", name: "PSX.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.PsxEmu") },
  "xyz.aethersx2.android": { id: "aethersx2", name: "AetherSX2", site: "https://www.aethersx2.com/", play: play("xyz.aethersx2.android") },
  "xyz.aether.sx2": { id: "nethersx2", name: "NetherSX2", site: "https://github.com/NovaSquirrel/NetherSX2", play: play("xyz.aether.sx2") },
  "com.virtualapplications.play": { id: "play", name: "Play!", site: "https://github.com/jpd002/Play-", play: play("com.virtualapplications.play") },
  "com.damonplay.damonps2.free": { id: "damonps2", name: "DamonPS2", site: "https://www.damonps2.com/", play: play("com.damonplay.damonps2.free") },
  "com.armsx3": { id: "armsx3", name: "ARMSX3", site: "https://github.com/ARMSX2/ARMSX3", apk: "https://github.com/ARMSX2/ARMSX3/releases/download/0.7.2/ARMSX3-0.7.2.apk" },
  "org.ppsspp.ppsspp": { id: "ppsspp", name: "PPSSPP", site: "https://www.ppsspp.org/", play: play("org.ppsspp.ppsspp") },
  "org.ppsspp.ppssppgold": { id: "ppsspp-gold", name: "PPSSPP Gold", site: "https://www.ppsspp.org/", play: play("org.ppsspp.ppssppgold") },
  "com.github.eka2l1": { id: "vita3k", name: "Vita3K", site: "https://vita3k.org/", play: play("com.github.eka2l1") },

  // ---- Sega ------------------------------------------------------------------
  "com.flycast.emulator": { id: "flycast", name: "Flycast", site: "https://github.com/flyinghead/flycast", play: play("com.flycast.emulator") },
  "com.reicast.emulator": { id: "reicast", name: "Reicast", site: "https://github.com/reicast/reicast-emulator", play: play("com.reicast.emulator") },
  "io.recompiled.redream": { id: "redream", name: "Redream", site: "https://redream.io/", play: play("io.recompiled.redream") },
  "org.devmiyax.yabasanshioro2": { id: "yabasanshiro2", name: "Yaba Sanshiro 2", site: "https://github.com/devmiyax/yabause", play: play("org.devmiyax.yabasanshioro2") },
  "com.explusalpha.SaturnEmu": { id: "saturn-emu", name: "Saturn.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.SaturnEmu") },
  "org.bbflight.yabause": { id: "yabause", name: "Yabause", site: "https://github.com/Yabause/yabause", play: play("org.bbflight.yabause") },

  // ---- .emu suite ------------------------------------------------------------
  "com.explusalpha.Snes9xPlus": { id: "snes9x-ex", name: "Snes9x EX+", site: "https://www.explusalpha.com/", play: play("com.explusalpha.Snes9xPlus") },
  "com.explusalpha.NesEmu": { id: "nes-emu", name: "NES.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.NesEmu") },
  "com.explusalpha.GbaEmu": { id: "gba-emu", name: "GBA.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.GbaEmu") },
  "com.explusalpha.GbcEmu": { id: "gbc-emu", name: "GBC.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.GbcEmu") },
  "com.explusalpha.MdEmu": { id: "md-emu", name: "MD.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.MdEmu") },
  "com.explusalpha.MsxEmu": { id: "msx-emu", name: "MSX.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.MsxEmu") },
  "com.explusalpha.NeoEmu": { id: "neo-emu", name: "NEO.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.NeoEmu") },
  "com.explusalpha.NgpEmu": { id: "ngp-emu", name: "NGP.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.NgpEmu") },
  "com.explusalpha.C64Emu": { id: "c64-emu", name: "C64.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.C64Emu") },
  "com.explusalpha.LynxEmu": { id: "lynx-emu", name: "Lynx.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.LynxEmu") },
  "com.explusalpha.A2600Emu": { id: "a2600-emu", name: "2600.emu", site: "https://www.explusalpha.com/", play: play("com.explusalpha.A2600Emu") },
  "com.PceEmu": { id: "pce-emu", name: "PCE.emu", site: "https://www.explusalpha.com/", play: play("com.PceEmu") },

  // ---- Nostalgia suite -------------------------------------------------------
  "com.nostalgiaemulators.neslite": { id: "nostalgia-nes", name: "Nostalgia.NES", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.neslite") },
  "com.nostalgiaemulators.nespro": { id: "nostalgia-nes-pro", name: "Nostalgia.NES Pro", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.nespro") },
  "com.nostalgiaemulators.sneslite": { id: "nostalgia-snes", name: "Nostalgia.SNES", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.sneslite") },
  "com.nostalgiaemulators.snespro": { id: "nostalgia-snes-pro", name: "Nostalgia.SNES Pro", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.snespro") },
  "com.nostalgiaemulators.gbalite": { id: "nostalgia-gba", name: "Nostalgia.GBA", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.gbalite") },
  "com.nostalgiaemulators.gbapro": { id: "nostalgia-gba-pro", name: "Nostalgia.GBA Pro", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.gbapro") },
  "com.nostalgiaemulators.gbclite": { id: "nostalgia-gbc", name: "Nostalgia.GBC", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.gbclite") },
  "com.nostalgiaemulators.gbcpro": { id: "nostalgia-gbc-pro", name: "Nostalgia.GBC Pro", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.gbcpro") },
  "com.nostalgiaemulators.gglite": { id: "nostalgia-gg", name: "Nostalgia.GG", site: "https://nostalgiaemulators.com/", play: play("com.nostalgiaemulators.gglite") },

  // ---- John / Pizza Boy / misc handhelds -------------------------------------
  "com.johnemulators.johnness": { id: "john-nes", name: "John NES", site: "https://www.johnemulators.com/", play: play("com.johnemulators.johnness") },
  "com.johnemulators.johngba": { id: "john-gba", name: "John GBA", site: "https://www.johnemulators.com/", play: play("com.johnemulators.johngba") },
  "com.johnemulators.johngbac": { id: "john-gba-lite", name: "John GBA Lite", site: "https://www.johnemulators.com/", play: play("com.johnemulators.johngbac") },
  "com.johnemulators.johngbc": { id: "john-gbc", name: "John GBC", site: "https://www.johnemulators.com/", play: play("com.johnemulators.johngbc") },
  "it.dbtecno.pizzaboy": { id: "pizzaboy", name: "Pizza Boy", site: "https://www.pizzaboyemulator.com/", play: play("it.dbtecno.pizzaboy") },
  "it.dbtecno.pizzaboypro": { id: "pizzaboy-pro", name: "Pizza Boy Pro", site: "https://www.pizzaboyemulator.com/", play: play("it.dbtecno.pizzaboypro") },
  "it.dbtecno.pizzaboyc": { id: "pizzaboy-c", name: "Pizza Boy C", site: "https://www.pizzaboyemulator.com/", play: play("it.dbtecno.pizzaboyc") },
  "it.dbtecno.pizzaboycpro": { id: "pizzaboy-cpro", name: "Pizza Boy C Pro", site: "https://www.pizzaboyemulator.com/", play: play("it.dbtecno.pizzaboycpro") },
  "com.fastemulator.gba": { id: "my-boy", name: "My Boy!", site: "https://fastemulator.blogspot.com/", play: play("com.fastemulator.gba") },
  "com.Rekkuzan.UnityBoyAdvance": { id: "unityboyadvance", name: "UnityBoyAdvance", site: "https://github.com/Rekkuzan/UnityBoyAdvance", play: play("com.Rekkuzan.UnityBoyAdvance") },
  "com.hqgame.networknes": { id: "network-nes", name: "Network NES", site: "https://play.google.com/store/apps/details?id=com.hqgame.networknes", play: play("com.hqgame.networknes") },
  "com.hqgame.networksnes": { id: "network-snes", name: "Network SNES", site: "https://play.google.com/store/apps/details?id=com.hqgame.networksnes", play: play("com.hqgame.networksnes") },
  "com.hqgame.networkgba": { id: "network-gba", name: "Network GBA", site: "https://play.google.com/store/apps/details?id=com.hqgame.networkgba", play: play("com.hqgame.networkgba") },
  "com.neutronemulation.super_retro_16": { id: "superretro16", name: "SuperRetro16", site: "https://play.google.com/store/apps/details?id=com.neutronemulation.super_retro_16", play: play("com.neutronemulation.super_retro_16") },
  "com.zsnes.superzsnes": { id: "superzsnes", name: "SuperZSNES", site: "https://play.google.com/store/apps/details?id=com.zsnes.superzsnes", play: play("com.zsnes.superzsnes") },
  "com.philj56.gbcc": { id: "gbcc", name: "gbcc", site: "https://github.com/philj56/gbcc", play: play("com.philj56.gbcc") },

  // ---- Classic console singles ------------------------------------------------
  "ca.halsafar.nesdroid": { id: "nes-droid", name: "NESdroid", site: "https://play.google.com/store/apps/details?id=ca.halsafar.nesdroid", play: play("ca.halsafar.nesdroid") },
  "ca.halsafar.snesdroid": { id: "snes-droid", name: "SNESdroid", site: "https://play.google.com/store/apps/details?id=ca.halsafar.snesdroid", play: play("ca.halsafar.snesdroid") },
  "ca.halsafar.mgbadroid": { id: "gb-droid", name: "GameBoy droid", site: "https://play.google.com/store/apps/details?id=ca.halsafar.mgbadroid", play: play("ca.halsafar.mgbadroid") },
  "ca.halsafar.gambattedroid": { id: "gba-droid", name: "GameBoy Advanced droid", site: "https://play.google.com/store/apps/details?id=ca.halsafar.gambattedroid", play: play("ca.halsafar.gambattedroid") },
  "ca.halsafar.genesisdroid": { id: "genesis-droid", name: "GenesisDroid", site: "https://play.google.com/store/apps/details?id=ca.halsafar.genesisdroid", play: play("ca.halsafar.genesisdroid") },
  "uk.co.philpotter.masteremu": { id: "masteremu", name: "MasterEmu", site: "https://play.google.com/store/apps/details?id=uk.co.philpotter.masteremu", play: play("uk.co.philpotter.masteremu") },
  "org.icculus.virtualjaguar": { id: "virtualjaguar", name: "Virtual Jaguar", site: "https://www.icculus.org/virtualjaguar/", play: play("org.icculus.virtualjaguar") },
  "com.jillybunch.kat5200": { id: "kat5200", name: "kat5200", site: "https://kat5200.jillybunch.com/", play: play("com.jillybunch.kat5200") },
  "com.fms.fmsx": { id: "fmsx", name: "fMSX", site: "https://fms.komkon.org/fMSX/", play: play("com.fms.fmsx") },
  "org.openmsx.android.openmsx": { id: "openmsx", name: "openMSX", site: "https://openmsx.org/", play: play("org.openmsx.android.openmsx") },

  // ---- Arcade / MAME -----------------------------------------------------------
  "com.seleuco.mame4droid": { id: "mame4droid", name: "MAME4droid", site: "https://seleuco.com/mame4droid.html", play: play("com.seleuco.mame4droid") },
  "com.seleuco.mame4d2024": { id: "mame4droid-current", name: "MAME4droid (2024)", site: "https://seleuco.com/mame4droid.html", play: play("com.seleuco.mame4d2024") },
  "com.seleuco.mame4all": { id: "mame4droid-m4a", name: "MAME4droid (MAME4All)", site: "https://seleuco.com/mame4droid.html", play: play("com.seleuco.mame4all") },

  // ---- Computers / engines -------------------------------------------------------
  "org.scummvm.scummvm": { id: "scummvm", name: "ScummVM", site: "https://www.scummvm.org/", play: play("org.scummvm.scummvm") },
  "org.residualvm.residualvm": { id: "residualvm", name: "ResidualVM", site: "https://www.residualvm.org/", play: play("org.residualvm.residualvm") },
  "bruenor.magicbox": { id: "magic-dosbox", name: "Magic DOSBox", site: "https://sourceforge.net/projects/magicdosbox/", play: play("bruenor.magicbox") },
  "com.fishstix.dosbox": { id: "dosbox-turbo", name: "DOSBox Turbo", site: "https://play.google.com/store/apps/details?id=com.fishstix.dosbox", play: play("com.fishstix.dosbox") },
  "com.fishstix.dosboxfree": { id: "afreebox", name: "aFreeBox", site: "https://play.google.com/store/apps/details?id=com.fishstix.dosboxfree", play: play("com.fishstix.dosboxfree") },
  "com.locnet.dosbox": { id: "andosbox", name: "anDOSBox", site: "https://play.google.com/store/apps/details?id=com.locnet.dosbox", play: play("com.locnet.dosbox") },
  "net.sourceforge.bochs": { id: "bochs", name: "Bochs", site: "https://sourceforge.net/projects/bochs/", play: play("net.sourceforge.bochs") },
  "atua.anddev.uae4all2": { id: "uae4all2", name: "UAE4All2", site: "https://github.com/Turran/UAE4All2", play: play("atua.anddev.uae4all2") },
  "com.locnet.uae": { id: "uae4droid", name: "UAE4Droid", site: "https://play.google.com/store/apps/details?id=com.locnet.uae", play: play("com.locnet.uae") },
  "org.ab.uae": { id: "uae4all", name: "UAE4All", site: "https://play.google.com/store/apps/details?id=org.ab.uae", play: play("org.ab.uae") },
  "com.locnet.vice": { id: "vice", name: "VICE", site: "https://play.google.com/store/apps/details?id=com.locnet.vice", play: play("com.locnet.vice") },
  "de.joergjahnke.c64.android": { id: "c64-jahnke", name: "C64", site: "https://play.google.com/store/apps/details?id=de.joergjahnke.c64.android", play: play("de.joergjahnke.c64.android") },
  "org.ab.c64": { id: "c64-ab", name: "C64", site: "https://play.google.com/store/apps/details?id=org.ab.c64", play: play("org.ab.c64") },

  // ---- DOOM / source ports ------------------------------------------------------
  "com.opentouchgaming.gzdoomfree": { id: "delta-touch", name: "GZDoom (Delta Touch)", site: "https://www.opentouchgaming.com/", play: play("com.opentouchgaming.gzdoomfree") },
  "com.opentouchgaming.gzdoom": { id: "delta-touch-full", name: "GZDoom (Delta Touch Full)", site: "https://www.opentouchgaming.com/", play: play("com.opentouchgaming.gzdoom") },
};

// Resolve merge entries into per-id package lists.
const byId = new Map();
for (const [pkg, cfg] of Object.entries(EMU)) {
  let entry = byId.get(cfg.id);
  if (!entry) {
    entry = { id: cfg.id, name: cfg.name, packages: [], siteUrl: cfg.site, playStoreUrl: cfg.play, apkUrl: cfg.apk };
    byId.set(cfg.id, entry);
  }
  entry.packages.push(pkg);
}
for (const [pkg, id] of Object.entries(MERGE)) {
  const entry = byId.get(id);
  if (!entry) throw new Error(`MERGE target id "${id}" not defined`);
  if (!entry.packages.includes(pkg)) entry.packages.push(pkg);
}

const pkgToId = new Map();
for (const [pkg, id] of Object.entries(MERGE)) pkgToId.set(pkg, id);
for (const [pkg, cfg] of Object.entries(EMU)) pkgToId.set(pkg, cfg.id);

const idForPackage = (pkg) => {
  if (DROP.has(pkg)) return null;
  return pkgToId.get(pkg) ?? null;
};

// ---- transform systems ----------------------------------------------------------
const raw = JSON.parse(readFileSync(systemsPath, "utf8"));
const dropped = new Set();
const systems = [];
for (const sys of raw) {
  const emulators = [];
  for (const v of sys.emulators ?? []) {
    const core = typeof v.core === "string" ? v.core : undefined;
    if (DROP_FROM[v.package]?.has(sys.id)) {
      dropped.add(`${sys.id}:${v.name}`);
      continue;
    }
    if (core && DROP_CORE_FROM[core]?.has(sys.id)) {
      dropped.add(`${sys.id}:${v.name} (core ${core})`);
      continue;
    }
    const id = idForPackage(v.package);
    if (!id) {
      dropped.add(`${sys.id}:${v.name}`);
      continue;
    }
    // Special-case: Pizza Boy Pro is the GBA app; it was mislabeled under gb/gbc.
    if (id === "pizzaboy-pro" && (sys.id === "gb" || sys.id === "gbc")) {
      dropped.add(`${sys.id}:${v.name} -> GBA only`);
      continue;
    }
    const variant = { emulator: id };
    if (core) variant.core = core;
    if (v.extras !== undefined) variant.extras = v.extras;
    if (typeof v.mimeType === "string") variant.mimeType = v.mimeType;
    if (typeof v.activity === "string") variant.activity = v.activity;
    if (v.favourite === true) variant.favourite = true;
    emulators.push(variant);
  }
  // Dedupe identical (id, core, extras) variants (merged packages collapse).
  const seen = new Set();
  const deduped = emulators.filter((v) => {
    const key = `${v.emulator}|${v.core ?? ""}|${JSON.stringify(v.extras ?? {})}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  systems.push({ ...sys, emulators: deduped });
}

// Add the real Pizza Boy C entries to gb/gbc (they were misattributed before).
for (const sid of ["gb", "gbc"]) {
  const sys = systems.find((s) => s.id === sid);
  if (sys) {
    sys.emulators.push({ emulator: "pizzaboy-c" });
    sys.emulators.push({ emulator: "pizzaboy-cpro" });
  }
}
// Add Pizza Boy Pro to gba (it exists there for the paid variant).
const gba = systems.find((s) => s.id === "gba");
if (gba) gba.emulators.push({ emulator: "pizzaboy-pro" });

// Add ARMSX3 as the PS3 emulator.
const ps3 = systems.find((s) => s.id === "ps3");
if (ps3) ps3.emulators.push({ emulator: "armsx3", favourite: true });

// Every system offering RetroArch also offers the other two real builds (same
// core, same extras) so each appears as its own suggestion card / candidate.
for (const familyId of ["retroarch-plus", "retroarch-32"]) {
  for (const sys of systems) {
    const retroVariants = sys.emulators.filter((v) => v.emulator === "retroarch");
    if (retroVariants.length === 0) continue;
    const existing = new Set(
      sys.emulators.filter((v) => v.emulator === familyId).map((v) => `${v.core ?? ""}|${JSON.stringify(v.extras ?? {})}`),
    );
    for (const v of retroVariants) {
      const key = `${v.core ?? ""}|${JSON.stringify(v.extras ?? {})}`;
      if (existing.has(key)) continue;
      existing.add(key);
      const copy = { emulator: familyId };
      if (v.core !== undefined) copy.core = v.core;
      if (v.extras !== undefined) copy.extras = v.extras;
      if (typeof v.mimeType === "string") copy.mimeType = v.mimeType;
      if (typeof v.activity === "string") copy.activity = v.activity;
      sys.emulators.push(copy);
    }
  }
}

const master = Array.from(byId.values())
  .map((e) => {
    const out = { id: e.id, name: e.name, packages: e.packages, siteUrl: e.siteUrl };
    if (e.playStoreUrl) out.playStoreUrl = e.playStoreUrl;
    if (e.apkUrl) out.apkUrl = e.apkUrl;
    const links = buildLinks({ id: e.id, siteUrl: e.siteUrl, playStoreUrl: e.playStoreUrl, apkUrl: e.apkUrl });
    if (links.length > 0) out.links = links;
    return out;
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const out = { emulators: master, systems };
writeFileSync(systemsPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`master entries: ${master.length}`);
console.log(`systems: ${systems.length}`);
console.log(`dropped ${dropped.size}: ${[...dropped].sort().join(", ")}`);
