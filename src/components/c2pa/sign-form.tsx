import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Download, Info, Shield } from "lucide-react";
import { FileInfo } from "@/components/c2pa/file-upload";
import { SignData } from "@/lib/types";
import { cn } from "@/lib/utils";
import CertificateUpload, { CertificateFile } from "./certificate-upload";

// フォームのバリデーションスキーマ
const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  creator: z.string().min(1, "作成者情報は必須です"),
  copyright: z.string().optional(),
  description: z.string().optional(),
  includeCreatedAction: z.boolean().default(true),
  includeToolInfo: z.boolean().default(true),
  addCustomAssertion: z.boolean().default(false),
  customAssertionLabel: z.string().optional(),
  customAssertionData: z.string().optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "有効なJSONフォーマットではありません" }
    ),
  useLocalSigner: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface SignFormProps {
  fileInfo: FileInfo | null;
  onSign: (formData: SignData) => Promise<{ success: boolean; downloadUrl?: string; error?: string }>;
}

export default function SignForm({ fileInfo, onSign }: SignFormProps) {
  const [signing, setSigning] = useState(false);
  const [signResult, setSignResult] = useState<{
    success: boolean;
    downloadUrl?: string;
    error?: string;
  } | null>(null);
  
  // 証明書と秘密鍵ファイル
  const [certificateFile, setCertificateFile] = useState<CertificateFile | null>(null);
  const [privateKeyFile, setPrivateKeyFile] = useState<CertificateFile | null>(null);

  // フォーム初期化
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: fileInfo?.fileName || "",
      creator: "",
      copyright: "",
      description: "",
      includeCreatedAction: true,
      includeToolInfo: true,
      addCustomAssertion: false,
      customAssertionLabel: "",
      customAssertionData: "",
      useLocalSigner: false
    },
  });

  // カスタムアサーションフィールドの表示/非表示
  const showCustomAssertionFields = form.watch("addCustomAssertion");
  
  // ローカル署名者を使用するかどうか
  const useLocalSigner = form.watch("useLocalSigner");

  // フォーム送信ハンドラ
  const onSubmit = async (data: FormValues) => {
    if (!fileInfo) return;

    setSigning(true);
    setSignResult(null);

    try {
      // マニフェストデータを構築
      const manifestData: SignData["manifestData"] = {
        title: data.title,
        creator: data.creator,
        claimGenerator: "c2pa-web-app/1.0.0",
        format: fileInfo.fileType,
        assertions: []
      };

      // 著作権情報があれば追加
      if (data.copyright) {
        manifestData.copyright = data.copyright;
      }

      // 説明があれば追加
      if (data.description) {
        manifestData.description = data.description;
      }

      // 作成アクションを含める場合
      if (data.includeCreatedAction) {
        manifestData.assertions.push({
          label: "c2pa.actions",
          data: {
            actions: [
              {
                action: "c2pa.created",
                when: new Date().toISOString()
              }
            ]
          }
        });
      }

      // ツール情報を含める場合
      if (data.includeToolInfo) {
        manifestData.assertions.push({
          label: "c2pa.metadata",
          data: {
            generator: {
              name: "C2PA Web Application",
              version: "1.0.0"
            },
            tool: {
              name: "c2pa-node",
              version: "1.0.0"
            }
          }
        });
      }

      // カスタムアサーションを追加する場合
      if (data.addCustomAssertion && data.customAssertionLabel && data.customAssertionData) {
        try {
          const customData = JSON.parse(data.customAssertionData);
          manifestData.assertions.push({
            label: data.customAssertionLabel,
            data: customData
          });
        } catch (error) {
          console.error("カスタムアサーションのパースエラー:", error);
          setSignResult({
            success: false,
            error: "カスタムアサーションデータのJSONパースに失敗しました。"
          });
          setSigning(false);
          return;
        }
      }

      // 署名データを準備
      const signData: SignData = {
        fileId: fileInfo.id,
        manifestData,
        useLocalSigner: data.useLocalSigner
      };

      // ローカル署名の場合、証明書と秘密鍵を追加
      if (data.useLocalSigner) {
        if (!certificateFile || !privateKeyFile) {
          setSignResult({
            success: false,
            error: "ローカル署名を行うには証明書と秘密鍵の両方が必要です。"
          });
          setSigning(false);
          return;
        }
        
        // テキスト内容をそのまま送信
        signData.certificate = {
          content: certificateFile.content,
          name: certificateFile.name
        };
        
        signData.privateKey = {
          content: privateKeyFile.content,
          name: privateKeyFile.name
        };
      }

      // 署名処理を実行
      const result = await onSign(signData);

      setSignResult(result);
    } catch (error) {
      console.error("署名処理エラー:", error);
      setSignResult({
        success: false,
        error: "署名処理中にエラーが発生しました。もう一度お試しください。"
      });
    } finally {
      setSigning(false);
    }
  };

  if (!fileInfo) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>画像が選択されていません</AlertTitle>
        <AlertDescription>
          C2PA情報を追加するには、まず画像をアップロードしてください。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 署名結果の表示 */}
      {signResult && (
        <Alert 
          variant={signResult.success ? "default" : "destructive"}
          className={cn(
            signResult.success && "border-green-500 bg-green-50 text-green-800"
          )}
        >
          {signResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {signResult.success ? "署名成功" : "署名エラー"}
          </AlertTitle>
          <AlertDescription>
            {signResult.success
              ? "C2PA情報が正常に追加されました。"
              : signResult.error || "署名処理中にエラーが発生しました。"}
            
            {signResult.success && signResult.downloadUrl && (
              <div className="mt-4">
                <Button asChild>
                  <a href={signResult.downloadUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    署名済み画像をダウンロード
                  </a>
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 署名フォーム */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル *</FormLabel>
                    <FormControl>
                      <Input placeholder="画像のタイトル" {...field} />
                    </FormControl>
                    <FormDescription>
                      C2PAマニフェストに記録されるタイトルです。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>作成者 *</FormLabel>
                    <FormControl>
                      <Input placeholder="作成者名または組織名" {...field} />
                    </FormControl>
                    <FormDescription>
                      コンテンツの作成者または権利所有者の情報です。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copyright"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>著作権情報</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="© 2025 組織名"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      著作権の表示情報（任意）
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="画像の説明や追加情報"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      コンテンツに関する追加情報（任意）
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* アサーション設定 */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">C2PAアサーション設定</h3>

              <FormField
                control={form.control}
                name="includeCreatedAction"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>作成アクション</FormLabel>
                      <FormDescription>
                        c2pa.created アクションを追加します
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeToolInfo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>ツール情報</FormLabel>
                      <FormDescription>
                        生成ツールと処理ツールの情報を追加します
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addCustomAssertion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>カスタムアサーション</FormLabel>
                      <FormDescription>
                        独自のカスタムアサーションを追加します
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useLocalSigner"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <FormLabel>ローカル署名を使用</FormLabel>
                      <FormDescription>
                        テスト署名ではなく証明書と秘密鍵を使用したローカル署名を実行します
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* カスタムアサーションフィールド */}
              {showCustomAssertionFields && (
                <div className="space-y-4 p-3 border rounded-md">
                  <FormField
                    control={form.control}
                    name="customAssertionLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>アサーションラベル *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例: com.example.metadata"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          カスタムアサーションのラベル（通常はドメイン名を含む）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customAssertionData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>アサーションデータ *</FormLabel>
                        <FormControl>
                          <Textarea
                            className="font-mono"
                            placeholder='{ "key": "value", "example": true }'
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          有効なJSON形式で入力してください
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* ローカル署名ファイルのアップロード */}
              {useLocalSigner && (
                <div className="space-y-4 p-3 border rounded-md">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <h4 className="font-medium">署名証明書と秘密鍵</h4>
                  </div>
                  
                  <Alert className="bg-amber-50 border-amber-200 mb-4">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertTitle>ローカル署名について</AlertTitle>
                    <AlertDescription className="text-amber-800">
                      ローカル署名では、お持ちの署名証明書(PEM)と秘密鍵(PUB)ファイルを使用して署名を行います。
                      セキュリティの観点から、これらのファイルはサーバーには保存されず、署名処理にのみ使用されます。
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel className="mb-2 block">証明書ファイル (PEM)</FormLabel>
                      <CertificateUpload
                        fileType="certificate"
                        accept={["application/x-pem-file", "application/x-x509-ca-cert", ".pem", ".crt", ".cer"]}
                        onFileSelected={setCertificateFile}
                        onFileRemoved={() => setCertificateFile(null)}
                        file={certificateFile}
                      />
                    </div>
                    <div>
                      <FormLabel className="mb-2 block">秘密鍵ファイル (PUB)</FormLabel>
                      <CertificateUpload
                        fileType="privateKey"
                        accept={["application/octet-stream", ".pub", ".key", ".pem"]}
                        onFileSelected={setPrivateKeyFile}
                        onFileRemoved={() => setPrivateKeyFile(null)}
                        file={privateKeyFile}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* フォーム送信ボタン */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              type="submit"
              size="lg"
              disabled={signing || (useLocalSigner && (!certificateFile || !privateKeyFile))}
              className="min-w-32"
            >
              {signing ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  署名中...
                </>
              ) : (
                <>
                  {useLocalSigner && (certificateFile && privateKeyFile) && <Shield className="mr-2 h-4 w-4" />}
                  {useLocalSigner ? 
                    (certificateFile && privateKeyFile ? 
                      "ローカル署名を実行" : 
                      "証明書と秘密鍵が必要です") : 
                    "C2PA情報を追加して署名"}
                </>
              )}
            </Button>
            
            {useLocalSigner && (
              <p className="text-xs text-muted-foreground">
                {certificateFile && privateKeyFile ? 
                  "本番環境用のローカル署名を実行します" : 
                  "証明書と秘密鍵の両方をアップロードしてください"}
              </p>
            )}
            
            {!useLocalSigner && (
              <p className="text-xs text-muted-foreground">
                テスト用の署名証明書を使用して署名します
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}