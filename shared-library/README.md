# Shared Library

> Reusable code components extracted from game projects. Follow the **Rule of Three**: Extract code only after using it in three different games.

---

## Purpose
This library contains code patterns and components that have proven useful across multiple projects. Each component is documented with:
- Which games inspired the extraction
- When to use it
- When NOT to use it
- Usage examples

---

## Extraction Guidelines

### Rule of Three
**DO NOT** add code here until you've used similar code in at least **3 different games**.

### Why?
- Prevents premature abstraction
- Ensures the component is actually reusable
- Avoids over-engineering

### Extraction Workflow
1. Build game with inline code
2. Complete the game
3. Note what was painful/repetitive
4. IF the pattern appears in 3+ games:
   - Extract to this library
   - Document usage from all games
   - Test extraction in original games

### Anti-Patterns to Avoid
- ❌ Building for hypothetical future needs
- ❌ Creating complex frameworks before using them
- ❌ Configuration hell (too many options)
- ❌ Monolithic systems (prefer composition)

---

## Library Structure

```
shared-library/
├── Core/                    # Generic patterns (Singleton, StateMachine, etc.)
├── Movement/                # Character controllers
├── Combat/                  # Health, damage, projectiles
├── UI/                      # Reusable UI components
├── Audio/                   # Audio management
├── Utilities/               # Helper methods, extensions
└── README.md               # This file
```

---

## Components

### Ready to Use
> Components that have been extracted and tested

*(None yet - waiting for Rule of Three to be satisfied)*

### Candidates for Extraction
> Patterns used in 1-2 games, watching for third use

*(Track patterns here as you build games)*

**Example:**
- **Pattern**: Object Pool
  - Used in: [Game 1], [Game 2]
  - Waiting for: Third game to use similar pattern
  - Notes: Both implementations pooled projectiles

---

## Component Template

When adding a new component, use this template:

```markdown
## [Component Name]

### Origin
- **First Used In**: [Game Name] - [Date]
- **Also Used In**: [Game Name], [Game Name]
- **Extracted**: [Date]

### Purpose
[What problem does this solve?]

### When to Use
- [Use case 1]
- [Use case 2]

### When NOT to Use
- [Anti-use case 1]
- [Anti-use case 2]

### Usage Example
```csharp
// Example code
```

### Dependencies
- [List any Unity packages or other dependencies]

### Known Limitations
- [Limitation 1]
- [Limitation 2]

### Version History
- **v1.0** - [Date] - Initial extraction
- **v1.1** - [Date] - [Change description]
```

---

## Contributing to the Library

### Before Adding a Component
- [ ] Have I used this pattern in 3+ different games?
- [ ] Is this actually reusable, or game-specific?
- [ ] Have I documented which games use it?
- [ ] Have I included usage examples?
- [ ] Have I tested it works when extracted?

### Quality Standards
- Code should be commented
- Include XML documentation for public methods
- Follow C# naming conventions
- Include usage examples
- Document limitations and edge cases

---

## Component Index

> Quick reference of all available components (organized by category)

### Core
*(No components yet)*

### Movement
*(No components yet)*

### Combat
*(No components yet)*

### UI
*(No components yet)*

### Audio
*(No components yet)*

### Utilities
*(No components yet)*

---

## Usage Stats

### Most Used Components
1. *(No data yet)*

### Components by Game
- **[Game 1]**: Uses [Component A], [Component B]
- **[Game 2]**: Uses [Component A]

---

## Deprecated Components

> Components that were extracted but are no longer recommended

*(None yet)*

---

*Last Updated: [Date]*
