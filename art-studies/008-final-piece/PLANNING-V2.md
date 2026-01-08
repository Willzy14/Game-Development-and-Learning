# Final Piece V2 - Planning Document

**Purpose:** Apply Phase 1 research (Composition, Color, Style) to upgrade Mountain Shrine art study

**Current Version:** V1 (functional, needs theory-informed refinement)  
**Target Version:** V2 (theory-applied, validates research pipeline)

---

## I. Scene Analysis - What We Have

**Subject:** Mountain shrine at dawn
- Shrine on ledge (focal point)
- Mountains receding (depth layers)
- Mist in valley (atmosphere)
- Dawn light (warm sunrise hitting shrine)

**Current Strengths:**
- ✅ Atmospheric perspective working (mountains fade)
- ✅ Focal point clear (shrine has detail)
- ✅ Color palette appropriate (warm light, cool shadows)

**Problems to Solve:**
1. Composition unclear - no strong focal point placement system
2. Color harmony arbitrary - no systematic palette generation
3. Style inconsistent - some elements detailed, others not (no explicit style guide)
4. Eye movement path not designed - viewer doesn't know where to look first

---

## II. Composition System - See 18-COMPOSITION_THEORY.md

### Decision: Golden Ratio Focal Point

**WHY Golden Ratio (not Rule of Thirds)?**
- Natural scene (not architectural/grid-based)
- Single focal point (shrine)
- Want organic feel (Golden Ratio = nature's ratio)

**Reference:** 18-COMPOSITION_THEORY.md Section II, VIII

**Implementation:**
```javascript
const PHI = 1.618;
const focalX = W / PHI;        // ~556px (right-biased)
const focalY = H / PHI;        // ~371px (upper third)

// Shrine center positioned at golden ratio intersection
```

### Leading Lines: Converge to Shrine

**WHY:** Guide eye to focal point using Gestalt continuity principle

**Reference:** 18-COMPOSITION_THEORY.md Section III

**Implementation:**
- Mountain ridges angle toward shrine
- Mist layers create diagonal flow
- Ground ledge edge points toward shrine
- Dawn light rays converge on shrine

### Horizon Placement: Low (Emphasize Sky)

**WHY:** Dawn scene = sky is important (color gradient, atmosphere)

**Reference:** 18-COMPOSITION_THEORY.md Section VIII

**Implementation:**
```javascript
const horizonY = H * (2/3);    // Low horizon = 400px
// Mountains below, sky dominant above
```

### Negative Space: 30% (Balanced)

**WHY:** Not luxury (40% too sparse), not dense (15% cluttered). Balanced = breathing room without emptiness.

**Reference:** 18-COMPOSITION_THEORY.md Section IV

**Implementation:**
- Sky = 40% of canvas (negative space)
- Mist = additional 20% (visual rest)
- Total negative: ~60% (includes atmospheric elements)
- Positive (mountains, shrine): ~40%

---

## III. Color Harmony - See 19-COLOR_HARMONY.md

### Decision: Split-Complementary (Sophisticated)

**WHY Split-Complementary (not Pure Complementary)?**
- Dawn = warm light (orange ~30°) + cool shadows (need contrast)
- Pure complementary (orange + cyan) too jarring for serene dawn
- Split-complementary = orange + blue-green + blue = softer, more sophisticated

**Reference:** 19-COLOR_HARMONY.md Section III

**Base Hue:** 30° (orange/gold for dawn light)  
**Split Complements:** 150° (teal/cyan), 210° (blue)

**Implementation:**
```javascript
const harmony = {
    // Base: Dawn light (orange/gold)
    base: 'hsl(30, 80%, 70%)',        // Warm shrine light
    
    // Split 1: Mountains (teal - cooler)
    split1: 'hsl(150, 40%, 50%)',     // Mountain mid-tones
    
    // Split 2: Sky/shadows (blue - coolest)
    split2: 'hsl(210, 60%, 40%)',     // Deep sky, shadows
    
    // Neutrals for grounding
    neutral: 'hsl(30, 20%, 30%)'      // Stone, ground
};
```

### Value Contrast: High at Focal Point

**WHY:** Eye jumps to high-contrast areas in first 2 seconds

**Reference:** 19-COLOR_HARMONY.md Section IV

**Implementation:**
- Shrine: Lightness 70% (light) vs 20% (shadow) = 50% contrast
- Mountains: Lightness 50% vs 30% = 20% contrast (less prominent)
- Sky: Gradient 60% to 30% = smooth (no sharp contrast)

### Temperature Contrast: Warm Forward, Cool Back

**WHY:** Warm colors focus in front of retina, cool behind (physical depth perception)

**Reference:** 19-COLOR_HARMONY.md Section V

**Implementation:**
- Shrine (foreground): Warm orange/gold (30-40° hue)
- Near mountains: Neutral cool (150°)
- Far mountains: Pure cool blue (210°)
- Sky: Cool gradient (210-240°)

---

## IV. Style System - See 20-ART_STYLES.md

### Decision: Stylized Realism

**WHY Stylized Realism (not Full Realism or Cartoon)?**
- Want believable dawn atmosphere (not cartoon simplicity)
- Don't need photographic detail (too expensive, uncanny)
- Stylized = recognizable but artistically simplified
- Most common in successful game art (Uncharted, Horizon)

**Reference:** 20-ART_STYLES.md Section II

**Style Guide:**
```javascript
const STYLE = {
    // 1. LINE QUALITY
    outlines: false,              // No black outlines (painterly, not cartoon)
    edges: 'soft',                // Atmospheric blending, not sharp vectors
    
    // 2. COLOR APPROACH
    saturation: {
        focal: 80,                // Shrine = high sat (vivid)
        supporting: 40,           // Mountains = muted
        background: 60            // Sky = moderate (atmospheric)
    },
    shading: 'gradient',          // Smooth gradients, not cel/flat
    
    // 3. DETAIL LEVEL
    simplification: 'moderate',   // Clear shapes, no texture noise
    texture: 'stylized',          // Patterns suggest texture (not photographic)
    vertices: 'low',              // Simple polygons (<20 points per shape)
    
    // 4. REALISM LEVEL
    anatomy: 'simplified',        // Architecture proportional but not measured
    perspective: 'correct',       // Follow linear + atmospheric perspective
    lighting: 'enhanced',         // Exaggerated dawn glow (more dramatic than reality)
    physics: 'accurate'           // Mist behaves naturally, mountains solid
};
```

### Consistency Enforcement

**Reference:** 20-ART_STYLES.md Section IV

**Validation Checklist:**
- [ ] All elements use gradient shading (no flat fills)
- [ ] All elements have soft edges (no hard black outlines)
- [ ] Saturation follows focal (80%) > background (60%) > supporting (40%) hierarchy
- [ ] All shapes use <20 vertices (simple polygons)
- [ ] All colors within split-complementary harmony (30°, 150°, 210° ±30°)

---

## V. Implementation Plan - Render Order

**Reference:** 14-CANVAS_IMPLEMENTATION_PATTERNS.md (render back-to-front)

### Layer 1: Sky (Background)
```javascript
// Gradient: Deep blue (top) → pink/orange (horizon)
// No detail, pure atmosphere
// Hues: 210° (top) → 30° (horizon)
drawSky();
```

### Layer 2: Far Mountains (Depth Layer 3)
```javascript
// Simple silhouettes, blue-tinted (210°)
// Low saturation (30%), high lightness (60%)
// No detail, atmospheric fade
drawFarMountains();
```

### Layer 3: Mid Mountains (Depth Layer 2)
```javascript
// More defined, teal-tinted (150°)
// Medium saturation (40%), medium lightness (50%)
// Slight detail (ridges), leading lines toward shrine
drawMidMountains();
```

### Layer 4: Near Mountains (Depth Layer 1)
```javascript
// Sharp edges, dark blue-grey
// Higher saturation (50%), lower lightness (40%)
// Clear ridges, frame shrine
drawNearMountains();
```

### Layer 5: Mist (Atmospheric Effect)
```javascript
// Warm where dawn light hits (30° hue)
// Cool in shadow (210° hue)
// Soft gradients, low opacity (20-30%)
drawMist();
```

### Layer 6: Ground Ledge (Foreground Base)
```javascript
// Neutral browns (30° hue, low saturation 20%)
// Supports shrine, recedes toward background
// Simple gradient, no complex texture
drawGroundLedge();
```

### Layer 7: Shrine (FOCAL POINT)
```javascript
// Positioned at Golden Ratio intersection (556px, 371px)
// Warm dawn light (30° hue, 80% saturation, 70% lightness)
// Cool shadows (210° hue, 60% saturation, 20% lightness)
// Most detail: 4-layer texture on stone, 5-value shading
// Sharp edges where lit, soft edges in shadow
drawShrine();
```

### Layer 8: Dawn Light Rays (Focal Enhancement)
```javascript
// Volumetric rays from horizon toward shrine
// Warm orange (30° hue), very low opacity (10-15%)
// Enhance focal point, create leading lines
drawLightRays();
```

---

## VI. Success Criteria - Validation

**After implementation, verify:**

### Composition (18-COMPOSITION_THEORY.md Section IX)
- [ ] Eye lands on shrine first (highest contrast at Golden Ratio point)
- [ ] Eye follows leading lines (mountain ridges, light rays converge on shrine)
- [ ] Eye returns to shrine (circular flow, nothing leads OUT of frame)
- [ ] Negative space sufficient (60% atmospheric = breathing room)
- [ ] Horizon low (sky dominates, appropriate for dawn scene)

### Color (19-COLOR_HARMONY.md Section X)
- [ ] Colors follow split-complementary system (30°, 150°, 210° ±30°)
- [ ] Value contrast >40% at focal point (shrine light vs shadow)
- [ ] Saturation hierarchy: focal (80%) > background (60%) > supporting (40%)
- [ ] Temperature logic: warm forward (shrine), cool back (mountains, sky)
- [ ] Palette limited to 5-7 distinct hues (no rainbow)

### Style (20-ART_STYLES.md Section IX)
- [ ] All elements use stylized realism (no cartoon simplicity, no photorealism)
- [ ] All elements have soft edges (no black outlines)
- [ ] All elements use gradient shading (no flat cel zones)
- [ ] All shapes <20 vertices (consistent simplification level)
- [ ] All colors within harmony system (no arbitrary hues)

### Gestalt Principles (18-COMPOSITION_THEORY.md Section I)
- [ ] Proximity: Shrine elements grouped, mountains grouped
- [ ] Similarity: Mountains share style, shrine distinct
- [ ] Continuity: Ridges flow smoothly toward shrine
- [ ] Closure: Shrine recognizable as structure
- [ ] Figure-ground: Shrine = figure, mountains/sky = ground

---

## VII. Code Architecture - Classes to Implement

### CompositionEngine (from 18-COMPOSITION_THEORY.md Section VIII)
```javascript
class CompositionEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.phi = 1.618;
    }
    
    calculateFocalPoint(method = 'goldenRatio') {
        // Returns { x, y } for shrine placement
    }
    
    placeHorizon(emphasize = 'sky') {
        // Returns y-coordinate for mountain base
    }
    
    generateLeadingLines(focalPoint, count = 3) {
        // Returns array of ridge paths converging on shrine
    }
    
    calculateNegativeSpace(elements) {
        // Returns required spacing for 30% ratio
    }
}
```

### ColorHarmony (from 19-COLOR_HARMONY.md Section VII)
```javascript
class ColorHarmony {
    constructor(baseHue = 30) {
        this.baseHue = baseHue;  // Dawn orange
    }
    
    generatePalette(type = 'split-complementary') {
        // Returns complete palette with tints/shades/tones
    }
    
    createTint(hue, sat, baseLight, steps = 3) {
        // Returns lightness variations for dawn gradient
    }
}
```

### StyleSystem (from 20-ART_STYLES.md Section IV)
```javascript
class StyleSystem {
    constructor(styleGuide) {
        this.guide = styleGuide;  // STYLE object from Section IV
    }
    
    validateElement(element) {
        // Returns errors if element breaks style rules
    }
    
    applyStyle(element) {
        // Auto-conforms element to style guide
    }
}
```

---

## VIII. Expected Improvements Over V1

**Composition:**
- V1: Shrine centered (static, bisects frame)
- V2: Shrine at Golden Ratio (dynamic, natural flow)

**Color:**
- V1: Arbitrary palette (no system)
- V2: Split-complementary harmony (mathematically balanced)

**Style:**
- V1: Inconsistent detail levels (some elements over-detailed)
- V2: Stylized realism throughout (consistent simplification)

**Eye Movement:**
- V1: No designed path (wanders randomly)
- V2: Clear sequence (sky → light rays → shrine, held by leading lines)

**Integration:**
- V1: Techniques applied without framework
- V2: Every decision references Bible document (traceable rationale)

---

## IX. Files to Create/Modify

**New Files:**
- `art-studies/008-final-piece/art-v2.js` (upgraded implementation)
- `art-studies/008-final-piece/index-v2.html` (loads v2)
- `art-studies/008-final-piece/PLANNING-V2.md` (this document)

**Reference Files (Read-Only):**
- `docs/bible/18-COMPOSITION_THEORY.md`
- `docs/bible/19-COLOR_HARMONY.md`
- `docs/bible/20-ART_STYLES.md`

**Documentation Updates After Completion:**
- `START_HERE.md` - Update with V2 complete
- `docs/bible/09-SESSION_LOG.md` - Add V2 application session
- `docs/art-studies/ART_STUDY_PROGRESS.md` - Mark Study #8 V2 complete

---

## X. Meta-Learning Goals

**This upgrade tests:**
1. Can Bible docs be used as reference (or are they too abstract)?
2. Do CompositionEngine/ColorHarmony/StyleSystem classes actually help?
3. Does planning document reduce cognitive load (vs remembering everything)?
4. Are there missing concepts in Phase 1 research (gaps to fill in Phase 2)?

**Success = Can complete V2 by REFERENCING docs, not REMEMBERING them**

---

**Status:** 🟡 Planning Complete - Ready for Implementation  
**Next:** Create art-v2.js following this plan, validate against Section VI checklist
