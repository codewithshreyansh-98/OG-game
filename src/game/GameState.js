/**
 * GameState.js
 * Central state container and event dispatcher for OGRun.
 */

export const STATES = {
  LOADING: 'LOADING',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export class GameState {
  constructor() {
    this.currentState = STATES.LOADING;
    
    // Gameplay metrics
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.multiplier = 1;
    this.currentZoneIndex = 0;
    
    // Speed settings (starts at 18 m/s, scales up to 38 m/s)
    this.baseSpeed = 19.0;
    this.currentSpeed = this.baseSpeed;
    this.maxSpeed = 38.0;
    this.speedAcceleration = 0.15; // Speed increase per 100 meters
    
    // Persisted data
    this.highScore = parseInt(localStorage.getItem('ogrun_high_score') || '0', 10);
    this.totalCoins = parseInt(localStorage.getItem('ogrun_total_coins') || '0', 10);
    this.soundEnabled = localStorage.getItem('ogrun_sound_enabled') !== 'false';
    this.shadowsEnabled = localStorage.getItem('ogrun_shadows_enabled') !== 'false';
    this.touchButtonsEnabled = localStorage.getItem('ogrun_touch_buttons') === 'true';
    this.selectedOutfitId = localStorage.getItem('ogrun_outfit') || 'vikas_saffron';

    // Active power-ups: { id: { type, duration, remaining, icon, name } }
    this.activePowerUps = new Map();
    
    // Listeners for state changes
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error(`Error in event listener for ${event}:`, e); }
      });
    }
  }

  setState(newState) {
    if (this.currentState === newState) return;
    const oldState = this.currentState;
    this.currentState = newState;
    this.emit('stateChange', { oldState, newState });
  }

  resetRun() {
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.multiplier = 1;
    this.currentZoneIndex = 0;
    this.currentSpeed = this.baseSpeed;
    this.activePowerUps.clear();
    this.emit('runReset', null);
  }

  addDistance(dist) {
    this.distance += dist;
    
    // Speed progression: accelerates gradually with distance
    const targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + (this.distance / 100) * this.speedAcceleration);
    // If turbo/chai boost active, speed is further multiplied
    let finalSpeed = targetSpeed;
    if (this.activePowerUps.has('chai') || this.activePowerUps.has('turbo')) {
      finalSpeed *= 1.35;
    }
    this.currentSpeed = finalSpeed;

    // Recalculate score
    this.score = Math.floor(this.distance * 2 * this.multiplier + this.coins * 50);

    this.emit('scoreUpdate', {
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      multiplier: this.multiplier,
      speed: Math.round((this.currentSpeed / this.baseSpeed) * 100)
    });
  }

  addCoins(amount = 1) {
    let earned = amount;
    if (this.activePowerUps.has('chai') || this.activePowerUps.has('turbo')) {
      earned *= 2; // Double coins in frenzy mode
    }
    this.coins += earned;
    this.totalCoins += earned;
    localStorage.setItem('ogrun_total_coins', this.totalCoins.toString());
    
    // Recalculate score
    this.score = Math.floor(this.distance * 2 * this.multiplier + this.coins * 50);
    this.emit('coinCollected', { coins: this.coins, earned });
  }

  saveHighScore() {
    const isNew = this.score > this.highScore;
    if (isNew) {
      this.highScore = this.score;
      localStorage.setItem('ogrun_high_score', this.highScore.toString());
    }
    return { isNew, highScore: this.highScore, score: this.score };
  }

  setSoundEnabled(val) {
    this.soundEnabled = val;
    localStorage.setItem('ogrun_sound_enabled', val.toString());
    this.emit('settingChange', { setting: 'sound', value: val });
  }

  setShadowsEnabled(val) {
    this.shadowsEnabled = val;
    localStorage.setItem('ogrun_shadows_enabled', val.toString());
    this.emit('settingChange', { setting: 'shadows', value: val });
  }

  setTouchButtonsEnabled(val) {
    this.touchButtonsEnabled = val;
    localStorage.setItem('ogrun_touch_buttons', val.toString());
    this.emit('settingChange', { setting: 'touchButtons', value: val });
  }

  setSelectedOutfit(outfitId) {
    this.selectedOutfitId = outfitId;
    localStorage.setItem('ogrun_outfit', outfitId);
    this.emit('outfitChange', outfitId);
  }
}

