# External Resources Library

> Curated list of tutorials, documentation, courses, and community resources used throughout the learning journey. Rated and annotated to help make informed decisions about what to use.

---

## How to Use This Document
1. **Add resources** as you discover and use them
2. **Rate honestly** after completing (★☆☆☆☆ to ★★★★★)
3. **Note which game** you used it for
4. **Update notes** if you revisit the resource
5. **Mark resources** as recommended or avoid

---

## Unity Official Documentation

### Web Audio API (MDN)
- **[Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - ★★★★★
  - Used for: Pong audio system
  - Best for: Understanding Web Audio fundamentals, API reference
  - Notes: Essential reference for browser-based audio

- **[Web Audio API - Simple Synth Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth)** - ★★★★☆
  - Used for: Pong sound synthesis
  - Best for: Learning oscillators and basic synthesis
  - Notes: Great practical examples

### Core Documentation
- **[Unity Manual](https://docs.unity3d.com/Manual/index.html)** - ★★★★★
  - Used for: [Games that referenced this]
  - Best for: Understanding Unity concepts deeply
  - Notes: Always start here for official info

- **[Unity Scripting API](https://docs.unity3d.com/ScriptReference/)** - ★★★★★
  - Used for: [All games]
  - Best for: Looking up specific classes/methods
  - Notes: Essential reference, bookmark this

- **[Unity Learn](https://learn.unity.com/)** - ★★★★☆
  - Courses completed:
    - [Course name] - Used in [Game]
  - Notes: Good for structured learning, can be slow

---

## Tutorial Series

### YouTube Channels

#### [Channel Name 1]
- **Link**: [URL]
- **Overall Rating**: ★★★★★
- **Best For**: [Type of content]
- **Tutorials Used**:
  1. **[Tutorial Title]** - ★★★★★
     - Used in: [Game]
     - Duration: [X hours]
     - Key takeaways: 
     - Would recommend: Yes/No

  2. **[Tutorial Title]** - ★★☆☆☆
     - Used in: [Game]
     - Duration: [X hours]
     - Why lower rating: 
     - Would recommend: No

#### [Channel Name 2]
- **Link**: [URL]
- **Overall Rating**: ★★★★☆
- **Tutorials Used**:
  - [List tutorials]

---

## 🎨 Canvas Art Repositories (Curated - Jan 2026)

> **Philosophy**: "Most bad generative art comes from 'look how much I can do'. Most good generative art comes from 'look how little I need'."

### Research Directive (How to Study These)
```
For each repository:
- Identify the render order
- Identify where structure is locked
- Identify where randomness is constrained
- Identify what is intentionally NOT done

Extract patterns, not visuals.
You are teaching taste through omission.
```

---

### 🧱 FOUNDATIONAL CANVAS ART (Clean, Readable, Structured)

#### MDN Canvas Examples (Gold Standard Baseline)
- **Link**: https://github.com/mdn/dom-examples/tree/main/canvas
- **Why It Matters**: Extremely disciplined use of Canvas primitives
- **Look For**: Path construction, gradients used sparingly, clear layering order
- **Key Insight**: This is what "boring but correct" looks like

#### Anvaka / playgrounds
- **Link**: https://github.com/anvaka
- **Notable Repos**: panzoom, field-playground, w-gl
- **Key Insight**: Strong form + minimal effects beats complex noise

---

### 🌍 LANDSCAPES, TERRAIN & ORGANIC FORMS

#### Simplex Noise.js (Procedural Terrain)
- **Link**: https://github.com/jwagner/simplex-noise.js
- **Why It Matters**: Noise generator you can read + reason about
- **Look For**: How noise is SAMPLED, not just generated; how terrain is layered

#### Delaunay (Non-Grid Terrain)
- **Link**: https://github.com/ironwallaby/delaunay
- **Why It Matters**: Useful for non-grid terrain structure thinking

#### Ocean (Water & Shoreline Logic)
- **Link**: https://github.com/jbouny/ocean
- **Key Insight**: How reflections fade, how edges DISSOLVE instead of meet
- **Application**: Transition logic, not visual copying

---

### 🌲 ORGANIC SHAPES (Not Geometry)

#### p5.js Sketches (Processing Foundation)
- **Link**: https://github.com/processing/p5.js-sketches
- **Link**: https://github.com/aferriss/p5js-sketches
- **Why It Matters**: Maps almost 1:1 to Canvas; the thinking is what you want
- **Look For**: Cluster logic, Big→Medium→Small progression, intentional imperfection

---

### 🧠 "GOOD TASTE" GENERATIVE ART

#### Tyler Hobbs (Conceptual Reference)
- **Link**: https://github.com/tylerxhobbs
- **Why It Matters**: Not to copy style — to observe restraint
- **Key Observations**:
  - Extreme restraint
  - Very few rules
  - Strong hierarchy
- **Application**: Teaches what to TURN OFF when your system has too many rules firing

---

### 🎛️ CANVAS RENDERING DISCIPLINE (Sequencing)

#### canvas2D
- **Link**: https://github.com/fserb/canvas2D
- **Why It Matters**: Clear separation of: layout → render → effects
- **Application**: No "everything everywhere" drawing

#### uPlot (Layer Discipline)
- **Link**: https://github.com/leeoniya/uPlot
- **Why It Matters**: Not art, but demonstrates disciplined layer separation

---

### 🔬 DEBUGGING & VISUALIZATION

#### Visual Debugging Ideas
- **Links**: 
  - https://github.com/samizdatco/sketchbook
  - https://github.com/1wheel/sketches
- **Concepts to Extract**:
  - Render silhouette-only passes
  - Render edge hardness maps
  - Render value-only previews
- **Application**: Catch abstraction before it becomes a full version

---

## Written Tutorials & Blog Posts

### [Tutorial/Article Title]
- **Link**: [URL]
- **Author**: [Name]
- **Rating**: ★★★★★
- **Used in**: [Game name]
- **Topic**: [What it covers]
- **Time to Complete**: [X hours]
- **Key Learning**: [Main takeaway]
- **Code Quality**: [Good/Okay/Bad]
- **Up to Date?**: [Yes/No - Unity version]
- **Would Recommend**: Yes/No
- **Notes**: 

---

## Courses (Paid)

### [Course Name]
- **Platform**: [Udemy/Coursera/Unity Learn Premium/etc.]
- **Instructor**: [Name]
- **Price**: $[X]
- **Rating**: ★★★★☆
- **Completion**: [X%] or Completed
- **Duration**: [X hours]
- **Used in Games**: [List]
- **Topics Covered**:
  - Topic 1
  - Topic 2
- **Strengths**: 
- **Weaknesses**: 
- **Worth the Money?**: Yes/No
- **Best For**: [Skill level or topic]
- **Notes**: 

---

## Books

### [Book Title]
- **Author**: [Name]
- **Rating**: ★★★★★
- **Pages Read**: [X/Total]
- **Used in**: [Game name]
- **Topics**: 
- **Best Chapters**: 
- **Skip Chapters**: 
- **Key Takeaways**: 
- **Would Recommend**: Yes/No
- **Notes**: 

---

## Documentation Sites (Non-Unity)

### [Site Name - e.g., C# Documentation]
- **Link**: [URL]
- **Rating**: ★★★★★
- **Used for**: [Purpose]
- **Best Sections**: 
- **Notes**: 

---

## Community Resources

### Forums

#### Unity Forum
- **Link**: https://forum.unity.com/
- **Rating**: ★★★★☆
- **Best For**: Specific technical questions
- **Response Time**: Usually within 24hrs
- **Quality**: Variable
- **Helpful Threads**:
  - [Thread title and link]

#### Reddit - r/Unity3D
- **Link**: https://reddit.com/r/Unity3D
- **Rating**: ★★★★☆
- **Best For**: Quick questions, showcasing work
- **Helpful Threads**:
  - [Thread title and link]

### Discord Servers

#### [Server Name]
- **Invite Link**: [URL]
- **Rating**: ★★★★★
- **Best For**: Real-time help
- **Active Hours**: [Time zone info]
- **Helpful Users**: [@username mentions if any]
- **Notable Help Received**:
  - Problem: [Brief]
  - Solution: [Brief]
  - Helpful user: [@username]

---

## GitHub Repositories

### [Repository Name]
- **Link**: [URL]
- **Stars**: [X]
- **Rating**: ★★★★★
- **Used in**: [Game name]
- **What It Provides**: [Code samples, tools, templates, etc.]
- **Code Quality**: [Excellent/Good/Okay/Poor]
- **Documentation Quality**: [Excellent/Good/Okay/Poor]
- **How I Used It**: 
- **Would Recommend**: Yes/No

---

## Asset Store Resources

### Free Assets Used

#### [Asset Name]
- **Link**: [Asset Store URL]
- **Type**: [Art/Code/Audio/etc.]
- **Rating**: ★★★★☆
- **Used in**: [Game name]
- **Quality**: 
- **Licensing**: [What you can do with it]
- **Would Recommend**: Yes/No

### Paid Assets Used

#### [Asset Name]
- **Link**: [Asset Store URL]
- **Type**: [Art/Code/Audio/etc.]
- **Price**: $[X]
- **Rating**: ★★★★★
- **Used in**: [Game name]
- **Worth the Cost?**: Yes/No
- **Quality**: 
- **Support**: [Good/Okay/Bad]
- **Notes**: 

---

## Tools & Software

### Game Development Tools

#### [Tool Name - e.g., Aseprite for pixel art]
- **Link**: [URL]
- **Type**: [Art/Audio/Design/etc.]
- **Price**: [Free/$X]
- **Rating**: ★★★★★
- **Used for**: [Purpose]
- **Learning Curve**: [Easy/Medium/Hard]
- **Replaced What**: [Previous tool]
- **Would Recommend**: Yes/No
- **Tutorials Used**: 
  - [Tutorial link]

---

## Quick Reference Sheets

### [Cheat Sheet Name]
- **Link**: [URL]
- **Rating**: ★★★★★
- **Covers**: [Topics]
- **Printed?**: Yes/No
- **Usefulness**: [How often you reference it]

---

## Resources That Wasted Time

> Important! Document what DIDN'T work to save future time

### [Resource Name]
- **Link**: [URL]
- **Type**: [Tutorial/Course/Article]
- **Time Invested**: [X hours]
- **Rating**: ★☆☆☆☆
- **Why It Failed**: 
  - Outdated (Unity version X, now on Y)
  - Poor code quality
  - Concepts not explained
  - [Other reasons]
- **What I Should Have Used Instead**: [Better alternative]
- **Warning Signs to Watch For**: [How to identify similar resources]

---

## Resource Gaps

> What you needed but couldn't find

### [Topic/Problem]
- **What I Was Looking For**: 
- **Closest Resource Found**: [Link]
- **Why It Wasn't Sufficient**: 
- **How I Solved It Instead**: 
- **Date**: [YYYY-MM-DD]
- **Status**: [ ] Still needed / [ ] Later found: [Link]

---

## Monthly Favorites

### [Month/Year]
**Resource of the Month**: [Name and link]  
**Why**: [Brief explanation]

### [Month/Year]
**Resource of the Month**: [Name and link]  
**Why**: [Brief explanation]

---

## Resource Usage Stats

### Most Referenced Overall
1. [Resource] - Referenced in X games
2. [Resource] - Referenced in X games
3. [Resource] - Referenced in X games

### Best ROI (Value vs Time)
1. [Resource] - ★★★★★ - [Why]
2. [Resource] - ★★★★★ - [Why]

### Biggest Time Wasters
1. [Resource] - ★☆☆☆☆ - [Why]
2. [Resource] - ★☆☆☆☆ - [Why]

---

## Recommended Learning Paths

> As you progress, document recommended resource sequences for different topics

### For Learning [Topic - e.g., "Character Controllers"]
1. Start with: [Resource]
2. Then: [Resource]
3. Practice in: [Game project type]
4. Reference: [Documentation]
5. Advanced: [Resource]

---

*Last Updated: [Date]*
