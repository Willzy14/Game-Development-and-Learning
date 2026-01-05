// ============================================
// FLAPPY BIRD V2 - MASTERY EDITION
// ============================================
// V2 Enhancements: Parallax backgrounds, particles, screen shake, wing animation,
// advanced music, visual polish, juicy feedback

// ============================================
// CONSTANTS
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
// PARTICLE SYSTEM
// ============================================

class Particle {
    constructor(x, y, color, size = 4) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity
        this.life -= this.decay;
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ============================================
// GAME CLASS
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.currentState = GameState.MENU;
        this.score = 0;
        this.highScore = 0;
        
        // Bird
        this.bird = {
            x: 100,
            y: CANVAS_HEIGHT / 2,
            velocity: 0,
            rotation: 0,
            wingAngle: 0 // V2: Wing animation
        };
        
        // Pipes
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        // V2: Visual effects
        this.particles = [];
        this.shake = { x: 0, y: 0, intensity: 0 };
        this.clouds = this.generateClouds();
        this.mountains = this.generateMountains();
        
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
        
        masterVolume.addEventListener('input', (e) => {
            audio.setMasterVolume(e.target.value);
            document.getElementById('masterVolumeValue').textContent = e.target.value + '%';
        });
        
        musicVolume.addEventListener('input', (e) => {
            audio.setMusicVolume(e.target.value);
            document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
        });
    }
    
    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            // Initialize audio on first interaction
            audio.init();
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleFlap();
            }
        });
        
        // Mouse/Touch
        this.canvas.addEventListener('click', () => {
            audio.init();
            this.handleFlap();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            audio.init();
            this.handleFlap();
        });
    }
    
    handleFlap() {
        if (this.currentState === GameState.PLAYING) {
            this.bird.velocity = FLAP_STRENGTH;
            audio.playFlap();
            this.createFeatherParticles(); // V2: Spawn feathers on flap
        }
    }
    
    // ============================================
    // GAME FLOW
    // ============================================
    
    startGame() {
        // Initialize audio on first interaction
        audio.init();
        
        this.currentState = GameState.PLAYING;
        this.score = 0;
        
        // Reset bird
        this.bird.y = CANVAS_HEIGHT / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.wingAngle = 0; // V2: Reset wing animation
        
        // Clear pipes
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        // V2: Clear effects
        this.particles = [];
        this.shake = { x: 0, y: 0, intensity: 0 };
        
        // Reset background
        this.bgX = 0;
        
        // UI
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.remove('hidden');
        
        // Start music
        audio.startBackgroundMusic();
    }
    
    showMenu() {
        this.currentState = GameState.MENU;
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        audio.stopBackgroundMusic();
    }
    
    gameOver() {
        this.currentState = GameState.GAME_OVER;
        
        // V2: Screen shake and explosion
        this.shake.intensity = 15;
        this.createExplosionParticles();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveData();
        }
        
        // Play death sound
        audio.playDie();
        audio.stopBackgroundMusic();
        
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
        
        // V2: Update particles
        this.updateParticles();
        
        // V2: Update screen shake
        this.updateShake();
        
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
            
            // Remove pipes that went off screen (object pooling would reuse them)
            if (pipe.x + PIPE_WIDTH < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    spawnPipe() {
        // Difficulty scaling - gap gets smaller as score increases
        // Starts at 200, shrinks to 140 by score 30
        const gapSize = Math.max(
            PIPE_GAP_MIN,
            PIPE_GAP_START - (this.score * 2)
        );
        
        // Random gap position (procedural generation)
        const minGapY = 100;
        const maxGapY = CANVAS_HEIGHT - 150 - gapSize;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        
        this.pipes.push({
            x: CANVAS_WIDTH,
            gapY: gapY,
            gapSize: gapSize,  // Store gap size for this pipe
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
                audio.playScore();
                audio.setMusicIntensity(this.score); // V2: Update music intensity
            }
            
            // Pipe boundaries
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + PIPE_WIDTH;
            
            // Check if bird is horizontally aligned with pipe
            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                // Check collision with top pipe
                if (birdTop < pipe.gapY) {
                    audio.playHit();
                    this.gameOver();
                    return;
                }
                
                // Check collision with bottom pipe
                const bottomPipeY = pipe.gapY + pipe.gapSize;
                if (birdBottom > bottomPipeY) {
                    audio.playHit();
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
        
        // V2: Update wing animation
        this.bird.wingAngle += 0.3;
        
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
    // RENDER
    // ============================================
    
    render() {
        // V2: Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.shake.x, this.shake.y);
        
        // Clear canvas
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(-this.shake.x, -this.shake.y, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw background (scrolling clouds/sky)
        this.drawBackground();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw ground
        this.drawGround();
        
        // V2: Draw particles
        this.drawParticles();
        
        // Draw bird
        this.drawBird();
        
        this.ctx.restore();
        
        // Draw score
        if (this.currentState === GameState.PLAYING) {
            document.getElementById('scoreDisplay').textContent = this.score;
        }
    }
    
    drawBackground() {
        // V3 UPGRADE: Enhanced parallax background with gradients
        
        // Sky gradient (more vibrant, sunset-like tones)
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - 50);
        skyGradient.addColorStop(0, '#4a90c2');    // Deeper blue at top
        skyGradient.addColorStop(0.4, '#87ceeb');  // Light sky blue
        skyGradient.addColorStop(0.8, '#b8e0f0');  // Pale horizon
        skyGradient.addColorStop(1, '#f0e8c0');    // Warm horizon glow
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(-this.shake.x, -this.shake.y, CANVAS_WIDTH, CANVAS_HEIGHT - 50);
        
        // V3 UPGRADE: Sun glow (radial gradient)
        const sunX = 320;
        const sunY = 80;
        const sunGlow = this.ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 80);
        sunGlow.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        sunGlow.addColorStop(0.3, 'rgba(255, 240, 150, 0.3)');
        sunGlow.addColorStop(1, 'rgba(255, 240, 150, 0)');
        this.ctx.fillStyle = sunGlow;
        this.ctx.fillRect(sunX - 80, sunY - 80, 160, 160);
        
        // V3 UPGRADE: Mountains with gradient (depth and atmosphere)
        for (const mountain of this.mountains) {
            const parallaxX = (mountain.x + this.bgX * 0.3) % (CANVAS_WIDTH * 2);
            
            // Mountain gradient (atmospheric perspective - distant = lighter/bluer)
            const mtGradient = this.ctx.createLinearGradient(
                parallaxX, CANVAS_HEIGHT - 50 - mountain.height,
                parallaxX, CANVAS_HEIGHT - 50
            );
            mtGradient.addColorStop(0, '#7a8a6d');  // Peak (lighter)
            mtGradient.addColorStop(0.6, '#6a7a5d');
            mtGradient.addColorStop(1, '#5a6a4d');  // Base (darker)
            
            this.ctx.fillStyle = mtGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(parallaxX, CANVAS_HEIGHT - 50);
            this.ctx.lineTo(parallaxX + mountain.width / 2, CANVAS_HEIGHT - 50 - mountain.height);
            this.ctx.lineTo(parallaxX + mountain.width, CANVAS_HEIGHT - 50);
            this.ctx.fill();
            
            // V3 UPGRADE: Snow cap on tall mountains
            if (mountain.height > 120) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.beginPath();
                this.ctx.moveTo(parallaxX + mountain.width * 0.35, CANVAS_HEIGHT - 50 - mountain.height + 30);
                this.ctx.lineTo(parallaxX + mountain.width / 2, CANVAS_HEIGHT - 50 - mountain.height);
                this.ctx.lineTo(parallaxX + mountain.width * 0.65, CANVAS_HEIGHT - 50 - mountain.height + 30);
                this.ctx.fill();
            }
        }
        
        // V3 UPGRADE: Clouds with gradient (puffy 3D look)
        for (const cloud of this.clouds) {
            const parallaxX = (cloud.x + this.bgX * 0.5) % (CANVAS_WIDTH * 2);
            
            // Cloud shadow (underneath)
            this.ctx.fillStyle = 'rgba(150, 180, 200, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(parallaxX, cloud.y + 4, cloud.size * 0.9, 0, Math.PI * 2);
            this.ctx.arc(parallaxX + cloud.size * 0.8, cloud.y + 4, cloud.size * 0.7, 0, Math.PI * 2);
            this.ctx.arc(parallaxX + cloud.size * 1.6, cloud.y + 4, cloud.size * 0.9, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Cloud body with gradient
            const cloudGradient = this.ctx.createRadialGradient(
                parallaxX + cloud.size * 0.8, cloud.y - cloud.size * 0.3, 0,
                parallaxX + cloud.size * 0.8, cloud.y, cloud.size * 1.5
            );
            cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            cloudGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
            cloudGradient.addColorStop(1, 'rgba(240, 248, 255, 0.6)');
            
            this.ctx.fillStyle = cloudGradient;
            this.ctx.beginPath();
            this.ctx.arc(parallaxX, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(parallaxX + cloud.size * 0.8, cloud.y - cloud.size * 0.2, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(parallaxX + cloud.size * 1.6, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawGround() {
        // V3 UPGRADE: Ground with gradient (depth into earth)
        const groundGradient = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - 50, 0, CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#ded895');   // Light top
        groundGradient.addColorStop(0.3, '#c9c080'); // Mid
        groundGradient.addColorStop(1, '#a89860');   // Darker bottom
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
        
        // V3 UPGRADE: Grass with gradient (lush look)
        const grassGradient = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - 56, 0, CANVAS_HEIGHT - 48);
        grassGradient.addColorStop(0, '#6ab05a');
        grassGradient.addColorStop(0.5, '#82c46c');
        grassGradient.addColorStop(1, '#5a9a4a');
        
        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, CANVAS_HEIGHT - 54, CANVAS_WIDTH, 6);
        
        // V3 UPGRADE: Grass blade details (procedural texture)
        this.ctx.strokeStyle = '#5a9a4a';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 8) {
            const height = 3 + Math.sin(x * 0.3) * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, CANVAS_HEIGHT - 54);
            this.ctx.lineTo(x + 2, CANVAS_HEIGHT - 54 - height);
            this.ctx.stroke();
        }
        
        // V3 UPGRADE: Ground texture (subtle dots/pebbles)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 47 + this.bgX * 0.5) % CANVAS_WIDTH;
            const y = CANVAS_HEIGHT - 40 + (i % 5) * 6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPipes() {
        for (const pipe of this.pipes) {
            const bottomPipeY = pipe.gapY + pipe.gapSize;
            
            // V3 UPGRADE: Create gradient for pipe body (3D cylinder effect)
            const pipeGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
            pipeGradient.addColorStop(0, '#4a8012');    // Dark left edge
            pipeGradient.addColorStop(0.2, '#72b01d');  // Light
            pipeGradient.addColorStop(0.5, '#8cd42a');  // Highlight center
            pipeGradient.addColorStop(0.8, '#72b01d');  // Light
            pipeGradient.addColorStop(1, '#4a7010');    // Dark right edge
            
            // V3 UPGRADE: Cap gradient (rounded look)
            const capGradient = this.ctx.createLinearGradient(pipe.x - 4, 0, pipe.x + PIPE_WIDTH + 4, 0);
            capGradient.addColorStop(0, '#3a6810');
            capGradient.addColorStop(0.15, '#5a9216');
            capGradient.addColorStop(0.5, '#6ba820');
            capGradient.addColorStop(0.85, '#5a9216');
            capGradient.addColorStop(1, '#3a6810');
            
            // Shadow (soft)
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            this.ctx.fillRect(pipe.x + 5, 0, PIPE_WIDTH, pipe.gapY);
            this.ctx.fillRect(pipe.x + 5, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY - 50);
            
            // TOP PIPE BODY
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
            
            // V3 UPGRADE: Pipe edge strokes
            this.ctx.strokeStyle = '#3a5a0a';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
            
            // V3 UPGRADE: Top pipe cap with rounded corners
            this.ctx.fillStyle = capGradient;
            this.drawRoundedRect(pipe.x - 4, pipe.gapY - 30, PIPE_WIDTH + 8, 30, 4);
            this.ctx.fill();
            this.ctx.strokeStyle = '#3a5a0a';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // V3 UPGRADE: Cap lip highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fillRect(pipe.x - 2, pipe.gapY - 28, PIPE_WIDTH + 4, 4);
            
            // BOTTOM PIPE BODY
            this.ctx.fillStyle = pipeGradient;
            this.ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY - 50);
            
            // V3 UPGRADE: Pipe edge strokes
            this.ctx.strokeStyle = '#3a5a0a';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY - 50);
            
            // V3 UPGRADE: Bottom pipe cap with rounded corners
            this.ctx.fillStyle = capGradient;
            this.drawRoundedRect(pipe.x - 4, bottomPipeY, PIPE_WIDTH + 8, 30, 4);
            this.ctx.fill();
            this.ctx.strokeStyle = '#3a5a0a';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // V3 UPGRADE: Cap lip highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fillRect(pipe.x - 2, bottomPipeY + 2, PIPE_WIDTH + 4, 4);
            
            // V3 UPGRADE: Shine streak down pipe (specular reflection)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.fillRect(pipe.x + 8, 0, 6, pipe.gapY);
            this.ctx.fillRect(pipe.x + 8, bottomPipeY + 30, 6, CANVAS_HEIGHT - bottomPipeY - 80);
        }
    }
    
    // V3 UPGRADE: Helper for rounded rectangles
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    drawBird() {
        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        this.ctx.rotate((this.bird.rotation * Math.PI) / 180);
        
        // V3 UPGRADE: Glow effect using shadowBlur
        this.ctx.shadowColor = 'rgba(255, 200, 0, 0.5)';
        this.ctx.shadowBlur = 15;
        
        // V2: Shadow under bird (cast shadow, not glow)
        this.ctx.save();
        this.ctx.shadowBlur = 0; // Disable glow for shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(4, 6, BIRD_SIZE / 2.5, BIRD_SIZE / 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // V3 UPGRADE: Bird body with radial gradient (more depth)
        const bodyGradient = this.ctx.createRadialGradient(-4, -6, 2, 0, 0, BIRD_SIZE / 2);
        bodyGradient.addColorStop(0, '#fff7a0');   // Light center (highlight)
        bodyGradient.addColorStop(0.4, '#ffd700'); // Golden mid
        bodyGradient.addColorStop(1, '#cc9900');   // Darker edge
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // V3 UPGRADE: Stroke outline for definition
        this.ctx.strokeStyle = '#997700';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // V3 UPGRADE: Wing with gradient and better shape
        this.ctx.shadowBlur = 0; // No glow on wing
        const wingFlap = Math.sin(this.bird.wingAngle) * 10;
        const wingGradient = this.ctx.createLinearGradient(-16, wingFlap - 12, -16, wingFlap + 12);
        wingGradient.addColorStop(0, '#ffdd44');
        wingGradient.addColorStop(1, '#cc8800');
        
        this.ctx.fillStyle = wingGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(-8, wingFlap, 8, 12, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#aa7700';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // V3 UPGRADE: Feather detail lines on wing using bezier curves
        this.ctx.strokeStyle = 'rgba(150, 100, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(-12, wingFlap - 6);
        this.ctx.quadraticCurveTo(-8, wingFlap, -4, wingFlap + 2);
        this.ctx.moveTo(-14, wingFlap);
        this.ctx.quadraticCurveTo(-8, wingFlap + 2, -2, wingFlap + 4);
        this.ctx.stroke();
        
        // V3 UPGRADE: Belly highlight (soft gradient)
        const bellyGradient = this.ctx.createRadialGradient(0, 6, 0, 0, 6, 10);
        bellyGradient.addColorStop(0, 'rgba(255, 240, 200, 0.6)');
        bellyGradient.addColorStop(1, 'rgba(255, 240, 200, 0)');
        this.ctx.fillStyle = bellyGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 6, 10, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // V3 UPGRADE: Specular highlight (shiny spot)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, -8, 4, 3, -0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye white with subtle gradient
        const eyeGradient = this.ctx.createRadialGradient(6, -6, 0, 6, -6, 6);
        eyeGradient.addColorStop(0, '#ffffff');
        eyeGradient.addColorStop(1, '#e8e8e8');
        this.ctx.fillStyle = eyeGradient;
        this.ctx.beginPath();
        this.ctx.arc(6, -6, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Eye pupil with highlight
        this.ctx.fillStyle = '#222';
        this.ctx.beginPath();
        this.ctx.arc(8, -6, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // V3 UPGRADE: Eye sparkle (life in the eyes!)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(9, -7, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // V3 UPGRADE: Beak with gradient (3D effect)
        const beakGradient = this.ctx.createLinearGradient(12, -4, 12, 4);
        beakGradient.addColorStop(0, '#ff8844');
        beakGradient.addColorStop(0.5, '#ff6b35');
        beakGradient.addColorStop(1, '#cc4422');
        
        this.ctx.fillStyle = beakGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.quadraticCurveTo(18, -3, 22, -1); // Curved top
        this.ctx.quadraticCurveTo(18, 3, 12, 0);   // Curved bottom
        this.ctx.fill();
        this.ctx.strokeStyle = '#aa3311';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // ============================================
    // V2: PARTICLE EFFECTS
    // ============================================
    
    createFeatherParticles() {
        // Create 3-5 feather particles on flap
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                this.bird.x - 10,
                this.bird.y,
                '#ffcc00',
                3 + Math.random() * 2
            ));
        }
    }
    
    createExplosionParticles() {
        // Create burst of particles on death
        const colors = ['#ffd700', '#ffcc00', '#ff6b35', '#ff4444'];
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 2 + Math.random() * 3;
            const particle = new Particle(
                this.bird.x,
                this.bird.y,
                colors[Math.floor(Math.random() * colors.length)],
                4 + Math.random() * 3
            );
            // Set initial velocity for explosion effect
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            this.particles.push(particle);
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }
    }
    
    // ============================================
    // V2: SCREEN SHAKE
    // ============================================
    
    updateShake() {
        if (this.shake.intensity > 0) {
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.intensity *= 0.9; // Decay
            
            if (this.shake.intensity < 0.5) {
                this.shake.intensity = 0;
                this.shake.x = 0;
                this.shake.y = 0;
            }
        }
    }
    
    // ============================================
    // V2: PARALLAX BACKGROUND GENERATION
    // ============================================
    
    generateClouds() {
        const clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * CANVAS_WIDTH * 2,
                y: 50 + Math.random() * 150,
                size: 20 + Math.random() * 20
            });
        }
        return clouds;
    }
    
    generateMountains() {
        const mountains = [];
        for (let i = 0; i < 8; i++) {
            mountains.push({
                x: (i * CANVAS_WIDTH / 4),
                width: 80 + Math.random() * 80,
                height: 80 + Math.random() * 100
            });
        }
        return mountains;
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
