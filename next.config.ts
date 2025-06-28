import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  experimental: {
    serverActions: {
      // Server Actions configuration
    },
  },

  // Optimize images
  images: {
    domains: ['openweathermap.org'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
    ],
  },

  // Configure Compression
  compress: true,
  typescript: {
    ignoreBuildErrors: false, // ✅ יבטל את השגיאה בזמן build בלבד
  },

  // Set HTTP Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// השתמש בנתיב ברירת המחדל
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
