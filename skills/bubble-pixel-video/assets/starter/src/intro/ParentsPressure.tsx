import { AbsoluteFill } from "remotion";
import { ease } from "./actors";

// Source-frame timings: SceneRenderer supplies the 1.5× playback clock.
// Earlier voices remain visible so each new sentence adds pressure.
// The actor corridor (y 530..735) and subtitle area (y >=864) stay clear.
export const parentLines = [
  {
    start: 34,
    x: 318,
    y: 192,
    w: 550,
    h: 96,
    size: 48,
    lines: ["连大学都没考上！"],
    tail: "bottom",
    tailAt: 300,
  },
  {
    start: 50,
    x: 1050,
    y: 192,
    w: 550,
    h: 96,
    size: 48,
    lines: ["要你有什么用！"],
    tail: "bottom",
    tailAt: 226,
  },
  {
    start: 68,
    x: 84,
    y: 348,
    w: 360,
    h: 90,
    size: 36,
    lines: ["你看看别人！"],
    tail: "right",
    tailAt: 30,
  },
  {
    start: 84,
    x: 1476,
    y: 348,
    w: 360,
    h: 90,
    size: 36,
    lines: ["天天就知道玩！"],
    tail: "left",
    tailAt: 30,
  },
  {
    start: 100,
    x: 474,
    y: 356,
    w: 426,
    h: 144,
    size: 48,
    lines: ["考成这样，", "以后怎么办？"],
    tail: "bottom",
    tailAt: 155,
  },
  {
    start: 116,
    x: 1020,
    y: 356,
    w: 426,
    h: 144,
    size: 48,
    lines: ["我们这么辛苦，", "你对得起谁？"],
    tail: "bottom",
    tailAt: 255,
  },
  {
    start: 132,
    x: 120,
    y: 660,
    w: 432,
    h: 108,
    size: 48,
    lines: ["一点都不争气！"],
    tail: "right",
    tailAt: 24,
  },
  {
    start: 148,
    x: 1368,
    y: 660,
    w: 432,
    h: 108,
    size: 48,
    lines: ["太让我们失望了！"],
    tail: "left",
    tailAt: 24,
  },
] as const;

const palettes = [
  { border: "#716049", background: "#fff0c3", text: "#5b4031" },
  { border: "#8d624a", background: "#f5dfb2", text: "#68432f" },
  { border: "#a65f46", background: "#f2d0a7", text: "#773f2d" },
  { border: "#ac4d40", background: "#efbda0", text: "#78372b" },
] as const;

export function ParentsPressure({
  frame,
  visibility,
}: {
  frame: number;
  visibility: number;
}) {
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 61%, transparent 20%, #59332a24 62%, #331d2648 100%)",
          opacity: ease((frame - 34) / 114) * visibility,
        }}
      />
      {parentLines.map((voice, i) => {
        if (frame < voice.start) return null;
        const enter = ease((frame - voice.start) / 6);
        const palette = palettes[Math.floor(i / 2)];
        const horizontal = voice.tail !== "bottom";
        return (
          <div
            key={voice.start}
            style={{
              position: "absolute",
              pointerEvents: "none",
              left: voice.x,
              top: voice.y,
              width: voice.w,
              height: voice.h,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "Fusion Pixel",
              fontSize: voice.size,
              lineHeight: voice.size === 36 ? "48px" : "60px",
              whiteSpace: "nowrap",
              color: palette.text,
              border: `6px solid ${palette.border}`,
              background: palette.background,
              boxShadow: "9px 9px 0 #27373455",
              opacity: enter * visibility,
              // One short pop, then a perfectly fixed box. The scene never shakes.
              scale: 0.96 + 0.04 * enter,
              transformOrigin:
                voice.tail === "bottom"
                  ? `${voice.tailAt + 15}px bottom`
                  : voice.tail === "left"
                    ? "left center"
                    : "right center",
            }}
          >
            {voice.lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div
              style={{
                position: "absolute",
                background: palette.border,
                width: horizontal ? 24 : 30,
                height: horizontal ? 30 : 24,
                ...(voice.tail === "bottom"
                  ? { left: voice.tailAt, bottom: -24 }
                  : voice.tail === "left"
                    ? { left: -24, top: voice.tailAt }
                    : { right: -24, top: voice.tailAt }),
              }}
            />
            <div
              style={{
                position: "absolute",
                background: palette.background,
                width: horizontal ? 24 : 18,
                height: horizontal ? 18 : 24,
                ...(voice.tail === "bottom"
                  ? { left: voice.tailAt + 6, bottom: -18 }
                  : voice.tail === "left"
                    ? { left: -18, top: voice.tailAt + 6 }
                    : { right: -18, top: voice.tailAt + 6 }),
              }}
            />
          </div>
        );
      })}
    </>
  );
}
