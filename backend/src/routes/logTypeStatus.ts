import express from "express";
import { Request, Response } from "express";
import { LinuxLogModel } from "../models/LinuxLogModel";
import UnifiedLogModel from "../models/UnifiedLogModel";

const router = express.Router();

router.get("/logtypeStatus", async (req: Request, res: Response) => {
  const ownerId = req.auth.userId;
  try {
    const syslogCount = await UnifiedLogModel.countDocuments({
      logType: "SYSLOG",
      ownerId,
    });
    const windowlogCount = await UnifiedLogModel.countDocuments({
      logType: "WINDOWS",
      ownerId,
    });
    const authlogCount = await UnifiedLogModel.countDocuments({
      logType: "AUTH",
      ownerId,
    });
    const kernelCount = await UnifiedLogModel.countDocuments({
      logType: "KERNEL",
      ownerId,
    });
    const unknownCount = await UnifiedLogModel.countDocuments({
      logType: { $regex: "UNKNOWN" },
      ownerId,
    });

    const data = [
      { label: "SYSLOG", value: syslogCount },
      { label: "WINDOWLOG", value: windowlogCount },
      { label: "AUTHLOG", value: authlogCount },
      { label: "KERNEL", value: kernelCount },
      { label: "UNKNOWN", value: unknownCount },
    ];

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
