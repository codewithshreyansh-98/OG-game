/**
 * CoinManager.js
 * Procedural Indian Rupee / Ashoka Chakra Gold Coins with magnet physics and pooling.
 */

import * as THREE from 'three';

export class CoinManager {
  constructor(scene, gameState, audioManager) {
    this.scene = scene;
    this.gameState = gameState;
    this.audio = audioManager;

    this.laneWidth = 2.5;
    this.lanes = [-this.laneWidth, 0, this.laneWidth];

    this.activeCoins = [];
    this.pool = [];

    this.spawnDistance = 110;
    this.nextSpawnZ = -15;

    // Shared gold coin material
    this.coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x553300,
      emissiveIntensity: 0.2
    });

    // Create shared coin geometry
    this.coinGeo = this.createCoinGeometry();

    // Particle pool for pickup sparkle effects
    this.initSparkleParticles();
  }

  createCoinGeometry() {
    // 3D Cylinder Coin with bevel/rim
    const geo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    geo.rotateX(Math.PI / 2); // Stand vertically facing camera
    return geo;
  }

  initSparkleParticles() {
    this.sparkleGroup = new THREE.Group();
    this.scene.add(this.sparkleGroup);
    this.activeSparkles = [];
  }

  spawnCoin(x, y, z) {
    let coin;
    if (this.pool.length > 0) {
      coin = this.pool.pop();
    } else {
      coin = new THREE.Mesh(this.coinGeo, this.coinMaterial);
      coin.castShadow = false;

      // Add inner chakra rim
      const innerRimGeo = new THREE.TorusGeometry(0.24, 0.025, 8, 16);
      const innerMesh = new THREE.Mesh(innerRimGeo, new THREE.MeshStandardMaterial({
        color: 0xff9f43,
        metalness: 0.8
      }));
      coin.add(innerMesh);
    }

    coin.position.set(x, y, z);
    coin.collected = false;
    coin.rotation.set(0, Math.random() * Math.PI, 0);

    this.scene.add(coin);
    this.activeCoins.push(coin);
    return coin;
  }

  spawnCoinPattern(patternType, laneIndex, startZ) {
    const laneX = this.lanes[laneIndex];

    if (patternType === 'straight') {
      // Line of 5 coins
      for (let i = 0; i < 5; i++) {
        this.spawnCoin(laneX, 0.9, startZ - i * 2.8);
      }
    } else if (patternType === 'jump_arc') {
      // Parabolic arc for jumping (peak height ~2.4m)
      const count = 5;
      for (let i = 0; i < count; i++) {
        const progress = i / (count - 1);
        const y = 0.9 + Math.sin(progress * Math.PI) * 1.5;
        this.spawnCoin(laneX, y, startZ - i * 2.4);
      }
    } else if (patternType === 'switch_curve') {
      // Curve across lanes
      const targetLane = (laneIndex === 0) ? 1 : (laneIndex === 2) ? 1 : (Math.random() < 0.5 ? 0 : 2);
      const startX = this.lanes[laneIndex];
      const endX = this.lanes[targetLane];
      const count = 6;
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const x = startX + (endX - startX) * t;
        this.spawnCoin(x, 0.9, startZ - i * 2.6);
      }
    }
  }

  generateCoinsAhead(playerZ) {
    const lane = Math.floor(Math.random() * 3);
    const patterns = ['straight', 'jump_arc', 'switch_curve'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    this.spawnCoinPattern(pattern, lane, this.nextSpawnZ);
    this.nextSpawnZ -= 22 + Math.random() * 8;
  }

  triggerSparkle(pos) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      );
      p.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 6
      );
      this.sparkleGroup.add(p);
      this.activeSparkles.push({ mesh: p, vel, life: 0.35 });
    }
  }

  update(delta, playerPos, playerZ) {
    // Generate new coins ahead
    while (this.nextSpawnZ > playerZ - this.spawnDistance) {
      this.generateCoinsAhead(playerZ);
    }

    const hasMagnet = this.gameState.activePowerUps.has('magnet');
    const magnetRadius = 16.0;

    // Animate & collect coins
    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];

      // Spin coin
      coin.rotation.y += delta * 4.5;

      // Magnet attraction physics
      if (hasMagnet) {
        const distToPlayer = coin.position.distanceTo(playerPos);
        if (distToPlayer < magnetRadius) {
          const dir = new THREE.Vector3().subVectors(playerPos, coin.position).normalize();
          const pullSpeed = 24.0 * (1.0 - distToPlayer / magnetRadius) + 12.0;
          coin.position.addScaledVector(dir, pullSpeed * delta);
        }
      }

      // Check pickup collision with player
      const dx = Math.abs(coin.position.x - playerPos.x);
      const dy = Math.abs(coin.position.y - playerPos.y);
      const dz = Math.abs(coin.position.z - playerPos.z);

      if (dx < 0.75 && dy < 1.4 && dz < 0.9) {
        // Collected!
        this.gameState.addCoins(1);
        this.audio.playCoinSound();
        this.triggerSparkle(coin.position);

        this.scene.remove(coin);
        this.activeCoins.splice(i, 1);
        this.pool.push(coin);
        continue;
      }

      // Despawn behind player
      if (coin.position.z > playerZ + 12) {
        this.scene.remove(coin);
        this.activeCoins.splice(i, 1);
        this.pool.push(coin);
      }
    }

    // Update Sparkle particles
    for (let i = this.activeSparkles.length - 1; i >= 0; i--) {
      const sp = this.activeSparkles[i];
      sp.life -= delta;
      if (sp.life <= 0) {
        this.sparkleGroup.remove(sp.mesh);
        this.activeSparkles.splice(i, 1);
        continue;
      }
      sp.mesh.position.addScaledVector(sp.vel, delta);
      sp.mesh.scale.multiplyScalar(0.92);
    }
  }

  reset() {
    this.activeCoins.forEach(coin => {
      this.scene.remove(coin);
      this.pool.push(coin);
    });
    this.activeCoins = [];
    this.nextSpawnZ = -15;

    this.activeSparkles.forEach(s => this.sparkleGroup.remove(s.mesh));
    this.activeSparkles = [];
  }
}

