import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../../env/server.mjs";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export { s3 };
