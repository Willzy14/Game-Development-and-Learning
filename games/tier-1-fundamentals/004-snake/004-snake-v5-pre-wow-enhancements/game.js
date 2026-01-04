// ============================================
// GAME CONSTANTS
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Grid constants
const GRID_SIZE = 20;  // Size of each cell in pixels
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;   // 20 cells wide
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE; // 20 cells tall

// Game constants
const MOVE_INTERVAL = 150; // Milliseconds between moves
const INITIAL_LENGTH = 3;

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
// STARFIELD BACKGROUND
// ============================================

class Starfield {
    constructor() {
        this.stars = [];
        // Create multiple layers for parallax effect
        this.layers = [
            { count: 50, speed: 0.2, size: 1, opacity: 0.3 },
            { count: 30, speed: 0.5, size: 2, opacity: 0.5 },
            { count: 20, speed: 0.8, size: 3, opacity: 0.7 }
        ];
        
        this.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    size: layer.size,
                    speed: layer.speed,
                    opacity: layer.opacity
                });
            }
        });
    }
    
    update() {
        // Slowly move stars down for subtle motion
        this.stars.forEach(star => {
            star.y += star.speed * 0.1;
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
        });
    }
    
    render(ctx) {
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
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
        // Draw food as glowing circle with gradient
        ctx.save();
        
        const centerX = this.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = this.y * GRID_SIZE + GRID_SIZE / 2;
        
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff3366';
        
        // Radial gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, GRID_SIZE / 2 - 2
        );
        gradient.addColorStop(0, '#ff6699');
        gradient.addColorStop(0.7, '#ff3366');
        gradient.addColorStop(1, '#cc0044');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            GRID_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
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
        this.score = 0;
        this.starfield = new Starfield();
    }
    
    update() {
        // Update starfield even in menu
        this.starfield.update();
        
        if (currentState !== GameState.PLAYING) return;
        
        // Check if enough time has passed for next move
        const currentTime = Date.now();
        if (currentTime - lastMoveTime < MOVE_INTERVAL) {
            return; // Not time to move yet
        }
        lastMoveTime = currentTime;
        
        // Update snake
        this.snake.update();
        
        // Check for self-collision (game over)
        if (this.snake.checkSelfCollision()) {
            currentState = GameState.GAME_OVER;
            playDeathSound();
            
            // Death particles
            const head = this.snake.segments[0];
            createParticles(
                head.x * GRID_SIZE + GRID_SIZE / 2,
                head.y * GRID_SIZE + GRID_SIZE / 2,
                '#00ff88',
                20
            );
            return;
        }
        
        // Check if snake ate food
        const head = this.snake.segments[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow();
            this.food.respawn(this.snake);
            this.score += 10;
            updateScoreDisplay();
            
            // Play eat sound
            playEatSound();
            
            // Spawn particles at food location
            createParticles(
                this.food.x * GRID_SIZE + GRID_SIZE / 2,
                this.food.y * GRID_SIZE + GRID_SIZE / 2,
                '#ff3366',
                8
            );
        }
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        // Clear canvas with dark background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw starfield
        this.starfield.render(ctx);
        
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
        
        // Draw snake
        this.snake.render(ctx);
        
        // Draw particles
        particles.forEach(particle => particle.render(ctx));
        
        // Draw UI text based on state
        if (currentState === GameState.MENU) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (currentState === GameState.GAME_OVER) {
            ctx.fillStyle = '#ff4444';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '18px Arial';
            ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        }
        
        ctx.textAlign = 'left'; // Reset
    }
    
    reset() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.score = 0;
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
