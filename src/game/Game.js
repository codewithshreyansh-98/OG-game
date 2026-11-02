/**
 * Game.js
 * Core Three.js Engine Orchestrator for OGRun.
 * Manages rendering, lighting, camera choreography, game loop, and subsystem coordination.
 */

import * as THREE from 'three';
import { STATES } from './GameState.js';
import { Player } from './Player.js';
import { Controls } from './Controls.js';
import { ObstacleManager } from './ObstacleManager.js';
import { CoinManager } from './CoinManager.js';
import { PowerUpManager } from './PowerUpManager.js';
import { CollisionSystem } from './CollisionSystem.js';
import { EnvironmentManager } from '../environments/EnvironmentManager.js';

export class Game {
  constructor(container, gameState, audioManager) {
    this.container = container;
    this.gameState = gameState;
    this.audio = audioManager;

    this.clock = new THREE.Clock();
    this.isRunning = false;

    // Camera modes & cinematic offsets
    this.cameraDistance = 7.2;
    this.cameraHeight = 3.8;
    this.cameraFov = 60;
    this.menuAngle = 0;

    this.initThree();
    this.initLighting();
    this.initSubsystems();
    this.initEvents();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfce4ec);
    this.scene.fog = new THREE.Fog(0xfff3e0, 45, 160);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      this.cameraFov,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      300
    );
    this.camera.position.set(0, 3.5, 6);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    
    // Enable shadows if supported and enabled in settings
    this.renderer.shadowMap.enabled = this.gameState.shadowsEnabled;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initLighting() {
    // 1. Warm Indian Sunlight (Directional Light)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.sunLight.position.set(25, 45, 20);
    this.sunLight.castShadow = this.gameState.shadowsEnabled;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.scene.add(this.sunLight);

    // 2. Hemisphere Light (Golden sky + warm terracotta bounce)
    this.hemiLight = new THREE.HemisphereLight(0xffeaa7, 0xdfe6e9, 0.7);
    this.scene.add(this.hemiLight);

    // 3. Ambient Light for soft fill
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);
  }

  initSubsystems() {
    this.player = new Player(this.scene, this.gameState, this.audio);
    this.controls = new Controls(this.player, this.gameState, this.audio);
    this.obstacleManager = new ObstacleManager(this.scene, this.gameState);
    this.coinManager = new CoinManager(this.scene, this.gameState, this.audio);
    this.powerUpManager = new PowerUpManager(this.scene, this.gameState, this.audio);
    this.environmentManager = new EnvironmentManager(this.scene, this.gameState, this.audio);
    this.collisionSystem = new CollisionSystem(this.player, this.obstacleManager, this.gameState, this.audio);
  }

  initEvents() {
    // Window Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Settings changes
    this.gameState.on('settingChange', ({ setting, value }) => {
      if (setting === 'shadows') {
        this.renderer.shadowMap.enabled = value;
        this.sunLight.castShadow = value;
      }
    });

    // State changes
    this.gameState.on('stateChange', ({ oldState, newState }) => {
      this.handleStateChange(oldState, newState);
    });
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  handleStateChange(oldState, newState) {
    if (newState === STATES.PLAYING) {
      if (oldState === STATES.MENU || oldState === STATES.GAME_OVER) {
        this.resetGame();
      }
      this.audio.startMusic();
    } else if (newState === STATES.PAUSED) {
      this.audio.stopMusic();
    } else if (newState === STATES.GAME_OVER) {
      this.audio.stopMusic();
    } else if (newState === STATES.MENU) {
      this.audio.stopMusic();
      this.resetGame();
    }
  }

  resetGame() {
    this.gameState.resetRun();
    this.player.resetPosition();
    this.obstacleManager.reset();
    this.coinManager.reset();
    this.powerUpManager.reset();
    this.environmentManager.reset();
    this.collisionSystem.reset();
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  // ========================================================
  // MAIN ANIMATION LOOP
  // ========================================================

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1); // Clamp to prevent jump on tab switch

    const state = this.gameState.currentState;

    if (state === STATES.PLAYING) {
      this.updatePlaying(delta);
    } else if (state === STATES.MENU) {
      this.updateMenu(delta);
    } else if (state === STATES.PAUSED) {
      // Game paused, do not advance position
    } else if (state === STATES.GAME_OVER) {
      this.updateGameOver(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  updatePlaying(delta) {
    const gameSpeed = this.gameState.currentSpeed;
    const distanceStep = gameSpeed * delta;

    // 1. Advance distance & score
    this.gameState.addDistance(distanceStep);

    // 2. Advance player along negative Z axis
    this.player.group.position.z -= distanceStep;
    const playerZ = this.player.group.position.z;
    const playerPos = this.player.group.position;

    // 3. Update Player model, animations, and lane movement
    this.player.update(delta, gameSpeed);

    // 4. Update dynamic sunlight position to follow player
    this.sunLight.position.z = playerZ + 20;
    this.sunLight.target.position.z = playerZ;
    this.sunLight.target.updateMatrixWorld();

    // 5. Update Subsystems
    this.environmentManager.update(delta, playerZ, this.gameState.distance);
    this.obstacleManager.update(delta, playerZ);
    this.coinManager.update(delta, playerPos, playerZ);
    this.powerUpManager.update(delta, playerPos, playerZ);

    // 6. Check Collisions
    const crashed = this.collisionSystem.checkCollisions();
    this.collisionSystem.update(delta);

    if (crashed) {
      // Delay game over screen slightly for funny crash tumble
      setTimeout(() => {
        if (this.gameState.currentState === STATES.PLAYING) {
          this.gameState.setState(STATES.GAME_OVER);
        }
      }, 1100);
    }

    // 7. Update dynamic music tempo
    this.audio.updateTempo(gameSpeed / this.gameState.baseSpeed);

    // 8. Dynamic Third-Person Chase Camera
    const targetCamX = this.player.group.position.x * 0.45;
    const targetCamY = this.cameraHeight + Math.max(0, this.player.group.position.y * 0.5);
    const targetCamZ = playerZ + this.cameraDistance;

    // Smooth camera lag
    this.camera.position.x += (targetCamX - this.camera.position.x) * delta * 10;
    this.camera.position.y += (targetCamY - this.camera.position.y) * delta * 8;
    this.camera.position.z = targetCamZ;

    // Dynamic FOV kick during speed rush
    const isBoosting = this.gameState.activePowerUps.has('chai') || this.gameState.activePowerUps.has('turbo');
    const targetFov = isBoosting ? 72 : 60;
    this.camera.fov += (targetFov - this.camera.fov) * delta * 4;
    this.camera.updateProjectionMatrix();

    // Look slightly ahead of player
    this.camera.lookAt(
      this.player.group.position.x * 0.35,
      this.player.group.position.y * 0.5 + 1.6,
      playerZ - 10.0
    );
  }

  updateMenu(delta) {
    // Cinematic camera sweep around player in Indian monument setting
    this.menuAngle += delta * 0.35;
    const radius = 4.5;
    const camX = Math.sin(this.menuAngle) * radius;
    const camZ = Math.cos(this.menuAngle) * radius;

    this.camera.position.set(camX, 2.2, camZ);
    this.camera.lookAt(0, 1.3, 0);

    // Keep player in idle namaste pose
    this.player.update(delta, 0);

    // Keep environment looking clean
    this.environmentManager.update(delta, 0, 0);
  }

  updateGameOver(delta) {
    // Continue animating crash tumble & explosion particles
    this.player.update(delta, 0);
    this.collisionSystem.update(delta);
  }
}
