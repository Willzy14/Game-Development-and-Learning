// ============================================
// FLAPPY SCARAB - EGYPTIAN AUDIO SYSTEM
// ============================================
// Authentic Middle Eastern/Egyptian musical elements
// Phrygian Dominant scale, Oud, Ney flute, Tabla drums
// Hypnotic desert atmosphere

class EgyptianAudioSystem {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // Musical constants - Phrygian Dominant (Arabic) scale in A
        // A - Bb - C# - D - E - F - G
        this.baseFreq = 110; // A2
        this.scale = [0, 1, 4, 5, 7, 8, 10]; // Semitones from root
        
        // Extended scale for melodies (2 octaves)
        this.fullScale = [
            ...this.scale,
            ...this.scale.map(n => n + 12),
            ...this.scale.map(n => n + 24)
        ];
        
        // Rhythm settings
        this.bpm = 90; // Slower, more hypnotic
        this.beatDuration = 60 / this.bpm;
        
        // State
        this.isPlaying = false;
        this.intensity = 0.3;
        this.currentBeat = 0;
        this.schedulerInterval = null;
        this.nextNoteTime = 0;
        
        // Reverb for desert ambiance
        this.convolver = null;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.ctx.destination);
            
            // Music gain (for background music)
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.5;
            
            // SFX gain
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.8;
            this.sfxGain.connect(this.masterGain);
            
            // Create reverb for spacious desert sound
            await this.createDesertReverb();
            
            this.musicGain.connect(this.convolver);
            
            this.initialized = true;
            console.log('🏛️ Egyptian Audio System initialized');
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    }
    
    async createDesertReverb() {
        // Create impulse response for large, open desert space
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * 3; // 3 second reverb tail
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Exponential decay with early reflections
                const t = i / sampleRate;
                const decay = Math.exp(-3 * t);
                // Add some early reflections
                const earlyReflections = i < sampleRate * 0.1 ? 
                    Math.sin(i * 0.01) * 0.3 : 0;
                data[i] = (Math.random() * 2 - 1) * decay + earlyReflections;
            }
        }
        
        this.convolver = this.ctx.createConvolver();
        this.convolver.buffer = impulse;
        
        // Wet/dry mix
        const dryGain = this.ctx.createGain();
        dryGain.gain.value = 0.6;
        
        const wetGain = this.ctx.createGain();
        wetGain.gain.value = 0.4;
        
        this.convolver.connect(wetGain);
        wetGain.connect(this.masterGain);
        
        // Also connect dry signal
        this.dryGain = dryGain;
        dryGain.connect(this.masterGain);
        
        // Connect music to both
        this.musicGain.connect(dryGain);
    }
    
    // Convert scale degree to frequency
    noteToFreq(scaleIndex, octaveOffset = 0) {
        const semitone = this.fullScale[scaleIndex % this.fullScale.length];
        const octave = Math.floor(scaleIndex / this.scale.length) + octaveOffset;
        return this.baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
    }
    
    // ============================================
    // OUD (LUTE) SYNTHESIZER
    // ============================================
    playOud(freq, time, duration = 0.5, velocity = 0.7) {
        if (!this.initialized) return;
        
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        // Oud has a rich, plucked string sound
        // Use sawtooth with harmonics
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        // Second oscillator slightly detuned for richness
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2.01; // Slight detune on octave
        
        // Filter for warmth
        filter.type = 'lowpass';
        filter.frequency.value = freq * 4;
        filter.Q.value = 2;
        
        // Plucked envelope - sharp attack, quick decay
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(velocity * 0.4, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(velocity * 0.15, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        // Connect
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start(time);
        osc2.start(time);
        osc.stop(time + duration);
        osc2.stop(time + duration);
    }
    
    // ============================================
    // NEY FLUTE SYNTHESIZER
    // ============================================
    playNey(freq, time, duration = 1, velocity = 0.5) {
        if (!this.initialized) return;
        
        const osc = this.ctx.createOscillator();
        const noise = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        
        // Sine wave for pure flute tone
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Vibrato for expressive Middle Eastern style
        vibrato.type = 'sine';
        vibrato.frequency.value = 5 + Math.random() * 2; // 5-7 Hz vibrato
        vibratoGain.gain.value = freq * 0.02; // 2% pitch variation
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        // Breath noise component
        noise.type = 'sawtooth';
        noise.frequency.value = freq * 3;
        noiseGain.gain.value = 0.03;
        
        // Filter for breathy quality
        filter.type = 'bandpass';
        filter.frequency.value = freq * 2;
        filter.Q.value = 1;
        
        // Soft envelope with gradual attack (breath)
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(velocity * 0.25, time + 0.15);
        gain.gain.setValueAtTime(velocity * 0.25, time + duration - 0.2);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Connect
        osc.connect(filter);
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start(time);
        noise.start(time);
        vibrato.start(time);
        osc.stop(time + duration);
        noise.stop(time + duration);
        vibrato.stop(time + duration);
    }
    
    // ============================================
    // TABLA DRUMS SYNTHESIZER
    // ============================================
    playDrum(type, time, velocity = 0.7) {
        if (!this.initialized) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        switch(type) {
            case 'dum': // Low bass drum (Darbuka bass)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, time);
                osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
                gain.gain.setValueAtTime(velocity * 0.6, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                filter.frequency.value = 200;
                break;
                
            case 'tak': // High rim hit
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, time);
                osc.frequency.exponentialRampToValueAtTime(300, time + 0.05);
                gain.gain.setValueAtTime(velocity * 0.4, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
                filter.frequency.value = 2000;
                break;
                
            case 'ka': // Mid slap
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, time);
                osc.frequency.exponentialRampToValueAtTime(150, time + 0.03);
                gain.gain.setValueAtTime(velocity * 0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                filter.frequency.value = 1000;
                break;
                
            case 'finger': // Soft finger tap
                osc.type = 'sine';
                osc.frequency.value = 600;
                gain.gain.setValueAtTime(velocity * 0.15, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
                filter.frequency.value = 1500;
                break;
        }
        
        filter.type = 'lowpass';
        filter.Q.value = 1;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start(time);
        osc.stop(time + 0.5);
    }
    
    // ============================================
    // DRONE (TANPURA-STYLE)
    // ============================================
    startDrone() {
        if (!this.initialized || this.droneOsc) return;
        
        // Root drone
        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc2 = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        
        // Very low root note
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = this.baseFreq / 2; // A1
        
        // Fifth above for richness
        this.droneOsc2.type = 'sine';
        this.droneOsc2.frequency.value = this.baseFreq * 1.5; // E2
        
        this.droneGain.gain.value = 0;
        
        this.droneOsc.connect(this.droneGain);
        this.droneOsc2.connect(this.droneGain);
        this.droneGain.connect(this.musicGain);
        
        this.droneOsc.start();
        this.droneOsc2.start();
        
        // Fade in
        this.droneGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2);
    }
    
    stopDrone() {
        if (this.droneOsc) {
            this.droneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
            setTimeout(() => {
                this.droneOsc?.stop();
                this.droneOsc2?.stop();
                this.droneOsc = null;
                this.droneOsc2 = null;
            }, 1100);
        }
    }
    
    // ============================================
    // MUSIC SEQUENCER
    // ============================================
    startMusic() {
        if (!this.initialized || this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentBeat = 0;
        this.nextNoteTime = this.ctx.currentTime;
        
        this.startDrone();
        
        // Schedule ahead
        this.schedulerInterval = setInterval(() => this.scheduler(), 25);
    }
    
    stopMusic() {
        this.isPlaying = false;
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        this.stopDrone();
    }
    
    scheduler() {
        // Schedule notes ahead of time
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.scheduleNotes(this.currentBeat, this.nextNoteTime);
            this.nextNoteTime += this.beatDuration / 2; // Eighth notes
            this.currentBeat++;
        }
    }
    
    scheduleNotes(beat, time) {
        const bar = Math.floor(beat / 16); // 16 eighth notes per bar (4/4 time)
        const beatInBar = beat % 16;
        
        // Intensity affects what plays
        const playMelody = this.intensity > 0.3;
        const playNey = this.intensity > 0.5;
        const fullDrums = this.intensity > 0.4;
        
        // ============================================
        // DRUM PATTERN - Middle Eastern 4/4
        // ============================================
        // Classic Maqsoum rhythm: D--T--K-D-T-----
        const drumPattern = [
            'dum', null, null, 'tak', null, null, 'ka', null,
            'dum', null, 'tak', null, null, null, null, null
        ];
        
        // Embellished pattern for higher intensity
        const drumPatternFull = [
            'dum', null, 'finger', 'tak', null, 'finger', 'ka', 'finger',
            'dum', null, 'tak', 'finger', 'ka', null, 'finger', null
        ];
        
        const pattern = fullDrums ? drumPatternFull : drumPattern;
        if (pattern[beatInBar]) {
            this.playDrum(pattern[beatInBar], time, 0.5 + this.intensity * 0.3);
        }
        
        // ============================================
        // OUD MELODY - Hypnotic repeating pattern
        // ============================================
        if (playMelody) {
            // 4-bar melodic cycle
            const melodyPatterns = [
                // Bar 1: Ascending
                [0, null, 2, null, 3, null, 4, null, 5, null, 4, null, 3, null, 2, null],
                // Bar 2: Descending with ornament
                [4, null, 3, 4, 3, null, 2, null, 1, null, 0, null, 1, null, 2, null],
                // Bar 3: Jump and return
                [0, null, 4, null, 3, null, 2, null, 5, null, 4, null, 2, null, 0, null],
                // Bar 4: Resolution
                [2, null, 1, null, 0, null, null, null, 0, null, null, null, null, null, null, null]
            ];
            
            const patternBar = bar % 4;
            const note = melodyPatterns[patternBar][beatInBar];
            
            if (note !== null) {
                const freq = this.noteToFreq(note + 7, 0); // Start from octave up
                const velocity = 0.4 + this.intensity * 0.3;
                this.playOud(freq, time, this.beatDuration * 0.9, velocity);
            }
        }
        
        // ============================================
        // NEY FLUTE - Long sustained notes
        // ============================================
        if (playNey && beatInBar === 0 && bar % 2 === 0) {
            // Play sustained notes on even bars
            const neyNotes = [7, 9, 11, 9]; // Scale degrees (higher octave)
            const noteIndex = (bar / 2) % neyNotes.length;
            const freq = this.noteToFreq(neyNotes[noteIndex], 0);
            this.playNey(freq, time, this.beatDuration * 6, 0.3 + this.intensity * 0.2);
        }
        
        // ============================================
        // BASS OUD - Root notes
        // ============================================
        if (beatInBar === 0 || beatInBar === 8) {
            // Bass on beats 1 and 3
            const bassNotes = [0, 0, 3, 5]; // I, I, IV, V progression
            const bassIndex = bar % 4;
            const freq = this.noteToFreq(bassNotes[bassIndex], -1); // Octave down
            this.playOud(freq, time, this.beatDuration * 1.5, 0.5);
        }
    }
    
    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
    }
    
    // ============================================
    // SOUND EFFECTS
    // ============================================
    playFlap() {
        if (!this.initialized) return;
        
        // Beetle wing buzz - rapid oscillation
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        // Buzzy sound
        osc.type = 'sawtooth';
        osc.frequency.value = 180;
        
        osc2.type = 'square';
        osc2.frequency.value = 185; // Slight detune for buzz
        
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 3;
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc2.start();
        osc.stop(this.ctx.currentTime + 0.1);
        osc2.stop(this.ctx.currentTime + 0.1);
    }
    
    playScore() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        
        // Ancient chime/gong sound
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
        
        frequencies.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Gong-like envelope
            gain.gain.setValueAtTime(0, now + i * 0.02);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.02 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(now + i * 0.02);
            osc.stop(now + 1.5);
        });
        
        // Add metallic shimmer
        const noise = this.ctx.createOscillator();
        const noiseGain = this.ctx.createGain();
        const noiseFilter = this.ctx.createBiquadFilter();
        
        noise.type = 'triangle';
        noise.frequency.value = 2500;
        
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 2000;
        
        noiseGain.gain.setValueAtTime(0.05, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }
    
    playDeath() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        
        // Stone crumbling sound
        for (let i = 0; i < 8; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            const startFreq = 150 + Math.random() * 100;
            osc.frequency.setValueAtTime(startFreq, now + i * 0.05);
            osc.frequency.exponentialRampToValueAtTime(30, now + i * 0.05 + 0.3);
            
            gain.gain.setValueAtTime(0.1, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.4);
        }
        
        // Dramatic cymbal crash
        const crash = this.ctx.createOscillator();
        const crashGain = this.ctx.createGain();
        const crashFilter = this.ctx.createBiquadFilter();
        
        crash.type = 'sawtooth';
        crash.frequency.value = 300;
        
        crashFilter.type = 'highpass';
        crashFilter.frequency.value = 1000;
        
        crashGain.gain.setValueAtTime(0.3, now);
        crashGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        
        crash.connect(crashFilter);
        crashFilter.connect(crashGain);
        crashGain.connect(this.sfxGain);
        
        crash.start(now);
        crash.stop(now + 1);
        
        // Low gong
        const gong = this.ctx.createOscillator();
        const gongGain = this.ctx.createGain();
        
        gong.type = 'sine';
        gong.frequency.value = 80;
        
        gongGain.gain.setValueAtTime(0.4, now);
        gongGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        
        gong.connect(gongGain);
        gongGain.connect(this.sfxGain);
        
        gong.start(now);
        gong.stop(now + 2);
    }
    
    playMenuSelect() {
        if (!this.initialized) return;
        
        const now = this.ctx.currentTime;
        
        // Mystical ascending tones
        [220, 330, 440].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.5);
        });
    }
    
    // Resume audio context (needed after user interaction)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

// Create global audio instance
const audioSystem = new EgyptianAudioSystem();
