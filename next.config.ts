import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,

  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  experimental: {
    serverActions: {},
    optimizeCss: true,
    optimizePackageImports: ['next-intl', 'lucide-react', 'framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
    // Enable parallel builds
    webpackBuildWorker: true,
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
    // Enable incremental builds
    tsconfigPath: './tsconfig.json',
  },

  eslint: {
    // Only run ESLint during build if not in CI (faster local builds)
    ignoreDuringBuilds: process.env.CI !== 'true',
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
    // Cache strategy: Stale-While-Revalidate for API endpoints
    runtimeCaching: [
      {
        urlPattern: /^\/api\/bootstrap/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'bootstrap-cache',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 20 * 60 // 20 minutes
          }
        }
      },
      {
        urlPattern: /^\/api\/weather/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'weather-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 20 * 60 // 20 minutes
          }
        }
      },
      {
        urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
        handler: 'NetworkOnly', // Don't cache external API responses
      }
    ]
  },
})(withNextIntl(nextConfig));
