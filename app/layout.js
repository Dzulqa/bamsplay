import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#7c3aed",
};

export const metadata = {
  title: "Bamsplay Music",
  description:
    "Bamsplay is a modern, Spotify-inspired web music player with an elegant purple theme.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Bamsplay",
    statusBarStyle: "black-translucent",
    startupImage: "/icons/icon-512x512.png",
  },
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/bamsplay-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-167x167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        rel: "shortcut icon",
      },
    ],
  },
};

// Clean up Service Worker on localhost, register only on production
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocal) {
              // Unregister any active service worker on localhost & clear cache
              navigator.serviceWorker.getRegistrations().then(function(regs) {
                for (let reg of regs) {
                  reg.unregister();
                }
              });
              if ('caches' in window) {
                caches.keys().then(function(keys) {
                  for (let key of keys) {
                    caches.delete(key);
                  }
                });
              }
            } else {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) {
                    console.log('[Bamsplay] SW registered:', reg.scope);
                    reg.update().catch(function() {});
                  })
                  .catch(function(err) {
                    console.warn('[Bamsplay] SW registration failed:', err);
                  });
              });
              document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') {
                  navigator.serviceWorker.ready.then(function(reg) {
                    reg.update().catch(function() {});
                  });
                }
              });
            }
          }
        `,
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full h-full flex flex-col bg-[#0b0813] text-[#e2dfeb] selection:bg-purple-600 selection:text-white font-sans overflow-hidden">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
