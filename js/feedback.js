/* =====================================================================
   質問・要望ボックス
   各 section の下に「質問・要望を送る」を表示し、Microsoft Forms を開く。
   どの section から送ったかは、Forms の「事前入力」で自動的に入れる。

   設定のしかた(Forms を作ったあと、ここだけ直す):
     1. Forms の「…」→「事前入力された URL を取得」で、
        「どの部分について」の欄に PART と入力してリンクを作り、コピーする。
     2. コピーした URL を下の FORM_URL に貼り付ける。
        (URL の中の PART が、section の名前に置き換わる)
   FORM_URL が空のあいだは「準備中」と表示する。
   ===================================================================== */
const FORM_URL = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=19ZBjc42DE6Mbc8sVMOQOYWSg1eEoxxAgoRJYyW3pAFUNlYzWDNWV1hEOFY0U1dRQTRWRzBWUkhJSy4u&rb9275521d85145b981a80797c96825ab=PART";

(function(){
  const names={};
  document.querySelectorAll("nav.toc a").forEach(a=>{ names[a.getAttribute("href").slice(1)]=a.textContent; });
  document.querySelectorAll("section.secblk").forEach(sec=>{
    const part=names[sec.id]||sec.id;
    const box=document.createElement("div"); box.className="feedback";
    const head='<div class="fb-tx"><b>質問・要望</b><span>この section の「分かりにくい」「追加してほしい」「間違いを見つけた」などを送ってください。学校のアカウントでサインインして送ります(名前は記録されません)。</span></div>';
    if(FORM_URL){
      const url=FORM_URL.replace(/PART$/,encodeURIComponent(part));
      box.innerHTML=head+`<a class="fb-btn" href="${url}" target="_blank" rel="noopener">質問・要望を送る(${part})</a>`;
    } else {
      box.innerHTML=head+'<span class="fb-btn off">準備中</span>';
    }
    const pager=sec.querySelector(".pager");
    if(pager) sec.insertBefore(box,pager); else sec.appendChild(box);
  });
})();
