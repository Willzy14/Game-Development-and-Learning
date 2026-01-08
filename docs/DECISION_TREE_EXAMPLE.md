# Decision Tree: F-Zero Style Game Request

**User Request:** "build me an f zero style game"  
**Purpose:** Demonstrate complete decision-graph navigation from ambiguous request to implementation  
**Date:** January 8, 2026

---

## 🌳 COMPLETE DECISION TREE

```
USER: "build me an f zero style game"
│
├─► STEP 0: CRITICAL DISAMBIGUATION (Q0 - Task Type)
│   │
│   ├─ OPTION A: New game from scratch
│   │   └─► SELECTED (user said "build", not "reskin" or "extend")
│   │
│   ├─ OPTION B: Reskin existing racing game
│   │   └─► NOT SELECTED (no existing game mentioned)
│   │
│   ├─ OPTION C: Extend existing game
│   │   └─► NOT SELECTED (no base game to extend)
│   │
│   └─ OPTION D: Fix/debug existing game
│       └─► NOT SELECTED (no broken game mentioned)
│
│   DECISION: task_type = "new"
│   IMPACT: Load full technical stack, build from scratch
│   PRIORITY: 100 (highest - determines entire workflow)
│
│
├─► STEP 1: INTERROGATION PHASE (Q0-Q9)
│   │
│   ├─ Q0: Task Type [ALREADY DETERMINED]
│   │   └─► ANSWER: "new"
│   │
│   ├─ Q1: Artistic Style
│   │   ├─ OPTION A: photorealistic
│   │   ├─ OPTION B: painterly_impressionist
│   │   ├─ OPTION C: painterly_expressionist
│   │   ├─ OPTION D: stylized_realistic ◄── LIKELY for F-Zero
│   │   ├─ OPTION E: abstract_geometric
│   │   ├─ OPTION F: abstract_organic
│   │   ├─ OPTION G: minimalist
│   │   └─ OPTION H: maximalist
│   │   │
│   │   └─► DECISION: "stylized_realistic"
│   │       REASON: F-Zero has sleek, futuristic aesthetic (not photorealistic, not abstract)
│   │       INFLUENCE: realism=0.7, material=0.8, edge=0.8, technique=0.3, color=0.8
│   │
│   ├─ Q2: Age (0-100)
│   │   ├─ OPTION: 0-30 (new/pristine) ◄── LIKELY for F-Zero
│   │   ├─ OPTION: 30-50 (weathered)
│   │   ├─ OPTION: 50-70 (aged)
│   │   └─ OPTION: 70-100 (ancient)
│   │   │
│   │   └─► DECISION: 10 (futuristic, sleek)
│   │       REASON: F-Zero ships are high-tech, maintained
│   │       SKIP Q2.5: Age < 50, no origin form needed
│   │
│   ├─ Q2.5: Origin Form [CONDITIONAL - SKIPPED]
│   │   └─► SKIPPED: age=10 (threshold is 50)
│   │
│   ├─ Q3: Primary Materials (multiple selection)
│   │   ├─ OPTION A: stone
│   │   ├─ OPTION B: wood
│   │   ├─ OPTION C: metal ◄── LIKELY
│   │   ├─ OPTION D: fabric
│   │   ├─ OPTION E: organic
│   │   ├─ OPTION F: synthetic ◄── LIKELY
│   │   ├─ OPTION G: composite ◄── LIKELY
│   │   └─ OPTION H: energy ◄── POSSIBLE (engines, trails)
│   │   │
│   │   └─► DECISION: ["metal", "synthetic", "composite"]
│   │       REASON: Futuristic racing ships, alloys, carbon fiber
│   │
│   ├─ Q4: Environment
│   │   ├─ OPTION A: outdoor_temperate
│   │   ├─ OPTION B: outdoor_harsh
│   │   ├─ OPTION C: indoor_controlled
│   │   ├─ OPTION D: underwater
│   │   ├─ OPTION E: space_vacuum ◄── POSSIBLE (some tracks)
│   │   └─ OPTION F: magical_unstable
│   │   │
│   │   └─► DECISION: "outdoor_harsh" OR "space_vacuum"
│   │       REASON: F-Zero tracks vary (some alien planets, some space)
│   │       AI ASKS: "Which F-Zero track style? Earth-like or space?"
│   │       USER CLARIFIES: "space theme"
│   │       FINAL: "space_vacuum"
│   │
│   ├─ Q5: Lighting Condition
│   │   ├─ OPTION A: direct_sun
│   │   ├─ OPTION B: diffuse_overcast
│   │   ├─ OPTION C: artificial_warm
│   │   ├─ OPTION D: artificial_cool ◄── LIKELY
│   │   ├─ OPTION E: dim_ambient
│   │   ├─ OPTION F: dramatic_contrast ◄── LIKELY
│   │   └─ OPTION G: magical_glow
│   │   │
│   │   └─► DECISION: "dramatic_contrast"
│   │       REASON: F-Zero has strong shadows, neon contrasts
│   │
│   ├─ Q6: Compositional Complexity
│   │   ├─ OPTION A: simple (1-3 focal points)
│   │   ├─ OPTION B: moderate (4-7 elements) ◄── LIKELY
│   │   └─ OPTION C: complex (8+ elements)
│   │   │
│   │   └─► DECISION: "moderate"
│   │       REASON: Ship + track + background + HUD (4-6 elements)
│   │
│   ├─ Q7: Color Approach
│   │   ├─ OPTION A: monochromatic
│   │   ├─ OPTION B: analogous
│   │   ├─ OPTION C: complementary
│   │   ├─ OPTION D: triadic ◄── POSSIBLE
│   │   ├─ OPTION E: naturalistic
│   │   └─ OPTION F: stylized_limited ◄── LIKELY
│   │   │
│   │   └─► DECISION: "stylized_limited"
│   │       REASON: F-Zero uses bold, curated palette (neon blues, purples, oranges)
│   │
│   ├─ Q8: Classical Techniques (multiple selection)
│   │   ├─ OPTION A: chiaroscuro ◄── POSSIBLE (dramatic shadows)
│   │   ├─ OPTION B: sfumato
│   │   ├─ OPTION C: impasto
│   │   ├─ OPTION D: glazing
│   │   ├─ OPTION E: scumbling
│   │   ├─ OPTION F: wet_on_wet
│   │   ├─ OPTION G: dry_brush
│   │   └─ OPTION H: none
│   │   │
│   │   └─► DECISION: ["chiaroscuro"]
│   │       REASON: Strong light/dark contrast fits F-Zero aesthetic
│   │
│   └─ Q9: Special Requirements (multiple selection)
│       ├─ OPTION A: readability_critical ◄── LIKELY (game objects)
│       ├─ OPTION B: performance_critical ◄── LIKELY (racing game, 60fps)
│       ├─ OPTION C: accessibility_required
│       ├─ OPTION D: animation_planned ◄── LIKELY (ship movement)
│       └─ OPTION E: none
│       │
│       └─► DECISION: ["readability_critical", "performance_critical", "animation_planned"]
│           REASON: Racing game needs clear visuals, high FPS, smooth motion
│
│
├─► STEP 2: CONFLICT DETECTION
│   │
│   ├─ CHECK: task_type vs style
│   │   └─► NO CONFLICT (new + stylized both compatible)
│   │
│   ├─ CHECK: style vs age
│   │   └─► NO CONFLICT (stylized + age 10 both compatible)
│   │
│   ├─ CHECK: environment vs material
│   │   └─► POTENTIAL CONFLICT DETECTED!
│   │       Properties: environment=space_vacuum vs material=metal/synthetic
│   │       Analysis: Space vacuum affects material behavior
│   │       Priority: environment(60) > material(50)
│   │       Winner: environment
│   │       Resolution: "Materials behave per space physics (no air resistance, extreme temps)"
│   │       Impact: "Material rendering adjusted for vacuum context"
│   │
│   ├─ CHECK: composition vs style
│   │   └─► NO CONFLICT (moderate + stylized compatible)
│   │
│   └─ CHECK: performance vs visual complexity
│       └─► POTENTIAL CONFLICT DETECTED!
│           Properties: performance_critical vs animation_planned + moderate composition
│           Analysis: Racing game needs 60fps but wants visual richness
│           Priority: special_requirements(implicit high) influences implementation
│           Resolution: "Use performance patterns (caching, pre-computation, LOD)"
│           Impact: "Load DEBUG_QUALITY.md for optimization techniques"
│
│   CONFLICTS RESOLVED: 2
│   CONFLICTS AVOIDED: 3
│
│
├─► STEP 3: AUTO-LOADING LOGIC
│   │
│   ├─ ALWAYS LOAD (Core)
│   │   ├─► CORE_RULES (influence: 1.0) - "Always required"
│   │   └─► DECISION_GRAPH (influence: 1.0) - "Meta framework"
│   │
│   ├─ TASK TYPE = "new"
│   │   ├─► PATTERNS_REFERENCE (influence: 1.0) - "Building from scratch"
│   │   ├─► CANVAS_PATTERNS (influence: 1.0) - "New rendering code"
│   │   ├─► TECHNOLOGIES (influence: 1.0) - "Architecture decisions"
│   │   └─► UI_CONTROLS (influence: 1.0) - "Input handling for new game"
│   │
│   ├─ STYLE = "stylized_realistic"
│   │   ├─► VISUAL_TECHNIQUES (influence: 0.8) - "Stylization methods"
│   │   ├─► MATERIAL_LOGIC (influence: 0.8) - "Physical accuracy (moderate)"
│   │   ├─► EDGE_MASTERY (influence: 0.8) - "Clean edges for stylized"
│   │   ├─► REALISM_VALIDATION (influence: 0.7) - "Partial realism"
│   │   └─► STYLES (influence: 1.0) - "Style guidance"
│   │
│   ├─ AGE = 10
│   │   └─► REALISM_DEGRADATION (influence: 0.0) - "SKIPPED: Age too low (threshold 50)"
│   │
│   ├─ MATERIAL = ["metal", "synthetic", "composite"]
│   │   ├─► MATERIAL_LOGIC (influence: 0.8) - "Already loaded, weight maintained"
│   │   └─► EDGE_MASTERY (influence: 0.8) - "Sharp edges for tech materials"
│   │
│   ├─ ENVIRONMENT = "space_vacuum"
│   │   ├─► ENVIRONMENTAL (influence: 1.0) - "Space physics effects"
│   │   └─► LANDSCAPE (influence: 0.5) - "Reduced influence (space, not terrain)"
│   │
│   ├─ LIGHTING = "dramatic_contrast"
│   │   └─► CLASSICAL_TECHNIQUES (influence: 0.5) - "Chiaroscuro for contrast"
│   │
│   ├─ COMPOSITION = "moderate"
│   │   └─► COMPOSITION (influence: 1.0) - "Layout guidance"
│   │
│   ├─ COLOR = "stylized_limited"
│   │   └─► COLOR (influence: 1.0) - "Palette strategy"
│   │
│   ├─ TECHNIQUE = ["chiaroscuro"]
│   │   └─► CLASSICAL_TECHNIQUES (influence: 1.0) - "Already loaded, weight increased to 1.0"
│   │
│   └─ REQUIREMENTS = ["readability_critical", "performance_critical", "animation_planned"]
│       ├─► DEBUG_QUALITY (influence: 1.0) - "Performance optimization"
│       ├─► UI_CONTROLS (influence: 1.0) - "Already loaded"
│       └─► Enable silhouette_protection forbidden rule
│
│   DOCS TO LOAD: 14
│   DOCS TO SKIP: 5 (REALISM_DEGRADATION, AUDIO_MASTERY, etc.)
│
│
├─► STEP 4: FORBIDDEN RULES EVALUATION
│   │
│   ├─ RULE: perfect_geometry
│   │   ├─ Condition: age > 50 OR environment = harsh
│   │   ├─ Check: age=10 (false), environment=space_vacuum (not harsh)
│   │   └─► NOT APPLICABLE
│   │
│   ├─ RULE: smooth_gradients
│   │   ├─ Condition: style includes "painterly"
│   │   ├─ Check: style="stylized_realistic" (false)
│   │   └─► NOT APPLICABLE
│   │
│   ├─ RULE: chaotic_noise
│   │   ├─ Condition: composition = simple OR task_type = reskin
│   │   ├─ Check: composition="moderate" (false), task_type="new" (false)
│   │   └─► NOT APPLICABLE
│   │
│   ├─ RULE: environment_mismatch
│   │   ├─ Condition: environment specified
│   │   ├─ Check: environment="space_vacuum" (true)
│   │   └─► APPLICABLE ✓
│   │       Forbidden: contradictory_weathering, impossible_materials, air_resistance
│   │       Required: vacuum_appropriate_effects, no_atmospheric_effects, extreme_temp_rendering
│   │       Reason: "Space vacuum determines physical behavior"
│   │
│   ├─ RULE: style_contamination
│   │   ├─ Condition: style specified
│   │   ├─ Check: style="stylized_realistic" (true)
│   │   └─► APPLICABLE ✓
│   │       Forbidden: mixing_painterly_with_realistic, abstract_randomness_in_realistic, photorealistic_detail_overload
│   │       Required: consistent_stylization_level, appropriate_detail_density, matching_edge_treatment
│   │       Reason: "Stylized realistic must stay consistent"
│   │
│   └─ RULE: silhouette_protection
│       ├─ Condition: readability_required OR task_type = reskin
│       ├─ Check: readability_critical=true (true)
│       └─► APPLICABLE ✓
│           Forbidden: over_noising_primary_shape, destroying_recognizable_form, excessive_greebling
│           Required: ship_silhouette_readable, track_boundaries_clear, HUD_elements_legible
│           Max threshold: 0.6
│           Reason: "Racing game requires clear visual hierarchy"
│
│   ACTIVE FORBIDDEN RULES: 3
│   INACTIVE FORBIDDEN RULES: 3
│
│
├─► STEP 5: PLANNING DOC GENERATION
│   │
│   ├─ Section 1: Scene Interrogation
│   │   └─► Lists all Q0-Q9 answers with task_type first
│   │
│   ├─ Section 2: Conflict Resolution
│   │   └─► Shows 2 detected conflicts with resolutions
│   │
│   ├─ Section 3: Bible Document Loading
│   │   ├─► Loaded: 14 docs with influence weights + reasons
│   │   └─► Skipped: 5 docs with reasons
│   │
│   ├─ Section 4: Forbidden Rules
│   │   └─► Active: 3 rules with forbidden/required lists
│   │
│   ├─ Section 5: Implementation Notes
│   │   ├─► Task: "New game - build architecture first"
│   │   ├─► Style: "Stylized realistic - clean edges, moderate detail"
│   │   ├─► Performance: "60fps critical - use caching, pre-computation"
│   │   └─► References: Specific Bible doc sections
│   │
│   └─ Section 6: Outcome Log Template
│       └─► Pre-filled JSON with decisions, loaded_docs, conflicts
│
│   OUTPUT: PLANNING-2026-01-08.md (~200 lines)
│
│
├─► STEP 6: IMPLEMENTATION STRATEGY
│   │
│   ├─ ARCHITECTURE DECISIONS (from PATTERNS_REFERENCE)
│   │   │
│   │   ├─ Game Loop Pattern
│   │   │   ├─ OPTION A: Fixed timestep
│   │   │   ├─ OPTION B: Variable timestep ◄── SELECTED (easier for 60fps)
│   │   │   └─ OPTION C: Semi-fixed timestep
│   │   │
│   │   ├─ State Management
│   │   │   ├─ OPTION A: Global state
│   │   │   ├─ OPTION B: State machine ◄── SELECTED (menu, race, results states)
│   │   │   └─ OPTION C: ECS
│   │   │
│   │   ├─ Input Handling
│   │   │   ├─ OPTION A: Direct event listeners
│   │   │   ├─ OPTION B: Input manager ◄── SELECTED (cleaner, testable)
│   │   │   └─ OPTION C: Command pattern
│   │   │
│   │   └─ Rendering Pipeline
│   │       ├─ OPTION A: Immediate mode ◄── SELECTED (Canvas 2D)
│   │       ├─ OPTION B: Retained mode
│   │       └─ OPTION C: Sprite batching
│   │
│   ├─ VISUAL IMPLEMENTATION (from loaded Bible docs)
│   │   │
│   │   ├─ Ship Rendering (EDGE_MASTERY + MATERIAL_LOGIC)
│   │   │   ├─ DECISION: Stylized polygonal ship
│   │   │   ├─ TECHNIQUE: Sharp edges, faceted surfaces
│   │   │   ├─ MATERIAL: Metallic sheen (subtle highlights)
│   │   │   └─ CONSTRAINT: Silhouette must read clearly (max noise 0.6)
│   │   │
│   │   ├─ Track Rendering (ENVIRONMENTAL + COMPOSITION)
│   │   │   ├─ DECISION: Perspective grid (fake 3D)
│   │   │   ├─ TECHNIQUE: Vanishing point, size scaling
│   │   │   ├─ ENVIRONMENT: Space backdrop (stars, distant planets)
│   │   │   └─ CONSTRAINT: No atmospheric effects (vacuum)
│   │   │
│   │   ├─ Lighting (CLASSICAL_TECHNIQUES - Chiaroscuro)
│   │   │   ├─ DECISION: Dramatic shadows under ship
│   │   │   ├─ TECHNIQUE: Hard-edged shadows (not soft)
│   │   │   └─ CONSTRAINT: Maintain readability
│   │   │
│   │   └─ Color Palette (COLOR)
│   │       ├─ DECISION: Neon blue ship, purple track, orange accents
│   │       ├─ TECHNIQUE: Stylized limited palette (6-8 colors)
│   │       └─ CONSTRAINT: High contrast for readability
│   │
│   ├─ PERFORMANCE OPTIMIZATION (from DEBUG_QUALITY)
│   │   │
│   │   ├─ DECISION 1: Pre-render track segments
│   │   │   └─► Cache static geometry, draw from cache
│   │   │
│   │   ├─ DECISION 2: Sprite atlas for UI
│   │   │   └─► Single image load, clip regions
│   │   │
│   │   ├─ DECISION 3: Object pooling for particles
│   │   │   └─► Reuse particle objects, avoid GC
│   │   │
│   │   └─ DECISION 4: FPS monitoring
│   │       └─► Display FPS, warn if <60
│   │
│   └─ ANIMATION SYSTEM (from UI_CONTROLS + planning)
│       │
│       ├─ DECISION 1: Ease-in/ease-out for acceleration
│       │   └─► Smooth speed changes, not instant
│       │
│       ├─ DECISION 2: Rotation interpolation
│       │   └─► Smooth turning, predictive feel
│       │
│       └─ DECISION 3: Background parallax
│           └─► Stars move slower than track (depth illusion)
│
│
├─► STEP 7: FILE STRUCTURE CREATION
│   │
│   ├─ /games/tier-2-core-mechanics/03-fzero-racer/
│   │   ├─ index.html
│   │   ├─ game.js (main game loop)
│   │   ├─ ship.js (player ship class)
│   │   ├─ track.js (track rendering)
│   │   ├─ input.js (input manager)
│   │   ├─ render.js (rendering functions)
│   │   ├─ audio.js (sound effects)
│   │   ├─ PLANNING.md (generated planning doc)
│   │   └─ README.md (game overview)
│   │
│   └─ DECISION: Modular structure per PATTERNS_REFERENCE
│
│
├─► STEP 8: IMPLEMENTATION EXECUTION
│   │
│   ├─ Phase 1: Core Architecture (PATTERNS_REFERENCE)
│   │   ├─ Create game loop with state machine
│   │   ├─ Set up canvas and rendering context
│   │   ├─ Implement input manager
│   │   └─ Test: Empty game runs at 60fps
│   │
│   ├─ Phase 2: Ship & Physics (MATERIAL_LOGIC + EDGE_MASTERY)
│   │   ├─ Create Ship class (position, velocity, rotation)
│   │   ├─ Implement acceleration/deceleration
│   │   ├─ Add turning mechanics
│   │   ├─ Render ship with stylized edges
│   │   └─ Test: Ship moves and turns smoothly
│   │
│   ├─ Phase 3: Track & Environment (ENVIRONMENTAL + COMPOSITION)
│   │   ├─ Render perspective track grid
│   │   ├─ Add space background (stars, planets)
│   │   ├─ Implement scrolling/scaling
│   │   ├─ Add track boundaries
│   │   └─ Test: Track scrolls with ship movement
│   │
│   ├─ Phase 4: Visual Polish (COLOR + CLASSICAL_TECHNIQUES)
│   │   ├─ Apply stylized color palette
│   │   ├─ Add chiaroscuro shadows
│   │   ├─ Implement dramatic lighting
│   │   ├─ Add speed trails/particles
│   │   └─ Test: Visuals match planning aesthetic
│   │
│   ├─ Phase 5: Performance (DEBUG_QUALITY)
│   │   ├─ Profile draw calls
│   │   ├─ Implement caching strategies
│   │   ├─ Add FPS counter
│   │   ├─ Optimize hot paths
│   │   └─ Test: Maintains 60fps consistently
│   │
│   └─ Phase 6: Polish & Audio (AUDIO_MASTERY)
│       ├─ Add engine sound (looping)
│       ├─ Add collision sound
│       ├─ Add boost sound (if applicable)
│       ├─ Add UI interactions
│       └─ Test: Complete experience
│
│
├─► STEP 9: VALIDATION
│   │
│   ├─ CHECK: Forbidden rule violations?
│   │   ├─ environment_mismatch: No air effects ✓
│   │   ├─ style_contamination: Consistent stylization ✓
│   │   └─ silhouette_protection: Ship readable ✓
│   │
│   ├─ CHECK: Loaded doc application?
│   │   ├─ Used EDGE_MASTERY for ship edges ✓
│   │   ├─ Used CLASSICAL_TECHNIQUES for lighting ✓
│   │   ├─ Used COLOR for palette ✓
│   │   ├─ Used DEBUG_QUALITY for performance ✓
│   │   └─ All loaded docs referenced ✓
│   │
│   ├─ CHECK: Performance requirements?
│   │   └─ 60fps maintained ✓
│   │
│   └─ CHECK: Readability requirements?
│       └─ Ship, track, HUD all clear ✓
│
│
└─► STEP 10: OUTCOME LOG COMPLETION
    │
    ├─ Fill applied_rules
    │   └─► List which Bible doc sections were used
    │
    ├─ Fill violations (if any)
    │   └─► Hopefully empty!
    │
    ├─ Fill result_quality
    │   ├─ visual_fidelity: ?/10
    │   ├─ performance_fps: 60
    │   ├─ code_quality: ?/10
    │   └─ met_requirements: true/false
    │
    ├─ Fill result_notes
    │   └─► Observations from implementation
    │
    ├─ Fill keep_for_future
    │   └─► What worked well
    │
    ├─ Fill avoid_for_future
    │   └─► What to improve
    │
    ├─ Fill time_metrics
    │   └─► Actual time spent
    │
    └─ Save to /outcomes/new-fzero-racer-2026-01-XX.json
        └─► Learning brain grows ✓
```

