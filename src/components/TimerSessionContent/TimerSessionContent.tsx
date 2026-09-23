import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import {
  SAMPLE_BEVERAGES,
  getBeverageImageStyle,
  type BeveragePreview,
} from "@/src/features/beverages/sampleBeverages";
import {
  getOwnedBeverages,
  getSelectedBeverage,
  selectBeverage,
  toOwnedBeveragePreview,
} from "@/src/features/beverages/beverageApi";
import { useBeverageSwipeHint } from "@/src/features/beverages/useBeverageSwipeHint";
import PixelSwipeHint from "@/src/components/PixelSwipeHint/PixelSwipeHint";
import { useFocusEffect } from "expo-router";
import MeltingLemonAde from "./MeltingLemonAde";
import MeltingIceCup from "./MeltingIceCup";

export type TimerSessionPhase = "focus" | "break";

type TimerSessionContentProps = {
  isRunning: boolean;
  interactionSignal: number;
  phase: TimerSessionPhase;
  focusProgress: number;
  breakProgress: number;
  persistSelection: boolean;
  onBeverageChange: (beverageId: number) => void;
};

const BeverageSlide = memo(function BeverageSlide({
  beverage,
  frameIndex,
  meltProgress,
  animatePhysics,
  width,
}: {
  beverage: BeveragePreview;
  frameIndex: number;
  meltProgress: number;
  animatePhysics: boolean;
  width: number;
}) {
  return (
    <View
      style={{
        width,
        height: 288,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {beverage.iceCupLayers ? (
        <MeltingIceCup
          glassSource={beverage.iceCupLayers.glass}
          iceSource={beverage.iceCupLayers.ice}
          waterSource={beverage.iceCupLayers.water}
          meltProgress={meltProgress}
          animatePhysics={animatePhysics}
        />
      ) : beverage.meltLayers ? (
        <View>
          <MeltingLemonAde
            glassSource={beverage.meltLayers.glass}
            liquidSource={beverage.meltLayers.liquid}
            iceSource={beverage.meltLayers.ice}
            fruitSource={beverage.meltLayers.fruit}
            meltProgress={meltProgress}
            flavor={beverage.meltLayers.flavor}
            animatePhysics={animatePhysics}
          />
        </View>
      ) : (
        beverage.focusImages.map((source, index) => (
          <View
            key={index}
            style={{
              position: "absolute",
              opacity: index === frameIndex ? 1 : 0,
            }}
          >
            <Image
              source={source}
              style={[
                { width: 211, height: 288 },
                getBeverageImageStyle(beverage),
              ]}
              fadeDuration={0}
              resizeMode="contain"
            />
            {beverage.previewTint && (
              <Image
                source={source}
                style={{
                  position: "absolute",
                  width: 211,
                  height: 288,
                  tintColor: beverage.previewTint,
                  opacity: 0.38,
                }}
                fadeDuration={0}
                resizeMode="contain"
              />
            )}
          </View>
        ))
      )}
    </View>
  );
});

export default function TimerSessionContent({
  isRunning,
  interactionSignal,
  phase,
  focusProgress,
  breakProgress,
  persistSelection,
  onBeverageChange,
}: TimerSessionContentProps) {
  const pager = useRef<ScrollView>(null);
  const selectedIndexRef = useRef(0);
  const persistedBeverageIdRef = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [beverages, setBeverages] = useState<readonly BeveragePreview[]>([
    SAMPLE_BEVERAGES[0],
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      void Promise.all([
        getOwnedBeverages(),
        getSelectedBeverage().catch(() => null),
      ])
        .then(([ownedBeverages, selectedBeverage]) => {
          if (!isActive) return;

          const selectedIndex = ownedBeverages.findIndex(
            (beverage) =>
              beverage.beverageId === selectedBeverage?.beverageId,
          );
          const orderedBeverages =
            selectedIndex > 0
              ? [
                  ownedBeverages[selectedIndex],
                  ...ownedBeverages.slice(0, selectedIndex),
                  ...ownedBeverages.slice(selectedIndex + 1),
                ]
              : ownedBeverages;
          const nextBeverages = orderedBeverages.map(
            toOwnedBeveragePreview,
          );
          setBeverages(
            nextBeverages.length > 0 ? nextBeverages : [SAMPLE_BEVERAGES[0]],
          );
          const initialBeverageId = Number(
            nextBeverages[0]?.id ?? SAMPLE_BEVERAGES[0].id,
          );
          if (Number.isFinite(initialBeverageId)) {
            persistedBeverageIdRef.current = initialBeverageId;
            onBeverageChange(initialBeverageId);
          }
          selectedIndexRef.current = 0;
          setSelectedIndex(0);
          pager.current?.scrollTo({ x: 0, animated: false });
        })
        .catch((error) => {
          console.log("내 보유 음료 목록 조회 오류:", error);
        });

      return () => {
        isActive = false;
      };
    }, [onBeverageChange]),
  );
  const {
    isVisible: isSwipeHintVisible,
    registerInteraction: registerSwipeInteraction,
  } = useBeverageSwipeHint(
    !isRunning && beverages.length > 1,
    interactionSignal,
  );
  const selectedBeverage = beverages[selectedIndex] ?? beverages[0];
  const progress = Math.min(
    1,
    Math.max(0, phase === "break" ? breakProgress : focusProgress),
  );

  useLayoutEffect(() => {
    if (isRunning && pageWidth > 0) {
      // 스와이프 관성 이동 중 시작해도 선택한 음료 위치에 고정합니다.
      pager.current?.scrollTo({
        x: selectedIndexRef.current * pageWidth,
        animated: false,
      });
    }
  }, [isRunning, pageWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== pageWidth) setPageWidth(width);
  };

  const commitBeverageSelection = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (isRunning || pageWidth <= 0) return;

    const index = Math.max(
      0,
      Math.min(
        beverages.length - 1,
        Math.round(event.nativeEvent.contentOffset.x / pageWidth),
      ),
    );
    const beverageId = Number(beverages[index]?.id);
    if (!Number.isFinite(beverageId)) return;

    selectedIndexRef.current = index;
    setSelectedIndex(index);
    onBeverageChange(beverageId);

    if (
      !persistSelection ||
      persistedBeverageIdRef.current === beverageId
    ) {
      return;
    }

    const previousBeverageId = persistedBeverageIdRef.current;
    persistedBeverageIdRef.current = beverageId;
    void selectBeverage(beverageId).catch((error) => {
      if (persistedBeverageIdRef.current === beverageId) {
        persistedBeverageIdRef.current = previousBeverageId;
      }
      console.log("현재 음료 선택 저장 오류:", error);
    });
  };

  return (
    <View className="mt-3 h-[344px] w-full items-center">
      <View className="h-6 justify-center">
        {!isRunning && (
          <Text className="font-maru text-base text-primary">
            {selectedBeverage.name}
          </Text>
        )}
      </View>

      <View className="h-[288px] w-full" onLayout={handleLayout}>
        {pageWidth > 0 && (
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            scrollEnabled={!isRunning}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            directionalLockEnabled
            scrollEventThrottle={16}
            onScrollBeginDrag={registerSwipeInteraction}
            onMomentumScrollEnd={commitBeverageSelection}
            onContentSizeChange={() => {
              pager.current?.scrollTo({
                x: selectedIndexRef.current * pageWidth,
                animated: false,
              });
            }}
            onScroll={(event) => {
              if (isRunning) return;
              const index = Math.max(
                0,
                Math.min(
                  beverages.length - 1,
                  Math.round(event.nativeEvent.contentOffset.x / pageWidth),
                ),
              );
              selectedIndexRef.current = index;
              setSelectedIndex(index);
            }}
          >
            {beverages.map((beverage) => {
              const lastIndex = beverage.focusImages.length - 1;
              const step = Math.min(
                lastIndex,
                Math.floor(progress * beverage.focusImages.length),
              );
              return (
                <BeverageSlide
                  key={beverage.id}
                  beverage={beverage}
                  width={pageWidth}
                  frameIndex={phase === "break" ? lastIndex - step : step}
                  meltProgress={phase === "break" ? 1 - progress : progress}
                  animatePhysics={isRunning}
                />
              );
            })}
          </ScrollView>
        )}
      </View>

      {isSwipeHintVisible && <PixelSwipeHint />}
    </View>
  );
}
