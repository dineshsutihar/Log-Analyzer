import { apiGet } from './apiClient';

export default async function severityInfo(token) {
  return apiGet('/api/severityInfo', token);
}
