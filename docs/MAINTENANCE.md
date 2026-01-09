# AI Context System Maintenance Guide

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Purpose:** Instructions for AI assistants to keep START_HERE.md and AI_INDEX.yaml synchronized with repo state

---

## Overview

This repo has a **self-growing AI context system** designed to stay accurate as the repository evolves. As an AI assistant working in this repo, you are responsible for keeping these files up-to-date.

**Core Files:**
- **`START_HERE.md`** — Human-readable AI onboarding (narrative format)
- **`docs/AI_INDEX.yaml`** — Machine-readable repo map (structured format)
- **`docs/MAINTENANCE.md`** — This file (maintenance instructions)

---

## When to Update (Trigger Conditions)

### 1. Tier Completion or Transition

**Trigger:** When a tier is marked complete (e.g., Tier 2 → Tier 3)

**Files to Update:**
- `START_HERE.md` → "Current State" section
  - Update `Current Tier`
  - Update `Games Completed` count
  - Update `Active Work`
  
- `docs/AI_INDEX.yaml` → `current_state` section
  - Update `tier`
  - Update `tier_status`
  - Update `games_completed`
  - Update `games_list` array
  - Update `active_work`

**Validation:**
- [ ] START_HERE.md matches ACTIVE_WORK.md
- [ ] START_HERE.md matches LEARNING_JOURNEY.md
- [ ] AI_INDEX.yaml matches both

**Example:**
```yaml
# Before
tier: "Tier 2 (Core Mechanics)"
tier_status: "In Progress"

# After
tier: "Tier 3 (Character Control)"
tier_status: "In Progress"
```

---

### 2. Tech Stack Change

