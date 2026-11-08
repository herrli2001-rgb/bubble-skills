// Original pixel-art bedroom, 640 × 360. Character is composited by the story layer.
type Ctx = CanvasRenderingContext2D;
type Pt = readonly [number, number];
const P = {
  ink:'#283f42', wall:'#536b6b', wallHi:'#5c7471', wallLow:'#485f60',
  wood:'#8c7357', woodHi:'#b39265', woodLight:'#c5aa79', woodDark:'#5d5144',
  floor:'#8d785d', floorHi:'#998363', floorLow:'#796954',
  linen:'#d3c8a4', linenHi:'#e4d7b1', teal:'#557f80', tealHi:'#739b98', tealLow:'#416667',
};
const r=(c:Ctx,x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c:Ctx,pts:readonly Pt[],col:string){
  c.fillStyle=col;
  const ymin=Math.floor(Math.min(...pts.map(p=>p[1]))),ymax=Math.ceil(Math.max(...pts.map(p=>p[1])));
  for(let y=ymin;y<ymax;y++){
    const hits:number[]=[];
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))hits.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
    hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.ceil(hits[i]);c.fillRect(x,y,Math.ceil(hits[i+1])-x,1);}
  }
}
function oval(c:Ctx,x:number,y:number,rx:number,ry:number,col:string){c.fillStyle=col;for(let dy=-ry;dy<=ry;dy++){const f=1-dy*dy/(ry*ry);if(f<0)continue;const dx=Math.floor(Math.sqrt(f)*rx);c.fillRect(x-dx,y+dy,dx*2+1,1);}}
function line(c:Ctx,x:number,y:number,x2:number,y2:number,col:string,w=1){x=Math.round(x);y=Math.round(y);x2=Math.round(x2);y2=Math.round(y2);const dx=Math.abs(x2-x),sx=x<x2?1:-1,dy=-Math.abs(y2-y),sy=y<y2?1:-1;let e=dx+dy;for(let i=0;i<1000;i++){r(c,x,y,w,w,col);if(x===x2&&y===y2)break;const e2=2*e;if(e2>=dy){e+=dy;x+=sx;}if(e2<=dx){e+=dx;y+=sy;}}}
const hash=(x:number,y:number)=>{let z=Math.imul(x+351,374761393)^Math.imul(y+413,668265263);z=Math.imul(z^(z>>>13),1274126177);return((z^(z>>>16))>>>0)/4294967296;};
function shade(c:Ctx,x:number,y:number,rx:number,ry:number,a=.22){c.save();c.globalAlpha=a;oval(c,x,y,rx,ry,'#203d3f');c.restore();}

function room(c:Ctx){
  r(c,0,0,640,145,P.wall);
  r(c,0,0,640,7,'#354e51');r(c,0,7,640,2,'#6c7b72');
  for(let i=0;i<380;i++){const x=Math.floor(hash(i,1)*640),y=10+Math.floor(hash(i,2)*122);r(c,x,y,1+i%3,1,i%2?'#597170':'#4e6667');}
  r(c,0,116,640,24,'#566760');r(c,0,115,640,2,'#7c806b');
  for(let x=0;x<640;x+=40){r(c,x,118,1,23,'#485b57');r(c,x+2,120,1,19,'#627066');}
  r(c,0,139,640,8,'#3f504b');r(c,0,140,640,2,'#9d8b69');r(c,0,145,640,2,'#293e3e');
  r(c,0,147,640,213,P.floor);
  for(let row=0;row<12;row++){
    const y=147+row*20,offset=row%2?69:0;
    r(c,0,y,640,1,'#665d4d');r(c,0,y+1,640,1,'#a38d6c');
    for(let x=-offset;x<640;x+=136){r(c,x,y+2,135,17,row%3===1?'#917b5d':'#8c775a');r(c,x,y+2,1,17,'#6b604f');r(c,x+2,y+2,1,17,'#a38c68');
      for(let k=0;k<7;k++){const xx=x+8+Math.floor(hash(k,x+row)*109),yy=y+5+Math.floor(hash(k+29,row+x)*10);r(c,xx,yy,5+Math.floor(hash(k,row+8)*19),1,k%2?'#847054':'#998160');}
      r(c,x+6,y+5,1,1,'#6e614d');r(c,x+129,y+14,1,1,'#6e614d');
    }
  }
  // An unbusy rug anchors the bed without competing with the text below.
  poly(c,[[218,248],[454,248],[471,295],[201,295]],'#536b69');
  poly(c,[[222,251],[450,251],[464,291],[208,291]],'#81918a');
  poly(c,[[227,254],[445,254],[456,286],[216,286]],'#697e78');
  for(let y=258;y<286;y+=5)r(c,221,y,230,1,'#72867d');
  for(let x=210;x<466;x+=5){r(c,x,295,1,3,'#9da691');r(c,x+1,295,1,2,'#6c8076');}
}

