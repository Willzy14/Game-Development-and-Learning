// ============================================
// INCA TEMPLE AUDIO - Andean Soundscape
// ============================================
// Ambient sounds + Game effects inspired by Andes mountains

class IncaAudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.4;
        this.initialized = false;
        this.ambientNodes = [];
        this.ambientPlaying = false;
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Inca audio system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }
    
    // ========================================
    // AMBIENT SOUNDSCAPE
    // ========================================
    
    startAmbient() {
        if (!this.enabled || !this.initialized || this.ambientPlaying) return;
        
        this.ambientPlaying = true;
        
        // Wind through mountains
        this.createWindSound();
        
        // Distant pan flute drone
        this.createPanFluteDrone();
        
        // Occasional bird calls
        this.scheduleBirdCalls();
    }
    
    stopAmbient() {
        this.ambientPlaying = false;
        this.ambientNodes.forEach(node => {
            try {
                node.stop();
            } catch (e) {}
        });
        this.ambientNodes = [];
    }
    
    createWindSound() {
        if (!this.ambientPlaying) return;
        
        const ctx = this.audioContext;
        
        // White noise filtered to sound like wind
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        // Bandpass filter for wind character
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.5;
        
        // LFO for wind gusts
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.1; // Slow wind variation
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        // Volume control
        const gain = ctx.createGain();
        gain.gain.value = this.masterVolume * 0.15;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
        lfo.start();
        
        this.ambientNodes.push(noise, lfo);
    }
    
    createPanFluteDrone() {
        if (!this.ambientPlaying) return;
        
        const ctx = this.audioContext;
        
        // Pentatonic scale common in Andean music
        // E minor pentatonic: E, G, A, B, D
        const droneFreqs = [164.81, 196.00, 220.00]; // E3, G3, A3
        
        droneFreqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Slow vibrato
            const vibrato = ctx.createOscillator();
            const vibratoGain = ctx.createGain();
            vibrato.frequency.value = 4 + i * 0.5;
            vibratoGain.gain.value = freq * 0.01;
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            // Volume envelope with slow swell
            const gain = ctx.createGain();
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(
                this.masterVolume * 0.08, 
                ctx.currentTime + 3 + i
            );
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            vibrato.start();
            
            this.ambientNodes.push(osc, vibrato);
        });
    }
    
    scheduleBirdCalls() {
        if (!this.ambientPlaying) return;
        
        // Random bird call every 5-15 seconds
        const delay = 5000 + Math.random() * 10000;
        
        setTimeout(() => {
            if (this.ambientPlaying) {
                this.playCondorCall();
                this.scheduleBirdCalls();
            }
        }, delay);
    }
    
    playCondorCall() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // High-pitched descending call
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.8);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.1, now + 0.05);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.05, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.8);
    }
    
    // ========================================
    // GAME SOUND EFFECTS (Inca themed)
    // ========================================
    
    playPaddleHit() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Wooden drum hit (like a Bombo drum)
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playWallBounce() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Stone click
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 800 + Math.random() * 200;
        
        // Filter for stone character
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 5;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playBrickBreak(row) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Stone crumbling + pentatonic note based on row
        // Pentatonic: E, G, A, B, D (higher rows = higher notes)
        const pentatonic = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25];
        const freq = pentatonic[row % pentatonic.length];
        
        // Melodic tone (like a quena flute)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;
        
        // Overtone
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(this.masterVolume * 0.15, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain2);
        gain.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.2);
        
        // Stone crumble noise
        this.playStoneDebris();
    }
    
    playStoneDebris() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Short noise burst for debris
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        const gain = ctx.createGain();
        gain.gain.value = this.masterVolume * 0.15;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start(now);
    }
    
    playLevelComplete() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Triumphant Andean fanfare - ascending pentatonic
        const notes = [329.63, 392.00, 440.00, 523.25, 659.25, 783.99];
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const gain = ctx.createGain();
            const startTime = now + i * 0.15;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }
    
    playLoseLife() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Descending minor third - mournful sound
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.linearRampToValueAtTime(329.63, now + 0.3); // E4
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    playGameOver() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Sad descending minor scale
        const notes = [392, 349.23, 329.63, 293.66, 261.63]; // G, F, E, D, C
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const gain = ctx.createGain();
            const startTime = now + i * 0.25;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
        
        this.stopAmbient();
    }
    
    playGameStart() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Quick ascending fifth (like a horn call)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.setValueAtTime(493.88, now + 0.15); // B4
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + 0.02);
        gain.gain.setValueAtTime(this.masterVolume * 0.4, now + 0.15);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + 0.17);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.4);
        
        // Start ambient after game starts
        setTimeout(() => this.startAmbient(), 500);
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAmbient();
        } else if (this.initialized) {
            this.startAmbient();
        }
        return this.enabled;
    }
}

// Create global audio instance
const incaAudio = new IncaAudioSystem();
