import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Meal, DailyProteinData, Recipe } from '../types';
import { getTodayDateString, generateUniqueId } from '../utils/helpers';

const STORAGE_KEY = '@protein_tracker_data';

export const useProteinStore = create<AppState>((set, get) => ({
  targetProtein: 150,
  meals: [],
  dailyProteinData: {},
  recipes: [],

  addMeal: (meal) => {
    const newMeal: Meal = {
      ...meal,
      id: generateUniqueId(),
      totalProtein: (meal.proteinPer100g * meal.gramsEaten) / 100,
      timestamp: Date.now(),
    };

    set((state) => {
      const today = getTodayDateString();
      const updatedMeals = [...state.meals, newMeal];
      const todayMeals = updatedMeals.filter((m) => m.date === today);
      const totalProtein = todayMeals.reduce((sum, m) => sum + m.totalProtein, 0);

      const updatedDailyData = {
        ...state.dailyProteinData,
        [today]: {
          date: today,
          totalProtein,
          targetProtein: state.targetProtein,
          meals: todayMeals,
        },
      };

      return {
        meals: updatedMeals,
        dailyProteinData: updatedDailyData,
      };
    });

    get().saveData();
  },

  setTargetProtein: (target) => {
    set({ targetProtein: target });
    get().saveData();
  },

  getTodayData: () => {
    const state = get();
    const today = getTodayDateString();
    
    if (state.dailyProteinData[today]) {
      return state.dailyProteinData[today];
    }

    return {
      date: today,
      totalProtein: 0,
      targetProtein: state.targetProtein,
      meals: [],
    };
  },

  addRecipe: (recipe) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: generateUniqueId(),
      createdAt: Date.now(),
    };

    set((state) => ({
      recipes: [...state.recipes, newRecipe],
    }));

    get().saveData();
  },

  deleteRecipe: (recipeId) => {
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== recipeId),
    }));

    get().saveData();
  },

  addMealFromRecipe: (recipeId, servingsOrGrams: number = 1, useGrams: boolean = false) => {
    const state = get();
    const recipe = state.recipes.find((r) => r.id === recipeId);
    
    if (!recipe) {
      console.error('Recipe not found:', recipeId);
      return;
    }

    let totalProtein = 0;
    let totalGrams = 0;
    let mealName = '';

    if (useGrams) {
      // Calculate based on grams
      totalGrams = servingsOrGrams;
      const proteinPer100g = recipe.totalGrams > 0 ? (recipe.totalProtein / recipe.totalGrams) * 100 : 0;
      totalProtein = (proteinPer100g * totalGrams) / 100;
      mealName = `${recipe.name} (${servingsOrGrams}g)`;
    } else {
      // Calculate based on servings
      totalProtein = recipe.totalProtein * servingsOrGrams;
      totalGrams = recipe.totalGrams * servingsOrGrams;
      mealName = `${recipe.name}${servingsOrGrams > 1 ? ` (x${servingsOrGrams})` : ''}`;
    }

    const proteinPer100g = totalGrams > 0 ? (totalProtein / totalGrams) * 100 : 0;

    get().addMeal({
      name: mealName,
      proteinPer100g,
      gramsEaten: totalGrams,
      date: getTodayDateString(),
    });
  },

  loadData: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        set({
          targetProtein: data.targetProtein || 150,
          meals: data.meals || [],
          dailyProteinData: data.dailyProteinData || {},
          recipes: data.recipes || [],
        });
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  },

  saveData: async () => {
    try {
      const state = get();
      const data = {
        targetProtein: state.targetProtein,
        meals: state.meals,
        dailyProteinData: state.dailyProteinData,
        recipes: state.recipes,
      };
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving data:', e);
    }
  },
}));