function book(c:Ctx,x:number,y:number,h:number,w:number,col:string,lean=0){
  if(lean){poly(c,[[x,y-h],[x+w,y-h-1],[x+w+lean,y],[x+lean,y]],'#343f3b');poly(c,[[x+1,y-h+1],[x+w-1,y-h],[x+w+lean-1,y-1],[x+lean+1,y-1]],col);line(c,x+1,y-h+5,x+w,y-h+5,'#c9ba8d');return;}
  r(c,x,y-h,w,h,'#36413e');r(c,x+1,y-h+1,w-2,h-2,col);r(c,x+2,y-h+3,Math.max(1,w-4),1,'#d0be8b');r(c,x+2,y-5,Math.max(1,w-4),1,'#b2ad87');
}
function bookshelf(c:Ctx){
  shade(c,119,162,78,9);
  r(c,43,27,150,133,'#2f4240');r(c,47,30,142,127,'#675b48');
  r(c,51,34,134,119,'#394a44');
  r(c,43,26,150,6,'#9c8059');r(c,45,26,146,1,'#c3a671');
  r(c,46,31,6,126,'#9e825a');r(c,47,31,2,124,'#b79b6b');r(c,184,31,6,126,'#826c4d');
  for(const y of [70,111,151]){r(c,50,y,135,5,'#9f8057');r(c,51,y,133,1,'#bfa274');r(c,51,y+4,133,2,'#263e3a');}
  const cols=['#627f78','#a39366','#8d6f5b','#607984','#7c8771','#b29a72'];
  for(let i=0;i<13;i++){const x=56+i*7;book(c,x,69,19+Math.floor(hash(i,11)*12),6,cols[i%cols.length]);}
  book(c,156,69,24,7,'#8e7a5a',4);book(c,164,69,27,6,'#5e7f7c',6);
  for(let i=0;i<8;i++)book(c,58+i*8,110,23+Math.floor(hash(i,17)*10),7,cols[(i+3)%6]);
  // Horizontal journals, a little keepsake, and a linen storage box.
  r(c,133,99,24,8,'#34453e');r(c,134,100,22,5,'#cbbd8e');r(c,133,106,24,3,'#8d7553');
  r(c,135,94,21,5,'#647e79');r(c,136,95,19,2,'#b2b193');
  r(c,166,94,8,15,'#c1ad7c');r(c,165,97,10,9,'#bba16f');r(c,168,91,4,5,'#d0bd8b');r(c,169,90,2,2,'#839079');
  r(c,57,124,35,26,'#34463f');r(c,58,125,33,24,'#9a9c7d');r(c,57,123,35,4,'#b4b291');r(c,68,133,11,5,'#666f5c');r(c,70,134,7,2,'#c3c2a1');
  for(let i=0;i<7;i++)book(c,103+i*8,150,18+Math.floor(hash(i,22)*14),7,cols[i%6]);
  r(c,51,156,5,9,'#574d3c');r(c,179,156,6,9,'#574d3c');
}

