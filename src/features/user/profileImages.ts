export const PROFILE_IMAGES = [
  { id: "bear", name: "곰", source: require("../../assets/images/Bear.png") },
  { id: "beluga", name: "벨루가", source: require("../../assets/images/Beluga.png") },
  { id: "rabbit", name: "토끼", source: require("../../assets/images/Rabbit.png") },
  { id: "seal", name: "물범", source: require("../../assets/images/Seal.png") },
] as const;

export type ProfileImageId = (typeof PROFILE_IMAGES)[number]["id"];

export function getProfileImage(id: string | null) {
  return PROFILE_IMAGES.find((item) => item.id === id) ?? PROFILE_IMAGES[0];
}
