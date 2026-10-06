"use client";

import React, { useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import UserAvatar from "./UserAvatar";
import { X, User, Calendar, ShieldCheck, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function EditProfileModal() {
  const {
    isEditProfileModalOpen,
    setIsEditProfileModalOpen,
    currentUser,
    updateUsername,
    getUsernameChangeStatus,
  } = useAudio();

  const [newName, setNewName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const status = getUsernameChangeStatus();

  useEffect(() => {
    if (currentUser?.name) {
      setNewName(currentUser.name);
    }
    setErrorMsg("");
  }, [currentUser, isEditProfileModalOpen]);

  if (!isEditProfileModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!status.canChange) {
      setErrorMsg(`Cooldown aktif! Kamu baru bisa mengubah username lagi dalam ${status.remainingDays} hari.`);
      return;
    }

    if (!newName.trim() || newName.trim().length < 2) {
      setErrorMsg("Username minimal 2 karakter.");
      return;
    }

    if (newName.trim() === currentUser?.name) {
      setErrorMsg("Username baru sama dengan username saat ini.");
      return;
    }

    const result = updateUsername(newName.trim());
    if (result.success) {
      setIsEditProfileModalOpen(false);
    } else {
      setErrorMsg(result.message || "Gagal mengubah username");
    }
  };

  const initial = (currentUser?.name || currentUser?.email || "U")[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#130b26] border border-purple-500/25 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden animate-scaleUp"
      >
        {/* Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-28 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -mt-8" />

        {/* Close Button */}
        <button
          onClick={() => {
            setIsEditProfileModalOpen(false);
            setErrorMsg("");
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-white/10 mb-5">
          <UserAvatar user={currentUser} size="lg" showGoogleBadge={true} />

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Pengaturan Profil</span>
            </h2>
            <p className="text-xs text-purple-300/80 truncate">
              {currentUser?.email || "Akun Google"}
            </p>
          </div>
        </div>

        {/* 14-Day Status Card */}
        <div className={`p-3.5 rounded-xl border mb-5 ${
          status.canChange
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-amber-950/20 border-amber-500/30 text-amber-300"
        }`}>
          <div className="flex items-start gap-2.5">
            {status.canChange ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>Aturan 14 Hari Sekali:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  status.canChange
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}>
                  {status.canChange ? "Bisa Diubah Sekarang" : `Tersisa ${status.remainingDays} Hari`}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {status.canChange
                  ? "Kamu dapat mengganti username sekarang. Setelah disimpan, kamu baru bisa menggantinya lagi 14 hari kemudian."
                  : `Kamu baru saja mengubah username. Perubahan berikutnya baru bisa dilakukan pada tanggal ${status.nextDate} (${status.remainingDays} hari lagi).`}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-purple-200/90 mb-1.5 block">
              Username Tampilan
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8a80a4] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newName}
                disabled={!status.canChange}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                maxLength={25}
                placeholder="Masukkan username baru..."
                className={`w-full bg-[#180e30] border rounded-xl pl-10 pr-12 py-2.5 text-sm text-white outline-none transition-all placeholder-[#71678b] ${
                  status.canChange
                    ? "border-white/10 focus:border-purple-400 focus:bg-[#20133f]"
                    : "border-white/5 opacity-60 cursor-not-allowed"
                }`}
                autoFocus={status.canChange}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-mono">
                {newName.length}/25
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Nama ini akan ditampilkan di pojok kanan atas dan daftar putar yang kamu buat.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsEditProfileModalOpen(false);
                setErrorMsg("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!status.canChange}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center gap-1.5 ${
                status.canChange
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
