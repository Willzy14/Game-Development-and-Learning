// ART STUDY #3 V3: CUTE JRPG CHARACTER
// KEY LESSON: Chibi proportions, simple features, vibrant colors
// Style: Anime/JRPG (large head, small body, dot eyes, colorful outfit)

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// === CUTE STYLE CONSTANTS ===
const LINE_COLOR = '#2a1a30';
const LINE_WIDTH = 3;
const THIN_LINE = 2;

// JRPG COLORFUL PALETTE (teal, purple, pink, yellow)
const PAL = {
    // Skin
    skin: '#ffe0c8', skinShade: '#eec8a8', skinBlush: '#ffb0a0',
    // Hair (dark purple/blue)
    hair: '#3a2848', hairHi: '#5a3868', hairShadow: '#2a1838',
    // Eyes (simple and cute)
    eyeWhite: '#ffffff', eyeColor: '#4080b0', eyeShine: '#ffffff',
    // Outfit colors (patchwork style)
    teal: '#60b8b0', tealDark: '#408880', tealLight: '#80d8d0',
    purple: '#8868a8', purpleDark: '#685888', purpleLight: '#a888c8',
    pink: '#e888a0', pinkDark: '#c86880', pinkLight: '#ffa8c0',
    yellow: '#f8d870', yellowDark: '#d8b050', yellowLight: '#ffe890',
    cream: '#f8f0e0', creamDark: '#e8d8c8',
    // Accessories
    gold: '#d8a840', goldLight: '#f8c860',
    brown: '#8a6040', brownLight: '#a88060'
};

// Chibi proportions: Character centered, large head
const CX = W / 2;
const HEAD_Y = H * 0.28;
const HEAD_R = 120; // Large chibi head
const BODY_TOP = HEAD_Y + HEAD_R - 10;

