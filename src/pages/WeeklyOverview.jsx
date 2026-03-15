import { useState } from "react";
import { useWeekPlan } from "../hooks/useWeekPlan";
import { getRecipeById } from "../data/recipes";
import { getDayTotals, MAX_DAILY_CALORIES, getBudgetStatus } from "../utils/calories";
import GroceryList from "./GroceryList";
import { MealIcon, SnackIcon } from "../components/Icons";

const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusBg = {
  green: "bg-emerald-900/30 border-emerald-800",
  yellow: "bg-amber-900/30 border-amber-800",
  orange: "bg-orange-900/30 border-orange-800",
  red: "bg-red-900/30 border-red-800",
};

export default function WeeklyOverview() {
  const { weekPlan, weekDates, autoFill, copyDay, refresh } = useWeekPlan();
  const [copyFrom, setCopyFrom] = useState(null);
  const [tab, setTab] = useState("plan");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-warm-900">This Week</h2>
          <div className="flex bg-warm-200 rounded-lg p-0.5">
            <button
              onClick={() => setTab("plan")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                tab === "plan"
                  ? "bg-warm-500 text-white"
                  : "text-warm-400 hover:text-warm-700"
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => setTab("grocery")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                tab === "grocery"
                  ? "bg-warm-500 text-white"
                  : "text-warm-400 hover:text-warm-700"
              }`}
            >
              Grocery
            </button>
          </div>
        </div>
        {tab === "plan" && (
          <button
            onClick={() => { autoFill(); }}
            className="px-4 py-2 bg-spice-500 text-white rounded-xl font-medium hover:bg-spice-600 transition-colors text-sm"
          >
            Auto-fill
          </button>
        )}
      </div>

      {tab === "grocery" ? (
        <GroceryList />
      ) : (
        <>
          <div className="space-y-3">
            {weekPlan.map((day, idx) => {
              const { totalCal, totalProtein, totalCarbs, totalFat } = getDayTotals(day);
              const status = totalCal > 0 ? getBudgetStatus(totalCal) : "green";
              const slots = day.slots || [];
              const filledRecipes = slots
                .filter(Boolean)
                .map((id) => getRecipeById(id))
                .filter(Boolean);
              const isEmpty = filledRecipes.length === 0;
              const dateStr = weekDates[idx];
              const isToday = dateStr === new Date().toISOString().split("T")[0];

              return (
                <div
                  key={dateStr}
                  className={`rounded-2xl border p-4 ${
                    isToday ? "ring-2 ring-warm-400 " : ""
                  }${isEmpty ? "bg-warm-100 border-warm-200" : statusBg[status]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-warm-800">{shortDays[new Date(dateStr + "T00:00:00").getDay()]}</span>
                      <span className="text-sm text-warm-500">{dateStr.slice(5)}</span>
                      {isToday && (
                        <span className="text-xs bg-warm-500 text-white px-2 py-0.5 rounded-full">Today</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {!isEmpty && (
                        <span className="text-warm-600">
                          <span className="font-semibold">{totalCal}</span> kcal ·{" "}
                          <span className="font-semibold">{totalProtein}g</span> P ·{" "}
                          <span className="font-semibold">{totalCarbs}g</span> C ·{" "}
                          <span className="font-semibold">{totalFat}g</span> F
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (copyFrom === null) {
                            setCopyFrom(idx);
                          } else {
                            copyDay(copyFrom, idx);
                            setCopyFrom(null);
                            refresh();
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          copyFrom === idx
                            ? "bg-warm-500 text-white"
                            : copyFrom !== null
                            ? "bg-warm-200 text-warm-700 hover:bg-warm-300"
                            : "text-warm-500 hover:text-warm-700"
                        }`}
                      >
                        {copyFrom === idx ? "Copying..." : copyFrom !== null ? "Paste here" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {isEmpty ? (
                    <p className="text-warm-400 text-sm">No meals planned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-sm">
                      {filledRecipes.map((recipe) => {
                        const Icon = recipe.slot_type === "snack" ? SnackIcon : MealIcon;
                        return (
                          <span key={recipe.id} className="bg-black/20 px-2.5 py-1 rounded-lg text-warm-700 inline-flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5 text-warm-500" />{recipe.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {copyFrom !== null && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-warm-200 text-warm-900 px-4 py-2 rounded-xl shadow-lg text-sm">
              Tap "Paste here" on another day ·{" "}
              <button onClick={() => setCopyFrom(null)} className="underline">
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
