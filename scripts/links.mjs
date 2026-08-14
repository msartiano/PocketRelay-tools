#!/usr/bin/env node
/**
 * Rich link generation for the master emulator list.
 *
 * Every emulator can carry a `links[]` array so the app can offer multiple
 * sources (Play Store, F-Droid, GitHub, direct APK, general web pages):
 *
 *   { "kind": "play"|"fdroid"|"github"|"apk"|"web", "label": string, "url": "https://…" }
 *
 * - `play`   → opens the Play Store app.
 * - `fdroid` → opens F-Droid.
 * - `apk`    → the app downloads + installs the APK in-app.
 * - `github` / `web` → opened in an in-app browser (or downloaded in-app when
 *   the URL is a direct APK, e.g. `*.apk` / `/releases/download/…apk`).
 *
 * `buildLinks(emu)` derives the array from the legacy fields (siteUrl,
 * playStoreUrl, apkUrl) plus the curated EXTRA_LINKS below. EXTRA_LINKS is the
 * only hand-maintained part; everything else flows from the master entry.
 * Only verified F-Droid pages are listed (broken links are a bug).
 */
export const LINK_LABELS = {
  play: "Play Store",
  fdroid: "F-Droid",
  github: "GitHub",
  apk: "APK",
  web: "Official site",
};

/** Verified extra sources per id. F-Droid URLs were checked to exist. */
export const EXTRA_LINKS = {
  retroarch: {
    fdroid: "https://f-droid.org/packages/com.retroarch/",
    github: "https://github.com/libretro/RetroArch",
  },
  retroarch64: { github: "https://github.com/libretro/RetroArch" },
  dolphin: {
    fdroid: "https://f-droid.org/packages/org.dolphinemu.dolphinemu/",
    github: "https://github.com/dolphin-emu/dolphin",
  },
  lemuroid: { fdroid: "https://f-droid.org/packages/com.swordfish.lemuroid/" },
  ppsspp: {
    fdroid: "https://f-droid.org/packages/org.ppsspp.ppsspp/",
    github: "https://github.com/hrydgard/ppsspp",
  },
  "ppsspp-gold": { github: "https://github.com/hrydgard/ppsspp" },
  scummvm: { github: "https://github.com/scummvm/scummvm" },
  duckstation: { github: "https://github.com/stenzek/duckstation" },
  citra: { github: "https://github.com/citra-emu/citra" },
  "citra-nightly": { github: "https://github.com/citra-emu/citra" },
  openmsx: { github: "https://github.com/openMSX/openMSX" },
  residualvm: { github: "https://github.com/residualvm/residualvm" },
  vita3k: { github: "https://github.com/Vita3K/Vita3K" },
  mame4droid: { github: "https://github.com/seleuco/MAME4droid" },
  "mame4droid-current": { github: "https://github.com/seleuco/MAME4droid" },
  "mame4droid-m4a": { github: "https://github.com/seleuco/MAME4droid" },
};

/** Builds the `links[]` array for a master entry (deduped, stable order). */
export function buildLinks(emu) {
  const out = [];
  const seen = new Set();
  const push = (kind, url, label) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ kind, label: label ?? LINK_LABELS[kind], url });
  };
  push("play", emu.playStoreUrl);
  const extra = EXTRA_LINKS[emu.id];
  if (extra) {
    push("fdroid", extra.fdroid);
    push("github", extra.github);
  }
  push("apk", emu.apkUrl);
  // A github.com siteUrl doubles as the GitHub link.
  if (emu.siteUrl && emu.siteUrl.startsWith("https://github.com/")) {
    push("github", emu.siteUrl);
  }
  push("web", emu.siteUrl);
  return out;
}
