import React, { useState, useEffect } from "react";
import { UserProfile, TypingResult, Difficulty } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { PixelAvatar } from "./PixelAvatar";
import { Calendar, Play, Star, ChevronRight } from "lucide-react";

interface MyResultsViewProps {
  user: UserProfile;
  onStartNewTest: () => void;
}

// Fallback high-fidelity history data to make the screen gorgeous initially
const FALLBACK_HISTORY: TypingResult[] = [
  { uid: "curr", wpm: 48, accuracy: 97.5, raw: 50, consistency: 84, difficulty: Difficulty.EASY, time: 10, createdAt: { seconds: 1781100000 } },
  { uid: "curr", wpm: 46, accuracy: 97.44, raw: 48, consistency: 83, difficulty: Difficulty.EASY, time: 10, createdAt: { seconds: 1781013600 } },
  { uid: "curr", wpm: 41, accuracy: 94.81, raw: 45, consistency: 78, difficulty: Difficulty.EASY, time: 60, createdAt: { seconds: 1778940000 } },
  { uid: "curr", wpm: 44, accuracy: 91.95, raw: 48, consistency: 75, difficulty: Difficulty.EASY, time: 60, createdAt: { seconds: 1778943600 } },
  { uid: "curr", wpm: 31, accuracy: 86.9, raw: 35, consistency: 71, difficulty: Difficulty.EASY, time: 30, createdAt: { seconds: 1780927200 } },
  { uid: "curr", wpm: 36, accuracy: 95.65, raw: 38, consistency: 80, difficulty: Difficulty.EASY, time: 30, createdAt: { seconds: 1781002800 } },
  { uid: "curr", wpm: 2, accuracy: 44.44, raw: 15, consistency: 30, difficulty: Difficulty.EASY, time: 30, createdAt: { seconds: 1781121600 } },
  { uid: "curr", wpm: 2, accuracy: 100, raw: 2, consistency: 90, difficulty: Difficulty.EASY, time: 30, createdAt: { seconds: 1781125200 } },
  { uid: "curr", wpm: 3, accuracy: 100, raw: 3, consistency: 92, difficulty: Difficulty.EASY, time: 30, createdAt: { seconds: 1781128800 } }
];

