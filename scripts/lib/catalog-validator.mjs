/**
 * Catalog validator core logic - importable for testing.
 * Uses only node:path, node:fs/promises, and node:url.
 * Exports validation functions that accumulate diagnostics into a provided array.
 */

import { readFile, stat, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

/**
 * @typedef {Object} CatalogDiagnostic
 * @property {string} [starter]
 * @property {string} category
 * @property {string} [field]
 * @property {string} expected
 * @property {string} observed
 * @property {string} correctiveAction
 * @property {string} [requirement]
 */

/**
 * Creates a diagnostic entry and pushes it to the provided array.
 */
export function addDiagnostic(diagnostics, { starter, category, field, expected, observed, correctiveAction, requirement }) {
  const d = { category, expected, observed, correctiveAction };
  if (starter !== undefined) d.starter = starter;
  if (field !== undefined) d.field = field;
  if (requirement !== undefined) d.requirement = requirement;
  diagnostics.push(d);
}

/**
 * Validates a single entry against the schema definition.
 */
export function validateSchemaEntry(diagnostics, entry, schema, starter) {
  const props = schema.properties;
  const required = schema.required || [];

  // Check required fields
  for (const field of required) {
    if (!(field in entry)) {
      addDiagnostic(diagnostics, {
        starter,
        category: 'metadata',
        field,
        expected: 'present',
        observed: 'missing',
        correctiveAction: `Add "${field}" field to starter "${starter}"`
      });
    }
  }

  // Check additionalProperties
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(entry)) {
      if (!props[key]) {
        addDiagnostic(diagnostics, {
          starter,
          category: 'metadata',
          field: key,
          expected: 'not present (additionalProperties: false)',
          observed: 'present',
          correctiveAction: `Remove unexpected field "${key}" from starter "${starter}"`
        });
      }
    }
  }

  // Validate types and enums for each field
  for (const [field, def] of Object.entries(props)) {
    if (!(field in entry)) continue;
    const value = entry[field];

    // Type check
    if (def.type) {
      const types = Array.isArray(def.type) ? def.type : [def.type];
      let valid = false;
      for (const t of types) {
        if (t === 'null' && value === null) valid = true;
        else if (t === 'string' && typeof value === 'string') valid = true;
        else if (t === 'integer' && Number.isInteger(value)) valid = true;
        else if (t === 'number' && typeof value === 'number') valid = true;
        else if (t === 'boolean' && typeof value === 'boolean') valid = true;
        else if (t === 'array' && Array.isArray(value)) valid = true;
        else if (t === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) valid = true;
      }
      if (!valid) {
        addDiagnostic(diagnostics, {
          starter,
          category: 'metadata',
          field,
          expected: `type ${JSON.stringify(def.type)}`,
          observed: `${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}`,
          correctiveAction: `Fix type of "${field}" in starter "${starter}"`
        });
        continue;
      }
    }

    // Enum check
    if (def.enum && !def.enum.includes(value)) {
      addDiagnostic(diagnostics, {
        starter,
        category: 'metadata',
        field,
        expected: `one of: ${def.enum.join(', ')}`,
        observed: String(value),
        correctiveAction: `Set "${field}" to a valid enum value for "${starter}"`
      });
    }

    // Integer range
    if (def.minimum !== undefined && typeof value === 'number' && value < def.minimum) {
      addDiagnostic(diagnostics, {
        starter,
        category: 'metadata',
        field,
        expected: `>= ${def.minimum}`,
        observed: String(value),
        correctiveAction: `Fix "${field}" minimum for "${starter}"`
      });
    }
    if (def.maximum !== undefined && typeof value === 'number' && value > def.maximum) {
      addDiagnostic(diagnostics, {
        starter,
        category: 'metadata',
        field,
        expected: `<= ${def.maximum}`,
        observed: String(value),
        correctiveAction: `Fix "${field}" maximum for "${starter}"`
      });
    }

    // Pattern check for strings
    if (def.pattern && typeof value === 'string') {
      const re = new RegExp(def.pattern);
      if (!re.test(value)) {
        addDiagnostic(diagnostics, {
          starter,
          category: 'metadata',
          field,
          expected: `matches pattern ${def.pattern}`,
          observed: value,
          correctiveAction: `Fix "${field}" format for "${starter}"`
        });
      }
    }

    // Array items type check
    if (def.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemTypes = Array.isArray(def.items.type) ? def.items.type : [def.items.type];
        let itemValid = false;
        for (const t of itemTypes) {
          if (t === 'string' && typeof value[i] === 'string') itemValid = true;
          else if (t === 'number' && typeof value[i] === 'number') itemValid = true;
        }
        if (!itemValid) {
          addDiagnostic(diagnostics, {
            starter,
            category: 'metadata',
            field,
            expected: `array items of type ${JSON.stringify(def.items.type)}`,
            observed: `item[${i}] is ${typeof value[i]}`,
            correctiveAction: `Fix array item types in "${field}" for "${starter}"`
          });
          break;
        }
      }
    }
  }
}

