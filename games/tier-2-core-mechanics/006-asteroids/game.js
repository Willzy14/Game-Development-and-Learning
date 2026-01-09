// ============================================
// ASTEROIDS - Main Game
// Tier 2: Core Mechanics
// Teaches: Rotation, Momentum, Wrapping, Shooting
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // Canvas
    WIDTH: 800,
    HEIGHT: 600,
    
    // Ship
    SHIP_SIZE: 20,
    ROTATION_SPEED: 5,          // radians per second
    THRUST_POWER: 300,          // pixels per second²
    FRICTION: 0.99,             // velocity multiplier per frame
    MAX_SPEED: 400,
    INVULNERABLE_TIME: 3,       // seconds after respawn
    
    // Bullets
    BULLET_SPEED: 600,
    BULLET_RADIUS: 2,
    BULLET_LIFETIME: 1.5,       // seconds
    FIRE_RATE: 0.15,            // seconds between shots
    MAX_BULLETS: 10,
    
    // Asteroids
    ASTEROID_SPEEDS: { large: 60, medium: 100, small: 150 },
    ASTEROID_SIZES: { large: 45, medium: 25, small: 12 },
    ASTEROID_POINTS: { large: 20, medium: 50, small: 100 },
    STARTING_ASTEROIDS: 4,
    ASTEROIDS_PER_WAVE: 2,      // additional asteroids each wave
    
    // Game
    STARTING_LIVES: 3,
    EXTRA_LIFE_SCORE: 10000,
    
    // Particles
    PARTICLE_COUNT: 8,
    PARTICLE_LIFETIME: 0.8,
};

// ============================================
// GAME STATE
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const highScoreDisplay = document.getElementById('highScore');

let gameState = 'start'; // start, playing, gameover
let score = 0;
let highScore = parseInt(localStorage.getItem('asteroidsHighScore')) || 0;
let lives = CONFIG.STARTING_LIVES;
let wave = 1;
let nextExtraLife = CONFIG.EXTRA_LIFE_SCORE;

let ship = null;
let bullets = [];
let asteroids = [];
let particles = [];

// Input state
const keys = {
    left: false,
    right: false,
    up: false,
    space: false
};
let lastFireTime = 0;

// Timing (fixed timestep)
let lastTime = 0;
let accumulator = 0;
const FIXED_DT = 1/60;

// ============================================
// SHIP CLASS
// ============================================
class Ship {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = CONFIG.WIDTH / 2;
        this.y = CONFIG.HEIGHT / 2;
        this.vx = 0;
        this.vy = 0;
        this.angle = -Math.PI / 2; // Point up
        this.radius = CONFIG.SHIP_SIZE / 2;
        this.invulnerable = true;
        this.invulnerableTimer = CONFIG.INVULNERABLE_TIME;
        this.visible = true;
        this.blinkTimer = 0;
        this.thrusting = false;
    }
    
    update(dt) {
        // Rotation
        if (keys.left) this.angle -= CONFIG.ROTATION_SPEED * dt;
        if (keys.right) this.angle += CONFIG.ROTATION_SPEED * dt;
        
        // Thrust
        this.thrusting = keys.up;
        if (this.thrusting) {
            this.vx += Math.cos(this.angle) * CONFIG.THRUST_POWER * dt;
            this.vy += Math.sin(this.angle) * CONFIG.THRUST_POWER * dt;
            
            // Spawn thrust particles
            if (Math.random() < 0.5) {
                this.spawnThrustParticle();
            }
        }
        
        // Speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > CONFIG.MAX_SPEED) {
            this.vx = (this.vx / speed) * CONFIG.MAX_SPEED;
            this.vy = (this.vy / speed) * CONFIG.MAX_SPEED;
        }
        
        // Friction
        this.vx *= CONFIG.FRICTION;
        this.vy *= CONFIG.FRICTION;
        
        // Position
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Screen wrap
        this.x = (this.x + CONFIG.WIDTH) % CONFIG.WIDTH;
        this.y = (this.y + CONFIG.HEIGHT) % CONFIG.HEIGHT;
        
        // Invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer -= dt;
            this.blinkTimer += dt;
            this.visible = Math.floor(this.blinkTimer * 10) % 2 === 0;
            
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.visible = true;
            }
        }
    }
    
    spawnThrustParticle() {
        const backAngle = this.angle + Math.PI;
        const spread = (Math.random() - 0.5) * 0.5;
        
        particles.push({
            x: this.x + Math.cos(backAngle) * CONFIG.SHIP_SIZE * 0.6,
            y: this.y + Math.sin(backAngle) * CONFIG.SHIP_SIZE * 0.6,
            vx: Math.cos(backAngle + spread) * 100 + this.vx * 0.5,
            vy: Math.sin(backAngle + spread) * 100 + this.vy * 0.5,
            life: 0.3,
            maxLife: 0.3,
            color: '#ff6600'
        });
    }
    
    draw() {
        if (!this.visible) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Ship body (triangle)
        ctx.strokeStyle = this.invulnerable ? '#888' : '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CONFIG.SHIP_SIZE, 0);
        ctx.lineTo(-CONFIG.SHIP_SIZE * 0.6, -CONFIG.SHIP_SIZE * 0.5);
        ctx.lineTo(-CONFIG.SHIP_SIZE * 0.4, 0);
        ctx.lineTo(-CONFIG.SHIP_SIZE * 0.6, CONFIG.SHIP_SIZE * 0.5);
        ctx.closePath();
        ctx.stroke();
        
        // Thrust flame
        if (this.thrusting) {
            ctx.strokeStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-CONFIG.SHIP_SIZE * 0.4, -CONFIG.SHIP_SIZE * 0.25);
            ctx.lineTo(-CONFIG.SHIP_SIZE * 0.9, 0);
            ctx.lineTo(-CONFIG.SHIP_SIZE * 0.4, CONFIG.SHIP_SIZE * 0.25);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    fire() {
        if (bullets.length >= CONFIG.MAX_BULLETS) return;
        
        const now = performance.now() / 1000;
        if (now - lastFireTime < CONFIG.FIRE_RATE) return;
        lastFireTime = now;
        
        bullets.push(new Bullet(
            this.x + Math.cos(this.angle) * CONFIG.SHIP_SIZE,
            this.y + Math.sin(this.angle) * CONFIG.SHIP_SIZE,
            this.angle
        ));
        
        AudioSystem.shoot();
    }
}

