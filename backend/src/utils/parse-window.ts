import { parse } from "csv-parse";
import { UnifiedLogModelType } from "../models/UnifiedLogModel";

function mapSeverity(level: string): "INFO" | "WARNING" | "ERROR" | "CRITICAL" {
  const levelMap: Record<string, "INFO" | "WARNING" | "ERROR" | "CRITICAL"> = {
    Information: "INFO",
    Warning: "WARNING",
    Error: "ERROR",
    Critical: "CRITICAL",
  };
  return levelMap[level] || "INFO";
}

export async function parseWindowsEventLogCsv(csvBuffer: Buffer): Promise<UnifiedLogModelType[]> {
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

        const validRows = rows.filter(row => row["Date and Time"] !== "Date and Time");

        const entries: UnifiedLogModelType[] = validRows.map(row => {
          let ts = new Date(row["Date and Time"]);
          if (isNaN(ts.getTime())) {
            console.warn(`Invalid date "${row["Date and Time"]}" - defaulting to current date`);
            ts = new Date();
          }

          return {
            operatingSystem: "Windows",
            severity: mapSeverity(row["Level"] || "Information"),
            timestamp: ts,
            logType: "WINDOWS",
            eventId: Number(row["Event ID"]) || 0,
            message: row["Message"] && row["Message"].trim() !== "" ? row["Message"].trim() : "No description provided",
            rawLine: Object.values(row).join(", "),
            source: row["Source"] || "",
            taskCategory: row["Task Category"] || "",
            uploadDate: new Date(),
            analyzed: false,
          };
        });

        resolve(entries);
      }
    );
  });
}
