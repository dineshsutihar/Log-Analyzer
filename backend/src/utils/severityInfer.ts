import { LinuxLogModelType } from '../models/LinuxLogModel';

function inferSeverity(message: string): LinuxLogModelType['severity'] {
  const lowerMsg = message.toLowerCase();

  const criticalKeywords = [
    'critical', 'fatal', 'panic', 'emergency', 'halt',
    'corrupted', 'catastrophic', 'unrecoverable', 'breakdown',
    'outage', 'deadlock', 'core dumped', 'kernel panic'
  ];
  if (criticalKeywords.some(keyword => lowerMsg.includes(keyword))) return 'CRITICAL';

  const errorKeywords = [
    'error', 'failed', 'exception', 'uncaught', 'unhandled',
    'undefined', 'null reference', 'segmentation fault',
    'reject', 'invalid', 'illegal', 'unable', 'denied',
    'corrupt', 'missing', 'not found', 'unavailable',
    'timeout', 'crash', 'rejected', 'aborted'
  ];
  if (errorKeywords.some(keyword => lowerMsg.includes(keyword))) return 'ERROR';

  const warningKeywords = [
    'warning', 'alert', 'notice', 'deprecated', 'obsolete',
    'degraded', 'retry', 'fallback', 'backoff',
    'threshold', 'saturation', 'overflow', 'underflow',
    'conflict', 'mismatch', 'unstable', 'unsupported',
    'insecure', 'expired', 'overload', 'high latency',
    'high load', 'high memory', 'high cpu'
  ];
  if (warningKeywords.some(keyword => lowerMsg.includes(keyword))) return 'WARNING';

  const infoKeywords = [
    'info', 'initialized', 'started', 'completed',
    'connected', 'disconnected', 'registered',
    'status', 'configuration', 'received', 'sent',
    'allocated', 'deallocated', 'authenticated',
    'authorized', 'success', 'finished', 'loaded'
  ];
  if (infoKeywords.some(keyword => lowerMsg.includes(keyword))) return 'INFO';

  return 'INFO';
}

export { inferSeverity };