# 16 - Technique Selection Framework

> **The V7 Lesson:** More techniques ≠ better results. Artistic judgment > systematic application.

---

## The Golden Rule

```
Every technique must solve a SPECIFIC, IDENTIFIED problem.
If you can't name the problem, don't add the technique.
```

This document exists because V7 applied everything from documents 13-15 and produced **worse results than V5** which used none of them.

---

## Table of Contents

1. [Problem-First Selection](#1-problem-first-selection)
2. [The Incremental Test Pattern](#2-the-incremental-test-pattern)
3. [Problem → Solution Lookup](#3-problem--solution-lookup)
4. [Anti-Patterns](#4-anti-patterns-what-not-to-do)
5. [The V7 Case Study](#5-the-v7-case-study)
6. [Decision Flowchart](#6-decision-flowchart)
7. [Quick Reference](#7-quick-reference)

---

## 1. Problem-First Selection

### Wrong Approach ❌
```
"I have a noise library, material system, and validation pipeline.
Let me implement all of them to make my scene better."
```

### Right Approach ✅
```
"My mountain edges look like they were drawn with a ruler.
I need organic edge variation. Let me check 12-EDGE_MASTERY
for the specific technique to fix this."
```

### The Key Difference

| Approach | Mindset | Result |
|----------|---------|--------|
| Solution-first | "What can I use?" | Over-engineering, muddy output |
| Problem-first | "What needs fixing?" | Targeted improvement |

---

## 2. The Incremental Test Pattern

This is the ONLY safe way to add complexity:

```
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 0: Minimum Viable Render                              │
│ - Big Form Pass only (shapes, colors, values)               │
│ - NO texture, NO noise, NO post-processing                  │
│ - TEST: Is the structure readable? Depth clear?             │
│   → If NO: Fix structure first. Do NOT proceed.             │
│   → If YES: Proceed to Level 1                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 1: Identify ONE Problem                               │
│ - Look at Level 0 output                                    │
│ - Name EXACTLY what's wrong (e.g., "mountain edge too hard")│
│ - Find the specific technique to fix it                     │
│ - Apply ONLY that technique                                 │
│ - TEST: Is it better?                                       │
│   → If NO: Revert. Try different approach.                  │
│   → If YES: Keep it. Return to "Identify ONE Problem"       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 2+: Repeat Until Satisfied                            │
│ - Each addition must pass the "Is it better?" test          │
│ - STOP when you can't identify a specific problem           │
│ - More iterations ≠ better results                          │
└─────────────────────────────────────────────────────────────┘
```

### Critical Rules

1. **Never skip Level 0** - If structure is broken, nothing else matters
2. **One change at a time** - Multiple changes = can't identify what helped/hurt
3. **Revert failures immediately** - Don't try to "fix" a bad addition
4. **Stop before perfection** - Good enough > over-processed

---

## 3. Problem → Solution Lookup

Use this table to find the RIGHT technique for your SPECIFIC problem:

### Edge Problems

| Problem | Symptom | Solution | Document |
|---------|---------|----------|----------|
| Ruler-traced lines | Geometric, artificial look | Organic path variation | 12-EDGE_MASTERY §2 |
| Everything same softness | Dreamlike, no focus | Edge selectivity (70/30 rule) | 12-EDGE_MASTERY §4 |
| Lost edges everywhere | Abstract, unreadable | Add found edges at focal point | 12-EDGE_MASTERY §3 |
| Hard contact shadows | Paper cutout look | Graduated contact edges | 12-EDGE_MASTERY §6 |

### Value/Lighting Problems

| Problem | Symptom | Solution | Document |
|---------|---------|----------|----------|
| Flat, no depth | Everything same brightness | 5-value system | 10-ART_FUNDAMENTALS §3 |
| No atmosphere | Distant = same as close | Atmospheric perspective | 10-ART_FUNDAMENTALS §5 |
| Harsh shadows | Binary light/dark | Form shadows with halftone | 10-ART_FUNDAMENTALS §4 |
| Weak focal point | Eye wanders | Highest contrast at focus | 10-ART_FUNDAMENTALS §6 |

### Material Problems

| Problem | Symptom | Solution | Document |
|---------|---------|----------|----------|
| Rock looks like plastic | Smooth, uniform | Rock material profile | 13-MATERIAL_LOGIC §3 |
| Snow looks painted on | Hard boundary | Soft edge + scatter | 13-MATERIAL_LOGIC §4 |
| Clouds look solid | Defined shape | All-soft edges, layering | 13-MATERIAL_LOGIC §6 |
| Water looks flat | No reflection | Mirror + ripple distortion | 13-MATERIAL_LOGIC §5 |

### Texture/Noise Problems

| Problem | Symptom | Solution | Document |
|---------|---------|----------|----------|
| Random sparkle | Like TV static | Replace Math.random with Perlin | 14-CANVAS_PATTERNS §1 |
| Uniform texture | Tiled/repeating look | FBM with octaves | 14-CANVAS_PATTERNS §2 |
| No organic variation | Too perfect | Coherent noise displacement | 14-CANVAS_PATTERNS §3 |

### Structure Problems

| Problem | Symptom | Solution | Document |
|---------|---------|----------|----------|
| Unreadable composition | Can't tell what's what | Big Form Pass first | 13-MATERIAL_LOGIC §2 |
| Wrong render order | Background covers foreground | Back-to-front layering | 11-CANVAS_PATTERNS §4 |
| Muddied colors | Gray-brown soup | Limit palette, increase contrast | 10-ART_FUNDAMENTALS §7 |

---

## 4. Anti-Patterns (What NOT to Do)

### ❌ "Let Me Use My Noise Library"

```javascript
// BAD: Using noise because it exists
const noise = fbm2D(x, y, { octaves: 4, scale: 0.01 });
// Applied to... everything? Why?
```

**Problem:** No identified purpose. Noise becomes the goal, not a tool.

### ❌ "The Material System Should Improve Everything"

```javascript
// BAD: Applying material profiles to all pixels
applyMountainMaterial(ctx, W, H, config);  // 50,000 pixel operations
applyWaterMaterial(ctx, W, H, config);     // 30,000 more operations
// Result: Muddy, over-processed
```

**Problem:** Material profiles are for specific targeted improvements, not blanket application.

### ❌ "More Passes = More Realistic"

```javascript
// BAD: Stacking passes
bigFormPass(ctx, W, H);
materialPass(ctx, W, H);      // Reprocesses all pixels
atmospherePass(ctx, W, H);    // Reprocesses again
refinementPass(ctx, W, H);    // And again
validationPass(ctx, W, H);    // And measures the mess
```

**Problem:** Each pass can degrade what came before. More ≠ better.

### ❌ "The Validation Passed So It Must Be Good"

V7 scored 100% on validation while looking worse than V5.

**Problem:** Metrics measure what you tell them to measure, not artistic quality. Human judgment is irreplaceable.

### ❌ "I Should Use Everything I Documented"

The documentation is a REFERENCE LIBRARY, not a RECIPE.

**Problem:** Using everything is like adding every spice to a dish because they're in your cabinet.

---

## 5. The V7 Case Study

### What Happened

**V5:** Hand-crafted, artist-driven decisions
- Result: Cohesive, readable, atmospheric
- Weakness: Some hard edges (ruler-traceable)

**V6:** Applied soft edge theory
- Result: More organic, painterly
- Weakness: Perhaps too soft in places

**V7:** Applied EVERYTHING from new documentation
- Noise library (Perlin, Value, FBM)
- Material system (6 profiles, edge/contrast/noise)
- Big Form → Material → Atmosphere pipeline
- Validation suite

**Result:** Muddy, worse than V5

### Why It Failed

1. **Systems fought each other**
   - Big Form Pass established good values
   - Material Pass recolored them
   - Atmosphere Pass added haze
   - Result: Original intent destroyed

2. **No specific problem identified**
   - Started with "let's implement the system"
   - Not "let's fix X specific issue"

3. **Validation provided false confidence**
   - 100% score while output was poor
   - Metrics ≠ quality

4. **Complexity for its own sake**
   - 1000+ lines of code
   - V5 achieved better with simpler approach

### The Lesson

```
More documentation ≠ Better art
More techniques ≠ Better results  
Systematic application ≠ Artistic judgment
```

---

## 6. Decision Flowchart

Use this before adding ANY technique:

```
START: I want to add [technique]
           │
           ▼
┌──────────────────────────────────┐
│ Can I name the SPECIFIC problem  │
│ this technique will solve?       │
└──────────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
    YES          NO
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────────┐
│ What is │  │ STOP. Don't add │
│ the     │  │ the technique.  │
│ problem?│  └─────────────────┘
└─────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Does the current render SHOW     │
│ this problem visibly?            │
└──────────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
    YES          NO
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────────────┐
│Continue │  │ STOP. You're solving│
│         │  │ an imaginary problem│
└─────────┘  └─────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Apply the technique.             │
│ Compare before/after.            │
│ Is it CLEARLY better?            │
└──────────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
    YES          NO
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────────┐
│ KEEP IT │  │ REVERT. Try     │
└─────────┘  │ something else. │
             └─────────────────┘
```

---

## 7. Quick Reference

### Before Starting Any Art Study

1. **What's the goal?** (realistic sunset? stylized? moody?)
2. **What's the minimum to achieve it?** (not maximum)
3. **What worked before?** (reference previous successes)

### The One-Technique-At-A-Time Rule

```
If you can't explain in one sentence what a technique 
will improve, you don't need it yet.
```

### The Revert Rule

```
If you're not sure if something helped, it didn't.
Improvements should be obvious. Revert unclear changes.
```

### The Stopping Rule

```
"Good enough" beats "over-processed" every time.
Stop before you think you're done.
```

---

## Related Documents

- [10-ART_FUNDAMENTALS.md](./10-ART_FUNDAMENTALS.md) - Core visual principles
- [12-EDGE_MASTERY.md](./12-EDGE_MASTERY.md) - Edge selection techniques  
- [13-MATERIAL_LOGIC.md](./13-MATERIAL_LOGIC.md) - Material-specific behavior
- [14-CANVAS_IMPLEMENTATION_PATTERNS.md](./14-CANVAS_IMPLEMENTATION_PATTERNS.md) - Code library (REFERENCE ONLY)
- [15-REALISM_VALIDATION.md](./15-REALISM_VALIDATION.md) - Testing (SUPPLEMENT, NOT REPLACEMENT)
- [FAILURE_ARCHIVE.md](../FAILURE_ARCHIVE.md) - V7 case study

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-06 | Created after V7 failure analysis |
