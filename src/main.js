/**
 * main.js
 * Application entry point for OGRun — The Great Indian Run.
 * Connects the 3D Engine, Game State, Audio System, and UI screens.
 */

import { GameState, STATES } from './game/GameState.js';
import { AudioManager } from './game/AudioManager.js';
import { Game } from './game/Game.js';
import { MainMenu } from './ui/MainMenu.js';
import { HUD } from './ui/HUD.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { GameOver } from './ui/GameOver.js';
import { CharacterSelection } from './ui/CharacterSelection.js';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.getElementById('progress-bar');
  const loadingStatus = document.getElementById('loading-status');

  // 1. Initialize Core Systems
  const gameState = new GameState();
  const audioManager = new AudioManager(gameState);
  const game = new Game(container, gameState, audioManager);

  // Expose to window for debugging/testing
  window.__gameState = gameState;
  window.__game = game;

  // 2. Initialize UI Layers
  const mainMenu = new MainMenu(gameState, audioManager, () => {
    gameState.setState(STATES.PLAYING);
  });

  const hud = new HUD(gameState, audioManager, () => {
    gameState.setState(STATES.PAUSED);
  });

  const pauseMenu = new PauseMenu(
    gameState,
    audioManager,
    () => gameState.setState(STATES.PLAYING), // Resume
    () => gameState.setState(STATES.PLAYING), // Restart
    () => gameState.setState(STATES.MENU)     // Main Menu
  );

  const gameOver = new GameOver(
    gameState,
    audioManager,
    () => gameState.setState(STATES.PLAYING), // Run Again
    () => gameState.setState(STATES.MENU)     // Main Menu
  );

  const characterSelection = new CharacterSelection(gameState, audioManager);

  // 3. UI State Synchronization
  const updateUIScreens = (state) => {
    mainMenu.hide();
    hud.hide();
    pauseMenu.hide();
    gameOver.hide();

    switch (state) {
      case STATES.MENU:
        mainMenu.show();
        break;
      case STATES.PLAYING:
        hud.show();
        break;
      case STATES.PAUSED:
        hud.show();
        pauseMenu.show();
        break;
      case STATES.GAME_OVER:
        hud.show();
        gameOver.show();
        break;
    }
  };

  gameState.on('stateChange', ({ newState }) => {
    updateUIScreens(newState);
  });

  // 4. Loading Sequence & Warmup
  const loadingTips = [
    'Polishing Taj Mahal Makrana marble...',
    'Tuning Dhol & Tabla percussion beats...',
    'Sweeping Rajpath & Kartavya Path boulevard...',
    'Brewing hot Kadak Chai power-ups...',
    'Fastening Indian Mojari running shoes...',
    'Ready for the Great Indian Run!'
  ];

  let loadProgress = 0;
  let tipIndex = 0;

  const loadInterval = setInterval(() => {
    loadProgress += 18;
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, loadProgress)}%`;
    }
    if (loadingStatus && tipIndex < loadingTips.length) {
      loadingStatus.textContent = loadingTips[tipIndex++];
    }

    if (loadProgress >= 100) {
      clearInterval(loadInterval);

      setTimeout(() => {
        // Hide loading screen and start game loop
        if (loadingScreen) {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.classList.remove('active');
            loadingScreen.style.display = 'none';
          }, 400);
        }

        // Start 3D Game Engine
        game.start();
        if (gameState.currentState === STATES.LOADING) {
          gameState.setState(STATES.MENU);
        }
      }, 500);
    }
  }, 120);
});
