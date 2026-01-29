export interface Meal {
  id: string;
  name: string;
  proteinPer100g: number;
  gramsEaten: number;
  totalProtein: number;
  date: string;
  timestamp: number;
  tag?: string;
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

export interface CustomIngredient {
  id: string;
  name: string;
  proteinPer100g: number;
  createdAt: number;
}

export interface AppState {
  targetProtein: number;
  meals: Meal[];
  dailyProteinData: { [date: string]: DailyProteinData };
  recipes: Recipe[];
  customIngredients: CustomIngredient[];
  addMeal: (meal: Omit<Meal, 'id' | 'totalProtein' | 'timestamp'>) => void;
  deleteMeal: (mealId: string, date: string) => void;
  updateMeal: (mealId: string, date: string, updatedFields: Partial<Pick<Meal, 'gramsEaten' | 'name'>>) => void;
  setTargetProtein: (target: number) => void;
  getTodayData: () => DailyProteinData;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  deleteRecipe: (recipeId: string) => void;
  updateRecipe: (recipeId: string, updatedRecipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  addMealFromRecipe: (recipeId: string, servingsOrGrams: number, useGrams?: boolean, tag?: string) => void;
  addCustomIngredient: (ingredient: Omit<CustomIngredient, 'id' | 'createdAt'>) => void;
  deleteCustomIngredient: (ingredientId: string) => void;
  updateCustomIngredient: (ingredientId: string, updatedIngredient: Omit<CustomIngredient, 'id' | 'createdAt'>) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  syncWithFirestore: (userId: string) => void;
  stopFirestoreSync: () => void;
  clearData: () => void;
}
