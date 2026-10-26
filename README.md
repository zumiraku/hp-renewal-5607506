# わたしたちの墓じまい — トップページのレスポンシブ改修

> **Service.01　Web・アプリ開発**ーーHTML / CSS / JavaScript（ビルドなし）/ WordPress（Cocoon 子テーマ）

[kaiso.or.jp/haka/](https://kaiso.or.jp/haka/) のトップページを、レスポンシブで作り直したものです。

## 課題

ビューポートが `width=1480` 固定で、スマホでは縮小表示になっていました。加えて、**料金や電話番号といった重要な情報が画像に焼き込まれていました。** 画像の文字は拡大しても粗く、読み上げも検索もされません。

想定読者は50〜70代。スマホで小さな文字を読むのがいちばん辛い層です。

## やったこと

**ビューポートを `width=device-width` に戻し、スマホ・タブレット・PCそれぞれでレイアウトを組み替えました。**

**画像に焼き込まれていた文字をすべてテキスト化しました。** 流れ、他社比較、供養先の料金、電話番号が対象です。これで拡大しても粗くならず、読み上げにも検索にも乗ります。

本文は17〜18px前後、行間はゆったりめに取りました。スマホでは電話・LINE・見積りのボタンを画面下に固定し、どこまでスクロールしても連絡できるようにしています。

**電話番号は 0120-938-713 に統一しました。** 旧ヘッダー画像の `alt` に、使われていない 0120-917-302 が残っていたためです。

## 構成

```
index.html
assets/
  css/style.css
  js/main.js
  img/
```

ビルド不要。`index.html` をそのままブラウザで開けば確認できます。

## WordPress（Cocoon 子テーマ）への組み込み

1. `assets/` を子テーマ直下に `top/` としてアップロード
2. `index.html` の `<main>` 内を子テーマの `front-page.php` に貼り付け、`assets/` のパスを `<?php echo get_stylesheet_directory_uri(); ?>/top/` に置換
3. `style.css` と `main.js` を `functions.php` でフロントページのみ読み込み

```php
add_action('wp_enqueue_scripts', function () {
  if (!is_front_page()) return;
  $dir = get_stylesheet_directory_uri() . '/top';
  wp_enqueue_style('haka-top', $dir . '/css/style.css', [], '1.0.0');
  wp_enqueue_script('haka-top', $dir . '/js/main.js', [], '1.0.0', true);
});
```

4. 親テーマ側の viewport 設定が `width=1480` になっている場合は、Cocoon の「モバイル」設定でレスポンシブ表示に戻してください

## Vercel へのデプロイ

ビルド不要の静的サイトなので、設定はそのままで動きます。

1. Vercel の「Add New… → Project」でこのリポジトリを Import
2. Framework Preset は **Other**、Build Command・Output Directory は空欄のまま
3. Deploy

CLI の場合は `npx vercel`（本番は `npx vercel --prod`）。

### vercel.json の中身

- 全ページに `X-Robots-Tag: noindex, nofollow` を付けています。確認用のデモが本番（kaiso.or.jp）の複製として検索結果に出ないようにするためです。**Vercel を本番として使う場合はこの行を削除してください**
- 画像は7日、CSS/JS は1時間キャッシュ（ファイル名にハッシュを付けていないので短め）
- `404.html` を置いているので、存在しないURLは専用ページが出ます
- `README.md` は `.vercelignore` で配信対象から外しています

## 動作確認

- iPhone Safari / Android Chrome / PC Chrome・Edge・Safari・Firefox の最新版
- 画面幅 320px〜1920px
- `prefers-reduced-motion` が有効な環境ではアニメーションを止めています

---

## 制作

**図美楽（ずみらく / zumiraku）** — システム・アプリのAIエンジニア

Web・アプリ開発／システム開発・インフラ／AI活用・セキュリティ。設計から運用まで、ひとりで通しています。実務12年。

| 媒体 | リンク | 表示名 |
|---|---|---|
| note | [note.com/zumiraku](https://note.com/zumiraku) | 図美楽 |
| Qiita | [qiita.com/zumiraku](https://qiita.com/zumiraku) | ずみらく |
| Zenn | [zenn.dev/zumiraku](https://zenn.dev/zumiraku) | ズミラク |
| YOUTRUST | [youtrust.jp/users/zumiraku](https://youtrust.jp/users/zumiraku) | 図ミラク |

表記は媒体によって揺れていますが、どれも同じ人間です。英字は zumiraku で統一しています。

返信は平日なら4時間以内、土日祝でも12時間以内。お仕事のご相談は、要件が固まっていない段階からでも構いません。NDAも対応します。
