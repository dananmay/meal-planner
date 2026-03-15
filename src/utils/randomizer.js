import { getAllRecipes } from "../data/recipes";
import { MAX_DAILY_CALORIES } from "./calories";
import { DEFAULT_SLOT_COUNT } from "../hooks/useDayPlan";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function surpriseMe(slotCount = DEFAULT_SLOT_COUNT, previousDayPlan = null) {
  const all = getAllRecipes();
  const meals = all.filter((r) => r.slot_type === "meal");
  const snacks = all.filter((r) => r.slot_type === "snack");

  const excludeIds = previousDayPlan
    ? (previousDayPlan.slots || []).filter(Boolean)
    : [];

  const shuffledMeals = shuffle(meals.filter((m) => !excludeIds.includes(m.id)));
  const shuffledSnacks = shuffle(snacks.filter((s) => !excludeIds.includes(s.id)));

  // Try (slotCount - 1) meals + 1 snack
  const mealCount = slotCount - 1;

  // Brute-force: try meal combos with a snack
  const mealCombos = getCombos(shuffledMeals, mealCount);
  for (const mealCombo of mealCombos) {
    const mealCals = mealCombo.reduce((s, m) => s + m.calories, 0);
    for (const snack of shuffledSnacks) {
      if (mealCals + snack.calories <= MAX_DAILY_CALORIES) {
        return { slots: [...mealCombo.map((m) => m.id), snack.id] };
      }
    }
  }

  // Fallback: pick lowest cal options
  const sortedMeals = [...meals].sort((a, b) => a.calories - b.calories);
  const sortedSnacks = [...snacks].sort((a, b) => a.calories - b.calories);
  const slots = [];
  for (let i = 0; i < mealCount; i++) {
    slots.push(sortedMeals[i]?.id || null);
  }
  slots.push(sortedSnacks[0]?.id || null);
  return { slots };
}

function getCombos(arr, count) {
  if (count === 0) return [[]];
  if (count === 1) return arr.map((item) => [item]);
  const results = [];
  for (let i = 0; i < arr.length && results.length < 200; i++) {
    const rest = arr.slice(i + 1);
    for (const combo of getCombos(rest, count - 1)) {
      results.push([arr[i], ...combo]);
      if (results.length >= 200) break;
    }
  }
  return results;
}

export function autoFillWeek(startDate) {
  const days = [];
  let prevDay = null;

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const combo = surpriseMe(DEFAULT_SLOT_COUNT, prevDay);
    const day = { date: dateStr, ...combo };
    days.push(day);
    prevDay = day;
  }
  return days;
}
