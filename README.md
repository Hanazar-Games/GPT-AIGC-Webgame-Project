# Neon Salvage

Neon Salvage is a zero-build browser survival game made for this repository. Pilot a small salvage drone through a charged debris field, collect energy shards, trigger upgrades, and survive as long as possible.

## Play

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Controls

- Move: `WASD` / arrow keys
- Dash: `Space`
- Choose upgrade: `1` / `2` / `3`
- Pause: `P`
- Restart: `R`

The game also supports pointer or touch movement on canvas.
Touch devices get an on-screen dash button.
Audio is synthesized in-browser and can be muted from the controls.
The background music layer reacts to wave pressure and active debris count.
Skim close to debris for bonus score; dashing gives a tiny safety window.
When charge reaches 100%, pick one of three upgrade branches.
Collector raises shard value; Shield adds a defensive pulse after hits.
Upgrade cards use branch colors and tags for quick scanning.
End-of-run results include survival time, shards collected, and near-miss grazes.
They also show the final module state for the run.
The last five runs are tracked locally for trend feedback.
Achievement unlocks are stored locally for long-term goals.
Pause and end screens show achievement progress.
Use the Achievements control to review unlocked and locked achievements.
Achievement cards include unlock hints.
Wave 4 and beyond can spawn elite seeker debris.

## Project Shape

- `index.html` - static app shell and canvas
- `src/styles.css` - responsive interface styling
- `src/game.js` - engine, entities, difficulty, input, and rendering
- `src/achievements.js` - achievement definitions and unlock rules
- `src/audio.js` - synthesized event audio and pressure music
- `src/upgrades.js` - upgrade branch data and stat mutation rules
- `tests/smoke.py` - repository smoke checks for required files and browser-facing markup

The game stores the best score in browser `localStorage`. It also rewards near misses and uses short invulnerability windows to keep collisions readable.
Audio mute preference and recent run history are stored locally in the browser.

## Verify

```sh
python3 tests/smoke.py
```

No package install is required for the current version.

## Deploy

The repository includes a GitHub Pages workflow at `.github/workflows/pages.yml`. See `docs/OPERATIONS.md` for the runbook.

## Direction

The live roadmap is in `docs/ROADMAP.md`.
