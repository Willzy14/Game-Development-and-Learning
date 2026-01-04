# Failure Archive

> **Purpose**: Document all significant failures, mistakes, and dead ends to extract learning and prevent repetition. This is not a shame log—it's a scientific record of what doesn't work and why.

---

## How to Use This Document
1. **Add entries immediately** when you encounter a significant failure
2. **Be specific** about context, what you tried, and why it failed
3. **Extract the lesson** - what would you do differently?
4. **Date everything** for tracking patterns over time
5. **Review monthly** to identify recurring failure patterns

---

## Build Errors & Crashes

### [YYYY-MM-DD] - NullReferenceException Template
- **Game**: [Which game project]
- **Context**: [What you were implementing]
- **Error Message**: 
  ```
  [Full error message with stack trace]
  ```
- **Cause**: [Root cause once identified]
- **Fix**: [What solved it]
- **Prevention**: [How to avoid this pattern in future]
- **Time Lost**: [X hours]

---

## Design Failures

### [YYYY-MM-DD] - Mechanic That Felt Terrible Template
- **Game**: [Which game project]
- **Intent**: [What you wanted to create]
- **Reality**: [What actually happened]
- **Player Feedback**: [If playtested]
- **Analysis**: [Why it failed - bad design, poor implementation, etc.]
- **Solutions Attempted**: 
  1. [First attempt]
  2. [Second attempt]
- **Final Resolution**: [What worked or reason for abandonment]
- **Time Lost**: [X hours]
- **Lesson**: [Key takeaway]

---

## Architecture Mistakes

### [YYYY-MM-DD] - Over-Engineering Template
- **Game**: [Which game project]
- **What You Built**: [The overly complex system]
- **Why You Built It**: [Your reasoning at the time]
- **Why It Was Wrong**: [Actual problems it caused]
- **Simpler Alternative**: [What you should have done]
- **Refactor Cost**: [Time spent fixing]
- **Lesson**: [When to recognize over-engineering]

---

## Abandoned Features

### [YYYY-MM-DD] - Feature That Couldn't Work Template
- **Game**: [Which game project]
- **Feature**: [What you tried to implement]
- **Why You Wanted It**: [Design goal]
- **Technical Blocker**: [What made it impossible/impractical]
- **Time Invested Before Abandoning**: [X hours]
- **Should Have Stopped When**: [Warning signs you missed]
- **Alternative Implemented**: [What you did instead]
- **Lesson**: [How to recognize dead ends earlier]

---

## Performance Disasters

### [YYYY-MM-DD] - Performance Issue Template
- **Game**: [Which game project]
- **Symptom**: [FPS drops, memory leaks, etc.]
- **Cause**: [What code/asset caused the issue]
- **Profiler Data**: [Key findings from profiling]
- **Fix**: [How you optimized it]
- **Prevention**: [How to avoid this in future projects]
- **Lesson**: [Performance principle learned]

---

## Communication/Process Failures

### [2026-01-04] - Code in Conversation ≠ Code on Disk ⚠️ **CRITICAL**
- **Game**: Snake (004)
- **What Went Wrong**: Designed and wrote 900+ lines of procedural art code in conversation but never executed file write operations. User reported "no changes visible" because code was never written to disk.
- **Impact**: 
  - User confusion (expected to see planets, spaceships, styled snake)
  - 30 minutes debugging wrong issues (cache, server, browser)
  - Delayed feature delivery
  - Loss of trust in process
- **Root Cause**: 
  - Assumed showing code equals implementing it
  - Forgot fundamental principle: files must be manipulated with tools
  - Got excited about design and skipped execution
- **Process Change**: 
  1. After designing any code solution, immediately use file manipulation tools
  2. Never end turn showing code without file write operations
  3. Always verify changes with file reads or error checks after writing
  4. Treat file writes as mandatory, not optional
- **Warning Signs**:
  - User says "not seeing changes" → check if files were actually modified
  - Providing long code examples → ensure they're being written to disk
  - Multiple replace operations needed → use multi_replace_string_in_file
- **Time Lost**: 30 minutes
- **Severity**: CRITICAL - This is a fundamental process violation
- **Prevention Checklist**:
  - [ ] Code designed?
  - [ ] File manipulation tool invoked?
  - [ ] Changes verified (errors checked or file re-read)?
  - [ ] User can see results?

---

## Learning Failures

### [YYYY-MM-DD] - Tutorial/Resource That Wasted Time Template
- **Resource**: [Name and link]
- **Why You Used It**: [Problem you were trying to solve]
- **Time Invested**: [X hours]
- **Why It Failed**: [Outdated, wrong approach, too complex, etc.]
- **What You Needed Instead**: [The actual solution]
- **Lesson**: [How to evaluate resources better]

---

## Pattern Recognition

> Review section: Updated monthly to identify recurring patterns

### Recurring Error Types
- [Pattern 1]: Occurs in [X] entries
- [Pattern 2]: Occurs in [X] entries

### Most Expensive Mistakes
1. [Type of mistake] - Total time lost: [X hours]
2. [Type of mistake] - Total time lost: [X hours]

### Early Warning Signs to Watch For
- [Sign 1]: Usually indicates [Problem]
- [Sign 2]: Usually indicates [Problem]

### Lessons Learned Multiple Times
> If something appears here, you're not applying the lesson!
- [Lesson]: Learned in [Game 1], repeated in [Game 2]

---

## Template for Quick Entries

### [Date] - [Brief Title]
- **Game**: 
- **What Happened**: 
- **Why**: 
- **Fix/Outcome**: 
- **Lesson**: 
- **Time Lost**: 

---

*"Failure is simply the opportunity to begin again, this time more intelligently." - Henry Ford*
