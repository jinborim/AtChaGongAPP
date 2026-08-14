import * as SecureStore from "expo-secure-store";

const AUTH_TOKENS_KEY = "atchagong.authTokens";
const LEGACY_ACCESS_TOKEN_KEY = "atchagong.accessToken";
const LEGACY_REFRESH_TOKEN_KEY = "atchagong.refreshToken";
const CLEARED_AUTH_TOKENS_VALUE = "null";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

let tokenOperation = Promise.resolve();

function serializeTokenOperation<T>(operation: () => Promise<T>) {
  const nextOperation = tokenOperation.then(operation, operation);

  tokenOperation = nextOperation.then(
    () => undefined,
    () => undefined,
  );

  return nextOperation;
}

function isAuthTokens(value: unknown): value is AuthTokens {
  return (
    typeof value === "object" &&
    value !== null &&
    "accessToken" in value &&
    "refreshToken" in value &&
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string"
  );
}

function parseStoredAuthTokens(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;
    return isAuthTokens(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

async function deleteLegacyAuthTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(LEGACY_ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY),
  ]);
}

async function cleanupLegacyAuthTokens() {
  try {
    await deleteLegacyAuthTokens();
  } catch {
    // 단일 저장 키가 기준이므로 legacy key 정리 실패는 인증 흐름을 막지 않습니다.
  }
}

async function readLegacyAuthTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(LEGACY_ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(LEGACY_REFRESH_TOKEN_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    await cleanupLegacyAuthTokens();
    return null;
  }

  const tokens = { accessToken, refreshToken };

  await SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  await cleanupLegacyAuthTokens();

  return tokens;
}

async function readAuthTokens() {
  const storedValue = await SecureStore.getItemAsync(AUTH_TOKENS_KEY);

  if (storedValue !== null) {
    return parseStoredAuthTokens(storedValue);
  }

  return readLegacyAuthTokens();
}

/**
 * 기기 보안 저장소에서 현재 인증 토큰 쌍을 조회합니다.
 * 예전 분리 저장 키가 남아 있으면 단일 저장 값으로 한 번 마이그레이션합니다.
 */
export async function getAuthTokens() {
  return serializeTokenOperation(readAuthTokens);
}

/**
 * 기기 보안 저장소에서 현재 access token을 조회합니다.
 */
export async function getAccessToken() {
  const tokens = await getAuthTokens();

  return tokens?.accessToken ?? null;
}

/**
 * access token 재발급에 사용할 refresh token을 조회합니다.
 */
export async function getRefreshToken() {
  const tokens = await getAuthTokens();

  return tokens?.refreshToken ?? null;
}

/**
 * 로그인 또는 토큰 재발급 이후 받은 access/refresh token을 함께 저장합니다.
 */
export async function saveAuthTokens(tokens: AuthTokens) {
  await serializeTokenOperation(async () => {
    await SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    await cleanupLegacyAuthTokens();
  });
}

/**
 * 현재 refresh token이 expectedRefreshToken과 같을 때만 새 토큰을 저장합니다.
 * 재발급 중 로그아웃하거나 다른 계정으로 전환된 경우 이전 세션 토큰이 덮어쓰지 않게 막습니다.
 */
export async function saveAuthTokensIfRefreshTokenMatches(
  tokens: AuthTokens,
  expectedRefreshToken: string,
) {
  return serializeTokenOperation(async () => {
    const currentTokens = await readAuthTokens();

    if (currentTokens?.refreshToken !== expectedRefreshToken) {
      return false;
    }

    await SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    await cleanupLegacyAuthTokens();

    return true;
  });
}

/**
 * 현재 refresh token이 expectedRefreshToken과 같을 때만 로컬 인증 토큰을 삭제합니다.
 * 토큰 비교와 삭제를 같은 직렬화 작업 안에서 실행해 새 세션 토큰 삭제를 막습니다.
 */
export async function clearAuthTokensIfRefreshTokenMatches(
  expectedRefreshToken: string,
) {
  return serializeTokenOperation(async () => {
    const currentTokens = await readAuthTokens();

    if (currentTokens?.refreshToken !== expectedRefreshToken) {
      return false;
    }

    await SecureStore.setItemAsync(
      AUTH_TOKENS_KEY,
      CLEARED_AUTH_TOKENS_VALUE,
    );
    await cleanupLegacyAuthTokens();

    return true;
  });
}

/**
 * 로그아웃하거나 세션이 유효하지 않을 때 로컬에 저장된 인증 토큰을 삭제합니다.
 */
export async function clearAuthTokens() {
  await serializeTokenOperation(async () => {
    await SecureStore.setItemAsync(
      AUTH_TOKENS_KEY,
      CLEARED_AUTH_TOKENS_VALUE,
    );
    await cleanupLegacyAuthTokens();
  });
}
