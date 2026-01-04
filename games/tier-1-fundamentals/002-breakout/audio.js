// ============================================
// AUDIO SYSTEM (Reused from Pong)
// ============================================
// Using Web Audio API to generate sounds programmatically
// No external audio files needed - all sounds synthesized in code

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3;
        this.initialized = false;
    }
    
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
    
    playBeep(frequency, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        const vol = this.masterVolume * volume;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }
    
    playDualTone(freq1, freq2, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
        
        const vol = this.masterVolume * volume * 0.5;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + duration);
        osc2.stop(ctx.currentTime + duration);
    }
    
    playChord(frequencies, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        
        const vol = this.masterVolume * volume * (0.8 / frequencies.length);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        frequencies.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.connect(gainNode);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        });
    }
    
    playSequence(notes, noteDuration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, noteDuration, volume);
            }, index * noteDuration * 1000);
        });
    }
}

// ============================================
// BREAKOUT SOUND EFFECTS
// ============================================
const audio = new AudioSystem();

// Paddle hit - Mid pitch
function playPaddleHit() {
    audio.playBeep(440, 0.08, 0.5);
}

// Wall bounce - Lower pitch
function playWallBounce() {
    audio.playBeep(220, 0.06, 0.3);
}

// Brick break - Higher pitch with slight variation per brick
function playBrickBreak() {
    const baseFreq = 523; // C5
    const variation = Math.random() * 100 - 50; // ±50Hz variation
    audio.playDualTone(baseFreq + variation, baseFreq * 1.5 + variation, 0.1, 0.6);
}

// Level complete - Triumphant ascending sequence
function playLevelComplete() {
    const notes = [262, 330, 392, 523, 659]; // C, E, G, C, E (one octave up)
    audio.playSequence(notes, 0.12, 0.7);
}

// Lose life - Two-tone down
function playLoseLife() {
    audio.playDualTone(392, 262, 0.3, 0.6); // G to C descent
}

// Game over - Sad descending sequence
function playGameOver() {
    const notes = [392, 349, 330, 294, 262]; // G, F, E, D, C
    audio.playSequence(notes, 0.2, 0.7);
}

// Game start - Upbeat dual tone
function playGameStart() {
    audio.playDualTone(330, 440, 0.12, 0.5);
}
