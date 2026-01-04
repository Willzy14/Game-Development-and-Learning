# Game Completion Checklist

> **Purpose**: Ensure each game meets quality standards before marking as "complete". This checklist prevents shipping half-tested games and enforces good practices.

---

## 🔴 META-RULES (MUST FOLLOW)

### Before Starting Any Game
- [ ] **READ THIS ENTIRE CHECKLIST** before writing any code
- [ ] **Review what's expected** for completion before you begin
- [ ] **Check for new rules** added since last game
- [ ] **Plan which skills to practice** based on current checklist requirements

### Before Making ANY Changes to Working Game
- [ ] **CREATE BACKUP FOLDER** - Copy entire game to `[game-name]-v[N]-backup/` (NON-NEGOTIABLE)
- [ ] **TEST BACKUP WORKS** - Load backup in browser, verify it runs
- [ ] **NEVER MODIFY WITHOUT BACKUP** - A working game must NEVER be at risk from improvements
- [ ] This applies to bug fixes, new features, visual changes, refactoring - EVERYTHING

### Folder Organization (MUST FOLLOW)
- [ ] **NEST ALL BACKUPS INSIDE MAIN GAME FOLDER** - All version backups must be inside the primary game folder
- [ ] **STRUCTURE**: `tier-1-fundamentals/004-snake/` contains main files + all backup folders
- [ ] **EXAMPLE**: 
  ```
  004-snake/
    ├── game.js (current version)
    ├── index.html
    ├── style.css
    ├── audio.js
    ├── 004-snake-v1-phase2-working/
    ├── 004-snake-v2-phase3-working/
    └── game-v3-phase4-working.js
  ```
- [ ] **CONSISTENCY**: Every game follows this pattern (001-pong, 002-breakout, 003-space-invaders, 004-snake)
- [ ] **NAVIGATION**: User should see only game folders at tier level, not scattered backups
- [ ] **RATIONALE**: Keeps workspace clean, makes context preservation easier for AI, logical grouping

### After Completing Any Game
- [ ] **VERIFY ALL CHECKLIST ITEMS** are complete before marking game as done
- [ ] **ADD NEW RULES** if you learned something that should be standard in every future game
- [ ] **UPDATE TIER-SPECIFIC SECTIONS** if new skills should be required at your tier level
- [ ] **Document in retrospective** any checklist items that were hard to meet (adjust thresholds if needed)

### Checklist Maintenance
- [ ] **After every game**: Review if new patterns should become rules
- [ ] **After every tier**: Major checklist revision based on accumulated learnings
- [ ] **If you skip a checklist item**: Document WHY in retrospective (valid reason or fix it)

**⚠️ CRITICAL**: Do not start a game without reading this checklist. Do not mark a game complete without verifying every checkbox. ALWAYS backup before modifications.

---

## 🎮 Playtesting Requirements (MUST DO)

