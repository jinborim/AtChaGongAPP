import {
  SAMPLE_BEVERAGES,
  getBeverageImageStyle,
  type BeveragePreview,
} from "@/src/features/beverages/sampleBeverages";
import {
  getOwnedBeverages,
  toOwnedBeveragePreview,
} from "@/src/features/beverages/beverageApi";
import { useFocusEffect, useRouter } from "expo-router";
import PixelBook from "@/src/components/PixelBook/PixelBook";
import Image from "@/src/components/CachedImage/CachedImage";
import { preloadBeverageImages } from "@/src/features/beverages/preloadBeverageImages";
import { useAuth } from "@/src/features/auth";
import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const INK = "#18335E";
const PAPER = "#FFFDF5";
const ACCENTS = ["#DCEEFF", "#FFF3BD", "#FFE1D9", "#E5F4CF"];
const DESCRIPTIONS: Record<string, string> = {
  "preview-original": "맑고 시원한 얼음이 가득한 기본 음료.\n오늘의 첫 집중을 함께 시작해요.",
  "preview-lemonade": "상큼한 레몬과 시원한 얼음이 만난 에이드.\n산뜻한 기분으로 오늘의 집중을 시작해요.",
  "preview-grapefruit-ade": "달콤 쌉싸름한 자몽을 담은 얼음 에이드.\n차곡차곡 쌓이는 집중 시간에 활기를 더해요.",
  "preview-green-grape-ade": "싱그러운 청포도가 가득한 얼음 에이드.\n시원한 한 잔과 함께 나만의 집중 시간을 채워요.",
};

function PixelIcon({
  kind,
  size = 24,
}: {
  kind: "back" | "close" | "sparkle";
  size?: number;
}) {
  const paths = {
    back: "M3 1h2v2H3v2H1V3h2z M1 5h2v2h2v2H3V7H1z M3 4h6v2H3z",
    close:
      "M1 1h2v2H1z M3 3h2v2H3z M5 5h2v2H5z M7 7h2v2H7z M7 1h2v2H7z M5 3h2v2H5z M3 5h2v2H3z M1 7h2v2H1z",
    sparkle: "M4 0h2v3h1v1h3v2H7v1H6v3H4V7H3V6H0V4h3V3h1z",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10" accessible={false}>
      <Path d={paths[kind]} fill={INK} />
    </Svg>
  );
}

function PixelPanel({
  children,
  fill = PAPER,
}: PropsWithChildren<{ fill?: string }>) {
  return (
    <View style={styles.panel}>
      <View pointerEvents="none" style={styles.panelShadow} />
      <View style={{ margin: 4, backgroundColor: fill, flexShrink: 1 }}>
        {children}
      </View>
      <View pointerEvents="none" style={[styles.edge, styles.topEdge]} />
      <View pointerEvents="none" style={[styles.edge, styles.bottomEdge]} />
      <View pointerEvents="none" style={[styles.edge, styles.leftEdge]} />
      <View pointerEvents="none" style={[styles.edge, styles.rightEdge]} />
    </View>
  );
}

function BeverageArt({
  beverage,
  large = false,
}: {
  beverage: BeveragePreview;
  large?: boolean;
}) {
  const dimensions = { width: large ? 154 : 84, height: large ? 208 : 114 };

  return (
    <View
      style={dimensions}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={beverage.focusImages[0]}
        style={[dimensions, getBeverageImageStyle(beverage)]}
        contentFit="contain"
      />
      {beverage.previewTint && (
        <Image
          source={beverage.focusImages[0]}
          contentFit="contain"
          style={[
            dimensions,
            {
              position: "absolute",
              tintColor: beverage.previewTint,
              opacity: 0.38,
            },
          ]}
        />
      )}
    </View>
  );
}

