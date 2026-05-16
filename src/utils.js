export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function random(min, max) {
  return min + Math.random() * (max - min);
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getRunMedal(score, seconds, grazes) {
  if (score >= 5000 || seconds >= 180 || grazes >= 35) return "Legend run";
  if (score >= 2800 || seconds >= 110 || grazes >= 20) return "Ace run";
  if (score >= 1400 || seconds >= 65 || grazes >= 10) return "Clean run";
  return "Recovered salvage";
}

export function getTrendLabel(score, runs) {
  if (runs.length < 2) return "Building run history.";
  const average = runs.reduce((total, run) => total + run.score, 0) / runs.length;
  const delta = score - average;
  if (Math.abs(delta) < 120) return "Close to recent average.";
  const direction = delta > 0 ? "above" : "below";
  return `${Math.abs(Math.round(delta)).toLocaleString("en-US")} ${direction} recent average.`;
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}
