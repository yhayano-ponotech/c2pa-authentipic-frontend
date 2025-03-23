"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileUpload, { FileInfo } from "@/components/c2pa/file-upload";
import SignForm from "@/components/c2pa/sign-form";
import { signWithC2pa } from "@/lib/api-client";
import { SignData } from "@/lib/types";

export default function SignPage() {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");

  // ファイル選択時のハンドラ
  const handleFileSelected = (fileInfo: FileInfo) => {
    setSelectedFile(fileInfo);
    // ファイルが選択されたら自動的に署名タブに切り替え
    setActiveTab("sign");
  };

  // 署名処理のハンドラ
  const handleSign = async (formData: SignData) => {
    try {
      const result = await signWithC2pa(formData);

      return {
        success: result.success,
        downloadUrl: result.downloadUrl,
        error: result.error,
      };
    } catch (error) {
      console.error("署名リクエストエラー:", error);
      return {
        success: false,
        error: "サーバーとの通信中にエラーが発生しました。",
      };
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
          <h1 className="text-3xl font-bold tracking-tight">C2PA情報の追加と署名</h1>
        </div>

        <p className="text-muted-foreground">
          このページでは、画像ファイルにC2PA（Content Provenance）情報を追加して、デジタル署名を行うことができます。
          これにより、画像の出所と真正性を証明することができます。
        </p>

        <Separator />

        {/* メインコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">1. 画像のアップロード</TabsTrigger>
            <TabsTrigger value="sign" disabled={!selectedFile}>2. C2PA情報の追加と署名</TabsTrigger>
          </TabsList>
          
          {/* アップロードタブ */}
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>画像ファイルのアップロード</CardTitle>
                <CardDescription>
                  C2PA情報を追加したい画像ファイルをアップロードしてください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileSelected={handleFileSelected}
                  actionMode="sign"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 署名タブ */}
          <TabsContent value="sign" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* プレビュー部分 - crossOrigin属性を追加 */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>画像プレビュー</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFile && (
                    <div className="space-y-4">
                      <div className="relative h-48 rounded-md overflow-hidden border">
                        <img
                          src={selectedFile.url}
                          alt={selectedFile.fileName}
                          className="object-contain w-full h-full"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium truncate">{selectedFile.fileName}</p>
                        <p>{(selectedFile.fileSize / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 署名フォーム部分 */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>C2PA情報の追加</CardTitle>
                  <CardDescription>
                    画像に追加するC2PA情報を入力してください。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SignForm 
                    fileInfo={selectedFile}
                    onSign={handleSign}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 情報セクション */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">C2PA署名について</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              C2PA（Coalition for Content Provenance and Authenticity）は、
              デジタルコンテンツの出所と変更履歴を証明するための業界標準規格です。
            </p>
            <p>
              このアプリケーションでは、C2PA Node.jsライブラリを使用して、
              画像ファイルにC2PA情報を追加しています。追加された情報は、
              Adobe Photoshop、Content Authenticity Initiativeのビューアーなど、
              C2PAに対応したアプリケーションで確認することができます。
            </p>
            <p>
              <strong>注意:</strong> このデモアプリケーションでは、テスト用の署名証明書を使用しています。
              本番環境では、信頼できる証明書と適切な鍵管理を行うことが重要です。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}