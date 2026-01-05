// ============================================
// SPACE INVADERS V2 MASTERY EDITION - AUDIO SYSTEM
// ============================================
// Advanced audio features:
// - Retro synth laser sounds
// - Explosion synthesis with noise
// - Adaptive music system (intensity changes)
// - Spatial audio for enemy positions
// - Warning sounds for low shields/lives

let audioCtx = null;
let masterGain = null;
let compressor = null;
let reverbGain = null;
let convolver = null;
let musicGain = null;
let isMuted = false;

// Background music state
let musicPlaying = false;
let bassDrone = null;
let pulseOsc = null;

// ============================================
// INITIALIZATION
// ============================================

function initAudio() {
    if (audioCtx) return;
    
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master chain
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.4;
        
        // Compressor
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 10;
        compressor.ratio.value = 6;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.1;
        
        // Reverb for explosions
        reverbGain = audioCtx.createGain();
        reverbGain.gain.value = 0.15;
        
        convolver = audioCtx.createConvolver();
        createReverbImpulse();
        
        // Music gain (separate for volume control)
        musicGain = audioCtx.createGain();
        musicGain.gain.value = 0.1;
        
        // Connect
        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);
        
        reverbGain.connect(convolver);
        convolver.connect(compressor);
        
        musicGain.connect(compressor);
        
        console.log('🔊 Space Invaders V2 Audio initialized');
    } catch (e) {
        console.error('Audio init failed:', e);
    }
}

function createReverbImpulse() {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 0.8;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-5 * t);
        }
    }
    
    convolver.buffer = impulse;
}

function toggleMute() {
    isMuted = !isMuted;
    if (masterGain) {
        masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.4, audioCtx.currentTime, 0.1);
    }
    return isMuted;
}

// ============================================
// LASER SOUND (Player shoot)
// ============================================

function playPlayerShoot() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.15;
    
    // Main laser tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + duration);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Filter for laser character
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + duration);
    filter.Q.value = 5;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
    
    // Click transient
    playClick(0.1);
}

function playClick(volume) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    const bufferSize = audioCtx.sampleRate * 0.02;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 20);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    noise.start(now);
}

// ============================================
// ENEMY LASER (different sound)
// ============================================

function playEnemyShoot(panPosition) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.12;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    panner.pan.value = panPosition;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
}

// ============================================
// EXPLOSIONS
// ============================================

function playEnemyDestroy(panPosition, enemyType) {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.3;
    
    // Pitch based on enemy type (higher enemies = higher pitch)
    const basePitch = 200 - enemyType * 30;
    
    // Noise burst
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter sweep
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(basePitch * 4, now);
    filter.frequency.exponentialRampToValueAtTime(basePitch, now + duration);
    filter.Q.value = 2;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    const panner = audioCtx.createStereoPanner();
    panner.pan.value = panPosition;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    panner.connect(reverbGain);
    
    noise.start(now);
    
    // Tonal component
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch / 2, now + duration);
    
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.connect(oscGain);
    oscGain.connect(panner);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playPlayerHit() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.5;
    
    // Heavy explosion
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 4);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    gain.connect(reverbGain);
    
    noise.start(now);
    
    // Low rumble
    const rumble = audioCtx.createOscillator();
    const rumbleGain = audioCtx.createGain();
    
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(80, now);
    rumble.frequency.exponentialRampToValueAtTime(30, now + duration);
    
    rumbleGain.gain.setValueAtTime(0.3, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    rumble.connect(rumbleGain);
    rumbleGain.connect(masterGain);
    
    rumble.start(now);
    rumble.stop(now + duration);
}

// ============================================
// SHIELD HIT
// ============================================

function playShieldHit() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    const duration = 0.1;
    
    // Electric crackle
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        // Crackle pattern
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * (Math.random() > 0.5 ? 1 : 0);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    
    const gain = audioCtx.createGain();
    gain.gain.value = 0.15;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    noise.start(now);
}

// ============================================
// WAVE COMPLETE
// ============================================

function playWaveComplete() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Triumphant fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.15;
        const duration = 0.4;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    });
}

// ============================================
// GAME OVER
// ============================================

function playGameOver() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Descending doom sound
    const notes = [392, 349, 311, 277, 247];
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        const startTime = now + i * 0.2;
        const duration = 0.5;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    });
}

// ============================================
// GAME START
// ============================================

