// Cliente de API central: URL base, token e tratamento de sessão expirada.
export const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const TOKEN_KEY = 'token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage indisponível: sessão vale só enquanto a aba estiver aberta */
  }
};

// App.jsx registra aqui o que fazer quando o token expira (401).
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && auth && onUnauthorized) onUnauthorized();
    throw new ApiError(
      data.message || 'Erro inesperado. Tente novamente.',
      response.status,
    );
  }
  return data;
}
