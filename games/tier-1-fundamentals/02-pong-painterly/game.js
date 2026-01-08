// Painterly Pong - Decision-Graph Navigation Test
// RESKIN of 001-pong (game logic preserved, only rendering modified)

// ============================================================================
// CONSTANTS (From PLANNING.md Color Scheme)
// ============================================================================

const COLOR_SCHEME = {
    ball: { h: 30, s: 80, l: 60 },       // Warm orange
    paddles: { h: 210, s: 70, l: 50 },   // Cool blue
    background: { h: 40, s: 20, l: 85 }, // Muted warm beige
    field: { h: 50, s: 30, l: 75 }       // Slightly warmer field
};

// ============================================
// GAME CONSTANTS (From 001-pong)
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const BALL_SPEED_INITIAL = 5;
const WINNING_SCORE = 5;

// ============================================
// GAME STATE (From 001-pong)
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

// ============================================
// GAME OBJECTS (From 001-pong)
// ============================================

// Player Paddle (Left)
const playerPaddle = {
    x: 20,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED
};

// AI Paddle (Right)
const aiPaddle = {
    x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED * 0.7 // AI is slightly slower for fairness
};

// Ball
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED_INITIAL,
    dy: BALL_SPEED_INITIAL,
    speed: BALL_SPEED_INITIAL
};

// Score
const score = {
    player: 0,
    ai: 0
};

