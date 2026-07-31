/**
 * Smoke tests to verify the project builds and lints successfully.
 */

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import path from "path";

const projectRoot = path.resolve(__dirname, "../..");

describe("Smoke: Build Validation", () => {
  it("TypeScript compiles without errors", () => {
    expect(() => {
      execSync("npx tsc --noEmit", {
        cwd: projectRoot,
        stdio: "pipe",
        timeout: 60000,
      });
    }).not.toThrow();
  });

  it("ESLint passes without errors", () => {
    expect(() => {
      execSync("npx next lint", {
        cwd: projectRoot,
        stdio: "pipe",
        timeout: 60000,
      });
    }).not.toThrow();
  });
});
