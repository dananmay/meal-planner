import { useState, useCallback } from "react";

const STORAGE_KEY = "mealplanner_custom_recipes";

function loadCustomRecipes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCustomRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function getCustomRecipes() {
  return loadCustomRecipes();
}

export function addCustomRecipe(recipe) {
  const all = loadCustomRecipes();
  const id = recipe.id || `c-${Date.now()}`;
  const newRecipe = { ...recipe, id, _custom: true };
  all.push(newRecipe);
  saveCustomRecipes(all);
  return newRecipe;
}

export function updateCustomRecipe(id, updates) {
  const all = loadCustomRecipes();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates, id, _custom: true };
  saveCustomRecipes(all);
  return all[idx];
}

export function deleteCustomRecipe(id) {
  const all = loadCustomRecipes();
  saveCustomRecipes(all.filter((r) => r.id !== id));
}

export function isCustomRecipe(id) {
  return id && id.startsWith("c-");
}

export function useCustomRecipes() {
  const [recipes, setRecipes] = useState(loadCustomRecipes);

  const refresh = useCallback(() => {
    setRecipes(loadCustomRecipes());
  }, []);

  const add = useCallback((recipe) => {
    const result = addCustomRecipe(recipe);
    refresh();
    return result;
  }, [refresh]);

  const update = useCallback((id, updates) => {
    const result = updateCustomRecipe(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id) => {
    deleteCustomRecipe(id);
    refresh();
  }, [refresh]);

  return { customRecipes: recipes, add, update, remove, refresh };
}