// === BACKGROUND ===
function drawBackground() {
    // Soft gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#d8e8f0');
    bg.addColorStop(0.5, '#e0f0f8');
    bg.addColorStop(1, '#c8d8e8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    
    // Subtle sparkles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 30; i++) {
        const x = Math.sin(i * 2.3) * W * 0.45 + CX;
        const y = Math.cos(i * 1.7) * H * 0.45 + H * 0.5;
        const size = 2 + Math.sin(i) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === HELPER: Draw outlined shape ===
function outlinedEllipse(cx, cy, rx, ry, fill, stroke = LINE_COLOR) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = LINE_WIDTH;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// === HAIR BACK (behind head) ===
function drawHairBack() {
    ctx.fillStyle = PAL.hair;
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    // Main back hair mass
    ctx.beginPath();
    ctx.moveTo(CX - 100, HEAD_Y - 30);
    ctx.quadraticCurveTo(CX - 140, HEAD_Y + 80, CX - 110, HEAD_Y + 200);
    ctx.quadraticCurveTo(CX - 90, HEAD_Y + 230, CX - 60, HEAD_Y + 210);
    ctx.lineTo(CX + 60, HEAD_Y + 210);
    ctx.quadraticCurveTo(CX + 90, HEAD_Y + 230, CX + 110, HEAD_Y + 200);
    ctx.quadraticCurveTo(CX + 140, HEAD_Y + 80, CX + 100, HEAD_Y - 30);
    ctx.fill();
    ctx.stroke();
}

// === SCARF / CAPE (colorful patchwork) ===
function drawScarf() {
    const scarfY = BODY_TOP + 30;
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    // Left scarf tail (pink)
    ctx.fillStyle = PAL.pink;
    ctx.beginPath();
    ctx.moveTo(CX - 80, scarfY);
    ctx.quadraticCurveTo(CX - 120, scarfY + 100, CX - 100, H * 0.85);
    ctx.quadraticCurveTo(CX - 90, H * 0.87, CX - 70, H * 0.84);
    ctx.quadraticCurveTo(CX - 60, scarfY + 80, CX - 50, scarfY);
    ctx.fill();
    ctx.stroke();
    
    // Right scarf tail (teal)
    ctx.fillStyle = PAL.teal;
    ctx.beginPath();
    ctx.moveTo(CX + 80, scarfY);
    ctx.quadraticCurveTo(CX + 120, scarfY + 100, CX + 100, H * 0.85);
    ctx.quadraticCurveTo(CX + 90, H * 0.87, CX + 70, H * 0.84);
    ctx.quadraticCurveTo(CX + 60, scarfY + 80, CX + 50, scarfY);
    ctx.fill();
    ctx.stroke();
    
    // Scarf stripes on tails
    ctx.lineWidth = THIN_LINE;
    ctx.strokeStyle = PAL.tealDark;
    for (let i = 0; i < 4; i++) {
        const y = scarfY + 60 + i * 50;
        ctx.beginPath();
        ctx.moveTo(CX + 60, y);
        ctx.quadraticCurveTo(CX + 85, y + 15, CX + 95, y + 30);
        ctx.stroke();
    }
    
    ctx.strokeStyle = PAL.pinkDark;
    for (let i = 0; i < 4; i++) {
        const y = scarfY + 60 + i * 50;
        ctx.beginPath();
        ctx.moveTo(CX - 60, y);
        ctx.quadraticCurveTo(CX - 85, y + 15, CX - 95, y + 30);
        ctx.stroke();
    }
}

// === BODY / OUTFIT (T-pose arms) ===
function drawBody() {
    const bodyY = BODY_TOP + 20;
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    // === TORSO (patchwork vest) ===
    // Main torso shape
    ctx.fillStyle = PAL.purple;
    ctx.beginPath();
    ctx.moveTo(CX - 60, bodyY);
    ctx.lineTo(CX - 70, bodyY + 120);
    ctx.quadraticCurveTo(CX, bodyY + 140, CX + 70, bodyY + 120);
    ctx.lineTo(CX + 60, bodyY);
    ctx.quadraticCurveTo(CX, bodyY - 10, CX - 60, bodyY);
    ctx.fill();
    ctx.stroke();
    
    // Patchwork on torso (teal patch)
    ctx.fillStyle = PAL.teal;
    ctx.beginPath();
    ctx.moveTo(CX - 30, bodyY + 20);
    ctx.lineTo(CX - 40, bodyY + 70);
    ctx.lineTo(CX + 10, bodyY + 80);
    ctx.lineTo(CX + 20, bodyY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Yellow patch
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath();
    ctx.moveTo(CX + 20, bodyY + 50);
    ctx.lineTo(CX + 15, bodyY + 90);
    ctx.lineTo(CX + 50, bodyY + 85);
    ctx.lineTo(CX + 45, bodyY + 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // === ARMS (T-pose) ===
    const armY = bodyY + 10;
    const armLen = 130;
    const armW = 28;
    
    // Left arm (cream sleeve)
    ctx.fillStyle = PAL.cream;
    ctx.beginPath();
    ctx.moveTo(CX - 60, armY);
    ctx.lineTo(CX - 60 - armLen, armY + 5);
    ctx.lineTo(CX - 60 - armLen, armY + armW + 5);
    ctx.lineTo(CX - 60, armY + armW + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left hand
    ctx.fillStyle = PAL.skin;
    outlinedEllipse(CX - 60 - armLen - 15, armY + armW / 2 + 5, 20, 18, PAL.skin);
    
    // Right arm (cream sleeve)
    ctx.fillStyle = PAL.cream;
    ctx.beginPath();
    ctx.moveTo(CX + 60, armY);
    ctx.lineTo(CX + 60 + armLen, armY + 5);
    ctx.lineTo(CX + 60 + armLen, armY + armW + 5);
    ctx.lineTo(CX + 60, armY + armW + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right hand
    outlinedEllipse(CX + 60 + armLen + 15, armY + armW / 2 + 5, 20, 18, PAL.skin);
    
    // Sleeve cuffs (pink on left, teal on right)
    ctx.fillStyle = PAL.pink;
    ctx.fillRect(CX - 60 - armLen + 5, armY + 2, 25, armW + 4);
    ctx.strokeRect(CX - 60 - armLen + 5, armY + 2, 25, armW + 4);
    
    ctx.fillStyle = PAL.teal;
    ctx.fillRect(CX + 60 + armLen - 30, armY + 2, 25, armW + 4);
    ctx.strokeRect(CX + 60 + armLen - 30, armY + 2, 25, armW + 4);
    
    // === BELT ===
    const beltY = bodyY + 115;
    ctx.fillStyle = PAL.brown;
    ctx.fillRect(CX - 65, beltY, 130, 18);
    ctx.strokeRect(CX - 65, beltY, 130, 18);
    
    // Belt buckle (gold)
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(CX - 15, beltY - 3, 30, 24);
    ctx.strokeRect(CX - 15, beltY - 3, 30, 24);
    ctx.fillStyle = PAL.goldLight;
    ctx.fillRect(CX - 8, beltY + 2, 16, 14);
    
    // === SKIRT (patchwork) ===
    const skirtY = beltY + 15;
    
    // Main skirt (purple base)
    ctx.fillStyle = PAL.purple;
    ctx.beginPath();
    ctx.moveTo(CX - 70, skirtY);
    ctx.lineTo(CX - 100, H * 0.72);
    ctx.quadraticCurveTo(CX, H * 0.76, CX + 100, H * 0.72);
    ctx.lineTo(CX + 70, skirtY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Skirt patches
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath();
    ctx.moveTo(CX - 40, skirtY + 20);
    ctx.lineTo(CX - 60, H * 0.68);
    ctx.lineTo(CX - 20, H * 0.7);
    ctx.lineTo(CX - 10, skirtY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = PAL.pink;
    ctx.beginPath();
    ctx.moveTo(CX + 30, skirtY + 15);
    ctx.lineTo(CX + 50, H * 0.69);
    ctx.lineTo(CX + 80, H * 0.67);
    ctx.lineTo(CX + 55, skirtY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // === LEGS ===
    const legY = H * 0.70;
    const legH = H * 0.18;
    
    // Left leg (teal)
    ctx.fillStyle = PAL.teal;
    ctx.beginPath();
    ctx.moveTo(CX - 50, legY);
    ctx.lineTo(CX - 55, legY + legH);
    ctx.lineTo(CX - 15, legY + legH);
    ctx.lineTo(CX - 20, legY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right leg (pink)
    ctx.fillStyle = PAL.pink;
    ctx.beginPath();
    ctx.moveTo(CX + 50, legY);
    ctx.lineTo(CX + 55, legY + legH);
    ctx.lineTo(CX + 15, legY + legH);
    ctx.lineTo(CX + 20, legY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Boots (brown)
    const bootY = legY + legH - 10;
    ctx.fillStyle = PAL.brown;
    
    // Left boot
    ctx.beginPath();
    ctx.moveTo(CX - 60, bootY);
    ctx.lineTo(CX - 65, H * 0.95);
    ctx.quadraticCurveTo(CX - 35, H * 0.97, CX - 10, H * 0.95);
    ctx.lineTo(CX - 15, bootY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right boot
    ctx.beginPath();
    ctx.moveTo(CX + 60, bootY);
    ctx.lineTo(CX + 65, H * 0.95);
    ctx.quadraticCurveTo(CX + 35, H * 0.97, CX + 10, H * 0.95);
    ctx.lineTo(CX + 15, bootY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Boot cuffs (gold trim)
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(CX - 62, bootY, 50, 12);
    ctx.strokeRect(CX - 62, bootY, 50, 12);
    ctx.fillRect(CX + 12, bootY, 50, 12);
    ctx.strokeRect(CX + 12, bootY, 50, 12);
}

// === HEAD ===
function drawHead() {
    // Face base (round chibi head)
    ctx.fillStyle = PAL.skin;
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    ctx.beginPath();
    ctx.ellipse(CX, HEAD_Y, HEAD_R * 0.95, HEAD_R, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Blush (cute pink cheeks)
    ctx.fillStyle = PAL.skinBlush;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(CX - 70, HEAD_Y + 35, 25, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(CX + 70, HEAD_Y + 35, 25, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

// === HAIR FRONT ===
function drawHairFront() {
    ctx.fillStyle = PAL.hair;
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    // Main hair top
    ctx.beginPath();
    ctx.moveTo(CX - HEAD_R - 10, HEAD_Y - 10);
    ctx.quadraticCurveTo(CX - HEAD_R + 20, HEAD_Y - HEAD_R - 30, CX, HEAD_Y - HEAD_R - 20);
    ctx.quadraticCurveTo(CX + HEAD_R - 20, HEAD_Y - HEAD_R - 30, CX + HEAD_R + 10, HEAD_Y - 10);
    ctx.quadraticCurveTo(CX + HEAD_R - 10, HEAD_Y - 20, CX + 60, HEAD_Y - 50);
    ctx.lineTo(CX + 30, HEAD_Y - 30);
    ctx.lineTo(CX, HEAD_Y - 60);
    ctx.lineTo(CX - 30, HEAD_Y - 30);
    ctx.lineTo(CX - 60, HEAD_Y - 50);
    ctx.quadraticCurveTo(CX - HEAD_R + 10, HEAD_Y - 20, CX - HEAD_R - 10, HEAD_Y - 10);
    ctx.fill();
    ctx.stroke();
    
    // Side hair (left)
    ctx.beginPath();
    ctx.moveTo(CX - HEAD_R, HEAD_Y);
    ctx.quadraticCurveTo(CX - HEAD_R - 30, HEAD_Y + 50, CX - HEAD_R - 10, HEAD_Y + 130);
    ctx.quadraticCurveTo(CX - HEAD_R + 10, HEAD_Y + 100, CX - HEAD_R + 20, HEAD_Y + 30);
    ctx.quadraticCurveTo(CX - HEAD_R + 5, HEAD_Y + 10, CX - HEAD_R, HEAD_Y);
    ctx.fill();
    ctx.stroke();
    
    // Side hair (right)
    ctx.beginPath();
    ctx.moveTo(CX + HEAD_R, HEAD_Y);
    ctx.quadraticCurveTo(CX + HEAD_R + 30, HEAD_Y + 50, CX + HEAD_R + 10, HEAD_Y + 130);
    ctx.quadraticCurveTo(CX + HEAD_R - 10, HEAD_Y + 100, CX + HEAD_R - 20, HEAD_Y + 30);
    ctx.quadraticCurveTo(CX + HEAD_R - 5, HEAD_Y + 10, CX + HEAD_R, HEAD_Y);
    ctx.fill();
    ctx.stroke();
    
    // Hair bun (top right, like reference)
    const bunX = CX + 80;
    const bunY = HEAD_Y - HEAD_R + 10;
    
    ctx.beginPath();
    ctx.arc(bunX, bunY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Bun accessory (yellow)
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath();
    ctx.arc(bunX, bunY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Hair highlights
    ctx.strokeStyle = PAL.hairHi;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX - 40, HEAD_Y - HEAD_R + 20);
    ctx.quadraticCurveTo(CX - 20, HEAD_Y - HEAD_R + 10, CX, HEAD_Y - HEAD_R + 15);
    ctx.stroke();
}

// === EYES (Simple cute dot eyes) ===
function drawEyes() {
    const eyeY = HEAD_Y + 10;
    const eyeSpacing = 45;
    
    // Simple large dot eyes (JRPG style)
    ctx.fillStyle = '#1a1020';
    
    // Left eye
    ctx.beginPath();
    ctx.ellipse(CX - eyeSpacing, eyeY, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(CX + eyeSpacing, eyeY, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine (top-left of each eye)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(CX - eyeSpacing - 6, eyeY - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CX + eyeSpacing - 6, eyeY - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Small secondary shine
    ctx.beginPath();
    ctx.arc(CX - eyeSpacing + 5, eyeY + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CX + eyeSpacing + 5, eyeY + 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

// === MOUTH (Simple cute smile) ===
function drawMouth() {
    const mouthY = HEAD_Y + 55;
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Small curved smile
    ctx.beginPath();
    ctx.arc(CX, mouthY - 10, 15, 0.2, Math.PI - 0.2);
    ctx.stroke();
}

// === NECK SCARF WRAP ===
function drawScarfWrap() {
    const wrapY = BODY_TOP;
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    // Scarf wrapped around neck (multi-colored)
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath();
    ctx.moveTo(CX - 70, wrapY);
    ctx.quadraticCurveTo(CX, wrapY + 40, CX + 70, wrapY);
    ctx.quadraticCurveTo(CX + 80, wrapY + 20, CX + 70, wrapY + 35);
    ctx.quadraticCurveTo(CX, wrapY + 60, CX - 70, wrapY + 35);
    ctx.quadraticCurveTo(CX - 80, wrapY + 20, CX - 70, wrapY);
    ctx.fill();
    ctx.stroke();
    
    // Teal stripe on scarf
    ctx.fillStyle = PAL.teal;
    ctx.beginPath();
    ctx.moveTo(CX - 40, wrapY + 10);
    ctx.quadraticCurveTo(CX, wrapY + 30, CX + 40, wrapY + 10);
    ctx.quadraticCurveTo(CX + 45, wrapY + 20, CX + 40, wrapY + 25);
    ctx.quadraticCurveTo(CX, wrapY + 45, CX - 40, wrapY + 25);
    ctx.quadraticCurveTo(CX - 45, wrapY + 20, CX - 40, wrapY + 10);
    ctx.fill();
    ctx.stroke();
}

// === MAIN RENDER ===
function render() {
    ctx.clearRect(0, 0, W, H);
    
    // Layer order matters!
    drawBackground();
    drawHairBack();
    drawScarf();         // Scarf tails behind body
    drawBody();          // Body, arms, legs
    drawScarfWrap();     // Scarf wrap around neck
    drawHead();          // Face
    drawHairFront();     // Hair on top
    drawEyes();          // Cute dot eyes
    drawMouth();         // Simple smile
    
    // Signature
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '14px sans-serif';
    ctx.fillText('Art Study #3 V3 - Cute JRPG Character', 20, H - 20);
}

render();
