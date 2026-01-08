# DECISION_GRAPH v1.2 Specification

**Status:** Planning (awaiting v1.1 validation)  
**Based On:** External AI review findings (January 8, 2026)  
**Purpose:** Fix critical holes and architectural blindspots in v1.1

---

## 🎯 GOALS FOR V1.2

1. **Transform from "art tree" to "game tree"** - Add gameplay mechanics questions
2. **Fix genuine technical errors** - Correct timestep logic, environment conflation
3. **Add critical early decisions** - Platform/engine, template check
4. **Implement proof-of-fun workflow** - Progressive complexity with validation gates
5. **Add product safety** - Legal constraints for inspired-by references

---

## 📋 NEW QUESTION STRUCTURE

### Pre-Interrogation Questions

#### Q-0a: Template/Scaffold Check (NEW)
**Trigger:** Before Q0  
**Purpose:** Prevent needless architecture rewrites

**Question:** "Do you want this based on an existing starter template?"

**Options:**
- **A)** None - build from scratch
- **B)** Use last [genre] scaffold (if available)
- **C)** Choose from templates (list available)
- **D)** Reskin existing game (specify which)
- **E)** Extend existing game (specify which)

**Impact:**
- If B/C/D/E selected → Q0 auto-filled, skip architecture docs
- If A selected → Continue to Q0 normally

**Priority:** 95 (between Q-0a and Q0)

---

#### Q0.5: Scope Level (NEW)
**Trigger:** After Q0  
**Purpose:** Prevent expectation mismatch, enable doc budget limiting

**Question:** "What scope are you targeting?"

**Options:**
- **A)** Proof of concept (1 feature, demo quality, ~1-3 hours)
- **B)** Playable demo (core loop complete, polish, ~4-8 hours)
- **C)** Full game (all features, production ready, 10+ hours)

**Impact:**
- Sets doc budget: PoC=5 docs, Demo=9 docs, Full=14+ docs
- Determines feature expectations
- Affects time estimates in outcome log

**Priority:** 92 (between Q0 and Q0.6)

---

#### Q0.6: Platform/Engine Target (NEW)
**Trigger:** After Q0.5  
**Purpose:** Critical architecture decision that changes everything

**Question:** "What platform/engine are you targeting?"

**Options:**
- **A)** Web - Canvas 2D (simple, immediate)
- **B)** Web - WebGL/Three.js (3D, shaders)
- **C)** Godot 4 - 2D (node-based, GDScript)
- **D)** Godot 4 - 3D (spatial, physics)
- **E)** Unity - URP (production, C#)
- **F)** Unreal Engine (AAA, blueprints/C++)

**Impact:**
- Changes loaded docs: CANVAS_PATTERNS vs GODOT_PATTERNS vs UNITY_PATTERNS
- Changes file structure
- Changes rendering approach
- Changes input handling
- Changes build/deploy workflow

**Priority:** 90 (between Q0.5 and Q1)

---

### Enhanced Core Questions

#### Q4: Environment → Split into Q4a + Q4b (MODIFIED)

**Problem:** Current Q4 conflates physical medium and art direction  
**Fix:** Split into two orthogonal axes

---

**Q4a: Physical Medium (NEW)**  
**Purpose:** Determines physics + material behavior

**Question:** "What physical medium/environment?"

**Options:**
- **A)** Vacuum (no air resistance, extreme temps, no sound propagation)
- **B)** Standard atmosphere (wind, weathering, acoustic propagation)
- **C)** Underwater (buoyancy, drag, muffled sound)
- **D)** Other (magical, low-gravity, etc.)

**Priority:** 60

---

**Q4b: Art Direction Atmosphere (NEW)**  
**Purpose:** Determines rendering style (separate from physics)

**Question:** "What atmospheric rendering style?"

**Options:**
- **A)** Crisp/clear (no fog/haze, sharp visibility)
- **B)** Foggy/hazy (depth cues, atmospheric perspective)
- **C)** Neon haze (cyberpunk glow, volumetric light)
- **D)** Dusty/particulate (volumetric particles, shafts)

