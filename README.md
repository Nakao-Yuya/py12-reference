# PY12 リファレンス

Flask の授業(PY12)の復習用ページです。学習が進むごとに section を追加していきます。ブラウザで `index.html` を開くと一覧が表示されます。

## ファイル構成

```
py12-reference/
├ index.html            一覧ページ(section ごとの内容・エラー早見表)
├ s01-02.html           アニメーション:リクエストからレスポンスまで
├ s03.html              アニメーション:値をテンプレートに渡す・for・if
├ s04.html              アニメーション:フォームの値が届くまで
├ css/
│  ├ index.css          一覧ページの見た目
│  ├ viz.css            アニメーションのページで共通の見た目
│  └ sNN.css            そのアニメーションのページだけで使う見た目
└ js/
   ├ lib/
   │  ├ objects2d.js    PC・サーバー・パケットなどの絵
   │  └ player.js       再生・一時停止・シーク・字幕の仕組み
   ├ index.js           一覧ページ(section の切り替え、URL の図、注文フォームと確認画面の連動)
   └ sNN.js             そのアニメーションのページの動き
```

- アニメーションのページは `sNN.html`・`css/sNN.css`・`js/sNN.js` の3つで1組です(NN は section の番号)。
- ファイルどうしは相対パスでつながっています。フォルダごと手元に置いて `index.html` をダブルクリックしても、GitHub Pages に置いても同じように動きます。
- 外部のサイトから読み込むものはありません(インターネットにつながっていなくても動きます)。

## section を追加するとき

1. `index.html` の上のメニュー(`<nav class="toc">`)に `<a href="#s05" role="tab">section05</a>` を、エラー早見表の前に追加する。
2. `index.html` の中に `<section class="secblk" id="s05">` 〜 `</section>` を、エラー早見表の section の前に追加する(中身は他の section と同じ形)。
3. アニメーションのページがあれば、`s05.html`・`css/s05.css`・`js/s05.js` を追加し、section の中のカードからリンクする。
4. `js/index.js` は直さなくてよい(section とメニューは自動で読み取る)。
5. エラー早見表に、その section で出るエラーを書き足す。

## GitHub Pages で公開する手順(最初の1回)

1. GitHub にログインし、右上の「+」→「New repository」。
   - Repository name:`py12-reference`
   - 「Public」を選ぶ(無料のプランでは、Public のリポジトリだけが GitHub Pages で公開できます)
   - 「Create repository」
2. できたリポジトリの画面で「uploading an existing file」(または「Add file」→「Upload files」)を押す。
3. このフォルダの**中身**(HTML・`README.md`・`css` フォルダ・`js` フォルダ)を、まとめてドラッグして入れ、画面下の「Commit changes」。
4. リポジトリの「Settings」→ 左の「Pages」。
   - 「Build and deployment」の Source を「Deploy from a branch」
   - Branch を「main」、フォルダを「/ (root)」にして「Save」
5. 数分待つと、同じ画面の上に公開された URL が表示されます(`https://(アカウント名).github.io/py12-reference/`)。この URL を学生に案内します。

## 更新するとき

- 直したファイル・追加したファイルを、手順 2〜3 と同じように同じ場所へアップロードして「Commit changes」。同じ名前のファイルは上書きされます。
- 数分で公開中のページに反映されます(反映されないときは、ブラウザで Ctrl + F5)。

## 注意

- 公開した URL は、知っている人なら誰でも見られます。
- HTML・CSS・JavaScript は、ブラウザの開発者ツール(F12)やリポジトリから読むことができます。
