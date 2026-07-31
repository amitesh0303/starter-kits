/**
 * Property 3: No server secrets leak to client bundle.
 * Verifies that server-only environment variable keys are never referenced
 * in client-safe code paths. The config module correctly classifies variables
 * as server-only vs public.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getServerOnlyKeys, getPublicKeys, isPlaceholderValue } from "@/lib/server/config";
import * as fs from "fs";
import * as path from "path";

/**
 * Recursively get all TypeScript/JavaScript files in a directory.
 */
function getFilesRecursive(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      files.push(...getFilesRecursive(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("Property 3: No Server Secrets Leak to Client Bundle", () => {
  const projectRoot = path.resolve(__dirname, "../..");
  const serverOnlyKeys = getServerOnlyKeys();
  const publicKeys = getPublicKeys();

  it("server-only keys are not referenced in client-side app code", () => {
    // Client-safe files: anything under app/ that is NOT in api/ routes or uses "use client"
    const appDir = path.join(projectRoot, "app");
    const clientFiles = getFilesRecursive(appDir, [".tsx", ".ts"]).filter(
      (f) => !f.includes("/api/")
    );

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, "utf-8");
      for (const key of serverOnlyKeys) {
        // Server-only keys should not appear directly in client components
        // Exception: they might appear in comments
        const lines = content.split("\n");
        for (const line of lines) {
          if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;
          expect(
            line.includes(`process.env.${key}`),
            `Server secret ${key} found in client file ${file}`
          ).toBe(false);
        }
      }
    }
  });

  it("public keys all start with NEXT_PUBLIC_ prefix", () => {
    for (const key of publicKeys) {
      expect(key.startsWith("NEXT_PUBLIC_")).toBe(true);
    }
  });

  it("server-only keys never start with NEXT_PUBLIC_ prefix", () => {
    for (const key of serverOnlyKeys) {
      expect(key.startsWith("NEXT_PUBLIC_")).toBe(false);
    }
  });

  it("isPlaceholderValue correctly identifies placeholder values (property-based)", () => {
    const placeholderArb = fc.constantFrom(
      "",
      "your-value-here",
      "CHANGE_ME",
      "xxx",
      "sk_test_placeholder",
      "whsec_placeholder"
    );

    fc.assert(
      fc.property(placeholderArb, (value) => {
        expect(isPlaceholderValue(value)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("isPlaceholderValue returns false for real values (property-based)", () => {
    const realValueArb = fc
      .stringOf(fc.hexa(), { minLength: 10, maxLength: 40 })
      .map((s) => `sk_live_${s}`)
      .filter(
        (s) =>
          !s.toLowerCase().includes("placeholder") &&
          s !== "your-value-here" &&
          s !== "CHANGE_ME" &&
          s !== "xxx"
      );

    fc.assert(
      fc.property(realValueArb, (value) => {
        expect(isPlaceholderValue(value)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
