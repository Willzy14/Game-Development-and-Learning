# 006 - Asteroids

A classic arcade game implementing core mechanics: rotation, momentum, screen wrapping, and shooting.

## Play

Open `index.html` in a browser.

## Controls

| Key | Action |
|-----|--------|
| ← / A | Rotate left |
| → / D | Rotate right |
| ↑ / W | Thrust |
| Space | Shoot |
| Enter | Start / Restart |
| M | Toggle sound |

## Mechanics Learned

1. **Rotation** - Ship turns with angle-based controls
2. **Thrust/Momentum** - Physics-based movement with inertia
3. **Screen Wrapping** - Objects wrap at screen edges
4. **Shooting** - Bullets fire in facing direction
5. **Collision** - Circle-circle collision detection
6. **Object Splitting** - Asteroids break into smaller pieces

## Technical Features

- Fixed timestep game loop (consistent physics)
- Particle system for visual effects
- Procedural audio (Web Audio API)
- Score + high score persistence
- Wave progression system
- Invulnerability on respawn

## Scoring

- Large asteroid: 20 points
- Medium asteroid: 50 points
- Small asteroid: 100 points
- Extra life every 10,000 points

## Files

- `index.html` - Game page
- `game.js` - Main game logic (~400 lines)
- `audio.js` - Procedural audio system
- `PLANNING.md` - Development plan
