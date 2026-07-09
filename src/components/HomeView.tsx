import React, { useState } from 'react';
import { UserProfile, UserSettings } from '../types';
import { INITIAL_LEADERBOARD } from '../data';
import { Flame, Play, Trophy, LogIn, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  setCurrentView: (view: string) => void;
  onLogin: () => void;
  // Let parent know if they chose a specific difficulty/mode from here
  setTestOptions: (options: { difficulty: 'easy' | 'medium' | 'hard'; duration: number }) => void;
}

export default function HomeView({
  currentUser,
  settings,
  setSettings,
  setCurrentView,
  onLogin,
  setTestOptions,
}: HomeViewProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const handleStartTest = (difficulty: 'easy' | 'medium' | 'hard', duration: number) => {
    setTestOptions({ difficulty, duration });
    setCurrentView('typing');
  };

  // Uzbek / English localized text
  const isUz = settings.language === 'uz';
  const t = {
    heroSmall: isUz ? "Sekin yozish vaqtni behuda sarflaydi." : "Slow typing wastes your time.",
    heroTitle: isUz ? "Yozish Tezligingizni Sinab Ko'ring" : "Test Your Typing Speed",
    heroDesc: isUz 
      ? "UzbekType yordamida o‘zbekcha va inglizcha yozish tezligingizni oshiring, mushak xotirangizni charxlang va dunyo reytingida o'z o'rningizni egallang!" 
      : "Boost your typing speed in Uzbek and English, train your muscle memory, and compete on global leaderboards with UzbekType!",
    startBtn: isUz ? "Yozishni boshlash" : "Start typing now",
    topTypists: isUz ? "Top Typists" : "Top Typists",
    difficulty: isUz ? "Qiyinchilik" : "Difficulty",
    time: isUz ? "Vaqt" : "Time",
    easy: isUz ? "Oson" : "Easy",
    medium: isUz ? "O'rtacha" : "Medium",
    hard: isUz ? "Qiyin" : "Hard",
    week: isUz ? "Hafta" : "Week",
    month: isUz ? "Oy" : "Month",
    rank: isUz ? "Sizning o'rningiz" : "Your rank",
    viewAll: isUz ? "Barchasini ko'rish" : "View leaderboard",
    guestLogin: isUz ? "Profilga kirish" : "Sign in to profile",
    guestMsg: isUz 
      ? "Hozir kiring va natijalaringizni bulutda saqlab boring." 
      : "Log in now to save your typing history and claim achievements.",
    statsLabel: isUz ? "Asosiy natijangiz:" : "Your best performance:",
    startQuick: isUz ? "Tezkor boshlash:" : "Quick play:"
  };

  // Adjust pre-populated leaderboard numbers slightly based on difficulty
  const getLeaderboardData = () => {
    const multiplier = selectedDifficulty === 'easy' ? 1.25 : selectedDifficulty === 'hard' ? 0.8 : 1.0;
    const periodOffset = selectedPeriod === 'week' ? 0 : -3;
    
    return INITIAL_LEADERBOARD.map((item, idx) => {
      const adjustedWPM = Math.round(item.bestWPM * multiplier + periodOffset - idx * 0.5);
      return {
        ...item,
        bestWPM: adjustedWPM,
      };
    }).sort((a, b) => b.bestWPM - a.bestWPM);
  };

  const currentLeaderboard = getLeaderboardData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 md:px-8 flex flex-col lg:flex-row items-stretch justify-between gap-12 text-white">
      
      {/* Left Hero Section */}
      <div className="flex-1 flex flex-col justify-center space-y-8">
        
        {/* Sparkle Banner */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3.5 py-1.5 rounded-full border border-yellow-500/20 text-xs font-semibold tracking-wider uppercase max-w-max">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.heroSmall}</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4">
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl font-normal leading-relaxed">
            {t.heroDesc}
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            id="home_start_btn"
            onClick={() => handleStartTest('medium', 30)}
            className="flex items-center justify-center gap-2.5 bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl text-lg font-bold transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>{t.startBtn}</span>
          </button>

          {/* Quick choices */}
          <div className="flex items-center gap-2 justify-center py-2">
            <span className="text-xs text-gray-500 font-mono">{t.startQuick}</span>
            <button
              onClick={() => handleStartTest('easy', 15)}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 hover:text-white transition-all"
            >
              Easy (15s)
            </button>
            <button
              onClick={() => handleStartTest('hard', 60)}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 hover:text-white transition-all"
            >
              Hard (60s)
            </button>
          </div>
        </div>

        {/* Guest Warning Card or Personal stats overview */}
        {currentUser.uid === 'guest_user' ? (
          <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-semibold text-white">{t.guestLogin}</h4>
              <p className="text-xs text-gray-400">{t.guestMsg}</p>
            </div>
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#222222] hover:bg-[#2e2e2e] text-white border border-white/10 hover:border-white/20 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-yellow-500" />
              <span>{t.guestLogin}</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 flex items-center justify-between gap-4 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-[#222222] p-2 rounded-xl border border-white/10">{currentUser.avatar}</span>
              <div>
                <h4 className="font-bold text-white text-lg">Xush kelibsiz, {currentUser.username}!</h4>
                <p className="text-xs text-gray-400">{t.statsLabel} <span className="font-mono text-yellow-500 font-bold">{currentUser.bestWPM || 0} WPM</span></p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono border border-white/10 text-gray-300 transition-all"
            >
              {t.rank}
            </button>
          </div>
        )}

      </div>

      {/* Right Side: Top Typists Leaderboard Card */}
      <div className="w-full lg:w-[420px] rounded-2xl bg-[#151515] border border-white/10 p-6 flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Card ambient glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full"></div>

        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-sans font-bold text-lg text-white">{t.topTypists}</h3>
          </div>
          <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full font-mono font-semibold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">{t.difficulty}</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-black/40 border border-white/5">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  selectedDifficulty === diff 
                    ? 'bg-yellow-500 text-black font-bold shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {diff === 'easy' ? t.easy : diff === 'medium' ? t.medium : t.hard}
              </button>
            ))}
          </div>
        </div>

        {/* Period Selector */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">{t.time}</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-black/40 border border-white/5">
            {(['week', 'month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  selectedPeriod === p 
                    ? 'bg-[#222] text-white border border-white/10 shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p === 'week' ? t.week : t.month}
              </button>
            ))}
          </div>
        </div>

        {/* Top 10 Typists list */}
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
          {currentLeaderboard.slice(0, 7).map((user, index) => {
            const rankStyles = [
              'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 font-bold',
              'bg-slate-300/10 text-slate-300 border border-slate-300/25 font-bold',
              'bg-amber-600/10 text-amber-600 border border-amber-600/25 font-bold'
            ];
            
            return (
              <div 
                key={user.uid}
                className="flex items-center justify-between p-2 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono ${
                    index < 3 ? rankStyles[index] : 'text-gray-400 font-medium'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-lg">{user.avatar}</span>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[150px]">
                    {user.username}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-right">
                  <span className="text-sm font-bold text-white">{user.bestWPM}</span>
                  <span className="text-[10px] text-gray-500">WPM</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <button
          onClick={() => setCurrentView('leaderboard')}
          className="mt-6 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-yellow-500" />
          <span>{t.viewAll}</span>
        </button>

      </div>
    </div>
  );
}
