/**
 * 塗装ビジュアライゼーションシステム - 型定義
 *
 * お客様の家の写真をAIが加工して、塗装後のイメージ写真を作成するシステムの型定義
 */

/**
 * 塗料メーカー
 */
export type PaintManufacturer =
  | '日本ペイント'
  | '関西ペイント'
  | 'エスケー化研'
  | 'アステックペイント'
  | 'その他';

/**
 * 塗料の種類
 */
export type PaintType =
  | 'シリコン'
  | 'フッ素'
  | 'ウレタン'
  | 'アクリル'
  | '無機'
  | 'ラジカル制御';

/**
 * 塗料データ
 */
export interface Paint {
  /** 塗料ID */
  id: string;
  /** 品番 */
  productCode: string;
  /** 塗料名 */
  name: string;
  /** メーカー */
  manufacturer: PaintManufacturer;
  /** 塗料の種類 */
  type: PaintType;
  /** 色情報 */
  color: PaintColor;
  /** 価格（円/㎡） */
  pricePerSqm?: number;
  /** 耐用年数 */
  durabilityYears?: number;
  /** 説明 */
  description?: string;
}

/**
 * 色情報
 */
export interface PaintColor {
  /** 色名 */
  name: string;
  /** HEXカラーコード */
  hex: string;
  /** RGB値 */
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  /** 色番号（メーカー独自の番号） */
  colorCode?: string;
}

/**
 * 画像処理リクエスト
 */
export interface ImageProcessRequest {
  /** リクエストID */
  id: string;
  /** 元画像（Base64またはURL） */
  originalImage: string;
  /** 選択された塗料の品番リスト（複数パターン生成用） */
  paintProductCodes: string[];
  /** 処理オプション */
  options?: ImageProcessOptions;
  /** タイムスタンプ */
  timestamp: Date;
}

/**
 * 画像処理オプション
 */
export interface ImageProcessOptions {
  /** 画像品質（1-100） */
  quality?: number;
  /** 処理する最大画像数 */
  maxPatterns?: number;
  /** 画像の最大幅（px） */
  maxWidth?: number;
  /** 画像の最大高さ（px） */
  maxHeight?: number;
}

/**
 * 画像処理結果
 */
export interface ImageProcessResult {
  /** リクエストID */
  requestId: string;
  /** 処理状態 */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** 生成された画像リスト */
  generatedImages: GeneratedImage[];
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 処理時間（ミリ秒） */
  processingTimeMs?: number;
}

/**
 * 生成された画像
 */
export interface GeneratedImage {
  /** 画像ID */
  id: string;
  /** 使用された塗料 */
  paint: Paint;
  /** 生成された画像（Base64またはURL） */
  imageData: string;
  /** サムネイル画像 */
  thumbnail?: string;
  /** 生成日時 */
  createdAt: Date;
}

/**
 * プラットフォーム種別
 */
export type Platform = 'mobile' | 'desktop';

/**
 * ユーザーセッション
 */
export interface UserSession {
  /** セッションID */
  sessionId: string;
  /** プラットフォーム */
  platform: Platform;
  /** 作成日時 */
  createdAt: Date;
  /** 最終アクセス日時 */
  lastAccessAt: Date;
}

/**
 * 検索条件
 */
export interface PaintSearchCriteria {
  /** メーカーで絞り込み */
  manufacturer?: PaintManufacturer;
  /** 塗料の種類で絞り込み */
  type?: PaintType;
  /** 色名で検索 */
  colorName?: string;
  /** 品番で検索 */
  productCode?: string;
  /** 価格範囲（円/㎡） */
  priceRange?: {
    min?: number;
    max?: number;
  };
}
