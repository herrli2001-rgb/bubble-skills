// Original 640 × 360 pixel-art world. All geometry is rasterized on the pixel grid.
// No external imagery, fonts, or assets are used by this layer.
type Point = readonly [number, number];
type Ctx = CanvasRenderingContext2D;

const C = {
  ink: "#27483d",
  ground: "#82974f",
  grassLight: "#96a75b",
  grassDark: "#728c47",
  soil: "#b9a06a",
  soilLight: "#c7ae78",
  soilDark: "#9d885c",
  wood: "#946f40",
  woodLight: "#c8a36b",
  woodDark: "#695132",
  roof: "#427f85",
  roofLight: "#649b99",
  roofDark: "#315e65",
  cream: "#e9d6a1",
  shadow: "#526c3e",
  river: "#4b9594",
};

const r = (
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
const hsh = (x: number, y: number, salt = 0) => {
  let z =
    Math.imul(x + 319, 374761393) ^
    Math.imul(y + 619, 668265263) ^
    Math.imul(salt + 17, 982451653);
  z = Math.imul(z ^ (z >>> 13), 1274126177);
  return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
};

// Scanline polygon, deliberately without the browser's diagonal anti-aliasing.
function poly(ctx: Ctx, points: readonly Point[], color: string) {
  const y0 = Math.floor(Math.min(...points.map((p) => p[1])));
  const y1 = Math.ceil(Math.max(...points.map((p) => p[1])));
  ctx.fillStyle = color;
  for (let y = y0; y < y1; y++) {
    const hits: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      if (
        (a[1] <= y + 0.5 && b[1] > y + 0.5) ||
        (b[1] <= y + 0.5 && a[1] > y + 0.5)
      ) {
        hits.push(a[0] + ((y + 0.5 - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    hits.sort((a, b) => a - b);
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const x0 = Math.ceil(hits[i]),
        x1 = Math.ceil(hits[i + 1]);
      ctx.fillRect(x0, y, x1 - x0, 1);
    }
  }
}

function ellipse(
  ctx: Ctx,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
) {
  ctx.fillStyle = color;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    const f = 1 - (dy * dy) / (ry * ry);
    if (f < 0) continue;
    const dx = Math.floor(Math.sqrt(f) * rx);
    ctx.fillRect(Math.round(cx) - dx, Math.round(cy) + dy, dx * 2 + 1, 1);
  }
}

function line(
  ctx: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  thickness = 1,
) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 1300; n++) {
    r(ctx, x0, y0, thickness, thickness, color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function shadow(ctx: Ctx, x: number, y: number, rx: number, ry: number) {
  ctx.save();
  ctx.globalAlpha = 0.24;
  ellipse(ctx, x + 3, y + 2, rx + 2, ry + 1, "#244c3a");
  ctx.globalAlpha = 0.19;
  ellipse(ctx, x + 2, y + 1, rx - 1, ry, "#224333");
  ctx.restore();
}

function ground(ctx: Ctx) {
  r(ctx, 0, 0, 640, 360, C.ground);
  // Irregular moss patches give the grass a handmade woven texture.
  for (let i = 0; i < 300; i++) {
    const x = Math.floor(hsh(i, 1) * 640),
      y = Math.floor(hsh(i, 2) * 360);
    const w = 5 + Math.floor(hsh(i, 3) * 16),
      h = 2 + Math.floor(hsh(i, 4) * 7);
    const col = ["#859a51", "#7d944c", "#8a9c53", "#7c934e"][i % 4];
    poly(
      ctx,
      [
        [x, y + 2],
        [x + 3, y],
        [x + w - 3, y],
        [x + w, y + 2],
        [x + w - 1, y + h],
        [x + 3, y + h + 1],
      ],
      col,
    );
  }
  for (let i = 0; i < 6600; i++) {
    const x = Math.floor(hsh(i, 9) * 640),
      y = Math.floor(hsh(i, 19) * 360);
    const col = ["#93a358", "#6f8947", "#8c9f55", "#7a914a", "#9aaa5d"][i % 5];
    r(ctx, x, y, i % 8 === 0 ? 3 : 2, 1, col);
    if (i % 17 === 0) {
      r(ctx, x + 1, y - 1, 1, 1, "#718a46");
      r(ctx, x + 3, y - 2, 1, 2, "#718a46");
    }
  }
  // The old route stops at the river. The new routes are drawn by the animation layer.
  const path = (x: number, y: number, w: number, height: number) => {
    r(ctx, x, y - 1, w, height + 2, "#8e8d51");
    r(ctx, x, y, w, height, C.soil);
    r(ctx, x, y + 2, w, height - 4, C.soilLight);
    for (let i = 0; i < w * 2; i++) {
      const px = x + Math.floor(hsh(i, x) * w),
        py = y + Math.floor(hsh(i, y + 51) * height);
      r(ctx, px, py, 1 + (i % 3), 1, i % 3 ? "#b6a16c" : "#d0b984");
    }
    for (let px = x; px < x + w; px += 5) {
      if (hsh(px, 2) > 0.45) r(ctx, px, y - 2, 3, 2, "#9c9658");
      if (hsh(px, 3) > 0.45) r(ctx, px, y + height, 2, 2, "#9c9658");
    }
  };
  path(65, 199, 249, 12);
  path(392, 199, 169, 12);
  // Small village lanes, separate from the character's open field.
  poly(
    ctx,
    [
      [430, 104],
      [441, 104],
      [441, 183],
      [456, 199],
      [441, 203],
      [430, 184],
    ],
    "#ada16a",
  );
  poly(
    ctx,
    [
      [484, 207],
      [495, 207],
      [500, 246],
      [489, 247],
    ],
    "#ada16a",
  );
  for (let i = 0; i < 80; i++) {
    const y = 113 + Math.floor(hsh(i, 56) * 75);
    r(
      ctx,
      432 + Math.floor(hsh(i, 59) * 8),
      y,
      2,
      1,
      i % 2 ? "#b8ac75" : "#a39760",
    );
  }
}

const riverX = (y: number) => 355 + Math.sin(y / 38) * 18;
function river(ctx: Ctx, frame: number) {
  for (let y = 0; y < 360; y++) {
    const cx = riverX(y),
      half = 20 + Math.sin(y / 23) * 2;
    const left = Math.round(cx - half),
      right = Math.round(cx + half);
    r(ctx, left - 7, y, right - left + 14, 1, "#637b47");
    r(ctx, left - 5, y, right - left + 10, 1, "#a3965e");
    r(ctx, left - 3, y, right - left + 6, 1, "#d0bd80");
    r(ctx, left - 1, y, right - left + 2, 1, "#376e72");
    r(ctx, left + 1, y, right - left - 2, 1, "#64aaa1");
    r(ctx, left + 5, y, right - left - 10, 1, C.river);
    r(ctx, Math.round(cx) - 6, y, 12, 1, "#488d91");
    if (y % 8 === 0) r(ctx, left - 8, y, 2, 3, "#526e3e");
  }
  const drift = Math.floor(frame / 9);
  for (let i = 0; i < 110; i++) {
    const y = ((Math.floor(hsh(i, 124) * 385) + drift) % 385) - 12;
    const x = Math.round(riverX(y) + (hsh(i, 125) - 0.5) * 31);
    const w = 2 + Math.floor(hsh(i, 126) * 6);
    r(ctx, x, y, w, 1, i % 3 ? "#73b6ac" : "#96cdc0");
    if (i % 4 === 0) r(ctx, x + 2, y + 2, w - 2, 1, "#5aa29e");
  }
  // Reeds and clumps are intermittent, leaving crossing points readable.
  for (let y = 14; y < 315; y += 21) {
    if (
      Math.abs(y - 109) < 15 ||
      Math.abs(y - 278) < 15 ||
      Math.abs(y - 204) < 17
    )
      continue;
    const side = y % 2 ? 1 : -1;
    const x = Math.round(riverX(y) + side * 25);
    for (let j = 0; j < 4; j++) {
      r(ctx, x + j * 2, y - (j % 2) * 2, 1, 5 + (j % 3), "#577b43");
      r(ctx, x + j * 2, y - 2 - (j % 2) * 2, 1, 2, "#a5b565");
    }
  }
}

function bridge(ctx: Ctx, y: number) {
  const cx = Math.round(riverX(y)),
    x = cx - 33,
    width = 66;
  shadow(ctx, cx, y + 8, 35, 4);
  r(ctx, x - 1, y - 6, width + 2, 15, "#445845");
  r(ctx, x, y - 6, width, 14, "#8c7049");
  for (let k = 0; k < 11; k++) {
    r(ctx, x + k * 6, y - 6, 5, 14, k % 3 === 0 ? "#bda06b" : "#c9ad76");
    r(ctx, x + k * 6 + 1, y - 5, 3, 1, "#dac18a");
    r(ctx, x + k * 6 + 1, y + 5, 3, 1, "#a78a58");
    r(ctx, x + k * 6 + 2, y - 2 + (k % 3), 2, 1, "#ad915d");
  }
  r(ctx, x - 1, y - 11, width + 2, 2, "#5c5939");
  r(ctx, x, y - 10, width, 2, "#bd9a60");
  r(ctx, x - 1, y + 6, width + 2, 3, "#5e5538");
  r(ctx, x, y + 6, width, 1, "#d3b77e");
  for (const px of [x - 1, x + 31, x + width - 2]) {
    r(ctx, px, y - 13, 4, 7, "#665738");
    r(ctx, px + 1, y - 13, 2, 5, "#c5a16b");
    r(ctx, px, y + 3, 4, 9, "#665738");
    r(ctx, px + 1, y + 3, 2, 7, "#bc965c");
    r(ctx, px + 1, y + 3, 2, 1, "#e0c38d");
  }
}

function brokenBridge(ctx: Ctx) {
  // The absent centre span makes the narrative obstacle immediately visible.
  r(ctx, 307, 199, 16, 12, "#6f6340");
  for (let i = 0; i < 3; i++) {
    r(ctx, 309 + i * 5, 199, 4, 11 - i * 2, "#ba9962");
    r(ctx, 309 + i * 5, 199, 3, 1, "#d3b77e");
  }
  r(ctx, 309, 196, 3, 5, "#655437");
  r(ctx, 310, 195, 2, 3, "#c5a16b");
  r(ctx, 309, 207, 3, 8, "#655437");
  r(ctx, 310, 208, 2, 5, "#b79159");
  // Eastern approach reaches the actual bank; its riverward end is splintered.
  r(ctx, 369, 199, 26, 12, "#6f6340");
  for (let i = 0; i < 5; i++) {
    r(ctx, 370 + i * 5, 200 - (i % 2), 4, 10, i % 2 ? "#b69661" : "#c5a36c");
    r(ctx, 371 + i * 5, 200 - (i % 2), 3, 1, "#d5b981");
  }
  r(ctx, 366, 201, 4, 3, "#b69661");
  r(ctx, 367, 207, 3, 3, "#c5a36c");
  r(ctx, 391, 195, 3, 5, "#67573a");
  r(ctx, 392, 195, 2, 3, "#d1b17b");
  r(ctx, 391, 207, 3, 8, "#67573a");
  r(ctx, 392, 207, 2, 6, "#bf9b64");
}

function rock(ctx: Ctx, x: number, y: number, size = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(size, size);
  shadow(ctx, 1, 2, 7, 3);
  poly(
    ctx,
    [
      [-7, 0],
      [-5, -5],
      [-1, -7],
      [4, -5],
      [7, -1],
      [6, 3],
      [-4, 4],
    ],
    "#3c5e52",
  );
  poly(
    ctx,
    [
      [-6, -1],
      [-4, -5],
      [0, -6],
      [4, -4],
      [5, 1],
      [2, 3],
      [-4, 2],
    ],
    "#72928a",
  );
  poly(
    ctx,
    [
      [-4, -4],
      [0, -6],
      [3, -4],
      [0, -1],
      [-4, 0],
    ],
    "#a2b6a0",
  );
  r(ctx, 2, -1, 3, 3, "#5b7b75");
  r(ctx, -3, -4, 2, 1, "#c1c7a5");
  ctx.restore();
}

function flowers(
  ctx: Ctx,
  x: number,
  y: number,
  color: string,
  count: number,
  seed: number,
) {
  for (let i = 0; i < count; i++) {
    const xx = x + Math.floor(hsh(i, seed) * 18),
      yy = y + Math.floor(hsh(i, seed + 1) * 9);
    r(ctx, xx, yy, 1, 3, "#587b42");
    r(ctx, xx - 1, yy - 1, 3, 2, color);
    if (i % 2) r(ctx, xx, yy - 2, 1, 1, "#efe2ac");
  }
}

function bush(ctx: Ctx, x: number, y: number, s = 1) {
  shadow(ctx, x, y + 1, 10 * s, 3 * s);
  ellipse(ctx, x, y - 4 * s, 11 * s, 7 * s, "#355d3f");
  ellipse(ctx, x - 5 * s, y - 7 * s, 5 * s, 5 * s, "#568347");
  ellipse(ctx, x + 2 * s, y - 8 * s, 7 * s, 5 * s, "#65954e");
  ellipse(ctx, x + 7 * s, y - 3 * s, 4 * s, 4 * s, "#4d7d43");
  r(ctx, x - 5 * s, y - 10 * s, 3 * s, 2 * s, "#88a35b");
  r(ctx, x + 2 * s, y - 10 * s, 3 * s, 2 * s, "#8ca85e");
  r(ctx, x - 7 * s, y - 4 * s, 2 * s, 1 * s, "#91ab62");
}

function oak(ctx: Ctx, x: number, y: number, scale = 1, golden = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  shadow(ctx, 5, 1, 24, 8);
  poly(
    ctx,
    [
      [-5, 1],
      [-4, -24],
      [0, -30],
      [5, -21],
      [4, 0],
      [10, 3],
      [0, 5],
      [-8, 4],
    ],
    "#46523a",
  );
  r(ctx, -2, -24, 5, 25, "#8a7751");
  r(ctx, -1, -20, 2, 19, "#b19967");
  line(ctx, -2, -12, -8, -18, "#4e5639", 3);
  line(ctx, 2, -16, 9, -23, "#59603e", 3);
  const dark = golden ? "#59733f" : "#2e6346";
  const mid = golden ? "#85974a" : "#4a8853";
  const light = golden ? "#a7ad59" : "#65a365";
  const hi = golden ? "#bec16d" : "#89b870";
  const clusters: [number, number, number, number][] = [
    [-13, -28, 12, 11],
    [13, -29, 13, 11],
    [-18, -38, 10, 11],
    [18, -39, 9, 10],
    [0, -35, 20, 16],
    [-11, -49, 13, 12],
    [10, -50, 13, 11],
    [0, -57, 13, 9],
  ];
  for (const [cx, cy, rx, ry] of clusters)
    ellipse(ctx, cx, cy, rx + 1, ry + 1, dark);
  for (const [cx, cy, rx, ry] of clusters)
    ellipse(ctx, cx, cy - 1, rx - 1, ry - 1, mid);
  for (let i = 0; i < 40; i++) {
    const xx = Math.floor((hsh(i, Math.round(x)) - 0.5) * 44),
      yy = -57 + Math.floor(hsh(i, Math.round(y)) * 29);
    if ((xx * xx) / 600 + ((yy + 42) * (yy + 42)) / 550 > 1.12) continue;
    ellipse(
      ctx,
      xx,
      yy,
      3 + Math.floor(hsh(i, 79) * 4),
      2 + Math.floor(hsh(i, 80) * 3),
      i % 3 ? light : mid,
    );
    if (i % 4 === 0) r(ctx, xx - 1, yy - 2, 3, 1, hi);
  }
  // Stepped leaf teeth, never soft circular blobs.
  for (const [xx, yy] of [
    [-23, -35],
    [-18, -48],
    [-9, -59],
    [5, -61],
    [19, -49],
    [23, -36],
    [-14, -23],
    [10, -22],
  ]) {
    r(ctx, xx, yy, 3, 2, dark);
  }
  r(ctx, -10, -56, 3, 2, hi);
  r(ctx, -16, -43, 4, 2, hi);
  r(ctx, 0, -60, 4, 2, hi);
  ctx.restore();
}

function pine(ctx: Ctx, x: number, y: number, scale = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  shadow(ctx, 4, 2, 17, 5);
  r(ctx, -3, -12, 6, 16, "#3f5540");
  r(ctx, -1, -11, 3, 15, "#8e7952");
  r(ctx, 0, -8, 1, 11, "#b59a66");
  const layers: [number, number, number][] = [
    [-51, 11, 25],
    [-40, 15, 26],
    [-27, 19, 27],
  ];
  for (const [top, wide, height] of layers) {
    poly(
      ctx,
      [
        [0, top - 3],
        [-4, top + 8],
        [-wide, top + height - 3],
        [-wide + 6, top + height - 3],
        [-wide + 5, top + height],
        [0, top + height + 3],
        [wide - 5, top + height],
        [wide - 6, top + height - 3],
        [wide, top + height - 3],
        [4, top + 8],
      ],
      "#285c47",
    );
    poly(
      ctx,
      [
        [0, top],
        [-3, top + 9],
        [-wide + 3, top + height - 4],
        [-wide + 8, top + height - 4],
        [-wide + 6, top + height - 1],
        [0, top + height],
        [wide - 6, top + height - 2],
        [wide - 3, top + height - 4],
        [3, top + 8],
      ],
      "#458a64",
    );
    poly(
      ctx,
      [
        [0, top],
        [-3, top + 9],
        [-wide + 4, top + height - 5],
        [-wide + 9, top + height - 5],
        [-5, top + height - 8],
        [0, top + height - 2],
      ],
      "#65a573",
    );
    line(ctx, -wide + 5, top + height - 5, -7, top + height - 8, "#85b87c");
    r(ctx, 1, top + height - 4, 5, 1, "#397b58");
  }
  ctx.restore();
}

function fence(ctx: Ctx, x: number, y: number, count: number, gap = 18) {
  const width = (count - 1) * gap;
  r(ctx, x, y - 9, width, 3, "#645c3a");
  r(ctx, x, y - 9, width, 1, "#c0a06b");
  r(ctx, x, y - 3, width, 3, "#665a38");
  r(ctx, x, y - 3, width, 1, "#b69b65");
  for (let i = 0; i < count; i++) {
    const xx = x + i * gap;
    r(ctx, xx - 2, y - 13, 5, 17, "#5c5839");
    r(ctx, xx - 1, y - 14, 3, 17, "#b0905b");
    r(ctx, xx - 1, y - 14, 3, 2, "#d1b57b");
    r(ctx, xx, y - 10, 1, 11, "#c5a56c");
    r(ctx, xx + 1, y - 10, 1, 11, "#947344");
  }
}

function windowBox(ctx: Ctx, x: number, y: number, w = 12) {
  r(ctx, x - 1, y - 1, w + 2, 15, "#5d563a");
  r(ctx, x, y, w, 12, "#f0dcb0");
  r(ctx, x + 2, y + 2, w - 4, 8, "#295d68");
  r(ctx, x + 3, y + 2, 2, 6, "#58888c");
  r(ctx, x + Math.floor(w / 2), y + 1, 1, 10, "#e1c68d");
  r(ctx, x + 1, y + 6, w - 2, 1, "#e1c68d");
  r(ctx, x - 2, y + 12, w + 4, 3, "#8e653d");
  r(ctx, x - 1, y + 12, w + 2, 1, "#c6a16a");
  for (let i = 0; i < 4; i++) {
    r(ctx, x + i * 3, y + 10, 3, 2, "#477544");
    r(ctx, x + i * 3, y + 9, 2, 1, i % 2 ? "#d4a079" : "#e8cc8c");
  }
}

function house(ctx: Ctx, x: number, y: number, s = 1, variant = 0) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(s, s);
  shadow(ctx, 4, 3, 39, 10);
  // Masonry base and warm timber body.
  r(ctx, -32, -34, 64, 38, "#4d5941");
  r(ctx, -30, -32, 60, 34, "#d0b17b");
  r(ctx, -28, -30, 56, 29, "#ddc493");
  r(ctx, -29, -29, 7, 30, "#c3a26e");
  r(ctx, 21, -30, 8, 31, "#b59664");
  for (let yy = -28; yy < -2; yy += 7) r(ctx, -28, yy, 57, 1, "#c1a574");
  r(ctx, -31, -33, 4, 35, "#6f5939");
  r(ctx, 27, -33, 4, 35, "#685438");
  r(ctx, -28, -3, 56, 4, "#816e49");
  // Tiled hipped roof, individually shaded staggered tiles.
  poly(
    ctx,
    [
      [-39, -31],
      [-32, -60],
      [0, -68],
      [33, -60],
      [40, -31],
      [31, -27],
      [-31, -27],
    ],
    "#294e49",
  );
  poly(
    ctx,
    [
      [-36, -33],
      [-30, -59],
      [0, -65],
      [31, -59],
      [37, -33],
      [28, -30],
      [-28, -30],
    ],
    C.roofDark,
  );
  for (let row = 0; row < 4; row++) {
    const yy = -59 + row * 7,
      left = -29 - row * 2,
      right = 30 + row * 2;
    for (let xx = left + (row % 2 ? -3 : 0); xx < right; xx += 8) {
      const start = Math.max(left, xx),
        end = Math.min(right, xx + 7);
      r(
        ctx,
        start,
        yy,
        end - start,
        6,
        (Math.floor(xx / 8) + row) % 3 ? "#4c8589" : "#548f91",
      );
      r(ctx, start + 1, yy, end - start - 1, 1, "#6ca3a0");
      r(ctx, start, yy + 5, end - start, 1, "#365f68");
    }
  }
  line(ctx, -34, -33, 0, -46, "#5a5035", 4);
  line(ctx, 0, -46, 35, -33, "#5a5035", 4);
  line(ctx, -34, -34, 0, -47, "#c59a5d", 2);
  line(ctx, 0, -47, 35, -34, "#c59a5d", 2);
  // Front gable and projecting porch.
  poly(
    ctx,
    [
      [-15, -33],
      [0, -47],
      [15, -33],
      [15, 1],
      [-15, 1],
    ],
    "#66573b",
  );
  poly(
    ctx,
    [
      [-12, -32],
      [0, -43],
      [12, -32],
      [12, -1],
      [-12, -1],
    ],
    "#dbbf8a",
  );
  r(ctx, -2, -41, 4, 13, "#806440");
  r(ctx, -13, -31, 26, 3, "#8d6c40");
  r(ctx, -7, -24, 15, 26, "#6a5235");
  r(ctx, -5, -22, 11, 23, "#a9824d");
  r(ctx, -4, -21, 9, 1, "#c49d63");
  r(ctx, -1, -19, 1, 18, "#8d673e");
  r(ctx, 3, -10, 2, 2, "#efd69a");
  r(ctx, -6, 0, 14, 3, "#a58a5c");
  r(ctx, -9, 3, 20, 3, "#ceb27a");
  windowBox(ctx, -25, -23, 11);
  windowBox(ctx, 16, -23, 11);
  // Chimney: blocky stone with offset mortar.
  r(ctx, 20, -72, 8, 18, "#4d5850");
  r(ctx, 21, -71, 6, 16, "#a99573");
  r(ctx, 19, -73, 10, 3, "#4f5a50");
  r(ctx, 20, -73, 8, 1, "#d0b88a");
  r(ctx, 21, -65, 6, 1, "#776f56");
  r(ctx, 24, -70, 1, 5, "#81765b");
  r(ctx, 23, -64, 1, 5, "#81765b");
  bush(ctx, -34, 2, 0.6);
  bush(ctx, 33, 2, 0.65);
  if (variant === 1) {
    r(ctx, 34, -13, 12, 14, "#655d3c");
    r(ctx, 35, -12, 10, 12, "#b9935c");
    r(ctx, 35, -9, 10, 2, "#7d6e46");
    r(ctx, 35, -3, 10, 2, "#7d6e46");
  }
  ctx.restore();
}

function smoke(ctx: Ctx, x: number, y: number, frame: number) {
  // Sparse, softly translucent square clusters; still locked to the grid.
  for (let i = 0; i < 3; i++) {
    const phase = (frame / 5 + i * 10) % 32,
      xx = x + Math.floor(phase * 0.14 + Math.sin(phase * 0.3) * 1.5),
      yy = y - Math.floor(phase * 0.45);
    ctx.save();
    ctx.globalAlpha = (1 - phase / 36) * 0.2;
    r(ctx, xx, yy, 5, 3, "#e6ddbb");
    r(ctx, xx + 1, yy - 2, 4, 3, "#e6ddbb");
    ctx.restore();
  }
}

function sheep(
  ctx: Ctx,
  x: number,
  y: number,
  frame: number,
  id: number,
  tint = 0,
) {
  const walk = Math.sin(frame / 18 + id * 3.1);
  const xx = Math.round(x + Math.sin(frame / 90 + id * 7) * 1.4),
    yy = Math.round(y);
  const facing = id % 2 ? -1 : 1;
  ctx.save();
  ctx.translate(xx, yy);
  ctx.scale(facing, 1);
  shadow(ctx, 0, 2, 8, 3);
  const wool = tint ? "#d9c4a4" : "#e4e2bd",
    light = tint ? "#e8d4b3" : "#f6f0ce";
  r(ctx, -5, 0, 2, 5 + (walk > 0.4 ? 1 : 0), "#3e5546");
  r(ctx, 3, 0, 2, 5 + (walk < -0.4 ? 1 : 0), "#3e5546");
  ellipse(ctx, -1, -4, 8, 6, "#486052");
  ellipse(ctx, -5, -5, 4, 4, wool);
  ellipse(ctx, 0, -7, 5, 4, wool);
  ellipse(ctx, 4, -4, 4, 4, wool);
  ellipse(ctx, -1, -2, 6, 4, wool);
  r(ctx, -5, -8, 3, 1, light);
  r(ctx, -2, -10, 4, 2, light);
  r(ctx, 2, -8, 3, 1, light);
  r(ctx, -6, -5, 2, 2, light);
  r(ctx, -3, 0, 4, 1, "#b4c0a3");
  ellipse(ctx, 7, -3, 4, 4, "#405b51");
  ellipse(ctx, 8, -3, 3, 3, "#66796b");
  r(ctx, 6, -7, 2, 3, "#3e564b");
  r(ctx, 9, -3, 1, 1, "#e9dfb2");
  r(ctx, 10, -1, 1, 1, "#2c4940");
  r(ctx, -9, -4, 2, 2, "#d0d4b0");
  ctx.restore();
}

function garden(ctx: Ctx, x: number, y: number) {
  r(ctx, x - 1, y - 1, 44, 22, "#6d7643");
  r(ctx, x, y, 42, 20, "#92794f");
  for (let row = 0; row < 3; row++) {
    r(ctx, x + 2, y + 3 + row * 6, 38, 2, "#725f41");
    for (let col = 0; col < 7; col++) {
      const xx = x + 4 + col * 5,
        yy = y + 2 + row * 6;
      r(ctx, xx, yy, 1, 4, "#3c6a3f");
      r(ctx, xx - 2, yy, 2, 2, "#709a4c");
      r(ctx, xx + 1, yy - 1, 2, 2, "#8eb15a");
      r(ctx, xx, yy - 2, 1, 2, "#a6bd66");
    }
  }
  fence(ctx, x - 2, y + 23, 4, 15);
}

function windmill(ctx: Ctx, x: number, y: number, frame: number) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  shadow(ctx, 6, 4, 21, 7);
  poly(
    ctx,
    [
      [-12, 1],
      [-7, -53],
      [7, -53],
      [12, 1],
    ],
    "#345749",
  );
  poly(
    ctx,
    [
      [-9, 0],
      [-5, -52],
      [4, -52],
      [9, 0],
    ],
    "#bfaa75",
  );
  poly(
    ctx,
    [
      [2, -51],
      [5, -51],
      [9, 0],
      [2, 0],
    ],
    "#9a865d",
  );
  r(ctx, -9, -12, 18, 3, "#8d784e");
  r(ctx, -7, -31, 14, 3, "#8d784e");
  r(ctx, -13, -5, 7, 10, "#4b5940");
  r(ctx, 7, -5, 7, 10, "#4b5940");
  r(ctx, -12, -4, 5, 8, "#a98c59");
  r(ctx, 8, -4, 5, 8, "#a98c59");
  r(ctx, -11, -4, 3, 1, "#d5b77b");
  r(ctx, 8, -4, 3, 1, "#d5b77b");
  const ang = (frame / 150) * 0.7 - 0.45;
  const turn = (px: number, py: number, a: number): Point => [
    Math.round(px * Math.cos(a) - py * Math.sin(a)),
    Math.round(px * Math.sin(a) + py * Math.cos(a) - 51),
  ];
  for (let i = 0; i < 4; i++) {
    const a = ang + (i * Math.PI) / 2;
    const blade = [
      [-2, -5],
      [-4, -14],
      [-5, -35],
      [0, -41],
      [5, -38],
      [5, -15],
      [2, -5],
    ] as Point[];
    poly(
      ctx,
      blade.map((p) => turn(p[0], p[1], a)),
      "#3d5d50",
    );
    const fill = [
      [-1, -7],
      [-3, -15],
      [-4, -34],
      [0, -39],
      [3, -37],
      [3, -16],
      [1, -7],
    ] as Point[];
    poly(
      ctx,
      fill.map((p) => turn(p[0], p[1], a)),
      "#e3dfb3",
    );
    const shade = [
      [-1, -10],
      [-2, -31],
      [0, -36],
      [1, -17],
      [1, -9],
    ] as Point[];
    poly(
      ctx,
      shade.map((p) => turn(p[0], p[1], a)),
      "#f3e9bf",
    );
    for (let k = 16; k < 36; k += 6) {
      const p1 = turn(-3, -k, a),
        p2 = turn(3, -k, a);
      line(ctx, p1[0], p1[1], p2[0], p2[1], "#b3b794");
    }
  }
  ellipse(ctx, 0, -51, 6, 6, "#3b5848");
  ellipse(ctx, 0, -51, 4, 4, "#b79c65");
  ellipse(ctx, -1, -52, 2, 2, "#e7cf96");
  ctx.restore();
}

function sign(ctx: Ctx, x: number, y: number, dir: 1 | -1) {
  shadow(ctx, x, y + 1, 6, 2);
  r(ctx, x - 1, y - 13, 3, 15, "#655d3e");
  r(ctx, x, y - 12, 1, 13, "#c19f66");
  poly(
    ctx,
    [
      [x - 9, y - 17],
      [x + 6, y - 17],
      [x + 10, y - 13],
      [x + 6, y - 9],
      [x - 9, y - 9],
    ],
    "#5d583d",
  );
  poly(
    ctx,
    [
      [x - 8, y - 16],
      [x + 5, y - 16],
      [x + 8, y - 13],
      [x + 5, y - 10],
      [x - 8, y - 10],
    ],
    "#bd9d69",
  );
  line(ctx, x - 5, y - 13, x + 4, y - 13, "#f0dbab");
  line(
    ctx,
    x + (dir === 1 ? 4 : -5),
    y - 13,
    x + (dir === 1 ? 1 : -2),
    y - 15,
    "#f0dbab",
  );
  line(
    ctx,
    x + (dir === 1 ? 4 : -5),
    y - 13,
    x + (dir === 1 ? 1 : -2),
    y - 11,
    "#f0dbab",
  );
}

/** Draw at 640 × 360 with imageSmoothingEnabled=false. Frame assumes 30 fps. */
export function drawWorld(ctx: CanvasRenderingContext2D, frame: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ground(ctx);
  river(ctx, frame);
  bridge(ctx, 109);
  bridge(ctx, 278);
  brokenBridge(ctx);

  // Perimeter: tall organic silhouettes frame an open central stage.
  oak(ctx, 19, 60, 1.12);
  pine(ctx, 51, 39, 0.85);
  oak(ctx, 110, 32, 0.95, true);
  oak(ctx, 188, 31, 0.88);
  pine(ctx, 228, 38, 0.79);
  bush(ctx, 277, 19, 0.95);
  oak(ctx, 603, 57, 1.14);
  pine(ctx, 635, 105, 1.14);
  oak(ctx, 81, 111, 1.18, true);
  pine(ctx, 35, 150, 1.06);
  bush(ctx, 12, 178, 1.1);
  pine(ctx, 619, 211, 1.15);
  oak(ctx, 647, 268, 1.0, true);
  oak(ctx, 27, 292, 1.1);
  pine(ctx, 57, 310, 0.88);

  rock(ctx, 185, 62, 0.9);
  rock(ctx, 207, 74, 0.55);
  rock(ctx, 288, 55, 0.65);
  rock(ctx, 407, 42, 0.72);
  rock(ctx, 596, 108, 0.75);
  rock(ctx, 597, 283, 0.8);
  rock(ctx, 102, 248, 0.7);
  rock(ctx, 123, 263, 0.45);
  rock(ctx, 218, 282, 0.65);
  bush(ctx, 197, 117, 0.75);
  bush(ctx, 224, 92, 0.55);
  bush(ctx, 396, 153, 0.6);
  flowers(ctx, 110, 117, "#d4b571", 8, 11);
  flowers(ctx, 177, 91, "#e4ddac", 6, 13);
  flowers(ctx, 197, 254, "#c9bb83", 5, 17);
  flowers(ctx, 400, 256, "#dfcba3", 6, 19);
  flowers(ctx, 573, 236, "#deb394", 8, 23);

  // Left pasture: low fences and grazing sheep echo the provided reference.
  fence(ctx, 104, 158, 6, 19);
  fence(ctx, 102, 270, 5, 19);
  sign(ctx, 76, 193, 1);
  sheep(ctx, 131, 135, frame, 1);
  sheep(ctx, 180, 136, frame, 2, 1);
  sheep(ctx, 153, 181, frame, 3);
  sheep(ctx, 113, 233, frame, 4);
  sheep(ctx, 164, 249, frame, 5);
  sheep(ctx, 202, 227, frame, 6);

  // Upper village, designed to remain legible at the final wide reveal.
  garden(ctx, 462, 116);
  house(ctx, 461, 96, 0.9, 0);
  smoke(ctx, 481, 29, frame);
  fence(ctx, 507, 93, 4, 17);
  bush(ctx, 566, 85, 0.8);
  flowers(ctx, 512, 99, "#d6b397", 8, 27);
  sheep(ctx, 421, 142, frame, 7);
  windmill(ctx, 550, 184, frame);
  sign(ctx, 402, 194, 1);

  // A second home and small garden beyond the southern crossing.
  house(ctx, 499, 270, 0.88, 1);
  smoke(ctx, 518, 205, frame + 35);
  garden(ctx, 548, 268);
  bush(ctx, 427, 291, 0.7);
  flowers(ctx, 455, 280, "#e8cd90", 6, 29);
  sheep(ctx, 446, 231, frame, 8);
  sheep(ctx, 576, 213, frame, 9, 1);
  pine(ctx, 594, 306, 0.83);

  // Foreground foliage stops above the subtitle-safe lower edge.
  bush(ctx, 10, 320, 0.8);
  bush(ctx, 625, 327, 1.0);
  ctx.restore();
}
