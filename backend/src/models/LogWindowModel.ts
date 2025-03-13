import mongoose, { Schema, Document } from 'mongoose';

type WindowsLog = {
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  timestamp: Date;
  source: string;
  eventId: number;
  taskCategory: string;
  message: string;
  uploadDate: Date;
  analyzed: boolean;
};

const WindowsLogSchema = new Schema<WindowsLog & Document>({
  severity: { type: String, enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'], required: true },
  timestamp: { type: Date, required: false },
  source: { type: String, required: true },
  eventId: { type: Number, required: true },
  taskCategory: { type: String, required: true },
  message: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  analyzed: { type: Boolean, default: false },
});

const WindowsLogModel = mongoose.model<WindowsLog & Document>('WindowsLog', WindowsLogSchema);
export { WindowsLogModel, type WindowsLog };
