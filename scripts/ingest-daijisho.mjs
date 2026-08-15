#!/usr/bin/env node
/**
 * Ingests the Daijishō platform DB (the reference Android emulator launch data)
 * into config/systems.json:
 *   - every STANDALONE (non-RetroArch) player that isn't configured yet becomes a
 *     new `emulators[]` master entry (id/name/packages/activity/launchArgs) +
 *     a per-system variant,
 *   - fork/variant packages fold into the id they belong to (FOLD map),
 *   - recipe gap-fill: existing ids that lack `activity`/`launchArgs` get the
 *     Daijishō recipe written in.
 *   - media/streaming apps are collected into config/apps.json (MEDIA set).
 *
 * RetroArch-core players are skipped: the 203-core metagen ingest already covers
 * system→core mapping. Deterministic + idempotent; hand-curated maps (PLATFORM,
 * FOLD, PKG_META, MEDIA) are the only human-maintained part.
 *
 * Source: https://github.com/TapiocaFox/Daijishou (platforms/*.json)
 *   node scripts/ingest-daijisho.mjs
 * Run `node scripts/validate.mjs` afterwards.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = join(root, "config", "systems.json");
const APPS = join(root, "config", "apps.json");
const LIST_URL = "https://api.github.com/repos/TapiocaFox/Daijishou/contents/platforms";
const RAW = "https://raw.githubusercontent.com/TapiocaFox/Daijishou/main/platforms/";

// ---- Daijishō platform filename -> our system id (additive; new ids auto-create) ----
const PLATFORM = {
  "3DO": "3do", "AmstradCPC": "amstradcpc", "AppleII": "apple2", "ArcadeFinalBurnNeo": "fba",
  "ArcadeMAME": "mame", "Arcadia2001": "arcadia2001", "Arduboy": "arduboy",
  "Atari2600": "atari2600", "Atari5200": "atari5200", "Atari7800": "atari7800",
  "AtariJaguar": "jaguar", "AtariJaguarCD": "jaguarcd", "AtariLynx": "lynx",
  "AtariST": "atarist", "Atomiswave": "atomiswave", "BBCMicro": "bbc",
  "CaveStoryGameEngine": "nxengine", "Chip8": "chip8", "ColecoVision": "colecovision",
  "Commodore64": "c64", "CommodoreAmiga": "amiga", "CommodorePET": "pet",
  "CommodorePlus4": "plus4", "CPS1": "fba", "CPS2": "fba", "CPS3": "fba",
  "DOOMGameEngine": "doom", "DOS": "dos", "Dreamcast": "dreamcast",
  "FairchildChannelF": "fairchild", "FamicomDiskSystem": "fds", "FlashbackGameEngine": "flashback",
  "FlashPlayer": "flash", "FMTowns": "fmtowns", "IdTech4A": "idtech4a",
  "Intellivision": "intellivision", "IntertonVC4000": "intertonvc4000", "JavaMe": "j2me",
  "LowResNX": "lowresnx", "MagnavoxOdyssey2": "odyssey2", "MegaDuck": "megaduck",
  "MicrosoftXbox": "xbox", "MicrosoftXbox360": "xbox360", "MSX": "msx",
  "NECPC88": "pc88", "NECPC98": "pc98", "NECPCFX": "pcfx", "NeoGeo": "neogeo",
  "NeoGeoCD": "neogeocd", "NeoGeoPocket": "ngpc", "NeoGeoPocketColor": "ngpc",
  "Ngage": "ngage", "Nintendo3DS": "n3ds", "Nintendo64": "n64", "NintendoDS": "nds",
  "NintendoDSi": "ndsi", "NintendoEntertainmentSystem": "nes", "NintendoGameBoy": "gb",
  "NintendoGameBoyAdvance": "gba", "NintendoGameBoyColor": "gbc", "NintendoGameCube": "gcn",
  "NintendoSatellaview": "satellaview", "NintendoSwitch": "nsw", "NintendoWii": "wii",
  "NintendoWiiU": "wiiu", "NintendoWiiWare": "wiiware", "Oric": "oric", "PalmOS": "palm",
  "PhilipsCDi": "cdimono1", "PICO8": "pico8", "PlayStationPortable": "psp",
  "PlayStationPortableMinis": "psp", "PokemonMini": "pokemini", "Quake": "quake",
  "QuakeII": "quake2", "RPGMaker": "rpgmaker", "ScummVM": "scummvm", "Sega32X": "sega32x",
  "SegaCD": "segacd", "SegaGameGear": "gg", "SegaGenesis": "genesis",
  "SegaGenesisMSU": "genesis", "SegaMasterSystem": "sms", "SegaModel3": "model3",
  "SegaNAOMI": "naomi", "SegaSaturn": "saturn", "SegaSG1000": "sg1000",
  "SharpX1": "sharpx1", "SharpX68000": "x68000", "SonyPlayStation": "psx",
  "SonyPlayStation2": "ps2", "SonyPlayStation3": "ps3", "SonyPSVita": "psvita",
  "SuperGrafx": "supergrafx", "SuperNintendoEntertainmentSystem": "snes",
  "SuperNintendoEntertainmentSystemMSU1": "snes", "TIC80": "tic80", "TurboGrafx16": "tg16",
  "TurboGrafxCD": "pcecd", "Uzebox": "uzebox", "Vectrex": "vectrex", "VIC20": "vic20",
  "VirtualBoy": "virtualboy", "WASM4": "wasm4", "WataraSupervision": "supervision",
  "Windows": "windows", "WonderSwan": "wonderswan", "WonderSwanColor": "wonderswancolor",
  "ZX81": "zx81", "ZXSpectrum": "zxspectrum",
};

// Platform files we deliberately do not ingest (engines / streaming / test / junk).
const SKIP_PLATFORM = new Set([
  "Android.json.deprecated", "BookReader", "CannonballOutRunEngine", "ElektorTVGamesComputer",
  "MagicDOSBOX.json.test", "Moonlight", "NECPC60.json.test", "Ports", "Steam",
  "SuperCassetteVision.json.test", "ThomsonTO8.json.test", "TI83.json.test",
  "Triforce", "VideoPlayer", "XboxGamePass", "Zeebo.json.test", "FMTowns.json.test",
  "CassetteVision.json.test", "IdTech4A", "Oric.json.test", "NECPC60.json.test",
  "CannonballOutRunEngine", "PhilipsVideopacG7400", "SegaPico",
]);

// Junk/trick packages (benchmark/game apps repackaged as emulators) — never ingest.
const SKIP_PKG = new Set(["com.miHoYo.Yuanshen", "com.antutu.ABenchMark"]);

// ---- fork/variant package -> the id it belongs to (fold into existing id) ----
const FOLD = {
  "com.mupen64plusae.v3.alpha": "mupen64plus-ae", "org.mupen64plusae.v3.alpha": "mupen64plus-ae",
  "org.mupen64plusae.v3.fzurita.pro": "m64plus-fz-pro",
  "com.fastemulator.gbcfree": "my-oldboy", "it.dbtecno.pizzaboygba": "pizzaboy",
  "it.dbtecno.pizzaboygbapro": "pizzaboy-pro", "it.dbtecno.pizzaboyscpro": "pizzaboy-cpro",
  "org.dolphinemu.dolphinemu.debug": "dolphin", "com.joeyos.dolphinemu": "dolphin",
  "org.dolphinemu.mmjr": "dolphin", "org.dolphinemu.mmjr3": "dolphin",
  "org.mm.j": "dolphin", "org.mm.jr": "dolphin",
  "org.dolphinemu.primehack": "dolphin", "org.shiiion.primehack": "dolphin",
  "org.dolphinemu.ishiirukadark": "dolphin", "org.dolphin.ishiirukadark": "dolphin",
  "org.citra.citra_emu.canary": "citra-mmj", "org.gamerytb.lemonade.canary": "citra-mmj",
  "io.github.azaharplus.android": "azahar", "org.azahar_emu.azahar": "azahar",
  "xyz.aethersx2.cturnip": "aethersx2", "xyz.aethersx2.custom": "aethersx2",
  "xyz.aethersx2.tturnip": "aethersx2",
  "me.magnum.melonds.dev": "melonds", "me.magnum.melonds.nightly": "melonds",
  "me.magnum.melondualds": "melonds",
  "org.ppsspp.ppsspplegacy": "ppsspp",
  "dev.eden.eden_emulator.nightly": "eden", "dev.eden.eden_nightly": "eden",
  "dev.legacy.eden_emulator": "eden",
  "org.sudachi.sudachi_emu.ea": "sudachi",
  "org.vita3k.emulator.ikhoeyZX": "vita3k",
  "com.explusalpha.neoemu": "neo-emu", "com.PceEmu": "pce-emu",
  "org.scummvm.scummvm.debug": "scummvm",
  "com.nanodata.armsx": "armsx3", "com.armsx2": "armsx3", "come.nanodata.armsx2": "armsx3",
  "come.nanodata.armsx2.debug": "armsx3", "org.stratoemu.strato": "strato",
  "skyline.emu": "skyline", "org.retroarch": "retroarch",
  "org.libretro.retroarch64": "retroarch-plus",
  "emuready.nyushu.ABenchMark": "nyushu",
};

// ---- curated master data for NEW standalone ids (id -> {name, site, play?, apk?}) ----
const PKG_META = {
  "com.winlator": { id: "winlator", name: "Winlator", site: "https://winlator.org/", play: "com.winlator" },
  "com.winlator.cmod": { id: "winlator-cmod", name: "Winlator (CMod)", site: "https://github.com/cmodmirror/winlator-cmod" },
  "com.cmodded.winlator": { id: "winlator-cmod", name: "Winlator (CMod)", site: "https://github.com/cmodmirror/winlator-cmod" },
  "com.micewine.emu": { id: "micewine", name: "MiceWine", site: "https://github.com/MiceWine/micewine" },
  "info.cemu.cemu": { id: "cemu", name: "CEMU", site: "https://cemu.info/", play: "info.cemu.cemu" },
  "aenu.ax360e": { id: "ax360e", name: "AX360E", site: "https://github.com/aenu/X360" },
  "aenu.ax360e.free": { id: "ax360e", name: "AX360E (Free)", site: "https://github.com/aenu/X360" },
  "emu.x360.mobile": { id: "x360-mobile", name: "X360 Mobile", site: "https://github.com/x360emu/x360" },
  "xendroid.compose": { id: "xendroid", name: "XenDroid", site: "https://github.com/Xenos2X/xendroid" },
  "aenu.aps3e": { id: "aps3e", name: "APS3E", site: "https://github.com/aenu/APS3" },
  "com.sbro.emucorex": { id: "emucorex", name: "EmuCore X", site: "https://github.com/sbro-moe/EmuCore" },
  "com.sbro.emucorev": { id: "emucorev", name: "EmuCore V", site: "https://github.com/sbro-moe/EmuCore" },
  "org.vita3k.emulator": { id: "vita3k", name: "Vita3K", site: "https://vita3k.org/", play: "org.vita3k.emulator" },
  "com.sa_moo_rai.picpic": { id: "picpic", name: "PicPic", site: "https://github.com/sa-moo-rai/PicPic" },
  "me.dt2dev.infinity": { id: "infinity", name: "Infinity", site: "https://github.com/dt2dev/Infinity" },
  "io.wip.pico8": { id: "pico8-launcher", name: "PICO-8 Launcher", site: "https://github.com/lyricly/pico8-android" },
  "ru.playsoftware.j2meloader": { id: "j2meloader", name: "J2ME Loader", site: "https://j2meloader.tech/", play: "ru.playsoftware.j2meloader" },
  "ru.woesss.j2meloader": { id: "j2meloader-woesss", name: "J2ME Loader (woesss)", site: "https://github.com/woesss/J2ME-Loader" },
  "rs.ruffle": { id: "ruffle", name: "Ruffle", site: "https://ruffle.rs/", play: "rs.ruffle" },
  "io.navivani.swiff": { id: "swiff", name: "Swiff", site: "https://github.com/vytskaaltman/Swiff" },
  "com.issess.flashplayer": { id: "flash-player", name: "Flash Player", site: "https://github.com/issess/FlashPlayer" },
  "com.issess.flashplayerpro": { id: "flash-player-pro", name: "Flash Player Pro", site: "https://github.com/issess/FlashPlayer" },
  "com.simongellis.vvb": { id: "vvb", name: "VirtualBoy Go", site: "https://github.com/simongellis/VirtualBoyGo" },
  "com.explusalpha.SwanEmu": { id: "swan-emu", name: "SwanEmu", site: "https://www.explusalpha.com/", play: "com.explusalpha.SwanEmu" },
  "com.fms.mg": { id: "mastergear", name: "MasterGear", site: "https://fms.komkon.org/MG/", play: "com.fms.mg" },
  "com.izzy2lost.super3": { id: "super3", name: "Supermodel 3", site: "https://github.com/izzy2lost/Supermodel3" },
  "com.amigan.droidarcadia": { id: "droidarcadia", name: "DroidArcadia", site: "https://github.com/amigan/DroidArcadia" },
  "com.pixelrespawn.linkboy": { id: "linkboy", name: "LinkBoy", site: "https://github.com/linkboy-emu/linkboy" },
  "com.sky.SkyEmu": { id: "skyemu", name: "SkyEmu", site: "https://github.com/skylersaleh/SkyEmu" },
  "com.karin.idTech4Amm": { id: "diii4a", name: "diii4a", site: "https://github.com/glKarin/com.n0n3m4.diii4a" },
  "org.force9.starboard": { id: "starboard", name: "Starboard", site: "https://force9.gg/" },
  "com.izzy2lost.x1box": { id: "x1box", name: "X1BOX", site: "https://github.com/izzy2lost/X1BOX" },
  "com.rfandango.haku_x": { id: "haku", name: "Haku", site: "https://github.com/Rfandango/Haku" },
  "dev.suyu.suyu_emu.relWithDebInfo": { id: "suyu", name: "Suyu", site: "https://suyu.dev/" },
  "org.kenjinx.android": { id: "kenjinx", name: "Kenjinx", site: "https://github.com/kenjinx/Kenjinx" },
  "org.benjisc.android": { id: "kenjinx", name: "Kenjinx", site: "https://github.com/kenjinx/Kenjinx" },
  "io.github.borked3ds.android": { id: "borked3ds", name: "Borked3DS", site: "https://github.com/valentinvanelslande/Borked3DS" },
  "io.github.mandarine3ds.mandarine": { id: "mandarine", name: "Mandarine", site: "https://github.com/wheremyfoodat/Mandarine" },
  "com.alber.panda3ds": { id: "panda3ds", name: "Panda3DS", site: "https://github.com/wheremyfoodat/Panda3DS", play: "com.alber.panda3ds" },
  "com.studio08.xbgamestream": { id: "xbgamestream", name: "xbGameStream", site: "https://github.com/studio-08/xbgamestream" },
};

// ---- media/streaming apps -> config/apps.json (any-system), pkg -> name ----
const MEDIA = {
  "com.mxtech.videoplayer.ad": "MX Player", "com.mxtech.videoplayer.pro": "MX Player Pro",
  "dev.anilbeesetti.nextplayer": "NextPlayer", "is.xyz.mpv": "MPV",
  "org.courville.nova": "Nova Video Player", "org.videolan.vlc": "VLC",
  "org.xbmc.kodi": "Kodi",
  "com.foobnix.pdf.reader": "Librera PDF", "com.foobnix.pro.pdf.reader": "Librera PDF Pro",
  "com.github.axet.bookreader": "Android Book Reader", "org.koreader.launcher": "KOReader",
  "org.readera": "Readera",
  "com.limelight": "Moonlight", "com.limelight.noir": "Moonlight Noir",
  "com.studio08.xbgamestream": "xbGameStream",
  "gamehub.lite": "GameHub", "banner.hub": "Banner Hub", "banner.hub.lite": "Banner Hub Lite",
  "com.ludashi.aibench": "AI Bench", "com.tencent.ig": "GameHub Lite", "app.gamenative": "GameNative",
};

// ---- recipe translation: Daijishō `am start` string -> {activity, launchArgs} ----
function translateAmStart(raw) {
  const lines = String(raw ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const tokens = [];
  for (const line of lines) {
    tokens.push(...line.split(/\s+/).filter(Boolean));
  }
  let activity;
  let action = "VIEW";
  const dataTokens = [];
  const extraTokens = [];
  let i = 0;
  const take = () => (i < tokens.length ? tokens[i++] : undefined);
  while (i < tokens.length) {
    const t = take();
    switch (t) {
      case "-n":
        activity = take();
        break;
      case "-a":
        { const v = take(); if (v === "android.intent.action.VIEW") action = "VIEW"; else if (v === "android.intent.action.MAIN") action = "MAIN"; else action = v; }
        break;
      case "-d":
        dataTokens.push(`d "${take()}"`);
        break;
      case "-t": case "-c": case "-f": case "-p": case "--user":
        take();
        break;
      case "-e": case "--es":
        { const k = take(); const v = take(); extraTokens.push(`e ${k} "${v}"`); }
        break;
      case "-ez":
        { const k = take(); const v = take(); extraTokens.push(`ez ${k} ${v}`); }
        break;
      case "-el":
        { const k = take(); const v = take(); extraTokens.push(`el ${k} ${v}`); }
        break;
      case "--esa":
        { const k = take(); const v = take(); extraTokens.push(`esa ${k} "${v}"`); }
        break;
      case "--activity-clear-task": case "--activity-clear-top":
      case "--activity-no-history": case "--activity-clear-when-task-reset":
      case "--activity-exclude-from-recents": case "--activity-no-user-action":
        break;
      default:
        // unknown flag with a value, or a stray token — consume defensively
        if (t.startsWith("-")) { const maybe = tokens[i]; if (maybe !== undefined && !maybe.startsWith("-")) take(); }
        break;
    }
  }
  const parts = [];
  if (action && action !== "VIEW") parts.push(action);
  parts.push(...dataTokens);
  parts.push(...extraTokens);
  return { activity: activity || undefined, launchArgs: parts.join(";") };
}

function isRetroArch(pkg) {
  return /^(com\.retroarch|org\.retroarch|org\.libretro\.retroarch64)/.test(pkg);
}

function slugFromPackage(pkg) {
  return pkg.split(".").filter((s) => s.length > 1).slice(-2).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// ---- load + fetch ----
function loadJson(path) {
  if (!existsSync(path)) throw new Error("missing " + path);
  return JSON.parse(readFileSync(path, "utf8"));
}

async function platformFileNames() {
  let names;
  try {
    const res = await fetch(LIST_URL, { headers: { "User-Agent": "pocketconsole-tools" } });
    if (res.ok) {
      const arr = await res.json();
      names = arr.filter((e) => e.type === "file" && e.name.endsWith(".json") && !e.name.endsWith(".deprecated"))
        .map((e) => e.name);
    }
  } catch {
    names = null;
  }
  if (!names || names.length === 0) {
    console.error("could not list platforms via API; falling back to embedded list");
    names = Object.keys(PLATFORM).map((n) => n + ".json");
  }
  return names.filter((n) => !n.includes(".test") && !n.includes(".deprecated") && n !== "index.json");
}

async function main() {
  const systems = loadJson(CONFIG);
  const emulators = systems.emulators || [];
  const sysList = systems.systems || [];

  const idByPackage = new Map();
  for (const e of emulators) for (const p of e.packages || []) idByPackage.set(p.toLowerCase(), e.id);

  const names = await platformFileNames();
  const fetched = [];
  const errors = [];
  for (const name of names) {
    const base = name.replace(/\.json$/, "");
    if (SKIP_PLATFORM.has(name) || SKIP_PLATFORM.has(base)) continue;
    const sysId = PLATFORM[base];
    try {
      const res = await fetch(RAW + name, { headers: { "User-Agent": "pocketconsole-tools" } });
      if (!res.ok) { errors.push(name + " HTTP " + res.status); continue; }
      const doc = await res.json();
      fetched.push({ name, sysId, doc });
    } catch (err) {
      errors.push(name + " " + err.message);
    }
  }
  console.log(`fetched ${fetched.length} platforms (${errors.length} errors)`);
  for (const e of errors) console.error("  ERR " + e);

  const seen = new Set();
  const newIds = new Map(); // id -> {name, site, play, packages[], recipes:Set, systems:Set}
  const newVariants = []; // {system, emulator, activity?, core?}
  const touchedExisting = new Set();
  let folded = 0;
  const noSite = new Set();

  // Curated display data for systems the ingester may CREATE (name + rom folder).
const SYS_META = {
  arcadia2001: { name: "Emerson - Arcadia 2001", folder: "Arcadia 2001" },
  flash: { name: "Adobe - Flash", folder: "Flash" },
  model3: { name: "Sega - Model 3", folder: "Model 3" },
};

function ensureNewId(pkg, sysId, recipe) {
    const key = pkg.toLowerCase();
    const existing = idByPackage.get(key);
    if (existing) {
      touchedExisting.add(existing);
      const emu = emulators.find((e) => e.id === existing);
      if (emu && !emu.activity && recipe.activity) emu.activity = recipe.activity;
      if (emu && !emu.launchArgs && recipe.launchArgs) emu.launchArgs = recipe.launchArgs;
      if (sysId && sysList.some((s) => s.id === sysId)) newVariants.push({ system: sysId, emulator: existing, activity: recipe.activity });
      return existing;
    }
    const meta = PKG_META[pkg];
    const id = meta?.id || slugFromPackage(pkg);
    // id collision with an existing emulator -> fold package+recipe into it.
    const existingById = emulators.find((e) => e.id === id);
    if (existingById) {
      if (!existingById.packages.includes(pkg)) existingById.packages.push(pkg);
      if (!existingById.activity && recipe.activity) existingById.activity = recipe.activity;
      if (!existingById.launchArgs && recipe.launchArgs) existingById.launchArgs = recipe.launchArgs;
      touchedExisting.add(id);
      if (sysId && sysList.some((s) => s.id === sysId)) newVariants.push({ system: sysId, emulator: id, activity: recipe.activity });
      return id;
    }
    if (!newIds.has(id)) {
      newIds.set(id, {
        id, name: meta?.name || id, site: meta?.site, play: meta?.play, packages: new Set(),
        recipes: new Map(), systems: new Set(), seenPkg: pkg,
      });
    }
    const rec = newIds.get(id);
    rec.packages.add(pkg);
    if (!rec.recipes.has(recipe.activity || "")) rec.recipes.set(recipe.activity || "", recipe);
    if (sysId) rec.systems.add(sysId);
    if (!meta?.site) noSite.add(id);
    return id;
  }

  for (const { name, sysId, doc } of fetched) {
    const players = Array.isArray(doc.playerList) ? doc.playerList : [];
    for (const p of players) {
      const { activity, launchArgs } = translateAmStart(p.amStartArguments);
      const pkg = activity ? activity.split("/")[0] : null;
      if (!pkg || isRetroArch(pkg) || SKIP_PKG.has(pkg)) continue;
      if (seen.has(pkg.toLowerCase())) continue;
      seen.add(pkg.toLowerCase());
      const recipe = { activity, launchArgs };
      const foldedId = FOLD[pkg];
      if (foldedId) {
        const id = foldedId;
        touchedExisting.add(id);
        const emu = emulators.find((e) => e.id === id);
        if (emu && !emu.packages.includes(pkg)) emu.packages.push(pkg);
        if (emu && !emu.activity && recipe.activity) emu.activity = recipe.activity;
        if (emu && !emu.launchArgs && recipe.launchArgs) emu.launchArgs = recipe.launchArgs;
        if (sysId && sysList.some((s) => s.id === sysId)) newVariants.push({ system: sysId, emulator: id, activity: recipe.activity });
        folded++;
        continue;
      }
      if (MEDIA[pkg]) continue; // handled in apps pass
      ensureNewId(pkg, sysId, recipe);
    }
  }

  // ---- apply new emulators ----
  for (const rec of newIds.values()) {
    const recipe = rec.recipes.values().next().value || {};
    const entry = {
      id: rec.id,
      name: rec.name,
      packages: [...rec.packages].sort(),
    };
    if (rec.site) entry.siteUrl = rec.site;
    if (rec.play) entry.playStoreUrl = "https://play.google.com/store/apps/details?id=" + rec.play;
    if (recipe.activity) entry.activity = recipe.activity;
    if (recipe.launchArgs) entry.launchArgs = recipe.launchArgs;
    emulators.push(entry);
    for (const sysId of rec.systems) newVariants.push({ system: sysId, emulator: rec.id, activity: recipe.activity });
  }

  // ---- ensure systems exist for new ids ----
  for (const v of newVariants) {
    if (!sysList.some((s) => s.id === v.system)) {
      const meta = SYS_META[v.system] || {};
      sysList.push({ id: v.system, name: meta.name || v.system, folder: meta.folder || v.system, emulators: [] });
    }
  }

  // ---- add variants (dedupe) ----
  for (const v of newVariants) {
    const sys = sysList.find((s) => s.id === v.system);
    if (!sys) continue;
    const key = (x) => x.emulator + "|" + (x.core || "");
    if (!sys.emulators.some((x) => key(x) === key(v))) {
      const row = { emulator: v.emulator };
      if (v.activity) row.activity = v.activity;
      sys.emulators.push(row);
    }
  }

  // ---- apps.json media pass ----
  let apps = [];
  try { apps = loadJson(APPS).apps || []; } catch { /* fresh */ }
  for (const [pkg, name] of Object.entries(MEDIA)) {
    if (!apps.some((a) => a.package === pkg)) apps.push({ package: pkg, name, systems: "any" });
  }
  apps.sort((a, b) => a.package.localeCompare(b.package));

  writeFileSync(CONFIG, JSON.stringify(systems, null, 2) + "\n");
  writeFileSync(APPS, JSON.stringify({ apps }, null, 2) + "\n");

  console.log(`new emulator ids: ${newIds.size}`);
  console.log(`folded forks: ${folded}`);
  console.log(`existing ids recipe/variant-touched: ${touchedExisting.size}`);
  console.log(`new system variants: ${newVariants.length}`);
  console.log(`apps.json entries: ${apps.length}`);
  console.log(`emulators[] total: ${emulators.length}`);
  if (noSite.size) {
    console.log("WARNING: new ids with NO siteUrl (need curation):");
    for (const id of noSite) console.log("  " + id);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
