import { describe, it, expect } from 'vitest';
import { generateRecipeJsonLd, generateHowToJsonLd } from '../../src/seo/structured-data.js';

describe('Recipe JSON-LD', () => {
  const input = {
    name: 'Classic Pasta Carbonara',
    description: 'Authentic Italian pasta carbonara with guanciale.',
    authorName: 'Maria Romano',
    publishedAt: '2024-03-10T00:00:00.000Z',
    prepTime: 'PT15M',
    cookTime: 'PT20M',
    totalTime: 'PT35M',
    servings: 4,
    ingredients: ['400g spaghetti', '200g guanciale', '4 egg yolks'],
    instructions: ['Boil pasta', 'Cook guanciale', 'Mix eggs with cheese', 'Combine all'],
    canonicalUrl: 'https://example.com/recipes/pasta-carbonara/',
  };

  it('contains required @context field', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json['@context']).toBe('https://schema.org');
  });

  it('contains required @type field set to Recipe', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json['@type']).toBe('Recipe');
  });

  it('contains recipe name', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json.name).toBe('Classic Pasta Carbonara');
  });

  it('contains prep and cook times', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json.prepTime).toBe('PT15M');
    expect(json.cookTime).toBe('PT20M');
    expect(json.totalTime).toBe('PT35M');
  });

  it('contains recipe yield', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json.recipeYield).toBe('4 servings');
  });

  it('contains ingredients array', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json.recipeIngredient).toHaveLength(3);
    expect(json.recipeIngredient[0]).toBe('400g spaghetti');
  });

  it('contains instructions as HowToStep', () => {
    const json = JSON.parse(generateRecipeJsonLd(input));
    expect(json.recipeInstructions).toHaveLength(4);
    expect(json.recipeInstructions[0]['@type']).toBe('HowToStep');
    expect(json.recipeInstructions[0].position).toBe(1);
  });

  it('produces valid JSON', () => {
    expect(() => JSON.parse(generateRecipeJsonLd(input))).not.toThrow();
  });
});

describe('HowTo JSON-LD', () => {
  const input = {
    name: 'How to Cook Perfect Rice',
    description: 'Step-by-step guide to cooking fluffy rice every time.',
    steps: ['Rinse rice', 'Add water', 'Bring to boil', 'Simmer for 15 minutes'],
    totalTime: 'PT25M',
    canonicalUrl: 'https://example.com/how-to/cook-rice/',
  };

  it('contains @type HowTo', () => {
    const json = JSON.parse(generateHowToJsonLd(input));
    expect(json['@type']).toBe('HowTo');
  });

  it('contains steps as HowToStep', () => {
    const json = JSON.parse(generateHowToJsonLd(input));
    expect(json.step).toHaveLength(4);
    expect(json.step[0]['@type']).toBe('HowToStep');
  });

  it('includes totalTime when provided', () => {
    const json = JSON.parse(generateHowToJsonLd(input));
    expect(json.totalTime).toBe('PT25M');
  });

  it('omits totalTime when not provided', () => {
    const json = JSON.parse(generateHowToJsonLd({ ...input, totalTime: undefined }));
    expect(json.totalTime).toBeUndefined();
  });
});
