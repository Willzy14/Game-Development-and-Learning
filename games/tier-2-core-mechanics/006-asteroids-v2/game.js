/**
 * ASTEROIDS v2 - GAME MECHANICS
 * 
 * ALL game logic lives here. NO visual code.
 * THEME.render(getGameState()) handles all rendering.
 * AUDIO.play*() handles all sound effects.
 * 
 * This file contains:
 * - Game state and settings
 * - Entity classes (update logic only)
 * - Collision detection
 * - Scoring/progression
 * - Input handling
 * - Game loop
 */

// =============================================================================
// GAME SETTINGS
// =============================================================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const SETTINGS = {
    // Ship
    shipSize: 24,          // Bigger ship for visibility
    turnSpeed: 0.08,
    thrustPower: 0.15,
    maxSpeed: 8,
    friction: 0.99,
    
    // Shooting
    fireRate: 150,
    bulletSpeed: 10,
    bulletLife: 60,
    bulletSize: 3,         // Small bullets
    chargedBulletSize: 6,  // Charged slightly bigger
    
    // Charge shot
    chargeTime: 500,       // Reduced from 800ms for faster charge
    chargedBulletSpeed: 12,
    chargedBulletDamage: 3,
    
    // Asteroids
    asteroidCount: 4,
    asteroidSpeed: 2,
    asteroidSizes: {
        large: 40,
        medium: 25,
        small: 12
    },
    
    // Gravity wells
    gravityWellChance: 0.25,
    gravityWellRadius: 80,
    gravityWellForce: 0.15,
    gravityWellDuration: 600,
    
    // Scoring
    pointsSmall: 100,
    pointsMedium: 50,
    pointsLarge: 25,
    gravityWellBonus: 200,
    
    // Combo
    comboTimeout: 120,
    
    // Lives
    startingLives: 3,
    respawnInvulnerability: 180  // 3 seconds at 60fps
};

// =============================================================================
// GAME STATE
// =============================================================================

let canvas, ctx;
let gameState = 'playing';

let ship = null;
let bullets = [];
let asteroids = [];
let gravityWells = [];
let floatingTexts = [];

let score = 0;
let displayedScore = 0;
let combo = 1;
let comboTimer = 0;
let comboFlash = 0;
let screenShake = 0;
let level = 1;
let lives = 3;

let keys = {};
let lastFireTime = 0;
let chargeStartTime = 0;
let isCharging = false;

// =============================================================================
// SHIP CLASS
// =============================================================================

class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = -Math.PI / 2;
        this.size = SETTINGS.shipSize;
        this.invulnerable = 120;
        this.thrusting = false;
    }
    
    update() {
        // Rotation
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.angle -= SETTINGS.turnSpeed;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.angle += SETTINGS.turnSpeed;
        }
        
        // Thrust
        this.thrusting = keys['ArrowUp'] || keys['KeyW'];
        if (this.thrusting) {
            this.vx += Math.cos(this.angle) * SETTINGS.thrustPower;
            this.vy += Math.sin(this.angle) * SETTINGS.thrustPower;
        }
        
        // Apply gravity wells
        for (const well of gravityWells) {
            const dx = well.x - this.x;
            const dy = well.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < well.radius && dist > 5) {
                const force = SETTINGS.gravityWellForce * (1 - dist / well.radius);
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }
        
        // Speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > SETTINGS.maxSpeed) {
            this.vx = (this.vx / speed) * SETTINGS.maxSpeed;
            this.vy = (this.vy / speed) * SETTINGS.maxSpeed;
        }
        
        // Apply friction
        this.vx *= SETTINGS.friction;
        this.vy *= SETTINGS.friction;
        
        // Move
        this.x += this.vx;
        this.y += this.vy;
        
        // Screen wrap
        if (this.x < 0) this.x = CANVAS_WIDTH;
        if (this.x > CANVAS_WIDTH) this.x = 0;
        if (this.y < 0) this.y = CANVAS_HEIGHT;
        if (this.y > CANVAS_HEIGHT) this.y = 0;
        
        // Invulnerability countdown
        if (this.invulnerable > 0) this.invulnerable--;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            angle: this.angle,
            size: this.size,
            invulnerable: this.invulnerable,
            thrusting: this.thrusting,
            charging: isCharging,
            chargePercent: isCharging ? Math.min((Date.now() - chargeStartTime) / SETTINGS.chargeTime, 1) : 0
        };
    }
}

