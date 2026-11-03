(()=>{'use strict';
const cvs=document.getElementById('screen'),ctx=cvs.getContext('2d',{alpha:false});
const CW=1280,CH=720,GROUND=624,LEFT=92,RIGHT=1188; cvs.width=CW;cvs.height=CH;
const ASSET_PATH='assets/';
const assetNames=['imran_fighter','nawaz_fighter','imran_portrait','nawaz_portrait','imran_select','nawaz_select','islamabad_stage','islamabad_night_stage'];
const ART={},loaded={};let ready=0;
for(let name of assetNames){let img=new Image();img.onload=()=>{loaded[name]=true;ready++};img.onerror=()=>{loaded[name]=false;ready++};img.src=(window.AWAMI_EMBEDDED&&window.AWAMI_EMBEDDED[name])||ASSET_PATH+name+'.png';ART[name]=img;}
let mode='loading',selection=[0,1],stage=0,music=true,sfx=true,graphics='high',startedOnce=false;
const chars=[{name:'IMRAN KHAN',short:'IMRAN',title:'THE CAPTAIN',color:'#6fec98',dark:'#153e27',image:'imran_fighter',portrait:'imran_portrait',select:'imran_select',nativeDir:1,speed:305,weight:1,damage:1,hp:100},
 {name:'NAWAZ SHARIF',short:'NAWAZ',title:'THE HEAVYWEIGHT',color:'#ffdc76',dark:'#513312',image:'nawaz_fighter',portrait:'nawaz_portrait',select:'nawaz_select',nativeDir:-1,speed:258,weight:1.15,damage:1.08,hp:100}];
const PKEY=[{left:'KeyA',right:'KeyD',jump:'KeyW',guard:'KeyS',punch:'KeyF',kick:'KeyG'},{left:'ArrowLeft',right:'ArrowRight',jump:'ArrowUp',guard:'ArrowDown',punch:'KeyK',kick:'KeyL'}];
const keys=new Set(),pressed=new Set(); let players=[],round=1,timer=75,timeAcc=0,roundEnd=0,winner=-1,freeze=0,shake=0,flash=0,vsCounter=0,particles=[],popups=[],dust=[],introTimer=0,roundReason='',pauseFrom='fight';
let hitBoxes=[],pointer={x:0,y:0},frameIndex=0,cameraOffset=0;
const buttons=[];let audioCtx=null,beatTime=0,last=performance.now(),acc=0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),rnd=(a,b)=>a+Math.random()*(b-a),smooth=(x)=>{x=clamp(x,0,1);return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t;
function play(kind){if(!sfx)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();let now=audioCtx.currentTime;function osc(freq,t,dur,g,type='square',endFreq){let o=audioCtx.createOscillator(),v=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(25,endFreq),t+dur);v.gain.setValueAtTime(Math.max(.001,g),t);v.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(v);v.connect(audioCtx.destination);o.start(t);o.stop(t+dur+.002)}
if(kind==='punch')osc(155,now,.095,.070,'sawtooth',50);if(kind==='kick')osc(105,now,.16,.10,'sawtooth',35);if(kind==='block'){osc(400,now,.13,.075,'triangle',120);osc(740,now,.08,.04,'square',280)}if(kind==='hit'){osc(110,now,.15,.12,'sawtooth',39);osc(48,now,.21,.055,'triangle',25)}if(kind==='jump')osc(270,now,.09,.035,'sine',460);if(kind==='ko'){osc(280,now,.55,.11,'sawtooth',43);osc(110,now+.1,.47,.07,'triangle',27)}if(kind==='choose')osc(520,now,.075,.035,'square',680);if(kind==='start'){[0,.08,.16].forEach((d,i)=>osc(250+i*100,now+d,.16,.055,'square',480+i*150))}
}catch(e){}}
function pixelRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(t,x,y,size=24,color='#fff',align='left',outline='#10192a',weight=900){ctx.font=`${weight} ${size}px Impact,'Arial Black',sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.lineWidth=Math.max(3,size*.14);ctx.lineJoin='round';ctx.strokeStyle=outline;ctx.strokeText(t,x,y);ctx.fillStyle=color;ctx.fillText(t,x,y)}
function drawImg(name,x,y,w,h){if(loaded[name])ctx.drawImage(ART[name],Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function box(x,y,w,h,bg='#112137',border='#fff',thick=3){pixelRect(x,y,w,h,border);pixelRect(x+thick,y+thick,w-thick*2,h-thick*2,bg)}
function gradient(x,y,w,h,c1,c2){let g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);pixelRect(x,y,w,h,g)}
function button(label,x,y,w,h,callback,style='default'){let hover=pointer.x>=x&&pointer.x<=x+w&&pointer.y>=y&&pointer.y<=y+h;buttons.push({x,y,w,h,callback});box(x,y,w,h,hover?'#eae09d':style==='red'?'#8d231f':style==='green'?'#16553c':'#1c304f',hover?'#fff':style==='red'?'#ffa08c':'#ffcb5a',4);if(hover)pixelRect(x+7,y+7,w-14,3,'#ffffff9c');text(label,x+w/2,y+h/2,Math.min(24,h*.45),hover?'#17243c':'#fff','center',hover?'#f4d685':'#15192b');}
function drawBackdrop(night=false){drawImg(night?'islamabad_night_stage':'islamabad_stage',0,0,CW,CH);if(!loaded.islamabad_stage){gradient(0,0,CW,CH,'#3e85d2','#ac794c')}
 // subtle dynamic cheering silhouettes, flags and foreground line
 let t=performance.now()/1000;
 for(let i=0;i<17;i++){let x=120+i*67,y=398+Math.sin(t*2+i*2.3)*3; pixelRect(x,y,4,12,i%3?'#2b3e3d':'#354b61')}
 pixelRect(0,622,CW,3,'#e5bf8d75');}
function drawTitle(){buttons.length=0;drawBackdrop(false);gradient(0,0,CW,CH,'#03101cbb','#0510204d');
 // silhouetted pixel fighting figures over actual pixel art backdrop
 ctx.save();ctx.globalAlpha=.96;drawCharacterPose({char:0,x:260,jump:0,face:1,action:'idle',anim:0,attack:null,hitStun:0,guard:false,guardAmt:100},.80,0);drawCharacterPose({char:1,x:1050,jump:0,face:-1,action:'idle',anim:0,attack:null,hitStun:0,guard:false,guardAmt:100},.80,0);ctx.restore();
 box(248,105,786,165,'#071328e6','#ffd761',5);text('AWAMI ARENA',640,171,95,'#ffe77d','center','#522622');text('THE DESI SHOWDOWN',640,230,27,'#f8f5dc','center','#123e35');text('RETRO 2D FIGHTING CHAMPIONSHIP',640,304,24,'#fff5bc','center','#17243b');
 button('START 2 PLAYER FIGHT',432,372,420,65,()=>{play('start');mode='select'},'green');button('HOW TO PLAY',451,459,382,55,()=>{play('choose');mode='help'});button('SOUND: '+(sfx?'ON':'OFF'),524,534,232,49,()=>{sfx=!sfx;play('choose')});
 text('100% 2D • OFFLINE • 2 PLAYERS / ONE KEYBOARD',640,675,18,'#e8dfc2','center');}
function drawHelp(){buttons.length=0;drawBackdrop();pixelRect(0,0,CW,CH,'#07152ad9');box(154,68,972,595,'#10243af0','#f3bc4c',5);text('HOW TO PLAY',640,124,55,'#ffdf75','center');
 text('PLAYER 1 — IMRAN / LEFT SIDE',345,199,27,'#89eac1','center');text('PLAYER 2 — NAWAZ / RIGHT SIDE',931,199,27,'#ffde88','center');
 const acts=[['MOVE','A  /  D','←  /  →'],['JUMP','W','↑'],['HOLD BLOCK','S','↓'],['PUNCH','F','K'],['KICK','G','L'],['PAUSE / RESUME','ESC','ESC']];
 acts.forEach((a,i)=>{let y=261+i*51;pixelRect(240,y-17,800,43,i%2?'#18314b':'#132940');text(a[0],635,y,21,'#fff7d3','center');text(a[1],365,y,24,'#9ce9c9','center');text(a[2],904,y,24,'#ffdc86','center')});
 text('Jump + punch/kick = AIR ATTACK • Hold block BEFORE impact',640,597,21,'#eac17c','center');button('BACK',510,617,260,38,()=>{mode='title';play('choose')});}
function drawSelect(){buttons.length=0;drawBackdrop();pixelRect(0,0,CW,CH,'#050e27ac');box(80,31,1120,85,'#10213be7','#ffd167',4);text('CHOOSE YOUR FIGHTERS',640,76,49,'#ffe78b','center');
 const side=[{x:170,num:0,color:'#89edb3'},{x:765,num:1,color:'#ffd382'}];
 side.forEach((s)=>{let id=selection[s.num],ch=chars[id],x=s.x;box(x,144,345,360,'#07162c','#ffe097',4);pixelRect(x+6,150,333,350,s.num?'#2a2641':'#163d39');drawImg(ch.select,x+23,167,299,246);box(x+15,412,315,75,'#0c1830','#3d6185',2);text('P'+(s.num+1)+'  '+ch.name,x+172,444,28,ch.color,'center');text(ch.title,x+172,476,17,'#eee9df','center');
 text(s.num?'PLAYER 2':'PLAYER 1',x+172,130,26,s.color,'center');button('◀',x-13,295,58,63,()=>{selection[s.num]=(id+1)%2;play('choose')});button('▶',x+300,295,58,63,()=>{selection[s.num]=(id+1)%2;play('choose')});});
 text('P1: A / D TO SELECT',340,529,18,'#8ff4cc','center');text('P2: ← / → TO SELECT',938,529,18,'#ffe1a1','center');
 button('STAGE: '+(stage?'ISLAMABAD NIGHT':'ISLAMABAD DAY'),408,567,463,52,()=>{stage=(stage+1)%2;play('choose')});
 button('FIGHT!',453,639,377,56,()=>{startMatch();play('start')},'red');button('BACK',77,639,190,52,()=>{mode='title';play('choose')});
 text('2 REAL PLAYABLE FIGHTERS • MORE POLITICAL CHARACTERS COMING LATER',640,550,17,'#f9d896','center');}
function makePlayer(slot){let ci=selection[slot],ch=chars[ci];return {slot,char:ci,x:slot===0?375:905,face:slot===0?1:-1,vx:0,jump:0,vy:0,life:100,guardAmt:100,power:0,wins:0,attack:null,atkAge:0,atkConnected:false,stun:0,hitStun:0,guard:false,guardBreak:0,action:'idle',anim:rnd(0,10),combo:0,lastHit:-10,walkStep:0,lock:0,airAttacked:false,deflect:0};}
function startMatch(){players=[makePlayer(0),makePlayer(1)];round=1;winner=-1;roundEnd=0;roundReason='';resetRound();mode='vs';vsCounter=1.6;freeze=0;particles.length=0;popups.length=0;}
function resetRound(){players.forEach((p,i)=>{p.x=i===0?375:905;p.life=100;p.guardAmt=100;p.power=Math.min(100,p.power);p.jump=0;p.vy=0;p.stun=0;p.hitStun=0;p.guard=false;p.guardBreak=0;p.attack=null;p.atkAge=0;p.atkConnected=false;p.action='idle';p.airAttacked=false;p.combo=0});timer=75;timeAcc=0;introTimer=1.7;roundEnd=0;roundReason='';}
function drawVS(){buttons.length=0;drawBackdrop(!!stage);pixelRect(0,0,CW,CH,'#07132ed9');drawCharacterPose({...players[0],x:330,face:1},.8,0);drawCharacterPose({...players[1],x:960,face:-1},.8,0);text(chars[players[0].char].name,280,173,42,'#b0ffd0','center');text(chars[players[1].char].name,1000,173,42,'#ffe6a3','center');text('VS',640,334,138,'#ffe287','center','#a52925');text('ROUND '+round,640,452,43,'#fff','center');text('GET READY!',640,514,31,'#f9c36a','center');}
function startAttack(p,kind){if(p.attack||p.stun>0||p.guardBreak>0||roundEnd>0||mode!=='fight')return;if(p.guard)return;
 const airborne=p.jump>8; if(airborne&&p.airAttacked)return;
 p.attack=(airborne?'air':'')+kind;p.atkAge=0;p.atkConnected=false;p.action=kind;p.lock=kind==='kick'?.43:.31;
 if(airborne)p.airAttacked=true;play(kind==='punch'?'punch':'kick');
 for(let i=0;i<5;i++)dust.push({x:p.x+p.face*rnd(16,65),y:GROUND-p.jump-rnd(105,215),vx:p.face*rnd(45,130),vy:rnd(-30,20),life:.16,color:kind==='punch'?'#fff5aa':'#ffc372'});
}
function attackData(p){if(!p.attack)return null;let kick=p.attack.includes('kick'),air=p.attack.startsWith('air');return {duration:kick?.46:.32,start:kick?.13:.07,end:kick?.33:.23,reach:kick?156:112,damage:(kick?12:8)*(air?1.12:1)*chars[p.char].damage,push:kick?210:130,stun:kick?.28:.19,centerY:p.jump+(kick?(air?145:124):(air?187:225)),width:kick?44:35,kick,air};}
function canBlock(d,a){return d.guard&&d.guardBreak<=0&&d.stun<=0&&d.life>0&&d.face===Math.sign(a.x-d.x)}
function impact(att,def,data){let blocked=canBlock(def,att);let px=(att.x+def.x)/2,py=GROUND-clamp(data.centerY,100,310);att.atkConnected=true;
 if(blocked){def.guardAmt=Math.max(0,def.guardAmt-(data.kick?24:16));def.vx=att.face*(data.kick?70:45);def.deflect=.17;att.power=clamp(att.power+3,0,100);createSparks(px,py,15,'guard');popup(px,py-55,'BLOCK!', '#8bf7ff',.66,26);play('block');shake=3;freeze=.035;
 if(def.guardAmt<=0){def.guardBreak=1.2;def.guard=false;def.stun=.55;popup(def.x,GROUND-def.jump-245,'GUARD BREAK!', '#ff7c71',1.1,25);play('hit')}
 }else{let dmg=Math.round(data.damage);def.life=Math.max(0,def.life-dmg);def.vx=att.face*data.push;def.stun=data.stun;def.hitStun=data.stun;def.guard=false;att.power=clamp(att.power+(data.kick?11:7),0,100);def.power=clamp(def.power+3,0,100);
 if(def.jump>0)def.vy=Math.max(def.vy,65);createSparks(px,py,27,data.kick?'kick':'hit');play('hit');freeze=data.kick?.085:.06;shake=data.kick?10:6;flash=.1;
 if(performance.now()/1000-att.lastHit<1.4)att.combo++;else att.combo=1;att.lastHit=performance.now()/1000;
 if(att.combo>1)popup(att.x+att.face*65,GROUND-340,att.combo+' HITS!', '#ffdf70',.77,32);
 if(def.life<=0)endRound(att.slot,'K.O.!');
 }
}
function endRound(win,reason){if(roundEnd)return;roundEnd=2.45;roundReason=reason;winner=win;if(win>=0)players[win].wins++;play('ko');freeze=.15;shake=18;createSparks(640,235,48,'ko');}
function updateGame(dt){frameIndex++;
 shake=Math.max(0,shake-dt*32);flash=Math.max(0,flash-dt*3);freeze=Math.max(0,freeze-dt);
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
 popups.forEach(p=>{p.y-=dt*34;p.life-=dt});popups=popups.filter(p=>p.life>0);
 dust.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});dust=dust.filter(p=>p.life>0);
 if(mode==='vs'){vsCounter-=dt;if(vsCounter<=0){mode='fight';introTimer=1.5}return}
 if(mode!=='fight')return;
 if(roundEnd>0){roundEnd-=dt;players.forEach(p=>{p.anim+=dt;p.jump=Math.max(0,p.jump+p.vy*dt);p.vy-=1200*dt;if(p.jump===0)p.vy=0;});if(roundEnd<=0){if(players[0].wins===2||players[1].wins===2){mode='results'}else{round++;resetRound()}}return}
 if(introTimer>0){introTimer-=dt;players.forEach(p=>p.anim+=dt);return;}
 if(freeze>0)return;
 timeAcc+=dt;if(timeAcc>=1){timer=Math.max(0,timer-1);timeAcc-=1;if(timer===0){let w=players[0].life===players[1].life?-1:(players[0].life>players[1].life?0:1);endRound(w,'TIME UP');return}}
 players.forEach((p,i)=>{
 let control=PKEY[i],move=(keys.has(control.right)?1:0)-(keys.has(control.left)?1:0);
 p.anim+=dt; p.guardBreak=Math.max(0,p.guardBreak-dt);p.hitStun=Math.max(0,p.hitStun-dt);p.stun=Math.max(0,p.stun-dt);
 p.deflect=Math.max(0,p.deflect-dt);let canAct=p.stun<=0&&p.guardBreak<=0;
 p.guard=keys.has(control.guard)&&canAct&&!p.attack;
 if(!p.guard)p.guardAmt=Math.min(100,p.guardAmt+dt*10);
 if(canAct&&pressed.has(control.jump)&&p.jump<1&&p.vy<=0){p.vy=680;p.jump=.1;p.airAttacked=false;play('jump');for(let j=0;j<8;j++)dust.push({x:p.x+rnd(-32,32),y:GROUND+2,vx:rnd(-90,90),vy:rnd(-85,-22),life:rnd(.13,.28),color:'#f8e7a6'})}
 if(canAct&&pressed.has(control.punch))startAttack(p,'punch');else if(canAct&&pressed.has(control.kick))startAttack(p,'kick');
 if(p.attack){let a=attackData(p);p.atkAge+=dt;if(!p.atkConnected&&p.atkAge>=a.start&&p.atkAge<=a.end){let other=players[1-i],dif=other.x-p.x,dir=p.face;let xd=dif*dir;
 let oppLo=other.jump+26,oppHi=other.jump+350;
 if(xd>0&&xd<=a.reach+35&&a.centerY>=oppLo&&a.centerY<=oppHi&&!(!other.life))impact(p,other,a);
 }
 if(p.atkAge>=a.duration){p.attack=null;p.atkAge=0}
 }
 let desired=(!canAct||p.guard||p.attack)?0:move*chars[p.char].speed;
 if(p.stun>0)p.vx*=Math.max(0,1-dt*4.4);else p.vx+=(desired-p.vx)*Math.min(1,dt*(p.jump>0?8:16));
 p.x=clamp(p.x+p.vx*dt,LEFT,RIGHT);
 if(p.jump>0||p.vy!==0){p.jump+=p.vy*dt;p.vy-=1470*dt;if(p.jump<=0){p.jump=0;p.vy=0;p.airAttacked=false;for(let j=0;j<7;j++)dust.push({x:p.x+rnd(-38,38),y:GROUND+1,vx:rnd(-70,70),vy:rnd(-30,-5),life:rnd(.1,.19),color:'#d5c2a5'})}}
 p.action=p.hitStun>0?'hurt':p.guardBreak>0?'hurt':p.guard?'block':p.attack?(p.attack.includes('kick')?'kick':'punch'):p.jump>0?'jump':Math.abs(p.vx)>50?'walk':'idle';
 });
 let [a,b]=players;let dir=a.x<b.x?1:-1;a.face=dir;b.face=-dir;
 const minDist=113,delta=b.x-a.x;if(Math.abs(delta)<minDist){let overlap=minDist-Math.abs(delta),sg=Math.sign(delta)||1;a.x=clamp(a.x-sg*overlap*.5,LEFT,RIGHT);b.x=clamp(b.x+sg*overlap*.5,LEFT,RIGHT);}
}
function createSparks(x,y,num,type){const cols=type==='guard'?['#a5efff','#ffffff','#59b4fc']:type==='ko'?['#ffef67','#ffc23c','#f66e60']:['#fff','#ffeb78','#ffc149','#ff653d'];
 for(let i=0;i<num;i++){let ang=rnd(0,Math.PI*2),speed=rnd(type==='ko'?70:110,type==='ko'?340:285);particles.push({x,y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,g:rnd(40,240),life:rnd(.12,.36),max:.36,size:rnd(3,12),color:cols[i%cols.length]})}}
function popup(x,y,msg,color='#fff',life=.7,size=25){popups.push({x,y,text:msg,color,life,size})}
function drawCharacterPose(p,extraScale=1,t=0){const ch=chars[p.char],img=ART[ch.image];if(!loaded[ch.image])return;
 // Standing figures are painted 2D sprite cut-outs, NOT 3D objects.
 let natural=ch.nativeDir,flip=(p.face!==natural),w=555,h=645;
 if(ch.image==='nawaz_fighter'){w=505;h=630}
 const s=.61*extraScale,ground=GROUND-p.jump;
 ctx.save();ctx.translate(Math.round(p.x),Math.round(ground));ctx.scale(flip?-s:s,s);
 // center sprite on collision body
 const xx=-w*.5;let y=-h+13;
 let bob=p.action==='idle'?Math.sin(p.anim*3.8)*2.3:p.action==='walk'?Math.sin(p.anim*15)*3.8:0;
 if(p.action==='block'){ctx.translate(-p.face*natural*7,0);ctx.scale(.975,.98)}
 if(p.action==='punch'){let age=p.atkAge,phase=clamp(age/.25,0,1);ctx.translate((p.face===natural?1:-1)*phase*15,0);ctx.transform(1,0,-.03,1,0,0)}
 if(p.action==='kick'){ctx.translate((p.face===natural?1:-1)*14,0);ctx.rotate((p.face===natural?-.025:.025))}
 if(p.action==='hurt'){ctx.rotate((p.face===natural?.085:-.085))}
 if(p.action==='jump'){ctx.rotate(p.vy>0?.023:-.023)}
 ctx.translate(0,bob); ctx.drawImage(img,Math.round(xx),Math.round(y),w,h);
 // Low-poly overpainted articulated punches/kicks matched to sprite's native direction.
 if(p.attack){let data=attackData(p),u=p.atkAge,amount=smooth(Math.min((u-data.start)/(data.kick?.13:.105),(data.duration-u)/.1));amount=clamp(amount,0,1);
 if(amount>0){const facing=natural,armY=-h*.65,handX=facing*(w*.20+amount*96);
 if(!data.kick){ctx.save();ctx.globalAlpha=.96;ctx.strokeStyle=p.char===0?'#0d0e16':'#11172f';ctx.lineWidth=32;ctx.lineCap='square';ctx.beginPath();ctx.moveTo(facing*44,armY+33);ctx.lineTo(handX-facing*22,armY+25);ctx.stroke();ctx.strokeStyle=p.char===0?'#444050':'#4c537c';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(facing*74,armY+24);ctx.lineTo(handX-facing*31,armY+18);ctx.stroke();ctx.fillStyle=p.char===0?'#bb805c':'#bc7450';ctx.fillRect(handX-facing*4,armY+11,33*facing,29);ctx.fillStyle='#ecaa73';ctx.fillRect(handX+facing*7,armY+14,19*facing,7);ctx.restore()}
 else{const kx=facing*(w*.26+amount*145),ky=-h*.37-amount*32;ctx.save();ctx.globalAlpha=.95;ctx.strokeStyle=p.char===0?'#111019':'#efe0bd';ctx.lineWidth=51;ctx.lineCap='square';ctx.beginPath();ctx.moveTo(facing*60,-h*.28);ctx.lineTo(kx-facing*24,ky+12);ctx.stroke();ctx.strokeStyle=p.char===0?'#3d3946':'#bdb09a';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(facing*96,-h*.295);ctx.lineTo(kx-facing*29,ky+6);ctx.stroke();ctx.fillStyle='#15151e';ctx.fillRect(kx-facing*13,ky-9,facing*59,31);ctx.fillStyle='#666a76';ctx.fillRect(kx+facing*10,ky+8,facing*21,4);ctx.restore()}
 }
 }
 if(p.guard){ctx.save();ctx.globalAlpha=.80;ctx.strokeStyle='#9bf3ff';ctx.lineWidth=9;ctx.beginPath();let ax=(p.face===ch.nativeDir?1:-1)*w*.38;ctx.arc(ax,-h*.54,91,-1.35,1.35);ctx.stroke();ctx.strokeStyle='#417fcb';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ax,-h*.54,112,-1.20,1.18);ctx.stroke();ctx.restore()}
 ctx.restore();}
function drawFighters(){const seq=[...players].sort((a,b)=>a.jump===b.jump?a.x-b.x:a.jump-b.jump);
 for(const p of seq){ctx.save();ctx.globalAlpha=p.jump>0?clamp(1-p.jump/800,.25,.45):.37;ctx.fillStyle='#14121c';ctx.beginPath();ctx.ellipse(p.x,GROUND+3,85*(1-p.jump/640),13*(1-p.jump/800),0,0,Math.PI*2);ctx.fill();ctx.restore();}
 for(const p of seq){if(p.hitStun>0&&Math.floor(p.anim*20)%3===0){ctx.save();ctx.filter='brightness(1.7)';drawCharacterPose(p);ctx.restore()}else drawCharacterPose(p)}
}
function drawHUD(){gradient(0,0,CW,158,'#091326ed','#132f53a8');pixelRect(0,155,CW,4,'#f2c762');
 const P=[players[0],players[1]];
 function healthbar(p,side){let x=side?680:158, y=39, w=442;box(x,y,w,40,'#311d24','#f1e2be',4);let t=clamp(p.life/100,0,1);let fill=w-10;let amount=Math.round(fill*t);let c=p.life>55?'#ffe369':p.life>25?'#ffa44b':'#ec4646';if(side){gradient(x+5+w-10-amount,y+5,amount,29,c,'#a96426')}else gradient(x+5,y+5,amount,29,c,'#a96426');
 for(let i=0;i<12;i++){let ax=x+5+(i+1)*fill/13;pixelRect(ax,y+6,2,27,'#151b2444')}
 drawImg(chars[p.char].portrait,side?1127:33,18,115,119);
 text(chars[p.char].name,side?1068:211,115,32,chars[p.char].color,side?'right':'left');
 text('P'+(side?2:1),side?1101:180,18,22,side?'#ffd96c':'#94ffbc',side?'right':'left');
 let gx=side?948:157,gw=144;box(gx,137,gw,11,'#24384c','#7397af',2);pixelRect(gx+2,139,(gw-4)*(p.guardAmt/100),7,p.guardAmt<30?'#f36965':'#7defff');
 for(let i=0;i<p.wins;i++){ctx.beginPath();ctx.arc(side?925+i*37:348+i*37,118,11,0,Math.PI*2);ctx.fillStyle='#ffe07d';ctx.fill();ctx.strokeStyle='#31151a';ctx.lineWidth=3;ctx.stroke()}
 }
 healthbar(P[0],false);healthbar(P[1],true);
 box(569,17,142,125,'#14203b','#ffe079',5);text('TIME',640,40,25,'#f3e7ba','center');text(String(timer).padStart(2,'0'),640,93,70,timer<=10?'#ff6762':'#fff4b0','center','#661f20');
 text('AWAMI ARENA',640,163,19,'#fff0b6','center');
 // bottom power meters
 box(20,664,358,34,'#15233b','#e1c57a',3);box(902,664,358,34,'#15233b','#e1c57a',3);
 pixelRect(24,668,350*(P[0].power/100),25,'#47c8fb');pixelRect(906+350*(1-P[1].power/100),668,350*(P[1].power/100),25,'#47c8fb');
 for(let i=1;i<5;i++){pixelRect(22+i*70,667,3,28,'#f6e6c288');pixelRect(902+i*70,667,3,28,'#f6e6c288')}
 text('P1',32,650,18,'#a7dfff');text('P2',1246,650,18,'#ffd98a','right');text('POWER',640,678,23,'#f9eac2','center');
 if(P[0].guardBreak>0)text('GUARD BROKEN',320,198,26,'#f79e6f','center');if(P[1].guardBreak>0)text('GUARD BROKEN',956,198,26,'#f79e6f','center');}
function drawEffects(){for(let d of dust)pixelRect(d.x,d.y,Math.max(2,(d.life/.25)*6),Math.max(2,(d.life/.25)*4),d.color);
 for(let p of particles){ctx.globalAlpha=clamp(p.life/.25,0,1);pixelRect(p.x,p.y,p.size,p.size*.75,p.color)}ctx.globalAlpha=1;
 for(let p of popups)text(p.text,p.x,p.y,p.size,p.color,'center');
}
function drawFight(){buttons.length=0;ctx.save();if(shake>0)ctx.translate(Math.round(rnd(-shake,shake)),Math.round(rnd(-shake,shake)));drawBackdrop(!!stage);
 drawFighters();drawEffects();ctx.restore();drawHUD();
 if(flash>0){pixelRect(0,0,CW,CH,`rgba(255,255,255,${flash*.55})`)}
 if(introTimer>0){text('ROUND '+round,640,290,74,'#ffdd79','center','#652d21');if(introTimer<.8)text('FIGHT!',640,388,104,'#fff6aa','center','#a52b21')}
 if(roundEnd>0){pixelRect(0,252,CW,183,'#080d24b5');text(roundReason||'K.O.!',640,325,99,'#ffe26e','center','#a8341d');text(winner<0?'DRAW ROUND':chars[players[winner].char].name+' WINS!',640,410,42,'#f8f7e2','center')}
 text('ESC — PAUSE',1250,619,16,'#fffad7','right','#253148');}
function drawPause(){drawFight();buttons.length=0;pixelRect(0,0,CW,CH,'#071125bd');box(355,160,570,420,'#0d2037ed','#f1cb6d',5);text('PAUSED',640,220,70,'#fff2ab','center');button('RESUME',470,287,341,59,()=>{mode='fight';play('choose')},'green');button('RESTART MATCH',470,366,341,59,()=>{startMatch();play('start')});button('RETURN TO MENU',470,446,341,59,()=>{mode='title';play('choose')},'red');}
function drawResults(){buttons.length=0;drawBackdrop(!!stage);pixelRect(0,0,CW,CH,'#06112ab8');let idx=players[0].wins>players[1].wins?0:1,w=players[idx];drawCharacterPose({...w,x:640,face:1,action:'idle'},.88);box(275,58,730,165,'#152a4aea','#ffd761',5);text('CHAMPION!',640,119,75,'#ffdd63','center','#7c2d16');text(chars[w.char].name,640,185,40,chars[w.char].color,'center');text('BEST OF 3 • MATCH COMPLETE',640,256,24,'#ffffff','center');button('REMATCH',430,542,416,65,()=>{startMatch();play('start')},'green');button('SELECT FIGHTERS',457,624,362,57,()=>{mode='select';play('choose')});}
function drawLoading(){buttons.length=0;gradient(0,0,CW,CH,'#112b4b','#050b1c');text('AWAMI ARENA',640,270,86,'#ffdf7d','center');text('LOADING PIXEL ART...',640,396,32,'#fff','center');box(381,461,520,30,'#1b2845','#ffe59d',3);pixelRect(386,466,510*(ready/assetNames.length),20,'#49caa2');}
function render(){ctx.imageSmoothingEnabled=false;if(mode==='loading'){if(ready>=assetNames.length)mode='title';drawLoading()}
 else if(mode==='title')drawTitle();else if(mode==='help')drawHelp();else if(mode==='select')drawSelect();else if(mode==='vs')drawVS();else if(mode==='fight')drawFight();else if(mode==='paused')drawPause();else if(mode==='results')drawResults();}
function fixed(dt){updateGame(dt);pressed.clear()}
function loop(ts){let d=Math.min(.06,(ts-last)/1000);last=ts;acc+=d;let limit=0;while(acc>=1/60&&limit<4){fixed(1/60);acc-=1/60;limit++}render();requestAnimationFrame(loop)}
const codes=new Set(['KeyA','KeyD','KeyW','KeyS','KeyF','KeyG','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyK','KeyL','Escape','Enter','Space']);
window.addEventListener('keydown',e=>{if(codes.has(e.code))e.preventDefault();if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);
if(e.code==='Escape'&&!e.repeat){if(mode==='fight'){mode='paused';play('choose')}else if(mode==='paused'){mode='fight';play('choose')}else if(mode==='help'||mode==='select'){mode='title';play('choose')}}
if(e.code==='Enter'&&!e.repeat){if(mode==='title')mode='select';else if(mode==='select'){startMatch();play('start')}else if(mode==='results'){startMatch();play('start')}}
if(mode==='select'&&!e.repeat){let rot=(p,dir)=>{selection[p]=(selection[p]+dir+2)%2;play('choose')};if(e.code==='KeyA')rot(0,-1);if(e.code==='KeyD')rot(0,1);if(e.code==='ArrowLeft')rot(1,-1);if(e.code==='ArrowRight')rot(1,1);}
},{passive:false});
window.addEventListener('keyup',e=>{keys.delete(e.code)});window.addEventListener('blur',()=>{keys.clear();pressed.clear();if(mode==='fight')mode='paused'});
function pos(evt){let r=cvs.getBoundingClientRect();return {x:(evt.clientX-r.left)*CW/r.width,y:(evt.clientY-r.top)*CH/r.height}}
cvs.addEventListener('pointermove',e=>{pointer=pos(e)});cvs.addEventListener('pointerdown',e=>{pointer=pos(e);let targets=[...buttons].reverse();for(let b of targets){if(pointer.x>=b.x&&pointer.x<=b.x+b.w&&pointer.y>=b.y&&pointer.y<=b.y+b.h){b.callback();break;}}});
requestAnimationFrame(loop);
// Smoke tests can inspect this readonly snapshot; game logic stays deterministic on a 60Hz step.
window.AWAMI_TEST={getMode:()=>mode,getPlayers:()=>players.map(p=>({x:p.x,life:p.life,jump:p.jump,guard:p.guard,guardAmt:p.guardAmt,attack:p.attack,wins:p.wins})),getTimer:()=>timer,startMatch,choose:(a,b)=>{selection=[a,b]},setMode:(v)=>{mode=v},tick:(t=1/60)=>{fixed(t)},setPosition:(n,x)=>{players[n].x=x},getRound:()=>round};
})();
