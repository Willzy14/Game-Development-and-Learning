/**
 * LANDSCAPE V7 - Material Logic Implementation
 * =============================================
 * 
 * KEY PRINCIPLES:
 * 1. Form → Material → Atmosphere (never skip to atmosphere)
 * 2. Big Form Pass FIRST (structure before texture)
 * 3. Material-specific behavior (rock ≠ snow ≠ trees ≠ clouds)
 * 4. Coherent noise (Perlin/Value/FBM, not Math.random())
 * 5. Validation checkpoints at each phase
 * 
 * WHAT'S DIFFERENT FROM V6:
 * - Structure-first approach (solid masses before texture)
 * - Each material has distinct edge/noise/contrast behavior
 * - FBM noise for natural variation (not sparkly random)
 * - Automated realism validation
 */

// =============================================================================
// SECTION 1: COMPLETE NOISE LIBRARY
// =============================================================================

/**
 * Perlin Noise - Gradient-based, high quality
 * Best for: mountains, terrain, hero elements
 */
class PerlinNoise {
    constructor(seed = 1337) {
        this.seed = seed;
        this.p = this._buildPermutationTable();
    }
    
    _buildPermutationTable() {
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = i;
        
        // Seeded shuffle
        let rand = this.seed;
        for (let i = 255; i > 0; i--) {
            rand = (rand * 1103515245 + 12345) & 0x7fffffff;
            const j = rand % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        return [...p, ...p];
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.p[X] + Y;
        const b = this.p[X + 1] + Y;
        
        return this.lerp(
            this.lerp(this.grad(this.p[a], x, y), 
                      this.grad(this.p[b], x - 1, y), u),
            this.lerp(this.grad(this.p[a + 1], x, y - 1), 
                      this.grad(this.p[b + 1], x - 1, y - 1), u),
            v
        );
    }
}

/**
 * Value Noise - Hash-based, faster
 * Best for: clouds, textures, secondary elements
 */
function hash2(x, y, seed = 1337) {
    let n = x * 374761393 + y * 668265263 + seed * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    n = n ^ (n >> 16);
    return (n >>> 0) / 4294967295;
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
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
    
    const u = smoothstep(xf);
    const v = smoothstep(yf);
    
    return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * FBM - Fractional Brownian Motion (Multi-octave noise)
 * Creates natural-looking variation with detail at multiple scales
 */
function fbm2D(x, y, options = {}) {
    const {
        octaves = 4,
        amplitude = 0.5,
        scale = 0.01,
        seed = 1337,
        noiseFunc = valueNoise2D
    } = options;
    
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        sum += amp * noiseFunc(x * scale * freq, y * scale * freq, seed + i * 1013);
        maxValue += amp;
        amp *= amplitude;
        freq *= 2;
    }
    
    return sum / maxValue;
}

// Global Perlin instance
const perlin = new PerlinNoise(42);

/**
 * Unified Noise Interface
 */
const NoiseEngine = {
    get(x, y, type = 'value', options = {}) {
        const scale = options.scale || 0.01;
        const seed = options.seed || 1337;
        
        switch (type) {
            case 'perlin':
                return (perlin.noise2D(x * scale, y * scale) + 1) / 2;
            case 'value':
                return valueNoise2D(x * scale, y * scale, seed);
            case 'fbm':
            case 'fbm-value':
                return fbm2D(x, y, { ...options, noiseFunc: valueNoise2D });
            case 'fbm-perlin':
                return fbm2D(x, y, { 
                    ...options, 
                    noiseFunc: (x, y) => (perlin.noise2D(x, y) + 1) / 2 
                });
            default:
                return valueNoise2D(x * scale, y * scale, seed);
        }
    },
    
    range(x, y, min, max, type = 'value', options = {}) {
        return min + this.get(x, y, type, options) * (max - min);
    },
    
    bipolar(x, y, type = 'value', options = {}) {
        return this.get(x, y, type, options) * 2 - 1;
    }
};

// =============================================================================
// SECTION 2: MATERIAL PROFILE SYSTEM
// =============================================================================

const MATERIALS = {
    rock: {
        name: "rock",
        base: { h: 210, s: 12, l: 38 },
        contrast: 0.55,
        edge: { hardness: 0.70, feather: 6 },    // 70% hard edges
        noise: { type: 'fbm-perlin', scale: 0.012, octaves: 4, amplitude: 0.55 },
        detail: { density: 0.35, size: [2, 12], alpha: 0.18 },
        depthFade: 0.55
    },
    
    foliage: {
        name: "foliage",
        base: { h: 115, s: 30, l: 28 },
        contrast: 0.35,
        edge: { hardness: 0.40, feather: 10 },   // 40% hard edges
        noise: { type: 'fbm-value', scale: 0.02, octaves: 3, amplitude: 0.45 },
        detail: { density: 0.6, size: [1, 6], alpha: 0.22 },
        depthFade: 0.65
    },
    
    snow: {
        name: "snow",
        base: { h: 210, s: 8, l: 92 },
        contrast: 0.20,
        edge: { hardness: 0.20, feather: 14 },   // 20% hard edges
        noise: { type: 'fbm-value', scale: 0.03, octaves: 2, amplitude: 0.35 },
        detail: { density: 0.25, size: [2, 10], alpha: 0.12 },
        depthFade: 0.75
    },
    
    cloud: {
        name: "cloud",
        base: { h: 35, s: 20, l: 95 },
        contrast: 0.15,
        edge: { hardness: 0.0, feather: 25 },    // 0% hard edges - all soft
        noise: { type: 'fbm-value', scale: 0.008, octaves: 3, amplitude: 0.4 },
        detail: { density: 0.2, size: [15, 60], alpha: 0.06 },
        depthFade: 0.9
    },
    
    water: {
        name: "water",
        base: { h: 210, s: 40, l: 28 },
        contrast: 0.25,
        edge: { hardness: 0.60, feather: 4 },    // Water surface has defined edge
        noise: { type: 'fbm-value', scale: 0.015, octaves: 3, amplitude: 0.25 },
        detail: { density: 0.15, size: [10, 80], alpha: 0.06 },
        depthFade: 0.8
    },
    
    ground: {
        name: "ground",
        base: { h: 85, s: 25, l: 22 },
        contrast: 0.30,
        edge: { hardness: 0.35, feather: 10 },
        noise: { type: 'fbm-value', scale: 0.02, octaves: 3, amplitude: 0.4 },
        detail: { density: 0.55, size: [1, 8], alpha: 0.18 },
        depthFade: 0.7
    }
};

// =============================================================================
// SECTION 3: COLOR UTILITIES
// =============================================================================

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

function hslString(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function lerpColor(c1, c2, t) {
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t),
        g: Math.round(c1.g + (c2.g - c1.g) * t),
        b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
}

// =============================================================================
// SECTION 4: VALIDATION PIPELINE
// =============================================================================

const Validator = {
    log: [],
    
    reset() {
        this.log = [];
    },
    
    addLog(phase, message, pass) {
        this.log.push({ phase, message, pass });
    },
    
    /**
     * Value Histogram Check
     * Natural scenes have 3-5 dominant value groups
     */
    valueHistogramCheck(ctx, width, height) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const bins = new Array(10).fill(0);
        
        for (let i = 0; i < data.length; i += 4) {
            const luminance = 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
            const binIndex = Math.min(9, Math.floor(luminance / 25.5));
            bins[binIndex]++;
        }
        
        const totalPixels = width * height;
        const significantBins = bins.filter(count => count / totalPixels > 0.07).length;
        
        const pass = significantBins >= 2 && significantBins <= 6;
        const reason = pass ? 
            `${significantBins} value groups (natural)` :
            significantBins > 6 ? 'Too many groups (mushy)' : 'Too few groups (flat)';
            
        this.addLog('Value Distribution', reason, pass);
        return { pass, significantBins, bins };
    },
    
