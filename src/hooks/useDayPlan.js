import { useState, useCallback } from "react";

const STORAGE_KEY = "mealplanner_days";
export const DEFAULT_SLOT_COUNT = 3;
export const MAX_SLOT_COUNT = 4;

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

function migrateDayPlan(plan) {
  if (Array.isArray(plan.slots)) return plan;
  return {
    date: plan.date,
    slots: [plan.meal_1 || null, plan.meal_2 || null, plan.snack || null],
  };
}

function emptyPlan(dateKey) {
  return { date: dateKey, slots: [null, null, null] };
}

export function useDayPlan(date) {
  const dateKey = date || todayStr();
  const [dayPlan, setDayPlan] = useState(() => {
    const all = loadAllDays();
    const raw = all[dateKey];
    return raw ? migrateDayPlan(raw) : emptyPlan(dateKey);
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
    (index, recipeId) => {
      setDayPlan((prev) => {
        const slots = [...prev.slots];
        slots[index] = recipeId;
        const next = { ...prev, slots };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearSlot = useCallback(
    (index) => {
      setDayPlan((prev) => {
        const slots = [...prev.slots];
        slots[index] = null;
        const next = { ...prev, slots };
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
    (idxA, idxB) => {
      setDayPlan((prev) => {
        const slots = [...prev.slots];
        [slots[idxA], slots[idxB]] = [slots[idxB], slots[idxA]];
        const next = { ...prev, slots };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addSlot = useCallback(() => {
    setDayPlan((prev) => {
      if (prev.slots.length >= MAX_SLOT_COUNT) return prev;
      const next = { ...prev, slots: [...prev.slots, null] };
      persist(next);
      return next;
    });
  }, [persist]);

  const removeSlot = useCallback(
    (index) => {
      setDayPlan((prev) => {
        if (prev.slots.length <= DEFAULT_SLOT_COUNT) return prev;
        const slots = prev.slots.filter((_, i) => i !== index);
        const next = { ...prev, slots };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { dayPlan, setSlot, clearSlot, setFullDay, swapSlots, addSlot, removeSlot };
}

export function getDayPlanForDate(date) {
  const all = loadAllDays();
  const raw = all[date];
  return raw ? migrateDayPlan(raw) : emptyPlan(date);
}

export function setDayPlanForDate(date, plan) {
  const all = loadAllDays();
  all[date] = { date, ...plan };
  saveAllDays(all);
}
