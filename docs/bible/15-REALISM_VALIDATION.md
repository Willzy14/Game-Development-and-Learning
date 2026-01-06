# 🔬 REALISM VALIDATION - Automated Testing for Natural Rendering

**Purpose:** Programmatic detection of "abstract drift" and material logic violations  
**When to Read:** After rendering scenes, before calling them "done"  
**Priority:** CRITICAL - Catches V6-style failures automatically

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-06   | 2026-01-06     | Initial creation from V6 research |
<!-- END METADATA -->

**Related Documents:**
- [13-MATERIAL_LOGIC.md](./13-MATERIAL_LOGIC.md) - Theory: what makes rendering realistic
- [14-CANVAS_IMPLEMENTATION_PATTERNS.md](./14-CANVAS_IMPLEMENTATION_PATTERNS.md) - Implementation code
- [12-EDGE_MASTERY.md](./12-EDGE_MASTERY.md) - Edge principles

---

## 🚨 THE PROBLEM THIS SOLVES

### V6 Abstract Drift

**What happened:**
- Agent rendered "beautiful" soft blobs
- Everything looked painterly and atmospheric
- But it was **abstract**, not **realistic**
- No one caught it until after completion

**Why manual validation failed:**
- "Looks nice" isn't a testable criterion
- Gradual drift from realism to abstraction
- Confirmation bias (worked hard, want it to be good)

### The Solution: Automated Checkpoints

Run these tests **during** rendering, not after.

**Benefits:**
- Catches abstract drift in real-time
- Objective metrics (not subjective "looks good")
- Prevents wasted effort on wrong direction
- Forces material logic compliance

---

## TABLE OF CONTENTS

