// ============================================================================
// FOREST TEMPLE AT SUNSET - ART STUDY 007
// ============================================================================
//
// SCENE CONCEPT:
// A ruined stone temple in a forest clearing, lit by golden hour sunset.
// Temple partially reclaimed by nature - vines, moss on ancient columns.
//
// TECHNIQUE PHILOSOPHY:
// "Use what the scene NEEDS, not everything we KNOW"
//
// FOCAL POINT: Temple columns (5-value treatment)
// SUPPORTING: Light shafts, cast shadows
// ATMOSPHERE: Forest backdrop (lost edges, depth)
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// COLOR PALETTE - Warm sunset vs cool shadows
// =============================================================================

const COLORS = {
    // Sky - warm at horizon, cooler above
    skyTop: '#2a3550',
    skyMid: '#6a5060',
    skyHorizon: '#d08050',
    sunGlow: '#ffb060',
    
    // Forest - cool, desaturated with distance
    forestFar: '#2a3535',
    forestMid: '#354030',
    forestNear: '#405030',
    
    // Ground - warm where lit, cool in shadow
    groundLit: '#7a6040',
    groundShadow: '#35302a',
    
    // Temple stone - warm highlights, cool shadows
    stoneLight: '#d0b090',
    stoneMid: '#a08060',
    stoneShadow: '#504035',
    stoneDeep: '#302520',
    
    // Light
    sunlight: '#ffd080',
    ambient: '#405060',
};

// =============================================================================
// UTILITIES
// =============================================================================

let seed = 12345;
function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function resetSeed(val) {
    seed = val;
}

// Deterministic random for specific value - useful when not in sequence
function seededRandom(seedVal) {
    const s = (seedVal * 9301 + 49297) % 233280;
    return s / 233280;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function withAlpha(color, alpha) {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.startsWith('rgb(')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    }
    return color;
}

// =============================================================================
// CHUNK 1: SKY
// Simple gradient - warm bottom (sunset), cool top
// =============================================================================

function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    grad.addColorStop(0, COLORS.skyTop);
    grad.addColorStop(0.5, COLORS.skyMid);
    grad.addColorStop(0.85, COLORS.skyHorizon);
    grad.addColorStop(1, COLORS.sunGlow);
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H * 0.5);
    
    // Sun glow - soft radial at horizon (off-center left for interest)
    const sunX = W * 0.3;
    const sunY = H * 0.42;
    
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.4);
    sunGrad.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
    sunGrad.addColorStop(0.3, 'rgba(255, 180, 80, 0.15)');
    sunGrad.addColorStop(0.6, 'rgba(255, 150, 60, 0.05)');
    sunGrad.addColorStop(1, 'rgba(255, 150, 60, 0)');
    
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, W, H * 0.6);
}

// =============================================================================
// CHUNK 1: DISTANT FOREST
// Multiple layers with LOST EDGES - no hard silhouettes
// Each layer: cooler, less saturated, less contrast
// =============================================================================

function drawDistantForest() {
    // Layer 1: Furthest - almost merged with sky (lost edge)
    resetSeed(100);
    drawTreelineLayer(H * 0.38, H * 0.15, COLORS.forestFar, 0.4, 'far');
    
    // Layer 2: Mid-distance
    resetSeed(200);
    drawTreelineLayer(H * 0.42, H * 0.2, COLORS.forestMid, 0.6, 'mid');
    
    // Layer 3: Closer - more definition but still atmospheric
    resetSeed(300);
    drawTreelineLayer(H * 0.48, H * 0.25, COLORS.forestNear, 0.8, 'near');
}

function drawTreelineLayer(baseY, maxHeight, color, opacity, layer) {
    // FIXED: No more zig-zag. Use CLUSTERED SHAPES - tree masses, not sine waves
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const grad = ctx.createLinearGradient(0, baseY - maxHeight, 0, baseY + 20);
    grad.addColorStop(0, withAlpha(color, 0.7));
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, withAlpha(color, 0.9));
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, baseY);
    
    // Build treeline from CLUSTERS of trees, not mathematical waves
    // Each cluster is a group of 2-4 trees with varying heights
    
    let x = 0;
    while (x < W + 50) {
        // Cluster width
        const clusterWidth = 60 + random() * 100;
        const clusterTrees = 2 + Math.floor(random() * 3);
        const clusterBaseHeight = maxHeight * (0.4 + random() * 0.4);
        
        // Draw trees in this cluster
        for (let t = 0; t < clusterTrees; t++) {
            const treeX = x + (t / clusterTrees) * clusterWidth + random() * 20;
            const treeHeight = clusterBaseHeight * (0.7 + random() * 0.6);
            const treeWidth = 25 + random() * 40;
            
            // Tree crown - rounded bump, not triangle
            const peakY = baseY - treeHeight;
            
            // Approach the tree
            ctx.lineTo(treeX - treeWidth * 0.5, baseY - treeHeight * 0.2);
            
            // Up the left side with slight wobble
            ctx.quadraticCurveTo(
                treeX - treeWidth * 0.4, peakY + treeHeight * 0.3,
                treeX - treeWidth * 0.15, peakY + random() * 10
            );
            
            // Crown top - irregular, not smooth
            ctx.quadraticCurveTo(
                treeX, peakY - 5 - random() * 10,
                treeX + treeWidth * 0.15, peakY + random() * 15
            );
            
            // Down the right side
            ctx.quadraticCurveTo(
                treeX + treeWidth * 0.4, peakY + treeHeight * 0.35,
                treeX + treeWidth * 0.5, baseY - treeHeight * 0.15
            );
        }
        
        // Gap between clusters (varying)
        x += clusterWidth + random() * 30;
        
        // Small dip between clusters
        ctx.lineTo(x, baseY - maxHeight * 0.1 - random() * maxHeight * 0.2);
    }
    
    ctx.lineTo(W, baseY);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    
    // LAYER 2: Soft value variation within the silhouette
    // "Soft silhouette noise, not shape noise"
    if (layer !== 'far') {
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const patchX = random() * W;
            const patchY = baseY - maxHeight * (0.3 + random() * 0.5);
            const patchSize = 50 + random() * 100;
            
            const patchGrad = ctx.createRadialGradient(patchX, patchY, 0, patchX, patchY, patchSize);
            // Very subtle - just enough to break uniformity
            if (random() > 0.5) {
                patchGrad.addColorStop(0, `rgba(0, 0, 0, ${0.02 + random() * 0.02})`);
            } else {
                patchGrad.addColorStop(0, `rgba(80, 90, 70, ${0.02 + random() * 0.02})`);
            }
            patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = patchGrad;
            ctx.fillRect(0, baseY - maxHeight, W, maxHeight);
        }
        ctx.restore();
    }
    
    // Soft top edge fade for atmosphere
    if (layer !== 'far') {
        const fadeGrad = ctx.createLinearGradient(0, baseY - maxHeight, 0, baseY - maxHeight * 0.5);
        fadeGrad.addColorStop(0, 'rgba(42, 53, 53, 0.4)');
        fadeGrad.addColorStop(1, 'rgba(42, 53, 53, 0)');
        
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, baseY - maxHeight - 20, W, maxHeight * 0.6);
    }
    
    ctx.restore();
}

