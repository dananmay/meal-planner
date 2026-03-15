import { getRecipeById, ingredientCategories } from "../data/recipes";

function normalizeIngredientName(name) {
  return name
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getCategory(name) {
  if (ingredientCategories[name]) return ingredientCategories[name];
  const lower = name.toLowerCase();
  if (lower.includes("salt") || lower.includes("masala") || lower.includes("powder") || lower.includes("cumin") || lower.includes("turmeric") || lower.includes("pepper") || lower.includes("cinnamon") || lower.includes("cardamom") || lower.includes("hing") || lower.includes("asafoetida") || lower.includes("flakes") || lower.includes("jolokia")) return "spices";
  if (lower.includes("oil") || lower.includes("ghee")) return "pantry";
  if (lower.includes("curd") || lower.includes("paneer") || lower.includes("yogurt")) return "dairy";
  if (lower.includes("rice") || lower.includes("noodle") || lower.includes("atta") || lower.includes("flour") || lower.includes("roti")) return "noodles_grains";
  if (lower.includes("tofu") || lower.includes("soya") || lower.includes("protein")) return "protein";
  return "produce";
}

const categoryLabels = {
  produce: "Produce",
  pantry: "Pantry",
  dairy: "Dairy",
  spices: "Spices",
  noodles_grains: "Grains & Noodles",
  protein: "Protein",
  other: "Other",
};

const categoryOrder = ["produce", "protein", "dairy", "noodles_grains", "pantry", "spices", "other"];

export function generateGroceryList(weekPlan) {
  const ingredientMap = {};

  for (const day of weekPlan) {
    for (const recipeId of (day.slots || [])) {
      if (!recipeId) continue;
      const recipe = getRecipeById(recipeId);
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const key = normalizeIngredientName(ing.name) + "|" + ing.unit;
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            ingredient_name: ing.name,
            total_amount: 0,
            unit: ing.unit,
            category: getCategory(ing.name),
            checked: false,
          };
        }
        ingredientMap[key].total_amount += ing.amount;
      }
    }
  }

  const items = Object.values(ingredientMap).sort((a, b) =>
    a.ingredient_name.localeCompare(b.ingredient_name)
  );

  // Group by category
  const grouped = {};
  for (const cat of categoryOrder) {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) {
      grouped[cat] = { label: categoryLabels[cat], items: catItems };
    }
  }
  return grouped;
}

export function generateGroceryByRecipe(weekPlan, weekDates) {
  const today = new Date().toISOString().split("T")[0];
  const recipeMap = {}; // recipeId -> { recipeName, ingredients: {key -> {name, amount, unit}}, dates: Set }
  const ingredientRecipes = {}; // "name|unit" -> Set of recipe names

  for (let i = 0; i < weekPlan.length; i++) {
    if (weekDates[i] < today) continue;
    const day = weekPlan[i];
    for (const recipeId of (day.slots || [])) {
      if (!recipeId) continue;
      const recipe = getRecipeById(recipeId);
      if (!recipe) continue;

      if (!recipeMap[recipeId]) {
        recipeMap[recipeId] = { recipeName: recipe.name, ingredients: {}, dates: new Set() };
      }
      recipeMap[recipeId].dates.add(weekDates[i]);

      for (const ing of recipe.ingredients) {
        const key = normalizeIngredientName(ing.name) + "|" + ing.unit;
        if (!recipeMap[recipeId].ingredients[key]) {
          recipeMap[recipeId].ingredients[key] = { name: ing.name, amount: 0, unit: ing.unit };
        }
        recipeMap[recipeId].ingredients[key].amount += ing.amount;

        if (!ingredientRecipes[key]) ingredientRecipes[key] = new Set();
        ingredientRecipes[key].add(recipe.name);
      }
    }
  }

  const recipeGroups = Object.entries(recipeMap).map(([id, data]) => ({
    recipeId: id,
    recipeName: data.recipeName,
    dayCount: data.dates.size,
    ingredients: Object.values(data.ingredients).sort((a, b) => a.name.localeCompare(b.name)),
  }));

  // Convert Sets to arrays for easier use in UI
  const ingredientRecipesMap = {};
  for (const [key, names] of Object.entries(ingredientRecipes)) {
    ingredientRecipesMap[key] = [...names];
  }

  return { recipeGroups, ingredientRecipes: ingredientRecipesMap };
}

export { categoryLabels, categoryOrder };
