import { loadDefaultSync, GrokCollection, GrokPattern } from 'grok-js';
import readline from "readline";
import { Readable } from "stream";
import { type LinuxLogModelType } from "../models/LinuxLogModel";
import { inferSeverity } from './severityInfer';

const grokCollection: GrokCollection = loadDefaultSync();
const authLogPattern = '%{TIMESTAMP_ISO8601:timestamp} %{USERNAME:userId} %{NOTSPACE:eventId}(?:\\[%{NUMBER:processId}\\])?: %{GREEDYDATA:message}';

const customPatterns = {
  'NOTSPACE': '\\S+',
  'USERNAME': '[a-zA-Z0-9._-]+',
}

for (const [name, pattern] of Object.entries(customPatterns)) {
  grokCollection.createPattern(`${name} ${pattern}`);
}

const grokPatter: GrokPattern = grokCollection.createPattern(authLogPattern);

// Example auth.log format:
// 2025-02-16T11:49:52.376716+00:00 Dinesh login[315]: PAM unable to dlopen(pam_lastlog.so): /usr/lib/security/pam_lastlog.so: cannot open shared object file: No such file or directory
export default async function parseAuthLogFile(data: string): Promise<LinuxLogModelType[]> {

  const entries: LinuxLogModelType[] = [];
  const fileStream = Readable.from(data);
  const rl = readline.createInterface({ input: fileStream });

  for await (const line of rl) {
    const parsedEntry = grokPatter.parseSync(line);

    const entry: LinuxLogModelType = {
      logType: 'AUTH',
      timestamp: new Date(parsedEntry.timestamp || ''),
      eventId: parsedEntry.eventId || 'unknown',
      message: parsedEntry.message?.trim() || '',
      rawLine: line,
      userId: parsedEntry.userId,
      processId: parsedEntry.processId ? parseInt(parsedEntry.processId) : undefined,
      severity: inferSeverity(parsedEntry.message),
    };
    entries.push(entry);

  }

  return entries as LinuxLogModelType[];
}
