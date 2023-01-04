import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { s3 } from "../../lib/aws";
import { env } from "../../../env/server.mjs";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const signedUrlSchema = z.object({
  // The name of the file in the S3 bucket
  key: z.string(),
});

export const exampleRouter = createTRPCRouter({
  getUploadSignedUrls: publicProcedure
    .input(z.array(signedUrlSchema))
    .mutation(async ({ input }) => {
      return Promise.all(
        input.map(({ key }) =>
          getSignedUrl(
            s3,
            new PutObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: key,
            }),
            {
              expiresIn: 3600,
            }
          )
        )
      );
    }),

  getDownloadSignedUrls: publicProcedure
    .input(z.array(signedUrlSchema))
    .query(async ({ input }) => {
      const result = await Promise.all(
        input.map(({ key }) =>
          getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: key,
            }),
            {
              expiresIn: 3600,
            }
          )
        )
      );

      return result.map((url, index) => ({
        key: input[index]!.key,
        url,
      }));
    }),
});
