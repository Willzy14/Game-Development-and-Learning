// ============================================
// GAME CONSTANTS
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Grid constants
const GRID_SIZE = 20;  // Size of each cell in pixels (kept at 20 for visual consistency)
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;   // 40 cells wide
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE; // 40 cells tall

// Game constants
const MOVE_INTERVAL = 120; // Milliseconds between moves (slightly faster for bigger grid)
const INITIAL_LENGTH = 3;

// Power-up types and properties
const PowerUpType = {
    SPEED: {
        name: 'Speed Boost',
        color: '#00aaff',
        glowColor: '#00aaff',
        duration: 8000, // milliseconds
        icon: '⚡',
        effect: 'moveSpeed'
    },
    INVINCIBLE: {
        name: 'Invincibility',
        color: '#ffaa00',
        glowColor: '#ffaa00',
        duration: 6000,
        icon: '★',
        effect: 'invincible'
    },
    DOUBLE_POINTS: {
        name: 'Double Points',
        color: '#aa00ff',
        glowColor: '#aa00ff',
        duration: 10000,
        icon: '2×',
        effect: 'doublePoints'
    },
    GHOST: {
        name: 'Ghost Mode',
        color: '#00ffff',
        glowColor: '#00ffff',
        duration: 5000,
        icon: '👻',
        effect: 'ghost'
    }
};

const POWERUP_SPAWN_CHANCE = 0.15; // 15% chance to spawn power-up instead of regular food

// Direction constants
const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Game state
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;
let lastMoveTime = 0;

// ============================================
// SCREEN SHAKE SYSTEM
// ============================================

class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    shake(intensity, frames) {
        this.intensity = intensity;
        this.duration = frames;
    }
    
    update() {
        if (this.duration > 0) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.duration--;
            
            if (this.duration === 0) {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }
    }
    
    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }
}

const screenShake = new ScreenShake();

// ============================================
// STARFIELD BACKGROUND
// ============================================

