import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { PixelAvatar, PRESET_AVATAR_IDS } from "./PixelAvatar";
import { RefreshCw, ArrowLeft, BarChart2, Save } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

interface ProfileViewProps {
  user: UserProfile;
  onProfileUpdated: (updatedUser: UserProfile) => void;
  onNavigate: (view: "home" | "test" | "profile" | "my-results" | "leaderboard" | "blog") => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onProfileUpdated,
  onNavigate
}) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || "avatar_1");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [avatarList, setAvatarList] = useState<string[]>(PRESET_AVATAR_IDS);

  const handleRandomizeAvatars = () => {
    // Shuffles or randomizes the avatars list
    const shuffled = [...PRESET_AVATAR_IDS].sort(() => 0.5 - Math.random());
    setAvatarList(shuffled);
    // Automatically select the first one of the shuffled list
    setSelectedAvatar(shuffled[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Iltimos, ism va familiyangizni to'liq kiriting.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveSuccess(false);

    const updatedProfile: UserProfile = {
      ...user,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatar: selectedAvatar,
    };

    const userDocPath = `users/${user.uid}`;
    try {
      // Save to firestore doc /users/{userId}
      await setDoc(doc(db, "users", user.uid), {
        uid: updatedProfile.uid,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        avatar: updatedProfile.avatar,
        email: updatedProfile.email,
        createdAt: user.createdAt || new Date()
      });

      // Update parent app state
      onProfileUpdated(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Profilni saqlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      handleFirestoreError(err, OperationType.WRITE, userDocPath);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 flex flex-col items-center">
      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-extrabold text-white mb-2">Profil</h1>
        <p className="text-xs text-neutral-400">Ismingizni va avatarni o'zgartiring</p>
      </div>

      {/* Large Selected Avatar & User Details */}
      <div className="flex flex-col items-center mb-8 select-none">
        <PixelAvatar avatarId={selectedAvatar} size={112} className="ring-4 ring-neutral-800 ring-offset-4 ring-offset-black" />
        <h2 className="text-lg font-bold text-white mt-4">{firstName || "Ism"} {lastName || "Familiya"}</h2>
        <span className="text-[11px] text-neutral-500 font-mono mt-1">{user.email}</span>
      </div>

      <form onSubmit={handleSave} className="w-full flex flex-col gap-6">
        {/* Shaxsiy Ma'lumotlar Card */}
        <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-4 border-b border-neutral-900 pb-2">
            Shaxsiy ma'lumotlar
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 font-mono">
                Ism
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={30}
                placeholder="Ismingizni kiriting"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5 font-mono">
                Familiya
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={30}
                placeholder="Familiyangizni kiriting"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Avatar Selection Card */}
        <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Avatar
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Sizga yoqqan piksel ko'rinishni bosing</p>
            </div>
            
            <button
              type="button"
              onClick={handleRandomizeAvatars}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-neutral-800 text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-950 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Boshqa variantlar</span>
            </button>
          </div>

          {/* Grid of Avatars */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {avatarList.map((avatarId) => {
              const isSelected = selectedAvatar === avatarId;
              return (
                <button
                  key={avatarId}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarId)}
                  className={`relative p-1.5 rounded-xl border aspect-square flex items-center justify-center transition-all cursor-pointer hover:bg-neutral-900/60 ${
                    isSelected
                      ? "border-white bg-neutral-900/40 ring-2 ring-white/10"
                      : "border-neutral-850 bg-neutral-950/40"
                  }`}
                >
                  <PixelAvatar avatarId={avatarId} size={48} className="border-0 bg-transparent rounded-lg" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Error/Success States */}
        {error && (
          <div className="text-red-500 text-xs text-center font-semibold bg-red-950/20 border border-red-900/30 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="text-green-400 text-xs text-center font-semibold bg-green-950/20 border border-green-900/30 py-2.5 rounded-xl">
            Profil muvaffaqiyatli saqlandi!
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 disabled:opacity-50 font-bold text-sm py-3.5 px-6 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saqlanmoqda..." : "Saqlash"}</span>
        </button>
      </form>

      {/* Auxiliary links below - Exact look of screenshot */}
      <div className="flex items-center gap-6 mt-8">
        <button
          onClick={() => onNavigate("my-results")}
          className="flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl bg-neutral-950/50 transition-all cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Natijalarim</span>
        </button>

        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Asosiy sahifa</span>
        </button>
      </div>
    </div>
  );
};
