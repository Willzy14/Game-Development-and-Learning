// ============================================================================
// V8.3 MOUNTAIN LANDSCAPE - INCREMENTAL IMPROVEMENT (V7 LESSON APPLIED)
// ============================================================================
// 
// PHILOSOPHY: Start from what works, fix ONE thing at a time
// 
// V8.4 CHANGES:
// - Fixed water ripples (valueNoise2D not Math.sin)
// - Fixed snow cap edges (curves not lines)
// - Fixed snow gradient (radial from peak, follows 3D form)
// - Soft circular patches (not jagged shapes)
// 
// BASE: V5 (which worked well)
// - 5-Value System on all forms
// - Form shadows with halftone transitions
// - Cast shadows: hard at contact, soft at distance
// - Compositing operations
// - Atmospheric perspective via color shift + desaturation
// 
// V7 LESSON LEARNED:
// - V7 applied everything (noise, materials, validation) → WORSE than V5
// - More techniques ≠ better results
// - Problem-first selection: What specific problem am I solving?
// 
// V8 APPROACH:
// 1. Start with V5 (proven foundation)
// 2. Identify ONE visible problem
// 3. Apply ONE targeted technique
// 4. Test: Is it CLEARLY better? Keep. Worse/unclear? Revert.
// 5. Repeat
// 
// CURRENT CHANGES FROM V5:
// - [None yet - this is the base. Identify problems first!]
// 
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// UTILITY FUNCTIONS & COLOR SYSTEM
// =============================================================================

// ColorUtils - from Bible doc 11-CANVAS_PATTERNS.md
const ColorUtils = {
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },
    
    lighten(hex, percent) {
        const rgb = this.hexToRgb(hex);
        const factor = percent / 100;
        return this.rgbToHex(
            rgb.r + (255 - rgb.r) * factor,
            rgb.g + (255 - rgb.g) * factor,
            rgb.b + (255 - rgb.b) * factor
        );
    },
    
    darken(hex, percent) {
        const rgb = this.hexToRgb(hex);
        const factor = 1 - percent / 100;
        return this.rgbToHex(
            rgb.r * factor,
            rgb.g * factor,
            rgb.b * factor
        );
    },
    
    withAlpha(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },
    
    blend(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        return this.rgbToHex(
            rgb1.r + (rgb2.r - rgb1.r) * factor,
            rgb1.g + (rgb2.g - rgb1.g) * factor,
            rgb1.b + (rgb2.b - rgb1.b) * factor
        );
    },
    
    desaturate(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const gray = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
        return this.rgbToHex(
            rgb.r + (gray - rgb.r) * factor,
            rgb.g + (gray - rgb.g) * factor,
            rgb.b + (gray - rgb.b) * factor
        );
    },
    
    // Atmospheric perspective: desaturate + shift toward haze
    applyAtmosphere(hex, distance, maxDistance, hazeColor = '#b0b8c8') {
        const factor = Math.min(1, distance / maxDistance);
        const desaturated = this.desaturate(hex, factor * 0.6);
        return this.blend(desaturated, hazeColor, factor * 0.4);
    }
};

// Basic utilities
function lerp(a, b, t) { return a + (b - a) * t; }
function seededRandom(s) { const x = Math.sin(s * 9999) * 10000; return x - Math.floor(x); }

// Value Noise for organic textures (from Doc 14)
function hash2(x, y, seed = 1337) {
    let n = x * 374761393 + y * 668265263 + seed * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    n = n ^ (n >> 16);
    return (n >>> 0) / 4294967295;
}

function valueNoise2D(x, y, seed = 1337) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const v00 = hash2(xi, yi, seed);
    const v10 = hash2(xi + 1, yi, seed);
    const v01 = hash2(xi, yi + 1, seed);
    const v11 = hash2(xi + 1, yi + 1, seed);
    
    const smoothX = xf * xf * (3 - 2 * xf);
    const smoothY = yf * yf * (3 - 2 * yf);
    
    const i1 = v00 * (1 - smoothX) + v10 * smoothX;
    const i2 = v01 * (1 - smoothX) + v11 * smoothX;
    
    return i1 * (1 - smoothY) + i2 * smoothY;
}

// Organic curve generator (no straight lines in nature)
function organicCurve(x1, y1, x2, y2, segments, variance, seed) {
    const pts = [{ x: x1, y: y1 }];
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const edgeFactor = Math.sin(t * Math.PI); // Variance strongest in middle
        const baseX = lerp(x1, x2, t);
        const baseY = lerp(y1, y2, t);
        pts.push({
            x: baseX + (seededRandom(seed + i * 2) - 0.5) * variance * edgeFactor,
            y: baseY + (seededRandom(seed + i * 2 + 1) - 0.5) * variance * edgeFactor
        });
    }
    pts.push({ x: x2, y: y2 });
    return pts;
}

// =============================================================================
// SCENE CONSTANTS - Single light source, consistent palette
// =============================================================================

// LIGHT SOURCE: Upper right (sunset position)
const LIGHT = {
    x: W * 0.7,
    y: H * 0.35,
    angle: Math.PI * 0.75, // Coming from upper-right
    warmColor: '#ffe8c0',
    coolColor: '#6080a0'
};

// Atmospheric haze color (for distance)
const HAZE_COLOR = '#b0b8c8';

// Ground/horizon line
const HORIZON = H * 0.52;

// =============================================================================
// COLOR PALETTE - Defined once, used consistently
// =============================================================================

const PALETTE = {
    // Sky gradient
    skyDark: '#0a0a18',
    skyMid: '#1a2040',
    skyLight: '#4a4060',
    skyWarm: '#c07050',
    skyBright: '#f0c090',
    
    // Mountains
    mtnShadow: '#3a4858',
    mtnMid: '#5a6a78',
    mtnLight: '#8a9aa8',
    mtnHighlight: '#c0d0e0',
    
    // Snow
    snowPure: '#ffffff',
    snowLight: '#f0f4f8',
    snowMid: '#d8e0e8',
    snowShadow: '#a0b0c0',
    
    // Forest
    forestDark: '#1a3020',
    forestMid: '#2a4830',
    forestLight: '#3a5840',
    
    // Water
    waterDeep: '#1a3050',
    waterMid: '#3a5878',
    waterLight: '#5a7898',
    waterHighlight: '#8ab0d0',
    
    // Foreground
    grassDark: '#1a3010',
    grassMid: '#2a4820',
    grassLight: '#4a6838',
    
    // Sun/glow
    sunCore: '#fffef0',
    sunMid: '#fff0c0',
    sunGlow: '#ffc060'
};

