#!/usr/bin/env node

/**
 * Planning Document Generator
 * Interactive interrogation script implementing DECISION_GRAPH.md v1.1
 * 
 * Usage: node interrogate.js
 * 
 * Features:
 * - Q0-Q9 interrogation with conditional logic
 * - Conflict detection and resolution
 * - Auto-loading with influence weights
 * - Forbidden rules population
 * - Planning doc generation (<300 lines)
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const BIBLE_DOCS = {
  // Core logic and rules
  'DECISION_GRAPH': { path: 'docs/bible/DECISION_GRAPH.md', category: 'meta' },
  'CORE_RULES': { path: 'docs/bible/01-CORE_RULES.md', category: 'core' },
  
  // Technical implementation
  'AUDIO_MASTERY': { path: 'docs/bible/02-AUDIO_MASTERY.md', category: 'audio' },
  'VISUAL_TECHNIQUES': { path: 'docs/bible/03-VISUAL_TECHNIQUES.md', category: 'visual' },
  'PATTERNS_REFERENCE': { path: 'docs/bible/04-PATTERNS_REFERENCE.md', category: 'patterns' },
  'TECHNOLOGIES': { path: 'docs/bible/05-TECHNOLOGIES.md', category: 'tech' },
  'UI_CONTROLS': { path: 'docs/bible/06-UI_CONTROLS.md', category: 'ui' },
  'DEBUG_QUALITY': { path: 'docs/bible/07-DEBUG_QUALITY.md', category: 'quality' },
  
  // Canvas rendering
  'CANVAS_PATTERNS': { path: 'docs/bible/11-CANVAS_PATTERNS.md', category: 'canvas' },
  'EDGE_MASTERY': { path: 'docs/bible/12-EDGE_MASTERY.md', category: 'canvas' },
  'MATERIAL_LOGIC': { path: 'docs/bible/13-MATERIAL_LOGIC.md', category: 'material' },
  'CANVAS_IMPLEMENTATION': { path: 'docs/bible/14-CANVAS_IMPLEMENTATION_PATTERNS.md', category: 'canvas' },
  'REALISM_VALIDATION': { path: 'docs/bible/15-REALISM_VALIDATION.md', category: 'realism' },
  
  // Art and style
  'COMPOSITION': { path: 'docs/bible/18-COMPOSITION.md', category: 'art' },
  'COLOR': { path: 'docs/bible/19-COLOR.md', category: 'art' },
  'STYLES': { path: 'docs/bible/20-STYLES.md', category: 'style' },
  'CLASSICAL_TECHNIQUES': { path: 'docs/bible/21-CLASSICAL_TECHNIQUES.md', category: 'technique' },
  'LANDSCAPE': { path: 'docs/bible/22-LANDSCAPE.md', category: 'environment' },
  'ENVIRONMENTAL': { path: 'docs/bible/23-ENVIRONMENTAL.md', category: 'environment' },
  
  // Realism and degradation
  'REALISM_DEGRADATION': { path: 'docs/bible/24-REALISM_DEGRADATION.md', category: 'realism' }
};

// Rule priority system from DECISION_GRAPH.md v1.1
const RULE_PRIORITY = {
  task_type: 100,
  style: 80,
  age: 70,
  environment: 60,
  material: 50,
  composition: 40,
  color: 30,
  lighting: 30
};

// Forbidden rule definitions
const FORBIDDEN_RULES = {
  perfect_geometry: {
    condition: (answers) => answers.age > 50 || answers.environment === 'harsh',
    forbidden: ['perfect_symmetry', 'smooth_uniform_surface', 'pristine_edges'],
    required: ['variation', 'weathering', 'imperfection'],
    reason: 'Ancient or harsh environments preclude perfection'
  },
  smooth_gradients: {
    condition: (answers) => answers.style && answers.style.includes('painterly'),
    forbidden: ['linear_gradients', 'smooth_blends', 'photorealistic_transitions'],
    required: ['visible_brushwork', 'texture', 'deliberate_marks'],
    reason: 'Painterly style requires visible technique'
  },
  chaotic_noise: {
    condition: (answers) => answers.composition === 'simple' || answers.task_type === 'reskin',
    forbidden: ['random_high_frequency_noise', 'texture_without_purpose', 'decoration_for_decoration'],
    required: ['intentional_detail', 'hierarchical_clarity', 'design_logic'],
    reason: 'Simplicity and reskins require clarity'
  },
  environment_mismatch: {
    condition: (answers) => answers.environment,
    forbidden: ['contradictory_weathering', 'impossible_materials', 'wrong_degradation_pattern'],
    required: ['environment_appropriate_effects', 'logical_forces', 'consistent_physics'],
    reason: 'Environment determines allowed effects'
  },
  style_contamination: {
    condition: (answers) => answers.style,
    forbidden: ['mixing_incompatible_styles', 'realistic_detail_in_abstract', 'abstract_randomness_in_realistic'],
    required: ['style_consistency', 'appropriate_technique', 'matching_detail_level'],
    reason: 'Style defines rendering approach'
  },
  silhouette_protection: {
    condition: (answers) => answers.readability_required || answers.task_type === 'reskin',
    forbidden: ['over_noising_primary_shape', 'destroying_recognizable_form', 'excessive_surface_variation'],
    required: ['primary_forms_remain_legible', 'silhouette_readable', 'design_intent_preserved'],
    max_noise_threshold: 0.6,
    reason: 'Readability and game objects require clear forms'
  }
};

// ============================================================================
// STATE
// ============================================================================

let answers = {};
let conflicts = [];
let loadedDocs = [];
let skippedDocs = [];
let applicableForbiddenRules = [];

// ============================================================================
// QUESTIONS (Q0-Q9)
// ============================================================================

const QUESTIONS = {
  Q0: {
    key: 'task_type',
    text: 'Q0: What is the task type?',
    options: ['new', 'reskin', 'extend', 'fix'],
    description: {
      new: 'Building something from scratch',
      reskin: 'Changing appearance of existing working code',
      extend: 'Adding features to existing system',
      fix: 'Debugging or correcting issues'
    },
    critical: true
  },
  
  Q1: {
    key: 'style',
    text: 'Q1: What is the artistic style?',
    options: ['photorealistic', 'painterly_impressionist', 'painterly_expressionist', 'stylized_realistic', 'abstract_geometric', 'abstract_organic', 'minimalist', 'maximalist'],
    description: {
      photorealistic: 'Camera-like realism',
      painterly_impressionist: 'Visible brushwork, light emphasis',
      painterly_expressionist: 'Emotional, bold marks',
      stylized_realistic: 'Simplified but believable',
      abstract_geometric: 'Shape-based, non-representational',
      abstract_organic: 'Fluid, natural abstraction',
      minimalist: 'Reduced to essentials',
      maximalist: 'Rich, complex, detailed'
    }
  },
  
  Q2: {
    key: 'age',
    text: 'Q2: What is the age of objects (0-100)?',
    type: 'number',
    range: [0, 100],
    description: '0 = brand new, 50 = weathered, 100 = ancient ruins'
  },
  
  Q2_5: {
    key: 'origin_form',
    text: 'Q2.5: What was the original form before degradation?',
    options: ['perfect_geometric', 'crafted_architectural', 'organic_natural', 'composite'],
    description: {
      perfect_geometric: 'Precise shapes (column, sphere, cube)',
      crafted_architectural: 'Human-made structures (walls, buildings)',
      organic_natural: 'Natural forms (trees, rocks, landscapes)',
      composite: 'Mixed materials/forms'
    },
    condition: (answers) => answers.age > 50 && (answers.style === 'photorealistic' || answers.style === 'stylized_realistic')
  },
  
  Q3: {
    key: 'material',
    text: 'Q3: What are the primary materials?',
    options: ['stone', 'wood', 'metal', 'fabric', 'organic', 'synthetic', 'composite', 'energy'],
    multiple: true,
    description: 'Select all that apply (space-separated)'
  },
  
  Q4: {
    key: 'environment',
    text: 'Q4: What is the environment?',
    options: ['outdoor_temperate', 'outdoor_harsh', 'indoor_controlled', 'underwater', 'space_vacuum', 'magical_unstable'],
    description: {
      outdoor_temperate: 'Normal weather exposure',
      outdoor_harsh: 'Extreme conditions (desert, arctic)',
      indoor_controlled: 'Protected from elements',
      underwater: 'Submerged, water pressure',
      space_vacuum: 'Zero atmosphere',
      magical_unstable: 'Unpredictable forces'
    }
  },
  
  Q5: {
    key: 'lighting',
    text: 'Q5: What is the lighting condition?',
    options: ['direct_sun', 'diffuse_overcast', 'artificial_warm', 'artificial_cool', 'dim_ambient', 'dramatic_contrast', 'magical_glow'],
    description: 'Affects color temperature and shadows'
  },
  
  Q6: {
    key: 'composition',
    text: 'Q6: What is the compositional complexity?',
    options: ['simple', 'moderate', 'complex'],
    description: {
      simple: '1-3 focal points, clear hierarchy',
      moderate: '4-7 elements, balanced',
      complex: '8+ elements, rich detail'
    }
  },
  
  Q7: {
    key: 'color_palette',
    text: 'Q7: What is the color approach?',
    options: ['monochromatic', 'analogous', 'complementary', 'triadic', 'naturalistic', 'stylized_limited'],
    description: {
      monochromatic: 'Single hue variations',
      analogous: 'Adjacent colors',
      complementary: 'Opposite colors',
      triadic: 'Three evenly spaced',
      naturalistic: 'Observed from nature',
      stylized_limited: 'Curated palette'
    }
  },
  
  Q8: {
    key: 'technique_emphasis',
    text: 'Q8: Which classical techniques apply?',
    options: ['chiaroscuro', 'sfumato', 'impasto', 'glazing', 'scumbling', 'wet_on_wet', 'dry_brush', 'none'],
    multiple: true,
    description: 'Select all that apply (space-separated), or "none"'
  },
  
  Q9: {
    key: 'special_requirements',
    text: 'Q9: Any special requirements?',
    options: ['readability_critical', 'performance_critical', 'accessibility_required', 'animation_planned', 'none'],
    multiple: true,
    description: 'Select all that apply (space-separated), or "none"'
  }
};

// ============================================================================
// CLI HELPERS
// ============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function displayOptions(question) {
  console.log('\n' + '='.repeat(60));
  console.log(question.text);
  console.log('='.repeat(60));
  
  if (question.type === 'number') {
    console.log(`Range: ${question.range[0]} - ${question.range[1]}`);
    console.log(question.description);
  } else {
    question.options.forEach((opt, idx) => {
      const desc = question.description[opt] || question.description;
      console.log(`  ${idx + 1}. ${opt}${desc && typeof desc === 'string' ? '' : ` - ${desc}`}`);
    });
    
    if (typeof question.description === 'object') {
      console.log('\nDescriptions:');
      question.options.forEach(opt => {
        if (question.description[opt]) {
          console.log(`  ${opt}: ${question.description[opt]}`);
        }
      });
    }
  }
  
  if (question.multiple) {
    console.log('\n⚠️  Multiple selection: Enter space-separated numbers (e.g., "1 3 5")');
  }
  
  console.log('');
}

function parseAnswer(input, question) {
  if (question.type === 'number') {
    const num = parseInt(input);
    if (isNaN(num) || num < question.range[0] || num > question.range[1]) {
      throw new Error(`Invalid number. Must be between ${question.range[0]} and ${question.range[1]}`);
    }
    return num;
  }
  
  if (question.multiple) {
    const indices = input.trim().split(/\s+/).map(i => parseInt(i) - 1);
    const values = indices.map(idx => {
      if (idx < 0 || idx >= question.options.length) {
        throw new Error(`Invalid option number: ${idx + 1}`);
      }
      return question.options[idx];
    });
    return values;
  }
  
  const idx = parseInt(input) - 1;
  if (idx < 0 || idx >= question.options.length) {
    throw new Error(`Invalid option. Choose 1-${question.options.length}`);
  }
  
  return question.options[idx];
}

// ============================================================================
// INTERROGATION
// ============================================================================

async function runInterrogation() {
  console.log('\n' + '█'.repeat(60));
  console.log('  PLANNING DOC GENERATOR - DECISION_GRAPH v1.1');
  console.log('█'.repeat(60));
  console.log('\nThis will guide you through Q0-Q9 and generate a complete planning doc.');
  console.log('Answer each question carefully - these determine which Bible docs to load.\n');
  
  // Q0 (CRITICAL - always first)
  await askQuestion('Q0');
  
  // Q1-Q2
  await askQuestion('Q1');
  await askQuestion('Q2');
  
  // Q2.5 (conditional)
  if (QUESTIONS.Q2_5.condition(answers)) {
    await askQuestion('Q2_5');
  }
  
  // Q3-Q9
  await askQuestion('Q3');
  await askQuestion('Q4');
  await askQuestion('Q5');
  await askQuestion('Q6');
  await askQuestion('Q7');
  await askQuestion('Q8');
  await askQuestion('Q9');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Interrogation complete!');
  console.log('='.repeat(60));
}

async function askQuestion(qKey) {
  const question = QUESTIONS[qKey];
  let valid = false;
  let answer;
  
  while (!valid) {
    try {
      displayOptions(question);
      const input = await ask(`Your answer: `);
      answer = parseAnswer(input, question);
      valid = true;
    } catch (error) {
      console.log(`❌ ${error.message}. Please try again.`);
    }
  }
  
  answers[question.key] = answer;
  
  // Store readability flag for forbidden rules
  if (qKey === 'Q9' && Array.isArray(answer)) {
    answers.readability_required = answer.includes('readability_critical');
  }
  
  console.log(`✓ Saved: ${question.key} = ${Array.isArray(answer) ? answer.join(', ') : answer}`);
}

// ============================================================================
// CONFLICT RESOLUTION
// ============================================================================

function detectConflicts() {
  conflicts = [];
  
  // Check task_type vs realism requirements
  if (answers.task_type === 'reskin' && answers.age > 70) {
    conflicts.push({
      properties: ['task_type', 'age'],
      priorities: [RULE_PRIORITY.task_type, RULE_PRIORITY.age],
      winner: 'task_type',
      resolution: 'Reskin preserves game logic. Age effects applied to rendering only, not behavior.',
      impact: 'Degradation stays visual - no structural changes to code.'
    });
  }
  
  // Check style vs realism
  if ((answers.style === 'painterly_impressionist' || answers.style === 'painterly_expressionist') && answers.age > 50) {
    conflicts.push({
      properties: ['style', 'age'],
      priorities: [RULE_PRIORITY.style, RULE_PRIORITY.age],
      winner: 'style',
      resolution: 'Painterly style determines rendering approach. Age suggests degradation, not simulates it.',
      impact: 'Load REALISM_DEGRADATION with influence weight 0.3 (suggest, not enforce).'
    });
  }
  
  // Check environment vs material
  if (answers.environment === 'underwater' && answers.material && answers.material.includes('metal')) {
    conflicts.push({
      properties: ['environment', 'material'],
      priorities: [RULE_PRIORITY.environment, RULE_PRIORITY.material],
      winner: 'environment',
      resolution: 'Underwater forces override standard metal properties (add corrosion, barnacles).',
      impact: 'Material behaves according to environment physics.'
    });
  }
  
  // Check composition vs style
  if (answers.composition === 'complex' && (answers.style === 'minimalist' || answers.style === 'abstract_geometric')) {
    conflicts.push({
      properties: ['composition', 'style'],
      priorities: [RULE_PRIORITY.composition, RULE_PRIORITY.style],
      winner: 'style',
      resolution: 'Style defines detail level. "Complex" reinterpreted as "rich relationships" not "cluttered detail".',
      impact: 'Many elements, but each simplified per style requirements.'
    });
  }
}

function displayConflicts() {
  if (conflicts.length === 0) {
    console.log('\n✅ No conflicts detected - properties are compatible.\n');
    return;
  }
  
  console.log('\n' + '⚠️ '.repeat(30));
  console.log('  CONFLICTS DETECTED - RESOLUTION APPLIED');
  console.log('⚠️ '.repeat(30) + '\n');
  
  conflicts.forEach((conflict, idx) => {
    console.log(`\nConflict ${idx + 1}:`);
    console.log(`  Properties: ${conflict.properties.join(' vs ')}`);
    console.log(`  Priorities: ${conflict.properties.map(p => `${p}(${conflict.priorities[idx] || RULE_PRIORITY[p]})`).join(' vs ')}`);
    console.log(`  Winner: ${conflict.winner} (Priority: ${RULE_PRIORITY[conflict.winner]})`);
    console.log(`  Resolution: ${conflict.resolution}`);
    console.log(`  Impact: ${conflict.impact}`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ============================================================================
// DOCUMENT AUTO-LOADING
// ============================================================================

function determineDocLoading() {
  loadedDocs = [];
  skippedDocs = [];
  
  // Always load core docs
  loadedDocs.push({ doc: 'CORE_RULES', influence: 1.0, reason: 'Always required' });
  loadedDocs.push({ doc: 'DECISION_GRAPH', influence: 1.0, reason: 'Meta framework' });
  
  // Task type determines workflow
  if (answers.task_type === 'new') {
    loadedDocs.push({ doc: 'PATTERNS_REFERENCE', influence: 1.0, reason: 'Building from scratch' });
    loadedDocs.push({ doc: 'CANVAS_PATTERNS', influence: 1.0, reason: 'New rendering code' });
  } else if (answers.task_type === 'reskin') {
    loadedDocs.push({ doc: 'VISUAL_TECHNIQUES', influence: 1.0, reason: 'Appearance changes only' });
    skippedDocs.push({ doc: 'PATTERNS_REFERENCE', reason: 'Code structure unchanged' });
  }
  
  // Style determines technique docs
  const styleInfluence = getStyleInfluence(answers.style);
  
  if (answers.style === 'photorealistic' || answers.style === 'stylized_realistic') {
    loadedDocs.push({ doc: 'REALISM_VALIDATION', influence: styleInfluence.realism, reason: 'Realistic rendering' });
    loadedDocs.push({ doc: 'MATERIAL_LOGIC', influence: styleInfluence.material, reason: 'Physical accuracy' });
    loadedDocs.push({ doc: 'EDGE_MASTERY', influence: styleInfluence.edge, reason: 'Precise edges' });
  }
  
  if (answers.style.includes('painterly')) {
    loadedDocs.push({ doc: 'CLASSICAL_TECHNIQUES', influence: styleInfluence.technique, reason: 'Painterly methods' });
    loadedDocs.push({ doc: 'COLOR', influence: styleInfluence.color, reason: 'Color mixing' });
    
    // Painterly reduces realism doc influence
    if (answers.age > 50) {
      loadedDocs.push({ doc: 'REALISM_DEGRADATION', influence: 0.3, reason: 'Age suggests effects, not simulates' });
    }
  } else {
    skippedDocs.push({ doc: 'CLASSICAL_TECHNIQUES', reason: 'Not painterly style' });
  }
  
  // Age determines degradation
  if (answers.age > 50 && !answers.style.includes('painterly')) {
    loadedDocs.push({ doc: 'REALISM_DEGRADATION', influence: 1.0, reason: `Age ${answers.age} requires degradation` });
  } else if (answers.age > 50) {
    // Already added above with reduced influence
  } else {
    skippedDocs.push({ doc: 'REALISM_DEGRADATION', reason: `Age ${answers.age} too low` });
  }
  
  // Environment determines environmental docs
  if (answers.environment && answers.environment !== 'indoor_controlled') {
    loadedDocs.push({ doc: 'ENVIRONMENTAL', influence: 1.0, reason: `Environment: ${answers.environment}` });
  }
  
  // Composition determines layout docs
  loadedDocs.push({ doc: 'COMPOSITION', influence: 1.0, reason: 'Scene layout' });
  
  // Technique emphasis
  if (answers.technique_emphasis && !answers.technique_emphasis.includes('none')) {
    loadedDocs.push({ doc: 'CLASSICAL_TECHNIQUES', influence: 1.0, reason: `Techniques: ${answers.technique_emphasis.join(', ')}` });
  }
  
  // Color always relevant
  loadedDocs.push({ doc: 'COLOR', influence: 1.0, reason: 'Color palette required' });
  
  // Special requirements
  if (answers.special_requirements) {
    if (answers.special_requirements.includes('performance_critical')) {
      loadedDocs.push({ doc: 'DEBUG_QUALITY', influence: 1.0, reason: 'Performance optimization' });
    }
    if (answers.special_requirements.includes('accessibility_required')) {
      loadedDocs.push({ doc: 'UI_CONTROLS', influence: 1.0, reason: 'Accessibility features' });
    }
  }
  
  // Remove duplicates (keep highest influence)
  const uniqueDocs = {};
  loadedDocs.forEach(item => {
    if (!uniqueDocs[item.doc] || uniqueDocs[item.doc].influence < item.influence) {
      uniqueDocs[item.doc] = item;
    }
  });
  loadedDocs = Object.values(uniqueDocs);
  
  // Sort by influence (highest first)
  loadedDocs.sort((a, b) => b.influence - a.influence);
}

function getStyleInfluence(style) {
  const influences = {
    photorealistic: { realism: 1.0, material: 1.0, edge: 1.0, technique: 0.0, color: 0.7 },
    stylized_realistic: { realism: 0.7, material: 0.8, edge: 0.8, technique: 0.3, color: 0.8 },
    painterly_impressionist: { realism: 0.3, material: 0.4, edge: 0.2, technique: 0.9, color: 1.0 },
    painterly_expressionist: { realism: 0.2, material: 0.3, edge: 0.1, technique: 1.0, color: 1.0 },
    abstract_geometric: { realism: 0.0, material: 0.0, edge: 0.9, technique: 0.5, color: 0.9 },
    abstract_organic: { realism: 0.0, material: 0.0, edge: 0.3, technique: 0.7, color: 1.0 },
    minimalist: { realism: 0.1, material: 0.1, edge: 1.0, technique: 0.2, color: 0.5 },
    maximalist: { realism: 0.8, material: 0.9, edge: 0.9, technique: 0.8, color: 1.0 }
  };
  
  return influences[style] || { realism: 0.5, material: 0.5, edge: 0.5, technique: 0.5, color: 0.5 };
}

function displayDocLoading() {
  console.log('\n' + '📚 '.repeat(30));
  console.log('  BIBLE DOCUMENT AUTO-LOADING');
  console.log('📚 '.repeat(30) + '\n');
  
  console.log('LOADED DOCUMENTS:');
  loadedDocs.forEach((item, idx) => {
    const influenceBar = '█'.repeat(Math.floor(item.influence * 10)) + '░'.repeat(10 - Math.floor(item.influence * 10));
    console.log(`  ${idx + 1}. ${item.doc.padEnd(30)} [${influenceBar}] ${item.influence.toFixed(1)} - ${item.reason}`);
  });
  
  if (skippedDocs.length > 0) {
    console.log('\nSKIPPED DOCUMENTS:');
    skippedDocs.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.doc.padEnd(30)} - ${item.reason}`);
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ============================================================================
// FORBIDDEN RULES
// ============================================================================

function evaluateForbiddenRules() {
  applicableForbiddenRules = [];
  
  Object.keys(FORBIDDEN_RULES).forEach(ruleName => {
    const rule = FORBIDDEN_RULES[ruleName];
    if (rule.condition(answers)) {
      applicableForbiddenRules.push({
        name: ruleName,
        forbidden: rule.forbidden,
        required: rule.required,
        reason: rule.reason,
        max_threshold: rule.max_noise_threshold
      });
    }
  });
}

function displayForbiddenRules() {
  if (applicableForbiddenRules.length === 0) {
    console.log('\n✅ No forbidden rules apply - standard constraints only.\n');
    return;
  }
  
  console.log('\n' + '🚫 '.repeat(30));
  console.log('  FORBIDDEN RULES (ACTIVE CONSTRAINTS)');
  console.log('🚫 '.repeat(30) + '\n');
  
  applicableForbiddenRules.forEach((rule, idx) => {
    console.log(`${idx + 1}. ${rule.name.toUpperCase()}`);
    console.log(`   Reason: ${rule.reason}`);
    console.log(`   Forbidden: ${rule.forbidden.join(', ')}`);
    console.log(`   Required: ${rule.required.join(', ')}`);
    if (rule.max_threshold) {
      console.log(`   Max Threshold: ${rule.max_threshold}`);
    }
    console.log('');
  });
  
  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// PLANNING DOC GENERATION
// ============================================================================

function generatePlanningDoc() {
  const timestamp = new Date().toISOString().split('T')[0];
  const projectName = `project-${timestamp}`;
  
  let doc = '';
  
  // Header
  doc += `# Planning Document: ${projectName}\n`;
  doc += `**Generated:** ${timestamp}\n`;
  doc += `**Tool:** DECISION_GRAPH v1.1 Interrogation\n\n`;
  doc += `---\n\n`;
  
  // Scene Interrogation
  doc += `## 1. Scene Interrogation (Q0-Q9)\n\n`;
  doc += `### Critical First Step: Q0 - Task Type\n`;
  doc += `**Answer:** ${answers.task_type}\n`;
  doc += `**Impact:** ${getTaskTypeImpact(answers.task_type)}\n\n`;
  
  doc += `### Scene Properties\n\n`;
  Object.keys(answers).forEach(key => {
    if (key !== 'task_type' && key !== 'readability_required') {
      const value = Array.isArray(answers[key]) ? answers[key].join(', ') : answers[key];
      doc += `- **${key}:** ${value}\n`;
    }
  });
  doc += `\n`;
  
  // Conflicts
  if (conflicts.length > 0) {
    doc += `## 2. Conflict Resolution\n\n`;
    conflicts.forEach((conflict, idx) => {
      doc += `### Conflict ${idx + 1}: ${conflict.properties.join(' vs ')}\n`;
      doc += `- **Winner:** ${conflict.winner} (Priority: ${RULE_PRIORITY[conflict.winner]})\n`;
      doc += `- **Resolution:** ${conflict.resolution}\n`;
      doc += `- **Impact:** ${conflict.impact}\n\n`;
    });
  } else {
    doc += `## 2. Conflict Resolution\n\n`;
    doc += `✅ No conflicts detected - properties are compatible.\n\n`;
  }
  
  // Bible Docs
  doc += `## 3. Bible Document Loading\n\n`;
  doc += `### Load (with influence weights):\n\n`;
  loadedDocs.forEach(item => {
    doc += `- **${item.doc}** (influence: ${item.influence.toFixed(1)}) - ${item.reason}\n`;
  });
  doc += `\n`;
  
  if (skippedDocs.length > 0) {
    doc += `### Skip:\n\n`;
    skippedDocs.forEach(item => {
      doc += `- **${item.doc}** - ${item.reason}\n`;
    });
    doc += `\n`;
  }
  
  // Forbidden Rules
  doc += `## 4. Forbidden Rules (Active Constraints)\n\n`;
  if (applicableForbiddenRules.length > 0) {
    applicableForbiddenRules.forEach(rule => {
      doc += `### ${rule.name.toUpperCase()}\n`;
      doc += `**Reason:** ${rule.reason}\n\n`;
      doc += `**Forbidden:**\n`;
      rule.forbidden.forEach(item => doc += `- ${item}\n`);
      doc += `\n**Required:**\n`;
      rule.required.forEach(item => doc += `- ${item}\n`);
      if (rule.max_threshold) {
        doc += `\n**Max Threshold:** ${rule.max_threshold}\n`;
      }
      doc += `\n`;
    });
  } else {
    doc += `✅ No forbidden rules apply - standard constraints only.\n\n`;
  }
  
  // Implementation Notes
  doc += `## 5. Implementation Notes\n\n`;
  doc += getImplementationNotes();
  doc += `\n`;
  
  // Outcome Log Template
  doc += `## 6. Outcome Log (Complete After Implementation)\n\n`;
  doc += `\`\`\`json\n`;
  doc += JSON.stringify(generateOutcomeLogTemplate(), null, 2);
  doc += `\n\`\`\`\n\n`;
  
  doc += `---\n\n`;
  doc += `**End of Planning Document**\n`;
  doc += `**Next Step:** Implement according to loaded Bible docs and forbidden rules.\n`;
  
  return doc;
}

function getTaskTypeImpact(taskType) {
  const impacts = {
    new: 'Building from scratch. Load full technical stack. Focus on architecture and patterns.',
    reskin: 'PRESERVE GAME LOGIC. Only modify rendering layer. Test that gameplay is unchanged.',
    extend: 'Add features to existing system. Maintain consistency with current patterns.',
    fix: 'Correct issues. Minimize changes. Focus on root cause, not symptoms.'
  };
  return impacts[taskType] || 'Unknown task type';
}

function getImplementationNotes() {
  let notes = '';
  
  // Task-specific notes
  if (answers.task_type === 'reskin') {
    notes += `### Reskin-Specific Rules:\n`;
    notes += `- DO NOT modify game logic, collision, input handling\n`;
    notes += `- DO modify: colors, shapes, visual effects only\n`;
    notes += `- TEST: Verify gameplay identical to original\n`;
    notes += `- PRESERVE: Silhouettes, readability, hitboxes\n\n`;
  }
  
  // Style-specific notes
  if (answers.style.includes('painterly')) {
    notes += `### Painterly Style Notes:\n`;
    notes += `- Use visible brushwork (context.stroke() with variations)\n`;
    notes += `- Avoid smooth gradients (use layered color patches)\n`;
    notes += `- Apply texture deliberately (not random noise)\n`;
    notes += `- Reference: CLASSICAL_TECHNIQUES.md Section III (Brushwork)\n\n`;
  }
  
  // Age-specific notes
  if (answers.age > 50) {
    notes += `### Degradation Notes:\n`;
    notes += `- Origin form: ${answers.origin_form || 'not specified'}\n`;
    notes += `- Apply weathering according to age (${answers.age}/100)\n`;
    notes += `- Use environment forces (${answers.environment})\n`;
    notes += `- Reference: REALISM_DEGRADATION.md Section ${getDegradationSection()}\n\n`;
  }
  
  // Performance notes
  if (answers.special_requirements && answers.special_requirements.includes('performance_critical')) {
    notes += `### Performance Notes:\n`;
    notes += `- Pre-calculate complex shapes\n`;
    notes += `- Cache repeated patterns\n`;
    notes += `- Profile draw calls (aim for <16ms/frame)\n`;
    notes += `- Reference: DEBUG_QUALITY.md Section II\n\n`;
  }
  
  if (!notes) {
    notes = `No special implementation notes. Follow standard workflow from loaded Bible docs.\n\n`;
  }
  
  return notes;
}

function getDegradationSection() {
  if (answers.origin_form === 'perfect_geometric') return 'IV (Geometric Forms)';
  if (answers.origin_form === 'crafted_architectural') return 'V (Architectural)';
  if (answers.origin_form === 'organic_natural') return 'VI (Organic)';
  return 'III (General Principles)';
}

function generateOutcomeLogTemplate() {
  return {
    project_id: `project-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    decisions: answers,
    applied_rules: [],
    loaded_docs: loadedDocs.map(d => d.doc),
    skipped_docs: skippedDocs.map(d => d.doc),
    conflicts_resolved: conflicts.map(c => ({
      properties: c.properties,
      winner: c.winner,
      resolution: c.resolution
    })),
    violations: [],
    result_quality: {
      visual_fidelity: null,
      performance_fps: null,
      code_quality: null,
      met_requirements: null
    },
    result_notes: [],
    keep_for_future: [],
    avoid_for_future: [],
    time_metrics: {
      planning_minutes: null,
      implementation_minutes: null,
      debugging_minutes: null,
      total_minutes: null
    }
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    // Run interrogation
    await runInterrogation();
    
    // Analyze results
    console.log('\n🔍 Analyzing answers...\n');
    detectConflicts();
    determineDocLoading();
    evaluateForbiddenRules();
    
    // Display analysis
    displayConflicts();
    displayDocLoading();
    displayForbiddenRules();
    
    // Generate planning doc
    console.log('📝 Generating planning document...\n');
    const planningDoc = generatePlanningDoc();
    
    // Save to file
    const outputPath = path.join(process.cwd(), `PLANNING-${new Date().toISOString().split('T')[0]}.md`);
    fs.writeFileSync(outputPath, planningDoc);
    
    console.log('\n' + '✅ '.repeat(30));
    console.log(`  SUCCESS! Planning document generated:`);
    console.log(`  ${outputPath}`);
    console.log('✅ '.repeat(30) + '\n');
    
    // Summary
    console.log('Summary:');
    console.log(`  - Questions answered: ${Object.keys(answers).length}`);
    console.log(`  - Conflicts detected: ${conflicts.length}`);
    console.log(`  - Docs to load: ${loadedDocs.length}`);
    console.log(`  - Docs skipped: ${skippedDocs.length}`);
    console.log(`  - Forbidden rules active: ${applicableForbiddenRules.length}`);
    console.log(`  - Document length: ${planningDoc.split('\n').length} lines`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runInterrogation,
  detectConflicts,
  determineDocLoading,
  evaluateForbiddenRules,
  generatePlanningDoc
};
