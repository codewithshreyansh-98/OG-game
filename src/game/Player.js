/**
 * Player.js
 * 3D Stylized Indian Cartoon Caricature Player Character ("Namaste Runner")
 * Featuring procedural articulated rig, rich Indian attire (Kurta, Modi Jacket, Mojaris),
 * multi-lane physics, jump, slide, crash reaction, and dynamic power-up auras.
 */

import * as THREE from 'three';

export const OUTFITS = {
  vikas_saffron: {
    id: 'vikas_saffron',
    name: 'Vikas Saffron',
    desc: 'The iconic vibrant saffron kurta with an ivory ceremonial jacket.',
    kurtaColor: 0xff671f,
    jacketColor: 0xf4f0ea,
    pantsColor: 0xffffff,
    accentColor: 0xffd700,
    shoesColor: 0x8b4513
  },
  royal_diplomat: {
    id: 'royal_diplomat',
    name: 'Royal Diplomat',
    desc: 'Distinguished midnight navy Modi vest paired with crisp white silk.',
    kurtaColor: 0xffffff,
    jacketColor: 0x0c2461,
    pantsColor: 0xffffff,
    accentColor: 0xe0e0e0,
    shoesColor: 0x1e272e
  },
  tiranga_pride: {
    id: 'tiranga_pride',
    name: 'Tiranga Pride',
    desc: 'Pure khadi white kurta draped with a saffron and emerald green stole.',
    kurtaColor: 0xfafafa,
    jacketColor: 0xff793f,
    pantsColor: 0x218c74,
    accentColor: 0xffd700,
    shoesColor: 0xd35400
  },
  varanasi_silk: {
    id: 'varanasi_silk',
    name: 'Varanasi Silk',
    desc: 'Royal golden ochre silk kurta adorned with a deep maroon brocade vest.',
    kurtaColor: 0xe1b12c,
    jacketColor: 0x800000,
    pantsColor: 0xfff2cc,
    accentColor: 0xffd700,
    shoesColor: 0x4a154b
  }
};

export class Player {
  constructor(scene, gameState, audioManager) {
    this.scene = scene;
    this.gameState = gameState;
    this.audio = audioManager;

    // Lane definitions
    this.laneWidth = 2.5;
    this.lanes = [-this.laneWidth, 0, this.laneWidth]; // Left (-1), Middle (0), Right (1)
    this.currentLaneIndex = 1; // Start in middle lane
    this.targetX = 0;
    this.currentX = 0;

    // Movement & state flags
    this.isJumping = false;
    this.isSliding = false;
    this.isCrashing = false;
    this.jumpVelocity = 0;
    this.gravity = -48.0;
    this.jumpForce = 15.5;
    this.slideTimer = 0;
    this.slideDuration = 0.8; // seconds

    // Hitbox dimensions
    this.normalHeight = 1.85;
    this.slideHeight = 0.8;
    this.currentHeight = this.normalHeight;
    this.hitboxRadius = 0.55;

    // Animation timers & state
    this.animTime = 0;
    this.currentAnim = 'run'; // 'run', 'jump', 'slide', 'stumble', 'idle'

    // Root 3D Object
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.scene.add(this.group);

    // Current Outfit configuration
    this.currentOutfit = OUTFITS[this.gameState.selectedOutfitId] || OUTFITS.vikas_saffron;

    // Build the 3D Character Rig
    this.buildCharacter();
    this.buildAuras();

    // Listen for outfit changes
    this.gameState.on('outfitChange', (outfitId) => {
      this.setOutfit(outfitId);
    });
  }

