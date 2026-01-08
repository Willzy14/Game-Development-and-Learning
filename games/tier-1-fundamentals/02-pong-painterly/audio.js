// ============================================
// AUDIO SYSTEM
// ============================================
// Using Web Audio API to generate sounds programmatically
// No external audio files needed - all sounds synthesized in code

class AudioSystem {
    constructor() {
        // Create audio context (Web Audio API)
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3; // Keep sounds subtle
        
        // Initialize on first user interaction (browser requirement)
        this.initialized = false;
    }
    
    // Must be called after user interaction (click/keypress)
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }
    
    // Generate a simple beep sound
    playBeep(frequency, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Connect: Oscillator -> Gain -> Destination (speakers)
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Configure oscillator
        oscillator.type = 'sine'; // Smooth sine wave
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        // Configure volume envelope (fade in/out to avoid clicks)
        const vol = this.masterVolume * volume;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01); // Fade in
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration); // Fade out
        
        // Play
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }
    
    // Generate a two-tone beep (more interesting)
    playDualTone(freq1, freq2, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        
        // Create two oscillators for richer sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Configure frequencies
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
        
        // Volume envelope
        const vol = this.masterVolume * volume * 0.5; // Half volume for each oscillator
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        // Play
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + duration);
        osc2.stop(ctx.currentTime + duration);
    }
    
    // Generate noise burst (for impact sounds)
    playNoise(duration, frequency = 1000, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise filtered by frequency
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * duration * 0.3));
        }
        
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Configure filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        // Volume
        gainNode.gain.setValueAtTime(this.masterVolume * volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        source.start(ctx.currentTime);
    }
    
    // Play ascending pitch sequence (for winning)
    playWinSequence() {
        if (!this.enabled || !this.initialized) return;
        
        const notes = [262, 330, 392, 523]; // C, E, G, C (major chord arpeggio)
        const noteDuration = 0.15;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, noteDuration, 0.8);
            }, index * noteDuration * 1000);
        });
    }
    
    // Play descending sequence (for losing)
    playLoseSequence() {
        if (!this.enabled || !this.initialized) return;
        
        const notes = [392, 330, 262]; // G, E, C (sad descent)
        const noteDuration = 0.2;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, noteDuration, 0.8);
            }, index * noteDuration * 1000);
        });
    }
}

// ============================================
// GAME SOUND EFFECTS
// ============================================
// Specific sound functions for game events

const audio = new AudioSystem();

// Paddle hit - Higher pitch, short duration
function playPaddleHit() {
    audio.playBeep(440, 0.1, 0.6); // A4 note, 100ms
}

// Wall bounce - Lower pitch
function playWallBounce() {
    audio.playBeep(220, 0.08, 0.4); // A3 note, 80ms
}

// Score point - Two-tone beep
function playScore() {
    audio.playDualTone(523, 659, 0.15, 0.7); // C5 and E5
}

// Win game - Ascending sequence
function playWin() {
    audio.playWinSequence();
}

// Lose game - Descending sequence
function playLose() {
    audio.playLoseSequence();
}

// Game start - Quick dual tone
function playGameStart() {
    audio.playDualTone(330, 440, 0.12, 0.5);
}

// Export for use in game.js
// (In ES6 modules you'd use export, but for simplicity we're using globals)
