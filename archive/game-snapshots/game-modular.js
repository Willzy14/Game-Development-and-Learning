// ============================================
// GAME.JS - MECHANICS ONLY (LOCKED)
// ============================================
// This file contains ONLY game mechanics:
//    - Physics and gravity
//    - Collision detection
//    - Scoring
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

// ============================================
// CONSTANTS (LOCKED - DO NOT CHANGE FOR THEMES)
// ============================================

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

// Bird physics
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const MAX_FALL_SPEED = 10;
const BIRD_SIZE = 34;

// Pipe configuration
const PIPE_WIDTH = 52;
const PIPE_GAP_START = 200;
const PIPE_GAP_MIN = 140;
const PIPE_SPEED = 2;
const PIPE_SPAWN_DISTANCE = 200;

// Game states
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// ============================================
// GAME CLASS
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize theme
        THEME.init(this.canvas, this.ctx);
        
        // Game state
        this.currentState = GameState.MENU;
        this.score = 0;
        this.highScore = 0;
        
        // Bird
        this.bird = {
            x: 100,
            y: CANVAS_HEIGHT / 2,
            velocity: 0,
            rotation: 0
        };
        
        // Pipes
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        // Background scrolling
        this.bgX = 0;
        
        // Load saved data
        this.loadData();
        
        // Initialize
        this.setupUI();
        this.setupControls();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    setupUI() {
        // DOM elements
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.settingsModal = document.getElementById('settingsModal');
        this.hud = document.getElementById('hud');
        
        // Buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeModal').addEventListener('click', () => this.closeSettings());
        document.getElementById('resetScores').addEventListener('click', () => this.resetScores());
        
        // Volume controls
        const masterVolume = document.getElementById('masterVolume');
        const musicVolume = document.getElementById('musicVolume');
        
        if (masterVolume) {
            masterVolume.addEventListener('input', (e) => {
                AUDIO.setMasterVolume(e.target.value);
                document.getElementById('masterVolumeValue').textContent = e.target.value + '%';
            });
        }
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                AUDIO.setMusicVolume(e.target.value);
                document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
            });
        }
    }
    
    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            AUDIO.init();
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleFlap();
            }
        });
        
        // Mouse/Touch
        this.canvas.addEventListener('click', () => {
            AUDIO.init();
            this.handleFlap();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            AUDIO.init();
            this.handleFlap();
        });
    }
    
    handleFlap() {
        if (this.currentState === GameState.PLAYING) {
            this.bird.velocity = FLAP_STRENGTH;
            AUDIO.playFlap();
        }
    }
    
    // ============================================
    // GAME FLOW
    // ============================================
    
    startGame() {
        this.currentState = GameState.PLAYING;
        this.score = 0;
        
        // Reset bird
        this.bird.y = CANVAS_HEIGHT / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        
        // Clear pipes
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        // Reset background
        this.bgX = 0;
        
        // UI
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.remove('hidden');
        
        // Start music
        AUDIO.startBackgroundMusic();
    }
    
    showMenu() {
        this.currentState = GameState.MENU;
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        AUDIO.stopBackgroundMusic();
    }
    
    gameOver() {
        this.currentState = GameState.GAME_OVER;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveData();
        }
        
        // Play death sound
        AUDIO.playDie();
        AUDIO.stopBackgroundMusic();
        
        // Show game over screen
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        
        // Show medal based on score
        this.displayMedal();
    }
    
    displayMedal() {
        const medal = document.getElementById('medal');
        medal.className = '';
        
        if (this.score >= 40) {
            medal.classList.add('platinum');
            medal.textContent = '💎';
        } else if (this.score >= 30) {
            medal.classList.add('gold');
            medal.textContent = '🥇';
        } else if (this.score >= 20) {
            medal.classList.add('silver');
            medal.textContent = '🥈';
        } else if (this.score >= 10) {
            medal.classList.add('bronze');
            medal.textContent = '🥉';
        } else {
            medal.style.display = 'none';
            return;
        }
        
        medal.style.display = 'flex';
    }
    
    // ============================================
    // SETTINGS
    // ============================================
    
    openSettings() {
        this.settingsModal.classList.remove('hidden');
    }
    
    closeSettings() {
        this.settingsModal.classList.add('hidden');
    }
    
    resetScores() {
        if (confirm('Are you sure you want to reset all scores?')) {
            this.highScore = 0;
            this.saveData();
            alert('High scores reset!');
        }
    }
    
    // ============================================
    // DATA PERSISTENCE
    // ============================================
    
    loadData() {
        const saved = localStorage.getItem('flappyBirdData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.highScore = data.highScore || 0;
            } catch (e) {
                console.error('Failed to load save data:', e);
            }
        }
    }
    
    saveData() {
        const data = {
            highScore: this.highScore,
            version: 1
        };
        localStorage.setItem('flappyBirdData', JSON.stringify(data));
    }
    
    // ============================================
    // UPDATE LOGIC
    // ============================================
    
    update() {
        if (this.currentState !== GameState.PLAYING) return;
        
        // Update bird physics
        this.updateBird();
        
        // Update pipes
        this.updatePipes();
        
        // Check collisions
        this.checkCollisions();
        
        // Update background scroll
        this.bgX -= PIPE_SPEED;
        if (this.bgX <= -CANVAS_WIDTH) {
            this.bgX = 0;
        }
    }
    
    updatePipes() {
        // Spawn new pipes
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= PIPE_SPAWN_DISTANCE / PIPE_SPEED) {
            this.spawnPipe();
            this.pipeSpawnTimer = 0;
        }
        
        // Move pipes left
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= PIPE_SPEED;
            
            // Remove pipes that went off screen
            if (pipe.x + PIPE_WIDTH < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    spawnPipe() {
        // Difficulty scaling - gap gets smaller as score increases
        const gapSize = Math.max(
            PIPE_GAP_MIN,
            PIPE_GAP_START - (this.score * 2)
        );
        
        // Random gap position
        const minGapY = 100;
        const maxGapY = CANVAS_HEIGHT - 150 - gapSize;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        
        this.pipes.push({
            x: CANVAS_WIDTH,
            gapY: gapY,
            gapSize: gapSize,
            scored: false
        });
    }
    
    checkCollisions() {
        // Bird boundaries (circle collision)
        const birdRadius = BIRD_SIZE / 2;
        const birdLeft = this.bird.x - birdRadius;
        const birdRight = this.bird.x + birdRadius;
        const birdTop = this.bird.y - birdRadius;
        const birdBottom = this.bird.y + birdRadius;
        
        for (const pipe of this.pipes) {
            // Only check pipes that are near the bird
            if (pipe.x + PIPE_WIDTH < birdLeft - 20 || pipe.x > birdRight + 20) {
                continue;
            }
            
            // Check if bird passed through gap successfully
            if (!pipe.scored && pipe.x + PIPE_WIDTH < this.bird.x) {
                pipe.scored = true;
                this.score++;
                AUDIO.playScore();
            }
            
            // Pipe boundaries
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + PIPE_WIDTH;
            
            // Check if bird is horizontally aligned with pipe
            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                // Check collision with top pipe
                if (birdTop < pipe.gapY) {
                    AUDIO.playHit();
                    this.gameOver();
                    return;
                }
                
                // Check collision with bottom pipe
                const bottomPipeY = pipe.gapY + pipe.gapSize;
                if (birdBottom > bottomPipeY) {
                    AUDIO.playHit();
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    updateBird() {
        // Apply gravity
        this.bird.velocity += GRAVITY;
        
        // Cap fall speed
        if (this.bird.velocity > MAX_FALL_SPEED) {
            this.bird.velocity = MAX_FALL_SPEED;
        }
        
        // Update position
        this.bird.y += this.bird.velocity;
        
        // Update rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Check ground collision
        if (this.bird.y + BIRD_SIZE / 2 >= CANVAS_HEIGHT - 50) {
            this.gameOver();
        }
        
        // Check ceiling collision
        if (this.bird.y - BIRD_SIZE / 2 <= 0) {
            this.bird.y = BIRD_SIZE / 2;
            this.bird.velocity = 0;
        }
    }
    
    // ============================================
    // GAME STATE (for THEME to render)
    // ============================================
    
    getState() {
        return {
            bird: this.bird,
            pipes: this.pipes,
            bgX: this.bgX,
            currentState: this.currentState,
            score: this.score,
            highScore: this.highScore
        };
    }
    
    // ============================================
    // RENDER (delegates to THEME)
    // ============================================
    
    render() {
        // Delegate ALL rendering to THEME
        THEME.render(this.getState(), {
            PIPE_WIDTH,
            BIRD_SIZE,
            GameState,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        });
    }
}

// ============================================
// GAME LOOP
// ============================================

const game = new Game();

function gameLoop() {
    game.update();
    game.render();
    requestAnimationFrame(gameLoop);
}

// Start the loop
gameLoop();
