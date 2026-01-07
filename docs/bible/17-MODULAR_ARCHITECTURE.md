# 🏗️ MODULAR GAME ARCHITECTURE

**Purpose:** Standard architecture separating mechanics from presentation for easy level/theme creation  
**When to Read:** Starting any new game, creating a new level/theme, reviewing game structure

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | Initial creation - Inca failure analysis |
<!-- END METADATA -->

**Related Documents:**
- [04-PATTERNS_REFERENCE.md](./04-PATTERNS_REFERENCE.md) - Game patterns
- [02-AUDIO_MASTERY.md](./02-AUDIO_MASTERY.md) - Audio implementation details
- [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md) - Rendering techniques

---

## ⚠️ WHY THIS EXISTS

**The Inca Disaster (January 6, 2026):**

Created a "reskin" of Breakout that accidentally changed 11 gameplay constants. The game played completely differently - easier, with bricks 220px lower. User noticed immediately.

**Root Cause:** Everything was in one file. When building the "reskin," constants got tweaked along with visuals.

**Solution:** Enforce separation at the architecture level. Mechanics in one file that NEVER gets copied for new levels.

---

## 🎯 THE PRINCIPLE

> **New levels = swap theme + audio files. Never touch mechanics.**

| File | Contains | When Creating New Level |
|------|----------|------------------------|
| `game.js` | ALL mechanics (physics, collision, scoring, state) | **NEVER COPY OR MODIFY** |
| `theme.js` | ALL visuals (colors, rendering, effects) | Copy and customize |
| `audio.js` | ALL sounds (effects, music) | Copy and customize |

---

## 📁 FOLDER STRUCTURE

### Base Game
```
games/tier-X/XXX-game-name/
├── index.html          # Loads: game.js + theme.js + audio.js
├── game.js             # MECHANICS ONLY (shared by all levels)
├── theme.js            # Default theme visuals
├── audio.js            # Default theme audio
└── levels/
    ├── jungle/
    │   ├── index.html      # Loads: ../game.js + jungle-theme.js + jungle-audio.js
    │   ├── jungle-theme.js
    │   └── jungle-audio.js
    └── desert/
        ├── index.html      # Loads: ../game.js + desert-theme.js + desert-audio.js
        ├── desert-theme.js
        └── desert-audio.js
```

### Key Points
- `game.js` lives in the parent folder and is shared
- Each level's `index.html` loads the PARENT's `game.js`
- Only theme and audio files are duplicated per level

---

## 🔒 game.js - MECHANICS FILE (LOCKED)

### What Goes Here
```javascript
// ============================================
// GAME CONSTANTS - LOCKED FOR ALL LEVELS
// ============================================
// ⚠️ NEVER modify these when creating a new level!

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_SPEED = 7;
const PADDLE_Y = CANVAS_HEIGHT - 40;

const BALL_RADIUS = 8;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_MAX = 12;
const BALL_SPEED_INCREASE = 0.2;

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

const INITIAL_LIVES = 3;
const POINTS_PER_BRICK = 10;
```

### What Classes Look Like
```javascript
class Paddle {
    constructor() {
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = PADDLE_Y;
        this.dx = 0;
    }
    
    // Physics only - NO render() method!
    update() {
        this.x += this.dx;
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
    }
    
    moveLeft() { this.dx = -PADDLE_SPEED; }
    moveRight() { this.dx = PADDLE_SPEED; }
    stop() { this.dx = 0; }
    
    getCenter() { return this.x + this.width / 2; }
    
    // Return data for renderer - don't render yourself
    getState() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Ball {
    constructor() {
        this.radius = BALL_RADIUS;
        this.reset();
    }
    
    reset() {
        this.x = CANVAS_WIDTH / 2;
        this.y = PADDLE_Y - 30;
        this.speed = BALL_SPEED_INITIAL;
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.abs(Math.cos(angle)) * this.speed;
    }
    
    // Physics only
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    // Return data for renderer
    getState() {
        return { x: this.x, y: this.y, radius: this.radius, speed: this.speed };
    }
}
```

### Game Loop Structure
```javascript
function gameLoop() {
    // 1. Update mechanics (game.js)
    update();
    
    // 2. Render visuals (theme.js)
    THEME.render(getGameState());
    
    // 3. Update audio (audio.js)
    AUDIO.update(getGameState());
    
    requestAnimationFrame(gameLoop);
}

// Provide game state to external renderers
function getGameState() {
    return {
        state: currentState,
        paddle: paddle.getState(),
        ball: ball.getState(),
        bricks: bricks.map(b => b.getState()),
        particles: particles,
        score: score,
        lives: lives,
        canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    };
}
```

