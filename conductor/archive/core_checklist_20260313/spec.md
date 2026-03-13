# Specification: core_checklist_20260313

## Track Overview
Vue 3 と Vite を採用し、`ref/loop-list-mock.jsx` のロジックを再構築する。
「再利用可能なチェックリスト」としての機能を中核に据え、静的サイトとして GitHub Pages にデプロイ可能な形式で提供する。

## Functional Requirements
- **プロジェクトセットアップ:** Vite (Vue 3, TypeScript) の初期化と Vitest の導入。
- **データモデルの移植:** `ref/loop-list-mock.jsx` のタスク管理ロジック（追加・完了・削除・クリア）を Vue 3 Composition API で再実装。
- **再利用・ループ機能:** チェック済みのリストをワンクリックでクリアし、初期状態に戻す機能。
- **LocalStorage 連携:** 状態の自動保存。
- **GitHub Pages デプロイ:** GitHub Actions を使用した自動デプロイパイプライン。

## Technical Requirements
- **Frontend:** Vue 3 (Composition API, `<script setup>`)
- **Styling:** Vanilla CSS (Brave UI 原則に則る)
- **Testing:** Vitest
- **Deployment:** GitHub Pages (via GitHub Actions)
