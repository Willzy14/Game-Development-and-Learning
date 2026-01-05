# 🐛 DEBUGGING & QUALITY

**Purpose:** Bug solutions, testing checklists, code standards, debugging strategies  
**When to Read:** Hit a bug, before shipping, code review

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|-----------------|
| 2026-01-05   | 2026-01-05     | Added file size guidelines & naming conventions |
<!-- END METADATA -->

**Related Documents:**
- [01-CORE_RULES.md](./01-CORE_RULES.md) - Prevention checklists
- [../FAILURE_ARCHIVE.md](../FAILURE_ARCHIVE.md) - Historical failures
- [08-QUICK_REFERENCE.md](./08-QUICK_REFERENCE.md) - Quick fix snippets

---

## TABLE OF CONTENTS

1. [Critical Bugs Reference](#critical-bugs-reference)
2. [Debugging Strategies](#debugging-strategies)
3. [Testing Checklists](#testing-checklists)
4. [Code Quality Standards](#code-quality-standards)

---

## CRITICAL BUGS REFERENCE

### Quick Lookup Table

| Bug | Symptom | Root Cause | Solution |
|-----|---------|------------|----------|
| Element ID Mismatch | `Cannot read properties of null` | HTML ID ≠ JS selector | Audit all getElementById calls |
| Audio Won't Play | Silence on first load | Browser autoplay policy | Initialize audio in user gesture |
| Server Stops | Connection refused | Background process killed | Use `nohup` or `&` operator |
| Touch Not Working | Buttons unresponsive | Missing IDs on buttons | Add `id` attributes to elements |
| Music Volume Broken | Slider doesn't affect music | Only masterVolume property | Add separate musicVolume + updateMusicVolume() |
| Fullscreen Not Centering | Canvas stuck at top | Missing align-items | Add `align-items: center` to fullscreen CSS |
| Ball Stuck in Paddle | Ball trapped inside | No direction check | Add `ball.dy < 0` check |
| Multiple Brick Hits | Ball destroys many at once | No collision limit | Add `break` after first collision |
| API Type Mismatch | Web Audio crashes | String passed for number | Verify function signatures |
| Canvas Path Not Closed | Rendering freezes | Missing closePath() | Always close canvas paths |
| Click/Pop Audio | Harsh sound artifacts | Sudden gain changes | Use gain envelopes |
| Double Event Firing | Action triggers twice | Touch + click on mobile | Use `e.preventDefault()` |

---

### Bug Details

#### Element ID Mismatch

**Symptom:**
```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
```

**Cause:** JavaScript is trying to access an element that doesn't exist because:
- Typo in ID (`settingsBtn` vs `settings-btn`)
- Element not in HTML
- Script runs before DOM is ready

**Solution:**
```javascript
// 1. Define IDs in HTML FIRST
<button id="settingsBtn">Settings</button>

// 2. COPY-PASTE IDs to JS (don't type manually)
const settingsBtn = document.getElementById('settingsBtn');

// 3. Add null check
if (settingsBtn) {
    settingsBtn.addEventListener('click', handler);
}

// 4. Or wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
});
```

**Prevention:** See Rule 3 in [01-CORE_RULES.md](./01-CORE_RULES.md)

---

#### Audio Won't Play

**Symptom:** Complete silence, even when sound should play

**Cause:** Browser autoplay policy blocks AudioContext until user interaction

**Solution:**
```javascript
// Initialize AudioContext only after user gesture
document.addEventListener('keydown', () => audio.init(), { once: true });
document.addEventListener('click', () => audio.init(), { once: true });

// In AudioSystem.init():
init() {
    if (this.initialized) return;
    
    this.audioContext = new AudioContext();
    
    // Resume if suspended
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    
    this.initialized = true;
}
```

**Prevention:** See Rule 5 in [01-CORE_RULES.md](./01-CORE_RULES.md)

---

#### Music Volume Slider Doesn't Work

**Symptom:** Master volume slider works, but music slider has no effect

**Cause:** Only `masterVolume` property exists, no separate music control

**Solution:**
```javascript
class AudioSystem {
    constructor() {
        this.masterVolume = 0.3;
        this.musicVolume = 0.15;  // ADD THIS
    }
    
    setMusicVolume(value) {
        this.musicVolume = value;
        this.updateMusicVolume();  // AND THIS
    }
    
    updateMusicVolume() {
        if (this.backgroundMusic.masterMusicGain) {
            const effectiveVolume = this.masterVolume * this.musicVolume;
            this.backgroundMusic.masterMusicGain.gain.setValueAtTime(
                effectiveVolume,
                this.audioContext.currentTime
            );
        }
    }
}
```

---

#### Ball Stuck in Paddle

**Symptom:** Ball gets trapped inside paddle, bouncing rapidly

**Cause:** Ball is already inside paddle when collision detected, keeps bouncing

**Solution:**
```javascript
// Only bounce if ball is moving toward paddle
if (this.ball.dy > 0 && this.ballHitsPaddle()) {
    this.ball.bounceOffPaddle(this.paddle);
}

// OR: Move ball out of paddle before bouncing
if (this.ballHitsPaddle()) {
    this.ball.y = this.paddle.y - this.ball.radius;  // Position above
    this.ball.dy = -Math.abs(this.ball.dy);          // Force upward
}
```

---

#### Multiple Collisions Per Frame

**Symptom:** One hit destroys multiple bricks, or score increases too much

**Cause:** Loop continues checking after first collision

**Solution:**
```javascript
// Add break after first collision
for (const brick of this.bricks) {
    if (this.ball.collidesWith(brick)) {
        brick.destroy();
        this.score += 100;
        this.ball.bounce();
        break;  // STOP checking more bricks
    }
}

// Or use find instead of forEach
const hitBrick = this.bricks.find(b => this.ball.collidesWith(b));
if (hitBrick) {
    hitBrick.destroy();
    this.ball.bounce();
}
```

---

## DEBUGGING STRATEGIES

### Console Logging

**Development (OK):**
```javascript
console.log('State:', currentState);
console.log('Position:', head.x, head.y);
console.log('Collision detected:', hitBrick);
```

**Production (REMOVE!):**
```javascript
// DELETE all console.log in game loop
// They fire 60 times per second and kill performance!
```

**Conditional (Keep):**
```javascript
const DEBUG = false;

if (DEBUG) console.log('Debug:', data);

// Or feature-specific
const DEBUG_COLLISION = false;
const DEBUG_AUDIO = false;
```

### Breakpoint Strategy

1. **Chrome DevTools** - F12 → Sources → Click line number
2. **Conditional breakpoints** - Right-click line → "Add conditional breakpoint"
3. **Logpoints** - Right-click → "Add logpoint" (logs without pausing)

### Common Debug Patterns

```javascript
// Verify function is being called
functionName() {
    console.log('functionName called');
    // ...
}

// Check variable values at specific points
if (ball.y > canvas.height) {
    console.log('Ball below canvas:', ball);
    debugger;  // Pauses execution here
}

// Track state changes
set currentState(value) {
    console.log('State changed:', this._currentState, '→', value);
    this._currentState = value;
}
```

### Element Inspection

```javascript
// Find all elements with IDs
document.querySelectorAll('[id]').forEach(el => console.log(el.id));

// Check if element exists
console.log('Button exists:', !!document.getElementById('settingsBtn'));

// Inspect element properties
const btn = document.getElementById('settingsBtn');
console.log(btn);
console.dir(btn);  // Shows all properties
```

---

## TESTING CHECKLISTS

### Pre-Launch Functionality

- [ ] Game starts from menu correctly
- [ ] Core mechanics work (movement, collision, scoring)
- [ ] Game over triggers at right conditions
- [ ] Restart fully resets game state
- [ ] High scores save and load correctly
- [ ] Pause works (button + keyboard)
- [ ] All buttons/controls respond

### Audio Testing

- [ ] Sound effects play on events
- [ ] Background music starts with game
- [ ] Background music stops at game over
- [ ] Master volume slider affects all sounds
- [ ] Music volume slider affects only music
- [ ] No audio errors in console
- [ ] Audio works after tab switch
- [ ] No click/pop artifacts

### UI/UX Testing

- [ ] Settings modal opens/closes
- [ ] All settings sliders work in real-time
- [ ] Settings persist after refresh
- [ ] Fullscreen enters/exits properly
- [ ] Canvas centers in fullscreen
- [ ] Touch controls appear on mobile
- [ ] Touch controls hide on desktop
- [ ] All text is readable

### Data Persistence Testing

- [ ] High scores persist after refresh
- [ ] Settings persist after refresh
- [ ] Game works in private/incognito mode
- [ ] Reset buttons work with confirmation

### Cross-Device Testing

| Device | Method | What to Check |
|--------|--------|---------------|
| Desktop Chrome | Direct | Full functionality |
| Desktop Firefox | Direct | Audio compatibility |
| Mobile (simulated) | DevTools device toggle | Touch controls, layout |
| Mobile (real) | Local network IP | Actual touch response |
| Tablet | DevTools resize | Responsive layout |

### Console Audit

**Clean console shows:**
- Initial game setup messages (once)
- Audio initialization (once)
- Intentional game events

**Red flags (FIX IMMEDIATELY):**
- `Cannot read properties of null`
- `Uncaught TypeError`
- `Uncaught ReferenceError`
- Any error in red
- Warnings repeating every frame

---

## CODE QUALITY STANDARDS

### Naming Conventions

```javascript
// Classes: PascalCase
class HighScoreManager {}
class ParticleSystem {}
class AudioSystem {}

// Functions/Methods: camelCase
function updateScoreDisplay() {}
function playBackgroundMusic() {}

// Constants: UPPER_SNAKE_CASE
const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const MAX_PARTICLES = 500;

// Variables: camelCase
let currentState = GameState.MENU;
let lastMoveTime = 0;

// Private properties: _prefixed
_internalState = null;
_calculatePosition() {}

// Boolean variables: is/has/can prefix
let isPlaying = false;
let hasStarted = true;
let canShoot = true;
```

### File Organization

```javascript
// 1. Constants
const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;

// 2. Utility Functions
function lerp(a, b, t) {}
function clamp(val, min, max) {}

// 3. Classes (dependency order - base classes first)
class Entity {}
class Particle extends Entity {}
class Snake {}
class Game {}

// 4. Global Instances
const game = new Game();
const audio = new AudioSystem();

// 5. DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 6. Event Listeners
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('click', handleClick);

// 7. Initialization
function init() {
    game.reset();
    gameLoop();
}

init();
```

### File Size Guidelines

| File Size | Status | Action |
|-----------|--------|--------|
| < 300 lines | ✅ Good | Single responsibility, easy to understand |
| 300-500 lines | ⚠️ Watch | Consider if it's doing too much |
| 500-800 lines | 🔶 Split soon | Look for natural separation points |
| > 800 lines | 🔴 Split now | File is too large to maintain |

**Signs a file needs splitting:**
- Scrolling constantly to find things
- Multiple unrelated concerns in one file
- Hard to name the file (too generic)
- Changes in one area break another

### Naming Conventions

```javascript
// Files
game.js         // Main game logic
audio.js        // Audio system
style.css       // Styles (singular)
index.html      // Entry point

// Classes - PascalCase
class GameManager {}
class AudioSystem {}
class ParticleEmitter {}

// Functions/Methods - camelCase
function updateGame() {}
function handleKeyDown() {}
game.checkCollision();

// Constants - SCREAMING_SNAKE_CASE
const MAX_ENEMIES = 10;
const CANVAS_WIDTH = 800;
const GameState = { MENU: 'menu', PLAYING: 'playing' };

// Variables - camelCase
let currentScore = 0;
let isGameRunning = false;
const playerPosition = { x: 0, y: 0 };

// Private/Internal - _prefixed (convention)
this._internalState = {};
function _helperFunction() {}

// Boolean variables - is/has/can prefix
let isPlaying = false;
let hasShield = true;
let canShoot = false;

// Event handlers - handle prefix
function handleKeyDown(e) {}
function handleClick(e) {}
function handleTouchStart(e) {}

// HTML IDs - camelCase (matches JS convention)
<button id="startBtn">
<canvas id="gameCanvas">
<div id="settingsModal">
```

### Comment Standards

```javascript
// ============================================
// SECTION HEADER
// ============================================

// Single line explanation for non-obvious code

/*
 * Multi-line comment for complex logic
 * - Explains why, not what
 * - Includes edge cases handled
 */

/**
 * JSDoc for public/important functions
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @returns {boolean} True if collision detected
 */
function checkCollision(x, y) {}

// TODO: Brief description of what needs doing
// FIXME: Description of known bug
// HACK: Explanation of why this workaround exists
```

### Code Smells to Avoid

```javascript
// ❌ Magic numbers
if (x > 800) {}

// ✅ Named constants
const CANVAS_WIDTH = 800;
if (x > CANVAS_WIDTH) {}

// ❌ Deep nesting
if (a) {
    if (b) {
        if (c) {
            // ...
        }
    }
}

// ✅ Early returns
if (!a) return;
if (!b) return;
if (!c) return;
// ...

// ❌ Long functions (>50 lines)
// ✅ Break into smaller, focused functions

// ❌ Repeated code
// ✅ Extract to reusable function
```

### Performance Standards

```javascript
// ❌ Creating objects in render loop
render() {
    const gradient = ctx.createLinearGradient(...);  // 60x per second!
}

// ✅ Create once, store as property
constructor() {
    this.gradient = ctx.createLinearGradient(...);
}

// ❌ Console.log in game loop
update() {
    console.log('position:', this.x, this.y);  // 60 logs per second!
}

// ✅ Remove or make conditional
const DEBUG = false;
if (DEBUG) console.log('position:', this.x, this.y);

// ❌ Recalculating static values
render() {
    const halfWidth = canvas.width / 2;  // Same every frame
}

// ✅ Calculate once
this.halfWidth = canvas.width / 2;
```

---

## FAILURE ARCHIVE REFERENCE

For a complete list of past mistakes and lessons learned, see:
**[../FAILURE_ARCHIVE.md](../FAILURE_ARCHIVE.md)**

This document contains:
- Mistakes made during development
- Root cause analysis
- Prevention strategies
- Pattern recognition for common failure types

**Read the Failure Archive before:**
- Making significant changes to working code
- Creating V2/upgraded versions
- Implementing features that failed before

---

*Last Updated: January 5, 2026*  
*Bugs Documented Through: Tier 1 Complete (4 Games)*