**Trigger:** When tech stack changes (e.g., Canvas → Unity, JavaScript → C#)

**Files to Update:**
- `START_HERE.md` → "Current State" section
  - Update `Tech Stack`
  - Update `Future Stack` (if applicable)
  
- `README.md` → "Current Progress" section
  - Update tech stack line
  
- `docs/AI_INDEX.yaml` → `current_state` section
  - Update `tech_stack`
  - Update `future_stack`
  
- `docs/AI_INDEX.yaml` → `task_routing` section
  - Add new engine-specific workflows
  - Update file paths for new stack
  
- `docs/AI_INDEX.yaml` → `bible_docs` section
  - Add new stack-specific documentation
  - Mark old docs as "Canvas 2D legacy"

**Validation:**
- [ ] All four files agree on current stack
- [ ] Task routing reflects new stack
- [ ] Bible docs updated for new stack

**Archive:**
- [ ] Archive old START_HERE.md to `docs/archive/START_HERE_v1.0_canvas.md`
- [ ] Increment START_HERE.md version number

---

### 3. Shared Library Extraction (Rule of Three)

**Trigger:** When a pattern is used in 3+ games and extracted to `shared-library/`

**Files to Update:**
- `START_HERE.md` → "Current State" section
  - Increment `Shared Libraries` count
  
- `docs/AI_INDEX.yaml` → `current_state.shared_libraries`
  - Increment count
  
- `docs/AI_INDEX.yaml` → `shared_library.extracted`
  - Add new entry with:
    - `name`
    - `path`
    - `origin_games` (which 3+ games)
    - `description`
  
- `docs/AI_INDEX.yaml` → `shared_library.candidates`
  - Remove entry if promoted from candidates
  
- `shared-library/README.md`
  - Add component documentation (origin, usage)

**Validation:**
- [ ] Component exists at specified path
- [ ] Origin games count ≥ 3
- [ ] shared-library/README.md documents component
- [ ] START_HERE.md count matches actual count

**Example:**
```yaml
shared_library:
  extracted:
    - name: "Particle System"
      path: shared-library/particles/ParticleSystem.js
      origin_games: ["Snake", "Asteroids", "Platformer"]
      description: "Pooled particle system with emitters"
```

---

### 4. New Core Rule Added

**Trigger:** When Rule 14+ is added to `docs/bible/01-CORE_RULES.md`

**Files to Update:**
- `START_HERE.md` → "The 13 Non-Negotiable Rules" section
  - Change title to "The 14 Non-Negotiable Rules"
  - Add new rule in compressed bullet format
  - Include **Origin** note
  
- `START_HERE.md` → Header
  - Update "Last Updated" date
  
- `docs/AI_INDEX.yaml` → Header
  - Update `last_updated` timestamp

**Validation:**
- [ ] Rule count in START_HERE.md matches BIBLE_INDEX.md
- [ ] New rule has origin story
- [ ] New rule formatted consistently

**Example:**
```markdown
### Rule 14: [Rule Name] ⭐
- ❌ Don't do this
- ✅ Do this instead
- **Origin:** [Which failure triggered this rule]
```

---

### 5. New Bible Document Added

**Trigger:** When new doc created in `docs/bible/`

**Files to Update:**
- `docs/AI_INDEX.yaml` → `bible_docs` section
  - Add to appropriate category (meta/foundational/technical/art_fundamentals)
  
- `docs/AI_INDEX.yaml` → `task_routing` section
  - If relevant to specific tasks, add to must_load or optional_load
  
- `START_HERE.md` → "Where Truth Lives" section
  - If critical doc, add to source-of-truth list

**Validation:**
- [ ] File path correct
- [ ] Categorized appropriately
- [ ] Task routing updated if needed

---

### 6. Decision-Graph Version Change

**Trigger:** When v1.2 is implemented OR v1.3 is created

**Files to Update:**
- `START_HERE.md` → "Current State" section
  - Update `Decision-Graph Status`
  
- `docs/AI_INDEX.yaml` → `decision_graph` section
  - Update v1_1.status (if superseded)
  - Update v1_2.status (if implemented)
  - Add v1_3 section (if new version)
  
- `docs/AI_INDEX.yaml` → `current_state`
  - Update `decision_graph_version`

**Validation:**
- [ ] interrogate.js version matches documented status
- [ ] Planning doc template references correct version
- [ ] ACTIVE_WORK.md reflects version status

---

### 7. Major Milestone Reached

**Trigger:** 10 games complete, Tier 3 start, production release, etc.

**Files to Update:**
- `START_HERE.md` → Header
  - Increment version (1.0 → 1.1 or 2.0)
  - Update "Last Updated"
  - Update "Next Scheduled Update"
  
- `docs/AI_INDEX.yaml` → Header
  - Increment version
  - Update `last_updated`
  
- Archive old versions:
  - `docs/archive/START_HERE_v1.0.md`
  - `docs/archive/AI_INDEX_v1.0.yaml`

**Validation:**
- [ ] Version numbers incremented
- [ ] Old versions archived
- [ ] "Current State" reflects milestone

---

## Self-Healing Protocol

### When Contradictions Are Found

**If START_HERE.md contradicts ACTIVE_WORK.md:**
1. Determine source of truth (usually ACTIVE_WORK.md for current projects)
2. Update START_HERE.md "Current State" to match
3. Update AI_INDEX.yaml `current_state` to match
4. Log sync in `docs/weekly-logs/YYYY-MM-DD.md`

**If Rule count doesn't match:**
1. Count rules in `docs/bible/BIBLE_INDEX.md` (source of truth)
2. Update START_HERE.md rule list
3. Ensure all rules documented

**If Tech stack ambiguous:**
1. Check README.md "Current Progress"
2. Check LEARNING_JOURNEY.md current tier
3. Make explicit decision, document in all three files
4. Remove ambiguity phrases like "to be decided"

---

## Validation Checklist

**Run this checklist monthly or before major updates:**

### File Synchronization
- [ ] START_HERE.md "Current State" matches ACTIVE_WORK.md
- [ ] START_HERE.md "Current State" matches LEARNING_JOURNEY.md
- [ ] AI_INDEX.yaml `current_state` matches START_HERE.md
- [ ] README.md "Current Progress" matches START_HERE.md

### Rule Count
- [ ] START_HERE.md rule count matches BIBLE_INDEX.md
- [ ] All rules have origin stories

### Shared Library
- [ ] Shared library count accurate
- [ ] All extracted components exist at documented paths
- [ ] shared-library/README.md lists all components

### File Paths
- [ ] All paths in START_HERE.md valid
- [ ] All paths in AI_INDEX.yaml valid
- [ ] No 404s when following links

### Tech Stack
- [ ] No ambiguous phrases like "to be decided"
- [ ] Clear which stack for which tier
- [ ] Future transitions documented

---

## How to Update Files

### Editing START_HERE.md

**Use text editor or replace_string_in_file tool:**

```markdown
# Find this section
## Current State (Update This Section)

**Current Tier:** Tier 2 (Core Mechanics) — In Progress

# Update with new values
## Current State (Update This Section)

**Current Tier:** Tier 3 (Character Control) — In Progress
```

**Always update:**
- "Current State" section (top of file)
- "Last Updated" in header
- Any affected rule summaries

### Editing AI_INDEX.yaml

**YAML format - be precise with indentation:**

```yaml
# Find this section
current_state:
  tier: "Tier 2 (Core Mechanics)"
  tier_status: "In Progress"

# Update with new values
current_state:
  tier: "Tier 3 (Character Control)"
  tier_status: "In Progress"
```

**Always update:**
- `current_state` section
- `last_updated` timestamp
- Any affected task routing or doc lists

### Editing README.md

**Update "Current Progress" section:**

```markdown
# Find
**Current Tier**: 2 (Core Mechanics) — In Progress

# Update
**Current Tier**: 3 (Character Control) — In Progress
```

---

## Logging Updates

**When you update START_HERE.md or AI_INDEX.yaml, log it:**

**Location:** `docs/weekly-logs/YYYY-MM-DD.md`

**Format:**
```markdown
## AI Context System Updates

**Date:** YYYY-MM-DD  
**Trigger:** [What caused the update]  
**Files Updated:** START_HERE.md, AI_INDEX.yaml  
**Changes:**
- Updated current tier: Tier 2 → Tier 3
- Incremented games completed: 7 → 10
- Added new shared library: Particle System

**Validation:** ✅ All files synchronized
```

---

## Emergency: Files Badly Out of Sync

**If START_HERE.md is completely wrong:**

1. **Read source-of-truth files:**
   - `docs/ACTIVE_WORK.md`
   - `docs/LEARNING_JOURNEY.md`
   - `docs/SKILLS_TRACKER.md`
   - `shared-library/README.md`

2. **Rebuild START_HERE.md "Current State":**
   - Current tier from LEARNING_JOURNEY.md
   - Tech stack from README.md
   - Games completed from LEARNING_JOURNEY.md
   - Active work from ACTIVE_WORK.md
   - Shared libraries from shared-library/README.md
   - Decision-graph status from ACTIVE_WORK.md

3. **Rebuild AI_INDEX.yaml `current_state`:**
   - Copy same data as START_HERE.md
   - Use structured YAML format

4. **Archive old version:**
   - `mv START_HERE.md docs/archive/START_HERE_broken_$(date +%Y%m%d).md`
   - Create fresh START_HERE.md

5. **Log the rebuild:**
   - Document in weekly log
   - Note what was out of sync
   - Add validation checklist to prevent recurrence

---

## Testing Updates

**After updating START_HERE.md or AI_INDEX.yaml:**

1. **Paste START_HERE.md into a new AI chat**
   - Does it provide accurate context?
   - Are there contradictions?
   - Is current state correct?

2. **Check file paths:**
   - Do all referenced files exist?
   - Are paths absolute where needed?

3. **Validate against source of truth:**
   - Run validation checklist above
   - Fix any mismatches

4. **Update "Last Validation" in START_HERE.md:**
   ```markdown
   **Last Validation:** January 9, 2026
   ```

---

## Version History

**START_HERE.md:**
- **v1.0** (January 9, 2026) — Initial AI bootstrap created

**AI_INDEX.yaml:**
- **v1.0** (January 9, 2026) — Initial structured index created

**This File (MAINTENANCE.md):**
- **v1.0** (January 9, 2026) — Initial maintenance guide created

---

## Questions?

**If unsure whether to update:**
- Check ACTIVE_WORK.md for recent changes
- Consult LEARNING_JOURNEY.md for tier status
- When in doubt, err on side of updating (better to over-update than let files drift)

**If major repo restructure:**
- Archive old START_HERE.md + AI_INDEX.yaml
- Increment major version (1.x → 2.0)
- Rebuild from scratch using source-of-truth files

---

**Maintenance Guide Version:** 1.0  
**Last Updated:** January 9, 2026  
**Next Review:** Tier 3 transition or 6 months (whichever first)
