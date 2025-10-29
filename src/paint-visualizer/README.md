# 塗装ビジュアライゼーションシステム

お客様の家の写真をAIが加工して、塗装後のイメージ写真を作成するシステムです。

## 機能

- ✅ **塗料データベース**: 日本ペイント、関西ペイントなど複数メーカーの塗料に対応
- ✅ **品番検索**: 品番による色指定機能
- ✅ **画像生成**: 家の写真 + 品番 → 塗装後のイメージ画像を自動生成
- ✅ **複数パターン**: 複数パターンのイメージ画像を同時に作成可能
- ✅ **クロスプラットフォーム**: モバイル・デスクトップ対応

## 使用例

### 塗料データベースの使用

```typescript
import { getPaintDatabase } from './paint-visualizer';

// データベースインスタンスを取得
const database = getPaintDatabase();

// 全塗料を取得
const allPaints = database.getAllPaints();
console.log(`登録塗料数: ${allPaints.length}`);

// メーカー別に取得
const nipponPaints = database.getPaintsByManufacturer('日本ペイント');

// 品番で検索
const paint = database.getPaintByProductCode('ND-050');
if (paint) {
  console.log(`塗料名: ${paint.name}`);
  console.log(`色: ${paint.color.name} (${paint.color.hex})`);
  console.log(`価格: ${paint.pricePerSqm}円/㎡`);
}

// 条件検索
const searchResults = database.searchPaints({
  manufacturer: '日本ペイント',
  type: 'シリコン',
  priceRange: { min: 2500, max: 3500 },
});
```

### 画像処理の使用

```typescript
import { processHouseImage } from './paint-visualizer';

// 画像を処理
const result = await processHouseImage(
  'base64_encoded_image_data', // 元画像
  ['ND-050', 'KP-200', 'SK-300'], // 塗料品番のリスト
  {
    quality: 90, // 画像品質
    maxPatterns: 3, // 最大パターン数
    maxWidth: 1920, // 最大幅
    maxHeight: 1080, // 最大高さ
  }
);

// 処理結果を確認
console.log(`処理状態: ${result.status}`);
console.log(`生成画像数: ${result.generatedImages.length}`);
console.log(`処理時間: ${result.processingTimeMs}ms`);

// 生成された画像を使用
result.generatedImages.forEach((image) => {
  console.log(`塗料: ${image.paint.name}`);
  console.log(`色: ${image.paint.color.name}`);
  console.log(`画像データ: ${image.imageData}`);
});
```

### 統合例

```typescript
import { getPaintDatabase, processHouseImage } from './paint-visualizer';

async function visualizePaintOptions(houseImage: string) {
  const database = getPaintDatabase();

  // 人気の塗料を取得
  const popularPaints = database.searchPaints({
    type: 'シリコン',
    priceRange: { min: 2500, max: 3500 },
  });

  // 品番を抽出
  const productCodes = popularPaints.map((p) => p.productCode);

  // 複数パターンの画像を生成
  const result = await processHouseImage(houseImage, productCodes, {
    maxPatterns: 5,
    quality: 85,
  });

  return result;
}
```

## データ構造

### Paint（塗料データ）

```typescript
interface Paint {
  id: string; // 塗料ID
  productCode: string; // 品番
  name: string; // 塗料名
  manufacturer: PaintManufacturer; // メーカー
  type: PaintType; // 塗料の種類
  color: PaintColor; // 色情報
  pricePerSqm?: number; // 価格（円/㎡）
  durabilityYears?: number; // 耐用年数
  description?: string; // 説明
}
```

### ImageProcessResult（画像処理結果）

```typescript
interface ImageProcessResult {
  requestId: string; // リクエストID
  status: 'pending' | 'processing' | 'completed' | 'failed'; // 処理状態
  generatedImages: GeneratedImage[]; // 生成された画像リスト
  error?: string; // エラーメッセージ
  processingTimeMs?: number; // 処理時間
}
```

## 対応塗料メーカー

- 日本ペイント
- 関西ペイント
- エスケー化研
- アステックペイント
- その他

## 対応塗料タイプ

- シリコン
- フッ素
- ウレタン
- アクリル
- 無機
- ラジカル制御

## 今後の実装予定

- [ ] AI画像処理エンジンの統合（Claude API / Stable Diffusion）
- [ ] リアルタイム画像プレビュー
- [ ] オフライン動作のサポート
- [ ] モバイルアプリUI
- [ ] デスクトップアプリUI
- [ ] 塗料データベースのAPI連携
- [ ] ユーザー認証機能
- [ ] 画像保存・共有機能

## ライセンス

MIT
