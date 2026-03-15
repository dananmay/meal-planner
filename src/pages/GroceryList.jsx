import { useState, useMemo } from "react";
import { useWeekPlan } from "../hooks/useWeekPlan";
import { generateGroceryByRecipe } from "../utils/grocery";

const STORAGE_KEY = "mealplanner_grocery_checked";

function loadChecked() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecked(checked) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
}

function normalizeKey(name, unit) {
  return name.toLowerCase().replace(/\s+/g, " ").trim() + "|" + unit;
}

export default function GroceryList() {
  const { weekPlan, weekDates } = useWeekPlan();
  const { recipeGroups, ingredientRecipes } = useMemo(
    () => generateGroceryByRecipe(weekPlan, weekDates),
    [weekPlan, weekDates]
  );
  const [checked, setChecked] = useState(loadChecked);

  const totalItems = recipeGroups.reduce((sum, g) => sum + g.ingredients.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const toggle = (key) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveChecked(next);
      return next;
    });
  };

  const clearAll = () => {
    setChecked({});
    saveChecked({});
  };

  if (recipeGroups.length === 0) {
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-warm-900">Grocery List</h2>
        <p className="text-warm-500 text-center py-12">
          Plan your upcoming meals first, then come back for a grocery list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-warm-900">Grocery List</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-warm-500">
            {checkedCount}/{totalItems} items
          </span>
          {checkedCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-warm-500 hover:text-warm-700"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
        />
      </div>

      {recipeGroups.map((group) => (
        <div key={group.recipeId} className="bg-warm-100 rounded-2xl border border-warm-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-warm-200/50 border-b border-warm-200 flex items-center justify-between">
            <h3 className="font-semibold text-warm-700 text-sm">{group.recipeName}</h3>
            {group.dayCount > 1 && (
              <span className="text-xs text-warm-500">x{group.dayCount} days</span>
            )}
          </div>
          <ul className="divide-y divide-warm-200">
            {group.ingredients.map((item) => {
              const key = normalizeKey(item.name, item.unit) + "|" + group.recipeId;
              const isChecked = !!checked[key];
              const sharedKey = normalizeKey(item.name, item.unit);
              const sharedWith = (ingredientRecipes[sharedKey] || []).filter(
                (name) => name !== group.recipeName
              );

              return (
                <li
                  key={key}
                  onClick={() => toggle(key)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    isChecked ? "bg-warm-200/30" : "hover:bg-warm-200/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-warm-300"
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-sm block ${
                          isChecked ? "text-warm-400 line-through" : "text-warm-700"
                        }`}
                      >
                        {item.name}
                      </span>
                      {sharedWith.length > 0 && (
                        <span className="text-xs text-warm-400 block truncate">
                          also in: {sharedWith.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm tabular-nums flex-shrink-0 ml-3 ${isChecked ? "text-warm-300" : "text-warm-500"}`}>
                    {Number.isInteger(item.amount)
                      ? item.amount
                      : item.amount.toFixed(1)}{" "}
                    {item.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
