// ============================================
// ART STUDY #2: MOUNTAIN LANDSCAPE - V2
// ============================================
// APPLYING: No straight lines, organic shapes,
// atmospheric perspective, color temperature
// ============================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

// KEY FUNCTION: Generate organic, irregular curve points
function generateOrganicCurve(startX, startY, endX, endY, segments, variance, seed) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const baseX = lerp(startX, endX, t);
        const baseY = lerp(startY, endY, t);
        // Add organic variation (less at endpoints for smooth joins)
        const edgeFactor = Math.sin(t * Math.PI); // 0 at edges, 1 in middle
        const offsetX = (seededRandom(seed + i * 2) - 0.5) * variance * edgeFactor;
        const offsetY = (seededRandom(seed + i * 2 + 1) - 0.5) * variance * edgeFactor;
        points.push({ x: baseX + offsetX, y: baseY + offsetY });
    }
    return points;
}

// Draw smooth curve through points using quadratic beziers
function drawSmoothCurve(points, close = false) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    // Last point
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    
    if (close) ctx.closePath();
}

// ============================================
// 1. SKY - RICH GRADIENT (kept from V1 - works well)
// ============================================

function drawSky() {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    skyGrad.addColorStop(0.00, '#0a0a1a');
    skyGrad.addColorStop(0.15, '#141830');
    skyGrad.addColorStop(0.30, '#2a3555');
    skyGrad.addColorStop(0.45, '#4a5575');
    skyGrad.addColorStop(0.60, '#7a6565');
    skyGrad.addColorStop(0.75, '#c08050');
    skyGrad.addColorStop(0.88, '#e8a060');
    skyGrad.addColorStop(1.00, '#f0c080');
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.55);
    
    // Warm glow near horizon
    const glowGrad = ctx.createRadialGradient(W * 0.65, H * 0.42, 0, W * 0.65, H * 0.42, W * 0.5);
    glowGrad.addColorStop(0, 'rgba(255, 200, 100, 0.25)');
    glowGrad.addColorStop(0.5, 'rgba(255, 150, 80, 0.1)');
    glowGrad.addColorStop(1, 'rgba(255, 100, 50, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H * 0.55);
}

function drawStars() {
    ctx.save();
    for (let i = 0; i < 120; i++) {
        const x = seededRandom(i * 3) * W;
        const y = seededRandom(i * 3 + 1) * H * 0.35;
        const size = 0.5 + seededRandom(i * 3 + 2) * 1.5;
        const brightness = 0.3 + seededRandom(i * 3 + 3) * 0.5;
        
        ctx.globalAlpha = brightness * (1 - y / (H * 0.35));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawSun() {
    const sunX = W * 0.65;
    const sunY = H * 0.40;
    const sunR = 45;
    
    // Outer glow layers
    for (let i = 6; i >= 0; i--) {
        const r = sunR + i * 25;
        const alpha = 0.08 - i * 0.01;
        const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, r);
        grad.addColorStop(0, `rgba(255, 220, 150, ${alpha})`);
        grad.addColorStop(1, 'rgba(255, 180, 100, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Sun disc with soft edge (not hard circle)
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, '#fffae0');
    sunGrad.addColorStop(0.7, '#fff0c0');
    sunGrad.addColorStop(0.9, '#ffe090');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0.3)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
}

// ============================================
// 2. CLOUDS - ORGANIC PUFFY SHAPES
// ============================================

function drawClouds() {
    // Wispy high clouds
    for (let i = 0; i < 8; i++) {
        drawWispyCloud(
            seededRandom(i * 10) * W,
            H * 0.08 + seededRandom(i * 10 + 1) * H * 0.12,
            60 + seededRandom(i * 10 + 2) * 80,
            0.1 + seededRandom(i * 10 + 3) * 0.1,
            i * 100
        );
    }
    
    // Mid-level clouds with warm undersides
    for (let i = 0; i < 5; i++) {
        drawPuffyCloud(
            seededRandom(i * 20 + 50) * W,
            H * 0.25 + seededRandom(i * 20 + 51) * H * 0.1,
            80 + seededRandom(i * 20 + 52) * 100,
            40 + seededRandom(i * 20 + 53) * 30,
            0.4 + seededRandom(i * 20 + 54) * 0.3,
            i * 200
        );
    }
}

function drawWispyCloud(x, y, length, alpha, seed) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Wispy clouds are curved streaks
    const points = generateOrganicCurve(x, y, x + length, y - 5, 8, 10, seed);
    
    ctx.strokeStyle = 'rgba(200, 180, 220, 0.6)';
    ctx.lineWidth = 2 + seededRandom(seed) * 3;
    ctx.lineCap = 'round';
    drawSmoothCurve(points);
    ctx.stroke();
    
    ctx.restore();
}

