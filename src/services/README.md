# Services 폴더 규칙

기본적으로 비즈니스 로직과 API 조합은 각 도메인의 `src/features/{domain}/services`에 둡니다.

`src/services`는 특정 도메인 하나에 소속시키기 어려운 전역 유스케이스가 생겼을 때만 사용합니다.
아직 전역 유스케이스가 없다면 만들지 않아도 됩니다.

## 위치 기준

- 단일 도메인 API 호출: `src/features/{domain}/api`
- 단일 도메인 로직/API 조합: `src/features/{domain}/services`
- 도메인 전용 React hook: `src/features/{domain}/hooks`
- 여러 도메인을 조합하는 앱 레벨 흐름: 필요할 때만 `src/services`

## 작성 기준

- 하나의 service 파일은 하나의 유스케이스 또는 밀접한 유스케이스 묶음만 담당합니다.
- 서버 endpoint 문자열과 fetch 세부 구현은 가능하면 직접 다루지 않고, 각 도메인의 API 함수를 사용합니다.
- 공개 함수에는 JSDoc 주석을 작성합니다.
- 화면 컴포넌트가 복잡한 비동기 흐름을 직접 갖지 않도록 service로 옮깁니다.
- `src/services`를 모든 service를 모으는 폴더로 사용하지 않습니다.

## API와 Services의 기준

- `api`: `/users/me`를 호출한다.
- `features/users/services`: 내 정보를 조회한 뒤 온보딩 여부에 따라 다음 화면을 결정한다.
- `api`: 완료된 집중 기록을 서버에 저장한다.
- `features/timer/services`: 타이머 종료, 기록 저장, 알림 정리, 화면 이동을 하나의 흐름으로 처리한다.
- `src/services`: 로그인 완료 후 사용자, 타이머, 알림 등 여러 도메인을 함께 초기화한다.
