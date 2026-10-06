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
  ArrowDownToLine,
  Trash2,
  Edit3,
} from "lucide-react";

export default function Sidebar() {
  const {
    playlists,
    activeView,
    activeViewData,
    navigateTo,
    setIsCreatePlaylistModalOpen,
    openDeletePlaylistModal,
    openEditPlaylistModal,
    likedSongIds,
    downloadedSongIds,
    downloadStats,
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
      className={`hidden md:flex flex-col select-none shrink-0 text-sm transition-all duration-300 ease-in-out bg-[#0e081c]/95 border-r border-purple-500/15 z-20 ${isSidebarCollapsed
        ? "w-0 p-0 border-r-0 opacity-0 overflow-hidden pointer-events-none"
        : "w-60 lg:w-64 p-3 opacity-100"
        }`}
    >
      {/* 1. BAMSPLAY SIGNATURE BRAND LOGO */}
      <div
        onClick={() => navigateTo("home")}
        className={`flex items-center gap-3 py-3 px-2 mb-2 cursor-pointer group ${isSidebarCollapsed ? "justify-center px-0" : ""
          }`}
        title="Bamsplay"
      >
        {/* <BamsplayLogo className="w-9 h-9 group-hover:scale-105 transition-transform shrink-0" shape="circle" /> */}

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
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-md font-bold text-xs transition-all ${activeView === "home"
            ? "text-white bg-purple-600/20 shadow-sm"
            : "text-[#9e95b9] hover:text-white hover:bg-white/[0.04]"
            } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
          title="Beranda"
        >
          <Home
            className={`w-4 h-4 shrink-0 ${activeView === "home" ? "text-purple-400" : ""
              }`}
          />
          {!isSidebarCollapsed && <span>Beranda</span>}
        </button>

        <button
          onClick={() => navigateTo("search")}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-md font-bold text-xs transition-all ${activeView === "search"
            ? "text-white bg-purple-600/20 shadow-sm"
            : "text-[#9e95b9] hover:text-white hover:bg-white/[0.04]"
            } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
          title="Jelajahi"
        >
          <Search
            className={`w-4 h-4 shrink-0 ${activeView === "search" ? "text-purple-400" : ""
              }`}
          />
          {!isSidebarCollapsed && <span>Jelajahi & Cari</span>}
        </button>
      </nav>

      {/* Divider */}
      <div className="h-px bg-purple-500/10 my-2 mx-1" />

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
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${activeView === "playlist" &&
              activeViewData?.playlistId === "liked-songs"
              ? "bg-purple-600/25 text-white"
              : "hover:bg-white/[0.04] text-[#c8c2dc]"
              } ${isSidebarCollapsed ? "justify-center p-1.5" : ""}`}
            title="Lagu Favorit"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
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

          {/* Downloaded Songs (Offline) */}
          <div
            onClick={() => navigateTo("downloaded")}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              activeView === "downloaded"
                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                : "hover:bg-white/[0.04] text-[#c8c2dc]"
            } ${isSidebarCollapsed ? "justify-center p-1.5" : ""}`}
            title="Lagu Terunduh (Offline)"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-800 flex items-center justify-center shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
              <ArrowDownToLine className="w-4 h-4 text-emerald-200" />
              {downloadedSongIds?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 text-black font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-md">
                  {downloadedSongIds.length > 99 ? "99+" : downloadedSongIds.length}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs truncate flex items-center justify-between text-white">
                  <span>Lagu Terunduh</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    Offline
                  </span>
                </span>
                <span className="text-[11px] text-[#8e85a6] truncate block">
                  {downloadedSongIds?.length || 0} lagu • {downloadStats?.formattedSize || "0 MB"}
                </span>
              </div>
            )}
          </div>

          {/* Local Audio Upload Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-white/[0.04] text-[#c8c2dc] group ${isSidebarCollapsed ? "justify-center p-1.5" : ""
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
            <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-fuchsia-600 to-purple-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
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
                  className={`group flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected
                    ? "bg-purple-600/25 text-white"
                    : "hover:bg-white/[0.04] text-[#c8c2dc]"
                    } ${isSidebarCollapsed ? "justify-center p-1.5" : ""}`}
                  title={pl.title}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {pl.cover?.startsWith("http") ? (
                      <img
                        src={pl.cover}
                        alt={pl.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-cover.svg";
                        }}
                        className="w-10 h-10 rounded-md object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div
                        style={{
                          background:
                            pl.cover ||
                            "linear-gradient(135deg, #6366f1 0%, #4c1d95 100%)",
                        }}
                        className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 shadow-sm text-white"
                      >
                        <Music className="w-4 h-4 text-purple-200" />
                      </div>
                    )}
                    {!isSidebarCollapsed && (
                      <div className="min-w-0 flex-1">
                        <span
                          className={`font-semibold text-xs truncate block ${isSelected ? "text-purple-300 font-bold" : "text-white"
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

                  {!isSidebarCollapsed && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPlaylistModal(pl);
                        }}
                        className="p-1 rounded text-[#9a91b4] hover:text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
                        title="Edit Playlist"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeletePlaylistModal(pl);
                        }}
                        className="p-1 rounded text-[#9a91b4] hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                        title="Hapus Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Clean Empty State when no custom playlist exists yet */}
          {!isSidebarCollapsed && playlists.filter((p) => p.id !== "liked-songs").length === 0 && (
            <div className="py-6 px-3 text-center rounded-lg mt-2 bg-white/[0.02] border border-white/5">
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
