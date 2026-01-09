# Game Development Session Prompt

**Copy this entire document into the chat when starting a new game development session.**

---

## 🎮 GAME REQUEST

> **[PASTE YOUR REQUEST HERE]**
> 
> Examples:
> - "Build me a car racing game"
> - "Build me a Sonic-style platformer"
> - "Build the next Tier 2 game"
> - "Reskin Pong with a painterly style"
> - "Add a power-up system to the existing asteroids game"

---

## ⚠️ MANDATORY PROCESS - DO NOT SKIP

You are working on a game development learning project with an established Decision Graph system.

### 🔍 PRE-FLIGHT CHECKLIST (Before ANY code)

**MUST CHECK THESE BEFORE BUILDING:**

1. **`shared-library/`** - What reusable components exist?
   - `audio/AudioSystem.js` - Procedural audio foundation
   - `collision/CollisionUtils.js` - Collision detection helpers
   - Check README.md for full inventory

2. **`docs/SKILLS_TRACKER.md`** - What has already been learned?
   - Avoid re-teaching skills already at 4-5/5 confidence
   - Reference which game implemented each system

3. **Previous games in same tier** - Patterns to reuse?
   - Check `games/tier-X/` for similar mechanics
   - Especially: audio patterns, input handling, game states

4. **`docs/FAILURE_ARCHIVE.md`** - Mistakes to avoid?
   - Don't repeat documented failures

**If building audio:** First check `shared-library/audio/`
**If building collision:** First check `shared-library/collision/`
**If building high scores:** Reference Space Invaders implementation
**If building particles:** Reference Snake, Flappy Bird implementations

### 🚫 HARD RULES

1. **DO NOT write ANY game code until ALL interrogation questions are answered**
2. **DO NOT assume visual style** - ASK the user
3. **DO NOT skip doc loading** - Bible sections MUST be loaded before implementation
4. **Art quality MUST reflect the art studies in `/art-studies/`** - not bare-minimum line art
5. **Proof-of-fun gate MUST be checked** before visual polish phase
6. **MUST use modular architecture** - mechanics in `game.js`, visuals in `theme.js`, audio in `audio.js` (see 17-MODULAR_ARCHITECTURE.md)

---

## 📋 REQUIRED INTERROGATION SEQUENCE

### Pre-Questions (MUST ASK)

**Q-0a: Task Type** (Priority 100)
> "What kind of task is this?"
> - A) New from scratch (build everything new)
> - B) New from scaffold (use existing template/structure)
> - C) Reskin (new visuals only, keep mechanics)
> - D) Extend (add new mechanics to existing game)
> - E) Debug/fix (minimal targeted changes)

**Q0.5: Scope Level** (Priority 92)
> "What scope are you targeting?"
> - A) Proof of concept (1 feature, same-session)
> - B) Playable demo (core loop complete, 1-2 sessions)
> - C) Full game (all features, multi-week)

**Q0.6: Platform/Engine** (Priority 90)
> "What platform/engine?"
> - A) Web - Canvas 2D
> - B) Web - WebGL/Three.js
> - C) Godot 4 - 2D
> - D) Godot 4 - 3D
> - E) Unity
> - F) Other (specify)

---

### Genre Detection (if task = NEW)

**Step 1: Keyword Detection**
Scan request for: racing, platformer, shooter, puzzle, adventure, etc.

**Step 2: Confirm Genre** (REQUIRED - do not assume)
> "Which best matches what you want: racing / platformer / shooter / puzzle / adventure / other?"

**If genre = {racing, platformer, fighter} → set `feel_critical = true`**

---

### Genre-Specific Mechanics (Priority 88-89 - BEFORE visuals!)

**For Shooter (e.g., Asteroids):**
- Rotation control type? (instant / momentum-based)
- Movement model? (thrust / direct / rail)
- Shooting style? (single / spread / charge)
- Screen behavior? (wrap / bounce / scroll)
- Lives/health system?
- Scoring system?

**For Racing:**
- Perspective? (top-down / pseudo-3D / true 3D)
- Handling model? (arcade drift / grip / hover magnetic)
- Speed tier? (slow / medium / fast / variable)
- Boost mechanic? (none / cooldown / energy-as-health / pickup)
- Collision behavior? (bounce / spin / damage / stop)

**For Platformer:**
- Jump feel? (floaty / snappy / variable height)
- Movement speed? (slow / medium / fast)
- Special abilities? (double jump / wall jump / dash)
- Camera? (fixed / follow / predictive)

