// ============================================
// ART STUDY #1: EGYPTIAN SUNSET SCENE
// ============================================
// Goal: Maximum detail, no performance constraints
// Subject: Sphinx + Pyramids at golden hour
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

// Attempt to draw with pseudo-random but deterministic values
function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

// ============================================
// 1. SKY - DETAILED SUNSET GRADIENT
// ============================================

function drawSky() {
    // Multi-stop gradient for rich sunset
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyGrad.addColorStop(0, '#0d0221');      // Deep night purple at top
    skyGrad.addColorStop(0.15, '#1a0533');   // Dark purple
    skyGrad.addColorStop(0.3, '#3d1a4d');    // Purple
    skyGrad.addColorStop(0.45, '#6b2d5b');   // Magenta purple
    skyGrad.addColorStop(0.55, '#a13d63');   // Rose
    skyGrad.addColorStop(0.65, '#d4605a');   // Coral
    skyGrad.addColorStop(0.75, '#e8915c');   // Orange
    skyGrad.addColorStop(0.85, '#f4bc68');   // Golden
    skyGrad.addColorStop(0.95, '#fce38a');   // Light gold
    skyGrad.addColorStop(1, '#fff5d4');      // Pale horizon
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.7);
    
    // Add subtle color banding for atmosphere
    for (let i = 0; i < 20; i++) {
        const y = i * (H * 0.7 / 20);
        const alpha = 0.02 + Math.sin(i * 0.5) * 0.01;
        ctx.fillStyle = `rgba(255, 200, 150, ${alpha})`;
        ctx.fillRect(0, y, W, H * 0.035);
    }
}

// ============================================
// 2. STARS - VISIBLE IN UPPER SKY
// ============================================