### Before Marking Complete
- [ ] **Play the full game at least 3 times** from start to finish
- [ ] **Reach game over condition naturally** (don't just test the happy path)
- [ ] **Test all controls** (keyboard, any alternative inputs)
- [ ] **Verify all game states work** (menu, playing, paused, game over, etc.)
- [ ] **Check audio plays correctly** in all situations
- [ ] **Test edge cases**:
  - What happens at screen boundaries?
  - What if player doesn't move?
  - What if player spams inputs?
  - Can player get stuck?

### Balance Testing
- [ ] **Is difficulty appropriate?** (too easy/hard = adjust)
- [ ] **Do mechanics feel fair?** (no cheap deaths)
- [ ] **Is progression clear?** (player knows what to do)
- [ ] **Are timers/cooldowns tuned?** (not too restrictive or permissive)

### Bug Hunting
- [ ] **Look for obvious bugs** during playtesting
- [ ] **Test failure modes** (what if lives = 0, score = 999999, etc.)
- [ ] **Check collision edge cases** (corners, multiple simultaneous hits)
- [ ] **Verify state transitions** (no getting stuck between states)

**MINIMUM**: Play through 3 complete games before shipping. If you find bugs, fix them and play again.

---

## 💻 Code Quality Standards

### Architecture
- [ ] **Uses OOP class structure** (unless procedural is explicitly better for this game)
- [ ] **Clear separation of concerns** (rendering ≠ logic ≠ input)
- [ ] **State machine for game flow** (if multiple states exist)
- [ ] **Constants at top of file** (easy to tune without hunting through code)
- [ ] **Descriptive variable names** (no single letters except i, j in loops)
- [ ] **Add features incrementally** - Test after each new feature before adding the next one (⚠️ Critical! Don't add everything at once)

### Reusability
- [ ] **Check for duplicate code** - Can anything be extracted to methods?
- [ ] **Identify shared patterns** - Used this in 3+ games? Extract to shared library
- [ ] **Document extraction candidates** in retrospective for future reference

### Comments
- [ ] **Section headers** for major code blocks
- [ ] **Complex logic explained** (especially collision math, state transitions)
- [ ] **TODOs removed or documented** (no `// TODO: fix this later` in shipped code)

---

## 🎨 Polish & Game Feel (Minimum Requirements)

### Visual Feedback
- [ ] **Something happens visually on collision** (color change, flash, particle, etc.)
- [ ] **State transitions are clear** (player knows when state changed)
- [ ] **Score/lives update immediately** and visibly when changed
- [ ] **Game over/win states are obvious** (not just console.log)
- [ ] **Modern aesthetics applied** (gradients, glows, or visual polish - not flat 1980s look)

### Audio Feedback
- [ ] **All major actions have sound** (player actions, collisions, state changes)
- [ ] **Audio doesn't clip/pop** (gain envelopes working)
- [ ] **Sound frequencies are distinct** (player sounds ≠ enemy sounds)
- [ ] **No annoying repetition** (consider pitch variation)

### Modern Visual Effects (Expected from Game 4 onward)
- [ ] **Gradients on key objects** (createLinearGradient or createRadialGradient)
- [ ] **Glow effects where appropriate** (shadowBlur + shadowColor)
- [ ] **Background depth** (starfield, parallax, or textured background)
- [ ] **Particle systems for impacts** (optional but encouraged)
- [ ] **Smooth alpha transitions** (fade in/out effects)
- [ ] **Modern color palette** (not just primary colors - use color theory)

### Canvas State Management (Required when using effects)
- [ ] **ctx.save() / ctx.restore() used correctly** (paired properly)
- [ ] **Shadow/alpha properties reset** after effects (prevent bleed)
- [ ] **Gradients don't cause performance issues** (cache if needed)

### Feel (Nice-to-Have, Encourage If Time)
- [ ] Screen shake on impact? (Tier 2+ expectation)
- [ ] Particle effects? (Tier 2+ expectation)
- [ ] Transition animations? (Tier 2+ expectation)
- [ ] Hit pause/freeze frames? (Advanced)

**MINIMUM**: Every player action must have clear visual AND audio feedback. Games from #4 onward should have modern visual polish (gradients/glows).

---

## 📊 Performance Checks

### Basic Testing
- [ ] **Game runs at 60 FPS** on your machine (check browser DevTools)
- [ ] **No visible lag or stuttering** during gameplay
- [ ] **Memory doesn't grow unbounded** (check DevTools Memory tab after 5 min play)

### Entity Management
- [ ] **Inactive entities are removed/pooled** (don't let arrays grow forever)
- [ ] **No unnecessary object creation in game loop** (create once, reuse)
- [ ] **Collision checks are reasonable** (N² is fine for <100 entities, optimize later if needed)

**MINIMUM**: Game must run smoothly for 10+ minutes without performance degradation.

---

## 📝 Documentation Requirements

### Code Documentation
- [ ] **README.md in game folder** with objectives and new concepts
- [ ] **Constants are explained** (via comments or README)
- [ ] **Shared library usage documented** if using extracted code

### Learning Documentation
- [ ] **Retrospective created** (use template)
- [ ] **Skills tracker updated** with new skills
- [ ] **Learning journey updated** with game entry
- [ ] **Weekly log updated** with time and learnings
- [ ] **Problems solved documented** (especially non-obvious fixes)

### Reflections
- [ ] **What went well?** (2-3 specific things)
- [ ] **What didn't work?** (1-2 honest assessments)
- [ ] **What would you improve?** (if revisiting)
- [ ] **Key insight** (one sentence takeaway)

**MINIMUM**: Retrospective + tracker updates must be done before starting next game.

---

## 🔄 Shared Library Extraction Rules

### When to Extract
- [ ] **Rule of Three**: Used in 3 different games with minimal variation
- [ ] **Stable API**: Functionality hasn't changed much across uses
- [ ] **Clear boundaries**: Code is self-contained with defined inputs/outputs
- [ ] **Worth maintaining**: Will actually use in future games

### What to Extract
- ✅ **Audio System** (extracted after game 3)
- 🔜 **Visual Effects Library** (gradients, glows, particles - after game 5 if pattern stable)
- 🔜 **Collision Utilities** (after game 4 if still duplicating)
- 🔜 **Math helpers** (if using same calculations 3+ times)
- 🔜 **Input manager** (if keyboard handling gets complex)

### Extraction Process
- [ ] **Create `/shared-library/[category]/` folder**
- [ ] **Write comprehensive README.md** with usage examples
- [ ] **Include JSDoc comments** for all public methods
- [ ] **Update all games to use shared version** (verify still works)
- [ ] **Document in retrospective** why this was extracted

**MINIMUM**: Don't extract until third use. Don't copy-paste if shared version exists.

---

## ✅ Definition of "Complete"

A game is only complete when:

1. ✅ **ALL playtesting requirements met** (played 3+ times)
2. ✅ **No known game-breaking bugs**
3. ✅ **Code quality standards met**
4. ✅ **Minimum polish requirements met** (visual + audio feedback)
5. ✅ **Performance is acceptable** (no lag, no memory leaks)
6. ✅ **Documentation is complete** (retrospective + tracker updates)
7. ✅ **Shared library extraction evaluated** (extract if third use)

**If any checkbox is unchecked, game is NOT complete.**

---

## 🎯 Tier-Specific Additions

### Tier 1 - Fundamentals (Current)
- Focus on core mechanics working correctly
- Visual polish is nice-to-have, not required
- Simple shapes/colors are acceptable
- Audio via shared library is sufficient

### Tier 2 - Intermediate (Future)
- Will add requirements for:
  - Particle effects
  - Screen shake
  - Transition animations
  - Sprite-based rendering
  - More complex state management

### Tier 3+ - Advanced (Future)
- Will add requirements for:
  - Save/load systems
  - Multiple levels with progression
  - Boss battles or complex AI
  - Comprehensive menus
  - Visual effects library

---

## 📋 Pre-Commit Checklist (Quick Version)

Before marking game complete and starting next one:

1. **Played 3+ full games? Bug-free?**
2. **Code is clean and well-structured?**
3. **Visual + audio feedback on all actions?**
4. **Runs smoothly for 10+ minutes?**
5. **Retrospective written?**
6. **Tracker updated?**
7. **Shared library extraction considered?**

**If all YES → Ship it! 🚀**  
**If any NO → Fix it first! 🔧**

---

## 🔄 Evolution Notes

This checklist MUST evolve as we learn:

### How to Add New Rules
1. **During retrospective**: Identify patterns that should be standard (e.g., "always playtest 3x")
2. **Update this checklist**: Add new rule to appropriate section
3. **Mark in retrospective**: Note that checklist was updated with new rule
4. **Apply going forward**: All future games must meet new standard

### When to Add Rules
- ✅ **Found a preventable bug**: Add check to prevent it in future (like enemy shooting bug)
- ✅ **Discovered best practice**: If it improves quality, make it a rule
- ✅ **Learned new skill**: Once mastered, add to tier requirements
- ✅ **Third use pattern**: If doing something 3x, it should be a standard

### Examples of Rules That Should Be Added
- After learning particle systems → "All destruction events should have particle effect"
- After learning screen shake → "Significant impacts should have screen shake"
- After solving a common bug type → "Test for [specific edge case]"
- After optimizing performance → "Profile game after 10 min of play"

**The checklist is alive** - it grows with your skills. Stagnant checklist = not learning!

**Last Updated**: January 3, 2026 (After Space Invaders V3 - Visual Modernization)  
**Next Review**: After Game 6 (End of Tier 1)

---

## 📝 Checklist Update Log

Track all changes to this checklist:

### January 5, 2026
- **Initial creation** after Space Invaders (Game 3)
- Added META-RULES section requiring checklist review before/after every game
- Added requirement to update checklist when learning new mandatory skills
- Set 3-game playtesting minimum based on enemy shooting bug discovery
- **Added "incremental feature addition" rule** - After Space Invaders V2 attempt broke when adding particles + screen shake + shields + collision library all at once. Breaking changes into testable increments prevents debugging nightmares.

### January 3, 2026 - After Space Invaders V3 Visual Modernization
- **Added NON-NEGOTIABLE backup rule** to META-RULES - Must create backup folder before ANY changes to working game
- **Added modern visual effects requirements** to Polish section - Gradients, glows, modern colors expected from Game 4 onward
- **Added Canvas state management checklist** - ctx.save/restore, shadow/alpha reset requirements
- **Added "Visual Effects Library" to extraction candidates** - Will extract after 3 uses with stable pattern
- **Key lesson**: Data structure consistency (ENEMY_TYPES mismatch caused blank screen)
- **Key lesson**: Syntax errors from multi-line edits (extra `});` broke game)
- **Key lesson**: State-independent background updates (starfield frozen on menu)

### January 3, 2026 - After Snake (Game 4) Completion
- **Added "Folder Organization" rule to META-RULES** - All game version backups must be nested inside main game folder
- **Structure example**: `004-snake/` contains main files + all backup folders (004-snake-v1-phase2-working/, etc.)
- **Rationale**: Keeps workspace clean at tier level, makes navigation logical, preserves context for AI
- **Applied retroactively**: Reorganized Space Invaders (003) and Snake (004) to follow new structure
- **Key lesson**: Phase-by-phase development with backups prevents compounding errors (Snake had zero bugs vs Space Invaders V3)
- **Key lesson**: Modern visuals from day 1 easier than retrofitting

### [Future Date]
- [Document changes here as checklist evolves]
