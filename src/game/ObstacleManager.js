/**
 * ObstacleManager.js
 * Procedural generation, object pooling, and humorous 3D obstacle rendering.
 * Features: Giant Cartoon Cockroach, Pappu Caricature, Delhi Police Barricades, Auto-Rickshaws, Hanging Toran banners.
 */

import * as THREE from 'three';

export class ObstacleManager {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this.laneWidth = 2.5;
    this.lanes = [-this.laneWidth, 0, this.laneWidth];

    this.activeObstacles = [];
    this.pool = [];

    // Spawning parameters
    this.spawnDistance = 110; // Distance ahead to spawn
    this.nextSpawnZ = -30;
    this.minSpacing = 24; // Meters between obstacle rows
    this.maxSpacing = 36;

    // Shared materials
    this.initMaterials();
  }

  initMaterials() {
    this.mats = {
      cockroachShell: new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.3, metalness: 0.2 }),
      cockroachLeg: new THREE.MeshLambertMaterial({ color: 0x2e1808 }),
      cockroachEye: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      cockroachPupil: new THREE.MeshBasicMaterial({ color: 0x000000 }),

      pappuKurta: new THREE.MeshLambertMaterial({ color: 0xfdfdfd }),
      pappuSkin: new THREE.MeshLambertMaterial({ color: 0xdeb887 }),
      pappuHair: new THREE.MeshLambertMaterial({ color: 0x222222 }),
      pappuMic: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 }),

      barricadeYellow: new THREE.MeshLambertMaterial({ color: 0xfbc531 }),
      barricadeBlack: new THREE.MeshLambertMaterial({ color: 0x2f3640 }),
      warningLight: new THREE.MeshBasicMaterial({ color: 0xe84118 }),

      autoYellow: new THREE.MeshLambertMaterial({ color: 0xfbc531 }),
      autoGreen: new THREE.MeshLambertMaterial({ color: 0x4cd137 }),
      autoWheel: new THREE.MeshLambertMaterial({ color: 0x1e272e }),
      autoGlass: new THREE.MeshStandardMaterial({ color: 0xdcdde1, transparent: true, opacity: 0.7 }),

      bannerMarigoldOrange: new THREE.MeshLambertMaterial({ color: 0xe67e22 }),
      bannerMarigoldYellow: new THREE.MeshLambertMaterial({ color: 0xf1c40f }),
      bannerRope: new THREE.MeshLambertMaterial({ color: 0x8c7ae6 })
    };
  }

  // ========================================================
  // PROCEDURAL 3D OBSTACLE FACTORIES
  // ========================================================

  createCockroach() {
    const group = new THREE.Group();
    group.obstacleType = 'cockroach';
    group.requiresJump = true; // Low hurdle: Jump over or dodge
    group.boxSize = new THREE.Vector3(1.6, 0.75, 1.8);

    // Oval Body Shell
    const bodyGeo = new THREE.SphereGeometry(0.55, 10, 8);
    bodyGeo.scale(1.2, 0.55, 1.6);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.mats.cockroachShell);
    bodyMesh.position.y = 0.32;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.28, 8, 8);
    headGeo.scale(1.1, 0.7, 0.9);
    const headMesh = new THREE.Mesh(headGeo, this.mats.cockroachShell);
    headMesh.position.set(0, 0.3, 0.85);
    group.add(headMesh);

    // Big Googly Cartoon Eyes
    [-0.15, 0.15].forEach(x => {
      const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const eyeMesh = new THREE.Mesh(eyeGeo, this.mats.cockroachEye);
      eyeMesh.position.set(x, 0.42, 0.95);
      group.add(eyeMesh);

      const pupilGeo = new THREE.SphereGeometry(0.045, 6, 6);
      const pupilMesh = new THREE.Mesh(pupilGeo, this.mats.cockroachPupil);
      pupilMesh.position.set(x, 0.44, 1.03);
      group.add(pupilMesh);
    });

    // Curving Antennae
    [-0.1, 0.1].forEach((x, i) => {
      const antGeo = new THREE.CylinderGeometry(0.015, 0.005, 0.9, 6);
      antGeo.rotateX(Math.PI / 4);
      antGeo.rotateZ((i === 0 ? -1 : 1) * 0.35);
      const antMesh = new THREE.Mesh(antGeo, this.mats.cockroachLeg);
      antMesh.position.set(x, 0.45, 1.15);
      group.add(antMesh);
    });

    // 6 Scurrying Legs
    group.legs = [];
    for (let i = 0; i < 3; i++) {
      [-1, 1].forEach(side => {
        const legPivot = new THREE.Group();
        legPivot.position.set(side * 0.45, 0.25, -0.4 + i * 0.4);

        const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.6, 6);
        legGeo.rotateZ(side * 0.9);
        const legMesh = new THREE.Mesh(legGeo, this.mats.cockroachLeg);
        legMesh.position.set(side * 0.25, -0.1, 0);
        legPivot.add(legMesh);

        group.add(legPivot);
        group.legs.push(legPivot);
      });
    }

    return group;
  }

  createPappuCaricature() {
    const group = new THREE.Group();
    group.obstacleType = 'pappu';
    group.requiresJump = false;
    group.requiresSlide = false; // Tall obstacle: MUST DODGE
    group.boxSize = new THREE.Vector3(1.4, 2.0, 1.4);

    // Torso in pristine white kurta
    const kurtaGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.9, 10);
    const kurtaMesh = new THREE.Mesh(kurtaGeo, this.mats.pappuKurta);
    kurtaMesh.position.y = 0.95;
    kurtaMesh.castShadow = true;
    group.add(kurtaMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    headGeo.scale(1.0, 1.15, 1.0);
    const headMesh = new THREE.Mesh(headGeo, this.mats.pappuSkin);
    headMesh.position.y = 1.55;
    headMesh.castShadow = true;
    group.add(headMesh);

    // Modern cartoon styled hair
    const hairGeo = new THREE.SphereGeometry(0.27, 10, 10);
    const hairMesh = new THREE.Mesh(hairGeo, this.mats.pappuHair);
    hairMesh.position.set(0, 1.65, -0.05);
    group.add(hairMesh);

    // Comical White Kurta Pajama Legs
    [-0.14, 0.14].forEach(x => {
      const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.55, 8);
      const leg = new THREE.Mesh(legGeo, this.mats.pappuKurta);
      leg.position.set(x, 0.28, 0);
      group.add(leg);

      const shoeGeo = new THREE.BoxGeometry(0.13, 0.08, 0.24);
      const shoe = new THREE.Mesh(shoeGeo, this.mats.autoWheel);
      shoe.position.set(x, 0.04, 0.04);
      group.add(shoe);
    });

    // Arms & Funny Golden Microphone / Gadget
    const leftArmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45);
    leftArmGeo.rotateZ(0.6);
    const leftArm = new THREE.Mesh(leftArmGeo, this.mats.pappuKurta);
    leftArm.position.set(-0.35, 1.1, 0);
    group.add(leftArm);

    const rightArmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45);
    rightArmGeo.rotateZ(-0.6);
    rightArmGeo.rotateX(0.5);
    const rightArm = new THREE.Mesh(rightArmGeo, this.mats.pappuKurta);
    rightArm.position.set(0.35, 1.1, 0.15);
    group.add(rightArm);

    // Oversized comical microphone
    const micGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35);
    const mic = new THREE.Mesh(micGeo, this.mats.pappuMic);
    mic.position.set(0.48, 1.25, 0.3);
    group.add(mic);

    const micHeadGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const micHead = new THREE.Mesh(micHeadGeo, this.mats.pappuMic);
    micHead.position.set(0.48, 1.45, 0.3);
    group.add(micHead);

    return group;
  }

  createBarricade() {
    const group = new THREE.Group();
    group.obstacleType = 'barricade';
    group.requiresJump = true; // Low-to-mid hurdle: can jump or dodge
    group.boxSize = new THREE.Vector3(2.2, 1.35, 0.8);

    // Main cross plank (Yellow & Black stripes)
    const plankGeo = new THREE.BoxGeometry(2.1, 0.4, 0.08);
    const plankMesh = new THREE.Mesh(plankGeo, this.mats.barricadeYellow);
    plankMesh.position.y = 0.8;
    plankMesh.castShadow = true;
    group.add(plankMesh);

    // Decorative black hazard stripes
    for (let i = -3; i <= 3; i++) {
      const stripeGeo = new THREE.BoxGeometry(0.12, 0.41, 0.09);
      stripeGeo.rotateZ(0.4);
      const stripeMesh = new THREE.Mesh(stripeGeo, this.mats.barricadeBlack);
      stripeMesh.position.set(i * 0.3, 0.8, 0);
      group.add(stripeMesh);
    }

    // Lower supporting plank
    const lowerGeo = new THREE.BoxGeometry(2.1, 0.25, 0.08);
    const lowerMesh = new THREE.Mesh(lowerGeo, this.mats.barricadeYellow);
    lowerMesh.position.y = 0.35;
    group.add(lowerMesh);

    // Side A-frame legs
    [-0.95, 0.95].forEach(x => {
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8);
      const legL = new THREE.Mesh(legGeo, this.mats.barricadeBlack);
      legL.rotation.z = (x > 0 ? 1 : -1) * 0.15;
      legL.position.set(x, 0.55, 0);
      group.add(legL);

      const footGeo = new THREE.BoxGeometry(0.15, 0.06, 0.7);
      const foot = new THREE.Mesh(footGeo, this.mats.barricadeBlack);
      foot.position.set(x, 0.03, 0);
      group.add(foot);

      // Warning Blinker light on top
      const lightGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12);
      const light = new THREE.Mesh(lightGeo, this.mats.warningLight);
      light.position.set(x, 1.15, 0);
      group.add(light);
    });

    return group;
  }

  createAutoRickshaw() {
    const group = new THREE.Group();
    group.obstacleType = 'autorickshaw';
    group.requiresJump = false;
    group.requiresSlide = false; // Full tall obstacle: MUST DODGE
    group.boxSize = new THREE.Vector3(2.0, 1.9, 2.5);

    // Lower body (Signature Indian Green)
    const bodyGeo = new THREE.BoxGeometry(1.7, 0.7, 2.2);
    const body = new THREE.Mesh(bodyGeo, this.mats.autoGreen);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    // Canopy Roof (Signature Bright Yellow)
    const roofGeo = new THREE.BoxGeometry(1.65, 0.5, 2.1);
    const roof = new THREE.Mesh(roofGeo, this.mats.autoYellow);
    roof.position.y = 1.35;
    roof.castShadow = true;
    group.add(roof);

    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.4, 0.5);
    const windshield = new THREE.Mesh(windshieldGeo, this.mats.autoGlass);
    windshield.position.set(0, 1.1, 1.06);
    windshield.rotation.y = Math.PI;
    group.add(windshield);

    // 3 Wheels
    // Front single wheel
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(wheelGeo, this.mats.autoWheel);
    frontWheel.position.set(0, 0.24, 0.95);
    group.add(frontWheel);

    // Rear two wheels
    [-0.75, 0.75].forEach(x => {
      const rearWheel = new THREE.Mesh(wheelGeo, this.mats.autoWheel);
      rearWheel.position.set(x, 0.24, -0.65);
      group.add(rearWheel);
    });

    // Bright Headlight
    const headlightGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const headlight = new THREE.Mesh(headlightGeo, new THREE.MeshBasicMaterial({ color: 0xfffa65 }));
    headlight.position.set(0, 0.75, 1.12);
    group.add(headlight);

    return group;
  }

  createHangingBanner() {
    const group = new THREE.Group();
    group.obstacleType = 'hanging_banner';
    group.requiresSlide = true; // High obstacle: MUST SLIDE UNDER OR DODGE
    group.requiresJump = false;
    group.boxSize = new THREE.Vector3(2.4, 1.2, 0.6);

    // Elevated Toran banner position (bottom at ~1.3m from ground)
    const bannerGroup = new THREE.Group();
    bannerGroup.position.y = 1.6;
    group.add(bannerGroup);

    // Overhead hanging rope
    const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5);
    ropeGeo.rotateZ(Math.PI / 2);
    const rope = new THREE.Mesh(ropeGeo, this.mats.bannerRope);
    bannerGroup.add(rope);

    // Festive Marigold flower garlands hanging down
    for (let i = -4; i <= 4; i++) {
      const isYellow = (Math.abs(i) % 2 === 0);
      const garlandGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.45, 6);
      const garland = new THREE.Mesh(garlandGeo, isYellow ? this.mats.bannerMarigoldYellow : this.mats.bannerMarigoldOrange);
      garland.position.set(i * 0.26, -0.25, 0);
      bannerGroup.add(garland);

      // Mango leaf accents
      const leafGeo = new THREE.ConeGeometry(0.05, 0.15, 4);
      leafGeo.rotateX(Math.PI);
      const leaf = new THREE.Mesh(leafGeo, this.mats.autoGreen);
      leaf.position.set(i * 0.26, -0.5, 0);
      bannerGroup.add(leaf);
    }

    // Overhead supporting side bamboo posts
    [-1.25, 1.25].forEach(x => {
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8);
      const pole = new THREE.Mesh(poleGeo, this.mats.bannerRope);
      pole.position.set(x, 1.3, 0);
      group.add(pole);
    });

    return group;
  }

  // ========================================================
  // PROCEDURAL PATTERN SPAWNING & OBJECT POOLING
  // ========================================================

  spawnObstacle(type, laneIndex, z) {
    let obstacle = null;

    // Check pool for inactive obstacle of matching type
    const poolIndex = this.pool.findIndex(o => o.obstacleType === type);
    if (poolIndex !== -1) {
      obstacle = this.pool.splice(poolIndex, 1)[0];
    } else {
      // Create new instance
      if (type === 'cockroach') obstacle = this.createCockroach();
      else if (type === 'pappu') obstacle = this.createPappuCaricature();
      else if (type === 'barricade') obstacle = this.createBarricade();
      else if (type === 'autorickshaw') obstacle = this.createAutoRickshaw();
      else if (type === 'hanging_banner') obstacle = this.createHangingBanner();
    }

    if (!obstacle) return null;

    obstacle.laneIndex = laneIndex;
    obstacle.position.set(this.lanes[laneIndex], 0, z);
    obstacle.visible = true;

    this.scene.add(obstacle);
    this.activeObstacles.push(obstacle);
    return obstacle;
  }

  generateNextPattern(playerZ) {
    // Generate intelligent, fair patterns
    const patternZ = this.nextSpawnZ;

    // Random choice of fair obstacle layouts:
    // Pattern 0: Single obstacle in 1 lane (easy)
    // Pattern 1: Double obstacle in 2 lanes (1 clear escape lane)
    // Pattern 2: Jump obstacle (Cockroach or Barricade) + Safe lane
    // Pattern 3: High banner (requires slide) in 1-2 lanes
    // Pattern 4: Alternating zigzag hurdles

    const rand = Math.random();
    const types = ['cockroach', 'pappu', 'barricade', 'autorickshaw', 'hanging_banner'];

    if (rand < 0.35) {
      // 1 lane blocked
      const lane = Math.floor(Math.random() * 3);
      const type = types[Math.floor(Math.random() * types.length)];
      this.spawnObstacle(type, lane, patternZ);
    } else if (rand < 0.7) {
      // 2 lanes blocked, 1 guaranteed free lane
      const freeLane = Math.floor(Math.random() * 3);
      const blockedLanes = [0, 1, 2].filter(l => l !== freeLane);

      blockedLanes.forEach(lane => {
        // Pick friendly mix
        const pickType = (Math.random() < 0.5) ? 'barricade' : (Math.random() < 0.5 ? 'cockroach' : 'pappu');
        this.spawnObstacle(pickType, lane, patternZ);
      });
    } else if (rand < 0.85) {
      // Slide Toran banner in 1 or 2 lanes, allowing player to slide under or dodge
      const lane = Math.floor(Math.random() * 3);
      this.spawnObstacle('hanging_banner', lane, patternZ);
    } else {
      // Tuk-Tuk Auto Rickshaw in 1 lane + Jumpable barricade in another lane
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
      this.spawnObstacle('autorickshaw', lanes[0], patternZ);
      this.spawnObstacle('cockroach', lanes[1], patternZ);
    }

    // Calculate spacing based on player speed
    const currentSpeed = this.gameState.currentSpeed;
    const spacing = this.minSpacing + (currentSpeed / 20) * 8 + Math.random() * 6;
    this.nextSpawnZ -= spacing;
  }

  update(delta, playerZ) {
    // Check if we need to spawn ahead
    while (this.nextSpawnZ > playerZ - this.spawnDistance) {
      this.generateNextPattern(playerZ);
    }

    // Animate active obstacles (e.g. Cockroach scurrying legs)
    const time = performance.now() * 0.005;
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];

      if (obs.obstacleType === 'cockroach' && obs.legs) {
        obs.legs.forEach((leg, idx) => {
          leg.rotation.y = Math.sin(time * 12 + idx * 1.2) * 0.35;
        });
      }

      // Despawn obstacles passed behind player
      if (obs.position.z > playerZ + 15) {
        this.scene.remove(obs);
        this.activeObstacles.splice(i, 1);
        this.pool.push(obs);
      }
    }
  }

  reset() {
    // Remove all active obstacles
    this.activeObstacles.forEach(obs => {
      this.scene.remove(obs);
      this.pool.push(obs);
    });
    this.activeObstacles = [];
    this.nextSpawnZ = -30;
  }
}

