"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Mic2,
  ListMusic,
  ListPlus,
  Laptop2,
  Maximize2,
  Minimize2,
  Activity,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    likedSongIds,
    activeView,
    activeViewData,
    queue,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    setIsDeviceModalOpen,
    setIsAudioQualityModalOpen,
    audioQuality,
    setIsMobilePlayerOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleLike,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    navigateTo,
    showToast,
    openAddToPlaylistModal,
  } = useAudio();

  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!currentSong) return null;

  const isLiked = likedSongIds.includes(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || secs === undefined) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleProgressMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const hoverTime = Math.max(0, Math.min(pos * duration, duration));
    setHoverSeekTime(hoverTime);
  };

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      showToast("Layar penuh aktif", "default");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <>
      {/* 1. Mobile Floating Mini-Player Pill (< md) */}
      <div className="md:hidden px-3 pb-2 pt-1 select-none z-30">
        <div
          onClick={() => setIsMobilePlayerOpen(true)}
          className="h-14 bg-[#140c2a]/95 backdrop-blur-xl border border-purple-500/25 rounded-2xl px-3 flex items-center justify-between shadow-2xl cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={currentSong.cover || "/default-cover.svg"}
              alt={currentSong.title}
              className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-md"
              onError={(e) => {
                if (currentSong?.fallbackCover && e.currentTarget.src !== currentSong.fallbackCover) {
                  e.currentTarget.src = currentSong.fallbackCover;
                } else if (e.currentTarget.src !== "/default-cover.svg") {
                  e.currentTarget.src = "/default-cover.svg";
                }
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-white truncate block">
                {currentSong.title}
              </span>
              <span className="text-[11px] text-purple-300/80 truncate block">
                {currentSong.artist}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => toggleLike(currentSong)}
              className="p-1.5 text-[#9a91b4] hover:text-white"
              title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "fill-purple-500 text-purple-500" : ""
                }`}
              />
            </button>

            <button
              onClick={() => openAddToPlaylistModal(currentSong)}
              className="p-1.5 text-[#9a91b4] hover:text-purple-300"
              title="Tambahkan ke Playlist"
            >
              <ListPlus className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white flex items-center justify-center purple-glow-sm active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-950/60">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Desktop Bottom Player Dock (>= md) */}
      <footer className="hidden md:flex h-20 bg-[#0b0617]/95 backdrop-blur-xl border-t border-purple-500/15 px-6 items-center justify-between z-40 select-none shrink-0 shadow-2xl">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px] max-w-[320px]">
          <div
            onClick={() => navigateTo("lyrics")}
            className="relative group cursor-pointer w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg border border-purple-500/20"
            title="Buka Lirik"
          >
            <img
              src={currentSong.cover || "/default-cover.svg"}
              alt={currentSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                if (currentSong?.fallbackCover && e.currentTarget.src !== currentSong.fallbackCover) {
                  e.currentTarget.src = currentSong.fallbackCover;
                } else if (e.currentTarget.src !== "/default-cover.svg") {
                  e.currentTarget.src = "/default-cover.svg";
                }
              }}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5 pointer-events-none">
                <span className="w-1 bg-purple-400 rounded-full animate-eq-1"></span>
                <span className="w-1 bg-purple-400 rounded-full animate-eq-2"></span>
                <span className="w-1 bg-purple-400 rounded-full animate-eq-3"></span>
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span
              onClick={() => navigateTo("lyrics")}
              className="font-bold text-sm text-gray-100 hover:text-purple-300 hover:underline truncate cursor-pointer transition-colors"
            >
              {currentSong.title}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                onClick={() =>
                  navigateTo("artist", {
                    artistName: currentSong.artist,
                    artistInfo: currentSong.artistInfo,
                  })
                }
                className="text-xs text-[#9d94b8] hover:text-white hover:underline truncate cursor-pointer transition-colors"
              >
                {currentSong.artist}
              </span>
              <button
                onClick={() => setIsAudioQualityModalOpen(true)}
                className="px-1.5 py-0.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-300 hover:text-white rounded text-[9px] font-mono font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1"
                title="Buka Pengaturan Kualitas Suara"
                suppressHydrationWarning
              >
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                <span suppressHydrationWarning>
                  {audioQuality === "lossless"
                    ? "320k HiFi"
                    : audioQuality === "high"
                    ? "160k HD"
                    : audioQuality === "normal"
                    ? "96k"
                    : audioQuality === "low"
                    ? "24k"
                    : "AUTO"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => toggleLike(currentSong)}
              className="p-1.5 text-[#9d94b8] hover:text-white transition-transform active:scale-125 focus:outline-none"
              title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-150 ${
                  isLiked ? "fill-purple-500 text-purple-500" : "hover:text-purple-300"
                }`}
              />
            </button>

            <button
              onClick={() => addToQueue(currentSong)}
              className="p-1.5 text-[#9d94b8] hover:text-purple-300 transition-colors focus:outline-none"
              title="Tambahkan ke Antrean"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAddToPlaylistModal(currentSong)}
              className="p-1.5 text-[#9d94b8] hover:text-purple-300 transition-colors focus:outline-none"
              title="Tambahkan ke Playlist"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[620px] px-4">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`relative p-1 text-sm transition-colors ${
                isShuffle ? "text-purple-400" : "text-[#8e85a6] hover:text-white"
              }`}
              title="Acak Lagu"
            >
              <Shuffle className="w-4 h-4" />
              {isShuffle && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"></span>
              )}
            </button>

            <button
              onClick={prevTrack}
              className="text-[#bbb3d3] hover:text-white active:scale-95 transition-transform"
              title="Sebelumnya"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Bamsplay Signature Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white flex items-center justify-center purple-glow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              title={isPlaying ? "Jeda" : "Putar"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-[#bbb3d3] hover:text-white active:scale-95 transition-transform"
              title="Berikutnya"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`relative p-1 text-sm transition-colors ${
                repeatMode !== "off" ? "text-purple-400" : "text-[#8e85a6] hover:text-white"
              }`}
              title={`Ulangi (${repeatMode})`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatMode !== "off" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div className="w-full flex items-center gap-2.5 text-xs font-mono text-[#827a9c]">
            <span className="w-8 text-right tabular-nums text-[11px]">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 group py-1 cursor-pointer flex items-center"
              onMouseEnter={() => setIsHoveringProgress(true)}
              onMouseLeave={() => {
                setIsHoveringProgress(false);
                setHoverSeekTime(null);
              }}
              onMouseMove={handleProgressMouseMove}
            >
              {isHoveringProgress && hoverSeekTime !== null && (
                <div
                  className="absolute -top-6 px-1.5 py-0.5 bg-[#1f1338] text-white rounded text-[10px] font-mono shadow-md border border-purple-500/30 -translate-x-1/2 pointer-events-none"
                  style={{
                    left: `${(hoverSeekTime / (duration || 1)) * 100}%`,
                  }}
                >
                  {formatTime(hoverSeekTime)}
                </div>
              )}

              <div className="w-full h-1 bg-purple-950/50 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 group-hover:from-purple-500 group-hover:to-fuchsia-400 transition-colors"
                  style={{
                    width: `${progressPercent}%`,
                    transition: isHoveringProgress ? "none" : "width 120ms linear",
                  }}
                />
              </div>

              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.5"
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="w-8 text-left tabular-nums text-[11px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Tools & Volume */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px] text-[#958dae]">
          <button
            onClick={() => navigateTo(activeView === "lyrics" ? "home" : "lyrics")}
            className={`p-2 rounded-xl hover:text-white transition-colors ${
              activeView === "lyrics" ? "text-purple-400 bg-purple-950/60 border border-purple-500/30" : "hover:bg-purple-950/30"
            }`}
            title="Lirik Lagu"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo(activeView === "queue" ? "home" : "queue")}
            className={`p-2 rounded-xl hover:text-white transition-colors ${
              activeView === "queue" ? "text-purple-400 bg-purple-950/60 border border-purple-500/30" : "hover:bg-purple-950/30"
            }`}
            title="Antrean Musik"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAudioQualityModalOpen(true)}
            className="p-2 rounded-xl hover:text-white hover:bg-purple-950/30 transition-colors relative"
            title="Pengaturan Kualitas Suara (Audio Master & EQ)"
          >
            <Sliders className="w-4 h-4 text-purple-300" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
          </button>

          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className="p-2 rounded-xl hover:text-white hover:bg-purple-950/30 transition-colors"
            title="Perangkat Output"
          >
            <Laptop2 className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 group w-24">
            <button
              onClick={toggleMute}
              className="hover:text-white transition-colors"
              title={isMuted ? "Bunyikan" : "Bisukan"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-purple-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div className="relative flex-1 flex items-center">
              <div className="w-full h-1 bg-purple-950/50 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
                <div
                  className="h-full bg-purple-300 group-hover:bg-purple-400 transition-colors"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isRightSidebarOpen
                ? "text-purple-400 bg-purple-950/60 border border-purple-500/30"
                : "hover:text-white hover:bg-purple-950/30"
            }`}
            title="Panel Detail Lagu"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreenMode}
            className="p-2 rounded-xl hover:text-white hover:bg-purple-950/30 transition-colors"
            title="Layar Penuh"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </footer>
    </>
  );
}