### Event Callbacks for Theme/Audio
```javascript
// game.js defines events, theme/audio respond
function onBrickDestroyed(brick, x, y) {
    THEME.spawnBrickParticles(x, y, brick.color);
    AUDIO.playBrickHit(brick.row);
}

function onBallLost() {
    THEME.playDeathEffect();
    AUDIO.playLoseLife();
}

function onLevelComplete() {
    THEME.playVictoryEffect();
    AUDIO.playLevelComplete();
}
```

---

## 🎨 theme.js - VISUALS FILE (CUSTOMIZABLE)

### Interface Contract
Every theme.js MUST implement these functions:

```javascript
// ============================================
// THEME INTERFACE - All functions required
// ============================================
const THEME = {
    // Canvas reference (set during init)
    ctx: null,
    
    // Initialize theme
    init(canvas) {
        this.ctx = canvas.getContext('2d');
    },
    
    // ============================================
    // REQUIRED DRAW FUNCTIONS
    // ============================================
    
    drawBackground(W, H) {
        // Draw the game background
    },
    
    drawPaddle(paddle) {
        // paddle = { x, y, width, height }
    },
    
    drawBall(ball) {
        // ball = { x, y, radius, speed }
    },
    
    drawBrick(brick) {
        // brick = { x, y, width, height, row, color, destroyed }
    },
    
    drawUI(score, lives, W, H) {
        // Draw score, lives, any HUD elements
    },
    
    drawParticle(particle) {
        // particle = { x, y, size, color, alpha }
    },
    
    // ============================================
    // OPTIONAL EFFECT FUNCTIONS
    // ============================================
    
    spawnBrickParticles(x, y, color) {
        // Called when brick destroyed - spawn particles
    },
    
    playDeathEffect() {
        // Visual effect when ball lost
    },
    
    playVictoryEffect() {
        // Visual effect when level complete
    },
    
    // ============================================
    // MAIN RENDER FUNCTION
    // ============================================
    
    render(gameState) {
        const { paddle, ball, bricks, particles, score, lives, canvas } = gameState;
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw in order (back to front)
        this.drawBackground(canvas.width, canvas.height);
        
        bricks.forEach(brick => {
            if (!brick.destroyed) this.drawBrick(brick);
        });
        
        this.drawPaddle(paddle);
        this.drawBall(ball);
        
        particles.forEach(p => this.drawParticle(p));
        
        this.drawUI(score, lives, canvas.width, canvas.height);
    }
};
```

### Example: Default Theme
```javascript
const THEME = {
    ctx: null,
    
    init(canvas) {
        this.ctx = canvas.getContext('2d');
    },
    
    drawBackground(W, H) {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, W, H);
    },
    
    drawPaddle(paddle) {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height / 3);
    },
    
    drawBall(ball) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glow
        const grad = this.ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 2);
        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    // ... etc
};
```

### Example: Inca Theme
```javascript
const THEME = {
    ctx: null,
    
    COLORS: {
        stone: '#8B7355',
        gold: '#FFD700',
        sky: '#87CEEB',
        // ... theme-specific palette
    },
    
    init(canvas) {
        this.ctx = canvas.getContext('2d');
    },
    
    drawBackground(W, H) {
        // Inca temple background with mountains, sky, etc.
    },
    
    drawPaddle(paddle) {
        // Wooden paddle with gold trim
        const ctx = this.ctx;
        const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
        grad.addColorStop(0, '#8B4513');
        grad.addColorStop(0.5, '#A0522D');
        grad.addColorStop(1, '#654321');
        ctx.fillStyle = grad;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Gold trim
        ctx.strokeStyle = this.COLORS.gold;
        ctx.lineWidth = 2;
        ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    },
    
    drawBall(ball) {
        // Golden sun ball
        const ctx = this.ctx;
        const grad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, ball.radius);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#DAA520');
        grad.addColorStop(1, '#B8860B');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // ... etc
};
```

---

## 🔊 audio.js - SOUNDS FILE (CUSTOMIZABLE)

### Interface Contract
Every audio.js MUST implement these functions:

```javascript
// ============================================
// AUDIO INTERFACE - All functions required
// ============================================
const AUDIO = {
    ctx: null,          // AudioContext
    initialized: false,
    muted: false,
    
    // Initialize audio system
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    },
    
    // ============================================
    // REQUIRED SOUND FUNCTIONS
    // ============================================
    
    playBrickHit(row) {
        // Sound when brick destroyed
        // row can affect pitch (higher rows = higher pitch)
    },
    
    playPaddleHit() {
        // Sound when ball hits paddle
    },
    
    playWallHit() {
        // Sound when ball hits wall
    },
    
    playLoseLife() {
        // Sound when ball falls off bottom
    },
    
    playGameOver() {
        // Sound when all lives lost
    },
    
    playLevelComplete() {
        // Sound when all bricks destroyed
    },
    
    // ============================================
    // MUSIC FUNCTIONS
    // ============================================
    
    startMusic() {
        // Start background music loop
    },
    
    stopMusic() {
        // Stop background music
    },
    
    updateMusic(intensity) {
        // Adjust music based on game state (0-1)
        // More bricks destroyed = higher intensity
    },
    
    // ============================================
    // UTILITY
    // ============================================
    
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },
    
    update(gameState) {
        // Called every frame - update music intensity, etc.
        if (!this.initialized) return;
        const intensity = 1 - (gameState.bricksRemaining / gameState.totalBricks);
        this.updateMusic(intensity);
    }
};
```

