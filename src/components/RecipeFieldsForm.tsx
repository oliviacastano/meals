import { useRef, useState } from 'react';
import type { Recipe, RecipeCategory } from '../data/recipes';
import { resizeImageFile } from '../lib/image';
import type { RecipeEditableFields } from '../lib/recipeStore';

const CATEGORIES: RecipeCategory[] = ['Frühstück', 'Kochen', 'Backen'];

function linesToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function RecipeFieldsForm({
  initialRecipe,
  initialImage,
  submitLabel,
  onCancel,
  onDelete,
  onSubmit,
}: {
  initialRecipe?: Recipe;
  initialImage?: string | null;
  submitLabel: string;
  onCancel?: () => void;
  onDelete?: () => void;
  onSubmit: (values: RecipeEditableFields, image: string | null) => void;
}) {
  const [name, setName] = useState(initialRecipe?.name ?? '');
  const [emoji, setEmoji] = useState(initialRecipe?.emoji ?? '🍽️');
  const [category, setCategory] = useState<RecipeCategory>(initialRecipe?.category ?? 'Kochen');
  const [ingredients, setIngredients] = useState(initialRecipe?.ingredients.join('\n') ?? '');
  const [instructions, setInstructions] = useState(initialRecipe?.instructions.join('\n') ?? '');
  const [servings, setServings] = useState(initialRecipe?.servings?.toString() ?? '');
  const [calories, setCalories] = useState(initialRecipe?.calories ?? '');
  const [protein, setProtein] = useState(initialRecipe?.protein ?? '');
  const [carbs, setCarbs] = useState(initialRecipe?.carbs ?? '');
  const [fat, setFat] = useState(initialRecipe?.fat ?? '');
  const [link, setLink] = useState(initialRecipe?.link ?? '');
  const [tags, setTags] = useState(initialRecipe?.tags.join(', ') ?? '');
  const [image, setImage] = useState<string | null>(initialImage ?? null);
  const [error, setError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Bitte eine Bilddatei auswählen.');
      return;
    }
    try {
      setImage(await resizeImageFile(file));
      setError('');
    } catch {
      setError('Bild konnte nicht verarbeitet werden.');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Bitte gib einen Namen ein.');
      return;
    }
    onSubmit(
      {
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
      },
      image,
    );
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Foto</label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0])}
        />
        <div className="flex items-center gap-3">
          {image && <img src={image} alt="Vorschau" className="w-20 h-20 object-cover rounded-xl shadow-sm" />}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="px-4 py-2 rounded-full bg-white shadow-sm text-stone-600 hover:bg-stone-100 text-sm"
          >
            {image ? 'Foto ändern' : '📷 Foto hinzufügen'}
          </button>
          {image && (
            <button
              type="button"
              onClick={() => setImage(null)}
              className="px-4 py-2 rounded-full bg-white shadow-sm text-stone-600 hover:bg-stone-100 text-sm"
            >
              Entfernen
            </button>
          )}
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
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full bg-white shadow-sm text-stone-600 hover:bg-stone-100"
          >
            Abbrechen
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-5 py-2.5 rounded-full bg-white shadow-sm text-rose-600 hover:bg-rose-50 ml-auto"
          >
            Rezept löschen
          </button>
        )}
      </div>
    </form>
  );
}
