// ============================================
// AUDIO SYSTEM - Flappy Bird V2 - MASTERY EDITION
// ============================================
// V2: Enhanced with adaptive music intensity and layered melodies

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
        
        // V2: Enhanced melody with more sophisticated pattern
        const notes = [
            523.25, 587.33, 659.25, 698.46, // C5, D5, E5, F5
            783.99, 880.00, 987.77, 1046.50  // G5, A5, B5, C6
        ];
        const melody = [0, 2, 4, 2, 3, 1, 2, 0]; // Main melody pattern
        const harmony = [0, 0, 2, 2, 1, 1, 0, 0]; // Harmony pattern (lower notes)
        
        let noteIndex = 0;
        
        const playNote = () => {
            if (!this.backgroundMusic.playing) return;
            
            const index = noteIndex % melody.length;
            
            // Main melody
            const freq1 = notes[melody[index]];
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            
            osc1.connect(gain1);
            gain1.connect(this.backgroundMusic.masterMusicGain);
            
            osc1.type = 'sine';
            osc1.frequency.value = freq1;
            
            const now = this.audioContext.currentTime;
            gain1.gain.setValueAtTime(0, now);
            gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
            gain1.gain.linearRampToValueAtTime(0, now + 0.35);
            
            osc1.start(now);
            osc1.stop(now + 0.4);
            
            // V2: Add harmony layer (every other note at higher scores)
            if (index % 2 === 0 && this.backgroundMusic.currentIntensity > 10) {
                const freq2 = notes[harmony[index]];
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();
                
                osc2.connect(gain2);
                gain2.connect(this.backgroundMusic.masterMusicGain);
                
                osc2.type = 'triangle';
                osc2.frequency.value = freq2;
                
                gain2.gain.setValueAtTime(0, now);
                gain2.gain.linearRampToValueAtTime(0.06, now + 0.05);
                gain2.gain.linearRampToValueAtTime(0, now + 0.35);
                
                osc2.start(now);
                osc2.stop(now + 0.4);
            }
            
            noteIndex++;
            
            // V2: Speed up tempo based on intensity (score)
            const tempo = Math.max(250, 400 - (this.backgroundMusic.currentIntensity * 5));
            setTimeout(playNote, tempo);
        };
        
        playNote();
    }
    
    // V2: Update music intensity based on score
    setMusicIntensity(score) {
        this.backgroundMusic.currentIntensity = score;
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
