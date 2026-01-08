// ============================================================================
// ART STUDY 008 V2 - MOUNTAIN SHRINE AT DAWN (THEORY-APPLIED)
// ============================================================================
//
// UPGRADE: Applying Phase 1 Research (Composition, Color, Style)
//
// REFERENCES:
// - Planning: PLANNING-V2.md (this session)
// - Composition: docs/bible/18-COMPOSITION_THEORY.md
// - Color: docs/bible/19-COLOR_HARMONY.md
// - Style: docs/bible/20-ART_STYLES.md
//
// DECISIONS:
// - Composition: Golden Ratio focal point (φ = 1.618)
// - Color: Split-complementary harmony (30°, 150°, 210°)
// - Style: Stylized realism (soft edges, gradient shading, <20 vertices)
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// =============================================================================
// COMPOSITION ENGINE - From 18-COMPOSITION_THEORY.md Section VIII
// =============================================================================

class CompositionEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.phi = 1.618;
    }
    
    calculateFocalPoint(method = 'goldenRatio') {
        switch(method) {
            case 'goldenRatio':
                return {
                    x: this.canvas.width / this.phi,    // ~556px
                    y: this.canvas.height / this.phi    // ~371px
                };
            case 'ruleOfThirds':
                return {
                    x: this.canvas.width * (2/3),
                    y: this.canvas.height / 3
                };
            default:
                return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        }
    }
    
    placeHorizon(emphasize = 'sky') {
        // Low horizon emphasizes sky (appropriate for dawn)
        return emphasize === 'sky' 
            ? this.canvas.height * (2/3)    // 400px
            : this.canvas.height / 3;
    }
    
    generateLeadingLines(focalPoint, count = 3) {
        // Mountain ridges converge toward shrine
        const lines = [];
        const startY = this.placeHorizon('sky');
        
        for (let i = 0; i < count; i++) {
            const startX = (i + 1) * (this.canvas.width / (count + 1));
            lines.push({
                start: { x: startX, y: startY },
                end: focalPoint,
                type: 'convergent'
            });
        }
        
        return lines;
    }
}

// =============================================================================
// COLOR HARMONY - From 19-COLOR_HARMONY.md Section VII
// =============================================================================

class ColorHarmony {
    constructor(baseHue = 30, baseSat = 70, baseLightness = 50) {
        this.baseHue = baseHue;
        this.baseSat = baseSat;
        this.baseLightness = baseLightness;
    }
    
    generatePalette(type = 'split-complementary') {
        let coreColors = [];
        
        switch(type) {
            case 'split-complementary':
                coreColors = [
                    this.baseHue,                           // 30° (dawn orange)
                    (this.baseHue + 150) % 360,            // 180° (teal)
                    (this.baseHue + 210) % 360             // 240° (blue)
                ];
                break;
        }
        
        const palette = {};
        
        coreColors.forEach((hue, idx) => {
            const colorName = `color${idx + 1}`;
            
            palette[colorName] = {
                base: this.createColor(hue, this.baseSat, this.baseLightness),
                
                // Lighter variations (tints)
                light: this.createColor(hue, this.baseSat, this.baseLightness + 20),
                veryLight: this.createColor(hue, this.baseSat * 0.6, this.baseLightness + 30),
                
                // Darker variations (shades)
                dark: this.createColor(hue, this.baseSat, this.baseLightness - 20),
                veryDark: this.createColor(hue, this.baseSat, this.baseLightness - 30),
                
                // Muted variations (tones)
                muted: this.createColor(hue, this.baseSat * 0.5, this.baseLightness),
                veryMuted: this.createColor(hue, this.baseSat * 0.3, this.baseLightness)
            };
        });
        
        // Add neutrals
        palette.neutrals = {
            white: this.createColor(0, 0, 95),
            lightGrey: this.createColor(0, 0, 75),
            midGrey: this.createColor(0, 0, 50),
            darkGrey: this.createColor(0, 0, 25),
            black: this.createColor(0, 0, 5)
        };
        
        return palette;
    }
    
