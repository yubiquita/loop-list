# Implementation Plan: Close Dropdown on Outside Click

## Objective
リスト選択画面のドロップダウンメニュー外をタップ/クリックした際や、Escキーを押下した際にメニューが閉じるようにUXを改善する。また、管理モードや名前編集中の例外処理を適切にハンドリングする。

## Key Files & Context
- `src/App.vue`: メインのUIとリスト選択メニューのロジックが実装されているコンポーネント。
- `src/App.test.ts`: 関連するテストファイル。

## Implementation Steps

### Phase 1: Outside Click and Esc Key Handling [checkpoint: b2f9599]
- [x] **Task: Implement outside click detection**
    - [x] `App.vue` にて、`isListSelectorOpen` が `true` の時のみ有効になる、ドロップダウン外クリック（mousedown または click）のイベントリスナーを追加。
    - [x] メニュー外のクリックを検知した際、`isListSelectorOpen = false` にするロジックを実装。
- [x] **Task: Implement Esc key handling**
    - [x] `App.vue` にて、`keydown` イベントリスナーを追加し、`Esc` キーが押下された際に `isListSelectorOpen = false` にするロジックを実装。
- [x] **Task: Write tests for Phase 1**
    - [x] `App.test.ts` に、メニュー外クリックでメニューが閉じることのテストを追加。
    - [x] `App.test.ts` に、Escキー押下でメニューが閉じることのテストを追加。
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Outside Click and Esc Key Handling' (Protocol in workflow.md)**

### Phase 2: Management Mode Exception Handling
- [ ] **Task: Handle outside click in Management Mode**
    - [ ] Phase 1 で追加した外側クリック検知ロジックを修正。
    - [ ] `isManagingLists` が `true` で、かつ `editingListId` が `null` の場合（管理モード中だが編集中ではない）、外側クリックでメニューを閉じると同時に管理モードも解除する。
    - [ ] `editingListId` が `null` ではない場合（名前編集中）、外側クリックでメニューを**閉じず**、名前入力の確定（blurイベントに委譲、または明示的に保存）のみを行うように挙動を制御。
- [ ] **Task: Write tests for Phase 2**
    - [ ] `App.test.ts` に、管理モード中（非編集中）の外側クリック挙動のテストを追加。
    - [ ] `App.test.ts` に、名前編集中に外側クリックしてもメニューが閉じない挙動のテストを追加。
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Management Mode Exception Handling' (Protocol in workflow.md)**

### Phase 3: Header Toggle and Item Select Verification
- [ ] **Task: Verify and fix header toggle**
    - [ ] ヘッダー（タイトル部分）クリックでメニューの開閉がトグルすることを確認（すでに実装されているはずだが、イベントの伝播等で壊れていないか確認・修正）。
- [ ] **Task: Verify item selection close**
    - [ ] リスト項目（編集中以外）をクリックしてリストを切り替えた際、メニューが閉じることを確認・修正。
- [ ] **Task: Refactor and Cleanup**
    - [ ] 追加したイベントリスナーが、コンポーネントのアンマウント時（または `isListSelectorOpen` が `false` になった際）に適切にクリーンアップされるよう `onUnmounted` 等を整理。
- [ ] **Task: Global Smoke Test**
    - [ ] すべてのテストを実行し、デグレがないか確認。
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Header Toggle and Item Select Verification' (Protocol in workflow.md)**