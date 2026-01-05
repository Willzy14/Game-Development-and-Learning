// ART STUDY #3: CHARACTER PORTRAIT - Fantasy Warrior
// LESSONS APPLIED:
// 1. Soft edges everywhere (skin tones blend, no hard cutoffs)
// 2. Scattered elements (hair strands, not solid shapes)
// 3. Gradient transitions (fabric folds, armor highlights)
// 4. Organic shapes (facial features, muscle contours)

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

function lerp(a,b,t){return a+(b-a)*t}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function seededRandom(s){const x=Math.sin(s*9999)*10000;return x-Math.floor(x)}
function lerpColor(r1,g1,b1,r2,g2,b2,t){return{r:Math.round(lerp(r1,r2,t)),g:Math.round(lerp(g1,g2,t)),b:Math.round(lerp(b1,b2,t))}}

// Organic curve for natural shapes
function organicCurve(x1,y1,x2,y2,segs,v,seed){
    const pts=[{x:x1,y:y1}];
    for(let i=1;i<segs;i++){const t=i/segs,e=Math.sin(t*Math.PI);
        pts.push({x:lerp(x1,x2,t)+(seededRandom(seed+i*2)-0.5)*v*e,y:lerp(y1,y2,t)+(seededRandom(seed+i*2+1)-0.5)*v*e})}
    pts.push({x:x2,y:y2});return pts;
}

// Character center
const CX = W/2, CY = H*0.45;

// Skin palette (warm tones)
const SKIN = {
    highlight: {r:255, g:220, b:195},
    mid: {r:220, g:175, b:145},
    shadow: {r:165, g:115, b:90},
    deep: {r:120, g:75, b:55}
};

