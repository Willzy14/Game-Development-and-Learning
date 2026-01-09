# Skills Progression Tracker

> Track all skills acquired throughout the learning journey. Check off skills as they're learned and reference the game where they were first implemented.

---

## Quick Reference: Reusable Code Locations

| System | Best Reference | Path |
|--------|----------------|------|
| **Audio (basic)** | Shared Library | `shared-library/audio/AudioSystem.js` |
| **Audio (procedural music)** | Asteroids v2 | `games/tier-2/.../006-asteroids-v2/audio.js` |
| **Audio (ethereal/ambient)** | Platformer | `games/tier-2/.../007-platformer/audio.js` |
| **Collision (AABB)** | Shared Library | `shared-library/collision/CollisionUtils.js` |
| **High Score (localStorage)** | Space Invaders | `games/tier-2/.../003-space-invaders/` |
| **Particles** | Snake | `games/tier-2/.../004-snake/` |
| **Parallax Scrolling** | Flappy Bird | `games/tier-2/.../005-flappy-bird/` |
| **Theme Swap** | Flappy Bird v4 | `games/tier-2/.../005-flappy-bird/theme.js` |
| **Modular Architecture** | Asteroids v2 | `games/tier-2/.../006-asteroids-v2/` |
| **Combo System** | Asteroids v2 | `games/tier-2/.../006-asteroids-v2/game.js` |
| **Lives/Respawn** | Breakout, Asteroids v2 | Multiple |
| **Platformer Physics** | Platformer | `games/tier-2/.../007-platformer/game.js` |
| **Variable Height Jump** | Platformer | `games/tier-2/.../007-platformer/game.js` |
| **Horizontal Scrolling Camera** | Platformer | `games/tier-2/.../007-platformer/game.js` |

---

## How to Use This
- **Check off** skills when you've successfully implemented them
- **Note the game** where you first used the skill
- **Update confidence** level as you use skills in multiple projects (1=shaky, 5=mastery)
- **Revisit regularly** to identify gaps and plan focus areas

---

## Programming Fundamentals

### Core Programming
- [x] Variables and data types *(Learned in: Pong)* - Confidence: 5/5
- [x] Control flow (if/else, loops) *(Learned in: Pong)* - Confidence: 5/5
- [x] Functions and methods *(Learned in: Pong)* - Confidence: 5/5
- [x] Arrays and lists *(Learned in: Breakout - brick array)* - Confidence: 4/5
- [x] Dictionaries/hash maps *(Learned in: Pong - keys object)* - Confidence: 4/5
- [x] Classes and objects *(Learned in: Breakout - ES6 classes)* - Confidence: 4/5
- [ ] Inheritance *(Learned in: [Game])*
- [ ] Interfaces *(Learned in: [Game])*
- [ ] Polymorphism *(Learned in: [Game])*
- [x] Enums (enum-like objects) *(Learned in: Breakout - GameState)* - Confidence: 4/5
- [ ] Structs vs Classes *(Learned in: [Game])*

### Advanced Programming
- [ ] Delegates and events *(Learned in: [Game])*
- [ ] Coroutines *(Learned in: [Game])*
- [ ] LINQ queries *(Learned in: [Game])*
- [ ] Generics *(Learned in: [Game])*
- [ ] Lambda expressions *(Learned in: [Game])*
- [ ] Null coalescing *(Learned in: [Game])*
- [ ] Extension methods *(Learned in: [Game])*
- [ ] Async/await *(Learned in: [Game])*

---

## Unity Fundamentals

### Core Unity Concepts
- [ ] GameObject/Component model *(Learned in: [Game])*
- [ ] Transform (position, rotation, scale) *(Learned in: [Game])*
- [ ] Prefabs *(Learned in: [Game])*
- [ ] Scenes and scene management *(Learned in: [Game])*
- [ ] Tags and layers *(Learned in: [Game])*
- [ ] Instantiate and Destroy *(Learned in: [Game])*
- [ ] Find and GetComponent *(Learned in: [Game])*
- [ ] MonoBehaviour lifecycle *(Learned in: [Game])*
- [ ] Awake vs Start *(Learned in: [Game])*
- [ ] Update vs FixedUpdate vs LateUpdate *(Learned in: [Game])*

