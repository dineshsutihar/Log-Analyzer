import { LinuxLogModel } from "../models/LinuxLogModel";


export function parseSyslogLine(line: string, source: string = "syslog"): any {
  let timestamp: Date, severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" = "INFO";
  let eventId = "", message = "";
  let processId: number | undefined, userId: string | undefined;
  const rawLine = line;

  switch (source.toLowerCase()) {
    case "auth.log": {
      // Example auth.log format:
      // 2025-02-16T11:49:52.376716+00:00 Dinesh login[315]: PAM unable to dlopen(pam_lastlog.so): /usr/lib/security/pam_lastlog.so: cannot open shared object file: No such file or directory
      const authRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2})\s+(\S+)\s+([\w\-.]+)(?:\[(\d+)\])?:\s+(.*)$/;
      const match = line.match(authRegex);
      if (!match) {
        throw new Error("Line does not match auth.log format");
      }
      const [, ts, username, proc, pid, msg] = match;
      timestamp = new Date(ts);
      eventId = proc;
      processId = pid ? parseInt(pid, 10) : undefined;
      message = msg;
      userId = username;
      break;
    }

    case "kernel.log": {
      // Example kernel.log format:
      // 2025-01-19T08:21:47.913794+05:30 dinesh kernel: audit: type=1400 audit(1737255107.912:165): apparmor="DENIED" operation="capable" ...
      const kernelRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2})\s+(\S+)\s+kernel:\s+(.*)$/;
      const match = line.match(kernelRegex);
      if (!match) {
        throw new Error("Line does not match kernel.log format");
      }
      const [, ts, username, msg] = match;
      timestamp = new Date(ts);
      eventId = "kernel";
      message = msg;
      userId = username; // Optionally capture the username
      break;
    }
    // TODO: Add more log types as needed and modify the syslog
    case "syslog": {
      // Assume the syslog log is in JSON format.
      try {
        const parsed = JSON.parse(line);
        timestamp = new Date(parsed.timestamp);
        eventId = parsed.eventId || "application";
        message = parsed.message;
        severity = parsed.severity || "INFO";
        processId = parsed.processId;
        userId = parsed.userId;
      } catch (e) {
        throw new Error("Line does not match application log JSON format");
      }
      break;
    }
    default: {
      // Default Linux syslog format example:
      // "Jun 14 15:16:01 combo sshd(pam_unix)[19939]: authentication failure; logname= uid=0 euid=0 tty=NODEVssh ruser= rhost=218.188.2.4"
      const syslogRegex = /^(\w+\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+([\w\-.]+)(?:\(([\w\-.]+)\))?(?:\[(\d+)\])?:\s+(.*)$/;
      const match = line.match(syslogRegex);
      if (!match) {
        throw new Error("Line does not match syslog format");
      }
      // Destructure the regex groups:
      // Group 1: timestamp (e.g., "Jun 14 15:16:01")
      // Group 2: hostname (e.g., "combo")
      // Group 3: process name (e.g., "sshd")
      // Group 4 (optional): process subtype (e.g., "pam_unix")
      // Group 5 (optional): process id (e.g., "19939")
      // Group 6: message (the remainder of the log line)
      const [, ts, host, proc, procSub, pid, msg] = match;
      timestamp = new Date(`${ts} ${new Date().getFullYear()}`);
      eventId = proc;
      processId = pid ? parseInt(pid, 10) : undefined;
      message = msg;
      severity = "INFO"; // default severity
      break;
    }

  }

  return {
    timestamp,
    severity,
    eventId,
    message,
    processId,
    userId,
    rawLine,
  };
}
