import { useEffect, useMemo, useState } from 'react';
import type { Recipe } from '../data/recipes';
import { getAllRecipes } from '../lib/recipeStore';
import {
  WEEKDAYS,
  MEAL_TYPES,
  getMonday,
  addDays,
  toISODate,
  formatWeekLabel,
  type Weekday,
  type MealType,
} from '../lib/week';

type Slot = string | null;
type DayPlan = Record<MealType, Slot>;
type WeekPlan = Record<Weekday, DayPlan>;

const CATEGORY_ORDER: Recipe['category'][] = ['Frühstück', 'Kochen', 'Backen'];

function emptyWeekPlan(): WeekPlan {
  const plan = {} as WeekPlan;
  for (const day of WEEKDAYS) {
    const dayPlan = {} as DayPlan;
    for (const meal of MEAL_TYPES) dayPlan[meal] = null;
    plan[day] = dayPlan;
  }
  return plan;
}

function storageKey(weekStartISO: string) {
  return `meal-plan:${weekStartISO}`;
}

function loadWeekPlan(weekStartISO: string): WeekPlan {
  const base = emptyWeekPlan();
  const raw = localStorage.getItem(storageKey(weekStartISO));
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw);
    for (const day of WEEKDAYS) {
      for (const meal of MEAL_TYPES) {
        if (parsed?.[day]?.[meal]) base[day][meal] = parsed[day][meal];
      }
    }
  } catch {
    // ignore malformed storage
  }
  return base;
}

export default function WeekPlanBoard() {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const [plan, setPlan] = useState<WeekPlan>(() => emptyWeekPlan());
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setRecipes(getAllRecipes());
  }, []);

  useEffect(() => {
    setPlan(loadWeekPlan(weekStartISO));
    setOpenSlot(null);
  }, [weekStartISO]);

  function updatePlan(day: Weekday, meal: MealType, recipeId: Slot) {
    setPlan((prev) => {
      const next: WeekPlan = { ...prev, [day]: { ...prev[day], [meal]: recipeId } };
      localStorage.setItem(storageKey(weekStartISO), JSON.stringify(next));
      return next;
    });
  }

  function resetWeek() {
    if (!confirm('Die aktuelle Woche wirklich leeren?')) return;
    setPlan(emptyWeekPlan());
    localStorage.removeItem(storageKey(weekStartISO));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-stone-100 flex items-center justify-center"
            aria-label="Vorherige Woche"
          >
            ←
          </button>
          <div className="font-medium text-stone-700 min-w-[130px] text-center">
            {formatWeekLabel(weekStart)}
          </div>
          <button
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-stone-100 flex items-center justify-center"
            aria-label="Nächste Woche"
          >
            →
          </button>
        </div>
        <button
          onClick={resetWeek}
          className="text-sm px-3 py-1.5 rounded-full bg-white shadow-sm hover:bg-stone-100 text-stone-600"
        >
          Woche zurücksetzen
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="min-w-[210px] bg-white rounded-2xl shadow-sm p-4 flex-shrink-0">
            <div className="font-semibold text-stone-700 mb-3">
              {day} <span className="text-xs text-stone-400">{toISODate(addDays(weekStart, i)).slice(5)}</span>
            </div>
            <div className="space-y-3 text-sm">
              {MEAL_TYPES.map((meal) => {
                const recipeId = plan[day][meal];
                const recipe = recipeId ? recipes.find((r) => r.id === recipeId) : null;
                const slotKey = `${day}:${meal}`;
                return (
                  <div key={meal}>
                    <div className="text-[11px] uppercase tracking-wide text-stone-400 mb-1">{meal}</div>
                    {recipe ? (
                      <div className="flex items-center justify-between gap-1 rounded-xl bg-stone-50 px-2 py-2">
                        <a href={`/rezepte/${recipe.id}`} className="flex items-center gap-1.5 min-w-0">
                          <span>{recipe.emoji}</span>
                          <span className="truncate">{recipe.name}</span>
                        </a>
                        <button
                          onClick={() => updatePlan(day, meal, null)}
                          className="text-stone-400 hover:text-rose-600 flex-shrink-0"
                          aria-label="Entfernen"
                        >
                          ×
                        </button>
                      </div>
                    ) : openSlot === slotKey ? (
                      <select
                        autoFocus
                        className="w-full rounded-xl border border-stone-200 px-2 py-2 text-sm"
                        onChange={(e) => {
                          if (e.target.value) updatePlan(day, meal, e.target.value);
                          setOpenSlot(null);
                        }}
                        onBlur={() => setOpenSlot(null)}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Rezept wählen…
                        </option>
                        {CATEGORY_ORDER.map((cat) => (
                          <optgroup key={cat} label={cat}>
                            {recipes
                              .filter((r) => r.category === cat)
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.emoji} {r.name}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setOpenSlot(slotKey)}
                        className="w-full rounded-xl border border-dashed border-stone-200 text-stone-400 px-2 py-3 text-center hover:border-rose-300 hover:text-rose-500"
                      >
                        + Rezept
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
