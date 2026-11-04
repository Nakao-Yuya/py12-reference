const cv=document.getElementById("c"), g=cv.getContext("2d");
// 画面の幅が狭いとき(スマホ)は縦長の配置にする:サーバー=上・ブラウザ=下
const MQ=matchMedia("(max-width:700px)"); let P=false;
function applyMode(){ P=MQ.matches; cv.width=P?480:1280; cv.height=P?790:830; cv.classList.toggle("portrait",P); }
applyMode(); MQ.addEventListener("change",applyMode);
const UI='"Yu Gothic UI","Yu Gothic","Meiryo","Hiragino Sans","Noto Sans JP",sans-serif', MONO='Consolas,Menlo,"Courier New",monospace';
const NOLABEL=new URLSearchParams(location.search).has("nolabel");
const COL={req:"#C9772A",res:"#1F3A5F",br:"#DCE6F2",brs:"#2F6FB2",sv:"#FFF1E0",svs:"#C9772A",ink:"#1E2430",sub:"#4A5568",line:"#B8C2CF",ok:"#1E6B45",link:"#1a5bd8"};
const clamp01=x=>Math.max(0,Math.min(1,x)), ease=s=>s<.5?2*s*s:1-Math.pow(-2*s+2,2)/2;
const lerp=(a,b,s)=>a+(b-a)*ease(clamp01(s));
function rr(x,y,w,h,r,fill,stroke,lw=2){ g.beginPath(); g.roundRect(x,y,w,h,r); if(fill){g.fillStyle=fill;g.fill();} if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();} }
function txt(s,x,y,o={}){ g.font=`${o.b?700:400} ${o.size||18}px ${o.mono?MONO:UI}`; g.fillStyle=o.c||COL.ink; g.textAlign=o.align||"left"; g.textBaseline="middle"; g.fillText(s,x,y); return g.measureText(s).width; }
function label(s,x,y,col){ if(NOLABEL) return; g.font=`700 18px ${UI}`; const w=g.measureText(s).width+18; rr(x-w/2,y-15,w,30,6,"#fff",col,1.5); g.fillStyle=col; g.textAlign="center"; g.textBaseline="middle"; g.fillText(s,x,y+1); }
function hl(x,y,w,on){ if(on){ g.fillStyle="rgba(255,208,138,.6)"; g.fillRect(x,y-15,w,30); } }

// 時刻(場面の秒)
const A={type:0, enter:1.3, go:1.5, arrive:4.2, call:5.0, ret:6.4, file:7.4, back:9.2, home:12.2,
         click:14.8, go2:15.4, arrive2:18.1, call2:18.9, ret2:20.3, back2:23.1, about:26.1,
         type3:28.0, enter3:29.2, go3:29.4, arrive3:32.1, back3:33.8, nf:36.8};
const URL1="127.0.0.1:5000/", URL2="127.0.0.1:5000/about", URL3="127.0.0.1:5000/contact";

