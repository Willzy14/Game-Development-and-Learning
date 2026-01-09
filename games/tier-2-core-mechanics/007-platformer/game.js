/**
 * LANTERN SPIRIT - GAME MECHANICS
 * 
 * A platformer about a glowing spirit carrying a lantern through a mystical swamp.
 * 
 * ALL game logic lives here. NO visual code.
 * THEME.render(getGameState()) handles all rendering.
 * AUDIO.play*() handles all sound effects.
 * 
 * Features:
 * - Variable height jumping (hold longer = jump higher)
 * - Double jump
 * - Horizontal scrolling
 * - Platform collision
 */

// =============================================================================
// GAME SETTINGS
// =============================================================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

const SETTINGS = {
    // Player
    playerWidth: 24,
    playerHeight: 32,
    
    // Movement
    moveSpeed: 4,
    acceleration: 0.5,
    friction: 0.85,
    
    // Jumping - variable height
    gravity: 0.5,
    jumpPower: -12,           // Initial jump velocity
    jumpHoldPower: -0.4,      // Additional force while holding jump
    jumpHoldTime: 15,         // Frames you can hold jump for extra height
    maxFallSpeed: 12,
    
    // Double jump
    doubleJumpPower: -10,     // Slightly weaker than first jump
    
    // Camera/Scrolling
    scrollThreshold: 300,     // Start scrolling when player passes this X
    scrollSpeed: 4,
    
    // World
    groundY: 450,             // Default ground level
    levelLength: 6000,        // Total level length in pixels (extended for more challenge)
};

// =============================================================================
// GAME STATE
// =============================================================================

let canvas, ctx;
let gameState = 'ready';  // 'ready', 'playing', 'paused', 'gameover', 'victory'

let player = null;
let platforms = [];
let collectibles = [];
let particles = [];
let cameraX = 0;

let keys = {};
let jumpHoldCounter = 0;
let jumpBufferCounter = 0;  // Coyote time / jump buffering
const JUMP_BUFFER = 6;       // Frames of jump buffer
const COYOTE_TIME = 6;       // Frames of coyote time

// =============================================================================
// PLAYER CLASS
// =============================================================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = SETTINGS.playerWidth;
        this.height = SETTINGS.playerHeight;
        
        // Jump state
        this.onGround = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.jumpHeld = false;
        this.coyoteCounter = 0;  // Frames since leaving ground
        
        // Animation state
        this.facingRight = true;
        this.animFrame = 0;
        this.animTimer = 0;
    }
    
    update() {
        // Horizontal movement with acceleration
        const targetVX = (keys['ArrowRight'] || keys['KeyD'] ? 1 : 0) - 
                        (keys['ArrowLeft'] || keys['KeyA'] ? 1 : 0);
        
        if (targetVX !== 0) {
            this.vx += targetVX * SETTINGS.acceleration;
            this.vx = Math.max(-SETTINGS.moveSpeed, Math.min(SETTINGS.moveSpeed, this.vx));
            this.facingRight = targetVX > 0;
        } else {
            this.vx *= SETTINGS.friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }
        
        // Apply gravity
        this.vy += SETTINGS.gravity;
        if (this.vy > SETTINGS.maxFallSpeed) {
            this.vy = SETTINGS.maxFallSpeed;
        }
        
        // Variable jump height - hold jump for more height
        if (this.jumpHeld && keys['Space'] && jumpHoldCounter > 0) {
            this.vy += SETTINGS.jumpHoldPower;
            jumpHoldCounter--;
        }
        if (!keys['Space']) {
            this.jumpHeld = false;
        }
        
        // Coyote time - can still jump shortly after leaving platform
        if (this.onGround) {
            this.coyoteCounter = COYOTE_TIME;
            this.hasDoubleJumped = false;
            this.canDoubleJump = true;
        } else {
            this.coyoteCounter--;
        }
        
        // Move
        this.x += this.vx;
        this.y += this.vy;
        
        // Keep in bounds (left side only - right side scrolls)
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        
        // Platform collision
        this.onGround = false;
        for (const platform of platforms) {
            if (this.collidesWith(platform)) {
                // Only land on top of platforms (falling down onto them)
                if (this.vy > 0 && this.y + this.height - this.vy <= platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        }
        
        // Ground collision
        if (this.y + this.height > SETTINGS.groundY) {
            this.y = SETTINGS.groundY - this.height;
            this.vy = 0;
            this.onGround = true;
        }
        
        // Fall death
        if (this.y > CANVAS_HEIGHT + 100) {
            gameState = 'gameover';
            AUDIO.playDeath();
        }
        
        // Victory check
        if (this.x > SETTINGS.levelLength - 100) {
            gameState = 'victory';
            AUDIO.playVictory();
        }
        
        // Animation
        this.animTimer++;
        if (this.animTimer > 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }
    
    jump() {
        // First jump (with coyote time)
        if (this.onGround || this.coyoteCounter > 0) {
            this.vy = SETTINGS.jumpPower;
            this.onGround = false;
            this.coyoteCounter = 0;
            this.jumpHeld = true;
            jumpHoldCounter = SETTINGS.jumpHoldTime;
            AUDIO.playJump();
            
            // Spawn jump particles
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height,
                    'dust'
                ));
            }
            return;
        }
        
        // Double jump
        if (this.canDoubleJump && !this.hasDoubleJumped) {
            this.vy = SETTINGS.doubleJumpPower;
            this.hasDoubleJumped = true;
            this.jumpHeld = true;
            jumpHoldCounter = SETTINGS.jumpHoldTime;
            AUDIO.playDoubleJump();
            
            // Spawn double jump particles (more dramatic)
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    'sparkle'
                ));
            }
        }
    }
    
    collidesWith(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            vx: this.vx,
            vy: this.vy,
            onGround: this.onGround,
            facingRight: this.facingRight,
            animFrame: this.animFrame,
            hasDoubleJumped: this.hasDoubleJumped,
            canDoubleJump: this.canDoubleJump && !this.hasDoubleJumped
        };
    }
}

