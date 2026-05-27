import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow API calls to backend
  async rewrites() {
    // In single-container mode (Dockerfile), backend runs on localhost:5000.
    // In docker-compose mode, BACKEND_URL should point to the backend service name.
    // NEXT_PUBLIC_API_URL is intentionally left empty in the Dockerfile so
    // the frontend uses relative /api/* paths proxied here to the backend.
    const backendUrl =
      process.env.BACKEND_URL ||
      (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== ''
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://localhost:5000');
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
