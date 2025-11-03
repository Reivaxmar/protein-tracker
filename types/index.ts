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

export interface AppState {
  targetProtein: number;
  meals: Meal[];
  dailyProteinData: { [date: string]: DailyProteinData };
  addMeal: (meal: Omit<Meal, 'id' | 'totalProtein' | 'timestamp'>) => void;
  setTargetProtein: (target: number) => void;
  getTodayData: () => DailyProteinData;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}
