// ============================================
// AUDIO.JS - SOUNDS ONLY (DEFAULT FLAPPY THEME)
// ============================================
// This file contains ALL audio code:
//    - Sound effects (flap, score, hit, die)
//    - Background music
//    - Volume control
//
// ❌ NO visual rendering
// ❌ NO game logic or state changes
// ❌ NO game constants
//
// To create a new audio theme:
// 1. Copy this file
// 2. Change the sounds/music
// 3. Keep all function signatures the same
// ============================================

const AUDIO = {
    ctx: null,
    initialized: false,
    masterVolume: 0.3,
    musicVolume: 0.15,
    
    backgroundMusic: {
        playing: false,
        oscillators: [],
        masterMusicGain: null
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
            console.log('Audio system initialized');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    },
    
    // ============================================
    // SOUND EFFECTS (Required interface)
    // ============================================
    
    playFlap() {
        if (!this.initialized) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        // Quick upward swoop
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    
    playScore() {
        if (!this.initialized) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        // Happy ding
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    },
    
    playHit() {
        if (!this.initialized) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        
        // Harsh downward crash
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    
    playDie() {
        if (!this.initialized) return;
        
        // Sad falling sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },
    
    // ============================================
    // BACKGROUND MUSIC
    // ============================================
    
    startBackgroundMusic() {
        if (!this.initialized || this.backgroundMusic.playing) return;
        
        this.backgroundMusic.playing = true;
        this.backgroundMusic.oscillators = [];
        
        // Master gain for music
        this.backgroundMusic.masterMusicGain = this.ctx.createGain();
        this.backgroundMusic.masterMusicGain.connect(this.ctx.destination);
        this.updateMusicVolume();
        
        // Simple cheerful melody - C major scale pattern
        const notes = [523.25, 587.33, 659.25, 698.46]; // C5, D5, E5, F5
        const pattern = [0, 2, 1, 3, 2, 0, 2, 1];
        
        const playNote = (index) => {
            if (!this.backgroundMusic.playing) return;
            
            const freq = notes[pattern[index % pattern.length]];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.backgroundMusic.masterMusicGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.15);
            gain.gain.linearRampToValueAtTime(0, now + 0.25);
            
            osc.start(now);
            osc.stop(now + 0.25);
            
            // Schedule next note
            setTimeout(() => {
                if (this.backgroundMusic.playing) {
                    playNote(index + 1);
                }
            }, 250);
        };
        
        // Start playing
        playNote(0);
    },
    
    stopBackgroundMusic() {
        this.backgroundMusic.playing = false;
        
        // Stop all oscillators
        this.backgroundMusic.oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.backgroundMusic.oscillators = [];
    },
    
    updateMusicVolume() {
        if (this.backgroundMusic.masterMusicGain) {
            this.backgroundMusic.masterMusicGain.gain.value = this.musicVolume;
        }
    },
    
    // ============================================
    // CONTROLS
    // ============================================
    
    setMasterVolume(value) {
        this.masterVolume = value / 100;
    },
    
    setMusicVolume(value) {
        this.musicVolume = (value / 100) * 0.3;
        this.updateMusicVolume();
    },
    
    toggleMute() {
        this.masterVolume = this.masterVolume > 0 ? 0 : 0.3;
        return this.masterVolume === 0;
    }
};