function drawPuffyCloud(x, y, width, height, alpha, seed) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Build cloud from overlapping organic blobs
    const puffs = 5 + Math.floor(seededRandom(seed) * 4);
    
    for (let p = 0; p < puffs; p++) {
        const puffSeed = seed + p * 17;
        const px = x + (seededRandom(puffSeed) - 0.5) * width * 0.8;
        const py = y + (seededRandom(puffSeed + 1) - 0.5) * height * 0.5;
        const pr = 15 + seededRandom(puffSeed + 2) * 25;
        
        // Each puff is slightly irregular
        const puffGrad = ctx.createRadialGradient(px, py - pr * 0.3, 0, px, py, pr);
        puffGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        puffGrad.addColorStop(0.5, 'rgba(255, 240, 220, 0.6)');
        puffGrad.addColorStop(1, 'rgba(255, 200, 150, 0)');
        
        ctx.fillStyle = puffGrad;
        
        // Draw as slightly irregular ellipse
        ctx.beginPath();
        const segments = 12;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const variance = 1 + (seededRandom(puffSeed + i) - 0.5) * 0.2;
            const rx = pr * variance;
            const ry = pr * 0.7 * variance;
            const ptX = px + Math.cos(angle) * rx;
            const ptY = py + Math.sin(angle) * ry;
            if (i === 0) ctx.moveTo(ptX, ptY);
            else ctx.lineTo(ptX, ptY);
        }
        ctx.fill();
    }
    
    ctx.restore();
}

function drawGodRays() {
    ctx.save();
    const sunX = W * 0.65;
    const sunY = H * 0.40;
    
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 0.6 + Math.PI * 0.7;
        const length = 200 + seededRandom(i * 7) * 150;
        const width = 15 + seededRandom(i * 7 + 1) * 20;
        
        ctx.globalAlpha = 0.03 + seededRandom(i * 7 + 2) * 0.03;
        ctx.fillStyle = '#ffdd99';
        
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(
            sunX + Math.cos(angle - 0.02) * length,
            sunY + Math.sin(angle - 0.02) * length
        );
        ctx.lineTo(
            sunX + Math.cos(angle + 0.02) * length,
            sunY + Math.sin(angle + 0.02) * length
        );
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

// ============================================
// 3. MOUNTAINS - ORGANIC SILHOUETTES (KEY FIX!)
// ============================================

function drawFarMountains() {
    // Layer 1: Most distant - cool blue, low contrast, very hazy
    drawOrganicMountainRange(H * 0.42, 80, '#8090a8', '#7080a0', 0.4, 1000, 8);
    
    // Layer 2: Mid-distance - slightly warmer, more visible
    drawOrganicMountainRange(H * 0.44, 100, '#607088', '#506078', 0.6, 2000, 10);
    
    // Layer 3: Closer - more detail
    drawOrganicMountainRange(H * 0.46, 130, '#405060', '#304050', 0.75, 3000, 12);
}

function drawOrganicMountainRange(baseY, maxHeight, lightColor, darkColor, alpha, seed, peaks) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Generate organic ridge line with multiple peaks
    const points = [];
    points.push({ x: -10, y: baseY });
    
    for (let i = 0; i <= peaks * 3; i++) {
        const t = i / (peaks * 3);
        const x = t * (W + 20) - 10;
        
        // Create peaks at regular-ish intervals with variation
        const peakFactor = Math.sin(t * Math.PI * peaks) * 0.5 + 0.5;
        const heightVariation = seededRandom(seed + i) * 0.4 + 0.6;
        const height = maxHeight * peakFactor * heightVariation;
        
        // Add horizontal wobble for organic feel
        const wobbleX = (seededRandom(seed + i + 100) - 0.5) * 30;
        const wobbleY = (seededRandom(seed + i + 200) - 0.5) * 15;
        
        points.push({ x: x + wobbleX, y: baseY - height + wobbleY });
    }
    
    points.push({ x: W + 10, y: baseY });
    points.push({ x: W + 10, y: H });
    points.push({ x: -10, y: H });
    
    // Fill with gradient
    const grad = ctx.createLinearGradient(0, baseY - maxHeight, 0, baseY);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    
    drawSmoothCurve(points, true);
    ctx.fill();
    
    ctx.restore();
}

