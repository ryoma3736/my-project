# 塗装ビジュアライゼーションシステム

お客様の家の写真をAIが加工して、塗装後のイメージ写真を作成するシステムです。

## 機能

- ✅ **塗料データベース**: 日本ペイント、関西ペイントなど複数メーカーの塗料に対応
- ✅ **品番検索**: 品番による色指定機能
- ✅ **画像生成**: 家の写真 + 品番 → 塗装後のイメージ画像を自動生成
- ✅ **複数パターン**: 複数パターンのイメージ画像を同時に作成可能
- ✅ **クロスプラットフォーム**: モバイル・デスクトップ対応

## セットアップ

### 環境変数の設定

`.env`ファイルを作成してReplicate API Keyを設定：

```bash
# Replicate API Key（https://replicate.com/で取得）
REPLICATE_API_KEY=r8_your_api_key_here

# AI設定（オプション）
AI_PROVIDER=replicate
AI_IMAGE_STRENGTH=0.8
AI_GUIDANCE_SCALE=7.5
AI_STEPS=50
```

## 使用例

### 1. Stable Diffusionで実際の画像生成

```typescript
import { getImageProcessor, getPaintDatabase } from './paint-visualizer';

// AI設定をセット
const processor = getImageProcessor();
processor.setAIConfig({
  provider: 'replicate',
  apiKey: process.env.REPLICATE_API_KEY,
  strength: 0.8,
  guidanceScale: 7.5,
  steps: 50,
});

// 塗料を取得
const database = getPaintDatabase();
const paint = database.getPaintByProductCode('ND-050');

// 実際の画像を生成
const result = await processor.processImage(
  'https://example.com/house.jpg', // 元画像URL
  ['ND-050', 'KP-200'], // 塗料品番リスト
  { quality: 90, maxPatterns: 3 }
);

console.log('Generated images:', result.generatedImages);
```

### 2. 塗料データベースの使用

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

### 3. カスタムプロンプトで画像生成

```typescript
import { getImageProcessor, generatePrompt, getPaintDatabase } from './paint-visualizer';

const processor = getImageProcessor();
processor.setAIConfig({
  provider: 'replicate',
  apiKey: process.env.REPLICATE_API_KEY!,
});

const database = getPaintDatabase();
const paint = database.getPaintByProductCode('ND-050')!;

// プロンプトを生成
const prompt = generatePrompt(paint, {
  basePrompt: 'modern house exterior, sunny day',
  includeColorDescription: true,
  includePaintTypeDescription: true,
});

console.log('Generated prompt:', prompt);
// Output: "modern house exterior, sunny day, painted in cream white (#F5F5DC), silicon resin paint finish, professional quality..."
```

### 4. モックモードでテスト（API Keyなし）

```typescript
import { processHouseImage } from './paint-visualizer';

// API Key設定なしの場合、自動的にモックモードで動作
const result = await processHouseImage(
  'https://example.com/house.jpg',
  ['ND-050', 'KP-200'],
  { maxPatterns: 2 }
);

// モック画像が生成される
console.log('Mock images:', result.generatedImages);
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

## AI画像処理プロバイダー

### Replicate（推奨）

**特徴:**
- Stable Diffusion img2img対応
- 従量課金（生成1回約$0.002-0.01）
- 高品質・高速
- 簡単なAPI

**設定:**
```typescript
processor.setAIConfig({
  provider: 'replicate',
  apiKey: 'r8_your_key',
  strength: 0.8,        // 元画像の保持度（0.0-1.0）
  guidanceScale: 7.5,   // プロンプトへの従順度
  steps: 50,            // 生成ステップ数
});
```

### Stability AI（参考）

公式API、高品質、商用向け（未実装）

### Local（参考）

AUTOMATIC1111 WebUI APIなどを使用（未実装）

## 今後の実装予定

- [x] **Stable Diffusion統合** ✅ 完了
- [ ] リアルタイム画像プレビュー
- [ ] ControlNet統合（構造保持）
- [ ] Inpainting機能（部分塗装）
- [ ] オフライン動作のサポート
- [ ] モバイルアプリUI
- [ ] デスクトップアプリUI
- [ ] 塗料データベースのAPI連携
- [ ] ユーザー認証機能
- [ ] 画像保存・共有機能

## コスト見積もり

### Replicate API使用時

- 生成1回: 約$0.002-0.01
- 月100回: 約$0.20-1.00
- 月1000回: 約$2.00-10.00

*実際のコストは画像サイズ、ステップ数により変動

## ライセンス

MIT
