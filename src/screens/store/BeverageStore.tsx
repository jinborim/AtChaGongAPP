import NavigationBar from "@/src/components/NavigationBar/NavigationBar";
import CustomModal from "@/src/components/Modal/CustomModal";
import LoginRequiredModal from "@/src/components/Modal/LoginRequiredModal";
import Image from "@/src/components/CachedImage/CachedImage";
import {
  BEVERAGE_CATEGORIES,
  findBeveragePreviewTemplate,
  type BeverageCategory,
  getBeverageImageStyle,
  type BeveragePreview,
} from "@/src/features/beverages/sampleBeverages";
import {
  getSaleBeverages,
  getOwnedBeverages,
  purchaseBeverage,
  type SaleBeverage,
} from "@/src/features/beverages/beverageApi";
import { ApiError } from "@/src/api";
import { useAuth } from "@/src/features/auth";
import { getCoinBalance } from "@/src/features/coin";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const INK = "#18335E";
const ACCENTS = ["#DCEEFF", "#FFF3BD", "#FFE1D9", "#E5F4CF"];

type StoreBeverage = BeveragePreview & {
  beverageId: number;
  price: number;
  saleEndsAt: string | null;
};

type PurchaseNotice = {
  title: string;
  description: string;
  imageSource?: ImageSourcePropType;
};

