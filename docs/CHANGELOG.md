# Changelog

## 2026-05-15

- Built the zero-install Canvas survival game loop.
- Added branching upgrades: Collector, Thrusters, and Shield.
- Added best score, recent run history, medals, trend feedback, and final module reporting.
- Added local achievements with unlock hints and progress counters.
- Added an Achievements overlay with locked/unlocked states.
- Added elite seeker debris and wave 6 splitter debris.
- Added synthesized event audio and a pressure-reactive music layer.
- Split achievements, audio, storage, upgrades, and utility helpers into separate modules.
- Added smoke, module syntax, HTTP asset checks, and GitHub Pages deployment.

## Operations

- Production target: GitHub Pages.
- Verification: `python3 tests/smoke.py` and `python3 tests/http_check.py`.
- No package install is required.
