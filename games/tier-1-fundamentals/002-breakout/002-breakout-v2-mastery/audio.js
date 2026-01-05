// ============================================
// BREAKOUT V2 MASTERY EDITION - AUDIO SYSTEM
// ============================================
// Advanced audio features:
// - Procedural synthesis for all sounds
// - Dynamic pitch based on brick position
// - Combo system affects audio intensity
// - Reverb and compression
// - Stereo positioning
// - Musical brick break sounds

let audioCtx = null;
let masterGain = null;
let compressor = null;
let reverbGain = null;
let convolver = null;
let isMuted = false;

// ============================================
// INITIALIZATION
// ============================================

function initAudio() {
    if (audioCtx) return;
    
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master chain
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        
        // Compressor for punch and protection
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 12;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.15;
        
        // Reverb
        reverbGain = audioCtx.createGain();
        reverbGain.gain.value = 0.2;
        
        convolver = audioCtx.createConvolver();
        createReverbImpulse();
        
        // Connect chain
        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);
        
        // Reverb send
        reverbGain.connect(convolver);
        convolver.connect(compressor);
        
        console.log('🔊 Breakout V2 Audio initialized');
    } catch (e) {
        console.error('Audio init failed:', e);
    }
}

function createReverbImpulse() {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 1.2; // 1.2 second reverb
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // Exponential decay with early reflections
            data[i] = (Math.random() * 2 - 1) * Math.exp(-4 * t) * (1 + Math.sin(t * 50) * 0.1);
        }
    }
    
    convolver.buffer = impulse;
}

function toggleMute() {
    isMuted = !isMuted;
    if (masterGain) {
        masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.5, audioCtx.currentTime, 0.1);
    }
    return isMuted;
}

// ============================================
// ADSR ENVELOPE
// ============================================

function applyEnvelope(gainNode, attack, decay, sustain, release, duration) {
    const now = audioCtx.currentTime;
    const peak = 1;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peak, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    gainNode.gain.setValueAtTime(sustain, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
}

// ============================================
// MUSICAL SCALE FOR BRICK SOUNDS
// ============================================

// C major pentatonic scale frequencies for brick rows
const BRICK_SCALE = {
    0: 523.25, // C5
    1: 587.33, // D5
    2: 659.25, // E5
    3: 783.99, // G5
    4: 880.00, // A5
    5: 1046.50 // C6
};

// Chord notes for combos (major chord)
function getChordFrequencies(root) {
    return [root, root * 1.25, root * 1.5]; // Root, major third, fifth
}

// ============================================
// SOUND EFFECTS
// ============================================

function playBrickBreak(row, col, comboCount = 0) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.3 + comboCount * 0.05;
    
    // Base frequency from brick row (musical note)
    const baseFreq = BRICK_SCALE[row] || 440;
    
    // Pan based on column position (-1 to 1)
    const pan = (col / 10) * 2 - 1;
    
    // Create oscillator with harmonics
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const gain2 = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner();
    
    // Main tone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + duration);
    
    // Harmonic (octave higher, quieter)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq, now + duration);
    
    // Envelopes
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3 + comboCount * 0.02, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    panner.pan.value = pan;
    
    // Connect
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(panner);
    gain2.connect(panner);
    panner.connect(masterGain);
    panner.connect(reverbGain);
    
    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration);
    osc2.stop(now + duration);
    
    // Add click sound for impact
    playImpactClick(baseFreq, pan, 0.1);
}

function playImpactClick(pitch, pan, volume) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.05;
    
    // Noise burst for click
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = pitch;
    
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    
    const panner = audioCtx.createStereoPanner();
    panner.pan.value = pan;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    
    noise.start(now);
}

function playComboSound(comboCount) {
    if (!audioCtx || isMuted || comboCount < 3) return;
    
    const now = audioCtx.currentTime;
    
    // Ascending arpeggio based on combo
    const baseFreq = 440 * Math.pow(1.059463, comboCount); // Semi-tone up per combo
    const notes = getChordFrequencies(baseFreq);
    
    notes.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(masterGain);
            gain.connect(reverbGain);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }, i * 50);
    });
}

function playPaddleHit(hitPosition) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.15;
    
    // Pitch based on hit position
    const baseFreq = 200 + hitPosition * 100; // -100 to +100
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq + 50, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + duration);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
    
    // Add thump
    const thump = audioCtx.createOscillator();
    const thumpGain = audioCtx.createGain();
    
    thump.type = 'sine';
    thump.frequency.setValueAtTime(100, now);
    thump.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    
    thumpGain.gain.setValueAtTime(0.3, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    thump.connect(thumpGain);
    thumpGain.connect(masterGain);
    
    thump.start(now);
    thump.stop(now + 0.1);
}

function playWallBounce(panPosition) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.08;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    panner.pan.value = panPosition;
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playLoseLife() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Descending sad sound
    const notes = [440, 392, 349, 311];
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.12;
        const duration = 0.3;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        // Filter for softer sound
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    });
}

function playLevelComplete() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Triumphant ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major scale up
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;
        
        const startTime = now + i * 0.1;
        const duration = 0.4;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbGain);
        
        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + duration);
        osc2.stop(startTime + duration);
    });
    
    // Final chord
    setTimeout(() => {
        const chord = [523.25, 659.25, 783.99]; // C major chord
        chord.forEach(freq => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            
            osc.connect(gain);
            gain.connect(masterGain);
            gain.connect(reverbGain);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 1);
        });
    }, 500);
}

function playGameOver() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Dark descending pattern
    const notes = [392, 349, 311, 277, 233];
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now + i * 0.15);
        filter.frequency.exponentialRampToValueAtTime(200, now + i * 0.15 + 0.4);
        
        const startTime = now + i * 0.15;
        const duration = 0.5;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    });
}

function playGameStart() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Quick ascending sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
    
    // Confirmation beeps
    [0.15, 0.25].forEach(delay => {
        const beep = audioCtx.createOscillator();
        const beepGain = audioCtx.createGain();
        
        beep.type = 'triangle';
        beep.frequency.value = 880;
        
        const startTime = now + delay;
        beepGain.gain.setValueAtTime(0.15, startTime);
        beepGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
        
        beep.connect(beepGain);
        beepGain.connect(masterGain);
        
        beep.start(startTime);
        beep.stop(startTime + 0.08);
    });
}

function playMultiBreak(count) {
    // Multiple bricks broken at once (power-up scenario)
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Explosive sound
    const noise = createNoiseBuffer(0.3);
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noise;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    filter.Q.value = 2;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    gain.connect(reverbGain);
    
    noiseSource.start(now);
}

function createNoiseBuffer(duration) {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

// Export functions for use in game.js
window.initAudio = initAudio;
window.toggleMute = toggleMute;
window.playBrickBreak = playBrickBreak;
window.playComboSound = playComboSound;
window.playPaddleHit = playPaddleHit;
window.playWallBounce = playWallBounce;
window.playLoseLife = playLoseLife;
window.playLevelComplete = playLevelComplete;
window.playGameOver = playGameOver;
window.playGameStart = playGameStart;
window.playMultiBreak = playMultiBreak;
