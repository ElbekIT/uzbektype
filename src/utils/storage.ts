import { UserProfile, TestResult, BlogArticle, AdminLog, Achievement } from '../types';
import { INITIAL_LEADERBOARD, DEFAULT_BLOGS, DEFAULT_ACHIEVEMENTS } from '../data';
import { db, auth } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// Key names
export const KEYS = {
  CURRENT_USER: 'uzbektype_current_user',
  ALL_USERS: 'uzbektype_all_users',
  RESULTS: 'uzbektype_results',
  BLOGS: 'uzbektype_blogs',
  ADMIN_LOGS: 'uzbektype_admin_logs',
  DAILY_CHALLENGES: 'uzbektype_daily_challenges',
};

// Daily Challenge interface
export interface DailyChallenge {
  id: string;
  date: string;
  text: string;
  targetWpm: number;
  targetAccuracy: number;
  rewardXp: number;
  completedBy?: string[]; // Array of uids who completed
}

// Default Guest User
export const DEFAULT_GUEST: UserProfile = {
  uid: 'guest_user',
  username: 'Siz_Guest',
  email: 'mehmon@uzbektype.uz',
  avatar: '👨‍💻',
  country: 'UZ',
  createdAt: new Date().toISOString(),
  bestWPM: 0,
  averageWPM: 0,
  accuracy: 0,
  testsCount: 0,
  streak: 0,
};

// Default challenges
export const DEFAULT_CHALLENGES: DailyChallenge[] = [
  {
    id: 'challenge-today',
    date: new Date().toISOString().split('T')[0],
    text: "O'zbekiston kelajagi buyuk davlatdir. Biz yoshlar vatanimiz taraqqiyoti uchun har qachongidan ham ko'proq mehnat qilishimiz va bilim olishimiz lozim.",
    targetWpm: 45,
    targetAccuracy: 95,
    rewardXp: 150
  },
  {
    id: 'challenge-tomorrow',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    text: "Dasturlash ko'nikmalari kelajakda har bir soha vakili uchun zarur bo'ladi. Yozish tezligi esa fikrlaringizni tezda kodga aylantirish imkonini beradi.",
    targetWpm: 55,
    targetAccuracy: 97,
    rewardXp: 200
  }
];

export function initStorage() {
  // Populate users if empty
  if (!localStorage.getItem(KEYS.ALL_USERS)) {
    const mockUsers: UserProfile[] = INITIAL_LEADERBOARD.map(p => ({
      uid: p.uid,
      username: p.username,
      email: `${p.username.toLowerCase()}@uzbektype.uz`,
      avatar: p.avatar,
      country: p.country,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      bestWPM: p.bestWPM,
      averageWPM: p.bestWPM - 8,
      accuracy: p.accuracy,
      testsCount: 15,
      streak: 2,
    }));
    // Add default admin
    mockUsers.push({
      uid: 'admin_user',
      username: 'UzbekType_Admin',
      email: 'admin@uzbektype.uz',
      avatar: '🛡️',
      country: 'UZ',
      createdAt: new Date().toISOString(),
      bestWPM: 115,
      averageWPM: 102,
      accuracy: 98.9,
      testsCount: 84,
      streak: 12,
      isAdmin: true,
    });
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(mockUsers));
  }

  // Populate guest user if empty
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(DEFAULT_GUEST));
  }

  // Populate results if empty
  if (!localStorage.getItem(KEYS.RESULTS)) {
    const mockResults: TestResult[] = [];
    const now = Date.now();
    INITIAL_LEADERBOARD.forEach((p, idx) => {
      for (let i = 0; i < 3; i++) {
        const timeOffset = 1000 * 60 * 60 * 24 * (idx + i);
        mockResults.push({
          id: `res-${p.uid}-${i}`,
          userId: p.uid,
          username: p.username,
          avatar: p.avatar,
          wpm: Math.round(p.bestWPM - (i * 4) - Math.random() * 3),
          rawWpm: Math.round(p.bestWPM - (i * 2) + Math.random() * 2),
          accuracy: p.accuracy - (i * 0.5),
          consistency: Math.round(85 + Math.random() * 10),
          errors: Math.round(1 + Math.random() * 3),
          characters: 200 + Math.random() * 50,
          difficulty: 'medium',
          duration: 30,
          language: 'uz',
          createdAt: new Date(now - timeOffset).toISOString(),
        });
      }
    });
    localStorage.setItem(KEYS.RESULTS, JSON.stringify(mockResults));
  }

  // Populate blogs if empty
  if (!localStorage.getItem(KEYS.BLOGS)) {
    localStorage.setItem(KEYS.BLOGS, JSON.stringify(DEFAULT_BLOGS));
  }

  // Populate daily challenges if empty
  if (!localStorage.getItem(KEYS.DAILY_CHALLENGES)) {
    localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(DEFAULT_CHALLENGES));
  }

  // Populate admin logs if empty
  if (!localStorage.getItem(KEYS.ADMIN_LOGS)) {
    const initialLogs: AdminLog[] = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        action: 'Sistemani ishga tushirish',
        details: 'UzbekType typing dvizjogi muvaffaqiyatli ishga tushirildi.',
        adminEmail: 'admin@uzbektype.uz',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        action: 'Muvaffaqiyatlar sozlandi',
        details: '7 ta asosiy mukofotlar va unvonlar bazaga yuklandi.',
        adminEmail: 'admin@uzbektype.uz',
      }
    ];
    localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify(initialLogs));
  }
}

