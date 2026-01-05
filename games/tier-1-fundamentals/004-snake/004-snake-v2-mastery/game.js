// ============================================
// HIGH SCORE SYSTEM - localStorage Persistence
// ============================================
class HighScoreManager {
    constructor() {
        this.storageKey = 'snake_high_scores';
        this.statsKey = 'snake_stats';
        this.maxScores = 5;
    }
    
    // Load high scores from localStorage
    loadScores() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Failed to load high scores:', e);
            return [];
        }
    }
    
    // Save high scores to localStorage
    saveScores(scores) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(scores));
        } catch (e) {
            console.warn('Failed to save high scores:', e);
        }
    }
    
    // Check if a score qualifies for the leaderboard
    isHighScore(score) {
        const scores = this.loadScores();
        return scores.length < this.maxScores || score > scores[scores.length - 1].score;
    }
    
    // Add a new high score
    addScore(name, score, length, combo) {
        const scores = this.loadScores();
        const newEntry = {
            name: name || 'Anonymous',
            score: score,
            length: length,
            combo: combo,
            date: new Date().toISOString()
        };
        
        scores.push(newEntry);
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 5
        const trimmed = scores.slice(0, this.maxScores);
        this.saveScores(trimmed);
        
        // Return the rank (1-5)
        return trimmed.findIndex(s => s === newEntry) + 1;
    }
    
    // Get top scores
    getTopScores() {
        return this.loadScores();
    }
    
    // Load stats
    loadStats() {
        try {
            const saved = localStorage.getItem(this.statsKey);
            return saved ? JSON.parse(saved) : {
                gamesPlayed: 0,
                totalFood: 0,
                bestScore: 0,
                bestCombo: 0,
                bestLength: 0
            };
        } catch (e) {
            console.warn('Failed to load stats:', e);
            return {
                gamesPlayed: 0,
                totalFood: 0,
                bestScore: 0,
                bestCombo: 0,
                bestLength: 0
            };
        }
    }
    
    // Update stats
    updateStats(score, foodEaten, combo, length) {
        const stats = this.loadStats();
        stats.gamesPlayed++;
        stats.totalFood += foodEaten;
        stats.bestScore = Math.max(stats.bestScore, score);
        stats.bestCombo = Math.max(stats.bestCombo, combo);
        stats.bestLength = Math.max(stats.bestLength, length);
        
        try {
            localStorage.setItem(this.statsKey, JSON.stringify(stats));
        } catch (e) {
            console.warn('Failed to save stats:', e);
        }
    }
    
    // Clear all data (for debugging/reset)
    clearAll() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.statsKey);
    }
}

// Create global high score manager
const highScoreManager = new HighScoreManager();

// ============================================
// GAME CONSTANTS
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Grid constants
const GRID_SIZE = 20;  // Size of each cell in pixels (kept at 20 for visual consistency)
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;   // 40 cells wide
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE; // 40 cells tall

// Game constants
const MOVE_INTERVAL = 120; // Milliseconds between moves (slightly faster for bigger grid)
const INITIAL_LENGTH = 3;

// Power-up types and properties
const PowerUpType = {
    SPEED: {
        name: 'Speed Boost',
        color: '#00aaff',
        glowColor: '#00aaff',
        duration: 8000, // milliseconds
        icon: '⚡',
        effect: 'moveSpeed'
    },
    INVINCIBLE: {
        name: 'Invincibility',
        color: '#ffaa00',
        glowColor: '#ffaa00',
        duration: 6000,
        icon: '★',
        effect: 'invincible'
    },
    DOUBLE_POINTS: {
        name: 'Double Points',
        color: '#aa00ff',
        glowColor: '#aa00ff',
        duration: 10000,
        icon: '2×',
        effect: 'doublePoints'
    },
    GHOST: {
        name: 'Ghost Mode',
        color: '#00ffff',
        glowColor: '#00ffff',
        duration: 5000,
        icon: '👻',
        effect: 'ghost'
    }
};

const POWERUP_SPAWN_CHANCE = 0.15; // 15% chance to spawn power-up instead of regular food

// Direction constants
const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// V2 MASTERY COLOR SCHEME - Vibrant cyan/magenta theme
const V2_COLORS = {
    snakePrimary: '#00ffee',      // Bright cyan (was #00ff88 green)
    snakeSecondary: '#00aabb',    // Darker cyan
    snakeGlow: '#00ffee',         // Cyan glow
    accent: '#ff00ff',            // Magenta accent
    accentGlow: '#ff00ff',        // Magenta glow
    trail: '#00ffee'              // Trail color
};

// Game state
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

let currentState = GameState.MENU;
let lastMoveTime = 0;

// ============================================
// SCREEN SHAKE SYSTEM
// ============================================

class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    shake(intensity, frames) {
        this.intensity = intensity;
        this.duration = frames;
    }
    
    update() {
        if (this.duration > 0) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.duration--;
            
            if (this.duration === 0) {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }
    }
    
    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }
}

const screenShake = new ScreenShake();

// ============================================
// ============================================
// V2 STARFIELD BACKGROUND - MASSIVELY ENHANCED
// ============================================
// New techniques:
// - Multi-speed parallax star layers
// - Animated rotating spiral galaxies
// - Swirling nebulae with color blending
// - Shooting stars
// - Pulsing cosmic dust

