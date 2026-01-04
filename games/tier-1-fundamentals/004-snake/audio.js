// ============================================
// AUDIO SYSTEM
// ============================================
// Using Web Audio API to generate sounds programmatically
// No external audio files needed - all sounds synthesized in code

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3;
        this.musicVolume = 0.15; // Separate volume for background music
        this.initialized = false;
        
        // Background music system
        this.backgroundMusic = {
            playing: false,
            padOscillators: [],
            bassOscillator: null,
            bassGain: null,
            padGain: null,
            melodyInterval: null,
            textureInterval: null,
            currentChordIndex: 0,
            masterMusicGain: null // Store reference to update volume
        };
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
    
    // ============================================
    // BACKGROUND MUSIC - Procedural Ambient Space Atmosphere
    // ============================================
    
    startBackgroundMusic() {
        if (!this.enabled || !this.initialized || this.backgroundMusic.playing) return;
        
        console.log('Starting ambient space music...');
        this.backgroundMusic.playing = true;
        
        const ctx = this.audioContext;
        
        // Create master gain for background music (controlled by musicVolume setting)
        const masterMusicGain = ctx.createGain();
        masterMusicGain.gain.setValueAtTime(this.masterVolume * this.musicVolume, ctx.currentTime);
        masterMusicGain.connect(ctx.destination);
        
        // Store reference to update volume later
        this.backgroundMusic.masterMusicGain = masterMusicGain;
        
        // Layer 1: Deep Bass Drone (rumbling space atmosphere)
        this.createBassLayer(masterMusicGain);
        
        // Layer 2: Ambient Pad (evolving chord progression)
        this.createPadLayer(masterMusicGain);
        
        // Layer 3: Melodic Elements (occasional notes, pentatonic scale)
        this.createMelodyLayer(masterMusicGain);
        
        // Layer 4: Texture (subtle shimmer and atmosphere)
        this.createTextureLayer(masterMusicGain);
    }
    
    createBassLayer(destination) {
        const ctx = this.audioContext;
        
        // Deep bass oscillator (40-60 Hz range - felt more than heard)
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(45, ctx.currentTime); // Very low A
        
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 5); // Slow fade in
        
        bassOsc.connect(bassGain);
        bassGain.connect(destination);
        
        bassOsc.start(ctx.currentTime);
        
        // Store for later cleanup
        this.backgroundMusic.bassOscillator = bassOsc;
        this.backgroundMusic.bassGain = bassGain;
        
        // Slowly modulate bass frequency for movement
        this.modulateBass();
    }
    
    modulateBass() {
        if (!this.backgroundMusic.playing) return;
        
        const ctx = this.audioContext;
        const bass = this.backgroundMusic.bassOscillator;
        const currentTime = ctx.currentTime;
        
        // Slowly drift between 40-55 Hz
        const targetFreq = 40 + Math.random() * 15;
        bass.frequency.linearRampToValueAtTime(targetFreq, currentTime + 8);
        
        // Schedule next modulation
        setTimeout(() => this.modulateBass(), 8000);
    }
    
    createPadLayer(destination) {
        const ctx = this.audioContext;
        
        // Space-themed chord progression (ambient, no minor/major, just intervals)
        // Using frequencies that create ethereal atmosphere
        const chordProgressions = [
            [220, 330, 440],      // A2, E3, A3 - open fifth + octave
            [196, 293.66, 392],   // G2, D3, G3
            [246.94, 369.99, 493.88], // B2, F#3, B3
            [261.63, 392, 523.25]     // C3, G3, C4
        ];
        
        this.backgroundMusic.padGain = ctx.createGain();
        this.backgroundMusic.padGain.gain.setValueAtTime(0, ctx.currentTime);
        this.backgroundMusic.padGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3);
        this.backgroundMusic.padGain.connect(destination);
        
        // Start with first chord
        this.playChord(chordProgressions[0]);
        
        // Change chords slowly
        this.chordChangeInterval = setInterval(() => {
            if (!this.backgroundMusic.playing) return;
            
            this.backgroundMusic.currentChordIndex = 
                (this.backgroundMusic.currentChordIndex + 1) % chordProgressions.length;
            
            const nextChord = chordProgressions[this.backgroundMusic.currentChordIndex];
            this.transitionChord(nextChord);
        }, 12000); // Change chord every 12 seconds
    }
    
    playChord(frequencies) {
        const ctx = this.audioContext;
        const padGain = this.backgroundMusic.padGain;
        
        // Stop existing oscillators
        this.backgroundMusic.padOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        this.backgroundMusic.padOscillators = [];
        
        // Create new chord
        frequencies.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = 'sine'; // Pure sine for ethereal quality
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.connect(padGain);
            osc.start(ctx.currentTime);
            
            this.backgroundMusic.padOscillators.push(osc);
        });
    }
    
    transitionChord(newFrequencies) {
        const ctx = this.audioContext;
        const currentTime = ctx.currentTime;
        
        // Fade out current chord
        this.backgroundMusic.padGain.gain.linearRampToValueAtTime(0, currentTime + 1);
        
        // After fade out, switch to new chord and fade in
        setTimeout(() => {
            if (!this.backgroundMusic.playing) return;
            this.playChord(newFrequencies);
            this.backgroundMusic.padGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);
        }, 1000);
    }
    
    createMelodyLayer(destination) {
        // Pentatonic scale in A minor (space-like, no dissonance)
        // A, C, D, E, G - works over any of our chords
        const pentatonicScale = [
            440,    // A4
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99  // G5
        ];
        
        // Play occasional melodic notes (not too frequent)
        this.backgroundMusic.melodyInterval = setInterval(() => {
            if (!this.backgroundMusic.playing) return;
            
            // 60% chance to play a note
            if (Math.random() > 0.4) {
                const note = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
                this.playMelodyNote(note, destination);
            }
        }, 4000); // Check every 4 seconds
    }
    
    playMelodyNote(frequency, destination) {
        const ctx = this.audioContext;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle'; // Softer than sine, more character
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2); // Long decay
        
        osc.connect(gain);
        gain.connect(destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2);
    }
    
    createTextureLayer(destination) {
        // Subtle high-frequency shimmer for space atmosphere
        this.backgroundMusic.textureInterval = setInterval(() => {
            if (!this.backgroundMusic.playing) return;
            
            // Occasional sparkle/shimmer
            if (Math.random() > 0.7) {
                this.playShimmer(destination);
            }
        }, 3000);
    }
    
    playShimmer(destination) {
        const ctx = this.audioContext;
        
        // High frequency sparkle
        const freq = 2000 + Math.random() * 2000; // 2-4 kHz
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    }
    
    stopBackgroundMusic() {
        if (!this.backgroundMusic.playing) return;
        
        console.log('Stopping background music...');
        this.backgroundMusic.playing = false;
        
        // Stop bass
        if (this.backgroundMusic.bassOscillator) {
            try {
                this.backgroundMusic.bassOscillator.stop();
            } catch (e) {}
        }
        
        // Stop pad oscillators
        this.backgroundMusic.padOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        
        // Clear intervals
        if (this.backgroundMusic.melodyInterval) {
            clearInterval(this.backgroundMusic.melodyInterval);
        }
        if (this.backgroundMusic.textureInterval) {
            clearInterval(this.backgroundMusic.textureInterval);
        }
        if (this.chordChangeInterval) {
            clearInterval(this.chordChangeInterval);
        }
        
        // Reset
        this.backgroundMusic.padOscillators = [];
        this.backgroundMusic.bassOscillator = null;
    }
}

