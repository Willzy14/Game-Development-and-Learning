# Planning Document Generator

**Version:** 1.0 (DECISION_GRAPH v1.1 compatible)  
**Created:** January 8, 2026  
**Purpose:** Interactive interrogation script that automates Q0-Q9 workflow

---

## Quick Start

```bash
cd /workspaces/Game-Development-and-Learning
node tools/planning-generator/interrogate.js
```

Generates `PLANNING-[DATE].md` in current directory with:
- Q0-Q9 answers
- Conflict resolution
- Auto-loaded docs with influence weights
- Forbidden rules
- Outcome log template

---

## Features

✅ Q0-Q9 Interrogation (+ conditional Q2.5)  
✅ Conflict detection with priority system  
✅ Influence weights (0.0-1.0, not binary)  
✅ Forbidden rules auto-population  
✅ Planning doc generation (<300 lines)  
✅ Outcome log template

---

## Questions

### Q0: Task Type (Priority 100 - ALWAYS WINS)
- `new` - Build from scratch
- `reskin` - Change appearance only
- `extend` - Add features
- `fix` - Debug/correct

### Q1: Style (Priority 80)
photorealistic | painterly_impressionist | painterly_expressionist | stylized_realistic | abstract_geometric | abstract_organic | minimalist | maximalist

### Q2: Age (0-100, Priority 70)
0=new, 50=weathered, 100=ancient

### Q2.5: Origin Form (Conditional: age>50 AND realistic)
perfect_geometric | crafted_architectural | organic_natural | composite

### Q3-Q9: Material, Environment, Lighting, Composition, Color, Techniques, Requirements

---

## Conflict Resolution

Priority system:
```
task_type: 100
style: 80
age: 70
environment: 60
material: 50
composition: 40
color/lighting: 30
```

Example: Reskin + Ancient → task_type wins (preserve logic, age affects rendering only)

---

## Influence Weights

0.0-1.0 scale replaces binary LOAD/SKIP:

- 1.0 = Must follow
- 0.7-0.9 = Strong influence
- 0.4-0.6 = Moderate
- 0.1-0.3 = Suggest only
- 0.0 = Skip

Example: Painterly style → REALISM_DEGRADATION influence 0.3 (suggest, not simulate)

---

## Forbidden Rules

6 rule classes evaluated:

1. **perfect_geometry** - If age>50 or harsh environment
2. **smooth_gradients** - If painterly style
3. **chaotic_noise** - If simple composition or reskin
4. **environment_mismatch** - If environment specified
5. **style_contamination** - If style specified
6. **silhouette_protection** - If readability required or reskin (max threshold 0.6)

---

## Output Format

```markdown
# Planning Document

## 1. Scene Interrogation (Q0-Q9)
[All answers with task_type first]

## 2. Conflict Resolution
[Detected conflicts with resolutions]

## 3. Bible Document Loading
[Loaded: docs with weights + reasons]
[Skipped: docs with reasons]

## 4. Forbidden Rules
[Active constraints with forbidden/required lists]

## 5. Implementation Notes
[Task-specific guidance, technique references]

## 6. Outcome Log Template
[JSON template for post-completion]
```

---

## Example Scenarios

### Reskin Pong (Painterly)
```
Q0: reskin
Q1: painterly_impressionist
Result: 7 docs loaded, 3 skipped, 3 forbidden rules
Key: Silhouette protection active (readability + reskin)
```

### Ancient Underwater Temple
```
Q0: new
Q1: stylized_realistic
Q2: 85, Q2.5: crafted_architectural
Result: 10 docs loaded, 2 forbidden rules, heavy degradation
```

### Abstract Portrait
```
Q0: new
Q1: abstract_organic
Q2: 0
Result: 6 docs loaded, skips realism/degradation, 1 forbidden rule
```

---

## Troubleshooting

**"Invalid option"** → Enter numbers (1,2,3), not text  
**Q2.5 skipped** → Expected if age≤50 or not realistic  
**Too many/few docs** → Answer-dependent (reskin loads fewer)  
**Script hangs** → Press Enter after typing

---

## Integration

**Before:** Run interrogate.js, review planning doc  
**During:** Follow loaded docs per influence weights  
**After:** Fill outcome log, save to `/outcomes/`

---

## Related Docs

- `DECISION_GRAPH.md` - Framework implemented
- `CORE_RULES.md` (Rule 13) - Planning structure
- `SESSION_LOG.md` (Part 7) - Development history

---

**Status:** ✅ Production Ready  
**Last Updated:** January 8, 2026
