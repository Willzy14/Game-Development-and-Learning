# localStorage High Score System - Learning Documentation

## Overview
Implemented a persistent high score system using the **localStorage API** to save player achievements between browser sessions.

## System Architecture

### HighScoreManager Class
Central manager for all persistence operations using localStorage.

```javascript
class HighScoreManager {
    constructor() {
        this.storageKey = 'snake_high_scores';  // Key for high scores
        this.statsKey = 'snake_stats';           // Key for statistics
        this.maxScores = 5;                      // Top 5 leaderboard
    }
}
```

---

## Core Concepts Learned

### 1. localStorage API Basics

**What is localStorage?**
- Browser API for storing key-value pairs persistently
- Data survives page reloads and browser restarts
- Limited to ~5-10MB per domain
- Synchronous API (blocks code execution)
- Only stores strings (need JSON for objects)

**Basic Operations:**
```javascript
// Store data
localStorage.setItem('key', 'value');

// Retrieve data
const value = localStorage.getItem('key');

// Remove data
localStorage.removeItem('key');

// Clear all data
localStorage.clear();

// Check if key exists
if (localStorage.getItem('key') !== null) { ... }
```

---

### 2. JSON Serialization

**Problem:** localStorage only stores strings  
**Solution:** Convert objects to JSON strings

```javascript
// Saving complex data
const scores = [
    { name: 'Player1', score: 1000 },
    { name: 'Player2', score: 800 }
];
localStorage.setItem('scores', JSON.stringify(scores));

// Loading complex data
const saved = localStorage.getItem('scores');
const scores = saved ? JSON.parse(saved) : []; // Fallback to empty array
```

