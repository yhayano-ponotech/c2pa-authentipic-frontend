import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 外部パッケージについての設定
  // c2pa-nodeはサーバーサイドからバックエンドに移行したため不要になった
  serverExternalPackages: ['sharp'],
  
  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        // ローカル開発環境のバックエンドサーバー
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/temp/**',
      },
      {
        // 本番環境のバックエンドサーバー（適宜変更してください）
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME || 'api.example.com',
        port: '',
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
      };
    }

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