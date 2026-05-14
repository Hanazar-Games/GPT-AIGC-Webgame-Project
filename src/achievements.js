export const achievementDefinitions = [
  {
    id: "clean-run",
    name: "Clean Run",
    hint: "Earn a Clean run medal or better.",
    earned: (run) => ["Clean run", "Ace run", "Legend run"].includes(run.medal),
  },
  {
    id: "ace-run",
    name: "Ace Run",
    hint: "Earn an Ace run medal or better.",
    earned: (run) => ["Ace run", "Legend run"].includes(run.medal),
  },
  {
    id: "legend-run",
    name: "Legend Run",
    hint: "Earn a Legend run medal.",
    earned: (run) => run.medal === "Legend run",
  },
  {
    id: "graze-tech",
    name: "Graze Tech",
    hint: "Graze at least 15 debris in one run.",
    earned: (run) => run.grazes >= 15,
  },
  {
    id: "deep-field",
    name: "Deep Field",
    hint: "Reach wave 5.",
    earned: (run) => run.wave >= 5,
  },
  {
    id: "collector-line",
    name: "Collector Line",
    hint: "Finish with an upgraded Collector module.",
    earned: (run) => run.module.startsWith("Collector") && run.module !== "Collector I",
  },
  {
    id: "thruster-line",
    name: "Thruster Line",
    hint: "Finish with a Thrusters module.",
    earned: (run) => run.module.startsWith("Thrusters"),
  },
  {
    id: "shield-line",
    name: "Shield Line",
    hint: "Finish with a Shield module.",
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
