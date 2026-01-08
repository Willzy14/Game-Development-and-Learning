# DECISION_GRAPH.md - Scene Interrogation Framework

**Purpose:** Formalize the decision-graph navigation system to prevent cognitive errors and ensure efficient Bible doc usage  
**Date Created:** January 8, 2026  
**Status:** Phase 3 - Formalization (v1.1 - Conflict Resolution Added)  
**Last Updated:** January 8, 2026 (Added: Rule priority, influence weights, origin_form, silhouette protection, outcome logging)

> **Key Innovation (From Critique):**  
> "It prevents the wrong work before it prevents bad art."  
> This is not art logic — it's engineering maturity. Q0 adds intent detection, scope locking, and regression prevention.

---

## I. THE PROBLEM THIS SOLVES

### Before Decision-Graph:
❌ Browse 4,700+ lines of Bible docs manually  
❌ Guess which sections are relevant  
❌ Apply techniques that don't fit the scene  
❌ Miss critical first question: "Is this new or modification?"  
❌ Rebuild when should reskin

### After Decision-Graph:
✅ Answer scene property questions → Auto-load relevant sections  
✅ System determines what's needed (not guesswork)  
✅ Forbidden rules prevent anti-patterns automatically  
✅ FIRST question establishes task type (new/modify)  
✅ Correct workflow applied immediately

---

## II. INTERROGATION FRAMEWORK

### **QUESTION 0 (CRITICAL): Task Type** 🚨

**This MUST be asked first, before any art decisions**

```
Q0: What is the task type?

Options:
A. New project (build from scratch)
B. Reskin existing project (modify rendering only)
C. Extend existing project (add features to existing)
D. Fix/debug existing project (repair broken functionality)

→ Decision determines workflow:
   - Option A → Full implementation (all systems)
   - Option B → ONLY modify rendering/visual functions
   - Option C → Add to existing (preserve all current)
   - Option D → Fix specific issue (minimal changes)
```

**Why This Matters:**
- Phase 2 failure: Skipped Q0, rebuilt instead of reskinned
- Correct answer (B) → Would have preserved AI, audio, game states
- Incorrect assumption (A) → Wasted effort, changed gameplay

**Workflow Gates:**
```
IF task_type == "reskin":
    PRESERVE: game logic, physics, AI, input, audio
    MODIFY: render() function and drawing helpers only
    VALIDATE: gameplay identical to original
    
IF task_type == "new":
    BUILD: all systems from scratch
    REFERENCE: existing projects for patterns
    VALIDATE: complete functionality
```

### Question 1: Style Aesthetic

```
Q1: What style aesthetic is required?

Options:
- Photorealistic (realism slider: 90-100%)
- Stylized realistic (realism slider: 60-90%)
- Painterly/impressionist (realism slider: 30-60%)
- Abstract/minimalist (realism slider: 0-30%)

→ Loads: 20-STYLES_MOVEMENTS.md
→ Section: Based on realism percentage
```

### Question 2: Scene Elements & Complexity

```
Q2: What are the scene elements?

Consider:
- Number of objects (<5 simple, 5-20 medium, >20 complex)
- Geometric complexity (basic shapes vs organic forms)
- Animation requirements (static vs dynamic)

→ Loads: 14-CANVAS_IMPLEMENTATION_PATTERNS.md
→ Section: Complexity-appropriate techniques
```

### Question 2.5: Origin Form (NEW - Critical for Degradation)

```
Q2.5: What was the object originally?

Options:
- Perfect geometric primitive (cube, sphere, cylinder, column)
- Crafted architectural element (arch, wall, statue, temple)
- Organic natural form (tree, rock, mountain, plant)
- Composite structure (building, bridge, monument)

→ IF age > 50 AND realistic:
     REQUIRED: origin_form establishes degradation baseline
   ELSE:
     OPTIONAL: can skip for abstract/stylized

→ Determines: What is being degraded FROM (not just degraded TO)
```

**Why This Matters:**
- Ancient column ≠ ancient wall ≠ ancient statue
- Without origin form, AI degrades nothing (no baseline)
- Degradation needs source geometry to break from

