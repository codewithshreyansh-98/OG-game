/**
 * PowerUpManager.js
 * Spawns, animates, and governs all 4 Indian power-ups:
 * Kadak Chai Rush, Chumbak Magnet, Surakshak Shield, and Turbo Boost.
 */

import * as THREE from 'three';

export const POWER_UP_TYPES = {
  chai: {
    id: 'chai',
    name: 'Kadak Chai Rush',
    icon: '☕',
    duration: 10,
    color: 0xff671f,
    desc: 'Invincible speed frenzy & 2x coins!'
  },
  magnet: {
    id: 'magnet',
    name: 'Chumbak Magnet',
    icon: '🧲',
    duration: 12,
    color: 0x0984e3,
    desc: 'Draws all rupee coins from all lanes!'
  },
  shield: {
    id: 'shield',
    name: 'Surakshak Shield',
    icon: '🛡️',
    duration: 15,
    color: 0xffd700,
    desc: 'Absorbs 1 obstacle crash safely!'
  },
  turbo: {
    id: 'turbo',
    name: 'Turbo Boost',
    icon: '🚀',
    duration: 8,
    color: 0x00b894,
    desc: 'Supersonic acceleration & double points!'
  }
};

export class PowerUpManager {
  constructor(scene, gameState, audioManager) {
    this.scene = scene;
    this.gameState = gameState;
    this.audio = audioManager;

    this.laneWidth = 2.5;
    this.lanes = [-this.laneWidth, 0, this.laneWidth];

    this.activePickups = [];
    this.pool = [];

    this.spawnDistance = 110;
    this.nextSpawnZ = -65;
    this.minSpawnInterval = 60; // Spawns every 60-90m
    this.maxSpawnInterval = 95;

    this.hudContainer = document.getElementById('hud-powerups');
  }

  // ========================================================
  // PROCEDURAL 3D PICKUP MODELS
  // ========================================================

  createChaiModel() {
    const group = new THREE.Group();
    group.powerUpType = 'chai';

    // Cutting Chai Glass (tapered glass tumbler)
    const glassGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.7, 12);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    group.add(glass);

    // Warm Spiced Milk Tea Liquid
    const liquidGeo = new THREE.CylinderGeometry(0.3, 0.21, 0.55, 12);
    const liquidMat = new THREE.MeshLambertMaterial({ color: 0xd3833d }); // Milk tea color
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = -0.05;
    group.add(liquid);

    // Rising Steam puff
    const steamGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    const steam = new THREE.Mesh(steamGeo, steamMat);
    steam.position.set(0, 0.55, 0);
    group.add(steam);

