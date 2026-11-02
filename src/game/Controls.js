/**
 * Controls.js
 * Comprehensive input handling: Keyboard + Mobile Touch Swipe Gestures + Virtual Buttons.
 */

export class Controls {
  constructor(player, gameState, audioManager) {
    this.player = player;
    this.gameState = gameState;
    this.audio = audioManager;

    // Swipe tracking variables
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 32; // px

    this.initKeyboard();
    this.initTouchSwipes();
    this.initVirtualButtons();
  }

  initKeyboard() {
    this.handleKeyDown = (e) => {
      // Ignore key events if in background input field or not active
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const code = e.code;

      // Pause toggle
      if (code === 'Escape' || code === 'KeyP') {
        if (this.gameState.currentState === 'PLAYING') {
          this.gameState.setState('PAUSED');
        } else if (this.gameState.currentState === 'PAUSED') {
          this.gameState.setState('PLAYING');
        }
        return;
      }

      // In-game controls
      if (this.gameState.currentState === 'PLAYING') {
        switch (code) {
          case 'ArrowLeft':
          case 'KeyA':
            this.player.moveLeft();
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.player.moveRight();
            break;
          case 'ArrowUp':
          case 'KeyW':
          case 'Space':
            e.preventDefault();
            this.player.jump();
            break;
          case 'ArrowDown':
          case 'KeyS':
            e.preventDefault();
            this.player.slide();
            break;
        }
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);
  }

  initTouchSwipes() {
    const target = document.body;

    target.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    target.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;
      }
    }, { passive: true });

    target.addEventListener('touchend', () => {
      if (this.gameState.currentState !== 'PLAYING') return;

      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) < this.minSwipeDistance) return;

      if (absX > absY) {
        // Horizontal Swipe
        if (deltaX > 0) {
          this.player.moveRight();
        } else {
          this.player.moveLeft();
        }
      } else {
        // Vertical Swipe
        if (deltaY < 0) {
          this.player.jump(); // Swiped Up
        } else {
          this.player.slide(); // Swiped Down
        }
      }

      // Reset
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.touchEndX = 0;
      this.touchEndY = 0;
    });
  }

  initVirtualButtons() {
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnJump = document.getElementById('touch-jump');
    const btnSlide = document.getElementById('touch-slide');

    const bindTouch = (el, action) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.gameState.currentState === 'PLAYING') action();
      });
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.gameState.currentState === 'PLAYING') action();
      });
    };

    bindTouch(btnLeft, () => this.player.moveLeft());
    bindTouch(btnRight, () => this.player.moveRight());
    bindTouch(btnJump, () => this.player.jump());
    bindTouch(btnSlide, () => this.player.slide());
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}