---

## 📋 index.html - LOADING FILES

### Base Game
```html
<!DOCTYPE html>
<html>
<head>
    <title>Breakout</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    
    <!-- Load in order: theme first, then audio, then game -->
    <script src="theme.js"></script>
    <script src="audio.js"></script>
    <script src="game.js"></script>
</body>
</html>
```

### Level (e.g., Inca)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Breakout - Inca Temple</title>
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    
    <!-- Theme and Audio are local, Game is from PARENT -->
    <script src="inca-theme.js"></script>
    <script src="inca-audio.js"></script>
    <script src="../game.js"></script>  <!-- SHARED! -->
</body>
</html>
```

---

## ✅ VERIFICATION CHECKLIST

Before committing a new level, verify:

### 1. No Mechanics in Theme File
```bash
# Should return NOTHING
grep -E "^const (PADDLE|BALL|BRICK|INITIAL|POINTS)" levels/*/theme.js
```

### 2. Theme Implements Interface
```bash
# Should show all required functions
grep -E "draw(Background|Paddle|Ball|Brick|UI|Particle)" levels/jungle/jungle-theme.js
```

### 3. Audio Implements Interface
```bash
# Should show all required functions  
grep -E "play(BrickHit|PaddleHit|WallHit|LoseLife|GameOver|LevelComplete)" levels/jungle/jungle-audio.js
```

### 4. Level Loads Parent game.js
```bash
# Should show "../game.js" NOT local game.js
grep "game.js" levels/jungle/index.html
# Expected: <script src="../game.js"></script>
```

### 5. Play Test
- [ ] Ball physics feel identical to base game
- [ ] Paddle speed feels identical to base game
- [ ] Brick layout matches base game exactly
- [ ] Score per brick matches base game
- [ ] Lives system matches base game

---

## 🚫 COMMON MISTAKES

### ❌ Copying game.js to level folder
```
levels/jungle/
  game.js          # WRONG! Don't copy this
  jungle-theme.js
  jungle-audio.js
```

### ✅ Reference parent game.js
```
levels/jungle/
  index.html       # Contains: <script src="../game.js">
  jungle-theme.js
  jungle-audio.js
```

### ❌ Adding constants to theme.js
```javascript
// In jungle-theme.js - WRONG!
const BRICK_OFFSET_TOP = 100;  // NO! This is mechanics
```

### ✅ Only visual properties in theme.js
```javascript
// In jungle-theme.js - CORRECT
const COLORS = {
    brick: '#228B22',    // Visual only
    paddle: '#8B4513',   // Visual only
};
```

### ❌ Putting render() in game classes
```javascript
// In game.js - WRONG!
class Paddle {
    render(ctx) {  // NO! Rendering goes in theme.js
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
```

### ✅ Using getState() pattern
```javascript
// In game.js - CORRECT
class Paddle {
    getState() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// In theme.js - renders based on state
drawPaddle(paddle) {
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}
```

---

## 🎮 APPLYING TO EXISTING GAMES

### Migration Steps
1. **Identify all render code** - Search for `ctx.fill`, `ctx.stroke`, colors
2. **Extract to theme.js** - Move all rendering to THEME object
3. **Identify all audio code** - Search for AudioContext, oscillator
4. **Extract to audio.js** - Move all audio to AUDIO object
5. **Add getState() methods** - To all game classes
6. **Update game loop** - Call THEME.render() and AUDIO.update()
7. **Test base game** - Should look/sound identical
8. **Fix existing levels** - Delete local game.js, update index.html

### Reference Implementations
- **Breakout**: `games/tier-1-fundamentals/002-breakout/` (refactored Jan 6, 2026)
- **Flappy Bird**: `games/tier-2-core-mechanics/005-flappy-bird/` (refactored Jan 6, 2026)

---

## 📊 BENEFITS

| Before (Mixed) | After (Modular) |
|----------------|-----------------|
| New level = copy 470 lines, modify throughout | New level = create 100-line theme + audio |
| Risk of changing mechanics accidentally | Mechanics physically cannot be changed |
| Bug in physics = fix in N files | Bug in physics = fix in 1 file |
| Hard to compare levels | Easy to diff theme files |
| "Is this a reskin or new game?" | Clearly a reskin (same game.js) |

---

*"Separation of concerns isn't just good architecture—it's protection against accidental mistakes."*
