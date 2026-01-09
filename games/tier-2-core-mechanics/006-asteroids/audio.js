// ============================================
// ASTEROIDS - Audio System
// Web Audio API with procedural sound generation
// ============================================

const AudioSystem = {
    ctx: null,
    masterGain: null,
    muted: false,
    
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.3;
        } catch (e) {
            console.warn('Web Audio not supported');
        }
    },
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    // Laser/shoot sound - short high-pitched zap
    shoot() {
        if (!this.ctx || this.muted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },
    
    // Thrust sound - low rumble
    thrustStart() {
        if (!this.ctx || this.muted || this.thrustOsc) return;
        
        this.thrustOsc = this.ctx.createOscillator();
        this.thrustGain = this.ctx.createGain();
        const noise = this.ctx.createOscillator();
        
        this.thrustOsc.connect(this.thrustGain);
        noise.connect(this.thrustGain);
        this.thrustGain.connect(this.masterGain);
        
        this.thrustOsc.type = 'sawtooth';
        this.thrustOsc.frequency.value = 60;
        
        noise.type = 'square';
        noise.frequency.value = 30;
        
        this.thrustGain.gain.value = 0.1;
        
        this.thrustOsc.start();
        noise.start();
        this.noiseOsc = noise;
    },
    
    thrustStop() {
        if (this.thrustOsc) {
            this.thrustOsc.stop();
            this.thrustOsc = null;
        }
        if (this.noiseOsc) {
            this.noiseOsc.stop();
            this.noiseOsc = null;
        }
    },
    
    // Explosion - for asteroid destruction
    explosion(size = 'medium') {
        if (!this.ctx || this.muted) return;
        
        const duration = size === 'large' ? 0.4 : size === 'medium' ? 0.25 : 0.15;
        const startFreq = size === 'large' ? 150 : size === 'medium' ? 200 : 300;
        
        // Create noise-like explosion with multiple detuned oscillators
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(startFreq * (1 + i * 0.3), this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + duration);
            
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        }
    },
    
    // Player death - longer, more dramatic
    playerDeath() {
        if (!this.ctx || this.muted) return;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200 - i * 30, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
                
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            }, i * 100);
        }
    },
    
    // Extra life / power up
    extraLife() {
        if (!this.ctx || this.muted) return;
        
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.15);
            }, i * 80);
        });
    },
    
    // New wave
    newWave() {
        if (!this.ctx || this.muted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    
    toggle() {
        this.muted = !this.muted;
        if (this.muted) {
            this.thrustStop();
        }
        return this.muted;
    }
};
