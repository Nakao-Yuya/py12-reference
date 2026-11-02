/* =====================================================================
   player.js ― 映像型教材の再生部品
     再生・一時停止・シーク・速さ・次の出来事へ・ループ切り替え・ヒットストップ・検証用窓口 window.__viz

   ヒットストップ: 大事な瞬間（パケットの到着など）で「場面の時間」だけを少しの間止め、
   その間に強調表現（波紋・光・吹き出し）を見せてから自動で先へ進む。再生そのものは止まらない。

   使い方:
     VIZPLAYER.create({
       duration: 23,                 // 場面の長さ（秒）。ヒットストップの分は自動で足される
       events: EVENTS,               // [{t, title, text}] 字幕（t は場面の時刻）
       holds: HOLDS,                 // [{t, lines:[2行], ...好きな情報}] ヒットストップ（t は場面の時刻）
                                     //   dur を省くと文字数から読み終える時間を自動で決める（推奨）
       render: (s, fx) => { ... },   // s = 場面の時刻。fx = ヒットストップ中なら {hold, k(0→1), e(経過秒), dur}、そうでなければ null
       onFrame: (dt, playing, fx) => {},  // 任意（視点の自動回転など）
       onReset: () => {},            // 任意（視点を戻すなど）
       loop: false, hitstop: true,   // 初期値
     });
   ページ側の要素（data-role）: play, reset, step, seek, speed, narration, loop（checkbox）, hitstop（checkbox）,
     hold-length（select: 0.6=短め / 1=標準 / 1.5=長め）
     任意: id="time"（時刻表示）, id="log"（出来事の一覧 <ol>）
   絵は (s, fx) だけから決めること。同じ再生位置なら同じ絵になる。
   ===================================================================== */