---

### Visual Questions (Priority 70-85 - AFTER mechanics)

**Q1: Style**
> "What visual style?"
> - A) Painterly (visible brushwork, texture, like our art studies)
> - B) Flat/vector (clean shapes, solid colors)
> - C) Pixel art (retro, chunky)
> - D) Line art (minimal, arcade classic)
> - E) Other (specify)

**Q2: Color Palette**
> "Color approach?"
> - A) Vibrant/saturated
> - B) Muted/natural
> - C) Monochrome/limited
> - D) Neon/glow
> - E) Specify palette

**Q3: Audio**
> "Audio approach?"
> - A) Procedural (Web Audio API synthesis)
> - B) Sample-based (sound files)
> - C) Minimal (essential sounds only)
> - D) None for now

---

## 📚 DOC LOADING REQUIREMENTS

Based on scope, load relevant Bible sections:

| Scope | Must-Load | Additional |
|-------|-----------|------------|
| PoC (5 docs) | CORE_RULES + engine + genre mechanics | Top 2 by relevance |
| Demo (9 docs) | + VISUAL_TECHNIQUES | Top 5 by relevance |
| Full (14+ docs) | + All visual | As needed |

**Key docs by category:**
- **Architecture:** `17-MODULAR_ARCHITECTURE.md` (MUST LOAD for all new games)
- **Canvas games:** `11-CANVAS_PATTERNS.md`, `14-CANVAS_IMPLEMENTATION_PATTERNS.md`
- **Visuals:** `03-VISUAL_TECHNIQUES.md`, `19-COLOR.md`, `20-STYLES.md`
- **Art fundamentals:** `10-ART_FUNDAMENTALS.md`, `18-COMPOSITION.md`
- **Audio:** `02-AUDIO_MASTERY.md`

**Art Studies Reference:** `/art-studies/` contains completed studies that should inform visual quality.

---

## 🏁 DEVELOPMENT PHASES

### 🏗️ MANDATORY FILE STRUCTURE (Rule 6)

**ALL games MUST use this modular architecture:**

```
games/tier-X/XXX-game-name/
├── index.html      # Loads all 3 files
├── game.js         # MECHANICS ONLY - physics, collision, scoring, state
├── theme.js        # VISUALS ONLY - all rendering, colors, effects
└── audio.js        # AUDIO ONLY - all sounds, music
```

**Why:** So you can say "build it in a different style" and only `theme.js` changes.

**game.js rules:**
- ❌ NO draw() methods inside classes
- ❌ NO colors, ctx.fillStyle, rendering code
- ✅ getState() methods that return data for theme to render
- ✅ Physics, collision, input, game state only

**theme.js rules:**
- ✅ THEME object with render(gameState) function
- ✅ All colors, drawing code, visual effects, particles
- ✅ drawShip(), drawAsteroid(), drawBackground(), etc.

**Reference:** `docs/bible/17-MODULAR_ARCHITECTURE.md` for full interface contract.

---

### Phase 1-4: Greybox → Core Loop → Mechanics → Opponents
Build ugly-but-correct version first. Grey rectangles are fine.

### ⚠️ PHASE 5: PROOF-OF-FUN GATE (MANDATORY STOP)

Before ANY visual polish, verify:

**For Shooter:**
- [ ] Ship control feels responsive? (yes/no)
- [ ] Collision detection works reliably? (yes/no)
- [ ] Core loop (shoot → destroy → spawn) is satisfying? (yes/no)
- [ ] Game is playable for 60+ seconds without frustration? (yes/no)

**Pass condition:** 3/4 must be YES

**If FAIL:** Iterate mechanics, max 3 cycles before scope reduction  
**If PASS:** Proceed to visual polish

### Phase 6-8: Visual Polish → Performance → Audio & Juice
Only now apply the art style, effects, and polish.

---

## 📝 AFTER COMPLETION

Create outcome log in `/outcomes/`:
- What was built
- What was learned
- Deviations from plan
- Time/effort estimate

---

## ✅ CONFIRMATION

Before proceeding, confirm you have:
1. [ ] Asked ALL required questions above
2. [ ] Received answers from the user
3. [ ] Loaded relevant Bible docs
4. [ ] Set expectations for art quality (NOT bare-minimum)
5. [ ] Understood the proof-of-fun gate requirement
6. [ ] Will use modular architecture (game.js + theme.js + audio.js separate files)

**Now ask your questions and WAIT for answers before writing any code.**