// =============================================================================
// CHUNK 1: GROUND PLANE
// Simple gradient - lit areas warm, shadowed areas cool
// =============================================================================

function drawGround() {
    const groundY = H * 0.55;
    
    // Base ground gradient
    const grad = ctx.createLinearGradient(0, groundY, 0, H);
    grad.addColorStop(0, COLORS.groundLit);
    grad.addColorStop(0.3, '#5a4a38');
    grad.addColorStop(1, COLORS.groundShadow);
    
    ctx.fillStyle = grad;
    
    // Slightly uneven top edge - not perfectly straight
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, groundY);
    
    for (let x = 0; x <= W; x += 15) {
        const variation = Math.sin(x * 0.02) * 2 + (seededRandom(x + 999) - 0.5) * 3;
        ctx.lineTo(x, groundY + variation);
    }
    
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    
    // LAYER 2: SURFACE VARIATION - HUGE scale, VERY low contrast
    // "Sand having subtle uneven tone" - barely visible but destroys vector look
    ctx.save();
    resetSeed(555);
    
    // Few LARGE patches, very subtle
    for (let i = 0; i < 4; i++) {
        const patchX = W * (0.1 + random() * 0.8);
        const patchY = groundY + (H - groundY) * (0.2 + random() * 0.6);
        // HUGE - 30-50% of ground width
        const patchSize = W * (0.3 + random() * 0.2);
        
        const patchGrad = ctx.createRadialGradient(
            patchX, patchY, 0,
            patchX, patchY, patchSize
        );
        // VERY low contrast - 0.03-0.05 opacity
        if (random() > 0.5) {
            patchGrad.addColorStop(0, `rgba(30, 25, 20, ${0.03 + random() * 0.02})`);
        } else {
            patchGrad.addColorStop(0, `rgba(180, 160, 120, ${0.02 + random() * 0.02})`);
        }
        patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = patchGrad;
        ctx.fillRect(0, groundY, W, H - groundY);
    }
    ctx.restore();
    
    // LAYER 4: ACCUMULATION - darker where feet would tread (paths)
    // Very subtle worn areas near temple
    ctx.save();
    const pathGrad = ctx.createRadialGradient(W * 0.5, groundY + 30, 0, W * 0.5, groundY + 80, W * 0.25);
    pathGrad.addColorStop(0, 'rgba(40, 35, 30, 0.08)');
    pathGrad.addColorStop(0.6, 'rgba(40, 35, 30, 0.03)');
    pathGrad.addColorStop(1, 'rgba(40, 35, 30, 0)');
    ctx.fillStyle = pathGrad;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.restore();
    
    // Slight warm glow from sun direction (left side)
    const warmGrad = ctx.createLinearGradient(0, groundY, W * 0.6, groundY);
    warmGrad.addColorStop(0, 'rgba(200, 150, 80, 0.12)');
    warmGrad.addColorStop(1, 'rgba(200, 150, 80, 0)');
    
    ctx.fillStyle = warmGrad;
    ctx.fillRect(0, groundY, W, H * 0.3);
    
    return groundY;
}

// =============================================================================
// CHUNK 2: LIGHT SHAFTS
// Golden hour light streaming through trees
// DIFFERENT from underwater: warmer, sparser, more contrast
// =============================================================================

