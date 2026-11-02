const cv=document.getElementById("c"), W=cv.width, H=cv.height; let g=cv.getContext("2d"); const FG=document.getElementById("flow").getContext("2d");
const UI='"Yu Gothic UI","Yu Gothic","Meiryo","Hiragino Sans","Noto Sans JP",sans-serif', MONO='Consolas,Menlo,"Courier New",monospace';
const NOLABEL=new URLSearchParams(location.search).has("nolabel");
const COL={req:"#C9772A",res:"#1F3A5F",br:"#DCE6F2",brs:"#2F6FB2",sv:"#FFF1E0",svs:"#C9772A",svt:"#6B3A0A",ink:"#1E2430",sub:"#4A5568",line:"#B8C2CF",ok:"#1E6B45",hl:"rgba(255,208,138,.75)"};
const FC=["#2F6FB2","#C9772A","#1E6B45","#7B3FA0","#B3261E"];
// ---------- 時刻(場面の秒) ----------
const T={click:1.2,tags:1.5,gather:3.0,go:3.6,arrive:6.0,z0:6.0,z1:7.0,call:7.2,cust:9.0,item:10.4,qty:12.0,sub:13.4,del:14.6,fee:16.0,sel:17.2,init:18.8,loop:19.6,total:23.2,ret:24.8,tpl:25.8,done:31.6,res:32.6,zb0:32.8,zb1:33.8,arriveB:35.8,show:36.0};
const DUR=40.3;
const phT=i=>26.0+i*0.6;
// ---------- 部品 ----------
const ease=s=>s<=0?0:s>=1?1:(s<.5?2*s*s:1-Math.pow(-2*s+2,2)/2);
const cl=x=>Math.max(0,Math.min(1,x)), lerp=(a,b,k)=>a+(b-a)*k;
function rr(x,y,w,h,r,fill,stroke,lw=2){ g.beginPath(); g.roundRect(x,y,w,h,r); if(fill){g.fillStyle=fill;g.fill();} if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();} }
function txt(s,x,y,o={}){ g.font=`${o.b?700:400} ${o.size||18}px ${o.mono?MONO:UI}`; g.fillStyle=o.c||COL.ink; g.textAlign=o.align||"left"; g.textBaseline="middle"; g.fillText(s,x,y); return g.measureText(s).width; }
function tw(s,o={}){ g.font=`${o.b?700:400} ${o.size||18}px ${o.mono?MONO:UI}`; return g.measureText(s).width; }
function chip(s,x,y,col,o={}){ const size=o.size||15; g.font=`700 ${size}px ${o.mono?MONO:UI}`; const w=g.measureText(s).width+18, h=size+12;
  rr(x-w/2,y-h/2,w,h,o.r??6,o.fill||"#fff",col,2.5); g.fillStyle=col; g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,x,y+1); return w; }
function arrow(x1,y1,x2,y2,col,lw=3){ g.strokeStyle=col; g.lineWidth=lw; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke();
  const a=Math.atan2(y2-y1,x2-x1); g.fillStyle=col; g.beginPath(); g.moveTo(x2,y2); g.lineTo(x2-12*Math.cos(a-0.45),y2-12*Math.sin(a-0.45)); g.lineTo(x2-12*Math.cos(a+0.45),y2-12*Math.sin(a+0.45)); g.closePath(); g.fill(); }
function label(s,x,y,col){ if(NOLABEL) return; g.font=`700 18px ${UI}`; const w=g.measureText(s).width+18; rr(x-w/2,y-15,w,30,6,"#fff",col,1.5); g.fillStyle=col; g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,x,y+1); }
// ---------- 配置(注目している側を広げる) ----------
const BW0=420, BH0=560, SW0=1090, SH0=640, TOP=96;
const focus=t=>ease(cl((t-T.z0)/(T.z1-T.z0)))*(1-ease(cl((t-T.zb0)/(T.zb1-T.zb0))));
function lay(t){ const f=focus(t); return {f, bx:24, by:TOP, bs:lerp(1,0.3,f), sx:lerp(1256-SW0*0.18,166,f), sy:TOP, ss:lerp(0.18,1,f)}; }
const S2G=(L,x,y)=>({x:L.sx+x*L.ss, y:L.sy+y*L.ss});
// ---------- フォーム(ブラウザ) ----------
const ROWY=[212,296,380,464,548];
const FIELDS=[
  {lab:"お名前",ui:"パイソン太郎",html:'name="customer"',c:0},
  {lab:"商品",ui:"消しゴム(80円)  ▼",html:'name="item"  value="2"',c:1},
  {lab:"数量",ui:"3",html:'name="qty"',c:2},
  {lab:"受け取り方法",ui:"○ 店頭で受け取る   ◉ 配送する",html:'name="delivery"  value="1"',c:3},
  {lab:"オプション",ui:"☑ ギフト包装  ☐ カード  ☑ 領収書",html:'name="option" value="0"〜"2"(1は未チェック)',c:4},
];
// 届く name=値(row は入力欄、line は受け取る Python の行、t はその行の時刻)
const TAGS=[{txt:"customer=パイソン太郎",row:0,line:2,t:T.cust},{txt:"item=2",row:1,line:3,t:T.item},{txt:"qty=3",row:2,line:4,t:T.qty},
  {txt:"delivery=1",row:3,line:6,t:T.del},{txt:"option=0",row:4,line:8,t:T.sel},{txt:"option=2",row:4,line:8,t:T.sel+0.15}];
