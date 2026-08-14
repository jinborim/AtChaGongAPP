import { clearAuthTokens } from "@/src/api";
import { useSocialProviderLogin } from "@/src/features/auth/hooks";
import { isDevAuthTokenLoginEnabled } from "@/src/features/auth/services";
import { isUserCanceledSocialLogin } from "@/src/features/auth/socialProvider";
import { getMe } from "@/src/features/user";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  cacheOnboardingNickname,
  hasUsableNickname,
} from "../onboarding/onboardingCompletion";

export default function LoginScreen() {
  const router = useRouter();
  const [webLoginErrorMessage, setWebLoginErrorMessage] = useState<
    string | null
  >(null);

  const handleLoginSuccess = useCallback(
    async () => {
      setWebLoginErrorMessage(null);

      let me;

      try {
        me = await getMe();
      } catch (error) {
        await clearAuthTokens();
        throw error;
      }

      const serverNickname = me.nickname?.trim() ?? "";
      const hasNickname = hasUsableNickname(serverNickname);

      if (hasNickname) {
        await cacheOnboardingNickname(serverNickname);
      } else {
        await cacheOnboardingNickname("");
      }

      if (me.onboardingCompleted) {
        router.replace(
          hasNickname ? "/router/homeSetting" : "/onboardingnickname",
        );
        return;
      }

      router.replace("/onboarding.1");
    },
    [router],
  );

  const handleLoginError = useCallback((error: unknown) => {
    if (isUserCanceledSocialLogin(error)) {
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : "소셜 로그인 중 문제가 발생했습니다.";

    if (Platform.OS === "web") {
      setWebLoginErrorMessage(message);
      return;
    }

    Alert.alert("로그인 실패", message);
  }, []);

  const {
    canUseGoogleLogin,
    googleRequest,
    kakaoRequest,
    loginState,
    signInWithApple,
    signInWithDevAuthTokens,
    signInWithGoogle,
    signInWithKakao,
  } = useSocialProviderLogin({
    onLoginSuccess: handleLoginSuccess,
    onLoginError: handleLoginError,
  });

  const isGoogleDisabled = loginState.isLoading || !googleRequest;
  const isKakaoDisabled = loginState.isLoading || !kakaoRequest;
  const isAppleDisabled = loginState.isLoading;
  const isDevAuthEnabled = __DEV__ && isDevAuthTokenLoginEnabled();
  const canShowAppleLogin = Platform.OS === "ios";

  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 items-center">
        <View className="h-[26%]" />
        <Image
          source={require("../../assets/images/Ice.png")}
          className="h-[200px] w-[200px] "
          resizeMode="contain"
        />
        <Text className=" text-primary font-maru text-3xl">앗차공</Text>
        <Text className=" text-gray-300 mt-5 font-maru text-sm">
          얼음을 준비하고 있어요
        </Text>
      </View>
      <View className="mt-auto mb-20 w-[280px] gap-4 self-center">
        {canUseGoogleLogin && (
          <Pressable
            className="
              h-[45px]
              flex-row
              items-center
              justify-center
              rounded-full
              bg-white
              active:bg-gray-100
            "
            disabled={isGoogleDisabled}
            onPress={() => {
              void signInWithGoogle();
            }}
          >
            <Image
              source={require("../../assets/images/Google.png")}
              className="absolute left-5 h-[22px] w-[22px]"
              resizeMode="contain"
            />
            <Text className="font-maru text-sm text-primary">
              {loginState.provider === "GOOGLE"
                ? "Google 로그인 중"
                : "Google로 계속하기"}
            </Text>
          </Pressable>
        )}

        {/* Kakao */}
        <Pressable
          className="
            h-[45px]
              flex-row
              items-center
              justify-center
              rounded-full
              bg-[#FEE500]
              active:bg-[#D8C300]
            "
          disabled={isKakaoDisabled}
          onPress={() => {
            void signInWithKakao();
          }}
        >
          <Image
            source={require("../../assets/images/Kakao.png")}
            className="absolute left-5 h-[22px] w-[22px]"
            resizeMode="contain"
          />
          <Text className="font-maru text-sm text-primary">
            {loginState.provider === "KAKAO"
              ? "카카오 로그인 중"
              : "카카오톡으로 계속하기"}
          </Text>
        </Pressable>

        {canShowAppleLogin && (
          <Pressable
            className="
                h-[45px]
              flex-row
              items-center
              justify-center
              rounded-full
              bg-white
              active:bg-gray-100
            "
            disabled={isAppleDisabled}
            onPress={() => {
              void signInWithApple();
            }}
          >
            <Image
              source={require("../../assets/images/Apple.png")}
              className="absolute left-5 h-[22px] w-[22px]"
              resizeMode="contain"
            />
            <Text className="font-maru text-sm text-primary">
              {loginState.provider === "APPLE"
                ? "Apple 로그인 중"
                : "Apple로 계속하기"}
            </Text>
          </Pressable>
        )}

        {Platform.OS === "web" && webLoginErrorMessage && (
          <Text className="text-center font-maru text-xs text-red-500">
            {webLoginErrorMessage}
          </Text>
        )}

        {isDevAuthEnabled && (
          <Pressable
            className="
              h-[45px]
              flex-row
              items-center
              justify-center
              rounded-full
              bg-primary
              active:bg-primary/80
            "
            disabled={loginState.isLoading}
            onPress={() => {
              void signInWithDevAuthTokens();
            }}
          >
            <Text className="font-maru text-sm text-white">
              {loginState.provider === "DEV"
                ? "개발용 JWT 로그인 중"
                : "개발용 JWT로 계속하기"}
            </Text>
          </Pressable>
        )}
      </View>
    </ImageBackground>
  );
}
