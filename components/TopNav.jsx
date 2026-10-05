"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import BamsplayLogo from "./BamsplayLogo";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  Compass,
  ListMusic,
  PanelLeft,
  PanelRight,
  Mic2,
  Edit3,
  ArrowDownToLine,
  WifiOff,
} from "lucide-react";

export default function TopNav() {
  const {
    activeView,
    searchQuery,
    setSearchQuery,
    navigateTo,
    goBack,
    goForward,
    historyIndex,
    historyStack,
    showToast,
    currentSong,
    isPlaying,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    currentUser,
    downloadedSongIds,
    downloadStats,
    isOfflineNetwork,
    setIsLoginModalOpen,
    setIsEditProfileModalOpen,
    logoutUser,
  } = useAudio();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (activeView !== "search") {
      navigateTo("search");
    }
  };

  return (
    <header className="h-16 px-3 md:px-5 flex items-center justify-between z-20 shrink-0 bg-[#0a0515]/90 backdrop-blur-xl sticky top-0 border-b border-purple-500/15">
      {/* 1. Left: Sidebar Toggle Button (Pojok Kiri) & History Navigation */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Sidebar Button (Pojok Kiri Paling Awal) */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-all cursor-pointer ${
            !isSidebarCollapsed
              ? "bg-[#1f133b] text-purple-300 border border-purple-500/35 hover:bg-[#2c1c53] hover:text-white shadow-sm"
              : "bg-[#150e26] text-purple-300/80 hover:text-white hover:bg-purple-600/25 border border-purple-500/25 hover:border-purple-500/50"
          }`}
          title={isSidebarCollapsed ? "Buka Sidebar (Koleksi Kamu)" : "Sembunyikan Sidebar"}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Mobile Brand Mark */}
        <div
          onClick={() => navigateTo("home")}
          className="md:hidden flex items-center shrink-0 cursor-pointer group mr-1"
          title="Bamsplay"
        >
          <BamsplayLogo className="w-8 h-8 group-hover:scale-105 transition-transform" shape="circle" />
        </div>

        {/* History Nav */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              historyIndex > 0
                ? "bg-black/40 text-gray-300 hover:text-white hover:bg-black/60 cursor-pointer"
                : "bg-black/20 text-gray-600 cursor-not-allowed"
            }`}
            title="Kembali"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= historyStack.length - 1}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              historyIndex < historyStack.length - 1
                ? "bg-black/40 text-gray-300 hover:text-white hover:bg-black/60 cursor-pointer"
                : "bg-black/20 text-gray-600 cursor-not-allowed"
            }`}
            title="Maju"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Center: Home Shortcut + Search Bar */}
      <div className="flex-1 flex items-center justify-center max-w-sm sm:max-w-md lg:max-w-lg mx-1.5 sm:mx-3 min-w-0 gap-2">
        {/* Circular Home Shortcut */}
        <button
          onClick={() => navigateTo("home")}
          className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all cursor-pointer shrink-0 ${
            activeView === "home"
              ? "bg-[#1e1338] text-purple-300 border border-purple-500/35 hover:bg-[#27194a] hover:text-white shadow-sm"
              : "bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 border border-transparent"
          }`}
          title="Beranda"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Spacious Responsive Search Bar */}
        <div className="relative flex-1 group min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8e85ad] group-focus-within:text-purple-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari lagu, artis, atau album..."
            className="w-full bg-[#160f2a] text-xs sm:text-sm text-gray-100 placeholder-[#796f99] rounded-full pl-9 pr-9 sm:pr-14 py-2 border border-white/5 focus:border-purple-400/40 focus:bg-[#1d1436] focus:outline-none transition-all shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#7e749f] hover:text-white p-0.5 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigateTo("search")}
                className="hidden md:flex items-center gap-1 text-[#7e749f] hover:text-purple-300 pl-2 border-l border-white/10 transition-colors cursor-pointer"
                title="Jelajahi Semua Genre"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden 2xl:inline">Jelajahi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Right: Queue, Notifications & User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Offline indicator if network is down */}
        {isOfflineNetwork && (
          <div
            onClick={() => navigateTo("downloaded")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-semibold cursor-pointer animate-pulse"
            title="Koneksi terputus. Mode Offline aktif"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mode Offline</span>
          </div>
        )}

        {/* Quick Downloaded Shortcut */}
        <button
          onClick={() => navigateTo("downloaded")}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer relative ${
            activeView === "downloaded"
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
              : "bg-black/30 hover:bg-white/10 text-[#b8b0cf] hover:text-emerald-300"
          }`}
          title="Lagu Terunduh (Offline)"
        >
          <ArrowDownToLine className="w-4 h-4" />
          {downloadedSongIds?.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0515]"></span>
          )}
        </button>

        {/* Quick Queue Shortcut */}
        <button
          onClick={() => navigateTo("queue")}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeView === "queue"
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
              : "bg-black/30 hover:bg-white/10 text-[#b8b0cf] hover:text-white"
          }`}
          title="Antrean Lagu"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Toggle Right Lyrics Panel */}
        <button
          onClick={() => {
            if (activeView === "lyrics") {
              setIsRightSidebarOpen(true);
              if (historyIndex > 0) {
                goBack();
              } else {
                navigateTo("home");
              }
            } else {
              setIsRightSidebarOpen(!isRightSidebarOpen);
            }
          }}
          className={`hidden xl:flex w-8 h-8 rounded-full items-center justify-center transition-all cursor-pointer ${
            isRightSidebarOpen
              ? "bg-[#1f133b] text-purple-300 border border-purple-500/35 hover:bg-[#2c1c53] hover:text-white shadow-sm"
              : "bg-[#150e26] text-purple-300/80 hover:text-white hover:bg-purple-600/25 border border-purple-500/25 hover:border-purple-500/50"
          }`}
          title={isRightSidebarOpen ? "Sembunyikan Panel Lirik (Kanan)" : "Buka Panel Lirik (Kanan)"}
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-white/10 flex items-center justify-center text-[#b8b0cf] hover:text-white transition-colors relative"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#0a0515]"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#140c26]/95 border border-white/10 rounded-lg shadow-2xl p-3 z-50 animate-in fade-in duration-150 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-xs text-white">Pemberitahuan</span>
                <span className="text-[10px] text-purple-400 font-semibold uppercase">
                  Baru
                </span>
              </div>
              <div className="py-2 space-y-1.5 text-xs">
                <div className="p-2.5 rounded-md bg-white/[0.03] hover:bg-white/[0.07] transition-colors cursor-pointer">
                  <div className="font-semibold text-purple-200">
                    Bernadya - Satu Bulan
                  </div>
                  <div className="text-[#968eb1] text-[11px] mt-0.5">
                    Lagu favoritmu sedang tren hari ini di Bamsplay.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Gmail Login */}
        <div className="relative" ref={userMenuRef}>
          {currentUser ? (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 py-1 pl-1 pr-2.5 rounded-full bg-[#180f2d] hover:bg-[#251745] border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer shadow-sm group"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-purple-400/30 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (currentUser.name || "U")[0].toUpperCase()
                  )}
                </div>
                {/* Mini Google Indicator Dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-2 h-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-gray-100 group-hover:text-purple-200 transition-colors truncate max-w-[140px] md:max-w-[160px]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-purple-300/60 group-hover:text-purple-200 transition-transform duration-200 shrink-0" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Masuk Gmail</span>
            </button>
          )}

          {isUserMenuOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-64 bg-[#140c26]/95 border border-purple-500/20 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150 text-xs backdrop-blur-xl">
              {/* Current Gmail Account Info */}
              <div className="px-3.5 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (currentUser.name || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-purple-300 text-[11px] truncate flex items-center gap-1">
                      <span>{currentUser.email}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Playlist & Data Tersimpan di Akun
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-1 space-y-0.5">
                {/* Edit Username Button */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsEditProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-600/20 text-purple-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>Ubah Username</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 font-medium">
                        14 Hari
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">Atur nama tampilan profil kamu</div>
                  </div>
                </button>

                {/* Switch / Add Account Button */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-600/20 text-purple-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-xs">Ganti / Tambah Akun Gmail</div>
                    <div className="text-[10px] text-gray-400">Pindah ke profil akun lain</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo("downloaded");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-600/20 text-emerald-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>Lagu Terunduh (Offline)</span>
                      <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">
                        {downloadedSongIds?.length || 0} lagu
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {downloadStats?.formattedSize || "0 MB"} tersimpan di perangkat
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo("playlist", { playlistId: "liked-songs" });
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.06] text-gray-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Koleksi Favorit Saya</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    showToast("Kualitas Audio: Sangat Tinggi (Lossless)", "default");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.06] text-gray-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Pengaturan Akun & Suara</span>
                </button>
              </div>

              <div className="border-t border-white/10 my-1"></div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logoutUser();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Keluar dari Akun Ini</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