**Priority:** 55 (lower than physical medium)

**Result:** Can now have vacuum physics + neon haze rendering (F-Zero correct combo)

---

#### Q2.5: Origin Form (MODIFIED)

**Current Trigger:** age > 50  
**New Trigger:** (age > 50) OR (manufactured/architected) OR (readability_critical)

**Reason:** Even pristine manufactured objects need:
- Silhouette grammar (ship panel layout)
- Damage model (what parts can deform)
- Modular art rules (consistent design language)

**Impact:** F-Zero ships (age=10, readability_critical) now ask origin form

---

### Genre Mechanics Subtree (NEW - CRITICAL)

**Trigger:** After Q9 if task_type = "new" AND request implies known genre

**Genre Detection:**
- Racing: F-Zero, racer, racing, kart, hover, speed
- Platformer: jump, run, climb, Mario, Sonic
- Shooter: shoot, gun, bullet, space invaders, shmup
- Puzzle: puzzle, match, block, Tetris, logic

**If genre detected → show genre-specific mechanics questions (Q10-Q18)**

---

#### For Racing Games: Q10-Q18

**Q10: Perspective**
- A) Top-down (overhead view, classic arcade)
- B) Pseudo-3D (Mode 7 style, perspective grid)
- C) True 3D (full 3D camera, modern)

**Q11: Handling Model**
- A) Arcade drift (easy, forgiving, wide turns)
- B) Grip racing (realistic, momentum-based)
- C) Hover magnetic (rail-like, F-Zero style)

**Q12: Speed Tiers**
- A) Slow (walking pace, strategic)
- B) Medium (jogging pace, balanced)
- C) Fast (F-Zero X speed, reaction-based)
- D) Variable (acceleration over time)

**Q13: Boost Mechanic**
- A) None (pure racing)
- B) Cooldown (time-based, unlimited uses)
- C) Energy-as-health (risk/reward, F-Zero style)
- D) Pickup (collect boost pads/items)

**Q14: Collision Behavior**
- A) Bounce (elastic, pinball-like)
- B) Spin (loss of control, recovery time)
- C) Damage (health system, can explode)
- D) Stop (solid walls, no pass-through)

**Q15: Race Format**
- A) Time trial (solo, ghost data)
- B) Grand Prix (series of races, points)
- C) Versus AI (pack racing, positions)
- D) Multiplayer (local or online)

**Q16: Opponent Count**
- A) None (pure time trial)
- B) Ghosts only (previous runs)
- C) 1-3 AI opponents
- D) 4+ AI pack racing

**Q17: Track Type**
- A) Single loop (fixed layout, repeated laps)
- B) Procedural segments (generated, endless)
- C) Authored sections (hand-crafted, story mode)

**Q18: Win/Lose Conditions**
- A) Best time (time attack)
- B) Finish position (1st place to win)
- C) Survival (don't explode, last longest)
- D) Score threshold (points from tricks, boosts)

**Priority:** All Q10-Q18 have priority 85 (below visual questions, above implementation)

---

## 🚫 NEW FORBIDDEN RULES

### 7. avoid_variable_timestep_for_racing (NEW)

**Condition:** (genre = "racing") AND (feel_critical = true OR handling_model != "none")

**Reason:** Variable timestep causes frame-dependent physics → inconsistent handling feel

**Forbidden:**
- `variable_timestep_integration`
- `delta_time_multiplication_in_physics`

**Required:**
- `fixed_timestep_loop` (constant dt)
- `semi_fixed_timestep_loop` (accumulator pattern)

**Max threshold:** N/A (binary rule)

**External Review Quote:**
> "Genuine technical error. Variable timestep usually easier to implement, but worse for consistent physics. Racing games benefit from stable handling; fixed or semi-fixed is safer."

---

### 8. inspired_by_only (NEW)

**Condition:** User request references known IP (detected via keywords: F-Zero, Mario, Zelda, Sonic, etc.)

**Reason:** Product legal risk - avoid copyrighted assets/names

