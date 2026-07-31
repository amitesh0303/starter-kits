export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
}

export interface ToolCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export const categories: ToolCategory[] = [
  {
    id: "1",
    slug: "text",
    name: "Text Tools",
    description: "Tools for working with text and strings",
  },
  {
    id: "2",
    slug: "math",
    name: "Math Tools",
    description: "Calculators and math utilities",
  },
];

export const tools: Tool[] = [
  {
    id: "1",
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs in your text.",
    category: "text",
    keywords: ["word counter", "character counter", "text analysis"],
  },
  {
    id: "2",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages, percentage change, and percentage difference.",
    category: "math",
    keywords: ["percentage", "calculator", "percent change"],
  },
  {
    id: "3",
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting.",
    category: "text",
    keywords: ["json formatter", "json validator", "json beautifier"],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return tools.filter((t) => t.category === categorySlug);
}

export function getCategoryBySlug(slug: string): ToolCategory | undefined {
  return categories.find((c) => c.slug === slug);
}
