import CustomModal from "@/src/components/Modal/CustomModal";
import NavigationBar from "@/src/components/NavigationBar/NavigationBar";
import { ChevronRight, Pencil } from "lucide-react-native";
import { useState } from "react";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
const PRIMARY = "#183765";

export default function Mypage() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    // 여기에 실제 로그아웃 함수
  };
  const handleDeleteAccount = () => {
    setIsDeleteAccountModalOpen(false);
    //여기에 실제 회원탈퇴 함수
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
          <View>
            <Pressable className="mb-1 ml-14 flex-row items-center">
              <Pencil size={16} color="#111111" strokeWidth={3} />
            </Pressable>
            <Text className="font-maru text-lg text-primary">닉네임</Text>
          </View>
        </View>
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
            {/* 후원 */}
            <View className="h-16 flex-row items-center border-b-2 border-primary px-5">
              <Image
                source={require("../../assets/images/Heart.png")}
                className="absolute left-5 h-[28px] w-[28px]"
                resizeMode="contain"
              />
              <Text className="ml-12 flex-1 font-maru text-md text-primary">
                후원
              </Text>
              <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
            </View>

            {/* 공지사항 */}
            <View className="h-16 flex-row items-center border-b-2 border-primary px-5">
              <Image
                source={require("../../assets/images/Notice.png")}
                className="absolute left-5 h-[28px] w-[28px]"
                resizeMode="contain"
              />
              <Text className="ml-12 flex-1 font-maru text-md text-primary">
                공지사항
              </Text>

              <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
            </View>

            {/* 개인정보 처리 방침 */}
            <View className="h-16 flex-row items-center border-b-2 border-primary px-5">
              <Image
                source={require("../../assets/images/Privacy.png")}
                className="absolute left-5 h-[28px] w-[28px]"
                resizeMode="contain"
              />

              <Text className="ml-12 flex-1 font-maru text-md text-primary">
                개인정보 처리 방침
              </Text>

              <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
            </View>

            {/* 로그아웃 */}
            <Pressable
              className="h-16 flex-row items-center px-5"
              onPress={() => setIsLogoutModalOpen(true)} //클릭 시 모달 열기
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
          </View>
        </View>
        <Pressable
          className="mt-60 w-20 self-center border-b-2 border-gray-300 pb-2 flex-row items-center justify-center"
          onPress={() => setIsDeleteAccountModalOpen(true)}
        >
          <Text className="font-maru text-gray-300">회원탈퇴</Text>
        </Pressable>
      </View>
      <CustomModal
        visible={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        description="로그아웃 하시겠습니까?"
        buttonCount={2}
        confirmText="로그아웃"
        cancelText="취소"
      />
      <CustomModal
        visible={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="회원탈퇴"
        description="정말...회원 탈퇴하시겠습니다? 정말요..?"
        buttonCount={2}
        confirmText="회원탈퇴"
        cancelText="취소"
      />
      <NavigationBar />
    </ImageBackground>
  );
}
