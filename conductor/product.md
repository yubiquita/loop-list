# Initial Concept

## Overview
Vue 3 と Vite を採用したアーキテクチャで再構築する。
`ref/loop-list-mock.jsx` を参照し、そのロジックやUI構成をベースとする。

## Key Constraints
- Framework: Vue 3
- Build Tool: Vite
- Deployment: GitHub Pages
- Source: Based on `ref/loop-list-mock.jsx`

# Product Guide: Loop List (Vue 3 Edition)

## Product Vision
「Loop List」は、日常のルーチン作業や、繰り返し発生するプロジェクトの進捗を、ストレスなく管理・再利用するためのスマートなチェックリストツールです。Vue 3 と Vite によるモダンな技術スタックを基盤とし、静的な環境でも機能する軽量かつ高速なユーザー体験を提供します。

## Target Audience
- **開発者自身 (Developer):** 繰り返しの作業（リリースタスク、週次の振り返りなど）をミスなく、効率的に進めたい開発者。
- **個人ユーザー (Individuals):** 日課、家事、仕事の定型フローを整理し、自分だけの「チェックリスト集」を作成・運用したい個人。

## Core Goals
- **再利用性とテンプレート化:** 一度作成したリストを簡単に再利用（初期化・ループ）できる仕組みを中核とする。
- **モダンな再構築 (Modern Rewrite):** Vue 3 (Composition API) と Vite を活用し、メンテナンス性と開発効率を向上させる。
- **オフラインファースト (Offline-first):** GitHub Pages での静的な運用を想定し、LocalStorage でデータを完結させる。

## Key Features
- **ループ（再利用）機能:** 完了したリストをワンクリックでクリアし、初期状態から再開できる機能。
- **複数リスト管理:** 異なる用途（仕事、プライベート、趣味など）に合わせて複数のルーチンリストを作成・切り替え・管理できる機能。
- **階層構造（インデント）機能:** タスクを親子関係（2段階）で整理でき、親の完了に伴う子の自動チェックなどの連動ロジック。
- **直感的なジェスチャー操作:**
  - **スワイプ:** 左右へのスワイプで素早くインデント・インデント解除、およびアイテムの削除。
  - **ドラッグ＆ドロップ:** ハンドル操作でタスクやグループを自由に並び替え。
- **データ永続化:** 外部DBなしで、LocalStorage を用いてブラウザ上でデータを安全に保持する。
- **GitHub Pages 最適化:** 静的サイトとしてのビルド、および GitHub Actions を通じた継続的デプロイメントの実現。
