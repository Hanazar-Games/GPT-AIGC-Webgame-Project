export const achievementDefinitions = [
  {
    id: "clean-run",
    name: "Clean Run",
    earned: (run) => ["Clean run", "Ace run", "Legend run"].includes(run.medal),
  },
  {
    id: "ace-run",
    name: "Ace Run",
    earned: (run) => ["Ace run", "Legend run"].includes(run.medal),
  },
  {
    id: "legend-run",
    name: "Legend Run",
    earned: (run) => run.medal === "Legend run",
  },
  {
    id: "graze-tech",
    name: "Graze Tech",
    earned: (run) => run.grazes >= 15,
  },
  {
    id: "deep-field",
    name: "Deep Field",
    earned: (run) => run.wave >= 5,
  },
  {
    id: "collector-line",
    name: "Collector Line",
    earned: (run) => run.module.startsWith("Collector") && run.module !== "Collector I",
  },
  {
    id: "thruster-line",
    name: "Thruster Line",
    earned: (run) => run.module.startsWith("Thrusters"),
  },
  {
    id: "shield-line",
    name: "Shield Line",
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
