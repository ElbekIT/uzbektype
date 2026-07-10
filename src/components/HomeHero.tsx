import React from "react";
import { Play } from "lucide-react";

interface HomeHeroProps {
  onStartTest: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartTest }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-start py-12 md:py-24 max-w-2xl">
      {/* Small Eyebrow Label */}
      <span className="text-sm font-semibold text-neutral-400 tracking-wide uppercase mb-3">
        Sekin yozish ish va o'qishda vaqtni yeb qo'yadi
      </span>

      {/* Main Large Display Title */}
      <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
        Yozish Tezligingizni <br />
        <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          Sinab Ko'ring
        </span>
      </h1>

      {/* Description */}
      <p className="text-base text-neutral-400 leading-relaxed max-w-lg mb-10">
        Uzbektype yordamida klaviaturadagi tezligingizni aniqlang va uni
        oshirishni bugunoq boshlang. Professional darajadagi tahlillar va xatolarni tuzatish tizimi.
      </p>

      {/* CTA Button */}
      <button
        onClick={onStartTest}
        className="group relative flex items-center gap-2.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-sm px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 duration-150 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-black text-black transition-transform group-hover:scale-110" />
        <span>Boshlash</span>
      </button>
    </div>
  );
};
