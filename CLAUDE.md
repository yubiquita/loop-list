# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**loop-list** - Vue 3 + TypeScript + Vite で構築された繰り返し使用チェックリスト管理Webアプリケーション
- **ライセンス**: MIT  
- **バージョン**: 1.0.0
- **技術スタック**: Vue 3, TypeScript, Vite, Pinia, Vitest

## 開発コマンド

### 基本開発
```bash
npm run dev                        # 開発サーバー起動 (http://localhost:5173)
npm run build                      # プロダクションビルド
npm run preview                    # ビルド結果をプレビュー
```

### テスト実行
```bash
npm test                           # 全テスト実行
npm run test:coverage              # カバレッジレポート付きテスト実行

# 個別テスト実行例
npm test src/tests/stores/checklist.store.test.ts    # ChecklistStore
npm test src/tests/composables/useDebounce.test.ts   # useDebounce
npm test src/tests/components/App.test.ts            # Appコンポーネント
```

### デプロイ
```bash
git add .
git commit -m "commit message"
git push origin master           # GitHub Pagesが自動デプロイ
```

## アーキテクチャ

### 技術スタック詳細
- **フロントエンド**: Vue 3 (Composition API), TypeScript
- **状態管理**: Pinia
- **ビルドツール**: Vite 6.0.1
- **テスト**: Vitest + Vue Test Utils + happy-dom
- **データ保存**: localStorage
- **ホスティング**: GitHub Pages

### プロジェクト構造

**Vue 3 Composition API**を使用したモダンなSPAアーキテクチャ：

#### コアコンポーネント (src/components/)
- **App.vue**: メインアプリケーション、画面遷移制御
- **ListScreen.vue**: リスト一覧画面
- **DetailScreen.vue**: リスト詳細表示画面  
- **EditScreen.vue**: リスト編集画面（項目の追加・編集・削除）
- **ConfirmModal.vue**: 確認ダイアログ
- **ProgressBar.vue**: 進捗表示コンポーネント

#### 状態管理 (src/stores/)
- **checklist.ts**: メインデータストア（リスト・項目管理）
- **ui.ts**: UI状態管理（画面遷移、モーダル、ローディング）

#### Composables (src/composables/)
- **useDebounce.ts**: デバウンス機能

#### ユーティリティ (src/utils/)
- **storage.ts**: localStorage操作
- **clipboard.ts**: クリップボード操作
- **index.ts**: 汎用ヘルパー関数

#### 定数・型定義
- **constants/index.ts**: アプリケーション設定、CSS定数
- **types/index.ts**: TypeScript型定義

### データ構造
```typescript
interface ChecklistData {
  lists: ChecklistList[]
}

interface ChecklistList {
  id: string
  name: string
  items: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}
```

### 画面遷移
3つのメイン画面をv-showで切り替え：
- **ListScreen**: リスト一覧
- **DetailScreen**: リスト詳細・項目チェック
- **EditScreen**: リスト編集・項目管理

## テスト戦略

### テスト環境設定
- **Test Runner**: Vitest
- **DOM Environment**: happy-dom  
- **Vue Testing**: Vue Test Utils
- **Setup**: `src/test-utils/setup.ts`でlocalStorageモック化

### テストファイル構成
```
src/tests/
├── basic.test.ts              # 基本動作テスト
├── components/                # コンポーネントテスト
│   ├── App.test.ts
│   ├── ConfirmModal.test.ts
│   └── ProgressBar.test.ts
├── composables/               # Composableテスト
│   └── useDebounce.test.ts
└── stores/                    # Piniaストアテスト
    ├── checklist.store.test.ts
    └── ui.store.test.ts
```

### カバレッジ設定
- **Provider**: v8
- **対象**: `src/**/*.{ts,vue}`（テストファイル除く）
- **除外**: test-utils, main.ts, vite-env.d.ts

## 重要な実装パターン

### Vue 3 Composition API
- 全コンポーネントで`<script setup>`構文を使用
- リアクティブな状態は`ref()`/`reactive()`で管理
- 算出プロパティは`computed()`、副作用は`watch()`で実装

### Pinia状態管理
- **ChecklistStore**: リスト・項目データのCRUD操作
- **UIStore**: 画面状態、モーダル、エラーハンドリング
- 非同期操作はstore内でasync/awaitパターン

### TypeScript統合
- 厳密な型定義で実行時エラーを防止
- Vue用のdefineEmits, definePropsで型安全なコンポーネント通信
- utils関数は全て型注釈付き

### エラーハンドリング
- try/catch文で例外処理
- UIStore経由でユーザーフレンドリーなエラー表示
- コンソールログで開発者向け詳細情報

### フォーカス管理
- **項目追加**: `focusLastAddedItem()`で最後の項目にフォーカス
- **Enterキー**: テキスト入力済み項目でEnter押下時に新項目追加
- **モバイル対応**: `nextTick()`でDOM更新後の確実なフォーカス

### 永続化
- 全データ操作は`storage.ts`経由でlocalStorageに保存
- データバリデーション・エラーハンドリング付き
- JSON形式での保存・復元

## 開発時の注意点

### TDD開発推奨
新機能追加時：
1. **RED**: 失敗するテストを先に作成
2. **GREEN**: テストを通すための最小限の実装
3. **REFACTOR**: コード品質向上（テスト通過を維持）

### Vue 3ベストプラクティス
- Composition APIの一貫使用
- 型安全性の確保（defineEmits, defineProps）
- リアクティビティの適切な使用

### テスト追加時
- コンポーネントテスト: Vue Test Utilsでマウント・イベント・プロパティをテスト
- Storeテスト: Piniaの状態変更・算出プロパティ・非同期処理をテスト
- Composableテスト: 入力・出力・副作用をテスト

### データ整合性
- 全データ操作はChecklistStore経由
- UI状態変更はUIStore経由
- 直接的なDOM操作・localStorage操作は避ける