// ============================================
// INCA TEMPLE THEME - VISUALS ONLY
// ============================================
// This file contains ALL visual rendering for the Inca theme:
//    - Andean background (mountains, terraces, temple)
//    - Inca-styled paddle, ball, and bricks
//    - UI rendering
//
// ❌ NO game logic
// ❌ NO collision detection
// ❌ NO movement/physics
// ❌ NO game constants (speeds, sizes, positions)
//
// Uses EXACT SAME game.js as the base Breakout game!
// ============================================

const THEME = {
    name: 'Inca Temple',
    
    // ============================================
    // COLORS - Inca/Andean palette
    // ============================================
    colors: {
        text: '#DAA520',
        textMuted: '#B8860B',
        textSuccess: '#FFD700',
        textDanger: '#8B0000',
        
        // Inca stone colors - earthy tones
        brickColors: [
            { base: '#B8860B', highlight: '#DAA520', shadow: '#8B6508' },  // Gold (top row - sacred)
            { base: '#8B7355', highlight: '#A89070', shadow: '#5C4A3A' },  // Brown stone
            { base: '#9C8A6E', highlight: '#B8A888', shadow: '#6E5C48' },  // Tan stone
            { base: '#7A6B5A', highlight: '#9A8B7A', shadow: '#4A3B2A' },  // Dark stone
            { base: '#A08060', highlight: '#C0A080', shadow: '#705030' },  // Golden stone
            { base: '#8A7A6A', highlight: '#AA9A8A', shadow: '#5A4A3A' },  // Grey stone
        ]
    },
    
    // Cached background
    backgroundCanvas: null,
    
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
    // SEEDED RANDOM (for consistent mountain shapes)
    // ============================================
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    },
    
    // ============================================
    // BACKGROUND RENDERING
    // ============================================
    createBackground() {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.width;
        bgCanvas.height = this.height;
        const bgCtx = bgCanvas.getContext('2d');
        
        const W = this.width;
        const H = this.height;
        
        // Sky - Andean sunset/sunrise
        const skyGrad = bgCtx.createLinearGradient(0, 0, 0, H * 0.5);
        skyGrad.addColorStop(0, '#1a0a2e');
        skyGrad.addColorStop(0.3, '#2d1b4e');
        skyGrad.addColorStop(0.5, '#4a2c6a');
        skyGrad.addColorStop(0.7, '#8b4513');
        skyGrad.addColorStop(0.85, '#cd853f');
        skyGrad.addColorStop(1, '#daa520');
        bgCtx.fillStyle = skyGrad;
        bgCtx.fillRect(0, 0, W, H * 0.5);
        
        // Far mountain range
        bgCtx.fillStyle = 'rgba(75, 60, 90, 0.7)';
        bgCtx.beginPath();
        bgCtx.moveTo(0, H * 0.35);
        this.drawMountainRidge(bgCtx, 0, W, H * 0.35, H * 0.25, 5, 100);
        bgCtx.lineTo(W, H * 0.5);
        bgCtx.lineTo(0, H * 0.5);
        bgCtx.closePath();
        bgCtx.fill();
        
        // Mid mountain range
        bgCtx.fillStyle = 'rgba(60, 45, 70, 0.85)';
        bgCtx.beginPath();
        bgCtx.moveTo(0, H * 0.38);
        this.drawMountainRidge(bgCtx, 0, W, H * 0.38, H * 0.22, 4, 150);
        bgCtx.lineTo(W, H * 0.5);
        bgCtx.lineTo(0, H * 0.5);
        bgCtx.closePath();
        bgCtx.fill();
        
        // Near mountain with peaks
        const mtnGrad = bgCtx.createLinearGradient(0, H * 0.3, 0, H * 0.55);
        mtnGrad.addColorStop(0, '#3d2817');
        mtnGrad.addColorStop(1, '#2a1a0f');
        bgCtx.fillStyle = mtnGrad;
        bgCtx.beginPath();
        bgCtx.moveTo(0, H * 0.45);
        bgCtx.lineTo(W * 0.15, H * 0.42);
        bgCtx.lineTo(W * 0.25, H * 0.28);
        bgCtx.lineTo(W * 0.35, H * 0.40);
        bgCtx.lineTo(W * 0.45, H * 0.38);
        bgCtx.lineTo(W * 0.55, H * 0.32);
        bgCtx.lineTo(W * 0.65, H * 0.42);
        bgCtx.lineTo(W * 0.75, H * 0.36);
        bgCtx.lineTo(W * 0.85, H * 0.44);
        bgCtx.lineTo(W, H * 0.40);
        bgCtx.lineTo(W, H * 0.55);
        bgCtx.lineTo(0, H * 0.55);
        bgCtx.closePath();
        bgCtx.fill();
        
        // Terraces
        this.drawTerraces(bgCtx, W, H);
        
        // Temple structure
        this.drawTemple(bgCtx, W, H);
        
        // Lower ground area (play area)
        const groundGrad = bgCtx.createLinearGradient(0, H * 0.55, 0, H);
        groundGrad.addColorStop(0, '#3d2817');
        groundGrad.addColorStop(1, '#1a0f08');
        bgCtx.fillStyle = groundGrad;
        bgCtx.fillRect(0, H * 0.55, W, H * 0.45);
        
        // Sun glow
        const sunX = W * 0.7;
        const sunY = H * 0.35;
        const sunGlow = bgCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.25);
        sunGlow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
        sunGlow.addColorStop(0.3, 'rgba(255, 180, 80, 0.2)');
        sunGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
        bgCtx.fillStyle = sunGlow;
        bgCtx.fillRect(0, 0, W, H * 0.5);
        
        // Stars
        this.drawStars(bgCtx, W, H * 0.25, 40);
        
        // Condor silhouettes
        this.drawCondor(bgCtx, W * 0.2, H * 0.15, 25);
        this.drawCondor(bgCtx, W * 0.35, H * 0.12, 18);
        this.drawCondor(bgCtx, W * 0.8, H * 0.18, 22);
        
        // Vignette
        const vignetteGrad = bgCtx.createRadialGradient(
            W * 0.5, H * 0.5, W * 0.3,
            W * 0.5, H * 0.5, W * 0.8
        );
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        bgCtx.fillStyle = vignetteGrad;
        bgCtx.fillRect(0, 0, W, H);
        
        return bgCanvas;
    },
    
    drawMountainRidge(ctx, startX, endX, baseY, maxHeight, peaks, seed) {
        const points = 50;
        for (let i = 0; i <= points; i++) {
            const x = startX + (endX - startX) * (i / points);
            const peakPhase = Math.sin((i / points) * Math.PI * peaks + seed);
            const noise = (this.seededRandom(seed + i) - 0.5) * maxHeight * 0.3;
            const y = baseY - Math.abs(peakPhase) * maxHeight * 0.7 + noise;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
    },
    
    drawTerraces(ctx, W, H) {
        const terraceColors = ['#2d4a1c', '#3d5a2c', '#4d6a3c', '#3d5528', '#4a6830'];
        
        for (let t = 0; t < 5; t++) {
            const terraceY = H * (0.52 + t * 0.03);
            const terraceH = H * 0.025;
            
            ctx.fillStyle = terraceColors[t];
            ctx.beginPath();
            ctx.moveTo(W * 0.1, terraceY);
            
            for (let i = 0; i <= 20; i++) {
                const x = W * 0.1 + (W * 0.5) * (i / 20);
                const curve = Math.sin((i / 20) * Math.PI) * 8;
                ctx.lineTo(x, terraceY + curve);
            }
            
            ctx.lineTo(W * 0.6, terraceY + terraceH + 5);
            ctx.lineTo(W * 0.1, terraceY + terraceH);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#5a4a3a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(W * 0.1, terraceY + terraceH);
            for (let i = 0; i <= 20; i++) {
                const x = W * 0.1 + (W * 0.5) * (i / 20);
                const curve = Math.sin((i / 20) * Math.PI) * 8;
                ctx.lineTo(x, terraceY + terraceH + curve);
            }
            ctx.stroke();
        }
    },
    
    drawTemple(ctx, W, H) {
        const templeX = W * 0.7;
        const templeY = H * 0.48;
        const templeW = W * 0.18;
        const templeH = H * 0.12;
        
        ctx.fillStyle = '#5a4a3a';
        ctx.beginPath();
        ctx.moveTo(templeX - templeW * 0.6, templeY + templeH);
        ctx.lineTo(templeX - templeW * 0.5, templeY);
        ctx.lineTo(templeX + templeW * 0.5, templeY);
        ctx.lineTo(templeX + templeW * 0.6, templeY + templeH);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 1;
        for (let row = 0; row < 4; row++) {
            const rowY = templeY + (templeH / 4) * row;
            ctx.beginPath();
            ctx.moveTo(templeX - templeW * 0.5 + row * 5, rowY);
            ctx.lineTo(templeX + templeW * 0.5 - row * 5, rowY);
            ctx.stroke();
        }
    },
    
    drawStars(ctx, W, maxH, count) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < count; i++) {
            const x = this.seededRandom(i * 7) * W;
            const y = this.seededRandom(i * 11) * maxH;
            const size = this.seededRandom(i * 13) * 1.5 + 0.5;
            const alpha = this.seededRandom(i * 17) * 0.5 + 0.3;
            
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },
    
    drawCondor(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        // Body
        ctx.ellipse(x, y, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Left wing
        ctx.beginPath();
        ctx.moveTo(x - size * 0.2, y);
        ctx.quadraticCurveTo(x - size, y - size * 0.2, x - size, y + size * 0.1);
        ctx.quadraticCurveTo(x - size * 0.5, y, x - size * 0.2, y);
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y);
        ctx.quadraticCurveTo(x + size, y - size * 0.2, x + size, y + size * 0.1);
        ctx.quadraticCurveTo(x + size * 0.5, y, x + size * 0.2, y);
        ctx.fill();
    },
    
    drawBackground() {
        if (this.backgroundCanvas) {
            this.ctx.drawImage(this.backgroundCanvas, 0, 0);
        }
    },
    
    // ============================================
    // PADDLE RENDERING - Wooden Inca Style
    // ============================================
    drawPaddle(state) {
        const ctx = this.ctx;
        const { x, y, width, height } = state;
        
        // Wooden paddle
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, '#8B4513');
        grad.addColorStop(0.3, '#A0522D');
        grad.addColorStop(0.7, '#8B4513');
        grad.addColorStop(1, '#654321');
        
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, width, height);
        
        // Gold trim
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Center gold emblem
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // ============================================
    // BALL RENDERING - Golden Inca Ball
    // ============================================
    drawBall(state) {
        const ctx = this.ctx;
        const { x, y, radius } = state;
        
        // Golden ball
        const grad = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#DAA520');
        grad.addColorStop(1, '#B8860B');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Small highlight
        ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // ============================================
    // BRICK RENDERING - Inca Stone Blocks
    // ============================================
    drawBrick(state) {
        const ctx = this.ctx;
        const { x, y, width, height, row, destroyed } = state;
        
        if (destroyed) return;
        
        const colors = this.colors.brickColors[row % this.colors.brickColors.length];
        const stoneVariation = (row * 0.1 + x * 0.001) % 0.1;
        const inset = 2;
        
        // Trapezoidal Inca stone shape
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.moveTo(x + inset, y + height);
        ctx.lineTo(x, y + inset);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - inset, y + height);
        ctx.closePath();
        ctx.fill();
        
        // Highlight top edge
        ctx.fillStyle = colors.highlight;
        ctx.beginPath();
        ctx.moveTo(x, y + inset);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - 3, y + 5);
        ctx.lineTo(x + 3, y + 5 + inset);
        ctx.closePath();
        ctx.fill();
        
        // Shadow bottom edge
        ctx.fillStyle = colors.shadow;
        ctx.beginPath();
        ctx.moveTo(x + inset, y + height);
        ctx.lineTo(x + width - inset, y + height);
        ctx.lineTo(x + width - inset - 3, y + height - 4);
        ctx.lineTo(x + inset + 3, y + height - 4);
        ctx.closePath();
        ctx.fill();
        
        // Stone texture crack
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + stoneVariation})`;
        ctx.lineWidth = 1;
        const crackY = y + height * (0.4 + stoneVariation * 2);
        ctx.beginPath();
        ctx.moveTo(x + 5, crackY);
        ctx.lineTo(x + width - 5, crackY + (stoneVariation - 0.05) * 6);
        ctx.stroke();
        
        // Gold row sun symbol
        if (row === 0) {
            const cx = x + width / 2;
            const cy = y + height / 2;
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1.5;
            for (let r = 0; r < 8; r++) {
                const angle = (r / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6);
                ctx.lineTo(cx + Math.cos(angle) * 9, cy + Math.sin(angle) * 9);
                ctx.stroke();
            }
        }
    },
    
    // ============================================
    // UI RENDERING - Inca Style
    // ============================================
    drawUI(gameState, currentState, GameState) {
        const ctx = this.ctx;
        
        ctx.fillStyle = this.colors.text;
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        
        if (currentState === GameState.MENU) {
            this.drawMenuScreen();
        } else if (currentState === GameState.BALL_LOST) {
            this.drawBallLostScreen();
        } else if (currentState === GameState.LEVEL_COMPLETE) {
            this.drawLevelCompleteScreen(gameState.level);
        } else if (currentState === GameState.GAME_OVER) {
            this.drawGameOverScreen(gameState.score);
        }
    },
    
    drawMenuScreen() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.font = '32px "Courier New"';
        ctx.fillStyle = this.colors.text;
        ctx.fillText('INCA TEMPLE BREAKOUT', centerX, centerY - 40);
        
        ctx.font = '24px "Courier New"';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText('PRESS SPACE TO START', centerX, centerY + 10);
        
        ctx.font = '18px "Courier New"';
        ctx.fillText('Break the ancient stones!', centerX, centerY + 50);
    },
    
    drawBallLostScreen() {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.textDanger;
        ctx.font = '24px "Courier New"';
        ctx.fillText('THE SACRED BALL IS LOST!', this.width / 2, this.height / 2);
    },
    
    drawLevelCompleteScreen(level) {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.textSuccess;
        ctx.font = '32px "Courier New"';
        ctx.fillText(`TEMPLE ${level - 1} CONQUERED!`, this.width / 2, this.height / 2);
    },
    
    drawGameOverScreen(score) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.fillStyle = this.colors.textDanger;
        ctx.font = '48px "Courier New"';
        ctx.fillText('THE TEMPLE STANDS', centerX, centerY - 30);
        
        ctx.font = '24px "Courier New"';
        ctx.fillStyle = this.colors.text;
        ctx.fillText(`Offerings: ${score}`, centerX, centerY + 20);
        
        ctx.font = '18px "Courier New"';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText('Press SPACE to challenge again', centerX, centerY + 60);
    },
    
    // ============================================
    // MAIN RENDER (called every frame)
    // ============================================
    render(gameState, currentState, GameState) {
        // Draw cached background
        this.drawBackground();
        
        // Draw all bricks
        for (const brick of gameState.bricks) {
            this.drawBrick(brick.getState());
        }
        
        // Draw paddle
        this.drawPaddle(gameState.paddle.getState());
        
        // Draw ball
        this.drawBall(gameState.ball.getState());
        
        // Draw state-specific UI
        this.drawUI(gameState, currentState, GameState);
    }
};