function playGameStart() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    // Power up sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 0.4);
    
    // Confirmation beeps
    [0.3, 0.4].forEach(delay => {
        const beep = audioCtx.createOscillator();
        const beepGain = audioCtx.createGain();
        
        beep.type = 'square';
        beep.frequency.value = 880;
        
        const startTime = now + delay;
        beepGain.gain.setValueAtTime(0.1, startTime);
        beepGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
        
        beep.connect(beepGain);
        beepGain.connect(masterGain);
        
        beep.start(startTime);
        beep.stop(startTime + 0.08);
    });
}

// ============================================
// BACKGROUND MUSIC (Multi-layered Adaptive)
// ============================================
// Creates tension-building music that intensifies as enemies descend
// Uses multiple synth layers for an authentic retro sci-fi feel

// Music layer references
let bassInterval = null;
let padInterval = null;
let arpeggioInterval = null;
let heartbeatInterval = null;
let currentIntensity = 0;

function startBackgroundMusic() {
    if (!audioCtx || musicPlaying) return;
    
    musicPlaying = true;
    currentIntensity = 0;
    
    // Start all layers
    startBassLayer();
    startPadLayer();
    startArpeggioLayer();
    startHeartbeatLayer();
    
    console.log('🎵 Space Invaders music started');
}

function stopBackgroundMusic() {
    musicPlaying = false;
    
    if (bassInterval) clearInterval(bassInterval);
    if (padInterval) clearInterval(padInterval);
    if (arpeggioInterval) clearInterval(arpeggioInterval);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    bassInterval = null;
    padInterval = null;
    arpeggioInterval = null;
    heartbeatInterval = null;
    
    // Fade out music gain
    if (musicGain) {
        const now = audioCtx.currentTime;
        musicGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }
    
    console.log('🎵 Space Invaders music stopped');
}

// Deep pulsing bass - creates menacing undertone
function startBassLayer() {
    if (!musicPlaying) return;
    
    // Menacing bassline in D minor
    const bassNotes = [36.7, 36.7, 41.2, 36.7]; // D1, D1, E1, D1
    let noteIndex = 0;
    
    const playBass = () => {
        if (!musicPlaying || !audioCtx) return;
        
        const now = audioCtx.currentTime;
        const freq = bassNotes[noteIndex % bassNotes.length];
        
        // Main bass with LFO for wobble
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const envelope = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        // LFO creates menacing wobble
        lfo.type = 'sine';
        lfo.frequency.value = 5 + currentIntensity * 3; // Faster wobble at higher intensity
        lfoGain.gain.value = 2 + currentIntensity * 2;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        
        filter.type = 'lowpass';
        filter.frequency.value = 100 + currentIntensity * 100;
        filter.Q.value = 8;
        
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.8, now + 0.05);
        envelope.gain.setValueAtTime(0.6, now + 0.8);
        envelope.gain.linearRampToValueAtTime(0, now + 1.0);
        
        osc.connect(filter);
        filter.connect(envelope);
        envelope.connect(musicGain);
        
        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 1.0);
        osc.stop(now + 1.0);
        
        noteIndex++;
    };
    
    playBass();
    bassInterval = setInterval(playBass, 1000);
}

// Eerie pad layer - creates atmosphere
function startPadLayer() {
    if (!musicPlaying) return;
    
    // Minor chord progression for tension
    const chords = [
        [73.4, 87.3, 110],   // Dm
        [65.4, 82.4, 98],    // Cm
        [73.4, 92.5, 110],   // Dm with raised 4th
        [61.7, 77.8, 92.5]   // Bbm
    ];
    let chordIndex = 0;
    
    const playPad = () => {
        if (!musicPlaying || !audioCtx) return;
        
        const now = audioCtx.currentTime;
        const chord = chords[chordIndex % chords.length];
        
        chord.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const envelope = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            const panner = audioCtx.createStereoPanner();
            
            osc.type = 'sine';
            osc.frequency.value = freq * 2; // Octave up for clarity
            
            // Spread across stereo field
            panner.pan.value = (i - 1) * 0.4;
            
            filter.type = 'lowpass';
            filter.frequency.value = 400 + currentIntensity * 400;
            
            // Slow attack for pad feel
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.08 + currentIntensity * 0.05, now + 0.8);
            envelope.gain.setValueAtTime(0.06 + currentIntensity * 0.04, now + 3.0);
            envelope.gain.linearRampToValueAtTime(0, now + 4.0);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(panner);
            panner.connect(musicGain);
            
            osc.start(now);
            osc.stop(now + 4.0);
        });
        
        chordIndex++;
    };
    
    setTimeout(() => {
        if (musicPlaying) {
            playPad();
            padInterval = setInterval(playPad, 4000);
        }
    }, 500);
}

