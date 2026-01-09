/**
 * TIME-SLICE RUNNER - GAME MECHANICS
 * 
 * An endless runner with time-manipulation mechanics.
 * Hold to slow time (drains chrono meter), perfect landings refill it.
 * 
 * ALL game logic lives here. NO visual code.
 * THEME.render(getGameState()) handles all rendering.
 * AUDIO.play*() handles all sound effects.
 */

// =============================================================================
// GAME SETTINGS
// =============================================================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

const SETTINGS = {
    // Player
    playerWidth: 30,
    playerHeight: 40,
    
    // Physics
    gravity: 0.4,
    jumpPower: -14,
    jumpHoldPower: -0.7,
    jumpHoldTime: 25,
    maxFallSpeed: 10,
    
    // Air control
    airMoveSpeed: 2,
    airAcceleration: 0.15,
    maxAirVelocity: 3,
    
    // Time-slice
    chronoMax: 100,
    chronoDrainRate: 0.4,
    chronoRefillAmount: 25,
    chronoRefillPerfect: 35,
    slowMotionSpeed: 0.3,
    
    // Scrolling (base values, modified by difficulty mode)
    baseScrollSpeed: 2.5,
    
    // Platforms
    basePlatformGap: 130,
    basePlatformWidth: 150,
    platformHeight: 15,
    platformYMin: 250,
    platformYMax: 420,
    
    // Perfect landing
    perfectMargin: 0.2, // 20% of platform width from center
    
    // Difficulty ramping
    difficultyIncreaseRate: 0.005, // Per meter traveled
    maxDifficultyMultiplier: 2.5,
};

// Difficulty mode presets
const DIFFICULTY_MODES = {
    easy: {
        name: 'Easy',
        scrollSpeedMultiplier: 0.5,
        platformWidthMultiplier: 1.8,
        gapMultiplier: 0.6,
        unlocked: true,
        unlockThreshold: 0,
        color: '#64ff64'
    },
    normal: {
        name: 'Normal',
        scrollSpeedMultiplier: 1.0,
        platformWidthMultiplier: 1.0,
        gapMultiplier: 1.0,
        unlocked: false,
        unlockThreshold: 500,
        color: '#64c8ff'
    },
    hard: {
        name: 'Hard',
        scrollSpeedMultiplier: 1.4,
        platformWidthMultiplier: 0.7,
        gapMultiplier: 1.3,
        unlocked: false,
        unlockThreshold: 1000,
        color: '#ff6464'
    }
};

// =============================================================================
// GAME STATE
// =============================================================================

let canvas, ctx;
let gameState = 'modeselect'; // 'modeselect', 'playing', 'paused', 'gameover'

let currentMode = 'easy';
let modeSettings = null;

let player = null;
let platforms = [];
let particles = [];

let scrollSpeed = 0;
let distance = 0; // Meters traveled
let score = 0;
let highScores = { easy: 0, normal: 0, hard: 0 };

let chronoMeter = SETTINGS.chronoMax;
let gameSpeed = 1.0;
let timeSliceActive = false;
let wasTimeSliceActive = false;

let difficultyMultiplier = 1.0;
let lastPlatformX = 0;

let keys = {};
let jumpHoldCounter = 0;
let coyoteCounter = 0;
const COYOTE_TIME = 6;

let lastMilestone = 0;

// Settings
let settings = {
    particlesEnabled: true,
    screenShakeEnabled: true,
    volume: 0.7
};