export default function BeverageCollection() {
  const router = useRouter();
  const { isGuest } = useAuth();
  useEffect(() => { void preloadBeverageImages(); }, []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [beverages, setBeverages] = useState<BeveragePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadOwnedBeverages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    if (isGuest) {
      setBeverages([SAMPLE_BEVERAGES[0]]);
      setPage(0);
      setSelectedIndex(null);
      setIsLoading(false);
      return;
    }

    try {
      const ownedBeverages = await getOwnedBeverages();
      setBeverages(ownedBeverages.map(toOwnedBeveragePreview));
      setPage(0);
      setSelectedIndex(null);
    } catch (error) {
      console.log("내 보유 음료 목록 조회 오류:", error);
      setBeverages([SAMPLE_BEVERAGES[0]]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useFocusEffect(
    useCallback(() => {
      void loadOwnedBeverages();
    }, [loadOwnedBeverages]),
  );

  const pageCount = Math.max(1, Math.ceil(beverages.length / 2));
  const pageBeverages = beverages.slice(page * 2, page * 2 + 2);
  const selected = selectedIndex === null ? null : beverages[selectedIndex];
  const closeDetails = () => setSelectedIndex(null);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="마이페이지로 돌아가기"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/mypage")
          }
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <PixelIcon kind="back" />
        </Pressable>
        <Text style={styles.headerTitle}>음료 도감</Text>
        <View style={styles.headerButton}>
          <PixelIcon kind="sparkle" size={20} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PixelBook>
            <View style={styles.chapterRow}>
              <Text style={styles.chapterTitle}>CHAPTER 01</Text>
              <Text style={styles.chapterTitle}>VOL. 01</Text>
            </View>
            <Text style={styles.bookTitle}>나의 음료 컬렉션</Text>
            <Text style={styles.bookCount}>컬렉션에 담긴 음료 · {beverages.length}잔</Text>
            <Text style={styles.sectionHint}>음료를 눌러 도감 기록을 펼쳐보세요</Text>
            <View style={styles.paperRule} />

        {isLoading ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusText}>보유 음료를 불러오고 있어요</Text>
          </View>
        ) : beverages.length === 0 ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusText}>아직 보유한 음료가 없어요</Text>
          </View>
        ) : (
        <>
        {loadError && (
          <View style={styles.errorNotice}>
            <Text style={styles.statusText}>보유 목록을 불러오지 못해 기본 음료만 표시해요</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="보유 음료 목록 다시 불러오기"
              onPress={() => void loadOwnedBeverages()}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>다시 불러오기</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.grid}>
          {pageBeverages.map((beverage, slot) => {
            const index = page * 2 + slot;
            return (
            <TouchableOpacity
              key={beverage.id}
              accessibilityRole="button"
              accessibilityLabel={beverage.name + " 상세 보기"}
              onPress={() => setSelectedIndex(index)}
              style={styles.card}
              activeOpacity={0.75}
            >
              <View style={styles.albumCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardNumber}>
                    NO. {String(index + 1).padStart(3, "0")}
                  </Text>
                  <View style={styles.ownedMark}>
                    <Text style={styles.ownedText}>수집</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.artBoard,
                    { backgroundColor: "#F6EDD7" },
                  ]}
                >
                  <View style={styles.pixelDecorationTop} />
                  <BeverageArt beverage={beverage} />
                  <View style={styles.pixelDecorationBottom} />
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardName}>{beverage.name}</Text>
                  <Text style={styles.cardSubtitle}>COLLECTED</Text>
                </View>
              </View>
            </TouchableOpacity>
          );})}
        </View>
        </>
        )}
            <View style={styles.albumNote}>
              <PixelIcon kind="sparkle" size={12} />
              <Text style={styles.albumNoteText}>좋아하는 음료를 모아 나만의 도감을 채워보세요.</Text>
            </View>
            {beverages.length > 0 && (
            <View style={styles.pageNavigation}>
              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel="이전 도감 페이지"
                accessibilityState={{ disabled: page === 0 }} disabled={page === 0}
                onPress={() => setPage((value) => value - 1)}
                style={[styles.pageButton, page === 0 && styles.pageButtonDisabled]}
              ><PixelIcon kind="back" size={18} /></TouchableOpacity>
              <Text accessibilityLiveRegion="polite" style={styles.pageNumber}>
                {String(page + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
              </Text>
              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel="다음 도감 페이지"
                accessibilityState={{ disabled: page === pageCount - 1 }} disabled={page === pageCount - 1}
                onPress={() => setPage((value) => value + 1)}
                style={[styles.pageButton, page === pageCount - 1 && styles.pageButtonDisabled]}
              ><View style={{ transform: [{ rotate: "180deg" }] }}><PixelIcon kind="back" size={18} /></View></TouchableOpacity>
            </View>
            )}
        </PixelBook>

      </ScrollView>

      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDetails}
            accessibilityLabel="음료 상세 닫기"
            accessibilityRole="button"
          />
          {selected && selectedIndex !== null && (
            <View style={styles.modalPanel} accessibilityViewIsModal>
              <PixelPanel>
                <ScrollView
                  contentContainerStyle={styles.detailContent}
                  bounces={false}
                >
                  <View style={styles.detailTop}>
                    <Text style={styles.cardNumber}>
                      NO. {String(selectedIndex + 1).padStart(3, "0")}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="닫기"
                      onPress={closeDetails}
                      style={styles.closeButton}
                    >
                      <PixelIcon kind="close" size={20} />
                    </Pressable>
                  </View>
                  <View
                    style={[
                      styles.detailArt,
                      {
                        backgroundColor:
                          ACCENTS[selectedIndex % ACCENTS.length],
                      },
                    ]}
                  >
                    <BeverageArt beverage={selected} large />
                  </View>
                  <Text style={styles.detailName}>{selected.name}</Text>
                  <Text style={styles.detailDescription}>
                    {DESCRIPTIONS[selected.templateId ?? selected.id]}
                  </Text>
                  <View style={styles.detailNote}>
                    <Text style={styles.detailNoteText}>
                      메인 화면에서 타이머를 시작하기 전에{"\n"}컵을 좌우로 밀어
                      골라보세요.
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={closeDetails}
                    style={({ pressed }) => [
                      styles.confirmButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={styles.confirmText}>도감으로 돌아가기</Text>
                  </Pressable>
                </ScrollView>
              </PixelPanel>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  albumTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  albumIcon: { width: 44, height: 52 },
  bookTitle: { fontFamily: "Mulmaru", fontSize: 24, lineHeight: 32, color: INK, textAlign: "center" },
  bookCount: { fontFamily: "Mulmaru", fontSize: 13, color: "#8E713F", textAlign: "center", marginTop: 10 },
  albumCard: { backgroundColor: "#FFF9E9", borderWidth: 1, borderColor: "#D4B977", padding: 3 },
  chapterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  chapterTitle: { fontFamily: "Mulmaru", fontSize: 10, letterSpacing: 2, color: "#8E8068" },
  bookmark: { backgroundColor: "#315D76", paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 4, borderColor: "#8FB3C6" },
  bookmarkText: { fontFamily: "Mulmaru", fontSize: 12, color: "#FFFFFF" },
  paperRule: { height: 2, backgroundColor: "#DCD1BC", marginVertical: 16 },
  albumNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 26, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E5DCC9" },
  albumNoteText: { fontFamily: "Mulmaru", fontSize: 11, lineHeight: 17, color: "#8E8068", flexShrink: 1 },
  pageNavigation: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 18 },
  pageButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: "#F0E6D0", borderWidth: 2, borderColor: "#C5B797" },
  pageButtonDisabled: { opacity: 0.3 },
  pageNumber: { fontFamily: "Mulmaru", fontSize: 14, letterSpacing: 2, color: INK },
  screen: { flex: 1, backgroundColor: "#DCE9EB" },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "Mulmaru", fontSize: 26, color: INK },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 12,
    alignSelf: "center",
    width: "100%",
    maxWidth: 620,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  smallSquare: { width: 6, height: 6, backgroundColor: INK },
  eyebrow: {
    fontFamily: "Mulmaru",
    fontSize: 11,
    color: INK,
    letterSpacing: 2,
  },
  panel: { position: "relative", flexShrink: 1 },
  panelShadow: {
    position: "absolute",
    top: 8,
    bottom: -4,
    left: 8,
    right: -4,
    backgroundColor: "#B0C4D8",
  },
  edge: { position: "absolute", backgroundColor: INK },
  topEdge: { left: 4, right: 4, top: 0, height: 4 },
  bottomEdge: { left: 4, right: 4, bottom: 0, height: 4 },
  leftEdge: { top: 4, bottom: 4, left: 0, width: 4 },
  rightEdge: { top: 4, bottom: 4, right: 0, width: 4 },
  cover: { padding: 14 },
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  coverLabel: {
    fontFamily: "Mulmaru",
    color: "#66778C",
    fontSize: 12,
    flex: 1,
  },
  volume: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#E8F3FC",
    borderWidth: 1,
    borderColor: INK,
  },
  volumeText: { fontFamily: "Mulmaru", fontSize: 10, color: INK },
  coverTitle: {
    fontFamily: "Mulmaru",
    fontSize: 23,
    lineHeight: 30,
    color: INK,
    marginTop: 0,
  },
  coverDescription: {
    fontFamily: "Mulmaru",
    fontSize: 13,
    lineHeight: 20,
    color: "#66778C",
    marginTop: 4,
  },
  coverRule: { height: 2, backgroundColor: "#D9E0E7", marginVertical: 16 },
  coverBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caption: { fontFamily: "Mulmaru", fontSize: 14, color: INK },
  collectionCount: { fontFamily: "Mulmaru", fontSize: 28, color: INK },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: { fontFamily: "Mulmaru", fontSize: 20, color: INK },
  sectionHint: { fontFamily: "Mulmaru", fontSize: 11, lineHeight: 17, color: "#8E8068", marginTop: 8, textAlign: "center" },
  statusPanel: { minHeight: 300, alignItems: "center", justifyContent: "center", gap: 16 },
  errorNotice: { alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 18 },
  statusText: { fontFamily: "Mulmaru", fontSize: 14, color: "#8E8068", textAlign: "center" },
  retryButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 18, backgroundColor: INK, borderWidth: 2, borderColor: "#102744" },
  retryButtonText: { fontFamily: "Mulmaru", fontSize: 14, color: "#FFFFFF" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  card: { width: "47.5%" },
  cardHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 7,
    gap: 5,
  },
  cardNumber: { fontFamily: "Mulmaru", fontSize: 10, color: "#66778C" },
  ownedMark: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: "#DFEEE5",
  },
  ownedText: { fontFamily: "Mulmaru", fontSize: 10, color: "#37694E" },
  artBoard: {
    height: 148,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pixelDecorationTop: {
    position: "absolute",
    width: 8,
    height: 8,
    top: 9,
    left: 9,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
  pixelDecorationBottom: {
    position: "absolute",
    width: 6,
    height: 6,
    bottom: 10,
    right: 10,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
  cardFooter: {
    paddingHorizontal: 8,
    paddingVertical: 13,
    alignItems: "center",
    gap: 5,
  },
  cardName: {
    fontFamily: "Mulmaru",
    fontSize: 14,
    color: INK,
    textAlign: "center",
    minHeight: 38,
    lineHeight: 19,
  },
  cardSubtitle: {
    fontFamily: "Mulmaru",
    fontSize: 8,
    letterSpacing: 1,
    color: "#73839A",
  },
  pageFooter: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerRule: { height: 2, flex: 1, backgroundColor: "#C7D7E6" },
  footerText: { fontFamily: "Mulmaru", fontSize: 11, color: "#66778C" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 36, 62, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalPanel: { width: "100%", maxWidth: 380, maxHeight: "88%" },
  detailContent: { padding: 18 },
  detailTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  detailArt: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  detailName: {
    fontFamily: "Mulmaru",
    fontSize: 26,
    color: INK,
    textAlign: "center",
    marginTop: 20,
  },
  detailDescription: {
    fontFamily: "Mulmaru",
    fontSize: 15,
    lineHeight: 23,
    color: "#66778C",
    textAlign: "center",
    marginTop: 12,
  },
  detailNote: { backgroundColor: "#EAF2F8", padding: 12, marginTop: 20 },
  detailNoteText: {
    fontFamily: "Mulmaru",
    fontSize: 12,
    lineHeight: 19,
    color: INK,
    textAlign: "center",
  },
  confirmButton: {
    minHeight: 48,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    padding: 12,
  },
  confirmText: { fontFamily: "Mulmaru", fontSize: 16, color: "#FFFFFF" },
});
