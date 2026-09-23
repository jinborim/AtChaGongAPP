import { AuthProvider, useAuth } from "@/src/features/auth";
import {
  configureForegroundNotificationHandler,
  ensureRemoteNotificationChannel,
  ensureTimerNotificationChannel,
  registerCurrentFcmTokenIfPermitted,
  subscribeToFcmTokenRefresh,
  subscribeToForegroundRemoteMessages,
} from "@/src/features/notifications";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import "react-native-reanimated";
import "../global.css";

configureForegroundNotificationHandler();

export default function RootLayout() {
  useEffect(() => {
    Promise.all([
      ensureTimerNotificationChannel(),
      ensureRemoteNotificationChannel(),
    ]).catch((error) => {
      console.warn("알림 채널 생성 실패:", error);
    });

    const unsubscribe = subscribeToForegroundRemoteMessages();

    return unsubscribe;
  }, []);

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

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const syncDeviceToken = () => {
      registerCurrentFcmTokenIfPermitted().catch((error) => {
        console.warn("FCM 기기 토큰 자동 등록 실패:", error);
      });
    };

    syncDeviceToken();

    const unsubscribeTokenRefresh = subscribeToFcmTokenRefresh();
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          syncDeviceToken();
        }
      },
    );

    return () => {
      unsubscribeTokenRefresh();
      appStateSubscription.remove();
    };
  }, [isAuthenticated]);

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
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Protected guard={canAccessApp}>
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="timerSetting" />
        <Stack.Screen name="notice" />
        <Stack.Screen name="mypage/privacy" />
        <Stack.Screen name="mypage/notifications" />
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