**Forbidden:**
- `copyrighted_names` (F-Zero, Mute City, Blue Falcon, Captain Falcon)
- `asset_replicas` (exact track layouts, exact ship designs)
- `music_sound_clones` (Nintendo audio)
- `branding_references` (logos, trademarks)

**Required:**
- `original_names` (create new names for ships/tracks/characters)
- `original_designs` (inspired by, not copied from)
- `inspired_by_credit_only` (not "based on" or "from")

**Max threshold:** 0.0 (zero tolerance)

**External Review Quote:**
> "Real product risk. You can build 'future hover racer', but avoid Nintendo assets, names, track replicas, music."

---

## 📚 NEW DOCUMENT LOADING LOGIC

### Engine-Specific Pattern Loading (Q0.6)

**If platform = "Web - Canvas 2D":**
- Load: CANVAS_PATTERNS (1.0)
- Skip: GODOT_PATTERNS, UNITY_PATTERNS, UNREAL_PATTERNS

**If platform = "Godot 4 - 2D/3D":**
- Load: GODOT_PATTERNS (1.0)
- Skip: CANVAS_PATTERNS, UNITY_PATTERNS

**If platform = "Unity - URP":**
- Load: UNITY_PATTERNS (1.0)
- Skip: CANVAS_PATTERNS, GODOT_PATTERNS

**If platform = "Unreal Engine":**
- Load: UNREAL_PATTERNS (1.0)
- Skip: CANVAS_PATTERNS, GODOT_PATTERNS, UNITY_PATTERNS

---

### Genre-Specific Mechanics Loading

**If genre = "racing":**
- Load: RACING_MECHANICS (1.0) - handling, physics, boost systems
- Load: CAMERA_PERSPECTIVE (0.8) - if pseudo-3D or true 3D
- Load: AI_OPPONENTS (0.7) - if opponent_count > 0

**If genre = "platformer":**
- Load: PLATFORMER_MECHANICS (1.0) - jump, collision, momentum
- Load: LEVEL_DESIGN (0.9) - layout, difficulty curve

**If genre = "shooter":**
- Load: SHOOTER_MECHANICS (1.0) - projectiles, collision, enemy patterns
- Load: SPAWN_SYSTEMS (0.8) - enemy waves, difficulty scaling

**If genre = "puzzle":**
- Load: PUZZLE_MECHANICS (1.0) - grid logic, match detection, solving
- Load: FEEDBACK_SYSTEMS (0.9) - player hints, visual cues

---

### Doc Budget Enforcement (Q0.5)

**If scope = "proof_of_concept":**
- Max docs: 5
- Sort by influence weight
- Load top 5 only
- Skip all others with reason: "Exceeds PoC doc budget (5 max)"

**If scope = "playable_demo":**
- Max docs: 9
- Sort by influence weight
- Load top 9 only

**If scope = "full_game":**
- Max docs: 14 (current behavior)
- Can load all applicable docs

---

## 🏁 PROGRESSIVE COMPLEXITY WORKFLOW (NEW)

### Phase Order Change

**Current (v1.1):**
1. Phase 1: Core Architecture
2. Phase 2: Ship & Physics
3. Phase 3: Track & Environment
4. Phase 4: Visual Polish
5. Phase 5: Performance
6. Phase 6: Audio

**New (v1.2):**
1. **Phase 1: Greybox Prototype** (ugly but correct)
   - Core loop with placeholder graphics
   - Basic input handling
   - Physics/handling feel (grey rectangles OK)
   - **Deliverable:** Can play for 30 seconds, feels right

2. **Phase 2: Core Game Loop** (functionality)
   - Lap timing / checkpoint system
   - Win/lose conditions
   - Restart mechanism
   - **Deliverable:** Minimal playable game (no art)

3. **Phase 3: Mechanics Implementation** (features)
   - Boost system (if applicable)
   - Collision behavior
   - Special abilities
   - **Deliverable:** All mechanics working

