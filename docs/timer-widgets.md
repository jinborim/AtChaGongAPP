# 타이머 홈 위젯 / 잠금화면 표시

Expo SDK 54를 유지하며 로컬 Expo 모듈 `modules/timer-surfaces`로 연결한다.
iOS 확장은 `@bacons/apple-targets`가 `targets/timer-widget`에서 생성한다.
이 패키지는 config plugin으로만 사용한다. 포함된 `ExtensionStorage` pod는 iOS 16.4를 요구하므로 `package.json`의 iOS autolinking에서 제외하고, 기존 앱의 iOS 15.1 지원은 유지한다. App Group 저장과 ActivityKit 연동은 로컬 모듈이 담당한다.

## 표시와 세션 정책

- 홈 위젯: Android 홈 화면, iOS 작은/중간 홈 위젯 및 잠금화면 직사각형 위젯.
- 잠금화면: Android 진행 중 알림, iOS 16.2+ Live Activities 및 지원 기기의 Dynamic Island.
- 표시 시간은 **마지막 휴식까지 포함한 전체 세션 남은 시간**이다. 앱 내부는 현재 집중/휴식 단계의 남은 시간을 표시하므로 두 숫자는 다를 수 있다.
- 위젯/알림을 누르면 `/homeSetting`을 연다. 시작·초기화는 앱에서 한다.
- 화면 잠금/백그라운드 이동은 세션을 지우지 않는다. 기존 앱 타이머가 다시 실행되면 종료 시각으로 경과 시간을 계산한다.
- 앱 프로세스가 종료되면 메모리의 세션은 폐기된다. 위젯 데이터로 앱 세션을 복원하지 않는다.
- 네이티브 표시 코드에는 서버 완료 기록 호출이 없다. 시간이 다 됐다는 표시는 완료 증명이 아니다.
- 새 앱 런타임 시작 시 이전 위젯/알림/Live Activities를 정리한다.

## OS 제한

- iOS는 앱 강제 종료 콜백을 보장하지 않는다. 공유된 표시용 데이터와 Live Activity가 재실행/OS 갱신 전까지 남을 수 있다. 위젯 타임라인은 만료 후 앱 확인 문구를, Live Activity는 stale 상태에서 확인 문구를 표시한다. 이 데이터는 앱에서 복원용으로 읽지 않는다.
- Android도 프로세스 종료 순간 런처에 남은 위젯을 즉시 지우는 것을 보장하지 않는다. 위젯 갱신 또는 앱 재실행 시 초기화한다. 앱 프로세스가 살아 있으면 네이티브 핸들러가 만료 표시를 갱신한다. 강제 종료/깊은 절전 상태에서는 OS 갱신 전까지 카운트다운이 오래 남거나 음수로 보일 수 있다. Android 8+ 진행 중 알림에는 세션 종료 시각에 맞춘 timeout을 설정한다.
- 프로세스를 유지하기 위한 foreground service나 세션을 복구하는 백그라운드 작업은 사용하지 않는다.
- Android 13+는 첫 시작 시 알림 권한을 요청한다. 거절해도 앱 타이머와 홈 위젯은 동작한다. 잠금화면 노출 여부는 기기/채널 설정에 따른다.
- iOS Live Activities가 사용자 설정으로 꺼져 있으면 홈 위젯만 동작한다. iOS 15에서는 기존 앱 타이머만 지원한다.
- Expo Go/웹/기존 개발 바이너리는 네이티브 모듈이 없으면 앱 타이머만 동작한다. 네이티브 개발 빌드를 새로 설치해야 한다.

## 빌드

1. `npm install`
2. Android: Android SDK 환경에서 `npx expo run:android` 또는 `eas build --platform android --profile development`.
3. iOS: `app.json`의 `expo.ios.appleTeamId`에 실제 Apple Developer Team ID를 설정한다. 앱과 확장에 `group.com.atchagong.atchagong.timer` App Group을 등록하고 서명 프로파일에 반영한다.
4. iOS: Mac/Xcode에서 `npx expo prebuild --platform ios` 후 `npx expo run:ios`, 또는 `eas build --platform ios --profile development`.
5. 새 바이너리 설치 후 앱을 한 번 실행한다. 홈 화면 편집 → 위젯 → 앗차공 타이머를 추가한다. iOS 잠금화면 직사각형 위젯은 잠금화면 사용자화에서 추가한다. Live Activity/Android 알림은 앱에서 타이머를 시작하면 표시된다.

`ios/`, `android/`는 생성물이다. 실제 소스는 `modules/`, `targets/`, `app.json`에 보관한다.
`TimerActivityAttributes.swift`는 앱과 확장에 같은 스키마가 필요하며 테스트가 일치 여부를 확인한다.

## 검증

- `node --test scripts/test-timer-surfaces.mjs` (Node 24)
- `npx tsc --noEmit`
- `npm run lint`
- 양 플랫폼 네이티브 개발 빌드 및 실기기 확인이 별도로 필요하다.

실기기에서는 시작 → 홈/잠금화면 확인 → 잠금 상태에서 대기 → 앱 복귀 → 초기화 → 재시작 → 프로세스 종료 → 앱 재실행을 확인한다.
프로세스 종료 후 재실행 시 초기 상태여야 하며 중단 세션의 완료 기록이 추가되면 안 된다.
알림 권한 거절, Live Activities 비활성화, 위젯 추가/크기 변경, 세션 시간 만료도 확인한다.

## 참고

- https://docs.expo.dev/versions/v54.0.0/
- https://github.com/EvanBacon/expo-apple-targets
- https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities
- https://developer.android.com/develop/ui/views/appwidgets/overview
