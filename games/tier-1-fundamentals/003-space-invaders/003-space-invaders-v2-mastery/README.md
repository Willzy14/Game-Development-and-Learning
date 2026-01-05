# 🎮 Space Invaders V2 - Mastery Edition

> A complete rebuild featuring spatial audio, dynamic music, and rich visual feedback

## Overview

This is the "Mastery Edition" of Space Invaders with:
- **Spatial audio** - Enemy explosions pan based on screen position
- **Adaptive music** - Background intensity increases as enemies reduce
- **Pixel-based shields** - Realistic damage with particle effects
- **Enhanced visuals** - Animated starfield, glowing bullets, particle explosions

## V1 vs V2 Comparison

| Feature | V1 (Original) | V2 (Mastery) |
|---------|---------------|--------------|
| **Audio Positioning** | Mono | Stereo panning based on position |
| **Enemy Explosions** | Basic particles | Multi-shape particle explosions |
| **Shields** | Rectangle damage | Pixel-based destructible |
| **Background** | Static color | Animated parallax starfield |
| **Bullet Trails** | None | Glowing motion trails |
| **Enemy Animation** | Static | Intro animation + wobble |
| **Player Ship** | Basic triangle | Gradient with animated thrusters |
| **High Score** | Session only | Persistent (localStorage) |
| **Music** | None | Adaptive background drone |
| **Laser Sounds** | Basic beep | Synth with filter sweep |

## Technical Features

### Advanced Audio (audio.js)
- **Spatial Panning** - StereoPannerNode positions sounds left/right
- **Synth Lasers** - Sawtooth oscillator with bandpass filter sweep
- **Explosion Synthesis** - Noise + filtered tone based on enemy type
- **Shield Crackle** - Random noise pattern for electric effect
- **Adaptive Music** - Low drone that intensifies with gameplay
- **ConvolverNode** - Reverb for explosion depth

### Visual System (game.js)
- **Starfield** - Multi-layer parallax with twinkling
- **Pixel Shields** - Individual destructible pixels with circular damage
- **Bullet Trails** - Alpha-faded position history with glow
- **Enemy Animation** - Scale intro + floating wobble
- **Thruster Animation** - Pulsing player ship engines
- **Particle Shapes** - Circles, squares, and spark lines
- **globalCompositeOperation** - Additive blending for explosions

### Game Systems
- **Wave Progression** - Enemies speed up each wave
- **Dynamic Difficulty** - Speed increases as enemies are destroyed
- **Invincibility Frames** - Flashing player after hit
- **High Score Persistence** - localStorage saves best score

## Controls

| Key | Action |
|-----|--------|
| A / ← | Move left |
| D / → | Move right |
| Space | Fire / Start / Restart |
| P | Pause / Resume |
| M | Toggle mute |

## Scoring

| Enemy Row | Points |
|-----------|--------|
| Top (Pink) | 40 |
| Second (Magenta) | 30 |
| Third (Orange) | 20 |
| Bottom (Yellow) | 10 |

## Running the Game

```bash
cd games/tier-1-fundamentals/003-space-invaders-v2-mastery
python3 -m http.server 8003
```

Open: http://localhost:8003

## Audio Design Notes

### Laser Sound Design
```
Player: Sawtooth 880Hz → 220Hz sweep, bandpass filtered
Enemy:  Square 300Hz → 100Hz sweep, lowpass filtered
```

### Explosion Design
```
Noise burst with exponential decay
+ Bandpass filter sweep (high → low)
+ Sine tone pitch-shifted by enemy type
+ Stereo positioned to match screen location
```

### Shield Sound
```
Intermittent noise (50% random on/off)
+ Highpass filter for crackle character
```

## Visual Design Notes

### Pixel Shields
Shields are composed of 4x4 pixel blocks arranged in an arch shape. When hit, a circular area of pixels is destroyed, creating realistic damage patterns similar to the original arcade game.

### Starfield Layers
- Different star speeds create parallax depth
- Multiple colors (white, blue, orange, green)
- Sine-based twinkling with offset phases

### Enemy Animation
- Scale from 0 to 1 on spawn (staggered by position)
- Subtle vertical wobble while alive
- Radial gradient for 3D sphere appearance

## Code Architecture

```
003-space-invaders-v2-mastery/
├── index.html      # Canvas with lives display
├── style.css       # Space theme with CRT effect
├── audio.js        # Spatial synthesis engine
├── game.js         # Game engine with all systems
└── README.md       # This file
```

## Lessons Applied

- Web Audio API spatial positioning (StereoPannerNode)
- Procedural noise synthesis for explosions
- Canvas 2D particle system optimization
- Game juice principles from GDC talks
- Adaptive music that responds to gameplay
- localStorage for score persistence

---

*Part of the Game Development Learning Journey - Tier 1 Mastery Editions*
