import React, { useState } from 'react';
import { UserProfile, UserSettings, Achievement } from '../types';
import { saveCurrentUser, getUnlockedAchievements, getTestResults } from '../utils/storage';
import { User, Mail, Globe, Save, Award, RefreshCw, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
  setCurrentUser: (user: UserProfile) => void;
}

export default function ProfileView({
  currentUser,
  settings,
  setCurrentUser,
}: ProfileViewProps) {
  const [username, setUsername] = useState(currentUser.username);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState(currentUser.country);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [saved, setSaved] = useState(false);

  const results = getTestResults();
  const achievements = getUnlockedAchievements(currentUser, results);

  const avatarList = [
    '👨‍💻', '🤖', '🦊', '💻', '🌸', '⚡', '🏎️', '🍏', 
    '✨', '🚀', '👾', '🛡️', '🦁', '🐯', '🐼', '🐨', 
    '🧙‍♂️', '🧚‍♀️', '🦄', '🦅', '🦉', '🌋', '🌊', '⭐'
  ];

  const handleRandomizeAvatar = () => {
    const randomIdx = Math.floor(Math.random() * avatarList.length);
    setSelectedAvatar(avatarList[randomIdx]);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') return;

    const updatedUser: UserProfile = {
      ...currentUser,
      username: username,
      country: country,
      avatar: selectedAvatar,
    };

    saveCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isUz = settings.language === 'uz';
  const t = {
    title: isUz ? "Shaxsiy Profil" : "User Profile",
    avatarLabel: isUz ? "Avatarni tanlang" : "Choose Avatar",
    randomBtn: isUz ? "Tasodifiy avatar" : "Randomize avatar",
    usernameLabel: isUz ? "Foydalanuvchi nomi" : "Username",
    emailLabel: isUz ? "E-pochta manzili" : "Email Address",
    firstNameLabel: isUz ? "Ism" : "First Name",
    lastNameLabel: isUz ? "Familiya" : "Last Name",
    countryLabel: isUz ? "Mamlakat (Kodi)" : "Country Code",
    saveBtn: isUz ? "Saqlash" : "Save Changes",
    savedMsg: isUz ? "Profil muvaffaqiyatli saqlandi!" : "Profile saved successfully!",
    achievementsTitle: isUz ? "Muvaffaqiyatlar va Nishonlar" : "Achievements & Badges",
    achievementsSub: isUz ? "O'yin davomida ochilgan maxsus mukofotlar ro'yxati" : "Milestones unlocked during your typing journey",
    unlocked: isUz ? "Ochilgan" : "Unlocked",
    locked: isUz ? "Yopiq" : "Locked",
    guestWarning: isUz 
      ? "Siz mehmon rejimidan foydalanyapsiz. Profilni tahrirlash uchun tizimga kiring." 
      : "You are using a guest account. Sign in to edit your profile.",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      
      {/* Title */}
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <User className="w-8 h-8 text-yellow-500" />
        <h1 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight text-white">{t.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Edit Profile fields */}
        <div className="lg:col-span-2 space-y-6">
          <form 
            onSubmit={handleSaveProfile}
            className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-6 shadow-xl"
          >
            {currentUser.uid === 'guest_user' && (
              <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 text-xs font-mono">
                {t.guestWarning}
              </div>
            )}

            {saved && (
              <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-500 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{t.savedMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Username field */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{t.usernameLabel}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="text"
                    disabled={currentUser.uid === 'guest_user'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 text-gray-200 border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-black/40 text-gray-500 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{t.firstNameLabel}</label>
                <input
                  type="text"
                  disabled={currentUser.uid === 'guest_user'}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="E.g., Jasur"
                  className="w-full bg-black/40 text-gray-200 border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{t.lastNameLabel}</label>
                <input
                  type="text"
                  disabled={currentUser.uid === 'guest_user'}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="E.g., Karimov"
                  className="w-full bg-black/40 text-gray-200 border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Country Code */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{t.countryLabel}</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="text"
                    disabled={currentUser.uid === 'guest_user'}
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase())}
                    maxLength={3}
                    placeholder="E.g., UZ"
                    className="w-full bg-black/40 text-gray-200 border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

            </div>

            {/* Save Button */}
            {currentUser.uid !== 'guest_user' && (
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveBtn}</span>
              </button>
            )}

          </form>

          {/* Achievements Block */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="font-sans font-bold text-lg text-white">{t.achievementsTitle}</h3>
                <p className="text-xs text-gray-500 font-normal">{t.achievementsSub}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => {
                const isUnlocked = !!ach.unlockedAt;
                return (
                  <div 
                    key={ach.id} 
                    className={`p-3.5 rounded-xl border flex gap-3 items-start transition-all ${
                      isUnlocked 
                        ? 'bg-yellow-500/5 border-yellow-500/20' 
                        : 'bg-black/20 border-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-2xl p-2 bg-black/40 rounded-xl border border-white/5">{ach.icon}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-gray-200">{ach.title}</h4>
                        {isUnlocked && (
                          <span className="text-[9px] font-mono uppercase bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded font-bold">
                            {t.unlocked}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Card: Avatar Selection Panel */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden h-max">
          
          <div className="space-y-4">
            
            {/* Visual Header */}
            <div className="flex flex-col items-center py-6 border-b border-white/5 relative">
              <span className="text-6xl p-4 bg-black/40 rounded-3xl border border-white/10 shadow-lg relative z-10">{selectedAvatar}</span>
              <h3 className="text-lg font-bold text-white mt-4">{username}</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">{currentUser.email}</p>
            </div>

            {/* Selector Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{t.avatarLabel}</span>
                {currentUser.uid !== 'guest_user' && (
                  <button
                    onClick={handleRandomizeAvatar}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-gray-300 transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-yellow-500" />
                    <span>{t.randomBtn}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-6 gap-2 bg-black/40 p-3 rounded-xl border border-white/5 max-h-[160px] overflow-y-auto">
                {avatarList.map((av) => {
                  const isSelected = av === selectedAvatar;
                  return (
                    <button
                      key={av}
                      disabled={currentUser.uid === 'guest_user'}
                      onClick={() => setSelectedAvatar(av)}
                      className={`text-xl p-1.5 rounded-lg hover:bg-white/10 transition-all ${
                        isSelected ? 'bg-yellow-500/15 border-2 border-yellow-500 scale-105' : 'border border-transparent'
                      }`}
                    >
                      {av}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-xs text-yellow-500 font-semibold flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Level 4 Typist
            </span>
            <p className="text-[11px] text-gray-500 leading-normal">
              Yozish tezligingizni oshiring, tajriba (XP) yig'ing va noyob profil unvonlarini qo'lga kiriting!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
