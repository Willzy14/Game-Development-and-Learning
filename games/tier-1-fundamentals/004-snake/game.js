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
// STARFIELD BACKGROUND
// ============================================

class Starfield {
    constructor() {
        this.stars = [];
        // Create multiple layers for parallax effect (more stars for bigger canvas)
        this.layers = [
            { count: 150, speed: 0.3, size: 1, opacity: 0.4, color: '#ffffff' },
            { count: 80, speed: 0.6, size: 2, opacity: 0.6, color: '#aaccff' },
            { count: 50, speed: 0.9, size: 3, opacity: 0.8, color: '#ffccaa' }
        ];
        
        this.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    size: layer.size,
                    speed: layer.speed,
                    opacity: layer.opacity,
                    color: layer.color,
                    twinkle: Math.random() * Math.PI * 2 // For twinkling effect
                });
            }
        });
        
        // ENHANCED: Multi-layer nebula clouds with depth
        this.nebulae = [];
        for (let i = 0; i < 12; i++) {
            this.nebulae.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                radius: 60 + Math.random() * 160,
                // More color variety: purple, blue, teal, orange, magenta
                color: ['rgba(100, 50, 150', 'rgba(50, 100, 150', 'rgba(50, 150, 150', 
                        'rgba(150, 100, 50', 'rgba(150, 50, 100'][Math.floor(Math.random() * 5)],
                alpha: 0.015 + Math.random() * 0.03,
                drift: (Math.random() - 0.5) * 0.15,
                layer: Math.floor(Math.random() * 3), // 0 = far, 1 = mid, 2 = near
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.002 + Math.random() * 0.003
            });
        }
        
        // NEW: Distant spiral galaxies using logarithmic spiral formula
        this.galaxies = [];
        for (let i = 0; i < 3; i++) {
            this.galaxies.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                coreRadius: 8 + Math.random() * 12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.0005,
                spiralTightness: 0.15 + Math.random() * 0.1,
                arms: 2 + Math.floor(Math.random() * 2), // 2-3 spiral arms
                color: ['#8888ff', '#ff88ff', '#88ffff'][Math.floor(Math.random() * 3)]
            });
        }
        
        // NEW: Cosmic dust particles with parallax
        this.dustParticles = [];
        for (let i = 0; i < 200; i++) {
            this.dustParticles.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: 0.5 + Math.random() * 1,
                speed: 0.05 + Math.random() * 0.15,
                opacity: 0.1 + Math.random() * 0.2,
                drift: (Math.random() - 0.5) * 0.3
            });
        }
        
        this.intensity = 1.0; // Gameplay intensity multiplier
    }
    
    update(snakeLength = 3) {
        // Increase intensity based on snake length
        this.intensity = 1 + (snakeLength / 40) * 0.5;
        
        // Slowly move stars down for subtle motion
        this.stars.forEach(star => {
            star.y += star.speed * 0.1 * this.intensity;
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
            star.twinkle += 0.02 * this.intensity; // Animate twinkle faster with intensity
        });
        
        // Drift nebulae slowly with pulsing effect
        this.nebulae.forEach(nebula => {
            nebula.x += nebula.drift;
            nebula.pulsePhase += nebula.pulseSpeed;
            if (nebula.x < -nebula.radius) nebula.x = CANVAS_WIDTH + nebula.radius;
            if (nebula.x > CANVAS_WIDTH + nebula.radius) nebula.x = -nebula.radius;
        });
        
        // Rotate galaxies slowly
        this.galaxies.forEach(galaxy => {
            galaxy.rotation += galaxy.rotationSpeed;
        });
        
        // Drift dust particles with parallax
        this.dustParticles.forEach(particle => {
            particle.y += particle.speed * 0.1 * this.intensity;
            particle.x += particle.drift * 0.1;
            if (particle.y > CANVAS_HEIGHT) {
                particle.y = 0;
                particle.x = Math.random() * CANVAS_WIDTH;
            }
            if (particle.x < 0) particle.x = CANVAS_WIDTH;
            if (particle.x > CANVAS_WIDTH) particle.x = 0;
        });
    }
    
    render(ctx, activePowerUps = []) {
        // Layer 1: Distant galaxies (furthest back)
        this.renderGalaxies(ctx);
        
        // Layer 2: Multi-layer nebulae with additive blending
        // Sort by layer for proper depth ordering
        const sortedNebulae = [...this.nebulae].sort((a, b) => a.layer - b.layer);
        
        sortedNebulae.forEach(nebula => {
            const gradient = ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            
            // Tint nebula based on active power-ups
            let color = nebula.color;
            if (activePowerUps.some(pu => pu.type.effect === 'ghost')) {
                color = 'rgba(0, 255, 255';
            } else if (activePowerUps.some(pu => pu.type.effect === 'invincible')) {
                color = 'rgba(255, 170, 0';
            }
            
            // Pulsing alpha for dynamic effect
            const pulseAlpha = nebula.alpha * (0.8 + Math.sin(nebula.pulsePhase) * 0.2);
            
            gradient.addColorStop(0, color + `, ${pulseAlpha})`);
            gradient.addColorStop(0.4, color + `, ${pulseAlpha * 0.7})`);
            gradient.addColorStop(0.7, color + `, ${pulseAlpha * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // Use lighter composite operation for additive blending
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.restore();
        });
        
        // Layer 3: Cosmic dust particles
        ctx.save();
        ctx.globalAlpha = 0.3;
        this.dustParticles.forEach(particle => {
            ctx.fillStyle = `rgba(200, 200, 220, ${particle.opacity})`;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        ctx.restore();
        
        // Layer 4: Stars with intensity-based brightness (foreground)
        this.stars.forEach(star => {
            const twinkleAlpha = star.opacity * (0.7 + Math.sin(star.twinkle) * 0.3) * this.intensity;
            ctx.fillStyle = star.color.replace(')', `, ${Math.min(twinkleAlpha, 1.0)})`);
            if (!ctx.fillStyle.includes('rgba')) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(twinkleAlpha, 1.0)})`;
            }
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
    
    renderGalaxies(ctx) {
        this.galaxies.forEach(galaxy => {
            ctx.save();
            ctx.translate(galaxy.x, galaxy.y);
            ctx.rotate(galaxy.rotation);
            
            // Render using logarithmic spiral formula: r = a * e^(b*θ)
            // Create multiple spiral arms
            for (let arm = 0; arm < galaxy.arms; arm++) {
                const armAngle = (Math.PI * 2 / galaxy.arms) * arm;
                
                ctx.beginPath();
                
                // Draw spiral arm with many points
                for (let i = 0; i < 100; i++) {
                    const theta = (i / 100) * Math.PI * 4; // 2 full rotations
                    const r = galaxy.coreRadius * Math.exp(galaxy.spiralTightness * theta);
                    
                    if (r > galaxy.coreRadius * 15) break; // Don't spiral too far
                    
                    const x = r * Math.cos(theta + armAngle);
                    const y = r * Math.sin(theta + armAngle);
                    
                    // Vary opacity based on distance from core
                    const opacity = Math.max(0, 0.4 - (r / (galaxy.coreRadius * 15)) * 0.4);
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        // Draw stars along spiral
                        const size = 1 + (Math.random() * 0.5);
                        ctx.fillStyle = galaxy.color.replace(')', `, ${opacity})`);
                        if (!ctx.fillStyle.includes('rgba')) {
                            ctx.fillStyle = `rgba(136, 136, 255, ${opacity})`;
                        }
                        ctx.fillRect(x - size/2, y - size/2, size, size);
                    }
                }
            }
            
            // Draw bright galactic core
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.coreRadius);
            coreGradient.addColorStop(0, galaxy.color.replace(')', ', 0.8)'));
            coreGradient.addColorStop(0.5, galaxy.color.replace(')', ', 0.4)'));
            coreGradient.addColorStop(1, galaxy.color.replace(')', ', 0)'));
            if (!coreGradient) {
                coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.coreRadius);
                coreGradient.addColorStop(0, 'rgba(200, 200, 255, 0.8)');
                coreGradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.4)');
                coreGradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
            }
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(0, 0, galaxy.coreRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
}

// ============================================
// SPACE ENVIRONMENT (Planets, Sun, Ships, Asteroids)
// ============================================

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
                radius: 50,
                color: '#4488ff',
                atmosphereColor: '#6699ff',
                hasRings: false,
                rotation: 0,
                rotationSpeed: 0.001,
                craters: this.generateCraters(5, 50)
            },
            {
                x: CANVAS_WIDTH * 0.85,
                y: CANVAS_HEIGHT * 0.7,
                radius: 70,
                color: '#ff8844',
                atmosphereColor: '#ffaa66',
                hasRings: true,
                ringColor: '#aa6644',
                ringAngle: -0.3,
                rotation: 0,
                rotationSpeed: 0.0005,
                craters: this.generateCraters(7, 70)
            },
            {
                x: CANVAS_WIDTH * 0.75,
                y: CANVAS_HEIGHT * 0.15,
                radius: 40,
                color: '#88ff88',
                atmosphereColor: '#aaffaa',
                hasRings: false,
                rotation: 0,
                rotationSpeed: 0.002,
                craters: this.generateCraters(4, 40)
            }
        ];
    }
    
    generateCraters(count, planetRadius) {
        const craters = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * planetRadius * 0.6;
            craters.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                radius: 3 + Math.random() * 8
            });
        }
        return craters;
    }
    
    createSun() {
        return {
            x: CANVAS_WIDTH * 0.05,
            y: CANVAS_HEIGHT * 0.1,
            radius: 60,
            coreRadius: 40,
            coronaLayers: 3,
            pulsePhase: 0
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
        const pulse = Math.sin(sun.pulsePhase) * 0.2 + 1;
        
        // Draw corona layers
        for (let i = sun.coronaLayers; i >= 0; i--) {
            const layerRadius = sun.radius + (i * 15) * pulse;
            const alpha = (0.15 - i * 0.04) / pulse;
            
            const gradient = ctx.createRadialGradient(
                sun.x, sun.y, sun.coreRadius,
                sun.x, sun.y, layerRadius
            );
            gradient.addColorStop(0, `rgba(255, 255, 100, ${alpha * 2})`);
            gradient.addColorStop(0.5, `rgba(255, 200, 50, ${alpha})`);
            gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, layerRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw core
        const coreGradient = ctx.createRadialGradient(
            sun.x, sun.y, 0,
            sun.x, sun.y, sun.coreRadius
        );
        coreGradient.addColorStop(0, '#ffffaa');
        coreGradient.addColorStop(0.7, '#ffdd44');
        coreGradient.addColorStop(1, '#ff8800');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.coreRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderPlanet(ctx, planet) {
        ctx.save();
        ctx.translate(planet.x, planet.y);
        ctx.rotate(planet.rotation);
        
        // Draw rings (if present) - ENHANCED with multiple bands
        if (planet.hasRings) {
            ctx.save();
            ctx.rotate(planet.ringAngle);
            ctx.scale(1, 0.3);
            
            // Multiple ring bands for depth
            const ringBands = [
                { inner: 0.8, outer: 1.0, alpha: 'cc' },
                { inner: 1.0, outer: 1.2, alpha: '99' },
                { inner: 1.2, outer: 1.4, alpha: '66' },
                { inner: 1.4, outer: 1.6, alpha: '33' }
            ];
            
            ringBands.forEach(band => {
                const ringGradient = ctx.createRadialGradient(0, 0, planet.radius * band.inner, 0, 0, planet.radius * band.outer);
                ringGradient.addColorStop(0, planet.ringColor + band.alpha);
                ringGradient.addColorStop(0.5, planet.ringColor + band.alpha);
                ringGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = ringGradient;
                ctx.beginPath();
                ctx.arc(0, 0, planet.radius * band.outer, 0, Math.PI * 2);
                ctx.arc(0, 0, planet.radius * band.inner, 0, Math.PI * 2, true);
                ctx.fill();
            });
            
            // Ring shadows on planet (partial arc)
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(0, 0, planet.radius * 0.9, planet.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            ctx.restore();
        }
        
        // ADVANCED planet surface with 3D lighting
        const gradient = ctx.createRadialGradient(
            -planet.radius * 0.35, -planet.radius * 0.35, planet.radius * 0.1,
            0, 0, planet.radius * 1.1
        );
        gradient.addColorStop(0, this.lightenColor(planet.color, 60));
        gradient.addColorStop(0.3, this.lightenColor(planet.color, 30));
        gradient.addColorStop(0.6, planet.color);
        gradient.addColorStop(0.85, this.darkenColor(planet.color, 30));
        gradient.addColorStop(1, this.darkenColor(planet.color, 50));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // ADVANCED craters with 3D bowl effect
        planet.craters.forEach(crater => {
            // Crater shadow (outer rim)
            const craterShadow = ctx.createRadialGradient(
                crater.x, crater.y, 0,
                crater.x, crater.y, crater.radius
            );
            craterShadow.addColorStop(0, this.darkenColor(planet.color, 50));
            craterShadow.addColorStop(0.4, this.darkenColor(planet.color, 30));
            craterShadow.addColorStop(0.7, planet.color);
            craterShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = craterShadow;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Crater center (darker)
            ctx.fillStyle = this.darkenColor(planet.color, 60);
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Crater highlight (rim catch light)
            ctx.fillStyle = this.lightenColor(planet.color, 20);
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(crater.x - crater.radius * 0.3, crater.y - crater.radius * 0.3, crater.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1.0;
        });
        
        // CLOUD PATTERNS - Pseudo-noise using overlapping circles
        const cloudCount = Math.floor(planet.radius / 10);
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < cloudCount; i++) {
            // Pseudo-random cloud positions based on planet properties
            const angle = ((i * 137.5) % 360) * (Math.PI / 180); // Golden angle distribution
            const distance = (Math.sin(i * 2.3) * 0.5 + 0.5) * planet.radius * 0.7;
            const cloudX = Math.cos(angle) * distance;
            const cloudY = Math.sin(angle) * distance;
            const cloudSize = 8 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 8;
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Additional small cloud wisps
            ctx.beginPath();
            ctx.arc(cloudX + cloudSize * 0.6, cloudY + cloudSize * 0.3, cloudSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        
        // SURFACE DETAIL - Small mountains/rocks
        const detailCount = Math.floor(planet.radius / 15);
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < detailCount; i++) {
            const angle = ((i * 222.5) % 360) * (Math.PI / 180);
            const distance = (Math.sin(i * 3.1) * 0.5 + 0.5) * planet.radius * 0.8;
            const detailX = Math.cos(angle) * distance;
            const detailY = Math.sin(angle) * distance;
            const detailSize = 2 + Math.sin(i * 2.1) * 2;
            
            // Tiny mountain/rock shape (triangle)
            ctx.fillStyle = this.darkenColor(planet.color, 40);
            ctx.beginPath();
            ctx.moveTo(detailX, detailY - detailSize);
            ctx.lineTo(detailX - detailSize * 0.8, detailY + detailSize * 0.5);
            ctx.lineTo(detailX + detailSize * 0.8, detailY + detailSize * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        
        // Terminator line (day/night boundary) for extra realism
        const terminatorGradient = ctx.createLinearGradient(-planet.radius, 0, planet.radius * 0.5, 0);
        terminatorGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        terminatorGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
        terminatorGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
        terminatorGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        ctx.fillStyle = terminatorGradient;
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // ENHANCED atmosphere glow (multiple layers)
        const atmoLayers = [
            { mult: 1.15, alpha: '30', color: planet.atmosphereColor },
            { mult: 1.25, alpha: '20', color: planet.atmosphereColor },
            { mult: 1.35, alpha: '10', color: planet.atmosphereColor }
        ];
        
        atmoLayers.forEach(layer => {
            const atmosphereGradient = ctx.createRadialGradient(0, 0, planet.radius, 0, 0, planet.radius * layer.mult);
            atmosphereGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            atmosphereGradient.addColorStop(0.6, layer.color + layer.alpha);
            atmosphereGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = atmosphereGradient;
            ctx.beginPath();
            ctx.arc(0, 0, planet.radius * layer.mult, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
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
        
        // Head with rounded shape and glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
        
        // Radial gradient for head
        const gradient = ctx.createRadialGradient(
            x + GRID_SIZE / 2, y + GRID_SIZE / 2, 0,
            x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2
        );
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00aa66');
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
        
        // Body with subtle glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(0, 170, 102, ${opacity})`;
        
        // Advanced gradient: diagonal for more interesting lighting
        const gradient = ctx.createLinearGradient(
            x, y, x + GRID_SIZE, y + GRID_SIZE
        );
        const baseR = Math.floor(0 * brightnessBoost);
        const baseG = Math.floor(170 * brightnessBoost);
        const baseB = Math.floor(102 * brightnessBoost);
        
        gradient.addColorStop(0, `rgba(${baseR + 30}, ${baseG + 30}, ${baseB + 20}, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(${baseR}, ${baseG}, ${baseB}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${baseR - 30}, ${baseG - 40}, ${baseB - 30}, ${opacity})`);
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
            
            // Scale base - dark outline
            ctx.globalAlpha = opacity * 0.3;
            ctx.fillStyle = '#002211';
            ctx.beginPath();
            ctx.arc(scaleX, scaleY, scaleSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Scale highlight - lighter inner circle
            ctx.globalAlpha = opacity * 0.15;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(scaleX - 1, scaleY - 1, scaleSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Center scale detail - creates focal point
        ctx.globalAlpha = opacity * 0.25;
        ctx.fillStyle = '#004433';
        ctx.beginPath();
        ctx.arc(centerX, centerY, scaleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Center scale highlight
        ctx.globalAlpha = opacity * 0.2;
        ctx.fillStyle = '#00aa66';
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
                const color = index === 0 ? '#00ff88' : '#00aa66';
                
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
                            ['#ffaa00', '#ff6699', '#00ffff', '#00ff88'][Math.floor(Math.random() * 4)],
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
                // Play eat sound
                playEatSound();
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
            ctx.fillStyle = '#00ff88';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (currentState === GameState.GAME_OVER) {
            console.log('Rendering GAME_OVER screen');
            
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
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 3;
                ctx.strokeRect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 - 10, 300, 50);
                
                // Player name with cursor
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#00ff88';
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
                ctx.fillStyle = '#00ff88';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ff88';
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
        // Determine trail color based on active power-ups
        let trailColor = '#00ff88';
        let trailGlow = '#00ff88';
        
        const hasGhost = this.activePowerUps.some(pu => pu.type.effect === 'ghost');
        const hasInvincible = this.activePowerUps.some(pu => pu.type.effect === 'invincible');
        const hasSpeed = this.activePowerUps.some(pu => pu.type.effect === 'moveSpeed');
        const hasDoublePoints = this.activePowerUps.some(pu => pu.type.effect === 'doublePoints');
        
        if (hasGhost) {
            trailColor = '#00ffff';
            trailGlow = '#00ffff';
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
    if (e.key === ' ') {
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
// UI UPDATES
// ============================================

function updateScoreDisplay() {
    document.getElementById('score').textContent = game.score;
}

// ============================================
// GAME LOOP
// ============================================

const game = new Game();
updateScoreDisplay();

function gameLoop() {
    game.update();
    game.render(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();

console.log('Snake game initialized');
console.log(`Grid: ${GRID_WIDTH}x${GRID_HEIGHT} cells`);
console.log(`Cell size: ${GRID_SIZE}px`);
