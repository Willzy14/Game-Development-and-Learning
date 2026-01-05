// ============================================
// SPACE INVADERS V2 MASTERY EDITION - GAME ENGINE
// ============================================
// Features:
// - Animated starfield background
// - Particle explosions with debris
// - Screen shake on impacts
// - Bullet trails with glow
// - Shield damage visualization
// - Smooth animations and easing
// - Wave progression system
// - High score persistence

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// CONSTANTS
// ============================================
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Colors
const COLORS = {
    player: { primary: '#00ffff', glow: 'rgba(0, 255, 255, 0.5)' },
    playerBullet: { primary: '#00ffff', glow: 'rgba(0, 255, 255, 0.5)' },
    enemyBullet: { primary: '#ff0044', glow: 'rgba(255, 0, 68, 0.5)' },
    shield: { primary: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' },
    enemies: [
        { primary: '#ff00ff', glow: 'rgba(255, 0, 255, 0.5)' },
        { primary: '#ff0088', glow: 'rgba(255, 0, 136, 0.5)' },
        { primary: '#ff4400', glow: 'rgba(255, 68, 0, 0.5)' },
        { primary: '#ffaa00', glow: 'rgba(255, 170, 0, 0.5)' }
    ],
    stars: ['#ffffff', '#aaccff', '#ffccaa', '#aaffaa']
};

// Player
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 35;
const PLAYER_SPEED = 12;  // V2: Much faster for arcade-style controls
const PLAYER_Y = CANVAS_HEIGHT - 70;

// Bullets
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;
const PLAYER_BULLET_SPEED = 10;
const ENEMY_BULLET_SPEED = 5;
const BULLET_COOLDOWN = 200;

// Enemies
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 10;
const ENEMY_PADDING = 12;
const ENEMY_OFFSET_TOP = 80;
const ENEMY_OFFSET_LEFT = (CANVAS_WIDTH - (ENEMY_COLS * (ENEMY_WIDTH + ENEMY_PADDING))) / 2;
const ENEMY_SPEED_BASE = 0.8;
const ENEMY_SPEED_INCREASE = 0.15;
const ENEMY_MOVE_DOWN = 25;
const ENEMY_SHOOT_CHANCE = 0.001;

// Shields
const SHIELD_WIDTH = 80;
const SHIELD_HEIGHT = 50;
const SHIELD_Y = PLAYER_Y - 100;
const SHIELD_COUNT = 4;

// Game
const INITIAL_LIVES = 3;
const ENEMY_POINTS = [40, 30, 20, 10]; // Top to bottom

// ============================================
// EASING FUNCTIONS
// ============================================
const Easing = {
    easeOutQuad: t => t * (2 - t),
    easeOutCubic: t => (--t) * t * t + 1,
    easeOutElastic: t => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
};

// ============================================
// STARFIELD
// ============================================
class Star {
    constructor() {
        this.reset(true);
    }
    
    reset(initial = false) {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = initial ? Math.random() * CANVAS_HEIGHT : -5;
        this.speed = Math.random() * 2 + 0.3;
        this.size = Math.random() * 2 + 0.5;
        this.color = COLORS.stars[Math.floor(Math.random() * COLORS.stars.length)];
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }
    
    update(dt) {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT + 5) {
            this.reset();
        }
    }
    
    draw(ctx, time) {
        const twinkle = Math.sin(time * 0.003 + this.twinkleOffset) * 0.3 + 0.7;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Starfield {
    constructor(count = 120) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push(new Star());
        }
    }
    
    update(dt) {
        this.stars.forEach(s => s.update(dt));
    }
    
    draw(ctx, time) {
        this.stars.forEach(s => s.draw(ctx, time));
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx !== undefined ? options.vx : (Math.random() - 0.5) * 8;
        this.vy = options.vy !== undefined ? options.vy : (Math.random() - 0.5) * 8;
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.size = options.size || 3;
        this.color = options.color || '#ffffff';
        this.gravity = options.gravity || 0.1;
        this.friction = options.friction || 0.98;
        this.shape = options.shape || 'circle';
    }
    
    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.life -= dt;
    }
    
    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const size = this.size * (0.5 + alpha * 0.5);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        if (this.shape === 'square') {
            ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        } else if (this.shape === 'spark') {
            const angle = Math.atan2(this.vy, this.vx);
            const length = size * 2;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = size / 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - Math.cos(angle) * length, this.y - Math.sin(angle) * length);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    get isDead() { return this.life <= 0; }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (options.speed || 6) * (0.5 + Math.random() * 0.5);
            this.particles.push(new Particle(x, y, {
                ...options,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            }));
        }
    }
    
    emitExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const shape = Math.random() < 0.3 ? 'spark' : (Math.random() < 0.5 ? 'square' : 'circle');
            
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                color,
                size: 2 + Math.random() * 4,
                life: 0.4 + Math.random() * 0.4,
                shape,
                gravity: 0.15
            }));
        }
    }
    
    update(dt) {
        this.particles = this.particles.filter(p => {
            p.update(dt);
            return !p.isDead;
        });
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(p => p.draw(ctx));
        ctx.restore();
    }
    
    clear() {
        this.particles = [];
    }
}

