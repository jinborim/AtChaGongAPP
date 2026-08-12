import { Image, TouchableOpacity } from "react-native";

type HomeNavigationButtonProps = {
  onPress: () => void;
};

export default function HomeNavigationButton({
  onPress,
}: HomeNavigationButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel="홈"
      accessibilityRole="button"
      className="h-[52px] w-[52px] items-center justify-center rounded-[28px]"
      onPress={onPress}
    >
      <Image
        source={require("../../assets/images/HomeIcon.png")}
        className="h-[52px] w-[52px]"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
