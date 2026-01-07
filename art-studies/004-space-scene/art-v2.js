// ============================================================================
// SPACE SCENE V2 - APPLYING FUNDAMENTALS
// ============================================================================
// 
// WHAT WE LEARNED (from Sphere Study V1-V2 and Shape Study):
// - 5-value system applies to EVERYTHING, including planets
// - Gradient center must be offset toward light source
// - Need 12+ gradient stops for smooth, non-banded transitions
// - Contact shadow + cast shadow for grounding
// - Glass/transparent materials let light through (caustics)
// - Terminator zone is where the interesting stuff happens
//
// V2 ADDITIONS:
// - Planet rings (with transparency and shadow)
// - Moon (proper sphere with 5-value lighting)
// - Improved planet with 5-value spherical shading
// - Subtle star glow differentiation (not all same)
// - Better nebula structure (less uniform blob)
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// Light source direction (consistent throughout!)
const LIGHT = {
    x: -0.6,  // From upper-left
    y: -0.7,
    normalized() {
        const len = Math.sqrt(this.x * this.x + this.y * this.y);
        return { x: this.x / len, y: this.y / len };
    }
};

// =============================================================================
// COLOR UTILITIES
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
    },
    
    brighten(hex, amount) {
        const rgb = this.hexToRgb(hex);
        const r = Math.min(255, rgb.r + amount);
        const g = Math.min(255, rgb.g + amount);
        const b = Math.min(255, rgb.b + amount);
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    darken(hex, amount) {
        const rgb = this.hexToRgb(hex);
        const r = Math.max(0, rgb.r - amount);
        const g = Math.max(0, rgb.g - amount);
        const b = Math.max(0, rgb.b - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
};

// =============================================================================
// NOISE UTILITIES
// =============================================================================

const NoiseUtils = {
    seed: 12345,
    
    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    },
    
    noise2D(x, y, scale = 1) {
        const sx = x * scale;
        const sy = y * scale;
        const ix = Math.floor(sx);
        const iy = Math.floor(sy);
        const fx = sx - ix;
        const fy = sy - iy;
        
        const hash = (x, y) => {
            const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return n - Math.floor(n);
        };
        
        const a = hash(ix, iy);
        const b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1);
        const d = hash(ix + 1, iy + 1);
        
        const smoothFx = fx * fx * (3 - 2 * fx);
        const smoothFy = fy * fy * (3 - 2 * fy);
        
        return a * (1 - smoothFx) * (1 - smoothFy) +
               b * smoothFx * (1 - smoothFy) +
               c * (1 - smoothFx) * smoothFy +
               d * smoothFx * smoothFy;
    }
};

// =============================================================================
// PALETTE (Extended for V2)
// =============================================================================

const PALETTE = {
    // Deep space - richer color variation
    spaceDeep: '#030308',
    spaceMid: '#080815',
    spaceLight: '#0c0c20',
    spaceWarm: '#100810',  // Slight warmth for variety
    
    // Nebula - two complementary families
    nebulaCore: '#5030a0',
    nebulaMid: '#3a2080',
    nebulaEdge: '#1a1050',
    nebulaWarm: '#602060',  // Touches of magenta
    
    // Stars - temperature variation
    starWhite: '#ffffff',
    starBlue: '#aaddff',
    starYellow: '#ffeecc',
    starOrange: '#ffccaa',
    starRed: '#ffaaaa',
    
    // Planet (gas giant - blues and cyans)
    planetHighlight: '#6090c0',
    planetLight: '#4070a0',
    planetMid: '#305080',
    planetDark: '#203050',
    planetShadow: '#101830',
    planetReflected: '#253550',  // Reflected light from below
    
    // Atmosphere
    atmosphereInner: '#4090d0',
    atmosphereOuter: '#2060a0',
    
    // Moon (rocky, grey-tan)
    moonHighlight: '#c0b8b0',
    moonLight: '#a09890',
    moonMid: '#706860',
    moonDark: '#454040',
    moonShadow: '#252220',
    
    // Rings
    ringLight: '#b0a090',
    ringMid: '#807060',
    ringDark: '#504030'
};

// =============================================================================
// LAYER 1: DEEP SPACE BACKGROUND
// =============================================================================

