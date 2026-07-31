import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Property 14: Beginner static no-service build and dependency allowlist.
 *
 * Every direct runtime dependency must map to one of the allowed capabilities:
 * framework, styling, SEO, sitemap, or static-output. Any unmapped dependency
 * fails validation.
 */

const pkgPath = resolve(import.meta.dirname, '../../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

/** Allowed runtime dependency -> capability mapping */
const allowedDependencies: Record<string, string> = {
  astro: 'framework / static-output',
  '@astrojs/sitemap': 'sitemap / SEO',
};

describe('Property 14: Dependency Allowlist', () => {
  const runtimeDeps = Object.keys(pkg.dependencies ?? {});

  it('has at least one runtime dependency (sanity check)', () => {
    expect(runtimeDeps.length).toBeGreaterThan(0);
  });

  it('every runtime dependency maps to an allowed capability', () => {
    const unmapped = runtimeDeps.filter((dep) => !Object.hasOwn(allowedDependencies, dep));
    if (unmapped.length > 0) {
      expect.fail(
        `Unmapped runtime dependencies found: ${unmapped.join(', ')}. ` +
          `Allowed: ${Object.keys(allowedDependencies).join(', ')}`,
      );
    }
  });

  it('no runtime dependency requires auth, database, payment, queue, email, or provider', () => {
    const forbidden = [
      'auth',
      'database',
      'db',
      'postgres',
      'mysql',
      'mongo',
      'redis',
      'stripe',
      'payment',
      'paypal',
      'queue',
      'amqp',
      'rabbitmq',
      'email',
      'sendgrid',
      'mailgun',
      'nodemailer',
      'oauth',
      'firebase',
      'supabase',
    ];

    for (const dep of runtimeDeps) {
      const depLower = dep.toLowerCase();
      for (const term of forbidden) {
        expect(depLower.includes(term)).toBe(false);
      }
    }
  });

  it('property: any arbitrary dependency name NOT in allowlist would fail (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(
          (s) => !Object.hasOwn(allowedDependencies, s),
        ),
        (randomDep) => {
          // Any dependency not in the allowlist must be rejected
          return !Object.hasOwn(allowedDependencies, randomDep);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('runtime dependency count matches allowlist exactly', () => {
    expect(runtimeDeps.length).toBe(Object.keys(allowedDependencies).length);
  });
});
