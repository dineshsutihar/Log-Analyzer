import { Router, Request, Response } from "express";
import multer from "multer";
import { parseAllLinuxLog } from "../utils/logParser";
import { parseWindowsEventLogCsv } from "../utils/parse-window";
import { WindowsLogModel } from "../models/LogWindowModel";
import { LinuxLogModel, LinuxLogModelType } from "../models/LinuxLogModel";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("logfile"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { hostname = "Unknown", source = "generic" } = req.body;
  const fileName = req.file.originalname.toLowerCase();
  const fileBuffer = req.file.buffer;

  try {
    let logDocument;

    if (fileName.endsWith(".csv")) {

      logDocument = await parseWindowsEventLogCsv(fileBuffer);
      const savedLog = await WindowsLogModel.insertMany(logDocument);

    } else if (fileName.endsWith(".log")) {
      const parseResult: LinuxLogModelType[] = await parseAllLinuxLog(fileBuffer.toString(), source);
      await LinuxLogModel.insertMany(parseResult);
    } else {
      res.status(400).json({ error: "Unsupported file type" });
      return;
    }

    res.json({ message: "Log successfully stored" });
  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to process the log file" });
    return;
  }
});

export default router;