function drawMainMountains() {
    // Three prominent peaks - ORGANIC shapes, not triangles!
    drawOrganicMountain(W * 0.15, H * 0.50, 350, 280, 'left', 100);
    drawOrganicMountain(W * 0.50, H * 0.50, 450, 350, 'center', 200);
    drawOrganicMountain(W * 0.85, H * 0.50, 320, 260, 'right', 300);
}

function drawOrganicMountain(peakX, baseY, width, height, position, seed) {
    const peakY = baseY - height;
    
    // Generate organic left ridge
    const leftPoints = generateOrganicCurve(
        peakX, peakY,
        peakX - width * 0.55, baseY,
        12, 25, seed
    );
    
    // Generate organic right ridge
    const rightPoints = generateOrganicCurve(
        peakX, peakY,
        peakX + width * 0.45, baseY,
        12, 25, seed + 500
    );
    
    // Shadow face (left) - COOLER colors
    const shadowGrad = ctx.createLinearGradient(peakX - width * 0.55, baseY, peakX, peakY);
    shadowGrad.addColorStop(0, '#4a5868');
    shadowGrad.addColorStop(0.3, '#3a4858');
    shadowGrad.addColorStop(0.7, '#2a3848');
    shadowGrad.addColorStop(1, '#3a4a5a');
    
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for (let i = 1; i < leftPoints.length; i++) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
    }
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Add rock texture to shadow face
    drawRockTexture(leftPoints, peakX, baseY, 'shadow', seed);
    
    // Lit face (right) - WARMER, lighter colors
    const litGrad = ctx.createLinearGradient(peakX, peakY, peakX + width * 0.45, baseY);
    litGrad.addColorStop(0, '#9aa8b8');
    litGrad.addColorStop(0.3, '#8898a8');
    litGrad.addColorStop(0.7, '#788898');
    litGrad.addColorStop(1, '#687888');
    
    ctx.fillStyle = litGrad;
    ctx.beginPath();
    ctx.moveTo(rightPoints[0].x, rightPoints[0].y);
    for (let i = 1; i < rightPoints.length; i++) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
    }
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Add rock texture to lit face
    drawRockTexture(rightPoints, peakX, baseY, 'lit', seed + 1000);
    
    // Snow cap with organic drips
    drawOrganicSnowCap(peakX, peakY, width, height, seed);
    
    // Ridge highlight (soft, not hard line)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = 'rgba(200, 220, 240, 0.5)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX + 5, baseY);
    ctx.stroke();
    ctx.restore();
}

