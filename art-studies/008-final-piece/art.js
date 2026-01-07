// ============================================================================
// ART STUDY 008 - MOUNTAIN SHRINE AT DAWN
// ============================================================================
//
// The Final Piece - Applying Everything Learned
//
// SCENE: A small shrine on a mountain ledge at dawn.
// Mist in the valley below. First light catching the shrine.
// Mountains receding into atmospheric perspective.
//
// FOCAL POINT: The shrine (warm light, sharp edges, full treatment)
// SUPPORTING: Mountain silhouettes (depth through color, lost edges)
// ATMOSPHERE: Mist, dawn light gradient
//
// TECHNIQUES APPLIED SELECTIVELY:
// - 5-value only on shrine (focal point)
// - Depth through desaturation and value shift (mountains)
// - 4-layer texture on shrine stone only
// - Edge entropy on man-made elements only
// - Atmospheric perspective everywhere
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// PALETTE - Dawn colors: cool shadows, warm light
// =============================================================================

const COLORS = {
    // Sky - pink/orange at horizon, deep blue above
    skyTop: '#1a2a4a',
    skyMid: '#4a4a6a',
    skyHorizon: '#d08080',
    sunGlow: '#ffcc99',
    
    // Mountains - cool, progressively lighter/bluer with distance
    mountainFar: '#6a7a9a',
    mountainMid: '#5a6a80',
    mountainNear: '#3a4a5a',
    
    // Mist - warm where lit, cool in shadow
    mistLight: 'rgba(255, 220, 200, 0.3)',
    mistShadow: 'rgba(180, 190, 210, 0.25)',
    
    // Shrine stone - warm where dawn hits, cool in shadow
    shrineLight: '#e8d0b0',
    shrineMid: '#a08060',
    shrineShadow: '#504540',
    shrineDeep: '#302825',
    
    // Ground/ledge
    groundLight: '#6a5a4a',
    groundShadow: '#3a3530',
};

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

function lerpColor(c1, c2, t) {
    // Simple hex lerp
    const r1 = parseInt(c1.slice(1,3), 16);
    const g1 = parseInt(c1.slice(3,5), 16);
    const b1 = parseInt(c1.slice(5,7), 16);
    const r2 = parseInt(c2.slice(1,3), 16);
    const g2 = parseInt(c2.slice(3,5), 16);
    const b2 = parseInt(c2.slice(5,7), 16);
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    return `rgb(${r}, ${g}, ${b})`;
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
// SKY - Dawn gradient with sun glow
// =============================================================================

function drawSky() {
    // Main sky gradient - deep blue to pink/orange at horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    skyGrad.addColorStop(0, COLORS.skyTop);
    skyGrad.addColorStop(0.5, COLORS.skyMid);
    skyGrad.addColorStop(0.85, '#8a6a7a');
    skyGrad.addColorStop(1, COLORS.skyHorizon);
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.6);
    
    // Sun glow - soft radial, just below horizon (sun rising)
    const sunX = W * 0.7;
    const sunY = H * 0.48;
    
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.35);
    sunGrad.addColorStop(0, 'rgba(255, 220, 180, 0.5)');
    sunGrad.addColorStop(0.2, 'rgba(255, 180, 140, 0.3)');
    sunGrad.addColorStop(0.5, 'rgba(255, 150, 120, 0.1)');
    sunGrad.addColorStop(1, 'rgba(255, 150, 120, 0)');
    
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, W, H * 0.6);
    
    // Sun disk - very subtle, partially hidden
    const diskGrad = ctx.createRadialGradient(sunX, sunY + 10, 0, sunX, sunY + 10, 25);
    diskGrad.addColorStop(0, 'rgba(255, 240, 220, 0.8)');
    diskGrad.addColorStop(0.5, 'rgba(255, 220, 180, 0.4)');
    diskGrad.addColorStop(1, 'rgba(255, 200, 160, 0)');
    
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY + 10, 25, 0, Math.PI * 2);
    ctx.fill();
}

