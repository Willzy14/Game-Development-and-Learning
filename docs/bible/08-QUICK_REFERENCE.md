# ⚡ QUICK REFERENCE CARDS

**Purpose:** Copy-paste ready code snippets for rapid development  
**When to Read:** Need quick syntax lookup, starting new feature, forgot exact syntax

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-07   | 2026-01-07     | Added PRE-EXECUTION CHECKLIST |
<!-- END METADATA -->

**Related Documents:**
- [02-AUDIO_MASTERY.md](./02-AUDIO_MASTERY.md) - Full audio patterns
- [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md) - Full visual techniques
- [04-PATTERNS_REFERENCE.md](./04-PATTERNS_REFERENCE.md) - Full pattern details

---

## 🚨 PRE-EXECUTION CHECKLIST (INVOKE BEFORE ANY MAJOR TASK)

**Use this checklist before starting ANY game, theme, or art piece.**

Copy and complete this before writing code:

```markdown
### PRE-EXECUTION CHECKLIST

**Task:** [What am I about to build?]

#### 1. ARCHITECTURE CHECK
- [ ] Is this a GAME? → Use modular architecture (game.js + theme.js + audio.js)
- [ ] Is this a THEME? → Only touch theme.js, NEVER game mechanics
- [ ] Is this ART? → Apply restraint principle from start

#### 2. ART PROTOCOL CHECK (Rule 12.1)
- [ ] ColorUtils ready? (hexToRgb, withAlpha, blend, lighten, darken)
- [ ] NoiseUtils ready? (valueNoise2D for organic shapes)
- [ ] Soft edges planned? (No ruler-traceable lines)
- [ ] Atmospheric perspective? (Color shift, not alpha)
- [ ] Value bridging? (No hard color boundaries)

#### 3. RESTRAINT CHECK (The Most Important)
- [ ] Can I name the SPECIFIC PROBLEM each feature solves?
- [ ] What am I INTENTIONALLY NOT including?
- [ ] "Look how little I need" - fewer elements with strong hierarchy

#### 4. FAILURE PREVENTION
- [ ] Checked FAILURE_ARCHIVE.md for similar past mistakes?
- [ ] NOT changing game mechanics when doing visual work?
- [ ] One change at a time, test after each?

#### 5. VISION CHECK (Rule 12)
- [ ] Am I holding back features due to output limits?
- [ ] If yes: Request chunking, don't self-censor
- [ ] Full vision articulated before starting?

#### READY TO EXECUTE: [ ]
```

### When to Use This Checklist

| Trigger | Action |
|---------|--------|
| "Create a new game" | Full checklist |
| "Create a new theme" | Sections 1, 2, 3, 4 |
| "Create art study" | Sections 2, 3, 5 |
| "Add a feature" | Section 3, 4 |
| "Fix a bug" | Section 4 only |

### The Core Questions (Memorize These)

1. **"What specific problem does this solve?"** - If you can't answer, don't add it
2. **"What am I intentionally NOT doing?"** - Restraint defines quality
3. **"Am I touching things I shouldn't?"** - Modular boundaries exist for a reason

---

## CANVAS 2D CHEAT SHEET

```javascript
// Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Shapes
ctx.fillRect(x, y, width, height);      // Solid rectangle
ctx.strokeRect(x, y, width, height);    // Outlined rectangle
ctx.clearRect(x, y, width, height);     // Clear area

// Circle
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();  // or ctx.stroke();

// Path
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.closePath();  // Connect back to start
ctx.fill();  // or ctx.stroke();

// Style
ctx.fillStyle = '#00ff88';
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
ctx.globalAlpha = 0.5;

// Shadow/Glow
ctx.shadowColor = '#00ff88';
ctx.shadowBlur = 15;
// ... draw ...
ctx.shadowBlur = 0;  // Reset!

// Text
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';       // left, center, right
ctx.textBaseline = 'middle';    // top, middle, bottom
ctx.fillText('Hello', x, y);

// Transform (ALWAYS save/restore!)
ctx.save();
ctx.translate(x, y);
ctx.rotate(radians);
ctx.scale(sx, sy);
// ... draw at origin ...
ctx.restore();

// Gradient
const grad = ctx.createLinearGradient(x1, y1, x2, y2);
grad.addColorStop(0, '#color1');
grad.addColorStop(1, '#color2');
ctx.fillStyle = grad;

// Radial Gradient
const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
radial.addColorStop(0, 'rgba(255,255,255,1)');
radial.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = radial;
```

---

## WEB AUDIO CHEAT SHEET

```javascript
// Setup (must be in user gesture!)
const ctx = new AudioContext();

// Simple tone
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);

osc.type = 'sine';  // sine, triangle, square, sawtooth
osc.frequency.value = 440;

// Envelope (prevents clicks!)
const now = ctx.currentTime;
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(0.5, now + 0.01);  // Attack
gain.gain.linearRampToValueAtTime(0, now + 0.5);    // Release

osc.start(now);
osc.stop(now + 0.5);

// Frequency sweep
osc.frequency.setValueAtTime(800, now);
osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

// Filter
const filter = ctx.createBiquadFilter();
filter.type = 'lowpass';  // lowpass, highpass, bandpass
filter.frequency.value = 1000;
filter.Q.value = 5;
osc.connect(filter);
filter.connect(gain);

// Stereo panning
const panner = ctx.createStereoPanner();
panner.pan.value = 0;  // -1 (left) to +1 (right)
gain.connect(panner);
panner.connect(ctx.destination);
```

