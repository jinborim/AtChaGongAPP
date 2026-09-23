import MeltingIceCup from "@/src/components/TimerSessionContent/MeltingIceCup";
import { View } from "react-native";

const GLASS = require("../../assets/images/IceCupGlassPixel.png");
const ICE = require("../../assets/images/AdeIceAtlas.png");
const WATER = require("../../assets/images/IceCupWaterFlat.png");

export default function OnboardingIceCup({
  meltProgress,
  fillProgress,
}: {
  meltProgress: number;
  fillProgress?: number;
}) {
  return (
    <View className="h-[210px] w-[174px] items-center justify-center">
      <MeltingIceCup
        glassSource={GLASS}
        iceSource={ICE}
        waterSource={WATER}
        meltProgress={meltProgress}
        fillProgress={fillProgress}
        width={158}
        height={210}
        animatePhysics={false}
      />
    </View>
  );
}
