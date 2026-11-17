const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const cartTokenKey = 'mukeja_cart_token_v1';

export function getCartToken() {
  let token = localStorage.getItem(cartTokenKey);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(cartTokenKey, token);
  }
  return token;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  headers.set('X-Cart-Token', getCartToken());
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
