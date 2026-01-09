/**
 * TIME-SLICE RUNNER - AUDIO SYSTEM
 * 
 * Layered music system with intensity ramping
 * All sound effects for time manipulation, perfect landings, UI
 */

const AUDIO = {
    context: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    
    // Music tracks
    baseTrack: null,
    intensityTrack: null,
    intensityGain: null,
    
    // Settings
    volume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    
    // State
    musicPlaying: false,
    
    /**
     * Initialize Web Audio API
     */
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gain
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.context.destination);
            
            // Music gain
            this.musicGain = this.context.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);
            
            // SFX gain
            this.sfxGain = this.context.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);
            
            console.log('🔊 Audio system initialized');
        } catch (e) {
            console.warn('⚠️ Web Audio API not supported:', e);
        }
    },
    
    /**
     * Resume audio context (required after user interaction)
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },
    
    /**
     * Create oscillator-based tone
     */
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = type;
        osc.frequency.value = frequency;
        
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.context.currentTime + duration);
    },
    
    /**
     * Create noise burst
     */
    createNoise(duration, volume = 0.2) {
        if (!this.context) return;
        
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        noise.start();
    },
    
    /**
     * Start layered music with proper chord progressions
     */
    startMusic() {
        if (!this.context || this.musicPlaying) return;
        
        this.musicPlaying = true;
        this.beatIndex = 0;
        
        // Chord progression: Am - F - C - G (each 2 seconds)
        this.chords = [
            { name: 'Am', bass: 110,   notes: [110, 130.81, 164.81] }, // A2, C3, E3
            { name: 'F',  bass: 87.31, notes: [87.31, 110, 130.81] },  // F2, A2, C3
            { name: 'C',  bass: 65.41, notes: [65.41, 82.41, 98] },    // C2, E2, G2
            { name: 'G',  bass: 98,    notes: [98, 123.47, 146.83] }   // G2, B2, D3
        ];
        
        // Melody patterns (per chord)
        this.melodies = [
            [440, 523, 659, 523, 440, 392, 440, 523],      // Am: A4-C5-E5-C5-A4-G4-A4-C5
            [349, 440, 523, 440, 349, 329.63, 349, 440],   // F:  F4-A4-C5-A4-F4-E4-F4-A4
            [523, 659, 784, 659, 523, 494, 523, 659],      // C:  C5-E5-G5-E5-C5-B4-C5-E5
            [392, 494, 587, 494, 392, 349, 392, 494]       // G:  G4-B4-D5-B4-G4-F4-G4-B4
        ];
        
        // Play chord progression
        const playChord = () => {
            if (!this.musicPlaying) return;
            
            const chordIndex = Math.floor(this.beatIndex / 8) % 4;
            const chord = this.chords[chordIndex];
            
            // Play all 3 notes of the triad simultaneously
            chord.notes.forEach((freq, i) => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                const volume = i === 0 ? 0.15 : 0.08; // Bass louder
                gain.gain.value = volume;
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 1.8);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start();
                osc.stop(this.context.currentTime + 2);
            });
            
            setTimeout(playChord, 2000); // 2 seconds per chord
        };
        
        // Play melody over chords
        const playMelody = () => {
            if (!this.musicPlaying) return;
            
            const chordIndex = Math.floor(this.beatIndex / 8) % 4;
            const melody = this.melodies[chordIndex];
            const noteIndex = this.beatIndex % 8;
            const freq = melody[noteIndex];
            
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.value = 0.12;
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.25);
            
            this.beatIndex++;
            setTimeout(playMelody, 250); // 4 notes per second
        };
        
        // Add subtle rhythm (hi-hat)
        const playRhythm = () => {
            if (!this.musicPlaying) return;
            
            const bufferSize = this.context.sampleRate * 0.03;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.context.createBufferSource();
            const filter = this.context.createBiquadFilter();
            const gain = this.context.createGain();
            
            noise.buffer = buffer;
            filter.type = 'highpass';
            filter.frequency.value = 8000;
            
            gain.gain.value = 0.03;
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            noise.start();
            
            setTimeout(playRhythm, 250);
        };
        
        // Intensity layer (fades with game speed)
        this.intensityGain = this.context.createGain();
        this.intensityGain.gain.value = 0;
        this.intensityGain.connect(this.musicGain);
        
        // Start all layers
        playChord();
        playMelody();
        playRhythm();
        
        console.log('🎵 Music started - chord progression Am-F-C-G');
    },
    
    /**
     * Stop music
     */
    stopMusic() {
        if (!this.context || !this.musicPlaying) return;
        
        this.musicPlaying = false;
        console.log('🎵 Music stopped');
    },
    
    /**
     * Update intensity layer based on game speed
     */
    setMusicIntensity(intensity) {
        if (!this.context || !this.intensityGain) return;
        
        // Fade intensity layer (subtle background pad)
        const targetVolume = Math.min(0.05, intensity * 0.05);
        this.intensityGain.gain.linearRampToValueAtTime(
            targetVolume,
            this.context.currentTime + 0.5
        );
    },
    
    /**
     * SOUND EFFECTS
     */
    
    playJump() {
        this.createTone(400, 0.1, 'square', 0.2);
        setTimeout(() => this.createTone(600, 0.05, 'square', 0.1), 50);
    },
    
    playTimeSlice() {
        // Whoosh + pitch down
        this.createTone(800, 0.3, 'sawtooth', 0.15);
        if (this.context) {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.value = 800;
            osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.3);
            
            gain.gain.value = 0.15;
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.3);
        }
    },
    
    playTimeSliceEnd() {
        // Pitch up as time resumes
        this.createTone(200, 0.2, 'sawtooth', 0.1);
        if (this.context) {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.value = 200;
            osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.2);
            
            gain.gain.value = 0.1;
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.2);
        }
    },
    
    playPerfectLanding() {
        // Satisfying ding
        this.createTone(1200, 0.15, 'sine', 0.25);
        setTimeout(() => this.createTone(1600, 0.1, 'sine', 0.15), 50);
        setTimeout(() => this.createTone(2000, 0.08, 'sine', 0.1), 100);
    },
    
    playChronoRefill() {
        // Sparkly refill sound
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createTone(800 + i * 200, 0.05, 'sine', 0.08);
            }, i * 30);
        }
    },
    
    playLanding() {
        // Regular landing thud
        this.createNoise(0.08, 0.15);
        this.createTone(80, 0.1, 'sine', 0.2);
    },
    
    playDeath() {
        // Descending tones
        this.createTone(600, 0.3, 'sawtooth', 0.3);
        setTimeout(() => this.createTone(400, 0.3, 'sawtooth', 0.25), 100);
        setTimeout(() => this.createTone(200, 0.5, 'sawtooth', 0.2), 200);
        setTimeout(() => this.createNoise(0.5, 0.25), 250);
    },
    
    playMilestone() {
        // Achievement fanfare
        this.createTone(800, 0.15, 'square', 0.2);
        setTimeout(() => this.createTone(1000, 0.15, 'square', 0.2), 100);
        setTimeout(() => this.createTone(1200, 0.2, 'square', 0.25), 200);
    },
    
    playUISelect() {
        this.createTone(600, 0.1, 'square', 0.15);
        setTimeout(() => this.createTone(800, 0.1, 'square', 0.1), 50);
    },
    
    playModeUnlock() {
        // Special unlock sound
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createTone(400 + i * 150, 0.1, 'sine', 0.15);
            }, i * 60);
        }
    },
    
    /**
     * Volume control
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    },
    
    getVolume() {
        return this.volume;
    }
};