**Degradation Mapping:**
```javascript
const OriginFormDegradation = {
    perfect_cylindrical_column: {
        primary_form: 'vertical cylinder',
        forces: ['gravity', 'water', 'weathering'],
        degradation_rules: [
            'vertical_cracks_offset',           // Not aligned
            'silhouette_noise_increases_downward', // Gravity effect
            'base_erosion_heaviest',            // Ground contact
            'top_weathering_lighter'            // Less exposure
        ]
    },
    crafted_stone_wall: {
        primary_form: 'rectangular planes',
        forces: ['weathering', 'vegetation', 'structural_stress'],
        degradation_rules: [
            'block_edges_round_first',
            'mortar_degrades_faster_than_stone',
            'vegetation_in_gaps',
            'silhouette_remains_readable'
        ]
    },
    organic_tree: {
        primary_form: 'branching structure',
        forces: ['growth', 'weather', 'decay'],
        degradation_rules: [
            'asymmetry_is_natural',
            'bark_texture_follows_growth',
            'no_geometric_degradation',
            'irregularity_expected'
        ]
    }
};
```

### Question 3: Age & Material Properties

```
Q3: What age are the scene elements?

age_ranges:
  modern: 0-50 years
  young: 50-200 years
  mature: 200-500 years
  ancient: 500-1000 years
  ruin: 1000+ years

→ IF age > 50 years AND realistic_scene:
     LOAD: 24-REALISM_DEGRADATION.md
   ELSE:
     SKIP: 24-REALISM_DEGRADATION.md
     
→ Determines: weathering intensity, degradation state
```

### Question 4: Material Types

```
Q4: What materials are present?

Options:
- None (abstract/stylized)
- Organic (wood, vegetation, fabric)
- Inorganic (stone, metal, glass)
- Mixed

→ IF materials present AND realistic:
     LOAD: 13-MATERIAL_LOGIC.md
   ELSE:
     SKIP: 13-MATERIAL_LOGIC.md
```

### Question 5: Environment & Exposure

```
Q5: What environment context?

environment_types:
  - arid (×0.7 degradation)
  - temperate (×1.0 degradation)
  - humid (×1.5 degradation)
  - volcanic (×2.5 degradation)
  - underwater (×2.0 degradation)
  - frozen (×0.5 degradation)

exposure_types:
  - interior (×0.5 weathering)
  - sheltered (×0.3 weathering)
  - exterior (×1.5 weathering)
  - exposed (×2.0 weathering)

→ Modifies: degradation multipliers
→ Affects: which weathering techniques apply
```

### Question 6: Color Requirements

```
Q6: What color scheme is needed?

Options:
- Specific palette (user-defined)
- Harmony type (complementary, analogous, etc.)
- Monochromatic
- None (grayscale/black&white)

→ IF color needed:
     LOAD: 19-COLOR_HARMONY.md
     SECTION: Based on harmony type
   ELSE:
     SKIP: Color docs
```

### Question 7: Composition Requirements

```
Q7: What composition structure?

Considerations:
- Focal point location (rule of thirds, golden ratio, centered)
- Depth layers (foreground, mid, background)
- Negative space requirements
- Visual hierarchy needs

→ LOAD: 18-COMPOSITION_THEORY.md
→ SECTION: Relevant composition rules
```

### Question 8: Depth & Perspective

```
Q8: Does scene require depth/perspective?

Options:
- None (flat 2D, UI elements)
- Minimal (slight atmospheric)
- Moderate (clear depth layers)
- Strong (dramatic perspective, multiple vanishing points)

→ IF depth > minimal:
     LOAD: 21-CLASSICAL_TECHNIQUES.md (Atmospheric Perspective)
   ELSE:
     SKIP: Perspective sections
```

### Question 9: Lighting & Atmosphere

```
Q9: What lighting requirements?

Options:
- None (flat lighting)
- Basic (simple light/shadow)
- Dramatic (chiaroscuro, strong contrast)
- Atmospheric (environmental lighting effects)

→ IF lighting > basic:
     LOAD: 21-CLASSICAL_TECHNIQUES.md (Chiaroscuro)
   ELSE:
     SKIP: Advanced lighting
```

---

## III. PROPERTY → TECHNIQUE MAPPINGS

### Age-Based Techniques

