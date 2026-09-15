import React from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string; // 안내 제목
  description: string; // 안내 내용
  buttonCount?: 0 | 1 | 2; // 버튼 개수 (0, 1, 2 중 선택, 기본값 1)
  confirmText: string; // 확인 버튼 텍스트
  cancelText?: string; // 취소 버튼 텍스트 (기본값 "취소")
  onConfirm?: () => void; // 확인 버튼 클릭 시 실행할 함수 (미지정 시 onClose 실행)
  imageSource?: ImageSourcePropType; // 이미지 변경이 필요한 경우
};

export default function CustomModal({
  visible,
  onClose,
  title,
  description,
  buttonCount = 1,
  confirmText,
  cancelText = "취소",
  onConfirm,
  imageSource = require("../../assets/images/Penguin1.png"),
}: CustomModalProps) {
  const handleConfirm = onConfirm || onClose;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="w-[85%] items-center rounded-[16px] border-4 border-primary bg-white px-5 py-8">
              {/* 이미지 */}
              {imageSource && (
                <Image
                  source={imageSource}
                  className="mb-2 h-[100px] w-[100px]"
                  resizeMode="contain"
                />
              )}

              {/* 안내 제목 */}
              <Text className="mb-4 text-center font-maru text-xl text-primary">
                {title}
              </Text>

              {/* 안내 내용 */}
              {description && (
                <Text className="mb-6 text-center font-maru text-base text-primary">
                  {description}
                </Text>
              )}

              {/* 버튼 영역 (buttonCount에 맞춰 분기) */}
              {buttonCount === 1 && (
                <TouchableOpacity
                  className="h-12 w-[132px] items-center justify-center rounded-[12px] bg-primary"
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text className="font-maru text-base text-white">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              )}

              {buttonCount === 2 && (
                <View className="flex-row gap-x-3">
                  <TouchableOpacity
                    className="h-12 flex-1 items-center justify-center rounded-[12px] bg-gray-100"
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text className="font-maru text-sm  text-primary">
                      {cancelText}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="h-12 flex-1 items-center justify-center rounded-[12px] bg-[#B7DEFE]"
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <Text className="font-maru text-sm  text-primary">
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
