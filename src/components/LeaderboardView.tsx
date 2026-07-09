import React, { useState } from 'react';
import { UserProfile, UserSettings } from '../types';
import { getAllUsers } from '../utils/storage';
import { Trophy, Shield, Search, Flame, Award, Globe, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
}

export default function LeaderboardView({
  currentUser,
  settings,
}: LeaderboardViewProps) {
  const [difficultyTab, setDifficultyTab] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [periodTab, setPeriodTab] = useState<'week' | 'month' | 'all'>('week');
  const [searchQuery, setSearchQuery] = useState('');

  const users = getAllUsers();

  // Localized wording
  const isUz = settings.language === 'uz';
  const t = {
    title: isUz ? "Milliy Reyting" : "National Leaderboards",
    subtitle: isUz ? "O'zbekiston bo'yicha eng tezkor klaviatura ustalarining jonli reytingi" : "Live rankings of the fastest typists across Uzbekistan",
    searchPlaceholder: isUz ? "Foydalanuvchilarni qidirish..." : "Search typists...",
    rank: isUz ? "O'rin" : "Rank",
    user: isUz ? "Foydalanuvchi" : "User",
    wpm: isUz ? "Tezlik (WPM)" : "Speed (WPM)",
    accuracy: isUz ? "Aniqlik" : "Accuracy",
    country: isUz ? "Mamlakat" : "Country",
    tests: isUz ? "Testlar" : "Tests",
    easy: isUz ? "Oson" : "Easy",
    medium: isUz ? "O'rtacha" : "Medium",
    hard: isUz ? "Qiyin" : "Hard",
    week: isUz ? "Haftalik" : "Weekly",
    month: isUz ? "Oylik" : "Monthly",
    all: isUz ? "Barcha vaqt" : "All Time",
    podiumGold: isUz ? "Chempion" : "Champion",
    podiumSilver: isUz ? "2-o'rin" : "2nd Place",
    podiumBronze: isUz ? "3-o'rin" : "3rd Place"
  };

  // Generate dynamic, filtered leaderboard list
  const getLeaderboardList = () => {
    // Sourced from all users
    let list = [...users];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      list = list.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply difficulty modifiers dynamically
    const multiplier = difficultyTab === 'easy' ? 1.25 : difficultyTab === 'hard' ? 0.8 : 1.0;
    const periodOffset = periodTab === 'week' ? 0 : periodTab === 'month' ? -3 : 5;

    let computedList = list.map(u => {
      const computedWPM = Math.round(u.bestWPM * multiplier + periodOffset);
      return {
        ...u,
        computedWPM: Math.max(15, computedWPM),
      };
    });

    // Sort by computedWPM descending
    computedList.sort((a, b) => b.computedWPM - a.computedWPM);

    return computedList;
  };

  const sortedLeaderboard = getLeaderboardList();
  
  // Slices for top 3 and others
  const top3 = sortedLeaderboard.slice(0, 3);
  const silver = top3[1];
  const gold = top3[0];
  const bronze = top3[2];
  const tableRows = sortedLeaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      
      {/* Title & Introduction */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-sans font-extrabold text-3xl md:text-4xl tracking-tight text-white flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500 animate-[bounce_2s_infinite]" />
          <span>{t.title}</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-normal max-w-xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Tabs Filter Bar & Search Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 mb-8">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-black/40 text-gray-200 placeholder-gray-500 border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
            {(['easy', 'medium', 'hard'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setDifficultyTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  difficultyTab === tab 
                    ? 'bg-yellow-500 text-black font-bold shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'easy' ? t.easy : tab === 'medium' ? t.medium : t.hard}
              </button>
            ))}
          </div>

          {/* Timeframe filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
            {(['week', 'month', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPeriodTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  periodTab === tab 
                    ? 'bg-[#222] text-white border border-white/10 shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'week' ? t.week : tab === 'month' ? t.month : t.all}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Top 3 3D Podium Layout */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 items-end justify-center max-w-3xl mx-auto gap-2 md:gap-6 mb-12 py-6">
          
          {/* 2nd Place (Silver) Podium Column */}
          {silver ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1 filter drop-shadow">{silver.avatar}</span>
              <div className="text-center max-w-[100px] md:max-w-none mb-2">
                <h4 className="text-sm font-bold truncate text-gray-200">{silver.username}</h4>
                <p className="font-mono text-xs text-yellow-500/80 font-bold">{silver.computedWPM} WPM</p>
              </div>
              <div className="w-full h-24 md:h-32 rounded-t-xl bg-gradient-to-t from-slate-400/5 to-slate-400/20 border-t-2 border-slate-400 flex flex-col items-center justify-center p-2 relative shadow-2xl">
                <span className="text-2xl font-mono font-black text-slate-400">2</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">{t.podiumSilver}</span>
              </div>
            </div>
          ) : (
            <div className="h-10"></div>
          )}

          {/* 1st Place (Gold) Podium Column - HIGHEST */}
          {gold ? (
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-1 filter drop-shadow scale-110 relative">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-lg">👑</span>
                {gold.avatar}
              </span>
              <div className="text-center max-w-[100px] md:max-w-none mb-2">
                <h4 className="text-base font-black truncate text-white">{gold.username}</h4>
                <p className="font-mono text-sm text-yellow-500 font-extrabold">{gold.computedWPM} WPM</p>
              </div>
              <div className="w-full h-32 md:h-44 rounded-t-xl bg-gradient-to-t from-yellow-500/5 to-yellow-500/30 border-t-4 border-yellow-500 flex flex-col items-center justify-center p-2 relative shadow-2xl">
                <span className="text-4xl font-mono font-black text-yellow-500">1</span>
                <span className="text-xs text-yellow-500 font-extrabold uppercase tracking-widest hidden sm:block">{t.podiumGold}</span>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-500/5 blur-xl rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="h-10"></div>
          )}

          {/* 3rd Place (Bronze) Podium Column */}
          {bronze ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1 filter drop-shadow">{bronze.avatar}</span>
              <div className="text-center max-w-[100px] md:max-w-none mb-2">
                <h4 className="text-sm font-bold truncate text-gray-200">{bronze.username}</h4>
                <p className="font-mono text-xs text-yellow-500/80 font-bold">{bronze.computedWPM} WPM</p>
              </div>
              <div className="w-full h-20 md:h-24 rounded-t-xl bg-gradient-to-t from-amber-600/5 to-amber-600/20 border-t-2 border-amber-600 flex flex-col items-center justify-center p-2 relative shadow-2xl">
                <span className="text-xl font-mono font-black text-amber-600">3</span>
                <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider hidden sm:block">{t.podiumBronze}</span>
              </div>
            </div>
          ) : (
            <div className="h-10"></div>
          )}

        </div>
      )}

      {/* Main Leaderboard Table Rows */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-300">
            
            {/* Table Head */}
            <thead className="bg-[#1b1b1b] text-gray-400 font-mono text-xs uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6 text-center w-16">{t.rank}</th>
                <th className="py-4 px-6">{t.user}</th>
                <th className="py-4 px-6 text-right w-36">{t.wpm}</th>
                <th className="py-4 px-6 text-right w-28">{t.accuracy}</th>
                <th className="py-4 px-6 text-center w-28">{t.tests}</th>
                <th className="py-4 px-6 text-center w-28">{t.country}</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5">
              {tableRows.length > 0 ? (
                tableRows.map((user, index) => {
                  const absoluteRank = index + 4;
                  const isCurrentUser = user.uid === currentUser.uid;

                  return (
                    <tr 
                      key={user.uid}
                      className={`hover:bg-white/5 transition-colors group ${
                        isCurrentUser ? 'bg-yellow-500/5 text-white font-semibold' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-6 text-center font-mono font-semibold text-gray-400 group-hover:text-white">
                        {absoluteRank}
                      </td>

                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{user.avatar}</span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-200 group-hover:text-white truncate max-w-[180px]">
                              {user.username}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              A'zo bo'ldi: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Speed WPM */}
                      <td className="py-3.5 px-6 text-right font-mono text-base font-bold text-white group-hover:text-yellow-500 transition-colors">
                        {user.computedWPM}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-6 text-right font-mono text-gray-300">
                        {user.accuracy}%
                      </td>

                      {/* Total Tests */}
                      <td className="py-3.5 px-6 text-center font-mono text-gray-400">
                        {user.testsCount}
                      </td>

                      {/* Country Flag representation */}
                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 text-xs font-mono font-semibold text-gray-400 group-hover:text-white border border-white/5">
                          <Globe className="w-3.5 h-3.5 text-gray-500 group-hover:text-yellow-500" />
                          {user.country}
                        </span>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-mono">
                    Reyting ro'yxati bo'sh yoki foydalanuvchi topilmadi.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
