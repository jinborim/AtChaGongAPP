import { PROFILE_IMAGES, type ProfileImageId } from "@/src/features/user/profileImages";
import { Check } from "lucide-react-native";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  visible: boolean;
  selectedId: ProfileImageId;
  saving: boolean;
  onSelect: (id: ProfileImageId) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ProfileImageModal({
  visible, selectedId, saving, onSelect, onClose, onConfirm,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <Pressable
          className="absolute inset-0"
          accessibilityLabel="프로필 선택 닫기"
          accessibilityRole="button"
          onPress={onClose}
          disabled={saving}
        />
        <View
          accessibilityViewIsModal
          className="w-[85%] max-w-[400px] rounded-[16px] border-4 border-primary bg-white px-5 py-6"
          style={{ maxHeight: "80%" }}
        >
          <Text className="text-center font-maru text-xl text-primary">프로필 이미지 변경</Text>
          <Text className="mt-2 mb-5 text-center font-maru text-sm text-primary">나를 표현할 친구를 골라주세요.</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 4 }}>
            <View className="flex-row flex-wrap justify-between">
              {PROFILE_IMAGES.map((item) => {
                const selected = selectedId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityLabel={item.name}
                    accessibilityState={{ checked: selected, disabled: saving }}
                    disabled={saving}
                    onPress={() => onSelect(item.id)}
                    className="mb-3 items-center rounded-[12px] border-2 px-2 py-4"
                    style={{ width: "47%", borderColor: selected ? "#183765" : "#DBE6EE", backgroundColor: selected ? "#E8F3FC" : "#FFFFFF" }}
                  >
                    <Image source={item.source} style={{ width: "100%", height: 88 }} resizeMode="contain" />
                    <Text className="mt-3 font-maru text-base text-primary">{item.name}</Text>
                    {selected && (
                      <View className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check size={16} color="white" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View className="mt-3 flex-row gap-x-3">
            <Pressable accessibilityRole="button" disabled={saving} onPress={onClose} className="h-12 flex-1 items-center justify-center rounded-[12px] bg-gray-100">
              <Text className="font-maru text-sm text-primary">취소</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={onConfirm} className="h-12 flex-1 items-center justify-center rounded-[12px] bg-primary" style={{ opacity: saving ? 0.5 : 1 }}>
              <Text className="font-maru text-sm text-white">{saving ? "저장 중" : "변경하기"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