4. **Phase 4: Opponents (if applicable)**
   - AI behavior
   - Ghost data recording/playback
   - Multiplayer input
   - **Deliverable:** Opponent presence

5. **⚠️ PROOF-OF-FUN GATE**
   - **Question:** "Is the core gameplay fun with grey boxes?"
   - **If NO:** Return to Phase 1-4, iterate mechanics
   - **If YES:** Proceed to Phase 6

6. **Phase 6: Visual Polish** (now allowed)
   - Apply art style from Q1-Q9
   - Render materials, lighting, effects
   - Color palette, composition
   - **Deliverable:** Beautiful version of fun game

7. **Phase 7: Performance Optimization**
   - Profile, optimize hot paths
   - Implement caching strategies
   - Validate 60fps (or target)

8. **Phase 8: Audio & Juice**
   - Sound effects, music
   - Particle effects, screen shake
   - UI polish

**Key Change:** Visual polish **not allowed** until proof-of-fun validated

**External Review Quote:**
> "Better flow for vibe-coding: ugly greybox with correct handling → core loop → mechanics → AI → GATE: is it fun? → visuals. Prevents spending time on beautiful art before gameplay fun is validated."

---

## ✅ DEFINITION OF DONE CHECKLISTS (NEW)

### Racing Game DoD

Generated in **Section 7 (NEW)** of planning doc if genre = "racing"

**Definition of Done:**
- [ ] Lap completes and triggers timing display
- [ ] Checkpoint system prevents shortcuts (if checkpoints enabled)
- [ ] Collision detection never tunnels through walls
- [ ] Boost mechanic (if enabled) consumes resource correctly
- [ ] Boost mechanic (if enabled) affects handling measurably (speed increase visible)
- [ ] AI opponents (if enabled) complete races without getting stuck
- [ ] AI opponents (if enabled) follow track boundaries
- [ ] Restart button resets all state correctly (position, speed, lap count, timers)
- [ ] Pause button stops simulation (no time passes, no movement)
- [ ] Win condition triggers correctly (finish line, target time, position)
- [ ] Lose condition triggers correctly (health=0, timeout, DNF)
- [ ] Target FPS maintained consistently (60fps or specified)

**Purpose:** Prevents shipping "it runs at 60fps" but game loop broken

---

### Platformer Game DoD

- [ ] Jump input registers reliably (no dropped inputs)
- [ ] Jump height consistent (not frame-dependent)
- [ ] Double jump (if enabled) only triggers once per jump
- [ ] Ground detection prevents mid-air jumps
- [ ] Collision never tunnels through platforms
- [ ] Moving platforms carry player correctly
- [ ] Death pits kill player and trigger respawn
- [ ] Checkpoints save progress correctly
- [ ] Camera follows player smoothly (no jittering)
- [ ] Restart resets player to last checkpoint

---

### Shooter Game DoD

- [ ] Fire input shoots projectile reliably
- [ ] Projectiles move at consistent speed (not frame-dependent)
- [ ] Projectile-enemy collision detection works
- [ ] Enemy death triggered on hit
- [ ] Player damage system works (health decreases)
- [ ] Game over triggers at health=0
- [ ] Enemy spawn rate consistent
- [ ] Enemy AI moves/attacks correctly
- [ ] Score system counts correctly
- [ ] Restart resets score, health, enemies

---

### Puzzle Game DoD

- [ ] Grid input registers clicks/touches correctly
- [ ] Match detection algorithm works (3+ in row/column)
- [ ] Matches clear reliably
- [ ] Pieces fall down after clear (gravity)
- [ ] New pieces spawn at top
- [ ] Cascade matches detected (chain reactions)
- [ ] Score system awards points correctly
- [ ] Win condition triggers (target score, clear board)
- [ ] Move limit enforced (if applicable)
- [ ] Restart resets board correctly

---

## 📝 PLANNING DOC STRUCTURE CHANGES

### Section 7: Definition of Done (NEW)

Appears after **Section 6: Outcome Log Template**

**Content:**
- Genre-specific checklist (see above)
- Custom checks based on Q10-Q18 answers
- Performance target validation
- Functional requirements

