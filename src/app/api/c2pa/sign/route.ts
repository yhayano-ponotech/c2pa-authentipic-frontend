import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { TEMP_DIR } from "@/lib/constants";
import { getTempFilePath, isValidFileId, generateUniqueId, getMimeType } from "@/lib/utils";

// c2pa-nodeモジュールをダイナミックインポートで遅延ロード
// これによりビルド時のエラーを避ける
async function loadC2pa() {
  try {
    const { createC2pa, createTestSigner, ManifestBuilder, SigningAlgorithm } = await import('c2pa-node');
    return { createC2pa, createTestSigner, ManifestBuilder, SigningAlgorithm };
  } catch (error) {
    console.error("C2PAモジュールのロードエラー:", error);
    throw new Error("C2PAモジュールのロードに失敗しました");
  }
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { fileId, manifestData, certificate, privateKey, useLocalSigner } = body;

    console.log("受信したリクエストボディ:", JSON.stringify({
      fileId,
      manifestData,
      useLocalSigner,
      hasCertificate: !!certificate,
      hasPrivateKey: !!privateKey
    }, null, 2));

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
    
    // ローカル署名の場合、証明書と秘密鍵のバリデーション
    if (useLocalSigner) {
      if (!certificate || !privateKey) {
        return NextResponse.json(
          {
            success: false,
            error: "ローカル署名には証明書と秘密鍵が必要です。",
          },
          { status: 400 }
        );
      }
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

    // ファイル拡張子を抽出
    const extension = path.extname(fileId);

    // 出力ファイル名を生成
    const outputFileName = `signed_${generateUniqueId()}${extension}`;
    const outputPath = path.join(TEMP_DIR, outputFileName);

    // MIMEタイプを拡張子から決定
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

    try {
      // C2PAモジュールを動的にロード
      const { createC2pa, createTestSigner, ManifestBuilder, SigningAlgorithm } = await loadC2pa();

      // 署名者の作成
      let signer;
      
      if (useLocalSigner && certificate && privateKey) {
        console.log("ローカル署名者を使用します");
        
        try {
          // PEMと秘密鍵の内容をそのままバッファに変換
          const certificateBuffer = Buffer.from(certificate.content);
          const privateKeyBuffer = Buffer.from(privateKey.content);
          
          // ローカル署名者を作成
          signer = {
            type: 'local' as const,
            certificate: certificateBuffer,
            privateKey: privateKeyBuffer,
            algorithm: SigningAlgorithm.ES256,
            tsaUrl: 'http://timestamp.digicert.com',
          };
          
          console.log("証明書バッファ長:", certificateBuffer.length);
          console.log("証明書の先頭:", certificateBuffer.toString().substring(0, 50));
          console.log("秘密鍵バッファ長:", privateKeyBuffer.length);
        } catch (err) {
          console.error("証明書または秘密鍵の処理エラー:", err);
          return NextResponse.json({
            success: false,
            error: "証明書または秘密鍵の処理に失敗しました: " + (err instanceof Error ? err.message : String(err)),
          }, { status: 400 });
        }
      } else {
        console.log("テスト署名者を使用します");
        // テスト署名者を作成
        signer = await createTestSigner();
      }

      // C2PAインスタンスを作成
      const c2pa = createC2pa({ signer });

      // 基本アサーションの準備
      const assertions = manifestData.assertions ? [...manifestData.assertions] : [];

      // 追加メタデータがあれば設定
      if (manifestData.creator) {
        assertions.push({
          label: "dc.creator",
          data: manifestData.creator,
        });
      }

      if (manifestData.copyright) {
        assertions.push({
          label: "dc.rights",
          data: manifestData.copyright,
        });
      }

      if (manifestData.description) {
        assertions.push({
          label: "dc.description",
          data: manifestData.description,
        });
      }

      // マニフェストビルダーを作成
      const manifest = new ManifestBuilder({
        claim_generator: manifestData.claimGenerator || "c2pa-web-app/1.0.0",
        format: manifestData.format || mimeType,
        title: manifestData.title,
        assertions: assertions,
      });

      // アセットを準備 - ファイルパスを使用
      const asset = {
        path: tempFilePath,
      };

      try {
        // 署名を実行
        console.log("署名処理開始...");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await c2pa.sign({
          asset,
          manifest,
          options: {
            outputPath,
          },
        });

        // 署名結果をログに記録（デバッグ用）
        console.log("署名成功:", outputPath);

        // 一時出力ファイルの存在確認
        await fs.access(outputPath);

        // ダウンロードURLを生成
        const baseUrl = new URL(request.url).origin;
        const downloadUrl = `${baseUrl}/api/download?file=${outputFileName}`;

        return NextResponse.json({
          success: true,
          fileId: outputFileName,
          downloadUrl,
        });
      } catch (signError) {
        console.error("署名実行エラー:", signError);
        
        // エラー内容を詳細に分析
        let errorMessage = "署名処理に失敗しました";
        if (signError instanceof Error) {
          errorMessage += ": " + signError.message;
          
          // 原因分析を追加
          if (signError.message.includes("PEM")) {
            errorMessage += "。証明書または秘密鍵のフォーマットが正しくない可能性があります。有効なPEM形式の証明書と秘密鍵ファイルを使用してください。";
          } else if (signError.message.includes("private key")) {
            errorMessage += "。秘密鍵が無効または証明書と一致していない可能性があります。";
          }
        }
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
        }, { status: 500 });
      }
    } catch (c2paError) {
      console.error("C2PAモジュール処理エラー:", c2paError);
      return NextResponse.json({
        success: false,
        error: "C2PAモジュールの処理に失敗しました",
      }, { status: 500 });
    }
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