// =============================================================================
// MOUNTAINS - Atmospheric perspective through COLOR, not just alpha
// =============================================================================

function drawMountains() {
    // Three layers - each progressively darker/more saturated as it gets closer
    
    // FAR mountains - lightest, most blue, lowest contrast
    drawMountainLayer(H * 0.52, H * 0.18, COLORS.mountainFar, 0.6, 500);
    
    // MID mountains - medium values
    drawMountainLayer(H * 0.50, H * 0.25, COLORS.mountainMid, 0.75, 600);
    
    // NEAR mountains - darkest, most saturated, highest contrast
    drawMountainLayer(H * 0.48, H * 0.30, COLORS.mountainNear, 0.9, 700);
}

function drawMountainLayer(baseY, maxHeight, baseColor, opacity, seedVal) {
    resetSeed(seedVal);
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Gradient within mountain - lighter at top (atmosphere), darker at base
    const grad = ctx.createLinearGradient(0, baseY - maxHeight, 0, baseY + 30);
    grad.addColorStop(0, withAlpha(baseColor, 0.7));
    grad.addColorStop(0.4, baseColor);
    grad.addColorStop(1, withAlpha(baseColor, 0.95));
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, H);
    
    // Mountain silhouette - peaks and valleys
    let x = -50;
    ctx.lineTo(x, baseY);
    
    while (x < W + 100) {
        // Major peak
        const peakX = x + 80 + random() * 120;
        const peakHeight = maxHeight * (0.5 + random() * 0.5);
        const peakY = baseY - peakHeight;
        
        // Approach the peak
        const midX = (x + peakX) / 2;
        ctx.quadraticCurveTo(
            midX, baseY - peakHeight * 0.3,
            peakX, peakY
        );
        
        // Down from peak
        const nextValleyX = peakX + 60 + random() * 100;
        const valleyY = baseY - maxHeight * (0.1 + random() * 0.2);
        
        ctx.quadraticCurveTo(
            peakX + (nextValleyX - peakX) * 0.4, peakY + peakHeight * 0.4,
            nextValleyX, valleyY
        );
        
        x = nextValleyX;
    }
    
    ctx.lineTo(W + 50, H);
    ctx.closePath();
    ctx.fill();
    
    // LAYER 2: Surface variation - very subtle value shifts within silhouette
    resetSeed(seedVal + 100);
    for (let i = 0; i < 3; i++) {
        const patchX = random() * W;
        const patchY = baseY - maxHeight * (0.2 + random() * 0.5);
        const patchSize = 80 + random() * 150;
        
        const patchGrad = ctx.createRadialGradient(patchX, patchY, 0, patchX, patchY, patchSize);
        patchGrad.addColorStop(0, `rgba(0, 0, 0, ${0.02 + random() * 0.02})`);
        patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = patchGrad;
        ctx.fillRect(0, baseY - maxHeight - 20, W, maxHeight + 50);
    }
    
    ctx.restore();
}

// =============================================================================
// MIST - Layered in the valley
// =============================================================================

