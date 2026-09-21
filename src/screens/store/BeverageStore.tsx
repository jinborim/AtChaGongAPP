import NavigationBar from "@/src/components/NavigationBar/NavigationBar";
import CustomModal from "@/src/components/Modal/CustomModal";
import Image from "@/src/components/CachedImage/CachedImage";
import { useState } from "react";
import {
  SAMPLE_BEVERAGES,
  BEVERAGE_CATEGORIES,
  type BeverageCategory,
  getBeverageImageStyle,
  type BeveragePreview,
} from "@/src/features/beverages/sampleBeverages";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const INK = "#18335E";
const ACCENTS = ["#DCEEFF", "#FFF3BD", "#FFE1D9", "#E5F4CF"];
// 화면 구성 확인용 예시 가격입니다. 실제 구매/보유 데이터와 연결하지 않습니다.
const PREVIEW_COINS: Record<string, number> = {
  "preview-lemonade": 100,
  "preview-grapefruit-ade": 100,
  "preview-green-grape-ade": 100,
};

function DrinkImage({ beverage }: { beverage: BeveragePreview }) {
  return (
    <View
      style={styles.drinkImage}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={beverage.focusImages[0]}
        contentFit="contain"
        style={[styles.drinkImage, getBeverageImageStyle(beverage)]}
      />
      {beverage.previewTint && (
        <Image
          source={beverage.focusImages[0]}
          contentFit="contain"
          style={[
            styles.drinkImage,
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

export default function BeverageStore() {
  const router = useRouter();
  const [purchaseBeverage, setPurchaseBeverage] = useState<BeveragePreview | null>(null);
  const [category, setCategory] = useState<BeverageCategory>("all");
  const products = SAMPLE_BEVERAGES.filter((beverage) =>
    category === "all" || (category === "limited" ? beverage.isLimited : beverage.category === category),
  );
  const productRows = Array.from(
    { length: Math.ceil(products.length / 2) },
    (_, index) => products.slice(index * 2, index * 2 + 2),
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>음료 상점</Text>
        <Text style={styles.headerSubtitle}>오늘의 집중에 시원함 한 잔</Text>
        <View style={styles.balanceCard} accessible accessibilityLabel="보유 코인, 잔액 미확인">
          <Text style={styles.balanceLabel}>보유 코인</Text>
          <View style={styles.balanceAmount}>
            <Image
              source={require("../../assets/images/Coin.png")}
              style={styles.balanceCoin}
              contentFit="contain"
              accessible={false}
            />
            {/* 잔액 API 연결 전에는 실제 보유 금액을 임의로 표시하지 않습니다. */}
            <Text style={styles.balanceValue}>— 코인</Text>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.scrollViewport}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.welcome}>
            <Image
              source={require("../../assets/images/PenguinPartTime.png")}
              contentFit="contain"
              style={styles.storeArt}
            />
            <View style={styles.welcomeCopy}>
              <Text style={styles.eyebrow}>ATCHAGONG DRINK SHOP</Text>
              <Text style={styles.welcomeTitle}>
                어서 오세요!{"\n"}어떤 음료를 찾으세요?
              </Text>
            </View>
          </View>

          <View style={styles.shopWindow}>
            <View style={styles.sign}>
              <Text style={styles.signText}>음료 둘러보기</Text>
            </View>
            <View style={styles.awning} accessibilityElementsHidden>
              {Array.from({ length: 10 }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stripe,
                    {
                      backgroundColor: index % 2 === 0 ? "#73C0FF" : "#FFFDF5",
                    },
                  ]}
                />
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {BEVERAGE_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: category === item.id }}
                  accessibilityLabel={`${item.name} 음료`}
                  onPress={() => setCategory(item.id)}
                  activeOpacity={0.75}
                  style={[styles.categoryTab, category === item.id && styles.categoryTabSelected]}
                >
                  <Text style={[styles.categoryText, category === item.id && styles.categoryTextSelected]}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.categorySummary}>
              <Text style={styles.categorySummaryText}>{BEVERAGE_CATEGORIES.find((item) => item.id === category)?.name} 음료</Text>
              <Text style={styles.categorySummaryText}>{products.length}종</Text>
            </View>
            <View style={styles.productGrid}>
              {productRows.map((row) => (
                <View key={row[0].id} style={styles.productRow}>
                  {row.map((beverage) => (
                    <View
                      key={beverage.id}
                      style={styles.productCard}
                    >
                      <Text style={styles.productName}>{beverage.name}</Text>
                      <View
                        style={[
                          styles.artBoard,
                          {
                            backgroundColor:
                              ACCENTS[
                                SAMPLE_BEVERAGES.indexOf(beverage) % ACCENTS.length
                              ],
                          },
                        ]}
                      >
                        <DrinkImage beverage={beverage} />
                      </View>
                      {beverage.isOwned ? (
                        <View style={[styles.priceRow, styles.ownedPriceRow]}>
                          <Text style={styles.priceText}>기본 지급</Text>
                        </View>
                      ) : (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${beverage.name}, ${PREVIEW_COINS[beverage.id].toLocaleString("ko-KR")} 코인, 구매`}
                        onPress={() => setPurchaseBeverage(beverage)}
                        activeOpacity={0.7}
                        style={styles.purchaseButton}
                      >
                          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                            <View style={styles.pixelShadow} />
                            <View style={styles.pixelOutlineHorizontal} />
                            <View style={styles.pixelOutlineVertical} />
                            <View style={styles.pixelFillHorizontal} />
                            <View style={styles.pixelFillVertical} />
                            <View style={styles.pixelHighlight} />
                            <View style={styles.pixelBottomShade} />
                          </View>
                          <View style={styles.purchaseButtonContent} pointerEvents="none">
                          <Image
                            source={require("../../assets/images/Coin.png")}
                            style={styles.cashIcon}
                            contentFit="contain"
                            accessible={false}
                          />
                        <Text style={[styles.priceText, styles.purchaseButtonText]}>
                          {`${PREVIEW_COINS[beverage.id].toLocaleString("ko-KR")} 코인`}
                        </Text>
                          </View>
                      </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {row.length === 1 && (
                    <View
                      pointerEvents="none"
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={[styles.productCard, styles.emptyProductSlot]}
                    />
                  )}
                </View>
              ))}
            </View>
            {products.length === 0 && (
              <View style={styles.emptyCategory}>
                <Text style={styles.emptyCategoryTitle}>아직 등록된 음료가 없어요</Text>
                <Text style={styles.emptyCategoryHint}>새로운 한정판 음료를 기다려 주세요.</Text>
              </View>
            )}
            <Text style={styles.comingSoonText}>판매 준비 중</Text>
          </View>

          <View style={styles.collectionSection}>
            <View style={styles.collectionLink}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowName}>내 음료가 궁금하다면?</Text>
                <Text style={styles.collectionHint}>
                  음료 도감에서 확인해 보세요
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="음료 도감 보기"
                onPress={() => router.push("/mypage/beverages")}
                activeOpacity={0.7}
                style={styles.collectionButton}
              >
                <Image source={require("../../assets/images/Encyclopedia.png")} contentFit="contain" style={styles.collectionButtonIcon} />
                <Text style={styles.collectionButtonText}>음료 도감 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <View pointerEvents="none" style={styles.navBackground} />
      <NavigationBar />
      <CustomModal
        visible={purchaseBeverage !== null}
        onClose={() => setPurchaseBeverage(null)}
        onConfirm={() => setPurchaseBeverage(null)}
        title="구매"
        description="구매하시겠습니까?"
        buttonCount={2}
        confirmText="확인"
        cancelText="취소"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryList: { padding: 12, gap: 8 },
  categoryTab: { minWidth: 64, minHeight: 44, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#E8F3FC", borderWidth: 2, borderColor: "#C2D5E7", borderBottomWidth: 4 },
  categoryTabSelected: { backgroundColor: INK, borderColor: "#102744" },
  categoryText: { fontFamily: "Mulmaru", fontSize: 15, color: INK },
  categoryTextSelected: { color: "#FFFFFF" },
  categorySummary: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingBottom: 4 },
  categorySummaryText: { fontFamily: "Mulmaru", fontSize: 12, color: "#6C8097" },
  emptyCategory: { minHeight: 200, alignItems: "center", justifyContent: "center", padding: 16, gap: 10 },
  emptyCategoryTitle: { fontFamily: "Mulmaru", fontSize: 16, color: INK, textAlign: "center" },
  emptyCategoryHint: { fontFamily: "Mulmaru", fontSize: 12, color: "#6C8097", textAlign: "center" },
  screen: { flex: 1, backgroundColor: "#E8F3FC" },
  header: { alignItems: "center", paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontFamily: "Mulmaru", fontSize: 28, color: INK },
  headerSubtitle: {
    fontFamily: "Mulmaru",
    fontSize: 12,
    color: "#6C8097",
    marginTop: 5,
  },
  balanceCard: {
    alignSelf: "center",
    width: "90%",
    maxWidth: 520,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: "#FFFDF5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  balanceLabel: { fontFamily: "Mulmaru", fontSize: 15, color: INK },
  balanceAmount: { flexDirection: "row", alignItems: "center", gap: 8 },
  balanceCoin: { width: 24, height: 24 },
  balanceValue: { fontFamily: "Mulmaru", fontSize: 20, color: INK },
  scrollViewport: { flex: 1, minHeight: 0, marginBottom: 100 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  content: {
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  welcome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  storeArt: { width: 84, height: 84 },
  welcomeCopy: { flex: 1 },
  eyebrow: {
    fontFamily: "Mulmaru",
    fontSize: 9,
    color: "#6C8097",
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontFamily: "Mulmaru",
    fontSize: 18,
    lineHeight: 25,
    color: INK,
    marginTop: 7,
  },
  shopWindow: {
    borderWidth: 4,
    borderColor: INK,
    backgroundColor: "#FFFDF5",
    flexShrink: 0,
  },
  sign: { paddingVertical: 10, alignItems: "center", backgroundColor: INK },
  signText: {
    fontFamily: "Mulmaru",
    fontSize: 17,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  awning: {
    height: 22,
    flexDirection: "row",
    borderBottomWidth: 3,
    borderBottomColor: INK,
  },
  stripe: { flex: 1 },
  productGrid: {
    gap: 14,
    padding: 12,
  },
  productRow: { flexDirection: "row", alignItems: "stretch", gap: 12 },
  emptyProductSlot: { opacity: 0 },
  productCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: "#FFFFFF",
    padding: 8,
  },
  productName: {
    fontFamily: "Mulmaru",
    fontSize: 15,
    color: INK,
    textAlign: "center",
    minHeight: 36,
    textAlignVertical: "center",
    marginBottom: 6,
  },
  artBoard: { height: 148, alignItems: "center", justifyContent: "center" },
  drinkImage: { width: 88, height: 124 },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    marginTop: 8,
  },
  cashIcon: {
    width: 18,
    height: 18,
  },
  ownedPriceRow: {
    backgroundColor: "#FFF3CE",
    borderRadius: 0,
  },
  purchaseButton: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
    paddingVertical: 10,
  },
  purchaseButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    // 아래쪽 4px 그림자를 제외한 버튼 표면의 중앙에 맞춥니다.
    transform: [{ translateY: -2 }],
  },
  purchaseButtonText: {
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  pixelShadow: {
    position: "absolute", left: 4, right: 4, top: 8, bottom: 0,
    backgroundColor: "#80541B",
  },
  pixelOutlineHorizontal: {
    position: "absolute", left: 4, right: 4, top: 0, bottom: 4,
    backgroundColor: INK,
  },
  pixelOutlineVertical: {
    position: "absolute", left: 0, right: 0, top: 4, bottom: 8,
    backgroundColor: INK,
  },
  pixelFillHorizontal: {
    position: "absolute", left: 4, right: 4, top: 8, bottom: 12,
    backgroundColor: "#FFDC79",
  },
  pixelFillVertical: {
    position: "absolute", left: 8, right: 8, top: 4, bottom: 8,
    backgroundColor: "#FFDC79",
  },
  pixelHighlight: {
    position: "absolute", left: 8, right: 8, top: 4, height: 4,
    backgroundColor: "#FFF3BD",
  },
  pixelBottomShade: {
    position: "absolute", left: 8, right: 8, bottom: 8, height: 4,
    backgroundColor: "#D6A33B",
  },
  priceText: { fontFamily: "Mulmaru", fontSize: 15, lineHeight: 18, color: INK },
  comingSoonText: {
    fontFamily: "Mulmaru",
    fontSize: 12,
    color: "#6C8097",
    textAlign: "center",
    paddingBottom: 14,
    paddingTop: 2,
  },
  rowCopy: { alignItems: "center" },
  rowName: { fontFamily: "Mulmaru", fontSize: 17, color: INK },
  collectionSection: { paddingTop: 44, flexShrink: 0 },
  collectionLink: {
    flexShrink: 0,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#C2D5E7",
    paddingVertical: 18,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  collectionHint: {
    fontFamily: "Mulmaru",
    fontSize: 12,
    color: "#6C8097",
    marginTop: 6,
  },
  collectionButton: {
    alignSelf: "stretch",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#B7DEFE",
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: INK,
  },
  collectionButtonIcon: { width: 24, height: 28 },
  collectionButtonText: { fontFamily: "Mulmaru", fontSize: 16, color: INK },
  navBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#E8F3FC",
  },
});
