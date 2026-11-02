const cv=document.getElementById("c"), W=cv.width, H=cv.height; let g=cv.getContext("2d"); const FG=document.getElementById("flow").getContext("2d");
const UI='"Yu Gothic UI","Yu Gothic","Meiryo","Hiragino Sans","Noto Sans JP",sans-serif', MONO='Consolas,Menlo,"Courier New",monospace';
const NOLABEL=new URLSearchParams(location.search).has("nolabel");
const C={req:"#C9772A",res:"#1F3A5F",br:"#DCE6F2",brs:"#2F6FB2",sv:"#FFF1E0",svs:"#C9772A",svt:"#6B3A0A",ink:"#1E2430",sub:"#4A5568",line:"#B8C2CF",ok:"#1E6B45",bad:"#B3261E",hl:"rgba(255,208,138,.75)",f:["#2F6FB2","#C9772A","#1E6B45"]};
const NAMES=["ボールペン","ノート","消しゴム","付箋"], PRICES=[120,200,80,150];
let STOCKS=[40,0,25,0], FLAT=false;
// ---------- 時刻 ----------
const A={type0:0.3,enter:2.0,go:2.4,arrive:5.4,z0:5.8,z1:6.8,route:7.0,call:9.2,data:11.6,count:14.0,pass:16.0,tstart:19.0,loop:21.4};
// くり返しの1回分:for / names / prices / if / endfor の5場面。1回目はゆっくり、2回目からは少し速く
const CAN=[0,0.6,2.0,3.4,4.6,5.0], SEG=i=>i===0?[2.2,2.8,2.8,4.0,2.2]:[1.4,1.8,1.8,3.2,1.6];
const B=i=>{ let x=A.loop; for(let k=0;k<i;k++) x+=SEG(k).reduce((a,b)=>a+b,0); return x; };
function E(i,t){ let r=t-B(i); const sg=SEG(i); for(let k=0;k<5;k++){ if(r<sg[k]||k===4) return CAN[k]+Math.min(1,Math.max(0,r/sg[k]))*(CAN[k+1]-CAN[k]); r-=sg[k]; } }
function R(i,c){ const sg=SEG(i); let x=B(i); for(let k=0;k<5;k++){ if(c<=CAN[k+1]||k===4) return x+(c-CAN[k])/(CAN[k+1]-CAN[k])*sg[k]; x+=sg[k]; } }
const curItem=t=>{ let i=0; for(let k=1;k<4;k++) if(t>=B(k)) i=k; return i; };
A.done=B(4); A.res=A.done+2.8; A.zb0=A.res+0.3; A.zb1=A.res+1.3; A.arriveB=A.zb1+2.0; A.show=A.arriveB+0.2; const DUR=A.show+4;
// ---------- 部品 ----------
const ease=s=>s<=0?0:s>=1?1:(s<.5?2*s*s:1-Math.pow(-2*s+2,2)/2);
const cl=x=>Math.max(0,Math.min(1,x)), lerp=(a,b,k)=>a+(b-a)*k;
const win=(t,a,b)=>cl((t-a)/(b-a));
function rr(x,y,w,h,r,fill,stroke,lw=2){ g.beginPath(); g.roundRect(x,y,w,h,r); if(fill){g.fillStyle=fill;g.fill();} if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();} }
function txt(s,x,y,o={}){ g.font=`${o.b?700:400} ${o.size||16}px ${o.mono?MONO:UI}`; g.fillStyle=o.c||C.ink; g.textAlign=o.align||"left"; g.textBaseline="middle"; g.fillText(s,x,y); return g.measureText(s).width; }
function tw(s,o={}){ g.font=`${o.b?700:400} ${o.size||16}px ${o.mono?MONO:UI}`; return g.measureText(s).width; }
function chip(s,x,y,col,o={}){ const size=o.size||15; g.font=`700 ${size}px ${o.mono?MONO:UI}`; const w=g.measureText(s).width+18, h=size+12;
  rr(x-w/2,y-h/2,w,h,h/2,o.fill||"#fff",col,2.5); g.fillStyle=col; g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,x,y+1); return w; }