// Arpeggio layer - creates urgency (increases with intensity)
function startArpeggioLayer() {
    if (!musicPlaying) return;
    
    // D minor arpeggio
    const notes = [146.8, 174.6, 220, 261.6, 293.7]; // D3, F3, A3, C4, D4
    let step = 0;
    
    const playArpeggio = () => {
        if (!musicPlaying || !audioCtx) return;
        
        // Play more notes at higher intensity
        if (Math.random() > 0.3 + currentIntensity * 0.5) {
            step++;
            return;
        }
        
        const now = audioCtx.currentTime;
        const noteIndex = step % notes.length;
        const freq = notes[noteIndex];
        
        const osc = audioCtx.createOscillator();
        const envelope = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        const panner = audioCtx.createStereoPanner();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        // Alternating pan for movement
        panner.pan.value = (step % 2 === 0) ? -0.5 : 0.5;
        
        filter.type = 'bandpass';
        filter.frequency.value = 800 + currentIntensity * 500;
        filter.Q.value = 2;
        
        const volume = 0.05 + currentIntensity * 0.08;
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(volume, now + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.connect(filter);
        filter.connect(envelope);
        envelope.connect(panner);
        panner.connect(musicGain);
        
        osc.start(now);
        osc.stop(now + 0.15);
        
        step++;
    };
    
    setTimeout(() => {
        if (musicPlaying) {
            arpeggioInterval = setInterval(playArpeggio, 150);
        }
    }, 1000);
}

// Heartbeat layer - tension indicator (faster at high intensity)
function startHeartbeatLayer() {
    if (!musicPlaying) return;
    
    let lastBeat = 0;
    let beatInterval = 1000; // Start slow
    
    const playHeartbeat = () => {
        if (!musicPlaying || !audioCtx) return;
        
        const now = audioCtx.currentTime;
        
        // Double beat like a heartbeat
        [0, 0.15].forEach(delay => {
            const osc = audioCtx.createOscillator();
            const envelope = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = 40; // Very low
            
            filter.type = 'lowpass';
            filter.frequency.value = 80;
            
            const volume = 0.1 + currentIntensity * 0.15;
            envelope.gain.setValueAtTime(0, now + delay);
            envelope.gain.linearRampToValueAtTime(volume, now + delay + 0.02);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
            
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(musicGain);
            
            osc.start(now + delay);
            osc.stop(now + delay + 0.2);
        });
        
        // Adjust beat speed based on intensity
        beatInterval = 1200 - currentIntensity * 600; // 1200ms at calm, 600ms at intense
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(playHeartbeat, beatInterval);
    };
    
    setTimeout(() => {
        if (musicPlaying) {
            playHeartbeat();
        }
    }, 2000);
}

function setMusicIntensity(intensity) {
    // 0 = calm, 1 = intense (enemies close to player)
    currentIntensity = Math.max(0, Math.min(1, intensity));
    
    if (musicGain) {
        // Volume increases with intensity
        const baseVolume = 0.08;
        const maxVolume = 0.18;
        const targetVolume = baseVolume + (maxVolume - baseVolume) * intensity;
        musicGain.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.3);
    }
}

// ============================================
// WARNING SOUNDS
// ============================================

function playWarningSound() {
    if (!audioCtx || isMuted) return;
    
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 440;
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0, now + 0.1);
    gain.gain.setValueAtTime(0.1, now + 0.2);
    gain.gain.setValueAtTime(0, now + 0.3);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
}

// Export
window.initAudio = initAudio;
window.toggleMute = toggleMute;
window.playPlayerShoot = playPlayerShoot;
window.playEnemyShoot = playEnemyShoot;
window.playEnemyDestroy = playEnemyDestroy;
window.playPlayerHit = playPlayerHit;
window.playShieldHit = playShieldHit;
window.playWaveComplete = playWaveComplete;
window.playGameOver = playGameOver;
window.playGameStart = playGameStart;
window.startBackgroundMusic = startBackgroundMusic;
window.stopBackgroundMusic = stopBackgroundMusic;
window.setMusicIntensity = setMusicIntensity;
window.playWarningSound = playWarningSound;
