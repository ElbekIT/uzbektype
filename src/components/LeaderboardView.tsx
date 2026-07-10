import React, { useState, useEffect } from "react";
import { Difficulty, LeaderboardEntry } from "../types";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { PixelAvatar } from "./PixelAvatar";
import { Users, Zap, Award, BarChart2 } from "lucide-react";

export const LeaderboardView: React.FC = () => {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Owner statistics states (fully real-time from Firestore)
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [globalAverageSpeed, setGlobalAverageSpeed] = useState(0);
  const [globalMaxSpeed, setGlobalMaxSpeed] = useState(0);

  useEffect(() => {
    // 1. Fetch live leaderboard entries
    const leaderboardRef = collection(db, "leaderboard");
    const q = query(leaderboardRef, orderBy("wpm", "desc"), limit(25));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            uid: data.uid || "",
            username: data.username || "Anonim",
            avatar: data.avatar || "avatar_1",
            wpm: data.wpm || 0,
            accuracy: data.accuracy || 0,
            raw: data.raw || 0,
            consistency: data.consistency || 0,
            difficulty: data.difficulty || Difficulty.EASY,
            time: data.time || 30,
            date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString("en-US", {
              day: 'numeric', month: 'short', year: 'numeric'
            }) : "Hozir"
          });
        });

        // Final sorting descending
        items.sort((a, b) => b.wpm - a.wpm);
        setBoard(items);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore snapshot error:", error);
        setBoard([]);
        setLoading(false);
      }
    );

    // 2. Fetch direct stats from Firestore collections to populate Owner features in real time
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
        console.error("Error loading global statistics:", err);
      }
    };

    fetchGlobalStats();

    return () => unsubscribe();
  }, []);

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
              <th className="py-3.5 px-4 text-right pr-6">sana</th>
            </tr>
          </thead>
          <tbody>
            {board.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-neutral-500 font-mono text-xs select-none">
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
