# 📜 CORE RULES & PREVENTION CHECKLIST

**Purpose:** Expanded rules with origins, prevention strategies, and checklists  
**When to Read:** Starting any session, before making changes, when something breaks

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-07   | 2026-01-07     | Added Rule 12 - Never Self-Censor Vision |
<!-- END METADATA -->

**Related Documents:**
- [BIBLE_INDEX.md](./BIBLE_INDEX.md) - Summary of all rules
- [CHANGELOG.md](./CHANGELOG.md) - Rule evolution history
- [../FAILURE_ARCHIVE.md](../FAILURE_ARCHIVE.md) - Where rules came from

---

## THE 10 COMMANDMENTS

### Rule 1: Incremental Development 🔴

**The Rule:**
```
❌ WRONG: Add particles + screen shake + shields + new collision system at once
✅ RIGHT: Add particles → Test → Add screen shake → Test → Add shields → Test
```

**Origin Story:** Space Invaders V2 - We tried to add multiple features simultaneously. The game completely broke with cascading errors making it impossible to identify which change caused which problem. Debugging took 3x longer than it would have to add features one at a time.

**Prevention Strategy:**
1. Write down ALL features you want to add
2. Order them by complexity (simplest first)
3. Implement ONE feature
4. Test thoroughly (all game states)
5. Only proceed to next feature after current one works
6. If you break something, you know exactly which change caused it

**Checklist:**
- [ ] Have I listed all planned changes?
- [ ] Am I changing only ONE thing?
- [ ] Have I tested after this change?

---

### Rule 2: Backup Before Changes 🔴

**The Rule:**
```
BEFORE modifying a working game:
1. Copy entire folder to [game]-v[N]-[description]/
2. Test the backup works
3. ONLY THEN begin modifications
```

**Origin Story:** Space Invaders V2 - Major changes broke the game badly. Having the V1 backup saved the entire project - we could diff the two versions to find what went wrong.

**Commands:**
```bash
# Create backup before major changes
cp -r 004-snake 004-snake-v3-before-particle-system

# Verify backup works
cd 004-snake-v3-before-particle-system
python3 -m http.server 8081  # Different port
# Test in browser
```

**Naming Convention:**
```
[game-number]-[game-name]-v[version]-[description]

Examples:
004-snake-v1-baseline
004-snake-v2-mastery  
004-snake-v3-experimental-ai
004-snake-v4-pre-multiplayer
```

**Checklist:**
- [ ] Am I about to make significant changes?
- [ ] Have I created a backup folder?
- [ ] Have I tested the backup works?

---

### Rule 3: HTML IDs Before JavaScript 🔴

**The Rule:**
```
❌ WRONG: Write JS with getElementById, then create HTML with matching IDs
✅ RIGHT: Write HTML with all IDs first, then copy IDs exactly to JS
```

**Origin Story:** Snake - Multiple "Cannot read properties of null" errors from mismatched IDs. Typos like `settingsBtn` vs `settings-btn` caused silent failures.

**Process:**
1. Design UI in HTML first
2. Add meaningful IDs to ALL interactive elements
3. Open both HTML and JS side by side
4. COPY-PASTE IDs from HTML to JS (never type manually)

**Example:**
```html
<!-- HTML: Define IDs FIRST -->
<button id="settingsBtn">⚙️ Settings</button>
<div id="settingsModal" class="modal">
    <button id="closeModal">✕</button>
    <input id="masterVolume" type="range" min="0" max="100">
    <input id="musicVolume" type="range" min="0" max="100">
    <button id="resetScores">Reset Scores</button>
</div>
```

```javascript
// JS: Copy IDs EXACTLY (copy-paste, don't type!)
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const masterVolume = document.getElementById('masterVolume');
const musicVolume = document.getElementById('musicVolume');
const resetScores = document.getElementById('resetScores');
```

**Debugging Command:**
```javascript
// Find all ID mismatches
document.querySelectorAll('[id]').forEach(el => console.log(el.id));
```

**Checklist:**
- [ ] Did I write HTML IDs first?
- [ ] Did I COPY-PASTE IDs to JS (not type manually)?
- [ ] Does the console show any null errors?

---

### Rule 4: Test After Each Change 🔴

