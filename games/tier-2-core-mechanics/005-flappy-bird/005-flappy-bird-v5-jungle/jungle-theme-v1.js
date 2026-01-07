// ============================================
// JUNGLE THEME - VISUALS ONLY
// ============================================
// Jungle/Rainforest themed visuals:
//    - Lush green canopy background
//    - Tropical bird (toucan/parrot)
//    - Vine-covered tree trunk obstacles
//    - Jungle floor with ferns
//
// ❌ NO game logic
// ❌ NO collision detection  
// ❌ NO movement/physics
// ❌ NO game constants (speeds, sizes, gravity)
//
// Uses EXACT SAME game-modular.js as base Flappy Bird!
// ============================================

const THEME = {
    name: 'Jungle Adventure',
    
    // ============================================
    // COLORS - Lush Jungle Palette
    // ============================================
    colors: {
        // Sky layers
        skyTop: '#87CEEB',
        skyMid: '#98D8C8',
        skyBottom: '#B8E6D4',
        
        // Canopy/trees
        canopyDark: '#1B5E20',
        canopyMid: '#2E7D32',
        canopyLight: '#4CAF50',
        leafHighlight: '#8BC34A',
        
        // Tree trunks (obstacles)
        trunkDark: '#3E2723',
        trunkMid: '#5D4037',
        trunkLight: '#6D4C41',
        vine: '#2E7D32',
        vineLight: '#66BB6A',
        
        // Ground
        groundDark: '#33691E',
        groundMid: '#558B2F',
        groundLight: '#7CB342',
        dirt: '#5D4037',
        
        // Bird (tropical parrot)
        birdBody: '#E53935',      // Red
        birdWing: '#1E88E5',      // Blue
        birdBelly: '#FDD835',     // Yellow
        birdBeak: '#FF9800',      // Orange
        birdEye: '#FFFFFF',
        birdPupil: '#000000',
        
        // Accents
        flower: '#E91E63',
        flowerCenter: '#FFEB3B'
    },
    
    // Cached background
    backgroundCanvas: null,
    time: 0,
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Pre-render the complex background
        this.backgroundCanvas = this.createBackground();
    },
    
    // ============================================
    // SEEDED RANDOM
    // ============================================
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    },
    
    // ============================================
    // BACKGROUND CREATION
    // ============================================
    createBackground() {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.width * 2; // Double width for scrolling
        bgCanvas.height = this.height;
        const ctx = bgCanvas.getContext('2d');
        
        const W = bgCanvas.width;
        const H = this.height;
        
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        skyGrad.addColorStop(0, this.colors.skyTop);
        skyGrad.addColorStop(0.5, this.colors.skyMid);
        skyGrad.addColorStop(1, this.colors.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
        
        // Distant mountains/hills
        this.drawDistantHills(ctx, W, H);
        
        // Background trees (far layer)
        this.drawTreeLayer(ctx, W, H, 0.3, this.colors.canopyDark, 150);
        
        // Mid trees
        this.drawTreeLayer(ctx, W, H, 0.5, this.colors.canopyMid, 200);
        
        // Draw some hanging vines in background
        this.drawBackgroundVines(ctx, W, H);
        
        // Misty atmosphere
        const mistGrad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.7);
        mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        mistGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, H * 0.3, W, H * 0.4);
        
        return bgCanvas;
    },
    
    drawDistantHills(ctx, W, H) {
        ctx.fillStyle = 'rgba(46, 125, 50, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, H * 0.5);
        
        for (let x = 0; x <= W; x += 50) {
            const y = H * 0.45 + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.02) * 20;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fill();
    },
    
    drawTreeLayer(ctx, W, H, opacity, color, spacing) {
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        for (let x = 0; x < W; x += spacing) {
            const treeHeight = 100 + this.seededRandom(x) * 80;
            const treeWidth = 60 + this.seededRandom(x + 1) * 40;
            const treeY = H * 0.4 + this.seededRandom(x + 2) * 50;
            
            // Draw fluffy tree top
            this.drawTreeTop(ctx, x + spacing / 2, treeY, treeWidth, treeHeight);
        }
        
        ctx.globalAlpha = 1;
    },
    
    drawTreeTop(ctx, x, y, width, height) {
        // Multiple overlapping circles for fluffy canopy
        const circles = 5;
        for (let i = 0; i < circles; i++) {
            const cx = x + (this.seededRandom(x + i) - 0.5) * width * 0.8;
            const cy = y + (this.seededRandom(x + i + 10) - 0.5) * height * 0.5;
            const r = width * 0.3 + this.seededRandom(x + i + 20) * width * 0.2;
            
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawBackgroundVines(ctx, W, H) {
        ctx.strokeStyle = this.colors.vine;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4;
        
        for (let i = 0; i < 15; i++) {
            const x = this.seededRandom(i * 7) * W;
            const startY = 0;
            const endY = H * 0.3 + this.seededRandom(i * 11) * H * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(x, startY);
            
            // Wavy vine
            for (let y = startY; y < endY; y += 10) {
                const wave = Math.sin(y * 0.05 + i) * 10;
                ctx.lineTo(x + wave, y);
            }
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    },
    
    // ============================================
    // BACKGROUND RENDERING
    // ============================================
    drawBackground(bgX) {
        const ctx = this.ctx;
        
        if (this.backgroundCanvas) {
            // Draw scrolling background
            ctx.drawImage(this.backgroundCanvas, bgX, 0);
            ctx.drawImage(this.backgroundCanvas, bgX + this.width, 0);
        }
    },
    
    // ============================================
    // GROUND - Jungle Floor
    // ============================================
    drawGround() {
        const ctx = this.ctx;
        const groundY = this.height - 50;
        
        // Dirt layer
        ctx.fillStyle = this.colors.dirt;
        ctx.fillRect(0, groundY + 10, this.width, 40);
        
        // Grass/fern layer
        const grassGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 15);
        grassGrad.addColorStop(0, this.colors.groundLight);
        grassGrad.addColorStop(1, this.colors.groundMid);
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, groundY, this.width, 15);
        
        // Draw ferns/grass blades
        ctx.fillStyle = this.colors.canopyLight;
        for (let x = 0; x < this.width; x += 8) {
            const height = 5 + Math.sin(x * 0.3 + this.time * 0.02) * 3;
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.lineTo(x + 2, groundY - height);
            ctx.lineTo(x + 4, groundY);
            ctx.fill();
        }
        
        // Some flowers
        for (let x = 20; x < this.width; x += 60) {
            this.drawFlower(ctx, x + Math.sin(x) * 10, groundY - 3, 4);
        }
    },
    
    drawFlower(ctx, x, y, size) {
        // Petals
        ctx.fillStyle = this.colors.flower;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            ctx.beginPath();
            ctx.arc(px, py, size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        // Center
        ctx.fillStyle = this.colors.flowerCenter;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // ============================================
    // PIPE RENDERING - Tree Trunks with Vines
    // ============================================
    drawPipe(pipe, pipeWidth) {
        const ctx = this.ctx;
        
        // Top trunk (hanging from canopy)
        this.drawTreeTrunk(ctx, pipe.x, 0, pipe.gapY, pipeWidth, true);
        
        // Bottom trunk (growing from ground)
        const bottomY = pipe.gapY + pipe.gapSize;
        this.drawTreeTrunk(ctx, pipe.x, bottomY, this.height - bottomY - 50, pipeWidth, false);
    },
    
    drawTreeTrunk(ctx, x, y, height, width, isTop) {
        if (height <= 0) return;
        
        // Main trunk gradient
        const trunkGrad = ctx.createLinearGradient(x, y, x + width, y);
        trunkGrad.addColorStop(0, this.colors.trunkDark);
        trunkGrad.addColorStop(0.3, this.colors.trunkMid);
        trunkGrad.addColorStop(0.7, this.colors.trunkLight);
        trunkGrad.addColorStop(1, this.colors.trunkMid);
        
        ctx.fillStyle = trunkGrad;
        ctx.fillRect(x, y, width, height);
        
        // Bark texture lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let by = y + 10; by < y + height - 10; by += 15) {
            ctx.beginPath();
            ctx.moveTo(x + 5, by);
            ctx.lineTo(x + width - 5, by + 3);
            ctx.stroke();
        }
        
        // Vines wrapping around
        this.drawVines(ctx, x, y, width, height);
        
        // Branch cap
        if (isTop) {
            // Leaves hanging down
            this.drawLeafCluster(ctx, x + width / 2, y + height, width + 20);
        } else {
            // Leaves growing up
            this.drawLeafCluster(ctx, x + width / 2, y, width + 20);
        }
    },
    
    drawVines(ctx, x, y, width, height) {
        ctx.strokeStyle = this.colors.vine;
        ctx.lineWidth = 3;
        
        // Draw 2-3 vines
        for (let v = 0; v < 2; v++) {
            const startX = x + width * 0.3 + v * width * 0.4;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            
            for (let vy = y; vy < y + height; vy += 8) {
                const wave = Math.sin(vy * 0.1 + v * 2) * 8;
                ctx.lineTo(startX + wave, vy);
            }
            ctx.stroke();
            
            // Vine leaves
            ctx.fillStyle = this.colors.vineLight;
            for (let vy = y + 20; vy < y + height - 20; vy += 30) {
                const vx = startX + Math.sin(vy * 0.1 + v * 2) * 8;
                ctx.beginPath();
                ctx.ellipse(vx + 5, vy, 6, 3, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    
    drawLeafCluster(ctx, x, y, width) {
        ctx.fillStyle = this.colors.canopyLight;
        
        // Multiple overlapping leaf shapes
        for (let i = 0; i < 5; i++) {
            const lx = x + (i - 2) * 8;
            const ly = y;
            const angle = (i - 2) * 0.3;
            
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, width * 0.15, width * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },
    
    // ============================================
    // BIRD RENDERING - Tropical Parrot
    // ============================================
    drawBird(state, birdSize) {
        const ctx = this.ctx;
        const { x, y, rotation } = state;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        const size = birdSize;
        
        // Wing (blue feathers)
        ctx.fillStyle = this.colors.birdWing;
        ctx.beginPath();
        ctx.ellipse(-size * 0.1, size * 0.1, size * 0.35, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (red)
        const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
        bodyGrad.addColorStop(0, '#EF5350');
        bodyGrad.addColorStop(1, this.colors.birdBody);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Belly (yellow)
        ctx.fillStyle = this.colors.birdBelly;
        ctx.beginPath();
        ctx.ellipse(size * 0.05, size * 0.1, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (red)
        ctx.fillStyle = this.colors.birdBody;
        ctx.beginPath();
        ctx.arc(size * 0.25, -size * 0.1, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye white
        ctx.fillStyle = this.colors.birdEye;
        ctx.beginPath();
        ctx.arc(size * 0.32, -size * 0.15, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupil
        ctx.fillStyle = this.colors.birdPupil;
        ctx.beginPath();
        ctx.arc(size * 0.35, -size * 0.15, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye highlight
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(size * 0.33, -size * 0.18, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak (curved parrot beak)
        ctx.fillStyle = this.colors.birdBeak;
        ctx.beginPath();
        ctx.moveTo(size * 0.45, -size * 0.05);
        ctx.quadraticCurveTo(size * 0.7, -size * 0.1, size * 0.55, size * 0.05);
        ctx.quadraticCurveTo(size * 0.45, size * 0.02, size * 0.45, -size * 0.05);
        ctx.fill();
        
        // Tail feathers
        ctx.fillStyle = this.colors.birdWing;
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, 0);
        ctx.lineTo(-size * 0.6, -size * 0.1);
        ctx.lineTo(-size * 0.55, 0);
        ctx.lineTo(-size * 0.6, size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = this.colors.birdBelly;
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, 0);
        ctx.lineTo(-size * 0.55, 0);
        ctx.lineTo(-size * 0.5, size * 0.05);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    },
    
    // ============================================
    // MAIN RENDER
    // ============================================
    render(gameState, constants) {
        const { bird, pipes, bgX, currentState, score } = gameState;
        const { PIPE_WIDTH, BIRD_SIZE, GameState } = constants;
        
        this.time++;
        
        // Draw background
        this.drawBackground(bgX);
        
        // Draw pipes (tree trunks)
        for (const pipe of pipes) {
            this.drawPipe(pipe, PIPE_WIDTH);
        }
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird(bird, BIRD_SIZE);
        
        // Update score display
        if (currentState === GameState.PLAYING) {
            const scoreEl = document.getElementById('scoreDisplay');
            if (scoreEl) scoreEl.textContent = score;
        }
    }
};
