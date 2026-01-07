// ============================================
// EGYPT AUDIO - SOUNDS ONLY
// ============================================
// Egyptian/Middle Eastern themed audio:
//    - Phrygian Dominant scale
//    - Oud-like plucked sounds
//    - Desert reverb atmosphere
//
// ❌ NO visual rendering
// ❌ NO game logic or state changes
// ❌ NO game constants
//
// Implements same interface as base audio.js
// ============================================

const AUDIO = {
    ctx: null,
    initialized: false,
    masterVolume: 0.4,
    musicVolume: 0.3,
    
    // Musical scale - Phrygian Dominant (Arabic)
    baseFreq: 110, // A2
    scale: [0, 1, 4, 5, 7, 8, 10], // Semitones
    
    backgroundMusic: {
        playing: false,
        schedulerInterval: null
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    init() {
        if (this.initialized) return;
        
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            
            this.initialized = true;
            console.log('Egyptian Audio System initialized');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    },
    
    // ============================================
    // UTILITY - Scale to frequency
    // ============================================
    
    noteToFreq(scaleIndex, octaveOffset = 0) {
        const semitone = this.scale[scaleIndex % this.scale.length];
        const octave = Math.floor(scaleIndex / this.scale.length) + octaveOffset;
        return this.baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
    },
    
    // ============================================
    // SOUND EFFECTS (Required interface)
    // ============================================
    
    // Flap - Oud pluck sound
    playFlap() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        const freq = this.noteToFreq(Math.floor(Math.random() * 5), 2);
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        // Plucked envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
    },
    
    // Score - Ascending Middle Eastern flourish
    playScore() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        const notes = [0, 2, 4]; // Scale degrees
        
        notes.forEach((note, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = this.noteToFreq(note, 2);
            
            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    },
    
    // Hit - Stone crash
    playHit() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        
        // Noise burst for stone impact
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        const gain = this.ctx.createGain();
        gain.gain.value = this.masterVolume * 0.5;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
    },
    
    // Die - Descending minor scale
    playDie() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        const notes = [6, 4, 2, 0]; // Descending scale degrees
        
        notes.forEach((note, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = this.noteToFreq(note, 1);
            
            const startTime = now + i * 0.15;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    },
    
    // ============================================
    // BACKGROUND MUSIC - Hypnotic Desert
    // ============================================
    
    startBackgroundMusic() {
        if (!this.initialized || this.backgroundMusic.playing) return;
        
        this.backgroundMusic.playing = true;
        
        // Simple drone music
        this.playDrone();
        this.scheduleRhythm();
    },
    
    playDrone() {
        if (!this.backgroundMusic.playing) return;
        
        const now = this.ctx.currentTime;
        
        // Low drone on root note
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = this.baseFreq; // A2
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.musicVolume * 0.2, now + 0.5);
        gain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, now + 3);
        gain.gain.linearRampToValueAtTime(0, now + 4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 4);
        
        // Schedule next drone
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                this.playDrone();
            }
        }, 3500);
    },
    
    scheduleRhythm() {
        if (!this.backgroundMusic.playing) return;
        
        const now = this.ctx.currentTime;
        const beatDuration = 60 / 90; // 90 BPM
        
        // Simple melodic pattern
        const pattern = [0, 4, 2, 5, 4, 2, 0, 1];
        
        pattern.forEach((note, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = this.noteToFreq(note, 2);
            
            const startTime = now + i * beatDuration * 0.5;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
        
        // Schedule next pattern
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                this.scheduleRhythm();
            }
        }, pattern.length * beatDuration * 500);
    },
    
    stopBackgroundMusic() {
        this.backgroundMusic.playing = false;
    },
    
    // ============================================
    // CONTROLS
    // ============================================
    
    setMasterVolume(value) {
        this.masterVolume = value / 100;
    },
    
    setMusicVolume(value) {
        this.musicVolume = (value / 100) * 0.5;
    },
    
    toggleMute() {
        this.masterVolume = this.masterVolume > 0 ? 0 : 0.4;
        return this.masterVolume === 0;
    }
};