1. [Value Distribution Check](#1-value-distribution-check)
2. [Edge Uniformity Detection](#2-edge-uniformity-detection)
3. [Noise Coherence Test](#3-noise-coherence-test)
4. [Material Differentiation Check](#4-material-differentiation-check)
5. [Histogram Analysis](#5-histogram-analysis)
6. [Complete Validation Pipeline](#6-complete-validation-pipeline)
7. [Validation Dashboard](#7-validation-dashboard)
8. [Integration with Scene Renderer](#8-integration-with-scene-renderer)

---

## 1. VALUE DISTRIBUTION CHECK

### The Test

**Natural scenes have 3-5 dominant value groups, not 9-10 equal bins.**

### Why This Matters

```
❌ Abstract/Mushy: 
   [▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓]
   (Every value equally represented)

✅ Natural:
   [▓▓▓▓▓▓▓▓▓ ▓▓ ▓▓▓▓▓▓ ▓ ▓▓▓▓▓ ▓ ▓ ▓ ▓ ▓]
   (A few dominant groups: sky, mountain, ground)
```

### Implementation

```javascript
// Check if value distribution looks natural
function valueHistogramCheck(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    // Create 10 value bins (0-25, 25-50, ..., 225-255)
    const bins = new Array(10).fill(0);
    
    // Sample every pixel's luminance
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Relative luminance (ITU-R BT.709)
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const value = luminance / 255; // 0..1
        
        const binIndex = Math.min(9, Math.floor(value * 10));
        bins[binIndex]++;
    }
    
    // Count "significant" bins (>7% of total pixels)
    const totalPixels = width * height;
    const significantBins = bins.filter(count => 
        count / totalPixels > 0.07
    ).length;
    
    // Natural scenes: 2-6 significant bins
    const result = {
        bins,
        significantBins,
        totalPixels,
        pass: significantBins >= 2 && significantBins <= 6,
        histogram: bins.map(c => Math.round(c / totalPixels * 100))
    };
    
    if (!result.pass) {
        if (significantBins > 6) {
            result.reason = 'Too many value groups (mushy/noisy)';
            result.suggestion = 'Increase contrast, reduce mid-tone noise';
        } else {
            result.reason = 'Too few value groups (flat)';
            result.suggestion = 'Add depth layers, increase value range';
        }
    }
    
    return result;
}

// Usage:
const result = valueHistogramCheck(ctx, canvas.width, canvas.height);
if (!result.pass) {
    console.warn('❌ Value Distribution:', result.reason);
    console.log('💡 Suggestion:', result.suggestion);
    console.log('📊 Distribution:', result.histogram.join('% | ') + '%');
} else {
    console.log('✅ Value Distribution: Natural (' + result.significantBins + ' groups)');
}
```

---

## 2. EDGE UNIFORMITY DETECTION

### The Test

**If all edges have similar softness → abstract. Natural scenes have edge variety.**

### Why This Matters

V6 problem: Everything was 95% soft edges.  
V5 problem: Everything was 95% hard edges.  
Natural: Rock 70% hard, clouds 0% hard, trees 40% hard.

### Implementation

```javascript
// Detect edge sharpness variance across the image
function edgeUniformityCheck(ctx, width, height, sampleCount = 100) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    const edgeSharpness = [];
    
    // Sample random edges across image
    for (let i = 0; i < sampleCount; i++) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        
        // Get pixel and neighbors
        const center = getPixelValue(data, x, y, width);
        const left = getPixelValue(data, x - 1, y, width);
        const right = getPixelValue(data, x + 1, y, width);
        const top = getPixelValue(data, x, y - 1, width);
        const bottom = getPixelValue(data, x, y + 1, width);
        
        // Calculate gradient magnitude (edge strength)
        const dx = Math.abs(right - left);
        const dy = Math.abs(bottom - top);
        const gradient = Math.sqrt(dx * dx + dy * dy);
        
        // Only count actual edges (gradient > threshold)
        if (gradient > 20) {
            edgeSharpness.push(gradient);
        }
    }
    
    if (edgeSharpness.length < 10) {
        return {
            pass: false,
            reason: 'Insufficient edges detected (too soft everywhere)',
            suggestion: 'Add hard edges to key structures (mountains, buildings)'
        };
    }
    
    // Calculate variance in edge sharpness
    const mean = edgeSharpness.reduce((a, b) => a + b) / edgeSharpness.length;
    const variance = edgeSharpness.reduce((sum, val) => 
        sum + Math.pow(val - mean, 2), 0
    ) / edgeSharpness.length;
    const stdDev = Math.sqrt(variance);
    
    // Low variance = uniform edges (bad)
    // High variance = mixed edges (good)
    const coefficientOfVariation = stdDev / mean;
    
    const result = {
        mean: Math.round(mean),
        stdDev: Math.round(stdDev),
        coefficientOfVariation: coefficientOfVariation.toFixed(2),
        edgeCount: edgeSharpness.length,
        pass: coefficientOfVariation > 0.4  // At least 40% variation
    };
    
    if (!result.pass) {
        result.reason = 'Edges too uniform (all similar softness)';
        result.suggestion = 'Mix hard and soft edges per material type';
    }
    
    return result;
}

function getPixelValue(data, x, y, width) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

---

## 3. NOISE COHERENCE TEST

### The Test

**Detect "TV static" (Math.random) vs natural variation (coherent noise).**

### Why This Matters

```
Math.random():  ░▓░▒▓░▒░▓▒░▓▒░  (sparkly, every pixel different)
Coherent noise: ░░▒▒▓▓▓▒▒░░░░  (smooth gradients, organic)
```

### Implementation

```javascript
// Detect sparkly noise vs smooth gradients
function noiseCoherenceCheck(ctx, width, height, sampleSize = 50) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    // Sample local neighborhoods
    let totalCoherence = 0;
    let sampleCount = 0;
    
    for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * (width - sampleSize));
        const y = Math.floor(Math.random() * (height - sampleSize));
        
        // Get local patch
        const patch = [];
        for (let py = 0; py < sampleSize; py++) {
            for (let px = 0; px < sampleSize; px++) {
                patch.push(getPixelValue(data, x + px, y + py, width));
            }
        }
        
        // Calculate autocorrelation (how similar are neighbors?)
        const coherence = calculateAutocorrelation(patch, sampleSize);
        totalCoherence += coherence;
        sampleCount++;
    }
    
    const avgCoherence = totalCoherence / sampleCount;
    
    // High coherence = smooth (good)
    // Low coherence = sparkly (bad)
    const result = {
        coherence: avgCoherence.toFixed(3),
        pass: avgCoherence > 0.3,  // At least 30% correlation
        type: avgCoherence > 0.5 ? 'smooth' : avgCoherence > 0.3 ? 'moderate' : 'sparkly'
    };
    
    if (!result.pass) {
        result.reason = 'Sparkly/random noise detected (not coherent)';
        result.suggestion = 'Replace Math.random() with Perlin/Value noise';
    }
    
    return result;
}

function calculateAutocorrelation(patch, size) {
    // Compare each pixel to its right neighbor
    let correlation = 0;
    let count = 0;
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size - 1; x++) {
            const idx1 = y * size + x;
            const idx2 = y * size + x + 1;
            
            const diff = Math.abs(patch[idx1] - patch[idx2]);
            // Smaller diff = higher correlation
            correlation += 1 - (diff / 255);
            count++;
        }
    }
    
    return correlation / count;
}
```

---

## 4. MATERIAL DIFFERENTIATION CHECK

### The Test

**Can the validator distinguish rock from clouds from trees?**

### Why This Matters

V6 problem: All materials had same behavioral properties.  
Solution: Each material should have unique statistical signature.

### Implementation

```javascript
// Check if different regions have distinct material characteristics
function materialDifferentiationCheck(ctx, width, height, regions) {
    // regions = [{name: 'mountain', bounds: {x, y, w, h}}, ...]
    
    const materialProfiles = [];
    
    regions.forEach(region => {
        const profile = analyzeRegion(ctx, region);
        materialProfiles.push({
            name: region.name,
            ...profile
        });
    });
    
    // Compare profiles - should be distinct
    const distinctions = [];
    for (let i = 0; i < materialProfiles.length; i++) {
        for (let j = i + 1; j < materialProfiles.length; j++) {
            const dist = profileDistance(
                materialProfiles[i], 
                materialProfiles[j]
            );
            distinctions.push({
                pair: `${materialProfiles[i].name} vs ${materialProfiles[j].name}`,
                distance: dist
            });
        }
    }
    
    // Materials should be at least 0.3 distance apart
    const allDistinct = distinctions.every(d => d.distance > 0.3);
    
    return {
        profiles: materialProfiles,
        distinctions,
        pass: allDistinct,
        reason: allDistinct ? null : 'Materials too similar (same substance)',
        suggestion: allDistinct ? null : 'Apply distinct edge/texture/contrast per material'
    };
}

function analyzeRegion(ctx, region) {
    const {x, y, w, h} = region.bounds;
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;
    
    let totalValue = 0;
    let totalSaturation = 0;
    let edgeCount = 0;
    let sharpEdgeCount = 0;
    
    for (let py = 1; py < h - 1; py++) {
        for (let px = 1; px < w - 1; px++) {
            const idx = (py * w + px) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            
            // Value
            const v = Math.max(r, g, b) / 255;
            totalValue += v;
            
            // Saturation
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const s = maxC === 0 ? 0 : (maxC - minC) / maxC;
            totalSaturation += s;
            
            // Edge detection
            const center = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const right = getPixelValue(data, px + 1, py, w);
            const bottom = getPixelValue(data, px, py + 1, w);
            
            const gradient = Math.sqrt(
                Math.pow(right - center, 2) + 
                Math.pow(bottom - center, 2)
            );
            
            if (gradient > 10) {
                edgeCount++;
                if (gradient > 40) sharpEdgeCount++;
            }
        }
    }
    
    const pixelCount = w * h;
    
    return {
        avgValue: totalValue / pixelCount,
        avgSaturation: totalSaturation / pixelCount,
        edgeDensity: edgeCount / pixelCount,
        sharpEdgeRatio: edgeCount > 0 ? sharpEdgeCount / edgeCount : 0
    };
}

function profileDistance(p1, p2) {
    // Euclidean distance in feature space
    return Math.sqrt(
        Math.pow(p1.avgValue - p2.avgValue, 2) +
        Math.pow(p1.avgSaturation - p2.avgSaturation, 2) +
        Math.pow(p1.edgeDensity - p2.edgeDensity, 2) +
        Math.pow(p1.sharpEdgeRatio - p2.sharpEdgeRatio, 2)
    );
}
```

---

## 5. HISTOGRAM ANALYSIS

### Visual Histogram Display

```javascript
// Generate ASCII histogram for quick visualization
function displayHistogram(bins, width = 50) {
    const maxBin = Math.max(...bins);
    
    console.log('\n📊 Value Distribution:');
    bins.forEach((count, i) => {
        const percentage = (count / bins.reduce((a, b) => a + b) * 100).toFixed(1);
        const barLength = Math.round((count / maxBin) * width);
        const bar = '█'.repeat(barLength);
        const range = `${i * 25}-${(i + 1) * 25}`.padEnd(8);
        console.log(`${range} ${bar} ${percentage}%`);
    });
    console.log('');
}

// Example output:
// 📊 Value Distribution:
// 0-25     ████████ 8.2%
// 25-50    ████████████████████ 22.5%
// 50-75    ████████████ 15.8%
// 75-100   ████████████████████████ 28.3%
// ...
```

---

## 6. COMPLETE VALIDATION PIPELINE

### The Master Validator

```javascript
// Run all validation checks and return comprehensive report
class RealismValidator {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.results = {};
    }
    
    runAll(options = {}) {
        console.log('🔬 Running Realism Validation Suite...\n');
        
        // 1. Value Distribution
        this.results.valueDistribution = valueHistogramCheck(
            this.ctx, this.width, this.height
        );
        this.report('Value Distribution', this.results.valueDistribution);
        
        // 2. Edge Uniformity
        this.results.edgeUniformity = edgeUniformityCheck(
            this.ctx, this.width, this.height
        );
        this.report('Edge Uniformity', this.results.edgeUniformity);
        
        // 3. Noise Coherence
        this.results.noiseCoherence = noiseCoherenceCheck(
            this.ctx, this.width, this.height
        );
        this.report('Noise Coherence', this.results.noiseCoherence);
        
        // 4. Material Differentiation (if regions provided)
        if (options.regions) {
            this.results.materialDiff = materialDifferentiationCheck(
                this.ctx, this.width, this.height, options.regions
            );
            this.report('Material Differentiation', this.results.materialDiff);
        }
        
        // Overall verdict
        this.printSummary();
        
        return this.results;
    }
    
    report(testName, result) {
        const icon = result.pass ? '✅' : '❌';
        console.log(`${icon} ${testName}: ${result.pass ? 'PASS' : 'FAIL'}`);
        
        if (!result.pass) {
            console.log(`   ⚠️  ${result.reason}`);
            console.log(`   💡 ${result.suggestion}`);
        }
        
        // Additional details
        if (result.histogram) {
            displayHistogram(result.bins);
        }
        
        console.log('');
    }
    
    printSummary() {
        const tests = Object.values(this.results);
        const passed = tests.filter(t => t.pass).length;
        const total = tests.length;
        
        console.log('═'.repeat(50));
        console.log(`📋 VALIDATION SUMMARY: ${passed}/${total} checks passed`);
        console.log('═'.repeat(50));
        
        if (passed === total) {
            console.log('🎉 All checks passed! Rendering looks natural.');
        } else if (passed >= total * 0.7) {
            console.log('⚠️  Most checks passed, but refinement needed.');
        } else {
            console.log('❌ Multiple failures detected. Review material logic.');
        }
        
        console.log('');
    }
    
    getScore() {
        const tests = Object.values(this.results);
        const passed = tests.filter(t => t.pass).length;
        return (passed / tests.length) * 100;
    }
}

// Usage:
const validator = new RealismValidator(ctx, canvas.width, canvas.height);
const results = validator.runAll({
    regions: [
        { name: 'mountain', bounds: {x: 0, y: 200, w: 800, h: 200} },
        { name: 'sky', bounds: {x: 0, y: 0, w: 800, h: 200} },
        { name: 'ground', bounds: {x: 0, y: 400, w: 800, h: 200} }
    ]
});

if (validator.getScore() < 70) {
    console.error('⛔ Realism score too low - do not proceed');
}
```

---

## 7. VALIDATION DASHBOARD

### Real-Time Monitoring

```javascript
// Create visual validation overlay on canvas
class ValidationDashboard {
    constructor(canvas, validationResults) {
        this.canvas = canvas;
        this.results = validationResults;
    }
    
    draw() {
        const ctx = this.canvas.getContext('2d');
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 200);
        
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('🔬 VALIDATION', 20, 30);
        
        // Draw each test result
        let y = 55;
        Object.entries(this.results).forEach(([name, result]) => {
            const icon = result.pass ? '✅' : '❌';
            const label = this.formatLabel(name);
            
            ctx.font = '14px monospace';
            ctx.fillStyle = result.pass ? '#4ade80' : '#f87171';
            ctx.fillText(`${icon} ${label}`, 20, y);
            
            y += 25;
        });
        
        // Overall score
        const score = this.calculateScore();
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = score >= 70 ? '#4ade80' : '#f87171';
        ctx.fillText(`Score: ${score}%`, 20, y + 20);
    }
    
    formatLabel(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    calculateScore() {
        const tests = Object.values(this.results);
        const passed = tests.filter(t => t.pass).length;
        return Math.round((passed / tests.length) * 100);
    }
}

// Usage:
const dashboard = new ValidationDashboard(canvas, validator.results);
dashboard.draw();
```

---

## 8. INTEGRATION WITH SCENE RENDERER

### Validation Checkpoints

```javascript
// Enhanced SceneRenderer with validation
class ValidatedSceneRenderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.validator = new RealismValidator(this.ctx, this.width, this.height);
    }
    
    render() {
        // Phase 1: Big Form Pass
        this.bigFormPass();
        
        // Checkpoint 1: After structure
        console.log('\n📍 CHECKPOINT 1: After Big Form Pass');
        const checkpoint1 = valueHistogramCheck(this.ctx, this.width, this.height);
        if (!checkpoint1.pass) {
            console.error('⛔ Structure phase failed validation - aborting');
            return false;
        }
        
        // Phase 2: Material Pass
        this.materialPass();
        
        // Checkpoint 2: After materials
        console.log('\n📍 CHECKPOINT 2: After Material Pass');
        const checkpoint2 = this.validator.runAll();
        const score = this.validator.getScore();
        
        if (score < 50) {
            console.error('⛔ Material phase failed validation - aborting');
            return false;
        } else if (score < 70) {
            console.warn('⚠️  Validation concerns - review before atmosphere');
        }
        
        // Phase 3: Atmosphere Pass
        this.atmospherePass();
        
        // Final Checkpoint
        console.log('\n📍 FINAL CHECKPOINT: Complete Scene');
        const final = this.validator.runAll({
            regions: this.getRegions()
        });
        
        return this.validator.getScore() >= 70;
    }
    
    // ... rest of renderer implementation ...
}
```

---

## USAGE WORKFLOW

### Development Cycle

1. **During Development:**
   ```javascript
   // After each major change
   const check = valueHistogramCheck(ctx, width, height);
   if (!check.pass) {
       console.warn('Drift detected:', check.reason);
   }
   ```

2. **Before Completion:**
   ```javascript
   // Full validation suite
   const validator = new RealismValidator(ctx, width, height);
   const results = validator.runAll();
   
   if (validator.getScore() < 70) {
       // Do not proceed - fix issues first
   }
   ```

3. **Automated Testing:**
   ```javascript
   // In test suite
   test('Landscape should pass realism validation', () => {
       renderLandscape(canvas);
       const validator = new RealismValidator(ctx, width, height);
       validator.runAll();
       expect(validator.getScore()).toBeGreaterThan(70);
   });
   ```

---

## VALIDATION CHECKLIST

Run before declaring scene "complete":

- [ ] Value distribution shows 3-5 dominant groups (not uniform)
- [ ] Edge uniformity check shows variety (coefficient > 0.4)
- [ ] Noise coherence passes (no sparkle/TV static)
- [ ] Materials are statistically distinct from each other
- [ ] Overall realism score > 70%

**If ANY test fails:**
1. Read the suggestion
2. Apply fix (usually material profile adjustment)
3. Re-run validation
4. Repeat until pass

---

## TROUBLESHOOTING GUIDE

### Common Failures and Fixes

| Failure | Likely Cause | Fix |
|---------|--------------|-----|
| Too many value groups | Noisy texture everywhere | Reduce noise amplitude, apply in layers |
| Too few value groups | Flat/no depth | Add foreground/midground/background layers |
| Uniform edges | Same edge treatment everywhere | Apply material-specific edge profiles |
| Sparkly noise | Using Math.random() | Replace with Perlin/Value noise |
| Similar materials | Same properties for all | Use distinct MATERIALS profiles |
| Low overall score | Skipped Big Form Pass | Restart with structure-first approach |

---

## RESOURCES

### Statistical Image Analysis

- **Image Histogram Analysis**  
  https://en.wikipedia.org/wiki/Image_histogram
  
- **Edge Detection Algorithms**  
  https://en.wikipedia.org/wiki/Edge_detection
  
- **Autocorrelation in Images**  
  https://en.wikipedia.org/wiki/Autocorrelation

### Validation Theory

- **Perceptual Image Quality**  
  https://en.wikipedia.org/wiki/Image_quality
  
- **Natural Scene Statistics**  
  https://redwood.berkeley.edu/w/images/4/4b/Geislerperrysuper2001.pdf

---

*Last Updated: January 6, 2026*  
*This document provides automated testing to prevent V6-style abstract drift.*  
*Use in conjunction with 13-MATERIAL_LOGIC.md and 14-CANVAS_IMPLEMENTATION_PATTERNS.md.*
