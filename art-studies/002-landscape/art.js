// ============================================
// ART STUDY #2: MOUNTAIN LANDSCAPE (REBUILT)
// ============================================
// Target: 1800+ lines (exceeds Study #1's 1600)
// Chunks: 9 parts of ~200 lines each
// Goal: Master depth, reflections, natural textures
// Subject: Alpine lake with mountains at golden hour
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

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

function lerpColor(r1, g1, b1, r2, g2, b2, t) {
    return {
        r: Math.floor(lerp(r1, r2, t)),
        g: Math.floor(lerp(g1, g2, t)),
        b: Math.floor(lerp(b1, b2, t))
    };
}

// ============================================
// 1. SKY - RICH MULTI-LAYER SUNSET
// ============================================

function drawSky() {
    // Primary gradient - 12 color stops for smooth transition
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    skyGrad.addColorStop(0.00, '#0a0a1a');    // Deep night at zenith
    skyGrad.addColorStop(0.08, '#0d1025');    // Dark blue
    skyGrad.addColorStop(0.15, '#141830');    // Navy
    skyGrad.addColorStop(0.22, '#1e2545');    // Deep steel
    skyGrad.addColorStop(0.30, '#2a3555');    // Steel blue
    skyGrad.addColorStop(0.38, '#3a4565');    // Muted blue
    skyGrad.addColorStop(0.46, '#4a5575');    // Dusty blue
    skyGrad.addColorStop(0.54, '#5a6580');    // Gray-blue
    skyGrad.addColorStop(0.62, '#7a6878');    // Mauve transition
    skyGrad.addColorStop(0.70, '#9a6868');    // Dusty rose
    skyGrad.addColorStop(0.78, '#c07858');    // Copper
    skyGrad.addColorStop(0.85, '#d89048');    // Amber
    skyGrad.addColorStop(0.92, '#e8a840');    // Gold
    skyGrad.addColorStop(1.00, '#f0c048');    // Bright horizon
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.55);
    
    // Atmospheric color banding (subtle horizontal layers)
    for (let i = 0; i < 30; i++) {
        const y = (i / 30) * H * 0.55;
        const bandHeight = H * 0.02;
        const alpha = 0.015 + Math.sin(i * 0.3) * 0.008;
        
        // Alternate warm/cool bands
        if (i % 2 === 0) {
            ctx.fillStyle = `rgba(255, 180, 120, ${alpha})`;
        } else {
            ctx.fillStyle = `rgba(100, 120, 180, ${alpha})`;
        }
        ctx.fillRect(0, y, W, bandHeight);
    }
    
    // Upper atmosphere glow (subtle purple haze)
    const upperGlow = ctx.createLinearGradient(0, 0, 0, H * 0.25);
    upperGlow.addColorStop(0, 'rgba(60, 40, 80, 0.15)');
    upperGlow.addColorStop(0.5, 'rgba(60, 40, 80, 0.05)');
    upperGlow.addColorStop(1, 'rgba(60, 40, 80, 0)');
    ctx.fillStyle = upperGlow;
    ctx.fillRect(0, 0, W, H * 0.25);
}

// ============================================
// 2. STARS - VISIBLE IN UPPER SKY
// ============================================

