// import { LinuxLogModel } from "../models/LinuxLogModel";
// import { parseSyslogLine } from "./logParser";

// export async function parseLinuxLog(logBuffer: Buffer, hostname: string, source: string): Promise<any> {
//   return new Promise((resolve, reject) => {
//     try {
//       const logText = logBuffer.toString("utf-8");
//       const lines = logText.split("\n").filter(line => line.trim() !== "");

//       const entries = lines.map(line => {
//         try {
//           // parseSyslogLine should now return an ILogEntry
//           return parseSyslogLine(line, source);
//         } catch (error) {
//           console.error(`Failed to parse line: ${line}`);
//           return null;
//         }
//       }).filter(entry => entry !== null) as any; // assert non-null ILogEntry[]

//       if (entries.length === 0) {
//         return reject(new Error("No valid log entries found"));
//       }

//       const logDocument = new LinuxLogModel({
//         logType: "linux",
//         logSubType: source,
//         hostname,
//         source,
//         entries,
//         uploadDate: new Date(),
//         analyzed: false,
//       });

//       resolve(logDocument);
//     } catch (error) {
//       reject(new Error(`Error parsing Linux log file...`));
//     }
//   });
// }


// // Cureent for getting filebuffer from upload.ts 

