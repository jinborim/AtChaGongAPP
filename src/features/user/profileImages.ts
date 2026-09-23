export const PROFILE_IMAGES = [
  { profileId: 1, id: "bear", name: "곰", source: require("../../assets/images/Bear.png") },
  { profileId: 2, id: "beluga", name: "벨루가", source: require("../../assets/images/Beluga.png") },
  { profileId: 3, id: "rabbit", name: "토끼", source: require("../../assets/images/Rabbit.png") },
  { profileId: 4, id: "seal", name: "물범", source: require("../../assets/images/Seal.png") },
] as const;

export type ProfileImageId = (typeof PROFILE_IMAGES)[number]["id"];

export function getProfileImage(id: string | null) {
  return PROFILE_IMAGES.find((item) => item.id === id) ?? PROFILE_IMAGES[0];
}

export function getServerProfileImage(profileId: number, name: string) {
  return (
    PROFILE_IMAGES.find((item) => item.name === name) ??
    PROFILE_IMAGES.find((item) => item.profileId === profileId) ??
    PROFILE_IMAGES[0]
  );
}
