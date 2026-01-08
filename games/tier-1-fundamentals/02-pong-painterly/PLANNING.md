# Painterly Pong - Planning Document (CORRECTED)

**Date:** January 8, 2026  
**Purpose:** Test decision-graph navigation system  
**Scene Type:** Simple game (Pong) with painterly aesthetic  
**Task Type:** RESKIN existing 001-pong (NOT rebuild from scratch)

---

## 🔍 SCENE INTERROGATION (Decision-Graph Test)

### ⚠️ CRITICAL FIRST QUESTION: Is this a new project or modification?

**Question 0: What is the task type?**
- **Answer:** RESKIN existing game (001-pong)
- **Decision:** Use existing game logic, ONLY modify rendering functions
- **Files to modify:** Only the `render()` function and drawing helpers
- **Files to preserve:** Game logic, input handling, AI, physics, audio

**Question 1: What style aesthetic?**
- **Answer:** Painterly (impressionist-inspired)
- **Bible Doc Loaded:** 20-STYLES_MOVEMENTS.md (Section III: Stylization Spectrum)
- **Bible Doc Loaded:** 21-CLASSICAL_TECHNIQUES.md (Section III: Impasto)

**Question 2: What are the scene elements?**
- **Answer:** Ball, two paddles, playing field, score display
- **Complexity:** Simple geometric forms
- **Bible Doc Loaded:** 14-CANVAS_IMPLEMENTATION_PATTERNS.md (basic shapes)

**Question 3: What age/material properties?**
- **Answer:** Modern/contemporary (age = 0)
- **Material:** Not applicable (abstract game, not realistic scene)
- **Weathering Required:** NO ❌
- **Bible Doc Skipped:** 24-REALISM_DEGRADATION.md (not needed for modern abstract)

**Question 4: What realism level?**
- **Answer:** Stylized/painterly (NOT photorealistic)
- **Realism Slider:** 30% (low realism, high stylization)
- **Bible Doc Loaded:** 20-STYLES_MOVEMENTS.md (Impressionism technique)

**Question 5: What color scheme?**
- **Answer:** Warm complementary (orange/blue for contrast)
- **Bible Doc Loaded:** 19-COLOR_HARMONY.md (Section IV: Complementary Harmony)

**Question 6: What composition requirements?**
- **Answer:** Centered gameplay, clear focal point (ball)
- **Bible Doc Loaded:** 18-COMPOSITION_THEORY.md (Section V: Focal Hierarchy)

**Question 7: Does scene need depth/perspective?**
- **Answer:** Minimal (2D game, slight atmospheric effect on background)
- **Bible Doc Loaded:** 21-CLASSICAL_TECHNIQUES.md (Section V: Atmospheric Perspective - minimal application)

---

## 📋 RELEVANT BIBLE SECTIONS (Auto-Loaded)

### From 20-STYLES_MOVEMENTS.md

**Impressionism Characteristics (Section III):**
- Broken color technique (optical mixing, not smooth gradients)
- Visible brushstrokes
- Emphasis on light and atmosphere
- Loose, sketchy forms (not precise geometry)

