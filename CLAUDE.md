# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発環境とコマンド

### テスト環境
```bash
npm test                  # 全テストを実行
npm run test:watch        # ファイル変更を監視してテストを自動実行
npm run test:coverage     # カバレッジレポート付きでテストを実行
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
git push origin main
```
GitHub Pagesは自動的にmainブランチからデプロイされる

## アーキテクチャ

### 技術スタック
- **フロントエンド**: HTML5, CSS3, JavaScript (Vanilla JS)
- **データ保存**: localStorage
- **ホスティング**: GitHub Pages
- **対応環境**: モバイルブラウザ

### ファイル構成
```
/
├── index.html           # メインHTML（3つの画面を含む）
├── style.css            # モバイルファーストのレスポンシブデザイン
├── script.js            # ChecklistAppクラス（全機能を含む）
├── tests/
│   ├── checklist-app.test.js  # メインテストファイル（42テストケース）
│   └── setup.js               # Jest/JSDOM設定とモック
├── coverage/            # テストカバレッジレポート（HTML形式）
└── package.json         # 依存関係とJest設定
```

### アプリケーション構造

#### 単一ページアプリケーション（SPA）
- 3つの画面が1つのHTMLファイルに存在
- `screen` クラスと `hidden` クラスでの画面切り替え
- `listScreen` → `detailScreen` → `editScreen` の遷移

#### ChecklistAppクラス（script.js）
メインアプリケーションクラスで以下の責務を持つ：

**データ管理**
- `lists`: チェックリストの配列
- `currentListId`: 現在選択中のリストID
- `saveData()`: localStorageへのデータ永続化

**画面管理**
- `showListScreen()`: リスト一覧画面
- `showDetailScreen()`: リスト詳細画面（チェック機能）
- `showEditScreen()`: リスト編集画面

**CRUD操作**
- `renderLists()`: リスト一覧の描画
- `renderItems()`: チェック項目の描画
- `saveList()`: リストの保存（新規作成・更新）
- `deleteList()`: リストの削除

#### データ構造
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

### モバイル対応
- `viewport` メタタグでモバイル最適化
- CSS Grid/Flexboxによるレスポンシブレイアウト
- タッチ操作に適した大きなボタンサイズ
- 480px以下での専用スタイル

### 主要機能
1. **チェックリスト管理**: 複数リストの作成・編集・削除
2. **進捗表示**: プログレスバーでの完了率表示
3. **一括リセット**: 全項目を未チェック状態にリセット
4. **データ永続化**: ローカルストレージでの自動保存

## テスト環境

### テスト構成
- **Jest**: テストフレームワーク（JSDOM環境）
- **テストカバレッジ**: 94.77% statements, 91.42% branches, 82.5% functions, 99.25% lines
- **総テスト数**: 42個のテストケース

### テストファイル構造
1. **データ管理機能**: localStorage、ID生成、データ保存
2. **リスト管理機能**: CRUD操作、バリデーション、描画
3. **項目管理機能**: チェック、追加、削除、一括リセット
4. **進捗計算機能**: プログレスバー更新
5. **画面遷移機能**: SPA画面切り替え、編集モード制御
6. **エッジケース**: エラーハンドリング、境界値、状態整合性、UI状態

### localStorageモック
- `tests/setup.js`でJSDOM環境のlocalStorageをモック化
- モジュールキャッシュクリアによるテスト分離
- 各テストでのモック状態リセット

### 開発時の注意点
- テスト実行前に必ずlocalStorageモックが適切に設定されていることを確認
- 新機能追加時はTDDアプローチ（RED→GREEN→REFACTOR）を厳守
- `ChecklistApp`クラスのメソッドは全てテスト対象