// ---------- app.py(実際のコード) ----------
const CODE=['@app.route("/confirm", methods=["POST"])','def confirm():','    customer = request.form["customer"]','    item = int(request.form["item"])','    qty = int(request.form["qty"])',
 '    subtotal = prices[item] * qty','    d = int(request.form["delivery"])','    fee = delivery_fees[d]','    selected = request.form.getlist("option")','    option_names = []','    option_total = 0',
 '    for v in selected:','        j = int(v)','        option_names.append(options[j])','        option_total = option_total + option_prices[j]','    total = subtotal + fee + option_total',
 '    return render_template("confirm.html", customer=customer,','        name=names[item], price=prices[item], qty=qty,','        subtotal=subtotal, delivery=deliveries[d], fee=fee,','        option_names=option_names, option_count=len(option_names),','        option_total=option_total, total=total)'];
const CX=28, CY=i=>124+i*24.5, CF=15, RF=14;
// 行の右に出る値(t から表示。to があれば t2 で書き換わる)
const BADGES=[
  {l:2,t:T.cust+0.8,s:"'パイソン太郎'",n:"(文字列)",c:FC[0]},
  {l:3,t:T.item+0.8,s:"'2'",n:"(文字列)",c:FC[1],t2:T.item+1.3,s2:"2",n2:"(int() で整数)"},
  {l:4,t:T.qty+0.8,s:"'3'",n:"(文字列)",c:FC[2],t2:T.qty+1.2,s2:"3",n2:"(int() で整数)"},
  {l:5,t:T.sub+0.3,s:"80 × 3 = 240",n:"",c:COL.res},
  {l:6,t:T.del+0.8,s:"'1'",n:"(文字列)",c:FC[3],t2:T.del+1.1,s2:"1",n2:"(int() で整数)"},
  {l:7,t:T.fee+0.3,s:"500",n:"(送料)",c:COL.res},
  {l:8,t:T.sel+0.9,s:"['0', '2']",n:"(リスト)",c:FC[4]},
  {l:9,t:T.init+0.1,s:"[]",n:"",c:COL.sub},{l:10,t:T.init+0.4,s:"0",n:"",c:COL.sub},
  {l:12,t:T.loop+0.4,s:"j = 0",n:"",c:FC[4],t2:T.loop+2.0,s2:"j = 2",n2:""},
  {l:13,t:T.loop+0.8,s:"['ギフト包装']",n:"",c:FC[4],t2:T.loop+2.4,s2:"['ギフト包装', '領収書']",n2:""},
  {l:14,t:T.loop+1.2,s:"100",n:"",c:COL.res,t2:T.loop+2.8,s2:"100",n2:"(+0)"},
  {l:15,t:T.total+0.3,s:"840",n:"(240 + 500 + 100)",c:COL.res},
];
// いま処理している行
function curLines(t){
  const R=[[T.call,T.cust,[0,1]],[T.cust,T.item,[2]],[T.item,T.qty,[3]],[T.qty,T.sub,[4]],[T.sub,T.del,[5]],[T.del,T.fee,[6]],[T.fee,T.sel,[7]],[T.sel,T.init,[8]],[T.init,T.loop,[9,10]]];
  for(const [a,b,l] of R) if(t>=a&&t<b) return l;
  if(t>=T.loop&&t<T.total){ const e=(t-T.loop)%1.6; return e<0.4?[11]:e<0.8?[12]:e<1.2?[13]:[14]; }
  if(t>=T.total&&t<T.ret) return [15];
  if(t>=T.ret&&t<T.done) return [16,17,18,19,20];
  return []; }
