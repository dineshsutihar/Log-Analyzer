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

  let { source } = req.body;
  const fileName = req.file.originalname.toLowerCase();
  const fileBuffer = req.file.buffer;
  source = source ? source : fileName;

  try {
    if (fileName.endsWith(".csv")) {
      let logDocument = await parseWindowsEventLogCsv(fileBuffer);
      await WindowsLogModel.insertMany(logDocument);
    } else if (fileName.endsWith(".log")) {
      const parseResult: LinuxLogModelType[] = await parseAllLinuxLog(fileBuffer.toString(), source);
      await LinuxLogModel.insertMany(parseResult);
    } else {
      res.status(400).json({ error: "Unsupported file type" });
      return;
    }
    res.json({ message: "Log successfully stored" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process the log file. Please retry after few minutes..." });
  }

}
);

export default router;