function drawRockTexture(ridgePoints, centerX, baseY, side, seed) {
    ctx.save();
    
    const isLit = side === 'lit';
    
    // Rock striations - curved, not straight
    ctx.globalAlpha = isLit ? 0.15 : 0.1;
    
    for (let i = 0; i < 25; i++) {
        const t = 0.15 + (i / 25) * 0.7;
        const y = ridgePoints[0].y + (baseY - ridgePoints[0].y) * t;
        
        // Find approximate x extent at this height
        const ridgeIndex = Math.floor(t * ridgePoints.length);
        const ridgeX = ridgePoints[Math.min(ridgeIndex, ridgePoints.length - 1)].x;
        
        const stripeAlpha = 0.08 + seededRandom(seed + i * 11) * 0.1;
        ctx.strokeStyle = seededRandom(seed + i * 12) > 0.5 
            ? `rgba(30, 40, 55, ${stripeAlpha})`
            : `rgba(100, 110, 125, ${stripeAlpha})`;
        ctx.lineWidth = 1 + seededRandom(seed + i * 13) * 2;
        
        // Wavy striation line
        ctx.beginPath();
        const startX = isLit ? centerX + 5 : ridgeX;
        const endX = isLit ? ridgeX : centerX - 5;
        ctx.moveTo(startX, y);
        
        const segments = 6;
        for (let s = 1; s <= segments; s++) {
            const sx = lerp(startX, endX, s / segments);
            const sy = y + (seededRandom(seed + i * 20 + s) - 0.5) * 6;
            ctx.lineTo(sx, sy);
        }
        ctx.stroke();
    }
    
    // Rock patches
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 30; i++) {
        const patchSeed = seed + 2000 + i * 17;
        const t = 0.1 + seededRandom(patchSeed) * 0.75;
        const ridgeIndex = Math.floor(t * ridgePoints.length);
        const ridgeX = ridgePoints[Math.min(ridgeIndex, ridgePoints.length - 1)].x;
        
        const y = ridgePoints[0].y + (baseY - ridgePoints[0].y) * t;
        const xRange = Math.abs(ridgeX - centerX);
        const x = isLit 
            ? centerX + seededRandom(patchSeed + 1) * xRange * 0.8
            : centerX - seededRandom(patchSeed + 1) * xRange * 0.8;
        
        const patchW = 8 + seededRandom(patchSeed + 2) * 20;
        const patchH = patchW * (0.3 + seededRandom(patchSeed + 3) * 0.3);
        
        ctx.fillStyle = seededRandom(patchSeed + 5) > 0.5 
            ? 'rgba(30, 40, 50, 0.2)'
            : 'rgba(90, 100, 115, 0.15)';
        
        // Organic patch shape
        ctx.beginPath();
        const segments = 8;
        for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI * 2;
            const variance = 1 + (seededRandom(patchSeed + s) - 0.5) * 0.3;
            const px = x + Math.cos(angle) * patchW * variance;
            const py = y + Math.sin(angle) * patchH * variance;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.fill();
    }
    
    ctx.restore();
}

