/**
 * AI画像処理プロバイダー
 *
 * Stable Diffusionを使った画像生成機能
 */

import type { AIProcessingConfig, Paint } from './types.js';

/**
 * AI画像処理の基底クラス
 */
export abstract class AIImageProvider {
  protected config: AIProcessingConfig;

  constructor(config: AIProcessingConfig) {
    this.config = config;
  }

  /**
   * 画像を生成（image-to-image）
   */
  abstract generateImage(
    originalImage: string,
    paint: Paint,
    prompt: string
  ): Promise<string>;

  /**
   * プロバイダーの準備ができているか確認
   */
  abstract isReady(): boolean;
}

/**
 * Replicate APIプロバイダー
 *
 * Stable Diffusion img2imgモデルを使用
 */
export class ReplicateProvider extends AIImageProvider {
  private readonly API_URL = 'https://api.replicate.com/v1/predictions';
  private readonly DEFAULT_MODEL =
    'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf';

  constructor(config: AIProcessingConfig) {
    super(config);
  }

  /**
   * Replicate APIで画像を生成
   */
  async generateImage(
    originalImage: string,
    paint: Paint,
    prompt: string
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Replicate API key is required');
    }

    const model = this.config.modelName || this.DEFAULT_MODEL;

    // Replicate APIリクエスト
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        version: model,
        input: {
          image: originalImage,
          prompt: prompt,
          negative_prompt: this.generateNegativePrompt(),
          num_outputs: 1,
          num_inference_steps: this.config.steps || 50,
          guidance_scale: this.config.guidanceScale || 7.5,
          prompt_strength: this.config.strength || 0.8,
          scheduler: 'DPMSolverMultistep',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = (await response.json()) as {
      id: string;
      status: string;
    };

    // 処理完了まで待機
    return this.waitForCompletion(prediction.id);
  }

  /**
   * 処理完了まで待機
   */
  private async waitForCompletion(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 最大60回（約5分）
    const pollInterval = 5000; // 5秒ごとにチェック

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${this.API_URL}/${predictionId}`, {
        headers: {
          Authorization: `Token ${this.config.apiKey}`,
        },
      });

      const prediction = (await response.json()) as {
        status: string;
        output?: string[];
        error?: string;
      };

      if (prediction.status === 'succeeded') {
        // 生成された画像URLを返す
        if (prediction.output && prediction.output.length > 0) {
          return prediction.output[0];
        }
        throw new Error('No output image generated');
      }

      if (prediction.status === 'failed') {
        throw new Error(`Image generation failed: ${prediction.error || 'Unknown error'}`);
      }

      // 待機
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error('Image generation timeout');
  }

  /**
   * ネガティブプロンプトを生成
   */
  private generateNegativePrompt(): string {
    return 'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text';
  }

  isReady(): boolean {
    return !!this.config.apiKey;
  }
}

/**
 * Stability AI公式APIプロバイダー（参考実装）
 */
export class StabilityAIProvider extends AIImageProvider {
  private readonly API_URL = 'https://api.stability.ai/v1/generation';

  async generateImage(
    _originalImage: string,
    _paint: Paint,
    _prompt: string
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Stability AI API key is required');
    }

    // TODO: Stability AI APIの実装
    throw new Error('Stability AI provider not implemented yet');
  }

  isReady(): boolean {
    return !!this.config.apiKey;
  }
}

/**
 * ローカルStable Diffusionプロバイダー（参考実装）
 */
export class LocalProvider extends AIImageProvider {
  async generateImage(
    _originalImage: string,
    _paint: Paint,
    _prompt: string
  ): Promise<string> {
    // TODO: ローカルStable Diffusion APIの実装
    // AUTOMATIC1111 WebUI APIなどを使用
    throw new Error('Local provider not implemented yet');
  }

  isReady(): boolean {
    // ローカルサーバーの接続確認
    return false;
  }
}

/**
 * プロバイダーファクトリー
 */
export function createAIProvider(config: AIProcessingConfig): AIImageProvider {
  switch (config.provider) {
    case 'replicate':
      return new ReplicateProvider(config);
    case 'stability-ai':
      return new StabilityAIProvider(config);
    case 'local':
      return new LocalProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}
