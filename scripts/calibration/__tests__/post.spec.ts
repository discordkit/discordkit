import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
} from "vite-plus/test";
import { drawnBytes } from "../assets.ts";
import {
  botId,
  captureNowSeconds,
  captureSet,
  channelId,
  type CaptureFixture
} from "../captureSet.ts";
import {
  createDiscordClient,
  DiscordResponseError,
  parseWebhookUrl,
  type Credentials
} from "../discord.ts";
import { readManifest, type Manifest } from "../local.ts";
import { deletePosted, formatPlan, postCaptureSet } from "../post.ts";
import { fillIds, planRequests } from "../wire.ts";
import { fakeIds, startFakeDiscord, type FakeDiscord } from "./fakeDiscord.ts";

/**
 * The poster has never been run against Discord, so these specs are the only evidence it sends what Discord documents: they run it against a local HTTP server standing in for the API and check every request as it arrived.
 */

const byTitle = (title: string): CaptureFixture => {
  const found = captureSet.find((fixture) => fixture.title === title);
  if (!found) throw new Error(`No fixture titled "${title}"`);
  return found;
};

const oneSquare = byTitle(`1 large square (1024 × 1024)`);
const mentions = byTitle(`Text: mentions and emoji`);
const edited = byTitle(`Edited messages, and messages continuing a group`);
const buttons = byTitle(
  `Buttons: every style, disabled, with emoji, five in a row`
);

const credentials: Credentials = {
  botToken: fakeIds.botToken,
  webhook: { id: fakeIds.webhook, token: fakeIds.webhookToken }
};

