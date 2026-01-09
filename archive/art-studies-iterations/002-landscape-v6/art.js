// ============================================================================
// V6 MOUNTAIN LANDSCAPE - EDGE MASTERY PARADIGM SHIFT
// ============================================================================
// 
// KEY INSIGHT: "Nature is built from probability fields, not boundaries."
// 
// V5 PROBLEM: We drew SHAPES with gradients (lineTo → fill)
// V6 SOLUTION: We ACCUMULATE FORM through scattered variation
//
// THE CHECKABLE RULE: If an edge can be traced with a ruler, it is WRONG.
//
// EDGE DISTRIBUTION TARGET:
//   - ~5% Hard edges (focal point, man-made only)
//   - ~30% Found edges (selectively sharpened)
//   - ~40% Soft edges (natural forms)
//   - ~25% Lost edges (dissolving into background)
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Seeded random for reproducibility
function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

// Simple noise function for natural variation
function noise(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
}

// Smooth noise with interpolation
function smoothNoise(x, y, seed = 0) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    
    const a = noise(ix, iy, seed);
    const b = noise(ix + 1, iy, seed);
    const c = noise(ix, iy + 1, seed);
    const d = noise(ix + 1, iy + 1, seed);
    
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

// =============================================================================
// EDGE UTILITIES - Core noise and edge functions
// =============================================================================

const EdgeUtils = {
    // 2D noise function for organic edge variation
    noise2D(x, y) {
        return smoothNoise(x, y, 12345);
    },
    
    // Get edge probability based on position and threshold
    getEdgeProbability(distance, threshold, softness = 1.0) {
        const normalizedDist = distance / threshold;
        return Math.max(0, 1 - Math.pow(normalizedDist, softness));
    },
    
    // Create soft edge transition
    softEdge(value, edge, width) {
        const t = clamp((value - edge + width/2) / width, 0, 1);
        return t * t * (3 - 2 * t);  // Smoothstep
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
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(clamp(x, 0, 255)).toString(16);
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
        return this.rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
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
    }
};

// =============================================================================
// EDGE MASTERY CORE FUNCTIONS
// =============================================================================

/**
 * Get edge sharpness based on depth (0 = near, 1 = far)
 * Far objects have softer edges (lost edges)
 * Near objects have sharper edges (found edges)
 */
function getEdgeSharpness(depth) {
    // Returns 1.0 at near (depth=0), 0.15 at far (depth=1)
    return lerp(1.0, 0.15, clamp(depth, 0, 1));
}

/**
 * Draw a soft blob - the fundamental building block
 * NO HARD EDGES - everything fades to transparent
 */
function drawSoftBlob(x, y, radius, color, sharpness = 1.0) {
    // Sharpness affects how quickly the blob fades
    // Low sharpness = very soft, gradual fade
    // High sharpness = still soft, but more defined
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    // Core is solid, edge fades based on sharpness
    const midStop = 0.3 + sharpness * 0.4;  // 0.3-0.7 based on sharpness
    
    grad.addColorStop(0, ColorUtils.withAlpha(color, 0.9));
    grad.addColorStop(midStop, ColorUtils.withAlpha(color, 0.5 * sharpness));
    grad.addColorStop(1, ColorUtils.withAlpha(color, 0));  // ALWAYS fade to zero
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw an irregular soft blob for more natural shapes
 */
function drawIrregularBlob(x, y, baseRadius, color, sharpness = 1.0, seed = 0) {
    const points = [];
    const segments = 12;
    
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const radiusVar = 0.7 + seededRandom(seed + i) * 0.6;  // 0.7-1.3 variation
        const r = baseRadius * radiusVar;
        points.push({
            x: x + Math.cos(angle) * r,
            y: y + Math.sin(angle) * r
        });
    }
    
    // Draw as gradient-filled shape with soft edges
    // Create gradient from center
    const grad = ctx.createRadialGradient(x, y, 0, x, y, baseRadius * 1.2);
    const midStop = 0.3 + sharpness * 0.35;
    
    grad.addColorStop(0, ColorUtils.withAlpha(color, 0.85));
    grad.addColorStop(midStop, ColorUtils.withAlpha(color, 0.4 * sharpness));
    grad.addColorStop(1, ColorUtils.withAlpha(color, 0));
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smooth shape
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        const cpX = (points[i].x + points[next].x) / 2;
        const cpY = (points[i].y + points[next].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, cpX, cpY);
    }
    
    ctx.closePath();
    ctx.fill();
}

/**
 * Accumulate form through scattered blobs
 * This is the core technique replacing lineTo() shapes
 */
