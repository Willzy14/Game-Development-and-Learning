/**
 * TIME-SLICE RUNNER - VISUAL THEME
 * 
 * Painterly mystical time-traveler aesthetic
 * All rendering happens here, NO game logic
 */

const THEME = {
    ctx: null,
    width: 0,
    height: 0,
    
    // Background layers for parallax
    bgLayers: [],
    
    /**
     * Initialize theme
     */
    init(context, canvasWidth, canvasHeight) {
        this.ctx = context;
        this.width = canvasWidth;
        this.height = canvasHeight;
        
        // Generate background layers
        this.generateBackgroundLayers();
        
        console.log('🎨 Theme initialized');
    },
    
    /**
     * Generate parallax background layers with time-travel theme
     */
    generateBackgroundLayers() {
        this.bgLayers = [];
        
        // Layer 1: Far clock towers (slowest, atmospheric perspective)
        for (let i = 0; i < 5; i++) {
            this.bgLayers.push({
                layer: 1,
                type: 'clocktower',
                x: i * 350 + Math.random() * 100,
                y: 80 + Math.random() * 40,
                height: 120 + Math.random() * 60,
                width: 30 + Math.random() * 20,
                speed: 0.1
            });
        }
        
        // Layer 2: Mid floating gears
        for (let i = 0; i < 12; i++) {
            this.bgLayers.push({
                layer: 2,
                type: 'gear',
                x: i * 200 + Math.random() * 150,
                y: 100 + Math.random() * 200,
                size: 25 + Math.random() * 35,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                speed: 0.3
            });
        }
        
        // Layer 3: Near time mist
        for (let i = 0; i < 15; i++) {
            this.bgLayers.push({
                layer: 3,
                type: 'mist',
                x: i * 120 + Math.random() * 80,
                y: 250 + Math.random() * 150,
                size: 80 + Math.random() * 70,
                alpha: 0.1 + Math.random() * 0.15,
                speed: 0.6
            });
        }
    },
    
    /**
     * Main render function
     */
    render(state) {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = state.timeSliceActive 
            ? '#1a1020'  // Darker purple during time-slice
            : '#0f0820'; // Dark blue-purple
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render based on game state
        if (state.state === 'modeselect') {
            this.renderModeSelect(state);
        } else if (state.state === 'playing') {
            this.renderGame(state);
        } else if (state.state === 'paused') {
            this.renderGame(state);
            this.renderPauseMenu(state);
        } else if (state.state === 'gameover') {
            this.renderGame(state);
            this.renderGameOver(state);
        }
    },
    
    /**
     * Render mode selection screen
     */
    renderModeSelect(state) {
        const ctx = this.ctx;
        
        // Title
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#64c8ff';
        ctx.textAlign = 'center';
        ctx.fillText('TIME-SLICE RUNNER', this.width / 2, 100);
        
        // Subtitle
        ctx.font = '18px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('Hold SHIFT to slow time | Land perfectly to refill chrono meter', this.width / 2, 140);
        
        // Mode selection
        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('SELECT DIFFICULTY:', this.width / 2, 200);
        
        const modes = [
            { key: 'easy', name: 'EASY', num: '1' },
            { key: 'normal', name: 'NORMAL', num: '2' },
            { key: 'hard', name: 'HARD', num: '3' }
        ];
        
        modes.forEach((mode, i) => {
            const y = 260 + i * 80;
            const modeData = state.modes[mode.key];
            const unlocked = modeData.unlocked;
            
            // Mode box
            ctx.fillStyle = unlocked ? modeData.color + '22' : '#222';
            ctx.fillRect(this.width / 2 - 180, y - 30, 360, 60);
            
            if (unlocked) {
                ctx.strokeStyle = modeData.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(this.width / 2 - 180, y - 30, 360, 60);
            }
            
            // Mode text
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = unlocked ? modeData.color : '#555';
            ctx.textAlign = 'center';
            ctx.fillText(`[${mode.num}] ${mode.name}`, this.width / 2, y + 5);
            
            // High score
            if (unlocked) {
                ctx.font = '16px Arial';
                ctx.fillStyle = '#888';
                ctx.fillText(`High Score: ${state.highScores[mode.key]}`, this.width / 2, y + 25);
            } else {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#666';
                ctx.fillText(`Unlock at ${modeData.unlockThreshold} points`, this.width / 2, y + 25);
            }
        });
        
        // Instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Press number key to select | SPACE/UP - Jump | SHIFT - Time-Slice | P/ESC - Pause', this.width / 2, 480);
    },
    
    /**
     * Render main game
     */
    renderGame(state) {
        const ctx = this.ctx;
        
        // Parallax background
        this.renderBackground(state);
        
        // Platforms
        state.platforms.forEach(platform => {
            this.renderPlatform(platform);
        });
        
        // Particles
        state.particles.forEach(particle => {
            this.renderParticle(particle);
        });
        
        // Player
        if (state.player) {
            this.renderPlayer(state.player, state.timeSliceActive);
        }
        
        // HUD
        this.renderHUD(state);
        
        // Time-slice visual effect
        if (state.timeSliceActive) {
            this.renderTimeSliceEffect();
        }
    },
    
    /**
     * Render parallax background with time-travel theme
     */
    renderBackground(state) {
        const ctx = this.ctx;
        const scrollFactor = state.distance * 0.1;
        
        this.bgLayers.forEach(obj => {
            const x = (obj.x - scrollFactor * obj.speed) % (this.width + (obj.width || obj.size) * 2) - (obj.width || obj.size);
            
            if (obj.type === 'clocktower') {
                // Far clock towers (atmospheric perspective - desaturated, lighter)
                ctx.globalAlpha = 0.12;
                
                // Tower body
                ctx.fillStyle = state.timeSliceActive ? '#4a3520' : '#2a3545';
                ctx.fillRect(x - obj.width / 2, obj.y, obj.width, obj.height);
                
                // Clock face (lighter for distance)
                const clockY = obj.y + obj.height * 0.3;
                ctx.fillStyle = state.timeSliceActive ? '#6a5530' : '#3a4555';
                ctx.beginPath();
                ctx.arc(x, clockY, obj.width * 0.6, 0, Math.PI * 2);
                ctx.fill();
                
                // Clock hands
                ctx.strokeStyle = state.timeSliceActive ? '#8a7540' : '#5a6575';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, clockY);
                ctx.lineTo(x + 3, clockY - 5);
                ctx.stroke();
                
                ctx.globalAlpha = 1.0;
                
            } else if (obj.type === 'gear') {
                // Mid floating gears (moderate saturation, depth)
                ctx.globalAlpha = 0.18;
                
                // Update rotation
                obj.rotation += obj.rotationSpeed;
                
                ctx.save();
                ctx.translate(x, obj.y);
                ctx.rotate(obj.rotation);
                
                // Gear body
                ctx.fillStyle = state.timeSliceActive ? '#aa7733' : '#6688aa';
                ctx.beginPath();
                ctx.arc(0, 0, obj.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Gear teeth
                const teeth = 8;
                for (let i = 0; i < teeth; i++) {
                    const angle = (i / teeth) * Math.PI * 2;
                    const tx = Math.cos(angle) * obj.size * 0.8;
                    const ty = Math.sin(angle) * obj.size * 0.8;
                    
                    ctx.fillRect(tx - 2, ty - 4, 4, 8);
                }
                
                // Center hole
                ctx.fillStyle = state.timeSliceActive ? '#332211' : '#223344';
                ctx.beginPath();
                ctx.arc(0, 0, obj.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                ctx.globalAlpha = 1.0;
                
            } else if (obj.type === 'mist') {
                // Near time mist (high saturation, darker for temperature)
                ctx.globalAlpha = obj.alpha;
                
                // Painterly layered mist
                const mistGradient = ctx.createRadialGradient(x, obj.y, 0, x, obj.y, obj.size);
                
                if (state.timeSliceActive) {
                    mistGradient.addColorStop(0, 'rgba(180, 100, 30, 0.4)');
                    mistGradient.addColorStop(0.5, 'rgba(120, 60, 20, 0.2)');
                    mistGradient.addColorStop(1, 'rgba(60, 30, 10, 0)');
                } else {
                    mistGradient.addColorStop(0, 'rgba(80, 120, 180, 0.4)');
                    mistGradient.addColorStop(0.5, 'rgba(50, 80, 140, 0.2)');
                    mistGradient.addColorStop(1, 'rgba(30, 50, 100, 0)');
                }
                
                ctx.fillStyle = mistGradient;
                ctx.beginPath();
                ctx.ellipse(x, obj.y, obj.size, obj.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.globalAlpha = 1.0;
            }
        });
    },
    
    /**
     * Render platform with time-travel theme
     */
    renderPlatform(platform) {
        const ctx = this.ctx;
        
        if (platform.type === 'golden') {
            // Golden platform with gear mechanisms
            // Base
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Animated glow
            const glowPulse = 0.2 + Math.sin(Date.now() / 300) * 0.1;
            ctx.globalAlpha = glowPulse;
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(platform.x - 2, platform.y - 2, platform.width + 4, platform.height + 4);
            ctx.globalAlpha = 1.0;
            
            // Gear etchings
            const gearCount = Math.floor(platform.width / 40);
            for (let i = 0; i < gearCount; i++) {
                const gx = platform.x + (i + 0.5) * (platform.width / gearCount);
                const gy = platform.y + platform.height / 2;
                
                ctx.strokeStyle = '#cc8800';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(gx, gy, 6, 0, Math.PI * 2);
                ctx.stroke();
                
                // Gear teeth (simplified)
                for (let t = 0; t < 6; t++) {
                    const angle = (t / 6) * Math.PI * 2;
                    const tx = gx + Math.cos(angle) * 5;
                    const ty = gy + Math.sin(angle) * 5;
                    ctx.fillStyle = '#cc8800';
                    ctx.fillRect(tx - 1, ty - 1, 2, 2);
                }
            }
            
            // Center marker
            ctx.fillStyle = '#fff';
            const centerX = platform.x + platform.width / 2;
            ctx.fillRect(centerX - 1, platform.y - 5, 2, platform.height + 10);
            
        } else {
            // Normal platform with clock face etchings
            // Painterly base (layered strokes)
            const gradient = ctx.createLinearGradient(
                platform.x,
                platform.y,
                platform.x,
                platform.y + platform.height
            );
            gradient.addColorStop(0, '#5599cc');
            gradient.addColorStop(0.5, '#4488bb');
            gradient.addColorStop(1, '#3377aa');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Top highlight (warm light source - color temperature)
            ctx.fillStyle = 'rgba(180, 220, 255, 0.6)';
            ctx.fillRect(platform.x, platform.y, platform.width, 2);
            
            // Clock face etching (center of platform)
            const clockX = platform.x + platform.width / 2;
            const clockY = platform.y + platform.height / 2;
            const clockSize = Math.min(platform.height * 0.6, 8);
            
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(clockX, clockY, clockSize, 0, Math.PI * 2);
            ctx.stroke();
            
            // Roman numeral marks (XII, III, VI, IX positions)
            for (let i = 0; i < 12; i++) {
                if (i % 3 === 0) { // Only quarter hours
                    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    const mx = clockX + Math.cos(angle) * clockSize * 0.7;
                    const my = clockY + Math.sin(angle) * clockSize * 0.7;
                    
                    ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
                    ctx.beginPath();
                    ctx.arc(mx, my, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Perfect zone indicator (glowing runes)
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#00ffff';
            const perfectWidth = platform.width * 0.2;
            const perfectX = platform.x + platform.width / 2 - perfectWidth / 2;
            ctx.fillRect(perfectX, platform.y, perfectWidth, platform.height);
            
            // Rune lines
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(perfectX, platform.y);
            ctx.lineTo(perfectX, platform.y + platform.height);
            ctx.moveTo(perfectX + perfectWidth, platform.y);
            ctx.lineTo(perfectX + perfectWidth, platform.y + platform.height);
            ctx.stroke();
            
            ctx.globalAlpha = 1.0;
        }
    },
    
    /**
     * Render player with high-contrast time-traveler design
     */
    renderPlayer(player, timeSliceActive) {
        const ctx = this.ctx;
        
        // Landing flash effect
        if (player.landingFlash > 0) {
            ctx.globalAlpha = player.landingFlash * 0.5;
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(
                player.x + player.width / 2,
                player.y + player.height / 2,
                player.width * 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
        
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        // Time-ribbon trail (flowing behind when moving)
        if (!player.onGround) {
            const trailLength = 5;
            for (let i = 0; i < trailLength; i++) {
                const alpha = (trailLength - i) / trailLength * 0.3;
                const ribbonY = centerY + i * 4;
                
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = timeSliceActive ? '#ffaa00' : '#64c8ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(centerX - 8, ribbonY);
                ctx.quadraticCurveTo(
                    centerX + Math.sin(Date.now() / 100 + i) * 4,
                    ribbonY + 3,
                    centerX + 8,
                    ribbonY
                );
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        }
        
        // Rotating clock hands (embedded in character)
        const handRotation = (Date.now() / 1000) % (Math.PI * 2);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(handRotation);
        
        // Minute hand (longer)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -14);
        ctx.stroke();
        
        ctx.restore();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(handRotation * 12); // Hour hand moves faster
        
        // Hour hand (shorter)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -9);
        ctx.stroke();
        
        ctx.restore();
        
        // HIGH CONTRAST core (inspired by scarab's bright center)
        // Dark outer shell
        ctx.fillStyle = '#0a0515';
        ctx.strokeStyle = '#1a1030';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Bright inner glow (chiaroscuro technique)
        const glowGradient = ctx.createRadialGradient(
            centerX,
            centerY - 3,
            0,
            centerX,
            centerY,
            13
        );
        
        if (timeSliceActive) {
            glowGradient.addColorStop(0, '#ffffff');
            glowGradient.addColorStop(0.3, '#ffee88');
            glowGradient.addColorStop(0.6, '#ffaa00');
            glowGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');
        } else {
            glowGradient.addColorStop(0, '#ffffff');
            glowGradient.addColorStop(0.3, '#ccf0ff');
            glowGradient.addColorStop(0.6, '#64c8ff');
            glowGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        }
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 13, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright white core (extreme contrast)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 2, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Clock face markings (Roman numerals style)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const markX = centerX + Math.cos(angle) * 12;
            const markY = centerY + Math.sin(angle) * 12;
            
            ctx.fillStyle = i % 3 === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(markX, markY, i % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Outer energy ring (pulsing)
        const pulseSize = 1 + Math.sin(Date.now() / 150) * 0.15;
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = timeSliceActive ? '#ffaa00' : '#64c8ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 18 * pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    },
    
    /**
     * Render particle
     */
    renderParticle(particle) {
        const ctx = this.ctx;
        const alpha = particle.life / particle.maxLife;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1.0;
    },
    
    /**
     * Render HUD
     */
    renderHUD(state) {
        const ctx = this.ctx;
        
        // Chrono meter
        const meterWidth = 200;
        const meterHeight = 20;
        const meterX = this.width - meterWidth - 20;
        const meterY = 20;
        
        // Meter background
        ctx.fillStyle = '#222';
        ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Meter fill
        const fillWidth = (state.chronoMeter / state.chronoMax) * meterWidth;
        const gradient = ctx.createLinearGradient(meterX, 0, meterX + meterWidth, 0);
        
        if (state.chronoMeter < 20) {
            // Low chrono - red warning
            gradient.addColorStop(0, '#ff4444');
            gradient.addColorStop(1, '#aa0000');
        } else {
            gradient.addColorStop(0, '#ffcc00');
            gradient.addColorStop(1, '#ff8800');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
        
        // Meter border
        ctx.strokeStyle = state.chronoMeter < 20 ? '#ff0000' : '#ffaa00';
        ctx.lineWidth = 2;
        ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
        
        // Meter label
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('CHRONO', meterX, meterY - 5);
        
        // Pulse effect when low
        if (state.chronoMeter < 20 && Math.sin(Date.now() / 100) > 0.5) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(meterX - 3, meterY - 3, meterWidth + 6, meterHeight + 6);
            ctx.globalAlpha = 1.0;
        }
        
        // Score
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${Math.floor(state.score)}`, 20, 30);
        
        // Distance
        ctx.font = '16px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Distance: ${state.distance}m`, 20, 55);
        
        // High score for current mode
        ctx.font = '14px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText(`Best: ${state.highScores[state.currentMode]}`, 20, 75);
        
        // Current mode indicator
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = state.modeSettings.color;
        ctx.textAlign = 'right';
        ctx.fillText(state.modeSettings.name.toUpperCase(), this.width - 20, meterY + meterHeight + 30);
        
        // Time-slice indicator
        if (state.timeSliceActive) {
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#ffaa00';
            ctx.textAlign = 'center';
            ctx.fillText('TIME-SLICE ACTIVE', this.width / 2, 50);
            
            // Speed indicator
            ctx.font = '14px Arial';
            ctx.fillStyle = '#ff8800';
            ctx.fillText(`${Math.floor(state.gameSpeed * 100)}% SPEED`, this.width / 2, 70);
        }
    },
    
    /**
     * Render time-slice visual effect
     */
    renderTimeSliceEffect() {
        const ctx = this.ctx;
        
        // Warm overlay
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1.0;
        
        // Radial distortion lines (fake motion blur)
        ctx.globalAlpha = 0.05;
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * this.width,
                centerY + Math.sin(angle) * this.height
            );
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
    },
    
    /**
     * Render pause menu
     */
    renderPauseMenu(state) {
        const ctx = this.ctx;
        
        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Title
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#64c8ff';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', this.width / 2, 100);
        
        // Options
        const options = [
            '[ESC/P] Resume',
            '[R] Restart',
            '[Q] Quit to Menu',
            '',
            'Settings:',
            `[+/-] Volume: ${Math.floor(state.settings.volume * 100)}%`,
            `[T] Particles: ${state.settings.particlesEnabled ? 'ON' : 'OFF'}`,
            `[S] Screen Shake: ${state.settings.screenShakeEnabled ? 'ON' : 'OFF'}`
        ];
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fff';
        
        options.forEach((option, i) => {
            const y = 180 + i * 35;
            if (option === '' || option === 'Settings:') {
                ctx.fillStyle = '#888';
                ctx.font = 'bold 20px Arial';
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
            }
            ctx.fillText(option, this.width / 2, y);
        });
    },
    
    /**
     * Render game over screen
     */
    renderGameOver(state) {
        const ctx = this.ctx;
        
        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Title
        ctx.font = 'bold 56px Arial';
        ctx.fillStyle = '#ff6464';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.width / 2, 120);
        
        // Final score
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Final Score: ${Math.floor(state.score)}`, this.width / 2, 180);
        
        // Distance
        ctx.font = '24px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Distance: ${state.distance}m`, this.width / 2, 220);
        
        // High score
        const isNewHighScore = Math.floor(state.score) > state.highScores[state.currentMode];
        if (isNewHighScore) {
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#ffaa00';
            ctx.fillText('🎉 NEW HIGH SCORE! 🎉', this.width / 2, 270);
        } else {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`High Score: ${state.highScores[state.currentMode]}`, this.width / 2, 270);
        }
        
        // Continue prompt
        ctx.font = '24px Arial';
        ctx.fillStyle = '#64c8ff';
        ctx.fillText('[ENTER] Return to Menu', this.width / 2, 350);
    }
};
