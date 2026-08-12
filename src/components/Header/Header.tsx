import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <View className="relative h-10 w-full flex-row items-center mt-20 justify-center">
      {showBack && (
        <Pressable
          onPress={() => router.back()}
          className="absolute left-5 items-center justify-center"
        >
          <ChevronLeft size={30} color="#183765" strokeWidth={3} />
        </Pressable>
      )}

      <Text className="font-maru text-2xl text-primary">{title}</Text>
    </View>
  );
}
