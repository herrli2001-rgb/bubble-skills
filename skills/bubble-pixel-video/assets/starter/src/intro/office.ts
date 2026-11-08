// Original 640 × 360 pixel-art office. Central floor stays clear for the cast.
type Ctx = CanvasRenderingContext2D;
type Point = readonly [number, number];
const C = {
  ink: '#3c5059', wall: '#8c9ea4', wallLight: '#a5b2b3', floor: '#758a8c',
  steel: '#647b80', edge: '#b7c4bd', dark: '#425c65', warm: '#c4b798',
};
function r(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function hash(x: number, y: number, salt = 0) {
  let z = Math.imul(x + 319, 374761393) ^ Math.imul(y + 619, 668265263) ^ Math.imul(salt + 17, 982451653);
  z = Math.imul(z ^ (z >>> 13), 1274126177); return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
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
    const f = 1 - dy * dy / (ry * ry); if (f < 0) continue;
    const dx = Math.floor(Math.sqrt(f) * rx); ctx.fillRect(Math.round(x) - dx, Math.round(y) + dy, dx * 2 + 1, 1);
  }
}
function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 1300; n++) {
    r(ctx, x0, y0, thickness, thickness, color); if (x0 === x1 && y0 === y1) break;
    const e = 2 * err; if (e >= dy) { err += dy; x0 += sx; } if (e <= dx) { err += dx; y0 += sy; }
  }
}
function shadow(ctx: Ctx, x: number, y: number, rx: number, ry: number, alpha = .18) {
  ctx.save(); ctx.globalAlpha = alpha; ellipse(ctx, x + 4, y + 3, rx, ry, '#2e4651'); ctx.restore();
}

function shell(ctx: Ctx) {
  r(ctx, 0, 0, 640, 145, C.wall); r(ctx, 15, 7, 610, 132, C.wallLight);
  r(ctx, 0, 0, 640, 7, '#687f87'); r(ctx, 15, 7, 610, 2, '#bdc8c2');
  r(ctx, 0, 7, 14, 138, '#768d95'); r(ctx, 626, 7, 14, 138, '#768d95');
  for (let x = 15; x < 626; x += 85) { r(ctx, x, 9, 1, 129, '#9aa9ac'); r(ctx, x + 1, 9, 1, 129, '#adbbbb'); }
  r(ctx, 0, 138, 640, 8, '#63777d'); r(ctx, 0, 139, 640, 2, '#b6c1bb');
  r(ctx, 0, 146, 640, 214, C.floor);
  // Carpet tile seams and restrained woven pixels, never a busy grid.
  for (let yy = 146, row = 0; yy < 360; yy += 31, row++) {
    for (let xx = 0, col = 0; xx < 640; xx += 64, col++) {
      r(ctx, xx, yy, 64, 31, (row + col) % 2 ? '#798e90' : '#778c8e');
      r(ctx, xx, yy, 1, 31, '#71878a'); r(ctx, xx, yy, 64, 1, '#71878a');
      for (let i = 0; i < 45; i++) {
        const x = xx + Math.floor(hash(i, xx, yy) * 63), y = yy + Math.floor(hash(i, yy, xx) * 30);
        r(ctx, x, y, (row + col) % 2 ? 2 : 1, (row + col) % 2 ? 1 : 2, i % 2 ? '#809598' : '#72888c');
      }
    }
  }
  // Long quiet dusk patches across the open floor.
  ctx.save(); ctx.globalAlpha = .075;
  poly(ctx, [[66, 146], [223, 146], [292, 282], [108, 282]], '#d7e1d7');
  poly(ctx, [[253, 146], [405, 146], [465, 268], [290, 268]], '#d7e1d7');
  ctx.restore();
}

