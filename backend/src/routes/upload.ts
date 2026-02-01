import { Router, Request, Response } from "express";
import multer from "multer";
import { parseAllLinuxLog } from "../utils/logParser";
import { parseWindowsEventLogCsv } from "../utils/parse-window";
import UnifiedLogModel, {
  UnifiedLogModelType,
} from "../models/UnifiedLogModel";
import { uploadLimiter } from "../middleware/security";
import { asyncHandler } from "../middleware/errorHandler";
import { ValidationError } from "../middleware/errors";
import logger from "../utils/logger";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'text/csv', 'application/octet-stream'];
    if (allowedTypes.includes(file.mimetype) ||
      file.originalname.endsWith('.log') ||
      file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new ValidationError('Invalid file type. Only .log and .csv files are allowed'));
    }
  },
});

router.post(
  "/upload",
  uploadLimiter,
  upload.single("logfile"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    let { source } = req.body;
    const fileName = req.file.originalname.toLowerCase();
    const fileBuffer = req.file.buffer;
    source = source ? source : fileName;
    const ownerId = req.auth.userId;

    logger.info(`User ${ownerId} uploading file: ${fileName}`);

    if (fileName.endsWith(".csv")) {
      const logDocument = await parseWindowsEventLogCsv(fileBuffer);
      await UnifiedLogModel.insertMany(
        logDocument.map((log) => ({
          ...log,
          ownerId,
        }))
      );
      logger.info(`Successfully imported ${logDocument.length} Windows logs from ${fileName}`);
    } else if (fileName.endsWith(".log")) {
      const parseResult: UnifiedLogModelType[] = await parseAllLinuxLog(
        fileBuffer.toString(),
        source
      );
      await UnifiedLogModel.insertMany(
        parseResult.map((log) => ({
          ...log,
          ownerId,
        }))
      );
      logger.info(`Successfully imported ${parseResult.length} Linux logs from ${fileName}`);
    } else {
      throw new ValidationError("Unsupported file type. Only .log and .csv files are supported");
    }

    res.json({
      status: 'success',
      message: "Log file successfully processed and stored",
    });
  })
);

export default router;