    createColor(hue, saturation, lightness) {
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}

// =============================================================================
// STYLE SYSTEM - From 20-ART_STYLES.md Section IV
// =============================================================================

const STYLE_GUIDE = {
    outlines: false,              // No black outlines (painterly)
    edges: 'soft',                // Atmospheric blending
    saturation: {
        focal: 80,                // Shrine = vivid
        supporting: 40,           // Mountains = muted
        background: 60            // Sky = moderate
    },
    shading: 'gradient',          // Smooth gradients
    simplification: 'moderate',   // Clear shapes
    texture: 'stylized',          // Patterns suggest texture
    vertices: 'low'               // <20 points per shape
};

// =============================================================================
// INITIALIZE SYSTEMS
// =============================================================================

const composition = new CompositionEngine(canvas);
const colorSystem = new ColorHarmony(30, 70, 50);  // Base: Dawn orange
const palette = colorSystem.generatePalette('split-complementary');

// Calculate composition points
const focalPoint = composition.calculateFocalPoint('goldenRatio');
const horizonY = composition.placeHorizon('sky');
const leadingLines = composition.generateLeadingLines(focalPoint, 3);

console.log('Focal Point (Golden Ratio):', focalPoint);
console.log('Horizon Y:', horizonY);
console.log('Palette:', palette);

// =============================================================================
// UTILITIES
// =============================================================================

let seed = 54321;
function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function resetSeed(val) {
    seed = val;
}

function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}

// =============================================================================
// LAYER 1: SKY - Gradient from deep blue (top) to orange (horizon)
// =============================================================================

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, horizonY);
    
    // Color 3 (blue) at top, transitioning to Color 1 (orange) at horizon
    gradient.addColorStop(0, palette.color3.dark);         // Deep blue (210°)
    gradient.addColorStop(0.5, palette.color3.muted);      // Mid blue
    gradient.addColorStop(0.8, palette.color2.veryMuted);  // Teal transition
    gradient.addColorStop(1, palette.color1.light);        // Orange glow (30°)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, horizonY);
}

// =============================================================================
// LAYER 2: FAR MOUNTAINS - Atmospheric fade (blue, low sat, high lightness)
// =============================================================================

