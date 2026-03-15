import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseRecipeText } from "../utils/recipeParser";
import { addCustomRecipe } from "../hooks/useCustomRecipes";
import HeatLevel from "../components/HeatLevel";

export default function ImportRecipe() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null); // array of { recipe, errors }
  const [saved, setSaved] = useState(false);

  const handleParse = () => {
    const results = parseRecipeText(text);
    setParsed(results);
    setSaved(false);
  };

  const handleSaveAll = () => {
    if (!parsed) return;
    for (const { recipe, errors } of parsed) {
      if (errors.length === 0) {
        addCustomRecipe(recipe);
      }
    }
    setSaved(true);
  };

  const handleSaveOne = (idx) => {
    if (!parsed) return;
    const { recipe } = parsed[idx];
    addCustomRecipe(recipe);
    setParsed((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, _saved: true } : p))
    );
  };

  const validCount = parsed ? parsed.filter((p) => p.errors.length === 0).length : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-warm-900">Import Recipes</h2>
        <button
          onClick={() => navigate("/recipes")}
          className="text-sm text-warm-500 hover:text-warm-700"
        >
          ← Recipe Bank
        </button>
      </div>

      <p className="text-sm text-warm-500">
        Paste recipe text from Claude Chat. Supports multiple recipes at once.
      </p>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setParsed(null);
          setSaved(false);
        }}
        placeholder={`M1: Recipe Name\nCalories: 460 kcal | Protein: 34g | Carbs: 52g | Fat: 12g\nPrep time: 30 min | Heat: 🌶️🌶️ | Tags: high-protein\nIngredients:\n* Item: 50g\nInstructions:\n1. Step one...`}
        rows={12}
        className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-200 text-warm-800 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-500 text-sm font-mono"
      />

      <button
        onClick={handleParse}
        disabled={!text.trim()}
        className="w-full py-3 bg-warm-500 text-white rounded-xl font-semibold hover:bg-warm-600 transition-colors disabled:opacity-40"
      >
        Parse Recipes
      </button>

      {parsed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-warm-600">
              Found {parsed.length} recipe{parsed.length !== 1 ? "s" : ""} · {validCount} valid
            </p>
            {validCount > 1 && !saved && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 bg-warm-500 text-white text-sm rounded-lg font-medium hover:bg-warm-600 transition-colors"
              >
                Save All ({validCount})
              </button>
            )}
          </div>

          {saved && (
            <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 px-4 py-3 rounded-xl text-sm">
              Saved {validCount} recipe{validCount !== 1 ? "s" : ""} to your Recipe Bank!{" "}
              <button
                onClick={() => navigate("/recipes")}
                className="underline font-medium"
              >
                View recipes →
              </button>
            </div>
          )}

          {parsed.map((item, idx) => (
            <RecipePreview
              key={idx}
              item={item}
              onSave={() => handleSaveOne(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipePreview({ item, onSave }) {
  const { recipe, errors, _saved } = item;

  return (
    <div className={`bg-warm-100 rounded-2xl border p-5 space-y-3 ${
      errors.length > 0 ? "border-red-800" : "border-warm-200"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-warm-900 text-lg">{recipe.name || "Unnamed"}</h3>
          <span className="px-2 py-0.5 bg-warm-100 rounded-full text-xs text-warm-600">
            {recipe.slot_type}
          </span>
        </div>
        {errors.length === 0 && !_saved && (
          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-warm-500 text-white text-sm rounded-lg font-medium hover:bg-warm-600 transition-colors"
          >
            Save
          </button>
        )}
        {_saved && (
          <span className="text-emerald-400 text-sm font-medium">Saved</span>
        )}
      </div>

      {/* Macros */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="font-semibold text-warm-800">{recipe.calories} kcal</span>
        <span className="text-warm-600">{recipe.protein_g}g protein</span>
        <span className="text-warm-600">{recipe.carbs_g}g carbs</span>
        <span className="text-warm-600">{recipe.fat_g}g fat</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-warm-600">
        <HeatLevel level={recipe.heat_level} size="text-sm" />
        <span>{recipe.prep_time_min} min</span>
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-warm-100 text-warm-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients preview */}
      <div>
        <p className="text-xs text-warm-500 mb-1">
          {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-warm-600 line-clamp-2">
          {recipe.ingredients.map((i) => i.name).join(", ")}
        </p>
      </div>

      {/* Instructions preview */}
      <p className="text-xs text-warm-500">
        {recipe.instructions.length} step{recipe.instructions.length !== 1 ? "s" : ""}
      </p>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          <p className="text-xs text-red-400 font-medium mb-1">Issues:</p>
          <ul className="text-xs text-red-400 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
