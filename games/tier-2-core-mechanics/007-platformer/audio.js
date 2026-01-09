/**
 * LANTERN SPIRIT - AUDIO FILE
 * 
 * Ethereal, mystical audio for the twilight swamp.
 * Soft, magical sounds that complement the atmospheric visuals.
 * 
 * Based on patterns from shared-library/audio/AudioSystem.js
 * Extended with platformer-specific sounds and ambient music.
 */

// =============================================================================
// AUDIO OBJECT
// =============================================================================

const AUDIO = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    enabled: true,
    
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    
    init() {
        if (this.ctx) return;
        
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.4;
            this.masterGain.connect(this.ctx.destination);
            
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.35;  // Louder music
            this.musicGain.connect(this.masterGain);
            
        } catch (e) {
            console.warn('Web Audio not available:', e);
            this.enabled = false;
        }
    },
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    // =========================================================================
    // SOUND EFFECTS
    // =========================================================================
    
    playJump() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Soft whoosh with rising pitch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.15);
    },
    
    playDoubleJump() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Magical sparkle - two tones
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        
        osc2.frequency.setValueAtTime(800, now);
        osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
    },
    
    playLand() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Soft thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    },
    
    playCollect() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Magical chime arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.05;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    },
    
    playDeath() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Sad descending tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.6);
        
        // Stop music
        this.stopMusic();
    },
    
    playVictory() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Triumphant fanfare
        const melody = [
            { freq: 523, time: 0, dur: 0.15 },     // C5
            { freq: 659, time: 0.15, dur: 0.15 },  // E5
            { freq: 784, time: 0.3, dur: 0.15 },   // G5
            { freq: 1047, time: 0.45, dur: 0.4 },  // C6 (held)
        ];
        
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = note.freq;
            
            const startTime = now + note.time;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + note.dur + 0.1);
        });
        
        // Stop music
        this.stopMusic();
    },
    
    playUISelect() {
        if (!this.enabled || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(550, now + 0.05);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    },
    
    // =========================================================================
    // MUSIC SYSTEM - Ethereal ambient soundtrack
    // =========================================================================
    
    music: {
        playing: false,
        drone: null,
        droneLFO: null,
        arpInterval: null,
        padInterval: null,
        nodes: []
    },
    
    // Pentatonic scale for dreamy feel (A minor pentatonic)
    scale: [220, 261.6, 293.7, 349.2, 392, 440, 523.3, 587.3],
    
    startMusic() {
        if (!this.enabled || !this.ctx || this.music.playing) return;
        
        this.music.playing = true;
        
        this._startDrone();
        this._startArpeggio();
        this._startPads();
    },
    
    stopMusic() {
        if (!this.music.playing) return;
        
        this.music.playing = false;
        
        // Clear intervals
        if (this.music.arpInterval) {
            clearInterval(this.music.arpInterval);
            this.music.arpInterval = null;
        }
        if (this.music.padInterval) {
            clearInterval(this.music.padInterval);
            this.music.padInterval = null;
        }
        
        // Stop drone
        if (this.music.drone) {
            try { this.music.drone.stop(); } catch(e) {}
            this.music.drone = null;
        }
        if (this.music.droneLFO) {
            try { this.music.droneLFO.stop(); } catch(e) {}
            this.music.droneLFO = null;
        }
        
        // Stop all nodes
        this.music.nodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        this.music.nodes = [];
    },
    
    _startDrone() {
        // Low ethereal drone - louder and richer
        this.music.drone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        
        this.music.drone.type = 'sine';
        this.music.drone.frequency.value = 110; // A2
        droneGain.gain.value = 0.12;  // Louder
        
        // Subtle vibrato
        this.music.droneLFO = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        this.music.droneLFO.frequency.value = 0.2;
        lfoGain.gain.value = 3;
        this.music.droneLFO.connect(lfoGain);
        lfoGain.connect(this.music.drone.frequency);
        
        // Fifth harmony
        const droneHarmony = this.ctx.createOscillator();
        const harmonyGain = this.ctx.createGain();
        droneHarmony.type = 'sine';
        droneHarmony.frequency.value = 165; // E3
        harmonyGain.gain.value = 0.08;  // Louder
        
        // Octave below for depth
        const droneSub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        droneSub.type = 'sine';
        droneSub.frequency.value = 55; // A1
        subGain.gain.value = 0.1;
        
        this.music.drone.connect(droneGain);
        droneHarmony.connect(harmonyGain);
        droneSub.connect(subGain);
        droneGain.connect(this.musicGain);
        harmonyGain.connect(this.musicGain);
        subGain.connect(this.musicGain);
        
        this.music.drone.start();
        this.music.droneLFO.start();
        droneHarmony.start();
        droneSub.start();
        
        this.music.nodes.push(droneHarmony);
        this.music.nodes.push(droneSub);
    },
    
    _startArpeggio() {
        let noteIndex = 0;
        
        const playNote = () => {
            if (!this.music.playing || !this.ctx) return;
            
            const now = this.ctx.currentTime;
            const note = this.scale[noteIndex % this.scale.length];
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.value = note;
            
            filter.type = 'lowpass';
            filter.frequency.value = note * 3;
            
            gain.gain.setValueAtTime(0.08, now);  // Louder
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start(now);
            osc.stop(now + 1.5);
            
            // Random walk through scale
            noteIndex += Math.random() > 0.5 ? 1 : -1;
            if (noteIndex < 0) noteIndex = 0;
            if (noteIndex >= this.scale.length) noteIndex = this.scale.length - 1;
        };
        
        // More frequent notes
        this.music.arpInterval = setInterval(playNote, 1200 + Math.random() * 800);
        playNote();
    },
    
    _startPads() {
        // Richer pad chords
        const chords = [
            [220, 261.6, 329.6],  // Am
            [196, 261.6, 329.6],  // C/G
            [174.6, 220, 293.7],  // F/D
            [196, 246.9, 293.7],  // G
        ];
        let chordIndex = 0;
        
        const playPad = () => {
            if (!this.music.playing || !this.ctx) return;
            
            const now = this.ctx.currentTime;
            const chord = chords[chordIndex];
            
            chord.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc2.type = 'sine';
                osc.frequency.value = freq;
                osc2.frequency.value = freq * 1.002; // Slight detune for warmth
                
                // Slow attack and release - louder
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.05, now + 1.5);
                gain.gain.linearRampToValueAtTime(0.05, now + 4);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 6);
                
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(now + i * 0.15);
                osc2.start(now + i * 0.15);
                osc.stop(now + 6);
                osc2.stop(now + 6);
            });
            
            chordIndex = (chordIndex + 1) % chords.length;
        };
        
        // More frequent pads
        this.music.padInterval = setInterval(playPad, 4500);
        playPad();
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUDIO;
}
