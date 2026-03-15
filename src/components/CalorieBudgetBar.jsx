import { MAX_DAILY_CALORIES, getBudgetStatus } from "../utils/calories";

const statusColors = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  orange: "bg-orange-500",
  red: "bg-red-600",
};

const statusTextColors = {
  green: "text-emerald-400",
  yellow: "text-amber-400",
  orange: "text-orange-400",
  red: "text-red-400",
};

export default function CalorieBudgetBar({ totalCal, totalProtein, totalCarbs, totalFat }) {
  const pct = Math.min((totalCal / MAX_DAILY_CALORIES) * 100, 100);
  const status = getBudgetStatus(totalCal);
  const remaining = MAX_DAILY_CALORIES - totalCal;

  return (
    <div className="bg-warm-100 rounded-2xl p-4 border border-warm-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-warm-800">{totalCal}</span>
          <span className="text-warm-500 text-sm">/ {MAX_DAILY_CALORIES} kcal</span>
        </div>
        <span className={`text-sm font-medium ${statusTextColors[status]}`}>
          {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over!`}
        </span>
      </div>
      <div className="flex gap-4 text-sm mb-2">
        <span className="text-warm-600">
          <span className="font-semibold text-warm-800">{totalProtein}g</span> protein
        </span>
        <span className="text-warm-600">
          <span className="font-semibold text-warm-800">{totalCarbs}g</span> carbs
        </span>
        <span className="text-warm-600">
          <span className="font-semibold text-warm-800">{totalFat}g</span> fat
        </span>
      </div>
      <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusColors[status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {totalCal > MAX_DAILY_CALORIES && (
        <p className="text-red-400 text-sm mt-2 font-medium">
          Over budget! Remove or swap a recipe to stay within {MAX_DAILY_CALORIES} kcal.
        </p>
      )}
    </div>
  );
}
