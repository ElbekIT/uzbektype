import React from 'react';
import { UserProfile, UserSettings } from '../types';
import { Globe, Palette, Heart, LogIn, LogOut, ShieldAlert, Award, User, LayoutDashboard, Keyboard } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentUser: UserProfile;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  settings,
  setSettings,
  currentView,
  setCurrentView,
  onLogin,
  onLogout,
}: NavbarProps) {
  
  const cycleTheme = () => {
    const themes: UserSettings['theme'][] = ['carbon', 'cyberpunk', 'serene', 'lavender'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setSettings({ ...settings, theme: themes[nextIndex] });
  };

  const toggleLanguage = () => {
    setSettings({ ...settings, language: settings.language === 'uz' ? 'en' : 'uz' });
  };

  // Translations
  const t = {
    reyting: settings.language === 'uz' ? 'Reyting' : 'Leaderboard',
    asosiy: settings.language === 'uz' ? 'Asosiy' : 'Main Test',
    bloglar: settings.language === 'uz' ? 'Bloglar' : 'Blogs',
    donat: settings.language === 'uz' ? 'Donat qilish' : 'Donate',
    dashboard: settings.language === 'uz' ? 'Dashboard' : 'Dashboard',
    admin: settings.language === 'uz' ? 'Admin' : 'Admin Panel',
    login: settings.language === 'uz' ? 'Google bilan kirish' : 'Login with Google',
    logout: settings.language === 'uz' ? 'Chiqish' : 'Logout',
    profile: settings.language === 'uz' ? 'Profil' : 'Profile',
  };

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 cursor-pointer group"
          id="nav_logo"
        >
          <Keyboard className="w-8 h-8 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-sans font-bold text-2xl tracking-wider text-white">
            uzbek<span className="text-yellow-500 font-mono">type</span>
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto max-w-full pb-1 md:pb-0">
          <button
            id="nav_asosiy"
            onClick={() => setCurrentView('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === 'home' || currentView === 'typing' || currentView === 'result'
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.asosiy}
          </button>
          
          <button
            id="nav_leaderboard"
            onClick={() => setCurrentView('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === 'leaderboard'
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.reyting}
          </button>

          <button
            id="nav_blogs"
            onClick={() => setCurrentView('blog')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === 'blog'
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.bloglar}
          </button>

          {currentUser.uid !== 'guest_user' && (
            <button
              id="nav_dashboard"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                {t.dashboard}
              </span>
            </button>
          )}

          {currentUser.isAdmin && (
            <button
              id="nav_admin"
              onClick={() => setCurrentView('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'admin'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'text-red-400 hover:text-white hover:bg-red-500/20'
              }`}
            >
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                {t.admin}
              </span>
            </button>
          )}
        </div>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-3">
          {/* Support/Donate Button */}
          <button
            id="nav_donate"
            onClick={() => alert(settings.language === 'uz' ? "Katta rahmat! Donat qilish imkoniyati tez orada ulanadi (Click/Payme/Stripe)." : "Thank you! Donation integration is coming soon.")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/25 text-pink-500 text-sm font-medium transition-all border border-pink-500/25 active:scale-95"
          >
            <Heart className="w-4 h-4 fill-pink-500" />
            <span>{t.donat}</span>
          </button>

          {/* Theme switcher */}
          <button
            id="nav_theme"
            onClick={cycleTheme}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            title="Sichqonchani bosing va temani o'zgartiring"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <button
            id="nav_lang"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-mono transition-all active:scale-90"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{settings.language.toUpperCase()}</span>
          </button>

          {/* Auth State */}
          {currentUser.uid === 'guest_user' ? (
            <button
              id="nav_login"
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xs:inline">{t.login}</span>
            </button>
          ) : (
            <div className="relative" id="nav_profile_dropdown_wrapper">
              <div 
                id="nav_profile_btn"
                onClick={() => {
                  const el = document.getElementById('nav_dropdown_menu');
                  if (el) {
                    el.classList.toggle('hidden');
                  }
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all active:scale-95 select-none"
              >
                <span className="text-lg">{currentUser.avatar}</span>
                <span className="text-sm font-medium text-white max-w-[80px] truncate">{currentUser.username}</span>
                <span className="text-[10px] text-gray-500">▼</span>
              </div>
              
              {/* Dropdown Menu */}
              <div 
                id="nav_dropdown_menu"
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#141414] border border-white/10 py-1.5 shadow-2xl z-50 hidden"
              >
                <button
                  id="nav_dropdown_profile"
                  onClick={() => {
                    setCurrentView('profile');
                    document.getElementById('nav_dropdown_menu')?.classList.add('hidden');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all"
                >
                  <User className="w-4 h-4 text-yellow-500" />
                  <span>{settings.language === 'uz' ? 'Profil' : 'Profile'}</span>
                </button>

                <button
                  id="nav_dropdown_stats"
                  onClick={() => {
                    setCurrentView('dashboard');
                    document.getElementById('nav_dropdown_menu')?.classList.add('hidden');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                  <span>{settings.language === 'uz' ? 'Statistika' : 'Statistics'}</span>
                </button>

                <button
                  id="nav_dropdown_leaderboard"
                  onClick={() => {
                    setCurrentView('leaderboard');
                    document.getElementById('nav_dropdown_menu')?.classList.add('hidden');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>{settings.language === 'uz' ? 'Reyting' : 'Leaderboard'}</span>
                </button>

                <div className="border-t border-white/5 my-1"></div>

                <button
                  id="nav_dropdown_logout"
                  onClick={() => {
                    onLogout();
                    document.getElementById('nav_dropdown_menu')?.classList.add('hidden');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{settings.language === 'uz' ? 'Chiqish' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
