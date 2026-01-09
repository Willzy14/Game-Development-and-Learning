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
        
        // Nebula clouds
        this.nebulae = [];
        for (let i = 0; i < 8; i++) {
            this.nebulae.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                radius: 80 + Math.random() * 120,
                color: Math.random() > 0.5 ? 'rgba(100, 50, 150' : 'rgba(50, 100, 150',
                alpha: 0.02 + Math.random() * 0.03,
                drift: (Math.random() - 0.5) * 0.2
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
        
        // Drift nebulae slowly
        this.nebulae.forEach(nebula => {
            nebula.x += nebula.drift;
            if (nebula.x < -nebula.radius) nebula.x = CANVAS_WIDTH + nebula.radius;
            if (nebula.x > CANVAS_WIDTH + nebula.radius) nebula.x = -nebula.radius;
        });
    }
    
    render(ctx, activePowerUps = []) {
        // Draw nebulae first (behind stars)
        this.nebulae.forEach(nebula => {
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
            
            gradient.addColorStop(0, color + `, ${nebula.alpha})`);
            gradient.addColorStop(0.5, color + `, ${nebula.alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        });
        
        // Draw stars with intensity-based brightness
        this.stars.forEach(star => {
            const twinkleAlpha = star.opacity * (0.7 + Math.sin(star.twinkle) * 0.3) * this.intensity;
            ctx.fillStyle = star.color.replace(')', `, ${Math.min(twinkleAlpha, 1.0)})`);
            if (!ctx.fillStyle.includes('rgba')) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(twinkleAlpha, 1.0)})`;
            }
            ctx.fillRect(star.x, star.y, star.size, star.size);
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
        
        // Draw rings (if present) - behind planet
        if (planet.hasRings) {
            ctx.save();
            ctx.rotate(planet.ringAngle);
            ctx.scale(1, 0.3);
            
            const ringGradient = ctx.createRadialGradient(0, 0, planet.radius * 0.8, 0, 0, planet.radius * 1.6);
            ringGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            ringGradient.addColorStop(0.3, planet.ringColor + '80');
            ringGradient.addColorStop(0.6, planet.ringColor + 'cc');
            ringGradient.addColorStop(0.8, planet.ringColor + '80');
            ringGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = ringGradient;
            ctx.beginPath();
            ctx.arc(0, 0, planet.radius * 1.6, 0, Math.PI * 2);
            ctx.arc(0, 0, planet.radius * 0.8, 0, Math.PI * 2, true);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Draw planet surface with gradient
        const gradient = ctx.createRadialGradient(
            -planet.radius * 0.3, -planet.radius * 0.3, 0,
            0, 0, planet.radius
        );
        gradient.addColorStop(0, this.lightenColor(planet.color, 40));
        gradient.addColorStop(0.6, planet.color);
        gradient.addColorStop(1, this.darkenColor(planet.color, 40));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw craters
        planet.craters.forEach(crater => {
            ctx.fillStyle = this.darkenColor(planet.color, 30);
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
        
        // Draw atmosphere glow
        const atmosphereGradient = ctx.createRadialGradient(0, 0, planet.radius, 0, 0, planet.radius * 1.3);
        atmosphereGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        atmosphereGradient.addColorStop(0.8, planet.atmosphereColor + '40');
        atmosphereGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = atmosphereGradient;
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
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
        
        ctx.fillStyle = '#666666';
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        asteroid.points.forEach((point, i) => {
            const x = Math.cos(point.angle) * point.distance * asteroid.radius;
            const y = Math.sin(point.angle) * point.distance * asteroid.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
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
            
            // GAME OVER text with glow
            ctx.save();
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0000';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            
            // Score text
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
            
            // Restart instruction
            ctx.font = '18px Arial';
            ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
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
        updateScoreDisplay();
    }
}

// ============================================
// INPUT HANDLING
// ============================================

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
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
        } else if (currentState === GameState.GAME_OVER) {
            game.reset();
            currentState = GameState.PLAYING;
            lastMoveTime = Date.now();
            playGameStart();
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
