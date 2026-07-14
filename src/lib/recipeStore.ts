import { recipes as seedRecipes, type Recipe, type RecipeCategory } from '../data/recipes';

const CUSTOM_KEY = 'custom-recipes';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'rezept';
}

export function getCustomRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCustomRecipes(recipes: Recipe[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(recipes));
}

export function getAllRecipes(): Recipe[] {
  return [...seedRecipes, ...getCustomRecipes()];
}

export function findRecipe(id: string): Recipe | undefined {
  return getAllRecipes().find((r) => r.id === id);
}

export interface NewRecipeInput {
  name: string;
  emoji: string;
  category: RecipeCategory;
  ingredients: string[];
  instructions: string[];
  servings: number | null;
  calories: string | null;
  protein: string | null;
  carbs: string | null;
  fat: string | null;
  link: string | null;
  tags: string[];
}

export function addRecipe(input: NewRecipeInput): Recipe {
  const existingIds = new Set(getAllRecipes().map((r) => r.id));
  let id = slugify(input.name);
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${slugify(input.name)}-${suffix}`;
    suffix += 1;
  }

  const recipe: Recipe = { id, favorite: false, ...input };
  const custom = getCustomRecipes();
  custom.push(recipe);
  saveCustomRecipes(custom);
  return recipe;
}
