import { Schema, model } from 'mongoose';

const logSchema = new Schema({
  timestamp: { type: Date, required: true },
  hostname: { type: String, required: true },
  process: { type: String, required: true },
  message: { type: String, required: true },
});

export const Log = model('Log', logSchema);