### Input
- [ ] Input.GetKey/GetButton (old system) *(Learned in: [Game])*
- [ ] New Input System *(Learned in: [Game])*
- [ ] Mouse position and clicks *(Learned in: [Game])*
- [ ] Touch input *(Learned in: [Game])*
- [ ] Gamepad support *(Learned in: [Game])*

### Physics (2D)
- [ ] Rigidbody2D *(Learned in: [Game])*
- [ ] Collider2D types *(Learned in: [Game])*
- [ ] Collision vs Trigger *(Learned in: [Game])*
- [ ] OnCollisionEnter/Stay/Exit *(Learned in: [Game])*
- [ ] OnTriggerEnter/Stay/Exit *(Learned in: [Game])*
- [ ] Physics layers and collision matrix *(Learned in: [Game])*
- [ ] Raycasting *(Learned in: [Game])*
- [ ] Physics materials *(Learned in: [Game])*
- [ ] Velocity vs AddForce *(Learned in: [Game])*

### Physics (3D)
- [ ] Rigidbody *(Learned in: [Game])*
- [ ] Collider types (Box, Sphere, Capsule) *(Learned in: [Game])*
- [ ] Mesh Collider *(Learned in: [Game])*
- [ ] Character Controller *(Learned in: [Game])*
- [ ] Raycasting 3D *(Learned in: [Game])*
- [ ] Physics materials 3D *(Learned in: [Game])*

### Animation
- [ ] Animator component *(Learned in: [Game])*
- [ ] Animation clips *(Learned in: [Game])*
- [ ] Animator parameters *(Learned in: [Game])*
- [ ] State machines *(Learned in: [Game])*
- [ ] Blend trees *(Learned in: [Game])*
- [ ] Animation events *(Learned in: [Game])*
- [ ] IK (Inverse Kinematics) *(Learned in: [Game])*
- [ ] Timeline *(Learned in: [Game])*

### UI
- [ ] Canvas (Screen Space, World Space) *(Learned in: [Game])*
- [ ] Rect Transform *(Learned in: [Game])*
- [ ] Text / TextMeshPro *(Learned in: [Game])*
- [ ] Image and Sprite *(Learned in: [Game])*
- [ ] Button *(Learned in: [Game])*
- [ ] Slider *(Learned in: [Game])*
- [ ] Layout groups *(Learned in: [Game])*
- [ ] Event system *(Learned in: [Game])*
- [ ] UI animations *(Learned in: [Game])*

### Audio
- [x] Audio Source *(Learned in: Pong - Web Audio API)*
- [x] Audio Listener *(Learned in: Pong - destination node)*
- [x] Audio Clips *(Learned in: Pong - programmatic synthesis)*
- [ ] 2D vs 3D audio *(Learned in: [Game])*
- [ ] Audio Mixer *(Learned in: [Game])*
- [x] Volume control *(Learned in: Pong - gain nodes)*
- [x] Chord progression composition *(Learned in: Time-Slice Runner - triads, bass, melody, rhythm)* - Confidence: 4/5
- [x] Musical structure (bass + chords + melody + rhythm) *(Learned in: Time-Slice Runner)* - Confidence: 4/5

### Advanced Unity
- [ ] ScriptableObjects *(Learned in: [Game])*
- [ ] Addressables *(Learned in: [Game])*
- [ ] Asset bundles *(Learned in: [Game])*
- [ ] Cinemachine *(Learned in: [Game])*
- [ ] Post-processing *(Learned in: [Game])*
- [ ] Shader Graph *(Learned in: [Game])*
- [ ] Particle systems *(Learned in: [Game])*
- [ ] NavMesh and pathfinding *(Learned in: [Game])*
- [ ] Tilemap *(Learned in: [Game])*

---

## Game Programming Patterns

### Design Patterns
- [ ] Singleton *(Learned in: [Game])* - Confidence: [1-5]
- [x] Object Pool (bullet pooling) *(Learned in: Space Invaders)* - Confidence: 3/5
- [x] State Machine *(Learned in: Breakout)* - Confidence: 5/5
- [ ] Observer (Event System) *(Learned in: [Game])* - Confidence: [1-5]
- [ ] Command *(Learned in: [Game])* - Confidence: [1-5]
- [ ] Factory *(Learned in: [Game])* - Confidence: [1-5]
- [ ] Service Locator *(Learned in: [Game])* - Confidence: [1-5]
- [x] MVC-like separation (getState() pattern) *(Learned in: Asteroids v2)* - Confidence: 4/5