---

## 🔍 DECISION TREE ANALYSIS

### Critical Decision Points (Where Wrong Choice = Failure)

1. **Q0: Task Type** (Priority 100)
   - **User said:** "build"
   - **Options:** new, reskin, extend, fix
   - **Wrong choice impact:** Reskin would preserve non-existent code → failure
   - **Correct choice:** "new" (build from scratch)

2. **Q4: Environment** (Priority 60)
   - **Ambiguity:** "F-Zero style" could mean Earth tracks OR space tracks
   - **Options:** outdoor_temperate, outdoor_harsh, space_vacuum, etc.
   - **AI behavior:** ASK USER for clarification ("Which F-Zero track style?")
   - **Wrong choice impact:** Earth physics when user expects space → mismatch

3. **Q9: Special Requirements** (Implicit)
   - **User didn't say:** "needs 60fps" but F-Zero = racing game
   - **AI inference:** Racing game → performance_critical, readability_critical
   - **Options:** Ask or infer
   - **Correct choice:** Infer from game genre

### Conflict Resolution Points (Where Priority System Activates)

1. **Environment vs Material**
   - Conflict: space_vacuum + metal/synthetic
   - Priority: environment(60) > material(50)
   - Resolution: Materials behave per space physics
   - **Alternative outcome if reversed:** Realistic metal with air resistance in space (wrong)