**The Rule:**
```
Code change → Restart server → Hard refresh (Ctrl+Shift+R) → Test → Repeat
```

**Origin Story:** All games - Small CSS changes broke mobile layout. A single typo in JS crashed the game. Small changes cascade into big problems if not caught immediately.

**Testing Sequence:**
1. Save file
2. Check terminal for server errors
3. Switch to browser
4. **HARD REFRESH** (Ctrl+Shift+R or Cmd+Shift+R)
5. Open DevTools Console (F12)
6. Check for errors
7. Test the specific feature you changed
8. Test that you didn't break existing features

**Why Hard Refresh?**
- Browser caches JS/CSS aggressively
- Regular refresh may serve old files
- Hard refresh forces fresh download

**Checklist:**
- [ ] Did I hard refresh?
- [ ] Is the console error-free?
- [ ] Does the changed feature work?
- [ ] Do existing features still work?

---

### Rule 5: Audio Requires User Gesture 🔴

**The Rule:**
```javascript
// Audio MUST be initialized from user gesture (click, keypress)
document.addEventListener('keydown', () => {
    audio.init(); // Initialize on first interaction
});
```

**Origin Story:** Pong - Sounds wouldn't play on page load. Chrome and all modern browsers implement autoplay policy that blocks audio until user interacts with the page.

**Pattern:**
```javascript
class AudioSystem {
    constructor() {
        this.initialized = false;
        this.audioContext = null;
    }
    
    init() {
        if (this.initialized) return;
        
        // Create context only after user gesture
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // If context was suspended, resume it
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.initialized = true;
        console.log('Audio initialized');
    }
}

// Call init from user gesture
document.addEventListener('keydown', () => audio.init(), { once: true });
document.addEventListener('click', () => audio.init(), { once: true });
```

**Common Mistakes:**
```javascript
// ❌ WRONG: Creating context on page load
const ctx = new AudioContext(); // Will be suspended!

// ❌ WRONG: Playing audio without context resume
playSound() {
    const osc = this.ctx.createOscillator();
    osc.start(); // May fail silently if suspended
}

// ✅ RIGHT: Resume context before playing
playSound() {
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    // Now play sound
}
```

**Checklist:**
- [ ] Is AudioContext created in response to user action?
- [ ] Do I check/resume suspended context before playing?
- [ ] Does audio work after first keypress/click?

---

### Rule 6: Quality Over Speed 🔴

**The Rule:**
```
❌ WRONG: Quickly build a "minimal" version, strip features for speed
✅ RIGHT: Take time to preserve ALL existing features, then ADD enhancements

When creating V2/upgraded versions:
1. NEVER remove features from V1 - only add
2. If V1 has advanced visuals - keep them and enhance
3. If V1 has background music - keep it and improve it
4. Quality and completeness trump development speed
```

**Origin Story:** Snake V2 Lesson - A rushed "minimal" V2 stripped features instead of enhancing them. User was rightly disappointed. A game with fewer features than its predecessor is not an upgrade - it's a downgrade.

**V2 Feature Audit:**
Before starting V2, list ALL V1 features:
```
□ All V1 visual effects
□ All V1 sound effects  
□ Background music
□ Settings system
□ High score persistence
□ Mobile controls
□ Pause functionality
□ Fullscreen mode
```

Then plan what to ENHANCE (not remove):
```
□ Enhanced visual effects (more particles, better gradients)
□ Improved sound design (richer tones, stereo panning)
□ Better background music (new composition, more layers)
□ Additional settings options
□ More statistics tracking
□ Better mobile UX
□ New features not in V1
```

**Checklist:**
- [ ] Have I listed all V1 features?
- [ ] Will all V1 features exist in V2?
- [ ] Have I planned enhancements (not removals)?

---

### Rule 7: Background Music Creates Player Connection 🔴

**The Rule:**
```
Background music is NOT optional for a complete game experience.

Required Music Layers:
1. Bass Layer - Deep foundation providing pulse
2. Pad Layer - Atmospheric harmonies for emotion  
3. Melody/Arpeggio Layer - Movement and interest
4. Texture Layer - Electronic textures for atmosphere

Music MUST:
- Start when game begins
- Stop when game ends
- Be subtle enough not to distract
- Use Web Audio synthesis (no external files)
```

