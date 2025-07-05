# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**loop-list** - 日常用途の繰り返し使用チェックリストを管理するシンプルなWebアプリケーション
- **ライセンス**: MIT
- **バージョン**: 1.0.0

## 開発コマンド

### テスト実行
```bash
npm test                           # 全テスト（243個のテストケース）を実行
npm run test:watch                 # ファイル変更を監視してテストを自動実行
npm run test:coverage              # カバレッジレポート付きでテストを実行
npm run test:unit                  # ユニットテストのみ（224個）実行
npm run test:e2e                   # E2Eテストのみ（19個）実行

# 個別テスト実行例
npm test tests/ChecklistApp.test.js              # メインアプリケーション
npm test tests/ChecklistItemManager.test.js      # 項目管理層
npm test tests/sortable-feature.test.js          # SortableJS並び替え機能
```

### 開発サーバー
```bash
npm run serve             # http://127.0.0.1:8080 でローカル開発サーバー起動
```

### デプロイ
```bash
git add .
git commit -m "commit message"
git push origin master           # GitHub Pagesが自動デプロイ
```

## アーキテクチャ

### 技術スタック
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **ライブラリ**: SortableJS (CDN) - ドラッグ&ドロップ並び替え機能
- **データ保存**: localStorage
- **ホスティング**: GitHub Pages
- **テスト**: Jest + JSDOM（ユニット）+ Cheerio（E2E、Termux最適化）

### コード構成

プロジェクトは責務分離の原則に従った**モジュラーアーキテクチャ**で構成：

#### コア管理クラス（src/フォルダ）

**`ChecklistApp`** (src/ChecklistApp.js)
- メインアプリケーションクラス（エントリーポイント）
- 各管理クラスの統合と画面遷移制御
- `window.app`として自動初期化

**`ChecklistDataManager`** (src/ChecklistDataManager.js)  
- localStorage操作とデータバリデーション
- `loadData()`, `saveData()`, `generateId()`

**`ChecklistUIManager`** (src/ChecklistUIManager.js)
- 画面遷移とDOM要素管理
- `showListScreen()`, `showDetailScreen()`, `showEditScreen()`

**`ChecklistListManager`** (src/ChecklistListManager.js)
- リストCRUD操作と描画
- `createList()`, `updateList()`, `deleteList()`, `renderLists()`

**`ChecklistItemManager`** (src/ChecklistItemManager.js)
- 項目管理とSortableJS統合
- `renderItems()`, `initializeSortable()`, `syncDOMWithData()`
- **Enterキー機能**: テキスト入力済み項目でEnter押下時に新項目追加

#### 設定・定数
- **`config.js`**: アプリケーション設定
- **`constants.js`**: CSS クラス名、DOM要素ID、メッセージ定数

### データ構造
```javascript
{
  lists: [
    {
      id: "uuid",
      name: "リスト名", 
      items: [{ id: "uuid", text: "項目名", checked: false }],
      createdAt: "ISO日時",
      updatedAt: "ISO日時"
    }
  ]
}
```

### モジュール読み込み
- **ブラウザ**: IIFE形式で`window`オブジェクトに追加、読み込み順序が重要
- **Node.js**: CommonJSモジュール、`require()`で依存関係解決
- **読み込み順序**: config.js → constants.js → 各Manager → ChecklistApp

## テスト環境

### テスト概要
- **総計**: 243個のテストケース（9個のテストスイート）
- **ユニットテスト**: 224個（各管理クラスを包括的にテスト）
- **E2Eテスト**: 19個（DOM パーシング、Termux最適化）
- **セットアップ**: `tests/setup.js`でlocalStorageモック化
- **SortableJSテスト**: ライブラリをモック化してイベントベーステスト

### TDD開発アプローチ
新機能追加時の必須手順：
1. **RED**: 失敗するテストを先に作成
2. **GREEN**: テストを通すための最小限の実装  
3. **REFACTOR**: コード品質向上（テスト通過を維持）

## 重要な実装パターン

### セキュリティとバリデーション
- **HTMLエスケープ**: ユーザー入力は`escapeHtml()`で必ずエスケープ（XSS防止）
- **イベントハンドラー**: `onclick`属性を避け、`addEventListener`を使用
- **破壊的操作**: 削除ボタンには`confirm()`ダイアログを実装

### SortableJS並び替え機能
- **初期化**: `initializeSortable(container)`で作成、`destroySortable()`で破棄
- **データ同期**: `onSortUpdate()`後に`syncDOMWithData()`でDOM/データ配列同期
- **DOM要件**: 編集項目に`data-id`属性と`.drag-handle`クラスが必須
- **設定**: animation: 150, ghostClass: 'sortable-ghost', handle: '.drag-handle'など

### フォーカス管理
- **自動フォーカス**: 新規項目追加時に`focusLastAddedItem()`で入力欄フォーカス
- **Enterキー**: テキスト入力済み項目でEnter押下時に新項目追加（空項目では無効）
- **モバイル対応**: `setTimeout`でDOM更新後の確実なフォーカス設定

### 画面構成（SPA）
3つの画面をCSS `hidden`クラスで切り替え：
- `listScreen` → `detailScreen` → `editScreen`
- モバイル最適化（viewport、480px以下専用スタイル、`100svh`）

### デバッグ環境
- **eruda**: ローカル環境（localhost、127.0.0.1）でのみ自動有効化
- **本番環境**: GitHub Pagesでは無効化される