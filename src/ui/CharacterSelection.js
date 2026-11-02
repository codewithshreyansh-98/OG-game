/**
 * CharacterSelection.js
 * Wardrobe and outfit selection interface.
 */

import { OUTFITS } from '../game/Player.js';

export class CharacterSelection {
  constructor(gameState, audioManager) {
    this.gameState = gameState;
    this.audio = audioManager;
    this.container = document.getElementById('outfits-container');

    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    Object.values(OUTFITS).forEach(outfit => {
      const card = document.createElement('div');
      const isSelected = (this.gameState.selectedOutfitId === outfit.id);
      card.className = `outfit-card ${isSelected ? 'selected' : ''}`;
      card.id = `outfit-card-${outfit.id}`;

      // Convert hex color to CSS
      const colorHex = '#' + outfit.kurtaColor.toString(16).padStart(6, '0');
      const jacketHex = '#' + outfit.jacketColor.toString(16).padStart(6, '0');

      card.innerHTML = `
        <div class="outfit-color-preview" style="background: linear-gradient(135deg, ${colorHex} 50%, ${jacketHex} 50%);"></div>
        <h4 class="outfit-title">${outfit.name}</h4>
        <p class="outfit-desc">${outfit.desc}</p>
        <button class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'} outfit-btn">
          ${isSelected ? 'EQUIPPED' : 'WEAR LOOK'}
        </button>
      `;

      card.addEventListener('click', () => {
        this.selectOutfit(outfit.id);
      });

      this.container.appendChild(card);
    });
  }

  selectOutfit(outfitId) {
    this.gameState.setSelectedOutfit(outfitId);
    this.audio.playButtonClick();

    // Update UI active card states
    const cards = this.container.querySelectorAll('.outfit-card');
    cards.forEach(card => card.classList.remove('selected'));

    const selectedCard = document.getElementById(`outfit-card-${outfitId}`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }

    // Update button labels
    this.render();
  }
}

