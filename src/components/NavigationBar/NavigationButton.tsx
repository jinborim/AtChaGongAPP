import {
  Image,
  type ImageSourcePropType,
  TouchableOpacity,
} from "react-native";

type NavigationButtonProps = {
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
};

export default function NavigationButton({
  label,
  icon,
  onPress,
}: NavigationButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-[52px] w-[52px] items-center justify-center rounded-[28px]"
      onPress={onPress}
    >
      <Image
        source={icon}
        className="h-[52px] w-[52px]"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
