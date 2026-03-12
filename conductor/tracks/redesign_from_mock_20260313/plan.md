# Implementation Plan - redesign_from_mock_20260313

## Phase 1: 基礎構造とデータモデルの再定義
- [ ] Task: 既存のコンポーネントとテストを一旦クリーンアップ（退避または削除準備）
- [ ] Task: フラットなデータ構造に対応した TypeScript 型定義の更新
- [ ] Task: 基本となる `App.vue` のテンプレート移植（Tailwind CSS クラスの適用）
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: チェックリスト項目のコンポーネント化 (ChecklistItem)
- [ ] Task: `ChecklistItem.vue` の作成（モックの `TaskItem` に相当）
- [ ] Task: スワイプ操作（タッチイベント）の Vue への移植と動作確認
- [ ] Task: スワイプによるインデント変更ロジックの実装（Vue コンポーネントの状態変更）
- [ ] Task: 状態変更を検証する単体テストの作成
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: チェック連動と並び替えロジック
- [ ] Task: カスケードチェック（親・子の連動）ロジックの Vue への移植
- [ ] Task: ドラッグ＆ドロップによるソートロジック（`performSort`）の Vue への移植
- [ ] Task: ポインターイベントによるドラッグ操作のハンドリング実装
- [ ] Task: ソートおよびチェック連動を検証するテストの作成
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: 進捗表示と仕上げ
- [ ] Task: 既存の `ProgressBar.vue` を新しいデータ構造に適合させる
- [ ] Task: 全体のスタイリング調整（Tailwind CSS との統合、Lucide Vue へのアイコン置換）
- [ ] Task: 全体的な動作確認と最終調整
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
