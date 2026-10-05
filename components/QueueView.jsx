"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import { Play, Pause, ListMusic, Trash2, Heart, ListPlus } from "lucide-react";

export default function QueueView() {
  const {
    currentSong,
    queue,
    isPlaying,
    playSong,
    togglePlay,
    likedSongIds,
    toggleLike,
    showToast,
    openAddToPlaylistModal,
    clearQueue,
    removeFromQueue,
  } = useAudio();

  const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
  const nextSongs =
    currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue;

  return (
    <div className="relative pb-24 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#251b47]">
        <div className="w-10 h-10 rounded-full bg-purple-700/40 flex items-center justify-center text-purple-300 border border-purple-500/30">
          <ListMusic className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Antrean Putar</h1>
          <p className="text-xs text-[#9c93be]">
            Atur dan lihat urutan lagu yang akan diputar berikutnya
          </p>
        </div>
      </div>

      {/* Currently Playing Track */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-[#8d84a7] uppercase tracking-wider mb-3">
          Sedang Memutar
        </h2>

        {currentSong && (
          <div className="flex items-center justify-between p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl shadow-lg">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-md">
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
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                    <span className="w-1 bg-purple-400 rounded-full animate-eq-1"></span>
                    <span className="w-1 bg-purple-400 rounded-full animate-eq-2"></span>
                    <span className="w-1 bg-purple-400 rounded-full animate-eq-3"></span>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <span className="font-bold text-base text-white block truncate">
                  {currentSong.title}
                </span>
                <span className="text-xs text-purple-300 block truncate">
                  {currentSong.artist} • {currentSong.album}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => openAddToPlaylistModal(currentSong)}
                  className="p-1 text-[#988fb1] hover:text-purple-300"
                  title="Tambahkan ke Playlist"
                >
                  <ListPlus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleLike(currentSong)}
                  className="p-1 text-[#988fb1] hover:text-white"
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
              </div>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white flex items-center justify-center purple-glow-sm"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Next Up in Queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#8d84a7] uppercase tracking-wider">
            Berikutnya dari Daftar Putar ({nextSongs.length})
          </h2>
          {nextSongs.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-[#9d93be] hover:text-white transition-colors"
            >
              Kosongkan Antrean
            </button>
          )}
        </div>

        {nextSongs.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#877e9f] bg-[#140e2b] rounded-xl border border-[#231945]">
            Tidak ada lagu berikutnya dalam antrean.
          </div>
        ) : (
          <div className="space-y-1">
            {nextSongs.map((song, idx) => {
              const isLiked = likedSongIds.includes(song.id);

              return (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => playSong(song)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#140e2a]/60 hover:bg-[#20163f] border border-transparent hover:border-purple-500/20 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center text-xs font-mono text-[#776f8e]">
                      {idx + 1}
                    </span>

                    <img
                      src={song.cover || "/default-cover.svg"}
                      alt={song.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-cover.svg";
                      }}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-white group-hover:text-purple-300 block truncate">
                        {song.title}
                      </span>
                      <span className="text-xs text-[#8f86a8] block truncate">
                        {song.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylistModal(song);
                      }}
                      className="text-[#887f9e] hover:text-purple-300"
                      title="Tambahkan ke Playlist"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song);
                      }}
                      className="text-[#887f9e] hover:text-white"
                      title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-purple-500 text-purple-500" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const realIndex = currentIndex !== -1 ? currentIndex + 1 + idx : idx;
                        removeFromQueue(realIndex);
                      }}
                      className="text-[#887f9e] hover:text-red-400 transition-colors p-1"
                      title="Hapus dari Antrean"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[#8a81a4]">
                      {song.duration}
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