2. **Performance vs Visual Complexity**
   - Conflict: 60fps required + moderate composition + animation
   - Resolution: Load optimization docs, use performance patterns
   - **Alternative outcome if ignored:** Beautiful but laggy (wrong)

### Auto-Loading Decision Points (What Gets Loaded)

#### ALWAYS LOAD:
- CORE_RULES (1.0)
- DECISION_GRAPH (1.0)

#### CONDITIONAL LOADS (Based on Answers):

**IF task_type = "new":**
- ✓ PATTERNS_REFERENCE (1.0)
- ✓ CANVAS_PATTERNS (1.0)
- ✓ TECHNOLOGIES (1.0)

**IF task_type = "reskin":**
- ✗ PATTERNS_REFERENCE (skip: "code structure unchanged")
- ✓ VISUAL_TECHNIQUES (1.0)

**IF style = "stylized_realistic":**
- ✓ MATERIAL_LOGIC (0.8)
- ✓ EDGE_MASTERY (0.8)
- ✓ REALISM_VALIDATION (0.7)

**IF style = "painterly_impressionist":**
- ✓ CLASSICAL_TECHNIQUES (0.9)
- ✓ REALISM_DEGRADATION (0.3) ← LOW influence (suggest, not simulate)

**IF age > 50:**
- ✓ REALISM_DEGRADATION (1.0)
- ✓ Ask Q2.5 (origin form)

