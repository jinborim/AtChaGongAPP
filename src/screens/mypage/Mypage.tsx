import NavigationBar from "@/src/components/NavigationBar/NavigationBar";
import { ChevronRight, Pencil } from "lucide-react-native";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
const PRIMARY = "#183765";

export default function Mypage() {
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
            <View className="h-16 flex-row items-center px-5">
              <Image
                source={require("../../assets/images/Logout.png")}
                className="absolute left-5 h-[28px] w-[28px]"
                resizeMode="contain"
              />

              <Text className="ml-12 flex-1 font-maru text-md text-primary">
                로그아웃
              </Text>

              <ChevronRight size={24} color={PRIMARY} strokeWidth={3} />
            </View>
          </View>
        </View>
        <View className="mt-60 w-20 self-center border-b-2 border-gray-300 pb-2 flex-row items-center justify-center">
          <Text className="font-maru text-gray-300">회원탈퇴</Text>
        </View>
      </View>
      <NavigationBar />
    </ImageBackground>
  );
}
