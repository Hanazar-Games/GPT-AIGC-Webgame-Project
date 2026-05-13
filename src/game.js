const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  score: document.querySelector("#score"),
  charge: document.querySelector("#charge"),
  hull: document.querySelector("#hull"),
  wave: document.querySelector("#wave"),
  best: document.querySelector("#best"),
  module: document.querySelector("#module"),
  status: document.querySelector("#status"),
  objective: document.querySelector("#objective"),
  overlay: document.querySelector("#overlay"),
  overlayCopy: document.querySelector("#overlay-copy"),
  upgradeGrid: document.querySelector("#upgrade-grid"),
  startButton: document.querySelector("#start-button"),
  dashButton: document.querySelector("#dash-button"),
  audioButton: document.querySelector("#audio-button"),
};

const bestScoreKey = "neon-salvage-best";
const runHistoryKey = "neon-salvage-runs";
const audioMuteKey = "neon-salvage-muted";
const baseDashCooldown = 1.15;

const audio = {
  ctx: null,
  muted: loadMuted(),
};

const upgrades = [
  {
    id: "collector",
    name: "Collector",
    description: "Wider magnet field, faster shard pull, and better shard value.",
    apply() {
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
    description: "Higher move speed and shorter dash cooldown.",
    apply() {
      player.speed += 34;
      player.dashCooldownMax = Math.max(0.68, player.dashCooldownMax - 0.12);
      return `Thrusters ${roman(player.thrusterLevel += 1)} ${player.dashCooldownMax.toFixed(2)}s`;
    },
  },
  {
    id: "shield",
    name: "Shield",
    description: "Repair hull, lengthen hit safety, and pulse nearby debris.",
    apply() {
      player.shieldLevel += 1;
      player.hull = clamp(player.hull + 24, 0, 100);
      player.invulnerableBonus += 0.12;
      player.pulseRadius += 24;
      return `Shield ${roman(player.shieldLevel)} ${Math.round(player.pulseRadius)}r`;
    },
  },
];

const keys = new Set();
const pointer = {
  active: false,
  x: 0,
  y: 0,
};

const state = {
  running: false,
  paused: false,
  over: false,
  choosingUpgrade: false,
  score: 0,
  best: loadBestScore(),
  recentRuns: loadRunHistory(),
  charge: 0,
  wave: 1,
  elapsed: 0,
  shardsCollected: 0,
  grazes: 0,
  spawnTimer: 0,
  shardTimer: 0,
  shake: 0,
  lastTime: 0,
  stars: [],
  shards: [],
  hazards: [],
  bursts: [],
};

const player = {
  x: 640,
  y: 360,
  radius: 17,
  hull: 100,
  speed: 330,
  dashTimer: 0,
  dashCooldown: 0,
  dashCooldownMax: baseDashCooldown,
  invulnerableTimer: 0,
  invulnerableBonus: 0,
  magnet: 92,
  pullStrength: 180,
  shardMultiplier: 1,
  pulseRadius: 0,
  collectorLevel: 1,
  thrusterLevel: 1,
  shieldLevel: 1,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resizeBackingStore() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(360, Math.floor(rect.width * ratio));
  const height = Math.max(320, Math.floor(rect.height * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function resetGame() {
  resizeBackingStore();
  state.running = true;
  state.paused = false;
  state.over = false;
  state.choosingUpgrade = false;
  state.score = 0;
  state.charge = 0;
  state.wave = 1;
  state.elapsed = 0;
  state.shardsCollected = 0;
  state.grazes = 0;
  state.spawnTimer = 0;
  state.shardTimer = 0;
  state.shake = 0;
  state.lastTime = performance.now();
  state.stars = createStars(110);
  state.shards = [];
  state.hazards = [];
  state.bursts = [];

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.hull = 100;
  player.speed = 330;
  player.dashTimer = 0;
  player.dashCooldown = 0;
  player.dashCooldownMax = baseDashCooldown;
  player.invulnerableTimer = 0;
  player.invulnerableBonus = 0;
  player.magnet = 92;
  player.pullStrength = 180;
  player.shardMultiplier = 1;
  player.pulseRadius = 0;
  player.collectorLevel = 1;
  player.thrusterLevel = 1;
  player.shieldLevel = 1;

  ui.overlay.hidden = true;
  ui.upgradeGrid.hidden = true;
  ui.upgradeGrid.innerHTML = "";
  ui.startButton.hidden = false;
  ui.status.textContent = "Harvesting";
  ui.module.textContent = "Collector I";
  ui.objective.textContent = "Fill charge";
  ui.startButton.textContent = "Launch";
  updateAudioButton();
  updateDashButton();
  updateHud();
}

function loadBestScore() {
  try {
    return Number.parseInt(localStorage.getItem(bestScoreKey) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    localStorage.setItem(bestScoreKey, `${Math.floor(value)}`);
  } catch {
    // Some private browsing modes reject localStorage writes.
  }
}

function loadRunHistory() {
  try {
    const runs = JSON.parse(localStorage.getItem(runHistoryKey) || "[]");
    return Array.isArray(runs) ? runs.filter((run) => Number.isFinite(run.score)).slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRunHistory(runs) {
  try {
    localStorage.setItem(runHistoryKey, JSON.stringify(runs.slice(0, 5)));
  } catch {
    // Best-effort only; gameplay should never depend on storage.
  }
}

function loadMuted() {
  try {
    return localStorage.getItem(audioMuteKey) === "true";
  } catch {
    return false;
  }
}

function saveMuted() {
  try {
    localStorage.setItem(audioMuteKey, `${audio.muted}`);
  } catch {
    // Audio preference is optional.
  }
}

function ensureAudio() {
  if (audio.muted) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audio.ctx) {
    audio.ctx = new AudioContext();
  }
  if (audio.ctx.state === "suspended") {
    audio.ctx.resume();
  }
  return audio.ctx;
}

function playTone(frequency, duration = 0.08, type = "sine", gain = 0.035) {
  const ctx = ensureAudio();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  const now = ctx.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playEventSound(eventName) {
  const sounds = {
    collect: [660, 0.055, "triangle", 0.03],
    dash: [220, 0.09, "sawtooth", 0.024],
    graze: [880, 0.05, "square", 0.018],
    hit: [130, 0.14, "sawtooth", 0.04],
    pulse: [520, 0.12, "triangle", 0.034],
    upgrade: [740, 0.16, "sine", 0.04],
    gameover: [92, 0.22, "sine", 0.045],
  };
  const sound = sounds[eventName];
  if (sound) {
    playTone(...sound);
  }
}

function updateAudioButton() {
  ui.audioButton.textContent = audio.muted ? "Muted" : "Audio";
  ui.audioButton.setAttribute("aria-pressed", `${!audio.muted}`);
}

function createStars(count) {
  return Array.from({ length: count }, () => ({
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    radius: random(0.7, 2.2),
    speed: random(10, 48),
    alpha: random(0.25, 0.9),
  }));
}

function spawnShard() {
  const margin = 42;
  state.shards.push({
    x: random(margin, canvas.width - margin),
    y: random(margin, canvas.height - margin),
    radius: random(7, 12),
    value: 8 + state.wave * 2,
    spin: random(0, Math.PI * 2),
  });
}

function spawnHazard() {
  const edge = Math.floor(random(0, 4));
  const elite = state.wave >= 4 && Math.random() < Math.min(0.12 + state.wave * 0.025, 0.32);
  const speed = random(80, 150) + state.wave * 14 + (elite ? 32 : 0);
  const radius = random(14, 27) + state.wave * 0.7 + (elite ? 7 : 0);
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;

  if (edge === 0) {
    x = -radius;
    y = random(0, canvas.height);
    vx = speed;
    vy = random(-70, 70);
  } else if (edge === 1) {
    x = canvas.width + radius;
    y = random(0, canvas.height);
    vx = -speed;
    vy = random(-70, 70);
  } else if (edge === 2) {
    x = random(0, canvas.width);
    y = -radius;
    vx = random(-70, 70);
    vy = speed;
  } else {
    x = random(0, canvas.width);
    y = canvas.height + radius;
    vx = random(-70, 70);
    vy = -speed;
  }

  state.hazards.push({
    x,
    y,
    vx,
    vy,
    radius,
    elite,
    type: elite ? "seeker" : "drifter",
    rotation: random(0, Math.PI * 2),
    spin: random(-2.2, 2.2) * (elite ? 1.35 : 1),
    damage: 12 + state.wave * 1.5 + (elite ? 8 : 0),
    grazed: false,
  });
}

function addBurst(x, y, color, count = 10) {
  for (let i = 0; i < count; i += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(40, 180);
    state.bursts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(0.3, 0.7),
      ttl: 0,
      color,
      radius: random(2, 5),
    });
  }
}

function openUpgradeChoice() {
  state.choosingUpgrade = true;
  ui.overlay.hidden = false;
  ui.upgradeGrid.hidden = false;
  ui.upgradeGrid.innerHTML = "";
  ui.overlayCopy.textContent = "Choose one overclock module.";
  ui.startButton.hidden = true;
  ui.status.textContent = "Upgrade ready";
  ui.objective.textContent = "Pick module";

  upgrades.forEach((upgrade, index) => {
    const button = document.createElement("button");
    button.className = "upgrade-choice";
    button.type = "button";
    button.dataset.upgrade = upgrade.id;
    button.innerHTML = `<span>${index + 1}</span><strong>${upgrade.name}</strong><small>${upgrade.description}</small>`;
    button.addEventListener("click", () => applyUpgrade(upgrade));
    ui.upgradeGrid.append(button);
  });
}

function applyUpgrade(upgrade) {
  const label = upgrade.apply();
  state.choosingUpgrade = false;
  state.lastTime = performance.now();
  ui.module.textContent = label;
  ui.status.textContent = "Module upgraded";
  ui.objective.textContent = "Collect shards";
  ui.overlay.hidden = true;
  ui.upgradeGrid.hidden = true;
  ui.upgradeGrid.innerHTML = "";
  ui.startButton.hidden = false;
  addBurst(player.x, player.y, "#39d8ff", 28);
  playEventSound("upgrade");
}

function roman(value) {
  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return numerals[Math.min(value, numerals.length) - 1] || `${value}`;
}

function update(dt) {
  if (!state.running || state.paused || state.over || state.choosingUpgrade) {
    return;
  }

  state.elapsed += dt;
  state.wave = Math.max(1, Math.floor(state.elapsed / 22) + 1);
  state.score += dt * (2 + state.wave);
  state.spawnTimer -= dt;
  state.shardTimer -= dt;
  state.shake = Math.max(0, state.shake - dt * 18);
  player.dashTimer = Math.max(0, player.dashTimer - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);

  if (state.spawnTimer <= 0) {
    spawnHazard();
    state.spawnTimer = clamp(1.1 - state.wave * 0.055, 0.35, 1.1);
  }

  if (state.shardTimer <= 0) {
    spawnShard();
    state.shardTimer = clamp(1.4 - state.wave * 0.03, 0.72, 1.4);
  }

  movePlayer(dt);
  updateStars(dt);
  updateShards(dt);
  updateHazards(dt);
  updateBursts(dt);
  updateHud();
}

function movePlayer(dt) {
  let xAxis = 0;
  let yAxis = 0;

  if (keys.has("arrowleft") || keys.has("a")) xAxis -= 1;
  if (keys.has("arrowright") || keys.has("d")) xAxis += 1;
  if (keys.has("arrowup") || keys.has("w")) yAxis -= 1;
  if (keys.has("arrowdown") || keys.has("s")) yAxis += 1;

  if (pointer.active) {
    const dx = pointer.x - player.x;
    const dy = pointer.y - player.y;
    const len = Math.hypot(dx, dy);
    if (len > 10) {
      xAxis += dx / len;
      yAxis += dy / len;
    }
  }

  const length = Math.hypot(xAxis, yAxis) || 1;
  const dashBoost = player.dashTimer > 0 ? 2.4 : 1;
  player.x += (xAxis / length) * player.speed * dashBoost * dt;
  player.y += (yAxis / length) * player.speed * dashBoost * dt;
  player.x = clamp(player.x, player.radius, canvas.width - player.radius);
  player.y = clamp(player.y, player.radius, canvas.height - player.radius);
}

function updateStars(dt) {
  for (const star of state.stars) {
    star.y += star.speed * dt * (0.6 + state.wave * 0.04);
    if (star.y > canvas.height + 4) {
      star.y = -4;
      star.x = random(0, canvas.width);
    }
  }
}

function updateShards(dt) {
  for (let i = state.shards.length - 1; i >= 0; i -= 1) {
    const shard = state.shards[i];
    shard.spin += dt * 4;
    const pullDistance = player.magnet + state.charge * 0.35;
    const dx = player.x - shard.x;
    const dy = player.y - shard.y;
    const len = Math.hypot(dx, dy);

    if (len < pullDistance && len > 1) {
      shard.x += (dx / len) * dt * player.pullStrength;
      shard.y += (dy / len) * dt * player.pullStrength;
    }

    if (distance(player, shard) < player.radius + shard.radius) {
      state.shards.splice(i, 1);
      state.shardsCollected += 1;
      state.score += shard.value * 9 * player.shardMultiplier;
      state.charge = clamp(state.charge + shard.value, 0, 100);
      addBurst(shard.x, shard.y, "#72f2a0", 8);
      playEventSound("collect");

      if (state.charge >= 100) {
        state.charge = 0;
        openUpgradeChoice();
      }
    }
  }
}

function updateHazards(dt) {
  for (let i = state.hazards.length - 1; i >= 0; i -= 1) {
    const hazard = state.hazards[i];
    if (hazard.type === "seeker") {
      const dx = player.x - hazard.x;
      const dy = player.y - hazard.y;
      const len = Math.hypot(dx, dy) || 1;
      const steer = 52 + state.wave * 3;
      hazard.vx += (dx / len) * steer * dt;
      hazard.vy += (dy / len) * steer * dt;
      const maxSpeed = 205 + state.wave * 18;
      const currentSpeed = Math.hypot(hazard.vx, hazard.vy) || 1;
      if (currentSpeed > maxSpeed) {
        hazard.vx = (hazard.vx / currentSpeed) * maxSpeed;
        hazard.vy = (hazard.vy / currentSpeed) * maxSpeed;
      }
    }

    hazard.x += hazard.vx * dt;
    hazard.y += hazard.vy * dt;
    hazard.rotation += hazard.spin * dt;

    const outside =
      hazard.x < -90 ||
      hazard.x > canvas.width + 90 ||
      hazard.y < -90 ||
      hazard.y > canvas.height + 90;

    if (outside) {
      state.hazards.splice(i, 1);
      continue;
    }

    const hitDistance = distance(player, hazard);
    const collisionRadius = player.radius * 0.72 + hazard.radius;
    const grazeRadius = player.radius + hazard.radius + 28;

    if (!hazard.grazed && hitDistance < grazeRadius && hitDistance >= collisionRadius) {
      hazard.grazed = true;
      state.grazes += 1;
      state.score += 35 + state.wave * 8;
      ui.status.textContent = "Close salvage";
      addBurst(player.x, player.y, "#ffd166", 6);
      playEventSound("graze");
    }

    if (player.invulnerableTimer <= 0 && hitDistance < collisionRadius) {
      state.hazards.splice(i, 1);
      player.hull = clamp(player.hull - hazard.damage, 0, 100);
      player.invulnerableTimer = 0.8 + player.invulnerableBonus;
      state.shake = 8;
      addBurst(player.x, player.y, "#ff5f7e", 18);
      playEventSound("hit");
      triggerShieldPulse();

      if (player.hull <= 0) {
        endGame();
      }
    }
  }
}

function triggerShieldPulse() {
  if (player.pulseRadius <= 0) return;

  let cleared = 0;
  for (let i = state.hazards.length - 1; i >= 0; i -= 1) {
    const hazard = state.hazards[i];
    if (distance(player, hazard) <= player.pulseRadius + hazard.radius) {
      state.hazards.splice(i, 1);
      cleared += 1;
      addBurst(hazard.x, hazard.y, "#39d8ff", hazard.elite ? 16 : 8);
    }
  }

  if (cleared > 0) {
    state.score += cleared * (80 + state.wave * 12);
    ui.status.textContent = `Pulse cleared ${cleared}`;
    playEventSound("pulse");
  }
}

function updateBursts(dt) {
  for (let i = state.bursts.length - 1; i >= 0; i -= 1) {
    const burst = state.bursts[i];
    burst.ttl += dt;
    burst.x += burst.vx * dt;
    burst.y += burst.vy * dt;
    burst.vx *= 0.98;
    burst.vy *= 0.98;
    if (burst.ttl >= burst.life) {
      state.bursts.splice(i, 1);
    }
  }
}

function updateHud() {
  ui.score.textContent = Math.floor(state.score).toLocaleString("en-US");
  ui.best.textContent = Math.floor(state.best).toLocaleString("en-US");
  ui.charge.textContent = `${Math.floor(state.charge)}%`;
  ui.hull.textContent = `${Math.ceil(player.hull)}%`;
  ui.wave.textContent = `${state.wave}`;
  updateDashButton();
  if (state.running && !state.paused && !state.over) {
    ui.objective.textContent =
      state.charge >= 70 ? "Almost upgraded" : player.hull <= 35 ? "Protect hull" : "Collect shards";
  }
}

function updateDashButton() {
  const disabled =
    !state.running || state.paused || state.over || state.choosingUpgrade || player.dashCooldown > 0;
  ui.dashButton.disabled = disabled;
  ui.dashButton.textContent =
    player.dashCooldown > 0 ? `${Math.ceil(player.dashCooldown * 10) / 10}s` : "Dash";
}

function endGame() {
  const finalScore = Math.floor(state.score);
  const isRecord = finalScore > state.best;
  const medal = getRunMedal(finalScore, state.elapsed, state.grazes);
  const trend = getTrendLabel(finalScore, state.recentRuns);
  const runSummary = {
    score: finalScore,
    wave: state.wave,
    seconds: Math.floor(state.elapsed),
    shards: state.shardsCollected,
    grazes: state.grazes,
    medal,
  };

  if (isRecord) {
    state.best = finalScore;
    saveBestScore(state.best);
  }
  state.recentRuns = [runSummary, ...state.recentRuns].slice(0, 5);
  saveRunHistory(state.recentRuns);

  state.over = true;
  state.running = false;
  ui.status.textContent = isRecord ? "New record" : medal;
  ui.objective.textContent = "Relaunch ready";
  ui.overlay.hidden = false;
  ui.overlayCopy.textContent = `Final score ${finalScore.toLocaleString("en-US")}. ${
    isRecord ? "New best saved." : `Best ${Math.floor(state.best).toLocaleString("en-US")}.`
  } ${medal}. ${trend} Survived ${formatTime(state.elapsed)}, collected ${state.shardsCollected} shards, grazed ${state.grazes} times. Press R to relaunch.`;
  ui.startButton.textContent = "Relaunch";
  playEventSound("gameover");
  updateHud();
}

function getRunMedal(score, seconds, grazes) {
  if (score >= 5000 || seconds >= 180 || grazes >= 35) return "Legend run";
  if (score >= 2800 || seconds >= 110 || grazes >= 20) return "Ace run";
  if (score >= 1400 || seconds >= 65 || grazes >= 10) return "Clean run";
  return "Recovered salvage";
}

function getTrendLabel(score, runs) {
  if (runs.length < 2) return "Building run history.";
  const average = runs.reduce((total, run) => total + run.score, 0) / runs.length;
  const delta = score - average;
  if (Math.abs(delta) < 120) return "Close to recent average.";
  const direction = delta > 0 ? "above" : "below";
  return `${Math.abs(Math.round(delta)).toLocaleString("en-US")} ${direction} recent average.`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function togglePause() {
  if (!state.running || state.over || state.choosingUpgrade) return;
  state.paused = !state.paused;
  ui.status.textContent = state.paused ? "Paused" : "Harvesting";
  ui.objective.textContent = state.paused ? "Resume run" : "Collect shards";
  ui.overlay.hidden = !state.paused;
  ui.overlayCopy.textContent = "Systems paused. Press P to resume.";
  ui.startButton.textContent = "Resume";
  if (!state.paused) {
    state.lastTime = performance.now();
  }
}

function dash() {
  if (!state.running || state.paused || state.choosingUpgrade || player.dashCooldown > 0) return;
  player.dashTimer = 0.18;
  player.dashCooldown = player.dashCooldownMax;
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.22);
  ui.status.textContent = "Dash burn";
  addBurst(player.x, player.y, "#ffd166", 12);
  playEventSound("dash");
}

function draw() {
  resizeBackingStore();
  const shakeX = state.shake ? random(-state.shake, state.shake) : 0;
  const shakeY = state.shake ? random(-state.shake, state.shake) : 0;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(shakeX, shakeY);
  drawBackground();
  drawShards();
  drawHazards();
  drawBursts();
  drawPlayer();
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#06111b");
  gradient.addColorStop(0.55, "#081a20");
  gradient.addColorStop(1, "#180d19");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const star of state.stars) {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#d7e2ee";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(57, 216, 255, 0.08)";
  ctx.lineWidth = 1;
  const grid = Math.max(42, Math.floor(canvas.width / 18));
  for (let x = 0; x < canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - canvas.width * 0.12, canvas.height);
    ctx.stroke();
  }
}

function drawShards() {
  for (const shard of state.shards) {
    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.spin);
    ctx.fillStyle = "#72f2a0";
    ctx.strokeStyle = "rgba(234, 252, 255, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -shard.radius);
    ctx.lineTo(shard.radius * 0.78, 0);
    ctx.lineTo(0, shard.radius);
    ctx.lineTo(-shard.radius * 0.78, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawHazards() {
  for (const hazard of state.hazards) {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.rotation);
    ctx.fillStyle = hazard.elite ? "#3b2f16" : "#3a2630";
    ctx.strokeStyle = hazard.elite ? "#ffd166" : "#ff5f7e";
    ctx.lineWidth = hazard.elite ? 4 : 3;
    ctx.beginPath();
    for (let i = 0; i < 9; i += 1) {
      const angle = (i / 9) * Math.PI * 2;
      const radius = hazard.radius * (i % 2 ? 0.68 : 1);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (hazard.elite) {
      ctx.strokeStyle = "rgba(255, 209, 102, 0.36)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, hazard.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawBursts() {
  for (const burst of state.bursts) {
    const progress = burst.ttl / burst.life;
    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = burst.color;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.radius * (1 - progress * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 18) % 2 === 0) {
    ctx.globalAlpha = 0.58;
  }

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, player.magnet);
  glow.addColorStop(0, "rgba(57, 216, 255, 0.18)");
  glow.addColorStop(1, "rgba(57, 216, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, player.magnet, 0, Math.PI * 2);
  ctx.fill();

  if (player.pulseRadius > 0) {
    ctx.strokeStyle = "rgba(57, 216, 255, 0.22)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.arc(0, 0, player.pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = player.dashTimer > 0 ? "#ffd166" : "#39d8ff";
  ctx.strokeStyle = "#eafcff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(-14, -17);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-14, 17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (player.dashCooldown > 0) {
    const cooldown = 1 - player.dashCooldown / player.dashCooldownMax;
    ctx.strokeStyle = "rgba(255, 209, 102, 0.78)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldown);
    ctx.stroke();
  }

  ctx.fillStyle = "#07131a";
  ctx.beginPath();
  ctx.arc(2, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function frame(now) {
  const dt = Math.min((now - state.lastTime) / 1000 || 0, 0.033);
  state.lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);

  if (key === " ") {
    event.preventDefault();
    dash();
  } else if (state.choosingUpgrade && ["1", "2", "3"].includes(key)) {
    applyUpgrade(upgrades[Number.parseInt(key, 10) - 1]);
  } else if (key === "p") {
    togglePause();
  } else if (key === "r") {
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointerdown", (event) => {
  pointer.active = true;
  Object.assign(pointer, canvasPoint(event));
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!pointer.active) return;
  Object.assign(pointer, canvasPoint(event));
});

canvas.addEventListener("pointerup", () => {
  pointer.active = false;
});

canvas.addEventListener("pointercancel", () => {
  pointer.active = false;
});

ui.startButton.addEventListener("click", () => {
  ensureAudio();
  if (state.paused) {
    togglePause();
  } else {
    resetGame();
  }
});

ui.dashButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  dash();
});

ui.audioButton.addEventListener("click", () => {
  audio.muted = !audio.muted;
  saveMuted();
  updateAudioButton();
  if (!audio.muted) {
    playEventSound("upgrade");
  }
});

window.addEventListener("resize", () => {
  resizeBackingStore();
  if (!state.running) {
    state.stars = createStars(110);
    draw();
  }
});

resizeBackingStore();
state.stars = createStars(110);
updateHud();
updateDashButton();
updateAudioButton();
draw();
requestAnimationFrame(frame);
