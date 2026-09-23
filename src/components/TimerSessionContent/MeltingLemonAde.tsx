import { useEffect, useId, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  Path,
  Rect,
  Use,
} from "react-native-svg";
import {
  getIceMeltAmount,
  getIceScale,
  ADE_FRUIT_SLICES,
  COMMON_ICE_SPRITES,
  useMatterIcePhysics,
} from "./useMatterIcePhysics";

const VIEWBOX_WIDTH = 324;
const VIEWBOX_HEIGHT = 432;
const INITIAL_SURFACE_Y = 210;
const MELTED_SURFACE_Y = 88;
const ICE_ATLAS_WIDTH = 1448;
const ICE_ATLAS_HEIGHT = 1086;
const CUP_INTERIOR = "M75 78 Q156 101 238 78 L207 354 Q156 371 105 354 Z";
const ICE_INTERIOR =
  "M75 72 Q156 51 238 72 L207 354 Q156 371 105 354 Z";
const GLASS_FACE = "M47 76 Q151 105 258 76 L211 386 Q151 405 91 386 Z";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export type AdeFlavor = "lemon" | "grapefruit" | "greenGrape";

const ADE_PALETTES = {
  lemon: {
    liquid: "#ffdc26",
    liquidLight: "#fff06a",
    liquidDeep: "#f4b21d",
    bubble: "#fff2a0",
    surface: "#fff4a0",
    wash: "#f2c52f",
    baseReflection: "#ffdc3f",
    diluted: "#fff8c9",
  },
  grapefruit: {
    liquid: "#ff6f77",
    liquidLight: "#ffaaa5",
    liquidDeep: "#d83f57",
    bubble: "#ffe1d7",
    surface: "#ffd4ca",
    wash: "#e85567",
    baseReflection: "#ff6571",
    diluted: "#ffe3df",
  },
  greenGrape: {
    liquid: "#b8eb45",
    liquidLight: "#edff91",
    liquidDeep: "#76b82f",
    bubble: "#f3ffd2",
    surface: "#efffb0",
    wash: "#83c936",
    baseReflection: "#b5e85c",
    diluted: "#f1ffd4",
  },
} as const;

const BUBBLES = [
  { x: 91, y: 132, r: 3 },
  { x: 112, y: 126, r: 1 },
  { x: 136, y: 119, r: 2 },
  { x: 163, y: 134, r: 2 },
  { x: 194, y: 143, r: 4 },
  { x: 213, y: 151, r: 1 },
  { x: 221, y: 177, r: 2 },
  { x: 78, y: 196, r: 2 },
  { x: 103, y: 173, r: 1 },
  { x: 125, y: 184, r: 4 },
  { x: 151, y: 194, r: 2 },
  { x: 179, y: 215, r: 3 },
  { x: 207, y: 224, r: 1 },
  { x: 82, y: 231, r: 1 },
  { x: 105, y: 249, r: 3 },
  { x: 132, y: 237, r: 2 },
  { x: 154, y: 270, r: 2 },
  { x: 181, y: 251, r: 1 },
  { x: 194, y: 295, r: 4 },
  { x: 92, y: 287, r: 2 },
  { x: 116, y: 304, r: 1 },
  { x: 145, y: 292, r: 3 },
  { x: 177, y: 319, r: 2 },
  { x: 203, y: 333, r: 1 },
  { x: 126, y: 326, r: 2 },
  { x: 102, y: 346, r: 1 },
  { x: 147, y: 354, r: 2 },
  { x: 169, y: 347, r: 3 },
  { x: 188, y: 365, r: 1 },
] as const;

const CONDENSATION = [
  { x: 73, y: 128, length: 20 },
  { x: 99, y: 210, length: 12 },
  { x: 126, y: 150, length: 28 },
  { x: 180, y: 184, length: 18 },
  { x: 218, y: 134, length: 24 },
  { x: 195, y: 267, length: 14 },
  { x: 119, y: 302, length: 16 },
] as const;

