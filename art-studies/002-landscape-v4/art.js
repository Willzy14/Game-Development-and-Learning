// V4 MOUNTAIN LANDSCAPE - FIXES:
// 1. Water reflections = BROKEN by ripples (not solid shapes)
// 2. Sun reflection = SCATTERED sparkles (not straight edges)
// 3. Snow caps = SOFT gradient + scattered patches (not hard line)
// 4. Shoreline = SOFT blend (not hard edge)

const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

function lerp(a,b,t){return a+(b-a)*t}
function seededRandom(s){const x=Math.sin(s*9999)*10000;return x-Math.floor(x)}
function lerpColor(r1,g1,b1,r2,g2,b2,t){return{r:Math.round(lerp(r1,r2,t)),g:Math.round(lerp(g1,g2,t)),b:Math.round(lerp(b1,b2,t))}}
function organicCurve(x1,y1,x2,y2,segs,v,seed){
    const pts=[{x:x1,y:y1}];
    for(let i=1;i<segs;i++){const t=i/segs,e=Math.sin(t*Math.PI);pts.push({x:lerp(x1,x2,t)+(seededRandom(seed+i*2)-0.5)*v*e,y:lerp(y1,y2,t)+(seededRandom(seed+i*2+1)-0.5)*v*e})}
    pts.push({x:x2,y:y2});return pts;
}
const HAZE={r:180,g:175,b:195};

// === SKY (from V1/V3 - works well) ===
function drawSky(){
    const g=ctx.createLinearGradient(0,0,0,H*0.55);
    g.addColorStop(0,'#0a0a1a');g.addColorStop(0.15,'#141830');g.addColorStop(0.30,'#2a3555');
    g.addColorStop(0.50,'#5a5565');g.addColorStop(0.70,'#c08050');g.addColorStop(1,'#f0c080');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H*0.55);
}

