// ============================================
// INCA TEMPLE BACKGROUND - Procedural Art
// ============================================
// Machu Picchu inspired mountain temple scene

function drawIncaBackground(ctx, W, H) {
    // ========================================
    // SKY - Andean sunset/sunrise
    // ========================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    skyGrad.addColorStop(0, '#1a0a2e');      // Deep purple night
    skyGrad.addColorStop(0.3, '#2d1b4e');    // Purple
    skyGrad.addColorStop(0.5, '#4a2c6a');    // Lighter purple
    skyGrad.addColorStop(0.7, '#8b4513');    // Burnt sienna
    skyGrad.addColorStop(0.85, '#cd853f');   // Peru tan
    skyGrad.addColorStop(1, '#daa520');      // Goldenrod horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.5);
    
    // ========================================
    // DISTANT ANDES MOUNTAINS
    // ========================================
    
    // Far mountain range (misty blue)
    ctx.fillStyle = 'rgba(75, 60, 90, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.35);
    drawMountainRidge(ctx, 0, W, H * 0.35, H * 0.25, 5, 100);
    ctx.lineTo(W, H * 0.5);
    ctx.lineTo(0, H * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Mid mountain range (darker)
    ctx.fillStyle = 'rgba(60, 45, 70, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.38);
    drawMountainRidge(ctx, 0, W, H * 0.38, H * 0.22, 4, 150);
    ctx.lineTo(W, H * 0.5);
    ctx.lineTo(0, H * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Near mountain with Machu Picchu silhouette
    const mtnGrad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.55);
    mtnGrad.addColorStop(0, '#3d2817');
    mtnGrad.addColorStop(1, '#2a1a0f');
    ctx.fillStyle = mtnGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.45);
    // Huayna Picchu peak (iconic pointed mountain)
    ctx.lineTo(W * 0.15, H * 0.42);
    ctx.lineTo(W * 0.25, H * 0.28);  // Sharp peak
    ctx.lineTo(W * 0.35, H * 0.40);
    ctx.lineTo(W * 0.45, H * 0.38);
    ctx.lineTo(W * 0.55, H * 0.32);  // Another peak
    ctx.lineTo(W * 0.65, H * 0.42);
    ctx.lineTo(W * 0.75, H * 0.36);
    ctx.lineTo(W * 0.85, H * 0.44);
    ctx.lineTo(W, H * 0.40);
    ctx.lineTo(W, H * 0.55);
    ctx.lineTo(0, H * 0.55);
    ctx.closePath();
    ctx.fill();
    
    // ========================================
    // INCA TERRACES (Agricultural terraces)
    // ========================================
    drawIncaTerraces(ctx, W, H);
    
    // ========================================
    // STONE TEMPLE STRUCTURE
    // ========================================
    drawTempleStructure(ctx, W, H);
    
    // ========================================
    // ATMOSPHERIC EFFECTS
    // ========================================
    
    // Mountain mist
    const mistGrad = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.55);
    mistGrad.addColorStop(0, 'rgba(180, 160, 140, 0)');
    mistGrad.addColorStop(0.5, 'rgba(180, 160, 140, 0.15)');
    mistGrad.addColorStop(1, 'rgba(180, 160, 140, 0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, H * 0.4, W, H * 0.15);
    
    // Sun glow behind mountains
    const sunX = W * 0.7;
    const sunY = H * 0.35;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.25);
    sunGlow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
    sunGlow.addColorStop(0.3, 'rgba(255, 180, 80, 0.2)');
    sunGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, H * 0.5);
    
    // Stars in upper sky
    drawStars(ctx, W, H * 0.25, 40);
    
    // ========================================
    // CONDOR SILHOUETTES
    // ========================================
    drawCondor(ctx, W * 0.2, H * 0.15, 25);
    drawCondor(ctx, W * 0.35, H * 0.12, 18);
    drawCondor(ctx, W * 0.8, H * 0.18, 22);
    
    // ========================================
    // VIGNETTE
    // ========================================
    const vignetteGrad = ctx.createRadialGradient(
        W * 0.5, H * 0.5, W * 0.3,
        W * 0.5, H * 0.5, W * 0.8
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
}

function drawMountainRidge(ctx, startX, endX, baseY, maxHeight, peaks, seed) {
    const points = 50;
    for (let i = 0; i <= points; i++) {
        const x = startX + (endX - startX) * (i / points);
        const peakPhase = Math.sin((i / points) * Math.PI * peaks + seed);
        const noise = (seededRandom(seed + i) - 0.5) * maxHeight * 0.3;
        const y = baseY - Math.abs(peakPhase) * maxHeight * 0.7 + noise;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
}

function drawIncaTerraces(ctx, W, H) {
    // Agricultural terraces on mountainside
    const terraceColors = [
        '#2d4a1c', '#3d5a2c', '#4d6a3c', '#3d5528', '#4a6830'
    ];
    
    for (let t = 0; t < 5; t++) {
        const terraceY = H * (0.52 + t * 0.03);
        const terraceH = H * 0.025;
        
        ctx.fillStyle = terraceColors[t];
        ctx.beginPath();
        ctx.moveTo(W * 0.1, terraceY);
        
        // Curved terrace following mountain contour
        for (let i = 0; i <= 20; i++) {
            const x = W * 0.1 + (W * 0.5) * (i / 20);
            const curve = Math.sin((i / 20) * Math.PI) * 8;
            ctx.lineTo(x, terraceY + curve);
        }
        
        ctx.lineTo(W * 0.6, terraceY + terraceH + 5);
        ctx.lineTo(W * 0.1, terraceY + terraceH);
        ctx.closePath();
        ctx.fill();
        
        // Stone wall edge
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * 0.1, terraceY + terraceH);
        for (let i = 0; i <= 20; i++) {
            const x = W * 0.1 + (W * 0.5) * (i / 20);
            const curve = Math.sin((i / 20) * Math.PI) * 8;
            ctx.lineTo(x, terraceY + terraceH + curve);
        }
        ctx.stroke();
    }
}

