import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  const [loaded] = useFonts({
    Mulmaru: require("../src/assets/fonts/Mulmaru.ttf"),
  });

  if (!loaded) {
    return null;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="router/homeSetting"
        options={{ animation: "fade", animationDuration: 150 }}
      />
      <Stack.Screen
        name="month"
        options={{ animation: "fade", animationDuration: 150 }}
      />
      <Stack.Screen
        name="mypage/index"
        options={{ animation: "fade", animationDuration: 150 }}
      />
    </Stack>
  );
}
