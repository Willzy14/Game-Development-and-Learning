// ============================================
// GAME CONSTANTS
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Modern color palette (2026 style)
const COLORS = {
    player: {
        primary: '#00ffff',    // Cyan
        secondary: '#0088ff',  // Blue
        glow: '#00ffff'
    },
    enemies: [
        { primary: '#ff00ff', glow: '#ff00ff' },  // Magenta
        { primary: '#ff0088', glow: '#ff0088' },  // Pink
        { primary: '#8800ff', glow: '#8800ff' },  // Purple
        { primary: '#ff4400', glow: '#ff4400' }   // Orange
    ],
    bullets: {
        player: '#00ffff',      // Cyan
        playerGlow: '#00ffff',
        enemy: '#ff0044',       // Red
        enemyGlow: '#ff0044'
    },
    particles: {
        glow: 'rgba(255, 255, 255, 0.8)'
    },
    shield: {
        primary: '#00ff88',
        glow: '#00ff88'
    },
    background: '#0a0a1a',      // Deep space blue-black
    stars: ['#ffffff', '#aaccff', '#ffccaa']
};

// Player constants
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 6;
const PLAYER_Y = CANVAS_HEIGHT - 60;

// Bullet constants
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 8;
const BULLET_COOLDOWN = 250; // milliseconds

// Enemy constants
const ENEMY_WIDTH = 35;
const ENEMY_HEIGHT = 25;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 10;
const ENEMY_PADDING = 15;
const ENEMY_OFFSET_TOP = 80;
const ENEMY_OFFSET_LEFT = 50;
const ENEMY_SPEED_INITIAL = 1;
const ENEMY_SPEED_INCREASE = 0.3;
const ENEMY_MOVE_DOWN = 20;

// Enemy bullet constants
const ENEMY_BULLET_WIDTH = 3;
const ENEMY_BULLET_HEIGHT = 12;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_SHOOT_CHANCE = 0.0008; // Per frame per enemy

// Game constants
const INITIAL_LIVES = 3;
const POINTS_PER_ENEMY = 10;

// Shield constants (NEW - V2 Feature 3/3)
const SHIELD_WIDTH = 80;
const SHIELD_HEIGHT = 60;
const SHIELD_Y = CANVAS_HEIGHT - 150;
const SHIELD_DAMAGE_SIZE = 8;

// Enemy types (different rows have different points)
const ENEMY_TYPES = [
    { points: 40 },  // Row 0 - Top row
    { points: 30 },  // Row 1
    { points: 20 },  // Row 2
    { points: 10 }   // Row 3 - Bottom row
];

// ============================================
// GAME STATE
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    WAVE_COMPLETE: 'wave_complete',
    PLAYER_DIED: 'player_died',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

// ============================================
// STARFIELD BACKGROUND (NEW - V3 Visual Modernization)
// ============================================

class Star {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = Math.random() * CANVAS_HEIGHT;
        this.speed = Math.random() * 2 + 0.5;  // Parallax layers
        this.size = Math.random() * 2;
        this.brightness = Math.random();
        this.colorIndex = Math.floor(Math.random() * COLORS.stars.length);
    }
    
    update() {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT) {
            this.y = 0;
            this.x = Math.random() * CANVAS_WIDTH;
        }
        // Twinkle effect
        this.brightness = Math.sin(Date.now() * 0.001 + this.x) * 0.3 + 0.7;
    }
    
    render(ctx) {
        ctx.fillStyle = COLORS.stars[this.colorIndex];
        ctx.globalAlpha = this.brightness;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

class Starfield {
    constructor(count = 150) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push(new Star());
        }
    }
    
    update() {
        this.stars.forEach(star => star.update());
    }
    
    render(ctx) {
        this.stars.forEach(star => star.render(ctx));
    }
}

// ============================================
// SCREEN SHAKE (NEW - V2 Feature 2/3)
// ============================================

const screenShake = {
    intensity: 0,
    duration: 0,
    offsetX: 0,
    offsetY: 0,
    
    trigger(intensity, duration) {
        this.intensity = intensity;
        this.duration = duration;
    },
    
    update() {
        if (this.duration > 0) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.duration--;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }
};