// =============================================================================
// PLATFORM CLASS
// =============================================================================

class Platform {
    constructor(x, y, width, height = 20, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;  // 'normal', 'moss', 'log', 'mushroom'
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type
        };
    }
}

// =============================================================================
// COLLECTIBLE CLASS (wisps to collect)
// =============================================================================

class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        // Floating bob animation
        this.bobOffset += 0.05;
        
        // Check collection
        if (!this.collected && player) {
            const dx = (player.x + player.width/2) - this.x;
            const dy = (player.y + player.height/2) - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < this.radius + 20) {
                this.collected = true;
                AUDIO.playCollect();
                
                // Spawn collection particles
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(this.x, this.y, 'wisp'));
                }
            }
        }
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y + Math.sin(this.bobOffset) * 5,
            radius: this.radius,
            collected: this.collected
        };
    }
}

// =============================================================================
// PARTICLE CLASS
// =============================================================================

class Particle {
    constructor(x, y, type = 'dust') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 'dust') {
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = -Math.random() * 2;
            this.life = 20 + Math.random() * 10;
            this.size = 3 + Math.random() * 3;
        } else if (type === 'sparkle') {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 25 + Math.random() * 15;
            this.size = 4 + Math.random() * 4;
        } else if (type === 'wisp') {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 1;
            this.life = 30 + Math.random() * 20;
            this.size = 5 + Math.random() * 5;
        } else if (type === 'firefly') {
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.life = 100 + Math.random() * 200;
            this.size = 2 + Math.random() * 2;
            this.blinkOffset = Math.random() * Math.PI * 2;
        }
        
        this.maxLife = this.life;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        if (this.type === 'dust') {
            this.vy += 0.1;  // Gravity on dust
        } else if (this.type === 'firefly') {
            // Gentle wandering
            this.vx += (Math.random() - 0.5) * 0.1;
            this.vy += (Math.random() - 0.5) * 0.1;
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.blinkOffset += 0.1;
        }
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            life: this.life,
            maxLife: this.maxLife,
            size: this.size,
            blinkOffset: this.blinkOffset || 0
        };
    }
}

// =============================================================================
// LEVEL GENERATION
// =============================================================================

