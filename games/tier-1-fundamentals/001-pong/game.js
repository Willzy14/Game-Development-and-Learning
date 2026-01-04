// ============================================
// GAME CONSTANTS
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
// GAME STATE
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;

// ============================================
// GAME OBJECTS
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
// INPUT HANDLING
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
// GAME FUNCTIONS
// ============================================

function resetGame() {
    // Reset scores
    score.player = 0;
    score.ai = 0;
    
    // Reset positions
    resetBall();
    playerPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    aiPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
}

function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    
    // Random direction
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45 to 45 degrees
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

function updatePlayerPaddle() {
    // Move paddle based on input
    if (keys['w'] && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['s'] && playerPaddle.y < CANVAS_HEIGHT - playerPaddle.height) {
        playerPaddle.y += playerPaddle.speed;
    }
}

function updateAIPaddle() {
    // Simple AI: follow the ball
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
    const ballCenter = ball.y;
    
    // Add some tolerance to make AI less perfect
    const tolerance = 30;
    
    if (ballCenter < paddleCenter - tolerance && aiPaddle.y > 0) {
        aiPaddle.y -= aiPaddle.speed;
    } else if (ballCenter > paddleCenter + tolerance && aiPaddle.y < CANVAS_HEIGHT - aiPaddle.height) {
        aiPaddle.y += aiPaddle.speed;
    }
}

function updateBall() {
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= CANVAS_HEIGHT) {
        ball.dy = -ball.dy;
        playWallBounce();
    }
    
    // Paddle collision detection
    
    // Player paddle collision
    if (ball.dx < 0) { // Ball moving left
        if (ball.x - ball.size / 2 <= playerPaddle.x + playerPaddle.width &&
            ball.x + ball.size / 2 >= playerPaddle.x &&
            ball.y + ball.size / 2 >= playerPaddle.y &&
            ball.y - ball.size / 2 <= playerPaddle.y + playerPaddle.height) {
            
            // Calculate hit position for angle variation
            const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
            const angle = hitPos * (Math.PI / 4); // Max 45 degrees
            
            ball.dx = Math.abs(ball.dx); // Ensure ball goes right
            ball.dy = Math.sin(angle) * ball.speed;
            
            // Increase speed slightly on hit
            ball.speed *= 1.05;
            ball.dx = Math.cos(angle) * ball.speed;
            
            // Play paddle hit sound
            playPaddleHit();
        }
    }
    
    // AI paddle collision
    if (ball.dx > 0) { // Ball moving right
        if (ball.x + ball.size / 2 >= aiPaddle.x &&
            ball.x - ball.size / 2 <= aiPaddle.x + aiPaddle.width &&
            ball.y + ball.size / 2 >= aiPaddle.y &&
            ball.y - ball.size / 2 <= aiPaddle.y + aiPaddle.height) {
            
            // Calculate hit position for angle variation
            const hitPos = (ball.y - (aiPaddle.y + aiPaddle.height / 2)) / (aiPaddle.height / 2);
            const angle = hitPos * (Math.PI / 4);
            
            ball.dx = -Math.abs(ball.dx); // Ensure ball goes left
            ball.dy = Math.sin(angle) * ball.speed;
            
            // Increase speed slightly on hit
            ball.speed *= 1.05;
            ball.dx = -Math.cos(angle) * ball.speed;
            
            // Play paddle hit sound
            playPaddleHit();
        }
    }
    
    // Score points
    if (ball.x - ball.size / 2 <= 0) {
        // AI scores
        score.ai++;
        playScore();
        checkWinCondition();
        ball.speed = BALL_SPEED_INITIAL;
        resetBall();
    } else if (ball.x + ball.size / 2 >= CANVAS_WIDTH) {
        // Player scores
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
        
        // Play win or lose sound
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

// ============================================
// RENDERING
// ============================================

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(text, x, y, size, color, align = 'center') {
    ctx.fillStyle = color;
    ctx.font = `${size}px 'Courier New', monospace`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

function drawDashedLine() {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function render() {
    // Clear canvas
    drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');
    
    // Draw center line
    drawDashedLine();
    
    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ffff');
    drawRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height, '#ff00ff');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.size / 2, '#ffffff');
    
    // Draw scores
    drawText(score.player.toString(), CANVAS_WIDTH / 4, 60, 48, '#00ffff');
    drawText(score.ai.toString(), (CANVAS_WIDTH / 4) * 3, 60, 48, '#ff00ff');
    
    // Draw state-specific UI
    if (currentState === GameState.MENU) {
        drawText('PRESS SPACE TO START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 24, '#ffffff');
    } else if (currentState === GameState.GAME_OVER) {
        const winner = score.player >= WINNING_SCORE ? 'PLAYER' : 'AI';
        const color = score.player >= WINNING_SCORE ? '#00ffff' : '#ff00ff';
        
        drawText(`${winner} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, 48, color);
        drawText('PRESS SPACE TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, 20, '#ffffff');
    }
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ============================================
// START GAME
// ============================================

// Initialize and start game loop
console.log('Pong initialized!');
console.log('Press SPACE to start');
gameLoop();
