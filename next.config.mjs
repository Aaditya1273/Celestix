/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pixen-flow.dev'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    return config;
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
