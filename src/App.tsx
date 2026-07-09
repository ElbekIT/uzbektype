import React, { useState, useEffect } from 'react';
import { UserProfile, UserSettings, TestResult } from './types';
import { getCurrentUser, saveCurrentUser, initStorage, syncFirestoreToLocal } from './utils/storage';
import { auth, googleProvider, db } from './utils/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import TypingView from './components/TypingView';
import ResultView from './components/ResultView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import DashboardView from './components/DashboardView';
import BlogView from './components/BlogView';
import AdminView from './components/AdminView';
import { Sparkles, X, Shield, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'carbon',
    language: 'uz',
    typingSound: 'click',
    showKeyboard: true,
  });

  // Navigation Routing States
  const [currentView, setCurrentView] = useState<string>('home');
  const [testDifficulty, setTestDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [testDuration, setTestDuration] = useState<number>(30);
  const [lastResult, setLastResult] = useState<(TestResult & { wpmHistory: number[] }) | null>(null);

  // Authentication Dialog Simulators/Fallbacks
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginAvatar, setLoginAvatar] = useState('👨‍💻');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<'user' | 'admin'>('user');

  // Load and save settings to Firestore and LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('uzbektype_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('uzbektype_settings', JSON.stringify(settings));
    if (currentUser.uid !== 'guest_user') {
      setDoc(doc(db, 'users', currentUser.uid), { settings }, { merge: true })
        .catch(err => console.error('Error saving settings to Firestore:', err));
    }
  }, [settings, currentUser.uid]);

  // Handle Firebase auth state changes
  useEffect(() => {
    initStorage();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Authenticated user
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          let activeProfile: UserProfile;

          if (!userDoc.exists()) {
            activeProfile = {
              uid: user.uid,
              username: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              avatar: '👨‍💻',
              country: 'UZ',
              createdAt: new Date().toISOString(),
              bestWPM: 0,
              averageWPM: 0,
              accuracy: 0,
              testsCount: 0,
              streak: 1,
              streakLastUpdated: new Date().toISOString().split('T')[0],
              isAdmin: user.email === 'admin@uzbektype.uz' || user.email?.includes('admin'),
            };
            await setDoc(userDocRef, {
              ...activeProfile,
              displayName: user.displayName || activeProfile.username,
              lastOnline: new Date().toISOString()
            });
          } else {
            activeProfile = userDoc.data() as UserProfile;
          }

          saveCurrentUser(activeProfile);
          setCurrentUser(activeProfile);

          // Full background sync
          await syncFirestoreToLocal(user.uid);
          
          // Re-get from Local Cache in case sync retrieved more results
          setCurrentUser(getCurrentUser());
        } catch (error) {
          console.error("Auth state change sync failed:", error);
        }
      } else {
        // Guest user fallback
        const guestUser = getCurrentUser();
        if (guestUser.uid !== 'guest_user') {
          const defaultGuest: UserProfile = {
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
          localStorage.setItem('uzbektype_current_user', JSON.stringify(defaultGuest));
          setCurrentUser(defaultGuest);
        } else {
          setCurrentUser(guestUser);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let activeProfile: UserProfile;

      if (!userDoc.exists()) {
        activeProfile = {
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: '👨‍💻',
          country: 'UZ',
          createdAt: new Date().toISOString(),
          bestWPM: 0,
          averageWPM: 0,
          accuracy: 0,
          testsCount: 0,
          streak: 1,
          streakLastUpdated: new Date().toISOString().split('T')[0],
          isAdmin: user.email === 'admin@uzbektype.uz' || user.email?.includes('admin'),
        };
        await setDoc(userDocRef, {
          ...activeProfile,
          displayName: user.displayName || activeProfile.username,
          lastOnline: new Date().toISOString()
        });
      } else {
        activeProfile = userDoc.data() as UserProfile;
      }

      saveCurrentUser(activeProfile);
      setCurrentUser(activeProfile);
      await syncFirestoreToLocal(user.uid);
      setCurrentView('dashboard');
    } catch (error) {
      console.warn("Standard Google Auth popup blocked/failed. Showing sandbox-compatible demo fallback modal.", error);
      setIsLoginModalOpen(true);
    }
  };

  const handleDemoSignIn = async (role: 'user' | 'admin') => {
    const demoUid = role === 'admin' ? 'demo_admin_uid' : 'demo_user_uid';
    const demoUser: UserProfile = {
      uid: demoUid,
      username: role === 'admin' ? 'UzbekType_Admin' : 'Dasturchi_Uz',
      email: role === 'admin' ? 'admin@uzbektype.uz' : 'dasturchi@gmail.com',
      avatar: role === 'admin' ? '🛡️' : '⚡',
      country: 'UZ',
      createdAt: new Date().toISOString(),
      bestWPM: 74,
      averageWPM: 62,
      accuracy: 97.4,
      testsCount: 18,
      streak: 4,
      streakLastUpdated: new Date().toISOString().split('T')[0],
      isAdmin: role === 'admin',
    };

    try {
      const userDocRef = doc(db, 'users', demoUid);
      await setDoc(userDocRef, {
        ...demoUser,
        displayName: demoUser.username,
        lastOnline: new Date().toISOString()
      }, { merge: true });

      saveCurrentUser(demoUser);
      setCurrentUser(demoUser);
      await syncFirestoreToLocal(demoUid);
      setIsLoginModalOpen(false);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Error in demo sign in Firestore update:', err);
      // Local fallback anyway
      saveCurrentUser(demoUser);
      setCurrentUser(demoUser);
      setIsLoginModalOpen(false);
      setCurrentView('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
    const defaultGuest: UserProfile = {
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
    localStorage.setItem('uzbektype_current_user', JSON.stringify(defaultGuest));
    setCurrentUser(defaultGuest);
    setCurrentView('home');
  };

  // Determine active theme color variables
  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'cyberpunk':
        return {
          bg: 'bg-[#0a0c14]',
          text: 'text-gray-100',
          accentText: 'text-pink-500',
          accentBg: 'bg-pink-500',
          accentBorder: 'border-pink-500/20',
          accentFill: 'fill-pink-500',
          navbarText: 'text-white',
          themeGlow: 'bg-pink-500/5',
        };
      case 'serene':
        return {
          bg: 'bg-[#f5f6f8]',
          text: 'text-gray-800',
          accentText: 'text-emerald-700',
          accentBg: 'bg-emerald-700',
          accentBorder: 'border-emerald-700/10',
          accentFill: 'fill-emerald-700',
          navbarText: 'text-gray-900',
          themeGlow: 'bg-emerald-700/5',
        };
      case 'lavender':
        return {
          bg: 'bg-[#0e0a1b]',
          text: 'text-gray-200',
          accentText: 'text-purple-400',
          accentBg: 'bg-purple-600',
          accentBorder: 'border-purple-600/20',
          accentFill: 'fill-purple-400',
          navbarText: 'text-white',
          themeGlow: 'bg-purple-600/5',
        };
      case 'carbon':
      default:
        return {
          bg: 'bg-[#111111]',
          text: 'text-gray-200',
          accentText: 'text-yellow-500',
          accentBg: 'bg-yellow-500',
          accentBorder: 'border-yellow-500/20',
          accentFill: 'fill-yellow-500',
          navbarText: 'text-white',
          themeGlow: 'bg-yellow-500/5',
        };
    }
  };

  const currentTheme = getThemeClasses();

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} font-sans transition-colors duration-300 flex flex-col justify-between selection:bg-yellow-500/30 selection:text-white relative`}>
      
      {/* Background themed subtle ambient blob */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] ${currentTheme.themeGlow} blur-[120px] rounded-full pointer-events-none`}></div>

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        settings={settings}
        setSettings={setSettings}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Pages Container */}
      <main className="flex-1 w-full relative z-10">
        
        {currentView === 'home' && (
          <HomeView
            currentUser={currentUser}
            settings={settings}
            setSettings={setSettings}
            setCurrentView={setCurrentView}
            onLogin={() => setIsLoginModalOpen(true)}
            setTestOptions={(opts) => {
              setTestDifficulty(opts.difficulty);
              setTestDuration(opts.duration);
            }}
          />
        )}

        {currentView === 'typing' && (
          <TypingView
            currentUser={currentUser}
            settings={settings}
            setSettings={setSettings}
            setCurrentView={setCurrentView}
            difficulty={testDifficulty}
            duration={testDuration}
            setLastResult={setLastResult}
          />
        )}

        {currentView === 'result' && lastResult && (
          <ResultView
            currentUser={currentUser}
            settings={settings}
            lastResult={lastResult}
            setCurrentView={setCurrentView}
            onRestart={() => setCurrentView('typing')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            currentUser={currentUser}
            settings={settings}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            settings={settings}
            setCurrentUser={setCurrentUser}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            settings={settings}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'blog' && (
          <BlogView
            currentUser={currentUser}
            settings={settings}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            currentUser={currentUser}
            settings={settings}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 bg-black/20 text-center text-xs font-mono text-gray-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 UzbekType. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Maxfiylik siyosati</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Foydalanish shartlari</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => alert("Aloqa: info@uzbektype.uz")}>Aloqa</span>
          </div>
        </div>
      </footer>

      {/* Google Authentication Dialog */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
            
            {/* Ambient vector decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full"></div>

            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-black/40 rounded-full text-gray-500 hover:text-white border border-white/5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Heading */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-3xl">🔑</span>
              <h3 className="font-sans font-extrabold text-xl text-white">UzbekType Tizimiga Kirish</h3>
              <p className="text-xs text-gray-400">Google orqali kiring va natijalaringizni real vaqtda saqlab boring.</p>
            </div>

            {/* Real vs Sandbox Options */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Google account orqali kirish</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">Yoki Tezkor Demo (Iframe uchun)</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('user')}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 text-xs font-bold transition-all active:scale-95 text-center flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-lg">⚡</span>
                  <span>Oddiy Foydalanuvchi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('admin')}
                  className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-xs font-bold transition-all active:scale-95 text-center flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-5 h-5 text-red-500" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