    // Golden Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.5, 0.03, 8, 20);
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: 0xffd700 }));
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    return group;
  }

  createMagnetModel() {
    const group = new THREE.Group();
    group.powerUpType = 'magnet';

    // Golden Horseshoe Magnet
    const uGeo = new THREE.TorusGeometry(0.38, 0.1, 10, 16, Math.PI);
    const magnetMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, metalness: 0.8, roughness: 0.2 });
    const uMesh = new THREE.Mesh(uGeo, magnetMat);
    uMesh.rotation.z = Math.PI;
    group.add(uMesh);

    // Silver Pole Tips
    [-0.38, 0.38].forEach(x => {
      const tipGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 8);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, metalness: 0.9 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(x, -0.15, 0);
      group.add(tip);
    });

    // Golden Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 20);
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: 0x74b9ff }));
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    return group;
  }

  createShieldModel() {
    const group = new THREE.Group();
    group.powerUpType = 'shield';

    // Ornate Indian Royal Shield (Golden Ashoka Chakra medallion)
    const discGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 20);
    discGeo.rotateX(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const disc = new THREE.Mesh(discGeo, discMat);
    group.add(disc);

    // Inner Chakra Ring
    const chakraGeo = new THREE.TorusGeometry(0.3, 0.04, 8, 16);
    const chakra = new THREE.Mesh(chakraGeo, new THREE.MeshStandardMaterial({ color: 0x06038d }));
    group.add(chakra);

    // Golden Boss in center
    const centerGeo = new THREE.SphereGeometry(0.14, 10, 10);
    const center = new THREE.Mesh(centerGeo, new THREE.MeshStandardMaterial({ color: 0xffa502, metalness: 0.9 }));
    group.add(center);

    return group;
  }

  createTurboModel() {
    const group = new THREE.Group();
    group.powerUpType = 'turbo';

    // Rocket Sneaker / Turbo Core
    const bodyGeo = new THREE.ConeGeometry(0.3, 0.8, 10);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00b894, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Flame exhausts
    const flameGeo = new THREE.ConeGeometry(0.18, 0.4, 8);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7675 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.z = -0.5;
    group.add(flame);

    return group;
  }

  spawnPickup(type, laneIndex, z) {
    let pickup;
    const poolIdx = this.pool.findIndex(p => p.powerUpType === type);
    if (poolIdx !== -1) {
      pickup = this.pool.splice(poolIdx, 1)[0];
    } else {
      if (type === 'chai') pickup = this.createChaiModel();
      else if (type === 'magnet') pickup = this.createMagnetModel();
      else if (type === 'shield') pickup = this.createShieldModel();
      else if (type === 'turbo') pickup = this.createTurboModel();
    }

    if (!pickup) return null;

    pickup.laneIndex = laneIndex;
    pickup.position.set(this.lanes[laneIndex], 1.1, z);
    pickup.initialY = 1.1;
    pickup.visible = true;

    this.scene.add(pickup);
    this.activePickups.push(pickup);
    return pickup;
  }

  generateNextPickup(playerZ) {
    const types = ['chai', 'magnet', 'shield', 'turbo'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);

    this.spawnPickup(type, lane, this.nextSpawnZ);

    const interval = this.minSpawnInterval + Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);
    this.nextSpawnZ -= interval;
  }

  activatePowerUp(type) {
    const config = POWER_UP_TYPES[type];
    if (!config) return;

    this.gameState.activePowerUps.set(type, {
      id: type,
      name: config.name,
      icon: config.icon,
      duration: config.duration,
      remaining: config.duration,
      color: config.color
    });

    this.audio.playPowerUpSound(type);
    this.renderHUD();
  }

  renderHUD() {
    if (!this.hudContainer) return;
    this.hudContainer.innerHTML = '';

    this.gameState.activePowerUps.forEach(pu => {
      const pill = document.createElement('div');
      pill.className = 'powerup-pill';
      pill.id = `pu-pill-${pu.id}`;

      const pct = (pu.remaining / pu.duration) * 100;
      pill.innerHTML = `
        <span class="pu-icon-badge">${pu.icon}</span>
        <div class="pu-info">
          <div class="pu-name">${pu.name}</div>
          <div class="pu-meter">
            <div id="pu-meter-${pu.id}" class="pu-meter-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
      this.hudContainer.appendChild(pill);
    });
  }

  update(delta, playerPos, playerZ) {
    // Generate new pickups ahead
    while (this.nextSpawnZ > playerZ - this.spawnDistance) {
      this.generateNextPickup(playerZ);
    }

    const time = performance.now() * 0.003;

    // Animate and check pickup collection
    for (let i = this.activePickups.length - 1; i >= 0; i--) {
      const p = this.activePickups[i];

      // Bobbing and spinning animation
      p.rotation.y += delta * 3.0;
      p.position.y = p.initialY + Math.sin(time * 3 + p.position.z * 0.1) * 0.2;

      // Distance to player
      const dx = Math.abs(p.position.x - playerPos.x);
      const dy = Math.abs(p.position.y - playerPos.y);
      const dz = Math.abs(p.position.z - playerPos.z);

      if (dx < 0.9 && dy < 1.5 && dz < 1.0) {
        // Collect!
        this.activatePowerUp(p.powerUpType);

        this.scene.remove(p);
        this.activePickups.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      // Despawn behind player
      if (p.position.z > playerZ + 12) {
        this.scene.remove(p);
        this.activePickups.splice(i, 1);
        this.pool.push(p);
      }
    }

    // Update active power-up timers
    if (this.gameState.activePowerUps.size > 0) {
      const expired = [];
      this.gameState.activePowerUps.forEach((pu, id) => {
        pu.remaining -= delta;
        if (pu.remaining <= 0) {
          expired.push(id);
        } else {
          const meter = document.getElementById(`pu-meter-${id}`);
          if (meter) {
            meter.style.width = `${(pu.remaining / pu.duration) * 100}%`;
          }
        }
      });

      if (expired.length > 0) {
        expired.forEach(id => this.gameState.activePowerUps.delete(id));
        this.renderHUD();
      }
    }
  }

  reset() {
    this.activePickups.forEach(p => {
      this.scene.remove(p);
      this.pool.push(p);
    });
    this.activePickups = [];
    this.nextSpawnZ = -65;
    this.gameState.activePowerUps.clear();
    if (this.hudContainer) this.hudContainer.innerHTML = '';
  }
}

