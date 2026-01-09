# TIME-SLICE RUNNER - Planning Document

**Generated:** 2026-01-09  
**Project Type:** New Game (Tier 2 - Core Mechanics)  
**Scope:** Full (complete with polish and multi-level content)  
**Platform:** HTML5 Canvas (JavaScript)  
**Genre:** Endless Runner with Time Manipulation

---

## 🎯 CORE CONCEPT

An endless runner where the player controls a mystical time-traveling character. **Hold to slow time** (bullet-time effect) which drains a "chrono meter". **Perfect landings refill the meter**, creating a risk/reward loop where skilled play is rewarded with more time-manipulation power.

### Unique Mechanic
- **Time-Slice System**: Hold key to slow game speed (0.3x) but drain chrono meter
- **Perfect Landing**: Land within margin of platform center = chrono refill + bonus points
- **Risk/Reward**: Use slow-mo to nail perfect landings, but run out = forced full-speed

---

## 📋 PROJECT CLASSIFICATION

**Q-0a: Task Type**
- Answer: `new_game` (New game from scratch, no existing code)
- Derived: `task_type = new`

**Q0.5: Scope**
- Answer: `full` (Complete with polish, multiple difficulty modes, progression system)
- Time Budget: 8-12 hours

**Q0.6: Platform**
- Answer: `HTML5 Canvas`
- Tech Stack: JavaScript + Canvas 2D, modular architecture

**Q0.7: Genre/Category**
- Answer: `endless runner` (procedural platformer with infinite scrolling)

---

## 🎮 GAME REQUIREMENTS

### Core Mechanics (Must-Have)
1. **Infinite Scrolling** - Auto-scroll from left to right, never stops
2. **Procedural Generation** - Platforms spawn dynamically based on difficulty curve
3. **Time-Slice Mechanic** - Hold key to slow time (0.3x speed), drains chrono meter
4. **Chrono Meter** - Resource that depletes during slow-mo, refills on perfect landings
5. **Perfect Landing Detection** - Center 20% of platform = "perfect", gives chrono refill
6. **Jump Controls** - Space to jump, variable height (hold = higher)
7. **Death State** - Fall off bottom = game over
8. **Score System** - Distance traveled + perfect landing bonuses
9. **High Score** - localStorage persistence

### Difficulty System (New Standard - Multi-Level)
Instead of traditional levels, implement **3 difficulty modes**:
1. **Easy Mode**: Slower scroll, wider platforms, forgiving gaps
2. **Normal Mode**: Standard scroll speed, mixed platform sizes
3. **Hard Mode**: Fast scroll, narrow platforms, tight gaps

Modes unlock after achieving score thresholds:
- Easy: Always unlocked
- Normal: Unlock at 500 points in Easy
- Hard: Unlock at 1000 points in Normal

### Progression & Polish (New Standard)
- **Mode Selection Screen**: Choose difficulty before starting
- **Pause Menu with Settings**: 
  - Resume/Restart/Quit to menu
  - Volume control (+/- keys)
  - Visual settings (particles on/off, screen shake on/off)
- **localStorage Progress**: Save unlocked modes, high scores per mode
- **Victory Milestones**: Achievement popups at 500/1000/2000/5000 points

### Audio System (Enhanced Standard)
Building on Flappy Bird's music system with additions:
- **Layered Music**: Base track + intensity layer that fades in as speed increases
- **Time-Slice SFX**: Whoosh + pitch-down when activating slow-mo
- **Perfect Landing SFX**: Satisfying "ding" + chrono refill sound
- **UI Sounds**: Menu select, pause, mode unlock
- **Ambient**: Subtle time-tick sounds, wind whoosh

---

## 🏗️ ARCHITECTURE

### Modular Structure (Established Pattern)
```
008-endless-runner/
├── index.html          # Canvas setup, load order
├── game.js            # ALL game logic, NO rendering
├── theme.js           # ALL visual rendering, procedural art
├── audio.js           # Web Audio API, layered music system
└── style.css          # Minimal layout styles
```

### Game State Flow
```
modeselect → playing → paused → (resume to playing)
                    ↓
                gameover → (restart to modeselect)
```

### Key Classes
1. **Player**: Position, velocity, jump state, chrono meter
2. **Platform**: X, Y, width, type (normal/golden for perfect bonus)
3. **Particle**: Visual feedback for slow-mo, landings, speed
4. **Generator**: Procedural platform spawning with difficulty curve

