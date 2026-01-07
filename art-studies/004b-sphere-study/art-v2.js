// ============================================================================
// SPHERE STUDY V2 - PUSHING TOWARD PHOTOREALISM
// ============================================================================
// 
// V2 IMPROVEMENTS:
// 1. More gradient stops (12-15 vs 5-6) for smoother transitions
// 2. Wider, softer terminator zone
// 3. Elliptical/shaped highlights (not perfect circles)
// 4. Multiple layered passes for blur simulation
// 5. Environment reflection hints
// 6. Chromatic aberration for glass
// 
// TWO SPHERES:
// - Left: Glossy Purple (improved from V1 advanced)
// - Right: Glass (improved from V1 photorealistic)
// 
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// =============================================================================
// COLOR UTILITIES
// =============================================================================

const ColorUtils = {
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },
    
    hsl(h, s, l) {
        return `hsl(${h}, ${s}%, ${l}%)`;
    },
    
    hsla(h, s, l, a) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    },
    
    rgba(r, g, b, a) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
};

// =============================================================================
// BACKGROUND
// =============================================================================

function drawBackground() {
    // Gradient background for depth
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#4a4a4a');
    bgGrad.addColorStop(0.5, '#3a3a3a');
    bgGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    
    // Ground plane
    const groundY = H * 0.72;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, '#3d3d3d');
    groundGrad.addColorStop(0.3, '#353535');
    groundGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);
    
    // Subtle horizon line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
}

// =============================================================================
// GLOSSY PURPLE SPHERE V2
// =============================================================================

