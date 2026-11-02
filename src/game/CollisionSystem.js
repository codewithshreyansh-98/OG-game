/**
 * CollisionSystem.js
 * 3D bounding calculations, jump/slide clearance tests, and power-up shield protection.
 */

import * as THREE from 'three';

export class CollisionSystem {
  constructor(player, obstacleManager, gameState, audioManager) {
    this.player = player;
    this.obstacleManager = obstacleManager;
    this.gameState = gameState;
    this.audio = audioManager;

    // Obstacle explosion particle system (when plowed through with Shield or Chai)
    this.initExplosionParticles();
  }

  initExplosionParticles() {
    this.explosionGroup = new THREE.Group();
    this.player.scene.add(this.explosionGroup);
    this.activeParticles = [];
  }

  triggerExplosion(pos) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshBasicMaterial({ color: Math.random() < 0.5 ? 0xff671f : 0xffd700 })
      );
      p.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        Math.random() * 8 + 3,
        (Math.random() - 0.5) * 12
      );
      this.explosionGroup.add(p);
      this.activeParticles.push({ mesh: p, vel, rot: Math.random() * 8, life: 0.5 });
    }
  }

  checkCollisions() {
    if (this.player.isCrashing || this.gameState.currentState !== 'PLAYING') {
      return false;
    }

    const playerPos = this.player.group.position;
    const playerY = playerPos.y;
    const isJumping = this.player.isJumping;
    const isSliding = this.player.isSliding;

    const obstacles = this.obstacleManager.activeObstacles;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const obsPos = obs.position;

      // Quick Z-axis distance culling (only check within ±1.8m in Z)
      const dz = Math.abs(obsPos.z - playerPos.z);
      if (dz > 1.6) continue;

      // X-axis lane overlap test
      const dx = Math.abs(obsPos.x - playerPos.x);
      if (dx > 1.1) continue; // In different lane, safe!

      // Y-axis Clearance Logic:
      let safePass = false;

      // Case 1: Low obstacle requiring jump (Cockroach or Barricade)
      if (obs.requiresJump) {
        if (isJumping && playerY > 0.85) {
          safePass = true; // High enough to clear!
        }
      }

      // Case 2: High obstacle requiring slide (Hanging Marigold Toran)
      if (obs.requiresSlide) {
        if (isSliding && playerY < 0.3) {
          safePass = true; // Slid safely under the banner!
        }
      }

      if (safePass) continue;

      // Collision Occurred!
      // Check Power-Up Absorptions:
      // 1. Kadak Chai or Turbo Boost (Supersonic Invincibility)
      if (this.gameState.activePowerUps.has('chai') || this.gameState.activePowerUps.has('turbo')) {
        this.triggerExplosion(obsPos);
        this.audio.playCrashSound();

        // Remove obstacle
        this.player.scene.remove(obs);
        this.obstacleManager.activeObstacles.splice(i, 1);
        this.obstacleManager.pool.push(obs);
        continue;
      }

      // 2. Surakshak Golden Shield
      if (this.gameState.activePowerUps.has('shield')) {
        this.gameState.activePowerUps.delete('shield');
        const shieldPill = document.getElementById('pu-pill-shield');
        if (shieldPill) shieldPill.remove();

        this.triggerExplosion(obsPos);
        this.audio.playCrashSound();

        // Remove obstacle
        this.player.scene.remove(obs);
        this.obstacleManager.activeObstacles.splice(i, 1);
        this.obstacleManager.pool.push(obs);
        continue;
      }

      // Lethal Crash: Trigger Game Over!
      this.player.triggerCrash();
      return true;
    }

    return false;
  }

  update(delta) {
    // Update explosion particle physics
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.explosionGroup.remove(p.mesh);
        this.activeParticles.splice(i, 1);
        continue;
      }
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 25.0 * delta; // Gravity
      p.mesh.rotation.x += p.rot * delta;
      p.mesh.rotation.y += p.rot * delta;
      p.mesh.scale.multiplyScalar(0.94);
    }
  }

  reset() {
    this.activeParticles.forEach(p => this.explosionGroup.remove(p.mesh));
    this.activeParticles = [];
  }
}

