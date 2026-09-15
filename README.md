# AtChaGong App

AtChaGong은 집중 시간과 휴식 시간을 커피 한 잔의 흐름처럼 기록하는 Expo 기반 모바일 앱입니다. 소셜 로그인, 온보딩, 홈 타이머, 월간/일간 통계, 공지와 마이페이지 기능을 포함합니다.

## 기술 스택

- Expo SDK 54
- React 19 / React Native 0.81
- Expo Router
- TypeScript
- NativeWind / Tailwind CSS
- Expo SecureStore
- Google, Kakao, Apple 소셜 로그인

Expo SDK 54 기준은 React Native 0.81, React 19.1.0, 최소 Node.js 20.19.x입니다.

## 시작하기

### 요구사항

- Node.js 20.19.x 이상
- npm
- Android Studio 또는 iOS/Android 테스트 기기
- 로컬 iOS 빌드가 필요하면 macOS와 Xcode

### 설치

```bash
npm install
```

### 환경 변수

환경 변수 값은 팀 노션 페이지를 참고해 `.env`에 설정하세요.

### 실행 방식

이 프로젝트는 `expo-dev-client`와 소셜 로그인 네이티브 모듈을 사용합니다. 로그인과 네이티브 동작은 Expo Go가 아니라 개발 빌드에서 확인하세요.

개발 빌드는 이 프로젝트 전용 디버그 앱입니다. 처음 한 번 설치한 뒤에는 Metro 서버에 연결해서 변경사항을 확인합니다.

개발 빌드 만들기:

```bash
npx expo run:android
npx expo run:ios
```

`run:android`는 Android Emulator 또는 USB 디버깅이 켜진 실제 기기에 설치합니다. `run:ios`로 로컬 iOS 빌드를 만들려면 macOS와 Xcode가 필요합니다.

개발 빌드 설치 후 평소 실행:

```bash
npm run start
```

플랫폼을 바로 열고 싶을 때:

```bash
npm run android
npm run ios
```

이미 iOS 개발 빌드가 설치된 기기라면 macOS가 아니어도 Metro 서버에 연결해 실행할 수 있습니다. 네이티브 라이브러리나 `app.json` 설정이 바뀌면 개발 빌드를 다시 만들어야 합니다.

### 터널로 실행하기

기기와 개발 PC가 같은 네트워크에 없거나 LAN 연결이 안 될 때 사용합니다.

```bash
npx expo start --tunnel
```

터널은 LAN보다 느릴 수 있으니 같은 Wi-Fi에서 연결되면 `npm run start`를 우선 사용하세요.

### Web 실행

```bash
npm run web
```

웹은 모바일 앱과 동작 범위가 다를 수 있습니다. 네이티브 기능은 Android/iOS 개발 빌드에서 확인하세요.

## 주요 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run start` | Expo 개발 서버를 시작합니다. |
| `npm run ios` | 개발 서버를 시작하고 iOS 대상으로 앱을 엽니다. |
| `npm run android` | 개발 서버를 시작하고 Android 대상으로 앱을 엽니다. |
| `npm run web` | 웹 개발 서버를 실행합니다. |
| `npm run lint` | Expo ESLint 검사를 실행합니다. |
| `npm run reset-project` | Expo 스타터 프로젝트 초기화 스크립트입니다. 일반 개발 중에는 사용하지 마세요. |

## 프로젝트 구조

```text
app/                  Expo Router 라우트
src/api/              공통 HTTP 클라이언트와 인증 토큰 인프라
src/components/       여러 화면에서 재사용하는 UI 컴포넌트
src/constants/        앱 공통 상수
src/features/         도메인별 API, service, hook
src/screens/          라우트에서 렌더링하는 화면 컴포넌트
src/utils/            공통 유틸리티
```

라우팅은 `app/`에서 관리하고, 화면의 실제 UI는 주로 `src/screens/`에 둡니다. 백엔드 endpoint 함수와 도메인 로직은 `src/features/{domain}` 아래에 배치합니다.

## 개발 컨벤션

### API 계층

- `src/api`에는 공통 HTTP 요청 인프라만 둡니다.
- 도메인별 endpoint 함수와 request/response 타입은 `src/features/{domain}/api`에 둡니다.
- 복잡한 앱 흐름은 feature의 `services`에서 조합합니다.
- 화면 컴포넌트에서 endpoint 문자열을 직접 사용하지 않습니다.
- 외부에서 사용할 함수와 타입은 각 폴더의 `index.ts`에서 명시적으로 export합니다.

자세한 규칙은 `src/api/README.md`, `src/features/README.md`를 참고하세요.

### 화면과 컴포넌트

- `app/` 파일은 라우트 연결을 담당하고, 화면 구현은 `src/screens`로 분리합니다.
- 여러 화면에서 재사용하는 UI는 `src/components`에 둡니다.
- 특정 도메인에서만 쓰는 hook, service, helper는 해당 `src/features/{domain}` 안에 둡니다.

### 스타일

- NativeWind 유틸리티 클래스를 우선 사용합니다.
- 공통 토큰과 Tailwind 설정은 `tailwind.config.js`, `global.css`를 기준으로 관리합니다.
- 플랫폼별 네이티브 동작이 필요한 경우 Expo SDK 54 문서를 기준으로 구현합니다.

### 타입과 품질

- TypeScript 타입을 명시하고, API 응답 타입은 도메인 API 계층에 둡니다.
- lint는 변경 전후 `npm run lint`로 확인합니다.
- Expo 패키지를 추가할 때는 SDK 호환 버전을 맞추기 위해 `npx expo install <package>`를 사용합니다.