function drawTempleStructure(ctx, W, H) {
    // Intihuatana-style stone structure (sun temple)
    const templeX = W * 0.7;
    const templeY = H * 0.48;
    const templeW = W * 0.18;
    const templeH = H * 0.12;
    
    // Base platform (trapezoidal - Inca signature shape)
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.moveTo(templeX - templeW * 0.6, templeY + templeH);
    ctx.lineTo(templeX - templeW * 0.5, templeY);
    ctx.lineTo(templeX + templeW * 0.5, templeY);
    ctx.lineTo(templeX + templeW * 0.6, templeY + templeH);
    ctx.closePath();
    ctx.fill();
    
    // Stone block texture
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 1;
    for (let row = 0; row < 4; row++) {
        const rowY = templeY + (templeH / 4) * row;
        const indent = row * templeW * 0.02;
        ctx.beginPath();
        ctx.moveTo(templeX - templeW * 0.5 + indent, rowY);
        ctx.lineTo(templeX + templeW * 0.5 - indent, rowY);
        ctx.stroke();
        
        // Vertical joints (staggered)
        const blocks = 4 + row;
        for (let b = 1; b < blocks; b++) {
            const blockX = templeX - templeW * 0.5 + indent + 
                          ((templeW - indent * 2) / blocks) * b +
                          (row % 2 === 0 ? 10 : -5);
            ctx.beginPath();
            ctx.moveTo(blockX, rowY);
            ctx.lineTo(blockX, rowY + templeH / 4);
            ctx.stroke();
        }
    }
    
    // Central doorway (trapezoidal - Inca style)
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    const doorW = templeW * 0.2;
    const doorH = templeH * 0.6;
    ctx.moveTo(templeX - doorW * 0.4, templeY + templeH);
    ctx.lineTo(templeX - doorW * 0.3, templeY + templeH - doorH);
    ctx.lineTo(templeX + doorW * 0.3, templeY + templeH - doorH);
    ctx.lineTo(templeX + doorW * 0.4, templeY + templeH);
    ctx.closePath();
    ctx.fill();
    
    // Golden sun disk above doorway (Inti symbol)
    const sunDiskY = templeY + templeH * 0.25;
    const sunDiskR = templeW * 0.08;
    
    // Glow
    const diskGlow = ctx.createRadialGradient(templeX, sunDiskY, 0, templeX, sunDiskY, sunDiskR * 2);
    diskGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    diskGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = diskGlow;
    ctx.beginPath();
    ctx.arc(templeX, sunDiskY, sunDiskR * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Disk
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(templeX, sunDiskY, sunDiskR, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    for (let r = 0; r < 8; r++) {
        const angle = (r / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(templeX + Math.cos(angle) * sunDiskR * 1.2, 
                   sunDiskY + Math.sin(angle) * sunDiskR * 1.2);
        ctx.lineTo(templeX + Math.cos(angle) * sunDiskR * 1.6,
                   sunDiskY + Math.sin(angle) * sunDiskR * 1.6);
        ctx.stroke();
    }
}

function drawStars(ctx, W, maxY, count) {
    for (let i = 0; i < count; i++) {
        const x = seededRandom(i * 17) * W;
        const y = seededRandom(i * 23) * maxY;
        const size = 0.5 + seededRandom(i * 31) * 1.5;
        const brightness = 0.3 + seededRandom(i * 41) * 0.7;
        
        ctx.fillStyle = `rgba(255, 255, 240, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCondor(ctx, x, y, size) {
    // Simple condor silhouette
    ctx.fillStyle = 'rgba(20, 10, 5, 0.8)';
    ctx.beginPath();
    
    // Body
    ctx.ellipse(x, y, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - size * 0.5, y - size * 0.1, x - size, y + size * 0.1);
    ctx.quadraticCurveTo(x - size * 0.5, y + size * 0.05, x, y);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + size * 0.5, y - size * 0.1, x + size, y + size * 0.1);
    ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.05, x, y);
    ctx.fill();
}

// Seeded random for reproducibility
let bgSeed = 12345;
function seededRandom(seed) {
    const x = Math.sin(seed || bgSeed++) * 10000;
    return x - Math.floor(x);
}

// Cache the background
let backgroundCanvas = null;

function getIncaBackground(W, H) {
    if (!backgroundCanvas) {
        backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.width = W;
        backgroundCanvas.height = H;
        const bgCtx = backgroundCanvas.getContext('2d');
        drawIncaBackground(bgCtx, W, H);
    }
    return backgroundCanvas;
}
