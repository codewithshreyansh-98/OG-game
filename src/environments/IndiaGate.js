/**
 * IndiaGate.js
 * Environment Zone 3: India Gate & Kartavya Path, New Delhi.
 * Features grand boulevard, heritage Delhi streetlamps, sandstone bollards,
 * manicured lawns, and the towering India Gate triumphal arch under twilight.
 */

import * as THREE from 'three';

export class IndiaGateEnvironment {
  constructor() {
    this.name = 'INDIA GATE';
    this.city = 'Kartavya Path, New Delhi';
    this.desc = 'Ceremonial Boulevard of the Capital';
    this.fogColor = 0x2c3a47; // Delhi twilight deep blue-grey
    this.fogNear = 45;
    this.fogFar = 160;
    this.skyColor = 0x182c61;
    this.groundColor = 0x1e3799;

    this.initMaterials();
  }

  initMaterials() {
    this.roadMat = new THREE.MeshLambertMaterial({ color: 0x2d3436 });
    this.roadMarkingMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
    this.sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xb2bec3 });
    this.lawnMat = new THREE.MeshLambertMaterial({ color: 0x2e86de }); // Stylized evening lawn
    this.stoneMat = new THREE.MeshLambertMaterial({ color: 0xdfe6e9 });
    this.sandstoneRedMat = new THREE.MeshLambertMaterial({ color: 0xd35400 });
    this.lampPostMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.8, roughness: 0.3 });
    this.lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfffa65 });
  }

  createSegment(length = 40) {
    const segment = new THREE.Group();
    segment.zoneName = 'IndiaGate';

    // 1. Center Boulevard (Asphalt with golden lane stripes)
    const roadWidth = 9.0;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.roadMat);
    road.receiveShadow = true;
    segment.add(road);

    // Golden dashed lane stripes
    for (let z = -length / 2 + 2; z <= length / 2 - 2; z += 5) {
      [-1.25, 1.25].forEach(x => {
        const stripeGeo = new THREE.PlaneGeometry(0.18, 2.5);
        stripeGeo.rotateX(-Math.PI / 2);
        const stripe = new THREE.Mesh(stripeGeo, this.roadMarkingMat);
        stripe.position.set(x, 0.01, z);
        segment.add(stripe);
      });
    }

    // 2. Sandstone Curbs & Sidewalks
    [-5.2, 5.2].forEach(x => {
      const walkGeo = new THREE.BoxGeometry(1.6, 0.18, length);
      const walk = new THREE.Mesh(walkGeo, this.sidewalkMat);
      walk.position.set(x, 0.09, 0);
      walk.receiveShadow = true;
      segment.add(walk);

      // Sandstone Bollards along curbs
      for (let z = -length / 2 + 4; z <= length / 2 - 4; z += 8) {
        const bollardGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.65, 8);
        const bollard = new THREE.Mesh(bollardGeo, this.sandstoneRedMat);
        bollard.position.set(x + (x > 0 ? -0.5 : 0.5), 0.4, z);
        bollard.castShadow = true;
        segment.add(bollard);
      }
    });

    // 3. Sprawling Lawns beyond sidewalks
    [-12.0, 12.0].forEach(x => {
      const lawnGeo = new THREE.PlaneGeometry(12.0, length);
      lawnGeo.rotateX(-Math.PI / 2);
      const lawn = new THREE.Mesh(lawnGeo, this.lawnMat);
      lawn.position.set(x, 0.05, 0);
      segment.add(lawn);
    });

    // 4. Heritage Delhi Cast-Iron Lampposts with warm glowing globes
    const lampSpacing = 16;
    for (let z = -length / 2 + 6; z <= length / 2 - 6; z += lampSpacing) {
      [-5.8, 5.8].forEach(x => {
        const lamp = new THREE.Group();
        lamp.position.set(x, 0, z);

        // Ornate pole
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8);
        const pole = new THREE.Mesh(poleGeo, this.lampPostMat);
        pole.position.y = 2.1;
        pole.castShadow = true;
        lamp.add(pole);

        // Victorian arm bracket
        const armGeo = new THREE.BoxGeometry(0.4, 0.08, 0.08);
        const arm = new THREE.Mesh(armGeo, this.lampPostMat);
        arm.position.set((x > 0 ? -0.2 : 0.2), 4.1, 0);
        lamp.add(arm);

        // Glowing Lantern Globe
        const globeGeo = new THREE.SphereGeometry(0.22, 10, 10);
        const globe = new THREE.Mesh(globeGeo, this.lampGlowMat);
        globe.position.set((x > 0 ? -0.4 : 0.4), 3.9, 0);
        lamp.add(globe);

        segment.add(lamp);
      });
    }

    // 5. Grand India Gate Stone Arch Landmark flanking the avenue
    [-15.0, 15.0].forEach((x, i) => {
      const arch = new THREE.Group();
      arch.position.set(x, 0, (i === 0 ? -length / 4 : length / 4));

      // Massive Arch Pillars
      [-2.0, 2.0].forEach(pz => {
        const pGeo = new THREE.BoxGeometry(2.5, 12.0, 1.8);
        const pMesh = new THREE.Mesh(pGeo, this.sandstoneRedMat);
        pMesh.position.set(0, 6.0, pz);
        pMesh.castShadow = true;
        arch.add(pMesh);
      });

      // Arch Lintel Top Beam
      const lintelGeo = new THREE.BoxGeometry(2.8, 4.0, 6.5);
      const lintel = new THREE.Mesh(lintelGeo, this.sandstoneRedMat);
      lintel.position.set(0, 13.5, 0);
      lintel.castShadow = true;
      arch.add(lintel);

      // Cornice & Inscription frieze
      const friezeGeo = new THREE.BoxGeometry(3.0, 1.5, 6.8);
      const frieze = new THREE.Mesh(friezeGeo, this.stoneMat);
      frieze.position.set(0, 16.0, 0);
      arch.add(frieze);

      segment.add(arch);
    });

    return segment;
  }
}