function drawStars(){
    ctx.save();
    for(let i=0;i<120;i++){
        const x=seededRandom(i*3)*W,y=seededRandom(i*3+1)*H*0.25,sz=0.5+seededRandom(i*3+2)*1.5;
        ctx.globalAlpha=0.3+seededRandom(i*3+3)*0.4*(1-y/(H*0.25));
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
}

function drawSun(){
    const sx=W*0.65,sy=H*0.40,sr=45;
    for(let i=6;i>=0;i--){const r=sr+i*25;const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,`rgba(255,230,180,${0.1-i*0.012})`);g.addColorStop(1,'rgba(255,200,100,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();}
    const sg=ctx.createRadialGradient(sx-sr*0.2,sy-sr*0.2,0,sx,sy,sr);
    sg.addColorStop(0,'#fffef0');sg.addColorStop(0.5,'#fff8d0');sg.addColorStop(0.95,'#ffc060');sg.addColorStop(1,'#ff9030');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();
}

function drawClouds(){
    for(let i=0;i<10;i++){const cx=seededRandom(i*11)*W,cy=H*0.08+seededRandom(i*11+1)*H*0.15;
        ctx.save();ctx.globalAlpha=0.2;
        for(let p=0;p<6;p++){const px=cx+(seededRandom(i*20+p)-0.5)*70,py=cy+(seededRandom(i*20+p+1)-0.5)*15,pr=12+seededRandom(i*20+p+2)*20;
            const g=ctx.createRadialGradient(px,py-pr*0.3,0,px,py,pr);g.addColorStop(0,'rgba(255,250,240,0.5)');g.addColorStop(1,'rgba(255,220,180,0)');
            ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();}
        ctx.restore();
    }
}

// === FAR MOUNTAINS (color shift for atmosphere) ===
function drawFarMountains(){
    drawMtnRange(H*0.42,70,{r:80,g:90,b:110},0.7,1000,6);
    drawMtnRange(H*0.44,100,{r:70,g:80,b:100},0.5,2000,8);
    drawMtnRange(H*0.47,140,{r:55,g:65,b:85},0.3,3000,10);
}
function drawMtnRange(baseY,maxH,col,haze,seed,peaks){
    const c=lerpColor(col.r,col.g,col.b,HAZE.r,HAZE.g,HAZE.b,haze);
    const ridge=[{x:-10,y:baseY}];
    for(let i=0;i<=peaks*4;i++){const t=i/(peaks*4),x=t*(W+20)-10,pk=Math.pow(Math.sin(t*Math.PI*peaks),2),h=maxH*pk*(0.5+seededRandom(seed+i)*0.5);
        ridge.push({x:x+(seededRandom(seed+i+100)-0.5)*20,y:baseY-h});}
    ridge.push({x:W+10,y:baseY},{x:W+10,y:H},{x:-10,y:H});
    ctx.fillStyle=`rgb(${c.r},${c.g},${c.b})`;ctx.beginPath();ctx.moveTo(ridge[0].x,ridge[0].y);
    for(let i=1;i<ridge.length;i++)ctx.lineTo(ridge[i].x,ridge[i].y);ctx.closePath();ctx.fill();
}

// === MAIN MOUNTAINS with SOFT SNOW ===
function drawMainMountains(){
    drawMtn(W*0.15,H*0.50,340,270,'left',100);
    drawMtn(W*0.50,H*0.50,420,340,'center',200);
    drawMtn(W*0.85,H*0.50,300,250,'right',300);
}

function drawMtn(peakX,baseY,w,h,pos,seed){
    const peakY=baseY-h;
    const leftR=organicCurve(peakX,peakY,peakX-w*0.55,baseY,15,20,seed);
    const rightR=organicCurve(peakX,peakY,peakX+w*0.45,baseY,15,20,seed+500);
    
    // Shadow face
    let g=ctx.createLinearGradient(peakX-w*0.55,baseY,peakX,peakY);
    g.addColorStop(0,'#4a5868');g.addColorStop(0.5,'#3a4858');g.addColorStop(1,'#3a4a5a');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(leftR[0].x,leftR[0].y);
    for(let i=1;i<leftR.length;i++)ctx.lineTo(leftR[i].x,leftR[i].y);ctx.lineTo(peakX,baseY);ctx.closePath();ctx.fill();
    drawRockTex(leftR,peakX,baseY,'shadow',seed);
    
    // Lit face
    g=ctx.createLinearGradient(peakX,peakY,peakX+w*0.45,baseY);
    g.addColorStop(0,'#9aaab8');g.addColorStop(0.5,'#8a9aa8');g.addColorStop(1,'#6a7a88');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(rightR[0].x,rightR[0].y);
    for(let i=1;i<rightR.length;i++)ctx.lineTo(rightR[i].x,rightR[i].y);ctx.lineTo(peakX,baseY);ctx.closePath();ctx.fill();
    drawRockTex(rightR,peakX,baseY,'lit',seed+1000);
    
    // === SOFT SNOW (FIX #3) - gradient + patches ===
    drawSoftSnow(leftR,rightR,peakX,peakY,w,h,seed);
}

function drawRockTex(ridge,cx,baseY,side,seed){
    const lit=side==='lit',py=ridge[0].y;ctx.save();
    // Striations
    ctx.globalAlpha=lit?0.15:0.1;
    for(let i=0;i<30;i++){const t=0.1+(i/30)*0.8,y=py+(baseY-py)*t,ri=Math.floor(t*(ridge.length-1)),rx=ridge[Math.min(ri,ridge.length-1)].x;
        const sx=lit?cx+3:rx,ex=lit?rx:cx-3;ctx.strokeStyle=seededRandom(seed+i*11)>0.5?'rgba(30,40,55,0.12)':'rgba(100,115,130,0.1)';ctx.lineWidth=1+seededRandom(seed+i*14);
        ctx.beginPath();ctx.moveTo(sx,y);for(let s=1;s<=6;s++)ctx.lineTo(lerp(sx,ex,s/6),y+(seededRandom(seed+i*20+s)-0.5)*5);ctx.stroke();}
    // Patches
    ctx.globalAlpha=lit?0.12:0.08;
    for(let i=0;i<40;i++){const ps=seed+2000+i*17,t=0.08+seededRandom(ps)*0.82,y=py+(baseY-py)*t,ri=Math.floor(t*(ridge.length-1)),rx=ridge[Math.min(ri,ridge.length-1)].x,xr=Math.abs(rx-cx);
        const x=lit?cx+seededRandom(ps+1)*xr*0.85:cx-seededRandom(ps+1)*xr*0.85,pw=5+seededRandom(ps+2)*18,ph=pw*0.3;
        ctx.fillStyle=seededRandom(ps+5)>0.5?'rgba(25,35,50,0.15)':'rgba(85,100,115,0.1)';ctx.beginPath();
        for(let a=0;a<=6;a++){const ang=(a/6)*Math.PI*2,v=0.7+seededRandom(ps+10+a)*0.5,px=x+Math.cos(ang)*pw*v,ppy=y+Math.sin(ang)*ph*v;a===0?ctx.moveTo(px,ppy):ctx.lineTo(px,ppy);}ctx.fill();}
    ctx.restore();
}

// FIX #3: SOFT SNOW - gradient edges + scattered patches
function drawSoftSnow(leftR,rightR,peakX,peakY,w,h,seed){
    const snowLine=h*0.28;ctx.save();
    
    // Main snow area with GRADIENT ALPHA (soft edge)
    const snowGrad=ctx.createLinearGradient(peakX,peakY,peakX,peakY+snowLine*1.4);
    snowGrad.addColorStop(0,'rgba(255,255,255,0.95)');
    snowGrad.addColorStop(0.5,'rgba(250,252,255,0.8)');
    snowGrad.addColorStop(0.75,'rgba(240,248,255,0.4)');
    snowGrad.addColorStop(1,'rgba(230,240,250,0)'); // Fades to transparent!
    
    // Build snow shape following ridges
    const snowPts=[];
    const leftIdx=Math.floor(leftR.length*0.32);
    for(let i=leftIdx;i>=0;i--)snowPts.push({x:leftR[i].x,y:leftR[i].y});
    const rightIdx=Math.floor(rightR.length*0.32);
    for(let i=1;i<=rightIdx;i++)snowPts.push({x:rightR[i].x,y:rightR[i].y});
    // Soft bottom edge
    const bottomPts=organicCurve(rightR[rightIdx].x,rightR[rightIdx].y+snowLine*0.5,leftR[leftIdx].x,leftR[leftIdx].y+snowLine*0.5,15,12,seed+300);
    for(const pt of bottomPts)snowPts.push(pt);
    
    ctx.fillStyle=snowGrad;ctx.beginPath();ctx.moveTo(snowPts[0].x,snowPts[0].y);
    for(let i=1;i<snowPts.length;i++)ctx.lineTo(snowPts[i].x,snowPts[i].y);ctx.closePath();ctx.fill();
    
    // SCATTERED SNOW PATCHES below main cap (key fix!)
    for(let i=0;i<25;i++){
        const ps=seed+400+i*13;
        const px=peakX+(seededRandom(ps)-0.5)*w*0.45;
        const py=peakY+snowLine*0.8+seededRandom(ps+1)*snowLine*0.8; // Below main snow
        const pSize=3+seededRandom(ps+2)*10;
        const alpha=0.2+seededRandom(ps+3)*0.4; // Variable opacity
        
        ctx.globalAlpha=alpha;
        ctx.fillStyle='#f8fcff';
        ctx.beginPath();
        // Irregular patch shape
        for(let a=0;a<=8;a++){const ang=(a/8)*Math.PI*2,v=0.6+seededRandom(ps+10+a)*0.6;
            const ppx=px+Math.cos(ang)*pSize*v,ppy=py+Math.sin(ang)*pSize*v*0.5;
            a===0?ctx.moveTo(ppx,ppy):ctx.lineTo(ppx,ppy);}
        ctx.fill();
    }
    
    // Snow sparkles
    ctx.globalAlpha=0.6;ctx.fillStyle='#fff';
    for(let i=0;i<20;i++){const sx=peakX+(seededRandom(seed+500+i)-0.5)*w*0.3,sy=peakY+seededRandom(seed+501+i)*snowLine*0.6;
        ctx.beginPath();ctx.arc(sx,sy,1+seededRandom(seed+502+i)*1.5,0,Math.PI*2);ctx.fill();}
    ctx.restore();
}

// === FOREST ===
function drawForest(){
    const layers=[[H*0.485,0.35,'#182818',0.65,35],[H*0.495,0.5,'#1c3018',0.45,28],[H*0.507,0.7,'#203820',0.25,22],[H*0.520,0.9,'#284828',0.08,18]];
    for(const[y,sc,col,hz,n]of layers){
        const c=lerpColor(parseInt(col.slice(1,3),16),parseInt(col.slice(3,5),16),parseInt(col.slice(5,7),16),HAZE.r,HAZE.g,HAZE.b,hz);
        for(let i=0;i<n;i++){const seed=y*100+i*37,x=(i/n)*W+(seededRandom(seed)-0.5)*(W/n)*0.8,th=(25+seededRandom(seed+1)*40)*sc,tw=th*0.25;
            drawTree(x,y,tw,th,`rgb(${c.r},${c.g},${c.b})`,seed);}}
}
function drawTree(x,y,w,h,col,seed){
    for(let L=0;L<5;L++){const t=L/5,ly=y-h*0.1-h*t*0.8,lw=w*(1-t*0.65),lh=h/5*1.3,sk=(seededRandom(seed+L*10)-0.5)*5;
        ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+sk,ly-lh);ctx.lineTo(x-lw,ly);ctx.lineTo(x+lw*0.85,ly);ctx.closePath();ctx.fill();}
}

// === LAKE with BROKEN REFLECTIONS (FIX #1 & #2) ===
function drawLake(){
    const lakeTop=H*0.52,lakeBot=H*0.78;
    
    // Base water
    const wg=ctx.createLinearGradient(0,lakeTop,0,lakeBot);
    wg.addColorStop(0,'#5a7898');wg.addColorStop(0.5,'#3a5878');wg.addColorStop(1,'#1a3858');
    ctx.fillStyle=wg;ctx.fillRect(0,lakeTop,W,lakeBot-lakeTop);
    
    // FIX #1: BROKEN mountain reflections (horizontal bands, not solid triangles)
    drawBrokenReflections(lakeTop,lakeBot);
    
    // FIX #2: SCATTERED sun reflection (sparkles, not solid trapezoid)
    drawScatteredSunReflection(lakeTop,lakeBot);
    
    // Water ripple texture
    drawWaterRipples(lakeTop,lakeBot);
    
    // FIX #4: SOFT shoreline
    drawSoftShoreline(lakeTop);
}

// FIX #1: Reflections broken into horizontal ripple bands
function drawBrokenReflections(lakeTop,lakeBot){
    ctx.save();
    const refH=(lakeBot-lakeTop)*0.55;
    
    // Draw reflections as HORIZONTAL BANDS that get progressively more broken
    const bandCount=35;
    for(let b=0;b<bandCount;b++){
        const t=b/bandCount;
        const y=lakeTop+t*refH;
        const bandH=refH/bandCount+1;
        const distortion=2+t*6; // More distortion further down
        const alpha=0.25*(1-t*0.6); // Fades with distance
        
        ctx.globalAlpha=alpha;
        
        // Left mountain reflection band
        const lx=W*0.15,lw=140*((1-t)*0.8+0.2);
        ctx.fillStyle='#3a4858';
        ctx.beginPath();
        const lpts=organicCurve(lx-lw,y,lx+lw,y,8,distortion,b*100);
        ctx.moveTo(lpts[0].x,lpts[0].y);
        for(const p of lpts)ctx.lineTo(p.x,p.y);
        ctx.lineTo(lx+lw,y+bandH);
        const lpts2=organicCurve(lx+lw,y+bandH,lx-lw,y+bandH,8,distortion,b*101);
        for(const p of lpts2)ctx.lineTo(p.x,p.y);
        ctx.closePath();ctx.fill();
        
        // Center mountain reflection band
        const cx=W*0.50,cw=180*((1-t)*0.85+0.15);
        ctx.fillStyle='#2a3848';
        ctx.beginPath();
        const cpts=organicCurve(cx-cw,y,cx+cw,y,10,distortion,b*200);
        ctx.moveTo(cpts[0].x,cpts[0].y);
        for(const p of cpts)ctx.lineTo(p.x,p.y);
        ctx.lineTo(cx+cw,y+bandH);
        const cpts2=organicCurve(cx+cw,y+bandH,cx-cw,y+bandH,10,distortion,b*201);
        for(const p of cpts2)ctx.lineTo(p.x,p.y);
        ctx.closePath();ctx.fill();
        
        // Right mountain reflection band
        const rx=W*0.85,rw=120*((1-t)*0.75+0.25);
        ctx.fillStyle='#3a4858';
        ctx.beginPath();
        const rpts=organicCurve(rx-rw,y,rx+rw,y,8,distortion,b*300);
        ctx.moveTo(rpts[0].x,rpts[0].y);
        for(const p of rpts)ctx.lineTo(p.x,p.y);
        ctx.lineTo(rx+rw,y+bandH);
        const rpts2=organicCurve(rx+rw,y+bandH,rx-rw,y+bandH,8,distortion,b*301);
        for(const p of rpts2)ctx.lineTo(p.x,p.y);
        ctx.closePath();ctx.fill();
    }
    ctx.restore();
}

// FIX #2: Sun reflection as scattered sparkles, not solid shape
function drawScatteredSunReflection(lakeTop,lakeBot){
    const sx=W*0.65;ctx.save();
    
    // Soft glow base (still needs some presence)
    const glowGrad=ctx.createRadialGradient(sx,lakeTop+20,0,sx,lakeTop+80,150);
    glowGrad.addColorStop(0,'rgba(255,220,150,0.2)');
    glowGrad.addColorStop(0.5,'rgba(255,200,120,0.08)');
    glowGrad.addColorStop(1,'rgba(255,180,100,0)');
    ctx.fillStyle=glowGrad;
    ctx.fillRect(sx-150,lakeTop,300,150);
    
    // SCATTERED SPARKLES (not a solid shape!)
    for(let i=0;i<120;i++){
        const seed=8000+i*7;
        const t=seededRandom(seed); // 0=near shore, 1=far
        
        // Sparkles spread wider as they go down (perspective)
        const spread=20+t*80;
        const spx=sx+(seededRandom(seed+1)-0.5)*spread;
        const spy=lakeTop+5+t*(lakeBot-lakeTop)*0.65;
        
        // Size varies - some big bright ones, many small
        const isBright=seededRandom(seed+2)>0.85;
        const size=isBright?(2+seededRandom(seed+3)*3):(0.5+seededRandom(seed+3)*1.5);
        
        // Intensity fades with distance
        const intensity=(1-t*0.7)*(isBright?1:0.5);
        
        ctx.globalAlpha=intensity*0.8;
        ctx.fillStyle=isBright?'#fffae0':'#ffd080';
        ctx.beginPath();ctx.arc(spx,spy,size,0,Math.PI*2);ctx.fill();
        
        // Bright sparkles get a glow
        if(isBright){
            ctx.globalAlpha=intensity*0.3;
            ctx.beginPath();ctx.arc(spx,spy,size*2.5,0,Math.PI*2);ctx.fill();
        }
    }
    ctx.restore();
}

function drawWaterRipples(lakeTop,lakeBot){
    ctx.save();ctx.globalAlpha=0.05;
    for(let i=0;i<40;i++){const y=lakeTop+(i/40)*(lakeBot-lakeTop),amp=1+i*0.08;
        ctx.strokeStyle=i%2===0?'rgba(100,150,200,0.3)':'rgba(50,100,150,0.2)';ctx.lineWidth=0.5;
        ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=W;x+=8)ctx.lineTo(x,y+Math.sin(x*0.015+i*0.4)*amp);ctx.stroke();}
    ctx.restore();
}

