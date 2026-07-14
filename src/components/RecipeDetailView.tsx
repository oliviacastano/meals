import { useEffect, useState } from 'react';
import type { Recipe, RecipeCategory } from '../data/recipes';
import { getRecipeImage } from '../lib/recipeStore';
import ImageUploader from './ImageUploader';

const categoryColors: Record<RecipeCategory, string> = {
  Frühstück: 'bg-amber-100 text-amber-800',
  Kochen: 'bg-rose-100 text-rose-800',
  Backen: 'bg-orange-100 text-orange-800',
};

export default function RecipeDetailView({ recipe }: { recipe: Recipe }) {
  const [image, setImage] = useState<string | null>(recipe.image ?? null);

  useEffect(() => {
    setImage(getRecipeImage(recipe.id) ?? recipe.image ?? null);
  }, [recipe.id]);

  return (
    <div className="space-y-8">
      <a href="/rezepte" className="text-sm text-rose-600 hover:underline">
        ← Alle Rezepte
      </a>

      <div>
        {image ? (
          <img
            src={image}
            alt={recipe.name}
            className="w-full max-h-80 object-cover rounded-2xl shadow-sm mb-3"
          />
        ) : (
          <div className="text-5xl mb-3">{recipe.emoji}</div>
        )}
        <h1 className="text-2xl font-bold text-stone-900">{recipe.name}</h1>
        <span
          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[recipe.category]}`}
        >
          {recipe.category}
        </span>
        <div className="mt-3">
          <ImageUploader recipeId={recipe.id} image={image} onChange={setImage} />
        </div>
      </div>

      {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recipe.calories && (
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-stone-500">Kalorien</div>
              <div className="font-semibold text-stone-900">{recipe.calories}</div>
            </div>
          )}
          {recipe.protein && (
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-stone-500">Protein</div>
              <div className="font-semibold text-stone-900">{recipe.protein}</div>
            </div>
          )}
          {recipe.carbs && (
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-stone-500">Carbs</div>
              <div className="font-semibold text-stone-900">{recipe.carbs}</div>
            </div>
          )}
          {recipe.fat && (
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-stone-500">Fett</div>
              <div className="font-semibold text-stone-900">{recipe.fat}</div>
            </div>
          )}
        </div>
      )}

      {recipe.ingredients.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Zutaten</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <input type="checkbox" className="rounded" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.instructions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Zubereitung</h2>
          <ol className="space-y-3 list-decimal list-inside">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="bg-white rounded-lg px-3 py-2 shadow-sm">
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.link && (
        <a
          href={recipe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-rose-600 hover:underline"
        >
          Externes Rezept ansehen →
        </a>
      )}
    </div>
  );
}
