// Pixel actors shared by the five requested scenes. All motion is frame-driven.
export type SceneId = "bedroom" | "parents" | "dorm" | "office" | "relatives";
export const clamp = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const r = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
) => {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
type PersonOptions = {
  hair?: string;
  shirt?: string;
  pants?: string;
  skin?: string;
  female?: boolean;
  gray?: boolean;
  glasses?: boolean;
  sit?: boolean;
  point?: boolean;
  talk?: boolean;
  slump?: boolean;
  shiver?: boolean;
  box?: boolean;
  walk?: boolean;
  wipeTears?: boolean;
  hero?: boolean;
  direction?: number;
  scale?: number;
};
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  for (let yy = -ry; yy <= ry; yy++) {
    const width = Math.sqrt(Math.max(0, 1 - (yy * yy) / ry / ry)) * rx;
    r(c, x - width, y + yy, width * 2, 1, color);
  }
}
function person(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  f: number,
  o: PersonOptions = {},
) {
  const k = o.scale ?? 1.5;
  // Keep feet and silhouette planted. Pressure comes from the performance and
  // surrounding dialogue, never a rapid whole-sprite position oscillation.
  const shiver = 0;
  c.save();
  const step = o.walk ? Math.round(Math.sin(f / 7) * 1.5) : 0;
  c.translate(Math.round(x + shiver), Math.round(y));
  c.scale(k, k);
  c.globalAlpha = 0.21;
  ellipse(c, 1, 1, 10, 3, "#1e3231");
  c.globalAlpha = 1;
  const hair = o.hair ?? "#694534",
    shirt = o.shirt ?? "#d7a450",
    skin = o.skin ?? "#efc38a",
    pants = o.pants ?? "#344b59";
  const shift = o.slump ? 1 : 0;
  // Legs, shoes, torso, shirt seams.
  if (o.sit) {
    r(c, -7, -9, 14, 6, pants);
    r(c, -6, -4, 4, 5, pants);
    r(c, 3, -4, 4, 5, pants);
    r(c, -7, 0, 6, 2, "#263638");
    r(c, 2, 0, 7, 2, "#263638");
  } else {
    r(c, -5, -9, 4, 10 + step, pants);
    r(c, 2, -9, 4, 10 - step, pants);
    r(c, -6, step, 6, 2, "#283637");
    r(c, 1, -step, 7, 2, "#283637");
  }
  r(c, -7, -20, 15, 13, "#3d3b35");
  r(c, -6, -20, 13, 12, shirt);
  r(c, 4, -18, 3, 10, "#0000001e");
  r(c, -2, -22, 5, 4, skin);
  r(c, -3, -20, 7, 2, "#f0d9ad");
  if (o.hero) {
    r(c, -4, -20, 8, 2, "#b95646");
    r(c, -5, -19, 2, 7, "#e57750");
    r(c, 4, -15, 1, 5, "#f5d483");
  } else {
    r(c, 0, -17, 1, 7, "#00000028");
    r(c, 0, -17, 1, 1, "#e4d5b2");
    r(c, 0, -13, 1, 1, "#e4d5b2");
  }
  // Folded arms, scolding gesture or ordinary arms.
  if (o.wipeTears) {
    // A single raised left arm replaces the ordinary hanging arm. The hand
    // itself is composited over only the left cheek by parentsEmotion().
    r(c, -10, -18, 4, 7, shirt);
    r(c, -11, -14, 4, 4, shirt);
    r(c, -11, -21, 3, 10, skin);
    r(c, -10, -21, 2, 8, "#f5d6a1");
    r(c, 7, -18, 3, 10, shirt);
    r(c, 7, -8, 3, 4, skin);
  } else if (o.shiver) {
    r(c, -10, -17, 4, 8, shirt);
    r(c, 7, -17, 4, 8, shirt);
    r(c, -7, -10, 7, 3, skin);
    r(c, 1, -11, 6, 3, skin);
  } else if (o.point) {
    const side = o.direction ?? 1,
      raise = Math.floor(f / 12) % 2;
    if (side === 1) {
      r(c, 7, -19, 5, 4, shirt);
      r(c, 10, -20 - raise, 5, 3, skin);
      r(c, 14, -21 - raise, 4, 2, skin);
      r(c, 16, -22 - raise, 3, 1, skin);
      r(c, -9, -18, 3, 11, shirt);
      r(c, -9, -7, 3, 3, skin);
    } else {
      r(c, -11, -19, 5, 4, shirt);
      r(c, -15, -20 - raise, 6, 3, skin);
      r(c, -18, -21 - raise, 4, 2, skin);
      r(c, -20, -22 - raise, 3, 1, skin);
      r(c, 7, -18, 3, 11, shirt);
      r(c, 7, -7, 3, 3, skin);
    }
  } else {
    r(c, -9, -18, 3, 10, shirt);
    r(c, 7, -18, 3, 10, shirt);
    r(c, -9, -8, 3, 4, skin);
    r(c, 7, -8, 3, 4, skin);
  }
  // Same head silhouette and red collar identify the protagonist at every age.
  const hy = -32 + shift;
  if (o.female) {
    r(c, -9, hy + 4, 18, 15, hair);
    r(c, -10, hy + 4, 3, 11, hair);
    r(c, 7, hy + 5, 3, 11, hair);
  }
  r(c, -7, hy + 3, 15, 12, "#46372f");
  r(c, -6, hy + 4, 13, 11, skin);
  r(c, 5, hy + 6, 2, 8, "#d49b72");
  r(c, -8, hy + 3, 17, 5, hair);
  r(c, -6, hy + 1, 13, 3, hair);
  r(c, -4, hy, 9, 2, hair);
  r(c, -8, hy + 6, 4, 4, hair);
  r(c, -4, hy + 5, 3, 3, hair);
  r(c, -4, hy + 2, 8, 1, o.gray ? "#d6d0b9" : "#956342");
  if (o.female) {
    r(c, 6, hy - 1, 6, 5, hair);
    r(c, 10, hy + 1, 2, 3, hair);
    r(c, 7, hy - 1, 2, 1, "#b96b62");
  }
  const blink = (f + Math.round(x)) % 113 < 5;
  const look = o.direction ? Math.sign(o.direction) : 0;
  r(c, -3 + look, hy + 9, 2, blink ? 1 : 2, "#373531");
  r(c, 3 + look, hy + 9, 2, blink ? 1 : 2, "#373531");
  if (o.point) {
    r(c, -4, hy + 7, 3, 1, "#694536");
    r(c, 3, hy + 7, 3, 1, "#694536");
  }
  if (o.glasses) {
    r(c, -5, hy + 8, 5, 1, "#6c6a5c");
    r(c, -5, hy + 8, 1, 4, "#6c6a5c");
    r(c, -5, hy + 12, 5, 1, "#6c6a5c");
    r(c, 1, hy + 8, 5, 1, "#6c6a5c");
    r(c, 5, hy + 8, 1, 4, "#6c6a5c");
    r(c, 1, hy + 12, 5, 1, "#6c6a5c");
    r(c, -1, hy + 9, 3, 1, "#6c6a5c");
  }
  r(c, 0, hy + 12, 2, 1, "#cc8c67");
  r(
    c,
    -1,
    hy + 14,
    4,
    o.talk && Math.floor(f / 5) % 3 === 0 ? 2 : 1,
    o.slump ? "#9d6c5e" : "#925c4c",
  );
  if (o.slump) {
    r(c, -5, hy + 8, 3, 1, "#815342");
    r(c, 2, hy + 8, 3, 1, "#815342");
  }
  if (o.shiver && Math.floor(f / 19) % 3 !== 0) {
    r(c, 9, hy + 7, 2, 5, "#acd5d6");
    r(c, 10, hy + 11, 1, 2, "#d6eded");
  }
  if (o.box) {
    // Personal effects protrude above the carton: a notebook, plant and mug.
    r(c, -13, -16, 27, 15, "#76573c");
    r(c, -12, -15, 25, 13, "#be965e");
    r(c, -12, -15, 25, 3, "#d3b37c");
    r(c, 10, -14, 3, 13, "#aa7b4e");
    r(c, -2, -15, 4, 13, "#d6ba83");
    r(c, -13, -17, 11, 3, "#cfad72");
    r(c, 3, -17, 12, 3, "#cfad72");
    r(c, -12, -23, 4, 7, "#385c69");
    r(c, -11, -22, 2, 1, "#c6ddce");
    r(c, -7, -19, 5, 3, "#e4d4ac");
    r(c, -3, -18, 2, 2, "#e4d4ac");
    r(c, 8, -22, 4, 6, "#9c6548");
    r(c, 9, -29, 2, 7, "#527b53");
    r(c, 6, -28, 4, 3, "#7da66b");
    r(c, 10, -30, 5, 3, "#7da66b");
    r(c, -15, -12, 4, 4, skin);
    r(c, 12, -12, 4, 4, skin);
    r(c, -10, -3, 6, 1, "#a4774a");
  }
  c.restore();
}

