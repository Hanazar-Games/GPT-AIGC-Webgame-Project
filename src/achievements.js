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
      bestMedalRank: Math.max(stats.bestMedalRank, medalRank(run.medal)),
      modules: [...stats.modules, run.module || ""],
    }),
    {
      bestGrazes: current.grazes || 0,
      bestWave: current.wave || 1,
      bestMedalRank: 0,
      modules: [current.module || ""],
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
  return modules.some((module) => module.startsWith(branch) && module !== "Collector I") ? "Done" : "Not yet";
}
