import React, { useState } from 'react';
import { UserProfile, UserSettings, BlogArticle } from '../types';
import { getBlogs, updateBlog } from '../utils/storage';
import { BookOpen, Search, Heart, Eye, ArrowRight, X, Clock, User, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
}

// Lightweight regex markdown parser for ultra-fast zero-latency rendering
function parseMarkdownToReact(markdown: string): React.ReactNode[] {
  const lines = markdown.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return <h1 key={idx} className="text-2xl md:text-3xl font-extrabold text-white mt-6 mb-4 font-sans tracking-tight border-b border-white/5 pb-2">{trimmed.slice(2)}</h1>;
    }
    if (trimmed.startsWith('## ')) {
      return <h2 key={idx} className="text-xl md:text-2xl font-bold text-yellow-500 mt-5 mb-3 font-sans tracking-tight">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={idx} className="text-lg md:text-xl font-bold text-white mt-4 mb-2 font-sans">{trimmed.slice(4)}</h3>;
    }
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <li 
          key={idx} 
          className="text-gray-300 ml-6 list-disc mb-1.5 text-sm md:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    if (trimmed === '') {
      return <div key={idx} className="h-3"></div>;
    }

    // Bold replacement
    let processedLine = trimmed
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\`(.*?)\`/g, '<code class="bg-black/50 text-yellow-500 font-mono text-xs px-1.5 py-0.5 rounded border border-white/5">$1</code>');

    return (
      <p 
        key={idx} 
        className="text-gray-300 text-sm md:text-base leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: processedLine }}
      />
    );
  });
}

export default function BlogView({
  currentUser,
  settings,
}: BlogViewProps) {
  const [blogs, setBlogs] = useState<BlogArticle[]>(getBlogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [activeBlog, setActiveBlog] = useState<BlogArticle | null>(null);

  const categories = ['Barchasi', 'Tavsiyalar', 'Klaviatura', 'Texnologiya'];

  const handleLike = (e: React.MouseEvent, blog: BlogArticle) => {
    e.stopPropagation();
    const updated = {
      ...blog,
      likesCount: blog.likesCount + 1,
    };
    updateBlog(updated);
    setBlogs(getBlogs());
    if (activeBlog && activeBlog.id === blog.id) {
      setActiveBlog(updated);
    }
  };

  const handleOpenBlog = (blog: BlogArticle) => {
    const updated = {
      ...blog,
      viewsCount: blog.viewsCount + 1,
    };
    updateBlog(updated);
    setBlogs(getBlogs());
    setActiveBlog(updated);
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Barchasi' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isUz = settings.language === 'uz';
  const t = {
    title: isUz ? "Klaviatura Blogi" : "Typing Blog & Articles",
    subtitle: isUz ? "Professional yozuvchilar va ekspertlardan typing sirlari hamda tahlillar" : "Master tips, analytical reviews, and typing hacks from keyboard experts",
    searchPlaceholder: isUz ? "Maqolalarni qidirish..." : "Search articles...",
    views: isUz ? "ko'rishlar" : "views",
    likes: isUz ? "layklar" : "likes",
    readTime: isUz ? "o'qish" : "read",
    readMore: isUz ? "Batafsil o'qish" : "Read Full Article",
    shareAlert: isUz ? "Maqola havolasi nusxalandi!" : "Article link copied to clipboard!"
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white relative">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-sans font-extrabold text-3xl md:text-4xl tracking-tight text-white flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-yellow-500" />
          <span>{t.title}</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-normal max-w-xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 mb-8">
        
        {/* Categories row */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5 overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat 
                  ? 'bg-yellow-500 text-black font-bold shadow' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'Barchasi' && !isUz ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-black/40 text-gray-200 placeholder-gray-500 border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl pl-9.5 pr-4 py-2 text-sm outline-none transition-all"
          />
        </div>

      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div 
              key={blog.id}
              onClick={() => handleOpenBlog(blog)}
              className="group rounded-2xl bg-[#141414] border border-white/10 overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="h-44 w-full overflow-hidden relative border-b border-white/5 bg-black/40">
                  <img 
                    src={blog.coverUrl} 
                    alt={blog.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                  />
                  <span className="absolute top-3 left-3 bg-black/75 border border-white/10 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider text-yellow-500 uppercase">
                    {blog.category}
                  </span>
                </div>

                {/* Info Block */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readingTime}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-base text-white group-hover:text-yellow-500 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>
                  
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer with counts */}
              <div className="p-5 pt-0 border-t border-transparent flex items-center justify-between text-xs font-mono text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {blog.viewsCount}
                  </span>
                  
                  {/* Like Button */}
                  <button 
                    onClick={(e) => handleLike(e, blog)}
                    className="flex items-center gap-1 hover:text-pink-500 transition-colors cursor-pointer group/like"
                  >
                    <Heart className="w-3.5 h-3.5 group-hover/like:fill-pink-500" />
                    {blog.likesCount}
                  </button>
                </div>

                <span className="text-yellow-500 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center text-gray-500 font-mono text-sm border border-dashed border-white/10 rounded-2xl">
            Maqolalar topilmadi. Boshqa qidiruv so'zini sinab ko'ring.
          </div>
        )}
      </div>

      {/* Full Article Reading Overlay Modal */}
      <AnimatePresence>
        {activeBlog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-white/10 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col justify-between"
            >
              {/* Modal header with Image */}
              <div className="h-48 md:h-64 w-full relative">
                <img 
                  src={activeBlog.coverUrl} 
                  alt={activeBlog.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60" 
                />
                
                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>

                <button 
                  onClick={() => setActiveBlog(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-gray-400 hover:text-white transition-all border border-white/10 cursor-pointer active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Absolute Title Block */}
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="bg-yellow-500 text-black font-extrabold text-[10px] uppercase font-mono px-2 py-0.5 rounded tracking-wider mb-2 inline-block">
                    {activeBlog.category}
                  </span>
                  <h2 className="text-lg md:text-2xl font-black text-white leading-tight">
                    {activeBlog.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-gray-500 border-b border-white/5 pb-4 mb-6">
                  <span className="flex items-center gap-1 text-gray-400">
                    <User className="w-3.5 h-3.5 text-yellow-500" />
                    Muallif: {activeBlog.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeBlog.readingTime}
                  </span>
                  <span>Sana: {activeBlog.date}</span>
                </div>

                {/* Markdown Parsed Output */}
                <div className="space-y-4">
                  {parseMarkdownToReact(activeBlog.content)}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {activeBlog.viewsCount} {t.views}
                  </span>
                  
                  <button 
                    onClick={(e) => handleLike(e, activeBlog)}
                    className="flex items-center gap-1.5 hover:text-pink-500 transition-colors text-pink-500/80 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-pink-500/10" />
                    {activeBlog.likesCount} {t.likes}
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert(t.shareAlert);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Ulashish</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