// ---------- confirm.html ----------
const PH=[
  {n:"customer",v:"パイソン太郎",c:FC[0],src:[16,"customer=customer"]},{n:"name",v:"消しゴム",c:FC[1],src:[17,"name=names[item]"]},{n:"price",v:"80",c:FC[1],src:[17,"price=prices[item]"]},
  {n:"qty",v:"3",c:FC[2],src:[17,"qty=qty"]},{n:"subtotal",v:"240",c:COL.res,src:[18,"subtotal=subtotal"]},{n:"delivery",v:"配送する",c:FC[3],src:[18,"delivery=deliveries[d]"]},
  {n:"fee",v:"500",c:COL.res,src:[18,"fee=fee"]},{n:"option_names",v:"ギフト包装・領収書",c:FC[4],src:[19,"option_names=option_names"]},{n:"total",v:"840",c:COL.res,src:[20,"total=total"]}];
const TPL=[["<h1>注文内容の確認</h1>"],["<p>",0," 様</p>"],["<th>商品</th><td>",1,"</td>"],["<th>単価</th><td>",2,"円</td>"],["<th>数量</th><td>",3,"個</td>"],
  ["<th>小計</th><td>",4,"円</td>"],["<th>受け取り方法</th><td>",5],["  (送料 ",6,"円)</td>"],["<th>オプション</th><td>"],"OPT",["<th>合計</th><td>",8,"円</td>"]];
const OPT_SRC=["{% if option_count == 0 %}なし","{% else %}<ul>","{% for o in option_names %}","  <li>{{ o }}</li>","{% endfor %}</ul>{% endif %}</td>"];
const OPT_OUT=["<ul><li>ギフト包装</li>","<li>領収書</li></ul></td>"];
const TX=676, TF=14.5;
// ---------- ブラウザの中(元の座標で描き、外で縮める) ----------
function drawBrowser(t){
  g.save(); g.translate(-28,-110);
  rr(28,110,420,560,10,COL.br,COL.brs,2.5);
  const shown=t>=T.show;
  rr(44,124,388,30,6,"#fff",COL.line,1.5); txt(shown?"127.0.0.1:5000/confirm":"127.0.0.1:5000/order",56,139,{mono:1,size:16,c:COL.sub});
  if(!shown){
    txt("注文フォーム",44,178,{b:1,size:20,c:COL.brs});
    FIELDS.forEach((f,i)=>{ const y=ROWY[i], c=FC[f.c]; txt(f.lab,44,y,{b:1,size:16}); rr(44,y+12,388,32,5,"#fff",c,2); txt(f.ui,54,y+28,{size:17}); txt(f.html,44,y+60,{mono:1,b:1,size:15,c}); });
    const pressed=t>T.click&&t<T.click+0.5; rr(300,616,128,38,6,pressed?"#C8D3E2":"#EEF1F5","#7A8698",pressed?3:1.5); txt("確認画面へ",364,635,{size:17,align:"center"});
    if(t>=T.go&&t<T.show){ g.fillStyle="rgba(255,255,255,.55)"; g.fillRect(30,160,416,508); txt("(返事を待っている…)",238,400,{size:22,b:1,c:"#6B7380",align:"center"}); }
  } else {
    g.globalAlpha=cl((t-T.show)/0.5);
    rr(44,166,388,486,6,"#fff",COL.line,1.5); txt("注文内容の確認",60,200,{b:1,size:22,c:COL.res});
    g.font=`700 18px ${UI}`; const wn=g.measureText(PH[0].v).width; g.fillStyle=PH[0].c+"22"; g.fillRect(58,229,wn+4,24); txt(PH[0].v,60,241,{size:18,b:1,c:PH[0].c}); txt(" 様",60+wn+2,241,{size:18});
    const rows=[["商品",[[1]]],["単価",[[2],"円"]],["数量",[[3],"個"]],["小計",[[4],"円"]],["受け取り方法",[[5],"(送料 ",[6],"円)"]],["オプション",["・",[-1,"ギフト包装"],"  ・",[-1,"領収書"]]],["合計",[[8],"円"]]];
    rows.forEach((r,i)=>{ const y=274+i*50; g.strokeStyle=COL.line; g.lineWidth=1; g.strokeRect(60,y,356,46); g.beginPath(); g.moveTo(170,y); g.lineTo(170,y+46); g.stroke();
      txt(r[0],70,y+23,{b:1,size:16}); let x=182; const big=r[0]==="合計";
      r[1].forEach(seg=>{ if(typeof seg==="string"){ x+=txt(seg,x,y+23,{size:16}); return; }
        const ph=seg[0]>=0?PH[seg[0]]:PH[7], v=seg[0]>=0?ph.v:seg[1]; g.font=`700 ${big?20:16}px ${UI}`; const w=g.measureText(v).width;
        g.fillStyle=ph.c+"22"; g.fillRect(x-2,y+11,w+4,24); x+=txt(v,x,y+23,{size:big?20:16,b:1,c:ph.c}); }); });
    g.globalAlpha=1; }
  g.restore(); }
