import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createC2pa } from "c2pa-node";
import { getTempFilePath, isValidFileId } from "@/lib/utils";

// GET・POSTリクエストに対応
export async function POST(request: NextRequest) {
  try {
    // リクエストボディからfileIdを取得
    const body = await request.json();
    const { fileId } = body;

    // fileIdのバリデーション
    if (!fileId || !isValidFileId(fileId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効なファイルIDです。",
        },
        { status: 400 }
      );
    }

    // 一時ファイルのパスを取得
    const tempFilePath = getTempFilePath(fileId);

    // ファイルの存在チェック
    try {
      await fs.access(tempFilePath);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `指定されたファイルが見つかりません。: ${error}`,
        },
        { status: 404 }
      );
    }

    // ファイルの読み込み
    const buffer = await fs.readFile(tempFilePath);

    // MIMEタイプを拡張子から推測
    const extension = path.extname(tempFilePath).toLowerCase();
    const mimeType = getMimeType(extension);

    if (!mimeType) {
      return NextResponse.json(
        {
          success: false,
          error: "サポートされていないファイル形式です。",
        },
        { status: 400 }
      );
    }

    // C2PAインスタンスを作成
    const c2pa = createC2pa();

    // C2PAデータを読み込み
    const result = await c2pa.read({ buffer, mimeType });

    if (result) {
      // C2PAデータがある場合
      return NextResponse.json({
        success: true,
        hasC2pa: true,
        manifest: result,
      });
    } else {
      // C2PAデータがない場合
      return NextResponse.json({
        success: true,
        hasC2pa: false,
      });
    }
  } catch (error) {
    console.error("C2PA読み取りエラー:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "C2PAデータの読み取り中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}

// 拡張子からMIMEタイプを取得する関数
function getMimeType(extension: string): string | null {
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".avif": "image/avif",
    ".heic": "image/heic",
    ".heif": "image/heif",
  };

  return mimeTypes[extension] || null;
}