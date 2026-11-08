// Original 640 × 360 pixel-art interior. No image assets or canvas antialiasing.
type Ctx = CanvasRenderingContext2D;
type Point = readonly [number, number];

const C = {
  ink: '#60503c', wall: '#d8cca6', wallLight: '#e0d6b5', wood: '#ac8253',
  woodLight: '#c29b64', woodDark: '#806244', teal: '#4c7872', tealLight: '#70968a',
  cream: '#eadbb4', green: '#597852', greenLight: '#81965e',
};

function r(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function hash(x: number, y: number, salt = 0) {
  let z = Math.imul(x + 319, 374761393) ^ Math.imul(y + 619, 668265263) ^ Math.imul(salt + 17, 982451653);
  z = Math.imul(z ^ (z >>> 13), 1274126177);
  return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
}
function poly(ctx: Ctx, p: readonly Point[], color: string) {
  ctx.fillStyle = color;
  for (let y = Math.floor(Math.min(...p.map(v => v[1]))); y < Math.ceil(Math.max(...p.map(v => v[1]))); y++) {
    const hits: number[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      if ((a[1] <= y + .5 && b[1] > y + .5) || (b[1] <= y + .5 && a[1] > y + .5))
        hits.push(a[0] + (y + .5 - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    hits.sort((a, b) => a - b);
    for (let i = 0; i + 1 < hits.length; i += 2) ctx.fillRect(Math.ceil(hits[i]), y, Math.ceil(hits[i + 1]) - Math.ceil(hits[i]), 1);
  }
}
function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    const f = 1 - dy * dy / (ry * ry);
    if (f < 0) continue;
    const dx = Math.floor(Math.sqrt(f) * rx);
    ctx.fillRect(Math.round(x) - dx, Math.round(y) + dy, dx * 2 + 1, 1);
  }
}
function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 1300; n++) {
    r(ctx, x0, y0, thickness, thickness, color);
    if (x0 === x1 && y0 === y1) break;
    const e = 2 * err;
    if (e >= dy) { err += dy; x0 += sx; }
    if (e <= dx) { err += dx; y0 += sy; }
  }
}
function shadow(ctx: Ctx, x: number, y: number, rx: number, ry: number, opacity = .15) {
  ctx.save(); ctx.globalAlpha = opacity;
  ellipse(ctx, x + 3, y + 2, rx, ry, '#544d3d'); ctx.restore();
}

function shell(ctx: Ctx) {
  r(ctx, 0, 0, 640, 145, C.wall);
  r(ctx, 15, 0, 610, 135, C.wallLight);
  r(ctx, 0, 0, 14, 145, '#b6a585'); r(ctx, 626, 0, 14, 145, '#b6a585');
  r(ctx, 14, 0, 612, 7, '#c3b390'); r(ctx, 19, 7, 602, 2, '#ebe0bd');
  // Quiet paper grain; the middle wall is deliberately free for thought bubbles.
  for (let i = 0; i < 390; i++) {
    const x = 20 + Math.floor(hash(i, 11) * 602), y = 12 + Math.floor(hash(i, 12) * 119);
    r(ctx, x, y, i % 5 === 0 ? 2 : 1, 1, i % 2 ? '#d9cfad' : '#e5dbb9');
  }
  r(ctx, 0, 133, 640, 4, '#b29b72'); r(ctx, 0, 137, 640, 8, '#a88a61');
  r(ctx, 0, 137, 640, 2, '#d4b484'); r(ctx, 0, 143, 640, 3, '#7f7255');
  r(ctx, 0, 146, 640, 214, '#bc9965');
  for (let row = 0, y = 146; y < 360; row++, y += 20) {
    r(ctx, 0, y, 640, 1, '#a78055'); r(ctx, 0, y + 1, 640, 1, '#caa772');
    const off = row % 2 ? -50 : 14;
    for (let x = off; x < 640; x += 92) {
      const shade = ['#bd9967', '#bf9c6b', '#b89463', '#c29e6b'][(row + Math.floor((x - off) / 92)) % 4];
      r(ctx, x + 1, y + 2, 90, 18, shade); r(ctx, x, y + 2, 1, 18, '#a58258');
      for (let k = 0; k < 5; k++) {
        const gx = x + 6 + Math.floor(hash(x, k, row) * 60), gy = y + 4 + Math.floor(hash(x, k + 7, row) * 12);
        r(ctx, gx, gy, 8 + Math.floor(hash(k, x, row) * 12), 1, k % 2 ? '#b48f5e' : '#c5a473');
      }
      if (hash(x, row) > .7) { const nx = x + 47; r(ctx, nx, y + 11, 6, 1, '#ac885b'); r(ctx, nx + 2, y + 10, 2, 3, '#b28d5d'); }
    }
  }
}