function arrow(x1,y1,x2,y2,col,lw=3,cx,cy){ g.strokeStyle=col; g.lineWidth=lw; g.beginPath(); g.moveTo(x1,y1); if(cx!=null) g.quadraticCurveTo(cx,cy,x2,y2); else g.lineTo(x2,y2); g.stroke();
  const a=cx!=null?Math.atan2(y2-cy,x2-cx):Math.atan2(y2-y1,x2-x1); g.fillStyle=col; g.beginPath(); g.moveTo(x2,y2); g.lineTo(x2-12*Math.cos(a-0.45),y2-12*Math.sin(a-0.45)); g.lineTo(x2-12*Math.cos(a+0.45),y2-12*Math.sin(a+0.45)); g.closePath(); g.fill(); }
function label(s,x,y,col){ if(NOLABEL) return; g.font=`700 18px ${UI}`; const w=g.measureText(s).width+18; rr(x-w/2,y-15,w,30,6,"#fff",col,1.5); g.fillStyle=col; g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,x,y+1); }
// ---------- 配置(注目している側を広げる) ----------
const BW0=560, BH0=520, SW0=1016, SH0=600, TOP=96;
function focus(t){ return ease(win(t,A.z0,A.z1))*(1-ease(win(t,A.zb0,A.zb1))); } // 0=ブラウザ 1=サーバー
function lay(t){ const f=focus(t);
  const bs=lerp(1,0.31,f), ss=lerp(0.193,1.0,f);
  const bx=24, sx=lerp(1256-SW0*0.193,240,f);
  return {f, bx, by:TOP, bs, sx, sy:TOP, ss}; }
// ---------- app.py ----------
const PYX=32, PYL=[null,null,null,"",'@app.route("/items")',"def items():","    count = len(names)",'    return render_template("items.html",',"        names=names, prices=prices,","        stocks=stocks, count=count)"];
const PYY=[74,102,130,0,170,196,222,248,274,300];
const LISTN=["names","prices","stocks"];
function listParts(r){ const arr=r===0?NAMES.map(v=>'"'+v+'"'):(r===1?PRICES:STOCKS).map(String); return arr; }
const LF=13.5;
function elPos(r,i){ const arr=listParts(r); let x=PYX+tw(LISTN[r]+" = [",{mono:1,size:LF}); for(let k=0;k<i;k++) x+=tw(arr[k]+", ",{mono:1,size:LF}); const w=tw(arr[i],{mono:1,size:LF}); return {x:x+w/2, y:PYY[r], w, x0:x}; }
// ---------- テンプレート ----------
const TX=470, TP=['<table border="1">','<tr><th>商品名</th><th>価格</th><th>在庫</th></tr>','{% for i in range(count) %}','<tr>','  <td>{{ names[i] }}</td>','  <td>{{ prices[i] }}円</td>','  <td>','  {% if stocks[i] == 0 %}','    売り切れ','  {% else %}','    {{ stocks[i] }}個','  {% endif %}','  </td>','</tr>','{% endfor %}','</table>'];
const TPY=i=>72+i*23.5, tpl=i=>FLAT?TP[i].trim():TP[i];
const BADGEX=850;
// ---------- できあがる HTML(書き込みの予定) ----------
const HX=32, HY0=472, HL=i=>HY0+i*17.5;
function writes(){ const S=STOCKS, w=[]; // {t:着く時刻, line, s:書く文字, from:テンプレートの行}
  w.push({t:A.tstart+0.6,line:0,s:'<table border="1">',from:0},{t:A.tstart+1.1,line:1,s:'<tr><th>商品名</th><th>価格</th><th>在庫</th></tr>',from:1});
  for(let i=0;i<4;i++){ const z=S[i]===0;
    w.push({t:R(i,0.5),line:2+i,s:"<tr>",from:3},{t:R(i,1.9),line:2+i,s:`<td>${NAMES[i]}</td>`,from:4},{t:R(i,3.3),line:2+i,s:`<td>${PRICES[i]}円</td>`,from:5},
      {t:R(i,4.6),line:2+i,s:`<td>${z?"売り切れ":S[i]+"個"}</td>`,from:z?8:10},{t:R(i,4.85),line:2+i,s:"</tr>",from:13}); }
  w.push({t:A.done+0.5,line:6,s:"</table>",from:15}); return w; }
