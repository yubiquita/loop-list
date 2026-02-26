# Implementation Plan: Task Grouping by Indentation

## Phase 1: Data Model & Store Logic (TDD) [checkpoint: 053a188]
このフェーズでは、インデント情報を保持するためのデータ構造の拡張と、カスケードチェックなどのビジネスロジックを実装します。

- [x] Task: 型定義の更新 (f80a6aa)
    - [x] `src/types/index.ts` の `ChecklistItem` に `indent` (boolean) フィールドを追加
- [x] Task: ChecklistStore の拡張 (インデント操作) (ebe5685)
    - [x] `toggleIndentation(listId, itemId)` アクションを追加するためのテストを作成
    - [x] 指定したアイテムのインデント状態を切り替えるロジックを実装
- [x] Task: ChecklistStore の拡張 (カスケードチェック) (ebe5685)
    - [x] 親タスクのチェック切り替え時に子タスクも連動するテストを作成
    - [x] `toggleItemCheck` アクションを修正し、カスケードチェック/クリアロジックを実装
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Model & Store Logic' (Protocol in workflow.md)

## Phase 2: UI Implementation & Styling [checkpoint: d85184c]
このフェーズでは、視覚的なインデント表示とスワイプジェスチャーによる操作を実装します。

- [x] Task: インデントの視覚的表現の実装 (a6f23c0)
    - [x] `src/components/DetailScreen.vue` の各タスク項目に、インデント状態に応じた左マージンを適用するスタイルを追加
- [x] Task: スワイプジェスチャーの実装 (a6f23c0)
    - [x] `src/components/DetailScreen.vue` にて、右スワイプでインデント、左スワイプでアウトデントを行うジェスチャーハンドラを追加
    - [x] スワイプ操作でストアのアクションを呼び出すように統合
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Implementation & Styling' (Protocol in workflow.md)

## Phase 3: Integration & Final Polish [checkpoint: 626c81c]
最終的な動作確認と、LocalStorage への保存が正しく行われることを確認します。

- [x] Task: 永続化の確認 (6171fa6)
    - [x] インデント状態が正しく LocalStorage に保存され、リロード後も復元されることをテスト/確認
- [x] Task: モバイル環境での最終検証 (f31f002)
    - [x] 実機またはブラウザのシミュレータで、スワイプ操作の滑らかさと挙動を確認
- [x] Task: Conductor - User Manual Verification 'Phase 3: Integration & Final Polish' (Protocol in workflow.md)
