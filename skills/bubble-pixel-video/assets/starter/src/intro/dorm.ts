// Original late-night dorm room. 640 × 360 logical pixels, no character or text.
type Ctx=CanvasRenderingContext2D;
type Pt=readonly[number,number];
const r=(c:Ctx,x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c:Ctx,pts:readonly Pt[],col:string){c.fillStyle=col;const ymin=Math.floor(Math.min(...pts.map(p=>p[1]))),ymax=Math.ceil(Math.max(...pts.map(p=>p[1])));for(let y=ymin;y<ymax;y++){const hits:number[]=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))hits.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.ceil(hits[i]);c.fillRect(x,y,Math.ceil(hits[i+1])-x,1);}}}
function oval(c:Ctx,x:number,y:number,rx:number,ry:number,col:string){c.fillStyle=col;for(let dy=-ry;dy<=ry;dy++){const f=1-dy*dy/(ry*ry);if(f<0)continue;const dx=Math.floor(Math.sqrt(f)*rx);c.fillRect(x-dx,y+dy,dx*2+1,1);}}
function line(c:Ctx,x:number,y:number,x2:number,y2:number,col:string,w=1){x=Math.round(x);y=Math.round(y);x2=Math.round(x2);y2=Math.round(y2);const dx=Math.abs(x2-x),sx=x<x2?1:-1,dy=-Math.abs(y2-y),sy=y<y2?1:-1;let e=dx+dy;for(let i=0;i<1000;i++){r(c,x,y,w,w,col);if(x===x2&&y===y2)break;const e2=e*2;if(e2>=dy){e+=dy;x+=sx;}if(e2<=dx){e+=dx;y+=sy;}}}
const hash=(x:number,y:number)=>{let z=Math.imul(x+129,374761393)^Math.imul(y+613,668265263);z=Math.imul(z^(z>>>13),1274126177);return((z^(z>>>16))>>>0)/4294967296;};
function shadow(c:Ctx,x:number,y:number,rx:number,ry:number,a=.24){c.save();c.globalAlpha=a;oval(c,x,y,rx,ry,'#253c45');c.restore();}

function room(c:Ctx){
  r(c,0,0,640,151,'#506674');r(c,0,0,640,7,'#314b59');r(c,0,7,640,2,'#6d8187');
  for(let i=0;i<500;i++){const x=Math.floor(hash(i,1)*640),y=11+Math.floor(hash(i,2)*129);r(c,x,y,1+i%4,1,i%2?'#536b78':'#4c6371');}
  r(c,0,130,640,18,'#475e66');r(c,0,130,640,1,'#6d7d7b');r(c,0,148,640,5,'#263f48');r(c,0,148,640,1,'#8d8e7c');
  r(c,0,153,640,207,'#6e7875');
  for(let row=0;row<9;row++){
    const y=153+row*26,offset=row%2?41:0;r(c,0,y,640,1,'#4f6466');r(c,0,y+1,640,1,'#83908b');
    for(let x=-offset;x<640;x+=93){r(c,x,y+2,1,24,'#51676a');r(c,x+1,y+2,1,23,'#85918a');if((row+Math.floor(x/93))%3===0)r(c,x+2,y+3,90,22,'#707c78');
      for(let k=0;k<7;k++){const xx=x+4+Math.floor(hash(k,row*7+x)*82),yy=y+4+Math.floor(hash(k+20,row+x)*17);r(c,xx,yy,2+k%2,1,k%2?'#78847c':'#687772');}
    }
  }
  // A subtle braided mat under the desk creates a small working island.
  poly(c,[[248,263],[432,263],[454,300],[234,300]],'#4c6368');poly(c,[[252,267],[428,267],[446,297],[241,297]],'#77857c');
  for(let y=270;y<297;y+=4)r(c,246,y,191,1,'#6d7e76');
}

