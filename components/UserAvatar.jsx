"use client";

import React, { useState, useEffect } from "react";

/**
 * Bulletproof User Avatar Component
 * - Prevents Google CDN Referrer blocking with referrerPolicy="no-referrer"
 * - Auto-proxies via /api/auth/avatar if direct CDN access is blocked by browser
 * - Gracefully falls back to stylish initial letter with vibrant gradient on error
 * - Never shows ugly browser broken-image icons or alt-text overflow
 */
export default function UserAvatar({
  user,
  size = "md", // "sm" (28px), "md" (36px), "lg" (48px)
  className = "",
  showGoogleBadge = false,
}) {
  const [imgError, setImgError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  const rawAvatar = user?.avatar || "";
  const name = user?.name || user?.email || "User";
  const initial = (name.trim().charAt(0) || "U").toUpperCase();

  // Reset error states when user/avatar changes
  useEffect(() => {
    setImgError(false);
    setUseProxy(false);
  }, [rawAvatar]);

  // Determine current image source
  let currentSrc = rawAvatar;
  if (useProxy && rawAvatar && rawAvatar.startsWith("https://")) {
    currentSrc = `/api/auth/avatar?url=${encodeURIComponent(rawAvatar)}`;
  }

  const handleImageError = () => {
    // If direct Google CDN load failed, try local proxy once
    if (!useProxy && rawAvatar && rawAvatar.includes("googleusercontent.com")) {
      setUseProxy(true);
    } else {
      // Both direct and proxy failed (or offline): switch to initial letter
      setImgError(true);
    }
  };

  const sizeMap = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const badgeSizeMap = {
    sm: "w-3 h-3 -bottom-0.5 -right-0.5",
    md: "w-3.5 h-3.5 -bottom-0.5 -right-0.5",
    lg: "w-4 h-4 -bottom-1 -right-1",
  };

  const iconSizeMap = {
    sm: "w-2 h-2",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const selectedSize = sizeMap[size] || sizeMap.md;
  const badgeSize = badgeSizeMap[size] || badgeSizeMap.md;
  const iconSize = iconSizeMap[size] || iconSizeMap.md;

  const hasImage = Boolean(currentSrc) && !imgError;

  return (
    <div className={`relative shrink-0 select-none inline-block ${className}`}>
      <div
        className={`${selectedSize} rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-purple-400/30 overflow-hidden`}
      >
        {hasImage ? (
          <img
            src={currentSrc}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleImageError}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {showGoogleBadge && (
        <div
          className={`absolute ${badgeSize} rounded-full bg-white flex items-center justify-center shadow-sm pointer-events-none`}
        >
          <svg className={iconSize} viewBox="0 0 24 24">
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
      )}
    </div>
  );
}
