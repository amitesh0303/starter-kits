/**
 * Inngest serve endpoint exposing the workflow-run function.
 * The function executes a run with a bounded number of attempts and always
 * reaches a terminal `completed`/`failed` state (see lib/server/jobs.ts).
 */

import { Inngest } from "inngest";
import { serve } from "inngest/next";
import {
  InMemoryRunRepository,
  InMemoryStepAttemptRepository,
} from "@/lib/server/database";
import { executeStepWithBoundedRetry } from "@/lib/server/jobs";

const inngest = new Inngest({ id: "automation-saas" });

// Shared repositories for the lifetime of this serverless function instance.
// In production these would be swapped for Drizzle-backed repositories.
const runRepo = new InMemoryRunRepository();
const stepAttemptRepo = new InMemoryStepAttemptRepository();

const runWorkflow = inngest.createFunction(
  { id: "run-workflow" },
  { event: "workflow/run.triggered" },
  async ({ event, step }) => {
    const { runId, maxAttempts } = event.data as {
      runId: string;
      workflowId: string;
      maxAttempts: number;
    };

    const status = await step.run("execute-workflow", async () => {
      return executeStepWithBoundedRetry({
        runId,
        stepName: "run-workflow",
        maxAttempts: maxAttempts ?? 3,
        runRepo,
        stepAttemptRepo,
        execute: async () => {
          // Placeholder workflow execution logic goes here.
        },
      });
    });

    return { runId, status };
  }
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runWorkflow],
});
