import { useRouter } from "expo-router";
import { View } from "react-native";

import HomeNavigationButton from "./HomeNavigationButton";
import MyPageNavigationButton from "./MyPageNavigationButton";
import StatisticsNavigationButton from "./StatisticsNavigationButton";

type NavigationBarProps = {
  fixedToBottom?: boolean;
};

export default function NavigationBar({
  fixedToBottom = false,
}: NavigationBarProps) {
  const router = useRouter();

  return (
    <View
      className={`h-[100px] w-full flex-row items-end justify-around pb-3 ${
        fixedToBottom ? "absolute bottom-0" : ""
      }`}
    >
      <HomeNavigationButton
        onPress={() => router.push("/router/homeSetting")} // 나중에 수정
      />
      <StatisticsNavigationButton
        onPress={() => router.push("../router/StatisticsScreen")} // 나중에 수정
      />
      <MyPageNavigationButton
        onPress={() => router.push("../router/MyPageScreen")} //나중에 수정
      />
    </View>
  );
}
