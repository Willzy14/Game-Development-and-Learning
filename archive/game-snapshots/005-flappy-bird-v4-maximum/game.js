// ============================================
// FLAPPY BIRD V4 - MAXIMUM EDITION
// ============================================
// V4: PUSHING HARD - Every technique maximized
// Visual: Gradients, shadows, curves, highlights, atmospheric effects
// Audio: Multi-layered music, chord progressions, enhanced SFX
// Effects: Particles, screen shake, parallax, trail effects, score pop

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

// V4 MAXIMUM: Enhanced Particle class with more control
class Particle {
    constructor(x, y, vx, vy, color, size = 4, life = 60, drag = 0.98) {
        this.x = x;
        this.y = y;
        // V4: Accept velocity as parameters for controlled explosions
        if (typeof vx === 'string') {
            // Old API compatibility: constructor(x, y, color, size)
            this.color = vx;
            this.size = vy || 4;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4 - 2;
            this.maxLife = 60;
            this.life = this.maxLife;
            this.drag = 0.98;
        } else {
            // V4 API: constructor(x, y, vx, vy, color, size, life, drag)
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;
            this.maxLife = life;
            this.life = life;
            this.drag = drag;
        }
        this.gravity = 0.15;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // V4: Configurable gravity
        this.vx *= this.drag; // V4: Drag slows particles
        this.vy *= this.drag;
        this.life--;
        return this.life > 0;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);
        
        // V4: Glow effect for particles
        if (this.size > 5) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.size * 0.5;
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const currentSize = this.size * (0.5 + alpha * 0.5);
        ctx.arc(this.x, this.y, Math.max(1, currentSize), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
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
            wingAngle: 0,
            trail: [] // V4: Motion trail
        };
        
        // Pipes
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        // V2: Visual effects
        this.particles = [];
        this.shake = { x: 0, y: 0, intensity: 0 };
        this.clouds = this.generateClouds();
        this.mountains = this.generateMountains();
        
        // V4: Enhanced effects
        this.trail = []; // Motion trail behind bird
        this.trailTimer = 0;
        this.scorePop = { active: false, scale: 1, y: 0 };
        this.stars = this.generateStars();
        this.time = 0; // For animations
        
        // Background scrolling
        this.bgX = 0;
        
        // Load saved data
        this.loadData();
        
