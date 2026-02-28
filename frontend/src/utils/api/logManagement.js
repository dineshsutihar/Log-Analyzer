import { apiGet, apiDelete, apiRequest } from './apiClient';

/**
 * Search logs with advanced filters
 * @param {Object} params - Search parameters
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Search results with pagination
 */
export async function searchLogs(params = {}, token = null) {
  const query = new URLSearchParams();
  
  if (params.q) query.set('q', params.q);
  if (params.severity) query.set('severity', params.severity);
  if (params.logType) query.set('logType', params.logType);
  if (params.os) query.set('os', params.os);
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  return apiGet(`/api/logs/search?${query.toString()}`, token);
}

/**
 * Export logs as CSV or JSON
 * @param {Object} params - Export filters
 * @param {string} format - 'csv' or 'json'
 * @param {string} token - Auth token
 */
export async function exportLogs(params = {}, format = 'csv', token = null) {
  const query = new URLSearchParams();
  query.set('format', format);
  
  if (params.severity) query.set('severity', params.severity);
  if (params.logType) query.set('logType', params.logType);
  if (params.os) query.set('os', params.os);
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);

  const url = `${import.meta.env.VITE_BACKEND_URL}/api/logs/export?${query.toString()}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) throw new Error('Export failed');

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `logs-export-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'csv'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Delete a single log
 * @param {string} id - Log ID
 * @param {string} token - Auth token
 */
export async function deleteLog(id, token = null) {
  return apiDelete(`/api/logs/${id}`, token);
}

/**
 * Bulk delete logs
 * @param {string[]} ids - Array of log IDs
 * @param {string} token - Auth token
 */
export async function bulkDeleteLogs(ids, token = null) {
  return apiRequest('/api/logs', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  }, token);
}

/**
 * Delete all logs matching filters
 * @param {Object} filters - Filters to match
 * @param {string} token - Auth token
 */
export async function deleteAllLogs(filters = {}, token = null) {
  return apiRequest('/api/logs', {
    method: 'DELETE',
    body: JSON.stringify({ deleteAll: true, filters }),
  }, token);
}