```javascript
const AgeMappings = {
    modern: {
        age_range: [0, 50],
        required_techniques: [],
        forbidden_techniques: [
            'weathering', 'degradation', 'erosion',
            'moss_growth', 'cracks', 'aging_effects'
        ],
        bible_docs_skip: ['24-REALISM_DEGRADATION']
    },
    
    young: {
        age_range: [50, 200],
        required_techniques: ['subtle_wear', 'light_discoloration'],
        allowed_techniques: ['surface_variation', 'minor_chips'],
        forbidden_techniques: ['heavy_weathering', 'structural_damage'],
        bible_docs_load: ['24-REALISM_DEGRADATION (Sections I-IV only)']
    },
    
    mature: {
        age_range: [200, 500],
        required_techniques: ['edge_degradation', 'surface_variation', 'visible_aging'],
        allowed_techniques: ['cracks', 'discoloration', 'moss_growth'],
        forbidden_techniques: ['perfect_symmetry', 'uniform_surfaces'],
        bible_docs_load: ['24-REALISM_DEGRADATION (Sections I-VII)']
    },
    
    ancient: {
        age_range: [500, 1000],
        required_techniques: [
            'heavy_degradation', 'asymmetry_enforcement',
            'edge_breaking', 'surface_variation', 'ambient_occlusion'
        ],
        forbidden_techniques: [
            'perfect_geometry', 'straight_lines', 'clean_edges',
            'uniform_surfaces', 'any_symmetry'
        ],
        bible_docs_load: ['24-REALISM_DEGRADATION (All sections)']
    },
    
    ruin: {
        age_range: [1000, Infinity],
        required_techniques: [
            'structural_collapse', 'vegetation_overgrowth',
            'extreme_erosion', 'complete_asymmetry'
        ],
        forbidden_techniques: [
            'any_perfection', 'intact_structures', 'clean_anything'
        ],
        bible_docs_load: ['24-REALISM_DEGRADATION (All sections + emphasis on VII)']
    }
};
```

### Style-Based Techniques

```javascript
const StyleMappings = {
    photorealistic: {
        realism_slider: [90, 100],
        required_techniques: [
            'accurate_materials', 'physical_lighting', 'correct_perspective',
            'surface_detail', 'ambient_occlusion'
        ],
        forbidden_techniques: [
            'visible_brushstrokes', 'broken_color', 'abstraction'
        ],
        bible_docs_load: [
            '13-MATERIAL_LOGIC',
            '21-CLASSICAL_TECHNIQUES (chiaroscuro, atmospheric)',
            '24-REALISM_DEGRADATION'
        ]
    },
    
    stylized_realistic: {
        realism_slider: [60, 90],
        required_techniques: [
            'simplified_materials', 'stylized_lighting', 'suggested_detail'
        ],
        allowed_techniques: [
            'color_exaggeration', 'simplified_forms', 'artistic_license'
        ],
        forbidden_techniques: ['perfect_photorealism', 'extreme_abstraction'],
        bible_docs_load: [
            '20-STYLES_MOVEMENTS (stylization spectrum)',
            '21-CLASSICAL_TECHNIQUES (selective)',
            '19-COLOR_HARMONY'
        ]
    },
    
    painterly_impressionist: {
        realism_slider: [30, 60],
        required_techniques: [
            'broken_color', 'visible_texture', 'loose_edges',
            'optical_mixing', 'atmospheric_effects'
        ],
        forbidden_techniques: [
            'smooth_gradients', 'perfect_geometry', 'photorealistic_detail',
            'crisp_edges', 'uniform_surfaces'
        ],
        bible_docs_load: [
            { doc: '20-STYLES_MOVEMENTS (Impressionism)', influence: 0.9 },
            { doc: '21-CLASSICAL_TECHNIQUES (Impasto, Sfumato)', influence: 0.7 },
            { doc: '19-COLOR_HARMONY', influence: 0.8 },
            { doc: '24-REALISM_DEGRADATION', influence: 0.3 }  // Suggested, not literal
        ],
        bible_docs_skip: ['13-MATERIAL_LOGIC (physical accuracy not needed)']
    },
    
    abstract_minimal: {
        realism_slider: [0, 30],
        required_techniques: [
            'simplified_forms', 'essential_shapes', 'color_as_primary'
        ],
        forbidden_techniques: [
            'realistic_materials', 'weathering', 'photorealistic_anything',
            'complex_detail', 'perspective_accuracy'
        ],
        bible_docs_load: [
            '20-STYLES_MOVEMENTS (Abstraction)',
            '19-COLOR_HARMONY',
            '18-COMPOSITION_THEORY'
        ],
        bible_docs_skip: [
            '24-REALISM_DEGRADATION', '13-MATERIAL_LOGIC',
            '21-CLASSICAL_TECHNIQUES (most sections)'
        ]
    }
};
```

