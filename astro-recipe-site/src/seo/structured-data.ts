export interface RecipeJsonLdInput {
  name: string;
  description: string;
  authorName: string;
  publishedAt: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
  canonicalUrl: string;
}

/**
 * Generates Recipe JSON-LD structured data following schema.org/Recipe.
 */
export function generateRecipeJsonLd(input: RecipeJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: input.name,
    description: input.description,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    datePublished: input.publishedAt,
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    totalTime: input.totalTime,
    recipeYield: `${input.servings} servings`,
    recipeIngredient: input.ingredients,
    recipeInstructions: input.instructions.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl,
    },
    ...(input.image ? { image: input.image } : {}),
  };

  return JSON.stringify(structuredData);
}

export interface HowToJsonLdInput {
  name: string;
  description: string;
  steps: string[];
  totalTime?: string;
  canonicalUrl: string;
}

/**
 * Generates HowTo JSON-LD structured data following schema.org/HowTo.
 */
export function generateHowToJsonLd(input: HowToJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    ...(input.totalTime ? { totalTime: input.totalTime } : {}),
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl,
    },
  };

  return JSON.stringify(structuredData);
}
