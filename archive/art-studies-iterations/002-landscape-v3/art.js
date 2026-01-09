// ============================================
// ART STUDY #2: MOUNTAIN LANDSCAPE - V3
// ============================================
// LESSONS APPLIED:
// 1. Atmospheric perspective via COLOR SHIFT not alpha
// 2. Organic shapes AND dense texture together
// 3. Snow follows mountain contour
// 4. Keep what works from V1 (sky, clouds, texture)
// 5. Warm foreground, cool distance
// ============================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ============================================
// UTILITIES
// ============================================

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

// Lerp RGB colors for atmospheric perspective
function lerpColor(r1, g1, b1, r2, g2, b2, t) {
    return {
        r: Math.round(lerp(r1, r2, t)),
        g: Math.round(lerp(g1, g2, t)),
        b: Math.round(lerp(b1, b2, t))
    };
}

// Generate organic curve - NO STRAIGHT LINES IN NATURE
function organicCurve(x1, y1, x2, y2, segments, variance, seed) {
    const pts = [{x: x1, y: y1}];
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const edge = Math.sin(t * Math.PI); // 0 at ends, 1 in middle
        pts.push({
            x: lerp(x1, x2, t) + (seededRandom(seed + i*2) - 0.5) * variance * edge,
            y: lerp(y1, y2, t) + (seededRandom(seed + i*2+1) - 0.5) * variance * edge
        });
    }
    pts.push({x: x2, y: y2});
    return pts;
}

// ============================================
// 1. SKY (from V1 - works well)
// ============================================

function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    grad.addColorStop(0.00, '#0a0a1a');
    grad.addColorStop(0.08, '#0d1025');
    grad.addColorStop(0.15, '#141830');
    grad.addColorStop(0.22, '#1e2545');
    grad.addColorStop(0.30, '#2a3555');
    grad.addColorStop(0.40, '#3a4565');
    grad.addColorStop(0.50, '#5a5565');
    grad.addColorStop(0.62, '#8a6555');
    grad.addColorStop(0.75, '#c08050');
    grad.addColorStop(0.88, '#e8a060');
    grad.addColorStop(1.00, '#f0c080');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H * 0.55);
    
    // Warm glow zones
    ctx.save();
    ctx.globalAlpha = 0.15;
    const glow1 = ctx.createRadialGradient(W*0.7, H*0.42, 0, W*0.7, H*0.42, 300);
    glow1.addColorStop(0, '#ffcc88');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H*0.55);
    ctx.restore();
}

