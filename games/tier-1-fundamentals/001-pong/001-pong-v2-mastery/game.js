// ============================================
// PONG V2 MASTERY EDITION - GAME ENGINE
// ============================================
// Advanced features:
// - Particle system for visual feedback
// - Screen shake on impacts
// - Ball trails
// - Gradient rendering for 3D appearance
// - Easing functions for smooth animations
// - Hit flash effects
// - Dynamic score animations

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// CONSTANTS
// ============================================
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 8;
const PADDLE_SPEED = 7;
const BALL_SPEED_INITIAL = 6;
const WINNING_SCORE = 5;
const MAX_BALL_SPEED = 15;

// Colors
const COLORS = {
    player: '#00ffff',
    playerGlow: 'rgba(0, 255, 255, 0.5)',
    ai: '#ff00ff',
    aiGlow: 'rgba(255, 0, 255, 0.5)',
    ball: '#ffffff',
    ballGlow: 'rgba(255, 255, 255, 0.5)',
    background: '#0a0a1a',
    gridLine: 'rgba(255, 255, 255, 0.03)',
    centerLine: 'rgba(255, 255, 255, 0.15)',
    text: '#ffffff',
    textShadow: 'rgba(0, 255, 255, 0.5)'
};

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
    easeOutBack: t => {
        const c = 1.70158;
        return 1 + (--t) * t * ((c + 1) * t + c);
    }
};

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
        this.size = options.size || 4;
        this.color = options.color || '#ffffff';
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 0.98;
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
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
            const particleOptions = { ...options };
            if (!options.vx) particleOptions.vx = (Math.random() - 0.5) * (options.speed || 8);
            if (!options.vy) particleOptions.vy = (Math.random() - 0.5) * (options.speed || 8);
            this.particles.push(new Particle(x, y, particleOptions));
        }
    }
    
    // Emit in a specific direction
    emitDirectional(x, y, angle, spread, count = 10, options = {}) {
        for (let i = 0; i < count; i++) {
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            const speed = (options.speed || 6) * (0.5 + Math.random() * 0.5);
            this.particles.push(new Particle(x, y, {
                ...options,
                vx: Math.cos(particleAngle) * speed,
                vy: Math.sin(particleAngle) * speed
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
    constructor(maxLength = 10) {
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
            const alpha = (1 - index / this.maxLength) * 0.3;
            const size = baseSize * (1 - index / this.maxLength);
            
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
// SCORE ANIMATION
// ============================================
class ScoreAnimation {
    constructor() {
        this.animations = [];
    }
    
    add(x, y, text, color) {
        this.animations.push({
            x, y,
            text,
            color,
            life: 1,
            scale: 0
        });
    }
    
    update(dt) {
        this.animations = this.animations.filter(anim => {
            anim.life -= dt * 0.8;
            anim.scale = Easing.easeOutBack(Math.min(1, (1 - anim.life) * 3));
            anim.y -= 30 * dt;
            return anim.life > 0;
        });
    }
    
    draw(ctx) {
        this.animations.forEach(anim => {
            ctx.save();
            ctx.globalAlpha = anim.life;
            ctx.fillStyle = anim.color;
            ctx.font = `bold ${24 * anim.scale}px 'Courier New'`;
            ctx.textAlign = 'center';
            ctx.fillText(anim.text, anim.x, anim.y);
            ctx.restore();
        });
    }
}

// ============================================
// GAME STATE
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;
let lastTime = 0;
let deltaTime = 0;
let rallyCount = 0;

// ============================================
// GAME OBJECTS
// ============================================

// Player Paddle
const playerPaddle = {
    x: 25,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED,
    flashTime: 0,
    targetY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
};

// AI Paddle
const aiPaddle = {
    x: CANVAS_WIDTH - 25 - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED * 0.75,
    flashTime: 0,
    reactionDelay: 0,
    targetY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
};

// Ball
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BALL_RADIUS,
    dx: 0,
    dy: 0,
    speed: BALL_SPEED_INITIAL,
    glowIntensity: 1
};

// Score
const score = {
    player: 0,
    ai: 0,
    playerScale: 1,
    aiScale: 1
};

// Systems
const particles = new ParticleSystem();
const screenShake = new ScreenShake();
const ballTrail = new Trail(12);
const scoreAnimations = new ScoreAnimation();

// ============================================
// INPUT HANDLING
// ============================================
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Initialize audio
    initAudio();
    
    if (e.key === ' ') {
        e.preventDefault();
        handleSpacePress();
    }
    
    if (e.key.toLowerCase() === 'm') {
        const isMuted = !toggleMute();
        console.log(isMuted ? '🔇 Audio muted' : '🔊 Audio enabled');
    }
    
    if (e.key.toLowerCase() === 'p' && currentState === GameState.PLAYING) {
        currentState = GameState.PAUSED;
    } else if (e.key.toLowerCase() === 'p' && currentState === GameState.PAUSED) {
        currentState = GameState.PLAYING;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function handleSpacePress() {
    if (currentState === GameState.MENU || currentState === GameState.GAME_OVER) {
        resetGame();
        currentState = GameState.PLAYING;
        playGameStart();
        startBackgroundMusic();
    }
}

// ============================================
// GAME FUNCTIONS
// ============================================

function resetGame() {
    score.player = 0;
    score.ai = 0;
    rallyCount = 0;
    resetBall();
    playerPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    aiPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    particles.clear();
    ballTrail.clear();
}

function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.speed = BALL_SPEED_INITIAL;
    ball.glowIntensity = 1;
    rallyCount = 0;
    ballTrail.clear();
    
    // Random direction
    const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30 to 30 degrees
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    // Delay ball launch slightly
    ball.dx = 0;
    ball.dy = 0;
    
    setTimeout(() => {
        if (currentState === GameState.PLAYING) {
            ball.dx = Math.cos(angle) * ball.speed * direction;
            ball.dy = Math.sin(angle) * ball.speed;
        }
    }, 500);
}

function updatePlayerPaddle(dt) {
    let targetDy = 0;
    
    if (keys['w'] || keys['arrowup']) targetDy = -playerPaddle.speed;
    if (keys['s'] || keys['arrowdown']) targetDy = playerPaddle.speed;
    
    // Smooth movement
    playerPaddle.dy += (targetDy - playerPaddle.dy) * 0.3;
    playerPaddle.y += playerPaddle.dy;
    
    // Clamp to bounds
    playerPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - playerPaddle.height, playerPaddle.y));
    
    // Update flash
    if (playerPaddle.flashTime > 0) {
        playerPaddle.flashTime -= dt;
    }
}

function updateAIPaddle(dt) {
    // Smarter AI with prediction and reaction delay
    aiPaddle.reactionDelay -= dt;
    
    if (aiPaddle.reactionDelay <= 0) {
        // Predict where ball will be
        let predictedY = ball.y;
        
        if (ball.dx > 0) { // Ball moving toward AI
            const timeToReach = (aiPaddle.x - ball.x) / ball.dx;
            predictedY = ball.y + ball.dy * timeToReach;
            
            // Account for bounces (simplified)
            while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
                if (predictedY < 0) predictedY = -predictedY;
                if (predictedY > CANVAS_HEIGHT) predictedY = 2 * CANVAS_HEIGHT - predictedY;
            }
        }
        
        aiPaddle.targetY = predictedY - aiPaddle.height / 2;
        aiPaddle.reactionDelay = 0.05 + Math.random() * 0.1; // Vary reaction time
    }
    
    // Move toward target with some imperfection
    const diff = aiPaddle.targetY - aiPaddle.y;
    const tolerance = 20;
    
    if (Math.abs(diff) > tolerance) {
        const direction = diff > 0 ? 1 : -1;
        aiPaddle.y += direction * aiPaddle.speed * (0.8 + Math.random() * 0.2);
    }
    
    // Clamp to bounds
    aiPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - aiPaddle.height, aiPaddle.y));
    
    // Update flash
    if (aiPaddle.flashTime > 0) {
        aiPaddle.flashTime -= dt;
    }
}

