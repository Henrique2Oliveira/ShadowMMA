/*
Scan secrets/data.js for duplicate combos that have the exact same sequence of move names (order-sensitive),
ignoring pauseTime/direction/tilt. Reports duplicates across all categories/levels.
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataFile = path.resolve(__dirname, '..', 'secrets', 'data.js');

function loadCombinationSets(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Replace ESM export with a plain const so we can eval in VM context
  const transformed = raw.replace(/\bexport\s+const\s+combinationSets\s*=\s*/, 'const combinationSets = ');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(transformed + '\n;this.__RESULT__ = combinationSets;', sandbox, { filename: 'data.js' });
  const sets = sandbox.__RESULT__;
  if (!Array.isArray(sets)) {
    throw new Error('Failed to load combinationSets from data.js');
  }
  return sets;
}

function normalizeMoves(moves) {
  return moves
    .map((m) => (m && m.move ? String(m.move).trim().toUpperCase() : ''))
    .join(' | ');
}

function findDuplicates(sets) {
  const map = new Map();
  for (const set of sets) {
    if (!set || !set.levels) continue;
    for (const [category, combos] of Object.entries(set.levels)) {
      if (!Array.isArray(combos)) continue;
      for (const combo of combos) {
        const key = normalizeMoves(combo.moves || []);
        const info = {
          category,
          comboId: combo.comboId,
          name: combo.name,
          level: combo.level,
          proOnly: !!combo.proOnly,
        };
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(info);
      }
    }
  }

  const dups = [];
  for (const [key, list] of map.entries()) {
    if (list.length > 1) {
      dups.push({ sequence: key, instances: list });
    }
  }
  // Sort by number of duplicates descending
  dups.sort((a, b) => b.instances.length - a.instances.length);
  return dups;
}

function main() {
  const sets = loadCombinationSets(dataFile);
  const dups = findDuplicates(sets);
  if (dups.length === 0) {
    console.log('No duplicate move sequences found.');
    return;
  }
  console.log(`Found ${dups.length} duplicate sequences (same moves, same order):`);
  for (const dup of dups) {
    console.log('\nSequence:', dup.sequence);
    for (const inst of dup.instances) {
      console.log(`  - [${inst.category}] id=${inst.comboId} lvl=${inst.level}${inst.proOnly ? ' (proOnly)' : ''} :: ${inst.name}`);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Error:', e && e.stack || e);
    process.exit(1);
  }
}
