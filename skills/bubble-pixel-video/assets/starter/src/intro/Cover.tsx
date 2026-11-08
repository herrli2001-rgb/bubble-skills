import { useLayoutEffect, useRef } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { drawWorld } from "../world";
import { project } from "../project";

loadFont({
  family: "Fusion Pixel",
  url: staticFile("fonts/fusion-pixel-12px-monospaced-zh_hans.ttf.woff2"),
});

type Ctx = CanvasRenderingContext2D;
const rect = (
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) => {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
function oval(
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    const f = 1 - (dy * dy) / (ry * ry);
    if (f < 0) continue;
    const dx = Math.floor(Math.sqrt(f) * rx);
    c.fillRect(Math.round(x) - dx, Math.round(y) + dy, dx * 2 + 1, 1);
  }
}

// Stepped corners keep the thought cloud in the same pixel vocabulary as the film.
function pixelPanel(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  rect(c, x + 12, y, w - 24, h, color);
  rect(c, x + 6, y + 6, w - 12, h - 12, color);
  rect(c, x, y + 12, w, h - 24, color);
}

function hero(c: Ctx) {
  c.save();
  // A small, steady protagonist. One hand at the chin conveys thinking, not panic.
  c.translate(320, 316);
  c.globalAlpha = 0.28;
  oval(c, 1, 1, 14, 4, "#0e2829");
  c.globalAlpha = 1;
  rect(c, -6, -10, 5, 10, "#344c55");
  rect(c, 2, -10, 5, 10, "#344c55");
  rect(c, -7, -1, 7, 3, "#233a3d");
  rect(c, 2, -1, 7, 3, "#233a3d");
  rect(c, -5, -8, 2, 7, "#60716d");
  rect(c, -8, -23, 17, 14, "#685139");
  rect(c, -7, -22, 15, 13, "#d5a453");
  rect(c, -5, -21, 2, 10, "#efd18a");
  rect(c, 5, -20, 3, 10, "#b78345");
  rect(c, -3, -24, 6, 4, "#edc18b");
  rect(c, -5, -22, 10, 2, "#b75946");
  rect(c, -5, -20, 2, 5, "#d37952");
  rect(c, -10, -20, 4, 11, "#c5954c");
  rect(c, -10, -10, 4, 4, "#e6b783");
  rect(c, 7, -20, 4, 9, "#c5954c");
  rect(c, 4, -15, 6, 4, "#ebbf88");
  rect(c, -8, -35, 17, 15, "#4c3c31");
  rect(c, -7, -32, 15, 12, "#efc38b");
  rect(c, 6, -30, 2, 8, "#d59b70");
  rect(c, -9, -34, 19, 6, "#654731");
  rect(c, -6, -37, 13, 4, "#654731");
  rect(c, -3, -38, 7, 2, "#654731");
  rect(c, -8, -29, 4, 4, "#654731");
  rect(c, -5, -35, 9, 2, "#956a43");
  rect(c, -3, -28, 3, 1, "#7d553a");
  rect(c, 4, -28, 3, 1, "#7d553a");
  rect(c, -2, -26, 2, 2, "#353b35");
  rect(c, 4, -26, 2, 2, "#353b35");
  rect(c, 1, -23, 2, 1, "#c28a63");
  rect(c, 0, -21, 4, 1, "#9b7053");
  // Forearm and fingertips are drawn after the face so the thinking pose is legible.
  rect(c, 5, -22, 4, 8, "#efc38b");
  rect(c, 3, -23, 5, 3, "#f5d19a");
  rect(c, 7, -20, 2, 5, "#d9a575");
  c.restore();
}