function toStoreBeverage(
  beverage: SaleBeverage,
  ownedBeverageIds: ReadonlySet<number>,
): StoreBeverage {
  const preview = findBeveragePreviewTemplate(beverage);

  return {
    ...preview,
    id: String(beverage.beverageId),
    beverageId: beverage.beverageId,
    name: beverage.name,
    isOwned:
      beverage.price === 0 || ownedBeverageIds.has(beverage.beverageId),
    isLimited: beverage.isLimited,
    price: beverage.price,
    saleEndsAt: beverage.saleEndsAt,
  };
}

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
  const { isAuthenticated } = useAuth();
  const [purchaseTarget, setPurchaseTarget] = useState<StoreBeverage | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<PurchaseNotice | null>(null);
  const [isPurchaseNoticeOpen, setIsPurchaseNoticeOpen] = useState(false);
  const [isPurchaseLoginPromptOpen, setIsPurchaseLoginPromptOpen] =
    useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [category, setCategory] = useState<BeverageCategory>("all");
  const [saleBeverages, setSaleBeverages] = useState<StoreBeverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);

  const loadSaleBeverages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const beverages = await getSaleBeverages();
      let ownedBeverageIds = new Set<number>();

      try {
        const ownedBeverages = await getOwnedBeverages();
        ownedBeverageIds = new Set(
          ownedBeverages.map((beverage) => beverage.beverageId),
        );
      } catch (error) {
        console.log("판매 음료 보유 여부 조회 오류:", error);
      }

      setSaleBeverages(
        beverages.map((beverage) =>
          toStoreBeverage(beverage, ownedBeverageIds),
        ),
      );
    } catch (error) {
      console.log("판매 음료 목록 조회 오류:", error);
      setSaleBeverages([]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSaleBeverages();

      if (!isAuthenticated) {
        setCoinBalance(0);
        return;
      }

      let active = true;

      getCoinBalance()
        .then((response) => {
          if (active) setCoinBalance(response.balance);
        })
        .catch((error) => {
          console.log("코인 잔액 조회 오류:", error);
          if (active) setCoinBalance(null);
        });

      return () => {
        active = false;
      };
    }, [isAuthenticated, loadSaleBeverages]),
  );

  const handlePurchase = useCallback(async () => {
    if (!purchaseTarget || isPurchasing) return;

    if (!isAuthenticated) {
      setPurchaseTarget(null);
      setIsPurchaseLoginPromptOpen(true);
      return;
    }

    setIsPurchasing(true);

    try {
      const purchase = await purchaseBeverage(purchaseTarget.beverageId);

      setCoinBalance(purchase.balance);
      setSaleBeverages((current) =>
        current.map((beverage) =>
          beverage.beverageId === purchase.beverageId
            ? { ...beverage, isOwned: true }
            : beverage,
        ),
      );
      setPurchaseTarget(null);
      setPurchaseNotice({
        title: "구매 완료",
        description: `${purchase.name} 구매가 완료되었습니다.\n남은 코인: ${purchase.balance.toLocaleString("ko-KR")}코인`,
        imageSource: require("../../assets/images/PenguinPurchaseComplete.png"),
      });
      setIsPurchaseNoticeOpen(true);
    } catch (error) {
      setPurchaseTarget(null);

      if (error instanceof ApiError) {
        switch (error.code) {
          case "INSUFFICIENT_COIN":
            setPurchaseNotice({
              title: "코인이 부족해요",
              description: "보유 코인이 부족합니다.",
              imageSource: require("../../assets/images/PenguinNoCoin.png"),
            });
            setIsPurchaseNoticeOpen(true);
            break;
          case "BEVERAGE_ALREADY_OWNED":
            setSaleBeverages((current) =>
              current.map((beverage) =>
                beverage.beverageId === purchaseTarget.beverageId
                  ? { ...beverage, isOwned: true }
                  : beverage,
              ),
            );
            Alert.alert("이미 보유한 음료예요", error.message);
            break;
          case "DEFAULT_BEVERAGE_PURCHASE_NOT_ALLOWED":
          case "BEVERAGE_NOT_ON_SALE":
            Alert.alert("구매할 수 없어요", error.message);
            break;
          default:
            Alert.alert("구매 실패", error.message);
        }
      } else {
        Alert.alert("구매 실패", "잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [isAuthenticated, isPurchasing, purchaseTarget]);

  const products = saleBeverages.filter((beverage) =>
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
        <View
          style={styles.balanceCard}
          accessible
          accessibilityLabel={
            coinBalance === null
              ? "보유 코인, 잔액 미확인"
              : `보유 코인 ${coinBalance.toLocaleString("ko-KR")}개`
          }
        >
          <Text style={styles.balanceLabel}>보유 코인</Text>
          <View style={styles.balanceAmount}>
            <Image
              source={require("../../assets/images/Coin.png")}
              style={styles.balanceCoin}
              contentFit="contain"
              accessible={false}
            />
            <Text style={styles.balanceValue}>
              {coinBalance === null
                ? "— 코인"
                : `${coinBalance.toLocaleString("ko-KR")} 코인`}
            </Text>
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
            {isLoading ? (
              <View style={styles.statusPanel}>
                <Text style={styles.statusTitle}>판매 음료를 불러오고 있어요</Text>
              </View>
            ) : loadError ? (
              <View style={styles.statusPanel}>
                <Text style={styles.statusTitle}>음료 목록을 불러오지 못했어요</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="판매 음료 목록 다시 불러오기"
                  onPress={() => void loadSaleBeverages()}
                  activeOpacity={0.7}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>다시 불러오기</Text>
                </TouchableOpacity>
              </View>
            ) : (
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
                                Math.max(0, beverage.beverageId - 1) % ACCENTS.length
                              ],
                          },
                        ]}
                      >
                        <DrinkImage beverage={beverage} />
                      </View>
                      {beverage.isOwned ? (
                        <View style={[styles.priceRow, styles.ownedPriceRow]}>
                          <Text style={styles.priceText}>
                            {beverage.price === 0 ? "기본 지급" : "구매 완료"}
                          </Text>
                        </View>
                      ) : (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${beverage.name}, ${beverage.price.toLocaleString("ko-KR")} 코인, 구매`}
                        onPress={() => {
                          if (!isAuthenticated) {
                            setIsPurchaseLoginPromptOpen(true);
                            return;
                          }

                          setPurchaseTarget(beverage);
                        }}
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
                          {`${beverage.price.toLocaleString("ko-KR")} 코인`}
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
            )}
            {!isLoading && !loadError && products.length === 0 && (
              <View style={styles.emptyCategory}>
                <Text style={styles.emptyCategoryTitle}>아직 등록된 음료가 없어요</Text>
                <Text style={styles.emptyCategoryHint}>새로운 한정판 음료를 기다려 주세요.</Text>
              </View>
            )}
            {!isLoading && !loadError && (
              <Text style={styles.comingSoonText}>현재 판매 중인 음료</Text>
            )}
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
        visible={purchaseTarget !== null}
        onClose={() => {
          if (!isPurchasing) setPurchaseTarget(null);
        }}
        onConfirm={() => void handlePurchase()}
        title="구매"
        imageSource={require("../../assets/images/PenguinPurchase.png")}
        description={
          purchaseTarget
            ? `${purchaseTarget.name}을(를) ${purchaseTarget.price.toLocaleString("ko-KR")}코인에 구매하시겠습니까?`
            : "구매하시겠습니까?"
        }
        buttonCount={2}
        confirmText={isPurchasing ? "구매 중..." : "구매"}
        cancelText="취소"
      />
      <CustomModal
        visible={isPurchaseNoticeOpen && purchaseNotice !== null}
        onClose={() => setIsPurchaseNoticeOpen(false)}
        onConfirm={() => setIsPurchaseNoticeOpen(false)}
        title={purchaseNotice?.title ?? "구매 안내"}
        description={purchaseNotice?.description ?? ""}
        imageSource={purchaseNotice?.imageSource}
        buttonCount={1}
        confirmText="확인"
      />
      <LoginRequiredModal
        visible={isPurchaseLoginPromptOpen}
        description="음료를 구매하려면 로그인해 주세요."
        onClose={() => setIsPurchaseLoginPromptOpen(false)}
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
  statusPanel: { minHeight: 200, alignItems: "center", justifyContent: "center", padding: 20, gap: 16 },
  statusTitle: { fontFamily: "Mulmaru", fontSize: 14, color: "#6C8097", textAlign: "center" },
  retryButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 18, backgroundColor: INK, borderWidth: 2, borderColor: "#102744" },
  retryButtonText: { fontFamily: "Mulmaru", fontSize: 14, color: "#FFFFFF" },
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