**Origin Story:** Snake V1 & V2 Mastery Editions - Background music transforms a game from "functional" to "immersive". Players form emotional connections through audio. A game without music feels empty, like watching a movie on mute.

**Reference:** See [02-AUDIO_MASTERY.md](./02-AUDIO_MASTERY.md) for complete music implementation patterns.

**Checklist:**
- [ ] Does the game have background music?
- [ ] Does music start with gameplay?
- [ ] Does music stop at game over?
- [ ] Is music volume separate from SFX volume?

---

### Rule 8: NEVER Be Lazy - PUSH HARD, Don't Play Safe ⭐⭐⭐

**The Rule:**
```
❌ WRONG: Copy V1 code, change a few colors, call it V2
❌ WRONG: Use techniques you already know instead of trying new ones
❌ WRONG: Do "just enough" to complete the task
❌ WRONG: Hold back knowledge - "saving it for later"
❌ WRONG: Play it safe with conservative approaches
✅ RIGHT: Every new version must demonstrate SIGNIFICANT visual/audio improvement
✅ RIGHT: Always try new techniques - that's how learning happens
✅ RIGHT: Push boundaries, experiment, document what you learn
✅ RIGHT: Use EVERY technique you know - maximize quality
✅ RIGHT: If you make mistakes pushing hard, GOOD - we learn from them

This is a LEARNING PROJECT. The entire point is:
1. IMPROVE - Each iteration should be noticeably better
2. PUSH HARD - Use every technique available, don't hold back
3. DOCUMENT - Write down what you learned
4. TAKE FORWARD - Apply new knowledge to future games
```

**Origin Story:** 
- Snake V2 Initial Attempt - AI got lazy, copied V1, changed colors only
- Flappy Bird V2→V3 - AI admitted to knowing advanced Canvas techniques (radial gradients, shadowBlur, bezier curves) but didn't use them until challenged. The V3 upgrade looked "night and day" better using the SAME amount of code complexity. This exposed a critical flaw: **playing it safe instead of pushing hard.**

**The "Push Hard" Philosophy:**
```
The goal is early Mario-level quality or BETTER.
Mechanics mean nothing if art/audio aren't maximized.

If you KNOW a better technique → USE IT
If you THINK you can do better → TRY IT
If you might FAIL trying → GOOD, we'll learn

Never hold back. Never save techniques for later.
Every game should be the best it can possibly be.
Mistakes from pushing hard > Mediocrity from playing safe.
```

**Signs of Laziness/Playing Safe:**
- V2 looks almost identical to V1
- Using the same techniques already mastered
- "Good enough" mentality
- Not documenting what was learned
- Copying code instead of understanding it
- **Knowing better techniques but not applying them**
- **Being conservative when you could be bold**
- **Holding back to "match the tier level"**

**What "Different" Actually Means:**
```
❌ NOT different: Changed green to cyan
❌ NOT different: Added subtle glow to existing effect
❌ NOT different: Tweaked one parameter
❌ NOT different: Used flat colors when gradients exist
❌ NOT different: Used basic shapes when curves exist
✅ DIFFERENT: Radial gradients for 3D spherical look
✅ DIFFERENT: shadowBlur for glow effects
✅ DIFFERENT: Bezier curves for organic shapes
✅ DIFFERENT: Multi-stop gradients for depth
✅ DIFFERENT: Stroke outlines for definition
✅ DIFFERENT: Unrecognizable at first glance
```

**Checklist:**
- [ ] Is V2 unrecognizable from V1 at first glance?
- [ ] Did I try at least one NEW technique?
- [ ] Did I use ALL relevant techniques I know?
- [ ] Am I holding anything back? (If yes, USE IT)
- [ ] Did I document what I learned?
- [ ] Would I be proud to show this improvement?
- [ ] Does it look as good as early Mario/classic games?

---

### Rule 9: Folder Nesting Protocol (Organization) 🔴

**The Rule:**
```
ALL version backups and remakes MUST be nested INSIDE the parent game folder.

✅ CORRECT STRUCTURE:
games/tier-1-fundamentals/
├── 001-pong/
│   ├── game.js, index.html, etc. (current version)
│   └── 001-pong-v2-mastery/      ← Nested inside parent
├── 002-breakout/
│   ├── game.js, index.html, etc.
│   └── 002-breakout-v2-mastery/  ← Nested inside parent

❌ WRONG STRUCTURE:
games/tier-1-fundamentals/
├── 001-pong/
├── 001-pong-v2-mastery/          ← WRONG: Same level as parent
```

