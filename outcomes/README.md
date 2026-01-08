# 📊 Outcome Logs

**Purpose:** Decision memory system - track what worked, what didn't, and learn from each project  
**Part of:** DECISION_GRAPH v1.1 Learning Brain  
**Created:** January 8, 2026

---

## Overview

This directory stores **outcome logs** - structured records of project decisions, applied rules, conflicts resolved, and results. Each log transforms the decision-graph from a static rule engine into a learning brain that improves with every project.

### Why Outcome Logs?

> "You have decision logic, but not decision memory." - v1.1 Critique

Without outcome logs:
- Each project starts from scratch
- Repeat same mistakes
- No pattern recognition
- Can't estimate time accurately

With outcome logs:
- Learn from past decisions
- Build keep/avoid patterns
- Query similar projects
- Improve time estimation
- Create institutional memory

---

## Structure

### File Naming

```
[project-type]-[brief-description]-[date].json
```

**Examples:**
- `reskin-pong-painterly-2026-01-08.json`
- `new-ancient-temple-underwater-2026-01-15.json`
- `extend-breakout-particle-system-2026-01-22.json`

### File Organization

```
/outcomes/
  README.md           ← This file
  template.json       ← Copy this to start new log
  query.js           ← Query helper functions
  
  # Completed project logs
  reskin-pong-painterly-2026-01-08.json
  new-art-study-008-2026-01-05.json
  ... more logs ...
```

---

## Outcome Log Schema

### Required Fields

```json
{
  "project_id": "unique-identifier",
  "date": "YYYY-MM-DD",
  "decisions": { Q0-Q9 answers },
  "applied_rules": [ list of rule names ],
  "loaded_docs": [ Bible docs loaded ],
  "skipped_docs": [ Bible docs skipped ],
  "conflicts_resolved": [ conflict objects ],
  "violations": [ forbidden rule violations if any ],
  "result_quality": { metrics object },
  "result_notes": [ observations ],
  "keep_for_future": [ what worked ],
  "avoid_for_future": [ what didn't work ],
  "time_metrics": { time tracking }
}
```

See `template.json` for complete structure with field descriptions.

---

## Workflow

### 1. During Planning

When running `interrogate.js`, a pre-filled outcome log template is generated in your planning doc (Section 6). Most fields are already populated:
- `decisions` ← Your Q0-Q9 answers
- `loaded_docs` ← Auto-determined docs
- `skipped_docs` ← Auto-determined skipped docs
- `conflicts_resolved` ← Detected conflicts

### 2. During Implementation

Track as you work:
- Note which rules you actually applied
- Flag any forbidden rule violations (hopefully none!)
- Record interesting observations

### 3. After Completion

Fill remaining fields:
- `result_quality` ← Visual fidelity, performance, code quality
- `result_notes` ← What stood out about the project
- `keep_for_future` ← Patterns that worked well
- `avoid_for_future` ← Things to avoid next time
- `time_metrics` ← Actual time spent

### 4. Save to `/outcomes/`

Copy the completed JSON from your planning doc to a new file:

```bash
# From your project directory
cp PLANNING.md /tmp/planning-backup.md

# Extract outcome log JSON (Section 6)
# Save as: /outcomes/[project-type]-[description]-[date].json
```

---

## Querying Outcome Logs

### Using query.js

```javascript
const { queryOutcomes } = require('./query.js');

// Find all reskin projects
const reskins = queryOutcomes({ task_type: 'reskin' });

// Find all painterly projects
const painterly = queryOutcomes({ style: 'painterly_impressionist' });

// Find complex underwater scenes
const complex = queryOutcomes({ 
  environment: 'underwater', 
  composition: 'complex' 
});

// Extract patterns
reskins.keep_patterns;    // What worked in reskins
reskins.avoid_patterns;   // What to avoid in reskins
reskins.typical_time;     // Average time for reskins
```

### Query Results Structure

```json
{
  "matching_projects": [ array of matching logs ],
  "keep_patterns": [ aggregated successes ],
  "avoid_patterns": [ aggregated failures ],
  "typical_time": { average time metrics },
  "common_conflicts": [ frequently resolved conflicts ],
  "common_violations": [ frequently violated rules ]
}
```

---

## Example Use Cases

### Use Case 1: Starting Similar Project

**Scenario:** About to reskin Breakout as painterly

**Query:**
```javascript
queryOutcomes({ 
  task_type: 'reskin', 
  style: 'painterly_impressionist' 
});
```

**Returns:**
- Keep: Broken color, visible brushstrokes, silhouette protection active
- Avoid: Smooth gradients, over-noising primary shapes
- Typical time: Planning 15min, Implementation 90min, Debug 30min

**Result:** Start with proven patterns, avoid known mistakes

---

### Use Case 2: Estimating Time

**Scenario:** Planning complex underwater temple scene

**Query:**
```javascript
queryOutcomes({ 
  task_type: 'new', 
  composition: 'complex',
  environment: 'underwater'
});
```

**Returns:**
- Typical time: Planning 30min, Implementation 180min, Debug 60min
- Common conflicts: environment vs material (environment wins)
- Common challenges: Degradation + water physics interaction

**Result:** Realistic time estimate based on historical data

---

### Use Case 3: Avoiding Repeated Mistakes

**Scenario:** Last project violated silhouette_protection rule

**Query:**
```javascript
queryOutcomes({ violations: { $exists: true } });
```

**Returns:**
- Common violation: over_noising_primary_shape
- Context: Happened when age > 70 AND readability_required
- Solution: Enforce max_noise_threshold = 0.6

**Result:** System learns to warn about this pattern

---

## Keep/Avoid Pattern Examples

