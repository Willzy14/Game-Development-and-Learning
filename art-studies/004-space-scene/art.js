// ============================================================================
// SPACE SCENE V1 - "LOOK HOW LITTLE I NEED"
// ============================================================================
// 
// PHILOSOPHY: Maximum impact with minimum complexity
// - Few rules, strong hierarchy
// - Restraint over spectacle
// - What NOT to do is as important as what to do
//
// INTENTIONALLY NOT INCLUDED (V1):
// - Multiple nebulae (one is enough)
// - Star twinkle animation (static is fine)
// - Planet rings (save for V2)
// - Asteroid fields (complexity creep)
// - Lens flares (gimmick)
// - Grid lines or sci-fi overlays (distraction)
//
// STRUCTURE:
// 1. Deep space background (gradient)
// 2. Distant star field (tiny, many)
// 3. Nebula (one, soft, purposeful)
// 4. Bright stars (few, varied sizes)
// 5. Planet (one, with atmosphere)
// 6. Foreground stars (larger, fewer)
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// MINIMAL COLOR UTILS (Only what we need)
// =============================================================================

const ColorUtils = {
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },
    
    withAlpha(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },
    
    blend(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    }
};

// =============================================================================
// SIMPLE NOISE (Coherent, not random)
// =============================================================================

// Simple value noise - good enough for V1
const NoiseUtils = {
    // Seeded random for reproducibility
    seed: 12345,
    
    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    },
    
    // Simple 2D noise (interpolated)
    noise2D(x, y, scale = 1) {
        const sx = x * scale;
        const sy = y * scale;
        const ix = Math.floor(sx);
        const iy = Math.floor(sy);
        const fx = sx - ix;
        const fy = sy - iy;
        
        // Hash function for grid points
        const hash = (x, y) => {
            const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return n - Math.floor(n);
        };
        
        // Four corners
        const a = hash(ix, iy);
        const b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1);
        const d = hash(ix + 1, iy + 1);
        
        // Smooth interpolation
        const smoothFx = fx * fx * (3 - 2 * fx);
        const smoothFy = fy * fy * (3 - 2 * fy);
        
        return a * (1 - smoothFx) * (1 - smoothFy) +
               b * smoothFx * (1 - smoothFy) +
               c * (1 - smoothFx) * smoothFy +
               d * smoothFx * smoothFy;
    }
};

// =============================================================================
// PALETTE (Constrained - 6 colors max)
// =============================================================================

const PALETTE = {
    // Deep space
    spaceDeep: '#050510',
    spaceMid: '#0a0a1a',
    spaceLight: '#101025',
    
    // Nebula (purple/blue - ONE color family)
    nebulaCore: '#4a2080',
    nebulaEdge: '#1a1040',
    
    // Stars
    starWhite: '#ffffff',
    starBlue: '#aaccff',
    starYellow: '#ffeeaa',
    
    // Planet
    planetBase: '#2a4a6a',
    planetLight: '#4a7aaa',
    planetDark: '#1a2a3a',
    atmosphere: '#4488cc'
};

// =============================================================================
// LAYER 1: DEEP SPACE BACKGROUND
// =============================================================================

function drawDeepSpace() {
    // Simple radial gradient from center - slightly lighter
    const cx = W * 0.4;  // Off-center for interest
    const cy = H * 0.3;
    
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.8);
    gradient.addColorStop(0, PALETTE.spaceLight);
    gradient.addColorStop(0.5, PALETTE.spaceMid);
    gradient.addColorStop(1, PALETTE.spaceDeep);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
}

// =============================================================================
// LAYER 2: DISTANT STAR FIELD (Many, tiny, uniform)
// =============================================================================

