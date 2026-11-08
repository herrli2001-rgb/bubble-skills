import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { drawBedroom } from "./bedroom";
import { drawDorm } from "./dorm";
import { drawLiving } from "./living";
import { drawOffice } from "./office";
import { drawCast, ease, focalPose, roomCamera, type SceneId } from "./actors";
import { bubbles, sceneData, type Bubble } from "./script";
import { PressureVoices } from "./PressureVoices";
import { ParentsPressure } from "./ParentsPressure";
loadFont({
  family: "Fusion Pixel",
  url: staticFile("fonts/fusion-pixel-12px-monospaced-zh_hans.ttf.woff2"),
});
function Thought({
  bubble,
  frame,
  visibility,
}: {
  bubble: Bubble;
  frame: number;
  visibility: number;
}) {
  const b = bubble;
  if (frame < b.start || frame > b.end) return null;
  const cam = roomCamera(),
    x = Math.round((320 + (b.x - cam.x) * cam.zoom) * 3),
    y = Math.round((180 + (b.y - cam.y) * cam.zoom) * 3);
  const opacity =
    ease((frame - b.start) / 7) *
    (1 - ease((frame - b.end + 7) / 7)) *
    visibility;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -100%",
        opacity,
        padding: "14px 19px",
        border: "6px solid #65573f",
        background: "#fff0c3",
        boxShadow: "6px 6px 0 #263e3c40",
        fontFamily: "Fusion Pixel",
        fontSize: b.size ?? 36,
        lineHeight: 1.3,
        color: "#5b4c37",
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      {b.lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
      {b.thought ? (
        <>
          <div
            style={{
              position: "absolute",
              bottom: -17,
              left: "calc(50% - 8px)",
              width: 16,
              height: 13,
              background: "#fff0c3",
              border: "4px solid #65573f",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -29,
              left: "calc(50% - 3px)",
              width: 8,
              height: 8,
              background: "#fff0c3",
              border: "3px solid #65573f",
            }}
          />
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: "calc(50% - 12px)",
              bottom: -18,
              width: 24,
              height: 18,
              background: "#65573f",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "calc(50% - 6px)",
              bottom: -12,
              width: 12,
              height: 18,
              background: "#fff0c3",
            }}
          />
        </>
      )}
    </div>
  );
}
export function SceneRenderer({
  id,
  playbackRate = 1.5,
}: {
  id: SceneId;
  playbackRate?: number;
}) {
  const frame = useCurrentFrame() * playbackRate,
    ref = useRef<HTMLCanvasElement>(null),
    buffer = useRef<HTMLCanvasElement | null>(null);
  const data = sceneData[id],
    pose = focalPose(id, frame);
  useLayoutEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    if (!buffer.current) {
      buffer.current = document.createElement("canvas");
      buffer.current.width = 640;
      buffer.current.height = 360;
    }
    const w = buffer.current.getContext("2d")!;
    w.clearRect(0, 0, 640, 360);
    w.imageSmoothingEnabled = false;
    if (id === "bedroom") drawBedroom(w, frame);
    else if (id === "dorm") drawDorm(w, frame);
    else if (id === "office") drawOffice(w, frame);
    else drawLiving(w, frame, id);
    drawCast(w, id, frame);
    const cam = roomCamera();
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, 640, 360);
    c.drawImage(
      buffer.current,
      cam.x - 320 / cam.zoom,
      cam.y - 180 / cam.zoom,
      640 / cam.zoom,
      360 / cam.zoom,
      0,
      0,
      640,
      360,
    );
  }, [id, frame]);
  const enter = ease((frame - (id === "bedroom" ? 10 : 25)) / 13),
    leave = 1 - ease((frame - data.duration + 47) / 16);
  const ui = enter * leave;
  return (
    <AbsoluteFill style={{ background: "#2c4648" }}>
      <canvas
        ref={ref}
        width={640}
        height={360}
        style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 51% 42%, transparent 32%, #0c24242b 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg,#142d35d4 0%,#142d3555 18%,transparent 37%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 75,
          top: 52,
          opacity: ui,
          fontFamily: "Fusion Pixel",
          textShadow: "3px 3px 0 #263a36",
        }}
      >
        <div
          style={{
            fontSize: id === "bedroom" ? 60 : 72,
            lineHeight: 1.15,
            color: "#f8e6b9",
          }}
        >
          {id === "bedroom" ? "人生的容错率" : data.age}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#d7decc",
            marginTop: 15,
            letterSpacing: 3,
          }}
        >
          {id === "bedroom" ? "深夜 · 少年的书房" : data.place}
        </div>
      </div>
      {id === "relatives" && <PressureVoices frame={frame} visibility={ui} />}
      {id === "parents" && <ParentsPressure frame={frame} visibility={ui} />}
      {id !== "relatives" &&
        id !== "parents" &&
        bubbles(id, frame, pose.x).map((bubble, i) => (
          <Thought
            key={`${id}-${i}`}
            bubble={bubble}
            frame={frame}
            visibility={ui}
          />
        ))}
      {data.caption.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 100,
            right: 100,
            bottom: 60,
            textAlign: "center",
            fontFamily: "Fusion Pixel",
            fontSize: 60,
            lineHeight: "78px",
            color: "#fff1cf",
            textShadow: "0 5px 0 #203c39, 3px 0 0 #203c39",
            opacity: ui * ease((frame - 35) / 12),
          }}
        >
          <div>{data.caption[0]}</div>
          <div style={{ color: "#f1ce87" }}>{data.caption[1]}</div>
        </div>
      )}
    </AbsoluteFill>
  );
}
