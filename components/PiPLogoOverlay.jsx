"use client";

import React, { useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import UserAvatar from "./UserAvatar";

/**
 * PiPLogoOverlay
 * Renders a compact, glowing floating widget with the Bamsplay logo
 * and user account avatar when running in Android Picture-in-Picture mode.
 *
 * Guaranteed safe: If window is full screen (> 340px), this component
 * strictly returns null so it can NEVER get stuck on screen.
 */
export default function PiPLogoOverlay() {
  const [isPiP, setIsPiP] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const { isPlaying, currentSong, currentUser } = useAudio();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateState = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWindowDimensions({ width: w, height: h });

      // Safety: If window is larger than a floating window (> 340px), immediately disable PiP mode
      if (w > 340 || h > 340) {
        setIsPiP(false);
        return;
      }

      // Check native AndroidBridge if available
      if (window.AndroidBridge && typeof window.AndroidBridge.isInPiP === "function") {
        try {
          const nativePiP = window.AndroidBridge.isInPiP();
          setIsPiP(Boolean(nativePiP));
          return;
        } catch (_) {}
      }

      // Dimension-based detection for floating windows
      if (w > 0 && w <= 320 && h <= 320) {
        setIsPiP(true);
      }
    };

    // Native callback invoked by MainActivity.java
    window.__setPiPMode = (active) => {
      if (!active) {
        setIsPiP(false);
      } else {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w <= 340 && h <= 340) {
          setIsPiP(true);
        } else {
          setIsPiP(false);
        }
      }
    };

    updateState();

    window.addEventListener("resize", updateState);
    window.addEventListener("orientationchange", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
      window.removeEventListener("orientationchange", updateState);
      delete window.__setPiPMode;
    };
  }, []);

  // Strict Safety Guard 1: Not in PiP? Don't render.
  if (!isPiP) return null;

  // Strict Safety Guard 2: Screen is larger than floating window? Don't render.
  if (windowDimensions.width > 340 || windowDimensions.height > 340) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999999] bg-[#0b0813] flex flex-col items-center justify-center p-2 select-none overflow-hidden pointer-events-none"
      style={{ backgroundColor: "#0b0813" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated ambient glow when playing */}
        {isPlaying && (
          <div className="absolute w-20 h-20 rounded-full bg-purple-600/40 blur-md animate-pulse" />
        )}

        {/* Bamsplay Floating Circle Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bamsplay-logo-circle.png"
          alt="Bamsplay"
          className={`w-14 h-14 object-contain relative z-10 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(147,51,234,0.7)] ${
            isPlaying ? "scale-100" : "scale-90 opacity-75"
          }`}
        />

        {/* User Account Avatar Badge (Logo Akun) */}
        {currentUser && (
          <div className="absolute -bottom-1 -right-1 z-20 ring-2 ring-[#0b0813] rounded-full shadow-lg scale-75">
            <UserAvatar user={currentUser} size="sm" showGoogleBadge={false} />
          </div>
        )}
      </div>

      {/* Track title badge */}
      {currentSong?.title && (
        <p className="text-[10px] font-bold text-white/90 truncate max-w-[130px] mt-1.5 text-center drop-shadow px-1">
          {currentSong.title}
        </p>
      )}
    </div>
  );
}
