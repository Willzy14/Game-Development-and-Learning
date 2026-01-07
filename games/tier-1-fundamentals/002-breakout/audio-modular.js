// ============================================
// AUDIO.JS - SOUNDS ONLY (DEFAULT BREAKOUT THEME)
// ============================================
// This file contains ALL audio code:
//    - Sound effects
//    - Volume control
//
// ❌ NO visual rendering
// ❌ NO game logic or state changes
// ❌ NO game constants
//
// To create a new audio theme:
// 1. Copy this file
// 2. Change the sounds
// 3. Keep all function signatures the same
// ============================================

const AUDIO = {
    ctx: null,
    initialized: false,
    enabled: true,
    masterVolume: 0.3,
    
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
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    playBeep(frequency, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.ctx;
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
    },
    
    playDualTone(freq1, freq2, duration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.ctx;
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
    },
    
    playSequence(notes, noteDuration, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, noteDuration, volume);
            }, index * noteDuration * 1000);
        });
    },
    
    // ============================================
    // GAME SOUND EFFECTS (Required interface)
    // ============================================
    
    // Paddle hit - Mid pitch
    playPaddleHit() {
        this.playBeep(440, 0.08, 0.5);
    },
    
    // Wall bounce - Lower pitch
    playWallHit() {
        this.playBeep(220, 0.06, 0.3);
    },
    
    // Brick break - Higher pitch with slight variation
    playBrickBreak() {
        const baseFreq = 523; // C5
        const variation = Math.random() * 100 - 50; // ±50Hz variation
        this.playDualTone(baseFreq + variation, baseFreq * 1.5 + variation, 0.1, 0.6);
    },
    
    // Level complete - Triumphant ascending sequence
    playLevelComplete() {
        const notes = [262, 330, 392, 523, 659]; // C, E, G, C, E (one octave up)
        this.playSequence(notes, 0.12, 0.7);
    },
    
    // Lose life - Two-tone down
    playLoseLife() {
        this.playDualTone(392, 262, 0.3, 0.6); // G to C descent
    },
    
    // Game over - Sad descending sequence
    playGameOver() {
        const notes = [392, 349, 330, 294, 262]; // G, F, E, D, C
        this.playSequence(notes, 0.2, 0.7);
    },
    
    // Game start - Upbeat dual tone
    playGameStart() {
        this.playDualTone(262, 392, 0.2, 0.5); // C and G chord
        setTimeout(() => {
            this.playDualTone(330, 523, 0.2, 0.5); // E and C chord
        }, 150);
    },
    
    // ============================================
    // CONTROLS
    // ============================================
    
    toggleMute() {
        this.enabled = !this.enabled;
        return !this.enabled;
    },
    
    setVolume(level) {
        this.masterVolume = Math.max(0, Math.min(1, level));
    }
};
