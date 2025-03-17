// 一時ファイルディレクトリのパス
// サーバー側の一時ディレクトリを使用
export const TEMP_DIR = process.env.TEMP_DIR || './tmp/c2pa-web-app-temp';

// 一時ファイルの保持期間（24時間、ミリ秒単位）
export const TEMP_FILE_TTL = 24 * 60 * 60 * 1000;

// サポートする画像形式
export const SUPPORTED_IMAGE_FORMATS = [
  {
    extension: '.jpg',
    mimeType: 'image/jpeg',
    name: 'JPEG'
  },
  {
    extension: '.jpeg',
    mimeType: 'image/jpeg',
    name: 'JPEG'
  },
  {
    extension: '.png',
    mimeType: 'image/png',
    name: 'PNG'
  },
  {
    extension: '.webp',
    mimeType: 'image/webp',
    name: 'WebP'
  },
  {
    extension: '.tif',
    mimeType: 'image/tiff',
    name: 'TIFF'
  },
  {
    extension: '.tiff',
    mimeType: 'image/tiff',
    name: 'TIFF'
  },
  {
    extension: '.avif',
    mimeType: 'image/avif',
    name: 'AVIF'
  },
  {
    extension: '.heic',
    mimeType: 'image/heic',
    name: 'HEIC'
  },
  {
    extension: '.heif',
    mimeType: 'image/heif',
    name: 'HEIF'
  },
  {
    extension: '.gif',
    mimeType: 'image/gif',
    name: 'GIF'
  }
];

// アップロードファイルの最大サイズ（10MB）
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// アプリケーション情報
export const APP_INFO = {
  name: 'C2PA Web App',
  version: '1.0.0',
  description: 'C2PA情報の読み取り、追加、検証を行うWebアプリケーション',
  repository: 'https://github.com/example/c2pa-web-app'
};