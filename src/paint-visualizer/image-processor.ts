/**
 * 画像処理エンジン
 *
 * お客様の家の写真を塗料で加工し、塗装後のイメージ画像を生成
 */

import type {
  ImageProcessRequest,
  ImageProcessResult,
  GeneratedImage,
  Paint,
  ImageProcessOptions,
  AIProcessingConfig,
} from './types.js';
import { getPaintDatabase } from './database.js';
import { createAIProvider } from './ai-provider.js';
import { generatePrompt } from './prompt-generator.js';

/**
 * 画像処理エンジンクラス
 */
export class ImageProcessor {
  private processingQueue: Map<string, ImageProcessRequest> = new Map();
  private results: Map<string, ImageProcessResult> = new Map();
  private aiConfig: AIProcessingConfig | null = null;

  /**
   * 画像処理リクエストを作成
   */
  async processImage(
    originalImage: string,
    paintProductCodes: string[],
    options?: ImageProcessOptions
  ): Promise<ImageProcessResult> {
    const request: ImageProcessRequest = {
      id: this.generateRequestId(),
      originalImage,
      paintProductCodes,
      options,
      timestamp: new Date(),
    };

    // リクエストをキューに追加
    this.processingQueue.set(request.id, request);

    // 初期結果を作成
    const result: ImageProcessResult = {
      requestId: request.id,
      status: 'processing',
      generatedImages: [],
    };

    this.results.set(request.id, result);

    try {
      // 画像処理を実行
      await this.executeImageProcessing(request, result);
      result.status = 'completed';
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * 画像処理を実行
   */
  private async executeImageProcessing(
    request: ImageProcessRequest,
    result: ImageProcessResult
  ): Promise<void> {
    const startTime = Date.now();
    const database = getPaintDatabase();

    // 塗料データを取得
    const paints = database.getPaintsByProductCodes(request.paintProductCodes);

    if (paints.length === 0) {
      throw new Error('指定された品番の塗料が見つかりません');
    }

    // 最大パターン数の制限
    const maxPatterns = request.options?.maxPatterns || paints.length;
    const paintsToProcess = paints.slice(0, maxPatterns);

    // 各塗料で画像を生成
    const generatedImages: GeneratedImage[] = [];

    for (const paint of paintsToProcess) {
      const generatedImage = await this.generatePaintedImage(
        request.originalImage,
        paint,
        request.options
      );
      generatedImages.push(generatedImage);
    }

    result.generatedImages = generatedImages;
    result.processingTimeMs = Date.now() - startTime;
  }

  /**
   * AI処理設定をセット
   */
  setAIConfig(config: AIProcessingConfig): void {
    this.aiConfig = config;
  }

  /**
   * 塗装後の画像を生成（Stable Diffusion統合版）
   */
  private async generatePaintedImage(
    originalImage: string,
    paint: Paint,
    _options?: ImageProcessOptions
  ): Promise<GeneratedImage> {
    let processedImage: string;

    // AI処理設定がある場合は実際のAI処理を実行
    if (this.aiConfig && this.aiConfig.apiKey) {
      try {
        processedImage = await this.processWithAI(originalImage, paint);
      } catch (error) {
        console.error('AI processing failed, falling back to mock:', error);
        processedImage = this.mockImageProcessing(originalImage, paint);
      }
    } else {
      // API keyがない場合はモック処理
      console.warn('AI config not set, using mock processing');
      processedImage = this.mockImageProcessing(originalImage, paint);
    }

    return {
      id: this.generateImageId(),
      paint,
      imageData: processedImage,
      thumbnail: this.generateThumbnail(processedImage),
      createdAt: new Date(),
    };
  }

  /**
   * Stable Diffusionで実際の画像処理を実行
   */
  private async processWithAI(originalImage: string, paint: Paint): Promise<string> {
    if (!this.aiConfig) {
      throw new Error('AI config not set');
    }

    // AIプロバイダーを作成
    const provider = createAIProvider(this.aiConfig);

    if (!provider.isReady()) {
      throw new Error('AI provider is not ready');
    }

    // プロンプトを生成
    const prompt = generatePrompt(paint);

    console.log(`Generating image with prompt: ${prompt}`);

    // AI画像生成を実行
    const generatedImageUrl = await provider.generateImage(originalImage, paint, prompt);

    return generatedImageUrl;
  }

  /**
   * モック画像処理（フォールバック用）
   */
  private mockImageProcessing(originalImage: string, paint: Paint): string {
    // モックとして元画像のメタデータを返す
    return `mock_processed_${paint.productCode}_${originalImage.substring(0, 20)}`;
  }

  /**
   * サムネイル画像を生成
   */
  private generateThumbnail(imageData: string): string {
    // URLの場合はそのまま使用（Replicateは自動でサムネイル生成）
    if (imageData.startsWith('http')) {
      return imageData;
    }
    // Base64の場合はサムネイルフラグを追加
    return `thumbnail_${imageData.substring(0, 50)}`;
  }

  /**
   * 処理結果を取得
   */
  getResult(requestId: string): ImageProcessResult | undefined {
    return this.results.get(requestId);
  }

  /**
   * 処理状態を確認
   */
  getStatus(requestId: string): 'pending' | 'processing' | 'completed' | 'failed' | 'not_found' {
    const result = this.results.get(requestId);
    return result ? result.status : 'not_found';
  }

  /**
   * 複数パターンの画像を一括生成
   */
  async processBatch(
    originalImage: string,
    paintProductCodes: string[],
    options?: ImageProcessOptions
  ): Promise<ImageProcessResult> {
    return this.processImage(originalImage, paintProductCodes, options);
  }

  /**
   * 画像サイズを調整
   */
  private resizeImage(
    imageData: string,
    _maxWidth?: number,
    _maxHeight?: number
  ): string {
    // TODO: 実際の画像リサイズロジック
    return imageData;
  }

  /**
   * 画像品質を最適化
   */
  private optimizeQuality(imageData: string, _quality?: number): string {
    // TODO: 実際の画像品質最適化ロジック
    return imageData;
  }

  /**
   * リクエストIDを生成
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 画像IDを生成
   */
  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.processingQueue.clear();
    this.results.clear();
  }

  /**
   * 統計情報を取得
   */
  getStatistics(): {
    totalRequests: number;
    completedRequests: number;
    failedRequests: number;
    processingRequests: number;
  } {
    const results = Array.from(this.results.values());

    return {
      totalRequests: results.length,
      completedRequests: results.filter((r) => r.status === 'completed').length,
      failedRequests: results.filter((r) => r.status === 'failed').length,
      processingRequests: results.filter((r) => r.status === 'processing').length,
    };
  }
}

/**
 * シングルトンインスタンス
 */
let processorInstance: ImageProcessor | null = null;

/**
 * 画像処理エンジンインスタンスを取得
 */
export function getImageProcessor(): ImageProcessor {
  if (!processorInstance) {
    processorInstance = new ImageProcessor();
  }
  return processorInstance;
}

/**
 * 簡易API: 画像を処理
 */
export async function processHouseImage(
  originalImage: string,
  paintProductCodes: string[],
  options?: ImageProcessOptions
): Promise<ImageProcessResult> {
  const processor = getImageProcessor();
  return processor.processImage(originalImage, paintProductCodes, options);
}
