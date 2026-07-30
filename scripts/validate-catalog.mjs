#!/usr/bin/env node
/**
 * Catalog validator - read-only, Windows-compatible, one-shot.
 * Uses only node:path and node:fs/promises.
 * Validates catalog/starters.json structure and counts.
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const diagnostics = [];

function addDiagnostic({ starter, category, field, expected, observed, correctiveAction, requirement }) {
  diagnostics.push({ starter, category, field, expected, observed, correctiveAction, requirement });
}

async function main() {
  // Load catalog
  const catalogPath = join(root, 'catalog', 'starters.json');
  let catalog;
  try {
    const raw = await readFile(catalogPath, 'utf8');
    catalog = JSON.parse(raw);
  } catch (err) {
    addDiagnostic({
      category: 'metadata',
      field: 'catalog/starters.json',
      expected: 'valid JSON array',
      observed: err.message,
      correctiveAction: 'Ensure catalog/starters.json exists and is valid JSON'
    });
    reportAndExit();
    return;
  }

  // Check count
  if (!Array.isArray(catalog)) {
    addDiagnostic({
      category: 'metadata',
      field: 'catalog',
      expected: 'array',
      observed: typeof catalog,
      correctiveAction: 'catalog/starters.json must be a JSON array'
    });
    reportAndExit();
    return;
  }

  if (catalog.length !== 52) {
    addDiagnostic({
      category: 'metadata',
      field: 'count',
      expected: '52',
      observed: String(catalog.length),
      correctiveAction: 'catalog/starters.json must contain exactly 52 entries'
    });
  }

  // Check family counts
  const expectedFamilyCounts = {
    'Web SaaS': 15,
    'API/Backend': 9,
    'Expo Mobile': 12,
    'Content/AdSense': 14,
    'Beginner Static': 2
  };

  const familyCounts = {};
  const validStatuses = ['pending', 'in progress', 'complete'];
  const requiredFields = [
    'id', 'folder', 'family', 'useCase', 'framework', 'runtime',
    'technologies', 'choices', 'auth', 'data', 'monetization',
    'integrations', 'readsEnvironment', 'manifest', 'lockfile',
    'readme', 'familyRequirement', 'status'
  ];

  const seenIds = new Set();
  const seenFolders = new Set();

  for (const entry of catalog) {
    const starter = entry.folder || `id:${entry.id}`;

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in entry)) {
        addDiagnostic({
          starter,
          category: 'metadata',
          field,
          expected: 'present',
          observed: 'missing',
          correctiveAction: `Add "${field}" field to starter "${starter}"`
        });
      }
    }

    // Check no additional properties
    for (const key of Object.keys(entry)) {
      if (!requiredFields.includes(key)) {
        addDiagnostic({
          starter,
          category: 'metadata',
          field: key,
          expected: 'not present',
          observed: 'present',
          correctiveAction: `Remove unexpected field "${key}" from starter "${starter}"`
        });
      }
    }

    // Check unique id
    if (seenIds.has(entry.id)) {
      addDiagnostic({
        starter,
        category: 'metadata',
        field: 'id',
        expected: 'unique',
        observed: `duplicate: ${entry.id}`,
        correctiveAction: `Fix duplicate id ${entry.id}`
      });
    }
    seenIds.add(entry.id);

    // Check unique folder
    if (seenFolders.has(entry.folder)) {
      addDiagnostic({
        starter,
        category: 'folder',
        field: 'folder',
        expected: 'unique',
        observed: `duplicate: ${entry.folder}`,
        correctiveAction: `Fix duplicate folder "${entry.folder}"`
      });
    }
    seenFolders.add(entry.folder);

    // Check status
    if (entry.status && !validStatuses.includes(entry.status)) {
      addDiagnostic({
        starter,
        category: 'status',
        field: 'status',
        expected: `one of: ${validStatuses.join(', ')}`,
        observed: entry.status,
        correctiveAction: `Set status to a valid value for "${starter}"`
      });
    }

    // Count families
    if (entry.family) {
      familyCounts[entry.family] = (familyCounts[entry.family] || 0) + 1;
    }
  }

  // Verify family counts
  for (const [family, expected] of Object.entries(expectedFamilyCounts)) {
    const actual = familyCounts[family] || 0;
    if (actual !== expected) {
      addDiagnostic({
        category: 'family',
        field: family,
        expected: String(expected),
        observed: String(actual),
        correctiveAction: `Family "${family}" should have exactly ${expected} entries`
      });
    }
  }

  // Check for unexpected families
  for (const family of Object.keys(familyCounts)) {
    if (!(family in expectedFamilyCounts)) {
      addDiagnostic({
        category: 'family',
        field: family,
        expected: 'not present',
        observed: `${familyCounts[family]} entries`,
        correctiveAction: `Remove or fix entries with unexpected family "${family}"`
      });
    }
  }

  reportAndExit();
}

function reportAndExit() {
  if (diagnostics.length === 0) {
    console.log('All 52 catalog entries validated successfully.');
    process.exit(0);
  } else {
    console.error(`Catalog validation failed with ${diagnostics.length} issue(s):\n`);
    for (const d of diagnostics) {
      const prefix = d.starter ? `[${d.starter}]` : '[catalog]';
      console.error(`  ${prefix} ${d.category}${d.field ? '.' + d.field : ''}: expected ${d.expected}, observed ${d.observed}`);
      console.error(`    -> ${d.correctiveAction}`);
    }
    process.exit(1);
  }
}

main();
