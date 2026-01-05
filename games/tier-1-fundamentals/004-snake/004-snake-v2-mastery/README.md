# Snake V2 Mastery Edition 🐍

The ultimate showcase of advanced Web Audio API and Canvas 2D techniques. This version retains ALL features from V1 while adding enhanced audio synthesis and visual polish.

## 🎮 Play

Open `index.html` in a modern web browser or start a local server:
```bash
python3 -m http.server 8080
```

### Controls
- **Arrow Keys**: Change direction
- **Space**: Start / Restart game  
- **P**: Pause / Resume
- **M**: Mute (via settings)

## ✨ V2 Audio Enhancements

### DynamicsCompressorNode
Master bus compressor ensures consistent audio levels:
```javascript
this.compressor = ctx.createDynamicsCompressor();
this.compressor.threshold.value = -24;
this.compressor.ratio.value = 12;
```
- Prevents clipping during intense gameplay
- Maintains loudness consistency across effects

### LFO Bass Wobble
The background music's bass drone now has organic modulation:
```javascript
const bassLFO = ctx.createOscillator();
bassLFO.type = 'sine';
bassLFO.frequency.value = 0.12; // Slow wobble
lfoGain.gain.value = 6; // Modulation depth in Hz
bassLFO.connect(lfoGain);
lfoGain.connect(bassOsc.frequency);
```
- Creates organic "breathing" bass
- Intensity increases with snake length

### Pentatonic Scale Eating Sounds
Food collection plays ascending pentatonic notes:
```javascript
const pentatonic = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
const freq = pentatonic[Math.min(comboCount, pentatonic.length - 1)];
```
- Always sounds harmonious (no dissonance)
- Notes rise with combo count - creates musical feedback

### Stereo Panning
Spatial audio based on food/action position:
```javascript
const panner = ctx.createStereoPanner();
panner.pan.value = (xPosition / width) * 2 - 1;
```
- Food on left plays in left speaker
- Creates spatial awareness of game events

### Filter Sweeps
Death sound uses BiquadFilterNode for sci-fi effect:
```javascript
const filter = ctx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.setValueAtTime(2000, now);
filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
```

### Adaptive Music Intensity
Music responds to gameplay tension:
- Bass LFO speeds up as snake grows longer
- Pad volume increases with intensity
- Creates dynamic soundtrack

## 🎨 Visual Features (Retained from V1)

### Advanced Space Background
- Starfield with parallax layers
- Animated nebulae with pulse effects
- Spiral galaxies using logarithmic formula
- Cosmic dust particles

### Planetary System
- 3D-shaded planets with atmosphere glow
- Saturn-style rings with multiple bands
- Crater rendering with bowl effect
- Day/night terminator lines

### Snake Rendering
- 7-layer eye system with highlights
- Dragon scale patterns on body
- Color gradient from head to tail
- Direction-aware eye positioning

### Crystal Food
- Chromatic aberration (RGB offset)
- Rotating hexagonal gem shape
- 9-layer rendering for depth
- Animated sparkle highlights

### Power-Up Icons
- Custom-drawn Path2D icons (no emoji!)
- Lightning bolt for Speed
- Shield for Invincible  
- 2× coin for Double Points
- Ghost shape for Ghost Mode

## 🎯 Game Features (All Retained)

### Power-Up System
| Type | Duration | Effect |
|------|----------|--------|
| ⚡ Speed | 8s | 80% faster movement |
| ★ Invincible | 6s | Can pass through self |
| 2× Double | 10s | 2× point multiplier |
| 👻 Ghost | 5s | Semi-transparent, no collision |

### Combo System
- Combo builds when eating food quickly (< 3 seconds)
- Multipliers: ×1 → ×2 → ×3 → ×5 → ×8
- Higher combos = higher pentatonic notes

### Milestone Achievements
- 10 segments: "MASSIVE!"
- 20 segments: "UNSTOPPABLE!"
- 30 segments: "LEGENDARY!"
- Each triggers particle explosion and fanfare

### High Score System
- Top 5 leaderboard with localStorage
- Tracks: Score, Length, Best Combo
- Name entry on new high score
- Statistics tracking across sessions

### Settings System
- Master volume control
- Music volume control  
- FPS counter toggle
- Touch controls toggle
- High score reset

### Additional Features
- Pause system (P key)
- Fullscreen support
- Mobile touch controls (D-pad)
- Screen shake on events
- Particle system for impacts

## 📁 File Structure

```
004-snake-v2-mastery/
├── index.html    - Game structure with all UI elements
├── style.css     - Enhanced styling with V2 badge
├── audio.js      - V2 enhanced audio with new techniques
├── game.js       - Complete game with all V1 features
└── README.md     - This documentation
```

## 🔊 Audio Architecture

```
playEatSound()
    │
    ├─ OscillatorNode (sine) ─┐
    │                         │
    ├─ OscillatorNode (tri) ──┼─ GainNode ─ StereoPannerNode ─ masterGain
    │                         │
    └─ Pentatonic frequency ──┘
                                              │
                                    DynamicsCompressorNode
                                              │
                                      AudioDestination

Background Music:
    ├─ Bass Layer (with LFO modulation)
    ├─ Pad Layer (chord progressions)
    ├─ Melody Layer (pentatonic notes)
    └─ Texture Layer (shimmer with stereo panning)
```

## 🆚 V1 vs V2 Comparison

| Feature | V1 | V2 |
|---------|----|----|
| Eat Sound | Dual tone beep | Pentatonic scale with stereo |
| Death Sound | Descending saw | Filter sweep + noise |
| Bass Music | Simple oscillator | LFO wobble modulation |
| Audio Levels | Direct output | Compressed master bus |
| Spatial Audio | Mono | Stereo panning |
| Music Intensity | Static | Adaptive to snake length |

## 🎓 Techniques Demonstrated

### Audio
- ✅ DynamicsCompressorNode
- ✅ LFO modulation (frequency wobble)
- ✅ StereoPannerNode (spatial audio)
- ✅ BiquadFilterNode (filter sweeps)
- ✅ Pentatonic scale integration
- ✅ Adaptive music intensity
- ✅ Convolver-ready reverb buffer

### Visual (All V1 techniques)
- ✅ Logarithmic spiral galaxies
- ✅ Multi-layer particle system
- ✅ Chromatic aberration effect
- ✅ 3D sphere shading with gradients
- ✅ Path2D for complex shapes
- ✅ Screen shake system
- ✅ Parallax scrolling

---

*Snake V2 Mastery Edition - The showcase game demonstrating the full potential of browser-based game audio and visuals.*
