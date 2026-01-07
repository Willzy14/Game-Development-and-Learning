// ============================================
// JUNGLE THEME V2 - ART PROTOCOLS APPLIED
// ============================================
// Upgraded with established art techniques:
//    ✅ ColorUtils for proper color manipulation
//    ✅ Organic curves (no ruler-traceable edges)
//    ✅ Value bridging (no hard color boundaries)
//    ✅ Atmospheric perspective (color shift, not alpha)
//    ✅ Material logic (bark ≠ leaves ≠ vines)
//    ✅ Edge mastery (70% soft, 30% hard distribution)
//
// ❌ NO game logic
// ❌ NO collision detection  
// ❌ NO movement/physics
// ❌ NO game constants (speeds, sizes, gravity)
//
// Uses EXACT SAME game-modular.js as base Flappy Bird!
// ============================================

// ============================================
// COLOR UTILITIES - Core art system
// ============================================
const ColorUtils = {
    // Parse hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },
    
    // RGB to hex
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },
    
    // Lighten a color
    lighten(hex, percent) {
        const rgb = this.hexToRgb(hex);
        return this.rgbToHex(
            rgb.r + (255 - rgb.r) * percent,
            rgb.g + (255 - rgb.g) * percent,
            rgb.b + (255 - rgb.b) * percent
        );
    },
    
    // Darken a color
    darken(hex, percent) {
        const rgb = this.hexToRgb(hex);
        return this.rgbToHex(
            rgb.r * (1 - percent),
            rgb.g * (1 - percent),
            rgb.b * (1 - percent)
        );
    },
    
    // Add alpha to hex color
    withAlpha(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },
    
    // Blend two colors
    blend(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        return this.rgbToHex(
            rgb1.r + (rgb2.r - rgb1.r) * factor,
            rgb1.g + (rgb2.g - rgb1.g) * factor,
            rgb1.b + (rgb2.b - rgb1.b) * factor
        );
    },
    
    // Desaturate toward gray
    desaturate(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const gray = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
        return this.rgbToHex(
            rgb.r + (gray - rgb.r) * factor,
            rgb.g + (gray - rgb.g) * factor,
            rgb.b + (gray - rgb.b) * factor
        );
    },
    
    // Apply atmospheric perspective (distance fog)
    applyAtmosphere(hex, distance, maxDistance, hazeColor = '#B8E6D4') {
        const factor = Math.min(distance / maxDistance, 0.8);
        const desaturated = this.desaturate(hex, factor * 0.5);
        return this.blend(desaturated, hazeColor, factor * 0.6);
    }
};

// ============================================
// NOISE UTILITIES - Coherent randomness
// ============================================
const NoiseUtils = {
    // Value noise for organic variation
    valueNoise(x, seed = 0) {
        const n = Math.sin(x * 127.1 + seed * 311.7) * 43758.5453;
        return n - Math.floor(n);
    },
    
    // 2D value noise
    valueNoise2D(x, y, seed = 0) {
        const n = Math.sin(x * 127.1 + y * 269.5 + seed * 311.7) * 43758.5453;
        return n - Math.floor(n);
    },
    
    // Smoothed noise (interpolated)
    smoothNoise(x, seed = 0) {
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const t = x - x0;
        const smooth = t * t * (3 - 2 * t); // Smoothstep
        return this.valueNoise(x0, seed) * (1 - smooth) + this.valueNoise(x1, seed) * smooth;
    },
    
    // Organic curve points - NO STRAIGHT LINES IN NATURE
    organicCurve(x1, y1, x2, y2, segments, variance, seed) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            // Add organic variation (less at endpoints)
            const edgeFactor = Math.sin(t * Math.PI); // 0 at ends, 1 in middle
            const noise = (this.valueNoise2D(i, seed, seed) - 0.5) * variance * edgeFactor;
            
            points.push({ x: x + noise, y: y + noise * 0.5 });
        }
        return points;
    }
};

