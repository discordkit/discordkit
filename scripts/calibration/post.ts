/**
 * Posting the capture set, printing what posting would send, and deleting what a manifest lists.
 */
import {
  captureNowSeconds,
  platformNames,
  tierNames,
  type CaptureFixture
} from "./captureSet.ts";
import {
  DiscordResponseError,
  type Credentials,
  type DiscordClient,
  type OutgoingRequest
} from "./discord.ts";
import { writeManifest, type Manifest, type ManifestEntry } from "./local.ts";
import {
  fillIds,
  planRequests,
  type Plan,
  type PlannedRequest
} from "./wire.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === `object` && value !== null && !Array.isArray(value);

const purpose = (request: PlannedRequest): string => {
  const what =
    request.kind === `label`
      ? `its label`
      : request.kind === `edit`
        ? `the edit of message ${String((request.index ?? 0) + 1)}`
        : `message ${String((request.index ?? 0) + 1)}`;
  return `${request.fixture.code} (${request.fixture.title}), ${what}`;
};

/** The requests sent before any fixture, to learn the bot's id and check the channel and webhook. */
export const preflightRequests = (available: {
  bot: boolean;
  webhook: boolean;
}): string[] => [
  ...(available.bot
    ? [
        `GET /users/@me (bot): the bot's user id and name`,
        `GET /channels/{channel} (bot): that the bot can see the channel`
      ]
    : []),
  ...(available.webhook
    ? [`GET /webhooks/{webhook}: that the webhook posts to the same channel`]
    : [])
];

/**
 * The dry run: every request posting `fixtures` would send, in order, with its body exactly as sent but for the stand-in ids, which the header says are replaced. Sends nothing and reads no secret, only whether each is set.
 */
export const formatPlan = (
  fixtures: readonly CaptureFixture[],
  available: { bot: boolean; webhook: boolean }
): string => {
  const plan = planRequests(fixtures, available);
  const lines: string[] = [
    `Dry run: nothing is sent. Run with --send to post.`,
    ``,
    `Posting as: ${available.bot ? `the bot (DISCORD_CALIBRATION_BOT_TOKEN)` : `the webhook only`}${available.webhook ? `, labels from the webhook (DISCORD_CALIBRATION_WEBHOOK_URL)` : `, no labels`}.`,
    `In every body, 1399000000000000001 is replaced by the bot's user id, 1399000000000000003 by the channel's id, an embed timestamp of the scene clock by the time of posting, and a <t:…> within a day of the scene clock (${String(captureNowSeconds)}) is moved by as much. {channel}, {webhook} and {message:N} in a path are the channel, the webhook's id and token, and the id of the message request N posted.`,
    ...plan.notes.map((note) => `Note: ${note}`),
    ``,
    `First:`,
    ...preflightRequests(available).map((line) => `  ${line}`)
  ];
  let current: CaptureFixture | null = null;
  plan.requests.forEach((request, position) => {
    if (request.fixture !== current) {
      current = request.fixture;
      lines.push(
        ``,
        `${request.fixture.code} · ${request.fixture.title} (${tierNames[request.fixture.tier]}; screenshots on ${request.fixture.platforms.map((platform) => platformNames[platform]).join(` and `)})`,
        ...request.fixture.settles.map((line) => `  settles: ${line}`)
      );
      if (request.fixture.followUp)
        lines.push(`  then: ${request.fixture.followUp}`);
    }
    const query = new URLSearchParams(request.query).toString();
    lines.push(
      `  [${String(position)}] ${request.method} ${request.path}${query === `` ? `` : `?${query}`} (${request.sender}, ${request.kind}${request.index === null ? `` : ` ${String(request.index + 1)}`})`,
      `      ${JSON.stringify(request.body)}`
    );
    if (request.files.length > 0) {
      lines.push(
        `      files: ${request.files.map((file) => `${file.name} (${String(file.bytes.length)} bytes)`).join(`, `)}`
      );
    }
  });
  for (const { fixture, reason } of plan.skipped) {
    lines.push(
      ``,
      `${fixture.code} · ${fixture.title}: left out, because ${reason}.`
    );
  }
  lines.push(
    ``,
    `${String(plan.requests.length)} requests for ${String(fixtures.length - plan.skipped.length)} fixtures${plan.skipped.length > 0 ? ` (${String(plan.skipped.length)} left out)` : ``}.`
  );
  return lines.join(`\n`);
};