### Material-Based Techniques

```javascript
const MaterialMappings = {
    stone: {
        properties: ['hard', 'brittle', 'porous'],
        degradation_types: ['cracks', 'chips', 'erosion', 'weathering'],
        vulnerable_to: ['water', 'freeze_thaw', 'acid', 'vegetation'],
        resistant_to: ['fire', 'insects'],
        bible_sections: [
            '13-MATERIAL_LOGIC (Stone)',
            '24-REALISM_DEGRADATION (VII - Stone Degradation)'
        ]
    },
    
    wood: {
        properties: ['organic', 'flexible', 'fibrous'],
        degradation_types: ['rot', 'splitting', 'warping', 'insect_damage'],
        vulnerable_to: ['moisture', 'insects', 'fire', 'fungus'],
        resistant_to: ['most_chemicals'],
        bible_sections: [
            '13-MATERIAL_LOGIC (Wood)',
            '24-REALISM_DEGRADATION (VII - Wood Degradation)'
        ]
    },
    
    metal: {
        properties: ['hard', 'conductive', 'reflective'],
        degradation_types: ['rust', 'corrosion', 'tarnish', 'pitting'],
        vulnerable_to: ['moisture', 'salt', 'acids', 'oxidation'],
        resistant_to: ['insects', 'vegetation', 'biological'],
        bible_sections: [
            '13-MATERIAL_LOGIC (Metal)',
            '24-REALISM_DEGRADATION (VII - Metal Degradation)'
        ]
    }
};
```

---

## III-B. RULE PRIORITY & CONFLICT RESOLUTION (NEW)

### The Problem

What happens when rules collide?

```javascript
// Scenario: Underwater ancient stylized structure (reskin)
scene_properties = {
    task_type: 'reskin',              // Forbids logic changes
    style: 'stylized_realistic',      // Allows exaggeration
    age: 'ancient',                   // Forbids symmetry
    environment: 'underwater',        // ×2.0 degradation multiplier
    material: 'stone'
};

// Without priority: AI tries to satisfy ALL rules → mush
// With priority: Higher rules override lower ones
```

### Rule Priority System

```javascript
const RulePriority = {
    task_type: 100,        // ALWAYS wins (new/reskin/extend/fix)
    style: 80,             // Style determines aesthetic approach
    age: 70,               // Age determines weathering intensity
    environment: 60,       // Environment modulates degradation
    material: 50,          // Material determines specific techniques
    composition: 40,       // Composition guides arrangement
    color: 30,             // Color is lowest priority
    lighting: 30
};
```

**Resolution Rules:**

1. **Task Type Overrides All** (Priority 100)
   ```javascript
   IF task_type === 'reskin':
       IGNORE all rules that modify non-render systems
       Example: Skip physics, AI, audio rules even if loaded
   ```

2. **Style Overrides Realism Multipliers** (Priority 80)
   ```javascript
   IF style === 'painterly' AND environment === 'underwater':
       degradation_multiplier = min(environment_multiplier * 0.3, 0.6)
       Reason: Painterly suggests erosion, doesn't simulate it
   ```

3. **Age Cannot Override Task Type** (Priority 70 < 100)
   ```javascript
   IF task_type === 'reskin' AND age === 'ancient':
       Apply asymmetry to RENDERING only
       Do NOT modify game logic for "aged feel"
   ```

### Conflict Resolution Function

```javascript
function resolveConflicts(scene_properties, applied_rules) {
    const sorted_rules = applied_rules.sort((a, b) => 
        RulePriority[b.category] - RulePriority[a.category]
    );
    
    const resolved = [];
    const overridden = [];
    
    for (const rule of sorted_rules) {
        // Check if higher priority rule conflicts
        const conflicts = resolved.filter(r => 
            r.conflicts_with?.includes(rule.name)
        );
        
        if (conflicts.length > 0) {
            overridden.push({
                rule: rule.name,
                overridden_by: conflicts[0].name,
                reason: `Priority ${RulePriority[conflicts[0].category]} > ${RulePriority[rule.category]}`
            });
        } else {
            resolved.push(rule);
        }
    }
    
    return { resolved, overridden };
}
```

### Example: Underwater Ancient Painterly Reskin

