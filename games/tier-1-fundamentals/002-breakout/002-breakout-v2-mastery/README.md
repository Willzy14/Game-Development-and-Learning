# 🎮 Breakout V2 - Mastery Edition

> A complete rebuild demonstrating advanced Web Audio and Canvas 2D techniques with combo system

## Overview

This is the "Mastery Edition" of Breakout, featuring:
- **Musical brick sounds** - Each row plays a different note in a pentatonic scale
- **Combo system** - Chain brick breaks for multiplied scores
- **Particle explosions** - Rich visual feedback on every brick break
- **Dynamic audio** - Stereo positioning, reverb, intensity scaling with combos

## V1 vs V2 Comparison

| Feature | V1 (Original) | V2 (Mastery) |
|---------|---------------|--------------|
| **Brick Sounds** | Single beep | Musical scale notes per row |
| **Combo System** | None | Full combo with multipliers |
| **Particles** | None | Explosion particles per brick |
| **Screen Shake** | None | Dynamic shake based on combo |
| **Ball Trail** | None | Glowing motion trail |
| **Brick Animation** | Instant disappear | Animated intro + destruction |
| **Score Display** | Static | Animated with pulse effect |
| **Floating Text** | None | Points and combo multiplier |
| **Audio Engine** | Basic oscillator | Full synthesis with reverb |
| **Paddle Feel** | Linear movement | Smooth easing |

## Unique Features

### Musical Brick Scale
Each brick row corresponds to a note in the C major pentatonic scale:
- Row 0 (top): C5 (523.25 Hz) - Pink
- Row 1: D5 (587.33 Hz) - Orange
- Row 2: E5 (659.25 Hz) - Yellow
- Row 3: G5 (783.99 Hz) - Green
- Row 4: A5 (880.00 Hz) - Cyan
- Row 5: C6 (1046.50 Hz) - Purple

This creates harmonious sounds as you destroy bricks!

### Combo System
- Break bricks without hitting paddle to build combo
- Points multiplied by combo (up to 10x)
- Combo resets when ball hits paddle or after 1 second
- Special audio and visual effects at 3+ combo
- Max combo displayed on game over

### Visual Polish
- Brick intro animation (staggered appearance)
- Hit flash on paddle and brick contact
- Canvas glow effects for scoring events
- Particle shapes: circles, squares, sparks
- Gradient rendering for 3D appearance

## Technical Features

### Audio System (audio.js)
- **Pentatonic Scale** - Musically pleasing brick sounds
- **Stereo Panning** - Bricks pan left/right based on column
- **Combo Arpeggios** - Ascending chords at high combos
- **ConvolverNode Reverb** - Room ambiance
- **DynamicsCompressor** - Prevents clipping
- **Impact Click Layer** - Noise burst for satisfying hits

### Visual System (game.js)
- **Particle Types** - Circle, square, spark shapes
- **Floating Text** - Score popups with easing
- **Screen Shake** - Intensity scales with combo
- **Trail Rendering** - Alpha-faded ball history
- **Gradient 3D Effect** - Bricks and paddle pop
- **globalCompositeOperation** - Additive particle blending

## Controls

| Key | Action |
|-----|--------|
| A / ← | Move paddle left |
| D / → | Move paddle right |
| Space | Start / Restart |
| P | Pause / Resume |
| M | Toggle mute |

## Scoring

| Event | Base Points | With Combo |
|-------|-------------|------------|
| Bottom row brick | 60 | 60 × combo |
| Top row brick | 10 | 10 × combo |
| Max combo multiplier | - | 10x |

## Running the Game

```bash
cd games/tier-1-fundamentals/002-breakout-v2-mastery
python3 -m http.server 8002
```

Then open: http://localhost:8002

## Code Architecture

```
002-breakout-v2-mastery/
├── index.html      # Canvas with combo display
├── style.css       # Neon theme, combo glow effects
├── audio.js        # Musical synthesis engine
├── game.js         # Game engine with combo system
└── README.md       # This file
```

## Design Decisions

### Why Musical Bricks?
Breaking bricks becomes satisfying when each hit produces a pleasant sound. The pentatonic scale ensures any combination sounds good together - perfect for unpredictable game play.

### Why Combo System?
Adds skill depth beyond just breaking bricks. Players can strategize to maximize combos for higher scores, adding replayability.

### Why So Many Particles?
Following "Juice It or Lose It" principles - every action should have visible feedback. Particles make brick breaking feel impactful and rewarding.

## Lessons Applied

- Web Audio API procedural synthesis
- Musical scale frequencies for game audio
- Canvas 2D advanced rendering
- Game juice principles (GDC talks)
- Easing functions for smooth animation
- Particle system design patterns

---

*Part of the Game Development Learning Journey - Tier 1 Mastery Editions*