// This performance belongs only to the 18-year-old. It never changes the
// character's position, scale, feet, or the shared actors at the other ages.
function parentsEmotion(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  f: number,
  scale: number,
) {
  if (f < 34) return;
  const hy = -31; // Matches person({slump: true}).
  const crying = f >= 105;
  const wiping = f >= 198 && f < 233;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(scale, scale);

  // The inner eyebrow corners rise; a downturned mouth reads as hurt even
  // before the tears arrive. Expressions are held poses, not vibrating poses.
  r(c, -5, hy + 8, 4, 1, "#efc38a");
  r(c, 2, hy + 8, 4, 1, "#efc38a");
  r(c, -4, hy + 8, 2, 1, "#80533f");
  r(c, -2, hy + 7, 1, 2, "#80533f");
  r(c, 2, hy + 7, 1, 2, "#80533f");
  r(c, 3, hy + 8, 2, 1, "#80533f");
  r(c, -2, hy + 13, 6, 3, "#efc38a");
  r(c, -1, hy + 13, 4, 1, "#8e594d");
  r(c, -2, hy + 14, 1, crying ? 2 : 1, "#8e594d");
  r(c, 3, hy + 14, 1, crying ? 2 : 1, "#8e594d");
  if (crying) {
    r(c, -1, hy + 14, 4, 2, "#ad7166");
    r(c, 0, hy + 15, 2, 1, "#e3a28c");
  }

  if (f >= 80) {
    // Rose-colored eyelids, dark pupils and tiny waterline highlights keep
    // both eyes visible. No white or blue rectangle covers the entire face.
    for (const eye of [-3, 3]) {
      r(c, eye - 1, hy + 9, 4, 3, "#d4917b");
      r(c, eye, hy + 9, 2, 2, "#43383a");
      r(c, eye + 1, hy + 10, 1, 1, "#eee4c9");
      r(c, eye - 1, hy + 11, 3, 1, "#7bb6cb");
      r(c, eye, hy + 11, 2, 1, "#d7f4ee");
    }
  }

  if (crying) {
    const length = Math.min(7, 2 + Math.floor((f - 105) / 4));
    // Two uninterrupted blue-white rivulets remain readable at preview size.
    for (const tx of [-4, 3]) {
      r(c, tx, hy + 12, 3, length, "#4f93b1");
      r(c, tx + 1, hy + 12, 2, length, "#9adce9");
      r(c, tx + 1, hy + 12, 1, Math.max(1, length - 1), "#e5faf2");
      r(c, tx + 1, hy + 11 + length, 1, 2, "#d7f7ef");
    }
    // Drops fall independently down the shirt. Their launch times are offset
    // and the face/shoulders remain completely still during each fall.
    if (f >= 128) {
      for (const [tx, delay] of [[-3, 0], [4, 17]]) {
        const phase = (f - 128 + delay) % 42;
        if (phase < 24) {
          const yy = hy + 20 + Math.floor(phase * 0.45);
          r(c, tx, yy, 2, 3, "#5b9db9");
          r(c, tx, yy, 1, 2, "#e2faf2");
          r(c, tx - 1, yy + 1, 1, 1, "#91cfdf");
        }
      }
    }
  }

  if (wiping) {
    // One slow three-pose wipe touches the outside of his left cheek; the
    // right eye, nose, mouth and right tear stream stay unobstructed.
    const raised = f >= 209 && f < 222;
    const handY = hy + (raised ? 11 : 13);
    r(c, -10, handY + 1, 4, 5, "#efc38a");
    r(c, -8, handY, 5, 3, "#f0c790");
    r(c, -7, handY, 3, 1, "#ffe0aa");
    r(c, -8, handY + 2, 4, 1, "#d79d72");
  }
  c.restore();
}
export function focalPose(id: SceneId, f: number) {
  if (id === "bedroom") return { x: 282, y: 195 };
  if (id === "parents") return { x: 320, y: 242 };
  if (id === "dorm") return { x: 320, y: 246 };
  if (id === "office")
    return { x: 319 + ease(f / 135) * 23 + ease((f - 194) / 75) * 20, y: 238 };
  return { x: 330, y: 214 };
}
export function drawCast(c: CanvasRenderingContext2D, id: SceneId, f: number) {
  const p = focalPose(id, f);
  if (id === "bedroom") {
    // Reclining in the pillow, eyes open; blanket breathing is only one pixel.
    c.save();
    c.translate(283, 196);
    c.rotate(-Math.PI / 2);
    c.scale(1.6, 1.6);
    r(c, -6, -8, 13, 12, "#523a30");
    r(c, -6, -7, 13, 10, "#efc38a");
    r(c, -7, -9, 15, 4, "#624331");
    r(c, -7, -7, 4, 6, "#624331");
    r(c, -5, -10, 10, 2, "#79543a");
    r(c, -3, -3, 2, 1, "#353432");
    r(c, 3, -3, 2, 1, "#353432");
    r(c, 0, 1, 3, 1, "#b87e62");
    c.restore();
    r(c, 302, 186 + Math.floor(Math.sin(f * 0.06)), 11, 6, "#efc38a");
    r(c, 305, 185 + Math.floor(Math.sin(f * 0.06)), 7, 2, "#f5d6a1");
    c.globalAlpha = 0.08 + Math.sin(f * 0.045) * 0.03;
    r(c, 314, 183, 88, 2, "#e2ecce");
    c.globalAlpha = 1;
    return;
  }
  if (id === "parents") {
    const fatherActive = f >= 34 && f <= 260;
    const motherActive = f >= 50 && f <= 260;
    const motherTurn = Math.floor((f - 66) / 28) % 2 === 0;
    const youthScale = 1.7;
    person(c, 215, 225, f, {
      shirt: "#657e7d",
      hair: "#4a3b32",
      point: fatherActive,
      talk: fatherActive && (f < 66 || !motherTurn),
      direction: 1,
      scale: 1.5,
    });
    person(c, 430, 225, f + 9, {
      shirt: "#bc7565",
      hair: "#473a36",
      female: true,
      point: motherActive,
      talk: motherActive && (f < 66 || motherTurn),
      direction: -1,
      scale: 1.5,
    });
    person(c, p.x, p.y, f, {
      hero: true,
      slump: true,
      scale: youthScale,
      wipeTears: f >= 198 && f < 233,
    });
    parentsEmotion(c, p.x, p.y, f, youthScale);
    // A result sheet held limply beside him.
    r(c, 336, 225, 10, 14, "#e4d7b4");
    r(c, 338, 228, 6, 1, "#8b978b");
    r(c, 338, 231, 5, 1, "#8b978b");
    r(c, 339, 235, 4, 2, "#b87566");
  } else if (id === "dorm") {
    person(c, p.x, p.y, f, {
      hero: true,
      slump: true,
      sit: true,
      shirt: "#c8b17b",
      scale: 1.35,
    });
    // A small hand-to-forehead motion after reading the result.
    if (f > 62 && f < 180) {
      r(c, 304, 208, 5, 12, "#c8b17b");
      r(c, 305, 205, 8, 4, "#efc38a");
    }
  } else if (id === "office") {
    person(c, 449, 202, f, {
      shirt: "#64757e",
      pants: "#3b4853",
      hair: "#53504a",
      glasses: true,
      point: f > 45 && f < 180,
      talk: false,
      direction: 1,
      scale: 1.4,
    });
    person(c, p.x, p.y, f, {
      hero: true,
      slump: true,
      shirt: "#637b89",
      box: true,
      walk: f < 135 || f > 194,
      scale: 1.6,
    });
  } else {
    // Back row first; a compact circle of relatives closes around the sofa.
    person(c, 174, 205, f, {
      female: true,
      shirt: "#b38384",
      hair: "#79756b",
      gray: true,
      point: f > 30,
      talk: f > 30,
      direction: 1,
      scale: 1.4,
    });
    person(c, 467, 205, f + 13, {
      shirt: "#8b8871",
      hair: "#64645d",
      glasses: true,
      point: f > 58,
      talk: f > 58,
      direction: -1,
      scale: 1.4,
    });
    person(c, p.x, p.y, f, {
      hero: true,
      sit: true,
      shiver: true,
      slump: true,
      shirt: "#c6a369",
      scale: 1.5,
    });
    person(c, 210, 245, f + 4, {
      female: true,
      shirt: "#899e89",
      hair: "#4b3d34",
      point: f > 86,
      talk: f > 86,
      direction: 1,
      scale: 1.45,
    });
    person(c, 430, 245, f + 19, {
      female: true,
      shirt: "#b48161",
      hair: "#57433b",
      talk: f > 114,
      point: f > 114,
      direction: -1,
      scale: 1.45,
    });
    person(c, 253, 275, f + 7, {
      shirt: "#6b8290",
      hair: "#9c9787",
      gray: true,
      glasses: true,
      point: f > 142,
      talk: f > 142,
      direction: 1,
      scale: 1.45,
    });
    person(c, 397, 277, f + 23, {
      female: true,
      shirt: "#a47782",
      hair: "#48423c",
      point: f > 170,
      talk: f > 170,
      direction: -1,
      scale: 1.45,
    });
    if (f > 42) {
      const a = 0.2 + 0.05 * Math.sin(f * 0.045);
      c.globalAlpha = a;
      r(c, 307, 184, 2, 9, "#d0dfcf");
      r(c, 353, 187, 2, 8, "#d0dfcf");
      r(c, 303, 196, 2, 5, "#d0dfcf");
      r(c, 357, 198, 2, 6, "#d0dfcf");
      c.globalAlpha = 1;
    }
  }
}
export function roomCamera() {
  // One source pixel is exactly 3 output pixels. No animated resampling of
  // walls, lettering or outlines; only local actor and prop animation moves.
  return { zoom: 1, x: 320, y: 180 };
}
