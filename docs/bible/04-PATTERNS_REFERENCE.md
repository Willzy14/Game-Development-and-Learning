# 🎮 GAME DEVELOPMENT PATTERNS

**Purpose:** Core game architecture patterns - loops, states, collision, entities  
**When to Read:** Starting new game, implementing core mechanics, debugging game logic

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|-----------------|
| 2026-01-05   | 2026-01-05     | Added Code Architecture Principles section |
<!-- END METADATA -->

**Related Documents:**
- [01-CORE_RULES.md](./01-CORE_RULES.md) - Rules that govern pattern usage
- [07-DEBUG_QUALITY.md](./07-DEBUG_QUALITY.md) - Debugging pattern issues
- [08-QUICK_REFERENCE.md](./08-QUICK_REFERENCE.md) - Pattern code snippets

---

## MASTERY LEVEL: Expert
**Patterns Mastered:** Game loop, state machine, collision, particles, entities
**Games Applied:** All 4 games + V2 editions

---

## TABLE OF CONTENTS

1. [Code Architecture Principles](#code-architecture-principles)
2. [The Game Loop](#the-game-loop)
3. [State Machine](#state-machine)
4. [Collision Detection](#collision-detection)
5. [Entity Management](#entity-management)
5. [Input Handling](#input-handling)
6. [Movement Patterns](#movement-patterns)
7. [AI Patterns](#ai-patterns)

---

## CODE ARCHITECTURE PRINCIPLES

### Learned From: Bible Documentation System + Tier 1 Games

These principles emerged from building both games AND the documentation system itself.

### 1. Modular Architecture

**Principle:** Split large files into focused modules

| File Size | Action |
|-----------|--------|
| < 300 lines | ✅ Good - single responsibility |
| 300-500 lines | ⚠️ Watch - might need splitting soon |
| 500-800 lines | 🔶 Consider splitting |
| > 800 lines | 🔴 Split now - too large |

**Example Structure:**
```
game/
├── index.html      # Structure only
├── style.css       # Styling only
├── game.js         # Game logic (state, loop, collision)
├── audio.js        # Audio system only
├── ui.js           # UI handling (future, when needed)
└── entities.js     # Entity classes (future, when needed)
```

**When to Split:**
- File exceeds 500 lines
- You're scrolling constantly to find things
- Two developers would conflict editing the same file
- Clear logical separation exists

### 2. Explicit State

**Principle:** Game state should be queryable and debuggable

```javascript
// ❌ Implicit state (hard to debug)
if (player.health > 0 && !gameOver && !paused && started) {
    // What state are we in?
}

// ✅ Explicit state machine
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

if (currentState === GameState.PLAYING) {
    // Clear and debuggable
}
```

**Add debug displays:**
```javascript
if (DEBUG_MODE) {
    ctx.fillText(`State: ${currentState}`, 10, 20);
    ctx.fillText(`Score: ${score}`, 10, 40);
    ctx.fillText(`Entities: ${entities.length}`, 10, 60);
}
```

### 3. Loose Coupling Through Interfaces

**Principle:** Systems communicate through clean interfaces, not internal knowledge

```javascript
// ❌ Tight coupling - audio knows about game internals
audio.playSound(game.player.isHit && game.player.health < 50 ? 'critical' : 'hit');

// ✅ Loose coupling - game tells audio what to do
audio.playHit();           // Audio handles its own logic
audio.playCriticalHit();   // Game decides which to call
```

**Benefits:**
- Can replace audio system without touching game code
- Can test game logic without audio
- Easier to understand each system in isolation

### 4. Comments Explain WHY, Not WHAT

**Principle:** Code shows WHAT, comments explain WHY

```javascript
// ❌ Useless comment - describes what code does
// Set velocity to 0
ball.dy = 0;

// ✅ Useful comment - explains why
// Prevent infinite acceleration after paddle collision (Bug #47)
ball.dy = 0;

// ❌ Obvious
// Loop through enemies
enemies.forEach(enemy => ...);

// ✅ Non-obvious context
// Process enemies in reverse to safely remove during iteration
for (let i = enemies.length - 1; i >= 0; i--) { ... }
```

### 5. Version Data for Migrations

**Principle:** Saved data should include version for future compatibility

```javascript
// Save with version
const saveData = {
    version: 2,  // Increment when format changes
    highScore: this.highScore,
    settings: this.settings,
    stats: this.stats
};
localStorage.setItem('gameData', JSON.stringify(saveData));

// Load with migration
const data = JSON.parse(localStorage.getItem('gameData'));
if (data.version === 1) {
    // Migrate v1 to v2 format
    data.stats = data.stats || { gamesPlayed: 0 };
    data.version = 2;
}
```

---

## THE GAME LOOP

### The Foundation of Every Game

```javascript
function gameLoop() {
    // 1. Update game state (logic)
    if (currentState === GameState.PLAYING && !isPaused) {
        game.update();
    }
    
    // 2. Render everything (visuals)
    game.render(ctx);
    
    // 3. Schedule next frame
    requestAnimationFrame(gameLoop);
}

// Start the loop
gameLoop();
```

### Why requestAnimationFrame?

| Feature | requestAnimationFrame | setInterval |
|---------|----------------------|-------------|
| Sync with display | ✅ Yes (60fps typical) | ❌ No (drift) |
| Tab hidden | ✅ Pauses automatically | ❌ Keeps running |
| Battery | ✅ Efficient | ❌ Wasteful |
| Timing | ✅ Provides timestamp | ❌ Manual tracking |

### Delta Time (Frame-Independent Movement)

```javascript
let lastTime = 0;

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;  // seconds
    lastTime = currentTime;
    
    // Movement independent of frame rate
    object.x += object.speed * deltaTime;  // pixels per second
    
    requestAnimationFrame(gameLoop);
}
```

### Update vs Render Separation

**Why separate?**
- Update runs game logic (can be paused)
- Render draws current state (always runs for pause screen, etc.)
- Different rates possible (update 30fps, render 60fps)

```javascript
update() {
    // Logic only - no drawing!
    this.player.move();
    this.checkCollisions();
    this.spawnEnemies();
}

render(ctx) {
    // Drawing only - no logic!
    this.drawBackground(ctx);
    this.player.render(ctx);
    this.enemies.forEach(e => e.render(ctx));
    this.drawUI(ctx);
}
```

---

## STATE MACHINE

### Basic State Machine

```javascript
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

// State-specific update
function update() {
    switch (currentState) {
        case GameState.PLAYING:
            updateGameplay();
            break;
        case GameState.PAUSED:
            // Do nothing (or animate pause menu)
            break;
    }
}

// State-specific render
function render(ctx) {
    switch (currentState) {
        case GameState.MENU:
            renderMenu(ctx);
            break;
        case GameState.PLAYING:
            renderGame(ctx);
            break;
        case GameState.PAUSED:
            renderGame(ctx);      // Show game underneath
            renderPauseOverlay(ctx);
            break;
        case GameState.GAME_OVER:
            renderGame(ctx);
            renderGameOver(ctx);
            break;
    }
}
```

### State Transitions

```javascript
function changeState(newState) {
    // Exit current state
    switch (currentState) {
        case GameState.PLAYING:
            // Pause background music, etc.
            break;
    }
    
    // Enter new state
    switch (newState) {
        case GameState.PLAYING:
            audio.startBackgroundMusic();
            break;
        case GameState.GAME_OVER:
            audio.stopBackgroundMusic();
            audio.playGameOver();
            saveHighScore();
            break;
    }
    
    currentState = newState;
}
```

### Extended States (Breakout Example)

```javascript
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    BALL_LOST: 'ball_lost',      // Animation before life lost
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'gameover'
};
```

---

## COLLISION DETECTION

### AABB (Rectangle vs Rectangle)

The most common collision check for 2D games.

```javascript
function rectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Usage
if (rectCollision(player, enemy)) {
    player.takeDamage();
}
```

### Circle vs Rectangle (Ball vs Paddle)

```javascript
function circleRectCollision(circle, rect) {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate distance from closest point to circle center
    const distX = circle.x - closestX;
    const distY = circle.y - closestY;
    
    // Compare squared distance to squared radius (faster than sqrt)
    return (distX * distX + distY * distY) < (circle.radius * circle.radius);
}
```

### Circle vs Circle

```javascript
function circleCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}
```

### Grid-Based (Snake)

```javascript
// Exact cell match
function gridCollision(a, b) {
    return a.x === b.x && a.y === b.y;
}

// Self collision (snake head vs body)
function selfCollision(head, segments) {
    return segments.slice(1).some(seg => 
        seg.x === head.x && seg.y === head.y
    );
}

// Wall collision
function wallCollision(head, gridWidth, gridHeight) {
    return head.x < 0 || head.x >= gridWidth ||
           head.y < 0 || head.y >= gridHeight;
}
```

### Collision Response

```javascript
// Bounce off surface
ball.dy = -ball.dy;  // Simple vertical bounce

// Bounce with angle based on hit position (Pong/Breakout)
function hitPaddle(ball, paddle) {
    const hitPos = (ball.x - paddle.getCenter()) / (paddle.width / 2);
    const angle = hitPos * (Math.PI / 3);  // -60° to +60°
    
    ball.dx = Math.sin(angle) * ball.speed;
    ball.dy = -Math.abs(Math.cos(angle)) * ball.speed;  // Always up
}
```

### Multiple Collision Prevention

```javascript
// Only destroy one brick per frame
checkBrickCollisions() {
    for (const brick of this.bricks) {
        if (this.ball.collidesWith(brick)) {
            brick.destroy();
            this.ball.bounce();
            break;  // IMPORTANT: Stop checking after first hit
        }
    }
}
```

---

## ENTITY MANAGEMENT

### Base Entity Class

```javascript
class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.active = true;
    }
    
    update() {
        // Override in subclass
    }
    
    render(ctx) {
        // Override in subclass
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
```

### Entity Collections

```javascript
class EntityManager {
    constructor() {
        this.entities = [];
    }
    
    add(entity) {
        this.entities.push(entity);
    }
    
    update() {
        // Update all
        this.entities.forEach(e => e.update());
        
        // Remove inactive (filter creates new array)
        this.entities = this.entities.filter(e => e.active);
    }
    
    render(ctx) {
        this.entities.forEach(e => e.render(ctx));
    }
    
    getAll() {
        return this.entities;
    }
}
```

### Object Pooling (Performance)

```javascript
class BulletPool {
    constructor(size) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new Bullet());
        }
    }
    
    get() {
        const bullet = this.pool.find(b => !b.active);
        if (bullet) {
            bullet.active = true;
            return bullet;
        }
        return null;  // Pool exhausted
    }
    
    release(bullet) {
        bullet.active = false;
        bullet.reset();
    }
}
```

---

## INPUT HANDLING

### Keyboard State Object

```javascript
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// In update:
if (keys['ArrowLeft']) {
    player.moveLeft();
}
if (keys['Space']) {
    player.shoot();
}
```

### Direction Queue (Snake)

Prevents 180° reversal by queueing direction changes.

```javascript
class Snake {
    constructor() {
        this.direction = 'right';
        this.nextDirection = 'right';
    }
    
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
        // Apply queued direction at move time
        this.direction = this.nextDirection;
        
        switch (this.direction) {
            case 'up':    this.head.y--; break;
            case 'down':  this.head.y++; break;
            case 'left':  this.head.x--; break;
            case 'right': this.head.x++; break;
        }
    }
}
```

### Touch Input

```javascript
// Support BOTH touch and click
button.addEventListener('touchstart', handlePress);
button.addEventListener('click', handlePress);

function handlePress(e) {
    e.preventDefault();  // Prevent double-firing on touch
    // ... action
}

// Get touch position
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
});
```

---

## MOVEMENT PATTERNS

### Grid-Based Movement (Snake)

```javascript
const GRID_SIZE = 20;

// Position in grid units
snake.gridX = 10;
snake.gridY = 10;

// Move one cell at a time
move() {
    switch (this.direction) {
        case 'right': this.gridX++; break;
        case 'left':  this.gridX--; break;
        case 'up':    this.gridY--; break;
        case 'down':  this.gridY++; break;
    }
}

// Render at pixel position
render(ctx) {
    const pixelX = this.gridX * GRID_SIZE;
    const pixelY = this.gridY * GRID_SIZE;
    ctx.fillRect(pixelX, pixelY, GRID_SIZE, GRID_SIZE);
}
```

### Smooth Movement with Speed Cap

```javascript
// Pong paddle
update() {
    if (keys['ArrowUp']) {
        this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
    } else if (keys['ArrowDown']) {
        this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed);
    } else {
        // Friction when no input
        this.speed *= 0.9;
    }
    
    this.y += this.speed;
    
    // Clamp to bounds
    this.y = Math.max(0, Math.min(this.y, CANVAS_HEIGHT - this.height));
}
```

### Velocity-Based Movement

```javascript
class Projectile {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;  // Horizontal velocity
        this.dy = dy;  // Vertical velocity
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
        
        // Gravity (optional)
        this.dy += 0.1;
    }
}
```

---

## AI PATTERNS

### Simple Tracking (Pong AI)

```javascript
updateAI() {
    const paddleCenter = this.y + this.height / 2;
    const ballY = ball.y;
    
    // Add tolerance zone to prevent jittering
    const tolerance = 20;
    
    if (ballY < paddleCenter - tolerance) {
        this.y -= this.speed;
    } else if (ballY > paddleCenter + tolerance) {
        this.y += this.speed;
    }
}
```

### Difficulty Scaling

```javascript
class AI {
    constructor(difficulty) {
        // Higher difficulty = better tracking
        this.reactionSpeed = difficulty * 0.5;  // 0.5 to 1.5
        this.predictionError = (1 - difficulty) * 50;  // 50 to 0 pixels
    }
    
    update(targetY) {
        // Add randomness based on difficulty
        const adjustedTarget = targetY + (Math.random() - 0.5) * this.predictionError;
        
        const diff = adjustedTarget - this.y;
        this.y += diff * this.reactionSpeed * 0.1;
    }
}
```

### Formation Movement (Space Invaders)

```javascript
class EnemyFormation {
    constructor() {
        this.enemies = [];
        this.direction = 1;  // 1 = right, -1 = left
        this.moveDown = false;
    }
    
    update() {
        // Check if any enemy hit edge
        let hitEdge = false;
        this.enemies.forEach(enemy => {
            if (enemy.x <= 0 || enemy.x >= CANVAS_WIDTH - ENEMY_WIDTH) {
                hitEdge = true;
            }
        });
        
        // If hit edge, reverse and move down
        if (hitEdge) {
            this.direction *= -1;
            this.moveDown = true;
        }
        
        // Move all enemies
        this.enemies.forEach(enemy => {
            enemy.x += ENEMY_SPEED * this.direction;
            if (this.moveDown) {
                enemy.y += ENEMY_DROP;
            }
        });
        
        this.moveDown = false;
    }
}
```

### Random Shooting

```javascript
// Each frame, small chance each enemy shoots
updateEnemyShooting() {
    this.enemies.forEach(enemy => {
        // 0.5% chance per frame = roughly every 3 seconds at 60fps
        if (Math.random() < 0.005) {
            this.spawnEnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        }
    });
}
```

---

## INFINITE SCROLLING & PROCEDURAL GENERATION

### Learned From: Flappy Bird V4 - Loop Glitch Solution

**Problem:** Traditional tiling/wrapping creates visible seams and snap-back glitches

**Solution:** Procedural generation based on absolute scroll position

### The Anti-Pattern (AVOID)

```javascript
// ❌ WRONG - Creates snap-back glitch
this.scrollX -= speed;
if (this.scrollX <= -CANVAS_WIDTH) {
    this.scrollX = 0;  // ← SNAP BACK!
}

// Draw tiled background
drawTile(this.scrollX);
drawTile(this.scrollX + CANVAS_WIDTH);
```

**Problem:** When `scrollX` resets to 0, background visibly snaps back

### The Correct Pattern

```javascript
// ✅ CORRECT - Infinite scrolling with procedural generation
update() {
    this.scrollX -= speed;  // No wrapping! Let it scroll infinitely
}

drawElements(ctx) {
    // 1. Calculate which elements are visible
    const spacing = 200;  // Distance between elements
    const buffer = 200;   // Extra off-screen buffer
    
    const firstIndex = Math.floor((this.scrollX - buffer) / spacing);
    const lastIndex = Math.ceil((this.scrollX + CANVAS_WIDTH + buffer) / spacing);
    
    // 2. Generate only visible elements
    for (let i = firstIndex; i <= lastIndex; i++) {
        // Seeded random for deterministic generation
        const seed = i * 45.678;
        
        // Calculate world position
        const worldX = i * spacing;
        const screenX = worldX - this.scrollX;
        
        // Generate properties from seed
        const size = this.seededRandom(seed, 20, 60);
        const y = this.seededRandom(seed + 1, 100, 400);
        
        // Draw element
        this.drawElement(ctx, screenX, y, size);
    }
}

// Seeded random - same seed always gives same result
seededRandom(seed, min, max) {
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
}
```

### Multi-Layer Parallax with Procedural Generation

```javascript
class BackgroundLayer {
    constructor(speed, elementSpacing, seedOffset) {
        this.speed = speed;           // Parallax speed (0.15x, 0.4x, etc.)
        this.spacing = elementSpacing;
        this.seedOffset = seedOffset; // Unique per layer
        this.scrollAmount = 0;
    }
    
    update() {
        this.scrollAmount += GAME_SPEED * this.speed;
    }
    
    render(ctx) {
        const buffer = 200;
        const firstIndex = Math.floor((this.scrollAmount - buffer) / this.spacing);
        const lastIndex = Math.ceil((this.scrollAmount + CANVAS_WIDTH + buffer) / this.spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 45.678 + this.seedOffset * 123.456;
            const x = i * this.spacing - this.scrollAmount;
            
            // Generate and draw element
            const size = this.seededRandom(seed, this.minSize, this.maxSize);
            const y = this.seededRandom(seed + 1, this.minY, this.maxY);
            
            this.drawElement(ctx, x, y, size);
        }
    }
}

// Usage:
this.cloudLayer1 = new BackgroundLayer(0.15, 400, 1);  // Slow far clouds
this.cloudLayer2 = new BackgroundLayer(0.4, 300, 2);   // Medium clouds
this.cloudLayer3 = new BackgroundLayer(0.6, 250, 3);   // Fast near clouds
```

### Benefits of Procedural Generation

| Aspect | Tiling | Procedural |
|--------|--------|------------|
| Seams | ❌ Visible | ✅ None |
| Glitches | ❌ Snap-back | ✅ Smooth |
| Variety | ❌ Repetitive | ✅ Infinite |
| Memory | ❌ Store images | ✅ Generate on-demand |
| Deterministic | ❌ Random | ✅ Same seed = same result |

### Use Cases

- **Clouds:** Different sizes, positions, opacity
- **Mountains:** Different heights, colors, layer depth
- **Trees:** Different sizes, positions on slopes
- **Birds:** Different formation positions, heights
- **Grass:** Different blade types, heights
- **Obstacles:** Different gaps, heights (Flappy Bird pipes)
- **Collectibles:** Different positions, types

### Performance Tips

1. **Only render visible:** Use index range calculation
2. **Use buffer:** Render slightly off-screen to prevent pop-in
3. **Batch similar draws:** All clouds together, all trees together
4. **Avoid allocations:** Reuse objects, don't create per-frame
5. **Cache expensive calculations:** If seed math is heavy

---

## THEME SWAP / RESKINNING PATTERN ⭐ NEW

### Learned From: Flappy Bird V4 Egypt - Complete Theme Transformation

**The Big Insight:** Same mechanics + different art/audio = new game level

### Theme Swap Checklist

When creating a new theme/skin for an existing game:

| Element | What to Change | Example (Standard → Egypt) |
|---------|---------------|---------------------------|
| **Color Palette** | All color constants | Green sky → Sunset orange |
| **Background Layers** | 5-7 parallax elements | Mountains → Pyramids |
| **Player Character** | Sprite/drawing + trail | Bird → Scarab beetle |
| **Obstacles** | Visual only, keep hitbox | Pipes → Stone pillars |
| **Ground** | Texture and color | Grass → Sand |
| **Particles** | Color palette | White feathers → Gold sparkles |
| **Music Scale** | Completely different feel | Major → Phrygian Dominant |
| **Sound Effects** | Re-themed sounds | Wing flap → Beetle buzz |
| **UI/Fonts** | Match theme aesthetic | Standard → Papyrus/fantasy |

### Color Palette Architecture

**Pattern:** Centralize ALL colors in a constants object:

```javascript
// Theme: Egypt
const COLORS = {
    // Sky
    skyTop: '#1a0a2e',
    skyMid: '#4a1942',
    skyBottom: '#c9634a',
    
    // Ground
    sandLight: '#f4d03f',
    sandDark: '#b8860b',
    
    // Player
    scarabGold: '#ffd700',
    scarabBlue: '#1e90ff',
    
    // Obstacles
    stoneLight: '#d4c4a8',
    stoneDark: '#5c4a3c',
    
    // Accents
    gold: '#ffd700',
    hieroglyph: '#8b4513'
};
```

**Why This Works:**
- Change theme by swapping ONE object
- No hunting through code for hex values
- Easy to create theme variations
- Future: Could load from JSON file

### Character Redesign Pattern

**The 80% Rule:** Characters need just a few strong signals:

1. **Distinctive Silhouette** - Recognizable shape
2. **Thematic Colors** - Match the world (gold/blue for Egypt)
3. **One Animated Element** - Something that moves (wings opening)
4. **Eye-Catching Detail** - Focal point (red gem eyes)

```javascript
// Bird → Scarab transformation
// Same size hitbox, completely different appearance

// Key visual elements:
// - Elliptical body (organic, beetle-like)
// - Wing cases that open on flap
// - Iridescent gradient (blue/gold)
// - Small animated details (antennae, legs)
```

### Obstacle Reskinning Rule

**Critical:** Obstacles are defined by collision box, NOT appearance

```javascript
// Pipe and Pillar have IDENTICAL logic:
const PIPE_WIDTH = 52;      // Same
const PILLAR_WIDTH = 52;    // Same

// Only the drawing changes:
drawPipe() { /* green gradient, rounded cap */ }
drawPillar() { /* stone texture, hieroglyphs, capital */ }
```

**Add Visual Interest Without Changing Gameplay:**
- Textures (stone blocks, hieroglyphs)
- Decorations (cobra heads, gold bands)
- Weathering effects (cracks, worn edges)
- Shadow/highlight (3D depth illusion)

### The 80% Authenticity Rule

**Don't over-engineer theme elements.** Players recognize themes through strong signals:

| Element | 100% Accurate | 80% Recognizable ✓ |
|---------|--------------|-------------------|
| Pyramids | Precise angles, limestone texture | Triangle with shading |
| Sphinx | Detailed sculpture | Rough silhouette |
| Hieroglyphs | Actual Egyptian symbols | Geometric shapes |
| Palm trees | Botanically accurate | Generic tropical |
| Music | Authentic instruments | Scale + rhythm pattern |

**Why 80% is enough:**
- Players aren't Egyptologists
- Strong silhouettes read fast
- Saves development time
- Consistency matters more than accuracy

---

## LARGE TASK BREAKDOWN PATTERN ⭐ NEW

### Learned From: V4 Egypt - Avoiding Response Length Limits

**Problem:** Large file creation hits token limits mid-generation

**Solution:** Break into logical chunks, build incrementally

### File Size Planning

| File Size | Strategy |
|-----------|----------|
| < 200 lines | Create in one shot |
| 200-500 lines | Consider 2-3 parts |
| 500-1000 lines | Definitely split (4-6 parts) |
| > 1000 lines | Heavy splitting (8+ parts) |

### Game.js Breakdown Template

For a typical game file (~800-1200 lines):

```
Part 1: Constants & Utility Classes (Particle, etc.)
Part 2: Game Class Constructor & Setup
Part 3: Background Layer 1-2 (sky, sun, far elements)
Part 4: Background Layer 3-4 (mid elements, landmarks)
Part 5: Background Layer 5-6 (near elements, ground)
Part 6: Player Drawing
Part 7: Obstacle Drawing
Part 8: Update Logic & Collision
Part 9: Render Loop & UI
Part 10: Menu Screens & Initialization
```

### Incremental Building Pattern

```javascript
// Part 1: Create file with structure placeholder
class Game {
    constructor() { /* ... */ }
    
    // Continued in Part 2...
}

// Part 2: Replace placeholder, add next section
    methodFromPart2() { /* ... */ }
    
    // Continued in Part 3...

// Part 3: Replace placeholder, add next section
// ... and so on
```

### Benefits of Chunked Development

1. **No timeouts** - Each chunk completes successfully
2. **Testable increments** - Can verify each part works
3. **Easier debugging** - Know which part introduced bugs
4. **Resumable** - Can pick up where you left off
5. **Reviewable** - User can see progress

### When to Split vs. Combine

**Split when:**
- File will exceed 500 lines
- Multiple complex drawing functions
- Complex game logic mixed with rendering
- Multiple independent systems

**Combine when:**
- Closely related functionality
- One function depends on another
- Simple utility functions
- Configuration/constants

---

## SKILLS PROGRESSION BY GAME

| Game | Key Patterns Learned |
|------|---------------------|
| **Pong** | Game loop, state machine, AABB collision, simple AI |
| **Breakout** | OOP entities, grid layout, angle reflection, level progression |
| **Space Invaders** | Projectiles, formation AI, random shooting, waves |
| **Snake** | Grid movement, direction queue, self-collision, power-ups |
| **Flappy Bird** | Infinite scrolling, procedural generation, parallax layers |
| **Flappy Bird Egypt** | Theme swapping, reskinning, large task breakdown |

---

*Last Updated: January 5, 2026*  
*Patterns Mastered Through: Tier 1 Complete (4 Games) + Flappy Bird (Tier 2) + Theme Variants*
