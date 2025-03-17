import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { getTempFilePath, isValidFileId, getMimeType } from "@/lib/utils";

// c2pa-nodeモジュールをダイナミックインポートで遅延ロード
async function loadC2pa() {
  try {
    const { createC2pa } = await import('c2pa-node');
    return { createC2pa };
  } catch (error) {
    console.error("C2PAモジュールのロードエラー:", error);
    throw new Error("C2PAモジュールのロードに失敗しました");
  }
}

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

    try {
      // C2PAモジュールを動的にロード
      const { createC2pa } = await loadC2pa();
      
      // C2PAインスタンスを作成
      const c2pa = createC2pa();

      try {
        // ファイルパスを使用してC2PAデータを読み込み
        const result = await c2pa.read({ path: tempFilePath, mimeType });

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
      } catch (readError) {
        // C2PA読み取りエラーをログに記録
        console.error('C2PA読み取りエラー:', readError);
        
        // エラーが発生した場合でもアプリケーションを継続させるため
        // C2PAデータがないとして処理
        return NextResponse.json({
          success: true,
          hasC2pa: false,
        });
      }
    } catch (c2paError) {
      console.error("C2PAモジュール処理エラー:", c2paError);
      return NextResponse.json({
        success: false,
        error: "C2PAモジュールの処理に失敗しました",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("リクエスト処理エラー:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "C2PAデータの読み取り中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}