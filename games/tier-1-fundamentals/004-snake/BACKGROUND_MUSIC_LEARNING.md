# Background Music System - Procedural Audio Learning

## Overview
Created an ambient space atmosphere music system using **Web Audio API** with **procedural generation** techniques.

## System Architecture

### 4-Layer Music System

#### Layer 1: Deep Bass Drone
**Purpose:** Rumbling space atmosphere, felt more than heard  
**Technique:** Low-frequency sine wave (40-60 Hz) with slow modulation

```javascript
// Bass oscillator at very low frequency
bassOsc.type = 'sine';
bassOsc.frequency.setValueAtTime(45, ctx.currentTime); // Very low A

// Slowly drift between frequencies for movement
const targetFreq = 40 + Math.random() * 15;
bass.frequency.linearRampToValueAtTime(targetFreq, currentTime + 8);
```

**Key Learning:**
- Frequencies below 80 Hz create atmospheric rumble
- Slow frequency modulation (8+ seconds) creates organic movement
- Low volumes prevent overpowering other audio

---

#### Layer 2: Ambient Pad (Chord Progression)
**Purpose:** Harmonic foundation with evolving chords  
**Technique:** Multiple sine oscillators creating ethereal chord progression

```javascript
const chordProgressions = [
    [220, 330, 440],      // A2, E3, A3 - open fifth + octave
    [196, 293.66, 392],   // G2, D3, G3
    [246.94, 369.99, 493.88], // B2, F#3, B3
    [261.63, 392, 523.25]     // C3, G3, C4
];

// Create chord from multiple oscillators
frequencies.forEach(freq => {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; // Pure sine for ethereal quality
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(padGain);
    osc.start(ctx.currentTime);
});
```

**Chord Transition:**
```javascript
// Crossfade between chords
padGain.gain.linearRampToValueAtTime(0, currentTime + 1); // Fade out
// ...wait...
playChord(newFrequencies);
padGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1); // Fade in
```

**Key Learning:**
- Open fifths (no third) = ambiguous, spacey sound
- Pure sine waves = ethereal, glass-like quality
- 12-second chord changes = slow, contemplative
- Crossfading prevents abrupt transitions

---

#### Layer 3: Melodic Elements
**Purpose:** Occasional musical notes for interest  
**Technique:** Pentatonic scale with random note selection

```javascript
// Pentatonic scale in A minor (no dissonance)
const pentatonicScale = [
    440,    // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99  // G5
];

// Play occasional note (60% probability)
if (Math.random() > 0.4) {
    const note = pentatonicScale[Math.floor(Math.random() * scale.length)];
    playMelodyNote(note, destination);
}
```

**Note Envelope:**
```javascript
osc.type = 'triangle'; // Softer than sine, more character

gain.gain.setValueAtTime(0, ctx.currentTime);
gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3); // Attack
gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);      // Long decay
```

**Key Learning:**
- Pentatonic scale = always harmonious, no "wrong" notes
- Triangle wave = softer character than square, warmer than sine
- Long decay (2 seconds) = lingering, ambient quality
- Random timing + probability = organic, non-repetitive

---

#### Layer 4: Texture (Shimmer)
**Purpose:** High-frequency sparkle and atmosphere  
**Technique:** Random high-frequency tones with frequency sweep

```javascript
const freq = 2000 + Math.random() * 2000; // 2-4 kHz

osc.type = 'sine';
osc.frequency.setValueAtTime(freq, ctx.currentTime);
osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.5);

gain.gain.setValueAtTime(0, ctx.currentTime);
gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05); // Quick attack
gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);     // Decay
```

**Key Learning:**
- High frequencies (2-4 kHz) = sparkle/shimmer effect
- Exponential frequency ramp = natural pitch rise (like bell)
- Very low volume (0.03) = subtle texture
- 30% probability = sporadic, not constant

---

## Music Theory Concepts Applied

