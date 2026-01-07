// ============================================================================
// PROGRESSIVE SPHERE STUDY - Mastering 3D Form
// ============================================================================
// 
// PURPOSE: Master fundamental lighting/shading that applies to EVERYTHING
// 
// RESEARCH SOURCES:
// - LearnOpenGL: Phong lighting model (ambient + diffuse + specular)
// - Scratchapixel: Spherical light & inverse-square falloff
// - Internal Bible: 10-ART_FUNDAMENTALS.md (5-value system)
// - Internal Bible: 12-EDGE_MASTERY.md (soft edges, value bridging)
// 
// KEY CONCEPTS FROM RESEARCH:
// 
// 1. PHONG MODEL COMPONENTS:
//    - Ambient: Constant base illumination (prevents pure black)
//    - Diffuse: Brightness based on surface angle to light (dot product)
//    - Specular: Bright spot based on reflection angle to viewer
// 
// 2. SPHERE-SPECIFIC LIGHTING:
//    - Terminator line: Where light meets shadow (the halftone zone)
//    - Core shadow: Darkest area (NOT the edge - that has reflected light)
//    - Reflected light: Bounce from ground/environment, lighter than core
// 
// 3. FRESNEL EFFECT:
//    - Edges facing away appear brighter (glancing angles reflect more)
//    - Critical for glass, metal, glossy surfaces
// 
// 4. GLASS OPTICS:
//    - Internal reflection: Bright spot on SHADOW side (inverted!)
//    - Caustics: Focused light through sphere onto ground
//    - Transparency with environment tinting
// 
// ============================================================================

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// Quadrant dimensions
const QW = W / 2;  // 600
const QH = H / 2;  // 400

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
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },
    
    withAlpha(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },
    
    lighten(hex, percent) {
        const rgb = this.hexToRgb(hex);
        const factor = percent / 100;
        return this.rgbToHex(
            rgb.r + (255 - rgb.r) * factor,
            rgb.g + (255 - rgb.g) * factor,
            rgb.b + (255 - rgb.b) * factor
        );
    },
    
    darken(hex, percent) {
        const rgb = this.hexToRgb(hex);
        const factor = 1 - percent / 100;
        return this.rgbToHex(
            rgb.r * factor,
            rgb.g * factor,
            rgb.b * factor
        );
    },
    
    // HSL for more control
    hsl(h, s, l) {
        return `hsl(${h}, ${s}%, ${l}%)`;
    },
    
    hsla(h, s, l, a) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }
};

// =============================================================================
// BACKGROUND & GRID
// =============================================================================

function drawBackground() {
    // Neutral gray background - not white (need to see highlights)
    // not black (need to see shadows)
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 0, W, H);
    
    // Subtle grid lines dividing quadrants
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    // Vertical divider
    ctx.beginPath();
    ctx.moveTo(QW, 0);
    ctx.lineTo(QW, H);
    ctx.stroke();
    
    // Horizontal divider
    ctx.beginPath();
    ctx.moveTo(0, QH);
    ctx.lineTo(W, QH);
    ctx.stroke();
    
    // Labels
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';
    
    ctx.fillText('1. BASIC - 5-Value System', 20, 30);
    ctx.fillText('2. INTERMEDIATE - Environment', QW + 20, 30);
    ctx.fillText('3. ADVANCED - Material (Glossy)', 20, QH + 30);
    ctx.fillText('4. PHOTOREALISTIC - Glass', QW + 20, QH + 30);
}

// =============================================================================
// SPHERE 1: BASIC - The 5-Value System
// =============================================================================
// 
// From ART_FUNDAMENTALS.md:
// 1. Highlight (lightest - where light hits directly)
// 2. Light (general lit area)
// 3. Halftone (transition zone - THE TERMINATOR LINE)
// 4. Core Shadow (darkest on the form itself)
// 5. Reflected Light (bounce light - lighter than core shadow!)
//
// Key technique: Offset the gradient center toward light source
// This creates the illusion of 3D form
// =============================================================================

