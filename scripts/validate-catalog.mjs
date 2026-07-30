#!/usr/bin/env node
/**
 * Catalog validator - read-only, Windows-compatible, one-shot.
 * Uses only node:path, node:fs/promises, and node:url.
 * Validates catalog/starters.json structure, schema, README, folder existence,
 * metadata consistency, independence, and package identifier uniqueness.
 */

import { readFile, stat, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const diagnostics = [];
const finalCompletion = process.argv.includes('--final-completion');

function addDiagnostic({ starter, category, field, expected, observed, correctiveAction, requirement }) {
  const d = { category, expected, observed, correctiveAction };
  if (starter !== undefined) d.starter = starter;
  if (field !== undefined) d.field = field;
  if (requirement !== undefined) d.requirement = requirement;
  diagnostics.push(d);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(path) {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

// --- Schema validation (inline, no ajv) ---

function validateSchemaEntry(entry, schema, starter) {
  const props = schema.properties;
  const required = schema.required || [];

  // Check required fields
  for (const field of required) {
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

  // Check additionalProperties
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(entry)) {
      if (!props[key]) {
        addDiagnostic({
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
        addDiagnostic({
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
      addDiagnostic({
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
      addDiagnostic({
        starter,
        category: 'metadata',
        field,
        expected: `>= ${def.minimum}`,
        observed: String(value),
        correctiveAction: `Fix "${field}" minimum for "${starter}"`
      });
    }
    if (def.maximum !== undefined && typeof value === 'number' && value > def.maximum) {
      addDiagnostic({
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
        addDiagnostic({
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
          addDiagnostic({
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

// --- README parsing ---

function parseReadmeRows(readmeContent, catalog) {
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

  // For each catalog entry, check its row exists in the correct family section
  const readmeEntries = new Map(); // folder -> parsed row data

  for (const [family, sectionContent] of families.entries()) {
    // Parse table rows (skip header and separator)
    const lines = sectionContent.split('\n').filter(l => l.trim().startsWith('|'));
    // Skip header row and separator row
    const dataRows = lines.slice(2);

    for (const row of dataRows) {
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length < 8) continue;

      // Extract folder from markdown link: [`folder`](./folder)
      const folderMatch = cells[1].match(/\[`([^`]+)`\]\(\.\/([^)]+)\)/);
      if (!folderMatch) continue;

      const folder = folderMatch[1];
      const linkPath = folderMatch[2];

      // Extract status text (strip emoji prefix)
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

function validateReadme(readmeContent, catalog) {
  const { families, readmeEntries } = parseReadmeRows(readmeContent, catalog);

  // Check each family section exists
  const expectedFamilies = ['Web SaaS', 'API/Backend', 'Expo Mobile', 'Content/AdSense', 'Beginner Static'];
  for (const family of expectedFamilies) {
    if (!families.has(family)) {
      addDiagnostic({
        category: 'readme',
        field: 'family section',
        expected: `Section for "${family}" with validator markers`,
        observed: 'missing',
        correctiveAction: `Add <!-- FAMILY:${family} START --> and END markers to README`
      });
    }
  }

  // Check each catalog entry has exactly one row in the correct family section
  for (const entry of catalog) {
    const readmeRow = readmeEntries.get(entry.folder);
    if (!readmeRow) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'row',
        expected: 'one row in README table',
        observed: 'missing',
        correctiveAction: `Add a README row for "${entry.folder}" in the "${entry.family}" section`
      });
      continue;
    }

    // Check it is in the correct family section
    if (readmeRow.family !== entry.family) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'family',
        expected: entry.family,
        observed: readmeRow.family,
        correctiveAction: `Move README row for "${entry.folder}" to the "${entry.family}" section`
      });
    }

    // Check status matches
    if (readmeRow.status !== entry.status) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'status',
        expected: entry.status,
        observed: readmeRow.status,
        correctiveAction: `Update README status for "${entry.folder}" to "${entry.status}"`
      });
    }

    // Check link resolves to the correct path
    if (readmeRow.linkPath !== entry.folder) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'link',
        expected: entry.folder,
        observed: readmeRow.linkPath,
        correctiveAction: `Fix README folder link for "${entry.folder}"`
      });
    }

    // Check field values match catalog
    if (readmeRow.useCase !== entry.useCase) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'useCase',
        expected: entry.useCase,
        observed: readmeRow.useCase,
        correctiveAction: `Update README useCase for "${entry.folder}"`
      });
    }
    if (readmeRow.framework !== entry.framework) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'framework',
        expected: entry.framework,
        observed: readmeRow.framework,
        correctiveAction: `Update README framework for "${entry.folder}"`
      });
    }
    if (readmeRow.auth !== entry.auth) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'auth',
        expected: entry.auth,
        observed: readmeRow.auth,
        correctiveAction: `Update README auth for "${entry.folder}"`
      });
    }
    if (readmeRow.data !== entry.data) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'data',
        expected: entry.data,
        observed: readmeRow.data,
        correctiveAction: `Update README data for "${entry.folder}"`
      });
    }
    if (readmeRow.monetization !== entry.monetization) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'monetization',
        expected: entry.monetization,
        observed: readmeRow.monetization,
        correctiveAction: `Update README monetization for "${entry.folder}"`
      });
    }

    // Integrations: in the README it may be comma-separated or a single value
    const expectedIntegrations = entry.integrations.join(', ') || 'None';
    const readmeIntegrations = readmeRow.integrations || '';
    if (readmeIntegrations !== expectedIntegrations) {
      addDiagnostic({
        starter: entry.folder,
        category: 'readme',
        field: 'integrations',
        expected: expectedIntegrations,
        observed: readmeIntegrations,
        correctiveAction: `Update README integrations for "${entry.folder}"`
      });
    }
  }

  // Check no extra rows in README that are not in catalog
  const catalogFolders = new Set(catalog.map(e => e.folder));
  for (const [folder] of readmeEntries) {
    if (!catalogFolders.has(folder)) {
      addDiagnostic({
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

// --- Folder and starter.json checks ---

async function validateFolders(catalog) {
  const immutableFields = ['id', 'folder', 'family', 'useCase', 'framework', 'runtime'];

  for (const entry of catalog) {
    const folderPath = join(root, entry.folder);
    const folderExists = await exists(folderPath);

    if (!folderExists) {
      // Skip folder-specific checks if folder does not exist
      // This is acceptable for pending starters
      continue;
    }

    // Check starter.json consistency
    const starterJsonPath = join(folderPath, 'starter.json');
    if (await exists(starterJsonPath)) {
      try {
        const starterJson = await readJsonFile(starterJsonPath);
        for (const field of immutableFields) {
          if (field in starterJson && starterJson[field] !== entry[field]) {
            addDiagnostic({
              starter: entry.folder,
              category: 'metadata',
              field,
              expected: String(entry[field]),
              observed: String(starterJson[field]),
              correctiveAction: `Update starter.json "${field}" in "${entry.folder}" to match catalog`
            });
          }
        }
      } catch (err) {
        addDiagnostic({
          starter: entry.folder,
          category: 'metadata',
          field: 'starter.json',
          expected: 'valid JSON',
          observed: err.message,
          correctiveAction: `Fix starter.json in "${entry.folder}"`
        });
      }
    }

    // Check required files
    // manifest
    const manifestPath = join(folderPath, entry.manifest);
    if (!(await exists(manifestPath))) {
      addDiagnostic({
        starter: entry.folder,
        category: 'manifest',
        field: entry.manifest,
        expected: 'exists',
        observed: 'missing',
        correctiveAction: `Create ${entry.manifest} in "${entry.folder}"`
      });
    }

    // lockfile
    const lockfilePath = join(folderPath, entry.lockfile);
    if (!(await exists(lockfilePath))) {
      addDiagnostic({
        starter: entry.folder,
        category: 'lockfile',
        field: entry.lockfile,
        expected: 'exists',
        observed: 'missing',
        correctiveAction: `Create ${entry.lockfile} in "${entry.folder}"`
      });
    }

    // README.md
    const readmePath = join(folderPath, 'README.md');
    if (!(await exists(readmePath))) {
      addDiagnostic({
        starter: entry.folder,
        category: 'metadata',
        field: 'README.md',
        expected: 'exists',
        observed: 'missing',
        correctiveAction: `Create README.md in "${entry.folder}"`
      });
    }

    // .env.example (if readsEnvironment)
    if (entry.readsEnvironment) {
      const envPath = join(folderPath, '.env.example');
      if (!(await exists(envPath))) {
        addDiagnostic({
          starter: entry.folder,
          category: 'environment',
          field: '.env.example',
          expected: 'exists',
          observed: 'missing',
          correctiveAction: `Create .env.example in "${entry.folder}" (readsEnvironment is true)`
        });
      }
    }

    // Independence check: scan manifest for file:, link:, workspace:, or ../ references
    if (await exists(manifestPath)) {
      await checkIndependence(entry, manifestPath);
    }
  }
}

async function checkIndependence(entry, manifestPath) {
  try {
    const content = await readFile(manifestPath, 'utf8');
    const patterns = [
      { pattern: /["']file:[^"']*["']/g, label: 'file: dependency' },
      { pattern: /["']link:[^"']*["']/g, label: 'link: dependency' },
      { pattern: /["']workspace:[^"']*["']/g, label: 'workspace: dependency' },
      { pattern: /["'][^"']*\.\.\//g, label: 'parent-path reference' }
    ];

    for (const { pattern, label } of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        addDiagnostic({
          starter: entry.folder,
          category: 'independence',
          field: entry.manifest,
          expected: `no ${label}`,
          observed: matches[0],
          correctiveAction: `Remove ${label} from ${entry.manifest} in "${entry.folder}" - starters must be independent`
        });
      }
    }
  } catch {
    // If we cannot read the manifest, skip independence check
  }
}

// --- Expo package identifier uniqueness ---

async function validateExpoIdentifiers(catalog) {
  const expoStarters = catalog.filter(e => e.family === 'Expo Mobile');
  const packageIds = new Map(); // identifier -> folder

  for (const entry of expoStarters) {
    const folderPath = join(root, entry.folder);
    if (!(await exists(folderPath))) continue;

    // Try app.config.ts first, then app.json
    let packageId = null;

    const appConfigPath = join(folderPath, 'app.config.ts');
    const appJsonPath = join(folderPath, 'app.json');

    if (await exists(appConfigPath)) {
      try {
        const content = await readFile(appConfigPath, 'utf8');
        // Look for android.package in the config
        const match = content.match(/package\s*:\s*["']([^"']+)["']/);
        if (match) packageId = match[1];
      } catch {
        // skip
      }
    }

    if (!packageId && await exists(appJsonPath)) {
      try {
        const appJson = await readJsonFile(appJsonPath);
        packageId = appJson?.expo?.android?.package || null;
      } catch {
        // skip
      }
    }

    if (packageId) {
      if (packageIds.has(packageId)) {
        addDiagnostic({
          starter: entry.folder,
          category: 'metadata',
          field: 'android.package',
          expected: 'unique package identifier',
          observed: `"${packageId}" also used by "${packageIds.get(packageId)}"`,
          correctiveAction: `Change Android package identifier in "${entry.folder}" to be unique`
        });
      } else {
        packageIds.set(packageId, entry.folder);
      }
    }
  }
}

// --- Main ---

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

  // Load schema
  const schemaPath = join(root, 'catalog', 'starters.schema.json');
  let schema;
  try {
    schema = await readJsonFile(schemaPath);
  } catch (err) {
    addDiagnostic({
      category: 'metadata',
      field: 'catalog/starters.schema.json',
      expected: 'valid JSON schema',
      observed: err.message,
      correctiveAction: 'Ensure catalog/starters.schema.json exists and is valid JSON'
    });
    reportAndExit();
    return;
  }

  // Validate catalog is array
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

  // Validate count
  const expectedCount = schema.minItems || 52;
  if (catalog.length !== expectedCount) {
    addDiagnostic({
      category: 'metadata',
      field: 'count',
      expected: String(expectedCount),
      observed: String(catalog.length),
      correctiveAction: `catalog/starters.json must contain exactly ${expectedCount} entries`
    });
  }

  // Get entry schema definition
  const entrySchema = schema.$defs && schema.$defs.StarterEntry
    ? schema.$defs.StarterEntry
    : schema.items;

  // Validate each entry against schema
  const seenIds = new Set();
  const seenFolders = new Set();

  for (const entry of catalog) {
    const starter = entry.folder || `id:${entry.id}`;

    // Schema validation
    if (entrySchema) {
      validateSchemaEntry(entry, entrySchema, starter);
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
  }

  // Validate family counts
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

  // Validate README
  try {
    const readmeContent = await readFile(join(root, 'README.md'), 'utf8');
    validateReadme(readmeContent, catalog);
  } catch (err) {
    addDiagnostic({
      category: 'readme',
      field: 'README.md',
      expected: 'readable file',
      observed: err.message,
      correctiveAction: 'Ensure README.md exists at the repository root'
    });
  }

  // Validate folder existence and starter.json
  await validateFolders(catalog);

  // Validate Expo package identifier uniqueness
  await validateExpoIdentifiers(catalog);

  // --final-completion: require all statuses to be "complete"
  if (finalCompletion) {
    for (const entry of catalog) {
      if (entry.status !== 'complete') {
        addDiagnostic({
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

  reportAndExit();
}

function reportAndExit() {
  if (diagnostics.length === 0) {
    console.log('All 52 entries were checked. No issues found.');
    process.exit(0);
  } else {
    console.error(`Catalog validation failed with ${diagnostics.length} issue(s):\n`);
    console.error(JSON.stringify(diagnostics, null, 2));
    console.error('');
    for (const d of diagnostics) {
      const prefix = d.starter ? `[${d.starter}]` : '[catalog]';
      console.error(`  ${prefix} ${d.category}${d.field ? '.' + d.field : ''}: expected ${d.expected}, observed ${d.observed}`);
      console.error(`    -> ${d.correctiveAction}`);
    }
    process.exit(1);
  }
}

main();