function drawStars() {
    // Stars visible in the darker upper portion
    for (let i = 0; i < 150; i++) {
        const x = seededRandom(i * 1.1) * W;
        const y = seededRandom(i * 2.2) * H * 0.35;
        const size = seededRandom(i * 3.3) * 1.5 + 0.5;
        const brightness = seededRandom(i * 4.4) * 0.5 + 0.3;
        
        // Only draw if in dark enough area
        if (y < H * 0.3) {
            // Star glow
            const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            glowGrad.addColorStop(0.5, `rgba(255, 255, 255, ${brightness * 0.3})`);
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Star core
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness + 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ============================================
// 3. SUN - LARGE DETAILED SUN
// ============================================

function drawSun() {
    const sunX = W * 0.75;
    const sunY = H * 0.38;
    const sunRadius = 60;
    
    // Outer atmospheric glow (very large)
    for (let i = 5; i >= 0; i--) {
        const glowRadius = sunRadius * (3 + i * 0.8);
        const alpha = 0.08 - i * 0.01;
        
        const glowGrad = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, glowRadius);
        glowGrad.addColorStop(0, `rgba(255, 200, 100, ${alpha})`);
        glowGrad.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.5})`);
        glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Sun rays (long, subtle)
    ctx.save();
    ctx.translate(sunX, sunY);
    
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const rayLength = sunRadius * (2.5 + seededRandom(i * 7) * 1);
        const rayWidth = 15 + seededRandom(i * 8) * 10;
        
        ctx.save();
        ctx.rotate(angle);
        
        const rayGrad = ctx.createLinearGradient(sunRadius * 0.9, 0, rayLength, 0);
        rayGrad.addColorStop(0, 'rgba(255, 230, 150, 0.4)');
        rayGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.15)');
        rayGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
        
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(sunRadius * 0.9, -rayWidth / 2);
        ctx.lineTo(rayLength, 0);
        ctx.lineTo(sunRadius * 0.9, rayWidth / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    ctx.restore();
    
    // Sun disc with limb darkening
    const sunGrad = ctx.createRadialGradient(
        sunX - sunRadius * 0.2, sunY - sunRadius * 0.2, 0,
        sunX, sunY, sunRadius
    );
    sunGrad.addColorStop(0, '#fffff8');
    sunGrad.addColorStop(0.3, '#fffde8');
    sunGrad.addColorStop(0.6, '#ffe4a0');
    sunGrad.addColorStop(0.85, '#ffc040');
    sunGrad.addColorStop(0.95, '#ff9020');
    sunGrad.addColorStop(1, '#ff6000');
    
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun surface texture (subtle granulation)
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
        const angle = seededRandom(i * 11) * Math.PI * 2;
        const dist = seededRandom(i * 12) * sunRadius * 0.85;
        const spotX = sunX + Math.cos(angle) * dist;
        const spotY = sunY + Math.sin(angle) * dist;
        const spotSize = seededRandom(i * 13) * 8 + 3;
        
        ctx.fillStyle = seededRandom(i * 14) > 0.5 ? '#ffe8c0' : '#ffd080';
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// ============================================
// 4. CLOUDS - WISPY SUNSET CLOUDS
// ============================================

function drawClouds() {
    // Cloud layer 1 - high wisps
    drawCloudLayer(H * 0.15, 0.15, '#ffb0a0', '#ff8070');
    
    // Cloud layer 2 - mid clouds
    drawCloudLayer(H * 0.28, 0.25, '#ffc090', '#ff9060');
    
    // Cloud layer 3 - lower clouds  
    drawCloudLayer(H * 0.4, 0.3, '#ffd4a0', '#ffb070');
}

function drawCloudLayer(baseY, alpha, lightColor, darkColor) {
    for (let i = 0; i < 8; i++) {
        const seed = i * 123.456;
        const x = seededRandom(seed) * W * 1.2 - W * 0.1;
        const y = baseY + seededRandom(seed + 1) * 40 - 20;
        const width = 100 + seededRandom(seed + 2) * 150;
        const height = 15 + seededRandom(seed + 3) * 25;
        
        drawSingleCloud(x, y, width, height, alpha, lightColor, darkColor, seed);
    }
}

function drawSingleCloud(x, y, width, height, alpha, lightColor, darkColor, seed) {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Multiple overlapping ellipses for soft cloud shape
    const puffs = 8 + Math.floor(seededRandom(seed + 10) * 6);
    
    for (let i = 0; i < puffs; i++) {
        const px = x + (i / puffs) * width + seededRandom(seed + i * 0.1) * 30 - 15;
        const py = y + seededRandom(seed + i * 0.2) * height - height / 2;
        const pw = 30 + seededRandom(seed + i * 0.3) * 40;
        const ph = 10 + seededRandom(seed + i * 0.4) * 15;
        
        // Cloud gradient (lit from below by sunset)
        const cloudGrad = ctx.createLinearGradient(px, py - ph, px, py + ph);
        cloudGrad.addColorStop(0, darkColor);
        cloudGrad.addColorStop(0.6, lightColor);
        cloudGrad.addColorStop(1, '#fff0e0');
        
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// ============================================
// 5. DISTANT PYRAMIDS (Background)
// ============================================

function drawDistantPyramids() {
    // Very distant pyramids - silhouettes with atmospheric haze
    
    // Pyramid cluster 1 (far left)
    drawDetailedPyramid(80, H * 0.52, 60, 0.3, true);
    drawDetailedPyramid(150, H * 0.52, 45, 0.25, true);
    
    // Pyramid cluster 2 (far right)
    drawDetailedPyramid(W - 100, H * 0.52, 55, 0.28, true);
}

// ============================================
// 6. MAIN PYRAMIDS (Detailed)
// ============================================

function drawMainPyramids() {
    // The Great Pyramid (Khufu) - largest, most detailed
    drawDetailedPyramid(W * 0.55, H * 0.58, 180, 0.9, false);
    
    // Pyramid of Khafre - slightly smaller, to the right
    drawDetailedPyramid(W * 0.78, H * 0.55, 140, 0.85, false);
    
    // Pyramid of Menkaure - smallest, far right
    drawDetailedPyramid(W * 0.92, H * 0.53, 80, 0.7, false);
}

function drawDetailedPyramid(x, baseY, size, detail, isDistant) {
    const height = size * 0.65;
    const halfBase = size / 2;
    
    // Atmospheric color shift for distant pyramids
    const haze = isDistant ? 0.6 : 0;
    
    // Shadow side (left face)
    const shadowColor = isDistant 
        ? `rgb(${lerp(120, 180, haze)}, ${lerp(90, 140, haze)}, ${lerp(70, 120, haze)})`
        : '#6b5040';
    
    const shadowGrad = ctx.createLinearGradient(x - halfBase, baseY, x, baseY - height);
    shadowGrad.addColorStop(0, isDistant ? '#9a8878' : '#8b7355');
    shadowGrad.addColorStop(0.5, shadowColor);
    shadowGrad.addColorStop(1, isDistant ? '#a89888' : '#5c4030');
    
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x - halfBase, baseY);
    ctx.lineTo(x, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Lit side (right face)
    const litColor = isDistant
        ? `rgb(${lerp(200, 200, haze)}, ${lerp(170, 170, haze)}, ${lerp(130, 150, haze)})`
        : '#d4a870';
    
    const litGrad = ctx.createLinearGradient(x, baseY - height, x + halfBase, baseY);
    litGrad.addColorStop(0, isDistant ? '#c8b8a0' : '#e8c898');
    litGrad.addColorStop(0.3, litColor);
    litGrad.addColorStop(1, isDistant ? '#b0a090' : '#c09060');
    
    ctx.fillStyle = litGrad;
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x + halfBase, baseY);
    ctx.lineTo(x, baseY);
    ctx.closePath();
    ctx.fill();
    
    // Skip brick detail for very distant pyramids
    if (isDistant) {
        // Just add subtle edge
        ctx.strokeStyle = 'rgba(255, 240, 200, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, baseY - height);
        ctx.lineTo(x + halfBase, baseY);
        ctx.stroke();
        return;
    }
    
    // BRICK TEXTURE - The key detail!
    drawPyramidBrickTexture(x, baseY, halfBase, height, detail);
    
    // Capstone (pyramidion) - if large enough
    if (size > 100) {
        drawPyramidCapstone(x, baseY - height, size * 0.08);
    }
    
    // Edge highlights
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x + halfBase, baseY);
    ctx.stroke();
    
    // Central edge (front corner)
    ctx.strokeStyle = 'rgba(255, 230, 180, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x, baseY);
    ctx.stroke();
}

function drawPyramidBrickTexture(x, baseY, halfBase, height, detail) {
    const rows = Math.floor(20 * detail);
    
    ctx.save();
    
    // Clip to lit side
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x + halfBase, baseY);
    ctx.lineTo(x, baseY);
    ctx.closePath();
    ctx.clip();
    
    // Draw brick rows
    for (let row = 0; row < rows; row++) {
        const rowT = row / rows;
        const rowY = baseY - height * rowT;
        const rowWidth = halfBase * (1 - rowT);
        const brickHeight = height / rows;
        
        // Horizontal mortar line
        ctx.strokeStyle = `rgba(80, 60, 40, ${0.3 * detail})`;
        ctx.lineWidth = detail > 0.7 ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x, rowY);
        ctx.lineTo(x + rowWidth, rowY);
        ctx.stroke();
        
        // Vertical brick divisions
        const bricksInRow = Math.max(3, Math.floor(rowWidth / 12));
        const brickWidth = rowWidth / bricksInRow;
        const offset = (row % 2) * (brickWidth / 2);
        
        for (let b = 0; b <= bricksInRow; b++) {
            const brickX = x + b * brickWidth + offset;
            if (brickX > x && brickX < x + rowWidth) {
                ctx.beginPath();
                ctx.moveTo(brickX, rowY);
                ctx.lineTo(brickX, rowY - brickHeight);
                ctx.stroke();
            }
        }
        
        // Individual brick weathering (only for high detail)
        if (detail > 0.7 && row % 2 === 0) {
            for (let b = 0; b < bricksInRow; b++) {
                if (seededRandom(row * 100 + b) > 0.7) {
                    const brickX = x + b * brickWidth + offset;
                    const brickY = rowY - brickHeight / 2;
                    
                    // Weathered/darker brick
                    ctx.fillStyle = `rgba(60, 40, 20, ${seededRandom(row * 100 + b + 1) * 0.15})`;
                    ctx.fillRect(brickX, rowY - brickHeight, brickWidth * 0.9, brickHeight * 0.9);
                }
            }
        }
    }
    
    ctx.restore();
    
    // Now do shadow side (less detail)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x - halfBase, baseY);
    ctx.lineTo(x, baseY);
    ctx.closePath();
    ctx.clip();
    
    // Fewer rows on shadow side
    const shadowRows = Math.floor(12 * detail);
    for (let row = 0; row < shadowRows; row++) {
        const rowT = row / shadowRows;
        const rowY = baseY - height * rowT;
        const rowWidth = halfBase * (1 - rowT);
        
        ctx.strokeStyle = `rgba(40, 30, 20, ${0.25 * detail})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, rowY);
        ctx.lineTo(x - rowWidth, rowY);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawPyramidCapstone(x, y, size) {
    // Gold capstone (pyramidion)
    const capGrad = ctx.createLinearGradient(x - size, y, x + size, y + size * 1.5);
    capGrad.addColorStop(0, '#ffd700');
    capGrad.addColorStop(0.5, '#ffec80');
    capGrad.addColorStop(1, '#daa520');
    
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size, y + size * 1.5);
    ctx.lineTo(x + size, y + size * 1.5);
    ctx.closePath();
    ctx.fill();
    
    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * 0.3, y + size * 0.8);
    ctx.lineTo(x, y + size * 0.6);
    ctx.closePath();
    ctx.fill();
}

