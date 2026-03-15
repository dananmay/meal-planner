import { useState, useCallback } from "react";
import { getDayPlanForDate, setDayPlanForDate } from "./useDayPlan";
import { autoFillWeek } from "../utils/randomizer";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function useWeekPlan() {
  const startDate = getToday();
  const weekDates = getWeekDates(startDate);

  const [weekPlan, setWeekPlan] = useState(() =>
    weekDates.map((d) => getDayPlanForDate(d))
  );

  const refresh = useCallback(() => {
    setWeekPlan(weekDates.map((d) => getDayPlanForDate(d)));
  }, [weekDates.join(",")]);

  const copyDay = useCallback(
    (fromIdx, toIdx) => {
      const source = weekPlan[fromIdx];
      const targetDate = weekDates[toIdx];
      const newPlan = { meal_1: source.meal_1, meal_2: source.meal_2, snack: source.snack };
      setDayPlanForDate(targetDate, newPlan);
      refresh();
    },
    [weekPlan, weekDates, refresh]
  );

  const autoFill = useCallback(() => {
    const filled = autoFillWeek(startDate);
    for (const day of filled) {
      setDayPlanForDate(day.date, day);
    }
    setWeekPlan(filled.map((d) => ({ ...d, date: d.date })));
  }, [startDate]);

  return { weekPlan, weekDates, startDate, copyDay, autoFill, refresh };
}
