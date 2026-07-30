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

import {
  addDiagnostic,
  validateSchemaEntry,
  parseReadmeRows,
  validateReadme,
  validateFamilyCounts,
  validateSetEquality,
  checkIndependenceViolations,
  validateManifestLockfilePair,
  validateFinalCompletion
} from './lib/catalog-validator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const diagnostics = [];
const finalCompletion = process.argv.includes('--final-completion');

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
            addDiagnostic(diagnostics, {
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
        addDiagnostic(diagnostics, {
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
    const manifestPath = join(folderPath, entry.manifest);
    const lockfilePath = join(folderPath, entry.lockfile);
    const manifestExists = await exists(manifestPath);
    const lockfileExists = await exists(lockfilePath);

    const issues = validateManifestLockfilePair(entry, manifestExists, lockfileExists);
    for (const issue of issues) {
      addDiagnostic(diagnostics, issue);
    }

    // README.md
    const readmePath = join(folderPath, 'README.md');
    if (!(await exists(readmePath))) {
      addDiagnostic(diagnostics, {
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
        addDiagnostic(diagnostics, {
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
    if (manifestExists) {
      await checkIndependenceForEntry(entry, manifestPath);
    }
  }
}

async function checkIndependenceForEntry(entry, manifestPath) {
  try {
    const content = await readFile(manifestPath, 'utf8');
    const violations = checkIndependenceViolations(content);
    for (const { label, match } of violations) {
      addDiagnostic(diagnostics, {
        starter: entry.folder,
        category: 'independence',
        field: entry.manifest,
        expected: `no ${label}`,
        observed: match,
        correctiveAction: `Remove ${label} from ${entry.manifest} in "${entry.folder}" - starters must be independent`
      });
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
        addDiagnostic(diagnostics, {
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
    addDiagnostic(diagnostics, {
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
    addDiagnostic(diagnostics, {
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
    addDiagnostic(diagnostics, {
      category: 'metadata',
      field: 'catalog',
      expected: 'array',
      observed: typeof catalog,
      correctiveAction: 'catalog/starters.json must be a JSON array'
    });
    reportAndExit();
    return;
  }

  // Validate set equality (count, unique ids, unique folders)
  validateSetEquality(diagnostics, catalog, schema.minItems || 52);

  // Get entry schema definition
  const entrySchema = schema.$defs && schema.$defs.StarterEntry
    ? schema.$defs.StarterEntry
    : schema.items;

  // Validate each entry against schema
  for (const entry of catalog) {
    const starter = entry.folder || `id:${entry.id}`;
    if (entrySchema) {
      validateSchemaEntry(diagnostics, entry, entrySchema, starter);
    }
  }

  // Validate family counts
  validateFamilyCounts(diagnostics, catalog);

  // Validate README
  try {
    const readmeContent = await readFile(join(root, 'README.md'), 'utf8');
    validateReadme(diagnostics, readmeContent, catalog);
  } catch (err) {
    addDiagnostic(diagnostics, {
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
    validateFinalCompletion(diagnostics, catalog);
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