function background(c: Ctx) {
  // All scenery uses a single frozen world frame: there is no camera movement,
  // animated texture, sheep motion, blink or per-frame random variation on the cover.
  drawWorld(c, 90);
  c.save();
  c.globalAlpha = 0.66;
  rect(c, 0, 0, 640, 360, "#173c36");
  c.globalAlpha = 0.16;
  rect(c, 0, 0, 640, 360, "#153e3b");
  c.globalAlpha = 0.12;
  oval(c, 320, 310, 64, 27, "#e0bd73");
  c.globalAlpha = 0.09;
  oval(c, 320, 311, 43, 18, "#f0d38a");
  c.restore();
  // A few intentional illuminated blades of grass, a quiet hopeful detail.
  rect(c, 346, 315, 2, 8, "#91a66b");
  rect(c, 342, 312, 5, 4, "#a6ba78");
  rect(c, 347, 308, 5, 5, "#b8c884");
  rect(c, 345, 312, 3, 3, "#bed18c");
  rect(c, 288, 323, 2, 3, "#80965d");
  rect(c, 286, 321, 2, 2, "#91a768");
  hero(c);
}

function thoughtCloud(c: Ctx) {
  c.clearRect(0, 0, 640, 360);
  c.save();
  c.globalAlpha = 0.32;
  pixelPanel(c, 58, 32, 528, 200, "#102d2c");
  c.restore();
  pixelPanel(c, 56, 28, 528, 200, "#395443");
  pixelPanel(c, 59, 31, 522, 194, "#b5a476");
  pixelPanel(c, 61, 33, 518, 190, "#f1e4b9");
  // Paper highlights are discrete pixels, rather than blur or a glossy gradient.
  rect(c, 74, 34, 490, 1, "#fff2ce");
  rect(c, 63, 46, 1, 162, "#fbefc8");
  rect(c, 75, 221, 488, 1, "#d8c99d");
  for (let i = 0; i < 58; i++) {
    const x = 80 + ((i * 83) % 480);
    const y = 43 + ((i * 47) % 172);
    if (x > 106 && x < 534 && y > 54 && y < 207) continue;
    rect(c, x, y, 1, 1, i % 2 ? "#e6d8ac" : "#f8edc8");
  }
  // Descending thought dots meet the small figure without touching the head.
  const dots = [
    { x: 320, y: 240, rx: 8, ry: 7 },
    { x: 316, y: 256, rx: 5, ry: 4 },
    { x: 320, y: 269, rx: 3, ry: 3 },
  ];
  for (const dot of dots) {
    oval(c, dot.x + 1, dot.y + 1, dot.rx + 1, dot.ry + 1, "#234536");
    oval(c, dot.x, dot.y, dot.rx, dot.ry, "#f1e4b9");
    if (dot.rx > 3) rect(c, dot.x - 2, dot.y - dot.ry + 1, 4, 1, "#fff1ce");
  }
}

// Shared drawing primitives; exporting them does not alter the landscape cover.
export {
  rect as coverRect,
  oval as coverOval,
  pixelPanel as coverPanel,
  hero as drawCoverHero,
};

/** Static poster by default; animated=true adds only a brief opacity reveal.
 * A 45-frame intro is fully formed by frame 14 and remains fixed at frame 30.
 */
export function Cover({ animated = false }: { animated?: boolean }) {
  const frame = useCurrentFrame();
  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const cloudRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const bg = backgroundRef.current?.getContext("2d");
    const cloud = cloudRef.current?.getContext("2d");
    if (bg) {
      bg.imageSmoothingEnabled = false;
      background(bg);
    }
    if (cloud) {
      cloud.imageSmoothingEnabled = false;
      thoughtCloud(cloud);
    }
  }, []);
  return (
    <AbsoluteFill style={{ backgroundColor: "#173c36" }}>
      <canvas
        ref={backgroundRef}
        width={640}
        height={360}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, transparent 37%, #0a292944 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: animated
            ? interpolate(frame, [0, 14], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1,
        }}
      >
        <canvas
          ref={cloudRef}
          width={640}
          height={360}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 168,
            top: 123,
            width: 1584,
            fontFamily: "Fusion Pixel",
            textAlign: "center",
            whiteSpace: "nowrap",
            color: "#365344",
            fontSize: 192,
            lineHeight: "246px",
            textShadow: "0 6px 0 #d3c398",
          }}
        >
          <div>{project.landscapeTitleLines[0]}</div>
          <div
            style={{
              fontSize: 204,
              color: "#a46c3c",
              textShadow: "0 6px 0 #ddc395",
            }}
          >
            {project.landscapeTitleLines[1]}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
