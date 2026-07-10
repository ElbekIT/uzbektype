import React, { useState, useEffect } from "react";
import { Difficulty, LeaderboardEntry } from "../types";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { PixelAvatar } from "./PixelAvatar";
import { Users, Zap, Award, BarChart2 } from "lucide-react";

export const LeaderboardView: React.FC = () => {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [rawBoard, setRawBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Owner statistics states (fully real-time from Firestore)
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [globalAverageSpeed, setGlobalAverageSpeed] = useState(0);
  const [globalMaxSpeed, setGlobalMaxSpeed] = useState(0);

  // Helper function to extract milliseconds safely from Firestore Timestamp
  const getTimestampMs = (entry: any) => {
    if (entry.createdAt) {
      if (typeof entry.createdAt.toMillis === "function") {
        return entry.createdAt.toMillis();
      }
      if (entry.createdAt.seconds) {
        return entry.createdAt.seconds * 1000;
      }
    }
    return 0;
  };

  // Sorting function according to priority list:
  // - Highest WPM first.
  // - If WPM is the same, higher Accuracy ranks higher.
  // - If both are the same, higher Consistency ranks higher.
  // - Finally, use the newest timestamp as the tie-breaker.
  const sortLeaderboard = (a: any, b: any) => {
    if (b.wpm !== a.wpm) {
      return b.wpm - a.wpm;
    }
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }
    if (b.consistency !== a.consistency) {
      return b.consistency - a.consistency;
    }
    return getTimestampMs(b) - getTimestampMs(a);
  };

  useEffect(() => {
    // 1. Listen to real-time user profiles with graceful error handling
    const usersRef = collection(db, "users");
    const unsubUsers = onSnapshot(
      usersRef,
      (snapshot) => {
        const profiles: Record<string, any> = {};
        snapshot.forEach((docSnap) => {
          profiles[docSnap.id] = docSnap.data();
        });
        setUserProfiles(profiles);
      },
      (error) => {
        console.warn("Firestore users snapshot failed (expected for guests):", error);
      }
    );

    // 2. Fetch live leaderboard entries
    const leaderboardRef = collection(db, "leaderboard");
    const unsubLeaderboard = onSnapshot(
      leaderboardRef,
      (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            uid: data.uid || "",
            username: data.username || "Anonim",
            avatar: data.avatar || "avatar_1",
            wpm: Number(data.wpm) || 0,
            accuracy: Number(data.accuracy) || 0,
            raw: Number(data.raw) || 0,
            consistency: Number(data.consistency) || 0,
            difficulty: data.difficulty || Difficulty.EASY,
            time: Number(data.time) || 30,
            createdAt: data.createdAt
          });
        });
        setRawBoard(items);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore snapshot error:", error);
        setRawBoard([]);
        setLoading(false);
      }
    );

    // 3. Fetch direct stats from Firestore collections to populate Owner features in real time
    const fetchGlobalStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const resultsSnap = await getDocs(collection(db, "results"));
        
        setTotalUsers(usersSnap.size);
        setTotalRuns(resultsSnap.size);
        
        if (!resultsSnap.empty) {
          // Calculate average
          let totalSpeed = 0;
          let maxSpeed = 0;
          resultsSnap.forEach((doc) => {
            const wpmVal = doc.data().wpm || 0;
            totalSpeed += wpmVal;
            if (wpmVal > maxSpeed) maxSpeed = wpmVal;
          });
          setGlobalAverageSpeed(Math.round(totalSpeed / resultsSnap.size) || 0);
          setGlobalMaxSpeed(maxSpeed);
        } else {
          setGlobalAverageSpeed(0);
          setGlobalMaxSpeed(0);
        }
      } catch (err) {
        console.warn("Error loading global statistics (expected for guests/non-owners):", err);
      }
    };

    fetchGlobalStats();

    return () => {
      unsubUsers();
      unsubLeaderboard();
    };
  }, []);

  // Sync state merging live user profiles & leaderboard entries with cached fallbacks
  useEffect(() => {
    const processed: LeaderboardEntry[] = [];
    rawBoard.forEach((entry) => {
      const profile = userProfiles[entry.uid];
      processed.push({
        id: entry.id,
        uid: entry.uid,
        username: profile ? `${profile.firstName} ${profile.lastName}` : (entry.username || "Anonim"),
        avatar: profile ? (profile.avatar || "avatar_1") : (entry.avatar || "avatar_1"),
        wpm: entry.wpm,
        accuracy: entry.accuracy,
        raw: entry.raw,
        consistency: entry.consistency,
        difficulty: entry.difficulty,
        time: entry.time,
        date: entry.createdAt ? new Date(entry.createdAt.seconds * 1000).toLocaleDateString("en-US", {
          day: 'numeric', month: 'short', year: 'numeric'
        }) : "Hozir"
      });
    });

    processed.sort(sortLeaderboard);
    setBoard(processed);
  }, [rawBoard, userProfiles]);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 flex flex-col gap-8">
      
      {/* Title */}
      <div className="text-left border-b border-neutral-900 pb-5 select-none">
        <h1 className="font-display text-4xl font-extrabold text-white">Reyting jadvali</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Dunyo bo'ylab eng tezkor yozuvchilar reytingi va real vaqtdagi platforma statistikasi
        </p>
      </div>

      {/* Real-time Owner / Platform Statistics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
        {/* Card 1 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-neutral-500 font-mono">Real-time foydalanuvchilar</span>
            <span className="text-xl font-extrabold font-mono text-white leading-tight mt-0.5 block">{totalUsers}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-center text-green-400">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-neutral-500 font-mono">Bajarilgan testlar</span>
            <span className="text-xl font-extrabold font-mono text-white leading-tight mt-0.5 block">{totalRuns}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-center text-yellow-500">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-neutral-500 font-mono">Eng yuqori tezlik</span>
            <span className="text-xl font-extrabold font-mono text-white leading-tight mt-0.5 block">{globalMaxSpeed} WPM</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-center text-purple-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-neutral-500 font-mono">O'rtacha tezlik</span>
            <span className="text-xl font-extrabold font-mono text-white leading-tight mt-0.5 block">{globalAverageSpeed} WPM</span>
          </div>
        </div>
      </div>

      {/* Monkeytype Style Leaderboard Table Wrapper */}
      <div className="w-full bg-[#0a0a0a]/50 border border-neutral-850 rounded-2xl p-6 overflow-x-auto shadow-2xl">
        <h2 className="text-sm font-bold text-neutral-400 mb-5 font-mono">All-time Uzbek Time 15 Leaderboard</h2>
        
        <table className="w-full text-left border-collapse min-w-[700px] font-mono text-xs">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4">foydalanuvchi</th>
              <th className="py-3.5 px-4 text-right">wpm</th>
              <th className="py-3.5 px-4 text-right">accuracy</th>
              <th className="py-3.5 px-4 text-right">raw</th>
              <th className="py-3.5 px-4 text-right">consistency</th>
              <th className="py-3.5 px-4 text-right">vaqt</th>
              <th className="py-3.5 px-4 text-right pr-6">sana</th>
            </tr>
          </thead>
          <tbody>
            {board.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-neutral-500 font-mono text-xs select-none">
                  Hozircha reytinglar yo'q. Birinchi bo'lib testni yakunlang va o'z natijangizni kiriting!
                </td>
              </tr>
            ) : (
              board.map((entry, index) => {
                const isFirst = index === 0;
                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-neutral-900/50 hover:bg-neutral-900/40 text-neutral-300 transition-colors ${
                      isFirst ? "bg-neutral-900/10" : ""
                    }`}
                  >
                    {/* Position Row */}
                    <td className="py-4 px-4 font-bold text-center">
                      {isFirst ? (
                        <span className="text-yellow-500 text-sm">👑</span>
                      ) : (
                        <span className="text-neutral-500">{index + 1}</span>
                      )}
                    </td>

                    {/* Username and Pixel Avatar */}
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <PixelAvatar avatarId={entry.avatar} size={24} className="border-0 bg-transparent rounded-md" />
                        <span>{entry.username}</span>
                      </div>
                    </td>

                    {/* Speed */}
                    <td className="py-4 px-4 text-right font-bold text-white text-sm">
                      {entry.wpm.toFixed(1)}
                    </td>

                    {/* Accuracy */}
                    <td className="py-4 px-4 text-right text-neutral-400">
                      {entry.accuracy.toFixed(1)}%
                    </td>

                    {/* Raw WPM */}
                    <td className="py-4 px-4 text-right text-neutral-500">
                      {entry.raw.toFixed(1)}
                    </td>

                    {/* Consistency */}
                    <td className="py-4 px-4 text-right text-neutral-500">
                      {entry.consistency.toFixed(1)}%
                    </td>

                    {/* Test Time */}
                    <td className="py-4 px-4 text-right text-neutral-500">
                      {entry.time}s
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-right text-neutral-500 pr-6">
                      {entry.date}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
