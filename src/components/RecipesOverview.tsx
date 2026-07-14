import { useEffect, useState } from 'react';
import type { Recipe, RecipeCategory } from '../data/recipes';
import { getAllRecipes } from '../lib/recipeStore';

const CATEGORIES: RecipeCategory[] = ['Frühstück', 'Kochen', 'Backen'];
const categoryColors: Record<RecipeCategory, string> = {
  Frühstück: 'bg-amber-100 text-amber-800',
  Kochen: 'bg-rose-100 text-rose-800',
  Backen: 'bg-orange-100 text-orange-800',
};

export default function RecipesOverview() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Rezepte</h1>
        <a
          href="/rezepte/neu"
          className="px-4 py-2 rounded-full bg-rose-200 text-rose-900 text-sm font-medium hover:bg-rose-300"
        >
          + Neues Rezept
        </a>
      </div>

      {CATEGORIES.map((cat) => {
        const items = recipes.filter((r) => r.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="text-lg font-semibold text-stone-800 mb-3">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((r) => (
                <a
                  key={r.id}
                  href={`/rezepte/${r.id}`}
                  className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow block"
                >
                  <div className="text-3xl mb-2">{r.emoji}</div>
                  <div className="font-semibold text-stone-900">{r.name}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${categoryColors[r.category]}`}>
                      {r.category}
                    </span>
                    {r.calories && <span className="text-stone-500">{r.calories}</span>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
