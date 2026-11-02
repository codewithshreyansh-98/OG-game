/**
 * RedFort.js
 * Environment Zone 2: Red Fort (Lal Qila), Old Delhi.
 * Features massive red sandstone ramparts, Mughal battlements, Chhatris (domed pavilions),
 * torchlights, and grand arched fort gateways.
 */

import * as THREE from 'three';

export class RedFortEnvironment {
  constructor() {
    this.name = 'RED FORT';
    this.city = 'Old Delhi';
    this.desc = 'Historic Mughal Red Sandstone Bastion';
    this.fogColor = 0xffa07a; // Warm terracotta peach
    this.fogNear = 40;
    this.fogFar = 150;
    this.skyColor = 0xe66767;
    this.groundColor = 0x8b3a2b;

    this.initMaterials();
  }

  initMaterials() {
    this.sandstoneRoadMat = new THREE.MeshLambertMaterial({ color: 0x9b4b38 });
    this.redWallMat = new THREE.MeshLambertMaterial({ color: 0xaa3926 });
    this.darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x6e2617 });
    this.goldDomeMat = new THREE.MeshStandardMaterial({ color: 0xffb142, metalness: 0.7, roughness: 0.3 });
    this.torchFlameMat = new THREE.MeshBasicMaterial({ color: 0xff5252 });
  }

  createSegment(length = 40) {
    const segment = new THREE.Group();
    segment.zoneName = 'RedFort';

    // 1. Center Sandstone Road
    const roadWidth = 9.0;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.sandstoneRoadMat);
    road.receiveShadow = true;
    segment.add(road);

    // Stone pathway curb borders
    [-4.5, 4.5].forEach(x => {
      const curbGeo = new THREE.BoxGeometry(0.4, 0.25, length);
      const curb = new THREE.Mesh(curbGeo, this.darkStoneMat);
      curb.position.set(x, 0.12, 0);
      segment.add(curb);
    });

    // 2. Massive Red Sandstone Rampart Walls
    [-9.5, 9.5].forEach(x => {
      const wallHeight = 8.5;
      const wallGeo = new THREE.BoxGeometry(1.8, wallHeight, length);
      const wall = new THREE.Mesh(wallGeo, this.redWallMat);
      wall.position.set(x, wallHeight / 2, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      segment.add(wall);

      // Mughal Crenellations / Battlements along top of walls
      const count = Math.floor(length / 2.5);
      for (let i = 0; i < count; i++) {
        const merlonGeo = new THREE.BoxGeometry(1.9, 0.8, 1.2);
        const merlon = new THREE.Mesh(merlonGeo, this.darkStoneMat);
        merlon.position.set(x, wallHeight + 0.4, -length / 2 + 1.25 + i * 2.5);
        segment.add(merlon);
      }
    });

    // 3. Octagonal Chhatris (Domed Mughal Pavilions) perched along the ramparts
    [-9.5, 9.5].forEach((x, idx) => {
      const chhatri = new THREE.Group();
      chhatri.position.set(x, 8.5, (idx === 0 ? -length / 3 : length / 3));

      // 4 Stone Pillars
      [-0.8, 0.8].forEach(px => {
        [-0.8, 0.8].forEach(pz => {
          const pilGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.8, 8);
          const pillar = new THREE.Mesh(pilGeo, this.darkStoneMat);
          pillar.position.set(px, 1.4, pz);
          chhatri.add(pillar);
        });
      });

      // Octagonal Chhatri Roof & Golden Onion Dome
      const domeGeo = new THREE.SphereGeometry(1.3, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      const dome = new THREE.Mesh(domeGeo, this.goldDomeMat);
      dome.position.y = 2.8;
      chhatri.add(dome);

      // Finial Spire
      const finialGeo = new THREE.ConeGeometry(0.1, 1.0, 6);
      const finial = new THREE.Mesh(finialGeo, this.goldDomeMat);
      finial.position.y = 4.3;
      chhatri.add(finial);

      segment.add(chhatri);
    });

    // 4. Brass Torch Sconces with glowing flames
    for (let z = -length / 2 + 8; z <= length / 2 - 8; z += 16) {
      [-8.5, 8.5].forEach(x => {
        const torch = new THREE.Group();
        torch.position.set(x + (x > 0 ? -0.8 : 0.8), 2.8, z);

        const sconceGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.4);
        const sconce = new THREE.Mesh(sconceGeo, this.darkStoneMat);
        torch.add(sconce);

        const flameGeo = new THREE.ConeGeometry(0.12, 0.35, 6);
        const flame = new THREE.Mesh(flameGeo, this.torchFlameMat);
        flame.position.y = 0.25;
        torch.add(flame);

        segment.add(torch);
      });
    }

    return segment;
  }
}

