# C2PA対応画像処理Webアプリケーション (フロントエンド)

![C2PA対応画像処理Webアプリケーション](https://via.placeholder.com/800x400?text=C2PA+Web+App)

**リポジトリ**: [https://github.com/yhayano-ponotech/c2pa-authentipic-frontend](https://github.com/yhayano-ponotech/c2pa-authentipic-frontend)

> **重要**: このフロントエンドアプリケーションは対応するバックエンドサーバーと組み合わせて使用する必要があります。バックエンドリポジトリは[https://github.com/yhayano-ponotech/c2pa-authentipic-backend](https://github.com/yhayano-ponotech/c2pa-authentipic-backend)からアクセスできます。

## 📋 プロジェクト概要

このWebアプリケーションは、画像ファイルのC2PA（Coalition for Content Provenance and Authenticity）情報を処理するためのツールです。C2PAは、デジタルコンテンツの制作元や編集履歴を証明するための業界標準規格です。

### 主な機能

- **C2PA情報の読み取り**: 画像に埋め込まれたC2PA情報を表示
- **C2PA情報の追加**: 画像にC2PA情報を追加してデジタル署名
- **C2PA情報の検証**: 画像のC2PA署名を検証して真正性を確認

## 🚀 技術スタック

- **フレームワーク**: [Next.js 14](https://nextjs.org/)（App Router使用）
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **UIコンポーネント**: [shadcn/ui](https://ui.shadcn.com/)
- **状態管理**: React Hooks
- **フォーム管理**: [React Hook Form](https://react-hook-form.com/)
- **バリデーション**: [Zod](https://github.com/colinhacks/zod)

## 🛠️ 開発環境のセットアップ

### 前提条件

- [Node.js](https://nodejs.org/) 18.0.0以上
- [npm](https://www.npmjs.com/) または [yarn](https://yarnpkg.com/) または [pnpm](https://pnpm.io/)

### インストール手順

1. リポジトリをクローンします：

```bash
git clone https://github.com/yourusername/c2pa-web-app.git
cd c2pa-web-app
```

2. 依存パッケージをインストールします：

```bash
npm install
# または
yarn install
# または
pnpm install
```

3. 環境変数を設定します。プロジェクトのルートに `.env.local` ファイルを作成し、以下の内容を追加します：

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

※バックエンドサーバーが別のポートやURLで動作している場合は、適宜変更してください。

4. 開発サーバーを起動します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開き、アプリケーションにアクセスします。

## 📁 プロジェクト構造

```
src/
├── app/             # Next.js App Routerのページコンポーネント
│   ├── page.tsx     # ホームページ（読み取りページ）
│   ├── sign/        # 署名ページ
│   └── verify/      # 検証ページ
├── components/      # UIコンポーネント
│   ├── c2pa/        # C2PA関連のコンポーネント
│   ├── layout/      # レイアウト関連のコンポーネント
│   ├── shared/      # 共通コンポーネント
│   └── ui/          # shadcn/uiコンポーネント
├── lib/             # ユーティリティ関数と定数
│   ├── api-client.ts # APIクライアント関数
│   ├── constants.ts  # 定数定義
│   ├── types.ts      # 型定義
│   └── utils.ts      # ユーティリティ関数
└── types/           # グローバル型定義
```

## 🔄 バックエンドとの連携

このフロントエンドアプリケーションは、対応するバックエンドサーバー（[https://github.com/yhayano-ponotech/c2pa-authentipic-backend](https://github.com/yhayano-ponotech/c2pa-authentipic-backend)）と連携して動作します。**フロントエンド単体では機能しません**。

C2PA画像処理機能を実現するためには、両方のリポジトリをセットアップし、フロントエンドからバックエンドのAPIエンドポイントにアクセスできるよう設定する必要があります。

### 必要なバックエンドAPIエンドポイント

バックエンドサーバーは以下のAPIエンドポイントを提供します：

- `/api/c2pa/upload` - 画像ファイルのアップロード
- `/api/c2pa/read` - C2PA情報の読み取り
- `/api/c2pa/sign` - C2PA情報の追加・署名
- `/api/c2pa/verify` - C2PA情報の検証
- `/api/temp/:filename` - 一時ファイルへのアクセス
- `/api/download` - 署名済みファイルのダウンロード

詳細なAPI仕様については、[バックエンドのREADME](https://github.com/yhayano-ponotech/c2pa-authentipic-backend)を参照してください。

## 🌐 Vercelへのデプロイ方法

このアプリケーションは[Vercel](https://vercel.com/)に簡単にデプロイできます。

### 手動デプロイ

1. [Vercel](https://vercel.com/)にアカウント登録し、ログインします。

2. ダッシュボードから「New Project」をクリックします。

3. GitHubリポジトリ（[https://github.com/yhayano-ponotech/c2pa-authentipic-frontend](https://github.com/yhayano-ponotech/c2pa-authentipic-frontend)）をインポートします（リポジトリへのアクセス権限を与える必要があります）。

4. 設定画面で以下の環境変数を追加します：
   - `NEXT_PUBLIC_API_BASE_URL`: バックエンドAPIのベースURL（例：`https://your-c2pa-backend.onrender.com/api`）
   
   > **重要**: バックエンドサーバーも別途デプロイして、そのURLを正しく設定する必要があります。バックエンドのデプロイ方法は[バックエンドリポジトリのREADME](https://github.com/yhayano-ponotech/c2pa-authentipic-backend)を参照してください。

5. 「Deploy」ボタンをクリックしてデプロイを開始します。

### GitHub Actionsを使ったデプロイ

リポジトリにはすでに `.github/workflows/vercel-deploy.yml` ファイルが含まれており、GitHub Actionsを使った自動デプロイの設定がされています。以下の手順で設定します：

1. Vercelで[Personal Access Token](https://vercel.com/account/tokens)を作成します。

2. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で以下のシークレットを追加します：
   - `VERCEL_TOKEN`: 作成したPersonal Access Token
   - `VERCEL_ORG_ID`: VercelのOrganization ID
   - `VERCEL_PROJECT_ID`: VercelのProject ID
   - `NEXT_PUBLIC_API_BASE_URL`: バックエンドAPIのベースURL
   
   > **注意**: バックエンドも併せてデプロイする必要があります。フロントエンドとバックエンドの両方をデプロイしてから、互いのURLを環境変数に正しく設定してください。

3. `main`ブランチにプッシュすると、GitHub Actionsによって自動的にVercelにデプロイされます。

### 完全なデプロイワークフロー

1. バックエンドリポジトリ（[https://github.com/yhayano-ponotech/c2pa-authentipic-backend](https://github.com/yhayano-ponotech/c2pa-authentipic-backend)）をRenderにデプロイし、生成されたURLをメモします（例：`https://c2pa-authentipic-backend.onrender.com`）

2. フロントエンドリポジトリ（[https://github.com/yhayano-ponotech/c2pa-authentipic-frontend](https://github.com/yhayano-ponotech/c2pa-authentipic-frontend)）をVercelにデプロイし、環境変数 `NEXT_PUBLIC_API_BASE_URL` にバックエンドのAPIベースURL（例：`https://c2pa-authentipic-backend.onrender.com/api`）を設定します

3. バックエンドの環境変数 `CORS_ORIGIN` にフロントエンドのURL（例：`https://c2pa-authentipic.vercel.app`）を設定します

これで両方のアプリケーションが相互に通信できるようになります。

### 注意事項

- Vercelにデプロイする際は、Next.jsの設定によりクライアントサイドで実行不可能な処理（ファイルシステムへのアクセスなど）が制限されます。
- バックエンドとの連携を確保するために、適切なCORS設定が必要です。
- 環境変数 `NEXT_PUBLIC_API_BASE_URL` がデプロイ先のバックエンドURLを指しているか確認してください。

## 📚 関連リソース

- [C2PA（Coalition for Content Provenance and Authenticity）](https://c2pa.org/)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [shadcn/ui コンポーネント](https://ui.shadcn.com/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

## 🤝 貢献方法

プロジェクトへの貢献を歓迎します。以下の手順に従ってください：

1. このリポジトリをフォークします。
2. 新しいブランチを作成します：`git checkout -b feature/your-feature-name`
3. 変更をコミットします：`git commit -m 'Add some feature'`
4. フォークにプッシュします：`git push origin feature/your-feature-name`
5. プルリクエストを作成します。

## 📄 ライセンス

[MIT License](LICENSE)

## 👥 作者

PONOTECH