function window(c:Ctx,frame:number){
  r(c,451,30,129,89,'#283f43');r(c,454,32,123,83,'#a69a76');r(c,457,35,117,77,'#35545c');
  r(c,461,38,109,70,'#234a5a');r(c,463,40,105,33,'#274b5d');r(c,463,73,105,33,'#315b67');
  // Night sky in broad color steps, with a crisp crescent.
  oval(c,543,54,9,9,'#dad6b4');oval(c,547,51,8,8,'#274b5d');r(c,538,48,2,1,'#efdfb6');
  for(const [x,y] of [[477,47],[508,45],[528,67],[558,79],[488,67],[518,83]])r(c,x,y,1,1,'#9fbab5');
  if(Math.floor(frame/25)%2===0){r(c,498,55,3,1,'#c5d3bd');r(c,499,54,1,3,'#c5d3bd');}
  poly(c,[[463,94],[474,88],[484,92],[494,82],[507,87],[516,83],[528,92],[542,89],[554,94],[568,90],[568,108],[463,108]],'#2b4f53');
  poly(c,[[463,101],[478,98],[489,101],[504,96],[516,99],[531,96],[548,100],[561,98],[568,101],[568,108],[463,108]],'#25464a');
  r(c,513,36,5,75,'#b5a57b');r(c,514,37,1,72,'#d1bb88');r(c,459,72,113,4,'#a59871');r(c,460,72,111,1,'#c7b481');
  r(c,448,113,135,7,'#576559');r(c,449,113,133,3,'#b8a57a');r(c,451,114,129,1,'#d6c18c');
  // Curtains hang in stepped folds, keeping the moon visible.
  r(c,444,25,140,3,'#3d504b');r(c,444,25,140,1,'#a29b7c');
  poly(c,[[444,29],[463,29],[462,57],[456,94],[460,111],[445,111]],'#6e8580');
  poly(c,[[447,29],[453,29],[452,71],[449,101],[452,111],[447,111]],'#91a096');
  line(c,457,32,454,92,'#526d6b',2);r(c,445,93,13,4,'#ba9d6c');
  poly(c,[[568,29],[584,29],[584,111],[570,111],[574,91],[569,59]],'#5a7471');
  poly(c,[[578,29],[582,29],[582,111],[578,111],[577,85]],'#80978d');r(c,572,92,12,4,'#ae9468');
}

function clock(c:Ctx){
  shade(c,228,57,16,17,.12);oval(c,225,53,16,17,'#2c4543');oval(c,225,52,14,15,'#b4a079');oval(c,225,52,12,13,'#d3c7a2');
  for(const [dx,dy] of [[0,-10],[9,0],[0,10],[-9,0]])r(c,225+dx,52+dy,1,2,'#65726a');
  line(c,225,52,219,48,'#3f5552',2);line(c,225,52,230,44,'#3f5552');r(c,224,51,3,3,'#6b715b');
}

function plant(c:Ctx,x:number,y:number,big=false){
  const s=big?2:1;
  shade(c,x,y+2,10*s,4*s);
  poly(c,[[x-8*s,y-15*s],[x+8*s,y-15*s],[x+6*s,y],[x-6*s,y]],'#3c5144');
  poly(c,[[x-7*s,y-14*s],[x+7*s,y-14*s],[x+5*s,y-1],[x-5*s,y-1]],'#a4875d');
  r(c,x-8*s,y-16*s,16*s,3*s,'#c2a577');r(c,x-5*s,y-12*s,2*s,10*s,'#b69869');
  line(c,x,y-16*s,x-1*s,y-40*s,'#3b614e',s);
  for(const [dx,dy,sgn] of [[-1,-38,-1],[0,-32,1],[-1,-25,-1],[0,-19,1]]){
    poly(c,[[x+dx*s,y+dy*s],[x+(dx+sgn*12)*s,y+(dy-7)*s],[x+(dx+sgn*11)*s,y+(dy-1)*s],[x+(dx+sgn*5)*s,y+(dy+3)*s]],'#385f4a');
    poly(c,[[x+dx*s,y+dy*s],[x+(dx+sgn*11)*s,y+(dy-6)*s],[x+(dx+sgn*6)*s,y+(dy+1)*s]],'#6b8a58');
    line(c,x+dx*s,y+dy*s,x+(dx+sgn*8)*s,y+(dy-3)*s,'#8c9b67',s);
  }
}

