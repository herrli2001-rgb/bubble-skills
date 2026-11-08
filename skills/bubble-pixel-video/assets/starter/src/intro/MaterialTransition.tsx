import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { ease } from "./actors";
type Kind = "door" | "paper" | "screen" | "carton";
type Props = { kind: Kind };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function Material({ kind, p }: { kind: Kind; p: number }) {
  if (p <= 0 || p >= 1) return null;
  const a = ease(p * 2),
    b = ease((p - 0.5) * 2);
  if (kind === "door") {
    const x = p < 0.5 ? lerp(2000, -140, a) : lerp(-140, -2530, b);
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: -100,
          width: 2220,
          height: 1280,
          background: "#465c53",
          borderLeft: "32px solid #c6ac79",
          borderRight: "40px solid #2b443e",
          boxShadow: "30px 0 0 #1d353460",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 72,
            right: 78,
            top: 70,
            bottom: 55,
            border: "22px solid #708074",
            boxShadow: "inset 15px 15px 0 #314d45",
            background: "#4b6558",
          }}
        />
        {[176, 748].map((y) => (
          <div
            key={y}
            style={{
              position: "absolute",
              left: 165,
              right: 165,
              top: y,
              height: 420,
              border: "16px solid #81917d",
              boxShadow: "inset 9px 9px 0 #314d45",
              background: "#536c5d",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 582,
            width: 54,
            height: 135,
            background: "#bda273",
            border: "12px solid #65583c",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 209,
            top: 597,
            width: 122,
            height: 29,
            background: "#e3cc91",
          }}
        />
      </div>
    );
  }
  if (kind === "paper") {
    const s = p < 0.5 ? lerp(0.055, 1.16, a) : lerp(1.16, 0.9, b),
      cx = p < 0.5 ? lerp(1000, 960, a) : lerp(960, -1800, b),
      cy = p < 0.5 ? lerp(688, 540, a) : lerp(540, -400, b);
    return (
      <div
        style={{
          position: "absolute",
          left: cx - 1190,
          top: cy - 790,
          width: 2380,
          height: 1580,
          scale: s,
          rotate: `${p < 0.5 ? lerp(-23, -3, a) : lerp(-3, 12, b)}deg`,
          background: "#e4d6ae",
          border: "18px solid #a79774",
          boxShadow: "24px 27px 0 #2d3e4566",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 124,
            top: 130,
            width: 500,
            height: 40,
            background: "#899b91",
          }}
        />
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 124,
              right: 170,
              top: 280 + i * 110,
              height: 8,
              background: "#a2afa14f",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            right: 166,
            top: 132,
            width: 188,
            height: 140,
            border: "18px solid #b978655e",
            rotate: "-9deg",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 80,
            bottom: 80,
            width: 8,
            background: "#c5947966",
          }}
        />
      </div>
    );
  }
  if (kind === "screen") {
    const w = lerp(88, 2360, a),
      h = lerp(66, 1410, a),
      cx = lerp(1100, 960, a),
      cy = lerp(601, 540, a);
    if (p <= 0.5)
      return (
        <div
          style={{
            position: "absolute",
            left: cx - w / 2,
            top: cy - h / 2,
            width: w,
            height: h,
            border: `${lerp(6, 28, a)}px solid #314a53`,
            background: "#6e9c9d",
            boxShadow: "12px 16px 0 #243b3d44",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${i * 5}%`,
                height: 3,
                background: "#a9c3b92b",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              top: "20%",
              height: "60%",
              border: "9px solid #c7d6b84d",
            }}
          />
        </div>
      );
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: -b * 1300 - 100,
            top: -100,
            width: 1100,
            height: 1300,
            background: "#729d9c",
            borderRight: "22px solid #304e58",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -b * 1300 - 100,
            top: -100,
            width: 1100,
            height: 1300,
            background: "#729d9c",
            borderLeft: "22px solid #304e58",
          }}
        />
      </>
    );
  }
  const cy = p < 0.5 ? lerp(1900, 500, a) : lerp(500, -1600, b);
  return (
    <div
      style={{
        position: "absolute",
        left: -250,
        top: cy - 790,
        width: 2420,
        height: 1580,
        rotate: `${lerp(-6, 4, p)}deg`,
        background: "#b28d59",
        border: "24px solid #785d3f",
        boxShadow: "0 24px 0 #253b3b55",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "46%",
          top: 0,
          bottom: 0,
          width: 155,
          background: "#dcc18a",
          borderLeft: "6px solid #c4a577",
          borderRight: "6px solid #9c7950",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "44%",
          height: 160,
          background: "#d8ba83",
          borderTop: "9px solid #c4a577",
          borderBottom: "9px solid #a68353",
        }}
      />
      {Array.from({ length: 14 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i * 113,
            left: 24,
            right: 24,
            height: 3,
            background: "#71583a15",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 250,
          width: 420,
          height: 240,
          background: "#e0d6b6",
          border: "9px solid #967d55",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 45,
            width: 240,
            height: 15,
            background: "#9d9d80",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 45,
            width: 300,
            height: 12,
            background: "#b6b396",
          }}
        />
      </div>
    </div>
  );
}
function MaterialPresentation({
  children,
  presentationProgress: p,
  presentationDirection: direction,
  passedProps: { kind },
}: TransitionPresentationComponentProps<Props>) {
  const entering = direction === "entering";
  const visible = entering ? p >= 0.5 : p < 0.5;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: visible ? 1 : 0,
        }}
      >
        {children}
      </AbsoluteFill>
      {entering && <Material kind={kind} p={p} />}
    </AbsoluteFill>
  );
}
export const materialTransition = (
  kind: Kind,
): TransitionPresentation<Props> => ({
  component: MaterialPresentation,
  props: { kind },
});