// =============================================================================
// PLAYER CLASS
// =============================================================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.lastY = y;
        this.width = SETTINGS.playerWidth;
        this.height = SETTINGS.playerHeight;
        
        this.onGround = false;
        this.jumpHeld = false;
        
        this.animFrame = 0;
        this.animTimer = 0;
        
        this.lastLandingPerfect = false;
        this.landingFlash = 0;
    }
    
    update() {
        // Store last Y for collision detection
        this.lastY = this.y;
        
        // Air control (horizontal movement)
        const targetVX = (keys['ArrowRight'] || keys['KeyD'] ? 1 : 0) - 
                        (keys['ArrowLeft'] || keys['KeyA'] ? 1 : 0);
        
        if (targetVX !== 0 && !this.onGround) {
            // Apply air acceleration
            this.vx += targetVX * SETTINGS.airAcceleration * gameSpeed;
            this.vx = Math.max(-SETTINGS.maxAirVelocity, Math.min(SETTINGS.maxAirVelocity, this.vx));
        } else {
            // Air friction
            this.vx *= 0.95;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }
        
        // Apply gravity (affected by game speed)
        this.vy += SETTINGS.gravity * gameSpeed;
        if (this.vy > SETTINGS.maxFallSpeed) {
            this.vy = SETTINGS.maxFallSpeed;
        }
        
        // Variable jump height
        if (this.jumpHeld && keys['Space'] && jumpHoldCounter > 0) {
            this.vy += SETTINGS.jumpHoldPower * gameSpeed;
            jumpHoldCounter--;
        }
        if (!keys['Space']) {
            this.jumpHeld = false;
        }
        
        // Coyote time
        if (this.onGround) {
            coyoteCounter = COYOTE_TIME;
        } else {
            coyoteCounter = Math.max(0, coyoteCounter - 1);
        }
        
        // Move
        this.x += this.vx * gameSpeed;
        this.y += this.vy * gameSpeed;
        
        // Keep mostly centered horizontally (with slight drift allowed)
        const targetX = 150;
        if (Math.abs(this.x - targetX) > 50) {
            this.x += (targetX - this.x) * 0.1;
        }
        
        // Platform collision
        const wasOnGround = this.onGround;
        this.onGround = false;
        
        for (const platform of platforms) {
            if (this.collidesWith(platform)) {
                // Only land on top - must be falling and above platform last frame
                if (this.vy > 0 && this.lastY + this.height <= platform.y + 5) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.vx *= 0.5; // Reduce horizontal momentum on landing
                    this.onGround = true;
                    
                    // Check for landing (just landed)
                    if (!wasOnGround) {
                        this.handleLanding(platform);
                    }
                }
            }
        }
        
        // Death - fell below screen
        if (this.y > CANVAS_HEIGHT + 50) {
            gameState = 'gameover';
            AUDIO.stopMusic();
            AUDIO.playDeath();
        }
        
        // Landing flash decay
        this.landingFlash = Math.max(0, this.landingFlash - 0.05);
        
        // Animation
        this.animTimer++;
        if (this.animTimer > 6) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }
    
    jump() {
        if (this.onGround || coyoteCounter > 0) {
            this.vy = SETTINGS.jumpPower;
            // Add slight forward momentum
            this.vx = 1.5;
            this.onGround = false;
            coyoteCounter = 0;
            this.jumpHeld = true;
            jumpHoldCounter = SETTINGS.jumpHoldTime;
            AUDIO.playJump();
            
            // Jump particles
            if (settings.particlesEnabled) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(
                        this.x + this.width / 2,
                        this.y + this.height,
                        'jump'
                    ));
                }
            }
        }
    }
    
    handleLanding(platform) {
        // Check if perfect landing
        const landingX = this.x + this.width / 2;
        const platformCenterX = platform.x + platform.width / 2;
        const perfectZone = platform.width * SETTINGS.perfectMargin;
        const distance = Math.abs(landingX - platformCenterX);
        
        if (distance < perfectZone) {
            // PERFECT LANDING!
            this.lastLandingPerfect = true;
            this.landingFlash = 1.0;
            
            const refillAmount = platform.type === 'golden' 
                ? SETTINGS.chronoRefillPerfect * 1.5 
                : SETTINGS.chronoRefillPerfect;
            
            chronoMeter = Math.min(SETTINGS.chronoMax, chronoMeter + refillAmount);
            score += platform.type === 'golden' ? 100 : 50;
            
            AUDIO.playPerfectLanding();
            AUDIO.playChronoRefill();
            
            // Perfect landing particles
            if (settings.particlesEnabled) {
                for (let i = 0; i < 15; i++) {
                    particles.push(new Particle(
                        landingX,
                        this.y + this.height,
                        'perfect'
                    ));
                }
            }
        } else {
            // Regular landing
            this.lastLandingPerfect = false;
            AUDIO.playLanding();
            
            if (settings.particlesEnabled) {
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(
                        this.x + this.width / 2,
                        this.y + this.height,
                        'landing'
                    ));
                }
            }
        }
    }
    
    collidesWith(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            vy: this.vy,
            onGround: this.onGround,
            animFrame: this.animFrame,
            landingFlash: this.landingFlash,
            lastLandingPerfect: this.lastLandingPerfect
        };
    }
}

// =============================================================================
// PLATFORM CLASS
// =============================================================================

class Platform {
    constructor(x, y, width, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = SETTINGS.platformHeight;
        this.type = type; // 'normal', 'golden'
    }
    
    update() {
        // Move left (affected by game speed)
        this.x -= scrollSpeed * gameSpeed;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type
        };
    }
}

// =============================================================================
// PARTICLE CLASS
// =============================================================================