function generateLevel() {
    platforms = [];
    collectibles = [];
    
    // Platform types for variety
    const platformTypes = ['normal', 'moss', 'log', 'mushroom'];
    
    // ===================
    // ZONE 1: Tutorial (0-1000) - Easy, forgiving gaps
    // ===================
    platforms.push(new Platform(200, 380, 150, 20, 'moss'));
    platforms.push(new Platform(400, 350, 120, 20, 'normal'));
    platforms.push(new Platform(580, 320, 100, 20, 'log'));
    platforms.push(new Platform(740, 350, 110, 20, 'moss'));
    platforms.push(new Platform(920, 320, 90, 20, 'normal'));
    
    collectibles.push(new Collectible(275, 340));
    collectibles.push(new Collectible(460, 300));
    collectibles.push(new Collectible(800, 300));
    
    // ===================
    // ZONE 2: Learning Gaps (1000-2200) - Moderate gaps, introduce height variety
    // ===================
    let lastX = 1050;
    let lastY = 300;
    
    for (let i = 0; i < 8; i++) {
        const gap = 100 + Math.random() * 80;
        const width = 70 + Math.random() * 60;
        let newY = lastY + (Math.random() - 0.5) * 80;
        newY = Math.max(180, Math.min(400, newY));
        
        lastX += gap;
        const type = platformTypes[Math.floor(Math.random() * platformTypes.length)];
        platforms.push(new Platform(lastX, newY, width, 20, type));
        
        if (Math.random() > 0.5) {
            collectibles.push(new Collectible(lastX + width/2, newY - 45));
        }
        
        lastX += width;
        lastY = newY;
    }
    
    // ===================
    // ZONE 3: Double Jump Required (2200-3500) - Larger gaps, tricky heights
    // ===================
    // Rest platform
    platforms.push(new Platform(2250, 350, 130, 20, 'moss'));
    collectibles.push(new Collectible(2315, 300));
    
    lastX = 2400;
    lastY = 320;
    
    for (let i = 0; i < 10; i++) {
        const gap = 130 + Math.random() * 100;  // Larger gaps
        const width = 55 + Math.random() * 50;  // Smaller platforms
        let newY = lastY + (Math.random() - 0.5) * 120;
        newY = Math.max(150, Math.min(420, newY));
        
        lastX += gap;
        const type = platformTypes[Math.floor(Math.random() * platformTypes.length)];
        platforms.push(new Platform(lastX, newY, width, 20, type));
        
        // Collectibles in tricky spots
        if (Math.random() > 0.4) {
            const collectY = Math.random() > 0.5 ? newY - 60 : newY - 90;
            collectibles.push(new Collectible(lastX + width/2, collectY));
        }
        
        lastX += width;
        lastY = newY;
    }
    
    // ===================
    // ZONE 4: Vertical Challenge (3500-4500) - Ascending/descending sections
    // ===================
    // Safe landing
    platforms.push(new Platform(3550, 380, 120, 20, 'moss'));
    
    // Ascending staircase
    const ascendStart = 3700;
    for (let i = 0; i < 6; i++) {
        const px = ascendStart + i * 110;
        const py = 380 - i * 45;
        platforms.push(new Platform(px, py, 70, 20, i % 2 === 0 ? 'log' : 'normal'));
        if (i === 2 || i === 5) {
            collectibles.push(new Collectible(px + 35, py - 50));
        }
    }
    
    // Peak platform
    platforms.push(new Platform(4280, 120, 100, 20, 'moss'));
    collectibles.push(new Collectible(4330, 60)); // High reward!
    
    // Descending with gaps
    for (let i = 0; i < 5; i++) {
        const px = 4420 + i * 130;
        const py = 150 + i * 50;
        platforms.push(new Platform(px, py, 60 + Math.random() * 30, 20, platformTypes[Math.floor(Math.random() * 4)]));
    }
    
    // ===================
    // ZONE 5: Gauntlet (4500-5700) - The real challenge
    // ===================
    platforms.push(new Platform(4950, 400, 100, 20, 'moss')); // Checkpoint feel
    collectibles.push(new Collectible(5000, 350));
    
    // Sparse, demanding platforming
    const gauntletPlatforms = [
        { x: 5100, y: 350, w: 50 },
        { x: 5220, y: 280, w: 45 },
        { x: 5320, y: 220, w: 55 },
        { x: 5450, y: 280, w: 50 },
        { x: 5560, y: 350, w: 45 },
        { x: 5680, y: 280, w: 55 },
    ];
    
    gauntletPlatforms.forEach((p, i) => {
        platforms.push(new Platform(p.x, p.y, p.w, 20, platformTypes[i % 4]));
        if (i === 1 || i === 4) {
            collectibles.push(new Collectible(p.x + p.w/2, p.y - 70));
        }
    });
    
    // ===================
    // FINALE: Victory Zone (5700-6000)
    // ===================
    platforms.push(new Platform(5800, 350, 80, 20, 'log'));
    platforms.push(new Platform(SETTINGS.levelLength - 180, 320, 180, 20, 'moss'));
    
    // Final collectibles
    collectibles.push(new Collectible(5840, 290));
    collectibles.push(new Collectible(SETTINGS.levelLength - 90, 250));
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    AUDIO.init();
    THEME.init(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    resetGame();
    
    // Input handlers
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Start loop
    gameLoop();
    
    // Debug info
    updateDebug();
}

function resetGame() {
    player = new Player(100, SETTINGS.groundY - SETTINGS.playerHeight);
    cameraX = 0;
    particles = [];
    
    generateLevel();
    
    // Spawn ambient fireflies
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(
            Math.random() * SETTINGS.levelLength,
            100 + Math.random() * 350,
            'firefly'
        ));
    }
}

