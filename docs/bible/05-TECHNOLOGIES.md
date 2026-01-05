# 🔧 TECHNOLOGIES REFERENCE

**Purpose:** API documentation for key web technologies used in game development  
**When to Read:** Using localStorage, Touch events, Fullscreen API, Performance API

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-05   | 2026-01-05     | Tier 1 complete - all APIs documented |
<!-- END METADATA -->

**Related Documents:**
- [02-AUDIO_MASTERY.md](./02-AUDIO_MASTERY.md) - Web Audio deep dive
- [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md) - Canvas 2D deep dive
- [06-UI_CONTROLS.md](./06-UI_CONTROLS.md) - Touch events in practice

---

## APIs COVERED

| API | Mastery Level | Primary Use |
|-----|---------------|-------------|
| Canvas 2D | Expert | All rendering (see 03-VISUAL_TECHNIQUES.md) |
| Web Audio | Advanced | Sound effects, music (see 02-AUDIO_MASTERY.md) |
| localStorage | Expert | Persistence (high scores, settings) |
| Touch Events | Advanced | Mobile controls |
| Fullscreen | Competent | Immersive play |
| Performance | Competent | FPS monitoring |

---

## LOCALSTORAGE API

### Mastery Level: Expert (after Space Invaders + Snake)

### Basic Operations

```javascript
// Write (synchronous)
localStorage.setItem('key', 'string value');

// Read (synchronous)
const value = localStorage.getItem('key');  // Returns string or null

// Delete
localStorage.removeItem('key');

// Clear all
localStorage.clear();
```

### Storing Objects (MUST use JSON)

```javascript
// ❌ WRONG - stores "[object Object]"
localStorage.setItem('data', { score: 100 });

// ✅ RIGHT - serialize to JSON
localStorage.setItem('data', JSON.stringify({ score: 100 }));

// Reading back
const data = JSON.parse(localStorage.getItem('data'));
```

### Error Handling (REQUIRED!)

localStorage can fail in:
- Private/Incognito browsing
- Storage quota exceeded
- Disabled by user

```javascript
function loadData(key, defaults) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaults;
    } catch (e) {
        console.warn('Storage access failed:', e);
        return defaults;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.warn('Storage save failed:', e);
        return false;
    }
}
```

### Key Naming Strategy

```javascript
// Use prefixed, descriptive keys to prevent collisions
const STORAGE_KEYS = {
    HIGH_SCORES: 'snake_high_scores',
    SETTINGS: 'snake_settings',
    STATS: 'snake_stats'
};
```

### Data Structures

**High Scores:**
```javascript
// Array of score objects, sorted descending
[
    { name: "Player", score: 1500, date: "2026-01-04T21:00:00.000Z" },
    { name: "Player", score: 1200, date: "2026-01-03T15:30:00.000Z" },
    // ... up to N entries
]
```

**Settings:**
```javascript
{
    masterVolume: 30,           // 0-100 (UI scale)
    musicVolume: 15,            // 0-100
    showFPS: false,
    showTouchControls: "auto"   // "auto" | "always" | "never"
}
```

**Stats:**
```javascript
{
    gamesPlayed: 42,
    totalScore: 15000,
    highestCombo: 12,
    totalPlayTime: 7200         // seconds
}
```

### Settings Manager Pattern

```javascript
class SettingsManager {
    constructor() {
        this.key = 'game_settings';
        this.defaults = {
            masterVolume: 30,
            musicVolume: 15,
            showFPS: false
        };
        this.settings = this.load();
        this.apply();
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.key);
            // Merge with defaults to handle new settings added later
            return { ...this.defaults, ...JSON.parse(saved) };
        } catch (e) {
            return { ...this.defaults };
        }
    }
    
    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.settings));
            this.apply();  // Always apply after save
        } catch (e) {
            console.warn('Settings save failed:', e);
        }
    }
    
    apply() {
        // Apply settings to game systems
        audio.setMasterVolume(this.settings.masterVolume / 100);
        audio.setMusicVolume(this.settings.musicVolume / 100);
        fpsCounter.visible = this.settings.showFPS;
    }
    
    reset() {
        this.settings = { ...this.defaults };
        this.save();
    }
}
```

### High Score Manager Pattern

```javascript
class HighScoreManager {
    constructor() {
        this.key = 'game_high_scores';
        this.maxEntries = 5;
        this.scores = this.load();
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.key);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
    
    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.scores));
        } catch (e) {
            console.warn('High scores save failed:', e);
        }
    }
    
    isHighScore(score) {
        if (this.scores.length < this.maxEntries) return true;
        return score > this.scores[this.scores.length - 1].score;
    }
    
    addScore(name, score) {
        this.scores.push({
            name: name,
            score: score,
            date: new Date().toISOString()
        });
        
        // Sort descending and trim
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, this.maxEntries);
        
        this.save();
    }
    
    clear() {
        if (confirm('Clear all high scores?')) {
            this.scores = [];
            this.save();
        }
    }
}
```

---

## TOUCH EVENTS API

### Mastery Level: Advanced (after Snake)

### Basic Touch Handling

```javascript
element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    console.log('Touch at:', touch.clientX, touch.clientY);
    e.preventDefault();  // Prevent scroll/zoom
});

element.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    // Track movement
    e.preventDefault();
});

element.addEventListener('touchend', (e) => {
    // Touch released
});
```

### Touch Event Properties

