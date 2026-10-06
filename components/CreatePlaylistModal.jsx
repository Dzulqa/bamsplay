"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { X, Sparkles, Music } from "lucide-react";

export default function CreatePlaylistModal() {
  const {
    isCreatePlaylistModalOpen,
    setIsCreatePlaylistModalOpen,
    createNewPlaylist,
    navigateTo,
  } = useAudio();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    if (isCreatePlaylistModalOpen) {
      setTitle("");
      setDescription("");
    }
  }, [isCreatePlaylistModalOpen]);

  if (!isCreatePlaylistModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const pl = createNewPlaylist(title.trim(), description.trim());
    setTitle("");
    setDescription("");
    setIsCreatePlaylistModalOpen(false);
    if (pl?.id) {
      navigateTo("playlist", { playlistId: pl.id });
    }
  };

  return (
    <div
      onClick={() => setIsCreatePlaylistModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#17102e] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2252]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-white">Buat Playlist Baru</h2>
          </div>
          <button
            onClick={() => setIsCreatePlaylistModalOpen(false)}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#251a4a]"
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
              placeholder="Contoh: Lagu Malamku, Vibes 2024"
              className="w-full bg-[#100a20] text-sm text-white placeholder-[#786e97] rounded-lg px-3.5 py-2.5 border border-[#322359] focus:border-purple-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
              Deskripsi (Opsional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan sedikit tentang isi playlist ini..."
              className="w-full bg-[#100a20] text-sm text-white placeholder-[#786e97] rounded-lg px-3.5 py-2 border border-[#322359] focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreatePlaylistModalOpen(false)}
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#a79ebe] hover:text-white hover:bg-[#221742] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-tr from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-md shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all"
            >
              Simpan Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
