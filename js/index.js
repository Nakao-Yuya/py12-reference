const C={navy:'#1F3A5F',br:'#DCE6F2',brs:'#2F6FB2',sv:'#FFF1E0',svs:'#C9772A',svt:'#6B3A0A',ink:'#1E2430',sub:'#4A5568',line:'#B8C2CF',
  ok:'#1E6B45',oks:'#E3F2EA',bad:'#B3261E',bads:'#FBE6E4',gray:'#8792A2',
  f1:'#2F6FB2',f2:'#C9772A',f3:'#1E6B45',f4:'#7B3FA0',f5:'#B3261E'};
const UI="'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans',sans-serif", MONO="Consolas,'Menlo','Courier New',monospace";
const MK=['navy','svs','brs','ok','bad','sub','f1','f2','f3','f4','f5'];
document.getElementById('markers').innerHTML=MK.map(k=>`<marker id="ah-${k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C[k]}"/></marker>`).join('');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function R(x,y,w,h,o={}){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r??8}" fill="${o.fill||'#fff'}" stroke="${o.stroke||C.line}" stroke-width="${o.sw??1.5}"${o.dash?' stroke-dasharray="6 4"':''}/>`;}
function T(x,y,s,o={}){
  const f=o.mono?MONO:UI, sz=o.size||14;
  const halo=o.halo?` stroke="#fff" stroke-width="5" stroke-linejoin="round" paint-order="stroke"`:'';
  const body=Array.isArray(s)?s.map(p=>typeof p==='string'?esc(p):`<tspan fill="${p.c||'inherit'}"${p.b?' font-weight="700"':''}>${esc(p.t)}</tspan>`).join(''):esc(s);
  return `<text x="${x}" y="${y}" font-family="${f}" font-size="${sz}" font-weight="${o.b?700:400}" fill="${o.fill||C.ink}" text-anchor="${o.anchor||'start'}"${halo} xml:space="preserve">${body}</text>`;}
function TL(x,y,lines,o={}){const lh=o.lh||(o.size||14)*1.5;return lines.map((l,i)=>T(x,y+i*lh,l,o)).join('');}
function A(pts,o={}){const k=o.c||'navy';const d=pts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ');
  return `<path d="${d}" fill="none" stroke="${C[k]}" stroke-width="${o.w||2.5}"${o.dash?' stroke-dasharray="6 4"':''} marker-end="url(#ah-${k})"/>`;}
function CV(x1,y1,cx,cy,x2,y2,o={}){const k=o.c||'navy';return `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${C[k]}" stroke-width="${o.w||2.5}"${o.dash?' stroke-dasharray="6 4"':''} marker-end="url(#ah-${k})"/>`;}
const S=(n,s)=>`<g data-step="${n}">${s}</g>`;
function draw(id,s){document.getElementById(id).innerHTML=s;}
function badge(x,y,n,c){return `<circle cx="${x}" cy="${y}" r="11" fill="${C[c||'navy']}"/>`+T(x,y+5,String(n),{anchor:'middle',fill:'#fff',b:1,size:13});}
/* ===== S01 URL ===== */
(function(){
  const seg=[['http://',150,'f1'],['127.0.0.1',200,'f2'],[':5000',130,'f3'],['/about',140,'f4']];
  const lab=[['プロトコル',['通信の決まり(HTTP)','HTTPS は暗号化あり']],['IPアドレス',['127.0.0.1 = 自分のパソコン','(localhost・ループバック)']],['ポート番号',['5000 = Flask の待ち受け番号','HTTP は 80、HTTPS は 443']],['パス',['/about = どのページか','@app.route("/about") と対応']]];
  let x=(960-(150+200+130+140+18))/2, s='';
  seg.forEach((g,i)=>{
    s+=R(x,24,g[1],52,{fill:'#fff',stroke:C[g[2]],sw:2.5,r:6})+T(x+g[1]/2,59,g[0],{mono:1,size:26,anchor:'middle',fill:C[g[2]],b:1});
    const lx=16+i*236, cx=lx+110;
    s+=A([[x+g[1]/2,78],[cx,128]],{c:g[2],w:2});
    s+=R(lx,130,220,80,{stroke:C[g[2]],sw:1.5})+T(lx+12,154,lab[i][0],{b:1,fill:C[g[2]],size:15})+TL(lx+12,178,lab[i][1],{size:12.5,lh:18});
    x+=g[1]+6;
  });
  draw('fig-url',s);
})();

