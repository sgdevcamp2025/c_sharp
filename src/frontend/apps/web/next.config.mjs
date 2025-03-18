// import withBundleAnalyzer from '@next/bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';

const mode = process.env.NODE_ENV || 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  images: {
    domains: [process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'default-domain.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer && mode === 'production') {
      config.optimization.splitChunks = {
        chunks: 'all',
      };

      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ];
    }
    return config;
  },
};

// export default withBundleAnalyzer(nextConfig);
export default nextConfig;