// Current user functions
export function getCurrentUser(): UserProfile {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || JSON.stringify(DEFAULT_GUEST));
  } catch {
    return DEFAULT_GUEST;
  }
}

export function saveCurrentUser(user: UserProfile) {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  
  // Sync locally in all users list
  const allUsers = getAllUsers();
  const idx = allUsers.findIndex(u => u.uid === user.uid);
  if (idx !== -1) {
    allUsers[idx] = user;
  } else {
    allUsers.push(user);
  }
  localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));

  // Sync to Firestore if authenticated
  if (auth.currentUser && user.uid !== 'guest_user') {
    const userDocRef = doc(db, 'users', user.uid);
    setDoc(userDocRef, {
      ...user,
      displayName: user.username,
      lastOnline: new Date().toISOString()
    }, { merge: true }).catch(err => console.error('Failed to sync user to Firestore:', err));

    // Update leaderboard cached entry
    const leaderDocRef = doc(db, 'leaderboard', user.uid);
    setDoc(leaderDocRef, {
      uid: user.uid,
      username: user.username,
      avatar: user.avatar,
      bestWPM: user.bestWPM,
      accuracy: user.accuracy,
      country: user.country,
      testsCompleted: user.testsCount || 0,
      lastUpdated: new Date().toISOString()
    }, { merge: true }).catch(err => console.error('Failed to sync leaderboard entry:', err));
  }
}

// All users functions
export function getAllUsers(): UserProfile[] {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.ALL_USERS) || '[]');
  } catch {
    return [];
  }
}

export function saveAllUsers(users: UserProfile[]) {
  localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));

  // If authenticated admin, sync any changed user fields
  if (auth.currentUser) {
    users.forEach(u => {
      const docRef = doc(db, 'users', u.uid);
      setDoc(docRef, u, { merge: true }).catch(err => console.error('Error syncing user batch:', err));
    });
  }
}

// Results functions
export function getTestResults(): TestResult[] {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]');
  } catch {
    return [];
  }
}

