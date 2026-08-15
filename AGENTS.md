# AGENTS.md — PocketConsole-tools (config repo)

Project conventions and hard rules for AI agents editing this repo. This repo is the **single
source of truth** for emulator/system/repo/theme config consumed by the
`nodeland-android` app (cloned + baked at build, served via Settings → Update).

## Rules for every change

- **Edit config in `config/`, never in the app's `src/`** — the TS tables in
  `nodeland-android` are the offline fallback only. Mirror every config change into those
  offline fallbacks and keep them consistent (`nodeland-android/tests/config-consistency.test.ts`
  fails the build when they disagree).
- **Validate before commit**: `node scripts/validate.mjs` (CI on every PR). Schema +
  walkthrough: `schema/` + `nodeland-android/docs/adding-a-system.md`.
- **Every emulator entry must be real**: has a `siteUrl`, a package, and an icon
  (`config/emulator-icons/<id>.png`). Regenerate icons with
  `scripts/fetch-emulator-icons.mjs`.
- **Emulator docs must move with the config**: any change to an emulator/system/core/packages/
  links/launch args must, in the same change, update (1) the `nodeland-android` README
  emulator table, (2) `docs/android-emulators.md`, (3) `config/systems.json` +
  `config/apps.json`. Regenerate tables with `scripts/gen-emulator-docs.mjs`; never hand-edit
  them. At most one `favourite: true` per system.
- **Data-QA tracker**: keep `missing.md` in sync with this repo (per-emulator checks,
  missing links, known defects, downloadability gaps, systems QA).
- **Never commit secrets, keystores, or generated build artifacts.**
- The canonical repo/media **protocol spec lives in `nodeland-android/docs/repo-protocol.md`**
  (this repo's `config/repos.json` + `docs/` reference it). Do not drift from it.

## Append-log delta sync (in stone — the "what changed" contract)

This section is the same contract across all three repos (`nodeland-android`, `../nodeland`,
`PocketConsole-tools`). Any LLM working in any of them must preserve these invariants. Full
execution plan: `nodeland-android/plan6.md`.

- **One append-only change log per repo** (`changelog.jsonl`). Records:
  `{seq, ts, kind, system?, data}`. `seq` is a strictly monotonic integer (the **pointer**),
  `+1` per record, never reused or reordered; `ts` is the unix-ms append time.
- **The manifest advertises the head pointer** `seq` + `seqTs`. That is the repo's whole
  "is anything new" signal — compare the stored `seq`, fetch exactly what happened since.
- **`GET /changes?since=<seq>&mode=squash|log`**:
  - `squash` (default): **per-entity last-wins net diff** — only final states
    (`media:add@2031`, `media:mod@2032`, `media:mod@3098` collapse to one `mod` with the
    final bytes). Output is O(entities that differ), never the raw history.
  - `log`: raw event replay (older-server / fallback).
  - `304` when `since == head`; `{reset:true, seq, seqTs}` when `since` is unknown/compacted
    → the client **full re-syncs** that repo.
- **Kinds**: `catalog:add|mod|del` (inline game payload / `{id}`), `media:add|mod|del`
  (`{type, names[], sizes?}`), `rom:add|del|renamed` (`{gameId, oldPath?, newPath?}`),
  `system:add|del|rename`.
- **Content is never in the log** — events carry names/ids; bytes come from existing
  endpoints (whole-zip, delta-zip, per-entry, catalog, ROM).
- **Who appends (and nobody else)**: scraper thumb writes/deletes; playlist/catalog writers;
  and the **stat-drift reconciler** (external/manual edits are detected by stat-signature
  drift, diffed against the retained snapshot, and appended as exact events). Log +
  reconciler = 100% exact.
- **Never hash to detect change.** No content hashing, no per-image md5, no per-image
  metadata in payloads. Change detection is event replay + squashing.
- **Media content delivery** (server decides per system/type, carried in the changes
  response), with `deltaBytes = Σ sizeBytes(net added+modified files)` (stat-based; ≈
  compressed size for pre-compressed media):
  - `deltaBytes == 0` → nothing; `<= mediaDeltaBatchBytes` (default 100MB) → one delta zip;
  - `100MB < deltaBytes < wholeZipBytes × mediaDeltaWholeRatio` (default 0.8) →
    `mediaDeltaBatches: K` of ≤100MB, sequential + resumable;
  - else → `media_full:true` → whole-zip re-download (cached, one request).
- **WebP everywhere** (media art): scraper/server emit WebP ≤1080p; entry name is
  deterministic — `sanitizeLabel(game.name) + ".webp"` (index-less resolution). No PNG in the
  media store.
- **Zip is transport only**: the whole-zip endpoint builds the bulk archive for first sync /
  resets; the device unpacks once and serves reads from loose files. The delta-zip endpoint
  (`delta.zip?since=&batch=`) builds on demand the same way.
- **Config-only changes** (version/name/autoDelete) bump the manifest etag, never `seq`.
- **Convergence fields**: manifest `revision.*` exposes `entries`/`sizeBytes`/`nameHash`
  (media) and `gamesCount`/`nameHash` (catalog) so clients verify state without hashing.
- **The pointer is timestamped and visible**: clients persist `(seq, seqTs)` per repo and
  render "pointer #seq · updated <ts>" in the Repos screen, alongside the server's head.

## Conventions

- Add a static/unit test (per existing style) for each new feature.
- Do not add code comments unless asked.
- Keep config as data, not code: facts belong in `config/*.json`, never in scripts.
