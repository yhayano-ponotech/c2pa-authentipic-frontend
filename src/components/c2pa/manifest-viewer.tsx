import { useState } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  User, 
  Calendar, 
  Tag, 
  Shield, 
  Info 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { C2paManifestData, C2paAssertion, C2paIngredient } from "@/lib/types";

interface ManifestViewerProps {
  manifest: C2paManifestData;
}

export default function ManifestViewer({ manifest }: ManifestViewerProps) {
  const [showRawData, setShowRawData] = useState(false);

  if (!manifest) {
    return null;
  }

  const { active_manifest, manifests, validation_status } = manifest;

  // 検証ステータスに基づくバッジの色とアイコンを決定
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return {
          color: "success",
          icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
          text: "有効"
        };
      case "invalid":
        return {
          color: "destructive",
          icon: <XCircle className="h-4 w-4 mr-1" />,
          text: "無効"
        };
      default:
        return {
          color: "warning",
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          text: "警告あり"
        };
    }
  };

  const statusBadge = getStatusBadge(validation_status);

  // アクティブなマニフェストデータを取得
  const activeManifestData = manifests[active_manifest];

  // マニフェストの基本情報を整理
  const manifestInfo = {
    title: activeManifestData.title || "不明",
    generator: activeManifestData.claim_generator || "不明",
    format: activeManifestData.format || "不明",
    timestamp: activeManifestData.claim_timestamp || null
  };

  // アサーション（特定のデータ）を整理
  const assertions = activeManifestData.assertions || [];

  // 署名情報を整理
  const signatureInfo = activeManifestData.signature || {};

  // 材料（Ingredient）情報を整理
  const ingredients = activeManifestData.ingredients || [];

  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-xl">マニフェスト情報</CardTitle>
          <Badge variant={statusBadge.color as "success" | "destructive" | "warning"} className="text-xs flex items-center">
            {statusBadge.icon}
            {statusBadge.text}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">タイトル:</span>
                <span className="ml-2">{manifestInfo.title}</span>
              </div>
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">フォーマット:</span>
                <span className="ml-2">{manifestInfo.format}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">生成ツール:</span>
                <span className="ml-2">{manifestInfo.generator}</span>
              </div>
              {manifestInfo.timestamp && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">タイムスタンプ:</span>
                  <span className="ml-2">{formatDate(manifestInfo.timestamp)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アサーション情報 */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="assertions">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              アサーション情報
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {assertions.length > 0 ? (
              <div className="space-y-4 p-2">
                {assertions.map((assertion: C2paAssertion, index: number) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{assertion.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-60">
                        {JSON.stringify(assertion.data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">アサーション情報はありません。</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 署名情報 */}
        <AccordionItem value="signature">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              署名情報
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {Object.keys(signatureInfo).length > 0 ? (
              <Table>
                <TableBody>
                  {Object.entries(signatureInfo).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>
                        {typeof value === 'object' ? (
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">署名情報はありません。</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 材料（Ingredient）情報 */}
        {ingredients.length > 0 && (
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-lg font-medium">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                材料情報 ({ingredients.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {ingredients.map((ingredient: C2paIngredient, index: number) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{ingredient.title || `材料 ${index + 1}`}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          {ingredient.format && (
                            <TableRow>
                              <TableCell className="font-medium">フォーマット</TableCell>
                              <TableCell>{ingredient.format}</TableCell>
                            </TableRow>
                          )}
                          {ingredient.instanceId && (
                            <TableRow>
                              <TableCell className="font-medium">インスタンスID</TableCell>
                              <TableCell>{ingredient.instanceId}</TableCell>
                            </TableRow>
                          )}
                          {ingredient.documentId && (
                            <TableRow>
                              <TableCell className="font-medium">ドキュメントID</TableCell>
                              <TableCell>{ingredient.documentId}</TableCell>
                            </TableRow>
                          )}
                          {ingredient.relationship && (
                            <TableRow>
                              <TableCell className="font-medium">関係</TableCell>
                              <TableCell>{ingredient.relationship}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 生データ表示オプション */}
        <AccordionItem value="raw-data">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              生データ
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-2">
              <div className="flex justify-end mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? "概要表示" : "詳細表示"}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                {showRawData 
                  ? JSON.stringify(manifest, null, 2) 
                  : JSON.stringify(activeManifestData, null, 2)
                }
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}