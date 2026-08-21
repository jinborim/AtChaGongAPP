import { Tabs } from "expo-router";

export default function TabLayout() {
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
      <Tabs.Screen name="month" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
