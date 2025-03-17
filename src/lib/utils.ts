import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";
import { TEMP_DIR } from "./constants";

/**
 * tailwindcssのクラス名をマージするためのユーティリティ関数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 一意のIDを生成する関数
 */
export function generateUniqueId(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * ファイル名をサニタイズする関数
 */
export function sanitizeFilename(filename: string): string {
  // 基本的な無効な文字を削除または置換
  const sanitized = filename
    .replace(/[/\\?%*:|"<>]/g, "_") // 無効な文字を置換
    .replace(/\s+/g, "_")          // スペースをアンダースコアに置換
    .replace(/\.{2,}/g, ".")       // 連続したドットを単一のドットに置換
    .trim();                       // 前後の空白を削除

  return sanitized;
}

/**
 * ファイルIDが有効かどうかをチェックする関数
 */
export function isValidFileId(fileId: string): boolean {
  // ベーシックなバリデーション
  // ここでは簡易的に、英数字とダッシュ、アンダースコア、ドット、拡張子のみを許可
  const validFilePattern = /^[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+$/;
  return validFilePattern.test(fileId);
}

/**
 * 一時ファイルのパスを取得する関数
 */
export function getTempFilePath(fileId: string): string {
  if (!isValidFileId(fileId)) {
    throw new Error("無効なファイルIDです。");
  }
  // パスの結合をスラッシュで行う
  return `${TEMP_DIR}/${fileId}`;
}

/**
 * 日付をフォーマットする関数
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return "日時情報なし";
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return "無効な日付";
  }
  
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * ファイルの拡張子からMIMEタイプを取得する関数
 */
export function getMimeType(filename: string): string | null {
  const extension = filename.toLowerCase().split('.').pop();
  if (!extension) return null;

  const mimeTypes: { [key: string]: string } = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "avif": "image/avif",
    "heic": "image/heic",
    "heif": "image/heif",
  };

  return mimeTypes[extension] || null;
}

/**
 * バイト数を人間が読みやすい形式に変換する関数
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * C2PAマニフェストのラベルを人間が読みやすい形式に変換する関数
 */
export function formatC2paLabel(label: string): string {
  const labelMap: { [key: string]: string } = {
    "c2pa.actions": "アクション",
    "c2pa.metadata": "メタデータ",
    "c2pa.hash": "ハッシュ",
    "c2pa.thumbnail": "サムネイル",
    "dc.creator": "作成者",
    "dc.rights": "著作権",
    "dc.description": "説明",
    "stds.schema-org.CreativeWork": "作品情報",
    "stds.iptc.photo-metadata": "写真メタデータ",
    "stds.xmp.media-management": "メディア管理",
  };

  return labelMap[label] || label;
}