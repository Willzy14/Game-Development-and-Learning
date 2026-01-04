// ============================================
// AUDIO SYSTEM (Third use - will extract to shared library after this)
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
    
    playNoise(duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = ctx.createGain();
        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const vol = this.masterVolume * volume;
        gainNode.gain.setValueAtTime(vol, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        
        noise.start(ctx.currentTime);
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
// SPACE INVADERS SOUND EFFECTS
// ============================================
const audio = new AudioSystem();

// Player shoot - Sharp high-pitched pew
function playPlayerShoot() {
    audio.playBeep(800, 0.08, 0.3);
}

// Enemy shoot - Lower ominous tone
function playEnemyShoot() {
    audio.playBeep(180, 0.12, 0.2);
}

// Enemy destroyed - Explosion-like
function playEnemyDestroy() {
    audio.playNoise(0.1, 0.4);
}

// Player hit - Dramatic descending tone
function playPlayerHit() {
    audio.playDualTone(400, 200, 0.3, 0.6);
}

// Wave complete - Triumphant ascending
function playWaveComplete() {
    const notes = [262, 330, 392, 523, 659]; // C, E, G, C, E
    audio.playSequence(notes, 0.12, 0.7);
}

// Game over - Sad descending
function playGameOver() {
    const notes = [392, 349, 330, 294, 262]; // G, F, E, D, C
    audio.playSequence(notes, 0.2, 0.7);
}

// Game start - Upbeat start
function playGameStart() {
    audio.playDualTone(330, 440, 0.12, 0.5);
}

// NEW - V2: Shield hit sound
function playShieldHit() {
    audio.playBeep(200, 0.05, 0.3);
}
