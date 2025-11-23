# Japan Public Sports Facility Availability Viewer

日本の自治体が提供する公共スポーツ施設の空き状況を、Next.js + TypeScript + Tailwind CSS で表示するオープンソースアプリです。Vercel (Node.js Runtime) へそのままデプロイできます。

## 主な機能
- App Router 構成の Next.js 14
- Provider 設計で自治体ごとのデータ取得を切替
- オープンデータ CSV / HTML スクレイピング (cheerio) を利用した施設一覧・空き状況取得
- 施設空き状況を月間カレンダー + スマホ横スクロール UI で表示
- API ルートは Next.js Route Handlers (Vercel Functions) を使用
- ISR (revalidate) を API ごとに設定（施設一覧: 1 日、空き状況: 5 分）

## ディレクトリ構成
```
/app
  /providers
    /page.tsx                              自治体一覧
  /providers/[providerId]/facilities       施設一覧
  /providers/[providerId]/facilities/[facilityId] 空き状況カレンダー
  /api/providers                          Provider 一覧 API
  /api/providers/[providerId]/facilities   施設一覧 API
  /api/providers/[providerId]/facilities/[facilityId]/availability 空き状況 API
/data/providers
  index.ts   Provider レジストリ
  hakodate.ts / yokohama.ts Provider 実装
/lib
  types.ts, scraper.ts, date.ts
/components
  Calendar.tsx, FacilityCard.tsx, ProviderCard.tsx
```

## セットアップ
1. 依存関係をインストール
   ```bash
   npm install
   ```
2. 開発サーバーを起動
   ```bash
   npm run dev
   ```
3. ブラウザで `http://localhost:3000/providers` を開きます。

## Vercel へのデプロイ
1. 本リポジトリを GitHub にプッシュ
2. Vercel で「Import Project」→ GitHub リポジトリを選択
3. Framework: **Next.js**、Root: `/` を選択
4. ビルドコマンド `npm run build`、出力ディレクトリ `.next`
5. Node.js Runtime を選択（Edge Functions は不要）
6. 環境変数 `NEXT_PUBLIC_BASE_URL` が必要な場合はデプロイ URL を設定（同一オリジンなら未設定で可）

## Provider 追加方法
1. `/data/providers/xxxxx.ts` を作成し、`FacilityProvider` インターフェースを実装
2. 施設一覧: CSV や API から `Facility[]` を返却
3. 空き状況: HTML スクレイピングや API で `Availability[]` を返却
4. `/data/providers/index.ts` の `providers` に登録
5. これだけで `/providers/[providerId]` 以下の UI と API に反映されます。

### 既存 Provider
- **函館市 (hakodate)**
  - CKAN API から CSV を取得し施設一覧を生成。取得失敗時はサンプル CSV にフォールバック。
  - 予約システムの空き状況 HTML をスクレイピング（失敗時は日付範囲のダミーデータを返却）。
- **横浜市 (yokohama)**
  - 横浜市オープンデータの CSV を取得（失敗時はフォールバック CSV）。
  - YSPA の空き状況ページをスクレイピング（失敗時はダミーデータ）。

## API
- `GET /api/providers`
- `GET /api/providers/[providerId]/facilities` (revalidate: 86400)
- `GET /api/providers/[providerId]/facilities/[facilityId]/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` (revalidate: 300)

## スクレイピングの注意点
- `lib/scraper.ts` で共通の fetch ヘッダー（User-Agent）を設定しています。
- 公式サイトの HTML 構造が変わるとパースに失敗する場合があります。その際は `normalizeAvailabilityTable` のロジックを調整してください。
- 過剰なアクセスを避けるため、API の ISR を利用しキャッシュを有効にしています。

## ライセンス
MIT