```javascript
e.touches        // All current touches
e.targetTouches  // Touches on this element
e.changedTouches // Touches that changed this event

// Single touch:
const touch = e.touches[0];
touch.clientX    // X relative to viewport
touch.clientY    // Y relative to viewport
touch.pageX      // X relative to page
touch.pageY      // Y relative to page
touch.identifier // Unique ID for this touch
```

### Supporting Both Touch and Click

```javascript
// ALWAYS support both for cross-device compatibility
button.addEventListener('touchstart', handleAction);
button.addEventListener('click', handleAction);

function handleAction(e) {
    e.preventDefault();  // Prevent double-firing on touch devices
    // ... action logic
}
```

### Preventing Default Behaviors

```javascript
// Prevent zoom on double-tap
element.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, { passive: false });

// CSS to prevent zoom/highlight
.touch-element {
    touch-action: manipulation;  /* Disable double-tap zoom */
    -webkit-tap-highlight-color: transparent;  /* No highlight */
    user-select: none;  /* No text selection */
}
```

### Mobile Detection

```javascript
// Check for touch capability
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// CSS media query (more reliable)
@media (hover: hover) and (pointer: fine) {
    /* Mouse/trackpad device */
    .touch-controls { display: none; }
}

@media (hover: none) and (pointer: coarse) {
    /* Touch device */
    .touch-controls { display: flex; }
}
```

### D-Pad Implementation

```html
<div class="dpad">
    <button class="dpad-btn dpad-up" id="dpadUp">▲</button>
    <button class="dpad-btn dpad-left" id="dpadLeft">◀</button>
    <button class="dpad-btn dpad-center"></button>
    <button class="dpad-btn dpad-right" id="dpadRight">▶</button>
    <button class="dpad-btn dpad-down" id="dpadDown">▼</button>
</div>
```

```javascript
['Up', 'Down', 'Left', 'Right'].forEach(dir => {
    const btn = document.getElementById(`dpad${dir}`);
    
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        game.setDirection(dir.toLowerCase());
    });
    
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        game.setDirection(dir.toLowerCase());
    });
});
```

---

## FULLSCREEN API

### Mastery Level: Competent (after Snake)

### Enter Fullscreen

```javascript
async function enterFullscreen(element) {
    try {
        if (element.requestFullscreen) {
            await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();  // Safari
        }
    } catch (err) {
        console.warn('Fullscreen not supported:', err);
    }
}

// Usage
fullscreenBtn.addEventListener('click', () => {
    enterFullscreen(document.getElementById('gameContainer'));
});
```

### Exit Fullscreen

```javascript
function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
    }
}
```

### Toggle Fullscreen

```javascript
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        enterFullscreen(element);
    } else {
        exitFullscreen();
    }
}
```

### Fullscreen Change Event

```javascript
document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    
    if (isFullscreen) {
        fullscreenBtn.textContent = '⛶ Exit';
    } else {
        fullscreenBtn.textContent = '⛶ Fullscreen';
    }
});
```

### Fullscreen CSS (CRITICAL!)

```css
/* Style the container when in fullscreen */
:fullscreen #gameContainer,
:-webkit-full-screen #gameContainer {
    display: flex;
    justify-content: center;
    align-items: center;      /* CRITICAL - often forgotten! */
    width: 100vw;
    height: 100vh;
    background: #000;
}

/* Scale canvas appropriately */
:fullscreen canvas,
:-webkit-full-screen canvas {
    max-width: 100vmin;
    max-height: 100vmin;
    width: auto;
    height: auto;
}
```

---

## PERFORMANCE API

### Mastery Level: Competent (after Snake)

### High-Precision Time

```javascript
// performance.now() gives sub-millisecond precision
const startTime = performance.now();
// ... expensive operation
const endTime = performance.now();
console.log(`Took ${endTime - startTime}ms`);
```

### FPS Counter

```javascript
class FPSCounter {
    constructor() {
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.visible = false;
    }
    
    update() {
        const now = performance.now();
        this.frameCount++;
        
        // Update FPS every second
        if (now >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    }
}

// In game loop:
fpsCounter.update();
fpsCounter.render(ctx);
```

### Frame Budget Monitoring

```javascript
// At 60fps, each frame has ~16.67ms budget
function monitorFrameTime() {
    let frameStart = performance.now();
    
    return {
        start() {
            frameStart = performance.now();
        },
        
        end() {
            const frameTime = performance.now() - frameStart;
            if (frameTime > 16.67) {
                console.warn(`Frame took ${frameTime.toFixed(2)}ms (over budget)`);
            }
        }
    };
}

const frameMon = monitorFrameTime();

function gameLoop() {
    frameMon.start();
    
    update();
    render();
    
    frameMon.end();
    requestAnimationFrame(gameLoop);
}
```

---

## BROWSER COMPATIBILITY

### Feature Detection Pattern

```javascript
// Check before using
if ('localStorage' in window) {
    // Safe to use localStorage
}

if ('AudioContext' in window || 'webkitAudioContext' in window) {
    // Safe to use Web Audio
}

if (document.fullscreenEnabled) {
    // Safe to use Fullscreen API
}
```

### Polyfill Pattern

```javascript
// AudioContext polyfill
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// requestAnimationFrame polyfill
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { return setTimeout(callback, 16); };
```

---

*Last Updated: January 5, 2026*  
*APIs Learned Through: Tier 1 Complete (4 Games)*