// =============================================================================
// PART 2: SKY, SUN, CLOUDS, STARS
// =============================================================================

function drawSky() {
    // Multi-stop gradient for rich sunset sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON);
    skyGrad.addColorStop(0, PALETTE.skyDark);
    skyGrad.addColorStop(0.12, '#101828');
    skyGrad.addColorStop(0.25, PALETTE.skyMid);
    skyGrad.addColorStop(0.40, '#3a3855');
    skyGrad.addColorStop(0.55, PALETTE.skyLight);
    skyGrad.addColorStop(0.70, PALETTE.skyWarm);
    skyGrad.addColorStop(0.85, '#e0a070');
    skyGrad.addColorStop(1, PALETTE.skyBright);
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, HORIZON + 20);
}

function drawStars() {
    ctx.save();
    // Stars only visible in dark upper portion
    const starRegion = H * 0.25;
    
    for (let i = 0; i < 150; i++) {
        const seed = i * 3;
        const x = seededRandom(seed) * W;
        const y = seededRandom(seed + 1) * starRegion;
        
        // Fade stars based on height (darker = more visible)
        const visibility = 1 - (y / starRegion);
        const size = 0.5 + seededRandom(seed + 2) * 1.8;
        
        // Star color variation (white to slight blue/yellow)
        const colorVar = seededRandom(seed + 3);
        let starColor;
        if (colorVar > 0.9) starColor = '#ffe8c0'; // warm
        else if (colorVar > 0.8) starColor = '#c0d0ff'; // cool
        else starColor = '#ffffff';
        
        ctx.globalAlpha = 0.3 + visibility * 0.5;
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Brightest stars get tiny glow
        if (size > 1.5 && visibility > 0.5) {
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawSun() {
    const sx = LIGHT.x - W * 0.05;  // Slightly left of light source
    const sy = LIGHT.y + H * 0.05;
    const sr = 50;
    
    ctx.save();
    
    // Outer glow layers using 'lighter' compositing
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 7; i >= 0; i--) {
        const glowR = sr + i * 30;
        const glowAlpha = 0.08 - i * 0.008;
        
        const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        glowGrad.addColorStop(0, ColorUtils.withAlpha(PALETTE.sunGlow, glowAlpha));
        glowGrad.addColorStop(0.5, ColorUtils.withAlpha('#ffa040', glowAlpha * 0.5));
        glowGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset compositing for sun body
    ctx.globalCompositeOperation = 'source-over';
    
    // Sun body with 5-value system (even for light sources!)
    // Offset gradient center toward light = upper-left of sun disk
    const sunGrad = ctx.createRadialGradient(
        sx - sr * 0.2, sy - sr * 0.2, sr * 0.05,  // Highlight center
        sx, sy, sr
    );
    sunGrad.addColorStop(0, PALETTE.sunCore);       // 1. Highlight
    sunGrad.addColorStop(0.3, PALETTE.sunMid);      // 2. Light
    sunGrad.addColorStop(0.6, '#ffd080');           // 3. Halftone
    sunGrad.addColorStop(0.85, PALETTE.sunGlow);    // 4. Core (not shadow - it's a light!)
    sunGrad.addColorStop(1, '#ff9030');             // 5. Edge (slight darkening)
    
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawClouds() {
    ctx.save();
    
    // Wispy high clouds - lit by sunset
    for (let i = 0; i < 12; i++) {
        const seed = 7000 + i * 17;
        const cx = seededRandom(seed) * W;
        const cy = H * 0.06 + seededRandom(seed + 1) * H * 0.18;
        
        // Clouds nearer sun are warmer/brighter
        const distToSun = Math.abs(cx - LIGHT.x) / W;
        const warmth = 1 - distToSun;
        
        ctx.globalAlpha = 0.15 + warmth * 0.1;
        
        // Each cloud is cluster of puffs
        for (let p = 0; p < 7; p++) {
            const px = cx + (seededRandom(seed + p * 3) - 0.5) * 80;
            const py = cy + (seededRandom(seed + p * 3 + 1) - 0.5) * 18;
            const pr = 12 + seededRandom(seed + p * 3 + 2) * 25;
            
            // Cloud puff gradient - lit from above/right
            const puffGrad = ctx.createRadialGradient(
                px - pr * 0.2, py - pr * 0.3, 0,
                px, py, pr
            );
            
            // Warm highlights on clouds near sun
            const highlightColor = warmth > 0.5 ? 
                ColorUtils.blend('#ffffff', '#ffd0a0', warmth) : 
                '#fff8f0';
            
            puffGrad.addColorStop(0, ColorUtils.withAlpha(highlightColor, 0.6));
            puffGrad.addColorStop(0.5, ColorUtils.withAlpha('#ffe8d0', 0.3));
            puffGrad.addColorStop(1, 'rgba(255, 220, 180, 0)');
            
            ctx.fillStyle = puffGrad;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// =============================================================================
// PART 3: FAR MOUNTAINS (Atmospheric Perspective Demo)
// =============================================================================

// Far mountains demonstrate atmospheric perspective:
// - Distance = desaturation + blue/gray shift (NOT just alpha!)
// - Furthest = most haze, closest = clearest

function drawFarMountains() {
    // Layer 1: Most distant (heaviest haze)
    drawDistantMountainRange({
        baseY: H * 0.42,
        maxHeight: 65,
        baseColor: '#5a6878',
        distance: 0.85,        // 85% toward maximum distance
        peakCount: 6,
        seed: 1000
    });
    
    // Layer 2: Mid-distant
    drawDistantMountainRange({
        baseY: H * 0.44,
        maxHeight: 95,
        baseColor: '#4a5868',
        distance: 0.65,
        peakCount: 8,
        seed: 2000
    });
    
    // Layer 3: Closer distant
    drawDistantMountainRange({
        baseY: H * 0.47,
        maxHeight: 130,
        baseColor: '#3a4858',
        distance: 0.45,
        peakCount: 10,
        seed: 3000
    });
}

function drawDistantMountainRange({ baseY, maxHeight, baseColor, distance, peakCount, seed }) {
    // Apply atmospheric perspective: desaturate + shift to haze color
    const atmosphereColor = ColorUtils.applyAtmosphere(baseColor, distance, 1.0, HAZE_COLOR);
    
    // Build mountain ridge with organic variation
    const ridge = [{ x: -20, y: baseY }];
    const segmentsPerPeak = 4;
    
    for (let i = 0; i <= peakCount * segmentsPerPeak; i++) {
        const t = i / (peakCount * segmentsPerPeak);
        const x = t * (W + 40) - 20;
        
        // Height follows sine pattern for natural peaks
        const peakPhase = Math.pow(Math.sin(t * Math.PI * peakCount), 2);
        const heightVar = 0.5 + seededRandom(seed + i) * 0.5;
        const h = maxHeight * peakPhase * heightVar;
        
        // Slight horizontal variance
        const xVar = (seededRandom(seed + i + 100) - 0.5) * 15;
        
        ridge.push({ x: x + xVar, y: baseY - h });
    }
    
    ridge.push({ x: W + 20, y: baseY });
    ridge.push({ x: W + 20, y: H });
    ridge.push({ x: -20, y: H });
    
    // Draw with atmosphere-adjusted color
    ctx.fillStyle = atmosphereColor;
    ctx.beginPath();
    ctx.moveTo(ridge[0].x, ridge[0].y);
    
    // Use quadratic curves for organic silhouette (not straight lineTo)
    // Only curve the ridge portion (skip the bottom rectangle points)
    const ridgeEndIndex = ridge.length - 3; // Last 3 points are bottom rectangle
    for (let i = 1; i < ridgeEndIndex; i++) {
        // Control point is midway between current and next point
        const nextI = Math.min(i + 1, ridgeEndIndex - 1);
        const cpX = (ridge[i].x + ridge[nextI].x) / 2;
        const cpY = (ridge[i].y + ridge[nextI].y) / 2;
        ctx.quadraticCurveTo(ridge[i].x, ridge[i].y, cpX, cpY);
    }
    // Connect last ridge point to corner, then complete bottom
    ctx.lineTo(ridge[ridgeEndIndex].x, ridge[ridgeEndIndex].y);
    for (let i = ridgeEndIndex + 1; i < ridge.length; i++) {
        ctx.lineTo(ridge[i].x, ridge[i].y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Add subtle value variation (even distant mountains have some form)
    addDistantMountainValues(ridge, baseY, maxHeight, atmosphereColor, distance, seed);
}

function addDistantMountainValues(ridge, baseY, maxHeight, baseAtmColor, distance, seed) {
    ctx.save();
    
    // Light side hint (facing sun) - only visible on closer mountains
    if (distance < 0.7) {
        const lightAlpha = (0.7 - distance) * 0.15;
        ctx.globalAlpha = lightAlpha;
        ctx.fillStyle = ColorUtils.lighten(baseAtmColor, 15);
        
        // Draw right-facing slopes
        for (let i = 2; i < ridge.length - 4; i += 2) {
            if (ridge[i].y < ridge[i-1].y && ridge[i].y < ridge[i+1].y) {
                // This is a peak - draw lit right slope
                ctx.beginPath();
                ctx.moveTo(ridge[i].x, ridge[i].y);
                ctx.lineTo(ridge[i+1].x, ridge[i+1].y);
                ctx.lineTo(ridge[i].x, ridge[i+1].y);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    ctx.restore();
}

// =============================================================================
// PART 4: MAIN MOUNTAINS (5-Value System Demo)
// =============================================================================

// Main mountains demonstrate proper 5-value system:
// Shadow face: Core shadow (darkest) with reflected light at bottom
// Light face: Highlight → Light → Halftone transition
// Snow: Follows same principles with cool shadows

function drawMainMountains() {
    // Left mountain
    drawMountain({
        peakX: W * 0.15,
        baseY: HORIZON,
        width: 340,
        height: 280,
        seed: 100
    });
    
    // Center mountain (tallest, focal point)
    drawMountain({
        peakX: W * 0.50,
        baseY: HORIZON,
        width: 440,
        height: 360,
        seed: 200
    });
    
    // Right mountain
    drawMountain({
        peakX: W * 0.85,
        baseY: HORIZON,
        width: 320,
        height: 260,
        seed: 300
    });
}

function drawMountain({ peakX, baseY, width, height, seed }) {
    const peakY = baseY - height;
    
    // Generate organic ridge lines
    const leftRidge = organicCurve(peakX, peakY, peakX - width * 0.55, baseY, 16, 22, seed);
    const rightRidge = organicCurve(peakX, peakY, peakX + width * 0.45, baseY, 16, 22, seed + 500);
    
    // ===== SHADOW FACE (Left - away from sun) =====
    // 5-Value: Light at top (some bounce) → Core shadow → Reflected light at base
    drawMountainFace({
        ridge: leftRidge,
        peakX, peakY, baseY,
        facingSun: false,
        seed: seed
    });
    
    // ===== LIT FACE (Right - facing sun) =====
    // 5-Value: Highlight at peak → Light → Halftone → slight shadow at base
    drawMountainFace({
        ridge: rightRidge,
        peakX, peakY, baseY,
        facingSun: true,
        seed: seed + 1000
    });
    
    // Snow caps with proper values
    drawSnowCap(leftRidge, rightRidge, peakX, peakY, width, height, seed);
    
    // Cast shadow from mountain onto lake (if below horizon)
    drawMountainCastShadow(peakX, baseY, width, height, seed);
}

function drawMountainFace({ ridge, peakX, peakY, baseY, facingSun, seed }) {
    const startX = ridge[ridge.length - 1].x;
    
    if (facingSun) {
        // LIT FACE: 5-value gradient toward light
        const grad = ctx.createLinearGradient(peakX, peakY, startX, baseY);
        grad.addColorStop(0, PALETTE.mtnHighlight);     // 1. Highlight at peak
        grad.addColorStop(0.2, PALETTE.mtnLight);       // 2. Light
        grad.addColorStop(0.5, PALETTE.mtnMid);         // 3. Halftone (CRITICAL!)
        grad.addColorStop(0.8, PALETTE.mtnShadow);      // 4. Slight shadow at base
        grad.addColorStop(1, ColorUtils.darken(PALETTE.mtnShadow, 10));
        ctx.fillStyle = grad;
    } else {
        // SHADOW FACE: Core shadow with reflected light
        const grad = ctx.createLinearGradient(peakX, peakY, startX, baseY);
        grad.addColorStop(0, ColorUtils.darken(PALETTE.mtnShadow, 5));   // Top of shadow
        grad.addColorStop(0.3, PALETTE.mtnShadow);                        // 3. Halftone
        grad.addColorStop(0.6, ColorUtils.darken(PALETTE.mtnShadow, 20)); // 4. CORE SHADOW (darkest!)
        grad.addColorStop(0.85, ColorUtils.darken(PALETTE.mtnShadow, 12)); // 5. Reflected light!
        grad.addColorStop(1, ColorUtils.darken(PALETTE.mtnShadow, 15));
        ctx.fillStyle = grad;
    }
    
    // Draw face shape with organic curves
    ctx.beginPath();
    ctx.moveTo(ridge[0].x, ridge[0].y);
    
    // Use quadratic curves for ridge portion
    for (let i = 1; i < ridge.length; i++) {
        const nextI = Math.min(i + 1, ridge.length - 1);
        const cpX = (ridge[i].x + ridge[nextI].x) / 2;
        const cpY = (ridge[i].y + ridge[nextI].y) / 2;
        ctx.quadraticCurveTo(ridge[i].x, ridge[i].y, cpX, cpY);
    }
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Add rock texture
    drawRockTexture(ridge, peakX, baseY, facingSun, seed);
}

function drawRockTexture(ridge, peakX, baseY, facingSun, seed) {
    const peakY = ridge[0].y;
    ctx.save();
    
    // Rock striations following slope
    ctx.globalAlpha = facingSun ? 0.12 : 0.08;
    for (let i = 0; i < 35; i++) {
        const t = 0.1 + (i / 35) * 0.85;
        const y = peakY + (baseY - peakY) * t;
        
        // Find x position on ridge at this height
        const ridgeIdx = Math.floor(t * (ridge.length - 1));
        const rx = ridge[Math.min(ridgeIdx, ridge.length - 1)].x;
        
        const startX = facingSun ? peakX + 5 : rx;
        const endX = facingSun ? rx : peakX - 5;
        
        // Alternate between dark cracks and lighter rock
        ctx.strokeStyle = seededRandom(seed + i * 11) > 0.5 ? 
            'rgba(25, 35, 50, 0.15)' : 
            'rgba(100, 115, 130, 0.12)';
        ctx.lineWidth = 1 + seededRandom(seed + i * 14);
        
        ctx.beginPath();
        ctx.moveTo(startX, y);
        for (let s = 1; s <= 6; s++) {
            const sx = lerp(startX, endX, s / 6);
            const sy = y + (seededRandom(seed + i * 20 + s) - 0.5) * 6;
            ctx.lineTo(sx, sy);
        }
        ctx.stroke();
    }
    
    // Rock patches (weathering)
    ctx.globalAlpha = facingSun ? 0.10 : 0.06;
    for (let i = 0; i < 45; i++) {
        const ps = seed + 2000 + i * 17;
        const t = 0.08 + seededRandom(ps) * 0.85;
        const y = peakY + (baseY - peakY) * t;
        
        const ridgeIdx = Math.floor(t * (ridge.length - 1));
        const rx = ridge[Math.min(ridgeIdx, ridge.length - 1)].x;
        const xRange = Math.abs(rx - peakX);
        
        const x = facingSun ? 
            peakX + seededRandom(ps + 1) * xRange * 0.85 :
            peakX - seededRandom(ps + 1) * xRange * 0.85;
        
        const pw = 6 + seededRandom(ps + 2) * 20;
        const ph = pw * 0.35;
        
        ctx.fillStyle = seededRandom(ps + 5) > 0.5 ?
            'rgba(20, 30, 45, 0.18)' :
            'rgba(90, 105, 120, 0.12)';
        
        // Organic patch shape
        ctx.beginPath();
        for (let a = 0; a <= 8; a++) {
            const ang = (a / 8) * Math.PI * 2;
            const v = 0.65 + seededRandom(ps + 10 + a) * 0.5;
            const px = x + Math.cos(ang) * pw * v;
            const py = y + Math.sin(ang) * ph * v;
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

function drawSnowCap(leftRidge, rightRidge, peakX, peakY, width, height, seed) {
    const snowLine = height * 0.30;
    ctx.save();
    
    // Build snow cap shape following ridges
    const snowPts = [];
    
    // Follow left ridge from low point up to peak
    const leftSnowIdx = Math.floor(leftRidge.length * 0.35);
    for (let i = leftSnowIdx; i >= 0; i--) {
        snowPts.push({ x: leftRidge[i].x, y: leftRidge[i].y });
    }
    
    // Follow right ridge from peak down
    const rightSnowIdx = Math.floor(rightRidge.length * 0.35);
    for (let i = 1; i <= rightSnowIdx; i++) {
        snowPts.push({ x: rightRidge[i].x, y: rightRidge[i].y });
    }
    
    // Soft organic bottom edge
    const bottomEdge = organicCurve(
        rightRidge[rightSnowIdx].x, rightRidge[rightSnowIdx].y + snowLine * 0.4,
        leftRidge[leftSnowIdx].x, leftRidge[leftSnowIdx].y + snowLine * 0.4,
        18, 15, seed + 400
    );
    for (const pt of bottomEdge) {
        snowPts.push(pt);
    }
    
    // SNOW 5-VALUE GRADIENT - Radial from peak (follows 3D form)
    // Peak = brightest (highlight), slopes = darker (form shadow)
    const snowGrad = ctx.createRadialGradient(
        peakX, peakY, 0,
        peakX, peakY + snowLine * 0.6, width * 0.6
    );
    snowGrad.addColorStop(0, PALETTE.snowPure);       // 1. Highlight at peak
    snowGrad.addColorStop(0.25, PALETTE.snowLight);   // 2. Light
    snowGrad.addColorStop(0.5, PALETTE.snowMid);      // 3. Halftone
    snowGrad.addColorStop(0.75, PALETTE.snowShadow);  // 4. Shadow
    snowGrad.addColorStop(1, ColorUtils.darken(PALETTE.snowShadow, 8)); // Darker at edges
    
    // Draw with smooth curves (not straight lines)
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = snowGrad;
    ctx.beginPath();
    ctx.moveTo(snowPts[0].x, snowPts[0].y);
    
    // Use quadratic curves for smooth organic edge
    for (let i = 1; i < snowPts.length; i++) {
        const nextI = (i + 1) % snowPts.length;
        const cpX = (snowPts[i].x + snowPts[nextI].x) / 2;
        const cpY = (snowPts[i].y + snowPts[nextI].y) / 2;
        ctx.quadraticCurveTo(snowPts[i].x, snowPts[i].y, cpX, cpY);
    }
    ctx.closePath();
    ctx.fill();
    
    // Scattered snow patches below main cap (100% soft edges)
    for (let i = 0; i < 30; i++) {
        const ps = seed + 450 + i * 13;
        const px = peakX + (seededRandom(ps) - 0.5) * width * 0.5;
        const py = peakY + snowLine * 0.75 + seededRandom(ps + 1) * snowLine * 0.9;
        const pSize = 3 + seededRandom(ps + 2) * 12;
        const pAlpha = 0.12 + seededRandom(ps + 3) * 0.3;
        
        // Soft radial gradient for each patch (no hard edges)
        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pSize);
        pGrad.addColorStop(0, PALETTE.snowLight);
        pGrad.addColorStop(0.5, PALETTE.snowMid);
        pGrad.addColorStop(1, 'rgba(216, 224, 232, 0)'); // Fade to transparent
        
        ctx.globalAlpha = pAlpha;
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Snow sparkles (tiny highlights)
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 25; i++) {
        const sx = peakX + (seededRandom(seed + 550 + i) - 0.5) * width * 0.35;
        const sy = peakY + seededRandom(seed + 551 + i) * snowLine * 0.7;
        const ss = 0.8 + seededRandom(seed + 552 + i) * 1.8;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawMountainCastShadow(peakX, baseY, width, height, seed) {
    // Mountains cast shadows onto the lake below
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    
    const lakeTop = HORIZON;
    const shadowLength = 80;
    
    // Shadow gradient: hard at contact (water edge), soft further out
    const shadowGrad = ctx.createLinearGradient(
        peakX, lakeTop,
        peakX, lakeTop + shadowLength
    );
    shadowGrad.addColorStop(0, 'rgba(20, 30, 50, 0.35)');    // Hard at contact
    shadowGrad.addColorStop(0.3, 'rgba(20, 30, 50, 0.2)');
    shadowGrad.addColorStop(0.7, 'rgba(30, 40, 60, 0.08)');
    shadowGrad.addColorStop(1, 'rgba(30, 40, 60, 0)');       // Soft fade
    
    ctx.fillStyle = shadowGrad;
    
    // Shadow shape follows mountain base width
    ctx.beginPath();
    ctx.moveTo(peakX - width * 0.4, lakeTop);
    ctx.lineTo(peakX + width * 0.3, lakeTop);
    ctx.lineTo(peakX + width * 0.2, lakeTop + shadowLength);
    ctx.lineTo(peakX - width * 0.3, lakeTop + shadowLength);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Forest trees between mountains and lake
function drawForest() {
    const layers = [
        { y: H * 0.485, scale: 0.35, color: '#182818', haze: 0.60, count: 35 },
        { y: H * 0.495, scale: 0.50, color: '#1c3018', haze: 0.40, count: 28 },
        { y: H * 0.507, scale: 0.70, color: '#203820', haze: 0.20, count: 22 },
        { y: H * 0.520, scale: 0.90, color: '#284828', haze: 0.05, count: 18 }
    ];
    
    for (const layer of layers) {
        const atmColor = ColorUtils.applyAtmosphere(layer.color, layer.haze, 1.0, HAZE_COLOR);
        
        for (let i = 0; i < layer.count; i++) {
            const seed = layer.y * 100 + i * 37;
            const x = (i / layer.count) * W + (seededRandom(seed) - 0.5) * (W / layer.count) * 0.8;
            const treeHeight = (25 + seededRandom(seed + 1) * 45) * layer.scale;
            const treeWidth = treeHeight * 0.25;
            
            // Pass haze/distance to control edge variation
            drawTree(x, layer.y, treeWidth, treeHeight, atmColor, seed, layer.haze);
        }
    }
}

function drawTree(x, y, w, h, color, seed, distance = 0) {
    // Conifer with organic edges
    // Edge variation scales with distance: far trees = more lost edges, near trees = more defined
    // Close trees (distance < 0.1) get smooth clean edges, distant trees get irregular variation
    const useCleanEdges = distance < 0.15;
    const edgeVariation = distance * 0.4;  // 0 (near) to 0.24 (far=0.6)
    
    for (let L = 0; L < 5; L++) {
        const t = L / 5;
        const layerY = y - h * 0.1 - h * t * 0.8;
        const layerW = w * (1 - t * 0.6);
        const layerH = h / 5 * 1.3;
        const skew = (seededRandom(seed + L * 10) - 0.5) * 5;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // Top point with slight variation
        const topX = x + skew;
        ctx.moveTo(topX, layerY - layerH);
        
        if (useCleanEdges) {
            // CLOSE TREES: Clean smooth triangular silhouette
            ctx.lineTo(x - layerW, layerY);
            ctx.lineTo(x + layerW * 0.85, layerY);
        } else {
            // DISTANT TREES: Irregular edge variation
            const leftPoints = 3;
            for (let p = 1; p <= leftPoints; p++) {
                const pt = p / (leftPoints + 1);
                const px = lerp(topX, x - layerW, pt);
                const py = lerp(layerY - layerH, layerY, pt);
                const vary = (seededRandom(seed + L * 30 + p) - 0.5) * layerW * edgeVariation;
                ctx.lineTo(px + vary, py + (seededRandom(seed + L * 31 + p) - 0.5) * 3 * edgeVariation);
            }
            ctx.lineTo(x - layerW + (seededRandom(seed + L * 40) - 0.5) * 4 * edgeVariation, layerY);
            
            // Right edge with irregular points
            for (let p = leftPoints; p >= 1; p--) {
                const pt = p / (leftPoints + 1);
                const px = lerp(x + layerW * 0.85, topX, pt);
                const py = lerp(layerY, layerY - layerH, pt);
                const vary = (seededRandom(seed + L * 50 + p) - 0.5) * layerW * edgeVariation;
                ctx.lineTo(px + vary, py + (seededRandom(seed + L * 51 + p) - 0.5) * 3 * edgeVariation);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
}

// =============================================================================
// PART 5: LAKE & REFLECTIONS
// =============================================================================

function drawLake() {
    const lakeTop = HORIZON;
    const lakeBot = H * 0.78;
    
    // Base water gradient (deep to shallow)
    const waterGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeBot);
    waterGrad.addColorStop(0, PALETTE.waterLight);
    waterGrad.addColorStop(0.4, PALETTE.waterMid);
    waterGrad.addColorStop(0.8, PALETTE.waterDeep);
    waterGrad.addColorStop(1, ColorUtils.darken(PALETTE.waterDeep, 15));
    
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, lakeTop, W, lakeBot - lakeTop);
    
    // Broken mountain reflections (horizontal bands, not solid shapes)
    drawBrokenReflections(lakeTop, lakeBot);
    
    // Sun reflection path (scattered sparkles)
    drawSunReflection(lakeTop, lakeBot);
    
    // Water surface texture (subtle ripples)
    drawWaterTexture(lakeTop, lakeBot);
    
    // Soft shoreline transition
    drawShoreline(lakeTop);
}

function drawBrokenReflections(lakeTop, lakeBot) {
    ctx.save();
    
    const reflectionHeight = (lakeBot - lakeTop) * 0.5;
    const bandCount = 40;
    
    // Mountains to reflect
    const reflections = [
        { x: W * 0.15, baseWidth: 120, color: ColorUtils.darken(PALETTE.mtnShadow, 10) },
        { x: W * 0.50, baseWidth: 160, color: ColorUtils.darken(PALETTE.mtnShadow, 5) },
        { x: W * 0.85, baseWidth: 100, color: ColorUtils.darken(PALETTE.mtnShadow, 10) }
    ];
    
    for (let b = 0; b < bandCount; b++) {
        const t = b / bandCount;
        const y = lakeTop + t * reflectionHeight;
        const bandH = reflectionHeight / bandCount + 1;
        
        // More distortion further from shore
        const distortion = 2 + t * 7;
        // Fade with distance
        const alpha = 0.22 * (1 - t * 0.65);
        
        ctx.globalAlpha = alpha;
        
        for (const ref of reflections) {
            // Width decreases with distance (perspective)
            const w = ref.baseWidth * (1 - t * 0.5);
            
            // Create wavy horizontal band
            const topPts = organicCurve(ref.x - w, y, ref.x + w, y, 10, distortion, b * 100 + ref.x);
            const botPts = organicCurve(ref.x + w, y + bandH, ref.x - w, y + bandH, 10, distortion, b * 101 + ref.x);
            
            ctx.fillStyle = ref.color;
            ctx.beginPath();
            ctx.moveTo(topPts[0].x, topPts[0].y);
            for (const p of topPts) ctx.lineTo(p.x, p.y);
            for (const p of botPts) ctx.lineTo(p.x, p.y);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    ctx.restore();
}

function drawSunReflection(lakeTop, lakeBot) {
    const sx = LIGHT.x - W * 0.05;
    
    ctx.save();
    
    // Soft glow base (using 'lighter' for additive blending)
    ctx.globalCompositeOperation = 'lighter';
    
    const glowGrad = ctx.createRadialGradient(sx, lakeTop + 30, 0, sx, lakeTop + 100, 180);
    glowGrad.addColorStop(0, 'rgba(255, 220, 150, 0.15)');
    glowGrad.addColorStop(0.5, 'rgba(255, 200, 120, 0.06)');
    glowGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sx - 180, lakeTop, 360, 180);
    
    // Reset for sparkles
    ctx.globalCompositeOperation = 'source-over';
    
    // Scattered sparkles (key technique from V4, refined)
    for (let i = 0; i < 140; i++) {
        const seed = 8000 + i * 7;
        const t = seededRandom(seed);
        
        // Spread widens with distance (perspective)
        const spread = 25 + t * 100;
        const spx = sx + (seededRandom(seed + 1) - 0.5) * spread;
        const spy = lakeTop + 8 + t * (lakeBot - lakeTop) * 0.6;
        
        // Vary sizes - few bright, many small
        const isBright = seededRandom(seed + 2) > 0.88;
        const size = isBright ? (2.5 + seededRandom(seed + 3) * 3.5) : (0.6 + seededRandom(seed + 3) * 1.8);
        
        // Intensity falls off with distance
        const intensity = (1 - t * 0.7) * (isBright ? 1 : 0.55);
        
        ctx.globalAlpha = intensity * 0.85;
        ctx.fillStyle = isBright ? '#fffae0' : '#ffd080';
        ctx.beginPath();
        ctx.arc(spx, spy, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow around bright sparkles
        if (isBright) {
            ctx.globalAlpha = intensity * 0.25;
            ctx.beginPath();
            ctx.arc(spx, spy, size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

function drawWaterTexture(lakeTop, lakeBot) {
    ctx.save();
    ctx.globalAlpha = 0.04;
    
    // Subtle horizontal ripples
    for (let i = 0; i < 45; i++) {
        const y = lakeTop + (i / 45) * (lakeBot - lakeTop);
        const amplitude = 1 + i * 0.1;
        
        ctx.strokeStyle = i % 2 === 0 ? 
            'rgba(120, 170, 220, 0.25)' : 
            'rgba(60, 110, 160, 0.18)';
        ctx.lineWidth = 0.5;
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        // Use value noise for organic, non-repeating ripple pattern
        for (let x = 0; x <= W; x += 10) {
            const noiseY = valueNoise2D(x * 0.008, i * 0.3, 42) * amplitude;
            ctx.lineTo(x, y + noiseY);
        }
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawShoreline(lakeTop) {
    ctx.save();
    
    // Gradient blending vegetation into water
    const blendHeight = 30;
    const shoreGrad = ctx.createLinearGradient(0, lakeTop - blendHeight, 0, lakeTop + blendHeight);
    shoreGrad.addColorStop(0, 'rgba(70, 95, 60, 0.85)');
    shoreGrad.addColorStop(0.35, 'rgba(65, 90, 65, 0.55)');
    shoreGrad.addColorStop(0.5, 'rgba(60, 85, 75, 0.25)');
    shoreGrad.addColorStop(0.7, 'rgba(70, 100, 100, 0.08)');
    shoreGrad.addColorStop(1, 'rgba(80, 110, 120, 0)');
    
    // Organic shoreline path
    const shorePts = organicCurve(-15, lakeTop, W + 15, lakeTop, 45, 10, 5555);
    
    ctx.fillStyle = shoreGrad;
    ctx.beginPath();
    ctx.moveTo(-15, lakeTop - blendHeight);
    for (const pt of shorePts) {
        ctx.lineTo(pt.x, pt.y + 10);
    }
    ctx.lineTo(W + 15, lakeTop + blendHeight);
    ctx.lineTo(-15, lakeTop + blendHeight);
    ctx.closePath();
    ctx.fill();
    
    // Shore details: reeds, rocks
    for (let i = 0; i < 40; i++) {
        const seed = 6000 + i * 23;
        const rx = seededRandom(seed) * W;
        const ry = lakeTop + (seededRandom(seed + 1) - 0.5) * 20;
        
        if (seededRandom(seed + 2) > 0.5) {
            // Reeds
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = '#2a4520';
            ctx.lineWidth = 1.5;
            
            for (let r = 0; r < 3; r++) {
                const reedH = 10 + seededRandom(seed + r * 3) * 18;
                const lean = (seededRandom(seed + r * 3 + 1) - 0.5) * 10;
                
                ctx.beginPath();
                ctx.moveTo(rx + r * 2, ry);
                ctx.quadraticCurveTo(rx + lean, ry - reedH * 0.6, rx + lean * 1.2, ry - reedH);
                ctx.stroke();
            }
        } else {
            // Small rocks with 5-value (yes, even tiny rocks!)
            const rs = 3 + seededRandom(seed + 3) * 5;
            
            // Base rock shape
            ctx.globalAlpha = 0.75;
            const rockGrad = ctx.createLinearGradient(rx - rs, ry, rx + rs, ry);
            rockGrad.addColorStop(0, '#404848');   // Shadow side
            rockGrad.addColorStop(0.4, '#505858'); // Halftone
            rockGrad.addColorStop(0.7, '#606868'); // Light
            rockGrad.addColorStop(1, '#505555');   // Reflected
            
            ctx.fillStyle = rockGrad;
            ctx.beginPath();
            for (let a = 0; a <= 8; a++) {
                const ang = (a / 8) * Math.PI * 2;
                const v = 0.65 + seededRandom(seed + a) * 0.4;
                const px = rx + Math.cos(ang) * rs * v;
                const py = ry + Math.sin(ang) * rs * v * 0.55;
                a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// =============================================================================
// PART 6: FOREGROUND, BIRDS, VIGNETTE, RENDER
// =============================================================================

function drawForeground() {
    const meadowTop = H * 0.76;
    
    // Base meadow gradient
    const grassGrad = ctx.createLinearGradient(0, meadowTop, 0, H);
    grassGrad.addColorStop(0, PALETTE.grassLight);
    grassGrad.addColorStop(0.4, PALETTE.grassMid);
    grassGrad.addColorStop(0.8, PALETTE.grassDark);
    grassGrad.addColorStop(1, ColorUtils.darken(PALETTE.grassDark, 20));
    
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, meadowTop, W, H - meadowTop);
    
    // Grass layers (back to front, lighter to darker)
    const grassLayers = [
        { alpha: 0.35, yOffset: 0, heightMult: 0.6, color: '#5a7848', count: 450 },
        { alpha: 0.55, yOffset: 0.2, heightMult: 0.8, color: '#4a6838', count: 400 },
        { alpha: 0.75, yOffset: 0.45, heightMult: 1.0, color: '#2a4818', count: 350 }
    ];
    
    ctx.save();
    
    for (const layer of grassLayers) {
        ctx.globalAlpha = layer.alpha;
        
        for (let i = 0; i < layer.count; i++) {
            const seed = 9000 + grassLayers.indexOf(layer) * 1000 + i * 11;
            const x = seededRandom(seed) * W;
            const y = meadowTop + (H - meadowTop) * (layer.yOffset + seededRandom(seed + 1) * 0.5);
            const h = (10 + seededRandom(seed + 2) * 14) * layer.heightMult;
            const lean = (seededRandom(seed + 3) - 0.5) * h * 0.35;
            
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = 1 + seededRandom(seed + 4) * 0.8;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + (seededRandom(seed + 5) - 0.5) * 6,
                y - h * 0.5,
                x + lean,
                y - h
            );
            ctx.stroke();
        }
    }
    
    ctx.restore();
    
    // Wildflowers
    drawWildflowers(meadowTop);
    
    // Large foreground rocks (with proper 5-value!)
    drawForegroundRocks(meadowTop);
}

function drawWildflowers(meadowTop) {
    ctx.save();
    
    const flowerColors = [
        { petal: '#dd4444', center: '#ffee55' },  // Red
        { petal: '#ee7722', center: '#ffdd00' },  // Orange
        { petal: '#ffcc00', center: '#886600' },  // Yellow
        { petal: '#ffffff', center: '#ffee55' },  // White daisies
        { petal: '#8855cc', center: '#ffee55' }   // Purple
    ];
    
    for (let i = 0; i < 100; i++) {
        const seed = 11000 + i * 17;
        const x = seededRandom(seed) * W;
        const y = meadowTop + seededRandom(seed + 1) * (H - meadowTop) * 0.85;
        const size = 2 + seededRandom(seed + 2) * 4;
        
        // Flowers nearer = larger and more opaque
        const depthFactor = (y - meadowTop) / (H - meadowTop);
        ctx.globalAlpha = 0.4 + depthFactor * 0.5;
        
        const flower = flowerColors[Math.floor(seededRandom(seed + 3) * flowerColors.length)];
        
        // Simple flower: circle with tiny center
        ctx.fillStyle = flower.petal;
        ctx.beginPath();
        ctx.arc(x, y - size * 2, size * (0.8 + depthFactor * 0.4), 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        if (size > 3) {
            ctx.fillStyle = flower.center;
            ctx.beginPath();
            ctx.arc(x, y - size * 2, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

function drawForegroundRocks(meadowTop) {
    ctx.save();
    
    // A few larger rocks in foreground with proper 5-value lighting
    const rocks = [
        { x: W * 0.08, y: H * 0.88, w: 45, h: 30 },
        { x: W * 0.92, y: H * 0.85, w: 55, h: 35 },
        { x: W * 0.25, y: H * 0.95, w: 35, h: 22 }
    ];
    
    for (const rock of rocks) {
        // Rock with 5-value gradient (light from right/above)
        const rockGrad = ctx.createLinearGradient(
            rock.x - rock.w * 0.4, rock.y,
            rock.x + rock.w * 0.5, rock.y - rock.h * 0.3
        );
        rockGrad.addColorStop(0, '#2a3040');     // 4. Core shadow
        rockGrad.addColorStop(0.2, '#3a4050');   // 5. Reflected light
        rockGrad.addColorStop(0.4, '#4a5060');   // 3. Halftone
        rockGrad.addColorStop(0.7, '#5a6070');   // 2. Light
        rockGrad.addColorStop(0.9, '#6a7080');   // 1. Highlight edge
        rockGrad.addColorStop(1, '#5a6575');     // Back to mid
        
        ctx.fillStyle = rockGrad;
        
        // Irregular rock shape
        ctx.beginPath();
        const seed = rock.x * 100;
        for (let a = 0; a <= 12; a++) {
            const ang = (a / 12) * Math.PI * 2;
            const v = 0.7 + seededRandom(seed + a * 3) * 0.4;
            const px = rock.x + Math.cos(ang) * rock.w * v;
            const py = rock.y + Math.sin(ang) * rock.h * v * 0.6;
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Contact shadow using multiply
        ctx.globalCompositeOperation = 'multiply';
        const aoGrad = ctx.createRadialGradient(
            rock.x, rock.y + rock.h * 0.3, 0,
            rock.x, rock.y + rock.h * 0.3, rock.w * 0.8
        );
        aoGrad.addColorStop(0, 'rgba(20, 30, 20, 0.5)');
        aoGrad.addColorStop(0.5, 'rgba(20, 30, 20, 0.2)');
        aoGrad.addColorStop(1, 'rgba(20, 30, 20, 0)');
        
        ctx.fillStyle = aoGrad;
        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y + rock.h * 0.3, rock.w * 0.8, rock.h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.restore();
}

function drawBirds() {
    ctx.save();
    ctx.strokeStyle = '#202530';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    // Small flocks of birds in distance
    const flocks = [
        { x: W * 0.25, y: H * 0.10, count: 4, scale: 1.0 },
        { x: W * 0.55, y: H * 0.14, count: 5, scale: 0.8 },
        { x: W * 0.75, y: H * 0.08, count: 3, scale: 0.9 }
    ];
    
    for (const flock of flocks) {
        ctx.globalAlpha = 0.35 + seededRandom(flock.x * 10) * 0.3;
        
        for (let b = 0; b < flock.count; b++) {
            const bx = flock.x + (b - flock.count / 2) * 14 * flock.scale;
            const by = flock.y + Math.abs(b - flock.count / 2) * 6;
            const wingSpan = (5 + seededRandom(flock.x + b) * 4) * flock.scale;
            
            ctx.beginPath();
            ctx.moveTo(bx - wingSpan, by + 3);
            ctx.quadraticCurveTo(bx, by - 3, bx + wingSpan, by + 3);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

function drawVignette() {
    ctx.save();
    
    // Radial vignette darkening edges
    const vignette = ctx.createRadialGradient(
        W / 2, H / 2, H * 0.3,
        W / 2, H / 2, H * 0.95
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)');
    vignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    
    ctx.restore();
}

// =============================================================================
// MAIN RENDER FUNCTION
// =============================================================================

function render() {
    ctx.clearRect(0, 0, W, H);
    
    // Background layers (far to near)
    drawSky();
    drawStars();
    drawSun();
    drawClouds();
    
    // Mountains (far to near)
    drawFarMountains();
    drawMainMountains();
    drawForest();
    
    // Water
    drawLake();
    
    // Foreground
    drawForeground();
    
    // Details
    drawBirds();
    
    // Post-processing
    drawVignette();
    
    console.log('V5 Rendered - Art Fundamentals Applied:');
    console.log('  ✓ 5-Value System on mountains and rocks');
    console.log('  ✓ Form shadows with halftone transitions');
    console.log('  ✓ Cast shadows using multiply compositing');
    console.log('  ✓ Atmospheric perspective via ColorUtils');
    console.log('  ✓ Glow effects using lighter compositing');
}

render();