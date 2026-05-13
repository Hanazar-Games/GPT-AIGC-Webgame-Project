const audioMuteKey = "neon-salvage-muted";

const audio = {
  ctx: null,
  muted: loadMuted(),
  music: null,
};

export function isAudioMuted() {
  return audio.muted;
}

export function toggleAudioMuted() {
  audio.muted = !audio.muted;
  if (audio.muted) {
    stopMusicLayer();
  }
  saveMuted();
  return audio.muted;
}

export function ensureAudio() {
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

export function playEventSound(eventName) {
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

export function stopMusicLayer() {
  if (!audio.music) return;
  const music = audio.music;
  audio.music = null;
  const ctx = audio.ctx;
  const now = ctx ? ctx.currentTime : 0;
  try {
    music.master.gain.cancelScheduledValues(now);
    music.master.gain.setTargetAtTime(0.0001, now, 0.08);
    music.bass.stop(now + 0.18);
    music.pulse.stop(now + 0.18);
  } catch {
    // Oscillators can only be stopped once.
  }
}

export function updateMusicLayer({ running, paused, over, choosingUpgrade, wave, hazardCount }) {
  if (!running || paused || over || choosingUpgrade || audio.muted) {
    stopMusicLayer();
    return;
  }

  startMusicLayer();
  if (!audio.music || !audio.ctx) return;

  const now = audio.ctx.currentTime;
  const pressure = clamp((wave - 1) / 8 + hazardCount / 18, 0, 1);
  audio.music.bass.frequency.setTargetAtTime(48 + pressure * 34, now, 0.18);
  audio.music.pulse.frequency.setTargetAtTime(96 + pressure * 92, now, 0.12);
  audio.music.bassGain.gain.setTargetAtTime(0.01 + pressure * 0.018, now, 0.2);
  audio.music.pulseGain.gain.setTargetAtTime(0.002 + pressure * 0.012, now, 0.16);
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

function startMusicLayer() {
  const ctx = ensureAudio();
  if (!ctx || audio.music) return;

  const bass = ctx.createOscillator();
  const pulse = ctx.createOscillator();
  const bassGain = ctx.createGain();
  const pulseGain = ctx.createGain();
  const master = ctx.createGain();
  bass.type = "sine";
  pulse.type = "triangle";
  bass.frequency.value = 55;
  pulse.frequency.value = 110;
  bassGain.gain.value = 0.012;
  pulseGain.gain.value = 0.002;
  master.gain.value = 0.16;
  bass.connect(bassGain).connect(master).connect(ctx.destination);
  pulse.connect(pulseGain).connect(master);
  bass.start();
  pulse.start();
  audio.music = { bass, pulse, bassGain, pulseGain, master };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
