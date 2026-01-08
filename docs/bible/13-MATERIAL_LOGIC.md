# 🎨 MATERIAL LOGIC - Form Before Atmosphere

**Purpose:** Bridge edge theory with material reality - why rocks aren't clouds  
**When to Read:** After understanding Edge Mastery, before attempting realistic scenes  
**Priority:** CRITICAL - This is the missing layer between theory and realism

> ⚠️ **V7 WARNING - REFERENCE, NOT RECIPE**
> 
> This document is a **reference library**, not a mandate to use everything.
> V7 applied all techniques from this doc and produced **worse results than V5**.
> 
> **BEFORE using any technique, ask:**
> 1. What SPECIFIC problem am I solving?
> 2. Can I see this problem in the current render?
> 3. Will this ONE technique fix it?
> 
> If you can't answer all three, don't add the technique.
> See [16-TECHNIQUE_SELECTION.md](./16-TECHNIQUE_SELECTION.md) for decision framework.

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | V6 diagnosis - "abstract/dreamlike" problem |
<!-- END METADATA -->

**Related Documents:**
- [DECISION_GRAPH.md](./DECISION_GRAPH.md) - Use interrogation framework (Q3-Q5) to determine material/age/environment properties
- [24-REALISM_DEGRADATION.md](./24-REALISM_DEGRADATION.md) - Degradation states and weathering (Section VII)
- [12-EDGE_MASTERY.md](./12-EDGE_MASTERY.md) - Edge theory foundation (read first)
- [10-ART_FUNDAMENTALS.md](./10-ART_FUNDAMENTALS.md) - Value and composition
- [11-CANVAS_PATTERNS.md](./11-CANVAS_PATTERNS.md) - Implementation patterns
- **[14-CANVAS_IMPLEMENTATION_PATTERNS.md](./14-CANVAS_IMPLEMENTATION_PATTERNS.md) - Production code (read next)**
- **[15-REALISM_VALIDATION.md](./15-REALISM_VALIDATION.md) - Automated testing (use to validate)**

---

## 🚨 THE CORE PROBLEM (V6 Diagnosis)

### Why V6 Looked Abstract/Dreamlike

```
We treated:
  • rock
  • trees
  • snow
  • clouds

...as THE SAME SUBSTANCE with different colors.
```

**Result:** Everything had the same softness frequency → abstract foam, not nature.

### What's Working vs What's Missing

| Working ✅ | Missing ❌ |
|-----------|-----------|
| Soft gradients | Material logic |
| No ruler-straight edges | Form hierarchy |
| Atmospheric depth | Mass → Structure → Detail order |
| Value separation | Edge selectivity per material |

**The Key Insight:**

> "Softness is not realism. Material logic creates realism."

---

## TABLE OF CONTENTS

