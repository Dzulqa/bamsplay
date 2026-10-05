"use client";

import React from "react";

/**
 * BamsplayLogo
 * Uses the exact logo provided by the user (pure circle with transparent background).
 * In-app usage: Clean circle with purple glow ("circle" by default).
 * APK / PWA usage: Rounded box ("apk").
 */
export default function BamsplayLogo({
  className = "w-9 h-9",
  variant = "circle", // "circle" (langsung lingkaran ungu transparan) | "apk" (maskable)
  withGlow = true,
}) {
  if (variant === "apk") {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
        style={{ borderRadius: "10px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/maskable-512x512.png"
          alt="Bamsplay Logo"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        withGlow ? "drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" : ""
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bamsplay-logo-circle.png"
        alt="Bamsplay Logo"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