// FIX #4: SOFT shoreline - gradient blend, not hard line
function drawSoftShoreline(lakeTop){
    ctx.save();
    
    // Gradient that blends grass into water
    const blendH=25;
    const shoreGrad=ctx.createLinearGradient(0,lakeTop-blendH,0,lakeTop+blendH);
    shoreGrad.addColorStop(0,'rgba(70,95,60,0.9)');
    shoreGrad.addColorStop(0.35,'rgba(65,90,65,0.6)');
    shoreGrad.addColorStop(0.5,'rgba(60,85,75,0.3)');
    shoreGrad.addColorStop(0.7,'rgba(70,100,100,0.1)');
    shoreGrad.addColorStop(1,'rgba(80,110,120,0)');
    
    // Organic edge path
    const shorePts=organicCurve(-10,lakeTop,W+10,lakeTop,40,8,5555);
    ctx.fillStyle=shoreGrad;ctx.beginPath();ctx.moveTo(-10,lakeTop-blendH);
    for(const pt of shorePts)ctx.lineTo(pt.x,pt.y+8);
    ctx.lineTo(W+10,lakeTop+blendH);ctx.lineTo(-10,lakeTop+blendH);ctx.closePath();ctx.fill();
    
    // Scattered shore vegetation (reeds, rocks) that bridge the gap
    for(let i=0;i<35;i++){
        const seed=6000+i*23,rx=seededRandom(seed)*W,ry=lakeTop+(seededRandom(seed+1)-0.5)*18;
        
        if(seededRandom(seed+2)>0.5){
            // Reeds
            ctx.globalAlpha=0.6;ctx.strokeStyle='#2a4520';ctx.lineWidth=1.5;
            for(let r=0;r<3;r++){const rh=8+seededRandom(seed+r*3)*15,lean=(seededRandom(seed+r*3+1)-0.5)*8;
                ctx.beginPath();ctx.moveTo(rx+r*2,ry);ctx.quadraticCurveTo(rx+lean,ry-rh*0.6,rx+lean*1.2,ry-rh);ctx.stroke();}
        }else{
            // Small rocks
            const rs=2+seededRandom(seed+3)*4;ctx.globalAlpha=0.7;
            ctx.fillStyle='#505858';ctx.beginPath();
            for(let a=0;a<=6;a++){const ang=(a/6)*Math.PI*2,v=0.7+seededRandom(seed+a)*0.4;
                const px=rx+Math.cos(ang)*rs*v,py=ry+Math.sin(ang)*rs*v*0.5;a===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
            ctx.fill();
        }
    }
    ctx.restore();
}

// === FOREGROUND ===
function drawForeground(){
    const meadowTop=H*0.76;
    const gg=ctx.createLinearGradient(0,meadowTop,0,H);
    gg.addColorStop(0,'#4a6838');gg.addColorStop(0.5,'#324a24');gg.addColorStop(1,'#182a10');
    ctx.fillStyle=gg;ctx.fillRect(0,meadowTop,W,H-meadowTop);
    
    // Grass layers
    ctx.save();
    for(let layer=0;layer<3;layer++){
        const[alpha,yOff,hMult,col,count]=[[0.4,0,0.6,'#5a7848',400],[0.6,0.25,0.8,'#4a6838',350],[0.8,0.5,1,'#2a4818',300]][layer];
        ctx.globalAlpha=alpha;
        for(let i=0;i<count;i++){const seed=9000+layer*1000+i*11,x=seededRandom(seed)*W,y=meadowTop+(H-meadowTop)*(yOff+seededRandom(seed+1)*0.45),h=(8+seededRandom(seed+2)*12)*hMult;
            const lean=(seededRandom(seed+3)-0.5)*h*0.3;ctx.strokeStyle=col;ctx.lineWidth=1+seededRandom(seed+4);ctx.lineCap='round';
            ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+(seededRandom(seed+5)-0.5)*5,y-h*0.5,x+lean,y-h);ctx.stroke();}}
    ctx.restore();
    
    // Flowers
    ctx.save();
    for(let i=0;i<80;i++){const seed=11000+i*17,x=seededRandom(seed)*W,y=meadowTop+seededRandom(seed+1)*(H-meadowTop),s=2+seededRandom(seed+2)*3;
        ctx.globalAlpha=0.5+(y-meadowTop)/(H-meadowTop)*0.4;
        const col=['#cc4444','#dd6622','#ffcc00','#ffffff'][Math.floor(seededRandom(seed+3)*4)];
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*2,s,0,Math.PI*2);ctx.fill();}
    ctx.restore();
}

