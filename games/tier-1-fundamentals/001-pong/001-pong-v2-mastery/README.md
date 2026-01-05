# 🎮 Pong V2 - Mastery Edition

> A complete rebuild demonstrating advanced Web Audio and Canvas 2D techniques

## Overview

This is the "Mastery Edition" of Pong, rebuilt from scratch to showcase comprehensive knowledge of:
- **Web Audio API** - Procedural synthesis, spatial audio, ADSR envelopes
- **Canvas 2D API** - Advanced compositing, gradients, particle systems
- **Game Juice** - Screen shake, trails, particles, easing animations

## V1 vs V2 Comparison

| Feature | V1 (Original) | V2 (Mastery) |
|---------|---------------|--------------|
| **Audio Engine** | Basic oscillator beeps | Full synthesis with reverb, compression, stereo panning |
| **Sound Design** | Simple sine waves | Multiple waveforms, ADSR envelopes, pitch modulation |
| **Visual Style** | Flat rectangles | Gradient rendering, 3D appearance, glow effects |
| **Particles** | None | Full particle system with directional emission |
| **Screen Shake** | None | Dynamic shake on impacts |
| **Ball Trail** | None | Glowing trail following movement |
| **Score Animation** | Static numbers | Animated scale + floating "+1" text |
| **Easing Functions** | None | Full easing library (elastic, bounce, back, etc.) |
| **Background** | Solid color | Gradient with subtle grid |
| **Polish** | Basic | Game juice throughout |

## Technical Features

### Advanced Audio (audio.js)
- **ConvolverNode** - Room reverb simulation
- **DynamicsCompressorNode** - Prevents clipping, adds punch
- **StereoPannerNode** - Positional audio based on ball location
- **ADSR Envelopes** - Attack/Decay/Sustain/Release for natural sounds
- **Multiple Waveforms** - Sine, triangle, square, sawtooth
- **Procedural Synthesis** - All sounds generated in real-time
- **Noise Generation** - White noise for impact sounds
- **Filter Sweeps** - Frequency modulation effects
- **Victory/Defeat Music** - Chord progressions and arpeggios

### Advanced Visuals (game.js)
- **Particle System** - Directional and omni-directional emission
- **Screen Shake** - Intensity-based with decay
- **Ball Trail** - Alpha-faded position history
- **Gradient Rendering** - Linear and radial for 3D appearance
- **Glow Effects** - Shadow blur for neon aesthetic
- **globalCompositeOperation** - Additive blending for particles
- **Score Animations** - Scale bounce + float effects
- **Easing Functions** - Quad, cubic, elastic, bounce, back

### Game Juice Techniques
- Paddle flash on hit
- Score scale pulse on point
- Canvas CSS glow on scoring
- Rally counter for long volleys
- Smoother AI with prediction
- Gradual ball speed increase

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move paddle up |
| S / ↓ | Move paddle down |
| Space | Start / Restart game |
| P | Pause / Resume |
| M | Toggle mute |

## Running the Game

```bash
# From this directory
python3 -m http.server 8000

# Or using the shared server script
./server.sh
```

Then open: http://localhost:8000

## Audio Design Notes

Each sound is procedurally generated with specific characteristics:

1. **Paddle Hit** - Sine wave with pitch variation based on hit position
2. **Wall Bounce** - Short triangle wave burst
3. **Player Score** - Ascending arpeggio (C5-E5-G5)
4. **AI Score** - Descending minor arpeggio
5. **Victory** - Full chord progression with reverb
6. **Defeat** - Chromatic descent with filtering
7. **Game Start** - Quick ascending sweep

## Code Architecture

```
001-pong-v2-mastery/
├── index.html      # Canvas and script loading
├── style.css       # CSS animations and glow effects
├── audio.js        # MasterAudioSystem class
├── game.js         # Game engine with visual effects
└── README.md       # This file
```

## Lessons Applied

This implementation applies learnings from:
- MDN Web Audio API documentation
- teropa.info JavaScript Systems Music guide
- easings.net easing function library
- GDC "Juice It or Lose It" principles
- Game audio design best practices

## What Makes This "Mastered"

1. **No reliance on pre-recorded audio** - All sounds synthesized
2. **Spatial awareness** - Audio pans based on game events
3. **Visual feedback everywhere** - Every action has visible response
4. **Professional polish** - Smooth animations, responsive feel
5. **Code organization** - Clean separation of concerns
6. **Performance conscious** - Object pooling, efficient rendering

---

*Part of the Game Development Learning Journey - Tier 1 Mastery Editions*
