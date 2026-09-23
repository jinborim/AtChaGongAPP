import { Image, Pressable, Text, View } from "react-native";

type Props = {
  balance: number;
  onPress?: () => void;
  compact?: boolean;
};

export default function CoinBalance({ balance, onPress, compact = false }: Props) {
  const content = (
    <>
      <Image
        source={require("../assets/images/Coin.png")}
        className={compact ? "h-5 w-5" : "h-6 w-6"}
        resizeMode="contain"
      />
      <Text
        className={`font-maru text-primary ${compact ? "text-xs" : "text-sm"}`}
      >
        {balance.toLocaleString("ko-KR")}
      </Text>
    </>
  );

  const className = `flex-row items-center rounded-full bg-white/75 ${
    compact ? "h-8 gap-x-1.5 px-2.5" : "h-10 gap-x-2 px-3"
  }`;

  if (!onPress) {
    return <View className={className}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`보유 코인 ${balance.toLocaleString("ko-KR")}개, 상점으로 이동`}
      className={className}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
