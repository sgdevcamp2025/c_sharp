/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@workspace/ui'],

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