function bunk(c:Ctx){
  shadow(c,106,202,84,12);
  // Rear panel, tall posts, and railings establish the three-quarter dollhouse view.
  r(c,30,40,151,150,'#293e49');r(c,36,45,139,136,'#465d65');
  for(const x of [32,171]){r(c,x,31,7,167,'#283f48');r(c,x+1,33,4,163,'#8d998b');r(c,x+1,33,1,162,'#b0b5a0');r(c,x+5,34,1,161,'#576e70');}
  // Top mattress and folded muted blue cover.
  poly(c,[[39,65],[165,65],[172,83],[37,83]],'#344c54');poly(c,[[41,67],[163,67],[168,80],[39,80]],'#b9c4ae');r(c,38,80,133,8,'#a5b5a5');r(c,40,80,129,2,'#d0d2b7');
  poly(c,[[45,68],[68,68],[74,78],[45,78]],'#dfd7b6');r(c,48,69,17,2,'#f0e4c0');r(c,49,77,20,1,'#a5b4a2');
  poly(c,[[81,67],[163,67],[168,79],[80,79]],'#64848a');r(c,80,79,89,7,'#597a83');r(c,83,68,77,2,'#91a5a0');
  for(let x=85;x<163;x+=13){r(c,x,70,2,8,'#76939a');r(c,x+2,80,1,5,'#7f9d9e');}
  r(c,36,86,138,6,'#3b5560');r(c,36,86,137,2,'#99a99b');
  r(c,37,51,136,4,'#8b9a8e');r(c,37,51,136,1,'#bcc0a6');r(c,38,55,135,1,'#314b56');
  for(const x of [48,78,107,137,164]){r(c,x,52,3,29,'#657f80');r(c,x,52,1,29,'#a4b3a0');}
  // Lower mattress, pillow and a rumpled earth-tone duvet.
  poly(c,[[39,136],[164,136],[173,156],[37,156]],'#2f4953');poly(c,[[41,138],[162,138],[168,153],[40,153]],'#c5c9ae');r(c,38,154,134,10,'#a0b1a0');r(c,40,154,129,2,'#ced0b4');
  poly(c,[[45,139],[68,138],[75,148],[74,152],[44,151]],'#e3d7b4');r(c,48,140,18,2,'#f0e4c4');
  poly(c,[[81,139],[104,136],[127,138],[151,137],[165,141],[170,153],[169,162],[80,162]],'#7f8374');
  poly(c,[[83,140],[105,138],[125,140],[151,139],[164,142],[168,153],[81,153]],'#a3a18a');
  line(c,105,140,113,154,'#747e70');line(c,128,141,136,154,'#bdbaa0');r(c,82,155,84,2,'#c0b99a');
  r(c,36,163,138,8,'#334e59');r(c,38,164,134,2,'#91a594');
  // Ladder is in front, with pixel highlights on its left edges.
  for(const x of [145,163]){r(c,x,77,5,121,'#2a424d');r(c,x+1,77,3,119,'#9caa97');r(c,x+1,77,1,117,'#c3c6a6');}
  for(let y=90;y<195;y+=20){r(c,148,y,16,5,'#405b63');r(c,149,y,14,2,'#b5bba0');r(c,150,y+2,12,1,'#859987');}
  // Small under-bed storage and shoes.
  r(c,47,175,38,18,'#354e54');r(c,49,177,34,14,'#9e9b7c');r(c,48,175,36,3,'#b4ae8c');r(c,61,182,10,3,'#617771');
  r(c,96,178,29,14,'#344c54');r(c,98,179,25,11,'#64818a');r(c,104,183,13,2,'#93a49b');
  oval(c,45,208,9,4,'#354f55');r(c,39,204,11,4,'#8b9c92');r(c,37,208,16,2,'#c8c6aa');
  oval(c,68,208,9,4,'#354f55');r(c,62,204,11,4,'#8b9c92');r(c,60,208,16,2,'#c8c6aa');
}

function window(c:Ctx,frame:number){
  r(c,386,27,102,83,'#2d4652');r(c,389,29,96,77,'#98a190');r(c,392,32,90,71,'#2b5265');r(c,395,35,84,64,'#25495f');
  r(c,396,63,82,35,'#31576a');
  for(const [x,y]of[[401,43],[421,53],[446,39],[470,56]])r(c,x,y,1,1,'#aabfb8');
  oval(c,460,47,7,7,'#cbd5ba');oval(c,463,45,6,6,'#25495f');
  for(let i=0;i<7;i++){const x=396+i*13,y=72+Math.floor(hash(i,41)*17);r(c,x,y,11,99-y,'#284857');r(c,x+2,y+4,2,2,'#7e9180');if(i%2)r(c,x+7,y+10,2,2,'#a99e79');}
  r(c,435,33,4,70,'#9ca795');r(c,436,34,1,67,'#c1c6a7');r(c,393,64,88,4,'#8f9f91');r(c,393,64,88,1,'#bac3a7');
  r(c,384,105,106,6,'#314b51');r(c,385,105,104,2,'#b5b69b');r(c,387,107,100,2,'#8e9e90');
  r(c,382,22,111,3,'#314b53');r(c,382,22,111,1,'#aeb099');
  poly(c,[[382,26],[397,26],[397,57],[389,96],[393,104],[382,104]],'#748b90');r(c,385,27,3,73,'#95a7a5');
  poly(c,[[479,26],[493,26],[493,104],[481,104],[485,90],[481,56]],'#657e86');r(c,488,27,3,75,'#869c9d');
  if(frame%100<40)r(c,417,49,1,1,'#d8d7b8');
}

