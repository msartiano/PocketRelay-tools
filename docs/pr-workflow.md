# PR workflow

This repo feeds the nodeland-android app. Anything merged to `main` becomes
available to users through Settings → Update (and is baked into the next build).

## Rules

1. **Validate before you push**: `node scripts/validate.mjs` must pass.
2. **One concern per PR**: a new emulator, a new system, a curated-repo change.
3. **Keep `favourite` sane**: exactly one per system, pointing at the best
   default experience for casual users.
4. **Don't hand-edit generated files blindly**: `config/systems.json` and
   `config/apps.json` can be regenerated from the app tables with
   `npm run seed-config` (app repo) — but once created, curated edits (HD
   variants, favourite tweaks, extras) are authoritative and survive re-seed
   only if you re-apply them. Treat the file as hand-maintained after seed.

## CI

`.github/workflows/ci.yml` runs the validator on every push and PR. A red CI
blocks the merge.