**IF age <= 50:**
- ✗ REALISM_DEGRADATION (skip: "age too low")
- ✗ Skip Q2.5

**IF environment specified:**
- ✓ ENVIRONMENTAL (1.0)
- ✓ Enable environment_mismatch forbidden rule

**IF performance_critical:**
- ✓ DEBUG_QUALITY (1.0)

### Forbidden Rule Decision Points (What Gets Prevented)

#### silhouette_protection (Active in F-Zero example)
- **Triggers when:** readability_required OR task_type = reskin
- **Prevents:** Over-noising ship shape, destroying recognizable form
- **Max threshold:** 0.6 surface variation
- **Impact:** Can't add excessive greebling or texture to ship

#### environment_mismatch (Active in F-Zero example)
- **Triggers when:** environment = space_vacuum
- **Prevents:** Air resistance, atmospheric effects, wind
- **Requires:** Vacuum-appropriate physics, extreme temp rendering
- **Impact:** Can't use standard atmosphere shaders

#### style_contamination (Active in F-Zero example)
- **Triggers when:** style = stylized_realistic
- **Prevents:** Mixing painterly brushwork with clean edges
- **Requires:** Consistent stylization level
- **Impact:** Can't add abstract randomness to realistic rendering

#### NOT ACTIVE (But could be in different scenarios):
- **perfect_geometry:** Would trigger if age > 50 (ancient ships)
- **smooth_gradients:** Would trigger if style = painterly
- **chaotic_noise:** Would trigger if composition = simple