function cityWindow(ctx: Ctx, frame: number) {
  r(ctx, 31, 25, 407, 101, '#748a8d'); r(ctx, 34, 28, 401, 95, '#45606b');
  r(ctx, 37, 31, 395, 89, '#7597a0');
  ctx.save(); ctx.beginPath(); ctx.rect(37, 31, 395, 89); ctx.clip();
  for (let y = 32; y < 120; y += 12) r(ctx, 37, y, 395, 12, ['#799ba3', '#7f9ea4', '#87a3a6', '#8da7a8', '#91aaa8', '#95acab', '#9ab1ac', '#9ab1ac'][Math.floor((y - 32) / 12)]);
  // Distant low skyline followed by the near blocks. All lights are sparse.
  for (let i = 0; i < 22; i++) {
    const x = 37 + i * 19, h = 13 + Math.floor(hash(i, 57) * 28);
    r(ctx, x, 120 - h, 15 + i % 4, h, '#7f979b');
    r(ctx, x + 4, 116 - h, 6, 4, '#7f979b');
  }
  const buildings = [
    [42, 67, 34, 53], [86, 48, 33, 72], [128, 73, 43, 47], [185, 57, 38, 63],
    [231, 81, 31, 39], [271, 43, 38, 77], [319, 65, 31, 55], [359, 54, 42, 66], [412, 76, 20, 44],
  ];
  for (let i = 0; i < buildings.length; i++) {
    const [x, y, w, h] = buildings[i];
    r(ctx, x, y, w, h, i % 2 ? '#5e7b85' : '#67868e'); r(ctx, x, y, w, 2, '#8aa3a6');
    r(ctx, x + w - 5, y + 2, 5, h - 2, '#536f7a');
    for (let wy = y + 7; wy < 117; wy += 8) for (let wx = x + 5; wx < x + w - 7; wx += 7) {
      const lit = hash(wx, wy, 66) > .79;
      r(ctx, wx, wy, 3, 4, lit ? '#b6b99b' : '#78969c');
      if (lit) r(ctx, wx, wy, 3, 1, '#c4c3a2');
    }
    if (i === 1 || i === 5) { r(ctx, x + 14, y - 8, 2, 8, '#4f6975'); r(ctx, x + 13, y - 9, 4, 2, Math.floor(frame / 50) % 2 ? '#b49b89' : '#9a9290'); }
  }
  // Glass tint, reflections, structural mullions.
  ctx.save(); ctx.globalAlpha = .12;
  poly(ctx, [[51, 31], [71, 31], [134, 120], [113, 120]], '#d9e5db');
  poly(ctx, [[329, 31], [338, 31], [405, 120], [395, 120]], '#d9e5db');
  ctx.restore();
  ctx.restore();
  for (const x of [132, 232, 332]) { r(ctx, x, 29, 5, 95, '#4b6470'); r(ctx, x + 1, 30, 2, 93, '#a2b4b4'); }
  r(ctx, 35, 94, 399, 3, '#516b74'); r(ctx, 36, 94, 397, 1, '#a3b4b4');
  r(ctx, 28, 123, 414, 6, '#657c82'); r(ctx, 28, 123, 414, 2, '#c1ccc4');
  r(ctx, 34, 20, 401, 7, '#6d858c'); r(ctx, 35, 20, 399, 2, '#bbc8c3');
  for (let x = 42; x < 430; x += 8) r(ctx, x, 24, 4, 1, '#819a9f');
}

function cabinet(ctx: Ctx) {
  // Low storage below the windows stops above the central acting zone.
  shadow(ctx, 339, 156, 87, 5, .13);
  r(ctx, 250, 132, 177, 29, '#506a72'); r(ctx, 253, 134, 171, 24, '#839b9e');
  r(ctx, 250, 130, 177, 4, '#b4bfba'); r(ctx, 253, 132, 171, 1, '#d0d7cc');
  for (let x = 253; x < 424; x += 43) {
    r(ctx, x, 136, 40, 20, '#91a6a5'); r(ctx, x + 1, 137, 38, 1, '#a9b9b2'); r(ctx, x + 28, 143, 7, 2, '#5c757c');
  }
  r(ctx, 258, 158, 5, 4, '#48616c'); r(ctx, 415, 158, 5, 4, '#48616c');
  // Trays and a few closed binders, with no pseudo-writing.
  r(ctx, 269, 122, 26, 8, '#596f75'); r(ctx, 271, 122, 22, 3, '#c7ccbb'); r(ctx, 274, 120, 19, 2, '#d1d4c2');
  for (let i = 0; i < 5; i++) { r(ctx, 374 + i * 7, 114 + i % 2, 5, 16 - i % 2, ['#6c8589', '#9aa89e', '#b0ab94'][i % 3]); r(ctx, 375 + i * 7, 120, 3, 2, '#d1d1bb'); }
}

