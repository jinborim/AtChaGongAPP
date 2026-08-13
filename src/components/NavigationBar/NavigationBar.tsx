import { usePathname, useRouter } from "expo-router";
import { View } from "react-native";

import NavigationButton from "./NavigationButton";

const NAVIGATION_ITEMS: {
  label: string;
  icon: number;
  href: "/router/homeSetting" | "/month" | "/mypage";
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

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="absolute bottom-0 h-[100px] w-full flex-row items-end justify-around pb-10">
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationButton
          key={item.href}
          label={item.label}
          icon={item.icon}
          onPress={() => {
            if (pathname !== item.href) router.navigate(item.href);
          }}
        />
      ))}
    </View>
  );
}
