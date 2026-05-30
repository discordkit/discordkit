import { nonEmpty, object, pipe, safeParse, string, summarize } from "valibot";
import { toValidated } from "@discordkit/core";
import { executeWebhook, executeWebhookSchema } from "@discordkit/client";

const executeWebhookSafe = toValidated(executeWebhook, executeWebhookSchema);

const isRequired = `must be a string`;
const isEmpty = `must not be empty`;

const env = safeParse(
  object(
    {
      INPUT_WEBHOOK: pipe(string(isRequired), nonEmpty(isEmpty)),
      INPUT_TOKEN: pipe(string(isRequired), nonEmpty(isEmpty)),
      INPUT_CONTENT: pipe(string(isRequired), nonEmpty(isEmpty))
    },
    (issue) => `Required environment variable ${issue.expected} is missing!`
  ),
  process.env
);

if (env.issues) {
  throw new Error(summarize(env.issues));
}

const { INPUT_WEBHOOK, INPUT_TOKEN, INPUT_CONTENT } = env.output;

try {
  console.info(`Running discord webhook action...`);
  await executeWebhookSafe(
    {
      webhook: INPUT_WEBHOOK,
      token: INPUT_TOKEN,
      body: {
        content: INPUT_CONTENT
      }
    },
    // Webhook endpoints authenticate via the URL token, not the global
    // session — without this flag the action throws at runtime with
    // "Auth Token must be set before requests can be made."
    { anonymous: true }
  );
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}