### Good Keep Patterns

**From Reskin Projects:**
- "Preserve all game logic, only modify rendering layer"
- "Test gameplay identical to original after reskin"
- "Silhouette protection prevents over-decoration"
- "Use reference image to maintain style consistency"

**From Painterly Projects:**
- "Broken color (multiple colors per area) reads as more authentic"
- "Visible brushwork direction suggests form better than smooth blends"
- "Layer patches of color rather than smooth gradients"
- "Reference CLASSICAL_TECHNIQUES Section III for brush methods"

**From Ancient Degradation:**
- "Origin form (Q2.5) critical for believable degradation"
- "Environment forces determine degradation pattern (not just age)"
- "Silhouette protection keeps readability even with heavy weathering"
- "Asymmetry threshold 0.3 for age 70+, 0.5 for age 90+"

### Good Avoid Patterns

**From Reskin Projects:**
- "Don't modify collision detection 'for realism' - breaks gameplay"
- "Don't add physics effects without explicit requirement"
- "Don't over-noise shapes - silhouette must remain clear"

**From Painterly Projects:**
- "Don't use smooth linear gradients - kills painterly feel"
- "Don't apply degradation at full strength - use influence 0.3"
- "Don't mix realistic detail with abstract forms"

**From Performance-Critical:**
- "Don't recalculate complex shapes every frame"
- "Don't use random noise without caching - kills FPS"
- "Don't create new objects in render loop"

---

## Maintenance

### Adding New Fields

If v1.2+ adds new fields to outcome logs:

1. Update `template.json` with new fields
2. Add field descriptions to this README
3. Update `query.js` to handle new fields
4. Backfill existing logs (optional, but helpful)

### Pruning Old Logs

Generally, **keep all logs** - more data = better learning.

If needed:
- Archive logs older than 1 year to `/outcomes/archive/`
- Keep at least 5 examples per project type
- Never delete logs with unique violations or patterns

---

## Integration with Planning Docs

### Auto-Population

When using `interrogate.js`:

1. **Section 6 of generated planning doc** contains outcome log template
2. Most fields pre-filled from interrogation:
   - `decisions` (Q0-Q9 answers)
   - `loaded_docs` (auto-determined)
   - `skipped_docs` (auto-determined)
   - `conflicts_resolved` (if any detected)

3. You complete after implementation:
   - `applied_rules` (which rules you actually used)
   - `violations` (any forbidden rules broken)
   - `result_quality` (metrics)
   - `result_notes` (observations)
   - `keep_for_future` (successes)
   - `avoid_for_future` (failures)
   - `time_metrics` (actual time)

4. Copy completed JSON to `/outcomes/[name].json`

### Manual Creation

If not using `interrogate.js`:

1. Copy `template.json` to new file
2. Fill all fields manually
3. Save in `/outcomes/` with proper naming

---

## Query Function Reference

See `query.js` for full implementation.

### `queryOutcomes(filters)`

**Parameters:**
- `filters` (object) - Key-value pairs to match against logs

**Returns:**
- `matching_projects` (array) - All matching outcome logs
- `keep_patterns` (array) - Aggregated "keep for future" items
- `avoid_patterns` (array) - Aggregated "avoid for future" items
- `typical_time` (object) - Average time metrics
- `common_conflicts` (array) - Frequently resolved conflicts
- `common_violations` (array) - Frequently violated rules

**Filter Examples:**
```javascript
// By task type
{ task_type: 'reskin' }

// By style
{ style: 'painterly_impressionist' }

// By complexity
{ composition: 'complex' }

// By environment
{ environment: 'underwater' }

// Multiple criteria
{ task_type: 'new', style: 'photorealistic', age: { $gte: 70 } }

// Has violations
{ violations: { $exists: true } }
```

---

## Best Practices

### 1. **Be Honest in result_notes**

Don't whitewash failures - they're learning opportunities:
- ❌ "Project went smoothly"
- ✅ "Over-noisied ball sprite, had to reduce degradation intensity by 50%"

### 2. **Be Specific in keep/avoid patterns**

Vague patterns don't help:
- ❌ "Style worked well"
- ✅ "Broken color technique (3-4 patches per area) created painterly feel without losing form"

### 3. **Track Time Accurately**

Time metrics improve estimation:
- Planning: Time from interrogation to implementation start
- Implementation: Actual coding time (exclude breaks)
- Debugging: Time fixing issues and refining
- Total: Sum of above

### 4. **Document Violations Thoroughly**

If you violated a forbidden rule:
- What rule was broken
- Why it seemed necessary at the time
- What the actual result was
- Whether it was worth it or should be avoided

### 5. **Cross-Reference Bible Docs**

In `applied_rules`, note which sections you used:
- ❌ "Used degradation doc"
- ✅ "REALISM_DEGRADATION.md Section IV.C (Column Erosion Pattern)"

---

## Future Enhancements

### Potential v1.2+ Features

- **Auto-completion from git history** - Parse commit messages for time metrics
- **Visual query interface** - Web UI for browsing outcome logs
- **Pattern mining** - ML analysis of keep/avoid patterns
- **Conflict prediction** - Warn about conflicts before they happen based on history
- **Time estimation** - AI-powered time predictions from historical data

---

## Related Documentation

- **DECISION_GRAPH.md** (Section VII-B) - Outcome logging system spec
- **interrogate.js** - Generates pre-filled outcome logs
- **ACTIVE_WORK.md** - Phase 2 work tracked here
- **SESSION_LOG.md** - Development history

---

**Status:** ✅ Infrastructure Ready  
**First Log:** Pending (Phase 1 will create example)  
**Last Updated:** January 8, 2026