function drawStars() {
    ctx.save();
    for (let i = 0; i < 150; i++) {
        const x = seededRandom(i*3) * W;
        const y = seededRandom(i*3+1) * H * 0.3;
        const size = 0.5 + seededRandom(i*3+2) * 1.5;
        const twinkle = 0.3 + seededRandom(i*3+3) * 0.5;
        ctx.globalAlpha = twinkle * (1 - y/(H*0.3));
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2);
        ctx.fill();
        // Glow
        if (size > 1) {
            ctx.globalAlpha = twinkle * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, size*2, 0, Math.PI*2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawSun() {
    const sx = W * 0.65, sy = H * 0.40, sr = 45;
    
    // Glow layers
    for (let i = 8; i >= 0; i--) {
        const r = sr + i * 30;
        const a = 0.12 - i * 0.012;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        grad.addColorStop(0, `rgba(255,230,180,${a})`);
        grad.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Sun disc with limb darkening
    const sunGrad = ctx.createRadialGradient(sx-sr*0.2, sy-sr*0.2, 0, sx, sy, sr);
    sunGrad.addColorStop(0, '#fffef0');
    sunGrad.addColorStop(0.5, '#fff8d0');
    sunGrad.addColorStop(0.8, '#ffe0a0');
    sunGrad.addColorStop(0.95, '#ffc060');
    sunGrad.addColorStop(1, '#ff9030');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI*2);
    ctx.fill();
    
    // Surface granulation texture
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 80; i++) {
        const angle = seededRandom(i*5) * Math.PI * 2;
        const dist = seededRandom(i*5+1) * sr * 0.85;
        const gx = sx + Math.cos(angle) * dist;
        const gy = sy + Math.sin(angle) * dist;
        const gs = 2 + seededRandom(i*5+2) * 4;
        ctx.fillStyle = seededRandom(i*5+3) > 0.5 ? '#fff' : '#ffa000';
        ctx.beginPath();
        ctx.arc(gx, gy, gs, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
    
    // Light rays
    ctx.save();
    for (let i = 0; i < 24; i++) {
        const angle = (i/24) * Math.PI * 2;
        const len = 80 + seededRandom(i*7) * 100;
        ctx.globalAlpha = 0.03 + seededRandom(i*7+1) * 0.04;
        ctx.strokeStyle = '#ffdd88';
        ctx.lineWidth = 3 + seededRandom(i*7+2) * 5;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(angle)*sr, sy + Math.sin(angle)*sr);
        ctx.lineTo(sx + Math.cos(angle)*(sr+len), sy + Math.sin(angle)*(sr+len));
        ctx.stroke();
    }
    ctx.restore();
}

// ============================================
// 2. CLOUDS (enhanced from V1)
// ============================================

function drawClouds() {
    // Cirrus (wispy)
    for (let i = 0; i < 12; i++) {
        const cx = seededRandom(i*11) * W;
        const cy = H*0.06 + seededRandom(i*11+1) * H*0.12;
        drawCirrus(cx, cy, 50 + seededRandom(i*11+2)*80, i*100);
    }
    // Alto (mid)
    for (let i = 0; i < 6; i++) {
        const cx = seededRandom(i*13+50) * W;
        const cy = H*0.18 + seededRandom(i*13+51) * H*0.08;
        drawAltoCloud(cx, cy, 40 + seededRandom(i*13+52)*50, i*200);
    }
    // Cumulus (puffy, lit from below)
    for (let i = 0; i < 4; i++) {
        const cx = seededRandom(i*17+100) * W;
        const cy = H*0.30 + seededRandom(i*17+101) * H*0.06;
        drawCumulusCloud(cx, cy, 80 + seededRandom(i*17+102)*60, i*300);
    }
}

function drawCirrus(x, y, len, seed) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    const pts = organicCurve(x, y, x+len, y-5, 10, 8, seed);
    ctx.strokeStyle = 'rgba(220,210,230,0.5)';
    ctx.lineWidth = 2 + seededRandom(seed)*2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
}

function drawAltoCloud(x, y, size, seed) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let p = 0; p < 5; p++) {
        const px = x + (seededRandom(seed+p*3)-0.5)*size;
        const py = y + (seededRandom(seed+p*3+1)-0.5)*size*0.3;
        const pr = 10 + seededRandom(seed+p*3+2)*15;
        const grad = ctx.createRadialGradient(px, py-pr*0.3, 0, px, py, pr);
        grad.addColorStop(0, 'rgba(255,250,240,0.6)');
        grad.addColorStop(1, 'rgba(255,220,180,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
}

function drawCumulusCloud(x, y, size, seed) {
    ctx.save();
    // Cloud puffs with warm underside (sunset lighting)
    for (let p = 0; p < 8; p++) {
        const px = x + (seededRandom(seed+p*4)-0.5)*size;
        const py = y + (seededRandom(seed+p*4+1)-0.5)*size*0.4;
        const pr = 15 + seededRandom(seed+p*4+2)*25;
        
        // Top: white/gray, Bottom: warm orange
        const grad = ctx.createLinearGradient(px, py-pr, px, py+pr);
        grad.addColorStop(0, 'rgba(240,240,250,0.7)');
        grad.addColorStop(0.5, 'rgba(220,210,200,0.5)');
        grad.addColorStop(1, 'rgba(255,180,120,0.4)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        // Irregular shape
        for (let a = 0; a <= 12; a++) {
            const ang = (a/12)*Math.PI*2;
            const v = 0.8 + seededRandom(seed+p*10+a)*0.4;
            const rx = px + Math.cos(ang)*pr*v;
            const ry = py + Math.sin(ang)*pr*v*0.7;
            if (a === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
        }
        ctx.fill();
    }
    ctx.restore();
}

// ============================================
// 3. FAR MOUNTAINS - COLOR SHIFT NOT ALPHA!
// ============================================

// Haze color for atmospheric perspective
const HAZE = {r: 180, g: 175, b: 195};

function drawFarMountains() {
    // Layer 1: Most distant - heavily hazed toward blue/gray
    drawMountainRange(H*0.42, 70, {r:80,g:90,b:110}, {r:60,g:70,b:95}, 0.7, 1000, 6);
    // Layer 2: Mid-distant
    drawMountainRange(H*0.44, 100, {r:70,g:80,b:100}, {r:50,g:60,b:85}, 0.5, 2000, 8);
    // Layer 3: Closer
    drawMountainRange(H*0.47, 140, {r:55,g:65,b:85}, {r:40,g:50,b:70}, 0.3, 3000, 10);
}

function drawMountainRange(baseY, maxH, lightCol, darkCol, hazeAmt, seed, peaks) {
    // Apply atmospheric color shift (NOT alpha!)
    const litC = lerpColor(lightCol.r, lightCol.g, lightCol.b, HAZE.r, HAZE.g, HAZE.b, hazeAmt);
    const drkC = lerpColor(darkCol.r, darkCol.g, darkCol.b, HAZE.r, HAZE.g, HAZE.b, hazeAmt);
    
    // Generate organic ridge
    const ridge = [{x:-10, y:baseY}];
    for (let i = 0; i <= peaks*4; i++) {
        const t = i / (peaks*4);
        const x = t * (W+20) - 10;
        const peakiness = Math.pow(Math.sin(t*Math.PI*peaks), 2);
        const h = maxH * peakiness * (0.5 + seededRandom(seed+i)*0.5);
        const wobble = (seededRandom(seed+i+100)-0.5) * 20;
        ridge.push({x: x + wobble, y: baseY - h});
    }
    ridge.push({x:W+10, y:baseY}, {x:W+10, y:H}, {x:-10, y:H});
    
    // Fill with gradient
    const grad = ctx.createLinearGradient(0, baseY-maxH, 0, baseY);
    grad.addColorStop(0, `rgb(${litC.r},${litC.g},${litC.b})`);
    grad.addColorStop(1, `rgb(${drkC.r},${drkC.g},${drkC.b})`);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ridge[0].x, ridge[0].y);
    for (let i = 1; i < ridge.length; i++) ctx.lineTo(ridge[i].x, ridge[i].y);
    ctx.closePath();
    ctx.fill();
    
    // Subtle ridge texture (reduced by haze)
    if (hazeAmt < 0.6) {
        ctx.save();
        ctx.globalAlpha = 0.1 * (1 - hazeAmt);
        ctx.strokeStyle = `rgb(${litC.r+30},${litC.g+30},${litC.b+30})`;
        ctx.lineWidth = 1;
        for (let i = 2; i < ridge.length-4; i += 3) {
            if (ridge[i].y < baseY - 10) {
                ctx.beginPath();
                ctx.moveTo(ridge[i].x, ridge[i].y);
                ctx.lineTo(ridge[i].x + (seededRandom(seed+i*7)-0.5)*30, baseY);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

// ============================================
// 4. MAIN MOUNTAINS - ORGANIC + DENSE TEXTURE
// ============================================

function drawMainMountains() {
    // Three peaks with organic silhouettes AND rich texture
    drawDetailedMountain(W*0.15, H*0.50, 340, 270, 'left', 100);
    drawDetailedMountain(W*0.50, H*0.50, 420, 340, 'center', 200);
    drawDetailedMountain(W*0.85, H*0.50, 300, 250, 'right', 300);
}

function drawDetailedMountain(peakX, baseY, width, height, pos, seed) {
    const peakY = baseY - height;
    
    // Generate organic ridge lines
    const leftRidge = organicCurve(peakX, peakY, peakX - width*0.55, baseY, 15, 20, seed);
    const rightRidge = organicCurve(peakX, peakY, peakX + width*0.45, baseY, 15, 20, seed+500);
    
    // === LEFT (SHADOW) FACE ===
    const shadGrad = ctx.createLinearGradient(peakX-width*0.55, baseY, peakX, peakY);
    shadGrad.addColorStop(0, '#4a5868');
    shadGrad.addColorStop(0.3, '#3a4858');
    shadGrad.addColorStop(0.6, '#2a3848');
    shadGrad.addColorStop(1, '#3a4a5a');
    
    ctx.fillStyle = shadGrad;
    ctx.beginPath();
    ctx.moveTo(leftRidge[0].x, leftRidge[0].y);
    for (let i = 1; i < leftRidge.length; i++) ctx.lineTo(leftRidge[i].x, leftRidge[i].y);
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Shadow face texture
    drawRockTexture(leftRidge, peakX, baseY, 'shadow', seed);
    
    // === RIGHT (LIT) FACE ===
    const litGrad = ctx.createLinearGradient(peakX, peakY, peakX+width*0.45, baseY);
    litGrad.addColorStop(0, '#9aaab8');
    litGrad.addColorStop(0.3, '#8a9aa8');
    litGrad.addColorStop(0.6, '#7a8a98');
    litGrad.addColorStop(1, '#6a7a88');
    
    ctx.fillStyle = litGrad;
    ctx.beginPath();
    ctx.moveTo(rightRidge[0].x, rightRidge[0].y);
    for (let i = 1; i < rightRidge.length; i++) ctx.lineTo(rightRidge[i].x, rightRidge[i].y);
    ctx.lineTo(peakX, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Lit face texture
    drawRockTexture(rightRidge, peakX, baseY, 'lit', seed+1000);
    
    // === GEOLOGICAL FEATURES ===
    drawGeology(peakX, peakY, width, height, seed);
    
    // === SNOW CAP - follows contour! ===
    drawSnowCap(leftRidge, rightRidge, peakX, peakY, width, height, seed);
    
    // === RIDGE HIGHLIGHT ===
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'rgba(200,220,240,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX + 3, baseY);
    ctx.stroke();
    ctx.restore();
}

function drawRockTexture(ridge, centerX, baseY, side, seed) {
    const isLit = side === 'lit';
    const peakY = ridge[0].y;
    
    ctx.save();
    
    // === STRIATIONS (35+) ===
    ctx.globalAlpha = isLit ? 0.18 : 0.12;
    for (let i = 0; i < 35; i++) {
        const t = 0.1 + (i/35) * 0.8;
        const y = peakY + (baseY - peakY) * t;
        
        // Find ridge x at this height
        const ridgeIdx = Math.floor(t * (ridge.length-1));
        const ridgeX = ridge[Math.min(ridgeIdx, ridge.length-1)].x;
        
        const startX = isLit ? centerX + 3 : ridgeX;
        const endX = isLit ? ridgeX : centerX - 3;
        
        ctx.strokeStyle = seededRandom(seed+i*11) > 0.5 
            ? `rgba(30,40,55,${0.1+seededRandom(seed+i*12)*0.12})`
            : `rgba(100,115,130,${0.08+seededRandom(seed+i*13)*0.1})`;
        ctx.lineWidth = 1 + seededRandom(seed+i*14)*2;
        
        // Wavy striation
        ctx.beginPath();
        ctx.moveTo(startX, y);
        for (let s = 1; s <= 8; s++) {
            const sx = lerp(startX, endX, s/8);
            const sy = y + (seededRandom(seed+i*20+s)-0.5)*6;
            ctx.lineTo(sx, sy);
        }
        ctx.stroke();
    }
    
    // === ROCK PATCHES (50+) ===
    ctx.globalAlpha = isLit ? 0.15 : 0.1;
    for (let i = 0; i < 50; i++) {
        const pSeed = seed + 2000 + i*17;
        const t = 0.08 + seededRandom(pSeed) * 0.82;
        const y = peakY + (baseY - peakY) * t;
        const ridgeIdx = Math.floor(t * (ridge.length-1));
        const ridgeX = ridge[Math.min(ridgeIdx, ridge.length-1)].x;
        const xRange = Math.abs(ridgeX - centerX);
        const x = isLit 
            ? centerX + seededRandom(pSeed+1) * xRange * 0.85
            : centerX - seededRandom(pSeed+1) * xRange * 0.85;
        
        const pw = 6 + seededRandom(pSeed+2)*22;
        const ph = pw * (0.25 + seededRandom(pSeed+3)*0.35);
        const rot = (seededRandom(pSeed+4)-0.5)*0.8;
        
        ctx.fillStyle = seededRandom(pSeed+5) > 0.5
            ? `rgba(25,35,50,${0.12+seededRandom(pSeed+6)*0.15})`
            : `rgba(85,100,115,${0.08+seededRandom(pSeed+7)*0.1})`;
        
        ctx.beginPath();
        for (let a = 0; a <= 8; a++) {
            const ang = (a/8)*Math.PI*2 + rot;
            const v = 0.7 + seededRandom(pSeed+10+a)*0.6;
            const px = x + Math.cos(ang)*pw*v;
            const py = y + Math.sin(ang)*ph*v;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.fill();
    }
    
    // === VERTICAL CRACKS (15+) ===
    ctx.globalAlpha = isLit ? 0.12 : 0.08;
    ctx.strokeStyle = 'rgba(20,30,45,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
        const cSeed = seed + 3000 + i*23;
        const startT = seededRandom(cSeed) * 0.5;
        const startY = peakY + (baseY-peakY)*startT;
        const ridgeIdx = Math.floor(startT*(ridge.length-1));
        const ridgeX = ridge[Math.min(ridgeIdx, ridge.length-1)].x;
        const xRange = Math.abs(ridgeX - centerX)*startT;
        const startX = isLit
            ? centerX + seededRandom(cSeed+1)*xRange
            : centerX - seededRandom(cSeed+1)*xRange;
        
        const len = 25 + seededRandom(cSeed+2)*55;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let cx = startX, cy = startY;
        for (let s = 0; s < 6; s++) {
            cx += (seededRandom(cSeed+10+s)-0.5)*12;
            cy += len/6;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawGeology(peakX, peakY, width, height, seed) {
    ctx.save();
    
    // Cliff bands (lighter horizontal stripes)
    ctx.globalAlpha = 0.12;
    const bands = 4 + Math.floor(seededRandom(seed*77)*3);
    for (let i = 0; i < bands; i++) {
        const bSeed = seed*500 + i*31;
        const y = peakY + height*(0.2 + seededRandom(bSeed)*0.55);
        const thick = 3 + seededRandom(bSeed+1)*7;
        const litW = width*0.45 * ((y-peakY)/height);
        const shadW = width*0.55 * ((y-peakY)/height);
        
        ctx.fillStyle = 'rgba(160,175,190,0.25)';
        ctx.fillRect(peakX+3, y, litW*0.85, thick);
        ctx.fillStyle = 'rgba(80,95,110,0.18)';
        ctx.fillRect(peakX - shadW*0.85, y, shadW*0.85-3, thick);
    }
    
    // Couloirs (vertical gullies)
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 4; i++) {
        const cSeed = seed*600 + i*41;
        const cx = peakX + (seededRandom(cSeed)-0.5)*width*0.35;
        const cw = 4 + seededRandom(cSeed+1)*8;
        
        ctx.fillStyle = 'rgba(20,30,45,0.2)';
        ctx.beginPath();
        ctx.moveTo(cx, peakY + height*0.1);
        ctx.lineTo(cx - cw, peakY + height);
        ctx.lineTo(cx + cw, peakY + height);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

function drawSnowCap(leftRidge, rightRidge, peakX, peakY, width, height, seed) {
    const snowDepth = height * 0.32;
    
    ctx.save();
    
    // Build snow polygon that FOLLOWS the ridge contours
    const snowPts = [];
    
    // Start from left ridge, going up
    const leftSnowIdx = Math.floor(leftRidge.length * 0.25);
    for (let i = leftSnowIdx; i >= 0; i--) {
        const pt = leftRidge[i];
        // Add drip variation only at snow line
        const drip = (i === leftSnowIdx) ? seededRandom(seed+i)*12 : 0;
        snowPts.push({x: pt.x, y: pt.y + drip});
    }
    
    // Go along right ridge
    const rightSnowIdx = Math.floor(rightRidge.length * 0.25);
    for (let i = 1; i <= rightSnowIdx; i++) {
        const pt = rightRidge[i];
        const drip = (i === rightSnowIdx) ? seededRandom(seed+100+i)*12 : 0;
        snowPts.push({x: pt.x, y: pt.y + drip});
    }
    
    // Organic snow edge connecting bottom
    const leftEdge = leftRidge[leftSnowIdx];
    const rightEdge = rightRidge[rightSnowIdx];
    const edgePts = organicCurve(rightEdge.x, rightEdge.y + 12, leftEdge.x, leftEdge.y + 12, 12, 10, seed+200);
    for (const pt of edgePts) snowPts.push(pt);
    
    // Snow gradient
    const snowGrad = ctx.createLinearGradient(peakX, peakY, peakX, peakY + snowDepth);
    snowGrad.addColorStop(0, '#ffffff');
    snowGrad.addColorStop(0.4, '#f5faff');
    snowGrad.addColorStop(0.7, '#e8f0f8');
    snowGrad.addColorStop(1, '#d0e0f0');
    
    ctx.fillStyle = snowGrad;
    ctx.beginPath();
    ctx.moveTo(snowPts[0].x, snowPts[0].y);
    for (let i = 1; i < snowPts.length; i++) ctx.lineTo(snowPts[i].x, snowPts[i].y);
    ctx.closePath();
    ctx.fill();
    
    // Snow texture - sparkles
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 25; i++) {
        const sx = peakX + (seededRandom(seed+300+i*3)-0.5)*width*0.35;
        const sy = peakY + seededRandom(seed+301+i*3)*snowDepth*0.7;
        const ss = 1 + seededRandom(seed+302+i*3)*2;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Wind-blown snow wisps
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const wx = peakX + (seededRandom(seed+400+i)-0.5)*width*0.3;
        const wy = peakY + seededRandom(seed+401+i)*snowDepth*0.5;
        const wlen = 10 + seededRandom(seed+402+i)*20;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx+wlen*0.5, wy-3, wx+wlen, wy+2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// ============================================
// 5. FOREST - VARIED ORGANIC TREES
// ============================================

function drawForest() {
    // 4 layers with atmospheric color shift
    drawForestLayer(H*0.485, 0.35, {r:15,g:28,b:22}, {r:8,g:18,b:12}, 0.65, 40, 1);
    drawForestLayer(H*0.495, 0.50, {r:18,g:32,b:24}, {r:10,g:22,b:14}, 0.45, 32, 2);
    drawForestLayer(H*0.507, 0.70, {r:22,g:38,b:26}, {r:12,g:26,b:16}, 0.25, 26, 3);
    drawForestLayer(H*0.520, 0.90, {r:28,g:48,b:30}, {r:15,g:32,b:18}, 0.08, 20, 4);
}

function drawForestLayer(baseY, scale, lightCol, darkCol, hazeAmt, count, layer) {
    // Color shift for distance
    const litC = lerpColor(lightCol.r, lightCol.g, lightCol.b, HAZE.r, HAZE.g, HAZE.b, hazeAmt);
    const drkC = lerpColor(darkCol.r, darkCol.g, darkCol.b, HAZE.r, HAZE.g, HAZE.b, hazeAmt);
    const litStr = `rgb(${litC.r},${litC.g},${litC.b})`;
    const drkStr = `rgb(${drkC.r},${drkC.g},${drkC.b})`;
    
    for (let i = 0; i < count; i++) {
        const seed = layer*1000 + i*37;
        const x = (i/count)*W + (seededRandom(seed)-0.5)*(W/count)*0.85;
        const h = (30 + seededRandom(seed+1)*45) * scale;
        const w = h * (0.22 + seededRandom(seed+2)*0.12);
        
        drawPineTree(x, baseY, w, h, litStr, drkStr, seed, hazeAmt < 0.4);
    }
}

function drawPineTree(x, baseY, w, h, litCol, drkCol, seed, detailed) {
    // Trunk
    if (detailed) {
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(x - w*0.08, baseY - h*0.15, w*0.16, h*0.15);
    }
    
    // Foliage layers - organic, varied
    const layers = detailed ? 7 : 5;
    for (let L = 0; L < layers; L++) {
        const t = L/layers;
        const ly = baseY - h*0.12 - h*t*0.78;
        const lw = w * (1 - t*0.68);
        const lh = h/layers * 1.35;
        
        // Vary each layer
        const skewL = (seededRandom(seed+L*10)-0.5)*6;
        const skewR = (seededRandom(seed+L*10+1)-0.5)*6;
        const peakOff = (seededRandom(seed+L*10+2)-0.5)*4;
        
        // Shadow side
        ctx.fillStyle = drkCol;
        ctx.beginPath();
        ctx.moveTo(x + peakOff, ly - lh);
        ctx.lineTo(x - lw + skewL, ly);
        ctx.lineTo(x, ly + 2);
        ctx.closePath();
        ctx.fill();
        
        // Lit side
        ctx.fillStyle = litCol;
        ctx.beginPath();
        ctx.moveTo(x + peakOff, ly - lh);
        ctx.lineTo(x + lw*0.85 + skewR, ly);
        ctx.lineTo(x, ly + 2);
        ctx.closePath();
        ctx.fill();
        
        // Branch detail
        if (detailed && L < layers-1) {
            ctx.strokeStyle = drkCol;
            ctx.lineWidth = 1;
            for (let b = 0; b < 3; b++) {
                const by = ly - lh*0.3 + b*(lh*0.25);
                const blen = lw*(0.25 + seededRandom(seed+L*20+b)*0.35);
                ctx.beginPath();
                ctx.moveTo(x-2, by);
                ctx.lineTo(x - blen, by + blen*0.25);
                ctx.stroke();
            }
        }
    }
    
    // Snow on tree
    if (detailed && seededRandom(seed+99) > 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let s = 0; s < 3; s++) {
            const sy = baseY - h*(0.35 + s*0.2);
            const sw = w*0.28*(1 - s*0.15);
            ctx.beginPath();
            ctx.ellipse(x, sy, sw, 3, 0, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

// ============================================
// 6. LAKE - RICH REFLECTIONS
// ============================================

function drawLake() {
    const lakeTop = H*0.52;
    const lakeBot = H*0.78;
    
    // Base water
    const wGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeBot);
    wGrad.addColorStop(0, '#5a7898');
    wGrad.addColorStop(0.25, '#4a6888');
    wGrad.addColorStop(0.5, '#3a5878');
    wGrad.addColorStop(0.75, '#2a4868');
    wGrad.addColorStop(1, '#1a3858');
    ctx.fillStyle = wGrad;
    ctx.fillRect(0, lakeTop, W, lakeBot-lakeTop);
    
    // Mountain reflections
    drawMountainReflections(lakeTop, lakeBot);
    
    // Sun reflection
    drawSunReflection(lakeTop, lakeBot);
    
    // Water texture
    drawWaterTexture(lakeTop, lakeBot);
    
    // Shoreline
    drawShoreline(lakeTop);
}

function drawMountainReflections(lakeTop, lakeBot) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    
    // Simplified inverted mountain shapes
    const refY = lakeTop;
    const refH = (lakeBot - lakeTop) * 0.6;
    
    // Center mountain reflection
    ctx.fillStyle = '#3a4858';
    ctx.beginPath();
    ctx.moveTo(W*0.50, refY);
    ctx.lineTo(W*0.50 - 180, refY + refH);
    ctx.lineTo(W*0.50 + 150, refY + refH);
    ctx.closePath();
    ctx.fill();
    
    // Left
    ctx.fillStyle = '#2a3848';
    ctx.beginPath();
    ctx.moveTo(W*0.15, refY);
    ctx.lineTo(W*0.15 - 140, refY + refH*0.8);
    ctx.lineTo(W*0.15 + 110, refY + refH*0.8);
    ctx.closePath();
    ctx.fill();
    
    // Right
    ctx.fillStyle = '#3a4858';
    ctx.beginPath();
    ctx.moveTo(W*0.85, refY);
    ctx.lineTo(W*0.85 - 120, refY + refH*0.7);
    ctx.lineTo(W*0.85 + 100, refY + refH*0.7);
    ctx.closePath();
    ctx.fill();
    
    // Ripple distortion
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 40; i++) {
        const y = lakeTop + i*(lakeBot-lakeTop)/40;
        const pts = organicCurve(-10, y, W+10, y+1, 25, 2, i*77);
        ctx.strokeStyle = i%2 === 0 ? 'rgba(80,100,120,0.3)' : 'rgba(40,60,80,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let p = 1; p < pts.length; p++) ctx.lineTo(pts[p].x, pts[p].y);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawSunReflection(lakeTop, lakeBot) {
    const sx = W*0.65;
    
    ctx.save();
    
    // Reflection path
    const refGrad = ctx.createLinearGradient(0, lakeTop, 0, lakeBot);
    refGrad.addColorStop(0, 'rgba(255,220,150,0.45)');
    refGrad.addColorStop(0.4, 'rgba(255,200,120,0.25)');
    refGrad.addColorStop(0.8, 'rgba(255,180,100,0.1)');
    refGrad.addColorStop(1, 'rgba(255,160,80,0)');
    
    ctx.fillStyle = refGrad;
    ctx.beginPath();
    ctx.moveTo(sx-25, lakeTop);
    ctx.lineTo(sx+25, lakeTop);
    ctx.lineTo(sx+70, lakeBot);
    ctx.lineTo(sx-70, lakeBot);
    ctx.closePath();
    ctx.fill();
    
    // Sparkles
    for (let i = 0; i < 35; i++) {
        const spx = sx + (seededRandom(i*5)-0.5)*50;
        const spy = lakeTop + seededRandom(i*5+1)*(lakeBot-lakeTop)*0.7;
        const sps = 1 + seededRandom(i*5+2)*2.5;
        ctx.globalAlpha = 0.4 + seededRandom(i*5+3)*0.5;
        ctx.fillStyle = '#fffae0';
        ctx.beginPath();
        ctx.arc(spx, spy, sps, 0, Math.PI*2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawWaterTexture(lakeTop, lakeBot) {
    ctx.save();
    ctx.globalAlpha = 0.06;
    
    // Wave patterns
    for (let i = 0; i < 50; i++) {
        const y = lakeTop + (i/50)*(lakeBot-lakeTop);
        const amp = 1.5 + (i/50)*2;
        ctx.strokeStyle = i%3 === 0 ? 'rgba(100,150,200,0.3)' : 'rgba(50,100,150,0.2)';
        ctx.lineWidth = 0.5 + (i/50);
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= W; x += 5) {
            const wy = y + Math.sin(x*0.02 + i*0.3)*amp;
            ctx.lineTo(x, wy);
        }
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawShoreline(lakeTop) {
    ctx.save();
    
    // Soft edge gradient
    const edgeGrad = ctx.createLinearGradient(0, lakeTop-12, 0, lakeTop+12);
    edgeGrad.addColorStop(0, 'rgba(60,80,55,0.8)');
    edgeGrad.addColorStop(0.5, 'rgba(60,85,60,0.4)');
    edgeGrad.addColorStop(1, 'rgba(70,100,120,0)');
    
    const shorePts = organicCurve(-10, lakeTop, W+10, lakeTop, 35, 6, 5555);
    
    ctx.fillStyle = edgeGrad;
    ctx.beginPath();
    ctx.moveTo(-10, lakeTop-12);
    for (const pt of shorePts) ctx.lineTo(pt.x, pt.y);
    ctx.lineTo(W+10, lakeTop+15);
    ctx.lineTo(-10, lakeTop+15);
    ctx.closePath();
    ctx.fill();
    
    // Shore rocks
    for (let i = 0; i < 25; i++) {
        const rSeed = 6000 + i*23;
        const rx = seededRandom(rSeed)*W;
        const ry = lakeTop + (seededRandom(rSeed+1)-0.5)*12;
        const rs = 3 + seededRandom(rSeed+2)*7;
        drawRock(rx, ry, rs, rSeed);
    }
    
    // Reeds
    for (let i = 0; i < 18; i++) {
        const rdSeed = 7000 + i*31;
        const rx = seededRandom(rdSeed)*W;
        const ry = lakeTop + (seededRandom(rdSeed+1)-0.5)*8;
        drawReeds(rx, ry, rdSeed);
    }
    
    ctx.restore();
}

function drawRock(x, y, size, seed) {
    const rGrad = ctx.createRadialGradient(x-size*0.3, y-size*0.3, 0, x, y, size);
    rGrad.addColorStop(0, '#808080');
    rGrad.addColorStop(0.6, '#606060');
    rGrad.addColorStop(1, '#404040');
    
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    for (let a = 0; a <= 8; a++) {
        const ang = (a/8)*Math.PI*2;
        const v = 0.7 + seededRandom(seed+a)*0.5;
        const px = x + Math.cos(ang)*size*v;
        const py = y + Math.sin(ang)*size*v*0.6;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.fill();
}

function drawReeds(x, y, seed) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    const blades = 3 + Math.floor(seededRandom(seed)*4);
    
    for (let i = 0; i < blades; i++) {
        const h = 10 + seededRandom(seed+i*3)*18;
        const lean = (seededRandom(seed+i*3+1)-0.5)*12;
        
        ctx.strokeStyle = '#2a4520';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + (i-blades/2)*2, y);
        ctx.quadraticCurveTo(x+lean, y-h*0.6, x+lean*1.3, y-h);
        ctx.stroke();
    }
    ctx.restore();
}

// ============================================
// 7. FOREGROUND - WARM, DENSE, HIGH CONTRAST
// ============================================

function drawForeground() {
    const meadowTop = H*0.76;
    
    // Warmer grass base
    const gGrad = ctx.createLinearGradient(0, meadowTop, 0, H);
    gGrad.addColorStop(0, '#4a6838');
    gGrad.addColorStop(0.25, '#3d5a2d');
    gGrad.addColorStop(0.5, '#324a24');
    gGrad.addColorStop(0.75, '#253a1a');
    gGrad.addColorStop(1, '#182a10');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, meadowTop, W, H-meadowTop);
    
    // Dense grass
    drawGrass(meadowTop);
    
    // Wildflowers
    drawFlowers(meadowTop);
    
    // Foreground rocks
    for (let i = 0; i < 10; i++) {
        const rSeed = 14000 + i*29;
        const rx = seededRandom(rSeed)*W;
        const ry = meadowTop + (H-meadowTop)*0.4 + seededRandom(rSeed+1)*(H-meadowTop)*0.5;
        const rs = 6 + seededRandom(rSeed+2)*12;
        drawRock(rx, ry, rs, rSeed);
    }
}

function drawGrass(meadowTop) {
    ctx.save();
    
    // Background grass
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 500; i++) {
        const seed = 8000 + i*7;
        const x = seededRandom(seed)*W;
        const y = meadowTop + seededRandom(seed+1)*(H-meadowTop)*0.35;
        const h = 4 + seededRandom(seed+2)*7;
        drawBlade(x, y, h, '#5a7848', seed);
    }
    
    // Mid grass
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 400; i++) {
        const seed = 9000 + i*11;
        const x = seededRandom(seed)*W;
        const y = meadowTop + (H-meadowTop)*0.25 + seededRandom(seed+1)*(H-meadowTop)*0.4;
        const h = 7 + seededRandom(seed+2)*10;
        drawBlade(x, y, h, '#4a6838', seed);
    }
    
    // Foreground grass (densest, darkest for contrast)
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 350; i++) {
        const seed = 10000 + i*13;
        const x = seededRandom(seed)*W;
        const y = meadowTop + (H-meadowTop)*0.55 + seededRandom(seed+1)*(H-meadowTop)*0.45;
        const h = 12 + seededRandom(seed+2)*16;
        drawBlade(x, y, h, '#2a4818', seed);
    }
    
    ctx.restore();
}

function drawBlade(x, y, h, col, seed) {
    const lean = (seededRandom(seed+10)-0.5)*h*0.35;
    const curve = (seededRandom(seed+11)-0.5)*7;
    
    ctx.strokeStyle = col;
    ctx.lineWidth = 1 + seededRandom(seed+12)*1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x+curve, y-h*0.5, x+lean, y-h);
    ctx.stroke();
}

function drawFlowers(meadowTop) {
    ctx.save();
    
    // Poppies (WARM red/orange)
    for (let i = 0; i < 50; i++) {
        const seed = 11000 + i*17;
        const x = seededRandom(seed)*W;
        const y = meadowTop + seededRandom(seed+1)*(H-meadowTop);
        const s = 3 + seededRandom(seed+2)*4;
        const dist = (y-meadowTop)/(H-meadowTop);
        ctx.globalAlpha = 0.5 + dist*0.4;
        
        // Stem
        ctx.strokeStyle = '#2a4018';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (seededRandom(seed+3)-0.5)*3, y-s*3);
        ctx.stroke();
        
        // Petals
        const col = seededRandom(seed+4) > 0.5 ? '#cc4444' : '#dd6622';
        ctx.fillStyle = col;
        for (let p = 0; p < 5; p++) {
            const ang = (p/5)*Math.PI*2 + seededRandom(seed+5)*0.3;
            const px = x + Math.cos(ang)*s*0.65;
            const py = y - s*3 + Math.sin(ang)*s*0.45;
            ctx.beginPath();
            ctx.arc(px, py, s*0.45, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.fillStyle = '#220000';
        ctx.beginPath();
        ctx.arc(x, y-s*3, s*0.25, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Daisies
    for (let i = 0; i < 35; i++) {
        const seed = 12000 + i*19;
        const x = seededRandom(seed)*W;
        const y = meadowTop + seededRandom(seed+1)*(H-meadowTop);
        const s = 2 + seededRandom(seed+2)*3;
        const dist = (y-meadowTop)/(H-meadowTop);
        ctx.globalAlpha = 0.5 + dist*0.4;
        
        ctx.fillStyle = '#fff';
        for (let p = 0; p < 8; p++) {
            const ang = (p/8)*Math.PI*2;
            const px = x + Math.cos(ang)*s;
            const py = y - s*2 + Math.sin(ang)*s*0.6;
            ctx.beginPath();
            ctx.ellipse(px, py, s*0.35, s*0.18, ang, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(x, y-s*2, s*0.35, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Buttercups (WARM yellow)
    for (let i = 0; i < 45; i++) {
        const seed = 13000 + i*23;
        const x = seededRandom(seed)*W;
        const y = meadowTop + seededRandom(seed+1)*(H-meadowTop);
        const s = 2 + seededRandom(seed+2)*2;
        const dist = (y-meadowTop)/(H-meadowTop);
        ctx.globalAlpha = 0.5 + dist*0.4;
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x, y-s*2, s, 0, Math.PI*2);
        ctx.fill();
    }
    
    ctx.restore();
}

// ============================================
// 8. BIRDS & ATMOSPHERE
// ============================================

function drawBirds() {
    ctx.save();
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    for (let g = 0; g < 3; g++) {
        const gSeed = 15000 + g*100;
        const gx = W*0.2 + seededRandom(gSeed)*W*0.6;
        const gy = H*0.12 + seededRandom(gSeed+1)*H*0.15;
        ctx.globalAlpha = 0.5 + seededRandom(gSeed+2)*0.3;
        
        for (let b = 0; b < 5; b++) {
            const bx = gx + (b-2)*14 + (seededRandom(gSeed+b*3)-0.5)*5;
            const by = gy + Math.abs(b-2)*7;
            const ws = 4 + seededRandom(gSeed+b*3+1)*3;
            ctx.beginPath();
            ctx.moveTo(bx-ws, by+2);
            ctx.quadraticCurveTo(bx, by-2, bx+ws, by+2);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawAtmosphere() {
    ctx.save();
    
    // Subtle mist
    const mist = ctx.createLinearGradient(0, H*0.48, 0, H*0.56);
    mist.addColorStop(0, 'rgba(180,190,200,0)');
    mist.addColorStop(0.5, 'rgba(180,190,200,0.08)');
    mist.addColorStop(1, 'rgba(180,190,200,0)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, H*0.48, W, H*0.08);
    
    ctx.restore();
}

function drawVignette() {
    ctx.save();
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.35, W/2, H/2, H);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.7, 'rgba(0,0,0,0.08)');
    vig.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

// ============================================
// RENDER
// ============================================

function render() {
    ctx.clearRect(0, 0, W, H);
    
    drawSky();
    drawStars();
    drawSun();
    drawClouds();
    drawFarMountains();
    drawMainMountains();
    drawAtmosphere();
    drawForest();
    drawLake();
    drawForeground();
    drawBirds();
    drawVignette();
    
    console.log('V3 Mountain Landscape rendered!');
    console.log('Lessons applied: Color-based atmosphere, organic shapes, dense texture');
}

render();
