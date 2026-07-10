import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Clock, RefreshCw, Sliders, ChevronDown } from "lucide-react";
import { Difficulty, AnimationMode, TypingResult } from "../types";
import { getRandomSentence } from "../data/sentences";

interface TestEngineProps {
  initialTime: number;
  initialDifficulty: Difficulty;
  onComplete: (stats: Omit<TypingResult, "uid" | "createdAt">, timeline: number[]) => void;
  onNavigateHome: () => void;
}

// Preset correct character colors
const COLOR_OPTIONS = [
  { name: "White", hex: "#ffffff", class: "text-white" },
  { name: "Blue", hex: "#3182ce", class: "text-blue-400" },
  { name: "Gold", hex: "#d69e2e", class: "text-yellow-500" },
  { name: "Teal", hex: "#319795", class: "text-teal-400" }
];

export const TestEngine: React.FC<TestEngineProps> = ({
  initialTime,
  initialDifficulty,
  onComplete,
  onNavigateHome
}) => {
  // Test presets state
  const [duration, setDuration] = useState<number>(initialTime);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [charColor, setCharColor] = useState(COLOR_OPTIONS[0]);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0); // 1x, 1.5x, etc.
  const [animMode, setAnimMode] = useState<AnimationMode>(AnimationMode.NORMAL);

  // Core typing state
  const [text, setText] = useState("");
  const [typedKeys, setTypedKeys] = useState<string[]>([]); // User inputs
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Errors and statistics trackers
  const [errorCount, setErrorCount] = useState(0);
  const [rawWpmHistory, setRawWpmHistory] = useState<number[]>([]);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [lastWpm, setLastWpm] = useState(0);

  // Precise timing refs to avoid stale closures and timing inaccuracies
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number>(duration);
  const difficultyRef = useRef<Difficulty>(difficulty);
  const textRef = useRef<string>(text);
  const isActiveRef = useRef<boolean>(isActive);
  const typedKeysRef = useRef<string[]>(typedKeys);
  const wpmHistoryRef = useRef<number[]>([]);
  const lastRecordedSecondRef = useRef<number>(0);

  // Sync refs with state on every render
  durationRef.current = duration;
  difficultyRef.current = difficulty;
  textRef.current = text;
  isActiveRef.current = isActive;
  typedKeysRef.current = typedKeys;

  // UI refs for typing alignment and scrolling animations
  const textContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Initialize text based on selected difficulty
  const initTest = () => {
    const rawText = getRandomSentence(difficulty);
    setText(rawText);
    setTypedKeys([]);
    setStartTime(null);
    
    // Reset precise timing refs
    startTimeRef.current = null;
    wpmHistoryRef.current = [];
    lastRecordedSecondRef.current = 0;

    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setErrorCount(0);
    setRawWpmHistory([]);
    setWpmHistory([]);
    setLastWpm(0);
    wordRefs.current = [];
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
    }
  };

  // Re-run setup if preset triggers change
  useEffect(() => {
    initTest();
  }, [duration, difficulty]);

  // Handle hidden input focus on click
  const handleContainerClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  // Auto-focus on mount
  useEffect(() => {
    handleContainerClick();
  }, []);

  // Handle keypresses through a hidden HTML input to support mobile/desktop smoothly
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const value = e.target.value;
    const currentKeys = value.split("");

    // Start timer on first correct character
    if (!isActive && currentKeys.length > 0) {
      const isFirstCharCorrect = currentKeys[0] === text[0];
      if (isFirstCharCorrect) {
        setIsActive(true);
        const now = Date.now();
        setStartTime(now);
        startTimeRef.current = now;
        lastRecordedSecondRef.current = 0;
      }
    }

    // Detect if we added a mistake
    if (currentKeys.length > typedKeys.length) {
      const addedChar = currentKeys[currentKeys.length - 1];
      const expectedChar = text[currentKeys.length - 1];
      if (addedChar !== expectedChar) {
        setErrorCount((prev) => prev + 1);
      }
    }

    setTypedKeys(currentKeys);

    // Auto-finish if user typed the whole paragraph
    if (currentKeys.length >= text.length && text.length > 0) {
      const elapsedMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const elapsedSeconds = Math.max(0.1, elapsedMs / 1000);
      finishTest(currentKeys, elapsedSeconds);
    }
  };

  // Main timer clock interval using high-precision timestamp
  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      if (!startTimeRef.current) return;

      const now = Date.now();
      const elapsedMs = now - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const calculatedTimeLeft = Math.max(0, durationRef.current - elapsedSeconds);

      setTimeLeft(calculatedTimeLeft);

      // Record rolling stats per second
      if (elapsedSeconds > lastRecordedSecondRef.current) {
        const keysCount = typedKeysRef.current.length;
        const correctKeys = typedKeysRef.current.filter((k, i) => k === textRef.current[i]).length;

        const newRawHistory: number[] = [];
        const newWpmHistory: number[] = [];
        let latestWpm = 0;

        for (let sec = lastRecordedSecondRef.current + 1; sec <= elapsedSeconds; sec++) {
          if (sec <= durationRef.current) {
            // Raw WPM
            const rawWpm = Math.round((keysCount / 5) / (sec / 60));
            // Net WPM
            const netWpm = Math.max(0, Math.round((correctKeys / 5) / (sec / 60)));
            newRawHistory.push(rawWpm);
            newWpmHistory.push(netWpm);
            latestWpm = netWpm;
          }
        }

        if (newRawHistory.length > 0) {
          setRawWpmHistory((prev) => [...prev, ...newRawHistory]);
          setWpmHistory((prev) => {
            const updated = [...prev, ...newWpmHistory];
            wpmHistoryRef.current = updated;
            return updated;
          });
          setLastWpm(latestWpm);
        }
        lastRecordedSecondRef.current = elapsedSeconds;
      }

      // When the timer reaches 0, the test must immediately end automatically.
      if (calculatedTimeLeft <= 0) {
        clearInterval(intervalId);
        finishTest(typedKeysRef.current, durationRef.current);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isActive]);

  // Handle keyboard restart combination (Tab + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if it's Tab, and prevent default browser focus cycling
      if (e.key === "Tab") {
        e.preventDefault();
      }
      
      // If Tab + Enter was pressed together, restart
      if (e.key === "Enter" && typedKeys.length > 0) {
        initTest();
        handleContainerClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typedKeys]);

  // Finish typing test and forward statistics to parent
  const finishTest = (finalTypedKeys: string[], finalDurationSeconds: number) => {
    setIsActive(false);
    setIsFinished(true);

    const timeInMinutes = Math.max(0.1, finalDurationSeconds / 60);
    const totalTyped = finalTypedKeys.length;
    
    const currentText = textRef.current;
    const correctCount = finalTypedKeys.filter((k, i) => k === currentText[i]).length;

    const history = wpmHistoryRef.current;

    // Consistency calculation: check variability of typing speeds
    let consistency = 80; // default
    if (history.length > 1) {
      const avg = history.reduce((sum, v) => sum + v, 0) / history.length;
      if (avg > 0) {
        // compute standard deviation
        const variance = history.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);
        // Consistency is inverse of coefficient of variation
        consistency = Math.max(30, Math.min(100, Math.round(100 - (stdDev / avg) * 100)));
      }
    }

    // Formulas:
    // Raw WPM = total keys typed / 5 / elapsed minutes
    const rawWpm = Math.round((totalTyped / 5) / timeInMinutes);
    // Net WPM = correct keys typed / 5 / elapsed minutes
    const wpm = Math.round((correctCount / 5) / timeInMinutes);
    // Accuracy = correct / total
    const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 1000) / 10 : 100;

    const finalStats = {
      wpm,
      accuracy,
      raw: rawWpm,
      consistency,
      difficulty: difficultyRef.current,
      time: durationRef.current
    };

    // Forward results
    onComplete(finalStats, history.length > 0 ? history : [wpm]);
  };

  // Convert paragraph text into word array for custom highlighting & sliding animations
  const words = text.split(" ");
  let totalCharCounter = 0;

  // Track active word line indices to slide text up
  const activeCharIndex = typedKeys.length;
  let activeWordIndex = 0;
  let runningCharSum = 0;

  for (let i = 0; i < words.length; i++) {
    const wordLenWithSpace = words[i].length + 1; // including space
    if (activeCharIndex >= runningCharSum && activeCharIndex < runningCharSum + wordLenWithSpace) {
      activeWordIndex = i;
      break;
    }
    runningCharSum += wordLenWithSpace;
  }

  // Animation layout styling: Center active line & hide completed ones
  const getContainerStyles = (): React.CSSProperties => {
    if (animMode === AnimationMode.NORMAL || wordRefs.current.length === 0) {
      return {};
    }

    const activeWordEl = wordRefs.current[activeWordIndex];
    if (!activeWordEl || !textContainerRef.current) return {};

    const containerTop = textContainerRef.current.getBoundingClientRect().top;
    const activeWordTop = activeWordEl.getBoundingClientRect().top;
    const offset = activeWordTop - containerTop;

    // We want the active word's line to be centered in our word wrapper (roughly 35-45px offset)
    const transitionDuration = `${0.35 / animSpeed}s`;

    if (animMode === AnimationMode.VERTICAL) {
      return {
        transform: `translateY(${-offset + 40}px)`,
        transition: `transform ${transitionDuration} ease-out`
      };
    } else if (animMode === AnimationMode.SMOOTH) {
      return {
        transform: `translateY(${-offset + 40}px)`,
        transition: `transform ${transitionDuration} cubic-bezier(0.25, 1, 0.5, 1)`
      };
    }

    return {};
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 flex flex-col gap-8">
      {/* Test Preset Controls Panel - Screen matched */}
      <div className="w-full flex flex-wrap items-center justify-between gap-6 bg-[#090909]/40 border border-neutral-900 rounded-2xl p-4">
        {/* Row of parameters */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Time Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              Yozish vaqti
            </span>
            <div className="flex bg-neutral-950 p-1 border border-neutral-900 rounded-lg gap-1">
              {[10, 30, 60].map((t) => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    duration === t
                      ? "bg-white text-black font-extrabold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t}S
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              Qiyinlik darajasi
            </span>
            <div className="flex bg-neutral-950 p-1 border border-neutral-900 rounded-lg gap-1">
              {(Object.values(Difficulty) as string[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff as Difficulty)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all uppercase cursor-pointer ${
                    difficulty === diff
                      ? "bg-white text-black font-extrabold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {diff === "oson" ? "Oson" : diff === "o'rta" ? "O'rta" : "Qiyin"}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              Harflar rangi
            </span>
            <div className="flex bg-neutral-950 p-1 border border-neutral-900 rounded-lg gap-2 px-2.5 items-center h-8.5">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => setCharColor(opt)}
                  className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer ${
                    charColor.name === opt.name
                      ? "border-white scale-110 ring-2 ring-white/10"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: opt.hex }}
                  title={opt.name}
                />
              ))}
            </div>
          </div>

          {/* Animation Speed Slider */}
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-500" />
              Animatsiya tezligi
            </span>
            <div className="flex bg-neutral-950 px-3 py-1 border border-neutral-900 rounded-lg items-center gap-3 h-8.5">
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={animSpeed}
                onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                className="w-16 accent-white bg-neutral-800 h-1 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-neutral-300">
                {animSpeed.toFixed(2)}s
              </span>
            </div>
          </div>

          {/* Animation Mode Toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              Animatsiya
            </span>
            <div className="flex bg-neutral-950 p-1 border border-neutral-900 rounded-lg gap-1">
              <button
                onClick={() => setAnimMode(AnimationMode.NORMAL)}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer ${
                  animMode === AnimationMode.NORMAL
                    ? "bg-white text-black font-extrabold"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Normal Mode: Only caret moves"
              >
                Normal
              </button>
              <button
                onClick={() => setAnimMode(AnimationMode.VERTICAL)}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer ${
                  animMode === AnimationMode.VERTICAL
                    ? "bg-white text-black font-extrabold"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Vertical Mode: Smooth line center scroll"
              >
                Vertikal
              </button>
              <button
                onClick={() => setAnimMode(AnimationMode.SMOOTH)}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer ${
                  animMode === AnimationMode.SMOOTH
                    ? "bg-white text-black font-extrabold"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Smooth Mode: Lines slide with fading effects"
              >
                Silliq
              </button>
            </div>
          </div>
        </div>

        {/* Orqaga Back button */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Orqaga</span>
        </button>
      </div>

      {/* Main Interactive Word Container - Screen matched styling */}
      <div className="relative w-full py-12 px-6 flex flex-col justify-center bg-[#090909]/20 border border-neutral-900/50 rounded-3xl min-h-[300px]">
        {/* Timer display top-left of word frame */}
        <div className="absolute top-4 left-6 flex items-baseline gap-1 select-none">
          <span className="text-3xl font-extrabold font-mono text-white leading-none">
            {timeLeft}
          </span>
          <span className="text-xs text-neutral-500 uppercase font-mono font-semibold">
            soniya
          </span>
          {isActive && (
            <span className="ml-4 text-xs font-mono font-bold text-neutral-400">
              {lastWpm} WPM
            </span>
          )}
        </div>

        {/* Progress gauge bar at bottom of frame */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-950 overflow-hidden rounded-b-3xl select-none">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${(1 - timeLeft / duration) * 100}%` }}
          />
        </div>

        {/* Hidden HTML input that receives key presses for clean event listening */}
        <input
          ref={hiddenInputRef}
          type="text"
          value={typedKeys.join("")}
          onChange={handleInputChange}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          autoFocus
        />

        {/* Text viewport with absolute clipping for vertical animations */}
        <div
          onClick={handleContainerClick}
          className="w-full relative h-[160px] overflow-hidden cursor-text select-none text-left"
          ref={textContainerRef}
        >
          {/* Animated line sliding container */}
          <div
            className="w-full absolute flex flex-wrap gap-x-2.5 gap-y-3.5 text-2xl font-mono"
            style={getContainerStyles()}
          >
            {words.map((word, wIdx) => {
              const wordStartIdx = text.split(" ").slice(0, wIdx).join(" ").length + (wIdx > 0 ? 1 : 0);
              const isActiveWord = wIdx === activeWordIndex;

              return (
                <span
                  key={wIdx}
                  ref={(el) => {
                    wordRefs.current[wIdx] = el;
                  }}
                  className={`relative inline-flex flex-wrap transition-opacity duration-300 ${
                    animMode === AnimationMode.SMOOTH && wIdx < activeWordIndex
                      ? "opacity-30"
                      : "opacity-100"
                  }`}
                >
                  {word.split("").map((char, cIdx) => {
                    const charIdx = wordStartIdx + cIdx;
                    const isTyped = charIdx < typedKeys.length;
                    const userChar = typedKeys[charIdx];
                    const isCorrect = isTyped && userChar === char;
                    const isActiveChar = charIdx === activeCharIndex;

                    // Compute individual letter color
                    let charColorClass = "text-neutral-600"; // un-typed
                    if (isTyped) {
                      charColorClass = isCorrect ? charColor.class : "text-red-500 font-extrabold";
                    }

                    return (
                      <span
                        key={cIdx}
                        className={`transition-colors duration-150 relative ${charColorClass}`}
                      >
                        {/* Caret cursor line right before current active character */}
                        {isActiveChar && (
                          <span
                            className="absolute left-0 top-[10%] bottom-[10%] w-[2.5px] bg-white caret-animate"
                            style={{
                              transition: `left ${0.08 / animSpeed}s ease-out`
                            }}
                          />
                        )}
                        {char}
                      </span>
                    );
                  })}

                  {/* Handle word spaces cleanly */}
                  {wIdx < words.length - 1 && (() => {
                    const spaceIdx = wordStartIdx + word.length;
                    const isSpaceTyped = spaceIdx < typedKeys.length;
                    const isSpaceCorrect = isSpaceTyped && typedKeys[spaceIdx] === " ";
                    const isActiveSpace = spaceIdx === activeCharIndex;

                    return (
                      <span className="relative w-2">
                        {isActiveSpace && (
                          <span className="absolute left-0 top-[10%] bottom-[10%] w-[2.5px] bg-white caret-animate" />
                        )}
                        <span
                          className={`opacity-0 ${
                            isSpaceTyped && !isSpaceCorrect ? "bg-red-500/50 block absolute inset-0" : ""
                          }`}
                        >
                          &nbsp;
                        </span>
                      </span>
                    );
                  })()}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Restart guidance panel at the bottom - exactly matches reference */}
      <div className="flex flex-col items-center justify-center gap-3 select-none">
        <div className="flex items-center gap-2">
          {/* Circular Restart Button */}
          <button
            onClick={initTest}
            className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:scale-105 transition-all cursor-pointer shadow-md"
            title="Qayta boshlash"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tab + Enter text shortcut display */}
        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-900 rounded-md px-2.5 py-1">
          <kbd className="text-[10px] font-mono font-bold text-neutral-500">Tab</kbd>
          <span className="text-[10px] text-neutral-700 font-bold">+</span>
          <kbd className="text-[10px] font-mono font-bold text-neutral-500">Enter</kbd>
          <span className="text-[10px] font-medium text-neutral-600 ml-1.5">yangi test boshlash</span>
        </div>
      </div>
    </div>
  );
};
