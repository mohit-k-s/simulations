function createCanvas(width, height, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio);
    const canvas = document.createElement('canvas');
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    if (set2dTransform) {
        canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    return canvas;
}

const canvas = createCanvas(640, 640);
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;


const bigCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 300
};

const g = .2; // gravity
const damping = 0.98; // velocity decay factor

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0;
        this.vy = 0;
    }
}

const n = 10000;
const circles = [];
let R = 2;

function spawnCircles(num, centerX, centerY, radius= R) {
    for (let i = 0; i < num; i++) {
        // Pick random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * radius; // sqrt ensures uniform distribution

        // Convert polar to Cartesian coordinates
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;

        circles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            r: R
        });
    }
}

// Example usage:
spawnCircles(n, bigCircle.x / 2, bigCircle.y / 2, 200);

function resolveCollision(a, b) {
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

        const push = overlap / 2;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;

        if (relVel < 0) {
            const impulse = -(1) * relVel;
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
            b.vx += impulse * nx;
            b.vy += impulse * ny;

            // Wake them up if they were sleeping
            a.sleeping = false;
            b.sleeping = false;
            a.sleepCounter = 0;
            b.sleepCounter = 0;
        }
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(bigCircle.x, bigCircle.y, bigCircle.r, 0, Math.PI * 2);
    ctx.stroke();

    const sleepVelThreshold = 0.02;
    const sleepTimeThreshold = 30; // frames

    // Apply gravity and move
    for (let c of circles) {
        if (!c.sleeping) {
            c.vy += g;
            c.x += c.vx;
            c.y += c.vy;

            c.vx *= damping;
            c.vy *= damping;

            const dx = c.x - bigCircle.x;
            const dy = c.y - bigCircle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist + c.r > bigCircle.r - 0.5) {
                const nx = dx / dist;
                const ny = dy / dist;

                const penetration = Math.max(0, dist + c.r - bigCircle.r);
                c.x -= nx * penetration;
                c.y -= ny * penetration;

                const velAlongNormal = c.vx * nx + c.vy * ny;
                if (velAlongNormal > 0.1) { // require a minimum bounce speed
                    c.vx -= velAlongNormal * nx * 2;
                    c.vy -= velAlongNormal * ny * 2;
                } else {
                    // Sticking: kill velocity along the normal
                    c.vx -= velAlongNormal * nx;
                    c.vy -= velAlongNormal * ny;
                }

                const tx = -ny;
                const ty = nx;
                const velAlongTangent = c.vx * tx + c.vy * ty;
                const friction = 0.05;

                c.vx -= velAlongTangent * tx * friction;
                c.vy -= velAlongTangent * ty * friction;
            }

            if (dist + c.r >= bigCircle.r - 0.5) { // near boundary
                c.vx *= 0.9; // high damping sideways
            }

            const SLEEP_THRESHOLD = .05;
            if (Math.abs(c.vx) < SLEEP_THRESHOLD)  { c.vx = 0; }
            if (Math.abs(c.vy) < SLEEP_THRESHOLD)  {c.vy = 0;}
        }
    }

    // Spatial grid for collision optimization
    const cellSize = 50;
    const grid = {};
    const cellKey = (x, y) => `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;

    circles.forEach(c => {
        const key = cellKey(c.x, c.y);
        if (!grid[key]) grid[key] = [];
        grid[key].push(c);
    });

    const neighborOffsets = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [-1, 1]
    ];

    let start = performance.now();

    for (let key in grid) {
        const [cx, cy] = key.split(",").map(Number);
        const currentCell = grid[key];

        for (let [dx, dy] of neighborOffsets) {
            const neighborKey = `${cx + dx},${cy + dy}`;
            const neighbor = grid[neighborKey];
            if (!neighbor) continue;

            if (neighbor === currentCell) {
                for (let i = 0; i < currentCell.length; i++) {
                    for (let j = i + 1; j < currentCell.length; j++) {
                        resolveCollision(currentCell[i], currentCell[j]);
                    }
                }
            } else {
                for (let a of currentCell) {
                    for (let b of neighbor) {
                        resolveCollision(a, b);
                    }
                }
            }
        }
    }

    let end = performance.now();
    console.log("Detection took", (end - start).toFixed(2), "ms");

    for (let c of circles) {
        ctx.fillStyle = c.sleeping ? "gray" : "steelblue";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(update);
}

update()