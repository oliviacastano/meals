import { useEffect, useState } from 'react';
import type { Recipe } from '../data/recipes';
import { findRecipe } from '../lib/recipeStore';
import RecipeDetailView from './RecipeDetailView';

export default function NotFoundOrRecipe() {
  const [state, setState] = useState<'loading' | 'found' | 'missing'>('loading');
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/rezepte\/([^/]+)\/?$/);
    const id = match?.[1];
    const found = id ? findRecipe(id) : undefined;
    if (found) {
      setRecipe(found);
      setState('found');
    } else {
      setState('missing');
    }
  }, []);

  if (state === 'loading') return null;

  if (state === 'found' && recipe) {
    return <RecipeDetailView recipe={recipe} />;
  }

  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🍽️</div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Seite nicht gefunden</h1>
      <p className="text-stone-500 mb-6">Diese Seite gibt es nicht (mehr).</p>
      <a href="/" className="text-rose-600 hover:underline">
        ← Zur Startseite
      </a>
    </div>
  );
}
