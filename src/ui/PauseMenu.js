/**
 * PauseMenu.js
 * Modal dialog presented when the game is paused.
 */

export class PauseMenu {
  constructor(gameState, audioManager, onResume, onRestart, onMenu) {
    this.gameState = gameState;
    this.audio = audioManager;
    this.onResume = onResume;
    this.onRestart = onRestart;
    this.onMenu = onMenu;

    this.menuEl = document.getElementById('pause-screen');
    this.scoreEl = document.getElementById('pause-score');
    this.distEl = document.getElementById('pause-distance');

    this.initButtons();
  }

  initButtons() {
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onResume();
      });
    }

    const btnRestart = document.getElementById('btn-pause-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onRestart();
      });
    }

    const btnMenu = document.getElementById('btn-pause-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onMenu();
      });
    }
  }

  show() {
    if (this.scoreEl) this.scoreEl.textContent = this.gameState.score.toLocaleString();
    if (this.distEl) this.distEl.textContent = `${Math.floor(this.gameState.distance)} m`;
    if (this.menuEl) this.menuEl.classList.add('active');
  }

  hide() {
    if (this.menuEl) this.menuEl.classList.remove('active');
  }
}

