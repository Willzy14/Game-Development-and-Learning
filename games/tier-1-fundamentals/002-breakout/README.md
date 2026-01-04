# Breakout

## Status: 🚧 In Progress

## Overview
**Tier**: 1 - Fundamentals  
**Target Skills**: 
- Grid/array management (brick layout)
- Multiple collision types (paddle, bricks, walls)
- Object lifecycle (creating/destroying objects)
- Level completion logic
- Score accumulation system
- Applying audio knowledge from Pong

**Start Date**: 2026-01-03  
**End Date**: TBD

## Game Description
Classic Breakout/Brick Breaker game. Player controls paddle at bottom, ball bounces and destroys colored bricks. Clear all bricks to complete level. Three lives, increasing difficulty.

## Core Mechanics
1. Paddle movement (left/right with arrow keys)
2. Ball physics (bouncing off paddle, walls, bricks)
3. Brick grid creation
4. Brick destruction on collision
5. Score system (different brick colors = different points)
6. Lives system (lose life when ball falls off bottom)
7. Level progression (clear all bricks)
8. Win/lose conditions

## Technical Requirements
- **Engine**: Vanilla JavaScript + HTML5 Canvas
- **Language**: JavaScript (ES6+ with classes)
- **Target Platform**: Web (Browser)
- **Audio**: Web Audio API (reuse from Pong)

## Learning Objectives
- [ ] Manage 2D arrays (brick grid)
- [ ] Handle multiple collision types
- [ ] Implement object destruction
- [ ] Track game stats (score, lives, level)
- [ ] Create level progression system
- [ ] Apply OOP patterns (classes for entities)
- [ ] Reuse audio system from previous game

## Development Plan

### Phase 1: Foundation (Apply Pong Learnings)
- [x] Create project structure
- [ ] Set up canvas and game loop
- [ ] Implement paddle movement
- [ ] Add ball physics
- [ ] Copy and adapt audio system

### Phase 2: Brick System (New Concept)
- [ ] Create brick grid data structure
- [ ] Render bricks with colors
- [ ] Implement ball-brick collision
- [ ] Handle brick destruction
- [ ] Track remaining bricks

### Phase 3: Game Systems
- [ ] Lives system (3 lives)
- [ ] Score accumulation
- [ ] Level completion check
- [ ] Next level generation
- [ ] Game over conditions

### Phase 4: Polish
- [ ] Sound effects for all events
- [ ] Visual feedback (brick breaking)
- [ ] UI (score, lives, level display)
- [ ] Start screen and game over screen
- [ ] Ball speed progression

## Technical Notes
*(Implementation notes will be added during development)*

### New Concepts vs Pong
- **Grid Management**: 2D array for brick positions
- **Object Destruction**: Removing bricks from play
- **Multiple Collision Types**: Paddle (angle change), bricks (destruction), walls (bounce)
- **OOP Structure**: Using classes instead of object literals
- **Stat Tracking**: Score, lives, level counter

## Known Issues
*(Issues will be tracked here)*

## Playtest Notes
*(Feedback from testing will be recorded here)*

## Links
- **Retrospective**: [To be created after completion]
- **Source Code**: `games/tier-1-fundamentals/002-breakout/`
- **Play Build**: `games/tier-1-fundamentals/002-breakout/index.html`
- **Previous Game**: [Pong](../001-pong/README.md)
