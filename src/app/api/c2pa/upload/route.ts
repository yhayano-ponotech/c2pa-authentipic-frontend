import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { generateUniqueId, sanitizeFilename } from "@/lib/utils";
import { TEMP_DIR } from "@/lib/constants";

// 最大ファイルサイズ（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// サポートされているMIMEタイプ
const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "image/avif",
  "image/heic",
  "image/gif",
];

export async function POST(request: NextRequest) {
  try {
    // マルチパートフォームデータをパース
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // ファイルが存在するか確認
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "ファイルがアップロードされていません。",
        },
        { status: 400 }
      );
    }

    // ファイルサイズを確認
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / (1024 * 1024)}MBまでのファイルを選択してください。`,
        },
        { status: 400 }
      );
    }

    // MIMEタイプを確認
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "サポートされていないファイル形式です。JPG、PNG、WEBP、TIFF、AVIF、HEIC、GIFのいずれかを選択してください。",
        },
        { status: 400 }
      );
    }

    // 一時ディレクトリが存在しない場合は作成
    try {
      await fs.access(TEMP_DIR);
    } catch (error) {
      console.error("一時ディレクトリを作成します:", error);
      await mkdir(TEMP_DIR, { recursive: true });
    }

    // ファイル名をサニタイズ
    const sanitizedFileName = sanitizeFilename(file.name);
    
    // 一意のファイルIDを生成
    const fileId = generateUniqueId();
    
    // ファイルの拡張子を取得
    const extension = path.extname(sanitizedFileName);
    
    // 一時ファイルのパスを生成
    const tempFileName = `${fileId}${extension}`;
    const tempFilePath = path.join(TEMP_DIR, tempFileName);

    // ファイルをバッファに変換
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // ファイルを一時ディレクトリに保存
    await writeFile(tempFilePath, buffer);

    // ファイルのURLを生成
    const baseUrl = new URL(request.url).origin;
    const fileUrl = `${baseUrl}/api/temp/${tempFileName}`;

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      fileId: tempFileName,
      fileName: sanitizedFileName,
      fileType: file.type,
      fileSize: file.size,
      url: fileUrl,
    });
  } catch (error) {
    console.error("ファイルアップロードエラー:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "ファイルのアップロード中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}