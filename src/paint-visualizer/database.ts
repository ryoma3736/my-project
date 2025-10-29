/**
 * 塗料データベースモジュール
 *
 * 日本ペイント、関西ペイントなど複数メーカーの塗料データを管理
 */

import type { Paint, PaintSearchCriteria, PaintManufacturer } from './types.js';

/**
 * 塗料データベースクラス
 */
export class PaintDatabase {
  private paints: Map<string, Paint> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  /**
   * サンプル塗料データを初期化
   */
  private initializeSampleData(): void {
    const samplePaints: Paint[] = [
      // 日本ペイント
      {
        id: 'np-001',
        productCode: 'ND-050',
        name: 'ファインシリコンフレッシュ',
        manufacturer: '日本ペイント',
        type: 'シリコン',
        color: {
          name: 'クリームホワイト',
          hex: '#F5F5DC',
          rgb: { r: 245, g: 245, b: 220 },
          colorCode: 'ND-050',
        },
        pricePerSqm: 2800,
        durabilityYears: 12,
        description: '耐候性に優れたシリコン樹脂塗料',
      },
      {
        id: 'np-002',
        productCode: 'ND-101',
        name: 'パーフェクトトップ',
        manufacturer: '日本ペイント',
        type: 'ラジカル制御',
        color: {
          name: 'ピュアホワイト',
          hex: '#FFFFFF',
          rgb: { r: 255, g: 255, b: 255 },
          colorCode: 'ND-101',
        },
        pricePerSqm: 3200,
        durabilityYears: 15,
        description: 'ラジカル制御型高耐久塗料',
      },
      // 関西ペイント
      {
        id: 'kp-001',
        productCode: 'KP-200',
        name: 'アレスダイナミックTOP',
        manufacturer: '関西ペイント',
        type: 'フッ素',
        color: {
          name: 'アイボリー',
          hex: '#FFFFF0',
          rgb: { r: 255, g: 255, b: 240 },
          colorCode: 'KP-200',
        },
        pricePerSqm: 4500,
        durabilityYears: 18,
        description: '超高耐久フッ素樹脂塗料',
      },
      {
        id: 'kp-002',
        productCode: 'KP-150',
        name: 'セラMシリコンIII',
        manufacturer: '関西ペイント',
        type: 'シリコン',
        color: {
          name: 'ベージュ',
          hex: '#F5F5DC',
          rgb: { r: 245, g: 245, b: 220 },
          colorCode: 'KP-150',
        },
        pricePerSqm: 2900,
        durabilityYears: 13,
        description: '高性能シリコン樹脂塗料',
      },
      // エスケー化研
      {
        id: 'sk-001',
        productCode: 'SK-300',
        name: 'エスケープレミアムシリコン',
        manufacturer: 'エスケー化研',
        type: 'シリコン',
        color: {
          name: 'ライトグレー',
          hex: '#D3D3D3',
          rgb: { r: 211, g: 211, b: 211 },
          colorCode: 'SK-300',
        },
        pricePerSqm: 3000,
        durabilityYears: 14,
        description: 'プレミアムシリコン塗料',
      },
    ];

    samplePaints.forEach((paint) => {
      this.paints.set(paint.productCode, paint);
    });
  }

  /**
   * 品番で塗料を取得
   */
  getPaintByProductCode(productCode: string): Paint | undefined {
    return this.paints.get(productCode);
  }

  /**
   * 複数の品番で塗料を一括取得
   */
  getPaintsByProductCodes(productCodes: string[]): Paint[] {
    return productCodes
      .map((code) => this.getPaintByProductCode(code))
      .filter((paint): paint is Paint => paint !== undefined);
  }

  /**
   * 全塗料を取得
   */
  getAllPaints(): Paint[] {
    return Array.from(this.paints.values());
  }

  /**
   * メーカー別に塗料を取得
   */
  getPaintsByManufacturer(manufacturer: PaintManufacturer): Paint[] {
    return this.getAllPaints().filter((paint) => paint.manufacturer === manufacturer);
  }

  /**
   * 検索条件に基づいて塗料を検索
   */
  searchPaints(criteria: PaintSearchCriteria): Paint[] {
    let results = this.getAllPaints();

    // メーカーで絞り込み
    if (criteria.manufacturer) {
      results = results.filter((paint) => paint.manufacturer === criteria.manufacturer);
    }

    // 塗料の種類で絞り込み
    if (criteria.type) {
      results = results.filter((paint) => paint.type === criteria.type);
    }

    // 色名で検索
    if (criteria.colorName) {
      const colorNameLower = criteria.colorName.toLowerCase();
      results = results.filter((paint) =>
        paint.color.name.toLowerCase().includes(colorNameLower)
      );
    }

    // 品番で検索
    if (criteria.productCode) {
      results = results.filter((paint) =>
        paint.productCode.includes(criteria.productCode!)
      );
    }

    // 価格範囲で絞り込み
    if (criteria.priceRange) {
      if (criteria.priceRange.min !== undefined) {
        results = results.filter(
          (paint) => paint.pricePerSqm && paint.pricePerSqm >= criteria.priceRange!.min!
        );
      }
      if (criteria.priceRange.max !== undefined) {
        results = results.filter(
          (paint) => paint.pricePerSqm && paint.pricePerSqm <= criteria.priceRange!.max!
        );
      }
    }

    return results;
  }

  /**
   * 塗料を追加
   */
  addPaint(paint: Paint): void {
    this.paints.set(paint.productCode, paint);
  }

  /**
   * 塗料を更新
   */
  updatePaint(productCode: string, paint: Partial<Paint>): boolean {
    const existing = this.paints.get(productCode);
    if (!existing) {
      return false;
    }

    const updated = { ...existing, ...paint };
    this.paints.set(productCode, updated);
    return true;
  }

  /**
   * 塗料を削除
   */
  deletePaint(productCode: string): boolean {
    return this.paints.delete(productCode);
  }

  /**
   * データベースの統計情報を取得
   */
  getStatistics(): {
    totalPaints: number;
    byManufacturer: Record<string, number>;
    byType: Record<string, number>;
  } {
    const paints = this.getAllPaints();
    const byManufacturer: Record<string, number> = {};
    const byType: Record<string, number> = {};

    paints.forEach((paint) => {
      byManufacturer[paint.manufacturer] = (byManufacturer[paint.manufacturer] || 0) + 1;
      byType[paint.type] = (byType[paint.type] || 0) + 1;
    });

    return {
      totalPaints: paints.length,
      byManufacturer,
      byType,
    };
  }
}

/**
 * シングルトンインスタンス
 */
let databaseInstance: PaintDatabase | null = null;

/**
 * 塗料データベースインスタンスを取得
 */
export function getPaintDatabase(): PaintDatabase {
  if (!databaseInstance) {
    databaseInstance = new PaintDatabase();
  }
  return databaseInstance;
}
