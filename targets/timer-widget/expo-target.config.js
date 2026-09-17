/** @type {import('@bacons/apple-targets/build/config').Config} */
module.exports = {
  type: "widget",
  name: "AtChaGongTimerWidget",
  displayName: "앗차공 타이머",
  bundleIdentifier: ".timer-widget",
  deploymentTarget: "16.2",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
  images: {
    studyingPenguin: "./assets/WidgetStudyingPenguin.png",
  },
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.atchagong.atchagong.timer",
    ],
  },
};
