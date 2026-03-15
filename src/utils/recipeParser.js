/**
 * Parses recipe text (as formatted by Claude Chat) into structured recipe objects.
 *
 * Expected format:
 *   M1: Recipe Name
 *   Calories: 460 kcal | Protein: 34g | Carbs: 52g | Fat: 12g
 *   Prep time: 30 min | Heat: 🌶️🌶️ | Tags: tag1, tag2
 *   Ingredients:
 *   * Item name: 50g
 *   * Item name: 1 tsp
 *   Instructions:
 *   1. Step one...
 *   2. Step two...
 */

const UNIT_PATTERN = /^([\d.]+)\s*(g|ml|tsp|tbsp|piece|pieces|pinch|cup|cups)$/i;

function countChilis(str) {
  const matches = str.match(/🌶️/g);
  return matches ? matches.length : 0;
}

function parseAmount(amountStr) {
  const cleaned = amountStr.trim();

  // Handle fractions like "¼", "½"
  const fractionMap = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 0.333, "⅔": 0.667, "⅛": 0.125 };
  if (fractionMap[cleaned]) return fractionMap[cleaned];

  const num = parseFloat(cleaned);
  return isNaN(num) ? 1 : num;
}

function parseIngredientLine(line) {
  // Remove leading "* " or "- "
  let text = line.replace(/^\s*[*\-•]\s*/, "").trim();
  if (!text) return null;

  // Try pattern: "Name: amount unit (notes)"
  const colonMatch = text.match(/^(.+?):\s*(.+)$/);
  if (colonMatch) {
    const name = colonMatch[1].trim();
    let rest = colonMatch[2].trim();

    // Remove trailing parenthetical notes like "(dry weight)" from amount parsing
    // but keep them in the name if they describe prep
    const parenInRest = rest.match(/^([\d./¼½¾⅓⅔⅛\s]+(?:g|ml|tsp|tbsp|piece|pieces|pinch|cup|cups)?)\s*\(.*\)$/i);
    if (parenInRest) {
      rest = parenInRest[1].trim();
    }

    // Try "50g" or "1 tsp" or "3–4" patterns
    const amountUnit = rest.match(/^([\d./¼½¾⅓⅔⅛–\-]+)\s*(g|ml|tsp|tbsp|piece|pieces|pinch|cup|cups)?/i);
    if (amountUnit) {
      const amount = parseAmount(amountUnit[1].replace(/[–\-]\d+/, "")); // handle ranges like "3–4"
      const unit = (amountUnit[2] || "g").toLowerCase().replace("pieces", "piece").replace("cups", "cup");
      return { name, amount, unit };
    }

    // Handle "to taste", "as needed", "for serving"
    if (/to taste|as needed|for serving|optional/i.test(rest)) {
      return { name, amount: 1, unit: "pinch" };
    }

    return { name, amount: 1, unit: "g" };
  }

  return null;
}

function inferSlotType(prefix, calories) {
  if (prefix) {
    const p = prefix.toUpperCase();
    if (p.startsWith("M")) return "meal";
    if (p.startsWith("S")) return "snack";
  }
  return calories > 350 ? "meal" : "snack";
}

