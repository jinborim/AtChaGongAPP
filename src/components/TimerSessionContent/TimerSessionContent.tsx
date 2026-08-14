import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export type TimerSessionPhase = "focus" | "break";

type TimerSessionContentProps = {
  phase: TimerSessionPhase;
};

const SESSION_CONTENT = {
  focus: {
    image: require("../../assets/images/IceCup1.png"),
  },
  break: {
    image: require("../../assets/images/EmptyCup.png"),
    description: "얼음을 다시 냉장고에 넣는중...",
  },
} as const;

export default function TimerSessionContent({
  phase,
}: TimerSessionContentProps) {
  const breakOpacity = useRef(
    new Animated.Value(phase === "break" ? 1 : 0),
  ).current;
  const focusOpacity = breakOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  useEffect(() => {
    Animated.timing(breakOpacity, {
      toValue: phase === "break" ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [breakOpacity, phase]);

  return (
    <View className="mt-8 h-[324px] w-full items-center">
      <View className="h-6 justify-center">
        <Animated.View style={{ opacity: breakOpacity }}>
          <Text className="font-maru text-base font-bold text-gray-300">
            {SESSION_CONTENT.break.description}
          </Text>
        </Animated.View>
      </View>

      <View className="h-[300px] w-[220px] items-center justify-center">
        <Animated.View style={[styles.layer, { opacity: focusOpacity }]}>
          <Image
            source={SESSION_CONTENT.focus.image}
            className="h-[300px] w-[220px]"
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View style={[styles.layer, { opacity: breakOpacity }]}>
          <Image
            source={SESSION_CONTENT.break.image}
            className="h-[300px] w-[220px]"
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
  },
});