class Starfield {
    constructor() {
        this.stars = [];
        this.time = 0;
        
        // V2: More layers with varied speeds for depth
        this.layers = [
            { count: 200, speed: 0.1, size: 0.8, opacity: 0.3, color: '#aaaacc' },  // Far distant
            { count: 150, speed: 0.25, size: 1.2, opacity: 0.5, color: '#ffffff' }, // Mid-far
            { count: 100, speed: 0.5, size: 1.8, opacity: 0.7, color: '#aaccff' },  // Mid
            { count: 60, speed: 0.8, size: 2.5, opacity: 0.85, color: '#ffccaa' },  // Mid-near
            { count: 30, speed: 1.2, size: 3.5, opacity: 1.0, color: '#ffffff' }    // Near (bright)
        ];
        
        this.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    size: layer.size * (0.8 + Math.random() * 0.4),
                    speed: layer.speed,
                    opacity: layer.opacity,
                    color: layer.color,
                    twinkle: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.02 + Math.random() * 0.04
                });
            }
        });
        
        // V2: ENHANCED nebulae with swirling animation
        this.nebulae = [];
        for (let i = 0; i < 8; i++) {
            this.nebulae.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                radius: 100 + Math.random() * 200,
                color1: this.randomNebulaColor(),
                color2: this.randomNebulaColor(),
                alpha: 0.02 + Math.random() * 0.03,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.002,
                swirlIntensity: 0.3 + Math.random() * 0.4,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.02
            });
        }
        
        // V2: ANIMATED spiral galaxies with visible arm rotation
        this.galaxies = [];
        for (let i = 0; i < 4; i++) {
            this.galaxies.push({
                x: 100 + Math.random() * (CANVAS_WIDTH - 200),
                y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
                coreRadius: 12 + Math.random() * 18,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: 0.003 + Math.random() * 0.004, // V2: Much faster visible rotation
                spiralTightness: 0.12 + Math.random() * 0.08,
                arms: 2 + Math.floor(Math.random() * 2),
                coreColor: ['#ffeecc', '#eeeeff', '#ffeeff'][Math.floor(Math.random() * 3)],
                armColor: ['#8888ff', '#ff88dd', '#88ddff', '#ddaaff'][Math.floor(Math.random() * 4)],
                starCount: 80 + Math.floor(Math.random() * 40)
            });
        }
        
        // V2: Shooting stars (occasional)
        this.shootingStars = [];
        this.shootingStarTimer = 0;
        
        // V2: Cosmic dust with drift
        this.dustParticles = [];
        for (let i = 0; i < 300; i++) {
            this.dustParticles.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: 0.3 + Math.random() * 0.8,
                speed: 0.03 + Math.random() * 0.1,
                opacity: 0.05 + Math.random() * 0.15,
                drift: (Math.random() - 0.5) * 0.2,
                pulse: Math.random() * Math.PI * 2
            });
        }
        
        this.intensity = 1.0;
    }
    
    randomNebulaColor() {
        const colors = [
            'rgba(150, 50, 200',   // Purple
            'rgba(50, 100, 200',   // Blue  
            'rgba(200, 50, 150',   // Magenta
            'rgba(50, 180, 180',   // Teal
            'rgba(200, 100, 50',   // Orange
            'rgba(100, 200, 150'   // Seafoam
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(snakeLength = 3) {
        this.time += 0.016;
        this.intensity = 1 + (snakeLength / 30) * 0.6;
        
        // Move stars with parallax
        this.stars.forEach(star => {
            star.y += star.speed * 0.15 * this.intensity;
            star.x += (star.speed - 0.5) * 0.03; // Slight horizontal drift
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
            if (star.x < 0) star.x = CANVAS_WIDTH;
            if (star.x > CANVAS_WIDTH) star.x = 0;
            star.twinkle += star.twinkleSpeed * this.intensity;
        });
        
        // V2: Rotate and pulse nebulae
        this.nebulae.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
            nebula.pulsePhase += nebula.pulseSpeed;
        });
        
        // V2: Rotate galaxies (visible arm rotation!)
        this.galaxies.forEach(galaxy => {
            galaxy.rotation += galaxy.rotationSpeed * this.intensity;
        });
        
        // V2: Manage shooting stars
        this.shootingStarTimer += 0.016;
        if (this.shootingStarTimer > 2 + Math.random() * 3) {
            this.shootingStarTimer = 0;
            this.shootingStars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: 0,
                vx: (Math.random() - 0.3) * 8,
                vy: 5 + Math.random() * 5,
                life: 1.0,
                length: 30 + Math.random() * 40
            });
        }
        
        // Update shooting stars
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.vx;
            star.y += star.vy;
            star.life -= 0.02;
            return star.life > 0 && star.y < CANVAS_HEIGHT;
        });
        
        // V2: Animate dust particles
        this.dustParticles.forEach(particle => {
            particle.y += particle.speed * 0.2 * this.intensity;
            particle.x += particle.drift * 0.15;
            particle.pulse += 0.02;
            if (particle.y > CANVAS_HEIGHT) {
                particle.y = 0;
                particle.x = Math.random() * CANVAS_WIDTH;
            }
            if (particle.x < 0) particle.x = CANVAS_WIDTH;
            if (particle.x > CANVAS_WIDTH) particle.x = 0;
        });
    }
    
    render(ctx, activePowerUps = []) {
        // Layer 1: ANIMATED galaxies with rotating arms (far back)
        this.renderGalaxies(ctx);
        
        // Layer 2: Swirling nebulae
        this.renderNebulae(ctx, activePowerUps);
        
        // Layer 3: Cosmic dust
        this.renderDust(ctx);
        
        // Layer 4: Stars with parallax
        this.renderStars(ctx);
        
        // Layer 5: Shooting stars (foreground)
        this.renderShootingStars(ctx);
    }
    
    renderGalaxies(ctx) {
        this.galaxies.forEach(galaxy => {
            ctx.save();
            ctx.translate(galaxy.x, galaxy.y);
            
            // V2: Draw rotating spiral arms with individual stars
            for (let arm = 0; arm < galaxy.arms; arm++) {
                const armAngle = (Math.PI * 2 / galaxy.arms) * arm + galaxy.rotation;
                
                // Draw many stars along spiral
                for (let i = 0; i < galaxy.starCount; i++) {
                    const t = i / galaxy.starCount;
                    const theta = t * Math.PI * 5; // More rotations
                    const r = galaxy.coreRadius * (1 + Math.exp(galaxy.spiralTightness * theta * 0.5));
                    
                    if (r > galaxy.coreRadius * 12) continue;
                    
                    const x = r * Math.cos(theta + armAngle);
                    const y = r * Math.sin(theta + armAngle);
                    
                    // Fade out with distance
                    const distFade = Math.max(0, 1 - r / (galaxy.coreRadius * 12));
                    const opacity = distFade * 0.7 * (0.5 + Math.random() * 0.5);
                    
                    // Star size varies
                    const starSize = (0.8 + Math.random() * 1.2) * distFade;
                    
                    // Color interpolation from core to arm color
                    const colorMix = Math.min(1, r / (galaxy.coreRadius * 6));
                    
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = colorMix < 0.5 ? galaxy.coreColor : galaxy.armColor;
                    ctx.beginPath();
                    ctx.arc(x, y, starSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Bright galactic core with glow
            ctx.globalAlpha = 1;
            const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.coreRadius * 2);
            coreGlow.addColorStop(0, galaxy.coreColor);
            coreGlow.addColorStop(0.3, galaxy.coreColor.replace(')', ', 0.6)').replace('rgb', 'rgba'));
            coreGlow.addColorStop(0.6, galaxy.coreColor.replace(')', ', 0.2)').replace('rgb', 'rgba'));
            coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = coreGlow;
            ctx.beginPath();
            ctx.arc(0, 0, galaxy.coreRadius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright center point
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, galaxy.coreRadius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }
    
    renderNebulae(ctx, activePowerUps) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        this.nebulae.forEach(nebula => {
            ctx.save();
            ctx.translate(nebula.x, nebula.y);
            ctx.rotate(nebula.rotation);
            
            // V2: Create swirling effect with multiple offset gradients
            const pulseScale = 1 + Math.sin(nebula.pulsePhase) * 0.15;
            const radius = nebula.radius * pulseScale;
            
            // Main gradient
            let color1 = nebula.color1;
            let color2 = nebula.color2;
            
            // Power-up color override
            if (activePowerUps.some(pu => pu.type.effect === 'ghost')) {
                color1 = 'rgba(0, 255, 255';
                color2 = 'rgba(255, 0, 255';
            }
            
            // Core swirl
            const gradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient1.addColorStop(0, color1 + `, ${nebula.alpha * 1.5})`);
            gradient1.addColorStop(0.5, color2 + `, ${nebula.alpha})`);
            gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient1;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // V2: Swirl arms (offset gradients)
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i + this.time * nebula.swirlIntensity;
                const offsetX = Math.cos(angle) * radius * 0.3;
                const offsetY = Math.sin(angle) * radius * 0.3;
                
                const swirlGrad = ctx.createRadialGradient(
                    offsetX, offsetY, 0,
                    offsetX, offsetY, radius * 0.6
                );
                swirlGrad.addColorStop(0, color1 + `, ${nebula.alpha * 0.8})`);
                swirlGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = swirlGrad;
                ctx.beginPath();
                ctx.arc(offsetX, offsetY, radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    renderDust(ctx) {
        this.dustParticles.forEach(particle => {
            const pulseBrightness = 0.7 + Math.sin(particle.pulse) * 0.3;
            ctx.globalAlpha = particle.opacity * pulseBrightness;
            ctx.fillStyle = '#bbbbdd';
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        ctx.globalAlpha = 1;
    }
    
    renderStars(ctx) {
        this.stars.forEach(star => {
            const twinkleAlpha = star.opacity * (0.6 + Math.sin(star.twinkle) * 0.4) * this.intensity;
            ctx.globalAlpha = Math.min(twinkleAlpha, 1.0);
            ctx.fillStyle = star.color;
            
            // V2: Larger stars get a subtle glow
            if (star.size > 2) {
                ctx.shadowBlur = star.size * 2;
                ctx.shadowColor = star.color;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
    
    renderShootingStars(ctx) {
        this.shootingStars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.life;
            
            // Trail gradient
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.vx * star.length / 10,
                star.y - star.vy * star.length / 10
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#aaddff');
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - star.vx * star.length / 10,
                star.y - star.vy * star.length / 10
            );
            ctx.stroke();
            
            // Bright head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
}

// ============================================
// V2 SPACE ENVIRONMENT - MASSIVELY ENHANCED PLANETS
// ============================================
// New 3D techniques:
// - Subsurface scattering simulation
// - Fresnel rim lighting
// - Animated cloud layers
// - Aurora effects
// - Volumetric atmosphere
// - Real-time rotating surface features

class SpaceEnvironment {
    constructor() {
        this.planets = this.createPlanets();
        this.sun = this.createSun();
        this.spaceships = this.createSpaceships();
        this.asteroids = this.createAsteroids();
        this.animationTime = 0;
    }
    
    createPlanets() {
        return [
            {
                x: CANVAS_WIDTH * 0.15,
                y: CANVAS_HEIGHT * 0.25,
                radius: 55,
                baseColor: { r: 68, g: 136, b: 255 },  // V2: RGB for color math
                atmosphereColor: '#6699ff',
                hasRings: false,
                hasAurora: true,  // V2: Aurora effect
                auroraColor: '#00ffaa',
                rotation: 0,
                rotationSpeed: 0.003,  // V2: Faster visible rotation
                cloudRotation: 0,
                cloudSpeed: 0.005,
                craters: this.generateCraters(6, 55),
                surfaceFeatures: this.generateSurfaceFeatures(55),
                type: 'ocean'  // V2: Planet type for rendering
            },
            {
                x: CANVAS_WIDTH * 0.85,
                y: CANVAS_HEIGHT * 0.7,
                radius: 75,
                baseColor: { r: 255, g: 136, b: 68 },
                atmosphereColor: '#ffaa66',
                hasRings: true,
                ringColor: '#cc8855',
                ringAngle: -0.25,
                rotation: 0,
                rotationSpeed: 0.002,
                cloudRotation: 0,
                cloudSpeed: 0.003,
                craters: this.generateCraters(8, 75),
                surfaceFeatures: this.generateSurfaceFeatures(75),
                type: 'gas'  // V2: Gas giant
            },
            {
                x: CANVAS_WIDTH * 0.72,
                y: CANVAS_HEIGHT * 0.12,
                radius: 45,
                baseColor: { r: 100, g: 220, b: 100 },
                atmosphereColor: '#aaffaa',
                hasRings: false,
                hasAurora: true,
                auroraColor: '#ff00ff',
                rotation: 0,
                rotationSpeed: 0.004,
                cloudRotation: 0,
                cloudSpeed: 0.006,
                craters: this.generateCraters(5, 45),
                surfaceFeatures: this.generateSurfaceFeatures(45),
                type: 'terrestrial'
            }
        ];
    }
    
    generateCraters(count, planetRadius) {
        const craters = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * planetRadius * 0.65;
            craters.push({
                angle: angle,  // V2: Store angle for rotation
                distance: distance,
                radius: 4 + Math.random() * 10,
                depth: 0.3 + Math.random() * 0.4
            });
        }
        return craters;
    }
    
    // V2: Generate surface features (continents, storms, etc.)
    generateSurfaceFeatures(planetRadius) {
        const features = [];
        for (let i = 0; i < 8; i++) {
            features.push({
                angle: Math.random() * Math.PI * 2,
                latitude: (Math.random() - 0.5) * Math.PI * 0.8,
                size: 10 + Math.random() * 20,
                type: ['continent', 'storm', 'ice'][Math.floor(Math.random() * 3)]
            });
        }
        return features;
    }
    
    createSun() {
        return {
            x: CANVAS_WIDTH * 0.05,
            y: CANVAS_HEIGHT * 0.08,
            radius: 70,
            coreRadius: 45,
            coronaLayers: 4,
            pulsePhase: 0,
            // V2: Solar flares
            flares: [
                { angle: 0.3, length: 30, phase: 0 },
                { angle: 2.1, length: 25, phase: 1.5 },
                { angle: 4.5, length: 35, phase: 3.0 }
            ]
        };
    }
    
    createSpaceships() {
        return [
            {
                x: CANVAS_WIDTH * 0.4,
                y: CANVAS_HEIGHT * 0.5,
                length: 30,
                width: 12,
                angle: 0.5,
                speed: 0.0005,
                driftX: 0.02,
                driftY: 0.01,
                pathRadius: 50
            },
            {
                x: CANVAS_WIDTH * 0.6,
                y: CANVAS_HEIGHT * 0.35,
                length: 25,
                width: 10,
                angle: -0.8,
                speed: 0.0008,
                driftX: -0.015,
                driftY: 0.02,
                pathRadius: 40
            }
        ];
    }
    
    createAsteroids() {
        const asteroids = [];
        for (let i = 0; i < 3; i++) {
            asteroids.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                radius: 8 + Math.random() * 12,
                points: this.generateAsteroidShape(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                driftX: (Math.random() - 0.5) * 0.1,
                driftY: (Math.random() - 0.5) * 0.1
            });
        }
        return asteroids;
    }
    
    generateAsteroidShape() {
        const points = [];
        const sides = 8 + Math.floor(Math.random() * 4);
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const variance = 0.7 + Math.random() * 0.6;
            points.push({ angle, distance: variance });
        }
        return points;
    }
    
    update() {
        this.animationTime += 0.016;
        
        // Update planet rotations
        this.planets.forEach(planet => {
            planet.rotation += planet.rotationSpeed;
        });
        
        // Update sun pulse
        this.sun.pulsePhase += 0.02;
        
        // Update spaceship drift
        this.spaceships.forEach(ship => {
            ship.angle += ship.speed;
            ship.x += Math.cos(ship.angle) * ship.driftX;
            ship.y += Math.sin(ship.angle) * ship.driftY;
            
            // Keep ships in bounds
            if (ship.x < -50) ship.x = CANVAS_WIDTH + 50;
            if (ship.x > CANVAS_WIDTH + 50) ship.x = -50;
            if (ship.y < -50) ship.y = CANVAS_HEIGHT + 50;
            if (ship.y > CANVAS_HEIGHT + 50) ship.y = -50;
        });
        
        // Update asteroid rotations and drift
        this.asteroids.forEach(asteroid => {
            asteroid.rotation += asteroid.rotationSpeed;
            asteroid.x += asteroid.driftX;
            asteroid.y += asteroid.driftY;
            
            // Wrap around screen
            if (asteroid.x < -asteroid.radius) asteroid.x = CANVAS_WIDTH + asteroid.radius;
            if (asteroid.x > CANVAS_WIDTH + asteroid.radius) asteroid.x = -asteroid.radius;
            if (asteroid.y < -asteroid.radius) asteroid.y = CANVAS_HEIGHT + asteroid.radius;
            if (asteroid.y > CANVAS_HEIGHT + asteroid.radius) asteroid.y = -asteroid.radius;
        });
    }
    
    render(ctx) {
        // Draw sun with corona
        this.renderSun(ctx);
        
        // Draw planets
        this.planets.forEach(planet => this.renderPlanet(ctx, planet));
        
        // Draw spaceships
        this.spaceships.forEach(ship => this.renderSpaceship(ctx, ship));
        
        // Draw asteroids
        this.asteroids.forEach(asteroid => this.renderAsteroid(ctx, asteroid));
    }
    
    renderSun(ctx) {
        const sun = this.sun;
        const time = this.animationTime;
        const pulse = Math.sin(sun.pulsePhase) * 0.2 + 1;
        
        // V2: ANIMATED SOLAR FLARES - Draw before corona
        this.renderSolarFlares(ctx, sun, time);
        
        // V2: ENHANCED CORONA with multiple animated layers
        for (let i = sun.coronaLayers; i >= 0; i--) {
            const waveOffset = Math.sin(time * 0.5 + i * 0.5) * 5;
            const layerRadius = sun.radius + (i * 15) * pulse + waveOffset;
            const alpha = (0.2 - i * 0.04) / pulse;
            
            const gradient = ctx.createRadialGradient(
                sun.x, sun.y, sun.coreRadius,
                sun.x, sun.y, layerRadius
            );
            gradient.addColorStop(0, `rgba(255, 255, 150, ${alpha * 2.5})`);
            gradient.addColorStop(0.3, `rgba(255, 220, 80, ${alpha * 1.5})`);
            gradient.addColorStop(0.6, `rgba(255, 180, 40, ${alpha})`);
            gradient.addColorStop(1, 'rgba(255, 120, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, layerRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // V2: SURFACE GRANULATION - Convection cells
        ctx.save();
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.coreRadius, 0, Math.PI * 2);
        ctx.clip();
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + time * 0.1;
            const dist = sun.coreRadius * 0.5 * (0.5 + Math.sin(time * 0.3 + i) * 0.5);
            const gx = sun.x + Math.cos(angle) * dist;
            const gy = sun.y + Math.sin(angle) * dist;
            const size = 8 + Math.sin(time + i * 0.5) * 4;
            
            const cellGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, size);
            cellGrad.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
            cellGrad.addColorStop(0.5, 'rgba(255, 220, 100, 0.2)');
            cellGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
            
            ctx.fillStyle = cellGrad;
            ctx.beginPath();
            ctx.arc(gx, gy, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        
        // V2: DRAW CORE with better 3D gradient
        const coreGradient = ctx.createRadialGradient(
            sun.x - sun.coreRadius * 0.3, sun.y - sun.coreRadius * 0.3, 0,
            sun.x, sun.y, sun.coreRadius
        );
        coreGradient.addColorStop(0, '#ffffee');
        coreGradient.addColorStop(0.3, '#ffffaa');
        coreGradient.addColorStop(0.6, '#ffdd44');
        coreGradient.addColorStop(0.85, '#ff9900');
        coreGradient.addColorStop(1, '#ff6600');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.coreRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // V2: CENTER HOTSPOT highlight
        const hotspotGrad = ctx.createRadialGradient(
            sun.x - sun.coreRadius * 0.4, sun.y - sun.coreRadius * 0.4, 0,
            sun.x - sun.coreRadius * 0.2, sun.y - sun.coreRadius * 0.2, sun.coreRadius * 0.5
        );
        hotspotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        hotspotGrad.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
        hotspotGrad.addColorStop(1, 'rgba(255, 255, 150, 0)');
        
        ctx.fillStyle = hotspotGrad;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.coreRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // V2: NEW - Animated solar flares and prominences
    renderSolarFlares(ctx, sun, time) {
        const numFlares = 6;
        
        for (let i = 0; i < numFlares; i++) {
            // Each flare has its own animation phase
            const baseAngle = (i / numFlares) * Math.PI * 2;
            const angle = baseAngle + Math.sin(time * 0.2 + i) * 0.3;
            
            // Flare intensity pulses independently
            const intensity = 0.5 + Math.sin(time * 0.5 + i * 1.5) * 0.5;
            const flareLength = (30 + Math.sin(time * 0.3 + i * 2) * 20) * intensity;
            const flareWidth = 8 + Math.sin(time * 0.7 + i) * 4;
            
            if (intensity < 0.3) continue; // Skip very dim flares
            
            const startX = sun.x + Math.cos(angle) * sun.coreRadius;
            const startY = sun.y + Math.sin(angle) * sun.coreRadius;
            const endX = sun.x + Math.cos(angle) * (sun.coreRadius + flareLength);
            const endY = sun.y + Math.sin(angle) * (sun.coreRadius + flareLength);
            
            // Curved flare using bezier
            const ctrlAngle = angle + Math.sin(time + i) * 0.5;
            const ctrlDist = sun.coreRadius + flareLength * 0.6;
            const ctrlX = sun.x + Math.cos(ctrlAngle) * ctrlDist;
            const ctrlY = sun.y + Math.sin(ctrlAngle) * ctrlDist;
            
            // Flare gradient
            const flareGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            flareGrad.addColorStop(0, `rgba(255, 200, 50, ${intensity * 0.8})`);
            flareGrad.addColorStop(0.5, `rgba(255, 150, 30, ${intensity * 0.5})`);
            flareGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.strokeStyle = flareGrad;
            ctx.lineWidth = flareWidth;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
            ctx.stroke();
            
            // Add glow around flare
            ctx.strokeStyle = `rgba(255, 180, 80, ${intensity * 0.2})`;
            ctx.lineWidth = flareWidth * 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
            ctx.stroke();
        }
        
        // V2: SOLAR PROMINENCES - Large arcing loops
        const numProminences = 3;
        for (let i = 0; i < numProminences; i++) {
            const baseAngle = (i / numProminences) * Math.PI * 2 + Math.PI / 6;
            const prominence = Math.sin(time * 0.15 + i * 2);
            
            if (prominence < 0.2) continue;
            
            const startAngle = baseAngle - 0.3;
            const endAngle = baseAngle + 0.3;
            const height = (40 + prominence * 30);
            
            const x1 = sun.x + Math.cos(startAngle) * sun.coreRadius;
            const y1 = sun.y + Math.sin(startAngle) * sun.coreRadius;
            const x2 = sun.x + Math.cos(endAngle) * sun.coreRadius;
            const y2 = sun.y + Math.sin(endAngle) * sun.coreRadius;
            
            // Arc control point
            const midAngle = baseAngle;
            const cx = sun.x + Math.cos(midAngle) * (sun.coreRadius + height);
            const cy = sun.y + Math.sin(midAngle) * (sun.coreRadius + height);
            
            ctx.strokeStyle = `rgba(255, 150, 50, ${prominence * 0.6})`;
            ctx.lineWidth = 4 + prominence * 3;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cx, cy, x2, y2);
            ctx.stroke();
            
            // Glow
            ctx.strokeStyle = `rgba(255, 100, 30, ${prominence * 0.2})`;
            ctx.lineWidth = 10 + prominence * 5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cx, cy, x2, y2);
            ctx.stroke();
        }
    }
    
    renderPlanet(ctx, planet) {
        ctx.save();
        ctx.translate(planet.x, planet.y);
        
        const r = planet.radius;
        const bc = planet.baseColor;
        
        // V2: Draw rings BEHIND planet first (back portion)
        if (planet.hasRings) {
            this.renderRingsBack(ctx, planet);
        }
        
        // V2: SUBSURFACE SCATTERING - Base sphere with light bleeding through
        const baseGradient = ctx.createRadialGradient(
            -r * 0.4, -r * 0.4, 0,
            0, 0, r * 1.2
        );
        
        // Light source at top-left, subsurface glow
        const lightColor = `rgb(${Math.min(255, bc.r + 80)}, ${Math.min(255, bc.g + 80)}, ${Math.min(255, bc.b + 80)})`;
        const midColor = `rgb(${bc.r}, ${bc.g}, ${bc.b})`;
        const darkColor = `rgb(${Math.max(0, bc.r - 60)}, ${Math.max(0, bc.g - 60)}, ${Math.max(0, bc.b - 60)})`;
        const shadowColor = `rgb(${Math.max(0, bc.r - 100)}, ${Math.max(0, bc.g - 100)}, ${Math.max(0, bc.b - 100)})`;
        
        baseGradient.addColorStop(0, lightColor);
        baseGradient.addColorStop(0.25, lightColor);
        baseGradient.addColorStop(0.5, midColor);
        baseGradient.addColorStop(0.75, darkColor);
        baseGradient.addColorStop(1, shadowColor);
        
        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        
        // V2: ROTATING SURFACE FEATURES (continents/storms)
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.rotate(planet.rotation);
        
        planet.surfaceFeatures.forEach((feature, i) => {
            const fx = Math.cos(feature.angle) * Math.cos(feature.latitude) * r * 0.7;
            const fy = Math.sin(feature.angle) * r * 0.7;
            
            if (feature.type === 'continent') {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = this.rgbToString(bc, 30);
                ctx.beginPath();
                ctx.ellipse(fx, fy, feature.size, feature.size * 0.6, feature.angle, 0, Math.PI * 2);
                ctx.fill();
            } else if (feature.type === 'storm') {
                // Swirling storm
                ctx.globalAlpha = 0.4;
                const stormGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, feature.size);
                stormGrad.addColorStop(0, '#ffffff');
                stormGrad.addColorStop(0.5, this.rgbToString(bc, 40));
                stormGrad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = stormGrad;
                ctx.beginPath();
                ctx.arc(fx, fy, feature.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (feature.type === 'ice') {
                ctx.globalAlpha = 0.35;
                ctx.fillStyle = '#eeffff';
                ctx.beginPath();
                ctx.ellipse(fx, fy, feature.size * 0.8, feature.size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // V2: ANIMATED CLOUD LAYER (separate rotation)
        ctx.rotate(planet.cloudRotation - planet.rotation);
        ctx.globalAlpha = 0.2;
        const cloudCount = Math.floor(r / 8);
        for (let i = 0; i < cloudCount; i++) {
            const angle = (i * 137.5 * Math.PI / 180);
            const dist = (Math.sin(i * 2.3) * 0.5 + 0.5) * r * 0.75;
            const cx = Math.cos(angle) * dist;
            const cy = Math.sin(angle) * dist;
            const csize = 6 + Math.sin(i * 1.7) * 6;
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, csize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + csize * 0.5, cy + csize * 0.3, csize * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // V2: 3D CRATERS with proper depth simulation
        planet.craters.forEach(crater => {
            const cx = Math.cos(crater.angle + planet.rotation) * crater.distance;
            const cy = Math.sin(crater.angle + planet.rotation) * crater.distance;
            
            // Only draw if on visible side (simple check)
            if (cx > -r * 0.8) {
                // Outer shadow ring
                ctx.globalAlpha = 0.5 * crater.depth;
                const craterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, crater.radius);
                craterGrad.addColorStop(0, shadowColor);
                craterGrad.addColorStop(0.5, darkColor);
                craterGrad.addColorStop(0.8, midColor);
                craterGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = craterGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, crater.radius * 1.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner highlight (rim catch)
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = lightColor;
                ctx.beginPath();
                ctx.arc(cx - crater.radius * 0.25, cy - crater.radius * 0.25, crater.radius * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        
        // V2: TERMINATOR with soft gradient
        const terminatorGrad = ctx.createLinearGradient(-r * 0.3, 0, r, 0);
        terminatorGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        terminatorGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
        terminatorGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
        terminatorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = terminatorGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        
        // V2: FRESNEL RIM LIGHTING (edge glow)
        const rimGrad = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r);
        rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        rimGrad.addColorStop(0.85, `rgba(${Math.min(255, bc.r + 100)}, ${Math.min(255, bc.g + 100)}, ${Math.min(255, bc.b + 100)}, 0.15)`);
        rimGrad.addColorStop(1, `rgba(${Math.min(255, bc.r + 150)}, ${Math.min(255, bc.g + 150)}, ${Math.min(255, bc.b + 150)}, 0.3)`);
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        
        // V2: SPECULAR HIGHLIGHT (glossy sphere effect)
        const specularGrad = ctx.createRadialGradient(
            -r * 0.35, -r * 0.35, 0,
            -r * 0.35, -r * 0.35, r * 0.5
        );
        specularGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        specularGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
        specularGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = specularGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        
        // V2: AURORA EFFECT (for some planets)
        if (planet.hasAurora) {
            this.renderAurora(ctx, planet);
        }
        
        // V2: ATMOSPHERE with volumetric glow
        for (let i = 3; i >= 0; i--) {
            const atmoR = r * (1.1 + i * 0.08);
            const alpha = (0.12 - i * 0.025);
            
            const atmoGrad = ctx.createRadialGradient(0, 0, r, 0, 0, atmoR);
            atmoGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            atmoGrad.addColorStop(0.4, `${planet.atmosphereColor}00`);
            atmoGrad.addColorStop(0.7, planet.atmosphereColor + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = atmoGrad;
            ctx.beginPath();
            ctx.arc(0, 0, atmoR, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // V2: Draw rings FRONT (if has rings)
        if (planet.hasRings) {
            this.renderRingsFront(ctx, planet);
        }
        
        ctx.restore();
    }
    
    // V2: Aurora effect for atmospheric planets
    renderAurora(ctx, planet) {
        const r = planet.radius;
        const time = this.animationTime;
        
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        // Northern aurora
        for (let i = 0; i < 5; i++) {
            const waveOffset = Math.sin(time * 2 + i * 0.5) * r * 0.1;
            const auroraY = -r * 0.7 + waveOffset;
            
            const auroraGrad = ctx.createRadialGradient(
                0, auroraY, 0,
                0, auroraY, r * 0.5
            );
            auroraGrad.addColorStop(0, planet.auroraColor + '40');
            auroraGrad.addColorStop(0.5, planet.auroraColor + '20');
            auroraGrad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = auroraGrad;
            ctx.beginPath();
            ctx.ellipse(0, auroraY, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // V2: Ring rendering helpers
    renderRingsBack(ctx, planet) {
        ctx.save();
        ctx.rotate(planet.ringAngle);
        ctx.scale(1, 0.25);
        
        // Draw back half of rings
        const ringBands = [
            { inner: 1.2, outer: 1.35, alpha: 0.7 },
            { inner: 1.4, outer: 1.55, alpha: 0.5 },
            { inner: 1.6, outer: 1.8, alpha: 0.3 }
        ];
        
        ringBands.forEach(band => {
            const grad = ctx.createRadialGradient(0, 0, planet.radius * band.inner, 0, 0, planet.radius * band.outer);
            grad.addColorStop(0, planet.ringColor + Math.floor(band.alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(0.5, planet.ringColor + Math.floor(band.alpha * 200).toString(16).padStart(2, '0'));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, planet.radius * band.outer, Math.PI, Math.PI * 2);
            ctx.arc(0, 0, planet.radius * band.inner, Math.PI * 2, Math.PI, true);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    renderRingsFront(ctx, planet) {
        ctx.save();
        ctx.rotate(planet.ringAngle);
        ctx.scale(1, 0.25);
        
        const ringBands = [
            { inner: 1.2, outer: 1.35, alpha: 0.8 },
            { inner: 1.4, outer: 1.55, alpha: 0.6 },
            { inner: 1.6, outer: 1.8, alpha: 0.4 }
        ];
        
        ringBands.forEach(band => {
            const grad = ctx.createRadialGradient(0, 0, planet.radius * band.inner, 0, 0, planet.radius * band.outer);
            grad.addColorStop(0, planet.ringColor + Math.floor(band.alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(0.5, planet.ringColor + Math.floor(band.alpha * 200).toString(16).padStart(2, '0'));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, planet.radius * band.outer, 0, Math.PI);
            ctx.arc(0, 0, planet.radius * band.inner, Math.PI, 0, true);
            ctx.fill();
        });
        
        // Ring shadow on planet
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, planet.radius * 0.3, planet.radius * 0.9, planet.radius * 0.15, 0, 0, Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Helper to convert baseColor to string
    rgbToString(bc, adjust = 0) {
        return `rgb(${Math.min(255, bc.r + adjust)}, ${Math.min(255, bc.g + adjust)}, ${Math.min(255, bc.b + adjust)})`;
    }
    
    renderSpaceship(ctx, ship) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        
        // Draw ship body (triangular)
        ctx.fillStyle = '#88aacc';
        ctx.strokeStyle = '#aaccff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(ship.length / 2, 0);
        ctx.lineTo(-ship.length / 2, -ship.width / 2);
        ctx.lineTo(-ship.length / 3, 0);
        ctx.lineTo(-ship.length / 2, ship.width / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw cockpit window
        ctx.fillStyle = '#44ffff';
        ctx.beginPath();
        ctx.arc(ship.length / 4, 0, ship.width / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw engine glow
        ctx.fillStyle = '#ff8844';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff4400';
        ctx.beginPath();
        ctx.arc(-ship.length / 2, 0, ship.width / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    renderAsteroid(ctx, asteroid) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        
        // Create clipping path from asteroid shape
        ctx.beginPath();
        asteroid.points.forEach((point, i) => {
            const x = Math.cos(point.angle) * point.distance * asteroid.radius;
            const y = Math.sin(point.angle) * point.distance * asteroid.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.clip();
        
        // Layer 1: Base gradient with directional lighting
        // Light source from top-left creates gradient across surface
        const lightAngle = asteroid.rotation + Math.PI * 0.25; // Light from top-left
        const lightX = Math.cos(lightAngle) * asteroid.radius * 0.7;
        const lightY = Math.sin(lightAngle) * asteroid.radius * 0.7;
        
        const baseGradient = ctx.createRadialGradient(
            lightX, lightY, asteroid.radius * 0.2,
            0, 0, asteroid.radius * 1.4
        );
        baseGradient.addColorStop(0, '#8a8a8a');    // Lit side
        baseGradient.addColorStop(0.5, '#5a5a5a');  // Mid-tone
        baseGradient.addColorStop(1, '#2a2a2a');    // Shadow side
        
        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.arc(0, 0, asteroid.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 2: Surface texture using pseudo-noise pattern
        // Create rough surface appearance with overlapping circles
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 25; i++) {
            // Pseudo-random positioning based on asteroid ID and iteration
            const seed = asteroid.x * 7.123 + asteroid.y * 3.456 + i * 12.789;
            const angle = (seed % 1) * Math.PI * 2;
            const dist = ((seed * 1.234) % 1) * asteroid.radius * 0.8;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            const size = asteroid.radius * (0.15 + ((seed * 2.345) % 1) * 0.2);
            
            ctx.fillStyle = ((seed * 3.456) % 1) > 0.5 ? '#444' : '#666';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Layer 3: Pockmarks and small craters
        for (let i = 0; i < 8; i++) {
            const seed = asteroid.x * 3.789 + asteroid.y * 8.234 + i * 15.678;
            const angle = (seed % 1) * Math.PI * 2;
            const dist = ((seed * 2.123) % 1) * asteroid.radius * 0.7;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            const size = asteroid.radius * (0.08 + ((seed * 1.789) % 1) * 0.12);
            
            // Crater with 3D bowl effect (dark center, light rim)
            const craterGradient = ctx.createRadialGradient(
                x - size * 0.2, y - size * 0.2, 0,
                x, y, size
            );
            craterGradient.addColorStop(0, '#1a1a1a');
            craterGradient.addColorStop(0.6, '#3a3a3a');
            craterGradient.addColorStop(0.85, '#6a6a6a');
            craterGradient.addColorStop(1, '#4a4a4a');
            
            ctx.fillStyle = craterGradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Layer 4: Surface cracks using random walk algorithm
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5;
        
        // Create 3-5 major crack systems
        const numCracks = 3 + Math.floor(((asteroid.x + asteroid.y) % 1) * 3);
        for (let i = 0; i < numCracks; i++) {
            const seed = asteroid.x * 5.432 + asteroid.y * 2.876 + i * 8.234;
            
            // Start position near center
            let x = (((seed * 1.234) % 1) - 0.5) * asteroid.radius * 0.3;
            let y = (((seed * 2.345) % 1) - 0.5) * asteroid.radius * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            // Random walk to edge
            let angle = (seed % 1) * Math.PI * 2;
            for (let step = 0; step < 15; step++) {
                // Walk in mostly consistent direction with slight wobble
                angle += (((seed * (step + 1) * 3.456) % 1) - 0.5) * 0.4;
                const stepSize = asteroid.radius * 0.12;
                x += Math.cos(angle) * stepSize;
                y += Math.sin(angle) * stepSize;
                
                ctx.lineTo(x, y);
                
                // Stop if we've reached the edge
                if (Math.sqrt(x * x + y * y) > asteroid.radius * 0.85) break;
                
                // Occasionally branch
                if (((seed * (step + 1) * 7.789) % 1) > 0.85) {
                    const branchAngle = angle + (((seed * step * 4.567) % 1) - 0.5) * Math.PI * 0.5;
                    const branchLength = asteroid.radius * 0.2;
                    const branchX = x + Math.cos(branchAngle) * branchLength;
                    const branchY = y + Math.sin(branchAngle) * branchLength;
                    
                    ctx.moveTo(x, y);
                    ctx.lineTo(branchX, branchY);
                    ctx.moveTo(x, y);
                }
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // Layer 5: Edge highlight for 3D effect
        ctx.strokeStyle = 'rgba(140, 140, 140, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        asteroid.points.forEach((point, i) => {
            const x = Math.cos(point.angle) * point.distance * asteroid.radius;
            const y = Math.sin(point.angle) * point.distance * asteroid.radius;
            
            // Only draw highlight on lit side
            const pointAngle = Math.atan2(y, x);
            const angleDiff = Math.abs(((pointAngle - lightAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
            
            if (angleDiff < Math.PI * 0.6) {
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            } else {
                ctx.moveTo(x, y);
            }
        });
        ctx.stroke();
        
        // Layer 6: Dark edge for shadow side depth
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        asteroid.points.forEach((point, i) => {
            const x = Math.cos(point.angle) * point.distance * asteroid.radius;
            const y = Math.sin(point.angle) * point.distance * asteroid.radius;
            
            // Only draw shadow on dark side
            const pointAngle = Math.atan2(y, x);
            const angleDiff = Math.abs(((pointAngle - lightAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
            
            if (angleDiff > Math.PI * 0.4) {
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            } else {
                ctx.moveTo(x, y);
            }
        });
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Helper functions for color manipulation
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 2;
        this.color = color;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // Slight gravity
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

const particles = [];

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// ============================================
// SNAKE CLASS
// ============================================

class Snake {
    constructor() {
        // Start in center of grid
        const startX = Math.floor(GRID_WIDTH / 2);
        const startY = Math.floor(GRID_HEIGHT / 2);
        
        // Snake is array of segments, each with {x, y}
        // Head is segments[0]
        this.segments = [];
        for (let i = 0; i < INITIAL_LENGTH; i++) {
            this.segments.push({
                x: startX - i, // Start with body extending left
                y: startY
            });
        }
        
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT; // Buffer for input
    }
    
    update() {
        // Apply buffered direction (prevents double-input in same frame)
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = this.segments[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Wrap at edges
        if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
        if (newHead.x >= GRID_WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1;
        if (newHead.y >= GRID_HEIGHT) newHead.y = 0;
        
        // Add new head to front
        this.segments.unshift(newHead);
        
        // Remove tail (keeps length constant for now)
        this.segments.pop();
    }
    
    checkSelfCollision() {
        // Check if head collides with any body segment
        const head = this.segments[0];
        
        // Start at index 1 (skip head itself)
        for (let i = 1; i < this.segments.length; i++) {
            if (head.x === this.segments[i].x && head.y === this.segments[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    setDirection(newDirection) {
        // Prevent 180-degree turns (can't go back on yourself)
        const oppositeX = this.direction.x + newDirection.x === 0;
        const oppositeY = this.direction.y + newDirection.y === 0;
        
        if (oppositeX && oppositeY) {
            return; // Ignore opposite direction
        }
        
        this.nextDirection = newDirection;
    }
    
    grow() {
        // Add segment at tail position (will be done by not popping in update)
        const tail = this.segments[this.segments.length - 1];
        this.segments.push({ x: tail.x, y: tail.y });
    }
    
    render(ctx) {
        // Draw all segments with artistic styling
        this.segments.forEach((segment, index) => {
            const isHead = index === 0;
            const x = segment.x * GRID_SIZE;
            const y = segment.y * GRID_SIZE;
            
            if (isHead) {
                this.renderHead(ctx, x, y);
            } else {
                this.renderBodySegment(ctx, x, y, index);
            }
        });
    }
    
    renderHead(ctx, x, y) {
        ctx.save();
        
        // Head with rounded shape and glow - V2: Cyan theme
        ctx.shadowBlur = 20;  // V2: Stronger glow
        ctx.shadowColor = V2_COLORS.snakeGlow;
        
        // Radial gradient for head - V2: Cyan colors
        const gradient = ctx.createRadialGradient(
            x + GRID_SIZE / 2, y + GRID_SIZE / 2, 0,
            x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2
        );
        gradient.addColorStop(0, V2_COLORS.snakePrimary);
        gradient.addColorStop(1, V2_COLORS.snakeSecondary);
        ctx.fillStyle = gradient;
        
        // Draw rounded head using roundRect
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, GRID_SIZE / 3);
        ctx.fill();
        
        // Draw eyes based on direction
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        // Position eyes based on snake direction
        if (this.direction === Direction.RIGHT) {
            eye1X = x + GRID_SIZE * 0.6;
            eye1Y = y + GRID_SIZE * 0.35;
            eye2X = x + GRID_SIZE * 0.6;
            eye2Y = y + GRID_SIZE * 0.65;
        } else if (this.direction === Direction.LEFT) {
            eye1X = x + GRID_SIZE * 0.4;
            eye1Y = y + GRID_SIZE * 0.35;
            eye2X = x + GRID_SIZE * 0.4;
            eye2Y = y + GRID_SIZE * 0.65;
        } else if (this.direction === Direction.UP) {
            eye1X = x + GRID_SIZE * 0.35;
            eye1Y = y + GRID_SIZE * 0.4;
            eye2X = x + GRID_SIZE * 0.65;
            eye2Y = y + GRID_SIZE * 0.4;
        } else { // DOWN
            eye1X = x + GRID_SIZE * 0.35;
            eye1Y = y + GRID_SIZE * 0.6;
            eye2X = x + GRID_SIZE * 0.65;
            eye2Y = y + GRID_SIZE * 0.6;
        }
        
        // ADVANCED EYE RENDERING - Multi-layer cartoon eyes
        
        // Eye 1 - Left/Top eye
        this.renderDetailedEye(ctx, eye1X, eye1Y);
        
        // Eye 2 - Right/Bottom eye
        this.renderDetailedEye(ctx, eye2X, eye2Y);
        
        ctx.restore();
    }
    
    renderDetailedEye(ctx, eyeX, eyeY) {
        const eyeSize = GRID_SIZE * 0.12;
        const pupilSize = GRID_SIZE * 0.07;
        
        // Layer 1: Eye socket shadow (depth effect)
        ctx.fillStyle = 'rgba(0, 50, 40, 0.4)';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize * 1.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 2: Eye white with subtle gradient (gives roundness)
        const whiteGradient = ctx.createRadialGradient(
            eyeX - eyeSize * 0.2, eyeY - eyeSize * 0.2, 0,
            eyeX, eyeY, eyeSize
        );
        whiteGradient.addColorStop(0, '#ffffff');
        whiteGradient.addColorStop(0.7, '#f0f0f0');
        whiteGradient.addColorStop(1, '#d0d0d0');
        
        ctx.fillStyle = whiteGradient;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 3: Iris with colored gradient (adds depth to pupil)
        const irisGradient = ctx.createRadialGradient(
            eyeX, eyeY, 0,
            eyeX, eyeY, pupilSize * 1.3
        );
        irisGradient.addColorStop(0, '#004400');
        irisGradient.addColorStop(0.5, '#003300');
        irisGradient.addColorStop(1, '#001100');
        
        ctx.fillStyle = irisGradient;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, pupilSize * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 4: Pupil (deep black)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 5: Primary highlight (makes eye look wet/alive)
        const highlight1Gradient = ctx.createRadialGradient(
            eyeX - pupilSize * 0.4, eyeY - pupilSize * 0.4, 0,
            eyeX - pupilSize * 0.4, eyeY - pupilSize * 0.4, pupilSize * 0.6
        );
        highlight1Gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        highlight1Gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlight1Gradient;
        ctx.beginPath();
        ctx.arc(eyeX - pupilSize * 0.4, eyeY - pupilSize * 0.4, pupilSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 6: Secondary smaller highlight (extra sparkle)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(eyeX + pupilSize * 0.3, eyeY + pupilSize * 0.2, pupilSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 7: Subtle eye outline (definition)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderBodySegment(ctx, x, y, index) {
        ctx.save();
        
        // Calculate position-based opacity for gradient effect along body
        const opacity = 1 - (index / this.segments.length) * 0.4;
        const brightnessBoost = 1 - (index / this.segments.length) * 0.3;
        
        // V2: Body with cyan glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(0, 255, 238, ${opacity})`;
        
        // V2: Cyan-based gradient for body
        const gradient = ctx.createLinearGradient(
            x, y, x + GRID_SIZE, y + GRID_SIZE
        );
        // V2: Cyan color scheme (0, 170, 187) as base
        const baseR = Math.floor(0 * brightnessBoost);
        const baseG = Math.floor(200 * brightnessBoost);
        const baseB = Math.floor(200 * brightnessBoost);
        
        gradient.addColorStop(0, `rgba(${baseR + 30}, ${baseG + 55}, ${baseB + 38}, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(${baseR}, ${baseG}, ${baseB}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${baseR}, ${baseG - 50}, ${baseB - 50}, ${opacity})`);
        ctx.fillStyle = gradient;
        ctx.fillStyle = gradient;
        
        // Draw rounded body segment
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, GRID_SIZE / 4);
        ctx.fill();
        
        // ADVANCED SCALE PATTERN - Overlapping dragon scales
        ctx.shadowBlur = 0;
        this.renderScalePattern(ctx, x, y, index, opacity);
        
        ctx.restore();
    }
    
    renderScalePattern(ctx, x, y, index, opacity) {
        const centerX = x + GRID_SIZE / 2;
        const centerY = y + GRID_SIZE / 2;
        const scaleSize = GRID_SIZE * 0.35;
        
        // Create overlapping scale effect with multiple arcs
        // Pattern: Top-left, top-right, bottom-left, bottom-right scales
        const scalePositions = [
            { offsetX: -scaleSize * 0.3, offsetY: -scaleSize * 0.3 },
            { offsetX: scaleSize * 0.3, offsetY: -scaleSize * 0.3 },
            { offsetX: -scaleSize * 0.3, offsetY: scaleSize * 0.3 },
            { offsetX: scaleSize * 0.3, offsetY: scaleSize * 0.3 }
        ];
        
        scalePositions.forEach((pos, i) => {
            const scaleX = centerX + pos.offsetX;
            const scaleY = centerY + pos.offsetY;
            
            // Scale base - dark outline (V2: cyan tint)
            ctx.globalAlpha = opacity * 0.3;
            ctx.fillStyle = '#002233';
            ctx.beginPath();
            ctx.arc(scaleX, scaleY, scaleSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Scale highlight - lighter inner circle (V2: cyan)
            ctx.globalAlpha = opacity * 0.15;
            ctx.fillStyle = V2_COLORS.snakePrimary;
            ctx.beginPath();
            ctx.arc(scaleX - 1, scaleY - 1, scaleSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Center scale detail - creates focal point (V2: cyan tint)
        ctx.globalAlpha = opacity * 0.25;
        ctx.fillStyle = '#004455';
        ctx.beginPath();
        ctx.arc(centerX, centerY, scaleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Center scale highlight (V2: cyan)
        ctx.globalAlpha = opacity * 0.2;
        ctx.fillStyle = V2_COLORS.snakeSecondary;
        ctx.beginPath();
        ctx.arc(centerX - 1.5, centerY - 1.5, scaleSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1.0;
    }
}

// ============================================
// FOOD CLASS
// ============================================

class Food {
    constructor(snake) {
        this.respawn(snake);
        this.pulsePhase = 0;
    }
    
    update() {
        this.pulsePhase += 0.08;
    }
    
    respawn(snake) {
        // Find empty position not occupied by snake
        let position;
        let isValidPosition;
        
        do {
            position = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            
            // Check if this position overlaps with snake
            isValidPosition = !snake.segments.some(segment => 
                segment.x === position.x && segment.y === position.y
            );
        } while (!isValidPosition);
        
        this.x = position.x;
        this.y = position.y;
    }
    
    render(ctx) {
        // ADVANCED ENERGY CRYSTAL - Multi-layer gem with chromatic aberration
        ctx.save();
        
        const centerX = this.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = this.y * GRID_SIZE + GRID_SIZE / 2;
        
        // Pulsing and rotation
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;
        const rotation = this.pulsePhase * 0.5;
        const size = (GRID_SIZE / 2 - 2) * pulse;
        const sides = 6;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        
        // Layer 1: Outer glow (energy field)
        const outerGlow = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.8);
        outerGlow.addColorStop(0, 'rgba(255, 51, 102, 0.3)');
        outerGlow.addColorStop(0.5, 'rgba(255, 51, 102, 0.15)');
        outerGlow.addColorStop(1, 'rgba(255, 51, 102, 0)');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 2: CHROMATIC ABERRATION - RGB offset for prism effect
        // Red channel (offset left-up)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size - 1.5;
            const y = Math.sin(angle) * size - 1.5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Green channel (centered)
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Blue channel (offset right-down)
        ctx.fillStyle = '#0000ff';
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size + 1.5;
            const y = Math.sin(angle) * size + 1.5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Layer 3: Main crystal body with advanced gradient
        const crystalGradient = ctx.createRadialGradient(
            -size * 0.3, -size * 0.3, 0,
            0, 0, size
        );
        crystalGradient.addColorStop(0, '#ffffff');
        crystalGradient.addColorStop(0.2, '#ffccdd');
        crystalGradient.addColorStop(0.5, '#ff6699');
        crystalGradient.addColorStop(0.8, '#ff3366');
        crystalGradient.addColorStop(1, '#cc0044');
        
        ctx.fillStyle = crystalGradient;
        ctx.shadowBlur = 25 + Math.sin(this.pulsePhase) * 10;
        ctx.shadowColor = '#ff3366';
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Layer 4: Internal facet lines (creates gem cut appearance)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        
        // Layer 5: Mid-layer hexagon (creates depth)
        ctx.globalAlpha = 0.6;
        const midGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.65);
        midGradient.addColorStop(0, 'rgba(255, 200, 220, 0.8)');
        midGradient.addColorStop(1, 'rgba(255, 102, 153, 0.4)');
        ctx.fillStyle = midGradient;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size * 0.65;
            const y = Math.sin(angle) * size * 0.65;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Layer 6: Inner hexagon (creates even more depth)
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(255, 150, 180, 0.7)';
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * size * 0.4;
            const y = Math.sin(angle) * size * 0.4;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Layer 7: Star burst pattern (radiating light)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        const starPoints = 12;
        for (let i = 0; i < starPoints; i++) {
            const angle = (i / starPoints) * Math.PI * 2;
            const innerR = size * 0.2;
            const outerR = size * 0.35;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            ctx.stroke();
        }
        
        // Layer 8: Center brilliant (brightest point)
        const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.25);
        centerGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        centerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Layer 9: Highlight sparkles (animated)
        const sparkleAngle = this.pulsePhase * 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(
            Math.cos(sparkleAngle) * size * 0.5,
            Math.sin(sparkleAngle) * size * 0.5,
            2,
            0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
}

// ============================================
// POWERUP CLASS
// ============================================

class PowerUp {
    constructor(snake, type) {
        this.type = type;
        this.respawn(snake);
        this.pulsePhase = 0;
        this.rotationAngle = 0;
    }
    
    respawn(snake) {
        // Find empty position not occupied by snake
        let position;
        let isValidPosition;
        
        do {
            position = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
            
            isValidPosition = !snake.segments.some(segment => 
                segment.x === position.x && segment.y === position.y
            );
        } while (!isValidPosition);
        
        this.x = position.x;
        this.y = position.y;
    }
    
    update() {
        this.pulsePhase += 0.1;
        this.rotationAngle += 0.05;
    }
    
    render(ctx) {
        const centerX = this.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = this.y * GRID_SIZE + GRID_SIZE / 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Pulsing glow effect
        const pulse = 0.7 + Math.sin(this.pulsePhase) * 0.3;
        ctx.shadowBlur = 30 * pulse;
        ctx.shadowColor = this.type.glowColor;
        
        // Draw rotating particles around power-up (enhanced)
        for (let i = 0; i < 8; i++) {
            const angle = this.rotationAngle + (i * Math.PI / 4);
            const distance = 14 + Math.sin(this.pulsePhase + i) * 2;
            const px = Math.cos(angle) * distance;
            const py = Math.sin(angle) * distance;
            
            const particleGradient = ctx.createRadialGradient(px, py, 0, px, py, 3);
            particleGradient.addColorStop(0, this.type.color);
            particleGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = particleGradient;
            ctx.globalAlpha = 0.8 * pulse;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        
        // Main power-up body - diamond with advanced rendering
        ctx.rotate(Math.PI / 4);
        
        const size = GRID_SIZE / 2 - 2;
        
        // Diamond shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(2, -size + 2);
        ctx.lineTo(size + 2, 2);
        ctx.lineTo(2, size + 2);
        ctx.lineTo(-size + 2, 2);
        ctx.closePath();
        ctx.fill();
        
        // Diamond with gradient
        const gradient = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.type.color);
        gradient.addColorStop(0.7, this.type.glowColor);
        gradient.addColorStop(1, this.darkenColor(this.type.glowColor));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        
        // Inner facets for gem effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, 0);
        ctx.moveTo(size, 0);
        ctx.lineTo(0, 0);
        ctx.moveTo(0, size);
        ctx.lineTo(0, 0);
        ctx.moveTo(-size, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Border glow
        ctx.strokeStyle = this.type.glowColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.type.glowColor;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.stroke();
        
        // Reset rotation for icon
        ctx.rotate(-Math.PI / 4);
        ctx.shadowBlur = 0;
        
        // Draw custom icon based on type (NO MORE EMOJI!)
        this.renderCustomIcon(ctx, size * 0.6);
        
        ctx.restore();
    }
    
    renderCustomIcon(ctx, iconSize) {
        ctx.save();
        
        // Different icons for each power-up type
        if (this.type.effect === 'moveSpeed') {
            // LIGHTNING BOLT using Path2D
            const lightning = new Path2D();
            lightning.moveTo(iconSize * 0.2, -iconSize);
            lightning.lineTo(-iconSize * 0.3, -iconSize * 0.1);
            lightning.lineTo(iconSize * 0.1, -iconSize * 0.1);
            lightning.lineTo(-iconSize * 0.4, iconSize * 0.8);
            lightning.lineTo(iconSize * 0.2, iconSize * 0.2);
            lightning.lineTo(-iconSize * 0.1, iconSize * 0.2);
            lightning.closePath();
            
            // Lightning gradient
            const lightningGradient = ctx.createLinearGradient(0, -iconSize, 0, iconSize);
            lightningGradient.addColorStop(0, '#ffff00');
            lightningGradient.addColorStop(0.5, '#ffaa00');
            lightningGradient.addColorStop(1, '#ff6600');
            
            ctx.fillStyle = lightningGradient;
            ctx.fill(lightning);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke(lightning);
            
        } else if (this.type.effect === 'invincible') {
            // SHIELD with hexagon pattern
            const shield = new Path2D();
            // Shield outline (pointed bottom)
            shield.moveTo(0, -iconSize * 0.9);
            shield.lineTo(iconSize * 0.7, -iconSize * 0.5);
            shield.lineTo(iconSize * 0.7, iconSize * 0.3);
            shield.lineTo(0, iconSize);
            shield.lineTo(-iconSize * 0.7, iconSize * 0.3);
            shield.lineTo(-iconSize * 0.7, -iconSize * 0.5);
            shield.closePath();
            
            // Shield gradient
            const shieldGradient = ctx.createLinearGradient(-iconSize, 0, iconSize, 0);
            shieldGradient.addColorStop(0, '#ffdd00');
            shieldGradient.addColorStop(0.5, '#ffaa00');
            shieldGradient.addColorStop(1, '#ffdd00');
            
            ctx.fillStyle = shieldGradient;
            ctx.fill(shield);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke(shield);
            
            // Inner hexagon pattern
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            const hexSize = iconSize * 0.4;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * hexSize;
                const y = Math.sin(angle) * hexSize;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            
        } else if (this.type.effect === 'doublePoints') {
            // COIN with 2× text
            // Outer ring
            const coinGradient = ctx.createRadialGradient(
                -iconSize * 0.3, -iconSize * 0.3, 0,
                0, 0, iconSize
            );
            coinGradient.addColorStop(0, '#ffee88');
            coinGradient.addColorStop(0.5, '#dd88ff');
            coinGradient.addColorStop(1, '#aa44ff');
            
            ctx.fillStyle = coinGradient;
            ctx.beginPath();
            ctx.arc(0, 0, iconSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Coin edge (3D effect)
            ctx.strokeStyle = '#ffff88';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Inner circle
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, iconSize * 0.6, 0, Math.PI * 2);
            ctx.stroke();
            
            // 2× text (custom drawn, not emoji!)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.font = `bold ${iconSize * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText('2×', 0, 0);
            ctx.fillText('2×', 0, 0);
            
        } else if (this.type.effect === 'ghost') {
            // GHOST shape with wavy bottom
            const ghost = new Path2D();
            
            // Ghost head (rounded top)
            ghost.arc(0, -iconSize * 0.3, iconSize * 0.6, Math.PI, 0, false);
            
            // Ghost body sides
            ghost.lineTo(iconSize * 0.6, iconSize * 0.5);
            
            // Wavy bottom using sine curve
            const wavePoints = 8;
            for (let i = wavePoints; i >= 0; i--) {
                const x = (i / wavePoints) * iconSize * 1.2 - iconSize * 0.6;
                const waveHeight = Math.sin((i / wavePoints) * Math.PI * 4) * iconSize * 0.15;
                const y = iconSize * 0.5 + waveHeight;
                ghost.lineTo(x, y);
            }
            
            ghost.closePath();
            
            // Ghost gradient (semi-transparent)
            const ghostGradient = ctx.createRadialGradient(0, -iconSize * 0.3, 0, 0, 0, iconSize);
            ghostGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
            ghostGradient.addColorStop(1, 'rgba(0, 180, 255, 0.4)');
            
            ctx.fillStyle = ghostGradient;
            ctx.fill(ghost);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke(ghost);
            
            // Ghost eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-iconSize * 0.25, -iconSize * 0.3, iconSize * 0.12, 0, Math.PI * 2);
            ctx.arc(iconSize * 0.25, -iconSize * 0.3, iconSize * 0.12, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye highlights
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-iconSize * 0.25 - 2, -iconSize * 0.3 - 2, iconSize * 0.05, 0, Math.PI * 2);
            ctx.arc(iconSize * 0.25 - 2, -iconSize * 0.3 - 2, iconSize * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    darkenColor(color) {
        // Simple color darkening for gradient
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 50);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 50);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 50);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// ============================================
// GAME OBJECT
// ============================================

class Game {
    constructor() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.powerUp = null; // Current power-up on field
        this.activePowerUps = []; // Active power-ups affecting snake
        this.score = 0;
        this.starfield = new Starfield();
        this.spaceEnvironment = new SpaceEnvironment(); // Add space environment
        this.moveSpeedMultiplier = 1.0;
        
        // Combo system
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.lastFoodTime = 0;
        this.comboTimeWindow = 3000; // 3 seconds to maintain combo
        this.comboText = [];
        
        // Trail system
        this.trails = [];
        this.trailMaxLength = 8;
        
        // Milestone system
        this.milestones = [10, 20, 30];
        this.achievedMilestones = [];
        this.milestoneText = null;
        this.lastDirection = Direction.RIGHT;
        
        // High score system
        this.isHighScore = false;
        this.highScoreRank = 0;
        this.highScoreChecked = false;
        this.playerName = '';
        this.enteringName = false;
        this.maxCombo = 0; // Track best combo this game
    }
    
    update() {
        // Update starfield even in menu
        this.starfield.update(this.snake.segments.length);
        
        // Update space environment
        this.spaceEnvironment.update();
        
        // Update screen shake
        screenShake.update();
        
        // Update power-up animation if present
        if (this.powerUp) {
            this.powerUp.update();
        }
        
        // Update food animation
        this.food.update();
        
        // Update active power-ups (check expiration)
        const currentTime = Date.now();
        this.activePowerUps = this.activePowerUps.filter(pu => {
            if (currentTime >= pu.expireTime) {
                // Power-up expired
                if (pu.type.effect === 'moveSpeed') {
                    this.moveSpeedMultiplier = 1.0;
                }
                return false;
            }
            return true;
        });
        
        // Update combo system - check if combo expired
        if (this.comboCount > 0 && currentTime - this.lastFoodTime > this.comboTimeWindow) {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        
        // Update combo text animations
        this.comboText = this.comboText.filter(text => {
            text.life -= 0.02;
            text.y -= 1;
            return text.life > 0;
        });
        
        // Update milestone text
        if (this.milestoneText) {
            this.milestoneText.life -= 0.01;
            if (this.milestoneText.life <= 0) {
                this.milestoneText = null;
            }
        }
        
        // Update particles even during game over for death explosion
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        if (currentState !== GameState.PLAYING) return;
        
        // Check if enough time has passed for next move (with speed multiplier)
        const currentMoveInterval = MOVE_INTERVAL / this.moveSpeedMultiplier;
        if (currentTime - lastMoveTime < currentMoveInterval) {
            return; // Not time to move yet
        }
        lastMoveTime = currentTime;
        
        // Update snake
        this.snake.update();
        
        // Get head and tail positions
        let head = this.snake.segments[0];
        const tail = this.snake.segments[this.snake.segments.length - 1];
        
        // Create trail at tail position (so trail follows behind)
        this.trails.push({
            x: tail.x * GRID_SIZE + GRID_SIZE / 2,
            y: tail.y * GRID_SIZE + GRID_SIZE / 2,
            life: 1.0,
            size: GRID_SIZE * 0.8
        });
        
        // Limit trail length and update
        if (this.trails.length > this.trailMaxLength) {
            this.trails.shift();
        }
        this.trails.forEach(trail => {
            trail.life -= 1 / this.trailMaxLength;
        });
        
        // Check for self-collision (game over) - unless ghost mode or invincible
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        
        if (!hasGhost && !hasInvincible && this.snake.checkSelfCollision()) {
            console.log('COLLISION DETECTED - Setting GAME_OVER state');
            currentState = GameState.GAME_OVER;
            
            // Stop background music
            audio.stopBackgroundMusic();
            
            // Update stats and check for high score (only once)
            if (!this.highScoreChecked) {
                const foodEaten = this.snake.segments.length - INITIAL_LENGTH;
                highScoreManager.updateStats(this.score, foodEaten, this.maxCombo, this.snake.segments.length);
                
                this.isHighScore = highScoreManager.isHighScore(this.score);
                this.highScoreChecked = true;
                
                if (this.isHighScore) {
                    console.log('NEW HIGH SCORE!');
                    this.enteringName = true;
                    this.playerName = '';
                }
            }
            
            // Enhanced death sequence
            // (head already defined above)
            
            // Massive screen shake
            screenShake.shake(20, 30);
            
            // Explode all segments outward
            this.snake.segments.forEach((segment, index) => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 4;
                const centerX = segment.x * GRID_SIZE + GRID_SIZE / 2;
                const centerY = segment.y * GRID_SIZE + GRID_SIZE / 2;
                const color = index === 0 ? '#00ffee' : '#00aabb';
                
                // Create 3 particles per segment using Particle class
                for (let i = 0; i < 3; i++) {
                    const particle = new Particle(centerX, centerY, color);
                    // Customize velocity for explosion effect
                    particle.vx = Math.cos(angle + i * 0.5) * speed;
                    particle.vy = Math.sin(angle + i * 0.5) * speed;
                    particle.life = 1.5;
                    particle.decay = 0.01;
                    particle.size = Math.random() * 6 + 3;
                    particles.push(particle);
                }
            });
            
            // Play death sound sequence
            playDeathSound();
            setTimeout(() => playDeathSound(), 150);
            
            return;
        }
        
        // Check if snake ate food (head already defined above)
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow();
            
            // Check for milestone achievement
            const snakeLength = this.snake.segments.length;
            this.milestones.forEach(milestone => {
                if (snakeLength === milestone && !this.achievedMilestones.includes(milestone)) {
                    this.achievedMilestones.push(milestone);
                    this.milestoneText = {
                        text: `${milestone} SEGMENTS!`,
                        subtext: milestone === 10 ? 'MASSIVE!' : milestone === 20 ? 'UNSTOPPABLE!' : 'LEGENDARY!',
                        life: 2.0,
                        y: CANVAS_HEIGHT / 2 - 50
                    };
                    playMilestoneSound();
                    screenShake.shake(15, 20);
                    
                    // Massive particle explosion
                    for (let i = 0; i < 30; i++) {
                        createParticles(
                            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
                            ['#ffaa00', '#ff6699', '#00ffff', '#00ffee'][Math.floor(Math.random() * 4)],
                            1
                        );
                    }
                }
            });
            
            // Update combo
            const timeSinceLastFood = Date.now() - this.lastFoodTime;
            if (timeSinceLastFood < this.comboTimeWindow) {
                this.comboCount++;
                // Multiplier increases: 1x, 2x, 3x, 5x, 8x
                if (this.comboCount >= 8) this.comboMultiplier = 8;
                else if (this.comboCount >= 5) this.comboMultiplier = 5;
                else if (this.comboCount >= 3) this.comboMultiplier = 3;
                else if (this.comboCount >= 2) this.comboMultiplier = 2;
            } else {
                this.comboCount = 1;
                this.comboMultiplier = 1;
            }
            this.lastFoodTime = Date.now();
            
            // Track maximum combo achieved
            this.maxCombo = Math.max(this.maxCombo, this.comboCount);
            
            // Apply points with combo multiplier
            const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
            const basePoints = hasDoublePoints ? 20 : 10;
            const points = basePoints * this.comboMultiplier;
            this.score += points;
            updateScoreDisplay();
            
            // V2: Update music intensity based on snake length
            if (typeof setMusicIntensity === 'function') {
                setMusicIntensity(this.snake.segments.length);
            }
            
            // Show combo text if multiplier > 1
            if (this.comboMultiplier > 1) {
                this.comboText.push({
                    text: `${this.comboMultiplier}x COMBO!`,
                    x: head.x * GRID_SIZE + GRID_SIZE / 2,
                    y: head.y * GRID_SIZE,
                    life: 1.0,
                    multiplier: this.comboMultiplier
                });
                
                // Escalating screen shake based on combo
                screenShake.shake(2 + this.comboMultiplier, 6);
                
                // Play combo sound
                playComboSound(this.comboMultiplier);
            } else {
                // Subtle screen shake on eat
                screenShake.shake(3, 5);
                // V2: Play eat sound with combo count and position for spatial audio
                playEatSound(this.comboCount, this.food.x * GRID_SIZE, CANVAS_WIDTH);
            }
            
            this.food.respawn(this.snake);
            
            // Spawn particles at food location
            createParticles(
                this.food.x * GRID_SIZE + GRID_SIZE / 2,
                this.food.y * GRID_SIZE + GRID_SIZE / 2,
                '#ff3366',
                8
            );
            
            // Chance to spawn power-up
            if (!this.powerUp && Math.random() < POWERUP_SPAWN_CHANCE) {
                const types = Object.values(PowerUpType);
                const randomType = types[Math.floor(Math.random() * types.length)];
                this.powerUp = new PowerUp(this.snake, randomType);
            }
        }
        
        // Check if snake collected power-up
        if (this.powerUp) {
            if (head.x === this.powerUp.x && head.y === this.powerUp.y) {
                // Activate power-up
                this.activePowerUps.push({
                    type: this.powerUp.type,
                    expireTime: Date.now() + this.powerUp.type.duration
                });
                
                // Apply immediate effects
                if (this.powerUp.type.effect === 'moveSpeed') {
                    this.moveSpeedMultiplier = 1.8;
                }
                
                // Visual and audio feedback
                screenShake.shake(5, 8);
                playPowerUpSound();
                createParticles(
                    this.powerUp.x * GRID_SIZE + GRID_SIZE / 2,
                    this.powerUp.y * GRID_SIZE + GRID_SIZE / 2,
                    this.powerUp.type.color,
                    15
                );
                
                this.powerUp = null; // Remove collected power-up
            }
        }
    }
    
    render(ctx) {
        // Save context for screen shake
        ctx.save();
        
        // Apply screen shake offset
        screenShake.apply(ctx);
        
        // Clear canvas with dark background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw starfield with nebulae
        this.starfield.render(ctx, this.activePowerUps);
        
        // Draw space environment (planets, sun, ships, asteroids)
        this.spaceEnvironment.render(ctx);
        
        // Draw subtle grid lines
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
        ctx.restore();
        
        // Draw food
        this.food.render(ctx);
        
        // Draw power-up if present
        if (this.powerUp) {
            this.powerUp.render(ctx);
        }
        
        // Draw snake (with power-up effects)
        this.renderSnakeWithEffects(ctx);
        
        // Draw trails on top of snake
        this.renderTrails(ctx);
        
        // Draw particles
        particles.forEach(particle => particle.render(ctx));
        
        // Draw combo text
        this.comboText.forEach(text => {
            ctx.save();
            ctx.globalAlpha = text.life;
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            
            // Color based on multiplier
            let color = '#ffffff';
            if (text.multiplier >= 5) color = '#ff00ff';
            else if (text.multiplier >= 3) color = '#ffaa00';
            else if (text.multiplier >= 2) color = '#00ffff';
            
            ctx.fillStyle = color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillText(text.text, text.x, text.y);
            ctx.restore();
        });
        
        // Draw milestone text
        if (this.milestoneText) {
            ctx.save();
            ctx.globalAlpha = Math.min(this.milestoneText.life, 1.0);
            
            const scale = this.milestoneText.life > 1.5 ? 1 + (2 - this.milestoneText.life) * 2 : 1;
            ctx.translate(CANVAS_WIDTH / 2, this.milestoneText.y);
            ctx.scale(scale, scale);
            
            // Main text
            ctx.font = 'bold 64px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffaa00';
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#ffaa00';
            ctx.fillText(this.milestoneText.text, 0, 0);
            
            // Subtext
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.fillText(this.milestoneText.subtext, 0, 50);
            
            ctx.restore();
        }
        
        // Draw UI text based on state
        if (currentState === GameState.MENU) {
            ctx.fillStyle = '#00ffee';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (currentState === GameState.GAME_OVER) {
            // Dark overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            ctx.save();
            ctx.textAlign = 'center';
            
            if (this.enteringName) {
                // NEW HIGH SCORE - Name Entry Screen
                ctx.fillStyle = '#ffdd00';
                ctx.font = 'bold 42px Arial';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ffdd00';
                ctx.fillText('🎉 NEW HIGH SCORE! 🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120);
                
                ctx.font = 'bold 28px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.fillText(`Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
                
                ctx.font = '20px Arial';
                ctx.fillText('Enter your name:', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
                
                // Name input box
                ctx.strokeStyle = '#00ffee';
                ctx.lineWidth = 3;
                ctx.strokeRect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 - 10, 300, 50);
                
                // Player name with cursor
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#00ffee';
                const displayName = this.playerName || '_';
                ctx.fillText(displayName + (Math.floor(Date.now() / 500) % 2 ? '|' : ''), 
                            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
                
                ctx.font = '16px Arial';
                ctx.fillStyle = '#aaaaaa';
                ctx.fillText('Press ENTER when done (or ESC to skip)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
                
            } else {
                // Regular Game Over Screen with Leaderboard
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 48px Arial';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ff0000';
                ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 100);
                
                // Final stats
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, 150);
                
                ctx.font = '18px Arial';
                ctx.fillStyle = '#aaaaaa';
                const foodEaten = this.snake.segments.length - INITIAL_LENGTH;
                ctx.fillText(`Length: ${this.snake.segments.length} | Food: ${foodEaten} | Best Combo: x${this.maxCombo}`, 
                            CANVAS_WIDTH / 2, 180);
                
                // High Score indicator
                if (this.isHighScore && this.highScoreRank > 0) {
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#ffdd00';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#ffdd00';
                    ctx.fillText(`⭐ Rank #${this.highScoreRank} on Leaderboard! ⭐`, CANVAS_WIDTH / 2, 215);
                }
                
                // Leaderboard Title
                ctx.font = 'bold 26px Arial';
                ctx.fillStyle = '#00ffee';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffee';
                ctx.fillText('━━━ TOP 5 HIGH SCORES ━━━', CANVAS_WIDTH / 2, 270);
                
                // Leaderboard Entries
                const highScores = highScoreManager.getTopScores();
                ctx.font = '18px "Courier New"';
                ctx.shadowBlur = 5;
                
                if (highScores.length === 0) {
                    ctx.fillStyle = '#888888';
                    ctx.fillText('No high scores yet. Be the first!', CANVAS_WIDTH / 2, 320);
                } else {
                    highScores.forEach((entry, index) => {
                        const y = 310 + index * 35;
                        const isCurrentScore = this.isHighScore && index + 1 === this.highScoreRank;
                        
                        // Highlight current game's score
                        if (isCurrentScore) {
                            ctx.fillStyle = 'rgba(255, 221, 0, 0.2)';
                            ctx.fillRect(CANVAS_WIDTH / 2 - 280, y - 20, 560, 30);
                        }
                        
                        // Rank
                        ctx.fillStyle = index < 3 ? '#ffdd00' : '#aaaaaa';
                        ctx.textAlign = 'left';
                        ctx.fillText(`${index + 1}.`, CANVAS_WIDTH / 2 - 270, y);
                        
                        // Name (truncate if too long)
                        ctx.fillStyle = isCurrentScore ? '#ffdd00' : '#ffffff';
                        const displayName = entry.name.length > 12 ? entry.name.substring(0, 12) + '...' : entry.name;
                        ctx.fillText(displayName, CANVAS_WIDTH / 2 - 240, y);
                        
                        // Score
                        ctx.textAlign = 'right';
                        ctx.fillText(`${entry.score}`, CANVAS_WIDTH / 2 + 50, y);
                        
                        // Length
                        ctx.fillStyle = isCurrentScore ? '#ffaa00' : '#888888';
                        ctx.fillText(`L:${entry.length}`, CANVAS_WIDTH / 2 + 150, y);
                        
                        // Best Combo
                        ctx.fillText(`C:x${entry.combo}`, CANVAS_WIDTH / 2 + 250, y);
                        
                        ctx.textAlign = 'center';
                    });
                }
                
                // Stats Summary
                const stats = highScoreManager.loadStats();
                ctx.font = '16px Arial';
                ctx.fillStyle = '#666666';
                ctx.shadowBlur = 0;
                ctx.fillText(`Games Played: ${stats.gamesPlayed} | Best: ${stats.bestScore} | Total Food: ${stats.totalFood}`, 
                            CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
                
                // Restart instruction
                ctx.font = '18px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.fillText('Press SPACE to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
            }
            
            ctx.restore();
        }
        
        ctx.textAlign = 'left'; // Reset
        
        // Restore context (screen shake)
        ctx.restore();
    }
    
    renderTrails(ctx) {
        // V2: Determine trail color based on active power-ups (cyan default)
        let trailColor = V2_COLORS.snakePrimary;
        let trailGlow = V2_COLORS.snakeGlow;
        
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        const hasSpeed = this.activePowerUps.some(pu => pu.type.effect === 'moveSpeed');
        const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
        
        if (hasGhost) {
            trailColor = V2_COLORS.accent;  // V2: Magenta when ghost
            trailGlow = V2_COLORS.accentGlow;
        } else if (hasInvincible) {
            trailColor = '#ffaa00';
            trailGlow = '#ffaa00';
        } else if (hasSpeed) {
            trailColor = '#00aaff';
            trailGlow = '#00aaff';
        } else if (hasDoublePoints) {
            trailColor = '#aa00ff';
            trailGlow = '#aa00ff';
        }
        
        // Draw trails from oldest to newest
        this.trails.forEach(trail => {
            ctx.save();
            ctx.globalAlpha = trail.life * 0.7;
            ctx.shadowBlur = 25 * trail.life;
            ctx.shadowColor = trailGlow;
            
            const gradient = ctx.createRadialGradient(
                trail.x, trail.y, 0,
                trail.x, trail.y, trail.size / 2
            );
            gradient.addColorStop(0, trailColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                trail.x - trail.size / 2,
                trail.y - trail.size / 2,
                trail.size,
                trail.size
            );
            ctx.restore();
        });
    }
    
    renderSnakeWithEffects(ctx) {
        // Check active power-ups
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        const hasSpeed = this.activePowerUps.some(pu => pu.type.effect === 'moveSpeed');
        const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
        
        if (hasGhost) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            this.snake.render(ctx);
            ctx.restore();
        } else if (hasInvincible) {
            // Flashing golden effect
            const flash = Math.sin(Date.now() * 0.01) > 0;
            if (flash) {
                ctx.save();
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#ffaa00';
                this.snake.render(ctx);
                ctx.restore();
            } else {
                this.snake.render(ctx);
            }
        } else if (hasSpeed) {
            // Blue speed trail
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00aaff';
            this.snake.render(ctx);
            ctx.restore();
        } else if (hasDoublePoints) {
            // Purple glow
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#aa00ff';
            this.snake.render(ctx);
            ctx.restore();
        } else {
            this.snake.render(ctx);
        }
    }
    
    reset() {
        this.snake = new Snake();
        this.food = new Food(this.snake);
        this.powerUp = null;
        this.activePowerUps = [];
        this.moveSpeedMultiplier = 1.0;
        this.score = 0;
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.lastFoodTime = 0;
        this.comboText = [];
        this.trails = [];
        this.achievedMilestones = [];
        this.milestoneText = null;
        this.starfield = new Starfield();
        
        // Reset high score tracking
        this.isHighScore = false;
        this.highScoreRank = 0;
        this.highScoreChecked = false;
        this.playerName = '';
        this.enteringName = false;
        this.maxCombo = 0;
        
        updateScoreDisplay();
    }
}

// ============================================
// INPUT HANDLING
// ============================================

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Handle name entry in game over screen
    if (currentState === GameState.GAME_OVER && game.enteringName) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Submit high score
            if (game.playerName.trim().length === 0) {
                game.playerName = 'Anonymous';
            }
            game.highScoreRank = highScoreManager.addScore(
                game.playerName, 
                game.score, 
                game.snake.segments.length,
                game.maxCombo
            );
            game.enteringName = false;
            playMilestoneSound();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Skip name entry
            game.playerName = 'Anonymous';
            game.highScoreRank = highScoreManager.addScore(
                game.playerName, 
                game.score, 
                game.snake.segments.length,
                game.maxCombo
            );
            game.enteringName = false;
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            game.playerName = game.playerName.slice(0, -1);
        } else if (e.key.length === 1 && game.playerName.length < 15) {
            // Add letter/number/space (max 15 characters)
            if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
                game.playerName += e.key;
            }
        }
        return; // Don't process other keys while entering name
    }
    
    // Handle arrow keys
    if (currentState === GameState.PLAYING) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            game.snake.setDirection(Direction.UP);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            game.snake.setDirection(Direction.DOWN);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            game.snake.setDirection(Direction.LEFT);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            game.snake.setDirection(Direction.RIGHT);
        }
    }
    
    // Handle spacebar for state changes
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        
        // Initialize audio on first interaction
        audio.init();
        
        if (currentState === GameState.MENU) {
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
            playGameStart();
            // Start ambient background music
            audio.startBackgroundMusic();
        } else if (currentState === GameState.GAME_OVER && !game.enteringName) {
            game.reset();
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
            playGameStart();
            // Restart background music
            audio.startBackgroundMusic();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ============================================
// TIER-1 FUNDAMENTALS
// ============================================

// === SETTINGS SYSTEM ===
class SettingsManager {
    constructor() {
        this.settingsKey = 'snake_settings';
        this.defaultSettings = {
            masterVolume: 30,
            musicVolume: 15,
            showFPS: false,
            showTouchControls: 'auto' // auto, always, never
        };
        this.settings = this.loadSettings();
        this.applySettings();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.settingsKey);
            return saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : this.defaultSettings;
        } catch (e) {
            console.warn('Failed to load settings:', e);
            return this.defaultSettings;
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
            this.applySettings();
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    applySettings() {
        // Apply volume settings
        audio.masterVolume = this.settings.masterVolume / 100;
        audio.musicVolume = this.settings.musicVolume / 100;
        
        // Apply FPS counter visibility
        const fpsCounter = document.getElementById('fpsCounter');
        fpsCounter.style.display = this.settings.showFPS ? 'block' : 'none';
        
        // Apply touch controls visibility
        this.updateTouchControlsVisibility();
    }
    
    updateTouchControlsVisibility() {
        const touchControls = document.getElementById('touchControls');
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (this.settings.showTouchControls === 'always') {
            touchControls.style.display = 'flex';
        } else if (this.settings.showTouchControls === 'never') {
            touchControls.style.display = 'none';
        } else { // auto
            touchControls.style.display = isTouchDevice ? 'flex' : 'none';
        }
    }
}

const settingsManager = new SettingsManager();

// === SETTINGS MODAL ===
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeModalBtn = document.querySelector('.close-btn');
const masterVolumeSlider = document.getElementById('masterVolume');
const musicVolumeSlider = document.getElementById('musicVolume');
const masterVolumeValue = document.getElementById('masterVolumeValue');
const musicVolumeValue = document.getElementById('musicVolumeValue');
const showFPSCheckbox = document.getElementById('showFPS');
const showTouchControlsCheckbox = document.getElementById('showTouchControls');
const resetScoresBtn = document.getElementById('resetScores');

// Open settings modal
settingsBtn.addEventListener('click', () => {
    // Load current settings into UI
    masterVolumeSlider.value = settingsManager.settings.masterVolume;
    musicVolumeSlider.value = settingsManager.settings.musicVolume;
    masterVolumeValue.textContent = settingsManager.settings.masterVolume + '%';
    musicVolumeValue.textContent = settingsManager.settings.musicVolume + '%';
    showFPSCheckbox.checked = settingsManager.settings.showFPS;
    showTouchControlsCheckbox.checked = settingsManager.settings.showTouchControls === 'always';
    
    settingsModal.style.display = 'block';
});

// Close settings modal
closeModalBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Volume sliders
masterVolumeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    masterVolumeValue.textContent = value + '%';
    settingsManager.settings.masterVolume = parseInt(value);
    settingsManager.saveSettings();
    audio.updateMusicVolume(); // Update music volume in real-time
});

musicVolumeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    musicVolumeValue.textContent = value + '%';
    settingsManager.settings.musicVolume = parseInt(value);
    settingsManager.saveSettings();
    audio.updateMusicVolume(); // Update music volume in real-time
});

// FPS checkbox
showFPSCheckbox.addEventListener('change', (e) => {
    settingsManager.settings.showFPS = e.target.checked;
    settingsManager.saveSettings();
});

// Touch controls checkbox
showTouchControlsCheckbox.addEventListener('change', (e) => {
    settingsManager.settings.showTouchControls = e.target.checked ? 'always' : 'auto';
    settingsManager.saveSettings();
});

// Reset scores button
resetScoresBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all high scores? This cannot be undone!')) {
        localStorage.removeItem(highScoreManager.storageKey);
        localStorage.removeItem(highScoreManager.statsKey);
        alert('All scores have been reset!');
        settingsModal.style.display = 'none';
    }
});

// === PAUSE SYSTEM ===
let isPaused = false;
const pauseBtn = document.getElementById('pauseBtn');

function togglePause() {
    if (currentState !== GameState.PLAYING) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
    
    if (isPaused) {
        audio.stopBackgroundMusic();
    } else {
        audio.startBackgroundMusic();
        lastMoveTime = Date.now(); // Reset move timer to prevent instant move after unpause
    }
}

pauseBtn.addEventListener('click', togglePause);

// P key to pause
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
    }
});

// === FULLSCREEN SYSTEM ===
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameContainer = document.querySelector('.game-container');

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Update button icon on fullscreen change
document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.textContent = document.fullscreenElement ? '⛉' : '⛶';
});

// === FPS COUNTER ===
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

function updateFPS() {
    const now = performance.now();
    frameCount++;
    
    if (now >= lastFrameTime + 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        frameCount = 0;
        lastFrameTime = now;
        
        const fpsCounter = document.getElementById('fpsCounter');
        fpsCounter.textContent = `FPS: ${fps}`;
    }
}

// === MOBILE TOUCH CONTROLS ===
const dpadUp = document.getElementById('dpadUp');
const dpadDown = document.getElementById('dpadDown');
const dpadLeft = document.getElementById('dpadLeft');
const dpadRight = document.getElementById('dpadRight');
const actionBtn = document.getElementById('actionBtn');

// D-pad touch handlers
dpadUp.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentState === GameState.PLAYING && !isPaused) {
        game.snake.setDirection(Direction.UP);
    }
});

dpadDown.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentState === GameState.PLAYING && !isPaused) {
        game.snake.setDirection(Direction.DOWN);
    }
});

dpadLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentState === GameState.PLAYING && !isPaused) {
        game.snake.setDirection(Direction.LEFT);
    }
});

dpadRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentState === GameState.PLAYING && !isPaused) {
        game.snake.setDirection(Direction.RIGHT);
    }
});

// Action button (start/pause/restart)
function handleActionButton(e) {
    e.preventDefault();
    
    // Initialize audio on first interaction
    audio.init();
    
    if (currentState === GameState.MENU) {
        currentState = GameState.PLAYING;
        lastMoveTime = Date.now();
        playGameStart();
        audio.startBackgroundMusic();
    } else if (currentState === GameState.PLAYING) {
        togglePause();
    } else if (currentState === GameState.GAME_OVER && !game.enteringName) {
        game.reset();
        currentState = GameState.PLAYING;
        lastMoveTime = Date.now();
        playGameStart();
        audio.startBackgroundMusic();
    }
}

actionBtn.addEventListener('touchstart', handleActionButton);
actionBtn.addEventListener('click', handleActionButton);

// Prevent default touch behaviors on game elements
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());
canvas.addEventListener('touchend', (e) => e.preventDefault());

// === RESPONSIVE CANVAS ===
function resizeCanvas() {
    // Canvas size is already set in HTML, but we could add dynamic resizing here
    // For now, CSS handles the responsive scaling
    
    // Update touch controls visibility when resizing (orientation change)
    settingsManager.updateTouchControlsVisibility();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

// Initial resize
resizeCanvas();

// ============================================
// UI UPDATES
// ============================================

function updateScoreDisplay() {
    document.getElementById('score').textContent = game.score;
}

// ============================================
// GAME LOOP (with pause support)
// ============================================

const game = new Game();
updateScoreDisplay();

function gameLoop() {
    updateFPS(); // Update FPS counter
    
    if (!isPaused) {
        game.update();
    }
    
    game.render(ctx);
    
    // Draw pause overlay if paused
    if (isPaused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#00ffee';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillText('Press P or ⏸️ to Resume', canvas.width / 2, canvas.height / 2 + 40);
        ctx.restore();
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();

console.log('Snake game initialized with tier-1 fundamentals');
console.log(`Grid: ${GRID_WIDTH}x${GRID_HEIGHT} cells`);
console.log(`Cell size: ${GRID_SIZE}px`);
console.log('Features: Touch Controls, Pause, Fullscreen, FPS Counter, Settings');
