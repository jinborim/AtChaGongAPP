import { useAuth } from "@/src/features/auth";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

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
      <Tabs.Protected guard={isAuthenticated}>
        <Tabs.Screen name="month" />
      </Tabs.Protected>
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
