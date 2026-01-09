# Game Context Pack: Lantern Spirit

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Purpose:** AI context for Platformer continuation sessions

---

## Game Identity

**Game Name:** "Lantern Spirit"  
**Game Type:** Platformer (2D horizontal scrolling)  
**Tier:** Tier 2 - Core Mechanics  
**Location:** `games/tier-2-core-mechanics/007-platformer/`  
**Status:** 🚧 In Progress (playable, needs polish)

**Started:** January 8, 2026  
**Completed:** N/A  
**Lead Developer:** AI Pair Programming (Willzy14)

---

## Design Goal

**One-Sentence Goal:**
"Mystical swamp platformer where a glowing spirit carrying a lantern navigates through floating platforms, collecting wisps in an ethereal atmosphere."

**Core Experience:**
- **Feel:** Floaty, ethereal, mystical (not fast/frantic)
- **Mood:** Quiet contemplation, gentle exploration
- **Primary Emotion:** Wonder and calm (not tension or challenge)

**Unique Hook:**
- **Variable height jump** (hold longer = higher) with **double jump** mechanic
- **Coyote time** (6 frames grace after leaving platform)
- **Painterly ethereal visuals** (not pixel art or vector)
- **Procedural ambient audio** (no samples, pure Web Audio synthesis)
- **Horizontal scrolling camera** follows player through 6000px level

**Success Criteria:**
- ✅ Jump feels good (variable height + double jump working)
- ✅ 5 distinct zones (Tutorial, Ascent, Maze, Gauntlet, Summit)
- ✅ Collectibles (wisps) tracked with UI
- ⏸️ Death/respawn mechanics exist (currently minimal)
- ⏸️ Victory celebration implemented (currently basic text)
- ⏸️ Polish pass on visuals (trees/moss may need tuning)

---

## Constraints

### Tier Constraints
**In Scope (Tier 2 - Core Mechanics):**
- [x] Variable height jumping
- [x] Double jump
- [x] Horizontal scrolling camera
- [x] Platform collision (AABB)
- [x] Simple collectibles
- [x] Procedural level design
- [x] Parallax background layers
- [x] Procedural audio (ambient + SFX)

**Out of Scope (for Tier 2):**
- [ ] Enemies/combat (Tier 3)
- [ ] Advanced AI (Tier 3+)
- [ ] Particle pooling optimization (Tier 4+)
- [ ] Sophisticated save/load (Tier 4+)
- [ ] Multiple levels/worlds (Tier 5+)

### Time/Complexity Constraints
**Target Development Time:** 3-4 sessions  
**Max Complexity:** Single 6000px level, 5 zones, ~30 platforms, simple collectibles

### Technical Constraints
**Platform:** JavaScript + Canvas 2D  
**Performance Target:** 60fps (currently achieving)  
**Resolution:** 800x500 (fixed, no responsive)  
**Mobile Support:** Not planned for Tier 2

---

## Architecture (Rule 11)

> CRITICAL: This game uses modular architecture. `game.js` is SACRED.

### File Structure
```
007-platformer/
├── index.html       # Loads all 3 modules
├── game.js          # MECHANICS ONLY ⚠️ (697 lines)
├── theme.js         # VISUALS ONLY (534 lines)
└── audio.js         # AUDIO ONLY (247 lines)
```

### What Goes Where

**game.js (Mechanics - NEVER touch in reskins):**
- [x] Player physics (velocity, acceleration, friction, gravity)
- [x] Jump logic (variable height, double jump, coyote time)
- [x] Platform collision detection (AABB)
- [x] Camera scrolling (follows player at X > 300)
- [x] Collectible logic (wisp collection)
- [x] Game states (ready, playing, paused, gameover, victory)
- [x] Input handling (arrow keys, WASD)
- [x] Level data (platform coordinates, wisp positions)

**Constants in game.js (DO NOT CHANGE in reskins):**
```javascript
SETTINGS = {
    moveSpeed: 4,
    acceleration: 0.5,
    friction: 0.85,
    gravity: 0.5,
    jumpPower: -12,
    jumpHoldPower: -0.4,
    jumpHoldTime: 15,
    maxFallSpeed: 12,
    doubleJumpPower: -10,
    scrollThreshold: 300,
    scrollSpeed: 4,
    groundY: 450,
    levelLength: 6000,
}
```
**⚠️ WARNING:** Changing these constants = changing gameplay = NOT a reskin!

