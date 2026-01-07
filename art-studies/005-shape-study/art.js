// ============================================================================
// SHAPE STUDY - APPLYING 5-VALUE LIGHTING TO 3D PRIMITIVES
// ============================================================================
// 
// GOAL: Apply same lighting principles learned from spheres to other shapes
// 
// 5-VALUE SYSTEM (consistent light from upper-left):
// 1. HIGHLIGHT - Where light hits directly
// 2. LIGHT - Lit side facing light source
// 3. HALFTONE - Transition zone (terminator)
// 4. CORE SHADOW - Darkest part (NOT the edge!)
// 5. REFLECTED LIGHT - Bounce light on shadow edge
// 
// SHAPES:
// - Top-Left: CUBE (flat planes, sharp transitions)
// - Top-Right: CYLINDER (curved + flat surfaces)
// - Bottom-Left: CONE (converging gradient)
// - Bottom-Right: TORUS (double curvature)
// 
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// Light direction (upper-left)
const LIGHT = { x: -0.6, y: -0.6, z: 0.5 };

// =============================================================================
// COLOR UTILITIES
// =============================================================================

const ColorUtils = {
    hsl(h, s, l) {
        return `hsl(${h}, ${s}%, ${l}%)`;
    },
    hsla(h, s, l, a) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }
};

// =============================================================================
// BACKGROUND
// =============================================================================

function drawBackground() {
    // Gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#4a4a4a');
    bgGrad.addColorStop(0.5, '#3a3a3a');
    bgGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Quadrant dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2, 0);
    ctx.lineTo(W/2, H);
    ctx.moveTo(0, H/2);
    ctx.lineTo(W, H/2);
    ctx.stroke();
}

// =============================================================================
// SHADOW HELPER
// =============================================================================

