"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import { Trash2, X, AlertTriangle } from "lucide-react";

export default function DeletePlaylistModal() {
  const {
    isDeletePlaylistModalOpen,
    playlistToDelete,
    closeDeletePlaylistModal,
    deletePlaylist,
  } = useAudio();

  if (!isDeletePlaylistModalOpen || !playlistToDelete) return null;

  const handleDelete = () => {
    deletePlaylist(playlistToDelete.id);
  };

  return (
    <div
      onClick={closeDeletePlaylistModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#160b24] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Atmospheric Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-20 bg-rose-600/20 rounded-full blur-2xl pointer-events-none -mt-6" />

        {/* Header */}
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                Hapus Playlist?
              </h2>
              <p className="text-xs text-rose-300/80 font-medium">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          <button
            onClick={closeDeletePlaylistModal}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Body */}
        <div className="bg-[#0f0719]/80 border border-white/5 rounded-xl p-3.5 text-xs text-[#cbc5dc] leading-relaxed space-y-1">
          <p>
            Apakah kamu yakin ingin menghapus playlist{" "}
            <span className="font-bold text-white px-1.5 py-0.5 rounded bg-white/10 text-rose-200">
              {playlistToDelete.title}
            </span>
            ?
          </p>
          <p className="text-[11px] text-[#8e85a6]">
            Lagu-lagu di dalam playlist ini tetap aman di Bamsplay, tetapi daftar putar ini akan dihapus secara permanen dari koleksimu.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={closeDeletePlaylistModal}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-[#a79ebe] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
}
