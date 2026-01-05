// ============================================
// BREAKOUT V2 MASTERY EDITION - GAME ENGINE
// ============================================
// Advanced features:
// - Particle explosions on brick break
// - Screen shake on impacts
// - Ball trail with glow
// - Combo system with visual feedback
// - Animated brick destruction
// - Smooth paddle movement with easing
// - Dynamic background effects
// - Enhanced visual feedback everywhere

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// CONSTANTS
// ============================================
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Paddle
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const PADDLE_SPEED = 16;  // V2: Much faster for snappy controls
const PADDLE_Y = CANVAS_HEIGHT - 45;

// Ball
const BALL_RADIUS = 8;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_MAX = 14;
const BALL_SPEED_INCREASE = 0.15;

// Bricks
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 22;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 70;
const BRICK_OFFSET_LEFT = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

// Game
const INITIAL_LIVES = 3;
const POINTS_PER_BRICK = 10;
const COMBO_TIMEOUT = 1000; // ms

// Colors - Neon theme
const BRICK_COLORS = [
    { main: '#ff0066', glow: 'rgba(255, 0, 102, 0.5)' },   // Pink
    { main: '#ff6600', glow: 'rgba(255, 102, 0, 0.5)' },   // Orange
    { main: '#ffcc00', glow: 'rgba(255, 204, 0, 0.5)' },   // Yellow
    { main: '#00ff66', glow: 'rgba(0, 255, 102, 0.5)' },   // Green
    { main: '#00ccff', glow: 'rgba(0, 204, 255, 0.5)' },   // Cyan
    { main: '#cc00ff', glow: 'rgba(204, 0, 255, 0.5)' }    // Purple
];

// ============================================
// EASING FUNCTIONS
// ============================================
const Easing = {
    linear: t => t,
    easeOutQuad: t => t * (2 - t),
    easeOutCubic: t => (--t) * t * t + 1,
    easeOutElastic: t => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    easeOutBounce: t => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

// ============================================
// PARTICLE SYSTEM
// ============================================
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx !== undefined ? options.vx : (Math.random() - 0.5) * 10;
        this.vy = options.vy !== undefined ? options.vy : (Math.random() - 0.5) * 10;
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.size = options.size || 4;
        this.color = options.color || '#ffffff';
        this.gravity = options.gravity || 0.15;
        this.friction = options.friction || 0.98;
        this.shape = options.shape || 'circle'; // 'circle', 'square', 'spark'
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
        const size = this.size * alpha;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'square') {
            ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        } else if (this.shape === 'spark') {
            // Line in direction of movement
            const angle = Math.atan2(this.vy, this.vx);
            const length = size * 3;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = size / 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - Math.cos(angle) * length, this.y - Math.sin(angle) * length);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    get isDead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count = 10, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (options.speed || 8) * (0.5 + Math.random() * 0.5);
            this.particles.push(new Particle(x, y, {
                ...options,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            }));
        }
    }
    
    emitExplosion(x, y, color, count = 20) {
        // Mixed particle types for rich explosion
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            const shape = Math.random() < 0.3 ? 'spark' : (Math.random() < 0.5 ? 'square' : 'circle');
            
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Slight upward bias
                color: color,
                size: 2 + Math.random() * 4,
                life: 0.5 + Math.random() * 0.5,
                shape: shape,
                gravity: 0.2
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
    constructor(maxLength = 15) {
        this.positions = [];
        this.maxLength = maxLength;
    }
    
    add(x, y) {
        this.positions.unshift({ x, y });
        if (this.positions.length > this.maxLength) {
            this.positions.pop();
        }
    }
    
    draw(ctx, color, baseSize) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        this.positions.forEach((pos, index) => {
            const alpha = (1 - index / this.maxLength) * 0.4;
            const size = baseSize * (1 - index / this.maxLength * 0.7);
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    clear() {
        this.positions = [];
    }
}

// ============================================
// FLOATING TEXT
// ============================================
class FloatingText {
    constructor() {
        this.texts = [];
    }
    
    add(x, y, text, color, options = {}) {
        this.texts.push({
            x, y,
            text: String(text),
            color,
            life: 1,
            vy: options.vy || -2,
            scale: 0,
            targetScale: options.scale || 1
        });
    }
    
    update(dt) {
        this.texts = this.texts.filter(t => {
            t.life -= dt * 0.8;
            t.y += t.vy;
            t.scale += (t.targetScale - t.scale) * 0.2;
            return t.life > 0;
        });
    }
    
    draw(ctx) {
        this.texts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.life;
            ctx.fillStyle = t.color;
            ctx.font = `bold ${16 * t.scale}px 'Courier New'`;
            ctx.textAlign = 'center';
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 10;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        });
    }
}

