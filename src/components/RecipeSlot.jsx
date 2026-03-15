import { Link } from "react-router-dom";
import { getRecipeById } from "../data/recipes";
import HeatLevel from "./HeatLevel";
import { MealIcon, SnackIcon } from "./Icons";

function getSlotLabel(index, recipe) {
  if (!recipe) return `Slot ${index + 1}`;
  return recipe.slot_type === "snack" ? "Snack" : "Meal";
}

function getSlotIcon(recipe) {
  return recipe?.slot_type === "snack" ? SnackIcon : MealIcon;
}

export default function RecipeSlot({ slotIndex, recipeId, onBrowse, onClear, onSwapUp, onSwapDown, onRemove }) {
  const recipe = recipeId ? getRecipeById(recipeId) : null;
  const label = getSlotLabel(slotIndex, recipe);
  const Icon = getSlotIcon(recipe);

  if (!recipe) {
    return (
      <div className="bg-warm-100 rounded-2xl border border-warm-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-warm-400 font-medium">
          <Icon className="w-5 h-5" />
          {label}
        </div>
        <div className="flex items-center gap-2">
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-2 py-1.5 text-warm-400 hover:text-red-500 text-sm transition-colors"
              title="Remove slot"
            >
              ✕
            </button>
          )}
          <button
            onClick={onBrowse}
            className="px-4 py-2 bg-warm-500 text-white rounded-lg font-medium hover:bg-warm-600 transition-colors"
          >
            Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-100 rounded-2xl border border-warm-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-warm-400 font-medium uppercase tracking-wide mb-1">
            {label}
          </div>
          <Link
            to={`/recipe/${recipe.id}`}
            className="text-warm-900 font-semibold hover:text-warm-600 transition-colors inline-flex items-center gap-1.5"
          >
            <Icon className="w-4 h-4 text-warm-500" />
            {recipe.name}
          </Link>
          <div className="flex items-center gap-3 mt-2 text-sm text-warm-600">
            <span className="font-semibold text-warm-800">{recipe.calories} kcal</span>
            <span>{recipe.protein_g}g P</span>
            <span>{recipe.carbs_g}g C</span>
            <span>{recipe.fat_g}g F</span>
            <HeatLevel level={recipe.heat_level} size="text-xs" />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(onSwapUp || onSwapDown) && (
            <div className="flex flex-col gap-0.5 mr-1">
              {onSwapUp && (
                <button onClick={onSwapUp} className="text-warm-400 hover:text-warm-600 text-xs leading-none" title="Move up">▲</button>
              )}
              {onSwapDown && (
                <button onClick={onSwapDown} className="text-warm-400 hover:text-warm-600 text-xs leading-none" title="Move down">▼</button>
              )}
            </div>
          )}
          <button
            onClick={onBrowse}
            className="px-3 py-1.5 text-warm-500 border border-warm-200 rounded-lg text-sm hover:bg-warm-200 transition-colors"
          >
            Swap
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1.5 text-warm-400 hover:text-red-500 text-sm transition-colors"
            title="Remove"
          >
            ✕
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-2 py-1.5 text-warm-300 hover:text-red-500 text-xs transition-colors"
              title="Remove slot"
            >
              ⊖
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
