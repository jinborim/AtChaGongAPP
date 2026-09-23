import { Image as ExpoImage } from "expo-image";
import { Image, type ImageSourcePropType } from "react-native";
import { SAMPLE_BEVERAGES } from "./sampleBeverages";

const shellAssets = [
  require("../../assets/images/Background.png"),
  require("../../assets/images/HomeIcon.png"),
  require("../../assets/images/Store.png"),
  require("../../assets/images/StatisticsIconV2.png"),
  require("../../assets/images/UserIcon.png"),
] as const;

const beveragePreviewAssets: ImageSourcePropType[] =
  SAMPLE_BEVERAGES.map((beverage) => beverage.focusImages[0]);

const beverageAnimationAssets: ImageSourcePropType[] = [
  ...SAMPLE_BEVERAGES.flatMap((beverage) => [
    ...(beverage.meltLayers
      ? [
          beverage.meltLayers.glass,
          beverage.meltLayers.liquid,
          beverage.meltLayers.ice,
          beverage.meltLayers.fruit,
        ]
      : []),
    ...(beverage.iceCupLayers
      ? [
          beverage.iceCupLayers.glass,
          beverage.iceCupLayers.ice,
          beverage.iceCupLayers.water,
        ]
      : []),
  ]),
  require("../../assets/images/PenguinPartTime.png"),
  require("../../assets/images/Coin.png"),
];

async function preloadAsset(asset: ImageSourcePropType) {
  const source = Image.resolveAssetSource(asset);
  if (source?.uri) {
    await ExpoImage.prefetch(source.uri, { cachePolicy: "memory-disk" });
  }
}

let pending: Promise<void> | undefined;

export function preloadBeverageImages(): Promise<void> {
  if (pending) return pending;
  pending = (async () => {
    await Promise.allSettled(shellAssets.map(preloadAsset));
    await Promise.allSettled(beveragePreviewAssets.map(preloadAsset));

    // Load animation layers after the single-image store and collection previews.
    for (let index = 0; index < beverageAnimationAssets.length; index += 2) {
      await Promise.allSettled(
        beverageAnimationAssets.slice(index, index + 2).map(preloadAsset),
      );
    }
  })().finally(() => { pending = undefined; });
  return pending;
}