---

## 🕳️ POTENTIAL HOLES IN DECISION TREE

### 1. Q0 Inference Too Confident ⚠️ **CRITICAL - EXTERNAL REVIEW FOUND ERROR**

**Current Behavior:** User says "build" → assumes task_type = "new"

**The Real Problem (per external review):**
> "In real use, people say 'build' when they mean: 'make me a prototype using your existing racer scaffold', 'reskin that other thing but in F-Zero vibe', 'extend the current runner into a racer'. This causes needless architecture rewrites."

**Potential Hole:** Wrong task type → wasted effort or wrong approach

**Fix:** Add **Q-0a (Pre-Q0 Check):** "Do you want this based on an existing starter template?"
- **Options:**
  - A) None (build from scratch)
  - B) Use last racer scaffold
  - C) Choose from templates
  - D) Reskin existing game
  - E) Extend existing game

**Impact:** Prevents rebuilding architecture when scaffold exists, correctly identifies reskin/extend tasks even when user says "build"

### 2. Missing Game Mechanics Questions ⚠️ **CRITICAL - EXTERNAL REVIEW VALIDATED**

**Current Q0-Q9:** Focuses on visuals, not gameplay mechanics

**The Real Problem (per external review):**
> "It's an art tree pretending to be a game tree. 'F-Zero style' is mostly gameplay feel: speed curve, handling model, boost=health tradeoff, collision penalty, track hazards. Without a handling/feel spec you can ship the wrong game even if it looks perfect."

