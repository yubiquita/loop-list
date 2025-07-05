# E2E Tests for Loop-List

Termux環境でのE2Eテストの実装と実行方法について説明します。

## 概要

このプロジェクトでは、Termux環境の制約を考慮した軽量なE2Eテストソリューションを実装しています。従来のPlaywright/Puppeteer/Cypressの代わりに、以下の技術を使用しています：

- **Cheerio**: HTMLパーシング・DOM操作テスト
- **Zombie.js**: 軽量ブラウザシミュレーション
- **HTTP Server**: 統合テスト環境
- **Jest**: テストフレームワーク

## テストファイル構成

```
tests/e2e/
├── README.md                 # このファイル
├── setup.js                  # E2Eテスト用セットアップ
├── dom-parsing.test.js       # Cheerio DOM パーシングテスト
├── http-integration.test.js  # HTTP サーバー統合テスト
├── zombie-browser.test.js    # Zombie.js ブラウザシミュレーション
└── user-workflows.test.js    # ユーザーワークフロー包括テスト
```

## テスト実行方法

### 1. 依存関係インストール

```bash
npm install
```

### 2. 単体テストの実行

```bash
# 全テスト実行
npm test

# ユニットテストのみ
npm run test:unit

# E2Eテストのみ
npm run test:e2e

# 全テスト（ユニット + E2E）
npm run test:all
```

### 3. 監視モードでの実行

```bash
# E2Eテストの監視モード
npm run test:e2e:watch

# デバッグモード
npm run test:e2e:debug
```

### 4. カバレッジレポート

```bash
npm run test:coverage
```

## 各テストファイルの詳細

### dom-parsing.test.js

**目的**: HTMLパーシング・DOM操作テスト  
**技術**: Cheerio  
**テスト内容**:
- HTML構造の検証
- CSS セレクタの動作確認
- DOM操作シミュレーション
- 画面遷移クラスの確認

**主要テストケース**:
```javascript
describe('HTML構造テスト', () => {
  test('基本的なHTML構造が正しく読み込まれる', () => {
    expect($('html').length).toBe(1);
    expect($('title').text()).toBe('繰り返しチェックリスト');
  });
});
```

### http-integration.test.js

**目的**: HTTP サーバー統合テスト  
**技術**: Node.js http モジュール + HTTP Server  
**テスト内容**:
- HTTP レスポンスの検証
- 静的ファイルの配信確認
- CORS ヘッダーの確認
- レスポンス時間の測定

**主要テストケース**:
```javascript
describe('HTTP レスポンステスト', () => {
  test('メインページが正しく配信される', async () => {
    const response = await fetchPage('/');
    expect(response.status).toBe(200);
  });
});
```

### zombie-browser.test.js

**目的**: 軽量ブラウザシミュレーション  
**技術**: Zombie.js  
**テスト内容**:
- ページロードの確認
- JavaScript実行の検証
- ユーザーインタラクションのシミュレーション
- 画面遷移テスト

**主要テストケース**:
```javascript
describe('ユーザーインタラクションテスト', () => {
  test('リスト追加ボタンがクリックできる', async () => {
    await browser.visit(baseUrl);
    browser.fire('#addListBtn', 'click');
    expect(browser.query('#editScreen:not(.hidden)')).toBeTruthy();
  });
});
```

### user-workflows.test.js

**目的**: ユーザーワークフロー包括テスト  
**技術**: Zombie.js + 統合テスト  
**テスト内容**:
- 完全なユーザーワークフローの検証
- データ永続化テスト
- フォーム検証とエラーハンドリング
- ユーザビリティテスト

**主要テストケース**:
```javascript
describe('完全なユーザーワークフロー', () => {
  test('新規リスト作成から完了まで', async () => {
    // 15ステップにわたる完全なワークフローテスト
    // リスト作成 → 項目追加 → 保存 → 詳細表示 → チェック操作 → リセット
  });
});
```

## テスト環境設定

### Jest設定

プロジェクトは複数のテストプロジェクトを使用しています：

```json
{
  "projects": [
    {
      "displayName": "Unit Tests",
      "testMatch": ["<rootDir>/tests/*.test.js"],
      "testEnvironment": "jsdom"
    },
    {
      "displayName": "E2E Tests", 
      "testMatch": ["<rootDir>/tests/e2e/**/*.test.js"],
      "testEnvironment": "node"
    }
  ]
}
```

### セットアップファイル

`tests/e2e/setup.js`には以下のヘルパー関数が含まれています：

- `waitForServer()`: サーバーの起動待機
- `findAvailablePort()`: 利用可能なポートの検索
- `startTestServer()`: テストサーバーの起動
- `testUtils`: 共通のテストユーティリティ

## Termux環境での制約と対応

### 制約事項

1. **ブラウザエンジン**: Chromium/Chrome の直接実行が困難
2. **メモリ制限**: 通常2-4GBのメモリ制約
3. **GUI制限**: X11/Waylandの制限

### 対応策

1. **Zombie.js**: 軽量なブラウザシミュレーション
2. **Cheerio**: サーバーサイドでのDOM操作
3. **HTTP Server**: 統合テストでの実際のHTTPリクエスト
4. **Jest**: 高速なテスト実行環境

## トラブルシューティング

### よくある問題

1. **ポート競合**
   ```bash
   # ポート使用状況確認
   netstat -tlnp | grep :8080
   
   # プロセス終了
   pkill -f http-server
   ```

2. **Zombie.js の警告**
   ```bash
   # 環境変数で警告を抑制
   export ZOMBIE_SILENT=true
   ```

3. **依存関係のインストール失敗**
   ```bash
   # キャッシュクリア
   npm cache clean --force
   
   # 再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

### デバッグ方法

1. **詳細ログ**
   ```bash
   npm run test:e2e:debug
   ```

2. **特定のテストファイルのみ実行**
   ```bash
   npx jest tests/e2e/dom-parsing.test.js --verbose
   ```

3. **テストサーバーの手動起動**
   ```bash
   npx http-server -p 8080 -c-1 &
   npm run test:e2e
   pkill -f http-server
   ```

## 継続的インテグレーション

### GitHub Actions での実行

E2Eテストは GitHub Actions でも実行可能です：

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
```

### 本番環境での実行

実際のブラウザでのE2Eテストが必要な場合：

1. **GitHub Actions**: Playwright を使用
2. **ローカル開発**: Termux での軽量テスト
3. **ハイブリッド**: 両方を組み合わせ

## 今後の拡張

### 可能な改善点

1. **Visual Regression Testing**: スクリーンショット比較
2. **Performance Testing**: Lighthouse統合
3. **Accessibility Testing**: axe-core統合
4. **Cross-browser Testing**: BrowserStack統合

### 追加のテストケース

1. **オフラインテスト**: Service Worker対応
2. **モバイルテスト**: デバイスエミュレーション
3. **国際化テスト**: 多言語対応
4. **セキュリティテスト**: XSS/CSRF対策

## 参考資料

- [Zombie.js Documentation](http://zombie.js.org/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Jest Documentation](https://jestjs.io/)
- [HTTP Server Documentation](https://github.com/http-party/http-server)