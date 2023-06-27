import { buildResponse } from "../utils";
import csv from "csv-parser";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from "@aws-sdk/client-sqs";

const results = [];

export const handler = async (event: any) => {
  try {
    const s3 = new S3Client();
    const sqsClient = new SQSClient();

    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    const response = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    response.Body.pipe(csv())
      .on("data", async (data) => {
        results.push(data);

        await sqsClient
          .send(
            new SendMessageCommand({
              QueueUrl:
                "https://sqs.us-east-1.amazonaws.com/585154451279/import-file-queue",
              MessageBody: JSON.stringify(data),
            })
          )
          .then(
            (data: SendMessageCommandOutput) => {
              console.log(`Successfully sent message ${data}`);
            },
            (error: unknown) => {
              console.log(error);
            }
          );
      })
      .on("end", () => {
        console.log(JSON.stringify(results));
      });

    try {
      const copyInput = {
        Bucket: bucket,
        CopySource: bucket + "/" + key,
        Key: key.replace("uploaded", "parsed"),
      };
      await s3
        .send(new CopyObjectCommand(copyInput))
        .then(console.log("File copied to /parsed folder"))
        .then(
          await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
        )
        .then(console.log("File deleted from /upload folder"));
    } catch {
      (err) => console.log(err);
    }
  } catch (err) {
    return buildResponse(500, {
      message: err.message,
    });
  }
};
