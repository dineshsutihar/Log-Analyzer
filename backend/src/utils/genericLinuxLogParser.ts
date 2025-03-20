import { loadDefaultSync, GrokCollection, GrokPattern } from 'grok-js';
import readline from "readline";
import { Readable } from "stream";
import { type LinuxLogModelType } from "../models/LinuxLogModel";
import { inferSeverity } from './severityInfer';

const grokCollection: GrokCollection = loadDefaultSync();
const authLogPattern = '%{TIMESTAMP_ISO8601:timestamp}|%{DATESTAMP:timestamp}|%{SYSLOGTIMESTAMP:timestamp} (?:%{SYSLOGHOST:userId})? (?:%{DATA:process}:)? %{GREEDYDATA:message}';

// const customPatterns = {
//   'NOTSPACE': '\\S+',
//   'USERNAME': '[a-zA-Z0-9._-]+',
// }

// for (const [name, pattern] of Object.entries(customPatterns)) {
//   grokCollection.createPattern(`${name} ${pattern}`);
// }

const grokPatter: GrokPattern = grokCollection.createPattern(authLogPattern);

// Default Linux Unknown format example:
// "Jun 14 15:16:01 combo sshd(pam_unix)[19939]: authentication failure; logname= uid=0 euid=0 tty=NODEVssh ruser= rhost=218.188.2.4"
export default async function parseGenericLogs(data: string, source:string): Promise<LinuxLogModelType[]> {

  const entries: LinuxLogModelType[] = [];
  const fileStream = Readable.from(data);
  const rl = readline.createInterface({ input: fileStream });

  for await (const line of rl) {
    const parsedEntry = grokPatter.parseSync(line);

    const entry: LinuxLogModelType = {
      logType: `UNKNOWN-${source}` as "UNKNOWN",
      timestamp: new Date(parsedEntry.timestamp || ''),
      eventId: parsedEntry.eventId || 'unknown',
      message: parsedEntry.message?.trim() || '',
      rawLine: line,
      userId: parsedEntry.userId,
      processId: parsedEntry.process,
      severity: inferSeverity(parsedEntry.message),
    };
    entries.push(entry);

  }

  return entries as LinuxLogModelType[];
}