// ============================================
// SCREEN SHAKE
// ============================================
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.decay = 0.9;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    shake(intensity) {
        this.intensity = Math.max(this.intensity, intensity);
    }
    
    update() {
        if (this.intensity > 0.5) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.intensity *= this.decay;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
        }
    }
    
    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }
}

// ============================================
// TRAIL SYSTEM
// ============================================
class Trail {
    constructor(maxLength = 8) {
        this.positions = [];
        this.maxLength = maxLength;
    }
    
    add(x, y) {
        this.positions.unshift({ x, y });
        if (this.positions.length > this.maxLength) {
            this.positions.pop();
        }
    }
    
    draw(ctx, color, width) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        this.positions.forEach((pos, i) => {
            const alpha = (1 - i / this.maxLength) * 0.4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.fillRect(pos.x - width / 2, pos.y, width, 3);
        });
        
        ctx.restore();
    }
    
    clear() {
        this.positions = [];
    }
}

// ============================================
// PLAYER
// ============================================
class Player {
    constructor() {
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = PLAYER_Y;
        this.targetX = this.x;
        this.speed = PLAYER_SPEED;
        this.hitFlash = 0;
        this.thrusterPhase = 0;
    }
    
    moveLeft() {
        this.targetX = Math.max(0, this.x - this.speed);
    }
    
    moveRight() {
        this.targetX = Math.min(CANVAS_WIDTH - this.width, this.x + this.speed);
    }
    
