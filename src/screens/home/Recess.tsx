// 휴식 타이머 퍼블리싱 화면
import { Image, ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NavigationBar from "../../components/NavigationBar/NavigationBar";

const CYCLE_COUNT = 1;
const CURRENT_CYCLE = 1;

export default function CoolingScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/homebg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="mt-14">
          <Text className="font-maru text-2xl font-bold text-primary">
            {CURRENT_CYCLE}회
          </Text>
        </View>

        <View className="mt-6 flex-row gap-2">
          {Array.from({ length: CYCLE_COUNT }).map((_, index) => (
            <View
              key={index}
              className={
                index < CURRENT_CYCLE
                  ? "h-1 w-12 rounded-[4px] bg-primary"
                  : "h-1 w-12 rounded-[4px] bg-gray-300 opacity-[0.35]"
              }
            />
          ))}
        </View>

        <View className="mt-11">
          <Text className="font-maru text-[52px] font-bold text-primary">
            05:00:00
          </Text>
        </View>

        <Text className="mt-8 font-maru text-base font-bold text-gray-300">
          얼음을 다시 냉장고에 넣는중...
        </Text>

        <Image
          source={require("../../assets/images/emptyCup.png")}
          className="h-[300px] w-[220px]"
          resizeMode="contain"
        />

        <NavigationBar fixedToBottom />
      </SafeAreaView>
    </ImageBackground>
  );
}