function monitor(ctx: Ctx, x: number, y: number, frame: number, on: boolean) {
  r(ctx, x + 19, y + 30, 5, 10, '#50636a'); r(ctx, x + 11, y + 39, 21, 3, '#566f76');
  r(ctx, x, y, 45, 32, '#3e535d'); r(ctx, x + 2, y + 2, 41, 27, '#778b8c');
  r(ctx, x + 3, y + 3, 39, 25, on ? '#789da2' : '#4c656f');
  if (on) {
    r(ctx, x + 5, y + 5, 35, 2, '#9db8b5'); r(ctx, x + 5, y + 9, 9, 16, '#63858e');
    r(ctx, x + 17, y + 10, 21, 4, '#aac1bb'); r(ctx, x + 17, y + 16, 9, 8, '#93afb0'); r(ctx, x + 28, y + 16, 10, 8, '#72989e');
  } else poly(ctx, [[x + 4, y + 4], [x + 20, y + 4], [x + 8, y + 27], [x + 4, y + 27]], '#536e77');
  r(ctx, x + 38, y + 30, 2, 1, on || Math.floor(frame / 35) % 2 ? '#a2b7a2' : '#657f82');
}

function desk(ctx: Ctx, frame: number) {
  shadow(ctx, 137, 216, 94, 6, .2);
  // Metal underframe and hanging pedestal precede the worktop.
  r(ctx, 54, 174, 5, 42, '#4f6770'); r(ctx, 208, 174, 5, 42, '#4f6770');
  r(ctx, 55, 176, 2, 37, '#9aaead'); r(ctx, 209, 176, 2, 37, '#9aaead');
  r(ctx, 55, 211, 157, 3, '#627c81'); r(ctx, 64, 179, 37, 29, '#4e6770');
  r(ctx, 66, 181, 33, 25, '#8c9d9a'); r(ctx, 67, 182, 31, 11, '#9eaca5'); r(ctx, 67, 195, 31, 10, '#8e9f9c');
  r(ctx, 77, 185, 11, 2, '#566f76'); r(ctx, 77, 198, 11, 2, '#566f76');
  poly(ctx, [[55, 154], [207, 154], [218, 174], [218, 181], [47, 181], [47, 174]], '#536b70');
  poly(ctx, [[56, 155], [207, 155], [214, 173], [51, 173]], '#b7b59d');
  r(ctx, 50, 174, 166, 4, '#929b8d'); r(ctx, 53, 155, 154, 1, '#d0cfb5');
  r(ctx, 131, 154, 2, 19, '#929b8d');
  // A low divider and subtly different abandoned workstations.
  r(ctx, 54, 140, 158, 15, '#6b8589'); r(ctx, 56, 141, 154, 11, '#8ba09d'); r(ctx, 56, 140, 154, 1, '#adbbb0');
  monitor(ctx, 65, 125, frame, false); monitor(ctx, 151, 125, frame, true);
  r(ctx, 71, 166, 33, 6, '#5a7278'); r(ctx, 72, 166, 31, 4, '#a6b4ad');
  r(ctx, 153, 167, 34, 5, '#5a7278'); r(ctx, 154, 167, 32, 3, '#a6b4ad');
  for (let xx = 74; xx < 102; xx += 4) r(ctx, xx, 167, 2, 1, '#7d9496');
  for (let xx = 156; xx < 184; xx += 4) r(ctx, xx, 168, 2, 1, '#7d9496');
  ellipse(ctx, 113, 169, 3, 3, '#9caaa5'); ellipse(ctx, 196, 169, 3, 3, '#9caaa5');
  r(ctx, 119, 158, 9, 4, '#9b947f'); r(ctx, 119, 157, 8, 3, '#d4d1b9');
  r(ctx, 202, 149, 5, 11, '#7d8f8a'); r(ctx, 203, 144, 1, 8, '#c9b996'); r(ctx, 206, 145, 1, 6, '#4f6a72');
  r(ctx, 116, 148, 7, 9, '#bbbfae'); r(ctx, 123, 149, 3, 5, '#9ca99e'); r(ctx, 124, 150, 1, 3, '#6b8589');
  // Black cable droops behind the desk, nowhere near the acting space.
  line(ctx, 123, 180, 124, 201, '#52686e'); line(ctx, 124, 201, 133, 205, '#52686e');
}