function drawBasicSphere() {
    const cx = QW / 2;      // Center of quadrant 1
    const cy = QH / 2;
    const radius = 120;
    
    // Light direction: upper-left
    // Offset gradient center toward light for 3D illusion
    const lightOffsetX = -0.35;
    const lightOffsetY = -0.35;
    
    // Base hue: neutral blue-gray (shows values clearly)
    const hue = 210;
    
    // Main form gradient with 5-value system
    const grad = ctx.createRadialGradient(
        cx + radius * lightOffsetX,  // Offset toward light
        cy + radius * lightOffsetY,
        radius * 0.05,               // Tiny inner radius for highlight
        cx, cy, radius               // Full sphere
    );
    
    // 5-VALUE STOPS (critical ordering!)
    // Research: Core shadow is darkest, NOT the edge!
    grad.addColorStop(0.00, ColorUtils.hsl(hue, 15, 95));  // 1. HIGHLIGHT - nearly white
    grad.addColorStop(0.10, ColorUtils.hsl(hue, 25, 75));  // 2. LIGHT - bright
    grad.addColorStop(0.35, ColorUtils.hsl(hue, 35, 55));  // 3. HALFTONE - mid (terminator)
    grad.addColorStop(0.65, ColorUtils.hsl(hue, 40, 25));  // 4. CORE SHADOW - darkest!
    grad.addColorStop(0.85, ColorUtils.hsl(hue, 35, 35));  // 5. REFLECTED LIGHT - lighter than core!
    grad.addColorStop(1.00, ColorUtils.hsl(hue, 40, 30));  // Edge (slightly darker than reflected)
    
    // Draw the sphere
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
}

// =============================================================================
// SPHERE 2: INTERMEDIATE - Environment Grounding
// =============================================================================
// 
// New concepts:
// - Ground shadow (elliptical, soft edges)
// - Contact shadow (AO - darkest at touch point)
// - Reflected color from ground
// - Ambient occlusion at base
//
// From research: Objects in space look floating without ground interaction
// =============================================================================

