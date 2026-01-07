// ============================================
// EGYPT THEME - VISUALS ONLY
// ============================================
// Flappy Scarab: Egyptian Desert Adventure
// This file contains ALL visual rendering:
//    - Desert sunset sky, pyramids
//    - Scarab beetle (player)
//    - Stone pillars with hieroglyphs
//    - Sand/ground
//
// ❌ NO game logic
// ❌ NO collision detection
// ❌ NO movement/physics
// ❌ NO game constants (gravity, speeds, etc.)
//
// Uses EXACT SAME game-modular.js as base Flappy Bird!
// ============================================

const THEME = {
    name: 'Egyptian Desert',
    
    // ============================================
    // COLORS - Egyptian palette
    // ============================================
    colors: {
        // Sky gradient (sunset)
        skyTop: '#1a0a2e',
        skyMid: '#4a1942',
        skyBottom: '#c9634a',
        skyHorizon: '#f4a460',
        
        // Sun
        sunCore: '#fff4e0',
        sunGlow: '#ffd700',
        
        // Sand
        sandLight: '#f4d03f',
        sandMid: '#d4a84b',
        sandDark: '#b8860b',
        
        // Stone (pillars)
        stoneLight: '#d4c4a8',
        stoneMid: '#b8a88c',
        stoneDark: '#8c7a5c',
        stoneShadow: '#5c4a3c',
        
        // Pyramids
        pyramidFar: '#c9a87c',
        pyramidNear: '#a0825c',
        
        // Scarab
        scarabGold: '#ffd700',
        scarabBlue: '#1e90ff',
        
        // Accents
        gold: '#ffd700',
        hieroglyph: '#8b4513'
    },
    
    time: 0,
    bgX: 0,
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
    },
    
    // ============================================
    // SEEDED RANDOM
    // ============================================
    seededRandom(seed, min = 0, max = 1) {
        const x = Math.sin(seed) * 10000;
        const rand = x - Math.floor(x);
        return min + rand * (max - min);
    },
    
    // ============================================
    // SKY RENDERING
    // ============================================
    drawSky() {
        const ctx = this.ctx;
        
        // Gradient sky (sunset)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, this.colors.skyTop);
        skyGrad.addColorStop(0.3, this.colors.skyMid);
        skyGrad.addColorStop(0.6, this.colors.skyBottom);
        skyGrad.addColorStop(0.8, this.colors.skyHorizon);
        skyGrad.addColorStop(1, this.colors.sandMid);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Sun
        this.drawSun();
        
        // Stars
        this.drawStars();
    },
    
    drawSun() {
        const ctx = this.ctx;
        const sunX = this.width * 0.7;
        const sunY = this.height * 0.25;
        const sunRadius = 40;
        
        // Sun glow
        const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
        glowGrad.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
        glowGrad.addColorStop(0.5, 'rgba(255, 150, 50, 0.2)');
        glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(sunX - sunRadius * 3, sunY - sunRadius * 3, sunRadius * 6, sunRadius * 6);
        
        // Sun core
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
        sunGrad.addColorStop(0, this.colors.sunCore);
        sunGrad.addColorStop(0.8, this.colors.sunGlow);
        sunGrad.addColorStop(1, 'rgba(255, 200, 0, 0.5)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
    },
    
    drawStars() {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < 30; i++) {
            const x = this.seededRandom(i * 7, 0, this.width);
            const y = this.seededRandom(i * 11, 0, this.height * 0.3);
            const size = this.seededRandom(i * 13, 0.5, 1.5);
            const alpha = this.seededRandom(i * 17, 0.3, 0.8);
            
            ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(this.time * 0.02 + i));
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },
    
    // ============================================
    // PYRAMIDS
    // ============================================
    drawPyramids(bgX) {
        const ctx = this.ctx;
        
        // Far pyramids
        this.drawPyramid(100 + bgX * 0.1, this.height * 0.65, 80, this.colors.pyramidFar);
        this.drawPyramid(250 + bgX * 0.1, this.height * 0.60, 120, this.colors.pyramidFar);
        
        // Near pyramids
        this.drawPyramid(50 + bgX * 0.2, this.height * 0.75, 100, this.colors.pyramidNear);
        this.drawPyramid(300 + bgX * 0.25, this.height * 0.70, 150, this.colors.pyramidNear);
    },
    
    drawPyramid(x, baseY, size, color) {
        const ctx = this.ctx;
        
        // Main pyramid
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - size / 2, baseY);
        ctx.lineTo(x, baseY - size * 0.8);
        ctx.lineTo(x + size / 2, baseY);
        ctx.closePath();
        ctx.fill();
        
        // Shaded side
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x, baseY - size * 0.8);
        ctx.lineTo(x + size / 2, baseY);
        ctx.lineTo(x, baseY);
        ctx.closePath();
        ctx.fill();
    },
    
    // ============================================
    // GROUND
    // ============================================
    drawGround() {
        const ctx = this.ctx;
        const groundY = this.height - 50;
        
        // Sand gradient
        const sandGrad = ctx.createLinearGradient(0, groundY, 0, this.height);
        sandGrad.addColorStop(0, this.colors.sandLight);
        sandGrad.addColorStop(0.3, this.colors.sandMid);
        sandGrad.addColorStop(1, this.colors.sandDark);
        
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, groundY, this.width, 50);
        
        // Sand texture dots
        ctx.fillStyle = 'rgba(139, 105, 20, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = this.seededRandom(i * 3, 0, this.width);
            const y = this.seededRandom(i * 5, groundY + 5, this.height - 5);
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Decorative border
        ctx.fillStyle = this.colors.gold;
        ctx.fillRect(0, groundY, this.width, 3);
    },
    
    // ============================================
    // PILLAR RENDERING
    // ============================================
    drawPillar(pipe, pipeWidth) {
        const ctx = this.ctx;
        const { x, gapY, gapSize } = pipe;
        
        // Top pillar
        this.drawStonePillar(x, 0, gapY, true);
        
        // Bottom pillar
        const bottomY = gapY + gapSize;
        this.drawStonePillar(x, bottomY, this.height - bottomY - 50, false);
    },
    
    drawStonePillar(x, y, height, isTop) {
        const ctx = this.ctx;
        const width = 52;
        
        if (height <= 0) return;
        
        // Stone gradient
        const stoneGrad = ctx.createLinearGradient(x, y, x + width, y);
        stoneGrad.addColorStop(0, this.colors.stoneShadow);
        stoneGrad.addColorStop(0.3, this.colors.stoneMid);
        stoneGrad.addColorStop(0.7, this.colors.stoneLight);
        stoneGrad.addColorStop(1, this.colors.stoneMid);
        
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(x, y, width, height);
        
        // Block lines
        ctx.strokeStyle = this.colors.stoneShadow;
        ctx.lineWidth = 1;
        const blockHeight = 25;
        for (let by = y + blockHeight; by < y + height; by += blockHeight) {
            ctx.beginPath();
            ctx.moveTo(x, by);
            ctx.lineTo(x + width, by);
            ctx.stroke();
        }
        
        // Simple hieroglyph symbols
        this.drawHieroglyphs(x + 10, y + 20, width - 20, height - 40);
        
        // Capital/base decoration
        if (!isTop && height > 50) {
            // Bottom pillar capital
            ctx.fillStyle = this.colors.gold;
            ctx.fillRect(x - 5, y, width + 10, 8);
        }
        if (isTop && height > 50) {
            // Top pillar base
            ctx.fillStyle = this.colors.gold;
            ctx.fillRect(x - 5, y + height - 8, width + 10, 8);
        }
    },
    
    drawHieroglyphs(x, y, width, height) {
        const ctx = this.ctx;
        if (height < 30) return;
        
        ctx.fillStyle = this.colors.hieroglyph;
        ctx.globalAlpha = 0.4;
        
        // Simple hieroglyph-like symbols
        const symbols = ['☥', '𓂀', '◈', '▲', '○'];
        const centerX = x + width / 2;
        
        for (let sy = y; sy < y + height - 20; sy += 35) {
            const symbol = symbols[Math.floor(this.seededRandom(sy, 0, symbols.length))];
            ctx.font = '16px serif';
            ctx.textAlign = 'center';
            ctx.fillText(symbol, centerX, sy + 15);
        }
        
        ctx.globalAlpha = 1;
    },
    
    // ============================================
    // SCARAB (BIRD) RENDERING
    // ============================================
    drawScarab(state, birdSize) {
        const ctx = this.ctx;
        const { x, y, rotation } = state;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        const size = birdSize;
        
        // Glow effect
        ctx.shadowColor = this.colors.gold;
        ctx.shadowBlur = 15;
        
        // Wing cases (blue)
        const wingGrad = ctx.createLinearGradient(-size/2, 0, size/2, 0);
        wingGrad.addColorStop(0, '#4169e1');
        wingGrad.addColorStop(0.5, '#1e90ff');
        wingGrad.addColorStop(1, '#00bfff');
        
        // Left wing
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.ellipse(-size * 0.15, 0, size * 0.3, size * 0.45, -0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.ellipse(size * 0.15, 0, size * 0.3, size * 0.45, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (gold)
        const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.25);
        bodyGrad.addColorStop(0, '#ffd700');
        bodyGrad.addColorStop(0.6, '#daa520');
        bodyGrad.addColorStop(1, '#b8860b');
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#b8860b';
        ctx.beginPath();
        ctx.ellipse(-size * 0.3, 0, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Antennae
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, -size * 0.1);
        ctx.quadraticCurveTo(-size * 0.5, -size * 0.2, -size * 0.45, -size * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, size * 0.1);
        ctx.quadraticCurveTo(-size * 0.5, size * 0.2, -size * 0.45, size * 0.3);
        ctx.stroke();
        
        ctx.restore();
    },
    
    // ============================================
    // MAIN RENDER (called every frame)
    // ============================================
    render(gameState, constants) {
        const { bird, pipes, bgX, currentState, score } = gameState;
        const { PIPE_WIDTH, BIRD_SIZE, GameState } = constants;
        
        this.time++;
        this.bgX = bgX;
        
        // Sky and sun
        this.drawSky();
        
        // Pyramids (parallax)
        this.drawPyramids(bgX);
        
        // Pillars
        for (const pipe of pipes) {
            this.drawPillar(pipe, PIPE_WIDTH);
        }
        
        // Ground
        this.drawGround();
        
        // Scarab
        this.drawScarab(bird, BIRD_SIZE);
        
        // Update score display
        if (currentState === GameState.PLAYING) {
            const scoreEl = document.getElementById('scoreDisplay');
            if (scoreEl) scoreEl.textContent = score;
        }
    }
};
