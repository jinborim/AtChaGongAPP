import { Image, ImageBackground, Pressable, Text, View } from "react-native";

export default function LoginScreen() {
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
        {/* Google */}
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
          onPress={() => {}}
        >
          <Image
            source={require("../../assets/images/Google.png")}
            className="absolute left-5 h-[22px] w-[22px]"
            resizeMode="contain"
          />
          <Text className="font-maru text-sm text-primary">
            Google로 계속하기
          </Text>
        </Pressable>

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
          onPress={() => {}}
        >
          <Image
            source={require("../../assets/images/Kakao.png")}
            className="absolute left-5 h-[22px] w-[22px]"
            resizeMode="contain"
          />
          <Text className="font-maru text-sm text-primary">
            카카오톡으로 계속하기
          </Text>
        </Pressable>

        {/* Apple */}
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
          onPress={() => {}}
        >
          <Image
            source={require("../../assets/images/Apple.png")}
            className="absolute left-5 h-[22px] w-[22px]"
            resizeMode="contain"
          />
          <Text className="font-maru text-sm text-primary">
            Apple로 계속하기
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}
