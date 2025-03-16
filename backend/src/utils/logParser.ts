import grok from 'grok-js';
import { LinuxLogModel, LinuxLogModelType } from "../models/LinuxLogModel";
import parseAuthLogFile from "./authlogParser";
import parseKernelLogFile from './kernellogParser';

export async function parseAllLinuxLog(data: string, source: string = "syslog"): Promise<any> {

  switch (source.toLowerCase()) {
    case "auth.log": {
      return parseAuthLogFile(data);
    }

    case "kernel.log": {
      // Example kernel.log format:
      // 2025-01-19T08:21:47.913794+05:30 dinesh kernel: audit: type=1400 audit(1737255107.912:165): apparmor="DENIED" operation="capable" ...
      return parseKernelLogFile(data);
    }
    // // TODO: Add more log types as needed and modify the syslog
    // case "syslog": {
    //   // Assume the syslog log is in JSON format.
    //   try {
    //     const parsed = JSON.parse(line);
    //     timestamp = new Date(parsed.timestamp);
    //     eventId = parsed.eventId || "application";
    //     message = parsed.message;
    //     severity = parsed.severity || "INFO";
    //     processId = parsed.processId;
    //     userId = parsed.userId;
    //   } catch (e) {
    //     throw new Error("Line does not match application log JSON format");
    //   }
    //   break;
    // }
    // default: {
    //   // Default Linux syslog format example:
    //   // "Jun 14 15:16:01 combo sshd(pam_unix)[19939]: authentication failure; logname= uid=0 euid=0 tty=NODEVssh ruser= rhost=218.188.2.4"
    //   const syslogRegex = /^(\w+\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+([\w\-.]+)(?:\(([\w\-.]+)\))?(?:\[(\d+)\])?:\s+(.*)$/;
    //   const match = line.match(syslogRegex);
    //   if (!match) {
    //     throw new Error("Line does not match syslog format");
    //   }
    //   // Destructure the regex groups:
    //   // Group 1: timestamp (e.g., "Jun 14 15:16:01")
    //   // Group 2: hostname (e.g., "combo")
    //   // Group 3: process name (e.g., "sshd")
    //   // Group 4 (optional): process subtype (e.g., "pam_unix")
    //   // Group 5 (optional): process id (e.g., "19939")
    //   // Group 6: message (the remainder of the log line)
    //   const [, ts, host, proc, procSub, pid, msg] = match;
    //   timestamp = new Date(`${ts} ${new Date().getFullYear()}`);
    //   eventId = proc;
    //   processId = pid ? parseInt(pid, 10) : undefined;
    //   message = msg;
    //   severity = "INFO"; // default severity
    //   break;
    // }

  }

}
