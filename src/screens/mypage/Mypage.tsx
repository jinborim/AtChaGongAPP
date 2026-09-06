import { clearAuthTokensForRecovery } from "@/src/api";
import CustomModal from "@/src/components/Modal/CustomModal";
import LoginRequiredModal from "@/src/components/Modal/LoginRequiredModal";
import NavigationBar from "@/src/components/NavigationBar/NavigationBar";
import { useAuth } from "@/src/features/auth";
import { logoutCurrentUser } from "@/src/features/auth/services";
import { deleteMe, updateNickname } from "@/src/features/user";
import { useRouter } from "expo-router";
import { Check, ChevronRight, Pencil } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const PRIMARY = "#183765";
const DEFAULT_NICKNAME = "사용자";

export default function Mypage() {
  const { isGuest, setSignedOut, updateCurrentUser, user } = useAuth();
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [isEditing, setIsEditing] = useState(false); // 추가: 편집 모드 여부
  const [inputNickname, setInputNickname] = useState(""); // 추가: input에 입력 중인 값
  const [isUpdating, setIsUpdating] = useState(false); // 추가: 저장 중 로딩 처리
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isProfileLoginPromptOpen, setIsProfileLoginPromptOpen] =
    useState(false);
  const router = useRouter();

  useEffect(() => {
    setNickname(isGuest ? "게스트" : user?.nickname || DEFAULT_NICKNAME);
    setIsEditing(false);
  }, [isGuest, user?.nickname]);
  // 닉네임 수정 API 요청 함수
  const handleUpdateNickname = async () => {
    const trimmed = inputNickname.trim();

    // 빈 값이거나 기존과 변경사항이 없으면 편집 종료
    if (!trimmed || trimmed === nickname) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      await updateNickname({ nickname: trimmed });
      setNickname(trimmed);
      updateCurrentUser({ nickname: trimmed });
      setIsEditing(false);
    } catch (error) {
      console.log("닉네임 변경 오류:", error);
      // 에러 시 기존 닉네임으로 복구
      setInputNickname(nickname);
    } finally {
      setIsUpdating(false);
    }
  };

  // 연필(Pencil) 아이콘 클릭 시 편집 모드 전환
  const handleStartEdit = () => {
    setInputNickname(nickname);
    setIsEditing(true);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutCurrentUser();
    } catch {
      // 서버 로그아웃이 실패해도 로컬 토큰은 삭제되므로 로그인 화면으로 이동합니다.
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      setSignedOut();
      router.replace("/login");
    }
  };
  const handleDeleteAccount = async () => {
    if (isDeletingAccount) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteMe();
      await clearAuthTokensForRecovery();
      setIsDeleteAccountModalOpen(false);
      setSignedOut();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "회원 탈퇴 요청에 실패했습니다.";

      Alert.alert("회원탈퇴 실패", message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handlePressPrivacyPolicy = () => {
    router.push("/mypage/privacy");
  };
  const handlePressNoticePage = () => {
    router.push("/notice");
  };
  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 px-12 pt-24">
        {/* 프로필 */}
        <View className="mb-12 flex-row items-center">
          <View className="mr-8 h-16 w-16 items-center justify-center ">
            <Image
              source={require("../../assets/images/Bear.png")}
              className="absolute h-20 w-20"
              resizeMode="contain"
            />
          </View>

          {/* 닉네임 */}
          {/* 닉네임 영역 */}
          <View className="flex-1 justify-center">
            {!isGuest && isEditing ? (
              // 1) 수정 모드 (TextInput + 완료 버튼)
              <View className="flex-row items-center">
                <TextInput
                  value={inputNickname}
                  onChangeText={setInputNickname}
                  className="border-b-2 border-primary font-maru text-lg text-primary px-1 py-0 min-w-[100px]"
                  autoFocus
                  maxLength={10} // 필요한 경우 최대 글자수 제한
                  editable={!isUpdating}
                  onSubmitEditing={handleUpdateNickname}
                />
                <Pressable
                  className="ml-2 p-1"
                  onPress={handleUpdateNickname}
                  disabled={isUpdating}
                >
                  <Check size={18} color="#183765" strokeWidth={3} />
                </Pressable>
              </View>
            ) : (
              // 2) 일반 모드 (기존 UI)
              <View className="flex-row items-center">
                <Text className="font-maru text-lg text-primary mr-2">
                  {nickname}
                </Text>
                <Pressable
                  className="p-1"
                  onPress={() => {
                    if (isGuest) {
                      setIsProfileLoginPromptOpen(true);
                      return;
                    }

                    handleStartEdit();
                  }}
                >
                  <Pencil size={16} color="#111111" strokeWidth={3} />
                </Pressable>
              </View>
            )}
          </View>
        </View>
        {isGuest && (
          <View className="mb-8 items-center">
            <Text className="mb-4 text-center font-maru text-sm text-primary">
              로그인하고 기록을 저장해 보세요.
            </Text>
            <Pressable
              className="h-11 w-40 items-center justify-center rounded-[12px] bg-primary"
              onPress={() => router.replace("/login")}
            >
              <Text className="font-maru text-sm text-white">로그인하기</Text>
            </Pressable>
          </View>
        )}
        {/* 메뉴 전체 */}
        <View className="relative w-full">
          {/* 내부 배경 */}
          <View className="absolute bottom-1 left-1 right-1 top-1 bg-white" />

          {/* 픽셀 테두리 */}
          <View className="absolute left-1 right-1 top-0 h-[2px] bg-primary" />
          <View className="absolute bottom-0 left-1 right-1 h-[2px] bg-primary" />
          <View className="absolute bottom-1 left-0 top-1 w-[2px] bg-primary" />
          <View className="absolute bottom-1 right-0 top-1 w-[2px] bg-primary" />

          {/* 메뉴 내용 */}
          <View>
            {/* 공지사항 */}
            <TouchableOpacity
              className="h-16 flex-row items-center border-b-2 border-primary px-5"
              onPress={handlePressNoticePage}
            >
              <Image
                source={require("../../assets/images/Notice.png")}
                className="absolute left-5 h-[28px] w-[28px]"
                resizeMode="contain"
              />
              <Text className="ml-12 flex-1 font-maru text-md text-primary">
                공지사항
              </Text>

              <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
            </TouchableOpacity>

            {/* 개인정보 처리 방침 */}
            <TouchableOpacity
              className="h-16 flex-row items-center border-b-2 border-primary px-5"
              onPress={handlePressPrivacyPolicy}
            >
              <Image
                source={require("../../assets/images/Privacy.png")}
                className="absolute left-5 h-[28px] w-[28px]"
                resizeMode="contain"
              />

              <Text className="ml-12 flex-1 font-maru text-md text-primary">
                개인정보 처리 방침
              </Text>

              <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
            </TouchableOpacity>

            {!isGuest && (
              <Pressable
                className="h-16 flex-row items-center px-5"
                onPress={() => setIsLogoutModalOpen(true)}
              >
                <Image
                  source={require("../../assets/images/Logout.png")}
                  className="absolute left-5 h-[28px] w-[28px]"
                  resizeMode="contain"
                />
                <Text className="ml-12 flex-1 font-maru text-md text-primary">
                  로그아웃
                </Text>
                <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
              </Pressable>
            )}
          </View>
        </View>
        {!isGuest && (
          <Pressable
            className="mt-60 w-20 self-center flex-row items-center justify-center border-b-2 border-gray-300 pb-2"
            onPress={() => setIsDeleteAccountModalOpen(true)}
          >
            <Text className="font-maru text-gray-300">회원탈퇴</Text>
          </Pressable>
        )}
      </View>
      <CustomModal
        visible={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        description="로그아웃 하시겠습니까?"
        buttonCount={2}
        confirmText={isLoggingOut ? "로그아웃 중" : "로그아웃"}
        cancelText="취소"
      />
      <CustomModal
        visible={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="회원탈퇴"
        description="정말...회원 탈퇴하시겠습니다? 정말요..?"
        buttonCount={2}
        confirmText={isDeletingAccount ? "탈퇴 중" : "회원탈퇴"}
        cancelText="취소"
      />
      <LoginRequiredModal
        visible={isProfileLoginPromptOpen}
        onClose={() => setIsProfileLoginPromptOpen(false)}
        description="프로필과 닉네임을 수정하려면 로그인이 필요해요."
      />
      <NavigationBar />
    </ImageBackground>
  );
}
