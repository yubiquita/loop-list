# Implementation Plan: Auto-Focus for Input Fields

## Objective
タスク追加およびリスト作成時に、入力欄へ自動的にフォーカスを当てる機能を実装し、ユーザーの入力開始をスムーズにする。

## Key Files & Context
- `src/App.vue`: メインのUIロジックと、タスク追加・リスト作成のハンドリングが行われている。
- `src/composables/useStorage.ts`: リスト作成のコアロジック。
- `src/App.test.ts`: 既存のテスト。ここに自動フォーカスのテストを追加。

## Implementation Steps

### Phase 1: Task Addition Focus
- [ ] **Task: Add ref to Task Add Input**
    - [ ] `App.vue` の `.add-task-input` に `ref="addTaskInput"` を追加。
- [ ] **Task: Implement focus logic for Task Add**
    - [ ] `isAdding` の変更を監視する `watch` を追加、または `isAdding = true` にする箇所で `nextTick` を利用してフォーカスを実行。
    - [ ] `App.test.ts` に、FABクリック時に入力欄がフォーカスされることを検証するテストを追加。
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Task Addition Focus' (Protocol in workflow.md)**

### Phase 2: New List Creation Focus
- [ ] **Task: Update handleCreateList in App.vue**
    - [ ] `handleCreateList` で新しいリスト作成後、`isListSelectorOpen` を `false` にせず、`isManagingLists = true` に設定して `startEditingList(newList.id, newList.name)` を呼び出すように変更。
- [ ] **Task: Verify focus for new list input**
    - [ ] `App.test.ts` に、リスト作成ボタンクリック時に新しいリスト名入力欄がフォーカスされることを検証するテストを追加。
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: New List Creation Focus' (Protocol in workflow.md)**

### Phase 3: Final Verification
- [ ] **Task: Global Smoke Test & Cleanup**
    - [ ] 全てのテストを実行し、デグレがないか確認。
    - [ ] モバイル環境（エミュレータ/ブラウザ）での動作を確認。
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Final Verification' (Protocol in workflow.md)**