---

## 🎨 VISUAL DIRECTION

### Theme: Mystical Time Traveler
- **Aesthetic**: Painterly, mystical, time-distortion effects
- **Color Palette**: 
  - Normal: Cool blues, purples, teals
  - Slow-mo: Warm golds, ambers (chrono energy)
  - Perfect landing: Bright cyan flash
- **Player**: Glowing humanoid figure with trailing time-particles
- **Platforms**: Floating geometric shapes with subtle glow
- **Background**: Layered parallax clouds/ruins, moves slower during slow-mo

### Visual Effects
- **Slow-mo VFX**: Radial blur, motion trails, warm color shift
- **Chrono Meter**: Glowing bar with pulsing edge, drains smoothly
- **Perfect Landing**: Ring burst, upward sparkles, screen flash
- **Speed Lines**: Horizontal streaks that intensify with speed
- **Particles**: Time-distortion motes, landing dust, chrono sparkles

---

## 🎯 SCOPE & PRIORITIES

### Phase 1: Core Loop (MVP)
- [ ] Infinite scrolling camera
- [ ] Platform generation (simple uniform spacing)
- [ ] Player jump + collision
- [ ] Death state (fall off screen)
- [ ] Distance score

### Phase 2: Time-Slice Mechanic
- [ ] Chrono meter resource system
- [ ] Hold key to slow game speed (0.3x)
- [ ] Meter drains during slow-mo
- [ ] Perfect landing detection (center 20%)
- [ ] Meter refills on perfect landing

### Phase 3: Difficulty Modes
- [ ] Mode selection screen
- [ ] 3 difficulty presets (Easy/Normal/Hard)
- [ ] Unlock system (score thresholds)
- [ ] localStorage for unlocked modes
- [ ] Per-mode high score tracking

### Phase 4: Pause & Settings (New Standard)
- [ ] Pause menu (ESC/P)
- [ ] Settings in pause: Volume, Particles, Screen Shake
- [ ] localStorage for settings persistence
- [ ] Resume/Restart/Quit to menu options

### Phase 5: Audio & Juice
- [ ] Layered music system (base + intensity layer)
- [ ] Time-slice SFX (whoosh, pitch-down)
- [ ] Perfect landing SFX (ding, refill)
- [ ] UI sounds (select, pause, unlock)
- [ ] Ambient sounds (ticking, wind)

### Phase 6: Procedural Generation Polish
- [ ] Difficulty curve (speed increases over time)
- [ ] Platform variety (width, type, golden platforms)
- [ ] Gap difficulty scaling
- [ ] Power-up platforms (optional: double chrono refill)

### Phase 7: Visual Polish
- [ ] Slow-mo VFX (radial blur, trails, color shift)
- [ ] Parallax background (3 layers)
- [ ] Particle systems (landing, slow-mo, speed)
- [ ] Screen shake on landing
- [ ] Victory milestone popups

---

## 📊 SUCCESS CRITERIA

### Functional Requirements
- ✅ Game runs smoothly at 60 FPS
- ✅ Infinite scrolling with no performance degradation
- ✅ Time-slice mechanic feels responsive and impactful
- ✅ Perfect landing detection is fair and consistent
- ✅ 3 difficulty modes with distinct feel
- ✅ Pause menu with working settings
- ✅ High scores persist across sessions

### Feel & Polish Requirements
- ✅ Time-slice creates dramatic slow-motion effect
- ✅ Perfect landings feel rewarding (audio + visual feedback)
- ✅ Difficulty curve ramps smoothly, not sudden spikes
- ✅ Chrono meter resource creates tension (strategic use)
- ✅ Each mode feels significantly different (speed, platform density)
- ✅ Music intensity matches gameplay speed

### Code Quality
- ✅ Modular architecture (game.js, theme.js, audio.js separation)
- ✅ Clean class structure (Player, Platform, Generator)
- ✅ No rendering code in game.js
- ✅ No game logic in theme.js
- ✅ Commented sections for readability

---

## 🚫 OUT OF SCOPE

