import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 外部パッケージを直接Next.jsのサーバーで処理するように設定
  serverExternalPackages: ['sharp', 'c2pa-node'],
  
  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/temp/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/temp/**',
      }
    ],
  },
  
  webpack: (config, { isServer }) => {
    // サーバーサイドのビルド時のみ特別な設定を適用
    if (isServer) {
      // sharpモジュールを正しく処理できるように設定
      config.externals = [...(config.externals || []), 'sharp'];
    } else {
      // クライアントサイドでは不要なモジュールをフォールバックとして設定
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sharp: false,
        '@img/sharp-darwin-x64': false,
        '@img/sharp-linux-x64': false,
        '@img/sharp-win32-x64': false,
      };
    }

    // c2pa-nodeのネイティブモジュールの処理設定
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: 'node-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      ],
    });

    return config;
  },

  // 実験的な機能の設定
  experimental: {
    // サーバーアクションの設定
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    }
  },
};

export default nextConfig;