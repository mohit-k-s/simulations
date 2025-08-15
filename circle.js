/**
 * Circle class and physics constants
 */

export const PHYSICS_CONSTANTS = {
    GRAVITY: 0.2,
    DAMPING: 0.98,
    SLEEP_VELOCITY_THRESHOLD: 1.0,
    SLEEP_TIME_THRESHOLD: 30,
    SLEEP_THRESHOLD: 0.8,
    BOUNCE_THRESHOLD: 0.1,
    FRICTION: 0.05,
    BOUNDARY_DAMPING: 0.9
};

export class Circle {
    constructor(x, y, r, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.sleeping = false;
        this.sleepCounter = 0;
    }

    /**
     * Apply gravity and update position
     */
    update(boundaryCircle) {
        if (this.sleeping) return;

        this.vy += PHYSICS_CONSTANTS.GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= PHYSICS_CONSTANTS.DAMPING;
        this.vy *= PHYSICS_CONSTANTS.DAMPING;

        // Check total velocity magnitude for sleep
        const velocityMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        if (velocityMagnitude < PHYSICS_CONSTANTS.SLEEP_THRESHOLD && this.y > boundaryCircle.y) {
            // Stop the particle completely
            this.vx = 0;
            this.vy = 0;
            this.sleeping = true;
        }
    }

    /**
     * Handle collision with boundary circle
     */
    handleBoundaryCollision(boundaryCircle) {
        const dx = this.x - boundaryCircle.x;
        const dy = this.y - boundaryCircle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist + this.r > boundaryCircle.r - 0.5) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Position correction
            const penetration = Math.max(0, dist + this.r - boundaryCircle.r);
            this.x -= nx * penetration;
            this.y -= ny * penetration;

            // Velocity reflection with bounce threshold
            const velAlongNormal = this.vx * nx + this.vy * ny;
            if (velAlongNormal > PHYSICS_CONSTANTS.BOUNCE_THRESHOLD) {
                this.vx -= velAlongNormal * nx * 2;
                this.vy -= velAlongNormal * ny * 2;
            } else {
                // Sticking: kill velocity along the normal
                this.vx -= velAlongNormal * nx;
                this.vy -= velAlongNormal * ny;
            }

            // Apply friction along tangent
            const tx = -ny;
            const ty = nx;
            const velAlongTangent = this.vx * tx + this.vy * ty;

            this.vx -= velAlongTangent * tx * PHYSICS_CONSTANTS.FRICTION;
            this.vy -= velAlongTangent * ty * PHYSICS_CONSTANTS.FRICTION;
        }

        // Apply boundary damping when near edge
        if (dist + this.r >= boundaryCircle.r - 0.5) {
            this.vx *= PHYSICS_CONSTANTS.BOUNDARY_DAMPING;
        }
    }

    /**
     * Wake up the circle from sleep
     */
    wake() {
        this.sleeping = false;
        this.sleepCounter = 0;
    }

    /**
     * Render the circle
     */
    render(ctx) {
        ctx.fillStyle = this.sleeping ? "gray" : "steelblue";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}
