/**
 * 塗装ビジュアライゼーションシステム
 *
 * お客様の家の写真をAIが加工して、塗装後のイメージ写真を作成するシステム
 *
 * @example
 * ```typescript
 * import { processHouseImage, getPaintDatabase } from './paint-visualizer';
 *
 * // 塗料データベースから塗料を取得
 * const database = getPaintDatabase();
 * const paints = database.searchPaints({ manufacturer: '日本ペイント' });
 *
 * // 画像を処理
 * const result = await processHouseImage(
 *   'base64_image_data',
 *   ['ND-050', 'KP-200'],
 *   { quality: 90, maxPatterns: 3 }
 * );
 *
 * console.log(result.generatedImages);
 * ```
 */

// 型定義のエクスポート
export type {
  Paint,
  PaintColor,
  PaintManufacturer,
  PaintType,
  PaintSearchCriteria,
  ImageProcessRequest,
  ImageProcessResult,
  ImageProcessOptions,
  GeneratedImage,
  Platform,
  UserSession,
} from './types.js';

// データベース機能のエクスポート
export { PaintDatabase, getPaintDatabase } from './database.js';

// 画像処理機能のエクスポート
export {
  ImageProcessor,
  getImageProcessor,
  processHouseImage,
} from './image-processor.js';

/**
 * バージョン情報
 */
export const VERSION = '1.0.0';

/**
 * システム情報
 */
export const SYSTEM_INFO = {
  name: '塗装ビジュアライゼーションシステム',
  version: VERSION,
  description: 'お客様の家の写真をAIが加工して、塗装後のイメージ写真を作成するシステム',
  supportedManufacturers: ['日本ペイント', '関西ペイント', 'エスケー化研', 'アステックペイント'],
  supportedPlatforms: ['mobile', 'desktop'],
} as const;
