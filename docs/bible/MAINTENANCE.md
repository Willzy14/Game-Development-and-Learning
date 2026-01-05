# 🔧 BIBLE MAINTENANCE GUIDE

**Purpose:** Instructions for maintaining and updating the Bible documentation system  
**When to Read:** End of session, adding new techniques, fixing documentation

<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-05   | 2026-01-05     | Bible system created |
<!-- END METADATA -->

**Related Documents:**
- [CHANGELOG.md](./CHANGELOG.md) - Record all documentation changes here
- [09-SESSION_LOG.md](./09-SESSION_LOG.md) - Session-level updates
- [BIBLE_INDEX.md](./BIBLE_INDEX.md) - Master index to update

---

## THE MAINTENANCE PHILOSOPHY

> **If you learned it, document it. If you broke it, record it.**

This documentation system only works if it's kept up to date. The goal is to build a **game-making brain** - a comprehensive knowledge base that grows with every session.

---

## END OF SESSION CHECKLIST

**Complete these steps at the END of EVERY coding session:**

### 1. Update Session Log ⭐ REQUIRED
Add an entry to [09-SESSION_LOG.md](./09-SESSION_LOG.md):
- What was accomplished
- What was learned (new techniques, insights)
- Any failures (also add to FAILURE_ARCHIVE.md)
- Questions that arose
- What Bible updates were made

### 2. Record Failures
If anything went wrong, add it to [../FAILURE_ARCHIVE.md](../FAILURE_ARCHIVE.md):
- What happened
- Root cause
- How it was fixed
- Prevention strategy

### 3. Add New Techniques
If you learned a new technique, add it to the relevant Bible doc:
- Audio technique → [02-AUDIO_MASTERY.md](./02-AUDIO_MASTERY.md)
- Visual technique → [03-VISUAL_TECHNIQUES.md](./03-VISUAL_TECHNIQUES.md)
- Game pattern → [04-PATTERNS_REFERENCE.md](./04-PATTERNS_REFERENCE.md)
- API usage → [05-TECHNOLOGIES.md](./05-TECHNOLOGIES.md)
- UI pattern → [06-UI_CONTROLS.md](./06-UI_CONTROLS.md)
- Bug solution → [07-DEBUG_QUALITY.md](./07-DEBUG_QUALITY.md)

### 4. Update Skills Tracker
If you mastered something new, update [../SKILLS_TRACKER.md](../SKILLS_TRACKER.md)

### 5. Check Index Accuracy
Verify [BIBLE_INDEX.md](./BIBLE_INDEX.md) still reflects the current state:
- Games completed count
- Current tier
- Mastery levels accurate

---

## HOW TO ADD NEW CONTENT

### Adding a New Technique

1. Identify the correct Bible document (see list above)
2. Find the relevant section
3. Add the technique with this format:

```markdown
### Technique Name

**Learned:** [Game/Session where learned]

```javascript
// Working code example
```

**Key Points:**
- Important detail 1
- Important detail 2

**When to Use:** [Context for when this applies]
```

### Adding a New Bug Solution

1. Open [07-DEBUG_QUALITY.md](./07-DEBUG_QUALITY.md)
2. Add to the Quick Lookup Table
3. If complex, add a detailed section below

Format:
```markdown
#### Bug Name

**Symptom:** What you see/experience

**Cause:** Why it happens

**Solution:**
```javascript
// Fix code
```

**Prevention:** How to avoid this in future
```

### Adding a Failure Archive Entry

1. Open [../FAILURE_ARCHIVE.md](../FAILURE_ARCHIVE.md)
2. Find the relevant category (or create one)
3. Add entry with this format:

```markdown
### [Date] - Failure Title

**What Happened:** Description

**Root Cause:** Analysis

**Fix Applied:** What was done

**Prevention:** How to avoid in future

**Lesson:** One-sentence takeaway
```

---

## ADDING NEW BIBLE DOCUMENTS

When a topic grows too large or a new major area emerges:

### 1. Create the Document
```
docs/bible/[NN]-[TOPIC_NAME].md
```
Where NN is the next number in sequence.

### 2. Follow the Standard Format
```markdown
# [Emoji] [TOPIC NAME]

**Purpose:** One sentence describing what this doc covers  
**When to Read:** When would someone need this document

---

## TABLE OF CONTENTS

1. [Section 1](#section-1)
2. [Section 2](#section-2)
...

---

## Section 1

Content...

---

*Last Updated: [Date]*  
*Topic Learned Through: [Games/Sessions]*
```

### 3. Update BIBLE_INDEX.md
Add the new document to:
- Repository map
- Document reference table
- Any relevant cross-references

### 4. Add Cross-References
Link from other Bible docs where relevant:
```markdown
For more on this, see [XX-TOPIC_NAME.md](./XX-TOPIC_NAME.md)
```

---

## WHEN TO RESTRUCTURE

Consider restructuring when:

1. **Document exceeds 1500 lines** - Split into focused subdocuments
2. **Topic has 10+ techniques** - Might deserve its own document
3. **Finding info is hard** - Reorganize for better navigation
4. **Context windows fill up** - Split for AI-friendly chunks

### Restructuring Process

