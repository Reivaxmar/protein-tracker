export interface Meal {
  id: string;
  name: string;
  proteinPer100g: number;
  gramsEaten: number;
  totalProtein: number;
  date: string;
  timestamp: number;
}

export interface DailyProteinData {
  date: string;
  totalProtein: number;
  targetProtein: number;
  meals: Meal[];
}

export interface RecipeIngredient {
  id: string;
  name: string;
  proteinPer100g: number;
  gramsInRecipe: number;
  totalProtein: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalProtein: number;
  totalGrams: number;
  createdAt: number;
  servingSize?: number; // Default serving size in grams
}

export interface AppState {
  targetProtein: number;
  meals: Meal[];
  dailyProteinData: { [date: string]: DailyProteinData };
  recipes: Recipe[];
  addMeal: (meal: Omit<Meal, 'id' | 'totalProtein' | 'timestamp'>) => void;
  setTargetProtein: (target: number) => void;
  getTodayData: () => DailyProteinData;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  deleteRecipe: (recipeId: string) => void;
  addMealFromRecipe: (recipeId: string, servingsOrGrams: number, useGrams?: boolean) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}