**theme.js (Visuals - change freely in reskins):**
- [x] Player rendering (glowing spirit with lantern)
- [x] Platform rendering (ethereal floating islands)
- [x] Background rendering (3-layer parallax: distant trees, mist, foreground)
- [x] Wisp rendering (collectibles with glow)
- [x] UI rendering (wisp counter, title, instructions)
- [x] Particle rendering (lantern glow, collection sparkles)
- [x] Color palette (mystical blues/purples/golds)
- [x] Visual effects (glows, soft edges, atmospheric fog)

**audio.js (Audio - change freely in reskins):**
- [x] Ambient music (evolving drone with subtle melodic elements)
- [x] Jump sound (whoosh with pitch variation)
- [x] Collection sound (chime for wisps)
- [x] Landing sound (soft thud)
- [x] Victory sound (ascending chord)
- [x] Audio context management (user gesture init)

---

## Shared Library Components

**Audio System** (`shared-library/audio/AudioSystem.js`):
- [ ] **NOT USED** — This game uses custom procedural audio tailored to ethereal theme
- [ ] **Future:** Could extract ethereal audio patterns after Rule of Three

**Collision Utils** (`shared-library/collision/CollisionUtils.js`):
- [ ] **NOT USED** — Collision is custom in game.js
- [ ] **Future:** Platform AABB collision could be extracted (3rd+ use)

**Patterns to Extract (After Rule of Three):**
- [ ] **Variable Height Jump** — Used in: THIS GAME (need 2 more)
- [ ] **Double Jump** — Used in: THIS GAME (need 2 more)
- [ ] **Coyote Time** — Used in: THIS GAME (need 2 more)
- [ ] **Horizontal Scrolling Camera** — Used in: THIS GAME (need 2 more)
- [ ] **Painterly Rendering** — Used in: Asteroids v2, THIS GAME (need 1 more)

---

## Known Pitfalls (from FAILURE_ARCHIVE)

### Genre-Specific Pitfalls

1. **Jump Feel Too "Floaty" or Too "Heavy"**
   - **Origin:** Universal platformer problem
   - **Prevention:** 
     - `gravity: 0.5` is balanced for ethereal feel
     - `jumpPower: -12` gives good height
     - `jumpHoldPower: -0.4` for variable height control
   - **Tuning:** If jump feels wrong, adjust SETTINGS constants in `game.js`
     - DO NOT touch mid-development without full testing

2. **Platforms Too Hard to Land On**
   - **Origin:** Generic platformer issue
   - **Prevention:** 
     - **Coyote time** (6 frames grace) already implemented
     - **Jump buffer** (6 frames) lets player press jump slightly early
   - **Validation:** Test with narrow platforms in Gauntlet zone

3. **Camera Scrolling Disorienting**
   - **Origin:** Many scrolling platformers
   - **Prevention:**
     - Camera starts scrolling at X > 300 (player has room to move left)
     - Camera scrolls at same speed as player (`scrollSpeed: 4` matches `moveSpeed: 4`)
   - **Current Status:** Working well

### Architecture Pitfalls

1. **Reskin Changing Jump Feel** (CRITICAL - Rule 11)
   - **Origin:** Inca Breakout (Jan 6 2026) - "reskin" changed 11 constants
   - **Prevention:** 
     - `game.js` SETTINGS are SACRED
     - Reskin can only change:
       - `theme.js` colors/shapes/rendering
       - `audio.js` sounds/music
     - **Validation:** Diff `game.js` constants before/after reskin

2. **Particle System Performance**
   - **Origin:** Multiple games with unmanaged particles
   - **Current Status:** Particles array grows unbounded
   - **Future Fix:** Implement object pooling in Tier 4

3. **Self-Censored Vision** (Rule 12)
   - **Origin:** Jungle Theme V2 (Jan 7 2026)
   - **Risk:** May have held back features (death zones, victory effects) due to perceived complexity
   - **Prevention:** Plan ALL desired features, implement in chunks

---

## Bible Documents (Most Relevant)

### Core (Always Load)
- [x] `docs/bible/01-CORE_RULES.md` — 13 non-negotiable rules
- [x] `docs/bible/17-MODULAR_ARCHITECTURE.md` — Rule 11 enforcement

### For This Game Type (Platformer)

