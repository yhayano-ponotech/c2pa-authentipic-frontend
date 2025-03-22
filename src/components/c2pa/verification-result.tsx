import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Shield,
  AlertCircle,
  Info,
  Calendar,
  FileType,
  User,
  FileText,
  Hash,
  Clock,
  Lock,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerificationResult as VerificationResultType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface VerificationResultProps {
  verificationData: VerificationResultType;
}

export default function VerificationResult({
  verificationData,
}: VerificationResultProps) {
  const { isValid, validationDetails } = verificationData;
  
  // validationDetailsがundefinedの場合にデフォルト値を設定
  const { 
    status = "invalid", 
    errors = [], 
    warnings = [], 
    manifestValidations = [], 
    activeManifest, 
    manifestStore,
    certificateTrust
  } = validationDetails || {};

  // 検証ステータスに基づくスタイルとアイコンを決定
  const getStatusInfo = () => {
    if (isValid) {
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        title: "検証成功",
        description: "C2PA署名は有効です。",
        color: "text-green-500",
        badgeVariant: "secondary" as const,
        badgeText: "有効",
        bgColor: "border-l-green-500"
      };
    } else if (status === "warning") {
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "警告あり",
        description: "C2PA署名に警告があります。",
        color: "text-yellow-500",
        badgeVariant: "outline" as const,
        badgeText: "警告",
        bgColor: "border-l-yellow-500"
      };
    } else {
      return {
        icon: <XCircle className="h-5 w-5" />,
        title: "検証失敗",
        description: "C2PA署名は無効です。",
        color: "text-red-500",
        badgeVariant: "destructive" as const,
        badgeText: "無効",
        bgColor: "border-l-red-500"
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      {/* メインステータス */}
      <Card className={`border-l-4 ${isValid ? 'border-l-green-500' : status === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center">
            <div className={`mr-4 ${statusInfo.color}`}>
              {statusInfo.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.badgeVariant}>{statusInfo.badgeText}</Badge>
        </CardHeader>
        <CardContent>
          {isValid ? (
            <p className="text-sm text-muted-foreground">
              この画像のC2PA情報は正規の署名を持ち、改ざんされていないことが確認されました。
              コンテンツの出所と完全性が保証されています。
            </p>
          ) : status === "warning" ? (
            <p className="text-sm text-muted-foreground">
              この画像のC2PA情報に警告があります。
              コンテンツは安全に使用できる可能性がありますが、一部の情報に問題がある可能性があります。
              <span className="font-medium text-yellow-600">詳細は警告セクションをご確認ください。</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              この画像のC2PA情報に問題があります。
              署名が無効であるか、コンテンツが改ざんされている可能性があります。
              慎重に取り扱ってください。
            </p>
          )}
        </CardContent>
      </Card>

      {/* 証明書信頼性情報 */}
      {certificateTrust && (
        <Card className={cn(
          "border-l-4",
          certificateTrust.isTrusted ? "border-l-green-500" : "border-l-orange-500"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              {certificateTrust.isTrusted ? (
                <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <ShieldX className="h-5 w-5 mr-2 text-orange-500" />
              )}
              証明書の信頼性
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificateTrust.isTrusted ? (
                <div className="flex items-center text-green-600">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>
                    この証明書は信頼できる発行元からのものです
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>
                    {certificateTrust.errorMessage || "この証明書は既知の信頼できる発行元からのものではありません"}
                  </span>
                </div>
              )}

              {certificateTrust.issuer && (
                <div className="flex items-center mt-2">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">発行元:</span>
                  <span className="ml-2 text-sm">{certificateTrust.issuer}</span>
                </div>
              )}
              
              {certificateTrust.timestamp && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">署名日時:</span>
                  <span className="ml-2 text-sm">{formatDate(certificateTrust.timestamp)}</span>
                </div>
              )}

              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mt-2">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm">
                  Content Credentials（C2PA）は、既知の証明書リストを使用して署名の信頼性を検証します。
                  このリストには信頼できる発行元からの証明書が含まれています。
                  証明書が信頼できないと表示されても、コンテンツ自体が不正であるということではなく、
                  署名元が公式に認識されていないことを意味します。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* アクティブマニフェスト情報 */}
      {activeManifest && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              アクティブなマニフェスト情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">タイトル:</span>
                  <span className="ml-2 text-sm">{activeManifest.title || "不明"}</span>
                </div>
                <div className="flex items-center">
                  <FileType className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">フォーマット:</span>
                  <span className="ml-2 text-sm">{activeManifest.format || "不明"}</span>
                </div>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">ラベル:</span>
                  <span className="ml-2 text-sm truncate max-w-xs" title={activeManifest.label || "不明"}>
                    {activeManifest.label || "不明"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">生成元:</span>
                  <span className="ml-2 text-sm">{activeManifest.generator || "不明"}</span>
                </div>
                {activeManifest.signatureInfo?.time && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">署名日時:</span>
                    <span className="ml-2 text-sm">{formatDate(activeManifest.signatureInfo.time)}</span>
                  </div>
                )}
                {activeManifest.signatureInfo?.issuer && (
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">発行者:</span>
                    <span className="ml-2 text-sm">{activeManifest.signatureInfo.issuer}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* エラーと警告 */}
      {(errors.length > 0 || warnings.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">検証結果の詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {errors.length > 0 && (
                <AccordionItem value="errors">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      エラー ({errors.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-2">
                      {errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {warnings.length > 0 && (
                <AccordionItem value="warnings">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center text-yellow-500">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      警告 ({warnings.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-2">
                      {warnings.map((warning, index) => (
                        <Alert key={index} className="border-yellow-500 text-yellow-700">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* マニフェスト検証の詳細 */}
      {manifestValidations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              マニフェスト検証詳細
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {manifestValidations.map((manifest, index) => (
                <AccordionItem key={index} value={`manifest-${index}`}>
                  <AccordionTrigger className="text-base">
                    <div className="flex items-center">
                      {manifest.isActive && (
                        <Badge variant="outline" className="mr-2">アクティブ</Badge>
                      )}
                      <span>{manifest.title || `マニフェスト ${index + 1}`}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {/* マニフェスト基本情報 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">ラベル:</span>
                          <span className="ml-1 truncate">{manifest.label}</span>
                        </div>
                        {manifest.signatureTime && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="font-medium">署名日時:</span>
                            <span className="ml-1">
                              {typeof manifest.signatureTime === 'string' 
                                ? formatDate(manifest.signatureTime)
                                : manifest.signatureTime.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {manifest.signatureIssuer && (
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="font-medium">発行者:</span>
                            <span className="ml-1">{manifest.signatureIssuer}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 検証詳細 */}
                      {manifest.validationDetails && manifest.validationDetails.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">検証詳細</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/4">コード</TableHead>
                                <TableHead>説明</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {manifest.validationDetails.map((detail, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-mono text-xs">{detail.code}</TableCell>
                                  <TableCell>{detail.explanation}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      {/* 材料に関する問題 */}
                      {manifest.ingredientIssues && manifest.ingredientIssues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">材料に関する問題</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {manifest.ingredientIssues.map((issue, i) => (
                              <li key={i} className="text-yellow-700">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* 詳細な技術情報 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Info className="h-4 w-4 mr-2" />
            技術詳細
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="technical-details">
              <AccordionTrigger className="text-base">
                詳細な検証情報
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-medium mb-2">マニフェストストア情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">検証ステータス:</span> {manifestStore?.validationStatus || "不明"}
                      </div>
                      <div>
                        <span className="font-medium">アクティブマニフェスト:</span> {manifestStore?.activeManifestLabel || "なし"}
                      </div>
                      <div>
                        <span className="font-medium">マニフェスト数:</span> {manifestStore?.manifestsCount || 0}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* マニフェスト全体の技術情報をJSON表示 */}
                  <div>
                    <h4 className="font-medium mb-2">完全な検証データ</h4>
                    <div className="bg-muted rounded-md p-4 max-h-96 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {JSON.stringify(validationDetails, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* 検証についての情報 */}
      <Alert className={cn("bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800")}>
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>C2PA検証について</AlertTitle>
        <AlertDescription>
          C2PA検証は、画像に埋め込まれたデジタル署名を検証することで、
          コンテンツの出所と完全性を確認します。検証には、署名の有効性チェック、
          ハッシュ値の検証、証明書チェーンの検証などが含まれます。
        </AlertDescription>
      </Alert>
    </div>
  );
}