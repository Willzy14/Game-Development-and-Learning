# 🔧 CANVAS PATTERNS - Reusable Code Library

**Purpose:** Copy-paste ready Canvas code patterns for common art tasks  
**When to Read:** When implementing visual effects, need working gradient code, building procedural systems

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | Art research deep dive |
<!-- END METADATA -->

**Related Documents:**
- [10-ART_FUNDAMENTALS.md](./10-ART_FUNDAMENTALS.md) - Art theory these patterns implement
- [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md) - Game-specific visual techniques
- [08-QUICK_REFERENCE.md](./08-QUICK_REFERENCE.md) - Canvas API cheat sheet

---

## TABLE OF CONTENTS

1. [Color Utilities](#1-color-utilities)
2. [Gradient Patterns](#2-gradient-patterns)
3. [Lighting Simulation](#3-lighting-simulation)
4. [Compositing Operations](#4-compositing-operations)
5. [Transform Patterns](#5-transform-patterns)
6. [Procedural Generation](#6-procedural-generation)
7. [Performance Patterns](#7-performance-patterns)
8. [Effect Recipes](#8-effect-recipes)

---

## 1. COLOR UTILITIES

### Complete Color Utility Object

```javascript
const ColorUtils = {
    // Convert hex to RGB object
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },
    
    // Lighten a color by percentage
    lighten(hex, percent) {
        const rgb = this.hexToRgb(hex);
        const factor = percent / 100;
        return this.rgbToHex(
            rgb.r + (255 - rgb.r) * factor,
            rgb.g + (255 - rgb.g) * factor,
            rgb.b + (255 - rgb.b) * factor
        );
    },
    
    // Darken a color by percentage
    darken(hex, percent) {
        const rgb = this.hexToRgb(hex);
        const factor = 1 - percent / 100;
        return this.rgbToHex(
            rgb.r * factor,
            rgb.g * factor,
            rgb.b * factor
        );
    },
    
    // Add alpha to hex color
    withAlpha(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },
    
    // Blend two colors (factor 0-1, 0=color1, 1=color2)
    blend(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        return this.rgbToHex(
            rgb1.r + (rgb2.r - rgb1.r) * factor,
            rgb1.g + (rgb2.g - rgb1.g) * factor,
            rgb1.b + (rgb2.b - rgb1.b) * factor
        );
    },
    
    // Desaturate color (factor 0-1, 1=fully gray)
    desaturate(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const gray = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
        return this.rgbToHex(
            rgb.r + (gray - rgb.r) * factor,
            rgb.g + (gray - rgb.g) * factor,
            rgb.b + (gray - rgb.b) * factor
        );
    },
    
    // Apply atmospheric perspective (shift toward haze color)
    applyAtmosphere(hex, distance, maxDistance, hazeColor = '#8090a0') {
        const factor = Math.min(1, distance / maxDistance);
        const desaturated = this.desaturate(hex, factor * 0.7);
        return this.blend(desaturated, hazeColor, factor * 0.5);
    }
};
```

### Usage Examples

```javascript
// Lighten for highlights
const highlight = ColorUtils.lighten('#4488cc', 40);  // '#8ab8e0'

// Darken for shadows
const shadow = ColorUtils.darken('#4488cc', 30);  // '#305f8f'

// Atmospheric perspective
const farMountain = ColorUtils.applyAtmosphere('#2d5a3d', 800, 1000);

// Semi-transparent version
const ghostly = ColorUtils.withAlpha('#ff0000', 0.5);  // 'rgba(255, 0, 0, 0.5)'
```

---

## 2. GRADIENT PATTERNS

### Sky Gradients by Time of Day

```javascript
const SKY_GRADIENTS = {
    dawn: [
        { stop: 0, color: '#1a1a2e' },
        { stop: 0.3, color: '#4a3f5c' },
        { stop: 0.5, color: '#7a5a6a' },
        { stop: 0.7, color: '#d4a574' },
        { stop: 0.9, color: '#ffd4a0' },
        { stop: 1, color: '#fff5e6' }
    ],
    day: [
        { stop: 0, color: '#1e3a5f' },
        { stop: 0.4, color: '#4a90c2' },
        { stop: 0.7, color: '#87ceeb' },
        { stop: 1, color: '#c5e8f7' }
    ],
    sunset: [
        { stop: 0, color: '#0d1b2a' },
        { stop: 0.2, color: '#1b263b' },
        { stop: 0.4, color: '#4a1942' },
        { stop: 0.6, color: '#c1440e' },
        { stop: 0.8, color: '#ff6b35' },
        { stop: 1, color: '#ffc107' }
    ],
    night: [
        { stop: 0, color: '#000011' },
        { stop: 0.3, color: '#0a0a1a' },
        { stop: 0.6, color: '#1a1a2e' },
        { stop: 1, color: '#2a2a4a' }
    ],
    space: [
        { stop: 0, color: '#000000' },
        { stop: 0.5, color: '#0a0a15' },
        { stop: 1, color: '#10101a' }
    ]
};

function drawSky(ctx, width, height, timeOfDay = 'day') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    SKY_GRADIENTS[timeOfDay].forEach(({ stop, color }) => {
        gradient.addColorStop(stop, color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}
```

### 3D Sphere Gradient (Proper 5-Value)

```javascript
function drawSphere(ctx, x, y, radius, baseColor) {
    // Offset inner circle toward light source for 3D effect
    const grad = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, radius * 0.05,  // Highlight position
        x, y, radius
    );
    
    grad.addColorStop(0, ColorUtils.lighten(baseColor, 70));    // Highlight
    grad.addColorStop(0.15, ColorUtils.lighten(baseColor, 40)); // Light
    grad.addColorStop(0.4, baseColor);                          // Base/halftone
    grad.addColorStop(0.7, ColorUtils.darken(baseColor, 35));   // Core shadow
    grad.addColorStop(0.85, ColorUtils.darken(baseColor, 20));  // Reflected light!
    grad.addColorStop(1, ColorUtils.darken(baseColor, 30));     // Edge
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Optional: Add specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(
        x - radius * 0.35, y - radius * 0.35,
        radius * 0.15, radius * 0.1,
        -Math.PI / 4, 0, Math.PI * 2
    );
    ctx.fill();
}
```

### Cylinder Gradient (For Trunks, Columns)

```javascript
function drawCylinder(ctx, x, y, width, height, baseColor) {
    // Horizontal gradient for cylinder effect
    const grad = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);
    
    grad.addColorStop(0, ColorUtils.darken(baseColor, 30));    // Left edge shadow
    grad.addColorStop(0.2, ColorUtils.darken(baseColor, 10));  // Left halftone
    grad.addColorStop(0.4, baseColor);                          // Center light
    grad.addColorStop(0.5, ColorUtils.lighten(baseColor, 15)); // Highlight
    grad.addColorStop(0.6, baseColor);                          // Right of highlight
    grad.addColorStop(0.8, ColorUtils.darken(baseColor, 15));  // Right halftone
    grad.addColorStop(1, ColorUtils.darken(baseColor, 35));    // Right edge shadow
    
    ctx.fillStyle = grad;
    ctx.fillRect(x - width/2, y, width, height);
}
```

### Conic Gradient (For Dials, Pie Charts)

```javascript
function drawConicGradient(ctx, x, y, radius, colors) {
    // Note: createConicGradient(startAngle, x, y)
    const grad = ctx.createConicGradient(0, x, y);
    
    colors.forEach((color, i) => {
        grad.addColorStop(i / colors.length, color);
    });
    grad.addColorStop(1, colors[0]);  // Loop back
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Rainbow wheel
drawConicGradient(ctx, 100, 100, 50, [
    '#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'
]);
```

---

## 3. LIGHTING SIMULATION

### Dynamic Light on Multiple Objects

```javascript
function applyLightingToShapes(ctx, lightX, lightY, shapes) {
    shapes.forEach(shape => {
        const { x, y, width, height, baseColor, type } = shape;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Calculate angle and distance to light
        const dx = lightX - centerX;
        const dy = lightY - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Light intensity falloff
        const maxDistance = 500;
        const intensity = Math.max(0.2, 1 - distance / maxDistance);
        
        // Create directional gradient
        const grad = ctx.createLinearGradient(
            centerX - Math.cos(angle) * width * 0.5,
            centerY - Math.sin(angle) * height * 0.5,
            centerX + Math.cos(angle) * width * 0.5,
            centerY + Math.sin(angle) * height * 0.5
        );
        
        // Lit side (toward light)
        grad.addColorStop(0, ColorUtils.lighten(baseColor, 30 * intensity));
        // Base
        grad.addColorStop(0.5, baseColor);
        // Shadow side (away from light)
        grad.addColorStop(1, ColorUtils.darken(baseColor, 25));
        
        ctx.fillStyle = grad;
        
        if (type === 'circle') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, width, height);
        }
    });
}
```

### Cast Shadow Generator

```javascript
function drawCastShadow(ctx, objectX, objectY, objectWidth, objectHeight, lightX, lightY, groundY) {
    // Calculate shadow direction (opposite of light)
    const dx = objectX - lightX;
    const dy = objectY - lightY;
    
    // Shadow length based on light height
    const lightHeight = objectY - lightY;
    const shadowLength = (groundY - objectY) * (dx / lightHeight);
    
    ctx.save();
    
    // Shadow gradient: hard at contact, soft at end
    const shadowGrad = ctx.createLinearGradient(
        objectX, groundY,
        objectX + shadowLength, groundY
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');   // Hard at contact
    shadowGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.3)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');     // Soft at end
    
    ctx.fillStyle = shadowGrad;
    
    // Draw elongated shadow shape
    ctx.beginPath();
    ctx.moveTo(objectX - objectWidth/2, groundY);
    ctx.lineTo(objectX + objectWidth/2, groundY);
    ctx.lineTo(objectX + shadowLength + objectWidth/2, groundY);
    ctx.lineTo(objectX + shadowLength - objectWidth/2, groundY);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}
```

### Ambient Occlusion (Contact Shadow)

```javascript
function drawAmbientOcclusion(ctx, x, y, width, height) {
    // Soft shadow at base of objects
    const aoGrad = ctx.createRadialGradient(
        x, y + height, 0,
        x, y + height, width * 0.7
    );
    aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    aoGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + height + 3, width * 0.7, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
}
```

---

## 4. COMPOSITING OPERATIONS

### Key Composite Modes

```javascript
// Default - draw on top
ctx.globalCompositeOperation = 'source-over';

// USEFUL FOR LIGHTING:
ctx.globalCompositeOperation = 'lighter';   // Additive - for glow, light beams
ctx.globalCompositeOperation = 'screen';    // Lighten blend - for soft light

// USEFUL FOR SHADOWS:
ctx.globalCompositeOperation = 'multiply';  // Darken blend - for shadows

// USEFUL FOR MASKS:
ctx.globalCompositeOperation = 'destination-in';   // Keep only overlap
ctx.globalCompositeOperation = 'destination-out';  // Erase where drawn

// USEFUL FOR EFFECTS:
ctx.globalCompositeOperation = 'overlay';   // Contrast enhancement
ctx.globalCompositeOperation = 'soft-light'; // Subtle tinting
```

### Additive Glow Effect

```javascript
function drawGlow(ctx, x, y, radius, color, intensity = 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    // Multiple passes for smooth glow
    for (let i = 4; i >= 1; i--) {
        const glowRadius = radius * (1 + i * 0.5);
        const alpha = (0.15 / i) * intensity;
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        grad.addColorStop(0, ColorUtils.withAlpha(color, alpha));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
```

### Multiply Shadow Overlay

```javascript
function applyShadowOverlay(ctx, x, y, width, height, shadowAlpha = 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, `rgba(0, 0, 50, ${shadowAlpha})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, width, height);
    
    ctx.restore();
}
```

---

## 5. TRANSFORM PATTERNS

### CRITICAL: Save/Restore Pattern

```javascript
// ⚠️ ALWAYS use save/restore around transforms!

// ❌ WRONG - transforms accumulate!
for (let i = 0; i < 10; i++) {
    ctx.translate(50, 0);  // Each iteration shifts MORE
    ctx.rotate(0.1);
    drawThing();
}

// ✅ CORRECT
for (let i = 0; i < 10; i++) {
    ctx.save();
    ctx.translate(i * 50, 0);
    ctx.rotate(i * 0.1);
    drawThing();
    ctx.restore();
}
```

### Rotate Around Center

```javascript
function drawRotated(ctx, x, y, width, height, angle, drawFunc) {
    ctx.save();
    ctx.translate(x + width/2, y + height/2);  // Move origin to center
    ctx.rotate(angle);                          // Rotate
    ctx.translate(-width/2, -height/2);         // Offset to top-left
    drawFunc(ctx, 0, 0, width, height);         // Draw at origin
    ctx.restore();
}

// Usage
drawRotated(ctx, 100, 100, 50, 30, Math.PI / 4, (c, x, y, w, h) => {
    c.fillStyle = 'red';
    c.fillRect(x, y, w, h);
});
```

### Scale from Center

```javascript
function drawScaled(ctx, x, y, width, height, scale, drawFunc) {
    ctx.save();
    const centerX = x + width/2;
    const centerY = y + height/2;
    
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, centerY);
    
    drawFunc(ctx);
    ctx.restore();
}
```

### Flip Horizontally (For Facing Direction)

```javascript
function drawFlipped(ctx, x, y, width, facingRight, drawFunc) {
    ctx.save();
    
    if (!facingRight) {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        ctx.translate(-x, -y);
    }
    
    drawFunc(ctx, x, y);
    ctx.restore();
}
```

---

## 6. PROCEDURAL GENERATION

### Seeded Random (Deterministic)

```javascript
function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

// Usage: Same seed = same result
const value1 = seededRandom(42);  // Always same
const value2 = seededRandom(42);  // Same as value1
```

### Simple 2D Noise

```javascript
function noise2D(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// Smoother noise with interpolation
function smoothNoise2D(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    
    const v00 = noise2D(x0, y0);
    const v10 = noise2D(x0 + 1, y0);
    const v01 = noise2D(x0, y0 + 1);
    const v11 = noise2D(x0 + 1, y0 + 1);
    
    const i1 = v00 * (1 - fx) + v10 * fx;
    const i2 = v01 * (1 - fx) + v11 * fx;
    
    return i1 * (1 - fy) + i2 * fy;
}
```

### Procedural Mountain Range

```javascript
function drawMountainRange(ctx, width, height, options = {}) {
    const {
        baseY = height * 0.5,
        peakHeight = height * 0.3,
        segments = 10,
        color = '#2d3a4a',
        roughness = 0.5,
        seed = 0
    } = options;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);  // Bottom left
    
    for (let i = 0; i <= segments; i++) {
        const x = (width / segments) * i;
        const noiseVal = seededRandom(seed + i * 7.3);
        const peakY = baseY - peakHeight * (0.5 + noiseVal * roughness);
        
        if (i === 0) {
            ctx.lineTo(x, peakY);
        } else {
            // Smooth curve between peaks
            const prevX = (width / segments) * (i - 1);
            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(cpX, peakY - peakHeight * 0.1, x, peakY);
        }
    }
    
    ctx.lineTo(width, height);  // Bottom right
    ctx.closePath();
    ctx.fill();
}

// Usage: Multiple layers with atmospheric perspective
drawMountainRange(ctx, W, H, { baseY: H * 0.4, color: '#3a4a5a', seed: 1 });
drawMountainRange(ctx, W, H, { baseY: H * 0.5, color: '#2a3a4a', seed: 2 });
drawMountainRange(ctx, W, H, { baseY: H * 0.6, color: '#1a2a3a', seed: 3 });
```

### Procedural Stars

```javascript
function drawStars(ctx, width, height, count = 100, seed = 0) {
    for (let i = 0; i < count; i++) {
        const x = seededRandom(seed + i * 1.1) * width;
        const y = seededRandom(seed + i * 2.2) * height * 0.6;  // Upper portion
        const size = seededRandom(seed + i * 3.3) * 1.5 + 0.5;
        const brightness = seededRandom(seed + i * 4.4) * 0.5 + 0.3;
        
        // Star glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
        glowGrad.addColorStop(0.5, `rgba(255, 255, 255, ${brightness * 0.3})`);
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Star core
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness + 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

### Procedural Tree

```javascript
function drawTree(ctx, x, baseY, height, seed = 0) {
    const trunkWidth = height * 0.08;
    const trunkHeight = height * 0.35;
    const canopyRadius = height * 0.35;
    
    // Trunk (cylinder gradient)
    const trunkGrad = ctx.createLinearGradient(
        x - trunkWidth, 0, x + trunkWidth, 0
    );
    trunkGrad.addColorStop(0, '#3d2817');
    trunkGrad.addColorStop(0.3, '#5c4030');
    trunkGrad.addColorStop(0.7, '#4a3525');
    trunkGrad.addColorStop(1, '#2d1810');
    
    ctx.fillStyle = trunkGrad;
    ctx.fillRect(x - trunkWidth/2, baseY - trunkHeight, trunkWidth, trunkHeight);
    
    // Foliage (multiple overlapping circles)
    const canopyY = baseY - trunkHeight - canopyRadius * 0.5;
    const puffs = 5 + Math.floor(seededRandom(seed) * 3);
    
    for (let i = 0; i < puffs; i++) {
        const angle = (i / puffs) * Math.PI * 2;
        const dist = canopyRadius * 0.3 * seededRandom(seed + i * 0.1);
        const puffX = x + Math.cos(angle) * dist;
        const puffY = canopyY + Math.sin(angle) * dist * 0.5 - canopyRadius * 0.2;
        const puffSize = canopyRadius * (0.6 + seededRandom(seed + i * 0.2) * 0.4);
        
        const leafGrad = ctx.createRadialGradient(
            puffX - puffSize * 0.2, puffY - puffSize * 0.2, 0,
            puffX, puffY, puffSize
        );
        leafGrad.addColorStop(0, '#4a7c3a');
        leafGrad.addColorStop(0.7, '#2d5a1e');
        leafGrad.addColorStop(1, '#1a3a10');
        
        ctx.fillStyle = leafGrad;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

---

## 7. PERFORMANCE PATTERNS

### Batch by Style

```javascript
// ❌ SLOW - Style change per item
items.forEach(item => {
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.w, item.h);
});

// ✅ FAST - Group by color
const byColor = {};
items.forEach(item => {
    if (!byColor[item.color]) byColor[item.color] = [];
    byColor[item.color].push(item);
});

Object.entries(byColor).forEach(([color, colorItems]) => {
    ctx.fillStyle = color;
    colorItems.forEach(item => {
        ctx.fillRect(item.x, item.y, item.w, item.h);
    });
});
```

### Offscreen Canvas for Complex Static Elements

```javascript
// Create once
const bgCanvas = document.createElement('canvas');
bgCanvas.width = CANVAS_WIDTH;
bgCanvas.height = CANVAS_HEIGHT;
const bgCtx = bgCanvas.getContext('2d');

// Draw complex background once
function initBackground() {
    drawSky(bgCtx, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawMountains(bgCtx);
    drawTrees(bgCtx);
    // ... other static elements
}

// In game loop - just copy
function render() {
    ctx.drawImage(bgCanvas, 0, 0);  // Fast single copy
    drawDynamicElements();
}
```

### Integer Coordinates for Crisp Lines

```javascript
// ❌ Blurry 1px lines
ctx.strokeRect(10, 10, 50, 50);

// ✅ Crisp 1px lines (offset by 0.5)
ctx.strokeRect(10.5, 10.5, 50, 50);

// Or for any coordinate:
function crisp(n) {
    return Math.round(n) + 0.5;
}
```

### RequestAnimationFrame Pattern

```javascript
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Start
requestAnimationFrame(gameLoop);
```

---

## 8. EFFECT RECIPES

### Vignette

```javascript
function drawVignette(ctx, width, height, intensity = 0.4) {
    const grad = ctx.createRadialGradient(
        width/2, height/2, height * 0.3,
        width/2, height/2, height * 0.8
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
}
```

### Screen Flash

```javascript
function drawFlash(ctx, width, height, color, intensity) {
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

// Usage with fade
let flashIntensity = 1;
function update() {
    flashIntensity *= 0.9;  // Fade out
}
function render() {
    drawGame();
    if (flashIntensity > 0.01) {
        drawFlash(ctx, W, H, 'white', flashIntensity);
    }
}
```

### Motion Blur Trail

```javascript
// Instead of clearing fully, use semi-transparent clear
function render() {
    // Fade previous frame instead of clearing
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, W, H);
    
    // Draw current frame
    drawObjects();
}
```

### Underwater Caustics

```javascript
function drawCaustics(ctx, width, height, time) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < 8; i++) {
        const x = Math.sin(time * 0.001 + i) * 100 + width/2;
        const y = Math.cos(time * 0.0015 + i * 1.5) * 50 + height * 0.3;
        
        ctx.fillStyle = '#88ddff';
        ctx.beginPath();
        ctx.ellipse(x, y, 150, 80, time * 0.0005 + i, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
```

### Heat Shimmer

```javascript
function drawHeatShimmer(ctx, y, width, time) {
    ctx.save();
    ctx.globalAlpha = 0.03;
    
    for (let i = 0; i < 5; i++) {
        const offset = Math.sin(time * 0.01 + i * 0.5) * 3;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, y + i * 15 + offset, width, 2);
    }
    
    ctx.restore();
}
```

---

## QUICK REFERENCE: Common Patterns

| Task | Pattern |
|------|---------|
| 3D sphere | Offset radial gradient + 5 values |
| Soft glow | Additive composite + multiple radial passes |
| Drop shadow | Offset dark ellipse/rect with blur |
| Grounding | Radial gradient ellipse at contact |
| Atmosphere | Color shift + desaturate with distance |
| Crisp lines | Integer + 0.5 coordinates |
| Performance | Batch by style, offscreen canvas |
| Flip sprite | scale(-1, 1) with translate |

---

*Document created: January 6, 2026*  
*Source: Canvas API research + practical game development patterns*