  buildCharacter() {
    // Clear any existing character hierarchy
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    // Colors from current outfit
    const { kurtaColor, jacketColor, pantsColor, accentColor, shoesColor } = this.currentOutfit;

    // Common materials
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xe0ac69 }); // Warm Indian skin tone
    this.hairMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee }); // Groomed white/silver hair
    this.kurtaMat = new THREE.MeshLambertMaterial({ color: kurtaColor });
    this.jacketMat = new THREE.MeshLambertMaterial({ color: jacketColor });
    this.pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });
    this.goldMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.85, roughness: 0.25 });
    this.shoesMat = new THREE.MeshLambertMaterial({ color: shoesColor });
    this.glassesMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });

    // Hierarchy Root
    this.rootBone = new THREE.Group();
    this.group.add(this.rootBone);

    // 1. Hips / Pelvis
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.88;
    this.rootBone.add(this.pelvis);

    // 2. Torso & Nehru Jacket
    this.torso = new THREE.Group();
    this.pelvis.add(this.torso);

    // Torso inner kurta mesh
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.65, 12);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.kurtaMat);
    this.torsoMesh.position.y = 0.35;
    this.torsoMesh.castShadow = true;
    this.torso.add(this.torsoMesh);

    // Nehru / Modi Sleeveless Jacket mesh (layered slightly over kurta)
    const jacketGeo = new THREE.CylinderGeometry(0.35, 0.31, 0.62, 12, 1, false, 0, Math.PI * 2);
    this.jacketMesh = new THREE.Mesh(jacketGeo, this.jacketMat);
    this.jacketMesh.position.y = 0.35;
    this.jacketMesh.castShadow = true;
    this.torso.add(this.jacketMesh);

    // Jacket Mandarin Collar
    const collarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12);
    this.collarMesh = new THREE.Mesh(collarGeo, this.jacketMat);
    this.collarMesh.position.y = 0.7;
    this.torso.add(this.collarMesh);

    // Jacket Gold Buttons (3 distinct buttons)
    for (let i = 0; i < 3; i++) {
      const btnGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const btnMesh = new THREE.Mesh(btnGeo, this.goldMat);
      btnMesh.position.set(0, 0.25 + i * 0.14, 0.35);
      this.torso.add(btnMesh);
    }

    // Jacket lower skirt flaps (sways during running)
    this.skirtFlap = new THREE.Group();
    this.skirtFlap.position.y = 0.05;
    const skirtGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.25, 12, 1, true);
    this.skirtMesh = new THREE.Mesh(skirtGeo, this.kurtaMat);
    this.skirtFlap.add(this.skirtMesh);
    this.pelvis.add(this.skirtFlap);

    // 3. Head & Cartoon Caricature Face
    this.head = new THREE.Group();
    this.head.position.y = 0.78;
    this.torso.add(this.head);

    // Stylized head shape (soft cartoon jaw)
    const headGeo = new THREE.SphereGeometry(0.26, 14, 14);
    headGeo.scale(1.0, 1.15, 1.05);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Stylized Groomed White Hair
    const hairGeo = new THREE.SphereGeometry(0.28, 12, 12);
    hairGeo.scale(1.05, 0.95, 1.1);
    const hairMesh = new THREE.Mesh(hairGeo, this.hairMat);
    hairMesh.position.set(0, 0.08, -0.04);
    this.head.add(hairMesh);

    // Styled white side part / hair curl on top
    const hairPartGeo = new THREE.BoxGeometry(0.25, 0.1, 0.32);
    const hairPartMesh = new THREE.Mesh(hairPartGeo, this.hairMat);
    hairPartMesh.position.set(0, 0.26, 0);
    this.head.add(hairPartMesh);

    // Groomed White Beard & Mustache (caricature signature)
    const beardGeo = new THREE.ConeGeometry(0.22, 0.28, 10);
    beardGeo.rotateX(Math.PI);
    const beardMesh = new THREE.Mesh(beardGeo, this.hairMat);
    beardMesh.position.set(0, -0.15, 0.14);
    this.head.add(beardMesh);

    const mustacheGeo = new THREE.BoxGeometry(0.24, 0.07, 0.09);
    const mustacheMesh = new THREE.Mesh(mustacheGeo, this.hairMat);
    mustacheMesh.position.set(0, -0.05, 0.25);
    this.head.add(mustacheMesh);

    // Cartoon Spectacles (Metallic round rimmed glasses)
    const glassFrameGeo = new THREE.TorusGeometry(0.07, 0.015, 8, 16);
    const glassLeft = new THREE.Mesh(glassFrameGeo, this.glassesMat);
    glassLeft.position.set(-0.1, 0.05, 0.25);
    this.head.add(glassLeft);

    const glassRight = new THREE.Mesh(glassFrameGeo, this.glassesMat);
    glassRight.position.set(0.1, 0.05, 0.25);
    this.head.add(glassRight);

    const bridgeGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08);
    bridgeGeo.rotateZ(Math.PI / 2);
    const bridge = new THREE.Mesh(bridgeGeo, this.glassesMat);
    bridge.position.set(0, 0.05, 0.25);
    this.head.add(bridge);

    // 4. Arms & Hands
    // Left Arm
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.38, 0.58, 0);
    this.torso.add(this.leftShoulder);

    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.34, 8);
    armGeo.translate(0, -0.17, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.kurtaMat);
    leftArmMesh.castShadow = true;
    this.leftShoulder.add(leftArmMesh);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.34, 0);
    this.leftShoulder.add(this.leftElbow);

    const forearmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.32, 8);
    forearmGeo.translate(0, -0.16, 0);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, this.skinMat);
    this.leftElbow.add(leftForearmMesh);

    const handGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const leftHandMesh = new THREE.Mesh(handGeo, this.skinMat);
    leftHandMesh.position.set(0, -0.34, 0);
    this.leftElbow.add(leftHandMesh);

    // Right Arm
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.38, 0.58, 0);
    this.torso.add(this.rightShoulder);

    const rightArmMesh = new THREE.Mesh(armGeo, this.kurtaMat);
    rightArmMesh.castShadow = true;
    this.rightShoulder.add(rightArmMesh);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.34, 0);
    this.rightShoulder.add(this.rightElbow);

    const rightForearmMesh = new THREE.Mesh(forearmGeo, this.skinMat);
    this.rightElbow.add(rightForearmMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, this.skinMat);
    rightHandMesh.position.set(0, -0.34, 0);
    this.rightElbow.add(rightHandMesh);

    // 5. Legs & Indian Mojari Shoes
    // Left Leg
    this.leftHip = new THREE.Group();
    this.leftHip.position.set(-0.16, 0, 0);
    this.pelvis.add(this.leftHip);

    const thighGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.44, 8);
    thighGeo.translate(0, -0.22, 0);
    const leftThighMesh = new THREE.Mesh(thighGeo, this.pantsMat);
    leftThighMesh.castShadow = true;
    this.leftHip.add(leftThighMesh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.44, 0);
    this.leftHip.add(this.leftKnee);

    const shinGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.42, 8);
    shinGeo.translate(0, -0.21, 0);
    const leftShinMesh = new THREE.Mesh(shinGeo, this.pantsMat);
    leftShinMesh.castShadow = true;
    this.leftKnee.add(leftShinMesh);

    // Indian Mojari Shoe (curved pointed toe)
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.28);
    shoeGeo.translate(0, -0.05, 0.06);
    const leftShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    leftShoe.position.set(0, -0.42, 0);
    this.leftKnee.add(leftShoe);

    // Right Leg
    this.rightHip = new THREE.Group();
    this.rightHip.position.set(0.16, 0, 0);
    this.pelvis.add(this.rightHip);

    const rightThighMesh = new THREE.Mesh(thighGeo, this.pantsMat);
    rightThighMesh.castShadow = true;
    this.rightHip.add(rightThighMesh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.44, 0);
    this.rightHip.add(this.rightKnee);

    const rightShinMesh = new THREE.Mesh(shinGeo, this.pantsMat);
    rightShinMesh.castShadow = true;
    this.rightKnee.add(rightShinMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    rightShoe.position.set(0, -0.42, 0);
    this.rightKnee.add(rightShoe);

    // 6. Traditional Indian Shoulder Bag (Jhola)
    this.buildJhola();

    // Character Shadow projector plane (procedural soft ground contact shadow)
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(32, 32, 5, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    this.groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.groundShadow.rotation.x = -Math.PI / 2;
    this.groundShadow.position.y = 0.02;
    this.group.add(this.groundShadow);
  }

  buildJhola() {
    this.jholaGroup = new THREE.Group();
    this.torso.add(this.jholaGroup);

    // Jhola Materials
    const jholaFabricMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 }); // Warm earthy khadi cotton
    const jholaStrapMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });  // Sturdy woven strap
    const jholaChakraMat = new THREE.MeshBasicMaterial({ color: 0x06038d });   // Swadeshi blue chakra print
    const jholaAccentMat = new THREE.MeshLambertMaterial({ color: 0xff671f }); // Saffron piping/border

    // 1. Diagonal Shoulder Strap (draped over right shoulder, slung across to left hip)
    // Front strap across chest
    const frontStrapGeo = new THREE.BoxGeometry(0.08, 0.76, 0.03);
    frontStrapGeo.rotateZ(0.62);
    const frontStrap = new THREE.Mesh(frontStrapGeo, jholaStrapMat);
    frontStrap.position.set(0.02, 0.38, 0.36);
    this.jholaGroup.add(frontStrap);

    // Shoulder cushion pad resting on top of right shoulder
    const padGeo = new THREE.BoxGeometry(0.14, 0.05, 0.32);
    const pad = new THREE.Mesh(padGeo, jholaStrapMat);
    pad.position.set(0.38, 0.62, 0);
    this.jholaGroup.add(pad);

    // Back strap across back
    const backStrapGeo = new THREE.BoxGeometry(0.08, 0.76, 0.03);
    backStrapGeo.rotateZ(-0.62);
    const backStrap = new THREE.Mesh(backStrapGeo, jholaStrapMat);
    backStrap.position.set(0.02, 0.38, -0.36);
    this.jholaGroup.add(backStrap);

    // 2. Jhola Pouch Body hanging at left hip
    this.jholaBag = new THREE.Group();
    this.jholaBag.position.set(-0.42, 0.08, 0.05);
    this.jholaGroup.add(this.jholaBag);

    // Main cotton tote bag body
    const bagGeo = new THREE.BoxGeometry(0.24, 0.38, 0.16);
    const bagMesh = new THREE.Mesh(bagGeo, jholaFabricMat);
    bagMesh.position.y = -0.19;
    bagMesh.castShadow = true;
    this.jholaBag.add(bagMesh);

    // Saffron upper folded hem & flap
    const flapGeo = new THREE.BoxGeometry(0.26, 0.1, 0.18);
    const flapMesh = new THREE.Mesh(flapGeo, jholaAccentMat);
    flapMesh.position.y = -0.05;
    this.jholaBag.add(flapMesh);

    // Front pocket
    const pocketGeo = new THREE.BoxGeometry(0.18, 0.18, 0.03);
    const pocketMesh = new THREE.Mesh(pocketGeo, jholaFabricMat);
    pocketMesh.position.set(0, -0.2, 0.09);
    this.jholaBag.add(pocketMesh);

    // Swadeshi / Ashoka Chakra print on front pocket
    const emblemGeo = new THREE.TorusGeometry(0.055, 0.009, 6, 16);
    const emblem = new THREE.Mesh(emblemGeo, jholaChakraMat);
    emblem.position.set(0, -0.2, 0.11);
    this.jholaBag.add(emblem);

    // Hanging corner tassel / knot
    const tasselGeo = new THREE.ConeGeometry(0.035, 0.12, 6);
    const tassel = new THREE.Mesh(tasselGeo, jholaAccentMat);
    tassel.position.set(-0.08, -0.38, 0);
    this.jholaBag.add(tassel);
  }

  buildAuras() {
    // 1. Golden Surakshak Shield Sphere
    const shieldGeo = new THREE.SphereGeometry(1.25, 20, 20);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.0;
    this.group.add(this.shieldMesh);

    // 2. Speed / Chai Trail Particle System
    const particleCount = 40;
    const trailGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cSaffron = new THREE.Color(0xff671f);
    const cWhite = new THREE.Color(0xffffff);
    const cGreen = new THREE.Color(0x046a38);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = Math.random() * 1.5;
      positions[i * 3 + 2] = -Math.random() * 2.0;

      const pickColor = (i % 3 === 0) ? cSaffron : (i % 3 === 1) ? cWhite : cGreen;
      colors[i * 3 + 0] = pickColor.r;
      colors[i * 3 + 1] = pickColor.g;
      colors[i * 3 + 2] = pickColor.b;
    }

    trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    this.trailPoints = new THREE.Points(trailGeo, trailMat);
    this.group.add(this.trailPoints);
  }

  setOutfit(outfitId) {
    if (!OUTFITS[outfitId]) return;
    this.currentOutfit = OUTFITS[outfitId];
    this.buildCharacter();
    this.buildAuras();
  }

  // ========================================================
  // CONTROLS & ACTIONS
  // ========================================================

  moveLeft() {
    if (this.currentLaneIndex > 0 && !this.isCrashing) {
      this.currentLaneIndex--;
      this.targetX = this.lanes[this.currentLaneIndex];
      this.audio.playSlideSound();
    }
  }

  moveRight() {
    if (this.currentLaneIndex < 2 && !this.isCrashing) {
      this.currentLaneIndex++;
      this.targetX = this.lanes[this.currentLaneIndex];
      this.audio.playSlideSound();
    }
  }

  jump() {
    if (!this.isJumping && !this.isCrashing) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpForce;
      this.currentAnim = 'jump';
      this.audio.playJumpSound();

      // If we were sliding, cancel slide immediately
      if (this.isSliding) {
        this.isSliding = false;
        this.slideTimer = 0;
        this.currentHeight = this.normalHeight;
      }
    }
  }

  slide() {
    if (!this.isSliding && !this.isCrashing) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      this.currentAnim = 'slide';
      this.currentHeight = this.slideHeight;
      this.audio.playSlideSound();

      // If in mid-air, fast-fall towards ground
      if (this.isJumping) {
        this.jumpVelocity = -22.0;
      }
    }
  }

  triggerCrash() {
    this.isCrashing = true;
    this.currentAnim = 'stumble';
    this.audio.playCrashSound();
  }

  resetPosition() {
    this.currentLaneIndex = 1;
    this.targetX = 0;
    this.currentX = 0;
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.isJumping = false;
    this.isSliding = false;
    this.isCrashing = false;
    this.jumpVelocity = 0;
    this.slideTimer = 0;
    this.currentHeight = this.normalHeight;
    this.currentAnim = 'run';
    this.animTime = 0;
  }

  // ========================================================
  // UPDATE LOOP & PROCEDURAL RIG ANIMATIONS
  // ========================================================

  update(delta, gameSpeed) {
    this.animTime += delta * (gameSpeed / 12);

    // 1. Smooth Lane Interpolation & Banking Roll
    const lerpSpeed = 16.0;
    this.currentX += (this.targetX - this.currentX) * Math.min(1.0, delta * lerpSpeed);
    this.group.position.x = this.currentX;

    // Subtle banking roll when changing lanes
    const dx = this.targetX - this.currentX;
    this.group.rotation.z = -dx * 0.12;

    // Facing direction:
    // In Menu state, face front (0) for the Namaste greeting.
    // In Playing, Paused, and Game Over states, face forward along the run direction (-Z) via Math.PI!
    if (this.gameState.currentState === 'MENU') {
      this.rootBone.rotation.y = 0;
    } else {
      this.rootBone.rotation.y = Math.PI;
    }

    // 2. Jump Physics
    if (this.isJumping) {
      this.jumpVelocity += this.gravity * delta;
      this.group.position.y += this.jumpVelocity * delta;

      if (this.group.position.y <= 0) {
        this.group.position.y = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
        if (!this.isSliding && !this.isCrashing) {
          this.currentAnim = 'run';
        }
      }
    }

    // 3. Slide Timer & Height
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.currentHeight = this.normalHeight;
        if (!this.isJumping && !this.isCrashing) {
          this.currentAnim = 'run';
        }
      }
    }

    // 4. Update Power-Up Auras
    const hasShield = this.gameState.activePowerUps.has('shield');
    if (this.shieldMesh) {
      this.shieldMesh.material.opacity = hasShield ? 0.65 : 0;
      if (hasShield) {
        this.shieldMesh.rotation.y += delta * 3.5;
        this.shieldMesh.rotation.x += delta * 1.8;
      }
    }

    const hasBoost = this.gameState.activePowerUps.has('chai') || this.gameState.activePowerUps.has('turbo');
    if (this.trailPoints) {
      this.trailPoints.material.opacity = hasBoost ? 0.9 : 0;
      if (hasBoost) {
        const posAttr = this.trailPoints.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          let z = posAttr.getZ(i);
          z += delta * 15;
          if (z > 3.5) z = -0.2;
          posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
      }
    }

    // Ground shadow scale & opacity adjustments
    if (this.groundShadow) {
      const heightFactor = Math.max(0.2, 1.0 - this.group.position.y * 0.25);
      this.groundShadow.scale.set(heightFactor, heightFactor, heightFactor);
      this.groundShadow.material.opacity = Math.max(0.1, 0.6 - this.group.position.y * 0.18);
    }

    // 5. Procedural Rig Animations based on state
    this.animateRig(delta);
  }

  animateRig(delta) {
    if (this.isCrashing) {
      // Comical stumble backwards
      this.pelvis.position.y = 0.6;
      this.torso.rotation.x = -0.5;
      this.torso.rotation.z = Math.sin(this.animTime * 15) * 0.4;
      this.leftShoulder.rotation.x = 2.0;
      this.rightShoulder.rotation.x = 2.0;
      this.leftHip.rotation.x = -0.8;
      this.rightHip.rotation.x = -0.8;
      if (this.jholaBag) this.jholaBag.rotation.x = Math.sin(this.animTime * 15) * 0.4;
      this.group.rotation.y += delta * 8; // Funny spin
      return;
    }

    if (this.isSliding) {
      // Lean back low to slide under banners
      this.pelvis.position.y = 0.35;
      this.torso.rotation.x = -1.1; // Lean torso back
      this.torso.rotation.y = 0.15;
      this.head.rotation.x = 0.8; // Tilt head forward to see road

      this.leftHip.rotation.x = -1.4; // Tuck left leg forward
      this.leftKnee.rotation.x = 1.6;
      this.rightHip.rotation.x = 0.4; // Extend right leg behind
      this.rightKnee.rotation.x = 0.8;

      this.leftShoulder.rotation.x = -1.0;
      this.rightShoulder.rotation.x = 0.8;
      this.skirtFlap.rotation.x = -0.6;
      if (this.jholaBag) {
        this.jholaBag.rotation.x = 0.5;
        this.jholaBag.rotation.z = 0.15;
      }
      return;
    }

    if (this.isJumping) {
      // Dynamic leap pose
      this.pelvis.position.y = 0.95;
      this.torso.rotation.x = 0.1;
      this.head.rotation.x = -0.15;

      // Arms raised high in athletic leap
      this.leftShoulder.rotation.x = -2.2;
      this.leftShoulder.rotation.z = -0.3;
      this.rightShoulder.rotation.x = -2.2;
      this.rightShoulder.rotation.z = 0.3;

      // Tuck knees up
      this.leftHip.rotation.x = -1.2;
      this.leftKnee.rotation.x = 1.4;
      this.rightHip.rotation.x = -0.7;
      this.rightKnee.rotation.x = 1.0;
      this.skirtFlap.rotation.x = 0.4;
      if (this.jholaBag) {
        this.jholaBag.rotation.x = -0.4;
        this.jholaBag.rotation.z = -0.1;
      }
      return;
    }

    if (this.gameState.currentState === 'MENU') {
      // Polite Indian Namaste gesture (hands joined at chest, gentle breathing)
      const t = this.animTime * 1.5;
      this.pelvis.position.y = 0.88 + Math.sin(t) * 0.02;
      this.torso.rotation.x = 0;
      this.torso.rotation.y = 0;
      this.torso.rotation.z = 0;
      this.head.rotation.x = Math.sin(t * 0.8) * 0.05;
      this.head.rotation.y = Math.sin(t * 0.5) * 0.1;

      // Namaste arms position (forearms brought together at chest)
      this.leftShoulder.rotation.set(-0.8, 0.4, 0.6);
      this.leftElbow.rotation.set(-1.4, -0.6, 0);
      this.rightShoulder.rotation.set(-0.8, -0.4, -0.6);
      this.rightElbow.rotation.set(-1.4, 0.6, 0);

      this.leftHip.rotation.set(0, 0, -0.05);
      this.rightHip.rotation.set(0, 0, 0.05);
      this.leftKnee.rotation.x = 0;
      this.rightKnee.rotation.x = 0;
      this.skirtFlap.rotation.x = 0;
      if (this.jholaBag) {
        this.jholaBag.rotation.set(0, 0, 0);
        this.jholaBag.position.y = 0.08;
      }
      return;
    }

    // Default: Running Animation
    const strideFreq = 14.0;
    const stride = Math.sin(this.animTime * strideFreq);
    const cosStride = Math.cos(this.animTime * strideFreq);

    // Subtle up/down body bounce
    this.pelvis.position.y = 0.88 + Math.abs(stride) * 0.1;

    // Torso twist and slight forward lean
    this.torso.rotation.x = 0.22; // Confident forward runner posture
    this.torso.rotation.y = stride * 0.18; // Torso counter-rotates with stride
    this.torso.rotation.z = cosStride * 0.04;

    // Head stays level and focused forward
    this.head.rotation.x = -0.15;
    this.head.rotation.y = -stride * 0.08;

    // Alternating arm swing
    this.leftShoulder.rotation.x = stride * 0.95;
    this.leftElbow.rotation.x = -Math.abs(cosStride) * 0.6 - 0.5;

    this.rightShoulder.rotation.x = -stride * 0.95;
    this.rightElbow.rotation.x = -Math.abs(-cosStride) * 0.6 - 0.5;

    // Alternating leg strides with natural knee flex
    this.leftHip.rotation.x = -stride * 0.9;
    this.leftKnee.rotation.x = Math.max(0, cosStride * 1.1);

    this.rightHip.rotation.x = stride * 0.9;
    this.rightKnee.rotation.x = Math.max(0, -cosStride * 1.1);

    // Dynamic Modi jacket skirt flap swaying behind runner
    this.skirtFlap.rotation.x = -0.3 + Math.sin(this.animTime * strideFreq * 2) * 0.18;

    // Dynamic Jhola shoulder bag sway and bounce on hip
    if (this.jholaBag) {
      this.jholaBag.rotation.x = Math.sin(this.animTime * strideFreq) * 0.22;
      this.jholaBag.rotation.z = Math.cos(this.animTime * strideFreq) * 0.14;
      this.jholaBag.position.y = 0.08 + Math.abs(stride) * 0.04;
    }
  }
}