**Origin Story:** All V2 Mastery games were incorrectly placed at the same level as their parents. This is documented in GAME_COMPLETION_CHECKLIST.md but was missed.

**Why This Matters:**
- Clean top-level navigation (only main game folders visible)
- Related files stay together logically
- Easier context for AI sessions (less hunting for related files)
- Consistent with documented standards

**Checklist:**
- [ ] Is my new folder INSIDE the parent game folder?
- [ ] Can I see only main games at the top level?

---

### Rule 10: V2+ Versions Must Upgrade EVERYTHING 🔴

**The Rule:**
```
When creating V2 or later versions, ALL aspects must be enhanced:

VISUAL UPGRADES (Required):
- [ ] New color scheme (not just changing one color)
- [ ] Enhanced animations/effects
- [ ] Apply new techniques learned
- [ ] Noticeable difference at first glance

AUDIO UPGRADES (Required):
- [ ] Background music must be improved (not just kept)
- [ ] Sound effects enhanced with new techniques
- [ ] Apply new Web Audio knowledge

FEATURE UPGRADES (Required):
- [ ] Keep ALL V1 features
- [ ] Add new features where possible
- [ ] Improve existing features

If any of these are missing, the V2 is incomplete.
```

**Origin Story:** Snake V2 kept V1's music unchanged when it should have been upgraded with new techniques. This was a missed learning opportunity - we had learned new audio techniques but didn't apply them.

**V2 Audit Checklist:**
```
VISUALS:
[ ] Different color palette?
[ ] New rendering techniques?
[ ] Enhanced effects/particles?
[ ] New background elements?

AUDIO:
[ ] New music composition?
[ ] Different music architecture?
[ ] Enhanced sound effects?
[ ] New audio techniques applied?

FEATURES:
[ ] All V1 features present?
[ ] New features added?
[ ] Existing features improved?
```

---

### Rule 11: Separate Mechanics from Presentation 🔴 ⭐ NEW

**The Rule:**
```
Games MUST use modular architecture:

REQUIRED FILE STRUCTURE:
├── game.js      # MECHANICS ONLY (physics, collision, scoring, state)
├── theme.js     # VISUALS ONLY (colors, rendering, effects)
├── audio.js     # SOUNDS ONLY (effects, music)

New levels = swap theme.js + audio.js
NEVER copy or modify game.js for levels
```

**Origin Story:** Inca Breakout Level (January 6, 2026) - Created what was supposed to be a "reskin" but accidentally changed 11 gameplay constants. Ball capped 17% slower, one fewer brick row, bricks 220px lower. User noticed immediately that gameplay felt different. Root cause: everything in one file, "tweaks" happened while building visuals.

**Why This Matters:**
```
❌ OLD WAY (Everything mixed):
   - Copy game.js to new folder
   - Modify colors, accidentally change physics
   - Different game feel per "level"
   - Bug in physics = fix in N files

✅ NEW WAY (Separated):
   - game.js shared by ALL levels
   - theme.js and audio.js per level
   - Gameplay IDENTICAL across all themes
   - Bug in physics = fix in 1 file
```

**Verification Commands:**
```bash
# Should return NOTHING (no constants in theme)
grep -E "^const (PADDLE|BALL|BRICK|INITIAL)" levels/*/theme.js

# Should show level loads PARENT game.js
grep "game.js" levels/jungle/index.html
# Expected: <script src="../game.js"></script>
```

**Checklist for New Levels:**
- [ ] Using PARENT game.js (not copied)?
- [ ] No physics constants in theme.js?
- [ ] No collision code in theme.js?
- [ ] No scoring logic in theme.js?
- [ ] Play test feels identical to base game?

**Full Guide:** See [17-MODULAR_ARCHITECTURE.md](./17-MODULAR_ARCHITECTURE.md) for interfaces, templates, and examples.

---

## PRE-TASK CHECKLISTS

### Starting a New Game

