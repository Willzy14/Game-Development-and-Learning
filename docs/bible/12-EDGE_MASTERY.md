# 🌊 EDGE MASTERY - The Paradigm Shift

**Purpose:** Transform how we think about drawing - from shapes to probability fields  
**When to Read:** Before ANY art work. This changes everything.  
**Priority:** CRITICAL - This document supersedes previous edge-related advice

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | Edge theory research deep dive |
<!-- END METADATA -->

**Related Documents:**
- [10-ART_FUNDAMENTALS.md](./10-ART_FUNDAMENTALS.md) - Value and composition (still valid)
- [11-CANVAS_PATTERNS.md](./11-CANVAS_PATTERNS.md) - Code patterns (update pending)
- [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md) - Texture techniques

---

## 🔑 THE CORE TRUTH (Burn This Into Memory)

> **Nature is built from probability fields, not boundaries.**
> **Hard edges are a human abstraction.**

What we've been doing wrong isn't "bad drawing" — it's **wrong edge logic**.

---

## 🚨 THE CHECKABLE RULE

```
╔══════════════════════════════════════════════════════════════╗
║  IF AN EDGE CAN BE TRACED WITH A RULER, IT IS WRONG.        ║
║                                                              ║
║  Every edge must:                                            ║
║    • Vary in angle                                           ║
║    • Vary in thickness                                       ║
║    • Vary in opacity                                         ║
║    • Dissolve into its neighbours                            ║
╚══════════════════════════════════════════════════════════════╝
```

---

## TABLE OF CONTENTS

