import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { Request, Response } from "express";
import NodeCache from "node-cache";

const cloudWatchClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const sequenceTokenCache = new NodeCache({ stdTTL: 3600 });
const logEventQueue = new Map();

export async function handleTraffic(req: Request, res: Response) {
  try {
    const { customerId: logGroupName, dataSourceId: logStreamName } =
      req.params;

    const key = `${logGroupName}:${logStreamName}`;
    const logEvent = {
      timestamp: new Date().getTime(),
      message: {
        eventType: "apiRequest",
        ...req.body,
      },
    };

    if (!logEventQueue.has(key)) {
      logEventQueue.set(key, []);
    }
    logEventQueue.get(key).push(logEvent);

    console.log(logEventQueue);

    res.status(200).send("Traffic log received and queued for processing");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}
