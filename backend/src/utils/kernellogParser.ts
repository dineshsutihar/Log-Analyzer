import { loadDefaultSync, GrokCollection } from 'grok-js';
import readline from "readline";
import { Readable } from "stream";
import { UnifiedLogModelType } from "../models/UnifiedLogModel";
import { inferSeverity } from './severityInfer';

interface GrokParseResult {
  timestamp?: string;
  userId?: string;
  eventId?: string;
  message?: string;
  fullMessage?: string;
}
const grokCollection: GrokCollection = loadDefaultSync();
const customPatterns = {
  'USERNAME': '[a-zA-Z0-9._-]+',
  'KERNEL_EVENT': '[A-Za-z0-9_\\[\\]]+',
};

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

export default async function parseKernelLogFile(data: string, source: string): Promise<UnifiedLogModelType[]> {

  const logType = source.toLowerCase() === 'kernel.log' ? 'KERNEL' : 'SYSLOG';
  const entries: UnifiedLogModelType[] = [];
  const rl = readline.createInterface({
    input: Readable.from(data),
    crlfDelay: Infinity,
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

function createLogEntry(rawLine: string, parsed: GrokParseResult, logType: string): UnifiedLogModelType | null {
  if (!parsed.timestamp || !parsed.userId) {
    console.warn('Invalid log entry - missing timestamp or userId');
    return null;
  }

  const { eventId, message } = processMessageComponents(parsed);

  return {
    operatingSystem: "Linux",
    logType: logType as "KERNEL" | "SYSLOG",
    timestamp: new Date(parsed.timestamp),
    severity: inferSeverity(message),
    eventId: eventId || 'NoEvent',
    message: message || 'No Description',
    userId: parsed.userId,
    rawLine: rawLine,
    uploadDate: new Date(),
    analyzed: false,
  };
}

function processMessageComponents(parsed: GrokParseResult): { eventId: string, message: string } {
  // Case 1: Structured message with event ID
  if (parsed.eventId && parsed.message) {
    return {
      eventId: parsed.eventId.trim(),
      message: parsed.message.trim(),
    };
  }

  // Case 2: Unstructured message - attempt to split on the first colon.
  const rawMessage = (parsed.fullMessage?.trim() || parsed.message?.trim() || '');
  const firstColonIndex = rawMessage.indexOf(':');

  if (firstColonIndex > -1) {
    return {
      eventId: rawMessage.substring(0, firstColonIndex).trim(),
      message: rawMessage.substring(firstColonIndex + 1).trim(),
    };
  }

  // Case 3: No discernible event ID; use raw message.
  return {
    eventId: 'NoEvent',
    message: rawMessage,
  };
}
