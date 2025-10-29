/**
 * プロンプト生成ユーティリティ
 *
 * 塗料情報から Stable Diffusion用のプロンプトを生成
 */

import type { Paint, PromptGenerationConfig } from './types.js';

/**
 * プロンプトジェネレータークラス
 */
export class PromptGenerator {
  private config: PromptGenerationConfig;

  constructor(config: PromptGenerationConfig = {}) {
    this.config = {
      basePrompt: config.basePrompt || 'a house exterior',
      negativePrompt:
        config.negativePrompt ||
        'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text',
      includeColorDescription: config.includeColorDescription !== false,
      includePaintTypeDescription: config.includePaintTypeDescription !== false,
    };
  }

  /**
   * 塗料情報からプロンプトを生成
   */
  generatePrompt(paint: Paint): string {
    const parts: string[] = [];

    // ベースプロンプト
    if (this.config.basePrompt) {
      parts.push(this.config.basePrompt);
    }

    // 色の説明
    if (this.config.includeColorDescription) {
      parts.push(this.generateColorDescription(paint));
    }

    // 塗料タイプの説明
    if (this.config.includePaintTypeDescription) {
      parts.push(this.generatePaintTypeDescription(paint));
    }

    // 品質と仕上がりの説明
    parts.push(this.generateQualityDescription(paint));

    return parts.join(', ');
  }

  /**
   * 色の説明を生成
   */
  private generateColorDescription(paint: Paint): string {
    const colorName = paint.color.name;
    const hex = paint.color.hex;

    // 日本の色名を英語に変換
    const colorDescriptions: Record<string, string> = {
      クリームホワイト: 'cream white',
      ピュアホワイト: 'pure white',
      アイボリー: 'ivory',
      ベージュ: 'beige',
      ライトグレー: 'light gray',
    };

    const englishColor = colorDescriptions[colorName] || colorName.toLowerCase();

    return `painted in ${englishColor} (${hex})`;
  }

  /**
   * 塗料タイプの説明を生成
   */
  private generatePaintTypeDescription(paint: Paint): string {
    const typeDescriptions: Record<string, string> = {
      シリコン: 'silicon resin paint finish',
      フッ素: 'fluorine resin paint finish',
      ウレタン: 'urethane paint finish',
      アクリル: 'acrylic paint finish',
      無機: 'inorganic paint finish',
      ラジカル制御: 'radical control paint finish',
    };

    return typeDescriptions[paint.type] || 'high-quality paint finish';
  }

  /**
   * 品質と仕上がりの説明を生成
   */
  private generateQualityDescription(_paint: Paint): string {
    return [
      'professional quality',
      'smooth and even coating',
      'realistic texture',
      'natural lighting',
      'photorealistic',
      'high detail',
      '8k resolution',
    ].join(', ');
  }

  /**
   * ネガティブプロンプトを取得
   */
  getNegativePrompt(): string {
    return this.config.negativePrompt || '';
  }

  /**
   * プロンプトをカスタマイズ
   */
  customizePrompt(paint: Paint, additions: string[]): string {
    const basePrompt = this.generatePrompt(paint);
    return [basePrompt, ...additions].join(', ');
  }
}

/**
 * デフォルトのプロンプトジェネレーター
 */
let defaultGenerator: PromptGenerator | null = null;

/**
 * プロンプトジェネレーターインスタンスを取得
 */
export function getPromptGenerator(config?: PromptGenerationConfig): PromptGenerator {
  if (!defaultGenerator || config) {
    defaultGenerator = new PromptGenerator(config);
  }
  return defaultGenerator;
}

/**
 * 簡易API: プロンプトを生成
 */
export function generatePrompt(paint: Paint, config?: PromptGenerationConfig): string {
  const generator = getPromptGenerator(config);
  return generator.generatePrompt(paint);
}
