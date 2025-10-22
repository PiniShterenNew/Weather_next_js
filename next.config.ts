import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {},
    optimizeCss: true,
    optimizePackageImports: ['next-intl', 'lucide-react', 'framer-motion'],
  },

  images: {
    domains: ['openweathermap.org', 'img.clerk.com', 'images.clerk.dev'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
    ],
  },

  compress: true,

  typescript: {
    ignoreBuildErrors: false,
  },


  poweredByHeader: false,

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
} satisfies import('next').NextConfig;

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    // Cache only assets and app shell, not weather data
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
        handler: 'NetworkOnly', // Don't cache weather API responses
        options: {
          backgroundSync: {
            name: 'weather-sync',
            options: {
              maxRetentionTime: 24 * 60 // 24 hours
            }
          }
        }
      },
      {
        urlPattern: /^\/api\/weather/,
        handler: 'NetworkOnly', // Don't cache weather API responses
      }
    ]
  },
})(withNextIntl(nextConfig));