    update(dt) {
        this.x += (this.targetX - this.x) * 0.2;
        this.thrusterPhase += dt * 10;
        
        if (this.hitFlash > 0) {
            this.hitFlash -= dt * 3;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        const color = this.hitFlash > 0 ? '#ffffff' : COLORS.player.primary;
        
        // Glow
        ctx.shadowColor = this.hitFlash > 0 ? '#ffffff' : COLORS.player.glow;
        ctx.shadowBlur = this.hitFlash > 0 ? 30 : 15;
        
        // Ship body gradient
        const gradient = ctx.createLinearGradient(
            this.x + this.width / 2, this.y,
            this.x + this.width / 2, this.y + this.height
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, darkenColor(color, 40));
        
        ctx.fillStyle = gradient;
        
        // Main triangle
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width, this.y + this.height - 5);
        ctx.closePath();
        ctx.fill();
        
        // Base
        ctx.fillRect(this.x + 5, this.y + this.height - 8, this.width - 10, 8);
        
        // Thrusters
        const thrusterGlow = Math.sin(this.thrusterPhase) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 200, 255, ${thrusterGlow * 0.8})`;
        ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
        ctx.shadowBlur = 10;
        
        const thrusterHeight = 5 + Math.sin(this.thrusterPhase) * 3;
        ctx.fillRect(this.x + 10, this.y + this.height, 8, thrusterHeight);
        ctx.fillRect(this.x + this.width - 18, this.y + this.height, 8, thrusterHeight);
        
        ctx.restore();
    }
    
    hit() {
        this.hitFlash = 1;
    }
    
    reset() {
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.targetX = this.x;
        this.hitFlash = 0;
    }
    
    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}

// ============================================
// BULLET
// ============================================
class Bullet {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.width = BULLET_WIDTH;
        this.height = BULLET_HEIGHT;
        this.isPlayer = isPlayer;
        this.speed = isPlayer ? -PLAYER_BULLET_SPEED : ENEMY_BULLET_SPEED;
        this.active = true;
        this.trail = new Trail(6);
        this.colors = isPlayer ? COLORS.playerBullet : COLORS.enemyBullet;
    }
    
    update(dt) {
        this.trail.add(this.x + this.width / 2, this.y + (this.isPlayer ? this.height : 0));
        this.y += this.speed;
        
        if (this.y < -this.height || this.y > CANVAS_HEIGHT) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        // Trail
        this.trail.draw(ctx, this.colors.glow, this.width + 2);
        
        ctx.save();
        
        // Glow
        ctx.shadowColor = this.colors.glow;
        ctx.shadowBlur = 15;
        
        // Bullet body
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height
        );
        gradient.addColorStop(0, this.colors.primary);
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, this.colors.primary);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
    
    collidesWith(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
}

// ============================================
// ENEMY
// ============================================
class Enemy {
    constructor(x, y, type, col) {
        this.x = x;
        this.y = y;
        this.width = ENEMY_WIDTH;
        this.height = ENEMY_HEIGHT;
        this.type = type;
        this.col = col;
        this.colors = COLORS.enemies[type];
        this.points = ENEMY_POINTS[type];
        this.alive = true;
        this.scale = 0;
        this.targetScale = 1;
        this.wobble = Math.random() * Math.PI * 2;
    }
    
    update(dt) {
        this.scale += (this.targetScale - this.scale) * 0.1;
        this.wobble += dt * 2;
    }
    
    draw(ctx) {
        if (!this.alive || this.scale < 0.01) return;
        
        const wobbleOffset = Math.sin(this.wobble) * 2;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-this.width / 2, -this.height / 2 + wobbleOffset);
        
        // Glow
        ctx.shadowColor = this.colors.glow;
        ctx.shadowBlur = 12;
        
        // Body gradient
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, lightenColor(this.colors.primary, 20));
        gradient.addColorStop(0.7, this.colors.primary);
        gradient.addColorStop(1, darkenColor(this.colors.primary, 30));
        
        ctx.fillStyle = gradient;
        
        // Body shape (rounded rectangle)
        drawRoundedRect(ctx, 0, 0, this.width, this.height, 5);
        ctx.fill();
        
        // Eyes
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.width * 0.3, this.height * 0.4, 4, 0, Math.PI * 2);
        ctx.arc(this.width * 0.7, this.height * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.width * 0.3 + 1, this.height * 0.4, 2, 0, Math.PI * 2);
        ctx.arc(this.width * 0.7 + 1, this.height * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    destroy() {
        this.alive = false;
        this.targetScale = 0;
    }
    
    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}

// ============================================
// ENEMY GROUP
// ============================================
class EnemyGroup {
    constructor(wave = 1) {
        this.enemies = [];
        this.direction = 1;
        this.speed = ENEMY_SPEED_BASE + (wave - 1) * ENEMY_SPEED_INCREASE;
        this.moveDownNext = false;
        this.initEnemies();
    }
    
    initEnemies() {
        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                const x = ENEMY_OFFSET_LEFT + col * (ENEMY_WIDTH + ENEMY_PADDING);
                const y = ENEMY_OFFSET_TOP + row * (ENEMY_HEIGHT + ENEMY_PADDING);
                const enemy = new Enemy(x, y, row, col);
                // Staggered intro
                setTimeout(() => {
                    enemy.targetScale = 1;
                }, (row * ENEMY_COLS + col) * 30);
                this.enemies.push(enemy);
            }
        }
    }
    
    update(dt) {
        this.enemies.forEach(e => e.update(dt));
        
        const alive = this.getAlive();
        if (alive.length === 0) return;
        
        if (this.moveDownNext) {
            alive.forEach(e => e.y += ENEMY_MOVE_DOWN);
            this.direction *= -1;
            this.moveDownNext = false;
            // Speed up as fewer enemies remain
            this.speed = ENEMY_SPEED_BASE * (1 + (1 - alive.length / this.enemies.length) * 2);
        } else {
            let hitEdge = false;
            alive.forEach(e => {
                e.x += this.speed * this.direction;
                if (e.x <= 0 || e.x + e.width >= CANVAS_WIDTH) {
                    hitEdge = true;
                }
            });
            if (hitEdge) this.moveDownNext = true;
        }
    }
    
    draw(ctx) {
        this.enemies.forEach(e => e.draw(ctx));
    }
    
    getAlive() {
        return this.enemies.filter(e => e.alive);
    }
    
    allDestroyed() {
        return this.getAlive().length === 0;
    }
    
    getRandomAlive() {
        const alive = this.getAlive();
        return alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
    }
    
    checkReachedPlayer() {
        return this.enemies.some(e => e.alive && e.y + e.height >= PLAYER_Y);
    }
}

// ============================================
// SHIELD
// ============================================
class Shield {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = SHIELD_WIDTH;
        this.height = SHIELD_HEIGHT;
        this.pixels = [];
        this.initPixels();
    }
    
    initPixels() {
        const pixelSize = 4;
        // Create arch shape with pixels
        for (let py = 0; py < this.height; py += pixelSize) {
            for (let px = 0; px < this.width; px += pixelSize) {
                // Check if in arch shape
                const centerX = this.width / 2;
                const centerY = this.height / 2;
                
                // Bottom rectangle
                if (py >= this.height / 2) {
                    this.pixels.push({ x: px, y: py, size: pixelSize, alive: true });
                }
                // Top arch
                else {
                    const dx = (px + pixelSize / 2 - centerX) / (this.width / 2);
                    const dy = (py + pixelSize / 2 - centerY) / (this.height / 2);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= 1 && py >= 0) {
                        this.pixels.push({ x: px, y: py, size: pixelSize, alive: true });
                    }
                }
            }
        }
    }
    
    takeDamage(bulletX, bulletY, radius = 10) {
        const localX = bulletX - this.x;
        const localY = bulletY - this.y;
        
        this.pixels.forEach(p => {
            if (!p.alive) return;
            const dx = (p.x + p.size / 2) - localX;
            const dy = (p.y + p.size / 2) - localY;
            if (Math.sqrt(dx * dx + dy * dy) < radius) {
                p.alive = false;
            }
        });
    }
    
    checkCollision(bullet) {
        const localX = bullet.x - this.x;
        const localY = bullet.y - this.y;
        
        for (let p of this.pixels) {
            if (!p.alive) continue;
            if (localX + bullet.width > p.x &&
                localX < p.x + p.size &&
                localY + bullet.height > p.y &&
                localY < p.y + p.size) {
                return true;
            }
        }
        return false;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.shadowColor = COLORS.shield.glow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = COLORS.shield.primary;
        
        this.pixels.forEach(p => {
            if (p.alive) {
                ctx.fillRect(p.x, p.y, p.size - 1, p.size - 1);
            }
        });
        
        ctx.restore();
    }
    
    reset() {
        this.pixels.forEach(p => p.alive = true);
    }
}

// ============================================
// GAME STATE
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    WAVE_COMPLETE: 'wave_complete',
    PLAYER_HIT: 'player_hit',
    GAME_OVER: 'gameover',
    PAUSED: 'paused'
};

let currentState = GameState.MENU;
let lastTime = 0;
let deltaTime = 0;
let gameTime = 0;

// ============================================
// GAME CLASS
// ============================================
class Game {
    constructor() {
        this.player = new Player();
        this.playerBullets = [];
        this.enemyBullets = [];
        this.enemyGroup = new EnemyGroup(1);
        this.shields = [];
        this.particles = new ParticleSystem();
        this.screenShake = new ScreenShake();
        this.starfield = new Starfield(120);
        
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.wave = 1;
        this.highScore = parseInt(localStorage.getItem('spaceInvadersV2HighScore') || '0');
        this.lastShootTime = 0;
        this.invincible = false;
        this.invincibleUntil = 0;
        
        this.initShields();
    }
    
    initShields() {
        this.shields = [];
        const spacing = (CANVAS_WIDTH - SHIELD_WIDTH * SHIELD_COUNT) / (SHIELD_COUNT + 1);
        for (let i = 0; i < SHIELD_COUNT; i++) {
            const x = spacing + i * (SHIELD_WIDTH + spacing);
            this.shields.push(new Shield(x, SHIELD_Y));
        }
    }
    
    update(dt) {
        gameTime += dt * 1000;
        
        this.starfield.update(dt);
        this.screenShake.update();
        this.particles.update(dt);
        this.player.update(dt);
        
        if (currentState !== GameState.PLAYING) return;
        
        // Update bullets
        this.playerBullets = this.playerBullets.filter(b => b.active);
        this.enemyBullets = this.enemyBullets.filter(b => b.active);
        this.playerBullets.forEach(b => b.update(dt));
        this.enemyBullets.forEach(b => b.update(dt));
        
        // Update enemies
        this.enemyGroup.update(dt);
        
        // Enemy shooting
        this.enemyGroup.getAlive().forEach(enemy => {
            if (Math.random() < ENEMY_SHOOT_CHANCE) {
                this.shootEnemyBullet(enemy);
            }
        });
        
        // Invincibility check
        if (this.invincible && Date.now() > this.invincibleUntil) {
            this.invincible = false;
        }
        
        this.checkCollisions();
        this.checkWinLose();
        
        // Update music intensity based on remaining enemies
        const enemyRatio = 1 - this.enemyGroup.getAlive().length / (ENEMY_ROWS * ENEMY_COLS);
        setMusicIntensity(enemyRatio);
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.playerBullets.forEach(bullet => {
            this.enemyGroup.enemies.forEach(enemy => {
                if (enemy.alive && bullet.collidesWith({
                    x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height
                })) {
                    enemy.destroy();
                    bullet.active = false;
                    this.score += enemy.points;
                    
                    // Effects
                    const center = enemy.getCenter();
                    this.particles.emitExplosion(center.x, center.y, enemy.colors.primary, 20);
                    this.screenShake.shake(5);
                    
                    const pan = (enemy.x / CANVAS_WIDTH) * 2 - 1;
                    playEnemyDestroy(pan, enemy.type);
                    
                    canvas.classList.add('enemy-hit');
                    setTimeout(() => canvas.classList.remove('enemy-hit'), 100);
                    
                    updateScoreDisplay();
                    
                    // High score
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('spaceInvadersV2HighScore', this.highScore.toString());
                        updateHighScoreDisplay();
                    }
                }
            });
        });
        
        // Bullets vs shields
        [...this.playerBullets, ...this.enemyBullets].forEach(bullet => {
            this.shields.forEach(shield => {
                if (shield.checkCollision(bullet)) {
                    shield.takeDamage(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
                    bullet.active = false;
                    playShieldHit();
                    this.particles.emit(bullet.x, bullet.y, 5, {
                        color: COLORS.shield.primary,
                        size: 2,
                        life: 0.3,
                        speed: 4
                    });
                }
            });
        });
        
        // Enemy bullets vs player
        if (!this.invincible) {
            this.enemyBullets.forEach(bullet => {
                if (bullet.collidesWith({
                    x: this.player.x, y: this.player.y,
                    width: this.player.width, height: this.player.height
                })) {
                    bullet.active = false;
                    this.loseLife();
                }
            });
        }
    }
    
    checkWinLose() {
        // Wave complete
        if (this.enemyGroup.allDestroyed()) {
            this.completeWave();
        }
        
        // Enemies reached player
        if (this.enemyGroup.checkReachedPlayer()) {
            this.loseLife();
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
            enemy.x + enemy.width / 2 - BULLET_WIDTH / 2,
            enemy.y + enemy.height,
            false
        );
        this.enemyBullets.push(bullet);
        const pan = (enemy.x / CANVAS_WIDTH) * 2 - 1;
        playEnemyShoot(pan);
    }
    
    loseLife() {
        this.lives--;
        updateLivesDisplay();
        
        this.player.hit();
        this.screenShake.shake(15);
        playPlayerHit();
        
        const center = this.player.getCenter();
        this.particles.emitExplosion(center.x, center.y, COLORS.player.primary, 30);
        
        canvas.classList.add('player-hit');
        setTimeout(() => canvas.classList.remove('player-hit'), 500);
        
        if (this.lives <= 0) {
            currentState = GameState.GAME_OVER;
            stopBackgroundMusic();
            playGameOver();
        } else {
            currentState = GameState.PLAYER_HIT;
            
            setTimeout(() => {
                this.player.reset();
                this.enemyBullets = [];
                this.invincible = true;
                this.invincibleUntil = Date.now() + 2000;
                currentState = GameState.PLAYING;
            }, 1500);
        }
    }
    
    completeWave() {
        currentState = GameState.WAVE_COMPLETE;
        this.wave++;
        updateWaveDisplay();
        
        canvas.classList.add('wave-complete');
        setTimeout(() => canvas.classList.remove('wave-complete'), 1500);
        
        playWaveComplete();
        
        // Victory particles
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.particles.emit(
                    Math.random() * CANVAS_WIDTH,
                    Math.random() * CANVAS_HEIGHT / 2,
                    5,
                    {
                        color: COLORS.enemies[Math.floor(Math.random() * 4)].primary,
                        size: 4,
                        life: 0.8,
                        speed: 6
                    }
                );
            }, i * 30);
        }
        
        setTimeout(() => {
            this.enemyGroup = new EnemyGroup(this.wave);
            this.shields.forEach(s => s.reset());
            this.enemyBullets = [];
            this.playerBullets = [];
            currentState = GameState.PLAYING;
        }, 2000);
    }
    
    render(ctx) {
        // Clear with background
        ctx.fillStyle = '#000010';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Starfield (no shake)
        this.starfield.draw(ctx, gameTime);
        
        ctx.save();
        this.screenShake.apply(ctx);
        
        // Shields
        this.shields.forEach(s => s.draw(ctx));
        
        // Enemies
        this.enemyGroup.draw(ctx);
        
        // Bullets
        this.playerBullets.forEach(b => b.draw(ctx));
        this.enemyBullets.forEach(b => b.draw(ctx));
        
        // Player (flash if invincible)
        if (!this.invincible || Math.floor(gameTime / 100) % 2 === 0) {
            this.player.draw(ctx);
        }
        
        // Particles
        this.particles.draw(ctx);
        
        ctx.restore();
        
        // UI
        this.renderUI(ctx);
    }
    
    renderUI(ctx) {
        if (currentState === GameState.MENU) {
            this.drawOverlay(ctx, 'SPACE INVADERS', 'PRESS SPACE TO START', '#00ffff');
            ctx.font = '14px "Courier New"';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText('A/D or ←/→ to move, SPACE to fire', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        } else if (currentState === GameState.PLAYER_HIT) {
            ctx.save();
            ctx.fillStyle = '#ff4444';
            ctx.font = '32px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.fillText('HIT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.restore();
        } else if (currentState === GameState.WAVE_COMPLETE) {
            this.drawOverlay(ctx, `WAVE ${this.wave - 1} COMPLETE`, 'Get ready...', '#00ff88');
        } else if (currentState === GameState.GAME_OVER) {
            this.drawOverlay(ctx, 'GAME OVER', `Final Score: ${this.score}`, '#ff4444');
            ctx.font = '16px "Courier New"';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        } else if (currentState === GameState.PAUSED) {
            this.drawOverlay(ctx, 'PAUSED', 'Press P to resume', '#ffcc00');
        }
    }
    
    drawOverlay(ctx, title, subtitle, color) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 42px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#888888';
        ctx.font = '18px "Courier New"';
        ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
        ctx.restore();
    }
    
    reset() {
        this.player = new Player();
        this.playerBullets = [];
        this.enemyBullets = [];
        this.enemyGroup = new EnemyGroup(1);
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.wave = 1;
        this.invincible = false;
        this.initShields();
        this.particles.clear();
        
        updateScoreDisplay();
        updateLivesDisplay();
        updateWaveDisplay();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ============================================
// UI UPDATES
// ============================================

function updateScoreDisplay() {
    const el = document.getElementById('score');
    el.textContent = game.score;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 300);
}

function updateHighScoreDisplay() {
    document.getElementById('highScore').textContent = game.highScore;
}

function updateLivesDisplay() {
    const el = document.getElementById('lives');
    el.textContent = '♥'.repeat(game.lives);
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 300);
}

function updateWaveDisplay() {
    const el = document.getElementById('wave');
    el.textContent = game.wave;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 300);
}

// ============================================
// INPUT
// ============================================

const keys = {};
let game = new Game();

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true;
    
    initAudio();
    
    if (e.key === ' ') {
        e.preventDefault();
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            startBackgroundMusic();
            playGameStart();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            startBackgroundMusic();
            playGameStart();
        } else if (currentState === GameState.PLAYING) {
            game.shootPlayerBullet();
        }
    }
    
    if (e.key.toLowerCase() === 'p') {
        if (currentState === GameState.PLAYING) {
            currentState = GameState.PAUSED;
        } else if (currentState === GameState.PAUSED) {
            currentState = GameState.PLAYING;
        }
    }
    
    if (e.key.toLowerCase() === 'm') {
        const muted = toggleMute();
        console.log(muted ? '🔇 Muted' : '🔊 Unmuted');
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.key] = false;
});

function handleInput() {
    if (currentState === GameState.PLAYING) {
        if (keys['arrowleft'] || keys['a']) game.player.moveLeft();
        if (keys['arrowright'] || keys['d']) game.player.moveRight();
    }
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop(timestamp) {
    deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    handleInput();
    game.update(deltaTime);
    game.render(ctx);
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// INIT
// ============================================

console.log('🎮 Space Invaders V2 Mastery Edition loaded!');
console.log('🎯 Press SPACE to start');
console.log('🎹 Press M to toggle mute');

updateHighScoreDisplay();
requestAnimationFrame(gameLoop);
