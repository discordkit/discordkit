/**
 * Turns the capture set into the requests that post it: Discord's wire format (snake_case keys, through `@discordkit/core`'s own key utility), the files a fixture names with `attachment://` as a multipart upload, and the order of posts and edits. The client's validated functions are not used, because on this branch its schemas refuse payloads Discord accepts (a select in an action row, a File without `name` and `size`, an embed that leaves fields out), fixed in #106.
 *
 * Pure: the plan is data, so the dry run prints it and the poster sends it, and they cannot disagree.
 */
import { toSnakeKeys } from "@discordkit/core/utils/toSnakeKeys";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessagePayload, Scene } from "@discordkit/preview/scene";
import { attachableFile, type AttachableFile } from "./assets.ts";
import {
  botId,
  captureNow,
  captureNowSeconds,
  channelId,
  fixtureScene,
  labelText,
  type CaptureFixture
} from "./captureSet.ts";

/** Who sends a request: the bot, with its token, or the webhook, whose URL carries its own. */
export type Sender = `bot` | `webhook`;

/** One request in the plan. Paths name the ids they need as `{channel}`, `{webhook}` and `{message:N}`, filled in when sending. */
export interface PlannedRequest {
  fixture: CaptureFixture;
  /** `label` is the webhook's line before the fixture; `message` posts one of the fixture's messages; `edit` edits the message posted by the step named in `edits`. */
  kind: `label` | `message` | `edit`;
  /** Which of the fixture's messages, from 0; null for the label. */
  index: number | null;
  sender: Sender;
  method: `POST` | `PATCH`;
  /** The path under the API's base, with placeholders. */
  path: string;
  /** Query parameters, for the webhook. */
  query: Record<string, string>;
  /** The JSON body, in Discord's snake_case, before ids are filled in. */
  body: Record<string, unknown>;
  files: AttachableFile[];
  /** For an edit: the position in the plan of the request that posted the message. */
  edits?: number;
}

/** What the plan needs to know about how it will be sent. */
export interface PlanOptions {
  /** Whether a bot token is available. Without one, fixtures that need an app are left out. */
  bot: boolean;
  /** Whether a webhook URL is available. Without one, labels are left out. */
  webhook: boolean;
}

export interface Plan {
  requests: PlannedRequest[];
  /** Fixtures left out, and why. */
  skipped: Array<{ fixture: CaptureFixture; reason: string }>;
  /** Said once about the whole plan: labels left out, and the like. */
  notes: string[];
}

/** No message the kit posts pings anyone: `@everyone`, `@here`, users and roles are drawn as mentions but notify nobody. */
const allowedMentions = { parse: [] as string[] };

/** The username the webhook posts the labels under, matching the render's author. */
export const labellerName = `Calibration`;
/** The username fixtures are posted under when only a webhook is available. */
export const webhookFixtureName = `Calibration Bot`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === `object` && value !== null && !Array.isArray(value);

/** Every file a payload names with `attachment://`, once each, in the order they appear. */
export const attachmentNames = (payload: unknown): string[] => {
  const names: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === `string`) {
      if (value.startsWith(`attachment://`)) {
        const name = value.slice(`attachment://`.length);
        if (!names.includes(name)) names.push(name);
      }
    } else if (Array.isArray(value)) {
      for (const item of value) walk(item);
    } else if (isRecord(value)) {
      for (const item of Object.values(value)) walk(item);
    }
  };
  walk(payload);
  return names;
};

/**
 * Whether posting a payload needs an app: a button that is not a link, or a select. A webhook nobody's app owns can send only components nobody interacts with.
 */
export const needsApp = (payload: unknown): boolean => {
  if (Array.isArray(payload)) return payload.some(needsApp);
  if (!isRecord(payload)) return false;
  if (payload.type === ComponentType.Button) {
    return payload.style !== ButtonStyle.Link;
  }
  if (
    payload.type === ComponentType.StringSelect ||
    payload.type === ComponentType.UserSelect ||
    payload.type === ComponentType.RoleSelect ||
    payload.type === ComponentType.MentionableSelect ||
    payload.type === ComponentType.ChannelSelect
  ) {
    return true;
  }
  return Object.values(payload).some(needsApp);
};

/** A payload as Discord's API takes it: snake_case keys, nobody pinged, and one entry in `attachments` per file uploaded with it. */
export const wireBody = (
  payload: MessagePayload,
  files: readonly AttachableFile[]
): Record<string, unknown> => ({
  ...(toSnakeKeys(payload) as Record<string, unknown>),
  allowed_mentions: allowedMentions,
  ...(files.length > 0
    ? {
        attachments: files.map((file, index) => ({
          id: index,
          filename: file.name
        }))
      }
    : {})
});

const messagePath = (sender: Sender): string =>
  sender === `bot` ? `/channels/{channel}/messages` : `/webhooks/{webhook}`;