// ---------- サーバーの中(1016×590) ----------
let PHPOS=[], SRCPOS=[];
function drawServer(t){
  rr(0,0,SW0,SH0,12,COL.sv,COL.svs,3);
  // app.py
  drawBand(t); rr(12,68,636,566,10,"#fff",COL.svs,2.5); txt("app.py",CX,92,{b:1,size:17,c:COL.svt}); txt("Python のプログラム(section04 解答例の confirm 関数)",CX+70,92,{size:13,c:COL.sub});
  curLines(t).forEach(i=>{ g.fillStyle=COL.hl; g.fillRect(18,CY(i)-12,624,24); });
  CODE.forEach((l,i)=>txt(l,CX,CY(i),{mono:1,size:i>=16?RF:CF,c:i===0?COL.req:COL.ink,b:i===0&&t>=T.call&&t<T.cust}));
  // 行の右に出る値
  BADGES.forEach(b=>{ if(t<b.t) return; if(b.l===12&&t>=T.total) return; const two=b.t2!=null&&t>=b.t2, s=two?b.s2:b.s, n=two?b.n2:b.n;
    const a=cl((t-(two?b.t2:b.t))/0.3), x=CX+tw(CODE[b.l],{mono:1,size:CF})+16;
    g.globalAlpha=a; g.font=`700 15px ${MONO}`; const w=g.measureText("→ "+s).width;
    g.fillStyle=b.c+"18"; g.fillRect(x-4,CY(b.l)-11,w+8,22); txt("→ "+s,x,CY(b.l),{mono:1,b:1,size:15,c:two&&b.n2.includes("int")?COL.ok:b.c});
    if(n) txt(n,x+w+8,CY(b.l),{size:12.5,c:two&&n.includes("int")?COL.ok:COL.sub}); g.globalAlpha=1; });
  // return の引数の位置(値が飛び立つ所)
  SRCPOS=PH.map(p=>{ const [l,frag]=p.src, i=CODE[l].indexOf(frag); return {x:CX+tw(CODE[l].slice(0,i),{mono:1,size:RF})+tw(frag,{mono:1,size:RF})/2, y:CY(l)}; });
  if(t>=T.ret&&t<T.done) PH.forEach((p,k)=>{ if(t>=phT(k)-0.1&&t<phT(k)+0.6){ const s=SRCPOS[k], w=tw(p.src[1],{mono:1,size:RF}); g.strokeStyle=p.c; g.lineWidth=2.5; g.beginPath(); g.roundRect(s.x-w/2-3,s.y-11,w+6,22,4); g.stroke(); } });
  // confirm.html
  const done=t>=T.done;
  rr(TX-12,68,414,566,10,"#fff",done?"#6B7280":COL.svs,2.5);
  if(done) OBJ2D.documentFile(g,TX+8,92,0.34,{text:"HTML"});
  txt(done?"できあがった HTML":"templates/confirm.html",done?TX+24:TX,92,{b:1,size:17,c:COL.svt});
  txt(done?"{{ }} はもう残っていない":"テンプレート(穴あきの HTML)",TX+392,92,{size:12.5,c:done?COL.ok:COL.sub,b:done,align:"right"});
  let y=130; PHPOS=[];
  TPL.forEach(line=>{
    if(line==="OPT"){ const ti=phT(7), k=cl((t-ti-0.45)/0.35);
      if(k<1){ g.globalAlpha=1-k; OPT_SRC.forEach((l,j)=>txt("  "+l,TX,y+j*26,{mono:1,size:12.5,c:j===3?PH[7].c:"#5A6578",b:j===3})); PHPOS[7]={x:TX+100,y:y+3*26}; }
      if(k>0){ g.globalAlpha=k; OPT_OUT.forEach((l,j)=>{ g.fillStyle="rgba(179,38,30,.10)"; g.fillRect(TX-2,y+j*30-12,300,24); txt("  "+l,TX,y+j*30,{mono:1,size:13.5,b:1,c:PH[7].c}); }); }
      g.globalAlpha=1; y+=OPT_SRC.length*26*(1-k)+OPT_OUT.length*30*k+6; return; }
    let x=TX; const yy=y;
    line.forEach(seg=>{ if(typeof seg==="string"){ x+=txt(seg,x,yy,{mono:1,size:TF}); return; }
      const ph=PH[seg], ti=phT(seg)+0.45, k=cl((t-ti)/0.3), w0=tw("{{ "+ph.n+" }}",{mono:1,size:TF,b:1});
      PHPOS[seg]={x:x+w0/2,y:yy};
      if(k<1){ g.globalAlpha=1-k; if(t>=phT(seg)-0.1&&t<ti+0.3){ g.fillStyle=COL.hl; g.fillRect(x-2,yy-11,w0+4,22); } txt("{{ "+ph.n+" }}",x,yy,{mono:1,size:TF,b:1,c:ph.c}); g.globalAlpha=1; }
      const w2=tw(ph.v,{size:16,b:1});
      if(k>0){ g.globalAlpha=k; g.fillStyle=ph.c+"22"; g.fillRect(x-2,yy-11,w2+4,22); txt(ph.v,x,yy,{size:16,b:1,c:ph.c}); g.globalAlpha=1; }
      x+=w0*(1-k)+(w2+2)*k; });
    y+=34; });
  txt("※ <table>・<tr> と字下げは省略して表示",TX,618,{size:12.5,c:COL.sub});
  // 値が app.py の引数から {{ }} へ飛ぶ
  if(t>=T.tpl&&t<T.done) PH.forEach((p,k)=>{ const a=phT(k), e=t-a; if(e<0||e>0.5) return; const s=SRCPOS[k], d=PHPOS[k]; if(!d) return;
    const kk=ease(e/0.45), x=lerp(s.x,d.x,kk), yy=lerp(s.y,d.y,kk)-Math.sin(kk*Math.PI)*60; chip(p.v,x,yy,p.c,{size:14}); });
}
// ---------- request.form(届いた中身。サーバー注目時に左下へ) ----------
// 届いたリクエストの中身(request.form)。サーバー枠の上の帯に並べる
let REQPOS=[];
function drawBand(t){ const a=cl((t-T.z1)/0.4); REQPOS=[]; let x=24;
  g.globalAlpha=a; rr(12,10,SW0-24,48,8,"#FFF8EE",COL.req,2);
  x+=txt("届いた POST /confirm の中身(request.form):",x,34,{b:1,size:14,c:COL.req})+12;
  TAGS.forEach((tg,k)=>{ const w=tw(tg.txt,{mono:1,b:1,size:13})+18; REQPOS[k]={x:x+w/2,y:34}; const ak=cl((t-T.z1-0.15-k*0.12)/0.3); g.globalAlpha=a*ak; chip(tg.txt,x+w/2,34-(1-ak)*10,FC[FIELDS[tg.row].c],{size:13,mono:1}); g.globalAlpha=a; x+=w+8; });
  txt("値はすべて文字列",SW0-24,34,{b:1,size:13,c:COL.req,align:"right"}); g.globalAlpha=1; }
