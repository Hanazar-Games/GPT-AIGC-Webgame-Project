export const achievementDefinitions = [
  {
    id: "clean-run",
    name: "Clean Run",
    hint: "Earn a Clean run medal or better.",
    progress: (stats) => medalProgress(stats.bestMedalRank, 1),
    earned: (run) => ["Clean run", "Ace run", "Legend run"].includes(run.medal),
  },
  {
    id: "ace-run",
    name: "Ace Run",
    hint: "Earn an Ace run medal or better.",
    progress: (stats) => medalProgress(stats.bestMedalRank, 2),
    earned: (run) => ["Ace run", "Legend run"].includes(run.medal),
  },
  {
    id: "legend-run",
    name: "Legend Run",
    hint: "Earn a Legend run medal.",
    progress: (stats) => medalProgress(stats.bestMedalRank, 3),
    earned: (run) => run.medal === "Legend run",
  },
  {
    id: "graze-tech",
    name: "Graze Tech",
    hint: "Graze at least 15 debris in one run.",
    progress: (stats) => countProgress(stats.bestGrazes, 15, "grazes"),
    earned: (run) => run.grazes >= 15,
  },
  {
    id: "deep-field",
    name: "Deep Field",
    hint: "Reach wave 5.",
    progress: (stats) => countProgress(stats.bestWave, 5, "wave"),
    earned: (run) => run.wave >= 5,
  },
  {
    id: "collector-line",
    name: "Collector Line",
    hint: "Finish with an upgraded Collector module.",
    progress: (stats) => branchProgress(stats.modules, "Collector"),
    earned: (run) => run.module.startsWith("Collector") && run.module !== "Collector I",
  },
  {
    id: "thruster-line",
    name: "Thruster Line",
    hint: "Finish with a Thrusters module.",
    progress: (stats) => branchProgress(stats.modules, "Thrusters"),
    earned: (run) => run.module.startsWith("Thrusters"),
  },
  {
    id: "shield-line",
    name: "Shield Line",
    hint: "Finish with a Shield module.",
    progress: (stats) => branchProgress(stats.modules, "Shield"),
    earned: (run) => run.module.startsWith("Shield"),
  },
  {
    id: "hybrid-build",
    name: "Hybrid Build",
    hint: "Pick Collector, Thrusters, and Shield in one run.",
    progress: (stats) => hybridProgress(stats.paths),
    earned: (run) => hasHybridPath(run.path),
  },
  {
    id: "splitter-control",
    name: "Splitter Control",
    hint: "Break up at least 2 splitter debris with Shield pulse in one run.",
    progress: (stats) => countProgress(stats.bestSplittersControlled, 2, "splitters"),
    earned: (run) => run.splittersControlled >= 2,
  },
];

export const achievementTotal = achievementDefinitions.length;

export function getNewAchievementUnlocks(existingIds, run) {
  return achievementDefinitions.filter(
    (achievement) => !existingIds.has(achievement.id) && achievement.earned(run),
  );
}

export function formatAchievementUnlocks(unlocked) {
  if (unlocked.length === 0) return "";
  return ` Unlocked: ${unlocked.map((achievement) => achievement.name).join(", ")}.`;
}

export function getAchievementProgress(achievement, stats) {
  return achievement.progress ? achievement.progress(stats) : "";
}

export function getAchievementStats(runs, current = {}) {
  const best = runs.reduce(
    (stats, run) => ({
      bestGrazes: Math.max(stats.bestGrazes, run.grazes || 0),
      bestWave: Math.max(stats.bestWave, run.wave || 0),
      bestSplittersControlled: Math.max(stats.bestSplittersControlled, run.splittersControlled || 0),
      bestMedalRank: Math.max(stats.bestMedalRank, medalRank(run.medal)),
      modules: [...stats.modules, run.module || ""],
      paths: [...stats.paths, Array.isArray(run.path) ? run.path : []],
    }),
    {
      bestGrazes: current.grazes || 0,
      bestWave: current.wave || 1,
      bestSplittersControlled: current.splittersControlled || 0,
      bestMedalRank: 0,
      modules: [current.module || ""],
      paths: [Array.isArray(current.path) ? current.path : []],
    },
  );
  return best;
}

function medalRank(medal) {
  return {
    "Clean run": 1,
    "Ace run": 2,
    "Legend run": 3,
  }[medal] || 0;
}

function medalProgress(value, target) {
  const labels = ["None", "Clean", "Ace", "Legend"];
  return `${labels[Math.min(value, labels.length - 1)]}/${labels[target]}`;
}

function countProgress(value, target, label) {
  return `${Math.min(value, target)}/${target} ${label}`;
}

function branchProgress(modules, branch) {
  const startModule = `${branch} I`;
  return modules.some((module) => module.startsWith(branch) && module !== startModule) ? "Done" : "Not yet";
}

function hasHybridPath(path) {
  if (!Array.isArray(path)) return false;
  const picks = new Set(path);
  return ["Collector", "Thrusters", "Shield"].every((branch) => picks.has(branch));
}

function hybridProgress(paths) {
  const bestCount = paths.reduce((best, path) => {
    if (!Array.isArray(path)) return best;
    const picks = new Set(path.filter((branch) => ["Collector", "Thrusters", "Shield"].includes(branch)));
    return Math.max(best, picks.size);
  }, 0);
  return `${bestCount}/3 branches`;
}
