/**
 * Varanasi.js
 * Environment Zone 4: Varanasi Ghats & River Ganga.
 * Features sacred stone ghat stairways, floating river diyas with flickering candles,
 * ancient temple Shikharas, hanging brass bells, and spiritual Ganga Aarti twilight.
 */

import * as THREE from 'three';

export class VaranasiEnvironment {
  constructor() {
    this.name = 'VARANASI GHATS';
    this.city = 'Ganga Riverfront, Kashi';
    this.desc = 'The Timeless Spiritual City';
    this.fogColor = 0x4a154b; // Mystical twilight violet/amber
    this.fogNear = 40;
    this.fogFar = 150;
    this.skyColor = 0x2c003e;
    this.groundColor = 0x511d43;

    this.initMaterials();
  }

  initMaterials() {
    this.ghatStoneMat = new THREE.MeshLambertMaterial({ color: 0x8c7b75 });
    this.gangaWaterMat = new THREE.MeshStandardMaterial({
      color: 0x1e3799,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.88
    });
    this.templeStoneMat = new THREE.MeshLambertMaterial({ color: 0xc87d55 }); // Terracotta sandstone
    this.brassMat = new THREE.MeshStandardMaterial({ color: 0xf6b93b, metalness: 0.85, roughness: 0.2 });
    this.marigoldOrangeMat = new THREE.MeshLambertMaterial({ color: 0xe55039 });
    this.candleFlameMat = new THREE.MeshBasicMaterial({ color: 0xfffa65 });
  }

  createSegment(length = 40) {
    const segment = new THREE.Group();
    segment.zoneName = 'Varanasi';

    // 1. Center Ghat Pathway (Ancient stone flagstones)
    const roadWidth = 9.0;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.ghatStoneMat);
    road.receiveShadow = true;
    segment.add(road);

    // Stone pathway curb borders
    [-4.5, 4.5].forEach(x => {
      const curbGeo = new THREE.BoxGeometry(0.35, 0.2, length);
      const curb = new THREE.Mesh(curbGeo, this.templeStoneMat);
      curb.position.set(x, 0.1, 0);
      segment.add(curb);
    });

    // 2. Right Side: Stepped Stone Ghats descending into River Ganga
    const ghatStartX = 4.8;
    for (let step = 0; step < 4; step++) {
      const stepGeo = new THREE.BoxGeometry(1.2, 0.25, length);
      const stepMesh = new THREE.Mesh(stepGeo, this.ghatStoneMat);
      stepMesh.position.set(ghatStartX + step * 1.2, -step * 0.25, 0);
      stepMesh.receiveShadow = true;
      segment.add(stepMesh);
    }

    // Sacred Ganga River Surface
    const waterGeo = new THREE.PlaneGeometry(16.0, length);
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(waterGeo, this.gangaWaterMat);
    water.position.set(16.0, -1.0, 0);
    segment.add(water);

    // Floating Flower Diyas on River Ganga with glowing candle flames
    const diyaCount = 6;
    for (let i = 0; i < diyaCount; i++) {
      const diya = new THREE.Group();
      diya.position.set(11.0 + Math.random() * 8.0, -0.92, -length / 2 + (i * length) / diyaCount);

      // Marigold flower ring
      const ringGeo = new THREE.TorusGeometry(0.25, 0.08, 6, 12);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, this.marigoldOrangeMat);
      diya.add(ring);

      // Clay earthen pot (deepak)
      const cupGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.08, 8);
      const cup = new THREE.Mesh(cupGeo, this.templeStoneMat);
      cup.position.y = 0.04;
      diya.add(cup);

      // Flickering Candle Flame
      const flameGeo = new THREE.ConeGeometry(0.06, 0.18, 6);
      const flame = new THREE.Mesh(flameGeo, this.candleFlameMat);
      flame.position.y = 0.18;
      diya.add(flame);

      segment.add(diya);
    }

    // 3. Left Side: Ancient Heritage Temples with Shikhara Spires
    const templeZ = -length / 4;
    const temple = new THREE.Group();
    temple.position.set(-11.5, 0, templeZ);

    // Temple Mandapa Hall
    const hallGeo = new THREE.BoxGeometry(5.0, 4.5, 6.0);
    const hall = new THREE.Mesh(hallGeo, this.templeStoneMat);
    hall.position.y = 2.25;
    hall.castShadow = true;
    temple.add(hall);

    // Ornate Carved Shikhara Spire
    const spireGeo = new THREE.ConeGeometry(2.6, 9.5, 8);
    const spire = new THREE.Mesh(spireGeo, this.templeStoneMat);
    spire.position.y = 9.0;
    spire.castShadow = true;
    temple.add(spire);

    // Golden Kalash & Amalaka on top of temple
    const amalakaGeo = new THREE.CylinderGeometry(0.9, 1.2, 0.4, 8);
    const amalaka = new THREE.Mesh(amalakaGeo, this.brassMat);
    amalaka.position.y = 13.8;
    temple.add(amalaka);

    const kalashGeo = new THREE.ConeGeometry(0.2, 0.9, 6);
    const kalash = new THREE.Mesh(kalashGeo, this.brassMat);
    kalash.position.y = 14.5;
    temple.add(kalash);

    segment.add(temple);

    // 4. Hanging Brass Temple Bells along the river walkway
    for (let z = -length / 2 + 8; z <= length / 2 - 8; z += 18) {
      const bellArch = new THREE.Group();
      bellArch.position.set(-4.8, 0, z);

      // Wooden Arch Post
      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 6);
      const post = new THREE.Mesh(postGeo, this.ghatStoneMat);
      post.position.y = 1.9;
      bellArch.add(post);

      const crossGeo = new THREE.BoxGeometry(0.8, 0.14, 0.14);
      const cross = new THREE.Mesh(crossGeo, this.ghatStoneMat);
      cross.position.set(0.3, 3.7, 0);
      bellArch.add(cross);

      // Hanging Brass Bell
      const bellGeo = new THREE.CylinderGeometry(0.08, 0.22, 0.35, 10);
      const bell = new THREE.Mesh(bellGeo, this.brassMat);
      bell.position.set(0.5, 3.2, 0);
      bellArch.add(bell);

      segment.add(bellArch);
    }

    return segment;
  }
}

