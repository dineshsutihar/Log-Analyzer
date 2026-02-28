import { apiGet } from './apiClient';

export default async function fetchStats(token) {
  return apiGet('/api/stats', token);
}