function accumulateForm(bounds, colorFunc, densityFunc, sharpnessFunc, count) {
    for (let i = 0; i < count; i++) {
        const x = bounds.x + seededRandom(i * 2) * bounds.width;
        const y = bounds.y + seededRandom(i * 2 + 1) * bounds.height;
        
        const density = densityFunc(x, y);
        if (seededRandom(i * 3 + 1000) > density) continue;  // Probability-based placement
        
        const color = colorFunc(x, y);
        const sharpness = sharpnessFunc(x, y);
        const size = 5 + seededRandom(i * 4) * 15 * density;
        
        drawSoftBlob(x, y, size, color, sharpness);
    }
}

/**
 * Value bridging - create transition zone between two colors
 * "Never allow Color A to touch Color B directly"
 */
function createValueBridge(x, yStart, yEnd, width, colorA, colorB, seed = 0) {
    const bridgeHeight = yEnd - yStart;
    const steps = 30;
    
    for (let step = 0; step < steps; step++) {
        const t = step / steps;
        const y = yStart + t * bridgeHeight;
        
        // Blend color based on position
        const color = ColorUtils.blend(colorA, colorB, t);
        
        // Scatter increases in middle of transition (sine curve)
        const scatter = Math.sin(t * Math.PI) * bridgeHeight * 0.4;
        
        // Draw scattered blobs in this band
        const blobCount = 15 + Math.floor(scatter / 5);
        for (let b = 0; b < blobCount; b++) {
            const bx = x + (seededRandom(seed + step * 100 + b) - 0.5) * width;
            const by = y + (seededRandom(seed + step * 100 + b + 50) - 0.5) * scatter;
            const size = 4 + seededRandom(seed + step * 100 + b + 100) * 10;
            
            drawSoftBlob(bx, by, size, color, 0.5);
        }
    }
}

// =============================================================================
// SCENE CONSTANTS
// =============================================================================

const HORIZON = H * 0.52;
const LIGHT = { x: W * 0.7, y: H * 0.35 };
const HAZE_COLOR = '#b0b8c8';

const PALETTE = {
    skyDark: '#0a0a18',
    skyMid: '#1a2040',
    skyLight: '#4a4060',
    skyWarm: '#c07050',
    skyBright: '#f0c090',
    
    mtnFar: '#7a8898',
    mtnMid: '#5a6878',
    mtnClose: '#3a4858',
    mtnNear: '#3a4858',
    mtnDark: '#2a3848',
    
    snow: '#f0f4f8',
    snowBright: '#ffffff',
    snowMid: '#e0e8f0',
    snowShadow: '#a0b0c0',
    
    waterDeep: '#1a3050',
    waterMid: '#3a5878',
    waterLight: '#5a7898',
    waterReflect: '#6a88a8',
    
    treeFar: '#3a4838',
    treeMid: '#2a3828',
    forestDark: '#1a3020',
    forestMid: '#2a4830',
    
    ground: '#4a5438',
    grass: '#3a5028',
    grassDark: '#1a3010',
    grassLight: '#4a6838',
    
    sunCore: '#fffef0',
    sunGlow: '#ffc060'
};

// =============================================================================
// PART 2: SKY (This already works well - graduated bands)
// =============================================================================

function drawSky() {
    // Sky is accumulated gradient bands - this approach works
    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON + 30);
    skyGrad.addColorStop(0, PALETTE.skyDark);
    skyGrad.addColorStop(0.12, '#101828');
    skyGrad.addColorStop(0.25, PALETTE.skyMid);
    skyGrad.addColorStop(0.40, '#3a3855');
    skyGrad.addColorStop(0.55, PALETTE.skyLight);
    skyGrad.addColorStop(0.70, PALETTE.skyWarm);
    skyGrad.addColorStop(0.85, '#e0a070');
    skyGrad.addColorStop(1, PALETTE.skyBright);
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, HORIZON + 30);
}

