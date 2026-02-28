import { apiGet } from './apiClient';

export default async function logtypeStatus(token) {
  return apiGet('/api/logtypeStatus', token);
}