    /**
     * Edge Uniformity Check
     * Need variety in edge sharpness (not all same)
     */
    edgeUniformityCheck(ctx, width, height) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const edgeSharpness = [];
        
        // Sample 200 random edges
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            
            const getVal = (px, py) => {
                const idx = (py * width + px) * 4;
                return 0.2126 * data[idx] + 0.7152 * data[idx+1] + 0.0722 * data[idx+2];
            };
            
            const center = getVal(x, y);
            const dx = Math.abs(getVal(x+1, y) - getVal(x-1, y));
            const dy = Math.abs(getVal(x, y+1) - getVal(x, y-1));
            const gradient = Math.sqrt(dx * dx + dy * dy);
            
            if (gradient > 15) {
                edgeSharpness.push(gradient);
            }
        }
        
        if (edgeSharpness.length < 10) {
            this.addLog('Edge Uniformity', 'Insufficient edges detected', false);
            return { pass: false, reason: 'Too few edges' };
        }
        
        const mean = edgeSharpness.reduce((a, b) => a + b) / edgeSharpness.length;
        const variance = edgeSharpness.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / edgeSharpness.length;
        const coeffVar = Math.sqrt(variance) / mean;
        
        const pass = coeffVar > 0.35;
        const reason = pass ?
            `CV=${coeffVar.toFixed(2)} (varied edges)` :
            `CV=${coeffVar.toFixed(2)} (too uniform)`;
            
        this.addLog('Edge Uniformity', reason, pass);
        return { pass, coeffVar };
    },
    
    /**
     * Structure Check (for Big Form Pass)
     */
    structureCheck(ctx, width, height) {
        const samples = [];
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            samples.push(0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2]);
        }
        
        const range = Math.max(...samples) - Math.min(...samples);
        const pass = range > 40;
        
        this.addLog('Structure', pass ? `Range=${Math.round(range)} (good contrast)` : `Range=${Math.round(range)} (flat)`, pass);
        return { pass, range };
    },
    
    getScore() {
        const passed = this.log.filter(l => l.pass).length;
        return Math.round((passed / this.log.length) * 100);
    },
    
    getReport() {
        let report = '═══════════════════════════════════════\n';
        report += '        REALISM VALIDATION REPORT\n';
        report += '═══════════════════════════════════════\n\n';
        
        this.log.forEach(entry => {
            const icon = entry.pass ? '✅' : '❌';
            report += `${icon} ${entry.phase}: ${entry.message}\n`;
        });
        
        report += '\n───────────────────────────────────────\n';
        report += `SCORE: ${this.getScore()}%\n`;
        report += '═══════════════════════════════════════';
        
        return report;
    }
};