// ============================================
// PARTICLE SYSTEM (NEW - V2 Feature 1/3)
// ============================================

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 30; // frames
        this.color = color;
        this.size = Math.random() * 3 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life--;
    }
    
    render(ctx) {
        ctx.save();
        
        // Glow effect (V3 - Modern)
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        const alpha = this.life / 30;
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    update() {
        this.particles = this.particles.filter(p => !p.isDead());
        this.particles.forEach(p => p.update());
    }
    
    render(ctx) {
        this.particles.forEach(p => p.render(ctx));
    }
}

// ============================================
// GAME CLASSES
// ============================================

class Player {
    constructor() {
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = PLAYER_Y;
        this.speed = PLAYER_SPEED;
        this.dx = 0;
    }
    
    moveLeft() {
        this.dx = -this.speed;
    }
    
    moveRight() {
        this.dx = this.speed;
    }
    
    stop() {
        this.dx = 0;
    }
    
    update() {
        this.x += this.dx;
        
        // Boundary checking
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.width;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Glow effect (V3 - Modern)
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.player.glow;
        
        // Gradient fill for ship (V3 - Modern)
        const gradient = ctx.createLinearGradient(
            this.x + this.width / 2, this.y,
            this.x + this.width / 2, this.y + 30
        );
        gradient.addColorStop(0, COLORS.player.primary);
        gradient.addColorStop(1, COLORS.player.secondary);
        
        // Base
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y + 20, this.width, 10);
        
        // Triangle body
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // Top point
        ctx.lineTo(this.x, this.y + 20); // Bottom left
        ctx.lineTo(this.x + this.width, this.y + 20); // Bottom right
        ctx.closePath();
        ctx.fill();
        
        // Engine glow (V3 - Modern)
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.player.primary;
        ctx.fillStyle = COLORS.player.primary;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(this.x + 5, this.y + 30, 8, 3);
        ctx.fillRect(this.x + this.width - 13, this.y + 30, 8, 3);
        
        ctx.restore();
    }
    
    reset() {
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = PLAYER_Y;
        this.dx = 0;
    }
}

class Bullet {
    constructor(x, y, isPlayer = true) {
        this.width = isPlayer ? BULLET_WIDTH : ENEMY_BULLET_WIDTH;
        this.height = isPlayer ? BULLET_HEIGHT : ENEMY_BULLET_HEIGHT;
        this.x = x;
        this.y = y;
        this.speed = isPlayer ? -BULLET_SPEED : ENEMY_BULLET_SPEED;
        this.isPlayer = isPlayer;
        this.active = true;
    }
    
    update() {
        this.y += this.speed;
        
        // Deactivate if off screen
        if (this.y < -this.height || this.y > CANVAS_HEIGHT) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        const color = this.isPlayer ? COLORS.bullets.player : COLORS.bullets.enemy;
        const glowColor = this.isPlayer ? COLORS.bullets.playerGlow : COLORS.bullets.enemyGlow;
        
        // Glow effect (V3 - Modern)
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;
        
        // Core bullet
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Trail effect (V3 - Modern)
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height * 2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(
            this.x - 1,
            this.y + (this.isPlayer ? this.height : -this.height),
            this.width + 2,
            this.height
        );
        
        ctx.restore();
    }
    
    collidesWith(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
}

class Enemy {
    constructor(x, y, type) {
        this.width = ENEMY_WIDTH;
        this.height = ENEMY_HEIGHT;
        this.x = x;
        this.y = y;
        this.type = type;
        this.colorData = COLORS.enemies[type];  // V3 - Modern colors
        this.points = ENEMY_TYPES[type].points;
        this.alive = true;
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Glow effect (V3 - Modern)
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.colorData.glow;
        
        // Gradient body (V3 - Modern)
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, this.colorData.primary);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes with glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x + 8, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 21, this.y + 8, 6, 6);
        
