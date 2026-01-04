# Pong Retrospective

## Project Overview
- **Start Date**: 2026-01-03
- **End Date**: 2026-01-03
- **Learning Tier**: 1 - Fundamentals
- **Estimated Hours**: 2
- **Status**: Completed
- **Target Skills**: 
  - [x] Game loop implementation
  - [x] Canvas rendering
  - [x] Collision detection
  - [x] Input handling
  - [x] Basic AI
  - [x] Game state management
  - [x] Score tracking

## What Went Well

### Technical Successes
- **Game Loop**: Implemented clean requestAnimationFrame loop with separate update/render phases
- **Collision Detection**: Rectangle-circle collision works smoothly for paddle-ball interactions
- **State Management**: Simple enum-based state system (MENU, PLAYING, GAME_OVER) is clear and maintainable
- **Input Handling**: Key tracking object pattern works well for responsive controls

### Learning Wins
- **Canvas API**: Understood basic drawing primitives (fillRect, arc, fillText)
- **Game Loop Pattern**: Grasped the update-render separation concept
- **Collision Math**: Learned AABB (Axis-Aligned Bounding Box) collision detection
- **Velocity Calculations**: Understood basic physics with dx/dy velocity components

### Process Wins
- **Incremental Development**: Built features one at a time (paddles → ball → collision → scoring)
- **Constants Organization**: Keeping magic numbers as named constants at top made tuning easy
- **Clean Structure**: Separating concerns (input, update, render) made debugging straightforward

## What Went Wrong

### Blockers
- **Initial Collision Bug**: 
  - Problem: Ball would get stuck inside paddle on first implementation
  - How Resolved: Added direction checks (ball.dx < 0 for left paddle, ball.dx > 0 for right)
  - Time Lost: ~15 minutes

### Time Sinks
- **Paddle Hit Angles**: 
  - Task: Making ball bounce at different angles based on where it hits paddle
  - Why: Needed to understand trigonometry and normalize hit position to [-1, 1] range
  - Lesson: Should have sketched the math on paper first
  - Time: ~30 minutes of trial and error

### Critical Mistakes
1. **Ball Speed Acceleration**: Initially increased speed on every paddle hit without cap, causing ball to become unplayable after 5-6 hits. Fixed by resetting speed on score.
2. **AI Perfect Tracking**: First AI implementation tracked ball perfectly, was unbeatable. Added tolerance value to make AI miss sometimes.

### Abandoned Features
- **Sound Effects**: 
  - Why Abandoned: ~~Wanted to focus on core mechanics first, audio can be learned in future game~~
  - Should Try Again?: ~~Yes, in next game (Tier 1 or 2)~~
  - **UPDATE**: Actually implemented! Used Web Audio API to generate sounds programmatically

## Key Learnings

### Technical Insights

1. **Game Loop Architecture**
   - Description: Separation of update() and render() is fundamental pattern
   - Code Example:
   ```javascript
   function gameLoop() {
       update();   // All logic and physics
       render();   // All drawing
       requestAnimationFrame(gameLoop);
   }
   ```
   - When to Use: Every game needs this pattern

2. **Collision Detection (AABB + Circle)**
   - Description: Check if ball's bounding box overlaps paddle's rectangle
   - Code Example:
   ```javascript
   if (ball.x - ball.size/2 <= paddle.x + paddle.width &&
       ball.x + ball.size/2 >= paddle.x &&
       ball.y + ball.size/2 >= paddle.y &&
       ball.y - ball.size/2 <= paddle.y + paddle.height) {
       // Collision detected!
   }
   ```
   - When to Use: Any 2D game with rectangular and circular objects

3. **Input Buffering with Key Object**
   - Description: Store key states in object, check in update loop
   - Better than: Checking keys directly in event handlers (causes stuttering)
   - When to Use: Any game needing smooth continuous input

4. **Web Audio API Basics** *(Added after audio implementation)*
   - Description: Create audio programmatically using AudioContext and oscillators
   - Code Example:
   ```javascript
   const ctx = new AudioContext();
   const oscillator = ctx.createOscillator();
   const gainNode = ctx.createGain();
   oscillator.connect(gainNode);
   gainNode.connect(ctx.destination);
   oscillator.frequency.value = 440; // A4 note
   oscillator.start();
   ```
   - When to Use: Simple games where file size matters or learning synthesis
   - Key Lesson: Browser autoplay policy requires user interaction before audio

5. **Audio Gain Envelopes** *(Added after audio implementation)*
   - Description: Fade volume in/out to prevent click/pop artifacts
   - Code Example:
   ```javascript
   gainNode.gain.setValueAtTime(0, ctx.currentTime);
   gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); // Fade in
   gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration); // Fade out
   ```
   - When to Use: All synthesized sounds to avoid audio artifacts

