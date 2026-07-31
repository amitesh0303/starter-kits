import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Hugo Configuration", () => {
  const configPath = resolve(__dirname, "../../hugo.toml");
  const config = readFileSync(configPath, "utf-8");

  it("has a baseURL defined", () => {
    expect(config).toContain("baseURL");
  });

  it("has site title defined", () => {
    expect(config).toContain('title = "Hugo Content Site"');
  });

  it("has adsense client ID parameter", () => {
    expect(config).toContain("adsenseClientId");
  });

  it("outputs RSS", () => {
    expect(config).toContain("RSS");
  });

  it("has sitemap configuration", () => {
    expect(config).toContain("[sitemap]");
  });
});

describe("Content Files", () => {
  it("posts directory has markdown files", () => {
    const postsDir = resolve(__dirname, "../../content/posts");
    const fs = require("fs");
    const files = fs.readdirSync(postsDir);
    const mdFiles = files.filter((f: string) => f.endsWith(".md"));
    expect(mdFiles.length).toBeGreaterThan(0);
  });

  it("post files have frontmatter", () => {
    const postPath = resolve(__dirname, "../../content/posts/getting-started-with-hugo.md");
    const content = readFileSync(postPath, "utf-8");
    expect(content).toContain("---");
    expect(content).toContain("title:");
    expect(content).toContain("date:");
  });
});
