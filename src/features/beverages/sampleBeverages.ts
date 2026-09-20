import type { ImageSourcePropType } from "react-native";

export const BEVERAGE_CATEGORIES = [
  { id: "all", name: "전체" },
  { id: "basic", name: "기본" },
  { id: "ade", name: "에이드" },
  { id: "limited", name: "한정판" },
] as const;
export type BeverageCategory = (typeof BEVERAGE_CATEGORIES)[number]["id"];

export type BeveragePreview = {
  id: string;
  templateId?: string;
  name: string;
  category: Exclude<BeverageCategory, "all" | "limited">;
  isOwned: boolean;
  isLimited?: boolean;
  focusImages: readonly ImageSourcePropType[];
  meltLayers?: {
    glass: ImageSourcePropType;
    liquid: ImageSourcePropType;
    ice: ImageSourcePropType;
    fruit: ImageSourcePropType;
    flavor?: "lemon" | "grapefruit" | "greenGrape";
  };
  iceCupLayers?: {
    glass: ImageSourcePropType;
    ice: ImageSourcePropType;
    water: ImageSourcePropType;
  };
  previewTint?: string;
  // 원본 이미지의 여백을 보정하여 기본 얼음컵의 본체 크기에 맞춥니다.
  imageScale?: { x: number; y: number };
};

const ICE_CUP_PREVIEW = require("../../assets/images/IceCupCurrentPreview.png");

const LEMON_ADE_IMAGE = require("../../assets/images/LemonAdeCurrentPreview.png");
const GRAPEFRUIT_ADE_IMAGE = require("../../assets/images/GrapefruitAdeCurrentPreview.png");
const GREEN_GRAPE_ADE_IMAGE = require("../../assets/images/GreenGrapeAdeCurrentPreview.png");

// UI 예시 전용입니다. 구매/보유 API 및 기록 전송용 beverageId와 연결하지 않습니다.
// 에이드는 단일 이미지이며, 단계별 이미지가 준비되면 focusImages에 추가합니다.
export const SAMPLE_BEVERAGES: readonly BeveragePreview[] = [
  {
    id: "preview-original",
    name: "얼음컵",
    category: "basic",
    isOwned: true,
    focusImages: [ICE_CUP_PREVIEW],
    iceCupLayers: {
      glass: require("../../assets/images/IceCupGlassPixel.png"),
      ice: require("../../assets/images/AdeIceAtlas.png"),
      water: require("../../assets/images/IceCupWaterFlat.png"),
    },
  },
  {
    id: "preview-lemonade",
    name: "레몬 에이드",
    category: "ade",
    isOwned: false,
    focusImages: [LEMON_ADE_IMAGE],
    meltLayers: {
      glass: require("../../assets/images/LemonAdeGlassV9.png"),
      liquid: require("../../assets/images/LemonAdeLiquid.png"),
      ice: require("../../assets/images/AdeIceAtlas.png"),
      fruit: require("../../assets/images/LemonHalf.png"),
      flavor: "lemon",
    },
  },
  {
    id: "preview-grapefruit-ade",
    name: "자몽 에이드",
    category: "ade",
    isOwned: false,
    focusImages: [GRAPEFRUIT_ADE_IMAGE],
    meltLayers: {
      glass: require("../../assets/images/GrapefruitAdeGlass.png"),
      liquid: require("../../assets/images/GrapefruitAdeLiquid.png"),
      ice: require("../../assets/images/AdeIceAtlas.png"),
      fruit: require("../../assets/images/GrapefruitHalf.png"),
      flavor: "grapefruit",
    },
  },
  {
    id: "preview-green-grape-ade",
    name: "청포도 에이드",
    category: "ade",
    isOwned: false,
    focusImages: [GREEN_GRAPE_ADE_IMAGE],
    meltLayers: {
      glass: require("../../assets/images/GreenGrapeAdeGlass.png"),
      liquid: require("../../assets/images/GreenGrapeAdeLiquid.png"),
      ice: require("../../assets/images/AdeIceAtlas.png"),
      fruit: require("../../assets/images/GreenGrapeHalf.png"),
      flavor: "greenGrape",
    },
  },
];

export type BeverageIdentity = {
  beverageId: number;
  name: string;
  imgUrl: string;
};

export function findBeveragePreviewTemplate(beverage: BeverageIdentity) {
  const identity = `${beverage.name} ${beverage.imgUrl}`
    .replace(/[\s_-]/g, "")
    .toLowerCase();

  if (identity.includes("청포도") || identity.includes("greengrape")) {
    return SAMPLE_BEVERAGES[3];
  }
  if (identity.includes("자몽") || identity.includes("grapefruit")) {
    return SAMPLE_BEVERAGES[2];
  }
  if (identity.includes("레몬") || identity.includes("lemon")) {
    return SAMPLE_BEVERAGES[1];
  }
  if (identity.includes("얼음") || identity.includes("icecup")) {
    return SAMPLE_BEVERAGES[0];
  }

  return SAMPLE_BEVERAGES[beverage.beverageId - 1] ?? SAMPLE_BEVERAGES[0];
}

export function getBeverageImageStyle(beverage: BeveragePreview) {
  return {
    transform: [
      { scaleX: beverage.imageScale?.x ?? 1 },
      { scaleY: beverage.imageScale?.y ?? 1 },
    ],
  };
}