function renderL(t,fx){
  g.fillStyle="#F9FBFD"; g.fillRect(0,0,cv.width,cv.height);
  // ---- ブラウザ ----
  OBJ2D.laptop(g,92,62,0.7,{t,active:(t>A.home&&t<A.home+1)||(t>A.about&&t<A.about+1)});
  label("ブラウザ(クライアント)",250,62,COL.brs);
  rr(28,110,420,560,10,COL.br,COL.brs,2.5);
  // URL バー
  const typing=t<A.enter, second=t>=A.click+0.3;
  let url=second?URL2:URL1.slice(0,Math.max(0,Math.min(URL1.length,Math.floor(t/A.type0||0))));
  if(!second){ const n=Math.floor(clamp01(t/1.2)*URL1.length); url=URL1.slice(0,n); }
  if(t>=A.type3){ const base="127.0.0.1:5000/", n=Math.floor(clamp01((t-A.type3)/1.0)*7); url=base+"contact".slice(0,n); }
  rr(44,124,388,32,6,"#fff",(t<A.enter+0.3||(t>A.click&&t<A.click+0.8)||(t>A.type3&&t<A.enter3+0.3))?COL.req:COL.line,(t<A.enter+0.3)?2.5:1.5);
  txt(url+((t<A.enter&&Math.floor(t*3)%2===0)?"|":""),56,140,{mono:1,size:17,c:COL.ink});
  if((t>=A.enter-0.2&&t<A.enter+0.6)||(t>=A.enter3-0.2&&t<A.enter3+0.6)) txt("Enter ⏎",420,140,{b:1,size:15,c:COL.req,align:"right"});
  // 画面
  rr(44,170,388,484,6,"#fff",COL.line,1.5);
  const pHome=clamp01((t-A.home)/0.5)*(1-clamp01((t-A.about+0.3)/0.3)), pAbout=clamp01((t-A.about)/0.5)*(1-clamp01((t-A.nf+0.3)/0.3)), pNF=clamp01((t-A.nf)/0.5);
  if(pHome>0){ g.globalAlpha=pHome;
    txt("Hello, Flask!",64,214,{b:1,size:26}); txt("テンプレートから表示しています。",64,256,{size:16});
    const clk=t>A.click-0.6&&t<A.click+0.6;
    txt("このサイトについて",64,306,{size:18,c:COL.link}); g.fillStyle=COL.link; g.fillRect(64,318,162,2);
    if(clk){ rr(58,290,176,34,4,null,COL.req,3); }

    // マウスの矢印
    if(t>A.click-1.4&&t<A.click+0.8){ const mx=lerp(330,190,(t-(A.click-1.4))/1.2), my=lerp(470,312,(t-(A.click-1.4))/1.2);
      g.fillStyle="#1E2430"; g.beginPath(); g.moveTo(mx,my); g.lineTo(mx,my+26); g.lineTo(mx+7,my+20); g.lineTo(mx+13,my+31); g.lineTo(mx+17,my+29); g.lineTo(mx+11,my+18); g.lineTo(mx+20,my+18); g.closePath(); g.fill(); }
    g.globalAlpha=1; }
  if(pAbout>0){ g.globalAlpha=pAbout; txt("このサイトについて",64,214,{b:1,size:26}); txt("Flaskの授業で作っているサイトです。",64,256,{size:16});
    txt("トップへ戻る",64,306,{size:18,c:COL.link}); g.fillStyle=COL.link; g.fillRect(64,318,108,2); g.globalAlpha=1; }
  if(pNF>0){ g.globalAlpha=pNF; txt("Not Found",64,214,{b:1,size:26}); txt("The requested URL was not found",64,256,{size:15}); txt("on the server. …",64,280,{size:15}); g.globalAlpha=1; }
  if(pHome<=0&&pAbout<=0&&pNF<=0) txt("(まだ何も表示されていない)",238,410,{size:16,c:"#9AA3AF",align:"center"});
  // リンクの HTML(画面の外に注記)
  if(t>A.home+0.5&&t<A.go2+0.5){ g.globalAlpha=clamp01((t-A.home-0.5)/0.4)*clamp01((A.go2+0.5-t)/0.4);
    g.strokeStyle=COL.req; g.lineWidth=2; g.setLineDash([5,4]); g.beginPath(); g.moveTo(230,306); g.lineTo(470,330); g.stroke(); g.setLineDash([]);
    rr(470,314,300,62,8,"#fff",COL.req,2); txt("このリンクの HTML",482,332,{size:14,b:1,c:COL.req}); txt('<a href="/about">…</a>',482,358,{mono:1,size:15,b:1});
    g.globalAlpha=1; }

  // ---- サーバー ----
  OBJ2D.server(g,1180,64,0.48,{t,active:(t>A.arrive&&t<A.back)||(t>A.arrive2&&t<A.back2)});
  label("サーバー(Flask)",1040,62,COL.svs);
  rr(830,110,422,452,10,COL.sv,COL.svs,2.5);
  txt("section02/(プロジェクトフォルダ)",846,132,{b:1,size:15,c:"#6B3A0A"});
  rr(846,148,390,198,8,"#fff",COL.svs,2); txt("app.py",858,168,{b:1,size:15,c:"#6B3A0A"});
  const L=[ ['@app.route("/")',196],['def index():',220],['    return render_template("index.html")',244],
            ['@app.route("/about")',280],['def about():',304],['    return render_template("about.html")',328] ];
  const HX=850, HW=382;
  hl(HX,196,HW,(t>A.arrive&&t<A.call+0.6)); hl(HX,220,HW,(t>A.call&&t<A.ret)); hl(HX,244,HW,(t>A.ret&&t<A.back));
  hl(HX,280,HW,(t>A.arrive2&&t<A.call2+0.6)); hl(HX,304,HW,(t>A.call2&&t<A.ret2)); hl(HX,328,HW,(t>A.ret2&&t<A.back2));
  L.forEach(([s,y])=>txt(s,858,y,{mono:1,size:14.5}));
  const callArrow=(y1,y2,t0)=>{ if(t<t0||t>t0+1.6) return; g.strokeStyle=COL.req; g.lineWidth=3; g.beginPath(); g.moveTo(1222,y1); g.quadraticCurveTo(1246,(y1+y2)/2,1222,y2); g.stroke();
    g.fillStyle=COL.req; g.beginPath(); g.moveTo(1222,y2); g.lineTo(1234,y2-8); g.lineTo(1234,y2+8); g.fill();
    g.font=`700 14px ${UI}`; const lw=g.measureText("すぐ下の関数を実行").width; g.fillStyle="#fff"; g.fillRect(1212-lw-6,(y1+y2)/2-10,lw+8,20); g.fillStyle=COL.req; g.textAlign="right"; g.textBaseline="middle"; g.fillText("すぐ下の関数を実行",1212,(y1+y2)/2); };
  callArrow(196,220,A.call-0.2); callArrow(280,304,A.call2-0.2);
  if(t>A.arrive3&&t<A.back3+0.6){ [[196,'"/" ≠ "/contact"'],[280,'"/about" ≠ "/contact"']].forEach(([y,m])=>{ g.fillStyle="rgba(179,38,30,.10)"; g.fillRect(HX,y-15,HW,30); txt("✕ "+m,1222,y,{size:13,b:1,c:"#B3261E",align:"right"}); });
    txt("合う @app.route がない → 404",1236,132,{size:14,b:1,c:"#B3261E",align:"right"}); }
  // templates フォルダ(app.py と同じ場所)
  rr(846,360,390,186,8,"#fff",COL.svs,2); txt("templates/",858,380,{b:1,size:15,c:"#6B3A0A"});
  txt("app.py と同じフォルダの中にある",1222,380,{size:13,c:COL.sub,align:"right"});
  const f1=t>A.ret&&t<A.back, f2=t>A.ret2&&t<A.back2;
  OBJ2D.documentFile(g,930,456,0.95,{t,text:"HTML",color:f1?COL.req:"#7A8698"}); txt("index.html",930,512,{mono:1,size:14,align:"center",b:f1});
  OBJ2D.documentFile(g,1090,456,0.95,{t,text:"HTML",color:f2?COL.req:"#7A8698"}); txt("about.html",1090,512,{mono:1,size:14,align:"center",b:f2});
  // 読んだ HTML ファイルが return の行へ
  const fileMove=(t0,t1,fx,ly)=>{ if(t<t0||t>t1) return; const k=(t-t0)/(t1-t0); const x=lerp(fx,1150,k), y=lerp(456,ly,k);
    OBJ2D.documentFile(g,x,y,0.7,{t,text:"HTML",color:COL.req}); };
  fileMove(A.ret+0.2,A.file+0.6,930,244); fileMove(A.ret2+0.2,A.ret2+1.8,1090,328);
  // ターミナル(サーバーを起動した画面)
  rr(830,580,422,112,8,"#1E2430",null); txt("ターミナル(python app.py を実行中)",846,598,{b:1,size:14,c:"#C9D1DC"});
  const logs=[[A.back,'"GET / HTTP/1.1" 200 -',"#E8EEF5"],[A.back2,'"GET /about HTTP/1.1" 200 -',"#E8EEF5"],[A.back3,'"GET /contact HTTP/1.1" 404 -',"#F2928A"]];
  logs.forEach(([t0,s,c],i)=>{ if(t<t0) return; g.globalAlpha=clamp01((t-t0)/0.4); txt("127.0.0.1 - - [日時] "+s,846,624+i*24,{mono:1,size:13,c}); g.globalAlpha=1; });

  // ---- 通信 ----
  const req=(t0,t1,text)=>{ if(t<t0||t>t1+0.4) return; const k=(t-t0)/(t1-t0), x=lerp(450,820,k), fade=t>t1?1-clamp01((t-t1)/0.4):1;
    g.strokeStyle="rgba(201,119,42,.4)"; g.lineWidth=6; g.beginPath(); g.moveTo(450,250); g.lineTo(x,250); g.stroke();
    g.globalAlpha=fade; OBJ2D.packet(g,x-10,226,1.25,{t,text,color:COL.req,dir:1}); g.globalAlpha=1; txt("リクエスト",470,282,{b:1,size:16,c:COL.req}); };
  const res=(t0,t1,text)=>{ if(t<t0||t>t1+0.4) return; const k=(t-t0)/(t1-t0), x=lerp(770,510,k), fade=t>t1?1-clamp01((t-t1)/0.4):1;
    g.strokeStyle="rgba(31,58,95,.4)"; g.lineWidth=6; g.beginPath(); g.moveTo(828,560); g.lineTo(x-50,560); g.stroke();
    g.globalAlpha=fade; OBJ2D.packet(g,x,530,1.25,{t,text,color:COL.res,dir:-1}); g.globalAlpha=1; txt("レスポンス",640,596,{b:1,size:16,c:COL.res,align:"center"}); };
  req(A.go,A.arrive,"GET /"); res(A.back,A.home,"200 OK + HTML");
  req(A.go2,A.arrive2,"GET /about"); res(A.back2,A.about,"200 OK + HTML");
  req(A.go3,A.arrive3,"GET /contact"); res(A.back3,A.nf,"404 Not Found");
  // HTML(文字データ)の中身
  const doc=(t0,t1,lines)=>{ if(t<t0||t>t1) return; const a=clamp01((t-t0)/0.4)*clamp01((t1-t)/0.4);
    g.globalAlpha=a; rr(480,300,320,150,8,"#fff",COL.res,2.5); txt("レスポンスの中身(HTML という文字)",494,322,{b:1,size:14,c:COL.res});
    lines.forEach((l,i)=>txt(l,494,352+i*26,{mono:1,size:14})); g.globalAlpha=1; };
  doc(A.back,A.home+0.4,['<h1>Hello, Flask!</h1>','<p>テンプレートから…</p>','<a href="/about">…</a>']);
  doc(A.back2,A.about+0.4,['<h1>このサイトについて</h1>','<p>Flaskの授業で…</p>','<a href="/">…</a>']);

  if(fx){ const h=fx.hold, F=VIZPLAYER.FX; F.ripple(g,h.x,h.y,fx,h.c,0.8); F.flash(g,h.x,h.y,fx,90);
    F.callout(g,h.cx??h.x,h.cy??h.y,h.lines,fx,h.c,{size:21,below:h.below}); }
}

