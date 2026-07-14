import { recipes as seedRecipes, type Recipe, type RecipeCategory } from '../data/recipes';

const CUSTOM_KEY = 'custom-recipes';
const IMAGE_KEY = 'recipe-images';

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

function getImageOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(IMAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getRecipeImage(id: string): string | null {
  return getImageOverrides()[id] ?? null;
}

export function setRecipeImage(id: string, image: string | null): void {
  const overrides = getImageOverrides();
  if (image) {
    overrides[id] = image;
  } else {
    delete overrides[id];
  }
  localStorage.setItem(IMAGE_KEY, JSON.stringify(overrides));
}

function withImage(recipe: Recipe): Recipe {
  const image = getImageOverrides()[recipe.id];
  return image ? { ...recipe, image } : recipe;
}

export function getAllRecipes(): Recipe[] {
  return [...seedRecipes, ...getCustomRecipes()].map(withImage);
}

export function findRecipe(id: string): Recipe | undefined {
  const recipe = [...seedRecipes, ...getCustomRecipes()].find((r) => r.id === id);
  return recipe ? withImage(recipe) : undefined;
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

export function addRecipe(input: NewRecipeInput, image?: string | null): Recipe {
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

  if (image) setRecipeImage(id, image);

  return withImage(recipe);
}