function drawOrganicSnowCap(peakX, peakY, width, height, seed) {
    const snowExtent = height * 0.35;
    
    ctx.save();
    
    // Generate organic snow line
    const snowPoints = [];
    snowPoints.push({ x: peakX - width * 0.25, y: peakY + snowExtent });
    
    // Irregular snow edge with drips
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const x = peakX - width * 0.25 + t * width * 0.5;
        const baseSnowY = peakY + snowExtent * (0.8 + Math.abs(t - 0.5) * 0.4);
        
        // Add drip variation
        const drip = seededRandom(seed + i * 7) * 15;
        const y = baseSnowY + drip;
        
        snowPoints.push({ x, y });
    }
    
    snowPoints.push({ x: peakX + width * 0.25, y: peakY + snowExtent });
    snowPoints.push({ x: peakX, y: peakY });
    
    // Snow gradient
    const snowGrad = ctx.createLinearGradient(peakX, peakY, peakX, peakY + snowExtent);
    snowGrad.addColorStop(0, '#ffffff');
    snowGrad.addColorStop(0.5, '#f0f5ff');
    snowGrad.addColorStop(1, '#d8e8f8');
    
    ctx.fillStyle = snowGrad;
    ctx.beginPath();
    ctx.moveTo(snowPoints[0].x, snowPoints[0].y);
    for (let i = 1; i < snowPoints.length; i++) {
        ctx.lineTo(snowPoints[i].x, snowPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Snow sparkles
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 15; i++) {
        const sx = peakX + (seededRandom(seed + i * 3) - 0.5) * width * 0.3;
        const sy = peakY + seededRandom(seed + i * 3 + 1) * snowExtent * 0.6;
        const size = 1 + seededRandom(seed + i * 3 + 2) * 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// ============================================
// 4. FOREST - VARIED ORGANIC TREE SHAPES
// ============================================

function drawForest() {
    drawForestLayer(H * 0.485, 0.4, '#152520', '#0a1510', 0.6, 35, 1);
    drawForestLayer(H * 0.50, 0.6, '#1a2a20', '#0f1a10', 0.75, 28, 2);
    drawForestLayer(H * 0.515, 0.85, '#203020', '#152015', 0.9, 22, 3);
}

function drawForestLayer(baseY, scale, lightColor, darkColor, alpha, count, layerNum) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    for (let i = 0; i < count; i++) {
        const seed = layerNum * 1000 + i * 37;
        const x = (i / count) * W + (seededRandom(seed) - 0.5) * (W / count) * 0.8;
        const treeHeight = (30 + seededRandom(seed + 1) * 40) * scale;
        const treeWidth = treeHeight * (0.2 + seededRandom(seed + 2) * 0.15);
        
        drawOrganicPineTree(x, baseY, treeWidth, treeHeight, lightColor, darkColor, seed);
    }
    
    ctx.restore();
}

function drawOrganicPineTree(x, baseY, width, height, lightColor, darkColor, seed) {
    // Trunk (only for closer trees)
    if (height > 30) {
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(x - width * 0.08, baseY - height * 0.15, width * 0.16, height * 0.15);
    }
    
    // Organic foliage - NOT a perfect triangle
    const layers = 5 + Math.floor(seededRandom(seed) * 3);
    
    for (let layer = 0; layer < layers; layer++) {
        const t = layer / layers;
        const layerY = baseY - height * 0.12 - height * t * 0.8;
        const layerWidth = width * (1 - t * 0.65);
        const layerHeight = height / layers * 1.3;
        
        // Vary each layer's shape
        const leftSkew = (seededRandom(seed + layer * 10) - 0.5) * 8;
        const rightSkew = (seededRandom(seed + layer * 10 + 1) - 0.5) * 8;
        const peakOffset = (seededRandom(seed + layer * 10 + 2) - 0.5) * 5;
        
        // Shadow side
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(x + peakOffset, layerY - layerHeight);
        ctx.lineTo(x - layerWidth + leftSkew, layerY);
        ctx.lineTo(x, layerY + 2);
        ctx.closePath();
        ctx.fill();
        
        // Lit side
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(x + peakOffset, layerY - layerHeight);
        ctx.lineTo(x + layerWidth * 0.85 + rightSkew, layerY);
        ctx.lineTo(x, layerY + 2);
        ctx.closePath();
        ctx.fill();
    }
}

// ============================================
// 5. LAKE - SOFT ORGANIC SHORELINE
// ============================================

function drawLake() {
    const lakeTop = H * 0.52;
    const lakeBottom = H * 0.78;
    
    // Water base
    const waterGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeBottom);
    waterGrad.addColorStop(0, '#5a7898');
    waterGrad.addColorStop(0.3, '#4a6888');
    waterGrad.addColorStop(0.6, '#3a5878');
    waterGrad.addColorStop(1, '#2a4868');
    
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, lakeTop, W, lakeBottom - lakeTop);
    
    // Sun reflection
    drawSunReflection(lakeTop, lakeBottom);
    
    // Water ripples (organic curves, not straight lines)
    drawWaterRipples(lakeTop, lakeBottom);
    
    // Organic shoreline transition
    drawOrganicShoreline(lakeTop);
}

