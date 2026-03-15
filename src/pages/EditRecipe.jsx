import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById, allTags } from "../data/recipes";
import {
  isCustomRecipe,
  updateCustomRecipe,
  addCustomRecipe,
  deleteCustomRecipe,
} from "../hooks/useCustomRecipes";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const original = getRecipeById(id);
  const isCustom = isCustomRecipe(id);
  const isDuplicate = !isCustom && !!original;

  const [form, setForm] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (original) {
      setForm({
        name: isDuplicate ? `${original.name} (copy)` : original.name,
        description: original.description,
        slot_type: original.slot_type,
        calories: original.calories,
        protein_g: original.protein_g,
        carbs_g: original.carbs_g,
        fat_g: original.fat_g,
        prep_time_min: original.prep_time_min,
        heat_level: original.heat_level,
        tags: [...original.tags],
        ingredients: original.ingredients.map((i) => ({ ...i })),
        instructions: [...original.instructions],
      });
    }
  }, [id]);

  if (!original) {
    return <p className="text-center text-warm-500 py-12">Recipe not found.</p>;
  }
  if (!form) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (isCustom) {
      updateCustomRecipe(id, form);
    } else {
      addCustomRecipe(form);
    }
    navigate("/recipes");
  };

  const handleDelete = () => {
    deleteCustomRecipe(id);
    navigate("/recipes");
  };

  const toggleTag = (tag) => {
    set(
      "tags",
      form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag]
    );
  };

  const addIngredient = () => {
    set("ingredients", [...form.ingredients, { name: "", amount: 0, unit: "g" }]);
  };

  const updateIngredient = (idx, field, value) => {
    const updated = form.ingredients.map((ing, i) =>
      i === idx ? { ...ing, [field]: field === "amount" ? Number(value) : value } : ing
    );
    set("ingredients", updated);
  };

  const removeIngredient = (idx) => {
    set("ingredients", form.ingredients.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    set("instructions", [...form.instructions, ""]);
  };

  const updateStep = (idx, value) => {
    const updated = form.instructions.map((s, i) => (i === idx ? value : s));
    set("instructions", updated);
  };

  const removeStep = (idx) => {
    set("instructions", form.instructions.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-warm-900">
          {isDuplicate ? "Duplicate & Edit" : "Edit Recipe"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-warm-500 hover:text-warm-700"
        >
          ← Back
        </button>
      </div>

      {isDuplicate && (
        <p className="text-sm text-warm-500 bg-warm-200/50 px-3 py-2 rounded-lg">
          Built-in recipes can't be edited directly. This will create a custom copy.
        </p>
      )}

      {/* Basic info */}
      <Section title="Basic Info">
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="input-field"
          />
        </Field>
        <Field label="Description">
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="input-field"
          />
        </Field>
        <Field label="Type">
          <div className="flex gap-2">
            {["meal", "snack"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("slot_type", t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  form.slot_type === t
                    ? "bg-warm-500 text-white"
                    : "bg-warm-100 text-warm-600"
                }`}
              >
                {t === "meal" ? "Meal" : "Snack"}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Macros */}
      <Section title="Macros">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Calories (kcal)">
            <input
              type="number"
              value={form.calories}
              onChange={(e) => set("calories", Number(e.target.value))}
              className="input-field"
            />
          </Field>
          <Field label="Protein (g)">
            <input
              type="number"
              value={form.protein_g}
              onChange={(e) => set("protein_g", Number(e.target.value))}
              className="input-field"
            />
          </Field>
          <Field label="Carbs (g)">
            <input
              type="number"
              value={form.carbs_g}
              onChange={(e) => set("carbs_g", Number(e.target.value))}
              className="input-field"
            />
          </Field>
          <Field label="Fat (g)">
            <input
              type="number"
              value={form.fat_g}
              onChange={(e) => set("fat_g", Number(e.target.value))}
              className="input-field"
            />
          </Field>
        </div>
      </Section>

      {/* Metadata */}
      <Section title="Details">
        <Field label="Prep time (min)">
          <input
            type="number"
            value={form.prep_time_min}
            onChange={(e) => set("prep_time_min", Number(e.target.value))}
            className="input-field w-24"
          />
        </Field>
        <Field label="Heat level">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => set("heat_level", h)}
                className={`px-2.5 py-1 rounded-lg text-sm transition-colors ${
                  form.heat_level === h
                    ? "bg-spice-500 text-white"
                    : "bg-warm-100 text-warm-600"
                }`}
              >
                {h === 0 ? "—" : "🌶️".repeat(h)}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  form.tags.includes(tag)
                    ? "bg-warm-500 text-white"
                    : "bg-warm-100 text-warm-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Ingredients */}
      <Section title="Ingredients">
        <div className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="Name"
                className="input-field flex-1"
              />
              <input
                type="number"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                className="input-field w-20"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                className="input-field w-20"
              >
                {["g", "ml", "tsp", "tbsp", "piece", "pinch", "cup"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-warm-400 hover:text-red-500 text-lg px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="text-sm text-warm-500 hover:text-warm-700 font-medium mt-2"
        >
          + Add ingredient
        </button>
      </Section>

      {/* Instructions */}
      <Section title="Instructions">
        <div className="space-y-2">
          {form.instructions.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-warm-200 text-warm-600 rounded-full flex items-center justify-center text-xs font-bold mt-2">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                rows={2}
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-warm-400 hover:text-red-500 text-lg px-1 mt-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="text-sm text-warm-500 hover:text-warm-700 font-medium mt-2"
        >
          + Add step
        </button>
      </Section>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-warm-500 text-white rounded-xl font-semibold hover:bg-warm-600 transition-colors text-lg"
      >
        {isDuplicate ? "Save as Custom Recipe" : "Save Changes"}
      </button>

      {/* Delete */}
      {isCustom && (
        <div className="pt-2">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete this recipe
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400 flex-1">Are you sure? This can't be undone.</p>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="text-sm text-warm-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-warm-100 rounded-2xl border border-warm-200 p-5 space-y-3">
      <h3 className="font-semibold text-warm-800">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-warm-600 block mb-1">{label}</label>
      {children}
    </div>
  );
}