### Intervals Used
- **Perfect Fifth** (1.5x frequency ratio) - stable, open sound
- **Octave** (2x frequency ratio) - reinforcement without dissonance
- **Pentatonic Scale** - 5-note scale with no half steps (always consonant)

### Chord Structure
- **No thirds** - avoids major/minor tonality (more ambiguous/spacey)
- **Root + Fifth + Octave** - medieval/mystical quality
- **Slow progression** - allows each chord to breathe

### Why It Works for Space Theme
1. **Low bass** = vast, empty space
2. **Open intervals** = otherworldly, not earthly
3. **Sparse melody** = isolation, distance
4. **High shimmer** = stars, cosmic particles
5. **Slow changes** = timeless, floating

---

## Technical Implementation Details

### Gain Hierarchy
```
MasterMusicGain (0.15x masterVolume)
    ├─ BassGain (0.3)
    ├─ PadGain (0.15)
    ├─ MelodyGain (0.08)
    └─ TextureGain (0.03)
```

**Key Learning:** Background music should be **15% of master volume** to stay behind sound effects

### Timing Strategy
```
Bass modulation:    Every 8 seconds
Chord changes:      Every 12 seconds
Melody checks:      Every 4 seconds (60% play)
Texture checks:     Every 3 seconds (30% play)
```

**Key Learning:** Different layers on different timescales = organic, evolving feel

### Oscillator Management
```javascript
// Store references for cleanup
this.backgroundMusic = {
    playing: false,
    padOscillators: [],
    bassOscillator: null,
    melodyInterval: null,
    textureInterval: null
};

// Stop all on game over
stopBackgroundMusic() {
    // Stop oscillators
    bassOscillator.stop();
    padOscillators.forEach(osc => osc.stop());
    
    // Clear intervals
    clearInterval(melodyInterval);
    clearInterval(textureInterval);
}
```

**Key Learning:** Always store oscillator/interval references for proper cleanup

---

## Procedural Generation Techniques

### 1. Random Walk in Frequency Space
```javascript
// Bass slowly wanders
const targetFreq = 40 + Math.random() * 15;
bass.frequency.linearRampToValueAtTime(targetFreq, currentTime + 8);
```

### 2. Probabilistic Event Triggering
```javascript
// 60% chance to play melody note
if (Math.random() > 0.4) {
    playMelodyNote(...);
}

// 30% chance for shimmer
if (Math.random() > 0.7) {
    playShimmer(...);
}
```

### 3. Cyclic Progression with Variation
```javascript
// Loop through chord progression
currentChordIndex = (currentChordIndex + 1) % progressions.length;
```

### 4. Envelope Shaping
```javascript
// ADSR (Attack, Decay, Sustain, Release) concept
gain.setValueAtTime(0, t);              // Start silent
gain.linearRampToValueAtTime(max, t + attack);  // Rise
gain.linearRampToValueAtTime(0, t + attack + decay); // Fall
```

---

## Web Audio API Concepts Learned

### 1. Audio Context
```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();
```
- Central hub for all audio processing
- Manages timing and sample rate
- Only one needed per page

### 2. Oscillators
```javascript
const osc = ctx.createOscillator();
osc.type = 'sine' | 'triangle' | 'square' | 'sawtooth';
osc.frequency.setValueAtTime(freq, time);
```
- Basic sound generation
- Must be started and stopped
- Can't be reused (one-time use)

### 3. Gain Nodes
```javascript
const gain = ctx.createGain();
gain.gain.setValueAtTime(value, time);
gain.gain.linearRampToValueAtTime(value, time);
```
- Control volume
- Used for envelopes (fading)
- Can be chained for mixing

### 4. Audio Graph Routing
```javascript
oscillator → gainNode → masterGain → destination
```
- Connect nodes to create signal flow
- Destination = speakers/headphones
- Can create complex routing

### 5. Timing Methods
```javascript
setValueAtTime(value, time)           // Instant change
linearRampToValueAtTime(value, time)  // Straight line
exponentialRampToValueAtTime(value, time) // Curved
```

