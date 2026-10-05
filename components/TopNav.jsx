"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import BamsplayLogo from "./BamsplayLogo";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Bell,
  Sparkles,
  User,
  Settings,
  LogOut,
  FolderUp,
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
    addLocalSongs,
  } = useAudio();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const topFileInputRef = useRef(null);
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
    <header className="h-16 px-4 md:px-8 flex items-center justify-between z-20 shrink-0 bg-[#0a0515]/80 backdrop-blur-xl sticky top-0 border-b border-purple-500/15">
      {/* Left: History Nav & Search Bar */}
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        {/* Mobile Brand Mark */}
        <div
          onClick={() => navigateTo("home")}
          className="md:hidden flex items-center shrink-0 cursor-pointer group"
          title="Bamsplay"
        >
          <BamsplayLogo className="w-8 h-8 group-hover:scale-105 transition-transform" shape="circle" />
        </div>

        {/* History Nav */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              historyIndex > 0
                ? "bg-purple-950/40 text-white hover:bg-purple-900/50 border border-purple-500/20 cursor-pointer"
                : "bg-purple-950/10 text-gray-600 cursor-not-allowed border border-transparent"
            }`}
            title="Kembali"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= historyStack.length - 1}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              historyIndex < historyStack.length - 1
                ? "bg-purple-950/40 text-white hover:bg-purple-900/50 border border-purple-500/20 cursor-pointer"
                : "bg-purple-950/10 text-gray-600 cursor-not-allowed border border-transparent"
            }`}
            title="Maju"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean, spacious search input */}
        <div className="relative w-full max-w-sm group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8e85ad] group-focus-within:text-purple-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari dari 100 Juta+ lagu, artis, atau album..."
            className="w-full bg-[#150d29] text-xs sm:text-sm text-gray-100 placeholder-[#796f99] rounded-xl pl-10 pr-9 py-2 border border-purple-500/20 focus:border-purple-400 focus:bg-[#1d1238] focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7e749f] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Local Music Upload Button */}
        <button
          onClick={() => topFileInputRef.current?.click()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/25 hover:border-purple-400 text-xs font-bold text-purple-200 hover:text-white transition-all shadow-sm cursor-pointer"
          title="Unggah & Putar Lagu Sendiri"
        >
          <input
            type="file"
            ref={topFileInputRef}
            accept="audio/*"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addLocalSongs(e.target.files);
              }
            }}
            className="hidden"
          />
          <FolderUp className="w-3.5 h-3.5 text-purple-400" />
          <span>Impor MP3</span>
        </button>

        {/* Bamsplay Pro Badge */}
        <div
          onClick={() => showToast("Bamsplay Pro Aktif ✨", "purple")}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs font-bold text-purple-200 hover:border-purple-400 cursor-pointer transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Bamsplay Pro</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-9 h-9 rounded-xl bg-[#140c26] hover:bg-[#20143d] border border-purple-500/20 flex items-center justify-center text-[#b8b0cf] hover:text-white transition-colors relative"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#0a0515]"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 glass-dropdown border border-purple-500/30 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <span className="font-bold text-xs text-white">Pemberitahuan</span>
                <span className="text-[10px] text-purple-400 font-semibold uppercase">
                  Baru
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-[#1b1036] hover:bg-[#25174a] transition-colors cursor-pointer">
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

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl bg-[#140c26] hover:bg-[#20143d] border border-purple-500/20 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              B
            </div>
            <span className="text-xs font-bold text-gray-200">Bams</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-dropdown border border-purple-500/30 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-150 text-xs">
              <div className="px-3 py-2 border-b border-purple-500/20">
                <div className="font-bold text-white">Bams</div>
                <div className="text-[#968eb1] text-[10px]">bams@bamsplay.id</div>
              </div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigateTo("playlist", { playlistId: "liked-songs" });
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#221542] text-gray-200 hover:text-white flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Koleksi Favorit</span>
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  showToast("Pengaturan tersimpan", "default");
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#221542] text-gray-200 hover:text-white flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-gray-400" />
                <span>Pengaturan Suara</span>
              </button>
              <div className="border-t border-purple-500/20 my-1"></div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  showToast("Berhasil keluar sesi", "default");
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
