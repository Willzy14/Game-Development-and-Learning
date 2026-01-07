// ============================================
// THEME.JS - DEFAULT BREAKOUT THEME
// ============================================
// This file contains ALL visual rendering:
//    - Colors and gradients
//    - Background rendering
//    - Entity rendering (paddle, ball, bricks)
//    - UI rendering
//    - Visual effects (particles, glow)
//
// ❌ NO game logic
// ❌ NO collision detection
// ❌ NO movement/physics
// ❌ NO game constants (speeds, sizes, positions)
//
// To create a reskin:
// 1. Copy this file
// 2. Change the colors and render methods
// 3. Keep all function signatures the same
// ============================================

const THEME = {
    name: 'Classic Neon',
    
    // ============================================
    // COLORS
    // ============================================
    colors: {
        background: '#000000',
        paddle: '#00ffff',
        paddleHighlight: 'rgba(255, 255, 255, 0.3)',
        ball: '#ffffff',
        ballGlow: 'rgba(255, 255, 255, 0.8)',
        text: '#ffffff',
        textMuted: '#aaaaaa',
        textSuccess: '#66ff66',
        textDanger: '#ff6666',
        
        // Brick colors by row
        brickColors: [
            '#ff0066',  // Pink
            '#ff6600',  // Orange
            '#ffcc00',  // Yellow
            '#00ff66',  // Green
            '#0066ff',  // Blue
            '#6600ff'   // Purple
        ]
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
    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.width, this.height);
    },
    
    // ============================================
    // PADDLE RENDERING
    // ============================================
    drawPaddle(state) {
        const ctx = this.ctx;
        const { x, y, width, height } = state;
        
        // Main paddle body
        ctx.fillStyle = this.colors.paddle;
        ctx.fillRect(x, y, width, height);
        
        // Highlight for 3D effect
        ctx.fillStyle = this.colors.paddleHighlight;
        ctx.fillRect(x, y, width, height / 3);
    },
    
    // ============================================
    // BALL RENDERING
    // ============================================
    drawBall(state) {
        const ctx = this.ctx;
        const { x, y, radius } = state;
        
        // Main ball
        ctx.fillStyle = this.colors.ball;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, this.colors.ballGlow);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // ============================================
    // BRICK RENDERING
    // ============================================
    drawBrick(state) {
        const ctx = this.ctx;
        const { x, y, width, height, row, destroyed } = state;
        
        if (destroyed) return;
        
        const color = this.colors.brickColors[row % this.colors.brickColors.length];
        
        // Main brick
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        // Highlight (3D effect)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, width, height / 3);
        
        // Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    },
    
    // ============================================
    // UI RENDERING
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
        ctx.fillText('PRESS SPACE TO START', centerX, centerY);
        
        ctx.font = '18px "Courier New"';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText('Break all the bricks!', centerX, centerY + 40);
    },
    
    drawBallLostScreen() {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.textDanger;
        ctx.font = '24px "Courier New"';
        ctx.fillText('BALL LOST!', this.width / 2, this.height / 2);
    },
    
    drawLevelCompleteScreen(level) {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.textSuccess;
        ctx.font = '32px "Courier New"';
        ctx.fillText(`LEVEL ${level - 1} COMPLETE!`, this.width / 2, this.height / 2);
    },
    
    drawGameOverScreen(score) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.fillStyle = this.colors.textDanger;
        ctx.font = '48px "Courier New"';
        ctx.fillText('GAME OVER', centerX, centerY - 30);
        
        ctx.font = '24px "Courier New"';
        ctx.fillStyle = this.colors.text;
        ctx.fillText(`Final Score: ${score}`, centerX, centerY + 20);
        
        ctx.font = '18px "Courier New"';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText('Press SPACE to restart', centerX, centerY + 60);
    },
    
    // ============================================
    // MAIN RENDER (called every frame)
    // ============================================
    render(gameState, currentState, GameState) {
        // Draw background first
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
