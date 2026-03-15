import { getAllRecipes } from "../data/recipes";
import { MAX_DAILY_CALORIES } from "./calories";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function surpriseMe(previousDayPlan = null) {
  const all = getAllRecipes();
  const meals = all.filter((r) => r.slot_type === "meal");
  const snacks = all.filter((r) => r.slot_type === "snack");

  const excludeIds = previousDayPlan
    ? [previousDayPlan.meal_1, previousDayPlan.meal_2, previousDayPlan.snack].filter(Boolean)
    : [];

  const shuffledMeals = shuffle(meals.filter((m) => !excludeIds.includes(m.id)));
  const shuffledSnacks = shuffle(snacks.filter((s) => !excludeIds.includes(s.id)));

  for (const m1 of shuffledMeals) {
    for (const m2 of shuffledMeals) {
      if (m1.id === m2.id) continue;
      for (const s of shuffledSnacks) {
        const total = m1.calories + m2.calories + s.calories;
        if (total <= MAX_DAILY_CALORIES) {
          return { meal_1: m1.id, meal_2: m2.id, snack: s.id };
        }
      }
    }
  }
  // Fallback: pick lowest cal options
  const sortedMeals = [...meals].sort((a, b) => a.calories - b.calories);
  const sortedSnacks = [...snacks].sort((a, b) => a.calories - b.calories);
  return {
    meal_1: sortedMeals[0]?.id || null,
    meal_2: sortedMeals[1]?.id || null,
    snack: sortedSnacks[0]?.id || null,
  };
}

export function autoFillWeek(startDate) {
  const days = [];
  let prevDay = null;

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const combo = surpriseMe(prevDay);
    const day = { date: dateStr, ...combo };
    days.push(day);
    prevDay = day;
  }
  return days;
}
