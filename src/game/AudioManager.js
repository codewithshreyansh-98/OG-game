/**
 * AudioManager.js
 * High-performance Web Audio API procedural sound engine with Indian festive percussion & arcade SFX.
 * Zero external audio file dependencies — 100% reliable, zero CORS/404 issues.
 */

export class AudioManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isInitialized = false;

    // Music playback state
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.beatStep = 0;
    this.baseBpm = 115;
    this.currentBpm = 115;

    // Raag Bhupali scale frequencies for coin arpeggios (Sa, Re, Ga, Pa, Dha, Sa')
    this.scaleFrequencies = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    this.coinPitchIndex = 0;
    this.lastCoinTime = 0;

    // Listen to settings
    this.gameState.on('settingChange', ({ setting, value }) => {
      if (setting === 'sound') {
        if (!value) {
          this.stopMusic();
          if (this.masterGain) this.masterGain.gain.value = 0;
        } else {
          if (this.masterGain) this.masterGain.gain.value = 1;
          if (this.gameState.currentState === 'PLAYING') {
            this.startMusic();
          }
        }
      }
    });

    // Handle user interaction to unlock AudioContext
    const unlockAudio = () => {
      this.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.gameState.soundEnabled ? 1.0 : 0.0;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.28;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.45;
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported in this browser:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ========================================================
  // PROCEDURAL SFX
  // ========================================================

  playCoinSound() {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastCoinTime < 0.8) {
      this.coinPitchIndex = (this.coinPitchIndex + 1) % this.scaleFrequencies.length;
    } else {
      this.coinPitchIndex = 0;
    }
    this.lastCoinTime = now;

    const freq = this.scaleFrequencies[this.coinPitchIndex];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);

    // Add high shimmer harmonic
    const shimmer = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(freq * 2, now);
    sGain.gain.setValueAtTime(0.12, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    shimmer.connect(sGain);
    sGain.connect(this.sfxGain);
    shimmer.start(now);
    shimmer.stop(now + 0.2);
  }

  playJumpSound() {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playSlideSound() {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  playCrashSound() {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low frequency punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);

    // Crunchy noise burst
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  playPowerUpSound(type) {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (type === 'chai' || type === 'turbo') {
      // High-energy fanfare arpeggio
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.4, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } else if (type === 'shield') {
      // Golden bell chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'magnet') {
      // Magnetic sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  playButtonClick() {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playZoneChangeSound() {
    if (!this.gameState.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Grand fanfare chord: Indian brass feel
    [261.63, 329.63, 392.00, 523.25].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // ========================================================
  // PROCEDURAL INDIAN DHOL / FESTIVE RHYTHM MUSIC
  // ========================================================

  startMusic() {
    if (!this.gameState.soundEnabled || this.isPlayingMusic) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    this.beatStep = 0;
    this.scheduleNextBeat();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  updateTempo(speedRatio) {
    this.currentBpm = Math.min(165, this.baseBpm * (0.85 + speedRatio * 0.25));
  }

  scheduleNextBeat() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const beatInterval = (60 / this.currentBpm) / 4; // 16th notes
    this.playDholBeat(this.beatStep);
    this.beatStep = (this.beatStep + 1) % 16;

    this.musicTimer = setTimeout(() => {
      this.scheduleNextBeat();
    }, beatInterval * 1000);
  }

  playDholBeat(step) {
    if (!this.gameState.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Traditional Indian Teental / Dholak inspired groove pattern:
    // Bass Dha (heavy bass drum on 0, 6, 8, 12)
    const isBass = (step === 0 || step === 6 || step === 8 || step === 12);
    // Treble Ta/Tin (sharp rim slap on 2, 4, 10, 14)
    const isSnare = (step === 2 || step === 4 || step === 10 || step === 14);
    // Ghunghroo / shaker syncopation
    const isShaker = (step % 2 === 1);

    if (isBass) {
      // Dhol base stroke (Dagga)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    if (isSnare) {
      // Dhol treble stroke (Chanti)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    if (isShaker) {
      // Ghunghroo / jingle bells
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      noise.start(now);
    }

    // Melodic Sitar / Bansuri drone note on measure start
    if (step === 0 || step === 8) {
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = 'sawtooth';
      const rootFreq = (step === 0) ? 146.83 : 164.81; // D3 / E3
      droneOsc.frequency.setValueAtTime(rootFreq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      droneGain.gain.setValueAtTime(0.12, now);
      droneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      droneOsc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.musicGain);
      droneOsc.start(now);
      droneOsc.stop(now + 0.6);
    }
  }
}