---

## Best Practices Discovered

### 1. Volume Levels
- Background music: 10-20% of sound effects volume
- Bass: Louder (30%) - foundation
- Pads: Medium (15%) - body
- Melody: Quiet (8%) - accent
- Texture: Very quiet (3%) - atmosphere

### 2. Frequency Ranges
- Bass: 40-80 Hz (sub-bass, felt)
- Pads: 200-500 Hz (warmth, body)
- Melody: 400-800 Hz (presence, clarity)
- Texture: 2000-4000 Hz (sparkle, air)

### 3. Timing
- Slow changes (8-12 seconds) = ambient
- Medium changes (3-4 seconds) = background
- Fast changes (<1 second) = foreground

### 4. Initialization
```javascript
// Audio must be initialized on user interaction
canvas.addEventListener('click', () => {
    audio.init();
    audio.startBackgroundMusic();
});
```
- Browser policy: no autoplay without interaction
- init() must be called from user action

### 5. Cleanup
```javascript
// Always stop oscillators and clear intervals
stopBackgroundMusic() {
    oscillators.forEach(osc => osc.stop());
    clearInterval(intervals);
}
```

---

## Comparison: Background Music vs Sound Effects

| Aspect | Sound Effects | Background Music |
|--------|---------------|------------------|
| **Duration** | <1 second | Infinite/looping |
| **Volume** | 30-100% | 10-20% |
| **Purpose** | Feedback | Atmosphere |
| **Timing** | Immediate | Slow evolution |
| **Attention** | Foreground | Background |
| **Frequency** | Full range | Emphasized lows/highs |
| **Oscillators** | 1-2 | 5-10+ simultaneously |
| **Cleanup** | Auto (short) | Manual (stop explicitly) |

---

## Future Enhancements

### Advanced Techniques to Explore
1. **Filters** - Low-pass, high-pass for movement
2. **Reverb** - ConvolverNode for space
3. **Delay** - DelayNode for echo effects
4. **LFO** - Oscillator modulating other parameters
5. **Dynamic mixing** - Adjust layers based on gameplay intensity
6. **Adaptive music** - Change based on score/danger
7. **Binaural panning** - StereoPannerNode for 3D space

### Procedural Music Patterns
1. **Markov chains** - Note selection based on previous notes
2. **L-systems** - Recursive pattern generation
3. **Cellular automata** - Complex from simple rules
4. **Genetic algorithms** - Evolve musical phrases

---

## What We Learned

### Core Principles
1. **Layering** - Multiple simple layers = complex result
2. **Subtlety** - Background music should be felt, not heard
3. **Space** - Silence/sparseness is as important as sound
4. **Movement** - Slow changes prevent repetitive feel
5. **Harmony** - Use scales/intervals that always work together

### Web Audio Skills
- ✅ Multi-oscillator management
- ✅ Gain node hierarchies
- ✅ Timing and scheduling
- ✅ Envelope shaping (ADSR)
- ✅ Frequency modulation
- ✅ Procedural composition
- ✅ Proper cleanup and lifecycle

### Music Theory
- ✅ Pentatonic scale usage
- ✅ Open interval harmonies
- ✅ Frequency relationships
- ✅ Atmospheric composition techniques
- ✅ Layer-based arrangement

---

## Result

**Ambient space music that:**
- Never feels repetitive (procedural generation)
- Supports gameplay without distraction
- Creates atmosphere and mood
- Uses zero audio files (100% Web Audio API)
- Evolves over time organically
- Can run indefinitely

**Total Audio Implementation:**
- **Sound Effects:** 12 different types
- **Background Music:** 4-layer system
- **Total Lines:** ~300 lines of audio code
- **External Files:** 0 (all procedural)

---

**Status:** ✅ Complete and functional  
**Next Level:** Adaptive/dynamic music that responds to gameplay
