import { getAllRecipes } from "../data/recipes";

export const MAX_DAILY_CALORIES = 1250;

export function getDayTotals(dayPlan) {
  let totalCal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const slots = dayPlan.slots || [];
  for (const id of slots) {
    if (id) {
      const r = getAllRecipes().find((rec) => rec.id === id);
      if (r) {
        totalCal += r.calories;
        totalProtein += r.protein_g;
        totalCarbs += r.carbs_g || 0;
        totalFat += r.fat_g || 0;
      }
    }
  }
  return { totalCal, totalProtein, totalCarbs, totalFat };
}

export function getRemainingCalories(dayPlan) {
  const { totalCal } = getDayTotals(dayPlan);
  return MAX_DAILY_CALORIES - totalCal;
}

export function isOverBudget(dayPlan) {
  return getDayTotals(dayPlan).totalCal > MAX_DAILY_CALORIES;
}

export function getBudgetStatus(totalCal) {
  const pct = totalCal / MAX_DAILY_CALORIES;
  if (pct <= 0.75) return "green";
  if (pct <= 0.95) return "yellow";
  if (pct <= 1.0) return "orange";
  return "red";
}

export function suggestSwaps(dayPlan, slotIndex) {
  const slots = dayPlan.slots || [];
  const currentId = slots[slotIndex];
  if (!currentId) return [];
  const currentRecipe = getAllRecipes().find((r) => r.id === currentId);
  if (!currentRecipe) return [];

  const otherSlotIds = slots.filter((id, i) => i !== slotIndex && id);

  const otherCals = otherSlotIds.reduce((sum, id) => {
    const r = getAllRecipes().find((rec) => rec.id === id);
    return sum + (r ? r.calories : 0);
  }, 0);

  const maxForSlot = MAX_DAILY_CALORIES - otherCals;

  return getAllRecipes()
    .filter((r) => {
      if (r.id === currentId) return false;
      if (r.calories > maxForSlot) return false;
      if (otherSlotIds.includes(r.id)) return false;
      return r.calories < currentRecipe.calories;
    })
    .sort((a, b) => b.calories - a.calories)
    .slice(0, 3);
}