        ctx.restore();
    }
    
    checkCollision(bullet) {
        if (!this.alive) return false;
        
        return bullet.collidesWith({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
    }
    
    destroy() {
        this.alive = false;
    }
}

// Shield class (NEW - V2 Feature 3/3)
class Shield {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = SHIELD_WIDTH;
        this.height = SHIELD_HEIGHT;
        this.damage = []; // Array of damage rectangles
    }
    
    takeDamage(bulletX, bulletY) {
        const damage = {
            x: bulletX - this.x,
            y: bulletY - this.y,
            width: SHIELD_DAMAGE_SIZE,
            height: SHIELD_DAMAGE_SIZE
        };
        this.damage.push(damage);
        playShieldHit();
    }
    
    checkCollision(bullet) {
        // First check if bullet hits shield at all
        if (!(bullet.x < this.x + this.width &&
              bullet.x + bullet.width > this.x &&
              bullet.y < this.y + this.height &&
              bullet.y + bullet.height > this.y)) {
            return false;
        }
        
        // Check if bullet hits an undamaged part
        const relativeX = bullet.x - this.x;
        const relativeY = bullet.y - this.y;
        
        // Check if this spot is already damaged
        for (let dmg of this.damage) {
            if (relativeX >= dmg.x && relativeX < dmg.x + dmg.width &&
                relativeY >= dmg.y && relativeY < dmg.y + dmg.height) {
                return false; // Bullet passes through damaged area
            }
        }
        
        return true; // Hit undamaged shield
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Glow effect (V3 - Modern)
        ctx.shadowBlur = 12;
        ctx.shadowColor = COLORS.shield.glow;
        
        // Gradient fill (V3 - Modern)
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, COLORS.shield.primary);
        gradient.addColorStop(1, COLORS.shield.primary + '80');  // Fade bottom
        
        ctx.fillStyle = gradient;
        
        // Draw bottom rectangle
        ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
        
        // Draw arch top
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        
        // Draw damage (dark holes with slight glow)
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000000';
        ctx.fillStyle = COLORS.background;
        this.damage.forEach(dmg => {
            ctx.fillRect(dmg.x, dmg.y, dmg.width, dmg.height);
        });
        
        ctx.restore();
    }
}

class EnemyGroup {
    constructor(wave = 1) {
        this.enemies = [];
        this.direction = 1; // 1 for right, -1 for left
        this.speed = ENEMY_SPEED_INITIAL + (wave - 1) * ENEMY_SPEED_INCREASE;
        this.moveDownNext = false;
        this.initEnemies();
    }
    
