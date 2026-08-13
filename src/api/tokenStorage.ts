import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "atchagong.accessToken";
const REFRESH_TOKEN_KEY = "atchagong.refreshToken";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Reads the current access token from the device keychain-backed storage.
 */
export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/**
 * Reads the current refresh token used for access token reissue requests.
 */
export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Persists both auth tokens after login or token reissue.
 */
export async function saveAuthTokens(tokens: AuthTokens) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

/**
 * Clears locally stored auth tokens when the session is no longer valid.
 */
export async function clearAuthTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
