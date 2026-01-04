# 🎮 Game Development Bible
## The Complete Reference Manual for Web-Based 2D Games

**Project:** Game Development Learning Journey  
**Games Completed:** 4 (Pong, Breakout, Space Invaders, Snake)  
**Total Development Time:** ~19.5 hours  
**Document Version:** 2.0 - Multi-Game Edition  
**Last Updated:** January 4, 2026

---

## 📋 Table of Contents

1. [Purpose & Usage](#1-purpose--usage)
2. [Core Principles](#2-core-principles)
3. [Technologies Reference](#3-technologies-reference)
4. [Game Development Patterns](#4-game-development-patterns)
5. [Skills Progression by Game](#5-skills-progression-by-game)
6. [Visual Techniques Encyclopedia](#6-visual-techniques-encyclopedia)
7. [Audio System Blueprint](#7-audio-system-blueprint)
8. [Data Persistence Patterns](#8-data-persistence-patterns)
9. [User Interface & Controls](#9-user-interface--controls)
10. [Problem Prevention Checklist](#10-problem-prevention-checklist)
11. [Bugs Encountered & Solutions](#11-bugs-encountered--solutions)
12. [Testing & Quality Assurance](#12-testing--quality-assurance)
13. [Code Quality Standards](#13-code-quality-standards)
14. [Quick Reference Cards](#14-quick-reference-cards)

---

## 1. Purpose & Usage

### What This Document Is
This bible contains **every significant lesson learned** across all games in this learning journey. It serves as:

1. **Quick Reference** - Look up proven patterns and code snippets
2. **Problem Prevention** - Avoid repeating past mistakes
3. **Onboarding Guide** - Any AI/developer can quickly understand our standards
4. **Progress Tracker** - See skills accumulated across all games

### How to Use This
- **Starting a new game?** → Check Section 10 (Prevention Checklist) first
- **Hit a bug?** → Check Section 11 (Bugs & Solutions)
- **Need code pattern?** → Check Section 4 (Patterns) or Section 14 (Quick Reference)
- **Adding audio/visuals?** → Check Sections 6 & 7

### Games Covered

| Game | Hours | Lines of Code | Key Skills |
|------|-------|---------------|------------|
| Pong | ~2h | 325 | Game loop, AABB collision, Web Audio |
| Breakout | ~3h | 470 | OOP classes, Grid systems, State machine |
| Space Invaders | ~7.5h | 974 | Projectiles, AI, Waves, localStorage |
| Snake | ~7h | 4,048 | Advanced art, Music, Mobile UX, All tier-1 features |

---

## 2. Core Principles

### 🔴 NON-NEGOTIABLE RULES

These rules exist because we broke them and paid the price. They are **never optional**.

#### Rule 1: Incremental Development
```
❌ WRONG: Add particles + screen shake + shields + new collision system at once
✅ RIGHT: Add particles → Test → Add screen shake → Test → Add shields → Test
```
**Origin:** Space Invaders V2 - Game completely broke when adding all features at once. Impossible to debug.

#### Rule 2: Backup Before Changes
```
BEFORE modifying a working game:
1. Copy entire folder to [game]-v[N]-[description]/
2. Test the backup works
3. ONLY THEN begin modifications
```
**Origin:** Space Invaders V2 - Saved entire project when V2 changes broke everything.

#### Rule 3: HTML IDs Before JavaScript
```
❌ WRONG: Write JS with getElementById, then create HTML with matching IDs
✅ RIGHT: Write HTML with all IDs first, then copy IDs exactly to JS
```
**Origin:** Snake - Multiple "Cannot read properties of null" errors from mismatched IDs.

#### Rule 4: Test After Each Change
```
Code change → Restart server → Hard refresh (Ctrl+Shift+R) → Test → Repeat
```
**Origin:** All games - Small changes can cascade into big problems.

#### Rule 5: Audio Requires User Gesture
```javascript
// Audio MUST be initialized from user gesture (click, keypress)
document.addEventListener('keydown', () => {
    audio.init(); // Initialize on first interaction
});
```
**Origin:** Pong - Browser autoplay policy blocks audio otherwise.

---

## 3. Technologies Reference

### 3.1 Canvas 2D API

**Mastery Level:** Expert (after Snake)

#### Essential Methods
```javascript
// Setup
const ctx = canvas.getContext('2d');

// Rectangles
ctx.fillRect(x, y, width, height);      // Solid rectangle
ctx.strokeRect(x, y, width, height);    // Outlined rectangle
ctx.clearRect(x, y, width, height);     // Clear area

// Paths (complex shapes)
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x, y);
ctx.arc(x, y, radius, startAngle, endAngle);
ctx.closePath();                         // ALWAYS close paths!
ctx.fill();
ctx.stroke();

// Text
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('text', x, y);

// Style
ctx.fillStyle = '#color';
ctx.strokeStyle = '#color';
ctx.lineWidth = 2;
ctx.globalAlpha = 0.5;

// Effects
ctx.shadowColor = '#color';
ctx.shadowBlur = 10;

// Transform (ALWAYS save/restore!)
ctx.save();
ctx.translate(x, y);
ctx.rotate(radians);
ctx.scale(x, y);
ctx.restore();
```

#### Gradient Patterns
```javascript
// Linear gradient (Snake body, backgrounds)
const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
gradient.addColorStop(0, '#00ff88');
gradient.addColorStop(0.5, '#00cc66');
gradient.addColorStop(1, '#009944');
ctx.fillStyle = gradient;

// Radial gradient (Glow effects, planets)
const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
glow.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
glow.addColorStop(1, 'rgba(0, 255, 136, 0)');
ctx.fillStyle = glow;
```

### 3.2 Web Audio API

**Mastery Level:** Advanced (after Snake)

#### Basic Sound Effect
```javascript
playBeep(frequency, duration, volume = 0.5) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.value = frequency;
    
    // CRITICAL: Envelope to prevent click/pop artifacts
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
}
```

#### Musical Notes Reference
```javascript
const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25
};

// Pentatonic scale (always sounds good)
const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00];
```

#### Oscillator Types
```javascript
osc.type = 'sine';      // Pure, clean tone
osc.type = 'triangle';  // Soft, mellow
osc.type = 'square';    // 8-bit/retro style
osc.type = 'sawtooth';  // Harsh, buzzy
```

### 3.3 localStorage API

**Mastery Level:** Expert (after Space Invaders + Snake)

```javascript
// ALWAYS wrap in try-catch (private browsing can fail)
loadData() {
    try {
        const saved = localStorage.getItem(this.key);
        return saved ? JSON.parse(saved) : this.defaults;
    } catch (e) {
        console.warn('Storage access failed:', e);
        return this.defaults;
    }
}

saveData(data) {
    try {
        localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
        console.warn('Storage save failed:', e);
    }
}
```

### 3.4 Touch Events API

**Mastery Level:** Advanced (after Snake)

```javascript
// Support BOTH touch and click for cross-device
button.addEventListener('touchstart', handleAction);
button.addEventListener('click', handleAction);

function handleAction(e) {
    e.preventDefault(); // Prevent double-firing on touch devices
    // ... action logic
}

// Touch event properties
element.addEventListener('touchstart', (e) => {
    e.touches[0].clientX;  // X position
    e.touches[0].clientY;  // Y position
    e.preventDefault();     // Prevent scroll/zoom
});
```

### 3.5 Fullscreen API

**Mastery Level:** Competent (after Snake)

```javascript
// Enter fullscreen
async function enterFullscreen(element) {
    try {
        await element.requestFullscreen();
    } catch (err) {
        console.warn('Fullscreen not supported:', err);
    }
}

// Exit fullscreen
function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// Listen for changes
document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    // Update UI accordingly
});
```

### 3.6 Performance API

**Mastery Level:** Competent (after Snake)

```javascript
// High-precision FPS counter
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFPS() {
    const now = performance.now();
    frameCount++;
    
    if (now >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
    }
}
```

---

## 4. Game Development Patterns

### 4.1 The Game Loop

**First Learned:** Pong | **Mastery:** Expert

```javascript
function gameLoop() {
    // 1. Update game state (if not paused)
    if (currentState === GameState.PLAYING && !isPaused) {
        game.update();
    }
    
    // 2. Render everything
    game.render(ctx);
    
    // 3. Schedule next frame
    requestAnimationFrame(gameLoop);
}

// Start the loop
gameLoop();
```

**Why requestAnimationFrame?**
- Syncs with display refresh rate (typically 60fps)
- Pauses when tab is hidden (saves CPU/battery)
- Provides timestamp for delta time calculations
- More efficient than setInterval

### 4.2 State Machine

**First Learned:** Pong | **Refined:** Breakout | **Mastery:** Expert

```javascript
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

// State-specific logic
function update() {
    switch (currentState) {
        case GameState.PLAYING:
            updateGameplay();
            break;
        case GameState.PAUSED:
            // Do nothing, but could animate pause screen
            break;
    }
}

// State-specific rendering
function render(ctx) {
    switch (currentState) {
        case GameState.MENU:
            renderMenu(ctx);
            break;
        case GameState.PLAYING:
            renderGame(ctx);
            break;
        case GameState.GAME_OVER:
            renderGameOver(ctx);
            break;
    }
}
```

### 4.3 Collision Detection

**First Learned:** Pong | **Extended:** Breakout, Space Invaders, Snake

#### AABB (Axis-Aligned Bounding Box)
```javascript
// Rectangle vs Rectangle
function rectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
```

#### Circle vs Rectangle (Ball vs Paddle)
```javascript
function circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    const distX = circle.x - closestX;
    const distY = circle.y - closestY;
    
    return (distX * distX + distY * distY) < (circle.radius * circle.radius);
}
```

#### Grid-Based (Snake)
```javascript
// Point collision (same grid cell)
function gridCollision(a, b) {
    return a.x === b.x && a.y === b.y;
}

// Self collision (head vs body)
function selfCollision(head, segments) {
    return segments.slice(1).some(seg => 
        seg.x === head.x && seg.y === head.y
    );
}
```

### 4.4 Direction Prevention (Snake-specific)

```javascript
setDirection(newDir) {
    const opposites = {
        'up': 'down', 'down': 'up',
        'left': 'right', 'right': 'left'
    };
    
    // Can't reverse into yourself
    if (newDir !== opposites[this.direction]) {
        this.nextDirection = newDir;
    }
}

move() {
    this.direction = this.nextDirection; // Apply queued direction
    // ... movement logic
}
```

### 4.5 Paddle Angle Reflection (Pong/Breakout)

```javascript
hitPaddle(paddle) {
    // Calculate hit position relative to paddle center (-1 to 1)
    const hitPos = (this.x - paddle.getCenter()) / (paddle.width / 2);
    
    // Convert to angle (-60 to 60 degrees)
    const angle = hitPos * (Math.PI / 3);
    
    // Set new velocity
    this.dx = Math.sin(angle) * this.speed;
    this.dy = -Math.abs(Math.cos(angle)) * this.speed; // Always bounce up
}
```

### 4.6 Enemy Formation Movement (Space Invaders)

```javascript
// Flag pattern for coordinated group behavior
let moveDirection = 1; // 1 = right, -1 = left
let moveDownNext = false;

function updateEnemies() {
    // Check if any enemy hit edge
    enemies.forEach(enemy => {
        if (enemy.x <= 0 || enemy.x >= CANVAS_WIDTH - ENEMY_WIDTH) {
            moveDownNext = true;
            moveDirection *= -1;
        }
    });
    
    // Move all enemies together
    enemies.forEach(enemy => {
        if (moveDownNext) {
            enemy.y += ENEMY_DROP_DISTANCE;
        }
        enemy.x += moveDirection * ENEMY_SPEED;
    });
    
    moveDownNext = false;
}
```

### 4.7 Particle System

**First Learned:** Space Invaders V2 | **Perfected:** Snake

```javascript
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.decay = 0.02;
        this.color = color;
        this.size = Math.random() * 5 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.life -= this.decay;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Cleanup pattern
particles = particles.filter(p => !p.isDead());
```

### 4.8 Screen Shake

**First Learned:** Space Invaders V2 | **Refined:** Snake

```javascript
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
    }
    
    shake(intensity, duration) {
        this.intensity = intensity;
        this.duration = duration;
    }
    
    apply(ctx) {
        if (this.duration > 0) {
            const offsetX = (Math.random() - 0.5) * this.intensity;
            const offsetY = (Math.random() - 0.5) * this.intensity;
            ctx.translate(offsetX, offsetY);
            this.duration--;
            this.intensity *= 0.9; // Decay
        }
    }
}

// Usage in render
ctx.save();
screenShake.apply(ctx);
// ... render game
ctx.restore();
```

---

## 5. Skills Progression by Game

### Game 1: Pong (~2 hours)
**Foundation Skills:**
- ✅ Canvas 2D basics (fillRect, arc, fillText)
- ✅ Game loop with requestAnimationFrame
- ✅ AABB collision detection
- ✅ Keyboard input handling (key object pattern)
- ✅ Simple AI (paddle tracking with tolerance)
- ✅ Basic state machine (MENU, PLAYING, GAME_OVER)
- ✅ Score tracking
- ✅ Web Audio API introduction
- ✅ Gain envelopes (fade in/out)

**Key Insight:** The update/render separation is fundamental to ALL games.

### Game 2: Breakout (~3 hours)
**Added Skills:**
- ✅ ES6 Classes (Paddle, Ball, Brick, Game)
- ✅ Grid-based level design (brick array)
- ✅ Destructible objects
- ✅ Lives system
- ✅ Level progression
- ✅ Ball angle based on paddle hit position
- ✅ Speed ramping with caps
- ✅ Extended state machine (BALL_LOST, LEVEL_COMPLETE)

**Key Insight:** OOP costs more setup time but pays off in maintainability.

### Game 3: Space Invaders (~7.5 hours)
**Added Skills:**
- ✅ Projectile systems (player + enemy bullets)
- ✅ Enemy formation AI (synchronized movement)
- ✅ Random enemy shooting (probability per frame)
- ✅ Wave progression with difficulty scaling
- ✅ localStorage for high scores
- ✅ Particle system
- ✅ Screen shake
- ✅ Shield barriers (destructible)
- ✅ Invincibility frames
- ✅ **Shared library extraction (Rule of Three)**

**Key Insight:** Incremental development is NON-NEGOTIABLE after V2 disaster.

### Game 4: Snake (~7 hours)
**Added Skills:**
- ✅ Grid-based movement
- ✅ Self-collision detection
- ✅ Direction queue (prevent 180° turns)
- ✅ Power-up system
- ✅ Combo system with multipliers
- ✅ 43 advanced visual techniques
- ✅ 4-layer procedural background music
- ✅ Complete settings system (persistence)
- ✅ Mobile touch controls (D-pad)
- ✅ Responsive design (media queries)
- ✅ Fullscreen API
- ✅ FPS counter
- ✅ Pause functionality
- ✅ Statistics tracking

**Key Insight:** Art and music can elevate a simple game to feel professional.

---

## 6. Visual Techniques Encyclopedia

### Categories Mastered

| Category | Techniques | First Used |
|----------|------------|------------|
| Gradients | Linear, radial, multi-stop | Breakout |
| Shadows | Glow, depth, multi-layer | Breakout |
| Particles | Explosion, trails, sparkles | Space Invaders |
| Animation | Pulse, wave, ease-in/out | Snake |
| Environment | Stars, planets, nebulae | Space Invaders/Snake |
| Entity | Eyes, segments, trails | Snake |
| Effects | Screen shake, flash | Space Invaders |

### Common Visual Patterns

#### Pulsing Effect
```javascript
const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
ctx.globalAlpha = pulse;
```

#### Glow Effect
```javascript
ctx.shadowColor = '#00ff88';
ctx.shadowBlur = 20;
ctx.fillText('GLOW', x, y);
```

#### Multi-Layer Glow (Intense)
```javascript
for (let i = 0; i < 3; i++) {
    ctx.shadowBlur = 10 + i * 10;
    ctx.fillText('INTENSE', x, y);
}
```

#### Linear Interpolation (Smooth Transitions)
```javascript
function lerp(start, end, t) {
    return start + (end - start) * t;
}
```

#### Easing Function
```javascript
const easeInOut = t => t < 0.5 
    ? 2 * t * t 
    : -1 + (4 - 2 * t) * t;
```

---

## 7. Audio System Blueprint

### Architecture
```
AudioSystem
├── audioContext        // Web Audio API context
├── masterVolume        // Overall volume (0-1)
├── musicVolume         // Background music only (0-1)
├── initialized         // Prevents re-initialization
└── backgroundMusic     // Music state object
    ├── playing
    ├── masterMusicGain // Volume control node
    └── [layer nodes]   // Bass, pad, melody, texture
```

### Background Music Layers (Snake)

| Layer | Frequency | Purpose | Volume |
|-------|-----------|---------|--------|
| Bass | 40-60 Hz | Foundation | 15% |
| Pad | Chord tones | Atmosphere | 20% |
| Melody | Pentatonic | Interest | 10% |
| Texture | High freq | Shimmer | 5% |

### Volume Control Pattern

**CRITICAL:** Separate `masterVolume` and `musicVolume` properties!

```javascript
class AudioSystem {
    constructor() {
        this.masterVolume = 0.3;
        this.musicVolume = 0.15; // Separate property!
    }
    
    updateMusicVolume() {
        if (this.backgroundMusic.masterMusicGain) {
            const newVolume = this.masterVolume * this.musicVolume;
            this.backgroundMusic.masterMusicGain.gain.setValueAtTime(
                newVolume, 
                this.audioContext.currentTime
            );
        }
    }
}
```

---

## 8. Data Persistence Patterns

### Storage Key Strategy
```javascript
// Use prefixed, descriptive keys to prevent collisions
const KEYS = {
    HIGH_SCORES: 'snake_high_scores',
    STATS: 'snake_stats',
    SETTINGS: 'snake_settings'
};
```

### Data Structures

**High Scores:**
```javascript
[
    { name: "Player", score: 1500, date: "2026-01-04T21:00:00.000Z" }
    // ... up to 5 entries
]
```

**Settings:**
```javascript
{
    masterVolume: 30,       // 0-100 (UI scale)
    musicVolume: 15,        // 0-100
    showFPS: false,
    showTouchControls: "auto"  // "auto" | "always" | "never"
}
```

### Settings Manager Pattern
```javascript
class SettingsManager {
    constructor() {
        this.key = 'game_settings';
        this.defaults = { /* defaults */ };
        this.settings = this.load();
        this.apply();
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.key);
            return { ...this.defaults, ...JSON.parse(saved) };
        } catch (e) {
            return { ...this.defaults };
        }
    }
    
    save() {
        localStorage.setItem(this.key, JSON.stringify(this.settings));
        this.apply(); // Always apply after save
    }
    
    apply() {
        // Apply settings to game systems
        audio.masterVolume = this.settings.masterVolume / 100;
        audio.musicVolume = this.settings.musicVolume / 100;
        audio.updateMusicVolume();
        // ... etc
    }
}
```

---

## 9. User Interface & Controls

### Modal Pattern

**HTML:**
```html
<div class="modal" id="settingsModal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>⚙️ Settings</h2>
            <button class="close-btn" id="closeModal">✕</button>
        </div>
        <div class="modal-body">
            <!-- Controls here -->
        </div>
    </div>
</div>
```

**CSS:**
```css
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
}

.modal-content {
    margin: 10% auto;
    max-width: 500px;
    animation: slideDown 0.3s;
}
```

**JS:**
```javascript
// Open
settingsBtn.onclick = () => modal.style.display = 'block';

// Close (multiple methods)
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
};
```

### Touch Control Layout (D-Pad)

```css
.dpad {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(3, 60px);
    gap: 5px;
}

.dpad-up    { grid-column: 2; grid-row: 1; }
.dpad-left  { grid-column: 1; grid-row: 2; }
.dpad-center{ grid-column: 2; grid-row: 2; }
.dpad-right { grid-column: 3; grid-row: 2; }
.dpad-down  { grid-column: 2; grid-row: 3; }

/* Remove mobile highlight */
.dpad-btn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}
```

### Responsive Breakpoints

```css
/* Desktop (default) */
canvas { width: 800px; height: 800px; }
.touch-controls { display: none; }

/* Tablet */
@media (max-width: 900px) {
    canvas { width: 95vw; height: 95vw; }
}

/* Mobile */
@media (max-width: 600px) {
    .header { flex-direction: column; }
    .touch-controls { flex-direction: column; }
}

/* Hide touch on mouse devices */
@media (hover: hover) and (pointer: fine) {
    .touch-controls { display: none !important; }
}
```

### Fullscreen CSS

```css
:fullscreen #gameContainer,
:-webkit-full-screen #gameContainer {
    display: flex;
    justify-content: center;
    align-items: center;      /* CRITICAL - was missing! */
    width: 100vw;
    height: 100vh;
    background: #000;
}
```

---

## 10. Problem Prevention Checklist

### Before Starting ANY New Game

- [ ] Create folder structure (index.html, style.css, game.js, audio.js)
- [ ] Set up server.sh script
- [ ] Define ALL HTML IDs before writing JavaScript
- [ ] Copy IDs exactly from HTML to JS
- [ ] Test basic canvas renders

### Before Adding Features

- [ ] Create backup: `cp -r game/ game-v[N]-[desc]/`
- [ ] Test backup works
- [ ] Plan to add ONE feature at a time
- [ ] Test after EACH feature

### Before Going to Production

- [ ] Remove all console.log statements (especially in game loop!)
- [ ] Test on desktop (Chrome, Firefox)
- [ ] Test mobile via DevTools device simulation
- [ ] Check console for errors
- [ ] Verify localStorage saves/loads
- [ ] Test audio plays after first interaction

### HTML/JS ID Matching

```html
<!-- Define in HTML FIRST -->
<button id="settingsBtn">⚙️</button>
<button id="closeModal">✕</button>
<input id="masterVolume" type="range">
<input id="musicVolume" type="range">
<button id="resetScores">Reset</button>
```

```javascript
// Copy IDs EXACTLY
const settingsBtn = document.getElementById('settingsBtn');
const closeModal = document.getElementById('closeModal');
const masterVolume = document.getElementById('masterVolume');
const musicVolume = document.getElementById('musicVolume');
const resetScores = document.getElementById('resetScores');
```

---

## 11. Bugs Encountered & Solutions

### Critical Bugs Reference

| Bug | Symptom | Root Cause | Solution |
|-----|---------|------------|----------|
| Element ID Mismatch | `Cannot read properties of null` | HTML ID ≠ JS selector | Audit all getElementById calls |
| Audio Won't Play | Silence on first load | Browser autoplay policy | Initialize audio in user gesture |
| Server Stops | Connection refused | Background process killed | Use `nohup` or `&` operator |
| Touch Not Working | Buttons unresponsive | Missing IDs on buttons | Add `id` attributes to elements |
| Music Volume Broken | Slider doesn't affect music | Only masterVolume property | Add separate musicVolume + updateMusicVolume() |
| Fullscreen Not Centering | Canvas stuck at top | Missing align-items | Add `align-items: center` to fullscreen CSS |
| Ball Stuck in Paddle | Ball trapped inside | No direction check | Add `ball.dx < 0` check |
| Multiple Brick Hits | Ball destroys many at once | No collision limit | Add `break` after first collision |
| API Type Mismatch | Web Audio crashes | String passed for number | Verify function signatures |
| Canvas Path Not Closed | Rendering freezes | Missing closePath() | Always close canvas paths |

### Debug Logging Strategy

**Development:**
```javascript
console.log('State:', currentState);
console.log('Position:', head.x, head.y);
```

**Production (REMOVE THESE!):**
```javascript
// DELETE all console.log in game loop
// They fire 60 times per second!
```

**Conditional (Keep for debugging):**
```javascript
const DEBUG = false;
if (DEBUG) console.log('Debug:', data);
```

---

## 12. Testing & Quality Assurance

### Pre-Launch Checklist

**Functionality:**
- [ ] Game starts from menu
- [ ] Core mechanics work (movement, collision, scoring)
- [ ] Game over triggers correctly
- [ ] Restart works
- [ ] High scores save and display

**Audio:**
- [ ] Sound effects play on events
- [ ] Background music starts/stops
- [ ] Master volume affects all sounds
- [ ] Music volume affects only music
- [ ] No audio errors in console

**UI/UX:**
- [ ] Settings modal opens/closes
- [ ] Volume sliders work in real-time
- [ ] Pause works (button + key)
- [ ] Fullscreen enters/exits
- [ ] FPS counter toggles
- [ ] Touch controls appear on mobile

**Data:**
- [ ] High scores persist after refresh
- [ ] Settings persist after refresh
- [ ] Reset scores works with confirmation

### Cross-Device Testing

| Device | Method | Verify |
|--------|--------|--------|
| Desktop Chrome | Direct | Full functionality |
| Desktop Firefox | Direct | Audio compatibility |
| Mobile (sim) | DevTools device toggle | Touch controls |
| Mobile (real) | Local network IP | Actual touch |
| Tablet | DevTools resize | Responsive layout |

### Console Error Audit

**Clean console shows:**
- Initial game setup (once)
- Audio initialization (once)
- Intentional game events

**Red flags (fix immediately!):**
- `Cannot read properties of null`
- `Uncaught TypeError`
- `Uncaught ReferenceError`
- Repeated warnings in loop

---

## 13. Code Quality Standards

### Naming Conventions

```javascript
// Classes: PascalCase
class HighScoreManager {}
class ParticleSystem {}

// Functions/Methods: camelCase
function updateScoreDisplay() {}
playBackgroundMusic() {}

// Constants: UPPER_SNAKE_CASE
const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;

// Variables: camelCase
let currentState = GameState.MENU;
let lastMoveTime = 0;

// Private: _prefixed
_internalMethod() {}
```

### File Organization

```javascript
// 1. Constants
const GRID_SIZE = 20;

// 2. Utility Functions
function lerp(a, b, t) {}

// 3. Classes (dependency order)
class Particle {}
class Snake {}
class Game {}

// 4. Global Instances
const game = new Game();

// 5. Event Listeners
document.addEventListener('keydown', handler);

// 6. Initialization
gameLoop();
```

### Comment Standards

```javascript
// ============================================
// SECTION HEADER
// ============================================

// Single line explanation

/*
 * Multi-line for complex logic
 * - Point 1
 * - Point 2
 */

/**
 * JSDoc for public functions
 * @param {number} x - Description
 * @returns {boolean} - Description
 */
```

---

## 14. Quick Reference Cards

### Canvas Context Cheat Sheet
```javascript
// Setup
const ctx = canvas.getContext('2d');

// Shapes
ctx.fillRect(x, y, w, h);
ctx.strokeRect(x, y, w, h);
ctx.clearRect(x, y, w, h);

// Paths
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x, y);
ctx.arc(x, y, r, 0, Math.PI * 2);
ctx.closePath();
ctx.fill(); / ctx.stroke();

// Style
ctx.fillStyle = '#color';
ctx.strokeStyle = '#color';
ctx.lineWidth = 2;
ctx.globalAlpha = 0.5;
ctx.shadowColor = '#color';
ctx.shadowBlur = 10;

// Text
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('text', x, y);

// Transform
ctx.save();
ctx.translate(x, y);
ctx.rotate(radians);
ctx.restore();
```

### Event Listeners Cheat Sheet
```javascript
// Keyboard
document.addEventListener('keydown', (e) => {
    e.key;        // 'ArrowUp', ' ', 'a'
    e.code;       // 'ArrowUp', 'Space', 'KeyA'
    e.preventDefault();
});

// Mouse
canvas.addEventListener('click', (e) => {
    e.offsetX; e.offsetY;  // Element coords
});

// Touch
element.addEventListener('touchstart', (e) => {
    e.touches[0].clientX;
    e.touches[0].clientY;
    e.preventDefault();
});

// Window
window.addEventListener('resize', handler);
document.addEventListener('fullscreenchange', handler);
```

### localStorage Cheat Sheet
```javascript
// Write
localStorage.setItem('key', JSON.stringify(data));

// Read
const data = JSON.parse(localStorage.getItem('key')) || defaults;

// Delete
localStorage.removeItem('key');

// Clear all
localStorage.clear();
```

### Web Audio Cheat Sheet
```javascript
// Setup
const ctx = new AudioContext();

// Tone
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);
osc.frequency.value = 440;
osc.type = 'sine'; // sine, triangle, square, sawtooth

// Envelope
gain.gain.setValueAtTime(0, ctx.currentTime);
gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

// Play
osc.start();
osc.stop(ctx.currentTime + 1);
```

### Server Management
```bash
# Start server
cd /path/to/game && python3 -m http.server 8080 &

# Check if running
ps aux | grep "http.server 8080"

# Stop server
pkill -f "http.server 8080"

# Get local IP for mobile testing
hostname -I
```

---

## Appendix: Reusable Components

These can be copied directly to new projects:

1. **SettingsManager class** - User preferences with persistence
2. **HighScoreManager class** - Leaderboard with localStorage
3. **AudioSystem class** - Sound effects and background music
4. **Particle class** - Visual effects system
5. **ScreenShake class** - Camera shake feedback
6. **Modal HTML/CSS** - Settings popup template
7. **Touch controls HTML/CSS** - Mobile D-pad template
8. **Responsive breakpoints** - Media query template
9. **server.sh** - Development server script

---

## Final Notes

This bible represents **~19.5 hours of learning** compressed into actionable patterns. Every bug documented was encountered and solved. Every pattern was tested in production across 4 complete games.

**The five fundamental principles:**

1. **Separation of concerns** - HTML structure, CSS style, JS behavior
2. **Progressive enhancement** - Core game first, then features one at a time
3. **Fail gracefully** - Always have defaults, always catch errors
4. **Test constantly** - Small changes, frequent testing
5. **Document as you go** - Future you will thank present you

**You are now equipped to build any 2D web game with confidence.**

---

*Document Version: 2.0*  
*Last Updated: January 4, 2026*  
*Games Completed: Pong, Breakout, Space Invaders, Snake* ✅
