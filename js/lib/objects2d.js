/* =====================================================================
   objects2d.js ― ひと目で何か分かる機器・データの部品（Canvas 2D）
   使い方:  OBJ2D.pc(g, x, y, s, opt)
     g   : CanvasRenderingContext2D
     x,y : 部品の中心（足元ではなく見た目の中心）
     s   : 大きさ（1 で幅およそ 120px）
     opt : { t: 時刻（秒・LED点滅などに使う）, active: 光らせる, color: 主色, text: 表示文字 }
   OBJ2D.SIZE[name] = [幅, 高さ]（s=1 のときの目安。配置と当たり判定に使う）
   描画は t だけから決まる（同じ t なら同じ絵）。
   ===================================================================== */
const OBJ2D = (() => {
  const C = { body:"#d5dbe6", bodyDark:"#9aa5b8", frame:"#2a3140", screen:"#5aa9ff", screenOff:"#1c2633",
              led:"#3ddc84", ledOff:"#2a4a38", warn:"#ffb547", line:"#3a4456", paper:"#f4f6fa", glow:"#ffd166" };
  const rr = (g,x,y,w,h,r) => { g.beginPath(); g.roundRect(x,y,w,h,r); };
  const fill = (g,c) => { g.fillStyle=c; g.fill(); };
  const stroke = (g,c,w=2) => { g.strokeStyle=c; g.lineWidth=w; g.stroke(); };
  const halo = (g,x,y,w,h,on) => { if(!on) return; g.save(); g.shadowColor=C.glow; g.shadowBlur=28;
    rr(g,x,y,w,h,12); stroke(g,C.glow,4); g.restore(); };
  const blink = (t,phase=0,speed=3) => Math.sin((t||0)*speed*6.283+phase) > -0.2;

  // デスクトップPC: モニター（画面）＋スタンド＋キーボード
  function pc(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    const lit = o.active ? 1 : (o.lit ?? 0.55);
    halo(g,-64,-58,128,120,o.active);
    rr(g,-58,-52,116,74,8); fill(g,C.frame);                              // ベゼル
    rr(g,-51,-45,102,60,4); fill(g, lit>0.6 ? (o.color||C.screen) : mix(C.screenOff,o.color||C.screen,lit)); // 画面
    g.globalAlpha=.35; g.fillStyle="#fff"; g.fillRect(-45,-39,40,5); g.fillRect(-45,-30,62,4); g.fillRect(-45,-22,52,4); g.globalAlpha=1; // 画面の中身
    g.fillStyle=C.bodyDark; g.fillRect(-7,22,14,14);                       // 首
    rr(g,-30,34,60,7,3); fill(g,C.bodyDark);                               // 台座
    g.beginPath(); g.moveTo(-56,48); g.lineTo(56,48); g.lineTo(62,62); g.lineTo(-62,62); g.closePath(); fill(g,C.body); // キーボード
    g.fillStyle=C.bodyDark; for(let r=0;r<2;r++) for(let k=0;k<9;k++) g.fillRect(-52+k*11.6+r*2,51+r*5,8,3);
    g.fillRect(-28,59,56,2);
    g.restore();
  }
  // ノートPC: 開いた画面＋本体（キーボード面）
  function laptop(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-66,-50,132,104,o.active);
    rr(g,-48,-46,96,64,6); fill(g,C.frame);
    rr(g,-42,-40,84,52,3); fill(g, o.active?(o.color||C.screen):mix(C.screenOff,o.color||C.screen,.55));
    g.beginPath(); g.moveTo(-50,20); g.lineTo(50,20); g.lineTo(64,44); g.lineTo(-64,44); g.closePath(); fill(g,C.body);
    g.fillStyle=C.bodyDark; for(let r=0;r<3;r++) for(let k=0;k<10;k++) g.fillRect(-46+k*9.4-r*2,24+r*5,7,3);
    rr(g,-14,38,28,4,2); fill(g,C.bodyDark);                                // タッチパッド
    g.restore();
  }
  // スマートフォン
  function phone(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-30,-56,60,112,o.active);
    rr(g,-26,-52,52,104,10); fill(g,C.frame);
    rr(g,-22,-44,44,86,5); fill(g, o.active?(o.color||C.screen):mix(C.screenOff,o.color||C.screen,.55));
    rr(g,-8,-49,16,3,2); fill(g,"#111");                                    // スピーカー
    rr(g,-10,45,20,3,2); fill(g,"#5b6577");                                 // ホームバー
    g.globalAlpha=.35; g.fillStyle="#fff"; for(let i=0;i<3;i++){ rr(g,-16+i*12,-36,9,9,2); fill(g,"#fff"); } g.globalAlpha=1;
    g.restore();
  }
  // サーバー（ラック型。段ごとにスロットと点滅LED）
  function server(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-44,-76,88,152,o.active);
    rr(g,-40,-72,80,144,6); fill(g,"#3b4558");                              // 筐体
    rr(g,-40,-72,80,8,{upperLeft:6,upperRight:6}); fill(g,"#4a566c");
    for(let i=0;i<5;i++){ const yy=-60+i*26;
      rr(g,-33,yy,66,20,3); fill(g,"#262e3c");                              // 段
      g.fillStyle="#56627a"; for(let k=0;k<4;k++) g.fillRect(-27+k*7,yy+5,4,10); // 通気口
      g.fillStyle="#4b5568"; g.fillRect(4,yy+8,14,3);                       // ドライブ差込口
      g.fillStyle = blink(o.t,i*1.7, o.active?5:1.2) ? C.led : C.ledOff; g.beginPath(); g.arc(25,yy+7,2.6,0,7); g.fill();
      g.fillStyle = blink(o.t,i*2.9+1, o.active?7:0.8) ? C.warn : "#4d3d22"; g.beginPath(); g.arc(25,yy+14,2.2,0,7); g.fill();
    }
    if(o.text){ badge(g,0,80,o.text); }
    g.restore();
  }
  // ルーター（横長の箱＋アンテナ2本＋前面LED）
  function router(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-62,-46,124,82,o.active);
    for(const [ax,ang] of [[-34,-0.18],[34,0.18]]){ g.save(); g.translate(ax,-2); g.rotate(ang);
      rr(g,-3.5,-42,7,42,3.5); fill(g,"#2f3746"); g.restore(); }           // アンテナ
    rr(g,-58,-4,116,34,9); fill(g,"#e4e8ef");                                 // 本体
    rr(g,-58,18,116,12,{lowerLeft:9,lowerRight:9}); fill(g,"#c3cad6");
    for(let k=0;k<5;k++){ const on=blink(o.t,k*1.3,o.active?6:1); if(on){ g.globalAlpha=.3; g.fillStyle=C.led; g.beginPath(); g.arc(-30+k*13,8,7,0,7); g.fill(); g.globalAlpha=1; } g.fillStyle = on ? C.led : C.ledOff; g.beginPath(); g.arc(-30+k*13,8,3.8,0,7); g.fill(); }
    if(o.wifi){ // 無線LANルーターのときだけ電波マーク
      g.strokeStyle = o.active? C.glow : "#8fa3c4"; g.lineWidth=2.5;
      for(let r=1;r<=2;r++){ g.beginPath(); g.arc(0,-8,10*r,Math.PI*1.25,Math.PI*1.75); g.stroke(); } }
    g.restore();
  }
  // データベース（円柱を3段重ね）
  function database(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-46,-62,92,124,o.active);
    const col=o.color||"#7aa7d9", dark=mix(col,"#000",.35), top=mix(col,"#fff",.25);
    const w=40, eh=12;
    for(let i=2;i>=0;i--){ const yy=-40+i*30;
      g.fillStyle=dark; g.beginPath(); g.ellipse(0,yy+26,w,eh,0,0,Math.PI); g.fill();
      g.fillStyle=col; g.fillRect(-w,yy,w*2,26);
      g.fillStyle=top; g.beginPath(); g.ellipse(0,yy,w,eh,0,0,7); g.fill();
      g.strokeStyle=dark; g.lineWidth=2; g.beginPath(); g.ellipse(0,yy,w,eh,0,0,7); g.stroke(); }
    g.restore();
  }
  // ブラウザのウィンドウ（タブ・アドレスバー・中身）
  function browser(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-74,-54,148,108,o.active);
    rr(g,-70,-50,140,100,8); fill(g,"#f2f4f8");
    rr(g,-70,-50,140,26,{upperLeft:8,upperRight:8}); fill(g,"#d7dce5");
    ["#ff5f57","#febc2e","#28c840"].forEach((c,i)=>{ g.fillStyle=c; g.beginPath(); g.arc(-60+i*10,-37,3.5,0,7); g.fill(); });
    rr(g,-24,-46,48,22,{upperLeft:5,upperRight:5}); fill(g,"#f2f4f8");        // タブ
    g.strokeStyle="#56627a"; g.lineWidth=2.2; g.lineCap="round";                // ← → ⟳
    g.beginPath(); g.moveTo(-58,-13); g.lineTo(-63,-13); g.moveTo(-63,-13); g.lineTo(-60,-16); g.moveTo(-63,-13); g.lineTo(-60,-10); g.stroke();
    g.beginPath(); g.moveTo(-50,-13); g.lineTo(-45,-13); g.moveTo(-45,-13); g.lineTo(-48,-16); g.moveTo(-45,-13); g.lineTo(-48,-10); g.stroke();
    g.beginPath(); g.arc(-35,-13,3.6,0.3,5.6); g.stroke();
    rr(g,-28,-20,92,14,7); fill(g,"#ffffff"); stroke(g,"#c6ccd8",1.5);       // アドレスバー
    g.fillStyle="#56627a"; g.font="9px sans-serif"; g.textAlign="left"; g.textBaseline="middle"; g.fillText(o.text||"https://", -22,-13);
    if(!o.empty){   // empty: まだページが表示されていない状態 g.fillStyle=o.color||"#5a8cdc"; g.fillRect(-60,0,60,8);
      g.fillStyle="#c5ccd8"; g.fillRect(-60,14,118,5); g.fillRect(-60,24,100,5); g.fillRect(-60,34,110,5); }
    else { g.fillStyle="#e2e6ed"; g.fillRect(-60,0,118,38); }
    g.restore();
  }
  // インターネット／クラウド
  function cloud(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    g.fillStyle=o.color||"#cfe0ff"; if(o.active){ g.shadowColor=C.glow; g.shadowBlur=24; }
    g.beginPath(); g.arc(-30,8,22,0,7); g.arc(-6,-10,28,0,7); g.arc(24,0,24,0,7); g.arc(40,14,16,0,7); g.fill();
    g.fillRect(-30,8,70,22); g.beginPath(); g.arc(-30,8,22,0,7); g.fill();
    rr(g,-52,10,108,20,10); g.fill();
    g.restore();
  }
  // 人（利用者）
  function user(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    const col=o.color||"#f0c27a";
    g.fillStyle=col; g.beginPath(); g.arc(0,-24,17,0,7); g.fill();           // 頭
    g.fillStyle=o.shirt||"#6c8fd6"; g.beginPath(); g.moveTo(-32,40); g.quadraticCurveTo(-32,2,0,0); g.quadraticCurveTo(32,2,32,40); g.closePath(); g.fill(); // 肩
    if(o.active){ g.strokeStyle=C.glow; g.lineWidth=4; g.beginPath(); g.arc(0,-24,22,0,7); g.stroke(); }
    g.restore();
  }
  // 封筒（パケット・リクエスト・レスポンスの「運ばれるもの」）
  function envelope(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s*1.35,s*1.35);
    const col=o.color||"#ffb547";
    rr(g,-26,-17,52,34,4); fill(g,col);
    if(!o.text){ g.fillStyle="#2a3140"; g.beginPath(); g.arc(20,-15,9,0,7); g.fill(); g.fillStyle="#fff"; g.font="bold 13px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("@",20,-15.5); }
    g.strokeStyle=mix(col,"#000",.35); g.lineWidth=2.2; g.beginPath(); g.moveTo(-24,-15); g.lineTo(0,4); g.lineTo(24,-15); g.stroke();
    g.beginPath(); g.moveTo(-24,15); g.lineTo(-7,0); g.moveTo(24,15); g.lineTo(7,0); g.stroke();
    if(o.text){ badge(g,0,-32,o.text,mix(col,"#000000",.45),16); }
    g.restore();
  }
  // パケット（通信で運ばれる単位。上の帯＝ヘッダに中身の名前、下＝データ本体）。メールには envelope を使う
  function packet(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    const col=o.color||"#ffb547", head=mix(col,"#000000",.42), txt=o.text||"DATA";
    g.font="bold 15px sans-serif"; const w=Math.max(70,g.measureText(txt).width+22+(o.lock?18:0)), h=44;
    if(o.active){ g.shadowColor=C.glow; g.shadowBlur=22; }
    rr(g,-w/2,-h/2,w,h,7); fill(g,col); g.shadowBlur=0;
    rr(g,-w/2,-h/2,w,20,{upperLeft:7,upperRight:7}); fill(g,head);                 // ヘッダ帯
    g.fillStyle="#fff"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(txt,o.lock?8:0,-h/2+10.5);
    if(o.lock) lockIcon(g,-g.measureText(txt).width/2-6,-h/2+10.5,0.9);       // 暗号化されている印（錠前）
    g.fillStyle=mix(col,"#000000",.22); for(let i=0;i<3;i++) g.fillRect(-w/2+8+i*((w-16)/3),4,(w-16)/3-5,4); // データ本体の目盛り
    g.fillRect(-w/2+8,12,(w-16)*0.6,4);
    if(o.dir){ const d=o.dir>0?1:-1, bx=d*(w/2+4); g.fillStyle=col; g.beginPath(); g.moveTo(bx,-12); g.lineTo(bx+d*16,0); g.lineTo(bx,12); g.closePath(); g.fill(); }
    g.restore();
  }
  // 文書ファイル（HTMLなど。右上が折れた紙）
  function documentFile(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    g.beginPath(); g.moveTo(-26,-34); g.lineTo(12,-34); g.lineTo(26,-20); g.lineTo(26,34); g.lineTo(-26,34); g.closePath(); fill(g,C.paper);
    g.beginPath(); g.moveTo(12,-34); g.lineTo(12,-20); g.lineTo(26,-20); g.closePath(); fill(g,"#c9d0dc");
    g.fillStyle="#b6bfcd"; for(let i=0;i<4;i++) g.fillRect(-18,-14+i*9,i%2?28:36,4);
    rr(g,-22,20,38,11,3); fill(g,o.color||"#e4633b");
    g.fillStyle="#fff"; g.font="bold 9px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(o.text||"HTML",-3,25.5);
    g.restore();
  }
  // ファイアウォール（レンガの壁）
  function firewall(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-46,-56,92,112,o.active);
    const W=84,H=104; g.fillStyle="#7a3b2e"; g.fillRect(-W/2,-H/2,W,H);
    g.fillStyle="#c8553d";
    for(let r=0;r<8;r++){ const off=r%2?-10:0; for(let k=-1;k<4;k++){ const bx=-W/2+off+k*22+1, by=-H/2+r*13+1;
      const x0=Math.max(bx,-W/2+1), x1=Math.min(bx+20,W/2-1); if(x1>x0) g.fillRect(x0,by,x1-x0,11); } }
    flame(g,W/2-12,-H/2+2,1.15);                                                    // 炎のマーク（ファイアウォールの目印）
    g.restore();
  }
  // 錠前（暗号化の印）。x,y は中心
  function lockIcon(g,x,y,k=1,col="#ffd166"){ g.save(); g.translate(x,y); g.scale(k,k);
    g.strokeStyle=col; g.lineWidth=2.4; g.beginPath(); g.arc(0,-3,4.5,Math.PI,0); g.lineTo(4.5,0); g.moveTo(-4.5,0); g.lineTo(-4.5,-3); g.stroke();
    g.fillStyle=col; g.beginPath(); g.roundRect(-6.5,-1,13,9.5,2); g.fill(); g.fillStyle="#3a2a00"; g.fillRect(-1,2,2,3.5); g.restore(); }
  function flame(g,x,y,k){ g.save(); g.translate(x,y); g.scale(k,k);
    g.fillStyle="#ff7a1a"; g.beginPath(); g.moveTo(0,-30); g.bezierCurveTo(16,-14,14,0,0,4); g.bezierCurveTo(-14,0,-14,-14,-4,-20); g.bezierCurveTo(-4,-12,2,-12,0,-30); g.fill();
    g.fillStyle="#ffd166"; g.beginPath(); g.moveTo(1,-16); g.bezierCurveTo(8,-8,7,0,0,2); g.bezierCurveTo(-7,0,-6,-8,1,-16); g.fill(); g.restore(); }
  // スイッチ（L2スイッチ／スイッチングハブ）: 横長の薄い箱に LAN ポートが2列、ポートごとの LED
  function switchHub(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-74,-26,148,52,o.active);
    rr(g,-70,-22,140,44,6); fill(g,"#2f3a4e"); rr(g,-70,-22,140,8,{upperLeft:6,upperRight:6}); fill(g,"#3d4a62");
    for(let r=0;r<2;r++) for(let k=0;k<8;k++){ const px=-52+k*13, py=-8+r*16;
      rr(g,px-5,py-4,10,9,1.5); fill(g,"#0e141f");                                   // ポート
      g.fillStyle = blink(o.t,k*0.9+r*2.1,o.active?6:1.6) ? (k%3===2?C.warn:C.led) : C.ledOff; g.fillRect(px-4,py-6.5,3,2); }
    g.fillStyle="#9aa5b8"; g.font="bold 8px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("SWITCH",51,0);
    g.restore();
  }
  // 無線LANアクセスポイント: 天井に付ける白い円盤＋電波マーク
  function accessPoint(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    g.strokeStyle="#b9c3d3"; g.lineWidth=3; g.beginPath(); g.moveTo(0,-34); g.lineTo(0,-14); g.stroke();   // 天井からの金具
    g.fillStyle="#f1f4f9"; g.beginPath(); g.ellipse(0,-6,36,12,0,0,7); g.fill();
    g.fillStyle="#d5dbe6"; g.beginPath(); g.ellipse(0,-2,36,10,0,0,Math.PI); g.fill();
    g.fillStyle = blink(o.t,0,o.active?5:1) ? "#5aa9ff" : "#2f4d6b"; g.beginPath(); g.arc(0,-6,3.5,0,7); g.fill();
    const a = o.active ? 1 : 0.75;
    for(let r=1;r<=3;r++){ const ph=((o.t||0)*1.2 + r/3)%1; g.strokeStyle=`rgba(110,170,255,${a*(1-ph*0.6)})`; g.lineWidth=3;
      g.beginPath(); g.arc(0,14,10+r*9,Math.PI*0.2,Math.PI*0.8); g.stroke(); }             // 下向きに広がる電波
    if(o.active){ g.strokeStyle=C.glow; g.lineWidth=3; g.beginPath(); g.ellipse(0,-6,42,16,0,0,7); g.stroke(); }
    g.restore();
  }

  // 鍵（公開鍵・秘密鍵）。持ち手の輪＋軸＋歯。o.color で鍵ペアの色、o.text で札（「公」「秘」など）
  function key(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-50,-24,100,48,o.active);
    const col=o.color||"#f2b632", dark=mix(col,"#000000",.35);
    // o.outline: 白抜き（輪郭だけ）＝配ってよい公開鍵の描き方。塗りつぶし＝秘密鍵
    const F = o.outline ? "rgba(255,255,255,.10)" : col, S = o.outline ? col : dark, LW = o.outline ? 3.2 : 2;
    g.beginPath(); g.arc(-26,0,17,0,7); g.arc(-26,0,7,0,7,true); fill(g,F); stroke(g,S,LW);   // 持ち手の輪（穴あき）
    rr(g,-10,-5,52,10,2); fill(g,F); stroke(g,S,LW);                                         // 軸
    g.beginPath(); g.moveTo(26,5); g.lineTo(26,15); g.lineTo(32,15); g.lineTo(32,9); g.lineTo(37,9); g.lineTo(37,15); g.lineTo(42,15); g.lineTo(42,5); g.closePath(); fill(g,F); stroke(g,S,LW); // 歯
    if(o.text){ g.fillStyle=dark; g.font="bold 13px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(o.text,-26,0.5); }
    g.restore();
  }
  // 南京錠。o.open で掛け金が外れた状態、o.color で本体の色（どの鍵ペアで閉じたか）
  function padlock(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-26,-36,52,66,o.active);
    const col=o.color||"#f2b632", dark=mix(col,"#000000",.35);
    g.save(); if(o.open){ g.translate(10,-10); }
    g.strokeStyle="#8e98a8"; g.lineWidth=6; g.lineCap="round";
    g.beginPath(); g.moveTo(-12,-2); g.lineTo(-12,-14); g.arc(0,-14,12,Math.PI,0); g.lineTo(12,o.open?-8:-2); g.stroke(); // 掛け金
    g.restore();
    rr(g,-20,-4,40,32,6); fill(g,col); stroke(g,dark,2);                                     // 本体
    g.fillStyle=dark; g.beginPath(); g.arc(0,8,4.5,0,7); g.fill(); g.fillRect(-2,10,4,10);       // 鍵穴
    g.restore();
  }

  // 印鑑の印影（デジタル署名のたとえ）。二重の丸＋文字
  function seal(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-30,-30,60,60,o.active);
    const col=o.color||"#e0503c";
    g.fillStyle="rgba(255,255,255,.92)"; g.beginPath(); g.arc(0,0,26,0,7); g.fill();
    g.strokeStyle=col; g.lineWidth=3.5; g.beginPath(); g.arc(0,0,23,0,7); g.stroke();
    g.lineWidth=1.6; g.beginPath(); g.arc(0,0,18,0,7); g.stroke();
    g.fillStyle=col; g.font="900 15px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(o.text||"署名",0,1);
    g.restore();
  }
  // 盗み見る人（攻撃者）。フードをかぶった人＋虫めがね（o.tool:"pen" で書き換える攻撃者）
  function eavesdropper(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    g.fillStyle="#2b2f3d"; g.beginPath(); g.moveTo(-34,40); g.quadraticCurveTo(-34,0,0,-2); g.quadraticCurveTo(34,0,34,40); g.closePath(); g.fill();  // 肩（黒っぽい服）
    g.fillStyle="#3a3f52"; g.beginPath(); g.arc(0,-24,24,Math.PI*0.95,Math.PI*2.05); g.lineTo(22,-4); g.lineTo(-22,-4); g.closePath(); g.fill();      // フード
    g.fillStyle="#d9b98a"; g.beginPath(); g.ellipse(0,-20,13,14,0,0,7); g.fill();                                                                     // 顔
    g.fillStyle="#1a1d27"; g.fillRect(-11,-25,22,6);                                                                                                // 目元の影（サングラス）
    if(o.tool==="pen"){                                                                                                                             // ペン（書き換える攻撃者）
      g.save(); g.translate(30,-24); g.rotate(-0.7); g.fillStyle="#ff6b6b"; g.fillRect(-4,-22,8,30); g.fillStyle="#f3d2a2";
      g.beginPath(); g.moveTo(-4,8); g.lineTo(4,8); g.lineTo(0,18); g.closePath(); g.fill(); g.fillStyle="#222"; g.beginPath(); g.moveTo(-1.5,14); g.lineTo(1.5,14); g.lineTo(0,18); g.fill(); g.restore();
    } else {
    g.strokeStyle="#c9d3e6"; g.lineWidth=4; g.beginPath(); g.arc(30,-30,11,0,7); g.stroke();                                                        // 虫めがね
    g.lineWidth=5; g.beginPath(); g.moveTo(22,-22); g.lineTo(12,-10); g.stroke();
    g.fillStyle="rgba(170,210,255,.35)"; g.beginPath(); g.arc(30,-30,9,0,7); g.fill();
    }
    if(o.active){ g.strokeStyle=C.glow; g.lineWidth=4; g.beginPath(); g.arc(0,-22,28,0,7); g.stroke(); }
    g.restore();
  }
  // 家（テレワークの自宅など）
  function house(g,x,y,s=1,o={}){
    g.save(); g.translate(x,y); g.scale(s,s);
    halo(g,-48,-50,96,92,o.active);
    g.fillStyle="#f0e2c8"; g.fillRect(-36,-6,72,44);                                       // 壁
    g.fillStyle="#c9563c"; g.beginPath(); g.moveTo(-46,-4); g.lineTo(0,-42); g.lineTo(46,-4); g.closePath(); g.fill();   // 屋根
    g.fillStyle="#8a5a3c"; g.fillRect(-8,14,16,24);                                        // ドア
    g.fillStyle=o.lit?"#ffe08a":"#7fa6d6"; g.fillRect(-28,4,14,12); g.fillRect(14,4,14,12); // 窓
    g.fillStyle="#9b4430"; g.fillRect(20,-34,8,16);                                        // 煙突
    g.restore();
  }
  function badge(g,x,y,txt,col="#2a3140",size=12){
    g.font=`bold ${size}px sans-serif`; const w=g.measureText(txt).width+12;
    rr(g,x-w/2,y-size*0.75,w,size*1.5,5); fill(g,col); g.fillStyle="#fff"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(txt,x,y+0.5);
  }
  function mix(a,b,k){ const full=h=>h.length===4?"#"+[...h.slice(1)].map(c=>c+c).join(""):h;
    a=full(a); b=full(b); const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const A=p(a),B=p(b);
    return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,"0")).join(""); }

  const SIZE = { pc:[128,120], laptop:[132,96], phone:[56,108], server:[84,148], router:[120,80], database:[84,116],
                 browser:[144,104], cloud:[116,76], user:[68,90], envelope:[74,50], packet:[80,44], documentFile:[54,70], firewall:[88,108], switchHub:[148,52], accessPoint:[84,80], house:[96,92], key:[100,40], padlock:[48,66], seal:[56,56], eavesdropper:[90,90] };
  return { pc, laptop, phone, server, router, database, browser, cloud, user, envelope, packet, documentFile, firewall, switchHub, accessPoint, house, key, padlock, seal, eavesdropper, flame, lockIcon, badge, mix, SIZE, COLORS:C };
})();
