import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createC2pa, createTestSigner, ManifestBuilder } from "c2pa-node";
import { getTempFilePath, isValidFileId, generateUniqueId } from "@/lib/utils";
import { addAssertion } from "@/lib/c2pa/manifest-utils";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { fileId, manifestData } = body;

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

    // マニフェストデータのバリデーション
    if (!manifestData || typeof manifestData !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "無効なマニフェストデータです。",
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

    // 出力ファイルのパスを生成
    const tempDir = path.dirname(tempFilePath);
    const extension = path.extname(tempFilePath);
    const outputFileName = `signed_${generateUniqueId()}${extension}`;
    const outputPath = path.join(tempDir, outputFileName);

    // MIMEタイプを拡張子から推測
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

    // テスト署名者を作成
    const signer = await createTestSigner();
    
    // C2PAインスタンスを作成
    const c2pa = createC2pa({ signer });

    // マニフェストビルダーを作成
    const manifest = new ManifestBuilder({
      claim_generator: manifestData.claimGenerator || "c2pa-web-app/1.0.0",
      format: manifestData.format || mimeType,
      title: manifestData.title,
      assertions: manifestData.assertions || [],
    });

    // 追加のメタデータがあれば設定
    if (manifestData.creator) {
      manifest.addAssertion({
        label: "dc.creator",
        data: manifestData.creator,
      });
    }

    if (manifestData.copyright) {
      manifest.addAssertion({
        label: "dc.rights",
        data: manifestData.copyright,
      });
    }

    if (manifestData.description) {
      manifest.addAssertion({
        label: "dc.description",
        data: manifestData.description,
      });
    }

    // アセットを準備
    const asset = {
      path: tempFilePath,
    };

    // 署名を実行
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { signedAsset } = await c2pa.sign({
      asset,
      manifest,
      options: {
        outputPath,
      },
    });

    // ダウンロードURLを生成
    const baseUrl = new URL(request.url).origin;
    const downloadUrl = `${baseUrl}/api/download?file=${outputFileName}`;

    return NextResponse.json({
      success: true,
      fileId: outputFileName,
      downloadUrl,
    });
  } catch (error) {
    console.error("C2PA署名エラー:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "C2PA署名処理中にエラーが発生しました。",
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