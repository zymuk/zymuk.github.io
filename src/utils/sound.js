let cachedContext = null;

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!cachedContext) {
    cachedContext = new Ctor();
  }
  return cachedContext;
};

const beep = (ctx, start, frequency, duration) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
};

const CHIME_NOTES = [880, 1046, 1318];

const playReminderSound = () => {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const now = ctx.currentTime;
  CHIME_NOTES.forEach((frequency, index) => {
    beep(ctx, now + index * 0.16, frequency, 0.18);
  });
  CHIME_NOTES.forEach((frequency, index) => {
    beep(ctx, now + 0.8 + index * 0.16, frequency, 0.18);
  });
};

export { playReminderSound };
