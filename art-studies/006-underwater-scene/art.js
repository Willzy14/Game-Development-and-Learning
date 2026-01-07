// ============================================================================
// UNDERWATER SCENE V1 - RESTRAINT & PURPOSE
// ============================================================================
//
// GOAL: Create a peaceful underwater scene that READS as underwater
// NOT: A showcase of every technique we've learned
//
// WHAT MAKES IT "UNDERWATER"?
// 1. Blue-green color palette that shifts with depth
// 2. Light rays from above (caustics)
// 3. Soft edges / hazy atmosphere
// 4. Floating particles
//
// WHAT'S THE FOCAL POINT?
// - A simple, charming fish in the mid-ground
// - NOT a sphere study - just a fish with personality
//
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// SIMPLE UTILITIES
// =============================================================================

function withAlpha(color, alpha) {
    // Handle hex colors
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Handle rgb() colors
    if (color.startsWith('rgb(')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
        }
    }
    // Handle rgba() colors - just replace the alpha
    if (color.startsWith('rgba(')) {
        return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
    }
    return color;
}

// Seeded random for consistency
let seed = 12345;
function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

// =============================================================================
// COLORS (Simple palette)
// =============================================================================

const WATER_LIGHT = '#1a7090';
const WATER_MID = '#0d4a65';
const WATER_DEEP = '#041525';
const SAND = '#8a7050';
const CORAL_ORANGE = '#d06030';
const CORAL_PINK = '#c05070';
const FISH_ORANGE = '#ff9040';

// =============================================================================
// LAYER 1: WATER (Simple gradient)
// =============================================================================

function drawWater() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, WATER_LIGHT);
    grad.addColorStop(0.5, WATER_MID);
    grad.addColorStop(1, WATER_DEEP);
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
}

// =============================================================================
// LAYER 2: LIGHT RAYS (What makes it feel underwater)
// Light scatters, breaks, weakens quickly with depth - uneven, organic
// =============================================================================