### Game-Specific Patterns
- [x] Game loop architecture *(Learned in: Pong)* - Confidence: 5/5
- [x] Component pattern (via OOP classes) *(Learned in: Breakout)* - Confidence: 4/5
- [x] Update method pattern *(Learned in: Pong)* - Confidence: 5/5
- [x] Modular file architecture (game/theme/audio split) *(Learned in: Asteroids v2)* - Confidence: 4/5
- [ ] Dirty flag *(Learned in: [Game])*
- [ ] Double buffer *(Learned in: [Game])*
- [ ] Flyweight (data sharing) *(Learned in: [Game])*

---

## Game Mechanics

### Movement
- [x] Basic 2D movement (4-direction) *(Learned in: Pong - up/down)* - Confidence: 5/5
- [x] Horizontal movement *(Learned in: Breakout - paddle)* - Confidence: 5/5
- [ ] 8-directional movement *(Learned in: [Game])*
- [x] Smooth acceleration/deceleration *(Learned in: Asteroids v2 - thrust + drag)* - Confidence: 4/5
- [x] Rotation + thrust movement *(Learned in: Asteroids v2)* - Confidence: 4/5
- [x] Jump mechanics *(Learned in: Platformer - variable height jump)* - Confidence: 4/5
- [x] Double jump *(Learned in: Platformer - Lantern Spirit)* - Confidence: 4/5
- [ ] Wall jump *(Learned in: [Game])*
- [ ] Dash/dodge *(Learned in: [Game])*
- [x] Ground detection *(Learned in: Platformer - platform collision)* - Confidence: 4/5
- [x] Coyote time *(Learned in: Platformer - 6 frame buffer)* - Confidence: 4/5
- [x] Jump buffering *(Learned in: Platformer - 6 frame buffer)* - Confidence: 4/5
- [x] Air control (horizontal movement during jump) *(Learned in: Time-Slice Runner)* - Confidence: 4/5
- [x] Time manipulation mechanic *(Learned in: Time-Slice Runner - gameSpeed multiplier)* - Confidence: 4/5
- [ ] Moving platforms *(Learned in: [Game])*
- [ ] 3D character controller *(Learned in: [Game])*

### Combat
- [x] Health system (lives) *(Learned in: Breakout, Space Invaders)* - Confidence: 5/5
- [ ] Damage system *(Learned in: [Game])*
- [x] Projectiles *(Learned in: Space Invaders)* - Confidence: 4/5
- [x] Charge shots (hold to charge) *(Learned in: Asteroids v2)* - Confidence: 4/5
- [ ] Melee combat *(Learned in: [Game])*
- [x] Hit detection (bullet collisions) *(Learned in: Space Invaders)* - Confidence: 4/5
- [ ] Hitboxes and hurtboxes *(Learned in: [Game])*
- [x] Combo system *(Learned in: Asteroids v2)* - Confidence: 4/5
- [ ] Knockback *(Learned in: [Game])*
- [x] Invincibility frames *(Learned in: Asteroids v2 - respawn invulnerability)* - Confidence: 4/5
- [ ] Boss patterns *(Learned in: [Game])*

### Progression Systems
- [x] Score tracking *(Learned in: Pong)* - Confidence: 5/5
- [x] Lives system *(Learned in: Breakout)* - Confidence: 5/5
- [x] Level progression *(Learned in: Breakout)* - Confidence: 4/5
- [ ] Experience/leveling *(Learned in: [Game])*
- [ ] Skill trees *(Learned in: [Game])*
- [ ] Inventory system *(Learned in: [Game])*
- [ ] Equipment system *(Learned in: [Game])*
- [ ] Upgrade system *(Learned in: [Game])*
- [ ] Ability unlocks *(Learned in: [Game])*
- [ ] Stat system *(Learned in: [Game])*

### AI
- [ ] Chase player *(Learned in: [Game])*
- [ ] Patrol behavior *(Learned in: [Game])*
- [x] State-based AI *(Learned in: Pong - basic paddle tracking)* - Confidence: 3/5
- [x] Formation/group movement *(Learned in: Space Invaders)* - Confidence: 4/5
- [x] Random action selection *(Learned in: Space Invaders - enemy shooting)* - Confidence: 4/5
- [ ] Pathfinding *(Learned in: [Game])*
- [ ] Line of sight detection *(Learned in: [Game])*
- [ ] Behavior trees *(Learned in: [Game])*
- [ ] Flocking/swarm *(Learned in: [Game])*

