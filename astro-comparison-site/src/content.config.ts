import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const productSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  rating: z.number().min(1).max(5),
  price: z.string(),
  affiliateUrl: z.string().url(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  verdict: z.string(),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/comparisons' }),
  schema: z.object({
    title: z.string().min(10).max(100),
    description: z.string().min(30).max(160),
    author: z.string(),
    category: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    products: z.array(productSchema).min(2),
    winner: z.string().optional(),
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

export const collections = { comparisons, categories };
