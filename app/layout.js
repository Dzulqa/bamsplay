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
  description: "Bamsplay is a modern, Spotify-inspired web music player with an elegant purple theme.",
  manifest: "/manifest.json",
  icons: {
    icon: "/bamsplay-icon.svg",
    apple: "/bamsplay-icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full h-full flex flex-col bg-[#0b0813] text-[#e2dfeb] selection:bg-purple-600 selection:text-white font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
