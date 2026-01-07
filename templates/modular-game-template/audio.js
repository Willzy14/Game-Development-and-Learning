// ============================================
// AUDIO.JS - SOUNDS ONLY
// ============================================
// This file contains ALL audio code:
//    - Sound effects
//    - Background music
//    - Volume control
//
// ❌ NO visual rendering
// ❌ NO game logic or state changes
// ❌ NO game constants
//
// To create a new audio theme:
// 1. Copy this file
// 2. Change the sounds/music
// 3. Keep all function signatures the same
// ============================================

const AUDIO = {
    ctx: null,
    initialized: false,
    muted: false,
    masterVolume: 0.5,
    
    // Music state
    musicPlaying: false,
    musicNodes: [],
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    init() {
        if (this.initialized) return;
        
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Web Audio not supported:', e);
        }
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    createOscillator(type, frequency, duration, volume = 0.3) {
        if (!this.initialized || this.muted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
        
        return osc;
    },
    
    // ============================================
    // GAME SOUND EFFECTS (Required functions)
    // ============================================
    
    playEnemyDestroyed() {
        // Positive sound for destroying enemy
        this.createOscillator('square', 440, 0.1, 0.2);
        setTimeout(() => this.createOscillator('square', 660, 0.1, 0.2), 50);
        setTimeout(() => this.createOscillator('square', 880, 0.15, 0.2), 100);
    },
    
    playPlayerHit() {
        // Negative sound for taking damage
        this.createOscillator('sawtooth', 200, 0.3, 0.3);
        this.createOscillator('sawtooth', 150, 0.3, 0.2);
    },
    
    playWallHit() {
        // Neutral bounce sound
        this.createOscillator('sine', 300, 0.05, 0.15);
    },
    
    playGameOver() {
        // Sad descending sound
        this.createOscillator('square', 440, 0.2, 0.25);
        setTimeout(() => this.createOscillator('square', 350, 0.2, 0.25), 200);
        setTimeout(() => this.createOscillator('square', 280, 0.3, 0.25), 400);
        setTimeout(() => this.createOscillator('square', 220, 0.4, 0.25), 600);
    },
    
    playLevelComplete() {
        // Happy ascending arpeggio
        const notes = [262, 330, 392, 523]; // C major arpeggio
        notes.forEach((freq, i) => {
            setTimeout(() => this.createOscillator('square', freq, 0.15, 0.2), i * 100);
        });
    },
    
    // ============================================
    // BACKGROUND MUSIC
    // ============================================
    
    startMusic() {
        if (!this.initialized || this.muted || this.musicPlaying) return;
        
        this.musicPlaying = true;
        this.playMusicLoop();
    },
    
    playMusicLoop() {
        if (!this.musicPlaying || this.muted) return;
        
        // Simple ambient drone music
        // Override this for different theme music
        
        const now = this.ctx.currentTime;
        
        // Bass drone
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(110, now); // A2
        bassGain.gain.setValueAtTime(0.1 * this.masterVolume, now);
        bass.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bass.start(now);
        bass.stop(now + 4);
        
        // Store for cleanup
        this.musicNodes.push(bass);
        
        // Schedule next loop
        setTimeout(() => {
            if (this.musicPlaying) {
                this.playMusicLoop();
            }
        }, 3900);
    },
    
    stopMusic() {
        this.musicPlaying = false;
        
        // Stop all music nodes
        this.musicNodes.forEach(node => {
            try {
                node.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.musicNodes = [];
    },
    
    updateMusic(intensity) {
        // Called every frame with game intensity (0-1)
        // Override for dynamic music that responds to gameplay
        // intensity could affect tempo, layers, etc.
    },
    
    // ============================================
    // CONTROLS
    // ============================================
    
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            this.stopMusic();
        } else if (this.musicPlaying === false) {
            // Was playing before mute
        }
        
        return this.muted;
    },
    
    setVolume(level) {
        this.masterVolume = Math.max(0, Math.min(1, level));
    },
    
    // ============================================
    // UPDATE (Called every frame)
    // ============================================
    
    update(gameState) {
        // Optional: Use gameState to adjust music dynamically
        // e.g., speed up music as fewer enemies remain
        
        if (!this.initialized) return;
        
        // Example: Calculate intensity based on score
        // const intensity = Math.min(1, gameState.score / 1000);
        // this.updateMusic(intensity);
    }
};