export interface PostOptions {
  fixtures: readonly CaptureFixture[];
  credentials: Credentials;
  channelId: string;
  client: DiscordClient;
  /** Where to write the manifest; written after every message, so a run that stops still lists what it posted. */
  manifestPath: string;
  log?: (line: string) => void;
  /** The clock, for the manifest and embed timestamps. */
  now?: () => Date;
}

const messageId = (response: unknown, request: PlannedRequest): string => {
  if (isRecord(response) && typeof response.id === `string`) return response.id;
  throw new Error(
    `Discord accepted ${purpose(request)} but its answer carries no message id, so the kit cannot record it in the manifest or edit it. Its answer: ${JSON.stringify(response)}. For a webhook the kit asks for the message with ?wait=true; if that is in the request, Discord's API has changed and scripts/calibration/post.ts needs updating.`
  );
};

/**
 * Posts `fixtures` to the channel, in order, and returns the manifest. Checks first that the bot can see the channel and that the webhook posts to it, and stops on the first answer Discord gives that it does not expect (the error says which), leaving the manifest of everything posted before it.
 */
export const postCaptureSet = async (
  options: PostOptions
): Promise<Manifest> => {
  const { client, credentials, channelId } = options;
  const log = options.log ?? ((): void => undefined);
  const now = options.now ?? ((): Date => new Date());

  let bot: Manifest[`bot`] = null;
  let guildId: string | null = null;
  if (credentials.botToken) {
    const me = await client.send({
      method: `GET`,
      path: `/users/@me`,
      auth: true,
      purpose: `reading the bot's own user`
    });
    if (!isRecord(me) || typeof me.id !== `string`) {
      throw new Error(
        `Discord answered GET /users/@me without a user id, so the kit cannot tell the bot's id. Its answer: ${JSON.stringify(me)}.`
      );
    }
    bot = {
      id: me.id,
      username: typeof me.username === `string` ? me.username : ``
    };
    const channel = await client.send({
      method: `GET`,
      path: `/channels/${channelId}`,
      auth: true,
      purpose: `checking the bot can see the channel`
    });
    guildId =
      isRecord(channel) && typeof channel.guild_id === `string`
        ? channel.guild_id
        : null;
  }
  if (credentials.webhook) {
    const webhook = await client.send({
      method: `GET`,
      path: `/webhooks/{webhook}`,
      auth: false,
      purpose: `checking the webhook`
    });
    const webhookChannel = isRecord(webhook) ? webhook.channel_id : undefined;
    if (webhookChannel !== channelId) {
      throw new Error(
        `The webhook in DISCORD_CALIBRATION_WEBHOOK_URL posts to channel ${String(webhookChannel)}, not to DISCORD_CALIBRATION_CHANNEL_ID (${channelId}), so the labels would land in a different channel from the fixtures. Nothing was posted. Make the webhook in the test channel's own settings (Integrations, then Webhooks), or set DISCORD_CALIBRATION_CHANNEL_ID to the channel the webhook posts to.`
      );
    }
  }

  const plan: Plan = planRequests(options.fixtures, {
    bot: credentials.botToken !== null,
    webhook: credentials.webhook !== null
  });
  for (const note of plan.notes) log(`Note: ${note}`);
  for (const { fixture, reason } of plan.skipped)
    log(`${fixture.code}: left out, because ${reason}.`);

  const started = now();
  const manifest: Manifest = {
    version: 1,
    startedAt: started.toISOString(),
    channelId,
    guildId,
    bot,
    webhookId: credentials.webhook?.id ?? null,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    fixtures: options.fixtures.map((fixture) => fixture.number),
    entries: []
  };
  writeManifest(options.manifestPath, manifest);

  /** The message id each request posted, by its position in the plan. */
  const posted = new Map<number, ManifestEntry>();
  for (const [position, request] of plan.requests.entries()) {
    const time = now().toISOString();
    const body = fillIds(request.body, {
      bot: bot?.id ?? null,
      channel: channelId,
      now: time
    });
    const path = request.path
      .replace(`{channel}`, channelId)
      .replace(/\{message:(\d+)\}/, (_, step: string) => {
        const entry = posted.get(Number(step));
        if (!entry) {
          throw new Error(
            `The kit's plan edits a message (step ${step}) it has not posted. This is a bug in scripts/calibration/wire.ts.`
          );
        }
        return entry.messageId;
      });
    const outgoing: OutgoingRequest = {
      method: request.method,
      path,
      query: request.query,
      auth: request.sender === `bot`,
      body,
      files: request.files.map((file) => ({
        name: file.name,
        bytes: file.bytes
      })),
      purpose: purpose(request)
    };
    const response = await client.send(outgoing);
    if (request.kind === `edit`) {
      const entry = posted.get(request.edits ?? -1);
      if (entry) entry.editedAt = time;
      log(
        `${request.fixture.code}: edited message ${String((request.index ?? 0) + 1)}`
      );
    } else {
      const entry: ManifestEntry = {
        fixture: request.fixture.number,
        code: request.fixture.code,
        kind: request.kind,
        index: request.index,
        channelId,
        messageId: messageId(response, request),
        sender: request.sender,
        postedAt: time
      };
      posted.set(position, entry);
      manifest.entries.push(entry);
      log(
        `${request.fixture.code}: posted ${request.kind === `label` ? `the label` : `message ${String((request.index ?? 0) + 1)}`} (${entry.messageId})`
      );
    }
    writeManifest(options.manifestPath, manifest);
  }
  return manifest;
};

