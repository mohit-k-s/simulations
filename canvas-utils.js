/**
 * Canvas utility functions for high-DPI displays
 */

export function createCanvas(width, height, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio);
    const canvas = document.createElement('canvas');
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    
    if (set2dTransform) {
        const ctx = canvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.imageSmoothingEnabled = true;
    }
    
    return canvas;
}

export function setupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    return ctx;
}