**Implementation for Pong:**
```javascript
// Ball: impressionist "broken color" instead of solid fill
function drawImpressionistBall(ctx, x, y, radius) {
    // NO smooth gradient
    // YES broken color dabs
    const dabs = 20; // Number of color spots
    for (let i = 0; i < dabs; i++) {
        const angle = (i / dabs) * Math.PI * 2;
        const offsetX = Math.cos(angle) * radius * 0.3;
        const offsetY = Math.sin(angle) * radius * 0.3;
        
        // Vary hue slightly (broken color)
        const hueVariation = (Math.random() - 0.5) * 20;
        ctx.fillStyle = `hsl(${30 + hueVariation}, 80%, 60%)`;
        
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

### From 21-CLASSICAL_TECHNIQUES.md

**Impasto Simulation (Section III):**
- Thick paint texture effect
- Visible stroke direction
- Creates tactile quality

**Implementation for Paddles:**
```javascript
// Paddles: impasto stroke texture
function drawImpastedPaddle(ctx, x, y, width, height) {
    // Base color
    ctx.fillStyle = 'hsl(210, 70%, 50%)';
    ctx.fillRect(x, y, width, height);
    
    // Impasto strokes (vertical)
    ctx.globalAlpha = 0.4;
    for (let py = y; py < y + height; py += 5) {
        const offsetX = (Math.random() - 0.5) * 3;
        ctx.strokeStyle = `hsl(210, 70%, ${50 + (Math.random() - 0.5) * 20}%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + offsetX, py);
        ctx.lineTo(x + width + offsetX, py);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}
```

**Atmospheric Perspective (Section V - Minimal):**
- Background slightly desaturated
- Foreground (game elements) full saturation

### From 19-COLOR_HARMONY.md

**Complementary Harmony (Section IV):**
- Ball: Orange (30°)
- Paddles: Blue (210°)
- Background: Muted warm (40°, low saturation)

**Implementation:**
```javascript
const colorScheme = {
    ball: { h: 30, s: 80, l: 60 },       // Warm orange
    paddles: { h: 210, s: 70, l: 50 },   // Cool blue
    background: { h: 40, s: 20, l: 85 }, // Muted warm beige
    field: { h: 50, s: 30, l: 75 }       // Slightly warmer field
};
```

### From 18-COMPOSITION_THEORY.md

**Focal Hierarchy (Section V):**
- Primary focal point: Ball (highest contrast)
- Secondary: Paddles (medium contrast)
- Tertiary: Background (low contrast)

**Implementation:**
- Ball: Most saturated, visible brushstrokes, movement draws eye
- Paddles: Medium saturation, clear but not dominant
- Background: Low saturation, minimal detail

---

## 🚫 FORBIDDEN RULES (Scene-Specific)

### ❌ DO NOT Apply:

1. **Weathering/Degradation Techniques**
   - Scene is modern/abstract (age = 0)
   - No material realism needed
   - 24-REALISM_DEGRADATION.md NOT relevant

2. **Perfect Geometric Precision**
   - Impressionist style = loose, painterly
   - No perfectly round ball (break with dabs)
   - No perfectly straight paddle edges (impasto texture)

3. **Smooth Gradients**
   - Impressionism = broken color
   - Optical mixing, not smooth blending
   - Use color dabs, not `createLinearGradient()`

4. **High Vertex Complexity**
   - Simple game, simple forms
   - Painterly effect from texture, not geometry

5. **Photorealistic Edge Quality**
   - Edges should be soft, painterly
   - Slight blur to simulate brushstroke bleed

---

## 🎨 RENDERING PLAN

### Pass 1: Background (Atmospheric Base)
```javascript
function renderBackground(ctx, width, height) {
    const bg = colorScheme.background;
    
    // Base fill
    ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
    ctx.fillRect(0, 0, width, height);
    
    // Atmospheric variation (impressionist)
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 20 + Math.random() * 40;
        const hueVar = (Math.random() - 0.5) * 10;
        
        ctx.fillStyle = `hsl(${bg.h + hueVar}, ${bg.s}%, ${bg.l + (Math.random() - 0.5) * 10}%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
```

### Pass 2: Field Lines (Subtle)
```javascript
function renderFieldLines(ctx, width, height) {
    const field = colorScheme.field;
    
    // Center line (painterly, not perfect)
    ctx.strokeStyle = `hsla(${field.h}, ${field.s}%, ${field.l - 20}%, 0.3)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    
    // Wavy line (not straight)
    for (let y = 0; y < height; y += 20) {
        const offset = Math.sin(y * 0.05) * 5;
        ctx.lineTo(width / 2 + offset, y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
}
```

### Pass 3: Paddles (Impasto)
```javascript
function renderPaddle(ctx, paddle) {
    drawImpastedPaddle(ctx, paddle.x, paddle.y, paddle.width, paddle.height);
}
```

### Pass 4: Ball (Impressionist Broken Color)
```javascript
function renderBall(ctx, ball) {
    drawImpressionistBall(ctx, ball.x, ball.y, ball.radius);
}
```

### Pass 5: Score (Simple, Non-Competing)
```javascript
function renderScore(ctx, score1, score2, width) {
    ctx.font = '48px serif';
    ctx.fillStyle = 'hsla(0, 0%, 30%, 0.5)';  // Low contrast
    ctx.textAlign = 'center';
    
    ctx.fillText(score1, width * 0.25, 60);
    ctx.fillText(score2, width * 0.75, 60);
}
```

---

## ✅ VALIDATION CHECKLIST

### Style Consistency:
- [ ] Ball uses broken color (no smooth gradients)
- [ ] Paddles have impasto texture (visible strokes)
- [ ] Background has atmospheric variation (not flat)
- [ ] Field lines are painterly (not perfectly straight)
- [ ] No photorealistic precision (impressionist looseness)

### Color Harmony:
- [ ] Complementary scheme (orange ball, blue paddles)
- [ ] Background desaturated (atmospheric perspective)
- [ ] Focal hierarchy clear (ball highest contrast)

### Composition:
- [ ] Ball is focal point (highest saturation)
- [ ] Paddles visible but secondary
- [ ] Score non-competing (low contrast)

### Technical:
- [ ] No weathering applied (modern scene)
- [ ] No perfect geometry (painterly effect)
- [ ] 60 FPS maintained (simple rendering)

---

## 🎯 SUCCESS METRICS (Decision-Graph Test)

### Navigation System Validation:

1. **Did interrogation identify correct Bible docs?**
   - ✅ YES: Loaded 5 relevant docs (20, 21, 19, 18, 14)
   - ✅ NO: Did NOT load 24-REALISM_DEGRADATION.md (correctly skipped)

2. **Did forbidden rules prevent bad patterns?**
   - Will validate: No weathering applied (age = 0)
   - Will validate: No smooth gradients (impressionist style)
   - Will validate: No perfect geometry (painterly aesthetic)

3. **Is planning doc concise?**
   - Target: <5 pages (only relevant sections)
   - Actual: This document (~200 lines)
   - Result: ✅ Concise (vs 700+ line comprehensive docs)

4. **Can implementation reference this doc alone?**
   - Will validate: Code snippets sufficient for implementation
   - Will validate: No need to browse full Bible docs during coding

5. **Does decision-graph approach scale?**
   - Will validate: More complex scene → more loaded sections
   - Will validate: Simple scene → fewer loaded sections (proven here)

---

## 📝 IMPLEMENTATION NOTES

**Rendering Strategy:**
- Canvas 2D with impressionist simulation
- No physics engine needed (simple collision)
- Focus on painterly aesthetics over realism

**Performance:**
- Target: 60 FPS
- Optimization: Cache paddle textures, redraw only ball/score

**Game Logic:**
- Standard Pong mechanics
- Ball speed increases on each hit
- First to 5 points wins

**Testing Focus:**
This implementation tests whether the decision-graph navigation system works:
- Did scene interrogation load the right Bible sections?
- Did it skip irrelevant sections (weathering)?
- Is this planning doc actionable without browsing full docs?

**Next Step:** Implement the game using ONLY this planning doc as reference.