function drawLightRays() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    seed = 100;
    
    // More irregular rays - break, overlap, die unpredictably
    const rayConfigs = [
        // Main rays - uneven spacing, varied everything
        { x: W * 0.12, width: 40, length: 0.38, tilt: -18, opacity: 0.06 },  // Dies early
        { x: W * 0.24, width: 95, length: 0.62, tilt: -10, opacity: 0.13 },
        { x: W * 0.38, width: 130, length: 0.70, tilt: -3, opacity: 0.16 },  // Strong, almost vertical
        { x: W * 0.48, width: 60, length: 0.42, tilt: 2, opacity: 0.08 },    // Dies early - gap
        { x: W * 0.58, width: 110, length: 0.65, tilt: 8, opacity: 0.14 },
        { x: W * 0.75, width: 85, length: 0.55, tilt: 15, opacity: 0.10 },
        { x: W * 0.88, width: 35, length: 0.30, tilt: 22, opacity: 0.05 },   // Dies very early
        // Overlapping secondary rays - creates broken effect
        { x: W * 0.30, width: 45, length: 0.45, tilt: -6, opacity: 0.04 },
        { x: W * 0.52, width: 30, length: 0.28, tilt: 5, opacity: 0.03 },    // Very short
        { x: W * 0.68, width: 55, length: 0.48, tilt: 12, opacity: 0.05 },
    ];
    
    for (const ray of rayConfigs) {
        const endY = H * ray.length;
        const tiltOffset = Math.tan(ray.tilt * Math.PI / 180) * endY;
        
        // Ray spreads as it descends
        const topWidth = ray.width * 0.5;
        const bottomWidth = ray.width * 1.6;
        
        // Irregular fade - some die abruptly, some linger
        const fadeStart = 0.2 + (ray.length < 0.4 ? 0.1 : 0);  // Short rays fade faster
        const fadeMid = 0.5 + (ray.length > 0.6 ? 0.1 : 0);    // Long rays linger
        
        const rayGrad = ctx.createLinearGradient(ray.x, 0, ray.x + tiltOffset, endY);
        rayGrad.addColorStop(0, `rgba(130, 210, 230, ${ray.opacity})`);
        rayGrad.addColorStop(fadeStart, `rgba(110, 190, 210, ${ray.opacity * 0.75})`);
        rayGrad.addColorStop(fadeMid, `rgba(80, 160, 180, ${ray.opacity * 0.25})`);
        rayGrad.addColorStop(1, 'rgba(60, 140, 160, 0)');
        
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(ray.x - topWidth/2, 0);
        ctx.lineTo(ray.x + topWidth/2, 0);
        ctx.lineTo(ray.x + tiltOffset + bottomWidth/2, endY);
        ctx.lineTo(ray.x + tiltOffset - bottomWidth/2, endY);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// =============================================================================
// LAYER 3: SEA FLOOR (Simple sand area)
// =============================================================================

function drawSeaFloor() {
    const floorY = H * 0.75;
    
    // Sandy gradient
    const sandGrad = ctx.createLinearGradient(0, floorY, 0, H);
    sandGrad.addColorStop(0, '#5a5040');
    sandGrad.addColorStop(1, '#302820');
    
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    
    // Gentle wavy floor
    seed = 200;
    for (let x = 0; x <= W; x += 20) {
        const y = floorY + Math.sin(x * 0.01) * 10 + random() * 5;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    
    // SEABED FOG - hazy layer just above the floor
    // Sediment stirred up, visibility drops near bottom
    const fogGrad = ctx.createLinearGradient(0, floorY - 80, 0, floorY + 10);
    fogGrad.addColorStop(0, 'rgba(60, 80, 90, 0)');
    fogGrad.addColorStop(0.5, 'rgba(50, 70, 80, 0.08)');
    fogGrad.addColorStop(0.8, 'rgba(45, 65, 75, 0.15)');
    fogGrad.addColorStop(1, 'rgba(40, 60, 70, 0.2)');
    
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, floorY - 80, W, 100);
    
    return floorY;
}

// =============================================================================
// LAYER 4: SIMPLE CORAL (Just shapes with color, not sphere studies)
// =============================================================================

function drawCoral(floorY) {
    seed = 300;
    
    // A few branch corals - simple upward strokes
    const drawBranchCoral = (x, baseY, color) => {
        // Contact shadow at base
        ctx.fillStyle = 'rgba(5, 15, 20, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, baseY + 3, 25, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 5; i++) {
            const startX = x + (random() - 0.5) * 30;
            const height = 40 + random() * 60;
            const lean = (random() - 0.5) * 30;
            
            ctx.lineWidth = 8 - i;
            ctx.beginPath();
            ctx.moveTo(startX, baseY);
            ctx.quadraticCurveTo(
                startX + lean * 0.5, baseY - height * 0.6,
                startX + lean, baseY - height
            );
            ctx.stroke();
        }
    };
    
    // A brain coral - just a lumpy circle
    const drawBrainCoral = (x, y, size, color) => {
        // Contact shadow
        ctx.fillStyle = 'rgba(5, 15, 20, 0.35)';
        ctx.beginPath();
        ctx.ellipse(x, y + size * 0.5 + 4, size * 0.9, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const grad = ctx.createRadialGradient(x, y - size * 0.2, 0, x, y, size);
        grad.addColorStop(0, color);
        grad.addColorStop(1, withAlpha(color, 0.6));
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        
        // Lumpy circle
        seed = x * 10 + y;
        for (let a = 0; a < Math.PI * 2; a += 0.3) {
            const wobble = size * (0.85 + random() * 0.3);
            const px = x + Math.cos(a) * wobble;
            const py = y + Math.sin(a) * wobble * 0.7;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    };
    
    // Place a few corals - not too many
    drawBranchCoral(W * 0.15, floorY, CORAL_ORANGE);
    drawBranchCoral(W * 0.8, floorY, CORAL_PINK);
    drawBrainCoral(W * 0.65, floorY - 20, 40, '#c06060');
    drawBrainCoral(W * 0.25, floorY - 15, 30, CORAL_PINK);
}

// =============================================================================
// LAYER 5: SIMPLE ROCKS (Just dark shapes) - with contact shadows
// =============================================================================

function drawRocks(floorY) {
    seed = 400;
    
    const drawRock = (x, y, width, height) => {
        // CONTACT SHADOW - darker area where rock meets sand
        const shadowGrad = ctx.createRadialGradient(x, y + 3, 0, x, y + 3, width * 1.2);
        shadowGrad.addColorStop(0, 'rgba(5, 15, 20, 0.5)');
        shadowGrad.addColorStop(0.4, 'rgba(5, 15, 20, 0.2)');
        shadowGrad.addColorStop(1, 'rgba(5, 15, 20, 0)');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(x, y + 5, width * 1.1, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock body
        const grad = ctx.createLinearGradient(x, y - height, x, y);
        grad.addColorStop(0, '#4a4540');
        grad.addColorStop(1, '#2a2520');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        
        // Irregular blob
        seed = x * 5 + y;
        const points = 8;
        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const angle = t * Math.PI;
            const wobble = 0.8 + random() * 0.4;
            const px = x + Math.cos(angle) * width * wobble;
            const py = y - Math.sin(angle) * height * wobble;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    };
    
    drawRock(W * 0.1, floorY, 50, 35);
    drawRock(W * 0.5, floorY, 40, 25);
    drawRock(W * 0.85, floorY, 45, 30);
}

// =============================================================================
// LAYER 6: SEAWEED (Flowing lines with current/motion)
// =============================================================================

function drawSeaweed(floorY) {
    seed = 500;
    
    // Current direction - slight bias to one side
    const currentBias = 20; // Pushes everything slightly right
    
    const drawStrand = (x, baseY) => {
        const height = 60 + random() * 80;
        // Sway includes current bias - all lean in similar direction
        const sway = currentBias + (random() - 0.3) * 40;
        // Mid-bend for more organic curve
        const midBend = currentBias * 0.3 + (random() - 0.5) * 15;
        
        const grad = ctx.createLinearGradient(x, baseY, x, baseY - height);
        grad.addColorStop(0, '#305030');
        grad.addColorStop(1, '#408040');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        // Bezier for more pronounced bend
        ctx.bezierCurveTo(
            x + midBend * 0.3, baseY - height * 0.3,
            x + sway * 0.4, baseY - height * 0.6,
            x + sway, baseY - height
        );
        ctx.stroke();
    };
    
    // A few strands here and there
    drawStrand(W * 0.05, floorY);
    drawStrand(W * 0.08, floorY);
    drawStrand(W * 0.92, floorY);
    drawStrand(W * 0.95, floorY);
    drawStrand(W * 0.4, floorY);
}

// =============================================================================
// LAYER 7: FISH (Simple, charming - NOT a sphere study)
// Depth affects color: foreground = saturated, background = cooler, bluer
// =============================================================================

// Convert color to desaturated/cooler version based on depth (0 = front, 1 = back)
function getDepthColor(baseColor, depth) {
    // Parse hex color
    let r, g, b;
    if (baseColor.startsWith('#')) {
        r = parseInt(baseColor.slice(1, 3), 16);
        g = parseInt(baseColor.slice(3, 5), 16);
        b = parseInt(baseColor.slice(5, 7), 16);
    } else {
        return baseColor; // Can't parse, return as-is
    }
    
    // Water color to blend toward (the deeper blue)
    const waterR = 40, waterG = 90, waterB = 130;
    
    // Blend toward water color based on depth
    const blendAmount = depth * 0.6; // Max 60% blend at full depth
    r = Math.round(r + (waterR - r) * blendAmount);
    g = Math.round(g + (waterG - g) * blendAmount);
    b = Math.round(b + (waterB - b) * blendAmount);
    
    // Also desaturate slightly
    const gray = (r + g + b) / 3;
    const desatAmount = depth * 0.3;
    r = Math.round(r + (gray - r) * desatAmount);
    g = Math.round(g + (gray - g) * desatAmount);
    b = Math.round(b + (gray - b) * desatAmount);
    
    return `rgb(${r}, ${g}, ${b})`;
}

function drawFish(x, y, size, color, flipX = false, depth = 0, tilt = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    // Apply tilt rotation (in radians) - fish swimming at angle
    ctx.rotate(tilt * Math.PI / 180);
    
    // Apply depth-based color transformation
    const depthColor = getDepthColor(color, depth);
    
    // Reduce contrast at depth
    const contrastMult = 1 - depth * 0.3;
    
    // Body - ellipse with TOP-LIT shading (light from above)
    // Gradient goes from top (lighter) to bottom (darker) - not radial
    const bodyGrad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
    bodyGrad.addColorStop(0, depthColor);  // Top lit
    bodyGrad.addColorStop(0.4, depthColor);
    bodyGrad.addColorStop(1, withAlpha(depthColor, 0.55 * contrastMult + 0.3));  // Bottom darker
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle belly highlight for foreground fish only
    if (depth < 0.3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.15, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Tail - simple triangle
    ctx.fillStyle = withAlpha(depthColor, 0.8);
    ctx.beginPath();
    ctx.moveTo(size * 0.7, 0);
    ctx.lineTo(size * 1.3, -size * 0.4);
    ctx.lineTo(size * 1.3, size * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Fin on top
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.4);
    ctx.quadraticCurveTo(0, -size * 0.8, size * 0.3, -size * 0.3);
    ctx.fill();
    
    // Eye - fades at depth
    const eyeWhite = depth > 0.5 ? '#aabbcc' : '#ffffff';
    const eyeBlack = depth > 0.5 ? '#223344' : '#000000';
    
    ctx.fillStyle = eyeWhite;
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size * 0.1, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = eyeBlack;
    ctx.beginPath();
    ctx.arc(-size * 0.42, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Simple stripe (if orange fish in foreground)
    if (color === FISH_ORANGE && depth < 0.3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(-size * 0.1, -size * 0.45, size * 0.1, size * 0.9);
    }
    
    ctx.restore();
}

// Store fish positions for occlusion effects
let fishPositions = [];

function drawAllFish() {
    fishPositions = []; // Reset
    
    // Background fish - small, cooler, desaturated (depth 0.8-1.0), varied tilts
    drawFish(W * 0.2, H * 0.22, 12, '#e09050', false, 0.9, -8);      // diving down
    drawFish(W * 0.75, H * 0.28, 10, '#50a0d0', true, 0.85, 12);     // swimming up
    drawFish(W * 0.85, H * 0.18, 8, '#e08040', false, 0.95, 5);      // slight upward
    drawFish(W * 0.15, H * 0.32, 9, '#60b090', true, 0.88, -3);      // nearly level
    
    // Mid-ground fish - medium size, partial desaturation (depth 0.4-0.6)
    drawFish(W * 0.3, H * 0.42, 22, '#e0a040', true, 0.5, 15);       // rising
    drawFish(W * 0.72, H * 0.48, 18, '#5090c0', false, 0.45, -10);   // descending
    
    // Foreground fish - larger, full saturation (depth 0-0.2)
    // Store positions for shadow casting
    fishPositions.push({ x: W * 0.5, y: H * 0.55, size: 45 });
    fishPositions.push({ x: W * 0.25, y: H * 0.62, size: 28 });
    
    drawFish(W * 0.5, H * 0.55, 45, FISH_ORANGE, false, 0, 5);       // hero fish slightly tilted
    drawFish(W * 0.25, H * 0.62, 28, '#40a0e0', true, 0.15, -6);     // crossing path
}

// Fish shadows on the sand - depth occlusion
function drawFishShadows(floorY) {
    for (const fish of fishPositions) {
        // Shadow position - offset based on light angle
        const shadowX = fish.x + 15;
        const shadowY = floorY + 5;
        const shadowWidth = fish.size * 1.2;
        const shadowHeight = 8;
        
        // Distance from fish to floor affects shadow softness
        const distToFloor = floorY - fish.y;
        const shadowOpacity = Math.max(0.1, 0.25 - distToFloor * 0.001);
        
        const shadowGrad = ctx.createRadialGradient(shadowX, shadowY, 0, shadowX, shadowY, shadowWidth);
        shadowGrad.addColorStop(0, `rgba(5, 15, 20, ${shadowOpacity})`);
        shadowGrad.addColorStop(0.5, `rgba(5, 15, 20, ${shadowOpacity * 0.4})`);
        shadowGrad.addColorStop(1, 'rgba(5, 15, 20, 0)');
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(shadowX, shadowY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =============================================================================
// LAYER 8: BUBBLES (Drifting, not straight up)
// =============================================================================

function drawBubbles() {
    seed = 600;
    
    // Current drift direction (matches seaweed)
    const currentBias = 15;
    
    for (let i = 0; i < 20; i++) {
        // Base position
        const baseX = random() * W;
        const y = random() * H * 0.85;
        const r = 2 + random() * 6;
        
        // Drift based on height - higher bubbles have drifted more
        const heightRatio = 1 - (y / (H * 0.85)); // 0 at bottom, 1 at top
        const drift = currentBias * heightRatio + (random() - 0.5) * 20;
        const x = baseX + drift;
        
        // Wobble - bubbles don't go perfectly straight
        const wobble = Math.sin(y * 0.05) * 3;
        
        // Simple bubble - mostly edge
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + wobble, y, r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Tiny highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x + wobble - r * 0.3, y - r * 0.3, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =============================================================================
// LAYER 9: FLOATING PARTICLES (Depth atmosphere)
// =============================================================================

function drawParticles() {
    seed = 700;
    
    // Particles create sense of medium - the water IS something, not empty
    // Different layers: background (blurry, faded) to foreground (sharper, brighter)
    
    // Background particles - tiny, faded, many
    for (let i = 0; i < 60; i++) {
        const x = random() * W;
        const y = random() * H * 0.85; // Not on floor
        const size = 0.5 + random() * 1;
        const drift = (random() - 0.5) * 2; // Slight horizontal drift appearance
        
        ctx.globalAlpha = 0.15 + random() * 0.1;
        ctx.fillStyle = '#708090';
        ctx.beginPath();
        ctx.arc(x + drift, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Mid-ground particles - slightly larger, more visible
    for (let i = 0; i < 30; i++) {
        const x = random() * W;
        const y = random() * H * 0.85;
        const size = 1 + random() * 1.5;
        
        ctx.globalAlpha = 0.25 + random() * 0.15;
        ctx.fillStyle = '#90a8b8';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Foreground particles - larger, brighter, sparser
    for (let i = 0; i < 15; i++) {
        const x = random() * W;
        const y = random() * H * 0.8;
        const size = 1.5 + random() * 2;
        
        // Some particles catch light rays
        const inLightRay = (x > W * 0.3 && x < W * 0.6 && y < H * 0.5);
        const baseAlpha = inLightRay ? 0.45 : 0.35;
        const baseColor = inLightRay ? '#c0d8e8' : '#a0c0d0';
        
        ctx.globalAlpha = baseAlpha + random() * 0.1;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // A few "floater" organic particles - elongated
    for (let i = 0; i < 8; i++) {
        const x = random() * W;
        const y = H * 0.2 + random() * H * 0.5;
        const length = 3 + random() * 5;
        const angle = (random() - 0.5) * 0.5; // Slight tilt
        
        ctx.globalAlpha = 0.2 + random() * 0.1;
        ctx.strokeStyle = '#90a8b8';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
}

// =============================================================================
// LAYER 10: DEPTH HAZE (Makes it feel like water)
// =============================================================================

function drawDepthHaze() {
    const haze = ctx.createLinearGradient(0, 0, 0, H);
    haze.addColorStop(0, 'rgba(20, 80, 100, 0)');
    haze.addColorStop(1, 'rgba(10, 40, 60, 0.2)');
    
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);
}

// =============================================================================
// MAIN RENDER
// =============================================================================

// Foreground particles that occlude fish - creates parallax depth
function drawForegroundParticles() {
    seed = 800;
    
    // Large, close particles that drift in front of everything
    for (let i = 0; i < 12; i++) {
        const x = random() * W;
        const y = random() * H * 0.75;
        const size = 2.5 + random() * 3;
        
        ctx.globalAlpha = 0.2 + random() * 0.15;
        ctx.fillStyle = '#b0c8d8';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // A few very close, slightly blurred particles
    for (let i = 0; i < 5; i++) {
        const x = random() * W;
        const y = random() * H * 0.6;
        const size = 4 + random() * 4;
        
        // Soft edge for "out of focus" effect
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, 'rgba(180, 200, 220, 0.15)');
        grad.addColorStop(0.5, 'rgba(180, 200, 220, 0.08)');
        grad.addColorStop(1, 'rgba(180, 200, 220, 0)');
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
}

function render() {
    console.log('Underwater Scene V1 - Simple & Purposeful');
    
    ctx.clearRect(0, 0, W, H);
    
    drawWater();
    drawLightRays();
    const floorY = drawSeaFloor();
    drawRocks(floorY);
    drawSeaweed(floorY);
    drawCoral(floorY);
    drawAllFish();
    drawFishShadows(floorY);  // Fish shadows on sand
    drawBubbles();
    drawParticles();
    drawForegroundParticles();  // Particles IN FRONT of fish
    drawDepthHaze();
    
    console.log('Done - Used what was needed, not everything we know');
}

render();
