import { useAuth } from "@/src/features/auth";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { preloadBeverageImages } from "@/src/features/beverages/preloadBeverageImages";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  useEffect(() => { void preloadBeverageImages(); }, []);

  return (
    <Tabs
      detachInactiveScreens={false}
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
        animation: "fade",
        lazy: false,
      }}
    >
      <Tabs.Screen name="homeSetting" />
      <Tabs.Screen name="store" />
      <Tabs.Protected guard={isAuthenticated}>
        <Tabs.Screen name="month" />
      </Tabs.Protected>
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
