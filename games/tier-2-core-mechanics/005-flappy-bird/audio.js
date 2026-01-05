// ============================================
// AUDIO SYSTEM - Flappy Bird
// ============================================
// Advancing Tier 1 audio skills with adaptive music

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.musicVolume = 0.15;
        this.initialized = false;
        
        this.backgroundMusic = {
            playing: false,
            oscillators: [],
            masterMusicGain: null,
            currentIntensity: 0
        };
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    }
    
    // Sound Effects
    playFlap() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        // Quick upward swoop
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    playScore() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        // Happy ding
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.05);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    playHit() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        
        // Harsh downward crash
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    playDie() {
        if (!this.initialized) return;
        
        // Sad falling sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Background Music - Adaptive intensity
    startBackgroundMusic() {
        if (!this.initialized || this.backgroundMusic.playing) return;
        
        this.backgroundMusic.playing = true;
        this.backgroundMusic.oscillators = [];
        
        // Master gain for music
        this.backgroundMusic.masterMusicGain = this.audioContext.createGain();
        this.backgroundMusic.masterMusicGain.connect(this.audioContext.destination);
        this.updateMusicVolume();
        
        // Simple cheerful melody - C major scale pattern
        const notes = [523.25, 587.33, 659.25, 698.46]; // C5, D5, E5, F5
        const pattern = [0, 2, 1, 3, 2, 0, 2, 1]; // Melodic pattern
        
        const playNote = (index) => {
            if (!this.backgroundMusic.playing) return;
            
            const freq = notes[pattern[index % pattern.length]];
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.backgroundMusic.masterMusicGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + 0.25);
            
            osc.start(now);
            osc.stop(now + 0.3);
            
            // Schedule next note
            setTimeout(() => playNote(index + 1), 300);
        };
        
        playNote(0);
    }
    
    stopBackgroundMusic() {
        this.backgroundMusic.playing = false;
        
        if (this.backgroundMusic.masterMusicGain) {
            const now = this.audioContext.currentTime;
            this.backgroundMusic.masterMusicGain.gain.linearRampToValueAtTime(0, now + 0.5);
        }
    }
    
    setMasterVolume(value) {
        this.masterVolume = value / 100;
        this.updateMusicVolume();
    }
    
    setMusicVolume(value) {
        this.musicVolume = value / 100;
        this.updateMusicVolume();
    }
    
    updateMusicVolume() {
        if (this.backgroundMusic.masterMusicGain) {
            const effectiveVolume = this.masterVolume * this.musicVolume;
            this.backgroundMusic.masterMusicGain.gain.setValueAtTime(
                effectiveVolume,
                this.audioContext.currentTime
            );
        }
    }
}

// Global audio instance
const audio = new AudioSystem();
