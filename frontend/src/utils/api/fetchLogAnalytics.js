import { apiGet } from './apiClient';

export default async function fetchAllLogs(token) {
  return apiGet('/api/getLogAnalytics', token);
}
