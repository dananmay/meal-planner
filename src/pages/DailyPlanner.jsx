import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDayPlan } from "../hooks/useDayPlan";
import { getDayTotals, isOverBudget, suggestSwaps } from "../utils/calories";
import { surpriseMe } from "../utils/randomizer";
import { getRecipeById } from "../data/recipes";
import CalorieBudgetBar from "../components/CalorieBudgetBar";
import RecipeSlot from "../components/RecipeSlot";
import RecipeCard from "../components/RecipeCard";
import { ShuffleIcon } from "../components/Icons";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
}

export default function DailyPlanner() {
  const today = new Date().toISOString().split("T")[0];
  const { dayPlan, setSlot, clearSlot, setFullDay, swapSlots } = useDayPlan(today);
  const { totalCal, totalProtein, totalCarbs, totalFat } = getDayTotals(dayPlan);
  const navigate = useNavigate();
  const [swapSuggestions, setSwapSuggestions] = useState(null);

  const handleBrowse = (slot) => {
    const filter = slot === "snack" ? "snack" : "meal";
    navigate(`/recipes?pickFor=${slot}&type=${filter}`);
  };

  const handleSurprise = () => {
    const combo = surpriseMe();
    setFullDay(combo);
    setSwapSuggestions(null);
  };

  const handleShowSwaps = (slot) => {
    const swaps = suggestSwaps(dayPlan, slot);
    setSwapSuggestions({ slot, recipes: swaps });
  };

  const over = isOverBudget(dayPlan);
  const slots = ["meal_1", "meal_2", "snack"];

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
        {slots.map((slot, idx) => (
          <div key={slot}>
            <RecipeSlot
              slotKey={slot}
              recipeId={dayPlan[slot]}
              onBrowse={() => handleBrowse(slot)}
              onClear={() => { clearSlot(slot); setSwapSuggestions(null); }}
              onSwapUp={idx > 0 && slot !== "snack" && slots[idx - 1] !== "snack" ? () => swapSlots(slot, slots[idx - 1]) : null}
              onSwapDown={idx < 1 && slots[idx + 1] !== "snack" ? () => swapSlots(slot, slots[idx + 1]) : null}
              showSwap={slot !== "snack"}
            />
            {over && dayPlan[slot] && (
              <button
                onClick={() => handleShowSwaps(slot)}
                className="mt-1 text-xs text-spice-500 hover:text-spice-700 ml-4"
              >
                Show lower-calorie swaps →
              </button>
            )}
          </div>
        ))}
      </div>

      {swapSuggestions && swapSuggestions.recipes.length > 0 && (
        <div className="bg-spice-50 rounded-2xl p-4 border border-spice-100">
          <h3 className="text-sm font-semibold text-spice-700 mb-3">
            Swap suggestions for {swapSuggestions.slot.replace("_", " ")}
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
                    setSlot(swapSuggestions.slot, r.id);
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