function drawGlossyPurpleSphere() {
    const cx = W * 0.28;
    const cy = H * 0.45;
    const radius = 150;
    const groundY = H * 0.72;
    
    const hue = 275;  // Purple
    const groundHue = 35;  // Warm ground reflection
    
    // Light direction
    const lightX = -0.38;
    const lightY = -0.38;
    
    // --- LAYER 1: GROUND SHADOW ---
    // Light from upper-left = shadow cast toward lower-right
    drawEllipticalShadow(cx + radius * 0.5, groundY + 3, radius * 1.4, radius * 0.2, 0.5);
    
    // --- LAYER 2: CONTACT SHADOW (AO) ---
    // Slightly offset toward shadow side (lower-right)
    const contactGrad = ctx.createRadialGradient(cx + radius * 0.2, groundY, 0, cx + radius * 0.2, groundY, radius * 0.45);
    contactGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    contactGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.4)');
    contactGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    contactGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(cx + radius * 0.2, groundY, radius * 0.5, radius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 3: BASE DIFFUSE (12+ stops for smooth gradient) ---
    const diffuseGrad = ctx.createRadialGradient(
        cx + radius * lightX,
        cy + radius * lightY,
        radius * 0.02,
        cx, cy, radius
    );
    
    // 12 stops for buttery smooth transition
    diffuseGrad.addColorStop(0.00, ColorUtils.hsl(hue, 25, 85));   // Highlight area
    diffuseGrad.addColorStop(0.05, ColorUtils.hsl(hue, 30, 78));
    diffuseGrad.addColorStop(0.10, ColorUtils.hsl(hue, 38, 68));   // Light
    diffuseGrad.addColorStop(0.18, ColorUtils.hsl(hue, 45, 58));
    diffuseGrad.addColorStop(0.28, ColorUtils.hsl(hue, 50, 48));   // Start of halftone
    diffuseGrad.addColorStop(0.38, ColorUtils.hsl(hue, 55, 40));   // TERMINATOR - wide zone
    diffuseGrad.addColorStop(0.48, ColorUtils.hsl(hue, 58, 32));   // TERMINATOR continues
    diffuseGrad.addColorStop(0.58, ColorUtils.hsl(hue, 60, 24));   // Core shadow begins
    diffuseGrad.addColorStop(0.70, ColorUtils.hsl(hue, 58, 18));   // CORE SHADOW (darkest)
    diffuseGrad.addColorStop(0.82, ColorUtils.hsl(hue, 52, 22));   // Reflected light begins
    diffuseGrad.addColorStop(0.92, ColorUtils.hsl(hue, 45, 28));   // Reflected light
    diffuseGrad.addColorStop(1.00, ColorUtils.hsl(hue, 48, 25));   // Edge
    
    ctx.fillStyle = diffuseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 4: SOFT TERMINATOR ENHANCEMENT ---
    // Extra pass to make terminator zone softer
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const terminatorGrad = ctx.createRadialGradient(
        cx + radius * lightX * 0.5,
        cy + radius * lightY * 0.5,
        radius * 0.3,
        cx, cy, radius
    );
    terminatorGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    terminatorGrad.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    terminatorGrad.addColorStop(0.55, 'rgba(200, 180, 220, 0.95)');
    terminatorGrad.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
    terminatorGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');
    ctx.fillStyle = terminatorGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 5: ELLIPTICAL SPECULAR HIGHLIGHT ---
    // Not a perfect circle - slightly elongated
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const specX = cx + radius * lightX * 0.75;
    const specY = cy + radius * lightY * 0.75;
    
    // Main sharp specular (elliptical)
    ctx.save();
    ctx.translate(specX, specY);
    ctx.rotate(-0.4);  // Slight rotation for natural look
    ctx.scale(1, 0.7);  // Flatten to ellipse
    
    const specGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.12);
    specGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
    specGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0.85)');
    specGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.5)');
    specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    specGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Secondary bloom around specular
    const bloomGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, radius * 0.35);
    bloomGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.35)');
    bloomGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
    bloomGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
    bloomGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(specX, specY, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // --- LAYER 6: FRESNEL RIM ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Stronger on shadow side
    const fresnelGrad = ctx.createRadialGradient(
        cx - radius * 0.15, cy - radius * 0.15,
        radius * 0.7,
        cx, cy, radius
    );
    fresnelGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    fresnelGrad.addColorStop(0.6, 'rgba(220, 200, 255, 0.02)');
    fresnelGrad.addColorStop(0.8, 'rgba(220, 200, 255, 0.1)');
    fresnelGrad.addColorStop(0.92, 'rgba(220, 200, 255, 0.2)');
    fresnelGrad.addColorStop(1.0, 'rgba(220, 200, 255, 0.3)');
    
    ctx.fillStyle = fresnelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 7: REFLECTED GROUND COLOR ---
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const reflectGrad = ctx.createRadialGradient(
        cx, cy + radius * 0.55, 0,
        cx, cy + radius * 0.55, radius * 0.55
    );
    reflectGrad.addColorStop(0, ColorUtils.hsla(groundHue, 45, 45, 0.25));
    reflectGrad.addColorStop(0.5, ColorUtils.hsla(groundHue, 35, 40, 0.1));
    reflectGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = reflectGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 8: SUBTLE SURFACE VARIATION ---
    // Very subtle noise-like variation to break up perfect smoothness
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.03;
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + 0.3;
        const dist = radius * (0.3 + Math.sin(i * 2.5) * 0.2);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const size = radius * (0.15 + Math.sin(i * 1.7) * 0.08);
        
        const varGrad = ctx.createRadialGradient(px, py, 0, px, py, size);
        varGrad.addColorStop(0, i % 2 === 0 ? 'white' : 'black');
        varGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = varGrad;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// =============================================================================
// GLASS SPHERE V2
// =============================================================================

function drawGlassSphere() {
    const cx = W * 0.72;
    const cy = H * 0.45;
    const radius = 150;
    const groundY = H * 0.72;
    
    // --- LAYER 1: CAUSTIC (Concentrated light through sphere) ---
    // Caustic appears on the OPPOSITE side from light - light passes through
    // Light from upper-left, so caustic projects to lower-right
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const causticX = cx + radius * 0.6;
    const causticY = groundY + 5;
    
    // Inner bright core
    const causticCore = ctx.createRadialGradient(
        causticX, causticY, 0,
        causticX, causticY, radius * 0.25
    );
    causticCore.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
    causticCore.addColorStop(0.3, 'rgba(255, 255, 220, 0.6)');
    causticCore.addColorStop(0.6, 'rgba(255, 255, 200, 0.3)');
    causticCore.addColorStop(1, 'rgba(255, 255, 180, 0)');
    
    ctx.fillStyle = causticCore;
    ctx.beginPath();
    ctx.ellipse(causticX, causticY, radius * 0.3, radius * 0.1, 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer caustic bloom
    const causticBloom = ctx.createRadialGradient(
        causticX, causticY, 0,
        causticX, causticY, radius * 0.6
    );
    causticBloom.addColorStop(0, 'rgba(255, 255, 220, 0.4)');
    causticBloom.addColorStop(0.4, 'rgba(255, 255, 200, 0.15)');
    causticBloom.addColorStop(1, 'rgba(255, 255, 180, 0)');
    
    ctx.fillStyle = causticBloom;
    ctx.beginPath();
    ctx.ellipse(causticX, causticY, radius * 0.7, radius * 0.2, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 2: SOFT SHADOW (glass shadows are subtle) ---
    // Shadow offset to lower-right since light comes from upper-left
    ctx.save();
    ctx.globalAlpha = 0.3;
    drawEllipticalShadow(cx + radius * 0.35, groundY + 5, radius * 0.9, radius * 0.12, 0.4);
    ctx.restore();
    
    // --- LAYER 3: GLASS BODY BASE ---
    // Very subtle - glass is mostly transparent
    const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.25, cy - radius * 0.25, 0,
        cx, cy, radius
    );
    
    bodyGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.02)');
    bodyGrad.addColorStop(0.2, 'rgba(230, 240, 255, 0.03)');
    bodyGrad.addColorStop(0.4, 'rgba(210, 225, 250, 0.05)');
    bodyGrad.addColorStop(0.6, 'rgba(190, 210, 245, 0.07)');
    bodyGrad.addColorStop(0.8, 'rgba(170, 195, 240, 0.1)');
    bodyGrad.addColorStop(1.0, 'rgba(150, 180, 230, 0.15)');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 4: INTERNAL REFLECTION (Shadow side - key glass tell!) ---
    // Light passes through and concentrates on opposite side
    const internalX = cx + radius * 0.38;
    const internalY = cy + radius * 0.32;
    
    // Main internal reflection
    const internalGrad = ctx.createRadialGradient(
        internalX, internalY, 0,
        internalX, internalY, radius * 0.45
    );
    internalGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
    internalGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.35)');
    internalGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.15)');
    internalGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    internalGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = internalGrad;
    ctx.beginPath();
    ctx.arc(internalX, internalY, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary internal reflection (smaller, offset)
    const internal2X = cx + radius * 0.25;
    const internal2Y = cy + radius * 0.45;
    const internal2Grad = ctx.createRadialGradient(
        internal2X, internal2Y, 0,
        internal2X, internal2Y, radius * 0.25
    );
    internal2Grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    internal2Grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    internal2Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = internal2Grad;
    ctx.beginPath();
    ctx.arc(internal2X, internal2Y, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 5: ENVIRONMENT REFLECTION HINTS ---
    // Subtle distorted "world" reflection on surface
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.08;
    
    // Horizon line reflection (distorted)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + radius * 0.1, radius * 0.7, radius * 0.15, 0, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    
    // "Sky" reflection at top
    const skyReflectGrad = ctx.createRadialGradient(
        cx, cy - radius * 0.3, 0,
        cx, cy - radius * 0.3, radius * 0.5
    );
    skyReflectGrad.addColorStop(0, 'rgba(200, 220, 255, 0.5)');
    skyReflectGrad.addColorStop(0.5, 'rgba(180, 200, 240, 0.2)');
    skyReflectGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = skyReflectGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - radius * 0.25, radius * 0.5, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // --- LAYER 6: PRIMARY SPECULAR (front surface) ---
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const specX = cx - radius * 0.42;
    const specY = cy - radius * 0.42;
    
    // Sharp specular core
    const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, radius * 0.1);
    specGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    specGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    specGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(specX, specY, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Specular bloom
    const specBloom = ctx.createRadialGradient(specX, specY, 0, specX, specY, radius * 0.25);
    specBloom.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    specBloom.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    specBloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specBloom;
    ctx.beginPath();
    ctx.arc(specX, specY, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // --- LAYER 7: STRONG FRESNEL RIM ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const fresnelGrad = ctx.createRadialGradient(cx, cy, radius * 0.65, cx, cy, radius);
    fresnelGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    fresnelGrad.addColorStop(0.4, 'rgba(230, 240, 255, 0.05)');
    fresnelGrad.addColorStop(0.7, 'rgba(220, 235, 255, 0.2)');
    fresnelGrad.addColorStop(0.88, 'rgba(210, 230, 255, 0.4)');
    fresnelGrad.addColorStop(1.0, 'rgba(200, 225, 255, 0.55)');
    
    ctx.fillStyle = fresnelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 8: CHROMATIC ABERRATION HINT ---
    // Slight color separation at edges (glass refracts colors differently)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    
    // Red/warm on one side
    ctx.strokeStyle = 'rgba(255, 200, 180, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, radius - 2, Math.PI * 0.6, Math.PI * 1.2);
    ctx.stroke();
    
    // Blue/cool on other side
    ctx.strokeStyle = 'rgba(180, 200, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 1, radius - 2, Math.PI * 1.6, Math.PI * 2.2);
    ctx.stroke();
    
    ctx.restore();
    
    // --- LAYER 9: EDGE DEFINITION ---
    // Outer edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner refraction edge (double-rim effect)
    ctx.strokeStyle = 'rgba(220, 235, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Very faint third rim (deep refraction)
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // --- LAYER 10: GROUND REFLECTION IN SPHERE ---
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.1;
    
    const groundReflectGrad = ctx.createLinearGradient(cx, cy + radius * 0.3, cx, cy + radius);
    groundReflectGrad.addColorStop(0, 'transparent');
    groundReflectGrad.addColorStop(0.5, 'rgba(80, 80, 80, 0.3)');
    groundReflectGrad.addColorStop(1, 'rgba(60, 60, 60, 0.5)');
    
    ctx.fillStyle = groundReflectGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function drawEllipticalShadow(cx, cy, width, height, opacity) {
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width);
    shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
    shadowGrad.addColorStop(0.4, `rgba(0, 0, 0, ${opacity * 0.5})`);
    shadowGrad.addColorStop(0.7, `rgba(0, 0, 0, ${opacity * 0.2})`);
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.translate(cx, cy);
    ctx.scale(1, height / width);
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, width, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// =============================================================================
// LABELS
// =============================================================================

function drawLabels() {
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    
    ctx.fillText('GLOSSY (Purple)', W * 0.28, H * 0.92);
    ctx.fillText('GLASS', W * 0.72, H * 0.92);
}

// =============================================================================
// MAIN RENDER
// =============================================================================

function render() {
    console.log('Sphere Study V2 - Rendering improved spheres...');
    
    drawBackground();
    drawGlossyPurpleSphere();
    drawGlassSphere();
    drawLabels();
    
    console.log('Sphere Study V2 - Complete');
    console.log('Glossy: 12+ gradient stops, elliptical highlight, surface variation');
    console.log('Glass: 15+ layers, caustic bloom, chromatic aberration, triple rim');
}

// Run
render();
