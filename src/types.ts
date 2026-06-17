export type MealCategory = "Sarapan" | "Makan Siang" | "Makan Malam" | "Camilan";

export interface Meal {
  id: string;
  category: MealCategory;
  name: string;
  calories: number;
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  explanation?: string;
  journalNote?: string;
  photoUrl?: string; // Base64 data URL
  timestamp: string; // ISO string or simple time like "08:30"
}

export interface WaterLog {
  id: string;
  amountMl: number; // e.g. 250 for each glass
  timestamp: string; // e.g. "10:15"
}

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  meals: Meal[];
  water: WaterLog[]; // array of water additions
  notes: string; // personal journal entry at the end of the day
}

export interface DailyGoal {
  calories: number; // default e.g. 2000
  waterGlasses: number; // default e.g. 8 (2000 ml)
}

export interface WeeklyInsight {
  weeklyAverageCalories: number;
  weeklyAverageWater: number;
  statusNotes: string; // hand-written general note
  advice: string; // recommendations
}
