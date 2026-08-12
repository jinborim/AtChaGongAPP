// 메인 홈 퍼블리싱 화면
import { useRouter } from "expo-router";
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
            onPress={() => router.push("../router/TimerSetting")}
          >
            <Text className="font-maru text-[52px] font-bold text-primary">
              25:00
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

        <TouchableOpacity className="mt-4 h-[72px] w-[100px] items-center justify-center">
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