// Proper shadow system: contact shadow (tight, dark) + cast shadow (soft, extends away)
function drawShadowSystem(cx, groundY, contactWidth, castWidth, castLength) {
    // Light from upper-left = shadow extends toward lower-right
    const shadowOffsetX = castWidth * 0.4;
    const shadowOffsetY = castLength * 0.15;
    
    // LAYER 1: Cast shadow (soft, extends away from light)
    // Far edge is softer than near edge
    ctx.save();
    const castGrad = ctx.createRadialGradient(
        cx + shadowOffsetX * 0.5, groundY + shadowOffsetY, 0,
        cx + shadowOffsetX, groundY + shadowOffsetY, castWidth
    );
    castGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    castGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.2)');
    castGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.08)');
    castGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = castGrad;
    ctx.beginPath();
    // Elongated toward shadow direction
    ctx.ellipse(cx + shadowOffsetX, groundY + shadowOffsetY, castWidth, castLength, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // LAYER 2: Contact shadow (tight, dark, hugs the object)
    ctx.save();
    const contactGrad = ctx.createRadialGradient(
        cx, groundY, 0,
        cx, groundY, contactWidth
    );
    contactGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');   // Very dark at contact
    contactGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0.5)');
    contactGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    contactGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.08)');
    contactGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(cx, groundY, contactWidth, contactWidth * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// =============================================================================
// CUBE (Top-Left Quadrant)
// Light from upper-left: TOP face brightest, LEFT face lit, RIGHT face in shadow
// =============================================================================

function drawCube() {
    const cx = W * 0.25;
    const cy = H * 0.25;
    const size = 100;
    const groundY = H * 0.25 + size * 1.05;
    
    const hue = 200; // Blue
    
    // SHADOW SYSTEM: contact + cast
    drawShadowSystem(cx, groundY, size * 0.5, size * 1.1, size * 0.35);
    
    // Isometric cube vertices
    const isoX = size * 0.866;
    const isoY = size * 0.5;
    
    const topFace = [
        { x: cx, y: cy - size * 0.7 },
        { x: cx + isoX, y: cy - size * 0.7 + isoY },
        { x: cx, y: cy - size * 0.7 + isoY * 2 },
        { x: cx - isoX, y: cy - size * 0.7 + isoY }
    ];
    
    const leftFace = [
        { x: cx - isoX, y: cy - size * 0.7 + isoY },
        { x: cx, y: cy - size * 0.7 + isoY * 2 },
        { x: cx, y: cy + size * 0.3 + isoY * 2 },
        { x: cx - isoX, y: cy + size * 0.3 + isoY }
    ];
    
    const rightFace = [
        { x: cx, y: cy - size * 0.7 + isoY * 2 },
        { x: cx + isoX, y: cy - size * 0.7 + isoY },
        { x: cx + isoX, y: cy + size * 0.3 + isoY },
        { x: cx, y: cy + size * 0.3 + isoY * 2 }
    ];
    
    // === RIGHT FACE (Shadow side) ===
    // Clear value separation: core shadow in middle, reflected light at bottom edge
    ctx.beginPath();
    ctx.moveTo(rightFace[0].x, rightFace[0].y);
    rightFace.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    
    const rightGrad = ctx.createLinearGradient(
        rightFace[0].x, rightFace[0].y,
        rightFace[3].x, rightFace[3].y
    );
    // Light → Halftone → CORE SHADOW (darkest) → Reflected light
    rightGrad.addColorStop(0.00, ColorUtils.hsl(hue, 40, 32));   // Top - some light spill
    rightGrad.addColorStop(0.25, ColorUtils.hsl(hue, 45, 24));   // Halftone
    rightGrad.addColorStop(0.50, ColorUtils.hsl(hue, 48, 18));   // CORE SHADOW (darkest!)
    rightGrad.addColorStop(0.75, ColorUtils.hsl(hue, 42, 22));   // Coming out of shadow
    rightGrad.addColorStop(1.00, ColorUtils.hsl(hue, 35, 32));   // Reflected/bounce light
    ctx.fillStyle = rightGrad;
    ctx.fill();
    
    // === LEFT FACE (Lit side) ===
    // Receives direct light - gradient from bright top to darker bottom (AO)
    ctx.beginPath();
    ctx.moveTo(leftFace[0].x, leftFace[0].y);
    leftFace.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    
    const leftGrad = ctx.createLinearGradient(
        leftFace[0].x, leftFace[0].y,
        leftFace[3].x, leftFace[3].y
    );
    leftGrad.addColorStop(0.00, ColorUtils.hsl(hue, 45, 65));   // Top - brightest
    leftGrad.addColorStop(0.30, ColorUtils.hsl(hue, 48, 58));   // Upper
    leftGrad.addColorStop(0.60, ColorUtils.hsl(hue, 50, 50));   // Mid - halftone
    leftGrad.addColorStop(0.85, ColorUtils.hsl(hue, 48, 42));   // Lower
    leftGrad.addColorStop(1.00, ColorUtils.hsl(hue, 45, 35));   // Bottom - AO darkening
    ctx.fillStyle = leftGrad;
    ctx.fill();
    
    // === TOP FACE (Highlight) ===
    // Brightest face - slight gradient roll-off toward edges
    ctx.beginPath();
    ctx.moveTo(topFace[0].x, topFace[0].y);
    topFace.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    
    // Gradient from upper-left (light source) to lower-right
    const topGrad = ctx.createLinearGradient(
        topFace[0].x, topFace[0].y,
        topFace[2].x, topFace[2].y
    );
    topGrad.addColorStop(0.00, ColorUtils.hsl(hue, 35, 78));   // Near light
    topGrad.addColorStop(0.30, ColorUtils.hsl(hue, 40, 72));   
    topGrad.addColorStop(0.60, ColorUtils.hsl(hue, 45, 65));   
    topGrad.addColorStop(1.00, ColorUtils.hsl(hue, 48, 58));   // Away from light
    ctx.fillStyle = topGrad;
    ctx.fill();
    
    // === AMBIENT OCCLUSION at edges ===
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    
    // AO where top meets right face (inner edge)
    const aoEdge1 = ctx.createLinearGradient(
        topFace[1].x, topFace[1].y,
        topFace[1].x - 12, topFace[1].y + 6
    );
    aoEdge1.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    aoEdge1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.strokeStyle = aoEdge1;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(topFace[1].x, topFace[1].y);
    ctx.lineTo(topFace[2].x, topFace[2].y);
    ctx.stroke();
    
    // AO where left meets right (vertical inner edge)
    const aoEdge2 = ctx.createLinearGradient(
        topFace[2].x - 8, topFace[2].y,
        topFace[2].x + 8, topFace[2].y
    );
    aoEdge2.addColorStop(0, 'rgba(0, 0, 0, 0)');
    aoEdge2.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    aoEdge2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.strokeStyle = aoEdge2;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(topFace[2].x, topFace[2].y);
    ctx.lineTo(rightFace[3].x, rightFace[3].y);
    ctx.stroke();
    ctx.restore();
    
    // === EDGE HIGHLIGHTS (light catching outer edges) ===
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(topFace[0].x, topFace[0].y);
    ctx.lineTo(topFace[3].x, topFace[3].y); // Top-left edge
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(topFace[3].x, topFace[3].y);
    ctx.lineTo(leftFace[3].x, leftFace[3].y); // Left vertical edge
    ctx.stroke();
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CUBE', cx, groundY + 25);
}

// =============================================================================
// CYLINDER (Top-Right Quadrant)
// =============================================================================
// CYLINDER (Top-Right Quadrant)
// Horizontal gradient: reflected light → core shadow → halftone → highlight → falloff
// =============================================================================

function drawCylinder() {
    const cx = W * 0.75;
    const cy = H * 0.25;
    const radiusX = 70;
    const radiusY = 25;
    const height = 160;
    const groundY = cy + height/2 + radiusY;
    
    const hue = 120; // Green
    
    // SHADOW SYSTEM: contact + cast
    drawShadowSystem(cx, groundY, radiusX * 0.6, radiusX * 1.3, radiusY * 1.2);
    
    // === BODY - True 5-value system ===
    // Light from upper-left hits the right side of cylinder
    const bodyGrad = ctx.createLinearGradient(cx - radiusX * 1.1, cy, cx + radiusX * 1.1, cy);
    
    // Left edge → Core shadow → Halftone → Light → Highlight → Falloff → Right edge
    bodyGrad.addColorStop(0.00, ColorUtils.hsl(hue, 35, 38));  // REFLECTED LIGHT (left edge)
    bodyGrad.addColorStop(0.08, ColorUtils.hsl(hue, 42, 28));  // Into shadow
    bodyGrad.addColorStop(0.18, ColorUtils.hsl(hue, 48, 20));  // CORE SHADOW (darkest!)
    bodyGrad.addColorStop(0.30, ColorUtils.hsl(hue, 45, 28));  // Coming out
    bodyGrad.addColorStop(0.45, ColorUtils.hsl(hue, 42, 42));  // HALFTONE (terminator)
    bodyGrad.addColorStop(0.60, ColorUtils.hsl(hue, 38, 55));  // LIGHT
    bodyGrad.addColorStop(0.72, ColorUtils.hsl(hue, 35, 65));  // Brighter
    bodyGrad.addColorStop(0.80, ColorUtils.hsl(hue, 32, 70));  // HIGHLIGHT zone
    bodyGrad.addColorStop(0.88, ColorUtils.hsl(hue, 35, 60));  // Falloff
    bodyGrad.addColorStop(0.96, ColorUtils.hsl(hue, 40, 45));  // Right edge (less lit)
    bodyGrad.addColorStop(1.00, ColorUtils.hsl(hue, 42, 40));
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - height/2, radiusX, radiusY, 0, Math.PI, 0);
    ctx.lineTo(cx + radiusX, cy + height/2);
    ctx.ellipse(cx, cy + height/2, radiusX, radiusY, 0, 0, Math.PI);
    ctx.lineTo(cx - radiusX, cy - height/2);
    ctx.closePath();
    ctx.fill();
    
    // === SPECULAR HIGHLIGHT (narrow band, not wide bloom) ===
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Tight specular band
    const specGrad = ctx.createLinearGradient(cx + radiusX * 0.6, cy, cx + radiusX * 0.85, cy);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    specGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    specGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.moveTo(cx + radiusX * 0.55, cy - height/2 + radiusY);
    ctx.lineTo(cx + radiusX * 0.9, cy - height/2 + radiusY);
    ctx.lineTo(cx + radiusX * 0.9, cy + height/2 - radiusY);
    ctx.lineTo(cx + radiusX * 0.55, cy + height/2 - radiusY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // === TOP ELLIPSE with directional gradient ===
    const topGrad = ctx.createLinearGradient(
        cx - radiusX, cy - height/2,
        cx + radiusX * 0.8, cy - height/2 + radiusY
    );
    topGrad.addColorStop(0.00, ColorUtils.hsl(hue, 32, 75));  // Near light (upper-left)
    topGrad.addColorStop(0.35, ColorUtils.hsl(hue, 38, 68));
    topGrad.addColorStop(0.65, ColorUtils.hsl(hue, 42, 60));
    topGrad.addColorStop(1.00, ColorUtils.hsl(hue, 45, 50));  // Away from light
    
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - height/2, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Top ellipse specular
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const topSpec = ctx.createRadialGradient(
        cx - radiusX * 0.35, cy - height/2 - radiusY * 0.1, 0,
        cx - radiusX * 0.35, cy - height/2, radiusX * 0.5
    );
    topSpec.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    topSpec.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    topSpec.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topSpec;
    ctx.beginPath();
    ctx.ellipse(cx - radiusX * 0.2, cy - height/2, radiusX * 0.5, radiusY * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // === RIM HIGHLIGHT on top edge ===
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy - height/2, radiusX, radiusY, 0, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CYLINDER', cx, groundY + 30);
}

// =============================================================================
// CONE (Bottom-Left Quadrant)
// =============================================================================

function drawCone() {
    const cx = W * 0.25;
    const cy = H * 0.75;
    const radiusX = 80;
    const radiusY = 25;
    const height = 180;
    const apexY = cy - height/2;
    const baseY = cy + height/2;
    const groundY = baseY + radiusY;
    
    const hue = 30; // Orange
    
    // SHADOW SYSTEM: contact + cast
    drawShadowSystem(cx, groundY, radiusX * 0.5, radiusX * 1.2, radiusY * 1.0);
    
    // === CONE BODY ===
    ctx.save();
    
    // Create cone clipping path
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(cx + radiusX, baseY);
    ctx.ellipse(cx, baseY, radiusX, radiusY, 0, 0, Math.PI);
    ctx.lineTo(cx, apexY);
    ctx.closePath();
    ctx.clip();
    
    // 5-value horizontal gradient
    const coneGrad = ctx.createLinearGradient(cx - radiusX * 1.1, cy, cx + radiusX * 1.1, cy);
    coneGrad.addColorStop(0.00, ColorUtils.hsl(hue, 40, 45));  // REFLECTED LIGHT
    coneGrad.addColorStop(0.10, ColorUtils.hsl(hue, 50, 32));  // Into shadow
    coneGrad.addColorStop(0.20, ColorUtils.hsl(hue, 58, 22));  // CORE SHADOW (darkest!)
    coneGrad.addColorStop(0.32, ColorUtils.hsl(hue, 52, 32));  // Coming out
    coneGrad.addColorStop(0.48, ColorUtils.hsl(hue, 48, 48));  // HALFTONE
    coneGrad.addColorStop(0.62, ColorUtils.hsl(hue, 42, 60));  // LIGHT
    coneGrad.addColorStop(0.75, ColorUtils.hsl(hue, 38, 70));  // Near highlight
    coneGrad.addColorStop(0.82, ColorUtils.hsl(hue, 35, 72));  // HIGHLIGHT
    coneGrad.addColorStop(0.90, ColorUtils.hsl(hue, 40, 62));  // Falloff
    coneGrad.addColorStop(1.00, ColorUtils.hsl(hue, 48, 48));  // Right edge
    
    ctx.fillStyle = coneGrad;
    ctx.fillRect(cx - radiusX, apexY, radiusX * 2, height + radiusY);
    ctx.restore();
    
    // === SPECULAR HIGHLIGHT (tapered band from apex) ===
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Create cone clip again for highlight
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(cx + radiusX, baseY);
    ctx.ellipse(cx, baseY, radiusX, radiusY, 0, 0, Math.PI);
    ctx.lineTo(cx, apexY);
    ctx.closePath();
    ctx.clip();
    
    // Tapered highlight - narrow at apex, wider at base
    const specGrad = ctx.createLinearGradient(cx + radiusX * 0.5, cy, cx + radiusX * 0.85, cy);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    specGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    specGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // Draw tapered shape
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.moveTo(cx + 3, apexY + 5);  // Near apex (narrow)
    ctx.lineTo(cx + radiusX * 0.7, baseY - radiusY * 0.3);  // Outer at base
    ctx.lineTo(cx + radiusX * 0.45, baseY - radiusY * 0.3); // Inner at base
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // === APEX SPECULAR (small, not glowy) ===
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const apexSpec = ctx.createRadialGradient(cx + 2, apexY + 8, 0, cx, apexY + 10, 12);
    apexSpec.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    apexSpec.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
    apexSpec.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = apexSpec;
    ctx.beginPath();
    ctx.arc(cx + 2, apexY + 8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // === BASE ELLIPSE ===
    const baseGrad = ctx.createLinearGradient(cx - radiusX, baseY, cx + radiusX, baseY);
    baseGrad.addColorStop(0.00, ColorUtils.hsl(hue, 45, 38));  // Left (shadow side)
    baseGrad.addColorStop(0.30, ColorUtils.hsl(hue, 50, 32));
    baseGrad.addColorStop(0.55, ColorUtils.hsl(hue, 48, 42));
    baseGrad.addColorStop(0.80, ColorUtils.hsl(hue, 42, 50));  // Right (lit)
    baseGrad.addColorStop(1.00, ColorUtils.hsl(hue, 45, 45));
    
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.ellipse(cx, baseY, radiusX, radiusY, 0, 0, Math.PI);
    ctx.fill();
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONE', cx, groundY + 30);
}

// =============================================================================
// TORUS (Bottom-Right Quadrant)
// =============================================================================
// TORUS (Bottom-Right Quadrant)
// Double curvature: tube cross-section shading + position on ring
// Inner hole needs deep AO
// =============================================================================

function drawTorus() {
    const cx = W * 0.75;
    const cy = H * 0.75;
    const majorRadius = 85;
    const minorRadius = 32;
    const groundY = cy + majorRadius * 0.45 + minorRadius;
    
    const hue = 320; // Magenta/Pink
    
    // SHADOW SYSTEM
    drawShadowSystem(cx, groundY, majorRadius * 0.6, majorRadius * 1.2, minorRadius * 0.8);
    
    const segments = 72;
    const tilt = 0.4;
    
    // === BACK HALF (in shadow, drawn first) ===
    for (let i = segments/2; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * majorRadius;
        const y1 = cy + Math.sin(angle) * majorRadius * tilt;
        
        // Light direction factor (upper-left light)
        const ringLight = (Math.cos(angle - Math.PI * 0.75) + 1) / 2;
        const depth = 0.45; // Back is darker
        const l = ringLight * depth;
        
        // Tube cross-section gradient - light comes from upper-left on each tube segment
        const segGrad = ctx.createRadialGradient(
            x1 - minorRadius * 0.4, y1 - minorRadius * 0.4, 0,
            x1, y1, minorRadius
        );
        
        // 5-value on tube: highlight → light → halftone → core shadow → reflected
        segGrad.addColorStop(0.00, ColorUtils.hsl(hue, 35, 32 + l * 20));  // Highlight
        segGrad.addColorStop(0.20, ColorUtils.hsl(hue, 42, 26 + l * 15));  // Light
        segGrad.addColorStop(0.45, ColorUtils.hsl(hue, 48, 18 + l * 10));  // Core shadow
        segGrad.addColorStop(0.70, ColorUtils.hsl(hue, 45, 20 + l * 12));  // Coming out
        segGrad.addColorStop(1.00, ColorUtils.hsl(hue, 38, 26 + l * 14));  // Reflected
        
        ctx.fillStyle = segGrad;
        ctx.beginPath();
        ctx.arc(x1, y1, minorRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // === INNER HOLE OCCLUSION (very dark!) ===
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const innerAO = ctx.createRadialGradient(
        cx, cy, majorRadius * 0.3,
        cx, cy, majorRadius + minorRadius * 0.2
    );
    innerAO.addColorStop(0, 'rgba(0, 0, 0, 0.75)');  // Deep in the hole
    innerAO.addColorStop(0.4, 'rgba(0, 0, 0, 0.5)');
    innerAO.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    innerAO.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = innerAO;
    ctx.beginPath();
    ctx.ellipse(cx, cy, majorRadius * 0.9, majorRadius * 0.9 * tilt, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // === FRONT HALF (fully lit) ===
    for (let i = 0; i < segments/2; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * majorRadius;
        const y1 = cy + Math.sin(angle) * majorRadius * tilt;
        
        // Combined lighting: position on ring + facing direction
        const ringLight = (Math.cos(angle - Math.PI * 0.75) + 1) / 2;
        const topLight = (-Math.sin(angle) + 1) / 2;
        const light = ringLight * 0.65 + topLight * 0.35;
        
        const segGrad = ctx.createRadialGradient(
            x1 - minorRadius * 0.4, y1 - minorRadius * 0.4, 0,
            x1, y1, minorRadius
        );
        
        // 5-value system with position-based intensity
        segGrad.addColorStop(0.00, ColorUtils.hsl(hue, 30, Math.min(82, 48 + light * 38))); // Highlight
        segGrad.addColorStop(0.18, ColorUtils.hsl(hue, 38, 42 + light * 28));               // Light
        segGrad.addColorStop(0.40, ColorUtils.hsl(hue, 45, 32 + light * 18));               // Halftone
        segGrad.addColorStop(0.60, ColorUtils.hsl(hue, 50, 22 + light * 12));               // CORE SHADOW
        segGrad.addColorStop(0.80, ColorUtils.hsl(hue, 45, 28 + light * 15));               // Coming out
        segGrad.addColorStop(1.00, ColorUtils.hsl(hue, 38, 35 + light * 18));               // Reflected
        
        ctx.fillStyle = segGrad;
        ctx.beginPath();
        ctx.arc(x1, y1, minorRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // === SPECULAR HIGHLIGHTS (tight bands following tube) ===
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Highlight wrapping around upper-left arc
    for (let i = 3; i < 12; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * majorRadius;
        const y1 = cy + Math.sin(angle) * majorRadius * tilt;
        const intensity = Math.max(0, 1 - Math.abs(i - 7) / 5);
        
        if (intensity > 0.1) {
            const specGrad = ctx.createRadialGradient(
                x1 - minorRadius * 0.45, y1 - minorRadius * 0.45, 0,
                x1 - minorRadius * 0.2, y1 - minorRadius * 0.2, minorRadius * 0.5
            );
            specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.55 * intensity})`);
            specGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.2 * intensity})`);
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = specGrad;
            ctx.beginPath();
            ctx.ellipse(x1 - minorRadius * 0.3, y1 - minorRadius * 0.3, 
                       minorRadius * 0.4, minorRadius * 0.25, angle - 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
    
    // === INNER RIM DARKENING (where tube curves into hole) ===
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * (majorRadius - minorRadius * 0.7);
        const y1 = cy + Math.sin(angle) * (majorRadius - minorRadius * 0.7) * tilt;
        
        const innerGrad = ctx.createRadialGradient(x1, y1, 0, x1, y1, minorRadius * 0.6);
        innerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(x1, y1, minorRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TORUS', cx, groundY + 35);
}

// =============================================================================
// LABELS
// =============================================================================

function drawLabels() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Light Source: Upper-Left', W/2, 25);
    
    // Light direction indicator
    ctx.save();
    ctx.translate(W - 50, 50);
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, -20);
    ctx.stroke();
    
    // Arrowhead
    ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-20, -20);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-18, -14);
    ctx.closePath();
    ctx.fill();
    
    // Sun symbol
    ctx.beginPath();
    ctx.arc(-25, -25, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
    ctx.fill();
    ctx.restore();
}

// =============================================================================
// MAIN RENDER
// =============================================================================

function render() {
    console.log('Shape Study - Rendering 4 primitives with 5-value lighting...');
    
    drawBackground();
    drawCube();
    drawCylinder();
    drawCone();
    drawTorus();
    drawLabels();
    
    console.log('Shape Study - Complete');
    console.log('Cube: Flat planes with sharp value transitions');
    console.log('Cylinder: Horizontal gradient + lit top');
    console.log('Cone: Converging gradient toward apex');
    console.log('Torus: Double curvature with self-occlusion');
}

// Run
render();