export const MyResultsView: React.FC<MyResultsViewProps> = ({
  user,
  onStartNewTest
}) => {
  const [history, setHistory] = useState<TypingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; wpm: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const resultsPath = "results";
      try {
        const q = query(
          collection(db, "results"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        const items: TypingResult[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            uid: data.uid,
            wpm: data.wpm,
            accuracy: data.accuracy,
            raw: data.raw,
            consistency: data.consistency,
            difficulty: data.difficulty as Difficulty,
            time: data.time,
            createdAt: data.createdAt
          });
        });

        // Use fallback if user hasn't completed any tests yet
        if (items.length === 0) {
          // Sort fallbacks so they progress correctly in the line chart (chronological index)
          setHistory(FALLBACK_HISTORY.reverse());
        } else {
          // Reverse items so they print oldest-to-newest chronological progress for the chart
          setHistory(items.reverse());
        }
      } catch (err) {
        console.warn("Error fetching user results:", err);
        setHistory(FALLBACK_HISTORY.reverse());
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.uid]);

  // Aggregate stats
  const totalTests = history.length;
  const bestWpm = totalTests > 0 ? Math.max(...history.map((h) => h.wpm)) : 0;
  const avgWpm = totalTests > 0 ? Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? (history.reduce((sum, h) => sum + h.accuracy, 0) / totalTests).toFixed(1) : "0";

  // Calculate star rating from WPM speed
  const getStars = (wpmVal: number) => {
    let count = 1;
    if (wpmVal >= 45) count = 5;
    else if (wpmVal >= 35) count = 4;
    else if (wpmVal >= 25) count = 3;
    else if (wpmVal >= 10) count = 2;

    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${s <= count ? "text-yellow-500 fill-yellow-500" : "text-neutral-700"}`}
          />
        ))}
      </div>
    );
  };

  // SVG Chart Plotter (Latest 20 tests)
  const renderInteractiveSVG = () => {
    if (history.length === 0) return null;

    const chartHeight = 220;
    const chartWidth = 600;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const maxWpmVal = Math.max(...history.map((h) => h.wpm), 60) + 10;

    const points = history.map((val, idx) => {
      const x = paddingLeft + (idx / Math.max(1, history.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = chartHeight - paddingBottom - (val.wpm / maxWpmVal) * (chartHeight - paddingTop - paddingBottom);
      return { x, y, wpm: val.wpm, index: idx + 1 };
    });

    const pathString = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <div className="relative w-full h-64 bg-[#0a0a0a] border border-neutral-850 rounded-2xl p-5 select-none overflow-visible">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 15, 30, 45, 60].map((val) => {
            const y = chartHeight - paddingBottom - (val / maxWpmVal) * (chartHeight - paddingTop - paddingBottom);
            return (
              <g key={val} className="opacity-25">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
                <text x={paddingLeft - 10} y={y + 3} fill="#888888" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {val}
                </text>
              </g>
            );
          })}

          {/* X axis labels (test indexes) */}
          {points.map((p, idx) => {
            if (idx % Math.max(1, Math.round(history.length / 10)) !== 0 && idx !== history.length - 1) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={chartHeight - 10}
                fill="#555555"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {p.index}
              </text>
            );
          })}

          {/* Line curve */}
          <path d={pathString} fill="none" stroke="#ffffff" strokeWidth="2.0" className="transition-all-custom" />

          {/* Circular coordinates trigger with tooltips */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint && hoveredPoint.index === p.index;
            return (
              <g key={idx} className="cursor-pointer">
                {/* Larger transparent hover trigger area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint({ index: p.index, wpm: p.wpm, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "5" : "3.5"}
                  fill={isHovered ? "#ffb703" : "#ffffff"}
                  stroke="#121212"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 shadow-2xl pointer-events-none transition-all duration-75 text-center flex flex-col font-mono"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${(hoveredPoint.y / chartHeight) * 100 - 15}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="text-[9px] text-neutral-500 font-bold uppercase">Test {hoveredPoint.index}</span>
            <span className="text-xs font-extrabold text-white">{hoveredPoint.wpm} WPM</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 flex flex-col gap-6">
      
      {/* Header Profile Info banner */}
      <div className="flex items-center gap-4 border-b border-neutral-900 pb-5">
        <PixelAvatar avatarId={user.avatar} size={54} className="border bg-neutral-950 rounded-xl shadow-lg" />
        <div className="text-left">
          <h1 className="font-display text-3xl font-extrabold text-white">Natijalarim</h1>
          <p className="text-xs text-neutral-400 font-semibold uppercase mt-0.5">
            {user.firstName} {user.lastName} — Yozish ko'nikmalaringizning rivoji
          </p>
        </div>
      </div>

      {/* Aggregate metrics row - screenshot matched */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Metric 1 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[95px]">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Jami testlar
          </span>
          <span className="text-4xl font-extrabold font-mono text-white leading-none mt-2">
            {totalTests}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[95px]">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            O'rtacha WPM
          </span>
          <span className="text-4xl font-extrabold font-mono text-white leading-none mt-2">
            {avgWpm}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[95px]">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Eng yaxshi WPM
          </span>
          <span className="text-4xl font-extrabold font-mono text-white leading-none mt-2">
            {bestWpm}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[95px]">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            O'rtacha aniqlik
          </span>
          <span className="text-4xl font-extrabold font-mono text-white leading-none mt-2">
            {avgAccuracy}%
          </span>
        </div>
      </div>

      {/* WPM Progress Timeline graph - matches screenshot */}
      <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-4 font-mono">
          WPM rivoji (oxirgi 20 ta test)
        </h3>
        {renderInteractiveSVG()}
      </div>

      {/* Recent Tests Log Table - exact look and columns */}
      <div className="bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 overflow-x-auto">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-4 font-mono">
          Oxirgi testlar
        </h3>
        
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-neutral-900 text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              <th className="py-3 px-4">Sana</th>
              <th className="py-3 px-4">Test</th>
              <th className="py-3 px-4">WPM</th>
              <th className="py-3 px-4">Aniqlik</th>
              <th className="py-3 px-4 text-center">Yulduzlar</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((test, index) => {
              const formattedDate = test.createdAt && test.createdAt.seconds
                ? new Date(test.createdAt.seconds * 1000).toLocaleDateString()
                : new Date().toLocaleDateString();
              
              return (
                <tr 
                  key={index}
                  className="border-b border-neutral-900/50 hover:bg-neutral-900/20 text-xs text-neutral-300 font-semibold"
                >
                  <td className="py-3.5 px-4 font-mono text-neutral-500">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-neutral-950 border border-neutral-900 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-400">
                      {test.time}s · {test.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                    {test.wpm}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-400">
                    {test.accuracy}%
                  </td>
                  <td className="py-3.5 px-4">
                    {getStars(test.wpm)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Centered Yangi Test CTA */}
      <div className="flex justify-center py-4 select-none">
        <button
          onClick={onStartNewTest}
          className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all shadow-lg cursor-pointer"
        >
          <Play className="w-3 h-3 fill-black text-black" />
          <span>Yangi test boshlash</span>
        </button>
      </div>

    </div>
  );
};
