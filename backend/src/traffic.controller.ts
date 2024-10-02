import {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { Request, Response } from "express";

const cloudWatchClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
});

export async function handleTraffic(req: Request, res: Response) {
  const { customerId: logGroupName, dataSourceId: logStreamName } = req.params;

  const logEvent = {
    timestamp: new Date().getTime(),
    message: JSON.stringify({
      eventType: "apiRequest",
      ...req.body,
    }),
  };

  try {
    await ensureLogStreamExists(logGroupName, logStreamName);
    const sequenceToken = await getSequenceToken(logGroupName, logStreamName);

    const inputs = {
      logGroupName,
      logStreamName,
      logEvents: [logEvent],
      sequenceToken,
    };
    const command = new PutLogEventsCommand(inputs);
    await cloudWatchClient.send(command);

    res.status(200).send("Traffic log received");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

async function ensureLogStreamExists(
  logGroupName: string,
  logStreamName: string
) {
  try {
    const createStreamCommand = new CreateLogStreamCommand({
      logGroupName,
      logStreamName,
    });
    await cloudWatchClient.send(createStreamCommand);
  } catch (error) {
    if ((error as Error).name !== "ResourceAlreadyExistsException") {
      throw error;
    }
  }
}

async function getSequenceToken(logGroupName: string, logStreamName: string) {
  const describeStreamsCommand = new DescribeLogStreamsCommand({
    logGroupName,
    logStreamNamePrefix: logStreamName,
  });
  const response = await cloudWatchClient.send(describeStreamsCommand);
  const logStream = response?.logStreams?.find(
    (stream) => stream.logStreamName === logStreamName
  );
  return logStream?.uploadSequenceToken;
}
