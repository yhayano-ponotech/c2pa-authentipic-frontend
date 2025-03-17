import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { createC2pa } from "c2pa-node";
import { getTempFilePath, isValidFileId, getMimeType } from "@/lib/utils";

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

    // C2PAデータを読み込み
    const result = await c2pa.read({ buffer, mimeType });

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
  } catch (error) {
    console.error("C2PA検証エラー:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "C2PAデータの検証中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}