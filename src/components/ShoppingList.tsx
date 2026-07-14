import { useEffect, useMemo, useState } from 'react';
import { getAllRecipes } from '../lib/recipeStore';
import { WEEKDAYS, MEAL_TYPES, getMonday, toISODate, type Weekday, type MealType } from '../lib/week';

type WeekPlan = Record<Weekday, Record<MealType, string | null>>;

interface Item {
  name: string;
  checked: boolean;
}

function planKey(weekStartISO: string) {
  return `meal-plan:${weekStartISO}`;
}
function manualKey(weekStartISO: string) {
  return `shopping-list:${weekStartISO}:manual`;
}
function checkedKey(weekStartISO: string) {
  return `shopping-list:${weekStartISO}:checked`;
}

function loadAutoIngredientNames(weekStartISO: string): string[] {
  const raw = localStorage.getItem(planKey(weekStartISO));
  if (!raw) return [];
  try {
    const plan: WeekPlan = JSON.parse(raw);
    const recipeIds = new Set<string>();
    for (const day of WEEKDAYS) {
      for (const meal of MEAL_TYPES) {
        const id = plan?.[day]?.[meal];
        if (id) recipeIds.add(id);
      }
    }
    const names: string[] = [];
    const seen = new Set<string>();
    const recipes = getAllRecipes();
    for (const id of recipeIds) {
      const recipe = recipes.find((r) => r.id === id);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const key = ing.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          names.push(ing.trim());
        }
      }
    }
    return names;
  } catch {
    return [];
  }
}

export default function ShoppingList() {
  const weekStartISO = useMemo(() => toISODate(getMonday(new Date())), []);
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState('');

  function reload() {
    const autoNames = loadAutoIngredientNames(weekStartISO);
    const manual: string[] = JSON.parse(localStorage.getItem(manualKey(weekStartISO)) || '[]');
    const checked: Record<string, boolean> = JSON.parse(localStorage.getItem(checkedKey(weekStartISO)) || '{}');

    const list: Item[] = [...autoNames, ...manual].map((name) => ({
      name,
      checked: !!checked[name.toLowerCase()],
    }));
    setItems(list);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO]);

  function toggleChecked(name: string) {
    const checked: Record<string, boolean> = JSON.parse(localStorage.getItem(checkedKey(weekStartISO)) || '{}');
    const key = name.toLowerCase();
    checked[key] = !checked[key];
    localStorage.setItem(checkedKey(weekStartISO), JSON.stringify(checked));
    reload();
  }

  function addManualItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const manual: string[] = JSON.parse(localStorage.getItem(manualKey(weekStartISO)) || '[]');
    manual.push(trimmed);
    localStorage.setItem(manualKey(weekStartISO), JSON.stringify(manual));
    setNewItem('');
    reload();
  }

  function clearChecked() {
    const manual: string[] = JSON.parse(localStorage.getItem(manualKey(weekStartISO)) || '[]');
    const checked: Record<string, boolean> = JSON.parse(localStorage.getItem(checkedKey(weekStartISO)) || '{}');
    const remainingManual = manual.filter((name) => !checked[name.toLowerCase()]);
    localStorage.setItem(manualKey(weekStartISO), JSON.stringify(remainingManual));
    localStorage.setItem(checkedKey(weekStartISO), JSON.stringify({}));
    reload();
  }

  function clearAll() {
    if (!confirm('Ganze Liste leeren?')) return;
    localStorage.setItem(manualKey(weekStartISO), JSON.stringify([]));
    localStorage.setItem(checkedKey(weekStartISO), JSON.stringify({}));
    reload();
  }

  const openCount = items.filter((i) => !i.checked).length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
          placeholder="Artikel hinzufügen…"
          className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          onClick={addManualItem}
          className="px-3 py-2 rounded-xl bg-rose-200 text-rose-900 text-sm font-medium hover:bg-rose-300"
        >
          Hinzufügen
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>{openCount} offene Artikel</span>
        <div className="flex gap-3">
          <button onClick={clearChecked} className="hover:text-rose-600">
            Erledigte löschen
          </button>
          <button onClick={clearAll} className="hover:text-rose-600">
            Liste leeren
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-stone-400 text-sm">
          Noch keine Artikel. Füge Rezepte im Meal Plan hinzu, damit hier automatisch Zutaten erscheinen.
        </p>
      ) : (
        <ul className="bg-white rounded-2xl shadow-sm divide-y divide-stone-100">
          {items.map((item) => (
            <li key={item.name} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecked(item.name)}
                className="rounded"
              />
              <span className={item.checked ? 'line-through text-stone-400' : 'text-stone-800'}>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