// =============================================================================
// SECTION 5: BIG FORM PASS (Structure First!)
// =============================================================================

function bigFormPass(ctx, W, H) {
    console.log('📐 PHASE 1: Big Form Pass');
    
    // Rule: 3-6 large shapes, NO noise, NO texture, just readable masses
    
    // 1) SKY - Simple gradient, no texture
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyGrad.addColorStop(0, 'hsl(220, 50%, 12%)');      // Deep night blue
    skyGrad.addColorStop(0.5, 'hsl(250, 40%, 25%)');    // Purple transition
    skyGrad.addColorStop(0.8, 'hsl(25, 60%, 50%)');     // Warm horizon
    skyGrad.addColorStop(1, 'hsl(35, 70%, 65%)');       // Bright low sky
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);
    
    // 2) DISTANT MOUNTAIN (far, atmospheric) - Single flat color
    ctx.fillStyle = 'hsl(220, 20%, 45%)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.52);
    ctx.lineTo(W * 0.15, H * 0.48);
    ctx.lineTo(W * 0.35, H * 0.38);   // Peak 1
    ctx.lineTo(W * 0.50, H * 0.45);
    ctx.lineTo(W * 0.65, H * 0.35);   // Peak 2
    ctx.lineTo(W * 0.80, H * 0.42);
    ctx.lineTo(W * 0.95, H * 0.48);
    ctx.lineTo(W, H * 0.50);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // 3) MID MOUNTAIN (main subject) - Darker, more contrast
    ctx.fillStyle = 'hsl(215, 18%, 32%)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.65);
    ctx.lineTo(W * 0.10, H * 0.58);
    ctx.lineTo(W * 0.25, H * 0.42);   // Ridge
    ctx.lineTo(W * 0.40, H * 0.55);
    ctx.lineTo(W * 0.55, H * 0.40);   // Main peak
    ctx.lineTo(W * 0.70, H * 0.52);
    ctx.lineTo(W * 0.85, H * 0.58);
    ctx.lineTo(W, H * 0.62);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // 4) WATER BAND - Flat reflective surface
    ctx.fillStyle = 'hsl(210, 40%, 22%)';
    ctx.fillRect(0, H * 0.68, W, H * 0.12);
    
    // 5) FOREGROUND GROUND - Dark anchor
    ctx.fillStyle = 'hsl(90, 20%, 18%)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    ctx.lineTo(W * 0.3, H * 0.80);
    ctx.lineTo(W * 0.6, H * 0.78);
    ctx.lineTo(W, H * 0.80);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // OUTPUT: Flat but readable structure with clear depth layers
}

