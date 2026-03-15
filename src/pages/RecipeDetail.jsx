import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById } from "../data/recipes";
import { getDayPlanForDate, setDayPlanForDate } from "../hooks/useDayPlan";
import { isCustomRecipe, deleteCustomRecipe } from "../hooks/useCustomRecipes";
import HeatLevel from "../components/HeatLevel";
import { ClockIcon } from "../components/Icons";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = getRecipeById(id);
  const isCustom = isCustomRecipe(id);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = () => {
    deleteCustomRecipe(id);
    navigate("/recipes");
  };

  if (!recipe) {
    return <p className="text-center text-warm-500 py-12">Recipe not found.</p>;
  }

  const handleAddToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    const plan = getDayPlanForDate(today);

    if (recipe.slot_type === "snack") {
      plan.snack = recipe.id;
    } else {
      if (!plan.meal_1) {
        plan.meal_1 = recipe.id;
      } else if (!plan.meal_2) {
        plan.meal_2 = recipe.id;
      } else {
        plan.meal_1 = recipe.id;
      }
    }

    setDayPlanForDate(today, plan);
    navigate("/");
  };

  // Group ingredients
  const groups = {};
  for (const ing of recipe.ingredients) {
    const g = ing.group || "main";
    if (!groups[g]) groups[g] = [];
    groups[g].push(ing);
  }
  const groupNames = Object.keys(groups);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-warm-500 hover:text-warm-700"
      >
        ← Back
      </button>

      <div>
        <h2 className="text-2xl font-bold text-warm-900">{recipe.name}</h2>
        <p className="text-warm-500 mt-1">{recipe.description}</p>
      </div>

      {/* Macros */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-warm-100 rounded-xl px-4 py-2 text-center">
          <div className="text-xl font-bold text-warm-800">{recipe.calories}</div>
          <div className="text-xs text-warm-500">kcal</div>
        </div>
        <div className="bg-warm-100 rounded-xl px-4 py-2 text-center">
          <div className="text-xl font-bold text-warm-800">{recipe.protein_g}g</div>
          <div className="text-xs text-warm-500">protein</div>
        </div>
        <div className="bg-warm-100 rounded-xl px-4 py-2 text-center">
          <div className="text-xl font-bold text-warm-800">{recipe.carbs_g}g</div>
          <div className="text-xs text-warm-500">carbs</div>
        </div>
        <div className="bg-warm-100 rounded-xl px-4 py-2 text-center">
          <div className="text-xl font-bold text-warm-800">{recipe.fat_g}g</div>
          <div className="text-xs text-warm-500">fat</div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-warm-600">
        <HeatLevel level={recipe.heat_level} />
        <span className="inline-flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{recipe.prep_time_min} min</span>
        <span className="px-2 py-0.5 bg-warm-100 rounded-full text-xs">{recipe.slot_type}</span>
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-spice-50 text-spice-400 border border-spice-200 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients */}
      <div className="bg-warm-100 rounded-2xl border border-warm-200 p-5">
        <h3 className="font-semibold text-warm-800 mb-3">Ingredients</h3>
        {groupNames.map((g) => (
          <div key={g} className="mb-3 last:mb-0">
            {groupNames.length > 1 && g !== "main" && (
              <div className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1 capitalize">
                {g}
              </div>
            )}
            <ul className="space-y-1">
              {groups[g].map((ing, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-warm-700">{ing.name}</span>
                  <span className="text-warm-500 tabular-nums">
                    {ing.amount} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-warm-100 rounded-2xl border border-warm-200 p-5">
        <h3 className="font-semibold text-warm-800 mb-3">Instructions</h3>
        <ol className="space-y-3">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-warm-700">
              <span className="flex-shrink-0 w-6 h-6 bg-warm-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Edit / Duplicate */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/edit/${recipe.id}`)}
          className="flex-1 py-3 bg-warm-100 text-warm-700 rounded-xl font-semibold hover:bg-warm-200 transition-colors"
        >
          {isCustom ? "Edit Recipe" : "Duplicate & Edit"}
        </button>
        <button
          onClick={handleAddToToday}
          className="flex-1 py-3 bg-warm-500 text-white rounded-xl font-semibold hover:bg-warm-600 transition-colors"
        >
          + Add to Today
        </button>
      </div>

      {/* Delete for custom */}
      {isCustom && (
        <div>
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete this recipe
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400 flex-1">Are you sure? This can't be undone.</p>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="text-sm text-warm-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