function updateBall(dt) {
    if (ball.dx === 0 && ball.dy === 0) return;
    
    // Store previous position for trail
    ballTrail.add(ball.x, ball.y);
    
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Update glow based on speed
    ball.glowIntensity = 0.5 + (ball.speed / MAX_BALL_SPEED) * 0.5;
    
    // Wall collisions (top/bottom)
    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy);
        handleWallBounce();
    } else if (ball.y + ball.radius >= CANVAS_HEIGHT) {
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.dy = -Math.abs(ball.dy);
        handleWallBounce();
    }
    
    // Paddle collisions
    checkPaddleCollision(playerPaddle, true);
    checkPaddleCollision(aiPaddle, false);
    
    // Scoring
    if (ball.x - ball.radius <= 0) {
        handleScore(false); // AI scores
    } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
        handleScore(true); // Player scores
    }
}

function checkPaddleCollision(paddle, isPlayer) {
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    
    // Check if ball is in collision zone
    const ballInXRange = ball.x + ball.radius >= paddleLeft && ball.x - ball.radius <= paddleRight;
    const ballInYRange = ball.y + ball.radius >= paddleTop && ball.y - ball.radius <= paddleBottom;
    
    // Additional check: ball moving toward paddle
    const movingToward = isPlayer ? ball.dx < 0 : ball.dx > 0;
    
    if (ballInXRange && ballInYRange && movingToward) {
        // Calculate hit position (-1 to 1)
        const paddleCenter = paddle.y + paddle.height / 2;
        const hitPosition = (ball.y - paddleCenter) / (paddle.height / 2);
        
        // Calculate reflection angle based on hit position
        const maxAngle = Math.PI / 3; // 60 degrees max
        const angle = hitPosition * maxAngle;
        
        // Increase speed
        ball.speed = Math.min(MAX_BALL_SPEED, ball.speed * 1.05);
        
        // Set new velocity
        const direction = isPlayer ? 1 : -1;
        ball.dx = Math.cos(angle) * ball.speed * direction;
        ball.dy = Math.sin(angle) * ball.speed;
        
        // Push ball out of paddle
        ball.x = isPlayer ? paddleRight + ball.radius : paddleLeft - ball.radius;
        
        // Visual feedback
        handlePaddleHit(paddle, hitPosition, isPlayer);
        
        // Increment rally and update music intensity
        rallyCount++;
        updateMusicIntensity(Math.min(rallyCount / 20, 1.0)); // Max intensity at 20 rallies
    }
}

