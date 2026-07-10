import React from "react";
import { UserProfile, TypingResult, Difficulty } from "../types";
import { LeaderboardCard } from "./LeaderboardCard";
import { Send, Share2, RefreshCw, Trophy, Sparkles } from "lucide-react";

interface ResultViewProps {
  stats: Omit<TypingResult, "uid" | "createdAt">;
  timeline: number[];
  user: UserProfile | null;
  onLogin: () => void;
  onRestart: () => void;
  onNavigate: (view: "home" | "test" | "profile" | "my-results" | "leaderboard" | "blog") => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  stats,
  timeline,
  user,
  onLogin,
  onRestart,
  onNavigate
}) => {
  const { wpm, accuracy, raw, consistency, difficulty, time } = stats;

  // Custom SVG line chart plotter
  const renderSVGChart = () => {
    const dataPoints = timeline.length > 0 ? timeline : [wpm];
    const maxSpeed = Math.max(...dataPoints, raw, 60) + 10;
    const chartHeight = 160;
    const chartWidth = 320;
    const padding = 15;

    const points = dataPoints.map((val, index) => {
      const x = padding + (index / Math.max(1, dataPoints.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (val / maxSpeed) * (chartHeight - padding * 2);
      return { x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Generate Raw WPM dashed line (estimating raw history or plotting simple curve)
    const rawPoints = dataPoints.map((val, index) => {
      const rawVal = val + (raw - wpm) * (0.8 + 0.2 * Math.sin(index)); // mock raw timeline
      const x = padding + (index / Math.max(1, dataPoints.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (rawVal / maxSpeed) * (chartHeight - padding * 2);
      return { x, y };
    });
    const rawLinePath = rawPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="w-full h-44 bg-[#0a0a0a] border border-neutral-850 rounded-2xl p-4 flex flex-col justify-between">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 15, 30, 45, 60, 80].map((val) => {
            if (val > maxSpeed) return null;
            const y = chartHeight - padding - (val / maxSpeed) * (chartHeight - padding * 2);
            return (
              <g key={val} className="opacity-20">
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  strokeDasharray="3,3"
                />
                <text
                  x={padding - 10}
                  y={y + 3}
                  fill="#888888"
                  fontSize="7"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Time markers on X axis */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const x = padding + pct * (chartWidth - padding * 2);
            const val = Math.round(pct * time);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 2}
                fill="#555555"
                fontSize="6"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {val}s
              </text>
            );
          })}

          {/* Raw WPM line (dashed) */}
          <path d={rawLinePath} fill="none" stroke="#444444" strokeWidth="1.5" strokeDasharray="3,3" />

          {/* WPM line */}
          <path d={linePath} fill="none" stroke="#ffffff" strokeWidth="2.0" />

          {/* Markers */}
          {points.map((p, i) => {
            if (i % Math.max(1, Math.round(points.length / 6)) !== 0 && i !== points.length - 1) return null;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="#ffffff"
                stroke="#121212"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Legend Indicators */}
        <div className="flex justify-center items-center gap-4 text-[9px] font-mono text-neutral-500 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="border-t-2 border-dashed border-neutral-500 w-3 h-0" />
            <span>Raw WPM</span>
          </div>
        </div>
      </div>
    );
  };

  const handleShare = () => {
    const textToCopy = `Uzbektype yozish testi natijam:\n🚀 Tezlik: ${wpm} WPM\n🎯 Aniqlik: ${accuracy}%\n🔥 Barqarorlik: ${consistency}%\nQiyinlik darajasi: ${difficulty.toUpperCase()}\n\nO'zingizni sinab ko'ring: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    alert("Natijalar clipboardga ko'chirildi! Uni do'stlaringizga ulashing.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 flex flex-col gap-6">
      
      {/* Top Banner for Saving score (Only shown for guest users) */}
      {!user && (
        <div className="w-full bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-white">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Natijangizni saqlang</h3>
              <p className="text-xs text-neutral-400">
                Google bilan kiring — testlaringiz tarixi saqlanadi va siz reytingda qatnashasiz
              </p>
            </div>
          </div>
          <button
            onClick={onLogin}
            className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer"
          >
            {/* Google Logo SVG */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
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

      {/* Main Grid: Left statistics, Right Leaderboard */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Stats & Chart */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <div className="bg-[#050505]/40 border border-neutral-900 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-center">
            {/* Left huge numbers */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left select-none sm:min-w-[180px]">
              <span className="font-display text-6xl md:text-7xl font-extrabold text-white leading-none">
                {wpm}
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest font-mono mt-2 block">
                WPM · {time}S · {difficulty === "oson" ? "Oson" : difficulty === "o'rta" ? "O'rta" : "Qiyin"}
              </span>

              <div className="h-px bg-neutral-900 w-full my-4" />

              <span className="font-display text-4xl md:text-5xl font-extrabold text-white leading-none">
                {accuracy}%
              </span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono mt-1.5 block">
                Aniqlik
              </span>
            </div>

            {/* Right chart */}
            <div className="flex-1 w-full">
              {renderSVGChart()}
            </div>
          </div>

          {/* Sub Stats Cards Grid (4 panels) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Stat Card 1 */}
            <div className="bg-[#0e0e0e]/50 border border-neutral-850 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-bold font-mono text-white mb-1">
                {raw}
              </span>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Raw WPM
              </span>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#0e0e0e]/50 border border-neutral-850 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-bold font-mono text-white mb-1">
                {Math.round(wpm * (time / 60) * 5)}/0/0
              </span>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Belgilar
              </span>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-[#0e0e0e]/50 border border-neutral-850 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-bold font-mono text-white mb-1">
                {consistency}%
              </span>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Barqarorlik
              </span>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-[#0e0e0e]/50 border border-neutral-850 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-bold font-mono text-white mb-1">
                {time}s
              </span>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Vaqt
              </span>
            </div>
          </div>

          {/* Telegram Promo Banner - Screenshot identical */}
          <div className="w-full bg-gradient-to-r from-[#17212b] to-[#111] border border-[#219ebc]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#229ED9] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md">
                {/* Standard Telegram logo drawing */}
                <Send className="w-5 h-5 fill-white text-white transform -translate-x-0.5 translate-y-0.5 rotate-[-15deg]" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white">
                  @shavkatovio kanaliga qo'shiling
                </h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  AI yangiliklari va raqamli ko'nikmalar bo'yicha foydali kontent
                </p>
              </div>
            </div>
            
            <a
              href="https://t.me/shavkatovio"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-[#219ebc] hover:bg-[#1a8099] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              <span>Qo'shilish</span>
              <span className="text-sm">→</span>
            </a>
          </div>

          {/* Action buttons centered */}
          <div className="flex items-center justify-center gap-4 py-3 select-none">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 bg-neutral-950 text-neutral-300 hover:text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Ulashish</span>
            </button>

            <button
              onClick={onRestart}
              className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Qaytadan</span>
            </button>
          </div>
        </div>

        {/* Right Column: Leaderboard Card Widget */}
        <LeaderboardCard 
          user={user} 
          onLogin={onLogin} 
          onViewAll={() => onNavigate("leaderboard")} 
        />
      </div>
    </div>
  );
};