function drawSunReflection(lakeTop, lakeBottom) {
    const sunX = W * 0.65;
    
    ctx.save();
    
    // Reflection path
    const reflectionGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeBottom);
    reflectionGrad.addColorStop(0, 'rgba(255, 220, 150, 0.4)');
    reflectionGrad.addColorStop(0.5, 'rgba(255, 200, 120, 0.2)');
    reflectionGrad.addColorStop(1, 'rgba(255, 180, 100, 0.05)');
    
    ctx.fillStyle = reflectionGrad;
    ctx.beginPath();
    ctx.moveTo(sunX - 30, lakeTop);
    ctx.lineTo(sunX + 30, lakeTop);
    ctx.lineTo(sunX + 80, lakeBottom);
    ctx.lineTo(sunX - 80, lakeBottom);
    ctx.closePath();
    ctx.fill();
    
    // Sparkles on reflection
    for (let i = 0; i < 25; i++) {
        const sx = sunX + (seededRandom(i * 5) - 0.5) * 60;
        const sy = lakeTop + seededRandom(i * 5 + 1) * (lakeBottom - lakeTop) * 0.7;
        const size = 1 + seededRandom(i * 5 + 2) * 2;
        
        ctx.globalAlpha = 0.3 + seededRandom(i * 5 + 3) * 0.4;
        ctx.fillStyle = '#fffae0';
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawWaterRipples(lakeTop, lakeBottom) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    
    for (let i = 0; i < 30; i++) {
        const y = lakeTop + (i / 30) * (lakeBottom - lakeTop);
        const points = generateOrganicCurve(-10, y, W + 10, y + 2, 20, 3, i * 100);
        
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(100, 150, 200, 0.3)' : 'rgba(50, 100, 150, 0.2)';
        ctx.lineWidth = 1;
        drawSmoothCurve(points);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawOrganicShoreline(lakeTop) {
    // Soft gradient transition from water to land
    ctx.save();
    
    const transitionGrad = ctx.createLinearGradient(0, lakeTop - 15, 0, lakeTop + 15);
    transitionGrad.addColorStop(0, 'rgba(60, 80, 50, 0.8)');
    transitionGrad.addColorStop(0.5, 'rgba(60, 80, 50, 0.3)');
    transitionGrad.addColorStop(1, 'rgba(60, 100, 130, 0)');
    
    // Organic shoreline edge
    const shorePoints = generateOrganicCurve(-10, lakeTop, W + 10, lakeTop, 30, 8, 5555);
    
    ctx.fillStyle = transitionGrad;
    ctx.beginPath();
    ctx.moveTo(-10, lakeTop - 15);
    for (const pt of shorePoints) {
        ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(W + 10, lakeTop + 20);
    ctx.lineTo(-10, lakeTop + 20);
    ctx.closePath();
    ctx.fill();
    
    // Shore rocks
    for (let i = 0; i < 20; i++) {
        const rockSeed = 6000 + i * 23;
        const rx = seededRandom(rockSeed) * W;
        const ry = lakeTop + (seededRandom(rockSeed + 1) - 0.5) * 15;
        const rSize = 3 + seededRandom(rockSeed + 2) * 8;
        
        drawOrganicRock(rx, ry, rSize, rockSeed);
    }
    
    // Reeds/grass tufts at waterline
    for (let i = 0; i < 15; i++) {
        const reedSeed = 7000 + i * 31;
        const rx = seededRandom(reedSeed) * W;
        const ry = lakeTop + (seededRandom(reedSeed + 1) - 0.5) * 10;
        
        drawReedTuft(rx, ry, reedSeed);
    }
    
    ctx.restore();
}

function drawOrganicRock(x, y, size, seed) {
    ctx.save();
    
    const rockGrad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
    rockGrad.addColorStop(0, '#707070');
    rockGrad.addColorStop(0.7, '#505050');
    rockGrad.addColorStop(1, '#404040');
    
    ctx.fillStyle = rockGrad;
    
    // Irregular rock shape
    ctx.beginPath();
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const variance = 0.7 + seededRandom(seed + i) * 0.6;
        const rx = x + Math.cos(angle) * size * variance;
        const ry = y + Math.sin(angle) * size * variance * 0.6;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
    }
    ctx.fill();
    
    ctx.restore();
}

function drawReedTuft(x, y, seed) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    
    const blades = 3 + Math.floor(seededRandom(seed) * 4);
    
    for (let i = 0; i < blades; i++) {
        const bladeHeight = 8 + seededRandom(seed + i * 3) * 15;
        const lean = (seededRandom(seed + i * 3 + 1) - 0.5) * 10;
        
        ctx.strokeStyle = '#2a4020';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x + (i - blades / 2) * 2, y);
        ctx.quadraticCurveTo(
            x + lean, y - bladeHeight * 0.6,
            x + lean * 1.5, y - bladeHeight
        );
        ctx.stroke();
    }
    
    ctx.restore();
}

