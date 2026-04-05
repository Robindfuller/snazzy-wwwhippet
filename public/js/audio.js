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

  // Classic ICQ "uh oh" notification
  playIcqMessage() {
    try {
      if (!this.icqSound) {
        this.icqSound = new Audio('/audio/icq-message.mp3');
        this.icqSound.volume = 0.4;
      }
      this.icqSound.currentTime = 0;
      this.icqSound.play().catch(() => {});
    } catch {}
  },
};
