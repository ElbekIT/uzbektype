import React from "react";
import { BookOpen, Calendar, Clock, ArrowRight, ChevronRight } from "lucide-react";

interface BlogPost {
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  category: string;
}

const ARTICLES: BlogPost[] = [
  {
    title: "Klaviatura tezligini oshirishning 5 ta oltin qoidasi",
    excerpt: "Ko'pchilik tez yozish deganda shunchaki barmoqlarni tez qimirlatishni tushunadi. Lekin haqiqiy tezlik to'g'ri joylashuv va ritmga bog'liq.",
    readTime: "4 daqiqa",
    date: "10 Jul 2026",
    category: "Metodika"
  },
  {
    title: "Sensor klaviatura va Mexanik klaviatura farqlari",
    excerpt: "Yozish paytidagi taktil aloqa yozish tezligiga 15% gacha ta'sir ko'rsatishi mumkin. Mexanik klaviaturalar nega mashhur?",
    readTime: "5 daqiqa",
    date: "08 Jul 2026",
    category: "Texnika"
  },
  {
    title: "Ko'r-ko'rona yozish (Touch Typing) uslubini o'rganish bo'yicha qo'llanma",
    excerpt: "Klaviatura tugmalariga qaramasdan yozishni o'rganish ishdagi samaradorlikni 2 barobarga oshiradi. Boshlang'ich qadamlar va mashqlar rejasi.",
    readTime: "6 daqiqa",
    date: "05 Jul 2026",
    category: "Qo'llanma"
  }
];

export const BlogView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 flex flex-col gap-8">
      
      {/* Title */}
      <div className="text-left border-b border-neutral-900 pb-5 select-none">
        <h1 className="font-display text-4xl font-extrabold text-white">Foydali maqolalar</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Klaviatura yozish ko'nikmalarini oshirish, raqamli savodxonlik va samaradorlik haqida foydali maqolalar toplami
        </p>
      </div>

      {/* Articles list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ARTICLES.map((article, idx) => (
          <div
            key={idx}
            className="group bg-[#0e0e0e]/80 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              {/* Category */}
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                {article.category}
              </span>
              {/* Heading */}
              <h3 className="text-sm font-extrabold text-white leading-snug group-hover:text-neutral-200 transition-colors">
                {article.title}
              </h3>
              {/* Excerpt */}
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                {article.excerpt}
              </p>
            </div>

            {/* Meta and Link */}
            <div className="flex items-center justify-between border-t border-neutral-900/80 pt-4 mt-5">
              <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>
              
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