**Not Asked:**
- **Perspective:** top-down / pseudo-3D / true 3D
- **Handling model:** arcade drift / grip / hover "magnetic"
- **Speed tiers:** slow/med/fast with actual numbers or relative scale
- **Boost rules:** cooldown vs energy-as-health vs pickup
- **Collision:** bounce / spin / damage / explode
- **Race format:** time trial vs GP vs versus AI
- **Opponents:** none / ghosts / AI pack size
- **Track:** single loop vs procedural segments vs authored

**Potential Hole:** Two developers with same Q0-Q9 answers could build very different games

**Fix:** Add **Genre Subtree** triggered immediately after Q0 when request implies known genre. For racer: add Q10-Q18 (minimum 8 mechanics questions)

### 3. Scope Creep Detection

**Current System:** Assumes user wants minimal viable version

**Not Detected:**
- User might expect full F-Zero feature set (30 ships, 20 tracks, grand prix mode)
- System generates plan for simple demo (1 ship, 1 track, time trial)

**Potential Hole:** Expectation mismatch

**Fix:** Add explicit scope question:
- Q0.5: "Scope level? (A) Proof of concept, (B) Playable demo, (C) Full game"

**Also add hard doc budget limiter (per external review):**
- Proof of concept → max 5 docs loaded
- Playable demo → max 9 docs loaded
- Full game → can load 14+ docs

**Impact:** Turns "influence weights" into real behavior, prevents drowning in documentation

### 4. Variable Timestep Decision Wrong ⚠️ **TECHNICAL ERROR - EXTERNAL REVIEW CAUGHT**

**Current Decision Tree (STEP 6):** "Variable timestep ◄── SELECTED (easier for 60fps)"

**The Real Problem (per external review):**
> "This is a genuine technical error. Variable timestep is usually easier to implement, but worse for consistent physics. Racing games benefit from stable handling; fixed or semi-fixed is safer."

**Why This Matters:**
- Variable timestep: dt varies frame-to-frame → handling feels inconsistent
- Fixed timestep: dt constant → predictable physics (better for racing)

**Potential Hole:** Shipped game with inconsistent handling feel

**Fix:** Make timestep choice **conditional on game type:**
- If physics/handling sensitive (racing, platformer) → fixed or semi-fixed
- If simple toy prototype → variable OK

**Add forbidden rule:** `avoid_variable_timestep_for_racing`
- **Condition:** task_type="new" AND genre="racing" AND feel_critical=true
- **Forbidden:** variable timestep integration
- **Required:** fixed or semi-fixed timestep

### 5. Q2.5 Origin Form Trigger Too Narrow

**Current Trigger:** Only asks Q2.5 if age > 50

**The Real Problem (per external review):**
> "Even if objects are 'new', you still need origin form for: design consistency (ship silhouette grammar), damage model (what parts can deform), modular art (panel layout rules)."

**Missing Use Cases:**
- F-Zero ships (age=10) need silhouette grammar even when pristine
- Manufactured objects need panel layout rules
- Readability-critical objects need deformation rules

**Potential Hole:** Missing structural information for clean manufactured objects

**Fix:** Expand Q2.5 trigger to:
- Ask if: (age > 50) **OR** (manufactured/architected) **OR** (readability_critical)

**Impact:** Captures "perfect primitive → manufactured paneling" even for pristine objects

### 6. Missing Platform/Engine Decision Early ⚠️ **CRITICAL - EXTERNAL REVIEW VALIDATED**

**Current Behavior:** Assumes Canvas 2D

**The Real Problem (per external review):**
> "The tree assumes Canvas 2D. But for you, this is huge: Godot 2D/3D? Unity? Web? The engine choice changes everything: file structure, rendering choices, input, build pipeline."

**Not Asked:**
- Target engine (Canvas 2D, WebGL, Godot, Unity, Unreal)
- Platform constraints (web, desktop, mobile)
- Input methods (keyboard, gamepad, touch)
- Browser compatibility (modern, legacy)

**Potential Hole:** Wrong architecture built, incompatible with target engine

**Fix:** Add **Q0.6: Platform + Engine Target** (asked immediately after Q0)
- **Options:**
  - A) Web (Canvas 2D)
  - B) Web (WebGL/Three.js)
  - C) Godot 4 (2D)
  - D) Godot 4 (3D)
  - E) Unity (URP)
  - F) Unreal Engine

**Impact:** Changes loaded docs (Canvas patterns vs Godot patterns), file structure, rendering approach, input system

### 7. No Progressive Complexity / Proof-of-Fun Milestone ⚠️ **CRITICAL - EXTERNAL REVIEW VALIDATED**

**Current Flow (STEP 8):** Jumps straight to "build full architecture" then polish

**The Real Problem (per external review):**
> "It jumps straight into 'build full architecture' and then polish. Better flow for vibe-coding is: ugly greybox with correct handling → one track loop + lap timing → boost + collision → AI/ghost → visuals."

