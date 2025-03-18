// import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  images: {
    // eslint-disable-next-line no-undef
    domains: [process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'default-domain.com'],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};

// export default withBundleAnalyzer(nextConfig);
export default nextConfig;