// ============================================
// BRICK CLASS (Enhanced)
// ============================================
class Brick {
    constructor(x, y, row, col) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
        this.colors = BRICK_COLORS[row % BRICK_COLORS.length];
        this.destroyed = false;
        this.points = POINTS_PER_BRICK * (BRICK_ROWS - row); // Top rows worth more
        
        // Animation state
        this.scale = 0;
        this.targetScale = 1;
        this.destroyAnimation = 0;
        this.hitFlash = 0;
    }
    
    update(dt) {
        // Intro animation
        this.scale += (this.targetScale - this.scale) * 0.1;
        
        // Hit flash decay
        if (this.hitFlash > 0) {
            this.hitFlash -= dt * 5;
        }
        
        // Destroy animation
        if (this.destroyed && this.destroyAnimation < 1) {
            this.destroyAnimation += dt * 3;
        }
    }
    
    draw(ctx) {
        if (this.destroyAnimation >= 1) return;
        
        const scale = this.destroyed ? 1 - Easing.easeOutCubic(this.destroyAnimation) : this.scale;
        if (scale <= 0) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const w = this.width * scale;
        const h = this.height * scale;
        
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = this.colors.glow;
        ctx.shadowBlur = this.hitFlash > 0 ? 20 : 8;
        
        // Main brick body - gradient for 3D look
        const gradient = ctx.createLinearGradient(
            centerX - w / 2, centerY - h / 2,
            centerX - w / 2, centerY + h / 2
        );
        
        const mainColor = this.hitFlash > 0 ? '#ffffff' : this.colors.main;
        gradient.addColorStop(0, lightenColor(mainColor, 30));
        gradient.addColorStop(0.5, mainColor);
        gradient.addColorStop(1, darkenColor(mainColor, 20));
        
        ctx.fillStyle = gradient;
        
        // Rounded rectangle
        const radius = 3 * scale;
        drawRoundedRect(ctx, centerX - w / 2, centerY - h / 2, w, h, radius);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        drawRoundedRect(ctx, centerX - w / 2 + 2, centerY - h / 2 + 2, w - 4, h / 3, radius);
        ctx.fill();
        
        ctx.restore();
    }
    
    hit() {
        this.hitFlash = 1;
    }
    
    destroy() {
        this.destroyed = true;
        this.hitFlash = 1;
    }
    
    checkCollision(ball) {
        if (this.destroyed) return false;
        
        return ball.x + ball.radius > this.x &&
               ball.x - ball.radius < this.x + this.width &&
               ball.y + ball.radius > this.y &&
               ball.y - ball.radius < this.y + this.height;
    }
    
    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}

// ============================================
// PADDLE CLASS (Enhanced)
// ============================================
class Paddle {
    constructor() {
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = PADDLE_Y;
        this.targetX = this.x;
        this.speed = PADDLE_SPEED;
        this.hitFlash = 0;
    }
    
    moveLeft() {
        this.targetX = Math.max(0, this.x - this.speed);
    }
    
    moveRight() {
        this.targetX = Math.min(CANVAS_WIDTH - this.width, this.x + this.speed);
    }
    
    update(dt) {
        // Smooth movement with easing
        this.x += (this.targetX - this.x) * 0.3;
        
        // Clamp
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
        
        // Flash decay
        if (this.hitFlash > 0) {
            this.hitFlash -= dt * 5;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Glow
        ctx.shadowColor = this.hitFlash > 0 ? '#ffffff' : 'rgba(0, 255, 255, 0.5)';
        ctx.shadowBlur = this.hitFlash > 0 ? 25 : 15;
        
        // Gradient body
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        const color = this.hitFlash > 0 ? '#ffffff' : '#00ffff';
        gradient.addColorStop(0, lightenColor(color, 30));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, darkenColor(color, 20));
        
        ctx.fillStyle = gradient;
        drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        
        // Center indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(this.x + this.width / 2 - 1, this.y + 2, 2, this.height - 4);
        
        ctx.restore();
    }
    
    hit() {
        this.hitFlash = 1;
    }
    