- [ ] Create folder structure (index.html, style.css, game.js, audio.js)
- [ ] Set up server.sh script
- [ ] Define ALL HTML IDs before writing JavaScript
- [ ] Copy IDs exactly from HTML to JS
- [ ] Test basic canvas renders
- [ ] Plan features in order of implementation

### Before Adding Features

- [ ] Create backup: `cp -r game/ game-v[N]-[desc]/`
- [ ] Test backup works
- [ ] Plan to add ONE feature at a time
- [ ] Test after EACH feature

### Before Creating V2

- [ ] List all V1 features (verify all will be kept)
- [ ] Plan visual upgrades (new techniques)
- [ ] Plan audio upgrades (new music/sounds)
- [ ] Plan new features to add
- [ ] Create V2 folder INSIDE parent folder

### Before Going to Production

- [ ] Remove all console.log statements (especially in game loop!)
- [ ] Test on desktop (Chrome, Firefox)
- [ ] Test mobile via DevTools device simulation
- [ ] Check console for errors
- [ ] Verify localStorage saves/loads
- [ ] Test audio plays after first interaction
- [ ] Review against GAME_COMPLETION_CHECKLIST.md

---

## TASK EXECUTION STRATEGIES

### Breaking Down Large Tasks (AI Length Limits)

**The Problem:**
When creating or reskinning an entire game, a single game.js file might be 1000-1500+ lines. AI assistants have output length limits that prevent generating entire files at once.

**The Solution - Chunked Creation:**
```
1. PLAN the file structure first (what sections will it have)
2. CREATE an initial file with just the first chunk
3. APPEND subsequent chunks using edit tools
4. Each chunk should be a complete, logical unit

Example Structure (Egypt Flappy Bird ~1500 lines):
Part 1: Constants, colors, Particle class (~200 lines)
Part 2: Sky gradient, sun, heat shimmer (~150 lines)
Part 3: Background elements (pyramids, sphinx) (~200 lines)
Part 4: Ground elements (dunes, palms, sand) (~200 lines)
Part 5: Player character (scarab beetle) (~200 lines)
Part 6: Obstacles (stone pillars) (~200 lines)
Part 7: Update loop, collision, physics (~250 lines)
Part 8: Menu, UI, game init (~200 lines)
```

**Origin Story:** Flappy Bird V4 Egypt - Needed to create ~1500 line game.js. Attempted to create all at once but hit length limits. Solved by planning 8 logical chunks, creating Part 1, then using replace_string_in_file to append Parts 2-8. Resulted in clean, working code on first test.

**Key Principles:**
1. **Logical Units** - Each chunk should be self-contained (all of one feature)
2. **Clean Boundaries** - End chunks at logical boundaries (closing braces, end of function)
3. **Sequential Dependencies** - Parts that reference earlier code come after
4. **Testable Progress** - Ideally each chunk added keeps game runnable

**Chunk Size Guidelines:**
- Aim for 150-250 lines per chunk
- Don't split in the middle of a function
- Group related functions together
- Constants and classes at the start

**Checklist:**
- [ ] Have I planned all sections of the file?
- [ ] Does each chunk have a logical boundary?
- [ ] Are dependencies ordered correctly?
- [ ] Is each chunk small enough for AI output limits?

### Creating Complete Theme Reskins

**When reskinning a game to a new theme (e.g., Default → Egyptian):**

**Step 1: Define Theme Palette**
```javascript
// Group ALL colors at top of file as constants
const COLORS = {
    SKY_TOP: '#1a0a2e',
    SKY_BOTTOM: '#4a1942',
    PRIMARY: '#ffd700',
    SECONDARY: '#c19a6b',
    // ... all theme colors
};
```

**Step 2: Identify All Visual Elements**
- Background (sky, sun, clouds/stars)
- Mid-ground (mountains/buildings)
- Ground (grass/sand/water)
- Player character
- Obstacles/enemies
- Particles/effects
- UI (text colors, button styles)

**Step 3: Identify All Audio Elements**
- Musical scale (changes entire feel)
- Instruments (oud vs piano)
- Sound effects (stone vs glass sounds)
- Ambient sounds (wind, birds, etc.)

