import { apiPost } from './apiClient';

export default async function chatApi(logObject, token) {
  return apiPost('/api/chat', {
    logId: logObject.logId,
    userText: logObject.userText || "",
  }, token);
}

/**
 * System-wide AI chat — sends user question with aggregated log context.
 * @param {string} userText - User's question about their system
 * @param {string} token - Auth token
 * @returns {Promise<{response: string}>}
 */
export async function chatSystemApi(userText, token) {
  return apiPost('/api/chat/system', { userText }, token);
}

/**
 * Log query AI chat — searches through logs to answer questions.
 * @param {string} userText - User's question about specific logs
 * @param {string} token - Auth token
 * @returns {Promise<{response: string, matchCount: number, logsReturned: number}>}
 */
export async function chatQueryApi(userText, token) {
  return apiPost('/api/chat/query', { userText }, token);
}
