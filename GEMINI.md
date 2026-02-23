# GEMINI.md

This file provides guidance to AI agents (like Gemini CLI or Claude Code) when working with code in this repository.

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
- **LoadingSpinner.vue**: ローディング表示
- **ErrorMessage.vue**: エラーメッセージ表示
- **SuccessMessage.vue**: 成功メッセージ表示

#### 状態管理 (src/stores/)
- **checklist.ts**: メインデータストア（リスト・項目管理）
- **ui.ts**: UI状態管理（画面遷移、モーダル、ローディング）

#### Composables (src/composables/)
- **useDebounce.ts**: デバウンス機能

#### ユーティリティ (src/utils/)
- **storage.ts**: localStorage操作（safeJSONParse/Stringify使用）
- **index.ts**: 汎用ヘルパー関数（ID生成、日付フォーマット、進捗計算、フォーカス管理、配列操作）

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
- **モバイル対応**: `nextTick()`/`await nextTick()`でDOM更新後の確実なフォーカス

### 永続化
- 全データ操作は`storage.ts`経由でlocalStorageに保存
- データバリデーション・エラーハンドリング付き
- JSON形式での保存・復元

### エラーハンドリング詳細
- **DOM安全性**: 要素存在確認後の操作、nullチェック必須
- **数値変換の安全性**: `parseFloat() || 0`による安全な数値変換でエラー回避
- **ストレージ例外**: 容量制限時の適切な処理とフォールバック
- **循環参照防止**: 相互依存関係での検証処理必須
- **サイレントフェール**: クリップボード操作など、失敗しても続行可能な処理

### パフォーマンス最適化
- **リアクティブシステム**: 効率的な差分更新によるDOM操作最小化
- **コンポーネント分割**: 単一責任の原則によるレンダリング範囲の限定
- **Computed活用**: 重い計算結果のキャッシュ化
- **メモリリーク防止**: ライフサイクルによる自動クリーンアップ
- **大量データ対応**: 必要に応じてリスト仮想化を検討

### VueUse統合パターン
- **自動リソース管理**: Composablesによる自動イベントリスナー管理を優先
- **統合API活用**: `useLocalStorage()`による自動リアクティブ同期
- **タイマー管理**: `useTimeoutFn()`による自動クリーンアップ付きタイマー管理
- **クリップボード統合**: 統合APIによるコード削減とモバイル対応
- **ID生成**: `crypto.randomUUID()`による堅牢な実装

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

### 型安全性実装原則
- **厳密な型定義**: 全てのストアとコンポーネントでTypeScript型定義を厳密に管理
- **型ガード**: 実行時型チェックによる堅牢性確保
- **データ型安全性**: データは適切な型で保持、表示は専用関数で統一変換
- **Vue型統合**: defineEmits, definePropsによる型安全なコンポーネント通信

### DOM安全性規約
- **要素存在確認**: DOM操作前の必須null/undefinedチェック
- **フォーカス管理**: `nextTick()`でDOM更新後の確実なフォーカス設定
- **モバイル対応**: タップイベント、クリップボード等のモバイル専用配慮
- **イベントリスナー**: VueUse Composablesによる自動クリーンアップ優先

### テスト追加時
- コンポーネントテスト: Vue Test Utilsでマウント・イベント・プロパティをテスト
- Storeテスト: Piniaの状態変更・算出プロパティ・非同期処理をテスト
- Composableテスト: 入力・出力・副作用をテスト

### データ整合性強化
- **ストア経由操作**: 全データ操作はChecklistStore経由、UI状態変更はUIStore経由
- **直接操作禁止**: 直接的なDOM操作・localStorage操作は避ける
- **循環参照防止**: 相互依存関係での事前検証処理必須
- **データ永続性**: VueUse統合による自動リアクティブ同期の活用
- **入力検証**: 安全な数値変換によるエラー回避

### コードクリーンアップ方針
- **使用されていないユーティリティ関数**は積極的に削除（例：escapeHtml, deepClone, measurePerformance等）
- **使用されていない型定義**も削除（例：Utils, FocusManager, StorageManager等）
- **実際に使用される機能のみ保持**することでコードベースの保守性を維持
- storage.tsで使用される`safeJSONParse`/`safeJSONStringify`は必須関数として保持

