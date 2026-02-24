# Implementation Plan: Task Grouping by Indentation

## Phase 1: Data Model & Store Logic (TDD)
このフェーズでは、インデント情報を保持するためのデータ構造の拡張と、カスケードチェックなどのビジネスロジックを実装します。

- [ ] Task: 型定義の更新
    - [ ] `src/types/index.ts` の `ChecklistItem` に `indent` (boolean) フィールドを追加
- [ ] Task: ChecklistStore の拡張 (インデント操作)
    - [ ] `toggleIndentation(listId, itemId)` アクションを追加するためのテストを作成
    - [ ] 指定したアイテムのインデント状態を切り替えるロジックを実装
- [ ] Task: ChecklistStore の拡張 (カスケードチェック)
    - [ ] 親タスクのチェック切り替え時に子タスクも連動するテストを作成
    - [ ] `toggleItemCheck` アクションを修正し、カスケードチェック/クリアロジックを実装
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Data Model & Store Logic' (Protocol in workflow.md)

## Phase 2: UI Implementation & Styling
このフェーズでは、視覚的なインデント表示とスワイプジェスチャーによる操作を実装します。

- [ ] Task: インデントの視覚的表現の実装
    - [ ] `src/components/DetailScreen.vue` の各タスク項目に、インデント状態に応じた左マージンを適用するスタイルを追加
- [ ] Task: スワイプジェスチャーの実装
    - [ ] `src/components/DetailScreen.vue` にて、右スワイプでインデント、左スワイプでアウトデントを行うジェスチャーハンドラを追加
    - [ ] スワイプ操作でストアのアクションを呼び出すように統合
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Implementation & Styling' (Protocol in workflow.md)

## Phase 3: Integration & Final Polish
最終的な動作確認と、LocalStorage への保存が正しく行われることを確認します。

- [ ] Task: 永続化の確認
    - [ ] インデント状態が正しく LocalStorage に保存され、リロード後も復元されることをテスト/確認
- [ ] Task: モバイル環境での最終検証
    - [ ] 実機またはブラウザのシミュレータで、スワイプ操作の滑らかさと挙動を確認
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Final Polish' (Protocol in workflow.md)
