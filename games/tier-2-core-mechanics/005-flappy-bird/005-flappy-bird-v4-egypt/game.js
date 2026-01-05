// ============================================
// FLAPPY SCARAB - EGYPTIAN DESERT ADVENTURE
// ============================================
// V4 Egypt: Complete visual & audio theme change
// Same mechanics, entirely new aesthetic
// Pyramids, Sphinx, Desert, Scarab Beetle

// ============================================
// CONSTANTS
// ============================================

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

// Scarab physics (same as bird)
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const MAX_FALL_SPEED = 10;
const SCARAB_SIZE = 34;

// Pillar configuration (same as pipes)
const PILLAR_WIDTH = 52;
const PILLAR_GAP_START = 200;
const PILLAR_GAP_MIN = 140;
const PILLAR_SPEED = 2;
const PILLAR_SPAWN_DISTANCE = 200;

// Game states
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Egyptian Color Palette
const COLORS = {
    // Sky gradient (sunset)
    skyTop: '#1a0a2e',
    skyMid: '#4a1942',
    skyBottom: '#c9634a',
    skyHorizon: '#f4a460',
    
    // Sun
    sunCore: '#fff4e0',
    sunGlow: '#ffd700',
    sunRays: '#ff8c00',
    
    // Sand
    sandLight: '#f4d03f',
    sandMid: '#d4a84b',
    sandDark: '#b8860b',
    sandShadow: '#8b6914',
    
    // Stone (pillars)
    stoneLight: '#d4c4a8',
    stoneMid: '#b8a88c',
    stoneDark: '#8c7a5c',
    stoneShadow: '#5c4a3c',
    
    // Pyramids
    pyramidFar: '#c9a87c',
    pyramidMid: '#b8956c',
    pyramidNear: '#a0825c',
    
    // Scarab
    scarabGold: '#ffd700',
    scarabBlue: '#1e90ff',
    scarabShine: '#fffacd',
    
    // Accents
    gold: '#ffd700',
    hieroglyph: '#8b4513',
    palmGreen: '#228b22',
    palmDark: '#006400'
};

// ============================================
// PARTICLE SYSTEM
// ============================================

class Particle {
    constructor(x, y, vx, vy, color, size = 4, life = 60, drag = 0.98) {
        this.x = x;
        this.y = y;
        if (typeof vx === 'string') {
            this.color = vx;
            this.size = vy || 4;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4 - 2;
            this.maxLife = 60;
            this.life = this.maxLife;
            this.drag = 0.98;
        } else {
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
        this.vy += this.gravity;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.life--;
        return this.life > 0;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);
        
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
// GAME CLASS - PART 1: Constructor & Setup
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.currentState = GameState.MENU;
        this.score = 0;
        this.highScore = 0;
        
        // Scarab (player)
        this.scarab = {
            x: 100,
            y: CANVAS_HEIGHT / 2,
            velocity: 0,
            rotation: 0,
            wingAngle: 0,
            wingOpen: 0,
            trail: []
        };
        
        // Pillars (obstacles)
        this.pillars = [];
        this.pillarSpawnTimer = 0;
        
        // Visual effects
        this.particles = [];
        this.shake = { x: 0, y: 0, intensity: 0 };
        this.sandParticles = [];
        this.trail = [];
        this.trailTimer = 0;
        this.scorePop = { active: false, scale: 1, y: 0 };
        
        // Animation time
        this.time = 0;
        
        // Background scrolling - NO WRAPPING (learned from V4!)
        this.bgX = 0;
        
        // Load saved data
        this.loadData();
        
        // Initialize
        this.setupUI();
        this.setupControls();
    }
    
    // Seeded random for procedural generation
    seededRandom(seed, min = 0, max = 1) {
        const x = Math.sin(seed) * 10000;
        const rand = x - Math.floor(x);
        return min + rand * (max - min);
    }
    
    loadData() {
        const saved = localStorage.getItem('flappyScarabHighScore');
        if (saved) this.highScore = parseInt(saved);
    }
    
    saveData() {
        localStorage.setItem('flappyScarabHighScore', this.highScore.toString());
    }
    
    setupUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    setupControls() {
        const handleInput = () => {
            audioSystem.init();
            audioSystem.resume();
            
            if (this.currentState === GameState.MENU) {
                this.startGame();
            } else if (this.currentState === GameState.PLAYING) {
                this.flap();
            } else if (this.currentState === GameState.GAME_OVER) {
                this.resetGame();
            }
        };
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleInput();
            }
        });
        
        this.canvas.addEventListener('click', handleInput);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInput();
        });
    }

    // ============================================
    // GAME ACTIONS
    // ============================================
    
    startGame() {
        this.currentState = GameState.PLAYING;
        this.score = 0;
        this.pillars = [];
        this.particles = [];
        this.trail = [];
        this.scarab.y = CANVAS_HEIGHT / 2;
        this.scarab.velocity = 0;
        this.scarab.rotation = 0;
        this.pillarSpawnTimer = 0;
        
        audioSystem.startMusic();
        audioSystem.playMenuSelect();
        
        this.updateUI();
    }
    
    flap() {
        this.scarab.velocity = FLAP_STRENGTH;
        this.scarab.wingOpen = 1;
        
        // Golden sparkle particles
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(
                this.scarab.x,
                this.scarab.y + SCARAB_SIZE / 2,
                (Math.random() - 0.5) * 3,
                Math.random() * 2 + 1,
                COLORS.gold,
                3,
                30,
                0.95
            ));
        }
        
        audioSystem.playFlap();
    }
    
    resetGame() {
        this.currentState = GameState.MENU;
        this.scarab.y = CANVAS_HEIGHT / 2;
        this.scarab.velocity = 0;
        this.scarab.rotation = 0;
        this.pillars = [];
        this.particles = [];
        this.trail = [];
        
        audioSystem.stopMusic();
        audioSystem.playMenuSelect();
    }
    
    gameOver() {
        this.currentState = GameState.GAME_OVER;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveData();
        }
        
        // Death explosion - sand and gold particles
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            const color = Math.random() > 0.5 ? COLORS.gold : COLORS.sandMid;
            this.particles.push(new Particle(
                this.scarab.x,
                this.scarab.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                4 + Math.random() * 4,
                60,
                0.96
            ));
        }
        
        this.shake.intensity = 15;
        audioSystem.stopMusic();
        audioSystem.playDeath();
        
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    // ============================================
    // PILLAR (OBSTACLE) MANAGEMENT
    // ============================================
    
    spawnPillar() {
        const minY = 100;
        const maxY = CANVAS_HEIGHT - 100 - PILLAR_GAP_START;
        const gapY = minY + Math.random() * (maxY - minY);
        
        const gap = Math.max(PILLAR_GAP_MIN, PILLAR_GAP_START - this.score * 2);
        
        // Add hieroglyph pattern seed for each pillar
        this.pillars.push({
            x: CANVAS_WIDTH,
            gapY: gapY,
            gapHeight: gap,
            scored: false,
            seed: Math.random() * 10000 // For hieroglyph patterns
        });
    }
    
    getCurrentGap() {
        return Math.max(PILLAR_GAP_MIN, PILLAR_GAP_START - this.score * 2);
    }

    // ============================================
    // DRAWING: SKY & ATMOSPHERE
    // ============================================
    
    drawSky() {
        const ctx = this.ctx;
        
        // Sunset gradient - deep purple to orange
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        skyGrad.addColorStop(0, COLORS.skyTop);
        skyGrad.addColorStop(0.3, COLORS.skyMid);
        skyGrad.addColorStop(0.6, COLORS.skyBottom);
        skyGrad.addColorStop(0.85, COLORS.skyHorizon);
        skyGrad.addColorStop(1, COLORS.sandLight);
        
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    drawSun() {
        const ctx = this.ctx;
        const sunX = 320;
        const sunY = 120;
        const sunRadius = 50;
        
        // Outer glow
        const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
        glowGrad.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
        glowGrad.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
        glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun rays (animated)
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(this.time * 0.001);
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const rayLength = sunRadius * (1.5 + Math.sin(this.time * 0.003 + i) * 0.3);
            
            ctx.save();
            ctx.rotate(angle);
            
            const rayGrad = ctx.createLinearGradient(sunRadius * 0.8, 0, rayLength, 0);
            rayGrad.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
            rayGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
            
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(sunRadius * 0.8, -8);
            ctx.lineTo(rayLength, 0);
            ctx.lineTo(sunRadius * 0.8, 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        ctx.restore();
        
        // Sun core
        const coreGrad = ctx.createRadialGradient(sunX - 10, sunY - 10, 0, sunX, sunY, sunRadius);
        coreGrad.addColorStop(0, '#fffef0');
        coreGrad.addColorStop(0.5, COLORS.sunCore);
        coreGrad.addColorStop(0.8, COLORS.sunGlow);
        coreGrad.addColorStop(1, COLORS.sunRays);
        
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawHeatShimmer() {
        // Enhanced heat distortion effect near horizon
        const ctx = this.ctx;
        const horizonY = CANVAS_HEIGHT * 0.65;
        
        ctx.save();
        
        // Multiple shimmer layers for depth
        for (let layer = 0; layer < 3; layer++) {
            const layerY = horizonY + layer * 40;
            const intensity = 0.08 - layer * 0.02;
            
            ctx.globalAlpha = intensity;
            
            for (let i = 0; i < 8; i++) {
                const x = (i * 60 + this.time * 0.5 * (layer + 1)) % (CANVAS_WIDTH + 60) - 30;
                const waveY = layerY + Math.sin(this.time * 0.008 + i * 0.7 + layer) * (8 - layer * 2);
                const width = 40 + Math.sin(this.time * 0.01 + i) * 10;
                
                // Create wavy shimmer gradient
                const shimmerGrad = ctx.createLinearGradient(x, waveY - 5, x, waveY + 15);
                shimmerGrad.addColorStop(0, 'rgba(255, 250, 240, 0)');
                shimmerGrad.addColorStop(0.3, 'rgba(255, 250, 240, 1)');
                shimmerGrad.addColorStop(0.5, 'rgba(255, 245, 230, 0.8)');
                shimmerGrad.addColorStop(0.7, 'rgba(255, 250, 240, 1)');
                shimmerGrad.addColorStop(1, 'rgba(255, 250, 240, 0)');
                
                ctx.fillStyle = shimmerGrad;
                ctx.beginPath();
                ctx.ellipse(x, waveY, width, 6 - layer, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    drawDesertBirds() {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * 0.05;
        const spacing = 600;
        
        const firstIndex = Math.floor((scrollAmount - 100) / spacing);
        const lastIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 100) / spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 78.901;
            const x = i * spacing - scrollAmount + this.seededRandom(seed, -100, 100);
            const y = this.seededRandom(seed + 1, 50, 150);
            const size = this.seededRandom(seed + 2, 3, 6);
            
            // Draw falcon/ibis silhouette
            ctx.fillStyle = 'rgba(30, 20, 10, 0.6)';
            
            // Simple bird shape - body
            ctx.beginPath();
            const wingOffset = Math.sin(this.time * 0.015 + seed) * 3;
            
            // Body
            ctx.ellipse(x, y, size * 2, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Wings
            ctx.beginPath();
            ctx.moveTo(x - size, y);
            ctx.quadraticCurveTo(x - size * 2, y - size - wingOffset, x - size * 3, y + wingOffset);
            ctx.lineTo(x - size, y);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.quadraticCurveTo(x + size * 2, y - size - wingOffset, x + size * 3, y + wingOffset);
            ctx.lineTo(x + size, y);
            ctx.fill();
        }
    }
    
    // ============================================
    // DRAWING: PYRAMIDS & SPHINX
    // ============================================
    
    drawPyramidLayer(parallaxSpeed, baseY, minSize, maxSize, color, shadowColor, spacing) {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * parallaxSpeed;
        
        const firstIndex = Math.floor((scrollAmount - maxSize) / spacing);
        const lastIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + maxSize) / spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 12.345 + parallaxSpeed * 100;
            const x = i * spacing - scrollAmount + this.seededRandom(seed, -50, 50);
            const size = this.seededRandom(seed + 1, minSize, maxSize);
            const height = size * 0.7;
            
            // Pyramid base Y
            const y = baseY;
            
            // Draw pyramid shadow side (left) - base shape
            ctx.fillStyle = shadowColor;
            ctx.beginPath();
            ctx.moveTo(x, y - height);
            ctx.lineTo(x - size / 2, y);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.fill();
            
            // Draw pyramid lit side (right) - base shape
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y - height);
            ctx.lineTo(x + size / 2, y);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.fill();
            
            // Add brick texture for larger pyramids
            if (size > 60) {
                this.drawPyramidBricks(x, y, size, height, parallaxSpeed > 0.2);
            }
            
            // Edge highlight (sunlit edge)
            ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y - height);
            ctx.lineTo(x + size / 2, y);
            ctx.stroke();
            
            // Add entrance for very large pyramids
            if (size > 100 && this.seededRandom(seed + 5, 0, 1) > 0.5) {
                this.drawPyramidEntrance(x, y, size);
            }
        }
    }
    
    drawPyramidBricks(x, y, size, height, isNear) {
        const ctx = this.ctx;
        const brickRows = isNear ? 12 : 8;
        
        ctx.save();
        
        // Clip to pyramid shape for brick rendering
        ctx.beginPath();
        ctx.moveTo(x, y - height);
        ctx.lineTo(x - size / 2, y);
        ctx.lineTo(x + size / 2, y);
        ctx.closePath();
        ctx.clip();
        
        // Draw horizontal brick lines
        for (let row = 0; row < brickRows; row++) {
            const rowY = y - (row / brickRows) * height;
            const rowWidth = (size * (brickRows - row)) / brickRows;
            const brickHeight = height / brickRows;
            
            // Horizontal mortar line
            ctx.strokeStyle = 'rgba(80, 60, 40, 0.4)';
            ctx.lineWidth = isNear ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(x - rowWidth / 2, rowY);
            ctx.lineTo(x + rowWidth / 2, rowY);
            ctx.stroke();
            
            // Vertical brick divisions
            const bricksInRow = Math.max(2, Math.floor(rowWidth / (isNear ? 15 : 20)));
            const brickWidth = rowWidth / bricksInRow;
            const offset = (row % 2) * (brickWidth / 2); // Stagger bricks
            
            for (let b = 0; b < bricksInRow; b++) {
                const brickX = x - rowWidth / 2 + b * brickWidth + offset;
                
                // Vertical mortar line
                ctx.beginPath();
                ctx.moveTo(brickX, rowY);
                ctx.lineTo(brickX, rowY - brickHeight);
                ctx.stroke();
                
                // Individual brick shading variation
                if (isNear && Math.random() > 0.7) {
                    const brickShade = Math.random() * 0.1;
                    ctx.fillStyle = `rgba(0, 0, 0, ${brickShade})`;
                    ctx.fillRect(brickX, rowY - brickHeight, brickWidth * 0.9, brickHeight * 0.9);
                }
            }
        }
        
        // Weathering effect - sandy texture overlay
        ctx.globalAlpha = 0.15;
        for (let w = 0; w < (isNear ? 30 : 15); w++) {
            const wx = x + (Math.random() - 0.5) * size * 0.8;
            const wy = y - Math.random() * height * 0.9;
            const wsize = Math.random() * 4 + 2;
            
            ctx.fillStyle = Math.random() > 0.5 ? '#d4b896' : '#a08060';
            ctx.beginPath();
            ctx.arc(wx, wy, wsize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawPyramidEntrance(x, y, size) {
        const ctx = this.ctx;
        const entranceWidth = size * 0.08;
        const entranceHeight = size * 0.12;
        const entranceX = x + size * 0.05;
        const entranceY = y - size * 0.15;
        
        // Dark entrance
        ctx.fillStyle = '#1a0a05';
        ctx.beginPath();
        ctx.moveTo(entranceX, entranceY);
        ctx.lineTo(entranceX - entranceWidth / 2, entranceY + entranceHeight);
        ctx.lineTo(entranceX + entranceWidth / 2, entranceY + entranceHeight);
        ctx.closePath();
        ctx.fill();
        
        // Entrance frame
        ctx.strokeStyle = '#5c4a3c';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawSphinx(parallaxSpeed) {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * parallaxSpeed;
        const spacing = 1200; // One sphinx per long distance
        
        const firstIndex = Math.floor((scrollAmount - 200) / spacing);
        const lastIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 200) / spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 999.123;
            const x = i * spacing - scrollAmount;
            const baseY = 380;
            const scale = 0.8;
            
            ctx.save();
            ctx.translate(x, baseY);
            ctx.scale(scale, scale);
            
            // Shadow on ground
            ctx.fillStyle = 'rgba(60, 40, 20, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 10, 100, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Back haunches
            const haunchGrad = ctx.createLinearGradient(-80, -40, -60, 0);
            haunchGrad.addColorStop(0, '#a08060');
            haunchGrad.addColorStop(1, '#806040');
            ctx.fillStyle = haunchGrad;
            ctx.beginPath();
            ctx.moveTo(-90, 0);
            ctx.quadraticCurveTo(-100, -25, -85, -40);
            ctx.quadraticCurveTo(-70, -45, -50, -35);
            ctx.lineTo(-50, 0);
            ctx.closePath();
            ctx.fill();
            
            // Main body
            const bodyGrad = ctx.createLinearGradient(-60, -50, 60, 0);
            bodyGrad.addColorStop(0, '#c9a87c');
            bodyGrad.addColorStop(0.3, '#d4b896');
            bodyGrad.addColorStop(0.7, '#b8956c');
            bodyGrad.addColorStop(1, '#a08060');
            
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-50, 0);
            ctx.lineTo(-50, -35);
            ctx.quadraticCurveTo(-30, -45, 0, -40);
            ctx.quadraticCurveTo(40, -35, 70, -30);
            ctx.lineTo(85, 0);
            ctx.closePath();
            ctx.fill();
            
            // Body texture - subtle stripes
            ctx.strokeStyle = 'rgba(100, 70, 40, 0.2)';
            ctx.lineWidth = 1;
            for (let stripe = 0; stripe < 5; stripe++) {
                const sy = -35 + stripe * 8;
                ctx.beginPath();
                ctx.moveTo(-45, sy);
                ctx.quadraticCurveTo(0, sy - 3, 70, sy + 5);
                ctx.stroke();
            }
            
            // Front paws - stretched out
            const pawGrad = ctx.createLinearGradient(70, -15, 120, 0);
            pawGrad.addColorStop(0, '#c9a87c');
            pawGrad.addColorStop(1, '#b8956c');
            
            ctx.fillStyle = pawGrad;
            // Left paw
            ctx.beginPath();
            ctx.moveTo(70, -5);
            ctx.lineTo(110, -8);
            ctx.quadraticCurveTo(125, -5, 120, 5);
            ctx.lineTo(70, 5);
            ctx.closePath();
            ctx.fill();
            
            // Right paw (slightly behind)
            ctx.fillStyle = '#a08060';
            ctx.beginPath();
            ctx.moveTo(65, 5);
            ctx.lineTo(105, 2);
            ctx.quadraticCurveTo(118, 5, 115, 12);
            ctx.lineTo(65, 12);
            ctx.closePath();
            ctx.fill();
            
            // Paw details - toes
            ctx.strokeStyle = 'rgba(80, 50, 30, 0.4)';
            ctx.lineWidth = 1;
            for (let toe = 0; toe < 3; toe++) {
                ctx.beginPath();
                ctx.moveTo(105 + toe * 5, -6);
                ctx.lineTo(115 + toe * 3, 0);
                ctx.stroke();
            }
            
            // Chest/front
            const chestGrad = ctx.createLinearGradient(50, -40, 70, 0);
            chestGrad.addColorStop(0, '#d4b896');
            chestGrad.addColorStop(1, '#c9a87c');
            
            ctx.fillStyle = chestGrad;
            ctx.beginPath();
            ctx.moveTo(50, -35);
            ctx.quadraticCurveTo(65, -30, 75, -15);
            ctx.lineTo(70, 0);
            ctx.lineTo(50, 0);
            ctx.closePath();
            ctx.fill();
            
            // Neck
            const neckGrad = ctx.createLinearGradient(30, -70, 55, -35);
            neckGrad.addColorStop(0, '#d4b896');
            neckGrad.addColorStop(1, '#b8956c');
            
            ctx.fillStyle = neckGrad;
            ctx.beginPath();
            ctx.moveTo(35, -35);
            ctx.quadraticCurveTo(40, -55, 35, -70);
            ctx.lineTo(55, -70);
            ctx.quadraticCurveTo(60, -50, 55, -35);
            ctx.closePath();
            ctx.fill();
            
            // Head
            const headGrad = ctx.createRadialGradient(40, -85, 5, 45, -80, 35);
            headGrad.addColorStop(0, '#e0c8a0');
            headGrad.addColorStop(0.5, '#d4b896');
            headGrad.addColorStop(1, '#b8956c');
            
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.moveTo(20, -70);
            ctx.quadraticCurveTo(15, -95, 30, -105);
            ctx.quadraticCurveTo(45, -110, 60, -100);
            ctx.quadraticCurveTo(70, -90, 65, -70);
            ctx.closePath();
            ctx.fill();
            
            // Nemes headdress (striped cloth)
            const nemesGrad = ctx.createLinearGradient(10, -100, 20, -50);
            nemesGrad.addColorStop(0, '#e6c84a');
            nemesGrad.addColorStop(0.5, '#c9a227');
            nemesGrad.addColorStop(1, '#a07820');
            
            // Left side of nemes
            ctx.fillStyle = nemesGrad;
            ctx.beginPath();
            ctx.moveTo(20, -95);
            ctx.quadraticCurveTo(5, -85, 0, -60);
            ctx.lineTo(5, -45);
            ctx.lineTo(25, -45);
            ctx.lineTo(30, -70);
            ctx.quadraticCurveTo(25, -85, 25, -95);
            ctx.closePath();
            ctx.fill();
            
            // Right side of nemes
            ctx.beginPath();
            ctx.moveTo(55, -95);
            ctx.quadraticCurveTo(70, -85, 75, -60);
            ctx.lineTo(70, -45);
            ctx.lineTo(50, -45);
            ctx.lineTo(45, -70);
            ctx.quadraticCurveTo(50, -85, 50, -95);
            ctx.closePath();
            ctx.fill();
            
            // Nemes stripes
            ctx.strokeStyle = '#1a4a8a';
            ctx.lineWidth = 2;
            for (let stripe = 0; stripe < 4; stripe++) {
                const stripeY = -90 + stripe * 12;
                // Left stripes
                ctx.beginPath();
                ctx.moveTo(10 - stripe * 2, stripeY);
                ctx.lineTo(25 - stripe, stripeY + 3);
                ctx.stroke();
                // Right stripes  
                ctx.beginPath();
                ctx.moveTo(65 + stripe * 2, stripeY);
                ctx.lineTo(50 + stripe, stripeY + 3);
                ctx.stroke();
            }
            
            // Face features
            // Forehead/brow
            ctx.fillStyle = '#c9a87c';
            ctx.beginPath();
            ctx.moveTo(25, -90);
            ctx.quadraticCurveTo(40, -95, 55, -90);
            ctx.quadraticCurveTo(55, -85, 40, -82);
            ctx.quadraticCurveTo(25, -85, 25, -90);
            ctx.closePath();
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#1a0a05';
            // Left eye
            ctx.beginPath();
            ctx.ellipse(32, -82, 5, 3, -0.1, 0, Math.PI * 2);
            ctx.fill();
            // Right eye
            ctx.beginPath();
            ctx.ellipse(52, -82, 5, 3, 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye outlines (kohl)
            ctx.strokeStyle = '#1a0a05';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(25, -82);
            ctx.quadraticCurveTo(32, -85, 40, -82);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(45, -82);
            ctx.quadraticCurveTo(52, -85, 60, -82);
            ctx.stroke();
            
            // Nose
            const noseGrad = ctx.createLinearGradient(38, -80, 48, -70);
            noseGrad.addColorStop(0, '#c9a87c');
            noseGrad.addColorStop(1, '#a08060');
            ctx.fillStyle = noseGrad;
            ctx.beginPath();
            ctx.moveTo(38, -80);
            ctx.lineTo(42, -68);
            ctx.lineTo(48, -68);
            ctx.lineTo(52, -80);
            ctx.quadraticCurveTo(45, -78, 38, -80);
            ctx.closePath();
            ctx.fill();
            
            // Nose shadow/nostril hint
            ctx.fillStyle = 'rgba(60, 40, 20, 0.3)';
            ctx.beginPath();
            ctx.ellipse(43, -69, 2, 1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(47, -69, 2, 1, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Mouth
            ctx.strokeStyle = '#806040';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(35, -64);
            ctx.quadraticCurveTo(45, -60, 55, -64);
            ctx.stroke();
            
            // Lips
            ctx.fillStyle = '#b8956c';
            ctx.beginPath();
            ctx.moveTo(35, -64);
            ctx.quadraticCurveTo(45, -62, 55, -64);
            ctx.quadraticCurveTo(45, -58, 35, -64);
            ctx.closePath();
            ctx.fill();
            
            // Chin/beard (ceremonial)
            ctx.fillStyle = '#a07820';
            ctx.beginPath();
            ctx.moveTo(40, -60);
            ctx.lineTo(38, -45);
            ctx.quadraticCurveTo(45, -42, 52, -45);
            ctx.lineTo(50, -60);
            ctx.closePath();
            ctx.fill();
            
            // Beard stripes
            ctx.strokeStyle = '#1a4a8a';
            ctx.lineWidth = 1;
            for (let bs = 0; bs < 3; bs++) {
                ctx.beginPath();
                ctx.moveTo(39 + bs * 4, -58);
                ctx.lineTo(39 + bs * 4, -46);
                ctx.stroke();
            }
            
            // Uraeus (cobra) on forehead
            ctx.fillStyle = '#c9a227';
            ctx.beginPath();
            ctx.moveTo(40, -100);
            ctx.quadraticCurveTo(42, -108, 45, -105);
            ctx.quadraticCurveTo(48, -108, 50, -100);
            ctx.lineTo(45, -95);
            ctx.closePath();
            ctx.fill();
            
            // Cobra head
            ctx.fillStyle = '#e6c84a';
            ctx.beginPath();
            ctx.arc(45, -107, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Cobra eyes
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(43, -108, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(47, -108, 1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // ============================================
    // DRAWING: SAND DUNES & GROUND
    // ============================================
    
    drawSandDunes(parallaxSpeed, baseY, amplitude, color, shadowColor) {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * parallaxSpeed;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT);
        
        // Create rolling dune shape
        for (let x = 0; x <= CANVAS_WIDTH; x += 5) {
            const worldX = x + scrollAmount;
            // Combine multiple sine waves for natural dune shape
            const y = baseY + 
                Math.sin(worldX * 0.008) * amplitude +
                Math.sin(worldX * 0.015 + 1) * (amplitude * 0.5) +
                Math.sin(worldX * 0.003) * (amplitude * 0.3);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();
        
        // Wind-blown sand texture on dune ridges
        ctx.save();
        ctx.globalAlpha = 0.15;
        for (let x = 0; x <= CANVAS_WIDTH; x += 8) {
            const worldX = x + scrollAmount;
            const duneY = baseY + 
                Math.sin(worldX * 0.008) * amplitude +
                Math.sin(worldX * 0.015 + 1) * (amplitude * 0.5) +
                Math.sin(worldX * 0.003) * (amplitude * 0.3);
            
            // Only add texture near the ridge line
            const gradient = Math.cos(worldX * 0.008) * Math.sin(worldX * 0.015 + 1);
            if (Math.abs(gradient) > 0.3) {
                // Wind streak
                ctx.strokeStyle = COLORS.sandLight;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, duneY + 2);
                ctx.lineTo(x + 15, duneY + 4);
                ctx.stroke();
            }
        }
        ctx.restore();
        
        // Shadow on dunes (lee side)
        ctx.fillStyle = shadowColor;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT);
        
        for (let x = 0; x <= CANVAS_WIDTH; x += 5) {
            const worldX = x + scrollAmount;
            const y = baseY + 
                Math.sin(worldX * 0.008) * amplitude +
                Math.sin(worldX * 0.015 + 1) * (amplitude * 0.5) +
                Math.sin(worldX * 0.003) * (amplitude * 0.3);
            
            // Shadow offset varies with dune slope
            const slope = Math.cos(worldX * 0.008) * amplitude * 0.008;
            const shadowOffset = slope > 0 ? 8 + slope * 50 : 3;
            ctx.lineTo(x, y + shadowOffset);
        }
        
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Dune ripple texture (wind patterns)
        this.drawDuneRipples(parallaxSpeed, baseY, amplitude);
    }
    
    drawDuneRipples(parallaxSpeed, baseY, amplitude) {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * parallaxSpeed;
        
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = COLORS.sandShadow;
        ctx.lineWidth = 1;
        
        // Ripple lines following dune contours
        for (let ripple = 0; ripple < 6; ripple++) {
            const rippleOffset = ripple * 12 + 15;
            
            ctx.beginPath();
            for (let x = 0; x <= CANVAS_WIDTH; x += 8) {
                const worldX = x + scrollAmount;
                const duneY = baseY + 
                    Math.sin(worldX * 0.008) * amplitude +
                    Math.sin(worldX * 0.015 + 1) * (amplitude * 0.5) +
                    Math.sin(worldX * 0.003) * (amplitude * 0.3);
                
                // Small perpendicular ripples
                const rippleY = duneY + rippleOffset + Math.sin(worldX * 0.1 + ripple) * 1.5;
                
                if (x === 0) {
                    ctx.moveTo(x, rippleY);
                } else {
                    ctx.lineTo(x, rippleY);
                }
            }
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawPalmTrees(parallaxSpeed) {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * parallaxSpeed;
        const spacing = 300;
        
        const firstIndex = Math.floor((scrollAmount - 100) / spacing);
        const lastIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 100) / spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 56.789;
            const x = i * spacing - scrollAmount + this.seededRandom(seed, -80, 80);
            const baseY = 520;
            const height = this.seededRandom(seed + 1, 60, 100);
            const lean = this.seededRandom(seed + 2, -10, 10);
            
            // Wind sway - entire tree moves slightly
            const windSway = Math.sin(this.time * 0.002 + seed) * 3;
            
            ctx.save();
            ctx.translate(x, baseY);
            
            // Tree shadow on ground
            ctx.fillStyle = 'rgba(60, 40, 20, 0.2)';
            ctx.beginPath();
            ctx.ellipse(20, 5, 40, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Trunk base (wider)
            const trunkGrad = ctx.createLinearGradient(-8, 0, 8, 0);
            trunkGrad.addColorStop(0, '#5c3d2e');
            trunkGrad.addColorStop(0.3, '#8b5a2b');
            trunkGrad.addColorStop(0.7, '#a0724a');
            trunkGrad.addColorStop(1, '#6b4423');
            
            // Draw textured trunk
            ctx.fillStyle = trunkGrad;
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            
            // Curved trunk with segments
            const segments = 8;
            for (let s = 0; s <= segments; s++) {
                const t = s / segments;
                const segX = lean * t + windSway * t * t;
                const segY = -height * t;
                const width = 6 - t * 3; // Taper toward top
                
                if (s === 0) {
                    ctx.lineTo(-width, segY);
                } else {
                    ctx.lineTo(segX - width, segY);
                }
            }
            
            // Back down the other side
            for (let s = segments; s >= 0; s--) {
                const t = s / segments;
                const segX = lean * t + windSway * t * t;
                const segY = -height * t;
                const width = 6 - t * 3;
                
                ctx.lineTo(segX + width, segY);
            }
            ctx.closePath();
            ctx.fill();
            
            // Trunk ring texture
            ctx.strokeStyle = '#4a2e1c';
            ctx.lineWidth = 1.5;
            for (let ring = 1; ring < segments; ring++) {
                const t = ring / segments;
                const ringX = lean * t + windSway * t * t;
                const ringY = -height * t;
                const width = 6 - t * 3;
                
                ctx.beginPath();
                ctx.moveTo(ringX - width, ringY);
                ctx.quadraticCurveTo(ringX, ringY + 3, ringX + width, ringY);
                ctx.stroke();
                
                // Fiber texture
                if (ring % 2 === 0) {
                    ctx.strokeStyle = 'rgba(90, 60, 40, 0.4)';
                    ctx.beginPath();
                    ctx.moveTo(ringX - width * 0.5, ringY);
                    ctx.lineTo(ringX - width * 0.3, ringY - height / segments * 0.8);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(ringX + width * 0.5, ringY);
                    ctx.lineTo(ringX + width * 0.3, ringY - height / segments * 0.8);
                    ctx.stroke();
                    ctx.strokeStyle = '#4a2e1c';
                }
            }
            
            // Crown position
            const topX = lean + windSway;
            const topY = -height;
            
            // Dead frond stubs at top of trunk
            ctx.strokeStyle = '#6b4423';
            ctx.lineWidth = 3;
            for (let stub = 0; stub < 3; stub++) {
                const stubAngle = (stub / 3) * Math.PI - Math.PI * 0.5;
                ctx.beginPath();
                ctx.moveTo(topX, topY + 5);
                ctx.lineTo(topX + Math.cos(stubAngle) * 8, topY + 5 + Math.sin(stubAngle) * 5);
                ctx.stroke();
            }
            
            // Palm fronds - more detailed
            const frondCount = 9;
            
            for (let f = 0; f < frondCount; f++) {
                const baseAngle = (f / frondCount) * Math.PI * 1.8 - Math.PI * 0.9;
                const frondLength = 45 + this.seededRandom(seed + f + 10, -8, 8);
                
                // Individual frond sway
                const frondSway = Math.sin(this.time * 0.004 + seed + f * 0.5) * 0.1;
                const angle = baseAngle + frondSway + windSway * 0.01;
                
                // Frond droops more at the end
                const droop = Math.abs(Math.cos(baseAngle)) * 0.3;
                
                const endX = topX + Math.cos(angle) * frondLength;
                const endY = topY + Math.sin(angle) * frondLength * 0.5 + droop * frondLength;
                
                // Control point for curve
                const cpX = topX + Math.cos(angle) * frondLength * 0.6;
                const cpY = topY + Math.sin(angle) * frondLength * 0.3;
                
                // Frond stem (rachis)
                const stemGrad = ctx.createLinearGradient(topX, topY, endX, endY);
                stemGrad.addColorStop(0, '#4a7c3a');
                stemGrad.addColorStop(1, '#2d5a1e');
                
                ctx.strokeStyle = stemGrad;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(topX, topY);
                ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                ctx.stroke();
                
                // Leaflets along the frond
                const leafletCount = 12;
                for (let l = 1; l < leafletCount; l++) {
                    const lt = l / leafletCount;
                    
                    // Position along curve (approximate)
                    const lx = topX + (cpX - topX) * lt * 2 * (1 - lt) + (endX - topX) * lt * lt * 2;
                    const ly = topY + (cpY - topY) * lt * 2 * (1 - lt) + (endY - topY) * lt * lt * 2;
                    
                    // Leaflet angle perpendicular to stem + slight variation
                    const stemAngle = Math.atan2(endY - topY, endX - topX);
                    const leafletLength = 12 * (1 - lt * 0.6); // Shorter toward tip
                    
                    // Leaflet sway
                    const leafSway = Math.sin(this.time * 0.006 + seed + f + l * 0.3) * 2;
                    
                    // Two leaflets per position (left and right)
                    for (let side = -1; side <= 1; side += 2) {
                        const leafAngle = stemAngle + (Math.PI / 2) * side * 0.8;
                        const leafEndX = lx + Math.cos(leafAngle) * leafletLength + leafSway * side * 0.3;
                        const leafEndY = ly + Math.sin(leafAngle) * leafletLength + Math.abs(leafSway) * 0.5;
                        
                        // Gradient for each leaflet
                        ctx.fillStyle = lt < 0.5 ? COLORS.palmGreen : COLORS.palmDark;
                        
                        ctx.beginPath();
                        ctx.moveTo(lx, ly);
                        ctx.quadraticCurveTo(
                            lx + (leafEndX - lx) * 0.5 + side * 2,
                            ly + (leafEndY - ly) * 0.3,
                            leafEndX, leafEndY
                        );
                        ctx.quadraticCurveTo(
                            lx + (leafEndX - lx) * 0.5,
                            ly + (leafEndY - ly) * 0.7,
                            lx, ly
                        );
                        ctx.fill();
                    }
                }
            }
            
            // Coconuts/dates cluster
            const fruitCount = this.seededRandom(seed + 50, 2, 5);
            for (let fruit = 0; fruit < fruitCount; fruit++) {
                const fruitAngle = (fruit / fruitCount) * Math.PI - Math.PI * 0.5;
                const fruitDist = 6 + Math.random() * 4;
                const fruitX = topX + Math.cos(fruitAngle) * fruitDist;
                const fruitY = topY + 8 + Math.sin(fruitAngle) * 3;
                
                // Date/coconut
                const fruitGrad = ctx.createRadialGradient(fruitX - 1, fruitY - 1, 0, fruitX, fruitY, 5);
                fruitGrad.addColorStop(0, '#8b4513');
                fruitGrad.addColorStop(0.7, '#654321');
                fruitGrad.addColorStop(1, '#3d2817');
                
                ctx.fillStyle = fruitGrad;
                ctx.beginPath();
                ctx.ellipse(fruitX, fruitY, 4, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    drawGround() {
        const ctx = this.ctx;
        const groundY = 550;
        
        // Base sand with gradient
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, CANVAS_HEIGHT);
        groundGrad.addColorStop(0, COLORS.sandMid);
        groundGrad.addColorStop(0.3, COLORS.sandDark);
        groundGrad.addColorStop(0.7, COLORS.sandShadow);
        groundGrad.addColorStop(1, '#5a4010');
        
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, CANVAS_WIDTH, CANVAS_HEIGHT - groundY);
        
        // Top edge highlight (sun-lit ridge)
        const ridgeGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 4);
        ridgeGrad.addColorStop(0, COLORS.sandLight);
        ridgeGrad.addColorStop(1, COLORS.sandMid);
        ctx.fillStyle = ridgeGrad;
        ctx.fillRect(0, groundY, CANVAS_WIDTH, 4);
        
        const scrollAmount = this.bgX * 0.8;
        
        // Sand ripple texture
        ctx.strokeStyle = 'rgba(180, 140, 80, 0.3)';
        ctx.lineWidth = 1;
        for (let ripple = 0; ripple < 8; ripple++) {
            const rippleY = groundY + 8 + ripple * 5;
            ctx.beginPath();
            for (let rx = 0; rx <= CANVAS_WIDTH; rx += 5) {
                const worldX = rx + scrollAmount;
                const waveOffset = Math.sin(worldX * 0.05 + ripple * 0.5) * 2;
                if (rx === 0) {
                    ctx.moveTo(rx, rippleY + waveOffset);
                } else {
                    ctx.lineTo(rx, rippleY + waveOffset);
                }
            }
            ctx.stroke();
        }
        
        // Pebbles and rocks with more variety
        for (let i = 0; i < 40; i++) {
            const seed = i * 23.456;
            const x = ((i * 40 + this.seededRandom(seed, -15, 15) - scrollAmount) % (CANVAS_WIDTH + 80) + CANVAS_WIDTH + 80) % (CANVAS_WIDTH + 80) - 40;
            const y = groundY + 8 + this.seededRandom(seed + 1, 0, 38);
            const size = this.seededRandom(seed + 2, 2, 6);
            const rotation = this.seededRandom(seed + 3, 0, Math.PI);
            
            // Rock with gradient for 3D look
            const rockType = this.seededRandom(seed + 4, 0, 1);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            if (rockType > 0.7) {
                // Larger stone
                const rockGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
                rockGrad.addColorStop(0, '#a09080');
                rockGrad.addColorStop(0.5, '#807060');
                rockGrad.addColorStop(1, '#504030');
                ctx.fillStyle = rockGrad;
            } else if (rockType > 0.4) {
                // Medium brown pebble
                ctx.fillStyle = COLORS.sandDark;
            } else {
                // Small dark pebble
                ctx.fillStyle = COLORS.stoneDark;
            }
            
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlight on rocks
            if (size > 3) {
                ctx.fillStyle = 'rgba(255, 255, 200, 0.2)';
                ctx.beginPath();
                ctx.ellipse(-size * 0.2, -size * 0.2, size * 0.3, size * 0.2, -0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        // Desert plants (sparse scrub)
        this.drawDesertPlants(scrollAmount, groundY);
        
        // Ancient pottery shards / artifacts (rare)
        this.drawArtifacts(scrollAmount, groundY);
    }
    
    drawDesertPlants(scrollAmount, groundY) {
        const ctx = this.ctx;
        const spacing = 120;
        
        const firstIndex = Math.floor((scrollAmount - 30) / spacing);
        const lastIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 30) / spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 89.123;
            const x = i * spacing - scrollAmount + this.seededRandom(seed, -40, 40);
            const plantType = this.seededRandom(seed + 1, 0, 1);
            
            if (plantType > 0.6) {
                // Desert grass tuft
                const grassCount = Math.floor(this.seededRandom(seed + 2, 5, 12));
                const baseY = groundY + 3;
                
                for (let g = 0; g < grassCount; g++) {
                    const grassSeed = seed + g * 0.1;
                    const gx = x + this.seededRandom(grassSeed, -8, 8);
                    const grassHeight = this.seededRandom(grassSeed + 1, 8, 18);
                    const lean = this.seededRandom(grassSeed + 2, -0.3, 0.3);
                    const sway = Math.sin(this.time * 0.005 + grassSeed) * 0.1;
                    
                    // Grass blade gradient
                    const grassGrad = ctx.createLinearGradient(gx, baseY, gx, baseY - grassHeight);
                    grassGrad.addColorStop(0, '#8b7355');
                    grassGrad.addColorStop(0.4, '#a08050');
                    grassGrad.addColorStop(1, '#c9a862');
                    
                    ctx.strokeStyle = grassGrad;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(gx, baseY);
                    ctx.quadraticCurveTo(
                        gx + lean * grassHeight + sway * grassHeight,
                        baseY - grassHeight * 0.6,
                        gx + lean * grassHeight * 1.5 + sway * grassHeight * 2,
                        baseY - grassHeight
                    );
                    ctx.stroke();
                }
            } else if (plantType > 0.3) {
                // Small desert shrub
                const shrubY = groundY + 2;
                const shrubSize = this.seededRandom(seed + 3, 10, 20);
                
                // Shrub shadow
                ctx.fillStyle = 'rgba(60, 40, 20, 0.2)';
                ctx.beginPath();
                ctx.ellipse(x + 5, shrubY + 3, shrubSize * 0.8, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Shrub branches
                const branchCount = Math.floor(this.seededRandom(seed + 4, 4, 8));
                for (let b = 0; b < branchCount; b++) {
                    const angle = (b / branchCount) * Math.PI - Math.PI * 0.1;
                    const branchLen = shrubSize * this.seededRandom(seed + b * 0.1, 0.6, 1);
                    const sway = Math.sin(this.time * 0.003 + seed + b) * 2;
                    
                    ctx.strokeStyle = '#5c4a3c';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, shrubY);
                    ctx.quadraticCurveTo(
                        x + Math.cos(angle) * branchLen * 0.5 + sway,
                        shrubY - branchLen * 0.6,
                        x + Math.cos(angle) * branchLen + sway,
                        shrubY - Math.sin(angle) * branchLen
                    );
                    ctx.stroke();
                    
                    // Tiny leaves
                    ctx.fillStyle = this.seededRandom(seed + b, 0, 1) > 0.5 ? '#6b8b4a' : '#8b9b5a';
                    for (let leaf = 0; leaf < 3; leaf++) {
                        const lt = 0.4 + leaf * 0.2;
                        const lx = x + Math.cos(angle) * branchLen * lt + sway * lt;
                        const ly = shrubY - Math.sin(angle) * branchLen * lt - branchLen * 0.3 * lt;
                        ctx.beginPath();
                        ctx.ellipse(lx, ly, 3, 1.5, angle, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            // else: empty space (natural desert)
        }
    }
    
    drawArtifacts(scrollAmount, groundY) {
        const ctx = this.ctx;
        const spacing = 400; // Rare artifacts
        
        const firstIndex = Math.floor((scrollAmount - 20) / spacing);
        const lastIndex = Math.ceil((scrollAmount + CANVAS_WIDTH + 20) / spacing);
        
        for (let i = firstIndex; i <= lastIndex; i++) {
            const seed = i * 777.333;
            const artifactType = this.seededRandom(seed, 0, 1);
            
            if (artifactType > 0.4) continue; // 60% chance of no artifact
            
            const x = i * spacing - scrollAmount + this.seededRandom(seed + 1, -100, 100);
            const y = groundY + this.seededRandom(seed + 2, 10, 35);
            
            if (artifactType > 0.2) {
                // Pottery shard
                const shardGrad = ctx.createLinearGradient(x - 5, y - 5, x + 5, y + 5);
                shardGrad.addColorStop(0, '#c9784a');
                shardGrad.addColorStop(1, '#8b4513');
                
                ctx.fillStyle = shardGrad;
                ctx.beginPath();
                ctx.moveTo(x, y - 6);
                ctx.lineTo(x + 5, y - 2);
                ctx.lineTo(x + 3, y + 4);
                ctx.lineTo(x - 4, y + 2);
                ctx.closePath();
                ctx.fill();
                
                // Decorative line on shard
                ctx.strokeStyle = '#5c3a2a';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 2, y - 3);
                ctx.lineTo(x + 2, y + 1);
                ctx.stroke();
            } else {
                // Partially buried small statue/ushabti
                const statueGrad = ctx.createLinearGradient(x - 3, y - 10, x + 3, y);
                statueGrad.addColorStop(0, '#c9a87c');
                statueGrad.addColorStop(1, '#8b7355');
                
                ctx.fillStyle = statueGrad;
                ctx.beginPath();
                // Small figure emerging from sand
                ctx.ellipse(x, y - 6, 4, 6, 0, Math.PI, Math.PI * 2); // Head
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(x - 4, y - 2);
                ctx.lineTo(x - 5, y + 4);
                ctx.lineTo(x + 5, y + 4);
                ctx.lineTo(x + 4, y - 2);
                ctx.closePath();
                ctx.fill();
                
                // Face hint
                ctx.fillStyle = '#5c4a3c';
                ctx.fillRect(x - 1.5, y - 8, 1, 1);
                ctx.fillRect(x + 0.5, y - 8, 1, 1);
            }
        }
    }
    
    drawSandParticles() {
        const ctx = this.ctx;
        const scrollAmount = this.bgX * 0.3;
        
        // Floating sand/dust motes
        for (let i = 0; i < 20; i++) {
            const seed = i * 34.567;
            const baseX = (i * 80) % CANVAS_WIDTH;
            const x = baseX + Math.sin(this.time * 0.002 + seed) * 30 - (scrollAmount % 80);
            const y = 200 + this.seededRandom(seed, 0, 300) + Math.sin(this.time * 0.003 + seed) * 20;
            const size = this.seededRandom(seed + 1, 1, 3);
            const alpha = 0.2 + this.seededRandom(seed + 2, 0, 0.3);
            
            ctx.fillStyle = `rgba(244, 208, 63, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // ============================================
    // DRAWING: SCARAB BEETLE (Player)
    // ============================================
    
    drawScarab() {
        const ctx = this.ctx;
        const { x, y, rotation, wingOpen } = this.scarab;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        const size = SCARAB_SIZE;
        
        // Wing cases (elytra) - open when flapping
        const wingAngle = wingOpen * 0.4;
        this.scarab.wingOpen *= 0.9; // Decay wing open
        
        // Glow effect
        ctx.shadowColor = COLORS.gold;
        ctx.shadowBlur = 15;
        
        // Left wing case
        ctx.save();
        ctx.rotate(-wingAngle);
        const leftWingGrad = ctx.createLinearGradient(-size/2, -size/4, 0, size/4);
        leftWingGrad.addColorStop(0, '#4169e1'); // Royal blue
        leftWingGrad.addColorStop(0.5, '#1e90ff');
        leftWingGrad.addColorStop(1, '#00bfff');
        
        ctx.fillStyle = leftWingGrad;
        ctx.beginPath();
        ctx.ellipse(-size * 0.2, 0, size * 0.35, size * 0.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Right wing case
        ctx.save();
        ctx.rotate(wingAngle);
        const rightWingGrad = ctx.createLinearGradient(0, -size/4, size/2, size/4);
        rightWingGrad.addColorStop(0, '#4169e1');
        rightWingGrad.addColorStop(0.5, '#1e90ff');
        rightWingGrad.addColorStop(1, '#00bfff');
        
        ctx.fillStyle = rightWingGrad;
        ctx.beginPath();
        ctx.ellipse(size * 0.2, 0, size * 0.35, size * 0.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Body (thorax)
        const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
        bodyGrad.addColorStop(0, '#ffd700');
        bodyGrad.addColorStop(0.6, '#daa520');
        bodyGrad.addColorStop(1, '#b8860b');
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        const headGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.1, 0, -size * 0.3, 0, size * 0.2);
        headGrad.addColorStop(0, '#ffd700');
        headGrad.addColorStop(1, '#b8860b');
        
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(-size * 0.35, 0, size * 0.18, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Antennae
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.45, -size * 0.1);
        ctx.quadraticCurveTo(-size * 0.6, -size * 0.25, -size * 0.55, -size * 0.35);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.45, size * 0.1);
        ctx.quadraticCurveTo(-size * 0.6, size * 0.25, -size * 0.55, size * 0.35);
        ctx.stroke();
        
        // Legs (simplified)
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        const legPositions = [
            { x: -size * 0.1, y: -size * 0.3, angle: -0.5 },
            { x: size * 0.1, y: -size * 0.35, angle: -0.3 },
            { x: size * 0.25, y: -size * 0.3, angle: -0.1 },
            { x: -size * 0.1, y: size * 0.3, angle: 0.5 },
            { x: size * 0.1, y: size * 0.35, angle: 0.3 },
            { x: size * 0.25, y: size * 0.3, angle: 0.1 }
        ];
        
        legPositions.forEach(leg => {
            ctx.beginPath();
            ctx.moveTo(leg.x, leg.y);
            ctx.lineTo(leg.x + Math.cos(leg.angle) * 12, leg.y + Math.sin(leg.angle) * 15);
            ctx.stroke();
        });
        
        // Shine/highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-size * 0.05, -size * 0.15, size * 0.08, size * 0.05, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye gems
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(-size * 0.4, -size * 0.08, 3, 0, Math.PI * 2);
        ctx.arc(-size * 0.4, size * 0.08, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    drawTrail() {
        const ctx = this.ctx;
        
        // Golden sparkle trail
        this.trail.forEach((point, i) => {
            const alpha = point.life / point.maxLife;
            const size = 3 * alpha;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner bright core
            ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // ============================================
    // DRAWING: STONE PILLARS (Obstacles)
    // ============================================
    
    drawPillar(pillar) {
        const ctx = this.ctx;
        const { x, gapY, gapHeight, seed } = pillar;
        
        // Top pillar (hanging from top)
        this.drawStonePillar(x, 0, gapY, seed, true);
        
        // Bottom pillar (rising from ground)
        this.drawStonePillar(x, gapY + gapHeight, CANVAS_HEIGHT - (gapY + gapHeight), seed + 100, false);
    }
    
    drawStonePillar(x, y, height, seed, isTop) {
        const ctx = this.ctx;
        const width = PILLAR_WIDTH;
        
        if (height <= 0) return;
        
        // Main stone body gradient
        const stoneGrad = ctx.createLinearGradient(x, y, x + width, y);
        stoneGrad.addColorStop(0, COLORS.stoneShadow);
        stoneGrad.addColorStop(0.3, COLORS.stoneMid);
        stoneGrad.addColorStop(0.7, COLORS.stoneLight);
        stoneGrad.addColorStop(1, COLORS.stoneMid);
        
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(x, y, width, height);
        
        // Stone block lines (horizontal)
        ctx.strokeStyle = COLORS.stoneShadow;
        ctx.lineWidth = 1;
        const blockHeight = 25;
        const startY = isTop ? y + (height % blockHeight) : y;
        
        for (let by = startY; by < y + height; by += blockHeight) {
            if (by > y && by < y + height - 5) {
                ctx.beginPath();
                ctx.moveTo(x, by);
                ctx.lineTo(x + width, by);
                ctx.stroke();
            }
        }
        
        // Hieroglyphic decorations
        this.drawHieroglyphs(x + 5, y + 10, width - 10, height - 20, seed);
        
        // Capital (decorative top) for bottom pillars
        if (!isTop && height > 50) {
            this.drawPillarCapital(x, y, width);
        }
        
        // Base for top pillars
        if (isTop && height > 50) {
            this.drawPillarBase(x, y + height, width);
        }
        
        // Edge highlights
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + width - 1, y);
        ctx.lineTo(x + width - 1, y + height);
        ctx.stroke();
        
        // Shadow edge
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x + 1, y);
        ctx.lineTo(x + 1, y + height);
        ctx.stroke();
    }
    
    drawPillarCapital(x, y, width) {
        const ctx = this.ctx;
        const capHeight = 20;
        
        // Decorative capital
        const capGrad = ctx.createLinearGradient(x - 5, y, x + width + 5, y);
        capGrad.addColorStop(0, COLORS.stoneShadow);
        capGrad.addColorStop(0.5, COLORS.gold);
        capGrad.addColorStop(1, COLORS.stoneShadow);
        
        ctx.fillStyle = capGrad;
        
        // Wider top piece
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + width + 8, y);
        ctx.lineTo(x + width + 4, y + capHeight);
        ctx.lineTo(x - 4, y + capHeight);
        ctx.closePath();
        ctx.fill();
        
        // Gold band
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(x - 6, y + 5, width + 12, 4);
        
        // Cobra decoration (simplified uraeus)
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y - 15);
        ctx.quadraticCurveTo(x + width / 2 - 8, y - 10, x + width / 2 - 5, y);
        ctx.lineTo(x + width / 2 + 5, y);
        ctx.quadraticCurveTo(x + width / 2 + 8, y - 10, x + width / 2, y - 15);
        ctx.fill();
    }
    
    drawPillarBase(x, y, width) {
        const ctx = this.ctx;
        const baseHeight = 15;
        
        // Wider base piece
        const baseGrad = ctx.createLinearGradient(x - 5, y - baseHeight, x + width + 5, y);
        baseGrad.addColorStop(0, COLORS.stoneShadow);
        baseGrad.addColorStop(0.5, COLORS.stoneMid);
        baseGrad.addColorStop(1, COLORS.stoneShadow);
        
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.moveTo(x - 4, y - baseHeight);
        ctx.lineTo(x + width + 4, y - baseHeight);
        ctx.lineTo(x + width + 8, y);
        ctx.lineTo(x - 8, y);
        ctx.closePath();
        ctx.fill();
    }
    
    drawHieroglyphs(x, y, width, height, seed) {
        const ctx = this.ctx;
        
        if (height < 40) return;
        
        ctx.fillStyle = COLORS.hieroglyph;
        ctx.globalAlpha = 0.4;
        
        // Simple hieroglyph-like symbols
        const symbols = ['◯', '△', '☥', '𓂀', '▢', '◇'];
        const symbolSize = 10;
        const cols = Math.floor(width / (symbolSize + 5));
        const rows = Math.floor(height / (symbolSize + 8));
        
        for (let row = 0; row < Math.min(rows, 8); row++) {
            for (let col = 0; col < cols; col++) {
                const sx = x + col * (symbolSize + 5) + symbolSize / 2;
                const sy = y + row * (symbolSize + 8) + symbolSize;
                
                // Use seed to determine which symbol
                const symbolSeed = seed + row * 10 + col;
                const symbolIndex = Math.floor(this.seededRandom(symbolSeed, 0, symbols.length));
                
                // Draw simple geometric shapes instead of text for reliability
                const shapeType = symbolIndex % 4;
                
                ctx.beginPath();
                switch (shapeType) {
                    case 0: // Circle
                        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
                        break;
                    case 1: // Triangle
                        ctx.moveTo(sx, sy - 5);
                        ctx.lineTo(sx + 4, sy + 3);
                        ctx.lineTo(sx - 4, sy + 3);
                        ctx.closePath();
                        break;
                    case 2: // Square
                        ctx.rect(sx - 3, sy - 3, 6, 6);
                        break;
                    case 3: // Diamond
                        ctx.moveTo(sx, sy - 5);
                        ctx.lineTo(sx + 4, sy);
                        ctx.lineTo(sx, sy + 5);
                        ctx.lineTo(sx - 4, sy);
                        ctx.closePath();
                        break;
                }
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
    }
    
    // ============================================
    // UPDATE LOGIC
    // ============================================
    
    update() {
        this.time++;
        
        // Background scroll - NO WRAPPING! (learned from V4)
        this.bgX += PILLAR_SPEED;
        
        if (this.currentState !== GameState.PLAYING) return;
        
        // Update scarab physics
        this.scarab.velocity += GRAVITY;
        this.scarab.velocity = Math.min(this.scarab.velocity, MAX_FALL_SPEED);
        this.scarab.y += this.scarab.velocity;
        
        // Rotation based on velocity
        this.scarab.rotation = Math.max(-0.5, Math.min(0.5, this.scarab.velocity * 0.05));
        
        // Update trail
        this.trailTimer++;
        if (this.trailTimer >= 3) {
            this.trailTimer = 0;
            this.trail.push({
                x: this.scarab.x - 10,
                y: this.scarab.y,
                life: 20,
                maxLife: 20
            });
        }
        
        // Update trail particles
        this.trail = this.trail.filter(p => {
            p.life--;
            p.x -= PILLAR_SPEED * 0.5;
            return p.life > 0;
        });
        
        // Spawn pillars
        this.pillarSpawnTimer++;
        if (this.pillarSpawnTimer >= PILLAR_SPAWN_DISTANCE / PILLAR_SPEED) {
            this.spawnPillar();
            this.pillarSpawnTimer = 0;
        }
        
        // Update pillars
        this.pillars.forEach(pillar => {
            pillar.x -= PILLAR_SPEED;
            
            // Score when passing pillar
            if (!pillar.scored && pillar.x + PILLAR_WIDTH < this.scarab.x) {
                pillar.scored = true;
                this.score++;
                this.updateUI();
                
                // Score particles
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    this.particles.push(new Particle(
                        this.scarab.x,
                        this.scarab.y - 30,
                        Math.cos(angle) * 2,
                        Math.sin(angle) * 2 - 1,
                        COLORS.gold,
                        4,
                        40,
                        0.95
                    ));
                }
                
                // Score pop animation
                this.scorePop = { active: true, scale: 1.5, y: -10 };
                
                // Increase music intensity
                audioSystem.setIntensity(Math.min(1, 0.3 + this.score * 0.05));
                audioSystem.playScore();
            }
        });
        
        // Remove off-screen pillars
        this.pillars = this.pillars.filter(p => p.x > -PILLAR_WIDTH);
        
        // Update particles
        this.particles = this.particles.filter(p => p.update());
        
        // Check collisions
        this.checkCollisions();
        
        // Update screen shake
        if (this.shake.intensity > 0) {
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.intensity *= 0.9;
        }
        
        // Update score pop
        if (this.scorePop.active) {
            this.scorePop.scale *= 0.9;
            this.scorePop.y *= 0.9;
            if (this.scorePop.scale < 1.05) {
                this.scorePop.active = false;
                this.scorePop.scale = 1;
            }
        }
    }
    
    checkCollisions() {
        const scarabLeft = this.scarab.x - SCARAB_SIZE / 2;
        const scarabRight = this.scarab.x + SCARAB_SIZE / 2;
        const scarabTop = this.scarab.y - SCARAB_SIZE / 2;
        const scarabBottom = this.scarab.y + SCARAB_SIZE / 2;
        
        // Ground/ceiling collision
        if (scarabTop < 0 || scarabBottom > 550) {
            this.gameOver();
            return;
        }
        
        // Pillar collision
        for (const pillar of this.pillars) {
            const pillarLeft = pillar.x;
            const pillarRight = pillar.x + PILLAR_WIDTH;
            
            // Check if scarab overlaps pillar horizontally
            if (scarabRight > pillarLeft && scarabLeft < pillarRight) {
                // Check if scarab is in the gap
                if (scarabTop < pillar.gapY || scarabBottom > pillar.gapY + pillar.gapHeight) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    // ============================================
    // RENDER
    // ============================================
    
    render() {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(this.shake.x, this.shake.y);
        
        // Sky
        this.drawSky();
        
        // Sun
        this.drawSun();
        
        // Desert birds (far)
        this.drawDesertBirds();
        
        // Far pyramids
        this.drawPyramidLayer(0.1, 420, 80, 150, '#d4b896', '#a08060', 400);
        
        // Sphinx (mid distance)
        this.drawSphinx(0.2);
        
        // Mid pyramids
        this.drawPyramidLayer(0.25, 440, 100, 200, '#c9a87c', '#8c7a5c', 350);
        
        // Near pyramid (large)
        this.drawPyramidLayer(0.35, 470, 150, 280, COLORS.pyramidNear, '#705840', 500);
        
        // Heat shimmer
        this.drawHeatShimmer();
        
        // Sand dunes (mid)
        this.drawSandDunes(0.4, 480, 30, '#d4a84b', '#8b6914');
        
        // Palm trees
        this.drawPalmTrees(0.5);
        
        // Sand dunes (near)
        this.drawSandDunes(0.6, 510, 20, COLORS.sandMid, COLORS.sandShadow);
        
        // Sand particles
        this.drawSandParticles();
        
        // Ground
        this.drawGround();
        
        // Pillars
        this.pillars.forEach(pillar => this.drawPillar(pillar));
        
        // Trail
        this.drawTrail();
        
        // Scarab
        if (this.currentState !== GameState.GAME_OVER) {
            this.drawScarab();
        }
        
        // Particles
        this.particles.forEach(p => p.draw(ctx));
        
        // UI overlays
        this.renderUI();
        
        ctx.restore();
    }
    
    // ============================================
    // UI RENDERING
    // ============================================
    
    renderUI() {
        const ctx = this.ctx;
        
        if (this.currentState === GameState.MENU) {
            this.renderMenu();
        } else if (this.currentState === GameState.GAME_OVER) {
            this.renderGameOver();
        }
        
        // Score pop effect
        if (this.scorePop.active) {
            const scoreEl = document.getElementById('currentScore');
            scoreEl.style.transform = `translateX(-50%) scale(${this.scorePop.scale})`;
        } else {
            const scoreEl = document.getElementById('currentScore');
            scoreEl.style.transform = 'translateX(-50%) scale(1)';
        }
    }
    
    renderMenu() {
        const ctx = this.ctx;
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Title
        ctx.save();
        ctx.shadowColor = COLORS.gold;
        ctx.shadowBlur = 20;
        
        ctx.font = 'bold 42px Papyrus, fantasy';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Gold gradient text
        const titleGrad = ctx.createLinearGradient(100, 150, 300, 150);
        titleGrad.addColorStop(0, '#ffd700');
        titleGrad.addColorStop(0.5, '#fff4c4');
        titleGrad.addColorStop(1, '#ffd700');
        ctx.fillStyle = titleGrad;
        
        ctx.fillText('FLAPPY', CANVAS_WIDTH / 2, 160);
        ctx.fillText('SCARAB', CANVAS_WIDTH / 2, 210);
        ctx.restore();
        
        // Subtitle
        ctx.font = '18px Papyrus, fantasy';
        ctx.fillStyle = COLORS.sandLight;
        ctx.fillText('Egyptian Desert Adventure', CANVAS_WIDTH / 2, 260);
        
        // Instructions
        ctx.font = '16px Papyrus, fantasy';
        ctx.fillStyle = '#fff';
        
        const pulse = 0.7 + Math.sin(this.time * 0.05) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillText('Click or Press Space', CANVAS_WIDTH / 2, 400);
        ctx.fillText('to Begin Your Journey', CANVAS_WIDTH / 2, 425);
        ctx.globalAlpha = 1;
        
        // Decorative scarab
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, 320);
        const bobble = Math.sin(this.time * 0.03) * 5;
        ctx.translate(0, bobble);
        ctx.scale(1.5, 1.5);
        
        // Simple scarab preview
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = COLORS.scarabBlue;
        ctx.beginPath();
        ctx.ellipse(-8, 0, 12, 18, -0.2, 0, Math.PI * 2);
        ctx.ellipse(8, 0, 12, 18, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // High score display
        if (this.highScore > 0) {
            ctx.font = '14px Papyrus, fantasy';
            ctx.fillStyle = COLORS.gold;
            ctx.fillText(`Best Score: ${this.highScore}`, CANVAS_WIDTH / 2, 500);
        }
    }
    
    renderGameOver() {
        const ctx = this.ctx;
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Game Over text
        ctx.save();
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 15;
        
        ctx.font = 'bold 48px Papyrus, fantasy';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ff6b35';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 200);
        ctx.restore();
        
        // Score display
        ctx.font = 'bold 32px Papyrus, fantasy';
        ctx.fillStyle = COLORS.gold;
        ctx.fillText(`Score: ${this.score}`, CANVAS_WIDTH / 2, 280);
        
        // New high score?
        if (this.score >= this.highScore && this.score > 0) {
            ctx.font = '20px Papyrus, fantasy';
            ctx.fillStyle = '#ffd700';
            const sparkle = Math.sin(this.time * 0.1) > 0 ? '✨' : '⭐';
            ctx.fillText(`${sparkle} NEW BEST! ${sparkle}`, CANVAS_WIDTH / 2, 330);
        }
        
        ctx.font = '18px Papyrus, fantasy';
        ctx.fillStyle = COLORS.sandLight;
        ctx.fillText(`Best: ${this.highScore}`, CANVAS_WIDTH / 2, 370);
        
        // Restart prompt
        const pulse = 0.7 + Math.sin(this.time * 0.05) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.font = '16px Papyrus, fantasy';
        ctx.fillStyle = '#fff';
        ctx.fillText('Click or Press Space', CANVAS_WIDTH / 2, 450);
        ctx.fillText('to Rise Again', CANVAS_WIDTH / 2, 475);
        ctx.globalAlpha = 1;
    }
    
    // ============================================
    // GAME LOOP
    // ============================================
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.gameLoop();
    }
}

// ============================================
// INITIALIZE GAME
// ============================================

const game = new Game();
game.start();

