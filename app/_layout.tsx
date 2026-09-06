import { AuthProvider, useAuth } from "@/src/features/auth";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const [loaded] = useFonts({
    Mulmaru: require("../src/assets/fonts/Mulmaru.ttf"),
  });
  const { isAdmin, isAuthenticated, status } = useAuth();
  const canAccessApp = status === "guest" || isAuthenticated;

  if (!loaded) {
    return null;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="login" />
      <Stack.Protected guard={canAccessApp}>
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="timerSetting" />
        <Stack.Screen name="notice" />
        <Stack.Screen name="mypage/privacy" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(onboard)" />
      </Stack.Protected>
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
    </Stack>
  );
}
