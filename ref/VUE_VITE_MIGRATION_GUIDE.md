# Vanilla JS SPA → Vueマイグレーションガイド (TypeScript + Vite)

このガイドは、GitHub Pages でホストされている Vanilla JavaScript 製の SPA を Vue (TypeScript + Vite)ベースの構成に移行するための手順をまとめたものです。

---

## 移行の全体ステップ

1. 現在のアプリの機能と構造を整理
2. 新しい Vue + Vite + TypeScript プロジェクトを作成
3. HTML/CSS/JS を Vue コンポーネントに変換
4. Vue Router によるルーティングの構築
5. `vite.config.ts` に GitHub Pages 対応設定を追加
6. ビルドと GitHub Pages デプロイ設定の構築
7. 動作確認と本番デプロイ

---

## ステップ 1：機能と構成の整理

* 現在の SPA のページ・機能・ファイル構造を把握
* 画面単位で Vue コンポーネントに分割する設計を考える
* 共通処理やユーティリティ関数を洗い出す

---

## ステップ 2：Vue + Vite プロジェクト作成

```bash
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app
npm install
```

---

## ステップ 3：既存コードの移行

### HTML から Vue テンプレートへの変換

```html
<!-- Before: Vanilla HTML -->
<div id="app">
  <h1>Hello World</h1>
  <button onclick="handleClick()">Click me</button>
  <div id="result"></div>
</div>
```

```vue
<!-- After: Vue Template -->
<template>
  <div>
    <h1>Hello World</h1>
    <button @click="handleClick">Click me</button>
    <div>{{ result }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const result = ref<string>('')

const handleClick = (): void => {
  result.value = 'Clicked!'
}
</script>
```

### JavaScript から TypeScript への変換

```ts
// Before: Vanilla JS
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      document.getElementById('content').innerHTML = data.message;
    });
}

// After: Vue + TypeScript
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ApiResponse {
  message: string
}

const content = ref<string>('')

const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch('/api/data')
    const data: ApiResponse = await response.json()
    content.value = data.message
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

### CSS の移行

* グローバルスタイルは `src/assets/` に配置
* コンポーネント固有のスタイルは `<style scoped>` として定義

```vue
<style scoped>
.component-specific {
  color: #42b883;
}
</style>
```

---

## ステップ 4：Vue Router の設定

```bash
npm install vue-router
```

`src/router/index.ts` を作成:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/about', name: 'About', component: About },
    // 404 ページのフォールバック
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }
  ]
})

export default router
```

`main.ts` にルーターを登録:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

---

## ステップ 5：GitHub Pages 向けの Vite 設定

`vite.config.ts` を以下のように編集:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/<リポジトリ名>/',  // GitHub Pages用に固定設定
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/test-utils/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/test-utils/**',
        'src/**/*.test.{ts,js}',
        'src/**/*.spec.{ts,js}',
        'src/main.ts',
        'src/vite-env.d.ts'
      ]
    }
  }
})
```

### ⚠️ 重要: base設定について

GitHub Pagesで正しく動作させるため、以下の点に注意：

1. **base設定を固定**: `process.env.NODE_ENV`による条件分岐を避け、常に固定値を使用
2. **GitHub Pages設定**: リポジトリ設定でSourceを「GitHub Actions」に設定（legacyモード回避）
3. **package-lock.json**: 必ずGitにコミット（GitHub Actionsでのcacheに必要）

### GitHub Pages での SPA ルーティング対応

`public/404.html` を作成:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // GitHub Pages でのSPAルーティング対応
    // リダイレクトURLをセッションストレージに保存
    sessionStorage.redirect = location.href;
    
    // ルートパスにリダイレクト
    const pathSegments = location.pathname.split('/').slice(0, -1);
    location.replace(location.origin + pathSegments.join('/'));
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
```

