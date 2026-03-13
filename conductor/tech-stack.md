# Technology Stack: Loop List (Vue 3 Edition)

## Core Technologies
- **JavaScript Framework:** **Vue 3 (Composition API)**
  - 選択理由: 優れたリアクティビティと、柔軟なロジック再利用を可能にする Composition API を最大限に活用するため。
- **Build Tool:** **Vite**
  - 選択理由: 高速な開発サーバーと、効率的なビルドプロセスを提供するため。
- **Package Manager:** **npm** (または pnpm/yarn)
- **Deployment Platform:** **GitHub Pages**
  - 選択理由: 静的サイトとしてのデプロイが容易で、信頼性が高いため。

## Styling
- **CSS Language:** **Vanilla CSS**
  - 選択理由: 指針である KISS 原則に基づき、追加のライブラリ（TailwindCSS など）を導入せず、標準的な CSS で構築します。

## State Management & Storage
- **Local Persistence:** **LocalStorage API**
  - 選択理由: サーバーレス構成において、データをブラウザ上に確実に保存するため。
- **State Management:** **Vue 3 `reactive` / `ref`** (必要に応じて Pinia)
  - 選択理由: シンプルなアプリケーションにおいては、Vue 3 標準のリアクティビティで十分管理可能。

## Quality Assurance
- **Test Runner:** **Vitest**
  - 選択理由: Vite と親和性が高く、高速な単体テスト・コンポーネントテストが可能。
- **CI/CD:** **GitHub Actions**
  - 選択理由: GitHub Pages への自動デプロイと、プルリクエスト時のテスト自動実行を実現するため。
