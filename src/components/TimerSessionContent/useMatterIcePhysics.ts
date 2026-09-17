import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

export type IceSprite = {
  atlasX: number;
  atlasY: number;
  sourceWidth: number;
  sourceHeight: number;
  displayWidth: number;
  displayHeight: number;
  x: number;
  y: number;
  angle: number;
  meltStart: number;
  meltEnd: number;
};

const ICE_VARIANTS = [
  {
    atlasX: 0,
    atlasY: 0,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
  {
    atlasX: 362,
    atlasY: 0,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
  {
    atlasX: 724,
    atlasY: 0,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 80,
    displayHeight: 74,
  },
  {
    atlasX: 1086,
    atlasY: 0,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
  {
    atlasX: 0,
    atlasY: 362,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
  {
    atlasX: 362,
    atlasY: 362,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 76,
    displayHeight: 76,
  },
  {
    atlasX: 724,
    atlasY: 362,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
  {
    atlasX: 1086,
    atlasY: 362,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 80,
    displayHeight: 74,
  },
  {
    atlasX: 0,
    atlasY: 724,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
  {
    atlasX: 362,
    atlasY: 724,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 74,
  },
  {
    atlasX: 724,
    atlasY: 724,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 76,
    displayHeight: 76,
  },
  {
    atlasX: 1086,
    atlasY: 724,
    sourceWidth: 362,
    sourceHeight: 362,
    displayWidth: 78,
    displayHeight: 78,
  },
] as const;

const ICE_LAYOUT = [
  { variant: 0, x: 78, y: 105, angle: -0.08, meltStart: 0, meltEnd: 0.34 },
  { variant: 1, x: 150, y: 104, angle: 0.07, meltStart: 0.06, meltEnd: 0.4 },
  { variant: 2, x: 220, y: 106, angle: -0.07, meltStart: 0.12, meltEnd: 0.46 },
  { variant: 3, x: 88, y: 165, angle: 0.07, meltStart: 0.25, meltEnd: 0.55 },
  { variant: 4, x: 151, y: 164, angle: -0.07, meltStart: 0.3, meltEnd: 0.6 },
  { variant: 5, x: 211, y: 166, angle: 0.08, meltStart: 0.35, meltEnd: 0.65 },
  { variant: 6, x: 96, y: 225, angle: -0.07, meltStart: 0.45, meltEnd: 0.72 },
  { variant: 7, x: 153, y: 224, angle: 0.06, meltStart: 0.5, meltEnd: 0.77 },
  { variant: 8, x: 205, y: 227, angle: -0.07, meltStart: 0.55, meltEnd: 0.82 },
  { variant: 9, x: 107, y: 285, angle: 0.07, meltStart: 0.62, meltEnd: 0.86 },
  { variant: 10, x: 156, y: 286, angle: -0.06, meltStart: 0.67, meltEnd: 0.9 },
  { variant: 11, x: 201, y: 288, angle: 0.07, meltStart: 0.72, meltEnd: 0.94 },
  { variant: 3, x: 128, y: 320, angle: -0.06, meltStart: 0.78, meltEnd: 0.98 },
  { variant: 7, x: 181, y: 320, angle: 0.06, meltStart: 0.82, meltEnd: 1 },
] as const;

export const COMMON_ICE_SPRITES: readonly IceSprite[] = ICE_LAYOUT.map(
  ({ variant, ...placement }) => ({
    ...ICE_VARIANTS[variant],
    ...placement,
  }),
);

const ICE_CUP_LAYOUT = [
  { x: 110, y: 334, meltStart: 0, meltEnd: 0.23 },
  { x: 160, y: 334, meltStart: 0.01, meltEnd: 0.24 },
  { x: 210, y: 334, meltStart: 0.02, meltEnd: 0.25 },
  { x: 106, y: 284, meltStart: 0.14, meltEnd: 0.39 },
  { x: 158, y: 284, meltStart: 0.15, meltEnd: 0.4 },
  { x: 210, y: 284, meltStart: 0.16, meltEnd: 0.41 },
  { x: 100, y: 234, meltStart: 0.3, meltEnd: 0.54 },
  { x: 140, y: 234, meltStart: 0.31, meltEnd: 0.55 },
  { x: 180, y: 234, meltStart: 0.32, meltEnd: 0.56 },
  { x: 220, y: 234, meltStart: 0.33, meltEnd: 0.57 },
  { x: 86, y: 184, meltStart: 0.46, meltEnd: 0.7 },
  { x: 136, y: 184, meltStart: 0.47, meltEnd: 0.71 },
  { x: 186, y: 184, meltStart: 0.48, meltEnd: 0.72 },
  { x: 236, y: 184, meltStart: 0.49, meltEnd: 0.73 },
  { x: 82, y: 134, meltStart: 0.62, meltEnd: 0.86 },
  { x: 134, y: 134, meltStart: 0.63, meltEnd: 0.87 },
  { x: 186, y: 134, meltStart: 0.64, meltEnd: 0.88 },
  { x: 238, y: 134, meltStart: 0.65, meltEnd: 0.89 },
  { x: 78, y: 84, meltStart: 0.78, meltEnd: 0.98 },
  { x: 132, y: 84, meltStart: 0.79, meltEnd: 0.99 },
  { x: 186, y: 84, meltStart: 0.8, meltEnd: 1 },
  { x: 240, y: 84, meltStart: 0.81, meltEnd: 1 },
] as const;

export const ICE_CUP_SPRITES: readonly IceSprite[] = ICE_CUP_LAYOUT.map(
  (placement, index) => ({
    ...COMMON_ICE_SPRITES[index % COMMON_ICE_SPRITES.length],
    displayWidth: 72,
    displayHeight: 72,
    angle: (index % 2 === 0 ? -1 : 1) * (0.035 + (index % 3) * 0.018),
    ...placement,
  }),
);

export type IceTransform = {
  x: number;
  y: number;
  angle: number;
};

export type FruitSlice = {
  x: number;
  y: number;
  radius: number;
  angle: number;
  scale: number;
};

export const ADE_FRUIT_SLICES: readonly FruitSlice[] = [
  { x: 108, y: 228, radius: 27, angle: -0.24, scale: 0.86 },
  { x: 190, y: 292, radius: 24, angle: 0.2, scale: 0.76 },
];

type PhysicsSimulation = {
  engine: Matter.Engine;
  iceBodies: Matter.Body[];
  lemonBodies: Matter.Body[];
  appliedScales: number[];
};

const WALL_CATEGORY = 0x0001;
const ICE_CATEGORY = 0x0002;
const LEMON_CATEGORY = 0x0004;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function getIceMeltAmount(sprite: IceSprite, progress: number) {
  return clamp(
    (progress - sprite.meltStart) / (sprite.meltEnd - sprite.meltStart),
  );
}

export function getIceScale(sprite: IceSprite, progress: number) {
  const melted = getIceMeltAmount(sprite, progress);
  return Math.max(0.16, Math.pow(1 - melted, 0.72));
}

const createWall = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  friction = 0.32,
) => {
  const width = Math.hypot(endX - startX, endY - startY);
  return Matter.Bodies.rectangle(
    (startX + endX) / 2,
    (startY + endY) / 2,
    width,
    9,
    {
      isStatic: true,
      angle: Math.atan2(endY - startY, endX - startX),
      friction,
      restitution: 0.12,
      collisionFilter: {
        category: WALL_CATEGORY,
        mask: ICE_CATEGORY | LEMON_CATEGORY,
      },
    },
  );
};

const createSimulation = (
  includeFruit = true,
  iceSettlesToBottom = false,
  iceSprites: readonly IceSprite[] = COMMON_ICE_SPRITES,
  iceFloorY = 358,
): PhysicsSimulation => {
  const engine = Matter.Engine.create({ enableSleeping: false });
  engine.positionIterations = 8;
  engine.velocityIterations = 6;
  engine.gravity.x = 0;
  engine.gravity.y = iceSettlesToBottom ? 0.72 : 0.52;
  engine.gravity.scale = 0.001;

  const iceBodies = iceSprites.map((sprite, index) => {
    const body = Matter.Bodies.rectangle(
      sprite.x,
      sprite.y,
      sprite.displayWidth * (iceSettlesToBottom ? 0.42 : 0.7),
      sprite.displayHeight * (iceSettlesToBottom ? 0.68 : 0.7),
      {
        angle: sprite.angle,
        chamfer: { radius: 7 },
        density: 0.0018,
        friction: iceSettlesToBottom ? 0.08 : 0.06,
        frictionAir: iceSettlesToBottom ? 0.052 : 0.035,
        frictionStatic: iceSettlesToBottom ? 0.16 : 0.08,
        restitution: iceSettlesToBottom ? 0.025 : 0.14,
        label: `common-ice-${index}`,
        collisionFilter: {
          category: ICE_CATEGORY,
          mask: WALL_CATEGORY | ICE_CATEGORY,
        },
      },
    );
    Matter.Body.setAngularVelocity(
      body,
      (index % 2 === 0 ? 1 : -1) *
        (iceSettlesToBottom ? 0.00018 : 0.0014 + (index % 3) * 0.0004),
    );
    return body;
  });

  const lemonBodies = includeFruit ? ADE_FRUIT_SLICES.map((slice, index) => {
    const body = Matter.Bodies.circle(slice.x, slice.y, slice.radius, {
      angle: slice.angle,
      density: 0.00145,
      friction: 0.24,
      frictionAir: 0.052,
      frictionStatic: 0.46,
      restitution: 0.14,
      label: `lemon-slice-${index}`,
      collisionFilter: {
        category: LEMON_CATEGORY,
        mask: WALL_CATEGORY | LEMON_CATEGORY,
      },
    });
    Matter.Body.setAngularVelocity(body, index === 0 ? 0.003 : -0.0035);
    return body;
  }) : [];

  const walls = [
    createWall(40, 70, 101, 356, iceSettlesToBottom ? 0.008 : 0.32),
    createWall(260, 70, 211, 356, iceSettlesToBottom ? 0.008 : 0.32),
    Matter.Bodies.rectangle(150, 70, 220, 8, {
      isStatic: true,
      friction: iceSettlesToBottom ? 0.008 : 0.2,
      restitution: 0.04,
      collisionFilter: {
        category: WALL_CATEGORY,
        mask: ICE_CATEGORY | LEMON_CATEGORY,
      },
    }),
    Matter.Bodies.rectangle(156, iceFloorY, 116, 10, {
      isStatic: true,
      friction: iceSettlesToBottom ? 0.01 : 0.38,
      restitution: 0.08,
      collisionFilter: {
        category: WALL_CATEGORY,
        mask: ICE_CATEGORY | LEMON_CATEGORY,
      },
    }),
  ];

  Matter.Composite.add(engine.world, [...walls, ...iceBodies, ...lemonBodies]);
  return {
    engine,
    iceBodies,
    lemonBodies,
    appliedScales: iceSprites.map(() => 1),
  };
};

const getTransforms = (bodies: readonly Matter.Body[]): IceTransform[] =>
  bodies.map((body) => ({
    x: body.position.x,
    y: body.position.y,
    angle: body.angle,
  }));

export function useMatterIcePhysics(
  meltProgress: number,
  enabled = true,
  options: {
    includeFruit?: boolean;
    iceSprites?: readonly IceSprite[];
    iceSettlesToBottom?: boolean;
    iceFloorY?: number;
    liquidSurfaceStartY?: number;
    liquidSurfaceEndY?: number;
    reverseIceMeltOrder?: boolean;
  } = {},
) {
  const {
    includeFruit = true,
    iceSprites = COMMON_ICE_SPRITES,
    iceSettlesToBottom = false,
    iceFloorY = 358,
    liquidSurfaceStartY = 235,
    liquidSurfaceEndY = 88,
    reverseIceMeltOrder = false,
  } = options;
  const progress = clamp(meltProgress);
  const progressRef = useRef(progress);
  const previousProgressRef = useRef(progress);
  const simulationRef = useRef<PhysicsSimulation | null>(null);
  const [iceTransforms, setIceTransforms] = useState<IceTransform[]>(() =>
    iceSprites.map(({ x, y, angle }) => ({ x, y, angle })),
  );
  const [lemonTransforms, setLemonTransforms] = useState<IceTransform[]>(() =>
    ADE_FRUIT_SLICES.map(({ x, y, angle }) => ({ x, y, angle })),
  );

  useEffect(() => {
    progressRef.current = progress;
    const restarted =
      progress < 0.025 && previousProgressRef.current > progress + 0.04;
    previousProgressRef.current = progress;

    if (!restarted) return;

    const previous = simulationRef.current;
    if (previous) Matter.Engine.clear(previous.engine);
    const next = createSimulation(
      includeFruit,
      iceSettlesToBottom,
      iceSprites,
      iceFloorY,
    );
    simulationRef.current = next;
    setIceTransforms(getTransforms(next.iceBodies));
    setLemonTransforms(getTransforms(next.lemonBodies));
  }, [iceFloorY, iceSettlesToBottom, iceSprites, includeFruit, progress]);

  useEffect(() => {
    if (enabled || progress > 0.002) return;

    const simulation = simulationRef.current;
    if (simulation) Matter.Engine.clear(simulation.engine);
    simulationRef.current = null;
    setIceTransforms(
      iceSprites.map(({ x, y, angle }) => ({ x, y, angle })),
    );
    setLemonTransforms(
      ADE_FRUIT_SLICES.map(({ x, y, angle }) => ({ x, y, angle })),
    );
  }, [enabled, iceSprites, progress]);

  useEffect(() => {
    if (!enabled) return;

    simulationRef.current = createSimulation(
      includeFruit,
      iceSettlesToBottom,
      iceSprites,
      iceFloorY,
    );
    let animationFrame = 0;
    let previousTime = 0;
    let renderAccumulator = 0;

    const update = (time: number) => {
      const delta =
        previousTime === 0 ? 16.666 : Math.min(33.333, time - previousTime);
      previousTime = time;
      const currentProgress = progressRef.current;
      const simulation = simulationRef.current;

      if (simulation) {
        simulation.iceBodies.forEach((body, index) => {
          const timingSprite = reverseIceMeltOrder
            ? iceSprites[iceSprites.length - 1 - index]
            : iceSprites[index];
          const desiredScale = getIceScale(
            timingSprite,
            currentProgress,
          );
          const scaleChange = desiredScale / simulation.appliedScales[index];
          if (Math.abs(scaleChange - 1) > 0.001) {
            Matter.Body.scale(body, scaleChange, scaleChange);
            simulation.appliedScales[index] = desiredScale;
          }
        });

        const easedProgress =
          currentProgress * currentProgress * (3 - 2 * currentProgress);
        const liquidSurfaceY =
          liquidSurfaceStartY +
          (liquidSurfaceEndY - liquidSurfaceStartY) * easedProgress;

        const dynamicBodies = [
          ...simulation.iceBodies.map((body, index) => ({
            body,
            index,
            kind: "ice" as const,
          })),
          ...simulation.lemonBodies.map((body, index) => ({
            body,
            index,
            kind: "lemon" as const,
          })),
        ];

        dynamicBodies.forEach(({ body, index, kind }) => {
          const isFloatingFruit = kind === "lemon" && index === 0;
          const isSubmergedFruit = kind === "lemon" && index === 1;
          const horizontalForce =
            Math.sin(time / (isSubmergedFruit ? 680 : 920) + index * 1.61) *
            body.mass *
            (isSubmergedFruit
              ? 0.00002
              : kind === "lemon"
                ? 0.000012
                : iceSettlesToBottom
                  ? 0.000004
                  : 0.000006);
          const depth = body.position.y - liquidSurfaceY;
          const fruitTargetY = isFloatingFruit
            ? liquidSurfaceY + 5
            : Math.min(
                318,
                liquidSurfaceY +
                  88 +
                  Math.sin(time / 1450 + index * 0.7) * 30,
              );
          const buoyancyForce =
            kind === "lemon"
              ? body.mass *
                (-0.00052 +
                  (fruitTargetY - body.position.y) *
                    (isSubmergedFruit ? 0.000013 : 0.000018) -
                  body.velocity.y * 0.00016)
              : depth > 0 && !iceSettlesToBottom
                ? -body.mass * 0.00049
                : iceSettlesToBottom
                  ? 0
                  : 0;
          const verticalDrift =
            Math.sin(time / 1150 + index * 1.37) *
            body.mass *
            (kind === "lemon" ? 0.000018 : 0.000004);
          Matter.Body.applyForce(body, body.position, {
            x: horizontalForce,
            y: buoyancyForce + verticalDrift,
          });

          if (Math.abs(body.velocity.y) > 0.42) {
            Matter.Body.setVelocity(body, {
              x: body.velocity.x,
              y: Math.sign(body.velocity.y) * 0.42,
            });
          }
        });

        Matter.Engine.update(simulation.engine, delta);
        dynamicBodies.forEach(({ body, index, kind }) => {
          const minimumCenterY =
            kind === "lemon"
              ? liquidSurfaceY + (index === 0 ? -10 : 34)
              : 82;
          const maximumCenterY = 350;
          const nextY = Math.min(
            maximumCenterY,
            Math.max(minimumCenterY, body.position.y),
          );
          const depthRatio = clamp((nextY - 78) / (352 - 78));
          const leftEdge = 75 + (105 - 75) * depthRatio;
          const rightEdge = 238 + (207 - 238) * depthRatio;
          const nextX = Math.min(
            rightEdge - 2,
            Math.max(leftEdge + 2, body.position.x),
          );

          const hitSide = nextX !== body.position.x;
          const hitVerticalEdge = nextY !== body.position.y;
          if (hitSide || hitVerticalEdge) {
            Matter.Body.setPosition(body, { x: nextX, y: nextY });
            Matter.Body.setVelocity(body, {
              x: hitSide ? body.velocity.x * -0.12 : body.velocity.x,
              y: hitVerticalEdge
                ? Math.max(0, body.velocity.y) * 0.12
                : body.velocity.y,
            });
          }
        });
        renderAccumulator += delta;
        if (renderAccumulator >= 32) {
          renderAccumulator = 0;
          setIceTransforms(getTransforms(simulation.iceBodies));
          setLemonTransforms(getTransforms(simulation.lemonBodies));
        }
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animationFrame);
      const simulation = simulationRef.current;
      if (simulation) Matter.Engine.clear(simulation.engine);
      simulationRef.current = null;
    };
  }, [
    enabled,
    iceSettlesToBottom,
    iceFloorY,
    iceSprites,
    includeFruit,
    liquidSurfaceEndY,
    liquidSurfaceStartY,
    reverseIceMeltOrder,
  ]);

  return { iceTransforms, lemonTransforms };
}