function window(ctx: Ctx, frame: number) {
  r(ctx, 457, 39, 101, 83, '#9f8962'); r(ctx, 460, 42, 95, 76, C.ink);
  r(ctx, 463, 45, 89, 70, '#94b7b0');
  r(ctx, 463, 45, 89, 33, '#adcac0');
  poly(ctx, [[463, 94], [476, 78], [490, 84], [507, 68], [527, 85], [543, 78], [552, 86], [552, 115], [463, 115]], '#8da585');
  poly(ctx, [[463, 105], [480, 98], [499, 104], [522, 91], [539, 101], [552, 95], [552, 115], [463, 115]], '#718b71');
  r(ctx, 506, 43, 4, 74, C.cream); r(ctx, 462, 79, 92, 4, C.cream);
  r(ctx, 507, 44, 1, 71, '#f1e8c8'); r(ctx, 463, 80, 90, 1, '#f1e8c8');
  r(ctx, 454, 117, 107, 5, C.woodDark); r(ctx, 453, 116, 109, 3, '#d7c49a');
  // Flax curtains, stepped edges, no smooth geometric folds.
  r(ctx, 448, 34, 118, 3, '#8a7353'); r(ctx, 445, 33, 5, 5, C.woodDark); r(ctx, 565, 33, 5, 5, C.woodDark);
  const sway = Math.floor(frame / 45) % 2;
  poly(ctx, [[450, 38], [474, 38], [469, 70], [466, 92], [469 + sway, 132], [449, 132]], '#c6b38c');
  poly(ctx, [[451, 39], [461, 39], [459, 89], [461, 131], [451, 131]], '#e2cfa6');
  line(ctx, 465, 40, 461, 91, '#b09a77', 2); line(ctx, 461, 94, 464, 129, '#b09a77');
  r(ctx, 450, 91, 17, 3, '#a9875d');
  poly(ctx, [[543, 38], [564, 38], [564, 132], [544, 132], [548, 92], [546, 67]], '#c6b38c');
  poly(ctx, [[554, 39], [562, 39], [562, 131], [553, 131], [556, 92]], '#e2cfa6');
  line(ctx, 547, 40, 551, 91, '#b09a77'); line(ctx, 551, 95, 548, 130, '#b09a77', 2);
  r(ctx, 547, 91, 16, 3, '#a9875d');
  ctx.save(); ctx.globalAlpha = .08;
  poly(ctx, [[470, 145], [553, 145], [634, 263], [506, 263]], '#fff2bc');
  ctx.restore();
}

function photo(ctx: Ctx, x: number, y: number, w: number, h: number, count: number) {
  r(ctx, x + 2, y + 3, w, h, '#b9aa87'); r(ctx, x, y, w, h, C.woodDark);
  r(ctx, x + 2, y + 2, w - 4, h - 4, '#c69f6a'); r(ctx, x + 5, y + 5, w - 10, h - 10, '#c0bfa0');
  r(ctx, x + 5, y + h - 13, w - 10, 8, '#7d937c');
  for (let i = 0; i < count; i++) {
    const px = x + 10 + i * 8, py = y + h - 17 + (i % 2) * 3;
    r(ctx, px, py, 5, 7, ['#7e7163', '#9b775c', '#b89965'][i % 3]);
    r(ctx, px, py - 5, 5, 5, '#dbc09a'); r(ctx, px, py - 6, 5, 2, '#635344');
  }
  r(ctx, x + 2, y + 2, w - 4, 1, '#dfbd87');
}

