import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // サーバーサイドのビルド時のみネイティブモジュールをスキップ
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "sharp": false,
        "@img/sharp-darwin-x64": false,
        "@img/sharp-linux-x64": false,
        "@img/sharp-win32-x64": false,
      };
    }

    // `c2pa-node`のネイティブモジュールの扱いを設定
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      // useプロパティのみを使用
      use: 'empty-loader',
    });

    return config;
  },
  // その他の設定
  experimental: {
    // サーバーアクションの設定
    serverActions: {
      // デフォルトの制限を設定
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    }
  },
};

export default nextConfig;