// ============================================
// 6. FOREGROUND - WARM, DENSE, HIGH CONTRAST
// ============================================

function drawForeground() {
    const meadowTop = H * 0.76;
    
    // Grass base - WARMER colors for foreground
    const grassGrad = ctx.createLinearGradient(0, meadowTop, 0, H);
    grassGrad.addColorStop(0, '#4a6838');  // Warmer green
    grassGrad.addColorStop(0.3, '#3a5828');
    grassGrad.addColorStop(0.6, '#2a4818');
    grassGrad.addColorStop(1, '#1a3008');
    
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, meadowTop, W, H - meadowTop);
    
    // Dense grass blades - more in foreground
    drawDenseGrass(meadowTop);
    
    // Wildflowers - warm colors (reds, yellows, oranges)
    drawWildflowers(meadowTop);
    
    // Foreground rocks
    drawForegroundRocks(meadowTop);
}

function drawDenseGrass(meadowTop) {
    ctx.save();
    
    // Background grass (smaller, lighter)
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 400; i++) {
        const seed = 8000 + i * 7;
        const x = seededRandom(seed) * W;
        const y = meadowTop + seededRandom(seed + 1) * (H - meadowTop) * 0.4;
        const height = 5 + seededRandom(seed + 2) * 8;
        
        drawGrassBlade(x, y, height, '#4a6838', seed);
    }
    
    // Mid grass
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 300; i++) {
        const seed = 9000 + i * 11;
        const x = seededRandom(seed) * W;
        const y = meadowTop + (H - meadowTop) * 0.3 + seededRandom(seed + 1) * (H - meadowTop) * 0.4;
        const height = 8 + seededRandom(seed + 2) * 12;
        
        drawGrassBlade(x, y, height, '#3a5828', seed);
    }
    
    // Foreground grass (larger, darker, more contrast)
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 200; i++) {
        const seed = 10000 + i * 13;
        const x = seededRandom(seed) * W;
        const y = meadowTop + (H - meadowTop) * 0.6 + seededRandom(seed + 1) * (H - meadowTop) * 0.4;
        const height = 12 + seededRandom(seed + 2) * 18;
        
        drawGrassBlade(x, y, height, '#2a4018', seed);
    }
    
    ctx.restore();
}

function drawGrassBlade(x, y, height, color, seed) {
    const lean = (seededRandom(seed + 10) - 0.5) * height * 0.4;
    const curve = (seededRandom(seed + 11) - 0.5) * 8;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 + seededRandom(seed + 12) * 1.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + curve, y - height * 0.5, x + lean, y - height);
    ctx.stroke();
}

