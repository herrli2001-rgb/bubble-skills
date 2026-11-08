import type { SceneId } from "./actors";
export const sceneData: Record<
  SceneId,
  { age: string; place: string; duration: number; caption: string[] }
> = {
  bedroom: { age: "深夜", place: "少年的书房", duration: 234, caption: [] },
  parents: {
    age: "18岁",
    place: "家里的客厅",
    duration: 294,
    caption: ["18岁那年你没考上大学，", "你以为世界末日了。"],
  },
  dorm: {
    age: "22岁",
    place: "大学宿舍",
    duration: 294,
    caption: ["22岁那年你没考上研，", "你以为人生要完蛋了。"],
  },
  office: {
    age: "28岁",
    place: "公司",
    duration: 294,
    caption: ["28岁那年，你被公司开除了，", "你已经想要重开了。"],
  },
  relatives: {
    age: "33岁",
    place: "家中的客厅",
    duration: 300,
    caption: ["33岁那年，你还没结婚，", "你以为这辈子都遇不到真爱了。"],
  },
};
export type Bubble = {
  x: number;
  y: number;
  lines: string[];
  start: number;
  end: number;
  thought?: boolean;
  size?: number;
};
export function bubbles(id: SceneId, f: number, x: number): Bubble[] {
  if (id === "bedroom")
    return [
      {
        x: 282,
        y: 172,
        lines: ["我的人生到底有", "多少容错率呢？"],
        start: 33,
        end: 200,
        thought: true,
        size: 48,
      },
    ];
  // Parents and relatives have their own accumulating pressure dialogue layers.
  if (id === "parents") return [];
  if (id === "dorm")
    return [
      {
        x: 320,
        y: 195,
        lines: ["完蛋了，", "研究生又考不上，", "要二战了。"],
        start: 62,
        end: 264,
        thought: true,
        size: 36,
      },
    ];
  if (id === "office")
    return [
      {
        x,
        y: 181,
        lines: ["怎么办，", "被开除了。"],
        start: 65,
        end: 262,
        thought: true,
        size: 48,
      },
    ];
  return [
    {
      x: 176,
      y: 150,
      lines: ["你为什么", "还不结婚？"],
      start: 40,
      end: 204,
      size: 36,
    },
    {
      x: 470,
      y: 150,
      lines: ["你为什么", "还不结婚？"],
      start: 110,
      end: 284,
      size: 36,
    },
  ];
}