// ---------- いま処理しているテンプレートの行 ----------
function tplState(t){ const S=STOCKS;
  if(t<A.tstart) return {tp:[],badge:[]};
  if(t<A.loop) return {tp:t<A.tstart+0.7?[0]:[1],badge:[]};
  if(t>=A.done) return {tp:t<A.done+0.8?[14,15]:[],badge:[]};
  const i=curItem(t), e=E(i,t), z=S[i]===0;
  if(e<0.6) return {tp:[2,3],i,badge:[{l:2,s:`i = ${i}`,c:C.bad}]};
  if(e<2.0) return {tp:[4],i,badge:e>1.3?[{l:4,s:"→ "+NAMES[i],c:C.f[0]}]:[]};
  if(e<3.4) return {tp:[5],i,badge:e>2.7?[{l:5,s:`→ ${PRICES[i]}円`,c:C.f[1]}]:[]};
  if(e<4.6){ const bd=[]; if(e>4.0){ bd.push({l:7,s:`${S[i]} == 0 → ${z?"True":"False"}`,c:z?C.bad:C.ok}); bd.push({l:z?8:10,s:"→ "+(z?"売り切れ":S[i]+"個"),c:C.f[2]}); }
    return {tp:e<4.0?[6,7]:(z?[7,8]:[9,10]),i,badge:bd}; }
  return {tp:[11,12,13,14],i,badge:[],loop:i<3}; }
