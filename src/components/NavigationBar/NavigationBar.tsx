import LoginRequiredModal from "@/src/components/Modal/LoginRequiredModal";
import { useAuth } from "@/src/features/auth";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import NavigationButton from "./NavigationButton";

const NAVIGATION_ITEMS: {
  label: string;
  icon: number;
  href: "/homeSetting" | "/month" | "/mypage";
}[] = [
  {
    label: "홈",
    icon: require("../../assets/images/HomeIcon.png"),
    href: "/homeSetting",
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
