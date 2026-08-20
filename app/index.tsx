import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, ImageBackground, Text, View } from "react-native";

const SPLASH_DURATION = 1800;

export default function HomeScreen() {
  const router = useRouter();
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(loadingProgress, {
      toValue: 1,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        router.replace("/login");
      }
    });

    return () => animation.stop();
  }, [loadingProgress, router]);

  const loadingWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={require("../src/assets/images/Background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 items-center">
        <View className="h-[26%]" />
        <Image
          source={require("../src/assets/images/Ice.png")}
          className="h-[200px] w-[200px]"
          resizeMode="contain"
        />
        <Text className="font-maru text-3xl text-primary">앗차공</Text>
        <Text className="mt-5 font-maru text-sm text-gray-300">
          얼음을 준비하고 있어요
        </Text>
      </View>

      <View className="mb-20 mt-auto w-[280px] self-center">
        <View className="h-2 overflow-hidden rounded-full bg-white/70">
          <Animated.View
            className="h-full rounded-full bg-secondary"
            style={{ width: loadingWidth }}
          />
        </View>
      </View>
    </ImageBackground>
  );
}