function drawDeepSpace() {
    // More interesting gradient - not just one radial
    // Main gradient from upper-left (where light comes from)
    const lightX = W * 0.2;
    const lightY = H * 0.15;
    
    const mainGrad = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, W);
    mainGrad.addColorStop(0, PALETTE.spaceLight);
    mainGrad.addColorStop(0.3, PALETTE.spaceMid);
    mainGrad.addColorStop(0.7, PALETTE.spaceDeep);
    mainGrad.addColorStop(1, PALETTE.spaceDeep);
    
    ctx.fillStyle = mainGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Subtle warm area (opposite corner) for color interest
    const warmGrad = ctx.createRadialGradient(W * 0.9, H * 0.9, 0, W * 0.9, H * 0.9, W * 0.5);
    warmGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.spaceWarm, 0.3));
    warmGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = warmGrad;
    ctx.fillRect(0, 0, W, H);
}

// =============================================================================
// LAYER 2: DISTANT STAR FIELD
// =============================================================================

function drawDistantStars() {
    NoiseUtils.seed = 42;
    
    const starCount = 500;
    
    for (let i = 0; i < starCount; i++) {
        const x = NoiseUtils.random() * W;
        const y = NoiseUtils.random() * H;
        const size = 0.3 + NoiseUtils.random() * 0.6;
        const brightness = 0.15 + NoiseUtils.random() * 0.25;
        
        // Slight color variation even for distant stars
        const colorVar = NoiseUtils.random();
        let color = PALETTE.starWhite;
        if (colorVar < 0.1) color = PALETTE.starBlue;
        else if (colorVar > 0.95) color = PALETTE.starYellow;
        
        ctx.fillStyle = ColorUtils.withAlpha(color, brightness);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =============================================================================
// LAYER 3: NEBULA (Improved structure)
// =============================================================================

function drawNebula() {
    const cx = W * 0.32;
    const cy = H * 0.30;
    
    ctx.globalCompositeOperation = 'screen';
    
    // Core - brightest, most saturated
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    coreGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.5));
    coreGrad.addColorStop(0.3, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.3));
    coreGrad.addColorStop(0.6, ColorUtils.withAlpha(PALETTE.nebulaMid, 0.15));
    coreGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Asymmetric extensions (not a perfect circle)
    // Extension 1: upper-right tendril
    const ext1x = cx + 80;
    const ext1y = cy - 60;
    const ext1Grad = ctx.createRadialGradient(ext1x, ext1y, 0, ext1x, ext1y, 180);
    ext1Grad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaMid, 0.25));
    ext1Grad.addColorStop(0.5, ColorUtils.withAlpha(PALETTE.nebulaEdge, 0.1));
    ext1Grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = ext1Grad;
    ctx.beginPath();
    ctx.ellipse(ext1x, ext1y, 180, 100, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Extension 2: lower-left sweep (warm tones)
    const ext2x = cx - 100;
    const ext2y = cy + 80;
    const ext2Grad = ctx.createRadialGradient(ext2x, ext2y, 0, ext2x, ext2y, 200);
    ext2Grad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaWarm, 0.2));
    ext2Grad.addColorStop(0.4, ColorUtils.withAlpha(PALETTE.nebulaMid, 0.1));
    ext2Grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = ext2Grad;
    ctx.beginPath();
    ctx.ellipse(ext2x, ext2y, 200, 120, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Dust lanes (dark areas within nebula)
    ctx.globalCompositeOperation = 'multiply';
    
    NoiseUtils.seed = 888;
    for (let i = 0; i < 5; i++) {
        const dx = cx + (NoiseUtils.random() - 0.5) * 200;
        const dy = cy + (NoiseUtils.random() - 0.5) * 150;
        const dustGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, 60 + NoiseUtils.random() * 40);
        dustGrad.addColorStop(0, ColorUtils.withAlpha('#000000', 0.15));
        dustGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.ellipse(dx, dy, 60 + NoiseUtils.random() * 40, 30 + NoiseUtils.random() * 30, 
                    NoiseUtils.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Bright knots (star-forming regions)
    ctx.globalCompositeOperation = 'screen';
    NoiseUtils.seed = 777;
    for (let i = 0; i < 8; i++) {
        const angle = NoiseUtils.random() * Math.PI * 2;
        const dist = 30 + NoiseUtils.random() * 120;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const size = 15 + NoiseUtils.random() * 35;
        
        const knotGrad = ctx.createRadialGradient(px, py, 0, px, py, size);
        knotGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.nebulaCore, 0.2));
        knotGrad.addColorStop(0.5, ColorUtils.withAlpha(PALETTE.nebulaMid, 0.08));
        knotGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = knotGrad;
        ctx.fillRect(0, 0, W, H);
    }
    
    ctx.globalCompositeOperation = 'source-over';
}