describe(`posting to a stand-in for Discord`, { timeout: 60_000 }, () => {
  let discord: FakeDiscord;
  let folder: string;
  let manifestPath: string;
  const sleep = vi.fn<(ms: number) => Promise<void>>(async () => undefined);

  const post = async (
    fixtures: readonly CaptureFixture[],
    using: Credentials = credentials
  ): Promise<Manifest> =>
    postCaptureSet({
      fixtures,
      credentials: using,
      channelId: fakeIds.channel,
      client: createDiscordClient({
        credentials: using,
        base: discord.base,
        sleep
      }),
      manifestPath,
      now: () => new Date(`2026-11-27T12:00:00.000Z`)
    });

  beforeEach(async () => {
    discord = await startFakeDiscord();
    folder = mkdtempSync(join(tmpdir(), `calibration-post-`));
    manifestPath = join(folder, `manifest.json`);
    sleep.mockClear();
  });

  afterEach(async () => {
    await discord.close();
    rmSync(folder, { recursive: true, force: true });
  });

  it(`checks the bot, the channel and the webhook before posting anything`, async () => {
    await post([oneSquare]);
    expect(
      discord.requests
        .slice(0, 3)
        .map(({ method, path }) => `${method} ${path}`)
    ).toEqual([
      `GET /users/@me`,
      `GET /channels/${fakeIds.channel}`,
      `GET /webhooks/${fakeIds.webhook}/${fakeIds.webhookToken}`
    ]);
  });

  it(`refuses a webhook that posts to another channel, before posting, since the labels would land elsewhere`, async () => {
    discord.queue(`GET`, /^\/webhooks\//, {
      status: 200,
      body: { id: fakeIds.webhook, channel_id: `700000000000000999` }
    });
    await expect(post([oneSquare])).rejects.toThrow(
      /posts to channel 700000000000000999/
    );
    expect(
      discord.requests.filter((request) => request.method === `POST`)
    ).toEqual([]);
  });

  it(`posts the label from the webhook, as another author, then the fixture from the bot as a multipart upload`, async () => {
    await post([oneSquare]);
    const [label, message] = discord.requests.filter(
      (request) => request.method === `POST`
    );

    expect(label.path).toBe(
      `/webhooks/${fakeIds.webhook}/${fakeIds.webhookToken}`
    );
    expect(label.query.get(`wait`)).toBe(`true`);
    expect(label.headers.authorization).toBeUndefined();
    expect(label.json).toEqual({
      content: `${oneSquare.code} · ${oneSquare.title}`,
      username: `Calibration`,
      allowed_mentions: { parse: [] }
    });

    expect(message.path).toBe(`/channels/${fakeIds.channel}/messages`);
    expect(message.headers.authorization).toBe(`Bot ${fakeIds.botToken}`);
    expect(message.headers[`user-agent`]).toMatch(/^DiscordBot \(/);
    expect(message.json).toMatchObject({
      flags: 32768,
      allowed_mentions: { parse: [] },
      attachments: [{ id: 0, filename: `large-square-1.png` }]
    });
    expect(message.files).toHaveLength(1);
    expect(message.files[0]).toMatchObject({
      field: `files[0]`,
      name: `large-square-1.png`
    });
    expect(
      Buffer.from(message.files[0].bytes).equals(
        drawnBytes(`large-square-1.png`) ?? Buffer.alloc(0)
      )
    ).toBe(true);
  });

  it(`sends Discord's snake_case keys, never discordkit's camelCase`, async () => {
    await post([buttons]);
    const sent = JSON.stringify(
      discord.requests.map((request) => request.json)
    );
    expect(sent).toContain(`"custom_id"`);
    expect(sent).not.toMatch(/"customId"|"accentColor"|"allowedMentions"/);
  });

  it(`replaces the stand-in ids with the bot's and the channel's, so those mentions resolve in the client`, async () => {
    await post([mentions]);
    const sent = JSON.stringify(discord.requests.at(-1)?.json);
    expect(sent).toContain(`<@${fakeIds.bot}>`);
    expect(sent).toContain(`<#${fakeIds.channel}>`);
    expect(sent).not.toContain(botId);
    expect(sent).not.toContain(channelId);
  });

  it(`sends each body exactly as the dry run prints it, once the ids are filled in`, async () => {
    const fixtures = [oneSquare, mentions, edited];
    await post(fixtures);
    const plan = planRequests(fixtures, { bot: true, webhook: true });
    const sent = discord.requests
      .filter((request) => request.method !== `GET`)
      .map((request) => request.json);
    const filled = plan.requests.map((request) =>
      fillIds(request.body, {
        bot: fakeIds.bot,
        channel: fakeIds.channel,
        now: `2026-11-27T12:00:00.000Z`
      })
    );
    expect(sent).toEqual(filled);
    const printed = formatPlan(fixtures, { bot: true, webhook: true });
    for (const request of plan.requests)
      expect(printed).toContain(JSON.stringify(request.body));
  });

  it(`posts an edited message first as it was, then edits that message, so the client marks it "(edited)"`, async () => {
    const manifest = await post([edited]);
    const writes = discord.requests.filter(
      (request) => request.method !== `GET`
    );
    const firstPost = writes[1];
    const edit = writes[2];
    expect(JSON.stringify(firstPost.json)).toContain(`before its edit`);
    expect(edit.method).toBe(`PATCH`);
    const editedEntry = manifest.entries.find(
      (entry) => entry.fixture === edited.number && entry.index === 0
    );
    expect(edit.path).toBe(
      `/channels/${fakeIds.channel}/messages/${String(editedEntry?.messageId)}`
    );
    expect(JSON.stringify(edit.json)).toContain(`edited after it was posted`);
    expect(editedEntry?.editedAt).toBe(`2026-11-27T12:00:00.000Z`);
  });

  it(`writes a manifest of every message it posted, with ids and times and no secret`, async () => {
    const manifest = await post([oneSquare, edited]);
    const onDisk = readManifest(manifestPath);
    expect(onDisk).toEqual(manifest);
    expect(
      onDisk.entries.map(({ code, kind, index, sender }) => [
        code,
        kind,
        index,
        sender
      ])
    ).toEqual([
      [oneSquare.code, `label`, null, `webhook`],
      [oneSquare.code, `message`, 0, `bot`],
      [edited.code, `label`, null, `webhook`],
      [edited.code, `message`, 0, `bot`],
      [edited.code, `message`, 1, `bot`],
      [edited.code, `message`, 2, `bot`],
      [edited.code, `message`, 3, `bot`]
    ]);
    expect(new Set(onDisk.entries.map((entry) => entry.messageId)).size).toBe(
      onDisk.entries.length
    );
    expect(onDisk).toMatchObject({
      channelId: fakeIds.channel,
      guildId: fakeIds.guild,
      bot: { id: fakeIds.bot },
      webhookId: fakeIds.webhook
    });
    const text = readFileSync(manifestPath, `utf8`);
    expect(text).not.toContain(fakeIds.botToken);
    expect(text).not.toContain(fakeIds.webhookToken);
  });

  it(`waits as long as a 429 says, then sends the same request again`, async () => {
    discord.queue(`POST`, /^\/channels\/\d+\/messages$/, {
      status: 429,
      body: {
        message: `You are being rate limited.`,
        retry_after: 1.5,
        global: false
      },
      headers: { "retry-after": `2` }
    });
    await post([oneSquare]);
    const posts = discord.requests.filter(
      (request) => request.path === `/channels/${fakeIds.channel}/messages`
    );
    expect(posts).toHaveLength(2);
    expect(posts[1].json).toEqual(posts[0].json);
    expect(sleep.mock.calls.some(([ms]) => ms >= 1400 && ms <= 1500)).toBe(
      true
    );
  });

  it(`waits for the reset before the next request to a route with none left`, async () => {
    discord.queue(`POST`, /^\/channels\/\d+\/messages$/, {
      status: 200,
      body: { id: `500000000000000999` },
      headers: { "x-ratelimit-remaining": `0`, "x-ratelimit-reset-after": `3` }
    });
    await post([edited]);
    expect(sleep.mock.calls.some(([ms]) => ms > 2000 && ms <= 3000)).toBe(true);
  });

  it(`gives up after repeated 429s, waiting before each retry, rather than loop`, async () => {
    for (let count = 0; count < 10; count += 1) {
      discord.queue(`POST`, /^\/channels\/\d+\/messages$/, {
        status: 429,
        body: {
          message: `You are being rate limited.`,
          retry_after: 0,
          global: false
        }
      });
    }
    await expect(post([oneSquare])).rejects.toThrow(/429 Too Many Requests/);
    const posts = discord.requests.filter(
      (request) => request.path === `/channels/${fakeIds.channel}/messages`
    );
    expect(posts).toHaveLength(6);
    // Each retry waited Discord's answer or the floor of 250ms, less the moment it took to get there.
    expect(sleep.mock.calls.filter(([ms]) => ms > 200)).toHaveLength(5);
  });

  it(`stops on the first error, saying what Discord answered and the request, without the token, having sent nothing after it`, async () => {
    discord.queue(`POST`, /^\/channels\/\d+\/messages$/, {
      status: 400,
      body: {
        code: 50035,
        message: `Invalid Form Body`,
        errors: {
          components: { _errors: [{ code: `BASE_TYPE_BAD`, message: `Bad` }] }
        }
      }
    });
    const failure = await post([oneSquare, mentions]).catch(
      (error: unknown) => error
    );
    expect(failure).toBeInstanceOf(DiscordResponseError);
    const message = (failure as Error).message;
    expect(message).toContain(`400`);
    expect(message).toContain(`Invalid Form Body`);
    expect(message).toContain(
      `POST ${discord.base}/channels/${fakeIds.channel}/messages`
    );
    expect(message).toContain(oneSquare.code);
    expect(message).toContain(`large-square-1.png`);
    expect(message).not.toContain(fakeIds.botToken);
    // Only the label went before it, and nothing after.
    expect(
      discord.requests.filter((request) => request.method === `POST`)
    ).toHaveLength(2);
    expect(
      readManifest(manifestPath).entries.map((entry) => entry.kind)
    ).toEqual([`label`]);
  });

  it(`never shows the webhook's token in an error`, async () => {
    discord.queue(`POST`, /^\/webhooks\//, {
      status: 403,
      body: { code: 50013, message: `Missing Permissions` }
    });
    const failure = await post([oneSquare]).catch((error: unknown) => error);
    const message = (failure as Error).message;
    expect(message).toContain(`Missing Permissions`);
    expect(message).toContain(`<webhook token>`);
    expect(message).not.toContain(fakeIds.webhookToken);
  });

  it(`with only a webhook, leaves out fixtures that need an app and posts the rest from the webhook`, async () => {
    const webhookOnly: Credentials = {
      botToken: null,
      webhook: credentials.webhook
    };
    const manifest = await post([oneSquare, buttons], webhookOnly);
    expect(
      discord.requests.some(
        (request) => request.headers.authorization !== undefined
      )
    ).toBe(false);
    expect(manifest.entries.map((entry) => entry.code)).not.toContain(
      buttons.code
    );
    const fixture = discord.requests.filter(
      (request) => request.method === `POST`
    )[1];
    expect(fixture.query.get(`with_components`)).toBe(`true`);
  });

  it(`deletes exactly what the manifest lists that is not yet deleted, and counts a message already gone as deleted`, async () => {
    const manifest = await post([oneSquare, edited]);
    manifest.entries[0].deletedAt = `2026-11-27T12:30:00.000Z`;
    const gone = manifest.entries[2].messageId;
    discord.queue(`DELETE`, new RegExp(`/messages/${gone}$`), {
      status: 404,
      body: { code: 10008, message: `Unknown Message` }
    });
    discord.requests.length = 0;

    const count = await deletePosted({
      manifest,
      manifestPath,
      credentials,
      client: createDiscordClient({ credentials, base: discord.base, sleep }),
      now: () => new Date(`2026-11-27T13:00:00.000Z`)
    });

    expect(count).toBe(manifest.entries.length - 1);
    const expected = manifest.entries
      .slice(1)
      .map((entry) =>
        entry.sender === `webhook`
          ? `DELETE /webhooks/${fakeIds.webhook}/${fakeIds.webhookToken}/messages/${entry.messageId}`
          : `DELETE /channels/${fakeIds.channel}/messages/${entry.messageId}`
      );
    expect(
      discord.requests.map(({ method, path }) => `${method} ${path}`)
    ).toEqual(expected);
    expect(
      readManifest(manifestPath).entries.every(
        (entry) => entry.deletedAt !== undefined
      )
    ).toBe(true);
  });

  it(`stops deleting on an answer it does not expect`, async () => {
    const manifest = await post([oneSquare]);
    discord.queue(`DELETE`, /.*/, {
      status: 403,
      body: { code: 50013, message: `Missing Permissions` }
    });
    discord.requests.length = 0;
    await expect(
      deletePosted({
        manifest,
        manifestPath,
        credentials,
        client: createDiscordClient({ credentials, base: discord.base, sleep })
      })
    ).rejects.toThrow(/Missing Permissions/);
    expect(discord.requests).toHaveLength(1);
    expect(
      readManifest(manifestPath).entries.every(
        (entry) => entry.deletedAt === undefined
      )
    ).toBe(true);
  });
});

