/**
 * Inngest serve endpoint exposing the file-conversion function.
 * The function executes a conversion job with a bounded number of attempts
 * and always reaches a terminal `completed`/`failed` state
 * (see lib/server/jobs.ts).
 */

import { Inngest } from "inngest";
import { serve } from "inngest/next";
import {
  InMemoryConversionJobRepository,
  InMemoryOutputAssetRepository,
} from "@/lib/server/database";
import { executeConversionWithBoundedRetry } from "@/lib/server/jobs";

const inngest = new Inngest({ id: "file-saas" });

// Shared repositories for the lifetime of this serverless function instance.
// In production these would be swapped for Drizzle-backed repositories.
const jobRepo = new InMemoryConversionJobRepository();
const outputAssetRepo = new InMemoryOutputAssetRepository();

const runConversion = inngest.createFunction(
  { id: "run-conversion" },
  { event: "file/conversion.requested" },
  async ({ event, step }) => {
    const { jobId, maxAttempts } = event.data as {
      jobId: string;
      fileAssetId: string;
      maxAttempts: number;
    };

    const status = await step.run("execute-conversion", async () => {
      return executeConversionWithBoundedRetry({
        jobId,
        maxAttempts: maxAttempts ?? 3,
        jobRepo,
        outputAssetRepo,
        execute: async () => {
          // Placeholder conversion logic goes here (e.g. transcoding, PDF
          // rendering, image resizing). Returns the output asset descriptor.
          return {
            fileKey: `converted/${jobId}`,
            fileName: "output",
            fileSize: 0,
            mimeType: "application/octet-stream",
          };
        },
      });
    });

    return { jobId, status };
  }
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runConversion],
});
