/**
 * Particle system for managing circles and spawning
 */

import { Circle } from './circle.js';

export class ParticleSystem {
    constructor() {
        this.circles = [];
        this.defaultRadius = 2;
    }

    /**
     * Spawn circles in a circular distribution
     */
    spawnCircles(count, centerX, centerY, spawnRadius = 200, particleRadius = this.defaultRadius) {
        for (let i = 0; i < count; i++) {
            // Pick random angle and distance from center
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * spawnRadius; // sqrt ensures uniform distribution

            // Convert polar to Cartesian coordinates
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            // Random initial velocity
            const vx = (Math.random() - 0.5) * 100;
            const vy = (Math.random() - 0.5) * 100;

            const circle = new Circle(x, y, particleRadius, vx, vy);
            this.circles.push(circle);
        }
    }

    /**
     * Update all circles
     */
    update(boundaryCircle) {
        for (let circle of this.circles) {
            circle.update(boundaryCircle);
            circle.handleBoundaryCollision(boundaryCircle);
        }
    }

    /**
     * Render all circles
     */
    render(ctx) {
        for (let circle of this.circles) {
            circle.render(ctx);
        }
    }

    /**
     * Get all circles
     */
    getCircles() {
        return this.circles;
    }

    /**
     * Clear all circles
     */
    clear() {
        this.circles = [];
    }

    /**
     * Get particle count
     */
    getCount() {
        return this.circles.length;
    }

    /**
     * Get statistics about the particle system
     */
    getStats() {
        let sleeping = 0;
        let awake = 0;
        let totalVelocity = 0;

        for (let circle of this.circles) {
            if (circle.sleeping) {
                sleeping++;
            } else {
                awake++;
                totalVelocity += Math.sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
            }
        }

        return {
            total: this.circles.length,
            sleeping,
            awake,
            averageVelocity: awake > 0 ? totalVelocity / awake : 0
        };
    }
}