// ---------- 縦長(スマホ)の配置 ----------
function renderP(t,fx){
  g.fillStyle="#F9FBFD"; g.fillRect(0,0,cv.width,cv.height);
  // ---- サーバー(上) ----
  rr(10,40,460,410,10,COL.sv,COL.svs,2.5);
  label("サーバー(Flask)",240,24,COL.svs);
  txt("section02/(プロジェクトフォルダ)",24,58,{b:1,size:14,c:"#6B3A0A"});
  rr(22,72,436,168,8,"#fff",COL.svs,2); txt("app.py",34,90,{b:1,size:15,c:"#6B3A0A"});
  const L=[['@app.route("/")',114],['def index():',136],['    return render_template("index.html")',158],
           ['@app.route("/about")',184],['def about():',206],['    return render_template("about.html")',228]];
  const HX=26, HW=428;
  hl(HX,114,HW,(t>A.arrive&&t<A.call+0.6)); hl(HX,136,HW,(t>A.call&&t<A.ret)); hl(HX,158,HW,(t>A.ret&&t<A.back));
  hl(HX,184,HW,(t>A.arrive2&&t<A.call2+0.6)); hl(HX,206,HW,(t>A.call2&&t<A.ret2)); hl(HX,228,HW,(t>A.ret2&&t<A.back2));
  L.forEach(([s,y])=>txt(s,34,y,{mono:1,size:14}));
  const callArrow=(y1,y2,t0)=>{ if(t<t0||t>t0+1.6) return; g.strokeStyle=COL.req; g.lineWidth=3; g.beginPath(); g.moveTo(446,y1); g.quadraticCurveTo(466,(y1+y2)/2,446,y2); g.stroke();
    g.fillStyle=COL.req; g.beginPath(); g.moveTo(446,y2); g.lineTo(457,y2-7); g.lineTo(457,y2+7); g.fill();
    g.font=`700 13px ${UI}`; const lw=g.measureText("すぐ下の関数を実行").width; g.fillStyle="#fff"; g.fillRect(438-lw-6,(y1+y2)/2-9,lw+8,18); g.fillStyle=COL.req; g.textAlign="right"; g.textBaseline="middle"; g.fillText("すぐ下の関数を実行",438,(y1+y2)/2); };
  callArrow(114,136,A.call-0.2); callArrow(184,206,A.call2-0.2);
  if(t>A.arrive3&&t<A.back3+0.6){ [[114,'"/" ≠ "/contact"'],[184,'"/about" ≠ "/contact"']].forEach(([y,m])=>{ g.fillStyle="rgba(179,38,30,.10)"; g.fillRect(HX,y-15,HW,30); txt("✕ "+m,446,y,{size:13,b:1,c:"#B3261E",align:"right"}); });
    txt("合う @app.route がない → 404",446,90,{size:13,b:1,c:"#B3261E",align:"right"}); }
  rr(22,248,436,96,8,"#fff",COL.svs,2); txt("templates/",34,266,{b:1,size:15,c:"#6B3A0A"});
  txt("app.py と同じフォルダの中にある",446,266,{size:12,c:COL.sub,align:"right"});
  const f1=t>A.ret&&t<A.back, f2=t>A.ret2&&t<A.back2;
  OBJ2D.documentFile(g,160,298,0.62,{t,text:"HTML",color:f1?COL.req:"#7A8698"}); txt("index.html",160,332,{mono:1,size:13,align:"center",b:f1});
  OBJ2D.documentFile(g,320,298,0.62,{t,text:"HTML",color:f2?COL.req:"#7A8698"}); txt("about.html",320,332,{mono:1,size:13,align:"center",b:f2});
  const fileMove=(t0,t1,fx0,ly)=>{ if(t<t0||t>t1) return; const k=(t-t0)/(t1-t0); OBJ2D.documentFile(g,lerp(fx0,410,k),lerp(298,ly,k),0.5,{t,text:"HTML",color:COL.req}); };
  fileMove(A.ret+0.2,A.file+0.6,160,158); fileMove(A.ret2+0.2,A.ret2+1.8,320,228);
  rr(22,352,436,90,8,"#1E2430",null); txt("ターミナル(python app.py を実行中)",34,368,{b:1,size:13,c:"#C9D1DC"});
  const logs=[[A.back,'"GET / HTTP/1.1" 200 -',"#E8EEF5"],[A.back2,'"GET /about HTTP/1.1" 200 -',"#E8EEF5"],[A.back3,'"GET /contact HTTP/1.1" 404 -',"#F2928A"]];
  logs.forEach(([t0,s,c],i)=>{ if(t<t0) return; g.globalAlpha=clamp01((t-t0)/0.4); txt("127.0.0.1 - - [日時] "+s,34,390+i*19,{mono:1,size:12,c}); g.globalAlpha=1; });

  // ---- ブラウザ(下) ----
  rr(10,610,460,170,10,COL.br,COL.brs,2.5);
  label("ブラウザ(クライアント)",240,610,COL.brs);
  let url; if(t>=A.click+0.3) url=URL2; else url=URL1.slice(0,Math.floor(clamp01(t/1.2)*URL1.length));
  if(t>=A.type3){ const n=Math.floor(clamp01((t-A.type3)/1.0)*7); url="127.0.0.1:5000/"+"contact".slice(0,n); }
  rr(22,630,436,30,6,"#fff",(t<A.enter+0.3||(t>A.click&&t<A.click+0.8)||(t>A.type3&&t<A.enter3+0.3))?COL.req:COL.line,(t<A.enter+0.3)?2.5:1.5);
  txt(url+((t<A.enter&&Math.floor(t*3)%2===0)?"|":""),32,645,{mono:1,size:16});
  if((t>=A.enter-0.2&&t<A.enter+0.6)||(t>=A.enter3-0.2&&t<A.enter3+0.6)) txt("Enter ⏎",448,645,{b:1,size:14,c:COL.req,align:"right"});
  rr(22,668,436,104,6,"#fff",COL.line,1.5);
  const pHome=clamp01((t-A.home)/0.5)*(1-clamp01((t-A.about+0.3)/0.3)), pAbout=clamp01((t-A.about)/0.5)*(1-clamp01((t-A.nf+0.3)/0.3)), pNF=clamp01((t-A.nf)/0.5);
  if(pHome>0){ g.globalAlpha=pHome;
    txt("Hello, Flask!",36,692,{b:1,size:22}); txt("テンプレートから表示しています。",36,720,{size:14});
    txt("このサイトについて",36,750,{size:16,c:COL.link}); g.fillStyle=COL.link; g.fillRect(36,760,144,2);
    if(t>A.click-0.6&&t<A.click+0.6) rr(30,736,156,30,4,null,COL.req,3);
    if(t>A.click-1.4&&t<A.click+0.8){ const mx=lerp(330,150,(t-(A.click-1.4))/1.2), my=lerp(700,744,(t-(A.click-1.4))/1.2);
      g.fillStyle="#1E2430"; g.beginPath(); g.moveTo(mx,my); g.lineTo(mx,my+26); g.lineTo(mx+7,my+20); g.lineTo(mx+13,my+31); g.lineTo(mx+17,my+29); g.lineTo(mx+11,my+18); g.lineTo(mx+20,my+18); g.closePath(); g.fill(); }
    g.globalAlpha=1; }
  if(pAbout>0){ g.globalAlpha=pAbout; txt("このサイトについて",36,692,{b:1,size:22}); txt("Flaskの授業で作っているサイトです。",36,720,{size:14});
    txt("トップへ戻る",36,750,{size:16,c:COL.link}); g.fillStyle=COL.link; g.fillRect(36,760,96,2); g.globalAlpha=1; }
  if(pNF>0){ g.globalAlpha=pNF; txt("Not Found",36,692,{b:1,size:22}); txt("The requested URL was not found",36,720,{size:13}); txt("on the server. …",36,740,{size:13}); g.globalAlpha=1; }
  if(pHome<=0&&pAbout<=0&&pNF<=0) txt("(まだ何も表示されていない)",240,720,{size:15,c:"#9AA3AF",align:"center"});
  if(t>A.home+0.5&&t<A.go2+0.5){ g.globalAlpha=clamp01((t-A.home-0.5)/0.4)*clamp01((A.go2+0.5-t)/0.4);
    g.strokeStyle=COL.req; g.lineWidth=2; g.setLineDash([5,4]); g.beginPath(); g.moveTo(182,752); g.lineTo(280,742); g.stroke(); g.setLineDash([]);
    rr(280,712,178,54,8,"#fff",COL.req,2); txt("このリンクの HTML",290,728,{size:12,b:1,c:COL.req}); txt('<a href="/about">…</a>',290,751,{mono:1,size:12,b:1});
    g.globalAlpha=1; }

  // ---- 通信(上下) ----
  const vArrow=(x,y,d,col)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(x-12,y); g.lineTo(x,y+d*16); g.lineTo(x+12,y); g.closePath(); g.fill(); };
  const req=(t0,t1,text)=>{ if(t<t0||t>t1+0.4) return; const k=(t-t0)/(t1-t0), y=lerp(582,476,k), fade=t>t1?1-clamp01((t-t1)/0.4):1;
    g.strokeStyle="rgba(201,119,42,.4)"; g.lineWidth=6; g.beginPath(); g.moveTo(120,600); g.lineTo(120,y); g.stroke();
    g.globalAlpha=fade; OBJ2D.packet(g,120,y,1.05,{t,text,color:COL.req}); vArrow(120,y-26,-1,COL.req); g.globalAlpha=1;
    txt("リクエスト ↑",186,530,{b:1,size:15,c:COL.req}); };
  const res=(t0,t1,text)=>{ if(t<t0||t>t1+0.4) return; const k=(t-t0)/(t1-t0), y=lerp(476,582,k), fade=t>t1?1-clamp01((t-t1)/0.4):1;
    g.strokeStyle="rgba(31,58,95,.4)"; g.lineWidth=6; g.beginPath(); g.moveTo(388,452); g.lineTo(388,y); g.stroke();
    g.globalAlpha=fade; OBJ2D.packet(g,388,y,1.05,{t,text,color:COL.res}); vArrow(388,y+26,1,COL.res); g.globalAlpha=1;
    txt("↓ レスポンス",312,530,{b:1,size:15,c:COL.res,align:"right"}); };
  req(A.go,A.arrive,"GET /"); res(A.back,A.home,"200 OK + HTML");
  req(A.go2,A.arrive2,"GET /about"); res(A.back2,A.about,"200 OK + HTML");
  req(A.go3,A.arrive3,"GET /contact"); res(A.back3,A.nf,"404 Not Found");
  const doc=(t0,t1,lines)=>{ if(t<t0||t>t1) return; const a=clamp01((t-t0)/0.4)*clamp01((t1-t)/0.4);
    g.globalAlpha=a; rr(16,458,296,140,8,"#fff",COL.res,2.5); txt("レスポンスの中身(HTML という文字)",28,478,{b:1,size:13,c:COL.res});
    lines.forEach((l,i)=>txt(l,28,506+i*24,{mono:1,size:13})); g.globalAlpha=1; };
  doc(A.back,A.home+0.4,['<h1>Hello, Flask!</h1>','<p>テンプレートから…</p>','<a href="/about">…</a>']);
  doc(A.back2,A.about+0.4,['<h1>このサイトについて</h1>','<p>Flaskの授業で…</p>','<a href="/">…</a>']);

  if(fx){ const h=fx.hold, F=VIZPLAYER.FX; F.ripple(g,h.px,h.py,fx,h.c,0.6); F.flash(g,h.px,h.py,fx,70);
    F.callout(g,240,h.pcy,h.lines,fx,h.c,{size:15,below:h.pbelow}); }
}
function render(t,fx){ return P?renderP(t,fx):renderL(t,fx); }
const EVENTS=[
  {t:0,text:"ブラウザの URL 欄に <code>127.0.0.1:5000/</code> と入力して Enter を押す。"},
  {t:A.go,text:"<b>GET /</b> のリクエストがサーバーへ送られる。URL はリクエストの <b>宛先</b>。"},
  {t:A.arrive,text:"Flask が受け取り、パス <code>/</code> に結びついた関数を探す。"},
  {t:A.call,text:"<code>@app.route(\"/\")</code> の<b>すぐ下にある関数 index() が実行される</b>。実行するためのコードは自分では書かない。"},
  {t:A.ret,text:"<code>render_template</code> が <b>templates</b> から index.html を読む。"},
  {t:A.back,text:"return した HTML が <b>レスポンス</b>。中身は HTML という <b>文字</b>。"},
  {t:A.home,text:"ブラウザが HTML を読んで <b>画面を描く</b>。"},
  {t:A.click-1.4,text:"リンク「このサイトについて」をクリックする。"},
  {t:A.go2,text:"クリックも、URL を入力するのと同じ <b>GET /about</b> のリクエスト。"},
  {t:A.arrive2,text:"パスが <code>/about</code> なので、<code>@app.route(\"/about\")</code> の<b>すぐ下の about()</b> が実行される。"},
  {t:A.ret2,text:"about() の render_template が templates から about.html を読む。"},
  {t:A.back2,text:"about.html の HTML がレスポンスとして返る。"},
  {t:A.about,text:"画面が「このサイトについて」に切り替わる。"},
  {t:A.type3,text:"今度は、どこにも書いていないパス <code>/contact</code> を入力してみる。"},
  {t:A.arrive3,text:"<code>@app.route(\"/contact\")</code> がないので、実行される関数がない。"},
  {t:A.back3,text:"Flask は <b>404 Not Found</b> を返す。ターミナルの記録も 404。"},
];
const HOLDS=[
  {px:240,py:114,pcy:452,pbelow:true,t:A.arrive+0.1,x:1000,y:196,cx:640,cy:700,below:true,c:"#F2B36B",lines:["Flask:GET / を受信","パスが / の @app.route(\"/\") の行を探す"]},
  {px:240,py:136,pcy:452,pbelow:true,t:A.call+0.3,x:1000,y:220,cx:640,cy:700,below:true,c:"#F2B36B",lines:["@app.route の直後の関数が実行される","@app.route(\"/\") のすぐ下の index() が動く"]},
  {px:160,py:298,pcy:452,pbelow:true,t:A.ret+0.3,x:930,y:456,cx:640,cy:700,below:true,c:"#F2B36B",lines:["render_template(\"index.html\")","app.py と同じフォルダの templates から探す"]},
  {px:164,py:528,pcy:610,pbelow:true,t:A.back+0.5,x:640,y:375,cx:640,cy:700,below:true,c:"#9DBBE3",lines:["レスポンスの正体は HTML の文字","画面になるのは、ブラウザが描いたあと"]},
  {px:130,py:716,pcy:604,pbelow:false,t:A.home+0.4,x:240,y:300,cx:640,cy:700,below:true,c:"#9DBBE3",lines:["ブラウザ:届いた HTML を読んで画面を描く","ターミナルには GET / … 200 の記録が残る"]},
  {px:240,py:184,pcy:452,pbelow:true,t:A.arrive2+0.1,x:1000,y:280,cx:640,cy:700,below:true,c:"#F2B36B",lines:["Flask:GET /about を受信","@app.route(\"/about\") の直後の about() が実行"]},
  {px:300,py:150,pcy:452,pbelow:true,t:A.arrive3+0.5,x:1130,y:240,cx:640,cy:700,below:true,c:"#F2928A",lines:["Flask:GET /contact を受信","合う @app.route がないので 404 Not Found を返す"]},
];
(function(){
  const R={"/":["index","index.html","Hello, Flask!"],"/about":["about","about.html","このサイトについて"]};
  const res=document.getElementById("t-res"), out=document.getElementById("t-out"), sel=document.getElementById("t-path");
  sel.onchange=()=>{ res.innerHTML=""; out.innerHTML=""; document.getElementById("t-see").disabled=true; };
  document.querySelectorAll(".t-ans").forEach(b=>b.onclick=()=>{ const p=sel.value, r=R[p], ans=r?r[0]:"404", ok=b.dataset.a===ans;
    let why;
    if(b.dataset.a==="self") why="自分で呼ぶ必要はない。リクエストが届くと、パスが同じ @app.route の行が見つかり、そのすぐ下の関数が実行される。";
    else if(r) why=`@app.route("${p}") のすぐ下にある ${r[0]}() が実行される。`;
    else why=`@app.route("${p}") はどこにもないので、実行される関数がなく <b>404 Not Found</b> が返る。`;
    res.innerHTML=(ok?'<span class="good">正解。</span>':'<span class="bad">ちがいます。</span>')+" "+why;
    out.innerHTML=r?`<span class="k">リクエスト</span><span>GET ${p}</span><span class="k">実行される関数</span><span>${r[0]}()</span><span class="k">読むファイル</span><span>templates/${r[1]}</span><span class="k">レスポンス</span><span>200 OK + HTML(画面の見出し「${r[2]}」)</span><span class="k">ターミナル</span><span>"GET ${p} HTTP/1.1" 200</span>`
      :`<span class="k">リクエスト</span><span>GET ${p}</span><span class="k">実行される関数</span><span>なし</span><span class="k">レスポンス</span><span>404 Not Found</span><span class="k">ターミナル</span><span>"GET ${p} HTTP/1.1" 404</span>`;
    const see=document.getElementById("t-see"); see.disabled=false; see.dataset.p=p; });
  document.getElementById("t-see").onclick=e=>{ const p=e.target.dataset.p, at={"/":A.go,"/about":A.go2,"/contact":A.go3}[p]; window.__viz.seekScene(at); window.__viz.play(); document.getElementById("c").scrollIntoView({behavior:"smooth",block:"center"}); };
})();
const VP=VIZPLAYER.create({duration:39,events:EVENTS,holds:HOLDS,render});
