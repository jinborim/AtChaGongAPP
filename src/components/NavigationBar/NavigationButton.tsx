import { Image } from "expo-image";
import { type ImageSourcePropType, TouchableOpacity } from "react-native";

type NavigationButtonProps = {
  label: string;
  icon: ImageSourcePropType;
  iconSize?: number;
  iconOffsetY?: number;
  onPress: () => void;
};

export default function NavigationButton({
  label,
  icon,
  iconSize = 52,
  iconOffsetY = 0,
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
        style={{
          width: iconSize,
          height: iconSize,
          transform: [{ translateY: iconOffsetY }],
        }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    </TouchableOpacity>
  );
}
