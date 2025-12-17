/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 이미지 최적화 설정
  images: {
    domains: ['localhost', 'cdn.jsdelivr.net'],
    formats: ['image/webp', 'image/avif'],
  },

  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // 실험적 기능
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      'lucide-react'
    ]
  },

  // 국제화 설정
  i18n: {
    locales: ['ko', 'hu'],
    defaultLocale: 'ko',
  },

  // 실험적 기능 (Next.js 14.x에서 appDir 설정 제거됨)
  // experimental: {},

  // Webpack 설정
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 공유 모듈 alias 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@shared': require('path').resolve(__dirname, '../shared'),
    };

    return config;
  },

  // 빌드 중 ESLint 오류 무시 (배포 우선)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;