```javascript
// Input conflicts
conflicts = [
    { rule: 'reskin_task', category: 'task_type', priority: 100 },
    { rule: 'painterly_style', category: 'style', priority: 80 },
    { rule: 'ancient_asymmetry', category: 'age', priority: 70 },
    { rule: 'underwater_erosion', category: 'environment', priority: 60 }
];

// Resolution
resolved = {
    task_type: 'reskin → ONLY modify rendering',
    style: 'painterly → influence = 0.3 (suggest, not simulate)',
    age: 'ancient → asymmetry in RENDER only (not logic)',
    environment: 'underwater → visual suggestion (not physics)'
};

// Result
final_approach = {
    modify: ['render() function', 'drawing helpers'],
    preserve: ['game logic', 'physics', 'collision', 'AI'],
    techniques: [
        'painterly_broken_color (impressionist)',
        'suggested_erosion (not physical)',
        'asymmetric_shapes (rendering)',
        'underwater_color_palette (visual only)'
    ]
};
```

---

## IV. FORBIDDEN RULES (Anti-Pattern Prevention)

### Scenario-Based Forbidden Rules

```javascript
const ForbiddenRules = {
    // Modern/Contemporary Scenes
    modern_scene: {
        condition: 'age < 50 years',
        forbidden: [
            'weathering_techniques',
            'degradation_states',
            'moss_growth',
            'structural_damage',
            'erosion',
            'ancient_patina'
        ],
        reason: 'Modern objects cannot show centuries of aging'
    },
    
    // Abstract/Stylized Scenes
    abstract_scene: {
        condition: 'realism_slider < 30%',
        forbidden: [
            'photorealistic_materials',
            'weathering_systems',
            'physical_accuracy',
            'detailed_degradation',
            'material_logic'
        ],
        reason: 'Abstract art prioritizes form/color over realism'
    },
    
    // Impressionist Style
    impressionist_style: {
        condition: 'style == "impressionist"',
        forbidden: [
            'smooth_gradients',
            'perfect_geometry',
            'crisp_edges',
            'photorealistic_detail',
            'createLinearGradient',
            'createRadialGradient (smooth)'
        ],
        required: [
            'broken_color',
            'visible_brushstrokes',
            'optical_mixing',
            'loose_edges'
        ],
        reason: 'Impressionism uses broken color, not smooth blending'
    },
    
    // Ancient Structures
    ancient_structure: {
        condition: 'age > 500 years',
        forbidden: [
            'perfect_symmetry',
            'straight_lines',
            'uniform_surfaces',
            'clean_edges',
            'pristine_appearance'
        ],
        required: [
            'asymmetry_enforcement',
            'edge_degradation',
            'surface_variation',
            'visible_aging'
        ],
        reason: '500+ year old structures cannot be geometrically perfect'
    },
    
    // Reskin Tasks
    reskin_task: {
        condition: 'task_type == "reskin"',
        forbidden: [
            'modify_game_logic',
            'change_physics',
            'alter_ai',
            'rebuild_input',
            'change_gameplay'
        ],
        required: [
            'preserve_all_logic',
            'modify_rendering_only',
            'maintain_functionality'
        ],
        reason: 'Reskin means visual changes only, preserve all behavior'
    },
    
    // Silhouette Protection (NEW - Critical)
    silhouette_protection: {
        condition: 'readability_required == true OR game_object == true',
        forbidden: [
            'over_noising_primary_shape',
            'destroying_recognizable_form',
            'excessive_edge_breaking',
            'silhouette_chaos'
        ],
        required: [
            'primary_forms_remain_legible',
            'silhouette_readable_at_distance',
            'surface_detail_secondary_to_form'
        ],
        reason: 'Win realism without losing design - primary forms must remain legible',
        max_noise_threshold: 0.6  // Surface variation cannot exceed this
    }
};
```

### Validation Checks

```javascript
function validateForbiddenRules(scene_properties, applied_techniques) {
    const violations = [];
    
    // Check age-based rules
    if (scene_properties.age < 50 && applied_techniques.includes('weathering')) {
        violations.push({
            rule: 'modern_scene',
            violation: 'weathering applied to modern scene',
            fix: 'Remove weathering techniques (age < 50 years)'
        });
    }
    
    // Check style-based rules
    if (scene_properties.style === 'impressionist') {
        if (applied_techniques.includes('smooth_gradients')) {
            violations.push({
                rule: 'impressionist_style',
                violation: 'smooth gradients used in impressionist scene',
                fix: 'Replace with broken color / optical mixing'
            });
        }
    }
    
    // Check task-type rules
    if (scene_properties.task_type === 'reskin') {
        if (applied_techniques.includes('rebuild_game_logic')) {
            violations.push({
                rule: 'reskin_task',
                violation: 'game logic modified in reskin task',
                fix: 'Preserve original logic, modify rendering only'
            });
        }
    }
    
    return violations;
}
```

