import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string().min(10).max(100),
    description: z.string().min(30).max(160),
    author: z.string(),
    category: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    prepTime: z.string(),
    cookTime: z.string(),
    totalTime: z.string(),
    servings: z.number().min(1),
    ingredients: z.array(z.string()),
    tags: z.array(z.string()),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    slug: z.string(),
  }),
});

export const collections = { recipes, categories };
