# Features 폴더 규칙

`src/features`는 화면에서 쓰이는 도메인 기능을 한곳에 모읍니다.

## 구조

- `api/`: 해당 도메인의 백엔드 endpoint 함수와 request/response 타입
- `services/`: API, 로컬 저장소, 네이티브 기능을 조합한 유스케이스
- `hooks/`: 화면에서 사용하는 React hook
- `socialProvider/`, `utils/` 등: 해당 도메인 안에서만 의미가 큰 보조 모듈

## 기준

- 공통 HTTP 클라이언트, 응답 파싱, 토큰 저장소는 `src/api`에 둡니다.
- 특정 도메인에만 쓰이는 API와 서비스는 `src/features/{domain}` 안에 둡니다.
- 화면은 가능하면 feature의 공개 진입점이나 하위 진입점에서 import합니다.
