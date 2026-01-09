# 006 - Asteroids v2 Retrospective

**Game:** Asteroids v2 - Gravity Wells Edition  
**Tier:** 2 (Core Mechanics)  
**Date:** January 8, 2026  
**Status:** ✅ Playable Demo Complete (Audio Stubs Only)  
**Session Type:** Decision Graph Test Run

---

## Project Overview

### Goal
Build Asteroids from scratch to test the Decision Graph system and validate the GAME_SESSION_PROMPT workflow.

### Interrogation Answers (Q0-Q9)
- **Task Type:** New from scratch
- **Scope:** Playable demo
- **Platform:** Web Canvas 2D
- **Genre:** Shooter (classic arcade)
- **Movement:** Rotation-based + thrust (Asteroids style)
- **Shooting:** Single shot + hold-to-charge
- **Screen:** Wrap (toroidal)
- **Visuals:** Painterly style (warm/cool harmony, inspired by Art Study 007)
- **Colors:** Vibrant/saturated
- **Audio:** Procedural Web Audio (stub only - not implemented)

### Creative Additions
- **Gravity Wells:** Some large asteroids contain gravity wells that spawn when destroyed, pulling ship and bullets
- **Combo System:** Rapid kills build multiplier (up to 10x)
- **Charge Shot:** Hold space for powerful shot that can destroy multiple asteroids

---

## What Went Well ✅

### 1. Modular Architecture (Eventually)
After a mid-session refactor, achieved clean separation:
- `game.js` (733 lines) - Pure mechanics, `getState()` pattern
- `theme.js` (761 lines) - All rendering, painterly style
- `audio.js` (85 lines) - Stub interface ready for Phase 7

**Key Success:** The refactor proved the architecture works - extracting visuals was mechanical, not creative work.

### 2. Painterly Art Style
Using Art Study 007 (Forest Temple) as reference produced excellent results:
- Warm/cool color harmony (golden bullets vs cool ship)
- Soft gradients instead of hard edges
- Atmospheric depth (nebula clouds, twinkling stars)
- Radial gradients on asteroids (stone-like)

**User Quote:** "this looks way cooler! so much better, really impressed"

### 3. Proof-of-Fun Gate
Natural checkpoint worked - confirmed game was "hard but fun" before polish phase.

### 4. Iterative User Feedback
Responded quickly to issues:
- Charge shot too slow → Reduced from 800ms to 500ms
- Score/combo too small → Made much larger with flash effects
- Ship too small → Increased from 15 to 24
- Bullets too big → Added SETTINGS for bullet sizes
- Instant death → Added 3-life system with respawn invulnerability

### 5. Creative Mechanics
Gravity wells added genuine gameplay depth - not just a clone.

---

## What Went Wrong ❌

### 1. Architecture Violation (CRITICAL)
**The Mistake:** Built all pixel art visuals directly in `game.js` with `draw()` methods inside classes.

**Why It Happened:** 
- Didn't load 17-MODULAR_ARCHITECTURE.md before Phase 6
- Got excited about visuals and forgot the separation principle
- Habit from earlier games that predated modular architecture rule

**Impact:** Required full refactor mid-session to extract visuals to theme.js

**Fix Applied:** Updated GAME_SESSION_PROMPT.md with Hard Rule #6:
```
6. MUST use modular architecture: mechanics in game.js, visuals in theme.js, audio in audio.js
   - BEFORE Phase 6: Load docs/bible/17-MODULAR_ARCHITECTURE.md
   - game.js: NO draw() methods, NO colors - only getState() methods
   - theme.js: THEME object with render(gameState) function
```

### 2. Missing Start Screen
Forgot to add 'ready' state - game launched directly into play without "Press ENTER to start".

### 3. Hardcoded Values
Bullet sizes were hardcoded (4/8) instead of using SETTINGS object - had to add `bulletSize` and `chargedBulletSize` settings.

### 4. HTML/Canvas Conflict
Old HTML HUD element with heart symbols (`♥♥♥`) conflicted with canvas-based lives display - caused confusion about whether lives were updating.

### 5. Audio Not Completed
`audio.js` contains only stub methods - Phase 7 was never completed.

---

## Key Learnings

### Technical Insights

**1. getState() Pattern Works**
Classes with `getState()` methods cleanly separate data from rendering:
```javascript
// In game.js
getState() {
    return {
        x: this.x, y: this.y, angle: this.angle,
        size: this.size, thrusting: this.thrusting,
        charging: isCharging, chargePercent: ...
    };
}

// In theme.js - render uses state, never touches game objects
drawShip(shipState) {
    const { x, y, angle, size, thrusting } = shipState;
    // All rendering code here
}
```

