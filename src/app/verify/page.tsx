"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileUpload, { FileInfo } from "@/components/c2pa/file-upload";
import VerificationResult from "@/components/c2pa/verification-result";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { verifyC2paInfo } from "@/lib/api-client";
import { VerificationResult as VerificationResultType } from "@/lib/types";

export default function VerifyPage() {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResultType | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ファイル選択時のハンドラ
  const handleFileSelected = async (fileInfo: FileInfo) => {
    setSelectedFile(fileInfo);
    setVerificationResult(null);
    setError(null);
    
    // 検証処理を開始
    await verifyFile(fileInfo.id);
  };

  // ファイル検証のハンドラ
  const verifyFile = async (fileId: string) => {
    setVerifying(true);
    setError(null);
    
    try {
      const result = await verifyC2paInfo(fileId);

      if (result.success) {
        if (!result.hasC2pa) {
          setVerificationResult({
            isValid: false,
            validationDetails: {
              status: "invalid",
              errors: ["このファイルにはC2PA情報が含まれていません。"],
              warnings: [],
              manifestValidations: []
            }
          });
        } else {
          // 注意: ここでAPIから返されるのは、既にVerificationResult型の完全なオブジェクト
          setVerificationResult(result);
        }
      } else {
        setError(result.error || "検証中にエラーが発生しました。");
      }
    } catch (error) {
      console.error("検証エラー:", error);
      setError("検証リクエスト中にエラーが発生しました。");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">C2PA情報の検証</h1>
        </div>

        <p className="text-muted-foreground">
          このページでは、画像ファイルに埋め込まれたC2PA情報の署名を検証し、
          コンテンツの出所と完全性を確認することができます。
        </p>

        <Separator />

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 gap-6">
          {/* ファイルアップロード部分 */}
          {!selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle>検証する画像のアップロード</CardTitle>
                <CardDescription>
                  C2PA情報を検証したい画像ファイルをアップロードしてください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileSelected={handleFileSelected}
                  actionMode="verify"
                />
              </CardContent>
            </Card>
          )}

          {/* 検証結果表示部分 */}
          {selectedFile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* プレビュー部分 */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>画像プレビュー</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative h-48 rounded-md overflow-hidden border">
                      <Image
                        src={selectedFile.url}
                        alt={selectedFile.fileName}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium truncate">{selectedFile.fileName}</p>
                      <p>{(selectedFile.fileSize / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 検証結果部分 */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>検証結果</CardTitle>
                    <CardDescription>
                      C2PA情報の署名検証結果です。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verifying ? (
                      <div className="flex flex-col items-center justify-center p-8">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-muted-foreground">検証中...</p>
                      </div>
                    ) : error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>エラー</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : verificationResult ? (
                      <VerificationResult verificationData={verificationResult} />
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* 情報セクション */}
        <div className="mt-4 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">C2PA検証について</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              C2PA検証は、画像に埋め込まれた暗号署名を検証し、コンテンツの真正性を確認するプロセスです。
              これにより、画像が作成されてから変更されていないこと、および署名した機関や個人によって確認されていることを
              確認できます。
            </p>
            <p>
              検証プロセスには以下が含まれます：
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>デジタル署名の暗号的検証</li>
              <li>証明書チェーンの検証</li>
              <li>コンテンツハッシュの検証</li>
              <li>メタデータの整合性チェック</li>
            </ul>
            <p>
              <strong>注意:</strong> C2PA検証は画像の真実性ではなく、真正性（authenticity）を検証します。
              つまり、画像が本物であるか、またはAIで生成されたものではないかを検証するものではなく、
              画像が署名されて以降に改ざんされていないことを検証するものです。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}