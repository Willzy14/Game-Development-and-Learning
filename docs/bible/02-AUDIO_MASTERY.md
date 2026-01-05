# 🎵 AUDIO MASTERY

**Purpose:** Complete Web Audio API patterns, music systems, and sound design  
**When to Read:** Adding audio to any game, creating background music, designing sound effects

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-05   | 2026-01-05     | Snake V2 audio complete |
<!-- END METADATA -->

**Related Documents:**
- [08-QUICK_REFERENCE.md](./08-QUICK_REFERENCE.md) - Audio cheat sheets
- [07-DEBUG_QUALITY.md](./07-DEBUG_QUALITY.md) - Audio bug solutions
- [05-TECHNOLOGIES.md](./05-TECHNOLOGIES.md) - Web Audio API basics

---

## MASTERY LEVEL: Advanced
**Hours Practiced:** ~10 hours across 4 games + V2 editions  
**Key Achievements:** Pulse-based music system, LFO modulation, stereo panning, adaptive intensity

---

## TABLE OF CONTENTS

1. [Audio System Architecture](#audio-system-architecture)
2. [Sound Effects Patterns](#sound-effects-patterns)
3. [Background Music Systems](#background-music-systems)
4. [Advanced Techniques](#advanced-techniques)
5. [Volume Control](#volume-control)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## AUDIO SYSTEM ARCHITECTURE

### The Master Audio Class

```javascript
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.compressor = null;
        this.initialized = false;
        
        // Separate volume controls
        this.masterVolume = 0.3;    // 0-1
        this.musicVolume = 0.15;    // 0-1
        
        // Music state
        this.backgroundMusic = {
            playing: false,
            masterMusicGain: null,
            // Layer-specific nodes stored here
        };
    }
    
    init() {
        if (this.initialized) return;
        
        // Create context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master chain: Gain -> Compressor -> Destination
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        
        // Compressor prevents clipping
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value = 20;
        this.compressor.ratio.value = 8;
        this.compressor.attack.value = 0.005;
        this.compressor.release.value = 0.1;
        
        // Connect chain
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.audioContext.destination);
        
        this.initialized = true;
    }
}
```

### Why DynamicsCompressorNode?

The compressor is **essential** for preventing audio clipping when multiple sounds play simultaneously:

```javascript
// Without compressor: 5 sounds at 0.3 volume = 1.5 (CLIPS!)
// With compressor: Automatically reduces peaks, maintains clarity

this.compressor = this.audioContext.createDynamicsCompressor();
this.compressor.threshold.value = -20;  // Start compressing at -20dB
this.compressor.knee.value = 20;        // Soft knee for natural sound
this.compressor.ratio.value = 8;        // Strong compression
this.compressor.attack.value = 0.005;   // Fast response
this.compressor.release.value = 0.1;    // Smooth release
```

---

## SOUND EFFECTS PATTERNS

### Basic Beep (Foundation)

```javascript
playBeep(frequency, duration, volume = 0.5) {
    if (!this.initialized) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.frequency.value = frequency;
    osc.type = 'sine';  // sine, triangle, square, sawtooth
    
    // CRITICAL: Envelope prevents click/pop artifacts
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
}
```

### Frequency Sweep (Falling/Rising Sounds)

```javascript
playFrequencySweep(startFreq, endFreq, duration, volume = 0.3) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    const now = this.audioContext.currentTime;
    
    // Frequency sweep
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    
    // Volume envelope
    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
}

// Usage:
playSweep(800, 200, 0.3);  // Descending (failure, death)
playSweep(200, 800, 0.2);  // Ascending (power-up, success)
```

### Filter Sweep (Timbre Change)

```javascript
playFilterSweep() {
    const osc = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sawtooth';  // Rich harmonics for filter to shape
    osc.frequency.value = 100;
    
    filter.type = 'lowpass';
    filter.Q.value = 8;  // Resonance
    
    const now = this.audioContext.currentTime;
    
    // Descending filter sweep (bright -> muffled = "dying")
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
}
```

### Pentatonic Scale SFX (Always Sounds Musical)

```javascript
// A minor pentatonic - these notes always sound good together
const PENTATONIC = [220, 246.9, 293.7, 329.6, 392]; // A, B, D, E, G

playEatSound(comboCount) {
    // Higher combo = higher note = more rewarding!
    const noteIndex = Math.min(comboCount, PENTATONIC.length - 1);
    const frequency = PENTATONIC[noteIndex];
    
    this.playBeep(frequency, 0.1, 0.3);
}
```

### Stereo Panning

```javascript
playPannedSound(frequency, pan) {
    // pan: -1 (left) to +1 (right)
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const panner = this.audioContext.createStereoPanner();
    
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    
    // ... rest of sound setup
}

// Calculate pan from game position
const pan = (objectX / CANVAS_WIDTH) * 2 - 1;  // Map 0-800 to -1..+1
```

---

## BACKGROUND MUSIC SYSTEMS

### Architecture Comparison

| Aspect | V1 (Drones) | V2 (Pulses) |
|--------|-------------|-------------|
| Oscillators | Continuous, never stop | Discrete, start/stop per note |
| Rhythm | None | BPM-based timing |
| Energy | Static, meditative | Dynamic, driving |
| Notes | Constant frequencies | Pattern sequences |
| Use Case | Ambient, relaxing games | Action, arcade games |

**Important:** Both architectures are valid tools. Choose based on the game's mood.

### V1 Pattern: Continuous Drones (Ambient)

```javascript
startAmbientMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    
    // Continuous bass drone
    this.bassOsc = this.audioContext.createOscillator();
    this.bassGain = this.audioContext.createGain();
    
    this.bassOsc.type = 'sine';
    this.bassOsc.frequency.value = 55;  // A1 - low drone
    this.bassGain.gain.value = 0.1;
    
    this.bassOsc.connect(this.bassGain);
    this.bassGain.connect(this.backgroundMusic.masterMusicGain);
    
    this.bassOsc.start();  // Runs forever until stopped
    
    // Add pad layer (chord drone)
    this.startPadDrone();
}

startPadDrone() {
    const chordFreqs = [220, 261.63, 329.63];  // Am chord
    this.padOscs = [];
    this.padGain = this.audioContext.createGain();
    this.padGain.gain.value = 0.05;
    
    chordFreqs.forEach(freq => {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(this.padGain);
        osc.start();
        this.padOscs.push(osc);
    });
    
    this.padGain.connect(this.backgroundMusic.masterMusicGain);
}

stopMusic() {
    if (!this.musicPlaying) return;
    
    // Gracefully stop all oscillators
    this.bassOsc?.stop();
    this.padOscs?.forEach(osc => osc.stop());
    
    this.musicPlaying = false;
}
```

### V2 Pattern: Pulse-Based Sequencer (Rhythmic)

```javascript
startPulseMusic() {
    if (this.backgroundMusic.playing) return;
    this.backgroundMusic.playing = true;
    
    // Setup master music gain
    this.backgroundMusic.masterMusicGain = this.audioContext.createGain();
    this.backgroundMusic.masterMusicGain.gain.value = this.masterVolume * this.musicVolume;
    this.backgroundMusic.masterMusicGain.connect(this.masterGain);
    
    // Tempo
    this.bpm = 80;
    this.beatLength = 60 / this.bpm;  // seconds per beat
    
    // Start all layers
    this.startPulsingBass();
    this.startArpeggioLayer();
    this.startPadSwells();
    this.startTextureLayer();
    this.startRhythmicPulse();
}

startPulsingBass() {
    const ctx = this.audioContext;
    const beatMs = this.beatLength * 1000;
    
    const playPulse = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 55;  // A1
        
        // ADSR envelope - note has shape
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.05);  // Attack
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);    // Decay
        gain.gain.linearRampToValueAtTime(0, now + this.beatLength * 0.9);  // Release
        
        osc.connect(gain);
        gain.connect(this.backgroundMusic.masterMusicGain);
        
        osc.start(now);
        osc.stop(now + this.beatLength);  // Note ENDS
    };
    
    playPulse();  // Play first immediately
    this.backgroundMusic.bassInterval = setInterval(playPulse, beatMs * 2);  // Every 2 beats
}

startArpeggioLayer() {
    const ctx = this.audioContext;
    const pattern = [261.63, 329.63, 392, 440, 392, 329.63];  // Cm ascending/descending
    let noteIndex = 0;
    let panDirection = 1;
    let panValue = -0.8;
    
    const playNote = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();
        
        osc.type = 'triangle';
        osc.frequency.value = pattern[noteIndex];
        
        // Sweep pan across stereo field
        panValue += 0.2 * panDirection;
        if (panValue > 0.8 || panValue < -0.8) panDirection *= -1;
        panner.pan.value = panValue;
        
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.backgroundMusic.masterMusicGain);
        
        osc.start(now);
        osc.stop(now + 0.3);
        
        noteIndex = (noteIndex + 1) % pattern.length;
    };
    
    this.backgroundMusic.arpeggioInterval = setInterval(playNote, this.beatLength * 500);
}

startPadSwells() {
    const ctx = this.audioContext;
    
    const playSwell = () => {
        // Chord: Cm7 (C, Eb, G, Bb)
        const chord = [261.63, 311.13, 392, 466.16];
        const now = ctx.currentTime;
        
        const chordGain = ctx.createGain();
        chordGain.gain.setValueAtTime(0, now);
        chordGain.gain.linearRampToValueAtTime(0.12, now + 2);  // Slow attack
        chordGain.gain.linearRampToValueAtTime(0, now + 4);     // Slow release
        
        chord.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(chordGain);
            osc.start(now);
            osc.stop(now + 4);
        });
        
        chordGain.connect(this.backgroundMusic.masterMusicGain);
    };
    
    playSwell();
    this.backgroundMusic.swellInterval = setInterval(playSwell, 8000);  // Every 8 seconds
}

stopMusic() {
    if (!this.backgroundMusic.playing) return;
    
    // Clear all intervals
    clearInterval(this.backgroundMusic.bassInterval);
    clearInterval(this.backgroundMusic.arpeggioInterval);
    clearInterval(this.backgroundMusic.swellInterval);
    clearInterval(this.backgroundMusic.textureInterval);
    clearInterval(this.backgroundMusic.kickInterval);
    
    // Fade out
    const now = this.audioContext.currentTime;
    this.backgroundMusic.masterMusicGain.gain.linearRampToValueAtTime(0, now + 0.5);
    
    setTimeout(() => {
        this.backgroundMusic.masterMusicGain.disconnect();
        this.backgroundMusic.playing = false;
    }, 500);
}
```

---

## ADVANCED TECHNIQUES

### LFO Wobble (Vibrato/Tremolo)

```javascript
// LFO modulates another parameter over time
createWobbleBass() {
    const ctx = this.audioContext;
    
    // Main bass oscillator
    const bassOsc = ctx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 55;
    
    // LFO (Low Frequency Oscillator)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.value = 4;      // 4Hz wobble rate
    lfoGain.gain.value = 8;       // Wobble depth in Hz
    
    // LFO modulates bass frequency
    lfo.connect(lfoGain);
    lfoGain.connect(bassOsc.frequency);
    
    // Result: Bass wobbles between 47Hz and 63Hz at 4 cycles/second
    
    lfo.start();
    bassOsc.start();
}
```

### Adaptive Music Intensity

```javascript
updateMusicIntensity(intensity) {
    // intensity: 0.0 (calm) to 1.0 (intense)
    if (!this.backgroundMusic.masterMusicGain) return;
    
    const now = this.audioContext.currentTime;
    
    // Volume increases with intensity
    const baseVolume = 0.12;
    const maxVolume = 0.22;
    const targetVolume = baseVolume + (maxVolume - baseVolume) * intensity;
    
    this.backgroundMusic.masterMusicGain.gain.linearRampToValueAtTime(
        targetVolume * this.masterVolume, 
        now + 0.3
    );
}

// Usage in game:
// Calculate intensity based on game state
const intensity = Math.min(1, snake.length / 20);  // More segments = more intense
audio.updateMusicIntensity(intensity);
```

### White Noise Generator

```javascript
createNoiseSource() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(
        1, 
        bufferSize, 
        this.audioContext.sampleRate
    );
    
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;  // Random values -1 to 1
    }
    
    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    return whiteNoise;
}

// Use with filter for different textures:
const noise = createNoiseSource();
const filter = this.audioContext.createBiquadFilter();
filter.type = 'highpass';
filter.frequency.value = 8000;  // Hissy/airy texture

noise.connect(filter);
filter.connect(gainNode);
```

---

## VOLUME CONTROL

### Critical: Separate Master and Music Volumes

```javascript
class AudioSystem {
    constructor() {
        this.masterVolume = 0.3;   // Affects ALL audio
        this.musicVolume = 0.15;   // Affects ONLY music (relative to master)
    }
    
    setMasterVolume(value) {
        this.masterVolume = value;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(value, this.audioContext.currentTime);
        }
        this.updateMusicVolume();  // Music is affected by master
    }
    
    setMusicVolume(value) {
        this.musicVolume = value;
        this.updateMusicVolume();
    }
    
    updateMusicVolume() {
        if (this.backgroundMusic.masterMusicGain) {
            // Music volume = master × music
            const effectiveVolume = this.masterVolume * this.musicVolume;
            this.backgroundMusic.masterMusicGain.gain.setValueAtTime(
                effectiveVolume,
                this.audioContext.currentTime
            );
        }
    }
}
```

### UI Integration

```javascript
// HTML sliders (0-100 range for user-friendliness)
<input type="range" id="masterVolume" min="0" max="100" value="30">
<input type="range" id="musicVolume" min="0" max="100" value="15">

// JS handling (convert to 0-1)
masterVolumeSlider.addEventListener('input', (e) => {
    const value = e.target.value / 100;  // 0-100 → 0-1
    audio.setMasterVolume(value);
    settings.masterVolume = e.target.value;  // Store 0-100
    settings.save();
});

musicVolumeSlider.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    audio.setMusicVolume(value);
    settings.musicVolume = e.target.value;
    settings.save();
});
```

---

## COMMON PATTERNS

### Musical Notes Reference

```javascript
const NOTES = {
    // Octave 3
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
    G3: 196.00, A3: 220.00, B3: 246.94,
    
    // Octave 4 (middle)
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    
    // Octave 5
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00, B5: 987.77
};

// Common chords
const CHORDS = {
    Cmaj: [261.63, 329.63, 392.00],         // C, E, G
    Am:   [220.00, 261.63, 329.63],         // A, C, E
    Fmaj: [174.61, 220.00, 261.63],         // F, A, C
    Gmaj: [196.00, 246.94, 293.66],         // G, B, D
    Cm7:  [261.63, 311.13, 392.00, 466.16], // C, Eb, G, Bb
    Am7:  [220.00, 261.63, 329.63, 392.00], // A, C, E, G
};

// Scales that always sound good
const PENTATONIC_MINOR = [220, 261.63, 293.66, 329.63, 392]; // A minor pentatonic
const PENTATONIC_MAJOR = [261.63, 293.66, 329.63, 392, 440]; // C major pentatonic
```

### Oscillator Types & When to Use

| Type | Sound | Use Case |
|------|-------|----------|
| `sine` | Pure, clean | Bass, gentle tones, pads |
| `triangle` | Soft, warm | Melody, arpeggios |
| `square` | 8-bit, retro | Chip-tune, classic games |
| `sawtooth` | Harsh, buzzy | Aggressive sounds, leads |

### Complete Audio Chain Example

```
[Oscillator/Source]
        ↓
    [Filter] (optional - shape timbre)
        ↓
    [Gain] (envelope control)
        ↓
    [Panner] (optional - stereo position)
        ↓
[Master Gain] (overall volume)
        ↓
 [Compressor] (prevent clipping)
        ↓
 [Destination] (speakers)
```

---

## MUSICAL SCALES FOR GAME THEMING ⭐ NEW

### Learned From: Flappy Bird V4 Egypt - Complete Audio Theme Transformation

**The Big Insight:** Musical identity = Scale + Rhythm + Timbre

Change all three and you have a completely different soundtrack that fits a different theme.

### Scale Quick Reference

| Scale | Pattern (Semitones) | Mood/Theme | Example Notes (from A) |
|-------|---------------------|------------|------------------------|
| **Major** | 0-2-4-5-7-9-11 | Happy, heroic, victory | A-B-C#-D-E-F#-G# |
| **Natural Minor** | 0-2-3-5-7-8-10 | Sad, mysterious, dark | A-B-C-D-E-F-G |
| **Pentatonic Major** | 0-2-4-7-9 | Safe, universal, folk | A-B-C#-E-F# |
| **Pentatonic Minor** | 0-3-5-7-10 | Blues, rock, safe minor | A-C-D-E-G |
| **Phrygian Dominant** | 0-1-4-5-7-8-10 | Egyptian, Arabic, Spanish | A-Bb-C#-D-E-F-G |
| **Whole Tone** | 0-2-4-6-8-10 | Dreamy, underwater, floating | A-B-C#-D#-F-G |
| **Chromatic** | 0-1-2-3-4... | Tension, horror, unease | All notes |
| **Dorian** | 0-2-3-5-7-9-10 | Medieval, Celtic, Minecraft | A-B-C-D-E-F#-G |
| **Mixolydian** | 0-2-4-5-7-9-10 | Rock, blues-rock, folk | A-B-C#-D-E-F#-G |
| **Harmonic Minor** | 0-2-3-5-7-8-11 | Classical drama, Middle Eastern | A-B-C-D-E-F-G# |

### Theme → Scale Mapping

| Game Theme | Recommended Scale | Why |
|------------|-------------------|-----|
| **Standard/Arcade** | Major or Pentatonic | Universally pleasant |
| **Egyptian/Desert** | Phrygian Dominant | Half-step root creates Arabic feel |
| **Underwater/Ocean** | Whole Tone | No strong tonal center, floaty |
| **Forest/Nature** | Pentatonic Major | Folk-like, organic |
| **Space/Sci-Fi** | Whole Tone + Chromatic | Otherworldly, alien |
| **Horror/Dark** | Chromatic or Locrian | Dissonance, unease |
| **Medieval/Fantasy** | Dorian | Classic game feel |
| **Asian/Eastern** | Pentatonic Minor | Traditional Eastern music |
| **Latin/Spanish** | Phrygian or Harmonic Minor | Flamenco character |
| **Victory/Success** | Major with 7ths | Triumphant, resolved |

### Implementation Pattern

```javascript
class ThemedAudioSystem {
    constructor(theme) {
        this.baseFreq = 110; // A2
        
        // Scale definitions (semitones from root)
        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9],
            phrygianDominant: [0, 1, 4, 5, 7, 8, 10],  // Egyptian
            wholeTone: [0, 2, 4, 6, 8, 10],
            dorian: [0, 2, 3, 5, 7, 9, 10]
        };
        
        // Set scale based on theme
        this.currentScale = this.scales[this.getScaleForTheme(theme)];
    }
    
    getScaleForTheme(theme) {
        const themeScales = {
            'standard': 'major',
            'egypt': 'phrygianDominant',
            'underwater': 'wholeTone',
            'forest': 'pentatonic',
            'medieval': 'dorian',
            'dark': 'minor'
        };
        return themeScales[theme] || 'major';
    }
    
    // Convert scale degree to frequency
    noteToFreq(scaleIndex, octaveOffset = 0) {
        const semitone = this.currentScale[scaleIndex % this.currentScale.length];
        const octave = Math.floor(scaleIndex / this.currentScale.length) + octaveOffset;
        return this.baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
    }
}
```

### The Egyptian Sound (Detailed)

**Scale:** Phrygian Dominant (A-Bb-C#-D-E-F-G)

**Key Interval:** The half-step between root (A) and flat-2 (Bb) creates the "Arabic" sound

**Instruments to Synthesize:**

```javascript
// Oud (lute) - plucked string
playOud(freq, time, duration) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';  // Rich harmonics
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2.01;  // Slight detune for richness
    
    // Sharp attack, quick decay (plucked)
    gain.setValueAtTime(0, time);
    gain.linearRampToValueAtTime(0.4, time + 0.01);  // Fast attack
    gain.exponentialRampToValueAtTime(0.001, time + duration);  // Decay
}

// Ney flute - breathy wind
playNey(freq, time, duration) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';  // Pure tone
    
    // Vibrato for expressive Middle Eastern style
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5;  // 5 Hz wobble
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = freq * 0.02;  // 2% pitch variation
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    
    // Soft attack (breath)
    gain.linearRampToValueAtTime(0.25, time + 0.15);  // Slow attack
}

// Tabla drums - Middle Eastern rhythm
// Dum = low bass (sine, pitch drop)
// Tak = high rim (triangle, quick decay)
// Ka = mid slap (square, filtered)
```

**Rhythm Pattern (Maqsoum):**
```
Beat:  1  &  2  &  3  &  4  &
Dum:   X        X           
Tak:         X           X   
Ka:                X        
```

### Reverb for Theme

Different reverbs suggest different spaces:

```javascript
// Desert: Long reverb, sparse reflections (open space)
createDesertReverb() {
    const length = sampleRate * 3;  // 3 second tail
    // Sparse early reflections, long decay
}

// Cave/Dungeon: Short reverb, dense reflections
createCaveReverb() {
    const length = sampleRate * 1;  // 1 second tail
    // Many early reflections, quick decay
}

// Underwater: Very long reverb, filtered
createUnderwaterReverb() {
    const length = sampleRate * 4;  // 4 second tail
    // Add lowpass filter for muffled effect
}
```

### Sound Effect Theming

| Standard SFX | Egyptian Alternative |
|--------------|---------------------|
| Wing flap | Beetle wing buzz (sawtooth + detune) |
| Score chime | Ancient gong (sine chord + long decay) |
| Death | Stone crumble + cymbal crash |
| Jump | Soft thud (sine + pitch drop) |
| Collect | Metallic shimmer (high harmonics) |

---

## TROUBLESHOOTING

### Audio Won't Play

**Symptom:** Complete silence on page load  
**Cause:** Browser autoplay policy  
**Fix:** Initialize AudioContext in user gesture handler

```javascript
document.addEventListener('keydown', () => audio.init(), { once: true });
document.addEventListener('click', () => audio.init(), { once: true });
```

### Click/Pop Artifacts

**Symptom:** Harsh clicking sounds at note start/end  
**Cause:** Sudden gain changes  
**Fix:** Always use gain envelopes

```javascript
// ❌ WRONG
gain.gain.value = 0.5;
osc.start();
osc.stop(now + 0.5);  // Sudden cutoff = click

// ✅ RIGHT
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(0.5, now + 0.01);  // Fade in
gain.gain.linearRampToValueAtTime(0, now + 0.5);     // Fade out
osc.stop(now + 0.5);
```

### Music Volume Slider Doesn't Work

**Symptom:** Music slider has no effect  
**Cause:** No separate musicVolume property  
**Fix:** Implement separate music gain node and updateMusicVolume()

### Audio Clipping/Distortion

**Symptom:** Sound crackles when multiple sounds play  
**Cause:** Combined volumes exceed 1.0  
**Fix:** Add DynamicsCompressorNode to master chain

---

*Last Updated: January 5, 2026*  
*Techniques Learned Through: Snake V2 Mastery Edition*
