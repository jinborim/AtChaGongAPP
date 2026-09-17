import { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";

export default function PixelSwipeHint() {
  const translateX = useRef(new Animated.Value(-36)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 36,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -36,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <View
      pointerEvents="none"
      className="absolute bottom-0 left-0 right-0 items-center"
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessibilityLabel="컵을 좌우로 밀어 보유한 음료를 골라보세요"
    >
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Image
          source={require("../../assets/images/SlideFinger.png")}
          style={{ width: 68, height: 68 }}
          resizeMode="contain"
        />
      </Animated.View>
      <Text className="font-maru text-[10px] text-primary">
        컵을 좌우로 밀어 보유한 음료를 골라보세요
      </Text>
    </View>
  );
}
