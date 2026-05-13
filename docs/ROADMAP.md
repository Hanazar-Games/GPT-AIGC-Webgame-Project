# Roadmap

This project is operated as a living solo webgame. Each cycle should leave the game more playable, easier to ship, or easier to diagnose.

## Now

- Tighten the core survival loop.
- Keep the project zero-install until the game needs bundling.
- Prefer small commits with a playable state after each one.

## Next Gameplay

- Add shield pulse and shard multiplier as deeper branch upgrades.
- Add elite debris patterns after wave 4.
- Add richer end-of-run medals and personal trend tracking.
- Improve mobile ergonomics with aim assist tuning and thumb-zone polish.

## Next Engineering

- Add deterministic simulation tests once a JavaScript runtime is available in the environment.
- Add screenshot checks through the Browser plugin when the runtime tools are exposed.
- Split `src/game.js` into engine, entities, rendering, and input modules when the file crosses roughly 900 lines.

## Release Quality Bar

- Smoke checks pass.
- Local static server returns HTML, CSS, and JS.
- One manual run reaches at least wave 2.
- Git status is clean after each commit.
