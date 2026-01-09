# 006-Asteroids Planning Document

**Generated:** January 8, 2026  
**Task Type:** New game from scratch  
**Scope:** Playable demo (core loop complete)  
**Platform:** Web - Canvas 2D

---

## 🎯 Core Mechanics to Learn

| Mechanic | What It Teaches | Why Important |
|----------|-----------------|---------------|
| **Rotation** | Ship turns with left/right keys | Foundation for many genres |
| **Thrust/Momentum** | Physics-based movement with inertia | Core game feel concept |
| **Screen Wrapping** | Objects wrap around edges | Classic arcade technique |
| **Shooting** | Projectiles spawn from ship angle | Shooter foundation |
| **Collision** | Circle-based collision detection | Essential for all games |
| **Object Spawning** | Asteroids split on destruction | Dynamic game objects |

---

## 📋 Implementation Phases

### Phase 1: Ship & Movement (Greybox)
- [ ] Canvas setup (800x600, black background)
- [ ] Ship as triangle (white outline)
- [ ] Rotation with left/right arrow keys
- [ ] Thrust with up arrow (accelerate in facing direction)
- [ ] Momentum/friction (ship drifts, slowly decelerates)
- [ ] Screen wrapping (exit right → enter left)

**Test:** Ship feels good to control, momentum is noticeable

### Phase 2: Shooting
- [ ] Bullets spawn from ship nose on spacebar
- [ ] Bullets travel in direction ship was facing
- [ ] Bullets have max lifetime (disappear after ~2 seconds)
- [ ] Rate limiting (can't spam infinitely)
- [ ] Screen wrapping for bullets

**Test:** Shooting feels responsive, bullets go where expected

### Phase 3: Asteroids
- [ ] Asteroid class (position, velocity, size, rotation)
- [ ] Three sizes: large, medium, small
- [ ] Random spawn at screen edges (not too close to player)
- [ ] Asteroids drift with random velocities
- [ ] Asteroids rotate slowly (visual only)
- [ ] Screen wrapping for asteroids

**Test:** Asteroids populate screen, move convincingly

### Phase 4: Collision & Splitting
- [ ] Bullet-asteroid collision (circle-circle)
- [ ] Large asteroid → 2 medium asteroids
- [ ] Medium asteroid → 2 small asteroids
- [ ] Small asteroid → destroyed (score)
- [ ] Ship-asteroid collision (player death)
- [ ] Brief invulnerability on respawn

**Test:** Collisions feel fair, splitting works correctly

### Phase 5: Game Loop
- [ ] Score system (large=20, medium=50, small=100)
- [ ] Lives system (start with 3)
- [ ] Wave system (clear all asteroids → next wave with more)
- [ ] Game over state
- [ ] Restart functionality

**Test:** Complete game loop works

### Phase 6: Polish & Audio
- [ ] Ship thrust particles
- [ ] Explosion particles on asteroid destruction
- [ ] Sound effects (thrust, shoot, explosion, death)
- [ ] Score display
- [ ] Lives display
- [ ] High score (localStorage)

**Test:** Game feels complete and juicy

---

## 🔧 Technical Decisions

### Physics Model
```javascript
// Fixed timestep for consistent physics
const FIXED_DT = 1/60;
let accumulator = 0;

function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    accumulator += dt;
    
    while (accumulator >= FIXED_DT) {
        update(FIXED_DT);
        accumulator -= FIXED_DT;
    }
    
    render();
    requestAnimationFrame(gameLoop);
}
```

### Ship Movement
```javascript
// Rotation
ship.angle += ship.rotationSpeed * dt;

// Thrust (in facing direction)
if (thrusting) {
    ship.vx += Math.cos(ship.angle) * THRUST_POWER * dt;
    ship.vy += Math.sin(ship.angle) * THRUST_POWER * dt;
}

// Friction (momentum decay)
ship.vx *= FRICTION;
ship.vy *= FRICTION;

// Position update
ship.x += ship.vx * dt;
ship.y += ship.vy * dt;

// Screen wrap
ship.x = (ship.x + canvas.width) % canvas.width;
ship.y = (ship.y + canvas.height) % canvas.height;
```

### Circle Collision
```javascript
function circleCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}
```

---

## 🎨 Visual Style

**Classic Arcade:**
- Black background
- White vector-style outlines (no fill)
- Minimal, clean aesthetic
- Particle effects for explosions

**Ship:** Triangle pointing right (angle 0)
**Asteroids:** Irregular polygons (jagged circles)
**Bullets:** Small circles or short lines

---

## 📊 Constants Reference

```javascript
const CONFIG = {
    // Canvas
    WIDTH: 800,
    HEIGHT: 600,
    
    // Ship
    SHIP_SIZE: 20,
    ROTATION_SPEED: 5,      // radians per second
    THRUST_POWER: 200,      // pixels per second²
    FRICTION: 0.99,         // per frame
    MAX_SPEED: 400,
    
    // Bullets
    BULLET_SPEED: 500,
    BULLET_LIFETIME: 2,     // seconds
    FIRE_RATE: 0.15,        // seconds between shots
    
    // Asteroids
    ASTEROID_SPEEDS: {
        large: 50,
        medium: 80,
        small: 120
    },
    ASTEROID_SIZES: {
        large: 40,
        medium: 20,
        small: 10
    },
    ASTEROID_POINTS: {
        large: 20,
        medium: 50,
        small: 100
    },
    STARTING_ASTEROIDS: 4,
    
    // Game
    STARTING_LIVES: 3,
    RESPAWN_TIME: 2,        // seconds of invulnerability
};
```

---

## ✅ Definition of Done

- [ ] Ship rotates smoothly with left/right
- [ ] Ship thrusts in facing direction with up
- [ ] Ship momentum feels natural (drifts, slows)
- [ ] Screen wrapping works for ship, bullets, asteroids
- [ ] Bullets fire from ship nose at correct angle
- [ ] Asteroids spawn and move randomly
- [ ] Asteroids split correctly (large→medium→small→gone)
- [ ] Collision detection works reliably
- [ ] Score increments correctly
- [ ] Lives decrement on death
- [ ] Wave progression works
- [ ] Game over and restart work
- [ ] Maintains 60fps

---

## 📁 File Structure

```
006-asteroids/
├── index.html
├── game.js
├── audio.js
├── style.css
├── PLANNING.md
└── README.md
```

---

**Ready to implement!**
