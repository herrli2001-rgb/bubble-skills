import { AbsoluteFill } from "remotion";
import { ease } from "./actors";

// Screen-space dialogue surrounds a deliberately quiet, unobstructed centre.
// Every new voice stays on screen; the pressure accumulates without shaking.
export const pressureLines = [
  {
    start: 30,
    x: 480,
    y: 222,
    w: 360,
    lines: ["你为什么", "还不结婚？"],
    tail: "bottom",
    tailAt: 36,
  },
  {
    start: 58,
    x: 1110,
    y: 222,
    w: 390,
    lines: ["都33岁了，", "还不着急？"],
    tail: "bottom",
    tailAt: 282,
  },
  {
    start: 86,
    x: 66,
    y: 456,
    w: 396,
    lines: ["别再挑了，", "差不多就行了！"],
    tail: "right",
    tailAt: 66,
  },
  {
    start: 114,
    x: 1464,
    y: 456,
    w: 390,
    lines: ["别人孩子", "都上学了！"],
    tail: "left",
    tailAt: 66,
  },
  {
    start: 142,
    x: 105,
    y: 678,
    w: 420,
    lines: ["你让爸妈", "多操心！"],
    tail: "right",
    tailAt: 42,
  },
  {
    start: 170,
    x: 1395,
    y: 678,
    w: 420,
    lines: ["再拖下去，", "就来不及了！"],
    tail: "left",
    tailAt: 42,
  },
] as const;

export function PressureVoices({
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
            "radial-gradient(ellipse at 51.5% 55%, transparent 13%, #472d2c36 57%, #361f285c 100%)",
          opacity: ease((frame - 30) / 150) * visibility,
        }}
      />
      {pressureLines.map((voice, i) => {
        if (frame < voice.start) return null;
        const enter = ease((frame - voice.start) / 10);
        const border = i < 2 ? "#716049" : i < 4 ? "#95634d" : "#a45245";
        const background = i < 2 ? "#fff0c3" : i < 4 ? "#f5dfb2" : "#f4cfaa";
        const horizontal = voice.tail !== "bottom";
        return (
          <div
            key={voice.start}
            style={{
              position: "absolute",
              left: voice.x,
              top: voice.y,
              width: voice.w,
              height: 144,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "Fusion Pixel",
              fontSize: 48,
              lineHeight: "60px",
              whiteSpace: "nowrap",
              color: "#5b4031",
              border: `6px solid ${border}`,
              background,
              boxShadow: `9px 9px 0 #243a3955`,
              opacity: enter * visibility,
              translate: `${Math.round((1 - enter) * (voice.x < 960 ? -18 : 18))}px 0`,
            }}
          >
            {voice.lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div
              style={{
                position: "absolute",
                background: border,
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
                background,
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
