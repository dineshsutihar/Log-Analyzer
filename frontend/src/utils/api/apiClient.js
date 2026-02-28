/**
 * Centralized API client with authentication support.
 * All API calls should use this to ensure consistent auth token handling.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Make an authenticated API request.
 * @param {string} endpoint - API endpoint (e.g., '/api/stats')
 * @param {Object} options - Fetch options
 * @param {string|null} token - Auth token (optional, for public endpoints)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Make an authenticated GET request.
 */
export async function apiGet(endpoint, token = null) {
  return apiRequest(endpoint, { method: 'GET' }, token);
}

/**
 * Make an authenticated POST request.
 */
export async function apiPost(endpoint, body, token = null) {
  const options = {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  };
  return apiRequest(endpoint, options, token);
}

/**
 * Make an authenticated DELETE request.
 */
export async function apiDelete(endpoint, token = null) {
  return apiRequest(endpoint, { method: 'DELETE' }, token);
}

export default { apiRequest, apiGet, apiPost, apiDelete };
