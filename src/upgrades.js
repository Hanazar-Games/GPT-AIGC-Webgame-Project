export const upgrades = [
  {
    id: "collector",
    name: "Collector",
    tag: "Harvest",
    tone: "green",
    description: "Wider magnet field, faster shard pull, and better shard value.",
    apply(player) {
      player.collectorLevel += 1;
      player.magnet += 22;
      player.pullStrength += 32;
      player.shardMultiplier += 0.12;
      return `Collector ${roman(player.collectorLevel)} x${player.shardMultiplier.toFixed(2)}`;
    },
  },
  {
    id: "thrusters",
    name: "Thrusters",
    tag: "Velocity",
    tone: "amber",
    description: "Higher move speed and shorter dash cooldown.",
    apply(player) {
      player.speed += 34;
      player.dashCooldownMax = Math.max(0.68, player.dashCooldownMax - 0.12);
      return `Thrusters ${roman(player.thrusterLevel += 1)} ${player.dashCooldownMax.toFixed(2)}s`;
    },
  },
  {
    id: "shield",
    name: "Shield",
    tag: "Defense",
    tone: "cyan",
    description: "Repair hull, lengthen hit safety, and pulse nearby debris.",
    apply(player) {
      player.shieldLevel += 1;
      player.hull = clamp(player.hull + 24, 0, 100);
      player.invulnerableBonus += 0.12;
      player.pulseRadius += 24;
      return `Shield ${roman(player.shieldLevel)} ${Math.round(player.pulseRadius)}r`;
    },
  },
];

function roman(value) {
  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return numerals[Math.min(value, numerals.length) - 1] || `${value}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
