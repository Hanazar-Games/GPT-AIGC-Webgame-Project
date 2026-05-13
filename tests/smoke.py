from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def assert_contains(path, needle):
    content = read(path)
    if needle not in content:
        raise AssertionError(f"{path} does not contain {needle!r}")


def main():
    required = [
        "index.html",
        "src/styles.css",
        "src/game.js",
        "README.md",
        "LICENSE",
    ]

    for item in required:
        if not (ROOT / item).exists():
            raise AssertionError(f"Missing required file: {item}")

    assert_contains("index.html", '<canvas id="game"')
    assert_contains("index.html", 'id="best"')
    assert_contains("index.html", 'id="objective"')
    assert_contains("index.html", 'id="upgrade-grid"')
    assert_contains("index.html", 'id="dash-button"')
    assert_contains("index.html", 'type="module" src="src/game.js"')
    assert_contains("src/game.js", "function resetGame()")
    assert_contains("src/game.js", "function spawnHazard()")
    assert_contains("src/game.js", "function openUpgradeChoice")
    assert_contains("src/game.js", "function applyUpgrade")
    assert_contains("src/game.js", "function updateDashButton")
    assert_contains("src/game.js", "function formatTime")
    assert_contains("src/game.js", "shardsCollected")
    assert_contains("src/game.js", "grazes")
    assert_contains("src/game.js", "localStorage")
    assert_contains("src/game.js", "function saveBestScore")
    assert_contains("src/game.js", "invulnerableTimer")
    assert_contains("src/game.js", "grazed")
    assert_contains("src/game.js", "requestAnimationFrame(frame)")
    assert_contains("src/styles.css", "@media (max-width: 760px)")
    assert_contains("README.md", "python3 tests/smoke.py")

    print("Smoke checks passed.")


if __name__ == "__main__":
    main()
