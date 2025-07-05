# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**loop-list** - 日常用途の繰り返し使用チェックリストを管理するシンプルなWebアプリケーション
- **ライセンス**: MIT
- **バージョン**: 1.0.0

## 開発環境とコマンド

### テスト環境
```bash
npm test                           # 全テストを実行
npm run test:watch                 # ファイル変更を監視してテストを自動実行
npm run test:coverage              # カバレッジレポート付きでテストを実行

# 個別テスト実行
npm test tests/ChecklistApp.test.js              # メインアプリケーション
npm test tests/ChecklistDataManager.test.js      # データ管理層
npm test tests/ChecklistUIManager.test.js        # UI管理層
npm test tests/ChecklistListManager.test.js      # リスト管理層
npm test tests/ChecklistItemManager.test.js      # 項目管理層
npm test tests/sortable-feature.test.js          # SortableJS並び替え機能
npm test tests/config.test.js                    # 設定
npm test tests/constants.test.js                 # 定数
```

### E2Eテスト環境（Termux対応）
```bash
npm run test:e2e                      # E2Eテストのみ実行
npm run test:e2e:watch                # E2Eテストの監視モード
npm run test:e2e:debug                # E2Eテストのデバッグモード
npm run test:unit                     # ユニットテストのみ実行
npm run test:all                      # 全テスト（ユニット + E2E）実行

# E2Eテストの個別実行
npm test tests/e2e/dom-parsing.test.js          # DOM パーシング
npm test tests/e2e/http-integration.test.js     # HTTP 統合テスト
npm test tests/e2e/zombie-browser.test.js       # ブラウザシミュレーション
npm test tests/e2e/user-workflows.test.js       # ユーザーワークフロー
```

### ローカル開発サーバー
```bash
npm run serve             # または npx http-server -p 8080 -c-1
```
アプリは `http://127.0.0.1:8080` でアクセス可能

### デプロイ
```bash
git add .
git commit -m "commit message"
git push origin master
```
GitHub Pagesは自動的にmasterブランチからデプロイされる

## アーキテクチャ

### 技術スタック
- **フロントエンド**: HTML5, CSS3, JavaScript (Vanilla JS)
- **ライブラリ**: SortableJS (CDN) - ドラッグ&ドロップ並び替え機能
- **データ保存**: localStorage
- **ホスティング**: GitHub Pages
- **対応環境**: モバイルブラウザ
- **テスト**: Jest + JSDOM
- **E2Eテスト**: Cheerio + Zombie.js + HTTP Server (Termux最適化)

### アーキテクチャ構成

プロジェクトは責務分離の原則に従ったモジュラーアーキテクチャで構成されている：

**モジュラー版**: `src/` フォルダ - 責務分離された管理クラス群（現在のメインアーキテクチャ）

### モジュラーアーキテクチャ（src/フォルダ）

アプリケーションは責務分離の原則に従って以下の管理クラスに分割されている：

#### `ChecklistApp` (src/ChecklistApp.js)
メインアプリケーションクラス。各管理クラスを統合してアプリケーション全体を制御。
- 画面遷移の制御
- 各管理クラスの協調動作
- イベントハンドリングの統合

#### `ChecklistDataManager` (src/ChecklistDataManager.js)
データ管理層。localStorage操作、データ保存・読み込み、ID生成、データバリデーションを担当。
- `loadData()`, `saveData()`: localStorage操作
- `generateId()`: 一意ID生成
- `createListData()`, `createItemData()`: データ構造作成
- `validateListName()`, `filterValidItems()`: バリデーション

#### `ChecklistUIManager` (src/ChecklistUIManager.js)
UI管理層。画面遷移制御、DOM要素の取得・管理、イベントバインディング、プログレスバー更新を担当。
- `showListScreen()`, `showDetailScreen()`, `showEditScreen()`: 画面遷移
- `bindEvents()`: イベントリスナーのバインド
- `updateProgress()`: プログレスバー更新
- DOM要素の管理とヘルパーメソッド

