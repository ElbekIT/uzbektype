export enum Difficulty {
  EASY = "oson",
  MEDIUM = "o'rta",
  HARD = "qiyin"
}

export enum Timeframe {
  WEEKLY = "hafta",
  MONTHLY = "oy"
}

export enum AnimationMode {
  NORMAL = "normal",
  VERTICAL = "vertical",
  SMOOTH = "smooth"
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  avatar: string; // ID or key of pixel avatar
  email: string;
  createdAt: any; // Firestore Timestamp
}

export interface TypingResult {
  id?: string;
  uid: string;
  wpm: number;
  accuracy: number;
  raw: number;
  consistency: number;
  difficulty: Difficulty;
  time: number; // in seconds (10, 30, 60)
  createdAt: any; // Firestore Timestamp
  username?: string; // Cache for leaderboard lookup
  avatar?: string; // Cache for leaderboard lookup
}

export interface LeaderboardEntry {
  id: string;
  uid: string;
  username: string;
  avatar: string;
  wpm: number;
  accuracy: number;
  raw: number;
  consistency: number;
  difficulty: Difficulty;
  time: number;
  date: string;
}

export interface AppState {
  view: "home" | "test" | "profile" | "my-results" | "leaderboard" | "blog";
  user: UserProfile | null;
  loading: boolean;
  selectedTime: number; // 10, 30, 60
  selectedDifficulty: Difficulty;
  theme: "dark" | "light";
  lang: "uz" | "en";
}
