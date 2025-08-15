# Physics Simulation - Canvas Experiments

A real-time physics simulation featuring particle dynamics, collision detection, and interactive controls.

## Features

- **Real-time Physics Engine** - Gravity, damping, and collision detection
- **Particle Sleep System** - Particles stop when velocity drops below threshold
- **Interactive Controls** - Adjustable particle count (10K-50K)
- **Performance Monitoring** - Debug info with memory usage tracking
- **Spatial Grid Optimization** - Efficient collision detection for large particle counts

## Controls

| Key | Action |
|-----|--------|
| `D` | Toggle debug information |
| `R` | Reset simulation |
| `Space` | Pause/Resume |
| `C` | Clear all particles |
| `Click` | Add particles at mouse position |

## Usage

1. Open `index.html` in a web browser
2. Use the particle count slider to adjust simulation size
3. Click "Apply Changes" to reset with new particle count
4. Press `D` to view performance metrics and memory usage

## Debug Information

When debug mode is enabled, you'll see:
- Particle statistics (total, sleeping, awake)
- Average velocity
- Collision detection timing
- Memory usage (Chrome/Edge only)
- Frame count

## Technical Details

- **Boundary Physics** - Circular boundary with realistic collision response
- **Sleep Optimization** - Particles turn gray and stop updating when slow
- **Memory Efficient** - Spatial grid reduces collision checks from O(n²) to O(n)
- **Responsive Design** - Sidebar controls with centered canvas

Built with vanilla JavaScript and HTML5 Canvas.
