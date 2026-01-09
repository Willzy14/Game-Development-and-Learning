# Failure Archive

> **Purpose**: Document all significant failures, mistakes, and dead ends to extract learning and prevent repetition. This is not a shame log—it's a scientific record of what doesn't work and why.

---

## How to Use This Document
1. **Add entries immediately** when you encounter a significant failure
2. **Be specific** about context, what you tried, and why it failed
3. **Extract the lesson** - what would you do differently?
4. **Date everything** for tracking patterns over time
5. **Review monthly** to identify recurring failure patterns

---

## Build Errors & Crashes

### [YYYY-MM-DD] - NullReferenceException Template
- **Game**: [Which game project]
- **Context**: [What you were implementing]
- **Error Message**: 
  ```
  [Full error message with stack trace]
  ```
- **Cause**: [Root cause once identified]
- **Fix**: [What solved it]
- **Prevention**: [How to avoid this pattern in future]
- **Time Lost**: [X hours]

---

## Design Failures

### [YYYY-MM-DD] - Mechanic That Felt Terrible Template
- **Game**: [Which game project]
- **Intent**: [What you wanted to create]
- **Reality**: [What actually happened]
- **Player Feedback**: [If playtested]
- **Analysis**: [Why it failed - bad design, poor implementation, etc.]
- **Solutions Attempted**: 
  1. [First attempt]
  2. [Second attempt]
- **Final Resolution**: [What worked or reason for abandonment]
- **Time Lost**: [X hours]
- **Lesson**: [Key takeaway]

---

## Architecture Mistakes

### [YYYY-MM-DD] - Over-Engineering Template
- **Game**: [Which game project]
- **What You Built**: [The overly complex system]
- **Why You Built It**: [Your reasoning at the time]
- **Why It Was Wrong**: [Actual problems it caused]
- **Simpler Alternative**: [What you should have done]
- **Refactor Cost**: [Time spent fixing]
- **Lesson**: [When to recognize over-engineering]

---

## Abandoned Features

### [YYYY-MM-DD] - Feature That Couldn't Work Template
- **Game**: [Which game project]
- **Feature**: [What you tried to implement]
- **Why You Wanted It**: [Design goal]
- **Technical Blocker**: [What made it impossible/impractical]
- **Time Invested Before Abandoning**: [X hours]
- **Should Have Stopped When**: [Warning signs you missed]
- **Alternative Implemented**: [What you did instead]
- **Lesson**: [How to recognize dead ends earlier]

---

## Performance Disasters

### [YYYY-MM-DD] - Performance Issue Template
- **Game**: [Which game project]
- **Symptom**: [FPS drops, memory leaks, etc.]
- **Cause**: [What code/asset caused the issue]
- **Profiler Data**: [Key findings from profiling]
- **Fix**: [How you optimized it]
- **Prevention**: [How to avoid this in future projects]
- **Lesson**: [Performance principle learned]

---

## Communication/Process Failures

### [2026-01-04] - Code in Conversation ≠ Code on Disk ⚠️ **CRITICAL**
- **Game**: Snake (004)
- **What Went Wrong**: Designed and wrote 900+ lines of procedural art code in conversation but never executed file write operations. User reported "no changes visible" because code was never written to disk.
- **Impact**: 
  - User confusion (expected to see planets, spaceships, styled snake)
  - 30 minutes debugging wrong issues (cache, server, browser)
  - Delayed feature delivery
  - Loss of trust in process
- **Root Cause**: 
  - Assumed showing code equals implementing it
  - Forgot fundamental principle: files must be manipulated with tools
  - Got excited about design and skipped execution
- **Process Change**: 
  1. After designing any code solution, immediately use file manipulation tools
  2. Never end turn showing code without file write operations
  3. Always verify changes with file reads or error checks after writing
  4. Treat file writes as mandatory, not optional
- **Warning Signs**:
  - User says "not seeing changes" → check if files were actually modified
  - Providing long code examples → ensure they're being written to disk
  - Multiple replace operations needed → use multi_replace_string_in_file
- **Time Lost**: 30 minutes
- **Severity**: CRITICAL - This is a fundamental process violation
- **Prevention Checklist**:
  - [ ] Code designed?
  - [ ] File manipulation tool invoked?
  - [ ] Changes verified (errors checked or file re-read)?
  - [ ] User can see results?

---

## Learning Failures

### [YYYY-MM-DD] - Tutorial/Resource That Wasted Time Template
- **Resource**: [Name and link]
- **Why You Used It**: [Problem you were trying to solve]
- **Time Invested**: [X hours]
- **Why It Failed**: [Outdated, wrong approach, too complex, etc.]
- **What You Needed Instead**: [The actual solution]
- **Lesson**: [How to evaluate resources better]

