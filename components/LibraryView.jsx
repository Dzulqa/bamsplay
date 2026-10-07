"use client";

import React, { useState, useRef } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Library,
  Plus,
  Heart,
  Music,
  FolderUp,
  ArrowDownToLine,
  Edit3,
  Trash2,
  Play,
  Sparkles,
} from "lucide-react";

export default function LibraryView() {
  const {
    playlists,
    likedSongIds,
    downloadedSongIds,
    navigateTo,
    setIsCreatePlaylistModalOpen,
    openEditPlaylistModal,
    openDeletePlaylistModal,
    addLocalSongs,
    playSong,
    songs,
  } = useAudio();

  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'playlists' | 'downloaded'
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalSongs(e.target.files);
    }
  };

  const customPlaylists = playlists.filter((p) => p.id !== "liked-songs");

  return (
    <div className="relative pb-28 select-none max-w-5xl mx-auto px-1 sm:px-2 animate-fadeIn">
      {/* Hidden file input for uploading MP3 from device */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#251b47]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/30">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Koleksi Kamu
            </h1>
            <p className="text-xs text-[#a097bf]">
              Semua playlist, lagu favorit & file audio kamu
            </p>
          </div>
        </div>

        {/* Action Button: Create Playlist */}
        <button
          onClick={() => setIsCreatePlaylistModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-full shadow-lg shadow-purple-900/40 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Playlist</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            activeFilter === "all"
              ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
              : "bg-[#180f33] text-[#9f95bd] hover:text-white hover:bg-[#221646]"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setActiveFilter("playlists")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            activeFilter === "playlists"
              ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
              : "bg-[#180f33] text-[#9f95bd] hover:text-white hover:bg-[#221646]"
          }`}
        >
          Playlist ({customPlaylists.length + 1})
        </button>
        <button
          onClick={() => setActiveFilter("downloaded")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            activeFilter === "downloaded"
              ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
              : "bg-[#180f33] text-[#9f95bd] hover:text-white hover:bg-[#221646]"
          }`}
        >
          Terunduh ({downloadedSongIds.length})
        </button>
      </div>

      {/* Primary Action Cards: Lagu Favorit & Unggah MP3 & Terunduh */}
      {(activeFilter === "all" || activeFilter === "playlists") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {/* 1. Lagu Favorit Card */}
          <div
            onClick={() => navigateTo("playlist", { playlistId: "liked-songs" })}
            className="group flex items-center gap-3.5 p-3 rounded-2xl bg-gradient-to-tr from-[#25124a] via-[#1a0c35] to-[#14082c] border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                Lagu Favorit
              </h3>
              <p className="text-xs text-[#a097bf] mt-0.5 truncate">
                Daftar Putar • {likedSongIds.length} lagu
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
                Otomatis
              </span>
            </div>
          </div>

          {/* 2. Lagu Terunduh Card */}
          <div
            onClick={() => navigateTo("downloaded")}
            className="group flex items-center gap-3.5 p-3 rounded-2xl bg-gradient-to-tr from-[#0a2729] via-[#081d22] to-[#071318] border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <ArrowDownToLine className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                Lagu Terunduh
              </h3>
              <p className="text-xs text-[#8fbdb5] mt-0.5 truncate">
                Offline • {downloadedSongIds.length} lagu
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Tersimpan di HP
              </span>
            </div>
          </div>

          {/* 3. Unggah MP3 Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center gap-3.5 p-3 rounded-2xl bg-gradient-to-tr from-[#2d113b] via-[#1e0a29] to-[#15071d] border border-fuchsia-500/20 hover:border-fuchsia-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-800 flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-900/40 group-hover:scale-105 transition-transform">
              <FolderUp className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-white group-hover:text-fuchsia-300 transition-colors truncate">
                Unggah File MP3
              </h3>
              <p className="text-xs text-[#b895c7] mt-0.5 truncate">
                Putar file audio asli perangkat
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-fuchsia-400 bg-fuchsia-950/60 px-2 py-0.5 rounded-full border border-fuchsia-500/30">
                Penyimpanan HP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Playlists Section */}
      {(activeFilter === "all" || activeFilter === "playlists") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#8d84a7] uppercase tracking-wider flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Daftar Playlist Kamu ({customPlaylists.length})</span>
            </h2>
          </div>

          {customPlaylists.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#140e2a]/50 border border-purple-500/15">
              <div className="w-14 h-14 rounded-full bg-purple-950/80 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 text-purple-300">
                <Music className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Belum Ada Playlist Kustom</p>
              <p className="text-xs text-[#9f95bd] mt-1 max-w-sm mx-auto">
                Kamu belum membuat playlist kustom. Klik tombol di bawah untuk membuat koleksi pertamamu.
              </p>
              <button
                onClick={() => setIsCreatePlaylistModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Playlist Pertama</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {customPlaylists.map((pl) => {
                const count = pl.songIds ? pl.songIds.length : 0;
                return (
                  <div
                    key={pl.id}
                    onClick={() => navigateTo("playlist", { playlistId: pl.id })}
                    className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#130b28]/70 hover:bg-[#1f133e] border border-purple-500/15 hover:border-purple-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {pl.cover?.startsWith("http") ? (
                        <img
                          src={pl.cover}
                          alt={pl.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-cover.svg";
                          }}
                          className="w-13 h-13 rounded-xl object-cover shrink-0 shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div
                          style={{
                            background:
                              pl.cover ||
                              "linear-gradient(135deg, #6366f1 0%, #4c1d95 100%)",
                          }}
                          className="w-13 h-13 rounded-xl flex items-center justify-center shrink-0 shadow-md text-white group-hover:scale-105 transition-transform"
                        >
                          <Music className="w-6 h-6 text-purple-200" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors block truncate">
                          {pl.title}
                        </span>
                        <span className="text-xs text-[#9a91b4] block truncate mt-0.5">
                          Playlist • {count} lagu
                        </span>
                        {pl.description && (
                          <span className="text-[11px] text-[#786e92] block truncate mt-0.5">
                            {pl.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons on the right */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPlaylistModal(pl);
                        }}
                        className="p-2 rounded-xl text-[#9a91b4] hover:text-purple-300 hover:bg-purple-900/40 transition-colors active:scale-95 cursor-pointer"
                        title="Edit Playlist"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeletePlaylistModal(pl);
                        }}
                        className="p-2 rounded-xl text-[#9a91b4] hover:text-rose-400 hover:bg-rose-500/15 transition-colors active:scale-95 cursor-pointer"
                        title="Hapus Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter Terunduh view shortcut */}
      {activeFilter === "downloaded" && (
        <div className="py-8 text-center rounded-2xl bg-[#140e2a]/50 border border-purple-500/15">
          <ArrowDownToLine className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">Lagu Terunduh ({downloadedSongIds.length})</h3>
          <p className="text-xs text-[#9a91b4] mt-1 max-w-sm mx-auto">
            Daftar lengkap lagu yang telah tersimpan di penyimpanan offline perangkat kamu.
          </p>
          <button
            onClick={() => navigateTo("downloaded")}
            className="mt-4 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
          >
            Buka Halaman Lagu Terunduh
          </button>
        </div>
      )}
    </div>
  );
}
