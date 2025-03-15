import { Router, Request, Response } from "express";
import multer from "multer";
// import { parseSyslogLine } from "../utils/logParser";
import { parseWindowsEventLogCsv } from "../utils/parse-window";
import { WindowsLogModel } from "../models/LogWindowModel";

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

      // res.json({ message: "Log successfully stored", logId: logDocument._id }); 


      // } else if (fileName.endsWith(".log")) {
      //   const fileStream = Readable.from(fileBuffer);
      //   const rl = readline.createInterface({ input: fileStream });

      //   const entries: any[] = [];
      //   for await (const line of rl) {
      //     try {
      //       // Pass source if needed for parsing
      //       const parsedEntry = parseSyslogLine(line, source);
      //       entries.push(parsedEntry);
      //     } catch (error) {
      //       console.error(`Failed to parse line: ${line}`);
      //     }
      //   }

      //   logDocument = new LogModel({
      //     logType: "linux",
      //     logSubType: source,
      //     hostname,
      //     source,
      //     entries,
      //     uploadDate: new Date(),
      //     analyzed: false,
      //   });
    } else {
      res.status(400).json({ error: "Unsupported file type" });
      return;
    }

    const savedLog = await WindowsLogModel.insertMany(logDocument);
    res.json({ message: "Log successfully stored", logId: savedLog[0]._id });
  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to process the log file" });
    return;
  }
});

export default router;
