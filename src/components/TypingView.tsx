import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserSettings, TestResult } from '../types';
import { UZ_WORDS, EN_WORDS } from '../data';
import { playKeySound, playRecordSound } from '../utils/audio';
import { RotateCcw, Volume2, Keyboard as KeyboardIcon, Clock, Award, ShieldAlert, Sparkles, Languages } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TypingViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  setCurrentView: (view: string) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in seconds
  setLastResult: (result: TestResult & { wpmHistory: number[] }) => void;
}

export default function TypingView({
  currentUser,
  settings,
  setSettings,
  setCurrentView,
  difficulty,
  duration,
  setLastResult,
}: TypingViewProps) {
  // Test Options
  const [lang, setLang] = useState<'uz' | 'en'>(settings.language);
  const [timeLimit, setTimeLimit] = useState<number>(duration);
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard'>(difficulty);

  // Engine States
  const [words, setWords] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [charIndex, setCharIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string[]>([]); // Suffix representation of user inputs
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [activeKey, setActiveKey] = useState<string>("");

  // Statistics tracker
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [rawWpmHistory, setRawWpmHistory] = useState<number[]>([]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Keyboard representation
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'o‘'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'g‘'],
    ['space']
  ];

  // Uzbek special character replacements for typing ease
  const normalizeChar = (expected: string, input: string): boolean => {
    if (expected === input) return true;
    // Handle apostrophes for o‘ and g‘
    if ((expected === 'o‘' || expected === 'o\'') && (input === 'o' || input === '‘' || input === "'")) return true;
    if ((expected === 'g‘' || expected === 'g\'') && (input === 'g' || input === '‘' || input === "'")) return true;
    return false;
  };

  // Generate words list
  const generateWords = () => {
    const list = lang === 'uz' ? UZ_WORDS : EN_WORDS;
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    
    // Filter words by difficulty
    let filtered = shuffled;
    if (diff === 'easy') {
      filtered = shuffled.filter(w => w.length <= 5);
    } else if (diff === 'hard') {
      filtered = shuffled.filter(w => w.length >= 6);
    }

    // Ensure we have enough words (repeat to fill space)
    let finalWords: string[] = [];
    while (finalWords.length < 150) {
      finalWords = [...finalWords, ...filtered.sort(() => 0.5 - Math.random())];
    }
    
    setWords(finalWords.slice(0, 100));
    setInputVal("");
    setCharIndex(0);
    setCorrectCount(0);
    setErrorCount(0);
    setTypedChars([]);
    setIsTestRunning(false);
    setTimeLeft(timeLimit);
    setWpmHistory([]);
    setRawWpmHistory([]);
    
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Re-generate when parameters change
  useEffect(() => {
    generateWords();
  }, [lang, timeLimit, diff]);

  // Handle countdown timer
  useEffect(() => {
    if (isTestRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTestFinish();
            return 0;
          }

          // Calculate real-time stats for the graph
          const elapsed = timeLimit - (prev - 1);
          if (elapsed > 0) {
            // Net WPM = (correct chars / 5) / (elapsed min)
            const netWPM = Math.round((correctCount / 5) / (elapsed / 60)) || 0;
            // Raw WPM = (all chars / 5) / (elapsed min)
            const rawWPM = Math.round((typedChars.length / 5) / (elapsed / 60)) || 0;
            
            setWpmHistory((prevHistory) => [...prevHistory, netWPM]);
            setRawWpmHistory((prevRaw) => [...prevRaw, rawWPM]);
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestRunning, correctCount, typedChars]);

  // Start test on first key press
  const startTest = () => {
    setIsTestRunning(true);
    setTimeLeft(timeLimit);
  };

  // Finish test
  const handleTestFinish = () => {
    setIsTestRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Final statistics
    const durationMin = timeLimit / 60;
    const totalTyped = typedChars.length;
    const rawWpm = Math.round((totalTyped / 5) / durationMin) || 0;
    const finalWpm = Math.round((correctCount / 5) / durationMin) || 0;
    const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 1000) / 10 : 0;

    // Consistency formula based on standard WPM history deviation
    let consistency = 88; // Default
    if (wpmHistory.length > 1) {
      const average = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
      const squareDiffs = wpmHistory.map(w => Math.pow(w - average, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      consistency = Math.max(50, Math.min(100, Math.round(100 - stdDev * 2.5)));
    }

    // Check if new record
    const isNewRecord = finalWpm > (currentUser.bestWPM || 0);

    const resultId = `res-${Date.now()}`;
    const finalResult: TestResult & { wpmHistory: number[] } = {
      id: resultId,
      userId: currentUser.uid,
      username: currentUser.username,
      avatar: currentUser.avatar,
      wpm: finalWpm,
      rawWpm: rawWpm,
      accuracy: accuracy,
      consistency: consistency,
      errors: errorCount,
      characters: totalTyped,
      difficulty: diff,
      duration: timeLimit,
      language: lang,
      createdAt: new Date().toISOString(),
      wpmHistory: wpmHistory.length > 0 ? wpmHistory : [finalWpm],
    };

    if (isNewRecord && currentUser.uid !== 'guest_user') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      playRecordSound();
    }

    setLastResult(finalResult);
    setCurrentView('result');
  };

  // Keyboard hooks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toLowerCase();
    
    // Play Click Sound
    playKeySound(settings.typingSound);

    // Active key lighting
    if (key === ' ') {
      setActiveKey('space');
    } else {
      setActiveKey(key);
    }

    // Allow Tab key to restart test
    if (e.key === 'Tab') {
      e.preventDefault();
      generateWords();
      return;
    }

    // Start timer on first keypress
    if (!isTestRunning && timeLeft === timeLimit && e.key !== 'Escape') {
      startTest();
    }
  };

  const handleKeyUp = () => {
    setActiveKey("");
  };

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    const fullExpectedString = words.join(" ");
    const currentExpectedChar = fullExpectedString[charIndex];

    // If backspaced
    if (val.length < inputVal.length) {
      if (charIndex > 0) {
        const newCharIdx = charIndex - 1;
        setCharIndex(newCharIdx);
        // Pop last keypress record
        const popped = typedChars[typedChars.length - 1];
        setTypedChars(prev => prev.slice(0, -1));
        
        // If it was correct, decrement correctCount
        if (normalizeChar(fullExpectedString[newCharIdx], popped)) {
          setCorrectCount(prev => Math.max(0, prev - 1));
        }
      }
      return;
    }

    // Character added
    const typedInputChar = val[val.length - 1];
    setTypedChars(prev => [...prev, typedInputChar]);

    if (normalizeChar(currentExpectedChar, typedInputChar)) {
      setCorrectCount(prev => prev + 1);
    } else {
      setErrorCount(prev => prev + 1);
    }

    setCharIndex(charIndex + 1);

    // Auto-scroll the typing view if cursor gets deep
    if (wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const activeLetter = container.querySelector('#active-char');
      if (activeLetter) {
        const rect = activeLetter.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // If caret is past middle height, scroll it up
        if (rect.top - containerRect.top > 80) {
          container.scrollTop += (rect.top - containerRect.top - 50);
        }
      }
    }

    // Check if test completed early by typing all characters
    if (charIndex >= fullExpectedString.length - 1) {
      handleTestFinish();
    }
  };

  // Focus typing area automatically
  const focusTyping = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  useEffect(() => {
    focusTyping();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        generateWords();
        focusTyping();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        generateWords();
        focusTyping();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [timeLimit, diff, lang]);

  // String formatting helpers
  const fullText = words.join(" ");

  // Localized UI labels
  const isUz = settings.language === 'uz';
  const t = {
    restart: isUz ? "Qayta tushirish" : "Restart Test",
    volume: isUz ? "Klaviatura ovozi" : "Typing Sound",
    keyboardGuide: isUz ? "Klaviatura yordamchisi" : "Virtual Keyboard",
    shortcutMsg: isUz ? "Qayta boshlash uchun istalgan payt Tab tugmasini bosing" : "Tip: Press Tab at any time to instantly restart",
    sec: isUz ? "soniya" : "seconds",
    characters: isUz ? "belgilar" : "characters",
    errors: isUz ? "xatolar" : "errors",
    accuracy: isUz ? "aniqlik" : "accuracy",
    selectLang: isUz ? "Til" : "Language",
    selectTime: isUz ? "Vaqt (sek)" : "Time (sec)",
    selectDiff: isUz ? "Qiyinchilik" : "Difficulty",
  };

  return (
    <div 
      className="max-w-5xl mx-auto px-4 py-8 md:py-12 text-white flex flex-col justify-between min-h-[calc(100vh-100px)]"
      onClick={focusTyping}
    >
      {/* Top Test Configuration Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 mb-8">
        
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-mono text-gray-500">{t.selectLang}:</span>
          <div className="flex bg-black/40 p-1 rounded-md border border-white/5">
            <button
              onClick={(e) => { e.stopPropagation(); setLang('uz'); }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                lang === 'uz' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              UZB
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLang('en'); }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                lang === 'en' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              ENG
            </button>
          </div>
        </div>

        {/* Time Limit Selection */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-mono text-gray-500">{t.selectTime}:</span>
          <div className="flex bg-black/40 p-1 rounded-md border border-white/5">
            {[15, 30, 60].map(seconds => (
              <button
                key={seconds}
                onClick={(e) => { e.stopPropagation(); setTimeLimit(seconds); }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                  timeLimit === seconds ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-mono text-gray-500">{t.selectDiff}:</span>
          <div className="flex bg-black/40 p-1 rounded-md border border-white/5">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={(e) => { e.stopPropagation(); setDiff(d); }}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  diff === d ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {d === 'easy' ? 'Oson' : d === 'medium' ? 'O\'rtacha' : 'Qiyin'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Click sound toggle */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-mono text-gray-500">{t.volume}:</span>
          <select
            value={settings.typingSound}
            onChange={(e) => { e.stopPropagation(); setSettings({ ...settings, typingSound: e.target.value as any }); }}
            className="bg-black/40 text-gray-300 border border-white/10 hover:border-white/20 rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="none">O'chirilgan</option>
            <option value="click">Soft Click</option>
            <option value="beep">Retro Beep</option>
            <option value="mechanical">Mechanical</option>
          </select>
        </div>

      </div>

      {/* Main typing Engine */}
      <div className="flex-1 flex flex-col justify-center relative">
        
        {/* Hidden inputs to capture typing */}
        <input
          ref={hiddenInputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="absolute opacity-0 pointer-events-none"
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
        />

        {/* Active live statistics overlay */}
        <div className="flex items-center gap-8 mb-6 font-mono">
          <div className="text-5xl font-bold text-yellow-500">
            {timeLeft}
            <span className="text-xs text-gray-500 ml-1">S</span>
          </div>
          
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 block uppercase tracking-wider">Net WPM</span>
            <span className="text-2xl font-semibold text-white">
              {Math.round((correctCount / 5) / ((timeLimit - timeLeft + 0.1) / 60)) || 0}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 block uppercase tracking-wider">Aniqlik</span>
            <span className="text-2xl font-semibold text-white">
              {typedChars.length > 0 ? Math.round((correctCount / typedChars.length) * 100) : 100}%
            </span>
          </div>
          
          <div className="space-y-0.5 hidden xs:block">
            <span className="text-xs text-gray-500 block uppercase tracking-wider">Xatolik</span>
            <span className="text-2xl font-semibold text-red-500">{errorCount}</span>
          </div>
        </div>

        {/* Word Board container */}
        <div 
          ref={wordsContainerRef}
          className="relative text-2xl md:text-3xl font-sans tracking-wide leading-relaxed h-[150px] overflow-hidden select-none cursor-pointer p-4 rounded-2xl bg-black/30 border border-white/5 scroll-smooth"
        >
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {words.map((word, wordIdx) => {
              // Calculate index ranges of this word in full string
              const prefixLength = words.slice(0, wordIdx).join(" ").length + (wordIdx > 0 ? 1 : 0);
              const isActiveWord = charIndex >= prefixLength && charIndex < prefixLength + word.length + 1;

              return (
                <div 
                  key={wordIdx} 
                  className={`relative py-1 rounded-md transition-all duration-150 ${
                    isActiveWord ? 'bg-white/5 px-2 -mx-2 border-b-2 border-yellow-500/50' : ''
                  }`}
                >
                  {word.split("").map((letter, letterIdx) => {
                    const currentLetterAbsIdx = prefixLength + letterIdx;
                    const isTyped = currentLetterAbsIdx < charIndex;
                    const isCorrect = isTyped && normalizeChar(letter, typedChars[currentLetterAbsIdx]);
                    
                    let letterClass = "text-gray-600"; // Untyped default
                    if (isTyped) {
                      letterClass = isCorrect ? "text-white font-medium" : "text-red-500 underline decoration-red-600 underline-offset-4";
                    }

                    // Caret highlighter
                    const isCaretHere = currentLetterAbsIdx === charIndex;

                    return (
                      <span 
                        key={letterIdx} 
                        id={isCaretHere ? 'active-char' : undefined}
                        className={`relative ${letterClass}`}
                      >
                        {letter}
                        {isCaretHere && (
                          <span className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-[2.5px] h-[85%] bg-yellow-500 animate-[pulse_1s_infinite]"></span>
                        )}
                      </span>
                    );
                  })}
                  {/* Handle space caret */}
                  {charIndex === prefixLength + word.length && isActiveWord && (
                    <span id="active-char" className="relative text-transparent">
                      _
                      <span className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-[2.5px] h-[85%] bg-yellow-500 animate-[pulse_1s_infinite]"></span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <button
            id="typing_restart_btn"
            onClick={(e) => { e.stopPropagation(); generateWords(); focusTyping(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/10 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-yellow-500" />
            <span>{t.restart}</span>
          </button>
          
          <span className="text-xs font-mono text-gray-500 hidden sm:inline">
            {t.shortcutMsg}
          </span>
        </div>

      </div>

      {/* Bottom Virtual Keyboard Guide */}
      {settings.showKeyboard && (
        <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/5 max-w-4xl mx-auto w-full hidden md:block">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-mono text-gray-500">
            <KeyboardIcon className="w-4 h-4 text-yellow-500" />
            <span>{t.keyboardGuide}</span>
          </div>

          <div className="space-y-1.5">
            {keyboardRows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1.5">
                {row.map((key) => {
                  const isPressed = activeKey === key || (key === 'space' && activeKey === ' ');
                  return (
                    <div
                      key={key}
                      className={`h-9 rounded flex items-center justify-center font-mono text-xs uppercase tracking-wider border transition-all ${
                        key === 'space' ? 'w-64' : 'w-9'
                      } ${
                        isPressed 
                          ? 'bg-yellow-500 text-black font-extrabold border-yellow-400 scale-95 shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                          : 'bg-black/40 text-gray-400 border-white/5'
                      }`}
                    >
                      {key === 'space' ? 'SPACE' : key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
