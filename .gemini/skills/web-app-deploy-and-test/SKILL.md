---
name: web-app-deploy-and-test
description: Webアプリケーションのデプロイ（GitHub Pages）と、CI環境での堅牢なフロントエンド・シナリオテストを実行するためのガイド。
---

# Web App Deploy and Test

このスキルは、Webアプリを公開する際のパス問題の解決と、CI環境で失敗しないテストを書くための知見を提供します。

## 1. GitHub Pages デプロイ戦略

GitHub Pages などのサブディレクトリ（`/<repo-name>/`）で公開される環境では、絶対パス (`/`) は 404 エラーの原因になります。

- **Vite 設定 (`vite.config.ts`)**:
  - `base: './'` を推奨。これにより、アセットが相対パスで出力され、デプロイ先の階層に依存しなくなります。
- **HTML/CSS/JS**:
  - ソースコード内での絶対パス参照（例：`/assets/logo.png`）を避け、相対パスまたはビルドツールによる解決に任せます。

## 2. 堅牢なフロントエンド・シナリオテスト

CI環境（GitHub Actions 等）では、ブラウザの挙動やタイミングがローカルと異なるため、テストが失敗しやすくなります。

- **デバウンス・遅延の回避**:
  - `setTimeout` を待つために `delay(ms)` を使うのは不安定です。
  - `vi.useFakeTimers()` と `vi.advanceTimersByTime(ms)` を使用し、決定論的に時間を進めます。
- **DOM 操作の確実性**:
  - 操作（`trigger`, `setValue`）の直後には、必ず `await nextTick()` を重ねて DOM の更新を待ちます。
- **型エラーの回避 (TypeScript)**:
  - `vue-tsc` で `setChecked` 等がプライベートメンバとしてエラーになる場合、テストコード内では `(element as any).setChecked(true)` のようにキャストして回避することを許容します（型定義の不整合によるビルド失敗を防ぐため）。

## 3. プロジェクトコンテキストの最適化

AI（Gemini/Claude）が効率的に動くために、情報を重複させず役割を分離します。

- **`GEMINI.md`**: 
  - AIに対する「行動規範（ Directives）」、プロジェクト固有の「ハマりどころへの警告」、インデックスへの参照に特化させます。
- **`conductor/` (または Wiki)**:
  - プロジェクトの「事実（Facts）」、技術スタック、ワークフロー、仕様書を配置します。

## 4. トラブルシューティング・フロー

1. **画面が真っ白**: `dist/index.html` を開き、`src="./..."` がドットから始まっているか確認する。
2. **CIでテストが失敗、ローカルで成功**: `vi.useFakeTimers` の使用と、`as any` による型エラーの抑制を確認する。
