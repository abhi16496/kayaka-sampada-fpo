import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow API calls to backend
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';
    const fallback = isProduction ? 'http://backend:5000' : 'http://localhost:5000';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || fallback;
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  // PWA headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },
  // Output for Docker
  output: 'standalone',
};

export default nextConfig;