export function addTestResult(result: TestResult) {
  const results = getTestResults();
  results.unshift(result);
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));

  // Sync to Firestore if authenticated user
  if (auth.currentUser && result.userId !== 'guest_user') {
    addDoc(collection(db, 'results'), result)
      .catch(err => console.error('Error adding result to Firestore:', err));
  }

  // Update user stats
  const user = getCurrentUser();
  if (user.uid === result.userId) {
    const userResults = results.filter(r => r.userId === user.uid);
    user.testsCount = userResults.length;
    user.bestWPM = Math.max(user.bestWPM, result.wpm);
    
    // Average WPM & Accuracy calculation
    const totalWPM = userResults.reduce((acc, r) => acc + r.wpm, 0);
    const totalAcc = userResults.reduce((acc, r) => acc + r.accuracy, 0);
    user.averageWPM = Math.round(totalWPM / userResults.length);
    user.accuracy = Math.round((totalAcc / userResults.length) * 10) / 10;

    // Award XP/Level up
    // Let's award XP: 10 XP per test completed + WPM reward + Accuracy bonus
    const wpmReward = Math.round(result.wpm * (result.accuracy / 100));
    const earnedXp = 20 + wpmReward;
    
    const currentXp = (user as any).xp || 0;
    const currentLevel = (user as any).level || 1;
    const newXp = currentXp + earnedXp;
    
    // Level boundary formula: level * 500 XP
    const newLevel = Math.floor(newXp / 500) + 1;
    
    (user as any).xp = newXp;
    (user as any).level = newLevel;

    // Daily streak management
    const todayStr = new Date().toISOString().split('T')[0];
    if (!user.streakLastUpdated) {
      user.streak = 1;
      user.streakLastUpdated = todayStr;
    } else {
      const lastDate = new Date(user.streakLastUpdated);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak += 1;
        user.streakLastUpdated = todayStr;
      } else if (diffDays > 1) {
        user.streak = 1;
        user.streakLastUpdated = todayStr;
      }
    }

    saveCurrentUser(user);
  }
}

// Delete Result (Admin Action)
export async function deleteTestResult(resultId: string) {
  const results = getTestResults();
  const filtered = results.filter(r => r.id !== resultId);
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(filtered));

  if (auth.currentUser) {
    try {
      const q = query(collection(db, 'results'), where('id', '==', resultId));
      const snap = await getDocs(q);
      snap.forEach(d => {
        deleteDoc(doc(db, 'results', d.id));
      });
    } catch (err) {
      console.error('Error deleting test result from Firestore:', err);
    }
  }
}

// Blog functions
export function getBlogs(): BlogArticle[] {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.BLOGS) || '[]');
  } catch {
    return [];
  }
}

export function updateBlog(blog: BlogArticle) {
  const blogs = getBlogs();
  const idx = blogs.findIndex(b => b.id === blog.id);
  if (idx !== -1) {
    blogs[idx] = blog;
  } else {
    blogs.unshift(blog);
  }
  localStorage.setItem(KEYS.BLOGS, JSON.stringify(blogs));

  if (auth.currentUser) {
    setDoc(doc(db, 'blogs', blog.id), blog, { merge: true })
      .catch(err => console.error('Failed to update blog in Firestore:', err));
  }
}

// Delete Blog (Admin Action)
export async function deleteBlog(blogId: string) {
  const blogs = getBlogs();
  const filtered = blogs.filter(b => b.id !== blogId);
  localStorage.setItem(KEYS.BLOGS, JSON.stringify(filtered));

  if (auth.currentUser) {
    deleteDoc(doc(db, 'blogs', blogId))
      .catch(err => console.error('Failed to delete blog from Firestore:', err));
  }
}

// Daily Challenges
export function getDailyChallenges(): DailyChallenge[] {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.DAILY_CHALLENGES) || '[]');
  } catch {
    return [];
  }
}

export function updateDailyChallenge(challenge: DailyChallenge) {
  const challenges = getDailyChallenges();
  const idx = challenges.findIndex(c => c.id === challenge.id);
  if (idx !== -1) {
    challenges[idx] = challenge;
  } else {
    challenges.push(challenge);
  }
  localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(challenges));

  if (auth.currentUser) {
    setDoc(doc(db, 'dailyChallenges', challenge.id), challenge, { merge: true })
      .catch(err => console.error('Failed to update challenge in Firestore:', err));
  }
}

