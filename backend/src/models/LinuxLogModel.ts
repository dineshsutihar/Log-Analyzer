import mongoose, { Document, Schema } from "mongoose";

interface LinuxLogModelType {
  logType: "SYSLOG" | "AUTH" | "KERNEL" | "APPLICATION" | "UNKNOWN" | `UNKNOWN-${string}`;
  timestamp: Date;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  eventId: string;
  message: string;
  processId?: number | string;
  userId?: string;
  rawLine: string;
}

const LinuxLogSchema = new Schema<LinuxLogModelType & Document>({
  logType: { 
    type: String, 
    validate: {
      validator: function(v: string) {
        return ["SYSLOG", "AUTH", "KERNEL", "APPLICATION", "UNKNOWN"].includes(v) || v.startsWith("UNKNOWN-");
      }
    },
    required: true 
  },
  timestamp: { type: Date, required: true },
  severity: { type: String, enum: ["INFO", "WARNING", "ERROR", "CRITICAL"], required: true },
  eventId: { type: String, required: true },
  message: { type: String, required: true },
  processId: { type: Schema.Types.Mixed },
  userId: { type: String },
  rawLine: { type: String, required: true },
});

const LinuxLogModel = mongoose.model<LinuxLogModelType & Document>("LinuxLog", LinuxLogSchema);
export { LinuxLogModel, type LinuxLogModelType };