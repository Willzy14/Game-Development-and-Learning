# 🛠️ CANVAS IMPLEMENTATION PATTERNS - Material Logic in Code

**Purpose:** Production-ready Canvas code implementing Material Logic principles  
**When to Read:** After understanding 13-MATERIAL_LOGIC.md, when building scenes  
**Priority:** REFERENCE - Copy/paste these patterns into your projects

> ⚠️ **V7 WARNING - REFERENCE LIBRARY, NOT IMPLEMENTATION GUIDE**
> 
> This code library exists for **targeted problem-solving**, not wholesale implementation.
> V7 implemented the entire noise library, material system, and validation pipeline.
> Result: **Worse than V5** which used none of these.
> 
> **CORRECT USE:**
> 1. Identify a SPECIFIC visual problem
> 2. Find the ONE technique that addresses it
> 3. Copy ONLY that code
> 4. Test if it improved the render
> 5. Revert if not clearly better
> 
> **INCORRECT USE:**
> - "Let me add the noise library because it's here"
> - "I'll implement the whole material system"
> - "More techniques = better result"
> 
> See [16-TECHNIQUE_SELECTION.md](./16-TECHNIQUE_SELECTION.md) for decision framework.

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | Initial creation from V6 research |
<!-- END METADATA -->

**Related Documents:**
- [13-MATERIAL_LOGIC.md](./13-MATERIAL_LOGIC.md) - Theory foundation (read first)
- [12-EDGE_MASTERY.md](./12-EDGE_MASTERY.md) - Edge principles
- [11-CANVAS_PATTERNS.md](./11-CANVAS_PATTERNS.md) - General Canvas patterns
- [15-REALISM_VALIDATION.md](./15-REALISM_VALIDATION.md) - Automated testing

---

## 🎯 WHAT THIS DOCUMENT PROVIDES

**Problem:** 13-MATERIAL_LOGIC.md explains *what* and *why*, but you need *how*.

**Solution:** Drop-in Canvas functions that implement material logic correctly.

### What's Inside

1. **Complete Noise Library** - Perlin, Value, FBM implementations
2. **Material Profile System** - MATERIALS object ready to use
3. **Big Form Pass** - Structure-first scaffold
4. **Material Rendering Patterns** - shadeSilhouette, tree clumps, etc.
5. **Working Examples** - Full scene renderers you can modify

---

## TABLE OF CONTENTS

