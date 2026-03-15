import { getAllRecipes } from "../data/recipes";
import { MAX_DAILY_CALORIES } from "./calories";
import { DEFAULT_SLOT_COUNT } from "../hooks/useDayPlan";

const MIN_DAILY_CALORIES = 1050;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fill empty slots in an existing day plan.
 * Keeps already-filled slots unchanged. Any recipe type can fill any slot.
 * Targets total between MIN_DAILY_CALORIES and MAX_DAILY_CALORIES.
 */
export function surpriseMe(currentSlots = [], previousDayPlan = null) {
  const all = getAllRecipes();

  // IDs already locked in (filled slots + previous day for variety)
  const filledIds = currentSlots.filter(Boolean);
  const prevIds = previousDayPlan
    ? (previousDayPlan.slots || []).filter(Boolean)
    : [];
  const excludeIds = [...new Set([...filledIds, ...prevIds])];

  // Calories already committed by filled slots
  const filledCals = filledIds.reduce((sum, id) => {
    const r = all.find((rec) => rec.id === id);
    return sum + (r ? r.calories : 0);
  }, 0);

  const emptyCount = currentSlots.filter((s) => !s).length;
  if (emptyCount === 0) return { slots: [...currentSlots] };

  const candidates = shuffle(all.filter((r) => !excludeIds.includes(r.id)));

  // Try to find a combo of `emptyCount` recipes that lands in the calorie target
  const combos = getCombos(candidates, emptyCount, 500);
  for (const combo of combos) {
    const comboCals = combo.reduce((s, r) => s + r.calories, 0);
    const total = filledCals + comboCals;
    if (total >= MIN_DAILY_CALORIES && total <= MAX_DAILY_CALORIES) {
      return buildResult(currentSlots, combo);
    }
  }

  // Fallback: find combo closest to MAX_DAILY_CALORIES without exceeding it
  let bestCombo = null;
  let bestTotal = 0;
  for (const combo of getCombos(candidates, emptyCount, 500)) {
    const comboCals = combo.reduce((s, r) => s + r.calories, 0);
    const total = filledCals + comboCals;
    if (total <= MAX_DAILY_CALORIES && total > bestTotal) {
      bestTotal = total;
      bestCombo = combo;
    }
  }

  if (bestCombo) return buildResult(currentSlots, bestCombo);

  // Last resort: pick lowest calorie recipes
  const sorted = [...candidates].sort((a, b) => a.calories - b.calories);
  return buildResult(currentSlots, sorted.slice(0, emptyCount));
}

function buildResult(currentSlots, recipes) {
  const slots = [...currentSlots];
  let ri = 0;
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i] && ri < recipes.length) {
      slots[i] = recipes[ri].id;
      ri++;
    }
  }
  return { slots };
}

function getCombos(arr, count, limit = 200) {
  if (count === 0) return [[]];
  if (count === 1) return arr.slice(0, limit).map((item) => [item]);
  const results = [];
  for (let i = 0; i < arr.length && results.length < limit; i++) {
    const rest = arr.slice(i + 1);
    for (const combo of getCombos(rest, count - 1, limit - results.length)) {
      results.push([arr[i], ...combo]);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function autoFillWeek(startDate, existingPlans = []) {
  const days = [];
  let prevDay = null;

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const existing = existingPlans[i];
    const currentSlots = existing?.slots || new Array(DEFAULT_SLOT_COUNT).fill(null);

    const combo = surpriseMe(currentSlots, prevDay);
    const day = { date: dateStr, ...combo };
    days.push(day);
    prevDay = day;
  }
  return days;
}