function drawMist() {
    // Mist settles in valleys, lit warm by dawn on one side
    
    // Base mist layer
    const mistY = H * 0.48;
    const mistHeight = H * 0.15;
    
    ctx.save();
    
    // Cool shadow side (left)
    const mistGradLeft = ctx.createLinearGradient(0, mistY, W * 0.4, mistY);
    mistGradLeft.addColorStop(0, 'rgba(180, 190, 210, 0.25)');
    mistGradLeft.addColorStop(1, 'rgba(180, 190, 210, 0)');
    
    ctx.fillStyle = mistGradLeft;
    ctx.fillRect(0, mistY - mistHeight * 0.3, W * 0.5, mistHeight);
    
    // Warm lit side (right, toward sun)
    const mistGradRight = ctx.createLinearGradient(W * 0.5, mistY, W, mistY);
    mistGradRight.addColorStop(0, 'rgba(255, 220, 200, 0)');
    mistGradRight.addColorStop(0.3, 'rgba(255, 220, 200, 0.2)');
    mistGradRight.addColorStop(1, 'rgba(255, 220, 200, 0.35)');
    
    ctx.fillStyle = mistGradRight;
    ctx.fillRect(W * 0.4, mistY - mistHeight * 0.2, W * 0.6, mistHeight * 0.8);
    
    // Wispy top edge - mist doesn't have hard edges
    resetSeed(888);
    for (let i = 0; i < 8; i++) {
        const wispX = random() * W;
        const wispY = mistY - mistHeight * 0.3 + random() * mistHeight * 0.4;
        const wispW = 100 + random() * 200;
        const wispH = 20 + random() * 40;
        
        const wispGrad = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, wispW * 0.5);
        const warm = wispX > W * 0.5;
        if (warm) {
            wispGrad.addColorStop(0, `rgba(255, 230, 210, ${0.1 + random() * 0.1})`);
        } else {
            wispGrad.addColorStop(0, `rgba(200, 210, 230, ${0.08 + random() * 0.08})`);
        }
        wispGrad.addColorStop(1, 'rgba(200, 200, 200, 0)');
        
        ctx.fillStyle = wispGrad;
        ctx.fillRect(wispX - wispW * 0.5, wispY - wispH * 0.5, wispW, wispH);
    }
    
    ctx.restore();
}

// =============================================================================
// FOREGROUND LEDGE - Where the shrine sits
// =============================================================================

function drawLedge() {
    const ledgeY = H * 0.62;
    
    // Main ledge gradient
    const ledgeGrad = ctx.createLinearGradient(0, ledgeY, 0, H);
    ledgeGrad.addColorStop(0, COLORS.groundLight);
    ledgeGrad.addColorStop(0.3, '#5a4a40');
    ledgeGrad.addColorStop(1, COLORS.groundShadow);
    
    ctx.fillStyle = ledgeGrad;
    
    // Slightly irregular top edge
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, ledgeY + 20);
    
    resetSeed(333);
    for (let x = 0; x <= W; x += 30) {
        const variation = Math.sin(x * 0.015) * 8 + (random() - 0.5) * 5;
        ctx.lineTo(x, ledgeY + variation);
    }
    
    ctx.lineTo(W, ledgeY + 15);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    
    // LAYER 2: Surface variation - large subtle patches
    ctx.save();
    resetSeed(334);
    for (let i = 0; i < 4; i++) {
        const patchX = W * (0.1 + random() * 0.8);
        const patchY = ledgeY + 30 + random() * (H - ledgeY - 60);
        const patchSize = W * (0.2 + random() * 0.15);
        
        const patchGrad = ctx.createRadialGradient(patchX, patchY, 0, patchX, patchY, patchSize);
        if (random() > 0.5) {
            patchGrad.addColorStop(0, 'rgba(0, 0, 0, 0.03)');
        } else {
            patchGrad.addColorStop(0, 'rgba(140, 120, 100, 0.03)');
        }
        patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = patchGrad;
        ctx.fillRect(0, ledgeY, W, H - ledgeY);
    }
    ctx.restore();
    
    // Dawn light on ledge (right side)
    const warmGrad = ctx.createLinearGradient(W * 0.5, 0, W, 0);
    warmGrad.addColorStop(0, 'rgba(255, 200, 150, 0)');
    warmGrad.addColorStop(1, 'rgba(255, 200, 150, 0.12)');
    
    ctx.fillStyle = warmGrad;
    ctx.fillRect(0, ledgeY, W, H - ledgeY);
    
    return ledgeY;
}

// =============================================================================
// THE SHRINE - Focal point, full treatment
// =============================================================================

