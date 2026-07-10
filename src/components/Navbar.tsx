import React, { useState } from "react";
import { Sun, Moon, LogIn, LogOut, User, BarChart2, Heart, Play } from "lucide-react";
import { UserProfile } from "../types";
import { PixelAvatar } from "./PixelAvatar";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: "home" | "test" | "profile" | "my-results" | "leaderboard" | "blog") => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onLogin,
  onLogout,
  theme,
  onToggleTheme
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getLinkClass = (view: string) => {
    const isActive = currentView === view;
    return `text-sm font-medium transition-colors hover:text-white ${
      isActive ? "text-white" : "text-neutral-400"
    } cursor-pointer`;
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-900/50 bg-transparent">
      {/* Brand Logo */}
      <div 
        onClick={() => onNavigate("home")} 
        className="text-xl font-bold tracking-tight text-white cursor-pointer select-none flex items-center gap-1 hover:opacity-90"
      >
        uzbektype
      </div>

      {/* Navigation and Actions */}
      <div className="flex items-center gap-6">
        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <div onClick={() => onNavigate("leaderboard")} className={getLinkClass("leaderboard")}>
            🏆 Reyting
          </div>
          <div onClick={() => onNavigate("home")} className={getLinkClass("home")}>
            Asosiy
          </div>
          <div onClick={() => onNavigate("blog")} className={getLinkClass("blog")}>
            Bloglar
          </div>
        </nav>

        {/* Support / Donate button */}
        <button 
          onClick={() => alert("Uzbektype loyihasini qo'llab-quvvatlaganingiz uchun rahmat! Ushbu funksiya tez orada ishga tushadi.")}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>Donat qilish</span>
        </button>

        {/* Theme Toggler */}
        <button 
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Language Flag Selector */}
        <div className="flex items-center gap-1 text-sm bg-neutral-900/60 border border-neutral-800 px-2.5 py-1 rounded-md select-none">
          <span className="text-xs">🇺🇿</span>
          <span className="text-xs font-semibold text-neutral-300">UZ</span>
        </div>

        {/* CTA Boshlash Button */}
        {currentView !== "test" && (
          <button 
            onClick={() => onNavigate("test")}
            className="hidden sm:flex items-center gap-1.5 bg-white text-black hover:bg-neutral-200 font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-black" />
            <span>Boshlash</span>
          </button>
        )}

        {/* Authentication Section */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <PixelAvatar avatarId={user.avatar} size={20} className="border-0 bg-transparent rounded-sm" />
              <span>{user.firstName} {user.lastName.substring(0, 1)}.</span>
              <span className="text-[10px] text-neutral-500">▼</span>
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-[#121212] py-2 shadow-2xl z-20">
                  <div className="px-4 py-2 border-b border-neutral-900">
                    <p className="text-xs font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profilni sozlash</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate("my-results");
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Mening natijalarim</span>
                  </button>

                  <div className="h-px bg-neutral-900 my-1" />

                  <button
                    onClick={() => {
                      onLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-neutral-900 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-200 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            {/* Custom Google Icon */}
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
            <span>Kirish</span>
          </button>
        )}
      </div>
    </header>
  );
};
