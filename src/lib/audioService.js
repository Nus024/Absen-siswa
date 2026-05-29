// ============================================================
// lib/audioService.js — Singleton Web Audio API Synthesizer
// ============================================================

let audioCtx = null;
let lastPlayAt = 0;
let lastPriority = 0;
const MIN_PLAY_INTERVAL = 80; // ms: threshold to avoid audio overlapping distortions

// Priority levels to prevent low-priority tones from blocking high-priority alerts
export const SOUND_PRIORITY = {
  detected: 1,
  warning: 2,
  success: 3,
  error: 4
};

let config = {
  enableDetectedSound: false // Default playDetected is OFF
};

let listenersAttached = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Priority-based rate limiter
 * Allows playback if the minimum interval has passed OR if the new tone has a higher priority.
 */
function checkRateLimit(priority) {
  const now = Date.now();
  const elapsed = now - lastPlayAt;

  if (elapsed >= MIN_PLAY_INTERVAL) {
    lastPlayAt = now;
    lastPriority = priority;
    return true;
  }

  // Override if the new tone is more important (e.g. Success or Error displacing Detected)
  if (priority > lastPriority) {
    lastPlayAt = now;
    lastPriority = priority;
    return true;
  }

  return false;
}

// Auto-unlock helper for mobile browser Autoplay policies
const unlock = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      cleanupListeners();
    }).catch(() => {});
  } else if (ctx && ctx.state === 'running') {
    cleanupListeners();
  }
};

const setupListeners = () => {
  if (typeof window === 'undefined' || listenersAttached) return;
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('click', unlock, { passive: true });
  document.addEventListener('touchstart', unlock, { passive: true });
  listenersAttached = true;
};

const cleanupListeners = () => {
  if (typeof window !== 'undefined' && listenersAttached) {
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    listenersAttached = false;
  }
};

// Bind global gestures to unlock the AudioContext dynamically (safe from duplicate attachments)
setupListeners();

export const audioService = {
  /**
   * Configure global audio options
   */
  configure(opts) {
    config = { ...config, ...opts };
  },

  /**
   * Play Detected Sound: Very short crisp bip (1000Hz) over ~45ms.
   * Optional (Default: OFF). Priority: Low (1).
   */
  async playDetected() {
    if (!config.enableDetectedSound) return;
    if (!checkRateLimit(SOUND_PRIORITY.detected)) return;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) {}
    }
    if (ctx.state !== 'running') return; // Safe guard for Safari locking

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.start(now);
    osc.stop(now + 0.045);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  },

  /**
   * Play Success Sound: 2 short ascending tones (900Hz -> 1300Hz) in quick succession ("beep-beep").
   * Priority: High (3).
   */
  async playSuccess() {
    if (!checkRateLimit(SOUND_PRIORITY.success)) return;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) {}
    }
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;
    
    // Nada 1: 900Hz (0ms to 50ms)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(900, now);
    
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    
    osc1.start(now);
    osc1.stop(now + 0.05);

    osc1.onended = () => {
      osc1.disconnect();
      gain1.disconnect();
    };

    // Nada 2: 1300Hz (100ms to 150ms) — 50ms silent gap
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1300, now + 0.10);
    
    gain2.gain.setValueAtTime(0.0001, now + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc2.start(now + 0.10);
    osc2.stop(now + 0.15);

    osc2.onended = () => {
      osc2.disconnect();
      gain2.disconnect();
    };
  },

  /**
   * Play Warning Sound: 1 medium-length single beep (600Hz) over ~120ms.
   * Priority: Medium-High (2).
   */
  async playWarning() {
    if (!checkRateLimit(SOUND_PRIORITY.warning)) return;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) {}
    }
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  },

  /**
   * Play Error Sound: 1 long descending beep ("beeeeeep") over ~350ms (starts at 500Hz, slides to 250Hz).
   * Priority: Highest (4).
   */
  async playError() {
    if (!checkRateLimit(SOUND_PRIORITY.error)) return;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) {}
    }
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.35);
    
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
};