**Current Phases:** Architecture → Ship/Physics → Track → Polish → Performance → Audio
**Better Phases:** Greybox handling → Timing → Collision → AI → Visuals

**Potential Hole:** Spend time on beautiful art before gameplay fun is validated

**Fix:** Add **Proof-of-Fun Gate** between phases:
1. **Phase 1: Greybox Prototype** (ugly but correct handling)
2. **Phase 2: Core Loop** (lap timing, checkpoints)
3. **Phase 3: Mechanics** (boost, collision)
4. **Phase 4: Opponents** (AI/ghosts if applicable)
5. **⚠️ GATE: Is it fun? (yes → continue | no → iterate mechanics)**
6. **Phase 5: Visual Polish** (art, effects, audio)

**Rule:** Visual polish not allowed until proof-of-fun passes

### 8. Missing Legal/Safety Constraint for Inspired-By ⚠️ **PRODUCT RISK - EXTERNAL REVIEW CAUGHT**

**Current Behavior:** User says "F-Zero style" → system references F-Zero freely

**The Real Problem (per external review):**
> "You can build a 'future hover racer', but you should avoid: Nintendo assets, names, track replicas, music, branding references in shipped material. Not a content-policy issue as such — it's a real product risk."

**Potential Hole:** Shipped product with copyrighted names/assets → legal risk

**Fix:** Add **Inspired-By Constraint** node triggered when user references known IP:

**Constraint:** `inspired_by_only`
- **Forbidden:** Copyrighted names (F-Zero, Mute City, Blue Falcon, Captain Falcon)
- **Forbidden:** Asset replicas (exact track layout, exact ship designs)
- **Forbidden:** Music/sound clones
- **Required:** Original names, original ship designs, original track layouts
- **Required:** "Inspired by" credit only, not "based on" or "from"

**Display in Planning Doc Section 4** alongside other forbidden rules

### 9. Environment Conflates Physics and Rendering ⚠️ **DESIGN ERROR - EXTERNAL REVIEW CAUGHT**

**Current Q4:** environment = "space_vacuum" → forbidden: atmospheric_effects

**The Real Problem (per external review):**
> "'Space vacuum ⇒ no atmospheric effects' is misleading. F-Zero's vibe is space/future, but visually you still want: bloom/glow, fog volumes for depth (stylised), motion blur/speed lines. Those are not 'atmosphere physics'; they're cinematic rendering. Your tree conflates them, and you'll ban good-looking choices."

**Current Forbidden Rule (environment_mismatch):**
- Forbidden: `atmospheric_effects` (too broad!)
- Impact: Bans fog, bloom, motion blur (valid cinematic effects)

**Potential Hole:** Visually flat space scenes because cinematic rendering banned

**Fix:** Split environment into **two orthogonal axes:**

**Q4a: Physical Medium** (affects physics + material behavior)
- A) Vacuum (no air resistance, extreme temps)
- B) Standard atmosphere (wind, weathering)
- C) Underwater (buoyancy, drag)
- D) Other (magical, etc.)

**Q4b: Art Direction Atmosphere** (affects rendering only)
- A) Crisp/clear (no fog/haze)
- B) Foggy/hazy (depth cues, atmosphere)
- C) Neon haze (cyberpunk glow)
- D) Dusty/particulate (volumetric)

**Result:** Can have vacuum physics + neon haze rendering (F-Zero correct combination)

### 10. Missing Definition of Done / Acceptance Tests ⚠️ **CRITICAL - EXTERNAL REVIEW VALIDATED**

**Current Validation (STEP 9):** Checks forbidden rules, doc application, 60fps, readability

**The Real Problem (per external review):**
> "It validates '60fps maintained' and 'readable', but not gameplay outcomes. This prevents 'it runs' but isn't a game."

**Not Checked:**
- Lap actually completes
- Checkpoint system prevents shortcuts
- Collision never tunnels through walls
- Boost consumes resource and affects handling
- AI ships finish races (if enabled)
- Restart works
- Pause works

**Potential Hole:** Ships "it runs at 60fps" but game loop broken

**Fix:** Add **Definition of Done** section to planning doc with measurable checks:

**For Racing Games:**
- [ ] Lap completes and triggers timing
- [ ] Checkpoint system prevents shortcuts
- [ ] Collision detection never tunnels
- [ ] Boost mechanic affects handling measurably
- [ ] AI opponents (if enabled) complete races
- [ ] Restart resets all state correctly
- [ ] Pause stops simulation

**Generate DoD checklist conditionally based on genre + mechanics answers**

---

## 🎯 COVERAGE ANALYSIS

### What IS Covered:

✅ Task type determination (new vs reskin vs extend)  
✅ Visual style (8 options)  
✅ Age/weathering (0-100 scale)  
✅ Material properties (8 types, multiple selection)  
✅ Environment (6 types)  
✅ Lighting (7 types)  
✅ Composition complexity (3 levels)  
✅ Color approach (6 strategies)  
✅ Classical techniques (7 techniques, multiple selection)  
✅ Special requirements (4 types, multiple selection)  
✅ Conflict detection (5 conflict types)  
✅ Conflict resolution (priority-based, deterministic)  
✅ Auto-loading logic (influence-weighted)  
✅ Forbidden rules (6 rule classes)  
✅ Planning doc generation (6 sections)  
✅ Outcome logging (12 fields)  

### What is NOT Covered:

❌ Gameplay mechanics (speed, controls, objectives)  
❌ Scope level (proof of concept vs full game)  
❌ Audio style/approach  
❌ Technical constraints (platform, input, compatibility)  
❌ Reference material integration  
❌ Tier prerequisite validation  
❌ User override of conflict resolutions  
❌ Outcome log validation/linting  
❌ Multi-round clarification (follow-up questions)  
❌ Progressive complexity (start simple, add features)  