---

## Procedural Generation

- [x] Random number generation *(Learned in: Pong - ball direction)* - Confidence: 5/5
- [x] Seeded random (position-based) *(Learned in: Flappy Bird V4 - pyramids, palms)* - Confidence: 4/5
- [ ] Perlin noise *(Learned in: [Game])*
- [ ] Weighted random selection *(Learned in: [Game])*
- [x] Procedural level layout *(Learned in: Flappy Bird - infinite obstacles)* - Confidence: 5/5
- [ ] Wave function collapse *(Learned in: [Game])*
- [ ] BSP (Binary Space Partitioning) *(Learned in: [Game])*
- [ ] Cellular automata *(Learned in: [Game])*
- [x] Procedural content (backgrounds, terrain) *(Learned in: Flappy Bird V4 Egypt - pyramids, dunes, palms)* - Confidence: 4/5
- [x] Endless platform generation *(Learned in: Time-Slice Runner - difficulty ramping, variation)* - Confidence: 4/5

---

## Game Systems

### Save/Load
- [x] LocalStorage (high scores) *(Learned in: Space Invaders)* - Confidence: 4/5
- [ ] PlayerPrefs *(Learned in: [Game])*
- [ ] JSON serialization *(Learned in: [Game])*
- [ ] Binary serialization *(Learned in: [Game])*
- [ ] Save file management *(Learned in: [Game])*
- [ ] Cloud saves *(Learned in: [Game])*

### UI/UX
- [ ] Main menu *(Learned in: [Game])*
- [ ] Pause menu *(Learned in: [Game])*
- [ ] Settings menu *(Learned in: [Game])*
- [ ] HUD elements *(Learned in: [Game])*
- [ ] Health bars *(Learned in: [Game])*
- [ ] Dialogue system *(Learned in: [Game])*
- [ ] Quest tracking *(Learned in: [Game])*
- [ ] Tooltip system *(Learned in: [Game])*
- [ ] Screen transitions *(Learned in: [Game])*

### Game Feel/Polish
- [x] Screen shake *(Learned in: Space Invaders V2)* - Confidence: 4/5
- [ ] Hit pause/freeze frames *(Learned in: [Game])*
- [x] Particle effects *(Learned in: Space Invaders, Snake, Flappy Bird)* - Confidence: 5/5
- [x] Sound effects *(Learned in: Pong, Breakout)* - Confidence: 5/5
- [x] Visual feedback (color changes, flashes) *(Learned in: Breakout - brick colors)* - Confidence: 4/5
- [ ] Animation juicing *(Learned in: [Game])*
- [ ] Camera effects *(Learned in: [Game])*
- [x] Parallax scrolling *(Learned in: Flappy Bird V2-V4)* - Confidence: 5/5
- [x] Infinite scrolling (no seam) *(Learned in: Flappy Bird V3)* - Confidence: 5/5

---

## Theme & Art Design (NEW SECTION)

### Visual Theming
- [x] Color palette abstraction *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 5/5
- [x] Theme swap architecture *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 5/5
- [x] Character design through shape language *(Learned in: Flappy Bird V4 - scarab beetle)* - Confidence: 4/5
- [x] 80% Rule (strong theme signals) *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 4/5
- [x] Multi-layer background composition *(Learned in: Flappy Bird V2-V4)* - Confidence: 5/5
- [x] Painterly rendering (soft edges, gradients) *(Learned in: Asteroids v2)* - Confidence: 4/5
- [x] Warm/cool color harmony *(Learned in: Asteroids v2 - Forest Temple style)* - Confidence: 4/5
- [x] Radial gradient effects *(Learned in: Asteroids v2 - nebula, gravity wells)* - Confidence: 4/5
- [x] Dynamic lighting/glow effects *(Learned in: Platformer - lantern glow)* - Confidence: 4/5
- [x] Atmospheric particles (fireflies, motes, mist) *(Learned in: Platformer)* - Confidence: 4/5
- [x] Cached background layers for performance *(Learned in: Platformer - star/mountain caching)* - Confidence: 4/5