function drawStars() {
    // Only visible in dark upper portion
    for (let i = 0; i < 200; i++) {
        const x = seededRandom(i * 1.23) * W;
        const y = seededRandom(i * 2.34) * H * 0.35;
        const brightness = seededRandom(i * 3.45);
        
        // Fade stars as they approach horizon
        const fadeT = y / (H * 0.35);
        const alpha = (0.3 + brightness * 0.5) * (1 - fadeT * 0.8);
        
        if (alpha > 0.1) {
            const size = 0.5 + seededRandom(i * 4.56) * 1.5;
            
            // Star glow
            const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            glowGrad.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.4})`);
            glowGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, size * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Star core
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ============================================
// 3. SUN - DETAILED WITH CORONA
// ============================================

function drawSun() {
    const sunX = W * 0.72;
    const sunY = H * 0.40;
    const sunRadius = 50;
    
    // Outermost corona (very wide, subtle)
    for (let layer = 6; layer >= 0; layer--) {
        const coronaR = sunRadius * (4 + layer * 1.2);
        const alpha = 0.04 - layer * 0.005;
        
        const coronaGrad = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, coronaR);
        coronaGrad.addColorStop(0, `rgba(255, 220, 150, ${alpha})`);
        coronaGrad.addColorStop(0.4, `rgba(255, 180, 100, ${alpha * 0.5})`);
        coronaGrad.addColorStop(0.7, `rgba(255, 140, 60, ${alpha * 0.2})`);
        coronaGrad.addColorStop(1, 'rgba(255, 100, 40, 0)');
        
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, coronaR, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Sun rays (crepuscular rays)
    ctx.save();
    ctx.translate(sunX, sunY);
    
    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const rayLength = sunRadius * (2.2 + seededRandom(i * 77) * 1.5);
        const rayWidth = 12 + seededRandom(i * 78) * 18;
        const rayAlpha = 0.06 + seededRandom(i * 79) * 0.04;
        
        ctx.save();
        ctx.rotate(angle);
        
        const rayGrad = ctx.createLinearGradient(sunRadius * 0.8, 0, rayLength, 0);
        rayGrad.addColorStop(0, `rgba(255, 240, 180, ${rayAlpha})`);
        rayGrad.addColorStop(0.4, `rgba(255, 200, 120, ${rayAlpha * 0.5})`);
        rayGrad.addColorStop(1, 'rgba(255, 160, 80, 0)');
        
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(sunRadius * 0.8, -rayWidth / 3);
        ctx.lineTo(rayLength, 0);
        ctx.lineTo(sunRadius * 0.8, rayWidth / 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    ctx.restore();
    
    // Sun disc with realistic limb darkening
    const sunGrad = ctx.createRadialGradient(
        sunX - sunRadius * 0.18, sunY - sunRadius * 0.18, 0,
        sunX, sunY, sunRadius
    );
    sunGrad.addColorStop(0.0, '#fffff8');
    sunGrad.addColorStop(0.2, '#fffef0');
    sunGrad.addColorStop(0.4, '#fff8d8');
    sunGrad.addColorStop(0.6, '#ffe8a8');
    sunGrad.addColorStop(0.75, '#ffd070');
    sunGrad.addColorStop(0.88, '#ffb040');
    sunGrad.addColorStop(0.95, '#ff9020');
    sunGrad.addColorStop(1.0, '#ff7010');
    
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Solar surface granulation
    ctx.save();
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 80; i++) {
        const angle = seededRandom(i * 111) * Math.PI * 2;
        const dist = seededRandom(i * 112) * sunRadius * 0.88;
        const spotX = sunX + Math.cos(angle) * dist;
        const spotY = sunY + Math.sin(angle) * dist;
        const spotSize = 2 + seededRandom(i * 113) * 6;
        
        ctx.fillStyle = seededRandom(i * 114) > 0.5 ? '#fffae0' : '#ffe0a0';
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// ============================================
// 4. CLOUDS - DETAILED CUMULUS & WISPS
// ============================================

function drawClouds() {
    // High altitude cirrus (thin wisps)
    drawCirrusClouds();
    
    // Mid-level alto clouds
    drawAltoClouds();
    
    // Lower cumulus (lit by sunset)
    drawCumulusClouds();
}

function drawCirrusClouds() {
    ctx.save();
    ctx.globalAlpha = 0.25;
    
    for (let i = 0; i < 12; i++) {
        const seed = i * 321;
        const startX = seededRandom(seed) * W * 1.3 - W * 0.15;
        const startY = H * 0.05 + seededRandom(seed + 1) * H * 0.12;
        const length = 80 + seededRandom(seed + 2) * 150;
        const curve = (seededRandom(seed + 3) - 0.5) * 40;
        
        // Wispy stroke
        ctx.strokeStyle = 'rgba(255, 220, 200, 0.3)';
        ctx.lineWidth = 1 + seededRandom(seed + 4) * 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
            startX + length * 0.5, startY + curve,
            startX + length, startY + curve * 0.5
        );
        ctx.stroke();
        
        // Add feathered edges
        for (let f = 0; f < 5; f++) {
            const ft = seededRandom(seed + 10 + f) * 0.8 + 0.1;
            const fx = startX + length * ft;
            const fy = startY + curve * ft * 0.7;
            const featherLen = 15 + seededRandom(seed + 20 + f) * 20;
            const featherAngle = (seededRandom(seed + 30 + f) - 0.5) * 0.5;
            
            ctx.strokeStyle = 'rgba(255, 230, 210, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(featherAngle) * featherLen, fy + Math.sin(featherAngle) * featherLen);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawAltoClouds() {
    // Mid-height scattered clouds
    for (let i = 0; i < 8; i++) {
        const seed = i * 432;
        const x = seededRandom(seed) * W * 1.2 - W * 0.1;
        const y = H * 0.18 + seededRandom(seed + 1) * H * 0.12;
        const width = 60 + seededRandom(seed + 2) * 100;
        const height = 15 + seededRandom(seed + 3) * 25;
        
        drawDetailedCloud(x, y, width, height, 0.3, seed);
    }
}

function drawCumulusClouds() {
    // Lower, more dramatic clouds lit from below
    const cloudPositions = [
        { x: W * 0.08, y: H * 0.32, w: 180, h: 50 },
        { x: W * 0.30, y: H * 0.36, w: 150, h: 40 },
        { x: W * 0.55, y: H * 0.30, w: 200, h: 55 },
        { x: W * 0.85, y: H * 0.34, w: 160, h: 45 },
        { x: W * 0.15, y: H * 0.42, w: 120, h: 35 },
        { x: W * 0.70, y: H * 0.40, w: 140, h: 38 },
    ];
    
    cloudPositions.forEach((cloud, idx) => {
        drawDetailedCloud(cloud.x, cloud.y, cloud.w, cloud.h, 0.5, idx * 543);
    });
}

function drawDetailedCloud(x, y, width, height, alpha, seed) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Multiple overlapping puffs create cloud shape
    const puffCount = 10 + Math.floor(seededRandom(seed) * 8);
    
    // First pass: darker undersides (shadow)
    for (let p = 0; p < puffCount; p++) {
        const pt = p / puffCount;
        const px = x + pt * width + (seededRandom(seed + p * 0.1) - 0.5) * 30;
        const py = y + seededRandom(seed + p * 0.2) * height * 0.6;
        const pw = 25 + seededRandom(seed + p * 0.3) * 40;
        const ph = 12 + seededRandom(seed + p * 0.4) * 18;
        
        // Shadow/underlit gradient
        const shadowGrad = ctx.createLinearGradient(px, py - ph, px, py + ph * 1.5);
        shadowGrad.addColorStop(0, 'rgba(80, 60, 70, 0.3)');
        shadowGrad.addColorStop(0.4, 'rgba(150, 100, 90, 0.4)');
        shadowGrad.addColorStop(0.7, 'rgba(220, 150, 120, 0.5)');
        shadowGrad.addColorStop(1, 'rgba(255, 200, 150, 0.3)');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(px, py + ph * 0.3, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Second pass: lit tops
    for (let p = 0; p < puffCount; p++) {
        const pt = p / puffCount;
        const px = x + pt * width + (seededRandom(seed + p * 0.1) - 0.5) * 30;
        const py = y + seededRandom(seed + p * 0.2) * height * 0.4 - height * 0.2;
        const pw = 20 + seededRandom(seed + p * 0.5) * 35;
        const ph = 10 + seededRandom(seed + p * 0.6) * 15;
        
        // Top-lit gradient
        const litGrad = ctx.createRadialGradient(px - pw * 0.2, py - ph * 0.3, 0, px, py, pw);
        litGrad.addColorStop(0, 'rgba(255, 255, 250, 0.9)');
        litGrad.addColorStop(0.3, 'rgba(255, 245, 235, 0.7)');
        litGrad.addColorStop(0.6, 'rgba(255, 230, 210, 0.5)');
        litGrad.addColorStop(1, 'rgba(255, 210, 180, 0.2)');
        
        ctx.fillStyle = litGrad;
        ctx.beginPath();
        ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Edge detail - wispy tendrils
    ctx.globalAlpha = alpha * 0.4;
    for (let e = 0; e < 6; e++) {
        const ex = x + seededRandom(seed + 100 + e) * width;
        const ey = y + height * 0.3 + seededRandom(seed + 110 + e) * height * 0.4;
        const tendrilLen = 10 + seededRandom(seed + 120 + e) * 20;
        
        ctx.strokeStyle = 'rgba(255, 220, 190, 0.4)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.quadraticCurveTo(ex + tendrilLen * 0.5, ey + tendrilLen * 0.8, ex + tendrilLen, ey + tendrilLen);
        ctx.stroke();
    }
    
    ctx.restore();
}

// ============================================
// 5. GOD RAYS - VOLUMETRIC LIGHT
// ============================================

function drawGodRays() {
    const sunX = W * 0.72;
    const sunY = H * 0.40;
    
    ctx.save();
    
    // Main volumetric rays
    for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 0.7 + Math.PI * 0.15;
        const rayLen = 250 + seededRandom(i * 88) * 200;
        const rayWidth = 25 + seededRandom(i * 89) * 35;
        const rayAlpha = 0.03 + seededRandom(i * 90) * 0.03;
        
        const endX = sunX + Math.cos(angle) * rayLen;
        const endY = sunY + Math.sin(angle) * rayLen;
        
        // Ray gradient
        const rayGrad = ctx.createLinearGradient(sunX, sunY, endX, endY);
        rayGrad.addColorStop(0, `rgba(255, 240, 180, ${rayAlpha})`);
        rayGrad.addColorStop(0.3, `rgba(255, 220, 150, ${rayAlpha * 0.7})`);
        rayGrad.addColorStop(0.6, `rgba(255, 200, 120, ${rayAlpha * 0.4})`);
        rayGrad.addColorStop(1, 'rgba(255, 180, 100, 0)');
        
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(endX - Math.sin(angle) * rayWidth, endY + Math.cos(angle) * rayWidth);
        ctx.lineTo(endX + Math.sin(angle) * rayWidth, endY - Math.cos(angle) * rayWidth);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// ============================================
// 6. FAR MOUNTAINS - ATMOSPHERIC SILHOUETTES
// ============================================

function drawFarMountains() {
    // Layer 1: Most distant (heavy haze, blue-purple)
    drawMountainLayer(H * 0.36, 0.25, '#8090b0', '#6878a8', 0.85, 1);
    // Layer 2: Mid-distant (moderate haze)
    drawMountainLayer(H * 0.40, 0.4, '#607898', '#506888', 0.65, 2);
    // Layer 3: Near-distant (light haze)
    drawMountainLayer(H * 0.44, 0.55, '#4a6080', '#3a5070', 0.45, 3);
}

function drawMountainLayer(baseY, heightScale, lightColor, darkColor, haze, layerNum) {
    ctx.save();
    
    // Generate jagged mountain profile
    const points = [];
    const segments = 60;
    
    for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * W;
        
        // Multiple octaves of noise for natural look
        let elevation = 0;
        elevation += Math.sin(i * 0.15 + layerNum) * 50 * heightScale;
        elevation += Math.sin(i * 0.3 + layerNum * 2) * 30 * heightScale;
        elevation += Math.sin(i * 0.6 + layerNum * 3) * 15 * heightScale;
        elevation += (seededRandom(i * 100 + layerNum * 1000) - 0.5) * 20 * heightScale;
        
        // Create distinct peaks
        if (i % 8 === 0 || i % 13 === 0) {
            elevation -= 30 * heightScale * seededRandom(i * 200 + layerNum);
        }
        
        points.push({ x, y: baseY + elevation });
    }
    
    // Draw filled mountain shape
    ctx.beginPath();
    ctx.moveTo(0, H * 0.55);
    
    points.forEach((p, idx) => {
        if (idx === 0) {
            ctx.lineTo(p.x, p.y);
        } else {
            // Smooth curve between points
            const prev = points[idx - 1];
            const cpX = (prev.x + p.x) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cpX, (prev.y + p.y) / 2);
        }
    });
    
    ctx.lineTo(W, H * 0.55);
    ctx.closePath();
    
    // Gradient fill with atmospheric perspective
    const mtGrad = ctx.createLinearGradient(0, baseY - 80 * heightScale, 0, H * 0.55);
    mtGrad.addColorStop(0, lightColor);
    mtGrad.addColorStop(0.5, darkColor);
    mtGrad.addColorStop(1, lerpColorHex(darkColor, '#f0c048', 0.15));
    
    ctx.fillStyle = mtGrad;
    ctx.fill();
    
    // Add subtle ridgeline highlight
    if (haze < 0.7) {
        ctx.strokeStyle = `rgba(255, 240, 220, ${0.15 - haze * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        points.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
    }
    
    // Snow on highest peaks (only if not too hazy)
    if (haze < 0.6) {
        drawDistantSnowCaps(points, baseY, heightScale, haze);
    }
    
    ctx.restore();
}

function drawDistantSnowCaps(points, baseY, scale, haze) {
    ctx.save();
    ctx.globalAlpha = 0.5 - haze * 0.4;
    
    // Find local peaks
    for (let i = 2; i < points.length - 2; i++) {
        const p = points[i];
        const prev = points[i - 1];
        const next = points[i + 1];
        
        // Is this a peak?
        if (p.y < prev.y && p.y < next.y && p.y < baseY - 30 * scale) {
            const snowWidth = 15 + seededRandom(i * 333) * 20;
            const snowHeight = 8 + seededRandom(i * 334) * 15;
            
            const snowGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + snowHeight);
            snowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            snowGrad.addColorStop(0.5, 'rgba(240, 245, 255, 0.5)');
            snowGrad.addColorStop(1, 'rgba(220, 230, 245, 0)');
            
            ctx.fillStyle = snowGrad;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - snowWidth, p.y + snowHeight);
            ctx.lineTo(p.x + snowWidth * 0.8, p.y + snowHeight * 0.9);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// Helper to lerp hex colors
function lerpColorHex(hex1, hex2, t) {
    const r1 = parseInt(hex1.slice(1, 3), 16);
    const g1 = parseInt(hex1.slice(3, 5), 16);
    const b1 = parseInt(hex1.slice(5, 7), 16);
    const r2 = parseInt(hex2.slice(1, 3), 16);
    const g2 = parseInt(hex2.slice(3, 5), 16);
    const b2 = parseInt(hex2.slice(5, 7), 16);
    
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// 7. MAIN MOUNTAINS - HIGHLY DETAILED
// ============================================

function drawMainMountains() {
    // Three prominent peaks with full detail
    drawDetailedMountain(W * 0.12, H * 0.50, 320, 250, 'left', 1);
    drawDetailedMountain(W * 0.48, H * 0.50, 400, 320, 'center', 2);
    drawDetailedMountain(W * 0.82, H * 0.50, 280, 220, 'right', 3);
}

function drawDetailedMountain(peakX, baseY, width, height, position, mtNum) {
    const peakY = baseY - height;
    const leftX = peakX - width * 0.55;
    const rightX = peakX + width * 0.45;
    
    // ===== SHADOW FACE (LEFT) =====
    const shadowGrad = ctx.createLinearGradient(leftX, baseY, peakX, peakY);
    shadowGrad.addColorStop(0, '#3a4858');
    shadowGrad.addColorStop(0.3, '#2a3848');
    shadowGrad.addColorStop(0.6, '#1a2838');
    shadowGrad.addColorStop(1, '#2a3a4a');
    
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(leftX, baseY);
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Shadow face rock texture
    drawRockFaceTexture(peakX, peakY, leftX, baseY, 'shadow', mtNum * 100);
    
    // ===== LIT FACE (RIGHT) =====
    const litGrad = ctx.createLinearGradient(peakX, peakY, rightX, baseY);
    litGrad.addColorStop(0, '#8898a8');
    litGrad.addColorStop(0.2, '#7888a0');
    litGrad.addColorStop(0.5, '#687898');
    litGrad.addColorStop(0.8, '#586888');
    litGrad.addColorStop(1, '#4a5a70');
    
    ctx.fillStyle = litGrad;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(rightX, baseY);
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Lit face rock texture  
    drawRockFaceTexture(peakX, peakY, rightX, baseY, 'lit', mtNum * 100 + 500);
    
    // ===== GEOLOGICAL FEATURES =====
    drawGeologicalFeatures(peakX, peakY, leftX, rightX, baseY, height, mtNum);
    
    // ===== SNOW CAP =====
    drawMountainSnowCap(peakX, peakY, width, height, mtNum);
    
    // ===== RIDGE HIGHLIGHT =====
    ctx.strokeStyle = 'rgba(180, 200, 220, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX, baseY);
    ctx.stroke();
}

function drawRockFaceTexture(peakX, peakY, baseX, baseY, side, seed) {
    ctx.save();
    
    // Clip to mountain face
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(baseX, baseY);
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.clip();
    
    const isLit = side === 'lit';
    const baseAlpha = isLit ? 0.2 : 0.15;
    
    // ===== ROCK STRIATIONS (horizontal layers) =====
    ctx.globalAlpha = baseAlpha;
    const stripeCount = 35;
    
    for (let i = 0; i < stripeCount; i++) {
        const t = i / stripeCount;
        const y = peakY + (baseY - peakY) * t;
        const xExtent = Math.abs(baseX - peakX) * t;
        const startX = side === 'lit' ? peakX : peakX - xExtent;
        const endX = side === 'lit' ? peakX + xExtent : peakX;
        
        // Vary stripe appearance
        const stripeAlpha = 0.1 + seededRandom(seed + i * 11) * 0.15;
        ctx.strokeStyle = seededRandom(seed + i * 12) > 0.6 
            ? `rgba(30, 40, 50, ${stripeAlpha})`
            : `rgba(80, 90, 100, ${stripeAlpha})`;
        ctx.lineWidth = 1 + seededRandom(seed + i * 13) * 2;
        
        // Wavy line for natural look
        ctx.beginPath();
        ctx.moveTo(startX, y);
        
        const segments = 8;
        for (let s = 1; s <= segments; s++) {
            const sx = startX + (endX - startX) * (s / segments);
            const sy = y + (seededRandom(seed + i * 20 + s) - 0.5) * 8;
            ctx.lineTo(sx, sy);
        }
        ctx.stroke();
    }
    
    // ===== ROCK PATCHES (weathered areas) =====
    ctx.globalAlpha = baseAlpha * 0.8;
    
    for (let i = 0; i < 50; i++) {
        const patchSeed = seed + 1000 + i * 17;
        const t = seededRandom(patchSeed) * 0.85 + 0.08;
        const y = peakY + (baseY - peakY) * t;
        const xRange = Math.abs(baseX - peakX) * t;
        const x = side === 'lit' 
            ? peakX + seededRandom(patchSeed + 1) * xRange * 0.9
            : peakX - seededRandom(patchSeed + 1) * xRange * 0.9;
        
        const patchW = 8 + seededRandom(patchSeed + 2) * 25;
        const patchH = patchW * (0.3 + seededRandom(patchSeed + 3) * 0.4);
        const rotation = (seededRandom(patchSeed + 4) - 0.5) * 0.8;
        
        // Patch color
        const isDark = seededRandom(patchSeed + 5) > 0.5;
        ctx.fillStyle = isDark 
            ? `rgba(25, 35, 45, ${0.15 + seededRandom(patchSeed + 6) * 0.15})`
            : `rgba(70, 80, 95, ${0.1 + seededRandom(patchSeed + 7) * 0.1})`;
        
        ctx.beginPath();
        ctx.ellipse(x, y, patchW, patchH, rotation, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // ===== VERTICAL CRACKS =====
    ctx.globalAlpha = baseAlpha * 0.6;
    ctx.strokeStyle = 'rgba(20, 30, 40, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 15; i++) {
        const crackSeed = seed + 2000 + i * 23;
        const startT = seededRandom(crackSeed) * 0.4;
        const startY = peakY + (baseY - peakY) * startT;
        const startXRange = Math.abs(baseX - peakX) * startT;
        const startX = side === 'lit'
            ? peakX + seededRandom(crackSeed + 1) * startXRange
            : peakX - seededRandom(crackSeed + 1) * startXRange;
        
        const crackLen = 30 + seededRandom(crackSeed + 2) * 60;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let cx = startX;
        let cy = startY;
        const segments = 5;
        for (let s = 0; s < segments; s++) {
            cx += (seededRandom(crackSeed + 10 + s) - 0.5) * 15;
            cy += crackLen / segments;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawGeologicalFeatures(peakX, peakY, leftX, rightX, baseY, height, mtNum) {
    ctx.save();
    
    // Calculate width from coordinates
    const width = rightX - leftX;
    
    // ===== CLIFF BANDS (lighter horizontal stripes) =====
    ctx.globalAlpha = 0.15;
    
    const bandCount = 4 + Math.floor(seededRandom(mtNum * 77) * 3);
    for (let i = 0; i < bandCount; i++) {
        const bandSeed = mtNum * 500 + i * 31;
        const bandY = peakY + height * (0.2 + seededRandom(bandSeed) * 0.6);
        const bandThickness = 3 + seededRandom(bandSeed + 1) * 8;
        
        // Lit side band
        const litWidth = (rightX - peakX) * ((bandY - peakY) / height);
        ctx.fillStyle = 'rgba(160, 170, 185, 0.3)';
        ctx.fillRect(peakX + 2, bandY, litWidth * 0.9, bandThickness);
        
        // Shadow side band (darker)
        const shadowWidth = (peakX - leftX) * ((bandY - peakY) / height);
        ctx.fillStyle = 'rgba(80, 90, 100, 0.2)';
        ctx.fillRect(peakX - shadowWidth * 0.9, bandY, shadowWidth * 0.9 - 2, bandThickness);
    }
    
    // ===== COULOIRS (vertical gullies) =====
    ctx.globalAlpha = 0.12;
    
    for (let i = 0; i < 3; i++) {
        const coulSeed = mtNum * 600 + i * 41;
        const coulX = peakX + (seededRandom(coulSeed) - 0.5) * width * 0.4;
        const coulWidth = 5 + seededRandom(coulSeed + 1) * 10;
        
        ctx.fillStyle = 'rgba(20, 30, 45, 0.25)';
        ctx.beginPath();
        ctx.moveTo(coulX, peakY + height * 0.1);
        ctx.lineTo(coulX - coulWidth, baseY);
        ctx.lineTo(coulX + coulWidth, baseY);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// ============================================
// 8. DETAILED SNOW CAPS
// ============================================

function drawMountainSnowCap(peakX, peakY, width, height, mtNum) {
    const snowExtent = height * 0.38;
    
    ctx.save();
    
    // ===== MAIN SNOW MASS =====
    // Snow shape follows mountain contours
    const snowGrad = ctx.createLinearGradient(peakX, peakY, peakX, peakY + snowExtent);
    snowGrad.addColorStop(0, '#ffffff');
    snowGrad.addColorStop(0.15, '#fafcff');
    snowGrad.addColorStop(0.35, '#f0f4fa');
    snowGrad.addColorStop(0.55, '#e0e8f2');
    snowGrad.addColorStop(0.75, '#d0dce8');
    snowGrad.addColorStop(1, 'rgba(180, 195, 215, 0)');
    
    ctx.fillStyle = snowGrad;
    
    // Irregular snow edge
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    
    // Left snow edge (shadow side - less snow)
    const leftSnowPoints = 12;
    for (let i = 0; i <= leftSnowPoints; i++) {
        const t = i / leftSnowPoints;
        const baseSnowY = peakY + snowExtent * t * 0.7;
        const snowX = peakX - width * 0.35 * t;
        const variation = seededRandom(mtNum * 200 + i) * 15 - 5;
        ctx.lineTo(snowX, baseSnowY + variation);
    }
    
    // Bottom irregular edge
    const bottomSnowY = peakY + snowExtent * 0.8;
    for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const x = peakX - width * 0.25 + width * 0.55 * t;
        const dripY = bottomSnowY + seededRandom(mtNum * 300 + i) * 25 + Math.sin(i * 1.5) * 10;
        ctx.lineTo(x, dripY);
    }
    
    // Right snow edge (lit side - more snow)
    for (let i = leftSnowPoints; i >= 0; i--) {
        const t = i / leftSnowPoints;
        const baseSnowY = peakY + snowExtent * t * 0.85;
        const snowX = peakX + width * 0.4 * t;
        const variation = seededRandom(mtNum * 400 + i) * 12 - 3;
        ctx.lineTo(snowX, baseSnowY + variation);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // ===== SNOW SHADOWS (crevasses) =====
    ctx.globalAlpha = 0.2;
    
    for (let i = 0; i < 8; i++) {
        const crevSeed = mtNum * 500 + i * 51;
        const crevX = peakX + (seededRandom(crevSeed) - 0.5) * width * 0.4;
        const crevY = peakY + seededRandom(crevSeed + 1) * snowExtent * 0.6;
        const crevLen = 15 + seededRandom(crevSeed + 2) * 30;
        const crevAngle = (seededRandom(crevSeed + 3) - 0.5) * 0.5 + Math.PI * 0.5;
        
        ctx.strokeStyle = 'rgba(100, 120, 150, 0.4)';
        ctx.lineWidth = 2 + seededRandom(crevSeed + 4) * 3;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(crevX, crevY);
        ctx.lineTo(
            crevX + Math.cos(crevAngle) * crevLen,
            crevY + Math.sin(crevAngle) * crevLen
        );
        ctx.stroke();
    }
    
    // ===== SNOW SPARKLE (light reflections) =====
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < 30; i++) {
        const sparkSeed = mtNum * 600 + i * 61;
        const sx = peakX + (seededRandom(sparkSeed) - 0.4) * width * 0.35;
        const sy = peakY + seededRandom(sparkSeed + 1) * snowExtent * 0.5;
        const sparkSize = 1 + seededRandom(sparkSeed + 2) * 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // ===== WIND-BLOWN SNOW WISPS =====
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
        const wispSeed = mtNum * 700 + i * 71;
        const wx = peakX + (seededRandom(wispSeed) - 0.3) * width * 0.3;
        const wy = peakY + seededRandom(wispSeed + 1) * snowExtent * 0.3;
        const wispLen = 20 + seededRandom(wispSeed + 2) * 30;
        
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(
            wx + wispLen * 0.6, wy - 5,
            wx + wispLen, wy + 3
        );
        ctx.stroke();
    }
    
    ctx.restore();
}

// ============================================
// 9. FOREST LAYERS - DETAILED PINE TREES
// ============================================

function drawForest() {
    // Layer 1: Most distant (darkest, smallest, most haze)
    drawForestLayer(H * 0.485, 0.35, '#0a1518', '#050d10', 0.7, 40, 1);
    // Layer 2: Mid-distant
    drawForestLayer(H * 0.495, 0.5, '#0d1a18', '#071210', 0.5, 32, 2);
    // Layer 3: Near-distant  
    drawForestLayer(H * 0.505, 0.7, '#102018', '#081510', 0.3, 25, 3);
    // Layer 4: Closest forest edge
    drawForestLayer(H * 0.515, 0.9, '#142818', '#0a1a10', 0.1, 18, 4);
}

function drawForestLayer(baseY, scale, lightColor, darkColor, haze, count, layerNum) {
    // Apply atmospheric haze
    const hazeR = Math.floor(lerp(parseInt(lightColor.slice(1,3), 16), 180, haze));
    const hazeG = Math.floor(lerp(parseInt(lightColor.slice(3,5), 16), 170, haze));
    const hazeB = Math.floor(lerp(parseInt(lightColor.slice(5,7), 16), 190, haze));
    const hazedLight = `rgb(${hazeR}, ${hazeG}, ${hazeB})`;
    
    const hazeDR = Math.floor(lerp(parseInt(darkColor.slice(1,3), 16), 140, haze));
    const hazeDG = Math.floor(lerp(parseInt(darkColor.slice(3,5), 16), 130, haze));
    const hazeDC = Math.floor(lerp(parseInt(darkColor.slice(5,7), 16), 160, haze));
    const hazedDark = `rgb(${hazeDR}, ${hazeDG}, ${hazeDC})`;
    
    for (let i = 0; i < count; i++) {
        const seed = layerNum * 1000 + i * 37;
        const x = (i / count) * W + (seededRandom(seed) - 0.5) * (W / count) * 0.9;
        const treeHeight = (35 + seededRandom(seed + 1) * 45) * scale;
        const treeWidth = treeHeight * (0.25 + seededRandom(seed + 2) * 0.15);
        
        drawDetailedPineTree(x, baseY, treeWidth, treeHeight, hazedLight, hazedDark, seed, haze);
    }
}

function drawDetailedPineTree(x, baseY, width, height, lightColor, darkColor, seed, haze) {
    // Only draw detailed trees for closer layers
    const isDetailed = haze < 0.5;
    
    // ===== TRUNK =====
    if (isDetailed) {
        const trunkWidth = width * 0.15;
        const trunkHeight = height * 0.18;
        
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(x - trunkWidth / 2, baseY - trunkHeight, trunkWidth, trunkHeight);
    }
    
    // ===== FOLIAGE LAYERS =====
    const layers = isDetailed ? 7 : 5;
    
    for (let layer = 0; layer < layers; layer++) {
        const t = layer / layers;
        const layerY = baseY - height * 0.15 - height * t * 0.75;
        const layerWidth = width * (1 - t * 0.7);
        const layerHeight = height / layers * 1.4;
        
        // Shadow side (left)
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(x, layerY - layerHeight);
        ctx.lineTo(x - layerWidth, layerY);
        ctx.lineTo(x, layerY + 2);
        ctx.closePath();
        ctx.fill();
        
        // Lit side (right)
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(x, layerY - layerHeight);
        ctx.lineTo(x + layerWidth * 0.9, layerY);
        ctx.lineTo(x, layerY + 2);
        ctx.closePath();
        ctx.fill();
        
        // Branch texture (only for detailed trees)
        if (isDetailed && layer < layers - 1) {
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = 1;
            
            // Left branches
            for (let b = 0; b < 3; b++) {
                const by = layerY - layerHeight * 0.3 + b * (layerHeight * 0.25);
                const bLen = layerWidth * (0.3 + seededRandom(seed + layer * 10 + b) * 0.4);
                ctx.beginPath();
                ctx.moveTo(x - 2, by);
                ctx.lineTo(x - bLen, by + bLen * 0.3);
                ctx.stroke();
            }
        }
    }
    
    // Snow on tree (for detailed close trees)
    if (isDetailed && seededRandom(seed + 99) > 0.6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let s = 0; s < 3; s++) {
            const sy = baseY - height * (0.4 + s * 0.2);
            const sw = width * 0.3 * (1 - s * 0.2);
            ctx.beginPath();
            ctx.ellipse(x, sy, sw, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ============================================
// 10. LAKE - DETAILED WATER & REFLECTIONS
// ============================================

function drawLake() {
    const lakeTop = H * 0.52;
    const lakeBottom = H * 0.80;
    
    // ===== BASE WATER =====
    drawLakeBase(lakeTop, lakeBottom);
    
    // ===== MOUNTAIN REFLECTIONS =====
    drawMountainReflections(lakeTop, lakeBottom);
    
    // ===== SUN REFLECTION PATH =====
    drawSunReflection(lakeTop, lakeBottom);
    
    // ===== WATER SURFACE TEXTURE =====
    drawWaterTexture(lakeTop, lakeBottom);
    
    // ===== SHORE GRADIENT =====
    drawShoreBlend(lakeTop);
}

function drawLakeBase(lakeTop, lakeBottom) {
    // Multi-stop water gradient
    const waterGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeBottom);
    waterGrad.addColorStop(0, '#4a6888');     // Sky reflection at top
    waterGrad.addColorStop(0.15, '#3a5878');  
    waterGrad.addColorStop(0.3, '#2a4868');   
    waterGrad.addColorStop(0.5, '#1a3858');   // Deep water
    waterGrad.addColorStop(0.7, '#152e4a');
    waterGrad.addColorStop(0.85, '#10243c');
    waterGrad.addColorStop(1, '#0c1c30');     // Darkest at bottom
    
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, lakeTop, W, lakeBottom - lakeTop);
    
    // Subtle color variation (wind patterns)
    ctx.save();
    ctx.globalAlpha = 0.05;
    
    for (let i = 0; i < 15; i++) {
        const patchSeed = i * 111;
        const px = seededRandom(patchSeed) * W;
        const py = lakeTop + seededRandom(patchSeed + 1) * (lakeBottom - lakeTop);
        const pw = 50 + seededRandom(patchSeed + 2) * 150;
        const ph = 10 + seededRandom(patchSeed + 3) * 30;
        
        ctx.fillStyle = seededRandom(patchSeed + 4) > 0.5 
            ? 'rgba(60, 90, 120, 0.3)'
            : 'rgba(30, 50, 80, 0.3)';
        ctx.beginPath();
        ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawMountainReflections(lakeTop, lakeBottom) {
    ctx.save();
    
    // Reflections are inverted, blurred, and darkened
    const reflectionDepth = (lakeBottom - lakeTop) * 0.5;
    
    // ===== LEFT MOUNTAIN REFLECTION =====
    const leftReflGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeTop + reflectionDepth);
    leftReflGrad.addColorStop(0, 'rgba(45, 55, 70, 0.35)');
    leftReflGrad.addColorStop(0.3, 'rgba(40, 50, 65, 0.25)');
    leftReflGrad.addColorStop(0.6, 'rgba(35, 45, 60, 0.15)');
    leftReflGrad.addColorStop(1, 'rgba(30, 40, 55, 0)');
    
    ctx.fillStyle = leftReflGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.12, lakeTop);
    ctx.lineTo(W * 0.12 - 90, lakeTop + reflectionDepth * 0.7);
    ctx.lineTo(W * 0.12 + 90, lakeTop + reflectionDepth * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Reflection ripple distortion
    drawReflectionRipples(W * 0.12, lakeTop, 80, reflectionDepth * 0.6, 111);
    
    // ===== CENTER MOUNTAIN REFLECTION (largest) =====
    const centerReflGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeTop + reflectionDepth);
    centerReflGrad.addColorStop(0, 'rgba(55, 65, 80, 0.4)');
    centerReflGrad.addColorStop(0.3, 'rgba(45, 55, 70, 0.3)');
    centerReflGrad.addColorStop(0.6, 'rgba(35, 45, 60, 0.18)');
    centerReflGrad.addColorStop(1, 'rgba(25, 35, 50, 0)');
    
    ctx.fillStyle = centerReflGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.48, lakeTop);
    ctx.lineTo(W * 0.48 - 120, lakeTop + reflectionDepth * 0.85);
    ctx.lineTo(W * 0.48 + 110, lakeTop + reflectionDepth * 0.85);
    ctx.closePath();
    ctx.fill();
    
    drawReflectionRipples(W * 0.48, lakeTop, 100, reflectionDepth * 0.75, 222);
    
    // Snow cap reflection (lighter)
    ctx.fillStyle = 'rgba(200, 210, 220, 0.15)';
    ctx.beginPath();
    ctx.moveTo(W * 0.48, lakeTop);
    ctx.lineTo(W * 0.48 - 50, lakeTop + 40);
    ctx.lineTo(W * 0.48 + 45, lakeTop + 38);
    ctx.closePath();
    ctx.fill();
    
    // ===== RIGHT MOUNTAIN REFLECTION =====
    const rightReflGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeTop + reflectionDepth);
    rightReflGrad.addColorStop(0, 'rgba(50, 60, 75, 0.35)');
    rightReflGrad.addColorStop(0.4, 'rgba(40, 50, 65, 0.22)');
    rightReflGrad.addColorStop(1, 'rgba(30, 40, 55, 0)');
    
    ctx.fillStyle = rightReflGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.82, lakeTop);
    ctx.lineTo(W * 0.82 - 70, lakeTop + reflectionDepth * 0.6);
    ctx.lineTo(W * 0.82 + 75, lakeTop + reflectionDepth * 0.6);
    ctx.closePath();
    ctx.fill();
    
    drawReflectionRipples(W * 0.82, lakeTop, 65, reflectionDepth * 0.5, 333);
    
    // ===== TREE LINE REFLECTION =====
    ctx.fillStyle = 'rgba(15, 25, 20, 0.25)';
    ctx.fillRect(0, lakeTop, W, 15);
    
    // Irregular tree silhouette reflection
    ctx.beginPath();
    ctx.moveTo(0, lakeTop + 15);
    for (let x = 0; x <= W; x += 8) {
        const treeH = 5 + seededRandom(x * 0.1) * 12;
        ctx.lineTo(x, lakeTop + 15 + treeH);
    }
    ctx.lineTo(W, lakeTop + 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawReflectionRipples(centerX, startY, width, depth, seed) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = 'rgba(100, 130, 160, 0.5)';
    ctx.lineWidth = 1;
    
    // Horizontal ripple lines that widen with depth
    for (let i = 0; i < 12; i++) {
        const y = startY + 10 + i * (depth / 12);
        const rippleWidth = width * (0.3 + (i / 12) * 0.7);
        
        ctx.beginPath();
        for (let x = centerX - rippleWidth; x <= centerX + rippleWidth; x += 5) {
            const wave = Math.sin(x * 0.08 + seed + i * 0.5) * 2;
            if (x === centerX - rippleWidth) {
                ctx.moveTo(x, y + wave);
            } else {
                ctx.lineTo(x, y + wave);
            }
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawSunReflection(lakeTop, lakeBottom) {
    const sunX = W * 0.72;
    
    ctx.save();
    
    // ===== MAIN REFLECTION COLUMN =====
    const reflGrad = ctx.createLinearGradient(sunX, lakeTop, sunX, lakeBottom);
    reflGrad.addColorStop(0, 'rgba(255, 220, 150, 0.7)');
    reflGrad.addColorStop(0.15, 'rgba(255, 200, 120, 0.5)');
    reflGrad.addColorStop(0.35, 'rgba(255, 180, 100, 0.3)');
    reflGrad.addColorStop(0.55, 'rgba(255, 160, 80, 0.15)');
    reflGrad.addColorStop(0.75, 'rgba(255, 140, 60, 0.08)');
    reflGrad.addColorStop(1, 'rgba(255, 120, 50, 0)');
    
    // Reflection path widens toward viewer
    ctx.fillStyle = reflGrad;
    ctx.beginPath();
    ctx.moveTo(sunX - 40, lakeTop);
    ctx.lineTo(sunX - 120, lakeBottom);
    ctx.lineTo(sunX + 120, lakeBottom);
    ctx.lineTo(sunX + 40, lakeTop);
    ctx.closePath();
    ctx.fill();
    
    // ===== SPARKLE POINTS =====
    for (let i = 0; i < 50; i++) {
        const sparkSeed = 777 + i * 13;
        const sparkT = seededRandom(sparkSeed);
        const sy = lakeTop + sparkT * (lakeBottom - lakeTop) * 0.7;
        const spreadX = 40 + sparkT * 80;
        const sx = sunX + (seededRandom(sparkSeed + 1) - 0.5) * spreadX * 2;
        const sparkSize = 1.5 + seededRandom(sparkSeed + 2) * 3;
        const sparkAlpha = 0.4 + seededRandom(sparkSeed + 3) * 0.4;
        
        ctx.fillStyle = `rgba(255, 250, 220, ${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Sparkle glow
        if (seededRandom(sparkSeed + 4) > 0.7) {
            ctx.fillStyle = `rgba(255, 240, 200, ${sparkAlpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(sx, sy, sparkSize * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

function drawWaterTexture(lakeTop, lakeBottom) {
    ctx.save();
    
    // ===== WAVE RIPPLES (horizontal lines) =====
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#90a8c0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 45; i++) {
        const y = lakeTop + 8 + i * 6;
        if (y > lakeBottom - 10) break;
        
        // Wave amplitude increases toward viewer
        const amp = 1 + (y - lakeTop) / (lakeBottom - lakeTop) * 2;
        const freq = 0.02 + seededRandom(i * 55) * 0.015;
        
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
            const wave = Math.sin(x * freq + i * 0.8) * amp;
            if (x === 0) {
                ctx.moveTo(x, y + wave);
            } else {
                ctx.lineTo(x, y + wave);
            }
        }
        ctx.stroke();
    }
    
    // ===== LIGHT DAPPLING (caustics suggestion) =====
    ctx.globalAlpha = 0.04;
    
    for (let i = 0; i < 80; i++) {
        const dappleSeed = 888 + i * 17;
        const dx = seededRandom(dappleSeed) * W;
        const dy = lakeTop + seededRandom(dappleSeed + 1) * (lakeBottom - lakeTop) * 0.6;
        const dw = 10 + seededRandom(dappleSeed + 2) * 30;
        const dh = 3 + seededRandom(dappleSeed + 3) * 8;
        
        ctx.fillStyle = 'rgba(180, 210, 240, 0.5)';
        ctx.beginPath();
        ctx.ellipse(dx, dy, dw, dh, seededRandom(dappleSeed + 4) * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawShoreBlend(lakeTop) {
    // Soft edge where water meets land
    const blendGrad = ctx.createLinearGradient(0, lakeTop - 5, 0, lakeTop + 15);
    blendGrad.addColorStop(0, 'rgba(74, 104, 136, 0)');
    blendGrad.addColorStop(0.4, 'rgba(74, 104, 136, 0.3)');
    blendGrad.addColorStop(0.7, 'rgba(74, 104, 136, 0.5)');
    blendGrad.addColorStop(1, 'rgba(74, 104, 136, 0)');
    
    ctx.fillStyle = blendGrad;
    ctx.fillRect(0, lakeTop - 5, W, 20);
}

// ============================================
// 11. SHORELINE - ROCKS & PEBBLES
// ============================================

function drawShoreline() {
    const shoreY = H * 0.52;
    
    // ===== SHORE ROCKS (larger) =====
    for (let i = 0; i < 35; i++) {
        const rockSeed = 999 + i * 19;
        const rx = seededRandom(rockSeed) * W;
        const ry = shoreY + (seededRandom(rockSeed + 1) - 0.6) * 15;
        const rSize = 6 + seededRandom(rockSeed + 2) * 18;
        
        drawDetailedRock(rx, ry, rSize, rockSeed);
    }
    
    // ===== PEBBLES (smaller, denser) =====
    ctx.save();
    ctx.globalAlpha = 0.5;
    
    for (let i = 0; i < 100; i++) {
        const pebSeed = 1111 + i * 23;
        const px = seededRandom(pebSeed) * W;
        const py = shoreY + (seededRandom(pebSeed + 1) - 0.5) * 12;
        const pSize = 2 + seededRandom(pebSeed + 2) * 4;
        
        const pebGrad = ctx.createRadialGradient(
            px - pSize * 0.3, py - pSize * 0.3, 0,
            px, py, pSize
        );
        pebGrad.addColorStop(0, '#9090a0');
        pebGrad.addColorStop(0.6, '#606878');
        pebGrad.addColorStop(1, '#404858');
        
        ctx.fillStyle = pebGrad;
        ctx.beginPath();
        ctx.ellipse(px, py, pSize, pSize * 0.6, seededRandom(pebSeed + 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawDetailedRock(x, y, size, seed) {
    // Rock body with 3D shading
    const rockGrad = ctx.createRadialGradient(
        x - size * 0.35, y - size * 0.35, 0,
        x, y, size
    );
    rockGrad.addColorStop(0, '#a8a8b8');
    rockGrad.addColorStop(0.3, '#888898');
    rockGrad.addColorStop(0.6, '#686878');
    rockGrad.addColorStop(1, '#484858');
    
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    
    // Irregular rock shape
    const points = 8;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radiusVar = size * (0.7 + seededRandom(seed + i * 0.1) * 0.35);
        const px = x + Math.cos(angle) * radiusVar;
        const py = y + Math.sin(angle) * radiusVar * 0.6;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    // Rock highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.25, y - size * 0.2, size * 0.3, size * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Rock cracks
    if (size > 10) {
        ctx.strokeStyle = 'rgba(40, 40, 50, 0.3)';
        ctx.lineWidth = 1;
        
        for (let c = 0; c < 2; c++) {
            const cx = x + (seededRandom(seed + 100 + c) - 0.5) * size * 0.6;
            const cy = y + (seededRandom(seed + 101 + c) - 0.5) * size * 0.3;
            const cLen = size * 0.3 + seededRandom(seed + 102 + c) * size * 0.3;
            const cAngle = seededRandom(seed + 103 + c) * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(cAngle) * cLen, cy + Math.sin(cAngle) * cLen * 0.5);
            ctx.stroke();
        }
    }
}

// ============================================
// 12. FOREGROUND MEADOW - GRASS & FLOWERS
// ============================================

function drawForeground() {
    const meadowTop = H * 0.77;
    
    // ===== BASE GRASS =====
    drawGrassBase(meadowTop);
    
    // ===== GRASS BLADES =====
    drawGrassBlades(meadowTop);
    
    // ===== WILDFLOWERS =====
    drawWildflowers(meadowTop);
    
    // ===== FOREGROUND ROCKS =====
    drawForegroundRocks(meadowTop);
}

function drawGrassBase(meadowTop) {
    const grassGrad = ctx.createLinearGradient(0, meadowTop, 0, H);
    grassGrad.addColorStop(0, '#3a5830');
    grassGrad.addColorStop(0.2, '#4a6838');
    grassGrad.addColorStop(0.4, '#3a5828');
    grassGrad.addColorStop(0.6, '#2a4820');
    grassGrad.addColorStop(0.8, '#1a3818');
    grassGrad.addColorStop(1, '#0a2810');
    
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, meadowTop, W, H - meadowTop);
    
    // Color variation patches
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    for (let i = 0; i < 20; i++) {
        const patchSeed = 2222 + i * 29;
        const px = seededRandom(patchSeed) * W;
        const py = meadowTop + seededRandom(patchSeed + 1) * (H - meadowTop);
        const pw = 40 + seededRandom(patchSeed + 2) * 100;
        const ph = 20 + seededRandom(patchSeed + 3) * 40;
        
        ctx.fillStyle = seededRandom(patchSeed + 4) > 0.5 
            ? 'rgba(60, 90, 50, 0.4)'
            : 'rgba(30, 60, 25, 0.4)';
        ctx.beginPath();
        ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawGrassBlades(meadowTop) {
    // ===== BACKGROUND GRASS (smaller, denser) =====
    ctx.save();
    
    for (let i = 0; i < 600; i++) {
        const bladeSeed = 3333 + i * 31;
        const bx = seededRandom(bladeSeed) * W;
        const by = meadowTop + seededRandom(bladeSeed + 1) * (H - meadowTop);
        
        // Grass gets taller toward foreground
        const depthFactor = (by - meadowTop) / (H - meadowTop);
        const bladeHeight = (8 + seededRandom(bladeSeed + 2) * 12) * (0.5 + depthFactor * 0.8);
        const bladeLean = (seededRandom(bladeSeed + 3) - 0.5) * bladeHeight * 0.4;
        const bladeWidth = 1 + depthFactor * 1.5;
        
        // Color variation
        const greenVar = Math.floor(seededRandom(bladeSeed + 4) * 35);
        const baseGreen = 70 + greenVar;
        const r = 30 + Math.floor(greenVar * 0.5);
        const g = baseGreen;
        const b = 20 + Math.floor(greenVar * 0.3);
        
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.lineWidth = bladeWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(
            bx + bladeLean * 0.6, by - bladeHeight * 0.6,
            bx + bladeLean, by - bladeHeight
        );
        ctx.stroke();
    }
    
    // ===== FOREGROUND GRASS CLUMPS (detailed) =====
    for (let clump = 0; clump < 25; clump++) {
        const clumpSeed = 4444 + clump * 37;
        const cx = seededRandom(clumpSeed) * W;
        const cy = H * 0.88 + seededRandom(clumpSeed + 1) * (H * 0.12);
        
        // Each clump has multiple blades
        const bladeCount = 8 + Math.floor(seededRandom(clumpSeed + 2) * 8);
        
        for (let b = 0; b < bladeCount; b++) {
            const bSeed = clumpSeed + 100 + b * 7;
            const bx = cx + (seededRandom(bSeed) - 0.5) * 20;
            const by = cy;
            const bHeight = 15 + seededRandom(bSeed + 1) * 25;
            const bLean = (seededRandom(bSeed + 2) - 0.5) * bHeight * 0.5;
            
            // Two-tone blade
            const greenBase = 60 + Math.floor(seededRandom(bSeed + 3) * 40);
            
            // Dark edge
            ctx.strokeStyle = `rgb(${25 + greenBase * 0.2}, ${greenBase - 15}, ${15})`;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.quadraticCurveTo(bx + bLean * 0.5, by - bHeight * 0.5, bx + bLean, by - bHeight);
            ctx.stroke();
            
            // Light center
            ctx.strokeStyle = `rgb(${35 + greenBase * 0.3}, ${greenBase + 10}, ${20})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.quadraticCurveTo(bx + bLean * 0.5, by - bHeight * 0.5, bx + bLean, by - bHeight);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

function drawWildflowers(meadowTop) {
    const flowerTypes = [
        { petals: 5, color: '#ff6080', center: '#ffff60', size: 4 },   // Pink
        { petals: 6, color: '#ffffff', center: '#ffff80', size: 3 },   // White daisy
        { petals: 0, color: '#ffff40', center: '#ff8800', size: 2 },   // Yellow dot
        { petals: 5, color: '#8080ff', center: '#ffff60', size: 3 },   // Blue
        { petals: 4, color: '#ff80ff', center: '#ffffff', size: 3 },   // Purple
    ];
    
    for (let i = 0; i < 80; i++) {
        const flowerSeed = 5555 + i * 41;
        const fx = seededRandom(flowerSeed) * W;
        const fy = meadowTop + 15 + seededRandom(flowerSeed + 1) * (H - meadowTop - 25);
        const flowerType = flowerTypes[Math.floor(seededRandom(flowerSeed + 2) * flowerTypes.length)];
        
        // Stem
        const stemHeight = 8 + seededRandom(flowerSeed + 3) * 12;
        ctx.strokeStyle = '#2a5020';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + (seededRandom(flowerSeed + 4) - 0.5) * 4, fy - stemHeight);
        ctx.stroke();
        
        const flowerY = fy - stemHeight;
        const size = flowerType.size + seededRandom(flowerSeed + 5) * 2;
        
        if (flowerType.petals === 0) {
            // Simple dot flower
            ctx.fillStyle = flowerType.color;
            ctx.beginPath();
            ctx.arc(fx, flowerY, size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Petaled flower
            ctx.fillStyle = flowerType.color;
            for (let p = 0; p < flowerType.petals; p++) {
                const angle = (p / flowerType.petals) * Math.PI * 2;
                const px = fx + Math.cos(angle) * size;
                const py = flowerY + Math.sin(angle) * size * 0.8;
                
                ctx.beginPath();
                ctx.ellipse(px, py, size * 0.6, size * 0.4, angle, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Flower center
            ctx.fillStyle = flowerType.center;
            ctx.beginPath();
            ctx.arc(fx, flowerY, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawForegroundRocks(meadowTop) {
    // Large foreground rocks
    const rocks = [
        { x: W * 0.05, y: H * 0.92, size: 35 },
        { x: W * 0.15, y: H * 0.95, size: 25 },
        { x: W * 0.88, y: H * 0.93, size: 40 },
        { x: W * 0.95, y: H * 0.96, size: 28 },
    ];
    
    rocks.forEach((rock, idx) => {
        drawDetailedRock(rock.x, rock.y, rock.size, 6666 + idx * 47);
    });
}

// ============================================
// 13. BIRDS - DISTANT SILHOUETTES
// ============================================

function drawBirds() {
    const birdGroups = [
        { x: 180, y: 90, count: 6, size: 3 },
        { x: 450, y: 140, count: 4, size: 2.5 },
        { x: 750, y: 70, count: 7, size: 3.5 },
        { x: 950, y: 120, count: 5, size: 2.8 },
    ];
    
    ctx.strokeStyle = 'rgba(25, 25, 35, 0.6)';
    ctx.lineCap = 'round';
    
    birdGroups.forEach((group, gIdx) => {
        for (let i = 0; i < group.count; i++) {
            const bSeed = 7777 + gIdx * 100 + i * 53;
            const bx = group.x + (seededRandom(bSeed) - 0.5) * 60;
            const by = group.y + (seededRandom(bSeed + 1) - 0.5) * 30;
            const bSize = group.size * (0.7 + seededRandom(bSeed + 2) * 0.6);
            
            ctx.lineWidth = 1 + bSize * 0.3;
            
            // Bird V shape with curve
            ctx.beginPath();
            ctx.moveTo(bx - bSize * 2.5, by + bSize * 0.4);
            ctx.quadraticCurveTo(bx, by - bSize, bx + bSize * 2.5, by + bSize * 0.4);
            ctx.stroke();
        }
    });
}

// ============================================
// 14. ATMOSPHERIC EFFECTS
// ============================================

function drawAtmosphericEffects() {
    // ===== MIST LAYERS (between mountains and forest) =====
    ctx.save();
    
    const mistGrad = ctx.createLinearGradient(0, H * 0.48, 0, H * 0.54);
    mistGrad.addColorStop(0, 'rgba(180, 190, 200, 0)');
    mistGrad.addColorStop(0.3, 'rgba(180, 190, 200, 0.08)');
    mistGrad.addColorStop(0.6, 'rgba(180, 190, 200, 0.12)');
    mistGrad.addColorStop(1, 'rgba(180, 190, 200, 0)');
    
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, H * 0.48, W, H * 0.06);
    
    // ===== HORIZON HAZE =====
    const hazeGrad = ctx.createLinearGradient(0, H * 0.38, 0, H * 0.52);
    hazeGrad.addColorStop(0, 'rgba(240, 192, 72, 0)');
    hazeGrad.addColorStop(0.4, 'rgba(240, 192, 72, 0.06)');
    hazeGrad.addColorStop(0.7, 'rgba(240, 192, 72, 0.1)');
    hazeGrad.addColorStop(1, 'rgba(240, 192, 72, 0)');
    
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, H * 0.38, W, H * 0.14);
    
    ctx.restore();
}

// ============================================
// 15. FINAL TOUCHES - VIGNETTE & OVERLAY
// ============================================

function drawFinalTouches() {
    // ===== VIGNETTE =====
    const vignetteGrad = ctx.createRadialGradient(
        W / 2, H / 2, H * 0.3,
        W / 2, H / 2, H * 0.95
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.15)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
    
    // ===== WARM GOLDEN OVERLAY =====
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#ffd080';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    
    // ===== SUBTLE FILM GRAIN (optional texture) =====
    ctx.save();
    ctx.globalAlpha = 0.02;
    for (let i = 0; i < 3000; i++) {
        const gx = seededRandom(i * 1.1) * W;
        const gy = seededRandom(i * 2.2) * H;
        const gBright = seededRandom(i * 3.3) > 0.5 ? 255 : 0;
        
        ctx.fillStyle = `rgb(${gBright}, ${gBright}, ${gBright})`;
        ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.restore();
}

// ============================================
// RENDER THE COMPLETE SCENE
// ============================================

function render() {
    ctx.clearRect(0, 0, W, H);
    
    // Layer 1: Sky & Celestial
    drawSky();
    drawStars();
    drawSun();
    drawClouds();
    drawGodRays();
    
    // Layer 2: Far Mountains (atmospheric)
    drawFarMountains();
    
    // Layer 3: Main Mountains (detailed)
    drawMainMountains();
    
    // Layer 4: Atmospheric Mist
    drawAtmosphericEffects();
    
    // Layer 5: Forest Layers
    drawForest();
    
    // Layer 6: Lake & Reflections
    drawLake();
    
    // Layer 7: Shoreline
    drawShoreline();
    
    // Layer 8: Birds
    drawBirds();
    
    // Layer 9: Foreground Meadow
    drawForeground();
    
    // Layer 10: Final Touches
    drawFinalTouches();
    
    console.log('Mountain Landscape rendered successfully!');
    console.log('Total lines: ~1800');
}

// Execute
render();
