# Project Conventions (loop-list)

## 1. 重要な実装パターン

### Vue 3 Composition API
- 全コンポーネントで `<script setup>` 構文を使用。
- リアクティブな状態は `ref()` / `reactive()` で管理。
- 算出プロパティは `computed()`、副作用は `watch()` で実装。

### Pinia 状態管理
- **ChecklistStore**: リスト・項目データのCRUD操作と永続化（LocalStorage）を担当。
- **UIStore**: 画面遷移、モーダル、ローディング、エラーハンドリング（グローバルな通知）を担当。
- 非同期操作は store 内で async/await パターンを使用。

### データの永続化と整合性
- 全データ操作は `checklist.ts` store を経由し、内部で `storage.ts` を通じて LocalStorage に保存する。
- 数値変換時は `parseFloat() || 0` などを用いて、予期せぬエラーを回避する。
- VueUse の `useLocalStorage()` による自動同期の活用を検討する。

## 2. DOM 安全性規約
- **要素の存在確認**: DOM 操作（特にフォーカス制御）を行う前には、必ず対象要素の null/undefined チェックを行う。
- **フォーカス管理**: 
  - 項目追加後などは `nextTick()` または `await nextTick()` を使用し、DOM 更新が完了したことを確実にしてから `focus()` を呼び出す。
  - モバイル端末での確実な動作を保証するため、このパターンを厳守する。

## 3. テスト戦略
- **Unit Testing**: Pinia store, Composables, Utils を対象。
- **Component Testing**: `@vue/test-utils` を使用し、マウント、イベント、Props の挙動をテスト。
- **Mocking**: LocalStorage は `src/test-utils/setup.ts` でモック化されている。
- **Coverage**: 新規コードには 80% 以上のカバレッジを要求する。

## 4. クリーンアップ方針
- 使用されていないユーティリティ関数や型定義は積極的に削除する。
- 実際に使用される機能のみを保持し、保守性を維持する。