// ============================================
// BULLET CLASS
// ============================================
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * CONFIG.BULLET_SPEED;
        this.vy = Math.sin(angle) * CONFIG.BULLET_SPEED;
        this.radius = CONFIG.BULLET_RADIUS;
        this.life = CONFIG.BULLET_LIFETIME;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Screen wrap
        this.x = (this.x + CONFIG.WIDTH) % CONFIG.WIDTH;
        this.y = (this.y + CONFIG.HEIGHT) % CONFIG.HEIGHT;
        
        this.life -= dt;
        return this.life > 0;
    }
    
    draw() {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// ASTEROID CLASS
// ============================================
class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = CONFIG.ASTEROID_SIZES[size];
        
        // Random velocity
        const speed = CONFIG.ASTEROID_SPEEDS[size];
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Visual rotation
        this.rotationAngle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        
        // Generate jagged shape
        this.vertices = this.generateShape();
    }
    
    generateShape() {
        const vertices = [];
        const numVertices = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const jitter = 0.7 + Math.random() * 0.4; // 70-110% of radius
            vertices.push({
                x: Math.cos(angle) * this.radius * jitter,
                y: Math.sin(angle) * this.radius * jitter
            });
        }
        
        return vertices;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Screen wrap
        this.x = (this.x + CONFIG.WIDTH) % CONFIG.WIDTH;
        this.y = (this.y + CONFIG.HEIGHT) % CONFIG.HEIGHT;
        
        this.rotationAngle += this.rotationSpeed * dt;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
    
    split() {
        const newAsteroids = [];
        
        if (this.size === 'large') {
            newAsteroids.push(new Asteroid(this.x, this.y, 'medium'));
            newAsteroids.push(new Asteroid(this.x, this.y, 'medium'));
        } else if (this.size === 'medium') {
            newAsteroids.push(new Asteroid(this.x, this.y, 'small'));
            newAsteroids.push(new Asteroid(this.x, this.y, 'small'));
        }
        // Small asteroids just disappear
        
        return newAsteroids;
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function spawnExplosion(x, y, color = '#fff') {
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const angle = (i / CONFIG.PARTICLE_COUNT) * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: CONFIG.PARTICLE_LIFETIME,
            maxLife: CONFIG.PARTICLE_LIFETIME,
            color: color
        });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= dt;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ============================================
// COLLISION DETECTION
// ============================================
function circleCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}

// ============================================
// GAME FUNCTIONS
// ============================================
function spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
        // Spawn at edges, not near player
        let x, y;
        do {
            const side = Math.floor(Math.random() * 4);
            switch (side) {
                case 0: x = 0; y = Math.random() * CONFIG.HEIGHT; break;
                case 1: x = CONFIG.WIDTH; y = Math.random() * CONFIG.HEIGHT; break;
                case 2: x = Math.random() * CONFIG.WIDTH; y = 0; break;
                case 3: x = Math.random() * CONFIG.WIDTH; y = CONFIG.HEIGHT; break;
            }
        } while (ship && Math.sqrt(Math.pow(x - ship.x, 2) + Math.pow(y - ship.y, 2)) < 150);
        
        asteroids.push(new Asteroid(x, y, 'large'));
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    lives = CONFIG.STARTING_LIVES;
    wave = 1;
    nextExtraLife = CONFIG.EXTRA_LIFE_SCORE;
    
    ship = new Ship();
    bullets = [];
    asteroids = [];
    particles = [];
    
    spawnAsteroids(CONFIG.STARTING_ASTEROIDS);
    
    overlay.classList.add('hidden');
    updateUI();
    
    AudioSystem.resume();
}

