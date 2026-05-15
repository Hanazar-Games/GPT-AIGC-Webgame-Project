const bestScoreKey = "neon-salvage-best";
const runHistoryKey = "neon-salvage-runs";
const achievementKey = "neon-salvage-achievements";

export function loadBestScore() {
  try {
    return Number.parseInt(localStorage.getItem(bestScoreKey) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(value) {
  try {
    localStorage.setItem(bestScoreKey, `${Math.floor(value)}`);
  } catch {
    // Some private browsing modes reject localStorage writes.
  }
}

export function loadRunHistory() {
  try {
    const runs = JSON.parse(localStorage.getItem(runHistoryKey) || "[]");
    if (!Array.isArray(runs)) {
      return [];
    }
    return runs.filter((run) => Number.isFinite(run.score)).slice(0, 5);
  } catch {
    return [];
  }
}

export function saveRunHistory(runs) {
  try {
    localStorage.setItem(runHistoryKey, JSON.stringify(runs.slice(0, 5)));
  } catch {
    // Best-effort only; gameplay should never depend on storage.
  }
}

export function loadAchievementIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(achievementKey) || "[]");
    if (!Array.isArray(ids)) {
      return new Set();
    }
    return new Set(ids.filter((id) => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveAchievementIds(ids) {
  try {
    localStorage.setItem(achievementKey, JSON.stringify([...ids]));
  } catch {
    // Achievement storage is best-effort.
  }
}