function drawWildflowers(meadowTop) {
    ctx.save();
    
    // Poppies (warm red/orange) - WARM foreground color
    for (let i = 0; i < 40; i++) {
        const seed = 11000 + i * 17;
        const x = seededRandom(seed) * W;
        const y = meadowTop + seededRandom(seed + 1) * (H - meadowTop);
        const size = 3 + seededRandom(seed + 2) * 4;
        const distanceFactor = (y - meadowTop) / (H - meadowTop);
        
        ctx.globalAlpha = 0.5 + distanceFactor * 0.4;
        
        // Stem
        ctx.strokeStyle = '#2a4018';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (seededRandom(seed + 3) - 0.5) * 3, y - size * 3);
        ctx.stroke();
        
        // Petals - warm colors
        const flowerColor = seededRandom(seed + 4) > 0.5 ? '#cc4444' : '#dd6622';
        ctx.fillStyle = flowerColor;
        
        for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2 + seededRandom(seed + 5) * 0.3;
            const petalX = x + Math.cos(angle) * size * 0.7;
            const petalY = y - size * 3 + Math.sin(angle) * size * 0.5;
            ctx.beginPath();
            ctx.arc(petalX, petalY, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center
        ctx.fillStyle = '#220000';
        ctx.beginPath();
        ctx.arc(x, y - size * 3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Daisies (white with yellow center)
    for (let i = 0; i < 30; i++) {
        const seed = 12000 + i * 19;
        const x = seededRandom(seed) * W;
        const y = meadowTop + seededRandom(seed + 1) * (H - meadowTop);
        const size = 2 + seededRandom(seed + 2) * 3;
        const distanceFactor = (y - meadowTop) / (H - meadowTop);
        
        ctx.globalAlpha = 0.5 + distanceFactor * 0.4;
        
        // Petals
        ctx.fillStyle = '#ffffff';
        for (let p = 0; p < 8; p++) {
            const angle = (p / 8) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * size;
            const petalY = y - size * 2 + Math.sin(angle) * size * 0.6;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, size * 0.4, size * 0.2, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Yellow center - WARM
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(x, y - size * 2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Yellow buttercups - WARM
    for (let i = 0; i < 35; i++) {
        const seed = 13000 + i * 23;
        const x = seededRandom(seed) * W;
        const y = meadowTop + seededRandom(seed + 1) * (H - meadowTop);
        const size = 2 + seededRandom(seed + 2) * 2;
        const distanceFactor = (y - meadowTop) / (H - meadowTop);
        
        ctx.globalAlpha = 0.5 + distanceFactor * 0.4;
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x, y - size * 2, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawForegroundRocks(meadowTop) {
    // Larger foreground rocks with more detail
    for (let i = 0; i < 8; i++) {
        const seed = 14000 + i * 29;
        const x = seededRandom(seed) * W;
        const y = meadowTop + (H - meadowTop) * 0.5 + seededRandom(seed + 1) * (H - meadowTop) * 0.4;
        const size = 8 + seededRandom(seed + 2) * 15;
        
        drawOrganicRock(x, y, size, seed);
    }
}

// ============================================
// 7. BIRDS & ATMOSPHERE
// ============================================

function drawBirds() {
    ctx.save();
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    // V-formation groups
    for (let g = 0; g < 3; g++) {
        const groupSeed = 15000 + g * 100;
        const gx = W * 0.2 + seededRandom(groupSeed) * W * 0.6;
        const gy = H * 0.15 + seededRandom(groupSeed + 1) * H * 0.15;
        
        ctx.globalAlpha = 0.4 + seededRandom(groupSeed + 2) * 0.3;
        
        for (let b = 0; b < 5; b++) {
            const bx = gx + (b - 2) * 15 + (seededRandom(groupSeed + b * 3) - 0.5) * 5;
            const by = gy + Math.abs(b - 2) * 8;
            const wingSpan = 4 + seededRandom(groupSeed + b * 3 + 1) * 3;
            
            ctx.beginPath();
            ctx.moveTo(bx - wingSpan, by + 2);
            ctx.quadraticCurveTo(bx, by - 2, bx + wingSpan, by + 2);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

function drawAtmosphericEffects() {
    // Subtle mist between layers
    ctx.save();
    
    const mistGrad = ctx.createLinearGradient(0, H * 0.48, 0, H * 0.55);
    mistGrad.addColorStop(0, 'rgba(180, 190, 200, 0)');
    mistGrad.addColorStop(0.5, 'rgba(180, 190, 200, 0.1)');
    mistGrad.addColorStop(1, 'rgba(180, 190, 200, 0)');
    
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, H * 0.48, W, H * 0.07);
    
    ctx.restore();
}

function drawFinalTouches() {
    // Subtle vignette
    ctx.save();
    
    const vignetteGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
    
    ctx.restore();
}

// ============================================
// RENDER
// ============================================

function render() {
    ctx.clearRect(0, 0, W, H);
    
    // Layer 1: Sky & Celestial
    drawSky();
    drawStars();
    drawSun();
    drawClouds();
    drawGodRays();
    
    // Layer 2: Far Mountains
    drawFarMountains();
    
    // Layer 3: Main Mountains
    drawMainMountains();
    
    // Layer 4: Atmosphere
    drawAtmosphericEffects();
    
    // Layer 5: Forest
    drawForest();
    
    // Layer 6: Lake
    drawLake();
    
    // Layer 7: Foreground
    drawForeground();
    
    // Layer 8: Birds
    drawBirds();
    
    // Layer 9: Final touches
    drawFinalTouches();
    
    console.log('V2 Mountain Landscape rendered!');
}

render();