#### `ChecklistListManager` (src/ChecklistListManager.js)
リスト管理層。リストCRUD操作、リスト描画、検索・フィルタリングを担当。
- `createList()`, `updateList()`, `deleteList()`: リストCRUD
- `renderLists()`: リスト一覧描画
- `searchLists()`, `filterByProgress()`: 検索・フィルタリング
- `getStatistics()`: 統計情報取得

#### `ChecklistItemManager` (src/ChecklistItemManager.js)
項目管理層。項目CRUD操作、項目チェック状態管理、項目描画・編集、SortableJS並び替え機能を担当。
- `renderItems()`, `renderEditItems()`: 項目描画
- `createItem()`, `removeItem()`, `resetAllItems()`: 項目操作
- `getCheckedItems()`, `searchItems()`: 項目フィルタリング
- `calculateCompletionRate()`: 完了率計算
- **SortableJS統合**: `initializeSortable()`, `onSortUpdate()`, `destroySortable()`: ドラッグ&ドロップ並び替え
- `syncDOMWithData()`: DOM要素とデータ配列の同期

### 設定・定数管理

#### `config.js` (src/config.js)
アプリケーション設定を管理。UI設定、バリデーション設定、機能設定、デバッグ設定を含む。
- `getConfig()`, `setConfig()`: 設定値の取得・設定
- `validateConfig()`: 設定の妥当性チェック

#### `constants.js` (src/constants.js)
アプリケーション定数を管理。CSS クラス名、DOM要素ID、メッセージ、アクション、イベント等を定義。

### データ構造
```javascript
{
  lists: [
    {
      id: "uuid",
      name: "リスト名", 
      items: [
        { id: "uuid", text: "項目名", checked: false }
      ],
      createdAt: "ISO日時",
      updatedAt: "ISO日時"
    }
  ]
}
```

### 単一ページアプリケーション（SPA）
- 3つの画面が1つのHTMLファイルに存在
- `screen` クラスと `hidden` クラスでの画面切り替え
- `listScreen` → `detailScreen` → `editScreen` の遷移

### モバイル対応
- `viewport` メタタグでモバイル最適化
- CSS Grid/Flexboxによるレスポンシブレイアウト
- タッチ操作に適した大きなボタンサイズ
- 480px以下での専用スタイル
- `overflow-x: hidden`による横スクロール防止（スワイプ時の画面ズレ対策）
- `100svh`を使用したAndroidのChromeアドレスバー対応（viewport問題の解決）

## テスト環境

### テスト構成
- **Jest**: テストフレームワーク（JSDOM環境）
- **総テスト数**: 220個以上のテストケース（8つのテストスイート）
- **高いテストカバレッジ**: 各管理クラスが包括的にテスト済み
- **カバレッジ対象**: `src/` フォルダ内の全モジュール
- **セットアップファイル**: `tests/setup.js`でlocalStorageをモック化
- **SortableJSテスト**: SortableJSライブラリのモック化とイベントベーステスト、ターゲットライン表示機能テスト

### E2Eテスト構成（Termux対応）
- **Cheerio**: HTMLパーシング・DOM操作テスト
- **Zombie.js**: 軽量ブラウザシミュレーション
- **HTTP Server**: 統合テスト環境
- **テスト種別**: 
  - DOM パーシングテスト
  - HTTP 統合テスト
  - ブラウザシミュレーション
  - ユーザーワークフロー包括テスト
- **Termux最適化**: 従来のPlaywright/Cypressの代替として軽量ソリューション

### テストファイル構造
各管理クラスに対応するテストファイル：
1. `ChecklistApp.test.js`: メインアプリケーション統合テスト
2. `ChecklistDataManager.test.js`: データ管理機能テスト
3. `ChecklistUIManager.test.js`: UI管理機能テスト
4. `ChecklistListManager.test.js`: リスト管理機能テスト
5. `ChecklistItemManager.test.js`: 項目管理機能テスト
6. `sortable-feature.test.js`: SortableJS並び替え＋ターゲットライン表示機能専用テスト
7. `config.test.js`: 設定管理テスト
8. `constants.test.js`: 定数管理テスト

