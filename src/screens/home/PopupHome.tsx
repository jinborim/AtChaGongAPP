import React from "react";
import {
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type CompleteProps = {
  visible: boolean;
  onClose: () => void;
};

export default function Complete({
  visible,
  onClose,
}: CompleteProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View
          className="w-[85%] items-center rounded-[16px] border-2 border-primary bg-white px-5 py-8"
        >

          {/* 펭귄 이미지 */}
          <Image
            source={require("../../assets/images/Penguin1.png")}
            className="mb-1 h-[100px] w-[100px]"
            resizeMode="contain"
          />

          <Text
            className="mb-3 font-maru text-2xl font-bold text-primary"
          >
            수고하셨어요!
          </Text>

          <Text
            className="mb-7 font-maru text-base font-medium text-primary"
          >
            설정한 사이클을 모두 완료했습니다
          </Text>

          <TouchableOpacity
            className="h-12 w-[132px] items-center justify-center rounded-[12px] bg-primary"
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text className="font-maru text-base font-bold text-white">
              확인
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}
