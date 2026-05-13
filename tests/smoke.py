from html.parser import HTMLParser
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def assert_contains(path, needle):
    content = read(path)
    if needle not in content:
        raise AssertionError(f"{path} does not contain {needle!r}")


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script" and attrs.get("src"):
            self.assets.append(attrs["src"])
        if tag == "link" and attrs.get("href"):
            self.assets.append(attrs["href"])


def assert_referenced_assets_exist():
    parser = AssetParser()
    parser.feed(read("index.html"))
    for asset in parser.assets:
        if asset.startswith(("http://", "https://", "//")):
            continue
        if not (ROOT / asset).exists():
            raise AssertionError(f"Referenced asset does not exist: {asset}")


def assert_local_imports_exist(path):
    content = read(path)
    for match in re.finditer(r'from\s+["\'](\./[^"\']+)["\']', content):
        target = (ROOT / path).parent / match.group(1)
        if not target.exists():
            raise AssertionError(f"Referenced import does not exist: {match.group(1)}")


def main():
    required = [
        "index.html",
        "src/styles.css",
        "src/game.js",
        "src/achievements.js",
        "src/audio.js",
        "README.md",
        "LICENSE",
    ]

    for item in required:
        if not (ROOT / item).exists():
            raise AssertionError(f"Missing required file: {item}")

    assert_referenced_assets_exist()
    assert_local_imports_exist("src/game.js")

    assert_contains("index.html", '<canvas id="game"')
    assert_contains("index.html", 'id="best"')
    assert_contains("index.html", 'id="objective"')
    assert_contains("index.html", 'id="upgrade-grid"')
    assert_contains("index.html", 'id="dash-button"')
    assert_contains("index.html", 'id="audio-button"')
    assert_contains("index.html", 'type="module" src="src/game.js"')
    assert_contains("src/game.js", "function resetGame()")
    assert_contains("src/game.js", "function spawnHazard()")
    assert_contains("src/game.js", "function openUpgradeChoice")
    assert_contains("src/game.js", "function applyUpgrade")
    assert_contains("src/game.js", "upgrade-choice--")
    assert_contains("src/game.js", "tag")
    assert_contains("src/game.js", "function updateDashButton")
    assert_contains("src/game.js", 'from "./audio.js"')
    assert_contains("src/audio.js", "function playEventSound")
    assert_contains("src/audio.js", "function startMusicLayer")
    assert_contains("src/game.js", "function updateMusicLayer")
    assert_contains("src/game.js", "function updateAudioButton")
    assert_contains("src/game.js", "function triggerShieldPulse")
    assert_contains("src/game.js", "function formatTime")
    assert_contains("src/game.js", "function getRunMedal")
    assert_contains("src/game.js", "function getTrendLabel")
    assert_contains("src/game.js", "function unlockAchievements")
    assert_contains("src/game.js", 'from "./achievements.js"')
    assert_contains("src/achievements.js", "achievementDefinitions")
    assert_contains("src/achievements.js", "function getNewAchievementUnlocks")
    assert_contains("src/game.js", "shardsCollected")
    assert_contains("src/game.js", "grazes")
    assert_contains("src/game.js", "Final module")
    assert_contains("src/game.js", "runHistoryKey")
    assert_contains("src/game.js", "achievementKey")
    assert_contains("src/game.js", "shardMultiplier")
    assert_contains("src/game.js", "pulseRadius")
    assert_contains("src/game.js", "toFixed")
    assert_contains("src/game.js", "seeker")
    assert_contains("src/game.js", "elite")
    assert_contains("src/game.js", "localStorage")
    assert_contains("src/audio.js", "AudioContext")
    assert_contains("src/audio.js", "setTargetAtTime")
    assert_contains("src/game.js", "function saveBestScore")
    assert_contains("src/game.js", "invulnerableTimer")
    assert_contains("src/game.js", "grazed")
    assert_contains("src/game.js", "requestAnimationFrame(frame)")
    assert_contains("src/styles.css", "@media (max-width: 760px)")
    assert_contains("src/styles.css", ".upgrade-choice--green")
    assert_contains("README.md", "python3 tests/smoke.py")
    assert_contains("docs/OPERATIONS.md", "browsers block audio before user interaction")

    print("Smoke checks passed.")


if __name__ == "__main__":
    main()
