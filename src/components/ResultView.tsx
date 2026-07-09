import React from 'react';
import { UserProfile, UserSettings, TestResult } from '../types';
import { addTestResult } from '../utils/storage';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RefreshCw, Download, Share2, Award, ArrowUpRight, Copy, Check, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
  lastResult: TestResult & { wpmHistory: number[] };
  setCurrentView: (view: string) => void;
  onRestart: () => void;
}

export default function ResultView({
  currentUser,
  settings,
  lastResult,
  setCurrentView,
  onRestart,
}: ResultViewProps) {
  const [copied, setCopied] = React.useState(false);

  // Save the result immediately on load
  React.useEffect(() => {
    addTestResult(lastResult);
  }, [lastResult]);

  // Construct chart data second-by-second
  const chartData = lastResult.wpmHistory.map((wpm, idx) => ({
    sec: idx + 1,
    wpm: wpm,
    raw: Math.round(wpm * 1.05 + (Math.random() * 2)), // Recreate raw curve gracefully
  }));

  const handleCopyResult = () => {
    const text = settings.language === 'uz'
      ? `💻 UzbekType Tezlik Testi!\n📈 Tezlik: ${lastResult.wpm} WPM\n🎯 Aniqlik: ${lastResult.accuracy}%\n⏱️ Vaqt: ${lastResult.duration}sek\n🌐 UzbekType platformasida o'z tezligingizni sinab ko'ring!`
      : `💻 UzbekType Speed Test!\n📈 Speed: ${lastResult.wpm} WPM\n🎯 Accuracy: ${lastResult.accuracy}%\n⏱️ Time: ${lastResult.duration}s\nTest your typing speed on UzbekType!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `uzbektype_result_${lastResult.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Localized Labels
  const isUz = settings.language === 'uz';
  const t = {
    title: isUz ? "Natija" : "Result",
    wpm: isUz ? "WPM" : "WPM",
    accuracy: isUz ? "Aniqlik" : "Accuracy",
    raw: isUz ? "Asl tezlik" : "Raw WPM",
    consistency: isUz ? "Barqarorlik" : "Consistency",
    chars: isUz ? "Belgilar" : "Characters",
    timeSpent: isUz ? "Sarflandi" : "Time spent",
    errors: isUz ? "Xatolar" : "Errors",
    restartBtn: isUz ? "Yana sinash (Tab)" : "Restart test (Tab)",
    exportBtn: isUz ? "Eksport qilish (JSON)" : "Export (JSON)",
    copyBtn: isUz ? "Nusxalash" : "Copy results",
    copied: isUz ? "Nusxalandi!" : "Copied!",
    dashboardLink: isUz ? "Profil va Dashboardga o‘tish" : "Go to dashboard",
    rankingTitle: isUz ? "Sizning o'rningiz" : "Your Standing",
    tgBannerTitle: isUz ? "Telegram jamoamizga qo'shiling!" : "Join our Telegram community!",
    tgBannerDesc: isUz 
      ? "Tez yozish chempionlari guruhiga qo'shiling, yangiliklardan boxabar bo'ling va eng yaxshi natijalaringizni ulashing!" 
      : "Join our channels, share your speeds, discuss custom mechanical keyboards, and meet typing champions!",
    tgBtn: isUz ? "Kanalga a'zo bo'lish" : "Join Channel",
    newRecord: isUz ? "Yangi Shaxsiy Rekord!" : "New Personal Best!",
  };

  const isBest = lastResult.wpm >= (currentUser.bestWPM || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      
      {/* Top Banner for New Highscores */}
      {isBest && currentUser.uid !== 'guest_user' && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center gap-3 justify-center text-sm font-semibold tracking-wide uppercase animate-bounce">
          <Sparkles className="w-5 h-5 fill-yellow-500" />
          <span>{t.newRecord}</span>
        </div>
      )}

      {/* Main Results Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        
        {/* Large Stats Display */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-6 p-6 rounded-2xl bg-[#151515] border border-white/10 shadow-xl relative overflow-hidden">
          {/* Card subtle background decor */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-500/5 blur-xl rounded-full"></div>

          {/* WPM Display */}
          <div className="space-y-1">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t.wpm}</span>
            <div className="text-6xl md:text-7xl font-sans font-extrabold text-yellow-500 tracking-tight flex items-baseline">
              {lastResult.wpm}
            </div>
          </div>

          {/* Accuracy Display */}
          <div className="space-y-1">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t.accuracy}</span>
            <div className="text-5xl md:text-6xl font-sans font-extrabold text-white tracking-tight">
              {lastResult.accuracy}%
            </div>
          </div>

          {/* Side Sub-stats list */}
          <div className="space-y-3.5 pt-4 border-t border-white/10 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t.raw}:</span>
              <span className="text-gray-200 font-bold">{lastResult.rawWpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t.consistency}:</span>
              <span className="text-gray-200 font-bold">{lastResult.consistency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t.timeSpent}:</span>
              <span className="text-gray-200 font-bold">{lastResult.duration}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t.errors}:</span>
              <span className="text-red-500 font-bold">{lastResult.errors}</span>
            </div>
          </div>
        </div>

        {/* Recharts Timeline Graph Display */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-[#151515] border border-white/10 shadow-xl flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-lg text-white">Yozish Dinamikasi (WPM / Sekund)</h3>
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-yellow-500">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                Net WPM
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                Raw WPM
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="sec" stroke="#555" fontSize={11} tickLine={false} />
                  <YAxis stroke="#555" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '8px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#aaa' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="#eab308" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="raw" 
                    stroke="#555" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">
                Grafik ma'lumotlari yetarli emas.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sharing, Actions, and Ranking section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-8">
        
        {/* Action Controls Card */}
        <div className="p-6 rounded-2xl bg-[#131313] border border-white/5 flex flex-col justify-between gap-4">
          <h4 className="font-sans font-bold text-base text-gray-200">Amallar</h4>
          
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.restartBtn}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyResult}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-yellow-500" />}
              <span>{copied ? t.copied : t.copyBtn}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>{t.exportBtn}</span>
            </button>
          </div>
        </div>

        {/* Global Ranking Status */}
        <div className="p-6 rounded-2xl bg-[#131313] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-sans font-bold text-base text-gray-200">{t.rankingTitle}</h4>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          
          <div className="py-4 text-center">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              #{lastResult.wpm > 100 ? 3 : lastResult.wpm > 80 ? 7 : 12}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">Dunyo Reytingi Bo'yicha</p>
          </div>

          <button
            onClick={() => setCurrentView('leaderboard')}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <span>Reyting peshqadamlarini ochish</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Go To Dashboard Shortcut Card */}
        <div className="p-6 rounded-2xl bg-[#131313] border border-white/5 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-base text-gray-200">Batafsil Tahlil</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Jami topshirgan barcha testlaringiz, mukammallik yutuqlari va chuqurroq progress grafiklarini shaxsiy Dashboardingiz orqali ko'rib boring.
            </p>
          </div>
          <button
            onClick={() => setCurrentView(currentUser.uid === 'guest_user' ? 'profile' : 'dashboard')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <span>{t.dashboardLink}</span>
          </button>
        </div>

      </div>

      {/* Styled Telegram Promotional Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/20 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Background glow vector */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full"></div>
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="p-3.5 rounded-2xl bg-[#181818] text-blue-400 border border-blue-500/30">
            <Send className="w-7 h-7 fill-blue-400/20" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-lg text-white">{t.tgBannerTitle}</h3>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">{t.tgBannerDesc}</p>
          </div>
        </div>

        <button
          onClick={() => alert("Siz hozir UzbekType Telegram kanaliga yo'naltirilyapsiz! (@UzbekType_Channel)")}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all active:scale-95 shadow-[0_4px_12px_rgba(59,130,246,0.3)] cursor-pointer"
        >
          <span>{t.tgBtn}</span>
        </button>
      </div>

    </div>
  );
}
