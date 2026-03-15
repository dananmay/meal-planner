import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDayPlan } from "../hooks/useDayPlan";
import { MAX_SLOT_COUNT } from "../hooks/useDayPlan";
import { getDayTotals, isOverBudget, suggestSwaps } from "../utils/calories";
import { surpriseMe } from "../utils/randomizer";
import { getRecipeById } from "../data/recipes";
import CalorieBudgetBar from "../components/CalorieBudgetBar";
import RecipeSlot from "../components/RecipeSlot";
import { ShuffleIcon } from "../components/Icons";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
}

export default function DailyPlanner() {
  const today = new Date().toISOString().split("T")[0];
  const { dayPlan, setSlot, clearSlot, setFullDay, swapSlots, addSlot, removeSlot } = useDayPlan(today);
  const { totalCal, totalProtein, totalCarbs, totalFat } = getDayTotals(dayPlan);
  const navigate = useNavigate();
  const [swapSuggestions, setSwapSuggestions] = useState(null);

  const handleBrowse = (index) => {
    navigate(`/recipes?pickFor=${index}`);
  };

  const handleSurprise = () => {
    const combo = surpriseMe(dayPlan.slots.length);
    setFullDay(combo);
    setSwapSuggestions(null);
  };

  const handleShowSwaps = (index) => {
    const swaps = suggestSwaps(dayPlan, index);
    setSwapSuggestions({ index, recipes: swaps });
  };

  const over = isOverBudget(dayPlan);
  const slots = dayPlan.slots;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">{formatDate(today)}</h2>
          <p className="text-warm-500 text-sm">Plan your meals for today</p>
        </div>
        <button
          onClick={handleSurprise}
          className="px-3 py-1.5 bg-spice-500 text-white rounded-lg text-sm font-medium hover:bg-spice-600 transition-colors inline-flex items-center gap-1.5"
        >
          <ShuffleIcon className="w-4 h-4" />
          Shuffle
        </button>
      </div>

      <CalorieBudgetBar totalCal={totalCal} totalProtein={totalProtein} totalCarbs={totalCarbs} totalFat={totalFat} />

      <div className="space-y-3">
        {slots.map((recipeId, idx) => (
          <div key={idx}>
            <RecipeSlot
              slotIndex={idx}
              recipeId={recipeId}
              onBrowse={() => handleBrowse(idx)}
              onClear={() => { clearSlot(idx); setSwapSuggestions(null); }}
              onSwapUp={idx > 0 ? () => swapSlots(idx, idx - 1) : null}
              onSwapDown={idx < slots.length - 1 ? () => swapSlots(idx, idx + 1) : null}
              onRemove={idx >= 3 ? () => { removeSlot(idx); setSwapSuggestions(null); } : null}
            />
            {over && recipeId && (
              <button
                onClick={() => handleShowSwaps(idx)}
                className="mt-1 text-xs text-spice-500 hover:text-spice-700 ml-4"
              >
                Show lower-calorie swaps →
              </button>
            )}
          </div>
        ))}

        {slots.length < MAX_SLOT_COUNT && (
          <button
            onClick={addSlot}
            className="w-full py-3 border-2 border-dashed border-warm-200 rounded-2xl text-warm-400 font-medium hover:border-warm-400 hover:text-warm-600 transition-colors"
          >
            + Add slot
          </button>
        )}
      </div>

      {swapSuggestions && swapSuggestions.recipes.length > 0 && (
        <div className="bg-spice-50 rounded-2xl p-4 border border-spice-100">
          <h3 className="text-sm font-semibold text-spice-700 mb-3">
            Swap suggestions for Slot {swapSuggestions.index + 1}
          </h3>
          <div className="space-y-2">
            {swapSuggestions.recipes.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-warm-100 rounded-xl p-3 border border-spice-100"
              >
                <div>
                  <span className="font-medium text-warm-800">{r.name}</span>
                  <span className="text-sm text-warm-500 ml-2">{r.calories} kcal · {r.protein_g}g P · {r.carbs_g}g C · {r.fat_g}g F</span>
                </div>
                <button
                  onClick={() => {
                    setSlot(swapSuggestions.index, r.id);
                    setSwapSuggestions(null);
                  }}
                  className="px-3 py-1 bg-spice-500 text-white text-sm rounded-lg hover:bg-spice-600"
                >
                  Swap
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
