import { loadDefaultSync, GrokCollection } from 'grok-js';
import readline from "readline";
import { Readable } from "stream";
import { type LinuxLogModelType } from "../models/LinuxLogModel";
import { inferSeverity } from './severityInfer';



// Define type for raw parsed fields
interface GrokParseResult {
  timestamp?: string;
  userId?: string;
  message?: string;
}

// Add custom patterns safely
const grokCollection = loadDefaultSync();
const customPatterns = {
  // 'NOTSPACE': '\\S+',
  'USERNAME': '[a-zA-Z0-9._-]+',
  'KERNEL_EVENT': '[A-Za-z0-9_\\[\\]]+',
  // 'AUDIT_HEADER': 'audit: type=%{NUMBER:audit_type} audit\\(%{NUMBER:audit_epoch}\\.%{NUMBER:audit_sequence}\\):',
  // 'AUDIT_FIELD': '(\\w+="?[^"]*"?|\\w+=\\S+)',

}

for (const [name, pattern] of Object.entries(customPatterns)) {
  grokCollection.createPattern(`${name} ${pattern}`);
}

const KERNEL_PATTERN = [
  '%{TIMESTAMP_ISO8601:timestamp}',
  '%{USERNAME:userId}',
  'kernel:',
  '(?:%{KERNEL_EVENT:eventId}:%{GREEDYDATA:message}|%{GREEDYDATA:fullMessage})'
].join(' ');

const kernelParser = grokCollection.createPattern(KERNEL_PATTERN);

export default async function parseKernelLogFile(data: string, source: string): Promise<LinuxLogModelType[]> {
  const logType = source.toLowerCase() === 'kernel.log' ? 'KERNEL' : 'SYSLOG';
  const entries: LinuxLogModelType[] = [];
  const rl = readline.createInterface({
    input: Readable.from(data),
    crlfDelay: Infinity
  });


  for await (const line of rl) {
    if (!line.trim()) continue;

    const parsed = kernelParser.parseSync(line) as GrokParseResult;
    if (!parsed) continue;

    const entry = createLogEntry(line, parsed, logType);
    if (entry) entries.push(entry);
  }

  return entries;
}

function createLogEntry(rawLine: string, parsed: GrokParseResult, logType: string): LinuxLogModelType | null {
  if (!parsed.timestamp || !parsed.userId) {
    console.warn('Invalid log entry - missing timestamp or userId');
    return null;
  }

  const { eventId, message } = processMessageComponents(parsed);

  return {
    logType: `${logType}` as "KERNEL" | "SYSLOG",
    timestamp: new Date(parsed.timestamp),
    severity: inferSeverity(message),
    eventId: eventId || 'NoEvent',
    message: message || 'No Description',
    userId: parsed.userId,
    rawLine: rawLine
  };
}

function processMessageComponents(parsed: any): { eventId: string, message: string } {
  // Case 1: Structured message with event ID
  if (parsed.eventId && parsed.message) {
    return {
      eventId: parsed.eventId.trim(),
      message: parsed.message.trim()
    };
  }

  // Case 2: Unstructured message
  const rawMessage = parsed.fullMessage?.trim() || parsed.message?.trim() || '';
  const firstColonIndex = rawMessage.indexOf(':');

  if (firstColonIndex > -1) {
    return {
      eventId: rawMessage.substring(0, firstColonIndex).trim(),
      message: rawMessage.substring(firstColonIndex + 1).trim()
    };
  }

  // Case 3: No discernible event ID
  return {
    eventId: 'NoEvent',
    message: rawMessage
  };
}