**Purpose:** Measurable completion criteria prevent "it runs but isn't a game"

---

### Section 8: Progressive Complexity Plan (NEW)

Appears after Section 7

**Content:**
- Phase 1-4 plan (greybox → core loop → mechanics → opponents)
- Proof-of-fun gate criteria
- Phase 6-8 plan (visuals → performance → audio)
- Milestone deliverables

**Purpose:** Enforce "fun first, pretty later" workflow

---

## 🔄 INTERROGATE.JS CHANGES NEEDED

### New Questions to Add

1. **Q-0a:** Template/scaffold check (before Q0)
2. **Q0.5:** Scope level (after Q0)
3. **Q0.6:** Platform/engine (after Q0.5)
4. **Q4a:** Physical medium (replaces Q4)
5. **Q4b:** Art direction atmosphere (after Q4a)
6. **Q10-Q18:** Genre mechanics subtree (conditional, after Q9)

### New Validation Logic

- **Genre detection:** Scan user's original request for keywords (racing, platformer, shooter, puzzle)
- **Template availability check:** Scan `/templates/` and last completed game for scaffolds
- **Engine-specific docs:** Load CANVAS_PATTERNS vs GODOT_PATTERNS vs etc.
- **Doc budget limiting:** Sort by influence, enforce max count per scope

### New Conflict Detection

- **Check:** variable timestep + racing genre
  - **Flag:** "Racing game with variable timestep → inconsistent handling"
  - **Resolution:** "Use fixed or semi-fixed timestep for stable physics"

- **Check:** inspired-by IP reference + copyrighted names
  - **Flag:** "User referenced F-Zero but using copyrighted names"
  - **Resolution:** "Create original names (e.g., 'Velocity Viper' not 'Blue Falcon')"

### New Forbidden Rules Evaluation

