import express from 'express';
import { Request, Response } from 'express';
import { LinuxLogModel } from '../models/LinuxLogModel';

const router = express.Router();

router.get('/logtypeStatus', async (req: Request, res: Response) => {
  try {
    /*
    const data = [
  { label: "SYSLOG", value: 50000 },
  { label: "WINDOWLOG", value: 35000 },
  { label: "AUTHLOG", value: 10000 },
  { label: "KERNEL", value: 10000 },
  { label: "UNKNOWN", value: 5000 },
];
    */

    const syslogCount = await LinuxLogModel.countDocuments({ logType: 'SYSLOG' });
    const windowlogCount = await LinuxLogModel.countDocuments({ logType: 'WINDOWLOG' });
    const authlogCount = await LinuxLogModel.countDocuments({ logType: 'AUTH' });
    const kernelCount = await LinuxLogModel.countDocuments({ logType: 'KERNEL' });
    const unknownCount = await LinuxLogModel.countDocuments({ logType: { $regex: 'UNKNOWN' } });

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



