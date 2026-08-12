import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
      <Link href="../router/homeSetting" style={styles.button}>
        로그인으로 이동
      </Link>
      <Link href="/month" style={styles.button}>
        월별 통계로 이동
      </Link>
      <Link href="/mypage" style={styles.button}>
        마이페이지로 이동
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
