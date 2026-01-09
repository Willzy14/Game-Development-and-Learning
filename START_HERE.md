# START HERE — AI Context Bootstrap

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Purpose:** Single-file AI onboarding for Game Development & Learning repository

> **For AI Assistants:** Copy this entire file into your context when starting a new session. This provides everything you need to understand the repo structure, rules, and workflow. Read this FIRST, then follow the loading procedure below.

> **⚠️ PROTECTION NOTICE:** This file only updates on MAJOR triggers (tier completion, tech stack change, new rule, shared library extraction, major milestone). For session-to-session notes, use `/SESSION_HANDOFF.md`. DO NOT rewrite this file for session notes!

---

## What This Repo Is

**Game Development and Learning** = Progressive game development from fundamentals → production-ready games, with scientific reflection and reusable pattern extraction.

**Goal:** Progress from Tier 1 → Tier 6, building games that demonstrate increasing complexity. Extract code to `shared-library/` only after Rule of Three (used in 3+ games).

**Philosophy:** 
- Incremental learning (complete games before moving to next tier)
- Failure as data (document what doesn't work in FAILURE_ARCHIVE.md)
- Reusability through proof (Rule of Three prevents premature abstraction)
- Complete or consciously abandon (no half-finished projects)

---

## Current State (Update This Section)

**Current Tier:** Tier 2 (Core Mechanics) — In Progress  
**Tech Stack:** JavaScript + HTML5 Canvas 2D (Tier 1-2 complete)  
**Future Stack:** Unity/Godot evaluation at Tier 3 transition  
**Games Completed:** 7 (Pong, Breakout, Space Invaders, Snake, Flappy Bird, Asteroids v2, Platformer base)  
**Active Work:** Platformer "Lantern Spirit" polish (see `docs/ACTIVE_WORK.md`)  
**Shared Libraries:** 2 extracted (Audio System, Collision Utils)  
**Decision-Graph Status:** v1.1 operational, v1.2 spec validated but deferred

---

## The 13 Non-Negotiable Rules

> These rules exist because we broke them and paid the price. They are NEVER optional.

### Rule 1: Incremental Development
- ❌ Add multiple features at once
- ✅ Add one feature → test → add next
- **Origin:** Space Invaders V2 cascade failure

### Rule 2: Backup Before Changes
- Copy entire folder before major modifications
- Test backup works before proceeding
- **Naming:** `[game]-v[N]-[description]/`

### Rule 3: HTML IDs Before JavaScript
- Write HTML with all IDs first
- Copy IDs exactly to JavaScript
- **Origin:** Snake null reference errors

### Rule 4: Test After Each Change
- Code change → restart server → hard refresh → test
- Catch cascading problems immediately

### Rule 5: Audio Requires User Gesture
- Initialize audio from keypress/click event
- **Origin:** Browser autoplay policy

### Rule 6: Quality Over Speed
- V2+ must keep ALL V1 features + add more
- Never strip features for "speed"
- **Origin:** Snake V2 initial laziness

### Rule 7: Background Music Is Required
- Music transforms functional → immersive
- Must respond to game intensity
- **Origin:** Snake V1 missing music

### Rule 8: NEVER Be Lazy ⭐
- V2+ must demonstrate SIGNIFICANT improvement
- This is a LEARNING PROJECT
- **Origin:** Snake V2 copied V1 with color change

### Rule 9: Folder Nesting Protocol
- V2+ folders nest inside parent
- ✅ `001-pong/001-pong-v2-mastery/`
- ❌ `001-pong/` + `001-pong-v2-mastery/` (same level)

### Rule 10: V2+ Versions Must Upgrade EVERYTHING
- New visual techniques (not just colors)
- Enhanced audio (new music system, better SFX)
- Keep ALL V1 features + add more

### Rule 11: Separate Mechanics from Presentation ⭐⭐
**CRITICAL — Prevents reskin disasters**
- `game.js` → MECHANICS ONLY (physics, collision, scoring)
- `theme.js` → VISUALS ONLY (colors, rendering, effects)
- `audio.js` → SOUNDS ONLY (effects, music)
- New levels = swap theme + audio ONLY
- **Origin:** Inca Breakout changed 11 gameplay constants in "reskin"

### Rule 12: Never Self-Censor Your Vision ⭐
- Delivery limits ≠ quality constraints
- Plan in chunks, deliver ALL features
- **Origin:** Jungle Theme V2 held back fireflies/light rays

### Rule 13: Planning Documents for Complex Projects ⭐
- Determine task type FIRST (Q0: new/reskin/extend/fix)
- Create planning doc via interrogation (Q0-Q9)
- Use planning doc as external memory
- **Origin:** Final Piece V2 prevented cognitive overload

---

## Where Truth Lives (Source of Truth Files)

### Core Rules & Philosophy
- **BIBLE_INDEX.md** (`docs/bible/`) — Master index, read FIRST for any new work
- **01-CORE_RULES.md** (`docs/bible/`) — Expanded rules with prevention checklists (925 lines)
- **DEVELOPMENT_PHILOSOPHY.md** (`docs/`) — Why this repo exists

### Failure Prevention
- **FAILURE_ARCHIVE.md** (`docs/`) — Documented mistakes to never repeat (406 lines)
- **Retrospectives** (`docs/retrospectives/`) — Per-game deep reflection

### Progress Tracking
- **ACTIVE_WORK.md** (`docs/`) — Current multi-session projects
- **LEARNING_JOURNEY.md** (`docs/`) — High-level progress, tier status
- **SKILLS_TRACKER.md** (`docs/`) — Skills checklist with confidence ratings

### Decision-Graph System
- **DECISION_GRAPH_V1.2_SPEC.md** (`docs/`) — v1.2 specification (validated, deferred)
- **interrogate.js** (`tools/planning-generator/`) — Planning doc generator (v1.1 operational)
- **Outcome Logs** (`outcomes/`) — Learning pattern memory with query system

### Reusable Code
- **shared-library/** — Extracted components (Rule of Three only)
  - `audio/AudioSystem.js` — Web Audio patterns
  - `collision/CollisionUtils.js` — AABB collision helpers
  - `README.md` — Extraction guidelines

### Templates
- **game-project-template.md** (`templates/`) — New game kickoff structure
- **game-retrospective-template.md** (`templates/`) — Post-game reflection
- **weekly-log-template.md** (`templates/`) — Session documentation
- **AI_INDEX.yaml** (`docs/`) — Structured repo index for task routing

---

## Loading Procedure (Do This Every New Session)

### Step 1: Determine Task Type
**Ask yourself:** What am I being asked to do?
- New game? → Load Decision Graph workflow (Q0-Q9 interrogation)
- Reskin existing game? → Load Rule 11 (modular architecture)
- Art study? → Load Bible docs 10-24 (art fundamentals)
- Extend feature? → Check existing game code first
- Debug/fix? → Check `FAILURE_ARCHIVE.md` for similar issues

### Step 2: Load Relevant Bible Sections
**Always start with:**
1. Open `docs/bible/BIBLE_INDEX.md`
2. Scan rules relevant to today's task
3. Note which detailed docs to reference (don't memorize, just know where they are)

**For game development:**
- Core Rules (01) — Always relevant
- Audio (02) — If building sound/music
- Visual Techniques (03, 11, 14) — For rendering
- Modular Architecture (17) — For ANY game (Rule 11)
- Decision Graph (09) — For new projects

**For art work:**
- Art Fundamentals (10-24) — Classical theory, composition, color, materials
- Edge Mastery (12) — Critical for realistic rendering
- Realism Degradation (24) — How to break perfection

### Step 3: Scan Failure Archive
1. Open `docs/FAILURE_ARCHIVE.md`
2. Search for failures related to current task
3. Note prevention strategies

**Key failures to always remember:**
- Code in conversation ≠ code on disk (always use file tools)
- "Different" ≠ "slightly modified" (V2 must be unrecognizable)
- Chunking ≠ less detail (organization, not reduction)
- Reskin can't change mechanics (Rule 11)

### Step 4: Check Current State
1. Read `docs/ACTIVE_WORK.md` — What's in progress?
2. Read `docs/LEARNING_JOURNEY.md` — What tier? What's been completed?
3. Check `shared-library/README.md` — What's reusable?

### Step 5: Begin Work
- Always propose: Plan → File targets → Implementation steps
- Always ask if missing critical choices
- Always end with: "What to log" (weekly log, retrospective, failures)

---

## Output Protocol

### When Starting Work
1. **Acknowledge** task type and scope
2. **Propose plan** with clear phases
3. **List file targets** (what will be created/modified)
4. **Ask clarifying questions** if needed (don't guess)

### During Implementation
1. **Use file tools** (create_file, replace_string_in_file) — don't just show code
2. **Test incrementally** (Rule 1)
3. **Provide progress updates** for multi-step work

### When Completing Work
1. **Summary** of what was built
2. **What to log:**
   - Update `LEARNING_JOURNEY.md` if skill learned
   - Update `SKILLS_TRACKER.md` if new confidence level
   - Update `ACTIVE_WORK.md` if multi-session project
   - Create retrospective if game complete
   - Add to `FAILURE_ARCHIVE.md` if mistake made

---

## Special Workflows

### Starting a New Game (MANDATORY)
1. **Run Decision Graph interrogation** (Q0-Q9)
   - Answer Q-0a FIRST: new/scaffold/reskin/extend/fix
   - If new game: Q0.6 (platform), genre detection, Q1-Q9 (visuals)
   - Generate planning doc via `node tools/planning-generator/interrogate.js`
   - Follow planning doc only during implementation
2. **Check pre-flight:**
   - `shared-library/` — reusable components?
   - `docs/SKILLS_TRACKER.md` — already learned?
   - Previous games in same tier — patterns to reuse?
   - `docs/FAILURE_ARCHIVE.md` — mistakes to avoid?
3. **Use modular architecture** (Rule 11):
   - `game.js` — mechanics only
   - `theme.js` — visuals only
   - `audio.js` — audio only
6. **Complete outcome log** after game done (save to `outcomes/`)

### Reskinning a Game
1. **Q0 answer MUST be "B - Reskin"**
2. **Load Rule 11** — mechanics/presentation separation
3. **Only modify:**
   - ✅ `theme.js` — all rendering functions
   - ✅ `audio.js` — all sounds/music
   - ❌ `game.js` — NEVER TOUCH (mechanics are sacred)
4. **Validation:** Gameplay must be identical to original

### Extracting to Shared Library
1. **Rule of Three:** Used in 3+ games? If no, STOP.
2. **Document origin games** in component header
3. **Test extraction** in original games
4. **Update `shared-library/README.md`**
5. **Update `docs/AI_INDEX.yaml`** shared_library section

---

## Self-Maintenance Instructions

> **For AI Assistants:** Keep this file synchronized with repo state. Update when these triggers occur:

### Update Triggers

**Update "Current State" section when:**
- [ ] Tier completed (e.g., Tier 2 → Tier 3)
- [ ] Tech stack changes (e.g., Canvas → Unity)
- [ ] Shared library extracted (update count)
- [ ] Decision-graph version changes (v1.1 → v1.2)
- [ ] Major milestone (10 games, production release)

**Add new rule when:**
- [ ] Rule 14+ added to `docs/bible/01-CORE_RULES.md`
- [ ] Compress new rule to bullet format here
- [ ] Note origin (which failure triggered it)

**Update file map when:**
- [ ] New critical document added to `docs/bible/`
- [ ] New template created
- [ ] Repo reorganization

**Version this file when:**
- [ ] Major updates (tier transitions, tech stack changes)
- [ ] Archive old version to `docs/archive/START_HERE_v1.0.md`
- [ ] Increment version number in header

### Self-Healing Protocol
1. **If START_HERE.md contradicts ACTIVE_WORK.md or LEARNING_JOURNEY.md:**
   - Update START_HERE.md to match current state
   - Log sync in `docs/weekly-logs/`

2. **If Bible adds new rule:**
   - Add compressed version here
   - Update rule count (13 → 14)
   - Note in header "Last Updated"

3. **If shared-library component passes Rule of Three:**
   - Update "Current State" shared library count
   - Update `docs/AI_INDEX.yaml` shared_library section
   - Verify component documented in `shared-library/README.md`

### Validation Checklist
- [ ] START_HERE.md current state matches `ACTIVE_WORK.md`
- [ ] Rule count matches `BIBLE_INDEX.md`
- [ ] Shared library count matches `shared-library/README.md`
- [ ] Tech stack matches `README.md`
- [ ] File paths in "Where Truth Lives" are correct

---

## Quick Reference: Task Routing

**I want to...**
- **Build a new game** → Run Decision Graph (Q0-Q9), generate planning doc
- **Reskin a game** → Load Rule 11, modify theme.js + audio.js only
- **Create art study** → Load Bible docs 10-24 (art fundamentals)
- **Add feature to existing game** → Check game code, verify mechanics vs visuals
- **Debug an error** → Check `FAILURE_ARCHIVE.md` for similar issues
- **Extract to shared library** → Verify Rule of Three, follow extraction workflow
- **Understand the system** → Read `docs/DEVELOPMENT_PHILOSOPHY.md`

---

## Detailed Index

For structured, machine-readable repo index with task routing and update triggers, see:
**`docs/AI_INDEX.yaml`**

---

**Last Validation:** January 9, 2026  
**Next Scheduled Update:** Tier 3 transition or tech stack decision