function drawStars() {
    // Stars as soft glowing points - using distributions, not hard circles
    for (let i = 0; i < 150; i++) {
        const x = seededRandom(i * 3) * W;
        const y = seededRandom(i * 3 + 1) * H * 0.28;
        
        const visibility = 1 - (y / (H * 0.28));
        const size = 1 + seededRandom(i * 3 + 2) * 2.5;
        
        // Stars are light DISTRIBUTIONS, not shapes
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.5 + visibility * 0.4})`);
        grad.addColorStop(0.3, `rgba(255, 255, 255, ${0.2 * visibility})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSun() {
    const sx = LIGHT.x - W * 0.05;
    const sy = LIGHT.y + H * 0.05;
    
    ctx.save();
    
    // Sun glow - LIGHT IS A DISTRIBUTION
    // Multiple falloff layers using additive blending
    ctx.globalCompositeOperation = 'lighter';
    
    const glowLayers = [
        { radius: 200, alpha: 0.04 },
        { radius: 150, alpha: 0.06 },
        { radius: 100, alpha: 0.10 },
        { radius: 70, alpha: 0.15 },
        { radius: 50, alpha: 0.25 }
    ];
    
    for (const layer of glowLayers) {
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, layer.radius);
        grad.addColorStop(0, ColorUtils.withAlpha(PALETTE.sunGlow, layer.alpha));
        grad.addColorStop(0.5, ColorUtils.withAlpha('#ffa040', layer.alpha * 0.4));
        grad.addColorStop(1, 'rgba(255, 180, 100, 0)');  // Fades to zero!
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, layer.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Sun body - still uses gradient for form
    ctx.globalCompositeOperation = 'source-over';
    const sunGrad = ctx.createRadialGradient(sx - 15, sy - 15, 5, sx, sy, 50);
    sunGrad.addColorStop(0, PALETTE.sunCore);
    sunGrad.addColorStop(0.3, '#fff8d0');
    sunGrad.addColorStop(0.7, PALETTE.sunGlow);
    sunGrad.addColorStop(1, '#ff9030');
    
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawClouds() {
    // Clouds work well - they're accumulated puffs with soft edges
    for (let i = 0; i < 14; i++) {
        const cx = seededRandom(7000 + i * 17) * W;
        const cy = H * 0.05 + seededRandom(7001 + i * 17) * H * 0.2;
        
        const distToSun = Math.abs(cx - LIGHT.x) / W;
        const warmth = 1 - distToSun;
        
        // Each cloud is cluster of soft blobs
        const puffCount = 6 + Math.floor(seededRandom(7002 + i * 17) * 5);
        for (let p = 0; p < puffCount; p++) {
            const px = cx + (seededRandom(7100 + i * 20 + p) - 0.5) * 90;
            const py = cy + (seededRandom(7101 + i * 20 + p) - 0.5) * 20;
            const pr = 15 + seededRandom(7102 + i * 20 + p) * 30;
            
            const cloudColor = warmth > 0.5 ? 
                ColorUtils.blend('#ffffff', '#ffd8b0', warmth) : '#fff8f0';
            
            // Cloud puffs fade to transparent - soft edges
            drawSoftBlob(px, py, pr, cloudColor, 0.4);
        }
    }
}

// =============================================================================
// PART 3: FAR MOUNTAINS - ACCUMULATED FORM
// =============================================================================

function drawFarMountains() {
    // Far mountains have LOST EDGES - dissolve into sky
    accumulateMountainLayer({
        baseY: H * 0.42,
        height: 70,
        color: PALETTE.mtnFar,
        depth: 0.9,  // Very far = very soft
        seed: 1000
    });
    
    accumulateMountainLayer({
        baseY: H * 0.44,
        height: 100,
        color: ColorUtils.blend(PALETTE.mtnFar, PALETTE.mtnMid, 0.3),
        depth: 0.75,
        seed: 2000
    });
    
    accumulateMountainLayer({
        baseY: H * 0.47,
        height: 140,
        color: PALETTE.mtnMid,
        depth: 0.55,
        seed: 3000
    });
}

/**
 * Accumulate mountain form from soft blobs
 * NO lineTo() - form emerges from scattered elements
 */
function accumulateMountainLayer({ baseY, height, color, depth, seed }) {
    const sharpness = getEdgeSharpness(depth);
    
    // Apply atmospheric desaturation
    const atmColor = ColorUtils.desaturate(
        ColorUtils.blend(color, HAZE_COLOR, depth * 0.5),
        depth * 0.4
    );
    
    // Generate peak positions
    const peakCount = 6 + Math.floor(seededRandom(seed) * 4);
    const peaks = [];
    for (let i = 0; i < peakCount; i++) {
        const x = (i / peakCount) * W + (seededRandom(seed + i) - 0.5) * (W / peakCount);
        const h = height * (0.5 + seededRandom(seed + i + 100) * 0.5);
        peaks.push({ x, y: baseY - h, height: h });
    }
    
    // Accumulate form using scattered blobs
    // More blobs at peaks, fewer at base - creates mountain SHAPE through DENSITY
    const blobCount = 800 + Math.floor(depth * 400);
    
    for (let i = 0; i < blobCount; i++) {
        const x = seededRandom(seed + i * 2 + 5000) * W;
        
        // Find the interpolated mountain height at this x position
        let maxY = baseY;
        for (let p = 0; p < peaks.length - 1; p++) {
            if (x >= peaks[p].x && x <= peaks[p + 1].x) {
                const t = (x - peaks[p].x) / (peaks[p + 1].x - peaks[p].x);
                maxY = lerp(peaks[p].y, peaks[p + 1].y, t);
                break;
            }
        }
        if (x < peaks[0].x) maxY = peaks[0].y + (peaks[0].x - x) * 0.2;
        if (x > peaks[peaks.length - 1].x) maxY = peaks[peaks.length - 1].y + (x - peaks[peaks.length - 1].x) * 0.2;
        
        // Y position - weighted toward the ridge line
        const yRange = baseY - maxY;
        const yBias = Math.pow(seededRandom(seed + i * 2 + 5001), 0.6);  // Bias toward top
        const y = maxY + yBias * yRange;
        
        // Don't draw below base or above max
        if (y > baseY || y < maxY - 10) continue;
        
        // Size varies - smaller near ridge (detail), larger at base
        const ridgeProximity = (y - maxY) / yRange;
        const blobSize = 4 + ridgeProximity * 12 + seededRandom(seed + i * 3) * 8;
        
        // Slight color variation
        const colorVar = seededRandom(seed + i * 4);
        const blobColor = colorVar > 0.7 ? 
            ColorUtils.lighten(atmColor, 5) : 
            colorVar < 0.3 ? ColorUtils.darken(atmColor, 5) : atmColor;
        
        drawSoftBlob(x, y, blobSize, blobColor, sharpness);
    }
}

// =============================================================================
// PART 4: MAIN MOUNTAINS - VALUE BRIDGING SNOW ZONES
// =============================================================================

function drawMainMountains() {
    // Main peaks with proper value bridging for snow
    drawMainPeakWithSnow({
        peakX: W * 0.22,
        peakY: H * 0.24,
        baseY: H * 0.52,
        width: W * 0.36,
        color: PALETTE.mtnClose,
        depth: 0.25,
        seed: 5000
    });
    
    drawMainPeakWithSnow({
        peakX: W * 0.72,
        peakY: H * 0.22,
        baseY: H * 0.54,
        width: W * 0.44,
        color: PALETTE.mtnClose,
        depth: 0.2,
        seed: 6000
    });
    
    // Foreground ridge  
    drawMainPeakWithSnow({
        peakX: W * 0.35,
        peakY: H * 0.38,
        baseY: H * 0.56,
        width: W * 0.4,
        color: '#384530',
        depth: 0.1,
        seed: 7000
    });
}

/**
 * Mountain with VALUE BRIDGING snow zones
 * Snow doesn't have hard lines - it transitions through intermediate values
 */
function drawMainPeakWithSnow({ peakX, peakY, baseY, width, color, depth, seed }) {
    const sharpness = getEdgeSharpness(depth);
    
    // Define the mountain shape through height sampling
    function getMountainHeight(x) {
        // Distance from peak
        const distFromPeak = Math.abs(x - peakX);
        const halfWidth = width / 2;
        if (distFromPeak > halfWidth) return baseY;
        
        // Parabolic with noise
        const t = distFromPeak / halfWidth;
        const baseHeight = (1 - t * t) * (baseY - peakY);
        const noiseAmp = 15 + (1 - t) * 25;  // More noise near peak
        const noise = EdgeUtils.noise2D(x * 0.01, seed) * noiseAmp;
        
        return baseY - baseHeight + noise;
    }
    
    // Snow line with noise
    const snowLine = peakY + (baseY - peakY) * 0.35;
    const bridgeZone = 40;  // VALUE BRIDGING ZONE
    
    // Accumulate rock
    for (let i = 0; i < 1200; i++) {
        const x = peakX - width/2 + seededRandom(seed + i * 2) * width;
        const maxY = getMountainHeight(x);
        
        // Y position weighted toward the ridge
        const yRange = baseY - maxY;
        if (yRange <= 0) continue;
        
        const y = maxY + Math.pow(seededRandom(seed + i * 2 + 1), 0.5) * yRange;
        if (y > baseY) continue;
        
        // Determine if rock, snow, or BRIDGE VALUE
        const snowNoise = EdgeUtils.noise2D(x * 0.02, y * 0.02 + seed) * bridgeZone;
        const adjustedSnowLine = snowLine + snowNoise;
        
        let blobColor;
        if (y < adjustedSnowLine - bridgeZone * 0.5) {
            // Pure snow zone
            blobColor = PALETTE.snow;
        } else if (y > adjustedSnowLine + bridgeZone * 0.5) {
            // Pure rock zone  
            blobColor = color;
        } else {
            // BRIDGE ZONE - intermediate values
            const bridgeT = (y - (adjustedSnowLine - bridgeZone * 0.5)) / bridgeZone;
            const bridgeValue = seededRandom(seed + i * 3);
            
            if (bridgeValue < 0.3) {
                // Pure snow even in bridge
                blobColor = PALETTE.snow;
            } else if (bridgeValue > 0.7) {
                // Pure rock even in bridge
                blobColor = color;
            } else {
                // Actual intermediate color
                blobColor = ColorUtils.blend(PALETTE.snow, color, bridgeT);
            }
        }
        
        // Add lit/shadow variation based on facing
        const lightFacing = (x - peakX) / (width * 0.5);  // -1 to 1
        if (lightFacing < -0.2) {
            // Shadow side
            blobColor = ColorUtils.darken(blobColor, 15 * Math.abs(lightFacing));
        } else if (lightFacing > 0.2) {
            // Light side
            blobColor = ColorUtils.lighten(blobColor, 8 * lightFacing);
        }
        
        const blobSize = 3 + seededRandom(seed + i * 4) * 7;
        drawSoftBlob(x, y, blobSize, blobColor, sharpness + 0.2);
    }
    
    // Add subtle rock texture streaks (accumulated, not lines)
    addRockStreaks(peakX, peakY, baseY, width, color, seed + 8000, depth);
}

/**
 * Rock streaks/facets as accumulated marks
 */
function addRockStreaks(peakX, peakY, baseY, width, color, seed, depth) {
    const streakCount = 15 + Math.floor(seededRandom(seed) * 10);
    
    for (let s = 0; s < streakCount; s++) {
        const sx = peakX + (seededRandom(seed + s) - 0.5) * width * 0.8;
        const sy = peakY + (baseY - peakY) * (0.2 + seededRandom(seed + s + 100) * 0.6);
        
        // Each streak is a cluster of aligned marks
        const angle = -Math.PI * 0.4 + seededRandom(seed + s + 200) * Math.PI * 0.2;
        const length = 20 + seededRandom(seed + s + 300) * 40;
        
        for (let m = 0; m < 8; m++) {
            const t = m / 8;
            const mx = sx + Math.cos(angle) * length * t;
            const my = sy + Math.sin(angle) * length * t;
            
            const streakColor = seededRandom(seed + s * 10 + m) > 0.5 ?
                ColorUtils.darken(color, 10) : ColorUtils.lighten(color, 8);
            
            drawSoftBlob(mx, my, 3 + seededRandom(seed + s * 10 + m + 50) * 4, streakColor, 0.6);
        }
    }
}

// =============================================================================
// PART 5: LAKE - PROBABILITY-BASED REFLECTIONS
// =============================================================================

const LAKE_TOP = H * 0.52;
const LAKE_BOTTOM = H * 0.72;

function drawLake() {
    // Base water color with depth gradient
    const waterGrad = ctx.createLinearGradient(0, LAKE_TOP, 0, LAKE_BOTTOM);
    waterGrad.addColorStop(0, PALETTE.waterReflect);   // Reflects sky near top
    waterGrad.addColorStop(0.3, PALETTE.waterMid);
    waterGrad.addColorStop(0.7, PALETTE.waterDeep);
    waterGrad.addColorStop(1, ColorUtils.darken(PALETTE.waterDeep, 15));
    
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, LAKE_TOP, W, LAKE_BOTTOM - LAKE_TOP);
    
    // Lake edge is ORGANIC - accumulate irregular shore
    drawLakeEdge();
    
    // Reflections using probability distribution
    drawReflections();
    
    // Ripples as accumulated horizontal marks
    drawRipples();
}