class Particle {
    constructor(x, y, type = 'generic') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 'jump') {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = -Math.random() * 2;
            this.life = 15 + Math.random() * 10;
            this.size = 3 + Math.random() * 2;
            this.color = '#64c8ff';
        } else if (type === 'landing') {
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = -Math.random() * 3;
            this.life = 10 + Math.random() * 8;
            this.size = 2 + Math.random() * 2;
            this.color = '#888';
        } else if (type === 'perfect') {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 2;
            this.life = 30 + Math.random() * 20;
            this.size = 4 + Math.random() * 4;
            this.color = '#00ffff';
        } else if (type === 'chrono') {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.life = 40 + Math.random() * 30;
            this.size = 2 + Math.random() * 3;
            this.color = '#ffaa00';
        } else if (type === 'speed') {
            this.vx = -scrollSpeed * gameSpeed * (0.5 + Math.random() * 0.5);
            this.vy = (Math.random() - 0.5) * 2;
            this.life = 20 + Math.random() * 15;
            this.size = 2 + Math.random() * 2;
            this.color = '#6464ff';
        }
        
        this.maxLife = this.life;
    }
    
    update() {
        this.x += this.vx * gameSpeed;
        this.y += this.vy * gameSpeed;
        
        if (this.type === 'jump' || this.type === 'landing') {
            this.vy += 0.2 * gameSpeed; // Gravity
        } else if (this.type === 'chrono') {
            // Gentle float
            this.vy -= 0.1 * gameSpeed;
        }
        
        this.life--;
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            size: this.size,
            color: this.color,
            life: this.life,
            maxLife: this.maxLife,
            type: this.type
        };
    }
}

// =============================================================================
// PLATFORM GENERATION
// =============================================================================

function spawnPlatform() {
    // Calculate difficulty-adjusted values
    const gapVariation = 50 + (difficultyMultiplier * 30);
    const gap = SETTINGS.basePlatformGap * modeSettings.gapMultiplier + 
                (Math.random() - 0.5) * gapVariation;
    
    const widthVariation = 40;
    const width = (SETTINGS.basePlatformWidth * modeSettings.platformWidthMultiplier) +
                  (Math.random() - 0.5) * widthVariation;
    
    // Random height
    const y = SETTINGS.platformYMin + Math.random() * (SETTINGS.platformYMax - SETTINGS.platformYMin);
    
    // Ensure jumpable (basic check - max horizontal distance player can cover)
    const maxJumpDistance = 200;
    const actualGap = Math.min(gap, maxJumpDistance);
    const actualWidth = Math.max(50, width);
    
    // Occasional golden platform (15% chance)
    const type = Math.random() < 0.15 ? 'golden' : 'normal';
    
    const x = lastPlatformX + actualGap;
    lastPlatformX = x + actualWidth;
    
    platforms.push(new Platform(x, y, actualWidth, type));
}

