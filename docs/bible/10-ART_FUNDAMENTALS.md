# 🎨 ART FUNDAMENTALS - Classical Principles for Game Art

**Purpose:** Core visual art principles that apply to ALL game art and Canvas rendering  
**When to Read:** Before starting any art study, when art looks "off" but you can't explain why, when designing new visual elements

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | Art research deep dive |
<!-- END METADATA -->

**Related Documents:**
- [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md) - Canvas implementation patterns
- [11-CANVAS_PATTERNS.md](./11-CANVAS_PATTERNS.md) - Reusable code snippets
- [../art-studies/ART_STUDY_PROGRESS.md](../art-studies/ART_STUDY_PROGRESS.md) - Practice tracking

---

## 🚨 THE CORE TRUTH

> **Value > Color > Detail**
> 
> If your values (light/dark) don't read correctly, no amount of color or detail will save the piece.
> Always establish value structure FIRST.

---

## TABLE OF CONTENTS

1. [Form & Structure](#1-form--structure)
2. [The 5-Value System](#2-the-5-value-system)
3. [Light & Shadow Rules](#3-light--shadow-rules)
4. [Composition Principles](#4-composition-principles)
5. [Perspective Fundamentals](#5-perspective-fundamentals)
6. [Color Theory for Games](#6-color-theory-for-games)
7. [Game-Specific Art Rules](#7-game-specific-art-rules)
8. [Quick Tests & Validation](#8-quick-tests--validation)

---

## 1. FORM & STRUCTURE

### The Construction Approach

**Every complex object is built from simple shapes:**
- **Sphere** → Heads, fruits, planets, bubbles
- **Cube** → Buildings, boxes, crystals
- **Cylinder** → Tree trunks, columns, limbs
- **Cone** → Mountains, roofs, spikes

### Key Rules

1. **Start simple, add complexity** - Block in major shapes before ANY detail
2. **Think in 3D** - Even 2D art should imply volume through lighting
3. **Gesture before detail** - Capture energy and flow first
4. **Cross-contour lines** - Imagine lines wrapping around forms to understand 3D shape

### Application to Canvas Art

```
❌ WRONG: Draw detailed tree immediately
✅ RIGHT: 
   1. Cylinder for trunk (block shape)
   2. Sphere/cone for foliage mass
   3. Add trunk texture
   4. Break up foliage edge
   5. Add leaf details LAST
```

---

## 2. THE 5-VALUE SYSTEM ⭐ CRITICAL

This is the most important concept for making art look three-dimensional.

### The Five Values

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    1. HIGHLIGHT ────── Brightest point (direct light)   │
│         ↓                                               │
│    2. LIGHT ─────────── General lit area                │
│         ↓                                               │
│    3. HALFTONE ──────── Transition zone (OFTEN MISSED!) │
│         ↓                                               │
│    4. CORE SHADOW ───── Darkest on form (NOT edge!)     │
│         ↓                                               │
│    5. REFLECTED LIGHT ─ Bounce light in shadow          │
│                         (lighter than core shadow)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual Diagram on a Sphere

```
        Light Source
             ↓
         ┌───────┐
        /  1 (H)  \      1 = Highlight (white/near-white)
       /    2      \     2 = Light (base color, lit)
      │   2    3    │    3 = Halftone (transition)
      │  3   ████   │    4 = Core Shadow (darkest ON form)
      │    ████ 5   │    5 = Reflected Light (in shadow area)
       \   4██     /     
        \        /       
         └──────┘        
```

### Common Mistakes We Made

| Mistake | Why It Looks Wrong | Fix |
|---------|-------------------|-----|
| No halftone | Harsh light/shadow divide | Add gradient transition zone |
| Core shadow at edge | Form looks cut off | Core shadow is INSIDE the shadow area |
| No reflected light | Objects look pasted on | Add subtle lighter value in shadow |
| Highlight too large | Object looks flat/glowing | Highlight is a small point |

### Canvas Implementation

```javascript
// Sphere with proper 5-value system
function drawSphereCorrect(ctx, x, y, radius, baseColor) {
    // Offset gradient center for 3D effect (toward light)
    const grad = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, radius * 0.1,  // Highlight area
        x, y, radius
    );
    
    grad.addColorStop(0, lighten(baseColor, 60));    // 1. Highlight
    grad.addColorStop(0.2, lighten(baseColor, 30));  // 2. Light
    grad.addColorStop(0.5, baseColor);               // 3. Halftone
    grad.addColorStop(0.75, darken(baseColor, 40));  // 4. Core shadow
    grad.addColorStop(0.9, darken(baseColor, 25));   // 5. Reflected light (lighter than core!)
    grad.addColorStop(1, darken(baseColor, 35));     // Edge
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}
```

---

## 3. LIGHT & SHADOW RULES

### Light Source Consistency

**Rule: Pick ONE primary light source and stick to it.**

All shadows, highlights, and gradients must agree on where light comes from.

```
Common light directions:
• Top-left (most common in 2D games) - shadows fall bottom-right
• Direct above - shadows directly below (noon sun)
• Behind/rim light - creates silhouette with edge glow
```

### Form Shadow vs Cast Shadow ⭐ IMPORTANT

These are TWO DIFFERENT THINGS with different rules:

| Property | Form Shadow | Cast Shadow |
|----------|-------------|-------------|
| **What is it?** | Shadow on the object itself | Shadow projected onto another surface |
| **Location** | Always attached to object | On ground/wall/other objects |
| **Edge hardness** | SOFT, gradual transition | HARD near object, soft far away |
| **Contains reflected light?** | YES | NO |
| **Darkest point** | Core shadow (inside) | Contact point (where object meets surface) |

### Form Shadow Anatomy

```
                LIGHT
                  ↓
    ┌─────────────────────────┐
    │ ░░░░░░░░░░░░░░░░░░░░░░░ │  Light side
    │ ░░░░░░░░░░░░░░░░░░░░░░░ │
    │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │  Halftone (terminator line)
    │ ████████████████████████ │  CORE SHADOW (darkest)
    │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  Reflected light (lighter!)
    └─────────────────────────┘
              │
    ══════════════════════════   ← Cast shadow on ground
         (hard edge)    (soft edge)
           near           far
```

### Cast Shadow Rules

1. **Hardest at contact point** - Where object touches surface
2. **Softer as it extends** - Light scatters over distance
3. **Shape follows light geometry** - Not just a blob
4. **Darker than form shadow** - No reflected light inside
5. **Follows surface contours** - Wraps over bumps/curves

### Ambient Occlusion (AO)

Soft shadows where surfaces meet or are close together.

**Where AO appears:**
- Corners and crevices
- Where objects contact surfaces (grounding shadow)
- Folds and creases
- Behind overlapping elements

```javascript
// Simple AO: darken at contact points
function drawWithGroundingShadow(ctx, x, y, width, height) {
    // Soft elliptical shadow at base
    const aoGrad = ctx.createRadialGradient(x, y + height, 0, x, y + height, width * 0.6);
    aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + height + 5, width * 0.6, height * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw object on top
    drawObject(ctx, x, y, width, height);
}
```

---

## 4. COMPOSITION PRINCIPLES

### Rule of Thirds

Divide canvas into 9 equal sections. Place key elements at intersection points.

```
    ┌───────┬───────┬───────┐
    │       │       │       │
    │   ●───┼───────┼───●   │  ● = Power points
    │       │       │       │  (place focal elements here)
    ├───────┼───────┼───────┤
    │       │       │       │
    │   ●───┼───────┼───●   │
    │       │       │       │
    └───────┴───────┴───────┘
```

### Focal Point Creation

How to make the viewer look where you want:

| Technique | Effect | Example |
|-----------|--------|---------|
| **Highest contrast** | Eye goes to biggest light/dark difference | White character on dark BG |
| **Color saturation** | Saturated pops from desaturated | Red enemy in gray environment |
| **Convergence** | Lines lead eye to point | Road leading to castle |
| **Isolation** | Separation draws attention | Single tree in empty field |
| **Detail density** | More detail = more attention | Detailed face, simple body |

### Visual Flow

Guide the viewer's eye through the composition:

```
Entry point (usually lower corners)
    ↓
Path through composition (shapes, lines, value changes)
    ↓
Focal point (highest interest)
    ↓
Secondary elements
    ↓
Exit or loop back
```

### Value Grouping (The Squint Test)

**Squint at your art.** You should see 2-3 major value masses, not scattered noise.

```
❌ BAD: 50 different values scattered randomly
✅ GOOD: 
   - Dark mass (sky/background)
   - Mid mass (ground/environment)  
   - Light mass (focal point/character)
```

---

## 5. PERSPECTIVE FUNDAMENTALS

### Atmospheric Perspective ⭐ WE LEARNED THIS THE HARD WAY

Objects change with distance. This is NOT just alpha transparency!

| Distance | Contrast | Saturation | Color Shift | Detail |
|----------|----------|------------|-------------|--------|
| Close | High | Full | Normal | Maximum |
| Medium | Medium | Reduced | Slight blue | Moderate |
| Far | Low | Very low | Blue/gray | Minimal |

```javascript
// ❌ WRONG - Alpha only (we tried this, it failed)
ctx.globalAlpha = 0.5;  // Just makes it transparent, not distant

// ✅ CORRECT - Color shift + desaturation
const distantColor = blendTowardHaze(baseColor, distance);
// Where haze color is blue-gray: '#8090a0'
```

### Linear Perspective Quick Reference

**One-Point:** All receding lines go to single point on horizon
- Use for: hallways, roads, direct views

**Two-Point:** Two vanishing points on horizon, verticals stay vertical
- Use for: building corners, most objects

**Three-Point:** Two on horizon, one above/below
- Use for: looking up at skyscraper, looking down from height

---

## 6. COLOR THEORY FOR GAMES

### The Color Wheel

```
           Yellow
              │
    Orange ───┼─── Green
              │
       Red ───┼─── Blue
              │
           Purple
```

### Color Schemes

| Scheme | Definition | Feel | Game Use |
|--------|------------|------|----------|
| **Complementary** | Opposites (red/green) | High energy, contrast | Enemy vs player |
| **Analogous** | Neighbors (blue/green/cyan) | Harmony, calm | Peaceful environments |
| **Triadic** | Triangle (red/yellow/blue) | Vibrant, balanced | Diverse game worlds |

### Warm vs Cool

```
WARM (advance, energy)      COOL (recede, calm)
──────────────────────      ──────────────────
Red                         Blue
Orange                      Green  
Yellow                      Purple

Use warm for: foreground, characters, threats
Use cool for: background, distance, safety
```

### Game Color Coding (Functional Color)

```javascript
const GAME_COLORS = {
    // Player & allies
    player: '#00ff88',      // Bright green - always visible
    ally: '#00aaff',        // Blue - friendly
    
    // Threats
    enemy: '#ff4444',       // Red - danger
    hazard: '#ff8800',      // Orange - warning
    boss: '#ff00ff',        // Magenta - special threat
    
    // Rewards
    collectible: '#ffdd00', // Gold - valuable
    powerup: '#00ffff',     // Cyan - beneficial
    health: '#ff6699',      // Pink - life
    
    // Environment
    platform: '#8b7355',    // Brown - stable, grounded
    background: '#1a1a2e',  // Dark blue - recedes
    wall: '#404040',        // Gray - solid, obstacle
};
```

**Rule: Player must NEVER blend into background.**

---

## 7. GAME-SPECIFIC ART RULES

### The Silhouette Test ⭐ DO THIS EVERY TIME

Fill your character/object entirely with black. Can you still identify:
- What it is?
- Which direction it faces?
- What action it's doing?

If NO → redesign the shape.

```
GOOD SILHOUETTES:           BAD SILHOUETTES:
                            
  ▲ (clear direction)         ● (blob - what is it?)
 /█\                          
  █  (humanoid, walking)      ██ (square - no character)
 / \                          ██
```

### Readability at Distance

**Test: Shrink your game to 25%.** Can you still:
- Identify the player?
- See enemies?
- Distinguish collectibles?
- Read the play space?

If NO → simplify, increase contrast, enlarge key elements.

### Layering for Depth (Back to Front)

```
Layer 6: SKY / Background      (lowest saturation, lowest contrast)
Layer 5: FAR elements          (atmospheric haze applied)
Layer 4: MID background        (reduced detail)
Layer 3: PLAY LAYER            (full detail, full contrast)
Layer 2: Close foreground      (can obscure slightly)
Layer 1: UI OVERLAY            (highest layer)
```

**Each layer back:**
- Decrease saturation
- Decrease contrast
- Shift color toward blue/gray
- Reduce detail

---

## 8. QUICK TESTS & VALIDATION

### The Art Checklist (Use After EVERY Piece)

| Test | Question | Pass? |
|------|----------|-------|
| **Squint Test** | Do 2-3 major value masses emerge? | ☐ |
| **Silhouette Test** | Recognizable as black shape? | ☐ |
| **25% Scale Test** | Key elements readable when tiny? | ☐ |
| **Light Consistency** | All shadows agree on light direction? | ☐ |
| **5-Value Check** | Can you identify all 5 values? | ☐ |
| **Focal Point** | Is there ONE clear focus area? | ☐ |
| **Atmospheric Depth** | Far = desaturated + blue shift? | ☐ |
| **Warm/Cool Balance** | Foreground warm, background cool? | ☐ |

### Quick Fixes for Common Problems

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Looks flat | Missing halftone or reflected light | Add gradient transitions |
| Objects float | No grounding shadow/AO | Add contact shadows |
| Feels chaotic | No value grouping | Reduce to 3 major value masses |
| Can't find focus | Contrast scattered everywhere | Reduce contrast except at focal point |
| Colors clash | Using fully saturated everywhere | Desaturate background colors |
| Looks amateur | Hard edges everywhere | Add soft transitions in nature |

---

## SUMMARY: THE GOLDEN RULES

1. **Value first, color second, detail last**
2. **One light source, consistent throughout**
3. **5 values on every form** (don't forget halftone and reflected light)
4. **Silhouette must read clearly**
5. **Atmospheric perspective = color shift, NOT just alpha**
6. **Squint to check value grouping**
7. **Highest contrast at focal point only**
8. **Test at 25% scale for readability**

---

*Document created: January 6, 2026*  
*Source: Classical art fundamentals research + lessons learned from Art Study #1-3*