### Audio Theming
- [x] Musical scales for cultural theming *(Learned in: Flappy Bird V4 Egypt - Phrygian Dominant)* - Confidence: 4/5
- [x] Instrument selection for theme (oud, ney) *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 3/5
- [x] Ambient sound theming *(Learned in: Flappy Bird V4 Egypt - desert wind)* - Confidence: 3/5
- [x] Ethereal/mystical audio design *(Learned in: Platformer - drone + pads + arpeggio)* - Confidence: 4/5

---

## Development Process (NEW SECTION)

### Large Task Management
- [x] Chunked file creation (8-part pattern) *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 5/5
- [x] Logical boundary planning *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 4/5
- [x] Sequential dependency ordering *(Learned in: Flappy Bird V4 Egypt)* - Confidence: 4/5

---

## Performance & Optimization

- [ ] Unity Profiler usage *(Learned in: [Game])*
- [ ] Object pooling *(Learned in: [Game])*
- [ ] Draw call batching *(Learned in: [Game])*
- [ ] LOD (Level of Detail) *(Learned in: [Game])*
- [ ] Occlusion culling *(Learned in: [Game])*
- [ ] Texture atlasing *(Learned in: [Game])*
- [ ] Memory profiling *(Learned in: [Game])*
- [ ] Garbage collection management *(Learned in: [Game])*

---

## Production Skills

### Version Control
- [ ] Git basics (commit, push, pull) *(Learned in: [Game])*
- [ ] Branching strategies *(Learned in: [Game])*
- [ ] Merge conflicts *(Learned in: [Game])*
- [ ] .gitignore for Unity *(Learned in: [Game])*
- [ ] Git LFS for assets *(Learned in: [Game])*

### Build & Deploy
- [ ] Build settings *(Learned in: [Game])*
- [ ] Platform-specific builds *(Learned in: [Game])*
- [ ] Build automation *(Learned in: [Game])*
- [ ] WebGL builds *(Learned in: [Game])*
- [ ] Mobile builds (Android/iOS) *(Learned in: [Game])*

### Testing & QA
- [ ] Unity Test Framework *(Learned in: [Game])*
- [ ] Playtest planning *(Learned in: [Game])*
- [ ] Bug tracking *(Learned in: [Game])*
- [ ] Balance testing *(Learned in: [Game])*

---

## Soft Skills

### Game Design
- [ ] Core gameplay loop design *(Learned in: [Game])*
- [ ] Difficulty balancing *(Learned in: [Game])*
- [ ] Level design principles *(Learned in: [Game])*
- [ ] Player feedback loops *(Learned in: [Game])*
- [ ] Pacing and flow *(Learned in: [Game])*

### Process
- [ ] Scope management *(Learned in: [Game])*
- [ ] Feature prioritization *(Learned in: [Game])*
- [ ] Rapid prototyping *(Learned in: [Game])*
- [ ] Iteration based on feedback *(Learned in: [Game])*
- [ ] Knowing when to cut features *(Learned in: [Game])*

---

## Skill Heatmap (Updated Monthly)

### Confident Skills (Can implement without reference)
- Game loop architecture, state machines, AABB collision
- Canvas 2D rendering, gradients, particles
- Web Audio synthesis, procedural music
- localStorage persistence, settings systems
- Parallax scrolling, infinite scrolling
- Theme swap architecture, color abstraction
- Large task breakdown (chunked creation)
- Modular architecture (game/theme/audio split)
- Rotation + thrust movement, gravity wells

### Comfortable Skills (Can implement with minor reference)
- Procedural generation (position-based seeding)
- Musical scales for theming (Phrygian Dominant, etc.)
- Character design through shape language
- Touch controls, responsive design
- Object pooling, projectile systems
- Painterly rendering (soft edges, warm/cool harmony)
- Combo systems, charge shots

### Learning Skills (Need significant reference/tutorial)
- Screen shake timing/feel
- Advanced physics (gravity curves - learned in Asteroids v2)
- Shield/damage systems
- Progressive difficulty scaling

### Gap Skills (Not yet attempted)
- 3D anything (Unity-specific)
- Pathfinding, NavMesh
- Behavior trees for AI
- Networking/multiplayer
- Save file serialization (beyond localStorage)

---

*Last Updated: January 9, 2026*
*Latest Addition: Platformer Physics (variable jump, double jump, coyote time), Dynamic Lighting, Atmospheric Particles (Platformer "Lantern Spirit")*
