/**
 * HUD.js
 * Manages the in-game heads-up display overlay during active running.
 */

export class HUD {
  constructor(gameState, audioManager, onPauseCallback) {
    this.gameState = gameState;
    this.audio = audioManager;
    this.onPause = onPauseCallback;

    this.hudEl = document.getElementById('game-hud');
    this.scoreEl = document.getElementById('hud-score');
    this.coinsEl = document.getElementById('hud-coins');
    this.multEl = document.getElementById('hud-multiplier');
    this.speedEl = document.getElementById('hud-speed-text');
    this.mobileControlsEl = document.getElementById('mobile-controls');

    this.initPauseButton();
    this.initListeners();
  }

  initPauseButton() {
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onPause();
      });
    }
  }

  initListeners() {
    this.gameState.on('scoreUpdate', ({ score, coins, multiplier, speed }) => {
      if (this.scoreEl) this.scoreEl.textContent = score.toLocaleString();
      if (this.coinsEl) this.coinsEl.textContent = coins.toLocaleString();
      if (this.multEl) this.multEl.textContent = `x${multiplier}`;
      if (this.speedEl) this.speedEl.textContent = `${speed}%`;
    });

    this.gameState.on('coinCollected', ({ coins }) => {
      if (this.coinsEl) this.coinsEl.textContent = coins.toLocaleString();
    });
  }

  show() {
    if (this.hudEl) this.hudEl.classList.add('active');
    if (this.mobileControlsEl && this.gameState.touchButtonsEnabled) {
      this.mobileControlsEl.classList.add('active');
    }
  }

  hide() {
    if (this.hudEl) this.hudEl.classList.remove('active');
  }
}

