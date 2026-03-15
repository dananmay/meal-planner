import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllRecipes, allTags } from "../data/recipes";
import { setDayPlanForDate, getDayPlanForDate } from "../hooks/useDayPlan";
import RecipeCard from "../components/RecipeCard";

export default function RecipeBank() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pickFor = searchParams.get("pickFor");

  const [search, setSearch] = useState("");
  const [slotType, setSlotType] = useState("all");
  const [maxCal, setMaxCal] = useState(600);
  const [minProtein, setMinProtein] = useState(0);
  const [prepTime, setPrepTime] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [heatFilter, setHeatFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const recipes = getAllRecipes();
    return recipes.filter((r) => {
      if (slotType !== "all" && r.slot_type !== slotType) return false;
      if (r.calories > maxCal) return false;
      if (r.protein_g < minProtein) return false;
      if (heatFilter > 0 && r.heat_level < heatFilter) return false;
      if (prepTime === "<15" && r.prep_time_min >= 15) return false;
      if (prepTime === "15-30" && (r.prep_time_min < 15 || r.prep_time_min > 30)) return false;
      if (prepTime === "30+" && r.prep_time_min < 30) return false;
      if (selectedTags.length > 0 && !selectedTags.some((t) => r.tags.includes(t))) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = r.name.toLowerCase().includes(q);
        const ingMatch = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
        if (!nameMatch && !ingMatch) return false;
      }
      return true;
    });
  }, [search, slotType, maxCal, minProtein, prepTime, selectedTags, heatFilter]);

  const handleAdd = (recipe) => {
    if (pickFor !== null) {
      const today = new Date().toISOString().split("T")[0];
      const plan = getDayPlanForDate(today);
      const idx = parseInt(pickFor, 10);
      const slots = [...plan.slots];
      slots[idx] = recipe.id;
      setDayPlanForDate(today, { slots });
      navigate("/");
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-warm-900">
          {pickFor !== null ? `Pick for Slot ${parseInt(pickFor) + 1}` : "Recipe Bank"}
        </h2>
        {pickFor !== null ? (
          <button
            onClick={() => navigate("/")}
            className="text-sm text-warm-500 hover:text-warm-700"
          >
            ← Back to planner
          </button>
        ) : (
          <button
            onClick={() => navigate("/import")}
            className="px-3 py-1.5 bg-warm-200 text-warm-700 text-sm rounded-lg font-medium hover:bg-warm-300 transition-colors"
          >
            + Import
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search recipes or ingredients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-200 text-warm-800 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-500"
      />

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-sm text-warm-500 hover:text-warm-700 font-medium"
      >
        {showFilters ? "Hide filters ▲" : "Show filters ▼"}
      </button>

      {showFilters && (
        <div className="bg-warm-100 rounded-2xl border border-warm-200 p-4 space-y-4">
          {/* Slot type */}
          <div className="flex gap-2">
            {["all", "meal", "snack"].map((t) => (
              <button
                key={t}
                onClick={() => setSlotType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  slotType === t ? "bg-warm-500 text-white" : "bg-warm-100 text-warm-600"
                }`}
              >
                {t === "all" ? "All" : t === "meal" ? "Meals" : "Snacks"}
              </button>
            ))}
          </div>

          {/* Calorie slider */}
          <div>
            <label className="text-sm text-warm-600">Max calories: {maxCal} kcal</label>
            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={maxCal}
              onChange={(e) => setMaxCal(Number(e.target.value))}
              className="w-full accent-warm-500"
            />
          </div>

          {/* Protein slider */}
          <div>
            <label className="text-sm text-warm-600">Min protein: {minProtein}g</label>
            <input
              type="range"
              min={0}
              max={35}
              step={1}
              value={minProtein}
              onChange={(e) => setMinProtein(Number(e.target.value))}
              className="w-full accent-warm-500"
            />
          </div>

          {/* Prep time */}
          <div className="flex gap-2">
            {[
              { val: "all", label: "Any time" },
              { val: "<15", label: "<15 min" },
              { val: "15-30", label: "15-30 min" },
              { val: "30+", label: "30+ min" },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPrepTime(p.val)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  prepTime === p.val ? "bg-warm-500 text-white" : "bg-warm-100 text-warm-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Heat filter */}
          <div>
            <label className="text-sm text-warm-600 block mb-1">Min heat level</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((h) => (
                <button
                  key={h}
                  onClick={() => setHeatFilter(h)}
                  className={`px-2.5 py-1 rounded-lg text-sm transition-colors ${
                    heatFilter === h ? "bg-spice-500 text-white" : "bg-warm-100 text-warm-600"
                  }`}
                >
                  {h === 0 ? "Any" : "🌶️".repeat(h)}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-spice-500 text-white"
                    : "bg-warm-100 text-warm-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="text-sm text-warm-500">{filtered.length} recipes</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onAdd={pickFor !== null ? handleAdd : null}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-warm-400 py-8">No recipes match your filters.</p>
      )}
    </div>
  );
}
