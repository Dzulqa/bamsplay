"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  X,
  Heart,
  CheckCircle2,
  Disc3,
  ArrowRight,
  ListPlus,
} from "lucide-react";

export default function RightSidebar() {
  const {
    currentSong,
    queue,
    likedSongIds,
    toggleLike,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    navigateTo,
    showToast,
    openAddToPlaylistModal,
  } = useAudio();

  const [isFollowing, setIsFollowing] = useState(false);

  if (!isRightSidebarOpen || !currentSong) return null;

  const isLiked = likedSongIds.includes(currentSong.id);
  const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
  const nextSong =
    currentIndex !== -1 && currentIndex < queue.length - 1
      ? queue[currentIndex + 1]
      : queue[0];

  const artistInfo = currentSong.artistInfo || {
    name: currentSong.artist,
    monthlyListeners: "5.2M pendengar bulanan",
    bio: "Penyanyi dan musisi berbakat di Bamsplay.",
    avatar: currentSong.cover,
    verified: true,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsRightSidebarOpen(false)}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 h-full bg-[#0e071e] border-l border-purple-500/20 flex flex-col min-h-0 select-none shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-purple-500/15">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              Detail Sedang Memutar
            </h3>
          </div>
          <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[#958dae] hover:text-white hover:bg-purple-950/40 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Big Artwork */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20 group">
            <img
              src={currentSong.cover || "/default-cover.svg"}
              alt={currentSong.title}
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                if (currentSong?.fallbackCover && e.currentTarget.src !== currentSong.fallbackCover) {
                  e.currentTarget.src = currentSong.fallbackCover;
                } else if (e.currentTarget.src !== "/default-cover.svg") {
                  e.currentTarget.src = "/default-cover.svg";
                }
              }}
            />
          </div>

          {/* Title & Artist */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <h2 className="text-xl font-black text-white hover:underline cursor-pointer truncate">
                {currentSong.title}
              </h2>
              <p
                onClick={() => {
                  setIsRightSidebarOpen(false);
                  navigateTo("artist", {
                    artistName: currentSong.artist,
                    artistInfo: currentSong.artistInfo,
                  });
                }}
                className="text-xs text-purple-300/80 hover:text-white hover:underline cursor-pointer truncate mt-0.5"
              >
                {currentSong.artist} • {currentSong.album}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openAddToPlaylistModal(currentSong)}
                className="p-2 text-[#9f96ba] hover:text-purple-300 transition-colors"
                title="Tambahkan ke Playlist"
              >
                <ListPlus className="w-5 h-5" />
              </button>

              <button
                onClick={() => toggleLike(currentSong)}
                className="p-2 text-[#9f96ba] hover:text-white transition-transform active:scale-125"
                title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLiked ? "fill-purple-500 text-purple-500" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* About The Artist Card */}
          <div className="bg-[#150d2b] rounded-2xl p-4 border border-purple-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                  <span>{artistInfo.name}</span>
                  {artistInfo.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  )}
                </div>
                <div className="text-[11px] text-[#8f87a8] mt-0.5">
                  {artistInfo.monthlyListeners}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsFollowing(!isFollowing);
                  showToast(
                    isFollowing ? `Batal mengikuti` : `Mengikuti ${artistInfo.name}`,
                    "purple"
                  );
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isFollowing
                    ? "bg-[#251a4a] text-purple-300 border border-purple-500/40"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isFollowing ? "Mengikuti" : "Ikuti"}
              </button>
            </div>

            <p className="text-xs text-[#aba3c7] leading-relaxed">
              {artistInfo.bio}
            </p>
          </div>



          {/* Next Up Card */}
          {nextSong && (
            <div className="bg-[#150d2b] rounded-2xl p-4 border border-purple-500/15">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Berikutnya
                </span>
                <button
                  onClick={() => {
                    setIsRightSidebarOpen(false);
                    navigateTo("queue");
                  }}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline"
                >
                  Buka Antrean
                </button>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={nextSong.cover || "/default-cover.svg"}
                  alt={nextSong.title}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 shadow"
                  onError={(e) => {
                    if (nextSong?.fallbackCover && e.currentTarget.src !== nextSong.fallbackCover) {
                      e.currentTarget.src = nextSong.fallbackCover;
                    } else if (e.currentTarget.src !== "/default-cover.svg") {
                      e.currentTarget.src = "/default-cover.svg";
                    }
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {nextSong.title}
                  </div>
                  <div className="text-[11px] text-[#8f87a8] truncate">
                    {nextSong.artist}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
