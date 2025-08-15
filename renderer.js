/**
 * Rendering system for the physics simulation
 */

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.showDebugInfo = false;
        this.debugInfo = {};
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render the boundary circle
     */
    renderBoundary(boundaryCircle) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(boundaryCircle.x, boundaryCircle.y, boundaryCircle.r, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Render debug information
     */
    renderDebugInfo(stats, performanceStats) {
        if (!this.showDebugInfo) return;

        // Get memory information
        const memoryInfo = this.getMemoryInfo();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 280, 150);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        
        const lines = [
            `Particles: ${stats.total}`,
            `Sleeping: ${stats.sleeping}`,
            `Awake: ${stats.awake}`,
            `Avg Velocity: ${stats.averageVelocity.toFixed(2)}`,
            `Collision Time: ${performanceStats.lastCollisionTime.toFixed(2)}ms`,
            `Avg Collision: ${performanceStats.averageCollisionTime.toFixed(2)}ms`,
            `Frame: ${performanceStats.frameCount}`,
            `Memory Used: ${memoryInfo.used}`,
            `Memory Total: ${memoryInfo.total}`
        ];

        lines.forEach((line, index) => {
            this.ctx.fillText(line, 15, 25 + index * 15);
        });
    }

    /**
     * Get memory usage information
     */
    getMemoryInfo() {
        if (performance.memory) {
            // Chrome/Edge specific memory API
            const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
            const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
            return {
                used: `${used} MB`,
                total: `${total} MB`
            };
        } else {
            // Fallback for browsers without memory API
            return {
                used: 'N/A',
                total: 'N/A'
            };
        }
    }

    /**
     * Toggle debug information display
     */
    toggleDebugInfo() {
        this.showDebugInfo = !this.showDebugInfo;
    }

    /**
     * Set background color
     */
    setBackground(color = '#f0f0f0') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render a complete frame
     */
    renderFrame(boundaryCircle, particleSystem, physicsEngine) {
        this.clear();
        this.renderBoundary(boundaryCircle);
        particleSystem.render(this.ctx);
        
        if (this.showDebugInfo) {
            const stats = particleSystem.getStats();
            const performanceStats = physicsEngine.getPerformanceStats();
            this.renderDebugInfo(stats, performanceStats);
        }
    }
}
