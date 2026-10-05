"use client";

import React, { useState, useRef } from "react";
import { useAudio } from "@/context/AudioContext";
import BamsplayLogo from "./BamsplayLogo";
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  ArrowRight,
  FolderUp,
  Music,
} from "lucide-react";

export default function Sidebar() {
  const {
    playlists,
    activeView,
    activeViewData,
    navigateTo,
    setIsCreatePlaylistModalOpen,
    likedSongIds,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    addLocalSongs,
  } = useAudio();

  const [filterType, setFilterType] = useState("all");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalSongs(e.target.files);
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col select-none shrink-0 text-sm transition-all duration-300 ease-in-out bg-[#0e081c]/95 border-r border-purple-500/15 z-20 ${
        isSidebarCollapsed ? "w-18 p-2" : "w-60 lg:w-64 p-3"
      }`}
    >
      {/* 1. BAMSPLAY SIGNATURE BRAND LOGO */}
      <div
        onClick={() => navigateTo("home")}
        className={`flex items-center gap-3 py-3 px-2 mb-2 cursor-pointer group ${
          isSidebarCollapsed ? "justify-center px-0" : ""
        }`}
        title="Bamsplay"
      >
        <BamsplayLogo className="w-9 h-9 group-hover:scale-105 transition-transform shrink-0" shape="circle" />

        {!isSidebarCollapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                Bamsplay
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            </div>
            <span className="text-[10px] text-purple-400/80 font-semibold tracking-wider uppercase -mt-0.5">
              Audio & Atmosphere
            </span>
          </div>
        )}
      </div>

      {/* 2. MAIN NAVIGATION */}
      <nav className="space-y-1 mb-4">
        <button
          onClick={() => navigateTo("home")}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeView === "home"
              ? "text-white bg-purple-900/40 border border-purple-500/30 shadow-sm"
              : "text-[#9e95b9] hover:text-white hover:bg-purple-950/20"
          } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
          title="Beranda"
        >
          <Home
            className={`w-4 h-4 shrink-0 ${
              activeView === "home" ? "text-purple-400" : ""
            }`}
          />
          {!isSidebarCollapsed && <span>Beranda</span>}
        </button>

        <button
          onClick={() => navigateTo("search")}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeView === "search"
              ? "text-white bg-purple-900/40 border border-purple-500/30 shadow-sm"
              : "text-[#9e95b9] hover:text-white hover:bg-purple-950/20"
          } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
          title="Jelajahi"
        >
          <Search
            className={`w-4 h-4 shrink-0 ${
              activeView === "search" ? "text-purple-400" : ""
            }`}
          />
          {!isSidebarCollapsed && <span>Jelajahi & Cari</span>}
        </button>
      </nav>

      {/* Divider */}
      <div className="h-px bg-purple-500/15 my-2 mx-1" />

      {/* 3. KOLEKSI / LIBRARY */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300/90 uppercase tracking-wider">
              <Library className="w-3.5 h-3.5" />
              <span>Koleksi Kamu</span>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="mx-auto text-purple-300 hover:text-white"
              title="Perluas Sidebar"
            >
              <Library className="w-4 h-4" />
            </button>
          )}

          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreatePlaylistModalOpen(true)}
                className="p-1 rounded-md text-[#9e95b9] hover:text-white hover:bg-purple-900/30 transition-colors"
                title="Buat Playlist Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded-md text-[#9e95b9] hover:text-white hover:bg-purple-900/30 transition-colors"
                title="Ciutkan Sidebar"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {/* Liked Songs */}
          <div
            onClick={() => navigateTo("playlist", { playlistId: "liked-songs" })}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
              activeView === "playlist" &&
              activeViewData?.playlistId === "liked-songs"
                ? "bg-purple-900/35 border border-purple-500/30 text-white"
                : "hover:bg-purple-950/20 text-[#c8c2dc]"
            } ${isSidebarCollapsed ? "justify-center p-1.5" : ""}`}
            title="Lagu Favorit"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs truncate block text-white">
                  Lagu Favorit
                </span>
                <span className="text-[11px] text-[#8e85a6] truncate block">
                  Daftar Putar
                </span>
              </div>
            )}
          </div>

          {/* Local Audio Upload Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-purple-950/30 text-[#c8c2dc] group border border-dashed border-purple-500/20 hover:border-purple-500/50 ${
              isSidebarCollapsed ? "justify-center p-1.5" : ""
            }`}
            title="Unggah / Putar MP3 Asli (File Lokal)"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-purple-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <FolderUp className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs truncate block text-white group-hover:text-purple-300 transition-colors">
                  Unggah File MP3
                </span>
                <span className="text-[11px] text-[#8e85a6] truncate block">
                  Putar audio asli perangkat
                </span>
              </div>
            )}
          </div>

          {/* Other Custom Playlists */}
          {playlists
            .filter((p) => p.id !== "liked-songs")
            .map((pl) => {
              const isSelected =
                activeView === "playlist" && activeViewData?.playlistId === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => navigateTo("playlist", { playlistId: pl.id })}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-900/35 border border-purple-500/30 text-white"
                      : "hover:bg-purple-950/20 text-[#c8c2dc]"
                  } ${isSidebarCollapsed ? "justify-center p-1.5" : ""}`}
                  title={pl.title}
                >
                  {pl.cover?.startsWith("http") ? (
                    <img
                      src={pl.cover}
                      alt={pl.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-cover.svg";
                      }}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 shadow-sm"
                    />
                  ) : (
                    <div
                      style={{
                        background:
                          pl.cover ||
                          "linear-gradient(135deg, #6366f1 0%, #4c1d95 100%)",
                      }}
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white"
                    >
                      <Music className="w-4 h-4 text-purple-200" />
                    </div>
                  )}
                  {!isSidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <span
                        className={`font-semibold text-xs truncate block ${
                          isSelected ? "text-purple-300 font-bold" : "text-white"
                        }`}
                      >
                        {pl.title}
                      </span>
                      <span className="text-[11px] text-[#8e85a6] truncate block">
                        {pl.songIds ? `${pl.songIds.length} lagu` : "Daftar Putar"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Clean Empty State when no custom playlist exists yet */}
          {!isSidebarCollapsed && playlists.filter((p) => p.id !== "liked-songs").length === 0 && (
            <div className="py-7 px-3 text-center border border-dashed border-purple-500/15 rounded-xl mt-2 bg-purple-950/10">
              <p className="text-xs font-semibold text-white/90">Belum ada playlist</p>
              <p className="text-[11px] text-[#8e85a6] mt-0.5 leading-relaxed">
                Playlist yang kamu buat akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
