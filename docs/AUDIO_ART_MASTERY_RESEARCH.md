# Audio & Art Mastery Research
## Deep Dive Documentation for V2 Game Rebuilds

**Date:** Research Phase
**Purpose:** Document comprehensive learnings for rebuilding all Tier 1 games with maximum polish
**Skill Level Goal:** From 30/100 → 80+/100

---

## Table of Contents
1. [Web Audio API Deep Dive](#web-audio-api-deep-dive)
2. [Canvas 2D Advanced Techniques](#canvas-2d-advanced-techniques)
3. [Game Audio Design Principles](#game-audio-design-principles)
4. [Visual Design & Game Juice](#visual-design--game-juice)
5. [Easing Functions Reference](#easing-functions-reference)
6. [Implementation Checklists](#implementation-checklists)

---

## Web Audio API Deep Dive

### Core Architecture
The Web Audio API uses a **modular routing architecture** where audio signals flow through connected nodes in a graph structure.

```
[Source Nodes] → [Processing Nodes] → [Destination Node (Speakers)]
```

### Audio Nodes Reference

#### 1. OscillatorNode (Sound Generation)
Creates periodic waveforms for synthesized audio.

```javascript
const audioCtx = new AudioContext();
const oscillator = audioCtx.createOscillator();

// Wave types for different sounds
oscillator.type = 'sine';      // Pure tone, smooth - bells, pads
oscillator.type = 'square';    // Harsh, retro - 8-bit sounds, leads
oscillator.type = 'sawtooth';  // Bright, buzzy - strings, synth leads
oscillator.type = 'triangle';  // Soft, hollow - flutes, woodwinds

oscillator.frequency.value = 440; // A4 note
oscillator.detune.value = 0;      // Cents (100 = semitone)
```

**Game Applications:**
- Square waves for authentic 8-bit/NES sound effects
- Sine waves for smooth UI feedback sounds
- Sawtooth for buzzy power-up effects

#### 2. BiquadFilterNode (Sound Shaping)
Eight filter types for frequency manipulation.

```javascript
const filter = audioCtx.createBiquadFilter();

// Filter Types:
filter.type = 'lowpass';   // Removes highs - muffled, underwater
filter.type = 'highpass';  // Removes lows - thin, distant
filter.type = 'bandpass';  // Isolates range - telephone, radio
filter.type = 'lowshelf';  // Boost/cut lows - bass enhancement
filter.type = 'highshelf'; // Boost/cut highs - treble/presence
filter.type = 'peaking';   // Boost/cut band - EQ
filter.type = 'notch';     // Cut narrow band - remove resonance
filter.type = 'allpass';   // Phase shift only - phaser effects

// Key parameters
filter.frequency.value = 1000;  // Center/cutoff frequency (Hz)
filter.Q.value = 1;             // Resonance/width
filter.gain.value = 0;          // dB boost/cut (shelf/peaking only)
```

**Game Applications:**
- Lowpass filter with decreasing frequency = "game over" descending effect
- Highpass on collision sounds = sharper impact
- Sweeping filter = power-up charging

#### 3. GainNode (Volume Control)
Essential for ADSR envelopes and mixing.

```javascript
const gain = audioCtx.createGain();
gain.gain.value = 0.5; // 0 = silent, 1 = full volume

// SMOOTH volume changes (essential for game audio!)
gain.gain.setValueAtTime(0, audioCtx.currentTime);
gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);  // Quick attack
gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); // Decay
```

#### 4. DelayNode (Echo Effects)
Creates time-delayed copies of sound.

```javascript
const delay = audioCtx.createDelay(5.0); // Max delay in seconds
delay.delayTime.value = 0.3; // 300ms delay

// Echo effect: connect back through gain
const feedback = audioCtx.createGain();
feedback.gain.value = 0.4; // Each echo 40% quieter
delay.connect(feedback);
feedback.connect(delay); // Creates repeating echo
```

**Game Applications:**
- Ball bounce reverb in Pong
- Explosion echoes
- Cave/indoor atmosphere

#### 5. ConvolverNode (Reverb/Space)
Linear convolution for realistic room acoustics.

```javascript
const convolver = audioCtx.createConvolver();
// Load impulse response (audio file of room acoustics)
fetch('impulse-response.wav')
  .then(response => response.arrayBuffer())
  .then(buffer => audioCtx.decodeAudioData(buffer))
  .then(decoded => { convolver.buffer = decoded; });
```

**Game Applications:**
- Room ambiance for different game areas
- Impact depth for collisions
- "Winner" announcement presence

#### 6. DynamicsCompressorNode (Loudness Control)
Prevents clipping when multiple sounds play simultaneously.

```javascript
const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.value = -24;  // dB level to start compressing
compressor.knee.value = 30;        // Softness of threshold
compressor.ratio.value = 12;       // Compression strength (12:1)
compressor.attack.value = 0.003;   // How fast to react (seconds)
compressor.release.value = 0.25;   // How fast to recover
```

**Game Applications:**
- ALWAYS use on master output to prevent distortion
- Especially important when many sounds play at once

#### 7. StereoPannerNode (Spatial Audio)
Position sounds in stereo field.

```javascript
const panner = audioCtx.createStereoPanner();
panner.pan.value = -1;  // Full left
panner.pan.value = 0;   // Center
panner.pan.value = 1;   // Full right

// Dynamic panning based on position
function panFromPosition(x, canvasWidth) {
    return (x / canvasWidth) * 2 - 1;
}
```

**Game Applications:**
- Ball position in Pong - pan based on X coordinate!
- Enemies in Space Invaders - pan as they move
- Snake movement feedback

#### 8. WaveShaperNode (Distortion)
Non-linear distortion for aggressive sounds.

```javascript
const shaper = audioCtx.createWaveShaper();
// Soft clipping curve
function makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}
shaper.curve = makeDistortionCurve(50);
```

#### 9. AnalyserNode (Visualization)
FFT analysis for audio visualization.

```javascript
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function visualize() {
    analyser.getByteFrequencyData(dataArray);
    // dataArray now contains frequency data for visualization
    requestAnimationFrame(visualize);
}
```

**Game Applications:**
- Audio-reactive backgrounds
- Beat detection for rhythm games
- Visual sound meter

### ADSR Envelopes (CRITICAL for Good Sound)

Attack-Decay-Sustain-Release creates natural-sounding audio:

```javascript
function playNoteWithEnvelope(frequency, type = 'square') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    const now = audioCtx.currentTime;
    
    // ADSR envelope
    gain.gain.setValueAtTime(0, now);                           // Start at 0
    gain.gain.linearRampToValueAtTime(0.8, now + 0.01);        // Attack: 10ms
    gain.gain.linearRampToValueAtTime(0.4, now + 0.05);        // Decay: 40ms
    gain.gain.setValueAtTime(0.4, now + 0.05);                 // Sustain level
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);        // Release: 250ms
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
}
```

### Frequency to Note Conversion

```javascript
// Note frequencies for musical sounds
const NOTE_FREQUENCIES = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
};

// Calculate any note frequency
function noteToFrequency(note, octave) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = notes.indexOf(note);
    const semitones = (octave - 4) * 12 + noteIndex - 9; // A4 = 440Hz reference
    return 440 * Math.pow(2, semitones / 12);
}
```

### Procedural Sound Effect Recipes

#### Retro "Blip" (Menu/UI)
```javascript
function playBlip() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}
```

#### Power-up Collect
```javascript
function playPowerUp() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}
```

#### Explosion
```javascript
function playExplosion() {
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start();
}
```

---

## Canvas 2D Advanced Techniques

### globalCompositeOperation (Blend Modes)

```javascript
ctx.globalCompositeOperation = 'source-over';     // Default (draw on top)
ctx.globalCompositeOperation = 'source-in';       // Only where overlaps existing
ctx.globalCompositeOperation = 'source-out';      // Only where NOT overlapping
ctx.globalCompositeOperation = 'destination-over'; // Draw behind existing
ctx.globalCompositeOperation = 'lighter';         // Additive (GREAT for glows!)
ctx.globalCompositeOperation = 'multiply';        // Darken
ctx.globalCompositeOperation = 'screen';          // Lighten
ctx.globalCompositeOperation = 'overlay';         // Contrast boost
ctx.globalCompositeOperation = 'color-dodge';     // Bright highlights
```

**Game Applications:**
- `lighter` for particle glows, laser effects, explosions
- `multiply` for shadows
- `screen` for lens flares, light sources

### Gradients

```javascript
// Linear gradient (directional)
const linear = ctx.createLinearGradient(x0, y0, x1, y1);
linear.addColorStop(0, '#ff0000');
linear.addColorStop(0.5, '#ffff00');
linear.addColorStop(1, '#00ff00');
ctx.fillStyle = linear;

// Radial gradient (circular/spherical)
const radial = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
radial.addColorStop(0, 'rgba(255,255,255,1)');
radial.addColorStop(0.3, 'rgba(255,255,255,0.5)');
radial.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = radial;
```

**Game Applications:**
- Ball highlights (radial gradient for 3D appearance)
- Background gradients for depth
- Glow effects around important elements

### Shadows

```javascript
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 15;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;
// Draw element - shadow applied automatically
ctx.fillRect(x, y, w, h);
// Reset shadows after use!
ctx.shadowColor = 'transparent';
```

**Game Applications:**
- Paddle/ball depth
- UI element elevation
- Text readability

### Transformations

```javascript
ctx.save(); // Save current state

ctx.translate(x, y);           // Move origin
ctx.rotate(angle * Math.PI/180); // Rotate (radians)
ctx.scale(sx, sy);             // Scale

// Draw at transformed position
ctx.fillRect(-w/2, -h/2, w, h); // Draw centered on origin

ctx.restore(); // Restore previous state
```

**Game Applications:**
- Rotating projectiles
- Spinning power-ups
- Screen shake (translate canvas)

### Particle System Template

```javascript
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 10;
        this.vy = options.vy || (Math.random() - 0.5) * 10;
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.size = options.size || 5;
        this.color = options.color || '#ffffff';
        this.gravity = options.gravity || 0;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.life -= dt;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    get isDead() { return this.life <= 0; }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count = 10, options = {}) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, options));
        }
    }
    
    update(dt) {
        this.particles = this.particles.filter(p => {
            p.update(dt);
            return !p.isDead;
        });
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter'; // Additive glow!
        this.particles.forEach(p => p.draw(ctx));
        ctx.restore();
    }
}
```

### Trail Effect

```javascript
// Instead of clearRect, use semi-transparent fill
function clearWithTrail() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 10% opacity black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Objects drawn will leave fading trails!
}
```

---

## Game Audio Design Principles

### The Three Rules of Game Audio

1. **Every action needs audio feedback** - Players feel disconnected without sound
2. **Sound variation prevents fatigue** - Use pools of similar sounds, vary pitch/playback rate
3. **Spatial audio increases immersion** - Pan sounds based on screen position

### Sound Pools for Variation

```javascript
class SoundPool {
    constructor(baseFrequency, variance = 50, poolSize = 5) {
        this.frequencies = [];
        for (let i = 0; i < poolSize; i++) {
            this.frequencies.push(baseFrequency + (Math.random() - 0.5) * variance);
        }
        this.index = 0;
    }
    
    play() {
        const freq = this.frequencies[this.index];
        this.index = (this.index + 1) % this.frequencies.length;
        // Play sound with this frequency
        this.playTone(freq);
    }
}
```

### Adaptive Audio Concepts

```javascript
// Music intensity based on game state
class AdaptiveMusicSystem {
    constructor() {
        this.intensity = 0; // 0 = calm, 1 = intense
        this.layers = [];   // Pre-loaded audio layers
    }
    
    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
        this.layers.forEach((layer, i) => {
            // Crossfade between layers based on intensity
            const layerIntensity = i / this.layers.length;
            const distance = Math.abs(this.intensity - layerIntensity);
            layer.volume = Math.max(0, 1 - distance * 2);
        });
    }
}
```

### Audio Context Best Practices

```javascript
// Singleton pattern for AudioContext
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policies)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

// Always resume on user interaction
document.addEventListener('click', () => getAudioContext());
document.addEventListener('keydown', () => getAudioContext());
```

### Preventing Audio Clipping

```javascript
// Master gain with compressor
function createMasterOutput(audioCtx) {
    const masterGain = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();
    
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    masterGain.gain.value = 0.7; // Leave headroom
    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);
    
    return masterGain;
}
```

---

## Visual Design & Game Juice

### What is "Juice"?
Juice = making things feel good through excessive feedback

From the famous "Juice It or Lose It" GDC talk:
> "Juice is a neat little tricks you can apply to any game to make it more satisfying to play."

### The Juice Checklist

1. **Screen Shake** - On impacts, explosions, damage
2. **Particles** - On every collision, collection, destruction
3. **Squash & Stretch** - Objects deform on impact
4. **Tweening/Easing** - Nothing moves linearly
5. **Color Flash** - Brief color change on hit/collect
6. **Sound Variation** - Slightly different each time
7. **Time Manipulation** - Slow-mo on important moments
8. **Camera Effects** - Zoom, shake, follow

### Screen Shake Implementation

```javascript
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.decay = 0.9;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    shake(intensity) {
        this.intensity = intensity;
    }
    
    update() {
        if (this.intensity > 0.1) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.intensity *= this.decay;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
        }
    }
    
    apply(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
    }
}
```

### Hit Flash Effect

```javascript
class GameObject {
    constructor() {
        this.flashTime = 0;
        this.normalColor = '#ffffff';
        this.flashColor = '#ff0000';
    }
    
    hit() {
        this.flashTime = 0.1; // Flash for 100ms
    }
    
    update(dt) {
        this.flashTime = Math.max(0, this.flashTime - dt);
    }
    
    draw(ctx) {
        ctx.fillStyle = this.flashTime > 0 ? this.flashColor : this.normalColor;
        // Draw object...
    }
}
```

### Time Slow Effect

```javascript
class TimeManager {
    constructor() {
        this.scale = 1;
        this.targetScale = 1;
        this.smoothing = 0.1;
    }
    
    slowMotion(duration = 0.5) {
        this.targetScale = 0.2;
        setTimeout(() => { this.targetScale = 1; }, duration * 1000);
    }
    
    update() {
        this.scale += (this.targetScale - this.scale) * this.smoothing;
    }
    
    getDeltaTime(realDt) {
        return realDt * this.scale;
    }
}
```

---

## Easing Functions Reference

### Core Easing Functions

```javascript
const Easing = {
    // Linear (no easing)
    linear: t => t,
    
    // Quadratic
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Cubic (more pronounced)
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    // Elastic (bouncy spring)
    easeOutElastic: t => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    
    // Bounce
    easeOutBounce: t => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    
    // Back (overshoot)
    easeOutBack: t => {
        const c = 1.70158;
        return 1 + (--t) * t * ((c + 1) * t + c);
    }
};

// Usage: Tweening class
class Tween {
    constructor(from, to, duration, easingFn = Easing.easeOutQuad) {
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.elapsed = 0;
        this.easing = easingFn;
    }
    
    update(dt) {
        this.elapsed = Math.min(this.duration, this.elapsed + dt);
        const t = this.easing(this.elapsed / this.duration);
        return this.from + (this.to - this.from) * t;
    }
    
    get isComplete() {
        return this.elapsed >= this.duration;
    }
}
```

### When to Use Each Easing

| Easing | Best For |
|--------|----------|
| `easeOutQuad` | General movement, UI animations |
| `easeOutCubic` | Objects slowing down naturally |
| `easeOutElastic` | Bouncy arrivals, collect effects |
| `easeOutBounce` | Ball bouncing, landing objects |
| `easeOutBack` | Pop-in effects, menu items appearing |
| `easeInQuad` | Objects speeding up from rest |

---

## Implementation Checklists

### Per-Game Audio Checklist

- [ ] Ball/paddle collision sound (with variation)
- [ ] Wall collision sound (different from paddle)
- [ ] Score/point sound
- [ ] Game over sound
- [ ] Victory/win sound
- [ ] Menu interaction sounds
- [ ] Power-up collect sounds
- [ ] Background music (if applicable)
- [ ] Spatial panning based on position
- [ ] Master compressor to prevent clipping

### Per-Game Visual Checklist

- [ ] Gradient backgrounds (not flat colors)
- [ ] Object gradients (3D appearance)
- [ ] Particle effects on collisions
- [ ] Screen shake on impacts
- [ ] Color flash on hits
- [ ] Trail effects on fast objects
- [ ] Smooth easing on all movement
- [ ] Score animations (not just number change)
- [ ] UI hover/active states
- [ ] Start/game over transitions

### Performance Checklist

- [ ] Object pooling for particles
- [ ] requestAnimationFrame (not setInterval)
- [ ] Limit concurrent sounds (voice stealing)
- [ ] Clean up audio nodes after use
- [ ] Efficient canvas clearing
- [ ] Delta time for consistent speed

---

## V2 Game Specific Plans

### Pong V2 Enhancements
- Stereo panning based on ball X position
- Ball trail effect
- Paddle hit particles
- Screen shake on score
- Pitch-shifted bounce sounds based on paddle hit position
- Ball gradient for 3D appearance
- Paddle glow on hit

### Breakout V2 Enhancements
- Brick destruction particles (brick color)
- Sound pitch varies with brick value
- Combo system with escalating sound
- Ball trail
- Power-up particles and sounds
- Screen shake on multi-brick clears
- Background color shifts with remaining bricks

### Space Invaders V2 Enhancements
- Explosion particles per enemy type
- Spatial audio for enemy position
- Tension music increases as invaders descend
- Screen shake on player hit
- Bullet trails
- Enemy death flash
- Shield degradation particles

### Snake V2 Enhancements
- Trail effect following snake
- Food collect particles
- Sound pitch increases with snake length
- Color gradient along snake body
- Death explosion particles
- Speed-up visual effects
- Grid pattern background with subtle animation

---

*This document will be updated as learnings are applied to actual game implementations.*