// =============================================================================
// BULLET CLASS
// =============================================================================

class Bullet {
    constructor(x, y, angle, charged = false) {
        this.x = x;
        this.y = y;
        const speed = charged ? SETTINGS.chargedBulletSpeed : SETTINGS.bulletSpeed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = SETTINGS.bulletLife;
        this.charged = charged;
        this.size = charged ? SETTINGS.chargedBulletSize : SETTINGS.bulletSize;
        this.damage = charged ? SETTINGS.chargedBulletDamage : 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Screen wrap
        if (this.x < 0) this.x = CANVAS_WIDTH;
        if (this.x > CANVAS_WIDTH) this.x = 0;
        if (this.y < 0) this.y = CANVAS_HEIGHT;
        if (this.y > CANVAS_HEIGHT) this.y = 0;
        
        this.life--;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            size: this.size,
            charged: this.charged
        };
    }
}

// =============================================================================
// ASTEROID CLASS
// =============================================================================

class Asteroid {
    constructor(x, y, size = 'large', vx = null, vy = null) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = SETTINGS.asteroidSizes[size];
        
        if (vx !== null && vy !== null) {
            this.vx = vx;
            this.vy = vy;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const speed = SETTINGS.asteroidSpeed * (0.5 + Math.random() * 0.5);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        
        // Larger asteroids may contain gravity wells
        this.hasGravityWell = size === 'large' && Math.random() < SETTINGS.gravityWellChance;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Screen wrap
        if (this.x < -this.radius) this.x = CANVAS_WIDTH + this.radius;
        if (this.x > CANVAS_WIDTH + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = CANVAS_HEIGHT + this.radius;
        if (this.y > CANVAS_HEIGHT + this.radius) this.y = -this.radius;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            rotation: this.rotation,
            hasGravityWell: this.hasGravityWell
        };
    }
}

// =============================================================================
// GRAVITY WELL CLASS
// =============================================================================

class GravityWell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = SETTINGS.gravityWellRadius;
        this.life = SETTINGS.gravityWellDuration;
        this.maxLife = SETTINGS.gravityWellDuration;
        this.animationOffset = 0;
    }
    
    update() {
        this.life--;
        this.animationOffset += 0.05;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            fadeRatio: Math.min(1, this.life / 60),
            animationOffset: this.animationOffset
        };
    }
}

// =============================================================================
// FLOATING TEXT CLASS
// =============================================================================

class FloatingText {
    constructor(x, y, text, color = '#fff', size = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.life = 60;
        this.maxLife = 60;
        this.vy = -1.5;
    }
    
    update() {
        this.y += this.vy;
        this.vy *= 0.95;
        this.life--;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            text: this.text,
            color: this.color,
            size: this.size,
            alpha: this.life / this.maxLife
        };
    }
}

// =============================================================================
// GAME FUNCTIONS
// =============================================================================

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Initialize theme and audio
    THEME.init(canvas);
    AUDIO.init();
    
    resetGame();
    
    // Input listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Update debug info
    updateDebug();
    
    // Start game loop
    gameLoop();
}

function resetGame() {
    ship = new Ship(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    bullets = [];
    asteroids = [];
    gravityWells = [];
    floatingTexts = [];
    
    score = 0;
    displayedScore = 0;
    combo = 1;
    comboTimer = 0;
    comboFlash = 0;
    screenShake = 0;
    level = 1;
    lives = SETTINGS.startingLives;
    
    gameState = 'ready';  // Start in ready state, waiting for player
    
    spawnAsteroids(SETTINGS.asteroidCount);
}

function spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.random() * CANVAS_WIDTH;
            y = Math.random() * CANVAS_HEIGHT;
            attempts++;
        } while (
            attempts < 50 &&
            Math.hypot(x - ship.x, y - ship.y) < 150
        );
        
        asteroids.push(new Asteroid(x, y, 'large'));
    }
}