function shelf(c:Ctx){
  shadow(c,543,178,44,9);
  r(c,502,37,79,135,'#2c454b');r(c,506,40,71,128,'#7b8170');r(c,511,44,61,120,'#344d51');
  r(c,505,40,6,129,'#a69f7e');r(c,507,41,1,125,'#c0b18b');r(c,572,41,5,127,'#8e8d70');
  for(const y of[78,118,163]){r(c,510,y,63,5,'#8c8d71');r(c,511,y,61,1,'#b9ad87');r(c,510,y+5,63,1,'#293f45');}
  const cols=['#8c8e70','#6e8b8e','#b09a76','#7e8270','#809a91'];
  for(let row=0;row<2;row++)for(let i=0;i<7;i++){const x=515+i*7,y=row?118:78,h=21+Math.floor(hash(i,row+50)*12);r(c,x,y-h,6,h,'#2b4447');r(c,x+1,y-h+1,4,h-2,cols[(i+row)%5]);r(c,x+2,y-h+4,2,1,'#c0c0a1');r(c,x+2,y-5,2,1,'#c6bca0');}
  r(c,515,136,24,26,'#4a6362');r(c,516,137,22,24,'#9f9d7d');r(c,515,135,24,3,'#b8ae8b');r(c,523,143,9,4,'#667c70');
  r(c,546,140,21,22,'#355258');r(c,547,141,19,20,'#7f9a96');r(c,552,148,9,5,'#b4bca1');
  r(c,507,168,5,9,'#354a47');r(c,570,168,5,9,'#354a47');
}

function laundry(c:Ctx){
  line(c,485,126,628,132,'#273f48');line(c,485,125,628,131,'#9aa99d');
  for(const [x,y]of[[578,129],[610,130]]){line(c,x,y,x,y+5,'#b6b99c');line(c,x,y+5,x-10,y+12,'#a8b59e');line(c,x,y+5,x+10,y+12,'#a8b59e');line(c,x-10,y+12,x+10,y+12,'#a8b59e');}
  poly(c,[[570,139],[576,137],[581,139],[586,138],[595,147],[589,153],[585,149],[584,177],[567,177],[569,148],[563,151],[560,145]],'#304b54');
  poly(c,[[571,140],[575,139],[580,141],[585,140],[592,147],[589,150],[583,146],[582,175],[569,175],[571,146],[564,148],[563,145]],'#a09e8b');
  r(c,574,143,1,29,'#b9b49a');r(c,579,149,2,22,'#7e8b80');r(c,570,173,12,2,'#718176');
  poly(c,[[601,141],[619,141],[622,178],[613,178],[609,156],[606,178],[597,178]],'#2c4550');
  poly(c,[[602,143],[617,143],[619,175],[614,175],[609,152],[604,175],[599,175]],'#5c7c8b');r(c,603,143,13,2,'#87a0a4');line(c,611,146,616,173,'#78949b');
}

function papers(c:Ctx){
  // Pinboard and revision timetable made of marks only, with no baked-in text.
  r(c,207,29,102,63,'#2a424a');r(c,209,31,98,59,'#928c71');r(c,212,34,92,53,'#777b66');
  r(c,219,39,31,38,'#ddd6b3');r(c,254,42,42,32,'#bdc7ac');r(c,226,37,3,3,'#bf8e6b');r(c,271,40,3,3,'#91a987');
  r(c,224,45,19,3,'#6f8d8d');for(let y=52;y<71;y+=5){r(c,224,y,20,1,'#9da78f');r(c,224,y+1,14,1,'#b2b498');}
  for(let y=50;y<71;y+=6)for(let x=260;x<291;x+=8)r(c,x,y,5,3,(x+y)%3?'#98aa98':'#7f9a92');
  // Clock to the left of the protagonist's thought area.
  oval(c,229,112,14,14,'#2b454b');oval(c,229,111,12,12,'#b8bca0');oval(c,229,111,10,10,'#ddd5b2');
  for(const [dx,dy]of[[0,-8],[8,0],[0,8],[-8,0]])r(c,229+dx,111+dy,1,2,'#74857d');line(c,229,111,223,107,'#3b5a60',2);line(c,229,111,233,104,'#3b5a60');
}