function drawDistantStars() {
    // Reset seed for consistency
    NoiseUtils.seed = 42;
    
    // Many small stars - background texture
    const starCount = 400;
    
    for (let i = 0; i < starCount; i++) {
        const x = NoiseUtils.random() * W;
        const y = NoiseUtils.random() * H;
        const size = 0.5 + NoiseUtils.random() * 0.5; // 0.5-1px
        const brightness = 0.2 + NoiseUtils.random() * 0.3; // Dim
        
        ctx.fillStyle = ColorUtils.withAlpha(PALETTE.starWhite, brightness);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =============================================================================
// LAYER 3: NEBULA (One, soft, purposeful)
// =============================================================================

function drawNebula() {
    // Single nebula - positioned for composition
    // Rule of thirds: upper left quadrant
    const cx = W * 0.35;
    const cy = H * 0.35;
    
    // Soft, multiple overlapping radial gradients
    // NOT complex noise - just layered circles with varying opacity
    
    ctx.globalCompositeOperation = 'screen';
    
    // Core glow (brightest, smallest)
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
    coreGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.4));
    coreGrad.addColorStop(0.5, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.15));
    coreGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Mid glow (larger, dimmer)
    const midGrad = ctx.createRadialGradient(cx - 30, cy + 20, 0, cx - 30, cy + 20, 250);
    midGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.2));
    midGrad.addColorStop(0.6, ColorUtils.withAlpha(PALETTE.nebulaEdge, 0.1));
    midGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = midGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Outer wisps (largest, subtlest)
    const outerGrad = ctx.createRadialGradient(cx + 50, cy - 30, 0, cx + 50, cy - 30, 350);
    outerGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaEdge, 0.15));
    outerGrad.addColorStop(0.7, ColorUtils.withAlpha(PALETTE.nebulaEdge, 0.05));
    outerGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = outerGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Add subtle texture with noise-positioned small glows
    NoiseUtils.seed = 777;
    for (let i = 0; i < 15; i++) {
        const angle = NoiseUtils.random() * Math.PI * 2;
        const dist = 50 + NoiseUtils.random() * 150;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const size = 30 + NoiseUtils.random() * 50;
        
        const patchGrad = ctx.createRadialGradient(px, py, 0, px, py, size);
        patchGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.1));
        patchGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = patchGrad;
        ctx.fillRect(0, 0, W, H);
    }
    
    ctx.globalCompositeOperation = 'source-over';
}

// =============================================================================
// LAYER 4: BRIGHT STARS (Few, varied, intentional)
// =============================================================================

function drawBrightStars() {
    NoiseUtils.seed = 999;
    
    // Only 30-40 bright stars - each one matters
    const brightStars = [];
    
    for (let i = 0; i < 35; i++) {
        brightStars.push({
            x: NoiseUtils.random() * W,
            y: NoiseUtils.random() * H,
            size: 1 + NoiseUtils.random() * 2.5,
            // Color variation: mostly white, some blue, few yellow
            colorType: NoiseUtils.random()
        });
    }
    
    // Draw with glow effect
    brightStars.forEach(star => {
        // Determine color
        let color = PALETTE.starWhite;
        if (star.colorType < 0.2) color = PALETTE.starBlue;
        else if (star.colorType > 0.9) color = PALETTE.starYellow;
        
        // Outer glow (soft)
        const glowSize = star.size * 4;
        const glowGrad = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, glowSize
        );
        glowGrad.addColorStop(0, ColorUtils.withAlpha(color, 0.3));
        glowGrad.addColorStop(0.5, ColorUtils.withAlpha(color, 0.1));
        glowGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Core (bright)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Center point (pure white for largest stars)
        if (star.size > 2) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// =============================================================================
// LAYER 5: PLANET (One, with atmosphere glow)
// =============================================================================

function drawPlanet() {
    // Position: lower right, partially visible (cropped)
    // This creates depth - viewer is IN space
    const cx = W * 0.85;
    const cy = H * 0.75;
    const radius = 200;
    
    // Atmosphere glow (outermost)
    ctx.globalCompositeOperation = 'screen';
    const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.4);
    atmoGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.atmosphere, 0.3));
    atmoGrad.addColorStop(0.5, ColorUtils.withAlpha(PALETTE.atmosphere, 0.1));
    atmoGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // Planet body - clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Base color
    ctx.fillStyle = PALETTE.planetBase;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    
    // Light side gradient (sun from upper left)
    const lightGrad = ctx.createLinearGradient(
        cx - radius, cy - radius,
        cx + radius, cy + radius
    );
    lightGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.planetLight, 0.6));
    lightGrad.addColorStop(0.5, 'transparent');
    lightGrad.addColorStop(1, ColorUtils.withAlpha(PALETTE.planetDark, 0.7));
    
    ctx.fillStyle = lightGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    
    // Surface variation (subtle bands/features)
    NoiseUtils.seed = 555;
    
    // Horizontal bands (gas giant style)
    for (let i = 0; i < 8; i++) {
        const bandY = cy - radius + (radius * 2 / 8) * i + NoiseUtils.random() * 20;
        const bandHeight = 15 + NoiseUtils.random() * 25;
        const bandOpacity = 0.05 + NoiseUtils.random() * 0.1;
        
        ctx.fillStyle = i % 2 === 0 
            ? ColorUtils.withAlpha(PALETTE.planetLight, bandOpacity)
            : ColorUtils.withAlpha(PALETTE.planetDark, bandOpacity);
        
        ctx.fillRect(cx - radius, bandY, radius * 2, bandHeight);
    }
    
    // Storm feature (one small oval)
    const stormX = cx - radius * 0.3;
    const stormY = cy + radius * 0.2;
    
    ctx.fillStyle = ColorUtils.withAlpha(PALETTE.planetLight, 0.3);
    ctx.beginPath();
    ctx.ellipse(stormX, stormY, 25, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Terminator line softening (where light meets dark)
    const terminatorGrad = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx, cy, radius
    );
    terminatorGrad.addColorStop(0, 'transparent');
    terminatorGrad.addColorStop(0.6, 'transparent');
    terminatorGrad.addColorStop(0.8, ColorUtils.withAlpha('#000000', 0.3));
    terminatorGrad.addColorStop(1, ColorUtils.withAlpha('#000000', 0.5));
    
    ctx.fillStyle = terminatorGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
}

