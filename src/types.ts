export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  avatar: string; // pixel avatar code or identifier
  country: string;
  createdAt: string;
  bestWPM: number;
  averageWPM: number;
  accuracy: number;
  testsCount: number;
  streak: number;
  streakLastUpdated?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
}

export interface TestResult {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  errors: number;
  characters: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in seconds (e.g., 15, 30, 60)
  language: 'uz' | 'en';
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown supported
  category: string;
  readingTime: string;
  author: string;
  date: string;
  coverUrl: string;
  likesCount: number;
  viewsCount: number;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  adminEmail: string;
}

export interface UserSettings {
  theme: 'carbon' | 'cyberpunk' | 'serene' | 'lavender';
  language: 'uz' | 'en';
  typingSound: 'none' | 'click' | 'beep' | 'mechanical';
  showKeyboard: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirementType: 'wpm' | 'tests' | 'streak' | 'accuracy';
  requirementValue: number;
}
