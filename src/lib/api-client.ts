/**
 * APIクライアント関数のコレクション
 * フロントエンドからバックエンドAPIを呼び出すための関数を提供します
 */

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * URLをHTTPS形式に変換する
 * @param url 変換するURL文字列
 * @returns HTTPS形式のURL
 */
export function ensureHttps(url: string): string {
  // すでにHTTPSならそのまま返す
  if (url.startsWith('https://')) {
    return url;
  }
  
  // HTTPをHTTPSに置き換え
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // プロトコルがない場合はHTTPSを付加
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // その他の場合はそのまま返す
  return url;
}

/**
 * ファイルをアップロードする関数
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/c2pa/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "ファイルのアップロードに失敗しました。");
  }

  const data = await response.json();
  
  // URLをHTTPSに変換
  if (data.url) {
    data.url = ensureHttps(data.url);
  }
  
  return data;
}

/**
 * C2PA情報を読み取る関数
 * @param fileId ファイルID
 * @returns C2PA情報
 */
export async function readC2paInfo(fileId: string) {
  const response = await fetch(`${API_BASE_URL}/c2pa/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "C2PA情報の読み取りに失敗しました。");
  }

  return await response.json();
}

/**
 * C2PA情報を追加して署名する関数
 * @param data 署名データ（fileIdとmanifestDataを含む）
 * @returns 署名結果
 */
export async function signWithC2pa(data: {
  fileId: string;
  manifestData: {
    title: string;
    creator?: string;
    copyright?: string;
    description?: string;
    claimGenerator?: string;
    format?: string;
    assertions: Array<{
      label: string;
      data: Record<string, unknown>;
    }>;
    [key: string]: unknown;
  };
}) {
  const response = await fetch(`${API_BASE_URL}/c2pa/sign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "C2PA署名に失敗しました。");
  }

  const result = await response.json();
  
  // ダウンロードURLをHTTPSに変換
  if (result.downloadUrl) {
    result.downloadUrl = ensureHttps(result.downloadUrl);
  }
  
  return result;
}

/**
 * C2PA情報を検証する関数
 * @param fileId ファイルID
 * @returns 検証結果
 */
export async function verifyC2paInfo(fileId: string) {
  const response = await fetch(`${API_BASE_URL}/c2pa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "C2PA検証に失敗しました。");
  }

  return await response.json();
}

/**
 * 一時ファイルのURLを取得する関数
 * @param fileName ファイル名
 * @returns ファイルのURL
 */
export function getTempFileUrl(fileName: string) {
  return ensureHttps(`${API_BASE_URL}/temp/${fileName}`);
}

/**
 * ダウンロードURLを取得する関数
 * @param fileName ファイル名
 * @returns ダウンロードURL
 */
export function getDownloadUrl(fileName: string) {
  return ensureHttps(`${API_BASE_URL}/download?file=${fileName}`);
}