function desk(c:Ctx,frame:number){
  shade(c,140,230,76,13);
  r(c,71,198,7,35,'#485047');r(c,73,198,3,34,'#a0845b');r(c,194,198,7,35,'#485047');r(c,195,198,3,34,'#977b55');
  r(c,79,202,47,23,'#554e40');r(c,81,204,43,19,'#967a54');r(c,82,205,40,1,'#b79a6b');r(c,98,212,9,2,'#c5ab79');
  poly(c,[[66,178],[200,178],[209,196],[66,196]],'#3d4b43');poly(c,[[69,180],[198,180],[204,192],[69,192]],'#b0956b');
  r(c,67,193,140,7,'#7b664a');r(c,69,193,136,2,'#c0a375');
  // Open notebook: page blocks and short marks, no readable typography.
  poly(c,[[88,182],[112,182],[119,190],[92,190]],'#e0d3ad');poly(c,[[113,182],[133,180],[140,189],[120,190]],'#c7b991');
  line(c,113,183,119,189,'#8f8e72');for(let i=0;i<3;i++){r(c,94+i,184+i*2,14,1,'#9eaa91');r(c,120+i,183+i*2,12,1,'#969d84');}
  r(c,79,178,20,4,'#5a7c76');r(c,80,177,18,1,'#9baf98');
  r(c,137,181,3,9,'#bc8e57');r(c,138,180,1,9,'#e0bd79');
  // Small warm lamp, its pixelated halo intentionally restrained.
  c.save();c.globalAlpha=.055+Math.sin(frame/30)*.004;poly(c,[[168,156],[180,156],[213,193],[139,193]],'#f4d68d');c.restore();
  oval(c,174,189,9,3,'#4a5143');oval(c,174,188,7,2,'#c4a56f');r(c,173,162,3,25,'#6f7357');r(c,174,163,1,23,'#cfb47b');
  poly(c,[[167,146],[179,146],[186,163],[160,163]],'#424f41');poly(c,[[168,147],[178,147],[184,161],[162,161]],'#c5b67c');r(c,162,161,22,2,'#e5cc8d');r(c,169,148,3,10,'#d9cb94');
  r(c,190,180,11,10,'#596d5d');r(c,191,181,9,8,'#819179');r(c,193,175,1,8,'#b99d6c');r(c,196,173,1,10,'#bdc6a0');r(c,199,175,1,8,'#5b7b7a');
  // Stool tucked underneath, separate from the sleeping character.
  shade(c,153,248,18,5);r(c,139,232,3,19,'#665b46');r(c,165,232,3,19,'#665b46');poly(c,[[137,225],[164,225],[171,234],[135,234]],'#464d40');r(c,138,226,27,6,'#9e8358');r(c,138,226,25,1,'#c3a677');
}

