# Services 폴더 규칙

`src/services`는 여러 도메인에 걸쳐 재사용되는 전역 유스케이스만 둡니다.

특정 도메인에만 쓰이는 서비스는 `src/features/{domain}/services`에 둡니다.

## 역할

- 여러 feature에 걸친 앱 동작 단위를 제공합니다.
- 여러 도메인 API 호출을 순서대로 실행하거나, 실패 처리와 후속 처리를 묶습니다.
- SecureStore, AsyncStorage, 알림, 소셜 로그인 SDK 같은 외부 기능과 API 호출을 조합합니다.
- 단일 서버 endpoint만 호출하는 얇은 함수는 `src/features/{domain}/api`에 둡니다.

## 작성 규칙

- 하나의 service 파일은 하나의 유스케이스 또는 밀접한 유스케이스 묶음만 담당합니다.
- 서버 endpoint 문자열과 fetch 세부 구현은 직접 다루지 않고 `src/api` 함수를 사용합니다.
- 공개 함수에는 JSDoc 주석을 작성합니다.
- 화면 컴포넌트가 복잡한 비동기 흐름을 직접 갖지 않도록 service로 옮깁니다.
- 도메인 전용 React hook은 `src/features/{domain}/hooks`에 둡니다.
- 도메인별 service는 `src/features/{domain}/services`에 둡니다.
  예: `features/auth/services/loginWithSocialCredential.ts`

## API와 Services의 기준

- `api`: `/users/me`를 호출한다.
- `services`: 내 정보를 조회한 뒤 온보딩 여부에 따라 다음 화면을 결정한다.
- `api`: 완료된 집중 기록을 서버에 저장한다.
- `services`: 타이머 종료, 기록 저장, 알림 정리, 화면 이동을 하나의 흐름으로 처리한다.