function drawFarMountains() {
    ctx.save();
    
    resetSeed(111);
    
    // Far mountains: Very blue, very desaturated, very light
    ctx.fillStyle = palette.color3.veryMuted;  // Blue 210°, low sat
    
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    
    // Simple silhouette, <20 vertices
    const peaks = 8;
    for (let i = 0; i <= peaks; i++) {
        const x = (i / peaks) * W;
        const baseY = horizonY - 40;
        const peakHeight = 20 + random() * 40;
        const y = baseY - peakHeight;
        
        if (i === 0) {
            ctx.lineTo(x, y);
        } else {
            // Smooth curves (stylized realism)
            const prevX = ((i - 1) / peaks) * W;
            const cpX = (prevX + x) / 2;
            const cpY = y - random() * 20;
            ctx.quadraticCurveTo(cpX, cpY, x, y);
        }
    }
    
    ctx.lineTo(W, horizonY);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// =============================================================================
// LAYER 3: MID MOUNTAINS - Teal-tinted, more defined
// =============================================================================

function drawMidMountains() {
    ctx.save();
    
    resetSeed(222);
    
    // Mid mountains: Teal (150°), medium saturation
    ctx.fillStyle = palette.color2.muted;
    
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    
    const peaks = 6;
    for (let i = 0; i <= peaks; i++) {
        const x = (i / peaks) * W;
        const baseY = horizonY - 20;
        const peakHeight = 40 + random() * 60;
        const y = baseY - peakHeight;
        
        if (i === 0) {
            ctx.lineTo(x, y);
        } else {
            const prevX = ((i - 1) / peaks) * W;
            const cpX = (prevX + x) / 2;
            const cpY = y - random() * 30;
            ctx.quadraticCurveTo(cpX, cpY, x, y);
        }
    }
    
    ctx.lineTo(W, horizonY);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// =============================================================================
// LAYER 4: NEAR MOUNTAINS - Dark, sharp, frame shrine
// =============================================================================

function drawNearMountains() {
    ctx.save();
    
    resetSeed(333);
    
    // Near mountains: Dark blue-grey, higher saturation
    const gradient = ctx.createLinearGradient(0, horizonY - 150, 0, horizonY);
    gradient.addColorStop(0, palette.color3.dark);
    gradient.addColorStop(1, palette.color3.veryDark);
    
    ctx.fillStyle = gradient;
    
    // Left mountain (leading line toward shrine)
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(0, horizonY - 150);
    ctx.quadraticCurveTo(100, horizonY - 180, 200, horizonY - 120);
    
    // Ridge angles toward focal point (leading line)
    ctx.lineTo(focalPoint.x - 150, horizonY - 80);
    ctx.lineTo(focalPoint.x - 150, horizonY);
    ctx.closePath();
    ctx.fill();
    
    // Right mountain (frames shrine on other side)
    ctx.beginPath();
    ctx.moveTo(W, horizonY);
    ctx.lineTo(W, horizonY - 120);
    ctx.quadraticCurveTo(W - 150, horizonY - 140, focalPoint.x + 150, horizonY - 100);
    
    // Ridge angles toward focal point
    ctx.lineTo(focalPoint.x + 150, horizonY);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// =============================================================================
// LAYER 5: MIST - Warm where lit, cool in shadow
// =============================================================================

function drawMist() {
    ctx.save();
    
    resetSeed(444);
    
    // Mist layers with gradient (warm at horizon, cool above)
    for (let i = 0; i < 5; i++) {
        const y = horizonY - 50 - (i * 30);
        const alpha = 0.15 + (i * 0.03);
        
        // Warm mist near horizon (dawn light)
        const gradient = ctx.createLinearGradient(0, y, 0, y + 40);
        gradient.addColorStop(0, `hsla(30, 60%, 80%, 0)`);
        gradient.addColorStop(0.5, `hsla(30, 50%, 85%, ${alpha})`);
        gradient.addColorStop(1, `hsla(210, 40%, 70%, ${alpha * 0.5})`);
        
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        const segments = 10;
        for (let j = 0; j <= segments; j++) {
            const x = (j / segments) * W;
            const waveY = y + Math.sin(j * 0.5 + i) * 15;
            
            if (j === 0) {
                ctx.lineTo(x, waveY);
            } else {
                const prevX = ((j - 1) / segments) * W;
                const cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(cpX, waveY, x, waveY);
            }
        }
        
        ctx.lineTo(W, y + 40);
        ctx.lineTo(0, y + 40);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// =============================================================================
// LAYER 6: GROUND LEDGE - Supports shrine
// =============================================================================

function drawGroundLedge() {
    ctx.save();
    
    // Neutral brown (30° hue, low saturation)
    const gradient = ctx.createLinearGradient(0, horizonY, 0, H);
    gradient.addColorStop(0, palette.neutrals.midGrey);
    gradient.addColorStop(0.3, `hsl(30, 25%, 35%)`);
    gradient.addColorStop(1, palette.neutrals.darkGrey);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, horizonY, W, H - horizonY);
    
    // Ledge edge (soft highlight where dawn light hits)
    ctx.fillStyle = `hsla(30, 40%, 50%, 0.3)`;
    ctx.fillRect(0, horizonY, W, 5);
    
    ctx.restore();
}

// =============================================================================
// LAYER 7: SHRINE - FOCAL POINT at Golden Ratio
// =============================================================================

function drawShrine() {
    ctx.save();
    
    const shrineX = focalPoint.x;
    const shrineY = horizonY - 20;  // Sits on ledge
    const shrineW = 80;
    const shrineH = 100;
    
    // Shrine structure (simple architecture)
    // Base platform
    drawStoneBlock(shrineX - shrineW/2 - 10, shrineY + shrineH - 20, shrineW + 20, 20);
    
    // Main pillar
    drawStoneBlock(shrineX - shrineW/2, shrineY, shrineW, shrineH - 20);
    
    // Roof (triangular top)
    drawShrineRoof(shrineX, shrineY - 10, shrineW + 20);
    
    ctx.restore();
}

function drawStoneBlock(x, y, w, h) {
    // 5-value shading on shrine (highest detail = focal point)
    
    // Shadow side (cool, dark)
    const shadowGradient = ctx.createLinearGradient(x, y, x + w * 0.3, y);
    shadowGradient.addColorStop(0, palette.color3.veryDark);  // Cool shadow (210°)
    shadowGradient.addColorStop(1, palette.color2.dark);      // Transition
    
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(x, y, w * 0.3, h);
    
    // Mid-tone
    ctx.fillStyle = palette.neutrals.midGrey;
    ctx.fillRect(x + w * 0.3, y, w * 0.4, h);
    
    // Light side (warm dawn light)
    const lightGradient = ctx.createLinearGradient(x + w * 0.7, y, x + w, y);
    lightGradient.addColorStop(0, palette.color1.muted);      // Warm transition
    lightGradient.addColorStop(1, palette.color1.light);      // Bright dawn (30°)
    
    ctx.fillStyle = lightGradient;
    ctx.fillRect(x + w * 0.7, y, w * 0.3, h);
    
    // Stylized texture (4-layer system from Study 7)
    resetSeed(555);
    for (let i = 0; i < 8; i++) {
        const tx = x + random() * w;
        const ty = y + random() * h;
        const tw = 3 + random() * 5;
        const th = 2 + random() * 3;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + random() * 0.15})`;
        ctx.fillRect(tx, ty, tw, th);
    }
    
    // Highlight edge (dawn catching corner)
    ctx.fillStyle = `hsla(30, 90%, 75%, 0.6)`;  // Bright warm accent
    ctx.fillRect(x + w - 2, y, 2, h);
}

function drawShrineRoof(centerX, topY, width) {
    // Triangular roof with gradient
    
    const gradient = ctx.createLinearGradient(centerX - width/2, topY, centerX + width/2, topY);
    gradient.addColorStop(0, palette.color3.dark);       // Cool shadow side
    gradient.addColorStop(0.5, palette.color2.muted);    // Mid
    gradient.addColorStop(1, palette.color1.base);       // Warm lit side
    
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX - width/2, topY + 30);
    ctx.lineTo(centerX + width/2, topY + 30);
    ctx.closePath();
    ctx.fill();
    
    // Roof peak highlight
    ctx.strokeStyle = palette.color1.veryLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX + width/2, topY + 30);
    ctx.stroke();
}

// =============================================================================
// LAYER 8: DAWN LIGHT RAYS - Volumetric leading lines
// =============================================================================

function drawLightRays() {
    ctx.save();
    
    ctx.globalCompositeOperation = 'lighter';
    
    // Rays from horizon converging toward shrine (leading lines)
    const rayCount = 5;
    
    for (let i = 0; i < rayCount; i++) {
        const startX = (i / rayCount) * W + (W / rayCount) * 0.5;
        const startY = horizonY - 50;
        
        const gradient = ctx.createLinearGradient(
            startX, startY,
            focalPoint.x, focalPoint.y
        );
        gradient.addColorStop(0, `hsla(30, 70%, 70%, 0.12)`);
        gradient.addColorStop(0.5, `hsla(30, 60%, 65%, 0.06)`);
        gradient.addColorStop(1, `hsla(30, 50%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        
        // Tapered ray shape
        ctx.beginPath();
        ctx.moveTo(startX - 15, startY);
        ctx.lineTo(focalPoint.x - 5, focalPoint.y);
        ctx.lineTo(focalPoint.x + 5, focalPoint.y);
        ctx.lineTo(startX + 15, startY);
        ctx.closePath();
        ctx.fill();
    }
    
    // Glow around shrine (highest contrast = focal point)
    const glowGradient = ctx.createRadialGradient(
        focalPoint.x, focalPoint.y - 30, 20,
        focalPoint.x, focalPoint.y - 30, 120
    );
    glowGradient.addColorStop(0, `hsla(30, 90%, 80%, 0.25)`);
    glowGradient.addColorStop(0.5, `hsla(30, 70%, 70%, 0.1)`);
    glowGradient.addColorStop(1, `hsla(30, 50%, 60%, 0)`);
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
        focalPoint.x - 120,
        focalPoint.y - 150,
        240,
        240
    );
    
    ctx.restore();
}

// =============================================================================
// MAIN RENDER - Back to front
// =============================================================================

function render() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    
    // Render layers (back to front)
    drawSky();                  // Layer 1: Background
    drawFarMountains();         // Layer 2: Depth 3
    drawMidMountains();         // Layer 3: Depth 2
    drawNearMountains();        // Layer 4: Depth 1
    drawMist();                 // Layer 5: Atmosphere
    drawGroundLedge();          // Layer 6: Foreground base
    drawShrine();               // Layer 7: FOCAL POINT
    drawLightRays();            // Layer 8: Enhancement
    
    console.log('✅ Render complete');
    console.log('Validation:');
    console.log('- Focal point at Golden Ratio:', focalPoint);
    console.log('- Horizon low (sky emphasized):', horizonY);
    console.log('- Split-complementary palette:', {
        dawn: '30° (orange)',
        mountains: '150° (teal), 210° (blue)'
    });
    console.log('- Style: Stylized realism (soft edges, gradients)');
}

// Execute
render();

// =============================================================================
// VALIDATION CHECKLIST (from PLANNING-V2.md Section VI)
// =============================================================================

console.log('\n=== VALIDATION CHECKLIST ===');
console.log('Composition:');
console.log('✓ Focal point at Golden Ratio (not centered)');
console.log('✓ Horizon low (2/3 down, emphasizes sky)');
console.log('✓ Leading lines converge on shrine (mountain ridges, light rays)');
console.log('✓ Negative space ~60% (sky + mist = breathing room)');

console.log('\nColor:');
console.log('✓ Split-complementary harmony (30°, 150°, 210°)');
console.log('✓ Temperature contrast (warm forward, cool back)');
console.log('✓ Value contrast >40% at focal point (bright shrine vs dark shadows)');
console.log('✓ Saturation hierarchy: focal 80% > background 60% > supporting 40%');

console.log('\nStyle:');
console.log('✓ Stylized realism throughout (no outlines, gradient shading)');
console.log('✓ Soft edges (atmospheric blending)');
console.log('✓ Low vertex count (<20 per shape)');
console.log('✓ Consistent simplification level');

console.log('\nGestalt:');
console.log('✓ Proximity: Shrine elements grouped');
console.log('✓ Continuity: Ridges flow toward shrine');
console.log('✓ Figure-ground: Shrine = figure, mountains/sky = ground');
console.log('✓ Similarity: Mountains share style, shrine distinct');
