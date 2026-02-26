# GEMINI.md

このファイルは、AIエージェント（Gemini CLI や Claude Code）がこのプロジェクトで作業する際の行動指針を提供します。

## プロジェクトの真実のソース (Source of Truth)

プロジェクトのビジョン、技術スタック、ワークフロー、および詳細な規約はすべて **Conductor** フォルダ内で管理されています。作業を開始する前に、必ず以下のインデックスを確認してください。

- **プロジェクトの全体像:** [conductor/index.md](./conductor/index.md)
- **製品定義:** [conductor/product.md](./conductor/product.md)
- **技術スタック:** [conductor/tech-stack.md](./conductor/tech-stack.md)
- **開発ワークフロー:** [conductor/workflow.md](./conductor/workflow.md)
- **プロジェクト固有規約:** [conductor/code_styleguides/project-conventions.md](./conductor/code_styleguides/project-conventions.md)

## AIエージェントへの行動規範

1. **Conductor プロトコルの遵守**:
   - すべての作業は `conductor/tracks/` 下のトラックとプランに基づいて進めること。
   - `plan.md` を更新し、タスクの進捗を正確に記録すること。
   - チェックポイント（フェーズ完了時）では、必ず手動検証手順をユーザーに提示し、承認を得ること。

2. **技術的誠実さ**:
   - `conductor/tech-stack.md` に記載のないライブラリやフレームワークを勝手に導入しないこと。
   - 既存の「重要な実装パターン」（特に DOM 安全性とフォーカス管理）を厳守すること。

3. **日本語によるコミュニケーション**:
   - ツール実行前の説明を含め、回答はすべて日本語で行うこと。

4. **検証の重視**:
   - 「実装した」と報告する前に、必ず `npm test` で自動テストを実行し、動作を確認すること。
   - バグ修正の際は、まず失敗するテスト（RED）を作成して問題を再現すること。

5. **ツールの選択と堅牢性**:
   - `replace` ツールは改行コードや空白の差異、広範囲の変更に対して脆弱な場合があります。
   - 複雑な修正や大規模なファイル編集を行う際は、`read_file` で最新状態を確認した上で `write_file` で全体を書き直す方が、一貫性と確実性を高く保てます。

---
*詳細な開発コマンドや規約は [conductor/workflow.md](./conductor/workflow.md) を参照してください。*
