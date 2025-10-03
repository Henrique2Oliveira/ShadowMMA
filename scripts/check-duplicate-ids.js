/*
Scan secrets/data.js for duplicate comboId values:
 - within each levels[type] array (e.g., 'Punches', 'Kicks', ...)
 - across all types inside a category (global duplicate inside the category)
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

function findDuplicateIds(sets) {
  const issues = { perType: [], perCategory: [] };

  for (const set of sets) {
    if (!set || !set.levels || typeof set.levels !== 'object') continue;

    // Per-type duplicates
    for (const [typeKey, arr] of Object.entries(set.levels)) {
      if (!Array.isArray(arr)) continue;
      const seen = new Map();
      const dups = new Map();
      for (const combo of arr) {
        const id = combo?.comboId;
        if (id === undefined || id === null) continue; // skip missing
        if (seen.has(id)) {
          if (!dups.has(id)) dups.set(id, [seen.get(id)]);
          dups.get(id).push(combo);
        } else {
          seen.set(id, combo);
        }
      }
      if (dups.size > 0) {
        issues.perType.push({ setId: set.id, category: set.category, type: typeKey, duplicates: [...dups.entries()] });
      }
    }

    // Cross-type duplicates within the category
    const allCombos = [];
    for (const arr of Object.values(set.levels)) {
      if (Array.isArray(arr)) allCombos.push(...arr);
    }
    const seenAll = new Map();
    const dupsAll = new Map();
    for (const combo of allCombos) {
      const id = combo?.comboId;
      if (id === undefined || id === null) continue;
      if (seenAll.has(id)) {
        if (!dupsAll.has(id)) dupsAll.set(id, [seenAll.get(id)]);
        dupsAll.get(id).push(combo);
      } else {
        seenAll.set(id, combo);
      }
    }
    if (dupsAll.size > 0) {
      issues.perCategory.push({ setId: set.id, category: set.category, duplicates: [...dupsAll.entries()] });
    }
  }

  return issues;
}

function printIssues(issues) {
  const { perType, perCategory } = issues;

  if (perType.length === 0 && perCategory.length === 0) {
    console.log('No duplicate comboId found inside levels.');
    return;
  }

  if (perType.length > 0) {
    console.log(`\nPer-type duplicate comboId:`);
    for (const entry of perType) {
      console.log(`- Category [${entry.setId}] ${entry.category} -> ${entry.type}`);
      for (const [id, list] of entry.duplicates) {
        console.log(`  comboId=${id} occurs ${list.length} additional time(s):`);
        for (const c of list) {
          console.log(`    • name="${c.name}" level=${c.level} proOnly=${!!c.proOnly}`);
        }
      }
    }
  }

  if (perCategory.length > 0) {
    console.log(`\nCross-type duplicate comboId within category:`);
    for (const entry of perCategory) {
      console.log(`- Category [${entry.setId}] ${entry.category}`);
      for (const [id, list] of entry.duplicates) {
        console.log(`  comboId=${id} occurs ${list.length} additional time(s) across types:`);
        for (const c of list) {
          console.log(`    • name="${c.name}" level=${c.level} proOnly=${!!c.proOnly}`);
        }
      }
    }
  }
}

function main() {
  const sets = loadCombinationSets(dataFile);
  const issues = findDuplicateIds(sets);
  printIssues(issues);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Error:', (e && e.stack) || e);
    process.exit(1);
  }
}