function update() {
    if (gameState !== 'playing') return;
    
    // Update ship
    ship.update();
    
    // Update thrust sound (continuous engine rumble)
    if (AUDIO.updateThrust) {
        AUDIO.updateThrust(ship.thrusting);
    }
    
    // Update bullets
    bullets.forEach(b => b.update());
    bullets = bullets.filter(b => b.life > 0);
    
    // Update asteroids
    asteroids.forEach(a => a.update());
    
    // Update gravity wells
    gravityWells.forEach(w => w.update());
    gravityWells = gravityWells.filter(w => w.life > 0);
    
    // Update floating texts
    floatingTexts.forEach(t => t.update());
    floatingTexts = floatingTexts.filter(t => t.life > 0);
    
    // Combo timer
    if (combo > 1) {
        comboTimer--;
        if (comboTimer <= 0) {
            combo = 1;
            // Return music to calm when combo drops
            if (AUDIO.setMusicIntensity) AUDIO.setMusicIntensity(0);
        }
    }
    
    // Combo flash decay
    if (comboFlash > 0) comboFlash--;
    
    // Screen shake decay
    if (screenShake > 0) screenShake *= 0.9;
    
    // Score animation
    if (displayedScore < score) {
        const diff = score - displayedScore;
        displayedScore += Math.ceil(diff / 10);
    }
    
    // Check collisions
    checkCollisions();
    
    // Level progression
    if (asteroids.length === 0) {
        level++;
        spawnAsteroids(SETTINGS.asteroidCount + level - 1);
    }
}

function checkCollisions() {
    // Bullet-asteroid collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < asteroid.radius + bullet.size) {
                // Hit!
                destroyAsteroid(j, asteroid);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Ship-asteroid collisions
    if (ship.invulnerable <= 0) {
        for (const asteroid of asteroids) {
            const dx = ship.x - asteroid.x;
            const dy = ship.y - asteroid.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < asteroid.radius + ship.size * 0.6) {
                // Ship hit!
                lives--;
                AUDIO.playShipDestroy();
                screenShake = 20;
                
                // Reset combo on death
                combo = 1;
                comboTimer = 0;
                
                if (lives <= 0) {
                    // Game over!
                    gameState = 'gameover';
                    // Silence thrust on game over
                    if (AUDIO.updateThrust) AUDIO.updateThrust(false);
                    // Stop the music
                    if (AUDIO.stopMusic) AUDIO.stopMusic();
                } else {
                    // Respawn ship at center with invulnerability
                    ship.x = CANVAS_WIDTH / 2;
                    ship.y = CANVAS_HEIGHT / 2;
                    ship.vx = 0;
                    ship.vy = 0;
                    ship.angle = -Math.PI / 2;
                    ship.invulnerable = SETTINGS.respawnInvulnerability;
                    
                    // Show lives lost message
                    floatingTexts.push(new FloatingText(
                        CANVAS_WIDTH / 2,
                        CANVAS_HEIGHT / 2 - 50,
                        `${lives} ${lives === 1 ? 'LIFE' : 'LIVES'} LEFT`,
                        '#ff6060',
                        28
                    ));
                }
                return;
            }
        }
    }
}

function destroyAsteroid(index, asteroid) {
    asteroids.splice(index, 1);
    
    // Award points with combo
    let points;
    switch (asteroid.size) {
        case 'small': points = SETTINGS.pointsSmall; break;
        case 'medium': points = SETTINGS.pointsMedium; break;
        default: points = SETTINGS.pointsLarge;
    }
    
    const comboPoints = points * combo;
    score += comboPoints;
    
    // Floating score popup
    const comboColors = ['#fff', '#ff0', '#f80', '#f00', '#f0f'];
    const color = comboColors[Math.min(combo, comboColors.length - 1)];
    floatingTexts.push(new FloatingText(
        asteroid.x, 
        asteroid.y, 
        `+${comboPoints}`, 
        color,
        16 + Math.min(combo * 2, 16)
    ));
    
    // Update combo
    const oldCombo = combo;
    combo = Math.min(combo + 1, 10);
    comboTimer = SETTINGS.comboTimeout;
    
    if (combo > oldCombo) {
        comboFlash = 30;
        AUDIO.playComboIncrease(combo);
        
        // Increase music intensity at higher combos
        if (AUDIO.setMusicIntensity) {
            if (combo >= 7) AUDIO.setMusicIntensity(2);      // Intense
            else if (combo >= 4) AUDIO.setMusicIntensity(1); // Normal
        }
    }
    
    // Screen shake based on size
    switch (asteroid.size) {
        case 'large': screenShake += 8; break;
        case 'medium': screenShake += 4; break;
        case 'small': screenShake += 2; break;
    }
    
    AUDIO.playExplosion(asteroid.size);
    
    // Spawn gravity well if asteroid had one
    if (asteroid.hasGravityWell) {
        gravityWells.push(new GravityWell(asteroid.x, asteroid.y));
        AUDIO.playGravityWellSpawn();
        
        // Bonus points
        score += SETTINGS.gravityWellBonus * combo;
        floatingTexts.push(new FloatingText(
            asteroid.x, 
            asteroid.y - 30, 
            `GRAVITY! +${SETTINGS.gravityWellBonus * combo}`, 
            '#88f',
            24
        ));
    }
    
    // Split into smaller asteroids
    const nextSize = asteroid.size === 'large' ? 'medium' : 
                     asteroid.size === 'medium' ? 'small' : null;
    
    if (nextSize) {
        const count = asteroid.size === 'large' ? 2 : 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = SETTINGS.asteroidSpeed * (1 + Math.random() * 0.5);
            asteroids.push(new Asteroid(
                asteroid.x,
                asteroid.y,
                nextSize,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ));
        }
    }
}