**Gameplay:**
- [x] `docs/bible/04-PATTERNS_REFERENCE.md` — Game loop, state machines
- [ ] `docs/bible/05-TECHNOLOGIES.md` — Canvas API reference

**Visuals:**
- [x] `docs/bible/03-VISUAL_TECHNIQUES.md` — Gradients, glow, particles
- [x] `docs/bible/11-CANVAS_PATTERNS.md` — Reusable Canvas code
- [x] `docs/bible/19-COLOR_HARMONY.md` — Mystical palette (blues/purples/golds)
- [x] `docs/bible/12-EDGE_MASTERY.md` — Soft edges for ethereal feel
- [x] `docs/bible/13-MATERIAL_LOGIC.md` — Platform material rendering

**Audio:**
- [x] `docs/bible/02-AUDIO_MASTERY.md` — Procedural synthesis patterns

**Art Quality:**
- [x] `docs/bible/10-ART_FUNDAMENTALS.md` — Classical principles
- [x] `docs/bible/20-ART_STYLES.md` — Painterly impressionist style
- [x] `docs/bible/24-REALISM_DEGRADATION.md` — NOT USED (pristine swamp, not weathered)

---

## Definition of Done

### Core Mechanics (game.js) ✅ COMPLETE
- [x] Variable height jump implemented (hold = higher)
- [x] Double jump implemented
- [x] Coyote time (6 frames grace)
- [x] Platform collision working (AABB)
- [x] Horizontal scrolling camera
- [x] Collectibles (wisps) working
- [x] Win condition exists (reach end)
- [x] Restart works without page refresh
- [x] No console errors during normal play

### Visual Polish (theme.js) 🚧 NEEDS POLISH
- [x] Art quality matches `/art-studies/` level (painterly, not bare minimum)
- [x] Color palette established (mystical blues/purples/golds)
- [x] Parallax background (3 layers)
- [x] Player rendering (glowing spirit + lantern)
- [x] Platform rendering (ethereal islands)
- [x] Particle effects (lantern glow, collection sparkles)
- [ ] **NEEDS POLISH:** Trees/moss may be too dense (reduce clutter?)
- [ ] **NEEDS POLISH:** Victory effects minimal (just text currently)

### Audio (audio.js) ✅ COMPLETE
- [x] Background music starts on user gesture
- [x] Music responds to game progression (subtle intensity)
- [x] All major actions have sound effects (jump, collect, land, victory)
- [x] Audio doesn't glitch or pop
- [x] Procedural synthesis (no samples)

### Performance ✅ WORKING
- [x] Maintains 60fps during normal gameplay
- [x] No memory leaks observed (tested 5+ minutes)
- [x] Loads quickly

### Documentation ⏸️ PENDING
- [x] Code comments explain WHY, not WHAT
- [x] Magic numbers have named constants (SETTINGS object)
- [ ] **TODO:** Outcome log (`outcomes/007-platformer-[date].json`)
- [ ] **TODO:** Retrospective (if marked complete)

### Optional (Nice-to-Have) ⏸️ FUTURE
- [ ] Mobile controls (touch)
- [ ] Fullscreen mode
- [ ] High score / time tracking
- [ ] Death animations (currently minimal)
- [ ] Respawn mechanic (currently teleports to start)

---

## Current Implementation Status

**Last Updated:** January 9, 2026  
**Current Session:** Session 4

### Completed Features ✅
- [x] Core player physics (velocity, acceleration, friction) — Session 1
- [x] Variable height jump + double jump — Session 1
- [x] Platform collision (AABB) — Session 1
- [x] Coyote time + jump buffer — Session 2
- [x] Horizontal scrolling camera — Session 2
- [x] 5-zone level design (6000px) — Session 2
- [x] Wisp collectibles with UI counter — Session 2
- [x] Parallax background (3 layers) — Session 3
- [x] Painterly visual style (soft edges, glow) — Session 3
- [x] Procedural ambient audio — Session 3
- [x] Sound effects (jump, collect, land, victory) — Session 3

### In Progress ⏸️
- [ ] **Visual polish pass** — Trees/moss density tuning
- [ ] **Death mechanics** — Better respawn, death zones
- [ ] **Victory celebration** — More satisfying end sequence

### Blocked/Pending 🚫
None currently

