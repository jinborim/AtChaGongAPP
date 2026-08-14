import { ApiError, clearAuthTokens } from "@/src/api";
import { completeOnboarding } from "@/src/features/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

export const NICKNAME_STORAGE_KEY = "nickname";

export function hasUsableNickname(nickname: string | null | undefined) {
  return (nickname ?? "").trim().length > 0;
}

export async function cacheOnboardingNickname(nickname: string) {
  const trimmedNickname = nickname.trim();

  if (trimmedNickname.length > 0) {
    await AsyncStorage.setItem(NICKNAME_STORAGE_KEY, trimmedNickname);
    return true;
  }

  await AsyncStorage.removeItem(NICKNAME_STORAGE_KEY);
  return false;
}

function getOnboardingErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "온보딩 완료 처리에 실패했습니다. 다시 시도해 주세요.";
  }

  switch (error.code) {
    case "BAD_REQUEST":
      return "온보딩 완료 요청에 실패했습니다. 다시 시도해 주세요.";
    case "SUSPENDED_USER":
      return "정지된 계정입니다. 고객센터에 문의해 주세요.";
    case "WITHDRAWN_USER":
      return "탈퇴 처리된 계정입니다.";
    case "NETWORK_ERROR":
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    default:
      if (error.status === 401) {
        return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
      }

      if (error.status === 404) {
        return "사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.";
      }

      return error.message || "온보딩 완료 처리에 실패했습니다.";
  }
}

export async function completeOnboardingAndRoute() {
  await completeOnboarding();

  const nickname = await AsyncStorage.getItem(NICKNAME_STORAGE_KEY);

  router.replace(
    hasUsableNickname(nickname) ? "/router/homeSetting" : "/onboardingnickname",
  );
}

export async function completeOnboardingWithAlert() {
  try {
    await completeOnboardingAndRoute();
  } catch (error) {
    const shouldReturnToLogin =
      error instanceof ApiError &&
      (error.status === 401 || error.status === 404);

    if (shouldReturnToLogin) {
      await clearAuthTokens();
    }

    Alert.alert("처리에 실패했어요", getOnboardingErrorMessage(error), [
      {
        text: "확인",
        onPress: () => {
          if (shouldReturnToLogin) {
            router.replace("/login");
          }
        },
      },
    ]);
  }
}