// =============================================================================
// SECTION 6: MATERIAL PASS
// =============================================================================

/**
 * Apply material-specific shading to mountains
 */
function materialPass_Mountains(ctx, W, H) {
    console.log('🏔️ Applying rock material to mountains...');
    
    const mat = MATERIALS.rock;
    
    // FAR MOUNTAIN - Atmospheric, reduced detail
    applyMountainMaterial(ctx, W, H, {
        startY: H * 0.35,
        endY: H * 0.52,
        baseHue: 220,
        baseSat: 15,
        baseLight: 45,
        depth: 0.7,         // Far = more atmospheric
        noiseScale: 0.008,  // Lower frequency for distance
        octaves: 2,
        contrast: 0.25
    });
    
    // MID MOUNTAIN - More detail, more contrast
    applyMountainMaterial(ctx, W, H, {
        startY: H * 0.38,
        endY: H * 0.68,
        baseHue: 215,
        baseSat: 18,
        baseLight: 32,
        depth: 0.3,         // Closer
        noiseScale: 0.012,
        octaves: 4,
        contrast: 0.45
    });
}

function applyMountainMaterial(ctx, W, H, config) {
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;
    
    for (let y = Math.floor(config.startY); y < Math.floor(config.endY); y++) {
        for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4;
            
            // Only modify mountain pixels (check if it's in mountain color range)
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            
            // Skip sky (bright) and water/ground (too dark)
            if (lum > 150 || lum < 30) continue;
            
            // CRITICAL: Check if pixel is actually mountain (blue-gray hue)
            // Sky is warm (orange/yellow), mountains are cool (blue-gray)
            // If blue channel is less than red by a lot, it's sky not mountain
            if (r > b + 30) continue;  // Skip warm pixels (sky gradient)
            
            // Additional check: mountains should be relatively desaturated
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;
            if (saturation > 0.5) continue;  // Skip highly saturated pixels
            
            // Get FBM noise for this position
            const noise = fbm2D(x, y, {
                scale: config.noiseScale,
                octaves: config.octaves,
                amplitude: 0.5,
                seed: 42
            });
            
            // Calculate light facing (simple top-left light)
            const lightNoise = fbm2D(x + 100, y + 100, {
                scale: config.noiseScale * 2,
                octaves: 2,
                seed: 123
            });
            
            // Apply variation - REDUCED intensity to preserve form
            const variation = (noise - 0.5) * config.contrast * (1 - config.depth * 0.6) * 0.6;
            const lightVar = (lightNoise - 0.5) * 0.08;
            
            // BLEND with original instead of replacing
            const origL = lum / 2.55;  // Convert 0-255 to 0-100
            let newL = origL + variation * 30 + lightVar * 15;
            newL = clamp(newL, 8, 70);
            
            // Add atmospheric desaturation with depth
            const newS = config.baseSat * (1 - config.depth * 0.4);
            
            const newColor = hslToRgb(config.baseHue, newS, newL);
            
            // Blend new color with original (preserve some of original)
            const blend = 0.7;  // 70% new, 30% original
            data[idx] = Math.round(newColor.r * blend + r * (1 - blend));
            data[idx + 1] = Math.round(newColor.g * blend + g * (1 - blend));
            data[idx + 2] = Math.round(newColor.b * blend + b * (1 - blend));
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
}

/**
 * Add snow patches to mountains (material-specific soft edges)
 */
function materialPass_Snow(ctx, W, H) {
    console.log('❄️ Adding snow with material-specific behavior...');
    
    const mat = MATERIALS.snow;
    
    // Snow accumulates on top-facing surfaces
    // Far mountain peaks
    addSnowPatch(ctx, W * 0.35, H * 0.38, 80, 40, 0.7);
    addSnowPatch(ctx, W * 0.65, H * 0.35, 100, 50, 0.7);
    
    // Mid mountain peaks
    addSnowPatch(ctx, W * 0.25, H * 0.42, 60, 35, 0.4);
    addSnowPatch(ctx, W * 0.55, H * 0.40, 90, 45, 0.4);
    addSnowPatch(ctx, W * 0.70, H * 0.50, 50, 25, 0.4);
}

function addSnowPatch(ctx, cx, cy, width, height, depth) {
    const mat = MATERIALS.snow;
    
    // Snow has SOFT edges (20% hard, 80% soft)
    // Use multiple layered shapes with varying opacity
    
    const baseColor = hslToRgb(mat.base.h, mat.base.s, mat.base.l);
    
    // Build up snow with layered soft blobs (coherent noise positions)
    for (let layer = 0; layer < 5; layer++) {
        const layerAlpha = 0.15 + layer * 0.08;
        const layerScale = 1.2 - layer * 0.15;
        
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${layerAlpha * (1 - depth * 0.3)})`;
        
        ctx.beginPath();
        
        // Create irregular snow shape using noise
        const points = 24;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI;  // Top half only (snow on top)
            const noiseVal = NoiseEngine.get(cx + i * 10, cy + layer * 50, 'value', { scale: 0.05 });
            const r = (width * layerScale * 0.5) * (0.7 + noiseVal * 0.6);
            
            const px = cx + Math.cos(angle - Math.PI) * r;
            const py = cy + Math.sin(angle - Math.PI) * (height * layerScale * 0.5) * (0.6 + noiseVal * 0.4);
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    // Add subtle sparkle texture (very faint, snow material property)
    const sparkleCount = Math.floor(mat.detail.density * 30);
    for (let i = 0; i < sparkleCount; i++) {
        const sx = cx + NoiseEngine.bipolar(i, 0, 'value') * width * 0.4;
        const sy = cy - Math.abs(NoiseEngine.bipolar(i, 100, 'value')) * height * 0.4;
        const size = mat.detail.size[0] + NoiseEngine.get(i, 200, 'value') * mat.detail.size[1];
        
        ctx.fillStyle = `rgba(255, 255, 255, ${mat.detail.alpha * (1 - depth * 0.5)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Add tree clusters (foliage material behavior)
 */
function materialPass_Trees(ctx, W, H) {
    console.log('🌲 Adding tree clusters with foliage material...');
    
    // Trees on shoreline and foreground
    // Distant trees (smaller, softer, more blue)
    addTreeCluster(ctx, W * 0.15, H * 0.66, 60, 40, 0.6);
    addTreeCluster(ctx, W * 0.85, H * 0.64, 50, 35, 0.6);
    
    // Mid-ground trees
    addTreeCluster(ctx, W * 0.05, H * 0.72, 80, 55, 0.4);
    addTreeCluster(ctx, W * 0.92, H * 0.70, 70, 50, 0.4);
    
    // Foreground trees (larger, sharper, more saturated)
    addTreeCluster(ctx, W * 0.08, H * 0.82, 100, 80, 0.15);
    addTreeCluster(ctx, W * 0.88, H * 0.84, 90, 70, 0.15);
    addTreeCluster(ctx, W * 0.95, H * 0.88, 60, 50, 0.1);
}

function addTreeCluster(ctx, cx, cy, width, height, depth) {
    const mat = MATERIALS.foliage;
    
    // Trees have clustered structure (not uniform scatter)
    // 40% hard edges (branch structure), 60% soft (foliage mass)
    
    // Determine color based on depth (atmospheric perspective)
    const depthDesaturate = depth * 0.4;
    const depthLighten = depth * 15;
    const h = mat.base.h + depth * 20;  // Shift toward blue with distance
    const s = mat.base.s * (1 - depthDesaturate);
    const l = mat.base.l + depthLighten;
    
    // Generate cluster centers using coherent noise
    const numBlobs = 5 + Math.floor(NoiseEngine.get(cx, cy, 'value') * 5);
    
    for (let b = 0; b < numBlobs; b++) {
        const blobAngle = (b / numBlobs) * Math.PI * 2;
        const blobDist = NoiseEngine.range(b * 50, cy, width * 0.15, width * 0.4, 'value');
        const blobX = cx + Math.cos(blobAngle) * blobDist;
        const blobY = cy + Math.sin(blobAngle) * blobDist * 0.5 - height * 0.3;
        const blobR = NoiseEngine.range(b * 100, cy, height * 0.15, height * 0.35, 'value');
        
        // Draw blob core (firmer center)
        const coreGrad = ctx.createRadialGradient(blobX, blobY, 0, blobX, blobY, blobR);
        const coreColor = hslToRgb(h, s, l - 8);
        const edgeColor = hslToRgb(h, s, l + 5);
        
        coreGrad.addColorStop(0, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, 0.85)`);
        coreGrad.addColorStop(0.5, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, 0.6)`);
        coreGrad.addColorStop(0.8, `rgba(${edgeColor.r}, ${edgeColor.g}, ${edgeColor.b}, 0.3)`);
        coreGrad.addColorStop(1, `rgba(${edgeColor.r}, ${edgeColor.g}, ${edgeColor.b}, 0)`);
        
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(blobX, blobY, blobR, 0, Math.PI * 2);
        ctx.fill();
        
        // Add texture only for near trees (detail diminishes with distance)
        if (depth < 0.4) {
            const detailCount = Math.floor(mat.detail.density * 25 * (1 - depth));
            for (let d = 0; d < detailCount; d++) {
                const angle = NoiseEngine.get(d * 20, b * 30, 'value') * Math.PI * 2;
                const dist = blobR * (0.3 + NoiseEngine.get(d * 30, b * 40, 'value') * 0.8);
                const dx = blobX + Math.cos(angle) * dist;
                const dy = blobY + Math.sin(angle) * dist;
                const size = mat.detail.size[0] + NoiseEngine.get(d, b, 'value') * mat.detail.size[1];
                
                const detailL = l + NoiseEngine.bipolar(d, b, 'value') * 10;
                ctx.fillStyle = `hsla(${h}, ${s}%, ${detailL}%, ${mat.detail.alpha})`;
                ctx.beginPath();
                ctx.arc(dx, dy, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Add some hard edges (branch hints) for near trees - material property 40% hard
    if (depth < 0.3) {
        const branchCount = 3 + Math.floor(NoiseEngine.get(cx, cy * 2, 'value') * 4);
        ctx.strokeStyle = `hsla(${h - 10}, ${s * 0.5}%, ${l - 15}%, 0.4)`;
        ctx.lineWidth = 1.5;
        
        for (let br = 0; br < branchCount; br++) {
            const startX = cx + NoiseEngine.bipolar(br, 0, 'value') * width * 0.3;
            const startY = cy;
            const endX = startX + NoiseEngine.bipolar(br, 100, 'value') * width * 0.25;
            const endY = cy - height * (0.4 + NoiseEngine.get(br, 200, 'value') * 0.4);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
}

/**
 * Add clouds (all soft edges - cloud material)
 */
function materialPass_Clouds(ctx, W, H) {
    console.log('☁️ Adding clouds with volume scatter behavior...');
    
    // Clouds positioned HIGH in sky only (top 20%) - don't cover mountains
    // Mountains start around H * 0.35, so keep clouds above H * 0.25
    addCloud(ctx, W * 0.15, H * 0.08, 120, 35);
    addCloud(ctx, W * 0.5, H * 0.05, 150, 40);
    addCloud(ctx, W * 0.8, H * 0.10, 100, 30);
    
    // Smaller wispy accent clouds
    addCloud(ctx, W * 0.3, H * 0.15, 60, 20);
    addCloud(ctx, W * 0.7, H * 0.03, 80, 25);
}

function addCloud(ctx, cx, cy, width, height) {
    const mat = MATERIALS.cloud;
    
    // Clouds are VOLUMES, not surfaces - all lost edges
    // Multiple layered soft shapes create volume appearance
    
    const numPuffs = 8 + Math.floor(NoiseEngine.get(cx, cy, 'value') * 6);
    
    for (let p = 0; p < numPuffs; p++) {
        const puffAngle = NoiseEngine.get(p * 50, cy, 'value') * Math.PI * 2;
        const puffDist = NoiseEngine.range(p * 30, cx, 0, width * 0.4, 'value');
        const puffX = cx + Math.cos(puffAngle) * puffDist;
        const puffY = cy + Math.sin(puffAngle) * puffDist * 0.4;
        const puffR = NoiseEngine.range(p * 100, cy * 2, width * 0.15, width * 0.35, 'value');
        
        // Multi-layer gradient for volume effect
        for (let layer = 0; layer < 3; layer++) {
            const layerR = puffR * (1.3 - layer * 0.25);
            const layerAlpha = 0.03 + layer * 0.02;  // Reduced from 0.06 + 0.04
            
            const grad = ctx.createRadialGradient(puffX, puffY, 0, puffX, puffY, layerR);
            
            // Warm cloud color (sunset)
            const cloudH = mat.base.h + NoiseEngine.bipolar(p, layer, 'value') * 15;
            const cloudL = mat.base.l - layer * 3;
            
            grad.addColorStop(0, `hsla(${cloudH}, ${mat.base.s}%, ${cloudL}%, ${layerAlpha})`);
            grad.addColorStop(0.4, `hsla(${cloudH}, ${mat.base.s}%, ${cloudL}%, ${layerAlpha * 0.7})`);
            grad.addColorStop(0.7, `hsla(${cloudH}, ${mat.base.s}%, ${cloudL}%, ${layerAlpha * 0.3})`);
            grad.addColorStop(1, `hsla(${cloudH}, ${mat.base.s}%, ${cloudL}%, 0)`);
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(puffX, puffY, layerR, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * Add water reflections (material-specific)
 */
function materialPass_Water(ctx, W, H) {
    console.log('🌊 Adding water with reflection behavior...');
    
    const mat = MATERIALS.water;
    const waterTop = H * 0.68;
    const waterBottom = H * 0.80;
    
    // Water has a HARD top edge (surface boundary)
    // But soft ripple reflections below
    
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;
    
    for (let y = Math.floor(waterTop); y < Math.floor(waterBottom); y++) {
        for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4;
            
            // Base water color
            const depthFactor = (y - waterTop) / (waterBottom - waterTop);
            
            // Add ripple distortion using coherent noise
            const ripple = fbm2D(x, y * 3, {
                scale: 0.015,
                octaves: 3,
                amplitude: 0.5,
                seed: 789
            });
            
            // Reflection gets colors from above (mountain reflection)
            const reflectY = Math.floor(waterTop - (y - waterTop) * 0.7);
            let reflectColor = { r: 40, g: 60, b: 80 };
            
            if (reflectY > 0 && reflectY < waterTop) {
                const reflectIdx = (reflectY * W + x) * 4;
                reflectColor = {
                    r: data[reflectIdx],
                    g: data[reflectIdx + 1],
                    b: data[reflectIdx + 2]
                };
            }
            
            // Blend reflection with water base color
            const waterBase = hslToRgb(mat.base.h, mat.base.s, mat.base.l);
            const blendFactor = 0.3 + ripple * 0.3 + depthFactor * 0.2;
            
            const finalColor = lerpColor(reflectColor, waterBase, blendFactor);
            
            // Add ripple brightness variation
            const rippleBright = (ripple - 0.5) * 25;
            
            data[idx] = clamp(finalColor.r + rippleBright, 0, 255);
            data[idx + 1] = clamp(finalColor.g + rippleBright, 0, 255);
            data[idx + 2] = clamp(finalColor.b + rippleBright, 0, 255);
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    // Add water surface highlight (specular - material property)
    const highlightGrad = ctx.createLinearGradient(0, waterTop, 0, waterTop + 10);
    highlightGrad.addColorStop(0, 'rgba(255, 200, 150, 0.15)');
    highlightGrad.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.fillRect(0, waterTop, W, 10);
}

// =============================================================================
// SECTION 7: ATMOSPHERE PASS
// =============================================================================

function atmospherePass(ctx, W, H) {
    console.log('🌫️ PHASE 3: Atmosphere Pass');
    
    // Atmospheric haze in the distance
    const hazeGrad = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.65);
    hazeGrad.addColorStop(0, 'rgba(180, 160, 200, 0.15)');
    hazeGrad.addColorStop(0.5, 'rgba(200, 180, 190, 0.1)');
    hazeGrad.addColorStop(1, 'rgba(200, 180, 190, 0)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 0, W, H * 0.7);
    
    // Warm glow near horizon (sunset atmosphere)
    const glowGrad = ctx.createRadialGradient(
        W * 0.5, H * 0.6, 0,
        W * 0.5, H * 0.6, W * 0.6
    );
    glowGrad.addColorStop(0, 'rgba(255, 180, 100, 0.12)');
    glowGrad.addColorStop(0.5, 'rgba(255, 150, 80, 0.06)');
    glowGrad.addColorStop(1, 'rgba(255, 150, 80, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);
}

// =============================================================================
// SECTION 8: REFINEMENT PASS
// =============================================================================

function refinementPass(ctx, W, H) {
    console.log('✨ PHASE 4: Refinement Pass');
    
    // Add stars in upper sky
    addStars(ctx, W, H);
    
    // Subtle vignette
    addVignette(ctx, W, H);
    
    // Final color correction (very subtle)
    addColorGrade(ctx, W, H);
}

function addStars(ctx, W, H) {
    // Stars only in dark upper portion - use random (appropriate for stars)
    const starCount = 80;
    
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H * 0.35;
        const size = 0.5 + Math.random() * 1.5;
        const brightness = 0.3 + Math.random() * 0.7;
        
        // Check if this area is dark enough for a star
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const lum = 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
        
        if (lum < 60) {  // Only add stars in dark areas
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Star glow
            if (size > 1) {
                const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                glowGrad.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.3})`);
                glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function addVignette(ctx, W, H) {
    const vignetteGrad = ctx.createRadialGradient(
        W * 0.5, H * 0.5, W * 0.3,
        W * 0.5, H * 0.5, W * 0.8
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
}

function addColorGrade(ctx, W, H) {
    // Subtle warm overlay for cohesion
    ctx.fillStyle = 'rgba(255, 240, 220, 0.03)';
    ctx.fillRect(0, 0, W, H);
}

// =============================================================================
// SECTION 9: MAIN RENDER PIPELINE
// =============================================================================

function render() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    console.log('═══════════════════════════════════════');
    console.log('   LANDSCAPE V7 - Material Logic Render');
    console.log('═══════════════════════════════════════');
    
    Validator.reset();
    
    // ═══════════════════════════════════════
    // PHASE 1: BIG FORM PASS (Structure First!)
    // ═══════════════════════════════════════
    bigFormPass(ctx, W, H);
    
    // Validate structure
    Validator.structureCheck(ctx, W, H);
    
    // ═══════════════════════════════════════
    // PHASE 2: MATERIAL PASS - MINIMAL (learn from failure!)
    // ═══════════════════════════════════════
    console.log('\n🎨 PHASE 2: Material Pass (Minimal)');
    
    // ONLY add what genuinely improves the Big Form:
    materialPass_Snow(ctx, W, H);      // Snow patches on peaks
    materialPass_Trees(ctx, W, H);     // Tree silhouettes
    
    // DISABLED - these were making it worse:
    // materialPass_Mountains(ctx, W, H);  // Was overprocessing/muddying
    // materialPass_Water(ctx, W, H);      // Already good from Big Form
    // materialPass_Clouds(ctx, W, H);     // Was covering mountains
    
    // ═══════════════════════════════════════
    // PHASE 3: ATMOSPHERE PASS - SUBTLE ONLY
    // ═══════════════════════════════════════
    atmospherePass(ctx, W, H);
    
    // ═══════════════════════════════════════
    // PHASE 4: REFINEMENT PASS
    // ═══════════════════════════════════════
    refinementPass(ctx, W, H);
    
    // ═══════════════════════════════════════
    // FINAL VALIDATION
    // ═══════════════════════════════════════
    console.log('\n🔬 Running Validation Suite...');
    Validator.valueHistogramCheck(ctx, W, H);
    Validator.edgeUniformityCheck(ctx, W, H);
    
    // Display validation report
    const report = Validator.getReport();
    console.log('\n' + report);
    
    // Show in page
    const validationDiv = document.getElementById('validation');
    if (validationDiv) {
        validationDiv.innerHTML = report.replace(/✅/g, '<span class="pass">✅</span>')
                                        .replace(/❌/g, '<span class="fail">❌</span>')
                                        .replace(/PHASE \d/g, '<span class="phase">$&</span>');
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('   Render Complete');
    console.log('═══════════════════════════════════════');
}

// Start rendering
render();
