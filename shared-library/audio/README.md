# Shared Audio System

## Overview
Reusable Web Audio API sound synthesis system for game projects.

## When Was This Extracted?
**After Game #3 (Space Invaders)** - Following the Rule of Three:
1. First use: Pong (learned basics)
2. Second use: Breakout (refined and adapted)
3. Third use: Space Invaders (pattern confirmed → extract to shared lib)

## Why Extract This?
All three games used virtually identical audio system code with only minor variations in sound effects. Core AudioSystem class was copy-pasted each time, violating DRY principle.

## What's Included
- **AudioSystem class**: Core Web Audio API wrapper
- **Sound synthesis methods**: Beeps, dual tones, noise, sequences
- **Browser compatibility**: Handles autoplay policies
- **Gain envelopes**: Prevents audio clicks/pops

## Usage
```javascript
// Import in your HTML
<script src="../../shared-library/audio/AudioSystem.js"></script>

// Initialize
const audio = new AudioSystem();

// In your first input handler
audio.init();

// Play sounds
audio.playBeep(440, 0.1, 0.5);
audio.playDualTone(330, 440, 0.15, 0.6);
audio.playNoise(0.1, 0.4);
audio.playSequence([262, 330, 392], 0.12, 0.7);
```

## Methods

### `init()`
Initializes Web Audio API context. Must be called on first user interaction (browser policy).

### `playBeep(frequency, duration, volume = 1.0)`
Plays single-frequency sine wave tone.
- `frequency`: Hz (e.g., 440 for A4)
- `duration`: seconds
- `volume`: 0.0 to 1.0 (multiplied by masterVolume)

### `playDualTone(freq1, freq2, duration, volume = 1.0)`
Plays two simultaneous frequencies.
- Useful for richer sounds, chords, or effects

### `playNoise(duration, volume = 1.0)`
Generates white noise.
- Great for explosion/hit effects

### `playSequence(notes, noteDuration, volume = 1.0)`
Plays array of frequencies in sequence.
- `notes`: Array of frequencies in Hz
- `noteDuration`: seconds per note
- Useful for melodies, win/lose sequences

## Configuration
- **masterVolume**: 0.3 (adjust in constructor)
- All volumes are relative to masterVolume

## Browser Compatibility
- Handles `AudioContext` and `webkitAudioContext`
- Gracefully degrades if Web Audio API unavailable
- Requires user interaction before audio plays (browser policy)

## Technical Details
- Uses gain envelopes (linearRampToValueAtTime) to prevent clicks
- All sounds synthesized in real-time (no external files)
- Oscillators are one-time-use (new one per sound)

## Future Enhancements
Consider adding when needed:
- Filter nodes (low-pass, high-pass)
- More waveform types (square, sawtooth, triangle)
- Volume/mute toggle methods
- Sound effect presets library
- Music loop system

## Credits
Learned and refined across Pong, Breakout, and Space Invaders (Tier 1 games 1-3).
