import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getTempFilePath, isValidFileId } from "@/lib/utils";

// 一時ファイルを提供するためのAPI
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    // ファイル名のバリデーション
    if (!filename || !isValidFileId(filename)) {
      return NextResponse.json(
        {
          error: "無効なファイル名です。",
        },
        { status: 400 }
      );
    }

    // 一時ファイルのパスを取得
    const filePath = getTempFilePath(filename);

    // ファイルの存在チェック
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        {
          error: `ファイルが見つかりません。: ${error}`,
        },
        { status: 404 }
      );
    }

    // ファイルを読み込み
    const fileBuffer = await fs.readFile(filePath);

    // MIMEタイプを取得
    const extension = path.extname(filename).toLowerCase();
    const contentType = getMimeType(extension) || "application/octet-stream";

    // レスポンスを返す
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("一時ファイル取得エラー:", error);
    
    return NextResponse.json(
      {
        error: "ファイルの取得中にエラーが発生しました。",
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