### Process Improvements
1. **Start with static visuals**: Drew all objects at rest before adding movement - made debugging layout easier
2. **Console.log physics values**: Printing ball.dx, ball.dy during development helped understand collision bugs

### Mental Model Shifts
1. **Canvas is immediate mode**: Unlike DOM, must clear and redraw everything every frame
2. **Game state is just data**: State changes = data changes, then UI reflects data in render()

## Code Smells Identified

### Anti-Patterns Used
- **Pattern**: Global mutable state (all game objects at top level)
  - Why It's Bad: Can lead to spaghetti code in larger games
  - Better Approach: Encapsulate in Game class or use ECS pattern
  - Note: For small game like Pong, this is acceptable

- **Pattern**: Magic numbers in calculations (e.g., `aiPaddle.speed * 0.7`)
  - Why It's Bad: Hard to understand intent
  - Better Approach: Named constants like `AI_SPEED_MULTIPLIER = 0.7`

## External Resources Used

### Most Helpful
- **MDN Canvas Tutorial** - https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
  - Why Helpful: Clear examples of drawing primitives
  - Key Takeaway: Understanding canvas coordinate system (0,0 at top-left)
  - Rating: ★★★★★

- **Math.atan2 for angle calculations** - MDN Documentation
  - Why Helpful: Understanding how to convert hit position to bounce angle
  - Key Takeaway: Trigonometry is essential for game dev
  - Rating: ★★★★☆

### Wasted Time On
- **Complex physics tutorials** (initially looked at)
  - Why Not Helpful: Too advanced for Pong, confused more than helped
  - Rating: ★★☆☆☆
  - Lesson: Start simple, don't over-engineer

### Gaps Found
- **Game feel / juice**: Couldn't find quick guide on adding screen shake, particles for Pong
  - How solved: Skipped for now, will learn in future games

## Next Game Prep

### Skills to Practice
- **Sound integration**: Learn Web Audio API basics
- **Particle effects**: Simple particle system for visual feedback
- **Object-oriented structure**: Move from procedural to class-based architecture

### Experiments to Try
- **Game feel enhancements**: Screen shake, hit pause, particles
- **Multiple game states**: Proper menu system with options
- **Local multiplayer**: Two human players instead of AI

### Avoid Repeating
1. **Don't skip math planning**: Sketch physics calculations on paper before coding
2. **Add bounds checking immediately**: Don't let entities go off-screen while testing
3. **Test edge cases early**: What happens at max speed? At screen edges?

## Playtest Feedback

### Self-Testing Observations
- Game feels responsive and fair
- AI difficulty is good - challenging but beatable
- Ball speed increase adds tension to longer rallies
- Visual contrast (cyan vs magenta) makes tracking easy

### Surprising Reactions
- Ball getting stuck in paddle corner was unexpected
- Speed ramping up made game exciting, not frustrating

### Polish Priorities
1. ~~**Sound effects**~~ - ✅ **COMPLETED!** Added 6 synthesized sounds
2. **Particle effects on hit** - Visual feedback for impacts
3. **Screen shake on score** - Emphasize scoring moment

## Final Reflections

### Overall Assessment
Excellent first game. Achieved all core learning objectives. Code is clean and understandable. Game is actually fun to play despite simplicity.

### Biggest Win
Understanding the game loop pattern. This is the foundation everything else builds on.

### Biggest Regret
~~Not adding sound. It would have been relatively simple and taught valuable skill.~~  
**UPDATE**: Added sound after initial completion! Best decision - learned Web Audio API and game feels 10x better.

### Would I Remake This?
- [x] No, moved on to better things
- Reason: Pong is complete and taught what it needed to teach. Time to level up to more complex mechanics.

## Technical Implementation Notes

### File Structure
```
001-pong/
├── index.html (minimal structure)
├── style.css (retro aesthetic)
├── audio.js (Web Audio API system - 190 lines)
└── game.js (all game logic ~320 lines)
```

### Code Statistics
- **Total Lines**: ~530 (with audio system)
- **Functions**: 20+
- **Game Objects**: 4 (playerPaddle, aiPaddle, ball, score)
- **States**: 3 (MENU, PLAYING, GAME_OVER)
- **Sound Effects**: 6 (paddle hit, wall bounce, score, win, lose, start)

### Performance
- Runs at 60 FPS consistently
- No memory leaks detected
- Canvas size: 800x600 (manageable for first game)

### Browser Compatibility
- Tested in: Chrome (primary development)
- Should work in: All modern browsers (uses standard Canvas API)

---

**Completion Date**: 2026-01-03  
**Next Game**: TBD (Breakout or Simple Shooter - both Tier 1)
