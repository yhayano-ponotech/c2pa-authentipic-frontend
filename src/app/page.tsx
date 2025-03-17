'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/c2pa/file-upload";
import { ArrowRight, FileCheck, FilePlus, FileSearch } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">C2PA画像認証アプリ</h1>
          <p className="text-xl text-muted-foreground">
            画像のC2PA情報の読み取り、追加、検証を簡単に行うことができるWebアプリケーションです。
            C2PA（Coalition for Content Provenance and Authenticity）は、デジタルコンテンツの出所と真正性を
            証明するための業界標準です。
          </p>
        </div>

        <Tabs defaultValue="read" className="w-full max-w-3xl">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="read">読み取り</TabsTrigger>
            <TabsTrigger value="sign">署名</TabsTrigger>
            <TabsTrigger value="verify">検証</TabsTrigger>
          </TabsList>
          
          <TabsContent value="read" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>C2PA情報の読み取り</CardTitle>
                <CardDescription>
                  画像ファイルをアップロードして、埋め込まれているC2PA情報を表示します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileSelected={(fileInfo) => {
                    console.log("File selected for reading:", fileInfo);
                    // ここでは読み取りモードの処理を行う
                    // 実際の処理はFileUploadコンポーネント内で行う
                  }}
                  actionMode="read"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileSearch className="mr-2 h-4 w-4" />
                  サポートする形式: JPG, PNG, WEBP, TIFF, AVIF, HEIC, GIF
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="sign" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>C2PA情報の追加と署名</CardTitle>
                <CardDescription>
                  画像ファイルにC2PA情報を追加して、デジタル署名を行います。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  署名ページでは、アップロードした画像に対して詳細なC2PA情報を追加し、
                  デジタル署名を行うことができます。
                </p>
                <div className="flex justify-center">
                  <Link href="/sign">
                    <Button>
                      署名ページへ移動
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FilePlus className="mr-2 h-4 w-4" />
                  情報を追加して画像の出所を証明します
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="verify" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>C2PA情報の検証</CardTitle>
                <CardDescription>
                  画像ファイルに含まれるC2PA情報の署名を検証します。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  検証ページでは、アップロードした画像のC2PA情報が正規のものであるかを
                  デジタル署名を検証することで確認できます。
                </p>
                <div className="flex justify-center">
                  <Link href="/verify">
                    <Button>
                      検証ページへ移動
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileCheck className="mr-2 h-4 w-4" />
                  画像の真正性を検証できます
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center max-w-2xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">C2PAについて</h2>
          <p className="text-muted-foreground">
            C2PAは「Coalition for Content Provenance and Authenticity」の略で、
            Adobe、Microsoft、BBC、Truepic、Armなどの企業や組織が参加するコンソーシアムによって
            開発された規格です。この技術により、デジタルコンテンツの制作元や編集履歴を
            透明性をもって追跡・証明することができます。
          </p>
        </div>
      </div>
    </main>
  );
}