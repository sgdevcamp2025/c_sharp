/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // standalone 출력 추가
  transpilePackages: ['@workspace/ui'],
  // Netlify에서의 정적 에셋 처리를 위한 설정
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