---

## EVENT LISTENERS CHEAT SHEET

```javascript
// Keyboard
document.addEventListener('keydown', (e) => {
    e.key;        // 'ArrowUp', ' ', 'a', 'Escape'
    e.code;       // 'ArrowUp', 'Space', 'KeyA'
    e.preventDefault();  // Stop default browser action
});

document.addEventListener('keyup', (e) => {
    // Key released
});

// Mouse
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
});

// Touch (support both!)
element.addEventListener('touchstart', handler);
element.addEventListener('click', handler);

function handler(e) {
    e.preventDefault();  // Prevent double-fire
    // Touch position:
    if (e.touches) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
    }
}

// Window
window.addEventListener('resize', () => {});
document.addEventListener('fullscreenchange', () => {});
document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
});
```

---

## LOCALSTORAGE CHEAT SHEET

```javascript
// Write (MUST stringify objects)
localStorage.setItem('key', JSON.stringify(data));

// Read (with default fallback)
const data = JSON.parse(localStorage.getItem('key')) || defaultValue;

// Delete
localStorage.removeItem('key');

// Safe wrapper
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.warn('Save failed:', e);
        return false;
    }
}

function loadData(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}
```

---

## COLLISION DETECTION CHEAT SHEET

```javascript
// Rectangle vs Rectangle (AABB)
function rectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Circle vs Circle
function circleCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < a.radius + b.radius;
}

// Circle vs Rectangle
function circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

// Point vs Rectangle
function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width &&
           py >= rect.y && py <= rect.y + rect.height;
}

// Grid-based (Snake)
function gridCollision(a, b) {
    return a.x === b.x && a.y === b.y;
}
```

---

## COMMON MATH CHEAT SHEET

```javascript
// Linear interpolation (smooth transitions)
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Clamp value to range
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Distance between points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Angle between points (radians)
function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

// Degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Radians to degrees
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Random integer in range (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random float in range
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Easing functions
const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;

// Pulse (0.6 to 1.0 oscillation)
const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
```

---

## GAME LOOP TEMPLATE

```javascript
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

function update() {
    if (currentState !== GameState.PLAYING) return;
    
    // Game logic here
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch (currentState) {
        case GameState.MENU:
            renderMenu();
            break;
        case GameState.PLAYING:
            renderGame();
            break;
        case GameState.PAUSED:
            renderGame();
            renderPauseOverlay();
            break;
        case GameState.GAME_OVER:
            renderGame();
            renderGameOver();
            break;
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

---

## SERVER COMMANDS

```bash
# Start server (foreground)
cd /path/to/game && python3 -m http.server 8080

# Start server (background)
cd /path/to/game && python3 -m http.server 8080 &

# Check if running
ps aux | grep "http.server 8080"

# Stop server
pkill -f "http.server 8080"

# Get local IP (for mobile testing)
hostname -I

# Access from mobile: http://[IP]:8080
```

---

## CSS RESPONSIVE TEMPLATE

```css
/* Desktop */
canvas {
    width: 800px;
    height: 800px;
}

/* Tablet */
@media (max-width: 900px) {
    canvas {
        width: 95vw;
        height: 95vw;
        max-width: 700px;
    }
}

/* Mobile */
@media (max-width: 600px) {
    canvas {
        width: 95vw;
        height: 95vw;
        max-width: 400px;
    }
}

/* Touch device detection */
@media (hover: none) and (pointer: coarse) {
    .touch-controls { display: flex; }
}

@media (hover: hover) and (pointer: fine) {
    .touch-controls { display: none; }
}
```

---

## MUSICAL NOTES REFERENCE

```javascript
const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
    G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25
};

// Pentatonic (always sounds good)
const PENTATONIC = [220, 261.63, 293.66, 329.63, 392]; // A minor

// Chords
const C_MAJOR = [261.63, 329.63, 392.00];   // C, E, G
const A_MINOR = [220.00, 261.63, 329.63];   // A, C, E
const Cm7 = [261.63, 311.13, 392.00, 466.16]; // C, Eb, G, Bb
```

---

## KEYBOARD CODES REFERENCE

```javascript
// Arrow keys
'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'

// Common game keys
'Space'     // Spacebar
'KeyW', 'KeyA', 'KeyS', 'KeyD'  // WASD
'Enter'     // Enter/Return
'Escape'    // Escape
'KeyP'      // P (pause)
'KeyM'      // M (mute)
'KeyF'      // F (fullscreen)

// Check multiple keys
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// In update:
if (keys['ArrowLeft'] || keys['KeyA']) moveLeft();
if (keys['ArrowRight'] || keys['KeyD']) moveRight();
```

---

*Last Updated: January 5, 2026*  
*Quick Reference for: Tier 1 Complete (4 Games)*