    getCenter() {
        return this.x + this.width / 2;
    }
}

// ============================================
// BALL CLASS (Enhanced)
// ============================================
class Ball {
    constructor() {
        this.radius = BALL_RADIUS;
        this.trail = new Trail(12);
        this.reset();
    }
    
    reset() {
        this.x = CANVAS_WIDTH / 2;
        this.y = PADDLE_Y - 30;
        this.speed = BALL_SPEED_INITIAL;
        this.dx = 0;
        this.dy = 0;
        this.launched = false;
        this.glowIntensity = 1;
        this.trail.clear();
    }
    
    launch() {
        if (this.launched) return;
        
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30 to 30 degrees
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.cos(angle) * this.speed;
        this.launched = true;
    }
    
    update(dt) {
        if (!this.launched) return;
        
        // Store position for trail
        this.trail.add(this.x, this.y);
        
        this.x += this.dx;
        this.y += this.dy;
        
        // Update glow based on speed
        this.glowIntensity = 0.5 + (this.speed / BALL_SPEED_MAX) * 0.5;
    }
    
    draw(ctx) {
        // Draw trail first
        this.trail.draw(ctx, 'rgba(255, 255, 255, 0.3)', this.radius);
        
        ctx.save();
        
        // Glow
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 15 * this.glowIntensity;
        
        // 3D sphere gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#dddddd');
        gradient.addColorStop(1, '#aaaaaa');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    reverseX() {
        this.dx = -this.dx;
    }
    
    reverseY() {
        this.dy = -this.dy;
    }
    
    increaseSpeed() {
        if (this.speed < BALL_SPEED_MAX) {
            this.speed += BALL_SPEED_INCREASE;
            const angle = Math.atan2(this.dy, this.dx);
            this.dx = Math.cos(angle) * this.speed;
            this.dy = Math.sin(angle) * this.speed;
        }
    }
    
    hitPaddle(paddle) {
        const hitPos = (this.x - paddle.getCenter()) / (paddle.width / 2);
        const angle = hitPos * (Math.PI / 3);
        
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.abs(Math.cos(angle)) * this.speed;
        
        this.increaseSpeed();
        return hitPos;
    }
}

// ============================================
// GAME STATE
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    BALL_LOST: 'ball_lost',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'gameover',
    PAUSED: 'paused'
};

let currentState = GameState.MENU;
let lastTime = 0;
let deltaTime = 0;

// ============================================
// GAME CLASS
// ============================================
class Game {
    constructor() {
        this.paddle = new Paddle();
        this.ball = new Ball();
        this.bricks = [];
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.level = 1;
        this.combo = 0;
        this.lastHitTime = 0;
        this.maxCombo = 0;
        
        this.particles = new ParticleSystem();
        this.screenShake = new ScreenShake();
        this.floatingText = new FloatingText();
        
        this.initBricks();
    }
    