// ---------- 描画:ブラウザ(縮尺 1 のとき 560×520) ----------
function drawBrowser(t){
  rr(0,0,BW0,BH0,12,C.br,C.brs,3);
  const url="127.0.0.1:5000/items", n=Math.round(cl((t-A.type0)/(A.enter-A.type0-0.2))*url.length);
  rr(14,12,BW0-28,34,7,"#fff",C.line,1.5); txt(url.slice(0,n)+(t<A.enter&&Math.floor(t*3)%2===0?"▏":""),26,29,{mono:1,size:17,c:C.sub});
  rr(14,58,BW0-28,BH0-72,8,"#fff",C.line,1.5);
  if(t<A.go){ txt("URL 欄に入力して Enter",BW0/2,200,{size:20,c:"#8A94A3",align:"center"}); g.strokeStyle=C.brs; g.lineWidth=3; g.beginPath(); g.roundRect(12,10,BW0-24,38,8); g.stroke();
    if(n>0){ rr(40,250,BW0-80,64,10,"#EEF4FB",C.brs,2); txt(url.slice(0,n),BW0/2,282,{mono:1,b:1,size:26,c:C.brs,align:"center"}); } }
  if(t<A.show){ if(t>=A.go) txt("(返事を待っている…)",BW0/2,280,{size:20,c:"#8A94A3",align:"center"});
    if(t>=A.go){ const a=RT*4; g.strokeStyle="#9AA3AF"; g.lineWidth=4; g.beginPath(); g.arc(BW0/2,230,16,a,a+4.2); g.stroke(); } }
  else { const X=[34,200,330], Wd=[166,130,130];
    const rows=[["商品名","価格","在庫"]].concat(NAMES.map((nm,i)=>[nm,PRICES[i]+"円",STOCKS[i]===0?"売り切れ":STOCKS[i]+"個"]));
    rows.forEach((r,i)=>{ const a=cl((t-A.show-i*0.18)/0.3); if(a<=0) return; g.globalAlpha=a; const y=84+i*52+(1-a)*-8;
      r.forEach((v,c)=>{ g.fillStyle=i===0?"#EEF1F5":"#fff"; g.fillRect(X[c],y,Wd[c],52); g.strokeStyle=C.line; g.lineWidth=1.2; g.strokeRect(X[c],y,Wd[c],52);
        txt(v,X[c]+12,y+26,{size:20,b:i===0,c:v==="売り切れ"?C.bad:C.ink}); }); g.globalAlpha=1; }); }
}
// ---------- 描画:サーバー(縮尺 1 のとき 1016×600) ----------
function drawServer(t,ws){
  const S=STOCKS, st=tplState(t);
  rr(0,0,SW0,SH0,12,C.sv,C.svs,3);
  // app.py
  rr(16,16,432,300,10,"#fff",C.svs,2.5); txt("app.py",PYX,40,{b:1,size:17,c:C.svt}); txt("Python のプログラム",PYX+70,40,{size:13,c:C.sub});
  const hlPy=[]; if(t>=A.route&&t<A.call) hlPy.push(4); if(t>=A.call&&t<A.data) hlPy.push(5); if(t>=A.data&&t<A.count) hlPy.push(0,1,2);
  if(t>=A.count&&t<A.pass) hlPy.push(6); if(t>=A.pass&&t<A.tstart) hlPy.push(7,8,9);
  hlPy.forEach(i=>{ g.save(); g.setLineDash([8,6]); g.lineDashOffset=-RT*30; g.strokeStyle=C.svs; g.lineWidth=2; g.strokeRect(20,PYY[i]-13,424,26); g.restore(); g.globalAlpha=PULSE(); g.fillStyle=C.hl; g.fillRect(22,PYY[i]-12,420,24); g.globalAlpha=1; });
  [0,1,2].forEach(r=>{ let x=PYX; x+=txt(LISTN[r]+" = [",x,PYY[r],{mono:1,size:LF}); listParts(r).forEach((v,i)=>{ x+=txt(v,x,PYY[r],{mono:1,size:LF}); if(i<3) x+=txt(", ",x,PYY[r],{mono:1,size:LF}); }); txt("]",x,PYY[r],{mono:1,size:LF}); });
  PYL.forEach((l,i)=>{ if(i>3) txt(l,PYX,PYY[i],{mono:1,size:14,c:i===4?C.req:C.ink,b:i===4}); });
  // 今の i の要素を囲む
  if(st.i!=null&&t<A.done){ const e=E(st.i,t); [[0,0.6,2.0],[1,2.0,3.4],[2,3.4,4.6]].forEach(([r,a,b])=>{ if(e>=a&&e<b){ const p=elPos(r,st.i); g.strokeStyle=C.f[r]; g.lineWidth=2; g.beginPath(); g.roundRect(p.x0-1,PYY[r]-12,p.w+2,24,4); g.stroke(); } }); }
  // くり返し
  const LY=344; txt("くり返し",PYX,LY,{b:1,size:16,c:C.svt});
  txt(t>=A.count?"count が 4 なので i は 0 → 3":"(count はまだない)",PYX+82,LY,{size:15,b:t>=A.count,c:t>=A.count?C.res:"#9AA3AF"});
  let ci=null; if(t>=A.loop&&t<A.done){ const i=curItem(t); ci=i===0?0:i-1+ease(cl(E(i,t)/0.4)); }
  for(let i=0;i<4;i++){ const cx=66+i*104, cur=ci!=null&&Math.round(ci)===i, done=(t>=A.done)||(ci!=null&&i<Math.round(ci));
    if(i<3){ g.strokeStyle=C.line; g.lineWidth=1.5; g.beginPath(); g.moveTo(cx+16,LY+34); g.lineTo(cx+88,LY+34); g.stroke(); }
    g.fillStyle=done?"#E3E7EE":"#fff"; g.beginPath(); g.arc(cx,LY+34,15,0,7); g.fill(); g.strokeStyle=C.line; g.lineWidth=1.5; g.stroke();
    txt(String(i),cx,LY+35,{mono:1,size:15,align:"center",c:C.sub}); txt(NAMES[i],cx,LY+64,{size:13,align:"center",c:cur?C.ink:C.sub,b:cur}); }
  if(ci!=null){ const cx=66+ci*104; g.strokeStyle=C.bad; g.lineWidth=3.5; g.beginPath(); g.arc(cx,LY+34,17,0,7); g.stroke(); }
  // できあがる HTML
  rr(16,430,420,154,10,"#fff","#6B7280",2.5); OBJ2D.documentFile(g,36,452,0.36,{text:"HTML"});
  txt(t>=A.done+0.5?"できあがった HTML":"サーバーの中で組み立て中の HTML",54,450,{b:1,size:15,c:C.svt});
  const lines=["","","","","","",""]; ws.forEach(w=>{ if(t>=w.t) lines[w.line]+=w.s; });
  const last=ws.filter(w=>t>=w.t).pop();
  lines.forEach((l,j)=>{ if(!l) return; const nw=last&&last.line===j&&t<last.t+0.6; if(nw){ g.fillStyle=C.hl; g.fillRect(22,HL(j)-9,420,18); } txt(l,HX,HL(j),{mono:1,size:12.5,c:nw?C.ink:C.sub,b:nw}); });
  // テンプレート
  rr(TX-14,16,546,428,10,"#fff",C.svs,2.5); txt("templates/items.html",TX,40,{b:1,size:17,c:C.svt}); if(!(t>=A.pass&&t<A.tstart+0.4)) txt("テンプレート(穴あきの HTML)",TX+520,40,{size:13,c:C.sub,align:"right"});
  st.tp.forEach(i=>{ g.save(); g.setLineDash([8,6]); g.lineDashOffset=-RT*30; g.strokeStyle=C.svs; g.lineWidth=2; g.strokeRect(TX-10,TPY(i)-12,536,24); g.restore(); g.globalAlpha=PULSE(); g.fillStyle=C.hl; g.fillRect(TX-8,TPY(i)-11,532,22); g.globalAlpha=1; });
  TP.forEach((l,i)=>{ const jj=[2,7,9,11,14].includes(i); txt(tpl(i),TX,TPY(i),{mono:1,size:i===1?13:14,c:jj?C.res:((i<2||i===15)?C.sub:C.ink),b:i===2||i===14}); });
  st.badge.forEach(b=>chip(b.s,BADGEX+70,TPY(b.l),b.c,{size:14}));
  if(st.loop){ const e=E(st.i,t), a=cl((e-4.6)/0.1); g.globalAlpha=a; arrow(1004,TPY(14),1004,TPY(2)+4,C.bad,3,1022,(TPY(14)+TPY(2))/2); txt("次の i へ",996,TPY(8),{b:1,size:14,c:C.bad,align:"right"}); g.globalAlpha=1; }
  // ターミナル
  rr(TX-14,456,546,128,10,"#1E2430",null); txt("ターミナル(python app.py を実行中)",TX,476,{b:1,size:14,c:"#D6DCE6"});
  if(t>=A.res+0.2){ g.globalAlpha=cl((t-A.res-0.2)/0.3); txt('127.0.0.1 - - [日時] "GET /items HTTP/1.1" 200 -',TX,506,{mono:1,size:13.5,c:"#E7EDF5"}); g.globalAlpha=1; }
  else txt("(記録はレスポンスを返したときに出る)",TX,506,{size:13,c:"#8A94A3"});
  // render_template で渡す(値の名前が items.html へ)
  if(t>=A.pass&&t<A.tstart+0.4){ const k=ease(cl((t-A.pass-0.2)/1.0)), a=1-cl((t-A.tstart)/0.4); g.globalAlpha=a;
    ["names","prices","stocks","count"].forEach((n,j)=>{ const x=lerp(300+j*20,TX+236+j*78,k), y=lerp(PYY[8+(j>1?1:0)],40,k)-Math.sin(k*Math.PI)*50; chip(n,x,y,j<3?C.f[j]:C.res,{size:13,mono:1}); });
    g.globalAlpha=1; }
  // 値が app.py のリストから テンプレートの行へ飛ぶ
  if(st.i!=null&&t<A.done){ const i=st.i, e=E(i,t);
    [[0,0.6,4],[1,2.0,5],[2,3.4,7]].forEach(([r,a,l])=>{ const k=ease(cl((e-a)/0.7)); if(e<a||e>a+0.75) return; const p=elPos(r,i);
      const x=lerp(p.x,BADGEX,k), y=lerp(PYY[r],TPY(l),k)-Math.sin(k*Math.PI)*40; chip(r===0?NAMES[i]:String(r===1?PRICES[i]:S[i]),x,y,C.f[r],{size:14}); }); }
  // テンプレートの行から HTML へ書き出す文字が飛ぶ
  ws.forEach(w=>{ const k=ease(cl((t-(w.t-0.45))/0.45)); if(t<w.t-0.45||t>=w.t) return;
    const before=ws.filter(v=>v.line===w.line&&v.t<w.t).map(v=>v.s).join(""); g.font=`700 12.5px ${MONO}`;
    const ex=HX+g.measureText(before).width+g.measureText(w.s).width/2, sx0=TX+120, sy0=TPY(w.from), cx=TX-10, cy=HY0-14, u=1-k, x=u*u*sx0+2*u*k*cx+k*k*ex, y=u*u*sy0+2*u*k*cy+k*k*HL(w.line);
    chip(w.s,x,y,C.svt,{size:12,mono:1}); });
}
// ---------- 流れの帯(いつも見える) ----------
const FLOW=[["URL を入力",0,"b"],["GET /items",A.go,"q"],["route を探す",A.route,"s"],["items() 実行",A.call,"s"],["値を渡す",A.pass,"s"],["HTML を作る",A.tstart,"s"],["レスポンス",A.res,"r"],["画面に表示",A.show,"b"]];
function drawFlow(t){ const gm=g; g=FG; const y=37, x0=20, w=(W-40)/FLOW.length;
  g.fillStyle="#EEF1F5"; g.fillRect(0,0,W,74);
  const cur=FLOW.reduce((k,f,i)=>t>=f[1]?i:k,0);
  FLOW.forEach((f,i)=>{ const x=x0+i*w, on=i===cur, done=i<cur, col=f[2]==="q"?C.req:f[2]==="r"?C.res:f[2]==="s"?C.svs:C.brs;
    rr(x+4,y-24,w-26,48,10,on?col:(done?"#fff":"#F7F8FA"),on?col:(done?col:C.line),on?3:1.5);
    if(on){ g.save(); g.setLineDash([10,7]); g.lineDashOffset=-RT*40; g.strokeStyle=col; g.lineWidth=3; g.beginPath(); g.roundRect(x,y-29,w-18,58,13); g.stroke(); g.restore(); }
    txt((i+1)+" "+f[0],x+4+(w-26)/2,y,{size:14.5,b:on||done,c:on?"#fff":(done?col:"#9AA3AF"),align:"center"});
    if(i<FLOW.length-1){ g.fillStyle=done?col:C.line; g.beginPath(); g.moveTo(x+w-19,y-7); g.lineTo(x+w-8,y); g.lineTo(x+w-19,y+7); g.closePath(); g.fill(); } });
  g=gm; }
