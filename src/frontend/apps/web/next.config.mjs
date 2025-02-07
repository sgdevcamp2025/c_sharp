/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // standalone 출력 추가
  transpilePackages: ['@workspace/ui'],
  trailingSlash: true, // 경로 문제 해결 (next export 시 필요)
  experimental: {
    outputStandalone: true,
  },
};

export default nextConfig;
