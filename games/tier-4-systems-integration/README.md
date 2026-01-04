# Tier 4: Systems Integration

## Learning Objectives
Build games with multiple interconnected systems:
- Pathfinding and navigation
- Resource management
- Upgrade/progression systems
- Save/load functionality
- Procedural level generation (advanced)
- Inventory systems
- Multiple scenes and transitions

## Target Games (2-3 projects)

### Suggested Projects
1. **Tower Defense**
   - Pathfinding, tower placement, wave management, currency/upgrades
   - Skills: NavMesh, ScriptableObjects for towers, economy balancing
   
2. **Roguelike / Dungeon Crawler**
   - Procedural dungeons, inventory, stats, permadeath
   - Skills: Level generation algorithms, item systems, data persistence

3. **Strategy Game** (Simple, like Advance Wars)
   - Turn-based movement, unit types, fog of war, win conditions
   - Skills: Grid systems, turn management, AI decision making

## Technology Recommendation
- Unity with full C# architecture patterns
- Learn about Unity's new Input System
- Explore Unity's Tilemap system for 2D
- Start using Unity's Profiler

## Success Criteria
- [ ] Multiple systems interact without breaking
- [ ] Data persists between sessions
- [ ] Procedural content is balanced and interesting
- [ ] UI clearly communicates system states
- [ ] Performance is acceptable (60 FPS target)

## Common Pitfalls at This Tier
- Over-engineering with premature abstraction
- Not profiling performance until it's too late
- Brittle save/load systems that break easily
- Unclear UI for complex systems
- Scope explosion (trying to build "everything")

## Skills That Should "Click"
- How to structure interconnected systems
- When to use events vs. direct references
- Data-driven design with ScriptableObjects
- Performance considerations and profiling

## Code Patterns to Learn
- Command Pattern (for undo/redo)
- Observer Pattern (for event systems)
- Factory Pattern (for object creation)
- Singleton Pattern (use sparingly!)

## Architecture Focus
This tier is about learning when and how to abstract:
- Extract shared code AFTER third use (Rule of Three)
- Document why you chose certain patterns
- Refactor ruthlessly, but with purpose

## Completed Games
*(Games will be linked here as they're completed)*
