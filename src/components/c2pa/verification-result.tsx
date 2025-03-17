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
    Info
  } from "lucide-react";
  import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
  } from "@/components/ui/accordion";
  import { VerificationResult as VerificationResultType } from "@/lib/types";
  import { cn } from "@/lib/utils";
  
  interface VerificationResultProps {
    verificationData: VerificationResultType;
  }
  
  export default function VerificationResult({
    verificationData,
  }: VerificationResultProps) {
    const { isValid, status, details, errors = [], warnings = [] } = verificationData;
  
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
  
        {/* エラーと警告 */}
        {(errors.length > 0 || warnings.length > 0) && (
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
                        <AlertDescription>{warning}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
  
        {/* 検証の詳細情報 */}
        {details && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                詳細な検証情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-60">
                {JSON.stringify(details, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
  
        {/* 検証についての情報 */}
        <Alert className={cn("bg-blue-50 border-blue-200")}>
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