// ---------- まとめて描く ----------
let WS=writes(), RT=0; const PULSE=()=>0.55+0.45*(0.5+0.5*Math.sin(RT*4.5));
function render(t){
  g.fillStyle="#F9FBFD"; g.fillRect(0,0,W,H);
  const L=lay(t);
  OBJ2D.laptop(g,72,48,0.62,{t,active:t<A.go||t>=A.show}); label("ブラウザ(クライアント)",226,48,C.brs);
  OBJ2D.server(g,1222,48,0.4,{t,active:t>=A.arrive&&t<A.res}); label("サーバー(Flask)",1090,48,C.svs);
  g.save(); g.translate(L.bx,L.by); g.scale(L.bs,L.bs); drawBrowser(t); g.restore();
  g.save(); g.translate(L.sx,L.sy); g.scale(L.ss,L.ss); drawServer(t,WS); g.restore();
  // リクエスト(GET /items)
  if(t>=A.go&&t<A.route+0.8){ let x,y; const bxr=L.bx+BW0*L.bs;
    if(t<A.arrive){ const k=ease(cl((t-A.go)/(A.arrive-A.go))); x=lerp(bxr+70,L.sx-60,k); y=TOP+150; }
    else if(t<A.route){ x=L.sx-60; y=TOP+150; }
    else { const k=ease(cl((t-A.route)/0.6)); x=lerp(L.sx-60,L.sx+(PYX+300)*L.ss,k); y=lerp(TOP+150,L.sy+PYY[4]*L.ss,k); }
    const a=t<A.arrive?1:t<A.route?1-cl((t-A.arrive)/0.3):(t>A.route+0.5?1-cl((t-A.route-0.5)/0.3):cl((t-A.route)/0.2));
    if(t<A.arrive){ g.strokeStyle="rgba(201,119,42,.4)"; g.lineWidth=6; g.beginPath(); g.moveTo(bxr+6,TOP+150); g.lineTo(x-50,TOP+150); g.stroke(); txt("リクエスト",(bxr+x)/2,TOP+186,{b:1,size:16,c:C.req,align:"center"}); }
    g.globalAlpha=a; OBJ2D.packet(g,x,y,1.1,{t,text:"GET /items",color:C.req,dir:1}); g.globalAlpha=1; }
  // パスが一致(@app.route の行の右に札)
  if(t>=A.route+0.6&&t<A.call){ const a=cl((t-A.route-0.6)/0.3); g.globalAlpha=a; const x=L.sx+(PYX+tw('@app.route("/items")',{mono:1,size:14,b:1})+14)*L.ss, y=L.sy+PYY[4]*L.ss;
    arrow(x+70,y,x+4,y,C.req,3); chip("GET /items",x+130,y,C.req,{size:14,mono:1}); txt("パスが同じ",x+194,y,{b:1,size:14,c:C.req}); g.globalAlpha=1; }
  // Flask が items() を呼ぶ
  if(t>=A.call-0.2&&t<A.data){ const a=cl((t-A.call+0.2)/0.3); g.globalAlpha=a; const x=L.sx+(PYX+150)*L.ss, y=L.sy+PYY[5]*L.ss;
    const x2=L.sx+(PYX+tw("def items():",{mono:1,size:14})+14)*L.ss; arrow(x2+70,y,x2+4,y,C.req,3); txt("Flask が items() を呼ぶ",x2+78,y,{b:1,size:15,c:C.req}); g.globalAlpha=1; }
  // レスポンス(できた HTML がブラウザへ)
  if(t>=A.zb1&&t<A.arriveB+0.3){ const k=ease(cl((t-A.zb1)/(A.arriveB-A.zb1))), bxr=L.bx+BW0*L.bs;
    const x0=L.sx+20, x=lerp(x0,bxr+90,k), y=lerp(TOP+60,TOP+300,k), a=t>A.arriveB?1-cl((t-A.arriveB)/0.3):1;
    g.strokeStyle="rgba(31,58,95,.35)"; g.lineWidth=6; g.beginPath(); g.moveTo(L.sx-4,TOP+94); g.lineTo(x,y+34); g.stroke();
    txt("レスポンス",x+70,y+60,{b:1,size:16,c:C.res,align:"center"});
    g.globalAlpha=a; OBJ2D.packet(g,x,y,1.1,{t,text:"200 OK + HTML",color:C.res,dir:-1}); g.globalAlpha=1; }
  drawFlow(t);
}
// 字幕(場面の時刻 c で書く)。再生では、字幕を読み終えられるように場面ごとに時間を延ばす
const EVENTS=[
  {t:0,text:"URL 欄に <code>127.0.0.1:5000/items</code> と入力して Enter。"},
  {t:A.go,text:"<b>GET /items</b> のリクエストがサーバーへ送られる。"},
  {t:A.arrive,text:"サーバーに届いた。ここからサーバーの中を大きく見る。"},
  {t:A.route,text:"Flask が <code>@app.route(\"/items\")</code> を見つける。パスが同じ。"},
  {t:A.call,text:"<b>Flask が items() を呼ぶ</b>(呼ぶコードは書かない)。"},
  {t:A.data,text:"データは3つのリスト。<b>同じ番号が同じ商品</b>。"},
  {t:A.count,text:"<code>count = len(names)</code> で <b>count は 4</b>。"},
  {t:A.pass,text:"<code>render_template</code> で値を渡す。<code>names=names</code> は<b>左がテンプレートで使う名前、右が Python の変数</b>。"},
  {t:A.tstart,text:"テンプレートを上から読む。<code>{{ }}</code> などのない行は<b>そのまま</b>書き出す。"},
];
function addLoopEvents(){ EVENTS.length=9; const S=STOCKS;
  for(let i=0;i<4;i++){ const z=S[i]===0, out=z?"売り切れ":S[i]+"個";
    if(i===0){
      EVENTS.push({t:R(i,0),text:`<code>{% for i in range(count) %}</code>:<b>i = 0</b> の回。<code>&lt;tr&gt;</code> を書き出す。`});
      EVENTS.push({t:R(i,0.6),text:`<code>{{ names[i] }}</code> は names[0]。<b>0番</b>の「${NAMES[0]}」が入る。`});
      EVENTS.push({t:R(i,2.0),text:`<code>{{ prices[i] }}円</code> は prices[0] で「<b>${PRICES[0]}円</b>」。番号が同じなので同じ商品。`});
      EVENTS.push({t:R(i,3.4),text:`<code>{% if stocks[i] == 0 %}</code>:stocks[0] は ${S[0]}。<b>${S[0]} == 0 は ${z?"True":"False"}</b> → 「${out}」。`});
      EVENTS.push({t:R(i,4.6),text:`<code>{% endfor %}</code> で <b>for の行へ戻り</b>、次は i = 1。`});
    } else {
      EVENTS.push({t:R(i,0),text:`<b>i = ${i}</b>(${NAMES[i]})の回。`});
      EVENTS.push({t:R(i,0.6),text:`names[${i}] → 「${NAMES[i]}」`});
      EVENTS.push({t:R(i,2.0),text:`prices[${i}] → 「${PRICES[i]}円」`});
      EVENTS.push({t:R(i,3.4),text:`stocks[${i}] は ${S[i]}。<b>${S[i]} == 0 は ${z?"True":"False"}</b> → 「${out}」。`});
      EVENTS.push({t:R(i,4.6),text:i<3?`for の行へ戻る(次は i = ${i+1})。`:"i = 3 で最後。<code>{% endfor %}</code> でくり返しが終わる。"+(FLAT?"字下げがなくても範囲は endfor まで。":"")}); } }
  EVENTS.push({t:A.done,text:"サーバーの中で <b>HTML ができあがった</b>。まだブラウザには届いていない。"});
  EVENTS.push({t:A.res,text:"HTML が <b>レスポンス</b>として返る。<code>{{ }}</code> は残っていない。"});
  EVENTS.push({t:A.show,text:"ブラウザが HTML を読んで <b>表を描く</b>。"});
  REV.length=0; EVENTS.forEach(e=>REV.push({t:toReal(e.t),text:e.text})); }
