/**
 * C2PAマニフェストに関するユーティリティ関数
 */
import { C2paAssertion } from "@/lib/types";

interface ManifestBuilderInterface {
    assertions?: C2paAssertion[];
    [key: string]: unknown;
}

/**
 * マニフェストにアサーションを追加するヘルパー関数
 * (C2PA Node.jsライブラリのManifestBuilderにはaddAssertionメソッドが存在しないため、
 * 代わりにassertions配列に直接追加するヘルパー関数)
 * 
 * @param manifest ManifestBuilderインスタンス 
 * @param assertion 追加するアサーション
 */
export function addAssertion(manifest: ManifestBuilderInterface, assertion: C2paAssertion) {
  // 既存のassertions配列を取得
  const assertions = manifest.assertions || [];
  
  // 新しいアサーションを追加
  assertions.push(assertion);
  
  // 更新されたassertions配列でマニフェストを更新
  manifest.assertions = assertions;
  
  return manifest;
}