function fire() {
    const now = Date.now();
    if (now - lastFireTime < SETTINGS.fireRate) return;
    
    // Spawn bullet at ship's nose
    const noseX = ship.x + Math.cos(ship.angle) * ship.size;
    const noseY = ship.y + Math.sin(ship.angle) * ship.size;
    
    bullets.push(new Bullet(noseX, noseY, ship.angle, false));
    lastFireTime = now;
    
    AUDIO.playShoot();
}

function fireCharged() {
    const chargeTime = Date.now() - chargeStartTime;
    const chargePercent = Math.min(chargeTime / SETTINGS.chargeTime, 1);
    
    if (chargePercent >= 1) {
        // Fully charged shot
        const noseX = ship.x + Math.cos(ship.angle) * ship.size;
        const noseY = ship.y + Math.sin(ship.angle) * ship.size;
        
        bullets.push(new Bullet(noseX, noseY, ship.angle, true));
        screenShake += 5;
        
        AUDIO.playChargedShoot();
    } else {
        // Not fully charged, fire normal
        fire();
    }
}

function updateDebug() {
    const debug = document.getElementById('debugInfo');
    if (debug) {
        debug.textContent = `Modular Architecture: game.js (${document.querySelector('script[src="game.js"]') ? '✓' : '✗'}) | theme.js (${typeof THEME !== 'undefined' ? '✓' : '✗'}) | audio.js (${typeof AUDIO !== 'undefined' ? '✓' : '✗'})`;
    }
}

// =============================================================================
// GET GAME STATE FOR THEME RENDERING
// =============================================================================

function getGameState() {
    return {
        canvas: canvas,
        ship: ship.getState(),
        bullets: bullets.map(b => b.getState()),
        asteroids: asteroids.map(a => a.getState()),
        gravityWells: gravityWells.map(w => w.getState()),
        floatingTexts: floatingTexts.map(t => t.getState()),
        ui: {
            displayedScore,
            combo,
            comboTimer,
            comboTimeout: SETTINGS.comboTimeout,
            comboFlash,
            lives,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT
        },
        screenShake,
        state: gameState,
        score
    };
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
    keys[e.code] = true;
    
    // Resume audio context on first input
    AUDIO.resume();
    
    // Start game from ready screen
    if (e.code === 'Enter' && gameState === 'ready') {
        gameState = 'playing';
        AUDIO.playUISelect();
        // Start the music!
        if (AUDIO.startMusic) AUDIO.startMusic();
        return;
    }
    
    // Shooting
    if (e.code === 'Space' && !isCharging && gameState === 'playing') {
        isCharging = true;
        chargeStartTime = Date.now();
    }
    
    // Pause
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'playing') {
            gameState = 'paused';
            // Silence thrust when paused
            if (AUDIO.updateThrust) AUDIO.updateThrust(false);
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    }
    
    // Restart
    if (e.code === 'Enter' && gameState === 'gameover') {
        resetGame();
        gameState = 'playing';  // Go straight to playing after game over
        AUDIO.playUISelect();
        // Restart the music
        if (AUDIO.startMusic) AUDIO.startMusic();
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
    
    // Fire on space release
    if (e.code === 'Space' && isCharging && gameState === 'playing') {
        fireCharged();
        isCharging = false;
    }
}

// =============================================================================
// START GAME
// =============================================================================

window.onload = init;
