"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioContext";
import { X, Check, UserPlus, Sparkles, ShieldCheck, Mail, ArrowRight, Loader2 } from "lucide-react";
import BamsplayLogo from "./BamsplayLogo";
import UserAvatar from "./UserAvatar";

export default function LoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    currentUser,
    savedAccounts,
    loginWithGoogle,
    showToast,
  } = useAudio();

  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "1001756107523-42k5ruelt3n2e4oh9i6siv7blehreh7g.apps.googleusercontent.com";

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!isLoginModalOpen) return;

    function initGoogle() {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "filled_blue",
              size: "large",
              type: "standard",
              shape: "pill",
              text: "continue_with",
              logo_alignment: "left",
              width: 320,
            });
          }
        } catch (err) {
          console.warn("Google Sign-In init error:", err);
        }
      }
    }

    // Try immediately or retry if GSI script is still loading
    initGoogle();
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current?.children.length === 0) {
        initGoogle();
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isLoginModalOpen]);

  const handleGoogleCredentialResponse = async (response) => {
    setIsGoogleLoading(true);
    try {
      if (response?.credential) {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential, clientId }),
        });
        const data = await res.json();

        if (data?.success && data?.user) {
          loginWithGoogle(data.user.email, data.user.name, data.user.avatar);
          showToast(`Berhasil masuk sebagai ${data.user.name || data.user.email}`, "purple");
          setIsLoginModalOpen(false);
        } else {
          setErrorMsg(data?.error || "Gagal masuk dengan Google");
        }
      }
    } catch (err) {
      console.error("Google sign-in response error:", err);
      setErrorMsg("Koneksi ke Google gagal");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleManualGooglePopup = () => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is skipped or blocked by browser popup setting, open custom input
          setIsCustomMode(true);
        }
      });
    } else {
      setIsCustomMode(true);
    }
  };

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputEmail.trim()) {
      setErrorMsg("Harap masukkan alamat Gmail kamu");
      return;
    }

    let email = inputEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      email = `${email}@gmail.com`;
    }

    loginWithGoogle(email, inputName);
    setInputEmail("");
    setInputName("");
    setErrorMsg("");
  };

  const handleQuickSelect = (account) => {
    loginWithGoogle(account.email, account.name, account.avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#130b26] border border-purple-500/25 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden animate-scaleUp"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -mt-10" />

        {/* Close Button */}
        <button
          onClick={() => {
            setIsLoginModalOpen(false);
            setErrorMsg("");
            setIsCustomMode(false);
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1b1035] border border-purple-500/30 flex items-center justify-center shadow-lg p-2.5">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Masuk dengan Akun Google
            </h2>
            <p className="text-xs text-purple-200/70 mt-1 max-w-xs">
              Playlist, lagu favorit, dan preferensi musikmu akan otomatis tersimpan di akun Gmail ini.
            </p>
          </div>
        </div>

        {/* Official Google Sign-In Button */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center w-full" />
          {isGoogleLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 mt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memverifikasi akun Google...</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-purple-300/60 uppercase font-bold tracking-wider">
            atau pilih akun
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Saved Accounts List */}
        {!isCustomMode && savedAccounts && savedAccounts.length > 0 && (
          <div className="space-y-3 mb-5">
            <span className="text-[11px] font-bold text-[#8d83a7] uppercase tracking-wider block">
              Pilih Akun Tersimpan
            </span>

            <div className="space-y-2">
              {savedAccounts.map((acc) => {
                const isCurrent = currentUser?.email?.toLowerCase() === acc.email?.toLowerCase();
                const initial = (acc.name || acc.email || "U").charAt(0).toUpperCase();

                return (
                  <div
                    key={acc.email}
                    onClick={() => handleQuickSelect(acc)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-purple-600/20 border-purple-500/50 shadow-sm"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={acc} size="md" />

                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                          <span>{acc.name || "Pengguna Bamsplay"}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/30 text-purple-300 font-medium">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#938ba8] truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#8d83a7]" />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsCustomMode(true)}
              className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-950/20 text-xs font-bold text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gunakan Akun Gmail Lain</span>
            </button>
          </div>
        )}

        {/* Custom Input Form (Brand new account) */}
        {(isCustomMode || !savedAccounts || savedAccounts.length === 0) && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <div>
              <label className="text-[11px] font-bold text-purple-200/80 mb-1.5 block">
                Alamat Gmail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a80a4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="contoh: namamu@gmail.com"
                  className="w-full bg-[#180e30] border border-white/10 focus:border-purple-400 focus:bg-[#20133f] text-sm text-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder-[#71678b]"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-purple-200/80 mb-1.5 block">
                Nama Tampilan (Opsional)
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Nama kamu di Bamsplay"
                className="w-full bg-[#180e30] border border-white/10 focus:border-purple-400 focus:bg-[#20133f] text-sm text-white rounded-xl px-4 py-2.5 outline-none transition-all placeholder-[#71678b]"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-950/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {savedAccounts && savedAccounts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(false);
                  setErrorMsg("");
                }}
                className="w-full text-center text-xs text-[#9d93b9] hover:text-white pt-1 transition-colors cursor-pointer"
              >
                Kembali ke daftar akun tersimpan
              </button>
            )}
          </form>
        )}

        {/* Footer Guarantee */}
        <div className="pt-3 border-t border-purple-500/15 flex items-center justify-center gap-2 text-[11px] text-[#8e84a8]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Data musikmu aman dan terisolasi khusus untuk akun Gmail kamu</span>
        </div>
      </div>
    </div>
  );
}
