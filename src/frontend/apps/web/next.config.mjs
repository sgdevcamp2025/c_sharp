/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // standalone 출력 추가
  transpilePackages: ['@workspace/ui'],
};

export default nextConfig;
