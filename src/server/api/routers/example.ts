import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { s3 } from "../../lib/aws";
import { env } from "../../../env/server.mjs";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  uploadImage: publicProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input }) => {
      return Promise.all(
        input.map((name) =>
          getSignedUrl(
            s3,
            new PutObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: name,
            }),
            {
              expiresIn: 3600,
            }
          )
        )
      );
    }),

  getImages: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
      const result = await Promise.all(
        input.map((name) =>
          getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: name,
            }),
            {
              expiresIn: 3600,
            }
          )
        )
      );

      return result.map((url, index) => ({
        name: input[index]!,
        url,
      }));
    }),
});
