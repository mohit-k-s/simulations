/**
 * Main simulation controller that orchestrates all components
 */

import { createCanvas, setupCanvas } from './canvas-utils.js';
import { PhysicsEngine } from './physics-engine.js';
import { ParticleSystem } from './particle-system.js';
import { Renderer } from './renderer.js';

export class Simulation {
    constructor(width = 640, height = 640) {
        this.width = width;
        this.height = height;
        this.isRunning = false;
        this.animationId = null;

        // Initialize components
        this.setupCanvas();
        this.setupBoundary();
        this.setupSystems();
        this.setupControls();
        this.renderer.toggleDebugInfo();

    }

    /**
     * Setup canvas and rendering context
     */
    setupCanvas() {
        // Use existing canvas from HTML
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            // Fallback: create new canvas if not found
            this.canvas = createCanvas(this.width, this.height);
            document.body.appendChild(this.canvas);
        } else {
            // Set up the existing canvas with proper dimensions
            const ratio = Math.ceil(window.devicePixelRatio);
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.canvas.width = this.width * ratio;
            this.canvas.height = this.height * ratio;
        }
        this.ctx = setupCanvas(this.canvas);
    }

    /**
     * Setup boundary circle
     */
    setupBoundary() {
        this.boundaryCircle = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            r: 300
        };
    }

    /**
     * Setup physics and rendering systems
     */
    setupSystems() {
        this.physicsEngine = new PhysicsEngine();
        this.particleSystem = new ParticleSystem();
        this.renderer = new Renderer(this.canvas, this.ctx);
    }

    /**
     * Setup keyboard controls
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'd':
                    this.renderer.toggleDebugInfo();
                    break;
                case 'r':
                    this.reset();
                    break;
                case ' ':
                    this.togglePause();
                    e.preventDefault();
                    break;
                case 'c':
                    this.particleSystem.clear();
                    break;
            }
        });

        // Mouse click to add particles
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.particleSystem.spawnCircles(100, x, y, 50);
        });
    }

    /**
     * Initialize the simulation with default particles
     */
    init(particleCount = 1000) {
        this.particleSystem.circles = []
        this.particleSystem.spawnCircles(
            particleCount,
            this.boundaryCircle.x / 2,
            this.boundaryCircle.y / 2,
            200
        );
    }

    /**
     * Main update loop
     */
    update() {
        if (!this.isRunning) return;

        // Update particles
        this.particleSystem.update(this.boundaryCircle);

        // Process collisions
        this.physicsEngine.processCollisions(this.particleSystem.getCircles(), this.getStats());

        // Render frame
        this.renderer.renderFrame(this.boundaryCircle, this.particleSystem, this.physicsEngine);

        // Continue animation loop
        this.animationId = requestAnimationFrame(() => this.update());
    }

    /**
     * Start the simulation
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.update();
    }

    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Toggle pause/resume
     */
    togglePause() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Reset the simulation
     */
    reset() {
        this.stop();
        this.particleSystem.clear();
        this.init();
        this.start();
    }

    /**
     * Get simulation statistics
     */
    getStats() {
        return {
            particles: this.particleSystem.getStats(),
            performance: this.physicsEngine.getPerformanceStats(),
            isRunning: this.isRunning
        };
    }
}
