import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { TEMP_DIR } from "@/lib/constants";
import { isValidFileId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータからファイル名を取得
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    // ファイル名のバリデーション
    if (!fileName || !isValidFileId(fileName)) {
      return NextResponse.json(
        {
          error: "無効なファイル名です。",
        },
        { status: 400 }
      );
    }

    // ファイルパスを構築
    const filePath = path.join(TEMP_DIR, fileName);

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
    const extension = path.extname(fileName).toLowerCase();
    const contentType = getMimeType(extension) || "application/octet-stream";

    // ダウンロード用のファイル名を生成
    const downloadFileName = `c2pa_signed_${Date.now()}${extension}`;

    // レスポンスを返す
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadFileName}"`,
      },
    });
  } catch (error) {
    console.error("ファイルダウンロードエラー:", error);
    
    return NextResponse.json(
      {
        error: "ファイルのダウンロード中にエラーが発生しました。",
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