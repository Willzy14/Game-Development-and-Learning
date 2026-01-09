/**
 * ASTEROIDS v2 - AUDIO FILE
 * 
 * ALL procedural audio code lives here.
 * Space-themed synthesized sounds: retro-arcade meets cosmic ambience.
 * To create a new audio style, copy this file and modify.
 * game.js should NEVER be touched for audio changes.
 */

// =============================================================================
// AUDIO OBJECT - Interface for game.js
// =============================================================================

const AUDIO = {
    ctx: null,
    masterGain: null,
    enabled: true,
    thrustOsc: null,
    thrustGain: null,
    thrustNoiseGain: null,
    
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    
    init() {
        // Create audio context on first user interaction
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.connect(this.ctx.destination);
                this.masterGain.gain.value = 0.3;
                
                // Setup persistent thrust sound
                this._setupThrustSound();
            } catch (e) {
                console.warn('Web Audio not available:', e);
                this.enabled = false;
            }
        }
    },
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    // =========================================================================
    // HELPER: Create noise buffer for explosions and thrust
    // =========================================================================
    
    _createNoiseBuffer(duration = 1) {
        const sampleRate = this.ctx.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    },
    
    // =========================================================================
    // HELPER: Setup persistent thrust sound (always running, just muted)
    // =========================================================================
    
    _setupThrustSound() {
        // Low rumble oscillator
        this.thrustOsc = this.ctx.createOscillator();
        this.thrustOsc.type = 'sawtooth';
        this.thrustOsc.frequency.value = 55; // Low A
        
        // Gain for oscillator
        this.thrustGain = this.ctx.createGain();
        this.thrustGain.gain.value = 0;
        
        // Add some noise for texture
        const noiseBuffer = this._createNoiseBuffer(2);
        this.thrustNoise = this.ctx.createBufferSource();
        this.thrustNoise.buffer = noiseBuffer;
        this.thrustNoise.loop = true;
        
        this.thrustNoiseGain = this.ctx.createGain();
        this.thrustNoiseGain.gain.value = 0;
        
        // Low pass filter for both
        const thrustFilter = this.ctx.createBiquadFilter();
        thrustFilter.type = 'lowpass';
        thrustFilter.frequency.value = 200;
        thrustFilter.Q.value = 2;
        
        // Connect
        this.thrustOsc.connect(this.thrustGain);
        this.thrustGain.connect(thrustFilter);
        
        this.thrustNoise.connect(this.thrustNoiseGain);
        this.thrustNoiseGain.connect(thrustFilter);
        
        thrustFilter.connect(this.masterGain);
        
        // Start (will be silent until gain is raised)
        this.thrustOsc.start();
        this.thrustNoise.start();
    },
    
    // =========================================================================
    // SOUND EFFECTS
    // =========================================================================
    
    playShoot() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Classic arcade laser: quick frequency sweep down
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    },
    
    playChargedShoot() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Bigger, more powerful sound with sub-bass punch
        
        // Main tone - lower and longer
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(55, now + 0.3);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.3);
        
        // Sub punch
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110, now);
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now);
        osc2.stop(now + 0.2);
        
        // High overtone for "energy" feel
        const osc3 = this.ctx.createOscillator();
        const gain3 = this.ctx.createGain();
        osc3.type = 'square';
        osc3.frequency.setValueAtTime(1760, now);
        osc3.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        gain3.gain.setValueAtTime(0.08, now);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc3.connect(gain3);
        gain3.connect(this.masterGain);
        osc3.start(now);
        osc3.stop(now + 0.15);
    },
    
    // Call this every frame with thrusting state
    updateThrust(isThrusting) {
        if (!this.enabled || !this.thrustGain) return;
        
        const targetGain = isThrusting ? 0.12 : 0;
        const targetNoise = isThrusting ? 0.06 : 0;
        const now = this.ctx.currentTime;
        
        // Smooth ramp for natural engine sound
        this.thrustGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);
        this.thrustNoiseGain.gain.linearRampToValueAtTime(targetNoise, now + 0.05);
        
        // Vary the pitch slightly when thrusting for more life
        if (isThrusting) {
            const wobble = 55 + Math.sin(now * 8) * 5;
            this.thrustOsc.frequency.setValueAtTime(wobble, now);
        }
    },
    
    playExplosion(size = 'medium') {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Size determines duration and pitch
        const config = {
            small: { duration: 0.15, pitch: 200, volume: 0.15 },
            medium: { duration: 0.25, pitch: 120, volume: 0.2 },
            large: { duration: 0.4, pitch: 60, volume: 0.3 }
        }[size] || { duration: 0.25, pitch: 120, volume: 0.2 };
        
        // Noise burst through filter
        const noiseBuffer = this._createNoiseBuffer(config.duration);
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(config.volume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(config.pitch * 4, now);
        filter.frequency.exponentialRampToValueAtTime(config.pitch, now + config.duration);
        
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + config.duration);
        
        // Add tonal punch for larger explosions
        if (size !== 'small') {
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(config.pitch, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + config.duration * 0.8);
            oscGain.gain.setValueAtTime(config.volume * 0.5, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + config.duration * 0.8);
            osc.connect(oscGain);
            oscGain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + config.duration);
        }
    },
    
    playGravityWellSpawn() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Eerie rising whoosh - like something warping space
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        // Add tremolo for unsettling effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 8;
        lfoGain.gain.value = 0.3;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 0.8);
        lfo.stop(now + 0.8);
    },
    
    playGravityWellDestroy() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Reverse whoosh - implosion sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.4);
        
        // Add some "crunch" noise
        const noiseBuffer = this._createNoiseBuffer(0.2);
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 2;
        
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.2);
    },
    
    playComboIncrease(comboLevel) {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Rising arpeggio based on combo level
        // Higher combos = higher notes = more excitement
        const baseNote = 220; // A3
        const note = baseNote * Math.pow(1.2, Math.min(comboLevel, 10));
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);
        osc.frequency.setValueAtTime(note * 1.5, now + 0.05);
        osc.frequency.setValueAtTime(note * 2, now + 0.1);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.2);
        
        // Add sparkle for high combos
        if (comboLevel >= 5) {
            const sparkle = this.ctx.createOscillator();
            const sparkleGain = this.ctx.createGain();
            sparkle.type = 'sine';
            sparkle.frequency.value = note * 4;
            sparkleGain.gain.setValueAtTime(0.05, now);
            sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            sparkle.connect(sparkleGain);
            sparkleGain.connect(this.masterGain);
            sparkle.start(now);
            sparkle.stop(now + 0.15);
        }
    },
    
    playShipDestroy() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Big dramatic explosion - multi-layered
        
        // Main explosion noise
        const noiseBuffer = this._createNoiseBuffer(0.8);
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.8);
        
        // Deep bass thud
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(80, now);
        bass.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        bass.connect(bassGain);
        bassGain.connect(this.masterGain);
        bass.start(now);
        bass.stop(now + 0.5);
        
        // Descending alarm-like tone
        const alarm = this.ctx.createOscillator();
        const alarmGain = this.ctx.createGain();
        alarm.type = 'square';
        alarm.frequency.setValueAtTime(440, now);
        alarm.frequency.exponentialRampToValueAtTime(110, now + 0.6);
        alarmGain.gain.setValueAtTime(0.1, now);
        alarmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        alarm.connect(alarmGain);
        alarmGain.connect(this.masterGain);
        alarm.start(now);
        alarm.stop(now + 0.6);
    },
    
    playUISelect() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Clean, satisfying UI blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.05);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    },
    
    // =========================================================================
    // MUSIC SYSTEM - Procedural space soundtrack
    // =========================================================================
    
    music: {
        playing: false,
        nodes: [],
        intervalId: null,
        bassIntervalId: null,
        padIntervalId: null
    },
    
    // Musical scale: A minor / Aeolian for space atmosphere
    // A2=110, C3=131, D3=147, E3=165, F3=175, G3=196, A3=220, C4=262, D4=294, E4=330
    scale: [110, 131, 147, 165, 175, 196, 220, 262, 294, 330],
    bassNotes: [55, 65.5, 73.5, 82.5], // A1, C2, D2, E2 - deep bass
    
    startMusic() {
        if (!this.enabled || !this.ctx || this.music.playing) return;
        
        this.music.playing = true;
        
        // Create music gain (separate from SFX)
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.15; // Music quieter than SFX
        this.musicGain.connect(this.masterGain);
        
        // Start the layers
        this._startDrone();
        this._startArpeggio();
        this._startBassline();
        this._startPads();
    },
    
    stopMusic() {
        if (!this.music.playing) return;
        
        this.music.playing = false;
        
        // Stop all intervals
        if (this.music.intervalId) {
            clearInterval(this.music.intervalId);
            this.music.intervalId = null;
        }
        if (this.music.bassIntervalId) {
            clearInterval(this.music.bassIntervalId);
            this.music.bassIntervalId = null;
        }
        if (this.music.padIntervalId) {
            clearInterval(this.music.padIntervalId);
            this.music.padIntervalId = null;
        }
        
        // Stop all nodes
        this.music.nodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        this.music.nodes = [];
        
        // Stop drone
        if (this._droneOsc) {
            try { this._droneOsc.stop(); } catch(e) {}
            this._droneOsc = null;
        }
        if (this._droneLFO) {
            try { this._droneLFO.stop(); } catch(e) {}
            this._droneLFO = null;
        }
    },
    
    // Layer 1: Deep continuous drone
    _startDrone() {
        // Root note drone with subtle movement
        this._droneOsc = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        
        this._droneOsc.type = 'sine';
        this._droneOsc.frequency.value = 55; // A1
        droneGain.gain.value = 0.08;
        
        // Subtle pitch wobble
        this._droneLFO = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        this._droneLFO.frequency.value = 0.1;
        lfoGain.gain.value = 2;
        this._droneLFO.connect(lfoGain);
        lfoGain.connect(this._droneOsc.frequency);
        
        // Add a fifth above for richness
        const droneOsc2 = this.ctx.createOscillator();
        const droneGain2 = this.ctx.createGain();
        droneOsc2.type = 'sine';
        droneOsc2.frequency.value = 82.5; // E2 (fifth)
        droneGain2.gain.value = 0.04;
        
        this._droneOsc.connect(droneGain);
        droneOsc2.connect(droneGain2);
        droneGain.connect(this.musicGain);
        droneGain2.connect(this.musicGain);
        
        this._droneOsc.start();
        this._droneLFO.start();
        droneOsc2.start();
        
        this.music.nodes.push(droneOsc2);
    },
    
    // Layer 2: Slow evolving arpeggio
    _startArpeggio() {
        let noteIndex = 0;
        let direction = 1;
        
        const playArpNote = () => {
            if (!this.music.playing || !this.ctx) return;
            
            const now = this.ctx.currentTime;
            const note = this.scale[noteIndex];
            
            // Soft plucky synth
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.value = note;
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(note * 4, now);
            filter.frequency.exponentialRampToValueAtTime(note * 1.5, now + 0.3);
            
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start(now);
            osc.stop(now + 0.8);
            
            // Move through scale (up and down)
            noteIndex += direction;
            if (noteIndex >= this.scale.length - 1) direction = -1;
            if (noteIndex <= 0) direction = 1;
        };
        
        // Play notes at varying intervals for organic feel
        this.music.intervalId = setInterval(() => {
            playArpNote();
        }, 400 + Math.random() * 200); // 400-600ms
    },
    
    // Layer 3: Deep bass hits
    _startBassline() {
        let bassIndex = 0;
        
        const playBass = () => {
            if (!this.music.playing || !this.ctx) return;
            
            const now = this.ctx.currentTime;
            const note = this.bassNotes[bassIndex];
            
            // Subby bass with slight attack
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = note;
            
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start(now);
            osc.stop(now + 1.5);
            
            // Cycle through bass notes
            bassIndex = (bassIndex + 1) % this.bassNotes.length;
        };
        
        // Bass hits every 2 seconds
        this.music.bassIntervalId = setInterval(playBass, 2000);
        playBass(); // Start immediately
    },
    
    // Layer 4: Ethereal pads (chords)
    _startPads() {
        const chords = [
            [110, 131, 165],  // Am (A, C, E)
            [131, 165, 196],  // C (C, E, G)
            [147, 175, 220],  // Dm (D, F, A)
            [165, 196, 247]   // Em (E, G, B)
        ];
        let chordIndex = 0;
        
        const playPad = () => {
            if (!this.music.playing || !this.ctx) return;
            
            const now = this.ctx.currentTime;
            const chord = chords[chordIndex];
            
            // Play each note of the chord
            chord.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                // Detuned slightly for warmth
                osc.type = 'sine';
                osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.01);
                
                // Slow attack and release
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.03, now + 1);
                gain.gain.linearRampToValueAtTime(0.03, now + 3);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 5);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(now + i * 0.1); // Slight stagger
                osc.stop(now + 5);
            });
            
            // Cycle through chords
            chordIndex = (chordIndex + 1) % chords.length;
        };
        
        // New pad every 4 seconds (with overlap)
        this.music.padIntervalId = setInterval(playPad, 4000);
        playPad(); // Start immediately
    },
    
    // Adjust music intensity based on game state
    setMusicIntensity(level) {
        if (!this.musicGain) return;
        
        // level: 0 = calm, 1 = normal, 2 = intense
        const volumes = [0.08, 0.15, 0.22];
        const targetVolume = volumes[Math.min(level, 2)];
        
        const now = this.ctx.currentTime;
        this.musicGain.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
    }
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUDIO;
}
