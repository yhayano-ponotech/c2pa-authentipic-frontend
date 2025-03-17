'use client'

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, File, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { uploadFile } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ManifestViewer from "@/components/c2pa/manifest-viewer";
import { C2paManifestData } from "@/lib/types";

export type ActionMode = "read" | "sign" | "verify";

export type FileInfo = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
};

export type FileUploadProps = {
  onFileSelected: (fileInfo: FileInfo) => void;
  actionMode: ActionMode;
  maxSize?: number; // バイト単位
};

export default function FileUpload({
  onFileSelected,
  actionMode,
  maxSize = 10 * 1024 * 1024, // デフォルト: 10MB
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [c2paData, setC2paData] = useState<C2paManifestData | null>(null);
  const [hasC2pa, setHasC2pa] = useState<boolean | null>(null);

  // ファイルドロップ処理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    
    // ファイルサイズチェック
    if (selectedFile.size > maxSize) {
      setUploadError(`ファイルサイズが大きすぎます。最大${maxSize / (1024 * 1024)}MBまでのファイルを選択してください。`);
      return;
    }
    
    // MIMEタイプチェック
    const validImageTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/tiff', 
      'image/avif', 'image/heic', 'image/gif'
    ];
    
    if (!validImageTypes.includes(selectedFile.type)) {
      setUploadError('サポートされていないファイル形式です。JPG、PNG、WEBP、TIFF、AVIF、HEIC、GIFのいずれかを選択してください。');
      return;
    }
    
    // エラーをリセット
    setUploadError(null);
    setFile(selectedFile);
    
    // プレビュー用のURL生成
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    
    // ファイルアップロード開始
    handleUpload(selectedFile);
    
    return () => {
      // クリーンアップ
      URL.revokeObjectURL(objectUrl);
    };
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tif', '.tiff'],
      'image/avif': ['.avif'],
      'image/heic': ['.heic'],
      'image/gif': ['.gif']
    },
    maxFiles: 1
  });

  // ファイルアップロード処理
  const handleUpload = async (fileToUpload: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // 進行状況を模擬するインターバル（実際のAPIではXHRのprogress eventなどを使用）
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      // ファイルをアップロード
      const response = await uploadFile(fileToUpload);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // レスポンスからファイル情報を設定
      const fileData: FileInfo = {
        id: response.fileId,
        fileName: response.fileName,
        fileType: response.fileType,
        fileSize: response.fileSize,
        url: response.url
      };
      
      setFileInfo(fileData);
      onFileSelected(fileData);
      
      // アクションモードが「読み取り」の場合、C2PAデータを読み取る
      if (actionMode === 'read') {
        await fetchC2paData(fileData.id);
      }
      
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      setUploadError('ファイルのアップロード中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setUploading(false);
    }
  };

  // C2PAデータ取得
  const fetchC2paData = async (fileId: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/c2pa/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHasC2pa(data.hasC2pa);
        if (data.hasC2pa) {
          setC2paData(data.manifest);
        }
      } else {
        setUploadError(data.error || 'C2PAデータの読み取り中にエラーが発生しました。');
      }
    } catch (error) {
      console.error('C2PAデータ読み取りエラー:', error);
      setUploadError('C2PAデータの読み取り中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-6">
      {/* エラーメッセージ */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {/* ドラッグ&ドロップエリア (ファイルがアップロードされていない場合のみ表示) */}
      {!file && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">
                {isDragActive
                  ? 'ファイルをドロップしてください'
                  : '画像ファイルをドラッグ&ドロップするか、クリックして選択してください'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                サポートする形式: JPG, PNG, WEBP, TIFF, AVIF, HEIC, GIF (最大10MB)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* アップロード進行状況 */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">アップロード中...</span>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {/* プレビューと情報表示 */}
      {file && preview && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              {/* 画像プレビュー */}
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src={preview}
                  alt={file.name}
                  fill
                  className="object-contain"
                />
              </div>
              
              {/* ファイル情報 */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <File className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{file.type}</span>
                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                
                {/* アップロード成功メッセージ */}
                {uploadSuccess && (
                  <div className="flex items-center text-green-600 mt-2">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>アップロード完了</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          {/* 読み取りモードでのC2PAデータ表示 */}
          {actionMode === 'read' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">C2PA情報</h3>
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : hasC2pa === false ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>C2PA情報なし</AlertTitle>
                  <AlertDescription>
                    この画像にはC2PA情報が含まれていません。
                  </AlertDescription>
                </Alert>
              ) : c2paData ? (
                <ManifestViewer manifest={c2paData} />
              ) : null}
            </div>
          )}
          
          {/* アップロードのやり直しボタン */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setPreview(null);
                setUploadSuccess(false);
                setUploadProgress(0);
                setFileInfo(null);
                setC2paData(null);
                setHasC2pa(null);
              }}
            >
              別のファイルをアップロード
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}