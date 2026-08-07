export const AUTH_STORAGE_KEYS = {
  accessToken: "cascadheure_access_token",
  refreshToken: "cascadheure_refresh_token",
  user: "cascadheure_user",
  userMode: "cascadheure_user_mode",
  rememberMe: "cascadheure_remember_me",
} as const;

const AUTH_KEYS = Object.values(AUTH_STORAGE_KEYS);

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAuthStorage(): Storage | null {
  if (!isBrowser()) return null;

  const hasLocalSession = Boolean(
    window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) ||
    window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) ||
    window.localStorage.getItem(AUTH_STORAGE_KEYS.user),
  );

  if (hasLocalSession) return window.localStorage;

  const hasSessionSession = Boolean(
    window.sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken) ||
    window.sessionStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) ||
    window.sessionStorage.getItem(AUTH_STORAGE_KEYS.user),
  );

  return hasSessionSession ? window.sessionStorage : null;
}

export function getStoredAuthItem(key: string): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
}

export function setStoredAuthItem(key: string, value: string) {
  const storage = getAuthStorage();
  storage?.setItem(key, value);
}

export function clearAuthStorage() {
  if (!isBrowser()) return;

  for (const key of AUTH_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

export function saveAuthSession(
  tokens: { accessToken: string; refreshToken: string },
  user: unknown,
  userMode: string,
  rememberMe: boolean,
) {
  if (!isBrowser()) return;

  clearAuthStorage();

  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(AUTH_STORAGE_KEYS.accessToken, tokens.accessToken);
  storage.setItem(AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken);
  storage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  storage.setItem(AUTH_STORAGE_KEYS.userMode, userMode);
  storage.setItem(AUTH_STORAGE_KEYS.rememberMe, String(rememberMe));
}
