import { LinuxLogModelType } from '../models/LinuxLogModel';

function inferSeverity(message: string): LinuxLogModelType['severity'] {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('critical')) return 'CRITICAL';
  if (lowerMsg.includes('error')) return 'ERROR';
  if (lowerMsg.includes('warning')) return 'WARNING';
  return 'INFO'; // default
}

export { inferSeverity };