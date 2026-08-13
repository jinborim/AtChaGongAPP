import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode; 
}

export default function Header({
  title,
  showBack = false,
  onBack,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View className="relative mt-20 h-10 w-full flex-row items-center justify-center">
      {showBack && (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          className="absolute left-5 items-center justify-center"
        >
          <ChevronLeft size={30} color="#18335E" strokeWidth={3} />
        </Pressable>
      )}

      <Text className="font-maru text-2xl text-primary">{title}</Text>

      {rightAction && <View className="absolute right-5">{rightAction}</View>}
    </View>
  );
}