/**
 * Parses README content and extracts family sections and row data.
 */
export function parseReadmeRows(readmeContent) {
  const familyMarkerRe = /<!-- FAMILY:(.+?) START -->/g;
  const familyEndRe = (family) => new RegExp(`<!-- FAMILY:${family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} END -->`);

  const families = new Map();
  let match;
  while ((match = familyMarkerRe.exec(readmeContent)) !== null) {
    const family = match[1];
    const startIdx = match.index + match[0].length;
    const endMatch = familyEndRe(family).exec(readmeContent.slice(startIdx));
    if (endMatch) {
      families.set(family, readmeContent.slice(startIdx, startIdx + endMatch.index));
    }
  }

  const readmeEntries = new Map();

  for (const [family, sectionContent] of families.entries()) {
    const lines = sectionContent.split('\n').filter(l => l.trim().startsWith('|'));
    const dataRows = lines.slice(2);

    for (const row of dataRows) {
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length < 8) continue;

      const folderMatch = cells[1].match(/\[`([^`]+)`\]\(\.\/([^)]+)\)/);
      if (!folderMatch) continue;

      const folder = folderMatch[1];
      const linkPath = folderMatch[2];

      const statusText = cells[0].replace(/^[^\w]*/, '').trim();

      readmeEntries.set(folder, {
        family,
        status: statusText,
        folder,
        linkPath,
        useCase: cells[2],
        framework: cells[3],
        auth: cells[4],
        data: cells[5],
        monetization: cells[6],
        integrations: cells[7]
      });
    }
  }

  return { families, readmeEntries };
}

/**
 * Validates README content against the catalog. Pushes diagnostics.
 */
export function validateReadme(diagnostics, readmeContent, catalog) {
  const { families, readmeEntries } = parseReadmeRows(readmeContent);

  const expectedFamilies = ['Web SaaS', 'API/Backend', 'Expo Mobile', 'Content/AdSense', 'Beginner Static'];
  for (const family of expectedFamilies) {
    if (!families.has(family)) {
      addDiagnostic(diagnostics, {
        category: 'readme',
        field: 'family section',
        expected: `Section for "${family}" with validator markers`,
        observed: 'missing',
        correctiveAction: `Add <!-- FAMILY:${family} START --> and END markers to README`
      });
    }
  }

  for (const entry of catalog) {
    const readmeRow = readmeEntries.get(entry.folder);
    if (!readmeRow) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'row',
        expected: 'one row in README table',
        observed: 'missing',
        correctiveAction: `Add a README row for "${entry.folder}" in the "${entry.family}" section`
      });
      continue;
    }

    if (readmeRow.family !== entry.family) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'family',
        expected: entry.family,
        observed: readmeRow.family,
        correctiveAction: `Move README row for "${entry.folder}" to the "${entry.family}" section`
      });
    }

    if (readmeRow.status !== entry.status) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'status',
        expected: entry.status,
        observed: readmeRow.status,
        correctiveAction: `Update README status for "${entry.folder}" to "${entry.status}"`
      });
    }

    if (readmeRow.linkPath !== entry.folder) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'link',
        expected: entry.folder,
        observed: readmeRow.linkPath,
        correctiveAction: `Fix README folder link for "${entry.folder}"`
      });
    }

    if (readmeRow.useCase !== entry.useCase) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'useCase',
        expected: entry.useCase,
        observed: readmeRow.useCase,
        correctiveAction: `Update README useCase for "${entry.folder}"`
      });
    }
    if (readmeRow.framework !== entry.framework) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'framework',
        expected: entry.framework,
        observed: readmeRow.framework,
        correctiveAction: `Update README framework for "${entry.folder}"`
      });
    }
    if (readmeRow.auth !== entry.auth) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'auth',
        expected: entry.auth,
        observed: readmeRow.auth,
        correctiveAction: `Update README auth for "${entry.folder}"`
      });
    }
    if (readmeRow.data !== entry.data) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'data',
        expected: entry.data,
        observed: readmeRow.data,
        correctiveAction: `Update README data for "${entry.folder}"`
      });
    }
    if (readmeRow.monetization !== entry.monetization) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'monetization',
        expected: entry.monetization,
        observed: readmeRow.monetization,
        correctiveAction: `Update README monetization for "${entry.folder}"`
      });
    }

    const expectedIntegrations = entry.integrations.join(', ') || 'None';
    const readmeIntegrations = readmeRow.integrations || '';
    if (readmeIntegrations !== expectedIntegrations) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'readme',
        field: 'integrations',
        expected: expectedIntegrations,
        observed: readmeIntegrations,
        correctiveAction: `Update README integrations for "${entry.folder}"`
      });
    }
  }

  // Check for extra rows not in catalog
  const catalogFolders = new Set(catalog.map(e => e.folder));
  for (const [folder] of readmeEntries) {
    if (!catalogFolders.has(folder)) {
      addDiagnostic(diagnostics, {
        starter: folder,
        category: 'readme',
        field: 'row',
        expected: 'no row (not in catalog)',
        observed: 'present',
        correctiveAction: `Remove README row for "${folder}" which is not in the catalog`
      });
    }
  }
}

/**
 * Validates family counts against expected values.
 */
export function validateFamilyCounts(diagnostics, catalog) {
  const expectedFamilyCounts = {
    'Web SaaS': 15,
    'API/Backend': 9,
    'Expo Mobile': 12,
    'Content/AdSense': 14,
    'Beginner Static': 2
  };

  const familyCounts = {};
  for (const entry of catalog) {
    if (entry.family) {
      familyCounts[entry.family] = (familyCounts[entry.family] || 0) + 1;
    }
  }

  for (const [family, expected] of Object.entries(expectedFamilyCounts)) {
    const actual = familyCounts[family] || 0;
    if (actual !== expected) {
      addDiagnostic(diagnostics, {
        category: 'family',
        field: family,
        expected: String(expected),
        observed: String(actual),
        correctiveAction: `Family "${family}" should have exactly ${expected} entries`
      });
    }
  }

  for (const family of Object.keys(familyCounts)) {
    if (!(family in expectedFamilyCounts)) {
      addDiagnostic(diagnostics, {
        category: 'family',
        field: family,
        expected: 'not present',
        observed: `${familyCounts[family]} entries`,
        correctiveAction: `Remove or fix entries with unexpected family "${family}"`
      });
    }
  }

  return { familyCounts, expectedFamilyCounts };
}

/**
 * Validates set equality - checks for unique ids and folders, correct count.
 */
export function validateSetEquality(diagnostics, catalog, expectedCount = 52) {
  if (catalog.length !== expectedCount) {
    addDiagnostic(diagnostics, {
      category: 'metadata',
      field: 'count',
      expected: String(expectedCount),
      observed: String(catalog.length),
      correctiveAction: `catalog/starters.json must contain exactly ${expectedCount} entries`
    });
  }

  const seenIds = new Set();
  const seenFolders = new Set();

  for (const entry of catalog) {
    const starter = entry.folder || `id:${entry.id}`;

    if (seenIds.has(entry.id)) {
      addDiagnostic(diagnostics, {
        starter,
        category: 'metadata',
        field: 'id',
        expected: 'unique',
        observed: `duplicate: ${entry.id}`,
        correctiveAction: `Fix duplicate id ${entry.id}`
      });
    }
    seenIds.add(entry.id);

    if (seenFolders.has(entry.folder)) {
      addDiagnostic(diagnostics, {
        starter,
        category: 'folder',
        field: 'folder',
        expected: 'unique',
        observed: `duplicate: ${entry.folder}`,
        correctiveAction: `Fix duplicate folder "${entry.folder}"`
      });
    }
    seenFolders.add(entry.folder);
  }
}

/**
 * Checks a manifest content string for independence violations.
 * Returns an array of detected violation labels.
 */
export function checkIndependenceViolations(manifestContent) {
  const violations = [];
  const patterns = [
    { pattern: /["']file:[^"']*["']/g, label: 'file: dependency' },
    { pattern: /["']link:[^"']*["']/g, label: 'link: dependency' },
    { pattern: /["']workspace:[^"']*["']/g, label: 'workspace: dependency' },
    { pattern: /["'][^"']*\.\.\//g, label: 'parent-path reference' }
  ];

  for (const { pattern, label } of patterns) {
    const matches = manifestContent.match(pattern);
    if (matches) {
      violations.push({ label, match: matches[0] });
    }
  }

  return violations;
}

/**
 * Validates manifest/lockfile pair existence.
 * Takes explicit paths to check, returns array of issues.
 */
export function validateManifestLockfilePair(entry, manifestExists, lockfileExists) {
  const issues = [];
  if (!manifestExists) {
    issues.push({
      starter: entry.folder,
      category: 'manifest',
      field: entry.manifest,
      expected: 'exists',
      observed: 'missing',
      correctiveAction: `Create ${entry.manifest} in "${entry.folder}"`
    });
  }
  if (!lockfileExists) {
    issues.push({
      starter: entry.folder,
      category: 'lockfile',
      field: entry.lockfile,
      expected: 'exists',
      observed: 'missing',
      correctiveAction: `Create ${entry.lockfile} in "${entry.folder}"`
    });
  }
  return issues;
}

/**
 * Validates final completion - all starters must have status "complete".
 */
export function validateFinalCompletion(diagnostics, catalog) {
  for (const entry of catalog) {
    if (entry.status !== 'complete') {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'status',
        field: 'status',
        expected: 'complete',
        observed: entry.status,
        correctiveAction: `Starter "${entry.folder}" must have status "complete" for final completion`,
        requirement: 'Final completion requires all starters to be complete'
      });
    }
  }
}
