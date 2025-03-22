import React from "react";
import {
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Lock,
  User,
  Calendar,
  Info
} from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { CertificateTrustInfo as CertificateTrustInfoType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CertificateTrustInfoProps {
  trustInfo: CertificateTrustInfoType;
  showDetails?: boolean;
}

/**
 * 証明書の信頼性情報を表示するコンポーネント
 */
export default function CertificateTrustInfo({
  trustInfo,
  showDetails = true
}: CertificateTrustInfoProps) {
  const { isTrusted, issuer, timestamp, errorMessage } = trustInfo;

  return (
    <div className="space-y-3">
      {/* 信頼性ステータス */}
      {isTrusted ? (
        <div className="flex items-center text-green-600">
          <Lock className="h-4 w-4 mr-2" />
          <span className="font-medium">
            この証明書は信頼できる発行元からのものです
          </span>
        </div>
      ) : (
        <div className="flex items-center text-orange-600">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {errorMessage || "この証明書は既知の信頼できる発行元からのものではありません"}
          </span>
        </div>
      )}

      {/* 証明書の詳細情報 */}
      {showDetails && (
        <div className="mt-2 space-y-2">
          {issuer && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">発行元:</span>
              <span className="ml-2 text-sm">{issuer}</span>
            </div>
          )}
          
          {timestamp && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">署名日時:</span>
              <span className="ml-2 text-sm">{formatDate(timestamp)}</span>
            </div>
          )}
        </div>
      )}

      {/* 説明文 */}
      <Alert className={cn("bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mt-2")}>
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-sm">
          Content Credentials（C2PA）は、既知の証明書リストを使用して署名の信頼性を検証します。
          このリストには信頼できる発行元からの証明書が含まれています。
          証明書が信頼できないと表示されても、コンテンツ自体が不正であるということではなく、
          署名元が公式に認識されていないことを意味します。
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * 証明書信頼性のバッジコンポーネント（コンパクト表示用）
 */
export function CertificateTrustBadge({
  trustInfo,
  className
}: {
  trustInfo: CertificateTrustInfoType;
  className?: string;
}) {
  const { isTrusted } = trustInfo;

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      isTrusted 
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      className
    )}>
      {isTrusted ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>信頼済み証明書</span>
        </>
      ) : (
        <>
          <ShieldX className="h-3 w-3" />
          <span>未確認の証明書</span>
        </>
      )}
    </div>
  );
}