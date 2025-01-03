import { loadDefaultSync, GrokCollection, GrokPattern } from 'grok-js';

// Load default patterns
const grokCollection: GrokCollection = loadDefaultSync();

// Define the syslog pattern
const syslogPattern = '%{SYSLOGTIMESTAMP:timestamp} %{SYSLOGHOST:hostname} %{DATA:process}: %{GREEDYDATA:message}';

// Compile the pattern
const grokPattern: GrokPattern = grokCollection.createPattern(syslogPattern);

export function parseSyslogLine(line: string): Record<string, string> {
  const result = grokPattern.parseSync(line);

  if (!result) {
    throw new Error('Failed to parse log line');
  }

  return result;
}