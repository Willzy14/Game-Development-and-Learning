# Space Invaders - Tier 1 Game 3

## Objective
Learn shooting mechanics, enemy AI patterns, wave management, and projectile systems.

## New Concepts to Practice
- Projectile/bullet systems
- Enemy grid formation and movement
- Enemy AI (shooting patterns)
- Wave progression
- Player health/lives
- Game over conditions
- High score tracking

## Building On Previous Games
- OOP class structure (from Breakout)
- State machine (from Breakout)
- Collision detection (from Pong & Breakout)
- **Audio system (third use → extract to shared library)**

## Technical Goals
1. Implement bullet pools for performance
2. Create enemy formation and synchronized movement
3. Add enemy shooting with randomization
4. Implement wave difficulty progression
5. Extract audio system to shared library (Rule of Three)

## Game Mechanics
- Player ship moves left/right
- Player shoots upward
- Enemies move in formation (left-right, then down)
- Enemies shoot randomly at player
- Destroy all enemies to complete wave
- Waves increase in difficulty
- Player has 3 lives
- Game over when player loses all lives

## Estimated Time
4-5 hours (includes shared library extraction)
