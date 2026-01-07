// ============================================
// GAME.JS - MECHANICS ONLY (LOCKED)
// ============================================
// This file contains ONLY game mechanics:
//    - Physics and movement
//    - Collision detection
//    - Scoring and lives
//    - Game state machine
//    - Input handling
//
// ❌ NO colors, gradients, or visual styles
// ❌ NO ctx.fillStyle, ctx.strokeStyle, ctx.fill()
// ❌ NO sound/audio code
//
// VERIFICATION: grep -E "fillStyle|strokeStyle|fillRect|arc|fill\(\)" game.js
// Should return ZERO matches
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// ============================================
// GAME CONSTANTS (LOCKED - DO NOT CHANGE FOR THEMES)
// ============================================

// Paddle constants
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_SPEED = 7;
const PADDLE_Y = CANVAS_HEIGHT - 40;

// Ball constants
const BALL_RADIUS = 8;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_MAX = 12;
const BALL_SPEED_INCREASE = 0.2;

// Brick constants
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

// Game constants
const INITIAL_LIVES = 3;
const POINTS_PER_BRICK = 10;

// ============================================
// GAME STATE MACHINE
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    BALL_LOST: 'ball_lost',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

// ============================================
// GAME CLASSES
// ============================================

class Paddle {
    constructor() {
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = PADDLE_Y;
        this.speed = PADDLE_SPEED;
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
        
        // Keep paddle within bounds
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.width;
        }
    }
    
    // Return state for THEME to render
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getCenter() {
        return this.x + this.width / 2;
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
        
        // Random angle between -60 and 60 degrees (upward)
        const angle = (Math.random() * (Math.PI / 3)) - (Math.PI / 6);
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.abs(Math.cos(angle)) * this.speed; // Always start upward
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    // Return state for THEME to render
    getState() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            dx: this.dx,
            dy: this.dy,
            speed: this.speed
        };
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
            // Maintain direction, just increase magnitude
            const angle = Math.atan2(this.dy, this.dx);
            this.dx = Math.cos(angle) * this.speed;
            this.dy = Math.sin(angle) * this.speed;
        }
    }
    
    hitPaddle(paddle) {
        // Calculate hit position relative to paddle center (-1 to 1)
        const hitPos = (this.x - paddle.getCenter()) / (paddle.width / 2);
        
        // Convert to angle (-60 to 60 degrees)
        const angle = hitPos * (Math.PI / 3);
        
        // Set new velocity
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.abs(Math.cos(angle)) * this.speed; // Always bounce up
        
        this.increaseSpeed();
    }
}

class Brick {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
        this.row = row;
        this.destroyed = false;
        this.points = POINTS_PER_BRICK * (row + 1); // Higher rows worth more
    }
    
    // Return state for THEME to render
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            row: this.row,
            destroyed: this.destroyed,
            points: this.points
        };
    }
    
    checkCollision(ball) {
        if (this.destroyed) return false;
        
        // AABB collision detection
        return ball.x + ball.radius > this.x &&
               ball.x - ball.radius < this.x + this.width &&
               ball.y + ball.radius > this.y &&
               ball.y - ball.radius < this.y + this.height;
    }
    
    destroy() {
        this.destroyed = true;
    }
}

// ============================================
// GAME MANAGER
// ============================================

class Game {
    constructor() {
        this.paddle = new Paddle();
        this.ball = new Ball();
        this.bricks = [];
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.level = 1;
        
        this.initBricks();
    }
    
    initBricks() {
        this.bricks = [];
        for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
                const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
                const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
                this.bricks.push(new Brick(x, y, row));
            }
        }
    }
    
    // Return state for THEME to render
    getState() {
        return {
            paddle: this.paddle,
            ball: this.ball,
            bricks: this.bricks,
            score: this.score,
            lives: this.lives,
            level: this.level
        };
    }
    
    update() {
        if (currentState !== GameState.PLAYING) return;
        
        this.paddle.update();
        this.ball.update();
        
        this.checkCollisions();
        this.checkBallOut();
        this.checkLevelComplete();
    }
    
    checkCollisions() {
        // Wall collisions
        if (this.ball.x - this.ball.radius <= 0 || 
            this.ball.x + this.ball.radius >= CANVAS_WIDTH) {
            this.ball.reverseX();
            AUDIO.playWallHit();
        }
        
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.reverseY();
            AUDIO.playWallHit();
        }
        
        // Paddle collision
        if (this.ball.dy > 0 && // Ball moving down
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width) {
            
            this.ball.hitPaddle(this.paddle);
            AUDIO.playPaddleHit();
        }
        
        // Brick collisions
        for (let brick of this.bricks) {
            if (brick.checkCollision(this.ball)) {
                brick.destroy();
                this.score += brick.points;
                this.ball.reverseY();
                AUDIO.playBrickBreak();
                updateScoreDisplay();
                break; // Only one brick per frame
            }
        }
    }
    
    checkBallOut() {
        if (this.ball.y - this.ball.radius > CANVAS_HEIGHT) {
            this.lives--;
            updateLivesDisplay();
            
            if (this.lives > 0) {
                currentState = GameState.BALL_LOST;
                AUDIO.playLoseLife();
                setTimeout(() => {
                    this.ball.reset();
                    currentState = GameState.PLAYING;
                }, 1500);
            } else {
                currentState = GameState.GAME_OVER;
                AUDIO.playGameOver();
            }
        }
    }
    
    checkLevelComplete() {
        const allDestroyed = this.bricks.every(brick => brick.destroyed);
        if (allDestroyed) {
            currentState = GameState.LEVEL_COMPLETE;
            this.level++;
            updateLevelDisplay();
            AUDIO.playLevelComplete();
            
            setTimeout(() => {
                this.initBricks();
                this.ball.reset();
                currentState = GameState.PLAYING;
            }, 2000);
        }
    }
    
    render() {
        // Delegate ALL rendering to THEME
        THEME.render(this.getState(), currentState, GameState);
    }
    
    reset() {
        this.paddle = new Paddle();
        this.ball = new Ball();
        this.bricks = [];
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.level = 1;
        this.initBricks();
        updateScoreDisplay();
        updateLivesDisplay();
        updateLevelDisplay();
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
    AUDIO.init();
    
    // Paddle movement
    if (keys['arrowleft'] || keys['a']) {
        game.paddle.moveLeft();
    }
    if (keys['arrowright'] || keys['d']) {
        game.paddle.moveRight();
    }
    
    // Start/restart game
    if (e.key === ' ') {
        e.preventDefault();
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            AUDIO.playGameStart();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            AUDIO.playGameStart();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    
    // Stop paddle if no movement keys pressed
    if (!keys['arrowleft'] && !keys['a'] && !keys['arrowright'] && !keys['d']) {
        game.paddle.stop();
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

function updateLevelDisplay() {
    document.getElementById('level').textContent = game.level;
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
    game.update();
    game.render();
    requestAnimationFrame(gameLoop);
}

// ============================================
// INITIALIZATION
// ============================================
function initGame() {
    // Initialize THEME
    THEME.init(canvas, ctx);
    
    console.log('Breakout initialized!');
    console.log('Press SPACE to start');
    gameLoop();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