### Known Bugs 🐛
1. **Particles grow unbounded** — Low severity (60fps maintained, but could cause issues in long sessions)
2. **Double jump slightly floaty** — Low severity (feels okay but could be tuned)

### Next Session Goals 🎯
1. **Polish pass:** Reduce background clutter (trees/moss)
2. **Death zones:** Add bottom-of-screen death trigger
3. **Victory effects:** Better celebration (particles, camera zoom, fanfare)
4. **Mobile controls:** Touch input (if time allows)

---

## Quick Start (For AI Continuation)

**To resume work on this game:**

1. **Read this CONTEXT_PACK.md completely**
2. **Load current code:**
   ```bash
   cd games/tier-2-core-mechanics/007-platformer
   cat game.js    # 697 lines - mechanics ONLY
   cat theme.js   # 534 lines - visuals ONLY
   cat audio.js   # 247 lines - audio ONLY
   ```
3. **Check `docs/ACTIVE_WORK.md`** for recent changes (may say "polish pending")
4. **Test current build:**
   ```bash
   cd games/tier-2-core-mechanics/007-platformer
   python -m http.server 8080
   # Open http://localhost:8080
   ```
5. **Identify next task** from "Next Session Goals" above
6. **Reference Rule 11** (`docs/bible/17-MODULAR_ARCHITECTURE.md`) before editing
7. **Implement incrementally** (Rule 1 - one feature at a time)
8. **Test after each change**

---

## Files Modified (Git-Style Tracking)

**Session 1 (January 8, 2026):**
- Created: `index.html`, `game.js`, `theme.js`, `audio.js`
- Implemented: Core mechanics, variable jump, double jump, basic rendering

**Session 2 (January 8, 2026):**
- Modified: `game.js` — Added coyote time, jump buffer, scrolling camera, level zones
- Modified: `theme.js` — Added UI counter for wisps

**Session 3 (January 8, 2026):**
- Modified: `theme.js` — Painterly parallax background, glow effects, soft edges
- Modified: `audio.js` — Ambient music system, procedural SFX

**Session 4 (January 9, 2026) - PENDING:**
- Will modify: `theme.js` — Reduce tree/moss density
- Will modify: `game.js` — Add death zones (minimal change)
- Will modify: `theme.js` — Better victory effects

---

## Level Design (Zone Breakdown)

**Zone 1: Tutorial (X: 0-1200)**
- Purpose: Teach basic controls
- Platforms: 8 low-difficulty, well-spaced
- Wisps: 3 easy-to-reach
- Hazards: None

**Zone 2: The Ascent (X: 1200-2400)**
- Purpose: Introduce vertical navigation
- Platforms: 10 ascending, moderate gaps
- Wisps: 4 requiring double jump
- Hazards: None yet (death zones TODO)

**Zone 3: The Maze (X: 2400-3600)**
- Purpose: Complex navigation
- Platforms: 12 overlapping, requires backtracking
- Wisps: 5 hidden in maze
- Hazards: Tight spaces

**Zone 4: The Gauntlet (X: 3600-5000)**
- Purpose: Test all skills
- Platforms: 15 narrow, long gaps
- Wisps: 6 hard-to-reach
- Hazards: Precision jumps required

**Zone 5: The Summit (X: 5000-6000)**
- Purpose: Victory lap
- Platforms: 10 ascending to high platform
- Wisps: 4 final collectibles
- Hazards: None (reward zone)

**Total:** ~55 platforms, 22 wisps

---

## Notes & Reflections

**What's Working Well:**
- Jump feel is satisfying (variable height + double jump combo)
- Coyote time prevents frustration
- Ethereal atmosphere achieved (painterly + procedural audio)
- Camera scrolling smooth
- Performance excellent (60fps maintained)

**Challenges/Concerns:**
- Background may be too busy (trees/moss clutter)
- Death/respawn feels anticlimactic (just teleports to start)
- Victory celebration minimal (just text, no fanfare)
- Particles unbounded (low priority but could be issue in long play)

**Ideas for Future Versions:**
- **V2:** Add enemies (floating spirits, projectiles)
- **V3:** Multiple levels/worlds (ice cave, sky realm)
- **V4:** Advanced mechanics (wall jump, dash, grappling hook)
- **V5:** Story integration (dialogue, cutscenes)
- **Mobile Port:** Touch controls, responsive canvas

---

**Template Version:** 1.0  
**Last Template Update:** January 9, 2026
