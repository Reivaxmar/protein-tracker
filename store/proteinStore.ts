import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Meal, DailyProteinData } from '../types';

const STORAGE_KEY = '@protein_tracker_data';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useProteinStore = create<AppState>((set, get) => ({
  targetProtein: 150,
  meals: [],
  dailyProteinData: {},

  addMeal: (meal) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
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

  loadData: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        set({
          targetProtein: data.targetProtein || 150,
          meals: data.meals || [],
          dailyProteinData: data.dailyProteinData || {},
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
      };
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving data:', e);
    }
  },
}));