function drawLightShafts() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Light source position (sun)
    const sunX = W * 0.3;
    const sunY = H * 0.42;
    
    // Shafts radiate from sun position through gaps in trees
    // Key: SPARSE - only a few strong shafts, not uniform like underwater
    const shafts = [
        { angle: -25, width: 60, length: 0.85, opacity: 0.18 },
        { angle: -10, width: 90, length: 0.95, opacity: 0.22 },  // Main shaft
        { angle: 5, width: 50, length: 0.75, opacity: 0.14 },
        { angle: 20, width: 70, length: 0.88, opacity: 0.16 },
        { angle: 40, width: 45, length: 0.70, opacity: 0.10 },
        // A few faint secondary shafts
        { angle: -18, width: 30, length: 0.60, opacity: 0.06 },
        { angle: 30, width: 35, length: 0.55, opacity: 0.05 },
    ];
    
    for (const shaft of shafts) {
        const angleRad = shaft.angle * Math.PI / 180;
        const endY = H * shaft.length;
        const endX = sunX + Math.tan(angleRad) * (endY - sunY);
        
        // Shaft widens as it travels
        const topWidth = shaft.width * 0.4;
        const bottomWidth = shaft.width * 2;
        
        // Gradient: bright near sun, fades as it travels
        const shaftGrad = ctx.createLinearGradient(sunX, sunY, endX, endY);
        shaftGrad.addColorStop(0, `rgba(255, 210, 130, ${shaft.opacity})`);
        shaftGrad.addColorStop(0.3, `rgba(255, 190, 100, ${shaft.opacity * 0.7})`);
        shaftGrad.addColorStop(0.6, `rgba(255, 170, 80, ${shaft.opacity * 0.3})`);
        shaftGrad.addColorStop(1, 'rgba(255, 150, 60, 0)');
        
        ctx.fillStyle = shaftGrad;
        ctx.beginPath();
        
        // Calculate perpendicular offset for width
        const perpAngle = angleRad + Math.PI / 2;
        const topOffsetX = Math.cos(perpAngle) * topWidth / 2;
        const topOffsetY = Math.sin(perpAngle) * topWidth / 2;
        const bottomOffsetX = Math.cos(perpAngle) * bottomWidth / 2;
        const bottomOffsetY = Math.sin(perpAngle) * bottomWidth / 2;
        
        ctx.moveTo(sunX - topOffsetX, sunY - topOffsetY);
        ctx.lineTo(sunX + topOffsetX, sunY + topOffsetY);
        ctx.lineTo(endX + bottomOffsetX, endY + bottomOffsetY);
        ctx.lineTo(endX - bottomOffsetX, endY - bottomOffsetY);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// =============================================================================
// CHUNK 2: DAPPLED LIGHT ON GROUND
// Spots where light shafts hit the ground
// =============================================================================

function drawDappledLight(groundY) {
    ctx.save();
    
    resetSeed(500);
    
    // Light pools where shafts hit ground
    // Concentrated in areas where shafts would land
    const lightPools = [
        { x: W * 0.25, y: groundY + H * 0.15, size: 80 },
        { x: W * 0.4, y: groundY + H * 0.08, size: 60 },
        { x: W * 0.55, y: groundY + H * 0.12, size: 50 },
        { x: W * 0.7, y: groundY + H * 0.18, size: 45 },
    ];
    
    for (const pool of lightPools) {
        // Main warm pool
        const poolGrad = ctx.createRadialGradient(
            pool.x, pool.y, 0,
            pool.x, pool.y, pool.size
        );
        poolGrad.addColorStop(0, 'rgba(255, 200, 120, 0.25)');
        poolGrad.addColorStop(0.4, 'rgba(255, 180, 100, 0.12)');
        poolGrad.addColorStop(1, 'rgba(255, 160, 80, 0)');
        
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.ellipse(pool.x, pool.y, pool.size, pool.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Scattered smaller light spots (leaf dapple)
    for (let i = 0; i < 30; i++) {
        const x = W * 0.15 + random() * W * 0.7;
        const y = groundY + random() * H * 0.35;
        const size = 8 + random() * 20;
        const opacity = 0.08 + random() * 0.1;
        
        const dappleGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
        dappleGrad.addColorStop(0, `rgba(255, 200, 130, ${opacity})`);
        dappleGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
        
        ctx.fillStyle = dappleGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.5, random() * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// =============================================================================
// CHUNK 3: TEMPLE STRUCTURE
// This is the FOCAL POINT - full 5-value treatment
// Stone columns with proper lighting, cast shadows
// =============================================================================
// EDGE ENTROPY UTILITIES
// "Never replace a straight line with a curve. Damage it slightly."
// =============================================================================

// Draw a "damaged" rectangle - edges have micro-perturbation
function drawDamagedRect(x, y, width, height, damage = 2) {
    ctx.beginPath();
    
    // Left edge - slightly damaged
    let currentY = y;
    ctx.moveTo(x + (random() - 0.5) * damage, y);
    while (currentY < y + height) {
        currentY += 8 + random() * 12;
        const offset = (random() - 0.5) * damage;
        ctx.lineTo(x + offset, Math.min(currentY, y + height));
    }
    
    // Bottom edge
    let currentX = x;
    while (currentX < x + width) {
        currentX += 8 + random() * 12;
        const offset = (random() - 0.5) * damage * 0.5;
        ctx.lineTo(Math.min(currentX, x + width), y + height + offset);
    }
    
    // Right edge - damaged
    currentY = y + height;
    while (currentY > y) {
        currentY -= 8 + random() * 12;
        const offset = (random() - 0.5) * damage;
        ctx.lineTo(x + width + offset, Math.max(currentY, y));
    }
    
    // Top edge
    currentX = x + width;
    while (currentX > x) {
        currentX -= 8 + random() * 12;
        const offset = (random() - 0.5) * damage * 0.5;
        ctx.lineTo(Math.max(currentX, x), y + offset);
    }
    
    ctx.closePath();
}

// =============================================================================
// THE 4 TEXTURE LAYERS
// Layer 1: Form (clean shapes, gradients) - already done in drawing functions
// Layer 2: Surface variation - HUGE scale, VERY low contrast, barely visible
// Layer 3: Edge damage - texture concentrates at edges, corners, bases
// Layer 4: Accumulation - dirt, moss, sediment (tells a story)
//
// GOLDEN RULE: Texture amplitude < edge thickness
// =============================================================================

// LAYER 2: Surface Variation
// "Stone not being perfectly flat" - destroys vector look, keeps forms readable
function addSurfaceVariation(x, y, width, height, seed = 0) {
    ctx.save();
    resetSeed(seed || Math.round(x * 77 + y * 33));
    
    // HUGE scale patches - barely visible value shifts
    // This is the "most important" layer we were missing
    const patchCount = Math.max(2, Math.floor((width * height) / 3000));
    
    for (let i = 0; i < patchCount; i++) {
        const patchX = x + random() * width;
        const patchY = y + random() * height;
        // HUGE scale - 40-80% of the surface
        const patchSize = Math.min(width, height) * (0.4 + random() * 0.4);
        
        const patchGrad = ctx.createRadialGradient(patchX, patchY, 0, patchX, patchY, patchSize);
        
        // VERY low contrast - opacity 0.03-0.06, almost boring
        if (random() > 0.5) {
            // Slightly darker patch
            patchGrad.addColorStop(0, `rgba(0, 0, 0, ${0.03 + random() * 0.03})`);
        } else {
            // Slightly lighter patch (warm, like sun-bleached stone)
            patchGrad.addColorStop(0, `rgba(255, 240, 200, ${0.02 + random() * 0.02})`);
        }
        patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = patchGrad;
        ctx.fillRect(x, y, width, height);
    }
    
    ctx.restore();
}

// LAYER 3: Edge Darkening (not cracks - just darker values at edges)
// "Weather hits edges, hands touch edges, erosion happens at edges"
function addEdgeDarkening(x, y, width, height) {
    ctx.save();
    
    // Left edge - slightly darker (away from light)
    const leftEdge = ctx.createLinearGradient(x, 0, x + width * 0.15, 0);
    leftEdge.addColorStop(0, 'rgba(30, 25, 20, 0.08)');
    leftEdge.addColorStop(1, 'rgba(30, 25, 20, 0)');
    ctx.fillStyle = leftEdge;
    ctx.fillRect(x, y, width * 0.2, height);
    
    // Right edge - darker (shadow side)
    const rightEdge = ctx.createLinearGradient(x + width * 0.85, 0, x + width, 0);
    rightEdge.addColorStop(0, 'rgba(20, 15, 10, 0)');
    rightEdge.addColorStop(1, 'rgba(20, 15, 10, 0.12)');
    ctx.fillStyle = rightEdge;
    ctx.fillRect(x + width * 0.8, y, width * 0.2, height);
    
    ctx.restore();
}

// LAYER 3b: Base/Contact Darkening
// "Age accumulates at base, where moisture collects"
function addBaseDarkening(x, y, width, height) {
    ctx.save();
    
    // Gradient from bottom up - very subtle
    const baseGrad = ctx.createLinearGradient(0, y + height - height * 0.15, 0, y + height);
    baseGrad.addColorStop(0, 'rgba(20, 15, 10, 0)');
    baseGrad.addColorStop(0.6, 'rgba(20, 15, 10, 0.08)');
    baseGrad.addColorStop(1, 'rgba(15, 10, 5, 0.15)');
    
    ctx.fillStyle = baseGrad;
    ctx.fillRect(x - 3, y + height - height * 0.15, width + 6, height * 0.15 + 5);
    
    ctx.restore();
}

// LAYER 3c: Corner softening (where two surfaces meet)
function addCornerDarkening(x, y, width, height) {
    ctx.save();
    
    // Bottom-left corner
    const blGrad = ctx.createRadialGradient(x, y + height, 0, x, y + height, width * 0.3);
    blGrad.addColorStop(0, 'rgba(20, 15, 10, 0.1)');
    blGrad.addColorStop(1, 'rgba(20, 15, 10, 0)');
    ctx.fillStyle = blGrad;
    ctx.fillRect(x - 5, y + height - width * 0.3, width * 0.4, width * 0.35);
    
    // Bottom-right corner (darker - shadow side)
    const brGrad = ctx.createRadialGradient(x + width, y + height, 0, x + width, y + height, width * 0.35);
    brGrad.addColorStop(0, 'rgba(15, 10, 5, 0.12)');
    brGrad.addColorStop(1, 'rgba(15, 10, 5, 0)');
    ctx.fillStyle = brGrad;
    ctx.fillRect(x + width - width * 0.4, y + height - width * 0.35, width * 0.45, width * 0.4);
    
    ctx.restore();
}

// LAYER 4: Vertical Streaking (directional texture - respects gravity)
// "Water runs down, leaving traces"
function addVerticalStreaking(x, y, width, height, seed = 0) {
    ctx.save();
    resetSeed(seed || Math.round(x * 55));
    
    // Few streaks, very subtle, vertical direction
    const streakCount = 2 + Math.floor(random() * 2);
    
    for (let i = 0; i < streakCount; i++) {
        const streakX = x + width * 0.2 + random() * width * 0.6;
        const streakWidth = 3 + random() * 6;
        
        const streakGrad = ctx.createLinearGradient(0, y, 0, y + height);
        // Starts faint, gets slightly darker toward bottom (water/dirt accumulation)
        streakGrad.addColorStop(0, 'rgba(40, 35, 30, 0)');
        streakGrad.addColorStop(0.2, `rgba(40, 35, 30, ${0.02 + random() * 0.02})`);
        streakGrad.addColorStop(0.8, `rgba(35, 30, 25, ${0.04 + random() * 0.03})`);
        streakGrad.addColorStop(1, 'rgba(30, 25, 20, 0.06)');
        
        ctx.fillStyle = streakGrad;
        ctx.fillRect(streakX, y, streakWidth, height);
    }
    
    ctx.restore();
}

// Combined texture application for columns
// Applies layers 2, 3, 4 in correct order
function applyColumnTexture(x, y, width, height) {
    // Layer 2: Surface variation (huge, subtle)
    addSurfaceVariation(x, y, width, height);
    
    // Layer 3: Edge damage (concentrated at edges, corners, base)
    addEdgeDarkening(x, y, width, height);
    addBaseDarkening(x, y, width, height);
    addCornerDarkening(x, y, width, height);
    
    // Layer 4: Accumulation (directional - gravity)
    addVerticalStreaking(x, y, width, height);
}

// =============================================================================

// Stone column with 5-value lighting + PROPER TEXTURE LAYERS
// Layer 1: Form (gradient), Layer 2: Surface variation, Layer 3: Edge damage, Layer 4: Accumulation
function drawColumn(x, baseY, width, height, lightIntensity = 1) {
    const topY = baseY - height;
    
    // LAYER 1: FORM - Clean gradients, clear lighting
    const highlight = `rgb(${Math.round(220 * lightIntensity)}, ${Math.round(190 * lightIntensity)}, ${Math.round(150 * lightIntensity)})`;
    const light = `rgb(${Math.round(190 * lightIntensity)}, ${Math.round(160 * lightIntensity)}, ${Math.round(120 * lightIntensity)})`;
    const halftone = `rgb(${Math.round(140 * lightIntensity)}, ${Math.round(115 * lightIntensity)}, ${Math.round(90 * lightIntensity)})`;
    const coreShadow = `rgb(${Math.round(70 * lightIntensity + 20)}, ${Math.round(55 * lightIntensity + 15)}, ${Math.round(45 * lightIntensity + 10)})`;
    const reflected = `rgb(${Math.round(90 * lightIntensity + 10)}, ${Math.round(75 * lightIntensity + 10)}, ${Math.round(60 * lightIntensity + 10)})`;
    
    // Column body - 5-value gradient
    const bodyGrad = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);
    bodyGrad.addColorStop(0, highlight);
    bodyGrad.addColorStop(0.15, light);
    bodyGrad.addColorStop(0.4, halftone);
    bodyGrad.addColorStop(0.7, coreShadow);
    bodyGrad.addColorStop(0.92, reflected);
    bodyGrad.addColorStop(1, coreShadow);
    
    // Draw column body with slightly damaged edges (not cracks - just imperfect edges)
    ctx.fillStyle = bodyGrad;
    resetSeed(Math.round(x * 100));
    drawDamagedRect(x - width/2, topY, width, height, 1.5); // Reduced damage amount
    ctx.fill();
    
    // Column capital
    const capHeight = width * 0.35;
    const capWidth = width * 1.3;
    
    const capGrad = ctx.createLinearGradient(x - capWidth/2, 0, x + capWidth/2, 0);
    capGrad.addColorStop(0, `rgb(${Math.round(240 * lightIntensity)}, ${Math.round(210 * lightIntensity)}, ${Math.round(170 * lightIntensity)})`);
    capGrad.addColorStop(0.5, `rgb(${Math.round(200 * lightIntensity)}, ${Math.round(170 * lightIntensity)}, ${Math.round(130 * lightIntensity)})`);
    capGrad.addColorStop(1, halftone);
    
    ctx.fillStyle = capGrad;
    resetSeed(Math.round(x * 200));
    drawDamagedRect(x - capWidth/2, topY - capHeight, capWidth, capHeight, 2);
    ctx.fill();
    
    // Column base
    const baseHeight = width * 0.3;
    const baseWidth = width * 1.2;
    
    const baseGrad = ctx.createLinearGradient(x - baseWidth/2, 0, x + baseWidth/2, 0);
    baseGrad.addColorStop(0, light);
    baseGrad.addColorStop(0.4, halftone);
    baseGrad.addColorStop(0.8, coreShadow);
    baseGrad.addColorStop(1, reflected);
    
    ctx.fillStyle = baseGrad;
    resetSeed(Math.round(x * 300));
    drawDamagedRect(x - baseWidth/2, baseY - baseHeight, baseWidth, baseHeight, 2);
    ctx.fill();
    
    // LAYERS 2, 3, 4: Apply texture system to column body
    applyColumnTexture(x - width/2, topY, width, height);
    
    // Also texture capital (less - it's higher, less weathered)
    addSurfaceVariation(x - capWidth/2, topY - capHeight, capWidth, capHeight);
    
    // Base gets MORE texture (dirt accumulation, ground contact)
    addSurfaceVariation(x - baseWidth/2, baseY - baseHeight, baseWidth, baseHeight);
    addBaseDarkening(x - baseWidth/2, baseY - baseHeight, baseWidth, baseHeight);
    addCornerDarkening(x - baseWidth/2, baseY - baseHeight, baseWidth, baseHeight);
    
    return { x, topY, width, height, baseY };
}

// Cast shadow from column onto ground
function drawColumnShadow(column, groundY) {
    // Shadow direction: to the right (light from left)
    // Shadow length depends on sun angle (low sun = long shadows)
    
    const shadowLength = column.height * 1.2;  // Long evening shadow
    const shadowEndX = column.x + shadowLength;
    
    // Shadow on ground - perspective skew
    ctx.save();
    
    // Shadow gradient - darker near column, fades at end
    const shadowGrad = ctx.createLinearGradient(column.x, groundY, shadowEndX, groundY);
    shadowGrad.addColorStop(0, 'rgba(20, 15, 10, 0.5)');
    shadowGrad.addColorStop(0.3, 'rgba(20, 15, 10, 0.35)');
    shadowGrad.addColorStop(0.7, 'rgba(20, 15, 10, 0.15)');
    shadowGrad.addColorStop(1, 'rgba(20, 15, 10, 0)');
    
    ctx.fillStyle = shadowGrad;
    
    // Shadow shape - trapezoid (wider at end due to perspective)
    const baseWidth = column.width * 0.6;
    const endWidth = column.width * 1.5;
    
    ctx.beginPath();
    ctx.moveTo(column.x - baseWidth/2, groundY);
    ctx.lineTo(column.x + baseWidth/2, groundY);
    ctx.lineTo(shadowEndX + endWidth/2, groundY + 10);
    ctx.lineTo(shadowEndX - endWidth/2, groundY + 10);
    ctx.closePath();
    ctx.fill();
    
    // Contact shadow - dark right at column base
    const contactGrad = ctx.createRadialGradient(
        column.x + column.width * 0.3, groundY, 0,
        column.x + column.width * 0.3, groundY, column.width
    );
    contactGrad.addColorStop(0, 'rgba(15, 10, 5, 0.6)');
    contactGrad.addColorStop(0.5, 'rgba(15, 10, 5, 0.2)');
    contactGrad.addColorStop(1, 'rgba(15, 10, 5, 0)');
    
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(column.x + column.width * 0.2, groundY, column.width, column.width * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Temple platform/base
function drawTemplePlatform(groundY) {
    const platformY = groundY;
    const platformHeight = 30;
    const platformLeft = W * 0.25;
    const platformRight = W * 0.75;
    
    // Platform top (slightly lit) - with damaged edges
    const topGrad = ctx.createLinearGradient(0, platformY - platformHeight, 0, platformY);
    topGrad.addColorStop(0, '#8a7a60');
    topGrad.addColorStop(1, '#6a5a45');
    
    ctx.fillStyle = topGrad;
    
    // Draw platform top with slightly damaged edges
    ctx.beginPath();
    const left = platformLeft;
    const right = platformRight;
    const top = platformY - platformHeight;
    
    ctx.moveTo(left - 2 + random() * 4, top + random() * 3);
    // Top edge with slight damage
    for (let x = left; x <= right; x += 20) {
        ctx.lineTo(x + random() * 2 - 1, top + random() * 2);
    }
    ctx.lineTo(right + 2 - random() * 4, top + random() * 3);
    // Right edge
    ctx.lineTo(right + random() * 2, platformY - random() * 2);
    // Bottom
    ctx.lineTo(left - random() * 2, platformY + random() * 2);
    ctx.closePath();
    ctx.fill();
    
    // Platform front face - in shadow, also damaged
    ctx.fillStyle = '#4a4035';
    ctx.beginPath();
    ctx.moveTo(left - random() * 2, platformY);
    for (let x = left; x <= right; x += 25) {
        ctx.lineTo(x + random() * 2 - 1, platformY + random() * 1);
    }
    ctx.lineTo(right + random() * 2, platformY);
    ctx.lineTo(right - random() * 3, platformY + 15 + random() * 2);
    ctx.lineTo(left + random() * 3, platformY + 15 - random() * 2);
    ctx.closePath();
    ctx.fill();
    
    // LAYER 2: Surface variation on platform
    addSurfaceVariation(left, platformY - platformHeight, right - left, platformHeight + 15);
    
    // Steps leading up - with subtle age
    const stepWidth = 120;
    const stepHeight = 8;
    const stepDepth = 12;
    
    resetSeed(777);
    for (let i = 0; i < 3; i++) {
        const stepY = platformY + (i * stepDepth);
        const stepW = stepWidth + i * 20;
        const stepX = W * 0.5 - stepW/2;
        
        // Subtle height variation (age = settling) - REDUCED from before
        const heightVar = random() * 1 - 0.5;
        const tiltVar = random() * 0.8 - 0.4;
        
        // Step top with gradient
        const stepTopGrad = ctx.createLinearGradient(stepX, stepY, stepX + stepW, stepY);
        stepTopGrad.addColorStop(0, '#9a8a70');
        stepTopGrad.addColorStop(0.5, '#7a6a55');
        stepTopGrad.addColorStop(1, '#5a4a3a');
        
        ctx.fillStyle = stepTopGrad;
        
        // Slightly damaged step top - reduced damage amount
        ctx.beginPath();
        ctx.moveTo(stepX + random() * 1, stepY + heightVar);
        for (let x = stepX; x <= stepX + stepW; x += 20) {
            ctx.lineTo(x + random() * 1 - 0.5, stepY + heightVar + tiltVar * ((x - stepX) / stepW));
        }
        ctx.lineTo(stepX + stepW - random() * 1, stepY + stepHeight);
        ctx.lineTo(stepX + random() * 1, stepY + stepHeight);
        ctx.closePath();
        ctx.fill();
        
        // Step front - darker
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath();
        ctx.moveTo(stepX, stepY + stepHeight);
        ctx.lineTo(stepX + stepW, stepY + stepHeight);
        ctx.lineTo(stepX + stepW - random() * 2, stepY + stepDepth + random());
        ctx.lineTo(stepX + random() * 2, stepY + stepDepth - random() * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // LAYER 3: Edge darkening at step corners
        // Subtle shadow where step meets ground
        const stepOcclusion = ctx.createLinearGradient(0, stepY + stepDepth - 4, 0, stepY + stepDepth);
        stepOcclusion.addColorStop(0, 'rgba(20, 15, 10, 0)');
        stepOcclusion.addColorStop(1, 'rgba(20, 15, 10, 0.1)');
        ctx.fillStyle = stepOcclusion;
        ctx.fillRect(stepX, stepY + stepDepth - 4, stepW, 5);
    }
    
    return platformY - platformHeight;
}

// Draw all temple elements
function drawTemple(groundY) {
    // Platform first
    const platformTop = drawTemplePlatform(groundY);
    
    // Columns - arranged in front row
    // Main columns (larger, focal)
    const columns = [];
    
    // Back row (partially visible, lower contrast)
    columns.push(drawColumn(W * 0.35, platformTop, 35, 150, 0.7));
    columns.push(drawColumn(W * 0.5, platformTop, 35, 150, 0.75));
    columns.push(drawColumn(W * 0.65, platformTop, 35, 150, 0.65));
    
    // Front row (main focal point)
    columns.push(drawColumn(W * 0.3, groundY - 5, 45, 180, 1.0));   // Brightest, closest to sun
    columns.push(drawColumn(W * 0.5, groundY - 5, 50, 200, 0.95));  // Central, tallest
    columns.push(drawColumn(W * 0.7, groundY - 5, 45, 175, 0.85)); // Further from sun
    
    // Cast shadows for front columns
    drawColumnShadow(columns[3], groundY);
    drawColumnShadow(columns[4], groundY);
    drawColumnShadow(columns[5], groundY);
    
    return columns;
}

// =============================================================================
// CHUNK 4: NATURE INTEGRATION
// Vines on columns, moss hints, foreground plants with rim light
// Key: ORGANIC vs GEOMETRIC contrast
// =============================================================================

// Vines wrapping around columns
function drawVines(columns) {
    ctx.save();
    
    // Only add vines to some columns (not all - restraint!)
    const vineTargets = [columns[3], columns[4]];  // Front-left and center columns
    
    for (const col of vineTargets) {
        resetSeed(Math.round(col.x * 50));
        
        // Main vine - curves around column
        const vineCount = 2 + Math.floor(random() * 2);
        
        for (let v = 0; v < vineCount; v++) {
            const startY = col.topY + random() * col.height * 0.3;
            const endY = col.baseY - random() * col.height * 0.2;
            const side = random() > 0.5 ? 1 : -1;
            
            // Vine color - darker green in shadow, lighter where lit
            const vineColor = side === -1 ? '#3a5030' : '#506040';  // Left side lit
            
            ctx.strokeStyle = vineColor;
            ctx.lineWidth = 2 + random() * 2;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(col.x + side * col.width * 0.4, startY);
            
            // Vine curves around column
            let y = startY;
            while (y < endY) {
                const nextY = y + 20 + random() * 30;
                const curveOut = Math.sin((y - startY) * 0.05) * col.width * 0.3;
                const xPos = col.x + side * (col.width * 0.4 + curveOut);
                
                ctx.quadraticCurveTo(
                    xPos + random() * 10 - 5,
                    y + 10,
                    xPos,
                    nextY
                );
                y = nextY;
            }
            ctx.stroke();
            
            // Small leaves along vine
            resetSeed(Math.round(col.x * 100 + v * 50));
            y = startY + 30;
            while (y < endY - 20) {
                if (random() > 0.4) {
                    const curveOut = Math.sin((y - startY) * 0.05) * col.width * 0.3;
                    const leafX = col.x + side * (col.width * 0.4 + curveOut);
                    const leafSize = 4 + random() * 6;
                    const leafAngle = side * (0.3 + random() * 0.5);
                    
                    ctx.save();
                    ctx.translate(leafX, y);
                    ctx.rotate(leafAngle);
                    
                    // Simple leaf shape
                    ctx.fillStyle = random() > 0.5 ? '#4a6040' : '#3a5030';
                    ctx.beginPath();
                    ctx.ellipse(leafSize/2, 0, leafSize, leafSize * 0.4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.restore();
                }
                y += 15 + random() * 20;
            }
        }
    }
    
    ctx.restore();
}

// Moss patches on stone
function drawMoss(columns, groundY) {
    ctx.save();
    
    // Moss grows at base of columns and on platform
    // Concentrated in shaded areas (right side of columns)
    
    for (const col of columns.slice(3)) {  // Front columns only
        resetSeed(Math.round(col.x * 30));
        
        // Base moss
        const mossY = col.baseY || groundY;
        const mossPatches = 3 + Math.floor(random() * 3);
        
        for (let m = 0; m < mossPatches; m++) {
            const patchX = col.x + (random() - 0.3) * col.width;
            const patchY = mossY - random() * 20;
            const patchWidth = 8 + random() * 15;
            const patchHeight = 5 + random() * 10;
            
            // Moss is darker in shadow, slightly lighter where lit
            const mossColor = patchX < col.x ? '#4a6040' : '#3a5035';
            
            const mossGrad = ctx.createRadialGradient(
                patchX, patchY, 0,
                patchX, patchY, patchWidth
            );
            mossGrad.addColorStop(0, mossColor);
            mossGrad.addColorStop(0.6, withAlpha(mossColor, 0.6));
            mossGrad.addColorStop(1, withAlpha(mossColor, 0));
            
            ctx.fillStyle = mossGrad;
            ctx.beginPath();
            ctx.ellipse(patchX, patchY, patchWidth, patchHeight, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Platform edge moss
    resetSeed(800);
    for (let i = 0; i < 8; i++) {
        const x = W * 0.3 + random() * W * 0.4;
        const y = groundY - 25 + random() * 10;
        const size = 10 + random() * 20;
        
        ctx.fillStyle = withAlpha('#3a5030', 0.5 + random() * 0.3);
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Foreground plants - silhouettes with warm rim light
function drawForegroundPlants(groundY) {
    ctx.save();
    
    // Left side plants
    drawPlantCluster(W * 0.05, groundY + H * 0.3, 'left');
    drawPlantCluster(W * 0.12, groundY + H * 0.35, 'left');
    
    // Right side plants
    drawPlantCluster(W * 0.88, groundY + H * 0.32, 'right');
    drawPlantCluster(W * 0.95, groundY + H * 0.38, 'right');
    
    ctx.restore();
}

function drawPlantCluster(x, baseY, side) {
    resetSeed(Math.round(x * 100));
    
    const leafCount = 5 + Math.floor(random() * 4);
    
    for (let i = 0; i < leafCount; i++) {
        const angle = (side === 'left' ? 0.3 : -0.3) + (random() - 0.5) * 1.0;
        const length = 40 + random() * 60;
        const width = 8 + random() * 12;
        
        // Leaf is mostly dark silhouette
        const baseDark = '#1a2518';
        
        // Draw leaf shape
        ctx.save();
        ctx.translate(x + (random() - 0.5) * 30, baseY);
        ctx.rotate(angle);
        
        // Main leaf body - dark
        ctx.fillStyle = baseDark;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(width * 0.8, -length * 0.3, width * 0.5, -length);
        ctx.quadraticCurveTo(0, -length * 0.7, 0, 0);
        ctx.fill();
        
        // Rim light on edge facing sun (left side of left plants, right side of right plants)
        const rimSide = side === 'left' ? -1 : 1;
        
        ctx.strokeStyle = 'rgba(255, 180, 80, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            width * 0.8 * rimSide * -0.3, 
            -length * 0.3, 
            width * 0.5 * rimSide * -0.5, 
            -length
        );
        ctx.stroke();
        
        ctx.restore();
    }
}

// Closer forest trees (frame the scene)
function drawFramingTrees() {
    ctx.save();
    
    // Left tree trunk silhouette
    ctx.fillStyle = '#1a201a';
    ctx.beginPath();
    ctx.moveTo(-20, H);
    ctx.lineTo(60, H);
    ctx.lineTo(50, H * 0.3);
    ctx.lineTo(30, H * 0.25);
    ctx.lineTo(10, H * 0.28);
    ctx.lineTo(-10, H * 0.35);
    ctx.closePath();
    ctx.fill();
    
    // Right tree trunk silhouette
    ctx.beginPath();
    ctx.moveTo(W + 20, H);
    ctx.lineTo(W - 50, H);
    ctx.lineTo(W - 40, H * 0.35);
    ctx.lineTo(W - 20, H * 0.32);
    ctx.lineTo(W, H * 0.38);
    ctx.closePath();
    ctx.fill();
    
    // Rim light on left tree (facing sun)
    ctx.strokeStyle = 'rgba(255, 180, 100, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, H);
    ctx.lineTo(45, H * 0.4);
    ctx.stroke();
    
    ctx.restore();
}

// =============================================================================
// CHUNK 5: POLISH
// Dust particles in light shafts, depth haze, final touches
// =============================================================================

// Dust motes floating in light shafts
function drawDustParticles() {
    ctx.save();
    
    resetSeed(900);
    
    // Particles concentrated in light shaft areas
    // Sun position
    const sunX = W * 0.3;
    const sunY = H * 0.42;
    
    // Particles that catch the light
    for (let i = 0; i < 50; i++) {
        // Position within light cone area
        const angle = (-30 + random() * 70) * Math.PI / 180;  // Spread of shafts
        const dist = random() * H * 0.5;
        
        const x = sunX + Math.sin(angle) * dist + (random() - 0.5) * 100;
        const y = sunY + Math.cos(angle) * dist * 0.8;
        
        // Only draw if in visible area
        if (y < H * 0.85 && y > H * 0.2) {
            const size = 1 + random() * 2.5;
            const brightness = 0.3 + random() * 0.4;
            
            // Particles glow in the light
            const particleGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            particleGrad.addColorStop(0, `rgba(255, 220, 150, ${brightness})`);
            particleGrad.addColorStop(0.5, `rgba(255, 200, 120, ${brightness * 0.3})`);
            particleGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
            
            ctx.fillStyle = particleGrad;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // A few larger, softer particles (out of focus)
    for (let i = 0; i < 12; i++) {
        const x = W * 0.2 + random() * W * 0.6;
        const y = H * 0.3 + random() * H * 0.4;
        const size = 4 + random() * 6;
        
        const softGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
        softGrad.addColorStop(0, 'rgba(255, 210, 140, 0.12)');
        softGrad.addColorStop(0.5, 'rgba(255, 200, 120, 0.05)');
        softGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
        
        ctx.fillStyle = softGrad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Final atmospheric haze (unifies the scene)
function drawAtmosphericHaze() {
    ctx.save();
    
    // Subtle warm haze in the lit areas
    const warmHaze = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.5, W * 0.7);
    warmHaze.addColorStop(0, 'rgba(255, 200, 130, 0.06)');
    warmHaze.addColorStop(0.5, 'rgba(255, 180, 100, 0.03)');
    warmHaze.addColorStop(1, 'rgba(200, 150, 100, 0)');
    
    ctx.fillStyle = warmHaze;
    ctx.fillRect(0, 0, W, H);
    
    // Cool shadow tint in lower corners
    const coolShadow = ctx.createRadialGradient(W, H, 0, W, H, W * 0.6);
    coolShadow.addColorStop(0, 'rgba(30, 40, 50, 0.15)');
    coolShadow.addColorStop(1, 'rgba(30, 40, 50, 0)');
    
    ctx.fillStyle = coolShadow;
    ctx.fillRect(0, 0, W, H);
    
    ctx.restore();
}

// Vignette (subtle darkening at edges)
function drawVignette() {
    ctx.save();
    
    const vignetteGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.3, W * 0.5, H * 0.5, W * 0.8);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
    
    ctx.restore();
}

// =============================================================================
// MAIN RENDER - ALL CHUNKS
// =============================================================================

function render() {
    console.log('Forest Temple at Sunset - Complete');
    
    ctx.clearRect(0, 0, W, H);
    
    // CHUNK 1: Foundation layers
    drawSky();
    drawDistantForest();
    const groundY = drawGround();
    
    // CHUNK 2: Light behavior (behind temple)
    drawLightShafts();
    
    // CHUNK 3: Temple structure
    const columns = drawTemple(groundY);
    
    // CHUNK 4: Nature integration
    drawVines(columns);
    drawMoss(columns, groundY);
    
    // CHUNK 2 continued: Dappled light (on top of everything)
    drawDappledLight(groundY);
    
    // CHUNK 4 continued: Foreground elements (on top)
    drawFramingTrees();
    drawForegroundPlants(groundY);
    
    // CHUNK 5: Polish
    drawDustParticles();
    drawAtmosphericHaze();
    drawVignette();
    
    console.log('Scene complete - Selective technique application');
}

render();