function sofa(ctx: Ctx) {
  shadow(ctx, 334, 211, 95, 8, .19);
  r(ctx, 250, 205, 8, 11, C.woodDark); r(ctx, 408, 205, 8, 11, C.woodDark);
  poly(ctx, [[245, 139], [419, 139], [425, 145], [425, 205], [419, 210], [246, 210], [240, 204], [240, 145]], '#3d5f5b');
  r(ctx, 245, 142, 175, 33, '#5b8077'); r(ctx, 249, 145, 167, 27, '#719489');
  r(ctx, 251, 145, 163, 2, '#8aa89a');
  r(ctx, 303, 146, 2, 26, '#53776f'); r(ctx, 361, 146, 2, 26, '#53776f');
  r(ctx, 252, 170, 162, 4, '#40635f');
  poly(ctx, [[253, 175], [412, 175], [417, 193], [249, 193]], '#799e8f');
  r(ctx, 250, 194, 167, 11, '#557f73'); r(ctx, 252, 195, 163, 2, '#658d7f');
  line(ctx, 304, 176, 303, 191, '#618878'); line(ctx, 359, 176, 361, 191, '#618878');
  for (let i = 0; i < 85; i++) {
    const x = 253 + Math.floor(hash(i, 91) * 160), y = 147 + Math.floor(hash(i, 92) * 22);
    r(ctx, x, y, 1, 1, i % 2 ? '#779a8c' : '#6a8d82');
  }
  r(ctx, 242, 167, 12, 34, '#426b65'); r(ctx, 244, 166, 9, 28, '#80a191'); r(ctx, 244, 166, 9, 2, '#9ab3a0');
  r(ctx, 413, 167, 10, 34, '#426b65'); r(ctx, 413, 166, 8, 28, '#80a191'); r(ctx, 413, 166, 8, 2, '#9ab3a0');
  // Cushions stay at the ends, keeping the seated protagonist's silhouette clear.
  poly(ctx, [[259, 157], [276, 158], [280, 179], [261, 180]], '#b6a06d');
  line(ctx, 261, 159, 275, 160, '#d3bd87'); line(ctx, 264, 162, 277, 176, '#aa9362');
  poly(ctx, [[387, 158], [404, 156], [406, 178], [386, 180]], '#a0ae94');
  line(ctx, 389, 160, 402, 158, '#c1c8a8'); line(ctx, 389, 164, 402, 175, '#8d9e87');
  // Folded woven throw draped over one arm.
  r(ctx, 401, 177, 14, 27, '#c7b08b'); r(ctx, 403, 179, 10, 24, '#d8c29c');
  for (let y = 182; y < 202; y += 5) r(ctx, 403, y, 10, 1, '#aa9777');
  for (let x = 403; x < 414; x += 3) r(ctx, x, 204, 1, 3, '#c7b08b');
}

