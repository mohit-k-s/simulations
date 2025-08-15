/**
 * Improved main.js - Modular Physics Simulation
 * 
 * Controls:
 * - D: Toggle debug information
 * - R: Reset simulation
 * - Space: Pause/Resume
 * - C: Clear all particles
 * - Click: Add particles at mouse position
 */

import { Simulation } from './simulation.js';

// Create and initialize the simulation
const simulation = new Simulation(640, 640);

// Initialize with default particles
let currentParticleCount = 10000;
simulation.init(currentParticleCount);

// Start the simulation
simulation.start();

// Setup particle count slider
function setupParticleSlider() {
    const slider = document.getElementById('particleSlider');
    const countDisplay = document.getElementById('particleCount');
    const applyButton = document.getElementById('applyParticles');
    
    if (!slider || !countDisplay || !applyButton) {
        console.warn('Particle slider elements not found');
        return;
    }
    
    // Update display when slider moves
    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const displayValue = value >= 1000 ? `${Math.round(value / 1000)}K` : value;
        countDisplay.textContent = displayValue;
    });
    
    // Apply new particle count when button is clicked
    applyButton.addEventListener('click', () => {
        const newCount = parseInt(slider.value);
        if (newCount !== currentParticleCount) {
            currentParticleCount = newCount;
            simulation.reset();
            simulation.init(currentParticleCount);
            console.log(`Applied ${currentParticleCount} particles`);
        }
    });
}

// Initialize slider after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupParticleSlider);
} else {
    setupParticleSlider();
}

// Optional: Add some console logging for debugging
console.log('Physics simulation started!');
console.log('Controls:');
console.log('  D - Toggle debug info');
console.log('  R - Reset simulation');
console.log('  Space - Pause/Resume');
console.log('  C - Clear particles');
console.log('  Click - Add particles');

// Optional: Expose simulation to global scope for debugging
window.simulation = simulation;