class Starfield {
    constructor() {
        this.stars = [];
        // Create multiple layers for parallax effect (more stars for bigger canvas)
        this.layers = [
            { count: 150, speed: 0.3, size: 1, opacity: 0.4, color: '#ffffff' },
            { count: 80, speed: 0.6, size: 2, opacity: 0.6, color: '#aaccff' },
            { count: 50, speed: 0.9, size: 3, opacity: 0.8, color: '#ffccaa' }
        ];
        
        this.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    size: layer.size,
                    speed: layer.speed,
                    opacity: layer.opacity,
                    color: layer.color,
                    twinkle: Math.random() * Math.PI * 2 // For twinkling effect
                });
            }
        });
        
        // Nebula clouds
        this.nebulae = [];
        for (let i = 0; i < 8; i++) {
            this.nebulae.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                radius: 80 + Math.random() * 120,
                color: Math.random() > 0.5 ? 'rgba(100, 50, 150' : 'rgba(50, 100, 150',
                alpha: 0.02 + Math.random() * 0.03,
                drift: (Math.random() - 0.5) * 0.2
            });
        }
        
        this.intensity = 1.0; // Gameplay intensity multiplier
    }
    
    update(snakeLength = 3) {
        // Increase intensity based on snake length
        this.intensity = 1 + (snakeLength / 40) * 0.5;
        
        // Slowly move stars down for subtle motion
        this.stars.forEach(star => {
            star.y += star.speed * 0.1 * this.intensity;
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
            star.twinkle += 0.02 * this.intensity; // Animate twinkle faster with intensity
        });
        
        // Drift nebulae slowly
        this.nebulae.forEach(nebula => {
            nebula.x += nebula.drift;
            if (nebula.x < -nebula.radius) nebula.x = CANVAS_WIDTH + nebula.radius;
            if (nebula.x > CANVAS_WIDTH + nebula.radius) nebula.x = -nebula.radius;
        });
    }
    
    render(ctx, activePowerUps = []) {
        // Draw nebulae first (behind stars)
        this.nebulae.forEach(nebula => {
            const gradient = ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            
            // Tint nebula based on active power-ups
            let color = nebula.color;
            if (activePowerUps.some(pu => pu.type.effect === 'ghost')) {
                color = 'rgba(0, 255, 255';
            } else if (activePowerUps.some(pu => pu.type.effect === 'invincible')) {
                color = 'rgba(255, 170, 0';
            }
            
            gradient.addColorStop(0, color + `, ${nebula.alpha})`);
            gradient.addColorStop(0.5, color + `, ${nebula.alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        });
        
        // Draw stars with intensity-based brightness
        this.stars.forEach(star => {
            const twinkleAlpha = star.opacity * (0.7 + Math.sin(star.twinkle) * 0.3) * this.intensity;
            ctx.fillStyle = star.color.replace(')', `, ${Math.min(twinkleAlpha, 1.0)})`);
            if (!ctx.fillStyle.includes('rgba')) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(twinkleAlpha, 1.0)})`;
            }
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 2;
        this.color = color;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // Slight gravity
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

const particles = [];

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// ============================================
// SNAKE CLASS
// ============================================

class Snake {
    constructor() {
        // Start in center of grid
        const startX = Math.floor(GRID_WIDTH / 2);
        const startY = Math.floor(GRID_HEIGHT / 2);
        
        // Snake is array of segments, each with {x, y}
        // Head is segments[0]
        this.segments = [];
        for (let i = 0; i < INITIAL_LENGTH; i++) {
            this.segments.push({
                x: startX - i, // Start with body extending left
                y: startY
            });
        }
        
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT; // Buffer for input
    }
    
    update() {
        // Apply buffered direction (prevents double-input in same frame)
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = this.segments[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Wrap at edges
        if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
        if (newHead.x >= GRID_WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1;
        if (newHead.y >= GRID_HEIGHT) newHead.y = 0;
        
        // Add new head to front
        this.segments.unshift(newHead);
        
        // Remove tail (keeps length constant for now)
        this.segments.pop();
    }
    
    checkSelfCollision() {
        // Check if head collides with any body segment
        const head = this.segments[0];
        
        // Start at index 1 (skip head itself)
        for (let i = 1; i < this.segments.length; i++) {
            if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    setDirection(newDirection) {
        // Prevent 180-degree turns (can't go back on yourself)
        const oppositeX = this.direction.x + newDirection.x === 0;
        const oppositeY = this.direction.y + newDirection.y === 0;
        
        if (oppositeX && oppositeY) {
            return; // Ignore opposite direction
        }
        
        this.nextDirection = newDirection;
    }
    
    grow() {
        // Add segment at tail position (will be done by not popping in update)
        const tail = this.segments[this.segments.length - 1];
        this.segments.push({ x: tail.x, y: tail.y });
    }
    
    render(ctx) {
        // Draw all segments with gradients and glows
        this.segments.forEach((segment, index) => {
            const isHead = index === 0;
            const x = segment.x * GRID_SIZE;
            const y = segment.y * GRID_SIZE;
            
            // Save context for glow effects
            ctx.save();
            
            if (isHead) {
                // Head with bright glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ff88';
                
                // Radial gradient for head
                const gradient = ctx.createRadialGradient(
                    x + GRID_SIZE / 2, y + GRID_SIZE / 2, 0,
                    x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2
                );
                gradient.addColorStop(0, '#00ff88');
                gradient.addColorStop(1, '#00aa66');
                ctx.fillStyle = gradient;
            } else {
                // Body with subtle glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00aa66';
                
                // Linear gradient for body segments
                const gradient = ctx.createLinearGradient(
                    x, y, x + GRID_SIZE, y + GRID_SIZE
                );
                const opacity = 1 - (index / this.segments.length) * 0.3;
                gradient.addColorStop(0, `rgba(0, 170, 102, ${opacity})`);
                gradient.addColorStop(1, `rgba(0, 136, 85, ${opacity})`);
                ctx.fillStyle = gradient;
            }
            
            ctx.fillRect(
                x + 1,
                y + 1,
                GRID_SIZE - 2,
                GRID_SIZE - 2
            );
            
            ctx.restore();
        });
    }
}

// ============================================
// FOOD CLASS
// ============================================

class Food {
    constructor(snake) {
        this.respawn(snake);
        this.pulsePhase = 0;
    }
    
    update() {
        this.pulsePhase += 0.08;
    }
    
    respawn(snake) {
        // Find empty position not occupied by snake
        let position;
        let isValidPosition;
        
        do {
            position = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            
            // Check if this position overlaps with snake
            isValidPosition = !snake.segments.some(segment => 
                segment.x === position.x && segment.y === position.y
            );
        } while (!isValidPosition);
        
        this.x = position.x;
        this.y = position.y;
    }
    
    render(ctx) {
        // Draw food as glowing circle with gradient and pulsing
        ctx.save();
        
        const centerX = this.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = this.y * GRID_SIZE + GRID_SIZE / 2;
        
        // Pulsing scale effect
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;
        const radius = (GRID_SIZE / 2 - 2) * pulse;
        
        // Glow effect with pulse
        ctx.shadowBlur = 20 + Math.sin(this.pulsePhase) * 8;
        ctx.shadowColor = '#ff3366';
        
        // Radial gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#ff6699');
        gradient.addColorStop(0.7, '#ff3366');
        gradient.addColorStop(1, '#cc0044');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
}

// ============================================
// POWERUP CLASS
// ============================================

class PowerUp {
    constructor(snake, type) {
        this.type = type;
        this.respawn(snake);
        this.pulsePhase = 0;
        this.rotationAngle = 0;
    }
    
    respawn(snake) {
        // Find empty position not occupied by snake
        let position;
        let isValidPosition;
        
        do {
            position = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            
            isValidPosition = !snake.segments.some(segment => 
                segment.x === position.x && segment.y === position.y
            );
        } while (!isValidPosition);
        
        this.x = position.x;
        this.y = position.y;
    }
    
    update() {
        this.pulsePhase += 0.1;
        this.rotationAngle += 0.05;
    }
    
    render(ctx) {
        const centerX = this.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = this.y * GRID_SIZE + GRID_SIZE / 2;
        
        ctx.save();
        
        // Pulsing glow effect
        const pulse = 0.7 + Math.sin(this.pulsePhase) * 0.3;
        ctx.shadowBlur = 25 * pulse;
        ctx.shadowColor = this.type.glowColor;
        
        // Draw rotating particles around power-up
        for (let i = 0; i < 6; i++) {
            const angle = this.rotationAngle + (i * Math.PI / 3);
            const px = centerX + Math.cos(angle) * 12;
            const py = centerY + Math.sin(angle) * 12;
            
            ctx.fillStyle = this.type.color;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        
        ctx.globalAlpha = 1;
        
        // Main power-up body - diamond shape
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 4);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, GRID_SIZE / 2);
        gradient.addColorStop(0, this.type.color);
        gradient.addColorStop(0.7, this.type.color);
        gradient.addColorStop(1, this.type.glowColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-GRID_SIZE / 3, -GRID_SIZE / 3, GRID_SIZE * 2 / 3, GRID_SIZE * 2 / 3);
        
        ctx.restore();
    }
}

// ============================================
// GAME OBJECT
// ============================================

class Game {
    constructor() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.powerUp = null; // Current power-up on field
        this.activePowerUps = []; // Active power-ups affecting snake
        this.score = 0;
        this.starfield = new Starfield();
        this.moveSpeedMultiplier = 1.0;
        
        // Combo system
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.lastFoodTime = 0;
        this.comboTimeWindow = 3000; // 3 seconds to maintain combo
        this.comboText = [];
        
        // Trail system
        this.trails = [];
        this.trailMaxLength = 8;
        
        // Milestone system
        this.milestones = [10, 20, 30];
        this.achievedMilestones = [];
        this.milestoneText = null;
        this.lastDirection = Direction.RIGHT;
    }
    
    update() {
        // Update starfield even in menu
        this.starfield.update(this.snake.segments.length);
        
        // Update screen shake
        screenShake.update();
        
        // Update power-up animation if present
        if (this.powerUp) {
            this.powerUp.update();
        }
        
        // Update food animation
        this.food.update();
        
        // Update active power-ups (check expiration)
        const currentTime = Date.now();
        this.activePowerUps = this.activePowerUps.filter(pu => {
            if (currentTime >= pu.expireTime) {
                // Power-up expired
                if (pu.type.effect === 'moveSpeed') {
                    this.moveSpeedMultiplier = 1.0;
                }
                return false;
            }
            return true;
        });
        
        // Update combo system - check if combo expired
        if (this.comboCount > 0 && currentTime - this.lastFoodTime > this.comboTimeWindow) {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        
        // Update combo text animations
        this.comboText = this.comboText.filter(text => {
            text.life -= 0.02;
            text.y -= 1;
            return text.life > 0;
        });
        
        // Update milestone text
        if (this.milestoneText) {
            this.milestoneText.life -= 0.01;
            if (this.milestoneText.life <= 0) {
                this.milestoneText = null;
            }
        }
        
        // Update particles even during game over for death explosion
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        if (currentState !== GameState.PLAYING) return;
        
        // Check if enough time has passed for next move (with speed multiplier)
        const currentMoveInterval = MOVE_INTERVAL / this.moveSpeedMultiplier;
        if (currentTime - lastMoveTime < currentMoveInterval) {
            return; // Not time to move yet
        }
        lastMoveTime = currentTime;
        
        // Update snake
        this.snake.update();
        
        // Get head and tail positions
        let head = this.snake.segments[0];
        const tail = this.snake.segments[this.snake.segments.length - 1];
        
        // Create trail at tail position (so trail follows behind)
        this.trails.push({
            x: tail.x * GRID_SIZE + GRID_SIZE / 2,
            y: tail.y * GRID_SIZE + GRID_SIZE / 2,
            life: 1.0,
            size: GRID_SIZE * 0.8
        });
        
        // Limit trail length and update
        if (this.trails.length > this.trailMaxLength) {
            this.trails.shift();
        }
        this.trails.forEach(trail => {
            trail.life -= 1 / this.trailMaxLength;
        });
        
        // Check for self-collision (game over) - unless ghost mode or invincible
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        
        if (!hasGhost && !hasInvincible && this.snake.checkSelfCollision()) {
            console.log('COLLISION DETECTED - Setting GAME_OVER state');
            currentState = GameState.GAME_OVER;
            
            // Enhanced death sequence
            // (head already defined above)
            
            // Massive screen shake
            screenShake.shake(20, 30);
            
            // Explode all segments outward
            this.snake.segments.forEach((segment, index) => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 4;
                const centerX = segment.x * GRID_SIZE + GRID_SIZE / 2;
                const centerY = segment.y * GRID_SIZE + GRID_SIZE / 2;
                const color = index === 0 ? '#00ff88' : '#00aa66';
                
                // Create 3 particles per segment using Particle class
                for (let i = 0; i < 3; i++) {
                    const particle = new Particle(centerX, centerY, color);
                    // Customize velocity for explosion effect
                    particle.vx = Math.cos(angle + i * 0.5) * speed;
                    particle.vy = Math.sin(angle + i * 0.5) * speed;
                    particle.life = 1.5;
                    particle.decay = 0.01;
                    particle.size = Math.random() * 6 + 3;
                    particles.push(particle);
                }
            });
            
            // Play death sound sequence
            playDeathSound();
            setTimeout(() => playDeathSound(), 150);
            
            return;
        }
        
        // Check if snake ate food (head already defined above)
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow();
            
            // Check for milestone achievement
            const snakeLength = this.snake.segments.length;
            this.milestones.forEach(milestone => {
                if (snakeLength === milestone && !this.achievedMilestones.includes(milestone)) {
                    this.achievedMilestones.push(milestone);
                    this.milestoneText = {
                        text: `${milestone} SEGMENTS!`,
                        subtext: milestone === 10 ? 'MASSIVE!' : milestone === 20 ? 'UNSTOPPABLE!' : 'LEGENDARY!',
                        life: 2.0,
                        y: CANVAS_HEIGHT / 2 - 50
                    };
                    playMilestoneSound();
                    screenShake.shake(15, 20);
                    
                    // Massive particle explosion
                    for (let i = 0; i < 30; i++) {
                        createParticles(
                            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
                            ['#ffaa00', '#ff6699', '#00ffff', '#00ff88'][Math.floor(Math.random() * 4)],
                            1
                        );
                    }
                }
            });
            
            // Update combo
            const timeSinceLastFood = Date.now() - this.lastFoodTime;
            if (timeSinceLastFood < this.comboTimeWindow) {
                this.comboCount++;
                // Multiplier increases: 1x, 2x, 3x, 5x, 8x
                if (this.comboCount >= 8) this.comboMultiplier = 8;
                else if (this.comboCount >= 5) this.comboMultiplier = 5;
                else if (this.comboCount >= 3) this.comboMultiplier = 3;
                else if (this.comboCount >= 2) this.comboMultiplier = 2;
            } else {
                this.comboCount = 1;
                this.comboMultiplier = 1;
            }
            this.lastFoodTime = Date.now();
            
            // Apply points with combo multiplier
            const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
            const basePoints = hasDoublePoints ? 20 : 10;
            const points = basePoints * this.comboMultiplier;
            this.score += points;
            updateScoreDisplay();
            
            // Show combo text if multiplier > 1
            if (this.comboMultiplier > 1) {
                this.comboText.push({
                    text: `${this.comboMultiplier}x COMBO!`,
                    x: head.x * GRID_SIZE + GRID_SIZE / 2,
                    y: head.y * GRID_SIZE,
                    life: 1.0,
                    multiplier: this.comboMultiplier
                });
                
                // Escalating screen shake based on combo
                screenShake.shake(2 + this.comboMultiplier, 6);
                
                // Play combo sound
                playComboSound(this.comboMultiplier);
            } else {
                // Subtle screen shake on eat
                screenShake.shake(3, 5);
                // Play eat sound
                playEatSound();
            }
            
            this.food.respawn(this.snake);
            
            // Spawn particles at food location
            createParticles(
                this.food.x * GRID_SIZE + GRID_SIZE / 2,
                this.food.y * GRID_SIZE + GRID_SIZE / 2,
                '#ff3366',
                8
            );
            
            // Chance to spawn power-up
            if (!this.powerUp && Math.random() < POWERUP_SPAWN_CHANCE) {
                const types = Object.values(PowerUpType);
                const randomType = types[Math.floor(Math.random() * types.length)];
                this.powerUp = new PowerUp(this.snake, randomType);
            }
        }
        
        // Check if snake collected power-up
        if (this.powerUp) {
            if (head.x === this.powerUp.x && head.y === this.powerUp.y) {
                // Activate power-up
                this.activePowerUps.push({
                    type: this.powerUp.type,
                    expireTime: Date.now() + this.powerUp.type.duration
                });
                
                // Apply immediate effects
                if (this.powerUp.type.effect === 'moveSpeed') {
                    this.moveSpeedMultiplier = 1.8;
                }
                
                // Visual and audio feedback
                screenShake.shake(5, 8);
                playPowerUpSound();
                createParticles(
                    this.powerUp.x * GRID_SIZE + GRID_SIZE / 2,
                    this.powerUp.y * GRID_SIZE + GRID_SIZE / 2,
                    this.powerUp.type.color,
                    15
                );
                
                this.powerUp = null; // Remove collected power-up
            }
        }
    }
    
    render(ctx) {
        // Save context for screen shake
        ctx.save();
        
        // Apply screen shake offset
        screenShake.apply(ctx);
        
        // Clear canvas with dark background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw starfield with nebulae
        this.starfield.render(ctx, this.activePowerUps);
        
        // Draw subtle grid lines
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
        ctx.restore();
        
        // Draw food
        this.food.render(ctx);
        
        // Draw power-up if present
        if (this.powerUp) {
            this.powerUp.render(ctx);
        }
        
        // Draw snake (with power-up effects)
        this.renderSnakeWithEffects(ctx);
        
        // Draw trails on top of snake
        this.renderTrails(ctx);
        
        // Draw particles
        particles.forEach(particle => particle.render(ctx));
        
        // Draw combo text
        this.comboText.forEach(text => {
            ctx.save();
            ctx.globalAlpha = text.life;
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            
            // Color based on multiplier
            let color = '#ffffff';
            if (text.multiplier >= 5) color = '#ff00ff';
            else if (text.multiplier >= 3) color = '#ffaa00';
            else if (text.multiplier >= 2) color = '#00ffff';
            
            ctx.fillStyle = color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillText(text.text, text.x, text.y);
            ctx.restore();
        });
        
        // Draw milestone text
        if (this.milestoneText) {
            ctx.save();
            ctx.globalAlpha = Math.min(this.milestoneText.life, 1.0);
            
            const scale = this.milestoneText.life > 1.5 ? 1 + (2 - this.milestoneText.life) * 2 : 1;
            ctx.translate(CANVAS_WIDTH / 2, this.milestoneText.y);
            ctx.scale(scale, scale);
            
            // Main text
            ctx.font = 'bold 64px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffaa00';
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#ffaa00';
            ctx.fillText(this.milestoneText.text, 0, 0);
            
            // Subtext
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.fillText(this.milestoneText.subtext, 0, 50);
            
            ctx.restore();
        }
        
        // Draw UI text based on state
        if (currentState === GameState.MENU) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (currentState === GameState.GAME_OVER) {
            console.log('Rendering GAME_OVER screen');
            
            // Dark overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // GAME OVER text with glow
            ctx.save();
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0000';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            
            // Score text
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
            
            // Restart instruction
            ctx.font = '18px Arial';
            ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
            ctx.restore();
        }
        
        ctx.textAlign = 'left'; // Reset
        
        // Restore context (screen shake)
        ctx.restore();
    }
    
    renderTrails(ctx) {
        // Determine trail color based on active power-ups
        let trailColor = '#00ff88';
        let trailGlow = '#00ff88';
        
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        const hasSpeed = this.activePowerUps.some(pu => pu.type.effect === 'moveSpeed');
        const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
        
        if (hasGhost) {
            trailColor = '#00ffff';
            trailGlow = '#00ffff';
        } else if (hasInvincible) {
            trailColor = '#ffaa00';
            trailGlow = '#ffaa00';
        } else if (hasSpeed) {
            trailColor = '#00aaff';
            trailGlow = '#00aaff';
        } else if (hasDoublePoints) {
            trailColor = '#aa00ff';
            trailGlow = '#aa00ff';
        }
        
        // Draw trails from oldest to newest
        this.trails.forEach(trail => {
            ctx.save();
            ctx.globalAlpha = trail.life * 0.7;
            ctx.shadowBlur = 25 * trail.life;
            ctx.shadowColor = trailGlow;
            
            const gradient = ctx.createRadialGradient(
                trail.x, trail.y, 0,
                trail.x, trail.y, trail.size / 2
            );
            gradient.addColorStop(0, trailColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                trail.x - trail.size / 2,
                trail.y - trail.size / 2,
                trail.size,
                trail.size
            );
            ctx.restore();
        });
    }
    
    renderSnakeWithEffects(ctx) {
        // Check active power-ups
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        const hasSpeed = this.activePowerUps.some(pu => pu.type.effect === 'moveSpeed');
        const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
        
        if (hasGhost) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            this.snake.render(ctx);
            ctx.restore();
        } else if (hasInvincible) {
            // Flashing golden effect
            const flash = Math.sin(Date.now() * 0.01) > 0;
            if (flash) {
                ctx.save();
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#ffaa00';
                this.snake.render(ctx);
                ctx.restore();
            } else {
                this.snake.render(ctx);
            }
        } else if (hasSpeed) {
            // Blue speed trail
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00aaff';
            this.snake.render(ctx);
            ctx.restore();
        } else if (hasDoublePoints) {
            // Purple glow
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#aa00ff';
            this.snake.render(ctx);
            ctx.restore();
        } else {
            this.snake.render(ctx);
        }
    }
    
    reset() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.powerUp = null;
        this.activePowerUps = [];
        this.moveSpeedMultiplier = 1.0;
        this.score = 0;
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.lastFoodTime = 0;
        this.comboText = [];
        this.trails = [];
        this.achievedMilestones = [];
        this.milestoneText = null;
        this.starfield = new Starfield();
        updateScoreDisplay();
    }
}

// ============================================
// INPUT HANDLING
// ============================================

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Handle arrow keys
    if (currentState === GameState.PLAYING) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            game.snake.setDirection(Direction.UP);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            game.snake.setDirection(Direction.DOWN);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            game.snake.setDirection(Direction.LEFT);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            game.snake.setDirection(Direction.RIGHT);
        }
    }
    
    // Handle spacebar for state changes
    if (e.key === ' ') {
        e.preventDefault();
        
        // Initialize audio on first interaction
        audio.init();
        
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
            playGameStart();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
            playGameStart();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ============================================
// UI UPDATES
// ============================================

function updateScoreDisplay() {
    document.getElementById('score').textContent = game.score;
}

// ============================================
// GAME LOOP
// ============================================

const game = new Game();
updateScoreDisplay();

function gameLoop() {
    game.update();
    game.render(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();

console.log('Snake game initialized');
console.log(`Grid: ${GRID_WIDTH}x${GRID_HEIGHT} cells`);
console.log(`Cell size: ${GRID_SIZE}px`);