### Not Included (Tier 2 Boundaries)
- ❌ Enemy AI or obstacles (focus on pure platforming)
- ❌ Multiple characters or unlockables (single character)
- ❌ Power-ups beyond golden platforms (keep mechanic focused)
- ❌ Mobile touch controls (keyboard only)
- ❌ Online leaderboards (localStorage only)
- ❌ Story or narrative elements (pure arcade)

---

## 📚 REFERENCE PATTERNS

### From Bible Docs
1. **Modular Architecture** (01-MODULAR_ARCHITECTURE.md)
   - game.js = logic only
   - theme.js = rendering only
   - audio.js = sound only

2. **Input Patterns** (03-INPUT_PATTERNS.md)
   - Coyote time for jump forgiveness
   - Input buffering for responsiveness
   - Hold detection for variable jump height

3. **Procedural Generation** (02-RENDERING_PATTERNS.md → adapt)
   - Platform spawning algorithm
   - Difficulty curve formula
   - Gap calculation based on player jump arc

4. **Polish Patterns** (04-PATTERNS_REFERENCE.md → new section)
   - Jump buffer implementation
   - Landing feedback (visual + audio)
   - Counter safeguards (chrono meter can't go negative)
   - State rendering completeness (show all relevant info)

### From Completed Games
- **Flappy Bird**: Infinite scrolling, procedural obstacles, score system
- **Platformer**: Jump mechanics, coyote time, particle systems, multi-level structure
- **Asteroids**: Screen shake, particle explosions, intensity ramping

---

## 🎓 LEARNING OBJECTIVES

### New Skills (Tier 2)
1. **Procedural Generation**: Dynamic content creation algorithm
2. **Difficulty Ramping**: Formula-driven difficulty increase over time
3. **Resource Management**: Chrono meter as gameplay-affecting resource
4. **Perfect Timing Mechanics**: Landing detection with margin of error
5. **Time Manipulation**: Slow-motion implementation (game speed control)

### Skills Reinforced
1. **Infinite Scrolling**: Building on platformer scrolling
2. **Modular Architecture**: 3rd project with game/theme/audio split
3. **localStorage**: Expanding to settings + multiple high scores
4. **Pause Systems**: Implementing comprehensive pause menu
5. **Audio Layering**: Multi-track music with dynamic mixing

---

## 🔧 TECHNICAL NOTES

### Procedural Generation Algorithm
```
spawnPlatform() {
  // Calculate next platform position
  let gap = baseGap + (difficulty * gapMultiplier);
  let width = baseWidth - (difficulty * widthReduction);
  
  // Ensure jumpable (max jump arc consideration)
  gap = Math.min(gap, maxJumpDistance);
  width = Math.max(width, minPlatformWidth);
  
  // Random height variation
  let y = groundY + randomRange(-maxHeightVar, maxHeightVar);
  
  // Occasional golden platform (perfect landing bonus)
  let type = (Math.random() < 0.15) ? 'golden' : 'normal';
  
  return new Platform(lastX + gap, y, width, type);
}
```

### Time-Slice Implementation
```
let gameSpeed = 1.0;  // Normal speed
let chronoMeter = 100; // Full meter

update() {
  if (keys['Shift'] && chronoMeter > 0) {
    gameSpeed = 0.3;  // Slow-mo
    chronoMeter -= 0.5;  // Drain rate
  } else {
    gameSpeed = 1.0;  // Normal speed
  }
  
  // Apply speed to all movement
  scrollSpeed = baseScrollSpeed * gameSpeed;
  player.vy += gravity * gameSpeed;
  
  // Clamp meter
  chronoMeter = Math.max(0, chronoMeter);
}
```

### Perfect Landing Detection
```
checkLanding(platform) {
  let landingX = player.x + player.width / 2;
  let platformCenterX = platform.x + platform.width / 2;
  let perfectMargin = platform.width * 0.2; // 20% center zone
  
  let distance = Math.abs(landingX - platformCenterX);
  
  if (distance < perfectMargin) {
    // PERFECT LANDING!
    chronoMeter += 20; // Refill
    score += 50;       // Bonus
    spawnPerfectParticles();
    AUDIO.playPerfectLanding();
  }
}
```

### Difficulty Curve
```
let distance = 0; // Meters traveled
let baseDifficulty = difficultyMode; // 1=Easy, 2=Normal, 3=Hard

update() {
  distance += scrollSpeed;
  
  // Gradually increase difficulty every 100m
  let timeDifficulty = Math.floor(distance / 100) * 0.1;
  currentDifficulty = baseDifficulty + timeDifficulty;
  
  // Also increase scroll speed slightly
  scrollSpeed = baseScrollSpeed * (1 + timeDifficulty * 0.1);
}
```

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Core Loop ✓
- [ ] Canvas setup + game loop
- [ ] Player class (position, jump, collision)
- [ ] Platform class (position, width, type)
- [ ] Simple platform generation (uniform)
- [ ] Infinite scrolling camera
- [ ] Death state (fall off screen)
- [ ] Distance score display

### Phase 2: Time-Slice ✓
- [ ] Chrono meter variable + UI display
- [ ] Hold Shift = slow game speed to 0.3x
- [ ] Meter drains during slow-mo (0.5/frame)
- [ ] All physics affected by gameSpeed multiplier
- [ ] Visual feedback (screen tint, particles)
- [ ] Audio feedback (whoosh, pitch-down)

### Phase 3: Perfect Landing ✓
- [ ] Detect landing position vs platform center
- [ ] Calculate "perfect" zone (20% of width)
- [ ] Chrono refill on perfect landing (+20)
- [ ] Score bonus on perfect landing (+50)
- [ ] Visual feedback (ring burst, sparkles)
- [ ] Audio feedback (ding, refill sound)

### Phase 4: Difficulty Modes ✓
- [ ] Mode selection screen
- [ ] 3 presets (Easy/Normal/Hard scroll speed + platform size)
- [ ] Unlock system (Easy always, Normal at 500, Hard at 1000)
- [ ] localStorage save unlocked modes
- [ ] Per-mode high score tracking
- [ ] Display "NEW HIGH SCORE" on game over

### Phase 5: Pause & Settings ✓
- [ ] Pause state (ESC/P key)
- [ ] Pause menu UI (Resume/Restart/Quit)
- [ ] Settings submenu (Volume, Particles, Shake)
- [ ] Volume control with +/- keys
- [ ] Settings persist in localStorage
- [ ] All toggles working (particles, shake)

### Phase 6: Procedural Polish ✓
- [ ] Difficulty curve (distance-based ramping)
- [ ] Platform variety (3 widths: wide/normal/narrow)
- [ ] Golden platforms (15% spawn rate, 2x chrono refill)
- [ ] Gap scaling (wider gaps at higher difficulty)
- [ ] Ensure all gaps are jumpable (test max jump arc)

### Phase 7: Visual Polish ✓
- [ ] Slow-mo VFX (radial blur shader or fake with particles)
- [ ] Parallax background (3 layers at different speeds)
- [ ] Particle systems (landing dust, slow-mo trail, speed lines)
- [ ] Screen shake on landing (optional toggle)
- [ ] Victory milestone popups (500/1000/2000/5000)
- [ ] Chrono meter glow effect (pulses when low)

### Phase 8: Audio Polish ✓
- [ ] Layered music (base track + intensity layer)
- [ ] Intensity layer fades in with scroll speed
- [ ] Time-slice SFX (whoosh + pitch-down)
- [ ] Perfect landing SFX (ding + refill)
- [ ] UI sounds (menu select, pause, unlock)
- [ ] Ambient sounds (subtle ticking, wind)

### Final QA ✓
- [ ] Test all 3 difficulty modes feel distinct
- [ ] Test perfect landing detection is fair
- [ ] Test chrono meter can't go negative
- [ ] Test high scores save per mode
- [ ] Test pause menu all options work
- [ ] Test volume persists across sessions
- [ ] Test performance (60 FPS for 5+ minutes)
- [ ] Test game over → restart flow
- [ ] Test mode unlock thresholds
- [ ] Test all keyboard controls responsive

---

## 🎉 OUTCOME LOG PREPARATION

When complete, document:
1. **Final Mechanics**: How time-slice feels, perfect landing tuning
2. **Difficulty Curve**: Formula used, playtesting results
3. **Procedural Generation**: Algorithm decisions, platform spacing
4. **Audio System**: Layering approach, intensity ramping
5. **Challenges**: Hard problems solved (procedural fairness, performance)
6. **Learnings**: Key insights about endless runners, time manipulation
7. **Polish Details**: VFX that made biggest impact, audio feel

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-09  
**Status:** Ready for Implementation