function handlePaddleHit(paddle, hitPosition, isPlayer) {
    // Screen shake (stronger for edge hits)
    const shakeIntensity = 3 + Math.abs(hitPosition) * 5;
    screenShake.shake(shakeIntensity);
    
    // Flash paddle
    paddle.flashTime = 0.1;
    
    // Emit particles from hit point
    const hitY = ball.y;
    const hitX = isPlayer ? paddle.x + paddle.width : paddle.x;
    const particleColor = isPlayer ? COLORS.player : COLORS.ai;
    const particleAngle = isPlayer ? 0 : Math.PI;
    
    particles.emitDirectional(hitX, hitY, particleAngle, Math.PI / 2, 15, {
        color: particleColor,
        size: 3,
        life: 0.4,
        speed: 8 + ball.speed
    });
    
    // Play sound with positional data
    playPaddleHit(hitPosition, ball.x / CANVAS_WIDTH);
}

function handleWallBounce() {
    // Light screen shake
    screenShake.shake(2);
    
    // Particles at bounce point
    const bounceY = ball.y < CANVAS_HEIGHT / 2 ? ball.radius : CANVAS_HEIGHT - ball.radius;
    particles.emit(ball.x, bounceY, 8, {
        color: '#888888',
        size: 2,
        life: 0.3,
        speed: 5
    });
    
    // Sound with panning
    playWallBounce(ball.x / CANVAS_WIDTH);
}

function handleScore(isPlayerScore) {
    if (isPlayerScore) {
        score.player++;
        score.playerScale = 1.5;
        
        // Particles burst from right side
        particles.emit(CANVAS_WIDTH - 50, CANVAS_HEIGHT / 2, 30, {
            color: COLORS.player,
            size: 4,
            life: 0.6,
            speed: 12
        });
        
        // Add score animation
        scoreAnimations.add(CANVAS_WIDTH / 4, 100, '+1', COLORS.player);
        
        // Canvas glow effect
        canvas.classList.add('player-score');
        setTimeout(() => canvas.classList.remove('player-score'), 400);
    } else {
        score.ai++;
        score.aiScale = 1.5;
        
        // Particles burst from left side
        particles.emit(50, CANVAS_HEIGHT / 2, 30, {
            color: COLORS.ai,
            size: 4,
            life: 0.6,
            speed: 12
        });
        
        scoreAnimations.add((CANVAS_WIDTH / 4) * 3, 100, '+1', COLORS.ai);
        
        canvas.classList.add('ai-score');
        setTimeout(() => canvas.classList.remove('ai-score'), 400);
    }
    
    // Screen shake
    screenShake.shake(15);
    
    // Sound
    playScore(isPlayerScore, ball.x / CANVAS_WIDTH);
    
    // Check win
    if (score.player >= WINNING_SCORE || score.ai >= WINNING_SCORE) {
        currentState = GameState.GAME_OVER;
        stopBackgroundMusic();
        
        if (score.player >= WINNING_SCORE) {
            playVictory();
            // Victory particles
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    particles.emit(
                        Math.random() * CANVAS_WIDTH,
                        Math.random() * CANVAS_HEIGHT,
                        20,
                        { color: COLORS.player, size: 5, life: 1, speed: 10 }
                    );
                }, i * 200);
            }
        } else {
            playDefeat();
        }
    } else {
        // Reset for next point
        ball.speed = BALL_SPEED_INITIAL;
        resetBall();
    }
}