// ---------- 流れの帯 ----------
const FLOW=[["入力して送信",0,"b"],["POST /confirm",T.go,"q"],["confirm() 実行",T.call,"s"],["受け取って計算",T.cust,"s"],["render_template",T.ret,"s"],["{{ }} に値",T.tpl,"s"],["レスポンス",T.res,"r"],["確認画面",T.show,"b"]];
let FT=0;
function drawFlow(t){ const gm=g; g=FG; const y=37, x0=20, w=(W-40)/FLOW.length;
  g.fillStyle="#EEF1F5"; g.fillRect(0,0,W,74);
  const cur=FLOW.reduce((k,f,i)=>t>=f[1]?i:k,0);
  FLOW.forEach((f,i)=>{ const x=x0+i*w, on=i===cur, done=i<cur, col=f[2]==="q"?COL.req:f[2]==="r"?COL.res:f[2]==="s"?COL.svs:COL.brs;
    rr(x+4,y-24,w-26,48,10,on?col:(done?"#fff":"#F7F8FA"),on?col:(done?col:COL.line),on?3:1.5);
    if(on){ g.save(); g.setLineDash([10,7]); g.lineDashOffset=-FT*40; g.strokeStyle=col; g.lineWidth=3; g.beginPath(); g.roundRect(x,y-29,w-18,58,13); g.stroke(); g.restore(); }
    txt((i+1)+" "+f[0],x+4+(w-26)/2,y,{size:14.5,b:on||done,c:on?"#fff":(done?col:"#9AA3AF"),align:"center"});
    if(i<FLOW.length-1){ g.fillStyle=done?col:COL.line; g.beginPath(); g.moveTo(x+w-19,y-7); g.lineTo(x+w-8,y); g.lineTo(x+w-19,y+7); g.closePath(); g.fill(); } }); g=gm; }