### 状態管理アーキテクチャ
- **UIStore**: エラー・成功メッセージ、ローディング状態、モーダル表示、画面遷移を一元管理
- **ChecklistStore**: データの永続化を含むビジネスロジック全般を管理
- **コンポーネント間通信**: Piniaストア経由、直接的なprops/emitsは最小限

## UI/UX設計原則

### レスポンシブレイアウト
- **CSS Grid活用**: 等分割グリッドによる柔軟なレイアウト
- **モバイル最適化**: `@media (max-width: 480px)`での最適化、等分割による横はみ出し防止
- **統一されたレイアウト**: 全セクションでの一貫した構造
- **要素の整列**: 入力欄とボタンの縦揃え設計

### テーマシステム
- **CSS変数システム**: 全テーマ対応要素でCSS変数を使用
- **テーマ変数の分類**: 基本色・アクセント色・補助色の系統的管理
- **新UI要素**: テーマ対応とトランジション効果を必須設定
- **VueUse統合**: `useDark()`による自動テーマ管理、localStorage自動永続化

### UI実装規則
- **VueUse優先**: Composablesによる自動イベントリスナー管理を優先
- **モバイル対応**: タップイベント、クリップボード等を前提とした実装
- **モーダル実装**: 既存のCSSクラスを再利用
- **入力UI**: 数値入力にはEnterキー対応を必須実装

### アクセシビリティ配慮
- **キーボード操作**: Tab移動とEnterキー対応
- **フォーカス管理**: 視覚的なフォーカス表示と論理的な移動順序
- **色彩対応**: ライト・ダークテーマでの適切な色彩変更
- **タッチ操作**: モバイルでの操作性確保

## デプロイメント・CI/CD

### GitHub Pages設定
- **ソース設定**: GitHub Actionsによる自動デプロイ（legacyモード禁止）
- **自動デプロイ**: masterブランチプッシュ時の自動実行
- **手動デプロイ**: 即座デプロイ用コマンドの提供

### GitHub Actions運用
- **実行状況確認**: `gh run list --limit 5`
- **失敗時対応**: `gh run view <RUN_ID> --log-failed`でログ確認
- **設定管理**: GitHub API経由での設定確認・変更

### ビルド最適化
- **環境変数活用**: `import.meta.env.DEV`による条件分岐
- **テンプレート内環境変数**: computed値経由での安全な使用
- **デバッグログ**: 条件付きログで本番ビルド時に自動除去
- **パフォーマンス**: computed値による条件分岐でゼロランタイムコスト実現

### 重要な設定ファイル
- **ビルド設定**: 本番環境での適切なbase設定
- **依存関係管理**: package-lock.jsonの必須コミット（CI/CDキャッシュ用）
- **gitignore**: ビルド成果物除外、依存関係ファイル含有

## トラブルシューティング

### 開発環境エラー
- **Node.js互換性**: 適切なNode.jsバージョンの使用確認
- **依存関係エラー**: package-lock.jsonのコミット状況確認
- **モジュールエラー**: import文とモジュール解決の確認
- **テスト失敗**: localStorageモックとテスト環境設定の確認

### ビルドエラー対策
- **環境変数エラー**: テンプレート内での適切な環境変数使用
- **TypeScriptエラー**: 型定義と実装の整合性確認
- **デバッグログ**: 本番ビルドでの自動除去確認
- **メモリエラー**: ビルドプロセスのメモリ制限確認

### デプロイ関連
- **GitHub Pages問題**: legacyモード確認と修正
- **Actions失敗**: ワークフロー設定とセキュリティ設定確認
- **キャッシュ問題**: ブラウザキャッシュクリア（Ctrl+F5）推奨
- **404エラー**: SPA用のfallback設定確認

### パフォーマンス問題
- **レンダリング遅延**: コンポーネント分割とリアクティブ最適化
- **メモリリーク**: VueUse統合とライフサイクル管理確認
- **ストレージ制限**: localStorage容量とデータ構造最適化