**注意**: パフォーマンステストは実際の問題発生時に追加、レガシーファイルは削除済み

### Jest設定詳細
- **テスト環境**: `jsdom`
- **セットアップファイル**: `tests/setup.js`
- **カバレッジレポート**: `text`, `html`
- **localStorageモック**: JSDOM環境でlocalStorageをモック化
- **テスト分離**: 各テストでのモック状態リセット
- **依存性注入**: 各管理クラスはテスト可能な設計

### TDD開発アプローチ
新機能追加時は以下の手順を厳守：
1. **RED**: 失敗するテストを先に作成
2. **GREEN**: テストを通すための最小限の実装
3. **REFACTOR**: コード品質向上（テスト通過を維持）

### モジュール読み込みアーキテクチャ
各モジュールファイルは即座実行関数式（IIFE）で包まれており、ブラウザ環境とNode.js環境の両方に対応：

**ブラウザ環境**: 
- 各クラスは`window`オブジェクトに追加される
- scriptタグでの読み込み順序が重要（config.js → constants.js → 各Manager → ChecklistApp）
- ChecklistAppが`window.app`として自動初期化される

**Node.js環境**:
- `module.exports`を使用した標準的なCommonJSモジュール
- テスト環境では`require()`で依存関係を解決

## 重要な実装上の注意点

### HTMLエスケープの必要性
特殊文字（`'`、`"`、`&`、`<`、`>`）を含むユーザー入力は、XSS攻撃防止とJavaScript構文エラー防止のため、必ず`escapeHtml()`メソッドでエスケープする必要がある。

### イベントハンドラーの推奨パターン
- `onclick`属性の使用は避け、`addEventListener`を使用する
- イベントバブリングを防ぐため、必要に応じて`event.stopPropagation()`を使用
- 削除ボタンなどの破壊的操作には`confirm()`ダイアログを使用

### SortableJS並び替え機能の実装パターン
- **アーキテクチャ**: 従来の`reorderItems()`メソッドは削除され、SortableJSのイベントベースアーキテクチャを採用
- **初期化**: `initializeSortable(container)`でSortableJSインスタンスを作成し、`destroySortable()`で適切に破棄
- **データ同期**: `onSortUpdate()`で配列操作後、`syncDOMWithData()`でDOM要素とデータ配列を同期
- **DOM構造**: 編集項目は`data-id`属性とドラッグハンドル（`.drag-handle`）を必須とする
- **ターゲットライン表示**: `onMove`イベントでドラッグオーバー効果、アニメーション付きゴーストクラス、空エリア表示
- **テスト**: SortableJSはモック化してイベントデータでテスト、実際のライブラリ動作は統合テストで確認

### SortableJS設定オプション
```javascript
{
    animation: 150,
    ghostClass: 'sortable-ghost',        // ドロップ先プレースホルダー（パルス＋グロー効果）
    chosenClass: 'sortable-chosen',      // 選択された項目
    dragClass: 'sortable-drag',          // ドラッグ中の項目
    handle: '.drag-handle',              // ドラッグハンドル
    emptyInsertThreshold: 5,             // 空領域でのドロップ感度
    forceFallback: false,                // 一貫した表示体験
    fallbackTolerance: 3,                // モバイル対応
    onStart, onUpdate, onEnd, onMove     // イベントハンドラー
}
```

## モバイル開発

### Androidデバッグ
AndroidでConsole確認が必要な場合、以下のスクリプトを一時的に追加：
```html
<script src="//cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

### 画面構成
3つの主要画面をCSS `hidden` クラスで切り替え：
- `listScreen`: リスト一覧画面
- `detailScreen`: チェックリスト詳細画面  
- `editScreen`: リスト編集画面

### アプリケーション状態管理
- `window.app`: メインアプリケーションインスタンス
- 状態はChecklistAppクラス内で集中管理
- データ永続化はlocalStorageを使用