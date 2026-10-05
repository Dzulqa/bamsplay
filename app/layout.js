import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bamsplay - Web Player: Music for everyone",
  description:
    "Bamsplay is a modern, Spotify-inspired web music player with an elegant purple theme.",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
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

// Registers the service worker for PWA offline support
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) {
                  console.log('[Bamsplay] SW registered:', reg.scope);
                })
                .catch(function(err) {
                  console.warn('[Bamsplay] SW registration failed:', err);
                });
            });
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
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