function drawIntermediateSphere() {
    const cx = QW + QW / 2;  // Center of quadrant 2
    const cy = QH / 2;
    const radius = 120;
    
    // Ground plane Y position (sphere sits on this)
    const groundY = cy + radius;
    
    // Hue: warm orange (shows reflected color interaction)
    const hue = 30;
    const groundHue = 120;  // Green ground for contrast
    
    // --- LAYER 1: GROUND PLANE ---
    // Simple surface for sphere to sit on
    const groundGrad = ctx.createLinearGradient(QW, groundY - 30, QW, QH);
    groundGrad.addColorStop(0, ColorUtils.hsl(groundHue, 20, 35));
    groundGrad.addColorStop(1, ColorUtils.hsl(groundHue, 25, 25));
    ctx.fillStyle = groundGrad;
    ctx.fillRect(QW, groundY - 5, QW, QH - groundY + 5);
    
    // --- LAYER 2: GROUND SHADOW ---
    // Elliptical, soft-edged, offset from light
    ctx.save();
    const shadowOffsetX = radius * 0.3;  // Shadow cast away from light
    const shadowY = groundY + 2;
    
    const shadowGrad = ctx.createRadialGradient(
        cx + shadowOffsetX, shadowY, 0,
        cx + shadowOffsetX, shadowY, radius * 1.2
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.25)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // Scale to ellipse
    ctx.translate(cx + shadowOffsetX, shadowY);
    ctx.scale(1.3, 0.25);
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 3: CONTACT SHADOW (Ambient Occlusion) ---
    // Darkest at the exact contact point
    const contactGrad = ctx.createRadialGradient(
        cx, groundY, 0,
        cx, groundY, radius * 0.4
    );
    contactGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    contactGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    contactGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(cx, groundY, radius * 0.5, radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 4: MAIN SPHERE (5-value system) ---
    const lightOffsetX = -0.35;
    const lightOffsetY = -0.35;
    
    const mainGrad = ctx.createRadialGradient(
        cx + radius * lightOffsetX,
        cy + radius * lightOffsetY,
        radius * 0.05,
        cx, cy, radius
    );
    
    mainGrad.addColorStop(0.00, ColorUtils.hsl(hue, 20, 95));
    mainGrad.addColorStop(0.10, ColorUtils.hsl(hue, 40, 70));
    mainGrad.addColorStop(0.35, ColorUtils.hsl(hue, 50, 50));
    mainGrad.addColorStop(0.65, ColorUtils.hsl(hue, 55, 25));
    mainGrad.addColorStop(0.85, ColorUtils.hsl(hue, 45, 35));
    mainGrad.addColorStop(1.00, ColorUtils.hsl(hue, 50, 30));
    
    ctx.fillStyle = mainGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 5: REFLECTED GROUND COLOR ---
    // Green from ground bounces onto bottom of sphere
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    
    const reflectGrad = ctx.createRadialGradient(
        cx, cy + radius * 0.6, 0,
        cx, cy + radius * 0.6, radius * 0.6
    );
    reflectGrad.addColorStop(0, ColorUtils.hsla(groundHue, 40, 40, 0.3));
    reflectGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = reflectGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// =============================================================================
// SPHERE 3: ADVANCED - Material (Glossy with Specular + Fresnel)
// =============================================================================
// 
// New concepts from Phong model:
// - Separate specular highlight (sharp, small, bright)
// - Diffuse underneath (soft, broad)
// - Fresnel effect: edges brighter at glancing angles
// - Multiple compositing passes
//
// From LearnOpenGL: specular = pow(max(dot(viewDir, reflectDir), 0.0), shininess)
// Higher shininess = smaller, sharper highlight
// =============================================================================

function drawAdvancedSphere() {
    const cx = QW / 2;       // Center of quadrant 3
    const cy = QH + QH / 2;
    const radius = 120;
    
    // Ground plane
    const groundY = cy + radius;
    const hue = 280;  // Purple - looks great glossy
    const groundHue = 40;  // Warm ground
    
    // --- LAYER 1: GROUND PLANE ---
    const groundGrad = ctx.createLinearGradient(0, groundY - 30, 0, H);
    groundGrad.addColorStop(0, ColorUtils.hsl(groundHue, 15, 40));
    groundGrad.addColorStop(1, ColorUtils.hsl(groundHue, 20, 30));
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY - 5, QW, H - groundY + 5);
    
    // --- LAYER 2: SHADOW (same as intermediate) ---
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(
        cx + radius * 0.25, groundY + 2, 0,
        cx + radius * 0.25, groundY + 2, radius * 1.1
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.translate(cx + radius * 0.25, groundY + 2);
    ctx.scale(1.2, 0.2);
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Contact shadow
    const contactGrad = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, radius * 0.35);
    contactGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    contactGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(cx, groundY, radius * 0.45, radius * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 3: BASE DIFFUSE (darker, specular will add brightness) ---
    const lightOffsetX = -0.35;
    const lightOffsetY = -0.35;
    
    const diffuseGrad = ctx.createRadialGradient(
        cx + radius * lightOffsetX,
        cy + radius * lightOffsetY,
        radius * 0.1,
        cx, cy, radius
    );
    
    // Slightly darker base - specular will brighten
    diffuseGrad.addColorStop(0.00, ColorUtils.hsl(hue, 30, 70));
    diffuseGrad.addColorStop(0.15, ColorUtils.hsl(hue, 45, 55));
    diffuseGrad.addColorStop(0.40, ColorUtils.hsl(hue, 55, 40));
    diffuseGrad.addColorStop(0.70, ColorUtils.hsl(hue, 60, 20));
    diffuseGrad.addColorStop(0.90, ColorUtils.hsl(hue, 50, 28));
    diffuseGrad.addColorStop(1.00, ColorUtils.hsl(hue, 55, 25));
    
    ctx.fillStyle = diffuseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 4: SPECULAR HIGHLIGHT (Sharp, small, white) ---
    // From Phong: This is the "shiny spot" - viewer-dependent
    // For static image, position it near the light direction
    ctx.save();
    ctx.globalCompositeOperation = 'screen';  // Additive blending
    
    const specX = cx + radius * lightOffsetX * 0.8;
    const specY = cy + radius * lightOffsetY * 0.8;
    const specRadius = radius * 0.12;  // Small for glossy
    
    // Sharp falloff = high "shininess"
    const specGrad = ctx.createRadialGradient(
        specX, specY, 0,
        specX, specY, specRadius
    );
    specGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    specGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
    specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    specGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(specX, specY, specRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary softer highlight (broader diffuse highlight)
    const softSpecGrad = ctx.createRadialGradient(
        specX + radius * 0.05, specY + radius * 0.05, 0,
        specX + radius * 0.05, specY + radius * 0.05, radius * 0.35
    );
    softSpecGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.3)');
    softSpecGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    softSpecGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = softSpecGrad;
    ctx.beginPath();
    ctx.arc(specX + radius * 0.05, specY + radius * 0.05, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // --- LAYER 5: FRESNEL RIM ---
    // Edges appear brighter at glancing angles
    // Stronger on shadow side for glossy materials
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const fresnelGrad = ctx.createRadialGradient(
        cx, cy, radius * 0.75,
        cx, cy, radius
    );
    fresnelGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    fresnelGrad.addColorStop(0.7, 'rgba(200, 210, 255, 0.05)');
    fresnelGrad.addColorStop(0.9, 'rgba(200, 210, 255, 0.15)');
    fresnelGrad.addColorStop(1.0, 'rgba(200, 210, 255, 0.25)');
    
    ctx.fillStyle = fresnelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 6: REFLECTED GROUND COLOR ---
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const reflectGrad = ctx.createRadialGradient(
        cx, cy + radius * 0.5, 0,
        cx, cy + radius * 0.5, radius * 0.5
    );
    reflectGrad.addColorStop(0, ColorUtils.hsla(groundHue, 50, 50, 0.2));
    reflectGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = reflectGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// =============================================================================
// SPHERE 4: PHOTOREALISTIC - Glass
// =============================================================================
// 
// New concepts:
// - INTERNAL REFLECTION: Bright spot on SHADOW side (light passes through!)
// - CAUSTICS: Focused light through sphere creates bright spot on ground
// - High transparency with environment showing through
// - Strong Fresnel (glass reflects a lot at edges)
// - Double specular (front surface + internal)
//
// From Scratchapixel: Glass bends light, creating inverted internal effects
// =============================================================================

function drawPhotorealisticSphere() {
    const cx = QW + QW / 2;  // Center of quadrant 4
    const cy = QH + QH / 2;
    const radius = 120;
    
    const groundY = cy + radius;
    
    // --- LAYER 1: GROUND PLANE ---
    const groundGrad = ctx.createLinearGradient(QW, groundY - 30, QW, H);
    groundGrad.addColorStop(0, '#4a4a4a');
    groundGrad.addColorStop(1, '#353535');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(QW, groundY - 5, QW, H - groundY + 5);
    
    // --- LAYER 2: CAUSTIC (Light focused through sphere) ---
    // This is the key "glass tell" - light concentrates on shadow side of ground
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const causticX = cx + radius * 0.5;  // Offset toward shadow side
    const causticY = groundY + 5;
    
    const causticGrad = ctx.createRadialGradient(
        causticX, causticY, 0,
        causticX, causticY, radius * 0.6
    );
    causticGrad.addColorStop(0, 'rgba(255, 255, 230, 0.7)');
    causticGrad.addColorStop(0.3, 'rgba(255, 255, 200, 0.4)');
    causticGrad.addColorStop(0.6, 'rgba(255, 255, 180, 0.15)');
    causticGrad.addColorStop(1, 'rgba(255, 255, 150, 0)');
    
    ctx.fillStyle = causticGrad;
    ctx.beginPath();
    ctx.ellipse(causticX, causticY, radius * 0.7, radius * 0.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 3: SOFT SHADOW (glass shadows are subtle) ---
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(
        cx + radius * 0.2, groundY, 0,
        cx + radius * 0.2, groundY, radius * 0.8
    );
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.translate(cx + radius * 0.2, groundY);
    ctx.scale(1.1, 0.15);
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 4: GLASS BODY (mostly transparent) ---
    // Very subtle - glass is defined by its edges and reflections
    const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.2, cy - radius * 0.2, 0,
        cx, cy, radius
    );
    
    // Very low opacity - glass is mostly transparent
    bodyGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.03)');
    bodyGrad.addColorStop(0.3, 'rgba(220, 235, 255, 0.05)');
    bodyGrad.addColorStop(0.6, 'rgba(200, 220, 255, 0.08)');
    bodyGrad.addColorStop(0.85, 'rgba(180, 200, 240, 0.12)');
    bodyGrad.addColorStop(1.0, 'rgba(160, 180, 220, 0.18)');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 5: INTERNAL REFLECTION (Critical for glass!) ---
    // Light passes through and creates bright spot on SHADOW side
    // This is inverted from normal - key identifier of transparent material
    const internalX = cx + radius * 0.35;  // Shadow side!
    const internalY = cy + radius * 0.35;
    
    const internalGrad = ctx.createRadialGradient(
        internalX, internalY, 0,
        internalX, internalY, radius * 0.5
    );
    internalGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.5)');
    internalGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
    internalGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
    internalGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = internalGrad;
    ctx.beginPath();
    ctx.arc(internalX, internalY, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // --- LAYER 6: PRIMARY SPECULAR (front surface reflection) ---
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const specX = cx - radius * 0.4;
    const specY = cy - radius * 0.4;
    
    // Very sharp, very bright for glass
    const specGrad = ctx.createRadialGradient(
        specX, specY, 0,
        specX, specY, radius * 0.15
    );
    specGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    specGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    specGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(specX, specY, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 7: STRONG FRESNEL RIM (glass has very strong Fresnel) ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const fresnelGrad = ctx.createRadialGradient(
        cx, cy, radius * 0.7,
        cx, cy, radius
    );
    fresnelGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    fresnelGrad.addColorStop(0.5, 'rgba(220, 235, 255, 0.1)');
    fresnelGrad.addColorStop(0.8, 'rgba(200, 220, 255, 0.3)');
    fresnelGrad.addColorStop(1.0, 'rgba(180, 200, 240, 0.5)');
    
    ctx.fillStyle = fresnelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // --- LAYER 8: EDGE DEFINITION ---
    // Thin bright edge where light catches the rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner edge (refraction creates double edge appearance)
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.stroke();
}

// =============================================================================
// MAIN RENDER
// =============================================================================

function render() {
    console.log('Progressive Sphere Study - Rendering...');
    
    // Background and grid
    drawBackground();
    
    // Four spheres, progressive complexity
    drawBasicSphere();         // Quadrant 1: 5-value system only
    drawIntermediateSphere();  // Quadrant 2: + environment grounding
    drawAdvancedSphere();      // Quadrant 3: + specular/Fresnel
    drawPhotorealisticSphere(); // Quadrant 4: Glass with optics
    
    console.log('Progressive Sphere Study - Complete');
    console.log('Techniques used:');
    console.log('- Basic: Offset radial gradient, 5-value stops');
    console.log('- Intermediate: + Ground shadow, contact shadow, reflected color');
    console.log('- Advanced: + Sharp specular, Fresnel rim, screen compositing');
    console.log('- Photorealistic: + Internal reflection, caustics, transparency');
}

// Run
render();
