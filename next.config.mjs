/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
    // Required for static export (APK/Capacitor)
    unoptimized: true,
  },
  // Uncomment the line below ONLY when building for APK (Capacitor).
  // Keep commented for normal Next.js dev/production server.
  // output: 'export',
  // trailingSlash: true,
};

export default nextConfig;

