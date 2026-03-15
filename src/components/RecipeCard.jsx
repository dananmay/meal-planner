import { Link } from "react-router-dom";
import HeatLevel from "./HeatLevel";
import { MealIcon, SnackIcon, ClockIcon } from "./Icons";

const slotIcons = { meal: MealIcon, snack: SnackIcon };

export default function RecipeCard({ recipe, onAdd, compact = false }) {
  return (
    <div className="bg-warm-100 rounded-2xl border border-warm-200 hover:border-warm-300 transition-colors overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={`/recipe/${recipe.id}`}
            className="text-warm-900 font-semibold hover:text-warm-600 transition-colors leading-tight inline-flex items-center gap-1.5"
          >
            {(() => { const Icon = slotIcons[recipe.slot_type]; return Icon ? <Icon className="w-4 h-4 text-warm-500 shrink-0" /> : null; })()}
            {recipe.name}
          </Link>
        </div>

        {!compact && (
          <p className="text-warm-500 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-warm-600 mb-3">
          <span className="font-semibold text-warm-800">{recipe.calories} kcal</span>
          <span>{recipe.protein_g}g P</span>
          <span>{recipe.carbs_g}g C</span>
          <span>{recipe.fat_g}g F</span>
          <span className="inline-flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{recipe.prep_time_min} min</span>
        </div>

        <div className="flex items-center justify-between">
          <HeatLevel level={recipe.heat_level} size="text-sm" />
          {onAdd && (
            <button
              onClick={() => onAdd(recipe)}
              className="px-3 py-1.5 bg-warm-500 text-white text-sm rounded-lg font-medium hover:bg-warm-600 transition-colors"
            >
              + Add
            </button>
          )}
        </div>

        {!compact && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-spice-50 text-spice-400 border border-spice-200 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