// =============================================================================
// LAYER 6: FOREGROUND STARS (Larger, fewer - depth cue)
// =============================================================================

function drawForegroundStars() {
    NoiseUtils.seed = 1234;
    
    // Only 8-10 foreground stars - creates depth
    for (let i = 0; i < 8; i++) {
        const x = NoiseUtils.random() * W;
        const y = NoiseUtils.random() * H;
        const size = 2.5 + NoiseUtils.random() * 2;
        
        // Skip if too close to planet
        const dx = x - W * 0.85;
        const dy = y - H * 0.75;
        if (Math.sqrt(dx * dx + dy * dy) < 250) continue;
        
        // Bright with strong glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 6);
        glowGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.starWhite, 0.5));
        glowGrad.addColorStop(0.3, ColorUtils.withAlpha(PALETTE.starBlue, 0.2));
        glowGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add 4-point star diffraction spikes (subtle)
        ctx.strokeStyle = ColorUtils.withAlpha('#ffffff', 0.3);
        ctx.lineWidth = 1;
        const spikeLen = size * 4;
        
        ctx.beginPath();
        ctx.moveTo(x - spikeLen, y);
        ctx.lineTo(x + spikeLen, y);
        ctx.moveTo(x, y - spikeLen);
        ctx.lineTo(x, y + spikeLen);
        ctx.stroke();
    }
}

// =============================================================================
// MAIN RENDER
// =============================================================================

function render() {
    console.log('Space Scene V1 - Rendering with restraint...');
    
    // Clear
    ctx.clearRect(0, 0, W, H);
    
    // Layer order matters - back to front
    drawDeepSpace();         // 1. Background
    drawDistantStars();      // 2. Far stars
    drawNebula();            // 3. Gas cloud
    drawBrightStars();       // 4. Mid stars
    drawPlanet();            // 5. Planet with atmosphere
    drawForegroundStars();   // 6. Near stars
    
    console.log('Space Scene V1 - Complete');
    console.log('Elements: 1 gradient bg, ~400 distant stars, 1 nebula, ~35 bright stars, 1 planet, ~8 foreground stars');
    console.log('Philosophy: Look how little I need');
}

// Run
render();