---

## V. BIBLE DOC QUERY TEMPLATES

### Query Template Structure

```markdown
# Scene Planning Doc - [Project Name]

## 🔍 SCENE INTERROGATION

**Q0: Task Type**
- Answer: [new/reskin/extend/fix]
- Workflow: [full_implementation/rendering_only/add_features/bug_fix]

**Q1: Style Aesthetic**
- Answer: [style name]
- Realism Slider: [0-100]%
- Loaded: [doc sections]

**Q2: Scene Elements**
- Answer: [list elements]
- Complexity: [simple/medium/complex]
- Loaded: [doc sections]

... (continue for all 9 questions)

## 📋 AUTO-LOADED BIBLE SECTIONS

[Only relevant sections appear here, extracted from full docs]

## 🚫 FORBIDDEN RULES

[Auto-populated based on scene properties]

## ✅ REQUIRED TECHNIQUES

[Auto-populated based on scene properties]

## 🎨 IMPLEMENTATION

[Code snippets from loaded sections]
```

### Auto-Loading Logic

```javascript
function generatePlanningDoc(scene_properties) {
    const planning_doc = {
        interrogation: interrogate(scene_properties),
        loaded_sections: [],
        forbidden_rules: [],
        required_techniques: []
    };
    
    // Q0: Task Type determines workflow
    if (scene_properties.task_type === 'reskin') {
        planning_doc.workflow = 'RENDERING_ONLY';
        planning_doc.preserve = ['game_logic', 'AI', 'physics', 'input', 'audio'];
        planning_doc.modify = ['render()', 'drawing_helpers'];
    }
    
    // Q1: Style determines doc loading
    if (scene_properties.style === 'impressionist') {
        planning_doc.loaded_sections.push({
            doc: '20-STYLES_MOVEMENTS.md',
            sections: ['III - Impressionism']
        });
        planning_doc.loaded_sections.push({
            doc: '21-CLASSICAL_TECHNIQUES.md',
            sections: ['III - Impasto', 'II - Sfumato']
        });
        planning_doc.forbidden_rules.push(ForbiddenRules.impressionist_style);
    }
    
    // Q3: Age determines weathering
    if (scene_properties.age > 50 && scene_properties.realism > 60) {
        const age_category = getAgeCategory(scene_properties.age);
        planning_doc.loaded_sections.push({
            doc: '24-REALISM_DEGRADATION.md',
            sections: AgeMappings[age_category].bible_docs_load
        });
        planning_doc.required_techniques.push(...AgeMappings[age_category].required_techniques);
        planning_doc.forbidden_rules.push(...AgeMappings[age_category].forbidden_techniques);
    } else {
        planning_doc.skipped_docs.push('24-REALISM_DEGRADATION.md (age < 50 or not realistic)');
    }
    
    // ... continue for all questions
    
    return planning_doc;
}
```

---

## VI. PHASE 2 LESSONS LEARNED

### What Went Wrong

**Mistake:** Rebuilt Pong from scratch instead of reskinning original

**Root Cause:** Skipped Question 0 (task type)

**Impact:**
- Changed gameplay (2-player instead of Player vs AI)
- Removed audio system
- Removed game state management
- Wasted implementation time
- Didn't test actual "reskinning" workflow

### Correct Workflow

```
Step 1: Q0 - Task Type?
  Answer: "Reskin existing 001-pong"
  
Step 2: Determine scope
  Preserve: game.js logic, AI, physics, input, audio
  Modify: render() and drawing functions only
  
Step 3: Style questions (Q1-Q9)
  Load relevant Bible sections for rendering
  
Step 4: Create planning doc
  Only rendering-related techniques included
  
Step 5: Implement
  Copy original files
  Replace ONLY render() function
  Validate gameplay unchanged
```

### Prevention Mechanism

**Add to Rule 13 (CORE_RULES.md):**