/* ===== section の切り替え(選んだ section だけを表示) ===== */
(function(){
  // section はページの中の <section class="secblk" id="…"> と、上のメニューの <a href="#…"> から自動で集める(section を増やしても、ここは直さなくてよい)
  const ids=[...document.querySelectorAll("section.secblk")].map(x=>x.id), names={};
  document.querySelectorAll("nav.toc a").forEach(a=>{ names[a.getAttribute("href").slice(1)]=a.textContent; });
  ids.forEach((id,i)=>{ const sec=document.getElementById(id); const p=document.createElement("div"); p.className="pager";
    p.innerHTML=(i>0?`<a href="#${ids[i-1]}">← ${names[ids[i-1]]}</a>`:"")+'<span class="sp"></span>'+(i<ids.length-1?`<a href="#${ids[i+1]}">${names[ids[i+1]]} →</a>`:"");
    sec.appendChild(p); });
  function show(){ let id=location.hash.slice(1); if(!ids.includes(id)) id=ids[0];
    ids.forEach(x=>document.getElementById(x).classList.toggle("show",x===id));
    document.querySelectorAll('nav.toc a').forEach(a=>a.setAttribute("aria-selected",a.getAttribute("href")==="#"+id?"true":"false"));
    window.scrollTo(0,0); }
  window.addEventListener("hashchange",show); show();
})();
/* ===== section04:注文フォームの送信で確認画面を作る(app.py の confirm と同じ計算) ===== */
(function(){
  const f=document.getElementById("demo-order"); if(!f) return;
  const names=["ボールペン","ノート","消しゴム","付箋"], prices=[120,200,80,150];
  const deliveries=["店頭で受け取る","配送する"], fees=[0,500], options=["ギフト包装","メッセージカード","領収書"], oprices=[100,50,0];
  const e=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const out=document.getElementById("demo-confirm"), sent=document.getElementById("demo-sent");
  function body(fd){ return [...fd.entries()].map(([k,v])=>k+"="+v).join("&"); }
  function show(first){ const fd=new FormData(f);
    if(!f.checkValidity()){ if(!first) f.reportValidity();
      sent.innerHTML='<span class="formerr">送信されない:入力が足りない・範囲外のため、ブラウザが送信を止めた。サーバーには届かないので、確認画面は変わらない。</span>'; return; }
    sent.innerHTML="<b>送られた name=値:</b> "+e(body(fd));
    const customer=fd.get("customer"), item=parseInt(fd.get("item"),10), qty=parseInt(fd.get("qty"),10);
    const subtotal=prices[item]*qty, d=parseInt(fd.get("delivery"),10), fee=fees[d];
    const sel=fd.getAll("option"); let on=[], ot=0; sel.forEach(v=>{ const j=parseInt(v,10); on.push(options[j]); ot+=oprices[j]; });
    const total=subtotal+fee+ot;
    out.innerHTML='<h1>注文内容の確認</h1><p>'+e(customer)+' 様</p><table>'+
      '<tr><th>商品</th><td>'+names[item]+'</td></tr><tr><th>単価</th><td>'+prices[item]+'円</td></tr><tr><th>数量</th><td>'+qty+'個</td></tr>'+
      '<tr><th>小計</th><td>'+subtotal+'円</td></tr><tr><th>受け取り方法</th><td>'+deliveries[d]+'(送料 '+fee+'円)</td></tr>'+
      '<tr><th>オプション</th><td>'+(on.length?'<ul>'+on.map(o=>'<li>'+o+'</li>').join("")+'</ul>':'なし')+'</td></tr><tr><th>合計</th><td>'+total+'円</td></tr></table><a href="#s04">注文フォームへ戻る</a>';
    if(!first){ out.classList.remove("upd"); void out.offsetWidth; out.classList.add("upd"); } }
  f.addEventListener("submit",ev=>{ ev.preventDefault(); show(false); });
  show(true);
})();

// スマホでは表を縦に積むので、各セルに見出し(列の名前)を持たせておく
document.querySelectorAll("table.t").forEach(tb=>{
  const head=[...tb.querySelectorAll("tr:first-child th")].map(th=>th.textContent.trim());
  if(!head.length) return;
  tb.querySelectorAll("tr").forEach((tr,i)=>{ if(i===0) return; [...tr.children].forEach((td,k)=>{ if(head[k]) td.setAttribute("data-label",head[k]); }); });
});