1. Plan new structure (don't just start splitting)
2. Create new documents
3. Move content (don't copy - keep single source of truth)
4. Update all cross-references
5. Update BIBLE_INDEX.md
6. Archive old structure (don't delete)
7. Document the restructure in SESSION_LOG.md

---

## MAINTAINING THE RULES

### Adding New Rules

The 10 Commandments in [01-CORE_RULES.md](./01-CORE_RULES.md) are the most critical part of this system.

**Only add a new rule when:**
1. A significant failure occurred
2. The failure wasted substantial time
3. The failure is likely to recur
4. No existing rule covers it

**Format for new rules:**
```markdown
#### Rule N: Rule Name [Priority Emoji if critical]

**The Rule:**
```
Clear statement of what to do/not do
```

**Origin Story:** [Game/Date] - What went wrong

**Prevention Strategy:**
1. Step 1
2. Step 2

**Checklist:**
- [ ] Question to ask yourself
- [ ] Another question
```

### Updating Existing Rules

If a rule needs clarification:
1. Add examples showing edge cases
2. Add to the "Prevention Strategy"
3. Note the update in SESSION_LOG.md

**Never:** Remove rules without team discussion

---

## ARCHIVING OLD CONTENT

When content becomes outdated but might be useful:

1. Create `docs/archive/` folder if needed
2. Move old file there with date suffix: `OLD_BIBLE_v4_2026-01-05.md`
3. Add note at top: `# ARCHIVED - See docs/bible/ for current documentation`
4. Update any links pointing to old location

---

## STALENESS DETECTION SYSTEM

### How It Works

Every Bible document has a **metadata block** at the top:

```markdown
<!-- STALENESS METADATA -->
| Last Updated | Last Validated | Update Trigger |
|--------------|----------------|----------------|
| 2026-01-05   | 2026-01-05     | [What triggered the update] |
<!-- END METADATA -->
```

- **Last Updated:** When content was last modified
- **Last Validated:** When content was last confirmed accurate (even if no changes)
- **Update Trigger:** What event caused the update

### Staleness Rules

| Time Since Validation | Status | Action Required |
|-----------------------|--------|-----------------|
| < 30 days | ✅ Fresh | None |
| 30-60 days | ⚠️ Review | Validate next session |
| > 60 days | 🔴 Stale | Must validate before using |

### Validation Procedure

When validating a document:

1. **Read through the content** - Does it still apply?
2. **Test code examples** - Do they still work?
3. **Check cross-references** - Do links still work?
4. **Update metadata** - Change "Last Validated" date
5. **Log in CHANGELOG** - Note the validation

### When to Update "Last Updated"

Update this date when:
- Adding new content
- Modifying existing content
- Removing obsolete content
- Fixing errors

Do NOT update when:
- Only validating (use Last Validated)
- Fixing typos
- Formatting changes

### Staleness Check Script (Manual)

At start of each tier (or quarterly), run this check:

```bash
# List all Bible docs with their Last Validated dates
grep -h "Last Validated" docs/bible/*.md | head -20
```

Or visually scan the metadata blocks in each document.

---

## CHANGELOG PROCEDURES

### When to Update CHANGELOG.md

Update [CHANGELOG.md](./CHANGELOG.md) when:

1. **Adding a new rule** - Document the origin
2. **Modifying a rule** - Document what changed and why
3. **Retiring a rule** - Document why it's no longer needed
4. **Adding major technique** - Document where it came from
5. **Restructuring docs** - Document the change

### CHANGELOG Entry Format

```markdown
## [YYYY-MM-DD] - Brief Description

### 🆕 Added
- **[Document]:** What was added and why
  - Source: Which game/session taught this
  
### ✏️ Modified  
- **[Document]:** What changed and why
  - Before: Previous approach
  - After: New approach
  - Reason: Why the change was made

### 🗑️ Removed
- **[Document]:** What was removed and why
  - Reason: Why it's no longer needed

### 📜 Rules Changed
- **Rule X:** 
  - Change: What changed
  - Origin: What triggered this change
```

### Rule Evolution Protocol

When a rule changes:

1. **Update BIBLE_INDEX.md** - Change the rule summary
2. **Update 01-CORE_RULES.md** - Change the detailed rule
3. **Update CHANGELOG.md** - Record the change with full context
4. **Note in SESSION_LOG** - Mention the rule change

This creates a traceable history of why rules exist and how they evolved.

---

## CROSS-REFERENCE STANDARDS

### All Documents Should Link To:

1. **Related documents** - In the header metadata block
2. **Deeper explanations** - When mentioning a topic covered elsewhere
3. **The index** - For navigation

### Link Format

Always use relative paths:
```markdown
[Document Name](./other-doc.md)           # Same folder
[Document Name](../other-folder/doc.md)   # Parent folder
```

### Bidirectional Links

When Document A references Document B, Document B should reference A:

- Audio → Quick Reference (for cheat sheets)
- Quick Reference → Audio (for full details)

---

## QUALITY STANDARDS

### Code Examples Must:
- Actually work (tested)
- Include necessary context
- Show complete patterns (not fragments)
- Include comments for non-obvious parts

### Explanations Must:
- Start with WHY (purpose/context)
- Include WHEN to use
- Provide working code
- Note gotchas/edge cases

### Cross-References Must:
- Use relative paths
- Actually exist (test the links)
- Be bidirectional when relevant

---

## COMMON MAINTENANCE MISTAKES

❌ **Don't:**
- Add techniques without code examples
- Copy code without testing it works
- Create documents without updating index
- Update content without noting in session log
- Add rules without origin stories
- Delete content (archive instead)

✅ **Do:**
- Test all code examples before adding
- Keep format consistent with existing docs
- Update index whenever structure changes
- Record all updates in session log
- Include context for why things work
- Archive instead of delete

---

## THE MAINTENANCE COMMITMENT

This documentation system represents **25+ hours of learning**. Every technique was hard-won. Every bug was actually debugged. Every rule has a story.

**The commitment:**
- Update session log every session
- Document failures immediately (while fresh)
- Add techniques as they're learned
- Keep the index accurate
- Never let documentation drift from reality

**The reward:**
- Never repeat the same mistake twice
- Always have working code to reference
- Onboard new sessions instantly
- Build compound knowledge over time

---

*Maintenance Guide Created: January 5, 2026*  
*Bible System Version: 5.0*
