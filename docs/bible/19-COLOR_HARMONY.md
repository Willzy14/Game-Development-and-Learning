# 19. Color Harmony - The Science of Color Relationships

**Last Updated:** 2026-01-08  
**Last Validated:** 2026-01-08  
**Status:** 🟢 Current

## Purpose

This document answers: **WHY do certain color combinations feel harmonious while others clash, and HOW do I implement color theory in Canvas 2D generative art?**

Foundation: Color harmony is not subjective preference—it's the mathematical study of which color relationships are aesthetically pleasing and psychologically effective.

---

## 📚 Research Foundation

**Primary Sources:**
- Wikipedia: Color Theory (mixing, contrast, harmony systems, historical development)
- Canva: Color Wheel (RYB vs RGB, practical combinations with visuals)
- Wikipedia: Design Elements (color's role in visual design)
- Interaction Design Foundation: Visual Design (color as emotional/hierarchical tool)

**Key Insight:** Color harmony is about RELATIONSHIPS between colors in form or space, not individual colors in isolation.

---

## I. Color Fundamentals - The Three Characteristics

### Hue, Saturation, Brightness

**Hue:** The "name" of the color (red, yellow, blue, etc.)
- Position on the color wheel
- Determined by dominant wavelength of light

**Saturation (Chroma):** Intensity/purity of the color
- High saturation = pure, vivid color
- Low saturation = greyed, muted color
- `saturation = 0` → greyscale (no color)

**Brightness (Value/Lightness):** How light or dark the color is
- High brightness = lighter (toward white)
- Low brightness = darker (toward black)
- Independent of hue

### Canvas 2D Implementation

```javascript
// HSL color space (most intuitive for generative art)
function createColor(hue, saturation, lightness) {
    // hue: 0-360 (degrees on color wheel)
    // saturation: 0-100 (percentage)
    // lightness: 0-100 (percentage)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Example palette
const palette = {
    // Same hue, varied saturation
    vivid: createColor(200, 100, 50),    // hsl(200, 100%, 50%) = pure cyan
    muted: createColor(200, 40, 50),     // hsl(200, 40%, 50%) = greyed cyan
    
    // Same hue, varied lightness
    light: createColor(200, 80, 70),     // hsl(200, 80%, 70%) = light cyan
    dark: createColor(200, 80, 30)       // hsl(200, 80%, 30%) = dark cyan
};
```

---

## II. Color Wheels - RYB vs RGB

### Two Different Systems

**RYB (Red-Yellow-Blue) - Subtractive Mixing:**
- Traditional painters' color wheel
- Physical pigments ABSORB light
- Mixing pigments = darker result
- Primary: Red, Yellow, Blue
- Mixing all = muddy brown/black

**RGB (Red-Green-Blue) - Additive Mixing:**
- Digital screens color system
- Screens EMIT light
- Mixing light = brighter result
- Primary: Red, Green, Blue
- Mixing all = white

### Why It Matters for Canvas

```javascript
// Canvas uses RGB internally
ctx.fillStyle = 'rgb(255, 0, 0)';  // Red light

// But HSL is easier for color harmony
ctx.fillStyle = 'hsl(0, 100%, 50%)';  // Same red, more intuitive

// CRITICAL: Traditional color theory (RYB) doesn't always
// translate directly to RGB. Use HSL for best results.
```

**Practical Implication:**
- Study color wheels in HSL space, not RYB
- Complementary colors in RYB ≠ complementary in RGB
- Trust digital color pickers over traditional paint theory

---

## III. Color Harmony Systems - Mathematical Relationships

### The Principle

**Color Harmony:** "Which color combinations look appealing beside one another and create an aesthetic feeling when used together"
- Not about single colors
- About RELATIONSHIPS in color space
- Can be measured as angles/distances on color wheel

### 1. Monochromatic Harmony

**Definition:** Single hue with varied saturation/lightness
- Most fail-safe harmony
- Creates unity through color consistency
- Varies only saturation and/or value

**Canvas Implementation:**
```javascript
function monochromaticPalette(baseHue, count = 5) {
    const palette = [];
    
    for (let i = 0; i < count; i++) {
        const lightness = 20 + (i * 60 / count);  // 20% to 80%
        const saturation = 40 + (i * 40 / count); // 40% to 80%
        
        palette.push(createColor(baseHue, saturation, lightness));
    }
    
    return palette;
}

// Usage: Underwater scene (all blues)
const underwaterColors = monochromaticPalette(200);
// Returns: 5 shades of blue from dark to light
```

**When to Use:**
- Atmospheric scenes (fog, underwater, dusk)
- When mood/tone more important than color variety
- Beginners learning color relationships

**Limitation:** Can feel monotonous if not varied enough in value

### 2. Analogous Harmony

**Definition:** 3-5 adjacent hues on color wheel
- Typically within 30-60 degree span
- One dominant color with supporting neighbors
- Found naturally in nature (sunsets, forests)

**Canvas Implementation:**
```javascript
function analogousPalette(baseHue, spread = 30, count = 3) {
    const palette = [];
    const halfSpread = spread / 2;
    
    for (let i = 0; i < count; i++) {
        const hueOffset = -halfSpread + (i * spread / (count - 1));
        const hue = (baseHue + hueOffset + 360) % 360;
        
        palette.push(createColor(hue, 70, 50));
    }
    
    return palette;
}

// Usage: Sunset scene
const sunsetColors = analogousPalette(30, 60, 5);
// Returns: Red-orange-yellow-yellow-green range
```

**When to Use:**
- Natural scenes (landscapes, organic subjects)
- Harmonious, serene mood
- When color variety needed but unity paramount

**Best Practice:** Choose one hue as dominant (60%), others as accents (30%, 10%)

### 3. Complementary Harmony

**Definition:** Opposite hues on color wheel (180° apart)
- Highest contrast color combination
- Each makes the other appear more vibrant
- Can be jarring if not balanced

**Canvas Implementation:**
```javascript
function complementaryPalette(baseHue) {
    const complementHue = (baseHue + 180) % 360;
    
    return {
        primary: createColor(baseHue, 80, 50),
        complement: createColor(complementHue, 80, 50),
        
        // Tints/shades for variation
        primaryLight: createColor(baseHue, 60, 70),
        primaryDark: createColor(baseHue, 90, 30),
        complementLight: createColor(complementHue, 60, 70),
        complementDark: createColor(complementHue, 90, 30)
    };
}

// Usage: High-impact focal point
const dramatic = complementaryPalette(200);  // Cyan + Orange
```

**When to Use:**
- Need maximum visual impact
- Drawing attention to focal point
- Dynamic, energetic scenes

**Warning:** Use sparingly - too much can be overwhelming
- **Rule:** 70% one color, 30% complement (not 50/50)

### 4. Split-Complementary Harmony

**Definition:** Base hue + TWO colors adjacent to its complement
- Softer than pure complementary
- More nuanced, less jarring
- Still high contrast, but more sophisticated

**Canvas Implementation:**
```javascript
function splitComplementaryPalette(baseHue, split = 30) {
    const complement = (baseHue + 180) % 360;
    const splitLeft = (complement - split + 360) % 360;
    const splitRight = (complement + split) % 360;
    
    return {
        base: createColor(baseHue, 80, 50),
        splitLeft: createColor(splitLeft, 70, 50),
        splitRight: createColor(splitRight, 70, 50)
    };
}

// Usage: Egyptian scene (gold + blue-greens)
const egyptianPalette = splitComplementaryPalette(45, 30);
// Base: Gold (45°), Splits: Teal/Cyan (150°, 210°)
```

**When to Use:**
- Want contrast without harshness
- More color variety than pure complementary
- Sophisticated, balanced palettes

### 5. Triadic Harmony

**Definition:** Three hues equally spaced on color wheel (120° apart)
- Vibrant even with low saturation
- Balanced, lively
- Primary colors (red-yellow-blue) are triadic

**Canvas Implementation:**
```javascript
function triadicPalette(baseHue) {
    return {
        first: createColor(baseHue, 70, 50),
        second: createColor((baseHue + 120) % 360, 70, 50),
        third: createColor((baseHue + 240) % 360, 70, 50)
    };
}

// Usage: Playful, energetic scenes
const playful = triadicPalette(0);  // Red, Green, Blue
```

**When to Use:**
- Need vibrant, balanced palette
- Children's games, playful themes
- Want color variety without clashing

**Best Practice:** Let one color dominate, others accent

### 6. Tetradic (Double-Complementary) Harmony

**Definition:** Two complementary pairs (rectangle on color wheel)
- Most color variety
- Hardest to balance
- Rich, complex palettes

**Canvas Implementation:**
```javascript
function tetradicPalette(baseHue, offset = 60) {
    const second = (baseHue + offset) % 360;
    const third = (baseHue + 180) % 360;
    const fourth = (second + 180) % 360;
    
    return {
        color1: createColor(baseHue, 70, 50),
        color2: createColor(second, 70, 50),
        color3: createColor(third, 70, 50),
        color4: createColor(fourth, 70, 50)
    };
}

// Usage: Complex, detailed scenes
const complex = tetradicPalette(30, 60);
```

**When to Use:**
- Advanced compositions
- Need maximum color variety
- Large, detailed scenes with multiple zones

**Warning:** Requires careful balancing - easy to become chaotic

---

## IV. Color Contrast - Making Things Stand Out

### Types of Contrast (Johannes Itten's 7)

#### 1. Contrast of Hue
**Most basic:** Pure, saturated colors side-by-side
- Primary colors = strongest hue contrast
- Decreases as colors approach each other on wheel

```javascript
// Maximum hue contrast (primaries)
const colors = [
    createColor(0, 100, 50),    // Red
    createColor(120, 100, 50),  // Green
    createColor(240, 100, 50)   // Blue
];
```

#### 2. Contrast of Light and Dark (Value Contrast)
**Most important for readability:**
- High value contrast = easy to see
- Low value contrast = subtle, low visibility

```javascript
// Test value contrast
function getValueContrast(color1, color2) {
    // Extract lightness from HSL
    const l1 = extractLightness(color1);
    const l2 = extractLightness(color2);
    return Math.abs(l1 - l2);
}

// Ensure readability: >40% lightness difference
if (getValueContrast(foreground, background) < 40) {
    console.warn('Insufficient contrast for readability');
}
```

#### 3. Contrast of Saturation
**Vivid vs muted:**
- Pure color vs grayed-out version
- Draws eye to saturated areas

```javascript
// Focal point = high saturation
const focal = createColor(200, 100, 50);

// Background = low saturation
const background = createColor(200, 20, 50);
```

#### 4. Contrast of Temperature (Warm vs Cool)
**Psychological impact:**
- Warm: Red, orange, yellow (advance visually)
- Cool: Blue, green, purple (recede visually)

```javascript
const warmColors = [0, 30, 60];    // Red-Orange-Yellow (hues)
const coolColors = [180, 210, 240]; // Cyan-Blue-Purple (hues)

// Warm colors for foreground, cool for background
function createDepth() {
    drawBackground(createColor(coolColors[1], 60, 50));  // Cool blue
    drawForeground(createColor(warmColors[1], 80, 50));  // Warm orange
}
```

#### 5. Complementary Contrast
**Opposite colors intensify each other:**
- Maximizes vibration/visual interest
- Can cause optical vibration if both saturated

```javascript
// Use complementary contrast for focal point
const focal = createColor(30, 90, 50);          // Orange (warm)
const accentShadow = createColor(210, 70, 40);  // Blue (cool complement)
```

#### 6. Simultaneous Contrast
**Colors influence perception of neighbors:**
- Grey appears reddish next to green
- Same grey appears greenish next to red

**Practical Application:**
```javascript
// Avoid: Placing focal element on complementary background
// (causes optical vibration/eye strain)

// Better: Use analogous background
function avoidSimultaneousContrast(focalColor) {
    const focalHue = extractHue(focalColor);
    // Background 30° away, not 180°
    const bgHue = (focalHue + 30) % 360;
    return createColor(bgHue, 30, 70);  // Low sat, high lightness
}
```

#### 7. Contrast of Extension (Quantity)
**Amount/area of each color:**
- Small amount of vivid color = strong impact
- Large area of muted color = calm background

```javascript
// Ratio: 70% neutral, 20% secondary, 10% accent
function applyExtensionContrast(canvas) {
    // 70%: Background (muted)
    fillArea(canvas.width * 0.7, mutedColor);
    
    // 20%: Supporting elements (medium saturation)
    fillArea(canvas.width * 0.2, secondaryColor);
    
    // 10%: Focal point (high saturation)
    fillArea(canvas.width * 0.1, vividAccent);
}
```

---

## V. Color Psychology - Emotional Impact

### Warm Colors (0°-60°)
**Red, Orange, Yellow:**
- Psychologically: Advance toward viewer
- Emotions: Energy, warmth, excitement, danger
- Physical: Increase heart rate, feel warmer
- Use for: Focal points, action, urgency

```javascript
const warmPalette = {
    urgent: createColor(0, 90, 50),    // Red = danger, stop
    energetic: createColor(30, 85, 55), // Orange = action, enthusiasm
    cheerful: createColor(60, 80, 60)   // Yellow = happiness, caution
};
```

### Cool Colors (180°-270°)
**Cyan, Blue, Purple:**
- Psychologically: Recede from viewer
- Emotions: Calm, peace, sadness, professionalism
- Physical: Decrease heart rate, feel cooler
- Use for: Backgrounds, depth, tranquility

```javascript
const coolPalette = {
    trustworthy: createColor(210, 70, 50),  // Blue = trust, corporate
    mysterious: createColor(270, 60, 40),   // Purple = luxury, mystery
    natural: createColor(180, 50, 50)       // Cyan = water, freshness
};
```

### Neutral Colors
**Black, White, Grey, Brown:**
- Psychological: Stable, grounding, sophisticated
- Emotions: Depends on context
- Use for: Structure, contrast, sophistication

```javascript
const neutralPalette = {
    light: createColor(0, 0, 90),   // Near-white
    mid: createColor(0, 0, 50),     // Mid-grey
    dark: createColor(0, 0, 10)     // Near-black
};
```

### Cultural Considerations

**Western Culture:**
- White = purity, weddings
- Black = death, mourning
- Red = danger, passion

**Eastern Culture:**
- White = death, mourning
- Red = luck, celebration
- Yellow = royalty

**Design Decision:** For global audience, rely on warm/cool psychology more than cultural symbolism

---

## VI. Color Modifications - Tints, Shades, Tones

### Definitions

**Tint:** Color + White (increase lightness)
- Softer, pastel versions
- Less intense, calmer

**Shade:** Color + Black (decrease lightness)
- Darker, richer versions
- More dramatic

**Tone:** Color + Grey (decrease saturation)
- Muted, sophisticated
- Less vivid, more neutral

### Canvas Implementation

```javascript
function createTint(baseHue, baseSat, steps = 5) {
    // Tint: Increase lightness toward 90%
    const tints = [];
    for (let i = 0; i < steps; i++) {
        const lightness = 50 + (i * 40 / steps);  // 50% to 90%
        tints.push(createColor(baseHue, baseSat, lightness));
    }
    return tints;
}

function createShade(baseHue, baseSat, steps = 5) {
    // Shade: Decrease lightness toward 10%
    const shades = [];
    for (let i = 0; i < steps; i++) {
        const lightness = 50 - (i * 40 / steps);  // 50% to 10%
        shades.push(createColor(baseHue, baseSat, lightness));
    }
    return shades;
}

function createTone(baseHue, baseLightness, steps = 5) {
    // Tone: Decrease saturation toward 0%
    const tones = [];
    for (let i = 0; i < steps; i++) {
        const saturation = 80 - (i * 80 / steps);  // 80% to 0%
        tones.push(createColor(baseHue, saturation, baseLightness));
    }
    return tones;
}
```

### When to Use Each

**Tints:**
- Soft, romantic, gentle moods
- Backgrounds that shouldn't distract
- Children's themes, pastel aesthetics

**Shades:**
- Dramatic, moody, serious tones
- Film noir, horror, mystery
- Creating depth in shadows

**Tones:**
- Sophisticated, professional, elegant
- Corporate designs, minimalism
- When vibrancy would be garish

---

## VII. Practical Color Palette Generation

### Complete Palette Generator

```javascript
class ColorHarmony {
    constructor(baseHue, baseSat = 70, baseLightness = 50) {
        this.baseHue = baseHue;
        this.baseSat = baseSat;
        this.baseLightness = baseLightness;
    }
    
    // Generate complete palette with variations
    generatePalette(harmonyType = 'analogous') {
        let coreColors = [];
        
        switch(harmonyType) {
            case 'monochromatic':
                coreColors = [this.baseHue];
                break;
            case 'analogous':
                coreColors = [
                    (this.baseHue - 30 + 360) % 360,
                    this.baseHue,
                    (this.baseHue + 30) % 360
                ];
                break;
            case 'complementary':
                coreColors = [
                    this.baseHue,
                    (this.baseHue + 180) % 360
                ];
                break;
            case 'triadic':
                coreColors = [
                    this.baseHue,
                    (this.baseHue + 120) % 360,
                    (this.baseHue + 240) % 360
                ];
                break;
            case 'split-complementary':
                coreColors = [
                    this.baseHue,
                    (this.baseHue + 150) % 360,
                    (this.baseHue + 210) % 360
                ];
                break;
        }
        
        // For each core color, generate tints/shades/tones
        const fullPalette = {};
        
        coreColors.forEach((hue, idx) => {
            const colorName = `color${idx + 1}`;
            
            fullPalette[colorName] = {
                base: createColor(hue, this.baseSat, this.baseLightness),
                
                // Lighter variations (tints)
                light: createColor(hue, this.baseSat, this.baseLightness + 20),
                veryLight: createColor(hue, this.baseSat * 0.6, this.baseLightness + 30),
                
                // Darker variations (shades)
                dark: createColor(hue, this.baseSat, this.baseLightness - 20),
                veryDark: createColor(hue, this.baseSat, this.baseLightness - 30),
                
                // Muted variations (tones)
                muted: createColor(hue, this.baseSat * 0.5, this.baseLightness),
                veryMuted: createColor(hue, this.baseSat * 0.3, this.baseLightness)
            };
        });
        
        // Add neutrals
        fullPalette.neutrals = {
            white: createColor(0, 0, 95),
            lightGrey: createColor(0, 0, 75),
            midGrey: createColor(0, 0, 50),
            darkGrey: createColor(0, 0, 25),
            black: createColor(0, 0, 5)
        };
        
        return fullPalette;
    }
}

// USAGE EXAMPLE
const harmony = new ColorHarmony(200, 70, 50);  // Base: Cyan
const palette = harmony.generatePalette('split-complementary');

// Apply to scene
ctx.fillStyle = palette.color1.base;        // Focal point (cyan)
ctx.fillStyle = palette.color2.muted;       // Supporting (muted orange-red)
ctx.fillStyle = palette.color3.light;       // Accent (light yellow-orange)
ctx.fillStyle = palette.neutrals.darkGrey;  // Shadows
```

---

## VIII. Decision Frameworks - Choosing Color Schemes

### Framework 1: By Scene Type

```
IF scene = natural landscape
    THEN use analogous harmony (30-60° span)
    AND warm colors for foreground
    AND cool colors for background
    
IF scene = dramatic focal point
    THEN use complementary harmony
    AND 70% dominant, 30% complement
    AND high saturation at focal point only
    
IF scene = atmospheric/mood
    THEN use monochromatic harmony
    AND varied lightness (wide range)
    AND low saturation overall
    
IF scene = playful/energetic
    THEN use triadic harmony
    AND high saturation (70-90%)
    AND let one color dominate (60% area)
```

### Framework 2: By Emotional Goal

```
IF emotion = calm, peaceful
    THEN use cool colors (180-270°)
    AND low saturation (30-50%)
    AND analogous harmony
    
IF emotion = energetic, exciting
    THEN use warm colors (0-60°)
    AND high saturation (70-90%)
    AND complementary or triadic harmony
    
IF emotion = mysterious, sophisticated
    THEN use dark shades (lightness 20-40%)
    AND low saturation (tones)
    AND monochromatic or split-complementary
    
IF emotion = cheerful, optimistic
    THEN use warm colors with high lightness (tints)
    AND high saturation
    AND triadic harmony
```

### Framework 3: By Contrast Needs

```
IF need maximum visibility (UI, focal point)
    THEN use high value contrast (>50% lightness difference)
    AND complementary hue contrast
    AND high saturation for focal element
    
IF need subtle integration (background)
    THEN use low value contrast (<20% lightness difference)
    AND analogous hues
    AND low saturation (tones)
    
IF need depth perception
    THEN use temperature contrast
    AND warm colors forward
    AND cool colors backward
```

---

## IX. Common Mistakes - What NOT to Do

### ❌ Too Many Saturated Colors
```javascript
// WRONG: Everything at 100% saturation
const colors = [
    createColor(0, 100, 50),     // Pure red
    createColor(120, 100, 50),   // Pure green
    createColor(240, 100, 50),   // Pure blue
    createColor(60, 100, 50)     // Pure yellow
];  // Overwhelming, garish

// RIGHT: Vary saturation, let one dominate
const colors = [
    createColor(200, 80, 50),    // Cyan (dominant, high sat)
    createColor(30, 50, 50),     // Orange (muted)
    createColor(200, 90, 30),    // Dark cyan (shadow)
    createColor(0, 10, 70)       // Near-grey (neutral)
];  // Harmonious, focal point clear
```

### ❌ Ignoring Value Contrast
```javascript
// WRONG: Similar lightness = no depth
const mountain = createColor(200, 70, 50);  // L=50%
const sky = createColor(210, 60, 55);       // L=55%
// Only 5% lightness difference = flat, no separation

// RIGHT: Strong value contrast = clear separation
const mountain = createColor(200, 70, 30);  // L=30%
const sky = createColor(210, 60, 75);       // L=75%
// 45% lightness difference = depth, clarity
```

### ❌ Complementary 50/50 Split
```javascript
// WRONG: Equal areas of complementary colors
ctx.fillStyle = 'hsl(0, 80%, 50%)';     // Red
ctx.fillRect(0, 0, 400, 600);           // Half canvas

ctx.fillStyle = 'hsl(180, 80%, 50%)';   // Cyan
ctx.fillRect(400, 0, 400, 600);         // Other half
// Result: Optical vibration, eye strain

// RIGHT: 70-30 or 80-20 ratio
ctx.fillStyle = 'hsl(0, 80%, 50%)';     // Red
ctx.fillRect(0, 0, 640, 600);           // 80% canvas

ctx.fillStyle = 'hsl(180, 80%, 50%)';   // Cyan
ctx.fillRect(640, 0, 160, 600);         // 20% canvas
// Result: Harmonious, red dominates, cyan accents
```

### ❌ Ignoring Temperature for Depth
```javascript
// WRONG: Cool colors in foreground, warm in background
drawForeground(createColor(210, 70, 50));  // Cool blue (recedes)
drawBackground(createColor(30, 70, 50));   // Warm orange (advances)
// Result: Spatial confusion

// RIGHT: Warm forward, cool backward
drawForeground(createColor(30, 70, 50));   // Warm orange (advances)
drawBackground(createColor(210, 70, 50));  // Cool blue (recedes)
// Result: Clear depth perception
```

### ❌ Too Many Hues
```javascript
// WRONG: Using entire color wheel
const chaos = [
    createColor(0, 70, 50),      // Red
    createColor(60, 70, 50),     // Yellow
    createColor(120, 70, 50),    // Green
    createColor(180, 70, 50),    // Cyan
    createColor(240, 70, 50),    // Blue
    createColor(300, 70, 50)     // Magenta
];  // Rainbow vomit, no unity

// RIGHT: Limit to 3-5 hues from harmony system
const cohesive = [
    createColor(200, 70, 50),    // Cyan (base)
    createColor(170, 60, 50),    // Blue-cyan (analogous)
    createColor(230, 60, 50),    // Blue-purple (analogous)
    createColor(200, 30, 70),    // Light muted cyan (tint/tone)
    createColor(200, 70, 30)     // Dark cyan (shade)
];  // Unified, harmonious
```

---

## X. Validation Checklist

**Before Finalizing Color Palette:**

✅ **Harmony System**
- [ ] Colors follow one of 6 harmony systems (not random)
- [ ] If complementary, ratio is 70-30 or 80-20 (not 50-50)
- [ ] If triadic, one color dominates others

✅ **Value Contrast**
- [ ] Focal point has >40% lightness difference from background
- [ ] Foreground/background clearly separable by value alone (greyscale test)
- [ ] Text/UI elements have sufficient contrast (WCAG AA = 4.5:1 minimum)

✅ **Saturation Balance**
- [ ] Not everything at 100% saturation
- [ ] Focal point = highest saturation in scene
- [ ] Background = lower saturation (50-70% of focal saturation)

✅ **Temperature Logic**
- [ ] Warm colors advance (foreground, focal points)
- [ ] Cool colors recede (background, distant elements)
- [ ] Temperature supports spatial depth

✅ **Color Count**
- [ ] Palette limited to 3-7 distinct hues (not entire rainbow)
- [ ] Neutrals (black/white/grey) not counted in hue limit
- [ ] Variations (tints/shades/tones) support core hues

✅ **Psychological Appropriateness**
- [ ] Warm colors for energetic/urgent scenes
- [ ] Cool colors for calm/professional scenes
- [ ] Color emotion matches intended mood

---

## XI. Integration with Other Bible Docs

**18-COMPOSITION_THEORY.md:**
- Use color contrast to support visual hierarchy
- Warm colors at focal point (composition + color)
- Cool colors in negative space (recedes, emphasizes positive shapes)

**20-ART_STYLES.md:**
- Realistic styles: Use natural color relationships (analogous common in nature)
- Stylized/cartoon: Can use exaggerated complementary for impact
- Pixel art: Limited palette = forced harmony (embrace constraint)

**15-REALISM_VALIDATION.md:**
- Atmospheric perspective: Distance = cooler + desaturated
- Material realism: Metal = high saturation specular, stone = low saturation diffuse
- Lighting realism: Light source color affects entire palette

---

## XII. Success Criteria Answers

**From ART_RESEARCH_READING_LIST.md - Can I answer these?**

1. **What makes colors "harmonious" vs "clashing"?**
   - Harmonious: Colors share mathematical relationships on color wheel (30°, 60°, 120°, 180° separations)
   - Clashing: Random hues with no relationship + equal saturation + no dominant color

2. **How do I choose a palette that creates mood?**
   - Warm hues (0-60°) = energetic, urgent, exciting
   - Cool hues (180-270°) = calm, professional, sad
   - High saturation = vibrant, playful
   - Low saturation (tones) = sophisticated, elegant
   - Dark values (shades) = dramatic, mysterious
   - Light values (tints) = soft, cheerful

3. **What's the difference between RGB and RYB color wheels?**
   - RGB: Additive light mixing (screens), primary = R-G-B, mixing = brighter
   - RYB: Subtractive pigment mixing (paint), primary = R-Y-B, mixing = darker
   - Use HSL in Canvas (based on RGB) for digital color harmony

4. **When should I use complementary vs analogous colors?**
   - Complementary: Maximum impact, focal points, high energy (but use 70-30 ratio)
   - Analogous: Natural harmony, landscapes, serene mood, easier to balance

5. **How much saturation is "too much"?**
   - Focal point: 70-90% saturation acceptable
   - Supporting elements: 50-70%
   - Background: 30-50%
   - If everything >80% = overwhelming
   - Use greyscale test: Should work in black & white (value contrast matters more)

6. **Why do warm colors "advance" and cool colors "recede"?**
   - Warm wavelengths (red) focus slightly in front of retina
   - Cool wavelengths (blue) focus slightly behind retina
   - Brain interprets as spatial distance
   - Reinforced by atmospheric perspective (distance = cooler)

7. **How do I create depth using only color?**
   - Foreground: Warm, saturated, high contrast
   - Midground: Transition hues, medium saturation
   - Background: Cool, desaturated, low contrast
   - + Atmospheric fade: Distance = lighter value, lower saturation

**Verdict:** ✅ YES - All 7 questions answered with Canvas 2D implementations

---

## XIII. References

1. Wikipedia - Color Theory (mixing, contrast, harmony systems, Newton/Chevreul/Munsell)
2. Canva - Color Wheel (RYB vs RGB, combinations, warm/cool, tints/shades/tones)
3. Wikipedia - Design Elements (color's role in design, symbolism, hierarchy)
4. Interaction Design Foundation - Visual Design (color as emotional/hierarchical tool)

---

**Status:** 🟢 This document is CURRENT and VALIDATED  
**Version:** 1.0  
**Changelog:** See `docs/bible/CHANGELOG.md`
