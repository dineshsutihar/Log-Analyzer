import { loadDefaultSync, GrokCollection, GrokPattern } from 'grok-js';
import readline from "readline";
import { Readable } from "stream";
import UnifiedLogSchema from "../models/UnifiedLogModel";
import { UnifiedLogModelType } from "../models/UnifiedLogModel";
import { inferSeverity } from './severityInfer';

const grokCollection: GrokCollection = loadDefaultSync();
const authLogPattern = '%{TIMESTAMP_ISO8601:timestamp}|%{DATESTAMP:timestamp}|%{SYSLOGTIMESTAMP:timestamp} (?:%{SYSLOGHOST:userId})? (?:%{DATA:process}:)? %{GREEDYDATA:message}';

const grokPatter: GrokPattern = grokCollection.createPattern(authLogPattern);

export default async function parseGenericLogs(data: string, source: string): Promise<UnifiedLogModelType[]> {
  const entries: UnifiedLogModelType[] = [];
  const fileStream = Readable.from(data);
  const rl = readline.createInterface({ input: fileStream });

  for await (const line of rl) {
    const parsedEntry = grokPatter.parseSync(line);

    const entry: UnifiedLogModelType = {
      operatingSystem: "Linux",

      severity: inferSeverity(parsedEntry.message),
      timestamp: new Date(parsedEntry.timestamp || ''),
      eventId: parsedEntry.eventId || 'unknown',
      message: (parsedEntry.message || '').trim(),
      uploadDate: new Date(),
      analyzed: false,

      logType: `UNKNOWN-${source}` as "UNKNOWN" | `UNKNOWN-${string}`,
      rawLine: line,
      processId: parsedEntry.process,
      userId: parsedEntry.userId,
    };

    entries.push(entry);
  }

  return entries;
}
