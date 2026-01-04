// ============================================
// GAME CONSTANTS
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

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

// Colors for different brick rows
const BRICK_COLORS = [
    '#ff0066',  // Pink
    '#ff6600',  // Orange
    '#ffcc00',  // Yellow
    '#00ff66',  // Green
    '#0066ff',  // Blue
    '#6600ff'   // Purple
];

// ============================================
// GAME STATE
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
// GAME CLASSES (Applying OOP from learnings)
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
    
    render(ctx) {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add highlight for 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height / 3);
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
    
    render(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
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
        this.color = BRICK_COLORS[row % BRICK_COLORS.length];
        this.destroyed = false;
        this.points = POINTS_PER_BRICK * (row + 1); // Higher rows worth more
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        // Main brick
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Highlight (3D effect)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height / 3);
        
        // Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
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
            playWallBounce();
        }
        
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.reverseY();
            playWallBounce();
        }
        
        // Paddle collision
        if (this.ball.dy > 0 && // Ball moving down
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width) {
            
            this.ball.hitPaddle(this.paddle);
            playPaddleHit();
        }
        
        // Brick collisions
        for (let brick of this.bricks) {
            if (brick.checkCollision(this.ball)) {
                brick.destroy();
                this.score += brick.points;
                this.ball.reverseY();
                playBrickBreak();
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
                playLoseLife();
                setTimeout(() => {
                    this.ball.reset();
                    currentState = GameState.PLAYING;
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
            playLevelComplete();
            
            setTimeout(() => {
                this.initBricks();
                this.ball.reset();
                currentState = GameState.PLAYING;
            }, 2000);
        }
    }
    
    render(ctx) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Render game objects
        for (let brick of this.bricks) {
            brick.render(ctx);
        }
        
        this.paddle.render(ctx);
        this.ball.render(ctx);
        
        // Render state-specific UI
        this.renderStateUI(ctx);
    }
    
    renderStateUI(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        
        if (currentState === GameState.MENU) {
            ctx.font = '32px "Courier New"';
            ctx.fillText('PRESS SPACE TO START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '18px "Courier New"';
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText('Break all the bricks!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (currentState === GameState.BALL_LOST) {
            ctx.fillStyle = '#ff6666';
            ctx.fillText('BALL LOST!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else if (currentState === GameState.LEVEL_COMPLETE) {
            ctx.fillStyle = '#66ff66';
            ctx.font = '32px "Courier New"';
            ctx.fillText(`LEVEL ${this.level - 1} COMPLETE!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else if (currentState === GameState.GAME_OVER) {
            ctx.fillStyle = '#ff6666';
            ctx.font = '48px "Courier New"';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
            ctx.font = '24px "Courier New"';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
            ctx.font = '18px "Courier New"';
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        }
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
    audio.init();
    
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
            playGameStart();
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            playGameStart();
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
    game.render(ctx);
    requestAnimationFrame(gameLoop);
}

// ============================================
// START GAME
// ============================================
console.log('Breakout initialized!');
console.log('Press SPACE to start');
gameLoop();