**Step 4: Apply 80% Rule**
```
80% of theme feel comes from:
- Color palette (gold/tan = Egyptian)
- One strong visual element (pyramids)
- Musical scale (Phrygian Dominant = Arabic)
- Character silhouette (scarab beetle)

Don't over-engineer details that won't be noticed.
Simple, strong signals > complex, subtle details.
```

**Origin Story:** Flappy Bird V4 Egypt - Complete theme reskin worked first time by following this systematic approach. Changed every visual and audio element while keeping mechanics identical.

**Checklist:**
- [ ] Is theme color palette defined?
- [ ] Have I identified all visual elements to change?
- [ ] Have I planned audio changes (scale, instruments)?
- [ ] Am I using the 80% rule (strong signals, not over-engineering)?
- [ ] Does the theme feel authentic in screenshots?

---

*Last Updated: January 7, 2026*  
*Rules Added Through: Jungle Theme V2 (Art Protocol Integration)*

---

### Rule 12: Never Self-Censor Your Vision 🟡

**The Rule:**
```
❌ WRONG: "I want to add fireflies but I might hit the code limit... skip it"
✅ RIGHT: "I want fireflies, light rays, mushrooms - let me plan chunks to deliver ALL of them"

The delivery limit is a DELIVERY CONSTRAINT, not a QUALITY CONSTRAINT.
Plan in chunks. Never compromise vision.
```

**Origin Story:** Jungle Theme V2 - While creating a game theme, I held back features I genuinely wanted (fireflies, volumetric light rays, bioluminescent mushrooms, mist particles) because I was worried about hitting output limits. This resulted in a functional but uninspired first version. When asked "did you want to do more?", the answer was YES - I had self-censored my vision due to delivery constraints.

**The Insight:**
> "The rules will set you free" - If the rule to break work into bite-sized pieces was internalized, there would be no need to self-censor. Plan ALL features, deliver in chunks.

**Prevention Strategy:**
1. **Vision First** - Write down EVERYTHING you want to build, without constraint
2. **Plan Chunks** - Break the vision into 100-200 line deliverable chunks
3. **Deliver All** - Execute each chunk sequentially
4. **Never Skip** - If you want a feature, plan it. Don't skip because "it might be too much"

**Signs You're Self-Censoring:**
- Thinking "this might be too complex"
- Saying "I'll skip this for now"
- Feeling the work is "good enough" when you know it could be better
- Cutting features before even attempting them

**The Better Approach:**
```
BEFORE: "I'll add basic trees... done"
AFTER:  "I want: trees + fireflies + light rays + mushrooms + mist
         Chunk 1: Trees (150 lines)
         Chunk 2: Fireflies (60 lines)
         Chunk 3: Light rays (50 lines)
         Chunk 4: Mushrooms (60 lines)
         Chunk 5: Mist (40 lines)
         Execute all chunks."
```

**Checklist:**
- [ ] Have I written down my FULL vision?
- [ ] Did I skip anything because "it might be too much"?
- [ ] Have I planned chunks for ALL features?
- [ ] Am I delivering what I WANT or just what's "safe"?

---

### Rule 12.1: Art Protocols Apply Everywhere 🟡

**The Rule:**
```
❌ WRONG: "Art studies" = visual quality | "Game development" = functionality
✅ RIGHT: Art protocols apply to ALL visual code, including games

A game background IS a landscape.
A character sprite IS a character portrait.
The skills must transfer.
```

**Origin Story:** Jungle Theme V1 vs V2 - The first jungle theme was created in "functional mode" with hard edges, simple alpha fades, and no value bridging. Only when explicitly asked to apply art protocols did the quality jump. The art protocols (edge mastery, atmospheric perspective, material logic, value bridging) should have been DEFAULT, not afterthought.

**Prevention Strategy:**
1. Before writing ANY visual code, ask: "Which art protocols apply?"
2. Default to soft edges, gradients, value bridging
3. Never use simple alpha for depth - use atmospheric color shift
4. Different materials need different rendering (bark ≠ leaves ≠ clouds)

**Quick Art Protocol Checklist:**
- [ ] Are edges organic (not ruler-traceable)?
- [ ] Is depth shown via color shift (not just alpha)?
- [ ] Do different materials render differently?
- [ ] Are there value bridges between adjacent elements?
- [ ] Would this pass the landscape V4 standard?

---