function drawLakeEdge() {
    // Shoreline is NOT a line - it's a probability field of wet/dry
    const edgeY = LAKE_TOP;
    
    for (let i = 0; i < 400; i++) {
        const x = seededRandom(9000 + i) * W;
        
        // Edge varies with noise
        const edgeOffset = EdgeUtils.noise2D(x * 0.01, 9000) * 20;
        const y = edgeY + edgeOffset + (seededRandom(9001 + i) - 0.5) * 15;
        
        // Mix of water and ground colors at edge
        const isMud = seededRandom(9002 + i) > 0.5;
        const edgeColor = isMud ? 
            ColorUtils.blend(PALETTE.waterMid, '#4a4535', 0.7) :
            ColorUtils.blend(PALETTE.waterMid, PALETTE.waterReflect, 0.5);
        
        const size = 3 + seededRandom(9003 + i) * 8;
        drawSoftBlob(x, y, size, edgeColor, 0.5);
    }
}

function drawReflections() {
    // Mountain reflections - NOT mirror copy, distributed vertically stretched marks
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    // Sample points that would reflect mountains
    for (let i = 0; i < 600; i++) {
        const x = seededRandom(10000 + i * 2) * W;
        const waterY = LAKE_TOP + seededRandom(10001 + i * 2) * (LAKE_BOTTOM - LAKE_TOP) * 0.6;
        
        // What would be reflected here? (mirror y from horizon)
        const reflectedY = LAKE_TOP - (waterY - LAKE_TOP);
        
        // Is there mountain at this height?
        // Simplified check - just use probability based on height
        const mountainProb = 1 - (LAKE_TOP - reflectedY) / (H * 0.3);
        if (seededRandom(10002 + i) > mountainProb) continue;
        
        // Reflection is stretched vertically, broken by ripples
        const stretchFactor = 1.2 + seededRandom(10003 + i) * 0.8;
        
        // Color from mountain palette, darkened and desaturated
        const reflectColor = ColorUtils.desaturate(
            ColorUtils.darken(PALETTE.mtnMid, 20),
            0.3
        );
        
        // Draw as vertically elongated blob
        drawSoftBlobStretched(x, waterY, 4 + seededRandom(10004 + i) * 6, stretchFactor, reflectColor, 0.3);
    }
    
    // Sun reflection - scattered golden marks
    const sunReflectX = LIGHT.x - W * 0.05;
    for (let i = 0; i < 200; i++) {
        const rx = sunReflectX + (seededRandom(11000 + i) - 0.5) * 60;
        const ry = LAKE_TOP + 20 + seededRandom(11001 + i) * (LAKE_BOTTOM - LAKE_TOP - 40);
        
        // More concentrated near top
        const concentration = Math.pow(1 - (ry - LAKE_TOP) / (LAKE_BOTTOM - LAKE_TOP), 2);
        if (seededRandom(11002 + i) > concentration * 2) continue;
        
        const glintColor = ColorUtils.blend(PALETTE.sunGlow, '#ffffff', seededRandom(11003 + i) * 0.5);
        drawSoftBlobStretched(rx, ry, 2 + seededRandom(11004 + i) * 4, 2, glintColor, 0.6);
    }
    
    ctx.restore();
}

