import React from 'react';
import { UserProfile, UserSettings } from '../types';
import { getTestResults } from '../utils/storage';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, TrendingUp, Award, CheckCircle, Zap, Keyboard, Calendar, Star, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
  setCurrentView: (view: string) => void;
}

export default function DashboardView({
  currentUser,
  settings,
  setCurrentView,
}: DashboardViewProps) {
  const results = getTestResults();
  
  // Filter results specifically for the current user
  const userResults = results.filter(r => r.userId === currentUser.uid);

  // Sorting results chronologically for chart display (oldest first)
  const chartData = [...userResults]
    .slice(0, 20)
    .reverse()
    .map((res, index) => ({
      testNum: index + 1,
      wpm: res.wpm,
      accuracy: res.accuracy,
      date: new Date(res.createdAt).toLocaleDateString(),
    }));

  // Calculate Star ratings for past performances
  const getPerformanceStars = (wpm: number, accuracy: number) => {
    if (wpm >= 90 && accuracy >= 98) return 5;
    if (wpm >= 70 && accuracy >= 96) return 4;
    if (wpm >= 50 && accuracy >= 92) return 3;
    if (wpm >= 30) return 2;
    return 1;
  };

  const isUz = settings.language === 'uz';
  const t = {
    title: isUz ? "Shaxsiy Dashboard" : "Personal Dashboard",
    totalTests: isUz ? "Jami testlar" : "Total Tests",
    avgWpm: isUz ? "O'rtacha tezlik" : "Average WPM",
    bestWpm: isUz ? "Eng yaxshi tezlik" : "Best WPM",
    avgAcc: isUz ? "O'rtacha aniqlik" : "Average Accuracy",
    streak: isUz ? "Kunlik seriya" : "Daily Streak",
    streakSub: isUz ? "ketma-ket kunlar" : "consecutive days",
    progTitle: isUz ? "Tezlik o‘sish dinamikasi (Oxirgi 20 test)" : "Speed Trajectory (Last 20 Tests)",
    historyTitle: isUz ? "Yozish Tarixi" : "Typing History",
    historySub: isUz ? "Siz topshirgan oxirgi testlarning to'liq ro'yxati" : "List of your recent typing test completions",
    date: isUz ? "Sana" : "Date",
    mode: isUz ? "Rejim" : "Mode",
    wpm: isUz ? "Tezlik" : "Speed",
    accuracy: isUz ? "Aniqlik" : "Accuracy",
    score: isUz ? "Baholash" : "Rating",
    startNew: isUz ? "Yangi test boshlash" : "Start New Test",
    noHistory: isUz ? "Hali hech qanday test topshirilmadi." : "You have not completed any typing tests yet."
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight text-white">{t.title}</h1>
            <p className="text-xs text-gray-500">Muvaffaqiyatlaringizni kuzatib boring va doim o'sib boring.</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('typing')}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{t.startNew}</span>
        </button>
      </div>

      {/* Grid of Statistics Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* Total Tests card */}
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3 shadow-md">
          <span className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
            <Keyboard className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.totalTests}</span>
            <span className="text-xl font-bold font-mono text-white">{currentUser.testsCount || 0}</span>
          </div>
        </div>

        {/* Average WPM card */}
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3 shadow-md">
          <span className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.avgWpm}</span>
            <span className="text-xl font-bold font-mono text-white">{currentUser.averageWPM || 0} <span className="text-[10px] text-gray-500 font-normal">WPM</span></span>
          </div>
        </div>

        {/* Best WPM card */}
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3 shadow-md">
          <span className="p-3 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20">
            <Award className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.bestWpm}</span>
            <span className="text-xl font-bold font-mono text-white">{currentUser.bestWPM || 0} <span className="text-[10px] text-gray-500 font-normal">WPM</span></span>
          </div>
        </div>

        {/* Average Accuracy card */}
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3 shadow-md">
          <span className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
            <CheckCircle className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.avgAcc}</span>
            <span className="text-xl font-bold font-mono text-white">{currentUser.accuracy || 0}%</span>
          </div>
        </div>

        {/* Daily Streak card */}
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3 shadow-md col-span-2 lg:col-span-1">
          <span className="p-3 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
            <Zap className="w-5 h-5 fill-orange-500/20" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.streak}</span>
            <span className="text-xl font-bold font-mono text-orange-500">
              {currentUser.streak || 0}
              <span className="text-[10px] text-gray-500 font-normal ml-1">kun</span>
            </span>
          </div>
        </div>

      </div>

      {/* Recharts Trajectory Progression Panel */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl mb-8">
        <h3 className="font-sans font-bold text-lg text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <span>{t.progTitle}</span>
        </h3>

        <div className="h-[280px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="testNum" stroke="#555" fontSize={11} tickLine={false} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '8px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#aaa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#eab308" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorWpm)" 
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">
              {t.noHistory}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tests Logs History */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-[#1a1a1a]">
          <h3 className="font-sans font-bold text-lg text-white">{t.historyTitle}</h3>
          <p className="text-xs text-gray-400 font-normal">{t.historySub}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-300">
            
            <thead className="bg-black/20 text-gray-400 font-mono text-xs uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-6">{t.date}</th>
                <th className="py-3 px-6">{t.mode}</th>
                <th className="py-3 px-6 text-right">{t.wpm}</th>
                <th className="py-3 px-6 text-right">{t.accuracy}</th>
                <th className="py-3 px-6 text-center">{t.score}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {userResults.length > 0 ? (
                userResults.slice(0, 20).map((res) => {
                  const starsCount = getPerformanceStars(res.wpm, res.accuracy);
                  return (
                    <tr key={res.id} className="hover:bg-white/5 transition-all">
                      {/* Date */}
                      <td className="py-3.5 px-6 font-mono text-xs text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {new Date(res.createdAt).toLocaleDateString()}
                      </td>

                      {/* Typing Mode parameters */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-gray-400 font-mono uppercase border border-white/5">
                          {res.language} | {res.duration}s | {res.difficulty === 'easy' ? 'oson' : res.difficulty === 'medium' ? 'o\'rtacha' : 'qiyin'}
                        </span>
                      </td>

                      {/* Speed */}
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-yellow-500">
                        {res.wpm} <span className="text-[10px] text-gray-500 font-normal">WPM</span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-6 text-right font-mono text-gray-200">
                        {res.accuracy}%
                      </td>

                      {/* Stars Rating */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3.5 h-3.5 ${
                                idx < starsCount ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'
                              }`} 
                            />
                          ))}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-mono text-sm">
                    {t.noHistory}
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
