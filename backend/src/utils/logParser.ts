import parseAuthLogFile from "./authlogParser";
import parseKernelLogFile from './kernellogParser';
import parseGenericLogs from './genericLinuxLogParser';

export async function parseAllLinuxLog(data: string, source: string): Promise<any> {

  switch (source.toLowerCase()) {
    case "auth.log": {
      return parseAuthLogFile(data);
    }

    case "kernel.log":
    case "syslog.log":
      {
        // Example kernel.log format:
        // 2025-01-19T08:21:47.913794+05:30 dinesh kernel: audit: type=1400 audit(1737255107.912:165): apparmor="DENIED" operation="capable" ...
        return parseKernelLogFile(data, source);
      }
    default: {
      // Default Linux Unknown format example:
      // "Jun 14 15:16:01 combo sshd(pam_unix)[19939]: authentication failure; logname= uid=0 euid=0 tty=NODEVssh ruser= rhost=218.188.2.4"
      return parseGenericLogs(data, source);
    }

  }

}