describe(`filling in a body for sending`, () => {
  it(`moves a timestamp near the scene clock by the time posting happens, so "in 45 seconds" still says so, and leaves a fixed date alone`, () => {
    const body = {
      content: `<t:${String(captureNowSeconds + 45)}:R> <t:1618953630:F>`
    };
    const later = new Date((captureNowSeconds + 600) * 1000).toISOString();
    expect(
      fillIds(body, { bot: fakeIds.bot, channel: fakeIds.channel, now: later })
    ).toEqual({
      content: `<t:${String(captureNowSeconds + 645)}:R> <t:1618953630:F>`
    });
  });
});

describe(`reading the webhook URL`, () => {
  it(`takes the URL Discord's "Copy Webhook URL" gives, and refuses anything else without repeating it`, () => {
    expect(
      parseWebhookUrl(`https://discord.com/api/webhooks/123/abc-DEF_9`)
    ).toEqual({ id: `123`, token: `abc-DEF_9` });
    expect(
      parseWebhookUrl(`https://canary.discordapp.com/api/v10/webhooks/123/abc`)
    ).toEqual({ id: `123`, token: `abc` });
    expect(() =>
      parseWebhookUrl(`https://example.com/api/webhooks/123/secret-value`)
    ).toThrow(/not a Discord webhook URL/);
    expect(() =>
      parseWebhookUrl(`https://example.com/api/webhooks/123/secret-value`)
    ).not.toThrow(/secret-value/);
  });
});

describe(`the dry run`, () => {
  it(`prints every fixture and every request with no secrets set, and says what it leaves out without them`, () => {
    const all = formatPlan(captureSet, { bot: true, webhook: true });
    for (const fixture of captureSet)
      expect(all).toContain(`${fixture.code} · ${fixture.title}`);
    expect(all).toContain(
      `${String(planRequests(captureSet, { bot: true, webhook: true }).requests.length)} requests`
    );

    const noWebhook = formatPlan([oneSquare], { bot: true, webhook: false });
    expect(noWebhook).toMatch(/no labels/);
    expect(noWebhook).not.toContain(`/webhooks/`);
  });
});
