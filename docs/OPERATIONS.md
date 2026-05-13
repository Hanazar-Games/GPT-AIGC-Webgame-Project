# Operations

Neon Salvage is a static site. The current production target is GitHub Pages.

## Local Runbook

```sh
python3 tests/smoke.py
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Release Runbook

1. Keep changes scoped and run `python3 tests/smoke.py`.
2. Commit to `main`.
3. Push to GitHub.
4. Confirm the `Deploy static game` workflow passes.
5. Open the Pages URL from the workflow environment and do one manual play test.

## Manual Play Test

- Launch starts the run and hides the overlay.
- `WASD` or arrow keys move the drone.
- `Space` creates a dash burst.
- Green shards increase score and charge.
- Red debris damages hull.
- `P` pauses and resumes.
- `R` restarts after a loss.

## Incident Notes

- If Pages deploy fails before upload, check the smoke test output first.
- If the page is blank, verify `index.html` still points to `src/styles.css` and `src/game.js`.
- If gameplay feels too punishing, tune hazard spawn timing in `src/game.js`.
