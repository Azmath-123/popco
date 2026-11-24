const rawBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pop-co-backend.onrender.com' : '');
const apiBase = rawBase
  ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/$/, '')}/api/v1`)
  : '/api/v1';
const cartTokenKey = 'mukeja_cart_token_v1';
const authTokenKey = 'popco_auth_token';

export function getCartToken() {
  let token = localStorage.getItem(cartTokenKey);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(cartTokenKey, token);
  }
  return token;
}

export function getAuthToken() {
  try {
    return localStorage.getItem(authTokenKey) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(authTokenKey, token);
    } else {
      localStorage.removeItem(authTokenKey);
    }
  } catch { }
}

export function removeAuthToken() {
  try {
    localStorage.removeItem(authTokenKey);
  } catch { }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  headers.set('X-Cart-Token', getCartToken());
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body != null && !(options.body instanceof FormData) && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || 'The request could not be completed.');
    error.code = payload.error?.code;
    error.status = response.status;
    error.details = payload.error?.details;
    throw error;
  }
  return payload;
}