// =============================================================================
// LAYER 4: BRIGHT STARS (Varied by temperature/type)
// =============================================================================

function drawBrightStars() {
    NoiseUtils.seed = 999;
    
    // Different star types
    const stars = [];
    
    for (let i = 0; i < 40; i++) {
        const x = NoiseUtils.random() * W;
        const y = NoiseUtils.random() * H;
        
        // Skip if in planet zone
        const dx = x - W * 0.78;
        const dy = y - H * 0.65;
        if (Math.sqrt(dx * dx + dy * dy) < 280) continue;
        
        const size = 0.8 + NoiseUtils.random() * 2.2;
        const temp = NoiseUtils.random(); // 0 = cool, 1 = hot
        
        stars.push({ x, y, size, temp });
    }
    
    stars.forEach(star => {
        // Color based on temperature
        let coreColor, glowColor;
        if (star.temp < 0.15) {
            coreColor = PALETTE.starRed;
            glowColor = PALETTE.starOrange;
        } else if (star.temp < 0.3) {
            coreColor = PALETTE.starOrange;
            glowColor = PALETTE.starYellow;
        } else if (star.temp < 0.7) {
            coreColor = PALETTE.starYellow;
            glowColor = PALETTE.starWhite;
        } else {
            coreColor = PALETTE.starBlue;
            glowColor = PALETTE.starWhite;
        }
        
        // Outer glow (color-specific)
        const glowSize = star.size * 5;
        const glowGrad = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, glowSize
        );
        glowGrad.addColorStop(0, ColorUtils.withAlpha(coreColor, 0.35));
        glowGrad.addColorStop(0.4, ColorUtils.withAlpha(glowColor, 0.12));
        glowGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = ColorUtils.brighten(coreColor, 50);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot center for brighter stars
        if (star.size > 1.5) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// =============================================================================
// LAYER 5: PLANET RINGS (Behind planet)
// =============================================================================

function drawPlanetRingsBack(planetCx, planetCy, planetRadius) {
    // Rings as an ellipse, tilted toward viewer
    // Draw the back half first (behind planet)
    // IMPORTANT: These are occluded by the planet, so they're dimmer
    const ringInner = planetRadius * 1.3;
    const ringOuter = planetRadius * 2.0;
    const tiltY = 0.25; // How much the ring plane is tilted
    
    ctx.save();
    ctx.translate(planetCx, planetCy);
    ctx.scale(1, tiltY);
    
    // Multiple ring bands with value variation across width
    const bands = [
        { inner: ringInner, outer: ringInner + 30, opacity: 0.45, color: PALETTE.ringLight },
        { inner: ringInner + 35, outer: ringInner + 70, opacity: 0.3, color: PALETTE.ringMid },
        { inner: ringInner + 80, outer: ringOuter - 30, opacity: 0.2, color: PALETTE.ringDark },
        { inner: ringOuter - 25, outer: ringOuter, opacity: 0.35, color: PALETTE.ringLight }
    ];
    
    // Draw back half only (π to 2π)
    // These are BEHIND the planet so much dimmer (occluded by planet's presence)
    bands.forEach(band => {
        // Gradient across the ring to show it curving away
        const midRadius = (band.inner + band.outer) / 2;
        
        // Draw with reduced opacity - planet blocks light reaching these
        ctx.strokeStyle = ColorUtils.withAlpha(band.color, band.opacity * 0.35); // Much dimmer in back
        ctx.lineWidth = band.outer - band.inner;
        ctx.beginPath();
        ctx.arc(0, 0, midRadius, Math.PI, Math.PI * 2);
        ctx.stroke();
    });
    
    ctx.restore();
}

function drawPlanetRingsFront(planetCx, planetCy, planetRadius) {
    // Draw front half of rings (in front of planet)
    // These catch more light - brighter than back rings
    const ringInner = planetRadius * 1.3;
    const ringOuter = planetRadius * 2.0;
    const tiltY = 0.25;
    
    ctx.save();
    ctx.translate(planetCx, planetCy);
    ctx.scale(1, tiltY);
    
    // Bands with gaps (Cassini division style)
    const bands = [
        { inner: ringInner, outer: ringInner + 28, opacity: 0.6, color: PALETTE.ringLight },
        // Small gap
        { inner: ringInner + 38, outer: ringInner + 68, opacity: 0.45, color: PALETTE.ringMid },
        // Larger gap (Cassini-like division)
        { inner: ringInner + 85, outer: ringOuter - 35, opacity: 0.35, color: PALETTE.ringDark },
        // Outer bright ring
        { inner: ringOuter - 28, outer: ringOuter, opacity: 0.55, color: PALETTE.ringLight }
    ];
    
    // Front half (0 to π) - lit side
    bands.forEach((band, idx) => {
        const midRadius = (band.inner + band.outer) / 2;
        
        // Draw multiple thin strokes to create value variation across ring width
        const steps = 5;
        const stepWidth = (band.outer - band.inner) / steps;
        
        for (let s = 0; s < steps; s++) {
            const r = band.inner + stepWidth * (s + 0.5);
            // Outer edge brighter (catches more light), inner darker (shadow from planet)
            const valueMod = 0.7 + (s / steps) * 0.5; // 0.7 to 1.2
            ctx.strokeStyle = ColorUtils.withAlpha(band.color, band.opacity * valueMod);
            ctx.lineWidth = stepWidth + 1; // Slight overlap to avoid gaps
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI);
            ctx.stroke();
        }
    });
    
    ctx.restore();
    
    // Ring shadow on planet
    drawRingShadowOnPlanet(planetCx, planetCy, planetRadius);
}

function drawRingShadowOnPlanet(cx, cy, radius) {
    // Shadow cast by rings onto planet surface
    // Light from upper-left, so shadow falls on lower-right portion
    // Shadow is CURVED because it wraps around the sphere!
    ctx.save();
    
    // Clip to planet
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    
    ctx.globalCompositeOperation = 'multiply';
    
    // Ring tilt is 0.25, so shadow band is an ellipse
    // Position it where light would project the ring shadow
    const shadowCenterY = cy + radius * 0.25; // Offset toward light-opposite side
    const shadowWidth = radius * 1.8;
    const shadowHeight = radius * 0.12; // Thin band
    
    // Main shadow band - curved ellipse that wraps sphere
    // Multiple passes for soft edges
    for (let pass = 0; pass < 4; pass++) {
        const expand = pass * 8;
        const opacity = 0.35 - pass * 0.08;
        
        const shadowGrad = ctx.createLinearGradient(
            cx - shadowWidth/2, shadowCenterY,
            cx + shadowWidth/2, shadowCenterY
        );
        // Fade at edges (ring shadow doesn't extend to limb evenly)
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGrad.addColorStop(0.15, `rgba(0, 0, 0, ${opacity})`);
        shadowGrad.addColorStop(0.5, `rgba(0, 0, 0, ${opacity * 1.2})`);
        shadowGrad.addColorStop(0.85, `rgba(0, 0, 0, ${opacity})`);
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(cx, shadowCenterY, shadowWidth/2, shadowHeight + expand, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Secondary thinner shadow (inner ring)
    const innerShadowY = shadowCenterY - radius * 0.08;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, innerShadowY, radius * 0.9, radius * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// =============================================================================
// LAYER 6: PLANET (5-Value Sphere Lighting!)
// =============================================================================

function drawPlanet() {
    const cx = W * 0.78;
    const cy = H * 0.65;
    const radius = 180;
    
    // Draw back rings first
    drawPlanetRingsBack(cx, cy, radius);
    
    // =========================================================================
    // ATMOSPHERE GLOW (Fresnel rim)
    // =========================================================================
    ctx.globalCompositeOperation = 'screen';
    
    // Outer atmosphere
    const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.25);
    atmoGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.atmosphereInner, 0.4));
    atmoGrad.addColorStop(0.4, ColorUtils.withAlpha(PALETTE.atmosphereOuter, 0.25));
    atmoGrad.addColorStop(0.7, ColorUtils.withAlpha(PALETTE.atmosphereOuter, 0.1));
    atmoGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Brighter on light side (Fresnel)
    const fresnelGrad = ctx.createRadialGradient(
        cx - radius * 0.5, cy - radius * 0.5, radius * 0.7,
        cx - radius * 0.3, cy - radius * 0.3, radius * 1.2
    );
    fresnelGrad.addColorStop(0, 'transparent');
    fresnelGrad.addColorStop(0.7, ColorUtils.withAlpha(PALETTE.atmosphereInner, 0.15));
    fresnelGrad.addColorStop(1, ColorUtils.withAlpha(PALETTE.atmosphereInner, 0.3));
    
    ctx.fillStyle = fresnelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    
    // =========================================================================
    // PLANET BODY - 5-VALUE SPHERE!
    // =========================================================================
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Light comes from upper-left, so gradient center is offset that way
    const lightOffsetX = -0.35;
    const lightOffsetY = -0.35;
    const gradCx = cx + radius * lightOffsetX;
    const gradCy = cy + radius * lightOffsetY;
    
    // Main 5-value radial gradient (many stops for smoothness!)
    const bodyGrad = ctx.createRadialGradient(gradCx, gradCy, 0, gradCx, gradCy, radius * 1.6);
    
    // Highlight (value 5) - small, bright
    bodyGrad.addColorStop(0, PALETTE.planetHighlight);
    bodyGrad.addColorStop(0.08, PALETTE.planetHighlight);
    
    // Light (value 4)
    bodyGrad.addColorStop(0.15, PALETTE.planetLight);
    bodyGrad.addColorStop(0.25, PALETTE.planetLight);
    
    // Halftone (value 3) - the terminator zone
    bodyGrad.addColorStop(0.35, PALETTE.planetMid);
    bodyGrad.addColorStop(0.45, PALETTE.planetMid);
    
    // Core shadow (value 2) - DARKEST part
    bodyGrad.addColorStop(0.55, PALETTE.planetDark);
    bodyGrad.addColorStop(0.65, PALETTE.planetShadow);
    bodyGrad.addColorStop(0.75, PALETTE.planetShadow);
    
    // Reflected light (value 1) - subtle lift at far edge
    bodyGrad.addColorStop(0.85, PALETTE.planetReflected);
    bodyGrad.addColorStop(1, PALETTE.planetReflected);
    
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    
    // =========================================================================
    // SURFACE FEATURES
    // =========================================================================
    
    // Atmospheric bands (gas giant) - with broken symmetry and variation
    NoiseUtils.seed = 555;
    ctx.globalCompositeOperation = 'overlay';
    
    // Uneven band spacing (not perfectly regular)
    const bandPositions = [];
    let currentY = cy - radius * 0.85;
    while (currentY < cy + radius * 0.85) {
        const spacing = 20 + NoiseUtils.random() * 35; // Irregular spacing
        bandPositions.push(currentY);
        currentY += spacing;
    }
    
    bandPositions.forEach((bandY, i) => {
        const bandHeight = 8 + NoiseUtils.random() * 25; // More height variation
        const drift = (NoiseUtils.random() - 0.5) * 30; // More drift
        const wobble = (NoiseUtils.random() - 0.5) * 0.03; // Slight rotation
        
        // Non-alternating - some bands cluster light, some dark
        const bandType = NoiseUtils.random();
        let bandColor;
        let opacity;
        if (bandType < 0.3) {
            bandColor = PALETTE.planetLight;
            opacity = 0.1 + NoiseUtils.random() * 0.12;
        } else if (bandType < 0.7) {
            bandColor = PALETTE.planetMid;
            opacity = 0.08 + NoiseUtils.random() * 0.1;
        } else {
            bandColor = PALETTE.planetDark;
            opacity = 0.15 + NoiseUtils.random() * 0.15;
        }
        
        ctx.fillStyle = ColorUtils.withAlpha(bandColor, opacity);
        
        // Curved band with slight wobble
        ctx.beginPath();
        ctx.ellipse(cx + drift, bandY, radius * 1.1, bandHeight, wobble, 0, Math.PI * 2);
        ctx.fill();
        
        // Occasional turbulence/eddies at band edges
        if (NoiseUtils.random() > 0.7) {
            const eddyX = cx + (NoiseUtils.random() - 0.5) * radius * 1.2;
            const eddySize = 8 + NoiseUtils.random() * 15;
            ctx.fillStyle = ColorUtils.withAlpha(bandColor, opacity * 0.5);
            ctx.beginPath();
            ctx.ellipse(eddyX, bandY + bandHeight * 0.5, eddySize, eddySize * 0.6, 
                       NoiseUtils.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Great storm (like Jupiter's red spot)
    ctx.globalCompositeOperation = 'source-over';
    const stormX = cx - radius * 0.25;
    const stormY = cy + radius * 0.15;
    
    const stormGrad = ctx.createRadialGradient(stormX, stormY, 0, stormX, stormY, 35);
    stormGrad.addColorStop(0, ColorUtils.withAlpha('#c09070', 0.5));
    stormGrad.addColorStop(0.5, ColorUtils.withAlpha('#907050', 0.3));
    stormGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = stormGrad;
    ctx.beginPath();
    ctx.ellipse(stormX, stormY, 35, 18, 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner swirl of storm
    ctx.fillStyle = ColorUtils.withAlpha('#d0a080', 0.4);
    ctx.beginPath();
    ctx.ellipse(stormX - 5, stormY, 15, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // =========================================================================
    // SPECULAR HIGHLIGHT (Subtle, on lit side)
    // =========================================================================
    ctx.globalCompositeOperation = 'screen';
    const specX = cx - radius * 0.45;
    const specY = cy - radius * 0.45;
    
    const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, radius * 0.4);
    specGrad.addColorStop(0, ColorUtils.withAlpha('#ffffff', 0.12));
    specGrad.addColorStop(0.5, ColorUtils.withAlpha(PALETTE.atmosphereInner, 0.05));
    specGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw front rings
    drawPlanetRingsFront(cx, cy, radius);
    
    return { cx, cy, radius };
}

// =============================================================================
// LAYER 7: MOON (5-Value Rocky Sphere)
// =============================================================================

function drawMoon(planetData) {
    // Moon positioned upper-left of planet
    const cx = W * 0.55;
    const cy = H * 0.35;
    const radius = 40;
    
    // =========================================================================
    // 5-VALUE LIGHTING
    // =========================================================================
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Same light direction as planet!
    const lightOffsetX = -0.3;
    const lightOffsetY = -0.35;
    const gradCx = cx + radius * lightOffsetX;
    const gradCy = cy + radius * lightOffsetY;
    
    const bodyGrad = ctx.createRadialGradient(gradCx, gradCy, 0, gradCx, gradCy, radius * 1.4);
    
    // Highlight - BRIGHTER, smaller hot spot
    bodyGrad.addColorStop(0, '#d8d0c8'); // Brighter than before
    bodyGrad.addColorStop(0.08, PALETTE.moonHighlight);
    
    // Light - quicker falloff
    bodyGrad.addColorStop(0.15, PALETTE.moonLight);
    bodyGrad.addColorStop(0.25, PALETTE.moonLight);
    
    // Halftone - compressed for more contrast
    bodyGrad.addColorStop(0.35, PALETTE.moonMid);
    bodyGrad.addColorStop(0.42, PALETTE.moonMid);
    
    // Core shadow - DARKER, more dramatic
    bodyGrad.addColorStop(0.5, PALETTE.moonDark);
    bodyGrad.addColorStop(0.62, PALETTE.moonShadow);
    bodyGrad.addColorStop(0.75, '#181515'); // Darker than before
    
    // Reflected light (from planet!) - subtle
    bodyGrad.addColorStop(0.88, ColorUtils.blend('#181515', PALETTE.planetLight, 0.15));
    bodyGrad.addColorStop(1, ColorUtils.blend('#181515', PALETTE.planetLight, 0.1));
    
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    
    // Extra limb darkening (makes it feel more 3D)
    const limbGrad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius);
    limbGrad.addColorStop(0, 'transparent');
    limbGrad.addColorStop(0.7, 'transparent');
    limbGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = limbGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    
    // =========================================================================
    // SURFACE FEATURES (Craters!)
    // =========================================================================
    NoiseUtils.seed = 333;
    
    // More craters, more size variation, some on lit side some on dark
    const craters = [];
    for (let i = 0; i < 12; i++) {
        const angle = NoiseUtils.random() * Math.PI * 2;
        const dist = NoiseUtils.random() * radius * 0.8;
        // More size variation - few large, many small
        const sizeRoll = NoiseUtils.random();
        const size = sizeRoll < 0.7 ? 2 + NoiseUtils.random() * 5 : 6 + NoiseUtils.random() * 10;
        craters.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            r: size
        });
    }
    
    // Sort by size so big ones draw first
    craters.sort((a, b) => b.r - a.r);
    
    craters.forEach(crater => {
        // Check if crater is on lit or shadow side
        const relX = crater.x - cx;
        const relY = crater.y - cy;
        const onLitSide = (relX < 0 && relY < 0); // Upper-left is lit
        
        // Shadow side of crater - DARKER, sharper
        const shadowGrad = ctx.createRadialGradient(
            crater.x + crater.r * 0.25, crater.y + crater.r * 0.25, 0,
            crater.x, crater.y, crater.r
        );
        const shadowStrength = onLitSide ? 0.5 : 0.35; // Stronger shadow on lit side (more visible)
        shadowGrad.addColorStop(0, ColorUtils.withAlpha('#000000', shadowStrength));
        shadowGrad.addColorStop(0.4, ColorUtils.withAlpha('#000000', shadowStrength * 0.6));
        shadowGrad.addColorStop(0.8, ColorUtils.withAlpha('#000000', shadowStrength * 0.2));
        shadowGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Lit rim - BRIGHTER, sharper on lit side craters
        if (onLitSide || crater.r > 6) {
            const rimBrightness = onLitSide ? 0.7 : 0.3;
            ctx.strokeStyle = ColorUtils.withAlpha('#e0d8d0', rimBrightness);
            ctx.lineWidth = crater.r > 6 ? 1.5 : 1;
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.r * 0.85, Math.PI * 0.75, Math.PI * 1.55);
            ctx.stroke();
        }
        
        // Central peak for larger craters
        if (crater.r > 8) {
            ctx.fillStyle = ColorUtils.withAlpha(PALETTE.moonMid, 0.4);
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.r * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    ctx.restore();
    
    // Subtle glow (no atmosphere, just reflected light bloom)
    ctx.globalCompositeOperation = 'screen';
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.15);
    glowGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.moonLight, 0.1));
    glowGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
}

// =============================================================================
// LAYER 8: FOREGROUND STARS
// =============================================================================

function drawForegroundStars() {
    NoiseUtils.seed = 1234;
    
    for (let i = 0; i < 10; i++) {
        const x = NoiseUtils.random() * W;
        const y = NoiseUtils.random() * H;
        const size = 2 + NoiseUtils.random() * 2.5;
        
        // Skip if near planet or moon
        const dxP = x - W * 0.78;
        const dyP = y - H * 0.65;
        if (Math.sqrt(dxP * dxP + dyP * dyP) < 320) continue;
        
        const dxM = x - W * 0.55;
        const dyM = y - H * 0.35;
        if (Math.sqrt(dxM * dxM + dyM * dyM) < 70) continue;
        
        // Strong glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 7);
        glowGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.starWhite, 0.5));
        glowGrad.addColorStop(0.2, ColorUtils.withAlpha(PALETTE.starBlue, 0.25));
        glowGrad.addColorStop(0.5, ColorUtils.withAlpha(PALETTE.starBlue, 0.08));
        glowGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Diffraction spikes
        ctx.strokeStyle = ColorUtils.withAlpha('#ffffff', 0.25);
        ctx.lineWidth = 1;
        const spikeLen = size * 5;
        
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
    console.log('Space Scene V2 - Applying fundamentals...');
    
    ctx.clearRect(0, 0, W, H);
    
    // Back to front
    drawDeepSpace();          // 1. Background
    drawDistantStars();       // 2. Far stars  
    drawNebula();             // 3. Gas cloud (improved structure)
    drawBrightStars();        // 4. Mid stars (temperature variation)
    const planetData = drawPlanet();  // 5. Planet with 5-value lighting + rings
    drawMoon(planetData);     // 6. Moon with 5-value lighting + craters
    drawForegroundStars();    // 7. Near stars
    
    console.log('Space Scene V2 - Complete');
    console.log('Improvements: 5-value sphere lighting, planet rings, moon with craters, structured nebula, star temperature variation');
}

render();