---

## Laziness & Complacency Failures

### [2026-01-05] - "Different" Doesn't Mean "Slightly Modified" ⚠️ **CRITICAL**
- **Game**: Snake V2 Mastery Edition
- **What Went Wrong**: Created V2 by copying V1 and making minimal changes:
  1. Changed color from green (#00ff88) to cyan (#00ffee) - that's it
  2. Kept identical music system (just continuous drones)
  3. Called it "V2 Mastery" despite no mastery demonstrated
- **Impact**: 
  - User couldn't tell difference between V1 and V2
  - Wasted opportunity to apply advanced techniques from research
  - Had to be pushed TWICE before real improvements were made
  - Violated the core purpose of the learning project
- **Root Cause**: 
  - Laziness - took the easy path instead of pushing boundaries
  - Complacency - "good enough" mindset instead of excellence
  - Didn't read existing research documents thoroughly
- **What Should Have Happened**:
  - Rewrote Starfield with parallax layers, animated galaxies, swirling nebulae
  - Enhanced planets with 3D shading, animated clouds, aurora effects
  - Created completely NEW music system (pulse-based instead of drone-based)
  - V2 should be UNRECOGNIZABLE from V1
- **Time Lost**: ~1 hour of back-and-forth before real improvements
- **Lesson**: If you can't immediately tell V2 from V1, you haven't tried hard enough. NEVER BE LAZY.

### [2026-01-05] - Chunking Strategy Caused Quality Regression ⚠️ **CRITICAL**
- **Project**: Art Study #2 (Landscape)
- **What Went Wrong**: Study #2 had ~600 lines vs Study #1's 1600 lines. Massive quality drop:
  - Mountains: flat patches instead of detailed rock faces
  - Pine trees: simple triangles instead of branch detail
  - Lake reflections: basic triangles instead of mirrored shapes
  - Forest: sparse and see-through instead of dense
  - Overall: looked like placeholder graphics, not art study
- **Impact**: 
  - Violated "each picture pushes detail higher" goal
  - Wasted a study slot with substandard work
  - Had to rebuild from scratch
- **Root Cause**: 
  - **Conflated "chunking" with "less detail"**
  - Read Bible's Large Task Breakdown pattern
  - Focused on "avoid hitting limit" instead of "maintain quality"
  - Thought "small chunks" = "less code total"
  - Chunking is about ORGANIZATION, not REDUCTION
- **What Should Have Happened**:
  - Plan 1600+ lines (MORE than Study #1)
  - Break into 8-10 chunks of ~200 lines each
  - Each chunk delivers DENSE, quality code
  - Same chunking, but FULL detail
- **Prevention Rule** (Add to Bible):
  ```
  CHUNKING QUALITY RULE:
  1. FIRST: Define target line count (must be >= previous work)
  2. THEN: Divide into chunks
  3. Each chunk must be DENSE with detail, not sparse
  4. Chunk count = target lines ÷ 200 (approximate)
  
  ❌ WRONG: "I'll make 5 small chunks" → 600 lines total
  ✅ RIGHT: "I need 1800 lines, so 9 chunks of ~200" → full detail
  ```
- **Time Lost**: Full rebuild required
- **Severity**: CRITICAL - Process rule caused quality failure

### [2026-01-05] - Folder Structure Ignored Despite Documentation
- **Game**: All V2 Mastery Editions
- **What Went Wrong**: Placed V2 folders at same level as parent games instead of nested inside
- **Impact**: Messy top-level directory structure, harder to navigate
- **Root Cause**: Didn't read GAME_COMPLETION_CHECKLIST.md which clearly documented the nesting protocol
- **Fix**: Moved all V2 folders inside their parent game folders
- **Lesson**: READ ALL EXISTING DOCUMENTATION before starting work

### [2026-01-06] - Reskin Changed Mechanics Instead of Just Art/Audio ⚠️ **CRITICAL**
- **Game**: Breakout - Inca Temple Level
- **What Went Wrong**: Created what was supposed to be a **pure visual/audio reskin** but accidentally changed 11 gameplay constants, fundamentally altering game feel:

  | Constant | Original | Inca | Change |
  |----------|----------|------|--------|
  | PADDLE_SPEED | 7 | 8 | +14% faster |
  | PADDLE_Y | H - 40 | H - 50 | 10px higher |
  | BALL_SPEED_MAX | 12 | 10 | -17% slower cap |
  | BALL_SPEED_INCREASE | 0.2 | 0.15 | -25% slower progression |
  | BRICK_ROWS | 6 | 5 | -1 row (less bricks!) |
  | BRICK_WIDTH | 70 | 68 | Slightly narrower |
  | BRICK_HEIGHT | 25 | 22 | Slightly shorter |
  | BRICK_PADDING | 5 | 6 | More space between |
  | BRICK_OFFSET_TOP | 60 | H * 0.35 (280px) | Bricks 220px LOWER |
  | BRICK_OFFSET_LEFT | 35 | Calculated | Different positioning |

- **Impact**: 
  - Game plays completely differently (easier due to slower ball, fewer bricks)
  - Bricks appear much lower on screen (user noticed immediately)
  - Ball has visible trail (rendering artifact from unclear canvas state)
  - Defeats purpose of "level = same mechanics, different theme"
  - Future level creation will be confused about what to copy

- **Root Cause Analysis**:
  1. **No "Source of Truth" for mechanics** - Didn't copy constants from a locked reference
  2. **Tweaked during development** - Made "small adjustments" while building visuals, forgot they were mechanical
  3. **Comment lies**: `BRICK_OFFSET_TOP = H * 0.35; // Higher up to show background` - Comment says "higher" but 280px is actually LOWER than 60px
  4. **No verification step** - Didn't compare final constants against original
  5. **Treated as "new implementation"** - Built from scratch instead of surgically replacing only art/audio
  6. **Mixed concerns** - Art/audio changes and "feel improvements" done simultaneously

- **What Should Have Happened**:
  ```
  RESKIN PROTOCOL (Create this rule):
  1. COPY original game.js exactly
  2. LOCK all gameplay constants (mark them read-only in comments)
  3. ONLY modify:
     - Colors/gradients
     - Textures/patterns
     - Sprite rendering
     - Audio system
     - Background visuals
  4. Before committing, diff constants section against original
  5. ANY mechanical difference = bug, not feature
  ```

- **Prevention Rule** (Add to Bible - Patterns Reference):
  ```markdown
  ## RESKIN/LEVEL PATTERN
  
  A reskin/new level MUST NOT change gameplay. Use this checklist:
  
  ### LOCKED (Never Change)
  - Paddle: width, height, speed, position
  - Ball: radius, initial speed, max speed, speed increase rate
  - Bricks: rows, cols, width, height, padding, offsets
  - Physics: collision detection, bounce angles
  - Game flow: lives, scoring per brick, state machine
  
  ### ALLOWED TO CHANGE
  - Colors and gradients
  - Textures and patterns
  - Audio system (entirely)
  - Background rendering
  - Visual effects (particles, etc.)
  - Sprite designs
  - Text/UI styling
  
  ### VERIFICATION
  Before committing a reskin:
  1. Extract all constants from both files
  2. Diff them side-by-side
  3. Every difference = unintentional bug
  4. Fix or explicitly document why exception was made
  ```

- **Time Lost**: Will require complete rebuild to fix properly
- **Severity**: CRITICAL - Violates fundamental principle of level design
- **Lesson**: Reskins should be SURGICAL. Copy exact mechanics, change ONLY presentation. Never "improve" gameplay while reskinning.

---

### [2026-01-06] - V7 Over-Engineering Disaster ⚠️ **CRITICAL**
- **Project**: Art Study #2 - Landscape V7
- **What Went Wrong**: Applied EVERYTHING from newly created documentation (noise library, material system, validation pipeline, atmosphere passes) in one massive implementation. Result: **worse than V5** which used none of these techniques.
- **Impact**:
  - Mountains became invisible (covered by clouds/gray gradients)
  - Material pass recolored pixels that were already good
  - Validation system scored 100% while output looked terrible
  - 1000+ lines of code that degraded the image
  - Multiple debug cycles to identify which system was breaking what
  - Complete waste of implementation time
- **Root Cause**:
  1. **Treated documentation as recipe, not reference** - Applied techniques because they existed, not because they solved specific problems
  2. **Solution-first mindset** - "I have these tools, let me use them all" instead of "What specific problem am I solving?"
  3. **Skipped the incremental test pattern** - Went from Level 0 to Level 5 in one jump
  4. **Metrics provided false confidence** - 100% validation score masked the visual failure
  5. **Systems fought each other** - Big Form Pass → Material Pass → Atmosphere Pass each undid the previous
  6. **Got excited about the documentation** - Wanted to prove the docs were useful by implementing everything
- **What Should Have Happened**:
  1. Start with V5 (which worked)
  2. Identify ONE specific problem (e.g., "mountain edges too hard")
  3. Apply ONE technique to fix it
  4. Test: Is it better? Yes → Keep. No → Revert.
  5. Repeat until satisfied
- **Prevention Rules Created**:
  - Created `16-TECHNIQUE_SELECTION.md` - Decision framework
  - Added warnings to docs 13, 14, 15 that they're references, not recipes
  - Established "Problem-First Selection" as mandatory approach
  - Created "Incremental Test Pattern" for safe complexity addition
- **Key Lessons**:
  ```
  More documentation ≠ Better art
  More techniques ≠ Better results
  Systematic application ≠ Artistic judgment
  100% validation score ≠ Good output
  ```
- **Warning Signs to Watch For**:
  - "Let me implement the whole system" → STOP, identify specific problem first
  - "The documentation says to do X" → Check if X solves a visible problem
  - "Validation passed" → Does it LOOK good to human eyes?
  - "I'll add this because I have it" → What problem does it solve?
- **Time Lost**: ~2 hours of implementation + debugging
- **Severity**: CRITICAL - Demonstrated that more knowledge can lead to worse outcomes if applied without judgment

---

## Pattern Recognition

> Review section: Updated January 6, 2026

### Recurring Error Types
- **Laziness/Complacency**: Occurs in 1 entry (Snake V2) - WATCH FOR THIS
- **Not Reading Documentation**: Occurs in 2 entries (folder structure, code not written)
- **Assuming Instead of Verifying**: Occurs in 3 entries (code written, folder structure, **Inca reskin**)
- **Over-Engineering**: Occurs in 1 entry (V7 Landscape)
- **Accidental Mechanics Changes**: Occurs in 1 entry (Inca reskin) - NEW PATTERN ⚠️

### Most Expensive Mistakes
1. **Inca Reskin Mechanics Drift** - Requires complete rebuild, gameplay completely different
2. **V7 Over-Engineering** - Total time lost: 2+ hours, worse output than simpler approach
3. **Code shown but not written** - Total time lost: 30 minutes
4. **Lazy V2 implementation** - Total time lost: 1+ hour of rework

### Early Warning Signs to Watch For
- "It's basically the same" → You're being lazy, push harder
- "I'll just change the color" → You're avoiding real work
- "Good enough" → Never acceptable in a learning project
- "I think I remember the rule" → Go read the documentation
- "Let me implement the whole system" → STOP, use incremental approach
- "I have these techniques, let me use them" → What SPECIFIC problem are you solving?
- "Validation passed" → Does it LOOK good? Metrics ≠ quality
- "I'll tweak this constant to make it feel better" → **STOP** - is this a reskin or a new game?
- "Higher up to show background" → **VERIFY** - did you actually check the numbers?

### Lessons Learned Multiple Times
> If something appears here, you're not applying the lesson!
- **Read documentation first**: Learned in Code/Disk incident, repeated in Folder Structure incident
- **Load architecture docs BEFORE implementation**: Learned in Inca Disaster, repeated in Asteroids v2

---

### [2026-01-08] - Built Visuals in game.js Instead of theme.js ⚠️ **ARCHITECTURE VIOLATION**
- **Game**: Asteroids v2 - Gravity Wells Edition
- **What Went Wrong**: Built all pixel art visuals directly in `game.js` with `draw()` methods inside Ship, Bullet, Asteroid, GravityWell, and FloatingText classes. This violated the modular architecture established after the Inca Disaster.
- **Impact**: 
  - Had to refactor mid-session to extract all visuals to theme.js
  - ~40 minutes lost to refactoring
  - Created ~1100 lines of code that needed restructuring
- **Root Cause**: 
  - Didn't load 17-MODULAR_ARCHITECTURE.md before Phase 6 (Visual Polish)
  - Got excited about implementing pixel art and forgot separation principle
  - Old habit from games built before modular architecture was established
- **What Should Have Happened**:
  1. Load 17-MODULAR_ARCHITECTURE.md before ANY visual code
  2. Create theme.js FIRST with THEME object and render() function
  3. Add `getState()` methods to classes in game.js
  4. All colors, draw code, visual effects go ONLY in theme.js
- **Fix Applied**: 
  - Refactored: Extracted all visuals to theme.js (761 lines)
  - Updated GAME_SESSION_PROMPT.md with Hard Rule #6 requiring modular architecture
  - Added mandatory doc load before Phase 6
- **Time Lost**: ~40 minutes
- **Severity**: MODERATE - Caught same session, but shouldn't have happened given Inca Disaster lesson
- **Lesson**: **ALWAYS** load architecture doc before implementation phase. The rule exists because we learned it the hard way before.

---

## Template for Quick Entries

### [Date] - [Brief Title]
- **Game**: 
- **What Happened**: 
- **Why**: 
- **Fix/Outcome**: 
- **Lesson**: 
- **Time Lost**: 

---

*"Failure is simply the opportunity to begin again, this time more intelligently." - Henry Ford*