function television(ctx: Ctx) {
  shadow(ctx, 94, 204, 62, 6, .19);
  r(ctx, 43, 198, 6, 12, C.woodDark); r(ctx, 141, 198, 6, 12, C.woodDark);
  r(ctx, 36, 166, 117, 36, C.woodDark); r(ctx, 39, 169, 111, 29, C.wood);
  r(ctx, 40, 171, 33, 25, '#b58b57'); r(ctx, 75, 171, 36, 25, '#6c5941'); r(ctx, 113, 171, 35, 25, '#b58b57');
  r(ctx, 42, 173, 29, 1, '#c9a16b'); r(ctx, 115, 173, 31, 1, '#c9a16b');
  r(ctx, 63, 180, 3, 3, '#806240'); r(ctx, 118, 180, 3, 3, '#806240');
  r(ctx, 78, 184, 28, 1, '#b99a69');
  r(ctx, 80, 175, 4, 8, '#71897d'); r(ctx, 85, 174, 4, 9, '#b0a377'); r(ctx, 90, 177, 3, 6, '#9f6f53');
  r(ctx, 80, 188, 25, 5, '#455453'); r(ctx, 99, 189, 2, 1, '#90a79a');
  r(ctx, 34, 161, 121, 6, C.woodDark); r(ctx, 35, 159, 119, 5, '#c5a16b'); r(ctx, 38, 160, 114, 1, '#ddba83');
  r(ctx, 49, 105, 89, 49, '#665746'); r(ctx, 51, 107, 85, 45, '#3f4945');
  r(ctx, 55, 111, 77, 35, '#455f5d'); r(ctx, 56, 112, 75, 33, '#536e69');
  poly(ctx, [[56, 112], [94, 112], [74, 145], [56, 145]], '#59756e');
  r(ctx, 57, 113, 73, 1, '#6a8278'); r(ctx, 129, 149, 2, 1, '#98ae8c');
  r(ctx, 87, 154, 12, 5, '#4f5044'); r(ctx, 77, 158, 33, 2, '#515045');
  // Small photo and unobtrusive remote on the cabinet.
  photo(ctx, 139, 141, 11, 16, 0); r(ctx, 143, 147, 3, 5, '#bca27f');
  r(ctx, 37, 156, 8, 3, '#6b6653'); r(ctx, 39, 156, 1, 1, '#b4b69a');
}

function rug(ctx: Ctx) {
  // Flat textiles can be crossed by the cast; furniture never occupies their marks.
  r(ctx, 239, 218, 195, 78, '#9b805e'); r(ctx, 242, 220, 189, 73, '#b7ac80');
  r(ctx, 246, 223, 181, 67, '#7d9080'); r(ctx, 249, 226, 175, 61, '#95a18b');
  r(ctx, 252, 229, 169, 55, '#a4ac90');
  for (let x = 244; x < 432; x += 4) { r(ctx, x, 216, 1, 4, '#bfaf86'); r(ctx, x, 294, 1, 4, '#bfaf86'); }
  for (let x = 254; x < 420; x += 11) {
    r(ctx, x, 232, 3, 1, '#778f7b'); r(ctx, x + 1, 231, 1, 3, '#778f7b');
    r(ctx, x, 280, 3, 1, '#778f7b'); r(ctx, x + 1, 279, 1, 3, '#778f7b');
  }
  for (let i = 0; i < 280; i++) {
    r(ctx, 252 + Math.floor(hash(i, 79) * 169), 230 + Math.floor(hash(i, 80) * 53), 1, 1, i % 2 ? '#a9b096' : '#9aa58b');
  }
}

function cup(ctx: Ctx, x: number, y: number, full: boolean) {
  ellipse(ctx, x, y + 4, 6, 2, '#a58960'); ellipse(ctx, x, y + 3, 6, 2, '#e0cfaa');
  r(ctx, x + 4, y - 1, 3, 4, '#b4ac8d'); r(ctx, x + 5, y, 1, 2, '#b99563');
  r(ctx, x - 3, y - 2, 7, 6, '#ded6b7'); r(ctx, x - 2, y - 3, 5, 1, '#f1e3c0');
  r(ctx, x - 2, y - 2, 5, 2, full ? '#80684a' : '#aaa78d'); r(ctx, x - 2, y, 1, 3, '#eee2bf');
}

