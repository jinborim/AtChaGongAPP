import { type Href, useRouter } from "expo-router";
import { View } from "react-native";

import NavigationButton from "./NavigationButton";

const NAVIGATION_ITEMS: {
  label: string;
  icon: number;
  href: Href;
}[] = [
  {
    label: "홈",
    icon: require("../../assets/images/HomeIcon.png"),
    href: "/router/homeSetting",
  },
  {
    label: "통계",
    icon: require("../../assets/images/RecordIcon.png"),
    href: "/month",
  },
  {
    label: "마이페이지",
    icon: require("../../assets/images/UserIcon.png"),
    href: "/mypage",
  },
];

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
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationButton
          key={item.href.toString()}
          label={item.label}
          icon={item.icon}
          onPress={() => router.push(item.href)}
        />
      ))}
    </View>
  );
}
