import LoginRequiredModal from "@/src/components/Modal/LoginRequiredModal";
import { useAuth } from "@/src/features/auth";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import NavigationButton from "./NavigationButton";

const NAVIGATION_ITEMS: {
  label: string;
  icon: number;
  iconSize?: number;
  iconOffsetY?: number;
  href: "/homeSetting" | "/store" | "/month" | "/mypage";
}[] = [
  {
    label: "홈",
    icon: require("../../assets/images/HomeIcon.png"),
    href: "/homeSetting",
  },
  {
    label: "상점",
    icon: require("../../assets/images/Store.png"),
    // 투명 여백과 아이콘 형태에 따른 시각적 크기를 보정합니다.
    iconSize: 42,
    iconOffsetY: -2.8,
    href: "/store",
  },
  {
    label: "통계",
    icon: require("../../assets/images/StatisticsIconV2.png"),
    // 이미지 자체의 투명 여백을 보정해 다른 네비게이션 아이콘과
    // 실제로 보이는 크기와 세로 중심을 맞춥니다.
    iconSize: 56,
    iconOffsetY: -2,
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
  const { isGuest } = useAuth();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  return (
    <>
      <View className="absolute bottom-0 h-[100px] w-full flex-row items-end justify-around pb-10">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationButton
            key={item.href}
            label={item.label}
            icon={item.icon}
            iconSize={item.iconSize}
            iconOffsetY={item.iconOffsetY}
            onPress={() => {
              if (isGuest && item.href === "/month") {
                setIsLoginPromptOpen(true);
                return;
              }

              if (pathname !== item.href) router.navigate(item.href);
            }}
          />
        ))}
      </View>
      <LoginRequiredModal
        visible={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        description="통계와 일별 집중 기록은 로그인 후 확인할 수 있어요."
      />
    </>
  );
}