```markdown
### Planning Doc Creation Process

**STEP 0 (CRITICAL): Determine Task Type**

Before any art decisions, ask:
"Is this a new project or modification of existing?"

- NEW → Full planning doc (all systems)
- RESKIN → Rendering-only planning doc
- EXTEND → Addition-focused planning doc  
- FIX → Bug-specific planning doc

NEVER skip this step. Task type determines entire workflow.
```

---

## VII. IMPLEMENTATION CHECKLIST

### For Every New Scene/Project:

- [ ] **Q0: Task type identified** (new/reskin/extend/fix)
- [ ] **Q1-Q9: All questions answered**
- [ ] **Relevant Bible docs loaded** (not all docs)
- [ ] **Irrelevant docs explicitly skipped** (documented why)
- [ ] **Forbidden rules populated** (based on scene properties)
- [ ] **Required techniques identified** (based on scene properties)
- [ ] **Planning doc created** (<300 lines, only relevant sections)
- [ ] **Implementation references planning doc only** (no browsing full docs)
- [ ] **Validation checks passed** (forbidden rules not violated)

---

## VII-B. OUTCOME LOGGING SYSTEM (NEW - Learning Brain)

### The Meta-Layer: Decision Memory

The system needs to remember what worked, not just what to do.

**Problem:** Current system is a rule engine, not a learning brain.  
**Solution:** Add lightweight outcome tracking.

### Outcome Log Structure

```javascript
const OutcomeLog = {
    project_id: 'pong-painterly-reskin',
    date: '2026-01-08',
    
    decisions: {
        Q0_task_type: 'reskin',
        Q1_style: 'painterly_impressionist',
        Q2_elements: 'simple (2 paddles, 1 ball)',
        Q2_5_origin_form: 'geometric_primitives (rectangles, circle)',
        Q3_age: 'modern (0 years)',
        Q4_material: 'none (abstract shapes)',
        Q5_environment: 'none (UI space)',
        Q6_color: 'split_complementary',
        Q7_composition: 'centered_symmetry',
        Q8_depth: 'none (flat 2D)',
        Q9_lighting: 'none (flat lighting)'
    },
    
    applied_rules: [
        'reskin_task (preserve game logic)',
        'painterly_impressionist (broken color, no smooth gradients)',
        'modern_scene (no weathering)',
        'silhouette_protection (paddles/ball must stay readable)'
    ],
    
    loaded_docs: [
        { doc: '20-STYLES_MOVEMENTS', influence: 0.9, sections: ['Impressionism'] },
        { doc: '21-CLASSICAL_TECHNIQUES', influence: 0.7, sections: ['Impasto'] },
        { doc: '19-COLOR_HARMONY', influence: 0.8, sections: ['Split-Complementary'] }
    ],
    
    skipped_docs: [
        { doc: '24-REALISM_DEGRADATION', reason: 'age < 50 years (modern scene)' },
        { doc: '13-MATERIAL_LOGIC', reason: 'abstract shapes (no physical materials)' },
        { doc: '22-LANDSCAPE_MASTERS', reason: 'not landscape scene' }
    ],
    
    conflicts_resolved: [
        {
            conflict: 'painterly style vs game readability',
            resolution: 'silhouette_protection rule enforced (max_noise: 0.6)',
            winning_rule: 'silhouette_protection (readability > style purity)'
        }
    ],
    
    violations: [],  // None found
    
    result_quality: {
        gameplay_preserved: true,
        visual_style_achieved: true,
        readability_maintained: true,
        performance_acceptable: true
    },
    
    result_notes: [
        'Ball impressionist dabs (20 overlapping) stayed readable',
        'Paddle impasto strokes maintained clear hitbox',
        'Background atmospheric variation didn\'t distract from gameplay',
        'Broken color achieved without smooth gradients (forbidden rule worked)'
    ],
    
    keep_for_future: [
        'Silhouette protection threshold (0.6) was perfect balance',
        'Impasto vertical strokes work well for rectangular game objects',
        'Broken color ball (20 dabs) readable at game speed',
        'Q0 (task type) prevented logic modification'
    ],
    
    avoid_for_future: [
        'Surface noise > 0.6 (ball became unreadable in testing)',
        'Too many atmospheric spots (>30) created distraction',
        'Initial mistake: rebuilt instead of reskinned (Q0 saved us)'
    ],
    
    time_metrics: {
        interrogation_time: '5 minutes',
        planning_doc_creation: '15 minutes',
        implementation_time: '45 minutes',
        validation_time: '10 minutes',
        total: '75 minutes',
        vs_browse_all_approach: '~28 minutes saved'
    }
};
```

