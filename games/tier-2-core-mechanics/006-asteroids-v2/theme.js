/**
 * ASTEROIDS v2 - THEME FILE (Painterly Style)
 * 
 * ALL visual rendering code lives here.
 * Inspired by Art Study 007 - Forest Temple at Sunset
 * Soft gradients, warm/cool color harmony, atmospheric depth
 */

// =============================================================================
// PAINTERLY COLOR PALETTE - Warm vs cool, soft gradients
// =============================================================================

const COLORS = {
    // Background - deep space with warm nebula hints
    bgDeep: '#0a0f18',
    bgMid: '#151020',
    bgWarm: '#201518',
    
    // Ship - teal/cyan with warm highlights
    shipLight: '#90d0d8',
    shipMid: '#5098a8',
    shipDark: '#306070',
    shipHighlight: '#d0f0f0',
    shipWarm: '#d0a070',
    
    // Thrust - warm sunset fire
    thrustBright: '#ffd080',
    thrustMid: '#ff8040',
    thrustDark: '#c04020',
    
    // Asteroids - earthy tones like temple stone
    asteroidLight: '#c0a080',
    asteroidMid: '#806050',
    asteroidDark: '#403020',
    asteroidHighlight: '#e0c8a0',
    
    // Gravity asteroids - mystical purple
    asteroidGravLight: '#9090c0',
    asteroidGravMid: '#606090',
    asteroidGravDark: '#404060',
    asteroidGravGlow: '#b0a0d0',
    
    // Bullets - warm golden energy
    bulletGlow: '#fff0c0',
    bulletCore: '#ffc040',
    bulletTrail: '#ff8020',
    
    // Charged bullet - intense magenta/purple
    chargedGlow: '#ffc0ff',
    chargedCore: '#ff60ff',
    chargedTrail: '#c040c0',
    
    // Gravity well - ethereal blue
    gravityLight: '#a0c0ff',
    gravityMid: '#6080c0',
    gravityDark: '#304060',
    
    // UI - warm gold
    uiGold: '#ffd080',
    uiLight: '#fff0d0',
    uiDark: '#a08040'
};

// Combo colors - warming progression
const COMBO_COLORS = ['#d0d0d0', '#ffd080', '#ffa050', '#ff6030', '#ff40c0'];

// =============================================================================
// THEME OBJECT - Interface for game.js
// =============================================================================