// Create global audio instance
const audio = new AudioSystem();

// ============================================
// GAME SOUND EFFECTS
// ============================================

function playEatSound() {
    // Happy "nom" sound - rising dual tone
    audio.playDualTone(400, 600, 0.1, 0.8);
}

function playDeathSound() {
    // Descending sad tone
    if (!audio.enabled || !audio.initialized) return;
    
    const ctx = audio.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    
    // Descending frequency
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(audio.masterVolume * 0.6, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
}

function playGameStart() {
    // Ascending cheerful notes
    audio.playBeep(262, 0.1, 0.5); // C
    setTimeout(() => audio.playBeep(330, 0.1, 0.5), 80); // E
    setTimeout(() => audio.playBeep(392, 0.15, 0.6), 160); // G
}

function playPowerUpSound() {
    // Magical ascending arpeggio
    audio.playBeep(523, 0.08, 0.6); // C high
    setTimeout(() => audio.playBeep(659, 0.08, 0.6), 60); // E high
    setTimeout(() => audio.playBeep(784, 0.08, 0.6), 120); // G high
    setTimeout(() => audio.playBeep(1047, 0.12, 0.7), 180); // C higher
}

function playComboSound(multiplier) {
    // Higher pitch for higher combos
    const basePitch = 440 + (multiplier * 100);
    audio.playDualTone(basePitch, basePitch + 200, 0.15, 0.7);
    
    // Add extra ding for big combos
    if (multiplier >= 5) {
        setTimeout(() => audio.playBeep(1200, 0.1, 0.6), 100);
    }
}

function playDirectionChange() {
    // Quick subtle blip when changing direction
    audio.playBeep(800, 0.03, 0.3);
}

function playMilestoneSound() {
    // Triumphant fanfare for reaching milestones
    audio.playBeep(523, 0.12, 0.7); // C
    setTimeout(() => audio.playBeep(659, 0.12, 0.7), 100); // E
    setTimeout(() => audio.playBeep(784, 0.12, 0.7), 200); // G
    setTimeout(() => audio.playBeep(1047, 0.2, 0.8), 300); // C high
    setTimeout(() => audio.playBeep(1319, 0.25, 0.8), 450); // E high
}

function playSpeedRamp() {
    // Whoosh sound with rising pitch for speed boost
    if (!audio.enabled || !audio.initialized) return;
    
    const ctx = audio.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    
    // Rising frequency
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(audio.masterVolume * 0.5, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
}

// Add method to AudioSystem to update music volume in real-time
AudioSystem.prototype.updateMusicVolume = function() {
    if (this.backgroundMusic.masterMusicGain) {
        const newVolume = this.masterVolume * this.musicVolume;
        this.backgroundMusic.masterMusicGain.gain.setValueAtTime(newVolume, this.audioContext.currentTime);
    }
};