function table(ctx: Ctx, variant: 'parents' | 'relatives') {
  shadow(ctx, 334, 282, 65, 5, .14);
  r(ctx, 279, 270, 5, 14, C.woodDark); r(ctx, 381, 270, 5, 14, C.woodDark);
  r(ctx, 271, 257, 122, 20, C.woodDark); r(ctx, 273, 258, 118, 15, '#b28b58');
  poly(ctx, [[276, 251], [388, 251], [395, 256], [395, 269], [390, 272], [274, 272], [269, 267], [269, 257]], '#7d6545');
  poly(ctx, [[277, 253], [387, 253], [392, 257], [392, 266], [388, 268], [275, 268], [272, 265], [272, 258]], '#cfaa73');
  r(ctx, 280, 254, 104, 1, '#e0bf88'); r(ctx, 278, 265, 109, 1, '#bc965f');
  r(ctx, 304, 255, 55, 12, '#d3bf8e'); r(ctx, 306, 256, 51, 10, '#dfcda0');
  for (let x = 307; x < 357; x += 5) r(ctx, x, 264, 2, 1, '#b9a379');
  ellipse(ctx, 333, 259, 15, 4, '#a18e65'); ellipse(ctx, 333, 257, 15, 4, '#e3d5ac');
  ellipse(ctx, 333, 256, 11, 3, '#b2a16f');
  ellipse(ctx, 328, 254, 4, 4, '#b77e4e'); r(ctx, 327, 250, 1, 2, '#6b6440'); r(ctx, 326, 252, 2, 1, '#d9a260');
  ellipse(ctx, 337, 253, 4, 4, '#c39c50'); r(ctx, 337, 249, 1, 2, '#6b6440'); r(ctx, 336, 251, 2, 1, '#e2bf72');
  ellipse(ctx, 333, 258, 4, 3, '#b17b4d'); r(ctx, 331, 256, 2, 1, '#d19c5a');
  cup(ctx, 290, 258, true); cup(ctx, 375, 259, true);
  if (variant === 'relatives') { cup(ctx, 310, 255, true); cup(ctx, 357, 263, false); }
  else { r(ctx, 352, 256, 9, 4, '#6c7061'); r(ctx, 354, 256, 2, 1, '#a3a98d'); }
}

function plant(ctx: Ctx, x: number, y: number, size = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size, size);
  shadow(ctx, 0, 0, 16, 4, .16);
  poly(ctx, [[-12, -20], [12, -20], [9, -1], [-9, -1]], '#9b7b59');
  r(ctx, -10, -18, 18, 14, '#b5976d'); r(ctx, -9, -18, 2, 13, '#c4aa7f');
  ellipse(ctx, 0, -20, 12, 4, '#bea37a'); ellipse(ctx, 0, -21, 9, 2, '#665941');
  line(ctx, 0, -21, -2, -64, '#5a6b48', 2); line(ctx, 0, -33, 15, -49, '#5a6b48');
  line(ctx, -1, -42, -16, -54, '#5a6b48');
  poly(ctx, [[-3, -48], [-15, -48], [-23, -56], [-20, -62], [-9, -59]], C.green);
  poly(ctx, [[-4, -49], [-17, -55], [-20, -60], [-9, -57]], C.greenLight);
  poly(ctx, [[0, -36], [10, -48], [24, -48], [21, -40], [11, -35]], '#5b7b50');
  line(ctx, 3, -38, 20, -45, '#8b9e65');
  poly(ctx, [[-2, -52], [-12, -64], [-10, -74], [-3, -72], [3, -61]], '#6e8a57');
  line(ctx, -3, -56, -8, -69, '#9aa975');
  poly(ctx, [[0, -59], [6, -72], [16, -77], [18, -70], [11, -60]], '#57774e');
  line(ctx, 3, -61, 13, -72, '#8fa16b');
  poly(ctx, [[-1, -31], [-14, -39], [-23, -36], [-19, -29], [-9, -27]], '#708958');
  ctx.restore();
}

