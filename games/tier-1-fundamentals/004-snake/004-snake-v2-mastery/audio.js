// ============================================
// AUDIO SYSTEM - V2 MASTERY EDITION
// ============================================
// COMPLETELY REDESIGNED music system for V2:
// 
// V1 (OLD): Ambient drones, slow-changing pads, static atmosphere
// V2 (NEW): Sci-Fi Pulse System - Rhythmic, Electronic, Dynamic!
//
// V2 MUSIC FEATURES:
// - 80 BPM pulse-based sequencer
// - Pulsing sub-bass with resonant filter (heartbeat feel)
// - Cm9 arpeggio pattern sweeping across stereo field
// - Minor 9th pad chord swells (Cm9, Bbm9, Bm9)
// - Electronic texture layer (blips, static bursts, sweeps)
// - Rhythmic kick pulse underneath everything
//
// AUDIO TECHNIQUES:
// - DynamicsCompressorNode for consistent levels
// - StereoPannerNode for spatial positioning
// - BiquadFilter for synth tones
// - Envelope shaping on every note
// - Multiple concurrent interval-based layers

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3;
        this.musicVolume = 0.15;
        this.initialized = false;
        
        // V2: Master bus nodes
        this.masterGain = null;
        this.compressor = null;
        this.reverbBuffer = null;
        
        // V2: Music intensity (increases with snake length)
        this.musicIntensity = 1.0;
        
        // Background music system
        this.backgroundMusic = {
            playing: false,
            padOscillators: [],
            bassOscillator: null,
            bassLFO: null,           // V2: LFO for bass wobble
            bassGain: null,
            padGain: null,
            melodyInterval: null,
            textureInterval: null,
            currentChordIndex: 0,
            masterMusicGain: null
        };
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // V2: Create master bus with compressor for consistent levels
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -24;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.25;
            
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.audioContext.destination);
            
            // V2: Create reverb buffer
            this.createReverbBuffer();
            
            this.initialized = true;
            console.log('🔊 V2 Audio system initialized with compressor and reverb');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }
    
    // V2: Create synthetic reverb impulse response
    createReverbBuffer() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 1.2; // 1.2 second reverb
        this.reverbBuffer = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = this.reverbBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }
    }
    
    // V2: Create stereo panner based on X position
    createPanner(xPosition, maxWidth) {
        const panner = this.audioContext.createStereoPanner();
        const normalizedX = (xPosition / maxWidth) * 2 - 1;
        panner.pan.value = Math.max(-1, Math.min(1, normalizedX));
        return panner;
    }
    
    // V2: Set music intensity based on snake length
    setMusicIntensity(snakeLength) {
        this.musicIntensity = 1 + (snakeLength / 25) * 0.6;
        
        // Speed up bass LFO with intensity
        if (this.backgroundMusic.bassLFO) {
            this.backgroundMusic.bassLFO.frequency.value = 0.12 + (this.musicIntensity - 1) * 0.15;
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
    // V2 BACKGROUND MUSIC - COMPLETELY REDESIGNED
    // Sci-Fi Pulse System - Rhythmic, Electronic, Space-Age
    // Dramatically different from V1's ambient drones
    // ============================================
    
    startBackgroundMusic() {
        if (!this.enabled || !this.initialized || this.backgroundMusic.playing) return;
        
        console.log('🎵 Starting V2 Sci-Fi Pulse Music System...');
        this.backgroundMusic.playing = true;
        
        const ctx = this.audioContext;
        
        // Create master gain for background music
        this.backgroundMusic.masterMusicGain = ctx.createGain();
        this.backgroundMusic.masterMusicGain.gain.setValueAtTime(this.masterVolume * this.musicVolume, ctx.currentTime);
        this.backgroundMusic.masterMusicGain.connect(this.masterGain);
        
        // V2: Start the pulse-based music system
        this.startPulseSequencer();
    }
    
    startPulseSequencer() {
        const ctx = this.audioContext;
        const destination = this.backgroundMusic.masterMusicGain;
        
        // BPM for the pulse (slower for ambient but with rhythm)
        this.backgroundMusic.bpm = 80;
        this.backgroundMusic.beatLength = 60 / this.backgroundMusic.bpm;
        this.backgroundMusic.currentBeat = 0;
        
        // Layer 1: PULSING SUB-BASS (heartbeat of the cosmos)
        this.startPulsingBass(destination);
        
        // Layer 2: SCI-FI ARPEGGIO (electronic pattern)
        this.startSciFiArpeggio(destination);
        
        // Layer 3: PAD SWELLS (atmospheric)
        this.startPadSwells(destination);
        
        // Layer 4: ELECTRONIC TEXTURE (beeps, blips, space sounds)
        this.startElectronicTexture(destination);
        
        // Layer 5: RHYTHMIC PULSE (the "heartbeat")
        this.startRhythmicPulse(destination);
    }
    
    // Layer 1: Pulsing sub-bass that throbs like a heartbeat
    startPulsingBass(destination) {
        const ctx = this.audioContext;
        const beatLength = this.backgroundMusic.beatLength;
        
        // Bass notes (Cm sci-fi progression)
        const bassPattern = [65.41, 65.41, 73.42, 61.74]; // C2, C2, D2, B1
        let patternIndex = 0;
        
        const playBassPulse = () => {
            if (!this.backgroundMusic.playing) return;
            
            const now = ctx.currentTime;
            const freq = bassPattern[patternIndex % bassPattern.length];
            
            // Create oscillator with attack
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Sub-bass filter
            filter.type = 'lowpass';
            filter.frequency.value = 150;
            filter.Q.value = 8; // Resonant for that sci-fi thump
            
            // PULSE envelope - quick attack, medium sustain, quick release
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.05); // Quick attack
            gain.gain.setValueAtTime(0.35, now + beatLength * 0.5);
            gain.gain.linearRampToValueAtTime(0, now + beatLength * 0.9);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(destination);
            
            osc.start(now);
            osc.stop(now + beatLength);
            
            patternIndex++;
        };
        
        // Start immediately
        playBassPulse();
        this.backgroundMusic.bassInterval = setInterval(playBassPulse, beatLength * 2000);
    }
    
    // Layer 2: Electronic arpeggio pattern
    startSciFiArpeggio(destination) {
        const ctx = this.audioContext;
        const beatLength = this.backgroundMusic.beatLength;
        
        // Cm9 arpeggio pattern (space-age sound)
        const arpNotes = [
            261.63,  // C4
            311.13,  // Eb4
            392.00,  // G4
            466.16,  // Bb4
            523.25,  // C5
            466.16,  // Bb4
            392.00,  // G4
            311.13   // Eb4
        ];
        let arpIndex = 0;
        
        const playArpNote = () => {
            if (!this.backgroundMusic.playing) return;
            
            const now = ctx.currentTime;
            const freq = arpNotes[arpIndex % arpNotes.length];
            
            // Determine stereo position based on arpeggio position
            const panValue = ((arpIndex % 8) / 7) * 2 - 1; // Sweep left to right
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const panner = ctx.createStereoPanner();
            const filter = ctx.createBiquadFilter();
            
            // Use triangle for softer electronic sound
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            // Band-pass for that classic synth sound
            filter.type = 'bandpass';
            filter.frequency.value = freq * 2;
            filter.Q.value = 2;
            
            panner.pan.value = panValue * 0.7;
            
            // Short, plucky envelope
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(panner);
            panner.connect(destination);
            
            osc.start(now);
            osc.stop(now + 0.35);
            
            arpIndex++;
        };
        
        // Start after a beat offset
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                playArpNote();
                this.backgroundMusic.arpInterval = setInterval(playArpNote, beatLength * 250);
            }
        }, beatLength * 500);
    }
    
    // Layer 3: Atmospheric pad swells
    startPadSwells(destination) {
        const ctx = this.audioContext;
        
        // Minor 9th chords for space atmosphere
        const padChords = [
            [130.81, 155.56, 196.00, 233.08, 293.66],  // Cm9
            [116.54, 138.59, 174.61, 207.65, 261.63],  // Bbm9
            [123.47, 146.83, 185.00, 220.00, 277.18],  // Bm9 (creates tension)
            [130.81, 155.56, 196.00, 233.08, 293.66]   // Back to Cm9
        ];
        let chordIndex = 0;
        
        const playPadSwell = () => {
            if (!this.backgroundMusic.playing) return;
            
            const now = ctx.currentTime;
            const chord = padChords[chordIndex % padChords.length];
            
            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const panner = ctx.createStereoPanner();
                const filter = ctx.createBiquadFilter();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                // Spread notes across stereo field
                panner.pan.value = (i / (chord.length - 1)) * 1.6 - 0.8;
                
                // Low-pass for warmth
                filter.type = 'lowpass';
                filter.frequency.value = 600 + i * 100;
                
                // Long swell envelope
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.06, now + 2.0);  // Slow attack
                gain.gain.setValueAtTime(0.05, now + 5.0);
                gain.gain.linearRampToValueAtTime(0, now + 7.0);     // Slow release
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(panner);
                panner.connect(destination);
                
                osc.start(now);
                osc.stop(now + 7.5);
            });
            
            chordIndex++;
        };
        
        // Start after 2 beats
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                playPadSwell();
                this.backgroundMusic.padInterval = setInterval(playPadSwell, 8000);
            }
        }, 1500);
    }
    
    // Layer 4: Electronic texture - beeps, blips, radio static
    startElectronicTexture(destination) {
        const ctx = this.audioContext;
        
        const playRandomTexture = () => {
            if (!this.backgroundMusic.playing) return;
            
            const now = ctx.currentTime;
            const choice = Math.random();
            
            if (choice < 0.3) {
                // High-pitched blip
                this.playSciFiBlip(destination, now);
            } else if (choice < 0.5) {
                // Radio static burst
                this.playStaticBurst(destination, now);
            } else if (choice < 0.65) {
                // Descending sweep
                this.playDescendingSweep(destination, now);
            }
            // 35% chance of silence for breathing room
        };
        
        this.backgroundMusic.textureInterval = setInterval(playRandomTexture, 1500);
    }
    
    playSciFiBlip(destination, now) {
        const ctx = this.audioContext;
        const freq = 1200 + Math.random() * 2000;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);
        
        panner.pan.value = (Math.random() - 0.5) * 1.8;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playStaticBurst(destination, now) {
        const ctx = this.audioContext;
        const duration = 0.1 + Math.random() * 0.2;
        
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/bufferSize, 2);
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000 + Math.random() * 3000;
        filter.Q.value = 10;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.03;
        
        const panner = ctx.createStereoPanner();
        panner.pan.value = (Math.random() - 0.5) * 2;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(destination);
        
        source.start(now);
    }
    
    playDescendingSweep(destination, now) {
        const ctx = this.audioContext;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        
        osc.connect(gain);
        gain.connect(destination);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    // Layer 5: Rhythmic pulse - the heartbeat underneath everything
    startRhythmicPulse(destination) {
        const ctx = this.audioContext;
        const beatLength = this.backgroundMusic.beatLength;
        
        let pulseOn = true;
        
        const playPulse = () => {
            if (!this.backgroundMusic.playing) return;
            
            const now = ctx.currentTime;
            
            // Alternating kick-like thump
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            // Pitch drops quickly for that electronic kick feel
            osc.frequency.setValueAtTime(pulseOn ? 100 : 80, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(pulseOn ? 0.15 : 0.08, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            
            osc.connect(gain);
            gain.connect(destination);
            
            osc.start(now);
            osc.stop(now + 0.25);
            
            pulseOn = !pulseOn;
        };
        
        this.backgroundMusic.pulseInterval = setInterval(playPulse, beatLength * 500);
    }
    
    stopBackgroundMusic() {
        if (!this.backgroundMusic.playing) return;
        
        console.log('🎵 Stopping V2 Sci-Fi music...');
        this.backgroundMusic.playing = false;
        
        // Clear all intervals
        if (this.backgroundMusic.bassInterval) clearInterval(this.backgroundMusic.bassInterval);
        if (this.backgroundMusic.arpInterval) clearInterval(this.backgroundMusic.arpInterval);
        if (this.backgroundMusic.padInterval) clearInterval(this.backgroundMusic.padInterval);
        if (this.backgroundMusic.textureInterval) clearInterval(this.backgroundMusic.textureInterval);
        if (this.backgroundMusic.pulseInterval) clearInterval(this.backgroundMusic.pulseInterval);
        
        // Fade out master
        if (this.backgroundMusic.masterMusicGain) {
            const now = this.audioContext.currentTime;
            this.backgroundMusic.masterMusicGain.gain.linearRampToValueAtTime(0, now + 0.5);
        }
    }
    
    // V2: Enhanced eat sound with pentatonic scale and stereo panning
    playEatSoundV2(comboCount, foodX, gridWidth) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Pentatonic scale (always sounds good, no dissonance)
        const pentatonic = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99];
        const noteIndex = Math.min(comboCount, pentatonic.length - 1);
        const freq = pentatonic[noteIndex];
        
        // Main oscillator
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Harmonic for richness
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2;
        
        // Gain with envelope
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        // Stereo panning based on food position
        const panner = this.createPanner(foodX, gridWidth);
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.2);
        osc2.stop(now + 0.2);
    }
    
    // V2: Enhanced death sound with filter sweep
    playDeathSoundV2() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Descending sawtooth with filter sweep
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        
        // Filter sweep
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        filter.Q.value = 5;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.9);
        
        // Add noise burst
        this.playNoise(0.4, 0.4);
    }
}

// Create global audio instance
const audio = new AudioSystem();

// ============================================
// GAME SOUND EFFECTS - V2 ENHANCED
// ============================================

// V2: Wrapper that uses enhanced version with combo and position
function playEatSound(comboCount = 0, foodX = 400, gridWidth = 800) {
    audio.playEatSoundV2(comboCount, foodX, gridWidth);
}

function playDeathSound() {
    // V2: Use enhanced death sound with filter sweep
    audio.playDeathSoundV2();
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

// V2: Function to update music intensity based on snake length
function setMusicIntensity(snakeLength) {
    audio.setMusicIntensity(snakeLength);
}

console.log('🎵 Snake V2 Audio System loaded with enhanced techniques');