1. [The Three-Layer System](#1-the-three-layer-system)
2. [Material Properties Matrix](#2-material-properties-matrix)
3. [Form Hierarchy: Mass → Structure → Detail](#3-form-hierarchy-mass--structure--detail)
4. [Material-Specific Edge Behavior](#4-material-specific-edge-behavior)
5. [Light Response by Material](#5-light-response-by-material)
6. [Texture Frequency by Material](#6-texture-frequency-by-material)
7. [Coherent Noise vs Random Noise](#7-coherent-noise-vs-random-noise)
8. [The Order: Form → Material → Atmosphere](#8-the-order-form--material--atmosphere)
9. [Photo Deconstruction Exercise](#9-photo-deconstruction-exercise)
10. [Canvas Implementation](#10-canvas-implementation)
11. [Material-Specific Primitives](#11-material-specific-primitives)
12. [Validation Checklist](#12-validation-checklist)

---

## 1. THE THREE-LAYER SYSTEM

This is the structure V6 was missing.

### Layer 1: FORM (Missing in V6)

```
Establish volumes and planes
Define primary/secondary/tertiary structure
NO TEXTURE YET

Think: "What shape is this thing?"
```

### Layer 2: MATERIAL (Missing in V6)

```
Apply material-specific edge behavior
Apply material-specific light response  
Apply material-specific texture frequency

Think: "What is this thing made of?"
```

### Layer 3: ATMOSPHERE (V6 had ONLY this)

```
Distance-based softening
Haze and glow
Final edge dissolving

Think: "How far away is this thing?"
```

### The V6 Problem

```
❌ V6 Approach:
   Atmosphere INSTEAD OF form
   (Drew soft blobs hoping they'd look like mountains)

✅ Correct Approach:
   1. Draw mountain FORM (solid mass)
   2. Apply rock MATERIAL behavior
   3. Add atmospheric distance fade
```

---

## 2. MATERIAL PROPERTIES MATRIX

Each material has distinct behavior across four dimensions.

### The Matrix

| Material | Edge Character | Light Response | Texture Freq | Softness Mix |
|----------|----------------|----------------|--------------|--------------|
| **Rock** | Hard planes, soft erosion | Diffuse, matte | Low-medium | 70% hard, 30% soft |
| **Snow** | Soft accumulation, hard crust | Specular, bright | Very high | 20% hard, 80% soft |
| **Trees** | Clustered masses, soft outer | Diffuse, dark | High | 40% hard, 60% soft |
| **Clouds** | All lost edges | Volume scatter | Medium | 0% hard, 100% soft |
| **Water** | Hard surface line | Specular, mirror | Low surface, high ripple | 60% hard, 40% soft |
| **Grass** | Soft mass, sharp blades | Diffuse, varied | Very high | 30% hard, 70% soft |

### Why This Matters

**V6 gave everything ~5% hard, 95% soft.**

That's why it looked abstract - no material differentiation.

### Canvas Properties Object

```javascript
const MATERIAL_PROPERTIES = {
    rock: {
        edgeHardness: 0.7,        // Planes create sharp breaks
        edgeSoftness: 0.3,        // Erosion rounds corners
        textureFreq: 0.3,         // Few large cracks/facets
        lightResponse: 'diffuse',
        reflectivity: 0.1,
        roughness: 0.8
    },
    
    snow: {
        edgeHardness: 0.2,        // Mostly accumulation
        edgeSoftness: 0.8,        // Drifts and soft piles
        textureFreq: 0.9,         // Crystalline sparkle
        lightResponse: 'specular',
        reflectivity: 0.7,
        roughness: 0.2
    },
    
    foliage: {
        edgeHardness: 0.4,        // Cluster cores
        edgeSoftness: 0.6,        // Leaf masses
        textureFreq: 0.8,         // Chaotic leaves
        lightResponse: 'diffuse-dark',
        reflectivity: 0.05,
        roughness: 0.9
    },
    
    cloud: {
        edgeHardness: 0.0,        // No hard edges
        edgeSoftness: 1.0,        // All lost
        textureFreq: 0.4,         // Wispy variation
        lightResponse: 'volume-scatter',
        reflectivity: 0.3,
        roughness: 0.1
    },
    
    water: {
        edgeHardness: 0.6,        // Surface boundary
        edgeSoftness: 0.4,        // Reflection blur
        textureFreq: 0.6,         // Ripples
        lightResponse: 'specular-mirror',
        reflectivity: 0.8,
        roughness: 0.1
    }
};
```

---

## 3. FORM HIERARCHY: Mass → Structure → Detail

**The order matters. V6 skipped straight to detail.**

### Primary Forms (Draw First)

```
Mountain MASSES
- Big solid shapes
- Ignore ridges, ignore snow, ignore trees
- Just: "There is a mountain-shaped volume here"

Think silhouette blocks, not details.
```

**Canvas Implementation:**

```javascript
// PRIMARY - Mountain mass
function drawMountainMass(ctx, baseY, peaks) {
    ctx.fillStyle = '#4a5a6a';  // Single solid color
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    
    peaks.forEach(p => {
        // Simple, bold shapes - NO TEXTURE
        ctx.lineTo(p.x - p.width, baseY);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(p.x + p.width, baseY);
    });
    
    ctx.lineTo(canvasWidth, baseY);
    ctx.closePath();
    ctx.fill();
}
```

### Secondary Forms (Add Next)

```
Ridges, valleys, major folds
- Structure that defines the mass
- Still no detail - just major breaks in the form

Think: Where does light hit? Where is shadow?
```

**Canvas Implementation:**

```javascript
// SECONDARY - Ridge structure
function addRidgeStructure(ctx, mountain) {
    // Add major planes with value change
    ctx.fillStyle = darken(mountain.color, 20);  // Shadow side
    
    // Draw major facets
    drawMajorFacets(ctx, mountain.ridgeLine);
}
```

### Tertiary Forms (Add Last)

```
Rocks, trees, snow patches, erosion
- The details that sit ON TOP of structure
- This is where material logic applies

Think: What is this surface made of?
```

**Canvas Implementation:**

```javascript
// TERTIARY - Surface detail
function addSurfaceDetail(ctx, mountain) {
    // NOW apply material-specific texture
    addRockCracks(ctx, mountain, MATERIAL_PROPERTIES.rock);
    addSnowPatches(ctx, mountain, MATERIAL_PROPERTIES.snow);
    addErosionTexture(ctx, mountain);
}
```

### The Rule

```
╔════════════════════════════════════════════════╗
║  NEVER TEXTURE SOMETHING WITHOUT FORM FIRST   ║
║                                                ║
║  Primary   → "What shape is it?"              ║
║  Secondary → "How is it structured?"          ║
║  Tertiary  → "What is it made of?"            ║
║  Final     → "How far away is it?"            ║
╚════════════════════════════════════════════════╝
```

---

## 4. MATERIAL-SPECIFIC EDGE BEHAVIOR

Not all edges follow the same rules.

### Rock Edges

**Characteristics:**
- Hard breaks at plane changes
- Soft erosion at old edges
- Cracks are SHARP (found edges)
- Weathering is SOFT (lost edges)

```javascript
function rockEdge(ctx, x1, y1, x2, y2, age = 0.5) {
    // Young rock = sharp
    // Old rock = eroded
    
    const sharpness = 1.0 - age * 0.6;  // 0.4-1.0 range
    
    // Planes have hard breaks
    if (isPlaneChange(x1, y1, x2, y2)) {
        drawEdge(ctx, x1, y1, x2, y2, { 
            jitter: 2, 
            sharpness: 0.9 
        });
    }
    // Erosion is soft
    else {
        drawEdge(ctx, x1, y1, x2, y2, { 
            jitter: 8, 
            sharpness: sharpness 
        });
    }
}
```

### Tree/Foliage Edges

**Characteristics:**
- Cluster cores are FIRM (not hard, but defined)
- Outer silhouette is SOFT
- Interior has hard stems/branches
- Cannot trace outline cleanly

```javascript
function foliageEdge(ctx, cluster) {
    // Core structure - firmer edges
    drawClusterCore(ctx, cluster, { sharpness: 0.6 });
    
    // Outer foliage - very soft
    drawClusterOuter(ctx, cluster, { sharpness: 0.2 });
    
    // Scattered individual leaves/needles (hard elements)
    scatterSharpDetails(ctx, cluster, { count: 20, sharpness: 0.9 });
}
```

### Snow Edges

**Characteristics:**
- Top surface can be CRUSTY (hard)
- Sides are ACCUMULATED (soft)
- Melting edges are VERY soft
- Shadows on snow are DIFFUSE

```javascript
function snowEdge(ctx, region, temperature = 0.5) {
    // Cold = crusty top
    if (temperature < 0.3) {
        drawTopCrust(ctx, region, { sharpness: 0.7 });
    }
    
    // Accumulated sides - always soft
    drawSnowAccumulation(ctx, region, { sharpness: 0.2 });
    
    // Melting transitions - very soft
    if (temperature > 0.7) {
        drawMeltZone(ctx, region, { sharpness: 0.1 });
    }
}
```

### Cloud Edges

**Characteristics:**
- ALL lost edges
- No hard breaks ever
- Denser core, fading edge
- Volume, not surface

```javascript
function cloudEdge(ctx, cloud) {
    // Clouds are the EXCEPTION - all soft, all the time
    drawVolumeForm(ctx, cloud, {
        coreOpacity: 0.8,
        edgeOpacity: 0.0,
        falloffCurve: 'smooth'  // Never linear
    });
}
```

---

## 5. LIGHT RESPONSE BY MATERIAL

How light interacts defines material identity.

### Diffuse Materials (Rock, Trees, Dirt)

Light scatters in all directions.

```javascript
function applyDiffuseLight(ctx, surface, lightDir) {
    // Calculate how much surface faces light
    const facing = dot(surface.normal, lightDir);
    
    if (facing > 0) {
        // Lit side - gradual falloff
        const brightness = facing * 0.6 + 0.4;  // Never pure black
        surface.color = lighten(surface.baseColor, brightness * 30);
    } else {
        // Shadow side - still receives ambient
        surface.color = darken(surface.baseColor, 20);
    }
    
    // NO SPECULAR HIGHLIGHTS
}
```

**Key:** Matte surfaces have NO bright spots, just gentle gradation.

### Specular Materials (Snow, Water, Ice)

Light reflects in specific directions.

```javascript
function applySpecularLight(ctx, surface, lightDir, viewDir) {
    // Base diffuse
    applyDiffuseLight(ctx, surface, lightDir);
    
    // Add specular highlight
    const reflection = reflect(lightDir, surface.normal);
    const spec = Math.pow(Math.max(0, dot(reflection, viewDir)), 
                          surface.roughness);
    
    if (spec > 0.3) {
        // Bright highlights on snow/water
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255, 255, 255, ${spec * 0.4})`;
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}
```

**Key:** Shiny surfaces have bright spots where reflection angle matches view.

### Volume Scatter (Clouds, Fog)

Light penetrates and scatters internally.

```javascript
function applyVolumeLight(ctx, cloud, lightPos) {
    // Clouds are lit from within
    const distToLight = distance(cloud.center, lightPos);
    const transmission = Math.exp(-distToLight / 200);  // Exponential falloff
    
    // Closer to light = brighter
    cloud.opacity = 0.6 + transmission * 0.4;
    cloud.color = lerpColor(cloud.baseColor, '#ffffff', transmission);
    
    // Edges fade more
    applyEdgeFade(ctx, cloud, transmission);
}
```

**Key:** Volume materials glow from within, not just on surface.

---

## 6. TEXTURE FREQUENCY BY MATERIAL

**V6 Problem:** Everything had the same texture density.

### Texture Frequency Scale

```
Low    → Big shapes, few details (distant mountains)
Medium → Visible variation (mid-ground rocks)
High   → Dense detail (grass, tree foliage)
Very High → Noise-like (snow crystals, distant trees)
```

### Material-Specific Frequencies

```javascript
const TEXTURE_FREQUENCY = {
    rock: {
        primary: 0.01,      // Large facets
        secondary: 0.05,    // Cracks
        tertiary: 0.2       // Surface roughness
    },
    
    snow: {
        primary: 0.8,       // Crystalline sparkle
        secondary: 0.3,     // Drift patterns
        tertiary: 0.1       // Large accumulation
    },
    
    foliage: {
        primary: 0.6,       // Leaf clusters
        secondary: 0.9,     // Individual leaves (when close)
        tertiary: 0.05      // Branch structure
    },
    
    cloud: {
        primary: 0.15,      // Wispy tendrils
        secondary: 0.3,     // Volume variation
        tertiary: 0.05      // Large masses
    }
};
```

### Application Rule

```
Distance matters:
  Far   → Use only PRIMARY frequency (low)
  Mid   → PRIMARY + SECONDARY
  Near  → PRIMARY + SECONDARY + TERTIARY
```

**Example:**

```javascript
function applyMaterialTexture(ctx, element, depth) {
    const material = MATERIAL_PROPERTIES[element.type];
    const freq = TEXTURE_FREQUENCY[element.type];
    
    // Always apply primary
    applyNoiseLayer(ctx, element, freq.primary);
    
    // Mid-distance adds secondary
    if (depth < 0.7) {
        applyNoiseLayer(ctx, element, freq.secondary);
    }
    
    // Near adds tertiary
    if (depth < 0.3) {
        applyNoiseLayer(ctx, element, freq.tertiary);
    }
}
```

---

## 7. COHERENT NOISE VS RANDOM NOISE

**V6 Problem:** Used `Math.random()` everywhere → "TV static" look.

### The Difference

```javascript
// ❌ Random Noise (V6)
function jitter() {
    return Math.random() * 10;  // White noise, no coherence
}

// Result: Sparkly static, unnatural

// ✅ Coherent Noise (Perlin/Simplex)
function jitter(x, y) {
    return perlinNoise(x * 0.05, y * 0.05) * 10;  // Smooth variation
}

// Result: Organic, flowing, natural
```

### Why Coherent Noise Matters

| Random | Coherent |
|--------|----------|
| Every pixel independent | Neighboring pixels related |
| No flow or direction | Natural flow patterns |
| Looks like TV static | Looks like wood grain, clouds, terrain |
| Good for: stars, sparkles | Good for: everything else |

### Simple Perlin Implementation

```javascript
// Simplified 2D Perlin noise
function perlinNoise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = fade(x);
    const v = fade(y);
    
    const a = p[X] + Y;
    const b = p[X + 1] + Y;
    
    return lerp(v,
        lerp(u, grad(p[a], x, y), grad(p[b], x - 1, y)),
        lerp(u, grad(p[a + 1], x, y - 1), grad(p[b + 1], x - 1, y - 1))
    );
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Permutation table (256 values, typically pre-generated)
const p = new Array(512);
// Initialize with shuffled 0-255 twice
```

### When to Use Each

```javascript
// Use Math.random() for:
- Star positions (want randomness)
- Particle spawn points
- Color variation (small amounts)

// Use Perlin noise for:
- Terrain shapes
- Cloud forms
- Tree placement
- Rock cracks
- Water ripples
- Any organic edge
```

---

## 8. THE ORDER: Form → Material → Atmosphere

**This is the pipeline V6 skipped.**

### Step-by-Step Process

#### Step 1: Establish Form (No Material Yet)

```javascript
function drawScene_Form() {
    // Block in solid masses - single colors, no texture
    drawMountainMass(ctx, HORIZON, peaks, '#4a5a6a');
    drawLakeShape(ctx, lakeTop, lakeBottom, '#2a4a6a');
    drawTreeMasses(ctx, treeline, '#3a4a3a');
    
    // Establish light/shadow with VALUE ONLY
    addLightShadowPlanes(ctx);  // No texture, just dark/light
}

// Output: Flat, but readable shapes with clear structure
```

#### Step 2: Apply Material Behavior

```javascript
function drawScene_Material() {
    // NOW add material-specific properties
    
    // Mountains get rock behavior
    applyMaterialTexture(ctx, mountains, MATERIAL_PROPERTIES.rock);
    applyMaterialLight(ctx, mountains, 'diffuse');
    applyMaterialEdges(ctx, mountains, 'rock');
    
    // Water gets water behavior  
    applyMaterialTexture(ctx, lake, MATERIAL_PROPERTIES.water);
    applyMaterialLight(ctx, lake, 'specular-mirror');
    applyMaterialEdges(ctx, lake, 'water');
    
    // Trees get foliage behavior
    applyMaterialTexture(ctx, trees, MATERIAL_PROPERTIES.foliage);
    applyMaterialLight(ctx, trees, 'diffuse-dark');
    applyMaterialEdges(ctx, trees, 'foliage');
}

// Output: Materials look different from each other
```

#### Step 3: Add Atmospheric Distance

```javascript
function drawScene_Atmosphere() {
    // FINALLY apply depth effects
    
    forEach(element, scene) {
        const depth = element.z / maxDepth;
        
        // Soften distant edges
        element.edgeSharpness *= (1 - depth * 0.7);
        
        // Desaturate distant colors
        element.color = desaturate(element.color, depth * 0.4);
        
        // Fade distant contrast
        element.color = blend(element.color, HAZE_COLOR, depth * 0.5);
    }
    
    // Add atmospheric haze overlay
    addAtmosphericHaze(ctx, lightSource);
}

// Output: Depth and atmosphere without losing material identity
```

### The Complete Function

```javascript
function renderScene() {
    // Phase 1: FORM
    drawScene_Form();
    
    // Phase 2: MATERIAL  
    drawScene_Material();
    
    // Phase 3: ATMOSPHERE
    drawScene_Atmosphere();
    
    // Final: Edge refinement (carve order from chaos)
    refineEdges();
}
```

### Why This Order

```
Form without material → Clear but bland
Material without form → V6 problem (abstract)
Atmosphere without form or material → Undefined fog

Form + Material + Atmosphere → Realistic
```

---

## 9. PHOTO DECONSTRUCTION EXERCISE

**Anchor your work to reality.**

### The Exercise

1. Take a real landscape photo
2. Reduce it to:
   - **5 values** (dark, mid-dark, mid, mid-light, light)
   - **3 materials** (identify what they are)
   - **1 light source** (where is it?)
3. Rebuild procedurally following Form → Material → Atmosphere

### Reduction Process

```javascript
function deconstructPhoto(photo) {
    // Step 1: Extract 5 values
    const values = reduceToValues(photo, 5);
    
    // Step 2: Identify materials in photo
    const materials = {
        material1: 'rock',       // What is the main mountain?
        material2: 'snow',       // What are the white areas?
        material3: 'foliage'     // What are the dark areas?
    };
    
    // Step 3: Find light direction
    const lightDir = analyzeShadows(photo);
    
    return { values, materials, lightDir };
}
```

### Rebuild Process

```javascript
function rebuildFromDeconstruction(data) {
    // Use ONLY the 5 values you found
    const palette = {
        dark: data.values[0],
        midDark: data.values[1],
        mid: data.values[2],
        midLight: data.values[3],
        light: data.values[4]
    };
    
    // Build forms with these values
    drawForms(palette);
    
    // Apply material properties to forms
    applyMaterials(data.materials);
    
    // Match the light direction
    applyLighting(data.lightDir);
}
```

### Why This Prevents Abstraction

```
Photo reference:
  Forces real material combinations
  Shows actual light behavior
  Reveals texture frequency relationships
  Grounds edge decisions in reality

Result:
  Can't drift into pure abstraction
  Materials must behave correctly
  Validates your system
```

---

## 10. CANVAS IMPLEMENTATION

**⭐ For complete, production-ready code, see [14-CANVAS_IMPLEMENTATION_PATTERNS.md](./14-CANVAS_IMPLEMENTATION_PATTERNS.md)**

This section provides conceptual implementation guidance. For drop-in code with:
- Complete noise library (Perlin, Value, FBM)
- Full MATERIALS object
- Big Form Pass implementation
- All rendering patterns

...refer to the Canvas Implementation Patterns document.

Putting it all together.

### Material System Class

```javascript
class MaterialSystem {
    constructor() {
        this.materials = MATERIAL_PROPERTIES;
    }
    
    drawElement(ctx, element, depth) {
        // Phase 1: Form
        this.drawForm(ctx, element);
        
        // Phase 2: Material
        this.applyMaterial(ctx, element);
        
        // Phase 3: Atmosphere
        this.applyDepth(ctx, element, depth);
    }
    
    drawForm(ctx, element) {
        // Block in solid shape - no texture
        ctx.fillStyle = element.baseColor;
        this.fillShape(ctx, element.shape);
    }
    
    applyMaterial(ctx, element) {
        const mat = this.materials[element.materialType];
        
        // Material-specific edge treatment
        this.applyEdgeBehavior(ctx, element, mat);
        
        // Material-specific texture
        this.applyTextureFrequency(ctx, element, mat);
        
        // Material-specific light response
        this.applyLightResponse(ctx, element, mat);
    }
    
    applyDepth(ctx, element, depth) {
        // Atmospheric softening
        element.edgeSharpness *= (1 - depth * 0.7);
        
        // Color desaturation and haze
        element.color = this.applyAtmosphericPerspective(
            element.color, 
            depth
        );
    }
}
```

### Usage Example

```javascript
const materialSystem = new MaterialSystem();

function renderMountain(ctx, mountain, depth) {
    // Define the element
    const element = {
        materialType: 'rock',
        baseColor: '#4a5a6a',
        shape: mountain.geometry,
        lightFacing: calculateFacing(mountain, lightSource)
    };
    
    // Render with material system
    materialSystem.drawElement(ctx, element, depth);
}

function renderSnowPatch(ctx, snow, depth) {
    const element = {
        materialType: 'snow',
        baseColor: '#f0f4f8',
        shape: snow.geometry,
        lightFacing: 1.0  // Snow always catches light
    };
    
    materialSystem.drawElement(ctx, element, depth);
}
```

---

## 11. MATERIAL-SPECIFIC PRIMITIVES

Drop-in functions using material logic.

### Rock Cliff Primitive

```javascript
function drawRockCliff(ctx, x, y, width, height, depth = 0.3) {
    const mat = MATERIAL_PROPERTIES.rock;
    
    // Phase 1: Form (angular planes)
    const planes = generateRockPlanes(x, y, width, height);
    
    ctx.fillStyle = '#4a5a6a';
    planes.forEach(plane => {
        drawPlane(ctx, plane);
    });
    
    // Phase 2: Material (cracks and erosion)
    planes.forEach(plane => {
        // Hard cracks at plane boundaries
        if (plane.isBoundary) {
            drawCrack(ctx, plane, { 
                sharpness: mat.edgeHardness,
                width: 2
            });
        }
        
        // Soft erosion on face
        addErosionTexture(ctx, plane, {
            frequency: mat.textureFreq,
            sharpness: mat.edgeSoftness
        });
    });
    
    // Phase 3: Atmosphere (only if far)
    if (depth > 0.5) {
        applyAtmosphericFade(ctx, planes, depth);
    }
}

function generateRockPlanes(x, y, width, height) {
    // Create angular facets (rock has planes)
    const planes = [];
    const numFacets = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numFacets; i++) {
        planes.push({
            vertices: createAngularVertices(),
            normal: calculateNormal(),
            isBoundary: Math.random() > 0.7
        });
    }
    
    return planes;
}
```

### Fluffy Cloud Primitive

```javascript
function drawFluffyCloud(ctx, x, y, width, height) {
    const mat = MATERIAL_PROPERTIES.cloud;
    
    // Phase 1: Form (rounded volume - still defined)
    const coreX = x + width / 2;
    const coreY = y + height / 2;
    const coreRadius = Math.min(width, height) / 3;
    
    // Phase 2: Material (all soft, volume scatter)
    // Multiple layers with falloff
    for (let i = 3; i >= 1; i--) {
        const layerRadius = coreRadius * (1 + i * 0.5);
        const layerAlpha = 0.3 / i;
        
        const grad = ctx.createRadialGradient(
            coreX, coreY, coreRadius,
            coreX, coreY, layerRadius
        );
        
        grad.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(coreX, coreY, layerRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add noise-based puffs using coherent noise
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const dist = coreRadius * (0.8 + perlinNoise(i, 0) * 0.4);
        const puffX = coreX + Math.cos(angle) * dist;
        const puffY = coreY + Math.sin(angle) * dist;
        const puffSize = 20 + perlinNoise(i, 100) * 30;
        
        drawSoftBlob(ctx, puffX, puffY, puffSize, '#ffffff', 0.3);
    }
    
    // Phase 3: Atmosphere (clouds already soft, minimal additional)
}
```

### Tree Cluster Primitive

```javascript
function drawTreeCluster(ctx, x, y, height, depth = 0.2) {
    const mat = MATERIAL_PROPERTIES.foliage;
    
    // Phase 1: Form (solid cluster mass)
    const clusterWidth = height * 0.7;
    const clusterShapes = generateTreeClusterForms(x, y, height, clusterWidth);
    
    ctx.fillStyle = '#2a3a2a';
    clusterShapes.forEach(shape => {
        ctx.beginPath();
        drawIrregularShape(ctx, shape);
        ctx.fill();
    });
    
    // Phase 2: Material (foliage behavior)
    clusterShapes.forEach(shape => {
        // Firm core structure
        addClusterCore(ctx, shape, {
            sharpness: mat.edgeHardness,
            frequency: mat.textureFreq
        });
        
        // Soft outer foliage
        addFoliageEdge(ctx, shape, {
            sharpness: mat.edgeSoftness,
            scatter: 30
        });
        
        // Scattered hard details (branches, sharp needles)
        if (depth < 0.3) {
            scatterSharpDetails(ctx, shape, {
                count: 15,
                sharpness: 0.9
            });
        }
    });
    
    // Phase 3: Atmosphere
    if (depth > 0.4) {
        applyAtmosphericFade(ctx, clusterShapes, depth);
    }
}
```

---

## 12. VALIDATION CHECKLIST

**⭐ For automated validation with code, see [15-REALISM_VALIDATION.md](./15-REALISM_VALIDATION.md)**

This checklist provides manual validation. For programmatic detection of abstract drift:
- Value histogram analysis
- Edge uniformity detection
- Noise coherence tests
- Material differentiation checks
- Automated realism scoring

...refer to the Realism Validation document.

Run after completing any scene.

### Material Identity Check

- [ ] Can you identify what each element is made of?
- [ ] Do rocks behave differently than clouds?
- [ ] Do trees have different edge character than water?
- [ ] Are material properties visible (not just color differences)?

### Form Hierarchy Check

- [ ] Did you establish PRIMARY forms first?
- [ ] Are SECONDARY structures visible (ridges, folds)?
- [ ] Is TERTIARY detail on top of structure (not instead of it)?
- [ ] Could you remove texture and still read the form?

### Order Check (Form → Material → Atmosphere)

- [ ] Is there underlying form (not just soft blobs)?
- [ ] Do materials have distinct behavior?
- [ ] Is atmosphere applied AFTER form, not INSTEAD of it?

### Texture Frequency Check

- [ ] Do different materials have different texture density?
- [ ] Does texture frequency decrease with distance?
- [ ] Is there multi-scale texture (primary/secondary/tertiary)?

### Noise Quality Check

- [ ] Are you using coherent noise (not Math.random()) for organic shapes?
- [ ] Does variation flow naturally (not sparkle randomly)?
- [ ] Is noise appropriate for each material?

### Light Response Check

- [ ] Do diffuse materials have gentle gradation (no bright spots)?
- [ ] Do specular materials have highlights?
- [ ] Do translucent materials show volume scatter?

### Edge Mix Check (New Understanding)

- [ ] Do rocks have ~70% hard edges, 30% soft?
- [ ] Does snow have ~20% hard, 80% soft?
- [ ] Do trees have clustered firm cores with soft outer?
- [ ] Do clouds have 100% soft edges?

### The Ultimate Test

**Photo comparison:**
- Take a photo of similar subject
- Reduce both to 5 values
- Do materials behave the same way?
- Could someone identify materials in both?

---

## RESOURCES

### Primary Sources

1. **James Gurney - Color and Light (Material Chapters)**
   - Diffuse vs specular reflection
   - Light on different materials
   - https://gurneyjourney.blogspot.com/search/label/Color%20and%20Light

2. **Scott Robertson - How to Draw**
   - Volumes and planes in space
   - Form thinking
   - https://www.scottrobertsonworkshops.com/books/how-to-draw

3. **Marcos Mateu - Framed Environment Design**
   - Primary/secondary/tertiary structure
   - Landscape hierarchy
   - https://www.marcosmateu.com/framed-environment-design/

4. **Will Kemp Art School - Edge Types**
   - Hard/soft/lost/found application
   - https://willkempartschool.com/edges-in-drawing-and-painting/

5. **The Nature of Code**
   - Perlin noise
   - Coherent variation
   - https://natureofcode.com/

6. **Draw Paint Academy - Photo Analysis**
   - Deconstructing reference
   - Value reduction
   - https://drawpaintacademy.com/analyze-master-paintings/

---

*Last Updated: January 6, 2026*
*This document fills the gap between edge theory and material reality.*
*Read after 12-EDGE_MASTERY.md, before attempting realistic scenes.*