**Key Learning:**
- `JSON.stringify()` converts objects → strings
- `JSON.parse()` converts strings → objects
- Always provide fallback for `null` (key doesn't exist)

---

### 3. Error Handling

**Why needed:**
- localStorage might be disabled (privacy mode)
- Quota might be exceeded
- JSON parsing might fail (corrupted data)

```javascript
loadScores() {
    try {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('Failed to load high scores:', e);
        return []; // Safe fallback
    }
}

saveScores(scores) {
    try {
        localStorage.setItem(this.storageKey, JSON.stringify(scores));
    } catch (e) {
        console.warn('Failed to save high scores:', e);
        // Could show user message: "Unable to save score"
    }
}
```

**Key Learning:**
- Always wrap localStorage operations in try-catch
- Provide graceful fallbacks
- Log warnings for debugging

---

## Features Implemented

### 1. Top 5 High Scores Leaderboard

**Data Structure:**
```javascript
const highScores = [
    {
        name: 'Player1',
        score: 1500,
        length: 25,
        combo: 8,
        date: '2026-01-04T12:34:56.789Z'
    },
    // ... up to 5 entries
];
```

**Adding a Score:**
```javascript
addScore(name, score, length, combo) {
    const scores = this.loadScores();
    const newEntry = {
        name: name || 'Anonymous',
        score: score,
        length: length,
        combo: combo,
        date: new Date().toISOString()
    };
    
    // Add new score
    scores.push(newEntry);
    
    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 5
    const trimmed = scores.slice(0, this.maxScores);
    this.saveScores(trimmed);
    
    // Return rank (1-5, or 0 if didn't make it)
    return trimmed.findIndex(s => s === newEntry) + 1;
}
```

**Key Learning:**
- Sort array: `array.sort((a, b) => b.score - a.score)` (descending)
- Trim array: `array.slice(0, 5)` (first 5 elements)
- Find index: `array.findIndex(item => condition)` (returns -1 if not found)
- Add 1 to convert 0-based index to 1-based rank

---

### 2. Checking if Score Qualifies

```javascript
isHighScore(score) {
    const scores = this.loadScores();
    return scores.length < this.maxScores || score > scores[scores.length - 1].score;
}
```

**Logic:**
1. If fewer than 5 scores exist → always qualifies
2. If 5 scores exist → must beat the lowest score (last element)

**Key Learning:**
- `array[array.length - 1]` gets last element
- Check array length before comparing

---

### 3. Persistent Statistics Tracking

**Data Structure:**
```javascript
const stats = {
    gamesPlayed: 0,
    totalFood: 0,
    bestScore: 0,
    bestCombo: 0,
    bestLength: 0
};
```

**Updating Stats:**
```javascript
updateStats(score, foodEaten, combo, length) {
    const stats = this.loadStats();
    
    // Increment cumulative stats
    stats.gamesPlayed++;
    stats.totalFood += foodEaten;
    
    // Track personal bests
    stats.bestScore = Math.max(stats.bestScore, score);
    stats.bestCombo = Math.max(stats.bestCombo, combo);
    stats.bestLength = Math.max(stats.bestLength, length);
    
    // Save updated stats
    this.saveStats(stats);
}
```

**Key Learning:**
- Cumulative stats: increment/add
- Best stats: use `Math.max(current, new)`
- Separate from high scores (different use case)

---

## User Interface Integration

### 1. Name Entry Screen (New High Score)

**Flow:**
1. Game ends → check if high score
2. If yes → set `enteringName = true`
3. Show name input screen
4. Wait for keyboard input
5. Save score with name → show leaderboard

**Keyboard Handling:**
```javascript
if (e.key === 'Enter') {
    // Submit name
    game.highScoreRank = highScoreManager.addScore(
        game.playerName, 
        game.score, 
        game.snake.segments.length,
        game.maxCombo
    );
    game.enteringName = false;
    playMilestoneSound();
    
} else if (e.key === 'Escape') {
    // Skip entry (use "Anonymous")
    game.playerName = 'Anonymous';
    // ... add score ...
    game.enteringName = false;
    
} else if (e.key === 'Backspace') {
    // Delete character
    game.playerName = game.playerName.slice(0, -1);
    
} else if (e.key.length === 1 && game.playerName.length < 15) {
    // Add character (alphanumeric + space only)
    if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
        game.playerName += e.key;
    }
}
```

**Key Learning:**
- Check `e.key.length === 1` to filter out special keys (Shift, Control, etc.)
- Use regex `/^[a-zA-Z0-9 ]$/` to allow only letters, numbers, spaces
- Set maximum length (15 characters)
- `string.slice(0, -1)` removes last character

**Visual Elements:**
```javascript
// Cursor blink effect
const displayName = this.playerName || '_';
ctx.fillText(displayName + (Math.floor(Date.now() / 500) % 2 ? '|' : ''), x, y);
```
- `Date.now() / 500` creates ~0.5 second intervals
- `% 2` alternates between 0 and 1
- Ternary operator shows/hides cursor

---

### 2. Enhanced Game Over Screen

**Layout:**
```
GAME OVER
Final Score: 1500
Length: 25 | Food: 22 | Best Combo: x8

⭐ Rank #3 on Leaderboard! ⭐

━━━ TOP 5 HIGH SCORES ━━━

1. Player1       1500    L:25  C:x8
2. Player2       1200    L:20  C:x5
3. You!          1000    L:18  C:x6  ← Highlighted
4. Player3        800    L:15  C:x4
5. Player4        500    L:10  C:x2

Games Played: 42 | Best: 1500 | Total Food: 850

Press SPACE to Play Again
```

**Highlighting Current Score:**
```javascript
highScores.forEach((entry, index) => {
    const isCurrentScore = this.isHighScore && index + 1 === this.highScoreRank;
    
    if (isCurrentScore) {
        // Draw highlight background
        ctx.fillStyle = 'rgba(255, 221, 0, 0.2)';
        ctx.fillRect(x, y - 20, width, 30);
    }
    
    // Different color for current score
    ctx.fillStyle = isCurrentScore ? '#ffdd00' : '#ffffff';
    ctx.fillText(entry.name, x, y);
});
```

**Key Learning:**
- Use transparent rectangles for highlight backgrounds
- Conditional styling based on current game
- Monospace font (`Courier New`) for aligned columns

---

## Best Practices Discovered

### 1. Namespace Your Keys
```javascript
// Good: Unique keys per game
const storageKey = 'snake_high_scores';
const statsKey = 'snake_stats';

// Bad: Generic keys might conflict
const storageKey = 'high_scores'; // Other games might use this!
```

### 2. Version Your Data
```javascript
const data = {
    version: 1,
    scores: [...]
};

// When loading:
if (data.version !== 1) {
    // Migrate or reset
}
```

### 3. Validate Loaded Data
```javascript
loadScores() {
    try {
        const saved = localStorage.getItem(this.storageKey);
        const scores = saved ? JSON.parse(saved) : [];
        
        // Validate structure
        if (!Array.isArray(scores)) {
            console.warn('Invalid scores data, resetting');
            return [];
        }
        
        // Validate each entry
        return scores.filter(s => 
            s.name && 
            typeof s.score === 'number' && 
            s.score >= 0
        );
    } catch (e) {
        return [];
    }
}
```

### 4. Provide Clear Feedback
- ✅ Show "New High Score!" immediately
- ✅ Highlight your score in the leaderboard
- ✅ Display rank achieved
- ✅ Show cumulative stats for motivation

### 5. Test Edge Cases
```javascript
// Empty leaderboard
if (highScores.length === 0) {
    ctx.fillText('No high scores yet. Be the first!', x, y);
}

// Score didn't qualify
if (!this.isHighScore) {
    // Just show regular game over
}

// localStorage disabled
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    // Show message: "High scores disabled (private mode?)"
}
```

---

## localStorage Limitations & Alternatives

### Limitations
1. **Size:** ~5-10 MB per domain (browser-dependent)
2. **Synchronous:** Blocks code execution (slow for large data)
3. **Strings only:** Requires JSON serialization
4. **No encryption:** Data visible in browser dev tools
5. **Domain-specific:** Can't share across domains
6. **User can clear:** Not guaranteed to persist

### When to Use
- ✅ Small data (< 1 MB)
- ✅ Simple key-value storage
- ✅ Client-side only (no server)
- ✅ Non-sensitive data
- ✅ Settings, preferences, high scores

### Alternatives

**IndexedDB** (for larger/complex data):
```javascript
// More complex API, supports larger storage
const request = indexedDB.open('GameDB', 1);
// ... transaction-based operations ...
```

**Cookies** (for server communication):
```javascript
document.cookie = 'score=1000; max-age=31536000';
```

**SessionStorage** (for temporary data):
```javascript
sessionStorage.setItem('tempData', 'value');
// Cleared when browser tab closes
```

**Server-side storage** (for cross-device/security):
```javascript
fetch('/api/save-score', {
    method: 'POST',
    body: JSON.stringify({ name, score })
});
```

---

## Testing localStorage

### Manual Testing
```javascript
// In browser console:
localStorage.setItem('snake_high_scores', JSON.stringify([...]));
localStorage.getItem('snake_high_scores');
localStorage.removeItem('snake_high_scores');
localStorage.clear(); // Clear all
```

### DevTools
1. Open DevTools (F12)
2. Application tab (Chrome) or Storage tab (Firefox)
3. localStorage section
4. View/edit/delete entries manually

### Debugging Helper
```javascript
// Add to HighScoreManager class:
clearAll() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.statsKey);
    console.log('All data cleared!');
}

// In console:
highScoreManager.clearAll();
```

---

## Integration with Game Logic

### Tracking Max Combo
```javascript
// In food collection code:
this.comboCount++;
this.maxCombo = Math.max(this.maxCombo, this.comboCount);
```

### Checking for High Score (Once)
```javascript
if (!this.highScoreChecked) {
    const foodEaten = this.snake.segments.length - INITIAL_LENGTH;
    highScoreManager.updateStats(this.score, foodEaten, this.maxCombo, this.snake.segments.length);
    
    this.isHighScore = highScoreManager.isHighScore(this.score);
    this.highScoreChecked = true;
    
    if (this.isHighScore) {
        this.enteringName = true;
    }
}
```

### Reset for New Game
```javascript
reset() {
    // ... reset game state ...
    
    // Reset high score tracking
    this.isHighScore = false;
    this.highScoreRank = 0;
    this.highScoreChecked = false;
    this.playerName = '';
    this.enteringName = false;
    this.maxCombo = 0;
}
```

---

## What We Learned

### Web APIs
- ✅ localStorage basic operations
- ✅ JSON serialization/deserialization
- ✅ Error handling with try-catch
- ✅ Browser compatibility considerations

### Data Management
- ✅ Persistent storage strategies
- ✅ Data validation and sanitization
- ✅ Array sorting and filtering
- ✅ Statistical tracking (cumulative + best)

### User Experience
- ✅ Name entry interface
- ✅ Keyboard input handling
- ✅ Visual feedback (highlighting, colors)
- ✅ Leaderboard display
- ✅ Achievement celebration

### Best Practices
- ✅ Namespace storage keys
- ✅ Always provide fallbacks
- ✅ Validate loaded data
- ✅ Handle edge cases gracefully
- ✅ Test with DevTools

---

## Future Enhancements

### Advanced Features to Add
1. **Multiple leaderboards** - Daily, Weekly, All-Time
2. **Data export/import** - Share scores between devices
3. **Score verification** - Prevent cheating with checksums
4. **Replay system** - Store game moves, replay high scores
5. **Achievement system** - Track badges/milestones
6. **Social features** - Compare with friends
7. **Cloud sync** - Backend API for cross-device scores

### Technical Improvements
1. **Compression** - LZ-string library for more storage
2. **Encryption** - CryptoJS for sensitive data
3. **Versioning** - Schema migration system
4. **Backup** - Periodic exports to file
5. **Quota management** - Check available space

---

## Result

**Persistent high score system that:**
- ✅ Survives browser restarts
- ✅ Tracks top 5 scores with player names
- ✅ Shows comprehensive statistics
- ✅ Provides name entry interface
- ✅ Highlights current game's achievement
- ✅ Handles errors gracefully
- ✅ Zero server requirements
- ✅ Works offline

**Lines of code:** ~200 (manager + UI integration)  
**External dependencies:** 0 (pure Web APIs)  
**Storage used:** < 1 KB per game  

---

**Status:** ✅ Complete and production-ready  
**Next Level:** IndexedDB for more complex data, server API for multiplayer leaderboards
