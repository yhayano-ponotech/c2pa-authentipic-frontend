import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { createC2pa } from "c2pa-node";
import { getTempFilePath, isValidFileId, getMimeType } from "@/lib/utils";

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

    // MIMEタイプを取得
    const mimeType = getMimeType(fileId);

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

    try {
      // C2PAデータを読み込み
      const result = await c2pa.read({ buffer, mimeType });

      if (result && typeof result === 'object') {
        // C2PAデータがある場合
        const manifestData = {
          active_manifest: result.active_manifest || '',
          manifests: result.manifests || {},
          validation_status: result.validation_status || 'unknown',
          validation_errors: result.validation_errors || [],
          validation_warnings: result.validation_warnings || []
        };

        return NextResponse.json({
          success: true,
          hasC2pa: true,
          manifest: manifestData,
        });
      } else {
        // C2PAデータがない場合
        return NextResponse.json({
          success: true,
          hasC2pa: false,
        });
      }
    } catch (error) {
      console.error('C2PA読み取りエラー:', error);
      return NextResponse.json({
        success: false,
        hasC2pa: false,
        error: 'C2PAデータの読み取りに失敗しました'
      }, { status: 500 });
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