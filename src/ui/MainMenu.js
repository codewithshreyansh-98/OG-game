/**
 * MainMenu.js
 * Controls the Main Menu UI, buttons, sound toggle, high scores, and modals.
 */

export class MainMenu {
  constructor(gameState, audioManager, onPlayCallback) {
    this.gameState = gameState;
    this.audio = audioManager;
    this.onPlay = onPlayCallback;

    this.menuEl = document.getElementById('main-menu');
    this.highScoreEl = document.getElementById('menu-high-score');
    this.totalCoinsEl = document.getElementById('menu-total-coins');
    this.soundIconEl = document.getElementById('sound-icon');

    this.initButtons();
    this.updateStats();
  }

  initButtons() {
    // Play Button
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.audio.playButtonClick();
        this.onPlay();
      });
    }

    // Sound Toggle Button
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const next = !this.gameState.soundEnabled;
        this.gameState.setSoundEnabled(next);
        this.updateSoundIcon();
        this.audio.playButtonClick();
      });
      this.updateSoundIcon();
    }

    // Helper to open a modal dialog and hide the main menu underneath
    const openModal = (modal) => {
      this.audio.playButtonClick();
      modal.classList.add('active');
      this.menuEl.classList.remove('active');
      this.menuEl.style.display = 'none';
    };

    const closeModal = (modal) => {
      this.audio.playButtonClick();
      modal.classList.remove('active');
      this.menuEl.classList.add('active');
      this.menuEl.style.display = 'flex';
    };

    // Outfits Button
    const btnOutfits = document.getElementById('btn-characters');
    const modalOutfits = document.getElementById('character-modal');
    const btnCloseOutfits = document.getElementById('btn-close-outfits');
    if (btnOutfits && modalOutfits) {
      btnOutfits.addEventListener('click', () => openModal(modalOutfits));
      btnCloseOutfits.addEventListener('click', () => closeModal(modalOutfits));
    }

    // Instructions / How to play Button
    const btnHow = document.getElementById('btn-how-to-play');
    const modalHow = document.getElementById('instructions-modal');
    const btnCloseHow = document.getElementById('btn-close-instructions');
    if (btnHow && modalHow) {
      btnHow.addEventListener('click', () => openModal(modalHow));
      btnCloseHow.addEventListener('click', () => closeModal(modalHow));
    }

    // Settings Button
    const btnSettings = document.getElementById('btn-settings');
    const modalSettings = document.getElementById('settings-modal');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const toggleSound = document.getElementById('setting-sound');
    const toggleShadows = document.getElementById('setting-shadows');
    const toggleTouch = document.getElementById('setting-touch-buttons');

    if (btnSettings && modalSettings) {
      btnSettings.addEventListener('click', () => openModal(modalSettings));
      btnCloseSettings.addEventListener('click', () => closeModal(modalSettings));

      if (toggleSound) {
        toggleSound.checked = this.gameState.soundEnabled;
        toggleSound.addEventListener('change', (e) => {
          this.gameState.setSoundEnabled(e.target.checked);
          this.updateSoundIcon();
        });
      }

      if (toggleShadows) {
        toggleShadows.checked = this.gameState.shadowsEnabled;
        toggleShadows.addEventListener('change', (e) => {
          this.gameState.setShadowsEnabled(e.target.checked);
        });
      }

      if (toggleTouch) {
        toggleTouch.checked = this.gameState.touchButtonsEnabled;
        toggleTouch.addEventListener('change', (e) => {
          this.gameState.setTouchButtonsEnabled(e.target.checked);
          const overlay = document.getElementById('mobile-controls');
          if (overlay) {
            overlay.classList.toggle('active', e.target.checked);
          }
        });
      }
    }
  }

  updateSoundIcon() {
    if (this.soundIconEl) {
      this.soundIconEl.textContent = this.gameState.soundEnabled ? '🔊' : '🔇';
    }
  }

  updateStats() {
    if (this.highScoreEl) {
      this.highScoreEl.textContent = this.gameState.highScore.toLocaleString();
    }
    if (this.totalCoinsEl) {
      this.totalCoinsEl.textContent = `₹${this.gameState.totalCoins.toLocaleString()}`;
    }
  }

  show() {
    this.updateStats();
    if (this.menuEl) {
      this.menuEl.style.display = 'flex';
      this.menuEl.classList.add('active');
    }
  }

  hide() {
    if (this.menuEl) {
      this.menuEl.classList.remove('active');
      this.menuEl.style.display = 'none';
    }
  }
}

