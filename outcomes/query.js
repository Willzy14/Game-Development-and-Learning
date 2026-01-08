#!/usr/bin/env node

/**
 * Outcome Log Query Helper
 * Extract patterns and insights from outcome logs
 * 
 * Usage:
 *   const { queryOutcomes } = require('./query.js');
 *   const results = queryOutcomes({ task_type: 'reskin' });
 * 
 * Part of: DECISION_GRAPH v1.1 Learning Brain
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Query outcome logs with filters
 * @param {Object} filters - Key-value pairs to match (supports $gte, $lte, $exists)
 * @returns {Object} Query results with patterns and metrics
 */
function queryOutcomes(filters = {}) {
  const logs = loadAllLogs();
  const matching = filterLogs(logs, filters);
  
  return {
    matching_projects: matching,
    keep_patterns: aggregateKeepPatterns(matching),
    avoid_patterns: aggregateAvoidPatterns(matching),
    typical_time: calculateTypicalTime(matching),
    common_conflicts: aggregateConflicts(matching),
    common_violations: aggregateViolations(matching),
    count: matching.length
  };
}

/**
 * Load all outcome logs from /outcomes/ directory
 * @returns {Array} Array of outcome log objects
 */
function loadAllLogs() {
  const outcomesDir = path.join(__dirname);
  const files = fs.readdirSync(outcomesDir);
  
  const logs = [];
  
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'template.json') {
      try {
        const filePath = path.join(outcomesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const log = JSON.parse(content);
        logs.push(log);
      } catch (error) {
        console.error(`Error loading ${file}:`, error.message);
      }
    }
  }
  
  return logs;
}

/**
 * Filter logs based on criteria
 * @param {Array} logs - All outcome logs
 * @param {Object} filters - Filter criteria
 * @returns {Array} Matching logs
 */
function filterLogs(logs, filters) {
  return logs.filter(log => matchesFilters(log, filters));
}

/**
 * Check if log matches all filter criteria
 * @param {Object} log - Outcome log
 * @param {Object} filters - Filter criteria
 * @returns {Boolean} True if matches
 */