**2. Reference Art Improves Results**
Using Art Study 007 as explicit reference produced cohesive style - not just "make it painterly" but specific techniques:
- Warm/cool contrast
- Soft radial gradients
- Atmospheric depth layers

**3. Lives System Needs Multiple Changes**
Adding lives required touching: SETTINGS, state variables, collision handling, respawn logic, UI state, and theme rendering. Plan for this.

### Process Improvements

**1. Load Architecture Doc BEFORE Implementation**
The modular architecture doc existed - just wasn't loaded. Add to mandatory pre-phase checklist.

**2. Game States Checklist**
Every game needs: `ready`, `playing`, `paused`, `gameover`. Don't forget the start screen.

**3. Remove HTML HUD When Using Canvas UI**
If all UI is canvas-rendered, remove any HTML HUD elements to avoid conflicts.

---

## Code Patterns Worth Keeping

### 1. Centralized Settings Object
```javascript
const SETTINGS = {
    shipSize: 24,
    bulletSize: 3,
    chargedBulletSize: 6,
    // All tunable values in one place
};
```

### 2. Game State for Theme
```javascript
function getGameState() {
    return {
        canvas, ship: ship.getState(),
        bullets: bullets.map(b => b.getState()),
        asteroids: asteroids.map(a => a.getState()),
        ui: { displayedScore, combo, lives, ... },
        screenShake, state: gameState, score
    };
}
```

### 3. Painterly Gradients
```javascript
// Radial gradient for 3D-ish rocks
const grad = ctx.createRadialGradient(r * -0.3, r * -0.3, 0, 0, 0, r * 1.1);
grad.addColorStop(0, COLORS.asteroidHighlight);  // Top-left lit
grad.addColorStop(0.3, COLORS.asteroidLight);
grad.addColorStop(0.7, COLORS.asteroidMid);
grad.addColorStop(1, COLORS.asteroidDark);       // Edge shadow
```

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `game.js` | 733 | Complete mechanics (ship, bullets, asteroids, gravity wells, combo, lives) |
| `theme.js` | 761 | Painterly rendering (Forest Temple inspired) |
| `audio.js` | 85 | Stub only - ready for implementation |
| `index.html` | ~65 | Clean wrapper, no HTML HUD |

---

## Time Investment

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Interrogation | 5 min | 10 min | Good - comprehensive answers |
| Greybox | 30 min | 45 min | Added gravity wells, combo system |
| Proof-of-Fun | 5 min | 5 min | Passed on first check |
| Visual Polish | 60 min | 90 min | Included refactor to modular |
| Iteration | N/A | 30 min | Ship size, bullets, lives, start screen |
| **Total** | ~100 min | ~180 min | Refactor added ~40min |

---

## Incomplete Work

### Audio System (Phase 7)
All methods are stubs in audio.js:
- `playShoot()` - Laser sound
- `playChargedShoot()` - Powerful bass shot
- `playThrust()` - Engine rumble
- `playExplosion(size)` - Size-based explosion
- `playGravityWellSpawn()` - Whoosh
- `playGravityWellDestroy()` - Implosion
- `playComboIncrease(level)` - Rising pitch
- `playShipDestroy()` - Death sound
- `playUISelect()` - Menu blip

---

## Recommendations for Next Time

### Keep Doing
1. User interrogation before coding
2. Proof-of-fun checkpoint before polish
3. Reference existing art studies for style
4. Iterate on user feedback quickly
5. Use SETTINGS object for all tunable values

### Stop Doing
1. Building visuals in game.js
2. Forgetting start screen state
3. Hardcoding values that should be settings
4. Leaving HTML HUD when using canvas UI

### Start Doing
1. Load 17-MODULAR_ARCHITECTURE.md BEFORE Phase 6
2. Use game state checklist (ready/playing/paused/gameover)
3. Complete audio in same session (don't leave stubs)

---

## Final Assessment

**Overall:** Strong success despite mid-session architecture violation. The game is fun, looks great, and the modular refactor proved the architecture pattern works. The violation and fix actually strengthened the documentation.

**Biggest Win:** Painterly art style using Art Study reference - cohesive and beautiful.

**Biggest Regret:** Had to refactor instead of building correctly first. Cost ~40 minutes.

**Fun Factor:** ⭐⭐⭐⭐ (4/5) - Hard but satisfying, gravity wells add real depth.

---

*Retrospective completed: January 8, 2026*