// ============================================
// 7. THE GREAT SPHINX - Maximum Detail
// ============================================

function drawSphinx() {
    const baseX = W * 0.22;
    const baseY = H * 0.62;
    const scale = 1.8;
    
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.scale(scale, scale);
    
    // Ground shadow beneath sphinx
    drawSphinxShadow();
    
    // Back portion / haunches
    drawSphinxHaunches();
    
    // Main body
    drawSphinxBody();
    
    // Front legs / paws
    drawSphinxPaws();
    
    // Chest
    drawSphinxChest();
    
    // Neck
    drawSphinxNeck();
    
    // Head with all details
    drawSphinxHead();
    
    // Nemes headdress
    drawSphinxNemes();
    
    // Face details
    drawSphinxFace();
    
    // Beard
    drawSphinxBeard();
    
    // Uraeus (cobra)
    drawSphinxUraeus();
    
    // Surface weathering/erosion
    drawSphinxWeathering();
    
    ctx.restore();
}

function drawSphinxShadow() {
    // Long shadow cast by sphinx
    ctx.fillStyle = 'rgba(40, 25, 15, 0.35)';
    ctx.beginPath();
    ctx.ellipse(30, 25, 90, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Darker core shadow
    ctx.fillStyle = 'rgba(30, 18, 10, 0.25)';
    ctx.beginPath();
    ctx.ellipse(20, 20, 60, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();
}

function drawSphinxHaunches() {
    // Back legs / haunches (crouching position)
    const haunchGrad = ctx.createLinearGradient(-70, -35, -50, 10);
    haunchGrad.addColorStop(0, '#a08060');
    haunchGrad.addColorStop(0.5, '#8b7050');
    haunchGrad.addColorStop(1, '#706040');
    
    ctx.fillStyle = haunchGrad;
    ctx.beginPath();
    ctx.moveTo(-75, 10);
    ctx.bezierCurveTo(-85, -15, -80, -40, -65, -45);
    ctx.bezierCurveTo(-50, -48, -35, -40, -35, -30);
    ctx.lineTo(-35, 10);
    ctx.closePath();
    ctx.fill();
    
    // Haunch muscle definition
    ctx.strokeStyle = 'rgba(60, 45, 30, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-70, -10);
    ctx.quadraticCurveTo(-60, -25, -55, -35);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-65, 0);
    ctx.quadraticCurveTo(-55, -15, -45, -25);
    ctx.stroke();
}

function drawSphinxBody() {
    // Main body - long rectangular form
    const bodyGrad = ctx.createLinearGradient(-40, -50, 60, 10);
    bodyGrad.addColorStop(0, '#c9a87c');
    bodyGrad.addColorStop(0.2, '#d4b890');
    bodyGrad.addColorStop(0.5, '#c0a070');
    bodyGrad.addColorStop(0.8, '#a89060');
    bodyGrad.addColorStop(1, '#907850');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-35, 10);
    ctx.lineTo(-35, -35);
    ctx.bezierCurveTo(-20, -45, 20, -42, 55, -35);
    ctx.lineTo(65, 10);
    ctx.closePath();
    ctx.fill();
    
    // Body contour lines (ribs/muscle suggestion)
    ctx.strokeStyle = 'rgba(80, 60, 40, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const lineX = -25 + i * 15;
        ctx.beginPath();
        ctx.moveTo(lineX, -35 + i * 0.5);
        ctx.quadraticCurveTo(lineX + 5, -20, lineX + 3, 5);
        ctx.stroke();
    }
}