function bed(c:Ctx){
  shade(c,342,265,100,16,.26);
  // Timber platform, legs, and raised headboard are drawn under the mattress.
  r(c,249,239,181,20,'#504d40');r(c,252,242,175,13,'#a38459');r(c,254,244,170,2,'#c3a575');
  r(c,253,254,8,15,'#554e3f');r(c,417,254,8,15,'#554e3f');r(c,254,255,4,11,'#a18257');r(c,418,255,3,11,'#98784f');
  r(c,244,163,13,94,'#364b43');r(c,247,165,8,88,'#9f8159');r(c,247,164,8,3,'#c3a473');r(c,248,169,2,79,'#b79a69');r(c,253,169,2,78,'#776649');
  r(c,255,171,169,77,'#6c7869');r(c,257,174,165,72,P.linen);
  r(c,259,175,161,3,P.linenHi);r(c,258,237,164,8,'#b3b293');r(c,260,238,160,2,'#c7c29d');
  r(c,420,177,3,66,'#9d9f85');r(c,260,244,159,3,'#a0a389');
  // Pillow leaves exactly the requested (282,195) head location to the character.
  poly(c,[[267,179],[292,178],[301,184],[300,208],[294,213],[266,211],[262,204],[262,186]],'#a3aa91');
  poly(c,[[267,180],[291,180],[297,184],[298,206],[293,210],[267,209],[264,203],[264,186]],'#e2d8b3');
  r(c,270,182,21,2,'#efe3bd');r(c,267,185,2,17,'#e9dfb9');r(c,270,207,20,1,'#b6baa0');
  // Teal quilt: woven checks, rim stitching and a soft stepped sleeping silhouette.
  poly(c,[[307,181],[321,178],[358,179],[386,181],[415,183],[419,190],[418,240],[307,240]],P.tealLow);
  poly(c,[[308,183],[324,180],[358,181],[385,183],[415,184],[417,190],[416,237],[308,237]],P.teal);
  for(let x=310;x<415;x+=13)r(c,x,184,1,51,'#618b88');
  for(let y=188;y<236;y+=12)r(c,310,y,104,1,'#648b86');
  for(let x=313;x<415;x+=13)for(let y=191;y<234;y+=12)r(c,x,y,2,2,'#6d9590');
  poly(c,[[309,183],[323,181],[355,182],[383,184],[415,185],[415,190],[382,188],[356,186],[325,185],[309,187]],'#88aaa0');
  r(c,309,188,4,47,'#7d9e94');r(c,314,191,1,39,'#4a7473');
  r(c,311,233,104,3,'#355e61');r(c,312,233,101,1,'#799c92');
  line(c,386,189,396,213,'#486f6d');line(c,396,213,400,233,'#486f6d');line(c,389,190,399,213,'#6b928c');
  r(c,424,181,7,75,'#354a43');r(c,425,182,5,70,'#987c52');r(c,425,182,5,3,'#c5a371');r(c,426,187,1,62,'#b99966');
}

function bedside(c:Ctx){
  shade(c,462,238,19,7);r(c,445,213,34,26,'#3e4c43');r(c,447,216,30,20,'#927957');r(c,447,216,29,2,'#b99b6a');r(c,459,224,8,2,'#cab37c');r(c,448,237,4,5,'#5e5643');r(c,472,237,4,5,'#5e5643');
  poly(c,[[444,204],[474,204],[480,213],[443,213]],'#33483f');poly(c,[[446,205],[473,205],[477,211],[445,211]],'#b59a6d');
  r(c,451,202,15,5,'#53777a');r(c,452,201,13,2,'#b9bb9b');r(c,454,200,14,2,'#ad8b63');
  r(c,468,198,7,10,'#344f4b');r(c,469,197,5,10,'#bdc4ab');r(c,470,198,3,6,'#d2d2b5');r(c,474,200,3,5,'#9da98e');r(c,475,201,1,2,'#43594f');
}

export function drawBedroom(ctx:CanvasRenderingContext2D,frame:number):void{
  ctx.save();ctx.imageSmoothingEnabled=false;
  room(ctx);bookshelf(ctx);clock(ctx);window(ctx,frame);
  // Moonbeam is a hard-edged translucent pixel polygon, never a blurred gradient.
  ctx.save();ctx.globalAlpha=.085;poly(ctx,[[465,119],[563,119],[509,253],[406,253]],'#a4c4ba');ctx.restore();
  ctx.save();ctx.globalAlpha=.065;poly(ctx,[[476,120],[505,120],[445,252],[418,252]],'#d5dec1');ctx.restore();
  desk(ctx,frame);bedside(ctx);bed(ctx);plant(ctx,564,232,true);plant(ctx,210,164,false);
  // Small slippers by the bed, kept clear of the subtitle region.
  oval(ctx,285,278,8,4,'#4c6056');oval(ctx,285,277,7,3,'#a49671');r(ctx,280,275,9,2,'#c1af85');
  oval(ctx,307,281,8,4,'#4c6056');oval(ctx,307,280,7,3,'#a49671');r(ctx,302,278,9,2,'#c1af85');
  for(let i=0;i<5;i++){const y=157+((i*19+Math.floor(frame/12))%62),x=210+i*14;ctx.save();ctx.globalAlpha=.12;r(ctx,x,y,1,1,'#e8d6a8');ctx.restore();}
  ctx.restore();
}
