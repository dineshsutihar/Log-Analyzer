import { apiPost } from './apiClient';

export default async function chatApi(logObject, token) {
  return apiPost('/api/chat', {
    logId: logObject.logId,
    userText: logObject.userText || "",
  }, token);
}
