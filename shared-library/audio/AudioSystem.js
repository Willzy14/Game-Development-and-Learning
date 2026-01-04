// ============================================
// SHARED AUDIO SYSTEM
// ============================================
// Reusable Web Audio API sound synthesis system
// Extracted after use in: Pong, Breakout, Space Invaders
// No external audio files needed - all sounds synthesized in code

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3; // Adjust for overall game volume
        this.initialized = false;
    }
    
    /**
     * Initialize audio context (must be called on first user interaction)
     */
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
    
    /**
     * Play a single-frequency tone
     * @param {number} frequency - Frequency in Hz (e.g., 440 for A4)
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume 0.0-1.0 (relative to masterVolume)
     */
    playBeep(frequency, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        // Gain envelope to prevent clicks
        const vol = this.masterVolume * volume;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }
    
    /**
     * Play two simultaneous tones (useful for richer sounds)
     * @param {number} freq1 - First frequency in Hz
     * @param {number} freq2 - Second frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume 0.0-1.0 (relative to masterVolume)
     */
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
        
        // Volume split between two oscillators
        const vol = this.masterVolume * volume * 0.5;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + duration);
        osc2.stop(ctx.currentTime + duration);
    }
    
    /**
     * Play white noise (useful for explosion/hit effects)
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume 0.0-1.0 (relative to masterVolume)
     */
    playNoise(duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = ctx.createGain();
        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Gain envelope
        const vol = this.masterVolume * volume;
        gainNode.gain.setValueAtTime(vol, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        noise.start(ctx.currentTime);
    }
    
    /**
     * Play a sequence of notes (useful for melodies)
     * @param {number[]} notes - Array of frequencies in Hz
     * @param {number} noteDuration - Duration of each note in seconds
     * @param {number} volume - Volume 0.0-1.0 (relative to masterVolume)
     */
    playSequence(notes, noteDuration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, noteDuration, volume);
            }, index * noteDuration * 1000);
        });
    }
    
    /**
     * Play a chord (multiple frequencies simultaneously)
     * @param {number[]} frequencies - Array of frequencies in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume 0.0-1.0 (relative to masterVolume)
     */
    playChord(frequencies, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        
        // Volume split among all frequencies
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
}

// ============================================
// USAGE EXAMPLE (commented out)
// ============================================
/*
const audio = new AudioSystem();

// Initialize on first user interaction (e.g., keydown, click)
document.addEventListener('keydown', () => {
    audio.init();
}, { once: true });

// Play sounds
audio.playBeep(440, 0.1, 0.5);                      // A4 note
audio.playDualTone(330, 440, 0.15, 0.6);            // Dual tone
audio.playNoise(0.1, 0.4);                          // Explosion effect
audio.playSequence([262, 330, 392], 0.12, 0.7);     // C-E-G melody
audio.playChord([262, 330, 392], 0.5, 0.6);         // C-E-G chord
*/
