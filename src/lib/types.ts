// C2PAマニフェスト関連の型定義

export interface C2paAssertion {
  label: string;
  data: Record<string, unknown>;
}

export interface C2paAction {
  action: string;
  when?: string;
  [key: string]: unknown;
}

export interface C2paIngredient {
  title: string;
  format?: string;
  instanceId?: string;
  documentId?: string;
  relationship?: string;
  validationData?: unknown;
  [key: string]: unknown;
}

export interface C2paManifest {
  claim_generator: string;
  format: string;
  title: string;
  assertions: C2paAssertion[];
  ingredients?: C2paIngredient[];
  signature?: {
    type: string;
    certificate: string;
    timestamp?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface C2paManifestData {
  active_manifest: string;
  manifests: Record<string, C2paManifest>;
  validation_status: string;
  validation_errors?: string[];
  validation_warnings?: string[];
  [key: string]: unknown;
}

// 画像メタデータの型
export interface AssetMetadata {
  name: string;
  size: number;
  mimeType: string;
  lastModified: number;
  [key: string]: unknown;
}

// 署名データの型
export interface SignData {
  fileId: string;
  manifestData: {
    title: string;
    creator?: string;
    copyright?: string;
    description?: string;
    claimGenerator: string;
    format?: string;
    assertions: C2paAssertion[];
    [key: string]: unknown;
  };
  certificate?: {
    content: string;
    name: string;
  };
  privateKey?: {
    content: string;
    name: string;
  };
  useLocalSigner?: boolean;
}

// マニフェスト検証詳細の型
export interface ManifestValidationDetail {
  code: string;
  explanation: string;
  url?: string | null;
}

// 署名情報の型を定義
export interface SignatureInfo {
  type?: string;
  certificate?: string;
  issuer?: string | null;
  time?: string | null;
  timeObject?: Date | null;
  [key: string]: unknown;
}

export interface ManifestValidationInfo {
  label: string;
  title: string;
  isActive: boolean;
  signatureInfo: SignatureInfo | null;
  signatureTime?: string | Date;
  signatureIssuer?: string;
  validationDetails: ManifestValidationDetail[];
  ingredientIssues?: string[];
}

// マニフェストストア情報の型
export interface ManifestStoreInfo {
  validationStatus: string;
  activeManifestLabel: string | null;
  manifestsCount: number;
}

// アクティブマニフェスト情報の型
export interface ActiveManifestInfo {
  label: string;
  title: string;
  format: string;
  generator: string;
  signatureInfo: SignatureInfo | null;
  assertionsCount: number;
  ingredientsCount: number;
}

// 証明書信頼性情報の型
export interface CertificateTrustInfo {
  isTrusted: boolean;
  issuer: string | null;
  timestamp: string | null;
  errorMessage: string | null;
}

// 拡張された検証結果の型
export interface ValidationDetails {
  status: string;
  errors: string[];
  warnings: string[];
  manifestValidations: ManifestValidationInfo[];
  manifestStore?: ManifestStoreInfo;
  activeManifest?: ActiveManifestInfo;
  details?: Record<string, unknown>;
  certificateTrust?: CertificateTrustInfo;
}

// 検証結果の型
export interface VerificationResult {
  isValid: boolean;
  validationDetails: ValidationDetails;
}

// アップロードファイル情報の型
export interface UploadedFileInfo {
  id: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  expiresAt: Date;
}

// リソース参照の型
export interface ResourceRef {
  format: string;
  identifier: string;
}

// C2PA署名設定の型
export interface SigningConfig {
  algorithmName: string;
  tsaUrl?: string;
  useTrustStore?: boolean;
}

// C2PAマニフェストビルダーのオプション型
export interface ManifestBuilderOptions {
  vendor?: string;
  includeCreatedAction?: boolean;
  includeThumbnail?: boolean;
}