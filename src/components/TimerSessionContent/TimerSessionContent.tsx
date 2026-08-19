import { Image, Text, View } from "react-native";

export type TimerSessionPhase = "focus" | "break";

type TimerSessionContentProps = {
  phase: TimerSessionPhase;
  focusProgress: number;
  breakProgress: number;
};

const FOCUS_IMAGES = [
  require("../../assets/images/IceCup1-1.png"),
  require("../../assets/images/IceCup1-2.png"),
  require("../../assets/images/IceCup1-3.png"),
  require("../../assets/images/IceCup1-4.png"),
  require("../../assets/images/IceCup1-5.png"),
] as const;

const SESSION_CONTENT = {
  focus: {
    images: FOCUS_IMAGES,
  },
  break: {
    images: [...FOCUS_IMAGES].reverse(),
    description: "얼음을 다시 냉장고에 넣는중...",
  },
} as const;

export default function TimerSessionContent({
  phase,
  focusProgress,
  breakProgress,
}: TimerSessionContentProps) {
  const isBreakPhase = phase === "break";
  const clampedFocusProgress = Math.min(1, Math.max(0, focusProgress));
  const focusImageIndex = Math.min(
    SESSION_CONTENT.focus.images.length - 1,
    Math.floor(clampedFocusProgress * SESSION_CONTENT.focus.images.length),
  );
  const clampedBreakProgress = Math.min(1, Math.max(0, breakProgress));
  const breakImageIndex = Math.min(
    SESSION_CONTENT.break.images.length - 1,
    Math.floor(clampedBreakProgress * SESSION_CONTENT.break.images.length),
  );
  const displayedImageIndex = isBreakPhase
    ? FOCUS_IMAGES.length - 1 - breakImageIndex
    : focusImageIndex;

  return (
    <View className="mt-8 h-[324px] w-full items-center">
      <View className="h-6 justify-center">
        {isBreakPhase && (
          <Text className="font-maru text-base text-gray-300">
            {SESSION_CONTENT.break.description}
          </Text>
        )}
      </View>

      <View className="h-[300px] w-[220px] items-center justify-center">
        {FOCUS_IMAGES.map((source, imageIndex) => (
          <Image
            key={imageIndex}
            source={source}
            className="absolute h-[300px] w-[220px]"
            fadeDuration={0}
            resizeMode="contain"
            style={{ opacity: imageIndex === displayedImageIndex ? 1 : 0 }}
          />
        ))}
      </View>
    </View>
  );
}

