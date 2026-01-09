// ============================================
// AUDIO SYSTEM - Flappy Bird V4 - MAXIMUM EDITION
// ============================================
// V4: PUSHING HARD - Every audio technique maximized
// Features: Multi-layered music, chord progressions, bass line,
// arpeggios, dynamic mixing, enhanced SFX with harmonics

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.musicVolume = 0.2;
        this.initialized = false;
        
        this.backgroundMusic = {
            playing: false,
            masterMusicGain: null,
            currentIntensity: 0,
            beatCount: 0
        };
        
        // V4: Pre-define musical scales and chords
        this.scales = {
            // C Major scale frequencies
            C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
            G4: 392.00, A4: 440.00, B4: 493.88,
            C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
            G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50
        };
        
        // V4: Chord progressions (I-V-vi-IV in C major)
        this.chordProgression = [
            ['C4', 'E4', 'G4'],  // C major
            ['G4', 'B4', 'D5'],  // G major
            ['A4', 'C5', 'E5'],  // A minor
            ['F4', 'A4', 'C5']   // F major
        ];
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.initialized = true;
            console.log('V4 Maximum Audio System initialized');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    }
    
    // ============================================
    // V4 ENHANCED SOUND EFFECTS
    // ============================================
    
    playFlap() {
        if (!this.initialized) return;
        const now = this.audioContext.currentTime;
        
        // V4: Multi-layered flap with harmonics
        // Layer 1: Main whoosh
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        const filter1 = this.audioContext.createBiquadFilter();
        
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(2000, now);
        filter1.frequency.exponentialRampToValueAtTime(4000, now + 0.08);
        
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.exponentialRampToValueAtTime(450, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        // Layer 2: Airy overtone
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(this.masterVolume * 0.08, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc2.start(now);
        osc2.stop(now + 0.12);
        
        // Layer 3: Subtle noise burst (wing flutter)
        this.playNoiseLayer(now, 0.08, this.masterVolume * 0.05);
    }
    
    playNoiseLayer(startTime, duration, volume) {
        // White noise for texture
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2000;
        noiseFilter.Q.value = 1;
        
        noise.buffer = buffer;
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noiseGain.gain.setValueAtTime(volume, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        noise.start(startTime);
        noise.stop(startTime + duration);
    }
    
    playScore() {
        if (!this.initialized) return;
        const now = this.audioContext.currentTime;
        
        // V4: Celebratory chord arpeggio
        const notes = [this.scales.C5, this.scales.E5, this.scales.G5, this.scales.C6];
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = i === 3 ? 'triangle' : 'sine';
            osc.frequency.value = freq;
            
            const noteStart = now + i * 0.04;
            gain.gain.setValueAtTime(0, noteStart);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.15, noteStart + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.25);
            
            osc.start(noteStart);
            osc.stop(noteStart + 0.3);
        });
        
        // V4: Add shimmer effect
        const shimmer = this.audioContext.createOscillator();
        const shimmerGain = this.audioContext.createGain();
        
        shimmer.connect(shimmerGain);
        shimmerGain.connect(this.audioContext.destination);
        
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(2000, now);
        shimmer.frequency.linearRampToValueAtTime(3000, now + 0.15);
        
        shimmerGain.gain.setValueAtTime(0, now);
        shimmerGain.gain.linearRampToValueAtTime(this.masterVolume * 0.03, now + 0.05);
        shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        shimmer.start(now);
        shimmer.stop(now + 0.2);
    }
    
    playHit() {
        if (!this.initialized) return;
        const now = this.audioContext.currentTime;
        
        // V4: Impact with sub-bass thump and distortion
        // Layer 1: Sub bass impact
        const sub = this.audioContext.createOscillator();
        const subGain = this.audioContext.createGain();
        
        sub.connect(subGain);
        subGain.connect(this.audioContext.destination);
        
        sub.type = 'sine';
        sub.frequency.setValueAtTime(80, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        
        subGain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        sub.start(now);
        sub.stop(now + 0.25);
        
        // Layer 2: Crunch/distortion layer
        const crunch = this.audioContext.createOscillator();
        const crunchGain = this.audioContext.createGain();
        const distortion = this.audioContext.createWaveShaper();
        
        distortion.curve = this.makeDistortionCurve(50);
        
        crunch.connect(distortion);
        distortion.connect(crunchGain);
        crunchGain.connect(this.audioContext.destination);
        
        crunch.type = 'sawtooth';
        crunch.frequency.setValueAtTime(150, now);
        crunch.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        
        crunchGain.gain.setValueAtTime(this.masterVolume * 0.2, now);
        crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        crunch.start(now);
        crunch.stop(now + 0.3);
        
        // Layer 3: Noise crash
        this.playNoiseLayer(now, 0.15, this.masterVolume * 0.15);
    }
    
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; ++i) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }
    
    playDie() {
        if (!this.initialized) return;
        const now = this.audioContext.currentTime;
        
        // V4: Dramatic death with descending minor chord
        const deathNotes = [this.scales.E5, this.scales.C5, this.scales.A4, this.scales.E4];
        
        deathNotes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + i * 0.1 + 0.4);
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.6);
        });
        
        // Sad warble
        const warble = this.audioContext.createOscillator();
        const warbleGain = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.frequency.value = 6;
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain);
        lfoGain.connect(warble.frequency);
        
        warble.connect(warbleGain);
        warbleGain.connect(this.audioContext.destination);
        
        warble.type = 'sine';
        warble.frequency.setValueAtTime(300, now);
        warble.frequency.exponentialRampToValueAtTime(80, now + 0.7);
        
        warbleGain.gain.setValueAtTime(this.masterVolume * 0.15, now);
        warbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        
        lfo.start(now);
        warble.start(now);
        lfo.stop(now + 0.7);
        warble.stop(now + 0.7);
    }
    
    // ============================================
    // V4 MAXIMUM MUSIC SYSTEM
    // ============================================
    
    startBackgroundMusic() {
        if (!this.initialized || this.backgroundMusic.playing) return;
        
        this.backgroundMusic.playing = true;
        this.backgroundMusic.beatCount = 0;
        
        // Master gain for music
        this.backgroundMusic.masterMusicGain = this.audioContext.createGain();
        this.backgroundMusic.masterMusicGain.connect(this.audioContext.destination);
        this.updateMusicVolume();
        
        // Start all music layers
        this.playMusicLoop();
    }
    
    playMusicLoop() {
        if (!this.backgroundMusic.playing) return;
        
        const now = this.audioContext.currentTime;
        const intensity = this.backgroundMusic.currentIntensity;
        const beat = this.backgroundMusic.beatCount % 32;
        const chordIndex = Math.floor(beat / 8) % 4;
        const currentChord = this.chordProgression[chordIndex];
        
        // V4: Dynamic tempo based on intensity
        const baseTempo = 350;
        const tempo = Math.max(200, baseTempo - (intensity * 4));
        
        // ====== LAYER 1: Bass Line (always plays) ======
        if (beat % 4 === 0) {
            this.playBassNote(currentChord[0], tempo * 2);
        }
        
        // ====== LAYER 2: Chord Pad (starts at score 5) ======
        if (intensity >= 5 && beat % 8 === 0) {
            this.playChordPad(currentChord, tempo * 4);
        }
        
        // ====== LAYER 3: Melody (starts at score 0) ======
        const melodyPattern = [0, 2, 1, 2, 0, 1, 2, 1];
        const melodyNote = melodyPattern[beat % 8];
        this.playMelodyNote(currentChord[melodyNote], tempo);
        
        // ====== LAYER 4: Arpeggio (starts at score 15) ======
        if (intensity >= 15 && beat % 2 === 0) {
            const arpNote = currentChord[beat % 3];
            this.playArpeggio(arpNote, tempo / 2);
        }
        
        // ====== LAYER 5: Hi-hat rhythm (starts at score 20) ======
        if (intensity >= 20) {
            this.playHiHat(tempo);
        }
        
        // ====== LAYER 6: Octave bass (starts at score 30) ======
        if (intensity >= 30 && beat % 4 === 2) {
            this.playBassNote(currentChord[0], tempo, true);
        }
        
        this.backgroundMusic.beatCount++;
        setTimeout(() => this.playMusicLoop(), tempo);
    }
    
    playBassNote(note, duration, octaveUp = false) {
        const freq = this.scales[note] / (octaveUp ? 1 : 2);
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.backgroundMusic.masterMusicGain);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
        
        osc.start(now);
        osc.stop(now + duration / 1000 + 0.1);
    }
    
    playChordPad(chord, duration) {
        const now = this.audioContext.currentTime;
        
        chord.forEach((note, i) => {
            const freq = this.scales[note];
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.backgroundMusic.masterMusicGain);
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
            gain.gain.setValueAtTime(0.06, now + duration / 1000 - 0.1);
            gain.gain.linearRampToValueAtTime(0.01, now + duration / 1000);
            
            osc.start(now);
            osc.stop(now + duration / 1000 + 0.1);
        });
    }
    
    playMelodyNote(note, duration) {
        const freq = this.scales[note] * 2; // Octave up
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.backgroundMusic.masterMusicGain);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000 * 0.8);
        
        osc.start(now);
        osc.stop(now + duration / 1000);
    }
    
    playArpeggio(note, duration) {
        const freq = this.scales[note] * 4; // Two octaves up
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.backgroundMusic.masterMusicGain);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
        
        osc.start(now);
        osc.stop(now + duration / 1000);
    }
    
    playHiHat(tempo) {
        const now = this.audioContext.currentTime;
        const duration = tempo / 1000 * 0.3;
        
        // Filtered noise for hi-hat
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const highpass = this.audioContext.createBiquadFilter();
        
        highpass.type = 'highpass';
        highpass.frequency.value = 8000;
        
        noise.buffer = buffer;
        noise.connect(highpass);
        highpass.connect(noiseGain);
        noiseGain.connect(this.backgroundMusic.masterMusicGain);
        
        noiseGain.gain.setValueAtTime(0.03, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        noise.start(now);
        noise.stop(now + duration);
    }
    
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