- **Rule 7:** `avoid_variable_timestep_for_racing` (check Q10-Q18 answers)
- **Rule 8:** `inspired_by_only` (check user's original request for IP keywords)

---

## 📊 VALIDATION CRITERIA FOR V1.2

### Success Metrics

1. **Mechanics coverage:** Can generate racing, platformer, shooter, puzzle plans
2. **Genre detection:** Correctly identifies genre from ambiguous requests
3. **Platform targeting:** Changes file structure based on engine choice
4. **Doc budget:** PoC loads 5 docs max, demo loads 9 max
5. **Proof-of-fun gate:** Planning doc includes phase gate with criteria
6. **DoD checklists:** Planning doc includes genre-specific measurable checks
7. **Legal safety:** Flags IP references, suggests original names
8. **Timestep correctness:** Never suggests variable timestep for racing games

### Test Cases

**Test 1: F-Zero Request**
- Input: "build me an F-Zero style game"
- Expected Q-0a: Offer templates (if racer scaffold exists)
- Expected Q0.6: Ask platform (Web/Godot/Unity)
- Expected Q10-Q18: Ask racing mechanics (handling, boost, collision)
- Expected Rule 7: Flag if variable timestep chosen
- Expected Rule 8: Warn about "F-Zero" name, suggest original

**Test 2: Simple Prototype**
- Input: "quick proof of concept racer"
- Expected Q0.5: Select "proof of concept"
- Expected doc count: 5 max (sorted by influence)
- Expected phases: Greybox → core loop → GATE → visuals (minimal)

**Test 3: Space Theme**
- Input: "racer in space with neon glow"
- Expected Q4a: Vacuum (physics)
- Expected Q4b: Neon haze (rendering)
- Expected result: Can have vacuum physics + glow effects (not forbidden)

---

## 🎯 MIGRATION PATH FROM V1.1 TO V1.2

### Phase 1: Core Questions (Critical)

1. Add Q-0a (template check)
2. Add Q0.5 (scope level)
3. Add Q0.6 (platform/engine)
4. Split Q4 into Q4a + Q4b
5. Expand Q2.5 trigger logic

**Validation:** Run interrogate.js, verify new questions appear in correct order

---

### Phase 2: Genre Subtree (Critical)

1. Add genre detection logic
2. Add Q10-Q18 for racing games
3. Add Q10-Q15 for platformer games (future)
4. Add Q10-Q15 for shooter games (future)
5. Add Q10-Q15 for puzzle games (future)

**Validation:** F-Zero request triggers Q10-Q18

---

### Phase 3: Forbidden Rules (High Priority)

1. Add Rule 7: `avoid_variable_timestep_for_racing`
2. Add Rule 8: `inspired_by_only`
3. Update conflict detection for new rules

**Validation:** Racing + variable timestep flagged, IP references caught

---

### Phase 4: Doc Loading (High Priority)

1. Add engine-specific pattern loading
2. Add genre-specific mechanics loading
3. Add doc budget enforcement

**Validation:** PoC loads 5 docs, Web loads CANVAS_PATTERNS not GODOT_PATTERNS

---

### Phase 5: Progressive Complexity (Medium Priority)

1. Update planning doc Section 8 (phases)
2. Add proof-of-fun gate criteria
3. Enforce "greybox first, visuals later"

**Validation:** Planning doc shows 8 phases with gate between Phase 5 and 6

---

### Phase 6: Definition of Done (Medium Priority)

1. Add planning doc Section 7 (DoD)
2. Generate genre-specific checklists
3. Add custom checks from Q10-Q18

**Validation:** Racing game planning doc includes lap timing check

---

## 📋 V1.2 COMPLETE QUESTION LIST

```
Q-0a: Template/Scaffold Check (NEW)
Q0: Task Type
Q0.5: Scope Level (NEW)
Q0.6: Platform/Engine Target (NEW)
Q1: Artistic Style
Q2: Age (0-100)
Q2.5: Origin Form (CONDITIONAL - expanded trigger)
Q3: Primary Materials
Q4a: Physical Medium (MODIFIED - split from Q4)
Q4b: Art Direction Atmosphere (NEW)
Q5: Lighting Condition
Q6: Compositional Complexity
Q7: Color Approach
Q8: Classical Techniques
Q9: Special Requirements

[GENRE SUBTREE - CONDITIONAL]
IF genre = "racing":
  Q10: Perspective
  Q11: Handling Model
  Q12: Speed Tiers
  Q13: Boost Mechanic
  Q14: Collision Behavior
  Q15: Race Format
  Q16: Opponent Count
  Q17: Track Type
  Q18: Win/Lose Conditions
```

**Total Questions:** 22 max (if all conditionals trigger)  
**Minimum Questions:** 14 (if no genre detected, age < 50)

---

## 🚀 BENEFITS OF V1.2

1. **Addresses "art tree pretending to be game tree"** - Now asks gameplay questions
2. **Fixes genuine technical errors** - Timestep logic correct
3. **Prevents needless rewrites** - Template check before building from scratch
4. **Enables proper targeting** - Platform/engine decision early
5. **Validates fun early** - Proof-of-fun gate before polish
6. **Measurable completion** - DoD checklists prevent "it runs but isn't playable"
7. **Legal safety** - IP constraint prevents product risk
8. **Realistic doc budgets** - 5/9/14 doc limits prevent drowning
9. **Correct environment handling** - Physics vs rendering separated
10. **Better origin form coverage** - Captures silhouette grammar for pristine objects

---

## 📅 TIMELINE

**Prerequisite:** v1.1 validation via Phase 1 (art study test)

**If v1.1 validation succeeds:**
- Implement v1.2 changes
- Test with F-Zero request (full workflow validation)
- Update interrogate.js (estimated +400 lines)
- Update DECISION_GRAPH.md documentation
- Create new outcome log template (add genre fields)

**Estimated Effort:** 4-6 hours implementation, 2-3 hours testing

---

**Last Updated:** January 8, 2026  
**Status:** Specification complete, awaiting v1.1 validation  
**External Review Source:** Anonymous AI review via user feedback  
**Next Step:** Validate v1.1 with small art study, then implement v1.2