function drawSphinxPaws() {
    // Front paws - extended forward
    
    // Right paw (further, darker)
    const rightPawGrad = ctx.createLinearGradient(55, -10, 100, 15);
    rightPawGrad.addColorStop(0, '#a08060');
    rightPawGrad.addColorStop(1, '#8b7050');
    
    ctx.fillStyle = rightPawGrad;
    ctx.beginPath();
    ctx.moveTo(55, 15);
    ctx.lineTo(95, 12);
    ctx.bezierCurveTo(105, 10, 108, 15, 105, 20);
    ctx.lineTo(55, 22);
    ctx.closePath();
    ctx.fill();
    
    // Left paw (closer, lighter)
    const leftPawGrad = ctx.createLinearGradient(55, -15, 105, 8);
    leftPawGrad.addColorStop(0, '#c9a87c');
    leftPawGrad.addColorStop(0.5, '#d4b890');
    leftPawGrad.addColorStop(1, '#b89870');
    
    ctx.fillStyle = leftPawGrad;
    ctx.beginPath();
    ctx.moveTo(55, 5);
    ctx.lineTo(98, 0);
    ctx.bezierCurveTo(110, -2, 115, 5, 110, 12);
    ctx.lineTo(55, 15);
    ctx.closePath();
    ctx.fill();
    
    // Paw details - claws/toes
    ctx.strokeStyle = 'rgba(70, 50, 35, 0.4)';
    ctx.lineWidth = 1.5;
    
    // Toe separations on left paw
    for (let i = 0; i < 4; i++) {
        const toeX = 90 + i * 5;
        ctx.beginPath();
        ctx.moveTo(toeX, 2);
        ctx.lineTo(toeX + 8, 8);
        ctx.stroke();
    }
    
    // Paw pad suggestion
    ctx.fillStyle = 'rgba(90, 70, 50, 0.15)';
    ctx.beginPath();
    ctx.ellipse(85, 6, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawSphinxChest() {
    // Chest area between paws and head
    const chestGrad = ctx.createLinearGradient(40, -45, 65, 0);
    chestGrad.addColorStop(0, '#d4b890');
    chestGrad.addColorStop(0.5, '#c9a87c');
    chestGrad.addColorStop(1, '#b08860');
    
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.moveTo(45, -35);
    ctx.bezierCurveTo(55, -40, 65, -35, 68, -20);
    ctx.lineTo(65, 5);
    ctx.lineTo(50, 5);
    ctx.lineTo(45, -35);
    ctx.closePath();
    ctx.fill();
    
    // Chest texture - carved lines
    ctx.strokeStyle = 'rgba(100, 75, 50, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(48 + i * 4, -30 + i * 2);
        ctx.quadraticCurveTo(55 + i * 3, -15, 52 + i * 4, 0);
        ctx.stroke();
    }
}

function drawSphinxNeck() {
    // Neck connecting body to head
    const neckGrad = ctx.createLinearGradient(30, -70, 55, -35);
    neckGrad.addColorStop(0, '#d4b890');
    neckGrad.addColorStop(0.5, '#c9a87c');
    neckGrad.addColorStop(1, '#b89868');
    
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(35, -35);
    ctx.bezierCurveTo(30, -50, 28, -65, 30, -75);
    ctx.lineTo(55, -75);
    ctx.bezierCurveTo(58, -60, 55, -45, 50, -35);
    ctx.closePath();
    ctx.fill();
    
    // Neck creases
    ctx.strokeStyle = 'rgba(90, 70, 50, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(33, -50);
    ctx.quadraticCurveTo(42, -52, 52, -48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(32, -60);
    ctx.quadraticCurveTo(42, -63, 53, -58);
    ctx.stroke();
}

function drawSphinxHead() {
    // Main head shape
    const headGrad = ctx.createRadialGradient(40, -95, 5, 42, -90, 40);
    headGrad.addColorStop(0, '#e0c8a0');
    headGrad.addColorStop(0.4, '#d4b890');
    headGrad.addColorStop(0.7, '#c9a87c');
    headGrad.addColorStop(1, '#a89060');
    
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(20, -75);
    ctx.bezierCurveTo(15, -90, 18, -110, 30, -118);
    ctx.bezierCurveTo(40, -123, 55, -120, 62, -110);
    ctx.bezierCurveTo(70, -95, 68, -80, 60, -75);
    ctx.closePath();
    ctx.fill();
    
    // Cheekbone structure
    ctx.fillStyle = 'rgba(180, 150, 110, 0.3)';
    ctx.beginPath();
    ctx.ellipse(28, -92, 8, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(56, -92, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
}

function drawSphinxNemes() {
    // Nemes headdress (striped cloth)
    
    // Left lappet (side panel)
    const leftNemesGrad = ctx.createLinearGradient(5, -105, 20, -50);
    leftNemesGrad.addColorStop(0, '#e6c84a');
    leftNemesGrad.addColorStop(0.3, '#d4b030');
    leftNemesGrad.addColorStop(0.7, '#c9a227');
    leftNemesGrad.addColorStop(1, '#a08020');
    
    ctx.fillStyle = leftNemesGrad;
    ctx.beginPath();
    ctx.moveTo(20, -115);
    ctx.bezierCurveTo(10, -110, 5, -95, 3, -75);
    ctx.lineTo(0, -50);
    ctx.lineTo(18, -50);
    ctx.lineTo(22, -75);
    ctx.closePath();
    ctx.fill();
    
    // Right lappet
    const rightNemesGrad = ctx.createLinearGradient(60, -105, 80, -50);
    rightNemesGrad.addColorStop(0, '#e6c84a');
    rightNemesGrad.addColorStop(0.3, '#d4b030');
    rightNemesGrad.addColorStop(0.7, '#c9a227');
    rightNemesGrad.addColorStop(1, '#a08020');
    
    ctx.fillStyle = rightNemesGrad;
    ctx.beginPath();
    ctx.moveTo(62, -115);
    ctx.bezierCurveTo(72, -110, 78, -95, 80, -75);
    ctx.lineTo(82, -50);
    ctx.lineTo(64, -50);
    ctx.lineTo(60, -75);
    ctx.closePath();
    ctx.fill();
    
    // Top of nemes (over forehead)
    ctx.fillStyle = '#d4b030';
    ctx.beginPath();
    ctx.moveTo(18, -115);
    ctx.bezierCurveTo(30, -125, 52, -125, 64, -115);
    ctx.bezierCurveTo(55, -112, 28, -112, 18, -115);
    ctx.closePath();
    ctx.fill();
    
    // Nemes stripes (blue)
    ctx.strokeStyle = '#1a3a6a';
    ctx.lineWidth = 3;
    
    // Left side stripes
    for (let i = 0; i < 6; i++) {
        const stripeY = -108 + i * 10;
        ctx.beginPath();
        ctx.moveTo(5 + i * 0.5, stripeY);
        ctx.lineTo(18 - i * 0.3, stripeY + 5);
        ctx.stroke();
    }
    
    // Right side stripes
    for (let i = 0; i < 6; i++) {
        const stripeY = -108 + i * 10;
        ctx.beginPath();
        ctx.moveTo(77 - i * 0.5, stripeY);
        ctx.lineTo(64 + i * 0.3, stripeY + 5);
        ctx.stroke();
    }
    
    // Gold band at forehead
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(18, -115, 46, 4);
    
    // Band detail
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, -113);
    ctx.lineTo(64, -113);
    ctx.stroke();
}

function drawSphinxFace() {
    // Eyes
    drawSphinxEye(32, -95, false);  // Left eye
    drawSphinxEye(52, -95, true);   // Right eye
    
    // Nose (famously damaged)
    const noseGrad = ctx.createLinearGradient(38, -92, 48, -78);
    noseGrad.addColorStop(0, '#c9a87c');
    noseGrad.addColorStop(1, '#a08060');
    
    ctx.fillStyle = noseGrad;
    ctx.beginPath();
    ctx.moveTo(38, -92);
    ctx.lineTo(40, -78);
    ctx.lineTo(46, -78);
    ctx.lineTo(48, -92);
    ctx.bezierCurveTo(45, -90, 40, -90, 38, -92);
    ctx.closePath();
    ctx.fill();
    
    // Nose damage/erosion
    ctx.fillStyle = 'rgba(80, 60, 45, 0.4)';
    ctx.beginPath();
    ctx.moveTo(40, -88);
    ctx.bezierCurveTo(42, -85, 45, -86, 46, -88);
    ctx.lineTo(45, -80);
    ctx.lineTo(41, -80);
    ctx.closePath();
    ctx.fill();
    
    // Nostrils
    ctx.fillStyle = 'rgba(50, 35, 25, 0.5)';
    ctx.beginPath();
    ctx.ellipse(42, -79, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(46, -79, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#8b7050';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(32, -73);
    ctx.bezierCurveTo(38, -70, 48, -70, 54, -73);
    ctx.stroke();
    
    // Lips
    const lipGrad = ctx.createLinearGradient(32, -74, 54, -68);
    lipGrad.addColorStop(0, '#c9a87c');
    lipGrad.addColorStop(0.5, '#b89868');
    lipGrad.addColorStop(1, '#a88858');
    
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.moveTo(32, -73);
    ctx.bezierCurveTo(38, -70, 48, -70, 54, -73);
    ctx.bezierCurveTo(48, -67, 38, -67, 32, -73);
    ctx.closePath();
    ctx.fill();
    
    // Lip line
    ctx.strokeStyle = 'rgba(90, 65, 45, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, -71);
    ctx.bezierCurveTo(40, -69, 46, -69, 51, -71);
    ctx.stroke();
}

function drawSphinxEye(x, y, isRight) {
    // Eye socket shadow
    ctx.fillStyle = 'rgba(70, 50, 35, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 6, isRight ? 0.15 : -0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye white area
    ctx.fillStyle = '#d4c8b8';
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 4, isRight ? 0.1 : -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Iris
    ctx.fillStyle = '#4a3828';
    ctx.beginPath();
    ctx.ellipse(x + (isRight ? 1 : -1), y, 4, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil
    ctx.fillStyle = '#1a0a05';
    ctx.beginPath();
    ctx.ellipse(x + (isRight ? 1 : -1), y, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + (isRight ? 2 : -2), y - 1, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Kohl eyeliner
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.bezierCurveTo(x - 5, y - 4, x + 5, y - 4, x + 10, y);
    ctx.stroke();
    
    // Lower lid line
    ctx.strokeStyle = 'rgba(80, 60, 40, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 1);
    ctx.bezierCurveTo(x - 3, y + 4, x + 3, y + 4, x + 8, y + 1);
    ctx.stroke();
    
    // Extended eye makeup (Egyptian style)
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + (isRight ? 9 : -9), y);
    ctx.lineTo(x + (isRight ? 15 : -15), y + 2);
    ctx.stroke();
}

function drawSphinxBeard() {
    // Ceremonial beard (partially broken in reality)
    const beardGrad = ctx.createLinearGradient(38, -70, 48, -45);
    beardGrad.addColorStop(0, '#c9a227');
    beardGrad.addColorStop(0.5, '#b8920a');
    beardGrad.addColorStop(1, '#9a7a08');
    
    ctx.fillStyle = beardGrad;
    ctx.beginPath();
    ctx.moveTo(38, -68);
    ctx.lineTo(35, -45);
    ctx.bezierCurveTo(38, -42, 48, -42, 51, -45);
    ctx.lineTo(48, -68);
    ctx.closePath();
    ctx.fill();
    
    // Beard braiding pattern
    ctx.strokeStyle = '#1a3a6a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(37 + i * 3, -65 + i * 4);
        ctx.lineTo(37 + i * 3, -48);
        ctx.stroke();
    }
    
    // Beard broken/weathered edge
    ctx.fillStyle = 'rgba(100, 80, 60, 0.3)';
    ctx.beginPath();
    ctx.moveTo(35, -52);
    ctx.bezierCurveTo(36, -48, 37, -46, 35, -45);
    ctx.lineTo(35, -52);
    ctx.fill();
}

function drawSphinxUraeus() {
    // Uraeus - rearing cobra on forehead
    const uraX = 41;
    const uraY = -118;
    
    // Cobra body
    const cobraGrad = ctx.createLinearGradient(uraX, uraY, uraX, uraY - 15);
    cobraGrad.addColorStop(0, '#c9a227');
    cobraGrad.addColorStop(0.5, '#e6c84a');
    cobraGrad.addColorStop(1, '#ffd700');
    
    ctx.fillStyle = cobraGrad;
    ctx.beginPath();
    ctx.moveTo(uraX - 4, uraY);
    ctx.bezierCurveTo(uraX - 5, uraY - 8, uraX - 3, uraY - 12, uraX, uraY - 15);
    ctx.bezierCurveTo(uraX + 3, uraY - 12, uraX + 5, uraY - 8, uraX + 4, uraY);
    ctx.closePath();
    ctx.fill();
    
    // Cobra hood
    ctx.beginPath();
    ctx.moveTo(uraX - 6, uraY - 10);
    ctx.bezierCurveTo(uraX - 8, uraY - 14, uraX, uraY - 18, uraX, uraY - 15);
    ctx.bezierCurveTo(uraX, uraY - 18, uraX + 8, uraY - 14, uraX + 6, uraY - 10);
    ctx.closePath();
    ctx.fill();
    
    // Cobra face
    ctx.fillStyle = '#daa520';
    ctx.beginPath();
    ctx.ellipse(uraX, uraY - 13, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cobra eyes
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(uraX - 1.5, uraY - 14, 1, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(uraX + 1.5, uraY - 14, 1, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye gleam
    ctx.fillStyle = 'rgba(255, 200, 200, 0.5)';
    ctx.beginPath();
    ctx.arc(uraX - 1.5, uraY - 14.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawSphinxWeathering() {
    // Add weathering, erosion, and age effects
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    // Erosion patches
    for (let i = 0; i < 30; i++) {
        const px = seededRandom(i * 31) * 100 - 30;
        const py = seededRandom(i * 32) * 80 - 90;
        const pSize = seededRandom(i * 33) * 8 + 2;
        
        ctx.fillStyle = seededRandom(i * 34) > 0.5 ? '#a08868' : '#806848';
        ctx.beginPath();
        ctx.ellipse(px, py, pSize, pSize * 0.6, seededRandom(i * 35) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Cracks
    ctx.strokeStyle = 'rgba(60, 45, 30, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const startX = seededRandom(i * 41) * 80 - 20;
        const startY = seededRandom(i * 42) * 60 - 80;
        const length = seededRandom(i * 43) * 20 + 10;
        const angle = seededRandom(i * 44) * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    ctx.restore();
}

// ============================================
// 8. DESERT GROUND & SAND
// ============================================

function drawDesertGround() {
    // Base sand color
    const groundY = H * 0.55;
    
    const sandGrad = ctx.createLinearGradient(0, groundY, 0, H);
    sandGrad.addColorStop(0, '#e8c878');
    sandGrad.addColorStop(0.2, '#d4a860');
    sandGrad.addColorStop(0.5, '#c09048');
    sandGrad.addColorStop(0.8, '#a07838');
    sandGrad.addColorStop(1, '#806028');
    
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, groundY, W, H - groundY);
    
    // Dune shapes
    drawDunes();
    
    // Sand texture
    drawSandTexture(groundY);
    
    // Ground details
    drawGroundDetails(groundY);
}

function drawDunes() {
    // Background dunes (lighter, more distant)
    ctx.fillStyle = '#d4b878';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.58);
    
    for (let x = 0; x <= W; x += 5) {
        const y = H * 0.58 + 
            Math.sin(x * 0.008) * 15 +
            Math.sin(x * 0.015 + 2) * 8 +
            Math.sin(x * 0.003) * 20;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // Mid dunes
    ctx.fillStyle = '#c9a060';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.65);
    
    for (let x = 0; x <= W; x += 5) {
        const y = H * 0.65 + 
            Math.sin(x * 0.01 + 1) * 12 +
            Math.sin(x * 0.02 + 3) * 6;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // Foreground dune ridge
    ctx.fillStyle = '#b08848';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    
    for (let x = 0; x <= W; x += 3) {
        const y = H * 0.78 + 
            Math.sin(x * 0.012) * 8 +
            Math.sin(x * 0.025 + 1.5) * 4;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
}

function drawSandTexture(groundY) {
    // Wind ripple patterns
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#a08040';
    ctx.lineWidth = 1;
    
    for (let layer = 0; layer < 15; layer++) {
        const layerY = groundY + 30 + layer * 25;
        
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
            const ripple = Math.sin(x * 0.08 + layer * 0.5) * 2;
            if (x === 0) {
                ctx.moveTo(x, layerY + ripple);
            } else {
                ctx.lineTo(x, layerY + ripple);
            }
        }
        ctx.stroke();
    }
    ctx.restore();
    
    // Sand grain texture (subtle noise)
    ctx.save();
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 500; i++) {
        const x = seededRandom(i * 51) * W;
        const y = groundY + seededRandom(i * 52) * (H - groundY);
        const size = seededRandom(i * 53) * 2 + 0.5;
        
        ctx.fillStyle = seededRandom(i * 54) > 0.5 ? '#f0d080' : '#a08040';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawGroundDetails(groundY) {
    // Rocks scattered on ground
    for (let i = 0; i < 25; i++) {
        const seed = i * 61;
        const x = seededRandom(seed) * W;
        const y = groundY + 20 + seededRandom(seed + 1) * (H - groundY - 40);
        const size = seededRandom(seed + 2) * 8 + 3;
        
        // Rock gradient
        const rockGrad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        rockGrad.addColorStop(0, '#b0a090');
        rockGrad.addColorStop(0.6, '#807060');
        rockGrad.addColorStop(1, '#504030');
        
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, seededRandom(seed + 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock highlight
        ctx.fillStyle = 'rgba(255, 240, 200, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.2, y - size * 0.15, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Desert shrubs
    for (let i = 0; i < 8; i++) {
        drawDesertShrub(
            seededRandom(i * 71) * W,
            H * 0.7 + seededRandom(i * 72) * (H * 0.25),
            seededRandom(i * 73) * 15 + 10,
            i * 71
        );
    }
}

function drawDesertShrub(x, y, size, seed) {
    // Shadow
    ctx.fillStyle = 'rgba(60, 40, 20, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 3, size * 0.8, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Branches
    const branches = 6 + Math.floor(seededRandom(seed) * 5);
    
    for (let b = 0; b < branches; b++) {
        const angle = (b / branches) * Math.PI - Math.PI * 0.1 + seededRandom(seed + b * 0.1) * 0.3;
        const length = size * (0.6 + seededRandom(seed + b * 0.2) * 0.4);
        
        // Branch
        ctx.strokeStyle = '#5c4a38';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
            x + Math.cos(angle) * length * 0.5,
            y - length * 0.6,
            x + Math.cos(angle) * length,
            y - Math.sin(angle) * length
        );
        ctx.stroke();
        
        // Small leaves
        if (seededRandom(seed + b) > 0.3) {
            ctx.fillStyle = seededRandom(seed + b * 2) > 0.5 ? '#6b7b4a' : '#8b9b5a';
            for (let l = 0; l < 3; l++) {
                const lt = 0.4 + l * 0.2;
                const lx = x + Math.cos(angle) * length * lt;
                const ly = y - Math.sin(angle) * length * lt - length * 0.3 * lt;
                
                ctx.beginPath();
                ctx.ellipse(lx, ly, 4, 2, angle, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// ============================================
// 9. PALM TREES (Detailed)
// ============================================

function drawPalmTrees() {
    // Palm tree positions
    const palms = [
        { x: 50, y: H * 0.62, height: 90, lean: 8 },
        { x: 95, y: H * 0.63, height: 75, lean: -5 },
        { x: W - 80, y: H * 0.60, height: 100, lean: 10 },
        { x: W - 40, y: H * 0.62, height: 70, lean: 5 },
    ];
    
    palms.forEach((palm, idx) => {
        drawDetailedPalmTree(palm.x, palm.y, palm.height, palm.lean, idx * 100);
    });
}

function drawDetailedPalmTree(x, baseY, height, lean, seed) {
    ctx.save();
    ctx.translate(x, baseY);
    
    // Shadow
    ctx.fillStyle = 'rgba(50, 35, 20, 0.25)';
    ctx.beginPath();
    ctx.ellipse(25, 8, 50, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Trunk
    const trunkGrad = ctx.createLinearGradient(-8, 0, 8, 0);
    trunkGrad.addColorStop(0, '#4a3020');
    trunkGrad.addColorStop(0.3, '#6b4a30');
    trunkGrad.addColorStop(0.6, '#8b6a48');
    trunkGrad.addColorStop(1, '#5a3a28');
    
    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    
    // Trunk shape with taper
    const segments = 12;
    ctx.moveTo(-7, 0);
    
    for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const segX = lean * t;
        const segY = -height * t;
        const width = 7 - t * 4;
        ctx.lineTo(segX - width, segY);
    }
    
    for (let s = segments; s >= 0; s--) {
        const t = s / segments;
        const segX = lean * t;
        const segY = -height * t;
        const width = 7 - t * 4;
        ctx.lineTo(segX + width, segY);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Trunk rings/texture
    ctx.strokeStyle = '#3a2518';
    ctx.lineWidth = 2;
    for (let ring = 1; ring < segments; ring++) {
        const t = ring / segments;
        const ringX = lean * t;
        const ringY = -height * t;
        const width = 7 - t * 4;
        
        ctx.beginPath();
        ctx.moveTo(ringX - width, ringY);
        ctx.quadraticCurveTo(ringX, ringY + 4, ringX + width, ringY);
        ctx.stroke();
        
        // Fiber marks
        if (ring % 2 === 0) {
            ctx.strokeStyle = 'rgba(80, 50, 30, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ringX - width * 0.5, ringY);
            ctx.lineTo(ringX - width * 0.3, ringY - height / segments * 0.7);
            ctx.stroke();
            ctx.strokeStyle = '#3a2518';
            ctx.lineWidth = 2;
        }
    }
    
    // Crown
    const topX = lean;
    const topY = -height;
    
    // Fronds
    const frondCount = 11;
    for (let f = 0; f < frondCount; f++) {
        drawPalmFrond(topX, topY, f, frondCount, seed + f);
    }
    
    // Coconuts
    const coconutCount = 3 + Math.floor(seededRandom(seed + 50) * 3);
    for (let c = 0; c < coconutCount; c++) {
        const cAngle = (c / coconutCount) * Math.PI - Math.PI * 0.5;
        const cDist = 8 + seededRandom(seed + c * 0.1) * 5;
        const cx = topX + Math.cos(cAngle) * cDist;
        const cy = topY + 10 + Math.sin(cAngle) * 3;
        
        const coconutGrad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 6);
        coconutGrad.addColorStop(0, '#7a5030');
        coconutGrad.addColorStop(0.7, '#5a3820');
        coconutGrad.addColorStop(1, '#3a2010');
        
        ctx.fillStyle = coconutGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawPalmFrond(topX, topY, index, total, seed) {
    const baseAngle = (index / total) * Math.PI * 1.8 - Math.PI * 0.9;
    const frondLength = 55 + seededRandom(seed) * 15;
    const droop = Math.abs(Math.cos(baseAngle)) * 0.35;
    
    const endX = topX + Math.cos(baseAngle) * frondLength;
    const endY = topY + Math.sin(baseAngle) * frondLength * 0.5 + droop * frondLength;
    
    const cpX = topX + Math.cos(baseAngle) * frondLength * 0.6;
    const cpY = topY + Math.sin(baseAngle) * frondLength * 0.3;
    
    // Main stem (rachis)
    const stemGrad = ctx.createLinearGradient(topX, topY, endX, endY);
    stemGrad.addColorStop(0, '#4a7c3a');
    stemGrad.addColorStop(1, '#2d5a1e');
    
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
    
    // Leaflets
    const leaflets = 14;
    for (let l = 1; l < leaflets; l++) {
        const lt = l / leaflets;
        
        // Position along curve
        const t = lt;
        const lx = topX * (1 - t) * (1 - t) + cpX * 2 * (1 - t) * t + endX * t * t;
        const ly = topY * (1 - t) * (1 - t) + cpY * 2 * (1 - t) * t + endY * t * t;
        
        const stemAngle = Math.atan2(endY - topY, endX - topX);
        const leafletLength = 15 * (1 - lt * 0.5);
        
        // Both sides
        for (let side = -1; side <= 1; side += 2) {
            const leafAngle = stemAngle + (Math.PI / 2) * side * 0.75;
            const leafEndX = lx + Math.cos(leafAngle) * leafletLength;
            const leafEndY = ly + Math.sin(leafAngle) * leafletLength;
            
            const leafGrad = ctx.createLinearGradient(lx, ly, leafEndX, leafEndY);
            leafGrad.addColorStop(0, '#3a7830');
            leafGrad.addColorStop(1, lt < 0.5 ? '#228b22' : '#1a6b1a');
            
            ctx.fillStyle = leafGrad;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.quadraticCurveTo(
                lx + (leafEndX - lx) * 0.5 + side * 3,
                ly + (leafEndY - ly) * 0.3,
                leafEndX, leafEndY
            );
            ctx.quadraticCurveTo(
                lx + (leafEndX - lx) * 0.5,
                ly + (leafEndY - ly) * 0.7,
                lx, ly
            );
            ctx.fill();
        }
    }
}

// ============================================
// 10. BIRDS & ATMOSPHERE
// ============================================

function drawBirds() {
    // Distant birds flying
    const birdGroups = [
        { x: 150, y: 80, count: 4 },
        { x: 350, y: 120, count: 3 },
        { x: 550, y: 70, count: 5 },
        { x: 700, y: 150, count: 3 },
    ];
    
    birdGroups.forEach((group, gIdx) => {
        for (let i = 0; i < group.count; i++) {
            const bx = group.x + seededRandom(gIdx * 10 + i) * 40 - 20;
            const by = group.y + seededRandom(gIdx * 10 + i + 1) * 20 - 10;
            const size = seededRandom(gIdx * 10 + i + 2) * 3 + 2;
            
            drawBird(bx, by, size);
        }
    });
}

function drawBird(x, y, size) {
    ctx.strokeStyle = 'rgba(30, 20, 15, 0.7)';
    ctx.lineWidth = 1.5;
    
    // Simple bird V shape
    ctx.beginPath();
    ctx.moveTo(x - size * 2, y + size * 0.5);
    ctx.quadraticCurveTo(x, y - size, x + size * 2, y + size * 0.5);
    ctx.stroke();
}

function drawAtmosphericHaze() {
    // Subtle atmospheric perspective haze
    const hazeGrad = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.65);
    hazeGrad.addColorStop(0, 'rgba(255, 220, 180, 0.15)');
    hazeGrad.addColorStop(1, 'rgba(255, 220, 180, 0)');
    
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, H * 0.5, W, H * 0.15);
}

// ============================================
// 11. NILE RIVER (glimpse in distance)
// ============================================

function drawNileGlimpse() {
    // Small section of Nile visible between elements
    const nileY = H * 0.56;
    
    const nileGrad = ctx.createLinearGradient(0, nileY, 0, nileY + 20);
    nileGrad.addColorStop(0, '#4a8090');
    nileGrad.addColorStop(0.3, '#3a7080');
    nileGrad.addColorStop(0.7, '#2a5060');
    nileGrad.addColorStop(1, '#c9a060'); // Blends into sand
    
    ctx.fillStyle = nileGrad;
    ctx.beginPath();
    ctx.moveTo(0, nileY + 5);
    
    // Curving river shape
    for (let x = 0; x <= W * 0.35; x += 5) {
        const riverY = nileY + Math.sin(x * 0.02) * 3 + 8;
        ctx.lineTo(x, riverY);
    }
    
    ctx.lineTo(W * 0.35, nileY + 25);
    ctx.lineTo(0, nileY + 25);
    ctx.closePath();
    ctx.fill();
    
    // Sun reflection on water
    ctx.save();
    ctx.globalAlpha = 0.3;
    const reflectGrad = ctx.createLinearGradient(W * 0.15, nileY, W * 0.25, nileY + 15);
    reflectGrad.addColorStop(0, '#ffe0a0');
    reflectGrad.addColorStop(0.5, '#ffc060');
    reflectGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');
    
    ctx.fillStyle = reflectGrad;
    ctx.beginPath();
    ctx.ellipse(W * 0.2, nileY + 10, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Water ripples
    ctx.strokeStyle = 'rgba(100, 150, 160, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const rippleY = nileY + 8 + i * 3;
        ctx.beginPath();
        for (let x = 5; x < W * 0.33; x += 8) {
            const ry = rippleY + Math.sin(x * 0.1 + i) * 1.5;
            if (x === 5) ctx.moveTo(x, ry);
            else ctx.lineTo(x, ry);
        }
        ctx.stroke();
    }
}

// ============================================
// 12. FINAL TOUCHES
// ============================================

function drawFinalTouches() {
    // Vignette effect
    const vignetteGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Subtle golden overlay for warmth
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#ffd080';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

// ============================================
// RENDER THE SCENE
// ============================================

function render() {
    // Clear
    ctx.clearRect(0, 0, W, H);
    
    // Layer 1: Sky and celestial
    drawSky();
    drawStars();
    drawSun();
    drawClouds();
    
    // Layer 2: Distant elements
    drawDistantPyramids();
    drawBirds();
    
    // Layer 3: Nile glimpse
    drawNileGlimpse();
    
    // Layer 4: Main pyramids
    drawMainPyramids();
    
    // Layer 5: Atmospheric haze
    drawAtmosphericHaze();
    
    // Layer 6: Desert ground
    drawDesertGround();
    
    // Layer 7: Sphinx (focal point)
    drawSphinx();
    
    // Layer 8: Palm trees
    drawPalmTrees();
    
    // Layer 9: Final touches
    drawFinalTouches();
    
    console.log('Egyptian Scene rendered successfully!');
}

// Execute render
render();