    initEnemies() {
        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                const x = ENEMY_OFFSET_LEFT + col * (ENEMY_WIDTH + ENEMY_PADDING);
                const y = ENEMY_OFFSET_TOP + row * (ENEMY_HEIGHT + ENEMY_PADDING);
                this.enemies.push(new Enemy(x, y, row));
            }
        }
    }
    
    update() {
        if (this.moveDownNext) {
            // Move down
            this.enemies.forEach(enemy => {
                if (enemy.alive) enemy.y += ENEMY_MOVE_DOWN;
            });
            this.direction *= -1; // Reverse direction
            this.moveDownNext = false;
        } else {
            // Move horizontally
            let hitEdge = false;
            this.enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.x += this.speed * this.direction;
                    
                    // Check if any enemy hit edge
                    if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) {
                        hitEdge = true;
                    }
                }
            });
            
            if (hitEdge) {
                this.moveDownNext = true;
            }
        }
    }
    
    render(ctx) {
        this.enemies.forEach(enemy => enemy.render(ctx));
    }
    
    getAliveEnemies() {
        return this.enemies.filter(enemy => enemy.alive);
    }
    
    allDestroyed() {
        return this.getAliveEnemies().length === 0;
    }
    
    getRandomAliveEnemy() {
        const alive = this.getAliveEnemies();
        if (alive.length === 0) return null;
        return alive[Math.floor(Math.random() * alive.length)];
    }
    
    checkPlayerReached() {
        return this.enemies.some(enemy => enemy.alive && enemy.y + enemy.height >= PLAYER_Y);
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.playerBullets = [];
        this.enemyBullets = [];
        this.enemyGroup = new EnemyGroup(1);
        this.shields = []; // NEW - V2
        this.particles = new ParticleSystem(); // NEW - V2
        this.starfield = new Starfield(150); // NEW - V3 Visual Modernization
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.wave = 1;
        this.highScore = parseInt(localStorage.getItem('spaceInvadersHighScore') || '0');
        this.lastShootTime = 0;
        this.invincible = false;
        this.invincibilityTime = 0;
        
        this.initShields(); // NEW - V2
    }
    
    // Initialize 4 shields (NEW - V2)
    initShields() {
        const spacing = (CANVAS_WIDTH - SHIELD_WIDTH * 4) / 5;
        for (let i = 0; i < 4; i++) {
            const x = spacing + i * (SHIELD_WIDTH + spacing);
            this.shields.push(new Shield(x, SHIELD_Y));
        }
    }
    
    update() {
        // Always update starfield (even on menu) (V3)
        this.starfield.update();
        
        if (currentState !== GameState.PLAYING) return;
        
        this.player.update();
        
        // Update particles (NEW - V2)
        this.particles.update();
        
        // Update screen shake (NEW - V2)
        screenShake.update();
        
        // Update player bullets
        this.playerBullets = this.playerBullets.filter(bullet => bullet.active);
        this.playerBullets.forEach(bullet => bullet.update());
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);
        this.enemyBullets.forEach(bullet => bullet.update());
        
        // Update enemies
        this.enemyGroup.update();
        
        // Enemy shooting - each alive enemy has a chance to shoot
        const aliveEnemies = this.enemyGroup.getAliveEnemies();
        aliveEnemies.forEach(enemy => {
            if (Math.random() < ENEMY_SHOOT_CHANCE) {
                this.shootEnemyBullet(enemy);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Check win condition
        if (this.enemyGroup.allDestroyed()) {
            this.completeWave();
        }
        
        // Check lose condition (enemies reached player)
        if (this.enemyGroup.checkPlayerReached()) {
            this.loseLife();
        }
        
        // Update invincibility
        if (this.invincible) {
            if (Date.now() - this.invincibilityTime > 2000) {
                this.invincible = false;
            }
        }
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.playerBullets.forEach(bullet => {
            this.enemyGroup.enemies.forEach(enemy => {
                if (enemy.checkCollision(bullet)) {
                    enemy.destroy();
                    bullet.active = false;
                    this.score += enemy.points;
                    updateScoreDisplay();
                    playEnemyDestroy();
                    // Emit particles on enemy destruction (V2 / V3 - Modern colors)
                    this.particles.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8, enemy.colorData.primary);
                }
            });
        });
        
        // Player bullets vs shields (NEW - V2)
        this.playerBullets.forEach(bullet => {
            this.shields.forEach(shield => {
                if (shield.checkCollision(bullet)) {
                    shield.takeDamage(bullet.x, bullet.y);
                    bullet.active = false;
                }
            });
        });
        
        // Enemy bullets vs shields (NEW - V2)
        this.enemyBullets.forEach(bullet => {
            this.shields.forEach(shield => {
                if (shield.checkCollision(bullet)) {
                    shield.takeDamage(bullet.x, bullet.y);
                    bullet.active = false;
                }
            });
        });
        
        // Enemy bullets vs player
        if (!this.invincible) {
            this.enemyBullets.forEach(bullet => {
                if (bullet.collidesWith({
                    x: this.player.x,
                    y: this.player.y,
                    width: this.player.width,
                    height: this.player.height
                })) {
                    bullet.active = false;
                    this.loseLife();
                }
            });
        }
    }
    
    shootPlayerBullet() {
        const now = Date.now();
        if (now - this.lastShootTime < BULLET_COOLDOWN) return;
        
        const bullet = new Bullet(
            this.player.x + this.player.width / 2 - BULLET_WIDTH / 2,
            this.player.y,
            true
        );
        this.playerBullets.push(bullet);
        this.lastShootTime = now;
        playPlayerShoot();
    }
    
    shootEnemyBullet(enemy) {
        const bullet = new Bullet(
            enemy.x + enemy.width / 2 - ENEMY_BULLET_WIDTH / 2,
            enemy.y + enemy.height,
            false
        );
        this.enemyBullets.push(bullet);
        playEnemyShoot();
    }
    
    loseLife() {
        this.lives--;
        updateLivesDisplay();
        playPlayerHit();
        screenShake.trigger(10, 15); // NEW - V2: Shake on player hit
        
        if (this.lives > 0) {
            currentState = GameState.PLAYER_DIED;
            this.invincible = true;
            this.invincibilityTime = Date.now();
            
            setTimeout(() => {
                this.player.reset();
                this.playerBullets = [];
                this.enemyBullets = [];
                currentState = GameState.PLAYING;
            }, 1500);
        } else {
            currentState = GameState.GAME_OVER;
            playGameOver();
            this.updateHighScore();
        }
    }
    
    completeWave() {
        currentState = GameState.WAVE_COMPLETE;
        this.wave++;
        updateWaveDisplay();
        playWaveComplete();
        screenShake.trigger(8, 20); // NEW - V2: Shake on wave complete
        
        setTimeout(() => {
            this.enemyGroup = new EnemyGroup(this.wave);
            this.playerBullets = [];
            this.enemyBullets = [];
            this.player.reset();
            currentState = GameState.PLAYING;
        }, 2500);
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceInvadersHighScore', this.highScore.toString());
            updateHighScoreDisplay();
        }
    }
    
    reset() {
        this.player.reset();
        this.playerBullets = [];
        this.enemyBullets = [];
        this.enemyGroup = new EnemyGroup(1);
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.wave = 1;
        this.invincible = false;
        updateScoreDisplay();
        updateLivesDisplay();
        updateWaveDisplay();
    }
    
    render(ctx) {
        // Clear canvas with modern background (V3 - Modern)
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Render starfield background (NEW - V3)
        this.starfield.render(ctx);
        
        // Apply screen shake offset (NEW - V2)
        ctx.save();
        ctx.translate(screenShake.offsetX, screenShake.offsetY);
        
        // Render shields (NEW - V2)
        this.shields.forEach(shield => shield.render(ctx));
        
        // Render player (with flashing when invincible)
        if (!this.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
            this.player.render(ctx);
        }
        
        // Render bullets
        this.playerBullets.forEach(bullet => bullet.render(ctx));
        this.enemyBullets.forEach(bullet => bullet.render(ctx));
        
        // Render enemies
        this.enemyGroup.render(ctx);
        
        // Render particles (NEW - V2)
        this.particles.render(ctx);
        
        // Render state messages with modern style (V3 - Modern)
        if (currentState === GameState.MENU) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = COLORS.player.glow;
            ctx.fillStyle = COLORS.player.primary;
            ctx.font = '48px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SPACE INVADERS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
            ctx.shadowBlur = 10;
            ctx.font = '24px Arial, sans-serif';
            ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        } else if (currentState === GameState.WAVE_COMPLETE) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = COLORS.player.glow;
            ctx.fillStyle = COLORS.player.primary;
            ctx.font = '36px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('WAVE COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else if (currentState === GameState.PLAYER_DIED) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = COLORS.bullets.enemyGlow;
            ctx.fillStyle = COLORS.bullets.enemy;
            ctx.font = '36px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SHIP DESTROYED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else if (currentState === GameState.GAME_OVER) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = COLORS.bullets.enemyGlow;
            ctx.fillStyle = COLORS.bullets.enemy;
            ctx.font = '48px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
            ctx.shadowBlur = 10;
            ctx.font = '24px Arial, sans-serif';
            ctx.fillStyle = COLORS.player.primary;
            ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        }
        
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;  // Reset shadow (V3)
        ctx.restore(); // Restore after screen shake (NEW - V2)
    }
}

