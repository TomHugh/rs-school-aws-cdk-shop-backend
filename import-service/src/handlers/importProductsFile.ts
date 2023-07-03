import { buildResponse } from '../utils';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const importProductsFile = async (event: any) => {
  const bucketName = "rs-school-shop-app-products-files";
  const name = event.queryStringParameters?.name;
  if (name == null || name == "") throw Error("Empty file name");
  const objectKey = `uploaded/${name.toString()}`;


    const client = new S3Client({ region: "us-east-1"});
    const command = new PutObjectCommand({ Bucket: bucketName, Key: objectKey });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};

export const handler = async (event: any) => {
  try {
        return await importProductsFile(event);
    } catch (err) {
        if (err.message === "Empty file name")
        return buildResponse(400, {
          message : err.message
        });
        return buildResponse(500, {
            message: err.message,
        });
    }
};