### Completeness Score: 60%

**Strong:** Visual/artistic decision-making  
**Weak:** Gameplay/technical decision-making  

---

## 🔧 RECOMMENDED ENHANCEMENTS

### Priority 1 (Critical Gaps):

1. **Add Scope Question** (Q0.5)
   - Prevents expectation mismatch
   - Helps estimate time/effort
   - Determines feature set

2. **Add Gameplay Questions** (Q10-Q15, conditional on task_type = "new")
   - Game genre (racing, platformer, shooter, puzzle)
   - Core mechanic (jump, shoot, race, solve)
   - Win condition (score, time, completion)
   - Fail condition (lives, health, timeout)

3. **Add Technical Constraints** (Q9.5)
   - Platform (desktop, mobile, web)
   - Input (keyboard, gamepad, touch, mouse)
   - Browser target (modern, legacy)

### Priority 2 (Quality Improvements):

4. **Add Reference Material Capture** (Q0.1)
   - Screenshots, videos, URLs
   - Store in planning doc
   - Reference during implementation

5. **Add Tier Validation Check**
   - Check user's completed games
   - Suggest prerequisites if needed
   - Estimate difficulty relative to past projects

6. **Add Conflict Override Option**
   - Show conflicts with resolutions
   - Allow user to override priority system
   - Document override in planning doc

### Priority 3 (Nice to Have):

7. **Add Audio Questions** (Q8.5, conditional)
   - Audio style (realistic, chiptune, synth)
   - Audio priority (full, minimal, none)

8. **Add Outcome Log Linting**
   - Validate filled logs
   - Warn about missing fields
   - Auto-populate from git

9. **Add Multi-Round Clarification**
   - Follow-up questions based on initial answers
   - Progressive refinement
   - "Did I understand correctly?" confirmations

---

## 📊 HOLE SEVERITY ASSESSMENT

| # | Hole | Severity | Impact if Unfixed | External Review |
|---|------|----------|-------------------|----------------|
| 1 | Q0 inference too confident (build ≠ new) | **HIGH** | Needless architecture rewrites | ✅ **VALIDATED** |
| 2 | Missing game mechanics questions (Q10-Q18) | **CRITICAL** | Wrong game built | ✅ **VALIDATED** |
| 3 | Scope creep + no doc budget | **HIGH** | Incomplete/overwhelming | ✅ **ENHANCED** |
| 4 | Variable timestep for racing (technical error) | **CRITICAL** | Inconsistent handling feel | ✅ **ERROR CAUGHT** |
| 5 | Q2.5 origin form trigger too narrow | MEDIUM | Missing silhouette grammar | ✅ **VALIDATED** |
| 6 | Missing platform/engine early decision | **CRITICAL** | Wrong architecture built | ✅ **VALIDATED** |
| 7 | No progressive complexity / proof-of-fun gate | **HIGH** | Polish before fun validated | ✅ **VALIDATED** |
| 8 | Missing legal/safety for inspired-by | **HIGH** | Product legal risk | ✅ **RISK CAUGHT** |
| 9 | Environment conflates physics + rendering | **HIGH** | Bans valid visual effects | ✅ **ERROR CAUGHT** |
| 10 | No Definition of Done / acceptance tests | **CRITICAL** | Ships "runs" not "playable" | ✅ **VALIDATED** |

**Critical Holes (Fix Immediately):** 4  
**High Holes (Fix Before v1.2):** 5  
**Medium Holes (Fix for v1.3):** 1  

**Total Holes:** 10  
**Genuine Errors Caught:** 3 (timestep, environment conflation, Q0 confidence)  
**Architectural Blindspots:** 7 (mechanics tree, platform, DoD, proof-of-fun, legal, scope, origin)

---

## ✅ VALIDATION

This decision tree was validated against:
- ✅ DECISION_GRAPH.md v1.1 spec
- ✅ interrogate.js implementation
- ✅ Actual Pong reskin outcome log
- ✅ All 6 forbidden rule classes
- ✅ All Q0-Q9 questions with Q2.5 conditional
- ✅ **External AI review (January 8, 2026)**
  - **3 genuine technical errors caught** (timestep, environment conflation, Q0 confidence)
  - **7 architectural blindspots identified** (mechanics tree, platform, DoD, proof-of-fun, legal, scope, origin)
  - **10 critical/high priority holes documented**

**Status:** Production-ready for visual/artistic projects **with known limitations**  
**Critical Limitation:** Visual-focused, gameplay-weak (60% coverage)  
**Recommendation for v1.2:** Add Q10-Q18 mechanics questions, fix timestep logic, split environment axes, add platform/engine question, add proof-of-fun gate, add DoD checklist

**External Review Summary:**
> "The biggest issue: it's an art tree pretending to be a game tree. Without handling/feel spec you ship wrong game even if it looks perfect. Also caught genuine technical errors (variable timestep for racing is wrong) and architectural holes (no platform/engine decision early, no proof-of-fun gate, environment conflates physics and rendering)."

**Fix Priority Order:**
1. **Critical (Must Fix):** Mechanics subtree (Q10-Q18), timestep logic, platform/engine (Q0.6), DoD checklist
2. **High (Should Fix):** Template check (Q-0a), environment split, proof-of-fun gate, legal constraint, doc budget
3. **Medium (Nice to Have):** Origin form expansion, feel presets, ambiguity resolver

---

**Last Updated:** January 8, 2026  
**Purpose:** External review for hole detection  
**Next Step:** Share with another AI for critique
