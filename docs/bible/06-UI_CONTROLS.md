# 🏛️ UI & CONTROLS

**Purpose:** Modal dialogs, responsive design, touch controls, settings UI  
**When to Read:** Building UI, adding settings menu, implementing mobile controls

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-05   | 2026-01-05     | Snake V2 mobile UI complete |
<!-- END METADATA -->

**Related Documents:**
- [05-TECHNOLOGIES.md](./05-TECHNOLOGIES.md) - Touch Events API
- [01-CORE_RULES.md](./01-CORE_RULES.md) - Rule 3: HTML IDs Before JS
- [07-DEBUG_QUALITY.md](./07-DEBUG_QUALITY.md) - UI bug solutions

---

## TABLE OF CONTENTS

1. [Modal Pattern](#modal-pattern)
2. [Settings UI](#settings-ui)
3. [Touch Controls](#touch-controls)
4. [Responsive Design](#responsive-design)
5. [Button & Control Styling](#button--control-styling)

---

## MODAL PATTERN

### HTML Structure

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
        <div class="modal-footer">
            <button id="saveSettings">Save</button>
        </div>
    </div>
</div>
```

### CSS

```css
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    margin: 10% auto;
    padding: 0;
    border-radius: 15px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
    margin: 0;
    color: #00ff88;
}

.close-btn {
    background: transparent;
    border: none;
    color: #888;
    font-size: 24px;
    cursor: pointer;
    padding: 5px 10px;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #ff6b6b;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 15px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: right;
}
```

### JavaScript

```javascript
const modal = document.getElementById('settingsModal');
const openBtn = document.getElementById('settingsBtn');
const closeBtn = document.getElementById('closeModal');

// Open modal
openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Close methods
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Click outside to close
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Escape key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});
```

---

## SETTINGS UI

### Volume Sliders

```html
<div class="setting-row">
    <label for="masterVolume">🔊 Master Volume</label>
    <div class="slider-container">
        <input type="range" id="masterVolume" min="0" max="100" value="30">
        <span class="slider-value" id="masterVolumeValue">30%</span>
    </div>
</div>

<div class="setting-row">
    <label for="musicVolume">🎵 Music Volume</label>
    <div class="slider-container">
        <input type="range" id="musicVolume" min="0" max="100" value="15">
        <span class="slider-value" id="musicVolumeValue">15%</span>
    </div>
</div>
```

```css
.setting-row {
    margin-bottom: 20px;
}

.setting-row label {
    display: block;
    margin-bottom: 8px;
    color: #ddd;
}

.slider-container {
    display: flex;
    align-items: center;
    gap: 15px;
}

input[type="range"] {
    flex: 1;
    height: 8px;
    -webkit-appearance: none;
    background: #333;
    border-radius: 4px;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #00ff88;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #00ff88;
    border-radius: 50%;
    cursor: pointer;
    border: none;
}

.slider-value {
    min-width: 45px;
    color: #00ff88;
    font-weight: bold;
}
```

```javascript
const masterSlider = document.getElementById('masterVolume');
const masterValue = document.getElementById('masterVolumeValue');

masterSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    masterValue.textContent = `${value}%`;
    
    // Apply immediately
    audio.setMasterVolume(value / 100);
    
    // Save setting
    settings.masterVolume = parseInt(value);
    settings.save();
});

// Initialize from saved settings
masterSlider.value = settings.masterVolume;
masterValue.textContent = `${settings.masterVolume}%`;
```

### Toggle Switches

```html
<div class="setting-row">
    <label>
        <input type="checkbox" id="showFPS">
        <span class="toggle-label">📊 Show FPS Counter</span>
    </label>
</div>
```

```css
.setting-row label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    accent-color: #00ff88;
}
```

### Dropdown Select

```html
<div class="setting-row">
    <label for="touchControls">📱 Touch Controls</label>
    <select id="touchControls">
        <option value="auto">Auto-detect</option>
        <option value="always">Always Show</option>
        <option value="never">Never Show</option>
    </select>
</div>
```

```css
select {
    width: 100%;
    padding: 10px;
    background: #2a2a4a;
    border: 1px solid #444;
    border-radius: 5px;
    color: #ddd;
    font-size: 14px;
}

select:focus {
    border-color: #00ff88;
    outline: none;
}
```

### Danger Buttons

```html
<div class="setting-row danger-zone">
    <h3>⚠️ Danger Zone</h3>
    <button id="resetScores" class="danger-btn">Reset High Scores</button>
    <button id="resetAll" class="danger-btn">Reset All Data</button>
</div>
```

```css
.danger-zone {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ff6b6b33;
}

.danger-zone h3 {
    color: #ff6b6b;
    margin-bottom: 15px;
}

.danger-btn {
    background: transparent;
    border: 1px solid #ff6b6b;
    color: #ff6b6b;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 10px;
}