function suitcase(c:Ctx){
  shadow(c,214,251,25,8);r(c,198,208,29,41,'#2b424b');r(c,201,208,23,3,'#a0aaa0');r(c,201,212,24,34,'#69828a');r(c,202,213,3,31,'#93a6a2');r(c,224,213,2,30,'#455f6b');
  for(let x=207;x<223;x+=5)r(c,x,216,1,24,'#526e78');r(c,205,201,15,3,'#263d45');r(c,205,204,3,6,'#263d45');r(c,217,204,3,6,'#263d45');r(c,207,202,11,1,'#99a89b');r(c,201,248,5,4,'#283f45');r(c,219,248,5,4,'#283f45');
}

function bag(c:Ctx){
  shadow(c,465,266,20,7);r(c,454,225,21,7,'#354a48');r(c,457,226,15,4,'#849180');
  poly(c,[[451,230],[474,230],[482,241],[482,263],[448,263],[447,241]],'#2c4349');poly(c,[[452,232],[473,232],[479,242],[479,260],[450,260],[450,240]],'#8d8b6d');
  r(c,453,235,2,19,'#aaa27c');r(c,474,240,3,18,'#657569');r(c,455,247,19,12,'#4e6868');r(c,457,249,15,8,'#72877b');r(c,456,248,17,1,'#a3ad8d');r(c,464,249,1,3,'#d3bf8f');
  line(c,449,234,444,254,'#344f50',3);line(c,478,234,486,254,'#344f50',3);
}

function desk(c:Ctx,frame:number){
  shadow(c,352,281,85,14);
  r(c,280,235,7,46,'#2c4348');r(c,281,236,4,43,'#8b8b70');r(c,282,237,1,40,'#b5aa83');r(c,404,235,7,46,'#2c4348');r(c,405,236,4,43,'#8b8b70');
  r(c,374,240,30,27,'#3c514c');r(c,376,242,27,23,'#9e9371');r(c,377,243,24,1,'#bbb088');r(c,385,252,10,2,'#c9bb8e');
  poly(c,[[272,215],[409,215],[418,232],[270,232]],'#2c4449');poly(c,[[274,217],[408,217],[414,229],[273,229]],'#b1a17c');
  r(c,271,231,145,11,'#6e755e');r(c,273,232,141,3,'#c1ad80');r(c,274,235,140,1,'#948d6b');
  // Chair has no person. Protagonist head will land at (320,204), feet at (320,246).
  r(c,301,243,4,39,'#30494b');r(c,336,243,4,39,'#30494b');r(c,303,247,2,32,'#9b9c7d');r(c,336,247,2,32,'#8c9176');
  poly(c,[[301,240],[335,240],[341,252],[299,252]],'#2b4448');poly(c,[[303,242],[334,242],[338,249],[302,249]],'#7c9487');r(c,302,249,36,3,'#4d6c65');
  r(c,302,223,4,19,'#314a4d');r(c,334,223,4,19,'#314a4d');r(c,302,224,36,8,'#4c6d69');r(c,305,225,30,4,'#8c9f8a');
  // Laptop at the specified (365,203), with only abstract document lines.
  r(c,345,184,43,28,'#263e48');r(c,347,185,39,24,'#607f87');r(c,349,187,35,20,'#a5c2b8');r(c,351,189,8,16,'#829f9c');r(c,361,189,20,16,'#ced6b7');
  r(c,363,191,14,2,'#7c9e9d');for(let y=196;y<204;y+=3)r(c,363,y,12+y%4,1,'#a2b5a1');r(c,356,185,19,1,'#a8b5a3');
  poly(c,[[344,212],[389,212],[396,223],[338,223]],'#2b444b');poly(c,[[345,213],[388,213],[392,220],[342,220]],'#7f9794');
  for(let y=214;y<219;y+=2)for(let x=346;x<387;x+=4)r(c,x+(y-214),y,2,1,'#4c6e74');r(c,360,219,14,2,'#a5b3a2');
  // Piled exam books, layered loose sheets and a pencil under the hand.
  r(c,277,207,32,7,'#354a48');r(c,279,208,28,4,'#c8c5a6');r(c,277,207,32,2,'#6e8f86');r(c,279,213,28,1,'#9eac91');
  r(c,281,201,29,6,'#a79570');r(c,282,202,26,3,'#d7ceb0');r(c,281,201,29,1,'#beab7e');r(c,281,206,29,1,'#937f5d');
  r(c,279,197,27,4,'#577a7c');r(c,280,198,25,2,'#aebaaa');r(c,281,197,23,1,'#9bb2a2');
  poly(c,[[294,219],[321,217],[329,228],[300,230]],'#c9c7a6');poly(c,[[291,218],[316,217],[323,226],[296,227]],'#dfd3af');
  for(let i=0;i<3;i++)r(c,298+i,220+i*2,15,1,'#9bab94');line(c,322,220,332,227,'#b89e6a',2);r(c,331,227,2,1,'#3b5657');
  // Adjustable desk lamp. Its cone lands on the paper and laptop, not the bubbles.
  c.save();c.globalAlpha=.07+Math.sin(frame/45)*.003;poly(c,[[402,190],[416,190],[421,224],[335,224]],'#f5d68d');c.restore();
  oval(c,406,220,10,3,'#38504d');oval(c,406,219,8,2,'#a9a17a');line(c,406,216,411,202,'#abc0a4',2);line(c,411,202,403,190,'#a0b59c',2);
  poly(c,[[399,183],[411,181],[418,192],[396,196]],'#304b4b');poly(c,[[400,184],[410,183],[415,191],[398,194]],'#829c8c');line(c,399,194,415,191,'#dace9d',2);r(c,402,185,5,2,'#a8b79b');
  // Mug behind the lamp, safely outside the protagonist silhouette.
  r(c,421,210,10,11,'#365353');r(c,422,209,8,11,'#a4b7a5');r(c,423,210,6,2,'#677f75');r(c,430,212,4,6,'#7e9b8b');r(c,431,213,2,3,'#4a6668');
}

