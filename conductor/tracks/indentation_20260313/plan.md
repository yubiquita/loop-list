# Implementation Plan: Indentation Feature (Swipe to Indent)

## Objective
`ref/loop-list-mock.jsx` に基づき、スワイプ操作によるインデント機能（レベル0と1の2階層）と、親子のチェック連動ロジックを Vue 3 で実装する。

## Key Files & Context
- `src/App.vue`: メインのロジックとUIを実装
- `src/components/TaskItem.vue` (新規作成推奨): 個別のタスクコンポーネント
- `ref/loop-list-mock.jsx`: 既存の React ロジックを参照
- `src/App.test.ts`: TDD 用のテストファイル

## Implementation Plan

### Phase 1: データ構造の拡張とコンポーネント化
- [x] Task: タスクデータ構造に `indent` プロパティを追加 (0 or 1)
- [x] Task: `App.vue` から `TaskItem.vue` コンポーネントを切り出し、Props を定義
- [x] Task: 基本的なパディング表示の実装
- [~] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

### Phase 2: スワイプ操作によるインデント機能の実装
- [ ] Task: スワイプジェスチャーを検知するロジックの実装
- [ ] Task: スワイプ時の視覚的フィードバック（背景、アイコン）の実装
- [ ] Task: インデント変更のステート更新ロジックの実装
- [ ] Task: 先頭アイテムのインデントを禁止するバリデーションの実装
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

### Phase 3: チェック連動ロジック (Cascade Check) の実装
- [ ] Task: 親タスクのチェック時に子タスクを連動させるロジックの TDD 実装
- [ ] Task: 子タスクのチェック状態から親タスクの状態を更新するロジックの TDD 実装
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

### Phase 4: データ永続化と最終調整
- [ ] Task: インデント状態が LocalStorage に正しく保存されることを確認
- [ ] Task: ドラッグ＆ドロップ（垂直移動）時の親子の整合性維持（モックのロジックを移植）
- [ ] Task: モバイル実機でのスワイプ操作の最終調整
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Verification & Testing
- Vitest による単体テスト: チェック連動ロジックとデータ整合性の検証
- 手動検証: ブラウザ（特にモバイルエミュレータ）でのスワイプ操作と階層表示の確認
