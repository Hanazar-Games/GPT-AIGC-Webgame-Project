# Roadmap

This project is operated as a living solo webgame. Each cycle should leave the game more playable, easier to ship, or easier to diagnose.

## Now

- Tighten the core survival loop.
- Keep the project zero-install until the game needs bundling.
- Prefer small commits with a playable state after each one.

## Next Gameplay

- Add late-branch upgrade variants and selection history.
- Add richer music motifs for upgrade branches.
- Add elite warning tells and richer splitter counterplay.
- Add lifetime stat totals for achievement progress.
- Improve mobile ergonomics with aim assist tuning and thumb-zone polish.

## Next Engineering

- Add deterministic simulation tests once a JavaScript runtime is available in the environment.
- Add screenshot checks through the Browser plugin when the runtime tools are exposed.
- Continue splitting `src/game.js` into engine, entities, rendering, audio, and input modules.

## Release Quality Bar

- Smoke checks pass.
- Local static server returns HTML, CSS, and JS.
- One manual run reaches at least wave 2.
- Git status is clean after each commit.
