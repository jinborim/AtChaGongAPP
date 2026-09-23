import { Image, type ImageProps } from "expo-image";

/** Shared cache for artwork reused across the store and collection. */
export default function CachedImage(props: ImageProps) {
  return <Image cachePolicy="memory-disk" transition={0} contentFit="contain" {...props} />;
}