const THEME = {
    ctx: null,
    canvas: null,
    stars: [],
    nebulaClouds: [],
    time: 0,
    
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.generateStarfield();
        this.generateNebula();
    },
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    // Convert hex to rgba
    withAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    },
    
    generateStarfield() {
        this.stars = [];
        const starCount = 150;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() < 0.6 ? 1 : (Math.random() < 0.85 ? 1.5 : 2.5),
                brightness: 0.2 + Math.random() * 0.5,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.01 + Math.random() * 0.02,
                // Warm or cool tint
                tint: Math.random() < 0.3 ? '#ffd8a0' : (Math.random() < 0.5 ? '#a0c0ff' : '#ffffff')
            });
        }
    },
    
    generateNebula() {
        this.nebulaClouds = [];
        const cloudCount = 8;
        
        for (let i = 0; i < cloudCount; i++) {
            this.nebulaClouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 80 + Math.random() * 150,
                // Alternate warm and cool nebula colors
                color: i % 2 === 0 ? 
                    `rgba(60, 30, 50, ${0.1 + Math.random() * 0.1})` : 
                    `rgba(30, 40, 60, ${0.1 + Math.random() * 0.1})`
            });
        }
    },
    
    // =========================================================================
    // DRAW FUNCTIONS
    // =========================================================================
    
    drawBackground(width, height) {
        const ctx = this.ctx;
        
        // Deep space gradient
        const grad = ctx.createRadialGradient(
            width * 0.3, height * 0.4, 0,
            width * 0.5, height * 0.5, width * 0.8
        );
        grad.addColorStop(0, COLORS.bgWarm);
        grad.addColorStop(0.5, COLORS.bgMid);
        grad.addColorStop(1, COLORS.bgDeep);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        // Draw soft nebula clouds
        for (const cloud of this.nebulaClouds) {
            const cloudGrad = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius
            );
            cloudGrad.addColorStop(0, cloud.color);
            cloudGrad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = cloudGrad;
            ctx.fillRect(cloud.x - cloud.radius, cloud.y - cloud.radius, 
                        cloud.radius * 2, cloud.radius * 2);
        }
        
        // Draw twinkling stars with soft glow
        for (const star of this.stars) {
            star.twinkle += star.twinkleSpeed;
            const brightness = star.brightness + Math.sin(star.twinkle) * 0.2;
            
            // Soft glow
            const glowGrad = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size * 3
            );
            glowGrad.addColorStop(0, this.withAlpha(star.tint, brightness));
            glowGrad.addColorStop(0.5, this.withAlpha(star.tint, brightness * 0.3));
            glowGrad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright core
            ctx.fillStyle = this.withAlpha(star.tint, brightness);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawShip(shipState) {
        const { x, y, angle, size, invulnerable, thrusting, charging, chargePercent } = shipState;
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        const flicker = invulnerable > 0 && Math.floor(invulnerable / 5) % 2;
        ctx.globalAlpha = flicker ? 0.4 : 1;
        
        const s = size;
        
        // Thrust flame (behind ship)
        if (thrusting) {
            const flameLength = s * (0.8 + Math.random() * 0.4);
            
            // Outer glow
            const flameGrad = ctx.createLinearGradient(-s * 0.4, 0, -s * 0.4 - flameLength, 0);
            flameGrad.addColorStop(0, this.withAlpha(COLORS.thrustBright, 0.9));
            flameGrad.addColorStop(0.3, this.withAlpha(COLORS.thrustMid, 0.6));
            flameGrad.addColorStop(0.7, this.withAlpha(COLORS.thrustDark, 0.3));
            flameGrad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(-s * 0.4, -s * 0.2);
            ctx.lineTo(-s * 0.4 - flameLength, 0);
            ctx.lineTo(-s * 0.4, s * 0.2);
            ctx.closePath();
            ctx.fill();
        }
        
        // Ship body - sleek triangular shape with soft shading
        // Shadow/dark side
        ctx.fillStyle = COLORS.shipDark;
        ctx.beginPath();
        ctx.moveTo(s * 0.9, 0);           // Nose
        ctx.lineTo(-s * 0.5, -s * 0.5);   // Top wing
        ctx.lineTo(-s * 0.3, 0);          // Back center
        ctx.lineTo(-s * 0.5, s * 0.5);    // Bottom wing
        ctx.closePath();
        ctx.fill();
        
        // Mid tone body
        const bodyGrad = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
        bodyGrad.addColorStop(0, COLORS.shipLight);
        bodyGrad.addColorStop(0.5, COLORS.shipMid);
        bodyGrad.addColorStop(1, COLORS.shipDark);
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(s * 0.8, 0);
        ctx.lineTo(-s * 0.4, -s * 0.4);
        ctx.lineTo(-s * 0.2, 0);
        ctx.lineTo(-s * 0.4, s * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Highlight edge (top)
        ctx.strokeStyle = COLORS.shipHighlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.8, 0);
        ctx.lineTo(-s * 0.3, -s * 0.35);
        ctx.stroke();
        
        // Warm rim light (as if lit by distant sun)
        ctx.strokeStyle = this.withAlpha(COLORS.shipWarm, 0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, -s * 0.38);
        ctx.lineTo(-s * 0.45, -s * 0.45);
        ctx.stroke();
        
        // Cockpit glow
        const cockpitGrad = ctx.createRadialGradient(s * 0.2, 0, 0, s * 0.2, 0, s * 0.25);
        cockpitGrad.addColorStop(0, this.withAlpha(COLORS.shipHighlight, 0.8));
        cockpitGrad.addColorStop(0.5, this.withAlpha(COLORS.shipLight, 0.4));
        cockpitGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = cockpitGrad;
        ctx.beginPath();
        ctx.arc(s * 0.2, 0, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Charge indicator - glowing ring
        if (charging && chargePercent > 0.1) {
            ctx.save();
            ctx.translate(x, y);
            
            const ringRadius = size + 15;
            const chargeAngle = chargePercent * Math.PI * 2;
            
            // Glow behind ring
            const glowColor = chargePercent >= 1 ? COLORS.chargedGlow : COLORS.bulletGlow;
            const coreColor = chargePercent >= 1 ? COLORS.chargedCore : COLORS.bulletCore;
            
            ctx.strokeStyle = this.withAlpha(glowColor, 0.3);
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, -Math.PI / 2, -Math.PI / 2 + chargeAngle);
            ctx.stroke();
            
            ctx.strokeStyle = coreColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, -Math.PI / 2, -Math.PI / 2 + chargeAngle);
            ctx.stroke();
            
            ctx.restore();
        }
    },
    
    drawBullet(bulletState) {
        const { x, y, size, charged } = bulletState;
        const ctx = this.ctx;
        
        if (charged) {
            // Charged shot - glowing magenta orb
            const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
            glowGrad.addColorStop(0, this.withAlpha(COLORS.chargedGlow, 0.9));
            glowGrad.addColorStop(0.3, this.withAlpha(COLORS.chargedCore, 0.5));
            glowGrad.addColorStop(0.6, this.withAlpha(COLORS.chargedTrail, 0.2));
            glowGrad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, size * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal shot - small golden energy ball
            const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            glowGrad.addColorStop(0, this.withAlpha(COLORS.bulletGlow, 0.9));
            glowGrad.addColorStop(0.4, this.withAlpha(COLORS.bulletCore, 0.5));
            glowGrad.addColorStop(0.8, this.withAlpha(COLORS.bulletTrail, 0.2));
            glowGrad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright core
            ctx.fillStyle = COLORS.bulletGlow;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawAsteroid(asteroidState) {
        const { x, y, radius, rotation, hasGravityWell } = asteroidState;
        const ctx = this.ctx;
        const r = radius;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        if (hasGravityWell) {
            // Mystical gravity asteroid - purple with inner glow
            const grad = ctx.createRadialGradient(r * -0.2, r * -0.2, 0, 0, 0, r);
            grad.addColorStop(0, COLORS.asteroidGravGlow);
            grad.addColorStop(0.3, COLORS.asteroidGravLight);
            grad.addColorStop(0.7, COLORS.asteroidGravMid);
            grad.addColorStop(1, COLORS.asteroidGravDark);
            
            ctx.fillStyle = grad;
            
            // Irregular asteroid shape
            ctx.beginPath();
            ctx.moveTo(r * 0.8, r * 0.2);
            ctx.quadraticCurveTo(r * 0.9, r * 0.7, r * 0.3, r * 0.9);
            ctx.quadraticCurveTo(-r * 0.2, r * 0.95, -r * 0.7, r * 0.6);
            ctx.quadraticCurveTo(-r * 1.0, r * 0.1, -r * 0.8, -r * 0.4);
            ctx.quadraticCurveTo(-r * 0.7, -r * 0.9, -r * 0.1, -r * 0.85);
            ctx.quadraticCurveTo(r * 0.4, -r * 0.9, r * 0.7, -r * 0.5);
            ctx.quadraticCurveTo(r * 1.0, -r * 0.1, r * 0.8, r * 0.2);
            ctx.closePath();
            ctx.fill();
            
            // Inner glow for gravity core
            const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
            innerGlow.addColorStop(0, this.withAlpha(COLORS.gravityLight, 0.4));
            innerGlow.addColorStop(1, 'transparent');
            
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // Normal earthy asteroid - like temple stone
            const grad = ctx.createRadialGradient(r * -0.3, r * -0.3, 0, 0, 0, r * 1.1);
            grad.addColorStop(0, COLORS.asteroidHighlight);
            grad.addColorStop(0.3, COLORS.asteroidLight);
            grad.addColorStop(0.7, COLORS.asteroidMid);
            grad.addColorStop(1, COLORS.asteroidDark);
            
            ctx.fillStyle = grad;
            
            // Irregular asteroid shape
            ctx.beginPath();
            ctx.moveTo(r * 0.7, r * 0.3);
            ctx.quadraticCurveTo(r * 0.85, r * 0.65, r * 0.4, r * 0.85);
            ctx.quadraticCurveTo(-r * 0.1, r * 0.9, -r * 0.6, r * 0.55);
            ctx.quadraticCurveTo(-r * 0.95, r * 0.2, -r * 0.75, -r * 0.35);
            ctx.quadraticCurveTo(-r * 0.6, -r * 0.85, -r * 0.05, -r * 0.8);
            ctx.quadraticCurveTo(r * 0.5, -r * 0.85, r * 0.75, -r * 0.4);
            ctx.quadraticCurveTo(r * 0.95, r * 0.0, r * 0.7, r * 0.3);
            ctx.closePath();
            ctx.fill();
            
            // Crater shadows
            ctx.fillStyle = this.withAlpha(COLORS.asteroidDark, 0.4);
            ctx.beginPath();
            ctx.ellipse(r * 0.2, r * 0.1, r * 0.2, r * 0.15, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.12, r * 0.1, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    drawGravityWell(wellState) {
        const { x, y, radius, fadeRatio, animationOffset } = wellState;
        const ctx = this.ctx;
        
        ctx.save();
        ctx.globalAlpha = fadeRatio;
        
        // Swirling rings
        const ringCount = 5;
        for (let ring = 0; ring < ringCount; ring++) {
            const ringRadius = radius * (0.2 + ring * 0.2);
            const alpha = 0.4 - ring * 0.06;
            
            ctx.strokeStyle = this.withAlpha(
                ring % 2 === 0 ? COLORS.gravityLight : COLORS.gravityMid, 
                alpha
            );
            ctx.lineWidth = 3 - ring * 0.4;
            
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 
                animationOffset * (ring % 2 ? 1 : -1), 
                animationOffset * (ring % 2 ? 1 : -1) + Math.PI * 1.5
            );
            ctx.stroke();
        }
        
        // Central glow
        const centerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.3);
        centerGrad.addColorStop(0, this.withAlpha('#ffffff', 0.8));
        centerGrad.addColorStop(0.3, this.withAlpha(COLORS.gravityLight, 0.5));
        centerGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    // Mini ship icon for lives display
    drawMiniShip(x, y) {
        const ctx = this.ctx;
        const s = 10;  // Mini size
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 2);  // Point up
        
        // Simple ship shape
        const grad = ctx.createLinearGradient(0, -s, 0, s);
        grad.addColorStop(0, COLORS.shipLight);
        grad.addColorStop(1, COLORS.shipDark);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(s * 0.8, 0);
        ctx.lineTo(-s * 0.5, -s * 0.5);
        ctx.lineTo(-s * 0.2, 0);
        ctx.lineTo(-s * 0.5, s * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    },
    
    drawFloatingText(textState) {
        const { x, y, text, color, size, alpha } = textState;
        const ctx = this.ctx;
        const scale = 1 + (1 - alpha) * 0.3;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Text shadow/glow
        ctx.font = `bold ${Math.floor(size * scale)}px "Georgia", serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = this.withAlpha('#000000', 0.5);
        ctx.fillText(text, x + 2, y + 2);
        
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    },
    
    drawUI(uiState) {
        const { displayedScore, combo, comboTimer, comboTimeout, comboFlash, lives, canvasWidth, canvasHeight } = uiState;
        const ctx = this.ctx;
        
        // Lives display (top left) - ship icons
        ctx.textAlign = 'left';
        for (let i = 0; i < lives; i++) {
            this.drawMiniShip(30 + i * 30, 35);
        }
        
        // Score display with warm gold style (center)
        ctx.font = 'bold 42px "Georgia", serif';
        ctx.textAlign = 'center';
        
        // Shadow
        ctx.fillStyle = this.withAlpha('#000000', 0.4);
        ctx.fillText(displayedScore.toString(), canvasWidth / 2 + 2, 52);
        
        // Gold gradient for score
        const scoreGrad = ctx.createLinearGradient(canvasWidth / 2 - 50, 20, canvasWidth / 2 + 50, 60);
        scoreGrad.addColorStop(0, COLORS.uiLight);
        scoreGrad.addColorStop(0.5, COLORS.uiGold);
        scoreGrad.addColorStop(1, COLORS.uiDark);
        
        ctx.fillStyle = scoreGrad;
        ctx.fillText(displayedScore.toString(), canvasWidth / 2, 50);
        
        // Combo multiplier
        if (combo > 1 || comboFlash > 0) {
            const color = COMBO_COLORS[Math.min(combo - 1, COMBO_COLORS.length - 1)];
            const flashScale = comboFlash > 0 ? 1 + (comboFlash / 30) * 0.3 : 1;
            const alpha = combo > 1 ? 1 : comboFlash / 30;
            
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${Math.floor(28 * flashScale)}px "Georgia", serif`;
            
            // Shadow
            ctx.fillStyle = this.withAlpha('#000000', 0.4);
            ctx.fillText(`${combo}x COMBO`, canvasWidth / 2 + 2, 87);
            
            ctx.fillStyle = color;
            ctx.fillText(`${combo}x COMBO`, canvasWidth / 2, 85);
            ctx.globalAlpha = 1;
            
            // Combo timer bar
            if (combo > 1 && comboTimer > 0) {
                const barWidth = 100;
                const barHeight = 4;
                const barX = canvasWidth / 2 - barWidth / 2;
                const barY = 95;
                const fillPercent = comboTimer / comboTimeout;
                
                ctx.fillStyle = this.withAlpha('#000000', 0.3);
                ctx.fillRect(barX, barY, barWidth, barHeight);
                
                const barGrad = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
                barGrad.addColorStop(0, color);
                barGrad.addColorStop(1, this.withAlpha(color, 0.5));
                ctx.fillStyle = barGrad;
                ctx.fillRect(barX, barY, barWidth * fillPercent, barHeight);
            }
        }
    },
    
    drawReady(canvasWidth, canvasHeight) {
        const ctx = this.ctx;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Title
        ctx.font = 'bold 56px "Georgia", serif';
        ctx.textAlign = 'center';
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText('ASTEROIDS', canvasWidth / 2 + 3, canvasHeight / 2 - 43);
        
        // Gradient title
        const titleGrad = ctx.createLinearGradient(
            canvasWidth / 2 - 150, canvasHeight / 2 - 80,
            canvasWidth / 2 + 150, canvasHeight / 2 - 20
        );
        titleGrad.addColorStop(0, COLORS.uiLight);
        titleGrad.addColorStop(0.5, COLORS.uiGold);
        titleGrad.addColorStop(1, COLORS.shipLight);
        
        ctx.fillStyle = titleGrad;
        ctx.fillText('ASTEROIDS', canvasWidth / 2, canvasHeight / 2 - 45);
        
        // Subtitle
        ctx.font = '20px "Georgia", serif';
        ctx.fillStyle = this.withAlpha(COLORS.uiLight, 0.7);
        ctx.fillText('Gravity Wells Edition', canvasWidth / 2, canvasHeight / 2 - 10);
        
        // Instructions
        ctx.font = '18px "Georgia", serif';
        ctx.fillStyle = COLORS.uiGold;
        
        // Pulsing effect for "Press ENTER"
        const pulse = 0.6 + Math.sin(this.time * 0.05) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.fillText('Press ENTER to Start', canvasWidth / 2, canvasHeight / 2 + 50);
        ctx.globalAlpha = 1;
        
        // Controls hint
        ctx.font = '14px "Georgia", serif';
        ctx.fillStyle = this.withAlpha(COLORS.uiLight, 0.5);
        ctx.fillText('WASD/Arrows: Move  |  SPACE: Shoot (hold to charge)  |  P: Pause', 
                    canvasWidth / 2, canvasHeight / 2 + 100);
    },
    
    drawGameOver(score, canvasWidth, canvasHeight) {
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Game Over text
        ctx.font = 'bold 52px "Georgia", serif';
        ctx.textAlign = 'center';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText('GAME OVER', canvasWidth / 2 + 3, canvasHeight / 2 - 27);
        
        const overGrad = ctx.createLinearGradient(
            canvasWidth / 2 - 150, canvasHeight / 2 - 60,
            canvasWidth / 2 + 150, canvasHeight / 2
        );
        overGrad.addColorStop(0, '#ff8080');
        overGrad.addColorStop(0.5, '#ff4040');
        overGrad.addColorStop(1, '#c02020');
        
        ctx.fillStyle = overGrad;
        ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 30);
        
        // Score
        ctx.font = '24px "Georgia", serif';
        ctx.fillStyle = COLORS.uiGold;
        ctx.fillText(`Final Score: ${score}`, canvasWidth / 2, canvasHeight / 2 + 20);
        
        // Restart prompt
        ctx.font = '18px "Georgia", serif';
        const pulse = 0.6 + Math.sin(this.time * 0.05) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = COLORS.uiLight;
        ctx.fillText('Press ENTER to play again', canvasWidth / 2, canvasHeight / 2 + 60);
        ctx.globalAlpha = 1;
    },
    
    drawPaused(canvasWidth, canvasHeight) {
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.font = 'bold 48px "Georgia", serif';
        ctx.textAlign = 'center';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText('PAUSED', canvasWidth / 2 + 3, canvasHeight / 2 + 3);
        
        ctx.fillStyle = COLORS.uiLight;
        ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2);
        
        ctx.font = '18px "Georgia", serif';
        ctx.fillStyle = this.withAlpha(COLORS.uiGold, 0.7);
        ctx.fillText('Press P to resume', canvasWidth / 2, canvasHeight / 2 + 40);
    },
    
    // =========================================================================
    // MAIN RENDER FUNCTION
    // =========================================================================
    
    render(gameState) {
        const ctx = this.ctx;
        const { 
            canvas, ship, bullets, asteroids, gravityWells, 
            floatingTexts, ui, screenShake, state, score 
        } = gameState;
        
        this.time++;
        
        // Apply screen shake
        ctx.save();
        if (screenShake > 0.5) {
            const shakeX = (Math.random() - 0.5) * screenShake;
            const shakeY = (Math.random() - 0.5) * screenShake;
            ctx.translate(shakeX, shakeY);
        }
        
        // Draw background with starfield
        this.drawBackground(canvas.width, canvas.height);
        
        // Draw gravity wells (behind everything)
        gravityWells.forEach(w => this.drawGravityWell(w));
        
        // Draw asteroids
        asteroids.forEach(a => this.drawAsteroid(a));
        
        // Draw bullets
        bullets.forEach(b => this.drawBullet(b));
        
        // Draw ship (in all states except gameover)
        if (state !== 'gameover') {
            this.drawShip(ship);
        }
        
        // Draw floating score texts
        floatingTexts.forEach(t => this.drawFloatingText(t));
        
        // Draw UI (only during play states)
        if (state === 'playing' || state === 'paused') {
            this.drawUI(ui);
        }
        
        // Restore from screen shake
        ctx.restore();
        
        // State overlays (not affected by screen shake)
        if (state === 'ready') {
            this.drawReady(canvas.width, canvas.height);
        }
        
        if (state === 'gameover') {
            this.drawGameOver(score, canvas.width, canvas.height);
        }
        
        if (state === 'paused') {
            this.drawPaused(canvas.width, canvas.height);
        }
    }
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = THEME;
}