function chair(ctx: Ctx, x: number, y: number, turned: boolean) {
  shadow(ctx, x, y + 17, 24, 5, .18);
  line(ctx, x, y + 2, x, y + 16, '#485e68', 3);
  line(ctx, x + 1, y + 14, x - 17, y + 21, '#4c626d', 2); line(ctx, x + 1, y + 14, x + 18, y + 21, '#4c626d', 2);
  line(ctx, x + 1, y + 14, x + 2, y + 24, '#4c626d', 2);
  r(ctx, x - 18, y + 21, 5, 3, '#3c535f'); r(ctx, x + 16, y + 21, 5, 3, '#3c535f'); r(ctx, x, y + 24, 5, 3, '#3c535f');
  poly(ctx, [[x - 16, y - 12], [x + 14, y - 12], [x + 20, y + 1], [x + 16, y + 5], [x - 17, y + 5], [x - 21, y]], '#364f5b');
  poly(ctx, [[x - 15, y - 12], [x + 13, y - 12], [x + 17, y - 1], [x - 18, y - 1]], '#607e87');
  r(ctx, x - 13, y - 32, 27, 25, '#3f5863'); r(ctx, x - 11, y - 30, 23, 21, '#6d8890'); r(ctx, x - 9, y - 29, 19, 2, '#8ba2a6');
  for (let yy = y - 26; yy < y - 12; yy += 4) r(ctx, x - 9, yy, 19, 1, '#607e87');
  r(ctx, x - 23, y - 13, 4, 11, '#455e68'); r(ctx, x + 18, y - 13, 4, 11, '#455e68');
  r(ctx, x - 25, y - 14, 9, 3, '#728a90'); r(ctx, x + 16, y - 14, 9, 3, '#728a90');
  if (turned) { r(ctx, x + 10, y - 29, 4, 18, '#526f7c'); r(ctx, x - 11, y - 6, 20, 2, '#769098'); }
}

function door(ctx: Ctx) {
  // A real, reachable doorway to the right; the manager stands to its left.
  r(ctx, 488, 61, 103, 176, '#586e76'); r(ctx, 491, 64, 97, 169, '#a5b4b1');
  r(ctx, 495, 68, 89, 162, '#344b58'); r(ctx, 499, 71, 81, 154, '#506774');
  r(ctx, 502, 71, 77, 115, '#647c86'); r(ctx, 503, 72, 76, 1, '#859ba2');
  poly(ctx, [[503, 186], [579, 186], [579, 224], [502, 224]], '#849393');
  r(ctx, 554, 86, 26, 101, '#516b77'); r(ctx, 556, 88, 23, 95, '#607985');
  r(ctx, 505, 185, 74, 2, '#a7b0a5');
  poly(ctx, [[499, 71], [527, 83], [527, 217], [499, 229]], '#6c858b');
  poly(ctx, [[503, 77], [523, 86], [523, 186], [503, 190]], '#98afb0');
  poly(ctx, [[506, 81], [520, 87], [520, 180], [506, 183]], '#6f919b');
  poly(ctx, [[507, 83], [511, 85], [520, 116], [520, 130]], '#82a0a6');
  line(ctx, 526, 84, 526, 216, '#3f5c69', 2);
  r(ctx, 519, 151, 3, 18, '#c1c9bf'); r(ctx, 520, 153, 1, 14, '#e0dfca');
  r(ctx, 493, 229, 94, 5, '#b4b9ab'); r(ctx, 495, 233, 91, 2, '#4d6873');
  r(ctx, 595, 146, 7, 12, '#687f84'); r(ctx, 596, 147, 5, 10, '#c2c9ba'); r(ctx, 597, 149, 3, 3, '#809b9b');
  // Interior wall shadow stretches inward but remains low contrast.
  ctx.save(); ctx.globalAlpha = .10;
  poly(ctx, [[497, 234], [527, 219], [571, 284], [531, 286]], '#2d4958'); ctx.restore();
}

function palm(ctx: Ctx, x: number, y: number) {
  shadow(ctx, x, y, 23, 6, .2);
  poly(ctx, [[x - 16, y - 26], [x + 16, y - 26], [x + 11, y], [x - 11, y]], '#5c7171');
  poly(ctx, [[x - 13, y - 24], [x + 13, y - 24], [x + 9, y - 3], [x - 9, y - 3]], '#9aa79a');
  r(ctx, x - 9, y - 22, 3, 17, '#b1baa7'); ellipse(ctx, x, y - 26, 16, 4, '#a6b19e'); ellipse(ctx, x, y - 27, 12, 2, '#536755');
  line(ctx, x, y - 28, x - 1, y - 75, '#526e5e', 2);
  const leaves: [number, number, number, number][] = [[-2, -64, -28, -80], [0, -67, 24, -86], [-1, -72, -10, -100], [0, -53, 30, -66], [-1, -51, -31, -61], [0, -43, 22, -47]];
  for (let i = 0; i < leaves.length; i++) {
    const [sx, sy, ex, ey] = leaves[i];
    poly(ctx, [[x + sx, y + sy], [x + ex - 6, y + ey - 3], [x + ex, y + ey - 6], [x + ex + 5, y + ey], [x + sx + 4, y + sy + 3]], i % 2 ? '#607f6d' : '#6f8e74');
    line(ctx, x + sx, y + sy, x + ex, y + ey - 2, '#92a38a');
  }
}

