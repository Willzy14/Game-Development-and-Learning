// ============================================
// PONG V2 MASTERY EDITION - AUDIO SYSTEM
// ============================================
// Advanced Web Audio API implementation with:
// - Stereo panning based on ball position
// - ADSR envelopes for natural sound
// - Multiple oscillator layers
// - Dynamic filtering
// - Master compression to prevent clipping
// - Sound variation pools

class MasteryAudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.compressor = null;
        this.enabled = true;
        this.initialized = false;
        this.masterVolume = 0.4;
        
        // Sound variation pools for natural feel
        this.paddleHitPool = [];
        this.wallBouncePool = [];
        this.initializeSoundPools();
    }
    
    // Initialize sound variation pools
    initializeSoundPools() {
        // Create variations for paddle hits (different pitches)
        for (let i = 0; i < 5; i++) {
            this.paddleHitPool.push({
                baseFreq: 440 + (Math.random() - 0.5) * 60,
                detune: (Math.random() - 0.5) * 20
            });
        }
        
        // Create variations for wall bounces
        for (let i = 0; i < 4; i++) {
            this.wallBouncePool.push({
                baseFreq: 220 + (Math.random() - 0.5) * 30,
                detune: (Math.random() - 0.5) * 15
            });
        }
    }
    
    // Must be called after user interaction
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master output chain: Gain -> Compressor -> Destination
            this.masterGain = this.audioContext.createGain();
            this.compressor = this.audioContext.createDynamicsCompressor();
            
            // Configure compressor to prevent clipping
            this.compressor.threshold.value = -20;
            this.compressor.knee.value = 20;
            this.compressor.ratio.value = 8;
            this.compressor.attack.value = 0.005;
            this.compressor.release.value = 0.1;
            
            // Connect chain
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.audioContext.destination);
            
            this.masterGain.gain.value = this.masterVolume;
            this.initialized = true;
            console.log('✅ Mastery Audio System initialized');
        } catch (e) {
            console.warn('⚠️ Web Audio API not supported:', e);
            this.enabled = false;
        }
    }
    
    // Resume audio context (required for some browsers)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Toggle mute
    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // Create a panner for spatial audio
    createPanner(panValue = 0) {
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, panValue));
        return panner;
    }
    
    // ADSR Envelope helper
    applyEnvelope(gainNode, attack, decay, sustain, release, duration) {
        const now = this.audioContext.currentTime;
        const sustainTime = Math.max(0, duration - attack - decay - release);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1, now + attack);
        gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
        gainNode.gain.setValueAtTime(sustain, now + attack + decay + sustainTime);
        gainNode.gain.linearRampToValueAtTime(0.001, now + duration);
    }
    
    // ========================================
    // CORE SOUND GENERATORS
    // ========================================
    
    // Retro square wave with ADSR and optional panning
    playSquareBlip(frequency, duration, volume = 1.0, pan = 0, pitch = 0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Create oscillator
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(frequency, now);
        osc.detune.value = pitch;
        
        // Create gain for envelope
        const envelope = ctx.createGain();
        
        // Create panner for spatial audio
        const panner = this.createPanner(pan);
        
        // Connect chain: Osc -> Envelope -> Panner -> Master
        osc.connect(envelope);
        envelope.connect(panner);
        panner.connect(this.masterGain);
        
        // Apply ADSR envelope (quick attack, medium decay)
        const attackTime = 0.005;
        const decayTime = 0.03;
        const sustainLevel = 0.6 * volume;
        const releaseTime = duration * 0.4;
        
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(volume, now + attackTime);
        envelope.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        envelope.gain.linearRampToValueAtTime(0.001, now + duration);
        
        // Play
        osc.start(now);
        osc.stop(now + duration + 0.01);
    }
    
    // Layered sound with multiple oscillators
    playLayeredTone(freq1, freq2, duration, volume = 1.0, pan = 0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Create two oscillators
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.value = freq1;
        osc2.frequency.value = freq2;
        
        // Gain nodes
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const masterEnvelope = ctx.createGain();
        
        // Panner
        const panner = this.createPanner(pan);
        
        // Connect
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterEnvelope);
        gain2.connect(masterEnvelope);
        masterEnvelope.connect(panner);
        panner.connect(this.masterGain);
        
        // Set individual gains
        gain1.gain.value = volume * 0.7;
        gain2.gain.value = volume * 0.3;
        
        // Master envelope
        masterEnvelope.gain.setValueAtTime(0, now);
        masterEnvelope.gain.linearRampToValueAtTime(1, now + 0.01);
        masterEnvelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }
    
    // Filtered noise for impact sounds
    playFilteredNoise(duration, startFreq, endFreq, volume = 1.0, pan = 0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const bufferSize = ctx.sampleRate * duration;
        
        // Create noise buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        // Create source
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        // Create filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(startFreq, now);
        filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
        filter.Q.value = 1;
        
        // Create envelope
        const envelope = ctx.createGain();
        envelope.gain.setValueAtTime(volume, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        // Create panner
        const panner = this.createPanner(pan);
        
        // Connect
        source.connect(filter);
        filter.connect(envelope);
        envelope.connect(panner);
        panner.connect(this.masterGain);
        
        source.start(now);
    }
    
    // Pitch sweep (ascending or descending)
    playPitchSweep(startFreq, endFreq, duration, waveType = 'sine', volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        osc.type = waveType;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
        
        const envelope = ctx.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(volume, now + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(envelope);
        envelope.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }
    
    // ========================================
    // GAME-SPECIFIC SOUND EFFECTS
    // ========================================
    
    // Paddle hit with position-based pitch variation and panning
    playPaddleHit(hitPosition = 0, ballX = 0.5) {
        // Get variation from pool
        const poolIndex = Math.floor(Math.random() * this.paddleHitPool.length);
        const variation = this.paddleHitPool[poolIndex];
        
        // Calculate pitch based on hit position (-1 to 1)
        // Hitting edge = higher pitch, center = lower pitch
        const pitchOffset = Math.abs(hitPosition) * 100; // cents
        
        // Calculate pan based on ball X position (0-1)
        const pan = (ballX * 2) - 1; // Convert to -1 to 1
        
        // Play layered sound
        const baseFreq = variation.baseFreq + pitchOffset;
        
        // Main hit sound
        this.playSquareBlip(baseFreq, 0.08, 0.5, pan, variation.detune);
        
        // Subtle harmonic layer
        this.playSquareBlip(baseFreq * 2, 0.05, 0.15, pan, variation.detune);
    }
    
    // Wall bounce with panning
    playWallBounce(ballX = 0.5) {
        const poolIndex = Math.floor(Math.random() * this.wallBouncePool.length);
        const variation = this.wallBouncePool[poolIndex];
        const pan = (ballX * 2) - 1;
        
        this.playSquareBlip(variation.baseFreq, 0.06, 0.35, pan, variation.detune);
    }
    
    // Score sound (triumphant for player, descending for AI)
    playScore(isPlayerScore, ballX = 0.5) {
        const pan = (ballX * 2) - 1;
        
        if (isPlayerScore) {
            // Ascending arpeggio
            const notes = [523, 659, 784]; // C5, E5, G5
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    this.playLayeredTone(freq, freq * 1.5, 0.12, 0.6, pan * 0.5);
                }, i * 80);
            });
        } else {
            // Descending sad tones
            const notes = [392, 330, 262]; // G4, E4, C4
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    this.playLayeredTone(freq, freq * 0.5, 0.15, 0.5, pan * 0.5);
                }, i * 100);
            });
        }
    }
    
    // Game start sound
    playGameStart() {
        // Quick ascending sweep
        this.playPitchSweep(200, 800, 0.2, 'sine', 0.4);
        setTimeout(() => {
            this.playLayeredTone(523, 784, 0.15, 0.5, 0);
        }, 150);
    }
    
    // Victory fanfare
    playVictory() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const durations = [0.15, 0.15, 0.15, 0.4];
        let time = 0;
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playLayeredTone(freq, freq * 1.5, durations[i], 0.6, 0);
            }, time);
            time += durations[i] * 800;
        });
    }
    
    // Defeat sound
    playDefeat() {
        // Descending chromatic with filter
        const notes = [392, 370, 349, 330, 311, 294]; // Descending
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSquareBlip(freq, 0.2, 0.4, 0, 0);
            }, i * 120);
        });
        
        // Low impact at end
        setTimeout(() => {
            this.playFilteredNoise(0.3, 400, 50, 0.4, 0);
        }, notes.length * 120);
    }
    
    // Menu hover/select
    playMenuHover() {
        this.playSquareBlip(600, 0.05, 0.2, 0, 0);
    }
    
    playMenuSelect() {
        this.playLayeredTone(440, 880, 0.1, 0.4, 0);
    }
    
    // Rally intensification (optional - call when rally gets long)
    playRallyPing(rallyCount) {
        // Pitch increases with rally length
        const baseFreq = 300 + Math.min(rallyCount * 20, 400);
        this.playSquareBlip(baseFreq, 0.03, 0.15, 0, 0);
    }
    
    // ========================================
    // BACKGROUND MUSIC SYSTEM
    // ========================================
    // Creates ambient, retro-futuristic music that builds connection
    // with the player while maintaining the classic Pong atmosphere
    
    startBackgroundMusic() {
        if (!this.enabled || !this.initialized || this.musicPlaying) return;
        
        this.musicPlaying = true;
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.12; // Subtle background presence
        this.musicGain.connect(this.masterGain);
        
        // Start all music layers
        this.startBassLayer();
        this.startPadLayer();
        this.startArpeggioLayer();
        this.startTextureLayer();
        
        console.log('🎵 Background music started');
    }
    
    stopBackgroundMusic() {
        if (!this.musicPlaying) return;
        
        this.musicPlaying = false;
        
        // Stop all scheduled notes
        if (this.bassInterval) clearInterval(this.bassInterval);
        if (this.padInterval) clearInterval(this.padInterval);
        if (this.arpeggioInterval) clearInterval(this.arpeggioInterval);
        if (this.textureInterval) clearInterval(this.textureInterval);
        
        // Fade out
        if (this.musicGain) {
            const now = this.audioContext.currentTime;
            this.musicGain.gain.linearRampToValueAtTime(0, now + 0.5);
        }
        
        console.log('🎵 Background music stopped');
    }
    
    // Deep bass drone - the foundation of the soundscape
    startBassLayer() {
        if (!this.musicPlaying) return;
        
        const ctx = this.audioContext;
        const bassNotes = [55, 55, 73.4, 55]; // A1, A1, D2, A1 - simple but effective
        let noteIndex = 0;
        
        const playBassNote = () => {
            if (!this.musicPlaying) return;
            
            const now = ctx.currentTime;
            const freq = bassNotes[noteIndex % bassNotes.length];
            
            // Main bass oscillator with LFO wobble
            const osc = ctx.createOscillator();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const envelope = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            // LFO modulates the bass frequency for warmth
            lfo.type = 'sine';
            lfo.frequency.value = 4; // 4Hz wobble
            lfoGain.gain.value = 3; // Subtle pitch wobble
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            // Bass oscillator
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            
            // Low-pass filter for warmth
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            filter.Q.value = 2;
            
            // Envelope
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(1.0, now + 0.1);
            envelope.gain.setValueAtTime(0.8, now + 1.5);
            envelope.gain.linearRampToValueAtTime(0, now + 2.0);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(this.musicGain);
            
            lfo.start(now);
            osc.start(now);
            lfo.stop(now + 2.0);
            osc.stop(now + 2.0);
            
            noteIndex++;
        };
        
        playBassNote();
        this.bassInterval = setInterval(playBassNote, 2000);
    }
    
    // Warm pad layer - creates emotional depth
    startPadLayer() {
        if (!this.musicPlaying) return;
        
        const ctx = this.audioContext;
        // Am chord tones - melancholic but determined
        const padChords = [
            [220, 261.6, 329.6],  // Am
            [196, 246.9, 293.7],  // Dm/G
            [174.6, 220, 261.6],  // F
            [164.8, 207.7, 246.9] // Em
        ];
        let chordIndex = 0;
        
        const playPadChord = () => {
            if (!this.musicPlaying) return;
            
            const now = ctx.currentTime;
            const chord = padChords[chordIndex % padChords.length];
            
            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const envelope = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                const panner = ctx.createStereoPanner();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                // Subtle stereo spread
                panner.pan.value = (i - 1) * 0.3;
                
                // Soft filter
                filter.type = 'lowpass';
                filter.frequency.value = 800;
                
                // Very slow attack/release for pad feel
                envelope.gain.setValueAtTime(0, now);
                envelope.gain.linearRampToValueAtTime(0.15, now + 1.0);
                envelope.gain.setValueAtTime(0.12, now + 3.0);
                envelope.gain.linearRampToValueAtTime(0, now + 4.0);
                
                osc.connect(filter);
                filter.connect(envelope);
                envelope.connect(panner);
                panner.connect(this.musicGain);
                
                osc.start(now);
                osc.stop(now + 4.0);
            });
            
            chordIndex++;
        };
        
        // Start slightly offset from bass
        setTimeout(() => {
            if (this.musicPlaying) {
                playPadChord();
                this.padInterval = setInterval(playPadChord, 4000);
            }
        }, 500);
    }
    
    // Subtle arpeggio layer - adds movement and interest
    startArpeggioLayer() {
        if (!this.musicPlaying) return;
        
        const ctx = this.audioContext;
        // Pentatonic scale for pleasant melodic movement
        const notes = [220, 246.9, 293.7, 329.6, 392, 440]; // A minor pentatonic
        let step = 0;
        
        const playArpeggioNote = () => {
            if (!this.musicPlaying) return;
            
            const now = ctx.currentTime;
            
            // Skip some notes for variation (not every beat)
            if (Math.random() > 0.6) {
                step++;
                return;
            }
            
            // Select note with slight randomization
            const noteIndex = step % notes.length;
            const freq = notes[noteIndex];
            
            const osc = ctx.createOscillator();
            const envelope = ctx.createGain();
            const panner = ctx.createStereoPanner();
            
            osc.type = 'sine';
            osc.frequency.value = freq * 2; // One octave up
            
            // Pan alternates left/right
            panner.pan.value = (step % 2 === 0) ? -0.4 : 0.4;
            
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.08, now + 0.02);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            osc.connect(envelope);
            envelope.connect(panner);
            panner.connect(this.musicGain);
            
            osc.start(now);
            osc.stop(now + 0.3);
            
            step++;
        };
        
        // Start after a moment
        setTimeout(() => {
            if (this.musicPlaying) {
                this.arpeggioInterval = setInterval(playArpeggioNote, 250);
            }
        }, 1000);
    }
    
    // Texture layer - filtered noise for atmosphere
    startTextureLayer() {
        if (!this.musicPlaying) return;
        
        const ctx = this.audioContext;
        
        const playTexture = () => {
            if (!this.musicPlaying) return;
            
            const now = ctx.currentTime;
            const bufferSize = ctx.sampleRate * 3;
            
            // Create noise buffer
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 5;
            
            // Slow filter sweep
            filter.frequency.setValueAtTime(500, now);
            filter.frequency.linearRampToValueAtTime(2000, now + 1.5);
            filter.frequency.linearRampToValueAtTime(500, now + 3.0);
            
            const envelope = ctx.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.02, now + 0.5);
            envelope.gain.setValueAtTime(0.015, now + 2.5);
            envelope.gain.linearRampToValueAtTime(0, now + 3.0);
            
            source.connect(filter);
            filter.connect(envelope);
            envelope.connect(this.musicGain);
            
            source.start(now);
        };
        
        // Start after other layers
        setTimeout(() => {
            if (this.musicPlaying) {
                playTexture();
                this.textureInterval = setInterval(playTexture, 6000);
            }
        }, 2000);
    }
    
    // Update music intensity based on game state
    updateMusicIntensity(intensity) {
        // intensity: 0.0 (calm) to 1.0 (intense)
        if (this.musicGain) {
            const baseVolume = 0.12;
            const maxVolume = 0.20;
            const targetVolume = baseVolume + (maxVolume - baseVolume) * intensity;
            this.musicGain.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + 0.3);
        }
    }
}

// Create global audio instance
const audio = new MasteryAudioSystem();

// Convenience wrapper functions for game.js
function initAudio() {
    audio.init();
    audio.resume();
}

function playPaddleHit(hitPosition = 0, ballXNormalized = 0.5) {
    audio.playPaddleHit(hitPosition, ballXNormalized);
}

function playWallBounce(ballXNormalized = 0.5) {
    audio.playWallBounce(ballXNormalized);
}

function playScore(isPlayerScore, ballXNormalized = 0.5) {
    audio.playScore(isPlayerScore, ballXNormalized);
}

function playGameStart() {
    audio.playGameStart();
}

function playVictory() {
    audio.playVictory();
}

function playDefeat() {
    audio.playDefeat();
}

function toggleMute() {
    return audio.toggleMute();
}

function startBackgroundMusic() {
    audio.startBackgroundMusic();
}

function stopBackgroundMusic() {
    audio.stopBackgroundMusic();
}

function updateMusicIntensity(intensity) {
    audio.updateMusicIntensity(intensity);
}