// === BACKGROUND ===
function drawBackground() {
    // Dark moody gradient
    const bg = ctx.createRadialGradient(CX, CY-100, 50, CX, CY, H*0.8);
    bg.addColorStop(0, '#2a2a3e');
    bg.addColorStop(0.4, '#1a1a28');
    bg.addColorStop(1, '#0a0a12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    
    // Subtle light source from top-left
    ctx.save();
    const light = ctx.createRadialGradient(W*0.25, H*0.1, 0, W*0.25, H*0.1, H*0.6);
    light.addColorStop(0, 'rgba(255,240,220,0.08)');
    light.addColorStop(0.5, 'rgba(255,220,180,0.03)');
    light.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    
    // Dust particles
    ctx.save();
    for(let i=0; i<60; i++){
        const seed = i*17;
        const px = seededRandom(seed)*W;
        const py = seededRandom(seed+1)*H;
        const ps = 1 + seededRandom(seed+2)*2;
        ctx.globalAlpha = 0.1 + seededRandom(seed+3)*0.15;
        ctx.fillStyle = '#a08060';
        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
}

// === SHOULDERS & ARMOR ===
function drawShoulders() {
    // Armor base on shoulders
    const shoulderY = CY + 180;
    
    // Left shoulder armor plate
    drawArmorPlate(CX - 160, shoulderY, 120, 80, -0.2, 100);
    // Right shoulder armor plate (lit side)
    drawArmorPlate(CX + 40, shoulderY, 120, 80, 0.2, 200);
    
    // Neck and upper chest visible
    drawNeckChest();
}

function drawArmorPlate(x, y, w, h, tilt, seed) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(tilt);
    
    // Metal base with gradient
    const metalGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
    metalGrad.addColorStop(0, '#606878');
    metalGrad.addColorStop(0.3, '#808898');
    metalGrad.addColorStop(0.5, '#9098a8');
    metalGrad.addColorStop(0.7, '#707888');
    metalGrad.addColorStop(1, '#505868');
    
    ctx.fillStyle = metalGrad;
    ctx.beginPath();
    // Curved armor shape
    ctx.moveTo(-w/2, -h*0.3);
    ctx.quadraticCurveTo(-w/2, -h/2, -w*0.2, -h/2);
    ctx.quadraticCurveTo(w*0.2, -h*0.6, w/2, -h*0.3);
    ctx.quadraticCurveTo(w/2 + 10, h*0.2, w*0.3, h/2);
    ctx.quadraticCurveTo(0, h/2 + 10, -w*0.3, h/2);
    ctx.quadraticCurveTo(-w/2 - 5, h*0.2, -w/2, -h*0.3);
    ctx.fill();
    
    // Edge highlight (soft)
    ctx.strokeStyle = 'rgba(200,210,230,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Scratches and wear (scattered, not uniform)
    ctx.globalAlpha = 0.15;
    for(let i=0; i<12; i++){
        const sx = (seededRandom(seed+i*3)-0.5)*w*0.8;
        const sy = (seededRandom(seed+i*3+1)-0.5)*h*0.8;
        const sl = 5 + seededRandom(seed+i*3+2)*15;
        const sa = (seededRandom(seed+i*4)-0.5)*0.8;
        ctx.strokeStyle = seededRandom(seed+i*5)>0.5 ? '#a0a8b8' : '#404858';
        ctx.lineWidth = 0.5 + seededRandom(seed+i*6);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(sa)*sl, sy + Math.sin(sa)*sl);
        ctx.stroke();
    }
    
    // Decorative rivets
    ctx.globalAlpha = 1;
    const rivets = [[-w*0.35, -h*0.2], [w*0.35, -h*0.2], [-w*0.25, h*0.25], [w*0.25, h*0.25]];
    for(const [rx, ry] of rivets){
        const rg = ctx.createRadialGradient(rx-1, ry-1, 0, rx, ry, 4);
        rg.addColorStop(0, '#c0c8d8');
        rg.addColorStop(0.5, '#808898');
        rg.addColorStop(1, '#505868');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI*2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawNeckChest() {
    const neckX = CX, neckY = CY + 130;
    
    // Neck cylinder with soft skin tones
    const neckGrad = ctx.createLinearGradient(neckX-40, neckY, neckX+40, neckY);
    neckGrad.addColorStop(0, `rgb(${SKIN.shadow.r},${SKIN.shadow.g},${SKIN.shadow.b})`);
    neckGrad.addColorStop(0.3, `rgb(${SKIN.mid.r},${SKIN.mid.g},${SKIN.mid.b})`);
    neckGrad.addColorStop(0.6, `rgb(${SKIN.highlight.r},${SKIN.highlight.g},${SKIN.highlight.b})`);
    neckGrad.addColorStop(1, `rgb(${SKIN.mid.r},${SKIN.mid.g},${SKIN.mid.b})`);
    
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.ellipse(neckX, neckY + 30, 50, 60, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Subtle neck muscle definition (soft, not hard lines)
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = `rgb(${SKIN.shadow.r},${SKIN.shadow.g},${SKIN.shadow.b})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Sternocleidomastoid hint
    ctx.beginPath();
    ctx.moveTo(neckX - 25, neckY);
    ctx.quadraticCurveTo(neckX - 30, neckY + 40, neckX - 20, neckY + 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(neckX + 25, neckY);
    ctx.quadraticCurveTo(neckX + 30, neckY + 40, neckX + 20, neckY + 70);
    ctx.stroke();
    ctx.restore();
}

// === HEAD SHAPE ===
function drawHeadShape() {
    const headX = CX, headY = CY;
    const headW = 140, headH = 180;
    
    // Base head shape with soft gradients (no hard edge)
    const headGrad = ctx.createRadialGradient(headX - 30, headY - 40, 20, headX, headY, headH);
    headGrad.addColorStop(0, `rgb(${SKIN.highlight.r},${SKIN.highlight.g},${SKIN.highlight.b})`);
    headGrad.addColorStop(0.4, `rgb(${SKIN.mid.r},${SKIN.mid.g},${SKIN.mid.b})`);
    headGrad.addColorStop(0.8, `rgb(${SKIN.shadow.r},${SKIN.shadow.g},${SKIN.shadow.b})`);
    headGrad.addColorStop(1, `rgb(${SKIN.deep.r},${SKIN.deep.g},${SKIN.deep.b})`);
    
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    // Organic head shape
    ctx.moveTo(headX, headY - headH/2); // Top of head
    // Right side
    ctx.quadraticCurveTo(headX + headW*0.45, headY - headH*0.35, headX + headW/2, headY - headH*0.1); // Temple
    ctx.quadraticCurveTo(headX + headW*0.55, headY + headH*0.1, headX + headW*0.45, headY + headH*0.25); // Cheekbone
    ctx.quadraticCurveTo(headX + headW*0.35, headY + headH*0.4, headX, headY + headH/2); // Jaw to chin
    // Left side (mirror)
    ctx.quadraticCurveTo(headX - headW*0.35, headY + headH*0.4, headX - headW*0.45, headY + headH*0.25);
    ctx.quadraticCurveTo(headX - headW*0.55, headY + headH*0.1, headX - headW/2, headY - headH*0.1);
    ctx.quadraticCurveTo(headX - headW*0.45, headY - headH*0.35, headX, headY - headH/2);
    ctx.fill();
    
    // Soft shadow on right side of face (away from light)
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const shadowGrad = ctx.createLinearGradient(headX, headY, headX + headW*0.6, headY);
    shadowGrad.addColorStop(0, 'rgba(180,160,150,0)');
    shadowGrad.addColorStop(0.5, 'rgba(160,130,115,0.3)');
    shadowGrad.addColorStop(1, 'rgba(140,100,80,0.5)');
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();
    
    // Skin texture (very subtle pores/imperfections)
    drawSkinTexture(headX, headY, headW, headH);
}

function drawSkinTexture(cx, cy, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.04;
    
    // Scattered subtle dots for pore texture
    for(let i=0; i<200; i++){
        const seed = 1000 + i*7;
        const angle = seededRandom(seed) * Math.PI * 2;
        const dist = seededRandom(seed+1) * w * 0.45;
        const px = cx + Math.cos(angle) * dist * 0.9;
        const py = cy + Math.sin(angle) * dist * 1.1;
        const ps = 0.5 + seededRandom(seed+2) * 1.5;
        
        ctx.fillStyle = seededRandom(seed+3) > 0.5 
            ? `rgb(${SKIN.shadow.r},${SKIN.shadow.g},${SKIN.shadow.b})`
            : `rgb(${SKIN.highlight.r},${SKIN.highlight.g},${SKIN.highlight.b})`;
        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
}

// === FACIAL FEATURES ===
function drawEyes() {
    const eyeY = CY - 20;
    const eyeSpacing = 45;
    
    // Left eye
    drawEye(CX - eyeSpacing, eyeY, false, 100);
    // Right eye (slightly in shadow)
    drawEye(CX + eyeSpacing, eyeY, true, 200);
}

function drawEye(ex, ey, inShadow, seed) {
    const eyeW = 32, eyeH = 14;
    
    // Eye socket shadow (soft gradient, not hard)
    const socketGrad = ctx.createRadialGradient(ex, ey, 5, ex, ey, eyeW*1.2);
    socketGrad.addColorStop(0, 'rgba(0,0,0,0)');
    socketGrad.addColorStop(0.6, `rgba(${SKIN.shadow.r},${SKIN.shadow.g},${SKIN.shadow.b},0.3)`);
    socketGrad.addColorStop(1, `rgba(${SKIN.deep.r},${SKIN.deep.g},${SKIN.deep.b},0.5)`);
    ctx.fillStyle = socketGrad;
    ctx.beginPath();
    ctx.ellipse(ex, ey, eyeW*1.2, eyeH*2, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Eyeball white (slightly off-white, with gradient)
    const whiteGrad = ctx.createRadialGradient(ex-3, ey-2, 0, ex, ey, eyeW);
    whiteGrad.addColorStop(0, '#f8f4f0');
    whiteGrad.addColorStop(0.7, '#e8e0d8');
    whiteGrad.addColorStop(1, '#d0c8c0');
    ctx.fillStyle = whiteGrad;
    ctx.beginPath();
    ctx.ellipse(ex, ey, eyeW, eyeH, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Iris
    const irisR = 11;
    const irisGrad = ctx.createRadialGradient(ex-2, ey-2, 0, ex, ey, irisR);
    irisGrad.addColorStop(0, '#4a6080');
    irisGrad.addColorStop(0.3, '#3a5070');
    irisGrad.addColorStop(0.7, '#2a4060');
    irisGrad.addColorStop(1, '#1a2a40');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, irisR, 0, Math.PI*2);
    ctx.fill();
    
    // Iris texture (radial lines)
    ctx.save();
    ctx.globalAlpha = 0.2;
    for(let i=0; i<24; i++){
        const ang = (i/24)*Math.PI*2;
        ctx.strokeStyle = i%2===0 ? '#5a7090' : '#2a4060';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(ex + Math.cos(ang)*3, ey + Math.sin(ang)*3);
        ctx.lineTo(ex + Math.cos(ang)*irisR, ey + Math.sin(ang)*irisR);
        ctx.stroke();
    }
    ctx.restore();
    
    // Pupil
    ctx.fillStyle = '#0a0a10';
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI*2);
    ctx.fill();
    
    // Catchlight (life in the eye)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex - 4, ey - 3, 2.5, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(ex + 3, ey + 2, 1.5, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Upper eyelid crease
    ctx.save();
    ctx.strokeStyle = `rgba(${SKIN.deep.r},${SKIN.deep.g},${SKIN.deep.b},0.4)`;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - eyeW*0.9, ey - eyeH*0.3);
    ctx.quadraticCurveTo(ex, ey - eyeH*1.8, ex + eyeW*0.9, ey - eyeH*0.3);
    ctx.stroke();
    ctx.restore();
    
    // Eyelashes (scattered, not uniform)
    ctx.save();
    ctx.strokeStyle = '#1a1a20';
    ctx.lineWidth = 1;
    for(let i=0; i<12; i++){
        const t = i/11;
        const lx = ex - eyeW*0.8 + t*eyeW*1.6;
        const ly = ey - eyeH*0.9 + Math.sin(t*Math.PI)*eyeH*0.3;
        const lLen = 4 + seededRandom(seed+i)*4;
        const lAng = -Math.PI/2 + (t-0.5)*0.8 + (seededRandom(seed+i+50)-0.5)*0.3;
        ctx.globalAlpha = 0.5 + seededRandom(seed+i+100)*0.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.cos(lAng)*lLen, ly + Math.sin(lAng)*lLen);
        ctx.stroke();
    }
    ctx.restore();
}

function drawNose() {
    const noseX = CX, noseY = CY + 25;
    
    // Nose bridge highlight (soft)
    ctx.save();
    const bridgeGrad = ctx.createLinearGradient(noseX-15, noseY-40, noseX+15, noseY-40);
    bridgeGrad.addColorStop(0, 'rgba(255,220,195,0)');
    bridgeGrad.addColorStop(0.4, 'rgba(255,230,210,0.4)');
    bridgeGrad.addColorStop(0.6, 'rgba(255,225,205,0.3)');
    bridgeGrad.addColorStop(1, 'rgba(255,220,195,0)');
    ctx.fillStyle = bridgeGrad;
    ctx.fillRect(noseX-15, noseY-50, 30, 60);
    ctx.restore();
    
    // Nose shadow on right side
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = `rgb(${SKIN.shadow.r},${SKIN.shadow.g},${SKIN.shadow.b})`;
    ctx.beginPath();
    ctx.moveTo(noseX + 5, noseY - 30);
    ctx.quadraticCurveTo(noseX + 18, noseY, noseX + 15, noseY + 15);
    ctx.quadraticCurveTo(noseX + 5, noseY + 20, noseX, noseY + 15);
    ctx.fill();
    ctx.restore();
    
    // Nostril hints (soft, not hard holes)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = `rgb(${SKIN.deep.r},${SKIN.deep.g},${SKIN.deep.b})`;
    ctx.beginPath();
    ctx.ellipse(noseX - 10, noseY + 12, 6, 4, -0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(noseX + 10, noseY + 12, 6, 4, 0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    
    // Nose tip highlight
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = `rgb(${SKIN.highlight.r},${SKIN.highlight.g},${SKIN.highlight.b})`;
    ctx.beginPath();
    ctx.ellipse(noseX - 3, noseY + 5, 8, 6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
}

function drawMouth() {
    const mouthX = CX, mouthY = CY + 70;
    const mouthW = 45;
    
    // Lips with soft gradients
    
    // Upper lip
    const upperGrad = ctx.createLinearGradient(mouthX, mouthY-8, mouthX, mouthY+2);
    upperGrad.addColorStop(0, '#c08878');
    upperGrad.addColorStop(0.5, '#b07868');
    upperGrad.addColorStop(1, '#a06858');
    ctx.fillStyle = upperGrad;
    ctx.beginPath();
    ctx.moveTo(mouthX - mouthW, mouthY);
    ctx.quadraticCurveTo(mouthX - mouthW*0.5, mouthY - 4, mouthX, mouthY - 8); // Cupid's bow
    ctx.quadraticCurveTo(mouthX + mouthW*0.5, mouthY - 4, mouthX + mouthW, mouthY);
    ctx.quadraticCurveTo(mouthX, mouthY + 2, mouthX - mouthW, mouthY);
    ctx.fill();
    
    // Lower lip
    const lowerGrad = ctx.createLinearGradient(mouthX, mouthY, mouthX, mouthY+15);
    lowerGrad.addColorStop(0, '#c58880');
    lowerGrad.addColorStop(0.4, '#d09888');
    lowerGrad.addColorStop(1, '#b07868');
    ctx.fillStyle = lowerGrad;
    ctx.beginPath();
    ctx.moveTo(mouthX - mouthW*0.9, mouthY + 2);
    ctx.quadraticCurveTo(mouthX, mouthY + 18, mouthX + mouthW*0.9, mouthY + 2);
    ctx.quadraticCurveTo(mouthX, mouthY + 4, mouthX - mouthW*0.9, mouthY + 2);
    ctx.fill();
    
    // Lip line (soft, not hard)
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#804848';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mouthX - mouthW*0.85, mouthY + 1);
    ctx.quadraticCurveTo(mouthX, mouthY + 3, mouthX + mouthW*0.85, mouthY + 1);
    ctx.stroke();
    ctx.restore();
    
    // Lower lip highlight
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY + 8, 15, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
}

function drawEyebrows() {
    const browY = CY - 55;
    drawEyebrow(CX - 45, browY, false, 300);
    drawEyebrow(CX + 45, browY, true, 400);
}

function drawEyebrow(bx, by, mirrored, seed) {
    const dir = mirrored ? -1 : 1;
    
    ctx.save();
    ctx.strokeStyle = '#2a2018';
    ctx.lineCap = 'round';
    
    // Many scattered hair strokes (not a solid shape!)
    for(let i=0; i<35; i++){
        const t = i/34;
        const hx = bx + dir*(t-0.5)*60;
        const hy = by + Math.sin(t*Math.PI)*8 - t*3;
        const hLen = 6 + seededRandom(seed+i)*6;
        const hAng = -Math.PI*0.35 + (seededRandom(seed+i+50)-0.5)*0.5 + t*0.3*dir;
        
        ctx.globalAlpha = 0.4 + seededRandom(seed+i+100)*0.5;
        ctx.lineWidth = 0.8 + seededRandom(seed+i+150)*0.8;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + Math.cos(hAng)*hLen, hy + Math.sin(hAng)*hLen);
        ctx.stroke();
    }
    ctx.restore();
}

// === HAIR ===
function drawHair() {
    const hairTop = CY - 120;
    const headW = 140;
    
    // Hair mass base (dark)
    ctx.fillStyle = '#1a1410';
    ctx.beginPath();
    ctx.moveTo(CX, hairTop - 30);
    ctx.quadraticCurveTo(CX + headW*0.8, hairTop, CX + headW*0.9, CY + 50);
    ctx.quadraticCurveTo(CX + headW*0.95, CY + 150, CX + headW*0.5, CY + 220);
    ctx.lineTo(CX - headW*0.5, CY + 220);
    ctx.quadraticCurveTo(CX - headW*0.95, CY + 150, CX - headW*0.9, CY + 50);
    ctx.quadraticCurveTo(CX - headW*0.8, hairTop, CX, hairTop - 30);
    ctx.fill();
    
    // Hair highlight areas (soft gradients)
    ctx.save();
    const hairHighlight = ctx.createRadialGradient(CX - 50, CY - 60, 0, CX - 50, CY - 60, 80);
    hairHighlight.addColorStop(0, 'rgba(60,45,35,0.6)');
    hairHighlight.addColorStop(1, 'rgba(30,20,15,0)');
    ctx.fillStyle = hairHighlight;
    ctx.fillRect(CX - 130, hairTop - 50, 150, 150);
    ctx.restore();
    
    // Individual hair strands (scattered, flowing)
    drawHairStrands();
}

function drawHairStrands() {
    ctx.save();
    
    // Many flowing strands at different opacities
    for(let layer = 0; layer < 3; layer++){
        const baseAlpha = [0.15, 0.25, 0.4][layer];
        const count = [80, 60, 40][layer];
        
        for(let i=0; i<count; i++){
            const seed = layer*1000 + i*13;
            
            // Start point around head
            const startAngle = -Math.PI*0.8 + seededRandom(seed)*Math.PI*1.6;
            const startR = 80 + seededRandom(seed+1)*60;
            const sx = CX + Math.cos(startAngle)*startR*0.5;
            const sy = CY - 80 + Math.sin(startAngle)*startR*0.3;
            
            // End point (flowing down)
            const flowDir = startAngle + (seededRandom(seed+2)-0.5)*0.5;
            const flowLen = 80 + seededRandom(seed+3)*120;
            const ex = sx + Math.cos(flowDir + Math.PI*0.4)*flowLen*0.3;
            const ey = sy + flowLen;
            
            // Control point for curve
            const cx1 = sx + (seededRandom(seed+4)-0.5)*40;
            const cy1 = sy + flowLen*0.4;
            
            // Color variation
            const brightness = 20 + seededRandom(seed+5)*30;
            ctx.strokeStyle = `rgb(${brightness+10},${brightness},${brightness-5})`;
            ctx.lineWidth = 0.5 + seededRandom(seed+6)*1.5;
            ctx.globalAlpha = baseAlpha + seededRandom(seed+7)*0.2;
            
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(cx1, cy1, ex, ey);
            ctx.stroke();
        }
    }
    ctx.restore();
}

// === CAPE/CLOAK ===
function drawCloak() {
    const cloakTop = CY + 160;
    
    // Cloak base with folds
    const cloakGrad = ctx.createLinearGradient(CX - 200, cloakTop, CX + 200, H);
    cloakGrad.addColorStop(0, '#2a1a1a');
    cloakGrad.addColorStop(0.3, '#3a2020');
    cloakGrad.addColorStop(0.5, '#4a2828');
    cloakGrad.addColorStop(0.7, '#3a2020');
    cloakGrad.addColorStop(1, '#2a1a1a');
    
    ctx.fillStyle = cloakGrad;
    ctx.beginPath();
    ctx.moveTo(CX - 200, cloakTop);
    ctx.quadraticCurveTo(CX - 250, H*0.7, CX - 220, H);
    ctx.lineTo(CX + 220, H);
    ctx.quadraticCurveTo(CX + 250, H*0.7, CX + 200, cloakTop);
    ctx.quadraticCurveTo(CX, cloakTop + 30, CX - 200, cloakTop);
    ctx.fill();
    
    // Fabric folds (soft shadows, not hard lines)
    drawFabricFolds(CX, cloakTop, 500);
}

function drawFabricFolds(cx, top, seed) {
    ctx.save();
    
    // Multiple soft fold shadows
    const folds = [
        {x: cx - 120, w: 40},
        {x: cx - 50, w: 35},
        {x: cx + 30, w: 45},
        {x: cx + 100, w: 38}
    ];
    
    for(let i=0; i<folds.length; i++){
        const fold = folds[i];
        const foldSeed = seed + i*100;
        
        // Soft shadow gradient for each fold
        const foldGrad = ctx.createLinearGradient(fold.x - fold.w/2, top, fold.x + fold.w/2, top);
        foldGrad.addColorStop(0, 'rgba(20,10,10,0)');
        foldGrad.addColorStop(0.3, 'rgba(15,8,8,0.4)');
        foldGrad.addColorStop(0.5, 'rgba(10,5,5,0.6)');
        foldGrad.addColorStop(0.7, 'rgba(15,8,8,0.4)');
        foldGrad.addColorStop(1, 'rgba(20,10,10,0)');
        
        ctx.fillStyle = foldGrad;
        ctx.beginPath();
        ctx.moveTo(fold.x - fold.w, top + 20);
        ctx.quadraticCurveTo(fold.x, top + 50, fold.x - fold.w*0.8, H);
        ctx.lineTo(fold.x + fold.w*0.8, H);
        ctx.quadraticCurveTo(fold.x, top + 50, fold.x + fold.w, top + 20);
        ctx.fill();
        
        // Subtle highlight on fold ridge
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#5a3838';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fold.x, top + 30);
        ctx.quadraticCurveTo(fold.x + (seededRandom(foldSeed)-0.5)*20, (top + H)/2, fold.x, H);
        ctx.stroke();
    }
    
    // Fabric texture (subtle weave)
    ctx.globalAlpha = 0.03;
    for(let i=0; i<150; i++){
        const tx = cx - 200 + seededRandom(seed+i*3)*400;
        const ty = top + seededRandom(seed+i*3+1)*(H-top);
        const ts = 1 + seededRandom(seed+i*3+2)*2;
        ctx.fillStyle = seededRandom(seed+i*5)>0.5 ? '#5a3838' : '#2a1818';
        ctx.fillRect(tx, ty, ts, ts*0.5);
    }
    
    ctx.restore();
}

// === SCAR (character detail) ===
function drawScar() {
    const scarX = CX + 35, scarY = CY - 10;
    
    ctx.save();
    ctx.globalAlpha = 0.35;
    
    // Main scar line (slightly raised/lighter)
    ctx.strokeStyle = `rgb(${SKIN.highlight.r-10},${SKIN.highlight.g-20},${SKIN.highlight.b-20})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(scarX, scarY - 25);
    ctx.quadraticCurveTo(scarX + 5, scarY, scarX - 2, scarY + 30);
    ctx.stroke();
    
    // Scar shadow edge
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = `rgb(${SKIN.deep.r},${SKIN.deep.g},${SKIN.deep.b})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scarX + 2, scarY - 24);
    ctx.quadraticCurveTo(scarX + 7, scarY, scarX, scarY + 29);
    ctx.stroke();
    
    ctx.restore();
}

// === FINAL TOUCHES ===
function drawVignette() {
    ctx.save();
    const vig = ctx.createRadialGradient(CX, CY, H*0.3, CX, CY, H*0.9);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.6, 'rgba(0,0,0,0.1)');
    vig.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

// === RENDER ORDER ===
function render() {
    ctx.clearRect(0, 0, W, H);
    
    drawBackground();
    drawCloak();
    drawHair(); // Hair behind head
    drawShoulders();
    drawHeadShape();
    drawEyes();
    drawEyebrows();
    drawNose();
    drawMouth();
    drawScar();
    drawVignette();
    
    console.log('Character Portrait rendered - soft edges, scattered hair, gradient skin');
}

render();