1. [Complete Noise Library](#1-complete-noise-library)
2. [Material Profile System](#2-material-profile-system)
3. [Big Form Pass Implementation](#3-big-form-pass-implementation)
4. [Material Rendering Patterns](#4-material-rendering-patterns)
5. [Scene Composition Pipeline](#5-scene-composition-pipeline)
6. [Color Utilities](#6-color-utilities)
7. [Complete Working Examples](#7-complete-working-examples)

---

## 1. COMPLETE NOISE LIBRARY

### Why Both Perlin AND Value Noise?

| Noise Type | Best For | Speed | Quality |
|------------|----------|-------|---------|
| **Perlin** | Terrain, mountains, organic shapes | Medium | High (gradient-based) |
| **Value** | Clouds, textures, general variation | Fast | Good (hash-based) |

**Recommendation:** Use Perlin for hero elements (mountains), Value for secondary (clouds, textures).

### A) Perlin Noise (Gradient-Based)

```javascript
// Perlin Noise Implementation
// Based on Ken Perlin's improved noise (2002)

class PerlinNoise {
    constructor(seed = 1337) {
        this.seed = seed;
        this.p = this._buildPermutationTable();
    }
    
    _buildPermutationTable() {
        // Generate permutation table with seed
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = i;
        
        // Shuffle with seeded random
        let rand = this.seed;
        for (let i = 255; i > 0; i--) {
            rand = (rand * 1103515245 + 12345) & 0x7fffffff;
            const j = rand % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Duplicate for overflow
        return [...p, ...p];
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.p[X] + Y;
        const b = this.p[X + 1] + Y;
        
        return this.lerp(
            v,
            this.lerp(u, this.grad(this.p[a], x, y), 
                         this.grad(this.p[b], x - 1, y)),
            this.lerp(u, this.grad(this.p[a + 1], x, y - 1), 
                         this.grad(this.p[b + 1], x - 1, y - 1))
        );
    }
}

// Global instance
const perlin = new PerlinNoise();
```

### B) Value Noise (Hash-Based, Faster)

```javascript
// Value Noise Implementation
// Simpler and faster than Perlin, good for most uses

function hash2(x, y, seed = 1337) {
    // Deterministic hash -> 0..1
    let n = x * 374761393 + y * 668265263 + seed * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    n = n ^ (n >> 16);
    return (n >>> 0) / 4294967295;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function smooth(t) {
    return t * t * (3 - 2 * t);
}

function valueNoise2D(x, y, seed = 1337) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const v00 = hash2(xi, yi, seed);
    const v10 = hash2(xi + 1, yi, seed);
    const v01 = hash2(xi, yi + 1, seed);
    const v11 = hash2(xi + 1, yi + 1, seed);
    
    const u = smooth(xf);
    const v = smooth(yf);
    
    const x1 = lerp(v00, v10, u);
    const x2 = lerp(v01, v11, u);
    
    return lerp(x1, x2, v); // 0..1
}
```

### C) FBM (Fractional Brownian Motion) - Multi-Octave

```javascript
// FBM - Combines multiple noise frequencies for natural variation
// This is what creates realistic terrain detail

function fbm2D(x, y, options = {}) {
    const {
        octaves = 4,
        amplitude = 0.5,     // How much each octave contributes
        scale = 0.01,        // Base frequency
        seed = 1337,
        noiseFunc = valueNoise2D  // Can swap to perlin.noise2D
    } = options;
    
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        sum += amp * noiseFunc(
            x * scale * freq, 
            y * scale * freq, 
            seed + i * 1013
        );
        
        maxValue += amp;
        amp *= amplitude;
        freq *= 2;
    }
    
    return sum / maxValue; // Normalized 0..1
}
```

### D) Unified Noise Interface

```javascript
// Single interface for all noise types
const NoiseEngine = {
    perlin: new PerlinNoise(),
    
    // Get noise value (0..1)
    get(x, y, type = 'value', options = {}) {
        switch (type) {
            case 'perlin':
                return (this.perlin.noise2D(
                    x * (options.scale || 0.01), 
                    y * (options.scale || 0.01)
                ) + 1) / 2; // Normalize to 0..1
                
            case 'value':
                return valueNoise2D(
                    x * (options.scale || 0.01), 
                    y * (options.scale || 0.01), 
                    options.seed || 1337
                );
                
            case 'fbm':
            case 'fbm-perlin':
                return fbm2D(x, y, {
                    ...options,
                    noiseFunc: (x, y, s) => this.perlin.noise2D(x, y)
                });
                
            case 'fbm-value':
            default:
                return fbm2D(x, y, options);
        }
    },
    
    // Get noise value in range (min..max)
    range(x, y, min, max, type = 'value', options = {}) {
        const n = this.get(x, y, type, options);
        return min + n * (max - min);
    },
    
    // Get bipolar noise (-1..1)
    bipolar(x, y, type = 'value', options = {}) {
        return this.get(x, y, type, options) * 2 - 1;
    }
};

// Usage examples:
// const n1 = NoiseEngine.get(x, y, 'perlin', { scale: 0.05 });
// const n2 = NoiseEngine.range(x, y, -50, 50, 'fbm-value', { octaves: 4 });
// const n3 = NoiseEngine.bipolar(x, y, 'value');
```

---

## 2. MATERIAL PROFILE SYSTEM

### The MATERIALS Object

```javascript
// Material profiles defining how each substance behaves
const MATERIALS = {
    rock: {
        name: "rock",
        base: { h: 210, s: 12, l: 38 },         // Cool grey-blue
        contrast: 0.55,                         // Higher than foliage
        edge: { hardness: 0.55, feather: 6 },   // Mixed hard/soft
        noise: { 
            type: 'fbm-perlin',
            scale: 0.012, 
            octaves: 4, 
            amplitude: 0.55 
        },
        detail: { 
            density: 0.35,      // Sparse detail
            size: [2, 12],      // Chip/crack size range
            alpha: 0.18         // Subtle details
        },
        depthFade: 0.55         // Moderate distance fade
    },
    
    foliage: {
        name: "foliage",
        base: { h: 115, s: 30, l: 30 },
        contrast: 0.35,
        edge: { hardness: 0.35, feather: 10 },  // Softer, broken silhouette
        noise: { 
            type: 'fbm-value',
            scale: 0.02, 
            octaves: 3, 
            amplitude: 0.45 
        },
        detail: { 
            density: 0.6,       // Many small forms
            size: [1, 6], 
            alpha: 0.22 
        },
        depthFade: 0.65
    },
    
    snow: {
        name: "snow",
        base: { h: 200, s: 10, l: 90 },
        contrast: 0.25,
        edge: { hardness: 0.25, feather: 14 },  // Very soft boundaries
        noise: { 
            type: 'fbm-value',
            scale: 0.03, 
            octaves: 2, 
            amplitude: 0.35 
        },
        detail: { 
            density: 0.25, 
            size: [2, 10], 
            alpha: 0.12 
        },
        depthFade: 0.75
    },
    
    cloud: {
        name: "cloud",
        base: { h: 45, s: 25, l: 92 },
        contrast: 0.18,
        edge: { hardness: 0.15, feather: 22 },  // Almost all lost edges
        noise: { 
            type: 'fbm-value',
            scale: 0.04, 
            octaves: 2, 
            amplitude: 0.28 
        },
        detail: { 
            density: 0.2, 
            size: [8, 40], 
            alpha: 0.07 
        },
        depthFade: 0.9
    },
    
    water: {
        name: "water",
        base: { h: 210, s: 35, l: 32 },
        contrast: 0.25,
        edge: { hardness: 0.25, feather: 16 },
        noise: { 
            type: 'fbm-value',
            scale: 0.015, 
            octaves: 3, 
            amplitude: 0.25 
        },
        detail: { 
            density: 0.15, 
            size: [10, 80],     // Large ripples
            alpha: 0.06 
        },
        depthFade: 0.8
    },
    
    ground: {
        name: "ground",
        base: { h: 95, s: 25, l: 28 },
        contrast: 0.3,
        edge: { hardness: 0.35, feather: 10 },
        noise: { 
            type: 'fbm-value',
            scale: 0.02, 
            octaves: 3, 
            amplitude: 0.4 
        },
        detail: { 
            density: 0.55, 
            size: [1, 8], 
            alpha: 0.18 
        },
        depthFade: 0.7
    }
};

// Helper to get material noise at position
function getMaterialNoise(x, y, material, depth = 0) {
    const n = NoiseEngine.get(x, y, material.noise.type, {
        scale: material.noise.scale,
        octaves: material.noise.octaves,
        amplitude: material.noise.amplitude
    });
    
    // Compress variation with depth (farther = smoother)
    const depthAtten = 1 - depth * material.depthFade;
    
    // Return bipolar variation (-contrast..+contrast)
    return (n - 0.5) * material.contrast * depthAtten;
}
```

---

## 3. BIG FORM PASS IMPLEMENTATION

### Why This Matters

**V6 Problem:** Started with texture → abstract foam  
**V7 Solution:** Start with solid masses → add material behavior → add atmosphere

### The Big Form Pass Function

```javascript
// Phase 1: Structure-first scaffold
// NO noise, NO scatter, NO feather - just readable masses

function bigFormPass(ctx, width, height) {
    // Rule: 3-6 large shapes, 2-4 value groups maximum
    
    // 1) Sky gradient (simple, no texture)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGrad.addColorStop(0, 'hsl(220, 45%, 15%)');   // Deep blue top
    skyGrad.addColorStop(0.7, 'hsl(30, 55%, 45%)');  // Warm horizon
    skyGrad.addColorStop(1, 'hsl(35, 60%, 55%)');    // Bright low
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);
    
    // 2) Distant mountain mass (single readable silhouette)
    ctx.fillStyle = 'hsl(210, 15%, 35%)';  // Single color, no variation
    ctx.beginPath();
    ctx.moveTo(0, height * 0.55);
    
    // Simple curves - NO NOISE
    ctx.bezierCurveTo(
        width * 0.25, height * 0.42,
        width * 0.45, height * 0.60,
        width * 0.65, height * 0.50
    );
    ctx.bezierCurveTo(
        width * 0.82, height * 0.42,
        width * 0.92, height * 0.58,
        width, height * 0.52
    );
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // 3) Water band (flat color)
    ctx.fillStyle = 'hsl(210, 35%, 30%)';
    ctx.fillRect(0, height * 0.55, width, height * 0.18);
    
    // 4) Ground band (flat color)
    ctx.fillStyle = 'hsl(95, 25%, 25%)';
    ctx.fillRect(0, height * 0.73, width, height * 0.27);
    
    // OUTPUT: Flat but readable structure
    // Next pass will add material behavior
}
```

### Validation After Big Form Pass

```javascript
// Quick check: can you identify elements?
function validateBigFormPass(ctx, width, height) {
    // Sample 5 random points
    const samples = [];
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        samples.push({x, y, r: pixel[0], g: pixel[1], b: pixel[2]});
    }
    
    // Check: are there distinct value groups?
    // If all samples are similar → failed (no structure)
    const values = samples.map(s => 0.2126*s.r + 0.7152*s.g + 0.0722*s.b);
    const range = Math.max(...values) - Math.min(...values);
    
    if (range < 50) {
        console.warn('❌ Big Form Pass: Insufficient value contrast');
        return false;
    }
    
    console.log('✅ Big Form Pass: Structure established');
    return true;
}
```

---

## 4. MATERIAL RENDERING PATTERNS

### A) shadeSilhouette Pattern

**Purpose:** Apply material-specific shading inside a defined shape.

```javascript
// Render material behavior inside a clipped region
function shadeSilhouette(ctx, width, height, clipPathFn, material, options = {}) {
    const {
        lightDir = { x: -0.6, y: -0.8 },  // Top-left light
        depth = 0.2,                       // Distance (0=near, 1=far)
        normalMap = null                   // Optional: surface normals
    } = options;
    
    ctx.save();
    
    // 1) Clip to shape
    ctx.beginPath();
    clipPathFn(ctx);
    ctx.clip();
    
    // 2) Get pixel data
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    // 3) Apply material shading per pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Skip if outside clip
            if (data[idx + 3] === 0) continue;
            
            // Get material noise at this position
            const noiseVariation = getMaterialNoise(x, y, material, depth);
            
            // Apply to base lightness
            let l = material.base.l + noiseVariation * 80;
            
            // Optional: factor in surface normal for lighting
            if (normalMap) {
                const normal = normalMap(x, y);
                const facing = Math.max(0, 
                    normal.x * lightDir.x + normal.y * lightDir.y
                );
                l *= 0.5 + facing * 0.5;  // Darken away-facing surfaces
            }
            
            // Clamp and convert to RGB
            l = Math.max(0, Math.min(100, l));
            const rgb = hslToRgb(material.base.h, material.base.s, l);
            
            data[idx] = rgb.r;
            data[idx + 1] = rgb.g;
            data[idx + 2] = rgb.b;
            // Alpha stays same
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
    ctx.restore();
}

// Example usage:
function drawMountainWithMaterial(ctx, width, height) {
    // Define mountain silhouette
    const mountainPath = (ctx) => {
        ctx.moveTo(0, height * 0.6);
        ctx.bezierCurveTo(
            width * 0.3, height * 0.4,
            width * 0.7, height * 0.35,
            width, height * 0.55
        );
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
    };
    
    // Apply rock material shading
    shadeSilhouette(ctx, width, height, mountainPath, MATERIALS.rock, {
        depth: 0.3,
        lightDir: { x: -0.5, y: -0.8 }
    });
}
```

### B) Tree Cluster Pattern

**Purpose:** Generate clustered foliage masses (not uniform scatter).

```javascript
// Generate tree cluster with coherent structure
function drawTreeCluster(ctx, centerX, centerY, width, height, material, depth = 0.2) {
    // 1) Generate cluster centers (5-12 blobs)
    const numBlobs = 5 + Math.floor(Math.random() * 7);
    const blobs = [];
    
    for (let i = 0; i < numBlobs; i++) {
        const angle = (i / numBlobs) * Math.PI * 2;
        const dist = NoiseEngine.range(
            i, 0, 
            width * 0.3, width * 0.5, 
            'value'
        );
        
        blobs.push({
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            r: height * NoiseEngine.range(i, 100, 0.15, 0.3, 'value')
        });
    }
    
    // 2) Draw cluster cores (firmer edges)
    ctx.globalCompositeOperation = 'source-over';
    blobs.forEach(blob => {
        const coreGrad = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.r
        );
        
        const coreColor = hslToRgb(
            material.base.h, 
            material.base.s, 
            material.base.l
        );
        const coreAlpha = 0.7;
        
        coreGrad.addColorStop(0, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, ${coreAlpha})`);
        coreGrad.addColorStop(0.6, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, ${coreAlpha * 0.5})`);
        coreGrad.addColorStop(1, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, 0)`);
        
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 3) Add soft outer foliage (scattered micro-leaves)
    blobs.forEach(blob => {
        const detailCount = Math.floor(material.detail.density * 50);
        
        for (let i = 0; i < detailCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = blob.r * (0.8 + Math.random() * 0.5);
            const x = blob.x + Math.cos(angle) * dist;
            const y = blob.y + Math.sin(angle) * dist;
            
            const size = material.detail.size[0] + 
                        Math.random() * (material.detail.size[1] - material.detail.size[0]);
            
            ctx.fillStyle = `rgba(${material.base.h}, ${material.base.s}%, ${material.base.l}%, ${material.detail.alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // 4) Apply atmospheric fade if distant
    if (depth > 0.4) {
        ctx.globalCompositeOperation = 'source-atop';
        const fadeAlpha = 1 - (depth - 0.4) * 0.8;
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - fadeAlpha})`;
        ctx.fillRect(
            centerX - width, 
            centerY - height, 
            width * 2, 
            height * 2
        );
    }
}
```

### C) Edge Treatment Pattern

**Purpose:** Apply material-specific edge character to shapes.

```javascript
// Add edge variation to a path (not ruler-straight)
function noisyEdge(ctx, points, material, closed = false) {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        
        // How much to deviate based on material hardness
        const jitter = material.edge.feather;
        
        // Use coherent noise for natural variation
        const noiseX = NoiseEngine.bipolar(i, 0, 'value', { scale: 0.1 });
        const noiseY = NoiseEngine.bipolar(i, 100, 'value', { scale: 0.1 });
        
        const dx = noiseX * jitter;
        const dy = noiseY * jitter;
        
        // Hard edges = more direct, soft edges = more curve
        if (material.edge.hardness > 0.5) {
            ctx.lineTo(curr.x + dx, curr.y + dy);
        } else {
            // Soft edges use curves
            const cpX = (prev.x + curr.x) / 2 + dx;
            const cpY = (prev.y + curr.y) / 2 + dy;
            ctx.quadraticCurveTo(cpX, cpY, curr.x + dx, curr.y + dy);
        }
    }
    
    if (closed) {
        ctx.closePath();
    }
}
```

---

## 5. SCENE COMPOSITION PIPELINE

### Complete Rendering Order

```javascript
// The full pipeline: Form → Material → Atmosphere
class SceneRenderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }
    
    render() {
        // PHASE 1: Big Form Pass (structure)
        this.bigFormPass();
        
        // PHASE 2: Material Pass (substance)
        this.materialPass();
        
        // PHASE 3: Atmosphere Pass (depth)
        this.atmospherePass();
        
        // PHASE 4: Final refinement
        this.refinementPass();
    }
    
    bigFormPass() {
        console.log('📐 Phase 1: Big Form Pass');
        bigFormPass(this.ctx, this.width, this.height);
        
        // Validate structure
        if (!validateBigFormPass(this.ctx, this.width, this.height)) {
            console.error('Structure validation failed!');
        }
    }
    
    materialPass() {
        console.log('🎨 Phase 2: Material Pass');
        
        // Apply material-specific rendering to each element
        // Mountains
        this.renderMountains(MATERIALS.rock, 0.4);
        
        // Trees
        this.renderTrees(MATERIALS.foliage, 0.3);
        
        // Snow patches
        this.renderSnow(MATERIALS.snow, 0.2);
        
        // Clouds
        this.renderClouds(MATERIALS.cloud, 0.8);
    }
    
    atmospherePass() {
        console.log('🌫️ Phase 3: Atmosphere Pass');
        
        // Add depth-based haze
        const hazeGrad = this.ctx.createLinearGradient(
            0, this.height * 0.4,
            0, this.height * 0.7
        );
        hazeGrad.addColorStop(0, 'rgba(200, 210, 230, 0)');
        hazeGrad.addColorStop(1, 'rgba(200, 210, 230, 0.3)');
        
        this.ctx.fillStyle = hazeGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    refinementPass() {
        console.log('✨ Phase 4: Refinement Pass');
        
        // Add final touches (highlights, deep shadows, etc.)
        // Keep minimal - don't undo material work
    }
    
    renderMountains(material, depth) {
        // Define mountain silhouettes
        const mountainPath = (ctx) => {
            // ...mountain shape...
        };
        
        shadeSilhouette(
            this.ctx, 
            this.width, 
            this.height, 
            mountainPath, 
            material, 
            { depth }
        );
    }
    
    renderTrees(material, depth) {
        // Place tree clusters
        const clusters = [
            { x: this.width * 0.2, y: this.height * 0.7, w: 80, h: 120 },
            { x: this.width * 0.5, y: this.height * 0.72, w: 100, h: 150 },
            { x: this.width * 0.8, y: this.height * 0.68, w: 90, h: 130 }
        ];
        
        clusters.forEach(c => {
            drawTreeCluster(
                this.ctx, 
                c.x, c.y, c.w, c.h, 
                material, 
                depth
            );
        });
    }
    
    renderSnow(material, depth) {
        // Snow patches on mountains (top-facing surfaces)
        // ...implementation...
    }
    
    renderClouds(material, depth) {
        // Clouds in sky layer
        // ...implementation...
    }
}
```

---

## 6. COLOR UTILITIES

### HSL to RGB Conversion

```javascript
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 60) {
        r = c; g = x;
    } else if (h < 120) {
        r = x; g = c;
    } else if (h < 180) {
        g = c; b = x;
    } else if (h < 240) {
        g = x; b = c;
    } else if (h < 300) {
        r = x; b = c;
    } else {
        r = c; b = x;
    }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
        return { h: 0, s: 0, l: l * 100 };
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    let h;
    if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
    } else {
        h = ((r - g) / d + 4) / 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
```

---

## 7. COMPLETE WORKING EXAMPLES

### Example 1: Simple Mountain Scene

```javascript
// Minimal working example implementing all patterns
const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

const renderer = new SceneRenderer(canvas);
renderer.render();
```

### Example 2: Material Comparison Demo

```javascript
// Draw same shape with different materials to see behavior
function materialComparisonDemo(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width / 3;
    const h = canvas.height;
    
    const testShape = (ctx) => {
        ctx.rect(10, 10, w - 20, h - 20);
    };
    
    // Rock material
    ctx.save();
    ctx.translate(0, 0);
    shadeSilhouette(ctx, w, h, testShape, MATERIALS.rock);
    ctx.restore();
    
    // Snow material
    ctx.save();
    ctx.translate(w, 0);
    shadeSilhouette(ctx, w, h, testShape, MATERIALS.snow);
    ctx.restore();
    
    // Cloud material
    ctx.save();
    ctx.translate(w * 2, 0);
    shadeSilhouette(ctx, w, h, testShape, MATERIALS.cloud);
    ctx.restore();
}
```

### Example 3: Noise Comparison

```javascript
// Visualize different noise types
function noiseComparisonDemo(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height / 3;
    
    // Value noise
    drawNoiseStrip(ctx, 0, 0, w, h, 'value');
    
    // Perlin noise
    drawNoiseStrip(ctx, 0, h, w, h, 'perlin');
    
    // FBM (multi-octave)
    drawNoiseStrip(ctx, 0, h * 2, w, h, 'fbm-value');
}

function drawNoiseStrip(ctx, x, y, w, h, noiseType) {
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    
    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const n = NoiseEngine.get(px, py, noiseType, { scale: 0.02 });
            const gray = Math.floor(n * 255);
            
            const idx = (py * w + px) * 4;
            data[idx] = gray;
            data[idx + 1] = gray;
            data[idx + 2] = gray;
            data[idx + 3] = 255;
        }
    }
    
    ctx.putImageData(imgData, x, y);
}
```

---

## USAGE CHECKLIST

Before using these patterns:

- [ ] Copy noise library (Section 1) into your project
- [ ] Copy MATERIALS object (Section 2)
- [ ] Copy color utilities (Section 6)
- [ ] Implement bigFormPass first (Section 3)
- [ ] Apply material patterns (Section 4)
- [ ] Test with realism validation (see 15-REALISM_VALIDATION.md)

**Common Pitfalls:**

1. ❌ Skipping Big Form Pass → abstract results
2. ❌ Using Math.random() instead of noise → sparkly
3. ❌ Applying atmosphere before material → "foam mountains"
4. ❌ Same edge treatment for all materials → uniform

---

## RESOURCES

### Noise References

- **The Book of Shaders - Noise Chapter**  
  https://thebookofshaders.com/11/
  
- **Ken Perlin's Original Paper**  
  https://mrl.cs.nyu.edu/~perlin/paper445.pdf
  
- **Understanding Perlin Noise**  
  https://adrianb.io/2014/08/09/perlinnoise.html

### Canvas API

- **MDN Canvas Tutorial**  
  https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
  
- **Canvas Deep Dive**  
  https://joshondesign.com/p/books/canvasdeepdive/toc.html

---

*Last Updated: January 6, 2026*  
*This document provides production-ready code implementing 13-MATERIAL_LOGIC.md principles.*  
*Use with 15-REALISM_VALIDATION.md for complete workflow.*
