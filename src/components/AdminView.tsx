import React, { useState } from 'react';
import { UserProfile, UserSettings, TestResult, AdminLog } from '../types';
import { getAllUsers, saveAllUsers, getTestResults, addAdminLog, getAdminLogs } from '../utils/storage';
import { ShieldAlert, Users, Keyboard, BarChart, FileText, Ban, Trash2, CheckCircle, ShieldCheck, UserX } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminViewProps {
  currentUser: UserProfile;
  settings: UserSettings;
}

export default function AdminView({
  currentUser,
  settings,
}: AdminViewProps) {
  const [usersList, setUsersList] = useState<UserProfile[]>(getAllUsers());
  const [resultsList, setResultsList] = useState<TestResult[]>(getTestResults());
  const [logs, setLogs] = useState<AdminLog[]>(getAdminLogs());
  const [activeTab, setActiveTab] = useState<'users' | 'results' | 'logs'>('users');

  // Guard Clause for admin check
  if (!currentUser.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-white">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Ruxsat Berilmadi</h2>
        <p className="text-sm text-gray-400">
          Ushbu sahifa faqat UzbekType administratorlari uchun mo'ljallangan. Profilingiz orqali Administrator huquqini yoqing.
        </p>
      </div>
    );
  }

  // Toggle user ban status
  const handleToggleBan = (user: UserProfile) => {
    const updatedUsers = usersList.map(u => {
      if (u.uid === user.uid) {
        const isBanned = !u.isBanned;
        addAdminLog(
          isBanned ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan ochildi',
          `@${u.username} (${u.email}) holati tahrirlandi.`,
          currentUser.email
        );
        return { ...u, isBanned };
      }
      return u;
    });
    
    saveAllUsers(updatedUsers);
    setUsersList(updatedUsers);
    setLogs(getAdminLogs());
  };

  // Toggle admin promotion
  const handleToggleAdmin = (user: UserProfile) => {
    // Prevent admin from de-admining themselves
    if (user.uid === currentUser.uid) {
      alert("O'zingizni administratorlikdan bo'shata olmaysiz!");
      return;
    }

    const updatedUsers = usersList.map(u => {
      if (u.uid === user.uid) {
        const isAdmin = !u.isAdmin;
        addAdminLog(
          isAdmin ? 'Yangi administrator tayinlandi' : 'Administrator bo\'shatildi',
          `@${u.username} foydalanuvchisi admin rolidan ${isAdmin ? 'yukseltildi' : 'tushirildi'}.`,
          currentUser.email
        );
        return { ...u, isAdmin };
      }
      return u;
    });

    saveAllUsers(updatedUsers);
    setUsersList(updatedUsers);
    setLogs(getAdminLogs());
  };

  // Delete typing result (anomalous data deletion)
  const handleDeleteResult = (resultId: string, username: string, wpm: number) => {
    const confirmation = window.confirm(`Haqiqatan ham @${username} foydalanuvchisining ${wpm} WPM natijasini o'chirib tashlamoqchimisiz?`);
    if (!confirmation) return;

    const filtered = resultsList.filter(r => r.id !== resultId);
    localStorage.setItem('uzbektype_results', JSON.stringify(filtered));
    setResultsList(filtered);

    addAdminLog(
      'Natija o\'chirildi',
      `@${username} ning anomal yozish natijasi (${wpm} WPM) bazadan o'chirib tashlandi.`,
      currentUser.email
    );
    setLogs(getAdminLogs());
  };

  // Aggregations
  const totalRegisteredUsers = usersList.length;
  const totalTestsTaken = resultsList.length;
  const averagePlatformWpm = totalTestsTaken > 0 
    ? Math.round(resultsList.reduce((acc, r) => acc + r.wpm, 0) / totalTestsTaken) 
    : 0;

  const isUz = settings.language === 'uz';
  const t = {
    title: isUz ? "Admin Boshqaruv Paneli" : "Admin Dashboard",
    usersTab: isUz ? "Foydalanuvchilar" : "Users",
    resultsTab: isUz ? "Natijalar Moderatsiyasi" : "Results Moderation",
    logsTab: isUz ? "Tizim Loglari" : "Audit Logs",
    statUsers: isUz ? "Platforma a'zolari" : "Total Users",
    statTests: isUz ? "Sariq testlar" : "Global Tests",
    statAvgWpm: isUz ? "O'rtacha platforma WPM" : "Global Avg WPM",
    statLogs: isUz ? "Loglar soni" : "Audit Events",
    username: isUz ? "Foydalanuvchi" : "User",
    role: isUz ? "Rol" : "Role",
    status: isUz ? "Holat" : "Status",
    actions: isUz ? "Amallar" : "Actions",
    active: isUz ? "Faol" : "Active",
    banned: isUz ? "Bloklangan" : "Banned"
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      
      {/* Title */}
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight text-white">{t.title}</h1>
          <p className="text-xs text-gray-500">Tizimni nazorat qilish, natijalarni tozalash va foydalanuvchilarni boshqarish bo'limi.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <span className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
            <Users className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.statUsers}</span>
            <span className="text-xl font-bold font-mono text-white">{totalRegisteredUsers}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <span className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
            <Keyboard className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.statTests}</span>
            <span className="text-xl font-bold font-mono text-white">{totalTestsTaken}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <span className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
            <BarChart className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.statAvgWpm}</span>
            <span className="text-xl font-bold font-mono text-yellow-500">{averagePlatformWpm} <span className="text-[10px] text-gray-500">WPM</span></span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <span className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
            <FileText className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-500 font-medium block">{t.statLogs}</span>
            <span className="text-xl font-bold font-mono text-white">{logs.length}</span>
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/10 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'users' ? 'border-red-500 text-red-500 font-bold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          {t.usersTab}
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'results' ? 'border-red-500 text-red-500 font-bold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          {t.resultsTab}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'logs' ? 'border-red-500 text-red-500 font-bold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          {t.logsTab}
        </button>
      </div>

      {/* Render Active Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="bg-[#1b1b1b] text-gray-400 font-mono text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="py-3 px-6">{t.username}</th>
                  <th className="py-3 px-6 text-center">{t.role}</th>
                  <th className="py-3 px-6 text-center">{t.status}</th>
                  <th className="py-3 px-6 text-right">Best WPM</th>
                  <th className="py-3 px-6 text-center">Testlar</th>
                  <th className="py-3 px-6 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-all">
                    
                    {/* User Avatar, Name, Email */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{user.avatar}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{user.username}</span>
                          <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        user.isAdmin 
                          ? 'bg-red-500/10 text-red-500 border border-red-500/25' 
                          : 'bg-white/5 text-gray-400 border border-white/5'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'Foydalanuvchi'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        user.isBanned 
                          ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                          : 'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {user.isBanned ? t.banned : t.active}
                      </span>
                    </td>

                    {/* Best WPM */}
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-white">
                      {user.bestWPM || 0}
                    </td>

                    {/* Test Counts */}
                    <td className="py-3.5 px-6 text-center font-mono text-gray-400">
                      {user.testsCount || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle Admin */}
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          className="p-1.5 rounded bg-[#222] hover:bg-[#333] border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer active:scale-90"
                          title="Rolni o'zgartirish"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                        </button>

                        {/* Ban / Unban */}
                        <button
                          onClick={() => handleToggleBan(user)}
                          className={`p-1.5 rounded border transition-all cursor-pointer active:scale-90 ${
                            user.isBanned 
                              ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/25' 
                              : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/25'
                          }`}
                          title={user.isBanned ? 'Faollashtirish' : 'Bloklash'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Moderation Tab */}
      {activeTab === 'results' && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="bg-[#1b1b1b] text-gray-400 font-mono text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="py-3 px-6">Sana</th>
                  <th className="py-3 px-6">Foydalanuvchi</th>
                  <th className="py-3 px-6">Rejim</th>
                  <th className="py-3 px-6 text-right">WPM</th>
                  <th className="py-3 px-6 text-right">Aniqlik</th>
                  <th className="py-3 px-6 text-center">O'chirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {resultsList.slice(0, 30).map((res) => (
                  <tr key={res.id} className="hover:bg-white/5 transition-all">
                    
                    {/* Timestamp */}
                    <td className="py-3 px-6 font-mono text-xs text-gray-500">
                      {new Date(res.createdAt).toLocaleString()}
                    </td>

                    {/* Username */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span>{res.avatar}</span>
                        <span className="font-semibold text-gray-200">{res.username}</span>
                      </div>
                    </td>

                    {/* Mode parameter */}
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono font-semibold text-gray-500 uppercase">
                        {res.language} | {res.duration}s | {res.difficulty}
                      </span>
                    </td>

                    {/* Speed WPM */}
                    <td className="py-3 px-6 text-right font-mono font-bold text-yellow-500">
                      {res.wpm}
                    </td>

                    {/* Accuracy */}
                    <td className="py-3 px-6 text-right font-mono text-gray-300">
                      {res.accuracy}%
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleDeleteResult(res.id, res.username, res.wpm)}
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/25 transition-all cursor-pointer active:scale-90"
                        title="Natijani o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Events Logs Tab */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden shadow-xl p-5">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/25 font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-normal">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-gray-500 font-mono">Admin:</span>
                  <p className="text-gray-300 font-semibold font-mono">{log.adminEmail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
