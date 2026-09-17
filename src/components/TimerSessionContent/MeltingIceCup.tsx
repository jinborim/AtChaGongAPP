import { useEffect, useId, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  Path,
  Rect,
} from "react-native-svg";
import {
  ICE_CUP_SPRITES,
  getIceMeltAmount,
  getIceScale,
  useMatterIcePhysics,
} from "./useMatterIcePhysics";

const VIEWBOX_WIDTH = 324;
const VIEWBOX_HEIGHT = 432;
const ICE_ATLAS_WIDTH = 1448;
const ICE_ATLAS_HEIGHT = 1086;
const INITIAL_SURFACE_Y = 374;
const FINAL_SURFACE_Y = 176;
const CUP_INTERIOR =
  "M40 78 Q162 104 284 78 L260 372 Q162 410 64 372 Z";
const CUP_OPENING = "M40 78 Q162 22 284 78 Q162 108 40 78 Z";
const CUP_BACK_RIM = "M42 77 Q162 25 282 77";
const ICE_INTERIOR =
  "M36 42 Q162 16 288 42 L264 378 Q162 416 60 378 Z";
const GLASS_FACE = "M34 76 Q162 104 290 76 L264 386 Q162 420 58 386 Z";
const CUP_SCALE_X = 0.92;
const CUP_SCALE_Y = 0.96;
const ICE_FILL_SCALE = 1.05;
const CUP_TRANSFORM = `translate(${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT / 2}) scale(${CUP_SCALE_X} ${CUP_SCALE_Y}) translate(${-VIEWBOX_WIDTH / 2} ${-VIEWBOX_HEIGHT / 2})`;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const snapPixel = (value: number) => Math.round(value / 4) * 4;

const CONDENSATION = [
  { x: 66, y: 126, length: 16 },
  { x: 91, y: 204, length: 9 },
  { x: 116, y: 150, length: 24 },
  { x: 151, y: 244, length: 12 },
  { x: 183, y: 172, length: 19 },
  { x: 218, y: 128, length: 22 },
  { x: 240, y: 226, length: 10 },
  { x: 103, y: 294, length: 14 },
  { x: 203, y: 302, length: 16 },
] as const;

const GLASS_REFLECTIONS = [
  { x: 67, y: 116, width: 6, height: 52 },
  { x: 76, y: 106, width: 5, height: 18 },
  { x: 82, y: 174, width: 4, height: 24 },
  { x: 246, y: 132, width: 6, height: 44 },
  { x: 238, y: 180, width: 5, height: 22 },
  { x: 228, y: 252, width: 4, height: 30 },
] as const;

