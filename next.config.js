/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['your-image-domain.com'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|webp)$/i,
      type: 'asset/resource',
    });
    return config;
  },
  experimental: {
    optimizeFonts: true,
  },
}

module.exports = nextConfig