function drawBirds(){
    ctx.save();ctx.strokeStyle='#252525';ctx.lineWidth=1.5;ctx.lineCap='round';
    for(let g=0;g<3;g++){const gx=W*0.2+seededRandom(g*100)*W*0.6,gy=H*0.12+seededRandom(g*100+1)*H*0.12;
        ctx.globalAlpha=0.4+seededRandom(g*100+2)*0.3;
        for(let b=0;b<4;b++){const bx=gx+(b-1.5)*12,by=gy+Math.abs(b-1.5)*5,ws=4+seededRandom(g*100+b)*3;
            ctx.beginPath();ctx.moveTo(bx-ws,by+2);ctx.quadraticCurveTo(bx,by-2,bx+ws,by+2);ctx.stroke();}}
    ctx.restore();
}

function drawVignette(){
    ctx.save();const v=ctx.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H);
    v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(0.7,'rgba(0,0,0,0.08)');v.addColorStop(1,'rgba(0,0,0,0.25)');
    ctx.fillStyle=v;ctx.fillRect(0,0,W,H);ctx.restore();
}

// === RENDER ===
function render(){
    ctx.clearRect(0,0,W,H);
    drawSky();drawStars();drawSun();drawClouds();
    drawFarMountains();drawMainMountains();drawForest();
    drawLake();drawForeground();drawBirds();drawVignette();
    console.log('V4 rendered - Fixes: broken reflections, soft snow, soft shoreline');
}
render();
