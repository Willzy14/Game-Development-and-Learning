// ============================================
// JUNGLE AUDIO - SOUNDS ONLY
// ============================================
// Jungle/Rainforest themed audio:
//    - Bird calls and chirps
//    - Ambient jungle atmosphere
//    - Wooden/natural sounds
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
    musicVolume: 0.25,
    
    backgroundMusic: {
        playing: false,
        ambientNodes: []
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
            console.log('🌴 Jungle Audio System initialized');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    },
    
    // ============================================
    // UTILITY - Create bird chirp
    // ============================================
    
    createChirp(startFreq, endFreq, duration, delay = 0) {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.3);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.9, now + duration);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
    },
    
    // ============================================
    // SOUND EFFECTS (Required interface)
    // ============================================
    
    // Flap - Bird wing flutter
    playFlap() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        
        // Wing flutter noise
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            // Filtered noise for soft flutter
            data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        
        const gain = this.ctx.createGain();
        gain.gain.value = this.masterVolume * 0.3;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
        
        // Add a quick chirp
        this.createChirp(1200, 1800, 0.08);
    },
    
    // Score - Happy bird call
    playScore() {
        if (!this.initialized) return;
        
        // Ascending tropical bird call
        this.createChirp(800, 1200, 0.1, 0);
        this.createChirp(1000, 1400, 0.1, 0.08);
        this.createChirp(1200, 1600, 0.15, 0.16);
    },
    
    // Hit - Branch/wood thud
    playHit() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        
        // Low woody thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.25);
        
        // Leaf rustle
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = this.masterVolume * 0.2;
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        
        noise.start(now);
    },
    
    // Die - Sad descending bird call
    playDie() {
        if (!this.initialized) return;
        
        // Descending sad chirps
        this.createChirp(1200, 800, 0.2, 0);
        this.createChirp(900, 500, 0.25, 0.15);
        this.createChirp(600, 300, 0.3, 0.35);
    },
    
    // ============================================
    // BACKGROUND MUSIC - Jungle Ambiance
    // ============================================
    
    startBackgroundMusic() {
        if (!this.initialized || this.backgroundMusic.playing) return;
        
        this.backgroundMusic.playing = true;
        
        // Start ambient layers
        this.startJungleAmbience();
        this.scheduleRandomBirdCalls();
    },
    
    startJungleAmbience() {
        if (!this.backgroundMusic.playing) return;
        
        const now = this.ctx.currentTime;
        
        // Soft wind/rustle noise
        const bufferSize = this.ctx.sampleRate * 3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        filter.Q.value = 0.5;
        
        // LFO for wind variation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        const gain = this.ctx.createGain();
        gain.gain.value = this.musicVolume * 0.15;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start();
        lfo.start();
        
        this.backgroundMusic.ambientNodes.push(noise, lfo);
    },
    
    scheduleRandomBirdCalls() {
        if (!this.backgroundMusic.playing) return;
        
        // Random bird call
        const birdTypes = [
            () => { // High chirp
                this.createChirp(2000, 2500, 0.1, 0);
                this.createChirp(2200, 2800, 0.08, 0.12);
            },
            () => { // Low coo
                this.createChirp(400, 350, 0.3, 0);
                this.createChirp(380, 320, 0.35, 0.35);
            },
            () => { // Tropical warble
                for (let i = 0; i < 4; i++) {
                    this.createChirp(1500 + i * 100, 1700 + i * 100, 0.06, i * 0.08);
                }
            }
        ];
        
        // Play random bird
        const bird = birdTypes[Math.floor(Math.random() * birdTypes.length)];
        
        // Lower volume for ambient birds
        const originalVolume = this.masterVolume;
        this.masterVolume = this.musicVolume * 0.3;
        bird();
        this.masterVolume = originalVolume;
        
        // Schedule next bird call (3-8 seconds)
        const delay = 3000 + Math.random() * 5000;
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                this.scheduleRandomBirdCalls();
            }
        }, delay);
    },
    
    stopBackgroundMusic() {
        this.backgroundMusic.playing = false;
        
        // Stop all ambient nodes
        this.backgroundMusic.ambientNodes.forEach(node => {
            try { node.stop(); } catch (e) {}
        });
        this.backgroundMusic.ambientNodes = [];
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