function details(ctx: Ctx) {
  // Pendant light housings cast no distracting pool over the thought bubbles.
  for (const x of [156, 362]) {
    r(ctx, x, 0, 2, 17, '#4d6571'); r(ctx, x - 35, 17, 73, 5, '#536d76');
    r(ctx, x - 33, 18, 69, 2, '#b2c1b9'); r(ctx, x - 31, 22, 65, 2, '#d2d6bc');
  }
  // Water dispenser at the far left, after-hours recycling below it.
  shadow(ctx, 29, 205, 17, 4, .15);
  r(ctx, 15, 153, 28, 50, '#506970'); r(ctx, 18, 154, 22, 46, '#b1bbb0');
  r(ctx, 20, 156, 18, 14, '#617d84'); r(ctx, 20, 171, 18, 3, '#859b9b');
  r(ctx, 22, 159, 4, 3, '#a4b9b3'); r(ctx, 32, 159, 4, 3, '#baaa97'); r(ctx, 23, 174, 13, 1, '#d6d7c4');
  r(ctx, 22, 178, 13, 18, '#9aa99f'); r(ctx, 23, 180, 11, 1, '#c2cabc');
  r(ctx, 21, 130, 16, 23, '#6c969d'); r(ctx, 19, 134, 20, 14, '#80a8a9');
  r(ctx, 23, 132, 3, 17, '#a8c4bc'); r(ctx, 20, 144, 18, 2, '#6e969c'); r(ctx, 25, 127, 8, 4, '#587c87');
  // A shut printer and neat paper stack give the empty side a lived-in scale.
  shadow(ctx, 104, 279, 43, 4, .14);
  r(ctx, 67, 246, 76, 31, '#566f75'); r(ctx, 70, 248, 70, 25, '#8c9e9c');
  r(ctx, 72, 250, 32, 21, '#99aaa4'); r(ctx, 107, 250, 30, 21, '#99aaa4');
  r(ctx, 83, 255, 10, 2, '#577078'); r(ctx, 117, 255, 10, 2, '#577078');
  r(ctx, 64, 242, 82, 6, '#afb8a9'); r(ctx, 65, 242, 80, 1, '#cbd1bd');
  r(ctx, 80, 221, 50, 21, '#4f6870'); r(ctx, 82, 222, 46, 16, '#a8b4aa'); r(ctx, 84, 218, 41, 7, '#bdc5b4');
  r(ctx, 89, 217, 30, 3, '#dde0c9'); r(ctx, 92, 213, 25, 5, '#c9d2bf');
  r(ctx, 87, 232, 31, 4, '#526c74'); r(ctx, 120, 226, 4, 3, '#75979b');
  r(ctx, 137, 233, 8, 9, '#788f8d');
  palm(ctx, 593, 283);
  // Waste bin: no readable labels, documents or company branding.
  ellipse(ctx, 234, 248, 10, 3, '#5c7276'); poly(ctx, [[225, 233], [244, 233], [241, 248], [228, 248]], '#617a7e');
  ellipse(ctx, 234, 233, 10, 3, '#8c9e98'); ellipse(ctx, 234, 233, 7, 1, '#47636c');
  for (let x = 230; x < 241; x += 3) r(ctx, x, 237, 1, 8, '#92a29a');
}

export function drawOffice(ctx: Ctx, frame: number) {
  ctx.save(); ctx.imageSmoothingEnabled = false;
  shell(ctx); cityWindow(ctx, frame); cabinet(ctx); door(ctx); desk(ctx, frame);
  chair(ctx, 106, 208, false); chair(ctx, 189, 207, true); details(ctx);
  // x 275..430 / y 165..265 stays free of furniture. y 305..360 is subtitle-safe.
  ctx.restore();
}
