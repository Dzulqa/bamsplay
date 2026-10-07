"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  ListMusic,
  Trash2,
  Heart,
  ListPlus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Music,
} from "lucide-react";

export default function QueueView() {
  const {
    currentSong,
    currentPlaylist,
    queue,
    userQueue,
    isPlaying,
    playSong,
    playFromUserQueue,
    moveInUserQueue,
    removeFromUserQueue,
    clearUserQueue,
    togglePlay,
    likedSongIds,
    toggleLike,
    openAddToPlaylistModal,
  } = useAudio();

  const currentIndex = queue.findIndex(
    (s) =>
      s.id === currentSong?.id ||
      (s.title?.toLowerCase().trim() === currentSong?.title?.toLowerCase().trim() &&
        s.artist?.toLowerCase().trim() === currentSong?.artist?.toLowerCase().trim())
  );

  const contextUpcoming =
    currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue.filter((s) => s.id !== currentSong?.id);

  const contextSourceTitle = currentPlaylist?.title || "Katalog Bamsplay";

  return (
    <div className="relative pb-28 select-none max-w-5xl mx-auto px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#251b47]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/30">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Antrean Putar</h1>
            <p className="text-xs text-[#a097bf]">
              Urutan pemutaran audio ala Spotify • Antrean manual diputar lebih dulu
            </p>
          </div>
        </div>

        {userQueue.length > 0 && (
          <button
            onClick={clearUserQueue}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 rounded-full transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kosongkan Antrean ({userQueue.length})
          </button>
        )}
      </div>

      {/* 1. CURRENTLY PLAYING TRACK */}
      <div className="mb-8">
        <h2 className="text-xs font-extrabold text-[#948cae] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          Sedang Memutar
        </h2>

        {currentSong ? (
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-950/60 to-[#1b1236]/80 border border-purple-500/30 rounded-2xl shadow-xl backdrop-blur-md gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-lg border border-purple-500/20">
                <img
                  src={currentSong.cover || "/default-cover.svg"}
                  alt={currentSong.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-cover.svg";
                  }}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1">
                    <span className="w-1 bg-purple-400 rounded-full animate-eq-1 h-3.5"></span>
                    <span className="w-1 bg-purple-400 rounded-full animate-eq-2 h-5"></span>
                    <span className="w-1 bg-purple-400 rounded-full animate-eq-3 h-3"></span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm sm:text-lg text-white block truncate">
                  {currentSong.title}
                </span>
                <span className="text-xs sm:text-sm text-purple-300 font-medium block truncate">
                  {currentSong.artist} • <span className="text-[#a49bbd]">{currentSong.album}</span>
                </span>
                {userQueue.length > 0 && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-bold text-fuchsia-300 bg-fuchsia-950/60 px-2 py-0.5 rounded-full border border-fuchsia-500/30">
                    <Sparkles className="w-3 h-3" /> {userQueue.length} lagu menanti di antrean
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => openAddToPlaylistModal(currentSong)}
                className="p-2 text-[#a298be] hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition-all"
                title="Tambahkan ke Playlist"
              >
                <ListPlus className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleLike(currentSong)}
                className="p-2 text-[#a298be] hover:text-white hover:bg-purple-950/40 rounded-xl transition-all"
                title={likedSongIds.includes(currentSong.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    likedSongIds.includes(currentSong.id)
                      ? "fill-purple-500 text-purple-500"
                      : ""
                  }`}
                />
              </button>
              <button
                onClick={togglePlay}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white flex items-center justify-center purple-glow-sm hover:scale-105 active:scale-95 transition-all shadow-lg ml-1"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-[#877e9f] bg-[#140e2b] rounded-xl border border-[#231945]">
            Belum ada musik yang sedang diputar.
          </div>
        )}
      </div>

      {/* 2. USER MANUAL QUEUE (PRIORITY 1) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Berikutnya Dalam Antrean ({userQueue.length})
            </h2>
            <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/30">
              Prioritas Utama
            </span>
          </div>

          {userQueue.length > 0 && (
            <button
              onClick={clearUserQueue}
              className="text-xs text-[#9d93be] hover:text-red-300 transition-colors"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {userQueue.length === 0 ? (
          <div className="py-6 px-4 text-center text-xs text-[#877e9f] bg-[#140e2a]/50 rounded-xl border border-dashed border-[#2b204e] flex flex-col items-center justify-center gap-1.5">
            <Music className="w-5 h-5 text-purple-400/60" />
            <p className="font-semibold text-[#b3aacd]">Tidak ada lagu dalam antrean manual.</p>
            <p className="text-[11px] text-[#7d7596]">
              Klik tombol (+) atau ikon titik tiga pada lagu mana pun untuk memasukkannya ke antrean ini.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {userQueue.map((song, idx) => {
              const isLiked = likedSongIds.includes(song.id);

              return (
                <div
                  key={`user-q-${song.id}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/40 group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Position Number */}
                    <span className="w-6 text-center text-xs font-mono font-bold text-purple-300">
                      {idx + 1}
                    </span>

                    {/* Album Cover & Play on Click */}
                    <div
                      onClick={() => playFromUserQueue(idx)}
                      className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer shadow group/cover"
                    >
                      <img
                        src={song.cover || "/default-cover.svg"}
                        alt={song.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-cover.svg";
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div
                      onClick={() => playFromUserQueue(idx)}
                      className="min-w-0 cursor-pointer flex-1"
                    >
                      <span className="font-bold text-sm text-white group-hover:text-purple-300 block truncate">
                        {song.title}
                      </span>
                      <span className="text-xs text-[#9d94b8] block truncate">
                        {song.artist} • <span className="text-[#7d7596]">{song.album || "Single"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions: Reorder, Playlist, Like, Delete */}
                  <div className="flex items-center gap-1 sm:gap-2 text-xs shrink-0">
                    {/* Move Up */}
                    <button
                      disabled={idx === 0}
                      onClick={() => moveInUserQueue(idx, idx - 1)}
                      className={`p-1 rounded hover:bg-purple-900/40 transition-colors ${
                        idx === 0 ? "text-[#544d6b] cursor-not-allowed" : "text-[#9d94b8] hover:text-white"
                      }`}
                      title="Geser ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      disabled={idx === userQueue.length - 1}
                      onClick={() => moveInUserQueue(idx, idx + 1)}
                      className={`p-1 rounded hover:bg-purple-900/40 transition-colors ${
                        idx === userQueue.length - 1
                          ? "text-[#544d6b] cursor-not-allowed"
                          : "text-[#9d94b8] hover:text-white"
                      }`}
                      title="Geser ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openAddToPlaylistModal(song)}
                      className="p-1 text-[#9d94b8] hover:text-purple-300 transition-colors"
                      title="Tambahkan ke Playlist"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleLike(song)}
                      className="p-1 text-[#9d94b8] hover:text-white transition-colors"
                      title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-purple-500 text-purple-500" : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => removeFromUserQueue(idx)}
                      className="p-1 text-[#9d94b8] hover:text-red-400 transition-colors"
                      title="Hapus dari Antrean"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="font-mono text-[#8a81a4] ml-1 hidden sm:inline">
                      {song.duration || "3:30"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. CONTEXT UPCOMING TRACKS (PRIORITY 2) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="text-[11px] font-bold text-[#8d84a7] uppercase tracking-wider shrink-0">
              Berikutnya Dari:
            </span>
            <span className="text-xs font-black text-purple-300 truncate max-w-[200px] sm:max-w-xs">
              {contextSourceTitle}
            </span>
            <span className="text-[11px] font-bold text-[#8d84a7] shrink-0">
              ({contextUpcoming.length})
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#786f91]">
            {userQueue.length > 0 ? "Diputar setelah antrean manual habis" : "Urutan pemutaran aktif"}
          </span>
        </div>

        {contextUpcoming.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#877e9f] bg-[#140e2b] rounded-xl border border-[#231945]">
            Tidak ada lagu berikutnya di daftar putar ini.
          </div>
        ) : (
          <div className="space-y-1">
            {contextUpcoming.map((song, idx) => {
              const isLiked = likedSongIds.includes(song.id);

              return (
                <div
                  key={`context-${song.id}-${idx}`}
                  onClick={() => playSong(song, currentPlaylist)}
                  className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#140e2a]/60 hover:bg-[#20163f] border border-transparent hover:border-purple-500/20 cursor-pointer group transition-all gap-2"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-[#776f8e] shrink-0 group-hover:hidden">
                      {idx + 1}
                    </span>
                    <div className="w-5 text-center text-xs text-purple-300 hidden group-hover:block shrink-0">
                      <Play className="w-3.5 h-3.5 fill-purple-400 mx-auto" />
                    </div>

                    <img
                      src={song.cover || "/default-cover.svg"}
                      alt={song.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-cover.svg";
                      }}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                    />

                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-xs sm:text-sm text-white group-hover:text-purple-300 block truncate">
                        {song.title}
                      </span>
                      <span className="text-[11px] sm:text-xs text-[#8f86a8] block truncate">
                        {song.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 text-xs shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylistModal(song);
                      }}
                      className="text-[#887f9e] hover:text-purple-300 p-1.5 rounded-lg active:scale-95"
                      title="Tambahkan ke Playlist"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song);
                      }}
                      className="text-[#887f9e] hover:text-white p-1.5 rounded-lg active:scale-95"
                      title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-purple-500 text-purple-500" : ""
                        }`}
                      />
                    </button>
                    <span className="font-mono text-[#8a81a4] text-[11px] sm:text-xs w-9 text-right">
                      {song.duration || "3:30"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