function details(ctx: Ctx, frame: number) {
  photo(ctx, 157, 55, 36, 43, 3);
  photo(ctx, 119, 46, 25, 31, 2);
  // Wooden clock and a very small second-hand tick.
  ellipse(ctx, 594, 61, 17, 18, '#ad9770'); ellipse(ctx, 593, 59, 17, 18, C.woodDark);
  ellipse(ctx, 593, 59, 14, 15, '#d2bc8e'); ellipse(ctx, 593, 59, 11, 12, '#e6d6b0');
  r(ctx, 592, 48, 2, 3, '#8c7957'); r(ctx, 592, 67, 2, 3, '#8c7957'); r(ctx, 583, 58, 3, 2, '#8c7957'); r(ctx, 601, 58, 3, 2, '#8c7957');
  line(ctx, 593, 59, 588, 55, '#766447'); line(ctx, 593, 59, 596, 51, '#766447');
  const angle = Math.floor(frame / 30) * Math.PI / 30 - Math.PI / 2;
  line(ctx, 593, 59, 593 + Math.cos(angle) * 9, 59 + Math.sin(angle) * 9, '#b28b62'); r(ctx, 592, 58, 2, 2, '#65543e');
  // Narrow bookcase at the edge frames the room without crossing character marks.
  shadow(ctx, 593, 191, 24, 4);
  r(ctx, 573, 115, 39, 77, C.woodDark); r(ctx, 576, 118, 33, 70, '#9c8057');
  for (let yy = 139; yy < 188; yy += 24) r(ctx, 575, yy, 35, 3, '#c3a171');
  const bookColors = ['#738b77', '#b39970', '#a2765d', '#627c78', '#bea77b'];
  for (let i = 0; i < 6; i++) {
    const xx = 579 + i * 4, hh = 13 + i % 3;
    r(ctx, xx, 139 - hh, 3, hh, bookColors[i % 5]); r(ctx, xx, 137 - hh, 3, 2, '#c3b38b');
    r(ctx, xx, 163 - hh, 3, hh, bookColors[(i + 2) % 5]); r(ctx, xx, 159, 3, 1, '#cbb98f');
  }
  r(ctx, 579, 173, 25, 12, '#b9a17a'); r(ctx, 579, 175, 25, 1, '#d0b58b'); r(ctx, 589, 178, 6, 2, '#816b4b');
  // A small lamp keeps the back wall warm; no halo or bloom over the dialogue.
  shadow(ctx, 198, 191, 13, 3);
  r(ctx, 197, 139, 3, 51, '#806e4c'); ellipse(ctx, 198, 190, 11, 3, '#897550');
  poly(ctx, [[185, 118], [211, 118], [218, 142], [178, 142]], '#9b8862');
  poly(ctx, [[187, 119], [209, 119], [215, 138], [181, 138]], '#e0c995');
  r(ctx, 183, 138, 30, 2, '#f0dcb0'); line(ctx, 191, 121, 187, 135, '#d4b986');
  plant(ctx, 548, 223); plant(ctx, 68, 284);
  // Low woven basket, kept well away from the foreground subtitle area.
  shadow(ctx, 585, 276, 23, 4);
  poly(ctx, [[562, 251], [605, 251], [602, 276], [566, 276]], '#9d7f55');
  r(ctx, 566, 253, 35, 21, '#ba9b69');
  for (let y = 256; y < 274; y += 4) r(ctx, 567, y, 34, 1, '#8e7651');
  for (let x = 570; x < 600; x += 6) r(ctx, x, 254, 1, 20, '#d1b47e');
  r(ctx, 561, 249, 45, 4, '#c3a371'); r(ctx, 566, 247, 35, 3, '#e0ceaa');
  r(ctx, 572, 241, 18, 9, '#8d9c86'); r(ctx, 575, 239, 16, 5, '#a1ad94');
}

export function drawLiving(ctx: Ctx, frame: number, variant: 'parents' | 'relatives') {
  ctx.save(); ctx.imageSmoothingEnabled = false;
  shell(ctx); window(ctx, frame); rug(ctx); television(ctx); details(ctx, frame); sofa(ctx); table(ctx, variant);
  // Bottom 55 pixels contain only floor grain; narrator captions are drawn by the parent.
  ctx.restore();
}
