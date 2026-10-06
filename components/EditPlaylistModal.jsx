"use client";

import React, { useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import { Edit3, X, Check } from "lucide-react";

export default function EditPlaylistModal() {
  const {
    isEditPlaylistModalOpen,
    playlistToEdit,
    closeEditPlaylistModal,
    updatePlaylist,
  } = useAudio();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (playlistToEdit) {
      setTitle(playlistToEdit.title || "");
      setDescription(playlistToEdit.description || "");
    }
  }, [playlistToEdit, isEditPlaylistModalOpen]);

  if (!isEditPlaylistModalOpen || !playlistToEdit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    updatePlaylist(playlistToEdit.id, {
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <div
      onClick={closeEditPlaylistModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#160d2e] border border-purple-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-20 bg-purple-600/20 rounded-full blur-2xl pointer-events-none -mt-6" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2252] relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Edit3 className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-white">Edit Playlist</h2>
          </div>
          <button
            onClick={closeEditPlaylistModal}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
              Nama Playlist
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan nama playlist..."
              className="w-full bg-[#0f0820] text-sm text-white placeholder-[#786e97] rounded-lg px-3.5 py-2.5 border border-[#322359] focus:border-purple-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tulis deskripsi playlist..."
              className="w-full bg-[#0f0820] text-sm text-white placeholder-[#786e97] rounded-lg px-3.5 py-2 border border-[#322359] focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeEditPlaylistModal}
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#a79ebe] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-tr from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-md shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
