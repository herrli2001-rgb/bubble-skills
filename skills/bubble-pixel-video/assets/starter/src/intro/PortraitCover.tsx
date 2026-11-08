import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { project } from "../project";
import {
  coverRect as r,
  coverOval as oval,
  coverPanel as panel,
  drawCoverHero,
} from "./Cover";

type Ctx = CanvasRenderingContext2D;
function hash(n: number, salt: number) {
  let v = Math.imul(n + 31, 374761393) ^ Math.imul(salt + 17, 668265263);
  v = Math.imul(v ^ (v >>> 13), 1274126177);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
}
function pine(c: Ctx, x: number, y: number, size: number) {
  oval(c, x + 3, y + 2, 20 * size, 5 * size, "#1a3d32");
  r(c, x - 2 * size, y - 13 * size, 5 * size, 15 * size, "#546044");
  for (let tier = 0; tier < 3; tier++) {
    const top = y - (70 - tier * 16) * size;
    const h = (29 + tier * 3) * size;
    for (let yy = 0; yy < h; yy++) {
      const half = Math.floor(yy * 0.56);
      r(
        c,
        x - half,
        top + yy,
        half * 2 + 1,
        1,
        tier % 2 ? "#2b5a46" : "#32644c",
      );
      if (yy > 5)
        r(c, x - half + 2, top + yy, Math.max(1, half - 2), 1, "#3b6a4f");
    }
    r(c, x - 3, top + h - 2, 7, 2, "#284e3d");
  }
}
function shrub(c: Ctx, x: number, y: number, rx: number) {
  oval(c, x + 2, y + 4, rx, rx * 0.35, "#1c4034");
  oval(c, x, y, rx, rx * 0.75, "#2d5a43");
  oval(c, x - rx * 0.25, y - rx * 0.2, rx * 0.7, rx * 0.6, "#37644a");
  for (let i = 0; i < 16; i++) {
    const xx = x + Math.round((hash(i, x) - 0.5) * rx * 1.5);
    const yy = y + Math.round((hash(i, y) - 0.5) * rx);
    r(c, xx, yy, 2, 1, "#467253");
  }
}
function cottage(c: Ctx, x: number, y: number) {
  oval(c, x + 3, y + 3, 31, 7, "#1c4034");
  r(c, x - 23, y - 33, 46, 34, "#5f6247");
  r(c, x - 20, y - 31, 40, 29, "#85805b");
  r(c, x - 22, y - 9, 44, 2, "#696c4e");
  r(c, x - 19, y - 27, 3, 26, "#6b6648");
  r(c, x + 16, y - 27, 3, 26, "#6b6648");
  for (let row = 0; row < 21; row++) {
    const half = 14 + Math.floor(row * 0.72);
    r(
      c,
      x - half,
      y - 52 + row,
      half * 2,
      1,
      row === 20 ? "#3b5544" : "#3d6964",
    );
    if (row % 6 === 0)
      r(c, x - half + 2, y - 52 + row, half * 2 - 4, 1, "#537f71");
    for (let col = -1; col < 3; col++)
      if (row % 6 !== 0)
        r(
          c,
          x - 17 + col * 12 + (Math.floor(row / 6) % 2) * 6,
          y - 52 + row,
          1,
          1,
          "#305b58",
        );
  }
  r(c, x + 12, y - 61, 5, 18, "#6c7153");
  r(c, x + 11, y - 62, 7, 3, "#8a8960");
  r(c, x - 5, y - 20, 11, 21, "#5c634b");
  r(c, x - 3, y - 18, 7, 17, "#8f8255");
  r(c, x + 2, y - 10, 1, 2, "#d1bc7a");
  for (const side of [-1, 1]) {
    const xx = x + side * 13;
    r(c, xx - 5, y - 24, 10, 12, "#3b5747");
    r(c, xx - 3, y - 22, 6, 8, "#b5ad70");
    r(c, xx - 2, y - 21, 2, 6, "#d6c283");
    r(c, xx - 1, y - 22, 1, 8, "#6a7857");
    r(c, xx - 3, y - 18, 6, 1, "#6a7857");
  }
}

