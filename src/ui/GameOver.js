/**
 * GameOver.js
 * End-of-run recap screen with high score detection, statistics, and restart triggers.
 */

export class GameOver {
  constructor(gameState, audioManager, onRestart, onMenu) {
    this.gameState = gameState;
    this.audio = audioManager;
    this.onRestart = onRestart;
    this.onMenu = onMenu;

    this.screenEl = document.getElementById('game-over-screen');
    this.scoreEl = document.getElementById('go-score');
    this.bestEl = document.getElementById('go-best');
    this.distEl = document.getElementById('go-distance');
    this.coinsEl = document.getElementById('go-coins');
    this.newRecordBadge = document.getElementById('new-high-score-badge');

    this.initButtons();
  }

  initButtons() {
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onRestart();
      });
    }

    const btnMenu = document.getElementById('btn-gameover-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onMenu();
      });
    }
  }

  show() {
    const { isNew, highScore, score } = this.gameState.saveHighScore();

    if (this.scoreEl) this.scoreEl.textContent = score.toLocaleString();
    if (this.bestEl) this.bestEl.textContent = highScore.toLocaleString();
    if (this.distEl) this.distEl.textContent = `${Math.floor(this.gameState.distance)} m`;
    if (this.coinsEl) this.coinsEl.textContent = `🪙 ${this.gameState.coins.toLocaleString()}`;

    if (this.newRecordBadge) {
      this.newRecordBadge.style.display = isNew ? 'inline-block' : 'none';
    }

    if (this.screenEl) this.screenEl.classList.add('active');
  }

  hide() {
    if (this.screenEl) this.screenEl.classList.remove('active');
  }
}