function initializePlatforms() {
    platforms = [];
    
    // Starting platform (under player)
    lastPlatformX = 50;
    platforms.push(new Platform(50, 430, 150, 'normal'));
    
    // Generate initial platforms to fill screen
    for (let i = 0; i < 8; i++) {
        spawnPlatform();
    }
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================

function init() {
    console.log('🎮 Game initializing...');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    AUDIO.init();
    THEME.init(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    loadProgress();
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    gameLoop();
    updateDebug();
    
    console.log('✅ Time-Slice Runner ready!');
}

function startGame(mode) {
    currentMode = mode;
    modeSettings = DIFFICULTY_MODES[mode];
    
    // Reset state
    player = new Player(150, 300);
    particles = [];
    distance = 0;
    score = 0;
    chronoMeter = SETTINGS.chronoMax;
    gameSpeed = 1.0;
    timeSliceActive = false;
    wasTimeSliceActive = false;
    difficultyMultiplier = 1.0;
    lastMilestone = 0;
    
    scrollSpeed = SETTINGS.baseScrollSpeed * modeSettings.scrollSpeedMultiplier;
    
    initializePlatforms();
    
    gameState = 'playing';
    AUDIO.startMusic();
}

function updateDebug() {
    const debug = document.getElementById('debug');
    if (debug) {
        debug.textContent = `Modular Architecture: game.js (✓) | theme.js (${typeof THEME !== 'undefined' ? '✓' : '✗'}) | audio.js (${typeof AUDIO !== 'undefined' ? '✓' : '✗'})`;
    }
}

// =============================================================================
// GAME STATE
// =============================================================================

function getGameState() {
    return {
        state: gameState,
        currentMode: currentMode,
        modeSettings: modeSettings,
        modes: DIFFICULTY_MODES,
        player: player ? player.getState() : null,
        platforms: platforms.map(p => p.getState()),
        particles: settings.particlesEnabled ? particles.map(p => p.getState()) : [],
        chronoMeter: chronoMeter,
        chronoMax: SETTINGS.chronoMax,
        gameSpeed: gameSpeed,
        timeSliceActive: timeSliceActive,
        distance: Math.floor(distance),
        score: score,
        highScores: highScores,
        settings: settings
    };
}

// =============================================================================
// UPDATE LOOP
// =============================================================================

function update() {
    if (gameState !== 'playing') return;
    
    // Time-slice mechanic
    if ((keys['ShiftLeft'] || keys['ShiftRight'] || keys['Shift']) && chronoMeter > 0) {
        gameSpeed = SETTINGS.slowMotionSpeed;
        chronoMeter -= SETTINGS.chronoDrainRate;
        chronoMeter = Math.max(0, chronoMeter);
        timeSliceActive = true;
        
        // Audio feedback on activation
        if (!wasTimeSliceActive) {
            AUDIO.playTimeSlice();
        }
    } else {
        gameSpeed = 1.0;
        
        // Audio feedback on deactivation
        if (wasTimeSliceActive) {
            AUDIO.playTimeSliceEnd();
        }
        
        timeSliceActive = false;
    }
    
    wasTimeSliceActive = timeSliceActive;
    
    // Update music intensity based on speed
    const intensity = (scrollSpeed / SETTINGS.baseScrollSpeed) * 0.7;
    AUDIO.setMusicIntensity(intensity);
    
    // Update player
    player.update();
    
    // Update platforms
    platforms.forEach(p => p.update());
    
    // Remove off-screen platforms
    platforms = platforms.filter(p => p.x + p.width > -50);
    
    // Spawn new platforms (endless generation)
    // Keep spawning as long as the rightmost platform is visible or close
    const rightmostPlatform = platforms[platforms.length - 1];
    while (rightmostPlatform && rightmostPlatform.x < CANVAS_WIDTH + 400) {
        spawnPlatform();
    }
    
    // Update particles
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0 && p.x > -50 && p.x < CANVAS_WIDTH + 50);
    
    // Spawn chrono particles when time-slice active
    if (timeSliceActive && settings.particlesEnabled && Math.random() < 0.3) {
        particles.push(new Particle(
            player.x + player.width / 2 + (Math.random() - 0.5) * 40,
            player.y + player.height / 2 + (Math.random() - 0.5) * 40,
            'chrono'
        ));
    }
    
    // Spawn speed particles
    if (settings.particlesEnabled && Math.random() < 0.1) {
        particles.push(new Particle(
            CANVAS_WIDTH,
            100 + Math.random() * 300,
            'speed'
        ));
    }
    
    // Update distance and score
    distance += scrollSpeed * gameSpeed / 60; // Convert to "meters"
    score += Math.floor(scrollSpeed * gameSpeed) * 0.1;
    
    // Difficulty ramping
    difficultyMultiplier = 1.0 + (distance * SETTINGS.difficultyIncreaseRate);
    difficultyMultiplier = Math.min(SETTINGS.maxDifficultyMultiplier, difficultyMultiplier);
    
    // Increase scroll speed slightly with difficulty
    const baseSpeed = SETTINGS.baseScrollSpeed * modeSettings.scrollSpeedMultiplier;
    scrollSpeed = baseSpeed * (1 + (difficultyMultiplier - 1) * 0.3);
    
    // Milestone checks
    const milestones = [500, 1000, 2000, 5000, 10000];
    for (const milestone of milestones) {
        if (score >= milestone && lastMilestone < milestone) {
            lastMilestone = milestone;
            AUDIO.playMilestone();
            
            // Check for mode unlocks
            if (currentMode === 'easy' && milestone >= 500 && !DIFFICULTY_MODES.normal.unlocked) {
                DIFFICULTY_MODES.normal.unlocked = true;
                AUDIO.playModeUnlock();
                saveProgress();
            }
            if (currentMode === 'normal' && milestone >= 1000 && !DIFFICULTY_MODES.hard.unlocked) {
                DIFFICULTY_MODES.hard.unlocked = true;
                AUDIO.playModeUnlock();
                saveProgress();
            }
        }
    }
}

// =============================================================================
// GAME LOOP
// =============================================================================

function gameLoop() {
    update();
    THEME.render(getGameState());
    requestAnimationFrame(gameLoop);
}

// =============================================================================
// INPUT HANDLING
// =============================================================================

function handleKeyDown(e) {
    if (['Space', 'ArrowUp', 'KeyW', 'Shift', 'Escape', 'KeyP'].includes(e.code)) {
        e.preventDefault();
    }
    
    keys[e.code] = true;
    
    AUDIO.resume();
    
    // Mode selection
    if (gameState === 'modeselect') {
        if ((e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') && DIFFICULTY_MODES.easy.unlocked) {
            startGame('easy');
            AUDIO.playUISelect();
        } else if ((e.code === 'Digit2' || e.code === 'Numpad2' || e.key === '2') && DIFFICULTY_MODES.normal.unlocked) {
            startGame('normal');
            AUDIO.playUISelect();
        } else if ((e.code === 'Digit3' || e.code === 'Numpad3' || e.key === '3') && DIFFICULTY_MODES.hard.unlocked) {
            startGame('hard');
            AUDIO.playUISelect();
        } else if (e.code === 'Enter' || e.code === 'Space') {
            // Start with current highlighted mode (default to easy)
            const mode = DIFFICULTY_MODES.easy.unlocked ? 'easy' : 
                        DIFFICULTY_MODES.normal.unlocked ? 'normal' : 
                        DIFFICULTY_MODES.hard.unlocked ? 'hard' : 'easy';
            startGame(mode);
            AUDIO.playUISelect();
        }
    }
    
    // Jump
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameState === 'playing') {
        player.jump();
    }
    
    // Pause
    if ((e.code === 'Escape' || e.code === 'KeyP') && gameState === 'playing') {
        gameState = 'paused';
        AUDIO.playUISelect();
    } else if ((e.code === 'Escape' || e.code === 'KeyP') && gameState === 'paused') {
        gameState = 'playing';
        AUDIO.playUISelect();
    }
    
    // Restart from game over
    if (e.code === 'Enter' && gameState === 'gameover') {
        // Update high score
        if (score > highScores[currentMode]) {
            highScores[currentMode] = Math.floor(score);
            saveProgress();
        }
        
        gameState = 'modeselect';
        AUDIO.playUISelect();
    }
    
    // Pause menu options
    if (gameState === 'paused') {
        if (e.code === 'KeyR') {
            // Restart
            startGame(currentMode);
            AUDIO.playUISelect();
        } else if (e.code === 'KeyQ') {
            // Quit to menu
            AUDIO.stopMusic();
            gameState = 'modeselect';
            AUDIO.playUISelect();
        } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
            // Volume up
            settings.volume = Math.min(1.0, settings.volume + 0.1);
            AUDIO.setVolume(settings.volume);
            saveProgress();
            AUDIO.playUISelect();
        } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
            // Volume down
            settings.volume = Math.max(0.0, settings.volume - 0.1);
            AUDIO.setVolume(settings.volume);
            saveProgress();
            AUDIO.playUISelect();
        } else if (e.code === 'KeyT') {
            // Toggle particles
            settings.particlesEnabled = !settings.particlesEnabled;
            saveProgress();
            AUDIO.playUISelect();
        } else if (e.code === 'KeyS') {
            // Toggle screen shake
            settings.screenShakeEnabled = !settings.screenShakeEnabled;
            saveProgress();
            AUDIO.playUISelect();
        }
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

// =============================================================================
// SAVE/LOAD PROGRESS
// =============================================================================

function saveProgress() {
    const progress = {
        highScores: highScores,
        modesUnlocked: {
            easy: DIFFICULTY_MODES.easy.unlocked,
            normal: DIFFICULTY_MODES.normal.unlocked,
            hard: DIFFICULTY_MODES.hard.unlocked
        },
        settings: settings
    };
    localStorage.setItem('timeSliceRunnerProgress', JSON.stringify(progress));
    console.log('💾 Progress saved');
}

function loadProgress() {
    const saved = localStorage.getItem('timeSliceRunnerProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            highScores = progress.highScores || { easy: 0, normal: 0, hard: 0 };
            if (progress.modesUnlocked) {
                DIFFICULTY_MODES.easy.unlocked = progress.modesUnlocked.easy !== false;
                DIFFICULTY_MODES.normal.unlocked = progress.modesUnlocked.normal || false;
                DIFFICULTY_MODES.hard.unlocked = progress.modesUnlocked.hard || false;
            }
            if (progress.settings) {
                settings = progress.settings;
                AUDIO.setVolume(settings.volume);
            }
            console.log('📂 Progress loaded');
        } catch (e) {
            console.log('⚠️ Could not load progress');
        }
    }
}

// =============================================================================
// START
// =============================================================================

window.addEventListener('load', init);
