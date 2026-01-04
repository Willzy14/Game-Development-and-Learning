# Collision Utilities

## Overview
Reusable collision detection functions for 2D games.

## When Was This Extracted?
**After Game #3 (Space Invaders)** - Used AABB collision in all three games (Pong, Breakout, Space Invaders).

## Why Extract This?
Same AABB collision code copied into every game. Violates DRY principle.

## What's Included
- **AABB (Axis-Aligned Bounding Box)** collision detection
- **Point-in-rect** collision
- **Circle collision** detection
- Helper functions for common patterns

## Usage
```javascript
// Import in your HTML
<script src="../../shared-library/collision/CollisionUtils.js"></script>

// Check rectangle collision
if (CollisionUtils.aabbCollision(rect1, rect2)) {
    // Handle collision
}

// Check point in rectangle
if (CollisionUtils.pointInRect(x, y, rect)) {
    // Point is inside
}

// Check circle collision
if (CollisionUtils.circleCollision(circle1, circle2)) {
    // Circles overlapping
}
```

## Rectangle Format
All functions expect rectangles as objects with:
```javascript
{
    x: number,      // Top-left X
    y: number,      // Top-left Y
    width: number,
    height: number
}
```

## Circle Format
Circle functions expect:
```javascript
{
    x: number,      // Center X
    y: number,      // Center Y
    radius: number
}
```

## Credits
Extracted from Pong, Breakout, and Space Invaders collision systems.