function splitIntoRecipeBlocks(text) {
  // Split on lines that look like recipe headers: "M1:", "S3:", or standalone title-like lines
  const lines = text.split("\n");
  const blocks = [];
  let current = [];

  for (const line of lines) {
    // Detect recipe header: starts with M/S + number + colon, or is a macro line after empty
    const isHeader = /^\s*[MS]\d+\s*[:.]/.test(line);
    if (isHeader && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  return blocks;
}

export function parseRecipeText(text) {
  const blocks = splitIntoRecipeBlocks(text.trim());
  return blocks.map((block) => parseSingleRecipe(block)).filter(Boolean);
}

function parseSingleRecipe(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  const result = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    description: "",
    slot_type: "meal",
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    prep_time_min: 0,
    heat_level: 0,
    tags: [],
    ingredients: [],
    instructions: [],
    _custom: true,
  };

  const errors = [];
  let section = "header"; // header, ingredients, instructions
  let currentGroup = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- Recipe name ---
    if (i === 0 || (section === "header" && !result.name)) {
      const nameMatch = line.match(/^\s*([MS]\d+)\s*[:.]\s*(.+)$/i);
      if (nameMatch) {
        result.name = nameMatch[2].trim();
        result._prefix = nameMatch[1];
        continue;
      }
      // Could be just a name without prefix
      if (!result.name && !line.match(/^(Calories|Prep|Heat|Ingredients|Instructions)/i)) {
        result.name = line;
        continue;
      }
    }

    // --- Macros line ---
    const calMatch = line.match(/Calories?\s*:\s*(\d+)/i);
    if (calMatch) {
      result.calories = parseInt(calMatch[1]);
      const protMatch = line.match(/Protein\s*:\s*(\d+)/i);
      if (protMatch) result.protein_g = parseInt(protMatch[1]);
      const carbMatch = line.match(/Carbs?\s*:\s*(\d+)/i);
      if (carbMatch) result.carbs_g = parseInt(carbMatch[1]);
      const fatMatch = line.match(/Fat\s*:\s*(\d+)/i);
      if (fatMatch) result.fat_g = parseInt(fatMatch[1]);
      continue;
    }

    // --- Prep time / Heat / Tags line ---
    const prepMatch = line.match(/Prep\s*(?:time)?\s*:\s*(\d+)/i);
    if (prepMatch) {
      result.prep_time_min = parseInt(prepMatch[1]);
    }

    if (line.includes("🌶️")) {
      result.heat_level = countChilis(line);
    }

    // Heat: — (no heat)
    if (/Heat\s*:\s*[—\-–]/.test(line)) {
      result.heat_level = 0;
    }

    const tagsMatch = line.match(/Tags?\s*:\s*(.+)/i);
    if (tagsMatch) {
      result.tags = tagsMatch[1].split(",").map((t) => t.trim()).filter(Boolean);
      continue;
    }

    if (prepMatch) continue;

    // --- Section headers ---
    if (/^Ingredients?\s*:?\s*$/i.test(line)) {
      section = "ingredients";
      currentGroup = null;
      continue;
    }
    if (/^Instructions?\s*:?\s*$/i.test(line)) {
      section = "instructions";
      continue;
    }

    // --- Ingredient sub-group header ---
    if (section === "ingredients") {
      // Detect group headers like "Rolls:", "Dip:", "Mint chutney:", "Cheela batter:"
      const groupMatch = line.match(/^([A-Za-z][A-Za-z\s\-]+)\s*:\s*$/);
      if (groupMatch) {
        currentGroup = groupMatch[1].trim().toLowerCase().replace(/\s+/g, "_");
        continue;
      }

      // Also detect inline group markers like "Cooking:" followed by ingredients
      if (/^(Cooking|For serving|Garnish)\s*:\s*$/i.test(line)) {
        currentGroup = null; // these go to main
        continue;
      }

      const ingredient = parseIngredientLine(line);
      if (ingredient) {
        if (currentGroup) ingredient.group = currentGroup;
        result.ingredients.push(ingredient);
        continue;
      }
    }

    // --- Instructions ---
    if (section === "instructions") {
      // Remove leading number + period/parenthesis
      const step = line.replace(/^\d+[.)]\s*/, "").trim();
      if (step) {
        result.instructions.push(step);
      }
      continue;
    }
  }

  // Infer slot type
  result.slot_type = inferSlotType(result._prefix, result.calories);
  delete result._prefix;

  // Auto-generate description if missing
  if (!result.description) {
    result.description = `${result.name} — ${result.calories} kcal, ${result.protein_g}g protein, ${result.carbs_g}g carbs, ${result.fat_g}g fat.`;
  }

  // Validation
  if (!result.name) errors.push("Missing recipe name");
  if (!result.calories) errors.push("Missing calories");
  if (result.ingredients.length === 0) errors.push("No ingredients found");
  if (result.instructions.length === 0) errors.push("No instructions found");

  return { recipe: result, errors };
}

export function validateRecipe(recipe) {
  const errors = [];
  if (!recipe.name?.trim()) errors.push("Name is required");
  if (!recipe.calories || recipe.calories <= 0) errors.push("Calories must be > 0");
  if (!recipe.protein_g && recipe.protein_g !== 0) errors.push("Protein is required");
  if (recipe.ingredients.length === 0) errors.push("At least one ingredient is required");
  if (recipe.instructions.length === 0) errors.push("At least one instruction is required");
  return errors;
}
