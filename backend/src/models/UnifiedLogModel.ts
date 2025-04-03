import mongoose, { Document, Schema } from "mongoose";

type OperatingSystem = "Linux" | "Windows";

export interface UnifiedLogModelType {
  operatingSystem: OperatingSystem;

  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  timestamp: Date;

  eventId: string | number;
  message: string;
  uploadDate: Date;
  analyzed: boolean;
  rawLine?: string;

  logType: "WINDOWS" | "SYSLOG" | "AUTH" | "KERNEL" | "APPLICATION" | "UNKNOWN" | `UNKNOWN-${string}`;
  processId?: number | string;
  userId?: string;
  users?: string[];

  source?: string;
  taskCategory?: string;
}

const UnifiedLogSchema = new Schema<UnifiedLogModelType & Document>({
  operatingSystem: {
    type: String,
    enum: ["Linux", "Windows"],
    required: true,
  },

  severity: {
    type: String,
    enum: ["INFO", "WARNING", "ERROR", "CRITICAL"],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  eventId: {
    type: Schema.Types.Mixed,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    required: true,
  },
  analyzed: {
    type: Boolean,
    required: true,
  },
  rawLine: {
    type: String,
    required: true,
  },
  logType: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return ["WINDOWS", "SYSLOG", "AUTH", "KERNEL", "APPLICATION", "UNKNOWN"].includes(v) || v.startsWith("UNKNOWN-");
      },
      message: (props: any) => `${props.value} is not a valid logType!`,
    },
  },
  processId: {
    type: Schema.Types.Mixed,
  },
  userId: {
    type: String,
  },
  users: [
    {
      type: [String],
      default: [],
    },
  ],
  source: {
    type: String,
  },
  taskCategory: {
    type: String,
  },
});

export default mongoose.model<UnifiedLogModelType & Document>(
  "UnifiedLog",
  UnifiedLogSchema
);
