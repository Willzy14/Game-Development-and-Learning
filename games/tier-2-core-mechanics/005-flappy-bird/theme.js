// ============================================
// THEME.JS - DEFAULT FLAPPY BIRD THEME
// ============================================
// This file contains ALL visual rendering:
//    - Background (sky, clouds)
//    - Bird rendering
//    - Pipe rendering
//    - Ground rendering
//    - UI text
//
// ❌ NO game logic
// ❌ NO collision detection
// ❌ NO movement/physics
// ❌ NO game constants (speeds, sizes, gravity)
//
// To create a reskin:
// 1. Copy this file
// 2. Change the colors and render methods
// 3. Keep all function signatures the same
// ============================================

const THEME = {
    name: 'Classic Flappy',
    
    // ============================================
    // COLORS
    // ============================================
    colors: {
        sky: '#70c5ce',
        skyLight: '#87ceeb',
        
        ground: '#ded895',
        grass: '#82c46c',
        
        pipe: '#72b01d',
        pipeCap: '#5a9216',
        
        bird: '#ffd700',
        birdEye: 'white',
        birdPupil: 'black',
        birdBeak: '#ff6b35',
        
        text: '#ffffff',
        textShadow: '#000000'
    },
    
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
    // BACKGROUND
    // ============================================
    drawBackground(bgX) {
        const ctx = this.ctx;
        
        // Sky
        ctx.fillStyle = this.colors.skyLight;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Scrolling background
        ctx.fillStyle = this.colors.sky;
        ctx.fillRect(bgX, 0, this.width, this.height - 50);
        ctx.fillRect(bgX + this.width, 0, this.width, this.height - 50);
    },
    
    // ============================================
    // GROUND
    // ============================================
    drawGround() {
        const ctx = this.ctx;
        
        // Ground
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.height - 50, this.width, 50);
        
        // Grass
        ctx.fillStyle = this.colors.grass;
        ctx.fillRect(0, this.height - 52, this.width, 4);
    },
    
    // ============================================
    // PIPE RENDERING
    // ============================================
    drawPipe(pipe, pipeWidth) {
        const ctx = this.ctx;
        
        // Top pipe
        ctx.fillStyle = this.colors.pipe;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
        
        // Top pipe cap
        ctx.fillStyle = this.colors.pipeCap;
        ctx.fillRect(pipe.x - 4, pipe.gapY - 30, pipeWidth + 8, 30);
        
        // Bottom pipe
        const bottomPipeY = pipe.gapY + pipe.gapSize;
        ctx.fillStyle = this.colors.pipe;
        ctx.fillRect(pipe.x, bottomPipeY, pipeWidth, this.height - bottomPipeY - 50);
        
        // Bottom pipe cap
        ctx.fillStyle = this.colors.pipeCap;
        ctx.fillRect(pipe.x - 4, bottomPipeY, pipeWidth + 8, 30);
    },
    
    // ============================================
    // BIRD RENDERING
    // ============================================
    drawBird(state, birdSize) {
        const ctx = this.ctx;
        const { x, y, rotation } = state;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Bird body (simple circle)
        ctx.fillStyle = this.colors.bird;
        ctx.beginPath();
        ctx.arc(0, 0, birdSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird eye
        ctx.fillStyle = this.colors.birdEye;
        ctx.beginPath();
        ctx.arc(6, -6, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.colors.birdPupil;
        ctx.beginPath();
        ctx.arc(8, -6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird beak
        ctx.fillStyle = this.colors.birdBeak;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(20, -2);
        ctx.lineTo(20, 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    },
    
    // ============================================
    // UI RENDERING
    // ============================================
    drawScore(score) {
        // Score is handled by DOM in this version
        // Override for canvas-based score
    },
    
    // ============================================
    // MAIN RENDER (called every frame)
    // ============================================
    render(gameState, constants) {
        const { bird, pipes, bgX, currentState, score } = gameState;
        const { PIPE_WIDTH, BIRD_SIZE, GameState } = constants;
        
        // Draw background first
        this.drawBackground(bgX);
        
        // Draw pipes
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