export default function MeltingLemonAde({
  glassSource,
  liquidSource,
  iceSource,
  fruitSource,
  meltProgress,
  fillProgress,
  width = 211,
  height = 288,
  animatePhysics = true,
  flavor = "lemon",
}: {
  glassSource: ImageSourcePropType;
  liquidSource: ImageSourcePropType;
  iceSource: ImageSourcePropType;
  fruitSource: ImageSourcePropType;
  meltProgress: number;
  fillProgress?: number;
  width?: number;
  height?: number;
  animatePhysics?: boolean;
  flavor?: AdeFlavor;
}) {
  const id = useId().replace(/:/g, "");
  const progress = clamp(meltProgress);
  const fill = clamp(fillProgress ?? progress);
  const palette = ADE_PALETTES[flavor];
  const dilution = progress * progress * (3 - 2 * progress);
  const liquidTextureOpacity = 0.72 - dilution * 0.3;
  const deepToneOpacity = 0.22 * (1 - dilution * 0.7);
  const dilutionOpacity = dilution * 0.5;
  const [liquidMotionTime, setLiquidMotionTime] = useState(0);

  useEffect(() => {
    if (!animatePhysics) {
      setLiquidMotionTime(0);
      return;
    }

    let animationFrame = 0;
    let previousUpdate = 0;
    const updateLiquidMotion = (time: number) => {
      if (time - previousUpdate >= 50) {
        previousUpdate = time;
        setLiquidMotionTime(time);
      }
      animationFrame = requestAnimationFrame(updateLiquidMotion);
    };

    animationFrame = requestAnimationFrame(updateLiquidMotion);
    return () => cancelAnimationFrame(animationFrame);
  }, [animatePhysics]);

  const { iceTransforms, lemonTransforms } = useMatterIcePhysics(
    progress,
    animatePhysics,
    {
      reverseIceMeltOrder: true,
    },
  );
  const easedProgress = fill * fill * (3 - 2 * fill);
  const surfaceY = Math.round(
    INITIAL_SURFACE_Y +
      (MELTED_SURFACE_Y - INITIAL_SURFACE_Y) * easedProgress,
  );
  const wavePhase = liquidMotionTime / 390;
  const waveA = Math.round(Math.sin(wavePhase) * 5);
  const waveB = Math.round(Math.sin(wavePhase + Math.PI * 0.72) * 5);
  const surfaceRatio = clamp((surfaceY - 78) / (354 - 78));
  const surfaceLeft = Math.round(75 + (105 - 75) * surfaceRatio);
  const surfaceRight = Math.round(238 + (207 - 238) * surfaceRatio);
  const surfaceWidth = surfaceRight - surfaceLeft;
  const surfaceCenter = Math.round((surfaceLeft + surfaceRight) / 2);
  const perspectiveDip = 8 + Math.round(Math.sin(wavePhase * 0.5) * 2);
  const surfaceCurve = [
    `M${surfaceLeft} ${surfaceY + waveA}`,
    `C${Math.round(surfaceLeft + surfaceWidth * 0.18)} ${surfaceY + waveA - 2}`,
    `${Math.round(surfaceCenter - surfaceWidth * 0.18)} ${surfaceY + perspectiveDip}`,
    `${surfaceCenter} ${surfaceY + perspectiveDip}`,
    `C${Math.round(surfaceCenter + surfaceWidth * 0.18)} ${surfaceY + perspectiveDip}`,
    `${Math.round(surfaceRight - surfaceWidth * 0.18)} ${surfaceY + waveB - 2}`,
    `${surfaceRight} ${surfaceY + waveB}`,
  ].join(" ");
  const liquidPath = [
    surfaceCurve,
    `L${surfaceRight} ${VIEWBOX_HEIGHT}`,
    `H${surfaceLeft}Z`,
  ].join(" ");
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      pointerEvents="none"
    >
      <Defs>
        <SvgImage
          id={`${id}-ice-atlas`}
          href={iceSource}
          width={ICE_ATLAS_WIDTH}
          height={ICE_ATLAS_HEIGHT}
          preserveAspectRatio="none"
        />
        <ClipPath id={`${id}-interior`}>
          <Path d={CUP_INTERIOR} />
        </ClipPath>
        <ClipPath id={`${id}-ice-area`}>
          <Path d={ICE_INTERIOR} />
        </ClipPath>
        <ClipPath id={`${id}-liquid`}>
          <Path d={liquidPath} />
        </ClipPath>
        <ClipPath id={`${id}-liquid-bottom-extension`}>
          <Path d="M109 334 Q156 340 203 334 L200 363 Q156 382 112 363 Z" />
        </ClipPath>
        <ClipPath id={`${id}-glass-face`}>
          <Path d={GLASS_FACE} />
        </ClipPath>
        {COMMON_ICE_SPRITES.map((sprite, index) => (
          <ClipPath key={index} id={`${id}-sprite-${index}`}>
            <Rect
              x={sprite.atlasX}
              y={sprite.atlasY}
              width={sprite.sourceWidth}
              height={sprite.sourceHeight}
            />
          </ClipPath>
        ))}
      </Defs>

      {/* 뒤쪽 유리와 테두리는 얼음보다 뒤에 놓습니다. */}
      <G clipPath={`url(#${id}-interior)`}>
        <G clipPath={`url(#${id}-liquid)`}>
          <Rect
            x={0}
            y={surfaceY}
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT - surfaceY}
            fill={palette.liquid}
          />
          <Rect
            x={0}
            y={surfaceY}
            width={VIEWBOX_WIDTH}
            height={76}
            fill={palette.liquidLight}
            opacity={0.34}
          />
          <Rect
            x={0}
            y={surfaceY + 72}
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT - surfaceY - 72}
            fill={palette.liquidDeep}
            opacity={deepToneOpacity}
          />
          <SvgImage
            href={liquidSource}
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            preserveAspectRatio="none"
            opacity={liquidTextureOpacity}
          />
          <Rect
            x={0}
            y={surfaceY}
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT - surfaceY}
            fill={palette.diluted}
            opacity={dilutionOpacity}
          />
          <G
            transform={`translate(0 ${Math.round(Math.sin(wavePhase * 0.65) * 5)})`}
          >
            {BUBBLES.map((bubble, index) => (
              <Circle
                key={index}
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.r}
                fill="none"
                stroke={palette.bubble}
                strokeWidth={2}
                opacity={0.58}
              />
            ))}
          </G>
          <Rect
            x={surfaceLeft}
            y={surfaceY}
            width={surfaceWidth}
            height={VIEWBOX_HEIGHT - surfaceY}
            fill={palette.liquidLight}
            opacity={0.06 + progress * 0.06}
          />
        </G>

        {progress > 0.015 && (
          <Path
            d={surfaceCurve}
            fill="none"
            stroke={palette.surface}
            strokeWidth={3}
            opacity={0.78}
          />
        )}
      </G>

      <Defs>
        <G id={`${id}-lemon-slices`} clipPath={`url(#${id}-ice-area)`}>
          {ADE_FRUIT_SLICES.map((slice, index) => {
            const transform = lemonTransforms[index] ?? slice;
            const fruitWidth = (flavor === "greenGrape" ? 58 : 82) * slice.scale;
            const fruitHeight = (flavor === "greenGrape" ? 52 : 44) * slice.scale;
            return (
              <G
                key={index}
                transform={`translate(${transform.x} ${transform.y}) rotate(${(transform.angle * 180) / Math.PI})`}
              >
                <SvgImage
                  href={fruitSource}
                  x={-fruitWidth / 2}
                  y={-fruitHeight / 2}
                  width={fruitWidth}
                  height={fruitHeight}
                  preserveAspectRatio="xMidYMid meet"
                />
              </G>
            );
          })}
        </G>
      </Defs>

      <G id={`${id}-ice-cubes`} clipPath={`url(#${id}-ice-area)`}>
        {COMMON_ICE_SPRITES.map((sprite, index) => {
          const transform = iceTransforms[index] ?? sprite;
          // 얼음 배열은 위에서 아래 순서이므로 녹는 시간만 반대로 적용해
          // 액체에 깊이 잠긴 아래쪽 얼음부터 먼저 녹게 합니다.
          const meltTiming =
            COMMON_ICE_SPRITES[COMMON_ICE_SPRITES.length - 1 - index];
          const sourceCenterX = sprite.atlasX + sprite.sourceWidth / 2;
          const sourceCenterY = sprite.atlasY + sprite.sourceHeight / 2;
          const melted = getIceMeltAmount(meltTiming, progress);
          const spriteScale = getIceScale(meltTiming, progress);
          const scaleX =
            (sprite.displayWidth / sprite.sourceWidth) * spriteScale;
          const scaleY =
            (sprite.displayHeight / sprite.sourceHeight) *
            Math.max(0.14, spriteScale * (1 - melted * 0.12));
          const opacity = 0.8 * clamp(1 - Math.max(0, melted - 0.68) / 0.32);
          const submersion = clamp(
            (transform.y - surfaceY + sprite.displayHeight * 0.2) /
              (sprite.displayHeight * 0.7),
          );
          const integratedOpacity = opacity * (0.82 - submersion * 0.16);
          const angle = (transform.angle * 180) / Math.PI;

          return (
            <G
              key={index}
              transform={`translate(${transform.x} ${transform.y}) rotate(${angle}) scale(${scaleX} ${scaleY}) translate(${-sourceCenterX} ${-sourceCenterY})`}
              opacity={integratedOpacity}
            >
              <G clipPath={`url(#${id}-sprite-${index})`}>
                <Use href={`#${id}-ice-atlas`} />
              </G>
            </G>
          );
        })}
      </G>

      <Use href={`#${id}-lemon-slices`} />

      {/* 잠긴 얼음 위로 음료색을 얹어 얼음이 액체 안에 잠긴 느낌을 냅니다. */}
      <G clipPath={`url(#${id}-interior)`}>
        <G clipPath={`url(#${id}-liquid)`}>
          <Rect
            x={surfaceLeft}
            y={surfaceY}
            width={surfaceWidth}
            height={VIEWBOX_HEIGHT - surfaceY}
            fill={palette.wash}
            opacity={(0.08 + progress * 0.04) * (1 - dilution * 0.75)}
          />
        </G>
      </G>

      {/* 앞쪽 테두리와 벽은 움직이는 얼음보다 앞에 놓습니다. */}
      <SvgImage
        href={glassSource}
        width={VIEWBOX_WIDTH}
        height={VIEWBOX_HEIGHT}
        preserveAspectRatio="none"
      />
      <G clipPath={`url(#${id}-liquid-bottom-extension)`}>
        <Rect
          x={0}
          y={336}
          width={VIEWBOX_WIDTH}
          height={52}
          fill={palette.liquid}
        />
        <SvgImage
          href={liquidSource}
          x={0}
          y={8}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          preserveAspectRatio="none"
          opacity={liquidTextureOpacity}
        />
        <Rect
          x={0}
          y={336}
          width={VIEWBOX_WIDTH}
          height={52}
          fill={palette.diluted}
          opacity={dilutionOpacity}
        />
        <Rect
          x={0}
          y={336}
          width={VIEWBOX_WIDTH}
          height={52}
          fill={palette.wash}
          opacity={(0.1 + progress * 0.04) * (1 - dilution * 0.75)}
        />
      </G>
      <G clipPath={`url(#${id}-liquid-bottom-extension)`}>
        <Use href={`#${id}-ice-cubes`} />
        <Use href={`#${id}-lemon-slices`} />
      </G>
      <Path
        d="M101 374 Q156 386 211 374 L208 409 Q156 423 104 409 Z"
        fill={palette.baseReflection}
        opacity={0.24 * (1 - dilution * 0.5)}
      />
      <Path
        d="M101 374 Q156 386 211 374 L208 409 Q156 423 104 409 Z"
        fill={palette.diluted}
        opacity={dilution * 0.22}
      />
      <G
        clipPath={`url(#${id}-glass-face)`}
        opacity={0.28 + progress * 0.16}
        transform={`translate(0 ${Math.round(progress * 26)})`}
      >
        {CONDENSATION.map((drop, index) => (
          <G key={index}>
            <Rect
              x={drop.x}
              y={drop.y}
              width={3}
              height={drop.length}
              rx={1}
              fill="#d8f7ff"
              opacity={0.46}
            />
            <Rect
              x={drop.x + 1}
              y={drop.y + drop.length - 2}
              width={5}
              height={5}
              fill="#f5fdff"
              opacity={0.72}
            />
          </G>
        ))}
      </G>
    </Svg>
  );
}