export interface DeleteOptions {
  manifest: Manifest;
  manifestPath: string;
  credentials: Credentials;
  client: DiscordClient;
  log?: (line: string) => void;
  now?: () => Date;
}

/** Whether Discord's answer means the message is already gone: 404 with its "Unknown Message" code. */
const alreadyGone = (error: unknown): boolean =>
  error instanceof DiscordResponseError &&
  error.status === 404 &&
  isRecord(error.discordBody) &&
  error.discordBody.code === 10008;

/**
 * Deletes every message the manifest lists that it has not already deleted, and nothing else, marking each in the manifest as it goes. A message already gone counts as deleted. A webhook's message is deleted through the webhook when its URL is set and is the one that posted it, and otherwise by the bot, which then needs the Manage Messages permission.
 */
export const deletePosted = async (options: DeleteOptions): Promise<number> => {
  const { manifest, credentials, client } = options;
  const log = options.log ?? ((): void => undefined);
  const now = options.now ?? ((): Date => new Date());
  const sameWebhook =
    credentials.webhook !== null &&
    credentials.webhook.id === manifest.webhookId;
  let deleted = 0;
  for (const entry of manifest.entries) {
    if (entry.deletedAt) continue;
    const viaWebhook = entry.sender === `webhook` && sameWebhook;
    if (!viaWebhook && !credentials.botToken) {
      throw new Error(
        `${entry.code}'s ${entry.kind} (${entry.messageId}) was posted by the ${entry.sender}, and the kit has no way to delete it: ${entry.sender === `webhook` ? `DISCORD_CALIBRATION_WEBHOOK_URL is not set to the webhook that posted it, and` : ``} DISCORD_CALIBRATION_BOT_TOKEN is not set. Set the variable for whoever posted it and run the command again; what was deleted so far is marked in the manifest.`
      );
    }
    try {
      await client.send({
        method: `DELETE`,
        path: viaWebhook
          ? `/webhooks/{webhook}/messages/${entry.messageId}`
          : `/channels/${entry.channelId}/messages/${entry.messageId}`,
        auth: !viaWebhook,
        purpose: `deleting ${entry.code}'s ${entry.kind === `label` ? `label` : `message ${String((entry.index ?? 0) + 1)}`}`
      });
      log(`${entry.code}: deleted ${entry.messageId}`);
    } catch (error) {
      if (!alreadyGone(error)) throw error;
      log(`${entry.code}: ${entry.messageId} was already gone`);
    }
    entry.deletedAt = now().toISOString();
    deleted += 1;
    writeManifest(options.manifestPath, manifest);
  }
  return deleted;
};
