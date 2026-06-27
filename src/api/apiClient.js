const SESSION_KEY = 'absensi_session_v2';

function getStoredToken() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return session?.token || null;
  } catch {
    return null;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    // Jika token kadaluwarsa (401), hapus sesi di frontend
    if (response.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    }
    throw new Error(result.message || 'Terjadi kesalahan pada request API.');
  }

  return result.data;
}

export const apiClient = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body });
  },
  put(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body });
  },
  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};
export default apiClient;