function drawSoftBlobStretched(x, y, size, stretch, color, alpha) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size * stretch);
    grad.addColorStop(0, ColorUtils.withAlpha(color, alpha));
    grad.addColorStop(0.5, ColorUtils.withAlpha(color, alpha * 0.5));
    grad.addColorStop(1, ColorUtils.withAlpha(color, 0));
    
    ctx.save();
    ctx.fillStyle = grad;
    ctx.scale(1, stretch);
    ctx.beginPath();
    ctx.arc(x, y / stretch, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawRipples() {
    // Ripples are horizontal marks with probability distribution
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    for (let i = 0; i < 150; i++) {
        const y = LAKE_TOP + 30 + seededRandom(12000 + i) * (LAKE_BOTTOM - LAKE_TOP - 50);
        const x = seededRandom(12001 + i) * W;
        const width = 20 + seededRandom(12002 + i) * 60;
        
        // Ripple as accumulated short horizontal strokes
        const rippleColor = seededRandom(12003 + i) > 0.5 ? 
            ColorUtils.lighten(PALETTE.waterMid, 15) :
            ColorUtils.darken(PALETTE.waterMid, 10);
        
        for (let s = 0; s < 5; s++) {
            const sx = x + seededRandom(12100 + i * 10 + s) * width;
            const sy = y + (seededRandom(12101 + i * 10 + s) - 0.5) * 3;
            const sw = 5 + seededRandom(12102 + i * 10 + s) * 15;
            
            ctx.fillStyle = ColorUtils.withAlpha(rippleColor, 0.3);
            ctx.beginPath();
            ctx.ellipse(sx, sy, sw, 1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// =============================================================================
// PART 6: FOREST - ORGANIC SILHOUETTES
// =============================================================================

function drawForest() {
    // Forest layers - accumulated tree forms with varying edge softness by depth
    
    // Far treeline - very soft, almost dissolving
    drawTreeLine({
        baseY: H * 0.51,
        maxHeight: 25,
        density: 0.6,
        depth: 0.6,
        color: PALETTE.treeFar,
        seed: 20000
    });
    
    // Mid treeline
    drawTreeLine({
        baseY: H * 0.53,
        maxHeight: 35,
        density: 0.8,
        depth: 0.4,
        color: ColorUtils.blend(PALETTE.treeFar, PALETTE.treeMid, 0.5),
        seed: 21000
    });
    
    // Near treeline - sharper but still organic
    drawTreeLine({
        baseY: H * 0.55,
        maxHeight: 50,
        density: 1.0,
        depth: 0.15,
        color: PALETTE.treeMid,
        seed: 22000
    });
}

/**
 * Tree line as accumulated mass of foliage
 * NOT individual tree shapes - form emerges from texture
 */
function drawTreeLine({ baseY, maxHeight, density, depth, color, seed }) {
    const sharpness = getEdgeSharpness(depth);
    
    // Atmospheric effect on color
    const treeColor = ColorUtils.desaturate(
        ColorUtils.blend(color, HAZE_COLOR, depth * 0.4),
        depth * 0.3
    );
    
    // Generate height variation along treeline
    function getTreelineHeight(x) {
        const noise1 = EdgeUtils.noise2D(x * 0.005, seed) * maxHeight * 0.6;
        const noise2 = EdgeUtils.noise2D(x * 0.02, seed + 100) * maxHeight * 0.3;
        const noise3 = EdgeUtils.noise2D(x * 0.08, seed + 200) * maxHeight * 0.1;
        return noise1 + noise2 + noise3;  // Multi-octave noise for organic rhythm
    }
    
    // Accumulate foliage blobs
    const blobCount = Math.floor(600 * density);
    
    for (let i = 0; i < blobCount; i++) {
        const x = seededRandom(seed + i * 2) * W;
        const treeHeight = getTreelineHeight(x);
        const topY = baseY - treeHeight;
        
        // Y weighted toward the top (more foliage at crown)
        const yRange = baseY - topY;
        if (yRange <= 0) continue;
        
        const y = topY + Math.pow(seededRandom(seed + i * 2 + 1), 0.7) * yRange;
        
        // Size - smaller near top, larger at base
        const heightRatio = (y - topY) / yRange;
        const blobSize = 4 + heightRatio * 8 + seededRandom(seed + i * 3) * 6;
        
        // Color variation - darker in mass, lighter at edges
        const colorVar = seededRandom(seed + i * 4);
        let blobColor = treeColor;
        if (colorVar < 0.2) {
            blobColor = ColorUtils.lighten(treeColor, 8);  // Catching light
        } else if (colorVar > 0.7) {
            blobColor = ColorUtils.darken(treeColor, 10);  // In shadow
        }
        
        // Top blobs are softer (silhouette against sky)
        const topSoftness = 1 - heightRatio * 0.3;
        drawSoftBlob(x, y, blobSize, blobColor, sharpness * topSoftness);
    }
    
    // Add some individual tree spires poking up (rhythm variation)
    addTreeSpires(baseY, maxHeight, treeColor, sharpness, seed + 5000);
}

function addTreeSpires(baseY, maxHeight, color, sharpness, seed) {
    const spireCount = 8 + Math.floor(seededRandom(seed) * 6);
    
    for (let s = 0; s < spireCount; s++) {
        const x = seededRandom(seed + s) * W;
        const height = maxHeight * (0.8 + seededRandom(seed + s + 100) * 0.5);
        const topY = baseY - height;
        
        // Spire as tapered column of blobs
        for (let b = 0; b < 12; b++) {
            const t = b / 12;
            const y = topY + t * height * 0.8;
            const spread = 2 + t * 4;  // Wider at base
            const bx = x + (seededRandom(seed + s * 20 + b) - 0.5) * spread;
            
            const spireColor = seededRandom(seed + s * 20 + b + 50) > 0.5 ?
                ColorUtils.darken(color, 5) : color;
            
            drawSoftBlob(bx, y, 2 + t * 3, spireColor, sharpness);
        }
    }
}

// =============================================================================
// PART 7: FOREGROUND - SCATTERED NATURAL ELEMENTS
// =============================================================================

function drawForeground() {
    const fgTop = H * 0.72;
    
    // Ground gradient
    const groundGrad = ctx.createLinearGradient(0, fgTop, 0, H);
    groundGrad.addColorStop(0, PALETTE.ground);
    groundGrad.addColorStop(0.3, ColorUtils.darken(PALETTE.ground, 8));
    groundGrad.addColorStop(1, ColorUtils.darken(PALETTE.ground, 15));
    
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, fgTop, W, H - fgTop);
    
    // Ground texture - accumulated organic marks
    drawGroundTexture(fgTop);
    
    // Grass tufts using probability distribution
    drawGrass(fgTop);
    
    // Scattered wildflowers
    drawWildflowers(fgTop);
    
    // Path/clearing (organic edge)
    drawPath(fgTop);
}

function drawGroundTexture(fgTop) {
    // Ground is accumulated dots and marks, not flat fill
    for (let i = 0; i < 800; i++) {
        const x = seededRandom(30000 + i * 2) * W;
        const y = fgTop + seededRandom(30001 + i * 2) * (H - fgTop);
        
        // Further away (closer to horizon) = smaller, more faded
        const depth = (y - fgTop) / (H - fgTop);
        const inverseDepth = 1 - depth;  // 1 at horizon, 0 at bottom
        
        const size = 2 + depth * 6 + seededRandom(30002 + i) * 4;
        
        const textureVar = seededRandom(30003 + i);
        let dotColor = PALETTE.ground;
        if (textureVar < 0.3) {
            dotColor = ColorUtils.darken(PALETTE.ground, 10);
        } else if (textureVar > 0.7) {
            dotColor = ColorUtils.lighten(PALETTE.ground, 8);
        }
        
        // Apply depth fade
        dotColor = ColorUtils.blend(dotColor, HAZE_COLOR, inverseDepth * 0.3);
        
        drawSoftBlob(x, y, size, dotColor, 0.3 + depth * 0.3);
    }
}

function drawGrass(fgTop) {
    // Grass as clustered blade marks - density decreases with distance
    for (let i = 0; i < 500; i++) {
        const x = seededRandom(31000 + i * 3) * W;
        const y = fgTop + 10 + seededRandom(31001 + i * 3) * (H - fgTop - 20);
        
        // Grass less likely near horizon
        const depth = 1 - (y - fgTop) / (H - fgTop);
        if (seededRandom(31002 + i * 3) > (1 - depth * 0.7)) continue;
        
        // Blade cluster
        const bladeCount = 3 + Math.floor(seededRandom(31003 + i * 3) * 5);
        for (let b = 0; b < bladeCount; b++) {
            const bx = x + (seededRandom(31100 + i * 10 + b) - 0.5) * 8;
            const bladeHeight = (3 + seededRandom(31101 + i * 10 + b) * 8) * (1 - depth * 0.5);
            const angle = -Math.PI/2 + (seededRandom(31102 + i * 10 + b) - 0.5) * 0.4;
            
            // Blade as 3 small blobs stacked
            for (let s = 0; s < 3; s++) {
                const t = s / 3;
                const px = bx + Math.cos(angle) * bladeHeight * t;
                const py = y - bladeHeight * t;
                
                const grassColor = seededRandom(31103 + i * 10 + b + s) > 0.5 ?
                    PALETTE.grass : ColorUtils.darken(PALETTE.grass, 15);
                
                drawSoftBlob(px, py, 1.5 - t * 0.5, grassColor, 0.6);
            }
        }
    }
}

function drawWildflowers(fgTop) {
    // Flowers scattered with probability - more near viewer
    for (let i = 0; i < 150; i++) {
        const x = seededRandom(32000 + i * 2) * W;
        const y = fgTop + 20 + seededRandom(32001 + i * 2) * (H - fgTop - 30);
        
        // Less flowers far away
        const depth = 1 - (y - fgTop) / (H - fgTop);
        if (seededRandom(32002 + i) > (1 - depth)) continue;
        
        const flowerType = seededRandom(32003 + i);
        const size = (2 + seededRandom(32004 + i) * 3) * (1 - depth * 0.5);
        
        let flowerColor;
        if (flowerType < 0.3) {
            flowerColor = '#e8e040';  // Yellow
        } else if (flowerType < 0.6) {
            flowerColor = '#e06080';  // Pink
        } else if (flowerType < 0.8) {
            flowerColor = '#8060e0';  // Purple
        } else {
            flowerColor = '#ffffff';  // White
        }
        
        // Flower as small cluster of soft dots
        drawSoftBlob(x, y, size, flowerColor, 0.7);
        
        // Tiny accent dots around
        for (let d = 0; d < 3; d++) {
            const dx = x + (seededRandom(32100 + i * 5 + d) - 0.5) * size * 2;
            const dy = y + (seededRandom(32101 + i * 5 + d) - 0.5) * size * 2;
            drawSoftBlob(dx, dy, size * 0.4, flowerColor, 0.4);
        }
    }
}

function drawPath(fgTop) {
    // Path with organic edges - accumulated dirt/worn grass
    const pathCenterX = W * 0.6;
    const pathWidth = 60;
    
    for (let i = 0; i < 300; i++) {
        // Y from horizon to bottom
        const y = fgTop + 5 + seededRandom(33000 + i * 2) * (H - fgTop - 10);
        
        // Path gets wider as it comes toward viewer (perspective)
        const depthScale = (y - fgTop) / (H - fgTop);
        const localWidth = pathWidth * (0.3 + depthScale * 0.7);
        
        // X centered on path with noise
        const xOffset = (seededRandom(33001 + i * 2) - 0.5) * localWidth;
        const edgeNoise = EdgeUtils.noise2D(y * 0.02, 33000) * localWidth * 0.3;
        const x = pathCenterX + xOffset + edgeNoise;
        
        // Path color - worn earth
        const pathVar = seededRandom(33002 + i);
        let pathColor = '#8a7a60';
        if (pathVar < 0.3) {
            pathColor = ColorUtils.darken('#8a7a60', 10);
        } else if (pathVar > 0.7) {
            pathColor = ColorUtils.lighten('#8a7a60', 8);
        }
        
        const size = 4 + seededRandom(33003 + i) * 8;
        drawSoftBlob(x, y, size, pathColor, 0.4 + depthScale * 0.2);
    }
}

// =============================================================================
// PART 8: RENDER ORCHESTRATION
// =============================================================================

function render() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    
    // Back to front layering
    drawSky();
    drawStars();
    drawSun();
    drawClouds();
    
    drawFarMountains();
    drawMainMountains();
    
    drawForest();
    drawLake();
    
    drawForeground();
    
    // Final atmospheric overlay
    addAtmosphericHaze();
    
    // Vignette
    addVignette();
}

function addAtmosphericHaze() {
    // Subtle haze overlay using radial gradient from light source
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.08;
    
    const hazeGrad = ctx.createRadialGradient(
        LIGHT.x, LIGHT.y, 0,
        LIGHT.x, LIGHT.y, W * 0.7
    );
    hazeGrad.addColorStop(0, '#ffc080');
    hazeGrad.addColorStop(0.3, '#ffb060');
    hazeGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

function addVignette() {
    ctx.save();
    
    const vignette = ctx.createRadialGradient(
        W * 0.5, H * 0.5, W * 0.2,
        W * 0.5, H * 0.5, W * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

// =============================================================================
// INITIALIZE
// =============================================================================

render();

console.log('Landscape V6 - Edge Mastery Applied');
console.log('Paradigm: Forms accumulated through scattered soft blobs, not drawn shapes');
console.log('Key techniques: Value bridging, probability distribution, depth-based edge softness');