1. [The Mental Model Shift](#1-the-mental-model-shift)
2. [Edge Classification System](#2-edge-classification-system)
3. [Why Straight Lines Look Wrong](#3-why-straight-lines-look-wrong)
4. [Value Bridging](#4-value-bridging)
5. [Atmospheric Edge Softening](#5-atmospheric-edge-softening)
6. [Organic Silhouettes](#6-organic-silhouettes)
7. [Light as Distribution](#7-light-as-distribution)
8. [Canvas Implementation Patterns](#8-canvas-implementation-patterns)
9. [Before/After Examples](#9-beforeafter-examples)
10. [Canvas Edge Toolkit](#10-canvas-edge-toolkit) ⭐ NEW
11. [Nature Primitives Library](#11-nature-primitives-library) ⭐ NEW
12. [Self-Audit System](#12-self-audit-system) ⭐ NEW
13. [V6 Lessons Learned](#13-v6-lessons-learned-cautionary-tale) ⭐ NEW
14. [Quick Validation Checklist](#14-quick-validation-checklist)

---

## 1. THE MENTAL MODEL SHIFT

This is the most important section. Everything else follows from this.

### ❌ OLD MODEL (What We Were Doing)

```
1. Draw shape with lineTo()
2. Fill with gradient
3. Add texture on top
4. Hope it looks natural
```

**Problem:** This treats nature as geometry. Nature is not geometry.

### ✅ NEW MODEL (What We Must Do)

```
1. Accumulate form through layered variation
2. Every edge is a probability distribution
3. Nothing touches directly - always bridged
4. Carve order from chaos, don't build geometry
```

### The Key Insight

```
You are not drawing a line.
You are drawing a BAND OF UNCERTAINTY.
```

### Why Our Sky Worked But Mountains Failed

| Element | Approach | Result |
|---------|----------|--------|
| Sky | Gradient bands, soft transitions, no hard stops | ✅ Natural |
| Mountains | `lineTo()` creating geometric shapes, filled with gradient | ❌ Artificial |

The sky worked because we **accumulated** color bands.
The mountains failed because we **drew shapes**.

---

## 2. EDGE CLASSIFICATION SYSTEM

Classical artists use four edge types. We must implement all four.

### The Four Edge Types

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  HARD EDGE ─────── Sharp, defined boundary                      │
│                    Use for: Man-made objects, focal points      │
│                    Canvas: Clear lineTo(), high contrast        │
│                                                                 │
│  SOFT EDGE ─────── Gradual transition                           │
│                    Use for: Natural forms, curves, atmosphere   │
│                    Canvas: Gradient, feathered alpha            │
│                                                                 │
│  LOST EDGE ─────── Form dissolves into background               │
│                    Use for: Shadow areas, distance, mystery     │
│                    Canvas: Values so close they merge           │
│                                                                 │
│  FOUND EDGE ────── Selectively sharpened area                   │
│                    Use for: Drawing eye, key details            │
│                    Canvas: Deliberate contrast boost            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Edge Distribution Rule

In a natural scene:
- **5%** Hard edges (focal point, man-made objects)
- **30%** Found edges (important details)
- **40%** Soft edges (general forms)
- **25%** Lost edges (shadows, distance, transitions)

**Our V5 Problem:** We had ~80% hard edges, ~20% soft. Completely inverted.

### Canvas Implementation

```javascript
// HARD EDGE - Use sparingly!
ctx.strokeStyle = color;
ctx.lineWidth = 2;
ctx.stroke();

// SOFT EDGE - Feathered gradient
const grad = ctx.createLinearGradient(x1, y1, x2, y2);
grad.addColorStop(0, colorA);
grad.addColorStop(0.3, colorMid);
grad.addColorStop(1, colorB);

// LOST EDGE - Values merge
// Make shadow color very close to background
const shadowColor = ColorUtils.blend(objectColor, backgroundColor, 0.85);

// FOUND EDGE - Selective sharpening
// Boost contrast only at focal point
ctx.globalCompositeOperation = 'overlay';
// ... draw contrast enhancement
```

---

## 3. WHY STRAIGHT LINES LOOK WRONG

### The Natural Contour Truth

Natural contours **never** move at a constant angle. Every edge in nature:
- Wobbles
- Compresses
- Expands
- Contains micro-angles

Even a "straight" cliff face is actually **aggregated micro-angles**.

### The Code Translation

```javascript
// ❌ WRONG - Straight line
ctx.lineTo(x, y);

// ✅ RIGHT - Band of uncertainty
function uncertainLine(ctx, x1, y1, x2, y2, segments, jitter) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const baseX = lerp(x1, x2, t);
        const baseY = lerp(y1, y2, t);
        
        // Add uncertainty - varies with position
        const noiseX = (noise(i * 0.1) - 0.5) * jitter;
        const noiseY = (noise(i * 0.1 + 100) - 0.5) * jitter;
        
        points.push({
            x: baseX + noiseX,
            y: baseY + noiseY
        });
    }
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
}
```

### Jitter Guidelines

| Element | Jitter Amount | Why |
|---------|---------------|-----|
| Mountain ridge | High (15-30px) | Rocky, irregular |
| Tree silhouette | Medium (8-15px) | Organic but structured |
| Shoreline | Medium (10-20px) | Water variation |
| Snow line | High (20-40px) | Drift patterns |
| Cloud edge | Very high (30-50px) | Completely organic |
| Building edge | None or minimal | Man-made = straight |

---

## 4. VALUE BRIDGING

### The Absolute Rule

```
╔═══════════════════════════════════════════════════════════╗
║  NEVER ALLOW COLOR A TO TOUCH COLOR B DIRECTLY.          ║
║                                                           ║
║  There must ALWAYS be a transition zone between them.     ║
╚═══════════════════════════════════════════════════════════╝
```

### What This Means in Practice

Transitions in nature are **zones**, not borders. Nature moves:
- Dark → Mid → Light
- Dense → Sparse  
- Wet → Dry
- Solid → Scattered

### The Three Bridging Techniques

#### 1. Gradient Bands
```javascript
// Instead of: snow meets rock with a line
// Do: gradient transition zone

const transitionGrad = ctx.createLinearGradient(x, snowEnd, x, rockStart);
transitionGrad.addColorStop(0, snowColor);
transitionGrad.addColorStop(0.3, ColorUtils.blend(snowColor, rockColor, 0.3));
transitionGrad.addColorStop(0.6, ColorUtils.blend(snowColor, rockColor, 0.7));
transitionGrad.addColorStop(1, rockColor);
```

#### 2. Stippling/Scatter
```javascript
// Snow invades rock in patches, not a line
function bridgeWithScatter(ctx, zoneStart, zoneEnd, colorA, colorB, density) {
    const zoneHeight = zoneEnd - zoneStart;
    
    for (let i = 0; i < density; i++) {
        const y = zoneStart + Math.random() * zoneHeight;
        const t = (y - zoneStart) / zoneHeight;
        
        // Probability of colorA decreases as we go down
        const probA = 1 - t;
        const color = Math.random() < probA ? colorA : colorB;
        
        const size = 2 + Math.random() * 6;
        drawSoftBlob(ctx, x + (Math.random() - 0.5) * spread, y, size, color);
    }
}
```

#### 3. Interlocking Shapes
```javascript
// Shapes interlock rather than having a clean boundary
// Think puzzle pieces, not straight cuts
```

### Visual Example

```
❌ WRONG (hard boundary):
████████████████████  Snow
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Rock

✅ RIGHT (value bridging):
████████████████████  Pure snow
███▓███▓██▓█████▓███  Snow with rock patches
▓██▓▓█▓▓▓▓▓█▓▓█▓▓▓▓▓  Mixed zone
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Rock with snow patches
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Pure rock
```

---

## 5. ATMOSPHERIC EDGE SOFTENING

### The Rule We Missed

We implemented atmospheric **color** shift correctly:
- Distant = desaturated
- Distant = blue-shifted

But we missed atmospheric **edge** shift:
- Distant = softer edges
- Distant = lower contrast
- Distant = less detail

### Edge Sharpness as Function of Depth

```javascript
// Edge sharpness must decrease with distance
function getEdgeSharpness(depth, near = 0, far = 1) {
    // Returns 1.0 at near, 0.1 at far
    const t = (depth - near) / (far - near);
    return lerp(1.0, 0.1, Math.min(1, t));
}

// Apply to jitter/blur/alpha
const sharpness = getEdgeSharpness(mountainDepth);
const jitter = baseJitter * (2 - sharpness);  // More jitter when soft
const blur = baseBlur * (1 / sharpness);       // More blur when soft
const contrast = baseContrast * sharpness;     // Less contrast when soft
```

### The Three Atmospheric Effects (All Required)

| Effect | Near | Far |
|--------|------|-----|
| Color | Saturated, warm | Desaturated, cool/blue |
| Contrast | High | Low |
| Edge sharpness | Sharp/found | Soft/lost |

**Our V5 mistake:** Everything drawn at same "focus depth" - all edges equally sharp.

---

## 6. ORGANIC SILHOUETTES

### The Old Way (Wrong)

```
"Draw a triangle for a tree"
"Draw a diagonal line for a mountain"
```

This produces geometric shapes, not natural forms.

### The New Way (Correct)

```
"Carve chaos into order"
NOT
"Draw perfect geometry"
```

### Silhouette-First Approach

1. **Start with chaos** - Blobs, noise, random shapes
2. **Carve into it** - Remove to reveal form
3. **Add rhythm** - Big → Medium → Small shapes
4. **Avoid symmetry** - Nature is asymmetric

### The Rhythm Rule

Good silhouettes have **rhythm**: Big → Medium → Small shapes

```
❌ BAD TREE SILHOUETTE (no rhythm):
     ▲
    ▲▲▲
   ▲▲▲▲▲
     │

✅ GOOD TREE SILHOUETTE (has rhythm):
       ◢█◣
     ◢██◣ ◢◣
   ◢███◣◢██◣
  ◢█████████◣
      ██
```

### Canvas Implementation

```javascript
function buildOrganicSilhouette(ctx, baseX, baseY, width, height, seed) {
    // Start with overlapping blobs (chaos)
    const blobs = [];
    const blobCount = 15 + Math.floor(seededRandom(seed) * 10);
    
    for (let i = 0; i < blobCount; i++) {
        const t = i / blobCount;
        // Big shapes at base, small at top (rhythm)
        const sizeMultiplier = 1 - t * 0.7;
        
        blobs.push({
            x: baseX + (seededRandom(seed + i * 2) - 0.5) * width * sizeMultiplier,
            y: baseY - height * t,
            radius: (10 + seededRandom(seed + i * 2 + 1) * 30) * sizeMultiplier,
            // Uneven spacing (avoid symmetry)
            offsetX: (seededRandom(seed + i * 3) - 0.5) * 20
        });
    }
    
    // Draw blobs with soft edges
    for (const blob of blobs) {
        const grad = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.radius
        );
        grad.addColorStop(0, 'rgba(34, 50, 34, 1)');
        grad.addColorStop(0.7, 'rgba(34, 50, 34, 0.8)');
        grad.addColorStop(1, 'rgba(34, 50, 34, 0)');  // Soft edge!
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x + blob.offsetX, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

---

## 7. LIGHT AS DISTRIBUTION

### The Rule

```
╔═══════════════════════════════════════════════════════════╗
║  LIGHT IS NOT A SHAPE. IT IS A DISTRIBUTION.             ║
║                                                           ║
║  No bright object ends abruptly.                          ║
╚═══════════════════════════════════════════════════════════╝
```

### What This Means

The sun reflection in V5 used hard circles. Wrong.

Light should be:
- Radial gradients
- Alpha falloff
- Additive blending
- Energy that dissipates

### Canvas Implementation

```javascript
// ❌ WRONG - Hard circle
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fillStyle = '#ffff00';
ctx.fill();

// ✅ RIGHT - Energy distribution
function drawLightDistribution(ctx, x, y, intensity, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';  // Additive!
    
    // Multiple falloff layers
    const layers = [
        { radiusMult: 3.0, alpha: 0.05 },
        { radiusMult: 2.0, alpha: 0.10 },
        { radiusMult: 1.5, alpha: 0.15 },
        { radiusMult: 1.0, alpha: 0.25 },
        { radiusMult: 0.5, alpha: 0.40 }
    ];
    
    for (const layer of layers) {
        const r = intensity * layer.radiusMult;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, ColorUtils.withAlpha(color, layer.alpha));
        grad.addColorStop(0.5, ColorUtils.withAlpha(color, layer.alpha * 0.5));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
```

### Sun Reflection on Water (Corrected)

```javascript
// Each sparkle is a distribution, not a circle
function drawWaterSparkle(ctx, x, y, intensity) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, intensity * 3);
    grad.addColorStop(0, 'rgba(255, 255, 240, 0.8)');
    grad.addColorStop(0.3, 'rgba(255, 240, 200, 0.4)');
    grad.addColorStop(0.6, 'rgba(255, 220, 150, 0.15)');
    grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, intensity * 3, 0, Math.PI * 2);
    ctx.fill();
}
```

---

## 8. CANVAS IMPLEMENTATION PATTERNS

### Pattern 1: Probability-Based Drawing

```javascript
// Instead of drawing a shape, accumulate probability
function accumulateForm(ctx, bounds, colorFunc, densityFunc) {
    const { x, y, width, height } = bounds;
    const resolution = 4;  // Pixels per sample
    
    for (let py = y; py < y + height; py += resolution) {
        for (let px = x; px < x + width; px += resolution) {
            const density = densityFunc(px, py);
            
            if (Math.random() < density) {
                const color = colorFunc(px, py);
                const size = resolution * (0.5 + density * 0.5);
                
                // Soft blob, not hard pixel
                const grad = ctx.createRadialGradient(px, py, 0, px, py, size);
                grad.addColorStop(0, color);
                grad.addColorStop(1, ColorUtils.withAlpha(color, 0));
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}
```

### Pattern 2: Edge Uncertainty Function

```javascript
// Replace all lineTo with this
function uncertainLineTo(ctx, x, y, uncertainty = 5) {
    const current = ctx.getTransform();  // Would need tracking
    const jitterX = (Math.random() - 0.5) * uncertainty;
    const jitterY = (Math.random() - 0.5) * uncertainty;
    ctx.lineTo(x + jitterX, y + jitterY);
}

// Better: Pre-generate uncertain path
function createUncertainPath(points, uncertainty) {
    return points.map((p, i) => {
        // More uncertainty in middle, less at endpoints
        const edgeFactor = Math.sin((i / (points.length - 1)) * Math.PI);
        const jitter = uncertainty * edgeFactor;
        
        return {
            x: p.x + (Math.random() - 0.5) * jitter,
            y: p.y + (Math.random() - 0.5) * jitter
        };
    });
}
```

### Pattern 3: Value Bridge Generator

```javascript
function createValueBridge(colorA, colorB, steps = 5) {
    const bridge = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        bridge.push({
            color: ColorUtils.blend(colorA, colorB, t),
            position: t,
            // Scatter increases in middle of transition
            scatter: Math.sin(t * Math.PI) * 0.5
        });
    }
    return bridge;
}

function applyValueBridge(ctx, bridge, x, yStart, yEnd, width) {
    const height = yEnd - yStart;
    
    for (const step of bridge) {
        const y = yStart + height * step.position;
        const scatter = step.scatter * height;
        
        // Draw scattered band
        for (let i = 0; i < 20; i++) {
            const blobX = x + (Math.random() - 0.5) * width;
            const blobY = y + (Math.random() - 0.5) * scatter;
            const size = 3 + Math.random() * 8;
            
            drawSoftBlob(ctx, blobX, blobY, size, step.color);
        }
    }
}
```

### Pattern 4: Depth-Aware Edge

```javascript
function drawDepthAwareEdge(ctx, points, depth, color) {
    const sharpness = getEdgeSharpness(depth);
    const jitter = 30 * (1 - sharpness);  // More jitter when far
    const alpha = 0.3 + sharpness * 0.7;   // More transparent when far
    
    // Create uncertain path
    const uncertainPoints = createUncertainPath(points, jitter);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 + (1 - sharpness) * 2;  // Thicker when far (softer)
    
    ctx.beginPath();
    ctx.moveTo(uncertainPoints[0].x, uncertainPoints[0].y);
    for (let i = 1; i < uncertainPoints.length; i++) {
        ctx.lineTo(uncertainPoints[i].x, uncertainPoints[i].y);
    }
    ctx.stroke();
    ctx.restore();
}
```

---

## 9. BEFORE/AFTER EXAMPLES

### Mountain Ridge

```javascript
// ❌ BEFORE (V5)
const ridge = organicCurve(x1, y1, x2, y2, 16, 22, seed);
ctx.beginPath();
ctx.moveTo(ridge[0].x, ridge[0].y);
for (const p of ridge) ctx.lineTo(p.x, p.y);
ctx.fill();
// Result: Slightly wobbly but still a clear LINE

// ✅ AFTER (V6)
// Don't draw a line at all - accumulate the ridge
function accumulateMountainRidge(ctx, x1, y1, x2, y2, depth) {
    const sharpness = getEdgeSharpness(depth);
    const layers = 8;
    
    for (let layer = 0; layer < layers; layer++) {
        const layerAlpha = (1 - layer / layers) * 0.3;
        const layerJitter = 15 + layer * 10;
        
        ctx.globalAlpha = layerAlpha * sharpness;
        
        // Scatter blobs along ridge
        for (let i = 0; i < 50; i++) {
            const t = i / 50;
            const x = lerp(x1, x2, t);
            const y = lerp(y1, y2, t) + (Math.random() - 0.5) * layerJitter;
            
            drawSoftBlob(ctx, x, y, 5 + Math.random() * 10, ridgeColor);
        }
    }
}
// Result: Ridge EMERGES from accumulated uncertainty
```

### Snow Line

```javascript
// ❌ BEFORE (V5)
// Snow shape with hard boundary, gradient fill
ctx.fillStyle = snowGradient;
ctx.beginPath();
for (const p of snowPoints) ctx.lineTo(p.x, p.y);
ctx.fill();

// ✅ AFTER (V6)
// Snow INVADES rock through scattered patches
function accumulateSnow(ctx, mountainShape, snowLine) {
    // Dense snow above snowLine
    for (let y = peakY; y < snowLine; y += 3) {
        const density = 0.9;
        scatterSnowAtY(ctx, y, density, mountainShape);
    }
    
    // Transition zone - snow patches invading rock
    const transitionHeight = 60;
    for (let y = snowLine; y < snowLine + transitionHeight; y += 3) {
        const t = (y - snowLine) / transitionHeight;
        const density = 0.9 * (1 - t * t);  // Quadratic falloff
        scatterSnowAtY(ctx, y, density, mountainShape);
    }
    
    // Sparse patches below transition
    for (let i = 0; i < 30; i++) {
        const y = snowLine + transitionHeight + Math.random() * 50;
        if (Math.random() < 0.3) {
            scatterSnowAtY(ctx, y, 0.2, mountainShape);
        }
    }
}
```

---

## 10. CANVAS EDGE TOOLKIT

**Three core functions that replace traditional drawing. These are hostile to straight lines by default.**

### 10.1 Noisy Path Generator (Replace lineTo Forever)

Every "edge" becomes a band of variation, not a line.

```javascript
function noisyLine(ctx, points, {
    jitter = 8,
    steps = 12,
    smooth = true
} = {}) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        
        for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const x = a.x + (b.x - a.x) * t + (Math.random() - 0.5) * jitter;
            const y = a.y + (b.y - a.y) * t + (Math.random() - 0.5) * jitter;
            ctx.lineTo(x, y);
        }
    }
    
    if (smooth) ctx.closePath();
}

// Usage - Drawing a mountain ridge
noisyLine(ctx, [
    { x: 0, y: 400 },
    { x: 300, y: 150 },  // Peak
    { x: 600, y: 400 }
], { jitter: 12, steps: 20 });
ctx.fill();
```

**Rule:** Straight edges are illegal. Every path must include jitter.

### 10.2 Feathered Fill (Soft Edge Replacement)

No fill should end abruptly. Multiple offset passes create natural fade.

```javascript
function featheredFill(ctx, drawShape, {
    layers = 6,
    spread = 10,
    alpha = 0.15
} = {}) {
    for (let i = layers; i >= 1; i--) {
        ctx.save();
        ctx.globalAlpha = alpha / i;
        ctx.translate(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
        );
        drawShape(ctx);
        ctx.restore();
    }
}

// Usage - Soft snow edge
featheredFill(ctx, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, snowLine, width, 50);
}, { layers: 8, spread: 15 });
```

**Use for:** Snow edges, shorelines, grass borders, tree silhouettes, clouds, reflections.

### 10.3 Scatter Brush (Nature's Secret Weapon)

Replace borders with probability zones.

```javascript
function scatter(ctx, {
    x, y, width, height,
    count = 100,
    radius = [1, 4],
    color,
    seed = Math.random() * 10000
} = {}) {
    ctx.fillStyle = color;
    
    for (let i = 0; i < count; i++) {
        const r = radius[0] + seededRandom(seed + i) * (radius[1] - radius[0]);
        ctx.beginPath();
        ctx.arc(
            x + seededRandom(seed + i * 2) * width,
            y + seededRandom(seed + i * 2 + 1) * height,
            r,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Usage - Transition zone
scatter(ctx, {
    x: 0, y: snowLine - 20,
    width: canvasWidth, height: 40,
    count: 300,
    radius: [2, 6],
    color: 'rgba(255, 255, 255, 0.7)'
});
```

**Rule:** Every transition zone must include scatter. No exceptions.

---

## 11. NATURE PRIMITIVES LIBRARY

Drop-in systems for common natural elements. These are building blocks, not illustrations.

### 11.1 Mountain Ridge Generator

```javascript
function drawMountain(ctx, baseY, peaks, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    
    peaks.forEach(p => {
        noisyLine(ctx, [
            { x: p.x - p.width, y: baseY },
            { x: p.x, y: p.y },
            { x: p.x + p.width, y: baseY }
        ], { jitter: 12 });
    });
    
    ctx.lineTo(canvasWidth, baseY);
    ctx.closePath();
    ctx.fill();
}

// Usage
drawMountain(ctx, HORIZON, [
    { x: 200, y: 150, width: 180 },
    { x: 450, y: 120, width: 220 },
    { x: 650, y: 180, width: 150 }
], '#4a5a6a');
```

**Rules:**
- Peaks vary in width
- Ridge never moves in a straight diagonal
- Overlap mountains for depth

### 11.2 Snow Cap (No Horizontal Lines)

```javascript
function snowCap(ctx, ridgeY, width, mountainShape) {
    // Snow INVADES rock - never "meets" it
    featheredFill(ctx, (ctx) => {
        scatter(ctx, {
            x: 0,
            y: ridgeY - 30,
            width: width,
            height: 50,
            count: 200,
            radius: [2, 6],
            color: 'rgba(255, 255, 255, 0.9)'
        });
    }, { layers: 4, spread: 8 });
    
    // Scattered patches below main snow
    scatter(ctx, {
        x: 0, y: ridgeY + 20,
        width: width, height: 60,
        count: 50,
        radius: [1, 3],
        color: 'rgba(255, 255, 255, 0.5)'
    });
}
```

### 11.3 Tree Silhouette Generator (No Triangles)

```javascript
function drawTree(ctx, x, y, height, color = '#2e4f2f') {
    const layers = Math.floor(height / 15);
    
    // Trees are stacks of chaos, not geometry
    for (let i = 0; i < layers; i++) {
        const layerWidth = height * 0.6 * (1 - i * 0.05);
        scatter(ctx, {
            x: x - layerWidth / 2,
            y: y - i * 12,
            width: layerWidth,
            height: 12,
            count: 20,
            radius: [2, 5],
            color: color
        });
    }
}

// Forest as accumulated trees
function drawForest(ctx, baseY, count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvasWidth;
        const height = 40 + Math.random() * 60;
        const depth = (baseY - (baseY - 100)) / 100;  // 0 = back, 1 = front
        const color = lerpColor('#5a6a5a', '#1a2a1a', depth);
        drawTree(ctx, x, baseY, height, color);
    }
}
```

### 11.4 Shoreline Transition (No Edge)

```javascript
function shoreline(ctx, y, width) {
    // Water → wet sand → dry sand
    // Never water → land directly
    
    // Wet zone
    scatter(ctx, {
        x: 0, y: y - 15,
        width: width, height: 30,
        count: 200,
        radius: [1, 3],
        color: 'rgba(60, 80, 100, 0.4)'  // Water-tinted
    });
    
    // Transition zone
    scatter(ctx, {
        x: 0, y: y - 5,
        width: width, height: 20,
        count: 300,
        radius: [1, 3],
        color: 'rgba(200, 180, 140, 0.6)'  // Wet sand
    });
    
    // Dry zone bleed
    scatter(ctx, {
        x: 0, y: y + 10,
        width: width, height: 25,
        count: 150,
        radius: [1, 2],
        color: 'rgba(220, 200, 160, 0.4)'  // Dry sand
    });
}
```

### 11.5 Sun & Reflection (Energy, Not Shape)

```javascript
function glow(ctx, x, y, radius, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(0.3, color.replace('1)', '0.5)'));
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function sunWithGlow(ctx, x, y) {
    // Outer glow layers (additive)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, 200, 'rgba(255, 200, 100, 0.1)');
    glow(ctx, x, y, 120, 'rgba(255, 180, 80, 0.15)');
    glow(ctx, x, y, 60, 'rgba(255, 160, 60, 0.2)');
    ctx.restore();
    
    // Core
    glow(ctx, x, y, 40, 'rgba(255, 255, 240, 1)');
}
```

---

## 12. SELF-AUDIT SYSTEM

**The agent must police itself. Run these checks after every draw operation.**

### 12.1 Edge Audit Rules

#### ❌ ILLEGAL (Auto-reject)

| Violation | Threshold | Action |
|-----------|-----------|--------|
| `lineTo()` without jitter | > 15px straight | REJECT |
| Single-pass fill touching contrasting color | Any occurrence | REJECT |
| Fully opaque edges on natural elements | alpha = 1.0 at edge | REJECT |
| Constant-angle segments | > 15px at same angle | REJECT |
| Ruler-traceable silhouette | Any natural element | REJECT |

#### ✅ REQUIRED (Must be present)

| Requirement | Where | Verification |
|-------------|-------|--------------|
| Edge noise | All natural contours | Visual inspection |
| Alpha falloff | All edges except focal hard edges | Check gradient stops |
| Shape overlap | Multi-element compositions | Elements must intersect |
| Scatter or gradient blending | All transition zones | No color-to-color contact |

### 12.2 Validator Pseudocode

```javascript
function validateEdge(pathSegments) {
    for (let seg of pathSegments) {
        // Straight line detection
        if (seg.length > 15 && seg.angleVariance < 0.1) {
            return { pass: false, reason: 'Straight edge detected', segment: seg };
        }
        
        // Constant angle detection
        if (seg.angles.every(a => Math.abs(a - seg.angles[0]) < 0.05)) {
            return { pass: false, reason: 'Constant angle segment', segment: seg };
        }
    }
    return { pass: true };
}

function validateTransitions(colorZones) {
    for (let i = 0; i < colorZones.length - 1; i++) {
        const gap = colorZones[i + 1].start - colorZones[i].end;
        if (gap < 5) {  // Less than 5px transition
            return { pass: false, reason: 'Colors touching directly', zones: [i, i+1] };
        }
    }
    return { pass: true };
}
```

### 12.3 Mental Checklist (Run Every Time)

Before calling any art "done":

```
□ Can I trace ANY edge with a ruler?  → If yes, add jitter
□ Do any two colors touch directly?   → If yes, add scatter zone
□ Are distant edges as sharp as near? → If yes, soften far edges
□ Does any light source end abruptly? → If yes, add falloff
□ Can I point to where X ends and Y begins? → If yes, blur boundary
```

---

## 13. V6 LESSONS LEARNED (Cautionary Tale)

**What happens when you understand theory but not balance.**

### The Experiment

V6 was our first attempt to apply Edge Mastery principles. We replaced all `lineTo()` shapes with accumulated soft blobs.

### What Went Right ✅

1. **Paradigm shift visible** - Mountains built from overlapping shapes, not geometry
2. **Clouds genuinely good** - Soft blob accumulation creates believable forms
3. **Sky gradient works** - Natural atmospheric transition
4. **Sun glow proper** - Additive blending creates real light emission
5. **Core technique sound** - `drawSoftBlob()` with radial gradients is correct foundation

### What Went Wrong ❌

1. **Mountains became cotton candy** - Too soft, no structure, no readable form
2. **Lost the value structure** - Everything similar mid-tones, no dark/light contrast
3. **Snow zones invisible** - Value bridging concept right, but VALUES need contrast
4. **Water/lake unclear** - Can't identify water surface
5. **Foreground muddy** - No distinct ground plane or elements
6. **No focal point** - Nothing guides the eye

### The Core Mistake

> **We did "chaos" without "carving order back into it."**

The research said:
- "No hard edges" ✅ We did this
- "Found edges at focal points" ❌ We forgot this
- "Carve order from chaos" ❌ We only did chaos

### The Overcorrection Problem

| V5 Problem | V6 "Fix" | Actual Result |
|------------|----------|---------------|
| Too hard (ruler-traceable) | Made everything soft | Lost all structure |
| Geometric shapes | Removed all shapes | Nothing is identifiable |
| Clear but artificial | Organic but formless | Can't see anything |

### Key Insight: The Two-Phase Process

```
PHASE 1: Create chaos
- Soft blobs
- Overlapping forms  
- Probability placement
- Value bridging

PHASE 2: Carve order (WE SKIPPED THIS)
- Establish value structure (darks, mids, lights)
- Add found edges at focal points
- Create readable silhouettes
- Define key contours (still organic, but present)
```

### What V7 Must Do Differently

1. **Value structure FIRST** - Block in dark/mid/light before any texture
2. **Soft blobs for TEXTURE, not FORM** - Overall shapes can have definition
3. **Selective hard edges** - Ridgelines, focal points need sharpness
4. **Squint test** - Must identify mountain/lake/trees when squinting
5. **Contrast hierarchy** - Focal point = highest contrast

### The Balance We Need

```
Edge Distribution Target (Revised):
┌─────────────────────────────────────────┐
│ Lost edges (dissolving)    │ 20-25%    │
│ Soft edges (nature)        │ 40-50%    │
│ Found edges (selective)    │ 20-30%    │
│ Hard edges (focal/man-made)│ 5-10%     │
└─────────────────────────────────────────┘

V6 was: 95% lost, 5% soft, 0% found, 0% hard
We need the FULL spectrum, not just one end.
```

---

## 14. QUICK VALIDATION CHECKLIST

Use this after completing any art:

### Edge Check (Most Critical)
- [ ] Can ANY edge be traced with a ruler? → If yes, FIX IT
- [ ] Are distant edges softer than near edges?
- [ ] Do forms dissolve into each other (lost edges present)?
- [ ] Is there at least one found edge at focal point?
- [ ] Did you do Phase 2 (carving order from chaos)?

### Value Structure Check (NEW - From V6 Lesson)
- [ ] Are there clear darks, mids, and lights?
- [ ] Does the focal point have highest contrast?
- [ ] Can you identify elements when squinting?
- [ ] Is there a readable silhouette underneath the texture?

### Value Bridging Check
- [ ] Does any color directly touch another color? → Add transition zone
- [ ] Are transitions zones, not lines?
- [ ] Do scattered elements bridge boundaries?

### Silhouette Check
- [ ] Do silhouettes have rhythm (big→medium→small)?
- [ ] Are silhouettes asymmetric?
- [ ] Were silhouettes built from chaos, not geometry?

### Light Check
- [ ] Is every light source a distribution, not a shape?
- [ ] Do bright areas fade to zero, not stop abruptly?
- [ ] Are glows using additive (`lighter`) blending?

### The Ultimate Test
Show the image to someone and ask:
> "Point to where one thing ends and another begins."

If they can point precisely → You have hard edges to fix.
If they gesture vaguely → You've achieved natural edges.

---

## RESOURCES

### Primary Sources (Read These)

1. **James Gurney - Edges** - The definitive guide to edge types
   - https://gurneyjourney.blogspot.com/search/label/edges

2. **Proko - Contour Drawing** - Why lines aren't straight
   - https://www.proko.com/lesson/contour-line-drawing

3. **Will Kemp Art School - Hard and Soft Edges** - Practical application
   - https://willkempartschool.com/hard-and-soft-edges-in-drawing-and-painting/

4. **FZD School - Silhouette Design** - Building shapes correctly
   - https://www.youtube.com/watch?v=4LhcNbFMkTw

5. **Draw Paint Academy - Atmospheric Perspective** - Distance effects
   - https://drawpaintacademy.com/atmospheric-perspective/

6. **Ctrl+Paint - Light and Rendering** - Light as distribution
   - https://www.ctrlpaint.com/library

---

*Last Updated: January 6, 2026*
*Version 2.0 - Added Canvas Edge Toolkit, Nature Primitives, Self-Audit System, and V6 Lessons Learned*
*This document represents a paradigm shift in our approach to visual art.*
