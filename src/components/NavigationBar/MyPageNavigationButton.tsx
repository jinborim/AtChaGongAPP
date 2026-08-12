import { Image, TouchableOpacity } from "react-native";

type MyPageNavigationButtonProps = {
  onPress: () => void;
};

export default function MyPageNavigationButton({
  onPress,
}: MyPageNavigationButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel="마이페이지"
      accessibilityRole="button"
      className="h-[52px] w-[52px] items-center justify-center rounded-[28px]"
      onPress={onPress}
    >
      <Image
        source={require("../../assets/images/UserIcon.png")}
        className="h-[52px] w-[52px]"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
