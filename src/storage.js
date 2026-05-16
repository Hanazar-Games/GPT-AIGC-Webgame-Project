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
    return runs
      .map(normalizeRun)
      .filter((run) => Number.isFinite(run.score))
      .slice(0, 5);
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

function normalizeRun(run) {
  if (!run || typeof run !== "object") {
    return {};
  }
  return {
    score: Number.isFinite(run.score) ? run.score : Number.NaN,
    wave: Number.isFinite(run.wave) ? run.wave : 1,
    seconds: Number.isFinite(run.seconds) ? run.seconds : 0,
    shards: Number.isFinite(run.shards) ? run.shards : 0,
    grazes: Number.isFinite(run.grazes) ? run.grazes : 0,
    splittersControlled: Number.isFinite(run.splittersControlled) ? run.splittersControlled : 0,
    module: typeof run.module === "string" ? run.module : "",
    path: Array.isArray(run.path) ? run.path.filter((branch) => typeof branch === "string").slice(0, 8) : [],
    medal: typeof run.medal === "string" ? run.medal : "",
  };
}
