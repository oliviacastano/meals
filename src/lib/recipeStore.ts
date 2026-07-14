import { recipes as seedRecipes, type Recipe, type RecipeCategory } from '../data/recipes';

const CUSTOM_KEY = 'custom-recipes';
const IMAGE_KEY = 'recipe-images';
const OVERRIDE_KEY = 'recipe-overrides';
const HIDDEN_KEY = 'hidden-recipes';

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

function getFieldOverrides(): Record<string, Partial<Recipe>> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveFieldOverrides(overrides: Record<string, Partial<Recipe>>): void {
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
}

function getHiddenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveHiddenIds(ids: Set<string>): void {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids]));
}

function withOverrides(recipe: Recipe): Recipe {
  const fields = getFieldOverrides()[recipe.id];
  const image = getImageOverrides()[recipe.id];
  let result = recipe;
  if (fields) result = { ...result, ...fields };
  if (image) result = { ...result, image };
  return result;
}

export function getAllRecipes(): Recipe[] {
  const hidden = getHiddenIds();
  return [...seedRecipes, ...getCustomRecipes()]
    .filter((r) => !hidden.has(r.id))
    .map(withOverrides);
}

export function findRecipe(id: string): Recipe | undefined {
  if (getHiddenIds().has(id)) return undefined;
  const recipe = [...seedRecipes, ...getCustomRecipes()].find((r) => r.id === id);
  return recipe ? withOverrides(recipe) : undefined;
}

export interface RecipeEditableFields {
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

export type NewRecipeInput = RecipeEditableFields;

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

  return withOverrides(recipe);
}

export function updateRecipe(id: string, fields: RecipeEditableFields): void {
  const custom = getCustomRecipes();
  const idx = custom.findIndex((r) => r.id === id);
  if (idx !== -1) {
    custom[idx] = { ...custom[idx], ...fields };
    saveCustomRecipes(custom);
    return;
  }

  const overrides = getFieldOverrides();
  overrides[id] = fields;
  saveFieldOverrides(overrides);
}

export function deleteRecipe(id: string): void {
  const custom = getCustomRecipes();
  const idx = custom.findIndex((r) => r.id === id);
  if (idx !== -1) {
    custom.splice(idx, 1);
    saveCustomRecipes(custom);
  } else {
    const hidden = getHiddenIds();
    hidden.add(id);
    saveHiddenIds(hidden);
  }

  setRecipeImage(id, null);
  const overrides = getFieldOverrides();
  delete overrides[id];
  saveFieldOverrides(overrides);
}