// ============================================
// INPUT HANDLING
// ============================================
const keys = {};
let game = new Game();

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Initialize audio on first interaction
    audio.init();
    
    // Player movement
    if (keys['arrowleft'] || keys['a']) {
        game.player.moveLeft();
    }
    if (keys['arrowright'] || keys['d']) {
        game.player.moveRight();
    }
    
    // Shooting
    if (e.key === ' ') {
        e.preventDefault();
        
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            playGameStart();
        } else if (currentState === GameState.PLAYING) {
            game.shootPlayerBullet();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            playGameStart();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    
    // Stop player if no movement keys pressed
    if (!keys['arrowleft'] && !keys['a'] && !keys['arrowright'] && !keys['d']) {
        game.player.stop();
    }
});

// ============================================
// UI UPDATES
// ============================================
function updateScoreDisplay() {
    document.getElementById('score').textContent = game.score;
}

function updateLivesDisplay() {
    document.getElementById('lives').textContent = game.lives;
}

function updateWaveDisplay() {
    document.getElementById('wave').textContent = game.wave;
}

function updateHighScoreDisplay() {
    document.getElementById('highscore').textContent = game.highScore;
}

// Initialize displays
updateScoreDisplay();
updateLivesDisplay();
updateWaveDisplay();
updateHighScoreDisplay();

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
    game.update();
    game.render(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();
