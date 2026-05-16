# Operations

Neon Salvage is a static site. The current production target is GitHub Pages.

## Local Runbook

```sh
python3 tests/release_check.py
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Release Runbook

1. Keep changes scoped and run `python3 tests/release_check.py`.
2. Commit to `main`.
3. Push to GitHub.
4. Confirm the `Deploy static game` workflow passes.
5. Open the Pages URL from the workflow environment and do one manual play test.
6. Update `docs/CHANGELOG.md` when player-visible systems change.

## Manual Play Test

- Launch starts the run and hides the overlay.
- `WASD` or arrow keys move the drone.
- `Space` creates a dash burst.
- Green shards increase score and charge.
- Red debris damages hull.
- `P` pauses and resumes.
- `R` restarts after a loss.
- Audio toggle switches between Audio and Muted after a user gesture.
- Background audio should fade out during pause, upgrade choice, and game over.

## Incident Notes

- If Pages deploy fails before upload, check the release-check output first.
- If HTTP checks fail, verify every module imported by `src/game.js` is present in `src/`.
- On non-macOS runners, the optional `osascript` JavaScript parse is skipped.
- If the page is blank, verify `index.html` still points to `src/styles.css` and `src/game.js`.
- If gameplay feels too punishing, tune hazard spawn timing in `src/game.js`.
- If audio is silent, click Launch or Audio first; browsers block audio before user interaction.
