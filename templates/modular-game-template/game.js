// ============================================
// GAME.JS - MECHANICS ONLY
// ============================================
// ⚠️ This file contains ONLY game logic:
//    - Physics (movement, collision)
//    - Scoring
//    - State machine
//    - Game loop
//
// ❌ NO colors, gradients, or visual rendering
// ❌ NO audio calls (only event triggers)
// ❌ NO theme-specific code
//
// Rendering is done by THEME object (theme.js)
// Audio is done by AUDIO object (audio.js)
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// ============================================
// GAME CONSTANTS - LOCKED FOR ALL LEVELS
// ============================================
// ⚠️ NEVER modify these when creating a new level!
// These define the FEEL of the game.

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLAYER_SPEED = 5;

const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;
const ENEMY_SPEED = 2;

const INITIAL_LIVES = 3;
const POINTS_PER_ENEMY = 10;

// ============================================
// GAME STATE
// ============================================

const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;
let score = 0;
let lives = INITIAL_LIVES;

// ============================================
// GAME ENTITIES
// ============================================
// Entities have NO render() method!
// They only track state and physics.
// Rendering is done by theme.js

class Player {
    constructor() {
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - this.height - 20;
        this.dx = 0;
        this.dy = 0;
    }
    
    // Physics only
    update() {
        this.x += this.dx;
        this.y += this.dy;
        
        // Boundary constraints
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.y));
    }
    
    // Movement controls
    moveLeft() { this.dx = -PLAYER_SPEED; }
    moveRight() { this.dx = PLAYER_SPEED; }
    moveUp() { this.dy = -PLAYER_SPEED; }
    moveDown() { this.dy = PLAYER_SPEED; }
    stopX() { this.dx = 0; }
    stopY() { this.dy = 0; }
    
    // Return data for renderer - entity doesn't render itself
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Collision hitbox
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = ENEMY_WIDTH;
        this.height = ENEMY_HEIGHT;
        this.speed = ENEMY_SPEED;
        this.active = true;
    }
    
    update() {
        this.y += this.speed;
        
        // Deactivate if off screen
        if (this.y > CANVAS_HEIGHT) {
            this.active = false;
        }
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            active: this.active
        };
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ============================================
// GAME INSTANCES
// ============================================

let player = new Player();
let enemies = [];
let particles = [];

// ============================================
// COLLISION DETECTION
// ============================================

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// ============================================
// GAME EVENTS (Trigger theme/audio responses)
// ============================================

function onEnemyDestroyed(enemy) {
    score += POINTS_PER_ENEMY;
    
    // Theme handles visual effect
    if (THEME.spawnDestroyParticles) {
        THEME.spawnDestroyParticles(enemy.x, enemy.y);
    }
    
    // Audio handles sound
    AUDIO.playEnemyDestroyed();
}

function onPlayerHit() {
    lives--;
    
    if (THEME.playHitEffect) {
        THEME.playHitEffect();
    }
    
    AUDIO.playPlayerHit();
    
    if (lives <= 0) {
        onGameOver();
    }
}

function onGameOver() {
    currentState = GameState.GAME_OVER;
    AUDIO.playGameOver();
    AUDIO.stopMusic();
}

// ============================================
// GAME STATE FUNCTIONS
// ============================================

function startGame() {
    currentState = GameState.PLAYING;
    score = 0;
    lives = INITIAL_LIVES;
    player = new Player();
    enemies = [];
    particles = [];
    
    AUDIO.init();
    AUDIO.startMusic();
}

function resetGame() {
    currentState = GameState.MENU;
    AUDIO.stopMusic();
}

// ============================================
// UPDATE (Physics only, no rendering)
// ============================================

function update() {
    if (currentState !== GameState.PLAYING) return;
    
    // Update player
    player.update();
    
    // Update enemies
    enemies.forEach(enemy => enemy.update());
    
    // Remove inactive enemies
    enemies = enemies.filter(e => e.active);
    
    // Check collisions
    enemies.forEach(enemy => {
        if (enemy.active && checkCollision(player.getHitbox(), enemy.getHitbox())) {
            enemy.active = false;
            onEnemyDestroyed(enemy);
        }
    });
    
    // Spawn enemies (example - adjust for your game)
    if (Math.random() < 0.02) {
        const x = Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH);
        enemies.push(new Enemy(x, -ENEMY_HEIGHT));
    }
    
    // Update particles (if theme creates them)
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
    });
}

// ============================================
// GET GAME STATE (For renderer)
// ============================================

function getGameState() {
    return {
        state: currentState,
        player: player.getState(),
        enemies: enemies.map(e => e.getState()),
        particles: particles,
        score: score,
        lives: lives,
        canvas: {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT
        }
    };
}

// ============================================
// MAIN GAME LOOP
// ============================================

function gameLoop() {
    // 1. Update game logic (this file)
    update();
    
    // 2. Render visuals (theme.js)
    THEME.render(getGameState());
    
    // 3. Update audio (audio.js)
    AUDIO.update(getGameState());
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// INPUT HANDLING
// ============================================

document.addEventListener('keydown', (e) => {
    // Initialize audio on first keypress
    if (!AUDIO.initialized) {
        AUDIO.init();
    }
    
    if (currentState === GameState.MENU) {
        if (e.key === ' ' || e.key === 'Enter') {
            startGame();
        }
        return;
    }
    
    if (currentState === GameState.GAME_OVER) {
        if (e.key === ' ' || e.key === 'Enter') {
            resetGame();
        }
        return;
    }
    
    // Playing state controls
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            player.moveLeft();
            break;
        case 'ArrowRight':
        case 'd':
            player.moveRight();
            break;
        case 'ArrowUp':
        case 'w':
            player.moveUp();
            break;
        case 'ArrowDown':
        case 's':
            player.moveDown();
            break;
        case 'Escape':
            currentState = currentState === GameState.PAUSED ? 
                           GameState.PLAYING : GameState.PAUSED;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'ArrowRight':
        case 'd':
            player.stopX();
            break;
        case 'ArrowUp':
        case 'w':
        case 'ArrowDown':
        case 's':
            player.stopY();
            break;
    }
});

// ============================================
// UI BUTTONS
// ============================================

document.getElementById('startBtn').addEventListener('click', () => {
    if (currentState === GameState.MENU) {
        startGame();
    } else if (currentState === GameState.GAME_OVER) {
        resetGame();
    }
});

document.getElementById('muteBtn').addEventListener('click', () => {
    const muted = AUDIO.toggleMute();
    document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊';
});

// ============================================
// INITIALIZE
// ============================================

// Initialize theme
THEME.init(canvas);

// Start game loop
gameLoop();