function update(dt) {
    // Update screen shake
    screenShake.update();
    
    // Update particles
    particles.update(dt);
    
    // Update score animations
    scoreAnimations.update(dt);
    
    // Animate score scales back to normal
    score.playerScale += (1 - score.playerScale) * 0.1;
    score.aiScale += (1 - score.aiScale) * 0.1;
    
    if (currentState === GameState.PLAYING) {
        updatePlayerPaddle(dt);
        updateAIPaddle(dt);
        updateBall(dt);
    }
}

// ============================================
// RENDERING
// ============================================

function drawBackground() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0a0a25');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Subtle grid
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = gridSize; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    for (let y = gridSize; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

function drawCenterLine() {
    ctx.strokeStyle = COLORS.centerLine;
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPaddle(paddle, color, glowColor) {
    const isFlashing = paddle.flashTime > 0;
    
    ctx.save();
    
    // Glow effect
    if (isFlashing) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 30;
    } else {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
    }
    
    // Gradient fill for 3D effect
    const gradient = ctx.createLinearGradient(
        paddle.x, paddle.y,
        paddle.x + paddle.width, paddle.y
    );
    
    const baseColor = isFlashing ? '#ffffff' : color;
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.5, isFlashing ? '#ffffff' : lightenColor(color, 30));
    gradient.addColorStop(1, baseColor);
    
    ctx.fillStyle = gradient;
    
    // Rounded rectangle
    const radius = 4;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, radius);
    ctx.fill();
    
    ctx.restore();
}

function drawBall() {
    ctx.save();
    
    // Draw trail first
    ballTrail.draw(ctx, COLORS.ballGlow, ball.radius);
    
    // Glow effect
    ctx.shadowColor = COLORS.ballGlow;
    ctx.shadowBlur = 20 * ball.glowIntensity;
    
    // Gradient for 3D sphere effect
    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#dddddd');
    gradient.addColorStop(1, '#aaaaaa');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawScore() {
    ctx.save();
    
    // Player score
    ctx.fillStyle = COLORS.player;
    ctx.shadowColor = COLORS.playerGlow;
    ctx.shadowBlur = 10;
    ctx.font = `bold ${48 * score.playerScale}px 'Courier New'`;
    ctx.textAlign = 'center';
    ctx.fillText(score.player.toString(), CANVAS_WIDTH / 4, 70);
    
    // AI score
    ctx.fillStyle = COLORS.ai;
    ctx.shadowColor = COLORS.aiGlow;
    ctx.fillText(score.ai.toString(), (CANVAS_WIDTH / 4) * 3, 70);
    
    ctx.restore();
}

function drawUI() {
    if (currentState === GameState.MENU) {
        drawOverlay('PONG V2', 'PRESS SPACE TO START', '#ffffff');
        drawSubtext('W/S to move | First to 5 wins');
    } else if (currentState === GameState.PAUSED) {
        drawOverlay('PAUSED', 'PRESS P TO RESUME', '#ffffff');
    } else if (currentState === GameState.GAME_OVER) {
        const isPlayerWin = score.player >= WINNING_SCORE;
        const text = isPlayerWin ? 'YOU WIN!' : 'AI WINS';
        const color = isPlayerWin ? COLORS.player : COLORS.ai;
        drawOverlay(text, 'PRESS SPACE TO RESTART', color);
    }
    
    // Rally counter (during play)
    if (currentState === GameState.PLAYING && rallyCount >= 5) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`Rally: ${rallyCount}`, CANVAS_WIDTH / 2, 30);
        ctx.restore();
    }
}

function drawOverlay(title, subtitle, color) {
    // Semi-transparent overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Title
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.font = 'bold 48px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    
    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888888';
    ctx.font = '20px "Courier New"';
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    
    ctx.restore();
}

function drawSubtext(text) {
    ctx.save();
    ctx.fillStyle = '#555555';
    ctx.font = '14px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.restore();
}

function render() {
    ctx.save();
    
    // Apply screen shake
    screenShake.apply(ctx);
    
    // Draw layers
    drawBackground();
    drawCenterLine();
    
    // Draw paddles
    drawPaddle(playerPaddle, COLORS.player, COLORS.playerGlow);
    drawPaddle(aiPaddle, COLORS.ai, COLORS.aiGlow);
    
    // Draw ball
    drawBall();
    
    // Draw particles (additive)
    particles.draw(ctx);
    
    // Draw score
    drawScore();
    
    // Draw score animations
    scoreAnimations.draw(ctx);
    
    ctx.restore();
    
    // Draw UI (not affected by shake)
    drawUI();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop(timestamp) {
    // Calculate delta time
    deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1); // Cap at 100ms
    lastTime = timestamp;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// INITIALIZE
// ============================================

console.log('🎮 Pong V2 Mastery Edition initialized!');
console.log('🎯 Press SPACE to start');
console.log('🎹 Press M to toggle mute');

// Start game loop
requestAnimationFrame(gameLoop);
