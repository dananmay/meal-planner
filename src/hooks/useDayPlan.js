import { useState, useCallback } from "react";

const STORAGE_KEY = "mealplanner_days";

function loadAllDays() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAllDays(days) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function useDayPlan(date) {
  const dateKey = date || todayStr();
  const [dayPlan, setDayPlan] = useState(() => {
    const all = loadAllDays();
    return all[dateKey] || { date: dateKey, meal_1: null, meal_2: null, snack: null };
  });

  const persist = useCallback(
    (plan) => {
      const all = loadAllDays();
      all[dateKey] = plan;
      saveAllDays(all);
    },
    [dateKey]
  );

  const setSlot = useCallback(
    (slot, recipeId) => {
      setDayPlan((prev) => {
        const next = { ...prev, [slot]: recipeId };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearSlot = useCallback(
    (slot) => {
      setDayPlan((prev) => {
        const next = { ...prev, [slot]: null };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setFullDay = useCallback(
    (plan) => {
      const next = { date: dateKey, ...plan };
      setDayPlan(next);
      persist(next);
    },
    [dateKey, persist]
  );

  const swapSlots = useCallback(
    (slotA, slotB) => {
      setDayPlan((prev) => {
        const next = { ...prev, [slotA]: prev[slotB], [slotB]: prev[slotA] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { dayPlan, setSlot, clearSlot, setFullDay, swapSlots };
}

export function getDayPlanForDate(date) {
  const all = loadAllDays();
  return all[date] || { date, meal_1: null, meal_2: null, snack: null };
}

export function setDayPlanForDate(date, plan) {
  const all = loadAllDays();
  all[date] = { date, ...plan };
  saveAllDays(all);
}