export default function MeltingIceCup({
  glassSource,
  iceSource,
  waterSource,
  meltProgress,
  fillProgress,
  width = 211,
  height = 288,
  animatePhysics = true,
}: {
  glassSource: ImageSourcePropType;
  iceSource: ImageSourcePropType;
  waterSource: ImageSourcePropType;
  meltProgress: number;
  fillProgress?: number;
  width?: number;
  height?: number;
  animatePhysics?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const progress = clamp(meltProgress);
  const fill = clamp(fillProgress ?? progress);
  const easedProgress = fill * fill * (3 - 2 * fill);
  const [motionTime, setMotionTime] = useState(0);
  const { iceTransforms } = useMatterIcePhysics(progress, animatePhysics, {
    includeFruit: false,
    iceFloorY: 364,
    iceSettlesToBottom: true,
    iceSprites: ICE_CUP_SPRITES,
    liquidSurfaceStartY: INITIAL_SURFACE_Y,
    liquidSurfaceEndY: FINAL_SURFACE_Y,
  });

  useEffect(() => {
    if (!animatePhysics) {
      setMotionTime(0);
      return;
    }

    let animationFrame = 0;
    let previousUpdate = 0;
    const update = (time: number) => {
      if (time - previousUpdate >= 60) {
        previousUpdate = time;
        setMotionTime(time);
      }
      animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [animatePhysics]);

  const surfaceY = snapPixel(
    INITIAL_SURFACE_Y + (FINAL_SURFACE_Y - INITIAL_SURFACE_Y) * easedProgress,
  );
  const depthRatio = clamp((surfaceY - 78) / (372 - 78));
  const surfaceLeft = snapPixel(40 + (64 - 40) * depthRatio);
  const surfaceRight = snapPixel(284 + (260 - 284) * depthRatio);
  const wavePhase = motionTime / 390;
  const waveA = animatePhysics ? Math.round(Math.sin(wavePhase) * 5) : 0;
  const waveB = animatePhysics
    ? Math.round(Math.sin(wavePhase + Math.PI * 0.72) * 5)
    : 0;
  const surfaceWidth = surfaceRight - surfaceLeft;
  const surfaceCenter = Math.round((surfaceLeft + surfaceRight) / 2);
  const perspectiveDip =
    8 + (animatePhysics ? Math.round(Math.sin(wavePhase * 0.5) * 2) : 0);
  const waterSurface = [
    `M${surfaceLeft} ${surfaceY + waveA}`,
    `C${Math.round(surfaceLeft + surfaceWidth * 0.18)} ${surfaceY + waveA - 2}`,
    `${Math.round(surfaceCenter - surfaceWidth * 0.18)} ${surfaceY + perspectiveDip}`,
    `${surfaceCenter} ${surfaceY + perspectiveDip}`,
    `C${Math.round(surfaceCenter + surfaceWidth * 0.18)} ${surfaceY + perspectiveDip}`,
    `${Math.round(surfaceRight - surfaceWidth * 0.18)} ${surfaceY + waveB - 2}`,
    `${surfaceRight} ${surfaceY + waveB}`,
  ].join(" ");
  const waterBody = [
    waterSurface,
    `L${surfaceRight} 378`,
    `Q162 414 ${surfaceLeft} 378Z`,
  ].join(" ");

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      pointerEvents="none"
    >
      <Defs>
        <ClipPath id={`${id}-interior`}>
          <Path d={CUP_INTERIOR} />
        </ClipPath>
        <ClipPath id={`${id}-ice-area`}>
          <Path d={ICE_INTERIOR} />
        </ClipPath>
        <ClipPath id={`${id}-glass-face`}>
          <Path d={GLASS_FACE} />
        </ClipPath>
        <ClipPath id={`${id}-water`}>
          <Path d={waterBody} />
        </ClipPath>
        <ClipPath id={`${id}-glass-top`}>
          <Rect x={0} y={0} width={VIEWBOX_WIDTH} height={112} />
        </ClipPath>
        <ClipPath id={`${id}-glass-bottom`}>
          <Rect x={0} y={382} width={VIEWBOX_WIDTH} height={50} />
        </ClipPath>
        {ICE_CUP_SPRITES.map((sprite, index) => (
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

      <G transform={CUP_TRANSFORM}>
        <SvgImage
          href={glassSource}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          preserveAspectRatio="none"
        />

        <G clipPath={`url(#${id}-interior)`}>
          <Path d={CUP_INTERIOR} fill="#e5edf6" opacity={0.42} />
          <Rect
            x={52}
            y={86}
            width={42}
            height={276}
            fill="#c8d9e8"
            opacity={0.28}
          />
          <Rect
            x={92}
            y={86}
            width={24}
            height={276}
            fill="#ffffff"
            opacity={0.3}
          />
          <Rect
            x={232}
            y={86}
            width={32}
            height={276}
            fill="#bdd3e4"
            opacity={0.24}
          />
        </G>

        <Path d={CUP_OPENING} fill="#e1ebf5" opacity={0.46} />
        <Path
          d={CUP_BACK_RIM}
          fill="none"
          stroke="#dff6ff"
          strokeWidth={5}
          strokeLinecap="square"
          opacity={0.62}
        />

        {fill > 0.002 && (
          <G clipPath={`url(#${id}-interior)`}>
            <Path d={waterBody} fill="#75c8f0" opacity={0.2} />
            <G clipPath={`url(#${id}-water)`}>
              <SvgImage
                href={waterSource}
                width={VIEWBOX_WIDTH}
                height={VIEWBOX_HEIGHT}
                preserveAspectRatio="none"
                opacity={0.82}
              />
            </G>
            <Path
              d={waterSurface}
              fill="none"
              stroke="#dff8ff"
              strokeWidth={4}
              strokeLinecap="square"
              strokeLinejoin="miter"
              opacity={0.9}
            />
          </G>
        )}

        <G clipPath={`url(#${id}-ice-area)`}>
          {ICE_CUP_SPRITES.map((sprite, index) => {
            const transform = iceTransforms[index] ?? sprite;
            const x = transform.x + 4;
            const y = transform.y + 4;
            const sourceCenterX = sprite.atlasX + sprite.sourceWidth / 2;
            const sourceCenterY = sprite.atlasY + sprite.sourceHeight / 2;
            const melted = getIceMeltAmount(sprite, progress);
            const spriteScale = getIceScale(sprite, progress);
            const scaleX =
              (sprite.displayWidth / sprite.sourceWidth) *
              ICE_FILL_SCALE *
              spriteScale;
            const scaleY =
              (sprite.displayHeight / sprite.sourceHeight) *
              ICE_FILL_SCALE *
              Math.max(0.14, spriteScale * (1 - melted * 0.12));
            const opacity =
              0.8 * clamp(1 - Math.max(0, melted - 0.68) / 0.32);
            const angle =
              Math.round(((transform.angle * 180) / Math.PI) / 4) * 4;

            return (
              <G
                key={index}
                transform={`translate(${snapPixel(x)} ${snapPixel(y)}) rotate(${angle}) scale(${scaleX} ${scaleY}) translate(${-sourceCenterX} ${-sourceCenterY})`}
                opacity={opacity}
              >
                <G clipPath={`url(#${id}-sprite-${index})`}>
                  <SvgImage
                    href={iceSource}
                    width={ICE_ATLAS_WIDTH}
                    height={ICE_ATLAS_HEIGHT}
                    preserveAspectRatio="none"
                  />
                </G>
              </G>
            );
          })}
        </G>

        <SvgImage
          href={glassSource}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          preserveAspectRatio="none"
          opacity={0.18}
        />
        <G clipPath={`url(#${id}-glass-top)`}>
          <SvgImage
            href={glassSource}
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            preserveAspectRatio="none"
          />
        </G>
        <G clipPath={`url(#${id}-glass-bottom)`}>
          <SvgImage
            href={glassSource}
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            preserveAspectRatio="none"
          />
        </G>

        {fill > 0.002 && (
          <G clipPath={`url(#${id}-interior)`}>
            <G clipPath={`url(#${id}-water)`}>
              <SvgImage
                href={waterSource}
                width={VIEWBOX_WIDTH}
                height={VIEWBOX_HEIGHT}
                preserveAspectRatio="none"
                opacity={0.44}
              />
              <Path d={waterBody} fill="#68bfea" opacity={0.14} />
            </G>
            <Path
              d={waterSurface}
              fill="none"
              stroke="#dff8ff"
              strokeWidth={3}
              strokeLinecap="square"
              strokeLinejoin="miter"
              opacity={0.72}
            />
          </G>
        )}

        <G
          clipPath={`url(#${id}-glass-face)`}
          opacity={
            0.2 +
            (animatePhysics ? (Math.sin(motionTime / 620) + 1) * 0.035 : 0)
          }
        >
          {GLASS_REFLECTIONS.map((reflection, index) => (
            <G key={index}>
              <Rect
                x={reflection.x}
                y={reflection.y}
                width={reflection.width}
                height={reflection.height}
                fill="#f8feff"
              />
              <Rect
                x={reflection.x + reflection.width}
                y={reflection.y + 8}
                width={3}
                height={Math.max(8, reflection.height - 16)}
                fill="#aee7ff"
                opacity={0.62}
              />
            </G>
          ))}
        </G>

        {fill > 0.002 && (
          <G
            clipPath={`url(#${id}-glass-face)`}
            opacity={0.14 + fill * 0.22}
            transform={`translate(0 ${animatePhysics ? snapPixel((motionTime / 900) % 12) : 0})`}
          >
            {CONDENSATION.map((drop, index) => (
              <G key={index}>
                <Rect
                  x={drop.x}
                  y={drop.y}
                  width={3}
                  height={drop.length}
                  fill="#d9f7ff"
                />
                <Rect
                  x={drop.x - 1}
                  y={drop.y - 3}
                  width={5}
                  height={5}
                  fill="#f5fdff"
                  opacity={0.82}
                />
                <Rect
                  x={drop.x + 1}
                  y={drop.y + drop.length - 1}
                  width={5}
                  height={5}
                  fill="#b9eaff"
                  opacity={0.76}
                />
              </G>
            ))}
          </G>
        )}
      </G>
    </Svg>
  );
}
