import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HomeHero } from "./components/HomeHero";
import { LeaderboardCard } from "./components/LeaderboardCard";
import { TestEngine } from "./components/TestEngine";
import { ResultView } from "./components/ResultView";
import { ProfileView } from "./components/ProfileView";
import { MyResultsView } from "./components/MyResultsView";
import { LeaderboardView } from "./components/LeaderboardView";
import { BlogView } from "./components/BlogView";
import { auth, db, googleProvider } from "./firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { Difficulty, UserProfile, TypingResult } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "test" | "result" | "profile" | "my-results" | "leaderboard" | "blog">("home");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Store statistics of the most recently finished typing test
  const [lastStats, setLastStats] = useState<Omit<TypingResult, "uid" | "createdAt"> | null>(null);
  const [lastTimeline, setLastTimeline] = useState<number[]>([]);

  // 1. Monitor Firebase Auth Session Changes
  useEffect(() => {
    // Process redirect result if any on load
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login successful:", result.user.email);
        }
      })
      .catch((err) => {
        console.warn("Google redirect authentication result handling error:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Fast optimistic profile state to avoid blocking UI with a slow loading spinner
        const fullName = u.displayName || "Yozuvchi Anonim";
        const parts = fullName.split(" ");
        const fName = parts[0] || "Yozuvchi";
        const lName = parts.slice(1).join(" ") || "Anonim";
        
        setUser((prev) => {
          if (prev && prev.uid === u.uid) {
            return prev;
          }
          return {
            uid: u.uid,
            email: u.email || "",
            firstName: fName,
            lastName: lName,
            avatar: "avatar_1",
            createdAt: new Date()
          };
        });
        setLoadingAuth(false); // Instantly unblock the UI!

        try {
          const userRef = doc(db, "users", u.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const data = snap.data();
            setUser({
              uid: u.uid,
              email: u.email || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              avatar: data.avatar || "avatar_1",
              createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date()
            });
          } else {
            // New user! Set the memory state and route to Profile Setup view immediately
            // so they can choose their avatar, enter first name, last name and save.
            setCurrentView("profile");
          }
        } catch (err) {
          console.error("Error setting up user profile from Firestore:", err);
        }
      } else {
        setUser(null);
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Google Authentication Login popup with automatic redirect fallback
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Handled reactively by onAuthStateChanged
      }
    } catch (error: any) {
      console.warn("Google popup blocked or failed, falling back to redirect authentication:", error);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        console.error("Google redirect authentication failed:", redirectError);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentView("home");
    } catch (err) {
      console.error("Signout failed:", err);
    }
  };

  // 3. Typing score handler (calculates & submits to DB)
  const handleTestComplete = async (
    stats: Omit<TypingResult, "uid" | "createdAt">,
    timeline: number[]
  ) => {
    setLastStats(stats);
    setLastTimeline(timeline);
    setCurrentView("result");

    // If user is authenticated, save score to DB real-time
    if (auth.currentUser) {
      const currentUid = auth.currentUser.uid;
      try {
        // Save result record
        const resultsRef = collection(db, "results");
        await addDoc(resultsRef, {
          uid: currentUid,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          raw: stats.raw,
          consistency: stats.consistency,
          difficulty: stats.difficulty,
          time: stats.time,
          createdAt: serverTimestamp()
        });

        // Check/Update personal records on the Leaderboard collection
        const leaderboardRef = collection(db, "leaderboard");
        const q = query(
          leaderboardRef,
          where("uid", "==", currentUid),
          where("difficulty", "==", stats.difficulty)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          // Create entry
          await addDoc(leaderboardRef, {
            uid: currentUid,
            username: user ? `${user.firstName} ${user.lastName}` : "Yozuvchi",
            avatar: user ? user.avatar : "avatar_1",
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            raw: stats.raw,
            consistency: stats.consistency,
            difficulty: stats.difficulty,
            time: stats.time,
            createdAt: serverTimestamp()
          });
        } else {
          // If current score is higher than their best, update
          const bestDoc = snap.docs[0];
          const bestWpm = bestDoc.data().wpm || 0;
          if (stats.wpm > bestWpm) {
            const docRef = doc(db, "leaderboard", bestDoc.id);
            await setDoc(
              docRef,
              {
                username: user ? `${user.firstName} ${user.lastName}` : "Yozuvchi",
                avatar: user ? user.avatar : "avatar_1",
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                raw: stats.raw,
                consistency: stats.consistency,
                time: stats.time,
                createdAt: serverTimestamp()
              },
              { merge: true }
            );
          }
        }
      } catch (err) {
        console.error("Firestore writing error:", err);
      }
    }
  };

  const handleProfileUpdated = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Main UI router switch
  const renderView = () => {
    switch (currentView) {
      case "home":
        return (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 py-6">
            <HomeHero onStartTest={() => setCurrentView("test")} />
            <LeaderboardCard
              user={user}
              onLogin={handleLogin}
              onViewAll={() => setCurrentView("leaderboard")}
            />
          </div>
        );

      case "test":
        return (
          <TestEngine
            initialTime={30}
            initialDifficulty={Difficulty.EASY}
            onComplete={handleTestComplete}
            onNavigateHome={() => setCurrentView("home")}
          />
        );

      case "result":
        if (!lastStats) {
          setCurrentView("home");
          return null;
        }
        return (
          <ResultView
            stats={lastStats}
            timeline={lastTimeline}
            user={user}
            onLogin={handleLogin}
            onRestart={() => setCurrentView("test")}
            onNavigate={(v) => setCurrentView(v)}
          />
        );

      case "profile":
        if (!user) {
          setCurrentView("home");
          return null;
        }
        return (
          <ProfileView
            user={user}
            onProfileUpdated={handleProfileUpdated}
            onNavigate={(v) => setCurrentView(v)}
          />
        );

      case "my-results":
        if (!user) {
          setCurrentView("home");
          return null;
        }
        return (
          <MyResultsView
            user={user}
            onStartNewTest={() => setCurrentView("test")}
          />
        );

      case "leaderboard":
        return <LeaderboardView />;

      case "blog":
        return <BlogView />;

      default:
        return null;
    }
  };

  // Outer template styling depending on theme selection (Obsidian dark vs Warm Slate light)
  const appBg = theme === "dark" ? "bg-[#050505] text-white" : "bg-[#f5f5f5] text-neutral-900";
  const contentBg = theme === "dark" ? "bg-[#000000]/20" : "bg-white/80";

  return (
    <div className={`min-h-screen ${appBg} transition-all duration-300 flex flex-col font-sans`}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 md:py-12 flex flex-col justify-center">
        {loadingAuth ? (
          <div className="w-full flex flex-col items-center justify-center gap-4 py-24 select-none">
            <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-white animate-spin" />
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-mono">
              Sessiya yuklanmoqda...
            </span>
          </div>
        ) : (
          renderView()
        )}
      </main>

      {/* Footer footer labels - exact clean text */}
      <footer className="w-full py-8 text-center border-t border-neutral-900/40 select-none text-neutral-600 text-[10px] font-mono">
        &copy; {new Date().getFullYear()} Uzbektype. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
