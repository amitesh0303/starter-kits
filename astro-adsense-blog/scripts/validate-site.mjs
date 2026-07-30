#!/usr/bin/env node

/**
 * One-shot site validation script.
 * Builds the site and runs all output tests.
 */

import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

function run(command, label) {
  console.log(`\n--- ${label} ---`);
  try {
    execSync(command, { cwd: projectRoot, stdio: 'inherit' });
    console.log(`[PASS] ${label}`);
  } catch {
    console.error(`[FAIL] ${label}`);
    process.exit(1);
  }
}

run('pnpm build', 'Build site');
run('pnpm test:output', 'Output tests (SEO, RSS, links, ads, accessibility, performance)');

console.log('\n--- All validations passed ---');