function matchesFilters(log, filters) {
  for (const [key, value] of Object.entries(filters)) {
    // Handle nested paths (e.g., decisions.task_type)
    const logValue = getNestedValue(log, key);
    
    // Handle special operators
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // $gte, $lte, $exists operators
      if (value.$gte !== undefined && logValue < value.$gte) return false;
      if (value.$lte !== undefined && logValue > value.$lte) return false;
      if (value.$exists !== undefined) {
        const exists = logValue !== undefined && logValue !== null;
        if (value.$exists !== exists) return false;
      }
    } else {
      // Direct comparison
      if (Array.isArray(logValue)) {
        // Check if array contains value
        if (!logValue.includes(value)) return false;
      } else if (logValue !== value) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to search
 * @param {String} path - Dot-notation path (e.g., "decisions.task_type")
 * @returns {*} Value at path or undefined
 */
function getNestedValue(obj, path) {
  // Check if path exists in decisions first (common case)
  if (obj.decisions && obj.decisions[path] !== undefined) {
    return obj.decisions[path];
  }
  
  // Otherwise navigate full path
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  
  return value;
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Aggregate "keep for future" patterns
 * @param {Array} logs - Matching logs
 * @returns {Array} Sorted patterns by frequency
 */
function aggregateKeepPatterns(logs) {
  const patternCounts = {};
  
  for (const log of logs) {
    if (log.keep_for_future && Array.isArray(log.keep_for_future)) {
      for (const pattern of log.keep_for_future) {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      }
    }
  }
  
  // Sort by frequency (most common first)
  return Object.entries(patternCounts)
    .map(([pattern, count]) => ({ pattern, count, frequency: count / logs.length }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Aggregate "avoid for future" patterns
 * @param {Array} logs - Matching logs
 * @returns {Array} Sorted patterns by frequency
 */
function aggregateAvoidPatterns(logs) {
  const patternCounts = {};
  
  for (const log of logs) {
    if (log.avoid_for_future && Array.isArray(log.avoid_for_future)) {
      for (const pattern of log.avoid_for_future) {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      }
    }
  }
  
  // Sort by frequency (most common first)
  return Object.entries(patternCounts)
    .map(([pattern, count]) => ({ pattern, count, frequency: count / logs.length }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate typical time metrics
 * @param {Array} logs - Matching logs
 * @returns {Object} Average time metrics
 */
function calculateTypicalTime(logs) {
  if (logs.length === 0) {
    return {
      planning_minutes: null,
      implementation_minutes: null,
      debugging_minutes: null,
      total_minutes: null,
      sample_size: 0
    };
  }
  
  const metrics = {
    planning: [],
    implementation: [],
    debugging: [],
    total: []
  };
  
  for (const log of logs) {
    if (log.time_metrics) {
      if (log.time_metrics.planning_minutes) metrics.planning.push(log.time_metrics.planning_minutes);
      if (log.time_metrics.implementation_minutes) metrics.implementation.push(log.time_metrics.implementation_minutes);
      if (log.time_metrics.debugging_minutes) metrics.debugging.push(log.time_metrics.debugging_minutes);
      if (log.time_metrics.total_minutes) metrics.total.push(log.time_metrics.total_minutes);
    }
  }
  
  return {
    planning_minutes: average(metrics.planning),
    implementation_minutes: average(metrics.implementation),
    debugging_minutes: average(metrics.debugging),
    total_minutes: average(metrics.total),
    sample_size: logs.length
  };
}

/**
 * Aggregate common conflicts
 * @param {Array} logs - Matching logs
 * @returns {Array} Conflict patterns with frequency
 */
function aggregateConflicts(logs) {
  const conflictCounts = {};
  
  for (const log of logs) {
    if (log.conflicts_resolved && Array.isArray(log.conflicts_resolved)) {
      for (const conflict of log.conflicts_resolved) {
        const key = `${conflict.properties.join(' vs ')} → ${conflict.winner}`;
        if (!conflictCounts[key]) {
          conflictCounts[key] = {
            properties: conflict.properties,
            winner: conflict.winner,
            resolution: conflict.resolution,
            count: 0
          };
        }
        conflictCounts[key].count++;
      }
    }
  }
  
  // Sort by frequency
  return Object.values(conflictCounts).sort((a, b) => b.count - a.count);
}

/**
 * Aggregate common violations
 * @param {Array} logs - Matching logs
 * @returns {Array} Violation patterns with frequency
 */
function aggregateViolations(logs) {
  const violationCounts = {};
  
  for (const log of logs) {
    if (log.violations && Array.isArray(log.violations) && log.violations.length > 0) {
      for (const violation of log.violations) {
        const key = violation.rule;
        if (!violationCounts[key]) {
          violationCounts[key] = {
            rule: violation.rule,
            examples: [],
            count: 0,
            usually_worth_it: 0
          };
        }
        violationCounts[key].count++;
        if (violation.worth_it) violationCounts[key].usually_worth_it++;
        violationCounts[key].examples.push({
          reason: violation.reason,
          result: violation.result,
          worth_it: violation.worth_it
        });
      }
    }
  }
  
  // Calculate worth_it percentage and sort by frequency
  return Object.values(violationCounts)
    .map(v => ({
      ...v,
      worth_it_percentage: v.count > 0 ? (v.usually_worth_it / v.count) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate average of array
 * @param {Array} arr - Array of numbers
 * @returns {Number|null} Average or null if empty
 */
function average(arr) {
  if (!arr || arr.length === 0) return null;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

/**
 * Format query results for CLI display
 * @param {Object} results - Query results
 */
function displayResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('OUTCOME LOG QUERY RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\nMatching Projects: ${results.count}`);
  
  if (results.count === 0) {
    console.log('\nNo matching projects found.');
    return;
  }
  
  // Keep Patterns
  if (results.keep_patterns.length > 0) {
    console.log('\n' + '✅ KEEP PATTERNS (What Worked):');
    console.log('-'.repeat(60));
    results.keep_patterns.slice(0, 10).forEach((item, idx) => {
      const freqPercent = (item.frequency * 100).toFixed(0);
      console.log(`${idx + 1}. [${item.count}/${results.count} = ${freqPercent}%] ${item.pattern}`);
    });
  }
  
  // Avoid Patterns
  if (results.avoid_patterns.length > 0) {
    console.log('\n' + '❌ AVOID PATTERNS (What Didn\'t Work):');
    console.log('-'.repeat(60));
    results.avoid_patterns.slice(0, 10).forEach((item, idx) => {
      const freqPercent = (item.frequency * 100).toFixed(0);
      console.log(`${idx + 1}. [${item.count}/${results.count} = ${freqPercent}%] ${item.pattern}`);
    });
  }
  
  // Typical Time
  if (results.typical_time.total_minutes) {
    console.log('\n' + '⏱️  TYPICAL TIME (Based on ' + results.typical_time.sample_size + ' projects):');
    console.log('-'.repeat(60));
    console.log(`Planning: ${results.typical_time.planning_minutes || 'N/A'} min`);
    console.log(`Implementation: ${results.typical_time.implementation_minutes || 'N/A'} min`);
    console.log(`Debugging: ${results.typical_time.debugging_minutes || 'N/A'} min`);
    console.log(`Total: ${results.typical_time.total_minutes || 'N/A'} min`);
  }
  
  // Common Conflicts
  if (results.common_conflicts.length > 0) {
    console.log('\n' + '⚠️  COMMON CONFLICTS:');
    console.log('-'.repeat(60));
    results.common_conflicts.slice(0, 5).forEach((conflict, idx) => {
      console.log(`${idx + 1}. [${conflict.count}×] ${conflict.properties.join(' vs ')} → ${conflict.winner} wins`);
      console.log(`   Resolution: ${conflict.resolution}`);
    });
  }
  
  // Common Violations
  if (results.common_violations.length > 0) {
    console.log('\n' + '🚫 COMMON VIOLATIONS:');
    console.log('-'.repeat(60));
    results.common_violations.forEach((violation, idx) => {
      console.log(`${idx + 1}. [${violation.count}×] ${violation.rule}`);
      console.log(`   Worth it: ${violation.worth_it_percentage.toFixed(0)}% of the time`);
      if (violation.examples.length > 0) {
        console.log(`   Example: ${violation.examples[0].reason}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node query.js [filter1=value1] [filter2=value2] ...');
    console.log('\nExamples:');
    console.log('  node query.js task_type=reskin');
    console.log('  node query.js style=painterly_impressionist');
    console.log('  node query.js task_type=new composition=complex');
    console.log('  node query.js age=>70  # age >= 70');
    console.log('  node query.js violations=exists  # has violations');
    console.log('\nAvailable filters:');
    console.log('  task_type, style, age, origin_form, material, environment,');
    console.log('  lighting, composition, color_palette, technique_emphasis,');
    console.log('  special_requirements, violations');
    console.log('\nOperators: =, >=, <=, exists');
    process.exit(0);
  }
  
  // Parse filters from arguments
  const filters = {};
  for (const arg of args) {
    if (arg.includes('>=')) {
      const [key, value] = arg.split('>=');
      filters[key.trim()] = { $gte: isNaN(value) ? value.trim() : Number(value.trim()) };
    } else if (arg.includes('<=')) {
      const [key, value] = arg.split('<=');
      filters[key.trim()] = { $lte: isNaN(value) ? value.trim() : Number(value.trim()) };
    } else if (arg.includes('=exists')) {
      const key = arg.split('=')[0].trim();
      filters[key] = { $exists: true };
    } else if (arg.includes('=')) {
      const [key, value] = arg.split('=');
      filters[key.trim()] = isNaN(value) ? value.trim() : Number(value.trim());
    }
  }
  
  // Execute query
  const results = queryOutcomes(filters);
  displayResults(results);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  queryOutcomes,
  loadAllLogs,
  filterLogs,
  aggregateKeepPatterns,
  aggregateAvoidPatterns,
  calculateTypicalTime,
  aggregateConflicts,
  aggregateViolations
};