    initBricks() {
        this.bricks = [];
        for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
                const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
                const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
                const brick = new Brick(x, y, row, col);
                // Stagger intro animation
                brick.targetScale = 1;
                brick.scale = 0;
                setTimeout(() => {
                    brick.targetScale = 1;
                }, (row * BRICK_COLS + col) * 20);
                this.bricks.push(brick);
            }
        }
    }
    
    update(dt) {
        // Always update visuals
        this.screenShake.update();
        this.particles.update(dt);
        this.floatingText.update(dt);
        
        this.bricks.forEach(b => b.update(dt));
        this.paddle.update(dt);
        
        if (currentState !== GameState.PLAYING) return;
        
        this.ball.update(dt);
        
        // Combo timeout
        if (Date.now() - this.lastHitTime > COMBO_TIMEOUT && this.combo > 0) {
            this.combo = 0;
            updateComboDisplay();
        }
        
        this.checkCollisions();
        this.checkBallOut();
        this.checkLevelComplete();
    }
    
    checkCollisions() {
        // Wall collisions
        if (this.ball.x - this.ball.radius <= 0) {
            this.ball.x = this.ball.radius;
            this.ball.reverseX();
            playWallBounce(-1);
            this.particles.emit(this.ball.x, this.ball.y, 5, { color: '#666666', size: 2, life: 0.3 });
        }
        
        if (this.ball.x + this.ball.radius >= CANVAS_WIDTH) {
            this.ball.x = CANVAS_WIDTH - this.ball.radius;
            this.ball.reverseX();
            playWallBounce(1);
            this.particles.emit(this.ball.x, this.ball.y, 5, { color: '#666666', size: 2, life: 0.3 });
        }
        
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.reverseY();
            playWallBounce(0);
            this.particles.emit(this.ball.x, this.ball.y, 5, { color: '#666666', size: 2, life: 0.3 });
        }
        
        // Paddle collision
        if (this.ball.dy > 0 &&
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width) {
            
            const hitPos = this.ball.hitPaddle(this.paddle);
            this.paddle.hit();
            playPaddleHit(hitPos);
            
            this.screenShake.shake(3);
            this.particles.emit(this.ball.x, this.paddle.y, 10, {
                color: '#00ffff',
                size: 3,
                life: 0.3,
                speed: 6
            });
            
            // Reset combo on paddle hit
            if (this.combo > 0) {
                this.maxCombo = Math.max(this.maxCombo, this.combo);
            }
            this.combo = 0;
            updateComboDisplay();
        }
        
        // Brick collisions
        for (let brick of this.bricks) {
            if (brick.checkCollision(this.ball)) {
                brick.destroy();
                
                // Update combo
                this.combo++;
                this.lastHitTime = Date.now();
                
                // Calculate points with combo multiplier
                const comboMultiplier = Math.min(this.combo, 10);
                const points = brick.points * comboMultiplier;
                this.score += points;
                
                // Visual feedback
                const center = brick.getCenter();
                
                // Particles
                this.particles.emitExplosion(center.x, center.y, brick.colors.main, 15 + this.combo * 2);
                
                // Floating text
                this.floatingText.add(center.x, center.y, `+${points}`, brick.colors.main, {
                    scale: 1 + this.combo * 0.1
                });
                
                if (this.combo > 2) {
                    this.floatingText.add(center.x, center.y + 20, `${this.combo}x COMBO!`, '#ffaa00', {
                        scale: 0.8
                    });
                }
                
                // Screen shake scales with combo
                this.screenShake.shake(3 + this.combo);
                
                // Canvas effect
                if (this.combo >= 5) {
                    canvas.classList.add('combo-effect');
                    setTimeout(() => canvas.classList.remove('combo-effect'), 200);
                } else {
                    canvas.classList.add('brick-break');
                    setTimeout(() => canvas.classList.remove('brick-break'), 100);
                }
                
                // Audio
                playBrickBreak(brick.row, brick.col, this.combo);
                if (this.combo >= 3) {
                    playComboSound(this.combo);
                }
                
                // Ball direction change
                this.ball.reverseY();
                
                // Update displays
                updateScoreDisplay();
                updateComboDisplay();
                
                break; // One brick per frame
            }
        }
    }
    
    checkBallOut() {
        if (this.ball.y - this.ball.radius > CANVAS_HEIGHT) {
            this.lives--;
            updateLivesDisplay();
            
            canvas.classList.add('life-lost');
            setTimeout(() => canvas.classList.remove('life-lost'), 500);
            
            this.screenShake.shake(15);
            
            // Explosion at bottom
            this.particles.emit(this.ball.x, CANVAS_HEIGHT - 20, 30, {
                color: '#ff0000',
                size: 4,
                life: 0.8,
                speed: 10
            });
            
            if (this.lives > 0) {
                currentState = GameState.BALL_LOST;
                playLoseLife();
                
                setTimeout(() => {
                    this.ball.reset();
                    this.combo = 0;
                    updateComboDisplay();
                    currentState = GameState.PLAYING;
                    this.ball.launch();
                }, 1500);
            } else {
                currentState = GameState.GAME_OVER;
                playGameOver();
            }
        }
    }
    
    checkLevelComplete() {
        const allDestroyed = this.bricks.every(brick => brick.destroyed);
        if (allDestroyed) {
            currentState = GameState.LEVEL_COMPLETE;
            this.level++;
            updateLevelDisplay();
            
            canvas.classList.add('level-complete');
            setTimeout(() => canvas.classList.remove('level-complete'), 2000);
            
            // Victory particles
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    this.particles.emit(
                        Math.random() * CANVAS_WIDTH,
                        Math.random() * CANVAS_HEIGHT / 2 + BRICK_OFFSET_TOP,
                        5,
                        {
                            color: BRICK_COLORS[Math.floor(Math.random() * BRICK_COLORS.length)].main,
                            size: 4,
                            life: 1,
                            speed: 8
                        }
                    );
                }, i * 30);
            }
            
            playLevelComplete();
            
            setTimeout(() => {
                this.initBricks();
                this.ball.reset();
                this.ball.speed = BALL_SPEED_INITIAL + this.level * 0.5; // Slightly faster each level
                this.combo = 0;
                updateComboDisplay();
                currentState = GameState.PLAYING;
                this.ball.launch();
            }, 2500);
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Apply screen shake
        this.screenShake.apply(ctx);
        
        // Background
        this.drawBackground(ctx);
        
        // Bricks
        this.bricks.forEach(brick => brick.draw(ctx));
        
        // Paddle
        this.paddle.draw(ctx);
        
        // Ball
        this.ball.draw(ctx);
        
        // Particles (additive)
        this.particles.draw(ctx);
        
        // Floating text
        this.floatingText.draw(ctx);
        
        ctx.restore();
        
        // UI overlay (not affected by shake)
        this.renderUI(ctx);
    }
    
    drawBackground(ctx) {
        // Dark gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#0a0015');
        gradient.addColorStop(0.5, '#0a0020');
        gradient.addColorStop(1, '#050010');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Subtle grid
        ctx.strokeStyle = 'rgba(255, 0, 100, 0.03)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        
        for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        
        for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }
    
    renderUI(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        
        if (currentState === GameState.MENU) {
            this.drawOverlay(ctx, 'BREAKOUT V2', 'PRESS SPACE TO START', '#ffffff');
            ctx.font = '14px "Courier New"';
            ctx.fillStyle = '#666666';
            ctx.fillText('Break all the bricks!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        } else if (currentState === GameState.BALL_LOST) {
            ctx.fillStyle = '#ff6666';
            ctx.font = '28px "Courier New"';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.fillText('BALL LOST!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else if (currentState === GameState.LEVEL_COMPLETE) {
            this.drawOverlay(ctx, `LEVEL ${this.level - 1} COMPLETE!`, 'Get ready...', '#00ff66');
        } else if (currentState === GameState.GAME_OVER) {
            this.drawOverlay(ctx, 'GAME OVER', `Final Score: ${this.score}`, '#ff0066');
            ctx.font = '16px "Courier New"';
            ctx.fillStyle = '#666666';
            ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
            ctx.fillText(`Max Combo: ${this.maxCombo}x`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 85);
        } else if (currentState === GameState.PAUSED) {
            this.drawOverlay(ctx, 'PAUSED', 'Press P to resume', '#ffcc00');
        }
    }
    
    drawOverlay(ctx, title, subtitle, color) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Title
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 42px "Courier New"';
        ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        
        // Subtitle
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#888888';
        ctx.font = '18px "Courier New"';
        ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
    }
    
    reset() {
        this.paddle = new Paddle();
        this.ball = new Ball();
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.initBricks();
        this.particles.clear();
        updateScoreDisplay();
        updateLivesDisplay();
        updateLevelDisplay();
        updateComboDisplay();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
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

function updateLivesDisplay() {
    const el = document.getElementById('lives');
    el.textContent = game.lives;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 300);
}

function updateLevelDisplay() {
    const el = document.getElementById('level');
    el.textContent = game.level;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 300);
}

function updateComboDisplay() {
    const el = document.getElementById('combo');
    const group = el.parentElement;
    el.textContent = game.combo;
    
    if (game.combo >= 3) {
        group.classList.add('active');
    } else {
        group.classList.remove('active');
    }
}

// ============================================
// INPUT HANDLING
// ============================================
const keys = {};
let game = new Game();

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true; // For arrow keys
    
    initAudio();
    
    if (e.key === ' ') {
        e.preventDefault();
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            game.ball.launch();
            playGameStart();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            game.ball.launch();
            playGameStart();
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

// Continuous input handling
function handleInput() {
    if (currentState === GameState.PLAYING || currentState === GameState.MENU) {
        if (keys['arrowleft'] || keys['a']) {
            game.paddle.moveLeft();
        }
        if (keys['arrowright'] || keys['d']) {
            game.paddle.moveRight();
        }
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
// INITIALIZE
// ============================================
console.log('🎮 Breakout V2 Mastery Edition loaded!');
console.log('🎯 Press SPACE to start');
console.log('🎹 Press M to toggle mute');

requestAnimationFrame(gameLoop);