`index.html` にリダイレクト処理を追加:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue App</title>
  <script>
    // GitHub Pages SPA リダイレクト処理
    (function() {
      const redirect = sessionStorage.redirect;
      delete sessionStorage.redirect;
      if (redirect && redirect !== location.href) {
        history.replaceState(null, null, redirect);
      }
    })();
  </script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

## ステップ 6：GitHub Pages へのデプロイ

### 方法1: 手動デプロイ（gh-pages パッケージ）

```bash
npm install --save-dev gh-pages
```

`package.json` にデプロイ用スクリプトを追加:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

実行:

```bash
npm run deploy
```

### 方法2: GitHub Actions による自動デプロイ（推奨）

`.github/workflows/deploy.yml` を作成:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'  # Node.js 20を使用（crypto.hashエラー回避）
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: NODE_ENV=production npm run build

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

### ⚠️ 重要: GitHub Actions設定について

1. **Node.js v20使用**: Vue 3 + Viteとの互換性確保（crypto.hashエラー回避）
2. **environment設定**: GitHub Pagesデプロイに必須
3. **pull_requestトリガー削除**: 不要なビルドを避けるため
4. **NODE_ENV=production**: 確実な本番ビルドのため
5. **package-lock.jsonコミット**: npm cacheが機能するために必須

### GitHub リポジトリの設定

1. リポジトリの Settings > Pages に移動
2. Source を "GitHub Actions" に設定
3. ワークフローが自動実行されることを確認

### 📋 GitHub PagesでのAPIによる設定変更

GitHub CLIを使用してGitHub Pagesの設定を変更することも可能：

```bash
# GitHub PagesをGitHub Actionsソースに変更
gh api --method PUT repos/<ユーザー名>/<リポジトリ名>/pages -f build_type=workflow

# 設定確認
gh api repos/<ユーザー名>/<リポジトリ名>/pages
```

### 🛠️ トラブルシューティング: GitHub Actions

GitHub Actionsの実行状況は以下のコマンドで確認可能：

```bash
# 最新5件のActions実行結果を確認
gh run list --limit 5

# 特定のActionの詳細確認
gh run view <RUN_ID>

# 失敗したActionのログ確認
gh run view <RUN_ID> --log-failed
```

---

## ステップ 7：動作確認と公開

* `https://<GitHubユーザ名>.github.io/<リポジトリ名>/` にアクセス
* SPA が正しくルーティングされているか確認
* 直接URLアクセス時の動作確認
* モバイルでの表示確認

---

## 補足：TypeScript 移行のヒント

### 段階的な型導入

```ts
// 1. 最初は any を使用
let userData: any = null;

// 2. 基本的な型から開始
let userId: number = 0;
let userName: string = '';

// 3. インターフェースで構造化
interface User {
  id: number;
  name: string;
  email: string;
}

// 4. ジェネリクスや高度な型の活用
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### Composition API の活用

```ts
// カスタムコンポーザブルの作成
import { ref, computed } from 'vue'

export function useCounter(initialValue: number = 0) {
  const count = ref<number>(initialValue)
  
  const increment = (): void => {
    count.value++
  }
  
  const decrement = (): void => {
    count.value--
  }
  
  const doubled = computed(() => count.value * 2)
  
  return {
    count,
    increment,
    decrement,
    doubled
  }
}
```

---

## トラブルシューティング

### よくある問題と解決策

#### 1. GitHub Pages関連

**症状**: ページが真っ白で表示されない
- **原因**: GitHub Pagesが「legacy」モードで動作している
- **解決**: `gh api --method PUT repos/<ユーザー名>/<リポジトリ名>/pages -f build_type=workflow`

**症状**: アセットファイル（CSS/JS）が読み込まれない
- **原因**: `vite.config.ts`の`base`設定が不正
- **解決**: `base: '/<リポジトリ名>/'`に固定設定

**症状**: `Dependencies lock file is not found`エラー
- **原因**: `package-lock.json`がGitにコミットされていない
- **解決**: `.gitignore`から`package-lock.json`を削除してコミット

#### 2. GitHub Actions関連

**症状**: `crypto.hash is not a function`エラー
- **原因**: Node.js 18とVue/Viteの互換性問題
- **解決**: GitHub ActionsでNode.js v20を使用

**症状**: `Missing environment`エラー
- **原因**: GitHub Pagesデプロイに必要な`environment`設定不足
- **解決**: ワークフローに`environment`設定を追加

```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

