/**
 * Physics engine for collision detection and resolution
 */

import { Circle } from './circle.js';

export class PhysicsEngine {
    constructor(cellSize = 50) {
        this.cellSize = cellSize;
        this.performanceStats = {
            lastCollisionTime: 0,
            averageCollisionTime: 0,
            frameCount: 0
        };
    }

    /**
     * Resolve collision between two circles
     */
    resolveCollision(a, b) {
        // Skip if both are sleeping
        if (a.sleeping && b.sleeping) return;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        const overlap = a.r + b.r - dist;
        if (overlap > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            const dvx = b.vx - a.vx;
            const dvy = b.vy - a.vy;
            const relVel = dvx * nx + dvy * ny;

            // Position correction
            const push = overlap / 2;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;

            // Velocity correction
            if (relVel < 0) {
                const impulse = -(1) * relVel;
                a.vx -= impulse * nx;
                a.vy -= impulse * ny;
                b.vx += impulse * nx;
                b.vy += impulse * ny;

                // Wake them up if they were sleeping
                a.wake();
                b.wake();
            }
        }
    }

    /**
     * Create spatial grid key for optimization
     */
    getCellKey(x, y) {
        return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }

    /**
     * Build spatial grid for collision optimization
     */
    buildSpatialGrid(circles) {
        const grid = {};

        circles.forEach(circle => {
            const key = this.getCellKey(circle.x, circle.y);
            if (!grid[key]) grid[key] = [];
            grid[key].push(circle);
        });

        return grid;
    }

    /**
     * Process collisions using spatial grid optimization
     */
    processCollisions(circles, stats) {
        const start = performance.now();
        const grid = this.buildSpatialGrid(circles);

        // Neighbor cell offsets for collision checking
        const neighborOffsets = [
            [0, 0],   // Same cell
            [1, 0],   // Right
            [0, 1],   // Down
            [1, 1],   // Diagonal down-right
            [-1, 1]   // Diagonal down-left
        ];

        // Check collisions within and between neighboring cells
        for (let key in grid) {
            const [cx, cy] = key.split(",").map(Number);
            const currentCell = grid[key];

            for (let [dx, dy] of neighborOffsets) {
                const neighborKey = `${cx + dx},${cy + dy}`;
                const neighbor = grid[neighborKey];
                if (!neighbor) continue;

                if (neighbor === currentCell) {
                    // Check collisions within the same cell
                    for (let i = 0; i < currentCell.length; i++) {
                        for (let j = i + 1; j < currentCell.length; j++) {
                            this.resolveCollision(currentCell[i], currentCell[j]);
                        }
                    }
                } else {
                    // Check collisions between different cells
                    for (let a of currentCell) {
                        for (let b of neighbor) {
                            this.resolveCollision(a, b);
                        }
                    }
                }
            }
        }

        const end = performance.now();
        this.updatePerformanceStats(end - start, stats.awake);
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats(collisionTime, awakeParticles) {
        if (awakeParticles > 0) {
            this.performanceStats.lastCollisionTime = collisionTime;
            this.performanceStats.frameCount++;

            // Calculate running average
            const alpha = 0.1; // Smoothing factor
            this.performanceStats.averageCollisionTime =
                this.performanceStats.averageCollisionTime * (1 - alpha) +
                collisionTime * alpha;
        }


    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            fps: this.performanceStats.frameCount > 0 ?
                1000 / this.performanceStats.averageCollisionTime : 0
        };
    }
}
