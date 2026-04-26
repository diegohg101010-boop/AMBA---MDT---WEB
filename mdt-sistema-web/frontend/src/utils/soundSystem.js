class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.6;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(frequency, duration, type = 'sine', volume = this.volume) {
    if (!this.enabled) return;
    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  click() {
    this.playTone(1200, 0.04, 'sine', 0.5);
  }

  clickPrimary() {
    this.playTone(1400, 0.06, 'sine', 0.6);
    setTimeout(() => this.playTone(1600, 0.04, 'sine', 0.5), 30);
  }

  clickDanger() {
    this.playTone(800, 0.08, 'square', 0.6);
    setTimeout(() => this.playTone(700, 0.08, 'square', 0.5), 60);
  }

  success() {
    this.playTone(1000, 0.08, 'sine', 0.6);
    setTimeout(() => this.playTone(1200, 0.08, 'sine', 0.6), 80);
    setTimeout(() => this.playTone(1400, 0.12, 'sine', 0.7), 160);
  }

  error() {
    this.playTone(500, 0.12, 'sawtooth', 0.7);
    setTimeout(() => this.playTone(400, 0.15, 'sawtooth', 0.6), 80);
  }

  hover() {
    this.playTone(1400, 0.02, 'sine', 0.3);
  }

  openModal() {
    this.playTone(800, 0.06, 'sine', 0.5);
    setTimeout(() => this.playTone(1100, 0.08, 'sine', 0.6), 60);
  }

  closeModal() {
    this.playTone(1100, 0.06, 'sine', 0.5);
    setTimeout(() => this.playTone(800, 0.08, 'sine', 0.4), 60);
  }

  notification() {
    this.playTone(1200, 0.08, 'sine', 0.7);
    setTimeout(() => this.playTone(1400, 0.08, 'sine', 0.7), 120);
  }

  typing() {
    this.playTone(1600, 0.015, 'sine', 0.2);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

export const soundSystem = new SoundSystem();