// 4-Layer texture functions for shrine
function addShrineTexture(x, y, w, h) {
    // LAYER 2: Surface variation
    ctx.save();
    resetSeed(Math.round(x * 77 + y * 33));
    
    for (let i = 0; i < 3; i++) {
        const patchX = x + random() * w;
        const patchY = y + random() * h;
        const patchSize = Math.min(w, h) * (0.3 + random() * 0.3);
        
        const patchGrad = ctx.createRadialGradient(patchX, patchY, 0, patchX, patchY, patchSize);
        if (random() > 0.5) {
            patchGrad.addColorStop(0, 'rgba(0, 0, 0, 0.03)');
        } else {
            patchGrad.addColorStop(0, 'rgba(255, 240, 220, 0.02)');
        }
        patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = patchGrad;
        ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
    
    // LAYER 3: Edge darkening
    // Left edge (shadow side)
    const leftEdge = ctx.createLinearGradient(x, 0, x + w * 0.12, 0);
    leftEdge.addColorStop(0, 'rgba(40, 35, 30, 0.15)');
    leftEdge.addColorStop(1, 'rgba(40, 35, 30, 0)');
    ctx.fillStyle = leftEdge;
    ctx.fillRect(x, y, w * 0.15, h);
    
    // Base darkening
    const baseGrad = ctx.createLinearGradient(0, y + h - h * 0.15, 0, y + h);
    baseGrad.addColorStop(0, 'rgba(30, 25, 20, 0)');
    baseGrad.addColorStop(1, 'rgba(25, 20, 15, 0.12)');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(x - 2, y + h - h * 0.15, w + 4, h * 0.15 + 3);
}

function drawDamagedRect(x, y, w, h, damage) {
    ctx.beginPath();
    
    // Slightly damaged edges
    ctx.moveTo(x + (random() - 0.5) * damage, y + (random() - 0.5) * damage);
    
    // Top edge
    let currentX = x;
    while (currentX < x + w) {
        currentX += 10 + random() * 15;
        ctx.lineTo(Math.min(currentX, x + w), y + (random() - 0.5) * damage * 0.5);
    }
    
    // Right edge
    let currentY = y;
    while (currentY < y + h) {
        currentY += 10 + random() * 15;
        ctx.lineTo(x + w + (random() - 0.5) * damage, Math.min(currentY, y + h));
    }
    
    // Bottom edge
    currentX = x + w;
    while (currentX > x) {
        currentX -= 10 + random() * 15;
        ctx.lineTo(Math.max(currentX, x), y + h + (random() - 0.5) * damage * 0.5);
    }
    
    // Left edge
    currentY = y + h;
    while (currentY > y) {
        currentY -= 10 + random() * 15;
        ctx.lineTo(x + (random() - 0.5) * damage, Math.max(currentY, y));
    }
    
    ctx.closePath();
}

function drawShrine(ledgeY) {
    const shrineX = W * 0.35;
    const shrineBaseY = ledgeY - 5;
    
    // SHRINE BASE/PLATFORM
    const baseW = 100;
    const baseH = 15;
    const baseX = shrineX - baseW / 2;
    const baseY = shrineBaseY - baseH;
    
    // 5-value gradient on base (light from right/sun side)
    const baseGrad = ctx.createLinearGradient(baseX, 0, baseX + baseW, 0);
    baseGrad.addColorStop(0, COLORS.shrineShadow);
    baseGrad.addColorStop(0.3, COLORS.shrineMid);
    baseGrad.addColorStop(0.7, COLORS.shrineLight);
    baseGrad.addColorStop(1, '#f0e0c8'); // Highlight from sun
    
    ctx.fillStyle = baseGrad;
    resetSeed(1001);
    drawDamagedRect(baseX, baseY, baseW, baseH, 1.5);
    ctx.fill();
    
    addShrineTexture(baseX, baseY, baseW, baseH);
    
    // MAIN SHRINE BODY
    const bodyW = 70;
    const bodyH = 55;
    const bodyX = shrineX - bodyW / 2;
    const bodyY = baseY - bodyH;
    
    const bodyGrad = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
    bodyGrad.addColorStop(0, COLORS.shrineDeep);
    bodyGrad.addColorStop(0.15, COLORS.shrineShadow);
    bodyGrad.addColorStop(0.4, COLORS.shrineMid);
    bodyGrad.addColorStop(0.75, COLORS.shrineLight);
    bodyGrad.addColorStop(1, '#e8d8c0');
    
    ctx.fillStyle = bodyGrad;
    resetSeed(1002);
    drawDamagedRect(bodyX, bodyY, bodyW, bodyH, 1.2);
    ctx.fill();
    
    addShrineTexture(bodyX, bodyY, bodyW, bodyH);
    
    // LAYER 4: Vertical streaking (accumulation)
    ctx.save();
    resetSeed(1003);
    for (let i = 0; i < 2; i++) {
        const streakX = bodyX + bodyW * (0.2 + random() * 0.5);
        const streakW = 3 + random() * 4;
        
        const streakGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
        streakGrad.addColorStop(0, 'rgba(50, 45, 40, 0)');
        streakGrad.addColorStop(0.3, 'rgba(50, 45, 40, 0.02)');
        streakGrad.addColorStop(1, 'rgba(40, 35, 30, 0.05)');
        
        ctx.fillStyle = streakGrad;
        ctx.fillRect(streakX, bodyY, streakW, bodyH);
    }
    ctx.restore();
    
    // ROOF
    const roofOverhang = 15;
    const roofH = 25;
    const roofPeakY = bodyY - roofH;
    
    // Roof shadow side (left slope)
    ctx.fillStyle = COLORS.shrineShadow;
    ctx.beginPath();
    ctx.moveTo(shrineX, roofPeakY);
    ctx.lineTo(bodyX - roofOverhang + random() * 2, bodyY + 2);
    ctx.lineTo(shrineX - 5, bodyY + 2);
    ctx.closePath();
    ctx.fill();
    
    // Roof lit side (right slope) - catches dawn light
    const roofLitGrad = ctx.createLinearGradient(shrineX, roofPeakY, bodyX + bodyW + roofOverhang, bodyY);
    roofLitGrad.addColorStop(0, COLORS.shrineMid);
    roofLitGrad.addColorStop(0.5, COLORS.shrineLight);
    roofLitGrad.addColorStop(1, '#ffe8d0'); // Dawn highlight
    
    ctx.fillStyle = roofLitGrad;
    ctx.beginPath();
    ctx.moveTo(shrineX, roofPeakY);
    ctx.lineTo(bodyX + bodyW + roofOverhang - random() * 2, bodyY + 2);
    ctx.lineTo(shrineX + 5, bodyY + 2);
    ctx.closePath();
    ctx.fill();
    
    // OPENING (dark interior)
    const openingW = 25;
    const openingH = 35;
    const openingX = shrineX - openingW / 2 + 3; // Slightly off-center toward light
    const openingY = bodyY + bodyH - openingH - 5;
    
    const openingGrad = ctx.createLinearGradient(openingX, 0, openingX + openingW, 0);
    openingGrad.addColorStop(0, '#1a1512');
    openingGrad.addColorStop(0.5, '#252018');
    openingGrad.addColorStop(1, '#1a1512');
    
    ctx.fillStyle = openingGrad;
    ctx.fillRect(openingX, openingY, openingW, openingH);
    
    // Subtle hint of something inside (offering?)
    ctx.fillStyle = 'rgba(200, 180, 140, 0.15)';
    ctx.fillRect(openingX + 8, openingY + openingH - 12, 10, 8);
    
    // CAST SHADOW from shrine onto ground
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    const shadowGrad = ctx.createLinearGradient(shrineX, shrineBaseY, shrineX - 80, shrineBaseY + 30);
    shadowGrad.addColorStop(0, 'rgba(30, 25, 20, 0.4)');
    shadowGrad.addColorStop(0.5, 'rgba(30, 25, 20, 0.2)');
    shadowGrad.addColorStop(1, 'rgba(30, 25, 20, 0)');
    
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(baseX, shrineBaseY);
    ctx.lineTo(baseX - 60, shrineBaseY + 25);
    ctx.lineTo(baseX - 40, shrineBaseY + 35);
    ctx.lineTo(baseX + baseW * 0.3, shrineBaseY + 8);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    return { x: shrineX, y: roofPeakY, baseY: shrineBaseY };
}

// =============================================================================
// SMALL DETAILS - Restraint: just enough to suggest life
// =============================================================================

function drawDetails(ledgeY, shrine) {
    // Small offering stones near shrine
    resetSeed(2000);
    
    ctx.save();
    for (let i = 0; i < 3; i++) {
        const stoneX = shrine.x + 60 + random() * 30;
        const stoneY = ledgeY - 3 - random() * 2;
        const stoneW = 5 + random() * 8;
        const stoneH = 3 + random() * 4;
        
        // Simple 2-value stone (not full treatment - these are background)
        const stoneGrad = ctx.createLinearGradient(stoneX, 0, stoneX + stoneW, 0);
        stoneGrad.addColorStop(0, '#5a5045');
        stoneGrad.addColorStop(1, '#8a7a68');
        
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(stoneX, stoneY, stoneW, stoneH);
    }
    ctx.restore();
    
    // A single small tree/bush on the ledge (left side, balances composition)
    const treeX = W * 0.12;
    const treeY = ledgeY;
    
    // Trunk - simple
    ctx.fillStyle = '#4a4035';
    ctx.fillRect(treeX - 3, treeY - 35, 6, 35);
    
    // Foliage - clustered masses, not detailed
    ctx.save();
    resetSeed(2001);
    
    const foliageColor = '#3a4a35';
    ctx.fillStyle = foliageColor;
    
    // Main foliage mass
    ctx.beginPath();
    ctx.arc(treeX, treeY - 45, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(treeX - 12, treeY - 38, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(treeX + 10, treeY - 40, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Light hitting right side of foliage
    const foliageLight = ctx.createRadialGradient(treeX + 15, treeY - 45, 0, treeX + 15, treeY - 45, 20);
    foliageLight.addColorStop(0, 'rgba(100, 120, 80, 0.3)');
    foliageLight.addColorStop(1, 'rgba(100, 120, 80, 0)');
    ctx.fillStyle = foliageLight;
    ctx.beginPath();
    ctx.arc(treeX + 8, treeY - 42, 16, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// =============================================================================
// ATMOSPHERIC EFFECTS - Subtle, unifying
// =============================================================================

function drawAtmosphere() {
    // Overall warm glow from sun direction
    ctx.save();
    
    const glowGrad = ctx.createRadialGradient(W * 0.7, H * 0.48, 0, W * 0.7, H * 0.48, W * 0.6);
    glowGrad.addColorStop(0, 'rgba(255, 220, 180, 0.08)');
    glowGrad.addColorStop(0.5, 'rgba(255, 200, 160, 0.03)');
    glowGrad.addColorStop(1, 'rgba(255, 200, 160, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Subtle vignette
    const vignetteGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.3, W * 0.5, H * 0.5, W * 0.8);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
    
    ctx.restore();
}

// Dust particles in dawn light
function drawDustParticles() {
    ctx.save();
    resetSeed(3000);
    
    // Particles only visible in the light shaft area
    const lightZoneX = W * 0.5;
    const lightZoneY = H * 0.3;
    
    for (let i = 0; i < 25; i++) {
        const px = lightZoneX + (random() - 0.3) * W * 0.5;
        const py = lightZoneY + random() * H * 0.4;
        const size = 1 + random() * 2;
        const alpha = 0.1 + random() * 0.2;
        
        // Only particles in the "light" area are visible
        const inLight = px > W * 0.4 && py < H * 0.65;
        if (!inLight) continue;
        
        ctx.fillStyle = `rgba(255, 240, 220, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// =============================================================================
// MAIN RENDER
// =============================================================================

function render() {
    console.log('Art Study 008 - Mountain Shrine at Dawn');
    
    ctx.clearRect(0, 0, W, H);
    
    // Back to front
    drawSky();
    drawMountains();
    drawMist();
    
    const ledgeY = drawLedge();
    const shrine = drawShrine(ledgeY);
    drawDetails(ledgeY, shrine);
    
    drawDustParticles();
    drawAtmosphere();
    
    console.log('Scene complete');
}

render();