.danger-btn:hover {
    background: #ff6b6b;
    color: #1a1a2e;
}
```

```javascript
document.getElementById('resetScores').addEventListener('click', () => {
    if (confirm('Are you sure? This cannot be undone.')) {
        highScores.clear();
        alert('High scores cleared!');
    }
});
```

---

## TOUCH CONTROLS

### D-Pad Layout

```html
<div class="touch-controls" id="touchControls">
    <div class="dpad">
        <button class="dpad-btn dpad-up" id="dpadUp">▲</button>
        <button class="dpad-btn dpad-left" id="dpadLeft">◀</button>
        <button class="dpad-btn dpad-center"></button>
        <button class="dpad-btn dpad-right" id="dpadRight">▶</button>
        <button class="dpad-btn dpad-down" id="dpadDown">▼</button>
    </div>
    
    <div class="action-btns">
        <button class="action-btn" id="pauseBtn">⏸️</button>
    </div>
</div>
```

```css
.touch-controls {
    display: none;  /* Hidden by default */
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    gap: 20px;
}

.dpad {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(3, 60px);
    gap: 5px;
}

.dpad-btn {
    background: rgba(0, 255, 136, 0.2);
    border: 2px solid #00ff88;
    border-radius: 10px;
    color: #00ff88;
    font-size: 24px;
    cursor: pointer;
    
    /* Remove mobile highlights */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
}

.dpad-btn:active {
    background: rgba(0, 255, 136, 0.5);
    transform: scale(0.95);
}

/* Grid positioning */
.dpad-up    { grid-column: 2; grid-row: 1; }
.dpad-left  { grid-column: 1; grid-row: 2; }
.dpad-center{ grid-column: 2; grid-row: 2; background: transparent; border: none; }
.dpad-right { grid-column: 3; grid-row: 2; }
.dpad-down  { grid-column: 2; grid-row: 3; }

.action-btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.action-btn {
    width: 60px;
    height: 60px;
    background: rgba(255, 165, 0, 0.2);
    border: 2px solid #ffa500;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
```

```javascript
// D-pad input handling
const directions = ['Up', 'Down', 'Left', 'Right'];

directions.forEach(dir => {
    const btn = document.getElementById(`dpad${dir}`);
    if (!btn) return;
    
    // Touch support
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        game.setDirection(dir.toLowerCase());
    });
    
    // Mouse support (for testing)
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        game.setDirection(dir.toLowerCase());
    });
});
```

### Show/Hide Logic

```javascript
function updateTouchControlVisibility() {
    const touchControls = document.getElementById('touchControls');
    const setting = settings.showTouchControls;
    
    if (setting === 'always') {
        touchControls.style.display = 'flex';
    } else if (setting === 'never') {
        touchControls.style.display = 'none';
    } else {
        // Auto-detect
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        touchControls.style.display = isTouchDevice ? 'flex' : 'none';
    }
}
```

---

## RESPONSIVE DESIGN

### Breakpoints

```css
/* Desktop (default) */
canvas {
    width: 800px;
    height: 800px;
}

.touch-controls {
    display: none;
}

/* Tablet */
@media (max-width: 900px) {
    canvas {
        width: 95vw;
        height: 95vw;
        max-width: 700px;
        max-height: 700px;
    }
}

/* Mobile */
@media (max-width: 600px) {
    canvas {
        width: 95vw;
        height: 95vw;
        max-width: 400px;
        max-height: 400px;
    }
    
    .header {
        flex-direction: column;
        gap: 10px;
    }
    
    .header h1 {
        font-size: 1.5em;
    }
}

/* Hide touch on mouse devices */
@media (hover: hover) and (pointer: fine) {
    .touch-controls {
        display: none !important;
    }
}

/* Force show touch on touch devices */
@media (hover: none) and (pointer: coarse) {
    .touch-controls {
        display: flex !important;
    }
}
```

### Flexible Container

```css
.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    min-height: 100vh;
}

@media (max-width: 600px) {
    .game-container {
        padding: 10px;
    }
}
```

### Fullscreen CSS (Often Forgotten!)

```css
:fullscreen #gameContainer,
:-webkit-full-screen #gameContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;      /* CRITICAL - often missed! */
    width: 100vw;
    height: 100vh;
    background: #000;
}

:fullscreen canvas,
:-webkit-full-screen canvas {
    max-width: 95vmin;
    max-height: 95vmin;
}
```

---

## BUTTON & CONTROL STYLING

### Primary Button

```css
.btn-primary {
    background: linear-gradient(135deg, #00ff88, #00cc66);
    border: none;
    color: #000;
    padding: 12px 30px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
}

.btn-primary:active {
    transform: translateY(0);
}
```

### Secondary Button

```css
.btn-secondary {
    background: transparent;
    border: 2px solid #00ff88;
    color: #00ff88;
    padding: 10px 25px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: rgba(0, 255, 136, 0.1);
}
```

### Icon Button

```css
.btn-icon {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ddd;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
}
```

### Focus States (Accessibility)

```css
button:focus,
input:focus,
select:focus {
    outline: 2px solid #00ff88;
    outline-offset: 2px;
}

/* Remove outline for mouse users, keep for keyboard */
button:focus:not(:focus-visible) {
    outline: none;
}
```

---

*Last Updated: January 5, 2026*  
*UI Patterns Learned Through: Snake (Tier 1 Complete)*