// ============================================
// INPUT HANDLING (From 001-pong)
// ============================================
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Initialize audio on first interaction (browser requirement)
    audio.init();
    
    // Start game on space
    if (e.key === ' ') {
        e.preventDefault();
        if (currentState === GameState.MENU || currentState === GameState.GAME_OVER) {
            resetGame();
            currentState = GameState.PLAYING;
            playGameStart();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// ============================================
// GAME FUNCTIONS (From 001-pong - UNCHANGED)
// ============================================

function resetGame() {
    score.player = 0;
    score.ai = 0;
    resetBall();
    playerPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    aiPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
}

function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

function updatePlayerPaddle() {
    if (keys['w'] && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['s'] && playerPaddle.y < CANVAS_HEIGHT - playerPaddle.height) {
        playerPaddle.y += playerPaddle.speed;
    }
}

function updateAIPaddle() {
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
    const ballCenter = ball.y;
    const tolerance = 30;
    
    if (ballCenter < paddleCenter - tolerance && aiPaddle.y > 0) {
        aiPaddle.y -= aiPaddle.speed;
    } else if (ballCenter > paddleCenter + tolerance && aiPaddle.y < CANVAS_HEIGHT - aiPaddle.height) {
        aiPaddle.y += aiPaddle.speed;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= CANVAS_HEIGHT) {
        ball.dy = -ball.dy;
        playWallBounce();
    }
    
    // Player paddle collision
    if (ball.dx < 0) {
        if (ball.x - ball.size / 2 <= playerPaddle.x + playerPaddle.width &&
            ball.x + ball.size / 2 >= playerPaddle.x &&
            ball.y + ball.size / 2 >= playerPaddle.y &&
            ball.y - ball.size / 2 <= playerPaddle.y + playerPaddle.height) {
            
            const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
            const angle = hitPos * (Math.PI / 4);
            
            ball.dx = Math.abs(ball.dx);
            ball.dy = Math.sin(angle) * ball.speed;
            ball.speed *= 1.05;
            ball.dx = Math.cos(angle) * ball.speed;
            playPaddleHit();
        }
    }
    
    // AI paddle collision
    if (ball.dx > 0) {
        if (ball.x + ball.size / 2 >= aiPaddle.x &&
            ball.x - ball.size / 2 <= aiPaddle.x + aiPaddle.width &&
            ball.y + ball.size / 2 >= aiPaddle.y &&
            ball.y - ball.size / 2 <= aiPaddle.y + aiPaddle.height) {
            
            const hitPos = (ball.y - (aiPaddle.y + aiPaddle.height / 2)) / (aiPaddle.height / 2);
            const angle = hitPos * (Math.PI / 4);
            
            ball.dx = -Math.abs(ball.dx);
            ball.dy = Math.sin(angle) * ball.speed;
            ball.speed *= 1.05;
            ball.dx = -Math.cos(angle) * ball.speed;
            playPaddleHit();
        }
    }
    
    // Score points
    if (ball.x - ball.size / 2 <= 0) {
        score.ai++;
        playScore();
        checkWinCondition();
        ball.speed = BALL_SPEED_INITIAL;
        resetBall();
    } else if (ball.x + ball.size / 2 >= CANVAS_WIDTH) {
        score.player++;
        playScore();
        checkWinCondition();
        ball.speed = BALL_SPEED_INITIAL;
        resetBall();
    }
}

function checkWinCondition() {
    if (score.player >= WINNING_SCORE || score.ai >= WINNING_SCORE) {
        currentState = GameState.GAME_OVER;
        if (score.player >= WINNING_SCORE) {
            playWin();
        } else {
            playLose();
        }
    }
}

function update() {
    if (currentState === GameState.PLAYING) {
        updatePlayerPaddle();
        updateAIPaddle();
        updateBall();
    }
}

// ============================================================================
// RENDERING - PAINTERLY RESKIN (ONLY THIS SECTION MODIFIED)
// ============================================================================

// Pass 1: Background (From PLANNING.md - Atmospheric Impressionist)
function renderBackground() {
    const bg = COLOR_SCHEME.background;
    
    // Base fill
    ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Atmospheric variation (impressionist) - cached pattern
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 30; i++) {
        const x = (i * 37) % CANVAS_WIDTH;  // Pseudo-random but consistent
        const y = (i * 53) % CANVAS_HEIGHT;
        const size = 20 + ((i * 7) % 40);
        const hueVar = ((i * 13) % 20) - 10;
        
        ctx.fillStyle = `hsl(${bg.h + hueVar}, ${bg.s}%, ${bg.l + ((i * 11) % 20) - 10}%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Pass 2: Field Line (From PLANNING.md - Painterly, not straight)
function renderFieldLine() {
    const field = COLOR_SCHEME.field;
    
    ctx.strokeStyle = `hsla(${field.h}, ${field.s}%, ${field.l - 20}%, 0.3)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    
    // Wavy line (not straight) - NO perfect geometry
    for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
        const offset = Math.sin(y * 0.05) * 5;
        ctx.lineTo(CANVAS_WIDTH / 2 + offset, y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
}

// Pass 3: Paddles (From PLANNING.md - Impasto texture)
function renderPaddle(paddle, isPlayer) {
    const p = COLOR_SCHEME.paddles;
    
    // Base color
    ctx.fillStyle = `hsl(${p.h}, ${p.s}%, ${p.l}%)`;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Impasto strokes (vertical) - NO smooth gradients
    ctx.globalAlpha = 0.4;
    for (let py = paddle.y; py < paddle.y + paddle.height; py += 5) {
        const offsetX = ((py * 7) % 6) - 3;  // Consistent variation
        const lightnessVar = 50 + (((py * 11) % 40) - 20);
        ctx.strokeStyle = `hsl(${p.h}, ${p.s}%, ${lightnessVar}%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(paddle.x + offsetX, py);
        ctx.lineTo(paddle.x + paddle.width + offsetX, py);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// Pass 4: Ball (From PLANNING.md - Impressionist broken color)
function renderBall() {
    const b = COLOR_SCHEME.ball;
    
    // Impressionist "broken color" instead of solid fill
    const dabs = 20;
    for (let i = 0; i < dabs; i++) {
        const angle = (i / dabs) * Math.PI * 2;
        const offsetX = Math.cos(angle) * ball.size * 0.15;
        const offsetY = Math.sin(angle) * ball.size * 0.15;
        
        // Vary hue slightly (broken color)
        const hueVariation = ((i * 13) % 40) - 20;
        ctx.fillStyle = `hsl(${b.h + hueVariation}, ${b.s}%, ${b.l}%)`;
        
        ctx.beginPath();
        ctx.arc(ball.x + offsetX, ball.y + offsetY, ball.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Pass 5: Score (From PLANNING.md - Low contrast)
function renderScore() {
    ctx.font = '48px Georgia, serif';
    ctx.fillStyle = 'hsla(0, 0%, 30%, 0.5)';
    ctx.textAlign = 'center';
    
    ctx.fillText(score.player, CANVAS_WIDTH * 0.25, 60);
    ctx.fillText(score.ai, CANVAS_WIDTH * 0.75, 60);
}

// UI Messages
function renderMessage(text, y = CANVAS_HEIGHT / 2) {
    ctx.font = '32px Georgia, serif';
    ctx.fillStyle = 'hsla(30, 80%, 50%, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(text, CANVAS_WIDTH / 2, y);
}

// Main render function (orchestrates all passes)
function render() {
    // Pass 1: Background
    renderBackground();
    
    // Pass 2: Field
    renderFieldLine();
    
    // Pass 3: Paddles
    renderPaddle(playerPaddle, true);
    renderPaddle(aiPaddle, false);
    
    // Pass 4: Ball
    renderBall();
    
    // Pass 5: Score
    renderScore();
    
    // State-specific UI (from 001-pong)
    if (currentState === GameState.MENU) {
        renderMessage('PRESS SPACE TO START');
    } else if (currentState === GameState.GAME_OVER) {
        const winner = score.player >= WINNING_SCORE ? 'PLAYER' : 'AI';
        const color = score.player >= WINNING_SCORE ? 'hsla(210, 70%, 50%, 0.9)' : 'hsla(30, 80%, 50%, 0.9)';
        
        ctx.fillStyle = color;
        renderMessage(`${winner} WINS!`, CANVAS_HEIGHT / 2 - 30);
        ctx.fillStyle = 'hsla(0, 0%, 30%, 0.7)';
        renderMessage('PRESS SPACE TO RESTART', CANVAS_HEIGHT / 2 + 30);
    }
}

// ============================================
// GAME LOOP (From 001-pong - UNCHANGED)
// ============================================

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ============================================
// START GAME (From 001-pong - UNCHANGED)
// ============================================

console.log('Painterly Pong initialized!');
console.log('RESKIN of 001-pong (game logic preserved)');
console.log('Press SPACE to start');
gameLoop();