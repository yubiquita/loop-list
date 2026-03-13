# Implementation Plan: Swipe to Delete Feature

## Objective
アイテムの削除をボタンクリックから「左スワイプ」ジェスチャーに変更し、UIのクリーンアップと操作性の向上を実現する。

## Key Files & Context
- `src/components/TaskItem.vue`: スワイプ処理ロジックとアイテムのUIテンプレート。
- `src/types.ts`: タスクの型定義（確認用）。

## Implementation Steps

### Phase 1: Preparation & Testing
- [x] Task: 既存の削除機能に関するテストを確認、または新規作成する。 c3c5730
- [x] Task: スワイプ操作によるインデント操作の既存テストを確認する。 0fe97b8

### Phase 2: Refactor Swipe Logic
- [x] Task: `TaskItem.vue` の `handleTouchMove` を修正し、Level 0 アイテムでの左スワイプを許可する。 b675b9e
- [x] Task: `TaskItem.vue` の `handleTouchEnd` を修正し、Level 0 アイテムでの深い左スワイプ時に `delete` イベントを emit するようにする。 b675b9e
- [x] Task: 視覚的フィードバック（背景）を、Level 0 での左スワイプ時に「削除」を示す内容に動的に変更する。 b675b9e

### Phase 3: UI Cleanup
- [~] Task: `TaskItem.vue` のテンプレートから `delete-button` を削除する。
- [ ] Task: `TaskItem.vue` のスタイルから不要になった `.delete-button` 関連のCSSを削除する。

### Phase 4: Verification
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Verification' (Protocol in workflow.md)

## Verification & Testing
- **Automated Tests:** `vitest` を使用して、スワイプ操作が正しくイベントを発生させるか検証する。
- **Manual Verification:**
  1. モバイルエミュレータまたは実機で、メインタスクを左にスワイプして削除されることを確認。
  2. サブタスク（Level 1）を左にスワイプした時は、削除されずに「メインタスクに戻る（アウトデント）」ことを確認。
  3. 削除ボタンが表示されなくなっていることを確認。
