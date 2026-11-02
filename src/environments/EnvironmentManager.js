/**
 * EnvironmentManager.js
 * Manages procedural endless track segments, seamless recycling,
 * environment progression between the 4 iconic Indian monuments,
 * dynamic atmospheric sky & fog transitions, and landmark banners.
 */

import * as THREE from 'three';
import { TajMahalEnvironment } from './TajMahal.js';
import { RedFortEnvironment } from './RedFort.js';
import { IndiaGateEnvironment } from './IndiaGate.js';
import { VaranasiEnvironment } from './Varanasi.js';

export class EnvironmentManager {
  constructor(scene, gameState, audioManager) {
    this.scene = scene;
    this.gameState = gameState;
    this.audio = audioManager;

    // The 4 Indian Environments in sequence
    this.environments = [
      new TajMahalEnvironment(),
      new RedFortEnvironment(),
      new IndiaGateEnvironment(),
      new VaranasiEnvironment()
    ];

    this.currentEnvIndex = 0;
    this.currentEnv = this.environments[0];
    this.zoneDistanceInterval = 750; // Each zone lasts 750 meters

    // Segment parameters
    this.segmentLength = 40.0;
    this.numSegments = 6; // 240 meters visible ahead
    this.segments = [];
    this.nextSpawnZ = 0;

    // References to UI banner elements
    this.zonePillName = document.getElementById('hud-zone-name');
    this.banner = document.getElementById('zone-banner');
    this.bannerTitle = document.getElementById('zone-banner-title');
    this.bannerDesc = document.getElementById('zone-banner-desc');

    // Initialize initial track
    this.initTrack();
  }

  initTrack() {
    this.segments = [];
    this.nextSpawnZ = 20; // Start slightly behind player so road extends backwards

    for (let i = 0; i < this.numSegments; i++) {
      this.spawnSegment();
    }
  }

  spawnSegment() {
    // Determine which zone we should spawn based on current run distance
    const totalDist = this.gameState.distance + Math.abs(this.nextSpawnZ);
    const envIdx = Math.floor(totalDist / this.zoneDistanceInterval) % this.environments.length;
    const targetEnv = this.environments[envIdx];

    const segment = targetEnv.createSegment(this.segmentLength);
    segment.position.z = this.nextSpawnZ - this.segmentLength / 2;
    segment.envIndex = envIdx;

    this.scene.add(segment);
    this.segments.push(segment);

    this.nextSpawnZ -= this.segmentLength;
  }

  checkZoneTransition(playerDistance) {
    const newEnvIndex = Math.floor(playerDistance / this.zoneDistanceInterval) % this.environments.length;
    if (newEnvIndex !== this.currentEnvIndex) {
      this.currentEnvIndex = newEnvIndex;
      this.currentEnv = this.environments[this.currentEnvIndex];
      this.gameState.currentZoneIndex = this.currentEnvIndex;

      // Play zone fanfare & update UI banner
      this.audio.playZoneChangeSound();
      this.showZoneBanner(this.currentEnv);
    }
  }

  showZoneBanner(env) {
    if (this.zonePillName) {
      this.zonePillName.textContent = env.name;
    }

    if (this.banner && this.bannerTitle && this.bannerDesc) {
      this.bannerTitle.textContent = env.name;
      this.bannerDesc.textContent = `${env.city} • ${env.desc}`;
      this.banner.classList.add('active');

      setTimeout(() => {
        if (this.banner) this.banner.classList.remove('active');
      }, 3500);
    }
  }

  update(delta, playerZ, playerDistance) {
    // Check for zone progression
    this.checkZoneTransition(playerDistance);

    // Smoothly interpolate Fog and Sky color to match current environment
    if (this.scene.fog) {
      const targetFogColor = new THREE.Color(this.currentEnv.fogColor);
      this.scene.fog.color.lerp(targetFogColor, delta * 1.5);
      this.scene.fog.near += (this.currentEnv.fogNear - this.scene.fog.near) * delta * 1.5;
      this.scene.fog.far += (this.currentEnv.fogFar - this.scene.fog.far) * delta * 1.5;

      if (this.scene.background) {
        const targetSkyColor = new THREE.Color(this.currentEnv.skyColor);
        this.scene.background.lerp(targetSkyColor, delta * 1.5);
      }
    }

    // Recycle segments that have passed behind the camera
    const firstSegment = this.segments[0];
    if (firstSegment && firstSegment.position.z - this.segmentLength / 2 > playerZ + 25) {
      this.scene.remove(firstSegment);
      this.segments.shift();

      // Spawn next segment ahead
      this.spawnSegment();
    }
  }

  reset() {
    this.segments.forEach(seg => this.scene.remove(seg));
    this.segments = [];
    this.currentEnvIndex = 0;
    this.currentEnv = this.environments[0];
    this.initTrack();
    if (this.zonePillName) this.zonePillName.textContent = this.currentEnv.name;
  }
}

