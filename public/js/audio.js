// Audio manager for dial-up sounds and UI clicks
const AudioManager = {
  dialupSound: null,
  clickSound: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Dial-up modem sound
    this.dialupSound = new Audio('/audio/dialup.mp3');
    this.dialupSound.volume = 0.3;

    // Generate a simple click sound using Web Audio API
    this.audioCtx = null;
  },

  getAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  },

  playClick() {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.05;
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch {}
  },

  playDialup() {
    try {
      if (this.dialupSound) {
        this.dialupSound.currentTime = 0;
        this.dialupSound.play().catch(() => {});
      }
    } catch {}
  },

  stopDialup() {
    try {
      if (this.dialupSound) {
        this.dialupSound.pause();
        this.dialupSound.currentTime = 0;
      }
    } catch {}
  },

  // Classic ICQ "uh oh" notification — synthesized two-tone chirp
  playIcqMessage() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // First tone — "uh" (lower, descending)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(600, now);
      osc1.frequency.linearRampToValueAtTime(400, now + 0.15);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Second tone — "oh" (higher, ascending chirp)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(500, now + 0.22);
      osc2.frequency.linearRampToValueAtTime(800, now + 0.4);
      gain2.gain.setValueAtTime(0, now + 0.22);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.45);
    } catch {}
  },
};
