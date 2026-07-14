import { useState } from 'react';
import type { RecipeCategory } from '../data/recipes';
import { addRecipe } from '../lib/recipeStore';

const CATEGORIES: RecipeCategory[] = ['Frühstück', 'Kochen', 'Backen'];

function linesToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function RecipeForm() {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [category, setCategory] = useState<RecipeCategory>('Kochen');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Bitte gib einen Namen ein.');
      return;
    }
    const recipe = addRecipe({
      name: name.trim(),
      emoji: emoji.trim() || '🍽️',
      category,
      ingredients: linesToList(ingredients),
      instructions: linesToList(instructions),
      servings: servings ? Number(servings) : null,
      calories: calories.trim() || null,
      protein: protein.trim() || null,
      carbs: carbs.trim() || null,
      fat: fat.trim() || null,
      link: link.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    window.location.href = `/rezepte/${recipe.id}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-center text-xl"
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
            placeholder="z.B. Protein Porridge"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Kategorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RecipeCategory)}
          className="w-full sm:w-64 rounded-xl border border-stone-200 px-3 py-2"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Zutaten <span className="text-stone-400 font-normal">(eine pro Zeile)</span>
        </label>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-stone-200 px-3 py-2"
          placeholder={'200g Hähnchenbrust\n1 Paprika\nSalz & Pfeffer'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Zubereitung <span className="text-stone-400 font-normal">(ein Schritt pro Zeile)</span>
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-stone-200 px-3 py-2"
          placeholder={'Ofen vorheizen.\nHähnchen würzen und braten.'}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Portionen</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Kalorien</label>
          <input
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
            placeholder="z.B. 600 kcal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Protein</label>
          <input
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Carbs</label>
          <input
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Fett</label>
          <input
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Externer Link</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-3 py-2"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Tags <span className="text-stone-400 font-normal">(kommagetrennt)</span>
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-3 py-2"
          placeholder="High Protein, Meal Prep"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full bg-rose-200 text-rose-900 font-medium hover:bg-rose-300"
        >
          Rezept speichern
        </button>
        <a
          href="/rezepte"
          className="px-5 py-2.5 rounded-full bg-white shadow-sm text-stone-600 hover:bg-stone-100"
        >
          Abbrechen
        </a>
      </div>
    </form>
  );
}