#### 3. TypeScript関連

**症状**: TypeScript エラーが多発する
- **原因**: 段階的な型導入が必要
- **解決**: `tsconfig.json`で`strict`モードを段階的に有効化

**症状**: Vue Component内でのTypeScriptエラー
- **原因**: 型定義の不足
- **解決**: `defineProps`、`defineEmits`でプロパティを明示的に定義

#### 4. アセット関連

**症状**: 画像やアセットが読み込まれない
- **原因**: 相対パス、baseパスの設定問題
- **解決**: `public/`フォルダーを使用、または適切な相対パス設定

#### 5. 状態管理関連

**症状**: Pinia storeでの状態更新が反映されない
- **原因**: リアクティブシステムの理解不足
- **解決**: `ref`、`computed`、`watch`の適切な使用

### 🔧 デバッグ用コマンド

```bash
# ローカルでの動作確認
npm run dev

# 本番ビルドの事前確認
npm run build && npm run preview

# テスト実行
npm test

# GitHub Pagesの現在の設定確認
gh api repos/<ユーザー名>/<リポジトリ名>/pages

# 最新のGitHub Actions実行結果確認
gh run list --limit 3
```

---

## まとめ

| 項目     | 内容                                                    |
|----------|-------------------------------------------------------|
| 移行元   | Vanilla JS + HTML/CSS                                 |
| 移行先   | Vue + TypeScript + Vite + Pinia                      |
| 公開方法 | GitHub Pages (GitHub Actions 自動デプロイ推奨)         |
| 利点     | 型安全性、再利用性、保守性、開発効率の向上                |
| 開発時間 | 小規模: 1-2週間、中規模: 1-2ヶ月                        |

### 🎯 移行成功のポイント

1. **段階的移行**: 一度にすべてを変更せず、段階的に移行を進める
2. **既存機能の保持**: 移行中も既存機能を損なわないよう配慮
3. **テスト駆動**: 移行前後でテストを継続実行し、機能の完全性を確保
4. **GitHub Pages設定**: 「legacy」から「workflow」への切り替えが重要
5. **トラブルシューティング**: 本ガイドの問題解決セクションを活用

### 🛠️ 技術的要点

- **Vite設定**: baseパスを固定値で設定し、GitHub Pages対応を確実に
- **GitHub Actions**: Node.js v20、environment設定、package-lock.jsonコミットが必須
- **TypeScript**: 段階的な型導入で移行リスクを最小化
- **状態管理**: PiniaによるリアクティブなVueアーキテクチャの活用

### 📊 移行効果 (実際の事例)

| 指標 | 移行前 | 移行後 | 改善 |
|------|--------|--------|------|
| **ファイル構成** | script.js (789行) | 8つのVueコンポーネント | 🔴→🟢 |
| **型安全性** | なし | 完全TypeScript対応 | 🔴→🟢 |
| **テスト** | Jest (145テスト) | Vitest (99テスト) | 🟡→🟢 |
| **ビルド** | なし | Vite最適化 | 🔴→🟢 |
| **保守性** | 低 | 高 (コンポーネント分割) | 🔴→🟢 |

このガイドに従って移行を進めることで、保守性が高く、型安全で現代的な Vue アプリケーションを GitHub Pages で公開できます。

---

> **📝 注意**: このガイドは実際の食品計算アプリ移行プロジェクトでの経験に基づいて作成されています。プロジェクトの複雑さや要件に応じて、移行手順を調整してください。