/**
 * TajMahal.js
 * Environment Zone 1: The Iconic Taj Mahal, Agra.
 * Features Makrana marble pathways, turquoise reflecting pools, Cypress trees,
 * minarets, and grand Mughal architecture under a serene golden sunrise.
 */

import * as THREE from 'three';

export class TajMahalEnvironment {
  constructor() {
    this.name = 'TAJ MAHAL';
    this.city = 'Agra, Uttar Pradesh';
    this.desc = 'Jewel of Mughal Architecture';
    this.fogColor = 0xfff3e0;
    this.fogNear = 45;
    this.fogFar = 160;
    this.skyColor = 0xfce4ec;
    this.groundColor = 0x2e7d32;

    this.initMaterials();
  }

  initMaterials() {
    this.marbleRoadMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });
    this.marbleTileMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    this.poolWaterMat = new THREE.MeshStandardMaterial({
      color: 0x00a8ff,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    this.cypressMat = new THREE.MeshLambertMaterial({ color: 0x1b4d3e });
    this.trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18 });
    this.minaretMat = new THREE.MeshLambertMaterial({ color: 0xf5f6fa });
    this.jaliMat = new THREE.MeshLambertMaterial({ color: 0xdcdde1 });
    this.goldPinnacleMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
  }

  createSegment(length = 40) {
    const segment = new THREE.Group();
    segment.zoneName = 'TajMahal';

    // 1. Center 3-Lane Marble Road
    const roadWidth = 9.0;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.marbleRoadMat);
    road.receiveShadow = true;
    segment.add(road);

    // Decorative Marble Inlay Track Borders
    [-4.5, 4.5].forEach(x => {
      const borderGeo = new THREE.BoxGeometry(0.35, 0.15, length);
      const border = new THREE.Mesh(borderGeo, this.jaliMat);
      border.position.set(x, 0.08, 0);
      border.receiveShadow = true;
      segment.add(border);
    });

    // Subtle lane divider lines (carved marble strips)
    [-1.25, 1.25].forEach(x => {
      const lineGeo = new THREE.PlaneGeometry(0.08, length);
      lineGeo.rotateX(-Math.PI / 2);
      const line = new THREE.Mesh(lineGeo, this.marbleTileMat);
      line.position.set(x, 0.01, 0);
      segment.add(line);
    });

    // 2. Turquoise Reflecting Pools flanking the pathway
    [-8.5, 8.5].forEach(x => {
      // Water pool
      const poolGeo = new THREE.PlaneGeometry(4.5, length);
      poolGeo.rotateX(-Math.PI / 2);
      const pool = new THREE.Mesh(poolGeo, this.poolWaterMat);
      pool.position.set(x, -0.05, 0);
      segment.add(pool);

      // Marble pool coping edge
      const edgeGeo = new THREE.BoxGeometry(0.3, 0.2, length);
      const edgeInner = new THREE.Mesh(edgeGeo, this.jaliMat);
      edgeInner.position.set(x - (x > 0 ? 2.3 : -2.3), 0.05, 0);
      segment.add(edgeInner);

      const edgeOuter = new THREE.Mesh(edgeGeo, this.jaliMat);
      edgeOuter.position.set(x + (x > 0 ? 2.3 : -2.3), 0.05, 0);
      segment.add(edgeOuter);
    });

    // 3. Iconic Mughal Cypress Trees along the walkways
    const treeSpacing = 10;
    for (let z = -length / 2 + 5; z <= length / 2 - 5; z += treeSpacing) {
      [-5.8, 5.8].forEach(x => {
        const tree = new THREE.Group();
        tree.position.set(x, 0, z);

        // Slender conical foliage
        const foliageGeo = new THREE.ConeGeometry(0.7, 4.2, 8);
        const foliage = new THREE.Mesh(foliageGeo, this.cypressMat);
        foliage.position.y = 2.4;
        foliage.castShadow = true;
        tree.add(foliage);

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 6);
        const trunk = new THREE.Mesh(trunkGeo, this.trunkMat);
        trunk.position.y = 0.4;
        tree.add(trunk);

        segment.add(tree);
      });
    }

    // 4. White Marble Minarets (Architectural Landmark towers)
    [-13.5, 13.5].forEach((x, i) => {
      const minaret = new THREE.Group();
      minaret.position.set(x, 0, (i === 0 ? -length / 4 : length / 4));

      // Tower base
      const baseGeo = new THREE.BoxGeometry(2.4, 1.2, 2.4);
      const base = new THREE.Mesh(baseGeo, this.minaretMat);
      base.position.y = 0.6;
      minaret.add(base);

      // Tapering Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.75, 0.95, 16.0, 12);
      const shaft = new THREE.Mesh(shaftGeo, this.minaretMat);
      shaft.position.y = 9.2;
      shaft.castShadow = true;
      minaret.add(shaft);

      // Balcony Rings
      [6.0, 11.5, 15.0].forEach(y => {
        const balcGeo = new THREE.CylinderGeometry(1.15, 0.8, 0.45, 12);
        const balc = new THREE.Mesh(balcGeo, this.jaliMat);
        balc.position.y = y;
        minaret.add(balc);
      });

      // Top Chhatri Dome with Golden Kalash/Pinnacle
      const domeGeo = new THREE.SphereGeometry(0.9, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const dome = new THREE.Mesh(domeGeo, this.minaretMat);
      dome.position.y = 17.2;
      minaret.add(dome);

      const finialGeo = new THREE.ConeGeometry(0.12, 1.2, 6);
      const finial = new THREE.Mesh(finialGeo, this.goldPinnacleMat);
      finial.position.y = 18.6;
      minaret.add(finial);

      segment.add(minaret);
    });

    return segment;
  }
}

