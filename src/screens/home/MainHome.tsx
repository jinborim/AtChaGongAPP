// 메인 홈 퍼블리싱 화면
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NavigationBar from "../../components/NavigationBar/NavigationBar";

export default function StudyScreen() {
  const router = useRouter();
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(
    25 * 60 * 1000
  );
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadFocusMinutes = async () => {
        const savedFocusMinutes = await AsyncStorage.getItem("focusMinutes");
        const minutes = savedFocusMinutes
          ? Math.min(120, Math.max(5, Number(savedFocusMinutes)))
          : 25;

        if (!isRunning) setRemainingMilliseconds(minutes * 60 * 1000);
      };

      loadFocusMinutes().catch((error) =>
        console.log("집중 시간 불러오기 오류:", error)
      );
    }, [isRunning])
  );

  useEffect(() => {
    if (!isRunning || endTime === null) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setRemainingMilliseconds(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        setEndTime(null);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [endTime, isRunning]);

  const minutes = Math.floor(remainingMilliseconds / 60000);
  const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);
  const centiseconds = Math.floor((remainingMilliseconds % 1000) / 10);
  const formattedTime = isRunning
    ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}:${String(centiseconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const startTimer = () => {
    setEndTime(Date.now() + remainingMilliseconds);
    setIsRunning(true);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/homebg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/images/penguin1.png")}
            className="mr-3 h-20 w-20"
          />

          <ImageBackground
            source={require("../../assets/images/speechBubble.png")}
            className="h-[120px] w-[240px] items-center justify-center"
            resizeMode="contain"
          >
            <Text className="font-maru text-base leading-6 text-primary">
              안녕하세요 사용자님{"\n"}
              음료가 준비되었어요.{"\n"}
              함께 얼음을 녹여 볼까요?
            </Text>
          </ImageBackground>
        </View>

        <View className="mt-12">
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isRunning}
            onPress={() => router.push("../router/TimerSetting")}
          >
            <Text className="font-maru text-[52px] font-bold text-primary">
              {formattedTime}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center">
          <Image
            source={require("../../assets/images/icecup1.png")}
            className="mt-7 h-[300px] w-[220px]"
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          className={`mt-4 h-[72px] w-[100px] items-center justify-center ${
            isRunning ? "opacity-0" : "opacity-100"
          }`}
          disabled={isRunning || remainingMilliseconds === 0}
          onPress={startTimer}
        >
          <Image
            source={require("../../assets/images/playButton.png")}
            className="h-[72px] w-[100px]"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <NavigationBar />
      </SafeAreaView>
    </ImageBackground>
  );
}
