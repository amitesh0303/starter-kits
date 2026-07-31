import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string().min(10).max(80),
    description: z.string().min(50).max(160),
    author: z.string(),
    category: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    rating: z.number().min(1).max(5),
    productName: z.string(),
    productBrand: z.string().optional(),
    affiliateUrl: z.string().url(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
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

export const collections = { reviews, categories };
