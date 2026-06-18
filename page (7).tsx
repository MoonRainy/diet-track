// ============================================================
// Database types — mirrors Supabase schema exactly
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
      };
      weight_logs: {
        Row: WeightLog;
        Insert: WeightLogInsert;
        Update: Partial<WeightLogInsert>;
      };
      exercises: {
        Row: Exercise;
        Insert: ExerciseInsert;
        Update: Partial<ExerciseInsert>;
      };
      exercise_logs: {
        Row: ExerciseLog;
        Insert: ExerciseLogInsert;
        Update: Partial<ExerciseLogInsert>;
      };
      meal_logs: {
        Row: MealLog;
        Insert: MealLogInsert;
        Update: Partial<MealLogInsert>;
      };
      water_logs: {
        Row: WaterLog;
        Insert: WaterLogInsert;
        Update: Partial<WaterLogInsert>;
      };
      groups: {
        Row: Group;
        Insert: GroupInsert;
        Update: Partial<GroupInsert>;
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMemberInsert;
        Update: Partial<GroupMemberInsert>;
      };
      challenges: {
        Row: Challenge;
        Insert: ChallengeInsert;
        Update: Partial<ChallengeInsert>;
      };
      challenge_progress: {
        Row: ChallengeProgress;
        Insert: ChallengeProgressInsert;
        Update: Partial<ChallengeProgressInsert>;
      };
      monthly_reports: {
        Row: MonthlyReport;
        Insert: MonthlyReportInsert;
        Update: Partial<MonthlyReportInsert>;
      };
    };
    Views: {
      user_stats: { Row: UserStats };
    };
  };
}

// ---- Profiles ----
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  height_cm: number | null;
  start_weight: number | null;
  current_weight: number | null;
  target_weight: number | null;
  daily_water_goal: number;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;

// ---- Weight Logs ----
export interface WeightLog {
  id: string;
  user_id: string;
  logged_at: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
}
export type WeightLogInsert = Omit<WeightLog, 'id' | 'created_at'>;

// ---- Exercises ----
export type ExerciseCategory = 'Cardio' | 'Home Workout' | 'Gym' | 'Outdoor' | 'Other';
export type ExerciseDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  calories: number;
  difficulty: ExerciseDifficulty;
  duration: string | null;
  description: string | null;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
}
export type ExerciseInsert = Omit<Exercise, 'id' | 'created_at'>;

// ---- Exercise Logs ----
export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_id: string | null;
  custom_name: string | null;
  logged_at: string;
  calories: number;
  duration: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}
export type ExerciseLogInsert = Omit<ExerciseLog, 'id' | 'created_at'>;

// ---- Meal Logs ----
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface MealLog {
  id: string;
  user_id: string;
  logged_at: string;
  meal_type: MealType;
  name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  notes: string | null;
  created_at: string;
}
export type MealLogInsert = Omit<MealLog, 'id' | 'created_at'>;

// ---- Water Logs ----
export interface WaterLog {
  id: string;
  user_id: string;
  logged_at: string;
  glasses: number;
  updated_at: string;
}
export type WaterLogInsert = Omit<WaterLog, 'id' | 'updated_at'>;

// ---- Groups ----
export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}
export type GroupInsert = Omit<Group, 'id' | 'invite_code' | 'created_at'>;

// ---- Group Members ----
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}
export type GroupMemberInsert = Omit<GroupMember, 'id' | 'joined_at'>;

// ---- Challenges ----
export type ChallengeType = 'weight_loss' | 'exercise_streak' | 'step_count' | 'custom';

export interface Challenge {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  target_value: number | null;
  starts_at: string;
  ends_at: string;
  created_by: string;
  created_at: string;
}
export type ChallengeInsert = Omit<Challenge, 'id' | 'created_at'>;

// ---- Challenge Progress ----
export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number;
  streak: number;
  completed: boolean;
  updated_at: string;
}
export type ChallengeProgressInsert = Omit<ChallengeProgress, 'id' | 'updated_at'>;

// ---- Monthly Reports ----
export interface MonthlyReport {
  id: string;
  user_id: string;
  month: number;
  year: number;
  start_weight: number | null;
  end_weight: number | null;
  weight_change: number | null;
  total_exercises: number;
  total_calories_burned: number;
  total_meals_logged: number;
  active_days: number;
  avg_water_glasses: number | null;
  notes: string | null;
  generated_at: string;
}
export type MonthlyReportInsert = Omit<MonthlyReport, 'id' | 'weight_change' | 'generated_at'>;

// ---- User Stats (view) ----
export interface UserStats {
  id: string;
  username: string;
  full_name: string | null;
  height_cm: number | null;
  start_weight: number | null;
  current_weight: number | null;
  target_weight: number | null;
  bmi: number | null;
  weight_lost: number;
  weight_remaining: number;
  progress_pct: number;
  exercises_this_week: number;
  calories_burned_today: number;
}

// ---- App-level composite types ----
export interface LeaderboardEntry extends UserStats {
  rank: number;
}

export interface DashboardData {
  profile: Profile;
  stats: UserStats;
  todayExercises: ExerciseLog[];
  todayMeals: MealLog[];
  todayWater: WaterLog | null;
  recentWeightLogs: WeightLog[];
}

export interface MealSuggestion {
  name: string;
  meal_type: MealType;
  calories: number;
  protein_g: number;
  prep_time: string;
  ingredients: string[];
}
