# わたしたちの墓じまい トップページ改修

https://kaiso.or.jp/haka/ のトップページをレスポンシブで作り直したものです。

## 方針

- `width=1480` 固定のビューポートをやめて `width=device-width` に。スマホ・タブレット・PCそれぞれでレイアウトを組み替えています
- 画像に焼き込まれていた文字（流れ・他社比較・供養先の料金・電話番号など）はすべてテキストに
- 文字は本文 17〜18px 前後、行間ゆったりめ。50〜70代の方がスマホで読むことを前提にしています
- スマホでは電話・LINE・見積りボタンを画面下に固定
- 電話番号は 0120-938-713 に統一（旧ヘッダー画像の alt に 0120-917-302 が残っていたため）

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

## つくった人

図美楽（ずみらく / zumiraku）— フリーランスのAIエンジニアです。生成AI×Web開発を軸に、業務システムとWebサイトを受託で作っています。

| 媒体 | リンク | 表示名 |
|---|---|---|
| note | [note.com/zumiraku](https://note.com/zumiraku) | 図美楽 |
| Qiita | [qiita.com/zumiraku](https://qiita.com/zumiraku) | ずみらく |
| Zenn | [zenn.dev/zumiraku](https://zenn.dev/zumiraku) | ズミラク |
| YOUTRUST | [youtrust.jp/users/zumiraku](https://youtrust.jp/users/zumiraku) | 図ミラク |
| GitHub | [github.com/zumiraku](https://github.com/zumiraku) | 図美楽 |

表記は媒体によって揺れていますが、どれも同じ人間です。英字は zumiraku で統一しています。

お仕事のご相談は直接お寄せください。NDAも対応します。
