# API 폴더 규칙

`src/api`는 백엔드 HTTP API와 직접 통신하는 코드만 둡니다.

## 역할

- 서버 endpoint path, request body, query, response type을 정의합니다.
- `apiClient`를 통해 HTTP 요청을 실행합니다.
- 백엔드 응답 형식을 앱에서 쓰기 좋은 타입으로 얇게 매핑합니다.
- 화면 상태 관리, 라우팅, 여러 기능을 조합하는 유스케이스 로직은 작성하지 않습니다.

## 파일 배치

- `client.ts`: 서버 요청의 공개 진입점입니다.
- `types.ts`: API 공통 응답, 에러, 요청 옵션 타입을 둡니다.
- `tokenStorage.ts`: 인증 토큰 저장소 접근만 담당합니다.
- `core/`: URL 생성, fetch 실행, 응답 파싱, 토큰 재발급 같은 내부 구현을 둡니다.
- 도메인 API가 생기면 `auth.ts`, `users.ts`, `timer.ts`처럼 endpoint 기준으로 파일을 추가합니다.

## 작성 규칙

- 하나의 파일은 하나의 책임만 담당합니다.
- 외부에서 써야 하는 함수와 타입은 `index.ts`에서 명시적으로 export합니다.
- 공개 함수에는 JSDoc 주석을 작성합니다.
- 도메인 API 함수는 가능하면 얇게 유지하고, 복잡한 앱 흐름은 `src/services`에서 조합합니다.
- endpoint 문자열은 도메인 API 파일 안에 두고 화면 컴포넌트에 직접 쓰지 않습니다.

## 예시

```ts
/**
 * 현재 로그인한 사용자의 프로필을 조회합니다.
 */
export function getMe() {
  return apiClient.request<Me>("/users/me");
}
```