function plant(c:Ctx){
  shadow(c,589,252,17,6);poly(c,[[578,232],[599,232],[596,251],[581,251]],'#354b4d');poly(c,[[580,234],[597,234],[594,249],[583,249]],'#a18d6b');r(c,577,230,23,5,'#b0a079');r(c,582,235,2,11,'#c1ac80');
  line(c,588,231,590,198,'#426c5d',2);line(c,589,220,577,207,'#527967');line(c,590,213,603,203,'#527967');
  for(const [x,y,dir]of[[590,200,1],[588,209,-1],[590,219,1],[578,207,-1],[601,205,1]]){poly(c,[[x,y],[x+dir*12,y-9],[x+dir*15,y-8],[x+dir*11,y],[x+dir*3,y+2]],'#3d6c5b');poly(c,[[x,y],[x+dir*11,y-7],[x+dir*12,y-6],[x+dir*3,y+1]],'#799978');}
}

export function drawDorm(ctx:CanvasRenderingContext2D,frame:number):void{
  ctx.save();ctx.imageSmoothingEnabled=false;
  room(ctx);window(ctx,frame);papers(ctx);bunk(ctx);shelf(ctx);laundry(ctx);
  // A sparse vertical pool of window light balances the warmer desk.
  ctx.save();ctx.globalAlpha=.055;poly(ctx,[[394,112],[481,112],[529,253],[423,253]],'#9ec4c1');ctx.restore();
  suitcase(ctx);bag(ctx);plant(ctx);desk(ctx,frame);
  // Small wastebasket and folded floor blanket support the lived-in dorm story.
  shadow(ctx,254,267,12,5);poly(ctx,[[244,246],[264,246],[261,268],[248,268]],'#344e52');poly(ctx,[[246,248],[262,248],[259,265],[250,265]],'#73928c');
  for(let x=249;x<261;x+=3)line(ctx,x,250,x,263,'#9eafa0');r(ctx,244,245,21,3,'#a8b3a0');r(ctx,248,242,7,4,'#d3cfb0');r(ctx,253,241,6,4,'#b8c6ab');
  r(ctx,80,246,60,18,'#344e52');r(ctx,82,247,56,15,'#6c8582');r(ctx,84,248,52,2,'#a0ab94');for(let x=85;x<137;x+=9)r(ctx,x,251,2,10,'#82998b');
  ctx.restore();
}