function playerDeath() {
    lives--;
    AudioSystem.playerDeath();
    spawnExplosion(ship.x, ship.y, '#ff4444');
    
    if (lives <= 0) {
        gameOver();
    } else {
        ship.reset();
        updateUI();
    }
}

function gameOver() {
    gameState = 'gameover';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('asteroidsHighScore', highScore);
    }
    
    overlay.innerHTML = `
        <h1>GAME OVER</h1>
        <p class="highlight">Score: ${score}</p>
        <p>Wave: ${wave}</p>
        <p>High Score: ${highScore}</p>
        <p class="blink">Press ENTER to Restart</p>
    `;
    overlay.classList.remove('hidden');
}

function nextWave() {
    wave++;
    AudioSystem.newWave();
    
    // Give player brief moment before spawning
    setTimeout(() => {
        spawnAsteroids(CONFIG.STARTING_ASTEROIDS + (wave - 1) * CONFIG.ASTEROIDS_PER_WAVE);
    }, 1000);
}

function addScore(points) {
    score += points;
    
    // Extra life
    if (score >= nextExtraLife) {
        lives++;
        nextExtraLife += CONFIG.EXTRA_LIFE_SCORE;
        AudioSystem.extraLife();
    }
    
    updateUI();
}

function updateUI() {
    scoreDisplay.textContent = `SCORE: ${score}`;
    livesDisplay.textContent = 'LIVES: ' + '♦'.repeat(Math.max(0, lives));
    highScoreDisplay.textContent = `HIGH: ${highScore}`;
}

// ============================================
// MAIN GAME LOOP
// ============================================
function update(dt) {
    if (gameState !== 'playing') return;
    
    // Ship
    ship.update(dt);
    
    // Shooting
    if (keys.space) {
        ship.fire();
    }
    
    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].update(dt)) {
            bullets.splice(i, 1);
        }
    }
    
    // Asteroids
    for (const asteroid of asteroids) {
        asteroid.update(dt);
    }
    
    // Particles
    updateParticles(dt);
    
    // Collision: bullets vs asteroids
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (circleCollision(bullets[i], asteroids[j])) {
                // Destroy bullet
                bullets.splice(i, 1);
                
                // Split or destroy asteroid
                const asteroid = asteroids[j];
                const newAsteroids = asteroid.split();
                asteroids.splice(j, 1);
                asteroids.push(...newAsteroids);
                
                // Effects
                spawnExplosion(asteroid.x, asteroid.y);
                AudioSystem.explosion(asteroid.size);
                addScore(CONFIG.ASTEROID_POINTS[asteroid.size]);
                
                break;
            }
        }
    }
    
    // Collision: ship vs asteroids
    if (!ship.invulnerable) {
        for (const asteroid of asteroids) {
            if (circleCollision(ship, asteroid)) {
                playerDeath();
                break;
            }
        }
    }
    
    // Check for wave clear
    if (asteroids.length === 0) {
        nextWave();
    }
}

function render() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    // Draw asteroids
    for (const asteroid of asteroids) {
        asteroid.draw();
    }
    
    // Draw bullets
    for (const bullet of bullets) {
        bullet.draw();
    }
    
    // Draw particles
    drawParticles();
    
    // Draw ship
    if (ship && gameState === 'playing') {
        ship.draw();
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    // Fixed timestep for physics
    accumulator += dt;
    while (accumulator >= FIXED_DT) {
        update(FIXED_DT);
        accumulator -= FIXED_DT;
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// ============================================
// INPUT HANDLING
// ============================================
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            break;
        case 'ArrowUp':
        case 'KeyW':
            keys.up = true;
            if (ship && !ship.thrusting) {
                AudioSystem.thrustStart();
            }
            break;
        case 'Space':
            keys.space = true;
            e.preventDefault();
            break;
        case 'Enter':
            if (gameState !== 'playing') {
                startGame();
            }
            break;
        case 'KeyM':
            AudioSystem.toggle();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;
        case 'ArrowUp':
        case 'KeyW':
            keys.up = false;
            AudioSystem.thrustStop();
            break;
        case 'Space':
            keys.space = false;
            break;
    }
});

// ============================================
// INITIALIZATION
// ============================================
AudioSystem.init();
updateUI();
highScoreDisplay.textContent = `HIGH: ${highScore}`;
requestAnimationFrame(gameLoop);