// ---------- まとめて描く ----------
function render(t,fx){
  FT=t+(fx?fx.e:0);
  g.fillStyle="#F9FBFD"; g.fillRect(0,0,W,H);
  const L=lay(t);
  OBJ2D.laptop(g,72,48,0.62,{t,active:t<T.go||t>=T.show}); label("ブラウザ(クライアント)",226,48,COL.brs);
  OBJ2D.server(g,1222,48,0.4,{t,active:t>=T.arrive&&t<T.res}); label("サーバー(Flask)",1090,48,COL.svs);
  g.save(); g.translate(L.bx,L.by); g.scale(L.bs,L.bs); drawBrowser(t); g.restore();
  g.save(); g.translate(L.sx,L.sy); g.scale(L.ss,L.ss); drawServer(t); g.restore();
  // 入力欄から name=値 の札ができ、封筒(POST /confirm)にまとまって運ばれる
  if(t>=T.tags&&t<T.arrive+0.05){ const pk={x:0,y:0};
    if(t<T.go){ pk.x=600; pk.y=TOP+190; } else if(t<T.arrive){ const k=ease(cl((t-T.go)/(T.arrive-T.go))); pk.x=lerp(600,L.sx+70,k); pk.y=lerp(TOP+190,TOP+70,cl((k-0.6)/0.4)); }
    if(t>=T.gather){ const a=t>T.arrive-0.5?1-cl((t-T.arrive+0.5)/0.5):cl((t-T.gather)/0.4); g.globalAlpha=a;
      if(t>=T.go&&t<T.arrive){ g.strokeStyle="rgba(201,119,42,.4)"; g.lineWidth=6; g.beginPath(); g.moveTo(460,TOP+190); g.lineTo(Math.min(pk.x-60,L.sx-20),TOP+190); g.stroke(); txt("リクエスト",(460+Math.min(pk.x,L.sx))/2,TOP+236,{b:1,size:16,c:COL.req,align:"center"}); }
      OBJ2D.packet(g,pk.x,pk.y,1.2,{t,text:"POST /confirm",color:COL.req,dir:t<T.arrive?1:0}); g.globalAlpha=1; }
    TAGS.forEach((tg,k)=>{ const fy=TOP-110+ROWY[tg.row]+28, fx0=tg.row===4?(k===5?340:150):(tg.row===0?330:340);
      const gk=ease(cl((t-T.gather)/0.6)), a=cl((t-T.tags)/0.3)*(1-cl((t-T.gather-0.4)/0.3)); if(a<=0) return;
      g.globalAlpha=a; chip(tg.txt,lerp(fx0,600,gk),lerp(fy,TOP+190,gk),FC[FIELDS[tg.row].c],{size:15,mono:1}); g.globalAlpha=1; }); }
  // request.form から app.py の行へ札が飛ぶ
  TAGS.forEach((tg,k)=>{ const e=t-tg.t; if(e<0||e>0.85) return; const s=S2G(L,REQPOS[k].x,REQPOS[k].y), d=S2G(L,CX+tw(CODE[tg.line],{mono:1,size:CF})+60,CY(tg.line));
    const kk=ease(e/0.8), x=lerp(s.x,d.x,kk), y=lerp(s.y,d.y,kk)-Math.sin(kk*Math.PI)*50; g.globalAlpha=1-cl((e-0.7)/0.15); chip(tg.txt,x,y,FC[FIELDS[tg.row].c],{size:13,mono:1}); g.globalAlpha=1; });
  // Flask が confirm() を呼ぶ
  if(t>=T.call&&t<T.cust){ const p=S2G(L,CX+tw(CODE[1],{mono:1,size:CF})+14,CY(1)); g.globalAlpha=cl((t-T.call)/0.3); arrow(p.x+70,p.y,p.x+4,p.y,COL.req); txt("Flask が confirm() を呼ぶ(パス /confirm・POST が一致)",p.x+78,p.y,{b:1,size:15,c:COL.req}); g.globalAlpha=1; }
  // レスポンス
  if(t>=T.zb1&&t<T.arriveB+0.3){ const k=ease(cl((t-T.zb1)/(T.arriveB-T.zb1))), bxr=L.bx+BW0*L.bs, y=lerp(TOP+60,TOP+300,k), a=t>T.arriveB?1-cl((t-T.arriveB)/0.3):1;
    const x=lerp(L.sx+40,bxr+100,k); g.strokeStyle="rgba(31,58,95,.35)"; g.lineWidth=6; g.beginPath(); g.moveTo(L.sx-4,TOP+94); g.lineTo(x,y+34); g.stroke();
    txt("レスポンス",x+80,y+60,{b:1,size:16,c:COL.res,align:"center"}); g.globalAlpha=a; OBJ2D.packet(g,x,y,1.2,{t,text:"200 OK + HTML",color:COL.res,dir:-1}); g.globalAlpha=1; }
  drawFlow(t);
  if(fx){ const h=fx.hold, F=VIZPLAYER.FX; F.ripple(g,h.x,h.y,fx,h.c,0.7); F.flash(g,h.x,h.y,fx,80); F.callout(g,h.cx??640,h.cy??742,h.lines,fx,h.c,{size:20,below:true}); }
}
const EVENTS=[
  {t:0,text:"フォームに入力して「確認画面へ」を押す。"},
  {t:T.tags,text:"入力欄ごとに <b>name=値</b> の組ができる。名前は入力欄の <code>name</code>。チェックしなかった「カード」の組はできない。"},
  {t:T.go,text:"<b>POST /confirm</b> のリクエストとして、まとめてサーバーへ送られる。"},
  {t:T.arrive,text:"リクエストがサーバーに届いた。ここからはサーバーの中を大きく見る(ブラウザは返事を待っている)。"},
  {t:T.call,text:"Flask がパス <code>/confirm</code>・POST に合う <b>confirm 関数</b>を呼ぶ。届いた name=値 は <code>request.form</code> に入っている(サーバーの上の帯)。"},
  {t:T.cust,text:"<code>request.form[\"customer\"]</code> は、name が customer の値を取り出す。"},
  {t:T.item,text:"届いた値は <b>文字列 '2'</b>。<code>int()</code> で整数 2 にしてから変数に入れる。"},
  {t:T.qty,text:"数量も <b>文字列 '3'</b> で届く。<code>int()</code> で整数 3 にする。"},
  {t:T.sub,text:"小計 = 単価 × 数量。<code>prices[item]</code> は prices[2] で 80。80 × 3 = <b>240</b>。"},
  {t:T.del,text:"受け取り方法(ラジオボタン)は、選んだ value の <b>'1'</b> が届き、整数 1 にする。送料は delivery_fees[1] で 500。"},
  {t:T.sel,text:"チェックボックスは <code>getlist</code> で、選んだ値を <b>リスト ['0', '2']</b> で受け取る。"},
  {t:T.init,text:"選んだオプションの名前と料金を集めるために、空のリストと 0 を用意する。"},
  {t:T.loop,text:"<code>for v in selected</code>:'0' と '2' の2回くり返し、名前を追加し、料金を足していく。"},
  {t:T.total,text:"合計 = 小計 + 送料 + オプション代 = <b>840</b>。計算は Python 側で済ませる。"},
  {t:T.ret,text:"<code>render_template</code> で confirm.html に値を渡す。<code>name=names[item]</code> の左の <b>name</b> が、テンプレートの <code>{{ name }}</code> の名前になる。"},
  {t:T.tpl,text:"渡した値が、confirm.html の <code>{{ }}</code> の所へ <b>1つずつ入る</b>(サーバーの中で起きる)。"},
  {t:phT(7)-0.1,text:"オプションは <code>{% for o in option_names %}</code> で、選んだ2つだけが <code>&lt;li&gt;</code> になる。"},
  {t:phT(8),text:"合計 <code>total=total</code> の 840 が <code>{{ total }}</code> に入る(サーバーの中)。"},
  {t:T.done,text:"<code>{{ }}</code> がすべて値になり、<b>HTML ができあがった</b>。"},
  {t:T.res,text:"できた HTML が <b>レスポンス</b>としてブラウザへ返る。"},
  {t:T.show,text:"ブラウザが HTML を描き、<b>確認画面</b>が表示される。<b>色</b>は、どの値が画面のどこに出たかを表す。"},
];
// ヒットストップの位置(サーバー注目時の画面座標)
const G=(x,y)=>({x:166+x,y:TOP+y});
const HOLDS=[
  {t:T.call+0.3,...G(300,CY(0)),c:"#F2B36B",lines:["Flask:POST /confirm を受信","中身は name=値 の組。値はすべて文字列"]},
  {t:T.item+1.5,...G(380,CY(3)),c:"#7FD49B",lines:["届いた '2' は文字列。int() で整数 2 にする","整数にすると prices[item] のように番号で使える"]},
  {t:T.sel+1.1,...G(470,CY(8)),c:"#F2928A",lines:["getlist:同じ name の値をまとめてリストに","チェックしなかった「カード」の値は送られない"]},
  {t:T.total+0.6,...G(470,CY(15)),c:"#9DBBE3",lines:["合計 840 円:計算は Python 側で済ませる","テンプレートには結果だけを渡して表示する"]},
  {t:phT(1)+0.8,...G(TX+170,130+2*34),c:"#F2B36B",lines:["{{ name }} → 消しゴム","render_template の name=names[item] の値が入る"]},
  {t:T.done+0.3,...G(TX+180,360),c:"#7FD49B",lines:["サーバーの中で HTML が完成","{{ }} は残らず、ただの HTML になった"]},
  {t:T.show+0.6,x:240,y:420,c:"#9DBBE3",lines:["確認画面:色が同じ所に同じ値","「合計 840円」は {{ total }}円 が置き換わったもの"]},
];

