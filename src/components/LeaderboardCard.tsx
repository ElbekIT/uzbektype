import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Difficulty, Timeframe, UserProfile, LeaderboardEntry } from "../types";
import { PixelAvatar } from "./PixelAvatar";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface LeaderboardCardProps {
  user: UserProfile | null;
  onLogin: () => void;
  onViewAll: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  user,
  onLogin,
  onViewAll
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.WEEKLY);
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [rawPlayers, setRawPlayers] = useState<any[]>([]);

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

  // Listen to Firestore collection 'leaderboard' for real-time scores
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

    // 2. Query scores filtered by selected difficulty
    const leaderboardRef = collection(db, "leaderboard");
    const q = query(
      leaderboardRef,
      where("difficulty", "==", difficulty),
      limit(50) // Fetch larger set to allow profile filtering
    );

    const unsubLeaderboard = onSnapshot(
      q,
      (snapshot) => {
        const livePlayers: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          livePlayers.push({
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
        setRawPlayers(livePlayers);
      },
      (error) => {
        console.warn("Firestore leaderboard fetch failed:", error);
        setRawPlayers([]);
      }
    );

    return () => {
      unsubUsers();
      unsubLeaderboard();
    };
  }, [difficulty]);

  // Merge and sort in real-time with automatic cached fallbacks
  useEffect(() => {
    const processed: LeaderboardEntry[] = [];
    rawPlayers.forEach((player) => {
      const profile = userProfiles[player.uid];
      processed.push({
        id: player.id,
        uid: player.uid,
        username: profile ? `${profile.firstName} ${profile.lastName}` : (player.username || "Anonim"),
        avatar: profile ? (profile.avatar || "avatar_1") : (player.avatar || "avatar_1"),
        wpm: player.wpm,
        accuracy: player.accuracy,
        raw: player.raw,
        consistency: player.consistency,
        difficulty: player.difficulty,
        time: player.time,
        date: player.createdAt ? new Date(player.createdAt.seconds * 1000).toLocaleDateString() : "Hozir"
      });
    });

    processed.sort(sortLeaderboard);
    // Limit to top 10 for the card widget
    setPlayers(processed.slice(0, 10));
  }, [rawPlayers, userProfiles]);

  const getRankIndicator = (index: number) => {
    if (index === 0) return <span className="text-yellow-500">🥇</span>;
    if (index === 1) return <span className="text-gray-300">🥈</span>;
    if (index === 2) return <span className="text-amber-600">🥉</span>;
    return <span className="text-xs text-neutral-500 font-mono">{index + 1}</span>;
  };

  return (
    <div className="w-full lg:w-[360px] flex-shrink-0 bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-5">
      {/* Heading */}
      <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span className="text-sm font-bold text-white tracking-wide">Eng kuchlilar</span>
      </div>

      {/* Toggle Filters - Exact spacing & structure */}
      <div className="flex flex-col gap-3">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-900 rounded-lg">
          {(Object.values(Difficulty) as string[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff as Difficulty)}
              className={`flex-1 text-center py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                difficulty === diff
                  ? "bg-white text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {diff === "oson" ? "Oson" : diff === "o'rta" ? "O'rta" : "Qiyin"}
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-900 rounded-lg">
          {(Object.values(Timeframe) as string[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as Timeframe)}
              className={`flex-1 text-center py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-white text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tf === "hafta" ? "Hafta" : "Oy"}
            </button>
          ))}
        </div>
      </div>

      {/* Players List */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {players.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-xs font-mono select-none">
            Hozircha reytinglar yo'q.<br />
            Birinchi bo'lib testni yakunlang!
          </div>
        ) : (
          players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                user && player.uid === user.uid
                  ? "bg-neutral-900/80 border border-neutral-800"
                  : "hover:bg-neutral-900/40"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank indicator */}
                <div className="w-5 flex justify-center">{getRankIndicator(index)}</div>
                
                {/* Pixel Avatar */}
                <PixelAvatar avatarId={player.avatar} size={24} className="border-0 bg-transparent rounded-sm" />
                
                {/* Username */}
                <span className="text-xs font-semibold text-neutral-200 truncate max-w-[130px]">
                  {player.username}
                </span>
              </div>
              
              {/* Speed WPM */}
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-xs font-bold text-white font-mono">{player.wpm}</span>
                <span className="text-[9px] text-neutral-500 uppercase font-mono">WPM</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Join the Rankings CTA (Google login prompt at bottom if not logged in) */}
      {!user && (
        <div className="border border-dashed border-neutral-800 rounded-xl p-4 bg-neutral-950/60 text-center flex flex-col gap-3">
          <p className="text-[11px] font-medium text-neutral-400 leading-normal">
            <span className="block font-bold text-neutral-200 text-xs mb-1">Reytingda qatnashish</span>
            Google bilan kiring va natijalaringiz reytingda paydo bo'lsin
          </p>
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 font-semibold text-xs py-2 px-4 rounded-lg border border-neutral-800 transition-all cursor-pointer"
          >
            {/* Custom Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google bilan kirish</span>
          </button>
        </div>
      )}

      {/* Link to full Leaderboard */}
      <button
        onClick={onViewAll}
        className="text-xs text-neutral-400 hover:text-white transition-colors text-center font-semibold pt-2 border-t border-neutral-900 cursor-pointer"
      >
        Barchasini ko'rish →
      </button>
    </div>
  );
};