// A native 360 × 640 scene, not a crop or resize of the landscape poster.
function drawPortrait(c: Ctx) {
  r(c, 0, 0, 360, 640, "#2d5540");
  for (let i = 0; i < 3900; i++) {
    const x = Math.floor(hash(i, 1) * 360),
      y = Math.floor(hash(i, 2) * 640);
    r(
      c,
      x,
      y,
      i % 8 === 0 ? 3 : 2,
      1,
      ["#345d43", "#31583f", "#3a6246", "#284f3d"][i % 4],
    );
  }
  // The river and banks are generated specifically down the taller canvas.
  for (let y = 0; y < 640; y++) {
    const x = Math.round(286 + Math.sin(y / 71) * 16 + Math.sin(y / 163) * 9);
    r(c, x - 21, y, 42, 1, "#3c6047");
    r(c, x - 18, y, 36, 1, "#617050");
    r(c, x - 15, y, 30, 1, "#386c64");
    r(c, x - 10, y, 20, 1, "#32615e");
    if (y % 13 === 0) {
      r(c, x - 8, y, 9, 1, "#477b70");
      r(c, x + 4, y + 3, 6, 1, "#416f66");
    }
  }
  pine(c, 30, 104, 1.2);
  pine(c, 344, 156, 0.95);
  shrub(c, 87, 38, 29);
  shrub(c, 329, 31, 36);
  pine(c, 14, 428, 1.3);
  pine(c, 343, 428, 1);
  shrub(c, 24, 589, 32);
  shrub(c, 349, 601, 35);
  pine(c, 68, 639, 1.15);
  pine(c, 333, 634, 0.9);
  // Subtle stepping stones guide the eye from the footer to the contemplative figure.
  for (let i = 0; i < 8; i++) {
    const y = 624 - i * 15,
      x = 152 + Math.round(Math.sin(i * 0.45) * 19);
    oval(c, x, y, 10 - i * 0.5, 4, "#58684a");
    r(c, x - 5, y - 2, 9, 1, "#687450");
  }
  cottage(c, 247, 574);
  // Low fences at the edges frame the scene without competing with the figure.
  for (const start of [30, 282]) {
    r(c, start, 512, 42, 2, "#5c6749");
    r(c, start, 520, 42, 2, "#5c6749");
    for (let x = start; x <= start + 42; x += 21) {
      r(c, x, 507, 3, 20, "#716f4c");
      r(c, x, 507, 2, 2, "#92905d");
    }
  }
  c.save();
  c.globalAlpha = 0.1;
  r(c, 0, 0, 360, 640, "#143d37");
  c.restore();
  c.save();
  c.globalAlpha = 0.13;
  oval(c, 180, 489, 45, 23, "#e0bd73");
  c.globalAlpha = 0.08;
  oval(c, 180, 489, 31, 15, "#f0d38a");
  c.restore();
  r(c, 204, 492, 2, 9, "#91a66b");
  r(c, 200, 488, 5, 4, "#a6ba78");
  r(c, 205, 484, 5, 5, "#b8c884");
  c.save();
  c.translate(180 - 320, 490 - 316);
  drawCoverHero(c);
  c.restore();
  // Portrait thought cloud has its own proportions, spacing, and centre of mass.
  c.save();
  c.globalAlpha = 0.3;
  panel(c, 18, 94, 328, 240, "#122e2c");
  c.restore();
  panel(c, 16, 90, 328, 240, "#395443");
  panel(c, 19, 93, 322, 234, "#b5a476");
  panel(c, 21, 95, 318, 230, "#f1e4b9");
  r(c, 34, 96, 292, 1, "#fff2ce");
  r(c, 23, 108, 1, 204, "#fbefc8");
  r(c, 35, 323, 290, 1, "#d8c99d");
  for (let i = 0; i < 35; i++) {
    const x = 36 + ((i * 47) % 288),
      y = 107 + ((i * 31) % 206);
    if (x > 39 && x < 321 && y > 130 && y < 290) continue;
    r(c, x, y, 1, 1, i % 2 ? "#e6d8ac" : "#f8edc8");
  }
  for (const dot of [
    { x: 180, y: 360, rx: 10, ry: 9 },
    { x: 174, y: 394, rx: 7, ry: 6 },
    { x: 180, y: 428, rx: 4, ry: 4 },
  ]) {
    oval(c, dot.x + 1, dot.y + 1, dot.rx + 1, dot.ry + 1, "#234536");
    oval(c, dot.x, dot.y, dot.rx, dot.ry, "#f1e4b9");
    if (dot.rx > 4) r(c, dot.x - 2, dot.y - dot.ry + 1, 4, 1, "#fff1ce");
  }
}

/** Native 1080 × 1920 poster, with no audio or motion. */
export function PortraitCover() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = canvas.current?.getContext("2d");
    if (c) {
      c.imageSmoothingEnabled = false;
      drawPortrait(c);
    }
  }, []);
  return (
    <AbsoluteFill style={{ backgroundColor: "#173c36" }}>
      <canvas
        ref={canvas}
        width={360}
        height={640}
        style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
      />
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 270,
          width: 984,
          height: 720,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Fusion Pixel",
          color: "#365344",
          whiteSpace: "nowrap",
          fontSize: 144,
          lineHeight: "192px",
          textAlign: "center",
          textShadow: "0 6px 0 #d3c398",
        }}
      >
        <div>{project.portraitTitleLines[0]}</div>
        <div
          style={{
            fontSize: 156,
            lineHeight: "204px",
            color: "#a46c3c",
            textShadow: "0 6px 0 #ddc395",
          }}
        >
          {project.portraitTitleLines[1]}
        </div>
      </div>
    </AbsoluteFill>
  );
}