// ============================================
// THEME OBJECT
// ============================================
const THEME = {
    name: 'Jungle Adventure V2 - Art Protocols',
    
    // ============================================
    // COLORS - Lush Jungle Palette
    // ============================================
    colors: {
        // Sky layers
        skyTop: '#87CEEB',
        skyMid: '#98D8C8',
        skyBottom: '#B8E6D4',
        
        // Atmospheric haze (for distance)
        haze: '#C8E6D0',
        
        // Canopy/trees - with value range
        canopyDarkest: '#1B5E20',
        canopyDark: '#2E7D32',
        canopyMid: '#4CAF50',
        canopyLight: '#8BC34A',
        canopyHighlight: '#AED581',
        
        // Tree trunks (obstacles) - material: rough bark
        trunkDarkest: '#2E1B12',
        trunkDark: '#3E2723',
        trunkMid: '#5D4037',
        trunkLight: '#6D4C41',
        trunkHighlight: '#8D6E63',
        
        // Vines - material: smooth organic
        vineDark: '#1B5E20',
        vineMid: '#2E7D32',
        vineLight: '#66BB6A',
        
        // Ground
        groundDarkest: '#1B3A0F',
        groundDark: '#33691E',
        groundMid: '#558B2F',
        groundLight: '#7CB342',
        dirtDark: '#3E2723',
        dirtMid: '#5D4037',
        
        // Bird (tropical parrot)
        birdBody: '#E53935',
        birdBodyLight: '#EF5350',
        birdWing: '#1E88E5',
        birdWingLight: '#42A5F5',
        birdBelly: '#FDD835',
        birdBellyLight: '#FFEE58',
        birdBeak: '#FF9800',
        birdBeakLight: '#FFB74D',
        birdEye: '#FFFFFF',
        birdPupil: '#212121',
        
        // Accents
        flowerPink: '#E91E63',
        flowerOrange: '#FF5722',
        flowerYellow: '#FFEB3B',
        flowerCenter: '#FFC107'
    },
    
    // Cached background layers (pre-rendered for performance)
    backgroundCanvas: null,
    groundCanvas: null,
    time: 0,
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Pre-render complex static elements
        this.backgroundCanvas = this.createBackground();
        this.groundCanvas = this.createGround();
    },
    
    // ============================================
    // SEEDED RANDOM (for consistent generation)
    // ============================================
    seededRandom(seed) {
        const x = Math.sin(seed * 127.1) * 43758.5453;
        return x - Math.floor(x);
    },
    
    // ============================================
    // BACKGROUND CREATION - Pre-rendered layers
    // ============================================
    createBackground() {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.width * 2;
        bgCanvas.height = this.height;
        const ctx = bgCanvas.getContext('2d');
        
        const W = bgCanvas.width;
        const H = this.height;
        
        // === SKY with value gradation ===
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
        skyGrad.addColorStop(0, this.colors.skyTop);
        skyGrad.addColorStop(0.4, this.colors.skyMid);
        skyGrad.addColorStop(0.8, this.colors.skyBottom);
        skyGrad.addColorStop(1, this.colors.haze);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
        
        // === DISTANT HILLS with atmospheric perspective ===
        // Furthest - most atmospheric haze
        this.drawDistantHills(ctx, W, H, 0.9, this.colors.canopyDarkest);
        // Mid-far
        this.drawDistantHills(ctx, W, H, 0.7, this.colors.canopyDark);
        // Mid
        this.drawDistantHills(ctx, W, H, 0.5, this.colors.canopyMid);
        
        // === TREE LAYERS with atmospheric color shift (NOT just alpha!) ===
        // Far layer - heavy atmosphere
        this.drawTreeLayer(ctx, W, H, 3, this.colors.canopyDark, 180, 0.85);
        // Mid layer - moderate atmosphere  
        this.drawTreeLayer(ctx, W, H, 2, this.colors.canopyMid, 140, 0.5);
        // Near layer - minimal atmosphere
        this.drawTreeLayer(ctx, W, H, 1, this.colors.canopyLight, 100, 0.2);
        
        // === HANGING VINES with organic curves ===
        this.drawBackgroundVines(ctx, W, H);
        
        // === ATMOSPHERIC MIST (soft edges, value bridging) ===
        this.drawMistLayers(ctx, W, H);
        
        return bgCanvas;
    },
    
    // Hills with organic edges and atmospheric color shift
    drawDistantHills(ctx, W, H, distanceFactor, baseColor) {
        // Apply atmospheric perspective - COLOR SHIFT, not alpha
        const atmosphericColor = ColorUtils.applyAtmosphere(
            baseColor, 
            distanceFactor, 
            1.0, 
            this.colors.haze
        );
        
        // Soft edge gradient for hills (value bridging with sky)
        const hillY = H * (0.35 + distanceFactor * 0.15);
        const hillGrad = ctx.createLinearGradient(0, hillY - 30, 0, hillY + 50);
        hillGrad.addColorStop(0, ColorUtils.withAlpha(atmosphericColor, 0));
        hillGrad.addColorStop(0.3, ColorUtils.withAlpha(atmosphericColor, 0.5));
        hillGrad.addColorStop(0.5, atmosphericColor);
        hillGrad.addColorStop(1, atmosphericColor);
        
        ctx.fillStyle = hillGrad;
        ctx.beginPath();
        ctx.moveTo(0, H);
        
        // Organic hill profile using coherent noise (NOT sine waves!)
        for (let x = 0; x <= W; x += 5) {
            // Multiple noise frequencies for natural variation
            const n1 = NoiseUtils.smoothNoise(x * 0.008, distanceFactor * 100) * 40;
            const n2 = NoiseUtils.smoothNoise(x * 0.02, distanceFactor * 200) * 15;
            const n3 = NoiseUtils.smoothNoise(x * 0.05, distanceFactor * 300) * 5;
            
            const y = hillY + n1 + n2 + n3;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
    },
    
    // Tree layer with atmospheric color shift
    drawTreeLayer(ctx, W, H, layerIndex, baseColor, spacing, atmosphereFactor) {
        // Apply atmospheric perspective to color
        const treeColor = ColorUtils.applyAtmosphere(
            baseColor,
            atmosphereFactor,
            1.0,
            this.colors.haze
        );
        
        const shadowColor = ColorUtils.darken(treeColor, 0.3);
        const highlightColor = ColorUtils.lighten(treeColor, 0.2);
        
        for (let x = 0; x < W; x += spacing) {
            const seed = x + layerIndex * 1000;
            const treeHeight = 80 + this.seededRandom(seed) * 60;
            const treeWidth = 50 + this.seededRandom(seed + 1) * 30;
            const treeY = H * (0.35 + atmosphereFactor * 0.1) + this.seededRandom(seed + 2) * 40;
            const treeX = x + spacing / 2 + (this.seededRandom(seed + 3) - 0.5) * 30;
            
            this.drawOrganicTreeTop(ctx, treeX, treeY, treeWidth, treeHeight, 
                treeColor, shadowColor, highlightColor, seed);
        }
    },
    
    // Organic tree canopy with SOFT EDGES and value bridging
    drawOrganicTreeTop(ctx, x, y, width, height, baseColor, shadowColor, highlightColor, seed) {
        // Multiple overlapping soft circles for natural canopy
        const clusterCount = 6 + Math.floor(this.seededRandom(seed + 50) * 4);
        
        for (let i = 0; i < clusterCount; i++) {
            const angle = (i / clusterCount) * Math.PI * 2 + this.seededRandom(seed + i) * 0.5;
            const dist = this.seededRandom(seed + i + 10) * width * 0.4;
            const cx = x + Math.cos(angle) * dist;
            const cy = y + Math.sin(angle) * dist * 0.6 - height * 0.2;
            const r = width * 0.25 + this.seededRandom(seed + i + 20) * width * 0.15;
            
            // Radial gradient for SOFT EDGES (no hard circles!)
            const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
            grad.addColorStop(0, highlightColor);
            grad.addColorStop(0.4, baseColor);
            grad.addColorStop(0.8, shadowColor);
            grad.addColorStop(1, ColorUtils.withAlpha(shadowColor, 0)); // Soft edge dissolve
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // Vines with organic curves (not straight lines)
    drawBackgroundVines(ctx, W, H) {
        for (let i = 0; i < 20; i++) {
            const x = this.seededRandom(i * 7) * W;
            const startY = 0;
            const endY = H * 0.25 + this.seededRandom(i * 11) * H * 0.35;
            const thickness = 2 + this.seededRandom(i * 13) * 2;
            
            // Atmospheric fade based on position
            const atmosphereFactor = 0.3 + this.seededRandom(i * 17) * 0.4;
            const vineColor = ColorUtils.applyAtmosphere(
                this.colors.vineMid,
                atmosphereFactor,
                1.0,
                this.colors.haze
            );
            
            // Generate organic curve (not straight!)
            const points = NoiseUtils.organicCurve(x, startY, x, endY, 20, 15, i);
            
            // Draw with soft edges
            this.drawOrganicVine(ctx, points, vineColor, thickness, i);
        }
    },
    
    drawOrganicVine(ctx, points, color, thickness, seed) {
        if (points.length < 2) return;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 1; i < points.length; i++) {
            const thicknessVar = thickness * (0.8 + NoiseUtils.valueNoise(i, seed) * 0.4);
            
            // Soft edge via shadow blur
            ctx.shadowColor = ColorUtils.withAlpha(color, 0.3);
            ctx.shadowBlur = 3;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = thicknessVar;
            ctx.beginPath();
            ctx.moveTo(points[i - 1].x, points[i - 1].y);
            ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        
        // Vine leaves with soft edges
        const leafColor = ColorUtils.lighten(color, 0.2);
        for (let i = 0; i < points.length; i += 4) {
            if (this.seededRandom(seed + i * 7) > 0.5) {
                const p = points[i];
                const leafSize = 4 + this.seededRandom(seed + i) * 4;
                const leafAngle = this.seededRandom(seed + i + 1) * Math.PI;
                
                // Gradient leaf for soft edge
                const leafGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, leafSize);
                leafGrad.addColorStop(0, leafColor);
                leafGrad.addColorStop(0.7, color);
                leafGrad.addColorStop(1, ColorUtils.withAlpha(color, 0));
                
                ctx.fillStyle = leafGrad;
                ctx.beginPath();
                ctx.ellipse(p.x + 5, p.y, leafSize, leafSize * 0.5, leafAngle, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    
    // Mist layers with soft gradients (value bridging)
    drawMistLayers(ctx, W, H) {
        for (let i = 0; i < 3; i++) {
            const mistY = H * (0.3 + i * 0.15);
            const mistHeight = H * 0.15;
            const mistAlpha = 0.08 + i * 0.04;
            
            const mistGrad = ctx.createLinearGradient(0, mistY, 0, mistY + mistHeight);
            mistGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
            mistGrad.addColorStop(0.3, `rgba(255, 255, 255, ${mistAlpha})`);
            mistGrad.addColorStop(0.5, `rgba(200, 230, 210, ${mistAlpha * 1.2})`);
            mistGrad.addColorStop(0.7, `rgba(255, 255, 255, ${mistAlpha})`);
            mistGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.fillStyle = mistGrad;
            ctx.fillRect(0, mistY, W, mistHeight);
        }
    },
    
    // ============================================
    // GROUND CREATION - Pre-rendered with value bridging
    // ============================================
    createGround() {
        const groundCanvas = document.createElement('canvas');
        groundCanvas.width = this.width;
        groundCanvas.height = 80;
        const ctx = groundCanvas.getContext('2d');
        
        // === DIRT LAYER with value bridging to grass ===
        const dirtGrad = ctx.createLinearGradient(0, 30, 0, 80);
        dirtGrad.addColorStop(0, this.colors.dirtMid);
        dirtGrad.addColorStop(0.5, this.colors.dirtDark);
        dirtGrad.addColorStop(1, ColorUtils.darken(this.colors.dirtDark, 0.3));
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(0, 30, this.width, 50);
        
        // === GRASS/MOSS LAYER with soft top edge ===
        const grassGrad = ctx.createLinearGradient(0, 0, 0, 35);
        grassGrad.addColorStop(0, this.colors.groundLight);
        grassGrad.addColorStop(0.3, this.colors.groundMid);
        grassGrad.addColorStop(0.7, this.colors.groundDark);
        grassGrad.addColorStop(1, this.colors.dirtMid); // VALUE BRIDGE to dirt
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, 10, this.width, 30);
        
        // === GRASS BLADES with organic variation ===
        for (let x = 0; x < this.width; x += 3) {
            const seed = x * 7;
            const height = 8 + NoiseUtils.valueNoise(x * 0.1, seed) * 8;
            const lean = (NoiseUtils.valueNoise(x * 0.05, seed + 100) - 0.5) * 6;
            const thickness = 1 + NoiseUtils.valueNoise(x * 0.2, seed + 200) * 1.5;
            
            // Color variation for natural look
            const colorVar = NoiseUtils.valueNoise(x * 0.08, seed + 300);
            const bladeColor = ColorUtils.blend(
                this.colors.groundMid,
                this.colors.canopyLight,
                colorVar * 0.4
            );
            
            // Gradient blade for soft tip
            const bladeGrad = ctx.createLinearGradient(x, 10, x + lean, 10 - height);
            bladeGrad.addColorStop(0, bladeColor);
            bladeGrad.addColorStop(0.7, ColorUtils.lighten(bladeColor, 0.2));
            bladeGrad.addColorStop(1, ColorUtils.withAlpha(bladeColor, 0.5));
            
            ctx.strokeStyle = bladeGrad;
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, 12);
            ctx.quadraticCurveTo(x + lean * 0.5, 10 - height * 0.6, x + lean, 10 - height);
            ctx.stroke();
        }
        
        // === SCATTERED FERNS for value bridging ===
        for (let x = 10; x < this.width; x += 25 + Math.floor(this.seededRandom(x) * 20)) {
            this.drawFern(ctx, x, 12, 0.6 + this.seededRandom(x + 1) * 0.4);
        }
        
        return groundCanvas;
    },
    
    drawFern(ctx, x, y, scale) {
        const fernColor = this.colors.canopyMid;
        const fernLight = ColorUtils.lighten(fernColor, 0.3);
        const frondLength = 15 * scale;
        const leafPairs = 5;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Main stem with gradient
        const stemGrad = ctx.createLinearGradient(0, 0, 3, -frondLength);
        stemGrad.addColorStop(0, fernColor);
        stemGrad.addColorStop(1, fernLight);
        
        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(2, -frondLength * 0.5, 3, -frondLength);
        ctx.stroke();
        
        // Leaflets with soft edges
        for (let i = 0; i < leafPairs; i++) {
            const t = (i + 1) / (leafPairs + 1);
            const stemX = 2 * t;
            const stemY = -frondLength * t;
            const leafSize = (4 + (1 - t) * 4) * scale;
            
            // Left leaf - radial gradient for soft edge
            const leftGrad = ctx.createRadialGradient(stemX - leafSize, stemY, 0, stemX - leafSize * 0.5, stemY, leafSize);
            leftGrad.addColorStop(0, fernLight);
            leftGrad.addColorStop(1, ColorUtils.withAlpha(fernColor, 0));
            ctx.fillStyle = leftGrad;
            ctx.beginPath();
            ctx.ellipse(stemX - leafSize * 0.5, stemY, leafSize, leafSize * 0.3, -0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // Right leaf  
            const rightGrad = ctx.createRadialGradient(stemX + leafSize, stemY, 0, stemX + leafSize * 0.5, stemY, leafSize);
            rightGrad.addColorStop(0, fernLight);
            rightGrad.addColorStop(1, ColorUtils.withAlpha(fernColor, 0));
            ctx.fillStyle = rightGrad;
            ctx.beginPath();
            ctx.ellipse(stemX + leafSize * 0.5, stemY, leafSize, leafSize * 0.3, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    // ============================================
    // BACKGROUND RENDERING
    // ============================================
    drawBackground(bgX) {
        const ctx = this.ctx;
        
        if (this.backgroundCanvas) {
            // Seamless scrolling
            const x1 = bgX % this.width;
            ctx.drawImage(this.backgroundCanvas, x1, 0);
            ctx.drawImage(this.backgroundCanvas, x1 + this.width, 0);
        }
    },
    
    // ============================================
    // GROUND RENDERING
    // ============================================
    drawGround() {
        const ctx = this.ctx;
        const groundY = this.height - 50;
        
        if (this.groundCanvas) {
            ctx.drawImage(this.groundCanvas, 0, groundY - 10);
        }
        
        // Animated grass wave overlay
        ctx.globalAlpha = 0.3;
        for (let x = 0; x < this.width; x += 15) {
            const waveOffset = Math.sin(x * 0.1 + this.time * 0.03) * 2;
            const height = 6 + waveOffset;
            
            ctx.strokeStyle = this.colors.canopyLight;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.quadraticCurveTo(x + 2, groundY - height, x + 4, groundY - 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // Scattered flowers for color accents
        const flowerColors = [this.colors.flowerPink, this.colors.flowerOrange, this.colors.flowerYellow];
        for (let x = 30; x < this.width; x += 70) {
            const flowerX = x + Math.sin(x * 0.5) * 15;
            const colorIndex = Math.floor(this.seededRandom(x) * 3);
            this.drawFlower(ctx, flowerX, groundY - 5, 4, flowerColors[colorIndex]);
        }
    },
    
    drawFlower(ctx, x, y, size, petalColor) {
        // Soft petal gradient
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            
            const petalGrad = ctx.createRadialGradient(px, py, 0, px, py, size * 0.7);
            petalGrad.addColorStop(0, ColorUtils.lighten(petalColor, 0.3));
            petalGrad.addColorStop(0.5, petalColor);
            petalGrad.addColorStop(1, ColorUtils.withAlpha(petalColor, 0));
            
            ctx.fillStyle = petalGrad;
            ctx.beginPath();
            ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center with gradient
        const centerGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
        centerGrad.addColorStop(0, ColorUtils.lighten(this.colors.flowerCenter, 0.3));
        centerGrad.addColorStop(1, this.colors.flowerCenter);
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // ============================================
    // PIPE/OBSTACLE - Organic Tree Trunks
    // Material: Rough Bark (70% hard grain, 30% soft weathering)
    // ============================================
    drawPipe(pipe, pipeWidth) {
        const ctx = this.ctx;
        
        // Top trunk (hanging from canopy)
        this.drawOrganicTrunk(ctx, pipe.x, 0, pipe.gapY, pipeWidth, true, pipe.x);
        
        // Bottom trunk (growing from ground)
        const bottomY = pipe.gapY + pipe.gapSize;
        this.drawOrganicTrunk(ctx, pipe.x, bottomY, this.height - bottomY - 50, pipeWidth, false, pipe.x + 500);
    },
    
    drawOrganicTrunk(ctx, x, y, height, width, isTop, seed) {
        if (height <= 0) return;
        
        // === BARK MATERIAL: Organic edges, not ruler-traceable ===
        const edgeVariance = 3;
        
        // Generate organic edge points (NOT straight lines!)
        const leftEdge = [];
        const rightEdge = [];
        const segments = Math.ceil(height / 20);
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const segY = y + height * t;
            
            // Organic variation on edges
            const leftNoise = NoiseUtils.smoothNoise(segY * 0.05, seed) * edgeVariance;
            const rightNoise = NoiseUtils.smoothNoise(segY * 0.05, seed + 100) * edgeVariance;
            
            leftEdge.push({ x: x + leftNoise, y: segY });
            rightEdge.push({ x: x + width + rightNoise, y: segY });
        }
        
        // Draw trunk body with gradient (bark material lighting)
        const trunkGrad = ctx.createLinearGradient(x, y, x + width, y);
        trunkGrad.addColorStop(0, this.colors.trunkDark);
        trunkGrad.addColorStop(0.2, this.colors.trunkMid);
        trunkGrad.addColorStop(0.5, this.colors.trunkLight);
        trunkGrad.addColorStop(0.8, this.colors.trunkMid);
        trunkGrad.addColorStop(1, this.colors.trunkDark);
        
        // Draw organic trunk shape with curves
        ctx.fillStyle = trunkGrad;
        ctx.beginPath();
        ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
        
        // Left edge with quadratic curves (smooth organic edge)
        for (let i = 1; i < leftEdge.length; i++) {
            const prev = leftEdge[i - 1];
            const curr = leftEdge[i];
            const cpX = (prev.x + curr.x) / 2;
            const cpY = (prev.y + curr.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
        }
        ctx.lineTo(leftEdge[leftEdge.length - 1].x, leftEdge[leftEdge.length - 1].y);
        
        // Bottom/top edge
        ctx.lineTo(rightEdge[rightEdge.length - 1].x, rightEdge[rightEdge.length - 1].y);
        
        // Right edge with curves (reverse order)
        for (let i = rightEdge.length - 2; i >= 0; i--) {
            const prev = rightEdge[i + 1];
            const curr = rightEdge[i];
            const cpX = (prev.x + curr.x) / 2;
            const cpY = (prev.y + curr.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // === BARK TEXTURE (hard edges for wood grain - 70%) ===
        ctx.strokeStyle = ColorUtils.withAlpha(this.colors.trunkDarkest, 0.4);
        ctx.lineWidth = 1;
        
        for (let by = y + 15; by < y + height - 15; by += 12 + NoiseUtils.valueNoise(by, seed) * 8) {
            const lineY = by + NoiseUtils.valueNoise(by * 0.1, seed + 50) * 3;
            const startX = x + 4 + NoiseUtils.valueNoise(by, seed + 60) * 4;
            const endX = x + width - 4 - NoiseUtils.valueNoise(by, seed + 70) * 4;
            
            ctx.beginPath();
            ctx.moveTo(startX, lineY);
            // Slight curve for organic feel
            ctx.quadraticCurveTo((startX + endX) / 2, lineY + 2, endX, lineY + 1);
            ctx.stroke();
        }
        
        // === SOFT EDGE SHADOWS (weathering - 30%) ===
        // Left shadow
        const leftShadow = ctx.createLinearGradient(x - 5, y, x + 8, y);
        leftShadow.addColorStop(0, ColorUtils.withAlpha(this.colors.trunkDarkest, 0));
        leftShadow.addColorStop(0.5, ColorUtils.withAlpha(this.colors.trunkDarkest, 0.3));
        leftShadow.addColorStop(1, ColorUtils.withAlpha(this.colors.trunkDarkest, 0));
        ctx.fillStyle = leftShadow;
        ctx.fillRect(x - 5, y, 15, height);
        
        // Right highlight
        const rightHighlight = ctx.createLinearGradient(x + width - 8, y, x + width + 5, y);
        rightHighlight.addColorStop(0, ColorUtils.withAlpha(this.colors.trunkHighlight, 0));
        rightHighlight.addColorStop(0.5, ColorUtils.withAlpha(this.colors.trunkHighlight, 0.2));
        rightHighlight.addColorStop(1, ColorUtils.withAlpha(this.colors.trunkHighlight, 0));
        ctx.fillStyle = rightHighlight;
        ctx.fillRect(x + width - 8, y, 15, height);
        
        // === VINES with organic curves ===
        this.drawTrunkVines(ctx, x, y, width, height, seed);
        
        // === LEAF CLUSTER at opening (VALUE BRIDGING trunk→air) ===
        if (isTop) {
            this.drawLeafCluster(ctx, x + width / 2, y + height, width + 30, seed, true);
        } else {
            this.drawLeafCluster(ctx, x + width / 2, y, width + 30, seed, false);
        }
    },
    
    drawTrunkVines(ctx, x, y, width, height, seed) {
        const vineCount = 2 + Math.floor(this.seededRandom(seed + 200) * 2);
        
        for (let v = 0; v < vineCount; v++) {
            const vineStartX = x + width * (0.2 + v * 0.3) + (this.seededRandom(seed + v * 10) - 0.5) * 10;
            const vineColor = this.seededRandom(seed + v * 20) > 0.5 ? this.colors.vineMid : this.colors.vineDark;
            
            // Generate organic path (not straight!)
            const points = NoiseUtils.organicCurve(
                vineStartX, y,
                vineStartX + (this.seededRandom(seed + v * 30) - 0.5) * 15, y + height,
                Math.ceil(height / 15),
                10,
                seed + v * 100
            );
            
            // Draw vine with varying thickness
            ctx.lineCap = 'round';
            for (let i = 1; i < points.length; i++) {
                const thickness = 2 + NoiseUtils.valueNoise(i, seed + v) * 1.5;
                
                // Soft glow
                ctx.shadowColor = ColorUtils.withAlpha(vineColor, 0.3);
                ctx.shadowBlur = 2;
                
                ctx.strokeStyle = vineColor;
                ctx.lineWidth = thickness;
                ctx.beginPath();
                ctx.moveTo(points[i - 1].x, points[i - 1].y);
                ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            
            // Vine leaves with soft edges
            for (let i = 3; i < points.length - 2; i += 3) {
                if (this.seededRandom(seed + v * 50 + i) > 0.4) {
                    const p = points[i];
                    const leafSize = 5 + this.seededRandom(seed + v * 60 + i) * 4;
                    const side = this.seededRandom(seed + v * 70 + i) > 0.5 ? 1 : -1;
                    
                    const leafGrad = ctx.createRadialGradient(
                        p.x + side * leafSize, p.y, 0,
                        p.x + side * leafSize * 0.5, p.y, leafSize
                    );
                    leafGrad.addColorStop(0, this.colors.vineLight);
                    leafGrad.addColorStop(0.6, vineColor);
                    leafGrad.addColorStop(1, ColorUtils.withAlpha(vineColor, 0));
                    
                    ctx.fillStyle = leafGrad;
                    ctx.beginPath();
                    ctx.ellipse(p.x + side * leafSize * 0.5, p.y, leafSize, leafSize * 0.4, side * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    },
    
    drawLeafCluster(ctx, x, y, width, seed, isHanging) {
        const direction = isHanging ? 1 : -1;
        const leafCount = 7 + Math.floor(this.seededRandom(seed + 300) * 5);
        
        // Multiple leaf layers for depth
        for (let layer = 0; layer < 2; layer++) {
            const layerOffset = layer * 3 * direction;
            const layerAlpha = 1 - layer * 0.3;
            
            for (let i = 0; i < leafCount; i++) {
                const spreadX = (this.seededRandom(seed + i * 11 + layer * 100) - 0.5) * width * 0.8;
                const spreadY = this.seededRandom(seed + i * 13 + layer * 100) * 12 * direction;
                
                const lx = x + spreadX;
                const ly = y + layerOffset + spreadY;
                const leafWidth = 12 + this.seededRandom(seed + i * 17) * 8;
                const leafHeight = leafWidth * 0.4;
                const rotation = (this.seededRandom(seed + i * 19) - 0.5) * 0.8;
                
                // Color variation
                const colorVar = this.seededRandom(seed + i * 23);
                const leafColor = colorVar > 0.6 ? this.colors.canopyLight :
                                  colorVar > 0.3 ? this.colors.canopyMid : this.colors.canopyDark;
                
                // Radial gradient for soft leaf edge
                const leafGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, leafWidth * 0.6);
                leafGrad.addColorStop(0, ColorUtils.lighten(leafColor, 0.2));
                leafGrad.addColorStop(0.5, leafColor);
                leafGrad.addColorStop(1, ColorUtils.withAlpha(leafColor, 0));
                
                ctx.globalAlpha = layerAlpha;
                ctx.fillStyle = leafGrad;
                ctx.beginPath();
                ctx.ellipse(lx, ly, leafWidth * 0.5, leafHeight * 0.5, rotation, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
    },
    
    // ============================================
    // BIRD RENDERING - Tropical Parrot with soft gradients
    // ============================================
    drawBird(state, birdSize) {
        const ctx = this.ctx;
        const { x, y, rotation } = state;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        const size = birdSize;
        
        // === TAIL FEATHERS (soft gradient edges) ===
        const tailGrad = ctx.createLinearGradient(-size * 0.6, 0, -size * 0.3, 0);
        tailGrad.addColorStop(0, ColorUtils.withAlpha(this.colors.birdWing, 0));
        tailGrad.addColorStop(0.3, this.colors.birdWing);
        tailGrad.addColorStop(1, this.colors.birdWingLight);
        
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, 0);
        ctx.quadraticCurveTo(-size * 0.5, -size * 0.15, -size * 0.6, -size * 0.08);
        ctx.quadraticCurveTo(-size * 0.55, 0, -size * 0.6, size * 0.08);
        ctx.quadraticCurveTo(-size * 0.5, size * 0.15, -size * 0.35, 0);
        ctx.fill();
        
        // Yellow tail accent
        ctx.fillStyle = ColorUtils.withAlpha(this.colors.birdBelly, 0.7);
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, 0);
        ctx.quadraticCurveTo(-size * 0.45, size * 0.05, -size * 0.55, 0);
        ctx.quadraticCurveTo(-size * 0.45, -size * 0.03, -size * 0.35, 0);
        ctx.fill();
        
        // === WING with radial gradient ===
        const wingGrad = ctx.createRadialGradient(-size * 0.1, size * 0.1, 0, -size * 0.1, size * 0.1, size * 0.35);
        wingGrad.addColorStop(0, this.colors.birdWingLight);
        wingGrad.addColorStop(0.7, this.colors.birdWing);
        wingGrad.addColorStop(1, ColorUtils.darken(this.colors.birdWing, 0.2));
        
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.ellipse(-size * 0.05, size * 0.08, size * 0.32, size * 0.18, -0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // === BODY with soft gradient ===
        const bodyGrad = ctx.createRadialGradient(size * 0.05, -size * 0.05, 0, 0, 0, size * 0.4);
        bodyGrad.addColorStop(0, this.colors.birdBodyLight);
        bodyGrad.addColorStop(0.6, this.colors.birdBody);
        bodyGrad.addColorStop(1, ColorUtils.darken(this.colors.birdBody, 0.15));
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.38, size * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // === BELLY (yellow) with gradient ===
        const bellyGrad = ctx.createRadialGradient(size * 0.08, size * 0.08, 0, size * 0.05, size * 0.1, size * 0.2);
        bellyGrad.addColorStop(0, this.colors.birdBellyLight);
        bellyGrad.addColorStop(1, this.colors.birdBelly);
        
        ctx.fillStyle = bellyGrad;
        ctx.beginPath();
        ctx.ellipse(size * 0.05, size * 0.08, size * 0.18, size * 0.14, 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // === HEAD with gradient ===
        const headGrad = ctx.createRadialGradient(size * 0.28, -size * 0.15, 0, size * 0.25, -size * 0.1, size * 0.25);
        headGrad.addColorStop(0, this.colors.birdBodyLight);
        headGrad.addColorStop(0.7, this.colors.birdBody);
        headGrad.addColorStop(1, ColorUtils.darken(this.colors.birdBody, 0.1));
        
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(size * 0.25, -size * 0.1, size * 0.24, 0, Math.PI * 2);
        ctx.fill();
        
        // === EYE with highlights ===
        // Eye socket shadow
        ctx.fillStyle = ColorUtils.withAlpha('#000000', 0.2);
        ctx.beginPath();
        ctx.arc(size * 0.32, -size * 0.12, size * 0.14, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye white
        ctx.fillStyle = this.colors.birdEye;
        ctx.beginPath();
        ctx.arc(size * 0.32, -size * 0.13, size * 0.11, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = this.colors.birdPupil;
        ctx.beginPath();
        ctx.arc(size * 0.34, -size * 0.13, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(size * 0.32, -size * 0.16, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        
        // === BEAK (curved parrot beak) with gradient ===
        const beakGrad = ctx.createLinearGradient(size * 0.45, -size * 0.1, size * 0.6, size * 0.05);
        beakGrad.addColorStop(0, this.colors.birdBeakLight);
        beakGrad.addColorStop(0.5, this.colors.birdBeak);
        beakGrad.addColorStop(1, ColorUtils.darken(this.colors.birdBeak, 0.2));
        
        ctx.fillStyle = beakGrad;
        ctx.beginPath();
        ctx.moveTo(size * 0.45, -size * 0.05);
        ctx.quadraticCurveTo(size * 0.65, -size * 0.12, size * 0.58, size * 0.02);
        ctx.quadraticCurveTo(size * 0.52, size * 0.05, size * 0.45, size * 0.02);
        ctx.quadraticCurveTo(size * 0.42, -size * 0.02, size * 0.45, -size * 0.05);
        ctx.fill();
        
        // Beak nostril detail
        ctx.fillStyle = ColorUtils.darken(this.colors.birdBeak, 0.3);
        ctx.beginPath();
        ctx.ellipse(size * 0.48, -size * 0.02, size * 0.02, size * 0.015, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    // ============================================
    // FIREFLIES - Soft glowing particles
    // ============================================
    fireflies: [],
    fireflyCount: 25,
    
    initFireflies() {
        this.fireflies = [];
        for (let i = 0; i < this.fireflyCount; i++) {
            this.fireflies.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height - 100) + 50,
                size: 2 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.3,
                phase: Math.random() * Math.PI * 2,
                glowSpeed: 0.02 + Math.random() * 0.03
            });
        }
    },
    
    drawFireflies() {
        const ctx = this.ctx;
        
        // Initialize on first call
        if (this.fireflies.length === 0) {
            this.initFireflies();
        }
        
        for (const fly of this.fireflies) {
            // Update position with gentle drift
            fly.x += fly.speedX + Math.sin(this.time * 0.01 + fly.phase) * 0.3;
            fly.y += fly.speedY + Math.cos(this.time * 0.015 + fly.phase) * 0.2;
            
            // Wrap around screen
            if (fly.x < 0) fly.x = this.width;
            if (fly.x > this.width) fly.x = 0;
            if (fly.y < 50) fly.y = this.height - 100;
            if (fly.y > this.height - 50) fly.y = 50;
            
            // Pulsing glow intensity
            const pulse = (Math.sin(this.time * fly.glowSpeed + fly.phase) + 1) / 2;
            const glowAlpha = 0.3 + pulse * 0.7;
            const glowSize = fly.size * (1.5 + pulse * 1.5);
            
            // Outer glow (soft)
            const outerGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, glowSize * 3);
            outerGlow.addColorStop(0, `rgba(180, 255, 100, ${glowAlpha * 0.3})`);
            outerGlow.addColorStop(0.5, `rgba(150, 255, 80, ${glowAlpha * 0.1})`);
            outerGlow.addColorStop(1, 'rgba(100, 255, 50, 0)');
            
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(fly.x, fly.y, glowSize * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core (bright)
            const innerGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, glowSize);
            innerGlow.addColorStop(0, `rgba(255, 255, 200, ${glowAlpha})`);
            innerGlow.addColorStop(0.5, `rgba(200, 255, 100, ${glowAlpha * 0.6})`);
            innerGlow.addColorStop(1, 'rgba(150, 255, 80, 0)');
            
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(fly.x, fly.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // ============================================
    // LIGHT RAYS - Volumetric light through canopy
    // ============================================
    drawLightRays() {
        const ctx = this.ctx;
        
        // Only draw light rays in upper portion (through canopy)
        const rayCount = 5;
        
        for (let i = 0; i < rayCount; i++) {
            const seed = i * 137;
            const baseX = 50 + this.seededRandom(seed) * (this.width - 100);
            
            // Animate ray sway
            const sway = Math.sin(this.time * 0.008 + i * 1.5) * 15;
            const x = baseX + sway;
            
            // Ray properties
            const topWidth = 20 + this.seededRandom(seed + 1) * 30;
            const bottomWidth = topWidth * 2.5;
            const rayHeight = 150 + this.seededRandom(seed + 2) * 100;
            
            // Pulsing intensity
            const pulse = (Math.sin(this.time * 0.01 + i * 0.8) + 1) / 2;
            const alpha = 0.03 + pulse * 0.04;
            
            // Create trapezoid light ray
            const rayGrad = ctx.createLinearGradient(x, 0, x, rayHeight);
            rayGrad.addColorStop(0, `rgba(255, 255, 200, ${alpha * 1.5})`);
            rayGrad.addColorStop(0.3, `rgba(255, 255, 180, ${alpha})`);
            rayGrad.addColorStop(0.7, `rgba(255, 255, 150, ${alpha * 0.5})`);
            rayGrad.addColorStop(1, 'rgba(255, 255, 100, 0)');
            
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(x - topWidth / 2, 0);
            ctx.lineTo(x + topWidth / 2, 0);
            ctx.lineTo(x + bottomWidth / 2, rayHeight);
            ctx.lineTo(x - bottomWidth / 2, rayHeight);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    // ============================================
    // BIOLUMINESCENT MUSHROOMS - Forest floor glow
    // ============================================
    mushrooms: [],
    mushroomCount: 8,
    
    initMushrooms() {
        this.mushrooms = [];
        for (let i = 0; i < this.mushroomCount; i++) {
            this.mushrooms.push({
                x: 30 + (this.width - 60) * (i / this.mushroomCount) + (Math.random() - 0.5) * 40,
                size: 6 + Math.random() * 6,
                phase: Math.random() * Math.PI * 2,
                hue: Math.random() > 0.5 ? 180 : 280 // Cyan or purple
            });
        }
    },
    
    drawMushrooms() {
        const ctx = this.ctx;
        const groundY = this.height - 50;
        
        // Initialize on first call
        if (this.mushrooms.length === 0) {
            this.initMushrooms();
        }
        
        for (const shroom of this.mushrooms) {
            // Pulsing glow
            const pulse = (Math.sin(this.time * 0.025 + shroom.phase) + 1) / 2;
            const glowAlpha = 0.4 + pulse * 0.4;
            
            const x = shroom.x;
            const y = groundY - 5;
            const size = shroom.size;
            
            // Stem
            ctx.fillStyle = ColorUtils.withAlpha('#4a3728', 0.8);
            ctx.fillRect(x - size * 0.15, y - size * 0.8, size * 0.3, size * 0.8);
            
            // Glowing cap
            const capColor = shroom.hue === 180 ? 
                `hsla(${shroom.hue}, 100%, 70%, ${glowAlpha})` : 
                `hsla(${shroom.hue}, 80%, 60%, ${glowAlpha})`;
            
            // Outer glow
            const glowGrad = ctx.createRadialGradient(x, y - size, 0, x, y - size, size * 2);
            glowGrad.addColorStop(0, capColor);
            glowGrad.addColorStop(0.5, `hsla(${shroom.hue}, 100%, 50%, ${glowAlpha * 0.3})`);
            glowGrad.addColorStop(1, `hsla(${shroom.hue}, 100%, 50%, 0)`);
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y - size, size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Mushroom cap
            const capGrad = ctx.createRadialGradient(x, y - size * 1.2, 0, x, y - size, size);
            capGrad.addColorStop(0, `hsla(${shroom.hue}, 100%, 80%, 1)`);
            capGrad.addColorStop(0.7, `hsla(${shroom.hue}, 90%, 50%, 1)`);
            capGrad.addColorStop(1, `hsla(${shroom.hue}, 80%, 30%, 1)`);
            
            ctx.fillStyle = capGrad;
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.8, size, size * 0.6, 0, Math.PI, 0);
            ctx.fill();
            
            // Spots on cap
            ctx.fillStyle = `hsla(${shroom.hue}, 100%, 90%, ${0.5 + pulse * 0.3})`;
            ctx.beginPath();
            ctx.arc(x - size * 0.3, y - size, size * 0.15, 0, Math.PI * 2);
            ctx.arc(x + size * 0.2, y - size * 0.9, size * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // ============================================
    // MIST PARTICLES - Drifting atmosphere
    // ============================================
    mistParticles: [],
    mistCount: 15,
    
    initMist() {
        this.mistParticles = [];
        for (let i = 0; i < this.mistCount; i++) {
            this.mistParticles.push({
                x: Math.random() * this.width * 1.5,
                y: this.height * 0.3 + Math.random() * this.height * 0.4,
                width: 80 + Math.random() * 120,
                height: 20 + Math.random() * 30,
                speed: 0.2 + Math.random() * 0.3,
                alpha: 0.05 + Math.random() * 0.08
            });
        }
    },
    
    drawMist() {
        const ctx = this.ctx;
        
        // Initialize on first call
        if (this.mistParticles.length === 0) {
            this.initMist();
        }
        
        for (const mist of this.mistParticles) {
            // Drift slowly to the right
            mist.x += mist.speed;
            
            // Wrap around
            if (mist.x > this.width + mist.width) {
                mist.x = -mist.width;
            }
            
            // Soft elliptical mist patch
            const mistGrad = ctx.createRadialGradient(
                mist.x, mist.y, 0,
                mist.x, mist.y, mist.width / 2
            );
            mistGrad.addColorStop(0, `rgba(200, 230, 210, ${mist.alpha})`);
            mistGrad.addColorStop(0.6, `rgba(220, 240, 220, ${mist.alpha * 0.5})`);
            mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = mistGrad;
            ctx.beginPath();
            ctx.ellipse(mist.x, mist.y, mist.width / 2, mist.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // ============================================
    // MAIN RENDER
    // ============================================
    render(gameState, constants) {
        const { bird, pipes, bgX, currentState, score } = gameState;
        const { PIPE_WIDTH, BIRD_SIZE, GameState } = constants;
        
        this.time++;
        
        // Draw background (pre-rendered with atmospheric perspective)
        this.drawBackground(bgX);
        
        // Draw volumetric light rays through canopy
        this.drawLightRays();
        
        // Draw drifting mist
        this.drawMist();
        
        // Draw pipes (organic tree trunks with proper material logic)
        for (const pipe of pipes) {
            this.drawPipe(pipe, PIPE_WIDTH);
        }
        
        // Draw ground (with value bridging and organic elements)
        this.drawGround();
        
        // Draw bioluminescent mushrooms on forest floor
        this.drawMushrooms();
        
        // Draw fireflies
        this.drawFireflies();
        
        // Draw bird (soft gradients, proper form)
        this.drawBird(bird, BIRD_SIZE);
        
        // Update score display
        if (currentState === GameState.PLAYING) {
            const scoreEl = document.getElementById('scoreDisplay');
            if (scoreEl) scoreEl.textContent = score;
        }
    }
};
