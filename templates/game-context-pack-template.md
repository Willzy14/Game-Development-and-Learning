# Game Context Pack Template

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Purpose:** Per-game AI context for continuation sessions

> Copy this template when starting a new game. Fill in all sections to provide AI assistants with complete game-specific context.

---

## Game Identity

**Game Name:** [e.g., "Lantern Spirit"]  
**Game Type:** [e.g., Platformer, Racing, Shooter, Puzzle]  
**Tier:** [e.g., Tier 2 - Core Mechanics]  
**Location:** [`games/tier-X/NNN-game-name/`]  
**Status:** [🚧 In Progress / ✅ Complete / ⏸️ Paused]

**Started:** [Date]  
**Completed:** [Date or N/A]  
**Lead Developer:** [Human username or "AI Pair Programming"]

---

## Design Goal

**One-Sentence Goal:**
[e.g., "Mystical swamp platformer with lantern-themed collectibles and ethereal atmosphere"]

**Core Experience:**
[What should the player feel? What's the primary emotion/experience?]

**Unique Hook:**
[What makes this game different from others in the genre?]

**Success Criteria:**
[How do you know when this game is "done"? What are the must-have features?]

---

## Constraints

### Tier Constraints
[What skills is this game designed to teach? What's out of scope for current tier?]

**In Scope:**
- [ ] [Skill 1]
- [ ] [Skill 2]
- [ ] [Skill 3]

**Out of Scope (for this tier):**
- [ ] [Advanced feature 1]
- [ ] [Advanced feature 2]

### Time/Complexity Constraints
**Target Development Time:** [e.g., 2-3 sessions]  
**Max Complexity:** [e.g., Single level, 3 enemy types, simple UI]

### Technical Constraints
**Platform:** [e.g., JavaScript + Canvas 2D]  
**Performance Target:** [e.g., 60fps]  
**Resolution:** [e.g., 800x600 or responsive]  
**Mobile Support:** [Required / Nice-to-have / Not planned]

---

## Architecture (Rule 11)

> CRITICAL: This game MUST use modular architecture to prevent reskin disasters

### File Structure
```
NNN-game-name/
├── index.html       # Loads all 3 modules
├── game.js          # MECHANICS ONLY ⚠️
├── theme.js         # VISUALS ONLY
└── audio.js         # AUDIO ONLY
```

### What Goes Where

**game.js (Mechanics - NEVER touch in reskins):**
- [ ] Physics (gravity, velocity, acceleration)
- [ ] Collision detection
- [ ] Scoring/combo systems
- [ ] Game states (menu, playing, game over)
- [ ] Input handling (key mapping only)
- [ ] Level progression
- [ ] Lives/health systems
- [ ] Spawn logic

**theme.js (Visuals - change freely in reskins):**
- [ ] All canvas rendering (shapes, sprites, particles)
- [ ] Color palettes
- [ ] Visual effects (glow, shadows, trails)
- [ ] Background/parallax layers
- [ ] UI rendering (score, lives, etc.)
- [ ] Animations (frame-based or procedural)

**audio.js (Audio - change freely in reskins):**
- [ ] Sound effect synthesis/playback
- [ ] Music system
- [ ] Audio parameters (frequencies, volumes)
- [ ] Audio state management

---

## Shared Library Components

> Check `shared-library/` before reimplementing common patterns

### Using Existing Components

**Audio System** (`shared-library/audio/AudioSystem.js`):
- [ ] Used: Yes / No
- [ ] Notes: [How it's integrated]

**Collision Utils** (`shared-library/collision/CollisionUtils.js`):
- [ ] Used: Yes / No
- [ ] Notes: [Which collision functions used]

**Other Components:**
- [ ] [Component name]: [Usage notes]

### Patterns to Extract (After Rule of Three)
[If this is the 3rd+ game using a pattern, note it for shared-library extraction]

- [ ] [Pattern name] — Used in: [Game 1, Game 2, THIS GAME]

---

## Known Pitfalls (from FAILURE_ARCHIVE)

> Mistakes to avoid specific to this game type

### Genre-Specific Pitfalls
[Check `docs/FAILURE_ARCHIVE.md` for failures related to this game genre]

1. **[Pitfall 1]**
   - **Origin:** [Which game failed this way]
   - **Prevention:** [How to avoid]

2. **[Pitfall 2]**
   - **Origin:** [Which game failed this way]
   - **Prevention:** [How to avoid]

### Architecture Pitfalls
1. **Reskin changing mechanics** (Inca Breakout, Jan 6 2026)
   - **Prevention:** Follow Rule 11 strictly. `game.js` is SACRED.
   - **Validation:** Diff `game.js` constants before/after any "visual-only" changes

2. **[Game-specific pitfall]**
   - **Origin:** [Where this failed]
   - **Prevention:** [How to avoid in this game]

---

## Bible Documents (Most Relevant)

> Don't memorize — just know which docs to reference during implementation

### Core (Always Load)
- [ ] `docs/bible/01-CORE_RULES.md` — 13 non-negotiable rules
- [ ] `docs/bible/17-MODULAR_ARCHITECTURE.md` — Rule 11 enforcement

### For This Game Type
[Select relevant docs based on game genre and focus]

**Gameplay:**
- [ ] `docs/bible/04-PATTERNS_REFERENCE.md` — [If using state machines, object pooling]
- [ ] [Other gameplay doc]

**Visuals:**
- [ ] `docs/bible/03-VISUAL_TECHNIQUES.md` — [If using gradients, glow, particles]
- [ ] `docs/bible/11-CANVAS_PATTERNS.md` — [Reusable Canvas code]
- [ ] `docs/bible/19-COLOR_HARMONY.md` — [If specific palette work]
- [ ] [Other visual doc]

**Audio:**
- [ ] `docs/bible/02-AUDIO_MASTERY.md` — [Web Audio patterns]

**Art Quality:**
- [ ] `docs/bible/12-EDGE_MASTERY.md` — [For realistic/painterly rendering]
- [ ] `docs/bible/13-MATERIAL_LOGIC.md` — [Form → material → atmosphere]
- [ ] [Other art doc]

---

## Definition of Done

> Measurable criteria for completion (not subjective "feels done")

### Core Mechanics (game.js)
- [ ] [Mechanic 1] implemented and tested
- [ ] [Mechanic 2] implemented and tested
- [ ] Win condition works
- [ ] Lose condition works
- [ ] Restart works without page refresh
- [ ] No console errors during normal play

### Visual Polish (theme.js)
- [ ] Art quality matches `/art-studies/` level (not bare minimum)
- [ ] Color palette established and consistent
- [ ] [Visual effect 1] implemented
- [ ] [Visual effect 2] implemented
- [ ] UI elements readable and styled

### Audio (audio.js)
- [ ] Background music starts on user gesture
- [ ] Music responds to game intensity
- [ ] All major actions have sound effects
- [ ] Audio can be muted/unmuted
- [ ] No audio glitches or pops

### Performance
- [ ] Maintains [60fps / 30fps] during normal gameplay
- [ ] No memory leaks (play for 5+ minutes)
- [ ] Loads in < [X] seconds

### Documentation
- [ ] Code comments explain WHY, not WHAT
- [ ] Magic numbers have named constants
- [ ] Outcome log completed (`outcomes/`)
- [ ] Retrospective written (if game complete)

### Optional (Nice-to-Have)
- [ ] Mobile controls implemented
- [ ] Fullscreen mode
- [ ] High score persistence
- [ ] [Other optional feature]

---

## Current Implementation Status

**Last Updated:** [Date]  
**Current Session:** [Session number or date]

### Completed Features
- [x] [Feature 1] — [Completion date]
- [x] [Feature 2] — [Completion date]

### In Progress
- [ ] [Feature 3] — [Status notes]

### Blocked/Pending
- [ ] [Feature 4] — [Why blocked]

### Known Bugs
1. [Bug description] — [Severity: Critical/High/Medium/Low]
2. [Bug description] — [Severity]

### Next Session Goals
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

---

## Quick Start (For AI Continuation)

**To resume work on this game:**

1. **Read this CONTEXT_PACK.md completely**
2. **Load current code:**
   ```bash
   cd [game directory]
   cat game.js theme.js audio.js
   ```
3. **Check ACTIVE_WORK.md for recent changes**
4. **Test current build:**
   ```bash
   python -m http.server 8080
   ```
5. **Identify next task from "Current Implementation Status"**
6. **Reference relevant Bible docs (don't memorize)**
7. **Implement incrementally (Rule 1)**
8. **Test after each change**

---

## Files Modified (Git-Style Tracking)

**Session 1 ([Date]):**
- Created: `index.html`, `game.js`, `theme.js`, `audio.js`
- Implemented: [Core mechanics]

**Session 2 ([Date]):**
- Modified: `theme.js` — [What changed]
- Modified: `audio.js` — [What changed]

**Session 3 ([Date]):**
- Modified: `game.js` — [What changed and WHY]
- Modified: `theme.js` — [What changed]

[Continue logging changes for transparency]

---

## Notes & Reflections

**What's Working Well:**
- [Observation 1]
- [Observation 2]

**Challenges/Concerns:**
- [Challenge 1]
- [Challenge 2]

**Ideas for Future Versions:**
- [Enhancement 1]
- [Enhancement 2]

---

**Template Version:** 1.0  
**Last Template Update:** January 9, 2026
