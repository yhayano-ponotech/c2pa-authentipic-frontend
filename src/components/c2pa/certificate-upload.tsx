import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, FileText, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CertificateFile {
    name: string;
    size: number;
    content: string; // テキスト形式の内容
}

interface CertificateUploadProps {
    fileType: "certificate" | "privateKey";
    accept: string[];
    maxSize?: number; // バイト単位
    onFileSelected: (file: CertificateFile) => void;
    onFileRemoved: () => void;
    file: CertificateFile | null;
}

export default function CertificateUpload({
  fileType,
  accept,
  maxSize = 1024 * 1024, // デフォルト: 1MB
  onFileSelected,
  onFileRemoved,
  file,
}: CertificateUploadProps) {
  const [error, setError] = useState<string | null>(null);

  // ファイルドロップ処理
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const selectedFile = acceptedFiles[0];

      // ファイルサイズチェック
      if (selectedFile.size > maxSize) {
        setError(
          `ファイルサイズが大きすぎます。最大${Math.round(
            maxSize / 1024
          )}KBまでのファイルを選択してください。`
        );
        return;
      }

      // ファイルをArrayBufferとして読み込む
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          onFileSelected({
            name: selectedFile.name,
            size: selectedFile.size,
            content: e.target.result
          });
          setError(null);
        } else {
          setError("ファイルの読み込みに失敗しました。");
        }
      };
      reader.onerror = () => {
        setError("ファイルの読み込み中にエラーが発生しました。");
      };
      reader.readAsText(selectedFile);
    },
    [maxSize, onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, curr) => {
      acc[curr] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
  });

  // ファイル削除ハンドラ
  const handleRemoveFile = () => {
    onFileRemoved();
    setError(null);
  };

  const getFileTypeLabel = () => {
    return fileType === "certificate" ? "証明書" : "秘密鍵";
  };

  const getFileTypeDescription = () => {
    return fileType === "certificate"
      ? "PEM形式のX.509証明書ファイル"
      : "PUB形式の秘密鍵ファイル";
  };

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/20 hover:border-primary/50"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isDragActive
                  ? `${getFileTypeLabel()}ファイルをドロップしてください`
                  : `${getFileTypeLabel()}ファイルをドラッグ&ドロップするか、クリックして選択`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getFileTypeDescription()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card className="relative overflow-hidden">
          <Badge
            className="absolute top-2 right-2 z-10"
            variant="secondary"
          >
            {getFileTypeLabel()}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-12 z-10"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">削除</span>
          </Button>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}