// 場面の時刻 c ⇔ 再生の時刻 r(字幕1つを「1秒+文字数÷8秒」以上は見せる)
const REV=[]; let KC=[], KR=[];
function buildWarp(){ KC=[0]; KR=[0]; const ev=EVENTS;
  ev.forEach((e,k)=>{ const c1=k+1<ev.length?ev[k+1].t:DUR, len=c1-e.t, need=1+e.text.replace(/<[^>]+>/g,"").length/8;
    KC.push(c1); KR.push(KR[KR.length-1]+Math.max(len,need)); }); }
function toCanon(r){ for(let k=0;k<KR.length-1;k++) if(r<=KR[k+1]) return KC[k]+(r-KR[k])/(KR[k+1]-KR[k])*(KC[k+1]-KC[k]); return DUR; }
function toReal(c){ for(let k=0;k<KC.length-1;k++) if(c<=KC[k+1]) return KR[k]+(c-KC[k])/Math.max(1e-6,KC[k+1]-KC[k])*(KR[k+1]-KR[k]); return KR[KR.length-1]; }
addLoopEvents(); buildWarp(); addLoopEvents();
const api=VIZPLAYER.create({duration:KR[KR.length-1],events:REV,holds:[],hitstop:false,render:r=>{ RT=r; render(toCanon(r)); }});
// ---------- 予想してから進む ----------
const pred=document.getElementById("pred"); let asked={}, pending=-1, lastS=0;
function ifT(i){ return toReal(R(i,3.4)); }
(function watch(){ const s=api.sceneTime();
  if(Math.abs(s-lastS)>0.3){ lastS=s; requestAnimationFrame(watch); return; }
  if(document.getElementById("evstop").checked&&api.isPlaying()){ for(let k=1;k<REV.length;k++){ const te=REV[k].t; if(lastS<te&&s>=te){ api.pause(); break; } } }
  if(document.getElementById("predict").checked&&api.isPlaying()){ for(let i=0;i<4;i++){ const ti=ifT(i); if(lastS<ti&&s>=ti&&!asked[i]){ api.pause(); api.seekScene(ti-0.01); pending=i;
    document.getElementById("predq").textContent=`予想:stocks[${i}] は ${STOCKS[i]}。${NAMES[i]}の在庫の欄に表示されるのは?`; document.getElementById("predr").textContent=""; pred.querySelectorAll("button").forEach(x=>x.hidden=false); pred.classList.add("on"); break; } } }
  lastS=api.sceneTime(); requestAnimationFrame(watch); })();
pred.querySelectorAll("button").forEach(b=>b.onclick=()=>{ if(pending<0) return; const i=pending, z=STOCKS[i]===0, ok=(b.dataset.p==="1")===z;
  asked[i]=1; pending=-1; pred.querySelectorAll("button").forEach(x=>x.hidden=true);
  document.getElementById("predr").textContent=(ok?"予想どおり。":"予想とちがった。")+` ${STOCKS[i]} == 0 は ${z?"True":"False"} なので「${z?"売り切れ":STOCKS[i]+"個"}」。`;
  api.play(); setTimeout(()=>{ if(pending<0) pred.classList.remove("on"); },4000); });
document.getElementById("reset").addEventListener("click",()=>{ asked={}; pending=-1; pred.classList.remove("on"); });
document.getElementById("predict").addEventListener("change",e=>{ document.body.classList.toggle("predmode",e.target.checked); pred.classList.remove("on"); });
document.getElementById("preset").onchange=e=>{ pred.classList.remove("on"); pending=-1; STOCKS=e.target.value.split(",").map(Number); WS=writes(); addLoopEvents(); asked={}; api.seekScene(0); };
document.getElementById("flat").onchange=e=>{ FLAT=e.target.checked; addLoopEvents(); };
