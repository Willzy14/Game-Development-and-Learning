// ============================================
// INCA TEMPLE BREAKOUT - Main Game
// ============================================
// Stone blocks themed as Inca temple stones

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// ============================================
// GAME CONSTANTS
// ============================================

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_SPEED = 8;
const PADDLE_Y = H - 50;

const BALL_RADIUS = 8;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_MAX = 10;
const BALL_SPEED_INCREASE = 0.15;

// Inca brick layout - pyramid style
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 68;
const BRICK_HEIGHT = 22;
const BRICK_PADDING = 6;
const BRICK_OFFSET_TOP = H * 0.55; // Lower on screen to show background
const BRICK_OFFSET_LEFT = (W - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING))) / 2;

const INITIAL_LIVES = 3;

// Inca stone colors - earthy tones
const INCA_BRICK_COLORS = [
    { base: '#8B7355', highlight: '#A89070', shadow: '#5C4A3A' },  // Brown stone
    { base: '#9C8A6E', highlight: '#B8A888', shadow: '#6E5C48' },  // Tan stone
    { base: '#7A6B5A', highlight: '#9A8B7A', shadow: '#4A3B2A' },  // Dark stone
    { base: '#A08060', highlight: '#C0A080', shadow: '#705030' },  // Golden stone
    { base: '#8A7A6A', highlight: '#AA9A8A', shadow: '#5A4A3A' },  // Grey stone
    { base: '#B8860B', highlight: '#DAA520', shadow: '#8B6508' },  // Gold (sacred)
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
let score = 0;
let lives = INITIAL_LIVES;
let paddle, ball, bricks;
let backgroundImage = null;

// ============================================
// CLASSES
// ============================================

class Paddle {
    constructor() {
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.x = W / 2 - this.width / 2;
        this.y = PADDLE_Y;
        this.dx = 0;
    }
    
    moveLeft() { this.dx = -PADDLE_SPEED; }
    moveRight() { this.dx = PADDLE_SPEED; }
    stop() { this.dx = 0; }
    
    update() {
        this.x += this.dx;
        this.x = Math.max(0, Math.min(W - this.width, this.x));
    }
    
    render(ctx) {
        // Wooden paddle (like Inca wood)
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        grad.addColorStop(0, '#8B4513');
        grad.addColorStop(0.3, '#A0522D');
        grad.addColorStop(0.7, '#8B4513');
        grad.addColorStop(1, '#654321');
        
        ctx.fillStyle = grad;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Gold trim
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Center gold emblem
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    getCenter() { return this.x + this.width / 2; }
}

class Ball {
    constructor() {
        this.radius = BALL_RADIUS;
        this.reset();
    }
    
    reset() {
        this.x = W / 2;
        this.y = PADDLE_Y - 30;
        this.speed = BALL_SPEED_INITIAL;
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.abs(Math.cos(angle)) * this.speed;
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    render(ctx) {
        // Golden ball (like Inca gold)
        const grad = ctx.createRadialGradient(
            this.x - 2, this.y - 2, 0,
            this.x, this.y, this.radius
        );
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#DAA520');
        grad.addColorStop(1, '#B8860B');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2.5);
        glow.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    reverseX() { this.dx = -this.dx; }
    reverseY() { this.dy = -this.dy; }
    
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
    }
}

class IncaBrick {
    constructor(x, y, row, col) {
        this.x = x;
        this.y = y;
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
        this.row = row;
        this.col = col;
        this.destroyed = false;
        
        // Color based on row (top rows are gold/sacred)
        const colorIndex = row === 0 ? 5 : (row + col) % 5;
        this.colors = INCA_BRICK_COLORS[colorIndex];
        this.points = (BRICK_ROWS - row) * 15; // Top rows worth more
        
        // Add slight random variation for natural stone look
        this.stoneVariation = Math.random() * 0.1;
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        // Inca trapezoidal stone block (signature shape)
        const inset = 2;
        
        // Main stone body
        ctx.fillStyle = this.colors.base;
        ctx.beginPath();
        ctx.moveTo(this.x + inset, this.y + this.height);
        ctx.lineTo(this.x, this.y + inset);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width - inset, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Highlight (top edge - lit)
        ctx.fillStyle = this.colors.highlight;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + inset);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width - 3, this.y + 5);
        ctx.lineTo(this.x + 3, this.y + 5 + inset);
        ctx.closePath();
        ctx.fill();
        
        // Shadow (bottom edge)
        ctx.fillStyle = this.colors.shadow;
        ctx.beginPath();
        ctx.moveTo(this.x + inset, this.y + this.height);
        ctx.lineTo(this.x + this.width - inset, this.y + this.height);
        ctx.lineTo(this.x + this.width - inset - 3, this.y + this.height - 4);
        ctx.lineTo(this.x + inset + 3, this.y + this.height - 4);
        ctx.closePath();
        ctx.fill();
        
        // Stone texture lines
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + this.stoneVariation})`;
        ctx.lineWidth = 1;
        
        // Horizontal crack
        const crackY = this.y + this.height * (0.4 + this.stoneVariation * 2);
        ctx.beginPath();
        ctx.moveTo(this.x + 5, crackY);
        ctx.lineTo(this.x + this.width - 5, crackY + (this.stoneVariation - 0.05) * 6);
        ctx.stroke();
        
        // Gold row special decoration
        if (this.row === 0) {
            // Sun symbol
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Rays
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1.5;
            for (let r = 0; r < 8; r++) {
                const angle = (r / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6);
                ctx.lineTo(cx + Math.cos(angle) * 9, cy + Math.sin(angle) * 9);
                ctx.stroke();
            }
        }
    }
}

// ============================================
// GAME SETUP
// ============================================

function createBricks() {
    bricks = [];
    
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
            const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
            bricks.push(new IncaBrick(x, y, row, col));
        }
    }
}

function initGame() {
    paddle = new Paddle();
    ball = new Ball();
    createBricks();
    score = 0;
    lives = INITIAL_LIVES;
    
    // Cache background
    backgroundImage = getIncaBackground(W, H);
}

// ============================================
// COLLISION DETECTION
// ============================================

function checkBallWallCollision() {
    // Left/Right walls
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= W) {
        ball.reverseX();
        incaAudio.playWallBounce();
    }
    
    // Top wall
    if (ball.y - ball.radius <= 0) {
        ball.reverseY();
        incaAudio.playWallBounce();
    }
    
    // Bottom - lose life
    if (ball.y + ball.radius >= H) {
        lives--;
        incaAudio.playLoseLife();
        
        if (lives <= 0) {
            currentState = GameState.GAME_OVER;
            incaAudio.playGameOver();
        } else {
            currentState = GameState.BALL_LOST;
        }
    }
}

function checkBallPaddleCollision() {
    if (ball.dy > 0 && // Moving down
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width) {
        
        ball.hitPaddle(paddle);
        incaAudio.playPaddleHit();
    }
}

function checkBallBrickCollision() {
    for (const brick of bricks) {
        if (brick.destroyed) continue;
        
        if (ball.x + ball.radius >= brick.x &&
            ball.x - ball.radius <= brick.x + brick.width &&
            ball.y + ball.radius >= brick.y &&
            ball.y - ball.radius <= brick.y + brick.height) {
            
            brick.destroyed = true;
            score += brick.points;
            incaAudio.playBrickBreak(brick.row);
            
            // Determine bounce direction
            const overlapLeft = (ball.x + ball.radius) - brick.x;
            const overlapRight = (brick.x + brick.width) - (ball.x - ball.radius);
            const overlapTop = (ball.y + ball.radius) - brick.y;
            const overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);
            
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
            
            if (minOverlapX < minOverlapY) {
                ball.reverseX();
            } else {
                ball.reverseY();
            }
            
            ball.increaseSpeed();
            break;
        }
    }
    
    // Check level complete
    if (bricks.every(b => b.destroyed)) {
        currentState = GameState.LEVEL_COMPLETE;
        incaAudio.playLevelComplete();
    }
}

// ============================================
// RENDERING
// ============================================

function render() {
    // Draw cached background
    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0);
    }
    
    // Draw game elements
    bricks.forEach(brick => brick.render(ctx));
    paddle.render(ctx);
    ball.render(ctx);
    
    // UI
    renderUI();
    
    // State overlays
    if (currentState === GameState.MENU) {
        renderMenuOverlay();
    } else if (currentState === GameState.BALL_LOST) {
        renderBallLostOverlay();
    } else if (currentState === GameState.LEVEL_COMPLETE) {
        renderLevelCompleteOverlay();
    } else if (currentState === GameState.GAME_OVER) {
        renderGameOverOverlay();
    }
}

function renderUI() {
    // Score
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    
    // Lives (as golden suns)
    ctx.textAlign = 'right';
    ctx.fillText('LIVES: ', W - 80, 30);
    for (let i = 0; i < lives; i++) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(W - 70 + i * 25, 25, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderMenuOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ INCA TEMPLE 🏛️', W / 2, H / 2 - 60);
    
    ctx.font = '24px "Segoe UI"';
    ctx.fillStyle = '#DAA520';
    ctx.fillText('Break the Sacred Stones', W / 2, H / 2 - 10);
    
    ctx.font = '20px "Segoe UI"';
    ctx.fillStyle = '#CD853F';
    ctx.fillText('Press SPACE to Begin', W / 2, H / 2 + 40);
    
    ctx.font = '16px "Segoe UI"';
    ctx.fillText('← → to Move | M to Toggle Sound', W / 2, H / 2 + 80);
}

function renderBallLostOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(`${lives} ${lives === 1 ? 'Life' : 'Lives'} Remaining`, W / 2, H / 2);
    
    ctx.font = '20px "Segoe UI"';
    ctx.fillStyle = '#DAA520';
    ctx.fillText('Press SPACE to Continue', W / 2, H / 2 + 40);
}

function renderLevelCompleteOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('🌟 TEMPLE CLEARED! 🌟', W / 2, H / 2 - 40);
    
    ctx.font = '28px "Segoe UI"';
    ctx.fillStyle = '#DAA520';
    ctx.fillText(`Final Score: ${score}`, W / 2, H / 2 + 20);
    
    ctx.font = '20px "Segoe UI"';
    ctx.fillStyle = '#CD853F';
    ctx.fillText('Press SPACE to Play Again', W / 2, H / 2 + 70);
}

function renderGameOverOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
    
    ctx.font = '28px "Segoe UI"';
    ctx.fillStyle = '#DAA520';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 20);
    
    ctx.font = '20px "Segoe UI"';
    ctx.fillStyle = '#CD853F';
    ctx.fillText('Press SPACE to Try Again', W / 2, H / 2 + 70);
}

// ============================================
// GAME LOOP
// ============================================

function update() {
    if (currentState === GameState.PLAYING) {
        paddle.update();
        ball.update();
        checkBallWallCollision();
        checkBallPaddleCollision();
        checkBallBrickCollision();
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ============================================
// INPUT HANDLING
// ============================================

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
        handleSpacePress();
    }
    
    if (e.code === 'KeyM') {
        const enabled = incaAudio.toggle();
        document.getElementById('soundToggle').textContent = 
            enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    }
    
    if (e.code === 'ArrowLeft') paddle.moveLeft();
    if (e.code === 'ArrowRight') paddle.moveRight();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    if (e.code === 'ArrowLeft' && !keys['ArrowRight']) paddle.stop();
    if (e.code === 'ArrowRight' && !keys['ArrowLeft']) paddle.stop();
    if (e.code === 'ArrowLeft' && keys['ArrowRight']) paddle.moveRight();
    if (e.code === 'ArrowRight' && keys['ArrowLeft']) paddle.moveLeft();
});

function handleSpacePress() {
    incaAudio.init();
    
    switch (currentState) {
        case GameState.MENU:
            currentState = GameState.PLAYING;
            incaAudio.playGameStart();
            break;
            
        case GameState.BALL_LOST:
            ball.reset();
            currentState = GameState.PLAYING;
            break;
            
        case GameState.LEVEL_COMPLETE:
        case GameState.GAME_OVER:
            initGame();
            currentState = GameState.PLAYING;
            incaAudio.playGameStart();
            break;
    }
}

// Sound toggle button
document.getElementById('soundToggle').addEventListener('click', () => {
    incaAudio.init();
    const enabled = incaAudio.toggle();
    document.getElementById('soundToggle').textContent = 
        enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
});

// ============================================
// START
// ============================================

initGame();
gameLoop();
