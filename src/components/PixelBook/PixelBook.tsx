import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

function GoldCorner({ rotation }: { rotation: number }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
      <Path d="M0 0H28V8H8V28H0Z" fill="#18335E" />
      <Path d="M2 2H26V6H6V26H2Z" fill="#D8A347" />
      <Path d="M2 2H26V4H4V26H2Z" fill="#FFE5A0" />
      <Path d="M10 10H18V13H21V21H13V18H10ZM13 13V16H16V18H18V15H16V13Z" fill="#C79743" fillRule="evenodd" />
    </Svg>
  );
}

/** Code-drawn book frame: stays sharp at any screen size and grows with its contents. */
export default function PixelBook({ children }: PropsWithChildren) {
  return (
    <View style={styles.shadow}>
      <View style={styles.cover}>
        <View pointerEvents="none" style={styles.spine} />
        <View pointerEvents="none" style={styles.coverHighlight} />
        <View style={styles.pages}>
          <View style={styles.paper}>
            <View pointerEvents="none" style={styles.innerRule} />
            <View style={styles.content}>{children}</View>
          </View>
        </View>
        <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
          <View style={styles.topLeft}><GoldCorner rotation={0} /></View>
          <View style={styles.topRight}><GoldCorner rotation={90} /></View>
          <View style={styles.bottomRight}><GoldCorner rotation={180} /></View>
          <View style={styles.bottomLeft}><GoldCorner rotation={270} /></View>
          <View style={styles.clasp}><View style={styles.claspGem} /></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { width: "100%", backgroundColor: "#142B4C", paddingBottom: 5, paddingRight: 3, marginBottom: 6 },
  cover: { backgroundColor: "#25549A", borderWidth: 3, borderColor: "#142B4C", paddingTop: 12, paddingBottom: 14, paddingLeft: 17, paddingRight: 12 },
  spine: { position: "absolute", top: 8, bottom: 8, left: 4, width: 7, backgroundColor: "#173968", borderLeftWidth: 2, borderColor: "#6083B7" },
  coverHighlight: { position: "absolute", left: 22, right: 22, top: 2, height: 3, backgroundColor: "#78A2D4" },
  pages: { backgroundColor: "#D4BF99", borderWidth: 2, borderColor: "#8F7959", paddingRight: 3, paddingBottom: 5 },
  paper: { backgroundColor: "#FFF8E5", borderWidth: 2, borderColor: "#F1DFC0" },
  innerRule: { position: "absolute", top: 8, bottom: 8, left: 8, right: 8, borderWidth: 1, borderColor: "#D8B66C" },
  content: { paddingHorizontal: 17, paddingTop: 24, paddingBottom: 22, minHeight: 530 },
  topLeft: { position: "absolute", top: -3, left: -3 },
  topRight: { position: "absolute", top: -3, right: -3 },
  bottomLeft: { position: "absolute", bottom: -3, left: -3 },
  bottomRight: { position: "absolute", bottom: -3, right: -3 },
  clasp: { position: "absolute", top: "45%", right: -7, width: 16, height: 38, backgroundColor: "#E5B858", borderWidth: 3, borderColor: "#77542C", alignItems: "center", justifyContent: "center" },
  claspGem: { width: 6, height: 10, backgroundColor: "#275591" },
});
