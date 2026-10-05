"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  ArrowDownToLine,
  Play,
  Pause,
  Shuffle,
  Trash2,
  HardDrive,
  Search,
  CheckCircle2,
  ListPlus,
  Heart,
  Music,
  Wifi,
  WifiOff,
  Sparkles,
} from "lucide-react";

export default function DownloadedView() {
  const {
    currentUser,
    downloadedSongsList,
    downloadedSongIds,
    downloadStats,
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
    removeDownloadedSong,
    clearAllDownloads,
    navigateTo,
    openAddToPlaylistModal,
    toggleLike,
    likedSongIds,
    isOfflineNetwork,
    setIsLoginModalOpen,
  } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const songs = downloadedSongsList || [];
  const filteredSongs = songs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.artist?.toLowerCase().includes(q) ||
      s.album?.toLowerCase().includes(q)
    );
  });

  const handlePlayAll = () => {
    if (filteredSongs.length === 0) return;
    playSong(filteredSongs[0], {
      id: "downloaded-songs",
      title: "Lagu Terunduh",
      songIds: filteredSongs.map((s) => s.id),
    });
  };

  const handleShufflePlay = () => {
    if (filteredSongs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    playSong(filteredSongs[randomIndex], {
      id: "downloaded-songs",
      title: "Lagu Terunduh",
      songIds: filteredSongs.map((s) => s.id),
    });
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "1.2 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Baru saja";
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-24 text-white select-none">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/70 via-[#120826]/90 to-[#090314] border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Cover / Icon Banner */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 p-0.5 shadow-2xl shrink-0 flex items-center justify-center relative group">
            <div className="w-full h-full rounded-2xl bg-[#0d1e17]/80 backdrop-blur-md flex flex-col items-center justify-center gap-2 text-emerald-300">
              <ArrowDownToLine className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/90">
                OFFLINE READY
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Penyimpanan Lokal Musik Offline</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2">
              Lagu Terunduh
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-purple-200/80">
              {currentUser?.email ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <span className="font-bold text-white">{currentUser.name}</span>
                  <span className="text-[#a59bbf]">({currentUser.email})</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-purple-300 underline font-semibold hover:text-white"
                >
                  Masuk Google untuk menyimpan unduhan
                </button>
              )}

              <span>•</span>
              <span className="font-semibold text-white">{songs.length} lagu</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-emerald-300">
                <HardDrive className="w-3.5 h-3.5" />
                {downloadStats.formattedSize || "0 MB"} digunakan
              </span>
              <span>•</span>
              <span className="text-gray-400">Putar tanpa kuota internet</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black ml-0.5" />
            <span>Putar Semua Offline</span>
          </button>

          <button
            onClick={handleShufflePlay}
            disabled={songs.length === 0}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer border border-white/10"
            title="Putar Acak Offline"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {songs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              title="Bersihkan Semua Unduhan Akun Ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Hapus Semua</span>
            </button>
          )}
        </div>

        {/* Search within downloads */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu terunduh..."
            className="w-full bg-[#160d2e]/80 border border-purple-500/20 focus:border-emerald-500/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-purple-300/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* 3. CONFIRM CLEAR MODAL */}
      {showClearConfirm && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-200">
            <Trash2 className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              Hapus semua ({songs.length}) lagu terunduh untuk akun <b>{currentUser?.email}</b>? File audio di perangkat ini akan dibersihkan.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
            >
              Batal
            </button>
            <button
              onClick={() => {
                clearAllDownloads();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Ya, Hapus Semua
            </button>
          </div>
        </div>
      )}

      {/* 4. TRACKS LIST */}
      {songs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <ArrowDownToLine className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Belum Ada Lagu Terunduh</h3>
          <p className="text-xs text-[#9d93b8] max-w-md mb-6 leading-relaxed">
            Unduh lagu favoritmu agar dapat diputar kapan saja tanpa koneksi internet. Lagu yang diunduh tersimpan khusus untuk akun <b>{currentUser?.email || "Google kamu"}</b>.
          </p>
          <button
            onClick={() => navigateTo("home")}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            Jelajahi Musik & Unduh Sekarang
          </button>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs">
          Tidak ada lagu terunduh yang cocok dengan pencarian &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="space-y-1">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-[11px] font-bold text-[#8b81a8] uppercase tracking-wider border-b border-white/5 select-none">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 md:col-span-4">Judul Lagu</div>
            <div className="col-span-3 hidden md:block">Album</div>
            <div className="col-span-2 hidden lg:block">Ukuran / Waktu</div>
            <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-2 text-right">Aksi</div>
          </div>

          {/* Song Rows */}
          {filteredSongs.map((song, index) => {
            const isThisPlaying = isPlaying && currentSong?.id === song.id;
            const isLiked = likedSongIds?.includes(song.id);

            return (
              <div
                key={song.id}
                onClick={() =>
                  playSong(song, {
                    id: "downloaded-songs",
                    title: "Lagu Terunduh",
                    songIds: filteredSongs.map((s) => s.id),
                  })
                }
                className={`flex sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-center px-3 sm:px-4 py-2.5 rounded-xl group cursor-pointer transition-colors ${
                  currentSong?.id === song.id
                    ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-300"
                    : "hover:bg-[#180f30]/80 text-[#cbc4de] border border-transparent"
                }`}
              >
                {/* Index / Play indicator */}
                <div className="hidden sm:flex col-span-1 items-center justify-center font-mono text-xs text-[#8a81a4]">
                  {isThisPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 bg-emerald-400 rounded-full animate-eq-1"></span>
                      <span className="w-1 bg-emerald-400 rounded-full animate-eq-2"></span>
                      <span className="w-1 bg-emerald-400 rounded-full animate-eq-3"></span>
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
                    </>
                  )}
                </div>

                {/* Title & Cover */}
                <div className="col-span-6 sm:col-span-5 md:col-span-4 flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={song.cover || "/default-cover.svg"}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (song?.fallbackCover && e.currentTarget.src !== song.fallbackCover) {
                          e.currentTarget.src = song.fallbackCover;
                        } else if (e.currentTarget.src !== "/default-cover.svg") {
                          e.currentTarget.src = "/default-cover.svg";
                        }
                      }}
                    />
                    <div className="absolute top-0 right-0 p-0.5 bg-emerald-500 rounded-bl text-black">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <span
                      className={`font-semibold text-xs sm:text-sm truncate ${
                        currentSong?.id === song.id
                          ? "text-emerald-300 font-bold"
                          : "text-white group-hover:text-emerald-200"
                      }`}
                    >
                      {song.title}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo("artist", {
                          artistName: song.artist,
                          artistInfo: song.artistInfo,
                        });
                      }}
                      className="text-[11px] sm:text-xs text-[#958dae] hover:text-white hover:underline truncate cursor-pointer"
                    >
                      {song.artist}
                    </span>
                  </div>
                </div>

                {/* Album */}
                <div className="col-span-3 hidden md:block text-xs text-[#958dae] truncate">
                  {song.album || "Single"}
                </div>

                {/* Storage size & download date */}
                <div className="col-span-2 hidden lg:flex flex-col text-[11px]">
                  <span className="text-emerald-300 font-mono font-medium">
                    {formatSize(song.storageSize)}
                  </span>
                  <span className="text-[#7e759a] text-[10px]">
                    Diunduh {formatDate(song.downloadedAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-2 flex items-center justify-end gap-2 text-xs shrink-0">
                  <span className="hidden sm:inline-block font-mono text-[11px] text-[#8e84ab] mr-1">
                    {song.duration || "3:30"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddToPlaylistModal(song);
                    }}
                    className="text-[#877e9f] hover:text-purple-300 p-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Tambahkan ke Playlist"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className="text-[#877e9f] hover:text-white p-1"
                    title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? "fill-purple-500 text-purple-500" : ""
                      }`}
                    />
                  </button>

                  {/* Remove download button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDownloadedSong(song.id);
                    }}
                    className="p-1 text-[#877e9f] hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-all"
                    title="Hapus dari Penyimpanan Offline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
