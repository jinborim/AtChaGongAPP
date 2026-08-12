import { Image, TouchableOpacity } from "react-native";

type StatisticsNavigationButtonProps = {
  onPress: () => void;
};

export default function StatisticsNavigationButton({
  onPress,
}: StatisticsNavigationButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel="통계"
      accessibilityRole="button"
      className="h-[52px] w-[52px] items-center justify-center rounded-[28px]"
      onPress={onPress}
    >
      <Image
        source={require("../../assets/images/RecordIcon.png")}
        className="h-[52px] w-[52px]"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
