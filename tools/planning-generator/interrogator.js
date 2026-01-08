#!/usr/bin/env node

/**
 * PLANNING DOC GENERATOR - Interactive Interrogation Script
 * 
 * Purpose: Automate Q0-Q9 workflow with v1.1 features
 * - Conflict resolution via priority system
 * - Influence weights (0.0-1.0)
 * - Origin form (Q2.5) for degradation
 * - Forbidden rules auto-population
 * - Outcome log template generation
 * 
 * Usage: node interrogator.js
 * Output: Generates PLANNING.md in current directory
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION DATA (from DECISION_GRAPH.md v1.1)
// ============================================================================

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

const AGE_MAPPINGS = {
    modern: {
        range: [0, 50],
        label: 'Modern (0-50 years)',
        degradation_multiplier: 0,
        required_techniques: [],
        forbidden_techniques: ['weathering', 'degradation', 'erosion', 'moss_growth', 'cracks'],
        docs_load: []
    },
    young: {
        range: [50, 200],
        label: 'Young (50-200 years)',
        degradation_multiplier: 0.3,
        required_techniques: ['subtle_wear', 'light_discoloration'],
        forbidden_techniques: ['heavy_weathering', 'structural_damage'],
        docs_load: [{ doc: '24-REALISM_DEGRADATION', sections: 'I-IV only', influence: 0.5 }]
    },
    mature: {
        range: [200, 500],
        label: 'Mature (200-500 years)',
        degradation_multiplier: 0.7,
        required_techniques: ['edge_degradation', 'surface_variation', 'visible_aging'],
        forbidden_techniques: ['perfect_symmetry', 'uniform_surfaces'],
        docs_load: [{ doc: '24-REALISM_DEGRADATION', sections: 'I-VII', influence: 0.8 }]
    },
    ancient: {
        range: [500, 1000],
        label: 'Ancient (500-1000 years)',
        degradation_multiplier: 1.5,
        required_techniques: ['heavy_degradation', 'asymmetry_enforcement', 'edge_breaking'],
        forbidden_techniques: ['perfect_geometry', 'straight_lines', 'clean_edges', 'any_symmetry'],
        docs_load: [{ doc: '24-REALISM_DEGRADATION', sections: 'All sections', influence: 1.0 }]
    },
    ruin: {
        range: [1000, Infinity],
        label: 'Ruin (1000+ years)',
        degradation_multiplier: 2.5,
        required_techniques: ['structural_collapse', 'vegetation_overgrowth', 'extreme_erosion'],
        forbidden_techniques: ['any_perfection', 'intact_structures', 'clean_anything'],
        docs_load: [{ doc: '24-REALISM_DEGRADATION', sections: 'All + emphasis VII', influence: 1.0 }]
    }
};

const STYLE_MAPPINGS = {
    photorealistic: {
        realism_range: [90, 100],
        label: 'Photorealistic (90-100% realism)',
        required_techniques: ['accurate_materials', 'physical_lighting', 'surface_detail'],
        forbidden_techniques: ['visible_brushstrokes', 'broken_color', 'abstraction'],
        docs_load: [
            { doc: '13-MATERIAL_LOGIC', sections: 'All', influence: 1.0 },
            { doc: '21-CLASSICAL_TECHNIQUES', sections: 'Chiaroscuro, Atmospheric', influence: 0.9 },
            { doc: '24-REALISM_DEGRADATION', sections: 'If age > 50', influence: 1.0 }
        ]
    },
    stylized_realistic: {
        realism_range: [60, 90],
        label: 'Stylized Realistic (60-90% realism)',
        required_techniques: ['simplified_materials', 'stylized_lighting', 'suggested_detail'],
        forbidden_techniques: ['perfect_photorealism', 'extreme_abstraction'],
        docs_load: [
            { doc: '20-STYLES_MOVEMENTS', sections: 'Stylization spectrum', influence: 0.8 },
            { doc: '21-CLASSICAL_TECHNIQUES', sections: 'Selective', influence: 0.7 },
            { doc: '19-COLOR_HARMONY', sections: 'All', influence: 0.8 }
        ]
    },
    painterly_impressionist: {
        realism_range: [30, 60],
        label: 'Painterly/Impressionist (30-60% realism)',
        required_techniques: ['broken_color', 'visible_texture', 'loose_edges', 'optical_mixing'],
        forbidden_techniques: ['smooth_gradients', 'perfect_geometry', 'crisp_edges', 'uniform_surfaces'],
        docs_load: [
            { doc: '20-STYLES_MOVEMENTS', sections: 'Impressionism', influence: 0.9 },
            { doc: '21-CLASSICAL_TECHNIQUES', sections: 'Impasto, Sfumato', influence: 0.7 },
            { doc: '19-COLOR_HARMONY', sections: 'All', influence: 0.8 },
            { doc: '24-REALISM_DEGRADATION', sections: 'If age > 50', influence: 0.3 }
        ]
    },
    abstract_minimal: {
        realism_range: [0, 30],
        label: 'Abstract/Minimal (0-30% realism)',
        required_techniques: ['simplified_forms', 'essential_shapes', 'color_as_primary'],
        forbidden_techniques: ['realistic_materials', 'weathering', 'photorealistic_anything', 'perspective_accuracy'],
        docs_load: [
            { doc: '20-STYLES_MOVEMENTS', sections: 'Abstraction', influence: 0.9 },
            { doc: '19-COLOR_HARMONY', sections: 'All', influence: 0.9 },
            { doc: '18-COMPOSITION_THEORY', sections: 'All', influence: 0.8 }
        ],
        docs_skip: ['24-REALISM_DEGRADATION', '13-MATERIAL_LOGIC', '21-CLASSICAL_TECHNIQUES (most)']
    }
};

const ENVIRONMENT_MULTIPLIERS = {
    arid: { multiplier: 0.7, label: 'Arid (×0.7 degradation)' },
    temperate: { multiplier: 1.0, label: 'Temperate (×1.0 degradation)' },
    humid: { multiplier: 1.5, label: 'Humid (×1.5 degradation)' },
    volcanic: { multiplier: 2.5, label: 'Volcanic (×2.5 degradation)' },
    underwater: { multiplier: 2.0, label: 'Underwater (×2.0 degradation)' },
    frozen: { multiplier: 0.5, label: 'Frozen (×0.5 degradation)' }
};

const EXPOSURE_MULTIPLIERS = {
    interior: { multiplier: 0.5, label: 'Interior (×0.5 weathering)' },
    sheltered: { multiplier: 0.3, label: 'Sheltered (×0.3 weathering)' },
    exterior: { multiplier: 1.5, label: 'Exterior (×1.5 weathering)' },
    exposed: { multiplier: 2.0, label: 'Exposed (×2.0 weathering)' }
};

const ORIGIN_FORMS = {
    perfect_geometric: {
        label: 'Perfect geometric primitive (cube, sphere, cylinder, column)',
        examples: ['Column shaft', 'Cubic altar', 'Spherical sundial'],
        degradation_rules: [
            'vertical_cracks_offset',
            'silhouette_noise_increases_downward',
            'base_erosion_heaviest',
            'top_weathering_lighter'
        ]
    },
    crafted_architectural: {
        label: 'Crafted architectural element (arch, wall, statue, temple)',
        examples: ['Stone wall', 'Marble statue', 'Temple facade'],
        degradation_rules: [
            'block_edges_round_first',
            'mortar_degrades_faster_than_stone',
            'vegetation_in_gaps',
            'silhouette_remains_readable'
        ]
    },
    organic_natural: {
        label: 'Organic natural form (tree, rock, mountain, plant)',
        examples: ['Tree trunk', 'Boulder', 'Mountain face'],
        degradation_rules: [
            'asymmetry_is_natural',
            'bark_texture_follows_growth',
            'no_geometric_degradation',
            'irregularity_expected'
        ]
    },
    composite: {
        label: 'Composite structure (building, bridge, monument)',
        examples: ['Multi-material building', 'Stone bridge', 'Monument'],
        degradation_rules: [
            'different_materials_degrade_differently',
            'joints_fail_first',
            'structural_stress_visible',
            'layered_erosion_patterns'
        ]
    }
};

const FORBIDDEN_RULES = {
    modern_scene: {
        condition: 'age < 50 years',
        forbidden: ['weathering_techniques', 'degradation_states', 'moss_growth', 'structural_damage'],
        reason: 'Modern objects cannot show centuries of aging'
    },
    abstract_scene: {
        condition: 'realism < 30%',
        forbidden: ['photorealistic_materials', 'weathering_systems', 'physical_accuracy', 'material_logic'],
        reason: 'Abstract art prioritizes form/color over realism'
    },
    impressionist_style: {
        condition: 'style == "painterly_impressionist"',
        forbidden: ['smooth_gradients', 'perfect_geometry', 'crisp_edges', 'createLinearGradient', 'createRadialGradient (smooth)'],
        required: ['broken_color', 'visible_brushstrokes', 'optical_mixing', 'loose_edges'],
        reason: 'Impressionism uses broken color, not smooth blending'
    },
    ancient_structure: {
        condition: 'age > 500 years',
        forbidden: ['perfect_symmetry', 'straight_lines', 'uniform_surfaces', 'clean_edges', 'pristine_appearance'],
        required: ['asymmetry_enforcement', 'edge_degradation', 'surface_variation', 'visible_aging'],
        reason: '500+ year old structures cannot be geometrically perfect'
    },
    reskin_task: {
        condition: 'task_type == "reskin"',
        forbidden: ['modify_game_logic', 'change_physics', 'alter_ai', 'rebuild_input', 'change_gameplay'],
        required: ['preserve_all_logic', 'modify_rendering_only', 'maintain_functionality'],
        reason: 'Reskin means visual changes only, preserve all behavior'
    },
    silhouette_protection: {
        condition: 'readability_required OR game_object',
        forbidden: ['over_noising_primary_shape', 'destroying_recognizable_form', 'excessive_edge_breaking'],
        required: ['primary_forms_remain_legible', 'silhouette_readable_at_distance'],
        reason: 'Win realism without losing design - primary forms must remain legible',
        max_noise_threshold: 0.6
    }
};

// ============================================================================
// INTERACTIVE INTERROGATION
// ============================================================================

class Interrogator {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.answers = {};
        this.loaded_docs = [];
        this.skipped_docs = [];
        this.forbidden_rules = [];
        this.required_techniques = [];
        this.conflicts = [];
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async start() {
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║   PLANNING DOC GENERATOR - Interactive Interrogation v1.1   ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
        console.log('This will ask Q0-Q9 + Q2.5 (conditional) to generate your planning doc.\n');

        try {
            // Q0: Task Type (CRITICAL - ALWAYS FIRST)
            await this.askQ0();
            
            // Q1: Style Aesthetic
            await this.askQ1();
            
            // Q2: Scene Elements
            await this.askQ2();
            
            // Q2.5: Origin Form (conditional)
            await this.askQ2_5();
            
            // Q3: Age & Material Properties
            await this.askQ3();
            
            // Q4: Material Types
            await this.askQ4();
            
            // Q5: Environment & Exposure
            await this.askQ5();
            
            // Q6: Color Requirements
            await this.askQ6();
            
            // Q7: Composition Requirements
            await this.askQ7();
            
            // Q8: Depth & Perspective
            await this.askQ8();
            
            // Q9: Lighting & Atmosphere
            await this.askQ9();
            
            // Process answers and generate planning doc
            this.processAnswers();
            this.detectConflicts();
            this.generatePlanningDoc();
            
        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async askQ0() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚨 Q0: TASK TYPE (CRITICAL - Asked First)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Options:');
        console.log('  A. New project (build from scratch)');
        console.log('  B. Reskin existing project (modify rendering only)');
        console.log('  C. Extend existing project (add features)');
        console.log('  D. Fix/debug existing project (repair broken functionality)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D): ');
        
        const taskMap = {
            'A': 'new',
            'B': 'reskin',
            'C': 'extend',
            'D': 'fix'
        };
        
        this.answers.Q0_task_type = taskMap[answer.toUpperCase()] || 'new';
        
        console.log(`\n✓ Task Type: ${this.answers.Q0_task_type}`);
        
        if (this.answers.Q0_task_type === 'reskin') {
            console.log('\n⚠️  RESKIN MODE:');
            console.log('    - PRESERVE: game logic, physics, AI, input, audio');
            console.log('    - MODIFY: render() and drawing helpers ONLY');
            console.log('    - VALIDATE: gameplay identical to original');
        }
    }

    async askQ1() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎨 Q1: STYLE AESTHETIC');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Options:');
        console.log('  A. Photorealistic (90-100% realism)');
        console.log('  B. Stylized Realistic (60-90% realism)');
        console.log('  C. Painterly/Impressionist (30-60% realism)');
        console.log('  D. Abstract/Minimal (0-30% realism)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D): ');
        
        const styleMap = {
            'A': 'photorealistic',
            'B': 'stylized_realistic',
            'C': 'painterly_impressionist',
            'D': 'abstract_minimal'
        };
        
        this.answers.Q1_style = styleMap[answer.toUpperCase()] || 'stylized_realistic';
        
        const styleData = STYLE_MAPPINGS[this.answers.Q1_style];
        console.log(`\n✓ Style: ${styleData.label}`);
        console.log(`  Realism Range: ${styleData.realism_range[0]}-${styleData.realism_range[1]}%`);
    }

    async askQ2() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔷 Q2: SCENE ELEMENTS & COMPLEXITY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const numObjects = await this.question('Number of objects (<5 simple, 5-20 medium, >20 complex): ');
        
        console.log('\nGeometric complexity:');
        console.log('  A. Basic shapes (rectangles, circles)');
        console.log('  B. Moderate (curved forms, irregular shapes)');
        console.log('  C. Complex (organic forms, detailed structures)\n');
        
        const complexity = await this.question('Enter choice (A/B/C): ');
        
        const complexityMap = {
            'A': 'simple',
            'B': 'medium',
            'C': 'complex'
        };
        
        this.answers.Q2_num_objects = parseInt(numObjects) || 5;
        this.answers.Q2_complexity = complexityMap[complexity.toUpperCase()] || 'medium';
        
        console.log(`\n✓ Scene Complexity: ${this.answers.Q2_num_objects} objects, ${this.answers.Q2_complexity} geometry`);
    }

    async askQ2_5() {
        // Only ask if age will be > 50 AND style is realistic
        // We'll check this after Q3, so for now we'll ask conditionally
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏛️  Q2.5: ORIGIN FORM (for degradation baseline)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Will be asked after Q3 if age > 50 AND realistic style.\n');
        
        // Placeholder - actual question happens after Q3
        this.answers.Q2_5_origin_form = null;
    }

    async askQ3() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⏳ Q3: AGE & MATERIAL PROPERTIES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Options:');
        console.log('  A. Modern (0-50 years)');
        console.log('  B. Young (50-200 years)');
        console.log('  C. Mature (200-500 years)');
        console.log('  D. Ancient (500-1000 years)');
        console.log('  E. Ruin (1000+ years)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D/E): ');
        
        const ageMap = {
            'A': 'modern',
            'B': 'young',
            'C': 'mature',
            'D': 'ancient',
            'E': 'ruin'
        };
        
        this.answers.Q3_age = ageMap[answer.toUpperCase()] || 'modern';
        
        const ageData = AGE_MAPPINGS[this.answers.Q3_age];
        console.log(`\n✓ Age: ${ageData.label}`);
        console.log(`  Degradation Multiplier: ×${ageData.degradation_multiplier}`);
        
        // Now check if we need Q2.5
        const isRealistic = STYLE_MAPPINGS[this.answers.Q1_style].realism_range[0] >= 30;
        const needsOriginForm = ageData.range[0] > 50 && isRealistic;
        
        if (needsOriginForm) {
            await this.askQ2_5_actual();
        } else {
            console.log('\n  → Skipping Q2.5 (origin form): age < 50 OR not realistic style');
        }
    }

    async askQ2_5_actual() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏛️  Q2.5: ORIGIN FORM (Degradation Baseline)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('What was the object originally (before degradation)?');
        console.log('\nOptions:');
        console.log('  A. Perfect geometric primitive (cube, sphere, cylinder, column)');
        console.log('  B. Crafted architectural element (arch, wall, statue, temple)');
        console.log('  C. Organic natural form (tree, rock, mountain, plant)');
        console.log('  D. Composite structure (building, bridge, monument)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D): ');
        
        const originMap = {
            'A': 'perfect_geometric',
            'B': 'crafted_architectural',
            'C': 'organic_natural',
            'D': 'composite'
        };
        
        this.answers.Q2_5_origin_form = originMap[answer.toUpperCase()] || 'crafted_architectural';
        
        const originData = ORIGIN_FORMS[this.answers.Q2_5_origin_form];
        console.log(`\n✓ Origin Form: ${originData.label}`);
        console.log(`  Examples: ${originData.examples.join(', ')}`);
    }

    async askQ4() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🪨 Q4: MATERIAL TYPES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Options:');
        console.log('  A. None (abstract/stylized)');
        console.log('  B. Organic (wood, vegetation, fabric)');
        console.log('  C. Inorganic (stone, metal, glass)');
        console.log('  D. Mixed (multiple materials)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D): ');
        
        const materialMap = {
            'A': 'none',
            'B': 'organic',
            'C': 'inorganic',
            'D': 'mixed'
        };
        
        this.answers.Q4_material = materialMap[answer.toUpperCase()] || 'none';
        
        console.log(`\n✓ Material: ${this.answers.Q4_material}`);
    }

    async askQ5() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🌍 Q5: ENVIRONMENT & EXPOSURE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Environment type:');
        console.log('  A. Arid (×0.7 degradation)');
        console.log('  B. Temperate (×1.0 degradation)');
        console.log('  C. Humid (×1.5 degradation)');
        console.log('  D. Volcanic (×2.5 degradation)');
        console.log('  E. Underwater (×2.0 degradation)');
        console.log('  F. Frozen (×0.5 degradation)\n');
        
        const env = await this.question('Enter choice (A/B/C/D/E/F): ');
        
        const envMap = {
            'A': 'arid',
            'B': 'temperate',
            'C': 'humid',
            'D': 'volcanic',
            'E': 'underwater',
            'F': 'frozen'
        };
        
        this.answers.Q5_environment = envMap[env.toUpperCase()] || 'temperate';
        
        console.log('\nExposure level:');
        console.log('  A. Interior (×0.5 weathering)');
        console.log('  B. Sheltered (×0.3 weathering)');
        console.log('  C. Exterior (×1.5 weathering)');
        console.log('  D. Exposed (×2.0 weathering)\n');
        
        const exp = await this.question('Enter choice (A/B/C/D): ');
        
        const expMap = {
            'A': 'interior',
            'B': 'sheltered',
            'C': 'exterior',
            'D': 'exposed'
        };
        
        this.answers.Q5_exposure = expMap[exp.toUpperCase()] || 'exterior';
        
        const envData = ENVIRONMENT_MULTIPLIERS[this.answers.Q5_environment];
        const expData = EXPOSURE_MULTIPLIERS[this.answers.Q5_exposure];
        
        console.log(`\n✓ Environment: ${envData.label}`);
        console.log(`✓ Exposure: ${expData.label}`);
    }

    async askQ6() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎨 Q6: COLOR REQUIREMENTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const needsColor = await this.question('Does scene require specific color scheme? (y/n): ');
        
        if (needsColor.toLowerCase() === 'y') {
            console.log('\nColor harmony type:');
            console.log('  A. Complementary');
            console.log('  B. Analogous');
            console.log('  C. Triadic');
            console.log('  D. Split-complementary');
            console.log('  E. Monochromatic');
            console.log('  F. Custom palette\n');
            
            const harmony = await this.question('Enter choice (A/B/C/D/E/F): ');
            
            const harmonyMap = {
                'A': 'complementary',
                'B': 'analogous',
                'C': 'triadic',
                'D': 'split_complementary',
                'E': 'monochromatic',
                'F': 'custom'
            };
            
            this.answers.Q6_color = harmonyMap[harmony.toUpperCase()] || 'complementary';
        } else {
            this.answers.Q6_color = 'none';
        }
        
        console.log(`\n✓ Color: ${this.answers.Q6_color}`);
    }

    async askQ7() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📐 Q7: COMPOSITION REQUIREMENTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const needsComp = await this.question('Does scene require specific composition? (y/n): ');
        
        if (needsComp.toLowerCase() === 'y') {
            console.log('\nFocal point:');
            console.log('  A. Rule of thirds');
            console.log('  B. Golden ratio');
            console.log('  C. Centered');
            console.log('  D. Dynamic (off-center)\n');
            
            const focal = await this.question('Enter choice (A/B/C/D): ');
            
            const focalMap = {
                'A': 'rule_of_thirds',
                'B': 'golden_ratio',
                'C': 'centered',
                'D': 'dynamic'
            };
            
            this.answers.Q7_composition = focalMap[focal.toUpperCase()] || 'rule_of_thirds';
        } else {
            this.answers.Q7_composition = 'none';
        }
        
        console.log(`\n✓ Composition: ${this.answers.Q7_composition}`);
    }

    async askQ8() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔭 Q8: DEPTH & PERSPECTIVE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Options:');
        console.log('  A. None (flat 2D, UI elements)');
        console.log('  B. Minimal (slight atmospheric)');
        console.log('  C. Moderate (clear depth layers)');
        console.log('  D. Strong (dramatic perspective)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D): ');
        
        const depthMap = {
            'A': 'none',
            'B': 'minimal',
            'C': 'moderate',
            'D': 'strong'
        };
        
        this.answers.Q8_depth = depthMap[answer.toUpperCase()] || 'none';
        
        console.log(`\n✓ Depth: ${this.answers.Q8_depth}`);
    }

    async askQ9() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💡 Q9: LIGHTING & ATMOSPHERE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Options:');
        console.log('  A. None (flat lighting)');
        console.log('  B. Basic (simple light/shadow)');
        console.log('  C. Dramatic (chiaroscuro, strong contrast)');
        console.log('  D. Atmospheric (environmental effects)\n');
        
        const answer = await this.question('Enter choice (A/B/C/D): ');
        
        const lightMap = {
            'A': 'none',
            'B': 'basic',
            'C': 'dramatic',
            'D': 'atmospheric'
        };
        
        this.answers.Q9_lighting = lightMap[answer.toUpperCase()] || 'basic';
        
        console.log(`\n✓ Lighting: ${this.answers.Q9_lighting}`);
    }

    processAnswers() {
        console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║              PROCESSING ANSWERS & LOADING DOCS               ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        // Load docs based on style
        const styleData = STYLE_MAPPINGS[this.answers.Q1_style];
        styleData.docs_load.forEach(doc => {
            this.loaded_docs.push(doc);
        });
        
        if (styleData.docs_skip) {
            styleData.docs_skip.forEach(doc => {
                this.skipped_docs.push({
                    doc: doc,
                    reason: `Style ${this.answers.Q1_style} doesn't require this`
                });
            });
        }

        // Load docs based on age
        const ageData = AGE_MAPPINGS[this.answers.Q3_age];
        if (ageData.docs_load.length > 0) {
            ageData.docs_load.forEach(doc => {
                this.loaded_docs.push(doc);
            });
        } else {
            this.skipped_docs.push({
                doc: '24-REALISM_DEGRADATION',
                reason: `Age ${this.answers.Q3_age} (${ageData.range[0]}-${ageData.range[1]} years) doesn't require degradation`
            });
        }

        // Load material docs
        if (this.answers.Q4_material !== 'none' && STYLE_MAPPINGS[this.answers.Q1_style].realism_range[0] >= 30) {
            this.loaded_docs.push({
                doc: '13-MATERIAL_LOGIC',
                sections: `${this.answers.Q4_material} materials`,
                influence: 0.9
            });
        }

        // Load color docs
        if (this.answers.Q6_color !== 'none') {
            this.loaded_docs.push({
                doc: '19-COLOR_HARMONY',
                sections: this.answers.Q6_color,
                influence: 0.8
            });
        }

        // Load composition docs
        if (this.answers.Q7_composition !== 'none') {
            this.loaded_docs.push({
                doc: '18-COMPOSITION_THEORY',
                sections: this.answers.Q7_composition,
                influence: 0.7
            });
        }

        // Load depth/perspective docs
        if (this.answers.Q8_depth !== 'none' && this.answers.Q8_depth !== 'minimal') {
            this.loaded_docs.push({
                doc: '21-CLASSICAL_TECHNIQUES',
                sections: 'Atmospheric Perspective',
                influence: 0.8
            });
        }

        // Load lighting docs
        if (this.answers.Q9_lighting === 'dramatic' || this.answers.Q9_lighting === 'atmospheric') {
            this.loaded_docs.push({
                doc: '21-CLASSICAL_TECHNIQUES',
                sections: 'Chiaroscuro',
                influence: 0.9
            });
        }

        // Populate forbidden rules
        this.populateForbiddenRules();

        // Populate required techniques
        this.required_techniques = styleData.required_techniques;
        if (ageData.required_techniques) {
            this.required_techniques.push(...ageData.required_techniques);
        }

        console.log('✓ Processing complete\n');
    }

    populateForbiddenRules() {
        // Check modern scene
        if (AGE_MAPPINGS[this.answers.Q3_age].range[0] < 50) {
            this.forbidden_rules.push(FORBIDDEN_RULES.modern_scene);
        }

        // Check abstract scene
        if (STYLE_MAPPINGS[this.answers.Q1_style].realism_range[0] < 30) {
            this.forbidden_rules.push(FORBIDDEN_RULES.abstract_scene);
        }

        // Check impressionist style
        if (this.answers.Q1_style === 'painterly_impressionist') {
            this.forbidden_rules.push(FORBIDDEN_RULES.impressionist_style);
        }

        // Check ancient structure
        if (AGE_MAPPINGS[this.answers.Q3_age].range[0] >= 500) {
            this.forbidden_rules.push(FORBIDDEN_RULES.ancient_structure);
        }

        // Check reskin task
        if (this.answers.Q0_task_type === 'reskin') {
            this.forbidden_rules.push(FORBIDDEN_RULES.reskin_task);
        }

        // Check silhouette protection (always for game objects)
        if (this.answers.Q0_task_type === 'reskin' || this.answers.Q0_task_type === 'extend') {
            this.forbidden_rules.push(FORBIDDEN_RULES.silhouette_protection);
        }
    }

    detectConflicts() {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                   CONFLICT DETECTION                         ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        // Example conflicts to check
        const potentialConflicts = [];

        // Conflict: Reskin + Ancient (wants to modify structure)
        if (this.answers.Q0_task_type === 'reskin' && this.answers.Q3_age === 'ancient') {
            potentialConflicts.push({
                rules: ['reskin_task (Priority 100)', 'ancient_structure (Priority 70)'],
                conflict: 'Reskin forbids logic changes, ancient requires asymmetry',
                resolution: 'Task type wins → Apply asymmetry to RENDERING only',
                winning_rule: 'reskin_task'
            });
        }

        // Conflict: Painterly + Underwater (heavy degradation)
        if (this.answers.Q1_style === 'painterly_impressionist' && this.answers.Q5_environment === 'underwater') {
            const envMult = ENVIRONMENT_MULTIPLIERS[this.answers.Q5_environment].multiplier;
            const styleInfluence = 0.3; // From DECISION_GRAPH
            const finalMult = Math.min(envMult * styleInfluence, 0.6);
            
            potentialConflicts.push({
                rules: ['painterly_style (Priority 80)', 'underwater_environment (Priority 60)'],
                conflict: 'Painterly suggests erosion (×0.3), underwater simulates it (×2.0)',
                resolution: `Style wins → Degradation influence = min(2.0 × 0.3, 0.6) = ${finalMult}`,
                winning_rule: 'painterly_style'
            });
        }

        this.conflicts = potentialConflicts;

        if (this.conflicts.length > 0) {
            console.log('⚠️  CONFLICTS DETECTED:\n');
            this.conflicts.forEach((c, i) => {
                console.log(`${i + 1}. ${c.conflict}`);
                console.log(`   Rules: ${c.rules.join(' vs ')}`);
                console.log(`   ✓ Resolution: ${c.resolution}\n`);
            });
        } else {
            console.log('✓ No conflicts detected\n');
        }
    }

    generatePlanningDoc() {
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║              GENERATING PLANNING DOC                         ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        const projectName = path.basename(process.cwd());
        
        let planningDoc = `# PLANNING.md - ${projectName}\n\n`;
        planningDoc += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
        planningDoc += `**Tool:** Planning Doc Generator v1.1\n\n`;
        planningDoc += `---\n\n`;
        
        // Section 1: Scene Interrogation Answers
        planningDoc += `## 🔍 SCENE INTERROGATION\n\n`;
        planningDoc += `### Q0: Task Type 🚨 CRITICAL\n`;
        planningDoc += `**Answer:** ${this.answers.Q0_task_type}\n\n`;
        
        if (this.answers.Q0_task_type === 'reskin') {
            planningDoc += `**Workflow:** RENDERING ONLY\n`;
            planningDoc += `- **PRESERVE:** game logic, physics, AI, input, audio\n`;
            planningDoc += `- **MODIFY:** render() and drawing helpers ONLY\n`;
            planningDoc += `- **VALIDATE:** gameplay identical to original\n\n`;
        }
        
        planningDoc += `### Q1: Style Aesthetic\n`;
        planningDoc += `**Answer:** ${this.answers.Q1_style}\n`;
        planningDoc += `**Realism Range:** ${STYLE_MAPPINGS[this.answers.Q1_style].realism_range[0]}-${STYLE_MAPPINGS[this.answers.Q1_style].realism_range[1]}%\n\n`;
        
        planningDoc += `### Q2: Scene Elements\n`;
        planningDoc += `**Objects:** ${this.answers.Q2_num_objects}\n`;
        planningDoc += `**Complexity:** ${this.answers.Q2_complexity}\n\n`;
        
        if (this.answers.Q2_5_origin_form) {
            planningDoc += `### Q2.5: Origin Form\n`;
            planningDoc += `**Answer:** ${this.answers.Q2_5_origin_form}\n`;
            const originData = ORIGIN_FORMS[this.answers.Q2_5_origin_form];
            planningDoc += `**Degradation Rules:**\n`;
            originData.degradation_rules.forEach(rule => {
                planningDoc += `- ${rule}\n`;
            });
            planningDoc += `\n`;
        }
        
        planningDoc += `### Q3: Age\n`;
        planningDoc += `**Answer:** ${this.answers.Q3_age}\n`;
        planningDoc += `**Range:** ${AGE_MAPPINGS[this.answers.Q3_age].label}\n`;
        planningDoc += `**Degradation Multiplier:** ×${AGE_MAPPINGS[this.answers.Q3_age].degradation_multiplier}\n\n`;
        
        planningDoc += `### Q4: Material\n`;
        planningDoc += `**Answer:** ${this.answers.Q4_material}\n\n`;
        
        planningDoc += `### Q5: Environment & Exposure\n`;
        planningDoc += `**Environment:** ${this.answers.Q5_environment} (×${ENVIRONMENT_MULTIPLIERS[this.answers.Q5_environment].multiplier})\n`;
        planningDoc += `**Exposure:** ${this.answers.Q5_exposure} (×${EXPOSURE_MULTIPLIERS[this.answers.Q5_exposure].multiplier})\n\n`;
        
        planningDoc += `### Q6: Color\n`;
        planningDoc += `**Answer:** ${this.answers.Q6_color}\n\n`;
        
        planningDoc += `### Q7: Composition\n`;
        planningDoc += `**Answer:** ${this.answers.Q7_composition}\n\n`;
        
        planningDoc += `### Q8: Depth\n`;
        planningDoc += `**Answer:** ${this.answers.Q8_depth}\n\n`;
        
        planningDoc += `### Q9: Lighting\n`;
        planningDoc += `**Answer:** ${this.answers.Q9_lighting}\n\n`;
        
        planningDoc += `---\n\n`;
        
        // Section 2: Conflict Resolution
        if (this.conflicts.length > 0) {
            planningDoc += `## ⚖️  CONFLICT RESOLUTION\n\n`;
            this.conflicts.forEach((c, i) => {
                planningDoc += `### Conflict ${i + 1}\n`;
                planningDoc += `**Rules:** ${c.rules.join(' vs ')}\n`;
                planningDoc += `**Issue:** ${c.conflict}\n`;
                planningDoc += `**✓ Resolution:** ${c.resolution}\n`;
                planningDoc += `**Winning Rule:** ${c.winning_rule} (higher priority)\n\n`;
            });
            planningDoc += `---\n\n`;
        }
        
        // Section 3: Loaded Docs
        planningDoc += `## 📚 AUTO-LOADED BIBLE DOCS\n\n`;
        this.loaded_docs.forEach(doc => {
            const docName = typeof doc === 'string' ? doc : doc.doc;
            const sections = typeof doc === 'object' ? doc.sections : 'All';
            const influence = typeof doc === 'object' ? doc.influence : 1.0;
            
            planningDoc += `### ${docName}\n`;
            planningDoc += `**Sections:** ${sections}\n`;
            planningDoc += `**Influence Weight:** ${influence} (${influence >= 0.9 ? 'Full application' : influence >= 0.7 ? 'Strong influence' : influence >= 0.5 ? 'Moderate influence' : 'Light suggestion'})\n\n`;
        });
        
        planningDoc += `---\n\n`;
        
        // Section 4: Skipped Docs
        if (this.skipped_docs.length > 0) {
            planningDoc += `## 🚫 SKIPPED DOCS\n\n`;
            this.skipped_docs.forEach(skip => {
                planningDoc += `- **${skip.doc}**\n`;
                planningDoc += `  Reason: ${skip.reason}\n\n`;
            });
            planningDoc += `---\n\n`;
        }
        
        // Section 5: Forbidden Rules
        planningDoc += `## 🚫 FORBIDDEN RULES\n\n`;
        this.forbidden_rules.forEach((rule, i) => {
            planningDoc += `### ${i + 1}. ${rule.condition}\n`;
            planningDoc += `**Reason:** ${rule.reason}\n\n`;
            planningDoc += `**Forbidden:**\n`;
            rule.forbidden.forEach(f => {
                planningDoc += `- ${f}\n`;
            });
            planningDoc += `\n`;
            
            if (rule.required) {
                planningDoc += `**Required:**\n`;
                rule.required.forEach(r => {
                    planningDoc += `- ${r}\n`;
                });
                planningDoc += `\n`;
            }
            
            if (rule.max_noise_threshold) {
                planningDoc += `**Max Noise Threshold:** ${rule.max_noise_threshold}\n\n`;
            }
        });
        
        planningDoc += `---\n\n`;
        
        // Section 6: Required Techniques
        planningDoc += `## ✅ REQUIRED TECHNIQUES\n\n`;
        this.required_techniques.forEach(tech => {
            planningDoc += `- ${tech}\n`;
        });
        
        planningDoc += `\n---\n\n`;
        
        // Section 7: Implementation Checklist
        planningDoc += `## 📋 IMPLEMENTATION CHECKLIST\n\n`;
        planningDoc += `- [ ] Task type workflow followed (${this.answers.Q0_task_type})\n`;
        planningDoc += `- [ ] All loaded docs referenced\n`;
        planningDoc += `- [ ] Forbidden rules not violated\n`;
        planningDoc += `- [ ] Required techniques applied\n`;
        planningDoc += `- [ ] Influence weights respected\n`;
        
        if (this.conflicts.length > 0) {
            planningDoc += `- [ ] Conflicts resolved per priority system\n`;
        }
        
        if (this.answers.Q2_5_origin_form) {
            planningDoc += `- [ ] Origin form degradation rules applied\n`;
        }
        
        planningDoc += `- [ ] Validation complete\n\n`;
        
        planningDoc += `---\n\n`;
        
        // Section 8: Outcome Log Template
        planningDoc += `## 📊 OUTCOME LOG (Fill after completion)\n\n`;
        planningDoc += `### Result Quality\n`;
        planningDoc += `- [ ] Goals achieved?\n`;
        planningDoc += `- [ ] Rules followed?\n`;
        planningDoc += `- [ ] No violations?\n`;
        planningDoc += `- [ ] Performance acceptable?\n\n`;
        
        planningDoc += `### Keep for Future\n`;
        planningDoc += `- \n\n`;
        
        planningDoc += `### Avoid for Future\n`;
        planningDoc += `- \n\n`;
        
        planningDoc += `### Time Spent\n`;
        planningDoc += `- **Interrogation:** ___ minutes\n`;
        planningDoc += `- **Planning:** ___ minutes\n`;
        planningDoc += `- **Implementation:** ___ minutes\n`;
        planningDoc += `- **Validation:** ___ minutes\n`;
        planningDoc += `- **Total:** ___ minutes\n\n`;
        
        planningDoc += `---\n\n`;
        planningDoc += `**Generated by Planning Doc Generator v1.1**\n`;
        planningDoc += `**Reference:** /docs/bible/DECISION_GRAPH.md\n`;
        
        // Write to file
        const outputPath = path.join(process.cwd(), 'PLANNING.md');
        fs.writeFileSync(outputPath, planningDoc);
        
        console.log(`✓ Planning doc generated: ${outputPath}`);
        console.log(`\n📄 Document size: ${planningDoc.length} characters (~${Math.ceil(planningDoc.length / 5)} words)`);
        console.log(`📚 Loaded docs: ${this.loaded_docs.length}`);
        console.log(`🚫 Forbidden rules: ${this.forbidden_rules.length}`);
        console.log(`✅ Required techniques: ${this.required_techniques.length}`);
        
        if (this.conflicts.length > 0) {
            console.log(`⚖️  Conflicts resolved: ${this.conflicts.length}`);
        }
        
        console.log('\n✅ PLANNING DOC GENERATION COMPLETE!\n');
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const interrogator = new Interrogator();
interrogator.start();