export function deleteDailyChallenge(challengeId: string) {
  const challenges = getDailyChallenges();
  const filtered = challenges.filter(c => c.id !== challengeId);
  localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(filtered));

  if (auth.currentUser) {
    deleteDoc(doc(db, 'dailyChallenges', challengeId))
      .catch(err => console.error('Failed to delete challenge from Firestore:', err));
  }
}

// Admin log functions
export function getAdminLogs(): AdminLog[] {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.ADMIN_LOGS) || '[]');
  } catch {
    return [];
  }
}

export function addAdminLog(action: string, details: string, adminEmail: string) {
  const logs = getAdminLogs();
  const newLog: AdminLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    adminEmail,
  };
  logs.unshift(newLog);
  localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify(logs));
}

// Achievement checker
export function getUnlockedAchievements(user: UserProfile, results: TestResult[]): Achievement[] {
  const userResults = results.filter(r => r.userId === user.uid);
  return DEFAULT_ACHIEVEMENTS.map(ach => {
    let unlocked = false;
    if (ach.requirementType === 'tests') {
      unlocked = (user.testsCount || 0) >= ach.requirementValue;
    } else if (ach.requirementType === 'wpm') {
      unlocked = (user.bestWPM || 0) >= ach.requirementValue;
    } else if (ach.requirementType === 'accuracy') {
      unlocked = userResults.some(r => r.accuracy >= ach.requirementValue);
    } else if (ach.requirementType === 'streak') {
      unlocked = (user.streak || 0) >= ach.requirementValue;
    }

    return unlocked ? { ...ach, unlockedAt: new Date(user.createdAt).toISOString() } : ach;
  });
}

// Unified global remote -> local sync function
export async function syncFirestoreToLocal(userUid: string) {
  try {
    // 1. Sync User Profile
    const userDoc = await getDoc(doc(db, 'users', userUid));
    if (userDoc.exists()) {
      const remoteUser = userDoc.data() as UserProfile;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(remoteUser));
    }

    // 2. Sync Leaderboard/All Users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (!usersSnap.empty) {
      const usersList: UserProfile[] = [];
      usersSnap.forEach(d => {
        usersList.push(d.data() as UserProfile);
      });
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(usersList));
    }

    // 3. Sync Test Results
    const resultsSnap = await getDocs(query(collection(db, 'results'), orderBy('createdAt', 'desc'), limit(150)));
    if (!resultsSnap.empty) {
      const resultsList: TestResult[] = [];
      resultsSnap.forEach(d => {
        resultsList.push(d.data() as TestResult);
      });
      localStorage.setItem(KEYS.RESULTS, JSON.stringify(resultsList));
    }

    // 4. Sync Blogs
    const blogsSnap = await getDocs(collection(db, 'blogs'));
    if (!blogsSnap.empty) {
      const blogsList: BlogArticle[] = [];
      blogsSnap.forEach(d => {
        blogsList.push(d.data() as BlogArticle);
      });
      localStorage.setItem(KEYS.BLOGS, JSON.stringify(blogsList));
    } else {
      // Seed default blogs if remote is completely empty
      const batch = writeBatch(db);
      DEFAULT_BLOGS.forEach(b => {
        batch.set(doc(db, 'blogs', b.id), b);
      });
      await batch.commit();
    }

    // 5. Sync Daily Challenges
    const challengeSnap = await getDocs(collection(db, 'dailyChallenges'));
    if (!challengeSnap.empty) {
      const challengeList: DailyChallenge[] = [];
      challengeSnap.forEach(d => {
        challengeList.push(d.data() as DailyChallenge);
      });
      localStorage.setItem(KEYS.DAILY_CHALLENGES, JSON.stringify(challengeList));
    } else {
      // Seed default challenges if empty
      const batch = writeBatch(db);
      DEFAULT_CHALLENGES.forEach(c => {
        batch.set(doc(db, 'dailyChallenges', c.id), c);
      });
      await batch.commit();
    }

  } catch (error) {
    console.warn('Silent fallback on Firestore connection:', error);
  }
}
