// ============================================
// THEME.JS - VISUALS ONLY
// ============================================
// This file contains ALL rendering code:
//    - Colors and gradients
//    - How entities look
//    - Visual effects
//    - Background art
//
// ❌ NO physics or collision logic
// ❌ NO scoring or game state changes
// ❌ NO game constants (those live in game.js)
//
// To create a new theme:
// 1. Copy this file
// 2. Change ONLY the visual appearance
// 3. Keep all function signatures the same
// ============================================

const THEME = {
    // Canvas context reference
    ctx: null,
    
    // ============================================
    // THEME-SPECIFIC COLORS (customize these!)
    // ============================================
    COLORS: {
        background: '#1a1a2e',
        backgroundGradientEnd: '#16213e',
        player: '#00ffff',
        playerHighlight: 'rgba(255, 255, 255, 0.3)',
        enemy: '#ff4444',
        enemyHighlight: '#ff8888',
        particle: '#ffffff',
        text: '#ffffff',
        textShadow: 'rgba(0, 255, 255, 0.5)',
        uiBackground: 'rgba(0, 0, 0, 0.5)'
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    init(canvas) {
        this.ctx = canvas.getContext('2d');
    },
    
    // ============================================
    // BACKGROUND
    // ============================================
    
    drawBackground(W, H) {
        const ctx = this.ctx;
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, this.COLORS.background);
        gradient.addColorStop(1, this.COLORS.backgroundGradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        
        // Optional: Add decorative elements here
        // Stars, patterns, whatever fits the theme
    },
    
    // ============================================
    // PLAYER
    // ============================================
    
    drawPlayer(player) {
        const ctx = this.ctx;
        
        // Main player shape
        ctx.fillStyle = this.COLORS.player;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Highlight for 3D effect
        ctx.fillStyle = this.COLORS.playerHighlight;
        ctx.fillRect(player.x, player.y, player.width, player.height / 3);
        
        // Optional: Add glow effect
        ctx.shadowColor = this.COLORS.player;
        ctx.shadowBlur = 15;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;
    },
    
    // ============================================
    // ENEMIES
    // ============================================
    
    drawEnemy(enemy) {
        if (!enemy.active) return;
        
        const ctx = this.ctx;
        
        // Main enemy shape
        ctx.fillStyle = this.COLORS.enemy;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Highlight
        ctx.fillStyle = this.COLORS.enemyHighlight;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height / 4);
    },
    
    // ============================================
    // PARTICLES
    // ============================================
    
    drawParticle(particle) {
        const ctx = this.ctx;
        
        ctx.globalAlpha = particle.life / 30; // Fade out
        ctx.fillStyle = particle.color || this.COLORS.particle;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size || 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    },
    
    // ============================================
    // UI
    // ============================================
    
    drawUI(score, lives, W, H) {
        const ctx = this.ctx;
        
        // Score
        ctx.fillStyle = this.COLORS.text;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 20, 35);
        
        // Lives
        ctx.textAlign = 'right';
        ctx.fillText(`Lives: ${lives}`, W - 20, 35);
    },
    
    drawMenuScreen(W, H) {
        const ctx = this.ctx;
        
        ctx.fillStyle = this.COLORS.uiBackground;
        ctx.fillRect(0, 0, W, H);
        
        ctx.fillStyle = this.COLORS.text;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME NAME', W / 2, H / 2 - 50);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE or ENTER to start', W / 2, H / 2 + 20);
    },
    
    drawGameOverScreen(score, W, H) {
        const ctx = this.ctx;
        
        ctx.fillStyle = this.COLORS.uiBackground;
        ctx.fillRect(0, 0, W, H);
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 50);
        
        ctx.fillStyle = this.COLORS.text;
        ctx.font = '32px Arial';
        ctx.fillText(`Final Score: ${score}`, W / 2, H / 2 + 10);
        
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE or ENTER to continue', W / 2, H / 2 + 60);
    },
    
    drawPausedScreen(W, H) {
        const ctx = this.ctx;
        
        ctx.fillStyle = this.COLORS.uiBackground;
        ctx.fillRect(0, 0, W, H);
        
        ctx.fillStyle = this.COLORS.text;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', W / 2, H / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press ESC to resume', W / 2, H / 2 + 50);
    },
    
    // ============================================
    // OPTIONAL EFFECTS (implement if needed)
    // ============================================
    
    spawnDestroyParticles(x, y) {
        // Called by game.js when enemy destroyed
        // Add particles to the game's particle array
        // This is just for visual effect, no game logic
    },
    
    playHitEffect() {
        // Screen shake, flash, etc.
    },
    
    // ============================================
    // MAIN RENDER FUNCTION
    // ============================================
    
    render(gameState) {
        const { state, player, enemies, particles, score, lives, canvas } = gameState;
        const ctx = this.ctx;
        const W = canvas.width;
        const H = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, W, H);
        
        // Always draw background
        this.drawBackground(W, H);
        
        // State-specific rendering
        if (state === 'menu') {
            this.drawMenuScreen(W, H);
            return;
        }
        
        if (state === 'gameover') {
            this.drawBackground(W, H);
            this.drawGameOverScreen(score, W, H);
            return;
        }
        
        if (state === 'paused') {
            // Draw game state underneath
            enemies.forEach(e => this.drawEnemy(e));
            this.drawPlayer(player);
            this.drawUI(score, lives, W, H);
            // Overlay pause screen
            this.drawPausedScreen(W, H);
            return;
        }
        
        // Playing state - render everything
        enemies.forEach(e => this.drawEnemy(e));
        this.drawPlayer(player);
        particles.forEach(p => this.drawParticle(p));
        this.drawUI(score, lives, W, H);
    }
};
