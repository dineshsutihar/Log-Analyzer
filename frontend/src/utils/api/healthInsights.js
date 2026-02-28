import { apiGet } from "./apiClient";

/**
 * Fetch system health score and breakdown.
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Health score data
 */
export async function fetchHealthScore(token) {
  return apiGet("/api/health-score", token);
}

/**
 * Fetch automated log insights (anomalies, patterns, trends).
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Insights data
 */
export async function fetchInsights(token) {
  return apiGet("/api/insights", token);
}