const VIZPLAYER = (() => {
  function create(o){
    const SD=o.duration, EV=o.events;
    // ヒットストップの長さ: dur が無ければ吹き出しの文字数から「読み終えるのに必要な時間」を決める（1秒に8文字＋1秒、最短2.5秒）
    const readTime=h=>Math.max(2.5, 1.0+(h.lines||[]).join("").length/8);
    const HOLDS=(o.holds||[]).map(h=>({...h, base:h.dur??readTime(h)})).sort((a,b)=>a.t-b.t);
    let holdScale=1;
    const hd=h=>h.base*holdScale;
    const q=r=>document.querySelector(`[data-role="${r}"]`);
    const el={ play:q("play"), reset:q("reset"), step:q("step"), seek:q("seek"), speed:q("speed"), cap:q("narration"),
               loop:q("loop"), hit:q("hitstop"), hlen:q("hold-length"), time:document.getElementById("time"), log:document.getElementById("log") };
    let loop=!!o.loop, hitstop=o.hitstop!==false;
    const active=()=>hitstop?HOLDS:[];
    const total=()=>SD+active().reduce((a,h)=>a+hd(h),0);
    // 再生位置 v（秒）→ 場面の時刻 s とヒットストップの状態
    function map(v){ let off=0;
      for(const h of active()){ const hv=h.t+off;
        if(v<hv) return {s:v-off, fx:null};
        if(v<hv+hd(h)) return {s:h.t, fx:{hold:h, k:(v-hv)/hd(h), e:v-hv, dur:hd(h)}};
        off+=hd(h); }
      return {s:Math.min(SD,v-off), fx:null}; }
    const toV=s=>s+active().filter(h=>h.t<s).reduce((a,h)=>a+hd(h),0);
    let v=0, playing=!o.startPaused, speed=1, last=performance.now(), ended=false;
    if(el.loop){ el.loop.checked=loop; el.loop.onchange=()=>loop=el.loop.checked; }
    if(el.hit){ el.hit.checked=hitstop; el.hit.onchange=()=>{ const s=map(v).s; hitstop=el.hit.checked; v=toV(s); api.duration=total(); }; }
    if(el.hlen){ el.hlen.value=String(holdScale); el.hlen.onchange=()=>{ const s=map(v).s; holdScale=+el.hlen.value; v=toV(s); api.duration=total(); }; }
    if(el.log) el.log.innerHTML=EV.map(e=>`<li>${e.title||""}</li>`).join("");
    const evIndex=s=>EV.reduce((k,e,i)=>s>=e.t-1e-9?i:k,0);
    function setPlaying(p){ playing=p; if(p) ended=false; if(el.play) el.play.textContent=p?"❚❚ 一時停止":"▶ 再生"; }
    function draw(){ const {s,fx}=map(v); o.render(s,fx);
      const k=evIndex(s), D=total();
      if(el.cap) el.cap.innerHTML=(ended?`<span class="endnote">■ おわり</span>`:"")+EV[k].text;
      if(el.log) [...el.log.children].forEach((li,i)=>li.className=i===k?"on":i<k?"done":"");
      if(el.seek) el.seek.value=Math.round(v/D*1000);
      if(el.time) el.time.textContent=`${v.toFixed(1)} / ${D.toFixed(1)} 秒`;
      return fx; }
    function frame(now){
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(playing){ v+=dt*speed; const D=total();
        if(v>=D){ if(loop) v=0; else { v=D; setPlaying(false); ended=true; } } }
      const fx=draw(); if(o.onFrame) o.onFrame(dt, playing, fx);
      requestAnimationFrame(frame); }
    if(el.play) el.play.onclick=()=>{ if(playing){ setPlaying(false); return; } if(v>=total()-1e-6) v=0; setPlaying(true); };
    if(el.reset) el.reset.onclick=()=>{ v=0; ended=false; setPlaying(false); if(o.onReset) o.onReset(); draw(); };
    if(el.step) el.step.onclick=()=>{ const k=evIndex(map(v).s); v = k+1<EV.length ? toV(EV[k+1].t)+0.01 : 0; ended=false; setPlaying(false); draw(); };
    if(el.seek) el.seek.oninput=()=>{ v=el.seek.value/1000*total(); ended=false; setPlaying(false); };
    if(el.speed) el.speed.onchange=e=>speed=+e.target.value;
    // 検証・外部操作用の窓口（ページの約束）。時刻はすべて「再生位置」（ヒットストップ込み）の秒
    const api={ duration:total(), time:()=>v, sceneTime:()=>map(v).s, seekScene:x=>api.seek(toV(x)),   // 場面の時刻で飛ぶ（章ボタンなど）
      isPlaying:()=>playing,
      holds:()=>{ let off=0; return active().map(h=>{ const r={v:h.t+off, dur:hd(h), t:h.t}; off+=hd(h); return r; }); },
      seek:x=>{ v=Math.max(0,Math.min(total(),x)); ended=false; setPlaying(false); },
      play:()=>{ if(v>=total()-1e-6) v=0; setPlaying(true); }, pause:()=>setPlaying(false),
      setOptions:({loop:l, hitstop:h}={})=>{ if(l!==undefined){ loop=l; if(el.loop) el.loop.checked=l; }
        if(h!==undefined && h!==hitstop){ const s=map(v).s; hitstop=h; if(el.hit) el.hit.checked=h; v=toV(s); api.duration=total(); } } };
    window.__viz=api;
    setPlaying(playing); requestAnimationFrame(frame);
    return api;
  }
  // 強調表現の小道具（Canvas 2D）。ヒットストップ中の fx（{e:経過秒, dur:長さ, k}）を渡して使う
  const FX={
    // 出だし・終わりの出方（秒で決める。止まる長さが変わっても同じ速さで出て消える）
    appear:fx=>Math.min(1,fx.e/0.25), vanish:fx=>Math.min(1,Math.max(0,(fx.dur-fx.e)/0.35)),
    // 波紋: 最初に大きく1回、その後はゆっくり脈打つ
    ripple(g,x,y,fx,col,scale=1){ const e=fx.e;
      const ring=(kk,w)=>{ if(kk<0||kk>1) return; g.strokeStyle=col; g.globalAlpha=(1-kk)*0.9*FX.vanish(fx); g.lineWidth=w*scale; g.beginPath(); g.arc(x,y,(24+kk*130)*scale,0,7); g.stroke(); };
      for(let i=0;i<3;i++) ring((e-i*0.15)/0.9,6-i*1.5);                    // 最初の衝撃
      if(e>1.0){ const kk=((e-1.0)%1.6)/1.6; ring(kk*0.7,3); }               // その後の脈
      g.globalAlpha=1; },
    // 一瞬の白い光（最初の0.25秒）
    flash(g,x,y,fx,r=70){ const a=Math.max(0,1-fx.e/0.25); if(a<=0) return; const gr=g.createRadialGradient(x,y,0,x,y,r);
      gr.addColorStop(0,`rgba(255,255,255,${a})`); gr.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); },
    // 周りを少し暗くして、そこだけ見せる
    spotlight(g,x,y,fx,W,H,r=200,box){ const a=0.45*Math.min(FX.appear(fx),FX.vanish(fx)); if(a<=0.01) return;
      g.save(); if(box){ g.beginPath(); g.rect(box[0],box[1],box[2],box[3]); g.clip(); }
      const gr=g.createRadialGradient(x,y,r*0.55,x,y,r*1.6); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(1,`rgba(0,0,0,${a})`);
      g.fillStyle=gr; g.fillRect(0,0,W,H); g.restore(); },
    // 吹き出し（その瞬間に何が起きたか）。lines は1〜2行。下に残り時間のバー
    callout(g,x,y,lines,fx,col,opt={}){ const s=Math.min(FX.appear(fx),FX.vanish(fx)); if(s<=0.01) return; const size=opt.size||20, W=opt.W||g.canvas.width;
      g.save(); g.globalAlpha=Math.min(1,s*1.2);
      g.font=`700 ${size}px "Hiragino Sans","Noto Sans JP",sans-serif`;
      const w=Math.max(...lines.map(l=>g.measureText(l).width))+28, h=lines.length*size*1.45+26;
      let bx=Math.max(8,Math.min(W-w-8,x-w/2)), by=opt.below? y+22 : y-h-22;
      const sc=0.85+0.15*FX.appear(fx), ay=by+(opt.below?0:h); g.translate(x,ay); g.scale(sc,sc); g.translate(-x,-ay);
      g.fillStyle="rgba(12,16,30,.94)"; g.strokeStyle=col; g.lineWidth=3; g.beginPath(); g.roundRect(bx,by,w,h,10); g.fill(); g.stroke();
      g.fillStyle=col; g.beginPath(); const tx=Math.max(bx+16,Math.min(bx+w-16,x));
      if(opt.below){ g.moveTo(tx-10,by); g.lineTo(tx,by-14); g.lineTo(tx+10,by); } else { g.moveTo(tx-10,by+h); g.lineTo(tx,by+h+14); g.lineTo(tx+10,by+h); } g.fill();
      lines.forEach((l,i)=>{ g.fillStyle=i===0?col:"#eef2ff"; g.textAlign="left"; g.textBaseline="top"; g.fillText(l,bx+14,by+10+i*size*1.45); });
      const rest=Math.max(0,1-fx.e/fx.dur);                                     // 残り時間（次へ進むまで）
      g.fillStyle="rgba(255,255,255,.15)"; g.fillRect(bx+14,by+h-12,w-28,4); g.fillStyle=col; g.fillRect(bx+14,by+h-12,(w-28)*rest,4);
      g.restore(); },
  };
  return { create, FX };
})();
