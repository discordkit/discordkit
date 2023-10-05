import { executeWebhookSafe } from "@discordkit/client/webhook/executeWebhook";

void (async (): Promise<void> => {
  const getInput = (name: string): string =>
    (
      process.env[`INPUT_${name.replace(/ /g, `_`).toUpperCase()}`] ?? ``
    ).trim();

  try {
    // eslint-disable-next-line no-console
    console.info(`Running discord webhook action...`);
    await executeWebhookSafe({
      webhook: getInput(`webhook`),
      token: getInput(`token`),
      body: {
        content: getInput(`content`)
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
    process.exit(1);
  }
})();
