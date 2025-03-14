import { parse } from "csv-parse";
import { WindowsLog } from "../models/LogWindowModel";

function mapSeverity(level: string): "INFO" | "WARNING" | "ERROR" | "CRITICAL" {
  const levelMap: Record<string, "INFO" | "WARNING" | "ERROR" | "CRITICAL"> = {
    Information: "INFO",
    Warning: "WARNING",
    Error: "ERROR",
    Critical: "CRITICAL",
  };
  return levelMap[level] || "INFO";
}

export async function parseWindowsEventLogCsv(csvBuffer: Buffer): Promise<WindowsLog[]> {
  return new Promise((resolve, reject) => {
    const columns = ["Level", "Date and Time", "Source", "Event ID", "Task Category", "Message"];

    parse(
      csvBuffer.toString(),
      {
        columns,
        skip_empty_lines: true,
        relax_column_count: true
      },
      async (error, rows: Record<string, string>[]) => {
        if (error) {
          return reject(new Error(`Error parsing CSV: ${error.message}`));
        }

        const entries: WindowsLog[] = rows
          .filter((_, i) => i !== 0)
          .map((row) => ({
            severity: mapSeverity(row["Level"] || "Information"),
            timestamp: new Date(row["Date and Time"] || ""),
            source: row["Source"] || "",
            eventId: Number(row["Event ID"]) || 0,
            taskCategory: row["Task Category"] || "",
            message: row["Message"] || "",
            uploadDate: new Date(),
            analyzed: false,
          }));

        resolve(entries);
      }
    );
  });
}
