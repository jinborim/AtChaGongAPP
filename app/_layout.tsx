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
      <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
    </Stack>
  );
}