const editPath = (sender: Sender, step: number): string =>
  sender === `bot`
    ? `/channels/{channel}/messages/{message:${String(step)}}`
    : `/webhooks/{webhook}/messages/{message:${String(step)}}`;

const webhookQuery = (payload: unknown): Record<string, string> => ({
  wait: `true`,
  ...(isRecord(payload) && Array.isArray(payload.components)
    ? { with_components: `true` }
    : {})
});

/**
 * Plans the requests that post `fixtures`, in order: for each, the label from the webhook (when there is one), then each message from the bot (or, with no bot, from the webhook), and an edit straight after any message that has a `before`.
 */
export const planRequests = (
  fixtures: readonly CaptureFixture[],
  options: PlanOptions
): Plan => {
  const requests: PlannedRequest[] = [];
  const skipped: Plan[`skipped`] = [];
  const notes: string[] = [];
  if (!options.webhook) {
    notes.push(
      `No webhook, so no labels: consecutive fixtures will share one header, and a screenshot is matched to its fixture only by its content. Set DISCORD_CALIBRATION_WEBHOOK_URL to post a label before each fixture.`
    );
  }
  if (!options.bot) {
    notes.push(
      `No bot token, so the webhook posts the fixtures too, and fixtures with buttons or selects that need an app are left out. Set DISCORD_CALIBRATION_BOT_TOKEN to post them.`
    );
  }
  const sender: Sender = options.bot ? `bot` : `webhook`;

  for (const fixture of fixtures) {
    if (
      !options.bot &&
      fixture.messages.some((message) => needsApp(message.payload))
    ) {
      skipped.push({
        fixture,
        reason: `it holds buttons or selects that only an app can post`
      });
      continue;
    }
    const scene: Scene = fixtureScene(fixture);
    if (options.webhook) {
      requests.push({
        fixture,
        kind: `label`,
        index: null,
        sender: `webhook`,
        method: `POST`,
        path: `/webhooks/{webhook}`,
        query: { wait: `true` },
        body: {
          content: labelText(fixture),
          username: labellerName,
          allowed_mentions: allowedMentions
        },
        files: []
      });
    }
    fixture.messages.forEach((message, index) => {
      const first = message.before ?? message.payload;
      const files = attachmentNames(first).map((name) =>
        attachableFile(name, scene)
      );
      const identity =
        sender === `webhook` ? { username: webhookFixtureName } : {};
      requests.push({
        fixture,
        kind: `message`,
        index,
        sender,
        method: `POST`,
        path: messagePath(sender),
        query: sender === `webhook` ? webhookQuery(first) : {},
        body: { ...wireBody(first, files), ...identity },
        files
      });
      if (message.before) {
        const posted = requests.length - 1;
        const editFiles = attachmentNames(message.payload);
        if (editFiles.length > 0) {
          throw new Error(
            `${fixture.code} message ${String(index + 1)} is edited after posting and names files (${editFiles.join(`, `)}), which the kit cannot keep through an edit. Leave files out of an edited message in scripts/calibration/captureSet.ts.`
          );
        }
        requests.push({
          fixture,
          kind: `edit`,
          index,
          sender,
          method: `PATCH`,
          path: editPath(sender, posted),
          query:
            sender === `webhook` &&
            isRecord(message.payload) &&
            Array.isArray(message.payload.components)
              ? { with_components: `true` }
              : {},
          body: wireBody(message.payload, []),
          files: [],
          edits: posted
        });
      }
    });
  }
  return { requests, skipped, notes };
};

/** The real ids the plan's stand-ins become when sending. */
export interface Ids {
  bot: string | null;
  channel: string;
  /** When posting, the time to put in an embed timestamp set to the scene clock. */
  now: string;
}

/**
 * The body as it is sent: the stand-in ids replaced by the bot's and the channel's, an embed timestamp equal to the scene clock replaced by the time of posting, and a markdown timestamp within a day of the scene clock moved by the same amount. Without a bot (webhook only), a mention of the bot is left as it is and shows as an unknown user.
 */
export const fillIds = (
  body: Record<string, unknown>,
  ids: Ids
): Record<string, unknown> => {
  let json = JSON.stringify(body);
  if (ids.bot !== null) json = json.replaceAll(botId, ids.bot);
  json = json.replaceAll(channelId, ids.channel);
  json = json.replaceAll(
    `"timestamp":"${captureNow}"`,
    `"timestamp":"${ids.now}"`
  );
  // Markdown timestamps near the scene clock keep their distance from the moment of posting.
  const shift = Math.round(Date.parse(ids.now) / 1000) - captureNowSeconds;
  json = json.replace(/<t:(\d+)/g, (whole, seconds: string) =>
    Math.abs(Number(seconds) - captureNowSeconds) <= 86_400
      ? `<t:${String(Number(seconds) + shift)}`
      : whole
  );
  return JSON.parse(json) as Record<string, unknown>;
};
