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

        if (!result) {
          return NextResponse.json({
            success: true,
            hasC2pa: false,
            isValid: false,
            validationDetails: {
              status: "invalid",
              errors: ["このファイルにはC2PA情報が含まれていません。"],
            },
          });
        }

        // 検証ステータスに基づいて結果を生成
        const { validation_status } = result;
        
        let isValid = false;
        let status = "invalid";
        let errors: string[] = [];
        let warnings: string[] = [];
        
        if (validation_status === "valid") {
          isValid = true;
          status = "valid";
        } else if (validation_status === "invalid") {
          // 具体的なエラー情報を抽出
          errors.push("C2PA署名が無効です。");
          if (result.validation_errors) {
            if (Array.isArray(result.validation_errors)) {
              errors = errors.concat(result.validation_errors);
            }
          }
        } else {
          // 警告がある場合
          status = "warning";
          warnings.push("C2PA署名に警告があります。");
          if (result.validation_warnings) {
            if (Array.isArray(result.validation_warnings)) {
              warnings = warnings.concat(result.validation_warnings);
            }
          }
        }

        // 検証の詳細情報を生成
        const details = {
          validationType: validation_status,
          activeManifest: result.active_manifest,
          // その他の検証詳細情報があれば追加
        };

        return NextResponse.json({
          success: true,
          hasC2pa: true,
          isValid,
          validationDetails: {
            status,
            details,
            errors,
            warnings,
          },
        });
      } catch (verifyError) {
        // C2PA検証エラーをログに記録
        console.error('C2PA検証エラー:', verifyError);
        
        // エラーが発生した場合でもアプリケーションを継続させるため
        // C2PAデータがないとして処理
        return NextResponse.json({
          success: true,
          hasC2pa: false,
          isValid: false,
          validationDetails: {
            status: "invalid",
            errors: ["C2PAデータの検証中にエラーが発生しました。"],
          },
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
        error: "C2PAデータの検証中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}