### Usage: Learning from Outcomes

**Before Next Similar Project:**
```javascript
function queryOutcomes(filters) {
    // Find similar past projects
    const similar = OutcomeLog.filter(log => 
        log.decisions.Q0_task_type === filters.task_type &&
        log.decisions.Q1_style === filters.style
    );
    
    // Extract successful patterns
    const patterns = {
        keep: similar.flatMap(log => log.keep_for_future),
        avoid: similar.flatMap(log => log.avoid_for_future),
        typical_time: average(similar.map(log => log.time_metrics.total))
    };
    
    return patterns;
}

// Example: Planning next painterly reskin
const lessons = queryOutcomes({
    task_type: 'reskin',
    style: 'painterly_impressionist'
});

// Returns:
// {
//   keep: ['Silhouette protection 0.6', 'Impasto for rectangles', ...],
//   avoid: ['Surface noise > 0.6', 'Too many atmospheric spots', ...],
//   typical_time: '75 minutes'
// }
```

### Outcome Log Integration

**Add to Planning Doc Template:**
```markdown
## OUTCOME LOG (Fill after completion)

**Result Quality:**
- [ ] Goals achieved?
- [ ] Rules followed?
- [ ] No violations?

**Keep for Future:**
- ...

**Avoid for Future:**
- ...

**Time Spent:**
- Interrogation: ___
- Planning: ___
- Implementation: ___
- Validation: ___
```

**This Transforms System From:**
- Rule engine (execute once)
- → Learning brain (improve over time)

---

## VIII. SUCCESS METRICS

**Decision-Graph system is working correctly when:**

1. ✅ Q0 asked first (task type established before art decisions)
2. ✅ All questions answered (Q0-Q9 + Q2.5 origin_form when needed)
3. ✅ Correct docs loaded with influence weights (not binary)
4. ✅ Incorrect docs skipped with reasons documented
5. ✅ Forbidden rules prevent anti-patterns (no modern weathering, no impressionist smooth gradients, no reskin logic changes)
6. ✅ **Rule conflicts resolved via priority system** (task_type > style > age > environment)
7. ✅ **Silhouette protection enforced** (readability maintained)
8. ✅ Planning doc concise (<300 lines vs 4,700+ full docs)
9. ✅ Implementation efficient (no browsing, all info in planning doc)
10. ✅ Time saved (vs manual browsing: ~28+ minutes per project)
11. ✅ Cognitive load reduced (85% reduction in info processing)
12. ✅ **Outcome logged for future learning** (keep/avoid patterns documented)

---

## IX. NEXT STEPS

**Phase 3 Complete When:**
- [ ] This document finalized
- [ ] Rule 13 updated with Q0 requirement
- [ ] Planning doc template created (with Q0 first)
- [ ] BIBLE_INDEX updated with decision-graph entry
- [ ] SESSION_LOG updated with Phase 3 entry

**Phase 4: Document Updates**
- [ ] Update CORE_RULES.md (Rule 13 + Q0)
- [ ] Update 21-CLASSICAL_TECHNIQUES (cross-ref decision-graph)
- [ ] Update 13-MATERIAL_LOGIC (cross-ref decision-graph)
- [ ] Update BIBLE_INDEX (add DECISION_GRAPH.md)
- [ ] Update SESSION_LOG (Phase 3 & 4 entries)

---

**Document Status:** ✅ ACTIVE (v1.1 - Conflict Resolution Added)  
**Purpose:** Prevent cognitive errors, ensure correct Bible doc navigation, resolve rule conflicts at scale  
**Key Innovations:**
- Question 0 (task type) prevents rebuild-vs-reskin mistakes
- Rule priority system resolves conflicts (task_type > style > age > environment)
- Influence weights replace binary load/skip decisions
- Origin form (Q2.5) establishes degradation baseline
- Silhouette protection prevents over-noising primary shapes
- Outcome logging transforms system into learning brain

**Version History:**
- v1.0 (2026-01-08): Initial interrogation framework, Q0-Q9, forbidden rules
- v1.1 (2026-01-08): Added conflict resolution, influence weights, origin_form, silhouette protection, outcome logging