// ---- 試す(入力を変えて確かめる) ----
(function(){
  const NAMES=["ボールペン","ノート","消しゴム","付箋"], PR=[120,200,80,150], OPT=["ギフト包装","メッセージカード","領収書"], OPR=[100,50,0], FEE=[0,500];
  const out=document.getElementById("t-out"), res=document.getElementById("t-res");
  const sel=()=>[...document.querySelectorAll(".t-opt")].filter(x=>x.checked).map(x=>x.value);
  function upd(){ const q=document.getElementById("t-qty").value||""; const d=(document.querySelector('input[name="t-del"]:checked')||{}).value; const o=sel();
    const qel=document.getElementById("t-qty"), valid=qel.checkValidity(), raw=qel.value;
    const pairs=["customer=パイソン太郎","item=2","qty="+raw,"delivery="+d].concat(o.map(v=>"option="+v));
    const isInt=/^-?[0-9]+$/.test(raw.trim()), qi=isInt?parseInt(raw,10):NaN, ok=valid&&isInt;
    const sub=ok?80*qi:null, fee=FEE[+d], ot=o.reduce((a,v)=>a+OPR[+v],0);
    const why=valid?"できる":(qel.validity.valueMissing?"できない(required があるので、空のままではブラウザが送信を止める)":qel.validity.rangeUnderflow||qel.validity.rangeOverflow?"できない(min=1・max=20 の範囲外なので、ブラウザが送信を止める)":qel.validity.stepMismatch?"できない(step の既定が 1 で整数だけ。ブラウザが送信を止める)":"できない(数値として読めないので、ブラウザが送信を止める)");
    const NS="(送信されないので、サーバーには届かない)";
    const rows=[["送信できるか",why],["送られる本文",valid?pairs.join("&"):NS],
      ['request.form["qty"]',valid?`'${raw}'(文字列)`:NS],
      ['int(request.form["qty"])',!valid?NS:(isInt?String(qi)+"(整数)":"ValueError('"+raw+"' は int() で整数にできない)")],
      ['request.form.getlist("option")',!valid?NS:`[${o.map(v=>`'${v}'`).join(", ")}]`+(o.length?"":"(何も選ばないと空のリスト)")],
      ["選んだオプション",o.length?o.map(v=>OPT[+v]).join("、"):"なし"],
      ["小計 80 × 数量",ok?80*qi+"円":"―"],["送料",fee+"円"],["オプション代",ot+"円"],["合計",ok?(sub+fee+ot)+"円":"―"]];
    out.innerHTML=rows.map(r=>`<span class="k">${r[0]}</span><span>${r[1]}</span>`).join(""); }
  document.querySelectorAll(".try input").forEach(x=>x.addEventListener("input",upd));
  document.querySelectorAll(".t-ans2").forEach(b=>b.onclick=()=>{ const ok=b.dataset.a==="err";
    document.getElementById("t-res2").innerHTML=(ok?'<span class="good">正解。</span>':'<span class="bad">ちがいます。</span>')+" request.form[\"qty\"] は文字列 '3' なので、'3' + 1 は <b>TypeError</b>(文字列と整数は足せない)。<code>int(request.form[\"qty\"]) + 1</code> と書けば 4 になる。"; });
  document.querySelectorAll(".t-ans").forEach(b=>b.onclick=()=>{ const o=sel(); const first=o.length?`'${o[0]}'`:"(何も送られていないので 400 Bad Request)";
    const right=b.dataset.a==="first";
    const now=o.length?`今の入力では ${first}。`:"今はチェックが1つもないので、option の値が送られず、request.form[\"option\"] は 400 Bad Request になる。";
    res.innerHTML=(right?'<span class="good">正解。</span>':'<span class="bad">ちがいます。</span>')+` request.form["option"] は、同じ name の値が送られていれば<b>最初の1つだけ</b>を返す。${now}全部ほしいときは getlist を使う。`; });
  upd();
})();
VIZPLAYER.create({duration:DUR,events:EVENTS,holds:HOLDS,render});