function updateDebug() {
    const debug = document.getElementById('debug');
    if (debug) {
        debug.textContent = `Modular Architecture: game.js (✓) | theme.js (${typeof THEME !== 'undefined' ? '✓' : '✗'}) | audio.js (${typeof AUDIO !== 'undefined' ? '✓' : '✗'})`;
    }
}

// =============================================================================
// GAME STATE
// =============================================================================

function getGameState() {
    const collectedCount = collectibles.filter(c => c.collected).length;
    
    return {
        state: gameState,
        cameraX: cameraX,
        player: player ? player.getState() : null,
        platforms: platforms.map(p => p.getState()),
        collectibles: collectibles.filter(c => !c.collected).map(c => c.getState()),
        particles: particles.map(p => p.getState()),
        collected: collectedCount,
        totalCollectibles: collectibles.length,
        levelLength: SETTINGS.levelLength,
        groundY: SETTINGS.groundY
    };
}

// =============================================================================
// UPDATE LOOP
// =============================================================================

function update() {
    if (gameState !== 'playing') return;
    
    // Update player
    player.update();
    
    // Update camera (scroll)
    const playerScreenX = player.x - cameraX;
    if (playerScreenX > SETTINGS.scrollThreshold) {
        cameraX = player.x - SETTINGS.scrollThreshold;
    }
    // Don't scroll past start or end
    cameraX = Math.max(0, Math.min(SETTINGS.levelLength - CANVAS_WIDTH, cameraX));
    
    // Update collectibles
    collectibles.forEach(c => c.update());
    
    // Update particles
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);
    
    // Spawn new fireflies occasionally
    if (Math.random() < 0.02 && particles.filter(p => p.type === 'firefly').length < 40) {
        particles.push(new Particle(
            cameraX + Math.random() * CANVAS_WIDTH,
            100 + Math.random() * 350,
            'firefly'
        ));
    }
}

// =============================================================================
// GAME LOOP
// =============================================================================

function gameLoop() {
    update();
    THEME.render(getGameState());
    requestAnimationFrame(gameLoop);
}

// =============================================================================
// INPUT HANDLING
// =============================================================================

function handleKeyDown(e) {
    // Prevent default for game keys
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
    }
    
    keys[e.code] = true;
    
    // Resume audio context
    AUDIO.resume();
    
    // Start game
    if ((e.code === 'Enter' || e.code === 'Space') && gameState === 'ready') {
        gameState = 'playing';
        AUDIO.playUISelect();
        AUDIO.startMusic();
        return;
    }
    
    // Jump
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameState === 'playing') {
        player.jump();
    }
    
    // Pause
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    }
    
    // Restart
    if (e.code === 'Enter' && (gameState === 'gameover' || gameState === 'victory')) {
        resetGame();
        gameState = 'playing';
        AUDIO.playUISelect();
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

// =============================================================================
// START
// =============================================================================

window.addEventListener('load', init);