        // Initialize
        this.setupUI();
        this.setupControls();
    }
    
    // V4: Generate background stars
    generateStars() {
        const stars = [];
        for (let i = 0; i < 30; i++) {
            stars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * 200,
                size: Math.random() * 1.5 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
        return stars;
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
        
        // V4: Enhanced screen shake and death explosion
        this.shake.intensity = 20; // Stronger shake
        this.createDeathExplosion(); // V4 enhanced explosion with shockwave
        
        // Clear trail on death
        this.trail = [];
        
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
        // V4: Always update time for animations
        this.time++;
        
        if (this.currentState !== GameState.PLAYING) return;
        
        // Update bird physics
        this.updateBird();
        
        // V4: Update motion trail
        this.updateTrail();
        
        // V4: Update score pop animation
        this.updateScorePop();
        
        // Update pipes
        this.updatePipes();
        
        // V2: Update particles
        this.updateParticles();
        
        // V2: Update screen shake
        this.updateShake();
        
        // Check collisions
        this.checkCollisions();
        
        // Update background scroll - NO WRAPPING for procedural generation!
        this.bgX -= PIPE_SPEED;
        // Let it scroll infinitely - procedural generation handles everything
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
                this.triggerScorePop(); // V4: Score pop animation
                this.createScoreSparkles(); // V4: Sparkle burst on score
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
        
        // V4: Draw motion trail (behind bird, before particles)
        this.drawTrail();
        
        // V2: Draw particles
        this.drawParticles();
        
        // Draw bird
        this.drawBird();
        
        // V4: Draw score pop animation
        this.drawScorePop();
        
        this.ctx.restore();
        
        // Draw score
        if (this.currentState === GameState.PLAYING) {
            document.getElementById('scoreDisplay').textContent = this.score;
        }
    }
    
    drawBackground() {
        // V4 MAXIMUM: Rich, detailed parallax background
        
        // Dynamic sky gradient that shifts with time/score
        const timeOfDay = Math.min(this.score / 50, 1); // Progresses toward sunset
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - 50);
        
        // Blend from morning to sunset colors
        const topR = Math.floor(74 + timeOfDay * 80);
        const topG = Math.floor(144 - timeOfDay * 40);
        const topB = Math.floor(194 - timeOfDay * 60);
        skyGradient.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
        skyGradient.addColorStop(0.4, `rgb(${135 + timeOfDay * 50}, ${206 - timeOfDay * 30}, ${235 - timeOfDay * 40})`);
        skyGradient.addColorStop(0.7, `rgb(${184 + timeOfDay * 40}, ${224 - timeOfDay * 60}, ${240 - timeOfDay * 80})`);
        skyGradient.addColorStop(1, `rgb(${240 + timeOfDay * 15}, ${232 - timeOfDay * 80}, ${192 + timeOfDay * 40})`);
        
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(-this.shake.x, -this.shake.y, CANVAS_WIDTH, CANVAS_HEIGHT - 50);
        
        // V4: Sun with animated rays
        this.drawSun(timeOfDay);
        
        // V4: Distant birds (tiny animated silhouettes)
        this.drawDistantBirds();
        
        // V4: Far mountains (layer 1 - very distant, faded)
        this.drawMountainLayer(0.15, 0.3, '#8899aa', 40, 80);
        
        // V4: Mid mountains (layer 2 - with tree silhouettes)
        this.drawMountainLayer(0.25, 0.5, '#6a7a6d', 60, 120);
        
        // V4: Near mountains (layer 3 - detailed with snow caps)
        this.drawMountainLayer(0.4, 0.8, '#5a6a5d', 80, 160);
        
        // V4: Atmospheric haze between layers
        this.drawAtmosphericHaze();
        
        // V4: Multiple cloud layers
        this.drawCloudLayers();
        
        // V4: Floating particles (pollen/dust in sunlight)
        this.drawFloatingParticles();
    }
    
    drawSun(timeOfDay) {
        // Sun position moves with time of day
        const sunX = 320 - timeOfDay * 100;
        const sunY = 70 + timeOfDay * 30;
        const sunSize = 25 + timeOfDay * 10;
        
        // Outer glow (largest)
        const outerGlow = this.ctx.createRadialGradient(sunX, sunY, sunSize, sunX, sunY, sunSize * 4);
        outerGlow.addColorStop(0, `rgba(255, ${240 - timeOfDay * 40}, ${200 - timeOfDay * 80}, 0.3)`);
        outerGlow.addColorStop(0.5, `rgba(255, ${200 - timeOfDay * 50}, ${150 - timeOfDay * 80}, 0.1)`);
        outerGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
        this.ctx.fillStyle = outerGlow;
        this.ctx.fillRect(sunX - sunSize * 4, sunY - sunSize * 4, sunSize * 8, sunSize * 8);
        
        // Sun rays (animated rotation)
        this.ctx.save();
        this.ctx.translate(sunX, sunY);
        this.ctx.rotate(this.time * 0.002);
        
        const rayCount = 12;
        for (let i = 0; i < rayCount; i++) {
            const angle = (Math.PI * 2 / rayCount) * i;
            const rayLength = sunSize * 2.5 + Math.sin(this.time * 0.05 + i) * 10;
            
            this.ctx.fillStyle = `rgba(255, ${250 - timeOfDay * 30}, ${200 - timeOfDay * 60}, ${0.15 + Math.sin(this.time * 0.03 + i) * 0.05})`;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(
                Math.cos(angle - 0.1) * rayLength,
                Math.sin(angle - 0.1) * rayLength
            );
            this.ctx.lineTo(
                Math.cos(angle + 0.1) * rayLength * 1.3,
                Math.sin(angle + 0.1) * rayLength * 1.3
            );
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();
        
        // Inner sun glow
        const innerGlow = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 1.5);
        innerGlow.addColorStop(0, `rgba(255, 255, ${240 - timeOfDay * 40}, 0.9)`);
        innerGlow.addColorStop(0.4, `rgba(255, ${240 - timeOfDay * 30}, ${180 - timeOfDay * 60}, 0.6)`);
        innerGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
        this.ctx.fillStyle = innerGlow;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunSize * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sun core
        const coreGradient = this.ctx.createRadialGradient(sunX - 5, sunY - 5, 0, sunX, sunY, sunSize);
        coreGradient.addColorStop(0, '#fffff8');
        coreGradient.addColorStop(0.5, `rgb(255, ${250 - timeOfDay * 20}, ${220 - timeOfDay * 60})`);
        coreGradient.addColorStop(1, `rgb(255, ${220 - timeOfDay * 40}, ${180 - timeOfDay * 80})`);
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawDistantBirds() {
        // Small V-shaped birds flying in the distance
        if (!this.distantBirds) {
            this.distantBirds = [];
            for (let i = 0; i < 5; i++) {
                this.distantBirds.push({
                    x: Math.random() * CANVAS_WIDTH * 2,
                    y: 60 + Math.random() * 100,
                    speed: 0.3 + Math.random() * 0.4,
                    wingPhase: Math.random() * Math.PI * 2,
                    size: 3 + Math.random() * 3
                });
            }
        }
        
        this.ctx.strokeStyle = 'rgba(40, 50, 60, 0.4)';
        this.ctx.lineWidth = 1;
        
        for (const bird of this.distantBirds) {
            // Move bird
            bird.x -= bird.speed;
            if (bird.x < -20) bird.x = CANVAS_WIDTH + 20;
            
            bird.wingPhase += 0.15;
            const wingFlap = Math.sin(bird.wingPhase) * 3;
            
            // Draw V shape
            this.ctx.beginPath();
            this.ctx.moveTo(bird.x - bird.size, bird.y + wingFlap);
            this.ctx.lineTo(bird.x, bird.y);
            this.ctx.lineTo(bird.x + bird.size, bird.y + wingFlap);
            this.ctx.stroke();
        }
    }
    
    drawMountainLayer(parallaxSpeed, opacity, baseColor, minHeight, maxHeight) {
        // V4 MAXIMUM: Generate mountains procedurally based on absolute position
        // No tiling, no wrapping - just generate based on what's visible
        const scrollAmount = -this.bgX * parallaxSpeed;
        const spacing = 95; // Average spacing
        
        // Calculate which mountains are visible
        const firstMountainIndex = Math.floor((scrollAmount - 200) / spacing);
        const lastMountainIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 200) / spacing);
        
        // Draw only visible mountains
        for (let i = firstMountainIndex; i <= lastMountainIndex; i++) {
            // Use index as seed for consistent generation
            const seed = i * 12.3456 + parallaxSpeed * 78.9012;
            
            // Mountain position and properties based on seed
            const baseX = i * spacing + Math.sin(seed * 0.7) * 25;
            const x = baseX - scrollAmount;
            
            const heightVar = Math.sin(seed * 2.71) * Math.cos(seed * 1.41);
            const widthVar = Math.cos(seed * 3.14) * Math.sin(seed * 2.23);
            
            const height = minHeight + (heightVar * 0.5 + 0.5) * (maxHeight - minHeight) + 
                          Math.sin(seed * 4.56) * 18;
            const width = 70 + (widthVar * 0.5 + 0.5) * 80 + Math.cos(seed * 5.67) * 20;
            
            if (x + width < -50 || x > CANVAS_WIDTH + 50) continue;
            
            // Mountain gradient
            const mtGradient = this.ctx.createLinearGradient(
                x + width / 2, CANVAS_HEIGHT - 50 - height,
                x + width / 2, CANVAS_HEIGHT - 50
            );
            mtGradient.addColorStop(0, this.adjustColor(baseColor, 20));
            mtGradient.addColorStop(0.5, baseColor);
            mtGradient.addColorStop(1, this.adjustColor(baseColor, -20));
            
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = mtGradient;
            
            // Varied mountain shapes - asymmetric peaks, different slopes
            const peakOffset = 0.35 + (Math.sin(seed * 8.9) * 0.5 + 0.5) * 0.3; // Peak position varies 0.35-0.65
            const leftSlope = 0.5 + Math.cos(seed * 7.23) * 0.3; // Slope steepness varies
            const rightSlope = 0.6 + Math.sin(seed * 9.45) * 0.3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, CANVAS_HEIGHT - 50);
            
            // Left side with variable curve
            this.ctx.quadraticCurveTo(
                x + width * (peakOffset * 0.5), CANVAS_HEIGHT - 50 - height * leftSlope,
                x + width * peakOffset, CANVAS_HEIGHT - 50 - height
            );
            
            // Right side with different curve
            this.ctx.quadraticCurveTo(
                x + width * (peakOffset + (1 - peakOffset) * 0.6), CANVAS_HEIGHT - 50 - height * rightSlope,
                x + width, CANVAS_HEIGHT - 50
            );
            this.ctx.fill();
            
            // Snow caps on taller mountains (far layer)
            if (height > maxHeight * 0.7 && parallaxSpeed < 0.3) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
                this.ctx.beginPath();
                this.ctx.moveTo(x + width * 0.4, CANVAS_HEIGHT - 50 - height + height * 0.2);
                this.ctx.lineTo(x + width * 0.5, CANVAS_HEIGHT - 50 - height);
                this.ctx.lineTo(x + width * 0.6, CANVAS_HEIGHT - 50 - height + height * 0.15);
                this.ctx.fill();
            }
            
            // Tree silhouettes on mid-layer mountains
            if (parallaxSpeed > 0.2 && parallaxSpeed < 0.35 && height > minHeight + 20) {
                this.drawTreeSilhouettes(x, width, height, opacity);
            }
            
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawTreeSilhouettes(mountainX, mountainWidth, mountainHeight, opacity) {
        this.ctx.fillStyle = `rgba(40, 60, 40, ${opacity * 0.6})`;
        
        const treeCount = Math.floor(mountainWidth / 15);
        for (let i = 0; i < treeCount; i++) {
            const t = i / treeCount;
            const x = mountainX + mountainWidth * (0.15 + t * 0.7);
            
            // Calculate Y on mountain slope
            const distFromPeak = Math.abs(t - 0.5) * 2;
            const slopeY = CANVAS_HEIGHT - 50 - mountainHeight * (1 - distFromPeak * 0.7);
            
            const treeHeight = 8 + Math.sin(i * 3.14) * 4;
            
            // Simple triangle tree
            this.ctx.beginPath();
            this.ctx.moveTo(x, slopeY);
            this.ctx.lineTo(x - 4, slopeY + treeHeight);
            this.ctx.lineTo(x + 4, slopeY + treeHeight);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawAtmosphericHaze() {
        // Gradient haze that adds depth
        const hazeGradient = this.ctx.createLinearGradient(0, 150, 0, CANVAS_HEIGHT - 50);
        hazeGradient.addColorStop(0, 'rgba(180, 200, 220, 0)');
        hazeGradient.addColorStop(0.5, 'rgba(180, 200, 220, 0.1)');
        hazeGradient.addColorStop(1, 'rgba(180, 200, 220, 0.2)');
        
        this.ctx.fillStyle = hazeGradient;
        this.ctx.fillRect(0, 150, CANVAS_WIDTH, CANVAS_HEIGHT - 200);
    }
    
    drawCloudLayers() {
        // Far clouds (small, fast parallax)
        this.drawCloudLayer(0.2, 0.4, 0.6, 40, 100);
        
        // Mid clouds (medium)
        this.drawCloudLayer(0.4, 0.7, 0.8, 80, 180);
        
        // Near clouds (large, slow parallax, more detailed)
        this.drawCloudLayer(0.6, 0.9, 1.0, 120, 220);
    }
    
    drawCloudLayer(parallaxSpeed, opacity, scale, minY, maxY) {
        // PROCEDURAL GENERATION - no wrapping, no glitches!
        const scrollAmount = -this.bgX * parallaxSpeed;
        const spacing = 120; // Cloud spacing
        const firstCloudIndex = Math.floor((scrollAmount - 200) / spacing);
        const lastCloudIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 200) / spacing);
        
        for (let i = firstCloudIndex; i <= lastCloudIndex; i++) {
            // Generate cloud properties from index as seed
            const seed = i * 45.678 + parallaxSpeed * 123.456;
            const baseX = i * spacing + Math.sin(seed * 0.3) * 60;
            const x = baseX - scrollAmount;
            
            // Skip if off screen
            if (x < -150 || x > CANVAS_WIDTH + 150) continue;
            
            // Generate unique cloud properties from seed
            const y = minY + (Math.abs(Math.sin(seed * 1.7)) * (maxY - minY));
            const size = 15 + Math.abs(Math.sin(seed * 2.3)) * 30;
            const puffs = 3 + Math.floor(Math.abs(Math.sin(seed * 3.1)) * 4);
            
            this.ctx.globalAlpha = opacity;
            
            // REALISTIC WHITE CLOUDS - overlapping circles with soft edges
            // KEY LEARNING: Use radial gradients on EACH circle for soft edges
            // Keep color WHITE (255,255,255) throughout
            
            // Cloud shadow first
            for (let p = 0; p < puffs; p++) {
                const puffX = x + p * size * 0.7;
                const puffSize = size * scale * (0.7 + Math.sin(p * 1.5) * 0.3);
                
                // Gradient shadow (gray, fades to transparent)
                const shadowGrad = this.ctx.createRadialGradient(puffX, y + 5, 0, puffX, y + 5, puffSize);
                shadowGrad.addColorStop(0, `rgba(150, 170, 190, ${opacity * 0.3})`);
                shadowGrad.addColorStop(0.7, `rgba(150, 170, 190, ${opacity * 0.15})`);
                shadowGrad.addColorStop(1, 'rgba(150, 170, 190, 0)');
                
                this.ctx.fillStyle = shadowGrad;
                this.ctx.beginPath();
                this.ctx.arc(puffX, y + 5, puffSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Cloud body - WHITE with soft edges
            for (let p = 0; p < puffs; p++) {
                const puffX = x + p * size * 0.7;
                const puffSize = size * scale * (0.8 + Math.sin(p * 1.5 + this.time * 0.01) * 0.2);
                const puffY = y + Math.sin(p * 2 + this.time * 0.02) * 2;
                
                // KEY: Radial gradient on each puff - solid white center, fades at edges
                const puffGrad = this.ctx.createRadialGradient(puffX, puffY, 0, puffX, puffY, puffSize);
                puffGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                puffGrad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity})`);
                puffGrad.addColorStop(1, `rgba(255, 255, 255, 0)`); // Fade to transparent at edges
                
                this.ctx.fillStyle = puffGrad;
                this.ctx.beginPath();
                this.ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawFloatingParticles() {
        // Sunlit dust/pollen particles
        if (!this.floatingParticles) {
            this.floatingParticles = [];
            for (let i = 0; i < 40; i++) {
                this.floatingParticles.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * (CANVAS_HEIGHT - 100),
                    size: 0.5 + Math.random() * 1.5,
                    speed: 0.1 + Math.random() * 0.3,
                    drift: Math.random() * Math.PI * 2,
                    brightness: 0.3 + Math.random() * 0.5
                });
            }
        }
        
        for (const p of this.floatingParticles) {
            // Gentle floating motion
            p.x -= p.speed;
            p.y += Math.sin(this.time * 0.02 + p.drift) * 0.3;
            
            // Wrap
            if (p.x < -5) p.x = CANVAS_WIDTH + 5;
            if (p.y < 0) p.y = CANVAS_HEIGHT - 100;
            if (p.y > CANVAS_HEIGHT - 100) p.y = 0;
            
            // Twinkle effect
            const twinkle = 0.5 + Math.sin(this.time * 0.1 + p.drift) * 0.5;
            
            this.ctx.fillStyle = `rgba(255, 255, 240, ${p.brightness * twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    adjustColor(hexColor, amount) {
        // Helper to lighten/darken a hex color
        const hex = hexColor.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    drawGround() {
        // V4 MAXIMUM: Rich detailed ground
        
        // Dirt layers gradient
        const groundGradient = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - 50, 0, CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#d4c875');
        groundGradient.addColorStop(0.2, '#c9b860');
        groundGradient.addColorStop(0.5, '#b5a550');
        groundGradient.addColorStop(1, '#8a7a40');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
        
        // Rich grass with multiple layers
        this.drawDetailedGrass();
        
        // Ground details (pebbles, flowers)
        this.drawGroundDetails();
    }
    
    drawDetailedGrass() {
        // Back grass layer (darker)
        const backGrass = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - 58, 0, CANVAS_HEIGHT - 50);
        backGrass.addColorStop(0, '#4a8a3a');
        backGrass.addColorStop(1, '#5a9a4a');
        this.ctx.fillStyle = backGrass;
        this.ctx.fillRect(0, CANVAS_HEIGHT - 58, CANVAS_WIDTH, 10);
        
        // Back grass blades with variation
        this.ctx.strokeStyle = '#4a8a3a';
        this.ctx.lineWidth = 1.5;
        for (let x = 0; x < CANVAS_WIDTH; x += 5 + Math.sin(x * 0.2) * 2) {
            const sway = Math.sin(this.time * 0.03 + x * 0.05) * 2;
            const height = 5 + Math.sin(x * 0.23) * 3 + Math.cos(x * 0.41) * 1.5;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, CANVAS_HEIGHT - 55);
            this.ctx.quadraticCurveTo(
                x + sway, CANVAS_HEIGHT - 55 - height / 2,
                x + sway * 1.5, CANVAS_HEIGHT - 55 - height
            );
            this.ctx.stroke();
        }
        
        // Front grass layer (brighter)
        const frontGrass = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - 54, 0, CANVAS_HEIGHT - 48);
        frontGrass.addColorStop(0, '#6ab05a');
        frontGrass.addColorStop(0.5, '#7ec46c');
        frontGrass.addColorStop(1, '#5a9a4a');
        this.ctx.fillStyle = frontGrass;
        this.ctx.fillRect(0, CANVAS_HEIGHT - 54, CANVAS_WIDTH, 6);
        
        // Front grass blades with more variation
        for (let x = 0; x < CANVAS_WIDTH; x += 3.5 + Math.sin(x * 0.17) * 1.5) {
            const sway = Math.sin(this.time * 0.04 + x * 0.08) * 1.5;
            const height = 4 + Math.sin(x * 0.34) * 2 + Math.cos(x * 0.19) * 1;
            
            // Blade with gradient stroke
            const bladeHue = 95 + Math.sin(x * 0.13) * 20;
            this.ctx.strokeStyle = `hsl(${bladeHue}, 50%, ${35 + Math.sin(x * 0.21) * 10}%)`;
            this.ctx.lineWidth = 1;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, CANVAS_HEIGHT - 54);
            this.ctx.quadraticCurveTo(
                x + sway * 0.5, CANVAS_HEIGHT - 54 - height / 2,
                x + sway, CANVAS_HEIGHT - 54 - height
            );
            this.ctx.stroke();
        }
    }
    
    drawGroundDetails() {
        // V4 MAXIMUM: Procedural ground details based on absolute position
        const scrollAmount = -this.bgX * 0.03;
        
        // Calculate visible range
        const startPos = scrollAmount - 50;
        const endPos = scrollAmount + CANVAS_WIDTH + 50;
        
        // Pebbles - generate based on position
        for (let pos = Math.floor(startPos / 20) * 20; pos < endPos; pos += 20) {
            // Use position as seed
            const seed = pos * 0.12345;
            const offset = Math.sin(seed * 3.2) * 15 + Math.cos(seed * 1.7) * 10;
            const actualPos = pos + offset;
            
            const x = actualPos - scrollAmount;
            if (x < -10 || x > CANVAS_WIDTH + 10) continue;
            
            const gray = 70 + Math.sin(seed * 1.5) * 50;
            const alpha = 0.25 + Math.cos(seed * 2.1) * 0.2;
            this.ctx.fillStyle = `rgba(${gray}, ${gray - 20}, ${gray - 30}, ${alpha})`;
            
            const y = CANVAS_HEIGHT - 38 + Math.sin(seed * 2.5) * 8;
            const size = 1.5 + Math.abs(Math.cos(seed * 4.3)) * 2; // Ensure positive
            
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, size, size * 0.6, Math.sin(seed) * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Flowers - generate based on position
        for (let pos = Math.floor(startPos / 60) * 60; pos < endPos; pos += 60) {
            const seed = pos * 0.09876;
            const offset = Math.sin(seed * 2.3) * 30 + Math.cos(seed * 1.6) * 20;
            const actualPos = pos + offset;
            
            const x = actualPos - scrollAmount;
            if (x < -10 || x > CANVAS_WIDTH + 10) continue;
            
            const yOffset = Math.sin(seed * 2.34) * 2 + Math.cos(seed * 3.1) * 1;
            const y = CANVAS_HEIGHT - 54 + yOffset;
            
            // Ultra-varied flower colors and types
            const hue = (seed * 830 + Math.sin(seed * 1.87) * 60 + this.time * 0.3) % 360;
            const petalCount = 4 + Math.floor(Math.sin(seed * 5.2) * 2 + 3); // 4-6 petals
            const petalSize = 1.3 + Math.cos(seed * 3.7) * 0.4;
            
            // Stem with slight curve
            this.ctx.strokeStyle = `hsl(${110 + Math.sin(seed) * 15}, 45%, 35%)`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + 3);
            this.ctx.quadraticCurveTo(x + Math.sin(seed) * 0.5, y - 1, x, y - 4);
            this.ctx.stroke();
            
            // Petals with variation
            this.ctx.fillStyle = `hsl(${hue}, ${60 + Math.sin(seed * 2) * 15}%, ${60 + Math.cos(seed * 3) * 10}%)`;
            for (let p = 0; p < petalCount; p++) {
                const angle = (Math.PI * 2 / petalCount) * p + Math.sin(this.time * 0.01 + seed) * 0.1;
                const px = x + Math.cos(angle) * 2.2;
                const py = y - 5 + Math.sin(angle) * 2.2;
                this.ctx.beginPath();
                this.ctx.arc(px, py, petalSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Varied center
            const centerHue = (hue + 180) % 360;
            this.ctx.fillStyle = `hsl(${centerHue}, 85%, 65%)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 5, 1.1, 0, Math.PI * 2);
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
        // V4 UPGRADE: More dynamic feather burst with variety
        const count = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.5; // Mostly downward/backward
            const speed = 1 + Math.random() * 2;
            
            // V4: Color variation (golds, yellows, with rare white)
            const colorRoll = Math.random();
            let color;
            if (colorRoll < 0.7) {
                const hue = 40 + Math.random() * 20;
                color = `hsl(${hue}, 100%, ${55 + Math.random() * 25}%)`;
            } else if (colorRoll < 0.9) {
                color = '#ffffcc'; // Light yellow
            } else {
                color = '#ffffff'; // Rare white highlight feather
            }
            
            this.particles.push(new Particle(
                this.bird.x - 10,
                this.bird.y,
                Math.cos(angle) * speed - 1, // Drift backward
                Math.sin(angle) * speed,
                color,
                2 + Math.random() * 3,
                40 + Math.random() * 20,
                0.96
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
    // V4 MAXIMUM: MOTION TRAIL SYSTEM
    // ============================================
    
    updateTrail() {
        // Only add trail while playing and bird moving
        if (this.currentState !== GameState.PLAYING) return;
        
        this.trailTimer++;
        
        // Spawn trail point every few frames
        if (this.trailTimer % 3 === 0) {
            this.trail.push({
                x: this.bird.x,
                y: this.bird.y,
                alpha: 0.6,
                size: BIRD_SIZE * 0.4,
                velocity: this.bird.velocity
            });
        }
        
        // Update and remove old trail points
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].alpha -= 0.04;
            this.trail[i].size *= 0.95;
            this.trail[i].x -= 0.5; // Trail drifts back slightly
            
            if (this.trail[i].alpha <= 0) {
                this.trail.splice(i, 1);
            }
        }
    }
    
    drawTrail() {
        for (const point of this.trail) {
            // V4: Gradient trail with glow
            const trailGradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, point.size
            );
            
            // Color shifts based on velocity (red when falling, blue when rising)
            const velColor = point.velocity > 0 
                ? `rgba(255, ${150 - point.velocity * 10}, 50, ${point.alpha})`
                : `rgba(100, ${200 - point.velocity * -10}, 255, ${point.alpha})`;
            
            trailGradient.addColorStop(0, `rgba(255, 230, 100, ${point.alpha})`);
            trailGradient.addColorStop(0.5, velColor);
            trailGradient.addColorStop(1, `rgba(255, 200, 0, 0)`);
            
            this.ctx.fillStyle = trailGradient;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // ============================================
    // V4 MAXIMUM: SCORE POP ANIMATION
    // ============================================
    
    triggerScorePop() {
        this.scorePop = {
            active: true,
            scale: 2.0,
            y: -30,
            alpha: 1.0,
            value: this.score
        };
    }
    
    updateScorePop() {
        if (!this.scorePop.active) return;
        
        // Animate upward and fade out
        this.scorePop.y -= 2;
        this.scorePop.scale *= 0.92; // Shrink
        this.scorePop.alpha -= 0.03;
        
        if (this.scorePop.scale < 1.0) {
            this.scorePop.scale = 1.0;
        }
        
        if (this.scorePop.alpha <= 0) {
            this.scorePop.active = false;
        }
    }
    
    drawScorePop() {
        if (!this.scorePop.active) return;
        
        this.ctx.save();
        
        // Position near bird but floating up
        const popX = this.bird.x + 40;
        const popY = this.bird.y + this.scorePop.y;
        
        // V4: Glowing score text
        this.ctx.font = `bold ${24 * this.scorePop.scale}px Arial`;
        this.ctx.textAlign = 'center';
        
        // Glow effect
        this.ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        this.ctx.shadowBlur = 15;
        
        // Outer stroke
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${this.scorePop.alpha * 0.5})`;
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(`+1`, popX, popY);
        
        // Inner fill with gradient
        this.ctx.fillStyle = `rgba(255, 255, 100, ${this.scorePop.alpha})`;
        this.ctx.fillText(`+1`, popX, popY);
        
        this.ctx.restore();
    }
    
    // V4: Sparkle burst when scoring
    createScoreSparkles() {
        const sparkleCount = 12;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (Math.PI * 2 / sparkleCount) * i + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            
            // Golden sparkles
            const hue = 40 + Math.random() * 20; // Gold-yellow range
            const lightness = 60 + Math.random() * 30;
            const color = `hsl(${hue}, 100%, ${lightness}%)`;
            
            this.particles.push(new Particle(
                this.bird.x + 20, // Slightly ahead of bird
                this.bird.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                3 + Math.random() * 3,
                30 + Math.random() * 20,
                0.95
            ));
        }
    }
    
    // ============================================
    // V4 MAXIMUM: ENHANCED DEATH EXPLOSION
    // ============================================
    
    createDeathExplosion() {
        // More particles, more variety, more drama!
        const particleCount = 40; // More than V2's basic particles
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.3;
            const speed = 3 + Math.random() * 6;
            
            // Mix of feathers, sparks, and smoke
            const type = Math.random();
            let color, size, life, drag;
            
            if (type < 0.4) {
                // Feathers (yellow/gold)
                color = `hsl(${45 + Math.random() * 20}, 100%, ${50 + Math.random() * 30}%)`;
                size = 6 + Math.random() * 8;
                life = 60 + Math.random() * 30;
                drag = 0.97;
            } else if (type < 0.7) {
                // Sparks (white/yellow, fast fade)
                color = `hsl(${50 + Math.random() * 10}, 100%, ${80 + Math.random() * 20}%)`;
                size = 2 + Math.random() * 4;
                life = 20 + Math.random() * 20;
                drag = 0.99;
            } else {
                // Smoke (gray, slow)
                const gray = 100 + Math.random() * 80;
                color = `rgb(${gray}, ${gray}, ${gray})`;
                size = 10 + Math.random() * 15;
                life = 80 + Math.random() * 40;
                drag = 0.94;
            }
            
            this.particles.push(new Particle(
                this.bird.x,
                this.bird.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2, // Slight upward bias
                color,
                size,
                life,
                drag
            ));
        }
        
        // V4: Add shockwave ring effect
        this.createShockwave(this.bird.x, this.bird.y);
    }
    
    createShockwave(x, y) {
        // Create expanding ring particles
        const ringParticles = 24;
        for (let i = 0; i < ringParticles; i++) {
            const angle = (Math.PI * 2 / ringParticles) * i;
            const speed = 6;
            
            this.particles.push(new Particle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                'rgba(255, 255, 255, 0.8)',
                3,
                25,
                0.92
            ));
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
